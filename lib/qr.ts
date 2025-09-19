export type StopScan = () => void;

/**
 * Запускает сканер QR для <video>. Если есть native BarcodeDetector — используем его.
 * Иначе — фолбэк на ZXing. Возвращает функцию остановки (обязательно звать при уходе).
 */
export async function startQrScan(
  videoEl: HTMLVideoElement,
  onResult: (text: string) => void
): Promise<StopScan> {
  // 1) Пытаемся через native BarcodeDetector
  const BD: any = (typeof window !== 'undefined') ? (window as any).BarcodeDetector : undefined;
  if (BD && BD.prototype?.detect) {
    const detector = new BD({ formats: ['qr_code'] });
    let stopped = false;
    let raf: number | null = null;

    const loop = async () => {
      if (stopped) return;
      try {
        const res = await detector.detect(videoEl);
        const qr = res?.[0]?.rawValue;
        if (qr) {
          stopped = true;
          if (raf) cancelAnimationFrame(raf);
          onResult(qr);
          return;
        }
      } catch {}
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }

  // 2) Фолбэк на ZXing
  const zxb: any = await import('@zxing/browser');
  const zxl: any = await import('@zxing/library');
  const hints = new Map();
  hints.set(zxl.DecodeHintType.POSSIBLE_FORMATS, [zxl.BarcodeFormat.QR_CODE]);
  const reader = new zxb.BrowserMultiFormatReader(hints, 400); // интервал декодирования ~400мс

  // Непрерывное декодирование из уже проигрываемого <video>
  reader.decodeFromVideoElementContinuously(videoEl, (result: any, err: any) => {
    if (result && typeof result.getText === 'function') {
      const text = result.getText();
      if (text) {
        try {
          stop();
        } finally {
          onResult(text);
        }
      }
    }
  });

  const stop = () => {
    try { reader.stopContinuousDecode?.(); } catch {}
    try { reader.reset?.(); } catch {}
  };
  return stop;
}
