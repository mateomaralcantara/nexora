import {
  AlertTriangle,
  Building2,
  Flame,
  ListTodo,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { AICommandCenter } from "@/components/ai-command-center";
import { PriorityFollowupAutomation } from "@/components/priority-followup-automation";
import { requireUser } from "@/lib/auth";

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    new: "Nuevo",
    contacted: "Contactado",
    qualified: "Calificado",
    appointment: "Cita",
    visit: "Visita",
    offer: "Oferta",
    negotiation: "Negociación",
    won: "Ganado",
    lost: "Perdido",
  };

  return labels[status] ?? status;
}

export default async function IntelligencePage() {
  const auth = await requireUser();

  const [
    propertiesResult,
    leadsResult,
    tasksResult,
    offersResult,
    transactionsResult,
  ] = await Promise.all([
    auth.supabase.from("properties").select("id,title,status,featured,created_at"),
    auth.supabase
      .from("leads")
      .select("id,name,status,score,source,last_contact_at,created_at,updated_at")
      .order("score", { ascending: false }),
    auth.supabase.from("tasks").select("id,title,due_at,completed").eq("completed", false),
    auth.supabase.from("offers").select("id,status,amount,currency"),
    auth.supabase.from("transactions").select("id,status,sale_price,currency"),
  ]);

  const properties = propertiesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const offers = offersResult.data ?? [];
  const transactions = transactionsResult.data ?? [];

  const activeLeads = leads.filter(
    (lead) => !["won", "lost"].includes(lead.status ?? ""),
  );

  const hotLeads = activeLeads.filter((lead) => Number(lead.score || 0) >= 70);

  const publishedProperties = properties.filter(
    (property) => property.status === "published",
  );

  const overdueTasks = tasks.filter(
    (task) => task.due_at && new Date(task.due_at).getTime() < Date.now(),
  );

  const activeOffers = offers.filter(
    (offer) => !["rejected", "withdrawn"].includes(offer.status ?? ""),
  );

  const wonLeads = leads.filter((lead) => lead.status === "won").length;

  const conversionRate =
    leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  const averageScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0) /
            leads.length,
        )
      : 0;

  const closedTransactions = transactions.filter(
    (transaction) => transaction.status === "closed",
  ).length;

  const healthPenalty = Math.min(
    45,
    overdueTasks.length * 5 +
      Math.max(0, hotLeads.length - activeOffers.length) * 2,
  );

  const healthScore = Math.max(
    55,
    Math.min(100, 92 - healthPenalty + Math.min(8, closedTransactions * 2)),
  );

  const metrics = [
    {
      label: "Salud operativa",
      value: `${healthScore}/100`,
      Icon: Radar,
      detail: "Indicador interno de atención y carga.",
    },
    {
      label: "Prospectos prioritarios",
      value: hotLeads.length,
      Icon: Flame,
      detail: "Score igual o superior a 70.",
    },
    {
      label: "Inventario publicado",
      value: publishedProperties.length,
      Icon: Building2,
      detail: `${properties.length} propiedades totales.`,
    },
    {
      label: "Tareas vencidas",
      value: overdueTasks.length,
      Icon: AlertTriangle,
      detail: `${tasks.length} tareas pendientes.`,
    },
    {
      label: "Ofertas activas",
      value: activeOffers.length,
      Icon: Target,
      detail: `${offers.length} ofertas registradas.`,
    },
    {
      label: "Score promedio",
      value: averageScore,
      Icon: TrendingUp,
      detail: "Promedio de prospectos registrados.",
    },
    {
      label: "Conversión",
      value: `${conversionRate}%`,
      Icon: Users,
      detail: `${wonLeads} prospectos ganados.`,
    },
    {
      label: "Cierres",
      value: closedTransactions,
      Icon: ListTodo,
      detail: `${transactions.length} transacciones registradas.`,
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[.18em] text-cyan-700">
              NEXORA INTELLIGENCE
            </p>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-cyan-300">
              9.0
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Centro de Inteligencia
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-500">
            Una capa ejecutiva sobre tu CRM, inventario, tareas, ofertas y transacciones para detectar prioridades y ejecutar seguimiento.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900">
          <Sparkles size={18} />
          Inteligencia operativa activa
        </div>
      </div>

      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, Icon, detail }) => (
          <article
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <Icon size={20} className="text-cyan-700" />
            </div>
            <p className="mt-5 text-4xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <AICommandCenter />
        <PriorityFollowupAutomation />
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-700">
            Prioridad comercial
          </p>
          <h2 className="mt-2 text-2xl font-black">Prospectos con mayor score</h2>
        </div>

        {hotLeads.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No hay prospectos con score igual o superior a 70.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Prospecto</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Fuente</th>
                  <th className="px-5 py-4">Último contacto</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.slice(0, 12).map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-black">{lead.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">
                        <Flame size={14} />
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">
                      {statusLabel(lead.status)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {lead.source || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {lead.last_contact_at
                        ? new Intl.DateTimeFormat("es-DO", {
                            dateStyle: "medium",
                            timeZone: "UTC",
                          }).format(new Date(lead.last_contact_at))
                        : "Sin contacto registrado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
