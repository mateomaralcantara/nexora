import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("maintenance_requests").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Mantenimiento" subtitle="Incidencias y órdenes de mantenimiento." columns={[{key:"title",label:"Title"},{key:"priority",label:"Priority"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
