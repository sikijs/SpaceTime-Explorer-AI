import { useEffect, useRef, useState } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { GravitationalWaveChirpTutor } from './GravitationalWaveChirpTutor'

interface GravitationalWaveChirpExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Fixed, not learner-facing controls, per the specification — keeps this experiment's one new
// idea (mass driving the chirp) as the sole focus.
const BASE_FREQUENCY = 1
const BASE_AMPLITUDE = 0.03

// Fixed real-world playback duration, independent of mass (CLAUDE.md §11 — playback speed must
// not change the physical result, only how quickly it's shown).
const ANIMATION_DURATION_MS = 3500

// Guaranteed by the physics model itself (see gravitationalWaveChirpExperiment.ts and its
// tests): frequency and amplitude always increase over the run, and a larger mass always
// reaches its cutoff sooner — so these don't depend on the learner's chosen mass.
const ACTUAL_PITCH: PitchChoice = 'speeds-up'
const ACTUAL_LOUDNESS: LoudnessChoice = 'stronger'
const ACTUAL_TIMING: TimingChoice = 'large-mass'

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

interface HistoryPoint {
  time: number
  armXLength: number
  armYLength: number
}

interface RunSummary {
  mass: number
  cutoffTime: number
  startFrequency: number
  startAmplitude: number
  finalFrequency: number
  finalAmplitude: number
  finalStrain: number
  minArmXLength: number
  maxArmXLength: number
  minArmYLength: number
  maxArmYLength: number
  // Set only when the learner has completed an earlier run with a different mass, so the
  // results panel can compare how much sooner/later this run reached its final moment.
  previousRun: { mass: number; cutoffTime: number } | null
}

const GRAPH_WIDTH = 320
const GRAPH_HEIGHT = 140
const GRAPH_PADDING = 8
// Covers the full range of arm lengths reachable across the whole mass slider (0.2–6).
const GRAPH_MIN_LENGTH = 0.5
const GRAPH_MAX_LENGTH = 1.5

function graphPoint(time: number, armLength: number, totalSimulatedTime: number): string {
  const x = GRAPH_PADDING + (time / totalSimulatedTime) * (GRAPH_WIDTH - 2 * GRAPH_PADDING)
  const normalized = (armLength - GRAPH_MIN_LENGTH) / (GRAPH_MAX_LENGTH - GRAPH_MIN_LENGTH)
  const y = GRAPH_HEIGHT - GRAPH_PADDING - normalized * (GRAPH_HEIGHT - 2 * GRAPH_PADDING)
  return `${x},${y}`
}

type PitchChoice = 'speeds-up' | 'slows-down' | 'stays-the-same'
type LoudnessChoice = 'stronger' | 'weaker' | 'stays-the-same'
type TimingChoice = 'small-mass' | 'large-mass' | 'same-time'

const pitchChoices: Array<{ value: PitchChoice; label: string }> = [
  { value: 'speeds-up', label: 'Speeds up' },
  { value: 'slows-down', label: 'Slows down' },
  { value: 'stays-the-same', label: 'Stays the same' },
]

const loudnessChoices: Array<{ value: LoudnessChoice; label: string }> = [
  { value: 'stronger', label: 'Gets stronger (louder)' },
  { value: 'weaker', label: 'Gets weaker' },
  { value: 'stays-the-same', label: 'Stays the same strength' },
]

const timingChoices: Array<{ value: TimingChoice; label: string }> = [
  { value: 'small-mass', label: 'The small-mass pair' },
  { value: 'large-mass', label: 'The large-mass pair' },
  { value: 'same-time', label: 'They take the same time' },
]

