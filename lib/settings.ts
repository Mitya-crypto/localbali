export type Settings = {
  hideBalance: boolean;
  pinEnabled: boolean;
};

const KEY = 'settings.v1';
const DEF: Settings = { hideBalance: false, pinEnabled: false };

function read(): Settings {
  if (typeof window === 'undefined') return DEF;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEF, ...JSON.parse(raw) } : DEF;
  } catch {
    return DEF;
  }
}

function write(next: Settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function get<K extends keyof Settings>(k: K): Settings[K] {
  return read()[k];
}

export function set<K extends keyof Settings>(k: K, v: Settings[K]) {
  const cur = read();
  const next = { ...cur, [k]: v };
  write(next);
  try {
    window.dispatchEvent(
      new CustomEvent('settings-change', { detail: { key: k, value: v } } as any)
    );
  } catch {}
}
