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
