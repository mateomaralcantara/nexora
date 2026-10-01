import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("appointments").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Citas y visitas" subtitle="Agenda de clientes y propiedades." columns={[{key:"scheduled_at",label:"Scheduled At"},{key:"status",label:"Status"},{key:"notes",label:"Notes"}]} rows={data as Record<string,unknown>[]}/>}
