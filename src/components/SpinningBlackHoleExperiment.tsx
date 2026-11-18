import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  PART_ONE_PRESET_ID,
  PART_ONE_SPIN,
  markGuesses,
  runSpinningBlackHoleExperiment,
} from '../physics/spinningBlackHoleExperiment'
import type { EdgeAnswer, EnergyAnswer, HorizonAnswer, SpinningBlackHoleResult } from '../physics/spinningBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { GuessNotes, SpinningBlackHoleHeldBackLinks, SpinningBlackHoleIntro, SpinningBlackHoleLinks, spinningBlackHoleWordsEntries } from './SpinningBlackHoleIntro'
import {
  AGAINST_QUESTION,
  EDGE_CHOICES,
  ENERGY_CHOICES,
  ENERGY_QUESTION,
  HORIZON_CHOICES,
  HORIZON_QUESTION,
  WITH_QUESTION,
  edgeLabel,
  energyLabel,
  horizonLabel,
} from './SpinningBlackHoleChoices'
import {
  EdgesCaption,
  EdgesGraph,
  EnergyCaption,
  EnergyPicture,
  MapCaption,
  SafeOrbitMap,
  formatDistance,
  formatMass,
  formatPercent,
  formatRadii,
  pointAt,
} from './SpinningBlackHolePictures'
import { SpinningBlackHoleResults } from './SpinningBlackHoleResults'
import { SpinningBlackHoleTutor } from './SpinningBlackHoleTutor'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface SpinningBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The black hole is "spun up" from 0 to the
// chosen spin over this time.
const ANIMATION_DURATION_MS = 10_000

const DEFAULT_PRESET_ID: ObjectPreset['id'] = PART_ONE_PRESET_ID
const DEFAULT_SPIN = PART_ONE_SPIN
const SPIN_PRESETS = [0, 0.5, 0.9, 0.99]

type RunStatus = 'idle' | 'running' | 'complete'

