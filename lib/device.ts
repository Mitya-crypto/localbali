export type DeviceInfo = {
  id: string;
  label: string;
  browser: string;
  os: string;
  platform: string;
  lang: string;
  screen: string;
  tz: string;
  tsFirst: number;
  tsLast: number;
};

const LS_KEY = 'devices_v1';

function djb2(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, '0');
}

function parseBrowser(ua: string) {
  if (/Edg\/(\d+)/.test(ua)) return 'Edge ' + RegExp.$1;
  if (/OPR\/(\d+)/.test(ua)) return 'Opera ' + RegExp.$1;
  if (/Chrome\/(\d+)/.test(ua) && !/OPR|Edg/.test(ua)) return 'Chrome ' + RegExp.$1;
  if (/Firefox\/(\d+)/.test(ua)) return 'Firefox ' + RegExp.$1;
  if (/Version\/(\d+).+Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari ' + RegExp.$1;
  if (/Safari/.test(ua)) return 'Safari';
  return 'Unknown';
}

function parseOS(ua: string) {
  if (/Windows NT 10\.0/.test(ua)) return 'Windows 10';
  if (/Windows NT 11\.0/.test(ua)) return 'Windows 11';
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
  if (/Android ([\d_\.]+)/.test(ua)) return 'Android ' + RegExp.$1.replace(/_/g, '.');
  if (/(iPhone|iPad|iPod).*OS ([\d_]+)/.test(ua)) return 'iOS ' + RegExp.$2.replace(/_/g, '.');
  if (/Mac OS X ([\d_]+)/.test(ua)) return 'macOS ' + RegExp.$1.replace(/_/g, '.');
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

export function currentDevice(): DeviceInfo {
  const nav = typeof navigator !== 'undefined' ? navigator : ({} as any);
  const ua = (nav.userAgent || '') + ((nav as any).userAgentData?.uaList?.join(' ') || '');
  const browser = parseBrowser(ua);
  const os = parseOS(ua);
  const platform = ((nav as any).userAgentData?.platform || (nav as any).platform || '') as string;
  const lang = (nav.languages && nav.languages[0]) || nav.language || 'en';
  const scr = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}` : '';
  const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '';
  const seed = [ua, platform, lang, scr, tz, (nav as any).vendor || ''].join('|');
  const id = djb2(seed);
  const label = [os.split(' ')[0] || 'Device', browser.split(' ')[0] || ''].filter(Boolean).join(' ');
  const now = Date.now();
  return { id, label, browser, os, platform, lang, screen: scr, tz, tsFirst: now, tsLast: now };
}

export function loadDevices(): DeviceInfo[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DeviceInfo[]) : [];
  } catch {
    return [];
  }
}

export function saveDevices(list: DeviceInfo[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function upsertCurrentDevice(): DeviceInfo[] {
  const me = currentDevice();
  const list = loadDevices();
  const idx = list.findIndex(d => d.id === me.id);
  if (idx === -1) {
    list.push(me);
  } else {
    list[idx] = { ...list[idx], ...me, tsFirst: list[idx].tsFirst, tsLast: Date.now() };
  }
  saveDevices(list);
  return list;
}

export function removeDevice(id: string) {
  const list = loadDevices().filter(d => d.id !== id);
  saveDevices(list);
  return list;
}
