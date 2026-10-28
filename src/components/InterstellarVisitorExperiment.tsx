import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ReferencePanel } from './EnergyMomentumExperiment'
import {
  AU,
  ATLAS_3I,
  BEND_CHOICES,
  SPEED_CHOICES,
  TRIAL_CLOSEST_AU,
  TRIAL_DEFAULT_CLOSEST_AU,
  TRIAL_DEFAULT_SPEED_KM_S,
  TRIAL_SPEEDS_KM_S,
  atlasClosestApproachM,
  atlasSpeedFarAway,
  escapeSpeed,
  trialPicture,
} from '../physics/interstellarVisitor'
import type { BendChoiceId, SpeedChoiceId } from '../physics/interstellarVisitor'
import { EARTH } from '../physics/fastestSpacecraft'
import { PictureOne, PictureTwo, TRIAL_CLOSEST_LABELS, TRIAL_SPEED_LABELS, TrialDrawing, pictureOneCaption, pictureTwoCaption, trialCaption } from './InterstellarVisitorPictures'

// Frontier and Beyond, Experiment 24 (docs/experiments/frontier-and-beyond/24-a-visitor-from-another-star.md).
// STEPS 2 to 4 (the interface skeleton and the introduction, the two predictions, then the run and Pictures 1 and 2 with the guesses): this file has the title, the status line, the introduction, the collapsed
// "Words and formulas" panel, the "Want to know more?" links and Part 1 with the two predictions and the five-stage run (the pictures are in `InterstellarVisitorPictures.tsx`). It has no controls, results, tutor or
// summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the owner's line-by-line approval
// (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how much the Sun bends the path of 3I/ATLAS, how fast it was going at its closest approach, or any other number that
// the two predictions ask for (CLAUDE.md §12). The pages that give those numbers away (NASA's and ESA's pages on 3I/ATLAS both give its speed at closest approach) are listed only after the
// run, in a later step. The introduction has no computed number in it, so it needs nothing from the physics module (CLAUDE.md §9).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const

// The "Words and formulas" panel. Terms only, with no formula and no number that a prediction asks for (CLAUDE.md §12): the formulas are shown in Part 3, after the run.
function referenceEntries(): { term: string; meaning: string }[] {
  return [
    {
      term: 'Interstellar object',
      meaning:
        'something that comes from outside our solar system, from the space between the stars, passes through it, and leaves again. “Interstellar” means “between the stars”. Only three have ever been seen: 1I/ʻOumuamua in 2017, 2I/Borisov in 2019 and 3I/ATLAS in 2025. In the name, the number says which one it is, the “I” says interstellar, and the rest is its name.',
    },
    {
      term: 'Comet',
      meaning:
        'a ball of ice, rock and dust, a few hundred metres to several kilometres across, that gives off gas and dust as it is warmed by the Sun. The gas and dust form a glowing cloud round it and long tails, which can be much bigger than the ball itself.',
    },
    {
      term: 'Orbit',
      meaning: 'the path of one object moving under the pull of another, such as a planet round the Sun. In this experiment the Sun’s gravity is the only pull we use.',
    },
    {
      term: 'Closed path (ellipse)',
      meaning: 'an orbit that loops back on itself, like an oval. An object on a closed path goes round and round the Sun for ever, such as the Earth or a comet that returns every few years.',
    },
    {
      term: 'Open path (hyperbola)',
      meaning:
        'an orbit that does not loop back. The object comes in from far away, swings past the Sun, and goes off again, never to return. Its path is a curve that is bent near the Sun and nearly straight far away on both sides.',
    },
    {
      term: 'Escape speed',
      meaning:
        'the speed above which an object will never be pulled back by the gravity of the body it is leaving (a planet, or the Sun), however long it travels. A ball thrown gently upwards from the ground comes back down, because the Earth’s pull slows it to a stop and then pulls it back. Thrown hard enough, it would never come back: for the Earth, that speed is about 11 kilometres a second (Smithsonian). The escape speed is bigger nearer to the Sun, where the pull is stronger and there is more of it to climb out of.',
    },
    {
      term: 'Closest approach (perihelion)',
      meaning: 'the point on the path where the object is nearest to the Sun. “Peri” means “near” and “helios” means “Sun”.',
    },
    {
      term: 'Speed far away',
      meaning: 'the speed an object has when it is so far from the Sun that the Sun’s pull on it has almost gone. It is the speed it comes in with, and, in this model, the speed it goes away with.',
    },
    {
      term: 'Eccentricity',
      meaning:
        'a number that says how open a path is. Zero is a perfect circle, a number between zero and one is an oval (a closed path), and a number above one is an open path. The higher the number above one, the straighter the path.',
    },
    {
      term: 'Bend',
      meaning: 'the angle through which the Sun’s pull turns an object’s direction of travel: the angle between the direction it was travelling in before it reached the Sun and the direction it travels in after it has gone past. A path that is not bent at all is a straight line, and its bend is 0 degrees.',
    },
    {
      term: 'Astronomical unit (AU)',
      meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. Distances in the solar system are often given in AU: Mars is about 1.5 AU from the Sun, and Jupiter about 5.',
    },
    {
      term: 'Kilometres per second (km/s)',
      meaning: 'a way of giving speed. One kilometre per second is 3,600 kilometres an hour, so a car at 100 kilometres an hour is going less than 0.03 km/s. The Earth goes round the Sun at about 30 km/s.',
    },
  ]
}

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The Sun and the planets', 'The path coming in', 'The closest approach and its speed', 'The path going out', 'The bend']
const STAGE_LINES = [
  '',
  'The Sun is at the centre, with the orbits of the Earth, Mars and Jupiter for scale. One AU is the Earth’s distance from the Sun.',
  'The cyan line is the path of 3I/ATLAS coming in from far away, calculated from its published orbit. The arrow shows which way it travels.',
  'The cyan dot is the closest approach. Picture 2 shows its speed against its distance from the Sun. Your guess for Prediction 2 is the white marker.',
  'The path goes on past the Sun and out again.',
  'The dashed line is the way it was heading before it reached the Sun, and the cyan arrow is the way it leaves. The angle between them is the bend. Your guess for Prediction 1 is the white line.',
]

