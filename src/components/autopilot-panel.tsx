"use client";
import { useState } from "react";
import { LoaderCircle, WandSparkles } from "lucide-react";

type Item = { id:string; title:string };
export function AutopilotPanel({properties}:{properties:Item[]}){
  const [propertyId,setPropertyId]=useState(properties[0]?.id??"");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<any>(null);
  const [error,setError]=useState("");
  async function run(){if(!propertyId)return;setLoading(true);setError("");setResult(null);try{const r=await fetch("/api/ai/autopilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({property_id:propertyId})});const d=await r.json();if(!r.ok)throw new Error(d.error||"No fue posible ejecutar Autopilot.");setResult(d);}catch(e){setError(e instanceof Error?e.message:"Error inesperado");}finally{setLoading(false)}}
  return <div className="rounded-3xl border border-slate-200 bg-white p-7"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><WandSparkles/></span><div><h2 className="text-2xl font-black">Nexora Autopilot</h2><p className="text-sm text-slate-500">Convierte una propiedad en campañas y acciones comerciales.</p></div></div><div className="mt-7 flex flex-col gap-3 md:flex-row"><select value={propertyId} onChange={e=>setPropertyId(e.target.value)} className="h-12 flex-1 rounded-xl border border-slate-200 px-4"><option value="">Selecciona una propiedad</option>{properties.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><button onClick={run} disabled={loading||!propertyId} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white disabled:opacity-50">{loading?<LoaderCircle className="animate-spin" size={18}/>:<WandSparkles size={18}/>}Ejecutar Autopilot</button></div>{error&&<p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}{result&&<div className="mt-7 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase text-cyan-700">Resultado</p><p className="mt-2 font-semibold">{result.campaigns_created} campañas creadas</p><p className="mt-1 text-sm text-slate-500">{result.task_created?"Tarea de seguimiento creada":"Sin tarea"}</p></div><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase text-cyan-300">Estrategia</p><p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p></div></div>}</div>
}
