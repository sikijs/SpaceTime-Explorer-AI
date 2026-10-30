import { useEffect, useState, type ReactNode } from 'react'
import {
  SPEED_ANSWER_CHOICES,
  FLASH_ANSWER_CHOICES,
  PRESET_SHIP_SPEED,
  PRESET_PROBE_SPEED,
  PION_SOURCE_SPEED,
  SHIP_SPEED_CHOICES,
  PROBE_SPEED_CHOICES,
  TRIAL_DEFAULT_SHIP_SPEED,
  TRIAL_DEFAULT_PROBE_SPEED,
  trialPicture,
} from '../physics/addingSpeeds'
import { PictureOne, PictureThree, PictureTwo, TrialDrawing, pictureOneCaption, pictureThreeCaption, pictureTwoCaption, probeLabel, trialCaption } from './AddingSpeedsPictures'

// Evidence and Imagination, Experiment 3 (docs/experiments/evidence-and-imagination/03-adding-speeds.md).
// Steps 2 to 5: the title, the status line, the introduction, the "Want to know more?" links, the two predictions, the five-stage run with Pictures 1 to 3 and their captions, and (Step 5) the "Now try it yourself" part with its two controls and Drawing A (all in `AddingSpeedsPictures.tsx`). The results and the tutor come in later steps.
// The introduction's wording and the wording of the two predictions are approved (2026-10-30). The stage lines and the Picture 1 to 3 captions are approved too (2026-10-30). The Part 2 wording and the Drawing A caption are Claude's DRAFT of 2026-10-30, for the owner's approval (CLAUDE.md §28.1). Nothing here gives the result of adding 0.5 c and 0.5 c, says what happens when one of the speeds is
// the speed of light, or gives either test's result, because the predictions and the results ask for them (CLAUDE.md §12). The papers, and NASA's page on the speed of light, are listed only after the run.

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
const STAGE_NAMES = ['', 'The everyday rule on a train', 'The same two speeds near light', 'Light in moving water', 'The 1964 flash', 'A flash from ships of different speeds']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, shows the train example with its speeds, and the everyday sum of the walker’s speed and the train’s.',
  'Panel B shows the spaceship and its probe with the same kind of sum, and what the lab measures. Your first guess is drawn on it.',
  'Picture 2 shows Fizeau’s flowing water and how much of the water’s speed is added to the light’s, by the everyday sum and by the rule.',
  'Picture 3, panel A, shows the gamma ray from the pions in 1964: the everyday sum, the rule and the measurement. Your second guess is drawn on it.',
  'Panel B of Picture 3 asks what a flash sent forward would do from ships of different speeds. The sources are listed with the results.',
]
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface AddingSpeedsExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function AddingSpeedsExperiment({ onComplete }: AddingSpeedsExperimentProps) {
  const [shipGuess, setShipGuess] = useState<string | null>(null)
  const [flashGuess, setFlashGuess] = useState<string | null>(null)
  const [trialShip, setTrialShip] = useState<number>(TRIAL_DEFAULT_SHIP_SPEED)
  const [trialProbe, setTrialProbe] = useState<number>(TRIAL_DEFAULT_PROBE_SPEED)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = shipGuess !== null && flashGuess !== null
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
    setShipGuess(null)
    setFlashGuess(null)
    setTrialShip(TRIAL_DEFAULT_SHIP_SPEED)
    setTrialProbe(TRIAL_DEFAULT_PROBE_SPEED)
    setStatus('idle')
    setStage(0)
  }

  const trial = trialPicture(trialShip, trialProbe)

  const questions = [
    {
      title: 'Prediction 1: how fast does the lab see the probe move?',
      text: (
        <>
          A spaceship moves at half the speed of light ({PRESET_SHIP_SPEED} c) relative to the lab. It fires a probe straight ahead, in the direction it is moving, at half the speed of light ({PRESET_PROBE_SPEED} c) relative to the spaceship. How
          fast does someone in the lab measure the probe to be moving?
        </>
      ),
      choices: SPEED_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: shipGuess,
      set: setShipGuess,
    },
    {
      title: 'Prediction 2: how fast does the lab measure the flash?',
      text: (
        <>
          Here is the setup, step by step.
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
            <li>In a particle accelerator, very fast particles hit a target. The collisions make neutral pions.</li>
            <li>
              The pions fly out of the target. The lab measures their speed as {PION_SOURCE_SPEED} c, which is {(PION_SOURCE_SPEED * 100).toFixed(3)} percent of the speed of light: almost as fast as light itself.
            </li>
            <li>
              Each pion falls apart almost at once. One gamma ray (a flash of very energetic light) flies off straight ahead, in the same direction the pion was moving. So the gamma ray is sent out by something that is itself already moving forward
              very fast.
            </li>
            <li>The lab places two detectors in a line, a known distance apart. It notes the moment the gamma ray passes each one and divides the distance by the time between them. That gives the gamma ray’s speed, as the lab measures it.</li>
          </ol>
          In the train example, a person who walks forward on a moving train gets the train’s speed added to their own, as the platform sees it. The question is whether the gamma ray gets anything extra from its fast-moving source. How fast does the lab
          measure the gamma ray to go? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: FLASH_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: flashGuess,
      set: setFlashGuess,
    },
  ]

  return (
    <div>
      <h2>Experiment 3 — Can Speeds Simply Be Added?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled. “Settled” means that it has been tested by real measurements and scientists no longer doubt it. The two tests used on this page are old ones, from 1851 and 1964. Nothing here is a new result. The
            page shows how the rule has been tested, not a discovery.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Everyone knows how to add speeds. If you walk forward at 1 metre per second on a train that moves at 20 metres per second, a person standing on the platform sees you move at 21 metres per second. You just add the
            two. This experiment asks whether that everyday rule keeps working when the speeds are very large, as large as a good fraction of the speed of light, and what has actually been measured.
          </p>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> A speed is always a speed <em>relative to</em> something. The 1 metre per second is your speed relative to the train, and the 20 metres per second is the train’s speed relative to the platform. The question of
            adding speeds is: if I know both, what is your speed relative to the platform? Who measures matters, so this page always says whose measurement it is. Two observers who are moving relative to each other can each have their own measurements, as you
            saw in Experiment 2 of the first chapter, where each one is said to have a <strong>reference frame</strong>. Here there are two: the <strong>lab’s</strong> (the platform, at rest) and the <strong>spaceship’s</strong>.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Relative to:</strong> measured by someone who is moving along with the thing, or who is at rest compared with it. “The spaceship’s speed relative to the lab” is the speed that someone in the lab measures for the spaceship.
            </li>
            <li>
              <strong>Reference frame:</strong> the point of view of an observer, with the rulers and clocks that observer carries.
            </li>
            <li>
              <strong>The everyday sum:</strong> simply adding the two speeds, as in the train example. It is the rule you already use, and this page calls it “the everyday sum” so that it can be compared with the rule that is actually measured.
            </li>
            <li>
              <strong>c:</strong> the speed of light in empty space, about 300,000 kilometres per second. “0.5 c” means half of that, about 150,000 kilometres per second.
            </li>
            <li>
              <strong>Probe:</strong> in this page’s imagined spaceship, a small object that the spaceship fires straight ahead.
            </li>
            <li>
              <strong>Gamma ray:</strong> light with extremely high energy. According to NASA, gamma rays have the smallest wavelengths and the most energy of any wave in the electromagnetic spectrum, the family that also includes radio waves, visible light
              and X-rays.
            </li>
            <li>
              <strong>Neutral pion:</strong> a very short-lived particle that can be made when fast particles hit a target. This page uses only one fact about it: when it falls apart, it gives out gamma rays. (How or why is not needed here.)
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> The earlier experiments of this site used one idea again and again: how time, length and speed look to observers who move. Speeds are the next thing to look at. Two real tests are on this page: an
            experiment by Hippolyte Fizeau in 1851 on light that passes through flowing water, and an experiment at CERN in 1964 that timed gamma rays from very fast particles. Neither is a new result. They are here because they let you compare the everyday sum
            with what was measured. This page does not give the results until you have made your predictions.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions: one about an imagined spaceship and its probe, and one about the 1964 test. Then run the experiment in five stages: the everyday rule on a train; the same two speeds near the speed of light;
            Fizeau’s water; the 1964 flash; and what happens when one of the two speeds is the speed of light. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings: the spaceship’s speed and the
            probe’s speed.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> Everything happens along one straight line, in one direction. The spaceship and its probe are imagined for the question, and the speeds are steady (no speeding up or turning). Each speed is measured by the observer
            named, with that observer’s own ruler and clock. Sideways motion is left out. The two real tests are described only as far as the page needs them.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the tests, and a NASA page about the speed of light, are listed after the run, because
            they give away the answers to the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/ems/12_gammarays/">NASA Science: Gamma Rays</ExternalLink>: a plain account of what gamma rays are, how they differ from other kinds of light, and where they come from.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA, CERN or another official source was found for adding speeds, for neutral pions or for how a particle accelerator works, so this page explains them in its own words.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: the everyday sum beside the measured results, for the same
            speeds. They are calculated from the mathematics or taken from the two real tests, and they are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares. The real pictures stay
            the same whatever you guess.
          </p>

          {questions.map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
                {question.text} You are not graded, and a guess is fine.
              </div>
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
              <PictureOne stage={stage} speedGuess={shipGuess} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo />
                  {pictureTwoCaption()}
                </>
              )}
              {stage >= 4 && (
                <>
                  <PictureThree stage={stage} flashGuessId={flashGuess} />
                  {pictureThreeCaption(stage)}
                </>
              )}
            </div>
          )}
          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> In the pictures above, the spaceship moved at {PRESET_SHIP_SPEED} c and fired its probe at {PRESET_PROBE_SPEED} c. Here you can try other numbers. You choose two things:
              </p>
              <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The spaceship’s speed</strong>, relative to the lab, as a fraction of c.
                </li>
                <li>
                  <strong>The probe’s speed</strong>, relative to the spaceship, as a fraction of c. The last button, “1.0 c (light)”, makes the probe a flash of light.
                </li>
              </ol>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>One drawing then shows, for your choices:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The everyday sum</strong> of the two speeds, and <strong>what the lab measures</strong>, as two bars on one ruler, with the speed of light marked.
                </li>
                <li>
                  <strong>The gap</strong> between them.
                </li>
                <li>
                  <strong>The rule worked out</strong> for your numbers: its top, its bottom and its result.
                </li>
              </ul>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>The real pictures above do not change, and your two guesses do not change this drawing. Only the two settings below do.</p>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>These are your own trial values, not new measurements.</strong> Each button is a number to try. For example, if you choose {trialShip} c for the spaceship and {probeLabel(trialProbe)} for the probe, the drawing works out the lab’s measurement with the
                same rule as Pictures 1 to 3. The spaceship and probe are imagined for the question and are drawn in pink. This does not say that a real spaceship could move like this.
              </p>
              {(
                [
                  { title: 'How fast does the spaceship move, relative to the lab?', choices: SHIP_SPEED_CHOICES.map((v) => ({ value: v as number, label: `${v} c` })), value: trialShip, set: setTrialShip },
                  { title: 'How fast does the probe move, relative to the spaceship?', choices: PROBE_SPEED_CHOICES.map((v) => ({ value: v as number, label: probeLabel(v) })), value: trialProbe, set: setTrialProbe },
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
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <TrialDrawing trial={trial} />
              {trialCaption(trial)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
