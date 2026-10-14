import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { particleReading, readingFor, runInvariantExperiment } from '../physics/energyMomentum'
import type { EnergyMomentumReading } from '../physics/energyMomentum'

// Steps 4 and 5 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 1 only: the controls, the setup
// diagram, and the run that connects the diagram to the physics model (the curve of readings, the particle's own reading, the
// passing observer's reading sliding along the curve as their speed sweeps up, and the bars). Every number comes from
// `energyMomentum.ts`. The prediction (which will gate the Run button), the introduction stages, the quick-reference panel, the
// results, the tutors and Parts 2 and 3 are later steps. The presets are Decision 5 of that specification. Wording here is draft
// for the owner's review (CLAUDE.md §28.1).
type Kind = 'particle' | 'light'

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

// Changing the object, its speed or the passing observer's speed returns to the idle state, so a run is never shown for
// different settings. The completion mark is saved only when Part 3 ends (Decision 18 of the specification), so onComplete is
// not called yet.
export function EnergyMomentumExperiment(_props: EnergyMomentumExperimentProps) {
  const [kind, setKind] = useState<Kind>('particle')
  const [speed, setSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const returnToIdle = () => {
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

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setStatus('running')
          }}
          disabled={status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

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
              <strong>The hollow purple circle, "The passing observer's reading".</strong> What the passing observer measures.
              When you press Run, the observer's speed climbs from 0 to the speed you chose, so the circle starts on top of the
              lab's square, and slides to the observer's own reading. The words beside it show their speed at that moment, and
              the numbers. A dashed line shows the way it has come.
            </li>
            <li>
              <strong>{kind === 'particle' ? 'The yellow curve.' : 'The two straight yellow lines.'}</strong>{' '}
              {kind === 'particle'
                ? 'It marks where the readings of observers moving at every other speed fall. It appears when you press Run.'
                : 'They mark the places where a light pulse always sits: moving right, its energy equals its momentum × c; moving left, its energy equals minus its momentum × c. They appear when you press Run.'}
            </li>
          </ul>

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
      </div>
    </div>
  )
}
