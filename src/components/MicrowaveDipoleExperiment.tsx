import { useEffect, useState } from 'react'
import { PictureOne, PictureThree, PictureTwo, TrialDrawing, pictureOneCaption, pictureThreeCaption, pictureTwoCaption, trialCaption } from './MicrowaveDipolePictures'
import { ABSOLUTE_ZERO_CELSIUS, ANGLE_CHOICES_DEGREES, DIFFERENCE_ANSWER_CHOICES, MEASURED_SPEED_CHOICE, MEASURED_SPEED_KM_S, MICROWAVE_TEMPERATURE_K, SPEED_CHOICES_KM_S, SPEED_ANSWER_CHOICES, SPEED_OF_LIGHT_KM_S, celsiusOfKelvin, speedForChoice } from '../physics/microwaveDipole'

// Evidence and Imagination, Experiment 7 (docs/experiments/evidence-and-imagination/07-the-microwave-dipole.md).
// Steps 2 to 5: the title, the status line, the introduction and the "Want to know more?" note, Part 1's two predictions (five buttons each), the five-stage run with Pictures 1 to 3 (`MicrowaveDipolePictures.tsx`) and (Step 5) Part 2, "Now try it yourself", with its two controls and Drawing A. The results, tutor and chapter summary come in later steps.
// The wording below is Claude's DRAFT of 2026-11-02, for the owner's approval (CLAUDE.md §28.1). Nothing here says how much warmer one direction is than another, that there is a pattern at all, that it comes from motion,
// how fast anything moves, or that a second test disagrees, because the two predictions and the results ask for them (CLAUDE.md §12). The word "dipole" is left out on purpose: defining it would say there is a pattern.
// It is defined where it is first needed, after the run. Every number comes from the physics module (CLAUDE.md §9).

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The glow in its own frame', 'What the moving observer meets', 'The sky as the moving observer measures it', 'How big is it? The measurements', 'A second test, with distant quasars']
const STAGE_LINES = [
  '',
  'Picture 1, Part A, shows the glow as it is in its own frame, with the observer and the direction it is moving.',
  'Part B shows the crests of the waves that reach the observer from straight ahead and from straight behind.',
  'Part C is a map of the whole sky as the observer measures it. The colours are stretched.',
  'Picture 2 puts the real sizes on two rulers. Your two guesses are drawn on them.',
  'Picture 3 shows a second test, with quasars. The sources are listed after the run.',
]

