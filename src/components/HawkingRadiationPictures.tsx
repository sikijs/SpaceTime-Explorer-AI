import type { CSSProperties, ReactNode } from 'react'
import {
  BACKGROUND_KELVIN,
  DIRECTION_MARKERS,
  HAWKING_PRESETS,
  HOT_MARKERS,
  MAX_MASS_KG,
  MIN_MASS_KG,
  PART_ONE_MASS_KG,
  SUN_MASS_KG,
  UNIVERSE_AGE_YEARS,
  hawkingTemperatureKelvin,
  lifetimeYears,
  longerMark,
  massForLifetimeKg,
} from '../physics/hawkingRadiationExperiment'
import type { DirectionAnswer, HawkingResult, HotAnswer, LongerAnswer, MassDirection } from '../physics/hawkingRadiationExperiment'

// Black Holes, Experiment 10 (audit update): the three pictures, their guess marks and their captions
// (docs/audit/black-holes-and-strong-gravity/10-draft-wording.md, section 5). White is used only for the learner's guess marks (CLAUDE.md §14,
// "Predictions and the Real Results"); the old white elements are recoloured: the background line is green, the black hole you chose is ringed in
// violet, the horizon is rose, and the age of the universe is gold. The pictures only display what the physics module computed (§9).

export const OUT_COLOR = '#f97316' // heat the black hole gives off
export const IN_COLOR = '#38bdf8' // heat it takes in from the background
export const HOTTER_FILL = 'rgba(249, 115, 22, 0.13)'
export const COLDER_FILL = 'rgba(56, 189, 248, 0.13)'
export const BACKGROUND_COLOR = '#4ade80' // the cosmic microwave background (green)
export const CHOSEN_COLOR = '#a78bfa' // the black hole you chose (violet)
export const HORIZON_COLOR = '#fb7185' // the horizon, the edge of the black hole (rose)
export const AGE_COLOR = '#fbbf24' // the age of the universe (gold)

export const DIRECTION_NAME: Record<MassDirection, string> = {
  loses: 'goes down (it loses mass)',
  gains: 'goes up (it gains mass)',
  balanced: 'stays the same (it is balanced)',
}

// How many seconds the time-lapse takes is the experiment's business; the disk in the second picture changes by this fraction (greatly exaggerated).
const DISK_CHANGE_FRACTION = 0.4

// The temperature picture: temperature on a logarithmic scale, in kelvin.
export const THERMO_WIDTH = 700
const THERMO_AXIS_X = 90
const THERMO_RIGHT = 640
const THERMO_DOT_X = 330
const THERMO_TOP = 64
const THERMO_PX_PER_DECADE = 14
const THERMO_LOG_MAX = 12
const THERMO_LOG_MIN = -18
const THERMO_HEIGHT = THERMO_TOP + (THERMO_LOG_MAX - THERMO_LOG_MIN) * THERMO_PX_PER_DECADE + 70

// The arrows picture.
export const FLOW_WIDTH = 700
const FLOW_HEIGHT = 400
const FLOW_CX = 350
const FLOW_CY = 180
const DISK_RADIUS = 56

// The lifetime graph, and under it a zoom panel on its own scale (for the third guess).
export const LIFE_WIDTH = 700
const LIFE_HEIGHT = 470
const LIFE_LEFT = 96
const LIFE_RIGHT = 620
const LIFE_TOP = 64
const LIFE_BOTTOM = 350
const LIFE_LOG_Y_MIN = 0
const LIFE_LOG_Y_MAX = 100
const ZOOM_TOP = LIFE_HEIGHT + 6
const ZOOM_HEIGHT = 250
const ZOOM_LOG_MIN = 67
const ZOOM_LOG_MAX = 71
const ZOOM_LEFT = 96
const ZOOM_RIGHT = 620

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
const LIST_STYLE: CSSProperties = { margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }
const SVG_STYLE: CSSProperties = {
  display: 'block',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
  marginTop: '1rem',
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}
export const superscript = (n: number) => String(n).split('').map((ch) => SUPERSCRIPT[ch]).join('')

