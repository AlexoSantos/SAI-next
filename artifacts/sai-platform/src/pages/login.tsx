import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "../store/auth";
import { ShieldAlert, Terminal, Lock, MousePointerClick } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const PRESETS = [
  { label: "CEO", email: "ceo@imperatech.ai", password: "IMPERATECH_MASTER_2026" },
  { label: "Admin", email: "admin@sai.gov", password: "SAI_MASTER_2026" },
];

function getApiOrigin() {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:8080";
  return raw.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuthStore();

  const [email, setEmail] = useState("ceo@imperatech.ai");
  const [password, setPassword] = useState("IMPERATECH_MASTER_2026");
  const [isPending, setIsPending] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setLoginError("");

    try {
      const response = await fetch(`${getApiOrigin()}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.token || !data?.user) {
        throw new Error(data?.error || "Credenciais inválidas");
      }

      setAuth(data.user, data.token);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Erro de login:", error);
      setLoginError("ACESSO NEGADO. Verifique se a API está ligada na porta 8080 e tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  const fillPreset = (preset: (typeof PRESETS)[number]) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setLoginError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#1c2536 1px, transparent 1px), linear-gradient(90deg, #1c2536 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md p-8 bg-card/80 backdrop-blur-md border border-primary/20 rounded-lg shadow-[0_0_50px_rgba(0,212,255,0.1)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-primary font-mono">SAI</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em] mt-1">Imperatech Systems</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
              Operator ID
            </Label>
            <div className="relative">
              <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50 font-mono"
                placeholder="operator@sai.gov"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
              Passcode
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50 font-mono"
                required
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-destructive text-sm font-mono">
              {loginError}
            </div>
          )}

          <Button type="submit" className="w-full font-mono uppercase tracking-widest" disabled={isPending}>
            {isPending ? "Autenticando..." : "Inicializar Sessão"}
          </Button>
        </form>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.email}
              type="button"
              onClick={() => fillPreset(preset)}
              className="flex items-center gap-2 rounded border border-primary/20 bg-primary/5 p-3 text-left hover:bg-primary/10 transition-colors"
            >
              <MousePointerClick className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-mono text-primary">{preset.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{preset.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
