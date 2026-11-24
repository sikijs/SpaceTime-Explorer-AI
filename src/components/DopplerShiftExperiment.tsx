import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runSky } from '../physics/aberration'
import { DEFAULT_SOURCE_NM, runDoppler } from '../physics/dopplerShift'
import type { ColorSide } from '../physics/dopplerShift'
import { DopplerShiftTutor } from './DopplerShiftTutor'
import { DopplerShiftIntroduction, DopplerShiftLinks, FORMULA_ENTRIES, PART_ONE_SPEED, REFERENCE_ENTRIES } from './DopplerShiftIntro'
import { SkyCaption } from './DopplerShiftCaption'
import { CountsTable, DopplerShiftResults, SIDE_WORDS, SevenStarTable } from './DopplerShiftResults'
import { AHEAD_COLOR, FOLLOW_COLOR, LAB_COLOR, SkyPicture, SpectrumBar, TRAVELER_COLOR, colorOfWavelength } from './DopplerShiftPictures'
import type { BarMark } from './DopplerShiftPictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Spacetime Geometry 8, rebuilt on 2026-11-23 in the four Parts (CLAUDE.md §14 "The Page in Four Parts"), from the audit wording in
// docs/audit/spacetime-geometry/08-draft-wording.md (approved by the owner on 2026-11-23, §28.1). Part 1 is fixed on 0.6c: the learner's two guesses (the color of the star straight ahead
// and of the star the lab sees sideways) are drawn in white on the spectrum bar, beside the real marks. The guesses lock at Run; Start over clears them. Parts 2 to 4 appear when the first
// run has finished: Part 2 holds the speed buttons (they change the drawings, not the guesses), Part 3 the results and Part 4 the tutor. Every number shown comes from the physics module
// (`runDoppler`, `guessMarkWavelength`, `dopplerCheckUpRows`, CLAUDE.md §9); the pictures are built in stages and the playback speed does not change any result (§11).

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

const CHOICES: { value: ColorSide; label: string }[] = [
  { value: 'bluer', label: 'Bluer' },
  { value: 'same', label: 'The same color' },
  { value: 'redder', label: 'Redder' },
]

const ANIMATION_DURATION_MS = 9000
const STARS_DONE_AT = 0.85
// The traveler's sky is built in 13 steps: the star the lab sees at 15k degrees and its mirror image below the line of travel.
const STEP_COUNT = 13
const STARS_ON_RING = 24

const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'

const smallNote: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }
const hint: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }
const buttonStyle: CSSProperties = { marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const pictureTitle: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.75rem' }

type PlayStatus = 'idle' | 'running' | 'complete'

// Runs one playback of the staged pictures: progress goes from 0 to 1 over a fixed real time (the physics does not depend on it). `onFinish` is called once at the end.
function usePlayback(status: PlayStatus, setStatus: (s: PlayStatus) => void, setProgress: (p: number) => void, onFinish?: () => void) {
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        onFinish?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}

// What the pictures show at one moment of a run: how many of the 13 build-up steps are drawn, and whether the bar's marks, the wedge counts and the crossing lines are shown.
export function stageOf(status: PlayStatus, progress: number) {
  const idle = status === 'idle'
  const stepsShown = idle ? 0 : Math.min(STEP_COUNT, Math.floor((progress / STARS_DONE_AT) * STEP_COUNT) + 1)
  const showMarks = status === 'complete' || (!idle && progress >= STARS_DONE_AT)
  return { idle, stepsShown, showMarks }
}

// The two skies, the spectrum bar and the caption for one speed. `guesses` draws the learner's white marks on the bar (Part 1 only); `own` is Part 2's copy, which has no guess marks.
export function SkyPair({ speed, status, progress, guesses, own = false }: { speed: number; status: PlayStatus; progress: number; guesses: { ahead: ColorSide; sideways: ColorSide } | null; own?: boolean }) {
  const sky = runSky(speed)
  const doppler = runDoppler(speed)
  const prefix = own ? 'own-' : ''
  const { idle, stepsShown, showMarks } = stageOf(status, progress)
  const labColor = colorOfWavelength(DEFAULT_SOURCE_NM)
  const labStars = sky.stars.map((star) => ({ angle: star.labAngle, fill: labColor, range: 'visible' as const }))
  const stepOf = (index: number) => Math.min(index, STARS_ON_RING - index)
  const travelerStars = idle
    ? null
    : doppler.stars.map((star, index) =>
        stepOf(index) < stepsShown ? { angle: star.travelerAngle, fill: star.range === 'visible' ? colorOfWavelength(star.wavelengthNm) : null, range: star.range } : null,
      )
  const barMarks: BarMark[] = showMarks
    ? [
        { label: 'straight ahead', star: doppler.stars[0], color: AHEAD_COLOR, dash: '4 3' },
        { label: 'the star we follow', star: doppler.stars[6], color: FOLLOW_COLOR },
        { label: 'straight behind', star: doppler.stars[12], color: TRAVELER_COLOR },
      ]
    : []
  const marksDrawn = !own && guesses !== null && showMarks
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <SkyPicture
            title="The lab’s sky"
            color={LAB_COLOR}
            stars={labStars}
            showWedges
            followAngle={90}
            frontCount={sky.countsLab.within30OfAhead}
            backCount={sky.countsLab.within30OfBehind}
            idSuffix={`${prefix}lab`}
          />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <SkyPicture
            title="The traveler’s sky"
            color={TRAVELER_COLOR}
            stars={travelerStars}
            showWedges={showMarks}
            followAngle={sky.sidewaysStarTravelerAngle}
            crossingAngle={showMarks ? doppler.travelerCrossingAngle : null}
            frontCount={sky.countsTraveler.within30OfAhead}
            backCount={sky.countsTraveler.within30OfBehind}
            idSuffix={`${prefix}traveler`}
          />
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <SpectrumBar
          labNm={DEFAULT_SOURCE_NM}
          marks={barMarks}
          guesses={
            marksDrawn && guesses
              ? [
                  { label: 'YOUR GUESS 1: the star straight ahead', side: guesses.ahead },
                  { label: 'YOUR GUESS 2: the star we follow', side: guesses.sideways },
                ]
              : []
          }
        />
        {!own && guesses !== null && !showMarks && (
          <p style={{ ...smallNote, fontWeight: 'bold' }}>Your two white guess marks appear under the bar, with the real marks, when the traveler’s sky has been drawn.</p>
        )}
      </div>
      {!own && <SkyCaption speed={speed} stepsShown={stepsShown} showMarks={showMarks} complete={status === 'complete'} marksDrawn={marksDrawn} />}
    </>
  )
}

