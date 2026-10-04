import { useEffect, useState } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { classicalDopplerFactorFor, dopplerFactorFor } from '../physics/gravitationalWaveRedshiftExperiment'
import { GravitationalWaveRedshiftTutor } from './GravitationalWaveRedshiftTutor'

interface GravitationalWaveRedshiftExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Fixed, not learner-facing controls, matching Experiment 4's own precedent. The mass is fixed
// (not a learner control here) so this experiment isolates the one new idea — motion-based
// stretching — without re-mixing in the mass-based loudness/duration idea Experiments 2-4
// already taught (see this experiment's specification, "Simplifying assumptions").
const FIXED_MASS = 2
const BASE_FREQUENCY = 1
const BASE_AMPLITUDE = 0.03

// Fixed real-world playback duration, matching Experiment 4's own pacing.
const ANIMATION_DURATION_MS = 7000

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

// A purely illustrative traveling-wave pattern, matching Experiment 4's own approach, generalized
// to take an explicit cycle count. The arm overlay below uses a fixed count (it's illustrating
// strain, not frequency); the "Emitted"/"Detected" trace strips use a count proportional to each
// one's own frequency instead, so the two strips' wavelengths are directly, visually comparable —
// the same stretching the beacons and the "cycles behind" counter already show, now as a shape.
const WAVE_CYCLES_PER_ARM = 5
const WAVE_SEGMENTS = 48

function wavePoints(
  axis: 'x' | 'y',
  start: { x: number; y: number },
  end: { x: number; y: number },
  amplitudePixels: number,
  phase: number,
  cycles: number
) {
  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i <= WAVE_SEGMENTS; i += 1) {
    const t = i / WAVE_SEGMENTS
    const baseX = start.x + (end.x - start.x) * t
    const baseY = start.y + (end.y - start.y) * t
    const offset = amplitudePixels * Math.sin(2 * Math.PI * (t * cycles - phase))
    points.push(axis === 'x' ? { x: baseX, y: baseY + offset } : { x: baseX + offset, y: baseY })
  }
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
}

// This experiment's two prediction questions, per its specification's "Prediction Activity".
type DirectionChoice = 'higher' | 'lower' | 'same'
const directionChoices: Array<{ value: DirectionChoice; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'lower', label: 'Lower' },
  { value: 'same', label: 'The same' },
]

type MagnitudeChoice = 'exact' | 'more' | 'less'
const magnitudeChoices: Array<{ value: MagnitudeChoice; label: string }> = [
  { value: 'exact', label: 'Exactly that much' },
  { value: 'more', label: 'More' },
  { value: 'less', label: 'Less' },
]

interface RunSummary {
  speed: number
  finalEmittedFrequency: number
  finalDetectedFrequency: number
  measuredDopplerFactor: number
  classicalDopplerFactor: number
}

