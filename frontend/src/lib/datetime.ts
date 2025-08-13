//takes browser's local timezone via a date and time, then combines
//it to an ISO string in UTC time.
export function localDateTimeToUtcISO(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const local = new Date(y, m - 1, d, hh, mm, 0);
  return local.toISOString(); // UTC ISO
}