import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CAPERS_LRD_Z9,
  objectAgeYears,
  PREDICTION_SEED_SOLAR,
  SEED_CHOICES,
  SEED_START_AGE_YEARS,
  STANDARD_EFFICIENCY,
  TIME_CHOICES,
  timeAvailableYears,
} from '../physics/blackHoleGrowth'
import type { SeedChoiceId, TimeChoiceId } from '../physics/blackHoleGrowth'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PictureOne, PictureTwo, pictureOneCaption, pictureTwoCaption } from './BlackHoleGrowthPictures'

// Frontier and Beyond, Experiment 23 (docs/experiments/frontier-and-beyond/23-how-fast-can-a-black-hole-grow.md).
// STEPS 2 to 4 (the interface skeleton and the introduction, the two predictions, then the run and Pictures 1 and 2 with the guesses): this file has the title, the status line, the introduction, the collapsed "Words and formulas" panel and the "Want to know more?"
// links. It also has the two predictions (Part 1), the run (five stages) and Picture 1 and Picture 2 with the guesses (in `BlackHoleGrowthPictures.tsx`). It has no controls, results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the owner's line-by-line
// approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how long a black hole of 10 Suns takes to reach the object's mass, how many growth times that is, how small a seed
// could do it, or what a growth time is in years (CLAUDE.md §12): those are the predictions' answers and the run's results. The pages that give them away or hint at them (NASA's Chandra page on
// a black hole growing faster than the limit, which names a seed "less than a hundred Suns", and the papers) are listed only after the run, in a later step.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Black hole and its mass', meaning: 'a black hole is a region from which nothing can escape, and its mass is how much matter it holds. We count mass in “Suns”, one Sun being the mass of our Sun. A black hole of 10 Suns is about the mass of one fairly heavy star (Black Holes Experiment 1).' },
    { term: 'Accretion (“feeding”)', meaning: 'a black hole grows by pulling in gas that is near it. The gas does not fall straight in. It swirls round the black hole in a flat disc, getting hotter and hotter, and shines brightly before it is swallowed. Nothing is burning: the gas glows because falling in makes it hot, not because anything is fusing.' },
    { term: 'Efficiency', meaning: 'how much of the energy stored in the falling matter is given out as light on the way in (Black Holes Experiment 8). Matter is itself a store of energy (E = mc², Spacetime Geometry Experiment 5), and the falling gas gives some of it out: falling makes it speed up, rubbing against itself heats it, and hot gas glows. If the efficiency is 10 percent, then for every 100 kilograms that fall in, the light carries away the energy of 10 kilograms (“10 kilograms’ worth”), and all 100 kilograms are still swallowed.' },
    { term: 'Eddington limit', meaning: 'the fastest a black hole can feed, because the light from the glowing gas pushes outward on the gas that is still falling in. The faster the black hole feeds, the brighter the gas shines and the harder it pushes back, until pull and push are equal and the feeding cannot speed up. It is named after the astronomer Arthur Eddington.' },
    { term: 'Exponential growth', meaning: 'growth in which the amount is multiplied by the same factor in every equal span of time, for example doubling every hour. A single bacterium that divides every hour is 2 after 1 hour, 4 after 2, 8 after 3, and about a million after 20 hours. The bigger it gets, the more it adds each hour.' },
    { term: 'Seed (of a black hole)', meaning: 'the black hole that a supermassive black hole starts from, before it has done much feeding. How seeds form is not settled: one idea is that they are the remains of a massive star, which would make a seed of tens of Suns; others make heavier ones.' },
    { term: 'Redshift', meaning: 'how much the light of a faraway object has been stretched by the expansion of the universe on its way to us. A bigger redshift means the light left earlier, so the object is seen as it was when the universe was younger (Frontier and Beyond Experiment 5).' },
    { term: 'James Webb Space Telescope (JWST)', meaning: 'a space telescope, launched in December 2021, that sees infrared light. Infrared is what the light from very distant objects has been stretched into, so it can see galaxies and black holes as they were very early in the history of the universe.' },
    { term: 'Little red dot', meaning: 'a name for a kind of small, very red object that JWST has found in great numbers in the young universe. They are tiny on the sky and unlike anything seen before, and what they are is still being debated.' },
    { term: 'Cocoon', meaning: 'a thick cloud of gas wrapped all round something. In one leading idea about little red dots, the cocoon is gas around a feeding black hole that hides it and reddens its light.' },
    { term: 'Spectrum and broad lines', meaning: 'a spectrum is a rainbow of an object’s light spread out so that we can see how much light there is of each colour. Gas gives out light at particular colours, which show as narrow lines. If the gas is moving fast, the lines get wider. Wide, or “broad”, lines are the sign of gas moving fast near a black hole.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “7.58 ± 0.15”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
  ]
}

