import { createClient } from '@supabase/supabase-js';

export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
let client;
export function getSupabase() {
  if (!supabaseConfigured) return null;
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return client;
}

export function friendlyError(error) {
  const message = error?.message || '';
  if (/relation|schema cache|function.*not find|bucket not found/i.test(message)) return 'Penyimpanan belum siap. Jalankan supabase/schema.sql di SQL Editor Supabase.';
  if (/invalid login credentials/i.test(message)) return 'Email atau kata sandi belum benar.';
  if (/email not confirmed/i.test(message)) return 'Konfirmasi email kamu terlebih dahulu, lalu masuk lagi.';
  if (/rate limit|too many|quota/i.test(message)) return 'Batas penggunaan sementara tercapai. Coba lagi nanti.';
  if (/fetch|network/i.test(message)) return 'Koneksi gagal. Periksa internet dan coba lagi.';
  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}