interface MicrowaveDipoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// `onComplete` is called when the run reaches its last stage. `onTutorComplete` is accepted by the chapter shell and used when the tutor is built (a later step).
export function MicrowaveDipoleExperiment({ onComplete }: MicrowaveDipoleExperimentProps) {
  const [differenceGuess, setDifferenceGuess] = useState<string | null>(null)
  const [speedGuess, setSpeedGuess] = useState<string | null>(null)
  const [trialSpeedChoice, setTrialSpeedChoice] = useState<number>(MEASURED_SPEED_CHOICE)
  const [trialAngle, setTrialAngle] = useState<number>(0)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = differenceGuess !== null && speedGuess !== null
  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  const startOver = () => {
    setDifferenceGuess(null)
    setSpeedGuess(null)
    setTrialSpeedChoice(MEASURED_SPEED_CHOICE)
    setTrialAngle(0)
    setStatus('idle')
    setStage(0)
  }
  const average = MICROWAVE_TEMPERATURE_K
  const averageCelsius = celsiusOfKelvin(average)
  // The two scales differ only by the offset (a definition): 0 K is -273.15 °C, so 0 °C is 273.15 K. A room at 20 °C is the third example.
  const freezingKelvin = -ABSOLUTE_ZERO_CELSIUS
  const freezingRounded = Math.round(freezingKelvin)
  const zeroKelvinRounded = -freezingRounded
  const roomRounded = 20 + freezingRounded
  const lightSpeed = Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')
  // Everyday speeds for a sense of scale (unit arithmetic only): a fast car on a motorway at 110 km/h and a passenger jet at 900 km/h, in kilometres per second.
  const carKmS = 110 / 3600
  const jetKmS = 900 / 3600
  const questions = [
    {
      title: 'Prediction 1: how different are the temperatures of the sky in two opposite directions?',
      text: (
        <>
          The microwave glow has an average temperature of {average} K over the whole sky. Now look at two opposite directions: straight ahead along the path the Solar System is taking, and straight behind. About how big is the difference between the temperature of the glow in
          those two directions? The buttons are in kelvin, and each button is ten times bigger than the one before it.
        </>
      ),
      choices: DIFFERENCE_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: differenceGuess,
      set: setDifferenceGuess,
    },
    {
      title: 'Prediction 2: how fast is the Solar System moving relative to the glow?',
      text: (
        <>
          The Solar System is the Sun with the Earth and the other planets. Relative to the glow’s own frame, about how fast is it moving? The buttons are in kilometres per second, and each button is ten times bigger than the one before it. This is a separate guess from
          Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: SPEED_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: speedGuess,
      set: setSpeedGuess,
    },
  ]
  return (
    <div>
      <h2>Experiment 7 — Is the Microwave Sky Equally Warm in Every Direction?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of November 2026: this page covers one result that is Settled and one that is Contested. “Settled” means that it has been tested by real measurements, many times, and scientists no longer doubt it. “Contested” means that careful scientists
            disagree about what the measurements show. These are old tests and a new argument, not a new discovery. The page tells you which is which after you have made your predictions.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Light left over from the very early universe reaches us from every direction in the sky. Our eyes cannot see it, but special telescopes can measure how warm it is. This experiment asks whether that glow is equally warm
            whichever way you look. If it is not, what could the pattern tell us? You will make two predictions, watch how scientists work out the answer from measurements, and see how well that answer has been tested.
          </p>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> In the Cosmology chapter of this site you met the cosmic microwave background: the oldest light there is, set free about 380,000 years after the Big Bang and stretched by the expansion of the universe ever since. Averaged over the whole sky, its temperature is
            now {average} K. This page does not tell you what the temperature looks like in one direction compared with another until you have made your predictions.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>The pieces, in steps.</strong> To follow the question you need a few ideas: what a temperature on the kelvin scale is, why light can have a temperature, what the Doppler shift does to light, how to think about speeds in kilometres per second, and what “the glow’s own frame” means.
          </p>
          <ol style={list}>
            <li>
              <strong>Temperatures in kelvin.</strong> In everyday life we give temperatures in degrees Celsius (°C). Scientists often use another scale, the kelvin scale (K). The two scales are like two rulers that measure the same thing but start at different marks. A step
              is the same size on both. Celsius starts (0 °C) at the temperature at which water freezes. Kelvin starts (0 K) at the coldest temperature there can be. Nothing in the universe can be colder than 0 K.
              <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                <li>The coldest possible temperature is {zeroKelvinRounded} °C. That is 0 K.</li>
                <li>Water freezes at 0 °C. That is {freezingRounded} K.</li>
                <li>To change °C into K, add {freezingRounded}. For example, a room at 20 °C is {roomRounded} K.</li>
              </ul>
              To be exact, the number to add is {freezingKelvin}, and the page rounds it to {freezingRounded} here to keep the idea simple. The average temperature of the glow is {average} K. That is only about {average.toFixed(1)} degrees above the coldest possible
              temperature. In Celsius it is about {Math.round(averageCelsius)} °C, far colder than freezing water. This page gives the glow’s temperatures in kelvin.
            </li>
            <li>
              <strong>Light can have a temperature.</strong> Light travels as waves, and the frequency of light is how many of its waves arrive each second. For visible light, a higher frequency looks bluer and a lower frequency looks redder. Why does something hot give off
              light? Everything is made of atoms, and atoms contain tiny electric charges (the electrons, and the protons in the nucleus). Heat is the jiggling of those atoms. The hotter something is, the faster and harder its atoms jiggle and bump into each other. A charge that is
              shaken sends out waves of light, a little like a stick waggled in a pond sends out ripples. The faster the shaking, the higher the frequency of the waves. So the hotter something is, the higher the frequency of the light it gives off. Every object does this, even a cold one,
              but a cold object’s light has a frequency too low for our eyes to see. For example, when the ring of an electric cooker is just warm you see nothing, then it glows dull red, then orange, and a very hot piece of metal glows white. The microwave background is light that behaves
              like the glow of something very cold, so its waves have a very low frequency, far below red, and our eyes cannot see them. We still say the glow has a temperature, and that temperature is the number the telescopes measure.
            </li>
            <li>
              <strong>The Doppler shift.</strong> In Experiment 8 of the Spacetime Geometry chapter you saw that light can change frequency because of motion. If you move toward a source of light you meet its waves more often, so you measure a higher frequency (bluer light). If you move
              away you meet them less often, so you measure a lower frequency (redder light). This is the Doppler shift. It is the same idea as an ambulance siren that sounds higher as it comes toward you and lower as it drives away.
            </li>
            <li>
              <strong>Speeds in kilometres per second.</strong> Astronomers often give speeds in kilometres per second (km/s). For a sense of scale, a fast car on a motorway, at 110 km/h, moves at about {carKmS.toFixed(2)} km/s, and a passenger jet, at about 900 km/h, at about{' '}
              {jetKmS.toFixed(2)} km/s. Light travels at {lightSpeed} km/s.
            </li>
            <li>
              <strong>“The glow’s own frame”.</strong> In Experiment 2 you learned that a reference frame is the point of view from which you measure things, such as the platform of a railway station or the inside of a moving train. Scientists use as a reference for the microwave
              glow the frame in which the glow’s temperature looks the same in every direction, on average. We call it the glow’s own frame. When this page says how fast something moves “relative to the glow”, it means how fast that thing moves compared with the glow’s own frame, the way a
              train’s speed is measured relative to the platform. This is a convenient reference, not a special place in space and not a “true” state of rest. Nothing you learned in the Relativity chapter changes: every other frame is just as valid.
            </li>
            <li>
              <strong>The questions to hold in mind.</strong> You will be asked to predict how much the temperature of the sky can differ between two opposite directions, and how fast the Solar System is moving relative to the glow. Think about how large you would expect each to be.
            </li>
          </ol>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Cosmic microwave background:</strong> the oldest light there is, left over from the early universe and reaching us from every direction in the sky. Its waves are microwaves, which our eyes cannot see.
            </li>
            <li>
              <strong>Kelvin (K):</strong> the temperature scale that starts at the coldest possible temperature, 0 K, which is {zeroKelvinRounded} °C. One step is the same size as one degree Celsius, and water freezes at {freezingRounded} K.
            </li>
            <li>
              <strong>Frequency:</strong> how many waves of light arrive each second. A higher frequency looks bluer for visible light.
            </li>
            <li>
              <strong>Doppler shift:</strong> the change in the frequency of a wave because the observer and the source are moving toward or away from each other.
            </li>
            <li>
              <strong>km/s:</strong> kilometres per second, a unit of speed.
            </li>
            <li>
              <strong>The glow’s own frame:</strong> the point of view in which the microwave glow looks, on average, equally warm in every direction. Speeds “relative to the glow” are measured from it.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions: one about how much the temperature of the sky can differ between two opposite directions, and one about how fast the Solar System is moving relative to the glow. Then run the experiment in five stages, from the
            sky as one temperature to the real measurements and a second, independent test, then read the results and talk them through with the tutor. Under “Now try it yourself” you can choose a different speed and a different direction to look in.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two settings under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The page’s own calculation is simple. For an observer moving at a chosen speed, it works out the temperature of the glow in each direction, with the same rule for light and motion as Experiment 8. The measured values (the temperatures, the speed and the
            results of the second test) come from published papers and a NASA table and are shown as quoted, and the page says which numbers are calculated and which are quoted. The page looks at one pattern in the glow only, and leaves out the glow’s much smaller
            ripples, which Cosmology Experiments 3 and 4 touch on. It does not explain what makes anything move.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> This page was written as of November 2026. The papers behind the measurements and a NASA page that lists them are given after the run, because they give away what the measurements found. Links open in a new tab.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA or another official source was found that explains this without either leaving the idea out or giving the answers to the questions in this experiment, so this page explains the idea in its own words, and the pages that give the answers are
            listed after the run.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and then run the experiment. The pictures that the run will draw show fixed things: numbers calculated here, set beside published measurements. They are the same
            for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares. The real pictures stay the same whatever you guess.
          </p>

          {questions.map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</div>
              <div>
                {question.choices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => question.set(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null ? `Your prediction: ${question.choices.find((c) => c.value === question.value)?.label}.` : 'Choose an option to continue'}
              </p>
            </div>
          ))}

          <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || recorded} style={{ padding: '0.6rem 1.5rem' }}>
            Run
          </button>
          {recorded && (
            <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
              Start over
            </button>
          )}
          {!bothPredicted && !recorded && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>}
          {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
          <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong> {done ? 'Pictures 1 to 3 are drawn. Your predictions are recorded and not marked here.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {recorded && stage >= 1 && (
            <div>
              <PictureOne stage={Math.min(stage, 3)} />
              {pictureOneCaption(Math.min(stage, 3))}
              {stage >= 4 && (
                <>
                  <PictureTwo differenceGuessId={differenceGuess} speedGuessId={speedGuess} />
                  {pictureTwoCaption()}
                </>
              )}
              {stage >= 5 && (
                <>
                  <PictureThree />
                  {pictureThreeCaption()}
                </>
              )}
            </div>
          )}

          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> In the pictures above, the Solar System moved at the measured speed, {MEASURED_SPEED_KM_S} km/s, and you looked at the sky straight ahead and straight behind. Here you can try other values. You choose two things:
              </p>
              <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>A speed</strong>: how fast the observer moves relative to the glow. The value used in Part 1 is the measured speed, {MEASURED_SPEED_KM_S} km/s (the 370 km/s button).
                </li>
                <li>
                  <strong>A direction</strong>: which way you look, as an angle from straight ahead. 0° is straight ahead, 90° is sideways and 180° is straight behind.
                </li>
              </ol>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>One drawing then shows, for your choices:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The whole sky</strong> as a dartboard-style disk, with the direction you chose marked on it.
                </li>
                <li>
                  <strong>The temperatures</strong> straight ahead and straight behind, their difference, and the temperature in the direction you chose.
                </li>
                <li>
                  <strong>A ruler</strong> that sets your trial’s difference beside the real difference (in cyan). <strong>Your trial</strong> is drawn in pink, because it is imagined for the question.
                </li>
              </ul>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Your guesses do not change the drawings or tables, but these two settings do.</strong> They change only Drawing A. The pictures above stay the same. These are trial values, your own numbers, and not measurements: they do not say the real Solar System moves like that.
              </p>

              <div style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>A speed relative to the glow</label>
                {SPEED_CHOICES_KM_S.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTrialSpeedChoice(v)}
                    className={`toggle-button${trialSpeedChoice === v ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {v.toLocaleString('en-US')} km/s{v === MEASURED_SPEED_CHOICE ? ' (the measured speed)' : ''}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>A direction to look in</label>
                {ANGLE_CHOICES_DEGREES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setTrialAngle(a)}
                    className={`toggle-button${trialAngle === a ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {a}°{a === 0 ? ' (straight ahead)' : a === 90 ? ' (sideways)' : a === 180 ? ' (straight behind)' : ''}
                  </button>
                ))}
              </div>
              <TrialDrawing speedKmS={speedForChoice(trialSpeedChoice)} angleDegrees={trialAngle} />
              {trialCaption(speedForChoice(trialSpeedChoice), trialAngle)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
