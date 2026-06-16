const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface DayLabel {
  dow: string;
  date: string;
}

/** Seven day labels starting today, for display purposes only. */
export function weekLabels(start: Date = new Date()): DayLabel[] {
  const out: DayLabel[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ dow: DOW[d.getDay()], date: `${MON[d.getMonth()]} ${d.getDate()}` });
  }
  return out;
}
