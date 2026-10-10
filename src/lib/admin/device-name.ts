const OS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Windows/, 'Windows'],
  [/Linux/, 'Linux'],
];

const BROWSER: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/coc_coc_browser/i, 'Cốc Cốc'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/Firefox\/|FxiOS/, 'Firefox'],
  [/Chrome\/|CriOS/, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const pick = (ua: string, list: [RegExp, string][]) => list.find(([re]) => re.test(ua))?.[1];

export function deviceName(ua: string): string {
  const browser = pick(ua, BROWSER);
  const os = pick(ua, OS);
  if (browser && os) return `${browser} trên ${os}`;
  return browser ?? os ?? 'Thiết bị không rõ';
}
