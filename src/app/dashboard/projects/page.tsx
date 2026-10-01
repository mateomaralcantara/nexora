import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("projects").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Proyectos" subtitle="Constructoras, proyectos y unidades." columns={[{key:"name",label:"Name"},{key:"city",label:"City"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
