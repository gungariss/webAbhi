'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export function BotVerification({ siteKey, onToken }) {
  const container = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    onToken('');
    let active = true;
    const widget = window.turnstile.render(container.current, {
      sitekey: siteKey, theme: 'light', size: 'flexible',
      callback: token => { if (active) { setFailed(false); onToken(token); } },
      'expired-callback': () => { if (active) onToken(''); },
      'timeout-callback': () => { if (active) onToken(''); },
      'error-callback': () => { if (active) { onToken(''); setFailed(true); } },
    });
    return () => { active = false; onToken(''); window.turnstile?.remove(widget); };
  }, [ready, siteKey, onToken, retry]);
  return <div className="bot-verification">
    <Script id="turnstile-script" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { onToken(''); setFailed(true); }} />
    <div ref={container} aria-label="Verifikasi keamanan" />
    {!ready && !failed ? <p role="status">Memuat verifikasi…</p> : null}
    {failed ? <p role="alert">Verifikasi gagal dimuat. <button type="button" className="text-link" onClick={() => { if (!ready) { window.location.reload(); return; } setFailed(false); setRetry(value => value + 1); }}>Coba lagi</button></p> : null}
  </div>;
}
