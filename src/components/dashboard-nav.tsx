import Link from "next/link";
import { Bot, Building2, CalendarDays, ChartNoAxesCombined, CircleDollarSign, ClipboardCheck, FileText, FolderKanban, Gauge, Hammer, House, Megaphone, ReceiptText, Settings, Users, WalletCards, WandSparkles } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const sections = [
  { href: "/dashboard", label: "Resumen", icon: Gauge },
  { href: "/dashboard/properties", label: "Propiedades", icon: Building2 },
  { href: "/dashboard/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/dashboard/leads", label: "CRM / Leads", icon: Users },
  { href: "/dashboard/tasks", label: "Tareas", icon: ClipboardCheck },
  { href: "/dashboard/appointments", label: "Citas", icon: CalendarDays },
  { href: "/dashboard/offers", label: "Ofertas", icon: ReceiptText },
  { href: "/dashboard/transactions", label: "Transacciones", icon: CircleDollarSign },
  { href: "/dashboard/commissions", label: "Comisiones", icon: WalletCards },
  { href: "/dashboard/rentals", label: "Alquileres", icon: House },
  { href: "/dashboard/maintenance", label: "Mantenimiento", icon: Hammer },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/analytics", label: "Analítica", icon: ChartNoAxesCombined },
  { href: "/dashboard/autopilot", label: "Autopilot", icon: WandSparkles },
  { href: "/#ai", label: "Nexora AI", icon: Bot },
];

export function DashboardNav() {
  return <aside className="bg-slate-950 p-5 text-white lg:min-h-screen">
    <Link href="/" className="flex items-center gap-3 px-3 py-4 font-black">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Building2 size={20}/></span> NEXORA
    </Link>
    <nav className="mt-6 space-y-1">{sections.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><Icon size={17}/>{label}</Link>)}</nav>
    <div className="mt-8 border-t border-white/10 pt-3">
      <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><Settings size={17}/> Ajustes</Link>
      <SignOutButton/>
    </div>
  </aside>;
}
