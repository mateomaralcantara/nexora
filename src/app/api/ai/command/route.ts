import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getModel, getOpenAI } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  query: z.string().min(3).max(1000),
});

function compact(value: unknown) {
  return JSON.stringify(value).slice(0, 22000);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
    }

    const [
      propertiesResult,
      leadsResult,
      tasksResult,
      offersResult,
      transactionsResult,
    ] = await Promise.all([
      auth.supabase
        .from("properties")
        .select("id,title,status,property_type,price,currency,city,sector,province,featured,created_at")
        .order("created_at", { ascending: false })
        .limit(100),

      auth.supabase
        .from("leads")
        .select("id,name,status,score,source,budget_min,budget_max,preferred_city,preferred_sector,preferred_property_type,last_contact_at,created_at,updated_at")
        .order("score", { ascending: false })
        .limit(150),

      auth.supabase
        .from("tasks")
        .select("id,title,lead_id,property_id,due_at,completed,created_at")
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(100),

      auth.supabase
        .from("offers")
        .select("id,property_id,lead_id,amount,currency,status,created_at")
        .order("created_at", { ascending: false })
        .limit(100),

      auth.supabase
        .from("transactions")
        .select("id,property_id,lead_id,sale_price,currency,status,expected_close_at,closed_at,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const properties = propertiesResult.data ?? [];
    const leads = leadsResult.data ?? [];
    const tasks = tasksResult.data ?? [];
    const offers = offersResult.data ?? [];
    const transactions = transactionsResult.data ?? [];

    const hotLeads = leads.filter(
      (lead) =>
        Number(lead.score || 0) >= 70 &&
        !["won", "lost"].includes(lead.status ?? ""),
    );

    const overdueTasks = tasks.filter(
      (task) => task.due_at && new Date(task.due_at).getTime() < Date.now(),
    );

    const snapshot = {
      properties_total: properties.length,
      properties_published: properties.filter((property) => property.status === "published").length,
      leads_total: leads.length,
      leads_priority: hotLeads.length,
      tasks_pending: tasks.length,
      tasks_overdue: overdueTasks.length,
      offers_total: offers.length,
      transactions_total: transactions.length,
      top_priority_leads: hotLeads.slice(0, 15),
      recent_properties: properties.slice(0, 20),
      pending_tasks: tasks.slice(0, 20),
      recent_offers: offers.slice(0, 20),
      recent_transactions: transactions.slice(0, 20),
    };

    const ai = getOpenAI();

    if (!ai) {
      return NextResponse.json({
        answer: `Resumen operativo: ${leads.length} prospectos, ${hotLeads.length} prioritarios, ${properties.length} propiedades, ${tasks.length} tareas pendientes y ${overdueTasks.length} vencidas. Configura OPENAI_API_KEY para activar el razonamiento avanzado del Copiloto Nexora.`,
      });
    }

    const response = await ai.responses.create({
      model: getModel(),
      input: `Eres el Copiloto Ejecutivo de Nexora Realty OS 9.0.

Analiza únicamente los datos reales incluidos en CONTEXTO.
No inventes propiedades, personas, ingresos, probabilidades de cierre, rentabilidad, fechas ni contactos.
No afirmes que una acción fue ejecutada.
Cuando falten datos, dilo expresamente.

Responde en español.
Prioriza:
1. riesgos urgentes,
2. prospectos que requieren seguimiento,
3. inventario que merece atención,
4. tareas vencidas,
5. ofertas y transacciones,
6. siguiente acción concreta.

Máximo 350 palabras.

CONSULTA:
${parsed.data.query}

CONTEXTO:
${compact(snapshot)}`,
    });

    await auth.supabase.from("audit_logs").insert({
      organization_id: auth.organizationId,
      actor_id: auth.userId,
      action: "ai_command_analyzed",
      entity_type: "organization",
      entity_id: auth.organizationId,
      metadata: { query: parsed.data.query },
    });

    return NextResponse.json({
      answer: response.output_text || "Análisis completado.",
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error: cause instanceof Error ? cause.message : "No fue posible completar el análisis.",
      },
      { status: 500 },
    );
  }
}
