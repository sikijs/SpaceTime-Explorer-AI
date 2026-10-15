import { useEffect, useState } from 'react'
import { EnergyMomentumTutor } from './EnergyMomentumTutor'
import { EnergyMomentumCollision, PART_TWO_REFERENCE_ENTRIES } from './EnergyMomentumCollision'
import type { CSSProperties } from 'react'
import { particleReading, readingFor, runInvariantExperiment } from '../physics/energyMomentum'
import type { EnergyMomentumReading } from '../physics/energyMomentum'

// Steps 4 and 5 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 1 only: the controls, the setup
// diagram, and the run that connects the diagram to the physics model (the curve of readings, the particle's own reading, the
// passing observer's reading sliding along the curve as their speed sweeps up, and the bars). Every number comes from
// `energyMomentum.ts`. The prediction (which gates the Run button), the introduction stages, the quick-reference panel, the
// results, the tutors and Parts 2 and 3 are later steps. The presets are Decision 5 of that specification. Wording here is draft
// for the owner's review (CLAUDE.md §28.1).
type Kind = 'particle' | 'light'
type Prediction = 'same' | 'nothing' | 'one-number'

// The three answers of Part 1's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
// Not scored, and the learner is not told which is right (§12).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'same', label: '(a) The same energy and the same momentum.' },
  { value: 'nothing', label: '(b) Different energies and different momenta, with nothing about them that they agree on.' },
  {
    value: 'one-number',
    label:
      '(c) Different energies and different momenta, but there is some number, worked out from the energy and the momentum, that they agree on.',
  },
]

// The element Part 2 sits in, so the skip link can scroll to it.
const PART_TWO_ID = 'energy-momentum-part-2'

const KIND_CHOICES: { value: Kind; label: string }[] = [
  { value: 'particle', label: 'A particle with mass' },
  { value: 'light', label: 'A light pulse' },
]
const PARTICLE_SPEED_PRESETS = [0, 0.3, 0.6, 0.8, 0.9, 0.99]
const PASSING_SPEED_PRESETS = [-0.8, -0.6, -0.3, 0, 0.3, 0.6, 0.8]

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
// The passing observer's speed sweeps from 0 to its chosen value over the first part, then holds there.
const ANIMATION_DURATION_MS = 12_000
const SWEEP_END = 0.85

// The dark canvas used by the newer experiments, with light text and lines.
const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const TICK_COLOR = '#cbd5e1'
const LAB_COLOR = '#38bdf8'
const OWN_COLOR = '#4ade80'
const PASSING_COLOR = '#c4b5fd'
const CURVE_COLOR = '#facc15'
const ENERGY_BAR_COLOR = '#f59e0b'
const MOMENTUM_BAR_COLOR = '#8b5cf6'
const INVARIANT_BAR_COLOR = '#14b8a6'
// A dark outline so a label stays readable where it crosses a line.
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Drawing constants (SVG units). Momentum × c runs across, energy runs up; both are cut to fit the chosen setup.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 462
const LEFT_X = 70
const RIGHT_X = 440
const BOTTOM_Y = 392
const TOP_Y = 152

function kindWords(kind: Kind): string {
  return kind === 'particle' ? 'a particle with mass' : 'a light pulse'
}

// Numbers shown in the results table: four decimal places, with a minus sign for a negative number and no "-0.0000".
function formatNumber(value: number): string {
  const text = value.toFixed(4)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text
}

