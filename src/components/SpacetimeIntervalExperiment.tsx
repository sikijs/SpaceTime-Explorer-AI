import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { runIntervalExperiment } from '../physics/spacetimeInterval'

// Presets are the defaults of Decision 5 in docs/experiments/spacetime-geometry/01-the-interval.md.
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

type Prediction = 'bigger' | 'same' | 'smaller'

// The three answers of the prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'bigger', label: 'Bigger in the lab' },
  { value: 'same', label: 'The same in both' },
  { value: 'smaller', label: 'Smaller in the lab' },
]

const CLOCK_SPEED_PRESETS = [0, 0.3, 0.6, 0.9, 0.99]
const PASSING_SPEED_PRESETS = [-0.8, -0.5, 0, 0.5, 0.8]

function passingLabel(speed: number): string {
  if (speed === 0) return 'At rest in the lab'
  return speed > 0 ? `${speed}c, same way as the clock` : `${Math.abs(speed)}c, the opposite way`
}

// Drawing constants (SVG units). The ruler is scaled so the clock's tick 1 always fits.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 260
const RULER_START_X = 40
const RULER_END_X = 420
const RULER_Y = 150

interface SetupDiagramProps {
  clockSpeed: number
  passingSpeed: number
}

// Draws the setup only: the lab ruler, the two events, the clock's path and the passing observer.
// It deliberately shows no interval and no other observer's numbers; those come after the run (§12).
function SetupDiagram({ clockSpeed, passingSpeed }: SetupDiagramProps) {
  const { tickOne } = runIntervalExperiment(clockSpeed, passingSpeed)
  const distance = tickOne.position
  const rulerMax = Math.max(1, Math.ceil(distance))
  const scale = (RULER_END_X - RULER_START_X) / rulerMax
  const tickOneX = RULER_START_X + distance * scale
  const marks = Array.from({ length: rulerMax + 1 }, (_, i) => i)
  // Labels start at the square when it is on the left half of the drawing and end at it when it is on the right,
  // so a long label is never cut off by either edge.
  const tickOneAnchor = tickOneX < VIEW_WIDTH / 2 ? 'start' : 'end'
  const tickOneLabelX = tickOneAnchor === 'start' ? tickOneX - 14 : tickOneX + 14
  const sameSpot = distance === 0

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: a clock moving at ${clockSpeed}c ticks twice, ${distance.toFixed(2)} light-seconds apart in the lab. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={SVG_STYLE}
    >
      <text x={RULER_START_X} y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The lab's ruler (distance in light-seconds)
      </text>

      {/* The passing observer, above the ruler, with an arrow for the direction of travel. */}
      <rect x={VIEW_WIDTH / 2 - 16} y="34" width="32" height="20" rx="3" fill="#8b5cf6" />
      {passingSpeed !== 0 && (
        <g>
          <line
            x1={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 22 : -22)}
            y1="44"
            x2={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 62 : -62)}
            y2="44"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          <polygon
            points={
              passingSpeed > 0
                ? `${VIEW_WIDTH / 2 + 68},44 ${VIEW_WIDTH / 2 + 58},39 ${VIEW_WIDTH / 2 + 58},49`
                : `${VIEW_WIDTH / 2 - 68},44 ${VIEW_WIDTH / 2 - 58},39 ${VIEW_WIDTH / 2 - 58},49`
            }
            fill="#8b5cf6"
          />
        </g>
      )}
      <text x={VIEW_WIDTH / 2} y="72" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Passing observer: {passingLabel(passingSpeed).toLowerCase()}
      </text>

      {/* The ruler. */}
      <line x1={RULER_START_X} y1={RULER_Y} x2={RULER_END_X} y2={RULER_Y} stroke={MUTED_COLOR} strokeWidth="3" />
      {marks.map((m) => (
        <g key={m}>
          <line
            x1={RULER_START_X + m * scale}
            y1={RULER_Y - 6}
            x2={RULER_START_X + m * scale}
            y2={RULER_Y + 6}
            stroke={TICK_COLOR}
            strokeWidth="2"
          />
          <text x={RULER_START_X + m * scale} y={RULER_Y + 22} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {m}
          </text>
        </g>
      ))}

      {/* The clock's path between the two events. */}
      {!sameSpot && (
        <line x1={RULER_START_X} y1={RULER_Y} x2={tickOneX} y2={RULER_Y} stroke="#f59e0b" strokeWidth="5" />
      )}

      {/* Event: tick 0. */}
      <rect x={RULER_START_X - 14} y={RULER_Y - 36} width="28" height="20" rx="3" fill="#3b82f6" />
      <text x={RULER_START_X} y={RULER_Y - 44} textAnchor="start" fontSize="11" fill={TEXT_COLOR}>
        Tick 0: the clock at the lab's start
      </text>

      {/* Event: tick 1. */}
      <rect
        x={tickOneX - 14}
        y={RULER_Y + 34}
        width="28"
        height="20"
        rx="3"
        fill="#f59e0b"
      />
      <text x={tickOneLabelX} y={RULER_Y + 70} textAnchor={tickOneAnchor} fontSize="11" fill={TEXT_COLOR}>
        Tick 1: one second later by the clock's own face
      </text>
      <text x={tickOneLabelX} y={RULER_Y + 85} textAnchor={tickOneAnchor} fontSize="11" fill={TEXT_COLOR}>
        {sameSpot ? '(the clock is at rest, so the same spot)' : `(${distance.toFixed(2)} light-seconds along the lab's ruler)`}
      </text>
    </svg>
  )
}

