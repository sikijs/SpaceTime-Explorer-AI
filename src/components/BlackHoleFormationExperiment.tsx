import { useEffect, useMemo, useRef, useState } from 'react'
import { PART_ONE_MASS, markGuesses, runBlackHoleFormationExperiment } from '../physics/blackHoleFormationExperiment'
import type { CoreResult, LimitAnswer, SizeAnswer, ThresholdAnswer } from '../physics/blackHoleFormationExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { BlackHoleFormationHeldBackLinks, BlackHoleFormationIntro, BlackHoleFormationLinks, GuessNotes, blackHoleFormationWordsEntries } from './BlackHoleFormationIntro'
import {
  LIMIT_CHOICES,
  LIMIT_QUESTION,
  SIZE_CHOICES,
  SIZE_QUESTION,
  THRESHOLD_CHOICES,
  THRESHOLD_QUESTION,
  limitLabel,
  sizeLabel,
  thresholdLabel,
} from './BlackHoleFormationChoices'
import { GraphCaption, Ladder, LadderCaption, OUTCOME_NAME, RulerCaption, SizeRuler, WhiteDwarfGraph, formatKm, formatNumber, formatRatio } from './BlackHoleFormationPictures'
import { BlackHoleFormationResults } from './BlackHoleFormationResults'
import { BlackHoleFormationTutor } from './BlackHoleFormationTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface BlackHoleFormationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The "squeeze" is only a way of showing the
// result; it does not model the time a real collapse takes.
const ANIMATION_DURATION_MS = 10_000

