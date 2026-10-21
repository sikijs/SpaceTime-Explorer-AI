import { useState } from 'react'
import {
  ALPHA_2023,
  combinedUncertainty,
  compatibility,
  fallDistance,
  fallsUpAnswer,
  G_EARTH,
  readingAnswer,
  sigmaNeeded,
  sigmasFrom,
  timeToFall,
  TRAP_LENGTH_M,
  twoSidedChance,
} from '../physics/antimatterGravity'
import type { FallsUpAnswer, ReadingAnswer } from '../physics/antimatterGravity'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface AntimatterGravityTutorProps {
  fallsUpPrediction: FallsUpAnswer
  readingPrediction: ReadingAnswer
  onExplained?: () => void
}

const fallsUpWords: Record<FallsUpAnswer, string> = {
  compatible: 'compatible with antimatter falling up',
  borderline: 'borderline for antimatter falling up',
  ruledOut: 'ruled out for antimatter falling up',
}
const readingWords: Record<ReadingAnswer, string> = {
  slower: 'shows that it falls about 25 percent more slowly',
  cannotTell: 'cannot tell whether it falls more slowly',
  exactlyLikeMatter: 'shows that it falls exactly like ordinary matter',
}

// "2.1 × 10⁻¹⁷" from a number, with the exponent in superscript digits; plain decimals for chances of 1 percent or more.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const chanceText = (value: number) => {
  if (value >= 0.01) return value.toFixed(2)
  const [mantissa, exponent] = value.toExponential(1).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 8. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes
