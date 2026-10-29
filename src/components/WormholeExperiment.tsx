import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CROSS_CHOICES, MASS_CHOICES, PREDICTION_THROAT_RADIUS_M, TRIAL_DEFAULT_PLATE_GAP_M, TRIAL_DEFAULT_THROAT_RADIUS_M, TRIAL_PLATE_GAPS_M, TRIAL_THROAT_RADII_M, trialPicture } from '../physics/wormholes'
import type { CrossChoiceId, MassChoiceId } from '../physics/wormholes'
import { WormholeResults } from './WormholeResults'
import { PictureOne, PictureThree, PictureTwo, TrialDrawing, pictureOneCaption, pictureThreeCaption, pictureTwoCaption, trialCaption } from './WormholePictures'

// Evidence and Imagination, Experiment 1 (docs/experiments/evidence-and-imagination/01-can-a-wormhole-exist.md).
// Steps 2 to 6: the title, the status line, the introduction, the "Want to know more?" links, the two predictions and the five-stage run with Pictures 1 to 3 and their captions, and (Step 5) the "Now try it yourself" part with its two controls and Drawing A (all in `WormholePictures.tsx`).
// (Step 6) The results (`WormholeResults.tsx`). The tutor comes in a later step.
// The wording is the owner's draft of 2026-10-29, approved (CLAUDE.md §28.1), with the one-line honesty note kept on the page at the owner's request. Nothing here says that a throat pinches
// off, how much negative mass a throat needs, or how small the Casimir energy is, because the predictions and the results ask for them (CLAUDE.md §12). The papers are listed only after the run.

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
const STAGE_NAMES = ['', 'A wormhole would be a tunnel', 'The shape of the throat', 'The simplest one, over time', 'What it would take to hold one open', 'What has been looked for']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, is a sketch of two far places joined by a tunnel.',
  `Panel B shows the outline of a throat ${PREDICTION_THROAT_RADIUS_M} metre in radius.`,
  'Picture 2 shows the simplest wormhole at four moments, with a ray of light sent in.',
  `Picture 3 shows the negative mass that a ${PREDICTION_THROAT_RADIUS_M} metre throat needs, and the tension at the throat.`,
  'Astronomers have searched gravitational-wave data for echoes that a wormhole might leave. As of October 2026 none has been found. The searches are listed with the results.',
]
const radiusLabel = (m: number) => (m < 1 ? `${m * 1000} millimetre` : m >= 1000 ? `${m / 1000} kilometre${m === 1000 ? '' : 's'}` : `${m} metre`)
const gapLabel = (m: number) => `${m * 1e6} micrometre${m * 1e6 === 1 ? '' : 's'}`
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface WormholeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function WormholeExperiment({ onComplete }: WormholeExperimentProps) {
  const [crossGuess, setCrossGuess] = useState<CrossChoiceId | null>(null)
  const [massGuess, setMassGuess] = useState<MassChoiceId | null>(null)
  const [trialRadius, setTrialRadius] = useState<number>(TRIAL_DEFAULT_THROAT_RADIUS_M)
  const [trialGap, setTrialGap] = useState<number>(TRIAL_DEFAULT_PLATE_GAP_M)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = crossGuess !== null && massGuess !== null
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
    setCrossGuess(null)
    setMassGuess(null)
    setTrialRadius(TRIAL_DEFAULT_THROAT_RADIUS_M)
    setTrialGap(TRIAL_DEFAULT_PLATE_GAP_M)
    setStatus('idle')
    setStage(0)
  }
  const trial = trialPicture(trialRadius, trialGap)
  const questions = [
    {
      title: 'Prediction 1: could light cross the simplest wormhole?',
      text: (
        <>
          Take the simplest wormhole-like shape that Einstein’s equations give: the Einstein–Rosen bridge, which belongs to a black hole’s full mathematical solution. It joins two regions of space, one on each side. Suppose a ray of light is sent in from
          one side. Could it come out on the other side?
        </>
      ),
      choices: CROSS_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: crossGuess as string | null,
      set: (v: string) => setCrossGuess(v as CrossChoiceId),
    },
    {
      title: 'Prediction 2: how much negative mass would a small wormhole need?',
      text: (
        <>
          Now suppose a wormhole whose throat is {PREDICTION_THROAT_RADIUS_M} metre in radius, so about {2 * PREDICTION_THROAT_RADIUS_M} metres across at its narrowest. As the mathematics of Morris and Thorne requires, it is held open by matter with
          negative energy. Count that negative energy as a negative mass. About how much would it be? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
        </>
      ),
      choices: MASS_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: massGuess as string | null,
      set: (v: string) => setMassGuess(v as MassChoiceId),
    },
  ]
  return (
    <div>
      <h2>Experiment 1 — Can a Wormhole Exist? (What Would It Take to Hold One Open?)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Status as of October 2026: Open. “Open” means that nobody knows whether any wormhole exists. The mathematics allows them on paper, and no one has seen one.</strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Films often show a wormhole as a tunnel that joins two faraway places, so that a ship can cross the galaxy in minutes. Could such a tunnel really exist? Einstein’s theory of gravity, general relativity, allows
            tunnel-like shapes in its equations. This experiment asks two plain questions about the simplest ones: will the tunnel stay open, and what would it take to hold one open? It does not say that wormholes exist, and it does not say that they cannot.
            It shows what the mathematics says, what it needs, and what astronomers have looked for.
          </p>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> Two towns sit on opposite sides of a mountain. The road goes round the mountain, which is long. A tunnel goes straight through, which is short. A wormhole is the same idea for space itself: a tunnel that is
            shorter than any route outside it. You met curved space in the Gravity and Curved Spacetime chapter: mass bends space, and the bending is what we feel as gravity. A wormhole is a bend so strong that space forms a tunnel.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Spacetime:</strong> space and time taken together as one stage. Mass bends it, and that bending is gravity.
            </li>
            <li>
              <strong>Wormhole:</strong> a possible tunnel through spacetime that joins two places, or two universes.
            </li>
            <li>
              <strong>Mouth and throat:</strong> a wormhole has two mouths (its openings) and a throat, its narrowest part, between them.
            </li>
            <li>
              <strong>Einstein–Rosen bridge:</strong> the first wormhole-like shape, found in 1935. It is part of the full mathematical solution for a black hole (Black Holes and Strong Gravity chapter).
            </li>
            <li>
              <strong>Negative energy and exotic matter:</strong> ordinary matter and light have energy above zero. Negative energy would be below the energy of empty space. Matter that had it would be called exotic. No such matter is known in more than a
              trace.
            </li>
            <li>
              <strong>Tension:</strong> a stretching pull, like the pull along a taut rope. Here it is measured as force per square metre (pascals).
            </li>
            <li>
              <strong>Casimir effect:</strong> two metal plates placed very close together in a vacuum are pushed together by a tiny force. The energy in the gap is slightly below that of empty space, which is a very small amount of negative energy. It has
              been measured.
            </li>
            <li>
              <strong>Echo:</strong> a faint repeat of a signal, a little later, in gravitational-wave data. Some ideas say a wormhole, unlike a black hole, would leave one.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where the idea comes from.</strong> The first tunnel-like shape was found in 1935 by Albert Einstein and Nathan Rosen, who were trying to model a particle, not a tunnel. In 1962 Robert Fuller and John Wheeler studied whether such a shape
            could be crossed. In 1988 Michael Morris and Kip Thorne worked out tunnels that a traveller could in principle pass through, and wrote it up, in their paper’s own words, as “a tool for teaching general relativity”.
          </p>

          <p style={paragraph}>
            <strong>What is known today.</strong> No wormhole has ever been seen. NASA says that the mathematics of general relativity allows wormholes, that nobody knows how one would be made, and that there is no evidence for one in the observed universe.
            NASA’s page on black holes adds that black holes are not wormholes: they do not provide shortcuts between different points in space.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions. Then run the experiment in five stages: what a wormhole would be, the shape of its throat, what happens to the simplest one, what it would take to hold one open, and what has been looked
            for. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings: the size of the throat, and the gap between two metal plates.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> Every picture is a toy: a shape worked out from the mathematics, not something anyone has photographed. The model uses only the simplest throat, with no spin, no electric charge and no pull on a traveller’s body, and
            nothing about how one might form.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the numbers are listed after the run, because they give the answers to the
            predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html">NASA Cosmicopia: Are wormholes in space real, or are they only science fiction?</ExternalLink>: NASA’s short answer: the mathematics of general
              relativity allows wormholes, and there is no evidence that any exists. It is a 2005 page, now kept in NASA’s archive.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA Science: Black Holes</ExternalLink>: a plain account of what black holes are, including that they are not shortcuts to other places.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/what-is-gravity/en/">NASA Space Place: What Is Gravity?</ExternalLink>: gravity described as a curve in space, Einstein’s idea.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain NASA or ESA page was found for negative energy, exotic matter or the Casimir effect, so this page explains them in its own words.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: the shape of a wormhole’s throat, what happens to the simplest
            one, and what it would take to hold one open. They are calculated from the mathematics and are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares with the real result. The
            real pictures stay the same whatever you guess.
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
                    {choice.label.charAt(0).toUpperCase() + choice.label.slice(1)}
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
              <PictureOne stage={stage} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo crossGuess={crossGuess} />
                  {pictureTwoCaption()}
                </>
              )}
              {stage >= 4 && (
                <>
                  <PictureThree massGuess={massGuess} />
                  {pictureThreeCaption()}
                </>
              )}
            </div>
          )}
          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> In the pictures above, the throat was {PREDICTION_THROAT_RADIUS_M} metre in radius. Here you can try other sizes, and also try a real laboratory effect. You choose two things:
              </p>
              <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>The throat radius.</strong> How wide the narrowest part of the tunnel is.
                </li>
                <li>
                  <strong>The gap between two metal plates.</strong> Two metal plates held very close together in a vacuum have a tiny amount of negative energy between them (the Casimir effect, explained in the introduction). It is the only negative energy anyone has
                  measured, so it shows how far we are from what a tunnel would need.
                </li>
              </ol>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>One drawing then shows, for your choices:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <li>
                  <strong>How much negative mass the throat would need</strong>, set against a car, a mountain, the Earth and the Sun.
                </li>
                <li>
                  <strong>How strongly the throat’s walls would have to be pulled</strong> to keep it open, set against the pressure at the centre of a massive neutron star.
                </li>
                <li>
                  <strong>How the negative energy of your plates compares with what the throat needs</strong>, and how many times too small the plates’ energy is.
                </li>
              </ul>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                The real pictures above do not change, and your two guesses do not change this drawing. Only the two settings below do.
              </p>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>These are your own trial values, not new measurements.</strong> Each button is a number to try. For example, if you choose a throat {radiusLabel(trialRadius)} in radius and plates {gapLabel(trialGap)} apart, the drawing works out the negative mass and
                energy for a wormhole like that, and the Casimir energy of plates like that, with the same formulas as Pictures 1 to 3. Such a wormhole is imagined for the question, and it is drawn in pink. This does not say that a wormhole like it exists.
              </p>
              {(
                [
                  { title: 'How big is the throat? (its radius)', choices: TRIAL_THROAT_RADII_M.map((v) => ({ value: v as number, label: radiusLabel(v) })), value: trialRadius, set: setTrialRadius },
                  { title: 'How far apart are the two metal plates?', choices: TRIAL_PLATE_GAPS_M.map((v) => ({ value: v as number, label: gapLabel(v) })), value: trialGap, set: setTrialGap },
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
          {done && <WormholeResults crossGuess={crossGuess} massGuess={massGuess} />}
        </div>
      </div>
    </div>
  )
}
