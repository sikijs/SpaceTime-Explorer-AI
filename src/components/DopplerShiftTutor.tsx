import { useState } from 'react'
import { DEFAULT_SOURCE_NM, everydayFrequencyFactorOf, frequencyFactorFromTravelerAngle, runDoppler } from '../physics/dopplerShift'
import type { DopplerStar } from '../physics/dopplerShift'

type Prediction = 'bluer' | 'same' | 'redder'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DopplerShiftTutorProps {
  speed: number
  predictedAhead: Prediction
  predictedSideways: Prediction
  onExplained?: () => void
}

const predictionWords: Record<Prediction, string> = { bluer: 'bluer', same: 'the same color', redder: 'redder' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior": observe, compare with the
// predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (`runDoppler`, `everydayFrequencyFactorOf`, `frequencyFactorFromTravelerAngle`), never typed in by hand (CLAUDE.md §9). The cosmic
// microwave background example is left out because it has no source check (the specification's Decision 5). The predictions are marked
// only in the explanation (the owner's choice, 2026-10-16), never before it.
export function DopplerShiftTutor({ speed, predictedAhead, predictedSideways, onExplained }: DopplerShiftTutorProps) {
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
  const nm = (value: number) => (value >= 100 ? String(Math.round(value)) : String(Number(value.toPrecision(2))))
  const doppler = runDoppler(speed)
  const D = doppler.timeDilationFactor
  const ahead: DopplerStar = doppler.stars[0]
  const sideways: DopplerStar = doppler.stars[6]
  const behind: DopplerStar = doppler.stars[12]
  const everyday = (labAngle: number) => everydayFrequencyFactorOf(labAngle, speed)
  const sidewaysAtNinetyInTravelerSky = frequencyFactorFromTravelerAngle(90, speed)
  // A factor above 1 is a higher frequency than the lab's (bluer), below 1 a lower one (redder), and exactly 1 the same color.
  const outcomeOf = (star: DopplerStar): Prediction => (Math.abs(star.factor - 1) < 1e-9 ? 'same' : star.factor > 1 ? 'bluer' : 'redder')
  const rangeWords = (star: DopplerStar) => (star.range === 'visible' ? 'visible' : star.range)

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
              'Look at the two pictures, the bar and the table. What do you notice about the color of the stars in the lab’s sky and in the traveler’s sky?'}
            {tutorStep === 'compare' &&
              `You predicted that the star straight ahead would look ${predictionWords[predictedAhead]} and the sideways star ${predictionWords[predictedSideways]}. In this run, the straight-ahead star’s light was measured at ${two(ahead.factor)} times the lab’s frequency, and the sideways star’s at ${two(sideways.factor)} times. Comparing that with your predictions, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The stars have not changed color. So what is different for the traveler? And why would a star that is neither ahead nor behind change color?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result.
            For the star straight ahead you predicted <em>{predictionWords[predictedAhead]}</em>, and the traveler measured a shift factor of{' '}
            {two(ahead.factor)}, which is <em>{predictionWords[outcomeOf(ahead)]}</em>. {predictedAhead === outcomeOf(ahead) ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            For the star the lab sees sideways you predicted <em>{predictionWords[predictedSideways]}</em>, and the factor was{' '}
            {two(sideways.factor)}, which is <em>{predictionWords[outcomeOf(sideways)]}</em>. {predictedSideways === outcomeOf(sideways) ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            Either way, the parts below explain why.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> At {speed}c, the lab measured {DEFAULT_SOURCE_NM} nm for every star.
            The traveler measured the star straight ahead at {nm(ahead.wavelengthNm)} nm (a shift factor of {two(ahead.factor)}, {rangeWords(ahead)}),
            the star we follow at {nm(sideways.wavelengthNm)} nm (a factor of {two(sideways.factor)}, {rangeWords(sideways)}), and the star
            straight behind at {nm(behind.wavelengthNm)} nm (a factor of {two(behind.factor)}, {rangeWords(behind)}). Of the 24 stars,{' '}
            {doppler.towardBlueCount} were shifted toward blue and {doppler.towardRedCount} toward red, and the factor passed through 1 at{' '}
            {one(doppler.travelerCrossingAngle ?? 0)}° from straight ahead in the traveler’s sky.
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: a siren.</strong> An ambulance’s siren sounds higher as it comes toward you and lower as it goes
            away. The siren has not changed. The sound waves reach you closer together when you and the ambulance are getting closer, and farther
            apart when you are getting farther apart. The crests of a light wave work the same way: for a traveler flying toward a star, the
            crests arrive more often, so the light looks bluer. For a traveler flying away from a star, they arrive less often, so it looks
            redder. The stars have not changed color. Each observer measures the light that reaches them, and the two observers measure
            different frequencies for the same light. Neither measurement is “the real color”.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The everyday rule, with simple math.</strong> Count the crests. If the traveler flies toward a star, the crests
            arrive more often by the factor 1 + β cos θ, where β is the speed ({speed}) and cos θ is 1 straight ahead, 0 exactly sideways and
            −1 straight behind. At {speed}c that is {two(everyday(0))} times for the star straight ahead and {two(everyday(180))} times for the star
            straight behind. For the star the lab sees exactly sideways, the everyday rule gives {two(everyday(90))}: no change at all.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the real answer is different: time dilation.</strong> The traveler’s clock runs slow by the factor D from
            Experiment 3. Here D = {two(D)}. The traveler counts crests per tick of <em>its own</em> clock. Seen from the lab, that clock
            ticks more slowly, so each of its ticks lasts longer and the traveler counts more crests per tick. That divides each everyday
            number by D. At {speed}c: the star straight ahead is {two(everyday(0))} ÷ {two(D)} = {two(ahead.factor)}, the star we follow is{' '}
            {two(everyday(90))} ÷ {two(D)} = {two(sideways.factor)}, and the star straight behind is {two(everyday(180))} ÷ {two(D)} ={' '}
            {two(behind.factor)}. These are the numbers in your table.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The worked formula.</strong> f′ ÷ f = (1 + β cos θ) ÷ D. For the star the lab sees sideways, cos 90° = 0, so f′ ÷ f
            = (1 + 0) ÷ {two(D)} = {two(sideways.factor)}. This is the same change of a ray’s energy that gave the angle in Experiment 7, and
            the energy of light is proportional to its frequency. The number for the star straight behind, {two(behind.factor)}, is the factor
            of Experiment 5 of Gravitational Waves at the same speed.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Where blue turns to red.</strong> Because of the extra division by D, the dividing line is not at 90°. In the
            traveler’s sky, a star at exactly 90° has a factor of {two(sidewaysAtNinetyInTravelerSky)}, which is D, so it is already shifted
            toward red. The dividing line lies ahead of the 90° line, at {one(doppler.travelerCrossingAngle ?? 0)}° (the dashed yellow line in the
            picture).
          </p>
          <p style={paragraphStyle}>
            <strong>7. A real example.</strong> The light of a galaxy that is moving away from us is redshifted, which is how astronomers
            measured the expansion of the universe (Experiment 1 of Cosmology).
          </p>
          <p style={paragraphStyle}>
            <strong>8. What was shown, and what was not.</strong> You saw colors only, on a flat slice of the sky, with every star sending out one
            pure color. Real stars send out a mixture of colors, and the brightness of their light changes too. You did not see brightness.
          </p>
        </div>
      )}
    </div>
  )
}
