'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, ArrowUpRight, Menu, X, LogOut, Mail, LoaderCircle, BookOpen } from 'lucide-react';
import { getSupabase, supabaseConfigured, friendlyError } from '../lib/supabase';
const AuthContext=createContext(null);
export const useAuth=()=>useContext(AuthContext);
export function AppShell({children}) {
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[authOpen,setAuthOpen]=useState(false),[menu,setMenu]=useState(false);
  const path=usePathname();
  useEffect(()=>{
    const db=getSupabase();if(!db){setLoading(false);return;}
    let active=true;
    db.auth.getSession().then(({data})=>{if(active){setUser(data.session?.user || null);setLoading(false);}}).catch(()=>{if(active)setLoading(false);});
    const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{if(active){setUser(session?.user||null);setLoading(false);}});
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);
  useEffect(()=>{setMenu(false);},[path]);
  async function signOut(){await getSupabase()?.auth.signOut();setUser(null);}
  const links=[['/','Beranda'],['/materi','Buat Flashcard'],['/belajar','Kartu Saya']];
  return <AuthContext.Provider value={{user,loading,configured:supabaseConfigured,openAuth:()=>setAuthOpen(true)}}>
    <a className="skip-link" href="#main">Lewati ke konten</a>
    <header className="site-header"><div className="nav-wrap"><Link className="brand" href="/" aria-label="Recall beranda"><span className="brand-icon"><Layers size={22}/></span>recall<span className="brand-dot">.</span></Link><nav className="desktop-nav" aria-label="Navigasi utama">{links.map(([url,label])=><Link key={url} href={url} className={(url==='/'?path==='/':path.startsWith(url))?'active':''}>{label}</Link>)}</nav><div className="nav-actions">{user?<><span className="user-label" title={user.email}>{user.email?.split('@')[0]}</span><button className="icon-button" onClick={signOut} aria-label="Keluar akun"><LogOut size={19}/></button></>:<button className="button small secondary" onClick={()=>setAuthOpen(true)}>Masuk <ArrowUpRight size={15}/></button>}<button className="icon-button mobile-toggle" aria-label={menu?'Tutup menu':'Buka menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></div>{menu?<nav id="mobile-menu" className="mobile-nav" aria-label="Navigasi seluler">{links.map(([url,label])=><Link key={url} href={url}>{label}</Link>)}</nav>:null}</header>
    {children}<footer className="site-footer"><Link className="brand" href="/">recall<span className="brand-dot">.</span></Link><span>Belajar sedikit. Ingat lebih lama.</span><span className="footer-credit">Dibuat untuk rasa ingin tahu kamu.</span></footer><AuthModal open={authOpen} onClose={()=>setAuthOpen(false)}/>
  </AuthContext.Provider>;
}
function AuthModal({open,onClose}) {
  const dialog=useRef(null);
  const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  useEffect(()=>{if(open){setError('');setMessage('');dialog.current?.showModal();}else dialog.current?.close();},[open]);
  async function submit(event){
    event.preventDefault();setError('');setMessage('');const db=getSupabase();if(!db){setError('Login belum tersedia. Aplikasi sedang disiapkan.');return;}setBusy(true);
    try {const result=mode==='login'?await db.auth.signInWithPassword({email,password}):await db.auth.signUp({email,password,options:{emailRedirectTo:process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}});if(result.error)throw result.error;if(result.data.session){setPassword('');onClose();}else setMessage('Akun dibuat. Buka email konfirmasi dari Supabase, lalu kembali untuk masuk.');}catch(e){setError(friendlyError(e));}finally{setBusy(false);}
  }
  return <dialog ref={dialog} className="auth-dialog" onCancel={onClose} onClick={e=>{if(e.target===dialog.current&&!busy)onClose();}} aria-labelledby="auth-title"><div className="auth-content"><button className="icon-button close-dialog" onClick={onClose} aria-label="Tutup"><X size={20}/></button><div className="modal-mark"><BookOpen size={27}/></div><p className="eyebrow">RUANG BELAJAR KAMU</p><h2 id="auth-title">{mode==='login'?'Senang kamu kembali.':'Mulai kebiasaan baru.'}</h2><p className="muted">Simpan kartu dan progres, lalu lanjutkan belajar dari perangkat mana pun.</p><form onSubmit={submit}><label>Email<input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="kamu@email.com" maxLength={254}/></label><label>Kata sandi<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='signup'?8:1} value={password} onChange={e=>setPassword(e.target.value)} required placeholder={mode==='signup'?'Minimal 8 karakter':'Kata sandi kamu'}/></label>{error?<p className="notice error" role="alert">{error}</p>:null}{message?<p className="notice success" role="status"><Mail size={18}/>{message}</p>:null}<button disabled={busy} className="button full">{busy?<LoaderCircle className="spin" size={18}/>:null}{mode==='login'?'Masuk':'Buat akun'}</button></form><p className="auth-switch">{mode==='login'?'Belum punya akun?':'Sudah punya akun?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('');}}>{mode==='login'?'Daftar gratis':'Masuk'}</button></p></div></dialog>;
}
export function LoginGate({children}) {
  const {user,loading,openAuth,configured}=useAuth();
  if(loading)return <div className="empty-state"><LoaderCircle className="spin"/><p>Membuka ruang belajar…</p></div>;
  if(!user)return <div className="empty-state"><div className="empty-icon"><Layers size={30}/></div><h2>{configured?'Ruang belajar milikmu.':'Sebentar, kami sedang bersiap.'}</h2><p>{configured?'Masuk untuk membuat flashcard dan menyimpan progres belajarmu.':'Kamu tetap bisa menjelajahi beranda dan mencoba contoh flashcard.'}</p><button className="button" onClick={openAuth}>Masuk atau daftar <ArrowUpRight size={17}/></button><Link className="text-link" href="/belajar/demo">Coba kartu contoh</Link></div>;
  return children;
}
