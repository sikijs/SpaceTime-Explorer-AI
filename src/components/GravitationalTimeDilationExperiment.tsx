import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  runGravitationalTimeDilationExperiment,
  tickCountAt,
  actualOutcome as moduleActualOutcome,
  guessMarkerFor,
  tickAxisTop,
  PRESET_TICK_AXIS_TOP,
  workedNumbers,
  ceilingTicksPerFloorTick,
  RUN_DURATION_FLOOR_SECONDS as MODULE_RUN_DURATION_FLOOR_SECONDS,
} from '../physics/gravitationalTimeDilationExperiment'
import type { GravitationalTimeDilationExperimentResult, PredictionChoice } from '../physics/gravitationalTimeDilationExperiment'
import { GravitationalTimeDilationTutor } from './GravitationalTimeDilationTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Gravity and Curved Spacetime, Experiment 2, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 02-draft-wording.md, approved by the owner on 2026-11-12 "all approved"): the page in four Parts, labels and a legend on the graph, a
// white ring marker for the guess, Drawing A, a words box, a links list held back until after the tutor, Start over and a tutor that
// points to the marker. Every number drawn comes from the physics module (src/physics/gravitationalTimeDilationExperiment.ts; §9).

export type { PredictionChoice }

type StrengthPreset = 0.1 | 0.3 | 0.6 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

interface GravitationalTimeDilationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// How much floor-clock time the run covers. A presentation choice (the model has no natural stopping point). It lives in the physics
// module and is re-exported here so Experiment 5 (What Curves Spacetime?) can reuse the same fixed run duration.
export const RUN_DURATION_FLOOR_SECONDS = MODULE_RUN_DURATION_FLOOR_SECONDS
const ANIMATION_DURATION_MS = 3000

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const FLOOR_COLOR = '#818cf8' // indigo: the floor clock (solid)
const CEILING_COLOR = '#f59e0b' // amber: the ceiling clock (dashed)
const REFERENCE_COLOR = '#9ca3af' // grey: Part 1's ceiling line, for comparison

// Part 1 uses strength 0.3, the preset the page has always opened on; Part 2 lets the learner choose another.
const PART1_STRENGTH = 0.3
const PART1_RESULT = runGravitationalTimeDilationExperiment(PART1_STRENGTH)

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'sameRate', label: 'The same rate' },
  { value: 'differentRates', label: 'Different rates' },
]

// Ceiling and floor clocks always share the physics model's single formula, so the ceiling clock always ticks faster for any valid
// strength (the outcome comes from the module).
export const actualOutcome = moduleActualOutcome

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