// Display rounding of the module's numbers for the wording of the predictions (no physics here, CLAUDE.md §9).
function millionYears(years: number): string {
  return `${(Math.round(years / 1e7) * 10).toLocaleString('en-US')} million years`
}

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'A black hole feeds', 'Growth that multiplies', 'How long to reach the mass', 'The clock of the universe', 'The black hole of CAPERS-LRD-z9 and the smallest seed']
const STAGE_LINES = [
  '',
  'The violet arrow is gravity pulling the gas in, and the yellow arrow is the light of the glowing gas pushing it out. The drawing is a sketch, not to scale.',
  'The cyan bars are the mass of a black hole of 10 Suns feeding at the limit, after each growth time. Each step multiplies the mass by the same factor.',
  'Panel B is a ruler of times. The cyan dots are one growth time, and the time needed to reach the mass of CAPERS-LRD-z9. Your guess for Prediction 1 is the white marker.',
  'The cyan dot is the age of the universe when the light of CAPERS-LRD-z9 left it. The pink line is the moment the seed starts to feed (imagined for the question), and the pale cyan band is the time available.',
  'Picture 2 is a ruler of masses. The orange dot is the estimated mass of the black hole, and the cyan dot is the smallest seed that could grow to it in the time available. Your guess for Prediction 2 is the white marker.',
]

interface BlackHoleGrowthExperimentProps {
  onComplete?: () => void
}

