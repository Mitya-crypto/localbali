export type DeviceInfo = {
  platform: string;
  browser: string;
  ua: string;
  summary: string;
};
export function detectDevice(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return { platform: 'server', browser: '-', ua: '-', summary: 'server' };
  }
  const ua = navigator.userAgent || '';
  const plat = (navigator as any).userAgentData?.platform || navigator.platform || '';

 let os = '';
  if (/iPhone|iPad|iPod|iOS/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Win/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else os = plat || 'Unknown';

  let browser = 'WebView';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari';

  const summary = `${os} · ${browser}`;
  return { platform: os, browser, ua, summary };
}
