import { useEffect, useMemo, useState } from 'react'
import { strengthsForMassAndDistance } from '../physics/spacetimeCurvatureSourceExperiment'
import { runGravitationalTimeDilationExperiment, tickCountAt } from '../physics/gravitationalTimeDilationExperiment'
import { runTidalEffectExperiment, ballPositionsAt, EARTH_GRAVITY } from '../physics/tidalEffectExperiment'
import { RocketCabinClocks, RUN_DURATION_FLOOR_SECONDS } from './GravitationalTimeDilationExperiment'
import { Cabin, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS } from './TidalEffectExperiment'
import { SpacetimeCurvatureSourceTutor } from './SpacetimeCurvatureSourceTutor'

// Before the learner runs the experiment, the live preview panels show a fixed illustrative
// moment rather than animating (there's nothing to play back yet). 5 floor-seconds is the
// midpoint of Experiment 2's own 10-second run; the tidal fraction is chosen to make the
// planet cabin's convergence visibly different from the rocket cabin's before landing.
const CLOCK_SNAPSHOT_FLOOR_SECONDS = 5
const TIDAL_SNAPSHOT_FALL_FRACTION = 0.6

// Both panels animate over this same real-world duration when the learner clicks Run,
// matching Experiment 2's and Experiment 3's own playback pattern (CLAUDE.md §11 — playback
// speed must not change the physical result, only how long the learner waits to see it).
const ANIMATION_DURATION_MS = 2500

type MassPreset = 1 | 2 | 4 | 'other'
type DistancePreset = 1 | 2 | 4 | 'other'
export type PredictionChoice = 'stronger' | 'weaker' | 'same'
export type PredictionKey = 'closerDilation' | 'closerTidal' | 'biggerDilation' | 'biggerTidal'

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'stronger', label: 'Get stronger' },
  { value: 'weaker', label: 'Get weaker' },
  { value: 'same', label: 'Stay the same' },
]

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

// Both effects always get stronger for a closer or bigger mass, per the physics model
// (strengthsForMassAndDistance): time-dilation strength scales with mass/distance, and
// convergence strength with mass/distance^3 — both strictly increasing in mass and
// strictly decreasing in distance.
export function actualOutcome(): PredictionChoice {
  return 'stronger'
}

const MASS_PRESETS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: 'Small' },
  { value: 2, label: 'Medium' },
  { value: 4, label: 'Large' },
]

const DISTANCE_PRESETS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: 'Close' },
  { value: 2, label: 'Medium' },
  { value: 4, label: 'Far' },
]

