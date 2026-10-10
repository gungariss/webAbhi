-- Apply in Supabase SQL Editor for an existing Recall installation.
-- Retains existing request history and the per-user transaction lock.
begin;
create or replace function public.reserve_deck(p_id uuid,p_title text,p_type text,p_count integer,p_language text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_type not in ('pdf','images','youtube') or p_count not in (10,20,30) or p_language not in ('id','en') then raise exception 'Invalid request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  if (select count(*) from public.generation_requests where owner_id=uid and created_at>now()-interval '6 hours')>=10 then
    raise exception 'Batas generate tercapai: maksimal 10 permintaan dalam 6 jam terakhir. Coba lagi setelah permintaan terlama melewati 6 jam.';
  end if;
  insert into public.generation_requests(owner_id) values(uid);
  insert into public.decks(id,owner_id,title,source_type,card_count,language) values(p_id,uid,p_title,p_type,p_count,p_language);
  return p_id;
end $$;

revoke all on function public.reserve_deck(uuid,text,text,integer,text) from public,anon;
grant execute on function public.reserve_deck(uuid,text,text,integer,text) to authenticated;
commit;
