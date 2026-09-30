import { useEffect, useRef, useState } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { orbitalEnergyStateAt } from '../physics/gravitationalWaveEnergyExperiment'
import { GravitationalWaveEnergyTutor } from './GravitationalWaveEnergyTutor'

interface GravitationalWaveEnergyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Fixed, not learner-facing controls, matching Experiment 2 exactly, so the chirp visualization
// here looks identical to the one the learner already saw there.
const BASE_FREQUENCY = 1
const BASE_AMPLITUDE = 0.03

// Fixed real-world playback duration, independent of mass (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 3500

// Guaranteed by the physics model itself (see gravitationalWaveEnergyExperiment.ts and its
// tests): remaining orbital energy always decreases over the run.
type EnergyChoice = 'increases' | 'decreases' | 'stays-the-same'
const ACTUAL_ENERGY: EnergyChoice = 'decreases'

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

interface EnergyHistoryPoint {
  time: number
  remainingOrbitalEnergy: number
}

interface ArmHistoryPoint {
  time: number
  armXLength: number
  armYLength: number
}

interface RunSummary {
  mass: number
  cutoffTime: number
  totalOrbitalEnergy: number
  finalRemainingOrbitalEnergy: number
  finalRadiatedEnergy: number
}

const GRAPH_WIDTH = 320
const GRAPH_HEIGHT = 140
const GRAPH_PADDING = 8

// Scaled to this run's own starting energy (not the full 0.2–6 mass range), so the line uses
// the graph's full height regardless of which mass the learner picked.
function energyGraphPoint(time: number, energy: number, totalSimulatedTime: number, maxEnergy: number): string {
  const x = GRAPH_PADDING + (time / totalSimulatedTime) * (GRAPH_WIDTH - 2 * GRAPH_PADDING)
  const normalized = energy / maxEnergy
  const y = GRAPH_HEIGHT - GRAPH_PADDING - normalized * (GRAPH_HEIGHT - 2 * GRAPH_PADDING)
  return `${x},${y}`
}

// Covers the full range of arm lengths reachable across the whole mass slider (0.2–6), matching
// Experiment 2's own arm-length graph exactly, so this looks identical to the one the learner
// already saw there (per the specification: shown alongside it, not replacing it).
const ARM_GRAPH_MIN_LENGTH = 0.5
const ARM_GRAPH_MAX_LENGTH = 1.5

function armGraphPoint(time: number, armLength: number, totalSimulatedTime: number): string {
  const x = GRAPH_PADDING + (time / totalSimulatedTime) * (GRAPH_WIDTH - 2 * GRAPH_PADDING)
  const normalized = (armLength - ARM_GRAPH_MIN_LENGTH) / (ARM_GRAPH_MAX_LENGTH - ARM_GRAPH_MIN_LENGTH)
  const y = GRAPH_HEIGHT - GRAPH_PADDING - normalized * (GRAPH_HEIGHT - 2 * GRAPH_PADDING)
  return `${x},${y}`
}

const energyChoices: Array<{ value: EnergyChoice; label: string }> = [
  { value: 'increases', label: 'Increases' },
  { value: 'decreases', label: 'Decreases' },
  { value: 'stays-the-same', label: 'Stays the same' },
]

