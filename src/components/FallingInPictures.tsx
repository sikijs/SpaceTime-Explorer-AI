import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  BODY_LENGTH_METERS,
  MAX_START_IN_HORIZON_RADII,
  farClockIncreasesPerTenfoldGap,
  nearHorizonReadings,
  stretchCurve,
  stretchGrowth,
  stretchGuessMarker,
  stretchInG,
  runFallingInExperiment,
} from '../physics/fallingInExperiment'
import type { EndChoice, FallingInResult, FarClockChoice, StretchChoice } from '../physics/fallingInExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { GUESS_COLOR } from './BlackHoleSizePictures'
import { CaptionBox, LookFor } from './TidalEffectExperiment'

// Black Holes, Experiment 5 (audit update): the pictures. Part 1 has Picture 1 (the fall, with two clocks and the stretch), Picture 2 (how near
// the horizon, on each clock, which carries guesses 1 and 2) and Picture 3 (the stretch against distance, which carries guess 3). Part 2 has
// Pictures 4 to 6 (the same three for the learner's settings) with no white marks (CLAUDE.md §14, "Predictions and the Real Results"). White means
// the learner's guess and nothing else, so "the traveler, now" in Picture 3 is the traveler's cyan. Every number is passed in from, or computed by,
// the physics module.

// The picture of the fall: a title strip, a side view of the drop, the three live readouts, and a legend strip.
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 584
const CENTER_X = 200
const CENTER_Y = 340 // the center of the black hole
const AREA_TOP = 66
const AREA_BOTTOM = 360
const ZOOM_MARGIN = 1.08
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20, 50, 100]
const SCALE_BAR_Y = 374
const READOUT_TOP = 392
const LEGEND_TOP = 504


export const KM_PER_AU = 149_597_870.7

const TRAVELER_COLOR = '#22d3ee' // the traveler's clock
const FAR_COLOR = '#fb923c' // the far-away clock
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'
const STRETCH_COLOR = '#fbbf24'
const REFERENCE_COLOR = '#e2e8f0'
const HOLE_CURVE_COLORS: Record<ObjectPreset['id'], string> = {
  earth: '#94a3b8',
  sun: '#94a3b8',
  'neutron-star': '#94a3b8',
  'stellar-black-hole': '#fbbf24',
  'sgr-a-star': '#a78bfa',
  'm87-star': '#4ade80',
}

// The graph of the gap above the horizon against time (the second picture).
const TIME_GRAPH_WIDTH = 640
const TIME_GRAPH_HEIGHT = 480
const TIME_PLOT_LEFT = 80
const TIME_PLOT_RIGHT = 610
const TIME_PLOT_TOP = 66
const TIME_PLOT_BOTTOM = 300
// Where the two guess boxes of Picture 2 sit: under the plot.
const GUESS_BOX_Y = 348
const GUESS_BOX_ONE_X = 250
const GUESS_BOX_TWO_X = 510
const LOWEST_GAP_LOG10 = -4.4 // the log of the gap at the bottom of the graph; the horizon itself is off the scale

// The graph of the stretch against distance (the third picture).
const STRETCH_GRAPH_WIDTH = 640
const STRETCH_GRAPH_HEIGHT = 480
const STRETCH_PLOT_LEFT = 80
const STRETCH_PLOT_RIGHT = 610
const STRETCH_PLOT_TOP = 66
const STRETCH_PLOT_BOTTOM = 290
const STRETCH_LOG10_MIN = -17.5
const STRETCH_LOG10_MAX = 8.5

// Fixed real-world playback duration for the whole fall, independent of the physics result (CLAUDE.md §11). The playback runs steadily in the
// traveler's own time.
export const RUN_PLAYBACK_SECONDS = 8
export const START_PRESETS = [100, 20, 10, 5, 2]

