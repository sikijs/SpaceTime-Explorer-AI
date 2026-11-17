import { useEffect, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FAR_CLOCK_RUN_SECONDS,
  MAX_DISTANCE_IN_HORIZON_RADII,
  MIN_DISTANCE_IN_HORIZON_RADII,
  clockReadingsAt,
  runPartOne,
  runTimeNearBlackHoleExperiment,
  twoHolesAtTwoRadii,
} from '../physics/timeNearBlackHoleExperiment'
import type {
  ApproximationGuess,
  JustOutsideGuess,
  MassGuess,
  TimeNearBlackHoleResult,
} from '../physics/timeNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  BlackHoleOptionsNote,
  DistanceTable,
  GuessNotes,
  PartTwoGuide,
  TimeNearBlackHoleIntro,
  TimeNearBlackHoleLinks,
  timeNearBlackHoleWordsEntries,
} from './TimeNearBlackHoleIntro'
import {
  APPROXIMATION_CHOICES,
  ClocksPicture,
  FactorPicture,
  JUST_OUTSIDE_CHOICES,
  MASS_CHOICES,
  ClocksCaption,
  FactorCaption,
  ReadingsCaption,
  TwoHolesCaption,
  ReadingsPicture,
  RUN_PLAYBACK_SECONDS,
  TwoHolesPicture,
  approximationLabel,
  formatDistance,
  formatMass,
  formatRadii,
  justOutsideLabel,
  massLabel,
} from './TimeNearBlackHolePictures'
import { TimeNearBlackHoleResults } from './TimeNearBlackHoleResults'
import { TimeNearBlackHoleTutor } from './TimeNearBlackHoleTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface TimeNearBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = RUN_PLAYBACK_SECONDS * 1000

const DISTANCE_PRESETS = [100, 10, 3, 1.5, 1.1, 1.01]
const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_DISTANCE = 10

