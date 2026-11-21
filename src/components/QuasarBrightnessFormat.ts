// Number formatting for Black Holes 11 (quasars). Shared by the page, the pictures and the introduction. It only writes numbers that the physics module
// (src/physics/quasarBrightness.ts) has computed; it calculates nothing itself (CLAUDE.md §9).

import { FUEL_CHOICES, RATIO_CHOICES, WIDTH_CHOICES } from '../physics/quasarBrightness'
import type { FuelChoiceId, RatioChoiceId, WidthChoiceId } from '../physics/quasarBrightness'

// The number of Suns for the buttons and the table, in words that need no scientific notation.
export function formatSuns(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toLocaleString('en-US', { maximumFractionDigits: 2 })} trillion Suns`
  if (value >= 1e9) return `${(value / 1e9).toLocaleString('en-US', { maximumFractionDigits: 2 })} billion Suns`
  return `${value.toLocaleString('en-US')} Suns`
}

// A number with a sensible number of digits: whole numbers from 100 up, two decimals from 1, two significant figures below that.
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'not available'
  if (value >= 100) return Math.round(value).toLocaleString('en-US')
  if (value >= 1) return value.toFixed(2)
  return Number(value.toPrecision(2)).toString()
}

export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(fraction < 0.01 ? 2 : 1)} percent`
}

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
}

// 10 to a whole power, as "10¹²".
export function powerOfTen(exponent: number): string {
  return '10' + String(exponent).split('').map((c) => SUPERSCRIPT[c] ?? c).join('')
}

// Scientific notation for the worked examples: 1.53 × 10³⁹.
export function scientific(value: number, digits = 3): string {
  if (!Number.isFinite(value) || value === 0) return formatNumber(value)
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
  return `${mantissa} × ${powerOfTen(Number(exponent))}`
}

// ---- The words on the three prediction buttons and on the white guess marks (the numbers behind them are in the physics module's choice lists) ----

export function ratioLabel(id: RatioChoiceId): string {
  const times = RATIO_CHOICES.find((c) => c.id === id)!.times
  return times === 1 ? 'about the same' : `about ${times.toLocaleString('en-US')} times brighter`
}

const WIDTH_WORDS: Record<WidthChoiceId, string> = {
  tenth: 'a tenth',
  thousandth: 'a thousandth',
  'hundred-thousandth': 'a hundred-thousandth',
  'ten-millionth': 'a ten-millionth',
  billionth: 'a billionth',
}
export function widthLabel(id: WidthChoiceId): string {
  return `about ${WIDTH_WORDS[id]} as wide`
}
// Checked against the module's list so a changed choice cannot leave a stale word behind.
export const WIDTH_LABEL_IDS = WIDTH_CHOICES.map((c) => c.id)

const FUEL_WORDS: Record<FuelChoiceId, string> = {
  twentieth: 'about 0.05 Suns a year (a twentieth of a Sun)',
  half: 'about 0.5 Suns a year (half a Sun)',
  five: 'about 5 Suns a year',
  fifty: 'about 50 Suns a year',
  'five-hundred': 'about 500 Suns a year',
}
export function fuelLabel(id: FuelChoiceId): string {
  return FUEL_WORDS[id]
}
export const FUEL_LABEL_IDS = FUEL_CHOICES.map((c) => c.id)
