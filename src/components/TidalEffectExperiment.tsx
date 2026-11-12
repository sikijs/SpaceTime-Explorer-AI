import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  runTidalEffectExperiment,
  ballPositionsAt,
  separationAt,
  finalSeparationMeters,
  actualOutcomeFor as moduleActualOutcomeFor,
  guessMarkerFor,
  SEPARATION_AXIS_TOP_METERS,
  fixedTimeScaleEndSeconds,
  workedNumbers,
  EARTH_GRAVITY,
} from '../physics/tidalEffectExperiment'
import type { TidalEffectExperimentResult, TidalEffectScene, PredictionChoice } from '../physics/tidalEffectExperiment'
import { TidalEffectTutor } from './TidalEffectTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { Arrow, arrowLengthPx } from './EquivalencePrincipleExperiment'

// Gravity and Curved Spacetime, Experiment 3, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/03-draft-wording.md,
// approved by the owner on 2026-11-12 "all approved"): the page in four Parts, labelled cabins and graph, two white ring markers for
// the two guesses, Drawing A on a fixed time scale, a words box, links, Start over and a tutor that marks both guesses. Every number
// drawn comes from the physics module (src/physics/tidalEffectExperiment.ts; CLAUDE.md §9). `Cabin` and the INITIAL_* constants
// below are unchanged: Experiment 5 (What Curves Spacetime?) re-uses them.

export type { PredictionChoice }

type AccelerationPreset = 0.5 | 1 | 2 | 'other'
type StrengthPreset = 0.1 | 0.3 | 0.6 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// Exported so Experiment 5 can reuse the same fixed initial conditions, per the
// specification's "leave Experiments 2 and 3 completely unchanged" decision.
export const INITIAL_HEIGHT_METERS = 2
export const INITIAL_SEPARATION_METERS = 1
const CABIN_HEIGHT_PX = 220
const CABIN_WIDTH_PX = 160
const BALL_SIZE_PX = 16
const HORIZONTAL_PX_PER_METER = 60
const ANIMATION_DURATION_MS = 2000

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const PLANET_COLOR = '#818cf8' // indigo: the planet cabin (solid)
const ROCKET_COLOR = '#f59e0b' // amber: the rocket cabin (dashed)
const YOURS_LIGHT_COLOR = '#f9a8d4' // light pink: the rocket cabin in Part 2's own settings (dashed)
const REFERENCE_COLOR = '#9ca3af' // grey: Part 1's planet line, for comparison
const GRAVITY_ARROW_COLOR = '#16a34a' // green: gravity's pull on the balls in the planet cabin
const ROCKET_ARROW_COLOR = '#dc2626' // red: the rocket's push on the cabin
const LEFT_BALL_COLOR = '#0d9488'
const RIGHT_BALL_COLOR = '#e11d48'

// Part 1 uses 1g and strength 0.3, the presets the page has always opened on; Part 2 lets the learner choose others.
const PART1_RESULT = runTidalEffectExperiment(EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, 0.3)
const run = (g: number, strength: number) =>
  runTidalEffectExperiment(g * EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, strength)

interface TidalEffectExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'converge', label: "They'll drift together" },
  { value: 'same', label: "They'll stay the same distance apart" },
  { value: 'apart', label: "They'll drift apart" },
]

// Both scenes always call the same physics formulas (see tidalEffectExperiment.ts): the planet scene converges for any valid
// strength, and the rocket scene never does (the outcome comes from the module).
export const actualOutcomeFor = moduleActualOutcomeFor

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

