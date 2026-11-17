import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  bendDegrees,
  runLightNearBlackHoleExperiment,
  runPartOne,
} from '../physics/lightNearBlackHoleExperiment'
import type { BendChoice, CaptureChoice, JustOutsideChoice, LightNearBlackHoleResult } from '../physics/lightNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  BlackHoleOptionsNote,
  GuessNotes,
  LightNearBlackHoleIntro,
  LightNearBlackHoleLinks,
  PART_TWO_AIM_PRESETS,
  PartTwoGuide,
  lightNearBlackHoleWordsEntries,
} from './LightNearBlackHoleIntro'
import {
  BEND_CHOICES,
  BendGraph,
  CAPTURE_CHOICES,
  CRITICAL_AIM_TEXT,
  GraphCaption,
  JUST_OUTSIDE_CHOICES,
  LightPanel,
  PanelsCaption,
  RUN_PLAYBACK_SECONDS,
  bendLabel,
  captureLabel,
  formatDistance,
  formatMass,
  formatRadii,
  justOutsideLabel,
} from './LightNearBlackHolePictures'
import { LightNearBlackHoleResults } from './LightNearBlackHoleResults'
import { LightNearBlackHoleTutor } from './LightNearBlackHoleTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface LightNearBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = RUN_PLAYBACK_SECONDS * 1000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_AIM = 5

type RunStatus = 'idle' | 'running' | 'complete'

// One run of a beam: idle, running (progress 0 to 1 over a fixed time), complete.
function useBeamRun(onDone: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [progress, setProgress] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId: number
    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        onDoneRef.current()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status])

  return {
    status,
    progress,
    start: () => {
      setStatus('running')
      setProgress(0)
    },
    reset: () => {
      setStatus('idle')
      setProgress(0)
    },
  }
}