function PredictionQuestion({
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: PredictionChoice | null
  submitted: PredictionChoice | null
  onSelect: (choice: PredictionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
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
        {selected
          ? `Your prediction: ${labelFor(selected)}`
          : submitted
            ? `Your prediction: ${labelFor(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export const predictionQuestions: Array<{ key: PredictionKey; label: string; prompt: string }> = [
  {
    key: 'closerDilation',
    label: 'Closer mass, time dilation',
    prompt:
      'If you moved the mass closer, would the ceiling-clock time-dilation effect from Experiment 2 get stronger, weaker, or stay the same?',
  },
  {
    key: 'closerTidal',
    label: 'Closer mass, tidal effect',
    prompt:
      'If you moved the mass closer, would the tidal drifting-together effect from Experiment 3 get stronger, weaker, or stay the same?',
  },
  {
    key: 'biggerDilation',
    label: 'Bigger mass, time dilation',
    prompt: 'If you used a bigger mass instead, would the time-dilation effect get stronger, weaker, or stay the same?',
  },
  {
    key: 'biggerTidal',
    label: 'Bigger mass, tidal effect',
    prompt:
      'If you used a bigger mass instead, would the tidal effect (the two balls drifting together) get stronger, weaker, or stay the same?',
  },
]

function labelForPreset(preset: 1 | 2 | 4 | 'other', presets: Array<{ value: 1 | 2 | 4; label: string }>, customValue: number): string {
  return preset === 'other' ? `custom (${customValue})` : presets.find((p) => p.value === preset)!.label
}

interface SpacetimeCurvatureSourceExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Steps 4-8 of CLAUDE.md §21 are all built: four predictions, then mass/distance controls,
// the derived strength readout, and both of Experiment 2's and 3's own panels, reusing
// their unmodified rendering and physics, fed the derived strengths. Running the
// experiment animates both panels simultaneously (same playback pattern as Experiments 2
// and 3) and then shows the final tick counts, final separations, the prediction
// comparison, and the AI tutor below.
export function SpacetimeCurvatureSourceExperiment({ onComplete, onTutorComplete }: SpacetimeCurvatureSourceExperimentProps) {
  const [predictions, setPredictions] = useState<Record<PredictionKey, PredictionChoice | null>>({
    closerDilation: null,
    closerTidal: null,
    biggerDilation: null,
    biggerTidal: null,
  })
  const [submittedPredictions, setSubmittedPredictions] = useState<Record<
    PredictionKey,
    PredictionChoice
  > | null>(null)

  const [massPreset, setMassPreset] = useState<MassPreset>(2)
  const [customMass, setCustomMass] = useState('')
  const [distancePreset, setDistancePreset] = useState<DistancePreset>(2)
  const [customDistance, setCustomDistance] = useState('')
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [elapsedFloorSeconds, setElapsedFloorSeconds] = useState(0)
  const [elapsedFallSeconds, setElapsedFallSeconds] = useState(0)

  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const controlsDisabled = status !== 'idle'

  const hasAllPredictions = Object.values(predictions).every((choice) => choice !== null)
  const canContinue = hasAllPredictions && !submittedPredictions

  const handleContinue = () => {
    if (!canContinue) return
    setSubmittedPredictions(predictions as Record<PredictionKey, PredictionChoice>)
  }

  const selectedMass = massPreset === 'other' ? parseFloat(customMass) || 0 : massPreset
  const selectedDistance = distancePreset === 'other' ? parseFloat(customDistance) || 0 : distancePreset
  const isValidMass = selectedMass > 0
  const isValidDistance = selectedDistance > 0
  const canRun = isValidMass && isValidDistance && status === 'idle'

  // Memoized so their identity only changes when mass/distance actually change — otherwise
  // the animation effect below (keyed on tidalResult) would see a new object every render
  // and keep restarting itself instead of ever reaching completion.
  const strengths = useMemo(
    () => (isValidMass && isValidDistance ? strengthsForMassAndDistance(selectedMass, selectedDistance) : null),
    [isValidMass, isValidDistance, selectedMass, selectedDistance]
  )

  const dilationResult = useMemo(
    () => (strengths ? runGravitationalTimeDilationExperiment(strengths.timeDilationStrength) : null),
    [strengths]
  )
  const displayFloorSeconds = isRunning
    ? elapsedFloorSeconds
    : isComplete
      ? RUN_DURATION_FLOOR_SECONDS
      : CLOCK_SNAPSHOT_FLOOR_SECONDS
  const ceilingTicks = dilationResult ? tickCountAt(dilationResult, displayFloorSeconds, 'ceiling') : 0
  const floorTicks = dilationResult ? tickCountAt(dilationResult, displayFloorSeconds, 'floor') : 0
  const finalCeilingTicks = dilationResult ? tickCountAt(dilationResult, RUN_DURATION_FLOOR_SECONDS, 'ceiling') : 0
  const finalFloorTicks = dilationResult ? tickCountAt(dilationResult, RUN_DURATION_FLOOR_SECONDS, 'floor') : 0

  const tidalResult = useMemo(
    () =>
      strengths
        ? runTidalEffectExperiment(EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, strengths.convergenceStrength)
        : null,
    [strengths]
  )
  const displayFallSeconds = tidalResult
    ? isRunning
      ? Math.min(elapsedFallSeconds, tidalResult.timeToFloorSeconds)
      : isComplete
        ? tidalResult.timeToFloorSeconds
        : tidalResult.timeToFloorSeconds * TIDAL_SNAPSHOT_FALL_FRACTION
    : 0
  const finalPlanetSeparation = tidalResult
    ? ballPositionsAt(tidalResult, tidalResult.timeToFloorSeconds, 'planet').rightBallOffset -
      ballPositionsAt(tidalResult, tidalResult.timeToFloorSeconds, 'planet').leftBallOffset
    : 0
  const finalRocketSeparation = tidalResult
    ? ballPositionsAt(tidalResult, tidalResult.timeToFloorSeconds, 'rocket').rightBallOffset -
      ballPositionsAt(tidalResult, tidalResult.timeToFloorSeconds, 'rocket').leftBallOffset
    : 0

  const handleRun = () => {
    if (!canRun) return
    setElapsedFloorSeconds(0)
    setElapsedFallSeconds(0)
    setStatus('running')
  }

  const handleRunAgain = () => {
    setStatus('idle')
  }

  useEffect(() => {
    if (status !== 'running' || !tidalResult) return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setElapsedFloorSeconds(progress * RUN_DURATION_FLOOR_SECONDS)
      setElapsedFallSeconds(progress * tidalResult.timeToFloorSeconds)

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, tidalResult, onComplete])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — What Curves Spacetime? Mass and Distance</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 2, a "strength" slider controlled how much
            faster the ceiling clock ticked. In Experiment 3, a "convergence strength" slider
            controlled how much the two balls drifted together. Where do those numbers actually come
            from?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Think of a trampoline. Set a bowling ball in the
            middle and it sags a little; swap it for a much heavier weight, or push the same ball
            closer to where you're standing, and the dip gets noticeably deeper. Mass and distance
            are exactly the two knobs this experiment turns — how much "stuff" is nearby, and how
            close it is — controlling how strongly they dent the same fabric of spacetime that
            Experiments 2 and 3 already showed you the effects of.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll pick how massive a nearby body is, and how far away
            it is, and watch Experiment 2's clocks and Experiment 3's balls respond together — both
            driven by the same two choices.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Change the mass and distance, and compare how much each effect
            changes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Mass and distance here are relative presets, not real kilograms or meters.</li>
            <li>
              Moving closer or using a bigger mass always makes both effects stronger, but the tidal
              effect (the two balls drifting together, from Experiment 3) grows faster than the
              time-dilation effect as you get closer.
            </li>
            <li>This uses the same simplified, first-order approximation as Experiments 2 and 3.</li>
            <li>
              This experiment doesn't use anything about light, moving clocks, or speeds close to
              light — it's about ordinary gravity, like Experiments 2 and 3.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make a prediction</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Before you try it yourself: if you moved the mass closer, or used a bigger mass, what
            would happen to each effect?
          </p>
          {predictionQuestions.map((question) => (
            <PredictionQuestion
              key={question.key}
              prompt={question.prompt}
              selected={predictions[question.key]}
              submitted={submittedPredictions?.[question.key] ?? null}
              onSelect={(choice) => setPredictions((p) => ({ ...p, [question.key]: choice }))}
              disabled={!!submittedPredictions}
            />
          ))}

          {!submittedPredictions && (
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="action-button"
              style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
            >
              Continue
            </button>
          )}
        </div>

        {submittedPredictions && (
        <>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mass</label>
          <div style={{ marginBottom: '1rem' }}>
            {MASS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setMassPreset(preset.value)}
                disabled={controlsDisabled}
                className={`toggle-button${massPreset === preset.value ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: controlsDisabled ? 'not-allowed' : 'pointer',
                  opacity: controlsDisabled ? 0.6 : 1,
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setMassPreset('other')}
              disabled={controlsDisabled}
              className={`toggle-button${massPreset === 'other' ? ' is-selected' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: controlsDisabled ? 'not-allowed' : 'pointer', opacity: controlsDisabled ? 0.6 : 1 }}
            >
              Other
            </button>
          </div>
          {massPreset === 'other' && (
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={customMass}
              onChange={(e) => setCustomMass(e.target.value)}
              disabled={controlsDisabled}
              placeholder="Enter a relative mass (> 0)"
              className="field-input"
              style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Distance</label>
          <div style={{ marginBottom: '1rem' }}>
            {DISTANCE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDistancePreset(preset.value)}
                disabled={controlsDisabled}
                className={`toggle-button${distancePreset === preset.value ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: controlsDisabled ? 'not-allowed' : 'pointer',
                  opacity: controlsDisabled ? 0.6 : 1,
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setDistancePreset('other')}
              disabled={controlsDisabled}
              className={`toggle-button${distancePreset === 'other' ? ' is-selected' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: controlsDisabled ? 'not-allowed' : 'pointer', opacity: controlsDisabled ? 0.6 : 1 }}
            >
              Other
            </button>
          </div>
          {distancePreset === 'other' && (
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={customDistance}
              onChange={(e) => setCustomDistance(e.target.value)}
              disabled={controlsDisabled}
              placeholder="Enter a relative distance (> 0)"
              className="field-input"
              style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
            />
          )}
        </div>

        <div className="exp-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
            <strong>Derived time-dilation strength (Experiment 2):</strong>{' '}
            {strengths ? strengths.timeDilationStrength.toFixed(3) : '—'}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
            <strong>Derived convergence strength (Experiment 3):</strong>{' '}
            {strengths ? strengths.convergenceStrength.toFixed(3) : '—'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {dilationResult && (
            <div style={{ maxWidth: '280px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                Experiment 2's rocket cabin, at this mass and distance
              </p>
              <RocketCabinClocks ceilingTicks={ceilingTicks} floorTicks={floorTicks} />
            </div>
          )}

          {tidalResult && (
            <div style={{ maxWidth: '400px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                Experiment 3's cabins, at this mass and distance
              </p>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Cabin label="Planet" result={tidalResult} scene="planet" elapsedSeconds={displayFallSeconds} />
                <Cabin label="Rocket" result={tidalResult} scene="rocket" elapsedSeconds={displayFallSeconds} />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={isComplete ? handleRunAgain : handleRun}
          disabled={isRunning || (!isComplete && !canRun)}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Running...' : isComplete ? 'Run Again' : 'Run'}
        </button>

        {isComplete && strengths && dilationResult && tidalResult && (
          <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Mass:</strong> {labelForPreset(massPreset, MASS_PRESETS, selectedMass)}{' '}
                <strong>Distance:</strong> {labelForPreset(distancePreset, DISTANCE_PRESETS, selectedDistance)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Derived time-dilation strength:</strong> {strengths.timeDilationStrength.toFixed(3)} —{' '}
                <strong>derived convergence strength:</strong> {strengths.convergenceStrength.toFixed(3)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final tick counts (Experiment 2):</strong> ceiling {finalCeilingTicks.toFixed(2)}, floor{' '}
                {finalFloorTicks.toFixed(2)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation (Experiment 3):</strong> planet cabin {finalPlanetSeparation.toFixed(3)} m,
                rocket cabin {finalRocketSeparation.toFixed(3)} m
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              {predictionQuestions.map((question) => (
                <p key={question.key} style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>{question.label}:</strong> you predicted it would{' '}
                  {submittedPredictions?.[question.key] && labelFor(submittedPredictions[question.key])} — it
                  actually did {labelFor(actualOutcome())}.
                </p>
              ))}
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Both effects grow stronger with a closer or bigger mass, though not at the same rate — they're
                two different observable consequences of one underlying cause: how strongly spacetime is
                curved at that location.
              </p>
            </div>
          </div>
        )}

        {isComplete && strengths && submittedPredictions && (
          <SpacetimeCurvatureSourceTutor
            predictions={submittedPredictions}
            strengths={strengths}
            finalCeilingTicks={finalCeilingTicks}
            finalFloorTicks={finalFloorTicks}
            finalPlanetSeparationMeters={finalPlanetSeparation}
            finalRocketSeparationMeters={finalRocketSeparation}
            onExplained={onTutorComplete}
          />
        )}
        </>
        )}
      </div>
    </div>
  )
}
