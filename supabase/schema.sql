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
  photo_url   text,                                    -- copertina (= photos[0].url), per retrocompatibilità
  photo_path  text,                                    -- path della copertina nel bucket
  photos      jsonb not null default '[]'::jsonb,      -- galleria: [{ "url": "...", "path": "..." }]
  links       jsonb not null default '[]'::jsonb
);

alter table public.events enable row level security;

-- Lettura pubblica (il sito la usa per mostrare gli eventi a tutti i visitatori)
create policy "events public read" on public.events
  for select to anon, authenticated using (true);

-- Scrittura riservata al SOLO account admin, identificato per email.
-- Sostituisci 'ADMIN-EMAIL' con l'email dell'utente creato in Authentication -> Users.
-- (Meglio dell'UID: ricreando l'admin con la stessa email la policy resta valida.
--  Il (select ...) evita anche l'avviso "auth_rls_initplan" del linter Supabase.)
create policy "events admin write" on public.events
  for all to authenticated
  using ((select auth.jwt() ->> 'email') = 'ADMIN-EMAIL')
  with check ((select auth.jwt() ->> 'email') = 'ADMIN-EMAIL');

-- Bucket per le foto degli eventi: pubblico in lettura, scrivibile solo da autenticati
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true);

-- NB: nessuna policy SELECT su storage.objects.
-- Il bucket è pubblico, quindi gli URL delle foto (getPublicUrl) funzionano senza RLS;
-- il sito non usa mai storage.list(). Aggiungere una SELECT per anon permetterebbe a
-- chiunque di ELENCARE tutti i file del bucket, esposizione inutile (Security Advisor).

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

-- ---------------------------------------------------------------------------
-- MIGRAZIONE (solo se la tabella "events" era già stata creata SENZA la
-- colonna "photos", cioè con una versione precedente di questo schema).
-- Esegui una tantum nel SQL Editor; è idempotente e non tocca i dati esistenti.
-- Popola "photos" con la copertina già presente, così i vecchi eventi
-- mostrano subito la loro foto nella nuova galleria.
-- ---------------------------------------------------------------------------
-- alter table public.events add column if not exists photos jsonb not null default '[]'::jsonb;
-- update public.events
--   set photos = jsonb_build_array(jsonb_build_object('url', photo_url, 'path', photo_path))
--   where photo_url is not null and photos = '[]'::jsonb;
