import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("documents").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Documentos" subtitle="Data room de operaciones y propiedades." columns={[{key:"name",label:"Name"},{key:"category",label:"Category"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
