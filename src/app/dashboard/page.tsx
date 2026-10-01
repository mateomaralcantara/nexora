import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Flame,
  FolderKanban,
  House,
  Users,
} from "lucide-react";

import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  let auth = null;

  try {
    auth = await requireUser();
  } catch {
    auth = null;
  }

  const counts = {
    properties: 0,
    leads: 0,
    hot: 0,
    tasks: 0,
    appointments: 0,
    transactions: 0,
    projects: 0,
    leases: 0,
  };

  if (auth) {
    const supabase = auth.supabase;

    const results = await Promise.all([
      supabase
        .from("properties")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("leads")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("leads")
        .select("*", {
          count: "exact",
          head: true,
        })
        .gte("score", 70),

      supabase
        .from("tasks")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("completed", false),

      supabase
        .from("appointments")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("transactions")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("projects")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("leases")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "active"),
    ]);

    counts.properties = results[0].count ?? 0;
    counts.leads = results[1].count ?? 0;
    counts.hot = results[2].count ?? 0;
    counts.tasks = results[3].count ?? 0;
    counts.appointments = results[4].count ?? 0;
    counts.transactions = results[5].count ?? 0;
    counts.projects = results[6].count ?? 0;
    counts.leases = results[7].count ?? 0;
  }

  const cards = [
    {
      title: "Propiedades",
      value: counts.properties,
      Icon: Building2,
    },
    {
      title: "Leads",
      value: counts.leads,
      Icon: Users,
    },
    {
      title: "Hot Leads",
      value: counts.hot,
      Icon: Flame,
    },
    {
      title: "Tareas",
      value: counts.tasks,
      Icon: ClipboardCheck,
    },
    {
      title: "Citas",
      value: counts.appointments,
      Icon: CalendarDays,
    },
    {
      title: "Transacciones",
      value: counts.transactions,
      Icon: CircleDollarSign,
    },
    {
      title: "Proyectos",
      value: counts.projects,
      Icon: FolderKanban,
    },
    {
      title: "Alquileres",
      value: counts.leases,
      Icon: House,
    },
  ];

  return (
    <div>
      <p className="text-sm font-bold text-cyan-700">
        NEXORA COMMAND CENTER
      </p>

      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
        Dashboard
      </h1>

      <p className="mt-2 text-slate-500">
        {auth?.fullName || "Modo demostración"}
      </p>

      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, Icon }) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">
                {title}
              </p>

              <Icon className="text-cyan-600" />
            </div>

            <p className="mt-5 text-4xl font-black">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-sm font-black uppercase tracking-[.18em] text-cyan-300">
            Nexora AI
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Inteligencia comercial
          </h2>

          <p className="mt-3 leading-7 text-slate-400">
            Búsqueda, scoring, valoración, marketing y priorización
            de prospectos con IA.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7">
          <p className="text-sm font-black uppercase tracking-[.18em] text-cyan-700">
            Pipeline
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Operación inmobiliaria
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm">
            {[
              "Nuevo",
              "Calificado",
              "Visita",
              "Oferta",
              "Negociación",
              "Cerrado",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-100 px-3 py-4 font-bold"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}