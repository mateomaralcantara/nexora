import { connection } from "next/server";

import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El dashboard contiene datos privados y dependientes
  // de la sesion. Nunca debe prerenderizarse en build.
  await connection();

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[265px_1fr]">
      <DashboardNav />

      <main className="min-w-0 p-5 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}