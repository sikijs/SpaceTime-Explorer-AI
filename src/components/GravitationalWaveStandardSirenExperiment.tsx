import { useEffect, useState } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { REAL_EVENT_PRESETS } from '../physics/gravitationalWaveRealEventsExperiment'
import {
  detectedAmplitude,
  estimatedHubbleConstant,
  inferredDistanceMpc,
  REAL_EVENT_DISTANCES_MPC,
  RECESSION_VELOCITY_KM_PER_S,
  SCHEMATIC_DISTANCE_PRESETS,
} from '../physics/standardSirenExperiment'
import { GravitationalWaveStandardSirenTutor } from './GravitationalWaveStandardSirenTutor'

interface GravitationalWaveStandardSirenExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Fixed, not learner-facing controls, matching Experiments 2, 3, and 4 exactly.
const BASE_FREQUENCY = 1
const BASE_AMPLITUDE = 0.03

// Fixed real-world playback duration, independent of mass (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 3500

type DistanceMode = 'real' | 'nearby' | 'far' | 'custom'
const MIN_CUSTOM_DISTANCE_MPC = 1
const MAX_CUSTOM_DISTANCE_MPC = 2000

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

// This experiment's two prediction questions, per its specification's "Prediction Activity".
type NearFarChoice = 'nearby-louder' | 'far-louder' | 'same'
const nearFarChoices: Array<{ value: NearFarChoice; label: string }> = [
  { value: 'nearby-louder', label: 'The nearby one' },
  { value: 'far-louder', label: 'The far one' },
  { value: 'same', label: 'No difference' },
]

