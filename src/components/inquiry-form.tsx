"use client";
import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [loading,setLoading]=useState(false); const [success,setSuccess]=useState(false); const [error,setError]=useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(["name","email","phone","whatsapp","notes"].map((k)=>[k,String(form.get(k)??"")]));
    try {
      const r = await fetch("/api/leads", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,property_id:propertyId,source:"property-website"})});
      const d = await r.json(); if(!r.ok) throw new Error(d.error||"No fue posible enviar la solicitud.");
      setSuccess(true); e.currentTarget.reset();
    } catch(err){setError(err instanceof Error?err.message:"Error inesperado.");} finally{setLoading(false);}
  }
  if(success) return <div className="rounded-3xl bg-emerald-50 p-7 text-emerald-900"><CheckCircle2 className="mb-4" size={35}/><h3 className="text-xl font-black">Solicitud recibida</h3><p className="mt-2 text-sm leading-6">El lead ya quedó registrado en Nexora CRM.</p></div>;
  return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
    <div className="mb-6"><div className="flex items-center gap-2 text-cyan-700"><MessageCircle size={20}/><span className="text-sm font-black uppercase tracking-wider">Contactar agente</span></div><h3 className="mt-2 text-2xl font-black text-slate-950">¿Te interesa esta propiedad?</h3></div>
    <div className="space-y-3">
      <input required name="name" placeholder="Nombre completo" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="email" type="email" placeholder="Correo" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="phone" placeholder="Teléfono" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="whatsapp" placeholder="WhatsApp" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <textarea name="notes" rows={4} placeholder="Mensaje..." className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-cyan-500"/>
    </div>
    {error&&<p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
    <button disabled={loading} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 font-bold text-white hover:bg-cyan-600 disabled:opacity-50">{loading&&<LoaderCircle className="animate-spin" size={17}/>} Solicitar información</button>
  </form>;
}
