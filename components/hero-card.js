'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Repeat2 } from 'lucide-react';

export function HeroCard() {
  const [flipped, setFlipped] = useState(false);
  return <div className="hero-visual">
    <div className="preview-heading"><span><span className="preview-status" /> RUANG LATIHAN</span><span>COBA SATU KARTU</span></div>
    <div className={`preview-scene ${flipped ? 'is-flipped' : ''}`}>
      <div className="preview-paper">
        <div className="preview-face preview-front" aria-hidden={flipped}>
          <div className="preview-card-top"><span>INFORMATIKA / PERULANGAN</span><span>01</span></div>
          <Repeat2 className="cell-sketch" width={150} height={84} strokeWidth={1.5} aria-hidden="true" />
          <span className="preview-label">PERTANYAAN</span><h2>Apa itu algoritma<br />perulangan?</h2><p>Coba ingat dulu.</p>
        </div>
        <div className="preview-face preview-back" aria-hidden={!flipped}>
          <div className="preview-card-top"><span>INFORMATIKA / PERULANGAN</span><span>01</span></div>
          <span className="preview-answer-mark"><Check size={28} strokeWidth={1.5} /></span>
          <span className="preview-label">JAWABAN</span><h2>Mengulang instruksi<br />sesuai aturan.</h2><p>Instruksi diulang sesuai jumlah atau kondisi tertentu.</p>
        </div>
      </div>
      <button type="button" className="card-hit-area" onClick={() => setFlipped(value => !value)} aria-pressed={flipped} aria-label={flipped ? 'Kembali ke pertanyaan contoh' : 'Balik kartu contoh untuk melihat jawaban'} />
    </div>
    <p className="preview-tap-hint">{flipped ? 'Ketuk lagi untuk kembali ke soal.' : 'Ketuk kartu untuk melihat jawaban.'}</p>
    <div className="preview-footer"><span className="preview-pagination"><i /><i /><i /><span>01 / 05</span></span><Link href="/belajar/demo">Lanjut latihan <ArrowUpRight size={15} /></Link></div>
    <span className="preview-sticky" aria-hidden="true">Jawab dulu.<br /><em>Baru cek.</em></span>
  </div>;
}
