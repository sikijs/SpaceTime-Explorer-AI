import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  guessPositionOnBars,
  movingClockStateAt,
  movingClockStripScaleEnd,
  runMovingClockExperiment,
  timeDilationWorkedNumbers,
} from '../physics/movingClockExperiment'
import type { MovingClockExperimentResult } from '../physics/movingClockExperiment'
import { Experiment3Tutor } from './Experiment3Tutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 3, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 03-draft-wording.md, approved by the owner on 2026-11-08 "all defaults"): the page in four Parts, the track with every part
// labelled, two time bars with a white YOUR GUESS mark on the moving clock's bar, a pink Drawing A for the learner's own speed
// and length in Part 2, captions, a words box, a link, Start over and a tutor that points to the mark. Every number drawn comes
// from the physics module (src/physics/movingClockExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by
// line (CLAUDE.md §28.1).

// Part 1 uses these fixed settings; Part 2 lets the learner choose others.
export const PART1_DURATION = 10
export const PART1_VELOCITY = 0.5
const DURATION_PRESETS = [5, 10, 20, 30] as const
const VELOCITY_PRESETS = [0, 0.1, 0.3, 0.5, 0.8] as const
const MAX_DURATION_SECONDS = 120
const ANIMATION_MS = 2000
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const LAB_COLOR = '#3b82f6' // blue: the lab clock
const MOVING_COLOR = '#f59e0b' // amber: the moving clock

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// Readings are shown to one decimal place because a moving clock's elapsed time is not a whole number.
// Hours are omitted: durations never exceed 120 seconds, and the shorter reading lets both clocks fit side by side.
export function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

// The clocks' playback: only presentation. The result comes from the physics module and never depends on this.
function useClockRunner(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [time, setTime] = useState(0)
  const [total, setTotal] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // A frame's timestamp can be a hair earlier than the moment the run began, so progress is never allowed below 0.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_MS, 0), 1)
      setTime(progress * total)
      if (progress >= 1) {
        setTime(total)
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, total])

  const start = useCallback((runTotal: number) => {
    setTime(0)
    setTotal(runTotal)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setTime(0)
    setTotal(0)
  }, [])
  return { status, time, total, start, reset }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Page fetched and read on 8 November 2026 (see the audit's draft wording, section 2). No plain official page was found for
// "light-second" or for "reference frame" (CLAUDE.md §29 rule 3(c)); the introduction defines both in its own words.
const PLAIN_LINKS = [
  {
    href: 'https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/',
    label: 'NASA Science: "Our Milky Way Galaxy: How Big is Space?"',
    what: 'a short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second, and how far it goes in a minute, a year and more. (NASA Science, Exoplanet Exploration Program; updated April 2024.)',
  },
]

const round3 = (n: number) => parseFloat(n.toFixed(3))

// The "Words and formulas" box. The last three entries name and give the formula for what the run shows, so they appear only
// after the Part 1 run has finished (CLAUDE.md §12). Their numbers come from the physics module (CLAUDE.md §9).
function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Clock reading', meaning: 'the numbers a clock shows at one moment, written minutes:seconds.tenths. 00:08.7 means 0 minutes and 8.7 seconds.' },
    { term: 'Event', meaning: 'one moment at one place. Here, the start of the run and the end of the run.' },
    { term: 'Elapsed time', meaning: 'how much time passed between two events, according to a clock.' },
    { term: 'Lab', meaning: 'the place where the experiment is set up, with its clocks standing still.' },
    { term: 'Lab time', meaning: 'the time shown on the lab’s clocks.' },
    { term: 'Reference frame', meaning: 'a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others.' },
    { term: 'At rest / moving', meaning: 'standing still, or not standing still, compared with the lab.' },
    { term: 'Speed', meaning: 'how far something goes in a given time. Here, in light-seconds every second.' },
    { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km.' },
    { term: 'Duration', meaning: 'how long the lab clock runs, in seconds.' },
    { term: 'Light clock', meaning: 'a clock made of two mirrors facing each other, with a flash of light bouncing between them. It counts each round trip of the flash.' },
    { term: 'Tick', meaning: 'one round trip of the flash in a light clock, up to the top mirror and back. The clock counts ticks to measure time.' },
  ]
  if (done) {
    const run = runMovingClockExperiment(PART1_DURATION, PART1_VELOCITY)
    const n = timeDilationWorkedNumbers(PART1_VELOCITY)
    entries.push(
      {
        term: 'Time dilation',
        meaning: 'the name for a moving clock counting less time than the lab’s clock between the same two events.',
      },
      {
        term: 'Time dilation factor',
        meaning: 'the moving clock’s time divided by the lab clock’s time.',
      },
      {
        term: 'Formula',
        meaning: `moving clock’s time = lab time × √(1 − v²), with v the speed written as a fraction of c. Worked example from this page: v = ${PART1_VELOCITY}, so v² = ${round3(n.vSquared)}, 1 − v² = ${round3(n.oneMinusVSquared)}, √${round3(n.oneMinusVSquared)} = ${run.timeDilationFactor.toFixed(3)}, and ${PART1_DURATION} × ${run.timeDilationFactor.toFixed(3)} = ${run.movingClockElapsedTime.toFixed(3)} seconds. The factor is ${run.timeDilationFactor.toFixed(3)} and the difference is ${PART1_DURATION} − ${run.movingClockElapsedTime.toFixed(3)} = ${run.timeDifferential.toFixed(3)} seconds.`,
      }
    )
  }
  return entries
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

// Both clocks are read from the physics module at the run's lab time. With no settings (an invalid choice) both show zero.
export function MovingClockReadouts({
  experiment,
  time,
  running,
  label,
}: {
  experiment: MovingClockExperimentResult | null
  time: number
  running: boolean
  label: string
}) {
  const state = experiment ? movingClockStateAt(experiment, Math.min(Math.max(time, 0), experiment.labTimeDuration)) : null
  const box = (name: string, reading: number) => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{name}</p>
      <div
        className="clock-readout"
        style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', padding: '1rem 0.5rem', minWidth: '150px', textAlign: 'center' }}
      >
        {formatClockReading(reading)}
      </div>
    </div>
  )
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}: {running ? 'running...' : 'at rest'}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '1rem', marginBottom: '0.5rem' }}>
        {box('Lab Clock', state ? state.labClockReading : 0)}
        {box('Moving Clock', state ? state.movingClockReading : 0)}
      </div>
    </div>
  )
}

