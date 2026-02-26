const NTC_TIMESTAMP_RE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

export function parseNtcTimestamp(raw: string): Date {
  const match = NTC_TIMESTAMP_RE.exec(raw);
  if (!match) throw new Error(`Invalid NTC timestamp: "${raw}"`);
  const [, year, month, day, hour, minute, second] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
  return new Date(iso);
}

export function getTaipeiDayOfWeek(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
  });
  const dayName = formatter.format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[dayName]!;
}
