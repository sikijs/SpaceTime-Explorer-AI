import { useEffect, useState } from 'react'
import { runLightBendingExperiment } from '../physics/lightBendingExperiment'
import type { LightBendingResult } from '../physics/lightBendingExperiment'
import { LightBendingTutor } from './LightBendingTutor'

interface LightBendingExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The mass is held fixed, matching Experiment 6's own reference value; the learner varies only
// the aim distance (the "impact parameter" — how close the light would pass if gravity didn't act).
const GRAVITATIONAL_PARAMETER = 1
const WORLD_HALF_EXTENT = 16
const VIEW_SIZE = 320
const START_X = -15
type ExperimentStatus = 'idle' | 'running' | 'complete'
// Fixed real-world playback duration, independent of how much simulated time the flyby spans
// (CLAUDE.md §11 — playback speed must not change the physical result).
const ANIMATION_DURATION_MS = 2500

type YesNoChoice = 'yes' | 'no'
type MoreLessSameChoice = 'more' | 'less' | 'same'

function pointToView(x: number, y: number): { cx: number; cy: number } {
  const scale = VIEW_SIZE / 2 / WORLD_HALF_EXTENT
  return {
    cx: VIEW_SIZE / 2 + x * scale,
    cy: VIEW_SIZE / 2 - y * scale,
  }
}

// Degrees, not radians, are used for every learner-facing angle (Decisions Needing Human Review
// item 5) — more familiar than radians, and deliberately not arcseconds, since this experiment's
// dimensionless quantities don't correspond to real arcseconds.
function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

