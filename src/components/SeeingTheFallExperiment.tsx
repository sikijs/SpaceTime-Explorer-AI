import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FLASH_COUNT,
  SMALLEST_GAP_IN_HORIZON_RADII,
  runSeeingTheFallExperiment,
} from '../physics/seeingTheFallExperiment'
import type { SeeingTheFallResult } from '../physics/seeingTheFallExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface SeeingTheFallExperimentProps {
  onComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The flashes
// are played one after another; the time between them on screen is not the time between them in the physics.
const ANIMATION_DURATION_MS = 10_000

const KM_PER_AU = 149_597_870.7

const SENT_COLOR = '#22d3ee' // the traveler's watch, as in Experiment 5
const RECEIVED_COLOR = '#fb923c' // the observer's clock, as the far-away clock was in Experiment 5
const HORIZON_COLOR = '#fb7185'
const GRAVITY_COLOR = '#a78bfa'
const MOTION_COLOR = '#4ade80'
const TOTAL_COLOR = '#fbbf24'
const REFERENCE_COLOR = '#e2e8f0'

const START_PRESETS = [100, 20, 10, 5, 2]

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not scored
// here; they are compared with the model's results later. The question wording is a draft for the owner's review.
type SpacingChoice = 'same' | 'closer' | 'further'
const spacingChoices: Array<{ value: SpacingChoice; label: string }> = [
  { value: 'same', label: 'At the same spacing as they were sent' },
  { value: 'closer', label: 'Closer together' },
  { value: 'further', label: 'Further and further apart' },
]

type LastFlashChoice = 'soon' | 'long-wait' | 'never'
const lastFlashChoices: Array<{ value: LastFlashChoice; label: string }> = [
  { value: 'soon', label: 'Yes, soon after it is sent' },
  { value: 'long-wait', label: 'Yes, but only after a very long wait' },
  { value: 'never', label: 'No, it never arrives' },
]