// Basic UI, the learner prediction interaction, the results panel, and the AI tutor, per
// CLAUDE.md §21/§23 Stage 5 and §6 (one-step-at-a-time), reusing Experiment 2's already-tested
// chirpStateAt directly and this experiment's own new dopplerFactorFor.
export function GravitationalWaveRedshiftExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalWaveRedshiftExperimentProps) {
  const [speed, setSpeed] = useState(0.5)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [observerTime, setObserverTime] = useState(0)
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null)
  const [runCount, setRunCount] = useState(0)

  const [directionPrediction, setDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [magnitudePrediction, setMagnitudePrediction] = useState<MagnitudeChoice | null>(null)
  const [submittedDirectionPrediction, setSubmittedDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [submittedMagnitudePrediction, setSubmittedMagnitudePrediction] = useState<MagnitudeChoice | null>(null)

  const hasPrediction = directionPrediction !== null && magnitudePrediction !== null
  const hasSubmittedPrediction = submittedDirectionPrediction !== null && submittedMagnitudePrediction !== null

  const isRunning = status === 'running'
  const isActive = isRunning || status === 'complete'

  const { cutoffTime: observerWindow } = chirpRunFor(FIXED_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)
  const dopplerFactor = dopplerFactorFor(speed)

  const displayedObserverTime = isActive ? Math.min(observerTime, observerWindow) : 0
  const sourceProperTime = displayedObserverTime * dopplerFactor
  const chirpState = chirpStateAt(sourceProperTime, FIXED_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)

  const emittedFrequency = chirpState.frequency
  const detectedFrequency = emittedFrequency * dopplerFactor

  // A reference pulse showing what the same run would look like with no motion at all
  // (dopplerFactor = 1): chirpStateAt driven directly by observer time, unscaled. At speed 0 this
  // is identical to the main chirpState above. Makes the stretching directly visible by
  // comparison — the reference pulses faster, the detected one visibly lags behind it — rather
  // than relying on the learner to remember how fast it pulsed at a different speed.
  const referenceChirpState = chirpStateAt(displayedObserverTime, FIXED_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)

  const handleRun = () => {
    if (!hasPrediction || isRunning) return
    if (!hasSubmittedPrediction) {
      setSubmittedDirectionPrediction(directionPrediction)
      setSubmittedMagnitudePrediction(magnitudePrediction)
    }
    setRunSummary(null)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Matches Experiment 4's own "Change predictions" control: re-opens both questions for editing
  // without resetting the chosen speed.
  const handleChangePrediction = () => {
    setSubmittedDirectionPrediction(null)
    setSubmittedMagnitudePrediction(null)
    setStatus('idle')
  }

  // Moving the slider after a run has completed must not leave that run's stale readout and
  // Results panel on screen — matching Experiment 4's own precedent.
  const handleSpeedChange = (value: number) => {
    setSpeed(value)
    if (status === 'complete') {
      setStatus('idle')
      setRunSummary(null)
    }
  }

  useEffect(() => {
    if (status !== 'running') return

    const runSpeed = speed
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      const currentObserverTime = progress * observerWindow
      setObserverTime(currentObserverTime)

      if (progress >= 1) {
        const runDopplerFactor = dopplerFactorFor(runSpeed)
        const finalChirpState = chirpStateAt(
          observerWindow * runDopplerFactor,
          FIXED_MASS,
          BASE_FREQUENCY,
          BASE_AMPLITUDE
        )
        setRunSummary({
          speed: runSpeed,
          finalEmittedFrequency: finalChirpState.frequency,
          finalDetectedFrequency: finalChirpState.frequency * runDopplerFactor,
          measuredDopplerFactor: runDopplerFactor,
          classicalDopplerFactor: classicalDopplerFactorFor(runSpeed),
        })
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, speed, observerWindow, onComplete])

  const xEnd = armEndPoint('x', chirpState.armXLength)
  const yEnd = armEndPoint('y', chirpState.armYLength)

  const strainMagnitude = Math.abs(chirpState.strain)
  const armStrokeWidth = isActive ? Math.min(11, 2 + strainMagnitude * 22) : 1.5
  const pulseRadius = isActive ? Math.min(15, 4 + strainMagnitude * 26) : 4
  const armGlowOpacity = isActive ? Math.min(0.85, strainMagnitude * 7) : 0
  const armGlowBlur = 2 + strainMagnitude * 6

  // The two comparison beacons' own pulse radii — deliberately larger than the small corner
  // pulse above, since these exist specifically to make the stretching easy to see at a glance.
  // Both use the exact same formula, so the only difference between them is their underlying
  // rate, not their visual scale.
  const referenceStrainMagnitude = Math.abs(referenceChirpState.strain)
  const detectedBeaconRadius = isActive ? Math.min(26, 10 + strainMagnitude * 40) : 10
  const emittedBeaconRadius = isActive ? Math.min(26, 10 + referenceStrainMagnitude * 40) : 10

  // How many more wave cycles the source has emitted than the detector has received so far —
  // the gap between the two beacons' phases, turned into a single running number. referenceChirpState
  // and chirpState are each other's own cycle counters: the reference's phase (fed with unscaled
  // observer time) is how many cycles the source would have emitted with no motion, and the main
  // chirpState's phase (fed with the slowed sourceProperTime) is how many cycles have actually
  // reached the detector by now. Both always use the exact same time origin, so this is a plain
  // reading of a value chirpStateAt already computes — not a new quantity.
  const cyclesBehind = Math.max(0, (referenceChirpState.phase - chirpState.phase) / (2 * Math.PI))

  const waveAmplitudeMagnitude = isActive ? Math.min(14, strainMagnitude * 160) : 0
  const waveSign = chirpState.strain < 0 ? -1 : 1
  const wavePhase = displayedObserverTime * detectedFrequency * 2
  const xWavePoints = wavePoints('x', CORNER, xEnd, waveAmplitudeMagnitude * waveSign, wavePhase, WAVE_CYCLES_PER_ARM)
  const yWavePoints = wavePoints('y', CORNER, yEnd, -waveAmplitudeMagnitude * waveSign, wavePhase, WAVE_CYCLES_PER_ARM)

  // A horizontal wave trace under each beacon, so the stretching is visible as a shape (a
  // visibly longer wavelength below "Detected" than below "Emitted"), not only as a pulsing
  // rate or a number. Each trace's cycle count is directly proportional to its own frequency
  // (TRACE_CYCLE_SCALE cycles per unit frequency), so the two strips' wavelengths are a direct,
  // honest picture of the same Doppler factor already driving everything else — not a separate
  // or exaggerated quantity.
  // Over this experiment's observer window (well under a second of simulated time), the raw
  // phase (time * frequency) only advances a fraction of a single cycle — not enough to visibly
  // scroll in 7 real seconds of playback. TRACE_SCROLL_BOOST speeds up only the traveling
  // appearance, applied equally to both traces, so the relative comparison between them (the
  // actual physics — how much more slowly "Detected" scrolls than "Emitted") is unchanged; only
  // their shared absolute pace is exaggerated for visibility, consistent with this experiment's
  // own "hugely exaggerated" assumption already stated in the introduction.
  const TRACE_CYCLE_SCALE = 4
  const TRACE_SCROLL_BOOST = 10
  const TRACE_LEFT = { x: 210, y: 0 }
  const TRACE_WIDTH = 104
  const TRACE_AMPLITUDE = isActive ? 8 : 0
  const emittedFrequencyForTrace = referenceChirpState.frequency
  const emittedTracePhase = displayedObserverTime * emittedFrequencyForTrace * 2 * TRACE_SCROLL_BOOST
  const detectedTracePhase = displayedObserverTime * detectedFrequency * 2 * TRACE_SCROLL_BOOST
  const emittedTraceY = 108
  const detectedTraceY = 218
  const emittedTracePoints = wavePoints(
    'x',
    { x: TRACE_LEFT.x, y: emittedTraceY },
    { x: TRACE_LEFT.x + TRACE_WIDTH, y: emittedTraceY },
    TRACE_AMPLITUDE,
    emittedTracePhase,
    emittedFrequencyForTrace * TRACE_CYCLE_SCALE
  )
  const detectedTracePoints = wavePoints(
    'x',
    { x: TRACE_LEFT.x, y: detectedTraceY },
    { x: TRACE_LEFT.x + TRACE_WIDTH, y: detectedTraceY },
    TRACE_AMPLITUDE,
    detectedTracePhase,
    detectedFrequency * TRACE_CYCLE_SCALE
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Stretched by Motion</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Experiments 2–4 built a complete toy model of an
            inspiraling pair's chirp, driven entirely by its mass. None of them asked what happens
            if the source itself is moving relative to the detector. If a gravitational wave's
            source is racing away from us as it sends the wave out, does that change what we
            detect?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The Doppler effect.</strong> You already know this effect from everyday life,
            even if you've never named it: an ambulance's siren sounds higher-pitched as it
            approaches you, then suddenly drops to a lower pitch once it's passed and is driving
            away. Nothing about the siren itself changed — what changed is that each new sound wave
            is sent from slightly farther away (or closer) than the last one, which stretches (or
            squeezes) the waves arriving at your ear. This is called the <strong>Doppler
            effect</strong>, and it applies to any kind of wave — sound, light, or a gravitational
            wave — whenever its source is moving relative to whoever is detecting it. You've also
            already met the word for what a <em>stretched</em> wave is called:{' '}
            <strong>redshift</strong> (first defined in the Gravity and Curved Spacetime chapter) —
            a signal arriving at a lower frequency than it was sent at. The Doppler effect is one
            specific cause of a redshift: motion.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll run the same chirp animation as Experiment 2, now
            with the source receding from the detector at a speed you choose. The detector's arms
            will pulse at the <em>detected</em> frequency — slower than the frequency the source
            actually emitted — so you'll watch the stretching happen, not just read it as a number.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict whether the detected frequency will be
            higher, lower, or the same as the frequency at the source. Then — this is the twist —
            predict whether the real stretching will match what an everyday Doppler effect (like
            sound) alone would predict, or be more or less than that.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Two beacons in the diagram pulse side by
            side: "Emitted" pulses at the source's own rate, "Detected" pulses at the rate the
            arms actually show you. A wave trace runs under each one, too — the same stretching
            as a shape, not just a rate: "Detected" draws a visibly longer, more spread-out wave
            than "Emitted." At zero speed everything matches; as you increase the speed, watch
            "Detected" fall behind, stretch out, and shrink — that gap <em>is</em> the stretching,
            directly visible rather than something you have to remember from a moment ago. Then
            compare the two frequency numbers above the diagram: "as emitted" and "as detected."
            The gap between them is the Doppler factor, and you'll see it's slightly bigger than
            an everyday Doppler effect alone would produce.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything Experiments 1–4 already assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, no real detection hardware is modeled,
              the merger itself isn't modeled, and the chirp formulas are simplified stand-ins, not
              the real post-Newtonian equations.
            </li>
            <li>
              The source moves directly away from the detector only — no sideways motion, and no
              approaching ("blueshifted") case.
            </li>
            <li>
              This experiment models only the motion-based (Doppler) part of redshift. For a real,
              very distant source, the dominant contributor to its total redshift is usually a
              separate, much larger effect — the cosmological expansion of space itself while the
              wave travels — which is not modeled here.
            </li>
            <li>
              The source's mass is fixed at one value here, not a control, so this experiment stays
              focused on the one new idea: motion-based stretching.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If a gravitational wave's source is moving away from the detector, will the detected
            frequency be higher, lower, or the same as the frequency at the source?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {directionChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setDirectionPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${directionPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            You're about to compare the detected frequency to what you'd expect from an everyday
            Doppler effect alone (like sound). Do you think the real detected frequency will be
            stretched by exactly that much, by more, or by less?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {magnitudeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setMagnitudePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${magnitudePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  directionChoices.find((c) => c.value === (directionPrediction ?? submittedDirectionPrediction))!.label
                }, ${
                  magnitudeChoices.find((c) => c.value === (magnitudePrediction ?? submittedMagnitudePrediction))!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different speeds as
              you like below — move the slider, then click "Run" again. Or, change your
              predictions and start over:
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

        <label htmlFor="redshift-speed" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Recession speed: {speed.toFixed(2)}c
        </label>
        <input
          id="redshift-speed"
          type="range"
          min={0}
          max={0.9}
          step={0.05}
          value={speed}
          disabled={!hasPrediction || isRunning}
          onChange={(event) => handleSpeedChange(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem' }}>
            Frequency as emitted: {emittedFrequency.toFixed(3)} &nbsp;|&nbsp; Frequency as
            detected: {detectedFrequency.toFixed(3)}
            <br />
            Doppler factor: {dopplerFactor.toFixed(3)} &nbsp;|&nbsp; Strain:{' '}
            {chirpState.strain.toFixed(3)}
          </p>
        )}

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{
            marginTop: '1rem',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          <defs>
            <filter id="redshift-arm-glow" x="-75%" y="-75%" width="250%" height="250%">
              <feGaussianBlur stdDeviation={armGlowBlur} />
            </filter>
          </defs>

          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={xEnd.x}
            y2={xEnd.y}
            stroke="#a78bfa"
            strokeWidth={armStrokeWidth + 6}
            strokeLinecap="round"
            opacity={armGlowOpacity}
            filter="url(#redshift-arm-glow)"
          />
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={yEnd.x}
            y2={yEnd.y}
            stroke="#22d3ee"
            strokeWidth={armStrokeWidth + 6}
            strokeLinecap="round"
            opacity={armGlowOpacity}
            filter="url(#redshift-arm-glow)"
          />

          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={xEnd.x}
            y2={xEnd.y}
            stroke="#c4b5fd"
            strokeWidth={armStrokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={yEnd.x}
            y2={yEnd.y}
            stroke="#67e8f9"
            strokeWidth={armStrokeWidth}
            strokeLinecap="round"
          />
          <circle cx={CORNER.x} cy={CORNER.y} r={pulseRadius} fill="#f5f3ff" opacity={isActive ? 0.9 : 0.6} />
          <circle cx={xEnd.x} cy={xEnd.y} r={5} fill="#c4b5fd" />
          <circle cx={yEnd.x} cy={yEnd.y} r={5} fill="#67e8f9" />

          <polyline points={xWavePoints} fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />
          <polyline points={yWavePoints} fill="none" stroke="#67e8f9" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />

          <text x={(CORNER.x + xEnd.x) / 2} y={CORNER.y + 18} fill="#c4b5fd" fontSize="11" textAnchor="middle">
            Arm X
          </text>
          <text
            x={CORNER.x - 10}
            y={(CORNER.y + yEnd.y) / 2}
            fill="#67e8f9"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90, ${CORNER.x - 10}, ${(CORNER.y + yEnd.y) / 2})`}
          >
            Arm Y
          </text>

          {/* Two large pulsing beacons, one above the other: "Emitted" pulses at the source's own
              rate (no motion applied), "Detected" pulses at the rate the detector actually
              receives. Both use the exact same strain-to-radius formula, so the only difference
              between them is how fast they pulse — making the stretching directly visible by
              comparison, instead of relying on the learner to remember how fast the arms pulsed
              at a different speed. A wave trace runs under each one, drawn with a cycle count
              proportional to that beacon's own frequency, so the stretching also shows up as a
              shape (a visibly longer wavelength under "Detected") — the same comparison, now in
              two forms at once. The running "cycles behind" count beneath both turns the same
              comparison into a single growing number. */}
          <circle cx={265} cy={55} r={emittedBeaconRadius} fill="#fde68a" opacity={isActive ? 0.9 : 0.5} />
          <text x={265} y={95} fill="#fde68a" fontSize="12" textAnchor="middle">
            Emitted
          </text>
          <polyline points={emittedTracePoints} fill="none" stroke="#fde68a" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />
          <circle cx={265} cy={165} r={detectedBeaconRadius} fill="#f5f3ff" opacity={isActive ? 0.9 : 0.5} />
          <text x={265} y={205} fill="#f5f3ff" fontSize="12" textAnchor="middle">
            Detected
          </text>
          <polyline points={detectedTracePoints} fill="none" stroke="#f5f3ff" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />
          {/* A prominent badge for the "cycles behind" count — large, bold, high-contrast, with
              its own background — rather than a small caption easy to miss against the dark
              diagram. Positioned below Arm X's own line (y ~ CORNER.y) so it never overlaps it. */}
          {isActive && (
            <>
              <rect x={213} y={282} width={104} height={32} rx={6} fill="#1e2538" stroke="#fbbf24" strokeWidth={1} />
              <text x={265} y={303} fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle">
                {cyclesBehind.toFixed(1)} behind
              </text>
            </>
          )}
        </svg>
        {isActive && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Each beacon's size is its strain at that instant — the same loudness the chirp is
            always building toward its final moment. Because the detected signal is delayed, by
            any given moment it hasn't built up as far as the emitted one has — so "Detected" runs
            both behind <em>and</em> smaller than "Emitted," never ahead or bigger. (If the source
            were approaching instead of receding, detected would run ahead and louder — but that
            case isn't shown in this experiment.)
          </p>
        )}

        {status === 'complete' && runSummary && submittedDirectionPrediction && submittedMagnitudePrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              At a recession speed of <strong>{runSummary.speed.toFixed(2)}c</strong>, the wave was
              emitted at <strong>{runSummary.finalEmittedFrequency.toFixed(3)}</strong> and detected
              at <strong>{runSummary.finalDetectedFrequency.toFixed(3)}</strong> — a measured
              Doppler factor of <strong>{runSummary.measuredDopplerFactor.toFixed(3)}</strong>.
            </p>
            <p>
              An everyday Doppler effect alone (like sound) would predict a factor of{' '}
              <strong>{runSummary.classicalDopplerFactor.toFixed(3)}</strong>.{' '}
              {runSummary.speed === 0
                ? 'With no motion, there is nothing to stretch, so the real, measured factor matches that exactly.'
                : 'The real, measured factor is smaller than that — the wave is stretched somewhat more than the everyday guess alone would predict, because relativistic time dilation adds extra stretching on top of it.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your predictions:</strong>{' '}
              {directionChoices.find((c) => c.value === submittedDirectionPrediction)!.label.toLowerCase()},{' '}
              {magnitudeChoices.find((c) => c.value === submittedMagnitudePrediction)!.label.toLowerCase()}.
              In fact: the detected frequency was{' '}
              {runSummary.speed === 0 ? 'the same as' : 'lower than'} the emitted frequency, and the
              real stretching was{' '}
              {runSummary.speed === 0
                ? 'exactly what an everyday Doppler effect alone would predict (there was no motion to stretch it)'
                : 'more than an everyday Doppler effect alone would predict'}
              .
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              This experiment models only the velocity-based part of redshift. A real, very distant
              detected event's total redshift is usually dominated by a separate, larger effect —
              the cosmological expansion of space itself while the wave travels — not modeled here.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedDirectionPrediction && submittedMagnitudePrediction && (
        <GravitationalWaveRedshiftTutor
          key={runCount}
          predictedDirection={submittedDirectionPrediction}
          predictedMagnitude={submittedMagnitudePrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
