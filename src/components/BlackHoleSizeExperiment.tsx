import { useEffect, useRef, useState } from 'react'
import {
  MIN_RADIUS_IN_HORIZON_RADII,
  OBJECT_PRESETS,
  SUN_RADIUS_GUESS_KM,
  compareHorizonsOfSunAndThousandSuns,
  guessedLargeHorizonKm,
  horizonRadiusKm,
  runBlackHoleSizeExperiment,
  runPartOneSqueeze,
} from '../physics/blackHoleSizeExperiment'
import type { BlackHoleSizeResult, MassScalingGuess, ObjectPreset, SunRadiusGuess } from '../physics/blackHoleSizeExperiment'
import { BlackHoleGuide } from './BlackHoleGuide'
import { BlackHoleSizeIntro, BlackHoleRecentNews, BlackHoleSizeLinks, BlackHoleSizeWords } from './BlackHoleSizeIntro'
import {
  BallPicture,
  HorizonBarsPicture,
  PartOneCaption,
  PartTwoCaption,
  RulerPicture,
  formatLength,
  formatMass,
  formatNumber,
} from './BlackHoleSizePictures'
import { BlackHoleSizeResults, massScalingGuessLabels, sunRadiusGuessLabels } from './BlackHoleSizeResults'
import { BlackHoleSizeTutor } from './BlackHoleSizeTutor'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, WhereFrom, smallNote } from './TidalEffectExperiment'

interface BlackHoleSizeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 4000

const sunRadiusGuessOrder: SunRadiusGuess[] = ['about-6000-km', 'about-30-km', 'about-3-km']
const massScalingGuessOrder: MassScalingGuess[] = ['ten', 'thousand', 'million']

type RunStatus = 'idle' | 'running' | 'complete'

// One squeeze animation: idle, running (progress 0 to 1 over a fixed time), complete.
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

const GUESS_LABEL_SHORT: Record<SunRadiusGuess, string> = {
  'about-6000-km': 'about 6,000 km',
  'about-30-km': 'about 30 km',
  'about-3-km': 'about 3 km',
}

const MASS_LABEL_SHORT: Record<MassScalingGuess, string> = {
  ten: 'about 10 times wider',
  thousand: 'about 1,000 times wider',
  million: 'about a million times wider',
}