const MASS_PRESETS = [0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10]
const DEFAULT_MASS = 1.4

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the squeeze: idle, running (progress 0 to 1 over a fixed time), complete.
function useSqueezeRun(onDone: () => void) {
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

export function BlackHoleFormationExperiment({ onComplete, onTutorComplete }: BlackHoleFormationExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [sizeGuess, setSizeGuess] = useState<SizeAnswer | null>(null)
  const [thresholdGuess, setThresholdGuess] = useState<ThresholdAnswer | null>(null)
  const [limitGuess, setLimitGuess] = useState<LimitAnswer | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = sizeGuess !== null && thresholdGuess !== null && limitGuess !== null

  // ---- Part 1: a core of 5 Suns, played by one Run ----
  const partOne = useMemo(() => runBlackHoleFormationExperiment(PART_ONE_MASS), [])
  const run1 = useSqueezeRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own core mass ----
  const [mass, setMass] = useState(DEFAULT_MASS)
  const [lastPartTwo, setLastPartTwo] = useState<CoreResult | null>(null)
  const result2 = useMemo(() => runBlackHoleFormationExperiment(mass), [mass])
  const run2 = useSqueezeRun(() => {
    setLastPartTwo(runBlackHoleFormationExperiment(mass))
    onComplete?.()
  })
  const isRunning = run1.status === 'running' || run2.status === 'running'

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    setLocked(true)
    run1.start()
  }
  const handleMassChange = (value: number) => {
    setMass(value)
    run2.reset()
  }
  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setSizeGuess(null)
    setThresholdGuess(null)
    setLimitGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setMass(DEFAULT_MASS)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = sizeGuess !== null || thresholdGuess !== null || limitGuess !== null
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
  const ladderGuesses = part1Done && thresholdGuess && limitGuess ? { threshold: thresholdGuess, limit: limitGuess } : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 9: How a Black Hole Forms: What Can Hold Up a Dead Star’s Core?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <BlackHoleFormationIntro />
        <ReferencePanel entries={blackHoleFormationWordsEntries(part1Done)} />
        <BlackHoleFormationLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch a dead core of {PART_ONE_MASS} Suns be squeezed. Press Run and watch three pictures fill in: a ladder of what holds a core up, a ruler of sizes, and a graph of a white dwarf’s size. The real pictures and tables never change with your guesses. Your guesses are drawn on them in white once the run has finished, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Choose one answer to each. Once you press Run, your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{SIZE_QUESTION}</p>
          <GuessNotes n={1} />
          {guessButtons(SIZE_CHOICES, sizeGuess, setSizeGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{THRESHOLD_QUESTION}</p>
          <GuessNotes n={2} />
          {guessButtons(THRESHOLD_CHOICES, thresholdGuess, setThresholdGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{LIMIT_QUESTION}</p>
          <GuessNotes n={3} />
          {guessButtons(LIMIT_CHOICES, limitGuess, setLimitGuess)}

          <p style={smallNote}>
            {hasAllGuesses ? `Your guesses: ${sizeLabel(sizeGuess!)}; ${thresholdLabel(thresholdGuess!)}; ${limitLabel(limitGuess!)}.` : 'Answer all three questions to run.'}
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
              Pictures 1, 2 and 3 appear here when you press Run: the ladder of what holds a core up, the ruler of sizes with the squeeze, and the graph of a white dwarf’s size. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the ladder</p>
              <Ladder result={partOne} guesses={ladderGuesses} />
              <WhereFrom>
                <strong>Calculated here:</strong> the zones and their edges, from the standard results given (1.44, about 2 and about 3 Suns) and not derived. <strong>Measured:</strong> nothing in the drawing; Table 1 in Part 3 compares the edges with published values. <strong>Imagined for the question:</strong> a dead core of the chosen mass. The white marks are your guesses; guess 2 shows the mass you chose, and guess 3 is only a marker.
              </WhereFrom>
              <LadderCaption result={partOne} number={1} complete={part1Done} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: the size ruler</p>
              <SizeRuler result={partOne} progress={run1.progress} />
              <WhereFrom>
                <strong>Calculated here:</strong> the ball’s size (a white dwarf’s from the page’s own formula, a neutron star’s a round 12 km) and the horizon ring from Black Holes 1’s formula. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the squeeze, which is only a way of showing the result and is not how long a real collapse takes.
              </WhereFrom>
              <RulerCaption result={partOne} number={2} />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 3: a white dwarf’s size against its mass</p>
              <WhiteDwarfGraph result={partOne} guess={part1Done ? sizeGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> the curve, from a formula fitted to a numerical calculation (the page’s own fit, given and not derived). <strong>Measured:</strong> nothing in the drawing; Table 1 in Part 3 compares the curve with one real white dwarf. <strong>Imagined for the question:</strong> a core of each mass. The white mark is your guess and shows which answer you gave, not a size you chose.
              </WhereFrom>
              <GraphCaption result={partOne} number={3} complete={part1Done} withGuesses />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The core is being squeezed. Part 2 (your own core mass), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own core mass), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && sizeGuess && thresholdGuess && limitGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the mass of the core, run it as often as you like, and compare. The guesses you made stay as they were. They do not change any picture or table; this setting does.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>1. Choose the mass of the dead core, in Suns</strong> (one Sun is the mass of our Sun):
              </p>
              {MASS_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMassChange(m)}
                  disabled={isRunning}
                  className={`toggle-button${mass === m ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {m}
                </button>
              ))}
              <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>The horizon is the boundary around a black hole, inside which nothing can get out, not even light. Its radius is measured from the center, and it depends only on the mass. The horizon radius of a core of {formatNumber(result2.coreMassSolarMasses)} Suns is {formatKm(result2.horizonRadiusKm)}: the size the core would have to be squeezed inside to be a black hole.</p>
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
                A core of {formatNumber(result2.coreMassSolarMasses)} Suns is {OUTCOME_NAME[result2.outcome]}. Its horizon radius is {formatKm(result2.horizonRadiusKm)}.{' '}
                {run2.status === 'idle'
                  ? 'Press Run your choice to see it.'
                  : result2.radiusOverHorizon === null
                    ? 'Nothing known holds it up.'
                    : `What holds it up has a radius of ${formatKm(result2.heldUpRadiusKm as number)}${result2.outcome === 'uncertain' ? ' (if a neutron star holds it)' : ''}, which is ${formatRatio(result2.radiusOverHorizon)} times its horizon radius.`}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Not run yet. Choose a mass, then press Run your choice. Pictures 4, 5 and 6, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 4: the ladder, for your setting</p>
                  <Ladder result={result2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the zones, in the same way as in Part 1; the cyan marker is your core. <strong>Measured:</strong> nothing in the drawing. <strong>Imagined for the question:</strong> a dead core of the chosen mass.
                  </WhereFrom>
                  <LadderCaption result={result2} number={4} complete={run2.status === 'complete'} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 5: the size ruler, for your setting</p>
                  <SizeRuler result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the ball and the ring, in the same way as in Part 1. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the squeeze.
                  </WhereFrom>
                  <RulerCaption result={result2} number={5} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 6: a white dwarf’s size against its mass, for your setting</p>
                  <WhiteDwarfGraph result={result2} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the curve, from the same formula. <strong>Measured:</strong> nothing in the drawing. <strong>Imagined for the question:</strong> a core of each mass.
                  </WhereFrom>
                  <GraphCaption result={result2} number={6} complete={run2.status === 'complete'} />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures, and a check-up of the page against published values. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and Tables 1 to 4 stay the same however you guess. Table 5 follows the mass you ran in Part 2.
            </PartHeader>
            <BlackHoleFormationResults sizeGuess={sizeGuess} thresholdGuess={thresholdGuess} limitGuess={limitGuess} partTwo={lastPartTwo} />
            <BlackHoleFormationHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why a heavier white dwarf is smaller. Then it goes through your three guesses and explains. The tutor’s questions are not marked.
            </PartHeader>
            <BlackHoleFormationTutor
              key={tutorKey}
              predictedSize={sizeGuess}
              predictedThreshold={thresholdGuess}
              predictedLimit={limitGuess}
              matches={markGuesses({ size: sizeGuess, threshold: thresholdGuess, limit: limitGuess })}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
