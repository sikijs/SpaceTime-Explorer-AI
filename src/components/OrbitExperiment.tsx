import { useEffect, useState } from 'react'
import { runOrbitExperiment } from '../physics/orbitExperiment'
import type { OrbitExperimentResult, OrbitOutcome } from '../physics/orbitExperiment'
import { OrbitTutor } from './OrbitTutor'

interface OrbitExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Mass and starting distance are held fixed (per the specification's confirmed decisions);
// the learner varies only the push's strength, expressed as a fraction of the circular-orbit
// speed. The push's direction never changes (see runOrbitExperiment).
const GRAVITATIONAL_PARAMETER = 1
const INITIAL_DISTANCE = 1
const WORLD_HALF_EXTENT = 4 * INITIAL_DISTANCE
const VIEW_SIZE = 320
type ExperimentStatus = 'idle' | 'running' | 'complete'
// Fixed real-world playback duration, independent of how much simulated time the
// trajectory spans (CLAUDE.md §11 — playback speed must not change the physical result).
const ANIMATION_DURATION_MS = 2500

type OutcomeChoice = OrbitOutcome
type YesNoChoice = 'yes' | 'no'

const outcomeChoices: Array<{ value: OutcomeChoice; label: string }> = [
  { value: 'falls-in', label: 'Falls into the mass' },
  { value: 'escapes', label: 'Flies away and never returns' },
  { value: 'orbits', label: 'Curves around and comes back' },
]

function outcomeLabel(choice: OutcomeChoice): string {
  return outcomeChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

function pointToView(x: number, y: number): { cx: number; cy: number } {
  const scale = VIEW_SIZE / 2 / WORLD_HALF_EXTENT
  return {
    cx: VIEW_SIZE / 2 + x * scale,
    cy: VIEW_SIZE / 2 - y * scale,
  }
}

function OutcomeQuestion({
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: OutcomeChoice | null
  submitted: OutcomeChoice | null
  onSelect: (choice: OutcomeChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {outcomeChoices.map((choice) => (
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
        {selected
          ? `Your prediction: ${outcomeLabel(selected)}`
          : submitted
            ? `Your prediction: ${outcomeLabel(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

function YesNoQuestion({
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: YesNoChoice | null
  submitted: YesNoChoice | null
  onSelect: (choice: YesNoChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {(['yes', 'no'] as YesNoChoice[]).map((choice) => (
          <button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            className={`toggle-button${selected === choice ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected
          ? `Your prediction: ${selected === 'yes' ? 'Yes' : 'No'}`
          : submitted
            ? `Your prediction: ${submitted === 'yes' ? 'Yes' : 'No'}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function OrbitExperiment({ onComplete, onTutorComplete }: OrbitExperimentProps) {
  const [speedFraction, setSpeedFraction] = useState(1)
  const [result, setResult] = useState<OrbitExperimentResult | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [visiblePointCount, setVisiblePointCount] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [slowPrediction, setSlowPrediction] = useState<OutcomeChoice | null>(null)
  const [fastPrediction, setFastPrediction] = useState<OutcomeChoice | null>(null)
  const [inBetweenPrediction, setInBetweenPrediction] = useState<YesNoChoice | null>(null)
  const [submittedSlowPrediction, setSubmittedSlowPrediction] = useState<OutcomeChoice | null>(null)
  const [submittedFastPrediction, setSubmittedFastPrediction] = useState<OutcomeChoice | null>(null)
  const [submittedInBetweenPrediction, setSubmittedInBetweenPrediction] = useState<YesNoChoice | null>(null)

  const circularSpeed = Math.sqrt(GRAVITATIONAL_PARAMETER / INITIAL_DISTANCE)
  const hasAllPredictions = slowPrediction !== null && fastPrediction !== null && inBetweenPrediction !== null
  const hasSubmittedPredictions = submittedSlowPrediction !== null
  const isRunning = status === 'running'
  const isComplete = status === 'complete'

  const handleRun = () => {
    if (!hasAllPredictions || isRunning) return
    const initialSpeed = speedFraction * circularSpeed
    const nextResult = runOrbitExperiment(GRAVITATIONAL_PARAMETER, INITIAL_DISTANCE, initialSpeed)
    setSubmittedSlowPrediction(slowPrediction)
    setSubmittedFastPrediction(fastPrediction)
    setSubmittedInBetweenPrediction(inBetweenPrediction)
    setResult(nextResult)
    setVisiblePointCount(1)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const totalPoints = result.trajectory.length
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setVisiblePointCount(Math.max(1, Math.round(progress * (totalPoints - 1)) + 1))

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result, onComplete])

  const visiblePoints = result ? result.trajectory.slice(0, visiblePointCount) : []
  const pathPoints = visiblePoints.map((point) => {
    const { cx, cy } = pointToView(point.x, point.y)
    return `${cx},${cy}`
  })
  const currentPoint = visiblePoints[visiblePoints.length - 1]
  const currentPosition = currentPoint
    ? pointToView(currentPoint.x, currentPoint.y)
    : pointToView(INITIAL_DISTANCE, 0)

  const massPoint = pointToView(0, 0)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Why Do Planets Orbit Instead of Falling In?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Why do planets go around the Sun instead of falling
            straight into it, or flying off into space?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> It's easy to think of an orbit as some special,
            different kind of motion from just "falling" — planets seem to glide around forever,
            while a dropped ball simply falls straight down and stops. This experiment asks whether
            that apparent difference is real, or whether an orbit might just be a particular kind
            of falling, seen from the right angle.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll watch this from directly above, like looking
            down at two marbles on a table. A small object starts to the right of a fixed mass,
            and you'll give it a single push — straight up on the screen — at the very start.
            After that, gravity is the only thing acting on it, constantly pulling it back toward
            the mass on the left. You choose how strong that starting push is, then watch what
            path the object follows.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try a weak push and a strong push, and see what happens to
            the path.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              This uses ordinary gravity (the same rule used to predict real satellites and
              planets), not the exact general relativity from Experiment 4's curved-spacetime
              picture — a simplification also used in Experiments 2, 3, and 5.
            </li>
            <li>The central mass doesn't move; only the small object does.</li>
            <li>
              The push always points the same way — straight up on the screen. Only how strong it
              is changes; its direction never does.
            </li>
            <li>
              There's no friction, no air resistance, and no other mass nearby — just this one
              mass and the orbiting object.
            </li>
            <li>The mass and distance here are relative, made-up amounts, not real kilograms or meters.</li>
            <li>Nothing here moves anywhere close to the speed of light.</li>
          </ul>
        </div>

        <OutcomeQuestion
          prompt="If the starting push is very weak, what do you think happens?"
          selected={slowPrediction}
          submitted={submittedSlowPrediction}
          onSelect={setSlowPrediction}
          disabled={hasSubmittedPredictions}
        />
        <OutcomeQuestion
          prompt="If the starting push is very strong instead, which of those three do you expect?"
          selected={fastPrediction}
          submitted={submittedFastPrediction}
          onSelect={setFastPrediction}
          disabled={hasSubmittedPredictions}
        />
        <YesNoQuestion
          prompt="Is there a push strength in between where something different happens?"
          selected={inBetweenPrediction}
          submitted={submittedInBetweenPrediction}
          onSelect={setInBetweenPrediction}
          disabled={hasSubmittedPredictions}
        />

        <label htmlFor="orbit-speed" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Push strength: {Math.round(speedFraction * 100)}% of circular-orbit speed
        </label>
        <input
          id="orbit-speed"
          type="range"
          min={0}
          max={2}
          step={0.05}
          value={speedFraction}
          onChange={(event) => setSpeedFraction(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllPredictions || isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          Run
        </button>
        {!hasAllPredictions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer all three predictions above to run the experiment.
          </p>
        )}

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{ marginTop: '1.5rem', border: '1px solid var(--border-color, #ccc)', overflow: 'hidden' }}
        >
          <circle cx={massPoint.cx} cy={massPoint.cy} r={6} fill="currentColor" />
          {result && (
            <polyline
              points={pathPoints.join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.85}
            />
          )}
          <circle cx={currentPosition.cx} cy={currentPosition.cy} r={4} fill="currentColor" />
        </svg>

        {isComplete && result && submittedSlowPrediction && submittedFastPrediction && submittedInBetweenPrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You launched at <strong>{Math.round(speedFraction * 100)}%</strong> of the circular-orbit
              speed (the circular-orbit speed is the exact speed for a perfect circle; the escape speed
              is about <strong>{Math.round((result.escapeSpeed / circularSpeed) * 100)}%</strong>).
            </p>
            <p>
              Outcome:{' '}
              <strong>
                {result.outcome === 'falls-in' && 'The object fell into the mass.'}
                {result.outcome === 'escapes' && 'The object flew away and never came back.'}
                {result.outcome === 'orbits' && 'The object curved around and kept orbiting.'}
              </strong>
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your prediction, weak push:</strong> {outcomeLabel(submittedSlowPrediction)}. In
              fact, a push well below circular speed always falls in.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your prediction, strong push:</strong> {outcomeLabel(submittedFastPrediction)}. In
              fact, a push well above escape speed always flies away and never returns.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Your prediction, in between:</strong>{' '}
              {submittedInBetweenPrediction === 'yes' ? 'Yes' : 'No'}. In fact, yes — at or near the
              circular-orbit speed, the object neither falls in nor escapes: it orbits.
            </p>
          </div>
        )}
      </div>

      {isComplete && result && submittedSlowPrediction && submittedFastPrediction && submittedInBetweenPrediction && (
        <OrbitTutor
          key={runCount}
          slowPrediction={submittedSlowPrediction}
          fastPrediction={submittedFastPrediction}
          inBetweenPrediction={submittedInBetweenPrediction}
          result={result}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
