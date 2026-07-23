import { NEPALI_MONTHS } from './constants'

export function monthEnglishName(index: number): string {
  return NEPALI_MONTHS[index]?.split(' (')[0] ?? ''
}

/** Join selected month indices into a display string, e.g. "Poush & Magh". */
export function formatNepaliMonths(indices: number[]): string {
  return [...indices]
    .sort((a, b) => a - b)
    .map(monthEnglishName)
    .filter(Boolean)
    .join(' & ')
}

/** Parse a stored billing label back to month indices. */
export function parseNepaliMonths(label: string): number[] {
  if (!label?.trim()) return []

  const names = label
    .split(/\s*&\s*/)
    .map((s) => s.trim())
    .filter(Boolean)

  const indices: number[] = []
  for (const name of names) {
    const i = NEPALI_MONTHS.findIndex(
      (m) => m.split(' (')[0].toLowerCase() === name.toLowerCase()
    )
    if (i >= 0 && !indices.includes(i)) indices.push(i)
  }

  return indices.sort((a, b) => a - b)
}

export function countBillingMonths(label: string): number {
  const parsed = parseNepaliMonths(label)
  return Math.max(1, parsed.length || 1)
}

export function rentLineDescription(
  nepaliMonth: string,
  monthlyRent: number,
  monthCount: number
): string {
  if (monthCount <= 1) return 'House Rent'
  const monthly = Number.isInteger(monthlyRent)
    ? monthlyRent.toString()
    : monthlyRent.toFixed(2)
  return `House Rent (${monthCount} months × Rs. ${monthly})`
}
