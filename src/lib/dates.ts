export type Locale = 'en' | 'th';

const months = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
};

/** Strict date-only parsing. Legacy strings use an explicit month table, never Date.parse. */
export function toISODate(value?: string): string | undefined {
  if (!value) return undefined;
  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  let year: number, month: number, day: number;
  if (match) {
    [, year, month, day] = match.map(Number);
  } else {
    match = /^(\d{1,2}) ([^\s]+) (\d{4})$/.exec(value);
    if (!match) return undefined;
    day = Number(match[1]);
    const thaiMonth = months.th.indexOf(match[2]);
    month = (thaiMonth >= 0 ? thaiMonth : months.en.indexOf(match[2])) + 1;
    year = Number(match[3]) - (thaiMonth >= 0 ? 543 : 0);
  }
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatDate(value: string | undefined, locale: Locale): string {
  const iso = toISODate(value);
  if (!iso) return value?.trim() || '';
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    calendar: locale === 'th' ? 'buddhist' : 'gregory',
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** One request snapshot, shared by SSR and hydration; valid through the expiry day in Bangkok. */
export function todayInBangkok(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', calendar: 'gregory', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function certificationStatus(validUntil: string | undefined, today: string, issued?: string) {
  const expiry = toISODate(validUntil);
  const current = toISODate(today);
  const issue = toISODate(issued);
  if (!expiry || !current || (issue && expiry < issue)) return 'unavailable';
  if (issue && issue > current) return 'notYetValid';
  return expiry < current ? 'expired' : 'valid';
}
