'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, ArrowUpRight, Search, FileText, CirclePlay, Image as ImageIcon, Trash2, Upload, LoaderCircle, BookOpen, RotateCcw } from 'lucide-react';
import { LoginGate, useAuth } from '../../components/app-shell';
import { getSupabase, friendlyError } from '../../lib/supabase';
export default function LibraryPage(){
  const {user}=useAuth(),router=useRouter(),input=useRef(null);
  const [decks,setDecks]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[search,setSearch]=useState(''),[busy,setBusy]=useState('');
  async function load(){
    if(!user)return;setLoading(true);setError('');
    const {data,error}=await getSupabase().from('decks').select('*, cards(id, card_progress(rating))').order('created_at',{ascending:false});
    if(error)setError(friendlyError(error));else setDecks(data||[]);setLoading(false);
  }
  useEffect(()=>{
    if(!user){setDecks([]);return;}let active=true;setLoading(true);setError('');
    getSupabase().from('decks').select('*, cards(id, card_progress(rating))').order('created_at',{ascending:false}).then(({data,error})=>{if(!active)return;if(error)setError(friendlyError(error));else setDecks(data||[]);setLoading(false);});
    return()=>{active=false;};
  },[user?.id]);
  async function remove(deck){
    if(!window.confirm(`Hapus “${deck.title}” beserta kartu, progres, dan materinya?`))return;
    setBusy(deck.id);setError('');
    try{const db=getSupabase();const {data:sources,error:sourceError}=await db.from('source_files').select('path').eq('deck_id',deck.id);if(sourceError)throw sourceError;const paths=(sources||[]).map(s=>s.path).filter(Boolean);if(paths.length){const {error}=await db.storage.from('materials').remove(paths);if(error)throw error;}const {error}=await db.from('decks').delete().eq('id',deck.id);if(error)throw error;setDecks(previous=>previous.filter(d=>d.id!==deck.id));}catch(e){setError(friendlyError(e));}finally{setBusy('');}
  }
  async function importFile(file){
    if(!file)return;setBusy('import');setError('');
    try{if(file.size>150000)throw new Error('File JSON maksimal 150 KB.');const {data:{session}}=await getSupabase().auth.getSession();if(!session)throw new Error('Masuk kembali untuk mengimpor.');const response=await fetch('/api/import',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:await file.text()});const data=await response.json();if(!response.ok)throw new Error(data.error);router.push(`/belajar/${data.id}`);}catch(e){setError(friendlyError(e));}finally{setBusy('');}
  }
  const filtered=decks.filter(d=>d.title.toLowerCase().includes(search.toLowerCase()));
  const total=decks.reduce((n,d)=>n+(d.cards?.length||0),0),known=decks.reduce((n,d)=>n+(d.cards||[]).filter(c=>c.card_progress?.[0]?.rating==='known').length,0);
  return <main id="main" className="page-width workspace"><div className="workspace-heading heading-with-action"><div><p className="eyebrow">RUANG BELAJAR</p><h1>Kartu kecil. Kemajuan besar.</h1><p>Semua materi dan langkah belajarmu, dalam satu tempat.</p></div><Link className="button" href="/materi"><Plus size={18}/> Buat kartu baru</Link></div><LoginGate><div className="stats-grid"><div><span>Kumpulan kartu</span><strong>{decks.length.toString().padStart(2,'0')}</strong><Layers size={24}/></div><div><span>Total flashcard</span><strong>{total.toString().padStart(2,'0')}</strong><BookOpen size={24}/></div><div><span>Sudah dipahami</span><strong>{known.toString().padStart(2,'0')}</strong><span className="stat-caption">Satu langkah setiap hari.</span></div></div><div className="library-toolbar"><label className="search-input"><Search size={19}/><input aria-label="Cari kumpulan kartu" placeholder="Cari topik yang ingin dipelajari…" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="toolbar-buttons"><button className="button secondary small" disabled={Boolean(busy)} onClick={()=>input.current?.click()}><Upload size={16}/> Impor JSON</button><button className="icon-button" onClick={load} aria-label="Muat ulang kartu" disabled={loading}><RotateCcw size={18}/></button></div><input ref={input} className="sr-only" aria-label="Impor file flashcard" type="file" accept=".json,application/json" onChange={e=>{importFile(e.target.files?.[0]);e.target.value='';}}/></div>
    {error?<div role="alert" className="notice error">{error}</div>:null}{loading?<div className="empty-state"><LoaderCircle className="spin"/><p>Mengambil kumpulan kartumu…</p></div>:filtered.length?<div className="decks-grid">{filtered.map(deck=>{const Icon=deck.source_type==='youtube'?CirclePlay:deck.source_type==='images'?ImageIcon:FileText;const count=deck.cards?.length||0;const mastered=(deck.cards||[]).filter(c=>c.card_progress?.[0]?.rating==='known').length;return <article className="deck-card" key={deck.id}><div className="deck-card-top"><span className={`deck-icon ${deck.source_type}`}><Icon size={24}/></span><button className="icon-button" disabled={Boolean(busy)} onClick={()=>remove(deck)} aria-label={`Hapus ${deck.title}`}>{busy===deck.id?<LoaderCircle className="spin" size={17}/>:<Trash2 size={17}/>}</button></div><span className="deck-type">{deck.source_type==='images'?'GAMBAR':deck.source_type==='youtube'?'YOUTUBE':deck.source_type==='import'?'IMPOR':'PDF'}</span><h2>{deck.title}</h2><p>{count} kartu · {new Date(deck.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</p>{deck.status==='ready'?<><div className="progress-track"><span style={{width:`${count?mastered/count*100:0}%`}}/></div><div className="deck-progress"><span>{mastered} dari {count} dipahami</span><strong>{count?Math.round(mastered/count*100):0}%</strong></div><Link className="deck-start" href={`/belajar/${deck.id}`}>Lanjut belajar <ArrowUpRight size={18}/></Link></>:<div className="notice">{deck.status==='failed'?'Generate belum berhasil. Buat ulang dari laman materi.':Date.now()-new Date(deck.created_at).getTime()>600000?'Proses terhenti. Kamu bisa membuat ulang dari laman materi.':'Sedang dibuat. Muat ulang sebentar lagi.'}</div>}</article>;})}</div>:<div className="empty-state"><div className="empty-icon"><Layers size={30}/></div><h2>{search?'Topik belum ditemukan.':'Kartu pertamamu menunggu.'}</h2><p>{search?'Coba kata pencarian lain.':'Mulai dengan satu PDF, satu video, atau beberapa foto catatan.'}</p><Link className="button" href="/materi">Buat flashcard <ArrowUpRight size={18}/></Link></div>}</LoginGate></main>;
}
