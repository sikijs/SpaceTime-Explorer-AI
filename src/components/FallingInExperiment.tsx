import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  BODY_LENGTH_METERS,
  MAX_START_IN_HORIZON_RADII,
  runFallingInExperiment,
  stretchCurve,
  stretchInG,
} from '../physics/fallingInExperiment'
import type { FallingInResult } from '../physics/fallingInExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface FallingInExperimentProps {
  onComplete?: () => void
}

// The picture of the fall: a title strip, a side view of the drop, the three live readouts, and a legend strip.
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 576
const CENTER_X = 200
const CENTER_Y = 340 // the center of the black hole
const AREA_TOP = 66
const AREA_BOTTOM = 360
const ZOOM_MARGIN = 1.08
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20, 50, 100]
const SCALE_BAR_Y = 374
const READOUT_TOP = 392
const LEGEND_TOP = 496

// Fixed real-world playback duration for the whole fall, independent of the physics result (CLAUDE.md §11). The
// playback runs steadily in the traveler's own time.
const ANIMATION_DURATION_MS = 8000

const KM_PER_AU = 149_597_870.7

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

const START_PRESETS = [100, 20, 10, 5, 2]

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not scored
// here; they are compared with the model's results later. The question wording is a draft for the owner's review.
type EndChoice = 'finite' | 'never' | 'depends'
const endChoices: Array<{ value: EndChoice; label: string }> = [
  { value: 'finite', label: 'Yes: it takes a finite time, and they get there' },
  { value: 'never', label: 'No: it never finishes, and they never get there' },
  { value: 'depends', label: 'It ends for some black holes and not for others' },
]

type FarClockChoice = 'same' | 'settles' | 'no-limit'
const farClockChoices: Array<{ value: FarClockChoice; label: string }> = [
  { value: 'same', label: 'About the same as the traveler\'s watch' },
  { value: 'settles', label: 'Somewhat more, and then it settles' },
  { value: 'no-limit', label: 'Later and later, without limit, as the traveler nears the horizon' },
]

type StretchChoice = 'small' | 'same' | 'giant'
const stretchChoices: Array<{ value: StretchChoice; label: string }> = [
  { value: 'small', label: 'Much stronger at the small black hole' },
  { value: 'same', label: 'About the same' },
  { value: 'giant', label: 'Much stronger at the giant black hole' },
]

// The graph of the gap above the horizon against time (the second picture).
const TIME_GRAPH_WIDTH = 640
const TIME_GRAPH_HEIGHT = 420
const TIME_PLOT_LEFT = 80
const TIME_PLOT_RIGHT = 610
const TIME_PLOT_TOP = 66
const TIME_PLOT_BOTTOM = 300
const LOWEST_GAP_LOG10 = -4.4 // the log of the gap at the bottom of the graph; the horizon itself is off the scale

// The graph of the stretch against distance (the third picture).
const STRETCH_GRAPH_WIDTH = 640
const STRETCH_GRAPH_HEIGHT = 420
const STRETCH_PLOT_LEFT = 80
const STRETCH_PLOT_RIGHT = 610
const STRETCH_PLOT_TOP = 66
const STRETCH_PLOT_BOTTOM = 290
const STRETCH_LOG10_MIN = -17.5
const STRETCH_LOG10_MAX = 8.5

