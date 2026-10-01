$ErrorActionPreference = "Stop"
$BasePath = "C:\Users\martin\Desktop\VSC\BestS"
$ProjectName = "nexora-realty-os"
$ProjectPath = Join-Path $BasePath $ProjectName
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "" 
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXORA REALTY OS - MASTER INSTALLER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js no está disponible en PATH." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm no está disponible en PATH." }
New-Item -ItemType Directory -Path $BasePath -Force | Out-Null

if (Test-Path $ProjectPath) {
    $BackupPath = "$ProjectPath-backup-$Stamp"
    Write-Host "Backup del proyecto existente: $BackupPath" -ForegroundColor Yellow
    Move-Item $ProjectPath $BackupPath
}

Set-Location $BasePath
Write-Host "[1/7] Creando Next.js..." -ForegroundColor Yellow
npx create-next-app@latest $ProjectName --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
if ($LASTEXITCODE -ne 0) { throw "Falló create-next-app." }
Set-Location $ProjectPath

Write-Host "[2/7] Instalando dependencias..." -ForegroundColor Yellow
npm install @supabase/supabase-js @supabase/ssr openai zod lucide-react clsx tailwind-merge resend
if ($LASTEXITCODE -ne 0) { throw "Falló npm install." }

function Write-NexoraFile {
    param([Parameter(Mandatory=$true)][string]$RelativePath,[Parameter(Mandatory=$true)][string]$Content)
    $FullPath = Join-Path $ProjectPath $RelativePath
    $Directory = Split-Path $FullPath -Parent
    if (-not (Test-Path $Directory)) { New-Item -ItemType Directory -Path $Directory -Force | Out-Null }
    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($FullPath,$Content,$Utf8NoBom)
    Write-Host "CREADO: $RelativePath" -ForegroundColor DarkGreen
}

Write-Host "[3/7] Escribiendo aplicación..." -ForegroundColor Yellow


Write-NexoraFile 'tsconfig.json' @'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'@

Write-NexoraFile 'eslint.config.mjs' @'
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off"
    }
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])
]);
'@

Write-NexoraFile '.env.example' @'
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Nexora Realty OS
NEXT_PUBLIC_DEFAULT_CURRENCY=USD

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra

META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_VERIFY_TOKEN=
META_GRAPH_VERSION=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

NEXT_PUBLIC_MAPBOX_TOKEN=
'@

Write-NexoraFile 'src/lib/types.ts' @'
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PropertyStatus = "draft" | "published" | "reserved" | "sold" | "rented" | "archived";
export type PropertyOperation = "sale" | "rent" | "short_rent";
export type LeadStatus = "new" | "contacted" | "qualified" | "appointment" | "visit" | "offer" | "negotiation" | "won" | "lost";

export interface PropertyImage {
  id?: string;
  property_id?: string;
  url: string;
  alt_text?: string | null;
  position?: number;
}

export interface Property {
  id: string;
  organization_id?: string;
  agent_id?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  operation: PropertyOperation;
  status: PropertyStatus;
  property_type: string;
  price: number;
  currency: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  area_m2?: number | null;
  lot_m2?: number | null;
  address?: string | null;
  sector?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  furnished?: boolean;
  pool?: boolean;
  featured?: boolean;
  amenities?: string[] | null;
  created_at?: string;
  updated_at?: string;
  property_images?: PropertyImage[];
}

export interface Lead {
  id: string;
  organization_id: string;
  property_id?: string | null;
  assigned_agent_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  source: string;
  status: LeadStatus;
  score: number;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_city?: string | null;
  preferred_sector?: string | null;
  preferred_property_type?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DashboardCounts {
  properties: number;
  leads: number;
  hotLeads: number;
  tasks: number;
  appointments: number;
  transactions: number;
  projects: number;
  leases: number;
}
'@

Write-NexoraFile 'src/lib/utils.ts' @'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined, currency = "USD") {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-US")}`;
  }
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function safeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
'@

Write-NexoraFile 'src/lib/demo-data.ts' @'
import type { Property } from "@/lib/types";

export const demoProperties: Property[] = [
  {
    id: "demo-piantini",
    title: "Apartamento Premium en Piantini",
    slug: "apartamento-premium-piantini",
    description: "Apartamento contemporáneo con terminaciones premium, amplios espacios, lobby, gimnasio, piscina y excelente ubicación.",
    operation: "sale",
    status: "published",
    property_type: "Apartamento",
    price: 325000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 3.5,
    parking_spaces: 2,
    area_m2: 210,
    city: "Santo Domingo",
    sector: "Piantini",
    country: "República Dominicana",
    featured: true,
    pool: true,
    amenities: ["Piscina", "Gimnasio", "Lobby", "Planta eléctrica"],
    property_images: [{
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
      position: 0,
    }],
  },
  {
    id: "demo-jarabacoa",
    title: "Villa Moderna en Jarabacoa",
    slug: "villa-moderna-jarabacoa",
    description: "Villa privada rodeada de naturaleza, con vista a montaña, piscina, terraza y excelente potencial para vivienda o inversión vacacional.",
    operation: "sale",
    status: "published",
    property_type: "Villa",
    price: 410000,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 4,
    parking_spaces: 4,
    area_m2: 380,
    lot_m2: 1250,
    city: "Jarabacoa",
    province: "La Vega",
    country: "República Dominicana",
    featured: true,
    pool: true,
    amenities: ["Piscina", "Terraza", "Vista a montaña", "Jardín"],
    property_images: [{
      url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85",
      position: 0,
    }],
  },
  {
    id: "demo-punta-cana",
    title: "Apartamento de Inversión en Punta Cana",
    slug: "apartamento-inversion-punta-cana",
    description: "Unidad orientada a inversión y renta vacacional en una zona turística de alta demanda, con piscina y amenidades.",
    operation: "sale",
    status: "published",
    property_type: "Apartamento",
    price: 185000,
    currency: "USD",
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    area_m2: 105,
    city: "Punta Cana",
    province: "La Altagracia",
    country: "República Dominicana",
    featured: true,
    pool: true,
    amenities: ["Piscina", "Seguridad", "Área social"],
    property_images: [{
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
      position: 0,
    }],
  },
  {
    id: "demo-santiago",
    title: "Penthouse en Cerros de Gurabo",
    slug: "penthouse-cerros-de-gurabo",
    description: "Penthouse amplio con terraza privada, cuatro habitaciones y espacios sociales generosos.",
    operation: "sale",
    status: "published",
    property_type: "Penthouse",
    price: 295000,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 4.5,
    parking_spaces: 3,
    area_m2: 330,
    city: "Santiago",
    sector: "Cerros de Gurabo",
    country: "República Dominicana",
    featured: false,
    amenities: ["Terraza privada", "Ascensor", "Seguridad"],
    property_images: [{
      url: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85",
      position: 0,
    }],
  },
];
'@

Write-NexoraFile 'src/lib/supabase/client.ts' @'
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
'@

Write-NexoraFile 'src/lib/supabase/server.ts' @'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies.
        }
      },
    },
  });
}
'@

Write-NexoraFile 'src/lib/supabase/public.ts' @'
import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
'@

Write-NexoraFile 'src/lib/supabase/admin.ts' @'
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
'@

Write-NexoraFile 'src/lib/supabase/proxy.ts' @'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: claimsData, error } = await supabase.auth.getClaims();
  const claims = error ? null : claimsData?.claims;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") && !claims?.sub) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/login" && claims?.sub) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    return NextResponse.redirect(dashboard);
  }

  return response;
}
'@

Write-NexoraFile 'src/proxy.ts' @'
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
'@

Write-NexoraFile 'src/lib/auth.ts' @'
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsError ? null : claimsData?.claims?.sub;
  if (!userId || typeof userId !== "string") throw new Error("UNAUTHORIZED");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, organization_id, role, full_name")
    .eq("id", userId)
    .single();

  if (error || !profile?.organization_id) throw new Error("PROFILE_NOT_FOUND");

  return {
    supabase,
    userId,
    organizationId: profile.organization_id as string,
    role: profile.role as string,
    fullName: profile.full_name as string | null,
  };
}

export async function getOptionalUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
'@

Write-NexoraFile 'src/lib/data.ts' @'
import { createPublicClient } from "@/lib/supabase/public";
import { demoProperties } from "@/lib/demo-data";
import type { Property } from "@/lib/types";
import { normalizeText } from "@/lib/utils";

function sanitize(value: string) {
  return value.replace(/[%_,()]/g, " ").trim().slice(0, 120);
}

export async function getPublicProperties(search?: string): Promise<Property[]> {
  const admin = createPublicClient();

  if (!admin) {
    if (!search) return demoProperties;
    const needle = normalizeText(search);
    return demoProperties.filter((item) => normalizeText([
      item.title, item.description, item.city, item.sector, item.province, item.property_type,
      item.operation, item.bedrooms, item.bathrooms, item.price,
    ].filter(Boolean).join(" ")).includes(needle));
  }

  let query = admin
    .from("properties")
    .select(`*, property_images(id,url,alt_text,position)`)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(150);

  if (search) {
    const safe = sanitize(search);
    query = query.or([
      `title.ilike.%${safe}%`,
      `city.ilike.%${safe}%`,
      `sector.ilike.%${safe}%`,
      `province.ilike.%${safe}%`,
      `property_type.ilike.%${safe}%`,
    ].join(","));
  }

  const { data, error } = await query;
  if (error) {
    console.error("getPublicProperties", error.message);
    return [];
  }
  return (data ?? []) as unknown as Property[];
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const admin = createPublicClient();
  if (!admin) return demoProperties.find((p) => p.slug === slug) ?? null;

  const { data, error } = await admin
    .from("properties")
    .select(`*, property_images(id,url,alt_text,position)`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPropertyBySlug", error.message);
    return null;
  }
  return data as unknown as Property | null;
}

export async function getPublicProjects() {
  const admin = createPublicClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from("projects")
    .select(`*, developers(name), project_units(id,status,price,currency,bedrooms,bathrooms,area_m2)`)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
'@

Write-NexoraFile 'src/lib/ai.ts' @'
import OpenAI from "openai";

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-5.6-terra";
}
'@

Write-NexoraFile 'src/components/navbar.tsx' @'
import Link from "next/link";
import { Building2, LayoutDashboard, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Building2 size={21} /></span>
          <span>NEXORA<span className="text-cyan-400">REALTY</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <Link href="/properties" className="hover:text-white">Propiedades</Link>
          <Link href="/projects" className="hover:text-white">Proyectos</Link>
          <Link href="/#ai" className="flex items-center gap-1 hover:text-white"><Sparkles size={14}/> AI Search</Link>
        </nav>
        <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300">
          <LayoutDashboard size={16}/> Dashboard
        </Link>
      </div>
    </header>
  );
}
'@

