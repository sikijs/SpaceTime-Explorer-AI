import type { CSSProperties, ReactNode } from 'react'
import {
  FLASH_COUNT,
  SMALLEST_GAP_IN_HORIZON_RADII,
  causeGuessMarker,
  curveEnd,
  lastFlashGuessMarker,
  nearHorizonReadings,
  spacingGuessMarker,
  spacingSummary,
  workedDistance,
  workedSteps,
} from '../physics/seeingTheFallExperiment'
import type { CauseChoice, LastFlashChoice, SeeingTheFallResult, SpacingChoice } from '../physics/seeingTheFallExperiment'

// Black Holes, Experiment 6 (audit update): the three pictures, their white guess marks and their captions
// (docs/audit/black-holes-and-strong-gravity/06-draft-wording.md). White always means the learner's guess (CLAUDE.md §14), so the
// flash dots and the reference lines are not white. Every number shown comes from the physics module (§9).

const KM_PER_AU = 149_597_870.7

const SENT_COLOR = '#22d3ee' // the traveler's watch, as in Experiment 5
const RECEIVED_COLOR = '#fb923c' // the observer's clock, as the far-away clock was in Experiment 5
const HORIZON_COLOR = '#fb7185'
const GRAVITY_COLOR = '#a78bfa'
const MOTION_COLOR = '#4ade80'
const TOTAL_COLOR = '#fbbf24'
const REFERENCE_COLOR = '#94a3b8' // grey: white is reserved for the learner's guess


// The two rows of ticks (the first picture).
const ROW_WIDTH = 640
const ROW_HEIGHT = 470
const ROW_LEFT = 24
const ROW_RIGHT = 616
const TOP_ROW_Y = 142
const BOTTOM_ROW_Y = 300
const TIME_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000]

// The stretch graph (the second picture): gap above the horizon on a log scale, running from far (left) to near (right).
const STRETCH_GRAPH_WIDTH = 640
const STRETCH_GRAPH_HEIGHT = 420
const STRETCH_LEFT = 80
const STRETCH_RIGHT = 610
const STRETCH_TOP = 66
const STRETCH_BOTTOM = 290

// The observer's-clock graph (the third picture).
const CLOCK_GRAPH_WIDTH = 640
const CLOCK_GRAPH_HEIGHT = 420
const CLOCK_LEFT = 80
const CLOCK_RIGHT = 610
const CLOCK_TOP = 66
const CLOCK_BOTTOM = 290

