import Link from 'next/link';
import { ArrowRight, FileText, CirclePlay, Image as ImageIcon, WandSparkles, RotateCcw, ArrowUpRight } from 'lucide-react';
import { HeroCard } from '../components/hero-card';

const steps = [
  { icon: FileText, n: '01', label: 'KUMPULKAN', title: 'Bawa materimu.', text: 'Pilih PDF, link YouTube, atau hingga 10 gambar.' },
  { icon: WandSparkles, n: '02', label: 'SUSUN', title: 'Jadikan pertanyaan.', text: 'Pilih jumlah dan bahasa. AI menyusun kartunya.' },
  { icon: RotateCcw, n: '03', label: 'LATIH', title: 'Ingat. Cek. Ulangi.', text: 'Jawab, cek, lalu ulangi kartu yang sulit.' },
];
export default function Home() {
  return <main id="main">
    <section className="hero page-width">
      <div className="hero-copy">
        <p className="hero-kicker"><span className="tiny-dot" /> BELAJAR DENGAN ACTIVE RECALL</p>
        <h1>Baca itu awal.<br /><span>Ingat lebih lama.</span></h1>
        <p className="hero-description">Ubah materi jadi flashcard. Latih ingatan, satu kartu setiap kali.</p>
        <div className="hero-actions"><Link className="button" href="/materi">Buat flashcard <ArrowUpRight size={19} /></Link><Link className="text-link" href="/belajar/demo">Coba sesi contoh <ArrowRight size={17} /></Link></div>
        <div className="source-pills"><span><FileText size={15} /> PDF</span><span><CirclePlay size={15} /> YouTube</span><span><ImageIcon size={15} /> Gambar</span></div>
      </div>
      <HeroCard />
    </section>
    <section className="intro-strip"><div className="page-width" data-reveal><div className="intro-label"><span className="eyebrow">KENAPA ACTIVE RECALL?</span><span className="intro-index">↗</span></div><p>Jangan cuma mengenali.<br /><strong>Coba mengingat kembali.</strong></p><span>Jawab tanpa melihat catatan. Ulangi bagian yang belum kamu pahami.</span></div></section>
    <section className="page-width section" id="panduan"><div className="section-heading" data-reveal><div><p className="eyebrow">CARA MULAI</p><h2>Dari catatan,<br /><em>jadi pemahaman.</em></h2></div><p>Siapkan materi. Mulai latihan.</p></div><div className="steps-grid">{steps.map(({ icon: Icon, n, label, title, text }, index) => <article className="step-card" key={n} data-reveal style={{ '--reveal-delay': `${index * 90}ms` }}><div className="step-top"><span className="step-number">{n}</span><Icon size={25} strokeWidth={1.5} /></div><p className="step-label">{label}</p><h3>{title}</h3><p>{text}</p><span className="step-rule" /></article>)}</div></section>
    <section className="page-width" data-reveal><div className="home-cta"><span className="cta-doodle" aria-hidden="true">↗</span><div><p className="eyebrow">MULAI DARI SATU TOPIK</p><h2>Belajar pelan-pelan.<br /><em>Majunya tetap terasa.</em></h2><p>Mulai dari satu sesi singkat.</p></div><Link className="button dark" href="/materi">Mulai belajar <ArrowUpRight size={19} /></Link></div></section>
  </main>;
}

