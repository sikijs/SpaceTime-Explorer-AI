import { useEffect, useState, type ReactNode } from 'react'
import { CLOCK_CHOICES, BEFORE_CHOICES, PRESET_SPEED, PRESET_TRIP_YEARS, PRESET_SEPARATION_LY } from '../physics/timeTravel'
import { PictureOne, PictureThree, PictureTwo, pictureOneCaption, pictureThreeCaption, pictureTwoCaption } from './TimeTravelPictures'

// Evidence and Imagination, Experiment 2 (docs/experiments/evidence-and-imagination/02-can-you-travel-back-in-time.md).
// Steps 2 to 4: the title, the status line, the introduction, the "Want to know more?" links, the two predictions and the five-stage run with Pictures 1 to 3 and their captions (in `TimeTravelPictures.tsx`). The "Now try it yourself" part, the results and the tutor come in later steps.
// The introduction's wording is approved (2026-10-30). The wording of the two predictions is approved (2026-10-30). The stage lines and the picture captions are approved too (2026-10-30) (CLAUDE.md §28.1). Nothing here says how long the moving mouth's clock counts, how large the offset is, when a path is closed
// in time, or what chronology protection is, because the predictions and the results ask for them (CLAUDE.md §12). The papers are listed only after the run.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'A clock only goes forward', 'The trip, and the gap it makes', 'The tunnel links the two mouths', 'Does a path return to its own past?', 'What has been tested']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, shows the two mouths side by side, with their clocks set equal. Each clock only ever ticks forward.',
  `Mouth B is sent out and back at ${PRESET_SPEED} c. Panel B shows how many years each clock counted.`,
  'Picture 2 is a spacetime diagram. The tunnel joins moments at which the two mouths’ own clocks show the same reading.',
  'Picture 2 adds the traveller’s route outside the tunnel and a light cone. Picture 3 compares the two numbers that decide it.',
  'Travel to the future has been measured with real clocks. As of October 2026 no path back in time has been seen, and no wormhole has been seen either. The sources are listed with the results.',
]
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface TimeTravelExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function TimeTravelExperiment({ onComplete }: TimeTravelExperimentProps) {
  const [clockGuess, setClockGuess] = useState<string | null>(null)
  const [beforeGuess, setBeforeGuess] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = clockGuess !== null && beforeGuess !== null
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
    setClockGuess(null)
    setBeforeGuess(null)
    setStatus('idle')
    setStage(0)
  }

  const questions = [
    {
      title: 'Prediction 1: how long does the moving mouth’s own clock say the trip took?',
      text: (
        <>
          Two mouths of a wormhole, A and B, start side by side, with their clocks set equal. Mouth A stays where it is. Mouth B is sent away at {PRESET_SPEED} of the speed of light ({PRESET_SPEED} c, which is {PRESET_SPEED * 100} percent of light’s speed),
          turns round and comes back, and stops {PRESET_SEPARATION_LY} light-year from A. By A’s clock the whole trip took {PRESET_TRIP_YEARS} years. How many years does B’s own clock say the trip took?
        </>
      ),
      choices: CLOCK_CHOICES.map((c) => ({ value: c.id, label: c.label })),
      value: clockGuess,
      set: setClockGuess,
    },
    {
      title: 'Prediction 2: could a traveller get back before they left?',
      text: (
        <>
          Now join the two mouths by a very short tunnel. It connects moments at which the two mouths’ own clocks show the <em>same</em> reading. So someone who steps into mouth B when B’s clock reads a certain time steps out of mouth A when A’s clock
          reads that same time. The mouths now sit at rest, {PRESET_SEPARATION_LY} light-year apart outside the tunnel (light takes one year to cross that distance, and nothing can go faster). A traveller steps into mouth B, comes out of mouth A, and then
          runs back outside to mouth B at nearly the speed of light. When they arrive at B, is it before the moment they stepped in? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: BEFORE_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: beforeGuess,
      set: setBeforeGuess,
    },
  ]

  return (
    <div>
      <h2>Experiment 2 — Can You Travel Back in Time?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled for travel to the future; Open for travel to the past. “Settled” means that it has been tested by real measurements and scientists no longer doubt it. Clocks flown on aircraft and satellites really do
            end up behind identical clocks left on the ground, which means they have moved a tiny step into the future of the clocks that stayed. “Open” means that nobody knows yet: the mathematics of some models allows a path back in time, no one has
            seen one, and no one has proved that nature forbids it.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In films, a time traveller steps into a machine and steps out in the past. Could that really happen? This experiment keeps two questions apart. Travelling to the <em>future</em> is not a dream: you met it in the
            twin paradox, where the twin who travels fast comes home having lived less time than the twin who stayed. Travelling to the <em>past</em> is a different kind of question, and this experiment asks whether the equations of general relativity allow
            it, how a model of it would work, and what has actually been tested. It does not say that travel to the past is possible, and it does not say that it is impossible.
          </p>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> Think of your own clock. For you, the next moment is always later than this one. Your clock only ever ticks forward, and so does every clock along its own path. Now take two watches, set them equal, and send one
            on a long, fast trip. When it returns, the two no longer agree. They are not broken: each one measured the time along its own path, and the two paths were different. The gap between the two readings is what this experiment calls an{' '}
            <strong>offset</strong>. An offset is not travel into the past: both watches still tick forward the whole time.
          </p>
          <p style={paragraph}>
            A path back in time would be something stranger. Suppose you leave home at 3 pm by your watch, and you travel for a while. Your watch ticks forward the whole way, as it always does: 3:05, 3:30, 4:00, and so on. Now suppose
            that when you arrive back at your front door, your watch says 4:30 but the clock on the wall says 2 pm, an hour <em>before</em> you left. That is what a path back in time means: you return to where you started at a moment <em>earlier</em>
            than the moment you left, even though your own watch never ran backwards. Nothing like this has ever been seen.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Closed timelike curve:</strong> a path through spacetime that always goes forward in the traveller’s own time, yet comes back to the place it started at a moment <em>earlier</em> than it left. “Timelike” means slower than light.
              “Closed” means it loops back to its start. No one has ever seen one.
            </li>
            <li>
              <strong>Time machine:</strong> on this page, only a setup that would make such a path in a model. It does not mean a device that anyone could build.
            </li>
            <li>
              <strong>Wormhole, mouth and throat:</strong> a possible tunnel through spacetime that joins two places. It has two openings, called mouths. You met it in the experiment before this one, which showed that no wormhole has been seen and that a
              tunnel that stays open would need negative energy.
            </li>
            <li>
              <strong>Offset:</strong> the gap between two clocks that started equal and have been on different journeys.
            </li>
            <li>
              <strong>Light-year and light-travel time:</strong> a light-year is the distance light covers in one year. So light takes one year to cross a distance of one light-year. “Light-travel time” is how long light takes to cross a distance.
              Nothing can cross it faster.
            </li>
            <li>
              <strong>Light cone:</strong> the set of events that light, or anything slower than light, could reach from a chosen event (Spacetime Geometry chapter). Anything outside the cone cannot be reached from that event.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where the idea comes from.</strong> Einstein’s equations have no rule that says time must run in one direction round every loop. In 1949 the mathematician Kurt Gödel found a model of a rotating universe that contains paths which return to
            their own past. In 1988 Michael Morris, Kip Thorne and Ulvi Yurtsever showed a different way to make such a path in a model: take a wormhole and treat its two mouths like the twins. That second idea is the one this experiment draws. It is a
            thought experiment from the mathematics, not a design.
          </p>

          <p style={paragraph}>
            <strong>What is known today.</strong> Travel to the future has been measured: NASA’s Space Place page says that clocks on airplanes and satellites run at a different speed from clocks on the ground, and that this is why GPS has to allow for it. The same
            page says that humans cannot hop into a time machine and go back in time. No path back in time has ever been seen, and no wormhole has been seen either.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions. Then run the experiment in five stages: a clock only goes forward, the trip of one mouth and the gap it makes between the two clocks, the link that the tunnel makes between the mouths,
            whether a path that returns to its own past appears, and what has been tested. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings: the speed of the moving mouth, and how far apart
            the mouths are outside the tunnel.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> Every picture is a toy: it is worked out from the mathematics, and no one has built or photographed anything like it. The two mouths are treated as points, joined by a tunnel of zero length. The moving mouth
            travels at one steady speed, and its turning round and speeding up are left out. Nothing here says how a wormhole would be made. The model is the simplest one that shows the idea.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the ideas are listed after the run, because they give the answers to the
            predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/time-travel/en/">NASA Space Place: Is Time Travel Possible?</ExternalLink>: a short, plain account of travelling to the future with clocks on airplanes and GPS satellites, written for young readers.
            </li>
            <li>
              <ExternalLink href="https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html">NASA Cosmicopia: Are wormholes in space real, or are they only science fiction?</ExternalLink>: NASA’s short answer: the mathematics of general
              relativity allows wormholes, and there is no evidence that any exists. It is a 2005 page, now kept in NASA’s archive.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain NASA or ESA page was found for closed timelike curves or for a wormhole used as a time machine, so this page explains them in its own words.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: how the two clocks end up, the link that the tunnel makes,
            and whether a path that returns to its own past appears. They are calculated from the mathematics and are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares. The real
            pictures stay the same whatever you guess.
          </p>

          {questions.map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
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
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong>{' '}
                {done ? 'Pictures 1 to 3 are drawn. Your predictions are recorded and not marked here.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {recorded && stage >= 1 && (
            <div>
              <PictureOne stage={stage} clockGuess={clockGuess} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo stage={stage} beforeGuess={beforeGuess} />
                  {pictureTwoCaption(stage)}
                </>
              )}
              {stage >= 4 && (
                <>
                  <PictureThree />
                  {pictureThreeCaption()}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