// How many times heavier the giant black hole (M87*) is than the small one, in millions; from the presets, so that the text and the model
// cannot disagree.
const MASS_RATIO_MILLIONS = Math.round(
  BLACK_HOLE_PRESETS[BLACK_HOLE_PRESETS.length - 1].massSolarMasses / BLACK_HOLE_PRESETS[0].massSolarMasses / 1e6,
)

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the two clocks: idle, running (progress 0 to 1 over a fixed time), complete.
function useClockRun(onDone: () => void) {
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

export function TimeNearBlackHoleExperiment({ onComplete, onTutorComplete }: TimeNearBlackHoleExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [justOutsideGuess, setJustOutsideGuess] = useState<JustOutsideGuess | null>(null)
  const [massGuess, setMassGuess] = useState<MassGuess | null>(null)
  const [approximationGuess, setApproximationGuess] = useState<ApproximationGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = justOutsideGuess !== null && massGuess !== null && approximationGuess !== null

  // ---- Part 1: the 10-Sun black hole with the hovering clock at 1.01 horizon radii ----
  const partOne = runPartOne()
  const run1 = useClockRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'
  const readings1 = clockReadingsAt(partOne, run1.progress * FAR_CLOCK_RUN_SECONDS)
  const holes = twoHolesAtTwoRadii()

  // ---- Part 2: the learner's own black hole and distance ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [distance, setDistance] = useState(DEFAULT_DISTANCE)
  const [lastPartTwo, setLastPartTwo] = useState<TimeNearBlackHoleResult | null>(null)
  const result2 = runTimeNearBlackHoleExperiment(presetId, distance)
  const run2 = useClockRun(() => {
    setLastPartTwo(runTimeNearBlackHoleExperiment(presetId, distance))
    onComplete?.()
  })
  const readings2 = clockReadingsAt(result2, run2.progress * FAR_CLOCK_RUN_SECONDS)
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

  const handleDistanceChange = (value: number) => {
    setDistance(value)
    run2.reset()
  }

  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setJustOutsideGuess(null)
    setMassGuess(null)
    setApproximationGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setDistance(DEFAULT_DISTANCE)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = justOutsideGuess !== null || massGuess !== null || approximationGuess !== null
  const startOverDisabled = (!hasAnyGuess && !locked) || isRunning

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / distance)) < 1e-9
  const logMax = Math.log10(MAX_DISTANCE_IN_HORIZON_RADII)

  const guessButtons = <T extends string>(
    choices: Array<{ value: T; label: string }>,
    selected: T | null,
    onSelect: (value: T) => void,
  ) => (
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 2: Time Near a Black Hole: Does a Clock Ever Stop?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the real tests, the links and the words ===== */}
        <TimeNearBlackHoleIntro />
        <ReferencePanel entries={timeNearBlackHoleWordsEntries(part1Done)} />
        <TimeNearBlackHoleLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch two clocks run side by side. One is far from a black hole; the other hangs close to it. The
          real pictures and tables do not change with your guesses. After the run, your guesses are drawn on the real graphs in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Question 1 is about how big the slowing is, question 2 compares two black holes, and question 3 is about
            the simple formula from the earlier experiments. Choose one answer for each. A guess is what is wanted: nothing is marked, and it is
            fine to be unsure. You can change an answer until you press Run. After that your three guesses are locked, they are drawn on the real
            graphs in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A clock hovers just outside a black hole's horizon, only 1% farther from the center than the horizon is. You watch it from far away.
            How fast does it tick compared with an identical clock next to you?
          </p>
          <GuessNotes n={1} />
          {guessButtons(JUST_OUTSIDE_CHOICES, justOutsideGuess, setJustOutsideGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Two clocks each hover at twice the horizon radius: one near a small black hole (10 Suns), one near a giant one (M87*,{' '}
            {MASS_RATIO_MILLIONS} million times as heavy). Which one ticks more slowly, compared with a clock far away?
          </p>
          <GuessNotes n={2} />
          {guessButtons(MASS_CHOICES, massGuess, setMassGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            In Gravity and Curved Spacetime, Experiments 2 and 9, we used a simple formula for how gravity slows clocks, and it worked well. Will
            that same simple formula still be accurate right next to a black hole's horizon?
          </p>
          <GuessNotes n={3} />
          {guessButtons(APPROXIMATION_CHOICES, approximationGuess, setApproximationGuess)}

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${justOutsideLabel(justOutsideGuess!)}; ${massLabel(massGuess!)}; ${approximationLabel(approximationGuess!)}.`
              : 'Answer all three questions to run.'}
          </p>
          {locked && (
            <p style={smallNote}>Your prediction is locked while you try other settings. To change it, press Start over.</p>
          )}
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
              Pictures 1 to 3 appear here when you press Run. They show a black hole of 10 Suns, a clock hovering very close to its edge, and a
              clock far away.
            </p>
          ) : (
            <>
              <ClocksPicture title="Picture 1" result={partOne} readings={readings1} />
              <WhereFrom>
                <strong>Calculated here:</strong> the two readings and the positions on the ruler, from the same formula as in Picture 2.{' '}
                <strong>Measured:</strong> none. <strong>Imagined for the question:</strong> both clocks, and the hovering clock’s place; no one can hold a
                clock there.
              </WhereFrom>
              <ClocksCaption complete={part1Done} result={partOne} />

              <FactorPicture
                title="Picture 2"
                result={partOne}
                guesses={
                  part1Done && justOutsideGuess && approximationGuess
                    ? { justOutside: justOutsideGuess, approximation: approximationGuess }
                    : null
                }
              />
              <WhereFrom>
                <strong>Calculated here:</strong> the exact line, from the formula √(1 − r_s ÷ r) given by general relativity for a black hole that
                does not spin and has no electric charge. It has been tested by clocks on Earth and by light from a star near our galaxy’s black hole
                (ESO, 2018), but never at a black hole’s horizon. <strong>Calculated here:</strong> the dashed line, the simple formula from Gravity
                and Curved Spacetime, Experiments 2 and 9. <strong>Measured:</strong> none of the lines. <strong>Imagined for the question:</strong>{' '}
                the hovering clock; no one can hold a clock there. The white marks, once they appear, are only your guesses.
              </WhereFrom>
              <FactorCaption complete={part1Done} result={partOne} />

              {part1Done ? (
                <>
                  <TwoHolesPicture
                    small={{ label: holes.small.preset.label, factor: holes.small.factor, distanceKm: holes.small.distanceKm }}
                    giant={{ label: holes.giant.preset.label, factor: holes.giant.factor, distanceKm: holes.giant.distanceKm }}
                    guess={massGuess}
                  />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both bars, from the same formula. <strong>Measured:</strong> the masses, about 6.5 billion
                    Suns for M87* (ESO, 2019); the 10-Sun black hole is a round, typical size for a star that has collapsed, not a particular
                    object. <strong>Imagined for the question:</strong> both clocks. The white rings are only a marker for your guess.
                  </WhereFrom>
                  <TwoHolesCaption twoHoles={holes} />
                </>
              ) : (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>
                  Picture 2b (the same distance around two black holes) appears when the run finishes.
                </p>
              )}

              <ReadingsPicture title="Picture 3" progress={run1.progress} readings={readings1} />
              <WhereFrom>
                <strong>Calculated here:</strong> both clocks’ readings, from the same formula. <strong>Measured:</strong> none.{' '}
                <strong>Imagined for the question:</strong> the two clocks and their run.
              </WhereFrom>
              <ReadingsCaption complete={part1Done} result={partOne} />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The clocks are running. Part 2 (your own black hole and distance), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole and distance), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && justOutsideGuess && massGuess && approximationGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the distance, run the clocks as often as you like, and compare. The guesses you made do not change
              these drawings, but your choices do.
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
                <strong>2. Hold the second clock at rest at this distance from the black hole's center:</strong>
              </p>
              {DISTANCE_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDistanceChange(d)}
                  disabled={isRunning}
                  className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {d === MAX_DISTANCE_IN_HORIZON_RADII ? '100 (far)' : d}
                </button>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor="time-near-black-hole-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Distance: {formatRadii(distance)} horizon radii ({formatDistance(result2.distanceKm)})
                </label>
                <input
                  id="time-near-black-hole-distance"
                  type="range"
                  min={Math.log10(MIN_DISTANCE_IN_HORIZON_RADII)}
                  max={logMax}
                  step="any"
                  value={Math.log10(distance)}
                  disabled={isRunning}
                  onChange={(event) =>
                    handleDistanceChange(
                      Math.min(Math.max(10 ** Number(event.target.value), MIN_DISTANCE_IN_HORIZON_RADII), MAX_DISTANCE_IN_HORIZON_RADII),
                    )
                  }
                  style={{ width: '100%' }}
                />
                <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                  The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon radius is the size of the black
                  hole's edge; 1 horizon radius is the edge itself, and the slider stops just short of it, at {MIN_DISTANCE_IN_HORIZON_RADII}.
                </p>
              </div>
              <DistanceTable presetId={presetId} />
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>3. Run it:</strong>
            </p>
            <button
              type="button"
              className="action-button"
              onClick={handleRunPartTwo}
              disabled={isRunning}
              style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}
            >
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings: the pictures
              show what changes.
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
                Hovering clock’s distance: {formatRadii(distance)} horizon radii ({formatDistance(result2.distanceKm)} from the center)
                {run2.status !== 'idle' && (
                  <>
                    <br />
                    Far-away clock: {readings2.far.toFixed(2)} s &nbsp;|&nbsp; Hovering clock: {readings2.hovering.toFixed(2)} s &nbsp;|&nbsp; Slowing
                    factor (hovering rate ÷ far-away rate): {result2.exactFactor.toFixed(4)}
                  </>
                )}
              </p>
            </div>

            <Block>
              {run2.status === 'idle' && lastPartTwo === null ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>
                  Choose a black hole and a distance, then press Run your choice. Pictures 4 to 6, each with its own caption, appear here.
                </p>
              ) : (
                <>
                  <ClocksPicture title="Picture 4" result={result2} readings={readings2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both readings and the positions on the ruler, from the same formula as in Part 1.{' '}
                    <strong>Measured:</strong> the mass of the black hole you chose: about 4 million Suns for Sagittarius A* (ESO, 2018) and about 6.5
                    billion Suns for M87* (ESO, 2019); the stellar black hole’s 10 Suns is a round, typical size. <strong>Imagined for the
                    question:</strong> the hovering clock and the distance you chose.
                  </WhereFrom>
                  <ClocksCaption complete={run2.status === 'complete'} result={result2} own />

                  <FactorPicture title="Picture 5" result={result2} guesses={null} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both lines and the two dots: the exact line from the formula given by general relativity, and the
                    dashed line from the simple formula of Gravity and Curved Spacetime, Experiments 2 and 9. <strong>Measured:</strong> none of the
                    lines. <strong>Imagined for the question:</strong> the hovering clock.
                  </WhereFrom>
                  <FactorCaption complete={run2.status === 'complete'} result={result2} own />

                  <ReadingsPicture title="Picture 6" progress={run2.progress} readings={readings2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both clocks’ readings, from the same formula. <strong>Measured:</strong> none.{' '}
                    <strong>Imagined for the question:</strong> the two clocks and their run.
                  </WhereFrom>
                  <ReadingsCaption complete={run2.status === 'complete'} result={result2} own />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers, why it
              matters and how sure we are of it. Your guesses are shown beside the results, and the tables never change with them. Tables 1, 2, 3 and
              5 are about the real run and real objects; Table 4 follows the black hole and distance you ran in Part 2.
            </PartHeader>
            <TimeNearBlackHoleResults
              partOne={partOne}
              justOutsideGuess={justOutsideGuess}
              massGuess={massGuess}
              approximationGuess={approximationGuess}
              partTwo={lastPartTwo}
            />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why.
              Then it goes through your three guesses one by one, explains the physics step by step with numbers from this page, and ends with what to
              take away. Your answers to the questions are not marked.
            </PartHeader>
            <TimeNearBlackHoleTutor
              key={tutorKey}
              predictedJustOutside={justOutsideGuess}
              predictedMass={massGuess}
              predictedApproximation={approximationGuess}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