Write-NexoraFile 'src/components/property-card.tsx' @'
import Link from "next/link";
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const image = [...(property.property_images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url
    ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

  return (
    <Link href={`/properties/${property.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={image} alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-bold uppercase text-white">
            {property.operation === "sale" ? "Venta" : property.operation === "rent" ? "Alquiler" : "Renta corta"}
          </span>
          {property.featured && <span className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-black uppercase text-slate-950">Destacada</span>}
        </div>
      </div>
      <div className="p-5">
        <p className="mb-2 text-2xl font-black tracking-tight text-slate-950">{formatCurrency(property.price, property.currency)}</p>
        <h3 className="line-clamp-1 text-lg font-bold text-slate-900">{property.title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15}/><span>{[property.sector, property.city].filter(Boolean).join(", ")}</span></div>
        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5"><BedDouble size={16}/>{property.bedrooms ?? 0}</span>
          <span className="flex items-center gap-1.5"><Bath size={16}/>{property.bathrooms ?? 0}</span>
          <span className="flex items-center gap-1.5"><CarFront size={16}/>{property.parking_spaces ?? 0}</span>
          <span className="flex items-center gap-1.5"><Ruler size={16}/>{property.area_m2 ?? 0} m²</span>
        </div>
      </div>
    </Link>
  );
}
'@

Write-NexoraFile 'src/components/ai-property-search.tsx' @'
"use client";

import { FormEvent, useState } from "react";
import { Bot, LoaderCircle, Search, Sparkles } from "lucide-react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property-card";

interface SearchResponse { answer: string; properties: Property[]; }

export function AIPropertySearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo realizar la búsqueda.");
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-3xl border border-cyan-300/20 bg-slate-900 p-3 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Bot className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400" size={22}/>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Ej: apartamento en Piantini, 3 habitaciones, menos de US$350,000..." className="h-16 w-full rounded-2xl border border-white/10 bg-slate-950 pl-14 pr-5 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"/>
          </div>
          <button disabled={loading} className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-8 font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" size={19}/> : <Search size={19}/>} Buscar con IA
          </button>
        </div>
      </form>
      {error && <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-950/30 p-4 text-red-200">{error}</div>}
      {result && <div className="mt-8">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-slate-200">
          <div className="mb-3 flex items-center gap-2 font-black text-cyan-300"><Sparkles size={18}/> NEXORA AI</div>
          <p className="leading-7">{result.answer}</p>
        </div>
        {result.properties.length > 0 && <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.properties.map((p)=><PropertyCard key={p.id} property={p}/>)}</div>}
      </div>}
    </div>
  );
}
'@

Write-NexoraFile 'src/components/auth-form.tsx' @'
"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const supabase = createClient();
    if (!supabase) { setMessage("Configura Supabase en .env.local."); setLoading(false); return; }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const companyName = String(form.get("company_name") ?? "");
    const fullName = String(form.get("full_name") ?? "");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { company_name: companyName || "Mi Inmobiliaria", full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Cuenta creada. Revisa tu correo si la confirmación está habilitada.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "No fue posible autenticar."); }
    finally { setLoading(false); }
  }

  return <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
    <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><LockKeyhole size={25}/></div>
    <h1 className="text-3xl font-black text-white">{mode === "login" ? "Acceso Nexora" : "Crear inmobiliaria"}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-400">CRM, propiedades, leads y operaciones en una sola plataforma.</p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      {mode === "signup" && <>
        <input name="company_name" required placeholder="Nombre de la inmobiliaria" className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"/>
        <input name="full_name" required placeholder="Tu nombre" className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"/>
      </>}
      <input name="email" type="email" required placeholder="Correo" className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"/>
      <input name="password" type="password" required minLength={8} placeholder="Contraseña" className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"/>
      {message && <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">{message}</div>}
      <button disabled={loading} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
        {loading && <LoaderCircle className="animate-spin" size={18}/>} {mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
    </form>
    <button onClick={()=>{setMessage(""); setMode(mode === "login" ? "signup" : "login");}} className="mt-6 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
      {mode === "login" ? "¿No tienes cuenta? Crear inmobiliaria" : "Ya tengo cuenta"}
    </button>
  </div>;
}
'@

Write-NexoraFile 'src/components/sign-out-button.tsx' @'
"use client";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }
  return <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><LogOut size={18}/> Salir</button>;
}
'@

Write-NexoraFile 'src/components/dashboard-nav.tsx' @'
import Link from "next/link";
import { Bot, Building2, CalendarDays, ChartNoAxesCombined, CircleDollarSign, ClipboardCheck, FileText, FolderKanban, Gauge, Hammer, House, Megaphone, ReceiptText, Settings, Users, WalletCards, WandSparkles } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const sections = [
  { href: "/dashboard", label: "Resumen", icon: Gauge },
  { href: "/dashboard/properties", label: "Propiedades", icon: Building2 },
  { href: "/dashboard/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/dashboard/leads", label: "CRM / Leads", icon: Users },
  { href: "/dashboard/tasks", label: "Tareas", icon: ClipboardCheck },
  { href: "/dashboard/appointments", label: "Citas", icon: CalendarDays },
  { href: "/dashboard/offers", label: "Ofertas", icon: ReceiptText },
  { href: "/dashboard/transactions", label: "Transacciones", icon: CircleDollarSign },
  { href: "/dashboard/commissions", label: "Comisiones", icon: WalletCards },
  { href: "/dashboard/rentals", label: "Alquileres", icon: House },
  { href: "/dashboard/maintenance", label: "Mantenimiento", icon: Hammer },
  { href: "/dashboard/documents", label: "Documentos", icon: FileText },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/analytics", label: "Analítica", icon: ChartNoAxesCombined },
  { href: "/dashboard/autopilot", label: "Autopilot", icon: WandSparkles },
  { href: "/#ai", label: "Nexora AI", icon: Bot },
];

export function DashboardNav() {
  return <aside className="bg-slate-950 p-5 text-white lg:min-h-screen">
    <Link href="/" className="flex items-center gap-3 px-3 py-4 font-black">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Building2 size={20}/></span> NEXORA
    </Link>
    <nav className="mt-6 space-y-1">{sections.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><Icon size={17}/>{label}</Link>)}</nav>
    <div className="mt-8 border-t border-white/10 pt-3">
      <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><Settings size={17}/> Ajustes</Link>
      <SignOutButton/>
    </div>
  </aside>;
}
'@

Write-NexoraFile 'src/components/inquiry-form.tsx' @'
"use client";
import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [loading,setLoading]=useState(false); const [success,setSuccess]=useState(false); const [error,setError]=useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(["name","email","phone","whatsapp","notes"].map((k)=>[k,String(form.get(k)??"")]));
    try {
      const r = await fetch("/api/leads", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,property_id:propertyId,source:"property-website"})});
      const d = await r.json(); if(!r.ok) throw new Error(d.error||"No fue posible enviar la solicitud.");
      setSuccess(true); e.currentTarget.reset();
    } catch(err){setError(err instanceof Error?err.message:"Error inesperado.");} finally{setLoading(false);}
  }
  if(success) return <div className="rounded-3xl bg-emerald-50 p-7 text-emerald-900"><CheckCircle2 className="mb-4" size={35}/><h3 className="text-xl font-black">Solicitud recibida</h3><p className="mt-2 text-sm leading-6">El lead ya quedó registrado en Nexora CRM.</p></div>;
  return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
    <div className="mb-6"><div className="flex items-center gap-2 text-cyan-700"><MessageCircle size={20}/><span className="text-sm font-black uppercase tracking-wider">Contactar agente</span></div><h3 className="mt-2 text-2xl font-black text-slate-950">¿Te interesa esta propiedad?</h3></div>
    <div className="space-y-3">
      <input required name="name" placeholder="Nombre completo" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="email" type="email" placeholder="Correo" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="phone" placeholder="Teléfono" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <input name="whatsapp" placeholder="WhatsApp" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500"/>
      <textarea name="notes" rows={4} placeholder="Mensaje..." className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-cyan-500"/>
    </div>
    {error&&<p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
    <button disabled={loading} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 font-bold text-white hover:bg-cyan-600 disabled:opacity-50">{loading&&<LoaderCircle className="animate-spin" size={17}/>} Solicitar información</button>
  </form>;
}
'@

Write-NexoraFile 'src/components/new-property-form.tsx' @'
"use client";
import { FormEvent, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";

export function NewPropertyForm() {
  const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage("");
    const f=new FormData(e.currentTarget);
    const text=(k:string)=>String(f.get(k)??"");
    const num=(k:string)=>Number(f.get(k)??0);
    const payload={title:text("title"),description:text("description"),operation:text("operation"),status:text("status"),property_type:text("property_type"),price:num("price"),currency:text("currency"),bedrooms:num("bedrooms"),bathrooms:num("bathrooms"),parking_spaces:num("parking_spaces"),area_m2:num("area_m2"),lot_m2:num("lot_m2"),sector:text("sector"),city:text("city"),province:text("province"),country:text("country"),image_url:text("image_url"),amenities:text("amenities").split(",").map(s=>s.trim()).filter(Boolean)};
    try{const r=await fetch("/api/properties",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"No fue posible crear la propiedad.");setMessage("Propiedad creada correctamente.");setTimeout(()=>window.location.href="/dashboard/properties",700);}catch(err){setMessage(err instanceof Error?err.message:"Error inesperado.");}finally{setLoading(false);}
  }
  const input="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500";
  return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="grid gap-5 md:grid-cols-2">
    <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Título</span><input required name="title" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Operación</span><select name="operation" className={input}><option value="sale">Venta</option><option value="rent">Alquiler</option><option value="short_rent">Renta corta</option></select></label>
    <label><span className="mb-2 block text-sm font-bold">Estado</span><select name="status" className={input}><option value="published">Publicada</option><option value="draft">Borrador</option></select></label>
    <label><span className="mb-2 block text-sm font-bold">Tipo</span><select name="property_type" className={input}>{["Apartamento","Casa","Villa","Solar","Local Comercial","Oficina","Penthouse","Finca","Nave industrial"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span className="mb-2 block text-sm font-bold">Precio</span><input required min="0" step="0.01" type="number" name="price" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Moneda</span><select name="currency" className={input}><option>USD</option><option>DOP</option><option>EUR</option></select></label>
    <label><span className="mb-2 block text-sm font-bold">Habitaciones</span><input min="0" type="number" name="bedrooms" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Baños</span><input min="0" step="0.5" type="number" name="bathrooms" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Parqueos</span><input min="0" type="number" name="parking_spaces" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Área m²</span><input min="0" type="number" name="area_m2" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Solar m²</span><input min="0" type="number" name="lot_m2" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Sector</span><input name="sector" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Ciudad</span><input name="city" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">Provincia</span><input name="province" className={input}/></label>
    <label><span className="mb-2 block text-sm font-bold">País</span><input name="country" defaultValue="República Dominicana" className={input}/></label>
    <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Amenidades separadas por coma</span><input name="amenities" placeholder="Piscina, gimnasio, lobby..." className={input}/></label>
    <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">URL imagen principal</span><input name="image_url" type="url" placeholder="https://..." className={input}/></label>
    <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Descripción</span><textarea name="description" rows={7} className="w-full rounded-xl border border-slate-200 p-4"/></label>
  </div>{message&&<div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-medium">{message}</div>}<button disabled={loading} className="mt-6 flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white hover:bg-cyan-600">{loading?<LoaderCircle className="animate-spin" size={18}/>:<Save size={18}/>} Guardar propiedad</button></form>;
}
'@

Write-NexoraFile 'src/components/crm-quick-create.tsx' @'
"use client";
import { FormEvent, useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";

export function CRMQuickCreate({ endpoint, fields, title }: { endpoint:string; title:string; fields:{name:string;label:string;type?:string;required?:boolean;placeholder?:string}[] }) {
  const [open,setOpen]=useState(false); const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");const f=new FormData(e.currentTarget);const payload=Object.fromEntries(fields.map(x=>[x.name,String(f.get(x.name)??"")]));try{const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"No se pudo guardar.");window.location.reload();}catch(err){setMessage(err instanceof Error?err.message:"Error inesperado.");}finally{setLoading(false);}}
  return <div><button onClick={()=>setOpen(v=>!v)} className="flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white"><Plus size={16}/>{title}</button>{open&&<form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">{fields.map(field=><label key={field.name}><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{field.label}</span><input name={field.name} type={field.type||"text"} required={field.required} placeholder={field.placeholder} className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-cyan-500"/></label>)}{message&&<p className="md:col-span-2 text-sm text-red-600">{message}</p>}<button disabled={loading} className="md:col-span-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 font-black text-slate-950">{loading&&<LoaderCircle className="animate-spin" size={16}/>}Guardar</button></form>}</div>;
}
'@

Write-NexoraFile 'src/app/globals.css' @'
@import "tailwindcss";
:root { --background:#ffffff; --foreground:#0f172a; }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--background); color:var(--foreground); font-family:Arial,Helvetica,sans-serif; }
button,input,textarea,select { font:inherit; }
::selection { background:#22d3ee; color:#020617; }
'@

Write-NexoraFile 'src/app/layout.tsx' @'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nexora Realty OS", template: "%s | Nexora Realty" },
  description: "AI-native real estate operating system for agencies, brokers, developers and property managers.",
  keywords: ["real estate", "inmobiliaria", "propiedades", "CRM inmobiliario", "AI real estate"],
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="es"><body>{children}</body></html>;
}
'@

Write-NexoraFile 'src/app/page.tsx' @'
import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, Building2, ChartNoAxesCombined, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { AIPropertySearch } from "@/components/ai-property-search";
import { getPublicProperties } from "@/lib/data";

export default async function HomePage() {
  const featured=(await getPublicProperties()).slice(0,6);
  const features=[
    [Building2,"Property Engine","Inventario centralizado para venta, alquiler, renta corta y proyectos."],
    [Users,"CRM Inteligente","Leads, pipeline, scoring, agentes, seguimiento y actividad comercial."],
    [BrainCircuit,"Nexora AI","Búsqueda conversacional, recomendaciones, scoring y valoración asistida."],
    [ChartNoAxesCombined,"Analytics","Indicadores comerciales, inventario, oportunidades y conversión."],
    [Bot,"Automation Ready","WhatsApp, email, webhooks y flujos comerciales automatizados."],
    [ShieldCheck,"Multi-Tenant","Organizaciones aisladas mediante autenticación y Row Level Security."],
  ] as const;

  return <><Navbar/><main>
    <section className="relative overflow-hidden bg-slate-950"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,.12),transparent_28%)]"/><div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36"><div className="max-w-4xl"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300"><Sparkles size={16}/> AI-Native Real Estate Operating System</div><h1 className="text-5xl font-black tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">Una inmobiliaria completa.<span className="block text-cyan-400">En un solo sistema.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl">Portal, propiedades, CRM, leads, proyectos, operaciones, alquileres, comisiones, marketing, analítica e inteligencia artificial.</p><div className="mt-9 flex flex-wrap gap-4"><Link href="/properties" className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 hover:bg-cyan-300">Explorar propiedades <ArrowRight size={18}/></Link><Link href="/dashboard" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white hover:bg-white/10">Abrir Nexora OS</Link></div></div></div></section>
    <section id="ai" className="bg-slate-950 pb-24"><div className="mx-auto max-w-7xl px-6"><p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Nexora Intelligence</p><h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Describe lo que buscas.</h2><p className="mt-3 mb-8 max-w-2xl text-slate-400">La búsqueda semántica combina inventario y razonamiento de IA sin inventar propiedades.</p><AIPropertySearch/></div></section>
    <section className="bg-slate-50 py-24"><div className="mx-auto max-w-7xl px-6"><div className="flex justify-between gap-5"><div><p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Inventario</p><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Propiedades destacadas</h2></div><Link href="/properties" className="font-bold text-cyan-700">Ver todas →</Link></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{featured.map(p=><PropertyCard key={p.id} property={p}/>)}</div></div></section>
    <section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-700">Real Estate OS</p><h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">No es otro CRM. Es la operación completa.</h2></div><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,description])=><div key={title} className="rounded-3xl border border-slate-200 p-7"><div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon size={22}/></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-slate-500">{description}</p></div>)}</div></div></section>
  </main></>;
}
'@

Write-NexoraFile 'src/app/properties/page.tsx' @'
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { getPublicProperties } from "@/lib/data";

export default async function PropertiesPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const params=await searchParams; const q=params.q?.trim()??""; const properties=await getPublicProperties(q);
  return <><Navbar/><main className="min-h-screen bg-slate-50"><section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-7xl px-6"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>Inicio</Link><h1 className="text-4xl font-black md:text-6xl">Propiedades</h1><form className="mt-8 flex max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white"><Search className="ml-5 self-center text-slate-400" size={20}/><input name="q" defaultValue={q} placeholder="Ciudad, sector, tipo de propiedad..." className="h-15 flex-1 px-4 text-slate-950 outline-none"/><button className="bg-cyan-400 px-7 font-black text-slate-950">Buscar</button></form></div></section><section className="mx-auto max-w-7xl px-6 py-14"><p className="mb-8 text-sm font-bold text-slate-500">{properties.length} resultados</p>{properties.length===0?<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><h2 className="text-2xl font-black">No encontramos propiedades</h2><p className="mt-2 text-slate-500">Intenta con otra ciudad, sector o tipo.</p></div>:<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map(p=><PropertyCard key={p.id} property={p}/>)}</div>}</section></main></>;
}
'@

Write-NexoraFile 'src/app/properties/[slug]/page.tsx' @'
import { Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { InquiryForm } from "@/components/inquiry-form";
import { getPropertyBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function PropertyPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const property=await getPropertyBySlug(slug); if(!property)notFound();
  const mainImage=[...(property.property_images??[])].sort((a,b)=>(a.position??0)-(b.position??0))[0]?.url??"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";
  const Feature=({icon,value}:{icon:React.ReactNode;value:string})=><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">{icon}{value}</div>;
  return <><Navbar/><main className="min-h-screen bg-slate-50"><div className="h-[52vh] min-h-[420px] bg-slate-900"><img src={mainImage} alt={property.title} className="h-full w-full object-cover"/></div><div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]"><section><div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase text-white">{property.operation==="sale"?"Venta":property.operation==="rent"?"Alquiler":"Renta corta"}</span><span className="rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-black uppercase text-cyan-900">{property.property_type}</span></div><h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{property.title}</h1><div className="mt-4 flex items-center gap-2 text-slate-500"><MapPin size={19}/>{[property.sector,property.city,property.province].filter(Boolean).join(", ")}</div><p className="mt-6 text-4xl font-black text-cyan-700">{formatCurrency(property.price,property.currency)}</p><div className="mt-8 flex flex-wrap gap-4"><Feature icon={<BedDouble/>} value={`${property.bedrooms??0} habitaciones`}/><Feature icon={<Bath/>} value={`${property.bathrooms??0} baños`}/><Feature icon={<CarFront/>} value={`${property.parking_spaces??0} parqueos`}/><Feature icon={<Ruler/>} value={`${property.area_m2??0} m²`}/></div><div className="mt-10 rounded-3xl bg-white p-7 shadow-sm"><h2 className="text-2xl font-black">Descripción</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{property.description||"Propiedad disponible dentro del inventario Nexora Realty."}</p>{property.amenities?.length?<div className="mt-7 flex flex-wrap gap-2">{property.amenities.map(a=><span key={a} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold">{a}</span>)}</div>:null}</div></section><aside>{property.id.startsWith("demo-")?<div className="rounded-3xl bg-slate-950 p-7 text-white"><h3 className="text-2xl font-black">Propiedad demostrativa</h3><p className="mt-3 leading-7 text-slate-400">Conecta Supabase y publica inventario real para activar captura automática de leads.</p></div>:<InquiryForm propertyId={property.id}/>}</aside></div></main></>;
}
'@

Write-NexoraFile 'src/app/projects/page.tsx' @'
import { Navbar } from "@/components/navbar";
import { getPublicProjects } from "@/lib/data";
import { Building2, MapPin } from "lucide-react";

export default async function ProjectsPage(){const projects=await getPublicProjects();return <><Navbar/><main className="min-h-screen bg-slate-50"><section className="bg-slate-950 py-20 text-white"><div className="mx-auto max-w-7xl px-6"><p className="text-sm font-black uppercase tracking-[.2em] text-cyan-400">Developer Hub</p><h1 className="mt-3 text-5xl font-black">Proyectos inmobiliarios</h1></div></section><section className="mx-auto max-w-7xl px-6 py-14">{projects.length===0?<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><Building2 className="mx-auto text-slate-300" size={42}/><h2 className="mt-4 text-2xl font-black">Todavía no hay proyectos publicados</h2><p className="mt-2 text-slate-500">Los proyectos y sus unidades aparecerán aquí.</p></div>:<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.map((p:any)=><article key={p.id} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-cyan-700">{p.developers?.name||"Desarrollador"}</p><h2 className="mt-2 text-2xl font-black">{p.name}</h2><p className="mt-3 flex items-center gap-2 text-slate-500"><MapPin size={16}/>{[p.sector,p.city].filter(Boolean).join(", ")}</p><p className="mt-5 text-sm text-slate-600">{p.project_units?.length??0} unidades registradas</p></article>)}</div>}</section></main></>}
'@

Write-NexoraFile 'src/app/login/page.tsx' @'
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
export default function LoginPage(){return <main className="min-h-screen bg-slate-950 px-6 py-12"><div className="mx-auto max-w-7xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/>Volver</Link><div className="grid min-h-[80vh] place-items-center"><AuthForm/></div></div></main>}
'@

Write-NexoraFile 'src/app/auth/callback/route.ts' @'
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request:Request){const url=new URL(request.url);const code=url.searchParams.get("code");if(code){const supabase=await createClient();if(supabase)await supabase.auth.exchangeCodeForSession(code);}return NextResponse.redirect(`${url.origin}/dashboard`);}
'@

Write-NexoraFile 'src/app/dashboard/layout.tsx' @'
import { DashboardNav } from "@/components/dashboard-nav";
export default function DashboardLayout({children}:{children:React.ReactNode}){return <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[265px_1fr]"><DashboardNav/><main className="min-w-0 p-5 md:p-8 lg:p-10">{children}</main></div>}
'@

Write-NexoraFile 'src/app/dashboard/page.tsx' @'
import { Building2, CalendarDays, CircleDollarSign, ClipboardCheck, Flame, FolderKanban, House, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage(){let auth=null;try{auth=await requireUser()}catch{};const counts={properties:0,leads:0,hot:0,tasks:0,appointments:0,transactions:0,projects:0,leases:0};if(auth){const s=auth.supabase;const results=await Promise.all([
  s.from("properties").select("*",{count:"exact",head:true}),s.from("leads").select("*",{count:"exact",head:true}),s.from("leads").select("*",{count:"exact",head:true}).gte("score",70),s.from("tasks").select("*",{count:"exact",head:true}).eq("completed",false),s.from("appointments").select("*",{count:"exact",head:true}),s.from("transactions").select("*",{count:"exact",head:true}),s.from("projects").select("*",{count:"exact",head:true}),s.from("leases").select("*",{count:"exact",head:true}).eq("status","active")]);
  [counts.properties,counts.leads,counts.hot,counts.tasks,counts.appointments,counts.transactions,counts.projects,counts.leases]=results.map(r=>r.count??0);
}
const cards=[["Propiedades",counts.properties,Building2],["Leads",counts.leads,Users],["Hot Leads",counts.hot,Flame],["Tareas",counts.tasks,ClipboardCheck],["Citas",counts.appointments,CalendarDays],["Transacciones",counts.transactions,CircleDollarSign],["Proyectos",counts.projects,FolderKanban],["Alquileres",counts.leases,House]] as const;
return <div><p className="text-sm font-bold text-cyan-700">NEXORA COMMAND CENTER</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Dashboard</h1><p className="mt-2 text-slate-500">{auth?.fullName||"Modo demostración"}</p><div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{cards.map(([title,value,Icon])=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{title}</p><Icon className="text-cyan-600"/></div><p className="mt-5 text-4xl font-black">{value}</p></div>)}</div><div className="mt-8 grid gap-6 xl:grid-cols-2"><div className="rounded-3xl bg-slate-950 p-7 text-white"><p className="text-sm font-black uppercase tracking-[.18em] text-cyan-300">Nexora AI</p><h2 className="mt-3 text-2xl font-black">Inteligencia comercial</h2><p className="mt-3 leading-7 text-slate-400">Búsqueda, scoring, valoración, marketing y priorización de prospectos con IA.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-7"><p className="text-sm font-black uppercase tracking-[.18em] text-cyan-700">Pipeline</p><h2 className="mt-3 text-2xl font-black">Operación inmobiliaria</h2><div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm">{["Nuevo","Calificado","Visita","Oferta","Negociación","Cerrado"].map(x=><div key={x} className="rounded-xl bg-slate-100 px-3 py-4 font-bold">{x}</div>)}</div></div></div></div>}
'@

Write-NexoraFile 'src/app/dashboard/properties/page.tsx' @'
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("properties").select("*").order("created_at",{ascending:false});return <div><div className="flex justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">Inventario</p><h1 className="mt-2 text-4xl font-black">Propiedades</h1></div><Link href="/dashboard/properties/new" className="flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white"><Plus size={18}/>Nueva propiedad</Link></div><div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"><table className="w-full min-w-[800px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Propiedad</th><th className="px-5 py-4">Ciudad</th><th className="px-5 py-4">Precio</th><th className="px-5 py-4">Estado</th></tr></thead><tbody>{data.map((p:any)=><tr key={p.id} className="border-t border-slate-100"><td className="px-5 py-4 font-bold">{p.title}</td><td className="px-5 py-4 text-slate-500">{p.city||"-"}</td><td className="px-5 py-4 font-bold">{formatCurrency(p.price,p.currency)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{p.status}</span></td></tr>)}</tbody></table>{data.length===0&&<div className="p-10 text-center text-slate-500">Crea tu primera propiedad.</div>}</div></div>}
'@

Write-NexoraFile 'src/app/dashboard/properties/new/page.tsx' @'
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewPropertyForm } from "@/components/new-property-form";
export default function Page(){return <div className="mx-auto max-w-5xl"><Link href="/dashboard/properties" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>Propiedades</Link><h1 className="mt-5 text-4xl font-black">Nueva propiedad</h1><p className="mt-2 text-slate-500">Registra un inmueble en el inventario central.</p><div className="mt-8"><NewPropertyForm/></div></div>}
'@

Write-NexoraFile 'src/app/dashboard/leads/page.tsx' @'
import { Flame } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CRMQuickCreate } from "@/components/crm-quick-create";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("leads").select("*").order("created_at",{ascending:false}).limit(300);return <div><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">CRM</p><h1 className="mt-2 text-4xl font-black">Leads</h1><p className="mt-2 text-slate-500">Prospectos, puntuación e intención comercial.</p></div><CRMQuickCreate endpoint="/api/leads" title="Nuevo lead" fields={[{name:"name",label:"Nombre",required:true},{name:"email",label:"Correo",type:"email"},{name:"phone",label:"Teléfono"},{name:"whatsapp",label:"WhatsApp"},{name:"source",label:"Fuente",placeholder:"manual"},{name:"notes",label:"Notas"}]}/></div><div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Lead</th><th className="px-5 py-4">Contacto</th><th className="px-5 py-4">Fuente</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Estado</th></tr></thead><tbody>{data.map((l:any)=><tr key={l.id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-black">{l.name}</p><p className="text-sm text-slate-500">{l.email||"-"}</p></td><td className="px-5 py-4">{l.whatsapp||l.phone||"-"}</td><td className="px-5 py-4 text-slate-500">{l.source}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 font-black">{l.score>=70&&<Flame size={15} className="text-orange-500"/>}{l.score}</span></td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{l.status}</span></td></tr>)}</tbody></table>{data.length===0&&<div className="p-10 text-center text-slate-500">Todavía no hay leads.</div>}</div></div>}
'@

Write-NexoraFile 'src/components/module-table.tsx' @'
export function ModuleTable({title,subtitle,columns,rows}:{title:string;subtitle:string;columns:{key:string;label:string}[];rows:Record<string,unknown>[]}){return <div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">NEXORA OS</p><h1 className="mt-2 text-4xl font-black">{title}</h1><p className="mt-2 text-slate-500">{subtitle}</p><div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{columns.map(c=><th key={c.key} className="px-5 py-4">{c.label}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={String(row.id??i)} className="border-t border-slate-100">{columns.map(c=><td key={c.key} className="px-5 py-4">{String(row[c.key]??"-")}</td>)}</tr>)}</tbody></table></div>{rows.length===0&&<div className="p-10 text-center text-slate-500">Sin registros todavía.</div>}</div></div>}
'@

Write-NexoraFile 'src/app/dashboard/tasks/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("tasks").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Tareas" subtitle="Seguimiento comercial y operativo." columns={[{key:"title",label:"Title"},{key:"due_at",label:"Due At"},{key:"completed",label:"Completed"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/appointments/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("appointments").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Citas y visitas" subtitle="Agenda de clientes y propiedades." columns={[{key:"scheduled_at",label:"Scheduled At"},{key:"status",label:"Status"},{key:"notes",label:"Notes"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/offers/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("offers").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Ofertas" subtitle="Propuestas comerciales de compradores." columns={[{key:"amount",label:"Amount"},{key:"currency",label:"Currency"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/transactions/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("transactions").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Transacciones" subtitle="Operaciones desde negociación hasta cierre." columns={[{key:"transaction_type",label:"Transaction Type"},{key:"status",label:"Status"},{key:"sale_price",label:"Sale Price"},{key:"currency",label:"Currency"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/commissions/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("commissions").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Comisiones" subtitle="Distribución y pago de comisiones." columns={[{key:"amount",label:"Amount"},{key:"currency",label:"Currency"},{key:"status",label:"Status"},{key:"paid_at",label:"Paid At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/rentals/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("leases").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Alquileres" subtitle="Contratos, rentas y vencimientos." columns={[{key:"tenant_name",label:"Tenant Name"},{key:"monthly_rent",label:"Monthly Rent"},{key:"currency",label:"Currency"},{key:"status",label:"Status"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/maintenance/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("maintenance_requests").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Mantenimiento" subtitle="Incidencias y órdenes de mantenimiento." columns={[{key:"title",label:"Title"},{key:"priority",label:"Priority"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/documents/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("documents").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Documentos" subtitle="Data room de operaciones y propiedades." columns={[{key:"name",label:"Name"},{key:"category",label:"Category"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/marketing/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("marketing_campaigns").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Marketing" subtitle="Campañas y contenido multicanal." columns={[{key:"name",label:"Name"},{key:"channel",label:"Channel"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/projects/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { ModuleTable } from "@/components/module-table";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("projects").select("*").order("created_at",{ascending:false}).limit(300);return <ModuleTable title="Proyectos" subtitle="Constructoras, proyectos y unidades." columns={[{key:"name",label:"Name"},{key:"city",label:"City"},{key:"status",label:"Status"},{key:"created_at",label:"Created At"}]} rows={data as Record<string,unknown>[]}/>}
'@

Write-NexoraFile 'src/app/dashboard/analytics/page.tsx' @'
import { requireUser } from "@/lib/auth";
export default async function Page(){const {supabase}=await requireUser();const [p,l,t,o]=await Promise.all([supabase.from("properties").select("price,status,city"),supabase.from("leads").select("score,status,source"),supabase.from("transactions").select("sale_price,status,currency"),supabase.from("offers").select("amount,status,currency")]);const properties=p.data??[],leads=l.data??[],transactions=t.data??[],offers=o.data??[];const value=transactions.filter((x:any)=>x.status==="closed").reduce((s:number,x:any)=>s+Number(x.sale_price||0),0);const avgScore=leads.length?Math.round(leads.reduce((s:number,x:any)=>s+Number(x.score||0),0)/leads.length):0;return <div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">Business Intelligence</p><h1 className="mt-2 text-4xl font-black">Analítica</h1><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{[["Inventario",properties.length],["Leads",leads.length],["Score promedio",avgScore],["Volumen cerrado",value.toLocaleString("en-US")]].map(([k,v])=><div key={String(k)} className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm font-bold text-slate-500">{k}</p><p className="mt-4 text-4xl font-black">{v}</p></div>)}</div><div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">Embudo</h2><div className="mt-6 grid gap-3 md:grid-cols-4">{["new","qualified","offer","won"].map(s=><div key={s} className="rounded-2xl bg-slate-100 p-5"><p className="text-sm font-bold text-slate-500">{s}</p><p className="mt-2 text-3xl font-black">{leads.filter((x:any)=>x.status===s).length}</p></div>)}</div></div></div>}
'@

Write-NexoraFile 'src/app/dashboard/settings/page.tsx' @'
import { requireUser } from "@/lib/auth";
export default async function Page(){const {supabase,organizationId}=await requireUser();const {data}=await supabase.from("organizations").select("*").eq("id",organizationId).single();return <div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">Configuración</p><h1 className="mt-2 text-4xl font-black">Ajustes</h1><div className="mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">Organización</h2><dl className="mt-6 grid gap-5 md:grid-cols-2"><div><dt className="text-xs font-bold uppercase text-slate-500">Nombre</dt><dd className="mt-1 font-semibold">{data?.name||"-"}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Moneda</dt><dd className="mt-1 font-semibold">{data?.default_currency||"USD"}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">País</dt><dd className="mt-1 font-semibold">{data?.country||"-"}</dd></div><div><dt className="text-xs font-bold uppercase text-slate-500">Plan</dt><dd className="mt-1 font-semibold">{data?.plan||"starter"}</dd></div></dl></div></div>}
'@

Write-NexoraFile 'src/app/api/health/route.ts' @'
import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({name:"Nexora Realty OS",status:"ok",timestamp:new Date().toISOString(),services:{supabase:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),openai:Boolean(process.env.OPENAI_API_KEY),whatsapp:Boolean(process.env.META_WHATSAPP_TOKEN),email:Boolean(process.env.RESEND_API_KEY)}})}
'@

Write-NexoraFile 'src/app/api/properties/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema=z.object({title:z.string().min(3).max(180),description:z.string().max(12000).optional().default(""),operation:z.enum(["sale","rent","short_rent"]),status:z.enum(["draft","published"]),property_type:z.string().min(2).max(80),price:z.number().nonnegative(),currency:z.string().length(3),bedrooms:z.number().nonnegative().optional(),bathrooms:z.number().nonnegative().optional(),parking_spaces:z.number().nonnegative().optional(),area_m2:z.number().nonnegative().optional(),lot_m2:z.number().nonnegative().optional(),sector:z.string().max(120).optional(),city:z.string().max(120).optional(),province:z.string().max(120).optional(),country:z.string().max(120).optional(),image_url:z.string().url().or(z.literal("")).optional(),amenities:z.array(z.string().max(80)).max(50).optional()});
export async function GET(){try{const {supabase}=await requireUser();const {data,error}=await supabase.from("properties").select(`*,property_images(*)`).order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({properties:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:401})}}
export async function POST(request:NextRequest){try{const auth=await requireUser();const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:parsed.error.issues.map(i=>i.message).join(", ")},{status:400});const {image_url,...input}=parsed.data;const slug=`${slugify(input.title)}-${Date.now().toString().slice(-7)}`;const {data:property,error}=await auth.supabase.from("properties").insert({...input,organization_id:auth.organizationId,agent_id:auth.userId,slug,published_at:input.status==="published"?new Date().toISOString():null}).select("*").single();if(error)throw error;if(image_url){const {error:imageError}=await auth.supabase.from("property_images").insert({organization_id:auth.organizationId,property_id:property.id,url:image_url,position:0});if(imageError)console.error(imageError.message);}return NextResponse.json({property},{status:201});}catch(e){const msg=e instanceof Error?e.message:"Error interno";return NextResponse.json({error:msg},{status:msg==="UNAUTHORIZED"?401:500})}}
'@

Write-NexoraFile 'src/app/api/properties/[id]/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const patch=z.object({title:z.string().min(3).max(180).optional(),description:z.string().max(12000).optional(),status:z.enum(["draft","published","reserved","sold","rented","archived"]).optional(),price:z.number().nonnegative().optional(),featured:z.boolean().optional(),city:z.string().max(120).optional(),sector:z.string().max(120).optional(),amenities:z.array(z.string()).optional()});
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const {supabase,organizationId}=await requireUser();const parsed=patch.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await supabase.from("properties").update(parsed.data).eq("id",id).eq("organization_id",organizationId).select("*").single();if(error)throw error;return NextResponse.json({property:data});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const {supabase,organizationId}=await requireUser();const {error}=await supabase.from("properties").delete().eq("id",id).eq("organization_id",organizationId);if(error)throw error;return NextResponse.json({success:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/leads/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOptionalUser } from "@/lib/auth";

const schema=z.object({property_id:z.string().uuid().optional(),name:z.string().min(2).max(150),email:z.string().email().or(z.literal("")).optional(),phone:z.string().max(50).optional(),whatsapp:z.string().max(50).optional(),notes:z.string().max(3000).optional(),source:z.string().max(100).optional().default("manual"),budget_min:z.coerce.number().nonnegative().optional(),budget_max:z.coerce.number().nonnegative().optional()});
function scoreLead(d:z.infer<typeof schema>){let score=25;if(d.phone)score+=10;if(d.whatsapp)score+=15;if(d.email)score+=10;if(d.budget_max)score+=15;if((d.notes?.length??0)>30)score+=10;return Math.min(score,100)}
export async function GET(){try{const auth=await getOptionalUser();if(!auth)return NextResponse.json({error:"No autorizado"},{status:401});const {data,error}=await auth.supabase.from("leads").select("*").order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({leads:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function POST(req:NextRequest){try{const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:"Datos del prospecto inválidos."},{status:400});const d=parsed.data;const auth=await getOptionalUser();let organizationId:string;let assignedAgentId:string|null=null;let db:any;
if(auth){organizationId=auth.organizationId;assignedAgentId=auth.userId;db=auth.supabase;}else{if(!d.property_id)return NextResponse.json({error:"property_id es requerido para formularios públicos."},{status:400});const admin=createAdminClient();if(!admin)return NextResponse.json({error:"Supabase Admin no configurado."},{status:503});const {data:property,error}=await admin.from("properties").select("organization_id,agent_id,status").eq("id",d.property_id).eq("status","published").single();if(error||!property)return NextResponse.json({error:"Propiedad no encontrada."},{status:404});organizationId=property.organization_id;assignedAgentId=property.agent_id;db=admin;}
const {data:lead,error}=await db.from("leads").insert({organization_id:organizationId,property_id:d.property_id??null,assigned_agent_id:assignedAgentId,name:d.name,email:d.email||null,phone:d.phone||null,whatsapp:d.whatsapp||null,notes:d.notes||null,source:d.source||"manual",budget_min:d.budget_min??null,budget_max:d.budget_max??null,score:scoreLead(d),status:"new"}).select("*").single();if(error)throw error;await db.from("lead_events").insert({organization_id:organizationId,lead_id:lead.id,event_type:"lead_created",metadata:{source:d.source,property_id:d.property_id??null}});return NextResponse.json({lead},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error interno"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/leads/[id]/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({status:z.enum(["new","contacted","qualified","appointment","visit","offer","negotiation","won","lost"]).optional(),score:z.number().int().min(0).max(100).optional(),assigned_agent_id:z.string().uuid().nullable().optional(),notes:z.string().max(5000).optional()});
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const auth=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await auth.supabase.from("leads").update({...p.data,last_contact_at:new Date().toISOString()}).eq("id",id).eq("organization_id",auth.organizationId).select("*").single();if(error)throw error;return NextResponse.json({lead:data});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/tasks/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({title:z.string().min(2).max(200),description:z.string().max(2000).optional(),due_at:z.string().optional(),lead_id:z.string().uuid().optional(),property_id:z.string().uuid().optional()});
export async function GET(){try{const a=await requireUser();const {data,error}=await a.supabase.from("tasks").select("*").order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({tasks:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("tasks").insert({...p.data,organization_id:a.organizationId,assigned_to:a.userId,due_at:p.data.due_at||null}).select("*").single();if(error)throw error;return NextResponse.json({task:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/appointments/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({scheduled_at:z.string(),duration_minutes:z.coerce.number().int().min(15).max(480).optional().default(60),notes:z.string().max(2000).optional(),lead_id:z.string().uuid().optional(),property_id:z.string().uuid().optional()});
export async function GET(){try{const a=await requireUser();const {data,error}=await a.supabase.from("appointments").select("*").order("scheduled_at",{ascending:true});if(error)throw error;return NextResponse.json({appointments:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("appointments").insert({...p.data,organization_id:a.organizationId,agent_id:a.userId,status:"scheduled"}).select("*").single();if(error)throw error;return NextResponse.json({appointment:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/offers/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({property_id:z.string().uuid(),lead_id:z.string().uuid().optional(),amount:z.coerce.number().positive(),currency:z.string().length(3).default("USD"),notes:z.string().max(3000).optional()});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("offers").insert({...p.data,organization_id:a.organizationId,agent_id:a.userId,status:"submitted"}).select("*").single();if(error)throw error;return NextResponse.json({offer:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/transactions/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({property_id:z.string().uuid(),lead_id:z.string().uuid().optional(),transaction_type:z.enum(["sale","rent"]),sale_price:z.coerce.number().nonnegative().optional(),currency:z.string().length(3).default("USD"),commission_rate:z.coerce.number().min(0).max(100).optional(),expected_close_at:z.string().optional()});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data,error}=await a.supabase.from("transactions").insert({...p.data,organization_id:a.organizationId,agent_id:a.userId,status:"open"}).select("*").single();if(error)throw error;return NextResponse.json({transaction:data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/ai/search/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicProperties } from "@/lib/data";
import type { Property } from "@/lib/types";
import { formatCurrency, normalizeText } from "@/lib/utils";
import { getModel, getOpenAI } from "@/lib/ai";
const schema=z.object({query:z.string().min(3).max(600)});
function score(query:string,p:Property){const tokens=normalizeText(query).split(/\s+/).filter(x=>x.length>=3);const hay=normalizeText([p.title,p.description,p.property_type,p.city,p.sector,p.province,p.country,p.bedrooms,p.bathrooms,p.area_m2,p.price,...(p.amenities??[])].filter(Boolean).join(" "));let s=0;for(const t of tokens)if(hay.includes(t))s++;if(p.featured)s+=.2;return s;}
export async function POST(req:NextRequest){try{const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:"Consulta inválida."},{status:400});const inventory=await getPublicProperties();const ranked=inventory.map(p=>({p,s:score(parsed.data.query,p)})).sort((a,b)=>b.s-a.s);const useful=ranked.some(x=>x.s>0);const selected=(useful?ranked.filter(x=>x.s>0):ranked).slice(0,8).map(x=>x.p);const ai=getOpenAI();if(!ai)return NextResponse.json({answer:selected.length?`Encontré ${selected.length} opciones potenciales. Configura OPENAI_API_KEY para activar el análisis conversacional avanzado.`:"No encontré propiedades compatibles.",properties:selected});const context=selected.map((p,i)=>`${i+1}. ${p.title}\nUbicación: ${[p.sector,p.city,p.province].filter(Boolean).join(", ")}\nPrecio: ${formatCurrency(p.price,p.currency)}\nTipo: ${p.property_type}\nHabitaciones: ${p.bedrooms??"N/D"}\nBaños: ${p.bathrooms??"N/D"}\nÁrea: ${p.area_m2??"N/D"} m2\nAmenidades: ${(p.amenities??[]).join(", ")}`).join("\n\n");const response=await ai.responses.create({model:getModel(),input:`Eres Nexora AI, especialista en búsqueda inmobiliaria.\n\nCONSULTA:\n${parsed.data.query}\n\nINVENTARIO:\n${context||"Sin inventario"}\n\nResponde en español, máximo 180 palabras. No inventes propiedades, disponibilidad, rentabilidad ni datos ausentes. Explica qué opciones se acercan más y qué criterios no pueden verificarse.`});return NextResponse.json({answer:response.output_text||"Inventario analizado.",properties:selected});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"No fue posible procesar la búsqueda."},{status:500})}}
'@

Write-NexoraFile 'src/app/api/ai/lead-score/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getModel, getOpenAI } from "@/lib/ai";
const schema=z.object({lead_id:z.string().uuid()});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"lead_id inválido"},{status:400});const {data:lead,error}=await a.supabase.from("leads").select("*,lead_events(*)").eq("id",p.data.lead_id).single();if(error||!lead)return NextResponse.json({error:"Lead no encontrado"},{status:404});let score=Number(lead.score||0);let reason="Scoring heurístico";const ai=getOpenAI();if(ai){const r=await ai.responses.create({model:getModel(),input:`Evalúa la intención comercial de este lead inmobiliario de 0 a 100. Devuelve SOLO JSON válido con {"score":numero,"reason":"texto corto"}. No inventes hechos. Datos: ${JSON.stringify(lead)}`});try{const parsed=JSON.parse(r.output_text);score=Math.max(0,Math.min(100,Number(parsed.score)||score));reason=String(parsed.reason||reason).slice(0,500);}catch{}}
await a.supabase.from("leads").update({score}).eq("id",lead.id);await a.supabase.from("lead_events").insert({organization_id:a.organizationId,lead_id:lead.id,event_type:"ai_scored",metadata:{score,reason}});return NextResponse.json({score,reason});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/ai/valuation/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getModel, getOpenAI } from "@/lib/ai";
const schema=z.object({property_id:z.string().uuid()});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"property_id inválido"},{status:400});const {data:property,error}=await a.supabase.from("properties").select("*").eq("id",p.data.property_id).single();if(error||!property)return NextResponse.json({error:"Propiedad no encontrada"},{status:404});const {data:comparables=[]}=await a.supabase.from("properties").select("id,title,price,currency,area_m2,city,sector,property_type,bedrooms,bathrooms").neq("id",property.id).eq("status","published").eq("city",property.city).limit(30);const sameCurrency=comparables.filter((x:any)=>x.currency===property.currency&&Number(x.area_m2)>0);const ppm=sameCurrency.map((x:any)=>Number(x.price)/Number(x.area_m2)).filter(Number.isFinite);const median=ppm.sort((x:number,y:number)=>x-y)[Math.floor(ppm.length/2)]||0;let estimate=median&&property.area_m2?median*Number(property.area_m2):Number(property.price);let low=estimate*.92,high=estimate*1.08,notes=`Estimación basada en ${ppm.length} comparables internos.`;const ai=getOpenAI();if(ai){const r=await ai.responses.create({model:getModel(),input:`Actúa como analista inmobiliario. Usa SOLO los datos adjuntos. No presentes la estimación como tasación certificada. Propiedad: ${JSON.stringify(property)}. Comparables: ${JSON.stringify(comparables)}. Devuelve SOLO JSON {"estimate":number,"low":number,"high":number,"notes":"texto"}.`});try{const x=JSON.parse(r.output_text);estimate=Number(x.estimate)||estimate;low=Number(x.low)||low;high=Number(x.high)||high;notes=String(x.notes||notes).slice(0,1200);}catch{}}
const {data:valuation,error:ve}=await a.supabase.from("valuations").insert({organization_id:a.organizationId,property_id:property.id,estimate,low_estimate:low,high_estimate:high,currency:property.currency,method:"internal-comparables-ai",notes}).select("*").single();if(ve)throw ve;return NextResponse.json({valuation,comparables_used:ppm.length});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/ai/marketing/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getModel, getOpenAI } from "@/lib/ai";
const schema=z.object({property_id:z.string().uuid(),channel:z.enum(["instagram","facebook","tiktok","youtube","email","whatsapp","web"])});
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const {data:property,error}=await a.supabase.from("properties").select("*").eq("id",p.data.property_id).single();if(error||!property)return NextResponse.json({error:"Propiedad no encontrada"},{status:404});const ai=getOpenAI();if(!ai)return NextResponse.json({error:"OPENAI_API_KEY no configurado"},{status:503});const r=await ai.responses.create({model:getModel(),input:`Genera copy inmobiliario profesional en español para ${p.data.channel}. Usa únicamente estos datos: ${JSON.stringify(property)}. No inventes amenidades, distancias, rentabilidad o permisos. Incluye CTA. Devuelve texto listo para publicar.`});return NextResponse.json({content:r.output_text});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/media/upload/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function POST(req:NextRequest){try{const a=await requireUser();const form=await req.formData();const file=form.get("file");const propertyId=String(form.get("property_id")||"");if(!(file instanceof File))return NextResponse.json({error:"Archivo requerido"},{status:400});if(file.size>15*1024*1024)return NextResponse.json({error:"Máximo 15 MB"},{status:413});if(!file.type.startsWith("image/"))return NextResponse.json({error:"Solo imágenes"},{status:400});const admin=createAdminClient();if(!admin)return NextResponse.json({error:"Admin Supabase no configurado"},{status:503});const ext=file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g,"")||"jpg";const path=`${a.organizationId}/${propertyId||"general"}/${crypto.randomUUID()}.${ext}`;const {error}=await admin.storage.from("property-media").upload(path,await file.arrayBuffer(),{contentType:file.type,upsert:false});if(error)throw error;const {data}=admin.storage.from("property-media").getPublicUrl(path);if(propertyId)await admin.from("property_images").insert({organization_id:a.organizationId,property_id:propertyId,url:data.publicUrl,position:0});return NextResponse.json({url:data.publicUrl,path});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/integrations/whatsapp/webhook/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(req:NextRequest){const mode=req.nextUrl.searchParams.get("hub.mode");const token=req.nextUrl.searchParams.get("hub.verify_token");const challenge=req.nextUrl.searchParams.get("hub.challenge");if(mode==="subscribe"&&token&&token===process.env.META_WHATSAPP_VERIFY_TOKEN)return new NextResponse(challenge,{status:200});return new NextResponse("Forbidden",{status:403});}
export async function POST(req:NextRequest){try{const body=await req.json();const admin=createAdminClient();if(admin){for(const entry of body.entry??[]){for(const change of entry.changes??[]){const value=change.value??{};const phoneNumberId=String(value.metadata?.phone_number_id??"");let organizationId:string|null=null;if(phoneNumberId){const {data:integration}=await admin.from("integrations").select("organization_id").eq("provider","whatsapp").eq("external_account_id",phoneNumberId).eq("status","active").maybeSingle();organizationId=integration?.organization_id??null;}for(const message of value.messages??[]){await admin.from("inbound_messages").insert({organization_id:organizationId,channel:"whatsapp",external_id:message.id||null,from_address:message.from||null,payload:message,received_at:new Date().toISOString()});}}}}return NextResponse.json({received:true});}catch{return NextResponse.json({received:true})}}
'@

Write-NexoraFile 'src/app/api/integrations/whatsapp/send/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({to:z.string().min(8).max(30),text:z.string().min(1).max(4096)});
export async function POST(req:NextRequest){try{await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});const token=process.env.META_WHATSAPP_TOKEN,id=process.env.META_WHATSAPP_PHONE_NUMBER_ID,version=process.env.META_GRAPH_VERSION;if(!token||!id||!version)return NextResponse.json({error:"WhatsApp no configurado: token, phone number id y graph version son requeridos"},{status:503});const r=await fetch(`https://graph.facebook.com/${version}/${id}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:p.data.to,type:"text",text:{body:p.data.text}})});const data=await r.json();return NextResponse.json(data,{status:r.ok?200:r.status});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/integrations/email/send/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
const schema=z.object({to:z.string().email(),subject:z.string().min(1).max(200),html:z.string().min(1).max(50000)});
export async function POST(req:NextRequest){try{await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"Datos inválidos"},{status:400});if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM_EMAIL)return NextResponse.json({error:"Resend no configurado"},{status:503});const resend=new Resend(process.env.RESEND_API_KEY);const {data,error}=await resend.emails.send({from:process.env.RESEND_FROM_EMAIL,to:p.data.to,subject:p.data.subject,html:p.data.html});if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({data});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/not-found.tsx' @'
import Link from "next/link";
export default function NotFound(){return <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white"><div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-cyan-400">NEXORA</p><h1 className="mt-4 text-7xl font-black">404</h1><p className="mt-3 text-slate-400">Esta página o propiedad no está disponible.</p><Link href="/" className="mt-8 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950">Regresar</Link></div></main>}
'@

Write-NexoraFile 'supabase/schema.sql' @'
create extension if not exists pgcrypto;

do $$ begin create type property_status as enum ('draft','published','reserved','sold','rented','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type property_operation as enum ('sale','rent','short_rent'); exception when duplicate_object then null; end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text default 'República Dominicana',
  default_currency text not null default 'USD',
  phone text, whatsapp text, email text, logo_url text,
  plan text not null default 'starter',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text,
  role text not null default 'owner' check (role in ('owner','admin','manager','agent','viewer')),
  phone text, avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete set null,
  title text not null, slug text not null unique, description text,
  operation property_operation not null default 'sale', status property_status not null default 'draft', property_type text not null,
  price numeric(16,2) not null default 0, currency text not null default 'USD',
  bedrooms numeric(6,1), bathrooms numeric(6,1), parking_spaces integer, area_m2 numeric(12,2), lot_m2 numeric(12,2),
  address text, sector text, city text, province text, country text default 'República Dominicana',
  latitude numeric(10,7), longitude numeric(10,7), furnished boolean not null default false, pool boolean not null default false,
  featured boolean not null default false, amenities text[] not null default '{}', external_reference text, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade, url text not null, alt_text text, position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null, assigned_agent_id uuid references public.profiles(id) on delete set null,
  name text not null, email text, phone text, whatsapp text, source text not null default 'website',
  status text not null default 'new' check (status in ('new','contacted','qualified','appointment','visit','offer','negotiation','won','lost')),
  score integer not null default 0 check (score between 0 and 100), budget_min numeric(16,2), budget_max numeric(16,2),
  preferred_city text, preferred_sector text, preferred_property_type text, notes text, last_contact_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade, event_type text not null, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null, lead_id uuid references public.leads(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade, title text not null, description text, due_at timestamptz,
  completed boolean not null default false, created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade, property_id uuid references public.properties(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete set null, scheduled_at timestamptz not null, duration_minutes integer not null default 60,
  status text not null default 'scheduled', notes text, created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade, lead_id uuid references public.leads(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null, amount numeric(16,2) not null, currency text not null default 'USD',
  status text not null default 'submitted' check (status in ('draft','submitted','accepted','rejected','countered','withdrawn')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict, lead_id uuid references public.leads(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null, transaction_type text not null default 'sale', status text not null default 'open',
  sale_price numeric(16,2), currency text not null default 'USD', commission_rate numeric(8,4), expected_close_at date, closed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade, agent_id uuid references public.profiles(id) on delete set null,
  amount numeric(16,2) not null, currency text not null default 'USD', status text not null default 'pending', paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, email text, phone text, website text, logo_url text, created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  developer_id uuid references public.developers(id) on delete set null, name text not null, slug text not null unique, description text,
  status text not null default 'draft', featured boolean not null default false, sector text, city text, province text, country text default 'República Dominicana',
  delivery_date date, cover_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.project_units (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade, code text not null, floor text, status text not null default 'available',
  price numeric(16,2), currency text not null default 'USD', bedrooms numeric(6,1), bathrooms numeric(6,1), area_m2 numeric(12,2),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(project_id, code)
);

create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict, tenant_name text not null, tenant_email text, tenant_phone text,
  start_date date not null, end_date date, monthly_rent numeric(16,2) not null, currency text not null default 'USD', deposit numeric(16,2),
  status text not null default 'active', payment_day integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.rent_payments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade, amount numeric(16,2) not null, currency text not null default 'USD',
  due_date date not null, paid_at timestamptz, status text not null default 'pending', notes text, created_at timestamptz not null default now()
);

create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade, lease_id uuid references public.leases(id) on delete set null,
  title text not null, description text, priority text not null default 'normal', status text not null default 'open', assigned_vendor text,
  estimated_cost numeric(16,2), actual_cost numeric(16,2), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade, transaction_id uuid references public.transactions(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade, name text not null, category text, status text not null default 'active', url text not null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null, name text not null, channel text not null, status text not null default 'draft',
  content text, budget numeric(16,2), currency text not null default 'USD', scheduled_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade, estimate numeric(16,2) not null, low_estimate numeric(16,2), high_estimate numeric(16,2),
  currency text not null default 'USD', method text, notes text, created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null, external_account_id text, name text, status text not null default 'active', config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(provider, external_account_id)
);

create table if not exists public.inbound_messages (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null, channel text not null, external_id text, from_address text, payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, session_key text, channel text not null default 'web', messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key, organization_id uuid references public.organizations(id) on delete cascade, actor_id uuid references auth.users(id) on delete set null,
  action text not null, entity_type text, entity_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists idx_properties_org on public.properties(organization_id);
create index if not exists idx_properties_search on public.properties(status, city, sector, property_type, price);
create index if not exists idx_leads_org on public.leads(organization_id);
create index if not exists idx_leads_score on public.leads(organization_id, score desc);
create index if not exists idx_tasks_org on public.tasks(organization_id, completed);
create index if not exists idx_appointments_org on public.appointments(organization_id, scheduled_at);
create index if not exists idx_transactions_org on public.transactions(organization_id, status);
create index if not exists idx_projects_org on public.projects(organization_id, status);
create index if not exists idx_leases_org on public.leases(organization_id, status);

create or replace function public.current_org_id() returns uuid language sql stable security definer set search_path=public as $$ select organization_id from public.profiles where id=auth.uid() limit 1; $$;
grant execute on function public.current_org_id() to authenticated;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare new_org_id uuid; company_name text; full_name_value text;
begin
  company_name:=coalesce(new.raw_user_meta_data->>'company_name','Mi Inmobiliaria');
  full_name_value:=coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1));
  insert into public.organizations(name,slug) values(company_name,'org-'||substr(new.id::text,1,8)) returning id into new_org_id;
  insert into public.profiles(id,organization_id,full_name,role) values(new.id,new_org_id,full_name_value,'owner');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- updated_at triggers
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['organizations','profiles','properties','leads','offers','transactions','projects','leases','maintenance_requests','marketing_campaigns','integrations','ai_conversations'] LOOP EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I',t,t); EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',t,t); END LOOP; END $$;

-- RLS
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['organizations','profiles','properties','property_images','leads','lead_events','tasks','appointments','offers','transactions','commissions','developers','projects','project_units','leases','rent_payments','maintenance_requests','documents','marketing_campaigns','valuations','integrations','inbound_messages','ai_conversations','audit_logs'] LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t); END LOOP; END $$;

-- Public property/project read
DROP POLICY IF EXISTS properties_public_select ON public.properties;
CREATE POLICY properties_public_select ON public.properties FOR SELECT TO anon USING (status='published');
DROP POLICY IF EXISTS property_images_public_select ON public.property_images;
CREATE POLICY property_images_public_select ON public.property_images FOR SELECT TO anon USING (exists(select 1 from public.properties p where p.id=property_id and p.status='published'));
DROP POLICY IF EXISTS projects_public_select ON public.projects;
CREATE POLICY projects_public_select ON public.projects FOR SELECT TO anon USING (status='published');
DROP POLICY IF EXISTS project_units_public_select ON public.project_units;
CREATE POLICY project_units_public_select ON public.project_units FOR SELECT TO anon USING (exists(select 1 from public.projects p where p.id=project_id and p.status='published'));

-- Organization scoped policies for authenticated users
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['properties','property_images','leads','lead_events','tasks','appointments','offers','transactions','commissions','developers','projects','project_units','leases','rent_payments','maintenance_requests','documents','marketing_campaigns','valuations','integrations','inbound_messages','ai_conversations','audit_logs']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_org_select ON public.%I',t,t);
    EXECUTE format('CREATE POLICY %I_org_select ON public.%I FOR SELECT TO authenticated USING (organization_id=public.current_org_id())',t,t);
    EXECUTE format('DROP POLICY IF EXISTS %I_org_insert ON public.%I',t,t);
    EXECUTE format('CREATE POLICY %I_org_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id=public.current_org_id())',t,t);
    EXECUTE format('DROP POLICY IF EXISTS %I_org_update ON public.%I',t,t);
    EXECUTE format('CREATE POLICY %I_org_update ON public.%I FOR UPDATE TO authenticated USING (organization_id=public.current_org_id()) WITH CHECK (organization_id=public.current_org_id())',t,t);
    EXECUTE format('DROP POLICY IF EXISTS %I_org_delete ON public.%I',t,t);
    EXECUTE format('CREATE POLICY %I_org_delete ON public.%I FOR DELETE TO authenticated USING (organization_id=public.current_org_id())',t,t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS organizations_select ON public.organizations;
CREATE POLICY organizations_select ON public.organizations FOR SELECT TO authenticated USING (id=public.current_org_id());
DROP POLICY IF EXISTS organizations_update ON public.organizations;
CREATE POLICY organizations_update ON public.organizations FOR UPDATE TO authenticated USING (id=public.current_org_id()) WITH CHECK (id=public.current_org_id());
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (organization_id=public.current_org_id());
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid() and organization_id=public.current_org_id());

grant usage on schema public to anon,authenticated;
grant select on public.properties,public.property_images,public.projects,public.project_units to anon,authenticated;
grant all on all tables in schema public to authenticated;
grant usage,select on all sequences in schema public to authenticated;

insert into storage.buckets(id,name,public) values('property-media','property-media',true) on conflict(id) do update set public=true;

select 'NEXORA REALTY OS DATABASE READY' as status;
'@

Write-NexoraFile 'README.md' @'
# NEXORA REALTY OS

AI-native real estate operating system.

## Included

Public portal, property catalog, projects, CRM, leads, scoring, tasks, appointments, offers, transactions, commissions, rentals, maintenance, documents, marketing, analytics, valuation, AI search, media upload, WhatsApp webhook/send, email send, multi-tenant organizations, Supabase Auth and RLS.

## Setup

1. Copy `.env.example` to `.env.local` and fill credentials.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.
5. Health check: `http://localhost:3000/api/health`.

## Required for full integrations

- Supabase project URL, publishable key and service role key.
- OpenAI API key for AI routes.
- Meta WhatsApp credentials for WhatsApp messaging.
- Resend credentials for email.

## Security

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `META_WHATSAPP_TOKEN` or `RESEND_API_KEY` to browser code.
'@

Write-NexoraFile 'SECURITY.md' @'
# Security baseline

- RLS enabled for tenant tables.
- Server-side admin key only in server routes.
- Authenticated dashboard protected by Next.js Proxy and verified Supabase JWT claims.
- Public lead creation resolves tenant from the published property server-side.
- Media uploads validate MIME type and maximum size.
- Add Turnstile, rate limiting, CSP, Sentry, MFA and backup/PITR before high-volume production.
'@

Write-NexoraFile 'CHECK-NEXORA.ps1' @'
$ErrorActionPreference = "Continue"
$score = 10
Write-Host "`n=== NEXORA QUALITY CHECK ===" -ForegroundColor Cyan
Write-Host "`n[1/4] ESLint" -ForegroundColor Yellow
npx eslint .
if ($LASTEXITCODE -ne 0) { $score -= 2; Write-Host "FAIL ESLint" -ForegroundColor Red } else { Write-Host "PASS ESLint" -ForegroundColor Green }
Write-Host "`n[2/4] TypeScript" -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { $score -= 2; Write-Host "FAIL TypeScript" -ForegroundColor Red } else { Write-Host "PASS TypeScript" -ForegroundColor Green }
Write-Host "`n[3/4] Build" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { $score -= 3; Write-Host "FAIL Build" -ForegroundColor Red } else { Write-Host "PASS Build" -ForegroundColor Green }
Write-Host "`n[4/4] Critical files" -ForegroundColor Yellow
$files = @(".env.example","supabase\schema.sql","src\proxy.ts","src\app\api\ai\search\route.ts","src\app\api\integrations\whatsapp\webhook\route.ts")
foreach($f in $files){if(Test-Path $f){Write-Host "PASS $f" -ForegroundColor Green}else{$score-=0.25;Write-Host "FAIL $f" -ForegroundColor Red}}
if($score -lt 0){$score=0}
Write-Host "`nNEXORA SCORE: $score / 10" -ForegroundColor Cyan
'@

Write-NexoraFile 'START-NEXORA.ps1' @'
$ErrorActionPreference = "Stop"
if (-not (Test-Path ".env.local")) { Copy-Item ".env.example" ".env.local"; Write-Host "Se creó .env.local. Configura tus credenciales." -ForegroundColor Yellow }
Write-Host "Nexora Realty OS -> http://localhost:3000" -ForegroundColor Cyan
npm run dev
'@



Write-NexoraFile 'src/components/autopilot-panel.tsx' @'
"use client";
import { useState } from "react";
import { LoaderCircle, WandSparkles } from "lucide-react";

type Item = { id:string; title:string };
export function AutopilotPanel({properties}:{properties:Item[]}){
  const [propertyId,setPropertyId]=useState(properties[0]?.id??"");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<any>(null);
  const [error,setError]=useState("");
  async function run(){if(!propertyId)return;setLoading(true);setError("");setResult(null);try{const r=await fetch("/api/ai/autopilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({property_id:propertyId})});const d=await r.json();if(!r.ok)throw new Error(d.error||"No fue posible ejecutar Autopilot.");setResult(d);}catch(e){setError(e instanceof Error?e.message:"Error inesperado");}finally{setLoading(false)}}
  return <div className="rounded-3xl border border-slate-200 bg-white p-7"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><WandSparkles/></span><div><h2 className="text-2xl font-black">Nexora Autopilot</h2><p className="text-sm text-slate-500">Convierte una propiedad en campañas y acciones comerciales.</p></div></div><div className="mt-7 flex flex-col gap-3 md:flex-row"><select value={propertyId} onChange={e=>setPropertyId(e.target.value)} className="h-12 flex-1 rounded-xl border border-slate-200 px-4"><option value="">Selecciona una propiedad</option>{properties.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><button onClick={run} disabled={loading||!propertyId} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white disabled:opacity-50">{loading?<LoaderCircle className="animate-spin" size={18}/>:<WandSparkles size={18}/>}Ejecutar Autopilot</button></div>{error&&<p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}{result&&<div className="mt-7 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase text-cyan-700">Resultado</p><p className="mt-2 font-semibold">{result.campaigns_created} campañas creadas</p><p className="mt-1 text-sm text-slate-500">{result.task_created?"Tarea de seguimiento creada":"Sin tarea"}</p></div><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase text-cyan-300">Estrategia</p><p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p></div></div>}</div>
}
'@

Write-NexoraFile 'src/app/dashboard/autopilot/page.tsx' @'
import { requireUser } from "@/lib/auth";
import { AutopilotPanel } from "@/components/autopilot-panel";
export default async function Page(){const {supabase}=await requireUser();const {data=[]}=await supabase.from("properties").select("id,title").in("status",["draft","published"]).order("created_at",{ascending:false});return <div><p className="text-sm font-black uppercase tracking-wider text-cyan-700">AI Automation</p><h1 className="mt-2 text-4xl font-black">Autopilot</h1><p className="mt-2 mb-8 max-w-2xl text-slate-500">Genera campañas multicanal y una acción comercial desde el inventario real, sin inventar datos del inmueble.</p><AutopilotPanel properties={data}/></div>}
'@

Write-NexoraFile 'src/app/api/ai/autopilot/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getModel, getOpenAI } from "@/lib/ai";
const schema=z.object({property_id:z.string().uuid()});
function parseJson(text:string){const clean=text.trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();return JSON.parse(clean)}
export async function POST(req:NextRequest){try{const a=await requireUser();const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:"property_id inválido"},{status:400});const {data:property,error}=await a.supabase.from("properties").select("*").eq("id",p.data.property_id).eq("organization_id",a.organizationId).single();if(error||!property)return NextResponse.json({error:"Propiedad no encontrada"},{status:404});const ai=getOpenAI();if(!ai)return NextResponse.json({error:"OPENAI_API_KEY no configurado"},{status:503});const r=await ai.responses.create({model:getModel(),input:`Eres Nexora Autopilot. Con los datos reales de esta propiedad genera una estrategia de comercialización. No inventes amenidades, distancias, permisos, rentabilidad ni disponibilidad. Devuelve SOLO JSON válido con esta forma: {"summary":"máximo 250 caracteres","instagram":"copy","facebook":"copy","whatsapp":"copy","email_subject":"asunto","email":"copy","follow_up_task":"acción concreta"}. Propiedad: ${JSON.stringify(property)}`});let plan:any;try{plan=parseJson(r.output_text)}catch{return NextResponse.json({error:"La IA no devolvió JSON válido. Reintenta."},{status:502})}const channels=[{channel:"instagram",content:String(plan.instagram||"")},{channel:"facebook",content:String(plan.facebook||"")},{channel:"whatsapp",content:String(plan.whatsapp||"")},{channel:"email",content:`${String(plan.email_subject||"")}\n\n${String(plan.email||"")}`}].filter(x=>x.content.trim());let campaigns=0;for(const item of channels){const {error:ce}=await a.supabase.from("marketing_campaigns").insert({organization_id:a.organizationId,property_id:property.id,name:`Autopilot - ${property.title} - ${item.channel}`,channel:item.channel,status:"draft",content:item.content});if(!ce)campaigns++}let taskCreated=false;if(plan.follow_up_task){const {error:te}=await a.supabase.from("tasks").insert({organization_id:a.organizationId,assigned_to:a.userId,property_id:property.id,title:String(plan.follow_up_task).slice(0,200),description:"Creada automáticamente por Nexora Autopilot."});taskCreated=!te}return NextResponse.json({summary:String(plan.summary||"Estrategia generada."),campaigns_created:campaigns,task_created:taskCreated});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-NexoraFile 'src/app/api/resources/[resource]/route.ts' @'
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
const allowed:Record<string,string[]>={developers:["name","email","phone","website","logo_url"],projects:["developer_id","name","slug","description","status","featured","sector","city","province","country","delivery_date","cover_url"],project_units:["project_id","code","floor","status","price","currency","bedrooms","bathrooms","area_m2","metadata"],leases:["property_id","tenant_name","tenant_email","tenant_phone","start_date","end_date","monthly_rent","currency","deposit","status","payment_day"],maintenance_requests:["property_id","lease_id","title","description","priority","status","assigned_vendor","estimated_cost","actual_cost"],documents:["property_id","transaction_id","lead_id","name","category","status","url","metadata"],marketing_campaigns:["property_id","name","channel","status","content","budget","currency","scheduled_at","metadata"],commissions:["transaction_id","agent_id","amount","currency","status","paid_at"],integrations:["provider","external_account_id","name","status","config"]};
export async function GET(_:NextRequest,{params}:{params:Promise<{resource:string}>}){try{const {resource}=await params;if(!allowed[resource])return NextResponse.json({error:"Recurso no permitido"},{status:404});const a=await requireUser();const {data,error}=await a.supabase.from(resource).select("*").order("created_at",{ascending:false}).limit(500);if(error)throw error;return NextResponse.json({data:data??[]});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
export async function POST(req:NextRequest,{params}:{params:Promise<{resource:string}>}){try{const {resource}=await params;const fields=allowed[resource];if(!fields)return NextResponse.json({error:"Recurso no permitido"},{status:404});const a=await requireUser();const body=await req.json();const row:Record<string,unknown>={organization_id:a.organizationId};for(const field of fields)if(Object.prototype.hasOwnProperty.call(body,field))row[field]=body[field];if(resource==="projects"&&!row.slug&&row.name)row.slug=`${slugify(String(row.name))}-${Date.now().toString().slice(-6)}`;const {data,error}=await a.supabase.from(resource).insert(row).select("*").single();if(error)throw error;return NextResponse.json({data},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Error"},{status:500})}}
'@

Write-Host "[4/7] Configurando scripts npm..." -ForegroundColor Yellow
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.check="npm run lint && npm run typecheck && npm run build"

Copy-Item ".env.example" ".env.local" -Force

Write-Host "[5/7] TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "TypeScript encontró errores. Ejecuta .\CHECK-NEXORA.ps1 después de revisar." -ForegroundColor Yellow }

Write-Host "[6/7] Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) { git init | Out-Null }
git add .
try { git commit -m "Nexora Realty OS master foundation" | Out-Null } catch { }

Write-Host "[7/7] LISTO" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NEXORA REALTY OS CREADO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Ruta: $ProjectPath" -ForegroundColor White
Write-Host ""
Write-Host "1. Configura: $ProjectPath\.env.local" -ForegroundColor Yellow
Write-Host "2. Ejecuta en Supabase SQL Editor: $ProjectPath\supabase\schema.sql" -ForegroundColor Yellow
Write-Host "3. Inicia:" -ForegroundColor Yellow
Write-Host "   cd `"$ProjectPath`"" -ForegroundColor Cyan
Write-Host "   .\START-NEXORA.ps1" -ForegroundColor Cyan
Write-Host "4. Abre: http://localhost:3000" -ForegroundColor Green
Write-Host "5. Diagnóstico: .\CHECK-NEXORA.ps1" -ForegroundColor Cyan
