import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("marketing_campaigns").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Marketing" subtitle="Campañas y contenido multicanal." columns={[{key:"name",label:"Name"},{key:"channel",label:"Channel"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
