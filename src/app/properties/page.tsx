import Link from "next/link";

import {
  ArrowLeft,
  Search,
} from "lucide-react";

import {
  Navbar,
} from "@/components/navbar";

import {
  PropertyCard,
} from "@/components/property-card";

import {
  getPublicProperties,
} from "@/lib/data";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params =
    await searchParams;

  const q =
    params.q?.trim() ?? "";

  const properties =
    await getPublicProperties(
      q,
    );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">

        {/* ================================================== */}
        {/* ENCABEZADO PRINCIPAL */}
        {/* ================================================== */}

        <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,.12),transparent_28%)]" />

          <div className="relative mx-auto flex max-w-7xl justify-center px-6">

            <div className="mx-auto w-full max-w-5xl text-center">

              <Link
                href="/"
                className="mb-7 inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />

                Volver al inicio
              </Link>

              <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
                Inventario inmobiliario
              </p>

              <h1 className="mx-auto mt-4 text-center text-5xl font-black tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
                Propiedades
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-slate-400 md:text-xl">
                Encuentra apartamentos, casas, villas, solares,
                terrenos, fincas, propiedades en construcción
                y oportunidades de inversión en República Dominicana.
              </p>

              <form className="mx-auto mt-10 flex w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">

                <Search
                  className="ml-5 self-center shrink-0 text-slate-400"
                  size={20}
                />

                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Provincia, ciudad, sector o tipo de propiedad..."
                  className="h-16 min-w-0 flex-1 px-4 text-slate-950 outline-none"
                />

                <button
                  type="submit"
                  className="bg-cyan-400 px-6 font-black text-slate-950 transition hover:bg-cyan-300 md:px-8"
                >
                  Buscar
                </button>

              </form>

              <div className="mt-7 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-cyan-300">
                {properties.length} propiedades encontradas
              </div>

            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* CATÁLOGO */}
        {/* ================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-14">

          {properties.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">

              <h2 className="text-2xl font-black text-slate-950">
                No encontramos propiedades
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Intenta buscar otra provincia, ciudad,
                sector o tipo de propiedad.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {properties.map(
                (property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ),
              )}

            </div>

          )}

        </section>

      </main>
    </>
  );
}