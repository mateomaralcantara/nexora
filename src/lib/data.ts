import { createPublicClient } from "@/lib/supabase/public";
import { demoProperties } from "@/lib/demo-data";
import { demoProjects } from "@/lib/demo-projects";
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
  if (!admin) return demoProjects;
  const { data, error } = await admin
    .from("projects")
    .select(`*, developers(name), project_units(id,status,price,currency,bedrooms,bathrooms,area_m2)`)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return demoProjects;
  return data ?? [];
}
