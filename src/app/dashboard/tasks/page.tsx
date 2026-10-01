import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("tasks").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Tareas" subtitle="Seguimiento comercial y operativo." columns={[{key:"title",label:"Title"},{key:"due_at",label:"Due At"},{key:"completed",label:"Completed"}]} rows={data as Record<string,unknown>[]}/>}
