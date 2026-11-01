import { useState } from 'react'
import { DELAY_ANSWER_CHOICES, DISTANCE_ANSWER_CHOICES, FARTHEST_CLOSEST_RADII, PREDICTION_TWO_FAR_RADII, delayGuessResult, distanceGuessResult, predictionOneAnswerId, predictionTwoAnswerId, tutorFigures } from '../physics/sunDelay'

// Evidence and Imagination, Experiment 5: Part 4, the tutor. The wording is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1). Observe, compare with the predictions, one
// conceptual question, then the explanation. Every number comes from the physics module (sunDelay.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation
// (CLAUDE.md §12, §13). The tutor recaps the "Why does the Sun add this time?" box and does not introduce it. It does not claim more than the old tests show, and says plainly that the page's model is simpler than
// the real tests and that the gap to Shapiro's figure is not explained here.
// Unsourced here: the campfire comparison; "each bit of the path adds a little, more where it is nearer the Sun" is the author's plain reading of the formula (the delay is the sum, along the path, of the Sun's effect at each
// point, which falls as 1 divided by the distance from the Sun's centre); the "about 20 µs" fuller term was recalled and not read; Cassini's (γ − 1) figure is from the paper's abstract (read on 1 November 2026); the rest of the paper was not read.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SunDelayTutorProps {
  delayGuess: string
  distanceGuess: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const commas = (x: number) => Math.round(x).toLocaleString('en-US')
const e5 = (x: number) => `${(x * 1e5).toFixed(1)} × 10⁻⁵`

