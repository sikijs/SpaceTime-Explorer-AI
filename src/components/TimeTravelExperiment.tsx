import { useEffect, useState, type ReactNode } from 'react'
import { CLOCK_CHOICES, BEFORE_CHOICES, PRESET_SPEED, PRESET_TRIP_YEARS, PRESET_SEPARATION_LY, SEPARATION_CHOICES_LY, SPEED_CHOICES, TRIAL_DEFAULT_SEPARATION_LY, TRIAL_DEFAULT_SPEED, friendlyDuration, trialPicture } from '../physics/timeTravel'
import { TimeTravelResults } from './TimeTravelResults'
import { TimeTravelTutor } from './TimeTravelTutor'
import { PictureOne, PictureThree, PictureTwo, TrialDrawing, pictureOneCaption, pictureThreeCaption, pictureTwoCaption, trialCaption } from './TimeTravelPictures'

// Evidence and Imagination, Experiment 2 (docs/experiments/evidence-and-imagination/02-can-you-travel-back-in-time.md).
// Steps 2 to 5: the title, the status line, the introduction, the "Want to know more?" links, the two predictions, the five-stage run with Pictures 1 to 3 and their captions, and (Step 5) the "Now try it yourself" part with its two controls and Drawing A (all in `TimeTravelPictures.tsx`), (Step 6) the results (`TimeTravelResults.tsx`) with the papers list (Step 8), and (Step 7) the tutor as Part 4 (`TimeTravelTutor.tsx`, wording approved 2026-10-30). The chapter summary comes in a later step.
// The introduction's wording is approved (2026-10-30). The wording of the two predictions is approved (2026-10-30). The stage lines and the Picture 1 to 3 captions are approved too (2026-10-30). The Part 2 wording and the Drawing A caption are approved too (2026-10-30). The Part 3 results wording is approved too (2026-10-30) (CLAUDE.md §28.1). Nothing here says how long the moving mouth's clock counts, how large the offset is, when a path is closed
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

export function TimeTravelExperiment({ onComplete, onTutorComplete }: TimeTravelExperimentProps) {
  const [clockGuess, setClockGuess] = useState<string | null>(null)
  const [beforeGuess, setBeforeGuess] = useState<string | null>(null)
  const [trialSpeed, setTrialSpeed] = useState<number>(TRIAL_DEFAULT_SPEED)
  const [trialSeparation, setTrialSeparation] = useState<number>(TRIAL_DEFAULT_SEPARATION_LY)
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
    setTrialSpeed(TRIAL_DEFAULT_SPEED)
    setTrialSeparation(TRIAL_DEFAULT_SEPARATION_LY)
    setStatus('idle')
    setStage(0)
  }

  const trial = trialPicture(trialSpeed, trialSeparation)

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
          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> In the pictures above, mouth B moved at {PRESET_SPEED} c and the mouths ended {PRESET_SEPARATION_LY} light-year apart. Here you can try other numbers. You choose two things:
              </p>
              <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The speed of the moving mouth.</strong> The trip always lasts {PRESET_TRIP_YEARS} years on A’s clock, as before. Here “the moving mouth” is mouth B, the one sent away and back. Mouth A stays at home. A moving clock counts fewer years than a clock that stays put, so B’s clock ends up reading less than A’s. The faster B travels, the fewer years its clock counts, so the gap between the two clocks grows. For example, at 0.6 c the stay-at-home clock counts {PRESET_TRIP_YEARS} years while B’s clock counts only {PRESET_TRIP_YEARS * 0.8} years, so B is {PRESET_TRIP_YEARS * 0.2} years behind A. At a higher speed, B counts even fewer years and falls even further behind.
                </li>
                <li>
                  <strong>The separation of the mouths.</strong> How far apart the mouths are outside the tunnel when the trip is over. Light needs a certain time to cross it, and nothing can cross faster.
                </li>
              </ol>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>One drawing then shows, for your choices:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>How long each clock counted</strong>, and the offset between them.
                </li>
                <li>
                  <strong>The offset set against the light-travel time</strong> between the mouths outside the tunnel.
                </li>
                <li>
                  <strong>Whether a closed path exists</strong> for your choices, how much earlier the traveller arrives at best, and the smallest speed that would make one for your separation.
                </li>
              </ul>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                The real pictures above do not change, and your two guesses do not change this drawing. Only the two settings below do.
              </p>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>These are your own trial values, not new measurements.</strong> Each button is a number to try. For example, if you choose {trialSpeed} c and mouths {friendlyDuration(trialSeparation)} of light-travel apart, the drawing works out the clocks’ offset and the comparison with the same formulas as
                Pictures 1 to 3. A wormhole like that is imagined for the question, and it is drawn in pink where it appears. This does not say that a wormhole like it exists, or that any speed or separation is possible.
              </p>
              {(
                [
                  { title: 'How fast does the moving mouth travel?', choices: SPEED_CHOICES.map((v) => ({ value: v as number, label: `${v} c` })), value: trialSpeed, set: setTrialSpeed },
                  { title: 'How far apart are the mouths outside the tunnel?', choices: SEPARATION_CHOICES_LY.map((c) => ({ value: c.ly as number, label: c.label })), value: trialSeparation, set: setTrialSeparation },
                ] as const
              ).map((control) => (
                <div key={control.title} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{control.title}</label>
                  <div>
                    {control.choices.map((choice) => (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => (control.set as (v: number) => void)(choice.value)}
                        className={`toggle-button${control.value === choice.value ? ' is-selected' : ''}`}
                        style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        {choice.label.charAt(0).toUpperCase() + choice.label.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <TrialDrawing trial={trial} />
              {trialCaption(trial)}
            </div>
          )}
          {done && <TimeTravelResults clockGuess={clockGuess} beforeGuess={beforeGuess} />}

          {done && clockGuess !== null && beforeGuess !== null && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0066cc' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#0066cc' }}>Part 4: The tutor</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> You have seen the pictures and the tables. This last part is a short conversation with a tutor.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>Three questions, one at a time.</strong> What you see in Pictures 1 to 3; how your own guesses (the white marks) compare with the real results; and one bigger question about a slower mouth and a shorter distance. Type a few words for each. Nothing is graded, and a short answer is fine.
                </li>
                <li>
                  <strong>No verdict until you have replied.</strong> The tutor will not say whether your guesses matched until you have answered all three, so you can think it through first.
                </li>
                <li>
                  <strong>Then the explanation.</strong> It covers why B’s clock falls behind, why the tunnel turns that gap into a path back in time, why the path closes only when the gap is longer than the light-travel time, why it could not reach back before the gap existed, the
                  grandfather paradox, what chronology protection is, and what is not settled.
                </li>
              </ul>
              <TimeTravelTutor clockPrediction={clockGuess} beforePrediction={beforeGuess} onExplained={onTutorComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
