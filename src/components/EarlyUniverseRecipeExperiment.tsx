import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { MassDifferenceId } from '../physics/earlyUniverseRecipe'
import { EarlyUniverseRecipeResults } from './EarlyUniverseRecipeResults'
import { EarlyUniverseRecipeTutor } from './EarlyUniverseRecipeTutor'
import { PictureOne, PictureThree, PictureTwo, TrialDrawing, pictureOneCaption, pictureThreeCaption, pictureTwoCaption, trialCaption } from './EarlyUniverseRecipePictures'
import { ATOM_ANSWER_CHOICES, HELIUM_TO_HYDROGEN_WEIGHT, MASS_DIFFERENCE_CHOICES, PRESET_MASS_DIFFERENCE_ID, PRESET_WAIT_S, SHARE_ANSWER_CHOICES, WAIT_CHOICES_S, settingsFromChoices, NEUTRON_LIFETIME_BOTTLE_S, NEUTRON_LIFETIME_IN_BEAM_S, NEUTRON_LIFETIME_S, NEUTRON_PROTON_MASS_DIFFERENCE_MEV } from '../physics/earlyUniverseRecipe'

// Evidence and Imagination, Experiment 6 (docs/experiments/evidence-and-imagination/06-the-early-universes-recipe.md).
// Steps 2 to 7: the title, the status line, the introduction and the "Want to know more?" links, Part 1's two predictions (five buttons each), the five-stage run with Pictures 1 to 3 (`EarlyUniverseRecipePictures.tsx`) and Part 2, "Now try it yourself", with its two controls and Drawing A, and (Step 6) Part 3, the results (`EarlyUniverseRecipeResults.tsx`) and (Step 7) Part 4, the tutor (`EarlyUniverseRecipeTutor.tsx`). The the tutor and the chapter summary come in later steps.
// The wording below is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1). Nothing here says how much of the early universe's matter was helium, how many helium atoms there were for every hundred hydrogen atoms, how many
// neutrons were left, how long they waited before they could be held in a nucleus, or how well any element's amount has been tested, because the two predictions and the results ask for them (CLAUDE.md §12).
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
const STAGE_NAMES = ['', 'The mixture at about one second', 'The neutrons wait', 'The helium and the hydrogen', 'Two of the light elements, tested', 'The third light element, tested']
const STAGE_LINES = [
  '',
  'Picture 1, Part A, shows a sample of 200 protons and neutrons about one second after the start.',
  'Part B shows the same sample after the neutrons have waited, with a ruler of time.',
  'Picture 2 sorts the sample into helium and hydrogen and puts the helium share on two rulers. Your two guesses are drawn on them.',
  'Picture 3 sets published calculations beside measurements for helium and for deuterium.',
  'Picture 3 adds the third element, lithium-7. The sources are listed after the run.',
]

