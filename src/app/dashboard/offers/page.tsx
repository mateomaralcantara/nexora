import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("offers").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Ofertas" subtitle="Propuestas comerciales de compradores." columns={[{key:"amount",label:"Amount"},{key:"currency",label:"Currency"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
