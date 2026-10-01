import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewPropertyForm } from "@/components/new-property-form";
export default function Page(){return <div className="mx-auto max-w-5xl"><Link href="/dashboard/properties" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>Propiedades</Link><h1 className="mt-5 text-4xl font-black">Nueva propiedad</h1><p className="mt-2 text-slate-500">Registra un inmueble en el inventario central.</p><div className="mt-8"><NewPropertyForm/></div></div>}
