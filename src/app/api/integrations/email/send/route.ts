import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({to:z.string().email(),subject:z.string().min(1).max(200),html:z.string().min(1).max(50000)});
export async function POST(req:NextRequest){try{await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM_EMAIL)return NextResponse.json({error:"Resend no configurado"},{status:503});const resend=new Resend(process.env.RESEND_API_KEY);const {data,error}=await resend.emails.send({from:process.env.RESEND_FROM_EMAIL,to:p.data.to,subject:p.data.subject,html:p.data.html});if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({data});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