type CauseChoice = 'gravity' | 'motion' | 'both'
const causeChoices: Array<{ value: CauseChoice; label: string }> = [
  { value: 'gravity', label: 'Only gravity' },
  { value: 'motion', label: "Only the traveler's motion" },
  { value: 'both', label: 'Both, and together they matter more than either alone' },
]

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
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
function formatBig(value: number): string {
  if (value >= 0.01 && value < 10_000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
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

// A time in the unit that fits it, from millionths of a second to years.
function formatSeconds(seconds: number): string {
  if (seconds < 0.001) return `${formatNumber(seconds * 1e6)} millionths of a second`
  if (seconds < 0.1) return `${formatNumber(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${formatNumber(seconds)} seconds`
  if (seconds < 7200) return `${formatNumber(seconds / 60)} minutes`
  if (seconds < 172_800) return `${formatNumber(seconds / 3600)} hours`
  if (seconds < 3.156e7) return `${formatNumber(seconds / 86_400)} days`
  return `${formatNumber(seconds / 3.156e7)} years`
}

// A small gap above the horizon, with enough digits to tell 0.01 from 0.001.
const formatGap = (gap: number) => (gap >= 1 ? formatNumber(gap) : String(Number(gap.toPrecision(2))))

// The first picture: the flashes as sent (top row) and as received (bottom row), joined by lines. Both rows use the same
// scale, in horizon light-times, so a longer gap on the bottom row is a real stretching. Each flash appears in turn.
function FlashRows({ result, progress }: { result: SeeingTheFallResult; progress: number }) {
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
function StretchGraph({ result, progress }: { result: SeeingTheFallResult; progress: number }) {
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
      <text x={STRETCH_RIGHT - 6} y={yFor(1) - 6} fill={REFERENCE_COLOR} fontSize="10" textAnchor="end">
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
            fill="#ffffff"
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
      <circle cx={345} cy={STRETCH_GRAPH_HEIGHT - 38} r={4} fill="#ffffff" stroke={TOTAL_COLOR} strokeWidth={1.5} />
      <text x={366} y={STRETCH_GRAPH_HEIGHT - 34} fill="#e2e8f0" fontSize="11">
        dots: the flashes sent so far
      </text>
    </svg>
  )
}

// The observer's clock when each flash arrives, against the traveler's watch when it was sent.
function ClockGraph({ result, progress }: { result: SeeingTheFallResult; progress: number }) {
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
    </svg>
  )
}

export function SeeingTheFallExperiment({ onComplete }: SeeingTheFallExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [start, setStart] = useState(10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const [spacingPrediction, setSpacingPrediction] = useState<SpacingChoice | null>(null)
  const [lastFlashPrediction, setLastFlashPrediction] = useState<LastFlashChoice | null>(null)
  const [causePrediction, setCausePrediction] = useState<CauseChoice | null>(null)
  const [submittedSpacing, setSubmittedSpacing] = useState<SpacingChoice | null>(null)
  const [submittedLastFlash, setSubmittedLastFlash] = useState<LastFlashChoice | null>(null)
  const [submittedCause, setSubmittedCause] = useState<CauseChoice | null>(null)

  const hasPrediction = spacingPrediction !== null && lastFlashPrediction !== null && causePrediction !== null
  const hasSubmittedPrediction = submittedSpacing !== null && submittedLastFlash !== null && submittedCause !== null

  const result = useMemo(() => runSeeingTheFallExperiment(presetId, start), [presetId, start])

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
      setSubmittedSpacing(spacingPrediction)
      setSubmittedLastFlash(lastFlashPrediction)
      setSubmittedCause(causePrediction)
    }
    setStatus('running')
    setProgress(0)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the
  // chosen black hole or release distance.
  const handleChangePrediction = () => {
    setSubmittedSpacing(null)
    setSubmittedLastFlash(null)
    setSubmittedCause(null)
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

  const current = result.flashes[Math.min(Math.floor(progress * (FLASH_COUNT + 1)), FLASH_COUNT)]
  const outcomeSoFar = status === 'idle' ? '—' : progress < 1 ? 'sending flashes' : 'all 21 flashes sent'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Seeing the Fall From Far Away: Does Anyone See the Traveler Cross?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A traveler falls toward a black hole, sending a flash of light once every few seconds of their own watch. A
            far-away observer receives the flashes. As the traveler nears the horizon, how do the flashes arrive?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {spacingChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setSpacingPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${spacingPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Does the far-away observer ever receive the flash that is sent as the traveler crosses the horizon?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {lastFlashChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setLastFlashPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${lastFlashPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Two effects could change how far apart the flashes arrive: gravity slowing the traveler's watch (Experiment 2),
            and the traveler moving away as they fall (like the receding source in Gravitational Waves, Experiment 5).
            Which of them do you think matters?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {causeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setCausePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${causePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${spacingChoices.find((c) => c.value === (spacingPrediction ?? submittedSpacing))!.label}; ${
                  lastFlashChoices.find((c) => c.value === (lastFlashPrediction ?? submittedLastFlash))!.label
                }; ${causeChoices.find((c) => c.value === (causePrediction ?? submittedCause))!.label}`
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
              {formatDistance(result.startInHorizonRadii * result.horizonRadiusKm)}). Now playing flash {current.index} of{' '}
              {FLASH_COUNT}
              <br />
              The flashes: {outcomeSoFar}
            </p>

            <div style={{ marginTop: '1rem', maxWidth: `${ROW_WIDTH}px` }}>
              <FlashRows result={result} progress={progress} />
              {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
              <div style={CAPTION_STYLE}>
                <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                  <strong>How to read this picture: the flashes as sent and as received.</strong>
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>1. What is happening.</strong> The traveler falls toward the black hole and sends a short flash of
                  light, straight outward, at 20 equal steps of their own watch. Flash 0 is sent at the release, and flash 20
                  is sent as they reach the horizon. A far-away observer, at rest, receives the flashes and notes the time
                  on their own clock when each one arrives.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>2. The top row.</strong> This is the traveler's watch. Each blue dot is a flash at the moment it
                  is sent, numbered 0 to 20. The numbers along the line are in horizon light-times, the time light takes to
                  cross one horizon radius.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>3. The bottom row.</strong> This is the observer's clock. Each orange dot is the same flash at the
                  moment it arrives, with the same number. Both rows use the same scale, so you can compare gaps directly.
                  The observer's clock is counted from the arrival of flash 0.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>4. The lines.</strong> A thin line joins each flash on the top row to the same flash on the bottom
                  row. The rose line is flash 20, sent at the horizon.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>5. The gap readout.</strong> Under the title, the picture gives the gap between the current flash
                  and the one before, as sent and as received, and how many times as long the second is.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>6. What to watch.</strong> Compare the gaps between neighbouring dots on the two rows, flash by
                  flash, and see what happens to flash 20.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>A limit.</strong> This follows thin flashes sent straight outward. It is not what a camera would
                  see, how bright the flashes are or what color they become, and it stops at the horizon: nothing inside is
                  shown.
                </p>
              </div>
            </div>

            <StretchGraph result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${STRETCH_GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: how much the spacing is stretched.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> The <em>stretch factor</em> says how many times as long the gap
                between two flashes is when they arrive, compared with the gap when they were sent. A factor of 1 means no
                stretching. Both scales are logarithmic, so each step along an axis multiplies the number by ten. The
                traveler starts at the left and falls to the right, so the gap above the horizon shrinks.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The three curves.</strong> The violet curve is the part of the stretching caused by gravity slowing
                the traveler's watch, as seen from far away (Experiment 2). The green curve is the part caused by the
                traveler moving away, which gives each flash a little farther to travel than the one before. The amber
                curve is the stretch factor itself: the two parts multiplied together.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The dots.</strong> Each white dot marks a flash, at the traveler's gap when it was sent. The flash
                sent at the horizon is at a gap of zero, which a log scale cannot show, so it has no dot.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The curves are drawn down to a gap of 0.0001 horizon radii, but that is only where
                the drawing ends.
              </p>
            </div>

            <ClockGraph result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${CLOCK_GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: the observer's clock against the traveler's watch.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> For a flash sent when the traveler's watch reads the number on the
                horizontal axis, the vertical axis gives what the observer's clock reads when that flash arrives. Both are
                in horizon light-times. The dashed straight line is where the points would lie if the two clocks always
                agreed.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The orange curve and the dots.</strong> The curve is the observer's clock at arrival for a flash sent
                at every moment. The dots are the flashes of the first picture, sent so far. The rose dashed line is the
                moment the traveler's watch reaches the horizon.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The curve is drawn to a gap of 0.0001 horizon radii above the horizon and then
                stops, but that is only where the drawing ends.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
