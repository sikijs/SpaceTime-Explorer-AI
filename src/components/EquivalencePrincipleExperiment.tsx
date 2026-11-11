import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  runEquivalencePrincipleExperiment,
  ballHeightAboveFloorAt,
  EARTH_GRAVITY,
  actualOutcome as moduleActualOutcome,
  guessMarkerFor,
  fixedTimeScaleEndSeconds,
  heightOnFixedScaleAt,
  fallTimeWorkedNumbers,
} from '../physics/equivalencePrincipleExperiment'
import type { EquivalencePrincipleExperimentResult, PredictionChoice } from '../physics/equivalencePrincipleExperiment'
import { EquivalencePrincipleTutor } from './EquivalencePrincipleTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Gravity and Curved Spacetime, Experiment 1, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 01-draft-wording.md, approved by the owner on 2026-11-11 "with defaults"): the page in four Parts, labels on the cabins and the
// graph, a white ring marker for the guess, Drawing A on a fixed time scale, a words box, links, Start over and a tutor that points
// to the marker. Every number drawn comes from the physics module (src/physics/equivalencePrincipleExperiment.ts; CLAUDE.md §9).

export type { PredictionChoice }

const INITIAL_HEIGHT_METERS = 2
const CABIN_HEIGHT_PX = 220
const BALL_SIZE_PX = 20
const ANIMATION_MS = 2000
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const CABIN_A_COLOR = '#818cf8' // indigo: Cabin A (solid)
const CABIN_B_COLOR = '#f59e0b' // amber: Cabin B (dashed)
const YOURS_LIGHT_COLOR = '#f9a8d4' // light pink: Cabin B in Part 2's own acceleration (dashed)
const REFERENCE_COLOR = '#9ca3af' // grey: the 1g curve from Part 1, for comparison

// Part 1 uses 1g, the preset the page has always opened on; Part 2 lets the learner choose another.
const PART1_RESULT = runEquivalencePrincipleExperiment(1 * EARTH_GRAVITY, INITIAL_HEIGHT_METERS)

type AccelerationPreset = 0.5 | 1 | 2 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'differently', label: 'Differently' },
  { value: 'sameWay', label: 'The same way' },
]

// Both scenes always call the same physics formula with the same inputs (see equivalencePrincipleExperiment.ts), so the ball
// moves the same way in both, for any acceleration.
export const actualOutcome = moduleActualOutcome

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