// Scientific notation in words a learner can read: 1.99 × 10³⁰.
export function formatScientific(value: number, digits = 3): string {
  let exponent = Math.floor(Math.log10(Math.abs(value)))
  let mantissa = Number((value / 10 ** exponent).toPrecision(digits))
  if (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  return `${mantissa} × 10${superscript(exponent)}`
}

// Ordinary numbers for ordinary sizes, scientific notation for very large or very small ones.
export function formatBig(value: number): string {
  if (value >= 1000 && value < 1e6) return Number(value.toPrecision(3)).toLocaleString('en-US')
  if (value >= 0.01 && value < 1e6) return String(Number(value.toPrecision(3)))
  return formatScientific(value)
}

export const formatKelvin = (kelvin: number) => (kelvin >= 0.01 && kelvin < 1e4 ? `${Number(kelvin.toPrecision(4))} K` : `${formatScientific(kelvin)} K`)
export const formatKg = (kg: number) => `${formatScientific(kg)} kg`
export const formatYears = (years: number) => `${formatBig(years)} years`

// A length given in km, in the unit that suits its size.
export function formatLength(km: number): string {
  const meters = km * 1000
  if (meters >= 1000) return `${formatBig(km)} km`
  if (meters >= 1) return `${formatBig(meters)} m`
  if (meters >= 1e-3) return `${formatBig(meters * 1000)} mm`
  return `${formatScientific(meters)} m`
}

// "x times hotter" or "x times colder", from the module's ratio of the two temperatures.
export function compareWithBackground(result: HawkingResult): string {
  if (result.direction === 'balanced') return 'the same temperature as'
  return result.temperatureOverBackground > 1
    ? `${formatBig(result.temperatureOverBackground)} times hotter than`
    : `${formatBig(1 / result.temperatureOverBackground)} times colder than`
}

export const BACKGROUND_KELVIN_TEXT = BACKGROUND_KELVIN
export const UNIVERSE_AGE_TEXT = formatScientific(UNIVERSE_AGE_YEARS, 2) // "1.4 × 10¹⁰"
export const SUN_MASS_TEXT = formatScientific(SUN_MASS_KG, 1) // "2 × 10³⁰"
const presetMassInSuns = (id: string) => HAWKING_PRESETS.find((p) => p.id === id)!.massKg / SUN_MASS_KG
export const SGR_A_STAR_MILLIONS = Number((presetMassInSuns('sgr-a-star') / 1e6).toPrecision(2)) // 4.3
export const M87_BILLIONS = Number((presetMassInSuns('m87-star') / 1e9).toPrecision(2)) // 6.5
// How many degrees below freezing the background is, to the nearest ten.
export const DEGREES_BELOW_FREEZING = Math.round((273.15 - BACKGROUND_KELVIN) / 10) * 10 // 270

export const presetLabel: Record<string, string> = {
  mountain: 'Mountain-sized',
  balance: 'Balance mass',
  sun: '1 Sun',
  'ten-suns': '10 Suns',
  'sgr-a-star': 'Sagittarius A*',
  'm87-star': 'M87*',
}

// ---- the white guess marks: white always means the learner's guess ----

// A white YOUR GUESS box joined by a line to its mark on the real picture.
function GuessBox({ x, y, width = 220, lines, target }: { x: number; y: number; width?: number; lines: string[]; target: { x: number; y: number } }) {
  const height = 14 * (lines.length + 1) + 12
  const startX = Math.min(Math.max(target.x, x + 10), x + width - 10)
  const from =
    target.y <= y
      ? { x: startX, y }
      : target.y >= y + height
        ? { x: startX, y: y + height }
        : target.x < x
          ? { x, y: y + height / 2 }
          : { x: x + width, y: y + height / 2 }
  return (
    <g>
      <line x1={from.x} y1={from.y} x2={target.x} y2={target.y} stroke="#ffffff" strokeWidth={2} />
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0b1020" stroke="#ffffff" strokeWidth={2.5} />
      <text x={x + 10} y={y + 18} fill="#ffffff" fontSize="11" fontWeight="bold">
        YOUR GUESS
      </text>
      {lines.map((line, i) => (
        <text key={line} x={x + 10} y={y + 32 + 14 * i} fill="#ffffff" fontSize="11">
          {line}
        </text>
      ))}
    </g>
  )
}

// A big white marker: a thick ring round a solid dot, so that it cannot be missed.
function WhiteMarker({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill="none" stroke="#ffffff" strokeWidth={3.5} />
      <circle cx={x} cy={y} r={4} fill="#ffffff" stroke="#0b1020" strokeWidth={1.5} />
    </g>
  )
}

// A thick white arrow from (x1, y1) to (x2, y2), with a head at the end.
function WhiteArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = (dir: number) => `${x2 + 12 * Math.cos(angle + dir)},${y2 + 12 * Math.sin(angle + dir)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${head(Math.PI - 0.5)} ${head(Math.PI + 0.5)}`} fill="#ffffff" />
    </g>
  )
}

// The words in the white boxes.
export const HOT_TEXT: Record<HotAnswer, string[]> = {
  big: ['the big one (10 Suns)', 'is the hotter'],
  small: ['the small one (1 Sun)', 'is the hotter'],
  same: ['both the same', 'temperature'],
}
export const DIRECTION_TEXT: Record<DirectionAnswer, string[]> = {
  losing: ['the 10-Suns black hole', 'is losing mass'],
  gaining: ['the 10-Suns black hole', 'is gaining mass'],
  same: ['the 10-Suns black hole', 'stays the same'],
}
export const LONGER_TEXT: Record<LongerAnswer, string> = {
  ten: 'about 10 times as long',
  hundred: 'about 100 times as long',
  thousand: 'about 1,000 times as long',
}

// ---- Picture 1: the thermometer ----

