import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  APPROACH_SPEED_ALTERNATIVE_KM_S,
  APPROACH_SPEED_KM_S,
  FALL_CHOICES,
  MERGER_DISTANCE_KPC,
  MONTE_CARLO_SAMPLES_2026_PER_RUN,
  MONTE_CARLO_TRIALS_2025,
  PASS_CHOICES,
  PUBLISHED_2025,
  PUBLISHED_2026,
  SIDEWAYS_SPEED_2025_KM_S,
  SIDEWAYS_SPEED_2026_KM_S,
  SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S,
  TOTAL_MASS,
  TRIAL_DEFAULT_MASS_SOLAR,
  TRIAL_DEFAULT_SIDEWAYS_KM_S,
  TRIAL_MASSES_SOLAR,
  TRIAL_SIDEWAYS_KM_S,
  distanceKpc,
  sidewaysRange2026,
  trialPicture,
} from '../physics/localGroupCollision'
import type { FallChoiceId, PassChoiceId } from '../physics/localGroupCollision'
import { LocalGroupCollisionResults } from './LocalGroupCollisionResults'
import { PictureOne, PictureTwo, TRIAL_MASS_LABELS, TRIAL_SPEED_LABELS, TrialDrawing, pictureOneCaption, pictureTwoCaption, trialCaption } from './LocalGroupCollisionPictures'

// Frontier and Beyond, Experiment 25 (docs/experiments/frontier-and-beyond/25-will-the-milky-way-and-andromeda-collide.md).
// Steps 2 to 4: the title, the status line, the introduction, the "Want to know more?" links, the two predictions and the five-stage run with Pictures 1 and 2 (in `LocalGroupCollisionPictures.tsx`). The controls, the results and the tutor come in later steps.
// The wording is the owner's draft of 2026-10-28, approved line by line (CLAUDE.md §28.1), with the one correction listed in the Implementation Notes. Every number comes from the physics module (CLAUDE.md §9).
// Nothing here says how long a straight fall takes, how close the first pass is, or the date the old textbook gave for the collision, because the two predictions ask for them (CLAUDE.md §12).
// The pages that give those dates away are listed only after the run (a later step).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The Milky Way and Andromeda', 'The approach', 'A straight fall', 'The sideways loop', 'The two studies’ values']
const STAGE_LINES = [
  '',
  'The blue dot is the Milky Way and the violet dot is Andromeda. The dotted line is the distance between them.',
  'The violet arrow is Andromeda’s approach speed, straight towards the Milky Way.',
  'The ruler shows how long a straight fall would take (pink) and how long it would take if the speed stayed the same (violet). Your guess for Prediction 1 is the white marker.',
  'Picture 2 shows the orbit of Andromeda about the Milky Way for the 2026 sideways speed (cyan), and the first pass against the sideways speed. Your guess for Prediction 2 is the white line.',
  'The orange path is for the 2025 sideways speed, the dashed ring is the 20 kpc distance that the studies call merged, and the shaded band is the 2026 give-or-take.',
]

