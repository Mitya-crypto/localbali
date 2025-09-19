export type KycDocType = 'passport' | 'id' | 'driver';

export type KycState = {
  status: 'not_started' | 'in_progress' | 'submitted' | 'verified';
  docType?: KycDocType;
  country?: { code: string; name: string };
  images: {
    passport?: { photo?: string; selfie?: string };
    id?: { front?: string; back?: string; selfie?: string };
    driver?: { front?: string; back?: string; selfie?: string };
  };
};

const KEY = 'kyc.v1.state';

function defState(): KycState {
  return { status: 'not_started', images: {} };
}

export function read(): KycState {
  if (typeof window === 'undefined') return defState();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defState(), ...JSON.parse(raw) } : defState();
  } catch { return defState(); }
}

function write(s: KycState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
  try { window.dispatchEvent(new Event('storage')); } catch {}
}

export function setDocType(t: KycDocType) {
  const s = read();
  s.docType = t;
  s.status = 'in_progress';
  write(s);
}

export function setCountry(code: string, name: string) {
  const s = read();
  s.country = { code, name };
  s.status = s.status === 'not_started' ? 'in_progress' : s.status;
  write(s);
}

export function clearKyc() { write(defState()); }

export function progress() {
  const s = read();
  const g = { doc: false, selfie: false };
  if (s.docType === 'passport') {
    g.doc = !!s.images.passport?.photo;
    g.selfie = !!s.images.passport?.selfie;
  } else if (s.docType === 'id') {
    g.doc = !!s.images.id?.front && !!s.images.id?.back;
    g.selfie = !!s.images.id?.selfie;
  } else if (s.docType === 'driver') {
    g.doc = !!s.images.driver?.front && !!s.images.driver?.back;
    g.selfie = !!s.images.driver?.selfie;
  }
  return { ...g, ready: g.doc && g.selfie, state: s };
}

export async function saveImage(
  opts: { type: KycDocType; field: 'photo'|'front'|'back'|'selfie'; file: File; maxW?: number; quality?: number }
){
  const { type, field, file, maxW = 1600, quality = 0.85 } = opts;
  const dataUrl = await fileToJpegDataUrl(file, maxW, quality);

  const s = read();
  if (type === 'passport') {
    s.images.passport = { ...(s.images.passport||{}), [field]: dataUrl };
  } else if (type === 'id') {
    s.images.id = { ...(s.images.id||{}), [field]: dataUrl };
  } else if (type === 'driver') {
    s.images.driver = { ...(s.images.driver||{}), [field]: dataUrl };
  }
  s.status = s.status === 'not_started' ? 'in_progress' : s.status;
  write(s);
  return dataUrl;
}

export function submitKyc() {
  const s = read();
  // В демо подтверждаем сразу
  s.status = 'verified';
  write(s);
}

export function isVerified(){ return read().status === 'verified'; }

export function removeImage(type: KycDocType, field: 'photo'|'front'|'back'|'selfie') {
  const s = read();
  if (type === 'passport' && s.images.passport) delete (s.images.passport as any)[field];
  if (type === 'id' && s.images.id) delete (s.images.id as any)[field];
  if (type === 'driver' && s.images.driver) delete (s.images.driver as any)[field];
  write(s);
}

// ——— Helpers ———
export async function fileToJpegDataUrl(file: File, maxW=1600, quality=0.85): Promise<string> {
  const isPdf = file.type === 'application/pdf';
  if (isPdf) {
    return await readAsDataURL(file);
  }
  const img = await loadAsImage(file);
  const { canvas, ctx } = createCanvasScaled(img, maxW);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(fr.error);
    fr.onload = () => res(String(fr.result));
    fr.readAsDataURL(file);
  });
}

function loadAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = rej;
    img.src = url;
  });
}

function createCanvasScaled(img: HTMLImageElement, maxW: number) {
  const ratio = img.width / img.height || 1;
  const w = Math.min(maxW, img.width || maxW);
  const h = Math.round(w / ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  return { canvas, ctx };
}