// ---- The track: the lab clock at the start and the moving clock at the distance the physics model reports ----
const T = { width: 580, left: 70, right: 510, y: 96, height: 176 }

export function MovingClockTrack({
  experiment,
  distanceTravelled,
  label,
}: {
  experiment: MovingClockExperimentResult
  distanceTravelled: number
  label: string
}) {
  const fraction = experiment.distanceTravelled > 0 ? distanceTravelled / experiment.distanceTravelled : 0
  const movingX = T.left + fraction * (T.right - T.left)
  const text = `Moving clock: ${distanceTravelled.toFixed(2)} light-seconds from the lab clock`
  const labelX = Math.min(Math.max(movingX, T.left + 120), T.right - 60)
  return (
    <svg className="narrow-scroll" width={T.width} height={T.height} viewBox={`0 0 ${T.width} ${T.height}`} style={svgStyle} role="img" aria-label={label}>
      <line x1={T.left} y1={T.y} x2={T.right} y2={T.y} stroke={MUTED_COLOR} strokeWidth={3} />
      <line x1={T.left} y1={T.y - 8} x2={T.left} y2={T.y + 8} stroke={MUTED_COLOR} strokeWidth={2} />
      <line x1={T.right} y1={T.y - 8} x2={T.right} y2={T.y + 8} stroke={MUTED_COLOR} strokeWidth={2} />
      <line x1={T.left} y1={T.y} x2={movingX} y2={T.y} stroke={MOVING_COLOR} strokeWidth={5} />

      <rect x={T.left - 16} y={T.y + 14} width={32} height={22} rx={3} fill={LAB_COLOR} />
      <text x={T.left} y={T.y + 54} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        Lab clock
      </text>

      <rect x={movingX - 16} y={T.y - 40} width={32} height={22} rx={3} fill={MOVING_COLOR} />
      <text x={labelX} y={T.y - 50} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        {text}
      </text>

      <text x={T.right} y={T.y + 54} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        End of run
      </text>
      <text x={(T.left + T.right) / 2} y={T.y + 54} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
        Track (the moving clock’s path)
      </text>
      <line x1={14} y1={T.height - 14} x2={38} y2={T.height - 14} stroke={MOVING_COLOR} strokeWidth={5} />
      <text x={46} y={T.height - 10} fill={MUTED_COLOR} fontSize="11">
        Distance travelled so far
      </text>
    </svg>
  )
}