interface LocalGroupCollisionExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function LocalGroupCollisionExperiment({ onComplete }: LocalGroupCollisionExperimentProps) {
  const [fallGuess, setFallGuess] = useState<FallChoiceId | null>(null)
  const [passGuess, setPassGuess] = useState<PassChoiceId | null>(null)
  const [trialSideways, setTrialSideways] = useState<number>(TRIAL_DEFAULT_SIDEWAYS_KM_S)
  const [trialMass, setTrialMass] = useState<number>(TRIAL_DEFAULT_MASS_SOLAR)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = fallGuess !== null && passGuess !== null
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
  const startOver = () => {
    setFallGuess(null)
    setPassGuess(null)
    setTrialSideways(TRIAL_DEFAULT_SIDEWAYS_KM_S)
    setTrialMass(TRIAL_DEFAULT_MASS_SOLAR)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  // Display rounding of the module's numbers (no physics here, CLAUDE.md §9).
  const distance = Math.round(distanceKpc())
  const approach = APPROACH_SPEED_KM_S
  const range = sidewaysRange2026()
  const lowRange = Math.round(range.low)
  const highRange = Math.round(range.high)
  const sideways2026 = SIDEWAYS_SPEED_2026_KM_S.toFixed(1)
  const totalMass = (TOTAL_MASS / 1e12).toFixed(1)
  const trial = trialPicture(trialSideways, trialMass)
  const plusMinus = SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S.toFixed(1)
  return (
    <div>
      <h2>Experiment 25 — Will the Milky Way and Andromeda Collide? (Two Studies, Two Answers)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Status as of October 2026: Contested. “Contested” means that careful studies disagree.</strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Our galaxy, the Milky Way, has a big neighbour, the Andromeda galaxy. For years the textbook answer was that the two will certainly crash into each other. In 2025 one study said the chance is only about
            50-50. In 2026 another said about 90 percent. How can two careful studies disagree? This experiment shows that the answer depends on one number that is very hard to measure.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Galaxy:</strong> a huge family of stars, gas and dust held together by gravity. The Milky Way holds a few hundred billion stars.
            </li>
            <li>
              <strong>Local Group:</strong> the small neighbourhood of more than fifty galaxies that the Milky Way belongs to. Andromeda and the Milky Way are its two biggest members.
            </li>
            <li>
              <strong>Halo:</strong> a huge, invisible cloud of dark matter around a galaxy, far bigger than its stars. Its mass is what mostly decides how the two galaxies pull on each other (Experiments 6 and 7).
            </li>
            <li>
              <strong>Kiloparsec (kpc):</strong> a distance of about 3,260 light-years. Andromeda is about {distance} kpc away, about 2.5 million light-years.
            </li>
            <li>
              <strong>A billion years:</strong> 1,000 million years.
            </li>
            <li>
              <strong>km/s:</strong> kilometres per second. A fast jet flies at about 0.25 km/s.
            </li>
            <li>
              <strong>Approach speed:</strong> how fast Andromeda moves straight towards us, about {approach} km/s. We measure it from a colour shift in its light, as in Cosmology 1.
            </li>
            <li>
              <strong>Sideways speed:</strong> how fast Andromeda moves across our line of sight. We find it from its <strong>proper motion</strong>, the tiny change in its position on the sky each year. That change is only tens of millionths of an
              arcsecond a year, and an arcsecond is 1/3600 of a degree. The Moon is about 1,800 arcseconds wide, so this is tens of millions of times smaller than the Moon’s width. Gaia, ESA’s star-mapping telescope, measures such shifts.
            </li>
            <li>
              <strong>Merger:</strong> the studies call two galaxies merged when they come within {MERGER_DISTANCE_KPC} kpc of each other.
            </li>
            <li>
              <strong>Dynamical friction:</strong> a slow drag a galaxy feels as it moves through another galaxy’s halo. It takes energy from the orbit and can pull the two together.
            </li>
            <li>
              <strong>Monte Carlo:</strong> a method that repeats a calculation many times with the uncertain numbers drawn at random. ESA says the 2025 team ran {MONTE_CARLO_TRIALS_2025.toLocaleString('en-US')} such simulations, and the 2026 study used {MONTE_CARLO_SAMPLES_2026_PER_RUN.toLocaleString('en-US')} in each set-up.
            </li>
            <li>
              <strong>Give-or-take:</strong> how far a measured number might be off. {sideways2026} ± {plusMinus} km/s means the true value is probably between about {lowRange} and about {highRange}.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What a “collision” means.</strong> Almost no stars would hit each other. If the Sun were a grain of sand, the nearest star would be about 30 km away. Two galaxies passing through each other are like two swarms of bees flying through
            each other: the pull of gravity bends every path, and over billions of years they settle into one galaxy.
          </p>

          <p style={paragraph}>
            <strong>What the two studies did.</strong> Both studies used the same kind of method, and mostly the same masses. The 2026 paper’s own tests point to Andromeda’s sideways speed as the biggest change between them. In June 2025 Sawala and others (<em>Nature Astronomy</em>) found about{' '}
            {SIDEWAYS_SPEED_2025_KM_S} km/s and about a {PUBLISHED_2025.mergerPercentWithin10Gyr} percent chance of a merger within 10 billion years. In March 2026 Wu and others (accepted by <em>The Astrophysical Journal Letters</em>) used newer Gaia
            measurements and found {sideways2026} ± {plusMinus} km/s and about {PUBLISHED_2026.mergerPercent} percent. Neither study’s sideways-speed paragraph names its frame, so this page says only “the sideways speed the study found”.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions, run the experiment in five stages (the state now, the approach, a straight fall, the sideways loop, the two studies’ values), read the results, then talk it through with the tutor.
            Then, under “Now try it yourself”, you can change the sideways speed and the total mass.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The model has only two points, the Milky Way and Andromeda. It leaves out the Large Magellanic Cloud, M33, the halos’ size, dynamical friction and the expansion of the universe.{' '}
            <strong>It does not calculate a probability of a merger;</strong> the two probabilities above are the studies’ own. The {approach} km/s is a rounded literature value, and a conversion of the 2026 paper’s inputs gives about{' '}
            {APPROACH_SPEED_ALTERNATIVE_KM_S}.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers, and the NASA and ESA pages about the two studies, are listed after the run, because
            they give numbers that the predictions ask for.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/galaxy/en/">NASA Space Place: What is a galaxy?</ExternalLink>: a plain definition of a galaxy, with the Milky Way and Andromeda as examples.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/missions/hubble/hubble-meeting-the-neighbors/">NASA Hubble: Meeting the neighbors</ExternalLink>: the Local Group, the gathering of more than fifty galaxies that the Milky Way belongs to.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-dark-matter/">NASA Hubble: dark matter</ExternalLink>: what dark matter is, and how Hubble found that galaxies can be embedded in haloes of it.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia/Proper_motion">ESA: Proper motion</ExternalLink>: a short, plain account of what proper motion is, and how it is turned into a speed once the distance is known.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia">ESA: Gaia</ExternalLink>: the mission that maps the positions and motions of about a billion stars, and its schedule of data releases (the next, Data Release 4, is listed as
              expected in December 2026).
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/missions/hubble/what-happens-when-galaxies-collide-hubble-space-telescope-finds-new-surprises/">NASA Hubble: What happens when galaxies collide</ExternalLink>: a 1993 NASA release on what
              happens to the gas and stars when two galaxies collide.
            </li>
          </ul>
        </div>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: a calculation of the orbit of Andromeda about the Milky
            Way when only the two galaxies pull on each other, and the two studies’ published sideways speeds. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares with the
            real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: how long would a straight fall take?',
                text: (
                  <>
                    Andromeda is about {distance} kpc away and is coming towards us at about {approach} km/s. Suppose it had no sideways motion at all, so that it simply fell straight towards the Milky Way from where it is now, with only the
                    gravity of the two galaxies (together about {totalMass} trillion Suns, counting their halos) pulling on them all the way. About how long would it take to reach the Milky Way?
                  </>
                ),
                choices: FALL_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: fallGuess as string | null,
                set: (v: string) => setFallGuess(v as FallChoiceId),
              },
              {
                title: 'Prediction 2: how close would the first pass be?',
                text: (
                  <>
                    Now give Andromeda the sideways speed that the 2026 study found, {sideways2026} km/s, together with the same approach speed as before. Treat the two galaxies as two points that pull on each other, with nothing else in the
                    way. Their paths now curve instead of meeting head-on. About how close would they pass at their first closest approach? (For scale, the studies call two galaxies merged when they come within {MERGER_DISTANCE_KPC} kpc.) This is a
                    separate guess from Prediction 1, so your two answers do not have to agree with each other.
                  </>
                ),
                choices: PASS_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: passGuess as string | null,
                set: (v: string) => setPassGuess(v as PassChoiceId),
              },
            ] as const
          ).map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
              <div>
                {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.set as (v: string) => void)(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label.charAt(0).toUpperCase() + choice.label.slice(1)}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null
                  ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label}.`
                  : 'Choose an option to continue'}
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
                {done ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>
          {status !== 'idle' && (
            <div>
              <PictureOne stage={stage} fallGuess={fallGuess} />
              {pictureOneCaption(stage)}
              {stage >= 4 && (
                <>
                  <PictureTwo stage={stage} passGuess={passGuess} />
                  {pictureTwoCaption(stage)}
                </>
              )}
            </div>
          )}
          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> Above, you saw fixed cases: the straight fall and the two studies’ sideways speeds. Here you can try other values. Choose a sideways speed for Andromeda and a total mass for the pair, and one drawing will show
                the orbit that results, how close the first pass is and how long it takes. The real pictures above do not change, and your two guesses do not change this drawing: only the two settings below do.
              </p>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>These are your own trial values, not new measurements.</strong> Each button is a number to try. The total mass is the masses of the two halos added together. For example, if you choose {TRIAL_SPEED_LABELS[trialSideways]?.replace(/ \(.*\)$/, '')} and{' '}
                {TRIAL_MASS_LABELS[trialMass]?.replace(/ \(.*\)$/, '')}, the drawing works out the orbit of a pair like that, with the same formulas as Picture 2. Such a pair is imagined for the question, and it is drawn in pink. The orbit is calculated for the two galaxies alone, as in Picture 2.
              </p>

              {(
                [
                  {
                    title: 'How fast is Andromeda moving sideways?',
                    choices: TRIAL_SIDEWAYS_KM_S.map((v) => ({ value: v as number, label: TRIAL_SPEED_LABELS[v] })),
                    value: trialSideways,
                    set: setTrialSideways,
                  },
                  {
                    title: 'What is the total mass of the two galaxies and their halos?',
                    choices: TRIAL_MASSES_SOLAR.map((v) => ({ value: v as number, label: TRIAL_MASS_LABELS[v] })),
                    value: trialMass,
                    set: setTrialMass,
                  },
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

          {done && <LocalGroupCollisionResults fallGuess={fallGuess} passGuess={passGuess} />}

          {/* Temporary note: removed in Step 7, when the tutor is built. */}
          {done && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>The tutor is not built yet.</p>}
        </div>
      </div>
    </div>
  )
}
