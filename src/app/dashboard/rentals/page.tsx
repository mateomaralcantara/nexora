import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("leases").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Alquileres" subtitle="Contratos, rentas y vencimientos." columns={[{key:"tenant_name",label:"Tenant Name"},{key:"monthly_rent",label:"Monthly Rent"},{key:"currency",label:"Currency"},{key:"status",label:"Status"}]} rows={data as Record<string,unknown>[]}/>}
