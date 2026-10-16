import { useState } from 'react'
import { everydayFrequencyFactorOf, DEFAULT_SOURCE_NM } from '../physics/dopplerShift'
import { everydayBrightnessFactorOf, runTravelerSky } from '../physics/travelerSky'
import type { TravelerSkyStar } from '../physics/travelerSky'

type Prediction = 'brighter' | 'same' | 'dimmer'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TravelerSkyTutorProps {
  speed: number
  predictedAhead: Prediction
  predictedSideways: Prediction
  onExplained?: () => void
}

const predictionWords: Record<Prediction, string> = { brighter: 'brighter', same: 'the same brightness', dimmer: 'dimmer' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Two decimals, or three for a factor below 0.1 (so that 0.005 does not show as 0.01).
const number = (value: number) => (value >= 0.1 ? value.toFixed(2) : value.toFixed(3))

// Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior": observe, compare with the
// predictions, one conceptual question, then the explanation after the learner has responded. The explanation begins by marking each
// prediction as matched or not matched (the owner's choice for Experiment 8, followed here), and nowhere earlier. Every number comes from
// the physics module (`runTravelerSky`, `everydayBrightnessFactorOf`, `everydayFrequencyFactorOf`), never typed in by hand (CLAUDE.md §9).
// No real-world example is used, because none has a source check (the specification's Decision 10).
export function TravelerSkyTutor({ speed, predictedAhead, predictedSideways, onExplained }: TravelerSkyTutorProps) {
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
  const sky = runTravelerSky(speed)
  const D = sky.timeDilationFactor
  const ahead: TravelerSkyStar = sky.stars[0]
  const sideways: TravelerSkyStar = sky.stars[6]
  const behind: TravelerSkyStar = sky.stars[12]
  // A factor above 1 is brighter than the lab sees the star, below 1 dimmer, and exactly 1 the same.
  const outcomeOf = (star: TravelerSkyStar): Prediction => (Math.abs(star.brightnessFactor - 1) < 1e-9 ? 'same' : star.brightnessFactor > 1 ? 'brighter' : 'dimmer')
  const everydayFrequency = (labAngle: number) => everydayFrequencyFactorOf(labAngle, speed)
  const everydayBrightness = (labAngle: number) => everydayBrightnessFactorOf(labAngle, speed)

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
              'Look at the two pictures, the bars and the table. What do you notice about the brightness of the stars in the lab’s sky and in the traveler’s sky? Compare it with the colors.'}
            {tutorStep === 'compare' &&
              `You predicted that the star straight ahead would look ${predictionWords[predictedAhead]} and the sideways star ${predictionWords[predictedSideways]}. In this run, the straight-ahead star’s brightness factor was ${number(ahead.brightnessFactor)} and the sideways star’s was ${number(sideways.brightnessFactor)}. Comparing that with your predictions, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The stars have not changed. So why would a star that is neither ahead nor behind look brighter? And why would the brightness change by more than the color did?'}
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
            For the star straight ahead you predicted <em>{predictionWords[predictedAhead]}</em>, and the traveler measured a brightness factor of{' '}
            {number(ahead.brightnessFactor)}, which is <em>{predictionWords[outcomeOf(ahead)]}</em>. {predictedAhead === outcomeOf(ahead) ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            For the star the lab sees sideways you predicted <em>{predictionWords[predictedSideways]}</em>, and the factor was{' '}
            {number(sideways.brightnessFactor)}, which is <em>{predictionWords[outcomeOf(sideways)]}</em>. {predictedSideways === outcomeOf(sideways) ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            Either way, the parts below explain why.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> At {speed}c, the traveler measured the star straight ahead at{' '}
            {number(ahead.brightnessFactor)} times the lab’s brightness, the star we follow at {number(sideways.brightnessFactor)} times, and the star
            straight behind at {number(behind.brightnessFactor)} times. Of the 24 stars, {sky.brighterCount} were brighter than the lab measures
            and {sky.dimmerCount} were dimmer, and the brightness factor passed through 1 at {one(sky.travelerCrossingAngle ?? 0)}° from straight
            ahead in the traveler’s sky. The color shift factors of the same three stars were {two(ahead.factor)}, {two(sideways.factor)} and{' '}
            {two(behind.factor)}.
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: rain.</strong> Run into the rain and two things happen at once: more raindrops hit you each
            second, and each one hits harder. The rain has not changed. Run away from it and both go the other way: fewer drops, each
            weaker. Starlight does something like this. The two effects work together, so the change is bigger than either one alone. (The
            numbers for light are not the rain’s, but the idea of two effects at once is the same.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. The two effects, with simple math.</strong> Light from a star reaches you as a stream of photons, tiny packets of
            light. If the traveler flies toward a star, the photons arrive more often by the factor f′ ÷ f, the same number as the color’s
            shift factor in Experiment 8. And each photon carries more energy by the same factor, because a bluer light’s photons carry
            more energy. The energy that arrives each second is the number of photons times the energy of each, so it changes by that
            factor twice. At {speed}c, for the star straight ahead, f′ ÷ f = {two(ahead.factor)}: {two(ahead.factor)} times as often, and{' '}
            {two(ahead.factor)} times the energy each, so {two(ahead.factor)} × {two(ahead.factor)} = {number(ahead.brightnessFactor)} times the energy each
            second. For the star straight behind, f′ ÷ f = {two(behind.factor)}, so {two(behind.factor)} × {two(behind.factor)} ={' '}
            {number(behind.brightnessFactor)}.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the sideways star is brighter: time dilation, twice.</strong> The everyday rule for each of the two effects gives
            {' '}{two(everydayFrequency(90))} for the star the lab sees exactly sideways, so the everyday brightness factor is{' '}
            {two(everydayFrequency(90))} × {two(everydayFrequency(90))} = {two(everydayBrightness(90))}: no change. The traveler’s clock runs slow by
            the factor D from Experiment 3. Here D = {two(D)}. Counting per tick of that slower clock raises each effect by 1 ÷ D, which is{' '}
            {two(1 / D)}, so the brightness factor is {two(1 / D)} × {two(1 / D)} = {number(sideways.brightnessFactor)}. Compared with the star’s
            color, which was changed by {two(1 / D)}, the brightness is changed by that number twice over.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The worked formula.</strong> B′ ÷ B = (f′ ÷ f)² = ((1 + β cos θ) ÷ D)². For the star the lab sees sideways, cos 90° =
            0, so B′ ÷ B = (1 ÷ {two(D)})² = {number(sideways.brightnessFactor)}. (This is the same change of a ray’s energy that gave the angle in
            Experiment 7 and the color in Experiment 8, and light’s energy is proportional to its frequency.)
          </p>
          <p style={paragraphStyle}>
            <strong>6. Direction, color and brightness are one calculation.</strong> The same change of a ray’s energy gave the direction
            (Experiment 7), the color (Experiment 8) and now the brightness. Because the brightness factor is the square of the color’s
            factor, a star is brighter exactly when it is bluer and dimmer exactly when it is redder. The line where blue turns to red is
            also where brighter turns to dimmer: the dashed yellow line in the picture, at {one(sky.travelerCrossingAngle ?? 0)}° from straight
            ahead in the traveler’s sky.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What was shown, and what was not.</strong> You saw single points of one pure {DEFAULT_SOURCE_NM} nm color, on a flat
            slice of the sky. Brightness meant what an instrument facing the star measures, not what an eye reports (an eye cannot see the
            ultraviolet and infrared light that many of these stars have shifted into). You did not see the glow of the whole sky or the
            brightness of anything with a size, which change differently. The stars themselves have not changed. Neither the lab’s sky nor
            the traveler’s is the real sky: each observer measures the light that reaches them.
          </p>
        </div>
      )}
    </div>
  )
}
