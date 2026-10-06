# Recall — webAbhi

Website flashcard active recall dengan Next.js, Supabase dan Gemini API. Tiga laman utama: Beranda, Buat Flashcard, dan Kartu Saya. Sesi belajar tersedia di `/belajar/[id]`; `/belajar/demo` dapat dicoba tanpa akun.

## Aktifkan Supabase

1. Buat proyek di Supabase.
2. Buka **SQL Editor → New query**, salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu klik **Run**. Skrip membuat tabel, fungsi penyimpanan atomik, RLS, pembatasan generate, serta bucket privat `materials`. Dapat dijalankan ulang pada skema aplikasi ini.
3. Di **Authentication → Providers**, aktifkan Email. Jika konfirmasi email aktif, pengguna harus mengonfirmasi email sebelum masuk.
4. Di **Authentication → URL Configuration**, isi **Site URL** dengan `https://webabhi.vercel.app`. Tambahkan URL tersebut ke daftar Redirect URLs. Untuk lokal, tambahkan `http://localhost:3000`. Tambahkan alamat Preview tertentu hanya jika kamu menggunakannya.
5. Salin Project URL dan Publishable Key dari dialog **Connect** / **Settings → API Keys**. Key `anon` versi lama juga didukung.

## Environment variable di Vercel

Buka **webabhi → Settings → Environment Variables**. Isi untuk Production dan, bila diperlukan, Preview:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
GEMINI_API_KEY=REPLACE_ME
GEMINI_MODEL=gemini-3.8-flash
NEXT_PUBLIC_SITE_URL=https://webabhi.vercel.app
```

Jika memakai key `anon` versi lama, ganti variabel publishable dengan:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Pilih salah satu key publik. Jika keduanya diisi, publishable key diprioritaskan. Tidak diperlukan service_role/secret key, database password, atau DATABASE_URL. Semua operasi Supabase memakai identitas pengguna dan RLS. Gemini API key hanya digunakan di server. Jangan commit `.env.local` atau secret ke repository.

Buat Gemini key melalui Google AI Studio pada proyek free tier dan pastikan model yang dipilih tersedia untuk proyek tersebut. Model dapat diganti melalui GEMINI_MODEL. **Redeploy setelah mengubah environment variables**, terutama variabel NEXT_PUBLIC yang dimasukkan ke bundle ketika build.

## Pengembangan lokal

```bash
npm ci
cp .env.example .env.local
# Isi .env.local sebelum menjalankan aplikasi
npm run dev
```

```bash
npm test
npm run build
npm start
```

## Fitur

- Login/daftar email dan password, konfirmasi email sesuai pengaturan Supabase.
- PDF: satu file maksimal 10 MB; dibaca secara multimodal, termasuk PDF hasil scan yang jelas.
- YouTube: satu URL video publik. Tidak mendukung video private/unlisted; gunakan video singkat untuk mengurangi waktu dan kuota.
- Gambar: JPG/PNG/WebP, maksimal 10 file, maksimal 10 MB per file sebelum kompresi; total maksimal 10 MB sesudah kompresi. Pratinjau, hapus dan urutkan gambar tersedia.
- Upload langsung dari browser ke Supabase Storage privat. Backend mengunduh file milik pengguna dan mengirimnya ke Gemini; payload upload tidak melewati Vercel Functions.
- Pilih bahasa Indonesia/Inggris dan 10/20/30 kartu. Materi pendek menghasilkan lebih sedikit kartu.
- JSON output divalidasi, pertanyaan duplikat dihapus, hasil dan kartu disimpan dalam transaksi SQL.
- Progres tersimpan per pengguna dan tersinkron antarperangkat. Membuka jawaban, menilai kartu, edit dan mengulang tidak memanggil AI.
- Edit/hapus kartu, acak, ulang semua / kartu yang belum dikuasai, ekspor JSON dan impor JSON.
- Lihat sumber PDF/gambar melalui signed URL berlaku 2 menit. Klik ulang Lihat materi sumber untuk membuat URL baru.
- Limit aplikasi: 5 percobaan generate per jam dan 20 per 24 jam per akun; kuota Google proyek tetap berlaku. Percobaan gagal ikut dihitung; menghapus kumpulan kartu tidak mereset limit.
- Sesi contoh tidak disimpan ke database.

## Data dan keamanan

Tabel: decks, source_files, cards, card_progress, generation_requests. Setiap pengguna hanya mengakses kartu, progres, dan objek Storage miliknya. Backend memvalidasi access token menggunakan Supabase getUser sebelum memproses input. Gemini API key tidak dikirim ke browser. Sumber diperlakukan sebagai materi, bukan instruksi AI. Hasil AI tetap harus diperiksa pengguna.

File sumber disimpan sampai pengguna menghapus kumpulan kartunya. Upload yang gagal dibersihkan bila hasilnya diketahui; penutupan tab atau timeout dapat meninggalkan file tanpa kumpulan kartu dan memerlukan pembersihan administratif berkala. Tidak ada service key yang disimpan untuk melakukan pembersihan global otomatis.

Free tier Gemini dapat memakai konten untuk peningkatan produk Google; form meminta persetujuan pengguna. Biaya dan kuota Supabase/Vercel mengikuti akun penyedia masing-masing.

## Deploy

Source berada di repo `gungariss/webAbhi`, branch `main`, root directory repository. Framework: Next.js; install: `npm ci`; build: `npm run build`; Node.js: 24.x.

Untuk deployment otomatis, pastikan **Vercel → Settings → Git** benar-benar menghubungkan `gungariss/webAbhi` dan Production Branch `main`. Deployment manual dari commit Git tidak menjamin Git integration otomatis sudah aktif.

## Verifikasi

Tes `npm test` mencakup validasi URL/schema dan SQL PostgreSQL dalam PGlite: isolasi antar pengguna, storage privat, transaksi kartu dan limit generate yang tidak bisa direset dengan menghapus deck. Tes SQL menggunakan stub auth/storage untuk pengujian lokal; ini tidak menggantikan smoke test di proyek Supabase asli. Login, email konfirmasi dan generate Gemini perlu diuji setelah kredensial serta SQL proyek asli tersedia.
