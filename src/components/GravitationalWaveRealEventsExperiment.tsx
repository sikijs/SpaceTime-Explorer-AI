import { useEffect, useState } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { orbitalEnergyStateAt } from '../physics/gravitationalWaveEnergyExperiment'
import { REAL_EVENT_PRESETS } from '../physics/gravitationalWaveRealEventsExperiment'
import { GravitationalWaveRealEventsTutor } from './GravitationalWaveRealEventsTutor'

interface GravitationalWaveRealEventsExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Fixed, not learner-facing controls, matching Experiments 2 and 3 exactly.
const BASE_FREQUENCY = 1
const BASE_AMPLITUDE = 0.03

// Fixed real-world playback duration, independent of mass (CLAUDE.md §11). Slowed down from the
// original 3500ms so the learner can actually follow the arms and wave pattern as they build.
const ANIMATION_DURATION_MS = 7000

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

// A purely illustrative traveling-wave pattern drawn alongside each straight arm line, so the
// learner sees a wave shape (not just the line's thickness/glow) riding along the arm. The
// perpendicular offset and its traveling phase are derived from the same strain/frequency values
// already shown in the live readout — not a new or separately simulated quantity.
const WAVE_CYCLES_PER_ARM = 5
const WAVE_SEGMENTS = 48

function armWavePoints(
  axis: 'x' | 'y',
  start: { x: number; y: number },
  end: { x: number; y: number },
  amplitudePixels: number,
  phase: number
) {
  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i <= WAVE_SEGMENTS; i += 1) {
    const t = i / WAVE_SEGMENTS
    const baseX = start.x + (end.x - start.x) * t
    const baseY = start.y + (end.y - start.y) * t
    const offset = amplitudePixels * Math.sin(2 * Math.PI * (t * WAVE_CYCLES_PER_ARM - phase))
    points.push(axis === 'x' ? { x: baseX, y: baseY + offset } : { x: baseX + offset, y: baseY })
  }
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
}

// This experiment's one prediction question, per its specification's "Prediction Activity".
type LouderChoice = 'black-holes' | 'neutron-stars' | 'same'
const louderChoices: Array<{ value: LouderChoice; label: string }> = [
  { value: 'black-holes', label: 'The black holes' },
  { value: 'neutron-stars', label: 'The neutron stars' },
  { value: 'same', label: 'They would be the same' },
]

// Guaranteed by the preset mapping itself (see gravitationalWaveRealEventsExperiment.ts and its
// tests): GW150914's much larger toyMass always produces a louder, faster-rising chirp.
const ACTUAL_LOUDER: LouderChoice = 'black-holes'

interface RunSummary {
  mass: number
  presetId: 'gw150914' | 'gw170817' | null
  cutoffTime: number
  finalFrequency: number
  finalAmplitude: number
  totalOrbitalEnergy: number
  finalRemainingOrbitalEnergy: number
  finalRadiatedEnergy: number
}