interface InterstellarVisitorExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function InterstellarVisitorExperiment({ onComplete }: InterstellarVisitorExperimentProps) {
  const [bendGuess, setBendGuess] = useState<BendChoiceId | null>(null)
  const [speedGuess, setSpeedGuess] = useState<SpeedChoiceId | null>(null)
  const [trialSpeed, setTrialSpeed] = useState<number>(TRIAL_DEFAULT_SPEED_KM_S)
  const [trialClosest, setTrialClosest] = useState<number>(TRIAL_DEFAULT_CLOSEST_AU)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = bendGuess !== null && speedGuess !== null
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
    setBendGuess(null)
    setSpeedGuess(null)
    setTrialSpeed(TRIAL_DEFAULT_SPEED_KM_S)
    setTrialClosest(TRIAL_DEFAULT_CLOSEST_AU)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  // The inputs that the predictions give the learner, from the physics module (display rounding only, CLAUDE.md §9).
  const speedFarAwayKmS = Math.round(atlasSpeedFarAway() / 1e3)
  const closestAu = ATLAS_3I.closestApproachAu.toFixed(2)
  const closestMillionKm = Math.round(atlasClosestApproachM() / 1e9)
  const earthSpeedForScale = Math.round(EARTH.orbitalSpeed / 1e3)
  const trial = trialPicture(trialSpeed, trialClosest)
  // Display rounding of the module's escape speeds (no physics here, CLAUDE.md §9).
  const earthEscape = Math.round(escapeSpeed(AU) / 1e3)
  const earthSpeed = Math.round(EARTH.orbitalSpeed / 1e3)
  const jupiterEscape = Math.round(escapeSpeed(5 * AU) / 1e3)
  return (
    <div>
      <h2>Experiment 24 — A Visitor From Another Star (How Far Does the Sun Bend Its Path?)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): settled. In July 2025 astronomers found a comet, named 3I/ATLAS, that had come from outside our solar system, from the space between the stars. Its path round the Sun is known very precisely, and this experiment uses only that path. What the object is made of, and
            how old it is, are separate questions that are still being studied, and they are not part of this experiment. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Gravity Experiment 6 you launched a body near a heavy one and saw one of three things: it fell in, it went round and round, or it escaped. This experiment looks at a real case of the third kind. On
            July 1, 2025, an object was found that had come from another star and was passing the Sun. The question is not what it is made of. It is about its path: why the Sun could not hold on to it, what the Sun’s gravity did to its speed, and how much the Sun
            bent its path as it went by.
          </p>

