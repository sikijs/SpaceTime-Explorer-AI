import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  receivedWavelengthNm,
  runColorOfTheFallExperiment,
  runPartOne,
  stretchFactor,
} from '../physics/colorOfTheFallExperiment'
import type { ColorChoice, ColorOfTheFallResult, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { ColorOfTheFallHeldBackLinks, ColorOfTheFallIntro, ColorOfTheFallLinks, GuessNotes, colorOfTheFallWordsEntries } from './ColorOfTheFallIntro'
import { COLOR_CHOICES, COLOR_QUESTION, MASS_CHOICES, MASS_QUESTION, VISIBLE_CHOICES, VISIBLE_QUESTION, colorLabel, massLabel, visibleLabel } from './ColorOfTheFallChoices'
import { ColorStrip, GraphCaption, StripCaption, WavelengthGraph, formatDistance, formatMass, formatWavelength, withBand } from './ColorOfTheFallPictures'
import { ColorOfTheFallResults } from './ColorOfTheFallResults'
import { ColorOfTheFallTutor } from './ColorOfTheFallTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface ColorOfTheFallExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The traveler's
// gap above the horizon shrinks by the same factor in each equal slice of it, as on the graph's logarithmic axis.
const ANIMATION_DURATION_MS = 10_000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_START = 10
const START_PRESETS = [100, 20, 10, 5, 2]

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

export function ColorOfTheFallExperiment({ onComplete, onTutorComplete }: ColorOfTheFallExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [colorGuess, setColorGuess] = useState<ColorChoice | null>(null)
  const [visibleGuess, setVisibleGuess] = useState<VisibleChoice | null>(null)
  const [massGuess, setMassGuess] = useState<MassChoice | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = colorGuess !== null && visibleGuess !== null && massGuess !== null

  // ---- Part 1: the 10-Sun black hole, released from rest at 10 horizon radii, played by one Run ----
  const partOne = useMemo(() => runPartOne(), [])
  const run1 = useFallRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own black hole and release distance ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [start, setStart] = useState(DEFAULT_START)
  const [lastPartTwo, setLastPartTwo] = useState<ColorOfTheFallResult | null>(null)
  const result2 = useMemo(() => runColorOfTheFallExperiment(presetId, start), [presetId, start])
  const run2 = useFallRun(() => {
    setLastPartTwo(runColorOfTheFallExperiment(presetId, start))
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
    setColorGuess(null)
    setVisibleGuess(null)
    setMassGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setStart(DEFAULT_START)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = colorGuess !== null || visibleGuess !== null || massGuess !== null
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
  // The traveler's place and the color as received at this point of the Part 2 playback, from the module's own formulas.
  const endGap2 = result2.curve[result2.curve.length - 1].gap
  const widest2 = result2.startInHorizonRadii - 1
  const rNow2 = Math.min(1 + widest2 * (endGap2 / widest2) ** run2.progress, result2.startInHorizonRadii)
  const outcomeSoFar =
    run2.status === 'idle'
      ? '—'
      : run2.status === 'running'
        ? `${formatWavelength(receivedWavelengthNm(result2.startInHorizonRadii, rNow2))} so far`
        : `${withBand(result2.curve[result2.curve.length - 1].wavelengthNm)} at the end`

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 7: The Color of the Fall: What Color Does the Falling Traveler’s Light Have?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <ColorOfTheFallIntro />
        <ReferencePanel entries={colorOfTheFallWordsEntries(part1Done)} />
        <ColorOfTheFallLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch a traveler fall into a black hole with a green lamp on. The black hole is the 10-Sun one from Black Holes 1, and the traveler is released from rest at {PART_ONE_START_IN_HORIZON_RADII} horizon radii. Press Run and watch the color the observer receives. Picture 1 shows the
          lamp’s own color and the color as received on a strip of all the kinds of light, and Picture 2 shows the color as received against how far the traveler still is from the horizon. The real pictures and tables never change with your guesses. Your guesses are drawn on them in white once the features they are about are
          drawn, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Choose one answer to each. Once you press Run, your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{COLOR_QUESTION}</p>
          <GuessNotes n={1} />
          {guessButtons(COLOR_CHOICES, colorGuess, setColorGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{VISIBLE_QUESTION}</p>
          <GuessNotes n={2} />
          {guessButtons(VISIBLE_CHOICES, visibleGuess, setVisibleGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{MASS_QUESTION}</p>
          <GuessNotes n={3} />
          {guessButtons(MASS_CHOICES, massGuess, setMassGuess)}

          <p style={smallNote}>
            {hasAllGuesses ? `Your guesses: ${colorLabel(colorGuess!)}; ${visibleLabel(visibleGuess!)}; ${massLabel(massGuess!)}.` : 'Answer all three questions to run.'}
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
              Pictures 1 and 2 appear here when you press Run: the color of the lamp as received on a strip of all the kinds of light, and the wavelength against the traveler’s distance. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the color of the lamp, as received</p>
              <ColorStrip result={partOne} progress={run1.progress} guess={part1Done ? colorGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> every wavelength, from the formulas given. <strong>Measured:</strong> nothing, because no real fall has been observed. <strong>Imagined for the question:</strong> the traveler, the lamp and the observer. The green marker is the lamp’s own color, chosen for this page (550 nm). The white
                mark is your guess and shows where your answer belongs, not a number you chose.
              </WhereFrom>
              <StripCaption result={partOne} started={run1.progress > 0} complete={part1Done} withGuess />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: the wavelength against the traveler’s distance</p>
              <WavelengthGraph
                result={partOne}
                progress={run1.progress}
                guesses={part1Done && colorGuess && visibleGuess ? { color: colorGuess, visible: visibleGuess } : null}
                panel={{ complete: part1Done, guess: part1Done ? massGuess : null }}
              />
              <WhereFrom>
                <strong>Calculated here:</strong> the curve and the two bars of the small panel, from the formulas given. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler and the lamp. The 550 nm line is the lamp’s color if nothing stretched it. The white marks are your guesses and show
                where your answer belongs, not a size you chose.
              </WhereFrom>
              <GraphCaption result={partOne} complete={part1Done} withGuesses />
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

        {part1Done && colorGuess && visibleGuess && massGuess && (
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
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings. The black hole you pick changes the kilometers, and the release distance changes the wavelengths.
            </p>

            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px solid var(--border-color, #ccc)', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>Your settings</strong>
              </p>
              <p style={{ margin: 0 }}>
                Black hole: {result2.preset.label}, {formatMass(result2.preset.massSolarMasses)}; horizon radius {formatDistance(result2.horizonRadiusKm)}.
                <br />
                Released from rest at {result2.startInHorizonRadii} horizon radii ({formatDistance(result2.startInHorizonRadii * result2.horizonRadiusKm)}). Traveler now:{' '}
                {run2.status === 'idle' ? '—' : `${Number(rNow2.toPrecision(6))} horizon radii from the center, stretch factor ${Number(stretchFactor(result2.startInHorizonRadii, rNow2).toPrecision(3))}`}.
                <br />
                The color as received: {outcomeSoFar}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a release distance, then press Run your choice. Pictures 3 and 4, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 3: the color of the lamp, as received, for your settings</p>
                  <ColorStrip result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> every wavelength, in the same way as in Part 1, for your settings. <strong>Measured:</strong> the mass of the black hole you chose (about 4 million Suns for Sagittarius A*, from ESO’s observations of stars orbiting it); the other two are the page’s own examples.{' '}
                    <strong>Imagined for the question:</strong> the traveler, the lamp and the observer.
                  </WhereFrom>
                  <StripCaption result={result2} started={run2.progress > 0} complete={own.complete} own />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 4: the wavelength against the traveler’s distance, for your settings</p>
                  <WavelengthGraph result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the curve, from the same formulas. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the traveler and the lamp.
                  </WhereFrom>
                  <GraphCaption result={result2} complete={own.complete} own />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and the tables stay the same however you guess. Table 3 follows the black hole and release distance you ran in Part 2.
            </PartHeader>
            <ColorOfTheFallResults colorGuess={colorGuess} visibleGuess={visibleGuess} massGuess={massGuess} partTwo={lastPartTwo} />
            <ColorOfTheFallHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about two things that both seem true. Then it goes through your three guesses and explains. The tutor’s questions are not marked.
            </PartHeader>
            <ColorOfTheFallTutor key={tutorKey} predictedColor={colorGuess} predictedVisible={visibleGuess} predictedMass={massGuess} onExplained={() => onTutorComplete?.()} />
          </>
        )}
      </div>
    </div>
  )
}
