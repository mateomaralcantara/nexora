"use client";

import { FormEvent, useState } from "react";
import { Bot, LoaderCircle, Search, Sparkles } from "lucide-react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";

interface SearchResponse { answer: string; properties: Property[]; }

export function AIPropertySearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo realizar la búsqueda.");
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-3xl border border-cyan-300/20 bg-slate-900 p-3 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Bot className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400" size={22}/>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Ej: apartamento en Piantini, 3 habitaciones, menos de US$350,000..." className="h-16 w-full rounded-2xl border border-white/10 bg-slate-950 pl-14 pr-5 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"/>
          </div>
          <button disabled={loading} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-8 font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" size={19}/> : <Search size={19}/>} Buscar con IA
          </button>
        </div>
      </form>
      {error && <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-950/30 p-4 text-red-200">{error}</div>}
      {result && <div className="mt-8">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-slate-200">
          <div className="mb-3 flex items-center gap-2 font-black text-cyan-300"><Sparkles size={18}/> NEXORA AI</div>
          <p className="leading-7">{result.answer}</p>
        </div>
        {result.properties.length > 0 && <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.properties.map((p)=><PropertyCard key={p.id} property={p}/>)}</div>}
      </div>}
    </div>
  );
}
