import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BASE_ARM_LENGTH,
  LIGO_ARM_KM,
  RUN_CYCLES,
  TYPICAL_EVENT,
  afterGuessMarkLength,
  armLengthRange,
  armLengthsAfterRun,
  changeInMetres,
  directionGuessArrows,
  firstPeakState,
  firstPeakTime,
  gravitationalWaveStateAt,
  periodOf,
  powersOfTenAboveReal,
  realChangeIn1e18Metres,
  runDuration,
} from '../physics/gravitationalWaveExperiment'
import type { AfterChoice, ArrowDirection, DirectionChoice } from '../physics/gravitationalWaveExperiment'
import { GravitationalWaveTutor } from './GravitationalWaveTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Gravitational Waves, Experiment 1 (docs/experiments/gravitational-waves/01-gravitational-waves.md), audited to the
// newer rules (docs/audit/gravitational-waves/01-draft-wording.md). Part 1 runs the fixed "Typical detected event" wave
// and draws the learner's two guesses in white on the graph; Part 2 holds the sliders, with pink marks for the learner's
// own settings; Part 3 is Table 1 and the guesses beside it; Part 4 is the tutor. Every number drawn or shown comes from
// src/physics/gravitationalWaveExperiment.ts (CLAUDE.md §9); the only calculation here is where a point is drawn.
// All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1).

interface GravitationalWaveExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type RunStatus = 'idle' | 'running' | 'complete'

// Fixed real-world playback duration, independent of the chosen frequency (CLAUDE.md §11): playback speed must not
// change the physical result, only how quickly it is shown.
const ANIMATION_DURATION_MS = 8000

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const ARM_X_COLOR = '#a78bfa' // violet: Arm X (the purple line)
const ARM_Y_COLOR = '#22d3ee' // cyan: Arm Y (the teal line)
const YOURS_COLOR = '#f472b6' // pink: the learner's own choice (Part 2)
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

interface SourcePreset {
  label: string
  amplitude: number
  frequency: number
}

const presets: SourcePreset[] = [
  { label: 'Distant / weak source', amplitude: 0.08, frequency: 0.5 },
  { label: 'Typical detected event', amplitude: 0.2, frequency: 1 },
  { label: 'Strong / nearby source', amplitude: 0.35, frequency: 1.6 },
]

const directionChoices: Array<{ value: DirectionChoice; label: string }> = [
  { value: 'same-way', label: 'Both arms do the same thing at the same time' },
  { value: 'opposite-ways', label: 'The two arms do opposite things' },
]

const afterChoices: Array<{ value: AfterChoice; label: string }> = [
  { value: 'longer', label: 'Longer than they started' },
  { value: 'shorter', label: 'Shorter than they started' },
  { value: 'back-to-original', label: 'Back to their original length' },
]

