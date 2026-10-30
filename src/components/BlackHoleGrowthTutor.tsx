import { useState } from 'react'
import {
  SEED_CHOICES,
  TIME_CHOICES,
  massAfterYears,
  objectMassSolar,
  pictureOne,
  pictureTwo,
  resultsCheckUp,
  seedAnswer,
  seedGuessResult,
  settingsGrid,
  timeAnswer,
  timeAvailableYears,
  timeGuessResult,
  trialPicture,
  yearsToGrow,
  growthTimeYears,
  nonSpinningEfficiency,
  HIGH_EFFICIENCY_TRIAL,
} from '../physics/blackHoleGrowth'
import type { SeedChoiceId, TimeChoiceId } from '../physics/blackHoleGrowth'
import { commas, efficiencyPercent, myr, n1 } from './BlackHoleGrowthPictures'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleGrowthTutorProps {
  timePrediction: TimeChoiceId
  seedPrediction: SeedChoiceId
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

function suns(x: number): string {
  // One decimal under 10 million, so that 4.5 million does not show as 5 million.
  return x >= 1e6 ? `${x < 1e7 ? n1(x / 1e6) : commas(x / 1e6)} million Suns` : `${commas(x)} Suns`
}

// The tutor of Cosmic Horizons Experiment 23. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "Tutor (Part 4)" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (blackHoleGrowth.ts), never typed in by hand (CLAUDE.md §9), except the bacterium (a doubling every hour) and the doorway, which are everyday illustrations. The predictions are marked
// only in the explanation (the owner's choice for the group). The tutor does not say how real black holes grew: it says what the model shows and what it leaves out.
export function BlackHoleGrowthTutor({ timePrediction, seedPrediction, onExplained }: BlackHoleGrowthTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }
  const isResponseEmpty = responseInput.trim() === ''

  // Every number below is computed from the module.
  const p1 = pictureOne()
  const p2 = pictureTwo()
  const c = resultsCheckUp()
  const grid = settingsGrid()
  const e = p1.efficiency
  const low = nonSpinningEfficiency()
  const tgLow = growthTimeYears(low)
  const tgHigh = growthTimeYears(HIGH_EFFICIENCY_TRIAL)
  const available = timeAvailableYears()
  // Seeds: a factor of 10 in the seed saves ln 10 growth times; 10 Suns against 100,000 Suns at the standard efficiency.
  const savedByTen = Math.LN10 * p1.growthTimeYears
  const big = trialPicture(1e5, e)
  // What a black hole of 10 Suns reaches in the time available, and the time needed if the mass were 100 times lower.
  const reached = massAfterYears(p1.seedSolar, available, e)
  const hundredthTime = yearsToGrow(p1.seedSolar, p1.targetSolar / 100, e)
  const thinMargin = available - grid[0][0].yearsNeeded
  const timeResult = timeGuessResult(timePrediction)
  const seedResult = seedGuessResult(seedPrediction)
  const timeGuessLabel = TIME_CHOICES.find((x) => x.id === timePrediction)!.label
  const timeAnswerLabel = TIME_CHOICES.find((x) => x.id === timeAnswer())!.label
  const seedGuessLabel = SEED_CHOICES.find((x) => x.id === seedPrediction)!.label
  const seedAnswerLabel = SEED_CHOICES.find((x) => x.id === seedAnswer())!.label

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, panel A. Find the cyan bars, the mass of a black hole of 10 Suns after each growth time. How does each bar compare with the one above it? Is the
                black hole adding the same amount each time, or something else?
              </p>
              <p style={paragraphStyle}>
                Now look at panel B. Find the cyan dot for the time needed and the end of the pale cyan band, the time available. Which is further to the right, and by about how much, as far as you can tell from the ruler? Then look at{' '}
                <strong>Picture 2</strong>: where is the cyan dot, the smallest seed, compared with the violet dot of 10 Suns?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                Now bring your own guesses back. In Part 1 you made two predictions, and they are drawn in white on the real pictures, so you can see each guess next to the real result.
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white marker and the box “YOUR GUESS”</strong> in panel B of Picture 1 are your guess for Prediction 1, how long a black hole of 10 Suns takes to reach the mass. How does it sit beside the cyan dot for the time needed?
                </li>
                <li>
                  <strong>The white marker and the box</strong> in Picture 2 are your guess for Prediction 2, how small a seed could do it in the time available. How does it sit beside the cyan dot?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the rows “Time for a seed of 10 Suns…” and “Smallest seed…”), <strong>Table 2</strong> (the row “Time needed”) and <strong>Table 3</strong> (the row for 10 Suns, in the column for 10 percent), which have the real
                numbers for both predictions. Did anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. The speed limit is about how brightly the gas can shine before its light pushes the rest of the gas away. Suppose the black hole were twice as heavy. Would the limit on how fast it can take in gas be
                higher, lower or the same? Think about the pull of gravity, and about the push of the light, and tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure.</p>
            </>
          )}
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}
      {tutorStep === 'explained' && (
        <div>
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{timeGuessLabel}</em>. The calculated time in Table 1 is <em>{myr(c.neededYears)}</em>, so the nearest answer
            is <em>{timeAnswerLabel}</em>. {timeResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered: <em>{seedGuessLabel}</em>. The calculated smallest seed in Table 1 is{' '}
            <em>{suns(c.smallestSeedSolar)}</em>, so the nearest answer is <em>{seedAnswerLabel}</em>. {seedResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both real numbers are calculated here, not measured: they come from
            a growth formula and from choices made for the question (the efficiency, the start at {myr(p1.startAgeYears)} and feeding at the limit all the time). What was measured is the redshift of CAPERS-LRD-z9 and, with a wide give-or-take, its mass.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why the limit rises with the mass, and why growth multiplies.</strong> You were asked whether a black hole twice as heavy has a higher limit. It does. Gravity pulls on the gas in proportion to the black hole’s mass, so a black hole twice as heavy pulls twice as hard, and the light can push twice as hard
            before it wins. Since the push comes from the gas that is feeding, a black hole twice as heavy can feed twice as fast before the light stops it. So the heavier the black hole, the faster it can grow, and the speed limit grows in step with the mass. That is why the mass is multiplied by the
            same factor in every equal span of time, as in the bars of Picture 1: from {suns(p1.steps[0].massSolar)} to {suns(p1.steps[1].massSolar)} to {suns(p1.steps[2].massSolar)}, each step in {myr(p1.growthTimeYears)}, multiplying by {Math.E.toFixed(2)} each time. It is like a single bacterium that divides every hour: it
            adds a little at first and then very quickly, and after 20 hours it has passed a million. The time that matters is not how much to add but how many times to multiply.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why a higher efficiency means slower growth.</strong> The limit is on how brightly the gas can shine. The efficiency says how much light each kilogram that falls in gives out. If each kilogram gives out a lot of light, the brightness limit is reached after only a little gas, so
            the black hole can take in less gas, and it grows more slowly. Think of the fire that must not get brighter than a certain level: if each log gives out a lot of light, you can burn only a few logs an hour. In the model, one growth time is {myr(tgLow)} at {efficiencyPercent(low)} percent, {myr(p1.growthTimeYears)} at{' '}
            {efficiencyPercent(e)} percent and {myr(tgHigh)} at {efficiencyPercent(HIGH_EFFICIENCY_TRIAL)} percent, which is why the {efficiencyPercent(HIGH_EFFICIENCY_TRIAL)} percent column of Table 3 is so slow. That is also why Table 2 multiplies the Eddington time by {efficiencyPercent(e)} ÷ {efficiencyPercent(1 - e)}: the bigger the share that is given out as light, the longer each growth time.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the seed’s mass matters so much.</strong> Every time the seed is ten times heavier, the black hole has ln 10 = {n1(Math.LN10)} fewer growth times to go, which saves {n1(Math.LN10)} × {n1(p1.growthTimeYears / 1e6)} = {myr(savedByTen)}. A seed of {suns(big.seedSolar)} is {commas(big.seedSolar / p1.seedSolar)} times heavier than one of 10 Suns, so it saves {n1(Math.log(big.seedSolar / p1.seedSolar))} growth times, about {myr(c.neededYears - big.yearsNeeded)}: it
            needs {myr(big.yearsNeeded)} against {myr(c.neededYears)}. That is why the smallest seed that fits in the time available, {suns(c.smallestSeedSolar)} in Picture 2, is so much heavier than 10 Suns: about {commas(c.smallestOverStellar)} times. Put another way, a black hole that starts at 10 Suns and feeds at the limit for the whole{' '}
            {myr(available)} reaches only about {suns(reached)}, not {suns(objectMassSolar())}.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What the comparison shows, and what it does not.</strong> In the model, with an efficiency of {efficiencyPercent(e)} percent, a seed of 10 Suns needs {myr(c.neededYears)} and the time available is {myr(available)}: it is too late. But that is not the whole story, because the efficiency, the mass and the start are all choices.
            At {efficiencyPercent(low)} percent, the efficiency of a black hole that is not spinning, the same seed needs {myr(grid[0][0].yearsNeeded)}, so it is in time, but only by {myr(thinMargin)}. At 40 percent no seed in the table is in time. And the mass of the black hole has a wide give-or-take: even at the lowest published value, {suns(p2.lowSolar)}, a seed of 10 Suns
            needs {myr(c.neededForLowYears)}, still more than the time available. If the mass were 100 times lower than the estimate used here, which is the size of change that one reading of the spectrum gives, it would need {myr(hundredthTime)}, {hundredthTime > available ? 'still more' : 'less'} than the time available. So this calculation does not show that a black hole that began as a single collapsed star
            could not have grown this big, and it does not show that it could. It shows that, if the mass is anything like the estimate and the black hole could only feed at the limit, a seed of 10 Suns is only barely enough at the best efficiency and not enough otherwise.{' '}
            The authors of the discovery paper (Taylor and others, 2025) reach a harder conclusion than this page does: they say that either a massive seed, or a lighter seed that for a time fed faster than the limit, is needed. The difference may come from the choices made here (the start at 100 million years, feeding at the limit all the time, and the efficiency of a non-spinning black hole), and a margin of only {myr(thinMargin)} is thin enough for any of them to remove. This page read only that paper’s abstract, so it does not know which assumptions the authors made.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What might change the answer, and why sources disagree.</strong> People have proposed several ways round the problem, and none is settled. A seed that starts much heavier, for example from the collapse of a very massive gas cloud or a very massive star, would save time, as Table 3 shows. A black hole could feed faster than the limit for a while: NASA’s Chandra X-ray
            Observatory team has reported a black hole that seems to feed at about 2.4 times it. Black holes could merge, as in Experiments 18 to 20, and add their masses. Or the masses of the little red dots could be much lower than first estimated, because the width of the spectral lines that the masses are worked out from may be caused partly by light bouncing off electrons in a cocoon. This
            page does not model any of these, and the sources do not agree on which, if any, happened. That is why this experiment’s label says <strong>Open</strong>.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How sure we are.</strong> That a black hole feeding at the Eddington limit multiplies its mass by the same factor in every equal span of time is settled physics, but the growth time here rests on a textbook formula and on an efficiency chosen for the question. That the James Webb Space Telescope sees growing black holes very early is strong evidence. What those black holes
            started as, how fast they fed, and what the little red dots are, is open. The numbers on this page come from abstracts, summaries and a textbook formula, no paper was read in full, so check any number you want to rely on against its paper.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that a black hole feeding at the limit multiplies its mass by {Math.E.toFixed(2)} every {myr(p1.growthTimeYears)} at {efficiencyPercent(e)} percent efficiency; that a seed of 10 Suns would need {myr(c.neededYears)} to reach {suns(objectMassSolar())}, against {myr(available)} available; and that the smallest seed that fits is
            {' '}{suns(c.smallestSeedSolar)}. You did not see how any real black hole grew, a measurement of how fast one fed, or the answer to what the little red dots are. Try the settings in Part 2 again if you like: they show how other seeds and efficiencies would do, and the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
