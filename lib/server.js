import { createClient } from '@supabase/supabase-js';

export async function authenticate(request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw Object.assign(new Error('Masuk terlebih dahulu untuk melanjutkan.'), {status:401});
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw Object.assign(new Error('Koneksi Supabase belum dikonfigurasi.'), {status:503});
  const db = createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error} = await db.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('Sesi berakhir. Silakan masuk kembali.'), {status:401});
  return {db,user:data.user};
}

export function apiError(error) {
  const raw = error?.message || '';
  let message = 'Proses belum berhasil. Coba lagi atau gunakan materi yang lebih pendek.';
  let status = error.status || 500;
  if (/schema cache|relation|function.*not find|bucket not found/i.test(raw)) {message='Penyimpanan belum siap. Jalankan supabase/schema.sql di Supabase.';status=503;}
  else if (status === 429 || /quota|rate limit|RESOURCE_EXHAUSTED|batas generate/i.test(raw)) {message='Kuota generate sementara habis. Coba lagi nanti; kartu yang sudah tersimpan tetap bisa dipelajari.';status=429;}
  else if (/API key|PERMISSION_DENIED|model.*not found|NOT_FOUND/i.test(raw)) {message='Konfigurasi Gemini belum valid. Periksa API key dan nama model di Vercel.';status=503;}
  else if (status < 500 || status === 503) message=raw;
  return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
}
