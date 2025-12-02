import React from "react";

const statusLabels = {
  idle: "Bereit für die Marktanalyse…",
  running_research: "Markt-Research-Daten werden ausgewertet…",
  running_insights: "Insights werden generiert…",
  success: "Analyse abgeschlossen. Weiterleitung erfolgt…",
  error: "Analyse fehlgeschlagen. Bitte versuche es erneut.",
};

const AnalysisProgress = ({ progress = 0, status = "idle" }) => {
  const clamped = Math.max(0, Math.min(progress, 100));
  const label = statusLabels[status] || statusLabels.idle;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default AnalysisProgress;
