-- Supabase schema for inventario-ti (recommended)
-- Run these statements in Supabase SQL editor (Database -> SQL Editor)

-- 1) users are handled by Supabase Auth; we store profiles linked to auth.uid
create table perfiles (
  id uuid primary key default uuid_generate_v4(),
  auth_uid uuid references auth.users(id) on delete cascade,
  nombre text,
  email text,
  rol text default 'user', -- e.g. super_admin, admin, user
  organizacion_id uuid,
  created_at timestamptz default now()
);

create table organizaciones (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  created_at timestamptz default now()
);

create table activos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  serial text,
  ubicacion text,
  organizacion_id uuid references organizaciones(id) on delete set null,
  owner_id uuid references perfiles(id),
  metadata jsonb,
  created_at timestamptz default now()
);

create table tickets (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descripcion text,
  activo_id uuid references activos(id) on delete set null,
  creador_id uuid references perfiles(id),
  estado text default 'abierto',
  prioridad text default 'media',
  created_at timestamptz default now()
);

create table comentarios_ticket (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id) on delete cascade,
  autor_id uuid references perfiles(id),
  texto text not null,
  created_at timestamptz default now()
);

-- Enable row level security and example policies
-- Enable extensions required
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Example: enable RLS on perfiles
alter table perfiles enable row level security;

-- Allow users to insert their own profile (auth.uid must match)
create policy "insert own profile" on perfiles for insert using (auth.uid() is not null) with check (auth.uid() = auth_uid::text);

-- Allow users to select their own profile
create policy "select own profile" on perfiles for select using (auth.uid() = auth_uid::text);

-- Example policies for activos: allow read for same organization
alter table activos enable row level security;
create policy "select activos by org" on activos for select using (
  organizacion_id is null OR
  exists (select 1 from perfiles p where p.auth_uid::text = auth.uid() and p.organizacion_id = activos.organizacion_id)
);

-- Tickets: creators can insert; members of org can select
alter table tickets enable row level security;
create policy "insert ticket" on tickets for insert using (auth.uid() is not null) with check (creador_id IS NOT NULL);
create policy "select tickets org" on tickets for select using (
  exists (select 1 from perfiles p where p.auth_uid::text = auth.uid() and p.organizacion_id = tickets.organizacion_id)
);

-- Adjust these policies to your security model. Test with different roles.
