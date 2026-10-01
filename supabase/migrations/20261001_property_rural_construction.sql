alter table public.properties
  add column if not exists land_tareas numeric(12,2);

alter table public.properties
  add column if not exists construction_status text default 'ready';

alter table public.properties
  add column if not exists expected_delivery_date date;

alter table public.properties
  add column if not exists animals_present boolean not null default false;

alter table public.properties
  add column if not exists animals_description text;

create index if not exists idx_properties_rural
  on public.properties(property_type, province, land_tareas);

create index if not exists idx_properties_construction
  on public.properties(construction_status, expected_delivery_date);