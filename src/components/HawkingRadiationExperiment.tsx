import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BACKGROUND_KELVIN,
  HAWKING_PRESETS,
  MAX_MASS_KG,
  MIN_MASS_KG,
  SUN_MASS_KG,
  UNIVERSE_AGE_YEARS,
  balanceMassKg,
  hawkingSteps,
  hawkingTemperatureKelvin,
  lifetimeYears,
  massDirection,
  massForLifetimeKg,
  runHawkingRadiationExperiment,
} from '../physics/hawkingRadiationExperiment'
import type { HawkingResult, MassDirection } from '../physics/hawkingRadiationExperiment'
import { HawkingRadiationTutor } from './HawkingRadiationTutor'

interface HawkingRadiationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The time-lapse
// is only a way of showing the direction of the black hole's mass; it does not model real time.
const ANIMATION_DURATION_MS = 10_000
// How much the disk in the second picture changes size over the time-lapse (greatly exaggerated, and said to be).
const DISK_CHANGE_FRACTION = 0.4

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not marked
// here; they are compared with the model's results later (the Results step). The question wording was approved by the owner
// on 2026-10-12 (CLAUDE.md §28.1).
type HotChoice = 'big' | 'small' | 'same'
const hotChoices: Array<{ value: HotChoice; label: string }> = [
  { value: 'big', label: 'The big one' },
  { value: 'small', label: 'The small one' },
  { value: 'same', label: 'Both the same' },
]

type DirectionChoice = 'losing' | 'gaining' | 'same'
const directionChoices: Array<{ value: DirectionChoice; label: string }> = [
  { value: 'losing', label: 'Losing mass' },
  { value: 'gaining', label: 'Gaining mass' },
  { value: 'same', label: 'Staying the same' },
]

type LongerChoice = 'ten' | 'hundred' | 'thousand'
const longerChoices: Array<{ value: LongerChoice; label: string }> = [
  { value: 'ten', label: 'About 10 times as long' },
  { value: 'hundred', label: 'About 100 times as long' },
  { value: 'thousand', label: 'About 1,000 times as long' },
]

const OUT_COLOR = '#f97316' // heat the black hole gives off
const IN_COLOR = '#38bdf8' // heat it takes in from the background
const HOTTER_FILL = 'rgba(249, 115, 22, 0.13)'
const COLDER_FILL = 'rgba(56, 189, 248, 0.13)'
const LINE_COLOR = '#ffffff'

const DIRECTION_NAME: Record<MassDirection, string> = {
  loses: 'goes down (it loses mass)',
  gains: 'goes up (it gains mass)',
  balanced: 'stays the same (it is balanced)',
}

// The temperature picture (the first picture): temperature on a logarithmic scale, in kelvin.
const THERMO_WIDTH = 700
const THERMO_AXIS_X = 90
const THERMO_RIGHT = 640
const THERMO_DOT_X = 330
const THERMO_TOP = 64
const THERMO_PX_PER_DECADE = 14
const THERMO_LOG_MAX = 12
const THERMO_LOG_MIN = -18
const THERMO_HEIGHT = THERMO_TOP + (THERMO_LOG_MAX - THERMO_LOG_MIN) * THERMO_PX_PER_DECADE + 70

// The arrows picture (the second picture).
const FLOW_WIDTH = 700
const FLOW_HEIGHT = 400
const FLOW_CX = 350
const FLOW_CY = 180
const DISK_RADIUS = 56

// The lifetime graph (the third picture): lifetime against mass, both logarithmic.
const LIFE_WIDTH = 700
const LIFE_HEIGHT = 470
const LIFE_LEFT = 96
const LIFE_RIGHT = 620
const LIFE_TOP = 64
const LIFE_BOTTOM = 350
const LIFE_LOG_Y_MIN = 0
const LIFE_LOG_Y_MAX = 100

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
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
const superscript = (n: number) => String(n).split('').map((ch) => SUPERSCRIPT[ch]).join('')