// ---- the three questions' choices ----
export const END_CHOICES: Array<{ value: EndChoice; label: string; short: string }> = [
  { value: 'finite', label: 'Yes: it takes a finite time, and they get there', short: 'finite: reaches the horizon' },
  { value: 'never', label: 'No: it never finishes, and they never get there', short: 'never: keeps going' },
  { value: 'depends', label: 'It ends for some black holes and not for others', short: 'depends on the black hole' },
]
export const FAR_CLOCK_CHOICES: Array<{ value: FarClockChoice; label: string; short: string }> = [
  { value: 'same', label: "About the same as the traveler's watch", short: 'about the same' },
  { value: 'settles', label: 'Somewhat more, and then it settles', short: 'somewhat more, then settles' },
  { value: 'no-limit', label: 'Later and later, without limit, as the traveler nears the horizon', short: 'later and later, no limit' },
]
export const STRETCH_CHOICES: Array<{ value: StretchChoice; label: string; short: string }> = [
  { value: 'small', label: 'Much stronger at the small black hole', short: 'stronger at the small hole' },
  { value: 'same', label: 'About the same', short: 'about the same' },
  { value: 'giant', label: 'Much stronger at the giant black hole', short: 'stronger at the giant hole' },
]
export const endLabel = (v: EndChoice) => END_CHOICES.find((c) => c.value === v)!.label
export const farClockLabel = (v: FarClockChoice) => FAR_CLOCK_CHOICES.find((c) => c.value === v)!.label
export const stretchLabel = (v: StretchChoice) => STRETCH_CHOICES.find((c) => c.value === v)!.label

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in plain units, from meters to trillions of kilometers.
export function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
export function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// A time in the unit that fits it, from thousandths of a second to years.
export function formatSeconds(seconds: number): string {
  if (seconds < 0.001) return `${formatNumber(seconds * 1e6)} millionths of a second`
  if (seconds < 0.1) return `${formatNumber(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${formatNumber(seconds)} seconds`
  if (seconds < 7200) return `${formatNumber(seconds / 60)} minutes`
  if (seconds < 172_800) return `${formatNumber(seconds / 3600)} hours`
  if (seconds < 3.156e7) return `${formatNumber(seconds / 86_400)} days`
  return `${formatNumber(seconds / 3.156e7)} years`
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
export function formatBig(value: number): string {
  if (value === 0) return '0'
  if (value >= 0.01 && value < 1000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  const power = String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')
  return `${mantissa} × 10${power}`
}

// A stretch in g.
export const formatG = (g: number) => `${formatBig(g)} g`

// A clock reading in horizon light-times, with the time in ordinary units in brackets.
export const formatClock = (horizonLightTimes: number, lightTimeSeconds: number) =>
  `${formatFour(horizonLightTimes)} light-times (${formatSeconds(horizonLightTimes * lightTimeSeconds)})`

// Four significant figures, for the steps of a worked calculation.
export const formatFour = (value: number) => String(Number(value.toPrecision(4)))

// Where the fall has got to when the traveler's own clock reads the given time, from the points the physics module gave.
export function stateAt(result: FallingInResult, travelerTime: number) {
  const points = result.points
  const last = points.length - 1
  if (travelerTime >= points[last].travelerClock) {
    return { r: 1, far: result.farAwayClockAtCutoff, atHorizon: true }
  }
  let low = 0
  let high = last
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (points[middle].travelerClock <= travelerTime) low = middle
    else high = middle
  }
  const a = points[low]
  const b = points[high]
  const span = b.travelerClock - a.travelerClock
  const fraction = span > 0 ? (travelerTime - a.travelerClock) / span : 0
  const farA = a.farAwayClock ?? result.farAwayClockAtCutoff
  const farB = b.farAwayClock ?? result.farAwayClockAtCutoff
  return { r: a.r + fraction * (b.r - a.r), far: farA + fraction * (farB - farA), atHorizon: false }
}

// ---- the white marks ----
function GuessBox({ x, y, width: minWidth, line2 }: { x: number; y: number; width: number; line2: string }) {
  // Wide enough for its second line (about 5.6 pixels a letter at this size).
  const width = Math.max(minWidth, line2.length * 5.6 + 24)
  return (
    <g>
      <rect x={x - width / 2} y={y} width={width} height={44} rx={6} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} />
      <text x={x} y={y + 19} fill={GUESS_COLOR} fontSize="14" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x} y={y + 36} fill={GUESS_COLOR} fontSize="10" textAnchor="middle">
        {line2}
      </text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 9
  const p1 = `${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)}`
  const p2 = `${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GUESS_COLOR} strokeWidth={3} />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} fill={GUESS_COLOR} />
    </g>
  )
}

export interface TimeGraphGuesses {
  end: EndChoice | null
  far: FarClockChoice | null
}

export function FallPanel({
  result,
  progress,
  pixelsPerHorizonRadius,
  scaleBarHorizonRadii,
}: {
  result: FallingInResult
  progress: number
  pixelsPerHorizonRadius: number
  scaleBarHorizonRadii: number
}) {
  const start = result.startInHorizonRadii
  const state = stateAt(result, progress * result.travelerClockAtHorizon)
  const travelerTime = progress * result.travelerClockAtHorizon
  const finished = progress >= 1
  const stretch = stretchInG(result.preset.massSolarMasses, state.r)

  const y = (r: number) => CENTER_Y - r * pixelsPerHorizonRadius
  const releaseY = y(start)
  const travelerY = y(state.r)
  const clockText = (horizonLightTimes: number) =>
    horizonLightTimes === 0
      ? '0'
      : `${formatFour(horizonLightTimes)} light-times (${formatSeconds(horizonLightTimes * result.lightTimeSeconds)})`

  const rows: Array<{ key: string; draw: ReactNode; text: string; fill: string }> = [
    {
      key: 'bh',
      draw: <circle cx={20} cy={LEGEND_TOP + 8} r={5} fill={BLACK_HOLE_COLOR} stroke={HORIZON_COLOR} strokeWidth={1.5} />,
      text: 'black hole; the rose ring is its horizon (1 horizon radius)',
      fill: '#cbd5e1',
    },
    {
      key: 'traveler',
      draw: <circle cx={20} cy={LEGEND_TOP + 24} r={5} fill={TRAVELER_COLOR} />,
      text: 'the traveler, falling straight in from rest (2 meters long)',
      fill: TRAVELER_COLOR,
    },
    {
      key: 'release',
      draw: <line x1={12} y1={LEGEND_TOP + 40} x2={28} y2={LEGEND_TOP + 40} stroke={REFERENCE_COLOR} strokeDasharray="3 2" />,
      text: 'dashed line: the path of the fall, from the release point',
      fill: '#cbd5e1',
    },
    {
      key: 'clocks',
      draw: <rect x={15} y={LEGEND_TOP + 51} width={10} height={10} fill={FAR_COLOR} />,
      text: 'orange: the far-away clock. Blue: the traveler\'s own clock',
      fill: '#cbd5e1',
    },
  ]

  return (
    <svg
      viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
      width="100%"
      style={{
        display: 'block',
        maxWidth: `${PANEL_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="fall-area">
          <rect x={0} y={AREA_TOP - 6} width={PANEL_WIDTH} height={AREA_BOTTOM - AREA_TOP + 6} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill={TRAVELER_COLOR} fontSize="13" fontWeight="bold">
        The fall, seen from the side
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Distance from the center: {state.r.toFixed(state.r < 1.1 ? 4 : 2)} horizon radii
      </text>
      <text x={12} y={54} fill={finished ? HORIZON_COLOR : '#94a3b8'} fontSize="11" fontWeight={finished ? 'bold' : 'normal'}>
        {finished
          ? 'The traveler has reached the horizon'
          : progress > 0
            ? 'Falling'
            : 'Ready: released from rest'}
      </text>

      <g clipPath="url(#fall-area)">
        {/* The path of the fall, and the release point */}
        <line x1={CENTER_X} y1={releaseY} x2={CENTER_X} y2={y(1)} stroke={REFERENCE_COLOR} strokeDasharray="5 4" strokeOpacity={0.6} />
        <line x1={CENTER_X - 14} y1={releaseY} x2={CENTER_X + 14} y2={releaseY} stroke={REFERENCE_COLOR} strokeWidth={2} />

        {/* The black hole and its horizon */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={pixelsPerHorizonRadius} fill={BLACK_HOLE_COLOR} fillOpacity={0.35} stroke={HORIZON_COLOR} strokeWidth={2} />

        {/* The traveler */}
        <circle cx={CENTER_X} cy={travelerY} r={5} fill={TRAVELER_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      </g>

      {/* On-canvas labels */}
      <text x={CENTER_X + 20} y={releaseY + 4} fill={REFERENCE_COLOR} fontSize="10">
        released here (at rest)
      </text>
      <text x={CENTER_X + 12} y={Math.max(travelerY - 8, AREA_TOP)} fill={TRAVELER_COLOR} fontSize="10">
        traveler
      </text>
      <text x={CENTER_X - 14} y={Math.min(CENTER_Y - pixelsPerHorizonRadius - 5, AREA_BOTTOM - 4)} fill={HORIZON_COLOR} fontSize="10" textAnchor="end">
        horizon
      </text>
      <text x={CENTER_X - 14} y={Math.min(CENTER_Y + 14, AREA_BOTTOM - 4)} fill={BLACK_HOLE_COLOR} fontSize="10" textAnchor="end">
        black hole
      </text>

      {/* The scale bar */}
      <g>
        <line x1={14} y1={SCALE_BAR_Y} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={SCALE_BAR_Y} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14} y1={SCALE_BAR_Y - 4} x2={14} y2={SCALE_BAR_Y + 4} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y1={SCALE_BAR_Y - 4} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={SCALE_BAR_Y + 4} stroke="#e2e8f0" strokeWidth={2} />
        <text x={22 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y={SCALE_BAR_Y + 4} fill="#e2e8f0" fontSize="10">
          scale: {scaleBarHorizonRadii} horizon {scaleBarHorizonRadii === 1 ? 'radius' : 'radii'}
        </text>
      </g>

      {/* The two clocks and the stretch */}
      <g>
        <text x={12} y={READOUT_TOP + 4} fill={TRAVELER_COLOR} fontSize="10">
          the traveler's clock (their own watch)
        </text>
        <text x={12} y={READOUT_TOP + 20} fill={TRAVELER_COLOR} fontSize="12" fontWeight="bold">
          {clockText(travelerTime)}
        </text>
        <text x={12} y={READOUT_TOP + 38} fill={FAR_COLOR} fontSize="10">
          the far-away clock (at rest, far from the black hole)
        </text>
        <text x={12} y={READOUT_TOP + 54} fill={FAR_COLOR} fontSize="11" fontWeight="bold">
          {finished ? 'more than ' : ''}
          {clockText(state.far)}
        </text>
        {finished && (
          <text x={12} y={READOUT_TOP + 66} fill={FAR_COLOR} fontSize="10">
            and still rising: it has no limit as the traveler nears the horizon
          </text>
        )}
        <text x={12} y={READOUT_TOP + 80} fill={STRETCH_COLOR} fontSize="10">
          stretch: the difference in pull from head to feet ({BODY_LENGTH_METERS}-meter body)
        </text>
        <text x={12} y={READOUT_TOP + 95} fill={STRETCH_COLOR} fontSize="12" fontWeight="bold">
          {formatG(stretch)}
          <tspan fontSize="10" fontWeight="normal">
            {'   '}(1 g = Earth's gravity at its surface)
          </tspan>
        </text>
      </g>

      {rows.map((row, i) => (
        <g key={row.key}>
          {row.draw}
          <text x={32} y={LEGEND_TOP + 12 + i * 16} fill={row.fill} fontSize="10">
            {row.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

// The gap above the horizon against time, on each clock. The gap is on a log scale, so that the traveler's curve can be
// seen plunging to the horizon (gap 0, off the bottom) while the far-away curve keeps heading toward it.
export function TimeGraph({ result, progress, guesses = null }: { result: FallingInResult; progress: number; guesses?: TimeGraphGuesses | null }) {
  const start = result.startInHorizonRadii
  const xMax = result.farAwayClockAtCutoff * 1.1
  const topLog = Math.log10(start - 1) + 0.15
  const xFor = (t: number) => TIME_PLOT_LEFT + (t / xMax) * (TIME_PLOT_RIGHT - TIME_PLOT_LEFT)
  const yFor = (gap: number) =>
    TIME_PLOT_TOP + ((topLog - Math.max(Math.log10(gap), LOWEST_GAP_LOG10)) / (topLog - LOWEST_GAP_LOG10)) * (TIME_PLOT_BOTTOM - TIME_PLOT_TOP)

  const fallen = result.points.filter((p) => p.r > 1)
  const travelerLine = fallen.map((p) => `${xFor(p.travelerClock)},${yFor(p.r - 1)}`).join(' ')
  const farLine = fallen.map((p) => `${xFor(p.farAwayClock as number)},${yFor(p.r - 1)}`).join(' ')
  const horizonTime = result.travelerClockAtHorizon

  const state = stateAt(result, progress * horizonTime)
  const nowGap = state.r - 1
  const tickLogs: number[] = []
  for (let k = Math.ceil(LOWEST_GAP_LOG10); k <= Math.floor(topLog); k++) tickLogs.push(k)
  const timeTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * xMax)

  return (
    <svg
      viewBox={`0 0 ${TIME_GRAPH_WIDTH} ${TIME_GRAPH_HEIGHT}`}
      width="100%"
      style={{
        marginTop: '1rem',
        display: 'block',
        maxWidth: `${TIME_GRAPH_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="time-plot">
          <rect x={TIME_PLOT_LEFT} y={TIME_PLOT_TOP} width={TIME_PLOT_RIGHT - TIME_PLOT_LEFT} height={TIME_PLOT_BOTTOM - TIME_PLOT_TOP + 1} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How near the horizon, on each clock
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: time, in horizon light-times. Vertical: how far the traveler still is above the horizon (log scale).
      </text>

      {tickLogs.map((k) => (
        <g key={k}>
          <line x1={TIME_PLOT_LEFT} y1={yFor(10 ** k)} x2={TIME_PLOT_RIGHT} y2={yFor(10 ** k)} stroke="#334155" />
          <text x={TIME_PLOT_LEFT - 8} y={yFor(10 ** k) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {formatNumber(10 ** k)}
          </text>
        </g>
      ))}
      <text x={14} y={(TIME_PLOT_TOP + TIME_PLOT_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(TIME_PLOT_TOP + TIME_PLOT_BOTTOM) / 2})`}>
        gap above the horizon (horizon radii)
      </text>
      {timeTicks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={TIME_PLOT_BOTTOM} x2={xFor(t)} y2={TIME_PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={TIME_PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {formatNumber(t)}
          </text>
        </g>
      ))}
      <text x={(TIME_PLOT_LEFT + TIME_PLOT_RIGHT) / 2} y={TIME_PLOT_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        time, in horizon light-times
      </text>

      {/* The horizon: a gap of zero, which a log scale cannot show, so it is the bottom edge */}
      <rect x={TIME_PLOT_LEFT} y={TIME_PLOT_BOTTOM - 3} width={TIME_PLOT_RIGHT - TIME_PLOT_LEFT} height={4} fill={HORIZON_COLOR} fillOpacity={0.6} />
      <text x={TIME_PLOT_LEFT + 6} y={TIME_PLOT_BOTTOM - 8} fill={HORIZON_COLOR} fontSize="10">
        horizon: a gap of zero, off the scale
      </text>

      <g clipPath="url(#time-plot)">
        <polyline points={farLine} fill="none" stroke={FAR_COLOR} strokeWidth={2.5} />
        <polyline points={travelerLine} fill="none" stroke={TRAVELER_COLOR} strokeWidth={2.5} />
        <line x1={xFor(horizonTime)} y1={yFor(result.points[result.points.length - 2].r - 1)} x2={xFor(horizonTime)} y2={TIME_PLOT_BOTTOM} stroke={TRAVELER_COLOR} strokeWidth={2.5} />
      </g>

      {/* Where each curve ends */}
      <circle cx={xFor(horizonTime)} cy={TIME_PLOT_BOTTOM} r={5} fill={TRAVELER_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <text
        x={xFor(horizonTime) + (xFor(horizonTime) - TIME_PLOT_LEFT < 230 ? 8 : -8)}
        y={TIME_PLOT_BOTTOM - 30}
        fill={TRAVELER_COLOR}
        fontSize="10"
        textAnchor={xFor(horizonTime) - TIME_PLOT_LEFT < 230 ? 'start' : 'end'}
      >
        traveler's clock: reaches the horizon here
      </text>
      <line x1={xFor(result.farAwayClockAtCutoff)} y1={yFor(0.0001)} x2={TIME_PLOT_RIGHT - 70} y2={TIME_PLOT_TOP + 78} stroke={FAR_COLOR} strokeOpacity={0.6} strokeWidth={0.75} />
      <text x={TIME_PLOT_RIGHT - 4} y={TIME_PLOT_TOP + 70} fill={FAR_COLOR} fontSize="10" textAnchor="end">
        far-away clock: keeps going,
      </text>
      <text x={TIME_PLOT_RIGHT - 4} y={TIME_PLOT_TOP + 83} fill={FAR_COLOR} fontSize="10" textAnchor="end">
        with no limit
      </text>

      {/* Where the traveler is now, on each clock */}
      {progress > 0 && (
        <>
          <circle cx={xFor(progress * horizonTime)} cy={yFor(nowGap)} r={5} fill={TRAVELER_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={xFor(state.far)} cy={yFor(nowGap)} r={5} fill={FAR_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        </>
      )}

      {/* The white marks: drawn only when the caller passes the guesses, which it does once the run has finished. Markers only. Both boxes sit
          under the plot, each joined by a line to its mark, so that they cover neither curve. */}
      {guesses?.end && (
        <g>
          {guesses.end === 'finite' && (
            <g>
              <line x1={xFor(horizonTime)} y1={TIME_PLOT_BOTTOM} x2={GUESS_BOX_ONE_X} y2={GUESS_BOX_Y} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(horizonTime)} cy={TIME_PLOT_BOTTOM} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            </g>
          )}
          {guesses.end === 'never' && (
            <g>
              <Arrow x1={TIME_PLOT_RIGHT - 120} y1={TIME_PLOT_BOTTOM - 22} x2={TIME_PLOT_RIGHT + 10} y2={TIME_PLOT_BOTTOM - 22} />
              <line x1={TIME_PLOT_RIGHT - 120} y1={TIME_PLOT_BOTTOM - 22} x2={GUESS_BOX_ONE_X} y2={GUESS_BOX_Y} stroke={GUESS_COLOR} strokeWidth={2} />
            </g>
          )}
          {guesses.end === 'depends' && (
            <g>
              <line x1={TIME_PLOT_LEFT + 150} y1={TIME_PLOT_BOTTOM} x2={GUESS_BOX_ONE_X} y2={GUESS_BOX_Y} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={TIME_PLOT_LEFT + 150} cy={TIME_PLOT_BOTTOM} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            </g>
          )}
          <GuessBox x={GUESS_BOX_ONE_X} y={GUESS_BOX_Y} width={190} line2={(END_CHOICES.find((c) => c.value === guesses.end) as { short: string }).short} />
        </g>
      )}
      {guesses?.far && (
        <g>
          {guesses.far === 'no-limit' ? (
            <g>
              <line x1={xFor(result.farAwayClockAtCutoff)} y1={yFor(0.0001)} x2={GUESS_BOX_TWO_X} y2={GUESS_BOX_Y} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(result.farAwayClockAtCutoff)} cy={yFor(0.0001)} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            </g>
          ) : (
            <g>
              <line
                x1={(xFor(result.travelerClockAtHorizon) + xFor(result.farAwayClockAtCutoff)) / 2}
                y1={yFor(0.01)}
                x2={GUESS_BOX_TWO_X}
                y2={GUESS_BOX_Y}
                stroke={GUESS_COLOR}
                strokeWidth={2}
              />
              <Arrow x1={xFor(result.travelerClockAtHorizon) + 6} y1={yFor(0.01)} x2={xFor(result.farAwayClockAtCutoff) - 6} y2={yFor(0.01)} />
            </g>
          )}
          <GuessBox x={GUESS_BOX_TWO_X} y={GUESS_BOX_Y} width={190} line2={(FAR_CLOCK_CHOICES.find((c) => c.value === guesses.far) as { short: string }).short} />
        </g>
      )}

      <line x1={96} y1={TIME_GRAPH_HEIGHT - 44} x2={126} y2={TIME_GRAPH_HEIGHT - 44} stroke={TRAVELER_COLOR} strokeWidth={3} />
      <text x={132} y={TIME_GRAPH_HEIGHT - 40} fill={TRAVELER_COLOR} fontSize="11">
        the traveler's own clock
      </text>
      <line x1={316} y1={TIME_GRAPH_HEIGHT - 44} x2={346} y2={TIME_GRAPH_HEIGHT - 44} stroke={FAR_COLOR} strokeWidth={3} />
      <text x={352} y={TIME_GRAPH_HEIGHT - 40} fill={FAR_COLOR} fontSize="11">
        the far-away clock
      </text>
      <circle cx={96} cy={TIME_GRAPH_HEIGHT - 20} r={5} fill="#e2e8f0" />
      <text x={108} y={TIME_GRAPH_HEIGHT - 16} fill="#e2e8f0" fontSize="11">
        dots: where the traveler is now, as each clock tells it
      </text>
    </svg>
  )
}

// The stretch against distance for all three black holes (log-log), with the chosen one marked.
export function StretchGraph({ presetId, currentR, guess = null }: { presetId: ObjectPreset['id']; currentR: number; guess?: StretchChoice | null }) {
  const curves = useMemo(() => BLACK_HOLE_PRESETS.map((p) => ({ preset: p, points: stretchCurve(p.id) })), [])
  const logSpan = Math.log10(MAX_START_IN_HORIZON_RADII)
  const xFor = (r: number) => STRETCH_PLOT_LEFT + (Math.log10(r) / logSpan) * (STRETCH_PLOT_RIGHT - STRETCH_PLOT_LEFT)
  const yFor = (g: number) =>
    STRETCH_PLOT_BOTTOM - ((Math.log10(g) - STRETCH_LOG10_MIN) / (STRETCH_LOG10_MAX - STRETCH_LOG10_MIN)) * (STRETCH_PLOT_BOTTOM - STRETCH_PLOT_TOP)
  const chosen = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)!
  const yTicks = [-15, -10, -5, 0, 5]

  return (
    <svg
      viewBox={`0 0 ${STRETCH_GRAPH_WIDTH} ${STRETCH_GRAPH_HEIGHT}`}
      width="100%"
      style={{
        marginTop: '1rem',
        display: 'block',
        maxWidth: `${STRETCH_GRAPH_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="stretch-plot">
          <rect x={STRETCH_PLOT_LEFT} y={STRETCH_PLOT_TOP} width={STRETCH_PLOT_RIGHT - STRETCH_PLOT_LEFT} height={STRETCH_PLOT_BOTTOM - STRETCH_PLOT_TOP} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The stretch against distance
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: distance from the center, in horizon radii. Vertical: stretch across {BODY_LENGTH_METERS} meters, in g. Both log scales.
      </text>

      {yTicks.map((k) => (
        <g key={k}>
          <line x1={STRETCH_PLOT_LEFT} y1={yFor(10 ** k)} x2={STRETCH_PLOT_RIGHT} y2={yFor(10 ** k)} stroke="#334155" />
          <text x={STRETCH_PLOT_LEFT - 8} y={yFor(10 ** k) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {k === 0 ? '1' : `10${String(k).split('').map((ch) => SUPERSCRIPT[ch]).join('')}`}
          </text>
        </g>
      ))}
      <text x={14} y={(STRETCH_PLOT_TOP + STRETCH_PLOT_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(STRETCH_PLOT_TOP + STRETCH_PLOT_BOTTOM) / 2})`}>
        stretch (g)
      </text>
      {[1, 2, 5, 10, 20, 50, 100].map((r) => (
        <g key={r}>
          <line x1={xFor(r)} y1={STRETCH_PLOT_BOTTOM} x2={xFor(r)} y2={STRETCH_PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(r)} y={STRETCH_PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {r}
          </text>
        </g>
      ))}
      <text x={(STRETCH_PLOT_LEFT + STRETCH_PLOT_RIGHT) / 2} y={STRETCH_PLOT_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        distance from the center, in horizon radii
      </text>

      {/* Earth's gravity, for comparison, and the horizon at the left edge */}
      <line x1={STRETCH_PLOT_LEFT} y1={yFor(1)} x2={STRETCH_PLOT_RIGHT} y2={yFor(1)} stroke={REFERENCE_COLOR} strokeDasharray="5 4" strokeOpacity={0.8} />
      <text x={STRETCH_PLOT_LEFT + 8} y={yFor(1) - 5} fill={REFERENCE_COLOR} fontSize="10">
        1 g: Earth's gravity at its surface
      </text>
      <line x1={STRETCH_PLOT_LEFT} y1={STRETCH_PLOT_TOP} x2={STRETCH_PLOT_LEFT} y2={STRETCH_PLOT_BOTTOM} stroke={HORIZON_COLOR} strokeWidth={3} />
      <text x={STRETCH_PLOT_LEFT + 6} y={STRETCH_PLOT_BOTTOM - 6} fill={HORIZON_COLOR} fontSize="10">
        horizon
      </text>

      <g clipPath="url(#stretch-plot)">
        {curves.map(({ preset, points }) => (
          <polyline
            key={preset.id}
            points={points.map((p) => `${xFor(p.r)},${yFor(p.stretchInG)}`).join(' ')}
            fill="none"
            stroke={HOLE_CURVE_COLORS[preset.id]}
            strokeWidth={preset.id === presetId ? 3.5 : 1.5}
            strokeOpacity={preset.id === presetId ? 1 : 0.7}
          />
        ))}
      </g>
      {curves.map(({ preset, points }) => {
        const labelPoint = points[Math.round(points.length * 0.8)]
        return (
          <text key={preset.id} x={xFor(labelPoint.r)} y={yFor(labelPoint.stretchInG) - 8} fill={HOLE_CURVE_COLORS[preset.id]} fontSize="10" textAnchor="middle">
            {preset.label.replace(/^A /, '')}
          </text>
        )
      })}

      {/* Where the traveler is now, on the chosen black hole's curve */}
      <circle cx={xFor(currentR)} cy={yFor(stretchInG(chosen.massSolarMasses, currentR))} r={6} fill={TRAVELER_COLOR} stroke="#0b1020" strokeWidth={2} />
      <text x={Math.min(xFor(currentR) + 10, STRETCH_PLOT_RIGHT - 80)} y={yFor(stretchInG(chosen.massSolarMasses, currentR)) + 16} fill={TRAVELER_COLOR} fontSize="10">
        the traveler, now
      </text>

      {/* The white mark: a pointer at the horizon edge, to the curve of the black hole guessed, or a bracket joining both. A marker only. The box sits
          under the plot, joined by a line, so that it covers no curve. */}
      {guess && (() => {
        const marker = stretchGuessMarker(guess)
        const choice = STRETCH_CHOICES.find((c) => c.value === guess)!
        const yStellar = yFor(stretchInG(BLACK_HOLE_PRESETS.find((p) => p.id === 'stellar-black-hole')!.massSolarMasses, 1))
        const ySgr = yFor(stretchInG(BLACK_HOLE_PRESETS.find((p) => p.id === 'sgr-a-star')!.massSolarMasses, 1))
        const x0 = STRETCH_PLOT_LEFT
        const boxX = 250
        const boxY = STRETCH_PLOT_BOTTOM + 52
        const yMark = marker.target === 'stellar' ? yStellar : marker.target === 'sgr' ? ySgr : (yStellar + ySgr) / 2
        return (
          <g>
            <polyline points={`${x0 + 12},${yMark} ${x0 + 24},${yMark} ${x0 + 24},${STRETCH_PLOT_BOTTOM + 12} ${boxX},${boxY}`} fill="none" stroke={GUESS_COLOR} strokeWidth={2} />
            {marker.target !== 'both' ? (
              <circle cx={x0} cy={yMark} r={10} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            ) : (
              <g>
                <circle cx={x0} cy={yStellar} r={10} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
                <circle cx={x0} cy={ySgr} r={10} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
                <line x1={x0 + 24} y1={yStellar} x2={x0 + 24} y2={ySgr} stroke={GUESS_COLOR} strokeWidth={4} />
                <text x={x0 + 34} y={(yStellar + ySgr) / 2 + 6} fill={GUESS_COLOR} fontSize="22" fontWeight="bold">
                  ≈
                </text>
              </g>
            )}
            <GuessBox x={boxX} y={boxY} width={190} line2={choice.short} />
          </g>
        )
      })()}

      <text x={96} y={STRETCH_GRAPH_HEIGHT - 20} fill="#cbd5e1" fontSize="11">
        Each curve is one black hole. The thick one is your choice; the cyan dot is the traveler.
      </text>
    </svg>
  )
}

// The zoom of the fall picture: from the center up to a little beyond the release point, with a scale bar.
export function fallScale(startInHorizonRadii: number) {
  const viewRadius = ZOOM_MARGIN * startInHorizonRadii
  const pixelsPerHorizonRadius = (CENTER_Y - AREA_TOP) / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n * pixelsPerHorizonRadius <= 120) ?? 1
  return { viewRadius, pixelsPerHorizonRadius, scaleBarHorizonRadii }
}

// ---------------------------------------------------------------------------------------------------------------
// The captions. Plain words, what is drawn, a worked moment with real numbers, and "what to look for" in three parts. An item appears only
// once its feature is drawn, and nothing says what the learner is asked to predict before they have seen it (CLAUDE.md §12, §14).
// ---------------------------------------------------------------------------------------------------------------
const para = { marginTop: 0, marginBottom: '0.5rem' } as const
const subHead = { marginTop: '0.75rem', marginBottom: '0.25rem' } as const
const bullets = { margin: '0 0 0.5rem', paddingLeft: '1.25rem' } as const
const li = { marginBottom: '0.3rem' } as const

function CaptionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
      <strong>{children}</strong>
    </p>
  )
}

const holeName = (r: FallingInResult) => r.preset.label.replace(/^A /, 'a ')

export function FallCaption({ complete, own = false, result }: { complete: boolean; own?: boolean; result: FallingInResult }) {
  const start = result.startInHorizonRadii
  const items = [
    {
      look: 'the two clock readouts under the picture, as the traveler nears the edge.',
      means: `the blue one is the traveler’s own watch; the orange one is the far-away clock. Both read 0 at the release.${complete ? ` At the edge the blue one reads ${formatFour(result.travelerClockAtHorizon)} light-times and the orange one reads more than ${formatFour(result.farAwayClockAtCutoff)}.` : ''}`,
      matters: 'it is the comparison that Experiment 2 left open: one fall, timed by two different clocks.',
    },
    {
      look: 'the stretch number under the clocks.',
      means: `it grows as the traveler falls: from ${formatG(result.stretchAtStartInG)} at the release to ${formatG(result.stretchAtHorizonInG)} at the edge.`,
      matters: 'it is what the traveler would feel, the difference in pull between head and feet.',
    },
  ]
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 4, the fall for your settings.' : 'How to read Picture 1, the fall.'}</CaptionTitle>
      <p style={para}>
        <strong>What you are looking at.</strong> A side view of the fall. The purple disc at the bottom is the black hole ({holeName(result)}), and the rose-colored ring around it is its <em>horizon</em>, the edge of the black hole. The blue dot is the traveler, falling
        straight down toward it. (The traveler is drawn as a dot, but in the experiment they are 2 meters long.)
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The short white bar</strong> near the top, labeled “released here (at rest)”, is where the traveler lets go. <strong>The dashed line</strong> under it is the path they will follow.
        </li>
        <li style={li}>
          <strong>The two clocks, under the picture.</strong> Both read zero at the moment of release. The <em>blue</em> one is the traveler’s own watch. The <em>orange</em> one is the far-away clock, sitting at rest far from the black hole. Each reading is in <em>light-times</em>
          , with the time in ordinary units in brackets. One light-time is how long light takes to cross one horizon radius (for this black hole, {formatSeconds(result.lightTimeSeconds)}).
        </li>
        <li style={li}>
          <strong>The stretch, under the clocks.</strong> Gravity pulls the traveler’s feet (the nearer end) a little harder than their head, and that difference stretches them. The number says how big the difference is, in <em>g</em>, where 1 g is the pull of Earth’s gravity on you as you stand on
          the ground. For example, “3 g” means the feet are pulled harder than the head by as much as three times Earth’s gravity.
        </li>
        <li style={li}>
          <strong>The scale bar</strong> shows how long some number of horizon radii is. Each run is zoomed so the whole fall fits, so the black hole looks bigger or smaller from one run to the next. To compare runs, use the scale bar and the distance number at the top of the picture, not the size of the drawing.
        </li>
      </ul>
      <p style={para}>
        <strong>A worked moment.</strong> The traveler is released from rest at {start} horizon radii ({formatDistance(start * result.horizonRadiusKm)} from the center). At the release both clocks read 0, and the stretch is {formatG(result.stretchAtStartInG)}. By the end the traveler’s own watch reads{' '}
        {formatFour(result.travelerClockAtHorizon)} horizon light-times, which is {formatSeconds(result.travelerSecondsAtHorizon)} ({formatFour(result.travelerClockAtHorizon)} × {formatSeconds(result.lightTimeSeconds)}), and the stretch is {formatG(result.stretchAtHorizonInG)}, {formatNumber(stretchGrowth(result))} times
        larger, because the distance is {start} times smaller and the stretch grows as the distance cubed.
      </p>
      <LookFor items={items} />
      <p style={{ margin: '0.5rem 0 0' }}>
        <strong>A limit.</strong> This follows one small traveler falling straight down. It is not what a camera would see, and it stops at the horizon: nothing inside is shown.
      </p>
    </CaptionBox>
  )
}

export function TimeCaption({ complete, own = false, result }: { complete: boolean; own?: boolean; result: FallingInResult }) {
  const readings = nearHorizonReadings(result.startInHorizonRadii)
  const [, mid, last] = readings
  const increase = farClockIncreasesPerTenfoldGap(result.startInHorizonRadii)
  const items = [
    {
      look: 'where the blue curve meets the rose strip at the bottom.',
      means: `the traveler’s own clock gets to the horizon at ${formatFour(result.travelerClockAtHorizon)} light-times.`,
      matters: 'it is the finish line of the traveler’s own trip.',
    },
    {
      look: 'the orange curve at the right-hand side.',
      means: `it is still moving toward the strip when the drawing stops, at ${formatFour(result.farAwayClockAtCutoff)} light-times and rising.`,
      matters: 'it is the far-away clock’s reading for the same fall.',
    },
    ...(complete && !own
      ? [
          {
            look: 'the white YOUR GUESS boxes and circles.',
            means: 'they are your guesses to questions 1 and 2, nothing more. Both are only markers: what happens to the trip, and what the far-away clock reads, have no size to draw. A circle on the strip or on the orange curve’s end shows where your guess is about, and an arrow past the right edge means “keeps going”.',
            matters: 'they let you compare your guesses with the real curves at a glance. The real curves never change with a guess; the tutor says how they compare.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 5, how near the horizon, on each clock, for your settings.' : 'How to read Picture 2, how near the horizon, on each clock.'}</CaptionTitle>
      <p style={para}>
        <strong>What you are looking at.</strong> The horizontal axis is time, in horizon light-times. The vertical axis is the <em>gap</em>: how far the traveler still is above the horizon, in horizon radii. It starts at the top (the release) and the traveler falls down the graph. The scale is a
        logarithmic one, so each step down divides the gap by ten.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The blue curve</strong> shows the gap against the traveler’s own clock. <strong>The orange curve</strong> shows the gap against the far-away clock, for the same fall. The two dots mark where the traveler is now, as each clock tells it.
        </li>
        <li style={li}>
          <strong>The rose strip at the bottom</strong> is the horizon: a gap of zero, which a logarithmic scale cannot show. A curve that reaches the strip has reached the horizon.
        </li>
        <li style={li}>
          <strong>The end of the orange curve.</strong> The orange curve is followed down to a gap of 0.0001 horizon radii and then the drawing stops, but that is only where the drawing ends.
        </li>
      </ul>
      <p style={para}>
        <strong>A worked moment.</strong> When the traveler is 0.001 horizon radii above the horizon, the traveler’s own clock reads {formatFour(mid.travelerClock)} and the far-away clock reads {formatFour(mid.farAwayClock)}. At 0.0001, the traveler’s clock reads {formatFour(last.travelerClock)} and the
        far-away clock {formatFour(last.farAwayClock)}: {formatFour(increase[increase.length - 1])} more for a gap ten times smaller.
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}

export function StretchCaption({ complete, own = false, result }: { complete: boolean; own?: boolean; result: FallingInResult }) {
  const holes = BLACK_HOLE_PRESETS.map((p) => ({ preset: p, atHorizon: stretchInG(p.massSolarMasses, 1) }))
  const stellar = BLACK_HOLE_PRESETS.find((p) => p.id === 'stellar-black-hole')!
  const oneG = runFallingInExperiment('stellar-black-hole', result.startInHorizonRadii).stretchOneGRadiusInHorizonRadii
  const items = [
    {
      look: 'the three curves at the left edge, the horizon.',
      means: `the stretch at the horizon is ${holes.map((h) => `${formatG(h.atHorizon)} for ${h.preset.label.replace(/^A /, 'a ')}`).join(', ')}.`,
      matters: 'the same fall, in horizon radii, gives very different numbers for different black holes.',
    },
    {
      look: 'where each curve crosses the dashed 1 g line.',
      means: `the 10-Sun curve crosses it far to the right of the horizon, at about ${formatNumber(oneG as number)} horizon radii; the other two cross it only inside the horizon, which this experiment does not model.`,
      matters: 'it says where, for each black hole, a 2-meter body would be stretched by as much as Earth’s gravity.',
    },
    ...(complete && !own
      ? [
          {
            look: 'the white YOUR GUESS box, with its circle or bracket at the horizon edge.',
            means: 'it is your guess to question 3, a marker only: a circle on the curve of the black hole you chose, or a bracket joining both curves for “about the same”.',
            matters: 'the real curves do not change with a guess, so you can compare at a glance. The tutor says how your guess compares.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 6, the stretch against distance, for your settings.' : 'How to read Picture 3, the stretch against distance.'}</CaptionTitle>
      <p style={para}>
        <strong>What you are looking at.</strong> For each black hole, how much the traveler is stretched at every distance from the center, from the horizon (the rose line at the left) out to 100 horizon radii. Both scales are logarithmic, so each step along an axis multiplies the number by ten.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The three curves,</strong> one for each black hole, drawn together so they can be compared at the same distances. The thick one is the black hole {own ? 'you chose' : 'of this run'}, and the cyan dot is where the traveler is now, so it moves along that curve during the fall.
        </li>
        <li style={li}>
          <strong>The dashed line</strong> is 1 g, the pull of Earth’s gravity at its surface, for comparison.
        </li>
      </ul>
      <p style={para}>
        <strong>A worked moment.</strong> At {result.startInHorizonRadii} horizon radii, the 10-Sun curve reads {formatG(stretchInG(stellar.massSolarMasses, result.startInHorizonRadii))}. At the horizon it reads {formatG(stretchInG(stellar.massSolarMasses, 1))}: {formatNumber(stretchGrowth({ ...result, stretchAtStartInG: stretchInG(stellar.massSolarMasses, result.startInHorizonRadii), stretchAtHorizonInG: stretchInG(stellar.massSolarMasses, 1) }))} times as much, because the distance is {result.startInHorizonRadii} times smaller and {result.startInHorizonRadii} cubed is {formatNumber(result.startInHorizonRadii ** 3)}.
      </p>
      <LookFor items={items} />
      <p style={{ margin: '0.5rem 0 0' }}>
        <strong>A limit.</strong> The stretch is for a 2-meter body falling straight in, and it is drawn only outside the horizon.
      </p>
    </CaptionBox>
  )
}

