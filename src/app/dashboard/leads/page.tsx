import { Flame } from "lucide-react";

import { CRMQuickCreate } from "@/components/crm-quick-create";
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

function scoreLabel(score: number) {
  if (score >= 85) return "Muy alta";
  if (score >= 70) return "Alta";
  if (score >= 45) return "Media";
  return "Inicial";
}

export default async function Page() {
  const { supabase } = await requireUser();

  const { data = [] } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-cyan-700">
            CRM INTELIGENTE
          </p>
          <h1 className="mt-2 text-4xl font-black">Prospectos</h1>
          <p className="mt-2 text-slate-500">
            Priorización comercial por score, intención y estado del prospecto.
          </p>
        </div>

        <CRMQuickCreate
          endpoint="/api/leads"
          title="Nuevo prospecto"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "email", label: "Correo", type: "email" },
            { name: "phone", label: "Teléfono" },
            { name: "whatsapp", label: "WhatsApp" },
            { name: "source", label: "Fuente", placeholder: "manual" },
            { name: "notes", label: "Notas" },
          ]}
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Prospecto</th>
              <th className="px-5 py-4">Contacto</th>
              <th className="px-5 py-4">Fuente</th>
              <th className="px-5 py-4">Score</th>
              <th className="px-5 py-4">Prioridad</th>
              <th className="px-5 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lead) => {
              const score = Number(lead.score || 0);

              return (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-black">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.email || "-"}</p>
                  </td>
                  <td className="px-5 py-4">{lead.whatsapp || lead.phone || "-"}</td>
                  <td className="px-5 py-4 text-slate-500">{lead.source}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-black">
                      {score >= 70 ? <Flame size={15} className="text-orange-500" /> : null}
                      {score}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        score >= 70
                          ? "rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                      }
                    >
                      {scoreLabel(score)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                      {statusLabel(lead.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Todavía no hay prospectos.
          </div>
        ) : null}
      </div>
    </div>
  );
}
