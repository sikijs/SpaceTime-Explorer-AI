import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  MAX_START_IN_HORIZON_RADII,
  MAX_TURNS,
  MIN_START_IN_HORIZON_RADII,
  runFarPair,
  runOrbitsNearBlackHoleExperiment,
  runPartOne,
} from '../physics/orbitsNearBlackHoleExperiment'
import type { FarGuess, LastSafeGuess, NudgeGuess, OrbitsNearBlackHoleResult } from '../physics/orbitsNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import {
  BlackHoleOptionsNote,
  GuessNotes,
  OrbitsNearBlackHoleIntro,
  OrbitsNearBlackHoleLinks,
  PART_TWO_START_PRESETS,
  PartTwoGuide,
  orbitsNearBlackHoleWordsEntries,
} from './OrbitsNearBlackHoleIntro'
import {
  DistanceGraph,
  FAR_CHOICES,
  FarGuessStrip,
  FarPairCaption,
  GraphCaption,
  LAST_SAFE_CHOICES,
  NUDGE_CHOICES,
  PanelPair,
  PanelsCaption,
  RUN_PLAYBACK_SECONDS,
  farLabel,
  formatDistance,
  formatMass,
  formatRadii,
  lastSafeLabel,
  nudgeLabel,
} from './OrbitsNearBlackHolePictures'
import { OrbitsNearBlackHoleResults } from './OrbitsNearBlackHoleResults'
import { OrbitsNearBlackHoleTutor } from './OrbitsNearBlackHoleTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface OrbitsNearBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = RUN_PLAYBACK_SECONDS * 1000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = 'stellar-black-hole'
const DEFAULT_START = 6

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the probes: idle, running (progress 0 to 1 over a fixed time), complete.
function useProbeRun(onDone: () => void) {
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

export function OrbitsNearBlackHoleExperiment({ onComplete, onTutorComplete }: OrbitsNearBlackHoleExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [nudgeGuess, setNudgeGuess] = useState<NudgeGuess | null>(null)
  const [lastSafeGuess, setLastSafeGuess] = useState<LastSafeGuess | null>(null)
  const [farGuess, setFarGuess] = useState<FarGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = nudgeGuess !== null && lastSafeGuess !== null && farGuess !== null

  // ---- Part 1: the 10-Sun black hole, a pair at 2 horizon radii and a pair at 20, played by one Run ----
  const partOne = useMemo(() => runPartOne(), [])
  const farPair = useMemo(() => runFarPair(), [])
  const run1 = useProbeRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'
  const turns1 = run1.progress * MAX_TURNS

  // ---- Part 2: the learner's own black hole and start ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [start, setStart] = useState(DEFAULT_START)
  const [lastPartTwo, setLastPartTwo] = useState<OrbitsNearBlackHoleResult | null>(null)
  const result2 = useMemo(() => runOrbitsNearBlackHoleExperiment(presetId, start), [presetId, start])
  const run2 = useProbeRun(() => {
    setLastPartTwo(runOrbitsNearBlackHoleExperiment(presetId, start))
    onComplete?.()
  })
  const turns2 = run2.progress * MAX_TURNS
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
    setNudgeGuess(null)
    setLastSafeGuess(null)
    setFarGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setStart(DEFAULT_START)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = nudgeGuess !== null || lastSafeGuess !== null || farGuess !== null
  const startOverDisabled = (!hasAnyGuess && !locked) || isRunning

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / start)) < 1e-9

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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 3: Orbits Near a Black Hole: Is There a Point of No Safe Orbit?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the real orbits, the links and the words ===== */}
        <OrbitsNearBlackHoleIntro />
        <ReferencePanel entries={orbitsNearBlackHoleWordsEntries(part1Done)} />
        <OrbitsNearBlackHoleLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then watch small probes circle a black hole. The black hole is the 10-Sun one from Black Holes 1. One run shows two starts: a probe circling at 2 horizon radii and, in a smaller
          picture, one at 20. The real pictures and tables do not change with your guesses. After the run, your guesses are drawn on the real pictures in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Question 1 is about a nudged circle close in, question 2 is about where a circle stops lasting, and question 3 is about orbits far out. Choose one answer for each. A guess is what is wanted:
            nothing is marked, and it is fine to be unsure. You can change an answer until you press Run. After that your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the
            results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A probe is circling a black hole at 2 horizon radii, at exactly the speed that gives a circular orbit there. Then it gets a tiny nudge inward. What happens?
          </p>
          <GuessNotes n={1} />
          {guessButtons(NUDGE_CHOICES, nudgeGuess, setNudgeGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            In ordinary gravity, a planet can circle at any distance. Close to a black hole, where is the last safe place to circle?
          </p>
          <GuessNotes n={2} />
          {guessButtons(LAST_SAFE_CHOICES, lastSafeGuess, setLastSafeGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Far from the black hole, at 20 horizon radii, will an orbit under the exact theory of gravity look different from the same orbit under ordinary gravity?
          </p>
          <GuessNotes n={3} />
          {guessButtons(FAR_CHOICES, farGuess, setFarGuess)}

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${nudgeLabel(nudgeGuess!)}; ${lastSafeLabel(lastSafeGuess!)}; ${farLabel(farGuess!)}.`
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
              Pictures 1, 1b and 2 appear here when you press Run. They show a black hole of 10 Suns and two small probes circling it, first at 2 horizon radii and then, in a smaller pair, at 20.
            </p>
          ) : (
            <>
              <PanelPair
                result={partOne}
                turnsReached={turns1}
                showLastSafeOrbit={part1Done}
                nudgeGuess={part1Done ? nudgeGuess : null}
                lastSafeGuess={part1Done ? lastSafeGuess : null}
              />
              <WhereFrom>
                <strong>Calculated here:</strong> both paths, by stepping the equations in small, equal angles with the same nudge; the last safe orbit’s distance, from the formula given by general relativity for a black hole that does not
                spin and has no electric charge. <strong>Measured:</strong> none of these paths. ESO’s observations of the star S2 (2020) are a real observation of a related effect, not of these paths. <strong>Imagined for the
                question:</strong> the probes, their launch and the nudge, and the gold probe at distances where ordinary gravity is a poor description. The white marks, once they appear, are only your guesses.
              </WhereFrom>
              <PanelsCaption complete={part1Done} result={partOne} />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 1b: the same two probes at 20 horizon radii</p>
              <PanelPair result={farPair} turnsReached={turns1} showLastSafeOrbit={part1Done} compact />
              {part1Done && farGuess && <FarGuessStrip guess={farGuess} />}
              <WhereFrom>
                <strong>Calculated here:</strong> both paths, in the same way as Picture 1. <strong>Measured:</strong> none. <strong>Imagined for the question:</strong> the probes, their launch and the nudge. The white bracket, once it
                appears, is only a marker for your guess.
              </WhereFrom>
              <FarPairCaption complete={part1Done} result={farPair} />

              <DistanceGraph
                ordinary={partOne.ordinary}
                exact={partOne.exact}
                startInHorizonRadii={partOne.startInHorizonRadii}
                turnsReached={turns1}
                showLastSafe={part1Done}
                logAxis
                lastSafeGuess={part1Done ? lastSafeGuess : null}
              />
              <WhereFrom>
                <strong>Calculated here:</strong> both lines, from the same paths as Picture 1, and the three dashed lines. <strong>Measured:</strong> none. <strong>Imagined for the question:</strong> the probes. The white line or bar,
                once it appears, is only your guess.
              </WhereFrom>
              <GraphCaption complete={part1Done} result={partOne} />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The probes are running. Part 2 (your own black hole and start), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all three guesses and press Run. Part 2 (your own black hole and start), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && nudgeGuess && lastSafeGuess && farGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the starting distance, run the probes as often as you like, and compare. The guesses you made do not change these drawings, but your choices do.
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
                <strong>2. Start the probes in a circular orbit at this distance from the black hole's center:</strong>
              </p>
              {PART_TWO_START_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleStartChange(d)}
                  disabled={isRunning}
                  className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {d === MAX_START_IN_HORIZON_RADII ? '20 (far)' : d}
                </button>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor="orbits-near-black-hole-start" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Start: {formatRadii(start)} horizon radii ({formatDistance(result2.startKm)})
                </label>
                <input
                  id="orbits-near-black-hole-start"
                  type="range"
                  min={Math.log10(MIN_START_IN_HORIZON_RADII)}
                  max={Math.log10(MAX_START_IN_HORIZON_RADII)}
                  step="any"
                  value={Math.log10(start)}
                  disabled={isRunning}
                  onChange={(event) =>
                    handleStartChange(Math.min(Math.max(10 ** Number(event.target.value), MIN_START_IN_HORIZON_RADII), MAX_START_IN_HORIZON_RADII))
                  }
                  style={{ width: '100%' }}
                />
                <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                  The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon radius is the size of the black hole's edge. The slider stops at {MIN_START_IN_HORIZON_RADII}, because closer in
                  than 1.5 horizon radii no circular orbit exists at all for anything slower than light.
                </p>
              </div>
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
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings: the pictures show what changes.
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
                Start: {formatRadii(start)} horizon radii ({formatDistance(result2.startKm)} from the center)
              </p>
            </div>

            <Block>
              {run2.status === 'idle' && lastPartTwo === null ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>
                  Choose a black hole and a start, then press Run your choice. Pictures 3 and 4, each with its own caption, appear here.
                </p>
              ) : (
                <>
                  <PanelPair result={result2} turnsReached={turns2} showLastSafeOrbit />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both paths, in the same way as in Part 1, for your settings. <strong>Measured:</strong> the mass of the black hole you chose: about 4 million Suns for Sagittarius A* (ESO) and about
                    6.5 billion Suns for M87* (ESO); the stellar black hole’s 10 Suns is a round, typical size. <strong>Imagined for the question:</strong> the probes, their launch and the nudge.
                  </WhereFrom>
                  <PanelsCaption complete={run2.status === 'complete'} result={result2} own />

                  <DistanceGraph
                    ordinary={result2.ordinary}
                    exact={result2.exact}
                    startInHorizonRadii={result2.startInHorizonRadii}
                    turnsReached={turns2}
                    showLastSafe
                    logAxis={false}
                  />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both lines, from the same paths as Picture 3, and the three dashed lines. <strong>Measured:</strong> none. <strong>Imagined for the question:</strong> the probes.
                  </WhereFrom>
                  <GraphCaption complete={run2.status === 'complete'} result={result2} own />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and the tables never change with
              them. Tables 1, 2 and 4 are about the real runs and real objects; Table 3 follows the black hole and start you ran in Part 2.
            </PartHeader>
            <OrbitsNearBlackHoleResults
              partOne={partOne}
              farPair={farPair}
              nudgeGuess={nudgeGuess}
              lastSafeGuess={lastSafeGuess}
              farGuess={farGuess}
              partTwo={lastPartTwo}
            />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why. Then it goes through your three guesses one by one, explains the physics step by step
              with numbers from this page, and ends with what to take away. Your answers to the questions are not marked.
            </PartHeader>
            <OrbitsNearBlackHoleTutor
              key={tutorKey}
              predictedNudge={nudgeGuess}
              predictedLastSafe={lastSafeGuess}
              predictedFar={farGuess}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
