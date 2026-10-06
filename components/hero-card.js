'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

export function HeroCard() {
  const [flipped, setFlipped] = useState(false);
  return <div className="hero-visual">
    <div className="preview-heading"><span><span className="preview-status" /> RUANG LATIHAN</span><span>COBA SATU KARTU</span></div>
    <div className={`preview-scene ${flipped ? 'is-flipped' : ''}`}>
      <div className="preview-paper">
        <div className="preview-face preview-front" aria-hidden={flipped}>
          <div className="preview-card-top"><span>BIOLOGI / STRUKTUR SEL</span><span>01</span></div>
          <svg className="cell-sketch" viewBox="0 0 150 84" fill="none" aria-hidden="true"><path d="M15 48C9 22 39 10 74 10s61 12 62 33-28 33-65 31S22 69 15 48Z" stroke="currentColor" strokeWidth="2" /><path d="M27 45C23 28 46 20 73 20s48 7 49 22-23 24-50 22-41-4-45-19Z" stroke="currentColor" strokeWidth="1.4" /><path d="m43 26 9 12-11 12 11 11m17-40 10 16-10 12 7 15m21-38 9 11-12 12 7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="preview-label">PERTANYAAN</span><h2>Apa fungsi utama<br />mitokondria?</h2><p>Coba ingat dulu.</p>
        </div>
        <div className="preview-face preview-back" aria-hidden={!flipped}>
          <div className="preview-card-top"><span>BIOLOGI / STRUKTUR SEL</span><span>01</span></div>
          <span className="preview-answer-mark"><Check size={28} strokeWidth={1.5} /></span>
          <span className="preview-label">JAWABAN</span><h2>Pembangkit energi<br />di dalam sel.</h2><p>Mitokondria menghasilkan ATP melalui respirasi seluler.</p>
        </div>
      </div>
      <button type="button" className="card-hit-area" onClick={() => setFlipped(value => !value)} aria-pressed={flipped} aria-label={flipped ? 'Kembali ke pertanyaan contoh' : 'Balik kartu contoh untuk melihat jawaban'} />
    </div>
    <p className="preview-tap-hint">{flipped ? 'Ketuk lagi untuk kembali ke soal.' : 'Ketuk kartu untuk melihat jawaban.'}</p>
    <div className="preview-footer"><span className="preview-pagination"><i /><i /><i /><span>01 / 05</span></span><Link href="/belajar/demo">Lanjut latihan <ArrowUpRight size={15} /></Link></div>
    <span className="preview-sticky" aria-hidden="true">Jawab dulu.<br /><em>Baru cek.</em></span>
  </div>;
}