// One run of the spin-up: idle, running (progress 0 to 1 over a fixed time), complete.
function useSpinRun(onDone: () => void) {
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

export function SpinningBlackHoleExperiment({ onComplete, onTutorComplete }: SpinningBlackHoleExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [withGuess, setWithGuess] = useState<EdgeAnswer | null>(null)
  const [againstGuess, setAgainstGuess] = useState<EdgeAnswer | null>(null)
  const [horizonGuess, setHorizonGuess] = useState<HorizonAnswer | null>(null)
  const [energyGuess, setEnergyGuess] = useState<EnergyAnswer | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = withGuess !== null && againstGuess !== null && horizonGuess !== null && energyGuess !== null

  // ---- Part 1: the 10-Sun black hole, spun up to 0.9, played by one Run ----
  const partOne = useMemo(() => runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, PART_ONE_SPIN), [])
  const run1 = useSpinRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own black hole and spin ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>(DEFAULT_PRESET_ID)
  const [spin, setSpin] = useState(DEFAULT_SPIN)
  const [lastPartTwo, setLastPartTwo] = useState<SpinningBlackHoleResult | null>(null)
  const result2 = useMemo(() => runSpinningBlackHoleExperiment(presetId, spin), [presetId, spin])
  const run2 = useSpinRun(() => {
    setLastPartTwo(runSpinningBlackHoleExperiment(presetId, spin))
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
  const handleSpinChange = (value: number) => {
    setSpin(value)
    run2.reset()
  }
  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const handleStartOver = () => {
    setWithGuess(null)
    setAgainstGuess(null)
    setHorizonGuess(null)
    setEnergyGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId(DEFAULT_PRESET_ID)
    setSpin(DEFAULT_SPIN)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
  }
  const hasAnyGuess = withGuess !== null || againstGuess !== null || horizonGuess !== null || energyGuess !== null
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
  const now2 = pointAt(result2, run2.progress)
  const km2 = result2.referenceRadiusKm
  const guesses = part1Done && withGuess && againstGuess && horizonGuess ? { with: withGuess, against: againstGuess, horizon: horizonGuess } : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 8: Spinning Black Holes: Does Spin Change Where Orbits Are Safe?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <SpinningBlackHoleIntro />
        <ReferencePanel entries={spinningBlackHoleWordsEntries(part1Done)} />
        <SpinningBlackHoleLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make four guesses, then watch a black hole of 10 Suns spin up from 0 to {PART_ONE_SPIN}. Press Run and watch three pictures fill in: a map seen from above, a graph, and an energy picture. The real pictures and tables never change with your guesses. Your guesses are drawn on them in white once the
          run has finished, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are four questions. Choose one answer to each. Once you press Run, your four guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{WITH_QUESTION}</p>
          <GuessNotes n={1} />
          {guessButtons(EDGE_CHOICES, withGuess, setWithGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{AGAINST_QUESTION}</p>
          <GuessNotes n={2} />
          {guessButtons(EDGE_CHOICES, againstGuess, setAgainstGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{HORIZON_QUESTION}</p>
          <GuessNotes n={3} />
          {guessButtons(HORIZON_CHOICES, horizonGuess, setHorizonGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{ENERGY_QUESTION}</p>
          <GuessNotes n={4} />
          {guessButtons(ENERGY_CHOICES, energyGuess, setEnergyGuess)}

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${edgeLabel(withGuess!)}; ${edgeLabel(againstGuess!)}; ${horizonLabel(horizonGuess!)}; ${energyLabel(energyGuess!)}.`
              : 'Answer all four questions to run.'}
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
              Pictures 1, 2 and 3 appear here when you press Run: the map of the safe orbits, the graph of how the edges move as the spin grows, and the energy a probe gives up. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 1: the map</p>
              <SafeOrbitMap result={partOne} progress={run1.progress} guesses={guesses} />
              <WhereFrom>
                <strong>Calculated here:</strong> every ring, from the standard equations for a spinning black hole (given, not derived; the original papers were not read for this page). <strong>Measured:</strong> nothing: no probe has circled a real black hole. <strong>Imagined for the question:</strong> the probe, and the spin-up from 0 to {PART_ONE_SPIN} (a real black hole’s spin
                does not change during a run). The white marks are your guesses and show where your answer belongs, not a number you chose.
              </WhereFrom>
              <MapCaption result={partOne} number={1} complete={part1Done} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 2: how the edges move as the spin grows</p>
              <EdgesGraph result={partOne} progress={run1.progress} guesses={guesses} />
              <WhereFrom>
                <strong>Calculated here:</strong> the lines, from the same equations. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the probe and the spin-up. The white marks are your guesses and show where your answer belongs, not a size you chose.
              </WhereFrom>
              <EdgesCaption result={partOne} number={2} complete={part1Done} withGuesses />

              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 3: the energy given up on the way down</p>
              <EnergyPicture result={partOne} progress={run1.progress} guess={part1Done ? energyGuess : null} />
              <WhereFrom>
                <strong>Calculated here:</strong> the bars and the curves, from the given orbit-energy equation, for a probe that descends gradually through safe circular orbits. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the probe. The white outline is your guess and shows which
                answer you gave, not a size you chose.
              </WhereFrom>
              <EnergyCaption result={partOne} number={3} complete={part1Done} withGuesses />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The black hole is spinning up. Part 2 (your own black hole and spin), Part 3 (the results) and Part 4 (the tutor) appear when the run finishes.'
              : 'Make all four guesses and press Run. Part 2 (your own black hole and spin), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && withGuess && againstGuess && horizonGuess && energyGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the black hole and the spin, run it as often as you like, and compare. The guesses you made stay as they were. They do not change any picture or table; these settings do.
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
                <strong>2. Spin the black hole up to this spin</strong> (0 is not spinning; the fastest possible spin is 1, which no black hole quite reaches):
              </p>
              {SPIN_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpinChange(s)}
                  disabled={isRunning}
                  className={`toggle-button${spin === s ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {s}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>3. Run it:</strong>
            </p>
            <button type="button" className="action-button" onClick={handleRunPartTwo} disabled={isRunning} style={{ marginTop: '0.25rem', padding: '0.6rem 1.5rem' }}>
              {run2.status === 'running' ? 'Running...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings. The black hole you pick changes the kilometers, and the spin changes the rings, the lines and the bars.
            </p>

            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px solid var(--border-color, #ccc)', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>Your settings</strong>
              </p>
              <p style={{ margin: 0 }}>
                {result2.preset.label}: {formatMass(result2.preset.massSolarMasses)}. One reference radius (the horizon radius it would have with no spin) is {formatDistance(km2)}.
                <br />
                {run2.status === 'idle'
                  ? `Chosen spin: ${result2.spin}.`
                  : `Spin now ${now2.spin.toFixed(2)}, of ${result2.spin} chosen. Horizon ${formatRadii(now2.horizon)} reference radii. Last safe orbit circling with the spin ${formatRadii(now2.lastSafeWith)}, against the spin ${formatRadii(now2.lastSafeAgainst)}. Energy given up on the way down: ${formatPercent(now2.energyReleasedWith)} with the spin, ${formatPercent(now2.energyReleasedAgainst)} against it.`}
              </p>
            </div>

            <Block>
              {!showOwnPictures ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a spin, then press Run your choice. Pictures 4, 5 and 6, each with its own caption, appear here.</p>
              ) : (
                <>
                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Picture 4: the map, for your settings</p>
                  <SafeOrbitMap result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> every ring, in the same way as in Part 1, for your settings. <strong>Measured:</strong> nothing in the drawing (the masses of the black holes come from Black Holes 1). <strong>Imagined for the question:</strong> the probe and the spin-up.
                  </WhereFrom>
                  <MapCaption result={result2} number={4} complete={own.complete} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 5: how the edges move as the spin grows, for your settings</p>
                  <EdgesGraph result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the lines, from the same equations. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the probe and the spin-up.
                  </WhereFrom>
                  <EdgesCaption result={result2} number={5} complete={own.complete} />

                  <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Picture 6: the energy given up on the way down, for your settings</p>
                  <EnergyPicture result={result2} progress={run2.progress} />
                  <WhereFrom>
                    <strong>Calculated here:</strong> the bars and the curves, from the given orbit-energy equation. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the probe.
                  </WhereFrom>
                  <EnergyCaption result={result2} number={6} complete={own.complete} />
                </>
              )}
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and Tables 1, 2 and 4 stay the same however you guess. Table 3 follows the black hole and spin you ran in Part 2.
            </PartHeader>
            <SpinningBlackHoleResults withGuess={withGuess} againstGuess={againstGuess} horizonGuess={horizonGuess} energyGuess={energyGuess} partTwo={lastPartTwo} />
            <SpinningBlackHoleHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your four guesses compare with the pictures, and one question about why the direction matters. Then it goes through your four guesses and explains. The tutor’s questions are not marked.
            </PartHeader>
            <SpinningBlackHoleTutor
              key={tutorKey}
              predictedWith={withGuess}
              predictedAgainst={againstGuess}
              predictedHorizon={horizonGuess}
              predictedEnergy={energyGuess}
              matches={markGuesses(PART_ONE_SPIN, { with: withGuess, against: againstGuess, horizon: horizonGuess, energy: energyGuess })}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