// ---- The two time bars (Part 1's picture, and Drawing A in Part 2 with a pink moving clock's bar) ----
const B = { width: 580, left: 96, right: 540, height: 214 }
const LAB_BAR_Y = 34
const MOVING_BAR_Y = 114
const BAR_H = 22
const AXIS_Y = 170

export function MovingClockBars({
  experiment,
  pink,
  guess,
  label,
}: {
  experiment: MovingClockExperimentResult
  pink: boolean
  guess: number | null
  label: string
}) {
  const scaleEnd = movingClockStripScaleEnd(experiment)
  const px = (seconds: number) => B.left + (seconds / scaleEnd) * (B.right - B.left)
  const movingColor = pink ? YOURS_COLOR : MOVING_COLOR
  const mark = guess !== null ? guessPositionOnBars(experiment, guess) : null
  const labEnd = px(experiment.observerElapsedTime)
  const movingEnd = px(experiment.movingClockElapsedTime)
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const

  const guessMark = () => {
    if (!mark || guess === null) return null
    const markX = B.left + mark.fraction * (B.right - B.left)
    const text = `YOUR GUESS: ${guess} seconds${mark.offEdge ? ' (off the scale)' : ''}`
    const boxWidth = Math.max(150, text.length * 8 + 16)
    const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), B.width - boxWidth - 4)
    const boxY = 76
    const barMid = MOVING_BAR_Y + BAR_H / 2
    return (
      <g>
        <line x1={markX} y1={boxY + 22} x2={markX} y2={barMid} stroke={GUESS_COLOR} strokeWidth={1.5} />
        {mark.offEdge === null ? (
          <circle cx={markX} cy={barMid} r={7} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        ) : (
          <polygon
            points={
              mark.offEdge === 'right'
                ? `${markX + 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
                : `${markX - 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
            }
            fill={GUESS_COLOR}
          />
        )}
        <rect x={boxX} y={boxY} width={boxWidth} height={22} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={boxX + 8} y={boxY + 15} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  return (
    <svg className="narrow-scroll" width={B.width} height={B.height} viewBox={`0 0 ${B.width} ${B.height}`} style={svgStyle} role="img" aria-label={label}>
      {/* a dashed line joins the two bars where both clocks start together */}
      <line x1={px(0)} y1={LAB_BAR_Y} x2={px(0)} y2={MOVING_BAR_Y + BAR_H} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />

      <text x={4} y={LAB_BAR_Y + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Lab clock
      </text>
      <rect x={px(0)} y={LAB_BAR_Y} width={labEnd - px(0)} height={BAR_H} fill={LAB_COLOR} />
      <text x={labEnd} y={LAB_BAR_Y + BAR_H + 15} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        {experiment.observerElapsedTime.toFixed(3)} s
      </text>

      <text x={4} y={MOVING_BAR_Y + 16} fill={movingColor} fontSize="12" fontWeight="bold">
        Moving clock
      </text>
      <rect x={px(0)} y={MOVING_BAR_Y} width={movingEnd - px(0)} height={BAR_H} fill={movingColor} />
      <text x={movingEnd} y={MOVING_BAR_Y + BAR_H + 16} fill={movingColor} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        {experiment.movingClockElapsedTime.toFixed(3)} s
      </text>

      <line x1={B.left} y1={AXIS_Y} x2={B.right} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, experiment.labTimeDuration, scaleEnd].map((t, i) => (
        <g key={i}>
          <line x1={px(t)} y1={AXIS_Y - 5} x2={px(t)} y2={AXIS_Y + 5} stroke={MUTED_COLOR} />
          <text x={px(t)} y={AXIS_Y + 18} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
            {t} s
          </text>
        </g>
      ))}
      <text x={14} y={B.height - 6} fill={MUTED_COLOR} fontSize="10">
        time scale in seconds (0 s: both clocks start together, both reading 00:00.0)
      </text>
      {/* white: the learner's guess, placed on the same scale; a number has a position, so the mark follows it */}
      {guessMark()}
    </svg>
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

export function TrackCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the track and the clocks.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The track</strong> is the moving clock&rsquo;s path. The blue box is the <strong>lab clock</strong>, standing at
          the start. The amber box is the <strong>moving clock</strong>, sliding away from it. The amber line is the distance it has
          travelled so far, in light-seconds (one light-second is about 300,000 km). The track is drawn to fit each run, so the
          moving clock always ends at the far end; read the number, not the length, to know how far it went.
        </li>
        <li>
          <strong>The two clocks</strong> show each clock&rsquo;s reading as minutes:seconds.tenths (00:08.7 is 8.7 seconds). Both
          count up while the run lasts and stay at their last reading when it ends.
        </li>
      </ul>
    </CaptionBox>
  )
}

