import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({property_id:z.string().uuid(),lead_id:z.string().uuid().optional(),transaction_type:z.enum(["sale","rent"]),sale_price:z.coerce.number().nonnegative().optional(),currency:z.string().length(3).default("USD"),commission_rate:z.coerce.number().min(0).max(100).optional(),expected_close_at:z.string().optional()});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("transactions").insert({...p.data,organization_id:a.organizationId,agent_id:a.userId,status:"open"}).select("*").single();if(error)throw error;return NextResponse.json({transaction:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