          <p style={paragraph}>
            <strong>A visitor from another star.</strong> Things from outside our solar system, passing through it, are called <strong>interstellar objects</strong>. Before 2017 none had been confirmed. Since then there have been three: 1I/ʻOumuamua
            (2017), 2I/Borisov (2019) and, on July 1, 2025, <strong>3I/ATLAS</strong>, found by the ATLAS survey, a NASA-funded telescope in Chile. The name tells you three things: the “3” says it is the third, the “I” says it is interstellar, and “ATLAS” is the survey that found it.
            It is a <strong>comet</strong>: a ball of ice and rock that gives off gas and dust when the Sun warms it, which forms a glowing cloud and tails round it. It came in from the general direction of the constellation Sagittarius. At the end of October 2025
            it passed closest to the Sun, between the orbits of Earth and Mars, and then it kept going: it passed Mars in October, came no closer to Earth than about 270 million kilometres in December, and passed Jupiter in March 2026. It is now on its way
            out of the solar system for good.
          </p>

          <p style={paragraph}>
            <strong>Why some paths close and others do not.</strong> Think of throwing a ball straight up from the ground (and ignore the air, which would slow it too). Thrown gently, it rises, slows, stops and falls back: the Earth’s gravity has held on to it. Thrown fast enough, it would never come back, because
            gravity could never slow it to a stop. That speed is called the <strong>escape speed</strong>, and for the Earth it is about 11 kilometres a second. The same is true for the Sun. An object that is moving more slowly than the Sun’s escape speed
            at its distance is held, and goes round the Sun on a closed path, an oval called an <strong>ellipse</strong>, like the Earth or a comet that comes back every few years. The Earth is an example: it moves at about {earthSpeed} kilometres a second round the Sun, which is less than the {earthEscape} kilometres a second that is the escape speed at its distance, so the Sun holds it. An object that is moving faster than the escape speed is not held. It comes in,
            is pulled round the Sun, and leaves for good on an open path called a <strong>hyperbola</strong>. The escape speed is larger the closer you are to the Sun. Here is why. The Sun’s pull gets weaker with distance. An object that starts close to the Sun is deep in its pull and has a long way to climb out of it, so it needs a high speed. An object that starts far away is already out where the pull is weak, so a lower speed is enough. It is like climbing out of a deep hole: from near the bottom you need a big push to reach the top, but from halfway up a small push is enough. For example, at the Earth’s distance from the Sun the escape speed is about {earthEscape} kilometres a second, and at Jupiter’s distance, about five times farther out, it is only about {jupiterEscape}. Every interstellar object found so far, 3I/ATLAS included, has been on an open path.
          </p>

          <p style={paragraph}>
            <strong>Two numbers that describe the path.</strong> A hyperbola is described by how open it is, a number called its <strong>eccentricity</strong>. Zero is a perfect circle, a number between zero and one is an oval, and a number above one is an open
            path, and the higher it is above one, the straighter the path. The Sun’s pull also turns the object as it goes by, and the angle it is turned through is called the <strong>bend</strong>. Far from the Sun, before the object gets near, it travels in a straight line in one direction. Near the Sun, its path curves.
            Then, far on the other side, it travels in a straight line again, but in a different direction. The bend is the angle between those two directions of travel. It is like a car that drives along a street, turns a corner and drives on: if it turns
            at a crossroads from one street into another at right angles, it has been turned through 90 degrees, and if it drives straight on, it has been turned through 0 degrees. In this experiment you will see these two numbers for 3I/ATLAS, and they are worked out from only two measurements: how fast it was going when it was far from the Sun, and how close it came.
          </p>

          <p style={paragraph}>
            <strong>Your job.</strong> You will make two guesses before anything is shown: how much the Sun’s gravity bent the path of 3I/ATLAS in all, and how fast it was going at its closest approach. Then you will run the experiment, compare your guesses
            with what the calculation gives, and try other speeds and other closest approaches of your own, to see what would make the path bend more or less. After that, a tutor will talk it over with you.
          </p>

