import { ShieldAlert, TrendingUp } from "lucide-react";

type Props = {
  score?: number;
  level?: string;
  summary?: string;
};

export function RiskScoreCard({ score = 72, level = "alto", summary = "Monitoramento preditivo ativo para São João da Boa Vista/SP." }: Props) {
  const color = score >= 75 ? "text-red-400 border-red-500/30 bg-red-500/10" : score >= 50 ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : score >= 25 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
          <ShieldAlert className="h-4 w-4" />
          Risk Intelligence AI
        </div>
        <TrendingUp className="h-4 w-4" />
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-black tabular-nums">{score}</span>
        <span className="mb-1 text-xs font-mono uppercase">/100 · {level}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{summary}</p>
    </div>
  );
}