// Basic UI, the learner prediction interaction, the results panel, and the AI tutor, reusing
// Experiments 2 and 3's already-tested physics directly.
export function GravitationalWaveRealEventsExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalWaveRealEventsExperimentProps) {
  const [mass, setMass] = useState(REAL_EVENT_PRESETS[0].toyMass)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null)
  const [runCount, setRunCount] = useState(0)
  // Keyed by preset id, so the results panel can compare the two once both have been run.
  const [presetRunSummaries, setPresetRunSummaries] = useState<Partial<Record<'gw150914' | 'gw170817', RunSummary>>>(
    {}
  )

  const [louderPrediction, setLouderPrediction] = useState<LouderChoice | null>(null)
  const [submittedLouderPrediction, setSubmittedLouderPrediction] = useState<LouderChoice | null>(null)

  const hasPrediction = louderPrediction !== null
  const hasSubmittedPrediction = submittedLouderPrediction !== null

  const isRunning = status === 'running'
  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const displayedTime = isRunning || status === 'complete' ? Math.min(simulatedTime, cutoffTime) : 0
  const chirpState = chirpStateAt(displayedTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const energyState = orbitalEnergyStateAt(displayedTime, mass)

  const activePreset = REAL_EVENT_PRESETS.find((preset) => preset.toyMass === mass) ?? null

  const handleRun = () => {
    if (!hasPrediction || isRunning) return
    if (!hasSubmittedPrediction) {
      setSubmittedLouderPrediction(louderPrediction)
    }
    setRunSummary(null)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Matches Experiment 3's own "Change predictions" control: re-opens the question for editing
  // without resetting the chosen mass.
  const handleChangePrediction = () => {
    setSubmittedLouderPrediction(null)
    setStatus('idle')
    setRunSummary(null)
  }

  // Moving the slider after a run has completed must not leave that run's stale readout and
  // Results panel on screen — matching Experiment 3's own precedent.
  const handleMassChange = (value: number) => {
    setMass(value)
    if (status === 'complete') {
      setStatus('idle')
      setRunSummary(null)
    }
  }

  useEffect(() => {
    if (status !== 'running') return

    const runMass = mass
    const runPresetId = REAL_EVENT_PRESETS.find((preset) => preset.toyMass === runMass)?.id ?? null
    const { cutoffTime: totalSimulatedTime } = chirpRunFor(runMass, BASE_FREQUENCY, BASE_AMPLITUDE)
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setSimulatedTime(progress * totalSimulatedTime)

      if (progress >= 1) {
        const finalChirpState = chirpStateAt(totalSimulatedTime, runMass, BASE_FREQUENCY, BASE_AMPLITUDE)
        const finalEnergyState = orbitalEnergyStateAt(totalSimulatedTime, runMass)
        const summary: RunSummary = {
          mass: runMass,
          presetId: runPresetId,
          cutoffTime: totalSimulatedTime,
          finalFrequency: finalChirpState.frequency,
          finalAmplitude: finalChirpState.amplitude,
          totalOrbitalEnergy: finalEnergyState.totalOrbitalEnergy,
          finalRemainingOrbitalEnergy: finalEnergyState.remainingOrbitalEnergy,
          finalRadiatedEnergy: finalEnergyState.radiatedEnergy,
        }
        setRunSummary(summary)
        if (runPresetId) {
          setPresetRunSummaries((previous) => ({ ...previous, [runPresetId]: summary }))
        }
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, mass, onComplete])

  const xEnd = armEndPoint('x', chirpState.armXLength)
  const yEnd = armEndPoint('y', chirpState.armYLength)

  // Purely visual intensity, derived directly from the same chirpState values already shown in
  // the live readout — not a new or separate quantity, and never changes the physical result.
  const isActive = isRunning || status === 'complete'
  const strainMagnitude = Math.abs(chirpState.strain)
  const progressFraction = cutoffTime > 0 ? Math.min(1, displayedTime / cutoffTime) : 0
  const armStrokeWidth = isActive ? Math.min(11, 2 + strainMagnitude * 22) : 1.5
  const pulseRadius = isActive ? Math.min(15, 4 + strainMagnitude * 26) : 4
  const armGlowOpacity = isActive ? Math.min(0.85, strainMagnitude * 7) : 0
  const armGlowBlur = 2 + strainMagnitude * 6

  // The traveling wave pattern drawn along each arm (see armWavePoints above): amplitude grows
  // with strain, and the phase advances with simulated time and frequency so it visibly travels
  // along the arm as the run progresses, rather than just sitting still. The two arms' amplitudes
  // are given opposite signs, matching gravitationalWaveExperiment.ts's own
  // armXLength = BASE*(1 + strain/2) / armYLength = BASE*(1 - strain/2) relationship — when one
  // arm is stretching the other is squeezing, so their wave patterns must visibly differ, not
  // match.
  const waveAmplitudeMagnitude = isActive ? Math.min(14, strainMagnitude * 160) : 0
  const waveSign = chirpState.strain < 0 ? -1 : 1
  const wavePhase = displayedTime * chirpState.frequency * 2
  const xWavePoints = armWavePoints('x', CORNER, xEnd, waveAmplitudeMagnitude * waveSign, wavePhase)
  const yWavePoints = armWavePoints('y', CORNER, yEnd, -waveAmplitudeMagnitude * waveSign, wavePhase)

  // A depiction of the orbiting pair that drives the wave, placed at the center of the detector
  // box (inside the "L" the two arms trace out, so it doesn't overlap either arm line). Orbit
  // angle and separation are derived from the same frequency/progress values already shown in
  // the live readout (illustrative sync, not a separately simulated orbit). Separation shrinks
  // all the way to the two objects visually overlapping into one by the run's final moment —
  // matching what the chirp is building toward — while the physics model itself still stops
  // short of simulating the merger (CLAUDE.md §8; see "What we assume").
  const sourceCenter = { x: 150, y: 170 }
  const orbitRadius = isActive ? Math.max(0, 34 - progressFraction * 34) : 34
  const orbitAngle = 2 * Math.PI * chirpState.frequency * displayedTime
  const sourceDot1 = {
    x: sourceCenter.x + orbitRadius * Math.cos(orbitAngle),
    y: sourceCenter.y + orbitRadius * Math.sin(orbitAngle),
  }
  const sourceDot2 = {
    x: sourceCenter.x - orbitRadius * Math.cos(orbitAngle),
    y: sourceCenter.y - orbitRadius * Math.sin(orbitAngle),
  }
  const sourceIsBlackHoles = activePreset?.id === 'gw150914'
  const sourceIsNeutronStars = activePreset?.id === 'gw170817'
  const sourceDotColor = sourceIsBlackHoles ? '#111827' : sourceIsNeutronStars ? '#f0fdff' : '#c4b5fd'
  const sourceDotGlow = sourceIsBlackHoles ? '#f59e0b' : sourceIsNeutronStars ? '#a5f3fc' : '#67e8f9'
  const sourceDotRadius = sourceIsBlackHoles ? 13 : 10

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Comparing Two Real Events</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The last two experiments built a complete toy model of an
            inspiraling pair — a chirp that rises in pitch and loudness, and the orbital energy loss
            that causes it — all driven by a mass slider you picked yourself. But real
            gravitational-wave detections come from real, named events, with real masses already
            measured by scientists. What does the same model look like with those real masses
            plugged in — and does comparing two real events side by side show something the
            abstract slider alone didn't?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What are black holes and neutron stars?</strong> Both are what's left behind
            when a massive star runs out of fuel and collapses under its own gravity. In a{' '}
            <strong>neutron star</strong> (the crushed-down core of a star roughly 8 to 20 times
            the Sun's mass), the collapse halts because its particles push back against being
            squeezed any closer together — a real effect called{' '}
            <strong>neutron degeneracy pressure</strong>. It's the same basic kind of push-back
            that keeps your hand from passing through a solid wall (the atoms in the wall resist
            being squeezed into the atoms in your hand), just vastly stronger, since it's holding
            up against the crushing weight of an entire collapsing star. What's left is a ball only
            about as wide as a city, so dense that a teaspoon of it would weigh billions of tons on
            Earth. A <strong>black hole</strong> forms when the collapsing star is heavier still —
            heavy enough that its weight overwhelms even that particle push-back, so nothing is
            left to stop the collapse at all. Squeeze something as heavy as our Sun down that far
            and it would end up only a few kilometers wide; GW150914's black holes, each dozens of
            times heavier than the Sun, were squeezed into a region only around a hundred
            kilometers across — small enough to fit between two neighboring cities, yet packing as
            much mass as dozens of Suns. That's what "not even light can escape" means: gravity
            that concentrated bends spacetime so sharply nothing can climb back out.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll run the exact same chirp animation as the last two
            experiments, but now choosing between two real, named detections instead of an
            arbitrary mass: GW150914 (2015, the first gravitational wave ever detected, from two
            merging black holes) and GW170817 (2017, from two colliding neutron stars). The mass
            slider still works exactly as before, so you can also try any mass in between.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Predict which event — the black holes or the neutron
            stars — you think produced the louder, faster-rising chirp, then run both and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Watch the two arms in the diagram below: one
            stretches while the other squeezes, swapping back and forth faster and more
            dramatically as the run goes on. Keep an eye on the live numbers above the diagram too —
            frequency and amplitude climbing, and the orbital energy draining away — the same
            pattern you saw in the last two experiments, just on a different timescale for each
            event.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A new term: multi-messenger astronomy.</strong> GW170817 wasn't only detected as
            a gravitational wave — telescopes around the world also spotted a burst of light from
            the same collision. Watching one cosmic event in more than one way like this —
            gravitational waves and light together — is called "multi-messenger astronomy." You'll
            see why GW150914, from two black holes, didn't have this same light counterpart.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything the last two experiments assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, no real detection hardware is modeled,
              the merger itself isn't modeled, and the chirp/energy formulas are simplified
              stand-ins, not the real post-Newtonian equations.
            </li>
            <li>
              The two presets are a simplified stand-in for GW150914 and GW170817, not a faithful
              reconstruction of either real signal — only the direction (bigger mass means louder,
              faster, shorter) is preserved.
            </li>
            <li>
              The mapping from each event's real mass onto this project's made-up mass scale is a
              presentation choice, not a physical calculation.
            </li>
            <li>
              The light-counterpart fact for GW170817 is a real, independently-reported fact, not
              something this experiment's physics model computes.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            GW150914 came from two black holes, each tens of times heavier than our Sun. GW170817
            came from two neutron stars, each only a little heavier than our Sun. Which one do you
            think produced the louder, faster-rising chirp?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {louderChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setLouderPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${louderPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {louderPrediction || submittedLouderPrediction
              ? `Your prediction: ${
                  louderChoices.find((c) => c.value === (louderPrediction ?? submittedLouderPrediction))!.label
                }`
              : 'Choose an option to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your prediction is locked in above. You can still try as many different masses as you
              like below — move the slider, then click "Run" again. Or, change your prediction and
              start over:
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
              Change prediction
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          {REAL_EVENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleMassChange(preset.toyMass)}
              disabled={!hasPrediction || isRunning}
              className={`toggle-button${activePreset?.id === preset.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {preset.label}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {activePreset ? activePreset.realDescription : 'Custom mass (not tied to either named event).'}
          </p>
        </div>

        <label htmlFor="real-events-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mass: {mass.toFixed(1)}
        </label>
        <input
          id="real-events-mass"
          type="range"
          min={0.2}
          max={6}
          step={0.1}
          value={mass}
          disabled={!hasPrediction || isRunning}
          onChange={(event) => handleMassChange(Number(event.target.value))}
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
            Answer the prediction above to try the controls.
          </p>
        )}

        {(isRunning || status === 'complete') && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem' }}>
            Frequency: {chirpState.frequency.toFixed(3)} &nbsp;|&nbsp; Amplitude:{' '}
            {chirpState.amplitude.toFixed(3)} &nbsp;|&nbsp; Strain: {chirpState.strain.toFixed(3)}
            <br />
            Remaining orbital energy: {energyState.remainingOrbitalEnergy.toFixed(3)} &nbsp;|&nbsp;
            Radiated energy: {energyState.radiatedEnergy.toFixed(3)} (energy units, not real joules)
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
            boxShadow: isActive ? `0 0 ${12 + progressFraction * 36}px rgba(124, 58, 237, ${0.25 + progressFraction * 0.55})` : 'none',
            transition: 'box-shadow 80ms linear',
          }}
        >
          <defs>
            <filter id="real-events-arm-glow" x="-75%" y="-75%" width="250%" height="250%">
              <feGaussianBlur stdDeviation={armGlowBlur} />
            </filter>
          </defs>

          {/* Blurred glow duplicates, intensity and width tied directly to the current strain
              magnitude — purely a presentation effect, computed from the same chirpState the
              sharp lines below use, not a separate or invented quantity. */}
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={xEnd.x}
            y2={xEnd.y}
            stroke="#a78bfa"
            strokeWidth={armStrokeWidth + 6}
            strokeLinecap="round"
            opacity={armGlowOpacity}
            filter="url(#real-events-arm-glow)"
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
            filter="url(#real-events-arm-glow)"
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

          {/* The traveling wave pattern riding along each arm, visible once a run is active. */}
          <polyline points={xWavePoints} fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />
          <polyline points={yWavePoints} fill="none" stroke="#67e8f9" strokeWidth={1.5} opacity={isActive ? 0.85 : 0} />

          {/* Direct labels on the two arms, so the learner doesn't have to rely on the legend below. */}
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

          {/* The source: the two orbiting objects driving the wave, shown at the center of the
              detector box. Their spin and separation sync to the same frequency/progress already
              driving the arms above, shrinking all the way to visually overlapping as one by the
              run's final moment. */}
          <line
            x1={sourceDot1.x}
            y1={sourceDot1.y}
            x2={sourceDot2.x}
            y2={sourceDot2.y}
            stroke={sourceDotGlow}
            strokeWidth={1}
            opacity={0.5}
          />
          <circle
            cx={sourceDot1.x}
            cy={sourceDot1.y}
            r={sourceDotRadius + 7}
            fill={sourceDotGlow}
            opacity={isActive ? Math.min(0.65, 0.15 + strainMagnitude * 3) : 0.25}
          />
          <circle
            cx={sourceDot2.x}
            cy={sourceDot2.y}
            r={sourceDotRadius + 7}
            fill={sourceDotGlow}
            opacity={isActive ? Math.min(0.65, 0.15 + strainMagnitude * 3) : 0.25}
          />
          <circle cx={sourceDot1.x} cy={sourceDot1.y} r={sourceDotRadius} fill={sourceDotColor} />
          <circle cx={sourceDot2.x} cy={sourceDot2.y} r={sourceDotRadius} fill={sourceDotColor} />
          <text x={sourceCenter.x} y={sourceCenter.y - 46} fill="#9ca3af" fontSize="10" textAnchor="middle">
            the source
          </text>
        </svg>
        {isActive && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>■</span> Arm X and{' '}
              <span style={{ color: '#67e8f9' }}>■</span> Arm Y are the detector's two arms. The
              wavy line on each one pictures its <strong>strain</strong> — the same "Strain"
              number shown above — how much that arm's length is being stretched or squeezed as
              the wave passes through it.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                One arm stretches while the other squeezes, then they swap back and forth, over
                and over — the same squeeze-and-stretch pattern Experiment 1 showed you. That
                opposite motion is a real gravitational wave's signature, and it's why detectors
                are built with two perpendicular arms instead of one: a single arm's length
                changing on its own could just be ordinary noise.
              </li>
              <li>
                At the center, "the source" is the orbiting pair causing the wave. As it loses
                energy, it spirals closer together and spins faster — which is exactly why the
                pulses you see grow bigger and faster as the run goes on.
              </li>
              <li>
                By the end, the two orbiting objects merge into one picture. This part is
                illustrative only: their spin here is just drawn to match the frequency and
                amplitude numbers already shown above, not a separate simulation, and the actual
                moment of merger isn't modeled by the physics here.
              </li>
            </ul>
          </div>
        )}

        {status === 'complete' && runSummary && submittedLouderPrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              {runSummary.presetId
                ? `You ran ${REAL_EVENT_PRESETS.find((preset) => preset.id === runSummary.presetId)!.label}, at mass ${runSummary.mass.toFixed(1)}.`
                : `You ran a custom mass of ${runSummary.mass.toFixed(1)}, not tied to either named event.`}{' '}
              The chirp reached its idealized final moment at simulated time{' '}
              <strong>{runSummary.cutoffTime.toFixed(3)}</strong>, with
              a final frequency of <strong>{runSummary.finalFrequency.toFixed(3)}</strong> and a final
              amplitude of <strong>{runSummary.finalAmplitude.toFixed(3)}</strong>. Of the pair's{' '}
              <strong>{runSummary.totalOrbitalEnergy.toFixed(3)}</strong> energy units of orbital
              energy, <strong>{runSummary.finalRadiatedEnergy.toFixed(3)}</strong> had radiated away
              as a gravitational wave by that final moment.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your prediction:</strong>{' '}
              {louderChoices.find((c) => c.value === submittedLouderPrediction)!.label}. In fact:{' '}
              {louderChoices.find((c) => c.value === ACTUAL_LOUDER)!.label.toLowerCase()} — the much
              larger total mass of two black holes means more orbital energy to radiate, on a
              shorter timescale.
            </p>
            {runSummary.presetId && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {runSummary.presetId === 'gw170817'
                  ? 'GW170817 was also seen in light — a gamma-ray burst and a glowing afterglow — because neutron stars have surfaces and material that can radiate light when they collide.'
                  : 'GW150914 was not seen in light: merging black holes have no surface or material to radiate it.'}
              </p>
            )}
            {presetRunSummaries.gw150914 && presetRunSummaries.gw170817 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Comparing your two runs:</strong> GW150914 reached a louder final amplitude (
                {presetRunSummaries.gw150914.finalAmplitude.toFixed(3)} vs.{' '}
                {presetRunSummaries.gw170817.finalAmplitude.toFixed(3)}) and a shorter run time (
                {presetRunSummaries.gw150914.cutoffTime.toFixed(3)} vs.{' '}
                {presetRunSummaries.gw170817.cutoffTime.toFixed(3)}) than GW170817 — the same mass
                relationship from the last two experiments, now anchored to these two real events.
              </p>
            )}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              This toy model is a simplified stand-in, not a faithful reconstruction of either real
              signal.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedLouderPrediction && (
        <GravitationalWaveRealEventsTutor
          key={runCount}
          louderPrediction={submittedLouderPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