type DistanceKnowChoice = 'yes' | 'no'
const distanceKnowChoices: Array<{ value: DistanceKnowChoice; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

// Guaranteed by the physics model itself (see standardSirenExperiment.ts and its tests):
// detected amplitude always follows the exact inverse-distance law, so a nearby source is
// always louder than a far one at equal mass; and the distance can only be recovered by
// comparing the detected amplitude to the true amplitude, never from the detected amplitude
// alone — so these don't depend on the learner's chosen event or distance.
const ACTUAL_NEAR_FAR: NearFarChoice = 'nearby-louder'
const ACTUAL_DISTANCE_KNOW: DistanceKnowChoice = 'no'

// The real 2017 measurement's published uncertainty, stated here once so the Results panel's
// caveat and this constant can't drift apart. Not a value this experiment's own toy model
// computes.
const REAL_HUBBLE_CONSTANT_RANGE = '62–170 km/s/Mpc (about ±15% around the central estimate)'

// Reusing Experiment 2's chirp model and Experiment 4's real event presets directly.
export function GravitationalWaveStandardSirenExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalWaveStandardSirenExperimentProps) {
  const [eventId, setEventId] = useState<'gw150914' | 'gw170817'>('gw170817')
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('real')
  const [customDistanceMpc, setCustomDistanceMpc] = useState(100)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [nearFarPrediction, setNearFarPrediction] = useState<NearFarChoice | null>(null)
  const [distanceKnowPrediction, setDistanceKnowPrediction] = useState<DistanceKnowChoice | null>(null)
  const [submittedNearFarPrediction, setSubmittedNearFarPrediction] = useState<NearFarChoice | null>(null)
  const [submittedDistanceKnowPrediction, setSubmittedDistanceKnowPrediction] =
    useState<DistanceKnowChoice | null>(null)

  const hasPrediction = nearFarPrediction !== null && distanceKnowPrediction !== null
  const hasSubmittedPrediction = submittedNearFarPrediction !== null && submittedDistanceKnowPrediction !== null

  const preset = REAL_EVENT_PRESETS.find((candidate) => candidate.id === eventId)!
  const mass = preset.toyMass
  const isRunning = status === 'running'

  const distanceMpc =
    distanceMode === 'real'
      ? REAL_EVENT_DISTANCES_MPC[eventId]
      : distanceMode === 'nearby'
        ? SCHEMATIC_DISTANCE_PRESETS[0].distanceMpc
        : distanceMode === 'far'
          ? SCHEMATIC_DISTANCE_PRESETS[1].distanceMpc
          : customDistanceMpc

  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const displayedTime = isRunning || status === 'complete' ? Math.min(simulatedTime, cutoffTime) : 0
  const chirpState = chirpStateAt(displayedTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE)

  const trueAmplitude = chirpState.amplitude
  const detected = detectedAmplitude(trueAmplitude, distanceMpc)
  const recoveredDistanceMpc = inferredDistanceMpc(trueAmplitude, detected)
  const recessionVelocityKmPerS = RECESSION_VELOCITY_KM_PER_S[eventId]
  const hubbleConstant = estimatedHubbleConstant(recessionVelocityKmPerS, recoveredDistanceMpc)

  const handleEventChange = (id: 'gw150914' | 'gw170817') => {
    setEventId(id)
    if (status === 'complete') {
      setStatus('idle')
    }
  }

  const handleDistanceModeChange = (mode: DistanceMode) => {
    setDistanceMode(mode)
    if (status === 'complete') {
      setStatus('idle')
    }
  }

  const handleRun = () => {
    if (!hasPrediction || isRunning) return
    if (!hasSubmittedPrediction) {
      setSubmittedNearFarPrediction(nearFarPrediction)
      setSubmittedDistanceKnowPrediction(distanceKnowPrediction)
    }
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's own precedent: re-opens both questions for editing
  // without resetting the chosen event or distance.
  const handleChangePrediction = () => {
    setSubmittedNearFarPrediction(null)
    setSubmittedDistanceKnowPrediction(null)
    setStatus('idle')
  }

  useEffect(() => {
    if (status !== 'running') return

    const runMass = mass
    const { cutoffTime: totalSimulatedTime } = chirpRunFor(runMass, BASE_FREQUENCY, BASE_AMPLITUDE)
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setSimulatedTime(progress * totalSimulatedTime)

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, mass, onComplete])

  const isActive = isRunning || status === 'complete'
  const trueStrainMagnitude = Math.abs(chirpState.strain)

  // The arms are driven by the DETECTED strain, not the true strain, so the diagram actually
  // shows what a detector receives - the whole point of this experiment. The real detected
  // strain (chirpState.strain / distanceMpc) spans a huge range across this experiment's full
  // 1-2,000 Mpc distance range and 0.2-6 mass range - a single linear scale factor is either
  // invisible at realistic distances or blown out at close ones. Display-only (CLAUDE.md §11):
  // the magnitude is compressed with a square root (a standard way to make a very wide dynamic
  // range legible, the same idea behind a decibel scale) before a tuned visual gain is applied,
  // so "nearer = visibly stronger" holds clearly at every distance this experiment offers,
  // rather than only at one calibration point. DISPLAY_GAIN is tuned so GW170817 - the quieter
  // of the two events - is still clearly, visibly pulsing at its own real distance (40 Mpc), not
  // just at "Nearby." A magnitude cap keeps the geometry sane at the closest/loudest extreme.
  // The exact, un-exaggerated numbers are shown in the live readout and Results panel below -
  // this transform affects only the arms' drawn appearance.
  const DISPLAY_GAIN = 125
  const MAX_DISPLAY_STRAIN_MAGNITUDE = 0.65
  const physicalDetectedStrain = chirpState.strain / distanceMpc
  const rawDisplayStrain =
    Math.sign(physicalDetectedStrain) * Math.sqrt(Math.abs(physicalDetectedStrain) * DISPLAY_GAIN)
  const detectedStrainForDisplay = Math.max(
    -MAX_DISPLAY_STRAIN_MAGNITUDE,
    Math.min(MAX_DISPLAY_STRAIN_MAGNITUDE, rawDisplayStrain)
  )
  const armXLength = BASE_ARM_LENGTH * (1 + detectedStrainForDisplay / 2)
  const armYLength = BASE_ARM_LENGTH * (1 - detectedStrainForDisplay / 2)
  const xEnd = armEndPoint('x', armXLength)
  const yEnd = armEndPoint('y', armYLength)
  const detectedStrainMagnitude = Math.abs(detectedStrainForDisplay)
  const armStrokeWidth = isActive ? Math.min(11, 2 + detectedStrainMagnitude * 22) : 1.5
  const pulseRadius = isActive ? Math.min(15, 4 + detectedStrainMagnitude * 26) : 4
  const armGlowOpacity = isActive ? Math.min(0.85, detectedStrainMagnitude * 1.8) : 0
  const armGlowBlur = 2 + detectedStrainMagnitude * 10

  // "The source" - the merging pair driving the wave, shown at the center of the detector box,
  // reusing the same illustrative pattern as Experiment 4's real-events diagram. Its own
  // pulsing brightness is tied to the TRUE strain (unaffected by distance), so the learner can
  // see the true and detected signals behave differently side by side. Orbit angle and
  // separation are derived from the same frequency/progress values already shown in the live
  // readout (illustrative sync, not a separately simulated orbit), shrinking to the two objects
  // visually overlapping by the run's final moment - the physics model itself still stops short
  // of simulating the merger (CLAUDE.md §8).
  const sourceCenter = { x: 150, y: 170 }
  const progressFraction = cutoffTime > 0 ? Math.min(1, displayedTime / cutoffTime) : 0
  const sourceOrbitRadius = isActive ? Math.max(0, 30 - progressFraction * 30) : 30
  const sourceOrbitAngle = 2 * Math.PI * chirpState.frequency * displayedTime
  const sourceDot1 = {
    x: sourceCenter.x + sourceOrbitRadius * Math.cos(sourceOrbitAngle),
    y: sourceCenter.y + sourceOrbitRadius * Math.sin(sourceOrbitAngle),
  }
  const sourceDot2 = {
    x: sourceCenter.x - sourceOrbitRadius * Math.cos(sourceOrbitAngle),
    y: sourceCenter.y - sourceOrbitRadius * Math.sin(sourceOrbitAngle),
  }
  const sourceGlowOpacity = isActive ? Math.min(0.65, 0.15 + trueStrainMagnitude * 3) : 0.25

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — Standard Sirens</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Can a gravitational wave, on its own, tell you how far
            away its source was? This is exactly the problem astronomers faced with GW170817
            (Experiment 4) — and solving it is what let them use a gravitational wave to measure
            how fast the universe itself is expanding.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A wave's amplitude fades with distance, the same way a
            sound or a light gets fainter the farther away it is. But the chirp's own shape — how
            quickly its frequency rises as the pair spirals closer and orbits faster (Experiment 2)
            — depends only on the masses involved, not on distance. That means you can work out
            how strong the wave truly was at the source, independent
            of how far away it traveled. Comparing that true amplitude to the weaker amplitude
            actually detected is called a <strong>standard siren</strong> — the gravitational-wave
            version of using a light source of known brightness to work out its distance.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict whether a nearby merger or a far-away one
            would look stronger by the time it reached Earth. Then predict whether the detected
            amplitude alone — without separately knowing the true amplitude — would be enough to
            work out the distance.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A note on units.</strong> Distances below are given in <strong>Mpc</strong>{' '}
            (megaparsecs) — the unit astronomers use for distances between galaxies. One Mpc is
            about 3.3 million light-years; GW170817, for comparison, was about 40 Mpc away.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Pick an event and a distance below, then run it and
            watch the true and detected amplitude numbers. Try "Nearby" and "Far" at the same event
            to see how much the detected amplitude changes, even though the true amplitude (driven
            only by mass) never does.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A new term: the Hubble constant.</strong> Pairing a source's distance with how
            fast it's moving away from us (its recession velocity, measured separately from its
            host galaxy's own light) gives a number describing how fast the universe is expanding —
            the Hubble constant.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Amplitude is modeled as falling off in exact inverse proportion to distance — a toy
              relationship, not the precise general-relativistic formula.
            </li>
            <li>
              The true amplitude is read directly from the chirp's own shape for the chosen mass;
              working out a real mass purely from an observed waveform is a much harder problem
              this experiment assumes is already solved.
            </li>
            <li>
              Recession velocities shown here are real, approximate published values for each
              event's host galaxy — not computed from this project's own Doppler model
              (Experiment 5), since in reality this number comes from the host galaxy's own light,
              not from the gravitational wave itself.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the same kind of merger happened once nearby and once far away, which one would
            look stronger — bigger strain — by the time it reached Earth?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {nearFarChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setNearFarPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${nearFarPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If you only saw the weaker, detected amplitude, could you work out the distance
            without separately knowing how strong the wave truly was at the source?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {distanceKnowChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setDistanceKnowPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${distanceKnowPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  nearFarChoices.find((c) => c.value === (nearFarPrediction ?? submittedNearFarPrediction))!.label
                }, ${
                  distanceKnowChoices.find(
                    (c) => c.value === (distanceKnowPrediction ?? submittedDistanceKnowPrediction)
                  )!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different events and
              distances as you like below. Or, change your predictions and start over:
            </p>
            <button
              type="button"
              onClick={handleChangePrediction}
              className="secondary-button"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(124, 58, 237, 0.22)',
              }}
            >
              Change predictions
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Event:</p>
          {REAL_EVENT_PRESETS.map((eventPreset) => (
            <button
              key={eventPreset.id}
              type="button"
              onClick={() => handleEventChange(eventPreset.id)}
              disabled={!hasPrediction || isRunning}
              className={`toggle-button${eventId === eventPreset.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {eventPreset.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Distance:</p>
          <button
            type="button"
            onClick={() => handleDistanceModeChange('real')}
            disabled={!hasPrediction || isRunning}
            className={`toggle-button${distanceMode === 'real' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            This event's real distance ({REAL_EVENT_DISTANCES_MPC[eventId]} Mpc)
          </button>
          {SCHEMATIC_DISTANCE_PRESETS.map((distancePreset) => (
            <button
              key={distancePreset.label}
              type="button"
              onClick={() =>
                handleDistanceModeChange(distancePreset.label === 'Nearby' ? 'nearby' : 'far')
              }
              disabled={!hasPrediction || isRunning}
              className={`toggle-button${
                distanceMode === (distancePreset.label === 'Nearby' ? 'nearby' : 'far') ? ' is-selected' : ''
              }`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {distancePreset.label} ({distancePreset.distanceMpc} Mpc)
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleDistanceModeChange('custom')}
            disabled={!hasPrediction || isRunning}
            className={`toggle-button${distanceMode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {distanceMode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="standard-siren-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Distance: {customDistanceMpc} Mpc
              </label>
              <input
                id="standard-siren-distance"
                type="range"
                min={MIN_CUSTOM_DISTANCE_MPC}
                max={MAX_CUSTOM_DISTANCE_MPC}
                step={1}
                value={customDistanceMpc}
                disabled={!hasPrediction || isRunning}
                onChange={(event) => {
                  setCustomDistanceMpc(Number(event.target.value))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || isRunning}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            True amplitude (at the source): {trueAmplitude.toFixed(4)} &nbsp;|&nbsp; Detected
            amplitude (after {distanceMpc} Mpc): {detected.toFixed(6)}
            <br />
            Distance recovered from comparing the two: {recoveredDistanceMpc.toFixed(1)} Mpc
            <br />
            {hubbleConstant !== null ? (
              <>
                Recession velocity: {recessionVelocityKmPerS} km/s &nbsp;|&nbsp; Estimated Hubble
                constant: {hubbleConstant.toFixed(1)} km/s/Mpc
              </>
            ) : (
              <>
                No recession velocity is available for {preset.label.split(' (')[0]} — it had no
                light counterpart (Experiment 4), so no host galaxy redshift was ever measured for
                it.
              </>
            )}
          </p>
        )}

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{
            marginTop: '1rem',
            display: 'block',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
            boxShadow: isActive
              ? `0 0 ${12 + detectedStrainMagnitude * 40}px rgba(124, 58, 237, ${0.2 + detectedStrainMagnitude * 0.6})`
              : 'none',
            transition: 'box-shadow 80ms linear',
          }}
        >
          <defs>
            <filter id="standard-siren-arm-glow" x="-75%" y="-75%" width="250%" height="250%">
              <feGaussianBlur stdDeviation={armGlowBlur} />
            </filter>
          </defs>

          {/* Blurred glow duplicates, intensity tied directly to the same detected-strain value
              the sharp lines below use - purely a presentation effect, not a separate quantity. */}
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={xEnd.x}
            y2={xEnd.y}
            stroke="#a78bfa"
            strokeWidth={armStrokeWidth + 7}
            strokeLinecap="round"
            opacity={armGlowOpacity}
            filter="url(#standard-siren-arm-glow)"
          />
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={yEnd.x}
            y2={yEnd.y}
            stroke="#22d3ee"
            strokeWidth={armStrokeWidth + 7}
            strokeLinecap="round"
            opacity={armGlowOpacity}
            filter="url(#standard-siren-arm-glow)"
          />

          <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#c4b5fd" strokeWidth={armStrokeWidth} strokeLinecap="round" />
          <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#67e8f9" strokeWidth={armStrokeWidth} strokeLinecap="round" />
          <circle cx={CORNER.x} cy={CORNER.y} r={pulseRadius} fill="#f5f3ff" opacity={isActive ? 0.9 : 0.6} />
          <circle cx={xEnd.x} cy={xEnd.y} r={5} fill="#c4b5fd" />
          <circle cx={yEnd.x} cy={yEnd.y} r={5} fill="#67e8f9" />

          <text x={(CORNER.x + xEnd.x) / 2} y={CORNER.y + 18} fill="#c4b5fd" fontSize="11" textAnchor="middle">
            Arm X (detected)
          </text>
          <text
            x={CORNER.x - 10}
            y={(CORNER.y + yEnd.y) / 2}
            fill="#67e8f9"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90, ${CORNER.x - 10}, ${(CORNER.y + yEnd.y) / 2})`}
          >
            Arm Y (detected)
          </text>

          {/* The source: the merging pair driving the wave, pulsing with the TRUE (distance-
              independent) strain, so the learner can see it behave differently from the arms. */}
          <line
            x1={sourceDot1.x}
            y1={sourceDot1.y}
            x2={sourceDot2.x}
            y2={sourceDot2.y}
            stroke="#fbbf24"
            strokeWidth={1}
            opacity={0.5}
          />
          <circle
            cx={sourceDot1.x}
            cy={sourceDot1.y}
            r={10 + trueStrainMagnitude * 40}
            fill="#fbbf24"
            opacity={sourceGlowOpacity}
          />
          <circle
            cx={sourceDot2.x}
            cy={sourceDot2.y}
            r={10 + trueStrainMagnitude * 40}
            fill="#fbbf24"
            opacity={sourceGlowOpacity}
          />
          <circle cx={sourceDot1.x} cy={sourceDot1.y} r={7} fill="#fde68a" />
          <circle cx={sourceDot2.x} cy={sourceDot2.y} r={7} fill="#fde68a" />
          <text x={sourceCenter.x} y={sourceCenter.y - 44} fill="#fbbf24" fontSize="10" textAnchor="middle">
            the source (true amplitude)
          </text>
        </svg>

        {isActive && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <strong>How to read this diagram.</strong> The glowing pair at the center is{' '}
              <strong>the source</strong> — the merging objects driving the wave. How brightly it
              pulses tracks the <strong>true amplitude</strong>: the same regardless of which
              distance you chose, because it depends only on mass.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                <span style={{ color: '#c4b5fd' }}>■</span> Arm X and{' '}
                <span style={{ color: '#67e8f9' }}>■</span> Arm Y are the detector's two arms.
                Unlike the source, their stretching tracks the <strong>detected amplitude</strong> —
                the true signal weakened by the distance you chose. Try switching between
                "Nearby" and "Far" and compare how much the arms move.
              </li>
              <li>
                The arms' movement is scaled up for visibility (a real detected signal is far too
                small to see) — a display choice only. The exact true and detected numbers,
                un-exaggerated, are shown above and in the Results panel below.
              </li>
            </ul>
          </div>
        )}

        {status === 'complete' && submittedNearFarPrediction && submittedDistanceKnowPrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You ran {preset.label}, at a distance of <strong>{distanceMpc} Mpc</strong>. The
              chirp's shape gives a true amplitude of <strong>{trueAmplitude.toFixed(4)}</strong> —
              what the wave was really like at the source, independent of distance. After
              weakening over {distanceMpc} Mpc, the detected amplitude was only{' '}
              <strong>{detected.toFixed(6)}</strong>.
            </p>
            <p>
              Comparing those two numbers recovers a distance of{' '}
              <strong>{recoveredDistanceMpc.toFixed(1)} Mpc</strong> — matching the{' '}
              {distanceMpc} Mpc you actually chose. This is the standard-siren method itself: the
              chirp's shape tells you how strong the wave truly was, and comparing that to what
              you actually detected tells you how far away it must have been.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> you guessed{' '}
              {nearFarChoices.find((c) => c.value === submittedNearFarPrediction)!.label.toLowerCase()}{' '}
              would look stronger. In fact, a nearby source is always stronger than a far one at
              the same mass — detected amplitude falls off the farther the wave travels, exactly
              like sound or light —{' '}
              {submittedNearFarPrediction === ACTUAL_NEAR_FAR
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> you guessed{' '}
              {distanceKnowChoices.find((c) => c.value === submittedDistanceKnowPrediction)!.label.toLowerCase()}{' '}
              — that the detected amplitude alone would
              {submittedDistanceKnowPrediction === 'yes' ? '' : ' not'} be enough to find the
              distance. In fact, the detected amplitude alone is never enough: you also need the
              true amplitude from the chirp's own shape to compare it to —{' '}
              {submittedDistanceKnowPrediction === ACTUAL_DISTANCE_KNOW
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>

            {hubbleConstant !== null ? (
              <>
                <p style={{ marginBottom: '0.5rem' }}>
                  Pairing that {recoveredDistanceMpc.toFixed(1)} Mpc distance with{' '}
                  {preset.label.split(' (')[0]}'s real, separately measured recession velocity of{' '}
                  <strong>{recessionVelocityKmPerS} km/s</strong> gives an estimated Hubble
                  constant of <strong>{hubbleConstant.toFixed(1)} km/s/Mpc</strong> — exactly the
                  calculation astronomers used with the real GW170817 event in 2017.
                </p>
                <div
                  style={{
                    marginTop: '0.75rem',
                    marginBottom: '0.75rem',
                    padding: '0.9rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #d97706',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>
                    Important: this is an illustration, not a precise match to the real result.
                  </p>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem' }}>
                    The real 2017 measurement from GW170817 had substantial uncertainty — its
                    published range was roughly {REAL_HUBBLE_CONSTANT_RANGE}. This experiment's toy
                    model gives one single number from one simplified run; it demonstrates the
                    method real astronomers used, not a faithful reproduction of their result.
                  </p>
                </div>
              </>
            ) : (
              <p>
                No recession velocity is available for {preset.label.split(' (')[0]}: it had no
                light counterpart (Experiment 4), so no host galaxy redshift was ever measured for
                it. Real astronomers faced the same limit — without a host galaxy's own light,
                GW150914 could not be paired with a recession velocity, so it could not be used to
                estimate the Hubble constant the way GW170817 could.
              </p>
            )}
          </div>
        )}
      </div>

      {status === 'complete' && submittedNearFarPrediction && submittedDistanceKnowPrediction && (
        <GravitationalWaveStandardSirenTutor
          key={runCount}
          predictedNearFar={submittedNearFarPrediction}
          predictedDistanceKnow={submittedDistanceKnowPrediction}
          trueAmplitude={trueAmplitude}
          detectedAmplitude={detected}
          recoveredDistanceMpc={recoveredDistanceMpc}
          eventLabel={preset.label}
          hubbleConstant={hubbleConstant}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
