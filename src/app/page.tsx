import Link from "next/link";

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { AIPropertySearch } from "@/components/ai-property-search";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { getPublicProperties } from "@/lib/data";

export default async function HomePage() {
  const featured =
    (await getPublicProperties()).slice(0, 6);

  const features = [
    [
      Building2,
      "Motor de Propiedades",
      "Inventario centralizado para venta, alquiler, renta corta y proyectos.",
    ],
    [
      Users,
      "CRM Inteligente",
      "Prospectos, embudo comercial, puntuación, agentes, seguimiento y actividad comercial.",
    ],
    [
      BrainCircuit,
      "Nexora IA",
      "Búsqueda conversacional, recomendaciones, puntuación y valoración asistida.",
    ],
    [
      ChartNoAxesCombined,
      "Analítica",
      "Indicadores comerciales, inventario, oportunidades y conversión.",
    ],
    [
      Bot,
      "Automatización Inteligente",
      "WhatsApp, correo electrónico, integraciones y flujos comerciales automatizados.",
    ],
    [
      ShieldCheck,
      "Multiempresa",
      "Organizaciones aisladas mediante autenticación y seguridad por filas.",
    ],
  ] as const;

  return (
    <>
      <Navbar />

      <main>

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,.12),transparent_28%)]" />

          <div className="relative mx-auto flex max-w-7xl justify-center px-6 py-24 md:py-36">

            <div className="mx-auto w-full max-w-5xl text-center">

              <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                <Sparkles size={16} />

                Sistema Operativo Inmobiliario Nativo con IA
              </div>

              <h1 className="mx-auto text-center text-5xl font-black tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
                Una inmobiliaria completa.

                <span className="block text-cyan-400">
                  En un solo sistema.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-3xl text-center text-lg leading-8 text-slate-400 md:text-xl">
                Portal, propiedades, CRM, prospectos, proyectos,
                operaciones, alquileres, comisiones, mercadeo,
                analítica e inteligencia artificial.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">

                <Link
                  href="/properties"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Explorar propiedades

                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  Abrir Nexora
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* NEXORA INTELLIGENCE */}
        {/* ================================================== */}

        <section
          id="ai"
          className="bg-slate-950 pb-24"
        >
          <div className="mx-auto max-w-7xl px-6">

            <div className="mx-auto max-w-5xl text-center">

              <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
                Inteligencia Nexora
              </p>

              <h2 className="mt-3 text-center text-3xl font-black text-white md:text-5xl">
                Describe lo que buscas.
              </h2>

              <p className="mx-auto mb-8 mt-3 max-w-2xl text-center text-slate-400">
                La búsqueda semántica combina inventario y
                razonamiento de IA sin inventar propiedades.
              </p>

              <div className="mx-auto w-full max-w-4xl text-left">
                <AIPropertySearch />
              </div>

            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* PROPIEDADES */}
        {/* ================================================== */}

        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6">

            <div className="flex justify-between gap-5">

              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">
                  Inventario
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                  Propiedades destacadas
                </h2>
              </div>

              <Link
                href="/properties"
                className="font-bold text-cyan-700"
              >
                Ver todas →
              </Link>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>

          </div>
        </section>

        {/* ================================================== */}
        {/* REAL ESTATE OS */}
        {/* ================================================== */}

        <section className="bg-white py-24">

          <div className="mx-auto max-w-7xl px-6">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">
                Sistema Operativo Inmobiliario
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                No es otro CRM. Es la operación completa.
              </h2>

            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {features.map(
                ([Icon, title, description]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-slate-200 p-7"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-cyan-300">
                      <Icon size={22} />
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      {title}
                    </h3>

                    <p className="mt-2 leading-7 text-slate-500">
                      {description}
                    </p>
                  </div>
                ),
              )}

            </div>

          </div>
        </section>

      </main>
    </>
  );
}