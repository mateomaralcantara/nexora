"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Zap } from "lucide-react";

export function PriorityFollowupAutomation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/automations/hot-lead-followup", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No fue posible ejecutar la automatización.");
      }

      setResult({
        created: data.created ?? 0,
        skipped: data.skipped ?? 0,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <Zap size={23} />
        </span>

        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Automatización</p>
          <h2 className="mt-1 text-2xl font-black">Seguimiento prioritario</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Crea una tarea de seguimiento para cada prospecto activo con score igual o superior a 70 que todavía no tenga una tarea pendiente.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : <Zap size={18} />}
        Ejecutar automatización
      </button>

      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">
            {result.created} tareas nuevas creadas. {result.skipped} prospectos omitidos porque ya tenían seguimiento pendiente.
          </p>
        </div>
      ) : null}
    </section>
  );
}