// Exported so Experiment 5 (What Curves Spacetime?) can reuse this rendering unchanged,
// fed a strength derived from mass and distance instead of a learner-picked one.
export function RocketCabinClocks({ ceilingTicks, floorTicks }: { ceilingTicks: number; floorTicks: number }) {
  return (
    <div className="exp-card" style={{ padding: '1rem', maxWidth: '260px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#f59e0b' }}>Ceiling clock</p>
        <p style={{ fontSize: '0.8rem', margin: 0 }}>
          Ticks: <strong>{ceilingTicks.toFixed(2)}</strong>
        </p>
      </div>
      <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#4f46e5' }}>Floor clock</p>
        <p style={{ fontSize: '0.8rem', margin: 0 }}>
          Ticks: <strong>{floorTicks.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  )
}

// A run's playback: only presentation. The result comes from the physics module and never depends on this.
function useRun(onFinish?: (result: GravitationalTimeDilationExperimentResult) => void) {
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<GravitationalTimeDilationExperimentResult | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running' || !result) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // Clamped: a browser's first rAF callback can report a timestamp earlier than the performance.now() captured above.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setElapsed(progress * RUN_DURATION_FLOOR_SECONDS)
      if (progress >= 1) {
        setStatus('complete')
        finishRef.current?.(result)
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  const start = useCallback((runResult: GravitationalTimeDilationExperimentResult) => {
    setResult(runResult)
    setElapsed(0)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setElapsed(0)
    setResult(null)
  }, [])
  return { status, elapsed, result, start, reset }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Page fetched on 12 November 2026 (see the audit's draft wording, section 2). It is neutral: it explains how a clock keeps time and
// says nothing about gravity, height or relativity, so it can be linked from the start (§12).
const START_LINKS = [
  {
    href: 'https://www.jpl.nasa.gov/news/what-is-an-atomic-clock/',
    label: 'NASA JPL: "What Is an Atomic Clock?"',
    what: 'a plain explanation of how a clock keeps time by counting beats, and why spacecraft navigators need clocks that stay precise. It uses everyday comparisons and doesn’t assume any physics. (NASA Jet Propulsion Laboratory; 19 June 2019.)',
  },
  {
    href: 'https://www.nist.gov/atomic-clocks/how-do-atomic-clocks-work',
    label: 'NIST: "How Do Atomic Clocks Work?"',
    what: 'a plain account of how a clock is built from something that ticks steadily plus a counter, and why atoms make the steadiest ticks. No equations. (NIST; created 22 August 2024, updated 21 August 2026.)',
  },
]

// Page fetched on 12 November 2026. It says what the experiment is about, so it appears only after the tutor's explanation (§12).
const AFTER_LINKS = [
  {
    href: 'https://www.nasa.gov/image-article/einsteins-theory-of-relativity-critical-gps-seen-distant-stars/',
    label: 'NASA: "Einstein’s Theory of Relativity, Critical For GPS, Seen In Distant Stars"',
    what: 'a short NASA article on a real measurement: astronomers saw gravity stretching light from a pair of stars about 29,000 light-years away, the same effect that GPS engineers must allow for so that your phone’s position is right. (NASA, from the Chandra X-ray Observatory; 22 October 2020.)',
  },
  {
    href: 'https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test',
    label: 'NIST: "Putting Einstein to the Test"',
    what: 'a plain account of how atomic clocks have tested this on aircraft, satellites and in the lab, and why GPS satellite clocks must be corrected for it. It names the size of the GPS correction: about 38 millionths of a second per day. (NIST; created 3 April 2025, updated 17 April 2025.)',
  },
]

// The "Words and formulas" box. Its numbers come from the physics module (§9). Nothing in it shows the answer to the prediction.
// 1.0904e-15 -> "1.09×10⁻¹⁵"
function scientific(n: number): string {
  const exponent = Math.floor(Math.log10(n))
  const mantissa = (n / 10 ** exponent).toFixed(2)
  const sup = String(Math.abs(exponent))
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
    .join('')
  return `${mantissa}×10${exponent < 0 ? '⁻' : ''}${sup}`
}

function referenceEntries(): { term: string; meaning: string }[] {
  const w = workedNumbers()
  return [
    {
      term: 'Tick',
      meaning:
        'one beat of a clock, like one “tock” of a ticking clock. The more beats a clock counts in the same stretch of time, the faster it is running.',
    },
    {
      term: 'Floor clock / ceiling clock',
      meaning:
        'the two identical clocks fixed to the floor and to the ceiling of the rocket cabin. The floor clock is the yardstick: it counts one tick per second of its own time.',
    },
    { term: 'Rocket cabin', meaning: 'a closed box with a rocket pushing it, so its speed keeps growing, as in Experiment 1.' },
    {
      term: 'Strength',
      meaning: `a plain number (no unit) that combines how hard the rocket pushes and how far apart the clocks are, like a volume knob for this experiment’s effect. Bigger means stronger. Real rockets and buildings have a strength far too small to see, so the values here are exaggerated. For example, 1g with clocks 10 m apart gives about ${scientific(w.realStrength1g10m)}, while this page uses 0.3 in Part 1.`,
    },
    {
      term: 'Frequency ratio',
      meaning: `the fraction 1 − strength. It tells you how many ticks the floor clock counts for each tick the ceiling clock counts. At strength 0.3 the ratio is ${PART1_RESULT.frequencyRatio.toFixed(2)}: for every tick at the ceiling, the floor counts ${PART1_RESULT.frequencyRatio.toFixed(2)}.`,
    },
    {
      term: 'First-order',
      meaning:
        'a simplified version of the real physics that keeps the biggest effect and ignores tiny corrections. This experiment uses it, not the full exact treatment.',
    },
    {
      term: 'Redshift',
      meaning:
        'a wave arriving stretched out, spread over a little more time than it was sent in. The name comes from visible light, where a stretched light wave shifts toward red. The tutor explains it after your run.',
    },
    { term: 'Gravitational time dilation', meaning: 'the name for what the tutor explains after your run.' },
    {
      term: 'Graph (curve, line)',
      meaning: 'a picture of how one number changes as another does. Here each line shows one clock’s tick count at each moment.',
    },
    {
      term: 'Formulas (the ones this page uses)',
      meaning: `floor ticks = time on the floor clock, in seconds. Ceiling ticks = floor ticks ÷ (1 − strength). Worked example from this page: at strength 0.3, after ${w.floorTotal} seconds the floor clock has counted ${w.floorTotal} ticks, and the ceiling clock ${w.floorTotal} ÷ (1 − 0.3) = ${w.floorTotal} ÷ 0.70 = ${w.ceilingTotalAt0p3.toFixed(2)} ticks. At strength 0.6: ${w.floorTotal} ÷ 0.40 = ${w.ceilingTotalAt0p6.toFixed(2)} ticks.`,
    },
  ]
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

function WhereFrom({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> {children}
    </p>
  )
}

function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: GUESS_COLOR,
        backgroundColor: '#0b1020',
        border: `1px solid ${GUESS_COLOR}`,
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

// ---- the graphs ----
type Geo = { width: number; height: number; left: number; right: number; top: number; bottom: number }

// Part 1's graph has a tall top band so that the YOUR GUESS box sits above the plot and never covers a line. The right margin holds
// the labels written beside the line ends.
const G1: Geo = { width: 640, height: 340, left: 64, right: 130, top: 96, bottom: 54 }
// Drawing A has two rows of legend above the plot.
const GA: Geo = { width: 640, height: 320, left: 64, right: 150, top: 64, bottom: 54 }
const SAMPLE_COUNT = 24

function Legend({ items, rowHeight = 18 }: { items: Array<{ color: string; dashed?: boolean; text: string; x: number; row?: number }>; rowHeight?: number }) {
  return (
    <>
      {items.map((item) => {
        const y = 18 + (item.row ?? 0) * rowHeight
        return (
          <g key={item.text}>
            <line
              x1={item.x}
              y1={y}
              x2={item.x + 30}
              y2={y}
              stroke={item.color}
              strokeWidth={item.dashed ? 2 : 3}
              strokeDasharray={item.dashed ? '6 4' : undefined}
              strokeLinecap="round"
            />
            <text x={item.x + 36} y={y + 4} fontSize="12" fill={TEXT_COLOR}>
              {item.text}
            </text>
          </g>
        )
      })}
    </>
  )
}

function fmtTicks(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function Axes({
  g,
  axisTop,
  labelTicks,
  timeTicks,
}: {
  g: Geo
  axisTop: number
  labelTicks: number[]
  timeTicks: number[]
}) {
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const xFor = (t: number) => g.left + (t / RUN_DURATION_FLOOR_SECONDS) * plotW
  const yFor = (ticks: number) => g.top + (1 - ticks / axisTop) * plotH
  return (
    <>
      <line x1={g.left} y1={g.top} x2={g.left} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={g.left} y1={g.height - g.bottom} x2={g.width - g.right} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {labelTicks.map((v) => (
        <g key={v}>
          <line x1={g.left - 4} y1={yFor(v)} x2={g.left} y2={yFor(v)} stroke={MUTED_COLOR} />
          <text x={g.left - 8} y={yFor(v) + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="end">
            {fmtTicks(v)}
          </text>
        </g>
      ))}
      {timeTicks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={g.height - g.bottom} x2={xFor(t)} y2={g.height - g.bottom + 5} stroke={MUTED_COLOR} />
          <text x={xFor(t)} y={g.height - g.bottom + 24} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
            {t} s
          </text>
        </g>
      ))}
      <text x={(g.left + g.width - g.right) / 2} y={g.height - 8} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Time on the floor clock (s)
      </text>
      <text
        x={14}
        y={(g.top + g.height - g.bottom) / 2}
        fontSize="12"
        fill={TEXT_COLOR}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(g.top + g.height - g.bottom) / 2})`}
      >
        Ticks counted
      </text>
    </>
  )
}

// Part 1's graph: both lines come from tickCountAt with the same result, so the gap between them is the model's own. The lines draw
// themselves in step with the clocks. Once both are fully drawn, the white ring marks the guess at the line ends, the same place for
// either guess (a yes or no has no size of its own).
export function Part1Graph({
  result,
  revealUpToFloorSeconds,
  complete,
  guess,
}: {
  result: GravitationalTimeDilationExperimentResult
  revealUpToFloorSeconds: number
  complete: boolean
  guess: PredictionChoice | null
}) {
  const g = G1
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const revealed = Math.min(Math.max(revealUpToFloorSeconds, 0), RUN_DURATION_FLOOR_SECONDS)
  const maxTicks = tickCountAt(result, RUN_DURATION_FLOOR_SECONDS, 'ceiling')
  const floorEnd = tickCountAt(result, RUN_DURATION_FLOOR_SECONDS, 'floor')
  const count = Math.max(1, Math.round(SAMPLE_COUNT * (revealed / RUN_DURATION_FLOOR_SECONDS)))
  const xFor = (t: number) => g.left + (t / RUN_DURATION_FLOOR_SECONDS) * plotW
  const yFor = (ticks: number) => g.top + (1 - ticks / maxTicks) * plotH
  const pathFor = (clock: 'floor' | 'ceiling') =>
    Array.from({ length: count + 1 }, (_, i) => {
      const t = (i / count) * revealed
      return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(tickCountAt(result, t, clock)).toFixed(1)}`
    }).join(' ')

  const marker = guess ? guessMarkerFor(result, guess) : null
  const endX = xFor(RUN_DURATION_FLOOR_SECONDS)
  const floorY = yFor(floorEnd)
  const ceilingY = yFor(maxTicks)
  const ringCy = (floorY + ceilingY) / 2
  const ringRy = (floorY - ceilingY) / 2 + 12
  const [boxHead, boxTail] = marker ? marker.boxText.split(': ') : ['', '']
  const boxW = 330
  const boxH = 44
  const boxX = g.width - 16 - boxW
  const boxY = 34

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label="Graph of tick count over time for the floor clock and the ceiling clock. The ceiling clock's line rises faster."
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: FLOOR_COLOR, text: 'Floor clock: solid indigo line', x: g.left },
          { color: CEILING_COLOR, dashed: true, text: 'Ceiling clock: dashed amber line', x: g.left + 230 },
        ]}
      />
      <Axes g={g} axisTop={maxTicks} labelTicks={[0, floorEnd, maxTicks]} timeTicks={[0, 5, RUN_DURATION_FLOOR_SECONDS]} />
      <path d={pathFor('floor')} fill="none" stroke={FLOOR_COLOR} strokeWidth={3} strokeLinecap="round" />
      <path d={pathFor('ceiling')} fill="none" stroke={CEILING_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      {!complete && revealed < RUN_DURATION_FLOOR_SECONDS && (
        <>
          <circle cx={xFor(revealed)} cy={yFor(tickCountAt(result, revealed, 'floor'))} r={5} fill={FLOOR_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={xFor(revealed)} cy={yFor(tickCountAt(result, revealed, 'ceiling'))} r={5} fill={CEILING_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        </>
      )}
      {complete && (
        <>
          <text x={endX + 22} y={floorY + 4} fontSize="12" fontWeight="bold" fill={FLOOR_COLOR}>
            Floor clock
          </text>
          <text x={endX + 22} y={ceilingY + 4} fontSize="12" fontWeight="bold" fill={CEILING_COLOR}>
            Ceiling clock
          </text>
        </>
      )}
      {complete && marker && (
        <g>
          <line x1={endX} y1={boxY + boxH} x2={endX} y2={ringCy - ringRy} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <ellipse cx={endX} cy={ringCy} rx={12} ry={ringRy} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
          <text x={boxX + 10} y={boxY + 18} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {boxHead}:
          </text>
          <text x={boxX + 10} y={boxY + 35} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {boxTail}
          </text>
        </g>
      )}
      <text x={g.left + plotW / 2} y={g.top - 8} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
        strength {result.strength}
      </text>
    </svg>
  )
}

// Spreads labels written beside the line ends so that two close totals (for example 10.00 and 11.11) do not overprint.
function spreadLabels(ys: number[], minGap: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 1; k < order.length; k++) {
    if (order[k].y - order[k - 1].y < minGap) order[k].y = order[k - 1].y + minGap
  }
  const out = [...ys]
  order.forEach((o) => (out[o.i] = o.y))
  return out
}

