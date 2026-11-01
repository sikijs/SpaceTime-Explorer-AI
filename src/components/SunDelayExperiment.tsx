import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PictureFour, PictureOne, PictureThree, PictureTwo, pictureFourCaption, pictureOneCaption, pictureThreeCaption, pictureTwoCaption } from './SunDelayPictures'
import {
  ASTRONOMICAL_UNIT_M,
  CASSINI_PRECISION_PPM_JPL,
  DELAY_ANSWER_CHOICES,
  DISTANCE_ANSWER_CHOICES,
  EARTH_DISTANCE_AU,
  TARGET_CHOICES,
  PREDICTION_TWO_FAR_RADII,
  SUN_RADIUS_M,
  earthDistanceM,
  flatRoundTripMinutes,
  lightDistanceInOneMicrosecondM,
  lightTimeSeconds,
  targetDistanceM,
} from '../physics/sunDelay'

// Evidence and Imagination, Experiment 5 (docs/experiments/evidence-and-imagination/05-does-the-sun-slow-light.md).
// Steps 2 to 7 (and the "Why does the Sun add this time?" box under Picture 2): the title, the status line, the introduction, the "Want to know more?" links, the two predictions, the five-stage run with Pictures 1 to 4 (`SunDelayPictures.tsx`) and Part 2, "Now try it yourself", with its two controls and Drawing A, (Step 6) Part 3, the results (`SunDelayResults.tsx`) and (Step 7) Part 4, the tutor (`SunDelayTutor.tsx`). The papers list and the chapter summary come in later steps.
// The wording below is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1). Nothing here says how long the delay is, how it changes with the closest distance, why it happens or how well it has been
// tested, because the two predictions and the results ask for them (CLAUDE.md §12). The papers, and the JPL release on the Cassini test (which states the test's outcome), are listed only after the run (a later step).
// Every number comes from the physics module (CLAUDE.md §9).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The trip with no effect from the Sun', 'The path past the Sun', 'The extra time', 'The extra time and the closest distance', 'The real tests']
const STAGE_LINES = [
  '',
  'Picture 1, Part A, shows the whole round trip to Venus past the Sun’s edge as it would be with no effect from the Sun’s gravity.',
  'Part B sketches the path of the signal past the Sun, and the closest distance.',
  'Picture 2 shows the extra time on a ruler of microseconds. Your first guess is drawn on it.',
  'Picture 3 shows how the extra time changes as the signal passes farther from the Sun. Your second guess is drawn on it.',
  'Picture 4 shows how closely three real tests pinned the delay down. The sources are listed after the run.',
]