// from the physics module (antimatterGravity.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source
// table (the Nature paper and arXiv:2503.22471, read through fetch summaries). The predictions are marked only in the explanation (the owner's choice
// for the group). The tutor does not say that antimatter falls exactly like ordinary matter, and does not say that it may not.
export function AntimatterGravityTutor({ fallsUpPrediction, readingPrediction, onExplained }: AntimatterGravityTutorProps) {
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
  const measured = ALPHA_2023.ratio
  const combined = combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation)
  const fromMatter = sigmasFrom(measured, combined, 1)
  const fromNone = sigmasFrom(measured, combined, 0)
  const fromUp = sigmasFrom(measured, combined, -1)
  const rightFallsUp = fallsUpAnswer()
  const rightReading = readingAnswer()
  const smallBar = 0.1
  const smallFromMatter = sigmasFrom(measured, smallBar, 1)
  const timeMatter = timeToFall(1, TRAP_LENGTH_M) as number
  const timeAlpha = timeToFall(measured, TRAP_LENGTH_M) as number
  const needForOnePercent = sigmaNeeded(0.01, 3)
  const needForGap = sigmaNeeded(1 - measured, 3)

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
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Picture 2. Where do the markers for −1, 0 and 1 sit, compared with the measured value 0.75 and the three bars around it? Which of the three possibilities is the closest to the measured value, and which is the furthest?'}
            {tutorStep === 'compare' &&
              `You predicted that the measurement is ${fallsUpWords[fallsUpPrediction]}, and that a measurement of 0.75 give or take about 0.2 ${readingWords[readingPrediction]}. Now look at Table 2 and at Picture 2. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'The ALPHA paper reports a ratio of 0.75, yet the team does not say that antimatter falls more slowly than ordinary matter. Why not? What would you need to see before you could say it?'}
          </p>

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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that the measurement
            is <em>{fallsUpWords[fallsUpPrediction]}</em>. The ratio −1 is {fromUp.toFixed(2)} sigma from the measured {measured}, which is{' '}
            <em>{fallsUpWords[rightFallsUp]}</em>. {fallsUpPrediction === rightFallsUp ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {fallsUpPrediction === 'borderline' &&
              ' It is a natural thought: a measurement good to only about a fifth sounds too rough to rule much out. But −1 is far away, almost two whole units from 0.75, and a fifth is small next to that.'}
            {fallsUpPrediction === 'compatible' &&
              ' It is a natural thought: a measurement good to only about a fifth sounds too rough to rule much out. But −1 is far away, almost two whole units from 0.75, and a fifth is small next to that.'}{' '}
            You also predicted that a measurement of 0.75 give or take about 0.2 <em>{readingWords[readingPrediction]}</em>. The ratio 1 is only {fromMatter.toFixed(2)}{' '}
            sigma from 0.75, which is <em>compatible</em>, so the measurement <em>{readingWords[rightReading]}</em>.{' '}
            {readingPrediction === rightReading ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {readingPrediction === 'slower' &&
              ' It is a natural thought: 0.75 is a quarter below 1. But that reads the number without its give or take (explained in part 3).'}
            {readingPrediction === 'exactlyLikeMatter' &&
              ' It is a natural thought: 1 is compatible with the measurement. But “cannot be ruled out” is not the same as “shown”, because other values close to 0.75 cannot be ruled out either (explained in part 3).'}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What a ratio means for a falling atom.</strong> A ratio of 1 means the atom falls like ordinary matter: ½ × 1 × {G_EARTH} × 1 ={' '}
            {fallDistance(1, 1).toFixed(1)} metres in the first second. A ratio of {measured} means gravity pulls it three quarters as hard: ½ × {measured} × {G_EARTH} ×
            1 = {fallDistance(measured, 1).toFixed(1)} metres. A ratio of 0 means no pull at all, so it does not move. A ratio of −1 means a pull as strong as
            for ordinary matter but upward, so it rises {Math.abs(fallDistance(-1, 1)).toFixed(1)} metres. The fall of the trap’s {(TRAP_LENGTH_M * 100).toFixed(1)} cm takes{' '}
            {timeMatter.toFixed(2)} seconds at a ratio of 1 and {timeAlpha.toFixed(2)} seconds at {measured}: a difference of only about{' '}
            {(timeAlpha - timeMatter).toFixed(2)} seconds, far too short to time by eye (ALPHA-g counts where atoms leave and does not time a fall).
          </p>

          <p style={paragraphStyle}>
            <strong>2. The two give-or-takes.</strong> ALPHA reports its result as ({measured} ± {ALPHA_2023.statSys} ± {ALPHA_2023.simulation}) g. The first give or
            take, ±{ALPHA_2023.statSys}, comes from counting only about 100 atoms (chance plays a part) and from small faults in the equipment. The second,
            ±{ALPHA_2023.simulation}, comes from the computer simulation that turns counts into an acceleration, which is itself not exact. This experiment
            combines the two in the simplest way, as if independent: √({ALPHA_2023.statSys}² + {ALPHA_2023.simulation}²) = √
            {(ALPHA_2023.statSys ** 2 + ALPHA_2023.simulation ** 2).toFixed(4)} = {combined.toFixed(3)}. That is this experiment’s own simplification: the paper states the two
            separately.
          </p>

          <p style={paragraphStyle}>
            <strong>3. How far from each possibility, and what that tells us.</strong> The gap between the measured value and a possibility, divided by the give or
            take, is the number of sigma. For the ratio 1 it is {(1 - measured).toFixed(2)} ÷ {combined.toFixed(3)} = {fromMatter.toFixed(2)}; for 0 it is{' '}
            {measured} ÷ {combined.toFixed(3)} = {fromNone.toFixed(2)}; for −1 it is {(1 + measured).toFixed(2)} ÷ {combined.toFixed(3)} = {fromUp.toFixed(2)}.
          </p>
          <p style={paragraphStyle}>
            An everyday way to see what these mean: a dart player whose throws scatter by about ±{combined.toFixed(2)} around the spot they aim at. You are shown
            one dart that landed at {measured}, and asked which spot the player was aiming at.
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
            <li>
              If the aim was <strong>1</strong>, the dart is {fromMatter.toFixed(1)} scatters off. That is common: about {chanceText(twoSidedChance(fromMatter))} of
              throws land at least that far off. So the aim could easily have been 1.
            </li>
            <li>
              If the aim was <strong>0</strong>, the dart is {fromNone.toFixed(1)} scatters off. That is rare: about {chanceText(twoSidedChance(fromNone))} of throws.
            </li>
            <li>
              If the aim was <strong>−1</strong>, the dart is {fromUp.toFixed(1)} scatters off. That is practically never: about {chanceText(twoSidedChance(fromUp))} of
              throws.
            </li>
          </ul>
          <p style={paragraphStyle}>
            By this experiment’s scale, 1 is <em>{compatibility(fromMatter)}</em>, 0 is <em>{compatibility(fromNone)}</em> (a hint that it is wrong) and −1 is{' '}
            <em>ruled out</em>. Another everyday example: a kitchen scale marked 750 g, give or take 200 g. Is the bag lighter than the 1,000 g printed on it? The
            scale cannot say: 1,000 g is only a little more than one give-or-take away. So 0.75 ± {combined.toFixed(2)} does not show that antimatter falls more
            slowly. A ratio of 1 is within the range that the measurement allows, and so are values a little above and a little below 0.75.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What the measurement has shown, and what it has not.</strong> It is strong evidence that antihydrogen is pulled down by the Earth, and not
            up: falling up with the full strength of g is ruled out ({fromUp.toFixed(1)} sigma). No gravity at all is disfavoured ({fromNone.toFixed(1)} sigma by this
            experiment’s scale; the paper’s own test gives a probability of {chanceText(2.9e-4)}). The paper’s authors describe the result as consistent with
            gravitational attraction. What it has <em>not</em> shown is how close the ratio is to 1: with a give or take of ±{combined.toFixed(2)}, the measurement
            cannot say whether the ratio is exactly 1 or a little different. That is a statement about the precision of a measurement, and not a statement about what
            antimatter does.
          </p>

          <p style={paragraphStyle}>
            <strong>5. Why a smaller error bar would change the reading.</strong> Keep the same value, {measured}, but suppose the give or take were ±{smallBar.toFixed(2)}.
            Then the gap to 1 would be {(1 - measured).toFixed(2)} ÷ {smallBar.toFixed(2)} = {smallFromMatter.toFixed(1)} sigma, which is{' '}
            <em>{compatibility(smallFromMatter)}</em> instead of compatible. The gap would not have changed: the yardstick would have. This is only an
            illustration, not a result. To see a gap of {(1 - measured).toFixed(2)} at 3 sigma, the give or take would have to be at most {(1 - measured).toFixed(2)} ÷ 3 ={' '}
            {needForGap.toFixed(3)}. To see a difference of 1 percent (0.01) at 3 sigma, it would have to be {needForOnePercent.toFixed(4)}. A bathroom scale
            that is good to a kilogram cannot tell whether you have gained a gram.
          </p>

          <p style={paragraphStyle}>
            <strong>6. What is planned.</strong> A review that the antimatter groups submitted in March 2025 says that the 2023 result was repeated in 2024, and that
            the team expects a precision of 1 percent or better is possible in the existing machine. It also describes upgrades for after Long Shutdown 3 (CERN’s
            long stop of its accelerators for maintenance and upgrades) that would take the antihydrogen out of the trap and use atomic interferometry (a very
            sensitive way of measuring a tiny push on atoms) to reach much higher precision. Both terms are in “Words and formulas”. A broader review of December 2025
            describes the same measurement as “about 25 percent” precise and says that reaching 1 percent needs ten-fold cuts in two kinds of systematic error, so the
            sources differ on how hard 1 percent is. Two other experiments at CERN plan to measure the fall by different methods: AEgIS, with a horizontal beam, and
            GBAR, which aims for a precision of about one part in 100,000. As far as the sources read for this page say, none of these has a result yet. These plans
            are as stated in March and December 2025. No newer result was found for this page, although the search was limited.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw what a ratio of 1, 0 and −1 would mean for a falling atom, how a measured value and its give
            or take are turned into a number of sigma away from each possibility, and why 0.75 ± {combined.toFixed(2)} rules out falling up without showing a slower
            fall. What this experiment did <strong>not</strong> do is re-analyse ALPHA’s data, model the trap or the simulation, or claim a new law of gravity. It
            used the published numbers, and its own simple rules for combining them.
          </p>
        </div>
      )}
    </div>
  )
}