          <p style={paragraph}>
            <strong>What your guesses do.</strong> Your guesses never change the real pictures or tables. The pictures and tables come only from the calculation. Your guesses are drawn on the pictures in white, so that you can compare them with the real result,
            and they are shown again next to the results. In the “Now try it yourself” part, the settings you choose do change the drawing next to them, and only that drawing.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this page does and does not model.</strong> It treats the Sun’s gravity as the only pull on the object. It does not model the planets’ pulls (small here), the push of the comet’s own gas as it boils off (astronomers have measured a tiny push of this kind), the effects of relativity (tiny at these speeds), or anything about what the object is made of or how old it is. The real path of 3I/ATLAS, as published, is the starting point.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers, and the NASA and ESA pages about 3I/ATLAS itself, are listed after the run, because they give
            the numbers that the predictions ask for.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/solar-system/comets/">NASA: Comets</ExternalLink>: NASA’s plain account of what a comet is, why it grows a glowing head and a tail near the Sun, and the comets that have come
              from beyond our solar system.
            </li>
            <li>
              <ExternalLink href="https://howthingsfly.si.edu/ask-an-explainer/what-speed-spacecraft-has-reach-it-escapes-earths-gravitational-field-and-able-trav">
                Smithsonian National Air and Space Museum: What speed must a spacecraft reach to escape the Earth’s gravity?
              </ExternalLink>
              : a short answer from the Museum’s “How Things Fly” site, giving the Earth’s escape speed (about 11 kilometres a second) and saying that other planets, moons and stars have their own.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: a calculation of the path of a
            visitor under the Sun’s gravity alone, and the published path of 3I/ATLAS. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess
            compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: how much does the Sun bend its path?',
                text: (
                  <>
                    When 3I/ATLAS was far from the Sun it was going about {speedFarAwayKmS} kilometres a second (for scale, the Earth goes round the Sun at about {earthSpeedForScale}). It passed the Sun at its closest approach, {closestAu} times the Earth’s distance from the Sun,
                    which is about {closestMillionKm} million kilometres. The Sun’s pull turned its direction of travel. From the direction it was travelling in before it reached the Sun to the direction it travelled in after it had gone past, about how many
                    degrees was its path turned through in all? (A path that is not bent at all is 0 degrees. A path that turned right round and went back the way it came would be 180 degrees.)
                  </>
                ),
                choices: BEND_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: bendGuess as string | null,
                set: (v: string) => setBendGuess(v as BendChoiceId),
              },
              {
                title: 'Prediction 2: how fast was it going at its closest approach?',
                text: (
                  <>
                    Far from the Sun, 3I/ATLAS was going about {speedFarAwayKmS} kilometres a second. As it came in, the Sun’s gravity pulled on it all the way. About how fast was it going at its closest approach to the Sun, {closestAu} times the Earth’s distance
                    from the Sun? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
                  </>
                ),
                choices: SPEED_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: speedGuess as string | null,
                set: (v: string) => setSpeedGuess(v as SpeedChoiceId),
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
                {done ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here. Below is Part 2, where you can try other speeds and closest approaches. The rest of the page is built in later steps.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>
          {status !== 'idle' && (
            <div>
              <PictureOne stage={stage} bendGuess={bendGuess} />
              {pictureOneCaption(stage)}
              {stage >= 3 && (
                <>
                  <PictureTwo stage={stage} speedGuess={speedGuess} />
                  {pictureTwoCaption()}
                </>
              )}
            </div>
          )}

          {done && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>What we are about to do.</strong> Above, you saw one visitor: 3I/ATLAS. Here you can try other visitors. Choose how fast a visitor is going when it is far from the Sun, and how close it comes to the Sun, and one drawing
                will show its path, how open the path is (its eccentricity) and how much the Sun bends it. The real pictures above do not change, and your two guesses do not change this drawing: only the two settings below do.
              </p>
              <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>These are your own trial values, not real objects.</strong> Each button is a number to try. For example, if you choose {TRIAL_SPEED_LABELS[trialSpeed]?.replace(/ \(.*\)$/, '')} and {trialClosest.toFixed(2)} AU, the drawing works out the path of a visitor like that, with the same formulas as
                Pictures 1 and 2. Such a visitor is imagined for the question, and it is drawn in pink. The path is calculated for the Sun’s gravity alone.
              </p>

              {(
                [
                  {
                    title: 'How fast is the visitor going when it is far from the Sun?',
                    choices: TRIAL_SPEEDS_KM_S.map((v) => ({ value: v as number, label: TRIAL_SPEED_LABELS[v] })),
                    value: trialSpeed,
                    set: setTrialSpeed,
                  },
                  {
                    title: 'How close does it come to the Sun?',
                    choices: TRIAL_CLOSEST_AU.map((v) => ({ value: v as number, label: TRIAL_CLOSEST_LABELS[v] })),
                    value: trialClosest,
                    set: setTrialClosest,
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
        </div>
      </div>
    </div>
  )
}