interface SunDelayExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function SunDelayExperiment({ onComplete }: SunDelayExperimentProps) {
  const [delayGuess, setDelayGuess] = useState<string | null>(null)
  const [distanceGuess, setDistanceGuess] = useState<string | null>(null)
  const venusAu = TARGET_CHOICES.find((c) => c.id === 'venus')!.distanceAu
  const cassiniPpm = CASSINI_PRECISION_PPM_JPL
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = delayGuess !== null && distanceGuess !== null
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
    setDelayGuess(null)
    setDistanceGuess(null)
    setStatus('idle')
    setStage(0)
  }
  const sunLightSeconds = lightTimeSeconds(ASTRONOMICAL_UNIT_M)
  const sunLightMinutes = sunLightSeconds / 60
  const microsecondMetres = lightDistanceInOneMicrosecondM()
  // Earth to Venus and back along a path that just grazes the Sun's edge: the trip Prediction 1 will describe.
  const venusGrazingMinutes = flatRoundTripMinutes(earthDistanceM(), targetDistanceM('venus'), SUN_RADIUS_M)
  const venusGrazingSeconds = venusGrazingMinutes * 60
  const venusGrazingMicroseconds = venusGrazingSeconds * 1e6
  const farMillionKm = (PREDICTION_TWO_FAR_RADII * SUN_RADIUS_M) / 1e9
  const nearMillionKm = SUN_RADIUS_M / 1e9
  const aboveSurfaceMillionKm = ((PREDICTION_TWO_FAR_RADII - 1) * SUN_RADIUS_M) / 1e9
  const questions = [
    {
      title: 'Prediction 1: how much longer does the trip take?',
      text: (
        <>
          A radio pulse goes from the Earth to Venus, which is on the far side of the Sun, and back. On the way, the signal just touches the Sun’s surface. The surface is 1 solar radius ({nearMillionKm.toFixed(2)} million km) from the Sun’s centre, so this path is 1 solar radius from the centre. With no Sun in the way, the
          round trip would take about {venusGrazingMinutes.toFixed(1)} minutes. The real trip is timed with the Sun’s gravity acting on the signal. About how much longer does the round trip take because of the Sun’s gravity? Remember that one microsecond (µs) is one
          millionth of a second.
        </>
      ),
      choices: DELAY_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: delayGuess,
      set: setDelayGuess,
    },
    {
      title: 'Prediction 2: what if the signal passes farther from the Sun?',
      text: (
        <>
          Now suppose the same trip is made with the signal passing the Sun 10 times farther out: {PREDICTION_TWO_FAR_RADII} solar radii (about {farMillionKm.toFixed(0)} million km) from the Sun’s centre instead of 1. That is {PREDICTION_TWO_FAR_RADII - 1} solar radii (about {aboveSurfaceMillionKm.toFixed(0)} million km) above the Sun’s surface, instead of touching it. The Earth and Venus are where they were. How does the extra
          time caused by the Sun’s gravity compare with your first answer? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: DISTANCE_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: distanceGuess,
      set: setDistanceGuess,
    },
  ]
  return (
    <div>
      <h2>Experiment 5 — How Long Does the Sun’s Gravity Delay a Radio Signal?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled. “Settled” means that it has been tested by real measurements and scientists no longer doubt it. The tests used on this page are old ones, from the 1960s and from 2002. Nothing here is a new result. The page
            shows how the idea has been tested, not a discovery.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A radio signal can be sent from the Earth to a planet or a spacecraft and back, and the time of the round trip can be measured very precisely. Suppose the signal passes close to the Sun on its way. The Sun is by far the
            heaviest thing in the solar system, so its gravity is strong. Does that change how long the round trip takes? If it does, by how much? This experiment is about that question, and about what has actually been measured.
          </p>

          <p style={paragraph}>
            <strong>How a trip is timed.</strong> Think of shouting across a canyon and listening for the echo. Sound goes about 340 metres in a second. If the echo comes back after 2 seconds, the sound has gone there and back, 680 metres in all, so the far wall is
            340 metres away. Radar works the same way, with radio waves instead of sound. A radio pulse is sent out, it bounces off a planet (or is sent back by a spacecraft), and a clock measures the time until it returns. Since the speed of radio waves is known, the
            time tells you the distance. Here the idea is turned around. If the distance is known from other measurements, a change in the round trip time would show that something else is affecting the signal.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>The numbers, in steps.</strong> To see how small an effect would be, it helps to know how long the trip takes.
          </p>
          <ol style={list}>
            <li>
              <strong>How long does light take to cross space?</strong> Radio waves travel at the speed of light, about 300,000 km every second. The Earth is about {Math.round(ASTRONOMICAL_UNIT_M / 1e9)} million km from the Sun (that distance is called 1 astronomical
              unit, or 1 AU). Light takes about {Math.round(sunLightSeconds)} seconds, or {sunLightMinutes.toFixed(1)} minutes, to cover it.
            </li>
            <li>
              <strong>The trip this page asks about.</strong> Venus is on average about {venusAu} AU from the Sun. When Venus is on the far side of the Sun from the Earth, a signal that just skims the Sun’s edge goes about {EARTH_DISTANCE_AU} AU to the Sun and about {venusAu} AU
              beyond it. Going there and back is about 2 × {(EARTH_DISTANCE_AU + venusAu).toFixed(2)} AU. At the speed of light that takes about {venusGrazingMinutes.toFixed(1)} minutes, which is about {Math.round(venusGrazingSeconds).toLocaleString('en-US')} seconds, or about{' '}
              {Math.round(venusGrazingMicroseconds / 1e6).toLocaleString('en-US')} million microseconds. (This is the time with no Sun in the way. It leaves out any effect of the Sun’s gravity, which is what the experiment is about.)
            </li>
            <li>
              <strong>How fine a time can be measured?</strong> A microsecond (µs) is one millionth of a second. In one microsecond light goes about {Math.round(microsecondMetres)} metres, so a time of one microsecond is the same as about{' '}
              {Math.round(microsecondMetres)} metres of extra path. NASA’s description of the Deep Space Network, its worldwide set of giant radio antennas that send signals to spacecraft and listen for their replies, says that its routine ranging, the timing of signals to spacecraft, is precise to about one metre. So very small changes in a trip time can be
              noticed. That is why the question is a real one, and not just a thought.
            </li>
            <li>
              <strong>The question to hold in mind.</strong> You will be asked to predict how large the change is. Keep the size of a trip ({Math.round(venusGrazingSeconds).toLocaleString('en-US')} seconds) next to the size of a microsecond (a millionth of a second).
            </li>
          </ol>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> The Gravity and Curved Spacetime chapter of this site looked at how gravity affects clocks (Experiment 2) and at how the Sun’s gravity bends the path of light (Experiment 8). Gravity there was a property of
            the shape of space and time, which Einstein’s theory of gravity, general relativity, describes. In 1964 the American physicist Irwin Shapiro pointed out that if this is right, it should also affect a radar signal that passes the Sun, and he suggested a way to
            test it. Radar tests were made in the 1960s, and a test with the Cassini spacecraft on its way to Saturn in 2002. They are called the Shapiro delay tests. This page does not give their results until you have made your predictions.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Radio wave:</strong> a kind of light that our eyes cannot see, with a very long wavelength. NASA’s pages describe radio waves as part of the electromagnetic spectrum, the family that also includes visible light. Radio waves travel at the
              speed of light, so a radio signal and a beam of light take the same time to cross the same distance in empty space.
            </li>
            <li>
              <strong>Radar and echo:</strong> radar sends a pulse of radio waves and times its return after it bounces back.
            </li>
            <li>
              <strong>Round trip:</strong> the whole journey there and back. The round trip time is the time from sending the pulse to receiving it again.
            </li>
            <li>
              <strong>c:</strong> the speed of light in empty space, about 300,000 kilometres per second.
            </li>
            <li>
              <strong>Microsecond (µs):</strong> one millionth of a second. Light goes about {Math.round(microsecondMetres)} metres in one microsecond.
            </li>
            <li>
              <strong>Astronomical unit (AU):</strong> a distance used in the solar system, defined as the average distance from the Earth to the Sun. It is about {Math.round(ASTRONOMICAL_UNIT_M / 1e9)} million kilometres, or about 93 million miles.
            </li>
            <li>
              <strong>Solar radius:</strong> the distance from the centre of the Sun to its visible surface, about {(SUN_RADIUS_M / 1000).toLocaleString('en-US')} kilometres. “Skimming the Sun’s edge” means a path that just touches the Sun’s surface, which is one solar radius from the Sun’s centre.
            </li>
            <li>
              <strong>Closest distance:</strong> how near the signal’s path comes to the <em>centre</em> of the Sun, measured in solar radii. It is always measured from the centre, not from the surface. Because the Sun’s surface is 1 solar radius from its centre, a path that just touches the surface has a closest distance of 1 solar radius. A path with a closest distance of {PREDICTION_TWO_FAR_RADII} solar radii passes {PREDICTION_TWO_FAR_RADII - 1} solar radii above the surface. A path that comes close to the Sun has a small closest distance, and a path far from the Sun has a large one.
            </li>
            <li>
              <strong>General relativity:</strong> Einstein’s theory of gravity, from the Gravity and Curved Spacetime chapter. It describes gravity through the shape of space and time.
            </li>
            <li>
              <strong>Parts per million:</strong> a way of saying how precise a measurement is. “{cassiniPpm} parts per million” means {cassiniPpm} in every 1,000,000, or {cassiniPpm / 1e4} percent. It is used when the results are given.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions: one about a radio signal that goes from the Earth past the Sun’s edge to Venus and back, and one about what happens if the signal passes the Sun farther out. Then run the experiment in five stages: the
            trip with no effect from the Sun; the path past the Sun; the extra time; how the extra time changes with the closest distance; and the real tests. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two
            settings: the planet the signal goes to, and how close to the Sun it passes.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two settings under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The page uses a simple model: the signal travels in a straight line from the Earth, past the Sun, to the target and back, with the Earth and the target on opposite sides of the Sun, in circles around it. The distances to
            the planets are round figures (the real orbits are not circles). The model leaves out several things that real measurements had to deal with: the Sun’s hot outer atmosphere, which also affects radio signals, the gravity of the planets, and the motion of
            the Earth and the target while the signal is on its way. The real tests dealt with these more carefully, so the page’s numbers show the idea, not the papers’ full analysis.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the tests, and a NASA release about the Cassini test, are listed after the run, because they give
            away what the tests found.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/ems/05_radiowaves/">NASA: Radio Waves</ExternalLink>: a plain account of what radio waves are.
            </li>
            <li>
              <ExternalLink href="https://ssd.jpl.nasa.gov/glossary/au.html">JPL Solar System Dynamics: au (astronomical unit)</ExternalLink>: a short entry on the astronomical unit.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/ESA_Multimedia/Images/2015/09/Spacetime_curvature">ESA: Spacetime curvature</ExternalLink>: a short caption explaining that general relativity links gravity to the curvature of spacetime.
            </li>
            <li>
              <ExternalLink href="https://www.nasa.gov/directorates/somd/space-communications-navigation-program/what-is-the-deep-space-network/">NASA: What is the Deep Space Network?</ExternalLink>: a short overview of the radio antennas that send signals to spacecraft and listen for their reply.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/learn/basics-of-space-flight/chapter18-1/">NASA: Chapter 18, Deep Space Network</ExternalLink>: a more technical course chapter, which is where the “about one metre” ranging precision comes from.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA or another official source was found that explains the Shapiro delay itself, apart from one that gives the outcome of a test (listed after the run), so this page explains the idea in its own words.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and then run the experiment. The pictures that the run will draw show fixed things: numbers calculated here, set beside what was measured in the
            real tests. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares. The real pictures stay the same whatever you guess.
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
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong> {done ? 'Pictures 1 to 4 are drawn. Your predictions are recorded and not marked here.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {recorded && stage >= 1 && (
            <div>
              <PictureOne stage={stage} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo delayGuessId={delayGuess} />
                  {pictureTwoCaption()}
                </>
              )}
              {stage >= 4 && (
                <>
                  <PictureThree distanceGuessId={distanceGuess} />
                  {pictureThreeCaption()}
                </>
              )}
              {stage >= 5 && (
                <>
                  <PictureFour />
                  {pictureFourCaption()}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
