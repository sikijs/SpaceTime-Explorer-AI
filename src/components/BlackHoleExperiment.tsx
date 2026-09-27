import { useEffect, useState } from 'react'
import { evaluateBlackHole, runRadialLightSpeedLaunch } from '../physics/blackHoleExperiment'
import type { RadialLaunchResult } from '../physics/blackHoleExperiment'
import { BlackHoleTutor } from './BlackHoleTutor'

interface BlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type SpeedCompareChoice = 'much-slower' | 'faster' | 'cannot-escape'
type YesNoChoice = 'yes' | 'no'

const speedCompareChoices: Array<{ value: SpeedCompareChoice; label: string }> = [
  { value: 'much-slower', label: 'Much slower than light' },
  { value: 'faster', label: 'Faster than light' },
  { value: 'cannot-escape', label: 'Nothing can escape at all' },
]

function speedCompareLabel(choice: SpeedCompareChoice): string {
  return speedCompareChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

function SpeedCompareQuestion({
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: SpeedCompareChoice | null
  submitted: SpeedCompareChoice | null
  onSelect: (choice: SpeedCompareChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {speedCompareChoices.map((choice) => (
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
          ? `Your prediction: ${speedCompareLabel(selected)}`
          : submitted
            ? `Your prediction: ${speedCompareLabel(submitted)}`
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

// The launch distance is held fixed, matching Experiment 6's own reference distance; the
// learner varies only the mass.
const START_DISTANCE = 1
const WORLD_HALF_EXTENT = 4 * START_DISTANCE
const VIEW_SIZE = 320
type ExperimentStatus = 'idle' | 'running' | 'complete'
// Fixed real-world playback duration, independent of how much simulated time the launch
// spans (CLAUDE.md §11 — playback speed must not change the physical result).
const ANIMATION_DURATION_MS = 2500

function pointToView(distance: number): { cx: number; cy: number } {
  const scale = VIEW_SIZE / 2 / WORLD_HALF_EXTENT
  return {
    cx: VIEW_SIZE / 2 + distance * scale,
    cy: VIEW_SIZE / 2,
  }
}

function radiusToView(radius: number): number {
  return (radius * VIEW_SIZE) / 2 / WORLD_HALF_EXTENT
}

export function BlackHoleExperiment({ onComplete, onTutorComplete }: BlackHoleExperimentProps) {
  const [mass, setMass] = useState(1)
  const [result, setResult] = useState<RadialLaunchResult | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [visiblePointCount, setVisiblePointCount] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [smallMassPrediction, setSmallMassPrediction] = useState<SpeedCompareChoice | null>(null)
  const [largeMassPrediction, setLargeMassPrediction] = useState<SpeedCompareChoice | null>(null)
  const [inBetweenPrediction, setInBetweenPrediction] = useState<YesNoChoice | null>(null)
  const [submittedSmallMassPrediction, setSubmittedSmallMassPrediction] = useState<SpeedCompareChoice | null>(null)
  const [submittedLargeMassPrediction, setSubmittedLargeMassPrediction] = useState<SpeedCompareChoice | null>(null)
  const [submittedInBetweenPrediction, setSubmittedInBetweenPrediction] = useState<YesNoChoice | null>(null)

  const hasAllPredictions =
    smallMassPrediction !== null && largeMassPrediction !== null && inBetweenPrediction !== null
  const hasSubmittedPredictions = submittedSmallMassPrediction !== null
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const evaluation = evaluateBlackHole(mass, START_DISTANCE)

  const handleLaunch = () => {
    if (!hasAllPredictions || isRunning) return
    if (!hasSubmittedPredictions) {
      setSubmittedSmallMassPrediction(smallMassPrediction)
      setSubmittedLargeMassPrediction(largeMassPrediction)
      setSubmittedInBetweenPrediction(inBetweenPrediction)
    }
    const nextResult = runRadialLightSpeedLaunch(mass, START_DISTANCE)
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
  const currentPoint = visiblePoints[visiblePoints.length - 1]
  const previousPoint = visiblePoints[visiblePoints.length - 2]
  const probePosition = currentPoint ? pointToView(currentPoint.distance) : pointToView(START_DISTANCE)
  const movingAway = currentPoint && previousPoint ? currentPoint.distance > previousPoint.distance : true

  const massPoint = pointToView(0)
  const horizonViewRadius = radiusToView(evaluation.eventHorizonRadius)
  const launchPoint = pointToView(START_DISTANCE)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — What Is a Black Hole?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Could a mass ever be packed so densely — so
            concentrated — into a small space that nothing, not even light, could escape it?
            ("Concentrated" just means how much mass is squeezed into a given amount of space: a
            golf-ball-sized lump of lead is far more concentrated than a foam ball the same size,
            because it has much more mass packed into the same volume.)
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll adjust how massive a central object is. Each
            time, a probe launches straight outward from the same starting point near it — always
            the same distance away, so only the mass changes — at the fastest speed anything can
            ever travel: the speed of light. You'll watch whether it escapes or falls back.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try small and large masses, and see what happens to the
            launch.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Real black holes.</strong> These aren't just a thought experiment — astronomers
            have directly imaged the glowing region around two real black holes, using a global
            network of radio telescopes called the Event Horizon Telescope: one at the center of
            the galaxy M87 (2019), and Sagittarius A*, the black hole at the center of our own
            Milky Way (2022). This experiment uses a simplified version of the reasoning that first
            predicted such objects could exist.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              This uses the same ordinary gravity as Experiments 2, 3, 5, and 6, not the exact
              general relativity a real black hole needs.
            </li>
            <li>The mass, distance, and speed of light here are relative, made-up amounts, not real numbers.</li>
            <li>
              The probe is launched straight outward, not sideways — this isn't about orbits,
              which Experiment 6 already covered.
            </li>
            <li>The central mass doesn't move.</li>
          </ul>
        </div>

        <SpeedCompareQuestion
          prompt="If the mass is very small, what do you expect the escape speed to be, compared to the speed of light?"
          selected={smallMassPrediction}
          submitted={submittedSmallMassPrediction}
          onSelect={setSmallMassPrediction}
          disabled={hasSubmittedPredictions}
        />
        <SpeedCompareQuestion
          prompt="If the mass is very large instead, what do you expect?"
          selected={largeMassPrediction}
          submitted={submittedLargeMassPrediction}
          onSelect={setLargeMassPrediction}
          disabled={hasSubmittedPredictions}
        />
        <YesNoQuestion
          prompt="Is there a mass in between where something special happens?"
          selected={inBetweenPrediction}
          submitted={submittedInBetweenPrediction}
          onSelect={setInBetweenPrediction}
          disabled={hasSubmittedPredictions}
        />

        <label htmlFor="black-hole-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mass: {mass.toFixed(1)}
        </label>
        <input
          id="black-hole-mass"
          type="range"
          min={0.2}
          max={6}
          step={0.1}
          value={mass}
          onChange={(event) => setMass(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <button
          type="button"
          className="action-button"
          onClick={handleLaunch}
          disabled={!hasAllPredictions || isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          Launch
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
          <circle
            cx={massPoint.cx}
            cy={massPoint.cy}
            r={horizonViewRadius}
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 3"
            opacity={0.6}
          />
          <circle cx={massPoint.cx} cy={massPoint.cy} r={6} fill="currentColor" />
          <circle cx={launchPoint.cx} cy={launchPoint.cy} r={3} fill="none" stroke="currentColor" />
          {result && (
            <circle cx={probePosition.cx} cy={probePosition.cy} r={4} fill="currentColor" />
          )}
        </svg>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
              <circle cx={7} cy={7} r={5} fill="currentColor" />
            </svg>
            Central mass
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
              <circle cx={7} cy={7} r={5} fill="none" stroke="currentColor" strokeDasharray="3 2" />
            </svg>
            Event horizon
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
              <circle cx={7} cy={7} r={3} fill="none" stroke="currentColor" />
            </svg>
            Launch point (fixed)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
              <circle cx={7} cy={7} r={4} fill="currentColor" />
            </svg>
            Probe
          </span>
        </div>

        {result && (isRunning || isComplete) && currentPoint && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Probe distance from the mass: <strong>{currentPoint.distance.toFixed(2)}</strong>{' '}
            (started at {START_DISTANCE.toFixed(2)}) — currently{' '}
            <strong>{movingAway ? 'moving away' : 'falling toward the mass'}</strong>.
          </p>
        )}

        {isComplete &&
          result &&
          submittedSmallMassPrediction &&
          submittedLargeMassPrediction &&
          submittedInBetweenPrediction && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>
                Mass: <strong>{mass.toFixed(1)}</strong>. Escape speed at the launch distance:{' '}
                <strong>{Math.round(evaluation.escapeSpeedFractionOfC * 100)}%</strong> of the speed of
                light. Event horizon size: <strong>{evaluation.eventHorizonRadius.toFixed(2)}</strong>{' '}
                (the launch point is at <strong>{START_DISTANCE.toFixed(2)}</strong>).
              </p>
              <p>
                The launch point is currently{' '}
                <strong>{evaluation.isInsideHorizon ? 'inside' : 'outside'}</strong> the event horizon.
              </p>
              <p>
                Outcome:{' '}
                <strong>
                  {result.outcome === 'escapes' && 'The probe escaped.'}
                  {result.outcome === 'falls-back' && 'The probe fell back.'}
                </strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                A real black hole's event horizon is defined exactly this way — the boundary where
                escape speed would equal the speed of light — though the real calculation needs
                Einstein's general relativity, not this simplified version.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, small mass:</strong>{' '}
                {speedCompareLabel(submittedSmallMassPrediction)}. In fact, a small mass gives an
                escape speed well below the speed of light, and a light-speed launch escapes easily.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, large mass:</strong>{' '}
                {speedCompareLabel(submittedLargeMassPrediction)}. In fact, past a specific mass,
                escape speed would need to exceed the speed of light — which is impossible — so
                instead, nothing, not even light, can escape from within that boundary.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Your prediction, in between:</strong>{' '}
                {submittedInBetweenPrediction === 'yes' ? 'Yes' : 'No'}. In fact, yes — there is a
                specific mass where escape speed exactly reaches the speed of light. That's the event
                horizon.
              </p>
            </div>
          )}
      </div>

      {isComplete &&
        result &&
        submittedSmallMassPrediction &&
        submittedLargeMassPrediction &&
        submittedInBetweenPrediction && (
          <BlackHoleTutor
            key={runCount}
            smallMassPrediction={submittedSmallMassPrediction}
            largeMassPrediction={submittedLargeMassPrediction}
            inBetweenPrediction={submittedInBetweenPrediction}
            result={result}
            onExplained={onTutorComplete}
          />
        )}
    </div>
  )
}