// Caption blocks under each picture (small, muted text, like the other captions in this project).
const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
export function formatBig(value: number): string {
  if (value >= 0.01 && value < 10_000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
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

// A time in the unit that fits it, from millionths of a second to years.
export function formatSeconds(seconds: number): string {
  if (seconds < 0.001) return `${formatNumber(seconds * 1e6)} millionths of a second`
  if (seconds < 0.1) return `${formatNumber(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${formatNumber(seconds)} seconds`
  if (seconds < 7200) return `${formatNumber(seconds / 60)} minutes`
  if (seconds < 172_800) return `${formatNumber(seconds / 3600)} hours`
  if (seconds < 3.156e7) return `${formatNumber(seconds / 86_400)} days`
  return `${formatNumber(seconds / 3.156e7)} years`
}

// A small gap above the horizon, with enough digits to tell 0.01 from 0.001.
export const formatGap = (gap: number) => (gap >= 1 ? formatNumber(gap) : String(Number(gap.toPrecision(2))))

// A white YOUR GUESS box joined by a line to its mark on the real picture. White always means the learner's guess.
function GuessBox({ x, y, width = 196, text, target }: { x: number; y: number; width?: number; text: string; target: { x: number; y: number } }) {
  const height = 38
  return (
    <g>
      <line x1={x + width} y1={y + height / 2} x2={target.x} y2={target.y} stroke="#ffffff" strokeWidth={2} />
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0b1020" stroke="#ffffff" strokeWidth={2.5} />
      <text x={x + 10} y={y + 15} fill="#ffffff" fontSize="11" fontWeight="bold">
        YOUR GUESS
      </text>
      <text x={x + 10} y={y + 30} fill="#ffffff" fontSize="11">
        {text}
      </text>
    </g>
  )
}

const WHITE_MARK = { fill: 'none', stroke: '#ffffff', strokeWidth: 3 } as const

// The first picture: the flashes as sent (top row) and as received (bottom row), joined by lines. Both rows use the same
// scale, in horizon light-times, so a longer gap on the bottom row is a real stretching. Each flash appears in turn.
export function FlashRows({ result, progress }: { result: SeeingTheFallResult; progress: number }) {
  const flashes = result.flashes
  const lastArrival = flashes[FLASH_COUNT - 1].arrival as number
  const xMax = Math.max(lastArrival * 1.08, result.travelerWatchAtHorizon * 1.08)
  const xFor = (t: number) => ROW_LEFT + (t / xMax) * (ROW_RIGHT - ROW_LEFT)
  const tickStep = TIME_STEPS.find((s) => xMax / s <= 7) ?? TIME_STEPS[TIME_STEPS.length - 1]
  const ticks = Array.from({ length: Math.floor(xMax / tickStep) + 1 }, (_, i) => i * tickStep)

  // Flash k is played during its own slice of the playback; q runs from 0 (not yet sent) to 1 (arrived).
  const slices = FLASH_COUNT + 1
  const q = (k: number) => Math.min(Math.max(progress * slices - k, 0), 1)
  const current = Math.min(Math.floor(progress * slices), FLASH_COUNT)
  const flash = flashes[current]
  const started = progress > 0
  const finished = progress >= 1

  const rows: Array<{ key: string; draw: ReactNode; text: string; fill: string }> = [
    {
      key: 'sent',
      draw: <circle cx={20} cy={400} r={4} fill={SENT_COLOR} />,
      text: 'a flash as sent, at that reading of the traveler\'s watch',
      fill: SENT_COLOR,
    },
    {
      key: 'received',
      draw: <circle cx={20} cy={416} r={4} fill={RECEIVED_COLOR} />,
      text: 'the same flash as received, at that reading of the observer\'s clock',
      fill: RECEIVED_COLOR,
    },
    {
      key: 'line',
      draw: <line x1={12} y1={432} x2={28} y2={432} stroke="#94a3b8" strokeOpacity={0.8} />,
      text: 'a line joins each flash as sent to the same flash as received',
      fill: '#cbd5e1',
    },
    {
      key: 'horizon',
      draw: <circle cx={20} cy={448} r={4} fill={HORIZON_COLOR} />,
      text: 'flash 20, sent as the traveler crosses the horizon',
      fill: HORIZON_COLOR,
    },
  ]

  return (
    <svg
      viewBox={`0 0 ${ROW_WIDTH} ${ROW_HEIGHT}`}
      width="100%"
      style={{
        display: 'block',
        maxWidth: `${ROW_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="13" fontWeight="bold">
        The flashes as sent and as received
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        {started
          ? flash.index === FLASH_COUNT
            ? `Flash ${flash.index}: sent as the traveler crosses the horizon`
            : `Flash ${flash.index}: sent when the traveler was ${formatGap(flash.distance - 1)} horizon radii above the horizon`
          : 'Ready: the traveler is about to be released'}
      </text>
      <text x={12} y={54} fill="#94a3b8" fontSize="11">
        {started && flash.spacingAsReceived !== null && flash.spacingAsSent !== null
          ? `Gap since the last flash: ${formatNumber(flash.spacingAsSent)} as sent, ${formatNumber(
              flash.spacingAsReceived,
            )} as received (${formatNumber(flash.stretchFactor as number)} times as long)`
          : started && flash.index === FLASH_COUNT
            ? 'This flash is sent at the horizon and never arrives'
            : ' '}
      </text>

      {/* The top row: the traveler's watch */}
      <text x={ROW_LEFT} y={TOP_ROW_Y - 40} fill={SENT_COLOR} fontSize="12" fontWeight="bold">
        The traveler's watch (flashes as sent)
      </text>
      <line x1={ROW_LEFT} y1={TOP_ROW_Y} x2={ROW_RIGHT} y2={TOP_ROW_Y} stroke="#475569" strokeWidth={2} />
      {ticks.map((t) => (
        <g key={`top-${t}`}>
          <line x1={xFor(t)} y1={TOP_ROW_Y} x2={xFor(t)} y2={TOP_ROW_Y + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={TOP_ROW_Y + 17} fill="#94a3b8" fontSize="9" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}

      {/* The bottom row: the observer's clock */}
      <line x1={ROW_LEFT} y1={BOTTOM_ROW_Y} x2={ROW_RIGHT} y2={BOTTOM_ROW_Y} stroke="#475569" strokeWidth={2} />
      {ticks.map((t) => (
        <g key={`bottom-${t}`}>
          <line x1={xFor(t)} y1={BOTTOM_ROW_Y} x2={xFor(t)} y2={BOTTOM_ROW_Y + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={BOTTOM_ROW_Y + 17} fill="#94a3b8" fontSize="9" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={ROW_LEFT} y={BOTTOM_ROW_Y + 36} fill={RECEIVED_COLOR} fontSize="12" fontWeight="bold">
        The observer's clock (flashes as received)
      </text>
      <text x={ROW_RIGHT} y={BOTTOM_ROW_Y + 36} fill="#94a3b8" fontSize="10" textAnchor="end">
        both rows: horizon light-times
      </text>

      {/* Each flash: a tick on the top row, a line down, and its arrival on the bottom row */}
      {flashes.map((f) => {
        const progressOfFlash = q(f.index)
        if (progressOfFlash <= 0) return null
        const x = xFor(f.sentWatch)
        const isLast = f.index === FLASH_COUNT
        const targetX = isLast ? ROW_RIGHT : xFor(f.arrival as number)
        const x2 = x + (targetX - x) * progressOfFlash
        const y2 = TOP_ROW_Y + (BOTTOM_ROW_Y - TOP_ROW_Y) * progressOfFlash
        return (
          <g key={f.index}>
            <line
              x1={x}
              y1={TOP_ROW_Y}
              x2={x2}
              y2={y2}
              stroke={isLast ? HORIZON_COLOR : '#94a3b8'}
              strokeOpacity={isLast ? 0.9 : 0.6}
              strokeDasharray={isLast ? '5 4' : undefined}
            />
            <circle cx={x} cy={TOP_ROW_Y} r={4} fill={isLast ? HORIZON_COLOR : SENT_COLOR} />
            <text x={x} y={TOP_ROW_Y - 9} fill={isLast ? HORIZON_COLOR : SENT_COLOR} fontSize="9" textAnchor="middle">
              {f.index}
            </text>
            {!isLast && progressOfFlash >= 1 && <circle cx={targetX} cy={BOTTOM_ROW_Y} r={4} fill={RECEIVED_COLOR} />}
            {!isLast && progressOfFlash >= 1 && (
              <text x={targetX} y={BOTTOM_ROW_Y - 9} fill={RECEIVED_COLOR} fontSize="9" textAnchor="middle">
                {f.index}
              </text>
            )}
          </g>
        )
      })}
      {finished && (
        <text x={ROW_RIGHT} y={BOTTOM_ROW_Y + 52} fill={HORIZON_COLOR} fontSize="10" textAnchor="end">
          flash 20 never arrives: its line runs off the end of the observer's row
        </text>
      )}

      {rows.map((row, i) => (
        <g key={row.key}>
          {row.draw}
          <text x={32} y={404 + i * 16} fill={row.fill} fontSize="10">
            {row.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

// The value of a curve at a gap, by interpolation in the logarithm of the gap, from the points the physics module gave.
function curveAt(result: SeeingTheFallResult, gap: number, pick: (point: SeeingTheFallResult['curve'][number]) => number): number {
  const curve = result.curve // from the widest gap to the smallest
  if (gap >= curve[0].gap) return pick(curve[0])
  for (let i = 1; i < curve.length; i++) {
    if (gap >= curve[i].gap) {
      const a = curve[i - 1]
      const b = curve[i]
      const fraction = (Math.log(a.gap) - Math.log(gap)) / (Math.log(a.gap) - Math.log(b.gap))
      return Math.exp(Math.log(pick(a)) + fraction * (Math.log(pick(b)) - Math.log(pick(a))))
    }
  }
  return pick(curve[curve.length - 1])
}

// The stretch factor against the traveler's gap above the horizon: gravity part, motion part and their product.
export function StretchGraph({
  result,
  progress,
  guesses,
}: {
  result: SeeingTheFallResult
  progress: number
  guesses?: { spacing: SpacingChoice; cause: CauseChoice } | null
}) {
  const widest = result.curve[0].gap
  const logWidest = Math.log10(widest)
  const logSmallest = Math.log10(SMALLEST_GAP_IN_HORIZON_RADII)
  const maxFactor = result.curve[result.curve.length - 1].total
  const logTop = Math.ceil(Math.log10(maxFactor) + 0.05)
  const xFor = (gap: number) => STRETCH_LEFT + ((logWidest - Math.log10(gap)) / (logWidest - logSmallest)) * (STRETCH_RIGHT - STRETCH_LEFT)
  const yFor = (factor: number) => STRETCH_BOTTOM - (Math.log10(factor) / logTop) * (STRETCH_BOTTOM - STRETCH_TOP)
  const line = (pick: (p: SeeingTheFallResult['curve'][number]) => number) => result.curve.map((p) => `${xFor(p.gap)},${yFor(pick(p))}`).join(' ')
  const gapTicks: number[] = []
  for (let k = Math.ceil(logSmallest); k <= Math.floor(logWidest); k++) gapTicks.push(10 ** k)
  const factorTicks = Array.from({ length: logTop + 1 }, (_, k) => 10 ** k)

  const slices = FLASH_COUNT + 1
  const shown = Math.min(Math.floor(progress * slices) + (progress > 0 ? 1 : 0), FLASH_COUNT) // flashes 0 .. FLASH_COUNT - 1 so far
  const dots = result.flashes.slice(0, Math.min(shown, FLASH_COUNT))

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
        <clipPath id="stretch-factor-plot">
          <rect x={STRETCH_LEFT} y={STRETCH_TOP} width={STRETCH_RIGHT - STRETCH_LEFT} height={STRETCH_BOTTOM - STRETCH_TOP + 1} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How much the spacing is stretched
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: gap above the horizon (log, farther on the left). Vertical: stretch factor (log).
      </text>

      {factorTicks.map((f) => (
        <g key={f}>
          <line x1={STRETCH_LEFT} y1={yFor(f)} x2={STRETCH_RIGHT} y2={yFor(f)} stroke="#334155" />
          <text x={STRETCH_LEFT - 8} y={yFor(f) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {formatBig(f)}
          </text>
        </g>
      ))}
      <text x={14} y={(STRETCH_TOP + STRETCH_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(STRETCH_TOP + STRETCH_BOTTOM) / 2})`}>
        stretch factor (times)
      </text>
      {gapTicks.map((g) => (
        <g key={g}>
          <line x1={xFor(g)} y1={STRETCH_BOTTOM} x2={xFor(g)} y2={STRETCH_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(g)} y={STRETCH_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {formatNumber(g)}
          </text>
        </g>
      ))}
      <text x={(STRETCH_LEFT + STRETCH_RIGHT) / 2} y={STRETCH_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        gap above the horizon, in horizon radii (the traveler falls to the right)
      </text>

      {/* "Not stretched" */}
      <line x1={STRETCH_LEFT} y1={yFor(1)} x2={STRETCH_RIGHT} y2={yFor(1)} stroke={REFERENCE_COLOR} strokeDasharray="5 4" strokeOpacity={0.8} />
      <text x={STRETCH_RIGHT - 130} y={yFor(1) - 6} fill={REFERENCE_COLOR} fontSize="10" textAnchor="end">
        1: not stretched
      </text>

      <g clipPath="url(#stretch-factor-plot)">
        <polyline points={line((p) => p.gravity)} fill="none" stroke={GRAVITY_COLOR} strokeWidth={2.5} />
        <polyline points={line((p) => p.motion)} fill="none" stroke={MOTION_COLOR} strokeWidth={2.5} />
        <polyline points={line((p) => p.total)} fill="none" stroke={TOTAL_COLOR} strokeWidth={3.5} />
      </g>

      {/* Curve labels, at the right-hand end */}
      <text x={STRETCH_RIGHT - 70} y={yFor(result.curve[result.curve.length - 1].total) + 4} fill={TOTAL_COLOR} fontSize="10" textAnchor="end">
        total: gravity × motion
      </text>
      <text x={STRETCH_RIGHT - 6} y={yFor(result.curve[result.curve.length - 1].motion) - 8} fill={MOTION_COLOR} fontSize="10" textAnchor="end">
        motion part
      </text>
      <text x={STRETCH_RIGHT - 6} y={yFor(result.curve[result.curve.length - 1].gravity) + 15} fill={GRAVITY_COLOR} fontSize="10" textAnchor="end">
        gravity part
      </text>

      {/* The flashes sent so far, on the total curve (the one sent at the horizon is at a gap of zero, off the scale) */}
      {dots.map((f) => {
        const gap = f.distance - 1
        return (
          <circle
            key={f.index}
            cx={xFor(Math.max(gap, SMALLEST_GAP_IN_HORIZON_RADII))}
            cy={yFor(curveAt(result, gap, (p) => p.total))}
            r={4}
            fill={SENT_COLOR}
            stroke={TOTAL_COLOR}
            strokeWidth={1.5}
          />
        )
      })}

      <line x1={96} y1={STRETCH_GRAPH_HEIGHT - 60} x2={126} y2={STRETCH_GRAPH_HEIGHT - 60} stroke={GRAVITY_COLOR} strokeWidth={3} />
      <text x={132} y={STRETCH_GRAPH_HEIGHT - 56} fill={GRAVITY_COLOR} fontSize="11">
        gravity slows the traveler's watch
      </text>
      <line x1={96} y1={STRETCH_GRAPH_HEIGHT - 42} x2={126} y2={STRETCH_GRAPH_HEIGHT - 42} stroke={MOTION_COLOR} strokeWidth={3} />
      <text x={132} y={STRETCH_GRAPH_HEIGHT - 38} fill={MOTION_COLOR} fontSize="11">
        the traveler moves away
      </text>
      <line x1={330} y1={STRETCH_GRAPH_HEIGHT - 60} x2={360} y2={STRETCH_GRAPH_HEIGHT - 60} stroke={TOTAL_COLOR} strokeWidth={4} />
      <text x={366} y={STRETCH_GRAPH_HEIGHT - 56} fill={TOTAL_COLOR} fontSize="11">
        both together: the stretch factor
      </text>
      <circle cx={345} cy={STRETCH_GRAPH_HEIGHT - 38} r={4} fill={SENT_COLOR} stroke={TOTAL_COLOR} strokeWidth={1.5} />
      <text x={366} y={STRETCH_GRAPH_HEIGHT - 34} fill="#e2e8f0" fontSize="11">
        dots: the flashes sent so far
      </text>
      {guesses && (() => {
        const end = curveEnd(result)
        const rx = STRETCH_RIGHT - 44
        const spacing = spacingGuessMarker(guesses.spacing)
        const cause = causeGuessMarker(guesses.cause)
        const spacingTarget = spacing.kind === 'at-one' ? { x: rx, y: yFor(1) } : spacing.kind === 'below-one' ? { x: rx, y: yFor(1) + 13 } : { x: rx, y: STRETCH_TOP + 26 }
        const causeY = cause.target === 'gravity-curve' ? yFor(end.gravity) : cause.target === 'motion-curve' ? yFor(end.motion) : yFor(end.total)
        const causeTarget = { x: STRETCH_RIGHT, y: causeY }
        const spacingText = guesses.spacing === 'same' ? 'the same spacing' : guesses.spacing === 'closer' ? 'closer together' : 'further and further apart'
        const causeText = guesses.cause === 'gravity' ? 'only gravity' : guesses.cause === 'motion' ? 'only the traveler’s motion' : 'both, together'
        return (
          <g>
            <GuessBox x={STRETCH_LEFT + 16} y={STRETCH_TOP + 8} text={spacingText} target={spacingTarget} />
            <GuessBox x={STRETCH_LEFT + 16} y={STRETCH_TOP + 54} text={causeText} target={causeTarget} />
            {spacing.kind === 'at-one' && <circle cx={spacingTarget.x} cy={spacingTarget.y} r={7} {...WHITE_MARK} />}
            {spacing.kind === 'below-one' && <polygon points={`${rx},${spacingTarget.y + 6} ${rx - 8},${spacingTarget.y - 8} ${rx + 8},${spacingTarget.y - 8}`} fill="#ffffff" stroke="#0b1020" strokeWidth={1.5} />}
            {spacing.kind === 'arrow-up' && <polygon points={`${rx},${spacingTarget.y - 8} ${rx - 9},${spacingTarget.y + 10} ${rx + 9},${spacingTarget.y + 10}`} fill="#ffffff" stroke="#0b1020" strokeWidth={1.5} />}
            <circle cx={causeTarget.x} cy={causeTarget.y} r={8} {...WHITE_MARK} />
          </g>
        )
      })()}
    </svg>
  )
}

// The observer's clock when each flash arrives, against the traveler's watch when it was sent.
export function ClockGraph({ result, progress, guess }: { result: SeeingTheFallResult; progress: number; guess?: LastFlashChoice | null }) {
  const horizonWatch = result.travelerWatchAtHorizon
  const yMax = result.curve[result.curve.length - 1].arrival * 1.06
  const xFor = (watch: number) => CLOCK_LEFT + (watch / horizonWatch) * (CLOCK_RIGHT - CLOCK_LEFT) * 0.94
  const yFor = (arrival: number) => CLOCK_BOTTOM - (arrival / yMax) * (CLOCK_BOTTOM - CLOCK_TOP)
  const curveLine = result.curve.map((p) => `${xFor(p.watch)},${yFor(p.arrival)}`).join(' ')
  const tickStep = TIME_STEPS.find((s) => yMax / s <= 6) ?? TIME_STEPS[TIME_STEPS.length - 1]
  const yTicks = Array.from({ length: Math.floor(yMax / tickStep) + 1 }, (_, i) => i * tickStep)
  const xTickStep = TIME_STEPS.find((s) => horizonWatch / s <= 6) ?? TIME_STEPS[TIME_STEPS.length - 1]
  const xTicks = Array.from({ length: Math.floor(horizonWatch / xTickStep) + 1 }, (_, i) => i * xTickStep)

  const slices = FLASH_COUNT + 1
  const shown = progress > 0 ? Math.min(Math.floor(progress * slices) + 1, FLASH_COUNT) : 0
  const dots = result.flashes.slice(0, shown)
  const diagonalEnd = Math.min(yMax, horizonWatch * 1.0)

  return (
    <svg
      viewBox={`0 0 ${CLOCK_GRAPH_WIDTH} ${CLOCK_GRAPH_HEIGHT}`}
      width="100%"
      style={{
        marginTop: '1rem',
        display: 'block',
        maxWidth: `${CLOCK_GRAPH_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="observer-clock-plot">
          <rect x={CLOCK_LEFT} y={CLOCK_TOP} width={CLOCK_RIGHT - CLOCK_LEFT} height={CLOCK_BOTTOM - CLOCK_TOP + 1} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The observer's clock against the traveler's watch
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: the traveler's watch when a flash is sent. Vertical: the observer's clock when it arrives.
      </text>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={CLOCK_LEFT} y1={yFor(t)} x2={CLOCK_RIGHT} y2={yFor(t)} stroke="#334155" />
          <text x={CLOCK_LEFT - 8} y={yFor(t) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {formatNumber(t)}
          </text>
        </g>
      ))}
      <text x={14} y={(CLOCK_TOP + CLOCK_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(CLOCK_TOP + CLOCK_BOTTOM) / 2})`}>
        the observer's clock at arrival
      </text>
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={CLOCK_BOTTOM} x2={xFor(t)} y2={CLOCK_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={CLOCK_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {formatNumber(t)}
          </text>
        </g>
      ))}
      <text x={(CLOCK_LEFT + CLOCK_RIGHT) / 2} y={CLOCK_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        the traveler's watch when the flash is sent
      </text>

      {/* The traveler's watch reaches the horizon here */}
      <line x1={xFor(horizonWatch)} y1={CLOCK_TOP} x2={xFor(horizonWatch)} y2={CLOCK_BOTTOM} stroke={HORIZON_COLOR} strokeDasharray="5 4" />
      <text x={xFor(horizonWatch) - 6} y={CLOCK_TOP + 12} fill={HORIZON_COLOR} fontSize="10" textAnchor="end">
        the traveler's watch reaches the horizon
      </text>

      <g clipPath="url(#observer-clock-plot)">
        {/* If the two clocks always agreed */}
        <line x1={xFor(0)} y1={yFor(0)} x2={xFor(diagonalEnd)} y2={yFor(diagonalEnd)} stroke={REFERENCE_COLOR} strokeDasharray="5 4" strokeOpacity={0.8} />
        <polyline points={curveLine} fill="none" stroke={RECEIVED_COLOR} strokeWidth={3} />
      </g>
      <text x={xFor(horizonWatch) - 10} y={CLOCK_TOP + 34} fill={RECEIVED_COLOR} fontSize="10" textAnchor="end">
        keeps going, with no limit
      </text>
      <text x={xFor(diagonalEnd * 0.55) + 8} y={yFor(diagonalEnd * 0.55) + 14} fill={REFERENCE_COLOR} fontSize="10">
        dashed: if the two clocks always agreed
      </text>

      {dots.map((f) => (
        <circle key={f.index} cx={xFor(f.sentWatch)} cy={yFor(f.arrival as number)} r={4} fill={RECEIVED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      ))}

      <line x1={96} y1={CLOCK_GRAPH_HEIGHT - 44} x2={126} y2={CLOCK_GRAPH_HEIGHT - 44} stroke={RECEIVED_COLOR} strokeWidth={3} />
      <text x={132} y={CLOCK_GRAPH_HEIGHT - 40} fill={RECEIVED_COLOR} fontSize="11">
        when a flash sent at that moment arrives
      </text>
      <circle cx={101} cy={CLOCK_GRAPH_HEIGHT - 20} r={4} fill={RECEIVED_COLOR} />
      <text x={132} y={CLOCK_GRAPH_HEIGHT - 16} fill="#e2e8f0" fontSize="11">
        dots: the flashes sent so far (flash 20 is sent at the horizon and never arrives)
      </text>
      {guess && (() => {
        const end = curveEnd(result)
        const marker = lastFlashGuessMarker(guess)
        const hx = xFor(horizonWatch)
        const target =
          marker.kind === 'meets-no-delay-line' ? { x: hx, y: yFor(horizonWatch) } : marker.kind === 'curve-end' ? { x: xFor(end.watch), y: yFor(end.arrival) } : { x: hx + 14, y: CLOCK_TOP + 50 }
        const text = guess === 'soon' ? 'soon after it is sent' : guess === 'long-wait' ? 'only after a long wait' : 'it never arrives'
        return (
          <g>
            <GuessBox x={CLOCK_LEFT + 16} y={CLOCK_TOP + 30} text={text} target={target} />
            {marker.kind !== 'arrow-off-top' && <circle cx={target.x} cy={target.y} r={8} {...WHITE_MARK} />}
            {marker.kind === 'arrow-off-top' && (
              <g>
                <line x1={hx + 14} y1={CLOCK_TOP + 50} x2={hx + 14} y2={CLOCK_TOP + 12} stroke="#ffffff" strokeWidth={3} />
                <polygon points={`${hx + 14},${CLOCK_TOP + 2} ${hx + 5},${CLOCK_TOP + 18} ${hx + 23},${CLOCK_TOP + 18}`} fill="#ffffff" stroke="#0b1020" strokeWidth={1.5} />
              </g>
            )}
          </g>
        )
      })()}
    </svg>
  )
}


// ---------------------------------------------------------------------------------------------------------------
// The captions ("How to read Picture N"), drafted from 06-draft-wording.md. Each says what every drawn thing is, defines the terms,
// gives a worked moment with real numbers and then "what to look for" in three parts: Look at, What it means, Why it matters. An
// item about a feature that is drawn only at the end of the run is shown only once the run is complete. The mechanism (why the gaps
// grow) and the verdict are left to the tutor (CLAUDE.md §12, §13, §14).
// ---------------------------------------------------------------------------------------------------------------

const list = { margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' } as const

function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <strong>Look at</strong> {look} <strong>What it means:</strong> {means} <strong>Why it matters:</strong> {matters}
    </li>
  )
}

export function FlashesCaption({ result, started, complete, own }: { result: SeeingTheFallResult; started: boolean; complete: boolean; own?: boolean }) {
  const spacing = spacingSummary(result)
  return (
    <div style={CAPTION_STYLE}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read {own ? 'Picture 4' : 'Picture 1'}: the flashes as sent and as received.</strong> This picture is made for you from the formulas the experiment is built on. The traveler falls toward the black hole and sends a short flash of light straight outward at equal steps of their own watch. The observer, far away, writes down when each flash arrives.
      </p>
      <ul style={list}>
        <li>
          <strong>The top row</strong> is the traveler’s watch. Each blue dot is a flash at the reading of the watch when it was sent. The dots are numbered 0 to 19 in the order they were sent.
        </li>
        <li>
          <strong>The bottom row</strong> is the observer’s clock. Each orange dot is the same flash at the reading of the observer’s clock when it arrives. The two rows share one scale, in <strong>horizon light-times</strong>: one horizon light-time is the time light takes to cross one horizon radius ({formatSeconds(result.lightTimeSeconds)} for this black hole). So a longer gap on the bottom row is a real stretching.
        </li>
        <li>
          <strong>The thin lines</strong> join each flash on the top row to the same flash on the bottom row.
        </li>
        <li>
          <strong>The rose dot, number 20,</strong> is the flash sent at the moment the traveler crosses the horizon. Its line is dashed and runs off the end of the observer’s row.
        </li>
        <li>
          <strong>What appears when:</strong> the flashes appear one after another during the run, each with its line, and the gap readout under the title follows the flash being played.
        </li>
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> Flashes 0 and 1 are sent {formatNumber(spacing.firstSent)} apart on the traveler’s watch. They arrive {formatNumber(spacing.firstReceived)} apart on the observer’s clock. Flashes 18 and 19 are still sent {formatNumber(spacing.lastSent)} apart, but they arrive {formatNumber(spacing.lastReceived)} apart.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        {started && (
          <LookFor
            look="the gaps between the blue dots on the top row."
            means={`they are all ${formatNumber(spacing.firstSent)}, equal, because the flashes were sent at equal steps of the traveler’s watch.`}
            matters="the traveler’s own watch ticks steadily, so any change in the spacing on the bottom row is not in how the flashes were sent."
          />
        )}
        {complete && (
          <LookFor
            look="the gaps between the orange dots on the bottom row."
            means={`the first is ${formatNumber(spacing.firstReceived)} and the last is ${formatNumber(spacing.lastReceived)}, so they grow.`}
            matters="the observer receives flashes that were sent evenly, but not evenly."
          />
        )}
        {complete && (
          <LookFor
            look="flash 20’s dashed line."
            means="it runs off the end of the observer’s row, and no arrival time is drawn for it."
            matters="it is the flash sent as the traveler reaches the horizon."
          />
        )}
      </ul>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>A limit.</strong> This follows thin flashes sent straight outward. It is not what a camera would show. How bright the flashes are and what colour they become are not modelled. No white mark is on this picture: your guesses are drawn on Pictures 2 and 3.
      </p>
    </div>
  )
}

export function StretchCaption({ result, complete, own, withGuesses }: { result: SeeingTheFallResult; complete: boolean; own?: boolean; withGuesses?: boolean }) {
  const worked = workedSteps(result.startInHorizonRadii)
  const distance = workedDistance(result.startInHorizonRadii)
  const near = nearHorizonReadings(result.startInHorizonRadii)[0]
  const end = curveEnd(result)
  const first = result.curve[0]
  return (
    <div style={CAPTION_STYLE}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read {own ? 'Picture 5' : 'Picture 2'}: how much the spacing is stretched.</strong> This picture is made for you from the formulas the experiment is built on.
      </p>
      <ul style={list}>
        <li>
          <strong>The stretch factor</strong> is the gap between two arriving flashes divided by the gap between them as sent. If two flashes were sent 5 seconds apart and arrive 5 seconds apart, it is 1. If they arrive 10 seconds apart, it is 2.
        </li>
        <li>
          <strong>The horizontal axis</strong> is the traveler’s gap above the horizon, in horizon radii: the distance from the center minus 1. The traveler falls to the right, so the left is far and the right is close to the horizon. It is a log scale: each step to the right is a gap ten times smaller.
        </li>
        <li>
          <strong>The vertical axis</strong> is the stretch factor, also on a log scale.
        </li>
        <li>
          <strong>The three curves.</strong> The violet curve is the part of the stretching that comes from gravity slowing the traveler’s watch (the “gravity part”). The green curve is the part that comes from the traveler moving away (the “motion part”). The amber curve is the stretch factor itself, the two multiplied.
        </li>
        <li>
          <strong>The cyan dots</strong> are the flashes. The traveler sends them one after another as they fall, evenly spaced on their own watch. Each dot appears at the moment its flash is sent and sits on the amber curve. Its left-to-right position is how far above the horizon the traveler was when they sent it. Its height is the stretch factor for the gap between that flash and the next one. So the dots appear from left to right as the fall goes on, and the dots drawn so far are the flashes sent so far. The last flash is sent at the horizon, where the gap is zero. A log scale cannot show zero, so its dot is drawn at the right-hand edge.
        </li>
        <li>
          <strong>The grey dashed line</strong> is the line at 1, labelled “1: not stretched”. It is a ruler for reading the picture. A point on the line means the gap between two flashes arrives exactly as long as it was when sent, with nothing stretched. A point above the line means the arriving gap is longer than the sent gap. A point below the line would mean it is shorter. For example, a dot at 3 means that two flashes sent 5 seconds apart arrive 15 seconds apart.
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS boxes</strong> are your first and third guesses, each joined by a line to a white mark. A white mark is only a marker: it shows which kind of answer you gave and where it belongs on the picture, not a number you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> At {distance} horizon radii from the center the gravity part is {formatNumber(worked.gravity)} and the motion part is {formatNumber(worked.motion)}, so the stretch factor is {formatNumber(worked.gravity)} × {formatNumber(worked.motion)} = {formatNumber(worked.total)}. At a gap of {formatGap(near.gapInHorizonRadii)} above the horizon it is {formatBig(near.stretch)}.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the amber curve at the left."
          means={`it starts at ${formatNumber(first.total)}, just above the grey line.`}
          matters="at the release the traveler is hardly moving, so the spacing is hardly stretched."
        />
        {complete && (
          <LookFor
            look="the right-hand end of the amber curve."
            means={`it reaches about ${formatBig(end.total)} at a gap of ${formatGap(SMALLEST_GAP_IN_HORIZON_RADII)}, and it is still rising where the picture stops.`}
            matters="the picture stops there only because it must stop somewhere. The stretching has no limit as the gap shrinks."
          />
        )}
      </ul>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>A limit.</strong> The curves are drawn down to a gap of {formatGap(SMALLEST_GAP_IN_HORIZON_RADII)} horizon radii. The model says nothing about inside the horizon.
      </p>
    </div>
  )
}

export function ClockCaption({ result, complete, own, withGuess }: { result: SeeingTheFallResult; complete: boolean; own?: boolean; withGuess?: boolean }) {
  const middle = result.flashes[Math.floor(FLASH_COUNT / 2)]
  const late = result.flashes[FLASH_COUNT - 1]
  const early = result.flashes[2]
  const earlyGap = early.arrival! - early.sentWatch
  const lateGap = late.arrival! - late.sentWatch
  return (
    <div style={CAPTION_STYLE}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read {own ? 'Picture 6' : 'Picture 3'}: the observer’s clock against the traveler’s watch.</strong> This picture is made for you from the formulas the experiment is built on.
      </p>
      <ul style={list}>
        <li>
          <strong>The horizontal axis</strong> is the traveler’s watch when a flash is sent. <strong>The vertical axis</strong> is the observer’s clock when that flash arrives. Both are in horizon light-times.
        </li>
        <li>
          <strong>The orange curve</strong> is the arrival time of a flash sent at each reading of the traveler’s watch. <strong>The grey dashed line</strong> is what it would be if the two clocks always agreed, with no delay and no stretching.
        </li>
        <li>
          <strong>The rose dashed line</strong> marks where the traveler’s watch reaches the horizon: {formatNumber(result.travelerWatchAtHorizon)} horizon light-times ({formatSeconds(result.travelerWatchAtHorizon * result.lightTimeSeconds)}).
        </li>
        <li>
          <strong>The orange dots</strong> are the flashes sent so far. Flash 20 is sent at the horizon, on the rose line, and has no dot because no arrival time is drawn for it.
        </li>
        {withGuess && complete && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your second guess, joined by a line to a white mark at the rose line. It is only a marker: it shows which kind of answer you gave and where it belongs, not a number you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> A flash sent when the traveler’s watch reads {formatNumber(middle.sentWatch)} arrives when the observer’s clock reads {formatNumber(middle.arrival!)}.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the gap between the orange curve and the grey dashed line."
          means={`the observer’s clock is always ahead of the traveler’s watch, by ${formatNumber(earlyGap)} for flash 2 and by ${formatNumber(lateGap)} for flash 19, so the gap widens.`}
          matters="the delay grows as the traveler gets closer to the horizon."
        />
        {complete && (
          <LookFor
            look="the orange curve near the rose line."
            means="it turns almost straight up and does not reach the line."
            matters="the traveler’s watch reaches the horizon after a finite time, but the observer’s clock has no finite reading for the flash sent there."
          />
        )}
      </ul>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>A limit.</strong> The curve is drawn until the traveler is {formatGap(SMALLEST_GAP_IN_HORIZON_RADII)} horizon radii above the horizon. This follows thin flashes sent straight outward, not a camera view.
      </p>
    </div>
  )
}
