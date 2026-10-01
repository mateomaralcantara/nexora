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
  land_tareas numeric(12,2), construction_status text default 'ready', expected_delivery_date date,
  animals_present boolean not null default false, animals_description text,
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

-- ============================================================
-- PROJECT UNITS
-- ============================================================

create table if not exists public.units (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references public.organizations(id)
        on delete cascade,

    project_id uuid
        references public.projects(id)
        on delete cascade,

    property_id uuid
        references public.properties(id)
        on delete set null,

    unit_code text not null,

    floor text,

    status text not null default 'available'
        check (
            status in (
                'available',
                'reserved',
                'sold',
                'blocked'
            )
        ),

    price numeric(16,2),

    currency text not null default 'USD',

    bedrooms numeric(6,1),
    bathrooms numeric(6,1),

    area_m2 numeric(12,2),

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique(project_id, unit_code)
);

create index if not exists units_organization_idx
    on public.units(organization_id);

create index if not exists units_project_idx
    on public.units(project_id);

create index if not exists units_status_idx
    on public.units(status);

alter table public.units
enable row level security;

drop policy if exists units_org_all
on public.units;

create policy units_org_all
on public.units
for all
to authenticated
using (
    organization_id = public.current_org_id()
)
with check (
    organization_id = public.current_org_id()
);

grant all
on public.units
to authenticated;

