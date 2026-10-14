import { useState } from 'react'
import type { CSSProperties } from 'react'
import { runInvariantExperiment } from '../physics/energyMomentum'

// Step 4 (basic interface) of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 1 only: the title, the
// controls and the setup diagram with its caption. The introduction stages, the quick-reference panel, the prediction, the run
// (the curve, the other observers' points and the bars), the results, the tutors and Parts 2 and 3 are later steps. The presets
// are Decision 5 of that specification. Wording here is draft for the owner's review (CLAUDE.md §28.1).
type Kind = 'particle' | 'light'

const KIND_CHOICES: { value: Kind; label: string }[] = [
  { value: 'particle', label: 'A particle with mass' },
  { value: 'light', label: 'A light pulse' },
]
const PARTICLE_SPEED_PRESETS = [0, 0.3, 0.6, 0.8, 0.9, 0.99]
const PASSING_SPEED_PRESETS = [-0.8, -0.6, -0.3, 0, 0.3, 0.6, 0.8]

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
// A dark outline so a label stays readable where it crosses a line.
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Drawing constants (SVG units). Momentum × c runs across, energy runs up; both are cut to fit the chosen setup.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 420
const LEFT_X = 70
const RIGHT_X = 440
const BOTTOM_Y = 360
const TOP_Y = 64

function kindWords(kind: Kind): string {
  return kind === 'particle' ? 'a particle with mass' : 'a light pulse'
}

function passingLabel(speed: number): string {
  if (speed === 0) return '0c (at rest in the lab)'
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function niceStep(max: number): number {
  if (max <= 4) return 1
  if (max <= 10) return 2
  if (max <= 25) return 5
  return 10
}

interface DiagramProps {
  kind: Kind
  speed: number
  passingSpeed: number
}

// Draws only the setup: the two axes and the lab's own reading as one square. The other observers' readings and the curve they
// sit on are deliberately not drawn: whether the three readings share anything is what the learner is asked to predict (§12),
// and they are added in a later step. The axes are sized so that every observer's reading will fit when it appears.
function Diagram({ kind, speed, passingSpeed }: DiagramProps) {
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const readings = [result.lab, result.passing, ...(result.own ? [result.own] : [])]
  const reach = Math.max(...readings.map((r) => Math.max(r.energy, Math.abs(r.momentumTimesC))))
  const limit = Math.max(2, Math.ceil(reach * 1.1))
  const step = niceStep(limit)
  const marks = Array.from({ length: Math.floor(limit / step) + 1 }, (_, i) => i * step)
  const centerX = (LEFT_X + RIGHT_X) / 2
  const xOf = (momentum: number) => centerX + (momentum / limit) * ((RIGHT_X - LEFT_X) / 2)
  const yOf = (energy: number) => BOTTOM_Y - (energy / limit) * (BOTTOM_Y - TOP_Y)
  const unit = kind === 'particle' ? "the particle's rest energies" : "the lab's measurement of the pulse"
  const lab = result.lab
  const labX = xOf(lab.momentumTimesC)
  const labY = yOf(lab.energy)
  // The label goes above the square, to the right of it if there is room and to the left if not, so it stays clear of the axes.
  const labelOnLeft = labX > centerX + 90
  const labelX = labX + (labelOnLeft ? 6 : 12)
  const labelAnchor = labelOnLeft ? 'end' : 'start'
  const labelText = 'The lab\u2019s reading'

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: the lab measures ${kindWords(kind)}${kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}. In ${unit}, the lab finds an energy of ${lab.energy.toFixed(2)} and a momentum times c of ${lab.momentumTimesC.toFixed(2)}.`}
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Energy and momentum, as measured by the lab
      </text>
      <text x="12" y="34" fontSize="11" fill={MUTED_COLOR}>
        Energy is in {unit}.
      </text>
      <text x="12" y="48" fontSize="11" fill={MUTED_COLOR}>
        Momentum is shown as momentum × c, in the same units.
      </text>

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

      {/* The lab's reading. */}
      <line x1={labX} y1={labY} x2={labX} y2={BOTTOM_Y} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <line x1={centerX} y1={labY} x2={labX} y2={labY} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <rect x={labX - 6} y={labY - 6} width="12" height="12" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x={labelX} y={labY - 44} textAnchor={labelAnchor} fontSize="11" fontWeight="bold" fill={LAB_COLOR} style={HALO}>
        {labelText}
      </text>
      <text x={labelX} y={labY - 30} textAnchor={labelAnchor} fontSize="11" fill={LAB_COLOR} style={HALO}>
        energy {lab.energy.toFixed(2)}
      </text>
      <text x={labelX} y={labY - 16} textAnchor={labelAnchor} fontSize="11" fill={LAB_COLOR} style={HALO}>
        momentum × c {lab.momentumTimesC.toFixed(2)}
      </text>
    </svg>
  )
}

interface EnergyMomentumExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function EnergyMomentumExperiment(_props: EnergyMomentumExperimentProps) {
  const [kind, setKind] = useState<Kind>('particle')
  const [speed, setSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const lab = runInvariantExperiment(kind, speed, passingSpeed).lab

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
                onClick={() => setKind(choice.value)}
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
                    onClick={() => setSpeed(value)}
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
                onClick={() => setPassingSpeed(value)}
                className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {passingLabel(value)}
              </button>
            ))}
          </div>
        </div>

        <Diagram kind={kind} speed={speed} passingSpeed={passingSpeed} />

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> Across the bottom is the particle's <strong>momentum × c</strong>, and up the
            side is its <strong>energy</strong>. Both are measured in{' '}
            {kind === 'particle' ? "the particle's rest energies, so that its energy when it is at rest is 1" : "the lab's measurement of the pulse, so that the lab finds an energy of 1"}
            . Zero momentum is in the middle: a point to the right means the object moves to the right. The{' '}
            <strong>sky-blue square</strong> is the lab's reading. The dashed lines show where it sits on each axis. For your
            current choice, the lab measures {kindWords(kind)}
            {kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}, and finds an energy of {lab.energy.toFixed(2)}{' '}
            and a momentum × c of {lab.momentumTimesC.toFixed(2)}.
          </p>
        </div>
      </div>
    </div>
  )
}
