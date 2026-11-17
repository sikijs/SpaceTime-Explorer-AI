import type { ReactNode } from 'react'
import {
  COMPARISON_DISTANCE_IN_HORIZON_RADII,
  FAR_CLOCK_RUN_SECONDS,
  MAX_DISTANCE_IN_HORIZON_RADII,
  PART_ONE_DISTANCE_IN_HORIZON_RADII,
  exactSlowingFactor,
  firstOrderSlowingFactor,
  guessHeightForJustOutside,
  percentTooHigh,
  timesAsMuch,
} from '../physics/timeNearBlackHoleExperiment'
import type {
  ApproximationGuess,
  JustOutsideGuess,
  MassGuess,
  TimeNearBlackHoleResult,
} from '../physics/timeNearBlackHoleExperiment'
import { GUESS_COLOR } from './BlackHoleSizePictures'
import { CaptionBox } from './TidalEffectExperiment'

// Black Holes, Experiment 2 (audit update): the pictures. Picture 1 (the two clocks), Picture 2 (the rate against distance), Picture 2b (the
// same distance around two black holes) and Picture 3 (the readings) are the real pictures of Part 1 and carry the white guess marks in
// Picture 2 and Picture 2b. Pictures 4 to 6 follow the controls in Part 2 and carry no guess mark (CLAUDE.md §14, "Predictions and the Real
// Results"). Every number is passed in from the physics module.

const VIEW_WIDTH = 640
const VIEW_HEIGHT = 360
const AXIS_LEFT = 90
const AXIS_RIGHT = 600
const AXIS_Y = 270

// The graphs below the clocks.
const GRAPH_HEIGHT = 326
const READINGS_HEIGHT = 290
const PLOT_LEFT = 70
const PLOT_RIGHT = 600
const PLOT_TOP = 62
const PLOT_BOTTOM = 232
export const FIRST_ORDER_COLOR = '#fb923c'

const CLOCK_RADIUS = 52
const CLOCK_Y = 112
const HOVERING_CLOCK_X = 170
const FAR_CLOCK_X = 470
// One turn of a clock's hand is this many seconds of that clock's own time.
const SECONDS_PER_TURN = 10

// How long a run takes to watch, in real seconds. Presentation only: it does not change any reading (CLAUDE.md §11).
export const RUN_PLAYBACK_SECONDS = 10

export const KM_PER_AU = 149_597_870.7

export const FAR_COLOR = '#facc15'
export const HOVERING_COLOR = '#22d3ee'
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'

const AXIS_TICKS = [100, 10, 3, 1.5]

