import { useState } from 'react'
import {
  combinedUncertainty,
  EARLY_MEASUREMENT,
  MEASUREMENTS,
  runTensionExperiment,
  sigmaRange,
  tensionSigma,
  WEBB_CEPHEID_RESULT,
  webbEffect,
} from '../physics/hubbleTension'
import type { HubbleMeasurement, SigmaRange, WebbEffect } from '../physics/hubbleTension'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HubbleTensionTutorProps {
  late: HubbleMeasurement
  sigmaPrediction: SigmaRange
  webbPrediction: WebbEffect
  onExplained?: () => void
}

const sigmaWords: Record<SigmaRange, string> = {
  under2: 'less than 2',
  twoToFour: 'between 2 and 4',
  fourToSix: 'between 4 and 6',
  over6: 'more than 6',
}
const webbWords: Record<WebbEffect, string> = {
  lower: 'lower (closer to the early-universe value)',
  same: 'about the same',
  higher: 'higher',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor Behavior": observe, compare with the
// predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (hubbleTension.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for
// the group, as in Spacetime Geometry Experiment 8), never before it. Wording of the third-method paragraph follows the abstract of
// arXiv:2408.06153 ("consistent with the current standard ΛCDM model"), not a stronger claim.
export function HubbleTensionTutor({ late, sigmaPrediction, webbPrediction, onExplained }: HubbleTensionTutorProps) {
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

  const two = (value: number) => value.toFixed(2)
  const one = (value: number) => value.toFixed(1)

  const early = EARLY_MEASUREMENT
  const result = runTensionExperiment(late)
  const actualRange = sigmaRange(result.tension)
  const actualWebb = webbEffect()
  const cchp = MEASUREMENTS.find((m) => m.name === 'CCHP 2024')!
  const shoes = MEASUREMENTS.find((m) => m.name === 'SH0ES 2022')!
  const h0dn = MEASUREMENTS.find((m) => m.name === 'H0DN 2026')!
  const ageDifference = Math.abs(result.earlyHubbleTimeBillionYears - result.lateHubbleTimeBillionYears)

  // The table example of the introduction, written with the project's rule.
  const sloppy = combinedUncertainty(0.5, 0.5)
  const careful = combinedUncertainty(0.1, 0.1)

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
              'Look at the three pictures and the tables. What do you notice about where the early-universe value and your nearby-universe measurement sit on the line, and about how their error bars overlap?'}
            {tutorStep === 'compare' &&
              `You predicted that the two would be ${sigmaWords[sigmaPrediction]} sigma apart, and that the Webb telescope’s new measurements would make the nearby-universe value ${webbWords[webbPrediction]}. In this run the gap was ${two(result.gap)} km/s/Mpc and the distance in sigma was ${two(result.tension)}. Comparing that with your predictions, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Two careful teams measure the same thing, and get values that their error bars say should not happen by chance. What could explain it? And what would you want to check before deciding?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You
            predicted that {late.name} and {early.name} would be <em>{sigmaWords[sigmaPrediction]}</em> sigma apart. They were{' '}
            {two(result.tension)} sigma apart, which is <em>{sigmaWords[actualRange]}</em>.{' '}
            {sigmaPrediction === actualRange ? 'Your prediction matched.' : 'Your prediction did not match.'} You predicted that the Webb
            telescope’s second look at the Cepheid stars would make the nearby-universe value <em>{webbWords[webbPrediction]}</em>. It left
            it <em>{webbWords[actualWebb]}</em> (the details are in part 5 below). {webbPrediction === actualWebb ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            Either way, the parts below explain why.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> The early-universe value is {early.value} ± {early.uncertainty}.
            Your nearby-universe measurement, {late.name}, is {late.value} ± {two(late.uncertainty)}. The gap between the two best values is{' '}
            {two(result.gap)}. Their combined give-or-take (the doubt about the gap) is {two(result.combinedUncertainty)}. So the gap is{' '}
            <strong>{two(result.tension)} sigma</strong>. As a rough age, the early-universe value gives{' '}
            {result.earlyHubbleTimeBillionYears.toFixed(2)} billion years and {late.name} gives {result.lateHubbleTimeBillionYears.toFixed(2)}{' '}
            billion years.
          </p>

          <p style={paragraphStyle}>
            <strong>2. An everyday example: two people measuring a table.</strong> Remember the introduction’s table, measured as 120.0 cm and
            121.0 cm, a gap of 1.0 cm. If each of you said “give or take 0.5”, the combined give-or-take is √(0.5² + 0.5²) = {two(sloppy)} cm, and
            1.0 ÷ {two(sloppy)} = {one(1 / sloppy)} sigma. That is an ordinary difference. If each of you said “give or take 0.1”, it is √(0.1² + 0.1²)
            = {two(careful)} cm, and 1.0 ÷ {two(careful)} = {one(1 / careful)} sigma. That is so large that you would look for a mistake. Same
            gap, different sigma. What matters is the gap measured in units of the doubt.
          </p>

          <p style={paragraphStyle}>
            <strong>3. The counting, with simple math.</strong> Sigma is the gap divided by the combined give-or-take. For your measurement:
            the gap is {late.value} − {early.value} = {two(result.gap)}. The combined give-or-take is √({early.uncertainty}² +{' '}
            {two(late.uncertainty)}²) = {two(result.combinedUncertainty)}. So sigma = {two(result.gap)} ÷ {two(result.combinedUncertainty)} ={' '}
            {two(result.tension)}. In Picture 2 this is the number of tick marks that fit along the gap. The scientists’ own papers use more
            careful statistics than this simple rule, so the sigma they quote can differ a little from ours.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What 5 sigma means.</strong> Suppose there were no real difference, and the two measurements wobbled only by chance.
            How often would chance alone make them differ by 5 sigma or more? About once in 3.5 million times, counting only differences in
            one direction. That is roughly like flipping a coin and getting heads 22 times in a row. This is why 5 sigma is the usual bar in
            many sciences for calling a difference real. (At 1 sigma, chance alone makes a difference at least that big, in one direction, roughly one time
            in six, which is why 1 sigma is nothing to worry about.) Notice what 5 sigma does not tell you. It says that chance is an unlikely
            explanation. It does not say what the real explanation is, and it can only count random wobble. A mistake that affects a whole
            measurement in the same way would not show up in sigma at all.
          </p>

          <p style={paragraphStyle}>
            <strong>5. What was ruled out.</strong> One worry about the nearby-universe measurements was crowding: in a crowded patch of
            sky, the Hubble telescope’s pictures might blur a Cepheid together with its neighbours, and spoil its distance. In 2024, the
            James Webb Space Telescope, which sees much finer detail, looked again at more than a thousand of the same Cepheids. Its
            measurements differed from the Hubble telescope’s by {WEBB_CEPHEID_RESULT.differenceMagnitudes} ± {WEBB_CEPHEID_RESULT.uncertaintyMagnitudes}{' '}
            magnitudes (magnitude is the astronomers’ scale of brightness). That difference is smaller than its own give-or-take, so the two
            telescopes agreed, and the nearby-universe value stayed about the same. The authors report that this rejects unrecognized
            crowding as the explanation of the tension, at {WEBB_CEPHEID_RESULT.crowdingRejectedAtSigma} sigma. It is like suspecting that a
            blurry photograph spoiled your measurement, and then retaking it with a sharper camera and getting the same answer.
          </p>

          <p style={paragraphStyle}>
            <strong>6. A third method.</strong> The Chicago-Carnegie program measures distances with a different kind of star, red giants,
            and finds {cchp.value} ± {two(cchp.uncertainty)}. Compared with {early.name}, that is {two(tensionSigma(early, cchp))} sigma, and
            compared with {shoes.name} it is {two(tensionSigma(cchp, shoes))} sigma. Its error bar is long, so it overlaps both, just as you
            may have seen in Picture 1. The authors state that their results are consistent with the current standard model of the
            universe. The {shoes.name} team and the 2026 community report, {h0dn.name} ({h0dn.value} ± {two(h0dn.uncertainty)}), which
            combines many methods, find the higher value. This is why the status is <strong>Contested</strong>: careful teams, real data,
            and results that point in different directions.
          </p>

          <p style={paragraphStyle}>
            <strong>7. What it could be, and what it is not.</strong> There are two broad possibilities. One is that one or more of the
            measurements has an error nobody has found yet. The other is that the standard model of the universe, which the early-universe
            value depends on, is missing something. Neither has been shown to be true. Another microwave-background telescope, ACT, reported
            in 2025 that models designed to raise the early-universe value are not favoured by its data. This experiment cannot decide
            between the two possibilities, and no experiment on this page can: it only lets you see the size of the disagreement.
          </p>

          <p style={paragraphStyle}>
            <strong>8. What it means for the age.</strong> With your numbers, the simple age estimate 1 ÷ H₀ is{' '}
            {result.earlyHubbleTimeBillionYears.toFixed(2)} billion years from {early.name} and {result.lateHubbleTimeBillionYears.toFixed(2)}{' '}
            from {late.name}, a difference of about {one(ageDifference)} billion years. This is a rough estimate. The real age, about 13.8
            billion years, comes from the fuller model of Cosmology Experiment 6, which does not assume the expansion was always the same.
            The point is that a disagreement about the expansion rate today is also a disagreement about how long the universe has been
            expanding.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>9. What was shown, and what was not.</strong> You saw a few published measurements, drawn with simple error bars, and a
            rough age. A tension is a puzzle, not yet a discovery, and cosmology has seen tensions disappear when measurements improved. This
            one has not so far. What this experiment did not show is how any of the measurements is made in detail, or why they differ.
            That is not yet known. As of October 2026, it is still an open question.
          </p>
        </div>
      )}
    </div>
  )
}