export function SunDelayTutor({ delayGuess, distanceGuess, onExplained }: SunDelayTutorProps) {
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
  const delayGuessLabel = DELAY_ANSWER_CHOICES.find((x) => x.id === delayGuess)!.label
  const delayAnswerLabel = DELAY_ANSWER_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label
  const distanceGuessLabel = DISTANCE_ANSWER_CHOICES.find((x) => x.id === distanceGuess)!.label
  const distanceAnswerLabel = DISTANCE_ANSWER_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label
  const delayResult = delayGuessResult(delayGuess)
  const distanceResult = distanceGuessResult(distanceGuess)

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 2, Part A</strong>: the two bars and the bright block at the end of the lower one. Then look at the ruler in <strong>Part B</strong>: the solid cyan mark and the dashed cyan mark. Next, look at the curve in <strong>Picture 3</strong>. Last, look at the three rows in{' '}
                <strong>Picture 4</strong>. What do you notice about the sizes of these numbers, and about how the curve in Picture 3 changes from left to right?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white mark and the box “YOUR GUESS (Prediction 1)” in Picture 2, Part B</strong> is your guess for how much longer the trip takes. How does it sit beside the solid cyan mark and the dashed cyan mark?
                </li>
                <li>
                  <strong>The white bar and the box “YOUR GUESS (Prediction 2)” in Picture 3</strong> shows where the extra time at {PREDICTION_TWO_FAR_RADII} solar radii would be if your guess were right. How does it sit beside the cyan curve?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the rows beginning “Trip to Venus just touching the Sun” and “Passing {PREDICTION_TWO_FAR_RADII} solar radii”. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose the Sun’s gravity <strong>only slowed time</strong> near it, and did <strong>not stretch space</strong> at all. For the Venus trip that just touches the Sun, would the extra time be <strong>bigger than</strong> the page’s {n1(t.grazing.delayUs)} µs,{' '}
                <strong>smaller</strong>, or <strong>the same</strong>? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure. The box under Picture 2 and the pink mark in Drawing A may help you.</p>
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{delayGuessLabel.toLowerCase()} longer</em>. The page’s calculation gives {n1(t.grazing.delayUs)} µs, nearest to <em>{delayAnswerLabel.toLowerCase()}</em>, and Shapiro’s quoted estimate was about {t.shapiroUs} µs, so{' '}
            {delayResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you answered <em>{distanceGuessLabel.toLowerCase()}</em>. The page’s calculation gives {n2(t.timesSmaller10)} times smaller, nearest to <em>{distanceAnswerLabel.toLowerCase()}</em>, so{' '}
            {distanceResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} Both numbers are calculated here. The tests in Picture 4 are what real signals have been checked against.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the extra time is.</strong> With no effect from the Sun, the round trip to Venus past the Sun’s edge takes {n1(t.grazing.flatMinutes)} minutes. With the Sun’s gravity acting on the signal it takes {n1(t.grazing.delayUs)} µs longer, which is the same as {n1(t.grazing.pathKm)} km of extra path. Against the whole
            trip that is {n1(t.grazing.partsPerTenMillion)} parts in ten million, about 1 part in {n1(t.grazing.oneInMillions)} million. It is very small, and it was found by timing the real trip and comparing it with the time worked out for no effect from the Sun.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the Sun adds it.</strong> Two things happen, as in the box under Picture 2. Time runs slower near the Sun, so by the clocks on the Earth the signal takes longer to cross the region near it: {n1(t.parts.timeSlowingUs)} µs. And space near the Sun is stretched, so the signal has farther to go: another{' '}
            {n1(t.parts.spaceStretchingUs)} µs. Together they make {n1(t.parts.totalUs)} µs. The ordinary picture of gravity from Experiment 8 of the Gravity chapter has only the first part, so it gives {n1(t.ordinaryUs)} µs, which is the pink mark in Drawing A. As in the road trip, two small causes add. Nobody near the Sun measures
            light going slower. The extra time is what the faraway observer finds.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the extra time falls only slowly with distance.</strong> The extra time is not made in one place. Along the whole path, each bit of the signal’s journey is delayed a little, more where it passes nearer the Sun and less where it is farther. The Sun’s effect weakens with distance only gradually, so even the far parts of the path
            add up. Because of that, each time the closest distance is multiplied by ten, about the same amount comes off the extra time. From 1 solar radius to {PREDICTION_TWO_FAR_RADII}, it falls by {n1(t.dropFrom1To10Us)} µs ({n1(t.grazing.delayUs)} to {n1(t.at10Us)}). From {PREDICTION_TWO_FAR_RADII} to {FARTHEST_CLOSEST_RADII}, it falls by {n1(t.dropFrom10To100Us)} µs ({n1(t.at10Us)} to {n1(t.at100Us)}). The formula’s own step for each tenfold is {n1(t.tenfoldStepUs)} µs.
            That is why ten times farther gives {n2(t.timesSmaller10)} times smaller and not ten times smaller. Think of walking past a campfire: you feel its warmth for a long stretch of the walk, and not only at the closest point, and the total warmth you collect is the sum over the whole walk. Passing twice as far away gathers less, but nowhere near nothing.
            This is only a comparison. The Sun’s effect and a fire’s warmth do not follow the same rule.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What the real tests showed.</strong> The Viking landers in 1979 fixed the delay to about 1 part in {commas(1e6 / t.tests.vikingPpm)}. The Cassini spacecraft in 2002 fixed it to {t.tests.cassiniPpm} parts per million, {n1(t.tests.vikingOverCassini)} times closer. In Cassini’s own terms there is a number called gamma, which, as the paper’s abstract puts it, is 1 in general relativity and 0 in the Newtonian model of gravity (the ordinary picture). The test found gamma − 1 to be ({e5(t.gamma.gammaMinusOne)}) give-or-take {e5(t.gamma.giveOrTake)}, so very close to 0, which means gamma very close to 1. The ordinary picture’s gamma is a full 1 below that. So the gap between the two calculations is about {commas(t.gamma.gapOverGiveOrTake)} times the give-or-take of the test. Real signals follow the full calculation, the one with both parts, and not the half. (The gamma figure is from the abstract of the Cassini paper. The rest of the paper was not read. NASA’s “20 parts per million” is from its release.)
          </p>
          <p style={paragraphStyle}>
            <strong>5. The gap to Shapiro’s figure.</strong> The page’s {n1(t.grazing.delayUs)} µs is {n1(t.shapiroDifferenceUs)} µs more than the “about {t.shapiroUs} µs” that Shapiro estimated in 1964. This page does not explain that gap. Its calculation uses only the main part of the formula, and a fuller calculation adds another, smaller term, thought to be about {n1(t.fullerTermUs)} µs for this trip (a figure remembered, not read from a source),
            which would make the gap larger, not smaller. His figure is a rounded estimate, quoted second-hand. So neither is used as a test here. The test is Cassini’s, and it fixed the size of the effect to a tiny fraction of itself.
          </p>
          <p style={paragraphStyle}>
            <strong>6. About the question you were asked.</strong> If the Sun’s gravity only slowed time and did not stretch space, the extra time for the Venus trip that just touches the Sun would be <strong>smaller</strong>: only the first part, {n1(t.parts.timeSlowingUs)} µs, which is half of {n1(t.parts.totalUs)} µs. That is what the ordinary picture of gravity gives. The stretching of space supplies the other half.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What is settled, and what the tests do not show.</strong> The tests are old, from the 1960s to 2002. The page read NASA’s release about the last of them, the abstract of the Cassini paper, and Wikipedia’s account of the earlier ones. A search for anything newer found nothing, but it was limited. The page’s model leaves out the Sun’s hot outer atmosphere, the planets’ own gravity and the motion of the Earth and Venus, and the real tests
            had to deal with all of these. So the page shows the idea and the size of the effect, not the papers’ full analysis. It does not show that the effect holds for every kind of signal, or at distances no test has reached.
          </p>
        </div>
      )}
    </div>
  )
}
