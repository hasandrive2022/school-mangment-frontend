const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert Latin digits in a string/number to Bengali digits. */
export function toBn(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** "১৮" — Bengali day-of-month for an ISO date string. */
export function bnDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return toBn(d.getDate());
}

/** "অক্টোবর ২০২৬" — Bengali month + year for an ISO date string. */
export function bnMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("bn-BD", { month: "long", year: "numeric" }).format(d);
}

/** "১৮ অক্টোবর ২০২৬" — full Bengali date for an ISO date string. */
export function bnDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
