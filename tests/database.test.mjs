import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL schema: ownership, atomic saves, private storage and durable rate limits',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`
      create role anon;create role authenticated;
      create schema auth;create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth,public,storage to authenticated;
      grant execute on function auth.uid() to authenticated;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(text) returns text[] language sql immutable as $$ select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
      grant all on storage.objects to authenticated;
      insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
    `);
    const schema=await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8');
    await db.exec(schema);
    await db.exec(schema); // rerunnable setup
    const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222',deck='33333333-3333-4333-8333-333333333333';
    const as=async uid=>db.exec(`reset role;set request.jwt.claim.sub='${uid}';set role authenticated;`);
    await as(alice);
    await db.query(`select public.reserve_deck($1,'Topic','pdf',10,'id')`,[deck]);
    const cards=[{question:'What is the topic?',answer:'A test topic.',reference:'Page 1'}];
    await db.query(`select public.finish_deck($1,'Topic',$2::jsonb)`,[deck,JSON.stringify(cards)]);
    const card=(await db.query('select id from public.cards')).rows[0].id;
    await db.query(`insert into public.card_progress(card_id,owner_id,rating) values($1,$2,'known')`,[card,alice]);
    await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['materials',`${alice}/${deck}/file.pdf`]);
    assert.equal((await db.query('select * from public.decks')).rows.length,1);
    await as(bob);
    for(const table of ['decks','cards','card_progress'])assert.equal((await db.query(`select * from public.${table}`)).rows.length,0);
    assert.equal((await db.query('select * from storage.objects')).rows.length,0);
    await assert.rejects(db.query(`insert into public.card_progress(card_id,owner_id,rating) values($1,$2,'known')`,[card,bob]));
    await assert.rejects(db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['materials',`${alice}/evil.pdf`]));
    await assert.rejects(db.query(`select public.finish_deck($1,'Stolen',$2::jsonb)`,[deck,JSON.stringify(cards)]));
    await as(alice);
    // A bad answer rolls back the entire finish operation, leaving no partial cards.
    const bad='44444444-4444-4444-8444-444444444444';
    await db.query(`select public.reserve_deck($1,'Bad','pdf',10,'id')`,[bad]);
    await assert.rejects(db.query(`select public.finish_deck($1,'Bad',$2::jsonb)`,[bad,JSON.stringify([...cards,{question:'Invalid answer?',answer:''}])]));
    assert.equal((await db.query('select * from public.cards where deck_id=$1',[bad])).rows.length,0);
    assert.equal((await db.query('select status from public.decks where id=$1',[bad])).rows[0].status,'generating');
    await db.query('delete from public.decks');
    for(let i=0;i<3;i++)await db.query(`select public.reserve_deck(gen_random_uuid(),'Another','images',20,'id')`);
    await db.query('delete from public.decks');
    await assert.rejects(db.query(`select public.reserve_deck(gen_random_uuid(),'Exceeded','pdf',10,'id')`),/Batas generate/);
    await assert.rejects(db.query('delete from public.generation_requests'));
    const imported=(await db.query(`select public.import_deck('Imported',$1::jsonb) as id`,[JSON.stringify(cards)])).rows[0].id;
    assert.equal((await db.query('select status from public.decks where id=$1',[imported])).rows[0].status,'ready');
  }finally{await db.close();}
});