// Steps 2 to 4 (basic interface, prediction, run gate) of docs/experiments/spacetime-geometry/01-the-interval.md.
// The playback, the results and the tutor are later steps, so there are no onComplete or onTutorComplete props yet.
// Changing either speed or the prediction returns to the idle state, as in the other experiments.
export function SpacetimeIntervalExperiment() {
  const [clockSpeed, setClockSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.5)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [hasRun, setHasRun] = useState(false)
  // The physics result for the chosen speeds. Nothing from it is shown until the playback and results steps.
  const result = useMemo(() => runIntervalExperiment(clockSpeed, passingSpeed), [clockSpeed, passingSpeed])

  const handleClockSpeedChange = (speed: number) => {
    setClockSpeed(speed)
    setHasRun(false)
  }
  const handlePassingSpeedChange = (speed: number) => {
    setPassingSpeed(speed)
    setHasRun(false)
  }
  const handlePredictionChange = (choice: Prediction) => {
    setPrediction(choice)
    setHasRun(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — The Interval: One Number Everyone Agrees On</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Earlier experiments showed that two observers can disagree about
            how much time passed between two things happening, and about how far apart those things were.
            So is there anything the observers still agree on?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one
            place at one moment: a clock ticking, a flash of light going off, a ball landing. Two events have a
            time between them and a distance between them. We measure distance in <strong>light-seconds</strong>:
            one light-second is the distance light travels in one second, about 300,000 kilometers. Measuring
            distance this way puts it in the same units as time, so the two can be compared directly.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A clock moves past the lab at a steady speed. It ticks once every
            second of its own face, as the moving clock did in Experiments 3 to 5. Two of its ticks are our two
            events: tick 0, and tick 1 one second later by the clock's own face. Three observers will each
            measure the time and the distance between those two events: the lab, the moving clock itself (for
            which the clock is simply at rest), and a passing observer who moves past the lab at a speed you choose.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the clock's speed and the passing observer's speed. Then you will
            predict what the three observers find, and run the experiment to see.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady, and
            everything moves along one line. Speeds are given as a fraction of <strong>c</strong>, the speed
            of light.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Clock speed</label>
          <div style={{ marginBottom: '1rem' }}>
            {CLOCK_SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleClockSpeedChange(speed)}
                className={`toggle-button${clockSpeed === speed ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {speed === 0 ? '0c (at rest)' : `${speed}c`}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Passing observer's speed
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Measured from the lab. A positive speed is the same direction the clock moves; a negative speed is
            the opposite direction.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handlePassingSpeedChange(speed)}
                className={`toggle-button${passingSpeed === speed ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {speed === 0 ? '0c (at rest in the lab)' : `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`}
              </button>
            ))}
          </div>
        </div>

        <SetupDiagram clockSpeed={clockSpeed} passingSpeed={passingSpeed} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          <strong>How to read this diagram.</strong> The grey line is the lab's ruler, marked in light-seconds.{' '}
          <strong style={{ color: '#3b82f6' }}>Blue square</strong>: the clock at tick 0, the first event, at
          the start of the ruler. <strong style={{ color: '#f59e0b' }}>Orange square</strong>: where the lab finds
          the clock at tick 1, the second event, one second later by the clock's own face. The orange line is
          the distance the clock covers between the two events, as the lab measures it; at 0c there is no such
          distance. <strong style={{ color: '#8b5cf6' }}>Purple square</strong>: the passing observer, with an
          arrow showing which way they move. Change either speed and watch where tick 1 lands and which way the
          passing observer moves.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What "time² − distance²" means.</strong> Take the time between two events, in seconds. Take
            the distance between them, in light-seconds. Multiply each number by itself, then subtract the
            distance result from the time result. For example, if two events are 3 seconds apart in time and 2
            light-seconds apart in space, then 3 × 3 = 9, 2 × 2 = 4, and 9 − 4 = 5. Each observer can work out
            this number for the same two events from their own measurements.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            The lab sees the clock's two ticks farther apart in time and in space than the clock's own face
            shows. What do you expect the number "time² − distance²" to be for the lab, compared with the
            clock's own frame?
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handlePredictionChange(choice.value)}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.`
              : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={() => setHasRun(true)}
          disabled={prediction === null}
          style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
        >
          Run
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Choose a prediction above to run the experiment.
          </p>
        )}
        {hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Run with the clock at {result.clockSpeed}c and the passing observer at {result.passingObserverSpeed}c.
          </p>
        )}
      </div>
    </div>
  )
}