interface EquivalencePrincipleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// A drop's playback: only presentation. The result comes from the physics module and never depends on this.
function useDrop(onFinish?: (result: EquivalencePrincipleExperimentResult) => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<EquivalencePrincipleExperimentResult | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running' || !result) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // Clamped on both sides: a first animation frame can report a time slightly before startTime.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_MS, 0), 1)
      setElapsed(progress * result.timeToFloorSeconds)
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

  const start = useCallback((runResult: EquivalencePrincipleExperimentResult) => {
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

// Pages fetched on 11 November 2026 (see the audit's draft wording, section 2). The first is linked from the start. The others say
// what the experiment is about and what real experiments found, so they appear only after the tutor's explanation (§12).
const START_LINKS = [
  {
    href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/free-fall-without-air-resistance/',
    label: 'NASA Glenn: "Free Fall without Air Resistance"',
    what: 'a plain explanation of g: with no air, every object falls with the same acceleration, 9.8 metres per second every second at Earth’s surface. (NASA Glenn Research Center, Beginner’s Guide to Aeronautics; page dated 18 July 2024.)',
  },
]

const AFTER_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spotlight/equivalence_principle/',
    label: 'Einstein Online: "The elevator, the rocket, and gravity: the equivalence principle"',
    what: 'the cabin-and-rocket idea explained with an elevator and a rocket, and why nothing inside a closed room can tell the two apart. It ends with tidal effects, which this page leaves out. (Max Planck Institute for Gravitational Physics, by Markus Pössel; no date shown.)',
  },
  {
    href: 'https://arxiv.org/abs/2209.15487',
    label: 'MICROSCOPE mission: final results of the test of the Equivalence Principle',
    what: 'the real test: a satellite compared how two different metals fall in orbit for two and a half years, and found no difference at the level of about one part in a thousand million million (1 in 10^15). This is the paper’s abstract page; the full paper is a technical one. (Touboul and colleagues, Physical Review Letters 129, 121102, 2022; submitted to arXiv on 30 September 2022.)',
  },
  {
    href: 'https://www.imperial.ac.uk/news/239852/satellite-mission-confirms-cornerstone-general-relativity/',
    label: 'Imperial College London: "Satellite mission confirms cornerstone of general relativity is unshakeable"',
    what: 'a plain account of the same MICROSCOPE result, for a reader with no physics background. (A university news page, 20 September 2022, not a space-agency page.)',
  },
  {
    href: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html',
    label: 'NASA: "Apollo 15 Hammer-Feather Drop"',
    what: 'the short account of a hammer and a feather dropped together on the Moon in 1971, where there is no air, and landing at the same moment. (NASA Space Science Data Coordinated Archive; page updated 31 March 2023.)',
  },
]

// The "Words and formulas" box. Its numbers come from the physics module (CLAUDE.md §9). Nothing in it shows the answer to the
// prediction.
function referenceEntries(): { term: string; meaning: string }[] {
  const w = fallTimeWorkedNumbers()
  return [
    { term: 'Sealed cabin', meaning: 'a closed box with no windows, so the only thing you can watch is what happens inside it.' },
    {
      term: 'Acceleration',
      meaning:
        'how fast something’s speed is changing. A car that goes from 0 to 10 m/s in 2 seconds is accelerating at 5 metres per second, every second.',
    },
    {
      term: 'Metres per second squared (m/s²)',
      meaning: 'the unit of acceleration. 9.8 m/s² means the speed grows by 9.8 metres per second in each second.',
    },
    { term: 'g', meaning: 'the acceleration of a dropped object near Earth’s ground, 9.8 m/s². 2g is twice that and 0.5g half.' },
    { term: 'Height above the floor', meaning: 'how far the ball is above the floor of its cabin, in metres. Here it starts at 2 m.' },
    { term: 'Elapsed time', meaning: 'the time since the ball was released, in seconds.' },
    {
      term: 'Graph (curve)',
      meaning: 'a picture of how one number changes as another does. Here the curve shows the ball’s height at each moment.',
    },
    {
      term: 'Equivalence principle',
      meaning: 'the idea this chapter’s first experiment is named for; the tutor explains it after your run.',
    },
    {
      term: 'Formulas (the ones this page uses)',
      meaning: `height at time t = start height − ½ × acceleration × t². Time to reach the floor = √(2 × start height ÷ acceleration). Worked example from this page: at 1g (9.8 m/s²) from 2 m: √(2 × 2 ÷ 9.8) = √0.408 = ${w.oneGFallSeconds.toFixed(2)} seconds. At 2g (19.6 m/s²): √(2 × 2 ÷ 19.6) = √0.204 = ${w.twoGFallSeconds.toFixed(2)} seconds.`,
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

// Each cabin is labelled on the picture: the ball and the floor. Which cabin is which is explained only in the introduction, so
// that the picture does not give away that the two are the same (the specification's reason).
export function Cabin({ label, height, pinkNote }: { label: string; height: number; pinkNote?: string }) {
  const fraction = height / INITIAL_HEIGHT_METERS
  const ballTopPx = (1 - fraction) * (CABIN_HEIGHT_PX - BALL_SIZE_PX)

  return (
    <div style={{ flex: '1 1 220px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: pinkNote ? '0.1rem' : '0.5rem' }}>{label}</p>
      {pinkNote && <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', fontWeight: 'bold', color: YOURS_COLOR }}>{pinkNote}</p>}
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${CABIN_HEIGHT_PX}px`,
          width: '160px',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${ballTopPx}px`,
            transform: 'translateX(-50%)',
            width: `${BALL_SIZE_PX}px`,
            height: `${BALL_SIZE_PX}px`,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: `calc(50% + ${BALL_SIZE_PX / 2 + 4}px)`,
            top: `${ballTopPx + 3}px`,
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          ball
        </span>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: '3px solid var(--text-muted)',
            textAlign: 'left',
            paddingLeft: '0.4rem',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          floor
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Height above floor: <strong>{height.toFixed(2)} m</strong>
      </p>
    </div>
  )
}

// ---- the graphs ----
const G = { width: 600, height: 300, left: 64, right: 40, top: 44, bottom: 54 }
// Part 1's graph has a taller top band, so that the YOUR GUESS box sits above the plot and never covers a line.
const G1 = { ...G, height: 340, top: 96 }
const SAMPLE_COUNT = 40

function Legend({ items }: { items: Array<{ color: string; dashed?: boolean; text: string; x: number }> }) {
  return (
    <>
      {items.map((item) => (
        <g key={item.text}>
          <line
            x1={item.x}
            y1={18}
            x2={item.x + 30}
            y2={18}
            stroke={item.color}
            strokeWidth={item.dashed ? 2 : 3}
            strokeDasharray={item.dashed ? '6 4' : undefined}
            strokeLinecap="round"
          />
          <text x={item.x + 36} y={22} fontSize="12" fill={TEXT_COLOR}>
            {item.text}
          </text>
        </g>
      ))}
    </>
  )
}

type Geo = { width: number; height: number; left: number; right: number; top: number; bottom: number }

function Axes({ g: G, timeEnd, ticks }: { g: Geo; timeEnd: number; ticks: number[] }) {
  const plotW = G.width - G.left - G.right
  const plotH = G.height - G.top - G.bottom
  const xFor = (t: number) => G.left + (t / timeEnd) * plotW
  const yFor = (h: number) => G.top + (1 - h / INITIAL_HEIGHT_METERS) * plotH
  return (
    <>
      <line x1={G.left} y1={G.top} x2={G.left} y2={G.height - G.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={G.left} y1={G.height - G.bottom} x2={G.width - G.right} y2={G.height - G.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={G.left} y1={yFor(1)} x2={G.width - G.right} y2={yFor(1)} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="3 4" opacity={0.6} />
      {[0, 1, 2].map((h) => (
        <text key={h} x={G.left - 8} y={yFor(h) + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="end">
          {h} m
        </text>
      ))}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={G.height - G.bottom} x2={xFor(t)} y2={G.height - G.bottom + 5} stroke={MUTED_COLOR} />
          <text x={xFor(t)} y={G.height - G.bottom + 24} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
            {t === timeEnd ? t.toFixed(2) : +t.toFixed(2)} s
          </text>
        </g>
      ))}
      <text x={(G.left + G.width - G.right) / 2} y={G.height - 8} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Time since release (s)
      </text>
      <text
        x={14}
        y={(G.top + G.height - G.bottom) / 2}
        fontSize="12"
        fill={TEXT_COLOR}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(G.top + G.height - G.bottom) / 2})`}
      >
        Height above the floor (m)
      </text>
    </>
  )
}

// Part 1's graph: both cabins' lines come from the same ballHeightAboveFloorAt call, so they are the same polyline drawn twice. The
// line draws itself in step with the falling ball. Once the whole graph is drawn, the white ring marks the guess at the end of the
// lines, the same place for either guess (a yes or no has no size of its own).
export function Part1Graph({
  result,
  revealUpToSeconds,
  complete,
  guess,
}: {
  result: EquivalencePrincipleExperimentResult
  revealUpToSeconds: number
  complete: boolean
  guess: PredictionChoice | null
}) {
  const plotW = G1.width - G1.left - G1.right
  const plotH = G1.height - G1.top - G1.bottom
  const T = result.timeToFloorSeconds
  const revealed = Math.min(Math.max(revealUpToSeconds, 0), T)
  const count = Math.max(1, Math.round(SAMPLE_COUNT * (revealed / T)))
  const xFor = (t: number) => G1.left + (t / T) * plotW
  const yFor = (h: number) => G1.top + (1 - h / INITIAL_HEIGHT_METERS) * plotH
  const pathD = Array.from({ length: count + 1 }, (_, i) => {
    const t = (i / count) * revealed
    return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(ballHeightAboveFloorAt(result, t)).toFixed(1)}`
  }).join(' ')

  const marker = guess ? guessMarkerFor(result, guess) : null
  const ringX = marker ? G1.left + marker.fractionAlongTime * plotW : 0
  const ringY = marker ? G1.top + marker.fractionDown * plotH : 0
  const [boxHead, boxTail] = marker ? marker.boxText.split(': ') : ['', '']
  const boxW = 330
  const boxH = 44
  const boxX = G1.width - 16 - boxW
  const boxY = 34

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${G1.width} ${G1.height}`}
      role="img"
      aria-label="Graph of the ball's height above the floor over time, drawn for Cabin A and Cabin B. The two lines are the same line."
      style={{ ...svgStyle, width: '100%', maxWidth: `${G1.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: CABIN_A_COLOR, text: 'Cabin A: solid indigo line', x: G1.left },
          { color: CABIN_B_COLOR, dashed: true, text: 'Cabin B: dashed amber line', x: G1.left + 230 },
        ]}
      />
      <Axes g={G1} timeEnd={T} ticks={[0, T]} />
      <path d={pathD} fill="none" stroke={CABIN_A_COLOR} strokeWidth={3} strokeLinecap="round" />
      <path d={pathD} fill="none" stroke={CABIN_B_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      {!complete && revealed < T && (
        <circle cx={xFor(revealed)} cy={yFor(ballHeightAboveFloorAt(result, revealed))} r={5} fill={CABIN_A_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      )}
      {complete && marker && (
        <g>
          <line x1={ringX} y1={boxY + boxH} x2={ringX} y2={ringY - 10} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <circle cx={ringX} cy={ringY} r={10} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
          <text x={boxX + 10} y={boxY + 18} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {boxHead}:
          </text>
          <text x={boxX + 10} y={boxY + 35} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {boxTail}
          </text>
        </g>
      )}
    </svg>
  )
}

// Part 2's Drawing A: one time scale for every acceleration (fixedTimeScaleEndSeconds), so a different acceleration gives a visibly
// different line. The learner's acceleration is pink; Part 1's 1g line stays in grey for comparison.
export function DrawingA({
  result,
  accelerationLabel,
}: {
  result: EquivalencePrincipleExperimentResult
  accelerationLabel: string
}) {
  const timeEnd = fixedTimeScaleEndSeconds()
  const plotW = G.width - G.left - G.right
  const plotH = G.height - G.top - G.bottom
  const xFor = (t: number) => G.left + (t / timeEnd) * plotW
  const yFor = (h: number) => G.top + (1 - h / INITIAL_HEIGHT_METERS) * plotH
  const pathFor = (r: EquivalencePrincipleExperimentResult) =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
      const t = (i / SAMPLE_COUNT) * r.timeToFloorSeconds
      return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(heightOnFixedScaleAt(r, t)).toFixed(1)}`
    }).join(' ')
  const floorY = yFor(0)

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${G.width} ${G.height}`}
      role="img"
      aria-label={`Drawing A: the ball's height over time at your acceleration, ${accelerationLabel}, in pink, and Part 1's 1g line in grey, on a fixed time scale from 0 to ${timeEnd} seconds.`}
      style={{ ...svgStyle, width: '100%', maxWidth: `${G.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: YOURS_COLOR, text: `Cabins A and B, ${accelerationLabel}: solid pink, dashed light pink`, x: G.left },
          { color: REFERENCE_COLOR, text: '1g, from Part 1', x: G.left + 400 },
        ]}
      />
      <Axes g={G} timeEnd={timeEnd} ticks={[0, 0.5, 1, 1.5, 2]} />
      <path d={pathFor(PART1_RESULT)} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeLinecap="round" />
      <path d={pathFor(result)} fill="none" stroke={YOURS_COLOR} strokeWidth={3} strokeLinecap="round" />
      <path d={pathFor(result)} fill="none" stroke={YOURS_LIGHT_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <circle cx={xFor(PART1_RESULT.timeToFloorSeconds)} cy={floorY} r={4} fill={REFERENCE_COLOR} />
      <circle cx={xFor(result.timeToFloorSeconds)} cy={floorY} r={5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <text x={xFor(result.timeToFloorSeconds) - 9} y={floorY - 8} fontSize="12" fontWeight="bold" fill={YOURS_COLOR} textAnchor="end">
        {result.timeToFloorSeconds.toFixed(2)} s
      </text>
      <text x={xFor(PART1_RESULT.timeToFloorSeconds) + 9} y={floorY - 8} fontSize="11" fill={REFERENCE_COLOR} textAnchor="start">
        1g: {PART1_RESULT.timeToFloorSeconds.toFixed(2)} s
      </text>
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
  const w = fallTimeWorkedNumbers()
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
          <strong>The two cabins</strong> show the same moment in two different situations. Each has a ball (the round blob) 2 metres
          above its floor at the start; the number under each cabin is the ball&rsquo;s height above the floor right now.
        </li>
        <li>
          <strong>Cabin A and Cabin B</strong> are the two situations described in the introduction. The ball&rsquo;s height is drawn
          the same way in both, so you can compare them directly.
        </li>
        <li>
          <strong>The graph</strong> draws itself as the ball falls. Up the side is the ball&rsquo;s height above the floor, from 2 m
          at the top to 0 m (the floor) at the bottom. Along the bottom is the time since release. A point on a line says how high
          the ball was at that moment.
        </li>
        <li>
          <strong>The solid indigo line</strong> is Cabin A&rsquo;s ball. <strong>The dashed amber line</strong> is Cabin B&rsquo;s
          ball. If the two lines lie exactly on top of each other, you see the amber dashes along the indigo line.
        </li>
        <li>
          <strong>The time at the right end</strong> of the bottom axis is when the ball reaches the floor.
        </li>
        <li>
          <strong>The white ring and the YOUR GUESS box</strong> are your guess, drawn once both lines are drawn. The ring is in the
          same place whatever you guessed, because a yes or no has no size; it is only a marker, and it never moves the lines.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At 1g the ball needs {w.oneGFallSeconds.toFixed(2)} seconds to fall 2 metres. Halfway
        through, at {w.halfwayTimeSeconds.toFixed(2)} seconds, its height is 2 − ½ × 9.8 × {w.halfwayTimeSeconds.toFixed(2)}² = 2 −{' '}
        {(2 - w.halfwayHeightMeters).toFixed(2)} = {w.halfwayHeightMeters.toFixed(2)} metres. Both lines show{' '}
        {w.halfwayHeightMeters.toFixed(2)} m at {w.halfwayTimeSeconds.toFixed(2)} s.
      </p>
      <LookFor
        items={[
          {
            look: 'the solid indigo line and the dashed amber line.',
            means: 'each shows the height of one cabin’s ball at every moment.',
            matters: 'it lets you compare the two cabins’ balls at every moment and not only at the end.',
          },
          {
            look: 'the time at the right end of the bottom axis.',
            means: `it is how long the ball takes to reach the floor, ${w.oneGFallSeconds.toFixed(2)} seconds in this run.`,
            matters: 'it gives you one number to compare between the two cabins.',
          },
          {
            look: 'the white ring and your YOUR GUESS box.',
            means: 'it marks the place on the graph where the answer to your guess can be read: the end of the two lines.',
            matters: 'it shows where to look to compare what you expected with what was drawn.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function DrawingACaption() {
  const w = fallTimeWorkedNumbers()
  const half = runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, INITIAL_HEIGHT_METERS)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read Drawing A.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>The graph</strong> works as in Part 1, but the bottom scale is fixed at {fixedTimeScaleEndSeconds()} seconds, so you
          can compare runs. In Part 1 the scale stretched to fit the fall.
        </li>
        <li>
          <strong>Pink</strong> marks your own acceleration. <strong>The grey line</strong> is the 1g fall from Part 1, for comparison.
        </li>
        <li>
          <strong>&ldquo;Runs so far&rdquo;</strong> lists every drop in this Part.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At 2g the ball reaches the floor after {w.twoGFallSeconds.toFixed(2)} seconds, sooner than
        the {w.oneGFallSeconds.toFixed(2)} seconds at 1g, so the pink line reaches 0 m earlier.
      </p>
      <LookFor
        items={[
          {
            look: 'where the pink line meets the bottom (0 m) compared with the grey one.',
            means: `a stronger acceleration makes the ball reach the floor sooner (2g: ${w.twoGFallSeconds.toFixed(2)} s; 0.5g: ${half.timeToFloorSeconds.toFixed(2)} s).`,
            matters:
              'it shows that the time to the floor depends on the acceleration, and, in the same drawing, that it is the same in both cabins whatever acceleration you choose.',
          },
        ]}
      />
    </CaptionBox>
  )
}

const PRESETS = [0.5, 1, 2] as const

export function EquivalencePrincipleExperiment({ onComplete, onTutorComplete }: EquivalencePrincipleExperimentProps) {
  const [predictionChoice, setPredictionChoice] = useState<PredictionChoice | null>(null)
  const [submittedPrediction, setSubmittedPrediction] = useState<PredictionChoice | null>(null)
  const [preset, setPreset] = useState<AccelerationPreset>(2)
  const [customG, setCustomG] = useState('')
  const [part2Runs, setPart2Runs] = useState<EquivalencePrincipleExperimentResult[]>([])
  const [explained, setExplained] = useState(false)

  // The completion mark is saved when Part 1's drop ends. Part 2 does not call it.
  const part1 = useDrop(() => onComplete?.())
  const part2 = useDrop((r) => setPart2Runs((runs) => [...runs, r]))

  const locked = submittedPrediction !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const selectedG = preset === 'other' ? parseFloat(customG) || 0 : preset
  const isValidG = selectedG > 0 && selectedG <= 5

  const hasAnythingToClear = predictionChoice !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const height1 = part1.result ? ballHeightAboveFloorAt(part1.result, Math.min(part1.elapsed, part1.result.timeToFloorSeconds)) : INITIAL_HEIGHT_METERS
  const height2 = part2.result ? ballHeightAboveFloorAt(part2.result, Math.min(part2.elapsed, part2.result.timeToFloorSeconds)) : INITIAL_HEIGHT_METERS

  const handleDrop = () => {
    if (predictionChoice === null || locked) return
    setSubmittedPrediction(predictionChoice)
    setPredictionChoice(null)
    part1.start(PART1_RESULT)
  }

  const handlePart2 = () => {
    if (!isValidG || part1Running || part2Running) return
    part2.start(runEquivalencePrincipleExperiment(selectedG * EARTH_GRAVITY, INITIAL_HEIGHT_METERS))
  }

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionChoice(null)
    setSubmittedPrediction(null)
    setPreset(2)
    setCustomG('')
    setPart2Runs([])
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const choiceShown = submittedPrediction ?? predictionChoice

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — The Equivalence Principle</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine you&rsquo;re sealed inside a windowless cabin — no windows, no way to look
            outside. You drop a ball. Could you tell, just from watching the ball fall, whether your cabin is sitting still on a
            planet, or racing through empty space with a rocket pushing it?
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> When a car accelerates forward, you feel pressed back into your seat, almost as if
            an invisible hand were pushing you backward. Nothing outside the car is touching you; you feel a push because the
            car&rsquo;s speed is changing. This experiment looks at a push like that more carefully: not for your own body, but for a
            dropped ball, inside two sealed cabins side by side.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Cabin A sits on the ground, where gravity pulls the ball down. Cabin B is in deep space,
            far from any planet — nothing is pulling on it — but a rocket engine is pushing the cabin (and its floor) forward at a
            steady rate. In both cabins, someone drops a ball and we watch how it moves relative to the floor. In Part 1 both cabins
            use the pull of Earth&rsquo;s gravity at the ground, called 1g (explained below). In Part 2 you choose a different value
            and drop the ball again.
          </p>
          <p style={paragraph}>
            <strong>What 1g means.</strong> g is the size of Earth&rsquo;s gravity at the ground. A ball dropped near the ground speeds
            up by 9.8 metres per second (about 22 miles per hour) in every second it falls. So after 1 second it moves at 9.8 m/s, and
            after 2 seconds at 19.6 m/s. We write this 9.8 m/s² and call it <strong>1g</strong>. 2g is twice as much, and 0.5g is half
            as much. In Cabin B the rocket makes the floor speed up at the same rate, so the same number is used for both cabins.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press the button, predict whether the ball will move differently in the two cabins
            or the same way. Then watch both cabins and compare how the ball moves in each one, try other values in Part 2, and talk
            it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the cabins or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the graph in white, in a
            box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the acceleration you choose does change the
            cabins and the graph, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            sealed cabin, acceleration, g, metres per second squared, height above the floor, elapsed time, graph, equivalence
            principle.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Both cabins are idealized: no air, a single small ball, and a steady push or pull the whole time.</li>
            <li>
              In Cabin A, gravity pulls equally hard at every height inside the cabin, which is true to a very good approximation for
              a small cabin near a planet&rsquo;s surface. In both cabins the ball starts at rest, 2 metres above the floor, relative
              to its own cabin.
            </li>
            <li>
              This experiment doesn&rsquo;t use anything about light or moving clocks from earlier chapters — it&rsquo;s about gravity
              and acceleration, a fresh starting point.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> A plain-language page from an official source is listed here. Checked on 11 November
            2026. Each link opens in a new tab. More pages, about the idea behind this experiment and the real tests of it, appear
            below the tutor&rsquo;s explanation.
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
          First you guess whether the ball will move differently in the two cabins or the same way. Then you press &ldquo;Drop the
          ball&rdquo; and watch both cabins at 1g. A graph draws itself as the ball falls, with your guess marked on it in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Both cabins start with the ball 2 metres above the floor, and both use 1g. If you were sealed inside each cabin and
            dropped a ball, do you think the ball would move differently in the two cabins, or exactly the same way?
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
              ? `Your prediction: ${labelFor(submittedPrediction!)}. Your prediction is locked while you try other accelerations. To change it, press Start over.`
              : predictionChoice
                ? `Your prediction: ${labelFor(predictionChoice)}`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDrop}
          disabled={part1Running || part2Running || locked || predictionChoice === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'Drop the ball'}
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
        {predictionChoice === null && !locked && <p style={smallNote}>Choose an option above to press &ldquo;Drop the ball&rdquo;.</p>}

        <Block>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Cabin label="Cabin A" height={height1} />
            <Cabin label="Cabin B" height={height1} />
          </div>
          <p style={{ ...smallNote, textAlign: 'center' }}>
            Each cabin shows its ball and its floor. The number under a cabin is the ball&rsquo;s height above its floor right now.
          </p>
        </Block>

        {part1.status !== 'idle' && part1.result ? (
          <Block>
            <Part1Graph
              result={part1.result}
              revealUpToSeconds={part1Done ? part1.result.timeToFloorSeconds : part1.elapsed}
              complete={part1Done}
              guess={submittedPrediction}
            />
            {part1Done ? (
              <>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the ball&rsquo;s height at every moment, from
                  one formula (height = 2 m − ½ × acceleration × time²), used for both cabins, so the two lines are the same
                  calculation drawn twice. Because of that, they agree by construction: this page does not test whether real balls
                  behave this way. <strong>Imagined for the question:</strong> the two sealed cabins, which are an idealised thought
                  experiment with no air and a steady push or pull. The white ring is only your guess.
                </WhereFrom>
                <Part1Caption />
              </>
            ) : (
              <p style={smallNote}>The graph draws itself as the ball falls. Your guess will be marked on it when the ball has landed.</p>
            )}
          </Block>
        ) : (
          <p style={smallNote}>
            After you press &ldquo;Drop the ball&rdquo;, a graph of the ball&rsquo;s height will draw itself here as it falls.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a different acceleration and drop the ball again. The value you choose changes the cabins and Drawing A in
              this Part, marked in pink. It does not change Part 1&rsquo;s picture, the results in Part 3, or your guess.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Acceleration (used for both cabins)
              </label>
              <div style={{ marginBottom: '0.75rem' }}>
                {PRESETS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setPreset(g)}
                    disabled={part2Running}
                    className={`toggle-button${preset === g ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {g}g
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
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={customG}
                    onChange={(e) => setCustomG(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter g (0.1-5)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected acceleration:{' '}
                <strong>{isValidG ? `${selectedG}g (${(selectedG * EARTH_GRAVITY).toFixed(2)} m/s²)` : '— (a number from 0.1 to 5)'}</strong>
              </p>
              <p style={smallNote}>Your guess does not change these drawings, but the acceleration you choose does.</p>
              <button
                type="button"
                onClick={handlePart2}
                disabled={!isValidG || part2Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Drop with your acceleration'}
              </button>
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Cabin
                  label="Cabin A"
                  height={height2}
                  pinkNote={part2.result ? `your acceleration: ${part2.result.accelerationInG}g` : undefined}
                />
                <Cabin
                  label="Cabin B"
                  height={height2}
                  pinkNote={part2.result ? `your acceleration: ${part2.result.accelerationInG}g` : undefined}
                />
              </div>
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <DrawingA result={lastPart2} accelerationLabel={`${lastPart2.accelerationInG}g`} />
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the ball&rsquo;s height at every moment, from
                  the same formula as in Part 1, for the acceleration you chose. Both cabins use it, so the two lines agree by
                  construction. <strong>Imagined for the question:</strong> the two sealed cabins. The grey line is Part 1&rsquo;s 1g
                  calculation, kept for comparison.
                </WhereFrom>
                <DrawingACaption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.accelerationInG}g ({run.accelerationMetersPerSecondSquared.toFixed(2)} m/s²): the ball reaches the floor after{' '}
                      {run.timeToFloorSeconds.toFixed(2)} s, in both cabins
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose an acceleration and press &ldquo;Drop with your acceleration&rdquo;; Drawing A for your value will
                appear here.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 drop, with your guess marked beside them. Nothing in this Part changes with your
              guess or with the acceleration you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Acceleration:</strong> {PART1_RESULT.accelerationInG}g ({PART1_RESULT.accelerationMetersPerSecondSquared.toFixed(2)}{' '}
                m/s²)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time for the ball to reach the floor:</strong> {PART1_RESULT.timeToFloorSeconds.toFixed(2)} s — the same in both
                cabins.
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s graph as the white marker.
                </span>
              </p>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from one formula, not measured (see the caption under the
              graph). Nothing here changes with your guess or with the acceleration you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submittedPrediction !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white marker on the graph, then explains.
            </PartHeader>
            <EquivalencePrincipleTutor
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
                  <strong>More to read, now that you have the explanation.</strong> These pages say what the experiment was about and
                  what real experiments found, so they were held back until now. Checked on 11 November 2026. Each link opens in a new
                  tab.
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
