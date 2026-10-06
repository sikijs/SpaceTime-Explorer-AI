import { useEffect, useState } from 'react'
import { GALAXY_PRESETS, MAX_CUSTOM_DISTANCE_MPC, recessionSpeedKmPerS } from '../physics/hubblesLawExperiment'
import {
  distanceAtPastTimeMpc,
  REAL_UNIVERSE_AGE_YEARS,
  runBigBangExperiment,
} from '../physics/bigBangExperiment'
import { BigBangTutor } from './BigBangTutor'

interface BigBangExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 420
const VIEW_HEIGHT = 220
const EARTH_X = 360
const EARTH_Y = 140
const GALAXY_MIN_X = 50
const MIN_CUSTOM_DISTANCE_MPC = 1

// The time scale above the main diagram, sharing the same horizontal range as the galaxy markers
// below it - so the pointer's rightward movement visually tracks the galaxies' own convergence.
// Drawn as a ruler (evenly spaced tick marks) with a vertical line pointer, rather than a dot.
const SCALE_HEIGHT = 64
const SCALE_AXIS_Y = 28
const SCALE_TICK_COUNT = 10

type DistanceMode = 'virgo' | 'coma' | 'far' | 'custom'

// Fixed real-world playback duration, independent of the (here, distance-independent) Hubble time
// being played back (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 4500

// Maps a distance to a horizontal position, with 0 distance landing exactly on Earth's own
// position - so that, unlike Experiment 1's diagram, a galaxy visibly merges with Earth once its
// backward-extrapolated distance reaches zero.
function positionXForDistance(distanceMpc: number): number {
  const clamped = Math.max(0, Math.min(MAX_CUSTOM_DISTANCE_MPC, distanceMpc))
  return EARTH_X - (clamped / MAX_CUSTOM_DISTANCE_MPC) * (EARTH_X - GALAXY_MIN_X)
}

function formatBillionYears(years: number): string {
  return (years / 1e9).toFixed(2)
}

interface GalaxyMarker {
  key: string
  label: string
  distanceMpc: number
  selected: boolean
  labelYOffset: number
}

// This experiment's two prediction questions, per its specification's "Prediction Activity".
type TimeComparisonChoice = 'longer' | 'shorter' | 'same'
const timeComparisonChoices: Array<{ value: TimeComparisonChoice; label: string }> = [
  { value: 'longer', label: 'Longer' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'same', label: 'The same' },
]

type AgeComparisonChoice = 'muchLonger' | 'muchShorter' | 'close'
const ageComparisonChoices: Array<{ value: AgeComparisonChoice; label: string }> = [
  { value: 'muchLonger', label: 'Much longer' },
  { value: 'muchShorter', label: 'Much shorter' },
  { value: 'close', label: 'Close, but not exact' },
]

// Guaranteed by the physics itself (hubbleTimeYears does not depend on distance, and the
// illustrative H0 = 70 km/s/Mpc gives a value close to, but not exactly, the real universe age -
// see bigBangExperiment.test.ts) - not dependent on the learner's chosen galaxy.
const ACTUAL_TIME_COMPARISON: TimeComparisonChoice = 'same'
const ACTUAL_AGE_COMPARISON: AgeComparisonChoice = 'close'