// Exported so Experiment 5 (What Curves Spacetime?) can reuse this rendering unchanged,
// fed a convergenceStrength derived from mass and distance instead of a learner-picked one.
export function Cabin({
  label,
  result,
  scene,
  elapsedSeconds,
}: {
  label: string
  result: TidalEffectExperimentResult
  scene: TidalEffectScene
  elapsedSeconds: number
}) {
  const positions = ballPositionsAt(result, elapsedSeconds, scene)
  const fraction = positions.heightAboveFloor / result.initialHeightMeters
  const ballTopPx = (1 - fraction) * (CABIN_HEIGHT_PX - BALL_SIZE_PX)
  const centerPx = CABIN_WIDTH_PX / 2

  return (
    <div style={{ flex: '1 1 220px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${CABIN_HEIGHT_PX}px`,
          width: `${CABIN_WIDTH_PX}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {/* The left and right ball each get one consistent color, so a learner can visually
            track "which ball is which" as they drift together or stay apart. */}
        {[
          { offsetMeters: positions.leftBallOffset, color: '#0d9488' },
          { offsetMeters: positions.rightBallOffset, color: '#e11d48' },
        ].map(({ offsetMeters, color }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${centerPx + offsetMeters * HORIZONTAL_PX_PER_METER}px`,
              top: `${ballTopPx}px`,
              transform: 'translateX(-50%)',
              width: `${BALL_SIZE_PX}px`,
              height: `${BALL_SIZE_PX}px`,
              borderRadius: '50%',
              background: color,
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Separation: <strong>{(positions.rightBallOffset - positions.leftBallOffset).toFixed(3)} m</strong>
      </p>
    </div>
  )
}

// ---- the new cabin drawing (labelled), used on this page; `Cabin` above stays as it was for Experiment 5 ----
// Each cabin is labelled on the picture: the floor, a key for the left and right ball, and an arrow for what acts. Nothing slanted or
// inward is drawn: the planet's converging pull would show the answer before the learner has predicted (§12), so the arrows point only
// straight down (planet) or straight up (rocket).
export function LabelledCabin({
  label,
  result,
  scene,
  elapsedSeconds,
  strengthG,
  pinkNote,
}: {
  label: string
  result: TidalEffectExperimentResult
  scene: TidalEffectScene
  elapsedSeconds: number
  strengthG: number
  pinkNote?: string
}) {
  const positions = ballPositionsAt(result, Math.min(Math.max(elapsedSeconds, 0), result.timeToFloorSeconds), scene)
  const fraction = positions.heightAboveFloor / result.initialHeightMeters
  const ballTopPx = (1 - fraction) * (CABIN_HEIGHT_PX - BALL_SIZE_PX)
  const centerPx = 220 / 2
  const isPlanet = scene === 'planet'
  const color = isPlanet ? GRAVITY_ARROW_COLOR : ROCKET_ARROW_COLOR
  const length = arrowLengthPx(strengthG)

  return (
    <div style={{ flex: '1 1 240px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', fontWeight: 'bold', color }}>
        {isPlanet ? 'Gravity pulls the balls down' : 'A rocket pushes the cabin up'}
      </p>
      {pinkNote && <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', fontWeight: 'bold', color: YOURS_COLOR }}>{pinkNote}</p>}
      <div
        className="exp-card"
        style={{ position: 'relative', height: `${CABIN_HEIGHT_PX}px`, width: '220px', margin: '0.4rem auto 0', overflow: 'hidden' }}
      >
        {[
          { offsetMeters: positions.leftBallOffset, color: LEFT_BALL_COLOR },
          { offsetMeters: positions.rightBallOffset, color: RIGHT_BALL_COLOR },
        ].map(({ offsetMeters, color: ballColor }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${centerPx + offsetMeters * HORIZONTAL_PX_PER_METER}px`,
              top: `${ballTopPx}px`,
              transform: 'translateX(-50%)',
              width: `${BALL_SIZE_PX}px`,
              height: `${BALL_SIZE_PX}px`,
              borderRadius: '50%',
              background: ballColor,
            }}
          />
        ))}
        {isPlanet ? (
          <div
            style={{
              position: 'absolute',
              left: '8px',
              top: `${Math.min(ballTopPx, CABIN_HEIGHT_PX - 24 - length)}px`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2px',
            }}
          >
            <Arrow direction="down" color={color} length={length} />
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color, marginTop: '3px' }}>gravity</span>
          </div>
        ) : (
          <div style={{ position: 'absolute', right: '10px', bottom: '22px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color, marginBottom: '3px' }}>rocket push</span>
            <Arrow direction="up" color={color} length={length} />
          </div>
        )}
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
      <p style={{ fontSize: '0.75rem', margin: '0.4rem 0 0', color: 'var(--text-muted)' }}>
        <span style={{ color: LEFT_BALL_COLOR, fontWeight: 'bold' }}>●</span> left ball{' '}
        <span style={{ color: RIGHT_BALL_COLOR, fontWeight: 'bold', marginLeft: '0.5rem' }}>●</span> right ball
      </p>
      <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
        Separation: <strong>{(positions.rightBallOffset - positions.leftBallOffset).toFixed(3)} m</strong>
      </p>
    </div>
  )
}

// A run's playback: only presentation. The result comes from the physics module and never depends on this.
function useRun(onFinish?: (result: TidalEffectExperimentResult) => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<TidalEffectExperimentResult | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running' || !result) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // Clamped on both sides: a first animation frame can report a time slightly before startTime.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
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

  const start = useCallback((runResult: TidalEffectExperimentResult) => {
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

// Pages fetched on 12 November 2026 (see the audit's draft wording, section 2). The first is neutral and linked from the start. The
// second names tides, which the tutor names first, so it appears only after the tutor's explanation (§12).
const START_LINKS = [
  {
    href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/free-fall-without-air-resistance/',
    label: 'NASA Glenn: "Free Fall without Air Resistance"',
    what: 'a plain explanation of g: with no air, every object falls with the same acceleration, 9.8 metres per second every second at Earth’s surface. (NASA Glenn Research Center, Beginner’s Guide to Aeronautics; page dated 18 July 2024.)',
  },
]

const AFTER_LINKS = [
  {
    href: 'https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides',
    label: 'NOAA NESDIS: "What Causes Tides?"',
    what: 'a short, plain page on how the Moon’s pull on the Earth differs from place to place, and how that makes the ocean bulge on the near side and the far side. It describes the result as a stretching and squashing of Earth. (NOAA’s K-12 education pages, made by NASA’s Space Place team at JPL; 2 September 2025; for grades 5 to 8.)',
  },
]

// The "Words and formulas" box. Its numbers come from the physics module (CLAUDE.md §9). The separation formula is not in it: it would
// show the answer to the prediction (§12), so it appears in the Part 1 caption after the run.
function referenceEntries(): { term: string; meaning: string }[] {
  const w = workedNumbers()
  return [
    { term: 'Sealed cabin', meaning: 'a closed box with no windows, so the only thing you can watch is what happens inside it.' },
    {
      term: 'Acceleration',
      meaning:
        'how fast something’s speed is changing. A car that goes from 0 to 10 m/s in 2 seconds is accelerating at 5 metres per second, every second.',
    },
    { term: 'g', meaning: 'the acceleration of a dropped object near Earth’s ground, 9.8 m/s². 2g is twice that and 0.5g half.' },
    { term: 'Separation', meaning: 'the distance between the two balls, measured side to side, in metres. It starts at 1 m.' },
    {
      term: 'Left ball / right ball',
      meaning: 'the two identical balls, one on each side of the cabin. They are drawn in teal (left) and red (right) so you can follow each one.',
    },
    {
      term: 'Strength',
      meaning:
        'a plain number (no unit) that stands in for how big the cabin is compared with the planet. Real planets are so much bigger than cabins that the real number is far too small to see, so the values here are exaggerated.',
    },
    {
      term: 'First-order',
      meaning: 'a simplified version of the real physics that keeps the biggest effect and ignores tiny corrections.',
    },
    {
      term: 'Graph (line)',
      meaning: 'a picture of how one number changes as another does. Here each line shows the separation at each moment.',
    },
    { term: 'Tidal effect', meaning: 'the name for what the tutor explains after your run.' },
    {
      term: 'Formula (the one this page uses before the run)',
      meaning: `time to reach the floor = √(2 × height ÷ acceleration). Worked example from this page: at 1g (9.8 m/s²) from 2 m: √(2 × 2 ÷ 9.8) = √0.408 = ${w.oneGFallSeconds.toFixed(2)} seconds. At 2g: √(2 × 2 ÷ 19.6) = ${w.twoGFallSeconds.toFixed(2)} seconds.`,
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

// Part 1's graph has a wide right margin for the two YOUR GUESS boxes, which sit beside the line ends and never cover a line.
const G1: Geo = { width: 840, height: 340, left: 64, right: 330, top: 40, bottom: 54 }
// Drawing A has three rows of legend above the plot and room at the right for the line-end labels.
const GA: Geo = { width: 760, height: 360, left: 64, right: 170, top: 88, bottom: 54 }
const SAMPLE_COUNT = 30

function Legend({
  items,
  rowHeight = 20,
}: {
  items: Array<{ color: string; dashed?: boolean; text: string; x: number; row?: number; thin?: boolean }>
  rowHeight?: number
}) {
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
              strokeWidth={item.thin ? 1.5 : item.dashed ? 2 : 3}
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

function Axes({ g, timeEnd, timeTicks }: { g: Geo; timeEnd: number; timeTicks: number[] }) {
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const xFor = (t: number) => g.left + (t / timeEnd) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  return (
    <>
      <line x1={g.left} y1={g.top} x2={g.left} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={g.left} y1={g.height - g.bottom} x2={g.width - g.right} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={g.left} y1={yFor(1)} x2={g.width - g.right} y2={yFor(1)} stroke={MUTED_COLOR} strokeWidth={0.7} strokeDasharray="3 4" opacity={0.7} />
      {[0, 0.5, 1, SEPARATION_AXIS_TOP_METERS].map((v) => (
        <text key={v} x={g.left - 8} y={yFor(v) + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="end">
          {v === 1 ? '1 m' : `${v} m`}
        </text>
      ))}
      <text x={g.left + 6} y={yFor(1) - 5} fontSize="10" fill={MUTED_COLOR}>
        start: 1 m
      </text>
      {timeTicks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={g.height - g.bottom} x2={xFor(t)} y2={g.height - g.bottom + 5} stroke={MUTED_COLOR} />
          <text x={xFor(t)} y={g.height - g.bottom + 24} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
            {+t.toFixed(2)} s
          </text>
        </g>
      ))}
      <text x={(g.left + g.width - g.right) / 2} y={g.height - 8} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Time since release (s)
      </text>
      <text
        x={14}
        y={(g.top + g.height - g.bottom) / 2}
        fontSize="12"
        fill={TEXT_COLOR}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(g.top + g.height - g.bottom) / 2})`}
      >
        Separation between the balls (m)
      </text>
    </>
  )
}

// A short white arrow beside a ring: down for "together", up for "apart", a flat bar for "the same". The guess has no size, so the
// arrow has no length of its own.
function GuessArrow({ x, y, arrow }: { x: number; y: number; arrow: 'down' | 'none' | 'up' }) {
  if (arrow === 'none') return <line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={GUESS_COLOR} strokeWidth={3} strokeLinecap="round" />
  const dir = arrow === 'down' ? 1 : -1
  return (
    <g>
      <line x1={x} y1={y - 10 * dir} x2={x} y2={y + 4 * dir} stroke={GUESS_COLOR} strokeWidth={3} />
      <polygon points={`${x},${y + 12 * dir} ${x - 6},${y + 3 * dir} ${x + 6},${y + 3 * dir}`} fill={GUESS_COLOR} />
    </g>
  )
}

// Part 1's graph: both lines come from the same ballPositionsAt call. The lines draw themselves in step with the falling balls. Once
// both are fully drawn, a white ring marks each guess at the end of its line, the same place for any guess (a three-way guess has a
// direction but no size, so the arrow shows the direction only).
export function Part1Graph({
  result,
  revealUpToSeconds,
  complete,
  planetGuess,
  rocketGuess,
}: {
  result: TidalEffectExperimentResult
  revealUpToSeconds: number
  complete: boolean
  planetGuess: PredictionChoice | null
  rocketGuess: PredictionChoice | null
}) {
  const g = G1
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const T = result.timeToFloorSeconds
  const revealed = Math.min(Math.max(revealUpToSeconds, 0), T)
  const count = Math.max(1, Math.round(SAMPLE_COUNT * (revealed / T)))
  const xFor = (t: number) => g.left + (t / T) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  const pathFor = (scene: TidalEffectScene) =>
    Array.from({ length: count + 1 }, (_, i) => {
      const t = (i / count) * revealed
      return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(separationAt(result, t, scene)).toFixed(1)}`
    }).join(' ')

  const endX = xFor(T)
  const marks = (
    [
      ['planet', planetGuess],
      ['rocket', rocketGuess],
    ] as const
  ).flatMap(([scene, guess]) => (guess ? [{ scene, marker: guessMarkerFor(result, scene, guess) }] : []))

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label="Graph of the distance between the two balls over time for the planet cabin and the rocket cabin."
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: PLANET_COLOR, text: 'Planet cabin: solid indigo line', x: g.left },
          { color: ROCKET_COLOR, dashed: true, text: 'Rocket cabin: dashed amber line', x: g.left + 260 },
        ]}
      />
      <Axes g={g} timeEnd={T} timeTicks={[0, T]} />
      <path d={pathFor('rocket')} fill="none" stroke={ROCKET_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <path d={pathFor('planet')} fill="none" stroke={PLANET_COLOR} strokeWidth={3} strokeLinecap="round" />
      {!complete && revealed < T && (
        <>
          <circle cx={xFor(revealed)} cy={yFor(separationAt(result, revealed, 'planet'))} r={5} fill={PLANET_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={xFor(revealed)} cy={yFor(separationAt(result, revealed, 'rocket'))} r={5} fill={ROCKET_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        </>
      )}
      {complete && (
        <>
          <text x={endX - 10} y={yFor(finalSeparationMeters(result, 'rocket')) - 12} fontSize="12" fontWeight="bold" fill={ROCKET_COLOR} textAnchor="end">
            Rocket cabin: {finalSeparationMeters(result, 'rocket').toFixed(3)} m
          </text>
          <text x={endX - 10} y={yFor(finalSeparationMeters(result, 'planet')) + 22} fontSize="12" fontWeight="bold" fill={PLANET_COLOR} textAnchor="end">
            Planet cabin: {finalSeparationMeters(result, 'planet').toFixed(3)} m
          </text>
        </>
      )}
      {complete &&
        marks.map(({ scene, marker }) => {
          const cy = yFor(marker.separationMeters)
          const [head, tail] = marker.boxText.split(': ')
          const [line1, rest] = head.split(' (')
          const boxX = endX + 50
          const boxW = 270
          const boxH = 52
          return (
            <g key={scene}>
              <circle cx={endX} cy={cy} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
              <GuessArrow x={endX + 27} y={cy} arrow={marker.arrow} />
              <line x1={endX + 38} y1={cy} x2={boxX} y2={cy} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
              <rect x={boxX} y={cy - boxH / 2} width={boxW} height={boxH} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
              <text x={boxX + 10} y={cy - boxH / 2 + 16} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                {line1}
              </text>
              <text x={boxX + 10} y={cy - boxH / 2 + 31} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                ({rest}:
              </text>
              <text x={boxX + 10} y={cy - boxH / 2 + 46} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                {tail}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

// Spreads two labels written beside line ends so that they do not overprint.
function nudge(ys: number[], minGap: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 1; k < order.length; k++) {
    if (order[k].y - order[k - 1].y < minGap) order[k].y = order[k - 1].y + minGap
  }
  const out = [...ys]
  order.forEach((o) => (out[o.i] = o.y))
  return out
}

// Part 2's Drawing A: one time scale for every acceleration (fixedTimeScaleEndSeconds) and the same vertical scale as Part 1, so a
// different setting gives a visibly different line. The learner's planet line is pink, the rocket line light pink, and Part 1's planet
// line stays in grey for comparison.
export function DrawingA({ result, settingsLabel }: { result: TidalEffectExperimentResult; settingsLabel: string }) {
  const g = GA
  const timeEnd = fixedTimeScaleEndSeconds()
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const xFor = (t: number) => g.left + (t / timeEnd) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  const pathFor = (r: TidalEffectExperimentResult, scene: TidalEffectScene) =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
      const t = (i / SAMPLE_COUNT) * r.timeToFloorSeconds
      return `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(separationAt(r, t, scene)).toFixed(1)}`
    }).join(' ')

  const planetEnd = finalSeparationMeters(result, 'planet')
  const rocketEnd = finalSeparationMeters(result, 'rocket')
  const refEnd = finalSeparationMeters(PART1_RESULT, 'planet')
  const sameAsRef = Math.abs(result.timeToFloorSeconds - PART1_RESULT.timeToFloorSeconds) < 0.005 && Math.abs(planetEnd - refEnd) < 0.0005
  const [rocketLabelY, planetLabelY] = nudge([yFor(rocketEnd), yFor(planetEnd)], 15)

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label={`Drawing A: the distance between the balls over time at your settings, ${settingsLabel}, in pink, and Part 1's planet line in grey, on a fixed time scale from 0 to ${timeEnd} seconds.`}
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: YOURS_COLOR, text: `Planet cabin, your settings (${settingsLabel}): solid pink`, x: g.left, row: 0 },
          { color: YOURS_LIGHT_COLOR, dashed: true, text: 'Rocket cabin, your settings: dashed light pink', x: g.left, row: 1 },
          { color: REFERENCE_COLOR, thin: true, text: 'Planet cabin, 1g and strength 0.3, from Part 1: thin grey', x: g.left, row: 2 },
        ]}
      />
      <Axes g={g} timeEnd={timeEnd} timeTicks={[0, 0.5, 1, 1.5, 2]} />
      {!sameAsRef && <path d={pathFor(PART1_RESULT, 'planet')} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeLinecap="round" />}
      <path d={pathFor(result, 'rocket')} fill="none" stroke={YOURS_LIGHT_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <path d={pathFor(result, 'planet')} fill="none" stroke={YOURS_COLOR} strokeWidth={3} strokeLinecap="round" />
      <circle cx={xFor(result.timeToFloorSeconds)} cy={yFor(planetEnd)} r={5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={xFor(result.timeToFloorSeconds)} cy={yFor(rocketEnd)} r={4} fill={YOURS_LIGHT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      {!sameAsRef && <circle cx={xFor(PART1_RESULT.timeToFloorSeconds)} cy={yFor(refEnd)} r={4} fill={REFERENCE_COLOR} />}
      <text x={xFor(result.timeToFloorSeconds) + 10} y={rocketLabelY + 4} fontSize="12" fontWeight="bold" fill={YOURS_LIGHT_COLOR}>
        Rocket: {rocketEnd.toFixed(3)} m
      </text>
      <text x={xFor(result.timeToFloorSeconds) + 10} y={planetLabelY + 4} fontSize="12" fontWeight="bold" fill={YOURS_COLOR}>
        Planet: {planetEnd.toFixed(3)} m
      </text>
      {!sameAsRef && (
        <text x={xFor(PART1_RESULT.timeToFloorSeconds) + 8} y={yFor(refEnd) + 16} fontSize="11" fill={REFERENCE_COLOR}>
          Part 1: {refEnd.toFixed(3)} m
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
          <strong>The two cabins</strong> show the same moment in two different situations. Each has two balls (teal on the left, red on
          the right) 2 metres above the floor at the start, 1 metre apart. The number under each cabin is the distance between its balls
          right now.
        </li>
        <li>
          <strong>The green arrow in the planet cabin</strong> shows gravity pulling the balls down. <strong>The red arrow in the rocket
          cabin</strong> shows the rocket pushing the cabin, floor included, up. The rocket does not touch the balls. A longer arrow means
          a bigger g. Both cabins are drawn as someone inside would see them, so each floor stays still on the screen.
        </li>
        <li>
          <strong>The graph</strong> draws itself as the balls fall. Up the side is the distance between the balls, from 0 to{' '}
          {SEPARATION_AXIS_TOP_METERS} m (the dotted line is the 1 m start). Along the bottom is the time since release, to the moment the
          balls reach the floor.
        </li>
        <li>
          <strong>The solid indigo line</strong> is the planet cabin. <strong>The dashed amber line</strong> is the rocket cabin. If the
          two lines lay on top of each other, you would see the amber dashes along the indigo line.
        </li>
        <li>
          <strong>The two white rings, arrows and YOUR GUESS boxes</strong> are your two guesses, drawn once both lines are drawn. A ring
          is in the same place whatever you guessed. Its arrow shows only the direction you guessed (down: closer together; flat bar: the
          same distance; up: farther apart), and its length means nothing. Both are markers only, and neither moves a line.
        </li>
        <li>
          <strong>The formulas used:</strong> separation = 1 m × (1 − strength × (time ÷ fall time)²) for the planet cabin, and 1 m at every
          moment for the rocket cabin. Height = 2 m − ½ × acceleration × time².
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At 1g the balls need {w.oneGFallSeconds.toFixed(2)} seconds to fall 2 metres. Halfway through the
        fall, at {w.halfwayTimeSeconds.toFixed(2)} seconds, the planet cabin&rsquo;s separation is 1 × (1 − 0.3 × 0.5²) = 1 × (1 − 0.075) ={' '}
        {w.halfwaySeparationMeters.toFixed(3)} m. At the end, 1 × (1 − 0.3 × 1²) = {w.endSeparationAt0p3.toFixed(3)} m. The rocket cabin&rsquo;s
        is {w.rocketEndSeparation.toFixed(3)} m at both moments.
      </p>
      <LookFor
        items={[
          {
            look: 'the solid indigo line and the dashed amber line.',
            means: 'each shows the distance between one cabin’s two balls at every moment.',
            matters: 'it lets you compare the two cabins and see whether the distance changes, instead of only reading the number at the end.',
          },
          {
            look: 'the right end of each line.',
            means: `it shows the distance between the balls when they reach the floor: ${w.endSeparationAt0p3.toFixed(3)} m for the planet cabin and ${w.rocketEndSeparation.toFixed(3)} m for the rocket cabin in this run, against the 1 m start.`,
            matters: 'it gives you a number for each cabin to compare with the start.',
          },
          {
            look: 'the two white rings and your two YOUR GUESS boxes.',
            means: 'each marks the place on the graph where the answer to that guess can be read: the end of its line.',
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
          <strong>The graph</strong> works as in Part 1, but the bottom scale is fixed at {fixedTimeScaleEndSeconds()} seconds, so you can
          compare runs. In Part 1 it stretched to fit the fall.
        </li>
        <li>
          <strong>The arrows on the cabins</strong> above work as in Part 1. Their length follows the acceleration you choose.
        </li>
        <li>
          <strong>Pink</strong> marks your own settings: the solid pink line is the planet cabin and the light pink dashed line is the
          rocket cabin. <strong>The grey line</strong> is Part 1&rsquo;s planet line, for comparison.
        </li>
        <li>
          <strong>&ldquo;Runs so far&rdquo;</strong> lists every run in this Part.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At 2g and strength 0.6 the balls reach the floor after {w.twoGFallSeconds.toFixed(2)} seconds,
        sooner than the {w.oneGFallSeconds.toFixed(2)} seconds at 1g, so the pink line stops earlier. The planet cabin&rsquo;s separation at
        the end is 1 × (1 − 0.6) = {w.endSeparationAt0p6.toFixed(3)} m, against {w.endSeparationAt0p3.toFixed(3)} m in Part 1.
      </p>
      <LookFor
        items={[
          {
            look: 'where the pink planet line ends compared with the grey one.',
            means: `a bigger strength moves the end of the planet line further from the 1 m start (strength 0.1: ${w.endSeparationAt0p1.toFixed(3)} m; 0.3: ${w.endSeparationAt0p3.toFixed(3)} m; 0.6: ${w.endSeparationAt0p6.toFixed(3)} m), and a bigger acceleration shortens the line (0.5g: ${w.halfGFallSeconds.toFixed(2)} s; 1g: ${w.oneGFallSeconds.toFixed(2)} s; 2g: ${w.twoGFallSeconds.toFixed(2)} s) without changing where it ends.`,
            matters: 'it shows which of your two settings changes the final distance and which changes only the time, and that the rocket line stays at 1 m whatever you choose.',
          },
        ]}
      />
    </CaptionBox>
  )
}

const ACCELERATION_PRESETS = [0.5, 1, 2] as const
const STRENGTH_PRESETS = [0.1, 0.3, 0.6] as const

function PredictionQuestion({
  label,
  prompt,
  selected,
  disabled,
  onSelect,
}: {
  label: string
  prompt: string
  selected: PredictionChoice | null
  disabled: boolean
  onSelect: (choice: PredictionChoice) => void
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {predictionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected ? `Your prediction: ${labelFor(selected)}` : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function TidalEffectExperiment({ onComplete, onTutorComplete }: TidalEffectExperimentProps) {
  const [accelerationPreset, setAccelerationPreset] = useState<AccelerationPreset>(2)
  const [customG, setCustomG] = useState('')
  const [strengthPreset, setStrengthPreset] = useState<StrengthPreset>(0.6)
  const [customStrength, setCustomStrength] = useState('')
  const [planetPrediction, setPlanetPrediction] = useState<PredictionChoice | null>(null)
  const [rocketPrediction, setRocketPrediction] = useState<PredictionChoice | null>(null)
  const [submittedPlanet, setSubmittedPlanet] = useState<PredictionChoice | null>(null)
  const [submittedRocket, setSubmittedRocket] = useState<PredictionChoice | null>(null)
  const [part2Runs, setPart2Runs] = useState<TidalEffectExperimentResult[]>([])
  const [explained, setExplained] = useState(false)

  // The completion mark is saved when Part 1's run ends. Part 2 does not call it.
  const part1 = useRun(() => onComplete?.())
  const part2 = useRun((r) => setPart2Runs((runs) => [...runs, r]))

  const locked = submittedPlanet !== null && submittedRocket !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const selectedG = accelerationPreset === 'other' ? parseFloat(customG) || 0 : accelerationPreset
  const selectedStrength = strengthPreset === 'other' ? parseFloat(customStrength) || 0 : strengthPreset
  const isValidG = selectedG >= 0.1 && selectedG <= 5
  const isValidStrength = selectedStrength >= 0.02 && selectedStrength <= 0.9
  const hasBothPredictions = planetPrediction !== null && rocketPrediction !== null

  const hasAnythingToClear = planetPrediction !== null || rocketPrediction !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleDrop = () => {
    if (!hasBothPredictions || locked) return
    setSubmittedPlanet(planetPrediction)
    setSubmittedRocket(rocketPrediction)
    setPlanetPrediction(null)
    setRocketPrediction(null)
    part1.start(PART1_RESULT)
  }

  const handlePart2 = () => {
    if (!isValidG || !isValidStrength || part1Running || part2Running) return
    part2.start(run(selectedG, selectedStrength))
  }

  // Start over: clears both guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPlanetPrediction(null)
    setRocketPrediction(null)
    setSubmittedPlanet(null)
    setSubmittedRocket(null)
    setAccelerationPreset(2)
    setCustomG('')
    setStrengthPreset(0.6)
    setCustomStrength('')
    setPart2Runs([])
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const shownPlanetGuess = submittedPlanet ?? planetPrediction
  const shownRocketGuess = submittedRocket ?? rocketPrediction
  const previewResult = part2.result ?? (isValidG && isValidStrength ? run(selectedG, selectedStrength) : PART1_RESULT)
  const part2Elapsed = part2.result ? part2.elapsed : 0
  const part2Strength = part2.result ? part2.result.accelerationInG : isValidG ? selectedG : 1
  const settingsNote = part2.result ? `your settings: ${part2.result.accelerationInG}g, strength ${part2.result.convergenceStrength}` : undefined
  const guessesLocked = locked

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Why Gravity Isn't Just Acceleration</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Experiment 1 (the equivalence principle), a single ball fell the same way whether your cabin
            sat still under gravity or accelerated through space. This time we drop two balls side by side. Does the same hold for two
            balls?
          </p>
          <p style={paragraph}>
            <strong>Why even ask this.</strong> One ball can only tell you how it moves. Two balls dropped side by side also let you watch
            something new: the distance between them. This experiment looks at that distance in both cabins.
          </p>
          <p style={paragraph}>
            <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
            coloured heading. In Part 1 you make guesses and watch the experiment. In Part 2 you try it with settings of your own. Part 3
            shows the results, and Part 4 is the tutor, who talks it over with you.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> The same two cabins as before. The planet cabin sits on the ground, where gravity pulls the
            balls down. The rocket cabin is in deep space, far from any planet, where a rocket pushes the cabin (and its floor) upward,
            toward its ceiling, at the same strength. Each cabin drops two balls side by side, the same distance apart (1 metre), at the
            same time, from 2 metres above the floor. We watch whether the distance between the balls changes as they fall. In Part 1 the
            pull and push are 1g (about 9.8 metres per second faster every second, explained in Experiment 1) and the strength is 0.3
            (explained below). In Part 2 you choose other values and drop the balls again.
          </p>
          <p style={paragraph}>
            <strong>What &ldquo;strength&rdquo; means.</strong> Strength is one number that stands in for how big the cabin is compared
            with the planet it sits on. A real planet is so much bigger than any cabin that this number would be far too small to see, so
            here it is exaggerated, with values from 0.02 to 0.9, so that you can watch what it does. Part 1 uses 0.3, and in Part 2 you
            choose your own. Strength has no unit. It is a plain number between 0 and 1.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press the button, guess what the two balls will do in each cabin. Then watch both cabins
            and compare whether the balls&rsquo; distance changes in each one, try other settings in Part 2, and talk it over with the
            tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the cabins or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your two guesses are drawn on the graph in white, each
            in a box labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the acceleration and strength you choose
            do change the cabins and the graph, and the lines they move are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning: sealed
            cabin, acceleration, g, separation, left ball and right ball, strength, first-order, graph, tidal effect.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Both cabins are idealized, just like Experiment 1.</li>
            <li>The planet cabin uses a simplified, first-order approximation, not the exact calculation.</li>
            <li>
              Strength is an exaggerated stand-in for how big the cabin is compared with the planet. A real planet is so much bigger than any
              cabin that this is normally far too small to see, so here it&rsquo;s exaggerated so you can actually watch it.
            </li>
            <li>
              This experiment doesn&rsquo;t use anything about light, moving clocks, or speeds close to light from earlier chapters &mdash;
              it&rsquo;s about ordinary gravity and acceleration, like Experiment 1.
            </li>
            <li>Both balls in each cabin start at rest, 2 metres above the floor, 1 metre apart side to side.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> A plain-language page from an official source is listed here. Checked on 12 November 2026.
            The link opens in a new tab. Another page, about what the two balls do, is held back because it would answer the question you
            are asked to predict. It appears below the tutor&rsquo;s explanation. This page uses no measured result, so there is no
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
          First you guess what the two balls will do in each cabin: the planet cabin and the rocket cabin. Then you press &ldquo;Drop the
          balls&rdquo; and watch both cabins at 1g and strength 0.3. A graph draws itself as the balls fall, with your two guesses marked
          on it in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make your predictions</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Two balls are dropped side by side in each cabin, the same distance apart (1 metre). As they fall, do you think the two balls
            will drift closer together, drift farther apart, or stay exactly the same distance apart? Part 1 uses 1g and strength 0.3.
          </p>
          <PredictionQuestion
            label="Planet cabin"
            prompt="The planet cabin sits on the ground of a planet, where gravity pulls the balls down. What will the two balls do?"
            selected={shownPlanetGuess}
            disabled={guessesLocked || part1Running}
            onSelect={setPlanetPrediction}
          />
          <PredictionQuestion
            label="Rocket cabin"
            prompt="The rocket cabin is in empty space, far from any planet, where a rocket pushes the cabin upward, toward its ceiling, at the same strength. The rocket does not touch the balls. What will the two balls do?"
            selected={shownRocketGuess}
            disabled={guessesLocked || part1Running}
            onSelect={setRocketPrediction}
          />
          {guessesLocked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDrop}
          disabled={part1Running || part2Running || locked || !hasBothPredictions}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'Drop the balls'}
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
        {!hasBothPredictions && !locked && <p style={smallNote}>Choose an option for both cabins above to press &ldquo;Drop the balls&rdquo;.</p>}

        <Block>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <LabelledCabin label="Planet cabin" result={part1.result ?? PART1_RESULT} scene="planet" elapsedSeconds={part1.elapsed} strengthG={1} />
            <LabelledCabin label="Rocket cabin" result={part1.result ?? PART1_RESULT} scene="rocket" elapsedSeconds={part1.elapsed} strengthG={1} />
          </div>
          <p style={{ ...smallNote, textAlign: 'center' }}>
            Each cabin shows its two balls and its floor. The number under a cabin is the distance between its balls right now. Both
            cabins are drawn as someone inside would see them, so each floor stays still on the screen. In the rocket cabin the floor is
            really rising to meet the balls.
          </p>
        </Block>

        {part1.status !== 'idle' && part1.result ? (
          <Block>
            <Part1Graph
              result={part1.result}
              revealUpToSeconds={part1Done ? part1.result.timeToFloorSeconds : part1.elapsed}
              complete={part1Done}
              planetGuess={submittedPlanet}
              rocketGuess={submittedRocket}
            />
            {part1Done ? (
              <>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the height and the separation of the balls at
                  every moment, from the formulas in the caption below, with a strength of 0.3 that is far larger than any real planet and
                  cabin would give. The planet cabin uses a first-order approximation. The rocket cabin&rsquo;s separation is the start
                  value at every moment, built into the model. This page does not measure real cabins. <strong>Imagined for the
                  question:</strong> the two sealed cabins, idealised, with no air. The white rings and arrows are only your guesses.
                </WhereFrom>
                <Part1Caption />
              </>
            ) : (
              <p style={smallNote}>The graph draws itself as the balls fall. Your guesses will be marked on it when the balls have landed.</p>
            )}
          </Block>
        ) : (
          <p style={smallNote}>
            After you press &ldquo;Drop the balls&rdquo;, a graph of the distance between the balls will draw itself here as they fall.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a different acceleration and a different strength and drop the balls again. The settings you choose change the
              cabins and Drawing A in this Part, with your lines in pink. They do not change Part 1&rsquo;s picture, the results in Part 3,
              or your guesses.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Acceleration (used for both cabins)</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {ACCELERATION_PRESETS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setAccelerationPreset(g)}
                    disabled={part2Running}
                    className={`toggle-button${accelerationPreset === g ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {g}g
                  </button>
                ))}
                <button
                  onClick={() => setAccelerationPreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${accelerationPreset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {accelerationPreset === 'other' && (
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

              <label style={{ display: 'block', margin: '1rem 0 0.5rem', fontWeight: 'bold' }}>Strength</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {STRENGTH_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrengthPreset(s)}
                    disabled={part2Running}
                    className={`toggle-button${strengthPreset === s ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setStrengthPreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${strengthPreset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {strengthPreset === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.02"
                    max="0.9"
                    step="0.01"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter strength (0.02-0.9)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected: <strong>{isValidG ? `${selectedG}g (${(selectedG * EARTH_GRAVITY).toFixed(2)} m/s²)` : 'acceleration — (0.1 to 5)'}</strong>,{' '}
                <strong>{isValidStrength ? `strength ${selectedStrength}` : 'strength — (0.02 to 0.9)'}</strong>
              </p>
              <p style={smallNote}>Your guesses do not change these drawings, but the acceleration and strength you choose do.</p>
              <button
                type="button"
                onClick={handlePart2}
                disabled={!isValidG || !isValidStrength || part2Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Drop the balls with your settings'}
              </button>
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <LabelledCabin
                  label="Planet cabin"
                  result={previewResult}
                  scene="planet"
                  elapsedSeconds={part2Elapsed}
                  strengthG={part2Strength}
                  pinkNote={settingsNote}
                />
                <LabelledCabin
                  label="Rocket cabin"
                  result={previewResult}
                  scene="rocket"
                  elapsedSeconds={part2Elapsed}
                  strengthG={part2Strength}
                  pinkNote={settingsNote}
                />
              </div>
              <p style={{ ...smallNote, textAlign: 'center' }}>
                Both cabins are drawn as someone inside would see them, so each floor stays still on the screen. In the rocket cabin the
                floor is really rising to meet the balls.
              </p>
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <DrawingA result={lastPart2} settingsLabel={`${lastPart2.accelerationInG}g, strength ${lastPart2.convergenceStrength}`} />
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the separation of the balls at every moment, from
                  the same formulas as in Part 1, for the settings you chose, with a strength far larger than any real planet and cabin
                  would give. The planet cabin uses a first-order approximation, and the rocket cabin&rsquo;s separation is the start value at
                  every moment. <strong>Imagined for the question:</strong> the two sealed cabins, idealised, with no air. The grey line is
                  Part 1&rsquo;s calculation, kept for comparison.
                </WhereFrom>
                <DrawingACaption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((r, i) => (
                    <li key={i}>
                      {r.accelerationInG}g, strength {r.convergenceStrength}: the balls reach the floor after {r.timeToFloorSeconds.toFixed(2)} s;
                      the planet cabin&rsquo;s balls ended {finalSeparationMeters(r, 'planet').toFixed(3)} m apart and the rocket cabin&rsquo;s{' '}
                      {finalSeparationMeters(r, 'rocket').toFixed(3)} m apart (they started {r.initialSeparationMeters.toFixed(3)} m apart)
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose your settings and press &ldquo;Drop the balls with your settings&rdquo;; Drawing A for your settings
                will appear here.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses marked beside them. Nothing in this Part changes with your
              guesses or with the settings you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Acceleration:</strong> {PART1_RESULT.accelerationInG}g ({PART1_RESULT.accelerationMetersPerSecondSquared.toFixed(2)} m/s²).{' '}
                <strong>Strength:</strong> {PART1_RESULT.convergenceStrength}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, planet cabin:</strong> {finalSeparationMeters(PART1_RESULT, 'planet').toFixed(3)} m (started at{' '}
                {PART1_RESULT.initialSeparationMeters.toFixed(3)} m)
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for the planet cabin is drawn on Part 1&rsquo;s graph as a white mark.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, rocket cabin:</strong> {finalSeparationMeters(PART1_RESULT, 'rocket').toFixed(3)} m
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for the rocket cabin is drawn on Part 1&rsquo;s graph as a white mark.
                </span>
              </p>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the formulas in the caption, with an exaggerated strength; not
              measured. Nothing here changes with your guesses or with the settings you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submittedPlanet !== null && submittedRocket !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your two white marks on the graph, then explains.
            </PartHeader>
            <TidalEffectTutor
              planetPrediction={submittedPlanet}
              rocketPrediction={submittedRocket}
              result={PART1_RESULT}
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> This page names tides, which the tutor names first, so
                  it was held back until now. Checked on 12 November 2026. The link opens in a new tab.
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
