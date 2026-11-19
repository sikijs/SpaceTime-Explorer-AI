import { useEffect, useMemo, useRef, useState } from 'react'
import { HAWKING_PRESETS, PART_ONE_MASS_KG, markGuesses, runHawkingRadiationExperiment } from '../physics/hawkingRadiationExperiment'
import type { DirectionAnswer, HawkingResult, HotAnswer, LongerAnswer } from '../physics/hawkingRadiationExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  GuessNotes,
  HawkingRadiationHeldBackLinks,
  HawkingRadiationIntro,
  HawkingRadiationLinks,
  hawkingRadiationWordsEntries,
} from './HawkingRadiationIntro'
import {
  DIRECTION_CHOICES,
  HOT_CHOICES,
  HOT_QUESTION,
  LONGER_CHOICES,
  LONGER_QUESTION,
  directionLabel,
  directionQuestion,
  hotLabel,
  longerLabel,
} from './HawkingRadiationChoices'
import {
  BACKGROUND_KELVIN_TEXT,
  DIRECTION_NAME,
  Flow,
  FlowCaption,
  GraphCaption,
  LifetimeGraph,
  Thermometer,
  ThermometerCaption,
  compareWithBackground,
  formatBig,
  formatKelvin,
  formatKg,
  formatLength,
  formatYears,
  presetLabel,
  UNIVERSE_AGE_TEXT,
} from './HawkingRadiationPictures'
import { HawkingRadiationResults } from './HawkingRadiationResults'
import { HawkingRadiationTutor } from './HawkingRadiationTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface HawkingRadiationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The time-lapse is only a way of showing the
// direction of the black hole's mass; it does not model real time.
const ANIMATION_DURATION_MS = 10_000
const DEFAULT_MASS_KG = HAWKING_PRESETS[2].massKg // 1 Sun

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the time-lapse: idle, running (progress 0 to 1 over a fixed time), complete.
function useTimeLapse(onDone: () => void) {
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

export function HawkingRadiationExperiment({ onComplete, onTutorComplete }: HawkingRadiationExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [hotGuess, setHotGuess] = useState<HotAnswer | null>(null)
  const [directionGuess, setDirectionGuess] = useState<DirectionAnswer | null>(null)
  const [longerGuess, setLongerGuess] = useState<LongerAnswer | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = hotGuess !== null && directionGuess !== null && longerGuess !== null

  // ---- Part 1: a black hole of 10 Suns, played by one Run ----
  const partOne = useMemo(() => runHawkingRadiationExperiment(PART_ONE_MASS_KG), [])
  const run1 = useTimeLapse(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own black hole ----
  const [massKg, setMassKg] = useState(DEFAULT_MASS_KG)
  const [lastPartTwoMassKg, setLastPartTwoMassKg] = useState<number | null>(null)
  const result2: HawkingResult = useMemo(() => runHawkingRadiationExperiment(massKg), [massKg])
  const run2 = useTimeLapse(() => {
    setLastPartTwoMassKg(massKg)
    onComplete?.()
  })
  const isRunning = run1.status === 'running' || run2.status === 'running'

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    setLocked(true)
    run1.start()
  }
  const handleMassChange = (value: number) => {
    setMassKg(value)
    run2.reset()
  }
  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setHotGuess(null)
    setDirectionGuess(null)
    setLongerGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setMassKg(DEFAULT_MASS_KG)
    setLastPartTwoMassKg(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = hotGuess !== null || directionGuess !== null || longerGuess !== null
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

  const showOwnPictures = run2.status !== 'idle' || lastPartTwoMassKg !== null
  const readyForParts = part1Done && hotGuess && directionGuess && longerGuess

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 10: Hawking Radiation: Does a Black Hole Slowly Disappear?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <HawkingRadiationIntro />
        <ReferencePanel entries={hawkingRadiationWordsEntries(part1Done)} />
        <HawkingRadiationLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch a black hole of 10 Suns. Press Run and watch three pictures fill in: a thermometer, a picture of heat going in and out, and a graph of how long a black hole would take to evaporate. The real pictures and tables never change with your guesses. Your guesses are drawn on them in white once the run has finished, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Choose one answer to each. Once you press Run, your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{HOT_QUESTION}</p>
          <GuessNotes n={1} />
          {guessButtons(HOT_CHOICES, hotGuess, setHotGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{directionQuestion(BACKGROUND_KELVIN_TEXT)}</p>
          <GuessNotes n={2} />
          {guessButtons(DIRECTION_CHOICES, directionGuess, setDirectionGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{LONGER_QUESTION}</p>
          <GuessNotes n={3} />
          {guessButtons(LONGER_CHOICES, longerGuess, setLongerGuess)}

          <p style={smallNote}>
            {hasAllGuesses ? `Your guesses: ${hotLabel(hotGuess!)}; ${directionLabel(directionGuess!)}; ${longerLabel(longerGuess!)}.` : 'Answer all three questions to run.'}
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
              Pictures 1, 2 and 3 appear here when you press Run: the thermometer, the picture of heat going in and out, and the graph of the time to evaporate. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the thermometer</p>
              <Thermometer result={partOne} guess={part1Done ? hotGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> every dot, from a standard formula given in Hawking’s papers of 1974 and 1975 and not derived. <strong>Measured:</strong> the background’s {BACKGROUND_KELVIN_TEXT} K (Cosmology 3). Nothing in the dots is measured: Hawking radiation has never been seen from a real black hole. <strong>Imagined for the question:</strong> the black holes themselves, at the masses given. The white mark is your guess; a mark on a dot, or a bracket round two, only shows which answer you gave.
              </WhereFrom>
              <ThermometerCaption result={partOne} number={1} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: heat in and heat out</p>
              <Flow result={partOne} progress={run1.progress} guess={part1Done ? directionGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> which arrow is bold, from comparing the two temperatures of Picture 1; the disk’s change is only a way of showing the result. <strong>Measured:</strong> nothing in the drawing. <strong>Imagined for the question:</strong> a black hole of 10 Suns in the background, and the time-lapse, which is not how long a real change takes. The white mark is your guess and is only a marker.
              </WhereFrom>
              <FlowCaption result={partOne} number={2} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 3: how long to evaporate</p>
              <LifetimeGraph result={partOne} guess={part1Done ? longerGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> the line, the dots and the zoom panel, from a standard formula given and not derived, good only to within a few times. <strong>Measured:</strong> the age of the universe, about {UNIVERSE_AGE_TEXT} years. Nothing about evaporation is measured. <strong>Imagined for the question:</strong> a black hole alone in perfectly cold space with nothing falling in. The white marks are your guess, at the time your answer gives for a black hole of 10 Suns.
              </WhereFrom>
              <GraphCaption result={partOne} number={3} withGuesses />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The black hole is being run. Part 2 (your own black hole), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {readyForParts && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a black hole, run it as often as you like, and compare. The guesses you made stay as they were. They do not change any picture or table; this setting does.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>1. Choose a black hole:</strong>
              </p>
              {HAWKING_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleMassChange(p.massKg)}
                  disabled={isRunning}
                  className={`toggle-button${massKg === p.massKg ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {presetLabel[p.id]}
                </button>
              ))}
              <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                {presetLabel[HAWKING_PRESETS.find((p) => p.massKg === massKg)!.id]} has a mass of {formatKg(result2.massKg)}
                {result2.massSolarMasses === 1 ? " (the Sun's mass)" : result2.massSolarMasses >= 0.1 ? ` (${formatBig(result2.massSolarMasses)} times the Sun's mass)` : ''} and a horizon radius of {formatLength(result2.horizonRadiusKm)}.
              </p>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>2. Run it:</strong>
            </p>
            <button type="button" className="action-button" onClick={handleRunPartTwo} disabled={isRunning} style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}>
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>Your guesses do not change the drawings or tables, but this setting does. There is no comparison table for the setting.</p>

            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px solid var(--border-color, #ccc)', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>Your setting</strong>
              </p>
              <p style={{ margin: 0 }}>
                {run2.status === 'idle'
                  ? `Press Run your choice to see ${presetLabel[HAWKING_PRESETS.find((p) => p.massKg === massKg)!.id]}.`
                  : `This black hole has a temperature of ${formatKelvin(result2.temperatureKelvin)}, which is ${compareWithBackground(result2)} the background’s ${BACKGROUND_KELVIN_TEXT} K. So its mass ${DIRECTION_NAME[result2.direction]}. Alone, with nothing falling in, it would take about ${formatYears(result2.lifetimeYears)} to evaporate (the universe is about ${UNIVERSE_AGE_TEXT} years old).`}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Not run yet. Choose a black hole, then press Run your choice. Pictures 4, 5 and 6, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 4: the thermometer, for your setting</p>
                  <Thermometer result={result2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the dots, in the same way as in Part 1; the violet ring is the black hole you chose. <strong>Measured:</strong> the background’s {BACKGROUND_KELVIN_TEXT} K only. <strong>Imagined for the question:</strong> the black holes themselves.
                  </WhereFrom>
                  <ThermometerCaption result={result2} number={4} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 5: heat in and heat out, for your setting</p>
                  <Flow result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> which arrow is bold, as in Part 1. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> your black hole in the background, and the time-lapse.
                  </WhereFrom>
                  <FlowCaption result={result2} number={5} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 6: how long to evaporate, for your setting</p>
                  <LifetimeGraph result={result2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the line and the dots, from the same formula. <strong>Measured:</strong> the age of the universe only. <strong>Imagined for the question:</strong> a black hole alone in perfectly cold space.
                  </WhereFrom>
                  <GraphCaption result={result2} number={6} />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures, and a check-up of the page against published figures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and Tables 1 and 3 stay the same however you guess. Table 2 follows the black hole you ran in Part 2.
            </PartHeader>
            <HawkingRadiationResults hotGuess={hotGuess} directionGuess={directionGuess} longerGuess={longerGuess} partTwoMassKg={lastPartTwoMassKg} />
            <HawkingRadiationHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about the heat that goes in and out. Then it goes through your three guesses and explains. The tutor’s questions are not marked.
            </PartHeader>
            <HawkingRadiationTutor
              key={tutorKey}
              predictedHot={hotGuess}
              predictedDirection={directionGuess}
              predictedLonger={longerGuess}
              matches={markGuesses({ hot: hotGuess, direction: directionGuess, longer: longerGuess })}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