const svgBox = {
  marginTop: '1rem',
  display: 'block',
  maxWidth: `${VIEW_WIDTH}px`,
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

// ---- the guesses: each button's long label (for the buttons and the results) and a short one (for the white box) ----
export const JUST_OUTSIDE_CHOICES: Array<{ value: JustOutsideGuess; label: string; short: string }> = [
  { value: 'same', label: 'About the same rate', short: 'ticks at the same rate (1)' },
  { value: 'half', label: 'About half as fast', short: 'ticks at half the rate (0.5)' },
  { value: 'tenth', label: 'About one tenth as fast', short: 'ticks at one tenth the rate (0.1)' },
  { value: 'stopped', label: 'It has stopped', short: 'has stopped (0)' },
]

export const MASS_CHOICES: Array<{ value: MassGuess; label: string; short: string }> = [
  { value: 'small', label: 'The one near the small black hole', short: 'the small one ticks slower' },
  { value: 'giant', label: 'The one near the giant black hole', short: 'the giant one ticks slower' },
  { value: 'same', label: 'They tick at the same relative rate', short: 'they tick at the same rate' },
]

export const APPROXIMATION_CHOICES: Array<{ value: ApproximationGuess; label: string; short: string }> = [
  { value: 'still-accurate', label: 'Yes, it will still be about as accurate', short: 'still about as accurate' },
  {
    value: 'worse-closer',
    label: 'It will be accurate far from the horizon, but get worse the closer you get',
    short: 'accurate far away, worse closer in',
  },
  {
    value: 'never-accurate',
    label: 'No, it will be wrong everywhere near a black hole, even far from the horizon',
    short: 'wrong everywhere near a black hole',
  },
]

export const justOutsideLabel = (v: JustOutsideGuess) => JUST_OUTSIDE_CHOICES.find((c) => c.value === v)!.label
export const massLabel = (v: MassGuess) => MASS_CHOICES.find((c) => c.value === v)!.label
export const approximationLabel = (v: ApproximationGuess) => APPROXIMATION_CHOICES.find((c) => c.value === v)!.label

// ---- formatting ----
// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in horizon radii. Near the horizon the extra digits matter (1.001 is not 1).
export function formatRadii(value: number): string {
  return value < 10 ? String(Number(value.toPrecision(4))) : formatNumber(value)
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

// Up to four significant figures, with no trailing zeros ("0.5", "0.000999").
export function formatSmall(value: number): string {
  return String(Number(value.toPrecision(4)))
}

export function formatPercent(percent: number): string {
  return percent < 0.01 ? 'less than 0.01%' : `${Number(percent.toPrecision(2))}%`
}

// How much slower a clock at a real surface runs, in plain units.
export function formatSlowing(fraction: number): string {
  if (fraction >= 0.01) return `about ${Math.round(fraction * 100)}% slower`
  const perSecond =
    fraction < 1e-6
      ? `${Number((fraction * 1e9).toPrecision(2))} billionths of a second`
      : `${Number((fraction * 1e6).toPrecision(2))} millionths of a second`
  const perDaySeconds = fraction * 86400
  const perDay =
    perDaySeconds < 1e-3
      ? `${Number((perDaySeconds * 1e6).toPrecision(2))} millionths of a second`
      : `${Number(perDaySeconds.toPrecision(2))} seconds`
  return `loses about ${perSecond} every second, about ${perDay} per day`
}

// A length of time in plain units, from milliseconds to days.
export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Number((seconds * 1000).toPrecision(2))} milliseconds`
  if (seconds < 120) return `${Number(seconds.toPrecision(2))} seconds`
  if (seconds < 86400 * 2) return `${Number((seconds / 3600).toPrecision(2))} hours`
  return `${Math.round(seconds / 86400)} days`
}

export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// The white YOUR GUESS box. Drawn in the picture's own coordinates.
function GuessBox({ x, y, width, line2 }: { x: number; y: number; width: number; line2: string }) {
  return (
    <g>
      <rect x={x - width / 2} y={y} width={width} height={44} rx={6} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} />
      <text x={x} y={y + 19} fill={GUESS_COLOR} fontSize="14" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x} y={y + 36} fill={GUESS_COLOR} fontSize="11" textAnchor="middle">
        {line2}
      </text>
    </g>
  )
}

function ClockFace({
  cx,
  cy,
  color,
  title,
  readingSeconds,
}: {
  cx: number
  cy: number
  color: string
  title: string
  readingSeconds: number
}) {
  const angle = ((readingSeconds % SECONDS_PER_TURN) / SECONDS_PER_TURN) * 2 * Math.PI
  const handLength = CLOCK_RADIUS - 8
  return (
    <g>
      <text x={cx} y={cy - CLOCK_RADIUS - 12} fill={color} fontSize="13" fontWeight="bold" textAnchor="middle">
        {title}
      </text>
      <circle cx={cx} cy={cy} r={CLOCK_RADIUS} fill="#0f172a" stroke={color} strokeWidth={3} />
      {Array.from({ length: SECONDS_PER_TURN }, (_, i) => {
        const a = (i / SECONDS_PER_TURN) * 2 * Math.PI
        return (
          <line
            key={i}
            x1={cx + (CLOCK_RADIUS - 8) * Math.sin(a)}
            y1={cy - (CLOCK_RADIUS - 8) * Math.cos(a)}
            x2={cx + (CLOCK_RADIUS - 2) * Math.sin(a)}
            y2={cy - (CLOCK_RADIUS - 2) * Math.cos(a)}
            stroke={color}
            strokeOpacity={0.7}
          />
        )
      })}
      <line
        x1={cx}
        y1={cy}
        x2={cx + handLength * Math.sin(angle)}
        y2={cy - handLength * Math.cos(angle)}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <text x={cx} y={cy + CLOCK_RADIUS + 20} fill={color} fontSize="14" fontWeight="bold" textAnchor="middle">
        Reads {readingSeconds.toFixed(2)} s
      </text>
      <text x={cx} y={cy + CLOCK_RADIUS + 36} fill="#94a3b8" fontSize="10" textAnchor="middle">
        one turn of the hand = {SECONDS_PER_TURN} s on this clock
      </text>
    </g>
  )
}

const logMax = Math.log10(MAX_DISTANCE_IN_HORIZON_RADII)

// ---------------------------------------------------------------------------------------------------------------
// Picture 1 (and Picture 4): the two clocks
// ---------------------------------------------------------------------------------------------------------------
export function ClocksPicture({
  title,
  result,
  readings,
}: {
  title: string
  result: TimeNearBlackHoleResult
  readings: { far: number; hovering: number }
}) {
  const distance = result.distanceInHorizonRadii
  // A logarithmic ruler of distance in horizon radii: the horizon (1) on the left, next to the black hole, and far away (100) on the right.
  const xFor = (d: number) => AXIS_LEFT + (Math.log10(d) / logMax) * (AXIS_RIGHT - AXIS_LEFT)
  const hoveringX = xFor(distance)
  const horizonX = xFor(1)
  // The kilometer label is kept clear of the black hole's box on the left and of the picture's right edge (the width is estimated
  // from the text length, since SVG text is not measured here).
  const distanceLabel = `= ${formatDistance(result.distanceKm)} from the center`
  const distanceLabelWidth = distanceLabel.length * 5.8
  const distanceLabelX = Math.min(Math.max(hoveringX - distanceLabelWidth / 2, horizonX + 10), VIEW_WIDTH - 8 - distanceLabelWidth)
  const hoveringLabelX = Math.min(Math.max(hoveringX, AXIS_LEFT + 120), AXIS_RIGHT - 100)

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      width="100%"
      style={svgBox}
      role="img"
      aria-label={`${title}. A far-away clock reads ${readings.far.toFixed(2)} seconds and a hovering clock at ${formatRadii(distance)} horizon radii reads ${readings.hovering.toFixed(2)} seconds.`}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        {title}: two identical clocks, one far away and one hovering near a black hole
      </text>

      <ClockFace cx={FAR_CLOCK_X} cy={CLOCK_Y} color={FAR_COLOR} title="Far-away clock" readingSeconds={readings.far} />
      <ClockFace cx={HOVERING_CLOCK_X} cy={CLOCK_Y} color={HOVERING_COLOR} title="Hovering clock" readingSeconds={readings.hovering} />

      {/* Inside the horizon: a distinct shaded region to the left of the horizon line */}
      <rect x={8} y={AXIS_Y - 54} width={horizonX - 8} height={86} fill="rgba(232, 121, 249, 0.18)" stroke={BLACK_HOLE_COLOR} strokeOpacity={0.6} />
      <text x={(8 + horizonX) / 2} y={AXIS_Y - 24} fill={BLACK_HOLE_COLOR} fontSize="11" textAnchor="middle">
        black
      </text>
      <text x={(8 + horizonX) / 2} y={AXIS_Y - 10} fill={BLACK_HOLE_COLOR} fontSize="11" textAnchor="middle">
        hole
      </text>

      {/* The axis and its ticks */}
      <line x1={horizonX} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={2} />
      {AXIS_TICKS.map((d) => (
        <g key={d}>
          <line x1={xFor(d)} y1={AXIS_Y - 5} x2={xFor(d)} y2={AXIS_Y + 5} stroke="#94a3b8" />
          <text x={xFor(d)} y={AXIS_Y + 20} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {d}
          </text>
        </g>
      ))}

      {/* The horizon line */}
      <line x1={horizonX} y1={AXIS_Y - 54} x2={horizonX} y2={AXIS_Y + 32} stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={horizonX} y={AXIS_Y + 20} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
        1
      </text>
      <text x={horizonX + 6} y={AXIS_Y + 48} fill={HORIZON_COLOR} fontSize="11" textAnchor="start">
        horizon (edge of the black hole): {formatDistance(result.horizonRadiusKm)} from the center
      </text>

      <text x={(horizonX + AXIS_RIGHT) / 2} y={AXIS_Y + 66} fill="#94a3b8" fontSize="11" textAnchor="middle">
        distance from the black hole's center, in horizon radii (logarithmic)
      </text>

      {/* Where the hovering clock is held */}
      <line
        x1={HOVERING_CLOCK_X}
        y1={CLOCK_Y + CLOCK_RADIUS + 42}
        x2={hoveringX}
        y2={AXIS_Y - 38}
        stroke={HOVERING_COLOR}
        strokeDasharray="3 4"
        strokeOpacity={0.6}
      />
      <line x1={hoveringX} y1={AXIS_Y} x2={hoveringX} y2={AXIS_Y - 16} stroke={HOVERING_COLOR} />
      <circle cx={hoveringX} cy={AXIS_Y} r={7} fill={HOVERING_COLOR} />
      <text x={hoveringLabelX} y={AXIS_Y - 20} fill={HOVERING_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        hovering clock: {formatRadii(distance)} horizon radii
      </text>
      <text x={distanceLabelX} y={AXIS_Y + 34} fill={HOVERING_COLOR} fontSize="11" textAnchor="start">
        {distanceLabel}
      </text>

      {/* The far-away clock is much farther out than the ruler reaches */}
      <text x={VIEW_WIDTH - 12} y={AXIS_Y + 86} fill={FAR_COLOR} fontSize="11" textAnchor="end">
        the far-away clock is much farther out than this ruler reaches →
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Picture 2 (and Picture 5): the exact slowing factor against the simple formula, with the white marks for guesses 1 and 3 in Part 1
// ---------------------------------------------------------------------------------------------------------------
export interface FactorGuesses {
  justOutside: JustOutsideGuess
  approximation: ApproximationGuess
}

export function FactorPicture({
  title,
  result,
  guesses,
}: {
  title: string
  result: TimeNearBlackHoleResult
  guesses: FactorGuesses | null
}) {
  const distance = result.distanceInHorizonRadii
  // The curve starts at 1.001, so the horizon's own values (exact 0, first order 0.5) are added as the first point.
  const graphXFor = (d: number) => PLOT_LEFT + (Math.log10(d) / logMax) * (PLOT_RIGHT - PLOT_LEFT)
  const graphYFor = (factor: number) => PLOT_BOTTOM - factor * (PLOT_BOTTOM - PLOT_TOP)
  const factorPath = (pick: (point: (typeof result.curve)[number]) => number, atHorizon: number) =>
    [`M ${graphXFor(1)} ${graphYFor(atHorizon)}`]
      .concat(result.curve.map((pt) => `L ${graphXFor(pt.distanceInHorizonRadii)} ${graphYFor(pick(pt))}`))
      .join(' ')
  const exactPath = factorPath((pt) => pt.exact, exactSlowingFactor(1))
  const firstOrderPath = factorPath((pt) => pt.firstOrder, firstOrderSlowingFactor(1))

  // The white marks. Guess 1 is a height above the distance 1.01. Guess 3 has no size of its own, so it is a bracket between the two
  // lines at 1.1 radii: a marker only.
  const markX = graphXFor(PART_ONE_DISTANCE_IN_HORIZON_RADII)
  const markY = guesses ? graphYFor(guessHeightForJustOutside(guesses.justOutside)) : 0
  const bracketX = graphXFor(1.1)
  const bracketTop = graphYFor(firstOrderSlowingFactor(1.1))
  const bracketBottom = graphYFor(exactSlowingFactor(1.1))
  const justOutsideShort = JUST_OUTSIDE_CHOICES.find((c) => c.value === guesses?.justOutside)?.short ?? ''
  const approximationShort = APPROXIMATION_CHOICES.find((c) => c.value === guesses?.approximation)?.short ?? ''

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${GRAPH_HEIGHT}`}
      width="100%"
      style={svgBox}
      role="img"
      aria-label={`${title}. The exact rate is ${result.exactFactor.toFixed(4)} and the simple formula gives ${result.firstOrderFactor.toFixed(4)} at ${formatRadii(distance)} horizon radii.`}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        {title}: how fast the hovering clock ticks, against its distance
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Vertical: the hovering clock's rate compared with the far-away clock's (1 = the same rate)
      </text>

      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={PLOT_LEFT} y1={graphYFor(f)} x2={PLOT_RIGHT} y2={graphYFor(f)} stroke="#334155" />
          <text x={PLOT_LEFT - 8} y={graphYFor(f) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {f}
          </text>
        </g>
      ))}
      {[1, 1.5, 3, 10, 100].map((d) => (
        <g key={d}>
          <line x1={graphXFor(d)} y1={PLOT_BOTTOM} x2={graphXFor(d)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={graphXFor(d)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor={d === 1 ? 'start' : 'middle'}>
            {d}
          </text>
        </g>
      ))}
      <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fill="#94a3b8" fontSize="11" textAnchor="middle">
        distance from the black hole's center, in horizon radii (logarithmic)
      </text>

      {/* The horizon, where the exact line reaches zero */}
      <line x1={graphXFor(1)} y1={PLOT_TOP - 6} x2={graphXFor(1)} y2={PLOT_BOTTOM} stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={graphXFor(1) + 6} y={PLOT_TOP + 8} fill={HORIZON_COLOR} fontSize="11">
        horizon
      </text>

      <path d={firstOrderPath} fill="none" stroke={FIRST_ORDER_COLOR} strokeWidth={3} strokeDasharray="7 5" />
      <path d={exactPath} fill="none" stroke={HOVERING_COLOR} strokeWidth={3} />

      {/* The chosen distance on each line */}
      <line x1={graphXFor(distance)} y1={PLOT_TOP - 6} x2={graphXFor(distance)} y2={PLOT_BOTTOM} stroke="#e2e8f0" strokeDasharray="2 4" strokeOpacity={0.7} />
      <text
        x={Math.min(Math.max(graphXFor(distance), PLOT_LEFT + 45), PLOT_RIGHT - 45)}
        y={PLOT_TOP - 10}
        fill="#e2e8f0"
        fontSize="11"
        textAnchor="middle"
      >
        {guesses ? 'the clock in Picture 1' : 'your distance'}: {formatRadii(distance)}
      </text>
      <circle cx={graphXFor(distance)} cy={graphYFor(result.firstOrderFactor)} r={6} fill="#0b1020" stroke={FIRST_ORDER_COLOR} strokeWidth={3} />
      <circle cx={graphXFor(distance)} cy={graphYFor(result.exactFactor)} r={6} fill={HOVERING_COLOR} stroke="#0b1020" strokeWidth={2} />

      {/* The white marks for the guesses, once the run has finished */}
      {guesses && (
        <g>
          <line x1={295} y1={122} x2={markX + 9} y2={markY} stroke={GUESS_COLOR} strokeWidth={2} />
          <circle cx={markX} cy={markY} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <GuessBox x={420} y={100} width={250} line2={`guess 1: ${justOutsideShort}`} />

          <path
            d={`M ${bracketX + 6} ${bracketTop} L ${bracketX + 12} ${bracketTop} L ${bracketX + 12} ${bracketBottom} L ${bracketX + 6} ${bracketBottom}`}
            fill="none"
            stroke={GUESS_COLOR}
            strokeWidth={3}
          />
          <line x1={295} y1={182} x2={bracketX + 13} y2={(bracketTop + bracketBottom) / 2} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={420} y={160} width={250} line2={`guess 3: ${approximationShort}`} />
          <text x={420} y={216} fill={GUESS_COLOR} fontSize="10" textAnchor="middle">
            (guess 3 is only a marker: the bracket points at the gap between the lines)
          </text>
        </g>
      )}

      {/* Legend and the values at the chosen distance, below the graph */}
      <line x1={90} y1={PLOT_BOTTOM + 62} x2={120} y2={PLOT_BOTTOM + 62} stroke={HOVERING_COLOR} strokeWidth={3} />
      <text x={126} y={PLOT_BOTTOM + 66} fill={HOVERING_COLOR} fontSize="11">
        exact: {result.exactFactor.toFixed(4)} at {formatRadii(distance)}
      </text>
      <line x1={90} y1={PLOT_BOTTOM + 82} x2={120} y2={PLOT_BOTTOM + 82} stroke={FIRST_ORDER_COLOR} strokeWidth={3} strokeDasharray="7 5" />
      <text x={126} y={PLOT_BOTTOM + 86} fill={FIRST_ORDER_COLOR} fontSize="11">
        simple formula (Gravity and Curved Spacetime, Experiments 2 and 9): {result.firstOrderFactor.toFixed(4)}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Picture 2b: the same distance in horizon radii around two black holes, on its own scale, with the white marker for guess 2
// ---------------------------------------------------------------------------------------------------------------
const TWO_HEIGHT = 300
const TWO_TOP = 72
const TWO_BOTTOM = 192

export function TwoHolesPicture({
  small,
  giant,
  guess,
}: {
  small: { label: string; factor: number; distanceKm: number }
  giant: { label: string; factor: number; distanceKm: number }
  guess: MassGuess | null
}) {
  const yFor = (f: number) => TWO_BOTTOM - f * (TWO_BOTTOM - TWO_TOP)
  const bars = [
    { cx: 140, ...small },
    { cx: 335, ...giant },
  ]
  const guessShort = MASS_CHOICES.find((c) => c.value === guess)?.short ?? ''
  const ring = (cx: number, f: number) => (
    <circle cx={cx} cy={yFor(f)} r={16} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
  )
  const ringTargets = guess === 'small' ? [bars[0]] : guess === 'giant' ? [bars[1]] : guess === 'same' ? bars : []
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${TWO_HEIGHT}`}
      width="100%"
      style={svgBox}
      role="img"
      aria-label={`Picture 2b. At ${COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii the hovering clock's rate is ${small.factor.toFixed(4)} around ${small.label} and ${giant.factor.toFixed(4)} around ${giant.label}.`}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Picture 2b: the same distance, {COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii, around two black holes
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Vertical: the hovering clock's rate compared with the far-away clock's (1 = the same rate). Its own scale.
      </text>

      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={70} y1={yFor(f)} x2={430} y2={yFor(f)} stroke="#334155" />
          <text x={62} y={yFor(f) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {f}
          </text>
        </g>
      ))}
      {bars.map((b) => (
        <g key={b.label}>
          <rect x={b.cx - 40} y={yFor(b.factor)} width={80} height={TWO_BOTTOM - yFor(b.factor)} fill={HOVERING_COLOR} fillOpacity={0.85} />
          <text x={b.cx} y={yFor(b.factor) - 24} fill={HOVERING_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
            {b.factor.toFixed(4)}
          </text>
          <text x={b.cx} y={TWO_BOTTOM + 18} fill="#e2e8f0" fontSize="11" textAnchor="middle">
            {b.label}
          </text>
          <text x={b.cx} y={TWO_BOTTOM + 34} fill="#94a3b8" fontSize="10" textAnchor="middle">
            clock {formatLength(b.distanceKm)} from the center
          </text>
        </g>
      ))}

      {guess && (
        <g>
          {ringTargets.map((b) => (
            <g key={b.label}>{ring(b.cx, b.factor)}</g>
          ))}
          {guess === 'same' && (
            <line x1={bars[0].cx + 16} y1={yFor(bars[0].factor)} x2={bars[1].cx - 16} y2={yFor(bars[1].factor)} stroke={GUESS_COLOR} strokeWidth={3} strokeDasharray="5 4" />
          )}
          <line
            x1={455}
            y1={TWO_TOP + 72}
            x2={ringTargets[ringTargets.length - 1].cx + 11}
            y2={yFor(ringTargets[ringTargets.length - 1].factor) + 11}
            stroke={GUESS_COLOR}
            strokeWidth={2}
          />
          <GuessBox x={545} y={TWO_TOP + 50} width={180} line2={guessShort} />
          <text x={545} y={TWO_TOP + 112} fill={GUESS_COLOR} fontSize="10" textAnchor="middle">
            (a marker only: the ring or
          </text>
          <text x={545} y={TWO_TOP + 125} fill={GUESS_COLOR} fontSize="10" textAnchor="middle">
            rings point at the bar tops)
          </text>
        </g>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Picture 3 (and Picture 6): both clocks' readings over the run
// ---------------------------------------------------------------------------------------------------------------
export function ReadingsPicture({
  title,
  progress,
  readings,
}: {
  title: string
  progress: number
  readings: { far: number; hovering: number }
}) {
  const timeX = (seconds: number) => PLOT_LEFT + (seconds / FAR_CLOCK_RUN_SECONDS) * (PLOT_RIGHT - PLOT_LEFT)
  const readingY = (seconds: number) => PLOT_BOTTOM - (seconds / FAR_CLOCK_RUN_SECONDS) * (PLOT_BOTTOM - PLOT_TOP)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${READINGS_HEIGHT}`}
      width="100%"
      style={svgBox}
      role="img"
      aria-label={`${title}. The far-away clock reads ${readings.far.toFixed(2)} seconds and the hovering clock reads ${readings.hovering.toFixed(2)} seconds.`}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        {title}: what each clock reads as the far-away clock runs
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Drawn as the run plays. Horizontal: the far-away clock's reading. Vertical: each clock's own reading.
      </text>

      {[0, 20, 40, 60].map((t) => (
        <g key={t}>
          <line x1={PLOT_LEFT} y1={readingY(t)} x2={PLOT_RIGHT} y2={readingY(t)} stroke="#334155" />
          <text x={PLOT_LEFT - 8} y={readingY(t) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {t}
          </text>
          <line x1={timeX(t)} y1={PLOT_BOTTOM} x2={timeX(t)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={timeX(t)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fill="#94a3b8" fontSize="11" textAnchor="middle">
        far-away clock's reading (seconds)
      </text>
      <text x={PLOT_LEFT - 8} y={PLOT_TOP - 10} fill="#94a3b8" fontSize="10" textAnchor="end">
        seconds
      </text>

      {progress > 0 && (
        <>
          <line x1={timeX(0)} y1={readingY(0)} x2={timeX(readings.far)} y2={readingY(readings.far)} stroke={FAR_COLOR} strokeWidth={3} />
          <line x1={timeX(0)} y1={readingY(0)} x2={timeX(readings.far)} y2={readingY(readings.hovering)} stroke={HOVERING_COLOR} strokeWidth={3} />
          <circle cx={timeX(readings.far)} cy={readingY(readings.far)} r={5} fill={FAR_COLOR} />
          <circle cx={timeX(readings.far)} cy={readingY(readings.hovering)} r={5} fill={HOVERING_COLOR} />
        </>
      )}

      <line x1={96} y1={PLOT_TOP + 14} x2={126} y2={PLOT_TOP + 14} stroke={FAR_COLOR} strokeWidth={3} />
      <text x={132} y={PLOT_TOP + 18} fill={FAR_COLOR} fontSize="11">
        far-away clock (reads the same as the horizontal axis)
      </text>
      <line x1={96} y1={PLOT_TOP + 34} x2={126} y2={PLOT_TOP + 34} stroke={HOVERING_COLOR} strokeWidth={3} />
      <text x={132} y={PLOT_TOP + 38} fill={HOVERING_COLOR} fontSize="11">
        hovering clock
      </text>
      <circle cx={111} cy={PLOT_TOP + 54} r={5} fill="#e2e8f0" />
      <text x={132} y={PLOT_TOP + 58} fill="#e2e8f0" fontSize="11">
        dots: the present moment of the run
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The captions
// ---------------------------------------------------------------------------------------------------------------
const li = { marginBottom: '0.4rem' } as const
const ol = { margin: 0, paddingLeft: '1.1rem' } as const
const subHead = { marginTop: '0.6rem', marginBottom: '0.3rem' } as const

function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={li}>
      <strong>Look at:</strong> {look}
      <br />
      <strong>What it means:</strong> {means}
      <br />
      <strong>Why it matters:</strong> {matters}
    </li>
  )
}

// ---- the Part 1 captions: one under each picture. What each picture shows is explained at once; its numbers, a worked moment and the
// "what to look for" list appear only when the run has finished, so nothing is explained before the learner has seen it (CLAUDE.md §12). ----
const bullets = { ...ol, listStyle: 'disc' } as const

function CaptionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
      <strong>{children}</strong>
    </p>
  )
}

function Later({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
      <em>{children}</em>
    </p>
  )
}

// Picture 1: the two clocks.
export function ClocksCaption({ complete, result, own = false }: { complete: boolean; result: TimeNearBlackHoleResult; own?: boolean }) {
  const d = result.distanceInHorizonRadii
  const pic = own ? 'Picture 4' : 'Picture 1'
  const afterHorizonKm = result.distanceKm - result.horizonRadiusKm
  const farTurns = result.farClockReadingSeconds / SECONDS_PER_TURN
  const hoveringTurns = result.hoveringClockReadingSeconds / SECONDS_PER_TURN
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 4, your two clocks.' : 'How to read Picture 1, the two clocks.'}</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        {pic} shows the whole set-up of {own ? 'your run' : 'this run'}. The black hole is {own ? `${result.preset.label}, with a mass of ${formatMass(result.preset.massSolarMasses)}` : 'the stellar one, with the mass of 10 Suns'}. The hovering clock is held at{' '}
        {formatRadii(d)} horizon radii from its center. A <strong>horizon radius</strong> is the distance from the black hole’s center to its edge,
        so {formatRadii(d)} horizon radii means {formatRadii(d)} times as far from the center as the edge is. The far-away clock is far beyond the
        edge of the picture. Both clocks start together and the far-away clock runs for {FAR_CLOCK_RUN_SECONDS} seconds of its own time, which you watch
        in about {RUN_PLAYBACK_SECONDS} seconds of real time.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The gold dial on the right is the far-away clock.</strong> Its hand goes around once for every {SECONDS_PER_TURN} seconds of its own
          time, and the number below it is its own reading. The small gray line says the same: “one turn of the hand = {SECONDS_PER_TURN} s on this clock”.
        </li>
        <li style={li}>
          <strong>The blue dial on the left is the hovering clock,</strong> drawn the same way. If the two clocks tick at the same rate, the two hands
          stay together. If they tick at different rates, the hands drift apart.
        </li>
        <li style={li}>
          <strong>The line along the bottom is a ruler for the hovering clock’s distance,</strong> in horizon radii. It is logarithmic: equal steps
          along it multiply the distance by the same amount, so the ticks at 1.5, 3, 10 and 100 fit in one picture. 100 horizon radii is far from the
          black hole; 1 is the edge itself.
        </li>
        <li style={li}>
          <strong>The red line is the horizon,</strong> the one-way edge of the black hole. The label under it gives its distance from the center in
          kilometers. <strong>The shaded purple box marked “black hole”</strong> to its left stands for the inside of the black hole.
        </li>
        <li style={li}>
          <strong>The blue dot on the ruler is where the hovering clock is held.</strong> The dotted blue line joins it to the blue dial, and the label
          “= … from the center” gives the real distance in kilometers. <strong>The gold note at the bottom right</strong> says that the far-away clock is
          much farther out than the ruler reaches, so it is not on the ruler.
        </li>
      </ul>
      <p style={subHead}>
        <strong>Colors and units</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          Gold is the far-away clock and blue is the hovering clock, here and in {own ? 'Pictures 5 and 6' : 'Pictures 2, 2b and 3'}. Red is the horizon. Purple is the inside of the
          black hole. Distances along the ruler are in horizon radii and the labels under it are in kilometers; readings are in seconds (s).
        </li>
      </ul>
      <p style={subHead}>
        <strong>What changes during the run</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          When you press {own ? 'Run your choice' : 'Run'}, both dials read 0 and both hands point straight up. The hands then turn for about {RUN_PLAYBACK_SECONDS} seconds, and the
          numbers under the dials count up. Nothing else in {pic} moves. <strong>What this picture is not:</strong> it compares two clocks held at
          rest. It does not show a traveler falling in, and it does not show how the clock is held.
        </li>
      </ul>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment, with {own ? 'your' : 'this run’s'} numbers</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            You can read the slowing factor straight from the dials: it is the hovering clock’s reading divided by the far-away clock’s reading, which
            is {result.hoveringClockReadingSeconds.toFixed(2)} ÷ {result.farClockReadingSeconds.toFixed(2)} = {formatSmall(result.exactFactor)}.
          </p>
          <p style={subHead}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look="the two numbers under the dials, after the run."
              means={
                <>
                  the gold far-away clock reads {result.farClockReadingSeconds.toFixed(2)} s and the blue hovering clock reads{' '}
                  {result.hoveringClockReadingSeconds.toFixed(2)} s.
                </>
              }
              matters="this is the slowing, read directly: one clock has lived through far less time than the other."
            />
            <LookFor
              look="the two hands at the end of the run."
              means={
                <>
                  the gold hand has made {formatSmall(farTurns)} full turns and is back at the top; the blue hand has made{' '}
                  {hoveringTurns < 1 ? `only ${formatSmall(hoveringTurns)} of a turn` : `${formatSmall(hoveringTurns)} turns`}.
                </>
              }
              matters="the hands started together and ended apart, which is what two clocks ticking at different rates look like. How far apart they end shows how much slower the hovering clock ran."
            />
            <LookFor
              look="the kilometers under the ruler."
              means={
                <>
                  the clock is about {formatLength(result.distanceKm)} from the center, only about {formatLength(afterHorizonKm)} outside the horizon,
                  which is {formatLength(result.horizonRadiusKm)} from the center.
                </>
              }
              matters={
                own
                  ? 'change the black hole and run again: the same number of horizon radii can be a very different distance in kilometers.'
                  : 'the same number of horizon radii around a bigger black hole would be a much larger distance in kilometers; the Part 2 controls let you try.'
              }
            />
          </ol>
        </>
      ) : (
        <Later>
          {own
            ? 'The numbers, a worked moment and the “what to look for” list appear here when your run has finished.'
            : 'The numbers, a worked moment and the “what to look for” list appear here when the run has finished, so they do not give away your guesses.'}
        </Later>
      )}
    </CaptionBox>
  )
}

// Picture 2: the rate against distance, with the white marks for guesses 1 and 3.
export function FactorCaption({ complete, result, own = false }: { complete: boolean; result: TimeNearBlackHoleResult; own?: boolean }) {
  const d = result.distanceInHorizonRadii
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 5, your rate against distance.' : 'How to read Picture 2, the rate against distance.'}</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        {own ? 'Picture 4' : 'Picture 1'} showed one clock at one distance. {own ? 'Picture 5' : 'Picture 2'} shows how fast a hovering clock ticks at{' '}
        <em>every</em> distance from the black hole, so you can see the whole picture in one graph.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The height of a line is how fast the hovering clock ticks compared with the far-away clock.</strong> A height of 1 means the same
          rate, 0.5 means half as fast, and 0 means not ticking at all. The numbers 0, 0.5 and 1 are marked on the left.
        </li>
        <li style={li}>
          <strong>Along the bottom is the distance from the black hole’s center, in horizon radii,</strong> on the same logarithmic ruler as in{' '}
          {own ? 'Picture 4' : 'Picture 1'}. The horizon is on the left, and distance grows to the right.
        </li>
        <li style={li}>
          <strong>The solid blue line is the exact answer,</strong> from general relativity, and it is the one used for the clock in {own ? 'Picture 4' : 'Picture 1'}.{' '}
          <strong>The dashed orange line is the simple formula</strong> from Gravity and Curved Spacetime, Experiments 2 and 9, a first-order
          approximation made for weak gravity.
        </li>
        <li style={li}>
          <strong>The red line on the left is the horizon.</strong> <strong>The dotted vertical line</strong> marks the distance of the clock in{' '}
          {own ? 'Picture 4' : 'Picture 1'}, {formatRadii(d)} horizon radii, and the blue dot and the orange ring on it are the two formulas’ values there.
        </li>
        <li style={li}>
          <strong>The key under the graph</strong> repeats the two lines and gives their values at that distance.
        </li>
        {own ? (
          <li style={li}>
            <strong>Your guesses are not drawn on this graph.</strong> It follows the black hole and the distance you chose, and nothing else.
          </li>
        ) : (
        <li style={li}>
          <strong>The white marks are your guesses, and they appear only when the run has finished.</strong> Each white box is labeled YOUR GUESS.
          Guess 1 is a white ring at the height you guessed for a clock at {formatRadii(d)} horizon radii, joined to its box by a white line. Guess 3
          has no size of its own, so it is only a marker: a white bracket beside the gap between the two lines, joined to its own box. The marks do
          not change the lines.
        </li>
        )}
      </ul>
      <p style={subHead}>
        <strong>What changes during the run</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          {own
            ? 'The two lines are drawn from the start, and the dotted line and the two dots sit at the distance you chose. They do not move during the run; they move when you choose a different distance. The numbers below are added when your run ends.'
            : 'The two lines and the dot are drawn from the start and do not change during the run. Your white marks and the numbers below are added when the run ends.'}
        </li>
      </ul>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment, with {own ? 'your' : 'this run’s'} numbers</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            The exact line is <strong>√(1 − r_s ÷ r)</strong>, from general relativity (given here, not derived), where r_s is the horizon radius and r is
            the distance from the center. At {formatRadii(d)} horizon radii: r_s ÷ r = 1 ÷ {formatRadii(d)} = {formatSmall(1 / d)}. Then 1 −{' '}
            {formatSmall(1 / d)} = {formatSmall(1 - 1 / d)}. The square root of {formatSmall(1 - 1 / d)} is {formatSmall(result.exactFactor)}. That is the
            height of the blue dot. The simple formula is 1 − r_s ÷ (2r) = 1 − {formatSmall(1 / (2 * d))} = {formatSmall(result.firstOrderFactor)},
            the height of the orange ring.
          </p>
          <p style={subHead}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look="the blue dot on the solid line, at the dotted vertical line."
              means={
                <>
                  its height, {formatSmall(result.exactFactor)}, is the slowing factor: about {formatNumber(1 / result.exactFactor)} seconds on the
                  far-away clock for every 1 second on the hovering clock.
                </>
              }
              matters={own ? 'this is the number for your settings. Choose another distance and run again to see how it changes.' : 'this is the real value that your first guess is drawn beside.'}
            />
            <LookFor
              look="the orange ring on the dashed line, and the gap between it and the blue dot."
              means={
                <>
                  at {formatRadii(d)} horizon radii the simple formula says {formatSmall(result.firstOrderFactor)} and the exact line says{' '}
                  {formatSmall(result.exactFactor)}: the simple formula is{' '}
                  {timesAsMuch(d) >= 2 ? `about ${formatNumber(timesAsMuch(d))} times as large` : `${formatNumber(percentTooHigh(d))}% higher`}.
                </>
              }
              matters="this is how far the simple formula is from the exact one at this distance. Read the other distances along the two lines yourself."
            />
            {own ? (
              <LookFor
                look="the dotted line and the two dots, after you choose a different distance."
                means="they slide along the two lines to the new distance, and the numbers in the key under the graph change with them."
                matters="it lets you read the slowing at any distance between the horizon and 100 horizon radii, one choice at a time."
              />
            ) : (
            <LookFor
              look="your white ring, and your white bracket, with the lines."
              means="the ring is the height you guessed for question 1; the bracket only points at the gap, whatever you guessed for question 3."
              matters="they let you compare your guesses with the real lines at a glance. They are only your guesses; the tutor will say how they compare."
            />
            )}
          </ol>
        </>
      ) : (
        <Later>
          {own
            ? 'The numbers, a worked moment and the “what to look for” list appear here when your run has finished.'
            : 'The numbers, a worked moment and the “what to look for” list appear here when the run has finished, so they do not give away your guesses.'}
        </Later>
      )}
    </CaptionBox>
  )
}

// Picture 2b: the same distance in horizon radii around two black holes, with the white marker for guess 2.
export function TwoHolesCaption({
  twoHoles,
}: {
  twoHoles: { small: { factor: number; distanceKm: number }; giant: { factor: number; distanceKm: number } }
}) {
  return (
    <CaptionBox>
      <CaptionTitle>How to read Picture 2b, the same distance around two black holes.</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        Picture 2b answers a different question from Picture 2. It puts two hovering clocks side by side, each at {COMPARISON_DISTANCE_IN_HORIZON_RADII}{' '}
        horizon radii from the center of its own black hole. It appears when the run has finished.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>Two blue bars, one for each black hole.</strong> The left bar is the small black hole, with the mass of 10 Suns. The right bar is
          M87*, a giant black hole. The label under each bar names it and gives how far from its center that clock is held, in kilometers.
        </li>
        <li style={li}>
          <strong>The height of a bar is the hovering clock’s rate compared with its own far-away clock’s</strong> (1 = the same rate, 0.5 = half as
          fast), and the number above each bar is that height. This picture has its own scale, on the left, so do not compare its heights with
          Picture 2’s axis in horizon radii.
        </li>
        <li style={li}>
          <strong>The white mark is your guess for question 2.</strong> It has no size of its own, so it is only a marker. A white ring on the small
          bar’s top means you guessed that its clock ticks more slowly, a ring on the giant bar’s top means the giant one, and rings on both tops joined
          by a dashed white line mean you guessed that they tick at the same relative rate. The white box labeled YOUR GUESS is joined to the ring by a
          white line. The marker does not change the bars.
        </li>
      </ul>
      <p style={subHead}>
        <strong>Colors and units</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>Blue is a hovering clock, as in the other pictures. White is always your guess. Heights have no unit (they are a ratio); distances are in kilometers.</li>
      </ul>
      <p style={subHead}>
        <strong>What to look for</strong>
      </p>
      <ol style={ol}>
        <LookFor
          look="the height of the two bars, and the numbers above them."
          means={
            <>
              the bar for the 10-Sun black hole is {twoHoles.small.factor.toFixed(4)} high and the bar for M87* is {twoHoles.giant.factor.toFixed(4)} high,
              with the clocks {formatLength(twoHoles.small.distanceKm)} and {formatLength(twoHoles.giant.distanceKm)} from their centers.
            </>
          }
          matters="this is the real comparison that your second guess is drawn beside."
        />
        <LookFor
          look="your white ring or rings, against the bar tops."
          means="the ring or rings sit on the bar or bars that you chose."
          matters="they let you compare your guess with the real bars at a glance. They are only your guess; the tutor will say how it compares."
        />
      </ol>
    </CaptionBox>
  )
}

// Picture 3: both clocks' readings over the run.
export function ReadingsCaption({ complete, result, own = false }: { complete: boolean; result: TimeNearBlackHoleResult; own?: boolean }) {
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 6, your readings over time.' : 'How to read Picture 3, the readings over time.'}</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        {own ? 'Picture 6' : 'Picture 3'} is a record of the run. Where {own ? 'Picture 4' : 'Picture 1'} shows the two clocks at one moment, {own ? 'Picture 6' : 'Picture 3'} draws what each one has read at every moment so far.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>Along the bottom is the far-away clock’s reading,</strong> in seconds, from 0 to {FAR_CLOCK_RUN_SECONDS}. <strong>Up the left side is
          each clock’s own reading,</strong> also in seconds.
        </li>
        <li style={li}>
          <strong>The gold line is the far-away clock.</strong> By definition it reads the same as the horizontal axis, so it climbs at a steady slope.{' '}
          <strong>The blue line is the hovering clock.</strong> A steeper line means a faster clock.
        </li>
        <li style={li}>
          <strong>The two dots show the present moment of the run</strong>: the gold dot is the far-away clock’s reading now, and the blue dot is the
          hovering clock’s. The key at the top left names the lines and the dots.
        </li>
      </ul>
      <p style={subHead}>
        <strong>What changes during the run</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          Nothing is drawn before you press {own ? 'Run your choice' : 'Run'}. Then the two lines grow from the bottom left corner, and the two dots move along them, for about{' '}
          {RUN_PLAYBACK_SECONDS} seconds. At the end the gold dot is at {result.farClockReadingSeconds.toFixed(0)} s.
        </li>
      </ul>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment, with {own ? 'your' : 'this run’s'} numbers</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            At the end of the run the gold dot is at {result.farClockReadingSeconds.toFixed(2)} s and the blue dot is at{' '}
            {result.hoveringClockReadingSeconds.toFixed(2)} s. The steepness of the blue line is the rise divided by the run:{' '}
            {result.hoveringClockReadingSeconds.toFixed(2)} ÷ {result.farClockReadingSeconds.toFixed(2)} = {formatSmall(result.exactFactor)}. So each
            second on the gold clock adds {formatSmall(result.exactFactor)} s to the blue one.
          </p>
          <p style={subHead}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look="the blue line against the gold one."
              means={
                <>
                  the blue line climbs to {result.hoveringClockReadingSeconds.toFixed(2)} s while the gold line climbs to{' '}
                  {result.farClockReadingSeconds.toFixed(2)} s.
                </>
              }
              matters="the gap between the lines is the difference in what the two clocks have read."
            />
            <LookFor
              look="whether each line is straight or curved."
              means="both lines are straight."
              matters="a straight line means a steady rate: the hovering clock ticks at the same slower rate all through the run, and the gap grows steadily."
            />
          </ol>
        </>
      ) : (
        <Later>
          {own
            ? 'The numbers, a worked moment and the “what to look for” list appear here when your run has finished.'
            : 'The numbers, a worked moment and the “what to look for” list appear here when the run has finished, so they do not give away your guesses.'}
        </Later>
      )}
    </CaptionBox>
  )
}
