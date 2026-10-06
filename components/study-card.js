'use client';
import { useId } from 'react';
import { Check } from 'lucide-react';

export function StudyCard({ card, number, revealed, onToggle, busy, tools }) {
  const id = useId();
  return <div className="study-card">
    {tools ? <div className="study-card-tools">{tools}</div> : null}
    <div className="study-flip-scene">
      <article id={id} className={`study-flip-card ${revealed ? 'is-flipped' : ''}`} aria-live="polite" aria-atomic="true">
        <section className="study-card-face study-card-front" aria-hidden={revealed}>
          <span className="mini-chip">SOAL</span>
          <div className="study-card-content"><span className="card-number">{String(number).padStart(2, '0')}</span><h2 id={`${id}-question`}>{card.question}</h2></div>
          <p className="study-card-hint">Ketuk kartu untuk melihat jawaban.</p>
        </section>
        <section className="study-card-face study-card-back" aria-hidden={!revealed}>
          <span className="mini-chip">JAWABAN</span>
          <div className="study-card-content"><span className="study-answer-symbol" aria-hidden="true"><Check size={25} strokeWidth={1.5} /></span><h2 id={`${id}-answer`} className="study-card-answer">{card.answer}</h2></div>
          {card.reference ? <p className="study-card-reference">{card.reference}</p> : null}
          <p className="study-card-hint answer-tap-hint">Ketuk lagi untuk kembali ke soal.</p>
        </section>
      </article>
      <button type="button" className="card-hit-area" onClick={onToggle} disabled={busy} aria-label={revealed ? 'Kembali ke soal' : 'Balik kartu untuk melihat jawaban'} aria-describedby={`${id}-${revealed ? 'answer' : 'question'}`} aria-pressed={revealed} aria-controls={id} />
    </div>
  </div>;
}