interface EarlyUniverseRecipeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function EarlyUniverseRecipeExperiment({ onComplete, onTutorComplete }: EarlyUniverseRecipeExperimentProps) {
  const [shareGuess, setShareGuess] = useState<string | null>(null)
  const [atomGuess, setAtomGuess] = useState<string | null>(null)
  const [trialWaitS, setTrialWaitS] = useState<number>(PRESET_WAIT_S)
  const [trialMassId, setTrialMassId] = useState<MassDifferenceId>(PRESET_MASS_DIFFERENCE_ID)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = shareGuess !== null && atomGuess !== null
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
    setShareGuess(null)
    setAtomGuess(null)
    setStatus('idle')
    setStage(0)
  }
  const lifetimeSeconds = Math.round(NEUTRON_LIFETIME_S)
  const lifetimeMinutes = NEUTRON_LIFETIME_S / 60
  const lifetimeGap = NEUTRON_LIFETIME_IN_BEAM_S - NEUTRON_LIFETIME_BOTTLE_S
  const massDifference = NEUTRON_PROTON_MASS_DIFFERENCE_MEV
  const heliumWeight = HELIUM_TO_HYDROGEN_WEIGHT
  // The introduction's bag-of-marbles example: small marbles of weight 1 and big marbles of weight 4 (the weight of a helium nucleus against a hydrogen one), 10 small and 5 big.
  const smallCount = 10
  const bigCount = 5
  const smallMass = smallCount * 1
  const bigMass = bigCount * heliumWeight
  const totalCount = smallCount + bigCount
  const totalMass = smallMass + bigMass
  const bigCountPercent = Math.round((bigCount / totalCount) * 100)
  const bigMassPercent = Math.round((bigMass / totalMass) * 100)
  const questions = [
    {
      title: 'Prediction 1: how much of the early universe’s ordinary matter was helium?',
      text: (
        <>
          Before any star had formed, the early universe’s ordinary matter was a mixture of elements. About what share of it, by mass (by weight), was helium? Remember that “by mass” means how much of the total weight, not how many atoms.
        </>
      ),
      choices: SHARE_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: shareGuess,
      set: setShareGuess,
    },
    {
      title: 'Prediction 2: how many helium atoms for every 100 hydrogen atoms?',
      text: (
        <>
          Now count atoms instead of weighing them. A helium atom is {heliumWeight} times as heavy as a hydrogen atom. For this question, think of the early universe’s ordinary matter as made only of hydrogen and helium. For every 100 hydrogen atoms, about how many helium atoms were
          there? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: ATOM_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: atomGuess,
      set: setAtomGuess,
    },
  ]
  return (
    <div>
      <h2>Experiment 6 — What Was the Early Universe’s Recipe?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled for two of the light elements (helium and deuterium), and Open for one (lithium). “Settled” means that it has been tested by real measurements and scientists no longer doubt it. “Open” means that scientists do
            not yet agree on the answer. These are long-standing tests. Nothing here is a new discovery. The page shows what has been tested, and which part is still unsolved.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Today the universe is full of stars, and stars make new elements inside themselves. But the first stars did not exist at the start. Before any star had shone, the universe was already made of something: a mixture of
            different kinds of atoms. What was that mixture? In other words, what was the early universe’s recipe? This experiment asks what the very first matter was made of, how scientists worked it out, and how well their answer has been tested against the real
            sky.
          </p>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> In the Cosmology chapter of this site you ran the expansion of the universe backward and found a time when everything was hot and dense, the Big Bang. This experiment asks what that hot, dense gas did
            during its first few minutes. Ordinary matter is the matter that atoms are made of (as opposed to dark matter, which does not make atoms). Making the nuclei of atoms is called nucleosynthesis, and the one that happened in the Big Bang is called Big Bang
            nucleosynthesis. This page does not give its results until you have made your predictions.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>The pieces, in steps.</strong> To follow the question you need to know what an atom’s nucleus is made of, and a few facts about the neutron.
          </p>
          <ol style={list}>
            <li>
              <strong>What a nucleus is made of.</strong> At the centre of every atom is a tiny nucleus. It is built from two kinds of particles, protons and neutrons. A proton has an electric charge, and a neutron has none. The number of protons decides which element
              the atom is. The simplest element, hydrogen, has just one proton in its nucleus and no neutron. Helium has two protons. DOE’s pages, linked below, explain this in plain terms.
            </li>
            <li>
              <strong>Names that count the particles.</strong> A version of an element with a particular number of neutrons is called an isotope. An isotope is named by adding its protons and neutrons together. So helium-4 is helium with 2 protons and 2 neutrons: 2 protons plus 2
              neutrons makes {heliumWeight}. Deuterium is a kind of hydrogen with one proton and one neutron.
            </li>
            <li>
              <strong>A helium-4 nucleus is about {heliumWeight} times as heavy as a hydrogen nucleus.</strong> A proton and a neutron weigh almost the same, and the electrons around the nucleus weigh almost nothing. So a nucleus weighs about as much as the number of protons and neutrons in it added together. A hydrogen nucleus has just 1 proton, so its count is 1. A helium-4 nucleus has 2 protons and 2 neutrons, so its count is {heliumWeight}.
            </li>
            <li>
              <strong>The neutron is a little heavier than the proton.</strong> The difference is about {massDifference.toFixed(2)} MeV. An MeV, a million electron-volts, is a unit of energy used for single particles, and it is tiny by everyday standards. The
              difference is small, but it will matter in this experiment.
            </li>
            <li>
              <strong>A free neutron does not last.</strong> A neutron that is on its own, outside a nucleus, lasts only about 15 minutes before it turns into a proton, an electron and a very light particle called an antineutrino. More exactly, it lasts {lifetimeSeconds} seconds ({lifetimeMinutes.toFixed(1)} minutes)
              on average: some last longer and some less. Two kinds of experiment measure this time, and they disagree. One gives {NEUTRON_LIFETIME_BOTTLE_S} seconds and the other {NEUTRON_LIFETIME_IN_BEAM_S} seconds, a gap of about {Math.round(lifetimeGap)} seconds that scientists are still working to
              explain. This page uses {NEUTRON_LIFETIME_S} seconds.
            </li>
            <li>
              <strong>Two ways to say how much of something there is.</strong> You can say what share of a mixture is a kind of atom <em>by number</em> (how many atoms out of all the atoms) or <em>by mass</em> (how much of the weight). They are not the same when the atoms
              weigh different amounts. For example, a bag holds {smallCount} small marbles that weigh 1 gram each and {bigCount} big marbles that weigh {heliumWeight} grams each. The big marbles are {bigCount} out of {totalCount} by number, which is about {bigCountPercent} percent. By mass they are{' '}
              {bigMass} grams out of {totalMass} grams, which is about {bigMassPercent} percent. The amount of an element in the universe is called its abundance, and it is stated one way or the other.
            </li>
            <li>
              <strong>The question to hold in mind.</strong> You will be asked to predict how much of the early universe’s ordinary matter was helium, first by mass and then by counting atoms. Think about what was around at the start, and what might have been left
              after a few minutes.
            </li>
          </ol>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Element:</strong> a kind of atom, such as hydrogen, helium or lithium, set by how many protons its nucleus holds.
            </li>
            <li>
              <strong>Nucleus:</strong> the tiny centre of an atom, made of protons and neutrons.
            </li>
            <li>
              <strong>Proton and neutron:</strong> the two particles that make up a nucleus. A proton has a positive electric charge. A neutron has none, and is slightly heavier.
            </li>
            <li>
              <strong>Isotope, helium-4 and deuterium:</strong> an isotope is a version of an element with a particular number of neutrons. Helium-4 has 2 protons and 2 neutrons. Deuterium is hydrogen with one proton and one neutron.
            </li>
            <li>
              <strong>Ordinary matter:</strong> the matter that atoms are made of, as opposed to dark matter.
            </li>
            <li>
              <strong>Nucleosynthesis:</strong> the making of nuclei. Big Bang nucleosynthesis is the making of the first nuclei in the early universe, in its first minutes.
            </li>
            <li>
              <strong>MeV:</strong> a million electron-volts, a unit of energy used for single particles.
            </li>
            <li>
              <strong>By number and by mass:</strong> two ways to give a share of a mixture: counting the atoms, or weighing them.
            </li>
            <li>
              <strong>Abundance:</strong> how much there is of an element, as a share of the whole.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions about the early universe’s ordinary matter: one about how much of it was helium by mass, and one about counting atoms. Then run the experiment in five stages, from the hot mixture at the start to the real
            tests of three light elements, then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings about the neutrons.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two settings under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The page’s own calculation is a simplified one. It works out only the step from neutrons to helium. It leaves out the full chain of nuclear reactions that the real calculations follow, so the amounts of deuterium and lithium
            on this page come from published papers and are shown as quoted. One number in the simplified calculation is chosen by this page, not measured, and the page says so wherever it is used. The page’s numbers show the idea and not the papers’ full
            analysis. Stars made the heavier elements much later, and the page does not follow that.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the tests, and plain pages from Berkeley Lab on where the elements came from, are listed after the run,
            because they give away what the tests found.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.energy.gov/science/doe-explainsnuclei">DOE Explains…Nuclei</ExternalLink>: a plain account of what the nucleus of an atom is made of and how small it is.
            </li>
            <li>
              <ExternalLink href="https://www.energy.gov/science/doe-explainsisotopes">DOE Explains…Isotopes</ExternalLink>: what an isotope is, with carbon-12, carbon-13 and carbon-14 as examples, and the names deuterium and tritium for forms of hydrogen.
            </li>
            <li>
              <ExternalLink href="https://www.nist.gov/news-events/news/2014/02/toward-new-precision-measuring-neutron-lifetime">NIST: Toward New Precision in Measuring the Neutron Lifetime</ExternalLink>: how long a free neutron lasts, what it turns into, and why two kinds of experiment disagree. It also says, in one
              sentence, that models of how the light elements formed after the Big Bang depend on the precision of this measurement.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA or another official source was found that explains how the first nuclei formed without also giving the answers to the questions in this experiment, so this page explains the idea in its own words, and the pages that give the answers
            are listed after the run.
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
              <PictureOne stage={stage} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo shareGuessId={shareGuess} atomGuessId={atomGuess} />
                  {pictureTwoCaption()}
                </>
              )}
              {stage >= 4 && (
                <>
                  <PictureThree stage={stage} />
                  {pictureThreeCaption(stage)}
                </>
              )}
            </div>
          )}
          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> In the pictures above, the neutrons waited {PRESET_WAIT_S} seconds and the neutron was heavier than the proton by {massDifference.toFixed(2)} MeV. Here you can try other values. You choose two things:
              </p>
              <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>How long the neutrons wait</strong>: the time in seconds from the start at which the page counts the neutrons that are left. The value used in Part 1 is {PRESET_WAIT_S} seconds, about three minutes.
                </li>
                <li>
                  <strong>How much heavier the neutron is than the proton</strong>: half the real difference, the real difference, or twice the real difference. This changes how many neutrons there are at the start of the wait. The page uses one rule for that, which the tutor explains.
                </li>
              </ol>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>One drawing then shows, for your choices:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The neutrons per proton</strong> left after the wait.
                </li>
                <li>
                  <strong>The helium share</strong>, by weight and by counting atoms, beside the real settings (in cyan) and the measured value (in green).
                </li>
                <li>
                  <strong>Your trial</strong> in pink, because it is imagined for the question.
                </li>
              </ul>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Your guesses do not change the drawings or tables, but these two settings do.</strong> They change only Drawing A. The pictures above stay the same. These are trial values, your own numbers, and not measurements: they do not say the real early universe was like that.
              </p>

              <div style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>How long the neutrons wait</label>
                {WAIT_CHOICES_S.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTrialWaitS(w)}
                    className={`toggle-button${trialWaitS === w ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {w} seconds{w === PRESET_WAIT_S ? ' (the real value)' : ''}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>How much heavier the neutron is than the proton</label>
                {MASS_DIFFERENCE_CHOICES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTrialMassId(c.id)}
                    className={`toggle-button${trialMassId === c.id ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {c.label} ({(massDifference * c.factor).toFixed(2)} MeV)
                  </button>
                ))}
              </div>
              <TrialDrawing settings={settingsFromChoices(trialWaitS, trialMassId)} />
              {trialCaption(settingsFromChoices(trialWaitS, trialMassId))}
            </div>
          )}
          {done && <EarlyUniverseRecipeResults shareGuess={shareGuess} atomGuess={atomGuess} />}

          {done && shareGuess !== null && atomGuess !== null && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0066cc' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#0066cc' }}>Part 4: The tutor</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> You have seen the pictures and the tables. This last part is a short conversation with a tutor. It will ask what you noticed, ask you to set your guesses beside the real results, and ask one question about the neutrons before it explains. Only then does it say how your guesses compared.
              </p>
              <EarlyUniverseRecipeTutor shareGuess={shareGuess} atomGuess={atomGuess} onExplained={onTutorComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
