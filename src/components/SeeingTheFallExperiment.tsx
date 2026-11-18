import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FLASH_COUNT,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  runPartOne,
  runSeeingTheFallExperiment,
} from '../physics/seeingTheFallExperiment'
import type { CauseChoice, LastFlashChoice, SeeingTheFallResult, SpacingChoice } from '../physics/seeingTheFallExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  GuessNotes,
  SeeingTheFallHeldBackLinks,
  SeeingTheFallIntro,
  SeeingTheFallLinks,
  seeingTheFallWordsEntries,
} from './SeeingTheFallIntro'
import {
  CAUSE_CHOICES,
  CAUSE_QUESTION,
  LAST_FLASH_CHOICES,
  LAST_FLASH_QUESTION,
  SPACING_CHOICES,
  SPACING_QUESTION,
  causeLabel,
  lastFlashLabel,
  spacingLabel,
} from './SeeingTheFallChoices'
import {
  ClockCaption,
  ClockGraph,
  FlashRows,
  FlashesCaption,
  StretchCaption,
  StretchGraph,
  formatDistance,
  formatMass,
  formatSeconds,
} from './SeeingTheFallPictures'
import { SeeingTheFallResults } from './SeeingTheFallResults'
import { SeeingTheFallTutor } from './SeeingTheFallTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface SeeingTheFallExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The flashes are played one
// after another; the time between them on screen is not the time between them in the physics.
const ANIMATION_DURATION_MS = 10_000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_START = 10
const START_PRESETS = [100, 20, 10, 5, 2]

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the fall: idle, running (progress 0 to 1 over a fixed time), complete.
function useFlashRun(onDone: () => void) {
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

export function SeeingTheFallExperiment({ onComplete, onTutorComplete }: SeeingTheFallExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [spacingGuess, setSpacingGuess] = useState<SpacingChoice | null>(null)
  const [lastFlashGuess, setLastFlashGuess] = useState<LastFlashChoice | null>(null)
  const [causeGuess, setCauseGuess] = useState<CauseChoice | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = spacingGuess !== null && lastFlashGuess !== null && causeGuess !== null

  // ---- Part 1: the 10-Sun black hole, released from rest at 10 horizon radii, played by one Run ----
  const partOne = useMemo(() => runPartOne(), [])
  const run1 = useFlashRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own black hole and release distance ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [start, setStart] = useState(DEFAULT_START)
  const [lastPartTwo, setLastPartTwo] = useState<SeeingTheFallResult | null>(null)
  const result2 = useMemo(() => runSeeingTheFallExperiment(presetId, start), [presetId, start])
  const run2 = useFlashRun(() => {
    setLastPartTwo(runSeeingTheFallExperiment(presetId, start))
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
    setSpacingGuess(null)
    setLastFlashGuess(null)
    setCauseGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setStart(DEFAULT_START)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = spacingGuess !== null || lastFlashGuess !== null || causeGuess !== null
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

  const showOwnPictures = run2.status !== 'idle' || lastPartTwo !== null
  const own = { complete: run2.status === 'complete' }
  const current2 = result2.flashes[Math.min(Math.floor(run2.progress * (FLASH_COUNT + 1)), FLASH_COUNT)]
  const outcomeSoFar = run2.status === 'idle' ? '—' : run2.status === 'running' ? 'sending flashes' : 'all 21 flashes sent'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 6: Seeing the Fall From Far Away: Does Anyone See the Traveler Cross?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <SeeingTheFallIntro />
        <ReferencePanel entries={seeingTheFallWordsEntries(part1Done)} />
        <SeeingTheFallLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch a traveler fall into a black hole. The black hole is the 10-Sun one from Black Holes 1, and the traveler is released from rest at {PART_ONE_START_IN_HORIZON_RADII} horizon radii. As they fall, they send a flash
          of light at equal steps of their own watch, and a far-away observer writes down when each flash arrives. Press Run and watch the flashes. Picture 1 shows the flashes as sent and as received, Picture 2 shows how much the spacing is stretched, and Picture 3
          shows the observer’s clock against the traveler’s watch. The real pictures and tables never change with your guesses. Your guesses are drawn on Pictures 2 and 3 in white once those pictures are drawn, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Choose one answer to each. Once you press Run, your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{SPACING_QUESTION}</p>
          <GuessNotes n={1} />
          {guessButtons(SPACING_CHOICES, spacingGuess, setSpacingGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{LAST_FLASH_QUESTION}</p>
          <GuessNotes n={2} />
          {guessButtons(LAST_FLASH_CHOICES, lastFlashGuess, setLastFlashGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{CAUSE_QUESTION}</p>
          <GuessNotes n={3} />
          {guessButtons(CAUSE_CHOICES, causeGuess, setCauseGuess)}

          <p style={smallNote}>
            {hasAllGuesses ? `Your guesses: ${spacingLabel(spacingGuess!)}; ${lastFlashLabel(lastFlashGuess!)}; ${causeLabel(causeGuess!)}.` : 'Answer all three questions to run.'}
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
              Pictures 1 to 3 appear here when you press Run: the flashes as sent and as received, how much the spacing is stretched, and the observer’s clock against the traveler’s watch. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the flashes as sent and as received</p>
              <FlashRows result={partOne} progress={run1.progress} />
              <WhereFrom>
                <strong>Calculated here:</strong> every flash time and the lines joining them, from the formulas given in the specification, for a thin flash sent straight outward by a traveler released from rest. <strong>Measured:</strong> nothing, because no real fall has been
                observed. <strong>Imagined for the question:</strong> the traveler, the flashes and the observer. This picture carries no guess mark.
              </WhereFrom>
              <FlashesCaption result={partOne} started={run1.progress > 0} complete={part1Done} />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: how much the spacing is stretched</p>
              <StretchGraph result={partOne} progress={run1.progress} guesses={part1Done && spacingGuess && causeGuess ? { spacing: spacingGuess, cause: causeGuess } : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> the three curves, from the formulas given. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler and the flashes. The white marks are your guesses and show where your answer belongs, not a
                size you chose.
              </WhereFrom>
              <StretchCaption result={partOne} complete={part1Done} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 3: the observer’s clock against the traveler’s watch</p>
              <ClockGraph result={partOne} progress={run1.progress} guess={part1Done ? lastFlashGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> the curve, from the formulas given. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler, the flashes and the observer. The white mark is your guess, not a number you chose.
              </WhereFrom>
              <ClockCaption result={partOne} complete={part1Done} withGuess />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The flashes are being sent. Part 2 (your own black hole and release distance), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole and release distance), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && spacingGuess && lastFlashGuess && causeGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the release distance, run the fall as often as you like, and compare. The guesses you made stay as they were. They do not change any picture or table; these settings do.
            </PartHeader>

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
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>2. Release the traveler from rest at this distance from the black hole’s center, in horizon radii:</strong>
              </p>
              {START_PRESETS.filter((d) => d >= MIN_START_IN_HORIZON_RADII && d <= MAX_START_IN_HORIZON_RADII).map((d) => (
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
                That is {formatDistance(result2.startInHorizonRadii * result2.horizonRadiusKm)} from the center. A horizon radius is the size of the black hole’s edge.
              </p>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>3. Run it:</strong>
            </p>
            <button type="button" className="action-button" onClick={handleRunPartTwo} disabled={isRunning} style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}>
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings. The black hole you pick changes the kilometers and the seconds, and the release distance changes the flashes themselves.
            </p>

            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px solid var(--border-color, #ccc)', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>Your settings</strong>
              </p>
              <p style={{ margin: 0 }}>
                Black hole: {result2.preset.label}, {formatMass(result2.preset.massSolarMasses)}; horizon radius {formatDistance(result2.horizonRadiusKm)}; one horizon light-time is {formatSeconds(result2.lightTimeSeconds)}.
                <br />
                Released from rest at {result2.startInHorizonRadii} horizon radii ({formatDistance(result2.startInHorizonRadii * result2.horizonRadiusKm)}). Flash being sent: {run2.status === 'idle' ? '—' : current2.index}.
                <br />
                The run: {outcomeSoFar}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a release distance, then press Run your choice. Pictures 4 to 6, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 4: the flashes as sent and as received, for your settings</p>
                  <FlashRows result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the flashes, in the same way as in Part 1, for your settings. <strong>Measured:</strong> the mass of the black hole you chose (about 4 million Suns for Sagittarius A*, from ESO’s observations of stars orbiting it); the other
                    two are the page’s own examples. <strong>Imagined for the question:</strong> the traveler, the flashes and the observer.
                  </WhereFrom>
                  <FlashesCaption result={result2} started={run2.progress > 0} complete={own.complete} own />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 5: how much the spacing is stretched, for your settings</p>
                  <StretchGraph result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the three curves, from the same formulas. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler and the flashes.
                  </WhereFrom>
                  <StretchCaption result={result2} complete={own.complete} own />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 6: the observer’s clock against the traveler’s watch, for your settings</p>
                  <ClockGraph result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the curve, from the same formulas. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler, the flashes and the observer.
                  </WhereFrom>
                  <ClockCaption result={result2} complete={own.complete} own />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and the tables stay the same however you guess. Table 3 follows the black
              hole and release distance you ran in Part 2.
            </PartHeader>
            <SeeingTheFallResults spacingGuess={spacingGuess} lastFlashGuess={lastFlashGuess} causeGuess={causeGuess} partTwo={lastPartTwo} />
            <SeeingTheFallHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about two things that both seem true. Then it goes through your three guesses and explains. The tutor’s
              questions are not marked.
            </PartHeader>
            <SeeingTheFallTutor key={tutorKey} predictedSpacing={spacingGuess} predictedLastFlash={lastFlashGuess} predictedCause={causeGuess} onExplained={() => onTutorComplete?.()} />
          </>
        )}
      </div>
    </div>
  )
}