export function GravitationalWaveEnergyExperiment({ onComplete, onTutorComplete }: GravitationalWaveEnergyExperimentProps) {
  const [mass, setMass] = useState(1)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null)
  const [runCount, setRunCount] = useState(0)
  const [energyHistory, setEnergyHistory] = useState<EnergyHistoryPoint[]>([])
  const [armHistory, setArmHistory] = useState<ArmHistoryPoint[]>([])
  const [runTotalSimulatedTime, setRunTotalSimulatedTime] = useState(0)
  const [runTotalOrbitalEnergy, setRunTotalOrbitalEnergy] = useState(0)

  const [energyPrediction, setEnergyPrediction] = useState<EnergyChoice | null>(null)
  const [submittedEnergyPrediction, setSubmittedEnergyPrediction] = useState<EnergyChoice | null>(null)

  const hasPrediction = energyPrediction !== null
  const hasSubmittedPrediction = submittedEnergyPrediction !== null

  const isRunning = status === 'running'
  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const displayedTime = isRunning || status === 'complete' ? Math.min(simulatedTime, cutoffTime) : 0
  const chirpState = chirpStateAt(displayedTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const energyState = orbitalEnergyStateAt(displayedTime, mass)

  const handleRun = () => {
    if (!hasPrediction || isRunning) return
    if (!hasSubmittedPrediction) {
      setSubmittedEnergyPrediction(energyPrediction)
    }
    setRunSummary(null)
    setEnergyHistory([])
    setArmHistory([])
    setRunTotalSimulatedTime(cutoffTime)
    setRunTotalOrbitalEnergy(orbitalEnergyStateAt(0, mass).totalOrbitalEnergy)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Re-opens the prediction question for editing (keeping the learner's current choice visible)
  // and clears the result/tutor, which are gated on the submitted prediction, without resetting
  // the chosen mass — matching Experiment 2's own "Change predictions" control.
  const handleChangePrediction = () => {
    setSubmittedEnergyPrediction(null)
    setStatus('idle')
    setRunSummary(null)
    setEnergyHistory([])
    setArmHistory([])
  }

  // Moving the slider after a run has completed must not leave that run's stale readout and
  // Results panel on screen — the learner would see numbers before clicking "Run" again.
  const handleMassChange = (value: number) => {
    setMass(value)
    if (status === 'complete') {
      setStatus('idle')
      setRunSummary(null)
      setEnergyHistory([])
      setArmHistory([])
    }
  }

  useEffect(() => {
    if (status !== 'running') return

    const { cutoffTime: totalSimulatedTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      const time = progress * totalSimulatedTime
      setSimulatedTime(time)

      const frameEnergyState = orbitalEnergyStateAt(time, mass)
      setEnergyHistory((previous) => [
        ...previous,
        { time, remainingOrbitalEnergy: frameEnergyState.remainingOrbitalEnergy },
      ])
      const frameChirpState = chirpStateAt(time, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
      setArmHistory((previous) => [
        ...previous,
        { time, armXLength: frameChirpState.armXLength, armYLength: frameChirpState.armYLength },
      ])

      if (progress >= 1) {
        setStatus('complete')
        setRunSummary({
          mass,
          cutoffTime: totalSimulatedTime,
          totalOrbitalEnergy: frameEnergyState.totalOrbitalEnergy,
          finalRemainingOrbitalEnergy: frameEnergyState.remainingOrbitalEnergy,
          finalRadiatedEnergy: frameEnergyState.radiatedEnergy,
        })
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Where the Energy Comes From</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What is energy?</strong> Energy is what lets something make a change happen —
            lift a weight, heat a room, speed something up. It comes in different forms: motion has
            energy, height above the ground has energy, a stretched rubber band has energy. One of
            the most basic rules in physics is that energy is never created or destroyed — it only
            moves from one place to another, or changes from one form into another. When you throw
            a ball, energy moves from your arm's muscles into the ball's motion. Two objects
            orbiting each other have energy too, simply because they're orbiting — their "orbital
            energy."
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How does a wave transmit energy?</strong> Drop a stone in a still pond, and
            ripples spread outward across the water. Watch a leaf floating nearby: as the ripple
            passes under it, the leaf bobs up and down, then settles back — it doesn't get carried
            along with the ripple. No water actually travels from the splash to the leaf. What
            travels is the up-and-down <em>motion itself</em>, handed off from one bit of water to
            the next, all the way out to the leaf. That motion is energy, and the ripple is how the
            splash's energy reaches the leaf without anything physical making the trip. A
            gravitational wave transmits energy the same way, except what ripples outward isn't
            water — it's spacetime itself, alternately stretching and squeezing as the wave passes
            (the same stretching and squeezing Experiment 1 showed). As that ripple spreads out from
            the orbiting pair, it carries away some of their orbital energy, handed off through
            space itself, the same way the pond ripple handed off the splash's energy to the leaf.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            This experiment doesn't model the "leaf" end of that handoff — it just shows the source
            side: the orbiting pair's own energy draining away as the wave carries it off.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The last experiment showed that a bigger mass produces a
            faster-rising, louder chirp, and that the pair orbits faster as it spirals closer
            together. But why does the orbit shrink at all? What makes the two objects get closer
            together in the first place?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> A pendulum swinging in air slowly loses height
            with every swing, because air resistance drains a little energy from it each time.
            Nothing is pulling the pendulum down directly — it loses energy to the air, and that
            loss is what makes it swing lower and lower. An inspiraling pair loses energy in a
            similar way, except what it loses energy to is the gravitational wave itself.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll watch the same chirp as before, but now alongside
            a new readout: the orbital energy remaining in the two objects, over that same run.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Watch what happens to the orbital energy as the chirp builds,
            and see how it connects to why the orbit shrinks.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything the last experiment assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, no real detection hardware is modeled,
              the exact moment the two objects meet isn't modeled, and the mass-to-chirp
              relationship is a simplified stand-in for the real physics.
            </li>
            <li>
              The energy-loss relationship shown here is a separate, explicitly-labeled toy
              formula, not derived from the chirp formula and not the real equations that actually
              govern how a real inspiral radiates energy.
            </li>
            <li>
              Energy is shown in made-up units for this experiment's display, not real joules or
              real solar masses of energy.
            </li>
            <li>
              The mass control reuses the Black Hole experiment's same made-up mass scale, not
              real solar masses.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            As the wave's pitch and loudness rise during the run, what do you think happens to the
            orbital energy of the two objects?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {energyChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setEnergyPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${energyPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {energyPrediction || submittedEnergyPrediction
              ? `Your prediction: ${
                  energyChoices.find((c) => c.value === (energyPrediction ?? submittedEnergyPrediction))!.label
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

        <label htmlFor="energy-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mass: {mass.toFixed(1)}
        </label>
        <input
          id="energy-mass"
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
            Remaining orbital energy: {energyState.remainingOrbitalEnergy.toFixed(3)}{' '}
            &nbsp;|&nbsp; Radiated energy: {energyState.radiatedEnergy.toFixed(3)} (energy units,
            not real joules)
          </p>
        )}

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)', overflow: 'hidden' }}
        >
          <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="currentColor" strokeWidth={1.5} />
          <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={CORNER.x} cy={CORNER.y} r={4} fill="currentColor" />
          <circle cx={xEnd.x} cy={xEnd.y} r={4} fill="currentColor" />
          <circle cx={yEnd.x} cy={yEnd.y} r={4} fill="currentColor" />
        </svg>

        {armHistory.length > 1 && runTotalSimulatedTime > 0 && (
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)' }}
          >
            <polyline
              points={armHistory.map((point) => armGraphPoint(point.time, point.armXLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#7c3aed"
              strokeWidth={1.5}
            />
            <polyline
              points={armHistory.map((point) => armGraphPoint(point.time, point.armYLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#0891b2"
              strokeWidth={1.5}
            />
          </svg>
        )}
        {armHistory.length > 1 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span style={{ color: '#7c3aed' }}>■</span> Arm X length &nbsp;&nbsp;
            <span style={{ color: '#0891b2' }}>■</span> Arm Y length &nbsp;&nbsp; (vs. simulated time,
            same as Experiment 2 — notice the oscillations getting faster and bigger)
          </p>
        )}

        {energyHistory.length > 1 && runTotalSimulatedTime > 0 && runTotalOrbitalEnergy > 0 && (
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)' }}
          >
            <polyline
              points={energyHistory
                .map((point) =>
                  energyGraphPoint(point.time, point.remainingOrbitalEnergy, runTotalSimulatedTime, runTotalOrbitalEnergy)
                )
                .join(' ')}
              fill="none"
              stroke="#92400e"
              strokeWidth={2}
            />
          </svg>
        )}
        {energyHistory.length > 1 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span style={{ color: '#92400e' }}>■</span> Remaining orbital energy vs. simulated
            time. Reading the line left to right: it starts at the pair's full energy budget (top
            left) and falls as the run goes on, ending near-empty (bottom right, at the idealized
            final moment) — that fall is the energy flowing into the gravitational wave. As in
            Experiment 1, the wave itself isn't drawn as a shape; you see it only through its
            effect, the stretching and squeezing of the two detector arms in the diagram above.
          </p>
        )}

        {status === 'complete' && runSummary && submittedEnergyPrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              Mass <strong>{runSummary.mass.toFixed(1)}</strong>. The pair started with{' '}
              <strong>{runSummary.totalOrbitalEnergy.toFixed(3)}</strong> energy units of orbital
              energy. By the run's idealized final moment, at simulated time{' '}
              <strong>{runSummary.cutoffTime.toFixed(3)}</strong>, only{' '}
              <strong>{runSummary.finalRemainingOrbitalEnergy.toFixed(3)}</strong> energy units
              remained — <strong>{runSummary.finalRadiatedEnergy.toFixed(3)}</strong> energy units
              had already radiated away as a gravitational wave — visible here only through the
              stretching and squeezing of the detector arms above, the same effect Experiment 1
              showed.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Your prediction:</strong>{' '}
              {energyChoices.find((c) => c.value === submittedEnergyPrediction)!.label}. In fact:{' '}
              {energyChoices.find((c) => c.value === ACTUAL_ENERGY)!.label.toLowerCase()}.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>A real detection.</strong> LIGO's GW150914 detection (2015) converted roughly
              3 solar masses' worth of energy into gravitational waves in about two-tenths of a
              second — for that brief instant, releasing more power than the combined light of
              every star in the observable universe. The energy scale shown here is a simplified
              stand-in, not the real post-Newtonian energy-flux equations.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedEnergyPrediction && (
        <GravitationalWaveEnergyTutor
          key={runCount}
          energyPrediction={submittedEnergyPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