export function LightNearBlackHoleExperiment({ onComplete, onTutorComplete }: LightNearBlackHoleExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [bendGuess, setBendGuess] = useState<BendChoice | null>(null)
  const [captureGuess, setCaptureGuess] = useState<CaptureChoice | null>(null)
  const [justOutsideGuess, setJustOutsideGuess] = useState<JustOutsideChoice | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = bendGuess !== null && captureGuess !== null && justOutsideGuess !== null

  // ---- Part 1: the 10-Sun black hole, a beam at 5 horizon radii and one at 2.6, played together by one Run ----
  const partOne = useMemo(() => runPartOne(), [])
  const run1 = useBeamRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own black hole and aim ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [aim, setAim] = useState(DEFAULT_AIM)
  const [lastPartTwo, setLastPartTwo] = useState<LightNearBlackHoleResult | null>(null)
  const result2 = useMemo(() => runLightNearBlackHoleExperiment(presetId, aim), [presetId, aim])
  const run2 = useBeamRun(() => {
    setLastPartTwo(runLightNearBlackHoleExperiment(presetId, aim))
    onComplete?.()
  })
  const isRunning = run1.status === 'running' || run2.status === 'running'

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    setLocked(true)
    run1.start()
  }
  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    run2.reset()
  }
  const handleAimChange = (value: number) => {
    setAim(value)
    run2.reset()
  }
  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setBendGuess(null)
    setCaptureGuess(null)
    setJustOutsideGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setAim(DEFAULT_AIM)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = bendGuess !== null || captureGuess !== null || justOutsideGuess !== null
  const startOverDisabled = (!hasAnyGuess && !locked) || isRunning

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / aim)) < 1e-9

  const guessButtons = <T extends string>(choices: Array<{ value: T; label: string }>, selected: T | null, onSelect: (value: T) => void) => (
    <div style={{ marginBottom: '0.5rem' }}>
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onSelect(choice.value)}
          disabled={locked || isRunning}
          className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )

  const outcomeSoFar = run2.status === 'idle' ? '—' : run2.status === 'running' ? 'on its way' : result2.path.outcome === 'captured' ? 'captured' : 'escaped'
  const showOwnPictures = run2.status !== 'idle' || lastPartTwo !== null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 4: Light Near a Black Hole: Can Light Be Trapped?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <LightNearBlackHoleIntro />
        <ReferencePanel entries={lightNearBlackHoleWordsEntries(part1Done)} />
        <LightNearBlackHoleLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch two beams of light pass a black hole. The black hole is the 10-Sun one from Black Holes 1. One run shows a beam aimed to pass at 5 horizon radii and one aimed only a tiny bit farther out than the capture distance, side by side, and then a graph of the bend against the
          aim. The real pictures and tables do not change with your guesses. After the run, your guesses are drawn on the real pictures in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Question 1 is about a beam aimed at 5 horizon radii, question 2 is about how close light must be aimed to be captured, and question 3 is about a beam aimed only a little farther out than that. Choose one answer for each. A guess is what is wanted:
            nothing is marked, and it is fine to be unsure. You can change an answer until you press Run. After that your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A beam of light is aimed to pass a black hole at 5 horizon radii from its center, well outside the edge. What happens to its path?
          </p>
          <GuessNotes n={1} />
          {guessButtons(BEND_CHOICES, bendGuess, setBendGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>How close to a black hole's center must light be aimed to be captured?</p>
          <GuessNotes n={2} />
          {guessButtons(CAPTURE_CHOICES, captureGuess, setCaptureGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Light is aimed only a tiny bit farther out than the capture distance. What happens?</p>
          <GuessNotes n={3} />
          {guessButtons(JUST_OUTSIDE_CHOICES, justOutsideGuess, setJustOutsideGuess)}

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${bendLabel(bendGuess!)}; ${captureLabel(captureGuess!)}; ${justOutsideLabel(justOutsideGuess!)}.`
              : 'Answer all three questions to run.'}
          </p>
          {locked && <p style={smallNote}>Your prediction is locked while you try other settings. To change it, press Start over.</p>}
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllGuesses || isRunning || part1Done}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {run1.status === 'running' ? 'Running...' : part1Done ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>

        <Block>
          {run1.status === 'idle' ? (
            <p style={{ ...smallNote, fontWeight: 'bold' }}>
              Pictures 1 and 2 appear here when you press Run. They show a black hole of 10 Suns and two beams of light passing it, one aimed at 5 horizon radii and one aimed just outside the capture distance, and then a graph of the bend against the aim.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: two beams of light passing the 10-Sun black hole</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <LightPanel
                    path={partOne.five.path}
                    aim={partOne.five.aimInHorizonRadii}
                    progress={run1.progress}
                    showRings={part1Done}
                    heading="Beam aimed at 5 horizon radii"
                    outcomeGuess={part1Done && bendGuess ? { kind: 'bend', guess: bendGuess } : null}
                    captureGuess={part1Done ? captureGuess : null}
                  />
                </div>
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <LightPanel
                    path={partOne.justOutside.path}
                    aim={partOne.justOutside.aimInHorizonRadii}
                    progress={run1.progress}
                    showRings={part1Done}
                    heading="Beam aimed at 2.6 horizon radii"
                    outcomeGuess={part1Done && justOutsideGuess ? { kind: 'justOutside', guess: justOutsideGuess } : null}
                    captureGuess={part1Done ? captureGuess : null}
                  />
                </div>
              </div>
              <WhereFrom>
                <strong>Calculated here:</strong> both paths, by stepping the equation for light in the exact theory of gravity in small, equal angles (720 steps per turn); the critical aim and the circle where light can circle, from formulas given by general relativity for a black hole that
                does not spin and has no electric charge; the simple formula’s value, from Gravity Experiment 8. <strong>Measured:</strong> nothing in this picture. <strong>Imagined for the question:</strong> the thin beam of light and its aim. The white marks, once they appear, are only your guesses.
              </WhereFrom>
              <PanelsCaption complete={part1Done} />

              <BendGraph
                beams={[partOne.five, partOne.justOutside].map((r) => ({
                  aim: r.aimInHorizonRadii,
                  label: `aim ${r.aimInHorizonRadii}`,
                  outcome: r.path.outcome,
                  exactDegrees: bendDegrees(r.path),
                }))}
                showCritical={part1Done}
                guesses={part1Done ? { bend: bendGuess, capture: captureGuess, justOutside: justOutsideGuess } : null}
              />
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.5rem', marginBottom: 0 }}>Picture 2: the total bend against the aim</p>
              <WhereFrom>
                <strong>Calculated here:</strong> both curves (the exact curve from the same calculation as Picture 1, at 160 aims; the simple formula from Gravity Experiment 8). <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the thin beam. The white line and
                circles, once they appear, are only your guesses.
              </WhereFrom>
              <GraphCaption complete={part1Done} />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The beams are running. Part 2 (your own black hole and aim), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole and aim), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && bendGuess && captureGuess && justOutsideGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the aim, run a beam as often as you like, and compare. The guesses you made do not change these drawings, but your choices do.
            </PartHeader>

            <PartTwoGuide />

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>1. Choose a black hole:</strong>
              </p>
              {BLACK_HOLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id)}
                  disabled={isRunning}
                  className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {p.label}
                </button>
              ))}
              <BlackHoleOptionsNote />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>2. Aim a beam of light so that, if gravity did nothing, it would pass this far from the black hole's center:</strong>
              </p>
              {PART_TWO_AIM_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleAimChange(d)}
                  disabled={isRunning}
                  className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {d === MAX_AIM_IN_HORIZON_RADII ? '20 (far)' : d}
                </button>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor="light-near-black-hole-aim" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Aim: {formatRadii(aim)} horizon radii ({formatDistance(result2.aimKm)})
                </label>
                <input
                  id="light-near-black-hole-aim"
                  type="range"
                  min={Math.log10(MIN_AIM_IN_HORIZON_RADII)}
                  max={Math.log10(MAX_AIM_IN_HORIZON_RADII)}
                  step="any"
                  value={Math.log10(aim)}
                  disabled={isRunning}
                  onChange={(event) => handleAimChange(Math.min(Math.max(10 ** Number(event.target.value), MIN_AIM_IN_HORIZON_RADII), MAX_AIM_IN_HORIZON_RADII))}
                  style={{ width: '100%' }}
                />
                <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                  The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon radius is the size of the black hole's edge. An aim of 1 means aimed at the horizon's edge.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>3. Run it:</strong>
            </p>
            <button type="button" className="action-button" onClick={handleRunPartTwo} disabled={isRunning} style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}>
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings: the pictures show what changes. The black hole you pick changes only the kilometers.
            </p>

            <div
              style={{
                marginTop: '1rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '6px',
              }}
            >
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>Your settings</strong>
              </p>
              <p style={{ margin: 0 }}>
                Black hole: {result2.preset.label}, {formatMass(result2.preset.massSolarMasses)}; horizon radius {formatDistance(result2.horizonRadiusKm)}
                <br />
                Aim: {formatRadii(aim)} horizon radii ({formatDistance(result2.aimKm)}); the critical aim is {CRITICAL_AIM_TEXT} horizon radii ({formatDistance(result2.criticalAimKm)}); light can circle at {PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii (
                {formatDistance(result2.photonSphereKm)})
                <br />
                The light: {outcomeSoFar}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Choose a black hole and an aim, then press Run your choice. Pictures 3 and 4, each with its own caption, appear here.</p>
              ) : (
                <>
                  <div style={{ maxWidth: '400px' }}>
                    <LightPanel path={result2.path} aim={aim} progress={run2.progress} showRings heading="The path of your beam" />
                  </div>
                  <WhereFrom>
                    <strong>Calculated here:</strong> the path, in the same way as in Part 1, for your settings. <strong>Measured:</strong> the mass of the black hole you chose: about 4 million Suns for Sagittarius A* and about 6.5 billion Suns for M87* (ESO); the stellar black
                    hole’s 10 Suns is a round, typical size. <strong>Imagined for the question:</strong> the thin beam and its aim.
                  </WhereFrom>
                  <PanelsCaption complete={run2.status === 'complete'} own />

                  <BendGraph
                    beams={[{ aim, label: 'your aim', outcome: result2.path.outcome, exactDegrees: bendDegrees(result2.path) }]}
                    showCritical
                  />
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.5rem', marginBottom: 0 }}>Picture 4: the total bend against the aim, for your beam</p>
                  <WhereFrom>
                    <strong>Calculated here:</strong> both curves, from the same calculation as Picture 3. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the thin beam.
                  </WhereFrom>
                  <GraphCaption complete={run2.status === 'complete'} own />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and the tables never change with them. Tables 1, 2 and 4 do not follow your
              settings; Table 3 follows the black hole and aim you ran in Part 2.
            </PartHeader>
            <LightNearBlackHoleResults bendGuess={bendGuess} captureGuess={captureGuess} justOutsideGuess={justOutsideGuess} partTwo={lastPartTwo} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why. Then it goes through your three guesses one by one, explains the physics step by step with numbers from this page, and ends with
              what to take away. Your answers to the questions are not marked.
            </PartHeader>
            <LightNearBlackHoleTutor key={tutorKey} predictedBend={bendGuess} predictedCapture={captureGuess} predictedJustOutside={justOutsideGuess} onExplained={() => onTutorComplete?.()} />
          </>
        )}
      </div>
    </div>
  )
}