export function BigBangExperiment({ onComplete, onTutorComplete }: BigBangExperimentProps) {
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('virgo')
  const [customDistanceMpc, setCustomDistanceMpc] = useState(50)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)
  // The forward playback (singularity -> today), offered only after the backward run completes.
  const [forwardStatus, setForwardStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [forwardProgress, setForwardProgress] = useState(0)

  const [timePrediction, setTimePrediction] = useState<TimeComparisonChoice | null>(null)
  const [agePrediction, setAgePrediction] = useState<AgeComparisonChoice | null>(null)
  const [submittedTimePrediction, setSubmittedTimePrediction] = useState<TimeComparisonChoice | null>(null)
  const [submittedAgePrediction, setSubmittedAgePrediction] = useState<AgeComparisonChoice | null>(null)

  const hasPrediction = timePrediction !== null && agePrediction !== null
  const hasSubmittedPrediction = submittedTimePrediction !== null && submittedAgePrediction !== null

  const selectedDistanceMpc =
    distanceMode === 'virgo'
      ? GALAXY_PRESETS[0].distanceMpc
      : distanceMode === 'coma'
        ? GALAXY_PRESETS[1].distanceMpc
        : distanceMode === 'far'
          ? GALAXY_PRESETS[2].distanceMpc
          : customDistanceMpc

  const selectedLabel =
    distanceMode === 'virgo'
      ? GALAXY_PRESETS[0].label
      : distanceMode === 'coma'
        ? GALAXY_PRESETS[1].label
        : distanceMode === 'far'
          ? GALAXY_PRESETS[2].label
          : 'Custom'

  const result = runBigBangExperiment(selectedDistanceMpc)
  const isActive = status === 'running' || status === 'complete'

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedTimePrediction(timePrediction)
      setSubmittedAgePrediction(agePrediction)
    }
    setStatus('running')
    setProgress(0)
    setForwardStatus('idle')
    setForwardProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's own precedent: re-opens both questions for editing
  // without resetting the chosen galaxy.
  const handleChangePrediction = () => {
    setSubmittedTimePrediction(null)
    setSubmittedAgePrediction(null)
    setStatus('idle')
    setForwardStatus('idle')
    setForwardProgress(0)
  }

  // Plays the same already-computed trajectory the other way: singularity -> today, so the
  // galaxies visibly expand outward from Earth - only offered once the backward run has reached
  // the singularity, since it replays that same simplified model, not a new calculation.
  const handlePlayForward = () => {
    if (status !== 'complete' || forwardStatus === 'running') return
    setForwardStatus('running')
    setForwardProgress(0)
  }

  const handleGalaxyChange = (mode: DistanceMode) => {
    setDistanceMode(mode)
    setForwardStatus('idle')
    setForwardProgress(0)
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
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  useEffect(() => {
    if (forwardStatus !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setForwardProgress(fraction)

      if (fraction >= 1) {
        setForwardStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [forwardStatus])

  const isForwardActive = forwardStatus === 'running' || forwardStatus === 'complete'
  const displayedProgress = status === 'idle' ? 0 : progress
  const displayedForwardProgress = forwardStatus === 'idle' ? 0 : forwardProgress
  // Years since this moment, measured backward from today (the backward run) or forward from the
  // singularity (the forward run) - both read from the same underlying trajectory.
  const yearsAgo = isForwardActive
    ? result.hubbleTimeYears * (1 - displayedForwardProgress)
    : displayedProgress * result.hubbleTimeYears
  // The scale's pointer counts down this remaining time to the singularity during the backward
  // run, reaching exactly 0 at the same moment the galaxy markers below converge on Earth.
  const remainingTimeYears = result.hubbleTimeYears * (1 - displayedProgress)
  // ...and counts up this elapsed time since the singularity during the forward run, reaching the
  // full Hubble time at the same moment the galaxies reach their present-day distances.
  const elapsedSinceSingularityYears = result.hubbleTimeYears * displayedForwardProgress
  const scalePointerX = isForwardActive
    ? EARTH_X - displayedForwardProgress * (EARTH_X - GALAXY_MIN_X)
    : GALAXY_MIN_X + displayedProgress * (EARTH_X - GALAXY_MIN_X)

  const galaxies: GalaxyMarker[] = [
    {
      key: 'virgo',
      label: GALAXY_PRESETS[0].label,
      distanceMpc: GALAXY_PRESETS[0].distanceMpc,
      selected: distanceMode === 'virgo',
      labelYOffset: -40,
    },
    {
      key: 'coma',
      label: GALAXY_PRESETS[1].label,
      distanceMpc: GALAXY_PRESETS[1].distanceMpc,
      selected: distanceMode === 'coma',
      labelYOffset: 34,
    },
    {
      key: 'far',
      label: GALAXY_PRESETS[2].label,
      distanceMpc: GALAXY_PRESETS[2].distanceMpc,
      selected: distanceMode === 'far',
      labelYOffset: -56,
    },
    ...(distanceMode === 'custom'
      ? [
          {
            key: 'custom',
            label: 'Custom',
            distanceMpc: customDistanceMpc,
            selected: true,
            labelYOffset: 50,
          },
        ]
      : []),
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — The Big Bang</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> If every distant galaxy is moving away from us, and the
            farther one is the faster it recedes (Hubble's Law), what happens if we run that
            relationship backward in time?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Running Hubble's Law backward lets us ask, for any
            galaxy, how long ago — at today's recession speed, held constant — its distance from
            us would have been zero. That moment is popularly called{' '}
            <strong>the Big Bang</strong>, and the time back to it is called the{' '}
            <strong>Hubble time</strong>. Physicists sometimes call this starting moment a{' '}
            <strong>singularity</strong> — not a place you could travel to or examine, but the
            point where this simplified model's distances and timeline both reach zero. What
            actually happens there requires physics (quantum gravity) this experiment does not
            model.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A real puzzle this simple picture runs into.</strong> The universe looks almost
            the same temperature and brightness in every direction we look. But if you trace any
            two opposite patches of sky back to the Hubble time, those two patches were so far
            apart that not even light had had enough time to travel between them — so nothing
            could have "mixed" them to make them match. Physicists call this the{' '}
            <strong>horizon problem</strong>: why does the universe look so uniform if its distant
            parts were never in contact? The leading explanation is a theory called{' '}
            <strong>cosmic inflation</strong> — an extremely fast stretching of space itself, in a
            tiny fraction of a second after the Big Bang, that could have taken one small,
            already-even patch and blown it up to become our entire visible universe. That's why
            everything still looks so similar today. Imagine a single wrinkled bedsheet stretched
            so fast and so far that one small square of it ends up covering an entire football
            field — the whole field now looks smooth and even, not because every part of it was
            smoothed out, but because it all came from that one already-smooth square. Inflation
            is still an actively debated theory, not a settled fact: it explains the horizon
            problem well, but scientists don't yet have a definitive, falsifiable test that
            confirms it actually happened.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> This is the same reasoning as noticing a candle
            has been burning down at a steady rate and asking: at that rate, how long ago was it
            full-length? You don't need to have watched it burn the whole time — today's length and
            rate are enough to work backward. This experiment does the same thing for each galaxy's
            distance and recession speed.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A simple example.</strong> Take one galaxy: if it's currently 16.5 Mpc away and,
            from Hubble's Law, receding at 70 km/s for every Mpc of distance, dividing its distance
            by its speed tells us how long, at that constant rate, it would take to travel back to
            zero distance from us. That's exactly the calculation this experiment runs for whichever
            galaxy you pick.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict whether a farther galaxy's implied time since
            it was at zero distance is longer, shorter, or the same as a nearer galaxy's. Then
            predict how this experiment's answer will compare to the universe's real,
            independently measured age.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Pick a galaxy below, run it, and watch all the
            galaxies' markers slide toward Earth together as the "years ago" counter rises. Notice
            when each one reaches Earth. Once that finishes, you can also play it forward — from
            the singularity outward — to see the same result the other way around.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Each galaxy's recession speed is treated as if it had stayed exactly constant
              throughout its whole history, so running it backward in a straight line is valid. In
              reality, the universe's expansion rate has changed over time, so this is a
              simplification, not the real expansion history.
            </li>
            <li>
              This experiment only shows each galaxy's distance <strong>from Earth</strong>{' '}
              shrinking to zero — not that every galaxy's distance from every other galaxy is
              shrinking the same way. An observer on any other galaxy would see exactly the same
              pattern, with every other galaxy (including ours) pointing back to the same shared
              moment. Earth is used here only as a reference point, not because it is special or
              central.
            </li>
            <li>
              The real age of the universe (about 13.8 billion years) is stated as an
              independently measured comparison value, not derived here.
            </li>
            <li>
              No orbits, structure, or individual galaxy physics are modeled — each galaxy remains
              simply a labeled distance, exactly as in Experiment 1.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If you picked a farther galaxy instead of a nearer one, do you think the time since it
            was at zero distance from us would be longer, shorter, or the same?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {timeComparisonChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setTimePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${timePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            How do you think this experiment's answer will compare to the universe's real,
            independently measured age (about 13.8 billion years)?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {ageComparisonChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setAgePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${agePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  timeComparisonChoices.find((c) => c.value === (timePrediction ?? submittedTimePrediction))!
                    .label
                }, ${
                  ageComparisonChoices.find((c) => c.value === (agePrediction ?? submittedAgePrediction))!
                    .label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different galaxies as
              you like below. Or, change your predictions and start over:
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

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Galaxy:</p>
          {GALAXY_PRESETS.slice(0, 2).map((preset, index) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleGalaxyChange(index === 0 ? 'virgo' : 'coma')}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${
                distanceMode === (index === 0 ? 'virgo' : 'coma') ? ' is-selected' : ''
              }`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {preset.label} ({preset.distanceMpc} Mpc)
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleGalaxyChange('far')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${distanceMode === 'far' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {GALAXY_PRESETS[2].label} ({GALAXY_PRESETS[2].distanceMpc} Mpc)
          </button>
          <button
            type="button"
            onClick={() => handleGalaxyChange('custom')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${distanceMode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {distanceMode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="big-bang-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Distance: {customDistanceMpc} Mpc
              </label>
              <input
                id="big-bang-distance"
                type="range"
                min={MIN_CUSTOM_DISTANCE_MPC}
                max={MAX_CUSTOM_DISTANCE_MPC}
                step={1}
                value={customDistanceMpc}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomDistanceMpc(Number(event.target.value))
                  if (status === 'complete') setStatus('idle')
                  setForwardStatus('idle')
                  setForwardProgress(0)
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
          disabled={!hasPrediction || status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Distance: {selectedDistanceMpc} Mpc &nbsp;|&nbsp; Recession speed:{' '}
            {recessionSpeedKmPerS(selectedDistanceMpc).toFixed(0)} km/s
            <br />
            {isForwardActive ? (
              <>Since the Big Bang: {formatBillionYears(elapsedSinceSingularityYears)} billion years</>
            ) : (
              <>Years ago: {formatBillionYears(yearsAgo)} billion</>
            )}
            {status === 'complete' && (
              <>
                {' '}
                &nbsp;|&nbsp; Hubble time (same for every galaxy):{' '}
                {formatBillionYears(result.hubbleTimeYears)} billion years
              </>
            )}
          </p>
        )}

        {status === 'complete' && (
          <button
            type="button"
            className="secondary-button"
            onClick={handlePlayForward}
            disabled={forwardStatus === 'running'}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              cursor: forwardStatus === 'running' ? 'not-allowed' : 'pointer',
              backgroundColor: 'rgba(250, 204, 21, 0.18)',
              display: 'block',
            }}
          >
            {forwardStatus === 'running'
              ? 'Expanding outward...'
              : forwardStatus === 'complete'
                ? 'Play forward again (from the Big Bang)'
                : 'Play forward (from the Big Bang)'}
          </button>
        )}

        <svg
          width={VIEW_WIDTH}
          height={SCALE_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${SCALE_HEIGHT}`}
          style={{
            marginTop: '1rem',
            display: 'block',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          {/* The time scale: a ruler divided into evenly spaced blocks (alternating shades),
              counting down from the Hubble time to 0 as the animation plays, reaching 0 - the
              singularity - at the same moment the galaxies below converge. */}
          {Array.from({ length: SCALE_TICK_COUNT }).map((_, i) => {
            const xStart = GALAXY_MIN_X + (i / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
            const xEnd = GALAXY_MIN_X + ((i + 1) / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
            return (
              <rect
                key={i}
                x={xStart}
                y={SCALE_AXIS_Y - 3}
                width={xEnd - xStart}
                height={6}
                fill={i % 2 === 0 ? '#475569' : '#334155'}
              />
            )
          })}
          {Array.from({ length: SCALE_TICK_COUNT + 1 }).map((_, i) => {
            const x = GALAXY_MIN_X + (i / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
            const isMajorTick = i % 5 === 0
            const tickHalfHeight = isMajorTick ? 9 : 5
            return (
              <line
                key={i}
                x1={x}
                y1={SCALE_AXIS_Y - tickHalfHeight}
                x2={x}
                y2={SCALE_AXIS_Y + tickHalfHeight}
                stroke="#94a3b8"
                strokeWidth={1}
              />
            )
          })}
          <text x={GALAXY_MIN_X} y={SCALE_AXIS_Y - 12} fill="#e2e8f0" fontSize="10" textAnchor="start">
            {formatBillionYears(result.hubbleTimeYears)} billion years ago
          </text>
          <text x={EARTH_X} y={SCALE_AXIS_Y - 12} fill="#f87171" fontSize="10" textAnchor="end">
            0 — the singularity
          </text>
          {/* The pointer: a vertical line sweeping across the ruler, rather than a moving dot. */}
          <line
            x1={scalePointerX}
            y1={SCALE_AXIS_Y - 14}
            x2={scalePointerX}
            y2={SCALE_AXIS_Y + 14}
            stroke="#facc15"
            strokeWidth={2}
          />
          <text x={scalePointerX} y={SCALE_AXIS_Y + 28} fill="#facc15" fontSize="10" textAnchor="middle">
            {isForwardActive
              ? `${formatBillionYears(elapsedSinceSingularityYears)} billion years since the Big Bang`
              : `${formatBillionYears(remainingTimeYears)} billion years`}
          </text>
        </svg>

        <svg
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          style={{
            marginTop: '0.5rem',
            display: 'block',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          {/* Earth (this experiment's reference point) */}
          <circle cx={EARTH_X} cy={EARTH_Y} r={14} fill="#38bdf8" />
          <text x={EARTH_X} y={EARTH_Y - 24} fill="#e2e8f0" fontSize="11" textAnchor="middle">
            Earth
          </text>

          {galaxies.map((galaxy) => {
            const currentDistance = isActive
              ? distanceAtPastTimeMpc(galaxy.distanceMpc, yearsAgo)
              : galaxy.distanceMpc
            const x = positionXForDistance(currentDistance)
            // The trail's anchor is wherever this run started from: the galaxy's present-day
            // position for the backward run, or Earth itself for the forward run - so the trail
            // always grows behind the marker as it travels, instead of shrinking.
            const trailAnchorX = isForwardActive ? EARTH_X : positionXForDistance(galaxy.distanceMpc)
            return (
              <g key={galaxy.key}>
                {/* A trailing path behind the selected galaxy only, so it's visually easy to
                    pick out and follow as it travels - a visual emphasis, not a change in what's
                    actually happening (every galaxy travels the same way). */}
                {galaxy.selected && isActive && (
                  <line
                    x1={trailAnchorX}
                    y1={EARTH_Y}
                    x2={x}
                    y2={EARTH_Y}
                    stroke="#facc15"
                    strokeWidth={3}
                    opacity={0.35}
                  />
                )}
                <circle cx={x} cy={EARTH_Y} r={galaxy.selected ? 10 : 7} fill={galaxy.selected ? '#facc15' : '#e2e8f0'}>
                  {galaxy.selected && (
                    <animate attributeName="r" values="10;14;10" dur="1.2s" repeatCount="indefinite" />
                  )}
                </circle>
                {galaxy.selected && (
                  <circle cx={x} cy={EARTH_Y} r={10} fill="none" stroke="#facc15" strokeWidth={2}>
                    <animate attributeName="r" values="10;22" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  x={x}
                  y={EARTH_Y + galaxy.labelYOffset}
                  fill={galaxy.selected ? '#facc15' : '#e2e8f0'}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {galaxy.label}
                </text>
              </g>
            )
          })}
        </svg>

        {hasSubmittedPrediction && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <strong>How to read this diagram.</strong> <strong>Earth</strong> is this
              experiment's reference point. Each other dot is one of the galaxies, positioned by
              its present-day distance — spacing here is illustrative, not drawn to true cosmic
              scale. The <strong>selected galaxy</strong> (gold, pulsing, with a trailing line once
              running) is the one the live readout describes — the pulse and trail are just to
              help your eye follow it; every galaxy actually travels the same way.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                The scale above counts down from the Hubble time to <strong>0</strong>, the{' '}
                <strong>singularity</strong> (defined above) — its gold pointer moves in step with
                the galaxies below, reaching 0 at the same moment they reach Earth.
              </li>
              <li>
                Running the experiment plays time backward: watch every dot slide toward Earth
                together as the "years ago" counter rises.
              </li>
              <li>
                When a dot reaches Earth, this simplified model's distance for that galaxy has
                reached zero — not a literal collision, just the moment this calculation points
                back to. Watch whether every galaxy reaches that moment at the same time, or at
                different times.
              </li>
              <li>
                Once the backward run finishes, "Play forward (from the Big Bang)" replays the
                same calculation the other way: starting from the singularity — every galaxy at
                zero distance from Earth, the moment labeled "0" on the scale — and moving forward
                in time, the universe expanding outward until every galaxy reaches its present-day
                distance, at "today." This is the same simplified, constant-speed model shown in
                reverse, not a new calculation and not a simulation of the real expansion history
                (see "What we assume" above).
              </li>
              <li>
                Watch how fast each dot moves outward during that forward playback: the farther
                galaxy moves out faster than the nearer one, covering more distance in the same
                time, because Hubble's Law makes recession speed proportional to distance — the
                same relationship from Experiment 1, not a new effect introduced here.
              </li>
            </ul>
          </div>
        )}

        {status === 'complete' && submittedTimePrediction && submittedAgePrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              Running Hubble's Law backward, the time since <strong>{selectedLabel}</strong> was
              at zero distance from us works out to{' '}
              <strong>{formatBillionYears(result.hubbleTimeYears)} billion years</strong> — the{' '}
              <strong>Hubble time</strong>.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> you guessed the implied time for a
              farther galaxy would be{' '}
              {timeComparisonChoices.find((c) => c.value === submittedTimePrediction)!.label.toLowerCase()}
              . This number does not depend on distance at all — every galaxy, however far away,
              gives exactly the same answer —{' '}
              {submittedTimePrediction === ACTUAL_TIME_COMPARISON
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> you guessed this answer would be{' '}
              {ageComparisonChoices.find((c) => c.value === submittedAgePrediction)!.label.toLowerCase()}{' '}
              compared to the real universe age —{' '}
              {submittedAgePrediction === ACTUAL_AGE_COMPARISON
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This does not mean Earth is special or at the center of the universe. An observer on
              any other galaxy would see exactly the same pattern, with every other galaxy
              (including ours) pointing back to the same shared moment.
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
                Important: this is not how astronomers actually measure the universe's age.
              </p>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem' }}>
                The real, independently measured age of the universe is about{' '}
                {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)} billion years — close to this
                experiment's naive, constant-speed estimate, which is genuinely informative but not
                proof that this simplified method is the real one. The universe's actual expansion
                rate has sped up and slowed down across its history (matter, radiation, and dark
                energy each played a part), so simply running today's rate backward does not
                perfectly retrace the real history.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && submittedTimePrediction && submittedAgePrediction && (
        <BigBangTutor
          key={runCount}
          predictedTimeComparison={submittedTimePrediction}
          predictedAgeComparison={submittedAgePrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
