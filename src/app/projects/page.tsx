import {
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { getPublicProjects } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

interface ProjectUnit {
  id: string;
  status?: string | null;
  price?: number | null;
  currency?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_m2?: number | null;
}

interface PublicProject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sector?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  delivery_date?: string | null;
  cover_url?: string | null;

  developers?: {
    name?: string | null;
  } | null;

  project_units?: ProjectUnit[] | null;
}

function getStartingPrice(
  units: ProjectUnit[],
) {
  const prices = units
    .map((unit) =>
      Number(unit.price ?? 0),
    )
    .filter((price) => price > 0);

  if (!prices.length) {
    return null;
  }

  return Math.min(...prices);
}

export default async function ProjectsPage() {
  const projects =
    (await getPublicProjects()) as PublicProject[];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-400">
              Developer Hub
            </p>

            <h1 className="mt-3 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
              Proyectos inmobiliarios
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              Explora desarrollos, unidades,
              precios y ubicaciones dentro del
              ecosistema Nexora Realty.
            </p>

            <div className="mt-8 inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-bold text-cyan-300">
              {projects.length} proyectos disponibles
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
              <Building2
                className="mx-auto text-slate-300"
                size={42}
              />

              <h2 className="mt-4 text-2xl font-black">
                Todavía no hay proyectos publicados
              </h2>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const units =
                  project.project_units ?? [];

                const available =
                  units.filter(
                    (unit) =>
                      unit.status ===
                      "available",
                  ).length;

                const startingPrice =
                  getStartingPrice(units);

                const currency =
                  units.find(
                    (unit) =>
                      Number(
                        unit.price ?? 0,
                      ) > 0,
                  )?.currency ?? "USD";

                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className="h-64 bg-slate-200 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          `url("${project.cover_url}")`,
                      }}
                    />

                    <div className="p-7">
                      <p className="text-xs font-black uppercase tracking-[.15em] text-cyan-700">
                        {project.developers?.name ??
                          "Desarrollador"}
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-slate-950">
                        {project.name}
                      </h2>

                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} />

                        {[
                          project.sector,
                          project.city,
                          project.province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <p className="mt-5 line-clamp-3 leading-7 text-slate-600">
                        {project.description}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-100 p-4">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Unidades
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {units.length}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-100 p-4">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Disponibles
                          </p>

                          <p className="mt-1 text-xl font-black text-cyan-700">
                            {available}
                          </p>
                        </div>
                      </div>

                      {startingPrice ? (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Desde
                          </p>

                          <p className="mt-1 text-3xl font-black text-slate-950">
                            {formatCurrency(
                              startingPrice,
                              currency,
                            )}
                          </p>
                        </div>
                      ) : null}

                      {project.delivery_date ? (
                        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <CalendarDays size={17} />

                          Entrega prevista:{" "}
                          {new Intl.DateTimeFormat(
                            "es-DO",
                            {
                              month: "long",
                              year: "numeric",
                              timeZone: "UTC",
                            },
                          ).format(
                            new Date(
                              project.delivery_date,
                            ),
                          )}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}