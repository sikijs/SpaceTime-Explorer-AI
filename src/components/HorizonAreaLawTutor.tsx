import { useState } from 'react'
import {
  areaChange,
  areaScalingWorked,
  areaSteps,
  blackHoleEqualMergerRatio,
  ceilingPicture,
  checkUp,
  ceilingWorked,
  directionGuessResult,
  GW250114,
  massPicture,
  pressAreaChange,
  raindropMergerRatio,
  sizeAnswer,
  sizeGuessGap,
} from '../physics/horizonAreaLaw'
import type { DirectionChoice, SizeChoice } from '../physics/horizonAreaLaw'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HorizonAreaLawTutorProps {
  directionPrediction: DirectionChoice
  sizePrediction: SizeChoice
  onExplained?: () => void
}

const directionWords: Record<DirectionChoice, string> = { down: 'went down', same: 'stayed about the same', up: 'went up' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

function thousands(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}
function one(n: number): string {
  return n.toFixed(1)
}
function two(n: number): string {
  return n.toFixed(2)
}

// The tutor of Cosmic Horizons Experiment 18. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior" and the
// group's tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (horizonAreaLaw.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say
// that LIGO "proved" the theorem, does not say GW250114 "confirms" general relativity beyond what the paper says, and does not say anything about quantum gravity.
export function HorizonAreaLawTutor({ directionPrediction, sizePrediction, onExplained }: HorizonAreaLawTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  // Every number below is computed from the module.
  const mass = massPicture()
  const change = areaChange()
  const press = pressAreaChange()
  const dir = directionGuessResult(directionPrediction)
  const gap = sizeGuessGap(sizePrediction)
  const rightSize = sizeAnswer()
  const first = areaSteps(GW250114.massesSolar[0], 0)
  const scaling = areaScalingWorked()
  const ceilingMeasured = ceilingWorked(GW250114.finalSpin)
  const ceilingNone = ceilingWorked(0)
  const real = ceilingPicture().real
  const cu = checkUp()

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, the masses. Find the red bar in the second row and the thin dotted line. Does the red bar reach the
                dotted line? What is the yellow dashed piece at the end of it?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>, the areas. Compare the red AFTER bar with the grey dashed line, which is the total area before. Which is taller? And how does it compare with the
                BEFORE bar, made of the blue and violet segments?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                Now bring your own guesses back. In Part 1 you made two predictions, and they are drawn in white on Picture 2, so you can see each guess next to the real result.
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white arrow</strong> (or the two short white bars) is your guess for Prediction 1. It is only a marker for a direction, with no size. Where does it point, compared with the
                  direction from the BEFORE bar to the AFTER bar?
                </li>
                <li>
                  <strong>The white outlined bar</strong> is your guess for Prediction 2. How does its height compare with the red AFTER bar?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, which has the numbers for both predictions (the two rows that say “Your Prediction”). Did anything match what you expected, or surprise you? Tell me
                what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. When two raindrops touch, they merge into one bigger drop, and the one drop has <em>less</em> surface than the two had. That is an everyday
                comparison, not black-hole physics. But two black holes that merge ended up with <em>more</em> horizon area than the two had before.
              </p>
              <p style={paragraphStyle}>
                What do you think is different about a black hole, compared with a raindrop, that lets the total surface grow when two merge? Make a guess, even if you are not sure.
              </p>
            </>
          )}
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>the total area {directionWords[directionPrediction]}</em>.
            The real area went <em>{directionWords[dir.real]}</em>: from {thousands(change.beforeKm2)} to {thousands(change.afterKm2)} km². {dir.matched ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            For Prediction 2 you answered: <em>about {sizePrediction} times the area before</em>. The real number is {two(change.ratio)} times by the formula, and {two(press.ratio)} by the press figures, so the nearest answer is{' '}
            <em>about {rightSize} times</em>. {gap.matched ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {gap.verdict === 'below' && ` The real area after is ${two(gap.times)} times your answer.`}
            {gap.verdict === 'above' && ` Your answer is ${two(gap.times)} times the real area after.`} Keep in mind that this is one event, and the sizes rest on masses and spins that were fitted from a signal.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the area is, and how it is worked out.</strong> The horizon’s area is A = 16π × (GM/c²)² × h. For black hole 1 ({first.massSolar} Suns), GM/c² is {one(first.gmKm)} km. Squared, that is{' '}
            {thousands(first.gmSquaredKm2)} km². Times 16π (about {one(first.sixteenPi)}), that is {thousands(first.areaKm2)} km². The spin factor h is 1 when a black hole does not spin, and it gets smaller as the spin rises, so spin
            lowers the area for the same mass. This is the formula you met in Black Holes Experiment 8, applied to the masses and spins that the teams measured.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the area went up although the mass went down.</strong> The key is that the area goes as the <em>square</em> of the mass: doubling a black hole’s mass quadruples its horizon area. So add up the
            squares. Before: {scaling.massesSolar[0]}² + {scaling.massesSolar[1]}² = {thousands(scaling.squaresBefore[0])} + {thousands(scaling.squaresBefore[1])} = {thousands(scaling.sumOfSquares)}, in units of 16π × (G/c²)². After: {scaling.afterMassSolar}² = {thousands(scaling.afterMassSquared)}, times the
            spin factor {two(scaling.spinFactorAfter)} for a spin of {mass.spinAfter}, is {thousands(scaling.afterInSameUnits)}. And {thousands(scaling.afterInSameUnits)} ÷ {thousands(scaling.sumOfSquares)} = {two(scaling.ratio)}, the same {two(change.ratio)} as in Picture 2. If nothing had been radiated and
            there were no spin, the one black hole would have {mass.totalBeforeSolar.toFixed(1)}² = {thousands(scaling.totalMassSquared)}, which is {two(scaling.ratioNoLossNoSpin)} times {thousands(scaling.sumOfSquares)}. Losing {one(mass.radiatedPercent)} percent of the mass and taking up a spin
            trims that from {two(scaling.ratioNoLossNoSpin)} to {two(scaling.ratio)}, but it stays above 1. Now the raindrops, as a comparison only. A drop’s radius grows only as the cube root of its mass, so its surface goes as the mass to the power 2/3: two equal drops that merge end up with{' '}
            {two(raindropMergerRatio())} times the surface they had, {Math.round((1 - raindropMergerRatio()) * 100)} percent less. A black hole’s horizon radius grows in step with its mass, so two equal black holes that merge, with nothing radiated and no spin, end up with {two(blackHoleEqualMergerRatio())} times the area.
            That difference, between a radius that grows as the cube root of the mass and one that grows with the mass itself, is why a merger shrinks the surface of drops and grows the area of black holes.
          </p>
          <p style={paragraphStyle}>
            <strong>3. What the area theorem says.</strong> In 1971 Stephen Hawking showed that, in general relativity, when black holes merge, the combined area of their horizons can only grow, never shrink (the University of Birmingham’s
            release puts it that way). He proved it from the equations of the theory, under conditions that this page does not go into, and the page does not derive it. What GW250114 allowed was a test of that prediction against a real merger: the
            teams worked out the areas from the measured masses and spins, and found that the area after was larger than the total before, with high confidence. The experiment does not say that the theorem is proved by
            this event, because a theorem is proved by argument and not by one measurement. It says that this event is consistent with it.
          </p>
          <p style={paragraphStyle}>
            <strong>4. A ceiling on what a merger can radiate.</strong> Because the area cannot shrink, a merger cannot give off too much of its mass. At a spin of {ceilingMeasured.spinAfter} after, the smallest mass that keeps the area from falling is the square
            root of {thousands(ceilingMeasured.sumOfSquares)} ÷ {two(ceilingMeasured.h)}, which is {one(ceilingMeasured.minMassAfterSolar)} Suns. Compared with {one(ceilingMeasured.massBeforeSolar)} Suns before, the most that could be radiated is
            1 − {one(ceilingMeasured.minMassAfterSolar)} ÷ {one(ceilingMeasured.massBeforeSolar)} = {one(ceilingMeasured.sharePercent)} percent. With no spin after, it is the square root of {thousands(ceilingNone.sumOfSquares)}, which is {one(ceilingNone.minMassAfterSolar)} Suns, so{' '}
            {one(ceilingNone.sharePercent)} percent (this simplest case matches a limit that Hawking found, but that has not been checked against a source for this page). GW250114 radiated {one(real.sharePercent)} percent, far under both. The ceiling is arithmetic on the formula, not a measurement.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What was measured, what was calculated, and how sure we are.</strong> The masses and spins were measured, by fitting a model of the merger to the signal, and each has a give-or-take that this page does not show. The areas were calculated here with the formula.
            The press release says about {thousands(press.beforeKm2)} km² before and about {thousands(press.afterKm2)} km² after, and this page’s formula gives {thousands(change.beforeKm2)} and {thousands(change.afterKm2)}, so the two differ most for the area after, by about {one(cu.areaAfter.pressOverFormulaPercent)} percent. The scientists’ own areas, with their
            give-or-take, are in their paper, which was not read for this page. So the direction (up) is firm in every source, and the size, about {two(change.ratio)} to {two(press.ratio)} times, is not known to the last digit. It is also one event, which is why the result is
            called strong evidence and not settled.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Why physicists care.</strong> The University of Birmingham’s release says a black hole’s area is proportional to its entropy, its degree of disorder. A comparison only, not a proof: a cup of hot tea left alone cools to room temperature, and
            never by itself heats up again. In the same way, a closed system’s entropy does not go down, and the area theorem looks like that rule for black holes. That is why the theorem is taken so seriously. This page does not explain entropy further.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that the mass of the merged black hole is less than the two before, that its horizon area is more, and how the arithmetic makes that possible. You did not see a new law, the scientists’ own areas, or a
            proof of why the theorem is true. Hawking radiation (Black Holes Experiment 10) makes a black hole lose mass, and so lose area, extremely slowly; the area theorem belongs to the classical theory, which leaves that out, so the two do not clash (a general reading, with no source read for this page).
            And nothing here says anything about quantum gravity.
          </p>
        </div>
      )}
    </div>
  )
}
