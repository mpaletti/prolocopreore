-- Schema per la sezione Eventi di prolocopreore.it
-- Da eseguire una tantum nel SQL Editor del progetto Supabase (Dashboard -> SQL Editor -> New query).

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null,
  description text,
  event_date  date not null,
  start_time  time,
  location    text,
  photo_url   text,
  photo_path  text,
  links       jsonb not null default '[]'::jsonb
);

alter table public.events enable row level security;

-- Lettura pubblica (il sito la usa per mostrare gli eventi a tutti i visitatori)
create policy "events public read" on public.events
  for select to anon, authenticated using (true);

-- Scrittura solo per utenti autenticati (l'unico account admin, creato manualmente)
create policy "events admin write" on public.events
  for all to authenticated using (true) with check (true);

-- Bucket per le foto degli eventi: pubblico in lettura, scrivibile solo da autenticati
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true);

create policy "event photos read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'event-photos');

create policy "event photos insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'event-photos');

create policy "event photos update" on storage.objects
  for update to authenticated using (bucket_id = 'event-photos');

create policy "event photos delete" on storage.objects
  for delete to authenticated using (bucket_id = 'event-photos');

-- Dopo aver eseguito questo script:
-- 1. Authentication -> Providers/Settings: disattivare "Allow new users to sign up".
-- 2. Authentication -> Users -> Add user: creare l'unico account admin (email + password).
-- 3. Project Settings -> API: copiare "Project URL" e "anon public key" in assets/supabase.js.
