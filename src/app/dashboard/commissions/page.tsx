import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("commissions").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Comisiones" subtitle="Distribución y pago de comisiones." columns={[{key:"amount",label:"Amount"},{key:"currency",label:"Currency"},{key:"status",label:"Status"},{key:"paid_at",label:"Paid At"}]} rows={data as Record<string,unknown>[]}/>}
