import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  FUTURE_GRAPH_MAX_YEARS,
  NEXT_DOUBLING_GUESS_YEARS,
  PAST_GRAPH_YEARS,
  farFutureSketch,
  futureRelativeSize,
  noDarkEnergyUniverse,
  realUniverse,
  runFateOfTheUniverseExperiment,
  yearsToGrow,
} from '../physics/fateOfTheUniverseExperiment'
import type { FarFutureGuess, NextDoublingGuess } from '../physics/fateOfTheUniverseExperiment'
import { TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 10, audited to the newer rules (docs/audit/cosmology/10-draft-wording.md, approved by the owner on 2026-11-16).
// Five pictures, each with its own caption: Picture 1 (the graph) and Picture 2 (the bars) show the REAL best-fit universe in Part 1, with the
// learner's white guess marks drawn when their feature is drawn; Pictures 3 and 4 are the same two pictures for the learner's own dark energy
// share (pink, Part 2); Picture 5 is the schematic galaxy strip. Every number comes from the physics module; this file only draws and words
// it (CLAUDE.md §9). White is only ever the learner's guess (§14).

export const GUESS_COLOR = '#ffffff'
export const REAL_COLOR = '#fbbf24' // gold: the real universe, a fixed reference
export const REFERENCE_COLOR = '#38bdf8' // blue dashed: no dark energy
export const YOUR_COLOR = YOURS_COLOR // pink: the learner's own universe (Part 2)
export const MARK_COLOR = '#4ade80' // green: the speed-up dot and the "settles to" line (they were pink; pink now means "yours")
export const CLUSTER_COLOR = '#60a5fa'
const MUTED_COLOR = '#94a3b8'

export const FAR_FUTURE_TEXT: Record<FarFutureGuess, string> = {
  stops: 'the expansion slows down and stops',
  slower: 'the expansion keeps going, but ever more slowly',
  faster: 'the expansion keeps speeding up and never stops',
}
export const FAR_FUTURE_BOX_TEXT: Record<FarFutureGuess, string> = {
  stops: 'slows down and stops',
  slower: 'keeps going, more slowly',
  faster: 'keeps speeding up',
}
export const NEXT_DOUBLING_TEXT: Record<NextDoublingGuess, string> = {
  shorter: 'shorter, about 5 billion years',
  same: 'about the same, about 11 billion years',
  longer: 'much longer, about 30 billion years',
}
export const NEXT_DOUBLING_BOX_TEXT: Record<NextDoublingGuess, string> = {
  shorter: 'about 5 billion years',
  same: 'about 11 billion years',
  longer: 'about 30 billion years',
}

const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)
export function formatSize(size: number): string {
  if (size >= 100) return Math.round(size).toString()
  if (size >= 10) return size.toFixed(1)
  return size.toFixed(2)
}
const halo = { stroke: '#0b1020', strokeWidth: 3, paintOrder: 'stroke' } as const