function moreLessSameLabel(choice: MoreLessSameChoice): string {
  return choice === 'more' ? 'more' : choice === 'less' ? 'less' : 'about the same'
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

function MoreLessSameQuestion({
  prompt,
  moreLabel,
  lessLabel,
  sameLabel,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  moreLabel: string
  lessLabel: string
  sameLabel: string
  selected: MoreLessSameChoice | null
  submitted: MoreLessSameChoice | null
  onSelect: (choice: MoreLessSameChoice) => void
  disabled: boolean
}) {
  const choices: Array<{ value: MoreLessSameChoice; label: string }> = [
    { value: 'more', label: moreLabel },
    { value: 'less', label: lessLabel },
    { value: 'same', label: sameLabel },
  ]
  const labelFor = (choice: MoreLessSameChoice) =>
    choices.find((c) => c.value === choice)!.label.toLowerCase()

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {choices.map((choice) => (
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
          ? `Your prediction: ${labelFor(selected)}`
          : submitted
            ? `Your prediction: ${labelFor(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function LightBendingExperiment({ onComplete, onTutorComplete }: LightBendingExperimentProps) {
  const [aimDistance, setAimDistance] = useState(2)
  const [result, setResult] = useState<LightBendingResult | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [visiblePointCount, setVisiblePointCount] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [bentPrediction, setBentPrediction] = useState<YesNoChoice | null>(null)
  const [closerPrediction, setCloserPrediction] = useState<MoreLessSameChoice | null>(null)
  const [realVsSimPrediction, setRealVsSimPrediction] = useState<MoreLessSameChoice | null>(null)
  const [submittedBentPrediction, setSubmittedBentPrediction] = useState<YesNoChoice | null>(null)
  const [submittedCloserPrediction, setSubmittedCloserPrediction] = useState<MoreLessSameChoice | null>(null)
  const [submittedRealVsSimPrediction, setSubmittedRealVsSimPrediction] =
    useState<MoreLessSameChoice | null>(null)

  const hasAllPredictions =
    bentPrediction !== null && closerPrediction !== null && realVsSimPrediction !== null
  const hasSubmittedPredictions = submittedBentPrediction !== null
  const isRunning = status === 'running'

  const handleLaunch = () => {
    if (!hasAllPredictions || isRunning) return
    if (!hasSubmittedPredictions) {
      setSubmittedBentPrediction(bentPrediction)
      setSubmittedCloserPrediction(closerPrediction)
      setSubmittedRealVsSimPrediction(realVsSimPrediction)
    }
    const nextResult = runLightBendingExperiment(GRAVITATIONAL_PARAMETER, aimDistance)
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
    : pointToView(START_X, aimDistance)

  const massPoint = pointToView(0, 0)
  const referenceLineStart = pointToView(START_X, aimDistance)
  const referenceLineEnd = pointToView(WORLD_HALF_EXTENT, aimDistance)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 8 — Does Gravity Bend Light?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Experiment 7 showed that light aimed straight at a
            massive enough object can't escape it. But what about light that isn't aimed at the
            mass at all — light that just happens to pass nearby? Does gravity do anything to it?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll choose how closely a beam of light passes by a
            fixed mass — its "aim," how close it would come if gravity didn't act at all. You'll
            watch its path bend as it passes, then continue on a new straight line.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try aiming closer and farther, and see how the amount of
            bending changes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Real light bending.</strong> This isn't just a thought experiment — it's how
            general relativity was first confirmed. In 1919, the astronomer Arthur Eddington led
            an expedition to photograph stars near the Sun during a total solar eclipse, and
            measured that their light was bent by exactly the amount Einstein's 1915 theory
            predicted — not the smaller amount ordinary gravity alone would give. Today,
            astronomers routinely use this same bending — called gravitational lensing — to map
            matter that can't be seen directly and to find distant galaxies too faint to see any
            other way.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              This experiment's animation uses the same ordinary gravity as the rest of this
              chapter, not the exact general relativity a real light beam needs — but unlike
              earlier experiments, we'll also tell you what the real, correct answer is, and by
              how much it differs.
            </li>
            <li>
              The mass, distance, and speed of light here are relative, made-up amounts, not real
              numbers, so the bending angles shown are not the real bending angle of real
              starlight.
            </li>
            <li>There's only one mass in the scene, and it doesn't move.</li>
          </ul>
        </div>

        <YesNoQuestion
          prompt="Does light aimed to pass near the mass, but not directly at it, get bent from a straight line at all?"
          selected={bentPrediction}
          submitted={submittedBentPrediction}
          onSelect={setBentPrediction}
          disabled={hasSubmittedPredictions}
        />
        <MoreLessSameQuestion
          prompt="Does aiming closer to the mass bend the light more, less, or about the same amount?"
          moreLabel="More"
          lessLabel="Less"
          sameLabel="About the same"
          selected={closerPrediction}
          submitted={submittedCloserPrediction}
          onSelect={setCloserPrediction}
          disabled={hasSubmittedPredictions}
        />
        <MoreLessSameQuestion
          prompt="Compared to what ordinary gravity alone would predict, do you think the real universe bends starlight by more, less, or exactly the same amount?"
          moreLabel="More"
          lessLabel="Less"
          sameLabel="Exactly the same"
          selected={realVsSimPrediction}
          submitted={submittedRealVsSimPrediction}
          onSelect={setRealVsSimPrediction}
          disabled={hasSubmittedPredictions}
        />

        {hasAllPredictions && (
          <>
            <label htmlFor="light-bending-aim" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Aim distance: {aimDistance.toFixed(1)}
            </label>
            <input
              id="light-bending-aim"
              type="range"
              min={0.3}
              max={4}
              step={0.1}
              value={aimDistance}
              onChange={(event) => setAimDistance(Number(event.target.value))}
              style={{ width: '100%' }}
            />

            <button
              type="button"
              className="action-button"
              onClick={handleLaunch}
              disabled={isRunning}
              style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
            >
              Launch
            </button>
          </>
        )}
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
          <line
            x1={referenceLineStart.cx}
            y1={referenceLineStart.cy}
            x2={referenceLineEnd.cx}
            y2={referenceLineEnd.cy}
            stroke="currentColor"
            strokeDasharray="4 3"
            opacity={0.4}
          />
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
          {result && <circle cx={currentPosition.cx} cy={currentPosition.cy} r={4} fill="currentColor" />}
        </svg>

        {result && (status === 'running' || status === 'complete') && currentPoint && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Position: (<strong>{currentPoint.x.toFixed(2)}</strong>, <strong>{currentPoint.y.toFixed(2)}</strong>)
            {status === 'complete' && (
              <>
                {' '}— outcome:{' '}
                <strong>{result.outcome === 'deflects' ? 'deflected past the mass' : 'fell into the mass'}</strong>
                {result.outcome === 'deflects' && result.simulatedDeflectionAngle !== null && (
                  <>
                    {' '}— bent by{' '}
                    <strong>{radiansToDegrees(result.simulatedDeflectionAngle).toFixed(2)}°</strong>
                  </>
                )}
                .
              </>
            )}
          </p>
        )}

        {status === 'complete' &&
          result &&
          submittedBentPrediction &&
          submittedCloserPrediction &&
          submittedRealVsSimPrediction && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>
                Aim distance: <strong>{aimDistance.toFixed(1)}</strong>.
              </p>
              {result.outcome === 'falls-in' ? (
                <p>
                  At this aim distance, gravity bends the light so much that it falls into the mass
                  instead of continuing past — light aimed this close can't escape, similar to what
                  Experiment 7 showed for light aimed straight at the mass (though because the path
                  bends here rather than moving straight, the exact cutoff distance isn't quite the
                  same). There's no far-field bending angle to measure here; try a larger aim distance
                  to see a deflection instead.
                </p>
              ) : (
                <>
                  <p>
                    Simulated bending angle (measured from the animation):{' '}
                    <strong>{radiansToDegrees(result.simulatedDeflectionAngle!).toFixed(2)}°</strong>. The
                    ordinary-gravity formula predicts{' '}
                    <strong>{radiansToDegrees(result.newtonianDeflectionAngle).toFixed(2)}°</strong> — the two
                    agree, confirming the animation is following that formula.
                  </p>
                  <p>
                    The real, general-relativistic bending angle is{' '}
                    <strong>{radiansToDegrees(result.generalRelativisticDeflectionAngle).toFixed(2)}°</strong> —{' '}
                    <strong>exactly double</strong> the simulated one. That's because real gravity doesn't
                    just pull light off a straight path (which is all ordinary gravity does) — it also
                    warps space itself, which light's path also has to follow. This simulation only shows
                    the first effect.
                  </p>
                </>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                This doubling is exactly what a 1919 solar eclipse expedition, led by the astronomer
                Arthur Eddington, measured: starlight passing near the eclipsed Sun bent by the larger,
                doubled amount, not the smaller, ordinary-gravity amount — the first confirmation of
                general relativity over Newtonian gravity. Today, this same bending, called gravitational
                lensing, is a routine astronomical tool, used to map matter that can't be seen directly and
                to find distant galaxies too faint to see any other way.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, does it bend at all:</strong>{' '}
                {submittedBentPrediction === 'yes' ? 'Yes' : 'No'}. In fact, yes — light passing near, but
                not at, the mass is bent from a straight line.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, aiming closer:</strong>{' '}
                {moreLessSameLabel(submittedCloserPrediction)}. In fact, aiming closer bends the light
                more.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Your prediction, real vs. simulated:</strong>{' '}
                {moreLessSameLabel(submittedRealVsSimPrediction)}. In fact, the real universe bends light
                more — exactly twice as much as ordinary gravity alone predicts.
              </p>
            </div>
          )}
      </div>

      {status === 'complete' &&
        result &&
        submittedBentPrediction &&
        submittedCloserPrediction &&
        submittedRealVsSimPrediction && (
          <LightBendingTutor
            key={runCount}
            bentPrediction={submittedBentPrediction}
            closerPrediction={submittedCloserPrediction}
            realVsSimPrediction={submittedRealVsSimPrediction}
            result={result}
            onExplained={onTutorComplete}
          />
        )}
    </div>
  )
}
