const pad = (n: number) => String(n).padStart(2, '0');

/** Format a date as YYYY-MM-DD (mono, tabular, quiet). */
export function fmtDate(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Short month-year form, e.g. "Mar 2025". */
export function fmtMonthYear(d: Date): string {
	return d
		.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
		.replace(' ', ' ');
}
