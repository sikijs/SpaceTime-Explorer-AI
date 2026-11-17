import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  MAX_START_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  runFallingInExperiment,
  runPartOne,
} from '../physics/fallingInExperiment'
import type { EndChoice, FallingInResult, FarClockChoice, StretchChoice } from '../physics/fallingInExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  BlackHoleOptionsNote,
  FallingInIntro,
  FallingInLinks,
  GuessNotes,
  PartTwoGuide,
  fallingInWordsEntries,
} from './FallingInIntro'
import {
  END_CHOICES,
  FAR_CLOCK_CHOICES,
  FallCaption,
  FallPanel,
  RUN_PLAYBACK_SECONDS,
  START_PRESETS,
  STRETCH_CHOICES,
  StretchCaption,
  StretchGraph,
  TimeCaption,
  TimeGraph,
  endLabel,
  fallScale,
  farClockLabel,
  formatDistance,
  formatMass,
  formatSeconds,
  stateAt,
  stretchLabel,
} from './FallingInPictures'
import { FallingInResults } from './FallingInResults'
import { FallingInTutor } from './FallingInTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface FallingInExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11). The playback runs steadily in the traveler's own time.
const ANIMATION_DURATION_MS = RUN_PLAYBACK_SECONDS * 1000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_START = 10

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the fall: idle, running (progress 0 to 1 over a fixed time), complete.
function useFallRun(onDone: () => void) {
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

export function FallingInExperiment({ onComplete, onTutorComplete }: FallingInExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [endGuess, setEndGuess] = useState<EndChoice | null>(null)
  const [farClockGuess, setFarClockGuess] = useState<FarClockChoice | null>(null)
  const [stretchGuess, setStretchGuess] = useState<StretchChoice | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = endGuess !== null && farClockGuess !== null && stretchGuess !== null

  // ---- Part 1: the 10-Sun black hole, released from rest at 10 horizon radii, played by one Run ----
  const partOne = useMemo(() => runPartOne(), [])
  const run1 = useFallRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'
  const scale1 = fallScale(PART_ONE_START_IN_HORIZON_RADII)
  const state1 = stateAt(partOne, run1.progress * partOne.travelerClockAtHorizon)

  // ---- Part 2: the learner's own black hole and release distance ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [start, setStart] = useState(DEFAULT_START)
  const [lastPartTwo, setLastPartTwo] = useState<FallingInResult | null>(null)
  const result2 = useMemo(() => runFallingInExperiment(presetId, start), [presetId, start])
  const run2 = useFallRun(() => {
    setLastPartTwo(runFallingInExperiment(presetId, start))
    onComplete?.()
  })
  const scale2 = fallScale(start)
  const state2 = stateAt(result2, run2.progress * result2.travelerClockAtHorizon)
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
  const handleStartChange = (value: number) => {
    setStart(value)
    run2.reset()
  }
  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setEndGuess(null)
    setFarClockGuess(null)
    setStretchGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setStart(DEFAULT_START)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = endGuess !== null || farClockGuess !== null || stretchGuess !== null
  const startOverDisabled = (!hasAnyGuess && !locked) || isRunning

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

  const outcomeSoFar = run2.status === 'idle' ? '—' : run2.status === 'running' ? 'falling' : 'at the horizon'
  const showOwnPictures = run2.status !== 'idle' || lastPartTwo !== null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 5: Falling In: What Does the Traveler Experience?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <FallingInIntro />
        <ReferencePanel entries={fallingInWordsEntries(part1Done)} />
        <FallingInLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch a traveler fall into a black hole. The black hole is the 10-Sun one from Black Holes 1, and the traveler is released from rest {PART_ONE_START_IN_HORIZON_RADII} horizon radii ({formatDistance(partOne.startInHorizonRadii * partOne.horizonRadiusKm)}) from its center. One
          run shows the fall with two clocks and a stretch readout (Picture 1), a graph of how near the horizon the traveler is on each clock (Picture 2) and a graph of the stretch for three black holes (Picture 3). The real pictures and tables do not change with your guesses. After the run, your guesses are drawn on the
          real pictures in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Question 1 is about the traveler’s own watch, question 2 is about a clock far away, and question 3 is about what the traveler feels. Choose one answer for each. A guess is what is wanted: nothing is marked, and it is fine to be unsure. You can change an answer until you press Run. After that
            your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A traveler is dropped from rest near a black hole and falls straight toward it. On the traveler's own watch, does the trip to the horizon come to an end?
          </p>
          <GuessNotes n={1} />
          {guessButtons(END_CHOICES, endGuess, setEndGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A clock sits at rest far away and keeps time for the whole fall. As the traveler nears the horizon, what does that far-away clock read?
          </p>
          <GuessNotes n={2} />
          {guessButtons(FAR_CLOCK_CHOICES, farClockGuess, setFarClockGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            At the moment a traveler reaches the horizon, how does the stretching (the difference in pull between their head and their feet) compare between a small black hole (10 Suns) and a giant one (Sagittarius A*)?
          </p>
          <GuessNotes n={3} />
          {guessButtons(STRETCH_CHOICES, stretchGuess, setStretchGuess)}

          <p style={smallNote}>
            {hasAllGuesses ? `Your guesses: ${endLabel(endGuess!)}; ${farClockLabel(farClockGuess!)}; ${stretchLabel(stretchGuess!)}.` : 'Answer all three questions to run.'}
          </p>
          {locked && <p style={smallNote}>Your prediction is locked while you try other settings. To change it, press Start over.</p>}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || isRunning || part1Done} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
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
              Pictures 1 to 3 appear here when you press Run. They show a traveler falling into the 10-Sun black hole with two clocks and a stretch readout, a graph of how near the horizon the traveler is on each clock, and a graph of the stretch for three black holes.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the fall</p>
              <div style={{ maxWidth: '400px' }}>
                <FallPanel result={partOne} progress={run1.progress} pixelsPerHorizonRadius={scale1.pixelsPerHorizonRadius} scaleBarHorizonRadii={scale1.scaleBarHorizonRadii} />
              </div>
              <WhereFrom>
                <strong>Calculated here:</strong> the fall, the traveler’s clock (a closed-form formula), the far-away clock (stepped numerically) and the stretch (a formula), all from equations given by general relativity for a black hole that does not spin and has no electric charge. <strong>Measured:</strong> nothing in this picture.{' '}
                <strong>Imagined for the question:</strong> the traveler, who is 2 meters long, released from rest, with nothing else acting on them.
              </WhereFrom>
              <FallCaption complete={part1Done} result={partOne} />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: how near the horizon, on each clock</p>
              <TimeGraph result={partOne} progress={run1.progress} guesses={part1Done ? { end: endGuess, far: farClockGuess } : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> both curves, from the same fall as Picture 1. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler. The white boxes and circles, once they appear, are only your guesses.
              </WhereFrom>
              <TimeCaption complete={part1Done} result={partOne} />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 3: the stretch against distance</p>
              <StretchGraph presetId={partOne.preset.id} currentR={state1.r} guess={part1Done ? stretchGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> all three curves from the stretch formula 2GM × h ÷ r³. <strong>Measured:</strong> the masses of Sagittarius A* (about 4 million Suns) and M87* (about 6.5 billion Suns), from ESO; the 10 Suns is a round, typical size. <strong>Imagined for the question:</strong> the 2-meter
                traveler. The white pointer, once it appears, is only your guess.
              </WhereFrom>
              <StretchCaption complete={part1Done} result={partOne} />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The traveler is falling. Part 2 (your own black hole and release distance), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole and release distance), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && endGuess && farClockGuess && stretchGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the release distance, run the fall as often as you like, and compare. The guesses you made do not change these drawings, but your choices do.
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
                <strong>2. Release the traveler from rest at this distance from the black hole's center, in horizon radii:</strong>
              </p>
              {START_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleStartChange(d)}
                  disabled={isRunning}
                  className={`toggle-button${start === d ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {d}
                </button>
              ))}
              <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                That is {formatDistance(result2.startInHorizonRadii * result2.horizonRadiusKm)} from the center. A horizon radius is the size of the black hole's edge. The release distances run from 2 to {MAX_START_IN_HORIZON_RADII} horizon radii.
              </p>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>3. Run it:</strong>
            </p>
            <button type="button" className="action-button" onClick={handleRunPartTwo} disabled={isRunning} style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}>
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings. The black hole you pick changes the kilometers, the seconds and the stretch; the fall in horizon radii and light-times is the same for every black hole.
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
                Black hole: {result2.preset.label}, {formatMass(result2.preset.massSolarMasses)}; horizon radius {formatDistance(result2.horizonRadiusKm)}; one horizon light-time is {formatSeconds(result2.lightTimeSeconds)}
                <br />
                Released from rest at {result2.startInHorizonRadii} horizon radii ({formatDistance(result2.startInHorizonRadii * result2.horizonRadiusKm)}). Now: {state2.r.toFixed(state2.r < 1.1 ? 4 : 2)} horizon radii from the center
                <br />
                The traveler: {outcomeSoFar}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Choose a black hole and a release distance, then press Run your choice. Pictures 4 to 6, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 4: the fall, for your settings</p>
                  <div style={{ maxWidth: '400px' }}>
                    <FallPanel result={result2} progress={run2.progress} pixelsPerHorizonRadius={scale2.pixelsPerHorizonRadius} scaleBarHorizonRadii={scale2.scaleBarHorizonRadii} />
                  </div>
                  <WhereFrom>
                    <strong>Calculated here:</strong> the fall, in the same way as in Part 1, for your settings. <strong>Measured:</strong> the mass of the black hole you chose: about 4 million Suns for Sagittarius A* and about 6.5 billion Suns for M87* (ESO); the stellar black hole’s 10 Suns is a round, typical
                    size. <strong>Imagined for the question:</strong> the traveler, 2 meters long, released from rest.
                  </WhereFrom>
                  <FallCaption complete={run2.status === 'complete'} own result={result2} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 5: how near the horizon, on each clock, for your settings</p>
                  <TimeGraph result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both curves, from the same fall as Picture 4. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler.
                  </WhereFrom>
                  <TimeCaption complete={run2.status === 'complete'} own result={result2} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 6: the stretch against distance, for your settings</p>
                  <StretchGraph presetId={presetId} currentR={state2.r} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> all three curves from the stretch formula. <strong>Measured:</strong> the masses (ESO), as above. <strong>Imagined for the question:</strong> the 2-meter traveler.
                  </WhereFrom>
                  <StretchCaption complete={run2.status === 'complete'} own result={result2} />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and the tables never change with them. Tables 1, 2 and 4 do not follow your settings; Table 3 follows the black hole and
              release distance you ran in Part 2.
            </PartHeader>
            <FallingInResults endGuess={endGuess} farClockGuess={farClockGuess} stretchGuess={stretchGuess} partTwo={lastPartTwo} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why. Then it goes through your three guesses one by one, explains the physics step by step with numbers from this page, and ends with what to take away. Your answers to the
              questions are not marked.
            </PartHeader>
            <FallingInTutor key={tutorKey} predictedEnd={endGuess} predictedFarClock={farClockGuess} predictedStretch={stretchGuess} onExplained={() => onTutorComplete?.()} />
          </>
        )}
      </div>
    </div>
  )
}