export function BarsCaption({ name, experiment, guesses, pink }: { name: string; experiment: MovingClockExperimentResult; guesses: boolean; pink: boolean }) {
  const e = experiment
  const scaleEnd = movingClockStripScaleEnd(e)
  const moving = e.movingClockElapsedTime.toFixed(3)
  const lab = e.observerElapsedTime.toFixed(3)
  const factor = e.timeDilationFactor.toFixed(3)
  const gap = e.timeDifferential.toFixed(3)
  const sample = guessPositionOnBars(e, 9)
  const items = [
    {
      look: 'the ends of the two bars.',
      means: `Each clock’s own count of time between the same two events, the start and the end of the run: ${lab} s for the lab clock and ${moving} s for the moving clock.`,
      matters: 'The question of this experiment is whether a clock that moves counts the same time as a clock that stands still.',
    },
    {
      look: 'the gap between the end of the lab clock’s bar and the end of the moving clock’s bar.',
      means: `How much more time the lab clock counted: ${lab} − ${moving} = ${gap} seconds.`,
      matters: 'It makes the difference visible as a length, not only as a number.',
    },
  ]
  if (guesses) {
    items.push({
      look: 'the white YOUR GUESS mark and the end of the moving clock’s bar.',
      means: 'The gap between them, if there is one, is how far your guess was from what the moving clock counted, in seconds.',
      matters: 'It puts what you expected beside what the clock showed.',
    })
  }
  if (pink) {
    items[0] = {
      look: 'the pink bar’s end in each run in “Runs so far”.',
      means: `How much time the moving clock counted for the speed and length you chose (here ${moving} s). At 0c it equals the lab clock’s; at higher speeds it is shorter.`,
      matters: 'It shows how the difference you saw in Part 1 depends on the speed and on the length of the run.',
    }
    items.splice(1, 1)
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The bars</strong> appear when the run ends. They are a time scale: the further right, the more seconds. 0 s is the
          start, {e.labTimeDuration} s is the length of the run and {scaleEnd} s is twice that, so there is room to the right of the lab
          clock&rsquo;s bar. The top bar is how much time the lab clock counted; the bottom bar is how much time the moving clock
          counted. The dashed line shows that both started together.
        </li>
        {pink ? (
          <li>
            <strong>Pink</strong> marks your own settings (the moving clock&rsquo;s bar and its number), so you can tell this
            drawing from Part 1&rsquo;s. If you choose a different length, the scale changes too: a 20-second run has a scale to 40 s.
            &ldquo;Runs so far&rdquo; lists every run in this Part.
          </li>
        ) : (
          guesses && (
            <li>
              <strong>The white mark and the YOUR GUESS box</strong> are your guess, placed on the same scale. A white arrow at the
              edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves a bar.
            </li>
          )
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At {e.velocity}c for {e.labTimeDuration} seconds, the moving clock goes {e.velocity} ×{' '}
        {e.labTimeDuration} = {round3(e.distanceTravelled)} light-seconds. The lab clock&rsquo;s bar ends at {lab} s. The moving
        clock&rsquo;s bar ends at {moving} s, because {e.labTimeDuration} × {factor} = {moving} (the Words box shows where {factor}{' '}
        comes from).
        {!pink &&
          guesses &&
          ` If you had guessed 9, your white mark would sit at 9 s, ${Math.abs(sample.differenceFromMoving).toFixed(3)} seconds ${sample.differenceFromMoving >= 0 ? 'to the right of' : 'to the left of'} the end of the moving clock’s bar.`}
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}

interface RunRecord {
  result: MovingClockExperimentResult
}

interface Experiment3Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment3({ onComplete, onTutorComplete }: Experiment3Props) {
  const [predictionInput, setPredictionInput] = useState('')
  const [submitted, setSubmitted] = useState<number | null>(null)
  const [duration, setDuration] = useState<DurationOption>(20)
  const [customDuration, setCustomDuration] = useState('')
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Experiment, setPart2Experiment] = useState<MovingClockExperimentResult | null>(null)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()

  const part1Result = runMovingClockExperiment(PART1_DURATION, PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)

  const selectedDuration = duration === 'other' ? Number(customDuration) : duration
  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const durationValid = Number.isInteger(selectedDuration) && selectedDuration >= 1 && selectedDuration <= MAX_DURATION_SECONDS
  // The 0c preset is a valid at-rest baseline; a custom speed must be between 0.01c and 0.99c.
  const speedValid = velocity === 0 || (isFinite(selectedVelocity) && selectedVelocity >= 0.01 && selectedVelocity <= 0.99)
  const settingsValid = durationValid && speedValid
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = predictionInput !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (!hasPrediction || locked) return
    setSubmitted(predictionValue as number)
    part1.start(PART1_DURATION)
  }

  const handleRunPart2 = () => {
    if (!settingsValid || part1Running || part2Running) return
    setPart2Experiment(runMovingClockExperiment(selectedDuration, selectedVelocity))
    part2.start(selectedDuration)
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Experiment) {
      setPart2Runs((runs) => [...runs, { result: part2Experiment }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionInput('')
    setSubmitted(null)
    setDuration(20)
    setCustomDuration('')
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Experiment(null)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const inputStyle = (disabled: boolean) => ({
    padding: '0.5rem',
    fontSize: '0.875rem',
    width: '200px',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  })
  const part1State = movingClockStateAt(part1Result, Math.min(Math.max(part1.time, 0), part1Result.labTimeDuration))
  const part2Shown = part2Running || part2Done ? part2Experiment : null
  const part2State = part2Shown ? movingClockStateAt(part2Shown, Math.min(Math.max(part2.time, 0), part2Shown.labTimeDuration)) : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Moving Clock</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In &ldquo;Two clocks at rest&rdquo;, two clocks that stood still agreed. What if one of the
            clocks moves? Will the two clocks still show the same time?
          </p>
          <p style={paragraph}>
            <strong>What&rsquo;s really being tested.</strong> The question is simple. Two ordinary clocks, identical and in perfect
            working order, start together. One of them moves. When they are read at the end, will both have counted the same number of
            seconds between the same two events?
          </p>
          <p style={paragraph}>
            An <strong>event</strong> is one moment at one place. Here the two events are the start of the run and the end of the run.
            The <strong>elapsed time</strong> is how much time a clock counted between them. This is the plain tick-count
            &ldquo;One clock&rdquo; defined.
          </p>
          <p style={paragraph}>
            In daily life we never doubt the answer. If one friend rides a fast train while another waits on the platform, both assume
            that a minute passes for the train rider in exactly the time a minute passes for the friend on the platform. We simply take
            it for granted that time is the same backdrop for everyone. This project does not take things for granted. It checks them
            with a measurement. This experiment checks whether that everyday assumption survives once the speeds involved get extreme
            enough to matter.
          </p>
          <p style={paragraph}>
            Neither clock is broken or built differently, so if the two counts differ, the clocks cannot be the reason.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What happens.</strong> Two ordinary clocks start together, at the same place, both showing 00:00.0. One stays in the
            lab, the place where the experiment is set up. The other moves away in a straight line at a steady speed, like a car on a
            long straight road with its speed held constant: it never speeds up and never slows down. Here is the run, step by step:
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Start.</strong> Both clocks are side by side and read 00:00.0. This is the first event.
            </li>
            <li>
              <strong>Run.</strong> The moving clock travels away from the lab. The lab clock stays put. Both keep counting.
            </li>
            <li>
              <strong>End.</strong> When the lab&rsquo;s clock has counted the chosen number of seconds, we stop. This is the second
              event. We then read both clocks.
            </li>
            <li>
              <strong>Compare.</strong> Two bars show how much time each clock counted between the two events.
            </li>
          </ol>
          <p style={paragraph}>
            In Part 1 the moving clock goes at {PART1_VELOCITY}c, which is half the speed of light: 150,000 km every second. An airliner
            covers about a quarter of a kilometre every second, so this is roughly 600,000 times faster than an airliner, far beyond
            anything we can build. We use such a speed so that any difference between the clocks is big enough to see. The lab clock
            runs for {PART1_DURATION} seconds. In Part 2 you choose any speed and any length of time and run that.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, predict what the moving clock will show at the end. A wrong guess is
            fine. Guesses are not scored. Then watch both clocks, try other speeds and lengths in Part 2, and talk it over with the
            tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the clocks or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the bars in white, in a box
            labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the speed and the length you choose do change the
            clocks and the drawing, and the marks they move are pink.
          </p>
          <p style={paragraph}>
            <strong>What is a light clock?</strong> A light clock is the simplest clock we can imagine. Two mirrors face each other,
            one above the other, and a flash of light bounces between them: up, down, up, down. Each trip up and back is one{' '}
            <strong>tick</strong>, and the clock counts ticks, the way a pendulum clock counts swings. It works because light always
            travels at the same speed, so every round trip takes exactly the same time. For example, with the mirrors 15 cm apart,
            the light travels 15 + 15 = 30 cm per tick. Light covers 30 cm in about one billionth of a second, so this clock ticks
            about a billion times a second.
          </p>
          <p style={paragraph}>
            <strong>How this differs from &ldquo;The light clock&rdquo;.</strong> This experiment measures <em>how big</em> the
            difference between the two clocks is, using ordinary clocks. It does not explain <em>why</em> there is a difference. In
            &ldquo;The light clock&rdquo; you build one of these clocks, set it moving, and follow the light inside it to find the
            reason.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            clock reading, event, elapsed time, lab, lab time, reference frame, at rest, moving, speed, c, light-second, duration, light clock, tick. After you
            have run the experiment it also shows the name of what you found and its formula.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>Both clocks start together at the same place, and both are set to zero at that moment.</li>
            <li>
              The lab is a <strong>reference frame</strong>, as in &ldquo;Two clocks at rest&rdquo;: a group of people and clocks that
              are all standing still relative to one another, with their clocks set to agree. <strong>Lab time</strong> is the time
              shown on those clocks.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the lab&rsquo;s reference frame. It has
              its own reference frame: the point of view of someone riding along with it. So two reference frames are involved: the
              lab&rsquo;s and the moving clock&rsquo;s.
            </li>
            <li>
              We measure distances in <strong>light-seconds</strong>. One light-second is how far light travels in one second, about
              300,000 km.
            </li>
            <li>
              <strong>c</strong> is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> A plainer-language page from an official source is listed here. Checked on 8 November
            2026. The link opens in a new tab. This page has no real experimental result, so there is no paper to link.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {PLAIN_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you guess what the moving clock will show when the experiment ends. Then you press START and watch both clocks for{' '}
          {PART1_DURATION} seconds, with the moving clock going at {PART1_VELOCITY}c. When the run finishes, two bars appear that show
          how much time each clock counted, with your guess drawn on them in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The moving clock will go at {PART1_VELOCITY}c, measured from the lab, and the lab clock will run for {PART1_DURATION}{' '}
            seconds. When the experiment ends, what will the moving clock show? Type your guess in seconds.
          </p>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
            Your guess for the moving clock (seconds)
          </label>
          <input
            type="number"
            step="any"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={locked}
            placeholder="Enter seconds"
            aria-label="Your guess for the moving clock, in seconds"
            className="field-input"
            style={inputStyle(locked)}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {locked
              ? `Your prediction: ${submitted} seconds. Your prediction is locked while you try other settings. To change it, press Start over.`
              : hasPrediction
                ? `Your prediction: ${predictionValue} seconds`
                : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={part1Running || part2Running || locked || !hasPrediction}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'START'}
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
        {!hasPrediction && !locked && <p style={smallNote}>Enter a prediction above to press START.</p>}

        <Block>
          <MovingClockTrack
            experiment={part1Result}
            distanceTravelled={part1State.distanceTravelled}
            label={`The track for the ${PART1_DURATION}-second run at ${PART1_VELOCITY}c: the lab clock at the start, the moving clock ${part1State.distanceTravelled.toFixed(2)} light-seconds along the track.`}
          />
          <p style={{ ...smallNote, textAlign: 'center' }}>
            The track is drawn to fit this run: the moving clock reaches the far end when the run finishes.
          </p>
          <WhereFrom>
            Calculated here, not measured: the distance comes from the speed and the lab time. No instrument measured it and nothing
            here is imagined.
          </WhereFrom>
          <div style={{ marginTop: '1rem' }}>
            <MovingClockReadouts experiment={part1Result} time={part1.time} running={part1Running} label="Clocks" />
          </div>
          <TrackCaption />
        </Block>

        {part1Done && submitted !== null ? (
          <Block>
            <MovingClockBars
              experiment={part1Result}
              pink={false}
              guess={submitted}
              label={`The two time bars for the ${PART1_DURATION}-second run at ${PART1_VELOCITY}c: the lab clock counted ${part1Result.observerElapsedTime.toFixed(3)} seconds, the moving clock ${part1Result.movingClockElapsedTime.toFixed(3)} seconds, and your guess of ${submitted} seconds is in white in a box marked YOUR GUESS.`}
            />
            <WhereFrom>
              Calculated here, not measured: each clock&rsquo;s time comes from the formula in the Words box. No instrument measured it
              and nothing here is imagined. The white mark is only your guess, placed on the same scale.
            </WhereFrom>
            <BarsCaption name="the two time bars" experiment={part1Result} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running ? 'The bars will appear when the run ends.' : 'After you press START, two bars showing how much time each clock counted will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a speed and a length of time and run them. What you choose changes the clocks and the drawing in this
              Part, marked in pink. It does not change Part 1&rsquo;s pictures, the results in Part 3, or your guess.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Lab time duration</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDuration(preset)}
                    disabled={part2Running}
                    className={`toggle-button${duration === preset ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset}s
                  </button>
                ))}
                <button
                  onClick={() => setDuration('other')}
                  disabled={part2Running}
                  className={`toggle-button${duration === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {duration === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="1"
                    max={MAX_DURATION_SECONDS}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    disabled={part2Running}
                    placeholder={`Enter seconds (1-${MAX_DURATION_SECONDS})`}
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected duration: <strong>{durationValid ? `${selectedDuration} seconds` : `— (a whole number from 1 to ${MAX_DURATION_SECONDS})`}</strong>
              </p>

              <label style={{ display: 'block', margin: '1rem 0 0.5rem', fontWeight: 'bold' }}>Moving clock speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000 km/s). For example, 0.5c means
                half the speed of light. 0c means the clock is not moving at all, so you can use it as a starting point to compare
                with.
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                {VELOCITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setVelocity(preset)}
                    disabled={part2Running}
                    className={`toggle-button${velocity === preset ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset}c
                  </button>
                ))}
                <button
                  onClick={() => setVelocity('other')}
                  disabled={part2Running}
                  className={`toggle-button${velocity === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {velocity === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    value={customVelocity}
                    onChange={(e) => setCustomVelocity(e.target.value)}
                    disabled={part2Running}
                    placeholder="Fraction of c (0.01-0.99)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected speed: <strong>{speedText}</strong>
              </p>
              <p style={smallNote}>Your guess does not change these drawings, but the speed and the length you choose do.</p>
              <button
                type="button"
                onClick={handleRunPart2}
                disabled={!settingsValid || part2Running || part1Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your settings'}
              </button>
            </div>

            <Block>
              <MovingClockReadouts experiment={part2Shown} time={part2.time} running={part2Running} label="Clocks (your settings)" />
            </Block>

            {part2Shown && part2State && part2Running && (
              <Block>
                <MovingClockTrack
                  experiment={part2Shown}
                  distanceTravelled={part2State.distanceTravelled}
                  label={`The track for your ${part2Shown.labTimeDuration}-second run at ${part2Shown.velocity}c.`}
                />
              </Block>
            )}

            {lastPart2 && !part2Running ? (
              <Block>
                <MovingClockTrack
                  experiment={lastPart2.result}
                  distanceTravelled={lastPart2.result.distanceTravelled}
                  label={`The track for your ${lastPart2.result.labTimeDuration}-second run at ${lastPart2.result.velocity}c: the moving clock ended ${lastPart2.result.distanceTravelled.toFixed(2)} light-seconds from the lab clock.`}
                />
                <MovingClockBars
                  experiment={lastPart2.result}
                  pink
                  guess={null}
                  label={`Drawing A: the two time bars for your ${lastPart2.result.labTimeDuration}-second run at ${lastPart2.result.velocity}c, with the moving clock's bar in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured: the distance and each clock&rsquo;s time come from the speed and the length you
                  chose. No instrument measured them and nothing here is imagined.
                </WhereFrom>
                <BarsCaption name="Drawing A" experiment={lastPart2.result} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c, {run.result.labTimeDuration} s: lab clock {run.result.observerElapsedTime.toFixed(3)} s,
                      moving clock {run.result.movingClockElapsedTime.toFixed(3)} s
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>
                  Not run yet. Choose a speed and a length and press Run your settings; the drawing for them will appear here.
                </p>
              )
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your
              guess or with the settings you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>How long the experiment ran (on the lab&rsquo;s clocks):</strong> {part1Result.labTimeDuration} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Moving clock speed:</strong> {part1Result.velocity}c ({parseFloat((part1Result.velocity * 100).toFixed(2))}% of
                the speed of light)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Distance the moving clock travelled (measured in the lab):</strong> {part1Result.distanceTravelled.toFixed(3)}{' '}
                light-seconds
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What the lab clock measured:</strong> {part1Result.observerElapsedTime.toFixed(3)} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What the moving clock measured:</strong> {part1Result.movingClockElapsedTime.toFixed(3)} seconds
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s bars as the white mark.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Difference:</strong>{' '}
                {part1Result.timeDifferential.toFixed(3) === '0.000' ? '0.000' : `−${part1Result.timeDifferential.toFixed(3)}`} seconds
                (the moving clock&rsquo;s time minus the lab clock&rsquo;s time)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time dilation factor (how much slower the moving clock runs):</strong>{' '}
                {part1Result.timeDilationFactor.toFixed(3)} (the moving clock&rsquo;s time divided by the lab clock&rsquo;s time; it
                comes from √(1 − {part1Result.velocity}²), with speeds in units of c)
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed:</strong> {submitted} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real time the moving clock measured:</strong> {part1Result.movingClockElapsedTime.toFixed(3)} seconds
              </p>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>What these results tell us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The two clock lines.</strong> These are what each clock counted between the start and the end of the run:{' '}
                  {part1Result.observerElapsedTime.toFixed(3)} s and {part1Result.movingClockElapsedTime.toFixed(3)} s.{' '}
                  <em>Why it matters:</em> both clocks are ordinary and started together, so the comparison is fair.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The difference line.</strong> −{part1Result.timeDifferential.toFixed(3)} seconds means the moving clock
                  counted {part1Result.timeDifferential.toFixed(3)} seconds less than the lab clock. <em>Why it matters:</em> this is
                  the size of the effect for this speed and this length; Part 2 lets you see how it changes.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The time dilation factor.</strong> {part1Result.timeDilationFactor.toFixed(3)} means the moving clock
                  counted {part1Result.timeDilationFactor.toFixed(3)} of every lab second: {PART1_DURATION} ×{' '}
                  {part1Result.timeDilationFactor.toFixed(3)} = {part1Result.movingClockElapsedTime.toFixed(3)}. <em>Why it matters:</em>{' '}
                  it depends only on the speed (try the same speed with another length in Part 2: the factor does not change). It
                  comes from √(1 − v²), worked in the Words box.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed and the length of the run (see the caption under
              the bars). Nothing here changes with your guess or with the settings you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white guess mark, then explains.
            </PartHeader>
            <Experiment3Tutor
              onExplained={onTutorComplete}
              key={`${PART1_DURATION}-${PART1_VELOCITY}-${submitted}`}
              velocity={PART1_VELOCITY}
              durationSeconds={PART1_DURATION}
              prediction={submitted}
            />
          </>
        )}
      </div>
    </div>
  )
}
