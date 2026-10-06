'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileText, CirclePlay, Image as ImageIcon, UploadCloud, Sparkles, ArrowRight, X, ChevronUp, ChevronDown, LoaderCircle, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../components/app-shell';
import { getSupabase, friendlyError } from '../../lib/supabase';
import { youtubeUrl } from '../../lib/validation';

async function compressImage(file){
  const bitmap=await createImageBitmap(file);
  try {
    const ratio=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);
    const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let blob;
    for(const quality of [0.9,0.8,0.65,0.5]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<1024*1024)break;}
    if(!blob)throw new Error('Gambar belum bisa dibaca. Gunakan JPG, PNG, atau WebP.');
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
  }finally{bitmap.close();}
}
function PicturePreview({file}){
  const [url,setUrl]=useState('');
  useEffect(()=>{const value=URL.createObjectURL(file);setUrl(value);return()=>URL.revokeObjectURL(value);},[file]);
  return url?<Image src={url} width={80} height={64} unoptimized alt={`Pratinjau ${file.name}`} className="file-thumbnail"/>:null;
}
export default function MaterialPage(){
  const {user,openAuth}=useAuth(),router=useRouter();
  const [type,setType]=useState('pdf'),[files,setFiles]=useState([]),[url,setUrl]=useState(''),[title,setTitle]=useState(''),[count,setCount]=useState(20),[language,setLanguage]=useState('id'),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[stage,setStage]=useState(''),[drag,setDrag]=useState(false);
  const fileInput=useRef(null),running=useRef(false);
  function changeType(value){if(busy)return;setType(value);setFiles([]);setError('');}
  function addFiles(list){
    if(busy)return;setError('');const picked=Array.from(list);
    if(type==='pdf'){
      if(picked.length!==1 || (picked[0].type!=='application/pdf'&&!picked[0].name.toLowerCase().endsWith('.pdf'))){setError('Pilih satu file PDF.');return;}
      if(picked[0].size>10*1024*1024){setError('PDF maksimal 10 MB. Pilih bagian materi yang ingin dipelajari.');return;}setFiles(picked);if(!title)setTitle(picked[0].name.replace(/\.pdf$/i,'').slice(0,120));
    }else{
      if(files.length+picked.length>10){setError('Maksimal 10 gambar. Hapus gambar yang tidak diperlukan sebelum menambah lagi.');return;}
      if(picked.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024)){setError('Gunakan JPG, PNG, atau WebP, maksimal 10 MB per gambar.');return;}
      setFiles([...files,...picked]);
    }
  }
  function move(index,direction){setFiles(previous=>{const next=[...previous];[next[index],next[index+direction]]=[next[index+direction],next[index]];return next;});}
  async function generate(event){
    event.preventDefault();if(running.current)return;setError('');
    if(!user){openAuth();return;}
    if(type==='youtube'&&!youtubeUrl(url)){setError('Masukkan link YouTube yang valid.');return;}
    if(type!=='youtube'&&!files.length){setError('Pilih materi terlebih dahulu.');return;}
    if(!consent){setError('Setujui pengiriman materi ke Google untuk membuat kartu.');return;}
    running.current=true;setBusy(true);const db=getSupabase(),uploaded=[];
    try {
      const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('Sesi berakhir. Masuk kembali.');
      const id=crypto.randomUUID();
      setStage(type==='images'?'Menyiapkan gambar…':'Mengunggah materi…');
      const prepared=type==='images'?await Promise.all(files.map(compressImage)):files;
      if(prepared.reduce((n,f)=>n+f.size,0)>10*1024*1024)throw new Error('Total materi maksimal 10 MB setelah kompresi. Pilih lebih sedikit gambar.');
      const records=[];
      // Sequential uploads make cleanup deterministic if a later file fails.
      for(const file of prepared){
        const mime=type==='pdf'?'application/pdf':file.type;
        const path=`${user.id}/${id}/${crypto.randomUUID()}.${type==='pdf'?'pdf':'jpg'}`;
        const {error:uploadError}=await db.storage.from('materials').upload(path,file,{contentType:mime,upsert:false});
        if(uploadError)throw uploadError;uploaded.push(path);records.push({path,name:file.name.slice(0,200),mime});
      }
      setStage('AI sedang membaca materi dan menyusun kartu…');
      const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({id,title:title.trim(),sourceType:type,cardCount:count,language,youtube:type==='youtube'?url:undefined,files:records}),signal:AbortSignal.timeout(170000)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Generate belum berhasil.');
      setStage('Kartu sudah tersimpan. Membuka ruang belajar…');router.push(`/belajar/${result.id}`);
    }catch(e){
      // A timeout may still complete on the server: retain source files in that case.
      if(uploaded.length && e.name!=='TimeoutError')await db.storage.from('materials').remove(uploaded);
      setError(e.name==='TimeoutError'?'Proses memerlukan lebih lama. Periksa Kartu Saya sebelum mencoba lagi.':friendlyError(e));
    }finally{running.current=false;setBusy(false);}
  }
  const choices=[{id:'pdf',icon:FileText,title:'Dokumen PDF',desc:'Buku, modul, atau slide'},{id:'youtube',icon:CirclePlay,title:'Video YouTube',desc:'Belajar dari video'},{id:'images',icon:ImageIcon,title:'Gambar catatan',desc:'Maksimal 10 gambar'}];
  return <main id="main" className="page-width workspace"><div className="workspace-heading"><p className="eyebrow">LANGKAH PERTAMA</p><h1>Materinya dari mana?</h1><p>Pilih materi untuk dijadikan flashcard.</p></div><div className="material-layout"><form className="panel material-panel" onSubmit={generate}>
    <fieldset disabled={busy}><legend className="field-title"><span className="number-badge">1</span> Pilih sumber materi</legend><div className="source-choices">{choices.map(({id,icon:Icon,title:label,desc})=><button type="button" aria-pressed={type===id} className={`source-choice ${type===id?'selected':''}`} key={id} onClick={()=>changeType(id)}><Icon size={25}/><strong>{label}</strong><span>{desc}</span>{type===id?<Check className="choice-check" size={16}/>:null}</button>)}</div>
    {type==='youtube'?<div className="youtube-field"><label>Link video YouTube<input type="url" placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={e=>setUrl(e.target.value)} required maxLength={500}/></label><p className="helper">Gunakan video publik dengan materi yang jelas.</p></div>:<><input ref={fileInput} className="sr-only" type="file" aria-label={type==='pdf'?'Pilih PDF':'Pilih gambar'} accept={type==='pdf'?'.pdf,application/pdf':'image/jpeg,image/png,image/webp'} multiple={type==='images'} onChange={e=>{addFiles(e.target.files);e.target.value='';}}/><button type="button" className={`upload-zone ${drag?'dragging':''}`} onClick={()=>fileInput.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}}><span className="upload-icon"><UploadCloud size={27}/></span><strong>{type==='pdf'?'Pilih atau tarik PDF ke sini':'Pilih atau tarik gambar ke sini'}</strong><span>{type==='pdf'?'Satu dokumen · maksimal 10 MB':'JPG, PNG, WebP · maksimal 10 gambar'}</span><span className="upload-link">Pilih file <ArrowRight size={15}/></span></button></>}
    {files.length?<div className="files-list">{files.map((file,i)=><div className="file-row" key={`${file.name}-${i}`}>{type==='images'?<PicturePreview file={file}/>:<FileText size={24}/>}<div className="file-info"><strong>{i+1}. {file.name}</strong><span>{(file.size/1024/1024).toFixed(2)} MB</span></div>{type==='images'?<div className="reorder-buttons"><button type="button" className="icon-button" disabled={i===0} aria-label={`Pindahkan gambar ${i+1} ke atas`} onClick={()=>move(i,-1)}><ChevronUp size={17}/></button><button type="button" className="icon-button" disabled={i===files.length-1} aria-label={`Pindahkan gambar ${i+1} ke bawah`} onClick={()=>move(i,1)}><ChevronDown size={17}/></button></div>:null}<button type="button" className="icon-button" aria-label={`Hapus ${file.name}`} onClick={()=>setFiles(files.filter((_,index)=>index!==i))}><X size={17}/></button></div>)}</div>:null}
    <div className="form-divider"/><div className="field-title" role="heading" aria-level={2}><span className="number-badge">2</span> Buat sesuai kebutuhanmu</div><label>Judul kumpulan kartu<input placeholder="Contoh: Biologi — Struktur Sel" value={title} onChange={e=>setTitle(e.target.value)} required maxLength={120}/></label><div className="form-columns"><label>Jumlah kartu<select value={count} onChange={e=>setCount(Number(e.target.value))}><option value={10}>10 kartu — sesi singkat</option><option value={20}>20 kartu — seimbang</option><option value={30}>30 kartu — lebih lengkap</option></select></label><label>Bahasa kartu<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></label></div><p className="helper">Jumlah kartu menyesuaikan isi materi.</p><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Saya setuju materi dikirim ke Google. Pada paket gratis, Google dapat memakai konten untuk meningkatkan produknya.</span></label></fieldset>
    {error?<div className="notice error" role="alert">{error}</div>:null}{busy?<div className="generation-status" role="status"><LoaderCircle size={20} className="spin"/><span>{stage}</span></div>:null}<button className="button full generate-button" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:<Sparkles size={18}/>} {busy?'Sedang membuat kartu…':'Buat flashcard'} {!busy?<ArrowRight size={18}/>:null}</button><p className="fine-print">{user?'Kartu akan disimpan ke akunmu.':'Masuk atau daftar sebelum membuat kartu.'}</p>
  </form><aside className="material-aside"><div className="tip-panel"><span className="eyebrow">SEDIKIT TIPS</span><h2>Materi yang jelas,<br/>kartu yang lebih baik.</h2><ul><li>Satu kumpulan, satu topik.</li><li>Gunakan teks yang jelas.</li><li>Urutkan gambar catatanmu.</li><li>Cek dan edit hasil AI.</li></ul><div className="tip-divider"/><ShieldCheck size={22}/><p>Materi privat. Belajar ulang tanpa kuota AI.</p></div><div className="small-quote">“Coba ingat dulu.<br/>Baru lihat jawabannya.”</div></aside></div></main>;
}

