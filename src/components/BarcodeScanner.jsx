import { useEffect, useRef, useState } from 'react';
import Icon from './ui/Icon.jsx';
import { SecondaryButton } from './ui/Button.jsx';

/**
 * Camera barcode scanner built on the native BarcodeDetector API.
 *
 * No scanning library is bundled on purpose: the app ships React + Phosphor and
 * nothing else, and @zxing/browser or html5-qrcode would add a few hundred KB
 * to a PWA that precaches everything. BarcodeDetector covers Chrome/Edge on
 * Android — the platform this is actually used on — and everywhere else the
 * component says so and hands over to the manual barcode field, which reaches
 * the same Open Food Facts lookup. Swap in @zxing/browser here if iOS Safari
 * or Firefox support is needed; nothing outside this file has to change.
 */
export default function BarcodeScanner({ onDetected, onCancel }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setSupported(false);
      return undefined;
    }
    let stream = null;
    let raf = 0;
    let stopped = false;

    const run = async () => {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(video);
            const value = codes.find((c) => c.rawValue)?.rawValue;
            if (value) { stopped = true; onDetected(value); return; }
          } catch {
            // A transient decode failure is normal between frames — keep going.
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setError(e?.name === 'NotAllowedError'
          ? "Accès à la caméra refusé. Autorise-le, ou saisis le code à la main."
          : "Caméra indisponible. Saisis le code à la main.");
      }
    };
    run();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  if (!supported || error) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center' }}>
        <Icon name="cloud-slash" size={26} color="var(--color-neutral-500)" style={{ display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.55, marginBottom: 12 }}>
          {error || "Ce navigateur ne sait pas lire un code-barres par la caméra (fonctionne sur Chrome Android). Saisis le code à la main juste en dessous."}
        </div>
        <SecondaryButton icon="x" onClick={onCancel} style={{ justifyContent: 'center' }}>Fermer le scanner</SecondaryButton>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', marginBottom: 12 }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: '18% 10%', border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-md)', boxShadow: '0 0 0 100vmax rgba(0,0,0,.35)' }} />
      <button
        type="button"
        onClick={onCancel}
        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.55)', border: 'none', color: 'var(--color-text)', borderRadius: 999, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
      >
        Fermer
      </button>
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: '#fff', textShadow: '0 1px 3px #000' }}>
        Vise le code-barres
      </div>
    </div>
  );
}
