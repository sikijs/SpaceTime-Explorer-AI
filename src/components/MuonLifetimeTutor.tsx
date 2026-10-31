import { useState } from 'react'
import {
  LIFETIME_ANSWER_CHOICES,
  MOUNT_BETA,
  MOUNT_HEIGHT_M,
  REST_LIFETIME_US,
  SHARE_ANSWER_CHOICES,
  lifetimeGuessResult,
  predictionOneAnswerId,
  predictionTwoAnswerId,
  shareGuessResult,
  tutorFigures,
} from '../physics/muonLifetime'

// Evidence and Imagination, Experiment 4: Part 4, the tutor. The wording is Claude's DRAFT of 2026-10-31, for the owner's approval (CLAUDE.md §28.1). Observe, compare with the predictions, one
// conceptual question, then the explanation. Every number comes from the physics module (muonLifetime.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation
// (CLAUDE.md §12, §13). The tutor does not claim more than the two old tests show, and says plainly that the page's model is simpler than the real tests.
// Unsourced here: the "timed directly, not counted at two heights" remark about the ring, and the daily-life comparisons.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface MuonLifetimeTutorProps {
  shareGuess: string
  lifetimeGuess: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const n3 = (x: number) => x.toFixed(3)
const n4 = (x: number) => x.toFixed(4)
const n6 = (x: number) => x.toFixed(6)
const spaced = (x: number) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export function MuonLifetimeTutor({ shareGuess, lifetimeGuess, onExplained }: MuonLifetimeTutorProps) {
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

  const t = tutorFigures()
  const shareGuessLabel = SHARE_ANSWER_CHOICES.find((x) => x.id === shareGuess)!.label
  const shareAnswerLabel = SHARE_ANSWER_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label
  const lifetimeGuessLabel = LIFETIME_ANSWER_CHOICES.find((x) => x.id === lifetimeGuess)!.label
  const lifetimeAnswerLabel = LIFETIME_ANSWER_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label
  const shareResult = shareGuessResult(shareGuess)
  const lifetimeResult = lifetimeGuessResult(lifetimeGuess)

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 1, Part B</strong>: the two cyan marks and the green mark on the ruler. Then look at <strong>Picture 2</strong>: the green marks and the cyan mark. Last, look at <strong>Picture 3</strong>: the cyan row and the pink row. What do you notice about where the marks
                sit, and about the numbers in the two rows?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white mark and the box “YOUR GUESS (Prediction 1)” in Picture 1, Part B</strong> is your guess for how many muons are still alive at sea level. How does it sit beside the green mark and the two cyan marks?
                </li>
                <li>
                  <strong>The white mark and the box “YOUR GUESS (Prediction 2)” in Picture 2</strong> is your guess for how long the muons in the ring last. How does it sit beside the green marks and the cyan mark?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the rows beginning “Mountain: muons alive at sea level” and “Ring”. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Two groups of muons fall the same {spaced(MOUNT_HEIGHT_M)} metres from the mountain top. One group moves at <strong>{t.half.beta} c</strong> and the other at <strong>{MOUNT_BETA} c</strong>. Which group would you expect to have more muons still alive at sea
                level? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure. You can try both speeds in “Now try it yourself” if you like.</p>
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{shareGuessLabel} of every 100</em>. The calculation with the longer lifetime gives <em>{shareAnswerLabel.toLowerCase()}</em> ({n1(t.fast.slowClockShare * 100)}), and the count was {n1(t.counted * 100)}, so{' '}
            {shareResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you answered <em>{lifetimeGuessLabel}</em>. The ring’s measured lifetimes are <em>{lifetimeAnswerLabel.toLowerCase()}</em> ({n3(t.ringPlus.measuredUs)} and{' '}
            {n3(t.ringMinus.measuredUs)}), so {lifetimeResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} The first number comes from a calculation and a count. The second is a real measurement. Both tests are old.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why so many muons arrived.</strong> If a moving muon lasted only {n3(REST_LIFETIME_US)} µs on average, like one sitting still, the fall would take {n2(t.fast.lifetimesGround)} lifetimes and only about {n1(t.fast.everydayShare * 100)} of every 100 would reach sea level. The count was{' '}
            {n1(t.counted * 100)}. The calculation that gives a moving muon a lifetime of {n1(t.fast.slowClockLifetimeUs)} µs gives {n1(t.fast.slowClockShare * 100)}. So, by the ground’s clocks, a moving muon lasts about {n2(t.fast.gamma)} times as long as one at rest. This is the
            same effect as in Experiments 3 and 4 of the first chapter: a moving clock runs slow, as the ground measures it. Here the clock is the muon’s falling apart.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Where the {n2(t.fast.gamma)} comes from.</strong> The factor is 1 ÷ √(1 − β²), where β is the speed as a fraction of c. For {MOUNT_BETA} c: β × β = {n6(t.fastWorked.betaSquared)}. Then 1 − {n6(t.fastWorked.betaSquared)} = {n6(t.fastWorked.oneMinus)}. The square root of that is{' '}
            {n4(t.fastWorked.root)}. And 1 ÷ {n4(t.fastWorked.root)} = {n2(t.fastWorked.factor)}. The factor depends only on the speed. At {t.half.beta} c it is {n2(t.halfWorked.factor)}, at {MOUNT_BETA} c it is {n2(t.fastWorked.factor)}, and at the ring’s {t.ringWorked.beta.toFixed(5)} c it is {n2(t.ringWorked.factor)}. The faster the
            muon, the bigger the factor.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The muon’s own description.</strong> From the muon’s point of view, the ground rushes towards it at {MOUNT_BETA} c and the road is shorter: {spaced(MOUNT_HEIGHT_M)} m ÷ {n2(t.fast.gamma)} = {n1(t.view.roadM)} m. At the same speed the trip then takes {n2(t.view.tripUs)} µs. By its own clock the muon lasts{' '}
            {n3(t.view.lifetimeUs)} µs, so the trip is {n2(t.view.tripUs / t.view.lifetimeUs)} of a lifetime, and {n3(t.oneLifetimeShare)} to the power {n2(t.view.tripUs / t.view.lifetimeUs)} = {n3(t.view.share)}, which is {n1(t.view.share * 100)} of every 100. This is the same answer as the ground’s. The ground says “the muon’s
            clock runs slow”. The muon says “the road is short”. They disagree about the clock and about the length, but they agree on how many muons arrive, which is the thing that anyone can check. Experiment 6 of the first chapter looked at the shortening of a moving object’s length.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The ring.</strong> The same factor, now at {t.ringWorked.beta.toFixed(5)} c, gives {n2(t.ringWorked.factor)} × {n3(REST_LIFETIME_US)} = {n2(t.ringPredictedUs)} µs. The measured lifetimes were {n3(t.ringPlus.measuredUs)} µs (give-or-take {n3(t.ringPlus.giveOrTakeUs)}) and {n3(t.ringMinus.measuredUs)} µs
            (give-or-take {n3(t.ringMinus.giveOrTakeUs)}), within {n3(Math.abs(t.ringMinus.differencePercent))} percent of the calculation. The paper states agreement to {n1(t.ringPaperLimitPercent)} percent at 95 percent confidence. In the ring, the muons were timed as a lifetime, not counted at two heights, so it is a different kind
            of check from the mountain.
          </p>
          <p style={paragraphStyle}>
            <strong>5. How good this page’s model is.</strong> The page’s model uses one steady speed, which gives a factor of {n2(t.simpleModelFactor)}. Real muons slow down on the way, so the mountain paper’s own calculation gave {t.factorPredicted} (give-or-take {t.factorPredictedGiveOrTake}), and it measured {t.factorMeasured} (give-or-take {t.factorMeasuredGiveOrTake}).
            Those two ranges overlap. So the page shows the idea, not the paper’s full analysis, and its {n1(t.fast.slowClockShare * 100)} is not meant to match the count exactly.
          </p>
          <p style={paragraphStyle}>
            <strong>6. About the question you were asked.</strong> At {t.half.beta} c the fall takes {n2(t.half.tripUs)} µs and the lifetime is {n2(t.half.slowClockLifetimeUs)} µs, so the trip is {n2(t.half.tripUs / t.half.slowClockLifetimeUs)} lifetimes and {n2(t.half.slowClockShare * 100)} of every 100 arrive. At {MOUNT_BETA} c the trip takes {n2(t.fast.tripUs)} µs and the lifetime is {n1(t.fast.slowClockLifetimeUs)} µs,
            so the trip is {n2(t.fast.tripUs / t.fast.slowClockLifetimeUs)} lifetimes and {n1(t.fast.slowClockShare * 100)} of every 100 arrive. Two things help the faster group. Its trip is about {n1(t.tripShorterBy)} times shorter, and its lifetime is about {n1(t.lifetimeLongerBy)} times longer. Of the two, the longer lifetime does more.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What is settled, and what the tests do not show.</strong> Both tests are old, from 1962 and 1977, and the page read them through Wikipedia’s account and the CERN paper’s abstract. They show that moving muons last longer by the factor that special relativity gives. In the ring the measurements are within about {n2(Math.abs(t.ringMinus.differencePercent))} percent of the calculation, and the paper’s own stated limit is {n1(t.ringPaperLimitPercent)} percent. On the mountain, the paper’s factors, {t.factorMeasured} and {t.factorPredicted}, have overlapping ranges. I am not saying more than that. They do not say what happens to other
            kinds of clock, or to muons under other conditions. Those are separate tests.
          </p>
        </div>
      )}
    </div>
  )
}
