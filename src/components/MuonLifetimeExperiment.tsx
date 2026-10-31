import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PictureOne, PictureThree, PictureTwo, pictureOneCaption, pictureThreeCaption, pictureTwoCaption } from './MuonLifetimePictures'
import {
  LIFETIME_ANSWER_CHOICES,
  MOUNT_BETA,
  MOUNT_HEIGHT_M,
  REST_LIFETIME_US,
  SHARE_ANSWER_CHOICES,
  heightInLightDistances,
  lightDistanceInOneLifetimeM,
  ringBeta,
  shareAfterLifetimes,
} from '../physics/muonLifetime'

// Evidence and Imagination, Experiment 4 (docs/experiments/evidence-and-imagination/04-do-fast-muons-live-longer.md).
// Step 2: the title, the status line, the introduction and the "Want to know more?" links. The predictions, the run, the pictures, the controls, the results and the tutor come in later steps.
// The wording below is Claude's DRAFT of 2026-10-31, for the owner's approval (CLAUDE.md §28.1). Nothing here says whether a moving muon lasts longer or shorter than a muon at rest, gives the factor
// by which a moving clock is slowed, or gives either test's result, because the two predictions and the results ask for them (CLAUDE.md §12). The papers are listed only after the run.
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
const STAGE_NAMES = ['', 'The decay clock at rest', 'The fall, with the lifetime unchanged', 'The count at the two stations', 'The ring', 'The same fall in a muon’s own view']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, shows how the share of muons still alive falls as time passes, for muons at rest.',
  'Panel B shows the fall from the top of Mount Washington, and the share left at sea level if every muon lasted only its rest lifetime. Your first guess is drawn on it.',
  'The measured count from 1962 and a second calculation are added to the same ruler, so that you can see all three marks and your guess together.',
  'Picture 2 shows the average lifetime of muons at rest, and of muons going round the storage ring at CERN, by calculation and by measurement. Your second guess is drawn on it.',
  'Picture 3 describes the same mountain fall twice: as the ground describes it, and as a muon with its own ruler and clock would describe it. The sources are listed with the results.',
]

