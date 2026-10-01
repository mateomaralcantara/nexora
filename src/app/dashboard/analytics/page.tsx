import { requireUser } from "@/lib/auth";

export default async function AnalyticsPage() {
  const {
    supabase,
  } = await requireUser();

  const [
    propertiesResult,
    leadsResult,
    transactionsResult,
    offersResult,
  ] =
    await Promise.all([
      supabase
        .from("properties")
        .select(
          "price,status,city",
        ),

      supabase
        .from("leads")
        .select(
          "score,status,source",
        ),

      supabase
        .from("transactions")
        .select(
          "sale_price,status,currency",
        ),

      supabase
        .from("offers")
        .select(
          "amount,status,currency",
        ),
    ]);

  const properties =
    propertiesResult.data ?? [];

  const leads =
    leadsResult.data ?? [];

  const transactions =
    transactionsResult.data ?? [];

  const offers =
    offersResult.data ?? [];

  const closedVolume =
    transactions
      .filter(
        (transaction) =>
          transaction.status ===
          "closed",
      )
      .reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.sale_price ||
              0,
          ),
        0,
      );

  const averageScore =
    leads.length > 0
      ? Math.round(
          leads.reduce(
            (sum, lead) =>
              sum +
              Number(
                lead.score || 0,
              ),
            0,
          ) /
            leads.length,
        )
      : 0;

  const activeOffers =
    offers.filter(
      (offer) =>
        ![
          "rejected",
          "withdrawn",
        ].includes(
          offer.status ?? "",
        ),
    ).length;

  const metrics = [
    {
      label: "Inventario",
      value:
        properties.length,
    },
    {
      label: "Leads",
      value:
        leads.length,
    },
    {
      label: "Score promedio",
      value:
        averageScore,
    },
    {
      label: "Ofertas activas",
      value:
        activeOffers,
    },
    {
      label: "Volumen cerrado",
      value:
        closedVolume.toLocaleString(
          "en-US",
        ),
    },
  ];

  const pipeline = [
    "new",
    "qualified",
    "offer",
    "won",
  ];

  return (
    <div>
      <p className="text-sm font-black uppercase tracking-wider text-cyan-700">
        Business Intelligence
      </p>

      <h1 className="mt-2 text-4xl font-black">
        Analítica
      </h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map(
          (metric) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <p className="text-sm font-bold text-slate-500">
                {metric.label}
              </p>

              <p className="mt-4 text-4xl font-black">
                {metric.value}
              </p>
            </div>
          ),
        )}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7">
        <h2 className="text-2xl font-black">
          Embudo
        </h2>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {pipeline.map(
            (status) => (
              <div
                key={status}
                className="rounded-2xl bg-slate-100 p-5"
              >
                <p className="text-sm font-bold text-slate-500">
                  {status}
                </p>

                <p className="mt-2 text-3xl font-black">
                  {
                    leads.filter(
                      (lead) =>
                        lead.status ===
                        status,
                    ).length
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}