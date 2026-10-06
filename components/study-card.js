'use client';
import { useId } from 'react';
import { Check, Eye, RotateCcw } from 'lucide-react';

export function StudyCard({ card, number, revealed, onToggle, busy, tools }) {
  const id = useId();
  return <div className="study-card">
    {tools ? <div className="study-card-tools">{tools}</div> : null}
    <div className="study-flip-scene">
      <article id={id} className={`study-flip-card ${revealed ? 'is-flipped' : ''}`} aria-live="polite" aria-atomic="true">
        <section className="study-card-face study-card-front" aria-hidden={revealed}>
          <span className="mini-chip">SOAL</span>
          <div className="study-card-content"><span className="card-number">{String(number).padStart(2, '0')}</span><h2>{card.question}</h2></div>
          <p className="study-card-hint">Coba ingat dulu.</p>
        </section>
        <section className="study-card-face study-card-back" aria-hidden={!revealed}>
          <span className="mini-chip">JAWABAN</span>
          <div className="study-card-content"><span className="study-answer-symbol" aria-hidden="true"><Check size={25} strokeWidth={1.5} /></span><h2 className="study-card-answer">{card.answer}</h2></div>
          {card.reference ? <p className="study-card-reference">{card.reference}</p> : null}
        </section>
      </article>
    </div>
    <button type="button" className="button study-flip-toggle" onClick={onToggle} disabled={busy} aria-pressed={revealed} aria-controls={id}><span>{revealed ? 'Kembali ke soal' : 'Lihat jawaban'}</span>{revealed ? <RotateCcw size={18} /> : <Eye size={18} />}</button>
  </div>;
}