interface MuonLifetimeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function MuonLifetimeExperiment({ onComplete }: MuonLifetimeExperimentProps) {
  const [shareGuess, setShareGuess] = useState<string | null>(null)
  const [lifetimeGuess, setLifetimeGuess] = useState<string | null>(null)
  const oneLifetime = shareAfterLifetimes(1) * 100
  const twoLifetimes = shareAfterLifetimes(2) * 100
  const threeLifetimes = shareAfterLifetimes(3) * 100
  const lightMetres = lightDistanceInOneLifetimeM()
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = shareGuess !== null && lifetimeGuess !== null
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
    setLifetimeGuess(null)
    setStatus('idle')
    setStage(0)
  }
  const questions = [
    {
      title: 'Prediction 1: how many muons are still alive at sea level?',
      text: (
        <>
          Muons move straight down at {MOUNT_BETA} c ({(MOUNT_BETA * 100).toFixed(1)} percent of the speed of light) relative to the ground. They pass the top of Mount Washington, which is {MOUNT_HEIGHT_M.toLocaleString('en-US')} metres above sea level, and
          fall to a detector at sea level. At rest, a muon lasts {REST_LIFETIME_US.toFixed(1)} millionths of a second on average. Out of every 100 muons that pass the mountain top, about how many are still alive when they reach sea level?
        </>
      ),
      choices: SHARE_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: shareGuess,
      set: setShareGuess,
    },
    {
      title: 'Prediction 2: how long do muons in the ring last?',
      text: (
        <>
          At CERN, muons were stored in a ring, held on a circular track by magnets. They went round at {ringBeta().toFixed(5)} c, which is {(ringBeta() * 100).toFixed(2)} percent of the speed of light, relative to the laboratory. At rest they last{' '}
          {REST_LIFETIME_US.toFixed(1)} millionths of a second on average. On average, how long did the muons in the ring last, as the laboratory’s clocks measured it? This is a separate guess from Prediction 1, so your two answers do not have to agree with each
          other.
        </>
      ),
      choices: LIFETIME_ANSWER_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
      value: lifetimeGuess,
      set: setLifetimeGuess,
    },
  ]
  return (
    <div>
      <h2>Experiment 4 — How Long Does a Muon Live?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled. “Settled” means that it has been tested by real measurements and scientists no longer doubt it. The two tests used on this page are old ones, from 1962 and 1977. Nothing here is a new result. The page
            shows how the idea has been tested, not a discovery.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Some particles do not last. They fall apart after a short time, and the time is always about the same for every particle of that kind. That makes the falling apart useful: it can be used as a clock. This
            experiment is about one such particle, the muon. A muon at rest lasts, on average, only about {REST_LIFETIME_US.toFixed(1)} millionths of a second. The question is how long a muon really lasts when it is moving, and what has actually been measured.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Why muons look like a puzzle.</strong> Here are the numbers, in steps.
          </p>
          <ol style={list}>
            <li>
              <strong>How far can a muon go before it falls apart?</strong> Nothing travels faster than light, which moves about 300,000 km every second. A muon lasts about {REST_LIFETIME_US.toFixed(1)} millionths of a second (0.0000022 s). Distance = speed × time, so
              300,000 km/s × 0.0000022 s = about {(lightMetres / 1000).toFixed(2)} km, or {lightMetres.toFixed(0)} metres. Even at nearly the speed of light, a muon could go only about this far. That is roughly 7 football pitches laid end to end.
            </li>
            <li>
              <strong>How far did the muons actually travel?</strong> Cosmic rays make muons high in the air. A typical height is about 15 km, which is about as high as a jet airliner flies, or a little higher. That is far more than {(lightMetres / 1000).toFixed(2)} km:
              it is about {heightInLightDistances(15000).toFixed(0)} times as far. Muons are in fact made over a range of heights, so 15 km is a typical figure (it comes from an educational page, not from a measurement on this page). The puzzle does not depend on it: even for muons
              made as low as 5 km, that is still about {heightInLightDistances(5000).toFixed(1)} times as far.
            </li>
            <li>
              <strong>Why that is a puzzle.</strong> Imagine a candle that burns for 10 minutes. Someone carries it along a road that takes 4 hours to walk, and it still arrives alight. You would suspect something odd. Muons are like that candle: by the
              {' '}{lightMetres.toFixed(0)} metre mark they should have mostly fallen apart, yet many are still detected at the ground. “Average” matters here. A few muons live longer than average, but surviving {heightInLightDistances(15000).toFixed(0)} times the average is
              extremely rare, so it could not account for the large number detected.
            </li>
            <li>
              <strong>A second test, in a laboratory.</strong> Scientists have also tested muons in a laboratory, without waiting for them to fall from the sky. In 1977, at CERN (the European particle-physics laboratory near Geneva), they used magnets to steer muons round and round a circular track called a
              <em> storage ring</em>, so that the muons could be timed for as long as they lasted. The muons went round at {(ringBeta() * 100).toFixed(2)} percent of the speed of light. It asks the same question as the muons from the sky: how long does a
              moving muon last?
            </li>
          </ol>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> Imagine a crowd of people who each flip a coin every second and leave the game the first time it comes up heads. Nobody can say when one particular person will leave, but the crowd shrinks in a regular
            way: in any stretch of time, the same fraction of the people who are still there leave. A muon’s falling apart works like this. Each muon has the same chance of falling apart in each moment, whatever has happened to it before. That regular
            shrinking is what makes the falling apart a clock.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Muon:</strong> a tiny particle, a heavy cousin of the electron. Fermilab, the American particle-physics laboratory, describes muons as heavy cousins of the electron that live for only about two millionths of a second before
              they decay.
            </li>
            <li>
              <strong>Cosmic ray:</strong> a particle or atomic nucleus that comes from space and hits the air high above the ground. The hit makes a shower of other particles, and some of them fall apart into muons. Muons are made over a range of heights (step 2 above gives a typical one).
            </li>
            <li>
              <strong>Decay:</strong> a particle falling apart into other, lighter particles. A muon decays into an electron and other particles.
            </li>
            <li>
              <strong>Microsecond (µs):</strong> one millionth of a second. So a muon lasts about 2.2 µs, which is 2.2 millionths of a second.
            </li>
            <li>
              <strong>Average lifetime:</strong> the average time a muon lasts before it decays. For a muon at rest it is {REST_LIFETIME_US.toFixed(3)} µs (a value measured very precisely, to about one part in a million). It is not the time at which
              half of them are gone: half are gone sooner than that.
            </li>
            <li>
              <strong>Share still alive:</strong> out of every 100 muons that start together, how many have not yet decayed. After one average lifetime, about {oneLifetime.toFixed(1)} of every 100 are left. In each following lifetime, the number left is
              multiplied by the same {(oneLifetime / 100).toFixed(3)} again. Worked out: 100 × {(oneLifetime / 100).toFixed(3)} = {oneLifetime.toFixed(1)}; then {oneLifetime.toFixed(1)} × {(oneLifetime / 100).toFixed(3)} ={' '}
              {twoLifetimes.toFixed(1)}; then {twoLifetimes.toFixed(1)} × {(oneLifetime / 100).toFixed(3)} = {threeLifetimes.toFixed(1)}. So after two lifetimes about {twoLifetimes.toFixed(0)} of every 100 are left, and after three about{' '}
              {threeLifetimes.toFixed(0)}.
            </li>
            <li>
              <strong>Relative to the lab, and reference frame:</strong> a speed or a time is always measured by someone. “Relative to the lab” means measured by someone at rest in the laboratory, or on the ground. A <strong>reference frame</strong> is
              that observer’s point of view, with the rulers and clocks the observer carries (Experiment 2 of the first chapter). A muon moving down through the air has a frame of its own too, the one that moves along with it.
            </li>
            <li>
              <strong>c:</strong> the speed of light in empty space, about 300,000 kilometres per second. “0.5 c” means half of that.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>A puzzle in the numbers.</strong> Light is the fastest thing there is. In one average muon lifetime, even light goes only about {(lightMetres / 1000).toFixed(2)} kilometres, less than a mile. A muon can go no faster than light. Yet muons are
            made around 15 kilometres up. This page asks how many of them are still alive when they get down, and checks the answer against two real experiments.
          </p>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> The first chapter of this site looked at how a moving clock and a moving ruler behave, and it was careful to say whose clock and whose ruler. A decaying particle is a clock that nature supplies,
            and muons made by cosmic rays have been used to test those ideas. The two tests on this page are an experiment on a mountain in New Hampshire in the 1960s that counted muons high up and at sea level, and an experiment at
            CERN, the European particle-physics laboratory, in 1977. Neither is a new result. They are here so that you can set your own expectation beside what was measured. This page does not give the results until you have made your predictions.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions: one about muons that fall from a mountain top to sea level, and one about muons in a ring at CERN (the ring is explained when you get to it). Then run the experiment in five stages: the
            decay clock at rest; the everyday expectation for the fall; the real count at the two stations; the ring; and the same fall as the muon itself would describe it. Then read the results and talk them through with the tutor. Under “Now
            try it yourself” you can change two settings: the muon’s speed and the height it starts from.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The page uses a simple model: a muon falls straight down at one steady speed, from one chosen height, and loses no energy on the way. A muon’s decay is the same chance in each moment. Real muons are made over a range
            of heights and speeds and slow down as they fall, and the real experiments dealt with such details more carefully, so the page’s numbers show the idea, not the papers’ full analysis. Each time or length is measured by the observer named, with that
            observer’s own clock or ruler. The muon’s own point of view is imagined for the question, because no one can ride along with a muon.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the tests are listed after the run, because they give away the answers to the
            predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.fnal.gov/pub/science/particle-physics/experiments/muons.html">Fermilab: Muons</ExternalLink>: a short, plain account of what muons are and why physicists use them.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA, CERN, Fermilab or another official source was found that explains a decaying particle as a clock, or how cosmic rays make muons high in the air, so this page explains them in its own words.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and then run the experiment. The pictures that the run will draw show fixed things: numbers calculated here, set beside what was
            measured in the two real tests. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess compares. The real pictures stay the same whatever you guess.
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
              <PictureOne stage={stage} shareGuessId={shareGuess} />
              {pictureOneCaption(stage)}
              {stage >= 4 && (
                <>
                  <PictureTwo lifetimeGuessId={lifetimeGuess} />
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
        </div>
      </div>
    </div>
  )
}