// Caption blocks under each picture (small, muted text, like the other captions in this project).
const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in plain units, from meters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// A time in the unit that fits it, from thousandths of a second to years.
function formatSeconds(seconds: number): string {
  if (seconds < 0.001) return `${formatNumber(seconds * 1e6)} millionths of a second`
  if (seconds < 0.1) return `${formatNumber(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${formatNumber(seconds)} seconds`
  if (seconds < 7200) return `${formatNumber(seconds / 60)} minutes`
  if (seconds < 172_800) return `${formatNumber(seconds / 3600)} hours`
  if (seconds < 3.156e7) return `${formatNumber(seconds / 86_400)} days`
  return `${formatNumber(seconds / 3.156e7)} years`
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A stretch in g: plain for moderate values, a power of ten for very large or very small ones.
function formatG(g: number): string {
  if (g === 0) return '0 g'
  if (g >= 0.01 && g < 1000) return `${formatNumber(g)} g`
  const exponent = Math.floor(Math.log10(g))
  const mantissa = Number((g / 10 ** exponent).toPrecision(2))
  const power = String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')
  return `${mantissa} × 10${power} g`
}

// Where the fall has got to when the traveler's own clock reads the given time, from the points the physics module gave.
function stateAt(result: FallingInResult, travelerTime: number) {
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

function FallPanel({
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
      : `${formatNumber(horizonLightTimes)} light-times (${formatSeconds(horizonLightTimes * result.lightTimeSeconds)})`

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
        <text x={12} y={READOUT_TOP + 20} fill={TRAVELER_COLOR} fontSize="13" fontWeight="bold">
          {clockText(travelerTime)}
        </text>
        <text x={12} y={READOUT_TOP + 38} fill={FAR_COLOR} fontSize="10">
          the far-away clock (at rest, far from the black hole)
        </text>
        <text x={12} y={READOUT_TOP + 54} fill={FAR_COLOR} fontSize="13" fontWeight="bold">
          {finished ? 'more than ' : ''}
          {clockText(state.far)}
        </text>
        {finished && (
          <text x={12} y={READOUT_TOP + 66} fill={FAR_COLOR} fontSize="10">
            and still rising: it has no limit as the traveler nears the horizon
          </text>
        )}
        <text x={12} y={READOUT_TOP + 80} fill={STRETCH_COLOR} fontSize="10">
          stretch across a {BODY_LENGTH_METERS}-meter body (Earth's surface gravity is 1 g)
        </text>
        <text x={12} y={READOUT_TOP + 94} fill={STRETCH_COLOR} fontSize="12" fontWeight="bold">
          {formatG(stretch)}
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
function TimeGraph({ result, progress }: { result: FallingInResult; progress: number }) {
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
function StretchGraph({ presetId, currentR }: { presetId: ObjectPreset['id']; currentR: number }) {
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
      <circle cx={xFor(currentR)} cy={yFor(stretchInG(chosen.massSolarMasses, currentR))} r={6} fill="#ffffff" stroke={HOLE_CURVE_COLORS[presetId]} strokeWidth={2.5} />
      <text x={Math.min(xFor(currentR) + 10, STRETCH_PLOT_RIGHT - 80)} y={yFor(stretchInG(chosen.massSolarMasses, currentR)) + 16} fill="#ffffff" fontSize="10">
        the traveler, now
      </text>

      <text x={96} y={STRETCH_GRAPH_HEIGHT - 20} fill="#cbd5e1" fontSize="11">
        Each curve is one black hole. The thick one is your choice; the white dot is the traveler.
      </text>
    </svg>
  )
}

export function FallingInExperiment({ onComplete }: FallingInExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [start, setStart] = useState(10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const [endPrediction, setEndPrediction] = useState<EndChoice | null>(null)
  const [farClockPrediction, setFarClockPrediction] = useState<FarClockChoice | null>(null)
  const [stretchPrediction, setStretchPrediction] = useState<StretchChoice | null>(null)
  const [submittedEnd, setSubmittedEnd] = useState<EndChoice | null>(null)
  const [submittedFarClock, setSubmittedFarClock] = useState<FarClockChoice | null>(null)
  const [submittedStretch, setSubmittedStretch] = useState<StretchChoice | null>(null)

  const hasPrediction = endPrediction !== null && farClockPrediction !== null && stretchPrediction !== null
  const hasSubmittedPrediction = submittedEnd !== null && submittedFarClock !== null && submittedStretch !== null

  const result = useMemo(() => runFallingInExperiment(presetId, start), [presetId, start])

  // The zoom of the fall picture: from the center up to a little beyond the release point.
  const viewRadius = ZOOM_MARGIN * start
  const pixelsPerHorizonRadius = (CENTER_Y - AREA_TOP) / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n * pixelsPerHorizonRadius <= 120) ?? 1

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleStartChange = (value: number) => {
    setStart(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedEnd(endPrediction)
      setSubmittedFarClock(farClockPrediction)
      setSubmittedStretch(stretchPrediction)
    }
    setStatus('running')
    setProgress(0)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the
  // chosen black hole or release distance.
  const handleChangePrediction = () => {
    setSubmittedEnd(null)
    setSubmittedFarClock(null)
    setSubmittedStretch(null)
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

  const state = stateAt(result, progress * result.travelerClockAtHorizon)
  const outcomeSoFar = status === 'idle' ? '—' : progress < 1 ? 'falling' : 'at the horizon'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Falling In: What Does the Traveler Experience?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A traveler is dropped from rest near a black hole and falls straight toward it. On the traveler's own watch,
            does the trip to the horizon come to an end?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {endChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setEndPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${endPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A clock sits at rest far away and keeps time for the whole fall. As the traveler nears the horizon, what
            does that far-away clock read?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {farClockChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setFarClockPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${farClockPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            At the moment a traveler reaches the horizon, how does the stretching (the difference in pull between their
            head and their feet) compare between a small black hole (10 Suns) and a giant one (Sagittarius A*)?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {stretchChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setStretchPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${stretchPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${endChoices.find((c) => c.value === (endPrediction ?? submittedEnd))!.label}; ${
                  farClockChoices.find((c) => c.value === (farClockPrediction ?? submittedFarClock))!.label
                }; ${stretchChoices.find((c) => c.value === (stretchPrediction ?? submittedStretch))!.label}`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes and release distances as you
              like below. Or, change your predictions and start over:
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Release the traveler from rest at this distance from the black hole's center, in horizon radii:
          </p>
          {START_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleStartChange(d)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${start === d ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {d}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            That is {formatDistance(result.startInHorizonRadii * result.horizonRadiusKm)} from the center. A horizon radius is
            the size of the black hole's edge.
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
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {/* Shown only once the current settings have been run: changing the black hole or the release distance returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {result.preset.label}: {formatMass(result.preset.massSolarMasses)}; horizon radius{' '}
              {formatDistance(result.horizonRadiusKm)}; one horizon light-time is {formatSeconds(result.lightTimeSeconds)}
              <br />
              Released from rest at {result.startInHorizonRadii} horizon radii (
              {formatDistance(result.startInHorizonRadii * result.horizonRadiusKm)}). Now: {state.r.toFixed(state.r < 1.1 ? 4 : 2)}{' '}
              horizon radii from the center
              <br />
              The traveler: {outcomeSoFar}
            </p>

            <div style={{ marginTop: '1rem', maxWidth: `${PANEL_WIDTH}px` }}>
              <FallPanel
                result={result}
                progress={progress}
                pixelsPerHorizonRadius={pixelsPerHorizonRadius}
                scaleBarHorizonRadii={scaleBarHorizonRadii}
              />
              {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
              <div style={CAPTION_STYLE}>
                <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                  <strong>How to read this picture: the fall.</strong>
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>What you are looking at.</strong> A side view of a small traveler, 2 meters long, falling
                  straight toward a black hole. The black hole is the dark disc at the bottom, and the rose-colored ring
                  around it is the <em>horizon</em>. The short white bar at the top is where the traveler was released,
                  from rest, and the dashed line is the path of the fall.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The two clocks.</strong> The blue one is the traveler's own watch, which goes with them. The
                  orange one sits at rest far from the black hole and was started at the moment of release. Both are
                  counted in <em>horizon light-times</em>: one horizon light-time is the time light takes to travel
                  across one horizon radius. The time in ordinary units is shown beside each reading.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The stretch.</strong> Gravity pulls the traveler's feet (nearer the black hole) slightly harder
                  than their head, so the traveler is stretched. The readout is the difference in pull across their
                  whole 2 meters, in <em>g</em>, where 1 g is the pull of Earth's gravity at its surface.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>Scale.</strong> The scale bar shows how long some number of horizon radii is. It changes from
                  one run to the next, because each run is zoomed to fit its release distance.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>A limit.</strong> This follows one small traveler straight down. It is not what a camera would
                  see, and it stops at the horizon: nothing inside is shown.
                </p>
              </div>
            </div>

            <TimeGraph result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${TIME_GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: how near the horizon, on each clock.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> The horizontal axis is time, in horizon light-times. The
                vertical axis is the <em>gap</em>: how far the traveler still is above the horizon, in horizon radii. It
                starts at the top (the release) and the traveler falls down the graph. The scale is a logarithmic one,
                so each step down divides the gap by ten.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The two curves.</strong> The blue curve shows the gap against the traveler's own clock. The
                orange curve shows the gap against the far-away clock, for the same fall. The two dots mark where the
                traveler is now, as each clock tells it.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The bottom edge.</strong> A gap of zero is the horizon itself, and a logarithmic scale cannot
                show zero, so the rose strip at the bottom stands for it. A curve that reaches the strip has reached the
                horizon.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The orange curve is followed down to a gap of 0.0001 horizon radii and then
                stops, but that is only where the drawing ends.
              </p>
            </div>

            <StretchGraph presetId={presetId} currentR={state.r} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${STRETCH_GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: the stretch against distance.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> For each black hole, how much the traveler is stretched at every
                distance from the center, from the horizon (the rose line at the left) out to 100 horizon radii. Both
                scales are logarithmic, so each step along an axis multiplies the number by ten.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The three curves.</strong> One for each black hole, drawn together so they can be compared at the
                same distances. The thick one is the black hole you chose, and the white dot is where the traveler is
                now, so it moves along that curve during the fall. The dashed line is 1 g, the pull of Earth's gravity at
                its surface, for comparison.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The stretch is for a 2-meter body falling straight in, and it is drawn only
                outside the horizon.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
