import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
export default function LoginPage(){return <main className="min-h-screen bg-slate-950 px-6 py-12"><div className="mx-auto max-w-7xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>Volver</Link><div className="grid min-h-[80vh] place-items-center"><AuthForm/></div></div></main>}