interface DopplerShiftExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function DopplerShiftExperiment({ onComplete, onTutorComplete }: DopplerShiftExperimentProps) {
  // ---- Part 1: two guesses, one fixed run (0.6c) ----
  const [guessAhead, setGuessAhead] = useState<ColorSide | null>(null)
  const [guessSideways, setGuessSideways] = useState<ColorSide | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)
  // ---- Part 2: the learner's own speed ----
  const [ownSpeed, setOwnSpeed] = useState(PART_ONE_SPEED)
  const [shownSpeed, setShownSpeed] = useState<number | null>(null)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)

  usePlayback(status, setStatus, setProgress, onComplete)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  const bothGuessed = guessAhead !== null && guessSideways !== null
  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (guessAhead === null && guessSideways === null && status === 'idle' && shownSpeed === null) || playing

  const handleRun = () => {
    if (!bothGuessed || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears both guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    if (playing) return
    setGuessAhead(null)
    setGuessSideways(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setOwnSpeed(PART_ONE_SPEED)
    setShownSpeed(null)
    setOwnStatus('idle')
    setOwnProgress(0)
    setResetCount((n) => n + 1)
  }
  const chooseOwnSpeed = (value: number) => {
    setOwnSpeed(value)
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setShownSpeed(ownSpeed)
    setOwnProgress(0)
    setOwnStatus('running')
  }
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const
  const guesses = bothGuessed ? { ahead: guessAhead, sideways: guessSideways } : null

  const questions = [
    {
      title: 'Prediction 1: the star straight ahead',
      text: (
        <>
          Every star sends out the same color of light. The traveler flies through the middle of the ring at <strong>{PART_ONE_SPEED}c</strong>. The star straight ahead of the traveler is the
          one the traveler is flying toward. Compared with the lab’s view of that star, does the traveler see its light bluer, the same color, or redder? You are not graded, and a guess is
          fine.
        </>
      ),
      value: guessAhead,
      set: setGuessAhead,
    },
    {
      title: 'Prediction 2: the star the lab sees sideways',
      text: (
        <>
          Now take the star that the lab sees exactly sideways: it is neither ahead of the traveler’s path nor behind it. Does the traveler see its light bluer, the same color, or redder than
          the lab sees it? You are not graded, and a guess is fine.
        </>
      ),
      value: guessSideways,
      set: setGuessSideways,
    },
  ]

  return (
    <div>
      <h2>Experiment 8 — Does Your Motion Change the Color of Starlight?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <DopplerShiftIntroduction />

        <ReferencePanel entries={partOneDone ? [...REFERENCE_ENTRIES, ...FORMULA_ENTRIES] : REFERENCE_ENTRIES} />

        <DopplerShiftLinks />

        {/* ===== Part 1: predict, then watch ===== */}
        <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
          A traveler flies through the middle of a ring of stars at 0.6c, and every star sends out the same single color. You will predict the color the traveler measures for two of the stars,
          press Run, and watch the traveler’s sky being drawn. Your guesses are drawn on the real picture in white. They never change it.
        </PartHeader>

        {questions.map((question) => (
          <div key={question.title} style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{question.title}</p>
            <p style={hint}>{question.text}</p>
            <div>
              {CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  disabled={locked}
                  onClick={() => question.set(choice.value)}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={buttonStyle}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={smallNote}>{question.value !== null ? `Your prediction: ${SIDE_WORDS[question.value]}.` : 'Choose an option to continue.'}</p>
          </div>
        ))}
        {locked && <p style={smallNote}>Your predictions are locked while you try other settings. To change them, press Start over.</p>}

        <button type="button" className="action-button" onClick={handleRun} disabled={!bothGuessed || locked} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
        >
          Start over
        </button>
        {!bothGuessed && !locked && <p style={smallNote}>Answer both predictions above to run the experiment.</p>}

        <p style={pictureTitle}>
          The lab’s sky, the traveler’s sky and the spectrum bar, for a traveler flying at {PART_ONE_SPEED}c. Both skies are drawn on the same scale.
        </p>
        <SkyPair speed={PART_ONE_SPEED} status={status} progress={progress} guesses={guesses} />

        {/* ===== Parts 2 to 4: appear when the first Run has finished ===== */}
        {partOneDone && guesses !== null && (
          <>
            <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
              You choose how fast the traveler flies and press Run these settings. These choices change the drawings. Your guesses do not, and they stay locked while you try other speeds. The
              speeds are trial values for an imagined traveler. They do not say that any real spaceship can fly like that.
            </PartHeader>
            <div style={{ ...pinkFrame, marginBottom: '1rem' }}>
              <p style={{ ...hint, marginBottom: '0.5rem' }}>
                These buttons change the drawings and the tables below. Your guesses do not. They are locked, and they are drawn on Part 1’s spectrum bar only. These speeds are trial values for an
                imagined traveler, and they do not say that a real spaceship can fly like that. The check-up table in Part 3 says “the same” for every speed, because the physics agrees with
                itself at every speed: change the speed to see the numbers move, not the readings.
              </p>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The traveler’s speed</label>
              <p style={hint}>As a fraction of the speed of light, c. For example, 0.9c is nine tenths of the speed of light.</p>
              <div>
                {SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwnSpeed(value)}
                    className={`toggle-button${ownSpeed === value ? ' is-selected' : ''}`}
                    style={buttonStyle}
                  >
                    {value}c
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
              {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
            </button>
            {(ownStatus === 'idle' || shownSpeed === null) && (
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
                Choose a speed, then press Run these settings. The two skies, the spectrum bar and the tables for your speed appear here.
              </p>
            )}
            {shownSpeed !== null && ownStatus !== 'idle' && (
              <div style={{ ...pinkFrame, marginTop: '1rem' }}>
                <p style={pictureTitle}>Your own speed: the lab’s sky, the traveler’s sky and the spectrum bar at {shownSpeed}c. These pictures are read the same way as in Part 1.</p>
                <SkyPair speed={shownSpeed} status={ownStatus} progress={ownProgress} guesses={null} own />
                {ownStatus === 'complete' && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>The seven stars at {shownSpeed}c</p>
                    <SevenStarTable speed={shownSpeed} />
                    <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 'bold' }}>The counts and the crossing at {shownSpeed}c</p>
                    <CountsTable speed={shownSpeed} />
                    <p style={smallNote}>
                      These numbers are for your own speed. They are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that. They do not change Part
                      3’s tables, which are for Part 1’s run at {PART_ONE_SPEED}c.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ===== Part 3: the results of Part 1's run ===== */}
            <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
              Here are the numbers behind the pictures, a check-up of this page against its own physics and against Einstein’s published formula, and your guesses beside the real results. The
              tables never change with your guesses or with the speeds you tried in Part 2.
            </PartHeader>
            <DopplerShiftResults speed={PART_ONE_SPEED} predictedAhead={guesses.ahead} predictedSideways={guesses.sideways} />

            {/* ===== Part 4: the tutor ===== */}
            <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
              The tutor asks you three questions, one at a time, about what you saw and how your guesses compare with the pictures, and then goes through the explanation, with drawings.
            </PartHeader>
            <DopplerShiftTutor
              key={resetCount}
              speed={PART_ONE_SPEED}
              predictedAhead={guesses.ahead}
              predictedSideways={guesses.sideways}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
