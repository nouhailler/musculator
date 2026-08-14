import { useEffect, useRef, useState } from 'react';
import Icon from './ui/Icon.jsx';
import { SecondaryButton } from './ui/Button.jsx';

/**
 * Camera barcode scanner.
 *
 * Two engines, in order of preference:
 *
 *  1. The native BarcodeDetector API — free (nothing to download), decoded by
 *     the platform. Chrome/Edge on Android.
 *  2. @zxing/browser, loaded on demand — covers iOS Safari and Firefox, where
 *     BarcodeDetector does not exist.
 *
 * zxing is a dynamic import on purpose: it is a few hundred KB of decoder that
 * only matters once someone actually opens the scanner, and browsers with the
 * native API never fetch it at all. Same reasoning as the CIQUAL chunk.
 *
 * `BrowserMultiFormatOneDReader` rather than the full multi-format reader:
 * food barcodes are 1D (EAN-13/EAN-8/UPC), so the QR/Aztec/PDF417/DataMatrix
 * decoders would be dead weight.
 *
 * iOS notes: getUserMedia needs a secure context, so the camera only works over
 * HTTPS (or localhost) — over plain HTTP the component reports the failure and
 * falls back to manual entry. The video element must also be muted and carry
 * `playsinline`, otherwise iOS takes it fullscreen.
 */
export default function BarcodeScanner({ onDetected, onCancel }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [engine, setEngine] = useState('');

  useEffect(() => {
    let stopped = false;
    let stream = null;
    let raf = 0;
    let controls = null;

    const fail = (e) => {
      if (stopped) return;
      setError(e?.name === 'NotAllowedError'
        ? "Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, ou saisis le code à la main."
        : (!window.isSecureContext
          ? "La caméra exige une connexion sécurisée (HTTPS). Saisis le code à la main."
          : "Caméra indisponible. Saisis le code à la main."));
    };

    const hit = (value) => {
      if (stopped || !value) return;
      stopped = true;
      onDetected(String(value));
    };

    // --- 1. Native path ------------------------------------------------------
    const runNative = async () => {
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      });
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (stopped) return;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setEngine('natif');

      const tick = async () => {
        if (stopped) return;
        try {
          const codes = await detector.detect(video);
          const value = codes.find((c) => c.rawValue)?.rawValue;
          if (value) { hit(value); return; }
        } catch {
          // A transient decode failure between frames is normal — keep going.
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // --- 2. zxing fallback ---------------------------------------------------
    const runZxing = async () => {
      const { BrowserMultiFormatOneDReader } = await import('@zxing/browser');
      if (stopped) return;
      const reader = new BrowserMultiFormatOneDReader();
      setEngine('zxing');
      // zxing owns the stream here; its controls.stop() releases the camera.
      controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result) => { if (result) hit(result.getText()); },
      );
    };

    const start = async () => {
      try {
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          await runNative();
        } else {
          await runZxing();
        }
      } catch (e) {
        fail(e);
      }
    };
    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (controls) controls.stop();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  if (error) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 16, textAlign: 'center', marginBottom: 12 }}>
        <Icon name="cloud-slash" size={26} color="var(--color-neutral-500)" style={{ display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.55, marginBottom: 12 }}>{error}</div>
        <SecondaryButton icon="x" onClick={onCancel} style={{ justifyContent: 'center' }}>Fermer le scanner</SecondaryButton>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', marginBottom: 12 }}>
      {/* muted + playsInline are required for iOS to keep the preview inline. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} playsInline muted autoPlay style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: '18% 10%', border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-md)', boxShadow: '0 0 0 100vmax rgba(0,0,0,.35)' }} />
      <button
        type="button"
        onClick={onCancel}
        style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.55)', border: 'none', color: 'var(--color-text)', borderRadius: 999, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
      >
        Fermer
      </button>
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: '#fff', textShadow: '0 1px 3px #000' }}>
        {engine === 'zxing' ? 'Vise le code-barres (lecteur zxing)' : 'Vise le code-barres'}
      </div>
    </div>
  );
}