function PredictionQuestion<Choice extends string>({
  prompt,
  choices,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  choices: Array<{ value: Choice; label: string }>
  selected: Choice | null
  submitted: Choice | null
  onSelect: (choice: Choice) => void
  disabled: boolean
}) {
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
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${choices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function GravitationalWaveChirpExperiment({ onComplete, onTutorComplete }: GravitationalWaveChirpExperimentProps) {
  const [mass, setMass] = useState(1)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null)
  const [runCount, setRunCount] = useState(0)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [runTotalSimulatedTime, setRunTotalSimulatedTime] = useState(0)
  const previousRunRef = useRef<{ mass: number; cutoffTime: number } | null>(null)
  const runExtremesRef = useRef({
    minArmXLength: BASE_ARM_LENGTH,
    maxArmXLength: BASE_ARM_LENGTH,
    minArmYLength: BASE_ARM_LENGTH,
    maxArmYLength: BASE_ARM_LENGTH,
  })

  const [pitchPrediction, setPitchPrediction] = useState<PitchChoice | null>(null)
  const [loudnessPrediction, setLoudnessPrediction] = useState<LoudnessChoice | null>(null)
  const [timingPrediction, setTimingPrediction] = useState<TimingChoice | null>(null)
  const [submittedPitchPrediction, setSubmittedPitchPrediction] = useState<PitchChoice | null>(null)
  const [submittedLoudnessPrediction, setSubmittedLoudnessPrediction] = useState<LoudnessChoice | null>(null)
  const [submittedTimingPrediction, setSubmittedTimingPrediction] = useState<TimingChoice | null>(null)

  const hasAllPredictions = pitchPrediction !== null && loudnessPrediction !== null && timingPrediction !== null
  const hasSubmittedPredictions = submittedPitchPrediction !== null

  const isRunning = status === 'running'
  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const displayedTime = isRunning || status === 'complete' ? Math.min(simulatedTime, cutoffTime) : 0
  const state = chirpStateAt(displayedTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE)

  const handleRun = () => {
    if (!hasAllPredictions || isRunning) return
    if (!hasSubmittedPredictions) {
      setSubmittedPitchPrediction(pitchPrediction)
      setSubmittedLoudnessPrediction(loudnessPrediction)
      setSubmittedTimingPrediction(timingPrediction)
    }
    runExtremesRef.current = {
      minArmXLength: BASE_ARM_LENGTH,
      maxArmXLength: BASE_ARM_LENGTH,
      minArmYLength: BASE_ARM_LENGTH,
      maxArmYLength: BASE_ARM_LENGTH,
    }
    setRunSummary(null)
    setHistory([])
    setRunTotalSimulatedTime(cutoffTime)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Re-opens the three prediction questions for editing (keeping the learner's current choices
  // visible) and clears the result/tutor, which are gated on the submitted predictions, without
  // resetting the chosen mass.
  const handleChangePredictions = () => {
    setSubmittedPitchPrediction(null)
    setSubmittedLoudnessPrediction(null)
    setSubmittedTimingPrediction(null)
    setStatus('idle')
    setRunSummary(null)
    setHistory([])
  }

  useEffect(() => {
    if (status !== 'running') return

    const { cutoffTime: totalSimulatedTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
    const startFrequency = BASE_FREQUENCY
    const startAmplitude = BASE_AMPLITUDE * mass
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      const time = progress * totalSimulatedTime
      setSimulatedTime(time)

      const frameState = chirpStateAt(time, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
      setHistory((previous) => [
        ...previous,
        { time, armXLength: frameState.armXLength, armYLength: frameState.armYLength },
      ])
      const extremes = runExtremesRef.current
      extremes.minArmXLength = Math.min(extremes.minArmXLength, frameState.armXLength)
      extremes.maxArmXLength = Math.max(extremes.maxArmXLength, frameState.armXLength)
      extremes.minArmYLength = Math.min(extremes.minArmYLength, frameState.armYLength)
      extremes.maxArmYLength = Math.max(extremes.maxArmYLength, frameState.armYLength)

      if (progress >= 1) {
        setStatus('complete')
        setRunSummary({
          mass,
          cutoffTime: totalSimulatedTime,
          startFrequency,
          startAmplitude,
          finalFrequency: frameState.frequency,
          finalAmplitude: frameState.amplitude,
          finalStrain: frameState.strain,
          ...runExtremesRef.current,
          previousRun: previousRunRef.current && previousRunRef.current.mass !== mass ? previousRunRef.current : null,
        })
        previousRunRef.current = { mass, cutoffTime: totalSimulatedTime }
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, mass, onComplete])

  const xEnd = armEndPoint('x', state.armXLength)
  const yEnd = armEndPoint('y', state.armYLength)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — The Chirp: A Wave That Builds</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The last experiment showed a gravitational wave
            arriving at one steady pitch and loudness. But a real wave, from two massive objects
            spiraling into each other, doesn't stay steady — does it change as the two objects get
            closer together, right up until they meet?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Spin a coin flat on a table and let it wobble
            down to a stop. Listen to the clatter it makes: at first it's slow and quiet, but as
            the coin settles it speeds up and gets louder and louder, right up until the coin
            suddenly goes still. A real gravitational wave from an inspiraling pair rises in
            exactly that same way — just driven by two massive objects spiraling around each
            other, instead of a coin wobbling on a table.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll watch the same L-shaped detector arms as before,
            but now driven by a wave whose pitch and loudness both build as the run goes on —
            scientists call this rising pattern a "chirp" — before stopping cleanly at an
            idealized final moment.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try a small mass and a large mass, and watch how the wave's
            pitch, loudness, and the time it takes to reach its final moment change.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything the last experiment assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, and no real detection hardware is
              modeled.
            </li>
            <li>
              The exact moment the two objects meet, and everything after it, isn't modeled — the
              run simply stops at an idealized cutoff shortly before that point.
            </li>
            <li>
              The relationship between mass and how quickly the wave builds is a simplified,
              explicitly-labeled stand-in for the real physics, not the actual equations that
              govern a real inspiral.
            </li>
            <li>
              The mass control reuses the Black Hole experiment's same made-up mass scale, not
              real solar masses.
            </li>
          </ul>
        </div>

        <PredictionQuestion
          prompt="As the two objects spiral closer together, do you think the wave's pitch (how fast it oscillates) speeds up, slows down, or stays the same?"
          choices={pitchChoices}
          selected={pitchPrediction}
          submitted={submittedPitchPrediction}
          onSelect={setPitchPrediction}
          disabled={hasSubmittedPredictions}
        />
        <PredictionQuestion
          prompt="Do you think the wave also gets stronger (louder) as it approaches the final moment, gets weaker, or stays the same strength?"
          choices={loudnessChoices}
          selected={loudnessPrediction}
          submitted={submittedLoudnessPrediction}
          onSelect={setLoudnessPrediction}
          disabled={hasSubmittedPredictions}
        />
        <PredictionQuestion
          prompt="If you compare a small-mass pair to a large-mass pair, which one reaches its final moment sooner?"
          choices={timingChoices}
          selected={timingPrediction}
          submitted={submittedTimingPrediction}
          onSelect={setTimingPrediction}
          disabled={hasSubmittedPredictions}
        />

        {hasSubmittedPredictions && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different masses as
              you like below — move the slider, then click "Run" again. Or, change your
              predictions and start over:
            </p>
            <button
              type="button"
              onClick={handleChangePredictions}
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

        <label htmlFor="chirp-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Mass: {mass.toFixed(1)}
        </label>
        <input
          id="chirp-mass"
          type="range"
          min={0.2}
          max={6}
          step={0.1}
          value={mass}
          disabled={!hasAllPredictions || isRunning}
          onChange={(event) => setMass(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllPredictions || isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        {!hasAllPredictions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer all three predictions above to try the controls.
          </p>
        )}

        {(isRunning || status === 'complete') && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem' }}>
            Frequency: {state.frequency.toFixed(3)} &nbsp;|&nbsp; Amplitude:{' '}
            {state.amplitude.toFixed(3)} &nbsp;|&nbsp; Strain: {state.strain.toFixed(3)}
            <br />
            Arm X length: {state.armXLength.toFixed(3)} &nbsp;|&nbsp; Arm Y length:{' '}
            {state.armYLength.toFixed(3)}
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

        {history.length > 1 && runTotalSimulatedTime > 0 && (
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)' }}
          >
            <line
              x1={GRAPH_PADDING}
              y1={graphPoint(0, BASE_ARM_LENGTH, runTotalSimulatedTime).split(',')[1]}
              x2={GRAPH_WIDTH - GRAPH_PADDING}
              y2={graphPoint(0, BASE_ARM_LENGTH, runTotalSimulatedTime).split(',')[1]}
              stroke="var(--border-color, #ccc)"
              strokeDasharray="4 4"
            />
            <polyline
              points={history.map((point) => graphPoint(point.time, point.armXLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#7c3aed"
              strokeWidth={1.5}
            />
            <polyline
              points={history.map((point) => graphPoint(point.time, point.armYLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#0891b2"
              strokeWidth={1.5}
            />
          </svg>
        )}
        {history.length > 1 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span style={{ color: '#7c3aed' }}>■</span> Arm X length &nbsp;&nbsp;
            <span style={{ color: '#0891b2' }}>■</span> Arm Y length &nbsp;&nbsp; (vs. simulated time —
            notice the oscillations getting faster and bigger)
          </p>
        )}

        {status === 'complete' &&
          runSummary &&
          submittedPitchPrediction &&
          submittedLoudnessPrediction &&
          submittedTimingPrediction && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>
                Mass <strong>{runSummary.mass.toFixed(1)}</strong>. Frequency rose from{' '}
                <strong>{runSummary.startFrequency.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.finalFrequency.toFixed(3)}</strong>, and amplitude (loudness)
                rose from <strong>{runSummary.startAmplitude.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.finalAmplitude.toFixed(3)}</strong> — about{' '}
                <strong>{(runSummary.finalAmplitude / runSummary.startAmplitude).toFixed(1)}×</strong>{' '}
                louder than it started — before the run stopped at
                its idealized final moment, at simulated time{' '}
                <strong>{runSummary.cutoffTime.toFixed(3)}</strong>, where strain reached{' '}
                <strong>{runSummary.finalStrain.toFixed(3)}</strong>. Strain is just how much the
                arms' length changed, as a fraction of their rest length — a strain of{' '}
                {runSummary.finalStrain.toFixed(3)} means they were off by about{' '}
                {(Math.abs(runSummary.finalStrain) * 50).toFixed(1)}% from normal.
              </p>
              <p>
                Over the whole run, arm X ranged from{' '}
                <strong>{runSummary.minArmXLength.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.maxArmXLength.toFixed(3)}</strong>, and arm Y ranged from{' '}
                <strong>{runSummary.minArmYLength.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.maxArmYLength.toFixed(3)}</strong> (rest length is{' '}
                {BASE_ARM_LENGTH.toFixed(3)}) — always deviating equally and oppositely, by a
                growing amount as the run went on.
              </p>
              {runSummary.previousRun && (
                <p>
                  <strong>Comparing your two runs.</strong>{' '}
                  {runSummary.mass > runSummary.previousRun.mass ? (
                    <>
                      This heavier run (mass {runSummary.mass.toFixed(1)}) reached its final moment
                      after <strong>{runSummary.cutoffTime.toFixed(3)}</strong>, sooner than the
                      earlier, lighter run (mass {runSummary.previousRun.mass.toFixed(1)}), which
                      took <strong>{runSummary.previousRun.cutoffTime.toFixed(3)}</strong>.
                    </>
                  ) : (
                    <>
                      This lighter run (mass {runSummary.mass.toFixed(1)}) reached its final moment
                      after <strong>{runSummary.cutoffTime.toFixed(3)}</strong>, later than the
                      earlier, heavier run (mass {runSummary.previousRun.mass.toFixed(1)}), which
                      took only <strong>{runSummary.previousRun.cutoffTime.toFixed(3)}</strong>.
                    </>
                  )}{' '}
                  Notice that the pitch and loudness still rose by the same multiplier in both
                  runs — mass changes only how long the chirp takes, not the shape of its rise.
                </p>
              )}
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, pitch:</strong>{' '}
                {pitchChoices.find((c) => c.value === submittedPitchPrediction)!.label}. In fact:{' '}
                {pitchChoices.find((c) => c.value === ACTUAL_PITCH)!.label.toLowerCase()}.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, loudness:</strong>{' '}
                {loudnessChoices.find((c) => c.value === submittedLoudnessPrediction)!.label}. In
                fact: {loudnessChoices.find((c) => c.value === ACTUAL_LOUDNESS)!.label.toLowerCase()}.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Your prediction, timing:</strong>{' '}
                {timingChoices.find((c) => c.value === submittedTimingPrediction)!.label}. In fact:{' '}
                {timingChoices.find((c) => c.value === ACTUAL_TIMING)!.label.toLowerCase()}.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>A real chirp.</strong> GW150914, the first gravitational wave LIGO
                detected (2015), rose in frequency from roughly 35 Hz to roughly 250 Hz over about
                two-tenths of a second before the two black holes merged — the same kind of rising
                "whoop" this experiment models in miniature. The exact merger itself isn't shown
                here, and the mass-to-chirp relationship above is a simplified stand-in for the
                real physics, not the actual equations that govern a real inspiral.
              </p>
            </div>
          )}
      </div>

      {status === 'complete' &&
        submittedPitchPrediction &&
        submittedLoudnessPrediction &&
        submittedTimingPrediction && (
          <GravitationalWaveChirpTutor
            key={runCount}
            pitchPrediction={submittedPitchPrediction}
            loudnessPrediction={submittedLoudnessPrediction}
            timingPrediction={submittedTimingPrediction}
            onExplained={onTutorComplete}
          />
        )}
    </div>
  )
}
