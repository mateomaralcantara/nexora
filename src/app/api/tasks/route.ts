import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({title:z.string().min(2).max(200),description:z.string().max(2000).optional(),due_at:z.string().optional(),lead_id:z.string().uuid().optional(),property_id:z.string().uuid().optional()});
export async function GET(){try{const a=await requireUser();const {data,error}=await a.supabase.from("tasks").select("*").order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({tasks:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("tasks").insert({...p.data,organization_id:a.organizationId,assigned_to:a.userId,due_at:p.data.due_at||null}).select("*").single();if(error)throw error;return NextResponse.json({task:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
