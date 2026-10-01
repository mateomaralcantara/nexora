"use client";

import { useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles } from "lucide-react";

export function AICommandCenter() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (query.trim().length < 3) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No fue posible analizar la operación.");
      }

      setAnswer(data.answer || "Análisis completado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-slate-950 p-7 text-white">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
          <Bot size={24} />
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black">Copiloto Nexora</h2>
            <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-300">
              9.0
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Pregunta sobre prospectos, inventario, tareas, ofertas y transacciones usando los datos reales de tu organización.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej.: ¿Cuáles prospectos requieren atención hoy y qué debería hacer con cada uno?"
          className="min-h-28 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-500"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles size={14} />
            Solo analiza datos existentes. No inventa propiedades.
          </div>

          <button
            type="button"
            onClick={analyze}
            disabled={loading || query.trim().length < 3}
            className="flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}
            Analizar
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-300">{error}</p> : null}

      {answer ? (
        <div className="mt-6 rounded-2xl bg-white p-5 text-slate-900">
          <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-700">Inteligencia Nexora</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{answer}</p>
        </div>
      ) : null}
    </section>
  );
}
