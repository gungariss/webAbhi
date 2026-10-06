-- Run this entire file once in Supabase > SQL Editor > New query.
begin;

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 120),
  source_type text not null check(source_type in ('pdf','images','youtube','import')),
  status text not null default 'generating' check(status in ('generating','ready','failed')),
  language text not null default 'id' check(language in ('id','en')),
  card_count integer not null default 0 check(card_count between 0 and 30),
  created_at timestamptz not null default now()
);
create table if not exists public.source_files (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  path text, url text, name text not null, mime text,
  position integer not null default 0
);
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  question text not null check(char_length(question) between 3 and 1000),
  answer text not null check(char_length(answer) between 1 and 3000),
  reference text not null default '' check(char_length(reference)<=200),
  position integer not null default 0
);
create table if not exists public.card_progress (
  card_id uuid not null references public.cards(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check(rating in ('again','unsure','known')),
  reviews integer not null default 1 check(reviews>0),
  reviewed_at timestamptz not null default now(),
  primary key(card_id,owner_id)
);
-- Separate ledger: deleting a deck cannot reset a user's generate limit.
create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists decks_owner_created on public.decks(owner_id,created_at desc);
create index if not exists cards_deck_position on public.cards(deck_id,position);
create index if not exists sources_deck on public.source_files(deck_id);
create index if not exists requests_owner_created on public.generation_requests(owner_id,created_at);

alter table public.decks enable row level security;
alter table public.source_files enable row level security;
alter table public.cards enable row level security;
alter table public.card_progress enable row level security;
alter table public.generation_requests enable row level security;

drop policy if exists decks_read on public.decks;
create policy decks_read on public.decks for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists decks_update on public.decks;
create policy decks_update on public.decks for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists decks_delete on public.decks;
create policy decks_delete on public.decks for delete to authenticated using(owner_id=(select auth.uid()));
drop policy if exists sources_own on public.source_files;
create policy sources_own on public.source_files for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.decks d where d.id=deck_id and d.owner_id=(select auth.uid())));
drop policy if exists cards_own on public.cards;
create policy cards_own on public.cards for all to authenticated using(exists(select 1 from public.decks d where d.id=deck_id and d.owner_id=(select auth.uid()))) with check(exists(select 1 from public.decks d where d.id=deck_id and d.owner_id=(select auth.uid())));
drop policy if exists progress_own on public.card_progress;
create policy progress_own on public.card_progress for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.cards c join public.decks d on d.id=c.deck_id where c.id=card_id and d.owner_id=(select auth.uid())));
-- No direct insert/update/delete permissions on rate limit records.
revoke all on public.generation_requests from anon,authenticated;
grant select,update,delete on public.decks to authenticated;
revoke insert on public.decks from anon,authenticated;
grant select,insert,update,delete on public.cards,public.source_files,public.card_progress to authenticated;

create or replace function public.reserve_deck(p_id uuid,p_title text,p_type text,p_count integer,p_language text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_type not in ('pdf','images','youtube') or p_count not in (10,20,30) or p_language not in ('id','en') then raise exception 'Invalid request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  if (select count(*) from public.generation_requests where owner_id=uid and created_at>now()-interval '1 hour')>=5
     or (select count(*) from public.generation_requests where owner_id=uid and created_at>now()-interval '24 hours')>=20 then
    raise exception 'Batas generate tercapai. Coba lagi nanti.';
  end if;
  insert into public.generation_requests(owner_id) values(uid);
  insert into public.decks(id,owner_id,title,source_type,card_count,language) values(p_id,uid,p_title,p_type,p_count,p_language);
  return p_id;
end $$;

create or replace function public.finish_deck(p_id uuid,p_title text,p_cards jsonb)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform 1 from public.decks where id=p_id and owner_id=auth.uid() and status='generating' for update;
  if not found then raise exception 'Deck not found'; end if;
  if jsonb_typeof(p_cards)<>'array' or jsonb_array_length(p_cards) not between 1 and 30 then raise exception 'Invalid cards'; end if;
  insert into public.cards(deck_id,question,answer,reference,position)
    select p_id,item->>'question',item->>'answer',coalesce(item->>'reference',''),(ord-1)::integer
    from jsonb_array_elements(p_cards) with ordinality as items(item,ord);
  update public.decks set title=p_title,status='ready',card_count=jsonb_array_length(p_cards) where id=p_id;
end $$;

create or replace function public.import_deck(p_title text,p_cards jsonb)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid:=gen_random_uuid();
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(p_cards)<>'array' or jsonb_array_length(p_cards) not between 1 and 30 then raise exception 'Invalid cards'; end if;
  insert into public.decks(id,owner_id,title,source_type) values(result,auth.uid(),p_title,'import');
  perform public.finish_deck(result,p_title,p_cards);
  return result;
end $$;
revoke all on function public.reserve_deck(uuid,text,text,integer,text),public.finish_deck(uuid,text,jsonb),public.import_deck(text,jsonb) from public,anon;
grant execute on function public.reserve_deck(uuid,text,text,integer,text),public.finish_deck(uuid,text,jsonb),public.import_deck(text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('materials','materials',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists materials_read on storage.objects;
create policy materials_read on storage.objects for select to authenticated using(bucket_id='materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists materials_upload on storage.objects;
create policy materials_upload on storage.objects for insert to authenticated with check(bucket_id='materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists materials_delete on storage.objects;
create policy materials_delete on storage.objects for delete to authenticated using(bucket_id='materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
