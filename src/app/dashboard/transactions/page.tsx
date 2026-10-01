import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("transactions").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Transacciones" subtitle="Operaciones desde negociación hasta cierre." columns={[{key:"transaction_type",label:"Transaction Type"},{key:"status",label:"Status"},{key:"sale_price",label:"Sale Price"},{key:"currency",label:"Currency"}]} rows={data as Record<string,unknown>[]}/>}