function passingLabel(speed: number): string {
  if (speed === 0) return '0c (at rest in the lab)'
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function signed(value: number, digits = 2): string {
  return value.toFixed(digits).replace('-', '−')
}

function niceStep(max: number): number {
  if (max <= 4) return 1
  if (max <= 10) return 2
  if (max <= 25) return 5
  return 10
}

// The observer's speed at a point in the playback: it rises from 0 to its chosen value, then holds.
function sweptSpeed(passingSpeed: number, progress: number): number {
  const fraction = Math.min(progress / SWEEP_END, 1)
  const eased = fraction * fraction * (3 - 2 * fraction)
  return passingSpeed * eased
}

// The readings that observers at many speeds would find for a particle with the lab's mass, all found with the physics model's
// own transformation (the particle at rest, seen by observers moving at each speed). They fall on one curve.
function curvePoints(): EnergyMomentumReading[] {
  const rest = particleReading(0)
  const points: EnergyMomentumReading[] = []
  for (let i = -90; i <= 90; i++) points.push(readingFor(Math.tanh(i / 20), rest))
  return points
}

interface DiagramProps {
  kind: Kind
  speed: number
  passingSpeed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}

// While idle it draws only the setup: the two axes and the lab's own reading. It deliberately draws no curve and no other
// reading then: whether the readings share anything is what the learner is asked to predict (§12). While the run plays it also
// draws the curve, the particle's own reading and the passing observer's reading, which slides along the curve as their speed
// rises from 0 to the chosen value.
function Diagram({ kind, speed, passingSpeed, progress }: DiagramProps) {
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const allReadings = [result.lab, result.passing, ...(result.own ? [result.own] : [])]
  const reach = Math.max(...allReadings.map((r) => Math.max(r.energy, Math.abs(r.momentumTimesC))))
  const limit = Math.max(2, Math.ceil(reach * 1.1))
  const step = niceStep(limit)
  const marks = Array.from({ length: Math.floor(limit / step) + 1 }, (_, i) => i * step)
  const centerX = (LEFT_X + RIGHT_X) / 2
  const xOf = (momentum: number) => centerX + (momentum / limit) * ((RIGHT_X - LEFT_X) / 2)
  const yOf = (energy: number) => BOTTOM_Y - (energy / limit) * (BOTTOM_Y - TOP_Y)
  const unit = kind === 'particle' ? "the particle's rest energies" : "the lab's measurement of the pulse"
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const lab = result.lab
  const currentSpeed = playing ? sweptSpeed(passingSpeed, progress) : 0
  const passing = readingFor(currentSpeed, lab)
  const labX = xOf(lab.momentumTimesC)
  const labY = yOf(lab.energy)
  const passingX = xOf(passing.momentumTimesC)
  const passingY = yOf(passing.energy)
  const curve = kind === 'particle' ? curvePoints() : []
  const curvePath = curve.map((r) => `${xOf(r.momentumTimesC).toFixed(1)},${yOf(r.energy).toFixed(1)}`).join(' ')
  const passingMoved = Math.abs(passingX - labX) + Math.abs(passingY - labY) > 14

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${complete ? 'Result: ' : playing ? 'Playback: ' : 'Setup: '}the lab measures ${kindWords(kind)}${kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}. In ${unit}, the lab finds an energy of ${lab.energy.toFixed(2)} and a momentum times c of ${lab.momentumTimesC.toFixed(2)}.${playing ? ` A passing observer moving at ${currentSpeed.toFixed(2)}c finds an energy of ${passing.energy.toFixed(2)} and a momentum times c of ${passing.momentumTimesC.toFixed(2)}.${result.own ? ' The particle’s own observer finds an energy of 1.00 and a momentum times c of 0.00.' : ''}` : ''}`}
      style={SVG_STYLE}
    >
      <defs>
        <clipPath id="energy-momentum-plot-area">
          <rect x={LEFT_X} y={TOP_Y - 6} width={RIGHT_X - LEFT_X} height={BOTTOM_Y - TOP_Y + 6} />
        </clipPath>
      </defs>
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Energy and momentum, as measured by different observers
      </text>
      <text x="12" y="34" fontSize="11" fill={MUTED_COLOR}>
        Energy is in {unit}.
      </text>
      <text x="12" y="48" fontSize="11" fill={MUTED_COLOR}>
        Momentum is shown as momentum × c, in the same units.
      </text>

      {/* The key: each reading has its own shape and colour, with its numbers beside it. */}
      <rect x="16" y="59" width="10" height="10" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x="34" y="68" fontSize="11" fill={LAB_COLOR}>
        <tspan fontWeight="bold">The lab’s reading:</tspan> energy {lab.energy.toFixed(2)}, momentum × c {signed(lab.momentumTimesC)}
      </text>
      {result.own && (
        <g>
          {playing ? (
            <polygon points="21,76 27,83 21,90 15,83" fill={OWN_COLOR} stroke="#0b1020" strokeWidth="1.5" />
          ) : null}
          {playing && (
            <text x="34" y="86" fontSize="11" fill={OWN_COLOR}>
              <tspan fontWeight="bold">The particle’s own reading:</tspan> energy {result.own.energy.toFixed(2)}, momentum × c{' '}
              {signed(Math.abs(result.own.momentumTimesC) < 5e-10 ? 0 : result.own.momentumTimesC)}
            </text>
          )}
        </g>
      )}
      {playing && (
        <g>
          <circle cx="21" cy={result.own ? 103 : 85} r="6" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
          <text x="34" y={result.own ? 107 : 89} fontSize="11" fontWeight="bold" fill={PASSING_COLOR}>
            The passing observer’s reading
          </text>
          <text x="34" y={result.own ? 121 : 103} fontSize="11" fill={PASSING_COLOR}>
            moving at {signed(currentSpeed)}c: energy {passing.energy.toFixed(2)}, momentum × c {signed(passing.momentumTimesC)}
          </text>
        </g>
      )}

      {/* Axes: momentum × c across (zero in the middle), energy up. */}
      <line x1={LEFT_X} y1={BOTTOM_Y} x2={RIGHT_X} y2={BOTTOM_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      <line x1={centerX} y1={BOTTOM_Y} x2={centerX} y2={TOP_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      {marks.flatMap((m) => (m === 0 ? [0] : [-m, m])).map((m) => (
        <g key={`p${m}`}>
          <line x1={xOf(m)} y1={BOTTOM_Y} x2={xOf(m)} y2={BOTTOM_Y + 5} stroke={TICK_COLOR} />
          <text x={xOf(m)} y={BOTTOM_Y + 18} fontSize="11" textAnchor="middle" fill={TICK_COLOR}>
            {m < 0 ? `−${Math.abs(m)}` : m}
          </text>
        </g>
      ))}
      {marks.map((m) => (
        <g key={`e${m}`}>
          <line x1={centerX - 5} y1={yOf(m)} x2={centerX} y2={yOf(m)} stroke={TICK_COLOR} />
          <text x={centerX - 9} y={yOf(m) + 4} fontSize="11" textAnchor="end" fill={TICK_COLOR}>
            {m}
          </text>
        </g>
      ))}
      <text x={centerX} y={BOTTOM_Y + 38} fontSize="12" textAnchor="middle" fill={TEXT_COLOR}>
        Momentum × c (right is moving to the right)
      </text>
      <text x="14" y={(BOTTOM_Y + TOP_Y) / 2} fontSize="12" textAnchor="middle" fill={TEXT_COLOR} transform={`rotate(-90 14 ${(BOTTOM_Y + TOP_Y) / 2})`}>
        Energy
      </text>

      {/* The curve (for a particle) or the two straight edges (for light), drawn once the run starts. */}
      {playing && (
        <g clipPath="url(#energy-momentum-plot-area)">
          {kind === 'particle' ? (
            <polyline points={curvePath} fill="none" stroke={CURVE_COLOR} strokeWidth="2" />
          ) : (
            <g>
              <line x1={centerX} y1={BOTTOM_Y} x2={xOf(limit)} y2={yOf(limit)} stroke={CURVE_COLOR} strokeWidth="2" />
              <line x1={centerX} y1={BOTTOM_Y} x2={xOf(-limit)} y2={yOf(limit)} stroke={CURVE_COLOR} strokeWidth="2" />
            </g>
          )}
        </g>
      )}
      {playing && kind === 'particle' && (
        <text x={xOf(-limit * 0.1) - 8} y={yOf(limit * 0.9)} textAnchor="end" fontSize="11" fill={CURVE_COLOR} style={HALO}>
          <tspan x={xOf(-limit * 0.1) - 8}>The curve: where the readings of</tspan>
          <tspan x={xOf(-limit * 0.1) - 8} dy="13">observers at every other speed fall</tspan>
        </text>
      )}
      {playing && kind === 'light' && (
        <text x={xOf(-limit * 0.06) - 4} y={yOf(limit * 0.9)} textAnchor="end" fontSize="11" fill={CURVE_COLOR} style={HALO}>
          <tspan x={xOf(-limit * 0.06) - 4}>The two straight lines: where light</tspan>
          <tspan x={xOf(-limit * 0.06) - 4} dy="13">always sits (energy = momentum × c)</tspan>
        </text>
      )}

      {/* The trail the passing observer's reading has left along the curve. */}
      {playing && passingMoved && (
        <line x1={labX} y1={labY} x2={passingX} y2={passingY} stroke={PASSING_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      )}

      {/* The lab's reading: a solid square. */}
      <line x1={labX} y1={labY} x2={labX} y2={BOTTOM_Y} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <line x1={centerX} y1={labY} x2={labX} y2={labY} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <rect x={labX - 6} y={labY - 6} width="12" height="12" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      {/* The particle's own reading: a diamond. */}
      {playing && result.own && (
        <g>
          <polygon points={`${xOf(0)},${yOf(1) - 8} ${xOf(0) + 8},${yOf(1)} ${xOf(0)},${yOf(1) + 8} ${xOf(0) - 8},${yOf(1)}`} fill={OWN_COLOR} stroke="#0b1020" strokeWidth="1.5" />
        </g>
      )}

      {/* The passing observer's reading: a hollow circle that slides along the curve as the observer's speed rises. */}
      {playing && (
        <g>
          <circle cx={passingX} cy={passingY} r="7" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}

interface BarsRow {
  name: string
  color: string
  reading: EnergyMomentumReading
}

const BARS_VIEW_WIDTH = 520
const BARS_CENTER_X = 250
const BARS_LABEL_X = 20
const BARS_MAX_LENGTH = 190
const BARS_TOP = 62
const BARS_GROUP_HEIGHT = 92
const BARS_ROW_HEIGHT = 20

// For each observer, three bars on one scale around a middle line at zero: the energy, the momentum × c, and the combination
// E² − (pc)². A bar to the right is positive and a bar to the left is negative. The numbers beside each bar say the same, so
// colour is not needed.
function ReadingBars({ rows }: { rows: BarsRow[] }) {
  const longest = Math.max(...rows.flatMap((r) => [r.reading.energy, Math.abs(r.reading.momentumTimesC), Math.abs(r.reading.invariant)]), 1e-9)
  const lengthOf = (value: number) => (Math.abs(value) / longest) * BARS_MAX_LENGTH
  const height = BARS_TOP + rows.length * BARS_GROUP_HEIGHT + 28

  const quantities = (reading: EnergyMomentumReading) => [
    { label: 'Energy E', value: reading.energy, color: ENERGY_BAR_COLOR },
    { label: 'Momentum × c', value: Math.abs(reading.momentumTimesC) < 5e-10 ? 0 : reading.momentumTimesC, color: MOMENTUM_BAR_COLOR },
    { label: 'E² − (momentum × c)²', value: Math.abs(reading.invariant) < 5e-10 ? 0 : reading.invariant, color: INVARIANT_BAR_COLOR },
  ]

  return (
    <svg
      viewBox={`0 0 ${BARS_VIEW_WIDTH} ${height}`}
      role="img"
      aria-label={`Bars of the energy, the momentum times c, and the combination E squared minus the square of momentum times c, for each observer. ${rows
        .map((row) => `${row.name}: energy ${row.reading.energy.toFixed(2)}, momentum times c ${row.reading.momentumTimesC.toFixed(2)}, combination ${row.reading.invariant.toFixed(2)}`)
        .join('. ')}.`}
      style={SVG_STYLE}
    >
      <text x="20" y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        What each observer measures (one scale)
      </text>
      <text x="20" y="38" fontSize="10" fill={MUTED_COLOR}>
        Bars start at the middle line, which is zero. A bar to the left is negative.
      </text>
      <line x1={BARS_CENTER_X} y1="46" x2={BARS_CENTER_X} y2={height - 24} stroke={TICK_COLOR} strokeWidth="1.5" />
      {rows.map((row, g) => {
        const top = BARS_TOP + g * BARS_GROUP_HEIGHT
        return (
          <g key={row.name}>
            <text x={BARS_LABEL_X} y={top - 4} fontSize="12" fontWeight="bold" fill={row.color}>
              {row.name}
            </text>
            {quantities(row.reading).map((q, i) => {
              const y = top + 4 + i * BARS_ROW_HEIGHT
              const length = lengthOf(q.value)
              return (
                <g key={q.label}>
                  <text x={BARS_LABEL_X} y={y + 12} fontSize="10" fill={MUTED_COLOR}>
                    {q.label}
                  </text>
                  {length > 0.5 && (
                    <rect x={q.value >= 0 ? BARS_CENTER_X : BARS_CENTER_X - length} y={y + 2} width={length} height="12" rx="2" fill={q.color} />
                  )}
                  <text x={BARS_VIEW_WIDTH - 12} y={y + 12} textAnchor="end" fontSize="10" fill={TEXT_COLOR}>
                    {signed(q.value)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
      <text x="20" y={height - 8} fontSize="10" fill={MUTED_COLOR}>
        The longest bar here is {longest.toFixed(2)}.
      </text>
    </svg>
  )
}

interface EnergyMomentumExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The quick-reference panel ("Words and formulas"): one line for each term and formula introduced so far (spec, Introduction,
// rule 5). Part 1's are listed from the start, and Part 2's are added once Part 2 appears; Part 3's are added when its introduction is built. Draft
// wording for the owner's review (§28.1). The one-line formulas repeat the introduction's, with no new claims.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Particle', meaning: 'a very small piece of matter, such as an electron or a proton, treated here as a single point.' },
  {
    term: 'Observer',
    meaning:
      'someone with their own ruler and synchronized clocks. The lab is at rest, a passing observer moves past it, and the particle’s own observer travels along with the particle.',
  },
  { term: 'c', meaning: 'the speed of light, about 300,000 kilometers per second. 0.6c is 60 percent of it.' },
  {
    term: 'Time dilation factor, D(v)',
    meaning: '√(1 − v²): how much a moving clock’s ticking is slowed. It is 1 at rest and gets smaller as v gets closer to c.',
  },
  { term: 'Mass', meaning: 'in this experiment, the number you would find if the particle were sitting still beside you.' },
  { term: 'Energy', meaning: 'the ability to make things happen, such as to heat water or to move something. Measured in joules (J) in everyday life.' },
  { term: 'Kinetic energy', meaning: 'energy of motion. At everyday speeds it is ½ × mass × speed².' },
  { term: 'Momentum', meaning: 'a measure of how hard a moving thing is to stop. At everyday speeds it is mass × speed.' },
  { term: 'Rest energy', meaning: 'the energy a particle has when it is not moving. Here it is the unit of energy, written as 1.' },
  { term: 'Total energy', meaning: 'the rest energy plus the kinetic energy.' },
  { term: 'A light pulse', meaning: 'a short flash of light. It carries energy and momentum, but it has no mass.' },
  { term: 'E = 1 ÷ D(v)', meaning: 'the total energy of a particle moving at speed v, in rest energies. At v = 0 it is 1, the rest energy.' },
  { term: 'pc = v ÷ D(v)', meaning: 'the momentum times c, in rest energies: the total energy multiplied by the speed.' },
  { term: 'E² − (pc)²', meaning: 'square the energy, square the momentum times c, and subtract. Not the same as E² + (pc)².' },
  { term: 'v′ = (v − u) ÷ (1 − uv)', meaning: 'the speed another observer, moving at u, measures for something moving at v in the lab.' },
  { term: 'Light: E = pc', meaning: 'for a light pulse, the energy equals the momentum times c, and the combination E² − (pc)² is zero.' },
]

function ReferencePanel({ entries }: { entries: { term: string; meaning: string }[] }) {
  return (
    <details
      style={{
        marginBottom: '2rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        border: '2px solid #0066cc',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: '#0066cc' }}>
        📖 Words and formulas: click to open a quick reference
      </summary>
      <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
        {entries.map((entry) => (
          <li key={entry.term}>
            <strong>{entry.term}:</strong> {entry.meaning}
          </li>
        ))}
      </ul>
    </details>
  )
}

// Changing the object, its speed or the passing observer's speed returns to the idle state, so a run is never shown for
// different settings. The completion mark is saved only when Part 3 ends (Decision 18 of the specification), so onComplete is
// not called yet.
export function EnergyMomentumExperiment(_props: EnergyMomentumExperimentProps) {
  const [kind, setKind] = useState<Kind>('particle')
  const [speed, setSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)
  // Part 2 is shown only after the learner has reached Part 1's tutor explanation (spec, Learner Controls, Decision 2).
  const [partOneExplained, setPartOneExplained] = useState(false)
  // A learner who already knows Part 1 can skip to Part 2 with a link under Part 1's heading. Part 2 is then shown without
  // Part 1's tutor explanation, and it says so (it uses a combination from Part 1). Skipping does not count as having
  // reached the explanation, so it does not call onTutorComplete or onComplete.
  const [skippedToPartTwo, setSkippedToPartTwo] = useState(false)
  const partTwoShown = partOneExplained || skippedToPartTwo
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (skippedToPartTwo) document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [skippedToPartTwo])

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status])

  const currentSpeed = status === 'idle' ? 0 : sweptSpeed(passingSpeed, progress)
  const barRows: BarsRow[] = [{ name: 'The lab', color: LAB_COLOR, reading: result.lab }]
  if (result.own) barRows.push({ name: 'The particle’s own observer', color: OWN_COLOR, reading: result.own })
  barRows.push({ name: 'The passing observer', color: PASSING_COLOR, reading: readingFor(currentSpeed, result.lab) })

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Energy, Momentum and Mass: What Do All Observers Agree On?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Part 1 — Energy and momentum, seen by different observers</h3>
        {!partTwoShown && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already know this? </span>
            <button
              type="button"
              onClick={() => setSkippedToPartTwo(true)}
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Skip to Part 2
            </button>
          </p>
        )}

        {/* Introduction, stage A (needed by Part 1): draft wording for the owner's review (CLAUDE.md §28.1), from the
            specification's "Introduction: three stages". It gives the formulas for one observer's numbers and one worked
            example each, and does not say what other observers find (that is Part 1's prediction, §12). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In earlier experiments, observers who move differently disagreed about the time and the
            distance between two events, but they all found the same value of time² − distance² (Experiment 1 of this group). This
            experiment asks the same kind of question about something else belonging to a moving thing: its <strong>energy</strong>{' '}
            and its <strong>momentum</strong>. Do observers who move differently agree on them? If not, is there something about
            them that the observers <em>do</em> agree on?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words we will use.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Particle:</strong> a very small piece of matter, such as an electron or a proton. Here we treat it as a
                single point, with no size.
              </li>
              <li>
                <strong>Observer:</strong> someone with their own ruler and synchronized clocks, as in the earlier experiments.{' '}
                <strong>The lab</strong> is at rest. <strong>A passing observer</strong> moves past the lab.{' '}
                <strong>The particle's own observer</strong> travels along with the particle, so the particle is at rest for them.
              </li>
              <li>
                <strong>The speed of light, c:</strong> about 300,000 kilometers per second. Speeds are given as a fraction of c: 0.6c
                is 60 percent of it.
              </li>
              <li>
                <strong>Time dilation factor:</strong> from Experiment 3 of the first chapter, the number √(1 − v²) that says how
                much a moving clock's ticking is slowed. For example, at 0.6c it is √(1 − 0.36) = √0.64 = 0.8, so a clock moving at
                0.6c ticks at 0.8 of the usual rate. We write D(v) for it. It is 1 for something at rest, and it gets smaller and
                smaller as the speed gets closer to c.
              </li>
              <li>
                <strong>Mass:</strong> how much matter a thing has, which you can also feel as how hard it is to get moving. A
                5-kilogram bag of sugar is harder to push than a 1-kilogram bag. In this experiment, the mass of a particle means
                the number you would find if the particle were sitting still beside you. (Some books use the word "mass"
                differently, for something that changes with speed. We do not.)
              </li>
              <li>
                <strong>Energy:</strong> the ability to make things happen, such as to heat water, to move something, or to make
                light. It comes in many forms. A moving car can dent a wall. Hot water can cook an egg. In everyday life energy is
                measured in <strong>joules</strong> (J).
              </li>
              <li>
                <strong>Kinetic energy:</strong> energy of motion. For everyday speeds it is ½ × mass × speed². For example, a
                1000-kilogram car at 20 meters per second has ½ × 1000 × 20² = 200,000 joules. This everyday formula is correct for
                slow things. The experiment shows how it changes for fast ones.
              </li>
              <li>
                <strong>Momentum:</strong> a measure of how hard a moving thing is to stop. For everyday speeds it is mass × speed.
                A 7-kilogram bowling ball rolling at 2 meters per second has 7 × 2 = 14 units; a 0.06-kilogram tennis ball flying at
                30 meters per second has 0.06 × 30 = 1.8. The heavy, slow ball is harder to stop, even though the light one moves
                faster.
              </li>
              <li>
                <strong>Rest energy:</strong> the energy a particle has when it is not moving at all, its own energy. We use it as
                our unit of energy, so a particle's rest energy is written as <strong>1</strong>. An energy of 2.5 means 2.5 times
                the particle's rest energy.
              </li>
              <li>
                <strong>Total energy:</strong> the rest energy plus the kinetic energy.
              </li>
              <li>
                <strong>A light pulse:</strong> a short flash of light. It carries energy and momentum, but it has no mass.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>The rules this experiment uses.</strong> We do not derive these here. They are the rules of special
              relativity, and the experiment lets you see what they predict. Each is read out in words, with a worked example.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Total energy:</strong> E = mc² ÷ D(v). In words: "the total energy is the rest energy mc² divided by the time
                dilation factor." In our units mc² = 1, so E = 1 ÷ D(v). As the speed rises, D shrinks, so the energy grows. For
                example, at 0.5c: D = √(1 − 0.25) = √0.75 = 0.866, so E = 1 ÷ 0.866 = 1.155 rest energies. At v = 0, D = 1, so E =
                mc², the rest energy. <em>What it does not mean:</em> it does not say that the particle's mass grows. The mass stays
                the number found at rest. What grows with speed is the energy.
              </li>
              <li>
                <strong>Momentum (times c):</strong> pc = (mc² ÷ D(v)) × v. In words: "the total energy multiplied by the speed." We
                multiply the momentum by c so that it has the same units as energy, and the two can be compared. In our units, pc =
                v ÷ D(v). For example, at 0.5c: pc = 0.5 ÷ 0.866 = 0.577. <em>What it does not mean:</em> it is not the everyday mass
                × speed, which is the slow-speed version of it. They agree at low speed and differ at high speed.
              </li>
              <li>
                <strong>A combination of the two:</strong> E² − (pc)². In words: "square the energy, square the momentum times c, and
                subtract", the same "subtract the squares" move as in Experiment 1. For example, at 0.5c: 1.155² − 0.577² = 1.333 −
                0.333 = 1.000. The experiment asks you to predict what other observers would get. <em>What it does not mean:</em> it
                is not E² + (pc)². The minus sign matters, as it did in Experiment 1.
              </li>
              <li>
                <strong>What speed does another observer measure?</strong> v′ = (v − u) ÷ (1 − uv), where v is the particle's speed
                in the lab and u is the passing observer's speed (both fractions of c, in the same direction). In words: "it is almost
                the difference of the two speeds, but divided by a correction that keeps the result below c." For example, v = 0.6
                and u = 0.3: (0.6 − 0.3) ÷ (1 − 0.18) = 0.3 ÷ 0.82 = 0.366, not 0.3. If u = v, the result is 0: the particle's own
                observer finds it at rest. We do not derive this rule here. <em>What it does not mean:</em> it is not a plain
                subtraction, v − u, which would let speeds pass c.
              </li>
              <li>
                <strong>Energy and momentum seen by a passing observer.</strong> The rule that turns the lab's times and positions
                into the passing observer's (Experiment 3 of the first chapter and Experiment 1 of this group) also turns the lab's
                energy and momentum into theirs, with energy playing the part of time, and pc the part of position. The experiment
                does this arithmetic for you and shows the result.
              </li>
              <li>
                <strong>Light:</strong> for a light pulse, E = pc (the energy equals the momentum times c), and it always moves at c.{' '}
                <em>What it does not mean:</em> it does not mean that light has mass. For light, the combination E² − (pc)² is zero.
              </li>
            </ul>
          </div>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A particle (or a light pulse) moves past the lab. Three observers (the lab, the particle's
            own observer, and a passing observer) each measure its energy and momentum. A drawing shows the three readings as
            points, and a table gives the numbers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose whether the object is a particle with mass or a light pulse. For a particle, choose its
            speed in the lab. Choose the passing observer's speed. Then make a prediction. You are not graded. The Run button stays
            off until you choose a prediction.
          </p>
          <p style={{ margin: 0 }}>
            <strong>What we assume.</strong> Speeds are steady, there is no gravity, energy is in rest energies, and momentum is
            given as pc. For light, energy is in units of the lab's measurement of the pulse.
          </p>
        </div>

        <ReferencePanel entries={partTwoShown ? [...REFERENCE_ENTRIES, ...PART_TWO_REFERENCE_ENTRIES] : REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>What moves past the lab?</label>
          <div style={{ marginBottom: '1rem' }}>
            {KIND_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  setKind(choice.value)
                  returnToIdle()
                }}
                className={`toggle-button${kind === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          {kind === 'particle' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The particle's speed in the lab</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                It is given as a fraction of <strong>c</strong>, the speed of light. The particle moves to the right. 0c means it is
                at rest in the lab.
              </p>
              <div>
                {PARTICLE_SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSpeed(value)
                      returnToIdle()
                    }}
                    className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {value === 0 ? '0c (at rest)' : `${value}c`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            The passing observer moves past the lab, along the same line. A plus sign means they move to the right, and a minus sign
            to the left. 0c means they are at rest in the lab, like the lab itself.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPassingSpeed(value)
                  returnToIdle()
                }}
                className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {passingLabel(value)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            {kind === 'particle' ? 'A particle with mass is' : 'A light pulse is'} moving past the lab. The lab measures its energy
            and its momentum. A passing observer, who moves differently, measures them too. Earlier, two observers measured different
            times and different distances between two events, but the same <code>time² − distance²</code>. What do you think the two
            observers find for this {kind === 'particle' ? 'particle' : 'light pulse'}?
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  setPrediction(choice.value)
                  returnToIdle()
                }}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. This is not graded.`
              : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setRunCount((n) => n + 1)
            setStatus('running')
          }}
          disabled={prediction === null || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Choose a prediction above to run the experiment.
          </p>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Diagram kind={kind} speed={speed} passingSpeed={passingSpeed} progress={status === 'idle' ? null : progress} />
        </div>

        {status !== 'idle' && (
          <div style={{ marginTop: '1.5rem' }}>
            <ReadingBars rows={barRows} />
          </div>
        )}

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these pictures.</strong> There are two pictures. The first is a map of{' '}
            <strong>energy and momentum</strong>. The second, which appears when you press Run, is a set of{' '}
            <strong>bars</strong> that show the same numbers. For your current choice, the lab measures {kindWords(kind)}
            {kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}, and the passing observer moves at{' '}
            {passingLabel(passingSpeed)}.
          </p>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Picture 1: the map of energy and momentum.</strong> Across the bottom is <strong>momentum × c</strong>.
            Zero is in the middle, a point to the right means moving to the right, and a point to the left means moving to the
            left. Up the side is <strong>energy</strong>. Both are measured in{' '}
            {kind === 'particle' ? "the particle's rest energies, so that its energy when it is at rest is 1" : "the lab's measurement of the pulse, so that the lab finds an energy of 1"}
            . The parts of the map are:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The sky-blue square, "The lab's reading".</strong> What the lab measures. The dashed lines show where it
              sits on each axis.
            </li>
            {kind === 'particle' && (
              <li>
                <strong>The green diamond, "The particle's own reading".</strong> What an observer who travels along with the
                particle measures, for whom the particle is at rest. It appears when you press Run.
              </li>
            )}
            <li>
              <strong>The hollow purple circle, "The passing observer's reading".</strong> Imagine a second person, the passing
              observer, who flies past the lab in a straight line. They measure the very same {kind === 'particle' ? 'particle' : 'light pulse'},
              but because they are moving, they get a <em>different</em> energy and a <em>different</em> momentum × c than the
              lab does. The circle is a dot on the map that shows those two numbers: how far across it sits is their momentum × c,
              and how high it sits is their energy. When you press Run, the passing observer starts out standing still next to
              the lab, so the circle starts right on top of the lab's square (they get the same numbers). Then they speed up,
              little by little, until they reach the speed you chose. As their speed changes, their numbers change, so the circle
              moves across the map. A dashed purple line shows the path the circle has travelled, and the words beside it give
              their speed at that moment and their two numbers.
            </li>
            <li>
              <strong>{kind === 'particle' ? 'The yellow curve.' : 'The two straight yellow lines.'}</strong>{' '}
              {kind === 'particle'
                ? 'Every observer, whatever their speed, gets one energy and one momentum × c for this particle, and so has one dot on the map. The yellow curve is the line that all of those dots fall on. Think of a road drawn on a map: you can stand at many places along it, but you cannot stand off it. In the same way, the passing observer\'s circle can sit at many places, depending on their speed, but it always stays on the curve. Notice the lowest point of the curve, straight above zero. That is where an observer who moves along with the particle sits, because for them the particle is not moving, so its momentum × c is zero and only its rest energy is left. The farther an observer\'s dot is from that point, the faster the particle appears to move to them, and the more energy and momentum it has. The curve appears when you press Run.'
                : 'Every observer, whatever their speed, gets one energy and one momentum × c for the light pulse, and so has one dot on the map. A light pulse always has an energy equal to its momentum × c. That is why all of those dots fall on a straight line: the right-hand line if the pulse moves to the right, the left-hand line if it moves to the left (where the momentum × c is a negative number). Think of a road drawn on a map: you can stand at many places along it, but you cannot stand off it. In the same way, the passing observer\'s circle can sit at many places, depending on their speed, but it always stays on the line. Light has no "at rest" reading, so unlike a particle, no observer can get a dot at zero momentum. The lines appear when you press Run.'}
            </li>
          </ul>

          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>What if a momentum is negative?</strong> A negative momentum × c means moving to the <em>left</em>. The sign
            shows only the direction; the size shows how much. Energy has no direction, so it is never negative.{' '}
            {kind === 'particle'
              ? 'You may see a negative momentum × c for the passing observer even though the lab sees the particle moving to the right. This happens when the passing observer moves to the right faster than the particle does. They overtake it, so from their point of view the particle falls behind and drifts to the left. It is like driving at 100 km/h past a truck that is doing 60 km/h: the truck is moving forward along the road, but from your seat it slides backward past your window. On the map, their circle then sits to the left of the middle line.'
              : 'A light pulse moving to the left always has a negative momentum × c, for every observer, because every observer sees it moving to the left. A passing observer who moves to the right sees the pulse with a larger energy and a larger (negative) momentum × c, and one who moves to the left sees smaller ones. On the map, the dots for a left-moving pulse sit on the left-hand line.'}
            {' '}A negative momentum is one observer's measurement at one moment. It does not mean that the particle slowed down,
            stopped and turned around. A particle that really did that would need something to push it, such as a wall it
            bounces off.
          </p>

          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>What is happening in this experiment.</strong> {kind === 'particle'
              ? 'The particle itself never changes. In the lab it keeps moving at the same speed the whole time, and nothing pushes it. Only the passing observer changes: they speed up, and every speed gives a different reading of the same particle. The circle moves from positive momentum, through zero, to negative momentum only because the observer\'s own speed has changed. It crosses zero at the moment the observer\'s speed matches the particle\'s. They are then travelling along with the particle, so it looks at rest to them, which is the green diamond. Faster than that, they overtake it, and it looks as if it is moving to the left. It is like standing at the roadside watching a truck that goes 60 km/h, then driving off and speeding up. At 30 km/h the truck still pulls ahead of you. At 60 km/h it seems to hover beside you. At 100 km/h you overtake it and it slides backward. The truck never changed its speed; only yours changed.'
              : 'The light pulse itself never changes. It keeps moving in the same direction the whole time. Only the passing observer changes: they speed up, and every speed gives a different reading of the same pulse. A left-moving pulse is seen moving left by every observer, so its momentum × c stays negative for all of them. Only its size changes.'}
            {' '}The sign does not affect the bar for E² − (momentum × c)². A negative number multiplied by itself is positive, so the sign drops out.
          </p>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Picture 2: the bars.</strong> For each observer there are three bars on one scale. The top bar is the{' '}
            <strong>energy</strong>, the middle bar is the <strong>momentum × c</strong>, and the bottom bar is the{' '}
            <strong>combination E² − (momentum × c)²</strong>: the energy multiplied by itself, minus the momentum × c
            multiplied by itself. Each bar starts at the middle line, which is zero. A bar to the left means a negative number.
            The number beside each bar says the same thing.
          </p>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What happens in the animation.</strong>
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Before you press Run, Picture 1 shows only the lab's reading. Nothing from the other observers is drawn yet.
            </li>
            <li>
              When you press Run, {kind === 'particle' ? 'the curve and the particle’s own reading appear' : 'the two straight lines appear'},
              and the passing observer's circle appears on top of the lab's square. Picture 2 appears below.
            </li>
            <li>
              The passing observer's speed climbs from 0 to the chosen speed. The circle slides along{' '}
              {kind === 'particle' ? 'the curve' : 'the line'}, and the bars for the passing observer change as it goes.
            </li>
            <li>
              The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment
              finds. At the end, everything stays on the screen.
            </li>
          </ol>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say a particle moves at 0.5c in the
            lab. The lab finds energy 1.155 and momentum × c 0.577. A passing observer moves at +0.2c. Their numbers come from
            the same rule as for time and position in the earlier experiments, with energy in the place of time and momentum × c
            in the place of position: they divide by the time dilation factor at 0.2c, which is √(1 − 0.04) = 0.980, and use
            energy − 0.2 × momentum × c, and momentum × c − 0.2 × energy. So the energy is (1.155 − 0.2 × 0.577) ÷ 0.980 =
            1.061, and the momentum × c is (0.577 − 0.2 × 1.155) ÷ 0.980 = 0.354. The experiment does this arithmetic for you.
          </p>

          <p style={{ margin: 0 }}>
            <strong>What to look for.</strong> Follow these steps.
          </p>
          <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>While it runs:</strong> watch the passing observer's circle slide. Does its height change? Its place
              across?
            </li>
            <li>
              <strong>In the bars:</strong> compare the three observers' three bars. Which bars change from one observer to the
              next, and which do not?
            </li>
            <li>
              <strong>Then</strong> choose another speed for the particle, or another passing observer, and run it again.
            </li>
          </ol>
        </div>
        {status === 'complete' && prediction !== null && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ marginBottom: '0.5rem' }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              {kind === 'particle' ? `The particle moved at ${speed}c in the lab.` : 'The light pulse moved to the right in the lab.'}{' '}
              The passing observer moved at {passingLabel(passingSpeed)}. <strong>Your prediction was:</strong>{' '}
              {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label} It is only recorded here, not marked right or wrong.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The table.</strong> Each observer has one row.{' '}
              {kind === 'light' && 'There is no row for an observer who travels along with the light, because no observer can. '}
              All the numbers are in {kind === 'particle' ? "the particle's rest energies" : "the lab's measurement of the pulse"}.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Observer', 'Speed they measure (c)', 'Energy E', 'Momentum × c', 'E² − (momentum × c)²'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'The lab', reading: result.lab },
                    ...(result.own ? [{ name: 'The particle’s own observer', reading: result.own }] : []),
                    { name: 'The passing observer', reading: result.passing },
                  ].map((o) => (
                    <tr key={o.name}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.name}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNumber(o.reading.speed)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNumber(o.reading.energy)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNumber(o.reading.momentumTimesC)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNumber(o.reading.invariant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Speed they measure:</strong> how fast that observer finds {kind === 'particle' ? 'the particle' : 'the light pulse'}{' '}
                moving. A plus sign means to the right and a minus sign to the left.
              </li>
              <li>
                <strong>Energy E</strong> and <strong>Momentum × c:</strong> what that observer measures. A minus sign on the
                momentum means it points to the left.
              </li>
              <li>
                <strong>E² − (momentum × c)²:</strong> the energy multiplied by itself, minus the momentum × c multiplied by
                itself.
              </li>
            </ul>

            {result.kineticEnergy !== null && result.newtonKineticEnergy !== null && (
              <>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                  <strong>The energy ledger</strong>, for the lab's measurement of the particle at {speed}c, in the particle's rest
                  energies:
                </p>
                <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>Rest energy (the energy at rest)</td>
                      <td>1.0000</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>Kinetic energy (the extra energy from moving)</td>
                      <td>{result.kineticEnergy.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>Total energy</td>
                      <td>{result.lab.energy.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>Newton's ½ × (speed)² for comparison</td>
                      <td>{result.newtonKineticEnergy.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <EnergyMomentumTutor key={runCount} kind={kind} speed={speed} passingSpeed={passingSpeed} predicted={prediction} onExplained={() => setPartOneExplained(true)} />
      )}

      {partTwoShown && (
        <div id={PART_TWO_ID}>
          <EnergyMomentumCollision skippedPartOne={skippedToPartTwo && !partOneExplained} />
        </div>
      )}
    </div>
  )
}
