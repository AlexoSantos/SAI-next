import { useEffect, useRef, useState } from "react";
import { useGetFireHotspots, useGetStations } from "@workspace/api-client-react";
import { Flame, RadioTower, Layers, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react";

const SAO_JOAO = { lat: -21.9701, lon: -46.795 };

const STATION_STATUS_COLOR: Record<string, string> = {
  online: "#10b981",
  offline: "#ef4444",
  maintenance: "#f59e0b",
  planned: "#3b82f6",
};

interface KMLLayerState {
  name: string;
  label: string;
  color: string;
  shape: "line" | "dot" | "area";
  count: number;
  visible: boolean;
}

interface LeafletLayerGroup {
  addTo: (map: unknown) => LeafletLayerGroup;
  remove: () => LeafletLayerGroup;
  clearLayers: () => LeafletLayerGroup;
}

const KML_LAYER_CONFIG: {
  key: string;
  label: string;
  color: string;
  shape: "line" | "dot" | "area";
  weight?: number;
  dash?: string;
  radius?: number;
  opacity?: number;
}[] = [
  { key: "Cursos D'agua", label: "Cursos D'Água", color: "#38bdf8", shape: "line", weight: 3, opacity: 0.9 },
  { key: "Pontes", label: "Pontes", color: "#fbbf24", shape: "dot", radius: 7 },
  { key: "Acompanhamentos", label: "Acompanhamentos", color: "#c084fc", shape: "dot", radius: 7 },
  {
    key: "AIDEC Área de Interesse da Defesa Civil",
    label: "AIDEC",
    color: "#ff5252",
    shape: "area",
    weight: 1.5,
    dash: "6 3",
  },
  { key: "Área Urbana", label: "Área Urbana", color: "#6b7280", shape: "area", weight: 1, dash: "4 4" },
  { key: "Incêndios", label: "Incêndios (hist.)", color: "#f97316", shape: "dot", radius: 5 },
  {
    key: "Imóveis atingidos por desastres",
    label: "Imóveis Atingidos",
    color: "#fb7185",
    shape: "dot",
    radius: 8,
  },
  { key: "Estudo  - Parque Inundável", label: "Parque Inundável", color: "#22d3ee", shape: "area", weight: 2 },
];

function parseCoords(coordStr: string): [number, number][] {
  return coordStr
    .trim()
    .split(/\s+/)
    .filter((s) => s.includes(","))
    .map((c) => {
      const parts = c.split(",");
      return [parseFloat(parts[1] ?? "0"), parseFloat(parts[0] ?? "0")] as [number, number];
    })
    .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
}

function stripHtml(html: string): string {
  return html
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const kmlGroupsRef = useRef<Record<string, LeafletLayerGroup>>({});
  const { data: hotspots } = useGetFireHotspots({ lat: SAO_JOAO.lat, lon: SAO_JOAO.lon, radius: 300 });
  const { data: stations } = useGetStations();
  const [kmlLayers, setKmlLayers] = useState<KMLLayerState[]>([]);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [kmlLoading, setKmlLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mounted || !mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [SAO_JOAO.lat, SAO_JOAO.lon],
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      L.tileLayer("https://tilecache.rainviewer.com/v2/radar/nowcast/256/{z}/{x}/{y}/6/1_1.png", {
        opacity: 0.4,
        attribution: "RainViewer",
      }).addTo(map);

      const centerIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#00d4ff;border-radius:50%;border:2px solid white;box-shadow:0 0 8px #00d4ff;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: "",
      });

      L.marker([SAO_JOAO.lat, SAO_JOAO.lon], { icon: centerIcon })
        .bindPopup(`<b style="color:#00d4ff">São João da Boa Vista</b><br/>Localização de referência`)
        .addTo(map);

      if (mounted) setKmlLoading(true);

      try {
        const res = await fetch("/api/risk-areas/kml");
        if (!res.ok || !mounted) return;

        const kmlText = await res.text();
        if (!mounted) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(kmlText, "text/xml");
        const folders = Array.from(doc.querySelectorAll("Document > Folder"));

        const builtLayers: KMLLayerState[] = [];

        for (const folder of folders) {
          const folderName = folder.querySelector(":scope > name")?.textContent?.trim() ?? "";
          const cfg = KML_LAYER_CONFIG.find((c) => c.key === folderName);
          if (!cfg) continue;

          const layerGroup = L.layerGroup().addTo(map);
          kmlGroupsRef.current[folderName] = layerGroup as unknown as LeafletLayerGroup;

          const placemarks = Array.from(folder.querySelectorAll("Placemark"));
          let count = 0;

          for (const pm of placemarks) {
            const pmName = pm.querySelector("name")?.textContent?.trim() ?? "";
            const rawDesc = pm.querySelector("description")?.textContent?.trim() ?? "";
            const cleanDesc = stripHtml(rawDesc);

            const popupHtml = `
              <div style="font-family:monospace;font-size:11px;max-width:240px;line-height:1.5;">
                <b style="color:${cfg.color};font-size:12px;">${pmName}</b>
                ${cleanDesc ? `<br/><span style="color:#9ca3af">${cleanDesc.substring(0, 250)}</span>` : ""}
                <br/><span style="color:#4b5563;font-size:10px;text-transform:uppercase;letter-spacing:0.05em">${cfg.label}</span>
              </div>`;

            const lineStringEl = pm.querySelector("LineString > coordinates");
            const pointEl = pm.querySelector("Point > coordinates");

            if (lineStringEl) {
              const coords = parseCoords(lineStringEl.textContent ?? "");
              if (coords.length > 1) {
                L.polyline(coords, {
                  color: cfg.color,
                  weight: cfg.weight ?? 2,
                  opacity: cfg.opacity ?? 0.8,
                  dashArray: cfg.dash,
                })
                  .bindPopup(popupHtml)
                  .addTo(layerGroup);
                count++;
              }
            } else if (pointEl) {
              const coords = parseCoords(pointEl.textContent ?? "");
              if (coords[0]) {
                L.circleMarker(coords[0], {
                  radius: cfg.radius ?? 6,
                  color: cfg.color,
                  fillColor: cfg.color,
                  fillOpacity: 0.75,
                  weight: 1.5,
                })
                  .bindPopup(popupHtml)
                  .addTo(layerGroup);
                count++;
              }
            }
          }

          if (count > 0) {
            builtLayers.push({
              name: folderName,
              label: cfg.label,
              color: cfg.color,
              shape: cfg.shape,
              count,
              visible: true,
            });
          }
        }

        if (mounted) {
          setKmlLayers(builtLayers);
          setKmlLoading(false);
        }
      } catch (e) {
        console.warn("Failed to load risk areas KML", e);
        if (mounted) setKmlLoading(false);
      }
    }

    initMap();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleKMLLayer = (layerName: string) => {
    const group = kmlGroupsRef.current[layerName];
    const leafletMap = mapInstanceRef.current;
    if (!group || !leafletMap) return;

    setKmlLayers((prev) =>
      prev.map((l) => {
        if (l.name !== layerName) return l;
        if (l.visible) {
          group.remove();
        } else {
          group.addTo(leafletMap);
        }
        return { ...l, visible: !l.visible };
      })
    );
  };

  useEffect(() => {
    if (!hotspots || !mapInstanceRef.current) return;

    async function addHotspots() {
      const L = await import("leaflet");
      const leafletMap = mapInstanceRef.current as unknown as {
        _hotspotGroup?: ReturnType<typeof L.layerGroup>;
      } & ReturnType<typeof L.map>;

      if (leafletMap._hotspotGroup) {
        leafletMap._hotspotGroup.clearLayers();
      } else {
        leafletMap._hotspotGroup = L.layerGroup().addTo(leafletMap);
      }

      hotspots?.forEach((h) => {
        const icon = L.divIcon({
          html: `<div style="width:10px;height:10px;background:#ff4500;border-radius:50%;border:1px solid #ff6b35;box-shadow:0 0 6px #ff4500;opacity:0.85;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
          className: "",
        });

        L.marker([h.lat, h.lon], { icon })
          .bindPopup(
            `<div style="font-family:monospace;font-size:12px;">
              <b style="color:#ff4500">Foco de Calor</b><br/>
              Brilho: ${Math.round(h.brightness)} K<br/>
              Confiança: ${h.confidence}<br/>
              Data: ${h.acqDate} ${h.acqTime}<br/>
              Instrumento: ${h.instrument}
            </div>`
          )
          .addTo(leafletMap._hotspotGroup!);
      });
    }

    addHotspots();
  }, [hotspots]);

  useEffect(() => {
    if (!stations || !mapInstanceRef.current) return;

    async function addStations() {
      const L = await import("leaflet");
      const leafletMap = mapInstanceRef.current as unknown as {
        _stationGroup?: ReturnType<typeof L.layerGroup>;
      } & ReturnType<typeof L.map>;

      if (leafletMap._stationGroup) {
        leafletMap._stationGroup.clearLayers();
      } else {
        leafletMap._stationGroup = L.layerGroup().addTo(leafletMap);
      }

      stations?.forEach((s) => {
        const color = STATION_STATUS_COLOR[s.status] ?? "#6b7280";
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:${color};border-radius:3px;border:2px solid white;box-shadow:0 0 6px ${color}88;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          className: "",
        });

        L.marker([s.lat, s.lon], { icon })
          .bindPopup(
            `<div style="font-family:monospace;font-size:12px;">
              <b style="color:${color}">${s.name}</b><br/>
              Status: ${s.status}<br/>
              Tipo: ${s.type}<br/>
              ${s.batteryLevel !== null ? `Bateria: ${s.batteryLevel}%<br/>` : ""}
              ${s.signalStrength !== null ? `Sinal: ${s.signalStrength} dBm` : ""}
            </div>`
          )
          .addTo(leafletMap._stationGroup!);
      });
    }

    addStations();
  }, [stations]);

  return (
    <div className="flex flex-col h-full -m-8">
      <div className="relative flex-1 min-h-0">
        <div ref={mapRef} className="w-full h-[calc(100vh-4rem)]" />

        {/* Collapsible legend / layer control */}
        <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur border border-primary/20 rounded-lg text-xs font-mono shadow-xl w-52">
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 text-primary font-semibold uppercase tracking-wider text-[10px] hover:bg-primary/5 rounded-t-lg transition-colors"
            onClick={() => setLegendExpanded((v) => !v)}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Legenda / Camadas
            </span>
            {legendExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {legendExpanded && (
            <div className="px-3 pb-3 space-y-3 border-t border-border/40">
              {/* IoT stations */}
              <div className="pt-2">
                <div className="text-muted-foreground uppercase text-[10px] mb-1.5 tracking-wider">
                  Estações IoT
                </div>
                {[
                  { label: "Online", color: "#10b981" },
                  { label: "Offline", color: "#ef4444" },
                  { label: "Manutenção", color: "#f59e0b" },
                  { label: "Planejada", color: "#3b82f6" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 py-0.5">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* NASA fire hotspots */}
              <div>
                <div className="text-muted-foreground uppercase text-[10px] mb-1.5 tracking-wider">
                  Eventos
                </div>
                <div className="flex items-center gap-2 py-0.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: "#ff4500" }}
                  />
                  <span className="text-muted-foreground">Foco de Calor (NASA)</span>
                </div>
              </div>

              {/* KML layers */}
              <div>
                <div className="text-muted-foreground uppercase text-[10px] mb-1.5 tracking-wider flex items-center gap-1">
                  Áreas de Risco — SJBV
                  {kmlLoading && (
                    <span className="text-primary animate-pulse ml-1">•••</span>
                  )}
                </div>

                {kmlLayers.length === 0 && !kmlLoading && (
                  <div className="text-muted-foreground/40 text-[10px]">Nenhuma camada carregada</div>
                )}

                {kmlLayers.map((layer) => (
                  <label
                    key={layer.name}
                    className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-foreground transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleKMLLayer(layer.name)}
                      className="sr-only"
                    />
                    {layer.shape === "line" || layer.shape === "area" ? (
                      <div
                        className="w-4 h-1.5 flex-shrink-0 rounded-sm transition-opacity"
                        style={{
                          background: layer.visible ? layer.color : "#374151",
                          opacity: layer.visible ? 1 : 0.4,
                          boxShadow: layer.visible ? `0 0 4px ${layer.color}60` : "none",
                        }}
                      />
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
                        style={{
                          background: layer.visible ? layer.color : "#374151",
                          opacity: layer.visible ? 1 : 0.4,
                          boxShadow: layer.visible ? `0 0 4px ${layer.color}80` : "none",
                        }}
                      />
                    )}
                    <span
                      className="flex-1 text-[10px] transition-colors"
                      style={{ color: layer.visible ? "#9ca3af" : "#4b5563" }}
                    >
                      {layer.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                      {layer.count}
                    </span>
                  </label>
                ))}
              </div>

              {/* Status counters */}
              <div className="border-t border-border/40 pt-2 space-y-1">
                {hotspots && (
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{hotspots.length} focos detectados</span>
                  </div>
                )}
                {stations && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <RadioTower className="w-3.5 h-3.5" />
                    <span>{stations.filter((s) => s.status === "online").length} estações online</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top info bar */}
        <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-3 shadow-xl">
          <MapIcon className="w-4 h-4 text-primary" />
          <div className="text-xs font-mono">
            <span className="text-primary font-semibold">SAI</span>
            <span className="text-muted-foreground ml-2">
              Mapa Operacional — São João da Boa Vista, SP
            </span>
          </div>
          {kmlLayers.length > 0 && (
            <div className="text-[10px] font-mono text-primary/60 border-l border-border pl-3 ml-1">
              {kmlLayers.reduce((s, l) => s + l.count, 0)} feições · Áreas de Risco
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