// Part 2's Drawing A: the floor line (the same for every strength) in indigo, the ceiling line for the learner's strength in pink,
// and Part 1's ceiling line (strength 0.3) in grey for comparison. The tick axis is fixed (0 to 25 for the presets) so a stronger
// setting gives a visibly steeper line.
export function DrawingA({ result }: { result: GravitationalTimeDilationExperimentResult }) {
  const g = GA
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const axisTop = tickAxisTop(result.strength)
  const xFor = (t: number) => g.left + (t / RUN_DURATION_FLOOR_SECONDS) * plotW
  const yFor = (ticks: number) => g.top + (1 - ticks / axisTop) * plotH
  const pathFor = (r: GravitationalTimeDilationExperimentResult, clock: 'floor' | 'ceiling') =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
      const t = (i / SAMPLE_COUNT) * RUN_DURATION_FLOOR_SECONDS
      return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(tickCountAt(r, t, clock)).toFixed(1)}`
    }).join(' ')

  const floorEnd = tickCountAt(result, RUN_DURATION_FLOOR_SECONDS, 'floor')
  const yoursEnd = tickCountAt(result, RUN_DURATION_FLOOR_SECONDS, 'ceiling')
  const refEnd = tickCountAt(PART1_RESULT, RUN_DURATION_FLOOR_SECONDS, 'ceiling')
  const sameAsRef = Math.abs(yoursEnd - refEnd) < 0.005
  const labelYs = spreadLabels([yFor(floorEnd), yFor(yoursEnd), yFor(refEnd)], 14)
  const endX = xFor(RUN_DURATION_FLOOR_SECONDS)
  const labelTicks = axisTop > PRESET_TICK_AXIS_TOP ? [0, axisTop / 2, axisTop] : [0, 5, 10, 15, 20, 25]

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label={`Drawing A: tick count over time. The floor clock's line is the same for every strength. The ceiling clock's line for your strength, ${result.strength}, is pink, and Part 1's ceiling line, at strength ${PART1_STRENGTH}, is grey.`}
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        rowHeight={20}
        items={[
          { color: FLOOR_COLOR, text: 'Floor clock: solid indigo line', x: g.left, row: 0 },
          { color: YOURS_COLOR, dashed: true, text: `Ceiling clock, your strength ${result.strength}: dashed pink`, x: g.left + 230, row: 0 },
          { color: REFERENCE_COLOR, dashed: true, text: `Ceiling clock, strength ${PART1_STRENGTH}, from Part 1: thin grey`, x: g.left, row: 1 },
        ]}
      />
      <Axes g={g} axisTop={axisTop} labelTicks={labelTicks} timeTicks={[0, 5, RUN_DURATION_FLOOR_SECONDS]} />
      {!sameAsRef && (
        <path d={pathFor(PART1_RESULT, 'ceiling')} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />
      )}
      <path d={pathFor(result, 'floor')} fill="none" stroke={FLOOR_COLOR} strokeWidth={3} strokeLinecap="round" />
      <path d={pathFor(result, 'ceiling')} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} strokeDasharray="6 4" strokeLinecap="round" />
      <text x={endX + 10} y={labelYs[0] + 4} fontSize="12" fontWeight="bold" fill={FLOOR_COLOR}>
        Floor: {fmtTicks(floorEnd)}
      </text>
      <text x={endX + 10} y={labelYs[1] + 4} fontSize="12" fontWeight="bold" fill={YOURS_COLOR}>
        Ceiling: {fmtTicks(yoursEnd)}
      </text>
      {!sameAsRef && (
        <text x={endX + 10} y={labelYs[2] + 4} fontSize="11" fill={REFERENCE_COLOR}>
          Part 1: {fmtTicks(refEnd)}
        </text>
      )}
    </svg>
  )
}