export function BlackHoleGrowthExperiment({ onComplete }: BlackHoleGrowthExperimentProps) {
  const [timeGuess, setTimeGuess] = useState<TimeChoiceId | null>(null)
  const [seedGuess, setSeedGuess] = useState<SeedChoiceId | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = timeGuess !== null && seedGuess !== null
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
    setTimeGuess(null)
    setSeedGuess(null)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  const targetMillion = Math.round(10 ** CAPERS_LRD_Z9.logMass / 1e6)
  return (
    <div>
      <h2>Experiment 23 — How Fast Can a Black Hole Grow? (The “Little Red Dots”)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): the speed limit on how fast a black hole can take in gas, and so grow, is settled physics. There is strong evidence that the James Webb Space Telescope sees growing black holes
            very early in the history of the universe. It is still an open question whether any of them grew faster than that limit, or started out heavy, and what the “little red dots” really are: experts
            disagree, and some of the early black hole masses may be much smaller than first thought. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> In Black Holes Experiment 1 you saw that the size of a black hole follows from its mass, and in Experiment 8 that matter falling towards a black hole gives out a lot of
            light on the way in. This experiment puts those two ideas together to ask something new: how fast can a black hole grow, and was there enough time for the biggest early ones to get as big as they are? A black hole grows by taking in gas from around it. Astronomers call this taking-in <strong>accretion</strong>, and in this page we also call it <strong>feeding</strong>: when we say a black hole “feeds”, we mean that it pulls in gas, and so gets heavier.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How a black hole feeds.</strong> A black hole grows by pulling in gas. The gas does not fall straight in. It swirls round the black hole in a flat disc, getting hotter and hotter, and it shines
            very brightly before it is swallowed. Nothing is burning here, as in a star: a black hole has no surface and no fusion. The gas glows because falling in makes it hot, like a meteor heating
            up as it falls through the air. This is what makes some black holes, called active, easy to see from far away. Now notice something: light pushes. Light carries a small push in the direction it is travelling, and it hands a little of that push to whatever it hits. The push from the Sun
            on your skin is far too small to feel (you feel warmth, not a push), but it is real: a spacecraft with a big, thin mirror for a sail can be driven along by sunlight alone. A very bright source pushes
            much harder. So the light from the glowing gas pushes outward on the gas that is still on its way in.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>A speed limit.</strong> Two things act on the gas that is on its way in: the black hole’s gravity pulls it inward, and the light from the glowing gas pushes it outward. (The hot gas has a push of its own too, its pressure, but the limit we are after is about the push of the light.) Here is how they add up, one
            step at a time.
          </p>
          <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The pull stays the same.</strong> How hard gravity pulls on a bit of gas at a given distance depends only on how heavy the black hole is. It does not depend on how much gas there is.
            </li>
            <li>
              <strong>More gas arriving means a brighter glow.</strong> Each bit of gas that falls in gives out some light. If more gas arrives every year, there are more bits giving out light, so the glow
              is brighter.
            </li>
            <li>
              <strong>A brighter glow means a bigger push.</strong> The light pushes outward on the gas still coming in, and the more light there is, the bigger that push is.
            </li>
            <li>
              <strong>So the push grows with the gas supply, and the pull does not.</strong> When only a little gas arrives, the push is smaller than the pull, and gravity wins: the gas keeps falling in. As
              more and more gas arrives, the push grows until, at one particular amount of gas a year, it equals the pull.
            </li>
            <li>
              <strong>Beyond that, the push wins.</strong> If even more gas were on its way, the light would push harder than gravity pulls, and the light would push the gas back out before it could fall in.
              So the amount of gas that actually gets in each year cannot go above that amount.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            It is like trying to push more and more people through a doorway while someone on the far side pushes back harder the more people there are: at some number of people a minute, the pushback
            equals your push, and no more can get through. For a black hole, that fastest rate at which gas can get in is called the <strong>Eddington limit</strong>. Notice what is really limited: it is how
            brightly the gas can shine before its light pushes the rest of the gas away.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Efficiency.</strong> Not every kind of falling gas gives out the same amount of light. The gas does not turn into light. It is swallowed, but on the way in it gives out some of its energy.
            Matter is itself a store of energy (that is what Einstein’s E = mc² says, as in Spacetime Geometry Experiment 5), and as the gas falls it speeds up, rubs against itself and gets hot, and hot gas
            glows. How much of the falling matter’s stored energy is given out as light in this way (Black Holes Experiment 8) is called the <strong>efficiency</strong>. Because the limit is on brightness, the efficiency decides how much gas the black hole can take in, and so how fast it grows. Here is a made-up
            example with easy numbers. Suppose the most light the gas can give out before it blows itself away is the equivalent of 10 kilograms of matter a year. If the efficiency is 10 percent, every
            100 kilograms that fall in give out light that carries the energy of 10 kilograms (“10 kilograms’ worth”), so the black hole can take in 100 kilograms a year, and keep 90 of them. If the efficiency is 50 percent, every 100 kilograms
            give out 50 kilograms’ worth of light, so the black hole can take in only 20 kilograms a year, and keep 10. The more efficient the feeding, the more light there is for each kilogram, the sooner the
            brightness limit is reached, and the slower the black hole grows. It is like a fire that must not get brighter than a certain level: if each log gives out a lot of light, you can burn only a few logs
            an hour.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Growth that builds on itself.</strong> At the limit, a heavier black hole can feed in proportion to its mass: a black hole twice as heavy has twice the pull, and can take in twice as much.
            That kind of growth is called <strong>exponential growth</strong>: the mass is multiplied by the same factor in every equal span of time, like a single bacterium that divides every hour (2, 4, 8, 16 …). It
            is slow at first and then very fast. It also means that a black hole that begins small has a lot of multiplying to do, and the time that takes is the thing to work out.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The black hole a supermassive black hole starts from</strong> is called a <strong>seed</strong>. Where seeds come from is not settled. One idea is that a seed is what is left when a very massive star
            collapses (Black Holes Experiment 9), which would be a black hole of tens of times the mass of the Sun. Other ideas make heavier ones.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What the James Webb Space Telescope found.</strong> The James Webb Space Telescope (JWST) sees infrared light, which is what the light of very distant objects has been stretched into on its long
            way here. Because light takes time to travel, looking far away means looking back in time. Soon after it began observing, in 2022, JWST revealed many small, very red objects in the young universe that
            astronomers called <strong>little red dots</strong>. They are tiny on the sky and unlike anything seen before. Some of them show broad lines in their spectrum, the sign of gas moving fast near a
            black hole, and one of them, called CAPERS-LRD-z9, is seen as it was when the universe was about half a billion years old (a redshift of 9.288, an idea from Frontier and Beyond Experiment 5). The
            estimate for its black hole is about 38 million times the mass of the Sun, but with a wide give-or-take: from about 4.5 million to 316 million Suns, because the mass is worked out from the width of
            a line in the spectrum.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What the little red dots are is still debated.</strong> One leading idea is that a little red dot is a young, growing black hole wrapped in a thick cocoon of gas that makes its light red. In this
            idea, the broad lines may be widened by light bouncing off electrons in the cocoon and not only by fast-moving gas, and if so, the black hole masses could be much smaller than first estimated. Other
            ideas have been proposed too, and this page does not choose between them.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Your job.</strong> You will make two guesses before anything is shown: how long it takes a black hole that begins at 10 Suns, feeding at the limit all the time, to reach the mass of
            CAPERS-LRD-z9; and how small a seed could do it in the time the universe had. Then you will run the experiment, compare your guesses with what the calculation gives, and try other seeds and efficiencies
            of your own. After that, a tutor will talk it over with you.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What your guesses do.</strong> Your guesses never change the real pictures or tables. The pictures and tables come only from the calculation. Your guesses are drawn on the pictures in white,
            so that you can compare them with the real result, and they are shown again next to the results. In the “Now try it yourself” part, the settings you choose do change the drawing next to them, and
            only that drawing.
          </p>

          <p style={paragraph}>
            <strong>What this page does and does not model.</strong> It works out how long a black hole needs to grow from a seed to a given mass when it feeds at the limit, and how that compares with the age
            of the universe. It does not model the gas or the cocoon, how seeds form, black holes merging, feeding faster than the limit, or how the spin of the black hole changes as it grows. The
            efficiency is something you choose, and the time at which a seed begins to feed is a choice made for the question, not a measurement. The black hole of CAPERS-LRD-z9 is a published estimate.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers, and the pages that go into the numbers, are listed
            after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black Holes</ExternalLink>: NASA’s overview of black holes, including how they are found, and the supermassive ones at
              the centres of galaxies.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/missions/webb/newfound-galaxy-class-may-indicate-early-black-hole-growth-webb-finds/">
                NASA: Newfound galaxy class may indicate early black hole growth, Webb finds
              </ExternalLink>
              : NASA’s January 2025 account of the little red dots found by the James Webb Space Telescope, what they look like, and why astronomers are interested in them.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: a calculation
            of how a black hole grows when it feeds as fast as it can, and the published estimate for CAPERS-LRD-z9. They are the same for everyone. When they are drawn, your guesses appear on them in white, so
            you can see how each guess compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: how long does it take to grow?',
                text: (
                  <>
                    A black hole of {PREDICTION_SEED_SOLAR} Suns begins to feed. It feeds at the Eddington limit, the fastest it can, all the time, and its efficiency is{' '}
                    {Math.round(STANDARD_EFFICIENCY * 100)} percent (that is, the light that the falling gas gives out on the way in carries away energy equal to {Math.round(STANDARD_EFFICIENCY * 100)} percent of the energy stored in the matter that falls in). How long does it
                    take to grow to about {targetMillion} million Suns, the estimated mass of the black hole in CAPERS-LRD-z9?
                  </>
                ),
                choices: TIME_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: timeGuess as string | null,
                set: (v: string) => setTimeGuess(v as TimeChoiceId),
              },
              {
                title: 'Prediction 2: how small a seed could do it?',
                text: (
                  <>
                    Now suppose a seed begins to feed when the universe is {millionYears(SEED_START_AGE_YEARS)} old, at the Eddington limit, all the time, with the same {Math.round(STANDARD_EFFICIENCY * 100)}{' '}
                    percent efficiency. CAPERS-LRD-z9 is seen when the universe was about {millionYears(objectAgeYears())} old, so the seed has about {millionYears(timeAvailableYears())} to grow to about{' '}
                    {targetMillion} million Suns. About how small can the seed be, and still get there in that time? This is a separate guess from Prediction 1, so your two answers do not have to agree with each
                    other.
                  </>
                ),
                choices: SEED_CHOICES.map((c) => ({ value: c.id as string, label: c.label })),
                value: seedGuess as string | null,
                set: (v: string) => setSeedGuess(v as SeedChoiceId),
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
          {!bothPredicted && !recorded && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
          )}
          {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
          <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong>{' '}
                {done ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here. The rest of the page is built in later steps.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} timeGuess={timeGuess} />
              {pictureOneCaption(stage)}
            </div>
          )}
          {stage >= 5 && (
            <div>
              <PictureTwo seedGuess={seedGuess} />
              {pictureTwoCaption()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