export function Thermometer({ result, guess }: { result: HawkingResult; guess?: HotAnswer | null }) {
  const yFor = (kelvin: number) => THERMO_TOP + (THERMO_LOG_MAX - Math.log10(kelvin)) * THERMO_PX_PER_DECADE
  const yBackground = yFor(BACKGROUND_KELVIN)
  const bottom = yFor(10 ** THERMO_LOG_MIN)
  const ticks = [10, 5, 0, -5, -10, -15]
  const yOneSun = yFor(hawkingTemperatureKelvin(SUN_MASS_KG))
  const yTenSuns = yFor(hawkingTemperatureKelvin(PART_ONE_MASS_KG))
  const marker = guess ? HOT_MARKERS[guess] : null
  const boxTarget =
    marker === 'ten-suns' ? { x: THERMO_DOT_X - 13, y: yTenSuns } : marker === 'one-sun' ? { x: THERMO_DOT_X - 13, y: yOneSun } : { x: THERMO_DOT_X - 112, y: (yOneSun + yTenSuns) / 2 }

  return (
    <svg viewBox={`0 0 ${THERMO_WIDTH} ${THERMO_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${THERMO_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The black hole's temperature, against the background's
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Vertical: temperature in kelvin (K), logarithmic: each mark is 100,000 times as hot as the one below it.
      </text>

      {/* The two regions the learner compares */}
      <rect x={THERMO_AXIS_X} y={THERMO_TOP} width={THERMO_RIGHT - THERMO_AXIS_X} height={yBackground - THERMO_TOP} fill={HOTTER_FILL} />
      <rect x={THERMO_AXIS_X} y={yBackground} width={THERMO_RIGHT - THERMO_AXIS_X} height={bottom - yBackground} fill={COLDER_FILL} />
      <text x={THERMO_RIGHT - 6} y={yFor(10 ** 6)} fill={OUT_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        hotter than the background
      </text>
      <text x={THERMO_RIGHT - 6} y={yFor(10 ** -2)} fill={IN_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        colder than the background
      </text>

      {/* The scale */}
      <line x1={THERMO_AXIS_X} y1={THERMO_TOP} x2={THERMO_AXIS_X} y2={bottom} stroke="#94a3b8" />
      {ticks.map((e) => (
        <g key={e}>
          <line x1={THERMO_AXIS_X - 5} y1={yFor(10 ** e)} x2={THERMO_AXIS_X} y2={yFor(10 ** e)} stroke="#94a3b8" />
          <text x={THERMO_AXIS_X - 8} y={yFor(10 ** e) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {e === 0 ? '1 K' : `10${superscript(e)} K`}
          </text>
        </g>
      ))}

      {/* The background */}
      <line x1={THERMO_AXIS_X} y1={yBackground} x2={THERMO_RIGHT} y2={yBackground} stroke={BACKGROUND_COLOR} strokeWidth={2} />
      <text x={THERMO_RIGHT - 6} y={yBackground - 7} fill={BACKGROUND_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        green line: the cosmic microwave background, {BACKGROUND_KELVIN} K
      </text>

      {/* The six black holes: the one you chose is ringed in violet */}
      {HAWKING_PRESETS.map((p) => {
        const temperature = hawkingTemperatureKelvin(p.massKg)
        const chosen = p.massKg === result.massKg
        const y = yFor(temperature)
        return (
          <g key={p.id}>
            <circle cx={THERMO_DOT_X} cy={y} r={chosen ? 8 : 4} fill={chosen ? '#0b1020' : '#cbd5e1'} stroke={chosen ? CHOSEN_COLOR : 'none'} strokeWidth={2.5} />
            {chosen && <circle cx={THERMO_DOT_X} cy={y} r={3} fill={CHOSEN_COLOR} />}
            <text
              x={THERMO_DOT_X + (chosen ? 14 : 10)}
              y={y + (p.id === 'balance' ? 16 : 4)}
              fill={chosen ? CHOSEN_COLOR : '#cbd5e1'}
              fontSize="10.5"
              fontWeight={chosen ? 'bold' : 'normal'}
            >
              {presetLabel[p.id]}: {formatKelvin(temperature)}
            </text>
            {chosen && (
              <text x={THERMO_DOT_X - 14} y={y + (p.id === 'balance' ? -8 : 4)} fill={CHOSEN_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="end">
                your black hole
              </text>
            )}
          </g>
        )
      })}

      {/* Guess 1: a white marker on the dot of the black hole the learner called hotter, or a bracket joining both */}
      {guess && marker === 'ten-suns' && <WhiteMarker x={THERMO_DOT_X} y={yTenSuns} />}
      {guess && marker === 'one-sun' && <WhiteMarker x={THERMO_DOT_X} y={yOneSun} />}
      {guess && marker === 'bracket' && (
        <g stroke="#ffffff" strokeWidth={3.5} fill="none">
          <path d={`M ${THERMO_DOT_X - 102} ${yOneSun - 12} H ${THERMO_DOT_X - 112} V ${yTenSuns + 12} H ${THERMO_DOT_X - 102}`} />
        </g>
      )}
      {guess && <GuessBox x={THERMO_AXIS_X + 20} y={yOneSun - 120} width={210} lines={HOT_TEXT[guess]} target={boxTarget} />}

      <text x={THERMO_AXIS_X} y={THERMO_HEIGHT - 50} fill="#cbd5e1" fontSize="11">
        Your black hole is {compareWithBackground(result)} the background.
      </text>
      <text x={THERMO_AXIS_X} y={THERMO_HEIGHT - 32} fill="#94a3b8" fontSize="10">
        The temperatures come from a standard formula that is given and not derived.
      </text>
      <text x={THERMO_AXIS_X} y={THERMO_HEIGHT - 17} fill="#94a3b8" fontSize="10">
        Nobody has measured this glow from a real black hole.
      </text>
    </svg>
  )
}

// ---- Picture 2: which way is the mass going? ----

// A bold or thin arrow, depending on which flow wins. The marker's size follows the stroke width, so a bold arrow has a bigger head.
function FlowArrow({ x1, x2, y, color, width, markerId }: { x1: number; x2: number; y: number; color: string; width: number; markerId: string }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={width} markerEnd={`url(#${markerId})`} />
}

export function Flow({ result, progress, guess }: { result: HawkingResult; progress: number; guess?: DirectionAnswer | null }) {
  const sign = result.direction === 'loses' ? -1 : result.direction === 'gains' ? 1 : 0
  const radius = DISK_RADIUS * (1 + sign * DISK_CHANGE_FRACTION * progress)
  const outWidth = result.direction === 'loses' ? 9 : result.direction === 'gains' ? 2.5 : 5
  const inWidth = result.direction === 'gains' ? 9 : result.direction === 'loses' ? 2.5 : 5
  const winner =
    result.direction === 'loses'
      ? 'The bold arrow is the one going out.'
      : result.direction === 'gains'
        ? 'The bold arrow is the one coming in.'
        : 'The two arrows are equal.'
  const marker = guess ? DIRECTION_MARKERS[guess] : null
  // The guess marker sits at the lower right of the disk, along a line at 45 degrees from its center.
  const along = (r: number) => ({ x: FLOW_CX + r * 0.7071, y: FLOW_CY + r * 0.7071 })
  const reach = DISK_RADIUS * (1 + DISK_CHANGE_FRACTION) + 8
  const boxX = FLOW_CX + 105
  const boxY = 204

  return (
    <svg viewBox={`0 0 ${FLOW_WIDTH} ${FLOW_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${FLOW_WIDTH}px` }}>
      <defs>
        <marker id="hawking-out-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={OUT_COLOR} />
        </marker>
        <marker id="hawking-in-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={IN_COLOR} />
        </marker>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Heat in and heat out, and the black hole's mass
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Heat comes in from the background and goes out as Hawking radiation. The bold arrow is the bigger flow.
      </text>

      {/* The heat coming in from the background */}
      <FlowArrow x1={70} x2={FLOW_CX - radius - 14} y={FLOW_CY} color={IN_COLOR} width={inWidth} markerId="hawking-in-head" />
      <text x={70} y={FLOW_CY - 30} fill={IN_COLOR} fontSize="11" fontWeight="bold">
        heat it takes in
      </text>
      <text x={70} y={FLOW_CY - 16} fill={IN_COLOR} fontSize="10.5">
        from the background ({BACKGROUND_KELVIN} K)
      </text>

      {/* The heat going out */}
      <FlowArrow x1={FLOW_CX + radius + 14} x2={FLOW_WIDTH - 60} y={FLOW_CY} color={OUT_COLOR} width={outWidth} markerId="hawking-out-head" />
      <text x={FLOW_WIDTH - 60} y={FLOW_CY - 30} fill={OUT_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        heat it gives off
      </text>
      <text x={FLOW_WIDTH - 60} y={FLOW_CY - 16} fill={OUT_COLOR} fontSize="10.5" textAnchor="end">
        (Hawking radiation)
      </text>

      {/* The black hole: its edge is the horizon (rose) */}
      <circle cx={FLOW_CX} cy={FLOW_CY} r={radius} fill="#000000" stroke={HORIZON_COLOR} strokeWidth={2.5} />
      <text x={FLOW_CX} y={FLOW_CY + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
        black hole
      </text>
      <text x={FLOW_CX} y={FLOW_CY + DISK_RADIUS * (1 + DISK_CHANGE_FRACTION) + 22} fill={HORIZON_COLOR} fontSize="10.5" textAnchor="middle">
        rose ring: the horizon, the edge of the black hole
      </text>

      {/* Guess 2: a white marker beside the disk, and a box joined to it. It is only a marker. */}
      {guess && marker === 'shrinks' && <WhiteArrow x1={along(reach + 34).x} y1={along(reach + 34).y} x2={along(DISK_RADIUS * 0.75).x} y2={along(DISK_RADIUS * 0.75).y} />}
      {guess && marker === 'grows' && <WhiteArrow x1={along(DISK_RADIUS * 0.45).x} y1={along(DISK_RADIUS * 0.45).y} x2={along(reach + 34).x} y2={along(reach + 34).y} />}
      {guess && marker === 'unchanged' && (
        <g stroke="#ffffff" strokeWidth={4} strokeLinecap="round">
          <line x1={along(reach + 14).x - 14} y1={along(reach + 14).y - 6} x2={along(reach + 14).x + 14} y2={along(reach + 14).y - 6} />
          <line x1={along(reach + 14).x - 14} y1={along(reach + 14).y + 6} x2={along(reach + 14).x + 14} y2={along(reach + 14).y + 6} />
        </g>
      )}
      {guess && <GuessBox x={boxX} y={boxY} width={215} lines={DIRECTION_TEXT[guess]} target={along(reach + 24)} />}

      <text x={60} y={FLOW_HEIGHT - 70} fill="#e2e8f0" fontSize="11">
        {winner}
      </text>
      <text x={60} y={FLOW_HEIGHT - 42} fill="#94a3b8" fontSize="10">
        The arrows only show which flow is bigger, not how much. The disk's size change in the time-lapse is greatly exaggerated:
      </text>
      <text x={60} y={FLOW_HEIGHT - 26} fill="#94a3b8" fontSize="10">
        the real change is far too slow and too small to see, and the time-lapse is only a way of showing the direction.
      </text>
    </svg>
  )
}

// ---- Picture 3: how long to evaporate, with a zoom panel for the third guess ----

export function LifetimeGraph({ result, guess }: { result: HawkingResult; guess?: LongerAnswer | null }) {
  const logXMin = Math.log10(MIN_MASS_KG)
  const logXMax = Math.log10(MAX_MASS_KG)
  const xFor = (kg: number) => LIFE_LEFT + ((Math.log10(kg) - logXMin) / (logXMax - logXMin)) * (LIFE_RIGHT - LIFE_LEFT)
  const yFor = (years: number) => LIFE_BOTTOM - ((Math.log10(years) - LIFE_LOG_Y_MIN) / (LIFE_LOG_Y_MAX - LIFE_LOG_Y_MIN)) * (LIFE_BOTTOM - LIFE_TOP)
  const line = result.curve.map((p) => `${xFor(p.massKg)},${yFor(p.lifetimeYears)}`).join(' ')
  const yAge = yFor(UNIVERSE_AGE_YEARS)
  const crossMass = massForLifetimeKg(UNIVERSE_AGE_YEARS)
  const xTicks = [11, 16, 21, 26, 31, 36, 41]
  const yTicks = [20, 40, 60, 80, 100]
  // Labels sit above-left of a dot, or below-right of it, so that neighbouring dots do not cover each other's names.
  const above = new Set(['sun', 'sgr-a-star', 'm87-star'])

  // The zoom panel: the 1-Sun and 10-Suns lifetimes on their own scale, from 10^67 to 10^71 years.
  const zoomX = (log10Years: number) => ZOOM_LEFT + ((log10Years - ZOOM_LOG_MIN) / (ZOOM_LOG_MAX - ZOOM_LOG_MIN)) * (ZOOM_RIGHT - ZOOM_LEFT)
  const zoomAxisY = ZOOM_TOP + 110
  const oneSunLog = Math.log10(lifetimeYears(SUN_MASS_KG))
  const tenSunsLog = Math.log10(lifetimeYears(PART_ONE_MASS_KG))
  const mark = guess ? longerMark(guess) : null
  const showZoom = guess != null // the zoom panel is for the third guess, so it is drawn only in Part 1
  const totalHeight = showZoom ? LIFE_HEIGHT + ZOOM_HEIGHT : LIFE_HEIGHT

  return (
    <svg viewBox={`0 0 ${LIFE_WIDTH} ${totalHeight}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${LIFE_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How long would a lone black hole take to evaporate?
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: its mass in kg. Vertical: the time in years. Both scales are logarithmic.
      </text>

      {yTicks.map((e) => (
        <g key={e}>
          <line x1={LIFE_LEFT} y1={yFor(10 ** e)} x2={LIFE_RIGHT} y2={yFor(10 ** e)} stroke="#334155" />
          <text x={LIFE_LEFT - 8} y={yFor(10 ** e) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            10{superscript(e)}
          </text>
        </g>
      ))}
      <text x={14} y={(LIFE_TOP + LIFE_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(LIFE_TOP + LIFE_BOTTOM) / 2})`}>
        time to evaporate (years)
      </text>
      {xTicks.map((e) => (
        <g key={e}>
          <line x1={xFor(10 ** e)} y1={LIFE_BOTTOM} x2={xFor(10 ** e)} y2={LIFE_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(10 ** e)} y={LIFE_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            10{superscript(e)}
          </text>
        </g>
      ))}
      <text x={(LIFE_LEFT + LIFE_RIGHT) / 2} y={LIFE_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        the black hole's mass (kg)
      </text>

      {/* The age of the universe (gold), and where the line crosses it */}
      <line x1={LIFE_LEFT} y1={yAge} x2={LIFE_RIGHT} y2={yAge} stroke={AGE_COLOR} strokeOpacity={0.8} strokeDasharray="5 4" />
      <text x={LIFE_RIGHT - 4} y={yAge - 6} fill={AGE_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="end">
        gold line: the age of the universe, about {UNIVERSE_AGE_TEXT} years
      </text>
      <line x1={xFor(crossMass)} y1={LIFE_TOP + 50} x2={xFor(crossMass)} y2={LIFE_BOTTOM} stroke={AGE_COLOR} strokeOpacity={0.8} strokeDasharray="5 4" />
      <text x={xFor(crossMass) + 6} y={LIFE_TOP + 34} fill={AGE_COLOR} fontSize="10">
        {formatScientific(crossMass, 2)} kg: a black hole of this mass
      </text>
      <text x={xFor(crossMass) + 6} y={LIFE_TOP + 47} fill={AGE_COLOR} fontSize="10">
        would last exactly the age of the universe
      </text>

      {/* The lifetime line, and the six black holes on it */}
      <polyline points={line} fill="none" stroke={OUT_COLOR} strokeWidth={3} />
      {HAWKING_PRESETS.map((p) => {
        const chosen = p.massKg === result.massKg
        const x = xFor(p.massKg)
        const y = yFor(lifetimeYears(p.massKg))
        const isAbove = above.has(p.id)
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={chosen ? 8 : 4} fill={chosen ? '#0b1020' : '#cbd5e1'} stroke={chosen ? CHOSEN_COLOR : 'none'} strokeWidth={2.5} />
            {chosen && <circle cx={x} cy={y} r={3} fill={CHOSEN_COLOR} />}
            <text
              x={x + (isAbove ? -12 : 12)}
              y={y + (isAbove ? -8 : 16)}
              fill={chosen ? CHOSEN_COLOR : '#cbd5e1'}
              fontSize="10.5"
              fontWeight={chosen ? 'bold' : 'normal'}
              textAnchor={isAbove ? 'end' : 'start'}
            >
              {presetLabel[p.id]}
            </text>
          </g>
        )
      })}
      <text x={LIFE_LEFT + 6} y={LIFE_TOP + 14} fill={OUT_COLOR} fontSize="10.5" fontWeight="bold">
        the lifetime line
      </text>

      {/* Guess 3 on the graph: a white ring where the guess puts a black hole of ten times the Sun's mass (at 10 Suns, at the guessed time) */}
      {mark && <WhiteMarker x={xFor(PART_ONE_MASS_KG)} y={yFor(mark.lifetimeYears)} />}

      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 52} fill="#cbd5e1" fontSize="11">
        Your black hole would take about {formatBig(result.lifetimeYears)} years: {formatBig(result.lifetimeOverUniverseAge)} times the age of the universe.
      </text>
      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 32} fill="#94a3b8" fontSize="10">
        A straight line on a graph like this means a power law.
      </text>
      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 16} fill="#94a3b8" fontSize="10">
        The times are rough, for a black hole alone in a perfectly cold space with nothing falling in.
      </text>

      {showZoom && (
        <g>
      {/* The zoom panel: its own title and its own scale */}
      <line x1={12} y1={ZOOM_TOP - 4} x2={LIFE_WIDTH - 12} y2={ZOOM_TOP - 4} stroke="#334155" />
      <text x={12} y={ZOOM_TOP + 16} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Zoom: the 1-Sun and 10-Suns times, on their own scale
      </text>
      <text x={12} y={ZOOM_TOP + 33} fill="#94a3b8" fontSize="11">
        Horizontal: the time to evaporate, in years, from 10{superscript(ZOOM_LOG_MIN)} to 10{superscript(ZOOM_LOG_MAX)}. Each mark is 10 times as long as the one before.
      </text>
      <line x1={ZOOM_LEFT} y1={zoomAxisY} x2={ZOOM_RIGHT} y2={zoomAxisY} stroke="#94a3b8" />
      {[67, 68, 69, 70, 71].map((e) => (
        <g key={e}>
          <line x1={zoomX(e)} y1={zoomAxisY - 4} x2={zoomX(e)} y2={zoomAxisY + 5} stroke="#94a3b8" />
          <text x={zoomX(e)} y={zoomAxisY + 19} fill="#94a3b8" fontSize="10" textAnchor="middle">
            10{superscript(e)}
          </text>
        </g>
      ))}
      <circle cx={zoomX(oneSunLog)} cy={zoomAxisY} r={6} fill="#cbd5e1" />
      <text x={zoomX(oneSunLog)} y={zoomAxisY - 24} fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
        1 Sun: {formatYears(lifetimeYears(SUN_MASS_KG))}
      </text>
      <circle cx={zoomX(tenSunsLog)} cy={zoomAxisY} r={6} fill="#cbd5e1" />
      <text x={zoomX(tenSunsLog)} y={zoomAxisY - 24} fill="#cbd5e1" fontSize="10.5" textAnchor="middle">
        10 Suns: {formatYears(lifetimeYears(PART_ONE_MASS_KG))}
      </text>
      {mark && (
        <g>
          <WhiteArrow x1={zoomX(oneSunLog) + 8} y1={zoomAxisY + 34} x2={zoomX(mark.log10Years)} y2={zoomAxisY + 34} />
          <WhiteMarker x={zoomX(mark.log10Years)} y={zoomAxisY} />
          <GuessBox
            x={Math.min(Math.max(zoomX(mark.log10Years) - 125, 20), LIFE_WIDTH - 260)}
            y={zoomAxisY + 44}
            width={250}
            lines={['a 10-Suns black hole takes', `${LONGER_TEXT[guess!]} as 1 Sun`]}
            target={{ x: zoomX(mark.log10Years), y: zoomAxisY + 13 }}
          />
        </g>
      )}
        </g>
      )}
    </svg>
  )
}

// ---- captions: "How to read this picture", in the established pattern ----

// A "what to look for" item in three parts (CLAUDE.md §14): Look at, What it means, Why it matters.
function LookFor({ look, means, matters }: { look: string; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <strong>Look at:</strong> {look} <strong>What it means:</strong> {means} <strong>Why it matters:</strong> {matters}
    </li>
  )
}

export function ThermometerCaption({ result, number, withGuesses }: { result: HawkingResult; number: number; withGuesses?: boolean }) {
  const tOne = hawkingTemperatureKelvin(SUN_MASS_KG)
  const tTen = hawkingTemperatureKelvin(PART_ONE_MASS_KG)
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${THERMO_WIDTH}px` }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>How to read Picture {number}: the thermometer.</strong>
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>1. What is drawn.</strong> A scale of temperature, in <em>kelvin</em> (K). A kelvin is the same size of step as a degree Celsius, but the scale starts at the coldest temperature there can be, 0 K, which is −273 °C, so no temperature is below zero. It is a <em>logarithmic</em> scale: each mark is 100,000 times as hot as the mark below it, which is how one picture can hold 10¹¹ K and 10⁻¹⁷ K. The <strong>green line</strong> is the cosmic microwave background, the faint heat left over from the early universe, at {BACKGROUND_KELVIN} K (Cosmology 3). Each <strong>dot</strong> is one of the six black holes, placed at its temperature and named. The <strong>violet ring</strong> marks the black hole you ran. The orange shading is hotter than the background and the blue shading is colder. The temperatures are calculated here from a standard formula that is given and not derived. Nobody has measured this glow from a real black hole.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
        <strong>2. A worked moment.</strong> The 1-Sun black hole is at {formatKelvin(tOne)} and the 10-Suns one is at {formatKelvin(tTen)}. The green line is at {BACKGROUND_KELVIN} K, so {BACKGROUND_KELVIN} ÷ {formatScientific(tTen, 3)} = {formatBig(BACKGROUND_KELVIN / tTen)}: the 10-Suns dot is about {formatBig(BACKGROUND_KELVIN / tTen)} times below the line.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
        <strong>3. What to look for.</strong>
      </p>
      <ul style={LIST_STYLE}>
        <LookFor
          look="the green line and where the violet-ringed dot sits against it."
          means={<>Your black hole, at {formatKelvin(result.temperatureKelvin)}, is {compareWithBackground(result)} the background.</>}
          matters="the background is the yardstick for the question of this page: hotter or colder than the space around it."
        />
        <LookFor
          look="the order of the dots, from the top of the picture to the bottom."
          means={<>The mountain-sized black hole is the highest, then the balance mass, then 1 Sun, 10 Suns, Sagittarius A* and M87*. From 1 Sun to 10 Suns the temperature falls from {formatKelvin(tOne)} to {formatKelvin(tTen)}, one tenth.</>}
          matters="it shows how the temperature of a black hole goes with its mass, which is what the first question asked about."
        />
        <LookFor
          look="the balance mass dot, sitting on the green line."
          means={<>A black hole of about 0.6 of the Moon's mass has exactly the background's temperature, {BACKGROUND_KELVIN} K.</>}
          matters="it is the one black hole of the six that is neither hotter nor colder than the space around it."
        />
        {withGuesses && (
          <LookFor
            look="the white YOUR GUESS box and the white mark it is joined to."
            means="the mark shows which of the 1-Sun and 10-Suns dots you said was hotter, or a bracket round both if you said they were the same. It is only a marker of your answer, not a size you chose, and it does not change the picture."
            matters="you can see for yourself how your marker sits against the real heights of the two dots."
          />
        )}
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This is a thought experiment about one black hole that is not spinning. The formula is a standard result, and the radiation has never been seen from a real black hole.
      </p>
    </div>
  )
}

export function FlowCaption({ result, number, withGuesses }: { result: HawkingResult; number: number; withGuesses?: boolean }) {
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${FLOW_WIDTH}px` }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>How to read Picture {number}: heat in and heat out.</strong>
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>1. What is drawn.</strong> The black disk is the black hole, and the <strong>rose ring</strong> around it is its <em>horizon</em>, the edge you met in Black Holes 1, from inside which nothing can escape. The <strong>blue arrow</strong> pointing in is the heat the black hole takes in from the background. The <strong>orange arrow</strong> pointing out is the heat it gives off as Hawking radiation. The <strong>bold arrow</strong> is the bigger of the two flows. While the 10-second time-lapse plays, the <strong>size of the disk</strong> shows what happens to the black hole's mass: it grows, shrinks or stays the same size. This is only a way of showing the result. The size change is greatly exaggerated, and the real change takes far, far longer.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
        <strong>2. What to look for.</strong>
      </p>
      <ul style={LIST_STYLE}>
        <LookFor
          look="which of the two arrows is bold and which is thin."
          means={<>For your black hole, {result.direction === 'gains' ? 'the blue arrow, the heat coming in, is bold' : result.direction === 'loses' ? 'the orange arrow, the heat going out, is bold' : 'the two arrows are the same'}.</>}
          matters="this is the picture of the comparison between the two temperatures: the bigger flow is the one that decides."
        />
        <LookFor
          look="the disk while the time-lapse runs."
          means={<>The black hole's mass {DIRECTION_NAME[result.direction]}. The disk is drawn by the same module as everything else, from the direction it computed.</>}
          matters="it is the answer to the question of this page, seen as a change in the black hole itself."
        />
        {withGuesses && (
          <LookFor
            look="the white YOUR GUESS box and the white mark beside the disk."
            means="the mark shows what you said would happen to the 10-Suns black hole's mass: an arrow pointing in if you said it loses mass, an arrow pointing out if you said it gains mass, two bars if you said it stays the same. It is only a marker of your answer, not a size, and it does not change the picture."
            matters="you can set the white marker beside what the real disk does."
          />
        )}
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> The arrows show which flow is bigger, and not how much. The model gives the direction only.
      </p>
    </div>
  )
}

export function GraphCaption({ result, number, withGuesses }: { result: HawkingResult; number: number; withGuesses?: boolean }) {
  const crossMass = massForLifetimeKg(UNIVERSE_AGE_YEARS)
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${LIFE_WIDTH}px` }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>How to read Picture {number}: how long to evaporate?</strong>
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>1. What is drawn.</strong> To <em>evaporate</em> means to lose all of its mass. The upper graph shows how long a black hole would take to evaporate, in years, against its mass, in kg, if it were alone, with nothing falling in and no background heat. The <strong>orange line</strong> is the time for black holes of every mass. The <strong>dots</strong> are the six black holes you can choose, and the <strong>gold dashed line</strong> is the age of the universe. Both scales are logarithmic: each mark along the bottom is 10⁵ = 100,000 times the mass of the one before, and each mark up the side is 10²⁰ times as long. {withGuesses && <>The <strong>zoom panel</strong> below is a second picture, with its own title and its own scale, that stretches the part of the graph between 10⁶⁷ and 10⁷¹ years so that the times of 1 Sun and 10 Suns can be told apart.</>} The times are calculated here from a standard formula that is given and not derived, and they are rough, good only to within a few times.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
        <strong>2. A worked moment.</strong> A black hole of 1 Sun would take {formatYears(lifetimeYears(SUN_MASS_KG))}. One of 10 Suns would take {formatYears(lifetimeYears(PART_ONE_MASS_KG))}. That is {formatScientific(lifetimeYears(PART_ONE_MASS_KG), 3)} ÷ {formatScientific(lifetimeYears(SUN_MASS_KG), 3)} = {formatBig(lifetimeYears(PART_ONE_MASS_KG) / lifetimeYears(SUN_MASS_KG))} times as long.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
        <strong>3. What to look for.</strong>
      </p>
      <ul style={LIST_STYLE}>
        <LookFor
          look="the orange line and the dots along it, and the gold dashed lines."
          means={<>The line crosses the age of the universe at about {formatScientific(crossMass, 2)} kg. A black hole lighter than that, alone since the start, would already have evaporated. Your black hole would take about {formatBig(result.lifetimeYears)} years, which is {formatBig(result.lifetimeOverUniverseAge)} times the age of the universe.</>}
          matters="it shows how far these times are from anything in the real universe: every black hole found in space is far heavier than that mass."
        />
        <LookFor
          look={withGuesses ? 'the 1-Sun dot and the 10-Suns dot, in the zoom panel.' : 'the 1-Sun dot and the 10-Suns dot.'}
          means={<>They are {formatBig(lifetimeYears(PART_ONE_MASS_KG) / lifetimeYears(SUN_MASS_KG))} times apart in time, three marks of the scale.</>}
          matters="it shows how a tenfold step in mass becomes a much bigger step in time."
        />
        {withGuesses && (
          <LookFor
            look="the white YOUR GUESS box, the white arrow and the white ring in the zoom panel, and the white ring on the graph above it."
            means="the arrow starts at the 1-Sun time and ends where your answer puts the time for a black hole of 10 Suns: 10, 100 or 1,000 times as long as for 1 Sun. The ring on the upper graph is at the same time, above the 10-Suns mass. A different guess puts the mark in a different place."
            matters="you can see how far from the real 10-Suns dot your guess lands."
          />
        )}
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This is the time for a black hole alone in a perfectly cold space. In the real universe the background is warmer than any black hole in space, so these black holes are not evaporating now.
      </p>
    </div>
  )
}
