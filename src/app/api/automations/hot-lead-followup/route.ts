import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";

export async function POST() {
  try {
    const auth = await requireUser();

    const { data: leads, error: leadsError } = await auth.supabase
      .from("leads")
      .select("id,name,status,score,assigned_agent_id")
      .gte("score", 70)
      .order("score", { ascending: false });

    if (leadsError) throw leadsError;

    const activeLeads = (leads ?? []).filter(
      (lead) => !["won", "lost"].includes(lead.status ?? ""),
    );

    const { data: existingTasks, error: tasksError } = await auth.supabase
      .from("tasks")
      .select("lead_id")
      .eq("completed", false);

    if (tasksError) throw tasksError;

    const leadsWithPendingTask = new Set(
      (existingTasks ?? []).map((task) => task.lead_id).filter(Boolean),
    );

    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let created = 0;
    let skipped = 0;

    for (const lead of activeLeads) {
      if (leadsWithPendingTask.has(lead.id)) {
        skipped += 1;
        continue;
      }

      const { error } = await auth.supabase.from("tasks").insert({
        organization_id: auth.organizationId,
        assigned_to: lead.assigned_agent_id || auth.userId,
        lead_id: lead.id,
        title: `Seguimiento prioritario: ${lead.name}`.slice(0, 200),
        description: `Prospecto con score ${lead.score}. Tarea creada automáticamente por Nexora 9.0.`,
        due_at: dueAt,
        completed: false,
      });

      if (!error) created += 1;
    }

    await auth.supabase.from("audit_logs").insert({
      organization_id: auth.organizationId,
      actor_id: auth.userId,
      action: "priority_followup_automation",
      entity_type: "lead",
      metadata: {
        created,
        skipped,
        threshold: 70,
      },
    });

    return NextResponse.json({
      created,
      skipped,
      analyzed: activeLeads.length,
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error: cause instanceof Error ? cause.message : "No fue posible ejecutar la automatización.",
      },
      { status: 500 },
    );
  }
}