const DIRECTION_SHORT: Record<DirectionChoice, string> = {
  'same-way': 'both arms do the same thing at the same time',
  'opposite-ways': 'the two arms do opposite things',
}
const AFTER_SHORT: Record<AfterChoice, string> = {
  longer: 'arms end up longer than they started',
  shorter: 'arms end up shorter than they started',
  'back-to-original': 'arms end up back at their original length',
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// The pages and papers behind this page's numbers (fetched and read on 4 November 2026; see the audit's draft wording).
const PLAIN_LINKS = [
  { href: 'https://www.ligo.caltech.edu/page/what-are-gw', label: 'LIGO Lab: "What are Gravitational Waves?"', what: 'ripples in spacetime from violent events, Einstein\'s prediction and LIGO\'s first detection. It also gives the 1.3 billion light-years and the comparison to the atomic nucleus used in "A real detection".' },
  { href: 'https://spaceplace.nasa.gov/gravitational-waves/en/', label: 'NASA Space Place: "What Is a Gravitational Wave?"', what: 'a short, plain explainer: waves that squeeze and stretch things, what causes them and how LIGO detects them.' },
  { href: 'https://www.ligo.caltech.edu/page/ligo-detectors', label: 'LIGO Lab: "LIGO\'s Dual Detectors"', what: 'why LIGO uses two detectors about 3,000 kilometres apart.' },
]
const PAPER_LINKS = [
  { href: 'https://arxiv.org/abs/1602.03837', label: '"Observation of Gravitational Waves from a Binary Black Hole Merger"', what: 'the original report of GW150914 (LIGO Scientific Collaboration and Virgo Collaboration, Physical Review Letters 116, 061102, 2016). Its abstract gives the peak strain of 1.0 × 10⁻²¹ and the distance.' },
  { href: 'https://arxiv.org/abs/1710.05832', label: '"GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral"', what: 'the original report of the neutron-star merger also seen by telescopes (Physical Review Letters 119, 161101, 2017).' },
]

const fixed3 = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(3)

// The four Parts of the page (CLAUDE.md §14, "The Page in Four Parts"): a thick coloured line, a coloured heading and a short lead.
function PartHeader({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${color}` }}>
      <h3 style={{ margin: '0 0 0.5rem', color }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <strong>What we are about to do.</strong> {children}
      </p>
    </div>
  )
}

const PredictionTag = ({ n }: { n: 1 | 2 }) => (
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
    guess {n}
  </span>
)

// Runs one playback: simulated time goes from 0 to the run's total over a fixed real duration.
function useRunner(onFinish?: () => void) {
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
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setTime(progress * total)
      if (progress >= 1) {
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

  return { status, time, start, reset }
}

// ---- Picture 1 / Drawing A (Part 2), the arms ----
const ARMS_SIZE = { width: 420, height: 320 }
const CORNER = { x: 130, y: 250 }
const REST_COLOR = '#fbbf24' // amber: the rest length, a fixed reference
const REST_ARM_PIXELS = 170

function armEnd(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x' ? { x: CORNER.x + pixels, y: CORNER.y } : { x: CORNER.x, y: CORNER.y - pixels }
}

function ArmsPicture({ armXLength, armYLength, label }: { armXLength: number; armYLength: number; label: string }) {
  const xEnd = armEnd('x', armXLength)
  const yEnd = armEnd('y', armYLength)
  const xRest = armEnd('x', BASE_ARM_LENGTH)
  const yRest = armEnd('y', BASE_ARM_LENGTH)
  return (
    <svg
      width={ARMS_SIZE.width}
      height={ARMS_SIZE.height}
      viewBox={`0 0 ${ARMS_SIZE.width} ${ARMS_SIZE.height}`}
      style={svgStyle}
      role="img"
      aria-label={label}
    >
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        The two arms, seen from above
      </text>
      {/* the arms */}
      <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke={ARM_X_COLOR} strokeWidth={3} />
      <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke={ARM_Y_COLOR} strokeWidth={3} />
      <circle cx={CORNER.x} cy={CORNER.y} r={5} fill="#cbd5e1" />
      <circle cx={xEnd.x} cy={xEnd.y} r={5} fill={ARM_X_COLOR} />
      <circle cx={yEnd.x} cy={yEnd.y} r={5} fill={ARM_Y_COLOR} />
      {/* the rest outline: drawn on top so that it stays visible when an arm lies exactly on it */}
      <line x1={CORNER.x} y1={CORNER.y} x2={xRest.x} y2={xRest.y} stroke={REST_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={CORNER.x} y1={CORNER.y} x2={yRest.x} y2={yRest.y} stroke={REST_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={xRest.x} y1={xRest.y - 14} x2={xRest.x} y2={xRest.y + 14} stroke={REST_COLOR} strokeWidth={2.5} />
      <text x={xRest.x} y={xRest.y + 30} fill={REST_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        rest length 1.000
      </text>
      <line x1={yRest.x - 14} y1={yRest.y} x2={yRest.x + 14} y2={yRest.y} stroke={REST_COLOR} strokeWidth={2.5} />
      <text x={yRest.x + 20} y={yRest.y + 4} fill={REST_COLOR} fontSize="10" fontWeight="bold">
        rest length 1.000
      </text>
      <text x={xEnd.x} y={xEnd.y - 38} fill={ARM_X_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        Arm X
      </text>
      <text x={xEnd.x} y={xEnd.y - 25} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
        free-floating mass at its end
      </text>
      <text x={yEnd.x - 12} y={yEnd.y - 2} fill={ARM_Y_COLOR} fontSize="12" fontWeight="bold" textAnchor="end">
        Arm Y
      </text>
      <text x={yEnd.x - 12} y={yEnd.y + 11} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
        free-floating
      </text>
      <text x={yEnd.x - 12} y={yEnd.y + 22} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
        mass at its end
      </text>
      <text x={14} y={CORNER.y + 52} fill={TEXT_COLOR} fontSize="10">
        Corner: where the two arms meet
      </text>
      <line x1={CORNER.x} y1={CORNER.y + 8} x2={CORNER.x} y2={CORNER.y + 42} stroke={MUTED_COLOR} strokeWidth={1} />
    </svg>
  )
}

// ---- Picture 2 / Drawing B (Part 2), the graph of the arm lengths ----
const G = { width: 580, left: 62, right: 530, yMin: 0.75, yMax: 1.25, plotHeight: 180 }

function Arrow({ x, y, dir }: { x: number; y: number; dir: ArrowDirection }) {
  const tip = dir === 'up' ? y - 11 : y + 11
  const tail = dir === 'up' ? y + 11 : y - 11
  const back = dir === 'up' ? 8 : -8
  return (
    <g>
      <line x1={x} y1={tail} x2={x} y2={tip + back / 2} stroke={GUESS_COLOR} strokeWidth={3} />
      <polygon points={`${x},${tip} ${x - 6},${tip + back} ${x + 6},${tip + back}`} fill={GUESS_COLOR} />
    </g>
  )
}

function ArmGraph({
  amplitude,
  frequency,
  time,
  status,
  guesses,
  pink,
  label,
}: {
  amplitude: number
  frequency: number
  time: number
  status: RunStatus
  guesses: { direction: DirectionChoice; after: AfterChoice } | null
  pink: boolean
  label: string
}) {
  const top = guesses ? 64 : 40
  const bottom = top + G.plotHeight
  const height = bottom + (guesses ? 92 : pink ? 80 : 58)
  const total = runDuration(frequency)
  const period = periodOf(frequency)
  const px = (t: number) => G.left + (t / total) * (G.right - G.left)
  const py = (v: number) => bottom - ((v - G.yMin) / (G.yMax - G.yMin)) * G.plotHeight

  const trace = (axis: 'armXLength' | 'armYLength') => {
    const count = Math.max(2, Math.ceil((time / total) * 400))
    const points: string[] = []
    for (let i = 0; i <= count; i++) {
      const t = (i / count) * time
      points.push(`${px(t)},${py(gravitationalWaveStateAt(t, amplitude, frequency)[axis])}`)
    }
    return points.join(' ')
  }
  const showTrace = status !== 'idle' && time > 0
  const range = armLengthRange(amplitude).armX

  const peak = firstPeakState(amplitude, frequency)
  const xPeak = px(firstPeakTime(frequency))
  const arrows = guesses ? directionGuessArrows(guesses.direction) : null
  const showDirectionMark = guesses !== null && showTrace && time >= firstPeakTime(frequency)
  const showAfterMark = guesses !== null && status === 'complete'

  const ticks = Array.from({ length: RUN_CYCLES + 1 }, (_, k) => k * period)
  const fmt = (v: number) => v.toFixed(2).replace(/\.?0+$/, '')

  return (
    <svg
      width={G.width}
      height={height}
      viewBox={`0 0 ${G.width} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={label}
    >
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Arm lengths against time
      </text>
      {/* axes */}
      <line x1={G.left} y1={top} x2={G.left} y2={bottom} stroke={MUTED_COLOR} />
      <line x1={G.left} y1={bottom} x2={G.right} y2={bottom} stroke={MUTED_COLOR} />
      {[0.8, 0.9, 1.0, 1.1, 1.2].map((v) => (
        <g key={v}>
          <line x1={G.left - 4} y1={py(v)} x2={G.left} y2={py(v)} stroke={MUTED_COLOR} />
          <text x={G.left - 8} y={py(v) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            {v.toFixed(1)}
          </text>
        </g>
      ))}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={bottom} x2={px(t)} y2={bottom + 4} stroke={MUTED_COLOR} />
          <text x={px(t)} y={bottom + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {fmt(t)}
          </text>
        </g>
      ))}
      <text x={(G.left + G.right) / 2} y={bottom + 30} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        {pink
          ? `time (time units; at your speed, one full swing lasts ${period.toFixed(3)})`
          : 'time (time units; at speed 1.00, one unit is one full swing)'}
      </text>
      <text
        x={14}
        y={(top + bottom) / 2}
        fill={MUTED_COLOR}
        fontSize="10"
        textAnchor="middle"
        transform={`rotate(-90 14 ${(top + bottom) / 2})`}
      >
        arm length (rest length = 1.000)
      </text>
      {/* the rest line */}
      <line x1={G.left} y1={py(BASE_ARM_LENGTH)} x2={G.right} y2={py(BASE_ARM_LENGTH)} stroke={REST_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* the lines */}
      {showTrace && (
        <>
          <polyline points={trace('armXLength')} fill="none" stroke={ARM_X_COLOR} strokeWidth={2} />
          <polyline points={trace('armYLength')} fill="none" stroke={ARM_Y_COLOR} strokeWidth={2} />
        </>
      )}
      <text x={G.left + 150} y={20} fill={ARM_X_COLOR} fontSize="10" fontWeight="bold">
        Arm X length
      </text>
      <text x={G.left + 245} y={20} fill={ARM_Y_COLOR} fontSize="10" fontWeight="bold">
        Arm Y length
      </text>
      <text x={G.left + 340} y={20} fill={REST_COLOR} fontSize="10" fontWeight="bold">
        - - rest length 1.000
      </text>
      {/* pink marks: the learner's own strength and speed (Part 2) */}
      {pink && (
        <g>
          <line x1={G.left} y1={py(range.longest)} x2={G.right} y2={py(range.longest)} stroke={YOURS_COLOR} strokeWidth={1.5} strokeDasharray="6 4" />
          <line x1={G.left} y1={py(range.shortest)} x2={G.right} y2={py(range.shortest)} stroke={YOURS_COLOR} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={G.right - 4} y={py(range.longest) - 4} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
            YOUR STRENGTH: highest {range.longest.toFixed(3)}
          </text>
          <text x={G.right - 4} y={py(range.shortest) + 13} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
            YOUR STRENGTH: lowest {range.shortest.toFixed(3)}
          </text>
          <line x1={px(0)} y1={bottom + 50} x2={px(period)} y2={bottom + 50} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(0)} y1={bottom + 45} x2={px(0)} y2={bottom + 55} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(period)} y1={bottom + 45} x2={px(period)} y2={bottom + 55} stroke={YOURS_COLOR} strokeWidth={2} />
          <text x={px(period) + 8} y={bottom + 54} fill={YOURS_COLOR} fontSize="10" fontWeight="bold">
            YOUR SPEED: one swing = {period.toFixed(3)} time units
          </text>
        </g>
      )}
      {/* white marks: the learner's guesses (Part 1), drawn once the feature beside each is drawn */}
      {showDirectionMark && arrows && guesses && (
        <g>
          <Arrow x={xPeak + 26} y={py(peak.armXLength)} dir={arrows.armX} />
          <Arrow x={xPeak + 26} y={py(peak.armYLength)} dir={arrows.armY} />
          <line x1={xPeak + 26} y1={58} x2={xPeak + 26} y2={py(peak.armXLength) - 18} stroke={GUESS_COLOR} strokeWidth={2} />
          <rect x={G.left} y={32} width={390} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
          <text x={G.left + 195} y={49} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
            YOUR GUESS 1: {DIRECTION_SHORT[guesses.direction]}
          </text>
        </g>
      )}
      {showAfterMark && guesses && (
        <g>
          {(() => {
            const y = py(afterGuessMarkLength(guesses.after))
            const x = G.right + 20
            const boxW = 340
            const boxY = bottom + 42
            return (
              <>
                <polygon points={`${x},${y - 8} ${x + 8},${y} ${x},${y + 8} ${x - 8},${y}`} fill={GUESS_COLOR} />
                <line x1={x} y1={y + 8} x2={x} y2={boxY} stroke={GUESS_COLOR} strokeWidth={2} />
                <rect x={G.width - boxW - 4} y={boxY} width={boxW} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                <text x={G.width - boxW / 2 - 4} y={boxY + 17} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
                  YOUR GUESS 2: {AFTER_SHORT[guesses.after]}
                </text>
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

function DirectionQuestion({
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  selected: DirectionChoice | null
  submitted: DirectionChoice | null
  onSelect: (choice: DirectionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        When a gravitational wave passes through the two perpendicular arms, do you think both
        arms stretch and squeeze together (the same way, at the same time), or do they do opposite
        things?
      </p>
      <div style={{ marginBottom: '0.5rem' }}>
        {directionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${directionChoices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}

function AfterQuestion({
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  selected: AfterChoice | null
  submitted: AfterChoice | null
  onSelect: (choice: AfterChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        After the wave has completely passed, do you think the arms end up longer than they
        started, shorter, or back to their original length?
      </p>
      <div style={{ marginBottom: '0.5rem' }}>
        {afterChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${afterChoices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}

const captionBox = {
  marginTop: '1rem',
  padding: '1rem 1.25rem',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: 'var(--text-muted)',
} as const

export function GravitationalWaveExperiment({ onComplete, onTutorComplete }: GravitationalWaveExperimentProps) {
  const [directionPrediction, setDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [afterPrediction, setAfterPrediction] = useState<AfterChoice | null>(null)
  const [submittedDirection, setSubmittedDirection] = useState<DirectionChoice | null>(null)
  const [submittedAfter, setSubmittedAfter] = useState<AfterChoice | null>(null)
  const [runCount, setRunCount] = useState(0)

  // Part 2's own settings (the learner's trial values)
  const [amplitude, setAmplitude] = useState<number>(TYPICAL_EVENT.amplitude)
  const [frequency, setFrequency] = useState<number>(TYPICAL_EVENT.frequency)

  const part1 = useRunner(onComplete)
  const part2 = useRunner()

  const hasAllPredictions = directionPrediction !== null && afterPrediction !== null
  const hasSubmitted = submittedDirection !== null && submittedAfter !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const handleRun = () => {
    if (!hasAllPredictions || part1Running) return
    if (!hasSubmitted) {
      setSubmittedDirection(directionPrediction)
      setSubmittedAfter(afterPrediction)
    }
    setRunCount((count) => count + 1)
    part1.start(runDuration(TYPICAL_EVENT.frequency))
  }

  // Start over: the learner can choose both predictions again. Clears both runs, Part 2's settings and the tutor.
  const handleStartOver = () => {
    if (part1Running || part2Running) return
    part1.reset()
    part2.reset()
    setDirectionPrediction(null)
    setAfterPrediction(null)
    setSubmittedDirection(null)
    setSubmittedAfter(null)
    setAmplitude(TYPICAL_EVENT.amplitude)
    setFrequency(TYPICAL_EVENT.frequency)
    setRunCount((count) => count + 1)
  }

  const handleRunYours = () => {
    if (!part1Done || part2Running) return
    part2.start(runDuration(frequency))
  }

  const state1 = gravitationalWaveStateAt(part1.status === 'idle' ? 0 : part1.time, TYPICAL_EVENT.amplitude, TYPICAL_EVENT.frequency)
  const state2 = gravitationalWaveStateAt(part2.status === 'idle' ? 0 : part2.time, amplitude, frequency)

  const typicalRange = armLengthRange(TYPICAL_EVENT.amplitude)
  const typicalEnd = armLengthsAfterRun(TYPICAL_EVENT.amplitude, TYPICAL_EVENT.frequency)
  const typicalPeak = firstPeakState(TYPICAL_EVENT.amplitude, TYPICAL_EVENT.frequency)
  const strongPreset = presets[2]
  const strongRange = armLengthRange(strongPreset.amplitude).armX
  const guesses = submittedDirection && submittedAfter ? { direction: submittedDirection, after: submittedAfter } : null

  const readout = (state: ReturnType<typeof gravitationalWaveStateAt>) => (
    <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
      Strain: {fixed3(state.strain)} &nbsp;|&nbsp; Arm X length: {fixed3(state.armXLength)} &nbsp;|&nbsp; Arm Y length:{' '}
      {fixed3(state.armYLength)}
    </p>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — Ripples in Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> The Curved Spacetime experiment (in the Gravity and Curved Spacetime chapter) showed
            that curved space can make two straight-as-possible paths drift together. But can spacetime's curvature itself
            move — can it travel somewhere, like a ripple on a pond? And if it did, could we ever actually detect it?
          </p>
          <p style={paragraph}>
            <strong>What "a ripple in spacetime" actually means.</strong> Every experiment in the "Gravity and Curved
            Spacetime" chapter showed spacetime curving around a mass that just sits there — the curvature was always fixed in
            place, like a bowling ball resting in the middle of a stretched sheet. But if that mass suddenly moves —
            especially something as violent as two black holes spiraling into each other — the dent it makes in spacetime has
            to change too. And that change can't happen everywhere at once: the experiment "Why can't light go faster?" (in
            the Relativity of Time and Motion chapter) showed that nothing can spread faster than the speed of light, and a
            change in spacetime's own shape is no exception. So the change ripples outward from the source at exactly that
            speed, carrying a real, physical distortion of space along with it. That traveling distortion is a gravitational
            wave. What it does to the space it passes through is what you will predict and then watch.
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> Drop a stone into a still pond. The ripple that spreads outward isn't water
            traveling all the way across the pond — it's a changing shape traveling, while each bit of water mostly just bobs
            up and down in place as the ripple passes under it. A gravitational wave works the same way for space itself:
            nothing physically flies outward from the source, but the shape of space at any given point stretches and
            squeezes as the ripple washes through it — which is exactly what you're about to watch happen to the two arms
            below.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You'll watch two perpendicular "arms" of free-floating points, set up the same way
            a real gravitational-wave detector is built, while a wave passes through. Before you press Run, you'll predict
            what the two arms do while the wave passes, and what state they are in once it has gone.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, make your two predictions, then run a wave modelled on a real detected event
            and watch the arms. In Part 2, choose your own wave strength and speed and run it again.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The "Words and formulas" box below has each one, with a short plain meaning:
            gravitational wave, free-floating mass, rest length, strain, amplitude, speed, swing, polarization, LIGO,
            GW150914 and light-year.
          </p>
          <p style={paragraph}>
            <strong>Your predictions and the real pictures.</strong> Your predictions never change the real pictures, the table
            or the numbers: the arms and the graph come from a calculation that knows nothing about what you guessed. Your two
            guesses are drawn on the graph in white, in boxes labelled YOUR GUESS, and listed again beside the results. In
            Part 2, the sliders do change the drawings; those marks are pink.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The effect here is hugely exaggerated — a real gravitational wave changes a real detector's arms by about
              10,000 times less than the width of the nucleus of an atom, far too small to show at any visible scale.
            </li>
            <li>
              The wave here arrives at one constant strength and speed for simplicity; real events (like two black holes
              spiraling together) actually build up in both strength and speed right until the moment of collision.
            </li>
            <li>
              This shows only one pattern a gravitational wave can stretch and squeeze in (called a "polarization") — real
              gravitational waves can also stretch and squeeze along a second, diagonal pair of directions at the same time,
              which this experiment leaves out.
            </li>
            <li>
              This shows the effect on two arms directly, not how a real detector actually measures such a tiny change (LIGO
              uses lasers bounced down each arm) — that measurement process itself isn't modeled here.
            </li>
          </ul>
          <p style={{ marginTop: '1rem', marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. The original scientific papers are
            listed in Part 3, after the results. Checked on 4 November 2026. Each link opens in a new tab.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {PLAIN_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        <ReferencePanel
          entries={[
            { term: 'Gravitational wave', meaning: 'a ripple in the shape of spacetime that travels outward from a violent event, such as two black holes spiralling into each other, at the speed of light.' },
            { term: 'Free-floating mass', meaning: 'a mass with nothing pushing or pulling it, so it only moves if space itself changes.' },
            { term: 'Rest length', meaning: 'how long an arm is when no wave is passing. Every length on this page is a fraction of it, so 1.000 means exactly the rest length.' },
            { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.' },
            { term: 'Amplitude (strength)', meaning: 'the biggest strain the wave reaches.' },
            { term: 'Speed (frequency)', meaning: 'how many full swings the wave makes in one time unit. At speed 1.00 there is one swing in each time unit.' },
            { term: 'Swing (cycle)', meaning: "one complete repeat of the wave's pattern. A run plays five swings." },
            { term: 'Polarization', meaning: 'the pattern in which a wave changes lengths. This page shows only one pattern; real waves can also act along a second, diagonal pair of directions.' },
            { term: 'LIGO', meaning: 'the Laser Interferometer Gravitational-Wave Observatory: two detectors in the United States, each with two arms 4 kilometres long.' },
            { term: 'GW150914', meaning: 'the name of the first gravitational wave ever detected. "GW" stands for gravitational wave and the numbers are the date, 14 September 2015.' },
            { term: 'Light-year', meaning: 'the distance light travels in one year.' },
            { term: 'Formula: strain at a moment', meaning: `amplitude × sin(2π × speed × time). The sine makes the strain swing back and forth between plus and minus the amplitude. Example: amplitude ${TYPICAL_EVENT.amplitude.toFixed(2)}, speed ${TYPICAL_EVENT.frequency.toFixed(2)}, time ${firstPeakTime(TYPICAL_EVENT.frequency).toFixed(2)} gives ${TYPICAL_EVENT.amplitude.toFixed(2)} × sin(2π × ${firstPeakTime(TYPICAL_EVENT.frequency).toFixed(2)}) = ${TYPICAL_EVENT.amplitude.toFixed(2)} × 1 = ${fixed3(typicalPeak.strain)}.` },
            { term: 'Formula: one swing', meaning: `lasts 1 ÷ speed. Example: at speed ${strongPreset.frequency.toFixed(2)}, 1 ÷ ${strongPreset.frequency.toFixed(2)} = ${periodOf(strongPreset.frequency).toFixed(3)} time units, so five swings last ${runDuration(strongPreset.frequency).toFixed(3)} time units.` },
            ...(part1Done
              ? [{ term: 'Formula: arm lengths', meaning: `Arm X = 1 + strain ÷ 2 and Arm Y = 1 − strain ÷ 2, so each moves by amplitude ÷ 2. Example: strain ${fixed3(typicalPeak.strain)} gives Arm X = ${fixed3(typicalPeak.armXLength)} and Arm Y = ${fixed3(typicalPeak.armYLength)}.` }]
              : []),
          ]}
        />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make two predictions about what the two arms do when a wave passes. Then you press Run and watch a wave,
          modelled on a real detected event, pass through them. Your guesses are drawn on the graph in white once the graph
          appears.
        </PartHeader>

        <DirectionQuestion
          selected={directionPrediction}
          submitted={submittedDirection}
          onSelect={setDirectionPrediction}
          disabled={hasSubmitted}
        />
        <AfterQuestion
          selected={afterPrediction}
          submitted={submittedAfter}
          onSelect={setAfterPrediction}
          disabled={hasSubmitted}
        />

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          The wave you will watch is the "Typical detected event" wave: strength {TYPICAL_EVENT.amplitude.toFixed(2)}, speed{' '}
          {TYPICAL_EVENT.frequency.toFixed(2)}. Your guesses do not change it.
        </p>
        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllPredictions || part1Running}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {part1Running ? 'Running...' : part1Done ? 'Run again' : 'Run'}
        </button>
        {hasSubmitted && (
          <button
            type="button"
            className="toggle-button"
            onClick={handleStartOver}
            disabled={part1Running || part2Running}
            style={{ marginLeft: '0.75rem' }}
          >
            Start over
          </button>
        )}
        {!hasAllPredictions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Answer both predictions above to press Run.</p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the two arms</p>
          <ArmsPicture
            armXLength={state1.armXLength}
            armYLength={state1.armYLength}
            label="Two arms at a right angle meeting at a corner, with a free-floating mass at the end of each. Arm X is the horizontal arm in violet and Arm Y is the vertical arm in cyan. Amber dashed lines and ticks mark each arm's rest length"
          />
          {readout(state1)}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>
            <strong>Strain</strong> is a plain number saying how strongly the wave is acting on space at this instant. 0 means
            the wave is doing nothing at this instant; the bigger the number, positive or negative, the stronger its effect.
            The wave's <strong>amplitude</strong> is the biggest strain it reaches.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            <strong>Where the real picture comes from.</strong> <em>Calculated here, not measured:</em> the arm lengths come
            from a simple wave formula this page uses, with a wave strength of {TYPICAL_EVENT.amplitude.toFixed(2)}, much
            larger than any real wave so that you can see it. No instrument measured them. What real detectors measured is
            described under "A real detection" in Part 3.
          </p>

          <div style={captionBox}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How to read Picture 1</p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>What you are looking at.</strong> A view from above of a very small, simplified detector. A real
              gravitational-wave detector such as LIGO has two long tubes, called arms, joined at a right angle like the
              letter L. This picture draws just those two arms, as two lines. Nothing here is a photograph: it is a drawing
              of a calculation.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The grey dot, "Corner: where the two arms meet".</strong> The point where the two arms join. It
                stays where it is.
              </li>
              <li>
                <strong>The violet line, Arm X.</strong> The horizontal arm. <strong>The cyan line, Arm Y.</strong> The
                vertical arm. These two colours are used for the same two arms in Picture 2, so you can match a line there
                to an arm here.
              </li>
              <li>
                <strong>The violet and cyan dots at the far ends, "free-floating mass at its end".</strong> A free-floating
                mass is a small mass with nothing pushing or pulling it. Because nothing pushes it, one of these dots can
                only move if the space between it and the corner changes. A daily-life comparison: two corks floating on a
                still pond only drift apart if the water between them is stretched; nobody has to push them.
              </li>
              <li>
                <strong>The amber dashed lines and the amber ticks marked "rest length 1.000": a fixed ruler.</strong> Each
                dashed line runs from the corner to the spot where that arm would end if no wave were passing, and the tick
                marks that spot. The ruler never moves, even while the arms do. It works like a pencil mark on a door frame
                showing how tall a child was last year: the mark stays where it is, so you can see how much has changed since.
                To use it, compare each coloured dot with its amber tick:
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Dot exactly on its tick:</strong> that arm is at its rest length. The number under the picture
                    reads 1.000.
                  </li>
                  <li>
                    <strong>Dot farther from the corner than its tick:</strong> that arm is longer than at rest. The number
                    reads more than 1.000, for example 1.100.
                  </li>
                  <li>
                    <strong>Dot nearer the corner than its tick:</strong> that arm is shorter than at rest. The number reads
                    less than 1.000, for example 0.900.
                  </li>
                </ul>
              </li>
              <li>
                <strong>The numbers under the picture</strong> (Strain, Arm X length, Arm Y length) change live while the
                wave passes. Lengths are fractions of the rest length, with no unit. 1.000 is exactly the rest length;
                1.100 would be one-tenth (10 percent) longer; 0.900 would be one-tenth shorter.
              </li>
            </ul>
            <p style={{ margin: '0.75rem 0 0.25rem' }}>
              <strong>What you see, and when.</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Before Run:</strong> no wave is passing, so nothing moves. The strain reads 0.000, both arms read
                1.000, and each dot sits exactly on its amber tick.
              </li>
              <li>
                <strong>While the run plays:</strong> the wave passes through the arms, the dots move away from their ticks and
                back, and the numbers under the picture change with them. The run lasts {RUN_CYCLES} full swings of the wave (see "Swing" in the Words
                and formulas box). The animation always takes about eight seconds to play, whatever the wave's speed, so
                each swing lasts a little over one second at speed 1.00. How fast it plays never changes the result.
              </li>
              <li>
                <strong>After the run:</strong> the picture stays at the last moment. The wave has gone, so each dot is back on
                its amber tick and the numbers read 1.000 again. Picture 2 below shows the whole run as a graph, so you can see
                what happened in between.
              </li>
            </ul>
            <p style={{ margin: '0.75rem 0 0' }}>
              <strong>A note on size.</strong> The movement here is hugely exaggerated so that you can see it. A real wave
              moves a real detector's arms by far less than anyone could see (see "A real detection" in Part 3).
            </p>
          </div>
        </div>

        {part1.status !== 'idle' && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 2: the two arm lengths against time</p>
            <ArmGraph
              amplitude={TYPICAL_EVENT.amplitude}
              frequency={TYPICAL_EVENT.frequency}
              time={part1.time}
              status={part1.status}
              guesses={guesses}
              pink={false}
              label="A graph of the two arm lengths against time during the run, with a dashed line at the rest length 1.000. Arm X is violet and Arm Y is cyan. Your two guesses are drawn in white in boxes marked YOUR GUESS"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
              <strong>Where the real picture comes from.</strong> <em>Calculated here, not measured:</em> the two lines come from
              the same simple wave formula as Picture 1, with a wave strength of {TYPICAL_EVENT.amplitude.toFixed(2)}. No
              instrument measured them. <em>Your guesses:</em> the white marks and boxes are your guesses, drawn only as
              markers. They are not part of the calculation.
            </p>

            <div style={captionBox}>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How to read Picture 2</p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What you are looking at.</strong> A graph. Picture 1 shows the arms at one moment; this graph keeps
                the whole history of the run, so you can see how both arms changed from the start to the end.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The bottom axis is time.</strong> The numbers {Array.from({ length: RUN_CYCLES + 1 }, (_, k) => k * periodOf(TYPICAL_EVENT.frequency)).join(', ')}{' '}
                  are in "time units". They are simulated time, not seconds on your watch. At speed{' '}
                  {TYPICAL_EVENT.frequency.toFixed(2)}, one time unit is one full swing of the wave, so the run lasts{' '}
                  {runDuration(TYPICAL_EVENT.frequency)} time units. The lines are drawn from left to right as the run plays.
                </li>
                <li>
                  <strong>The side axis is arm length,</strong> as a fraction of the rest length. The middle mark, 1.0, is the
                  rest length. Higher on the graph means a longer arm; lower means a shorter arm.
                </li>
                <li>
                  <strong>The amber dashed line, "rest length 1.000" (named at the top right).</strong> Where a line sits on this dashed line, that arm
                  is at its rest length. Above it, the arm is longer than at rest. Below it, the arm is shorter. The farther
                  from the dashed line, the bigger the change.
                </li>
                <li>
                  <strong>The violet line is Arm X and the cyan line is Arm Y,</strong> the same two arms and colours as
                  Picture 1. The labels "Arm X length" and "Arm Y length" at the top right of the graph say which is which.
                </li>
                <li>
                  <strong>Each wiggle is one swing.</strong> A line going up and coming back down is the arm getting longer
                  and then returning, and so on. Five wiggles mean five swings.
                </li>
                <li>
                  <strong>The white marks are your guesses.</strong> Each is in a white box labelled YOUR GUESS and joined to
                  its mark by a line. A white mark shows only what you guessed. It does not say whether you were right, and
                  it does not change the lines.
                </li>
              </ul>
              <p style={{ margin: '0.75rem 0 0.25rem' }}>
                <strong>What you see, and when.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>While the run plays,</strong> both lines are drawn from the left, a little further each moment.
                </li>
                <li>
                  <strong>YOUR GUESS 1 appears</strong> once the lines have reached their first high point and low point, at
                  time {firstPeakTime(TYPICAL_EVENT.frequency)}. Its two white arrows sit beside the lines there. Each arrow
                  shows what your answer says that arm does at that moment: an arrow pointing up means "gets longer" and an
                  arrow pointing down means "gets shorter". Your answer was a choice, not a number, so the arrows are only
                  markers.
                </li>
                <li>
                  <strong>YOUR GUESS 2 appears</strong> when the run has finished, as a white diamond at the right-hand edge.
                  Above the dashed line means you guessed "longer than they started", below it "shorter", and on it "back to
                  their original length". The diamond sits a small fixed step above or below the dashed line. That step says
                  nothing about how much longer or shorter, because your answer was a choice and not a number.
                </li>
              </ul>
              {part1Done && (
                <>
                  <p style={{ margin: '0.75rem 0 0.25rem' }}>
                    <strong>A worked moment: reading one point.</strong> Find time {firstPeakTime(TYPICAL_EVENT.frequency)} on
                    the bottom axis. That is the first high point, where the strain is {fixed3(typicalPeak.strain)}. Go up to
                    the violet line and across to the side axis: Arm X is {fixed3(typicalPeak.armXLength)}. Do the same for
                    the cyan line: Arm Y is {fixed3(typicalPeak.armYLength)}. Each is {fixed3(typicalRange.armX.stretchedBy)}{' '}
                    away from the rest length of 1.000, which is {fixed3(typicalRange.armX.stretchedBy * 100)} percent of it.
                  </p>
                  <p style={{ margin: '0.5rem 0 0.25rem' }}>
                    <strong>What to look for</strong>
                  </p>
                  <LookForList
                    items={[
                      {
                        look: 'the violet and cyan lines at the first high point (time 0.25), and the arrows of YOUR GUESS 1 beside them.',
                        means: `with the strain at ${fixed3(typicalPeak.strain)}, Arm X is at ${fixed3(typicalPeak.armXLength)} and Arm Y at ${fixed3(typicalPeak.armYLength)}. The two lines are on opposite sides of the dashed line and the same distance (${fixed3(typicalRange.armX.stretchedBy)}) from it. Your arrows say what you expected each arm to do there.`,
                        matters: 'a detector works by comparing its two arms, so what matters is how the two lengths change together, not either length on its own. This is the thing your first guess was about.',
                      },
                      {
                        look: 'the right-hand end of both lines, next to the dashed line, and the white diamond of YOUR GUESS 2.',
                        means: `after ${RUN_CYCLES} swings both lines come back to the dashed line: both arms end at ${fixed3(typicalEnd.armXLength)}. The diamond shows where you expected them to end.`,
                        matters: 'in this model the wave leaves the arms as it found them. The detector measures the ripple while it passes, not a lasting change. This is the thing your second guess was about.',
                      },
                      {
                        look: 'how many wiggles each line has, and how far each wiggle rises above and falls below the dashed line.',
                        means: `${RUN_CYCLES} wiggles, because the run is set to ${RUN_CYCLES} swings at speed ${TYPICAL_EVENT.frequency.toFixed(2)}. Each wiggle reaches about ${fixed3(typicalRange.armX.stretchedBy)} above and below the dashed line.`,
                        matters: 'the speed of the wave sets how often the arms swing, and the strength sets how far. Part 2 lets you change each one and see the other stay put.',
                      },
                      {
                        look: 'all the white marks and boxes together.',
                        means: 'each shows your guess drawn next to the real lines, in the place where its answer can be read.',
                        matters: 'you can compare your guess with what the calculation gave, side by side. Nothing on the graph changes with your guess.',
                      },
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the wave: change its strength and its speed, or pick a preset, and run it again. These sliders
              change the drawings in this Part, marked in pink. They do not change Part 1's pictures, the table in Part 3, or
              your guesses.
            </PartHeader>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>Your guesses do not change these drawings or the table in Part 3, but these sliders do change the drawings below.</strong>{' '}
              The strength and the speed are trial values of your own, not a real source.
            </p>

            <label htmlFor="wave-amplitude" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Wave strength (amplitude): {amplitude.toFixed(2)}
            </label>
            <input
              id="wave-amplitude"
              type="range"
              min={0.05}
              max={0.4}
              step={0.01}
              value={amplitude}
              disabled={part2Running}
              onChange={(event) => setAmplitude(Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <label htmlFor="wave-frequency" style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem' }}>
              Wave speed (frequency): {frequency.toFixed(2)}
            </label>
            <input
              id="wave-frequency"
              type="range"
              min={0.25}
              max={2}
              step={0.05}
              value={frequency}
              disabled={part2Running}
              onChange={(event) => setFrequency(Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: '1rem' }}>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="toggle-button"
                  disabled={part2Running}
                  onClick={() => {
                    setAmplitude(preset.amplitude)
                    setFrequency(preset.frequency)
                  }}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="action-button"
              onClick={handleRunYours}
              disabled={part2Running}
              style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
            >
              {part2Running ? 'Running...' : 'Run your wave'}
            </button>

            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing A: your arms</p>
              <ArmsPicture
                armXLength={state2.armXLength}
                armYLength={state2.armYLength}
                label="The two arms again, at your chosen wave strength and speed, with the same labels as Picture 1"
              />
              {readout(state2)}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Calculated here, not measured:</em> the arm lengths come
                from the same simple wave formula as Part 1, at the strength and speed you chose. They are trial values, not a
                real source.
              </p>

              <div style={captionBox}>
                <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How to read Drawing A</p>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What you are looking at.</strong> The same two arms as in Picture 1, seen from above, but now moved
                  by the wave that you chose with the sliders. Nothing else is different: it is drawn the same way.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The grey dot, "Corner: where the two arms meet".</strong> It stays where it is.
                  </li>
                  <li>
                    <strong>The violet line, Arm X (horizontal), and the cyan line, Arm Y (vertical).</strong> The dot at the
                    end of each is a free-floating mass: a small mass with nothing pushing it, which only moves if the space
                    between it and the corner changes.
                  </li>
                  <li>
                    <strong>The amber dashed lines and ticks, "rest length 1.000": a fixed ruler.</strong> Each shows where
                    that arm would end if no wave were passing. It never moves, so you can compare each dot with its tick: a
                    dot on its tick means the arm is at its rest length; farther from the corner means longer; nearer means
                    shorter.
                  </li>
                  <li>
                    <strong>The numbers under the picture</strong> (Strain, Arm X length, Arm Y length) change live. Lengths
                    are fractions of the rest length, so 1.000 is exactly the rest length.
                  </li>
                  <li>
                    <strong>No pink marks are drawn on this picture.</strong> The pink marks for your settings are on Drawing
                    B below. Here, your settings show up as how far the dots move and how quickly.
                  </li>
                </ul>
                <p style={{ margin: '0.75rem 0 0.25rem' }}>
                  <strong>What you see, and when.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Before you press "Run your wave":</strong> nothing moves. Each dot sits on its tick and the
                    numbers read 1.000.
                  </li>
                  <li>
                    <strong>While it runs (about eight seconds):</strong> the dots move away from their ticks and back. A
                    larger strength makes them move farther. A higher speed makes them go back and forth more quickly. You
                    cannot change the sliders until it ends.
                  </li>
                  <li>
                    <strong>After it ends:</strong> the wave has gone, so each dot is back on its tick. Drawing B keeps the
                    whole record.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing B: your arm lengths against time</p>
              <ArmGraph
                amplitude={amplitude}
                frequency={frequency}
                time={part2.time}
                status={part2.status}
                guesses={null}
                pink
                label="A graph of the two arm lengths against time at your chosen strength and speed. Pink dashed lines mark the highest and lowest length your strength reaches and a pink bracket marks one swing at your speed"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Calculated here, not measured:</em> the two lines come
                from the same simple wave formula as Part 1, at the strength and speed you chose. <em>Imagined for the
                question:</em> the pink marks show your own settings. They are trial values, not a real source.
              </p>

              <div style={captionBox}>
                <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How to read Drawing B</p>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What you are looking at.</strong> A graph, drawn like Picture 2 in Part 1: it keeps the whole history
                  of the run for your wave, so you can see how both arms changed from the start to the end. The pink marks
                  are the only new thing.
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The bottom axis is time,</strong> in "time units" (simulated time, not seconds on your watch). At
                    speed 1.00 one time unit is one full swing. The label under the axis tells you how long one full swing
                    lasts at your speed.
                  </li>
                  <li>
                    <strong>The side axis is arm length,</strong> as a fraction of the rest length. 1.0 in the middle is the
                    rest length. Higher means a longer arm; lower means a shorter arm.
                  </li>
                  <li>
                    <strong>The amber dashed line is the rest length, 1.000.</strong> The violet line is Arm X and the cyan
                    line is Arm Y, the same arms and colours as Drawing A. The legend across the top names all three.
                  </li>
                  <li>
                    <strong>The pink dashed lines, "YOUR STRENGTH: highest" and "YOUR STRENGTH: lowest".</strong> They show
                    the longest and the shortest that each arm will get at your strength, with the numbers written on them.
                    They are the same distance above and below the amber dashed line. Move the strength slider and they move
                    with it, even before you press "Run your wave".
                  </li>
                  <li>
                    <strong>The pink bracket under the graph, "YOUR SPEED: one swing = ..."</strong> shows how much of the time
                    axis one full swing of your wave takes. The number written on it is that time, in time units. Move the
                    speed slider and the bracket changes with it.
                  </li>
                  <li>
                    <strong>The bottom axis always shows exactly five swings.</strong> The run always plays {RUN_CYCLES}{' '}
                    swings, so the graph is stretched to fit them. A faster wave does not give more wiggles. It gives the same
                    five wiggles in a shorter time, so read the numbers under the axis to see how long the run is.
                  </li>
                  <li>
                    <strong>Pink always means your own setting.</strong> No white guess marks are drawn here: your guesses
                    belong to Part 1.
                  </li>
                </ul>
                <p style={{ margin: '0.75rem 0 0.25rem' }}>
                  <strong>What you see, and when.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Before you press "Run your wave":</strong> the graph has no lines yet. The pink marks are already
                    in place for the settings on the sliders.
                  </li>
                  <li>
                    <strong>While it runs:</strong> the two lines are drawn from left to right.
                  </li>
                  <li>
                    <strong>After it ends:</strong> the lines stay on the graph. Change a slider and press "Run your wave"
                    again to compare.
                  </li>
                  <li>Trial values: these are your own numbers, not a real source, and they do not say the real detector is like this.</li>
                </ul>
                <p style={{ margin: '0.75rem 0 0.25rem' }}>
                  <strong>A worked moment.</strong> With the Strong / nearby source preset (strength{' '}
                  {strongPreset.amplitude.toFixed(2)}, speed {strongPreset.frequency.toFixed(2)}), the arms reach{' '}
                  {strongRange.longest.toFixed(3)} and {strongRange.shortest.toFixed(3)}, and one swing lasts 1 ÷{' '}
                  {strongPreset.frequency.toFixed(2)} = {periodOf(strongPreset.frequency).toFixed(3)} time units, so five
                  swings last {runDuration(strongPreset.frequency).toFixed(3)} time units.
                </p>
                <p style={{ margin: '0.5rem 0 0.25rem' }}>
                  <strong>What to look for</strong>
                </p>
                <LookForList
                  items={[
                    {
                      look: 'the pink dashed lines.',
                      means: `the highest and lowest length each arm reaches at your strength (${armLengthRange(amplitude).armX.longest.toFixed(3)} and ${armLengthRange(amplitude).armX.shortest.toFixed(3)} now).`,
                      matters: 'doubling the strength doubles the distance from the rest line, so strength sets how far the arms swing.',
                    },
                    {
                      look: 'the pink bracket.',
                      means: `the time one full swing takes at your speed (${periodOf(frequency).toFixed(3)} now).`,
                      matters: 'speed sets how fast the arms swing; raise it and the bracket shrinks but the dashed lines stay where they are.',
                    },
                    {
                      look: 'the number of wiggles, after you change the speed and run again.',
                      means: `still ${RUN_CYCLES} wiggles, squeezed into a shorter or longer time.`,
                      matters: 'speed changes how often the arms swing, not how many swings the run has and not how far they swing.',
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && guesses && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with
              your guesses or with the sliders in Part 2.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each one's number appears. They are not
              marked here, and they never change a picture or a table.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Guess 1, the direction:</strong> {directionChoices.find((c) => c.value === guesses.direction)?.label.toLowerCase()}.
                Its answer is in Table 1, both rows, columns "Stretched by up to" and "Squeezed by up to".
              </li>
              <li>
                <strong>Guess 2, after the wave:</strong> {afterChoices.find((c) => c.value === guesses.after)?.label.toLowerCase()}.
                Its answer is in Table 1, the column "Length at the end".
              </li>
            </ul>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>
              Table 1: how far each arm moved in the Part 1 run (strength {TYPICAL_EVENT.amplitude.toFixed(2)}, speed{' '}
              {TYPICAL_EVENT.frequency.toFixed(2)})
            </p>
            <ResultsTable
              minWidth={620}
              head={['Arm', 'Shortest', 'Longest', 'Stretched by up to', 'Squeezed by up to', 'Length at the end']}
              rows={[
                [
                  <>
                    Arm&nbsp;X
                    <PredictionTag n={1} />
                  </>,
                  fixed3(typicalRange.armX.shortest),
                  fixed3(typicalRange.armX.longest),
                  fixed3(typicalRange.armX.stretchedBy),
                  fixed3(typicalRange.armX.squeezedBy),
                  <>
                    {fixed3(typicalEnd.armXLength)}
                    <PredictionTag n={2} />
                  </>,
                ],
                [
                  <>
                    Arm&nbsp;Y
                    <PredictionTag n={1} />
                  </>,
                  fixed3(typicalRange.armY.shortest),
                  fixed3(typicalRange.armY.longest),
                  fixed3(typicalRange.armY.stretchedBy),
                  fixed3(typicalRange.armY.squeezedBy),
                  <>
                    {fixed3(typicalEnd.armYLength)}
                    <PredictionTag n={2} />
                  </>,
                ],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>
              Lengths are fractions of the rest length, 1.000. The tags show which of your guesses relates to a row or a
              column. They do not say whether a guess matched.
            </p>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Shortest and longest.</strong> <em>What it is:</em> the lowest and highest length each arm reached
                  during the run. <em>What it means:</em> Arm X went from {fixed3(typicalRange.armX.shortest)} to{' '}
                  {fixed3(typicalRange.armX.longest)} and Arm Y from {fixed3(typicalRange.armY.shortest)} to{' '}
                  {fixed3(typicalRange.armY.longest)}, so each moved {fixed3(typicalRange.armX.stretchedBy)} either side of its
                  rest length of 1.000. <em>Why it matters:</em> the size of that move is set by the wave's strength: at
                  strength {TYPICAL_EVENT.amplitude.toFixed(2)} each arm moves by half of it. A real detector measures this
                  move.
                </li>
                <li>
                  <strong>Stretched and squeezed by up to.</strong> <em>What it is:</em> the biggest increase and the biggest
                  decrease from the rest length. <em>What it means:</em> {fixed3(typicalRange.armX.stretchedBy)} each, for both
                  arms. <em>Why it matters:</em> the stretch and the squeeze are the same size, so the wave changes the shape
                  of the detector, not its size overall. Why this happens is for the tutor.
                </li>
                <li>
                  <strong>Length at the end.</strong> <em>What it is:</em> the length of each arm once the run has finished.{' '}
                  <em>What it means:</em> {fixed3(typicalEnd.armXLength)} for both, the same as the start. <em>Why it
                  matters:</em> the arms swing and come back, so the wave leaves no lasting change in this model.
                </li>
                <li>
                  <strong>How big this is in real life.</strong> <em>What it means with real numbers:</em> if the arms were{' '}
                  {LIGO_ARM_KM} km long, as LIGO's are, a change of {fixed3(typicalRange.armX.stretchedBy)} would be{' '}
                  {fixed3(typicalRange.armX.stretchedBy)} × {LIGO_ARM_KM} km ={' '}
                  {(changeInMetres(typicalRange.armX.stretchedBy, LIGO_ARM_KM) / 1000).toFixed(1)} km, or{' '}
                  {changeInMetres(typicalRange.armX.stretchedBy, LIGO_ARM_KM).toFixed(0)} metres. The real wave from GW150914
                  changed the arms by about one part in 10²¹, which for {LIGO_ARM_KM} km is about{' '}
                  {realChangeIn1e18Metres().toFixed(0)} × 10⁻¹⁸ metres, far smaller than a proton. The strength used here (
                  {TYPICAL_EVENT.amplitude.toFixed(2)}) is more than 10<sup>{powersOfTenAboveReal(TYPICAL_EVENT.amplitude)}</sup>{' '}
                  times the real one. <em>Why it matters:</em> the pictures exaggerate the effect enormously so that you can see
                  it. <em>How sure the numbers are:</em> the {changeInMetres(typicalRange.armX.stretchedBy, LIGO_ARM_KM).toFixed(0)}{' '}
                  metres and the 10<sup>{powersOfTenAboveReal(TYPICAL_EVENT.amplitude)}</sup> come from this page's own numbers;
                  the real strain is the page's quoted figure (see "A real detection").
                </li>
              </ul>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>A real detection.</strong> This experiment's effect is hugely exaggerated. LIGO's real detectors have arms
              about 4 kilometers long, and the real gravitational wave from GW150914 (two colliding black holes, detected in
              2015) changed those arms by only about one part in 10²¹ — roughly 10,000 times smaller than the nucleus of an atom.
              LIGO has since detected many more, including GW170817 in 2017, a neutron-star merger also seen by ordinary
              telescopes moments later.
            </p>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The original scientific papers behind the real numbers on this page are
              listed here, after the results. They are written for scientists. Checked on 4 November 2026. Links open in a
              new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {PAPER_LINKS.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>: {link.what}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Done && guesses && (
        <>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess marks, then explains.
          </PartHeader>
          <GravitationalWaveTutor
            key={runCount}
            directionPrediction={guesses.direction}
            afterPrediction={guesses.after}
            amplitude={TYPICAL_EVENT.amplitude}
            frequency={TYPICAL_EVENT.frequency}
            onExplained={onTutorComplete}
          />
        </>
      )}
    </div>
  )
}