// Scientific notation in words a learner can read: 1.99 × 10³⁰.
function formatScientific(value: number, digits = 3): string {
  let exponent = Math.floor(Math.log10(Math.abs(value)))
  let mantissa = Number((value / 10 ** exponent).toPrecision(digits))
  if (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  return `${mantissa} × 10${superscript(exponent)}`
}

// Ordinary numbers for ordinary sizes, scientific notation for very large or very small ones.
function formatBig(value: number): string {
  if (value >= 1000 && value < 1e6) return Number(value.toPrecision(3)).toLocaleString('en-US')
  if (value >= 0.01 && value < 1e6) return String(Number(value.toPrecision(3)))
  return formatScientific(value)
}

const formatKelvin = (kelvin: number) =>
  kelvin >= 0.01 && kelvin < 1e4 ? `${Number(kelvin.toPrecision(4))} K` : `${formatScientific(kelvin)} K`
const formatKg = (kg: number) => `${formatScientific(kg)} kg`

// A length given in km, in the unit that suits its size.
function formatLength(km: number): string {
  const meters = km * 1000
  if (meters >= 1000) return `${formatBig(km)} km`
  if (meters >= 1) return `${formatBig(meters)} m`
  if (meters >= 1e-3) return `${formatBig(meters * 1000)} mm`
  return `${formatScientific(meters)} m`
}

// "x times hotter" or "x times colder", from the module's ratio of the two temperatures.
function compareWithBackground(result: HawkingResult): string {
  if (result.direction === 'balanced') return 'the same temperature as'
  return result.temperatureOverBackground > 1
    ? `${formatBig(result.temperatureOverBackground)} times hotter than`
    : `${formatBig(1 / result.temperatureOverBackground)} times colder than`
}

// Numbers the introduction and the pictures quote, all taken from the physics module (and Experiment 1's presets) and not
// typed in, in the words a learner reads.
const UNIVERSE_AGE_TEXT = formatScientific(UNIVERSE_AGE_YEARS, 2) // "1.4 × 10¹⁰"
const SUN_MASS_TEXT = formatScientific(SUN_MASS_KG, 1) // "2 × 10³⁰"
const presetMassInSuns = (id: string) => HAWKING_PRESETS.find((p) => p.id === id)!.massKg / SUN_MASS_KG
const SGR_A_STAR_MILLIONS = Number((presetMassInSuns('sgr-a-star') / 1e6).toPrecision(2)) // 4.3
const M87_BILLIONS = Number((presetMassInSuns('m87-star') / 1e9).toPrecision(2)) // 6.5
// How many degrees below freezing the background is, to the nearest ten.
const DEGREES_BELOW_FREEZING = Math.round((273.15 - BACKGROUND_KELVIN) / 10) * 10 // 270

const presetLabel: Record<string, string> = {
  mountain: 'Mountain-sized',
  balance: 'Balance mass',
  sun: '1 Sun',
  'ten-suns': '10 Suns',
  'sgr-a-star': 'Sagittarius A*',
  'm87-star': 'M87*',
}

// The first picture: the black hole's temperature against the background's.
function Thermometer({ result }: { result: HawkingResult }) {
  const yFor = (kelvin: number) => THERMO_TOP + (THERMO_LOG_MAX - Math.log10(kelvin)) * THERMO_PX_PER_DECADE
  const yBackground = yFor(BACKGROUND_KELVIN)
  const bottom = yFor(10 ** THERMO_LOG_MIN)
  const ticks = [10, 5, 0, -5, -10, -15]

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
        hotter than the background: the black hole loses mass
      </text>
      <text x={THERMO_RIGHT - 6} y={yFor(10 ** -2)} fill={IN_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        colder than the background: the black hole gains mass
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
      <line x1={THERMO_AXIS_X} y1={yBackground} x2={THERMO_RIGHT} y2={yBackground} stroke={LINE_COLOR} strokeWidth={2} />
      <text x={THERMO_RIGHT - 6} y={yBackground - 7} fill={LINE_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        the cosmic microwave background: {BACKGROUND_KELVIN} K
      </text>

      {/* The six black holes: the one you chose is ringed in white */}
      {HAWKING_PRESETS.map((p) => {
        const temperature = hawkingTemperatureKelvin(p.massKg)
        const chosen = p.massKg === result.massKg
        const y = yFor(temperature)
        return (
          <g key={p.id}>
            <circle cx={THERMO_DOT_X} cy={y} r={chosen ? 8 : 4} fill={chosen ? '#0b1020' : '#cbd5e1'} stroke={chosen ? LINE_COLOR : 'none'} strokeWidth={2.5} />
            {chosen && <circle cx={THERMO_DOT_X} cy={y} r={3} fill={LINE_COLOR} />}
            <text
              x={THERMO_DOT_X + (chosen ? 14 : 10)}
              y={y + (p.id === 'balance' ? 16 : 4)}
              fill={chosen ? LINE_COLOR : '#cbd5e1'}
              fontSize="10.5"
              fontWeight={chosen ? 'bold' : 'normal'}
            >
              {presetLabel[p.id]}: {formatKelvin(temperature)}
            </text>
            {chosen && (
              <text x={THERMO_DOT_X - 14} y={y + (p.id === 'balance' ? -8 : 4)} fill={LINE_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="end">
                your black hole
              </text>
            )}
          </g>
        )
      })}

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

// A bold or thin arrow, depending on which flow wins. The marker's size follows the stroke width, so a bold arrow has a
// bigger head.
function FlowArrow({ x1, x2, y, color, width, markerId }: { x1: number; x2: number; y: number; color: string; width: number; markerId: string }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={width} markerEnd={`url(#${markerId})`} />
}

// The second picture: which way is the black hole's mass going?
function Flow({ result, progress }: { result: HawkingResult; progress: number }) {
  const sign = result.direction === 'loses' ? -1 : result.direction === 'gains' ? 1 : 0
  const radius = DISK_RADIUS * (1 + sign * DISK_CHANGE_FRACTION * progress)
  const outWidth = result.direction === 'loses' ? 9 : result.direction === 'gains' ? 2.5 : 5
  const inWidth = result.direction === 'gains' ? 9 : result.direction === 'loses' ? 2.5 : 5
  const winner =
    result.direction === 'loses'
      ? 'The bold arrow, the heat going out, wins: the black hole is hotter than the background.'
      : result.direction === 'gains'
        ? 'The bold arrow, the heat coming in, wins: the black hole is colder than the background.'
        : 'The two arrows are equal: the black hole and the background are at the same temperature.'

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
        Which way is the black hole's mass going?
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Heat comes in from the background and goes out as Hawking radiation. The bold arrow is the one that wins.
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

      {/* The black hole: its edge is the horizon */}
      <circle cx={FLOW_CX} cy={FLOW_CY} r={radius} fill="#000000" stroke={LINE_COLOR} strokeWidth={2.5} />
      <text x={FLOW_CX} y={FLOW_CY + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
        black hole
      </text>
      <text x={FLOW_CX} y={FLOW_CY + DISK_RADIUS * (1 + DISK_CHANGE_FRACTION) + 22} fill={LINE_COLOR} fontSize="10.5" textAnchor="middle">
        white ring: the horizon, the edge of the black hole
      </text>

      <text x={60} y={FLOW_HEIGHT - 86} fill="#e2e8f0" fontSize="11">
        {winner}
      </text>
      <text x={60} y={FLOW_HEIGHT - 64} fill="#ffffff" fontSize="11.5" fontWeight="bold">
        So the black hole's mass {DIRECTION_NAME[result.direction]}.
      </text>
      <text x={60} y={FLOW_HEIGHT - 42} fill="#94a3b8" fontSize="10">
        The arrows only show which flow wins, not how much. The black hole's size change in the time-lapse is greatly exaggerated:
      </text>
      <text x={60} y={FLOW_HEIGHT - 26} fill="#94a3b8" fontSize="10">
        the real change is far too slow and too small to see, and the time-lapse is only a way of showing the direction.
      </text>
    </svg>
  )
}

// The third picture: how long a lone black hole would take to evaporate, against its mass, on a log-log graph.
function LifetimeGraph({ result }: { result: HawkingResult }) {
  const logXMin = Math.log10(MIN_MASS_KG)
  const logXMax = Math.log10(MAX_MASS_KG)
  const xFor = (kg: number) => LIFE_LEFT + ((Math.log10(kg) - logXMin) / (logXMax - logXMin)) * (LIFE_RIGHT - LIFE_LEFT)
  const yFor = (years: number) =>
    LIFE_BOTTOM - ((Math.log10(years) - LIFE_LOG_Y_MIN) / (LIFE_LOG_Y_MAX - LIFE_LOG_Y_MIN)) * (LIFE_BOTTOM - LIFE_TOP)
  const line = result.curve.map((p) => `${xFor(p.massKg)},${yFor(p.lifetimeYears)}`).join(' ')
  const yAge = yFor(UNIVERSE_AGE_YEARS)
  const crossMass = massForLifetimeKg(UNIVERSE_AGE_YEARS)
  const xTicks = [11, 16, 21, 26, 31, 36, 41]
  const yTicks = [20, 40, 60, 80, 100]
  // Labels sit above-left of a dot, or below-right of it, so that neighbouring dots do not cover each other's names.
  const above = new Set(['sun', 'sgr-a-star', 'm87-star'])

  return (
    <svg viewBox={`0 0 ${LIFE_WIDTH} ${LIFE_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${LIFE_WIDTH}px` }}>
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

      {/* The age of the universe, and where the line crosses it */}
      <line x1={LIFE_LEFT} y1={yAge} x2={LIFE_RIGHT} y2={yAge} stroke={LINE_COLOR} strokeOpacity={0.7} strokeDasharray="5 4" />
      <text x={LIFE_RIGHT - 4} y={yAge - 6} fill={LINE_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="end">
        the age of the universe: about {UNIVERSE_AGE_TEXT} years
      </text>
      <line x1={xFor(crossMass)} y1={LIFE_TOP + 50} x2={xFor(crossMass)} y2={LIFE_BOTTOM} stroke={LINE_COLOR} strokeOpacity={0.7} strokeDasharray="5 4" />
      <text x={xFor(crossMass) + 6} y={LIFE_TOP + 34} fill={LINE_COLOR} fontSize="10">
        {formatScientific(crossMass, 2)} kg: a black hole of this mass
      </text>
      <text x={xFor(crossMass) + 6} y={LIFE_TOP + 47} fill={LINE_COLOR} fontSize="10">
        would last exactly the age of the universe
      </text>

      {/* The lifetime line, and the six black holes on it */}
      <polyline points={line} fill="none" stroke={OUT_COLOR} strokeWidth={3} />
      {HAWKING_PRESETS.map((p) => {
        const chosen = p.massKg === result.massKg
        const x = xFor(p.massKg)
        const y = yFor(lifetimeYears(p.massKg))
        const isAbove = above.has(p.id)
        const anchor = isAbove ? 'end' : 'start'
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={chosen ? 8 : 4} fill={chosen ? '#0b1020' : '#cbd5e1'} stroke={chosen ? LINE_COLOR : 'none'} strokeWidth={2.5} />
            {chosen && <circle cx={x} cy={y} r={3} fill={LINE_COLOR} />}
            <text
              x={x + (isAbove ? -12 : 12)}
              y={y + (isAbove ? -8 : 16)}
              fill={chosen ? LINE_COLOR : '#cbd5e1'}
              fontSize="10.5"
              fontWeight={chosen ? 'bold' : 'normal'}
              textAnchor={anchor}
            >
              {presetLabel[p.id]}
            </text>
          </g>
        )
      })}
      <text x={LIFE_LEFT + 6} y={LIFE_TOP + 14} fill={OUT_COLOR} fontSize="10.5" fontWeight="bold">
        the lifetime line
      </text>

      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 52} fill="#cbd5e1" fontSize="11">
        Your black hole would take about {formatBig(result.lifetimeYears)} years: {formatBig(result.lifetimeOverUniverseAge)} times the age of the universe.
      </text>
      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 32} fill="#94a3b8" fontSize="10">
        A straight line on a graph like this means a power law: ten times the mass takes 1,000 times as long.
      </text>
      <text x={LIFE_LEFT} y={LIFE_HEIGHT - 16} fill="#94a3b8" fontSize="10">
        The times are rough, for a black hole alone in a perfectly cold space with nothing falling in.
      </text>
    </svg>
  )
}

export function HawkingRadiationExperiment({ onComplete, onTutorComplete }: HawkingRadiationExperimentProps) {
  const [massKg, setMassKg] = useState(HAWKING_PRESETS[2].massKg)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [hotPrediction, setHotPrediction] = useState<HotChoice | null>(null)
  const [directionPrediction, setDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [longerPrediction, setLongerPrediction] = useState<LongerChoice | null>(null)
  const [submittedHot, setSubmittedHot] = useState<HotChoice | null>(null)
  const [submittedDirection, setSubmittedDirection] = useState<DirectionChoice | null>(null)
  const [submittedLonger, setSubmittedLonger] = useState<LongerChoice | null>(null)

  const hasPrediction = hotPrediction !== null && directionPrediction !== null && longerPrediction !== null
  const hasSubmittedPrediction = submittedHot !== null && submittedDirection !== null && submittedLonger !== null

  const result = useMemo(() => runHawkingRadiationExperiment(massKg), [massKg])
  const showResults = status === 'complete' && hasSubmittedPrediction

  // The numbers the Results need, all from the physics module (CLAUDE.md §9).
  const steps = useMemo(() => hawkingSteps(massKg), [massKg])
  const presetRows = useMemo(() => HAWKING_PRESETS.map((p) => ({ preset: p, row: runHawkingRadiationExperiment(p.massKg) })), [])
  const tenSunsKg = 10 * SUN_MASS_KG
  const temperatureOneSun = hawkingTemperatureKelvin(SUN_MASS_KG)
  const temperatureTenSuns = hawkingTemperatureKelvin(tenSunsKg)
  const tenSunsResult = useMemo(() => runHawkingRadiationExperiment(tenSunsKg), [tenSunsKg])
  const hotModel: HotChoice = temperatureOneSun > temperatureTenSuns ? 'small' : temperatureOneSun < temperatureTenSuns ? 'big' : 'same'
  const directionModel: DirectionChoice = (
    { loses: 'losing', gains: 'gaining', balanced: 'same' } as Record<MassDirection, DirectionChoice>
  )[massDirection(tenSunsKg)]
  // The choice nearest (in ratio) to how many times longer ten times the mass takes.
  const TIMES_LONGER: Record<LongerChoice, number> = { ten: 10, hundred: 100, thousand: 1000 }
  const tenfoldRatio = lifetimeYears(tenSunsKg) / lifetimeYears(SUN_MASS_KG)
  const longerModel = (Object.keys(TIMES_LONGER) as LongerChoice[]).reduce((best, choice) =>
    Math.abs(Math.log(TIMES_LONGER[choice] / tenfoldRatio)) < Math.abs(Math.log(TIMES_LONGER[best] / tenfoldRatio)) ? choice : best,
  )

  const handleMassChange = (value: number) => {
    setMassKg(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedHot(hotPrediction)
      setSubmittedDirection(directionPrediction)
      setSubmittedLonger(longerPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((n) => n + 1)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the chosen
  // black hole.
  const handleChangePrediction = () => {
    setSubmittedHot(null)
    setSubmittedDirection(null)
    setSubmittedLonger(null)
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 10 — Hawking Radiation: Does a Black Hole Slowly Disappear?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). The introduction must not give away the answers to the
            three predictions below (§12): not that a smaller black hole is hotter, not that a black hole can be colder than
            the background, not which way a black hole's mass goes in the background, and not how the time to evaporate
            depends on the mass. It says that a black hole might have a temperature and might lose mass, since the questions
            need that much, but it does not use the name "Hawking radiation", which the first picture's caption gives after a
            run. The Results, the tutor and the heat-flow rule come later. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> So far, a black hole has been a one-way door: things fall in, and nothing comes
            out, not even light. Experiment 9 showed how a black hole is born. This experiment asks about its end. Quantum
            physics, the science of very small things such as atoms and particles, changes the picture a little. It says that
            a black hole is not perfectly black: it gives off a very faint heat of its own, so it has a temperature. The energy
            that leaves would come out of the black hole's own mass. But a black hole does not sit in empty space. Space has
            some heat of its own too (you will meet it below). So which way does a black hole's mass go, and can a black hole
            slowly disappear?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> It is easy to think of a black hole as something that only ever grows: everything
            falls in and nothing comes out. Is that really so? In this experiment you will find out what decides whether a black
            hole grows or shrinks, and how long it would take to disappear completely.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What happens.</strong> Here is the whole experiment, step by step.
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>You make three predictions.</li>
            <li>You choose one of six black holes (they are described below).</li>
            <li>
              You press Run. A time-lapse plays for 10 seconds. It shows which way the black hole's mass goes. This is only how
              the result is shown: the real changes take far, far longer than that.
            </li>
            <li>
              A <strong>thermometer</strong> compares the black hole's temperature with the temperature of space. A picture with{' '}
              <strong>arrows</strong> shows which way the black hole's mass goes. A <strong>graph</strong> shows how long a
              black hole alone would take to disappear.
            </li>
            <li>
              The experiment shows only the direction in which the mass goes, and not how fast it changes there.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> <strong>Temperature</strong> says how hot something is. Scientists measure
            it in <strong>kelvin</strong> (K). A kelvin is the same size of step as a degree Celsius, but the scale starts at
            the coldest temperature there can be, 0 K, which is −273 °C, so nothing is colder than 0 K. Water freezes at 273 K,
            and a room is about 293 K. <strong>The cosmic microwave background</strong>, from Cosmology, Experiment 3, is a very
            faint glow of microwaves (a kind of light our eyes cannot see) that fills all of space and is left over from the
            early universe. It has a temperature of {BACKGROUND_KELVIN} K, about {DEGREES_BELOW_FREEZING} degrees below freezing. To{' '}
            <strong>evaporate</strong> is to shrink away, bit by bit, until nothing is left, the way a puddle dries up. From
            Experiment 1: a <strong>Sun</strong> is the mass of our Sun, a black hole of "1 Sun" is a black hole with that
            mass (the Sun itself will never become one), and the <strong>horizon</strong> is the edge of a black hole, from
            inside which nothing can escape.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The six black holes.</strong> Mass is measured here in kilograms (kg) and in Suns (one Sun is about
            {SUN_MASS_TEXT} kg). Some numbers in this experiment are very large or very small, so they are written with powers of ten:
            10³ is 1,000 (a 1 with 3 zeros after it), and 10⁻³ is 0.001 (one thousandth). The <strong>mountain-sized</strong>{' '}
            black hole has the mass of a small mountain, about 10¹² kg. It is hypothetical: some scientists have suggested
            that black holes this small could have formed in the early universe, but none has been found. The{' '}
            <strong>balance mass</strong> is a special black hole of about 0.6 of the Moon's mass, chosen for a reason you
            will see in the results. Then come black holes of <strong>1 Sun</strong> and <strong>10 Suns</strong> (a stellar
            black hole, as in Experiment 1), and the two giants from Experiment 1 at the centers of galaxies:{' '}
            <strong>Sagittarius A*</strong>, in our own galaxy (about {SGR_A_STAR_MILLIONS} million Suns), and <strong>M87*</strong> (about
            {M87_BILLIONS} billion Suns).
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this builds on.</strong> Experiment 1 found the horizon radius and gave the black holes in the list.
            Experiment 9 showed how a black hole forms. This experiment is about the other end of its story. The cosmic
            microwave background comes from Cosmology, Experiment 3.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make three predictions. Then choose a black hole and run it. Try the other black
            holes too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Where the black hole's dot is on the thermometer compared with the white line
            for the background, which arrow is thick, which way the black hole's disk changes, and where the black hole is
            on the graph as you try different ones.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment about one black hole</strong> that is alone, is not spinning, and has
              nothing falling into it.
            </li>
            <li>
              <strong>The formulas are standard results, given and not derived.</strong> Nobody has ever seen this faint heat
              from a real black hole. The experiment says so again where it matters.
            </li>
            <li>
              <strong>The times are rough.</strong> They are only good to within a few times, and are best read as powers of
              ten.
            </li>
            <li>
              <strong>The background is held at {BACKGROUND_KELVIN} K.</strong> The real background keeps getting colder as the
              universe expands, and the experiment does not model that.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A black hole is huge, and a small one is tiny. Which do you think would be hotter, if they glowed with heat?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {hotChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setHotPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${hotPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Black holes in space are surrounded by the cold, faint heat of the cosmic microwave background, at {BACKGROUND_KELVIN} K,
            about {DEGREES_BELOW_FREEZING} degrees below freezing. A black hole of 10 Suns glows at a temperature far below that. Do you think it is
            losing mass, gaining mass, or staying the same?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {directionChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setDirectionPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${directionPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If a black hole had ten times the mass, how much longer do you think it would take to evaporate, if it were alone?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {longerChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setLongerPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${longerPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${hotChoices.find((c) => c.value === (hotPrediction ?? submittedHot))!.label}; ${
                  directionChoices.find((c) => c.value === (directionPrediction ?? submittedDirection))!.label
                }; ${longerChoices.find((c) => c.value === (longerPrediction ?? submittedLonger))!.label}`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes as you like below. Or, change your
              predictions and start over:
            </p>
            <button
              type="button"
              onClick={handleChangePrediction}
              className="secondary-button"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(124, 58, 237, 0.22)',
              }}
            >
              Change predictions
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Choose a black hole:</p>
          {HAWKING_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleMassChange(p.massKg)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${massKg === p.massKg ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {presetLabel[p.id]}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            {presetLabel[HAWKING_PRESETS.find((p) => p.massKg === massKg)!.id]} has a mass of {formatKg(result.massKg)}
            {result.massSolarMasses === 1
              ? " (the Sun's mass)"
              : result.massSolarMasses >= 0.1
                ? ` (${formatBig(result.massSolarMasses)} times the Sun's mass)`
                : ''} and a horizon radius
            of {formatLength(result.horizonRadiusKm)}.
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Answer the predictions above to try the controls.</p>
        )}

        {/* Shown only once the current black hole has been run: choosing another returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              This black hole has a temperature of {formatKelvin(result.temperatureKelvin)}, which is{' '}
              {compareWithBackground(result)} the background's {BACKGROUND_KELVIN} K. So its mass {DIRECTION_NAME[result.direction]}.
              Alone, with nothing falling in, it would take about {formatBig(result.lifetimeYears)} years to evaporate (the
              universe is about {UNIVERSE_AGE_TEXT} years old).
            </p>

            <Thermometer result={result} />
            {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). */}
            <div style={{ ...CAPTION_STYLE, maxWidth: `${THERMO_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the thermometer.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> A scale of temperature, in <em>kelvin</em> (K). A kelvin is the same size of
                step as a degree Celsius, but the scale starts at the coldest temperature there can be, 0 K, which is
                −273 °C, so no temperature is below zero. The white line is the cosmic microwave background, the faint heat
                left over from the early universe, at {BACKGROUND_KELVIN} K (Cosmology, Experiment 3). Each dot is a black hole,
                and the one ringed in white is the one you chose.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> A black hole is not perfectly black. It gives off a very faint
                heat, called <em>Hawking radiation</em>, so it has a temperature. This is a standard result that is stated here
                and not derived, and nobody has measured it from a real black hole. The bigger the black hole, the colder it is.
                Heat flows from what is hotter to what is colder, so a black hole hotter than the background loses mass, and one
                colder than the background gains it.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the picture one part at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The scale on the left is logarithmic.</strong> Each mark is 100,000 times as hot as the mark below it.
                  That is how one picture can hold a temperature of 10¹¹ K and one of 10⁻¹⁷ K, which differ by a factor of
                  about 10²⁸.
                </li>
                <li>
                  <strong>The white line is the background.</strong> It splits the picture in two. Above it, a black hole is
                  hotter than the background (orange). Below it, a black hole is colder (blue).
                </li>
                <li>
                  <strong>Each dot is a black hole,</strong> placed at its temperature and named. The one you chose has a white
                  ring and the words "your black hole".
                </li>
                <li>
                  <strong>Look at the order of the dots.</strong> The mountain-sized black hole is the lightest and the
                  hottest. M87*, the heaviest, is the coldest. The balance mass sits on the white line: the black hole that is
                  exactly as hot as the background.
                </li>
                <li>
                  <strong>Try this:</strong> run 1 Sun and then 10 Suns. The dot drops to one tenth of the temperature when the
                  mass goes up ten times. Then run the mountain-sized one and see which side of the white line it is on.
                </li>
                <li>
                  <strong>In this run,</strong> your black hole is at {formatKelvin(result.temperatureKelvin)}, which is{' '}
                  {compareWithBackground(result)} the background.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This is a thought experiment about one black hole that is not spinning. The formula is
                a standard result, and the radiation has never been seen from a real black hole.
              </p>
            </div>

            <Flow result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${FLOW_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: which way is the mass going?</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> The black disk is the black hole, and the white ring around it is its{' '}
                <em>horizon</em>, the edge you met in Experiment 1, from inside which nothing can escape. The blue arrow pointing
                in is the heat the black hole takes in from the background. The orange arrow pointing out is the heat it gives
                off as Hawking radiation. The bold arrow is the one that wins.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> Heat flows from what is hotter to what is colder. If the black hole
                is hotter than its surroundings, it gives off more than it takes in, and the energy that leaves comes out of its
                mass, so its mass goes down. If it is colder, it takes in more than it gives off, and its mass goes up. The
                experiment shows only which way it goes, and not how fast.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the picture one part at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The two arrows are the two flows of heat.</strong> Blue comes in from the background, which is at{' '}
                  {BACKGROUND_KELVIN} K. Orange goes out of the black hole.
                </li>
                <li>
                  <strong>Thick and thin tell you which flow wins.</strong> Whichever arrow is thick is the one that wins. When
                  the black hole is hotter than the background, the orange arrow is thick. When it is colder, the blue arrow is
                  thick. At the balance mass the two are the same.
                </li>
                <li>
                  <strong>The disk shows the mass over the time-lapse.</strong> While it runs, the disk shrinks if the black hole
                  is losing mass, grows if it is gaining mass, and stays the same at the balance mass.
                </li>
                <li>
                  <strong>The words under the picture say the result</strong> in plain language: which flow wins, and so which
                  way the mass goes.
                </li>
                <li>
                  <strong>Try this:</strong> run the mountain-sized black hole and then 10 Suns, and compare which arrow is thick
                  and what the disk does.
                </li>
                <li>
                  <strong>In this run,</strong> the mass of your black hole {DIRECTION_NAME[result.direction]}.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The arrows show which flow wins, and not how much. The change in the disk's size is
                greatly exaggerated: the real change is far too small to see, and the time-lapse does not show real time.
              </p>
            </div>

            <LifetimeGraph result={result} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${LIFE_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: how long to evaporate?</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> To <em>evaporate</em> means to lose all of its mass. The graph shows how long
                a black hole would take to evaporate, in years, against its mass, in kg. The orange line is the time for black
                holes of every mass. The dots are the six black holes you can choose, and the dashed white line is the age of
                the universe.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> This is a standard result, stated and not derived: if a black hole
                were alone, with nothing falling in and no background heat to take in, the time it would take to evaporate grows
                as the <em>cube</em> of its mass. Ten times the mass takes 10 × 10 × 10 = 1,000 times as long. The times are
                rough values, correct only to within a few times.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the graph one part at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Both scales are logarithmic.</strong> Each mark along the bottom is 10⁵ = 100,000 times the mass of
                  the one before. Each mark up the side is 10²⁰ times as long as the one below it. That is how one graph can hold
                  a black hole's lifetime of billions of years and one of 10⁹⁶ years.
                </li>
                <li>
                  <strong>The line is straight because of the cube.</strong> On a graph like this, a rule such as "ten times the
                  mass, 1,000 times the time" always makes a straight line. Every step to the right of one power of ten makes the
                  time 1,000 times longer.
                </li>
                <li>
                  <strong>The dashed white lines mark the age of the universe.</strong> The line crosses it at about{' '}
                  {formatScientific(massForLifetimeKg(UNIVERSE_AGE_YEARS), 2)} kg. A black hole lighter than that would already
                  have evaporated, if it had been alone since the start. Every black hole found in space is far heavier.
                </li>
                <li>
                  <strong>Each dot is a black hole,</strong> at its mass and its time. The one you chose has a white ring.
                </li>
                <li>
                  <strong>Try this:</strong> compare 1 Sun and 10 Suns. The 10-Suns black hole has ten times the mass, and its
                  dot is 1,000 times as high up the side: it takes 1,000 times as long.
                </li>
                <li>
                  <strong>In this run,</strong> your black hole would take about {formatBig(result.lifetimeYears)} years, which is{' '}
                  {formatBig(result.lifetimeOverUniverseAge)} times the age of the universe.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This is the time for a black hole alone in a perfectly cold space. In the real universe
                the background is warmer than any black hole in space, so these black holes are not evaporating now.
              </p>
            </div>

            {showResults && (() => {
              const verdict = (right: boolean, wrongText: string) => (right ? 'So your prediction was right.' : `So your prediction was off this time. ${wrongText}`)
              const years = (v: number) => `${formatBig(v)} years`
              const cell = { padding: '0.3rem 1rem 0.3rem 0' } as const
              return (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
                  {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). */}
                  <h3 style={{ marginTop: 0 }}>Results</h3>
                  <p>
                    You chose <strong>{presetLabel[HAWKING_PRESETS.find((p) => p.massKg === massKg)!.id]}</strong>. For this run:
                  </p>
                  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                      <tbody>
                        {[
                          ['Its mass', `${formatKg(result.massKg)}${result.massSolarMasses >= 0.1 ? ` (${formatBig(result.massSolarMasses)} Suns)` : ''}`],
                          ['Its horizon radius', formatLength(result.horizonRadiusKm)],
                          ['Its temperature', formatKelvin(result.temperatureKelvin)],
                          ['Compared with the background (' + BACKGROUND_KELVIN + ' K)', `${compareWithBackground(result)} the background`],
                          ['Which way its mass goes', DIRECTION_NAME[result.direction]],
                          ['Time to evaporate, alone', years(result.lifetimeYears)],
                          ['That time divided by the age of the universe', `${formatBig(result.lifetimeOverUniverseAge)} times`],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td style={{ ...cell, verticalAlign: 'top' }}>{label}</td>
                            <td style={{ padding: '0.3rem 0', verticalAlign: 'top' }}>
                              <strong>{value}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p>
                    <strong>Checking your first prediction:</strong> asked which would be hotter, a big black hole or a small one,
                    you answered "{hotChoices.find((c) => c.value === submittedHot)!.label}". In the model, a black hole of 1 Sun has a
                    temperature of {formatKelvin(temperatureOneSun)}, and one of 10 Suns has {formatKelvin(temperatureTenSuns)}: ten
                    times the mass, a tenth of the temperature.{' '}
                    {verdict(
                      submittedHot === hotModel,
                      submittedHot === 'big'
                        ? 'The bigger black hole is the colder one, and the smaller one is the hotter.'
                        : 'The temperatures are not the same: the smaller black hole is the hotter one.',
                    )}
                  </p>
                  <p>
                    <strong>Checking your second prediction:</strong> asked whether a black hole of 10 Suns is losing mass, gaining
                    mass or staying the same, you answered "{directionChoices.find((c) => c.value === submittedDirection)!.label}". In
                    the model, a black hole of 10 Suns has a temperature of {formatKelvin(temperatureTenSuns)}, which is{' '}
                    {compareWithBackground(tenSunsResult)} the background's {BACKGROUND_KELVIN} K. Heat flows from what is hotter to
                    what is colder, so this black hole, colder than its surroundings, takes in more than it gives out, and its mass
                    goes up.{' '}
                    {verdict(
                      submittedDirection === directionModel,
                      submittedDirection === 'losing'
                        ? 'A black hole loses mass only if it is hotter than its surroundings, and this one is far colder.'
                        : `A black hole stays the same only at the balance mass, about ${formatKg(balanceMassKg())}. This one is far heavier, and so colder.`,
                    )}
                  </p>
                  <p>
                    <strong>Checking your third prediction:</strong> asked how much longer a black hole of ten times the mass would
                    take to evaporate, you answered "{longerChoices.find((c) => c.value === submittedLonger)!.label}". In the model, a
                    black hole of 1 Sun takes {years(lifetimeYears(SUN_MASS_KG))} and one of 10 Suns takes{' '}
                    {years(lifetimeYears(tenSunsKg))}: {Math.round(tenfoldRatio).toLocaleString('en-US')} times as long.{' '}
                    {verdict(
                      submittedLonger === longerModel,
                      'The time grows as the cube of the mass: ten times the mass takes 10 × 10 × 10 = 1,000 times as long.',
                    )}
                  </p>

                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>The simple math: the temperature.</strong> The model's formula is given and not derived: a black hole of
                    1 Sun has a temperature of {formatKelvin(steps.oneSunTemperatureKelvin)}, and the temperature is that value
                    divided by the black hole's mass in Suns. For your black hole:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                    <li>
                      Its mass in Suns is {formatKg(result.massKg)} ÷ {formatKg(SUN_MASS_KG)} ={' '}
                      <strong>{formatBig(steps.massSolarMasses)}</strong>.
                    </li>
                    <li>
                      Its temperature is {formatKelvin(steps.oneSunTemperatureKelvin)} ÷ {formatBig(steps.massSolarMasses)} ={' '}
                      <strong>{formatKelvin(steps.temperatureKelvin)}</strong>.
                    </li>
                    <li>
                      {result.direction === 'balanced' ? (
                        <>
                          Compared with the background: {formatKelvin(steps.temperatureKelvin)} ÷ {BACKGROUND_KELVIN} K = 1, so it
                          is <strong>the same temperature as</strong> the background.
                        </>
                      ) : result.direction === 'loses' ? (
                        <>
                          Compared with the background: {formatKelvin(steps.temperatureKelvin)} ÷ {BACKGROUND_KELVIN} K ={' '}
                          {formatBig(steps.temperatureOverBackground)}, so it is{' '}
                          <strong>{formatBig(steps.temperatureOverBackground)} times hotter than</strong> the background.
                        </>
                      ) : (
                        <>
                          Compared with the background: {BACKGROUND_KELVIN} K ÷ {formatKelvin(steps.temperatureKelvin)} ={' '}
                          {formatBig(1 / steps.temperatureOverBackground)}, so it is{' '}
                          <strong>{formatBig(1 / steps.temperatureOverBackground)} times colder than</strong> the background.
                        </>
                      )}
                    </li>
                  </ol>

                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>The simple math: the time to evaporate.</strong> Also given and not derived: a black hole of 1 Sun,
                    alone, takes {years(steps.oneSunLifetimeYears)}, and the time is that value times the cube of the black hole's mass
                    in Suns. For your black hole:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                    <li>
                      The cube of its mass in Suns is {formatBig(steps.massSolarMasses)} × {formatBig(steps.massSolarMasses)} ×{' '}
                      {formatBig(steps.massSolarMasses)} = <strong>{formatBig(steps.massCubed)}</strong>.
                    </li>
                    <li>
                      The time is {years(steps.oneSunLifetimeYears)} × {formatBig(steps.massCubed)} ={' '}
                      <strong>{years(steps.lifetimeYears)}</strong>.
                    </li>
                    <li>
                      The universe is about {formatScientific(UNIVERSE_AGE_YEARS)} years old, and {formatBig(steps.lifetimeYears)} ÷{' '}
                      {formatScientific(UNIVERSE_AGE_YEARS)} = <strong>{formatBig(steps.lifetimeOverUniverseAge)}</strong> times the age
                      of the universe.
                    </li>
                    <li>
                      With ten times the mass, the cube is 10 × 10 × 10 = 1,000 times bigger, so the time would be{' '}
                      {years(steps.lifetimeYears)} × 1,000 = <strong>{years(steps.tenTimesMassLifetimeYears)}</strong>.
                    </li>
                  </ol>

                  <p>The six black holes compare like this:</p>
                  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                      <thead>
                        <tr>
                          {['Black hole', 'Mass', 'Temperature', 'Compared with the background', 'Which way the mass goes', 'Time to evaporate, alone'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', ...cell }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {presetRows.map(({ preset, row }) => (
                          <tr key={preset.id} style={preset.massKg === result.massKg ? { fontWeight: 'bold' } : undefined}>
                            <td style={cell}>{presetLabel[preset.id]}</td>
                            <td style={cell}>{formatKg(row.massKg)}</td>
                            <td style={cell}>{formatKelvin(row.temperatureKelvin)}</td>
                            <td style={cell}>{compareWithBackground(row)} the background</td>
                            <td style={cell}>{row.direction === 'loses' ? 'goes down' : row.direction === 'gains' ? 'goes up' : 'stays the same'}</td>
                            <td style={{ padding: '0.3rem 0' }}>{years(row.lifetimeYears)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p>
                    <strong>Two comparisons from daily life.</strong> First, which way heat flows. A hot cup of coffee in a cold
                    room cools down, because heat flows from the coffee into the room. A cold drink in a warm room warms up, because
                    heat flows from the room into the drink. A black hole in the cosmic microwave background is like the coffee or the
                    drink, and the background is like the room: a black hole colder than the background takes in heat and gains
                    mass, and one hotter than the background gives off heat and loses mass. Second, the cube. A cube that is 10 cm on each side, next to one that is 1 m (ten times as
                    long) on each side: the big one holds 10 × 10 × 10 = 1,000 times as much. The time a black hole takes to
                    evaporate follows the same pattern: ten times the mass means three tens multiplied together, 1,000 times as
                    long. Both are only comparisons.
                    They do not explain why a black hole has a temperature, or why its lifetime follows the cube of its mass.
                  </p>

                  <div
                    style={{
                      margin: '0.75rem 0',
                      padding: '0.75rem 1rem',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    }}
                  >
                    <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                      <strong>What this model can and cannot tell you.</strong> This is a thought experiment about one black hole
                      that is alone, is not spinning and has nothing falling into it, in a background held at {BACKGROUND_KELVIN} K.
                      It shows which way a black hole's mass goes, and not how fast. The real background keeps getting colder as
                      the universe expands, and the experiment does not say when a black hole would start to lose mass. The time
                      to evaporate is for a black hole alone in a perfectly cold space, and is only good to within a few times.
                      The very last stage of an evaporation is not modeled.
                    </p>
                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                      The formulas are standard results, given and not derived. Nobody has ever seen this faint heat from a real
                      black hole, so everything here is a prediction of the theory. The time-lapse is only a way of showing the
                      direction, and the real changes take far longer.
                    </p>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>

      {showResults && (
        <HawkingRadiationTutor
          key={runCount}
          predictedHot={submittedHot}
          predictedDirection={submittedDirection}
          predictedLonger={submittedLonger}
          matches={{ hot: submittedHot === hotModel, direction: submittedDirection === directionModel, longer: submittedLonger === longerModel }}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
