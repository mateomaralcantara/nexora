import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { getPublicProperties } from "@/lib/data";

export default async function PropertiesPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const params=await searchParams; const q=params.q?.trim()??""; const properties=await getPublicProperties(q);
  return <><Navbar/><main className="min-h-screen bg-slate-50"><section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-7xl px-6"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>Inicio</Link><h1 className="text-4xl font-black md:text-6xl">Propiedades</h1><form className="mt-8 flex max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white"><Search className="ml-5 self-center text-slate-400" size={20}/><input name="q" defaultValue={q} placeholder="Ciudad, sector, tipo de propiedad..." className="h-15 flex-1 px-4 text-slate-950 outline-none"/><button className="bg-cyan-400 px-7 font-black text-slate-950">Buscar</button></form></div></section><section className="mx-auto max-w-7xl px-6 py-14"><p className="mb-8 text-sm font-bold text-slate-500">{properties.length} resultados</p>{properties.length===0?<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><h2 className="text-2xl font-black">No encontramos propiedades</h2><p className="mt-2 text-slate-500">Intenta con otra ciudad, sector o tipo.</p></div>:<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map(p=><PropertyCard key={p.id} property={p}/>)}</div>}</section></main></>;
}