export function BlackHoleSizeExperiment({ onComplete, onTutorComplete }: BlackHoleSizeExperimentProps) {
  // ---- the guesses (Part 1) ----
  const [sunGuess, setSunGuess] = useState<SunRadiusGuess | null>(null)
  const [massGuess, setMassGuess] = useState<MassScalingGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = sunGuess !== null && massGuess !== null

  // ---- Part 1: the real Sun, squeezed to its horizon radius ----
  const partOne = runPartOneSqueeze()
  const run1 = useSqueezeRun(() => onComplete?.())
  const part1Done = run1.status === 'complete'

  // ---- Part 2: the learner's own object and radius ----
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('sun')
  const preset = OBJECT_PRESETS.find((p) => p.id === presetId)!
  const horizonKm = horizonRadiusKm(preset.massSolarMasses)
  const startKm = preset.realRadiusKm ?? horizonKm * 100
  const minKm = horizonKm * MIN_RADIUS_IN_HORIZON_RADII
  const [chosenRadiusKm, setChosenRadiusKm] = useState(horizonRadiusKm(1) * 10)
  const [lastPartTwo, setLastPartTwo] = useState<BlackHoleSizeResult | null>(null)
  const result2 = runBlackHoleSizeExperiment(presetId, chosenRadiusKm)
  const run2 = useSqueezeRun(() => {
    setLastPartTwo(runBlackHoleSizeExperiment(presetId, chosenRadiusKm))
    onComplete?.()
  })
  const isRunning = run1.status === 'running' || run2.status === 'running'

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    setLocked(true)
    run1.start()
  }

  const handlePresetChange = (id: ObjectPreset['id']) => {
    const next = OBJECT_PRESETS.find((p) => p.id === id)!
    setPresetId(id)
    setChosenRadiusKm(horizonRadiusKm(next.massSolarMasses) * 10)
    run2.reset()
  }

  const handleRadiusChange = (radiusKm: number) => {
    setChosenRadiusKm(radiusKm)
    run2.reset()
  }

  const handleRunPartTwo = () => {
    if (isRunning) return
    run2.start()
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const [tutorKey, setTutorKey] = useState(0)
  const [tutorExplained, setTutorExplained] = useState(false)
  const handleStartOver = () => {
    setSunGuess(null)
    setMassGuess(null)
    setLocked(false)
    run1.reset()
    run2.reset()
    setPresetId('sun')
    setChosenRadiusKm(horizonRadiusKm(1) * 10)
    setLastPartTwo(null)
    setTutorKey((k) => k + 1)
    setTutorExplained(false)
  }
  const startOverDisabled = (sunGuess === null && massGuess === null && !locked) || isRunning

  // ---- Part 1 picture: the Sun's marker follows the model's own squeeze curve ----
  const curve1 = partOne.curve
  const marker1Km = run1.status === 'idle' ? partOne.startRadiusKm : curve1[Math.round(run1.progress * (curve1.length - 1))].radiusKm
  const comparison = compareHorizonsOfSunAndThousandSuns()

  // ---- Part 2 picture ----
  const curve2 = result2.curve
  const marker2Km = run2.status === 'idle' ? result2.startRadiusKm : curve2[Math.round(run2.progress * (curve2.length - 1))].radiusKm
  const markerIsBlackHole2 = marker2Km <= horizonKm

  const squeezePresets = [
    { label: preset.realRadiusKm === null ? 'Hypothetical start' : 'Real size', radiusKm: startKm },
    { label: '10 times the horizon radius', radiusKm: horizonKm * 10 },
    { label: 'Exactly the horizon radius', radiusKm: horizonKm },
    { label: 'Half the horizon radius', radiusKm: horizonKm * 0.5 },
  ]
  const isPresetSelected = (radiusKm: number) => Math.abs(Math.log(radiusKm / chosenRadiusKm)) < 1e-9
  const logMin = Math.log10(minKm)
  const logMax = Math.log10(startKm)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 1: How Small Must Something Be to Become a Black Hole?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the news, the links and the words ===== */}
        <BlackHoleSizeIntro />
        <BlackHoleRecentNews />
        <BlackHoleSizeLinks />
        <BlackHoleSizeWords afterRun={part1Done} />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You make two guesses about the real Sun. Then you press Run and watch the Sun being squeezed on a ruler of sizes. Your guesses never
          change what you see. After the run they are drawn on the real pictures in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your guesses</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            To turn the Sun into a black hole, you would have to squeeze all of its mass into a ball of what radius? (The Sun’s radius today is
            about 695,700 km.)
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {sunRadiusGuessOrder.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSunGuess(value)}
                disabled={locked || isRunning}
                className={`toggle-button${sunGuess === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {sunRadiusGuessLabels[value]}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A black hole has 1,000 times the mass of another black hole. How much wider is its horizon?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {massScalingGuessOrder.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMassGuess(value)}
                disabled={locked || isRunning}
                className={`toggle-button${massGuess === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {massScalingGuessLabels[value]}
              </button>
            ))}
          </div>

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${sunRadiusGuessLabels[sunGuess!]}; ${massScalingGuessLabels[massGuess!]}.`
              : 'Answer both questions to run.'}
          </p>
          {locked && (
            <p style={smallNote}>Your guesses are locked while you try other settings. To change them, press Start over.</p>
          )}
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllGuesses || isRunning || part1Done}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {run1.status === 'running' ? 'Squeezing...' : part1Done ? 'Run (done)' : 'Run'}
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
              Picture 1 (the ruler) appears here when you press Run. It shows the real Sun, squeezed down to the critical size.
            </p>
          ) : (
            <>
              <RulerPicture
                title="Picture 1: the ruler (the real Sun, squeezed)"
                objectLabel="The Sun"
                horizonKm={partOne.horizonRadiusKm}
                startKm={partOne.startRadiusKm}
                minKm={partOne.horizonRadiusKm * MIN_RADIUS_IN_HORIZON_RADII}
                markerRadiusKm={marker1Km}
                status={run1.status}
                hypotheticalStart={false}
                reserveGuessRow
                guess={part1Done && sunGuess ? { km: SUN_RADIUS_GUESS_KM[sunGuess], label: GUESS_LABEL_SHORT[sunGuess] } : null}
              />
              <WhereFrom>
                <strong>Measured:</strong> the Sun’s radius, 695,700 km (NASA’s Sun Fact Sheet). <strong>Calculated here:</strong> the horizon
                radius, r = 2GM/c², for one Sun. <strong>Imagined for the question:</strong> the squeeze itself; no one can squeeze the Sun. The
                white mark, once it appears, is only your guess.
              </WhereFrom>
              {part1Done ? (
                <>
                  <HorizonBarsPicture
                    smallKm={comparison.smallHorizonKm}
                    largeKm={comparison.largeHorizonKm}
                    guess={massGuess ? { widthKm: guessedLargeHorizonKm(massGuess), label: MASS_LABEL_SHORT[massGuess] } : null}
                  />
                  <WhereFrom>
                    <strong>Calculated here:</strong> both horizon radii, from the same formula. <strong>Measured:</strong> none. No object of exactly
                    1,000 Suns is being measured; 1,000 Suns is an invented pair, chosen so the comparison is easy to read. The white bar is only your
                    guess, drawn on the same scale as the red bars (a marker for your guess).
                  </WhereFrom>
                </>
              ) : (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>Picture 1b (one Sun against 1,000 Suns) appears when the squeeze finishes.</p>
              )}
              <PartOneCaption
                complete={part1Done}
                sunHorizonKm={comparison.smallHorizonKm}
                squeezeFactor={partOne.squeezeNeeded as number}
                largeHorizonKm={comparison.largeHorizonKm}
              />
            </>
          )}
        </Block>

        {/* ===== Parts 2, 3 and 4 appear after the first Run has finished ===== */}
        {!part1Done && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            {run1.status === 'running'
              ? 'The squeeze is running. Part 2 (your own object and radius), Part 3 (the results) and Part 4 (the tutor) appear when it finishes.'
              : 'Make both guesses and press Run. Part 2 (your own object and radius), Part 3 (the results) and Part 4 (the tutor) appear when the first run has finished.'}
          </p>
        )}

        {part1Done && sunGuess && massGuess && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the object and how small to squeeze it. The guesses you made do not change these drawings, but your choices do.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Object:</p>
              {OBJECT_PRESETS.map((p) => (
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
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Squeeze the whole mass into a ball of radius:</p>
              {squeezePresets.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleRadiusChange(s.radiusKm)}
                  disabled={isRunning}
                  className={`toggle-button${isPresetSelected(s.radiusKm) ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {s.label}
                </button>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor="black-hole-size-radius" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Radius: {formatLength(chosenRadiusKm)} ({formatNumber(result2.chosenInHorizonRadii)} horizon radii)
                </label>
                <input
                  id="black-hole-size-radius"
                  type="range"
                  min={logMin}
                  max={logMax}
                  step={0.005}
                  value={Math.log10(chosenRadiusKm)}
                  disabled={isRunning}
                  onChange={(event) => handleRadiusChange(10 ** Number(event.target.value))}
                  style={{ width: '100%' }}
                />
                <p style={{ ...smallNote, margin: '0.25rem 0 0 0' }}>
                  The slider is logarithmic: each step to the left makes the radius a fixed number of times smaller.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="action-button"
              onClick={handleRunPartTwo}
              disabled={isRunning}
              style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
            >
              {run2.status === 'running' ? 'Squeezing...' : 'Run your choice'}
            </button>
            <p style={smallNote}>
              Your guesses do not change the drawings or tables, but these settings do. There is no comparison table for the settings: the pictures
              show what changes.
            </p>

            {run2.status !== 'idle' && (
              <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {preset.label}: {formatMass(preset.massSolarMasses)}
                <br />
                Current radius: {formatLength(marker2Km)} &nbsp;|&nbsp; Horizon radius: {formatLength(horizonKm)}
                <br />
                Radius in horizon radii: {formatNumber(marker2Km / horizonKm)} &nbsp;|&nbsp;{' '}
                {markerIsBlackHole2 ? 'It is a black hole.' : 'It is not a black hole.'}
              </p>
            )}

            <Block>
              {run2.status === 'idle' && lastPartTwo === null ? (
                <p style={{ ...smallNote, fontWeight: 'bold' }}>
                  Choose an object and a radius, then press Run your choice. Picture 2 (your ruler) and Picture 3 (the ball) appear here.
                </p>
              ) : (
                <>
                  <RulerPicture
                    title="Picture 2: your ruler (your object, squeezed to your radius)"
                    objectLabel={preset.label}
                    horizonKm={horizonKm}
                    startKm={startKm}
                    minKm={minKm}
                    markerRadiusKm={marker2Km}
                    status={run2.status}
                    hypotheticalStart={preset.realRadiusKm === null}
                    chosenRadiusKm={chosenRadiusKm}
                  />
                  <BallPicture markerRadiusKm={marker2Km} horizonKm={horizonKm} />
                  <WhereFrom>
                    <strong>Measured:</strong> the real sizes of Earth and the Sun (NASA’s fact sheets) and the neutron star (a round 12 km, inside
                    NASA’s NICER range of about 11 to 14 km). <strong>Calculated here:</strong> the horizon radius. <strong>Imagined for the
                    question:</strong> the squeeze, and for the three black holes a <strong>hypothetical</strong> start 100 times the horizon radius.
                  </WhereFrom>
                </>
              )}
              <PartTwoCaption hasRun={lastPartTwo !== null} objectLabel={(lastPartTwo ?? result2).preset.label} />
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              The tables below do not change with your guesses. Table 2 is the real Sun from Part 1 and never changes. Table 3 follows the object and
              radius you ran in Part 2.
            </PartHeader>
            <BlackHoleSizeResults partOne={partOne} sunGuess={sunGuess} massGuess={massGuess} partTwo={lastPartTwo} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              A few questions to help you connect what you saw to the physics, then an explanation that marks your guesses.
            </PartHeader>
            <BlackHoleSizeTutor
              key={tutorKey}
              predictedSunRadius={sunGuess}
              predictedMassScaling={massGuess}
              onExplained={() => {
                setTutorExplained(true)
                onTutorComplete?.()
              }}
            />
            {tutorExplained && <BlackHoleGuide />}
          </>
        )}
      </div>
    </div>
  )
}