// ---- captions ----
function CaptionBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-muted)',
      }}
    >
      {children}
    </div>
  )
}

function LookFor({ items }: { items: Array<{ look: string; means: string; matters: string }> }) {
  return (
    <>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </>
  )
}

const listStyle = { marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' } as const

export function Part1Caption() {
  const w = workedNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What you see.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>The two boxes</strong> (Ceiling clock and Floor clock) show each clock&rsquo;s tick count so far, as the run goes on.
          A <strong>tick</strong> is one beat of a clock.
        </li>
        <li>
          <strong>The graph</strong> draws itself while the clocks run. Up the side is the number of ticks counted, from 0 to the
          ceiling clock&rsquo;s total after {w.floorTotal} seconds. Along the bottom is time on the floor clock, from 0 to {w.floorTotal}{' '}
          seconds. A point on a line says how many ticks that clock had counted at that moment.
        </li>
        <li>
          <strong>The solid indigo line</strong> is the floor clock. It counts one tick per second, so it climbs steadily: 5 ticks at 5
          seconds, {w.floorTotal} at {w.floorTotal} seconds. <strong>The dashed amber line</strong> is the ceiling clock. If the two clocks
          ticked at the same rate, the amber dashes would lie along the indigo line.
        </li>
        <li>
          <strong>The white ring and the YOUR GUESS box</strong> are your guess, drawn once both lines are drawn. The ring is in the
          same place whatever you guessed, because a yes or no has no size; it is only a marker, and it never moves the lines.
        </li>
        <li>
          <strong>Strength 0.3</strong> is the number used for this run (explained in the introduction). It is exaggerated so that the
          effect can be seen.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At {w.momentSeconds} seconds the floor clock has counted {w.momentFloorTicks.toFixed(2)} ticks.
        The ceiling clock has counted {w.momentSeconds} ÷ (1 − 0.3) = {w.momentSeconds} ÷ 0.70 = {w.momentCeilingTicks.toFixed(2)} ticks.
        Both numbers can be read from the lines at {w.momentSeconds} s.
      </p>
      <LookFor
        items={[
          {
            look: 'the solid indigo line and the dashed amber line.',
            means: 'each shows one clock’s tick count at every moment.',
            matters: 'it lets you compare the clocks at every moment and not only at the end.',
          },
          {
            look: `the right end of the two lines, at ${w.floorTotal} s.`,
            means: `it shows each clock’s total after ${w.floorTotal} seconds of the floor clock’s time: ${w.floorTotal.toFixed(2)} ticks for the floor clock and ${w.ceilingTotalAt0p3.toFixed(2)} for the ceiling clock in this run.`,
            matters: 'it gives you two numbers to compare, taken over the same stretch of time.',
          },
          {
            look: 'the white ring and your YOUR GUESS box.',
            means: 'it marks the place on the graph where the answer to your guess can be read: the two line ends.',
            matters: 'it shows where to look to compare what you expected with what was drawn.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function DrawingACaption() {
  const w = workedNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read Drawing A.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>The graph</strong> works as in Part 1, with the same {w.floorTotal}-second time scale and, for the three preset
          strengths, the same 0 to {PRESET_TICK_AXIS_TOP} tick scale, so you can compare runs.
        </li>
        <li>
          <strong>The indigo line</strong> is the floor clock. It does not change with the strength, so it is the same in every run.{' '}
          <strong>The pink dashed line</strong> is the ceiling clock for the strength you chose. <strong>The grey dashed line</strong> is
          the ceiling clock from Part 1, for comparison.
        </li>
        <li>
          <strong>&ldquo;Runs so far&rdquo;</strong> lists every run in this Part.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At strength 0.6 the ceiling clock counts {w.floorTotal} ÷ 0.40 = {w.ceilingTotalAt0p6.toFixed(2)}{' '}
        ticks in {w.floorTotal} seconds, against {w.ceilingTotalAt0p3.toFixed(2)} at strength 0.3, so the pink line climbs more
        steeply than the grey one.
      </p>
      <LookFor
        items={[
          {
            look: 'how far the pink line ends above the grey one (or below it, for 0.1).',
            means: `a bigger strength makes a bigger gap between the two clocks (0.1: ${w.ceilingTotalAt0p1.toFixed(2)} ticks; 0.3: ${w.ceilingTotalAt0p3.toFixed(2)}; 0.6: ${w.ceilingTotalAt0p6.toFixed(2)}, against ${w.floorTotal.toFixed(2)} for the floor clock).`,
            matters: 'it shows that the size of the gap follows the strength, and that the floor clock’s line stays put.',
          },
        ]}
      />
    </CaptionBox>
  )
}

const PRESETS = [0.1, 0.3, 0.6] as const

export function GravitationalTimeDilationExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalTimeDilationExperimentProps) {
  const [predictionChoice, setPredictionChoice] = useState<PredictionChoice | null>(null)
  const [submittedPrediction, setSubmittedPrediction] = useState<PredictionChoice | null>(null)
  const [preset, setPreset] = useState<StrengthPreset>(0.6)
  const [customStrength, setCustomStrength] = useState('')
  const [part2Runs, setPart2Runs] = useState<GravitationalTimeDilationExperimentResult[]>([])
  const [explained, setExplained] = useState(false)

  // The completion mark is saved when Part 1's run ends. Part 2 does not call it.
  const part1 = useRun(() => onComplete?.())
  const part2 = useRun((r) => setPart2Runs((runs) => [...runs, r]))

  const locked = submittedPrediction !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const selectedStrength = preset === 'other' ? parseFloat(customStrength) || 0 : preset
  const isValidStrength = selectedStrength >= 0.05 && selectedStrength <= 0.9

  const hasAnythingToClear = predictionChoice !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const part1Ceiling = part1.result ? tickCountAt(part1.result, part1.elapsed, 'ceiling') : 0
  const part1Floor = part1.result ? tickCountAt(part1.result, part1.elapsed, 'floor') : 0
  const part2Ceiling = part2.result ? tickCountAt(part2.result, part2.elapsed, 'ceiling') : 0
  const part2Floor = part2.result ? tickCountAt(part2.result, part2.elapsed, 'floor') : 0

  const handleRun = () => {
    if (predictionChoice === null || locked) return
    setSubmittedPrediction(predictionChoice)
    setPredictionChoice(null)
    part1.start(PART1_RESULT)
  }

  const handlePart2 = () => {
    if (!isValidStrength || part1Running || part2Running) return
    part2.start(runGravitationalTimeDilationExperiment(selectedStrength))
  }

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionChoice(null)
    setSubmittedPrediction(null)
    setPreset(0.6)
    setCustomStrength('')
    setPart2Runs([])
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const choiceShown = submittedPrediction ?? predictionChoice
  const part1Totals = {
    floor: tickCountAt(PART1_RESULT, RUN_DURATION_FLOOR_SECONDS, 'floor'),
    ceiling: tickCountAt(PART1_RESULT, RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Does Gravity Change Time?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Experiment 1 you saw that a ball falls the same way whether you&rsquo;re sitting still
            under gravity or accelerating through empty space. Now let&rsquo;s ask about clocks instead of balls: if two clocks sit at
            different heights in that same accelerating rocket, do they tick at the same rate?
          </p>
          <p style={paragraph}>
            <strong>Why even ask this.</strong> In everyday life we take it for granted that a clock on your kitchen counter and a
            clock on a high shelf tick at the same rate. This experiment checks that, by applying Experiment 1&rsquo;s finding, that
            gravity and acceleration can&rsquo;t be told apart from inside a closed cabin, to clocks instead of a falling ball.
          </p>
          <p style={paragraph}>
            <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
            coloured heading. In Part 1 you make a guess and watch the experiment. In Part 2 you try it with a strength of your own.
            Part 3 shows the results, and Part 4 is the tutor, who talks it over with you.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> The same rocket cabin from before, this time with one clock fixed to the floor and one fixed
            to the ceiling. As the rocket accelerates, we count how many ticks each clock registers. A <strong>tick</strong> is one beat
            of a clock, like one &ldquo;tock&rdquo; of a ticking clock. The floor clock is our yardstick: it ticks once for every second
            of its own time, so after 10 seconds it has counted 10 ticks. In Part 1 the strength is 0.3 (explained below). In Part 2
            you choose another strength and run it again.
          </p>
          <p style={paragraph}>
            <strong>What &ldquo;strength&rdquo; means.</strong> Strength is one number that stands in for two things at once: how
            hard the rocket pushes (its acceleration), and how far apart the two clocks are (how tall the cabin is). Think of a volume
            knob: the higher the number, the stronger the effect this experiment looks at. A gentle push on a short cabin gives a small
            strength. A hard push on a very tall cabin gives a large one. (To get the real number you multiply the push by the
            distance and divide by the speed of light squared. You don&rsquo;t need to do that here. You just pick a number.) Strength
            has no unit. It is a plain number between 0 and 1.
          </p>
          <p style={paragraph}>
            A real rocket pushing at 1g, with the two clocks 10 metres apart, has a strength of about{' '}
            {scientific(workedNumbers().realStrength1g10m)}. That is roughly one part in a thousand million million, far too small to
            see. So this page uses values from 0.05 to 0.9 on purpose. They are exaggerated so that you can watch the effect. Part 1
            uses 0.3, and in Part 2 you choose your own.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press the button, predict whether the two clocks will tick at the same rate or at
            different rates. Then watch both clocks and compare how many ticks each one registers, try other strengths in Part 2, and
            talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the clocks or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the graph in white, in a box
            labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the strength you choose does change the clocks and
            the graph, and the line it moves is pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning:
            tick, strength, frequency ratio, floor clock, ceiling clock, rocket cabin, first-order, redshift, gravitational time
            dilation, graph.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              This experiment uses a simplified, first-order version of the real physics, not the full exact treatment.
            </li>
            <li>
              Both clocks are identical and sit in the same cabin, one at the floor and one at the ceiling, and the rocket&rsquo;s push
              is steady.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Two plain-language pages from official sources are listed here. Checked on 12 November
            2026. Each link opens in a new tab. Another page, about what the clocks do, is held back because it would answer the question
            you are asked to predict. It appears below the tutor&rsquo;s explanation. This page uses no measured result, so there is no
            research paper to cite for it.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {START_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you guess whether the floor clock and the ceiling clock will tick at the same rate or at different rates. Then you press
          &ldquo;Start the clocks&rdquo; and watch both for 10 seconds at strength 0.3. A graph draws itself as they tick, with your guess
          marked on it in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Two identical clocks sit in the same accelerating rocket, one at the floor and one at the ceiling, with a strength of 0.3.
            Do you think they will tick at the same rate, or at different rates?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {predictionChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionChoice(choice.value)}
                disabled={locked || part1Running}
                className={`toggle-button${choiceShown === choice.value ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: locked || part1Running ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: locked || part1Running ? 0.6 : 1,
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked
              ? `Your prediction: ${labelFor(submittedPrediction!)}. Your prediction is locked while you try other strengths. To change it, press Start over.`
              : predictionChoice
                ? `Your prediction: ${labelFor(predictionChoice)}`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={part1Running || part2Running || locked || predictionChoice === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'Start the clocks'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {predictionChoice === null && !locked && <p style={smallNote}>Choose an option above to press &ldquo;Start the clocks&rdquo;.</p>}

        <Block>
          <RocketCabinClocks ceilingTicks={part1Ceiling} floorTicks={part1Floor} />
        </Block>

        {part1.status !== 'idle' && part1.result ? (
          <Block>
            <Part1Graph
              result={part1.result}
              revealUpToFloorSeconds={part1Done ? RUN_DURATION_FLOOR_SECONDS : part1.elapsed}
              complete={part1Done}
              guess={submittedPrediction}
            />
            {part1Done ? (
              <>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> each clock&rsquo;s tick count at every moment,
                  from one formula (ceiling ticks = floor ticks ÷ (1 − strength)), with a strength of 0.3 that is far larger than any real
                  rocket or building could have. The two lines are the same formula with the same strength, so the gap between them, or
                  its absence, is built into the model: this page does not measure real clocks. <strong>Imagined for the question:</strong>{' '}
                  the rocket cabin and the idealised, simplified model. The white ring is only your guess.
                </WhereFrom>
                <Part1Caption />
              </>
            ) : (
              <p style={smallNote}>The graph draws itself as the clocks tick. Your guess will be marked on it when the run has finished.</p>
            )}
          </Block>
        ) : (
          <p style={smallNote}>
            After you press &ldquo;Start the clocks&rdquo;, a graph of each clock&rsquo;s tick count will draw itself here as they tick.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a different strength and run the clocks again. The strength you choose changes the clocks and Drawing A in
              this Part, with the ceiling line in pink. It does not change Part 1&rsquo;s picture, the results in Part 3, or your guess.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Strength (used for both clocks)</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setPreset(s)}
                    disabled={part2Running}
                    className={`toggle-button${preset === s ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setPreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${preset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {preset === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.05"
                    max="0.9"
                    step="0.01"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter strength (0.05-0.9)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected strength: <strong>{isValidStrength ? selectedStrength : '— (a number from 0.05 to 0.9)'}</strong>
              </p>
              <p style={smallNote}>Your guess does not change these drawings, but the strength you choose does.</p>
              <button
                type="button"
                onClick={handlePart2}
                disabled={!isValidStrength || part2Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Start the clocks with your strength'}
              </button>
            </div>

            <Block>
              {part2.result && (
                <p style={{ ...smallNote, textAlign: 'center', color: YOURS_COLOR, fontWeight: 'bold' }}>
                  your strength: {part2.result.strength}
                </p>
              )}
              <RocketCabinClocks ceilingTicks={part2Ceiling} floorTicks={part2Floor} />
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <DrawingA result={lastPart2} />
                {tickAxisTop(lastPart2.strength) > PRESET_TICK_AXIS_TOP && (
                  <p style={smallNote}>
                    This strength gives a ceiling total above {PRESET_TICK_AXIS_TOP} ticks, so the tick axis has been stretched to{' '}
                    {tickAxisTop(lastPart2.strength)} to fit it.
                  </p>
                )}
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> each clock&rsquo;s tick count at every moment,
                  from the same formula as in Part 1, for the strength you chose, which is far larger than any real rocket or building
                  could have. Both lines use it, so the gap between them is built into the model. <strong>Imagined for the question:</strong>{' '}
                  the rocket cabin and the idealised, simplified model. The grey line is Part 1&rsquo;s calculation, kept for comparison.
                </WhereFrom>
                <DrawingACaption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      Strength {run.strength}: the ceiling clock counted {tickCountAt(run, RUN_DURATION_FLOOR_SECONDS, 'ceiling').toFixed(2)}{' '}
                      ticks and the floor clock {tickCountAt(run, RUN_DURATION_FLOOR_SECONDS, 'floor').toFixed(2)}, after{' '}
                      {RUN_DURATION_FLOOR_SECONDS} seconds
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose a strength and press &ldquo;Start the clocks with your strength&rdquo;; Drawing A for your value will
                appear here.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess marked beside them. Nothing in this Part changes with your guess or
              with the strength you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Strength:</strong> {PART1_RESULT.strength} (frequency ratio: {PART1_RESULT.frequencyRatio.toFixed(2)})
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: '#f59e0b' }}>Ceiling clock ticks (after {RUN_DURATION_FLOOR_SECONDS} s):</strong>{' '}
                {part1Totals.ceiling.toFixed(2)}
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s graph as the white marker.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: '#4f46e5' }}>Floor clock ticks (after {RUN_DURATION_FLOOR_SECONDS} s):</strong>{' '}
                {part1Totals.floor.toFixed(2)}
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s graph as the white marker.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                The ceiling clock counted {ceilingTicksPerFloorTick(PART1_RESULT).toFixed(2)} ticks for every 1 tick the floor clock
                counted.
              </p>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from one formula, with an exaggerated strength; not measured (see
              the caption under the graph). Nothing here changes with your guess or with the strength you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submittedPrediction !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white marker on the graph, then explains.
            </PartHeader>
            <GravitationalTimeDilationTutor
              predictionChoice={submittedPrediction}
              result={PART1_RESULT}
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> These pages say what the experiment was about, so they
                  were held back until now. Checked on 12 November 2026. Each link opens in a new tab.
                </p>
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                  {AFTER_LINKS.map((link) => (
                    <li key={link.href}>
                      <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
