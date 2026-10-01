import Link from "next/link";

import {
  Building2,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">

      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="flex items-center gap-3 font-black tracking-tight text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950">
            <Building2 size={21} />
          </span>

          <span>
            NEXORA
            <span className="text-cyan-400">
              REALTY
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">

          <Link
            href="/properties"
            className="hover:text-white"
          >
            Propiedades
          </Link>

          <Link
            href="/projects"
            className="hover:text-white"
          >
            Proyectos
          </Link>

          <Link
            href="/#ai"
            className="flex items-center gap-1 hover:text-white"
          >
            <Sparkles size={14} />

            Búsqueda con IA
          </Link>

        </nav>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
        >
          <LayoutDashboard size={16} />

          Panel de control
        </Link>

      </div>

    </header>
  );
}