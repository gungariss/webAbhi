import Link from 'next/link';
import { ArrowRight, FileText, CirclePlay, Image as ImageIcon, WandSparkles, RotateCcw, ArrowUpRight } from 'lucide-react';
import { HeroCard } from '../components/hero-card';

const steps = [
  { icon: FileText, n: '01', label: 'KUMPULKAN', title: 'Bawa materimu.', text: 'Unggah PDF, tempel link YouTube, atau pilih hingga 10 gambar catatan. Satu topik dulu juga cukup.' },
  { icon: WandSparkles, n: '02', label: 'SUSUN', title: 'Jadikan pertanyaan.', text: 'Pilih bahasa dan jumlah kartu. AI membantu merangkum konsep penting menjadi pertanyaan yang bisa kamu latih.' },
  { icon: RotateCcw, n: '03', label: 'LATIH', title: 'Ingat. Cek. Ulangi.', text: 'Coba jawab sebelum membuka kartu. Nilai pemahamanmu, lalu ulangi bagian yang masih terasa sulit.' },
];
export default function Home() {
  return <main id="main">
    <section className="hero page-width">
      <div className="hero-copy">
        <p className="hero-kicker"><span className="tiny-dot" /> RUANG KECIL UNTUK IDE BESAR</p>
        <h1>Baca itu awal.<br /><span>Ingat lebih lama.</span></h1>
        <p className="hero-description">Catatanmu punya banyak hal untuk diceritakan. Ubah jadi flashcard, tantang ingatanmu, dan pahami satu konsep setiap kali.</p>
        <div className="hero-actions"><Link className="button" href="/materi">Buat flashcard <ArrowUpRight size={19} /></Link><Link className="text-link" href="/belajar/demo">Coba sesi contoh <ArrowRight size={17} /></Link></div>
        <div className="source-pills"><span><FileText size={15} /> PDF</span><span><CirclePlay size={15} /> YouTube</span><span><ImageIcon size={15} /> Gambar</span></div>
        <div className="hero-footnote"><span>01</span><p>Sedikit usaha sekarang.<br /><strong>Lebih paham saat dibutuhkan.</strong></p></div>
      </div>
      <HeroCard />
    </section>
    <section className="intro-strip"><div className="page-width" data-reveal><div className="intro-label"><span className="eyebrow">KENAPA ACTIVE RECALL?</span><span className="intro-index">↗</span></div><p>Jangan cuma mengenali.<br /><strong>Coba mengingat kembali.</strong></p><span>Jawab pertanyaan tanpa melihat catatan. Dengan flashcard, kamu bisa menemukan bagian yang sudah dipahami dan bagian yang perlu dilatih lagi.</span></div></section>
    <section className="page-width section" id="panduan"><div className="section-heading" data-reveal><div><p className="eyebrow">CARA MULAI</p><h2>Dari catatan,<br /><em>jadi pemahaman.</em></h2></div><p>Tiga langkah sederhana.<br />Buat ruang untuk kebiasaan belajar yang baru.</p></div><div className="steps-grid">{steps.map(({ icon: Icon, n, label, title, text }, index) => <article className="step-card" key={n} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><div className="step-top"><span className="step-number">{n}</span><Icon size={25} strokeWidth={1.5} /></div><p className="step-label">{label}</p><h3>{title}</h3><p>{text}</p><span className="step-rule" /></article>)}</div></section>
    <section className="page-width" data-reveal><div className="home-cta"><span className="cta-doodle" aria-hidden="true">↗</span><div><p className="eyebrow">MULAI DARI SATU TOPIK</p><h2>Belajar pelan-pelan.<br /><em>Majunya tetap terasa.</em></h2><p>Satu sesi singkat hari ini. Satu langkah lebih paham.</p></div><Link className="button dark" href="/materi">Bawa materi pertamamu <ArrowUpRight size={19} /></Link></div></section>
  </main>;
}