function GuessBox({ x, y, width, line }: { x: number; y: number; width: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={32} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2.5} />
      <text x={x + width / 2} y={y + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 27} fill={GUESS_COLOR} fontSize="9.5" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

// ---- The size-against-time graph (Pictures 1 and 3): size on a logarithmic axis, time from now horizontally ----
const GRAPH_WIDTH = 700
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 64
const GRAPH_RIGHT = 530
const GRAPH_TOP = 54
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MIN_SIZE = 0.1
const GRAPH_MAX_SIZE = 1000
const CURVE_POINTS = 220
const TIME_TICKS_BILLIONS = [-10, 0, 20, 40, 60, 80, 100]
const SIZE_TICKS = [0.1, 1, 10, 100, 1000]
const GRAPH_TIME_SPAN = FUTURE_GRAPH_MAX_YEARS + PAST_GRAPH_YEARS
const LOG_SPAN = Math.log10(GRAPH_MAX_SIZE) - Math.log10(GRAPH_MIN_SIZE)
const BOX_X = 548
const BOX_W = 142
// How tall the white sketch of guess 1 is, in pixels (about 2 decades of the size axis at most): its heights mean nothing as sizes.
const SKETCH_HEIGHT_PX = 120

const graphX = (yearsFromNow: number) => GRAPH_LEFT + ((yearsFromNow + PAST_GRAPH_YEARS) / GRAPH_TIME_SPAN) * (GRAPH_RIGHT - GRAPH_LEFT)
const graphY = (size: number) => GRAPH_BOTTOM - ((Math.log10(size) - Math.log10(GRAPH_MIN_SIZE)) / LOG_SPAN) * (GRAPH_BOTTOM - GRAPH_TOP)

export interface SizeGraphProps {
  // The dark energy share of the main line: the real best fit in Part 1, the learner's own in Part 2.
  share: number
  // 0 to 1: how far the run has gone (the lines draw from 10 billion years ago to the current moment).
  progress: number
  // Gold in Part 1 (the real universe), pink in Part 2 (the learner's own).
  color: string
  legend: string
  // true once the run has ended: the white sketch is drawn then and not before
  finished: boolean
  guess: FarFutureGuess | null
}

export function SizeGraph({ share, progress, color, legend, finished, guess }: SizeGraphProps) {
  const result = runFateOfTheUniverseExperiment(share)
  const yearsFromNow = progress * FUTURE_GRAPH_MAX_YEARS
  const currentSize = futureRelativeSize(yearsFromNow, share)
  const lineFor = (fraction: number) => {
    const points: string[] = []
    for (let i = 0; i <= CURVE_POINTS; i++) {
      const t = -PAST_GRAPH_YEARS + (i / CURVE_POINTS) * (yearsFromNow + PAST_GRAPH_YEARS)
      const size = futureRelativeSize(t, fraction)
      // Points below the axis (the earliest moments of a universe with little dark energy) are skipped.
      if (size >= GRAPH_MIN_SIZE) points.push(`${graphX(t).toFixed(1)},${graphY(size).toFixed(1)}`)
    }
    return points.join(' ')
  }
  const mainLine = lineFor(share)
  const referenceLine = share > 0 ? lineFor(0) : ''
  const speedUpVisible = result.speedUpYearsFromNow !== null && result.speedUpYearsFromNow >= -PAST_GRAPH_YEARS && result.speedUpYearsFromNow <= yearsFromNow
  const sketch = guess && finished ? farFutureSketch(guess) : null
  const sketchPoints = sketch?.map((p) => ({ x: graphX(0) + p.x * (GRAPH_RIGHT - graphX(0)), y: graphY(1) - p.y * SKETCH_HEIGHT_PX }))
  const sketchEnd = sketchPoints ? sketchPoints[sketchPoints.length - 1] : null
  const boxY = sketchEnd ? Math.min(Math.max(sketchEnd.y - 16, GRAPH_TOP), GRAPH_BOTTOM - 40) : 0

  return (
    <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} style={svgStyle} role="img" aria-label="How big the universe is, from the past into the future">
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        How big the universe is, from the past into the future
      </text>
      <g fontSize="10" fill={TEXT_COLOR}>
        <line x1={GRAPH_LEFT + 10} y1={36} x2={GRAPH_LEFT + 34} y2={36} stroke={color} strokeWidth={3.5} />
        <text x={GRAPH_LEFT + 40} y={39}>
          {legend}
        </text>
        <line x1={GRAPH_LEFT + 290} y1={36} x2={GRAPH_LEFT + 314} y2={36} stroke={REFERENCE_COLOR} strokeWidth={2} strokeDasharray="6 4" />
        <text x={GRAPH_LEFT + 320} y={39}>
          {share > 0 ? 'No dark energy (for comparison)' : 'No dark energy (the same as the main line)'}
        </text>
      </g>
      <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
      <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
      {TIME_TICKS_BILLIONS.map((t) => (
        <g key={t}>
          <line x1={graphX(t * 1e9)} y1={GRAPH_BOTTOM} x2={graphX(t * 1e9)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
          <text x={graphX(t * 1e9)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      {SIZE_TICKS.map((s) => (
        <g key={s}>
          <line x1={GRAPH_LEFT - 4} y1={graphY(s)} x2={GRAPH_LEFT} y2={graphY(s)} stroke="#64748b" />
          <line x1={GRAPH_LEFT} y1={graphY(s)} x2={GRAPH_RIGHT} y2={graphY(s)} stroke="#1e293b" />
          <text x={GRAPH_LEFT - 8} y={graphY(s) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            {s}×
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Years from now (billions). Left of 0 is the past.
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        Size compared with today (log scale)
      </text>
      <line x1={graphX(0)} y1={GRAPH_TOP} x2={graphX(0)} y2={GRAPH_BOTTOM} stroke="#475569" strokeDasharray="4 4" />
      <text x={graphX(0) + 5} y={GRAPH_TOP + 12} fill={MUTED_COLOR} fontSize="10">
        today
      </text>
      {referenceLine && <polyline points={referenceLine} fill="none" stroke={REFERENCE_COLOR} strokeWidth={2} strokeDasharray="6 4" />}
      {mainLine && <polyline points={mainLine} fill="none" stroke={color} strokeWidth={3.5} />}
      {speedUpVisible && result.speedUpYearsFromNow !== null && (
        <g>
          <circle cx={graphX(result.speedUpYearsFromNow)} cy={graphY(result.speedUpSize)} r={5} fill={MARK_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <text x={graphX(result.speedUpYearsFromNow) + 9} y={graphY(result.speedUpSize) + 18} fill={MARK_COLOR} fontSize="10" fontWeight="600" {...halo}>
            <tspan x={graphX(result.speedUpYearsFromNow) + 9}>Expansion starts</tspan>
            <tspan x={graphX(result.speedUpYearsFromNow) + 9} dy="12">
              speeding up
            </tspan>
          </text>
        </g>
      )}
      {progress > 0 && <circle cx={graphX(yearsFromNow)} cy={graphY(currentSize)} r={5} fill="#ffffff" stroke={color} strokeWidth={2} />}
      {sketchPoints && sketchEnd && guess && (
        <g>
          <polyline points={sketchPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke={GUESS_COLOR} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={sketchEnd.x} y1={sketchEnd.y} x2={BOX_X} y2={boxY + 16} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={BOX_X} y={boxY} width={BOX_W} line={FAR_FUTURE_BOX_TEXT[guess]} />
        </g>
      )}
    </svg>
  )
}

// ---- The doubling bars (Pictures 2 and 4): a fixed, labelled scale, so bars are comparable between runs ----
const BARS_WIDTH = 700
const BARS_HEIGHT = 270
const BARS_LEFT = 110
const BARS_SCALE_WIDTH = 380
const BARS_SCALE_MAX_YEARS = 80e9
const BARS_TOP = 56
const BARS_ROW_HEIGHT = 40
const BARS_TICKS_BILLIONS = [0, 20, 40, 60, 80]
const barX = (years: number) => BARS_LEFT + (Math.min(years, BARS_SCALE_MAX_YEARS) / BARS_SCALE_MAX_YEARS) * BARS_SCALE_WIDTH

export interface DoublingBarsProps {
  share: number
  // 0 to 1: how far the run has gone
  progress: number
  color: string
  // Part 1 builds the bars one at a time as the universe passes each doubling; Part 2 draws all four at once.
  staged: boolean
  // The white bar for guess 2, drawn once the second bar is drawn
  guess: NextDoublingGuess | null
}

export function DoublingBars({ share, progress, color, staged, guess }: DoublingBarsProps) {
  const result = runFateOfTheUniverseExperiment(share)
  const currentSize = futureRelativeSize(progress * FUTURE_GRAPH_MAX_YEARS, share)
  const done = (i: number) => (staged ? Math.min(Math.max(Math.log2(Math.max(currentSize, 1)) - i, 0), 1) : 1)
  const currentDoublingIndex = progress > 0 ? result.doublings.findIndex((d) => currentSize >= d.fromSize && currentSize < d.toSize) : -1
  const settled = result.longTermDoublingTimeYears
  const allDone = result.doublings.every((_, i) => done(i) >= 1)
  const nearRightEdge = settled !== Infinity && barX(settled) > BARS_LEFT + 200
  const secondDone = done(1) >= 1
  const scaleY = BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length
  const guessY = BARS_TOP + BARS_ROW_HEIGHT + 27

  return (
    <svg width={BARS_WIDTH} height={BARS_HEIGHT} viewBox={`0 0 ${BARS_WIDTH} ${BARS_HEIGHT}`} style={svgStyle} role="img" aria-label="How long each doubling of the universe's size takes">
      <text x={(BARS_LEFT + BARS_LEFT + BARS_SCALE_WIDTH) / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        How long each doubling of the universe&rsquo;s size takes
      </text>
      {settled !== Infinity && allDone && (
        <g>
          <line x1={barX(settled)} y1={BARS_TOP - 12} x2={barX(settled)} y2={scaleY - 6} stroke={MARK_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={barX(settled) + (nearRightEdge ? -4 : 4)} y={BARS_TOP - 16} fill={MARK_COLOR} fontSize="10" fontWeight="600" textAnchor={nearRightEdge ? 'end' : 'start'}>
            Settles to {billions(settled)} billion years{settled > BARS_SCALE_MAX_YEARS ? ' (off the scale)' : ''}
          </text>
        </g>
      )}
      {settled === Infinity && (
        <text x={BARS_LEFT} y={BARS_TOP - 16} fill={MARK_COLOR} fontSize="10" fontWeight="600">
          No dark energy: it never settles, each doubling takes longer
        </text>
      )}
      {result.doublings.map((d, i) => {
        const y = BARS_TOP + i * BARS_ROW_HEIGHT
        const f = done(i)
        if (f <= 0) return null
        const clipped = d.years > BARS_SCALE_MAX_YEARS
        const endX = BARS_LEFT + (barX(d.years) - BARS_LEFT) * f
        const complete = f >= 1
        const labelInside = clipped || endX - BARS_LEFT > 230
        return (
          <g key={d.fromSize}>
            <text x={BARS_LEFT - 8} y={y + 16} fill="#cbd5e1" fontSize="11" textAnchor="end">
              {d.fromSize}× → {d.toSize}×
            </text>
            <rect x={BARS_LEFT} y={y + 4} width={Math.max(endX - BARS_LEFT, 0)} height={20} fill={color} stroke={currentDoublingIndex === i && !complete ? '#ffffff' : 'none'} strokeWidth={2.5} rx={2} />
            {complete && clipped && <path d={`M ${endX - 8} ${y + 2} l 6 8 l -6 4 l 6 8 l -6 4`} fill="none" stroke="#0b1020" strokeWidth={3} />}
            {complete &&
              (labelInside ? (
                <text x={BARS_LEFT + 10} y={y + 18} fill="#0b1020" fontSize="11" fontWeight="700">
                  {billions(d.years)} billion years{clipped ? ' (off the scale)' : ''}
                </text>
              ) : (
                <text x={endX + 8} y={y + 18} fill="#e2e8f0" fontSize="11" fontWeight="600" {...halo}>
                  {billions(d.years)} billion years
                </text>
              ))}
          </g>
        )
      })}
      {guess && secondDone && (
        <g>
          <rect x={BARS_LEFT} y={guessY} width={barX(NEXT_DOUBLING_GUESS_YEARS[guess]) - BARS_LEFT} height={10} fill={GUESS_COLOR} rx={2} />
          <line x1={barX(NEXT_DOUBLING_GUESS_YEARS[guess])} y1={guessY + 5} x2={BOX_X - 40} y2={guessY + 5} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={BOX_X - 40} y={guessY - 11} width={BOX_W + 40} line={NEXT_DOUBLING_BOX_TEXT[guess]} />
        </g>
      )}
      <line x1={BARS_LEFT} y1={scaleY} x2={BARS_LEFT + BARS_SCALE_WIDTH} y2={scaleY} stroke="#64748b" />
      {BARS_TICKS_BILLIONS.map((t) => (
        <g key={t}>
          <line x1={barX(t * 1e9)} y1={scaleY} x2={barX(t * 1e9)} y2={scaleY + 4} stroke="#64748b" />
          <text x={barX(t * 1e9)} y={scaleY + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={BARS_LEFT + BARS_SCALE_WIDTH / 2} y={BARS_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Time for the doubling (billions of years)
      </text>
    </svg>
  )
}

// ---- The galaxy strip (Picture 5): schematic, the spacing adds the same step for every doubling of the size ----
const STRIP_WIDTH = 560
const STRIP_HEIGHT = 190
const STRIP_CLUSTER_X = 70
const STRIP_Y = 100
const STRIP_GALAXIES = 3
const stripSpacing = (size: number) => 40 + 11 * Math.log2(Math.max(size, 1))

export function GalaxyStrip({ share, progress }: { share: number; progress: number }) {
  const size = futureRelativeSize(progress * FUTURE_GRAPH_MAX_YEARS, share)
  const step = stripSpacing(size)
  return (
    <svg width={STRIP_WIDTH} height={STRIP_HEIGHT} viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`} style={{ ...svgStyle, border: `2px solid ${YOUR_COLOR}` }} role="img" aria-label="Galaxies spreading apart while our cluster stays the same size">
      <text x={STRIP_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Our cluster stays the same size while the space between groups stretches (schematic)
      </text>
      <text x={STRIP_WIDTH / 2} y={40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        Spacing between groups now: {formatSize(size)}× today&rsquo;s. The drawing is not to scale.
      </text>
      <circle cx={STRIP_CLUSTER_X} cy={STRIP_Y} r={24} fill="none" stroke={CLUSTER_COLOR} strokeDasharray="3 3" />
      {[
        [-9, 2],
        [2, -8],
        [8, 7],
      ].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={STRIP_CLUSTER_X + dx} cy={STRIP_Y + dy} r={4.5} fill={CLUSTER_COLOR} />
      ))}
      <text x={STRIP_CLUSTER_X} y={STRIP_Y + 44} fill={CLUSTER_COLOR} fontSize="10" textAnchor="middle">
        <tspan x={STRIP_CLUSTER_X}>Our cluster</tspan>
        <tspan x={STRIP_CLUSTER_X} dy="12">
          (held together by gravity)
        </tspan>
      </text>
      {Array.from({ length: STRIP_GALAXIES }, (_, k) => {
        const x = STRIP_CLUSTER_X + (k + 1) * step
        return (
          <g key={k}>
            <ellipse cx={x} cy={STRIP_Y} rx={9} ry={5} fill={YOUR_COLOR} />
            <text x={x} y={STRIP_Y + 24} fill={YOUR_COLOR} fontSize="10" textAnchor="middle">
              Galaxy {String.fromCharCode(65 + k)}
            </text>
          </g>
        )
      })}
      <line x1={STRIP_CLUSTER_X + 30} y1={STRIP_Y - 20} x2={STRIP_CLUSTER_X + STRIP_GALAXIES * step} y2={STRIP_Y - 20} stroke={MUTED_COLOR} strokeWidth={1} />
      <text x={STRIP_CLUSTER_X + (30 + STRIP_GALAXIES * step) / 2} y={STRIP_Y - 26} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        space between them stretches
      </text>
    </svg>
  )
}

// The time the next doubling would take from the current size (the live readout).
export function nextDoublingYearsAt(progress: number, share: number): number {
  const size = futureRelativeSize(progress * FUTURE_GRAPH_MAX_YEARS, share)
  return yearsToGrow(size, 2 * size, share)
}

// ---- Captions (the owner's approved wording: docs/audit/cosmology/10-draft-wording.md, sections 3 and 4) ----
const realNumbers = () => {
  const real = realUniverse()
  const none = noDarkEnergyUniverse()
  return {
    sizeIn50: futureRelativeSize(50e9, BEST_FIT_DARK_ENERGY_FRACTION),
    sizeIn100: real.sizeAtEnd,
    noneIn50: futureRelativeSize(50e9, 0),
    noneIn100: none.sizeAtEnd,
    speedUpYearsAgo: -(real.speedUpYearsFromNow ?? 0),
    doublings: real.doublings.map((d) => d.years),
    settled: real.longTermDoublingTimeYears,
    noneDoublings: none.doublings.map((d) => d.years),
  }
}

export function GraphCaption({ arrived }: { arrived: boolean }) {
  const n = realNumbers()
  const kmAway = Math.round(n.sizeIn50 * 100) / 1000
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the graph, how big the universe gets.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is <strong>time, counted from now</strong>, in billions of years. 0 is today. To the right is the future, up to 100 billion years from now. To the left of 0 is the past, back to 10 billion years ago, as this model works it out.
        </li>
        <li>
          Up the side is <strong>the universe&rsquo;s size, compared with today</strong>: the distances between faraway galaxies. 1× means the same as today, 2× means every such distance has doubled, and 0.5× would mean they were half as far apart. The dashed vertical line marked &ldquo;today&rdquo; is where the size is 1×.
        </li>
        <li>
          <strong>Why the side axis jumps by 10 each step.</strong> The marks go 0.1×, 1×, 10×, 100×, 1000×. On an ordinary scale, going from 1× to 2× would be a tiny step beside going from 1× to 1000×, and you could not see both. On this scale every doubling is the same height, whether it is from 1× to 2× or from 100× to 200×. That gives you a simple way to read a line: a <strong>straight</strong> line means each doubling takes the same time as the one before; a line that <strong>bends toward flat</strong> means each doubling takes longer than the one before; a line that <strong>bends upward</strong> means each takes less time.
        </li>
        <li>
          The <strong style={{ color: REAL_COLOR }}>gold line</strong> is the real universe, with about 70 percent dark energy. The <strong style={{ color: REFERENCE_COLOR }}>blue dashed line</strong> is the same universe with no dark energy at all, for comparison. Both pass through 1× at &ldquo;today&rdquo;, because every universe here is set up to match the real one today.
        </li>
        <li>
          The <strong>white dot</strong> is where the universe is right now during the run. The <strong style={{ color: MARK_COLOR }}>green dot</strong> marks the moment the expansion changed from slowing down to speeding up. &ldquo;Speeding up&rdquo; here means the speed at which faraway galaxies move apart gets larger and larger; the results explain why that is not the same as the expansion rate rising.
        </li>
        <li>
          When you press <strong>Run</strong>, watch for about 10 seconds. The motion is drawn to help you notice the growth; it is not a movie of real history, but the numbers are exact.
        </li>
        {arrived && (
          <>
            <li>
              <strong>The white curve</strong> is your guess for guess 1. It is only a sketch of a shape (flat, bending toward flat, or bending upward). Where it ends on the page means nothing as a size.
            </li>
            <li>
              <strong>A worked moment.</strong> A universe that is {Math.round(n.sizeIn50)}× its size today in 50 billion years has doubled a little more than 4 times (2 × 2 × 2 × 2 = 16, with a bit more on top). A galaxy that is 100 million light-years away today would then be about {kmAway.toFixed(1)} billion light-years away.
            </li>
          </>
        )}
      </ul>
      {arrived && (
        <LookFor
          items={[
            {
              look: 'the gold line to the right of "today"',
              means: `on this axis it runs close to a straight line: the universe is about ${Math.round(n.sizeIn50)} times its size today after 50 billion years and about ${Math.round(n.sizeIn100)} times after 100 billion.`,
              matters: 'this is the picture your first guess was about.',
            },
            {
              look: 'the blue dashed line, against the gold line',
              means: `with no dark energy the same universe would be only about ${n.noneIn50.toFixed(1)} times its size after 50 billion years and ${n.noneIn100.toFixed(1)} times after 100, and its line bends toward flat.`,
              matters: 'it shows how much the amount of dark energy changes the future; why is for the tutor.',
            },
            {
              look: 'the green dot',
              means: `in this model the expansion changed from slowing down to speeding up about ${n.speedUpYearsAgo.toFixed(1)} billion years ago.`,
              matters: 'it shows that the real universe has already been through both stages.',
            },
            {
              look: 'the white curve',
              means: 'it shows the shape you guessed, beside the real line.',
              matters: 'you can compare at a glance; the tutor goes through your guess.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function BarsCaption({ arrived }: { arrived: boolean }) {
  const n = realNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the bars, how long each doubling takes.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          There are four bars, one for each doubling of the universe&rsquo;s size: first from today&rsquo;s size to twice that (1× → 2×), then 2× → 4×, then 4× → 8×, then 8× → 16×. The <strong>length of a bar is the time that doubling takes</strong>, in billions of years, on the scale at the bottom (0 to 80, the same every time, so bars from different runs can be compared). A bar that would run past 80 is cut at the edge with a zigzag mark, and its real length is written inside it, as &ldquo;(off the scale)&rdquo;.
        </li>
        <li>A longer bar means a slower doubling. Look down the four bars: are they getting longer, staying about the same, or getting shorter?</li>
        <li>
          The <strong style={{ color: MARK_COLOR }}>green dashed line</strong>, when it appears, marks the value the doubling time settles toward once the universe is very large. The <strong>white outline</strong> on a bar marks the doubling the universe is in at this moment of the run.
        </li>
        {arrived && (
          <>
            <li>
              <strong>The white bar</strong> under the second bar is your guess for guess 2. Its length follows your guess: 5, 11 or 30 billion years.
            </li>
            <li>
              <strong>A worked moment.</strong> If the first bar is {billions(n.doublings[0])} billion years, then {billions(n.doublings[0])} billion years from now every distance between faraway galaxies will be twice what it is today, and about {billions(n.doublings[1])} billion years after that, four times.
            </li>
          </>
        )}
      </ul>
      {arrived && (
        <LookFor
          items={[
            {
              look: 'the four bars, one against the next',
              means: `they take ${n.doublings.map((y) => billions(y)).join(', ')} billion years, nearly equal.`,
              matters: 'this is what a steady growth looks like; whether dark energy is the cause is for the tutor.',
            },
            {
              look: 'the second bar (2× → 4×), against your white bar',
              means: `the real second doubling takes ${billions(n.doublings[1])} billion years; your white bar shows what you guessed.`,
              matters: 'this is the number your second guess was about.',
            },
            {
              look: 'the green dashed line',
              means: `the doubling time settles toward about ${billions(n.settled)} billion years.`,
              matters: 'it shows that the growth does not keep slowing down or speeding up without end; why is for the tutor.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function YourGraphCaption({ share }: { share: number }) {
  const r = runFateOfTheUniverseExperiment(share)
  const pct = Math.round(share * 100)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: your universe&rsquo;s graph.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          The same graph as Picture 1, with the same axes and the same <strong style={{ color: REFERENCE_COLOR }}>blue dashed</strong> no-dark-energy line, but the <strong style={{ color: YOUR_COLOR }}>pink line</strong> is <strong>your</strong> universe, with the dark energy share you chose ({pct}%).
        </li>
        <li>
          The <strong style={{ color: MARK_COLOR }}>green dot</strong>, when it appears, marks where your universe&rsquo;s expansion starts speeding up. It is in the past for 70% and 90%, in the future for 30%, and never for 0%. If you choose 0%, the pink line is drawn on top of the blue one and the legend says so. Both lines pass through 1× at &ldquo;today&rdquo;.
        </li>
        <li>
          Here, with {pct}%: the size is <strong>{formatSize(futureRelativeSize(50e9, share))}×</strong> in 50 billion years and <strong>{formatSize(r.sizeAtEnd)}×</strong> in 100 billion.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'your pink line, against the blue dashed line',
            means: 'the more dark energy, the higher your line climbs and the less it bends toward flat.',
            matters: 'it shows how the amount of dark energy decides the future.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function YourBarsCaption({ share }: { share: number }) {
  const r = runFateOfTheUniverseExperiment(share)
  const none = noDarkEnergyUniverse()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: your universe&rsquo;s bars.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          The same bars as Picture 2, for your universe, in <strong style={{ color: YOUR_COLOR }}>pink</strong>: the time for each of the four doublings, on the same 0 to 80 scale. With no dark energy there is no settled value, and the picture says so instead of drawing a line. A bar longer than the scale is cut with a zigzag mark and its real length is written inside.
        </li>
        <li>
          Here, your four doublings take <strong>{r.doublings.map((d) => billions(d.years)).join(', ')} billion years</strong>.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the bars, one against the next',
            means: `with dark energy they are nearly equal; with none, each is about 2.8 times the one before (${none.doublings.map((d) => Math.round(d.years / 1e9)).join(', ')} billion years).`,
            matters: 'the bars are the quickest way to see whether the growth is steady.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function StripCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the galaxy strip.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>What is drawn.</strong> A row of galaxies. The <strong style={{ color: CLUSTER_COLOR }}>blue dots</strong> on the left are our own home cluster: the Milky Way and its neighbors. The <strong style={{ color: YOUR_COLOR }}>pink ovals</strong> are three faraway galaxies, A, B and C.
        </li>
        <li>
          <strong>What it shows.</strong> As the run plays, the faraway galaxies move farther from our cluster and from each other, as the space between them stretches. But our cluster stays the same size: it is held together by its own gravity, which is far stronger than the stretching at that scale. Think of dots drawn on a rubber sheet that is being stretched: the dots stay the same size, but the distances between them grow. (Like any comparison, this is not exact: in the real universe, the stretching is not a sheet being pulled from outside.)
        </li>
        <li>
          <strong>This drawing is not to scale.</strong> The line of text under the title gives the real number: how many times larger the spacing between groups is than today. That number is exact. The drawing shows it in a squeezed way, adding the same step for each doubling, so that it still fits on the screen.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the blue cluster and the pink galaxies',
            means: 'the cluster stays the same size while the spaces between groups grow.',
            matters: 'it shows that what expands is the space between groups, not the groups.',
          },
        ]}
      />
    </CaptionBox>
  )
}
