import { useState } from 'react'
import { rainRuleSidewaysAngle, runSky } from '../physics/aberration'

type Prediction = 'same' | 'ahead' | 'behind'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface AberrationTutorProps {
  speed: number
  predicted: Prediction
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  same: 'the traveler would see the sideways star exactly sideways, the same as the lab',
  ahead: 'the traveler would see the sideways star ahead of sideways, nearer the direction of travel',
  behind: 'the traveler would see the sideways star behind sideways, further from the direction of travel',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior": observe, compare with the
// prediction, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (`runSky`, `rainRuleSidewaysAngle`), never typed in by hand (CLAUDE.md §9), except the facts about Earth's motion and Bradley, which
// are general knowledge with the source status listed in the specification.
export function AberrationTutor({ speed, predicted, onExplained }: AberrationTutorProps) {
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

  const one = (value: number) => value.toFixed(1)
  const sky = runSky(speed)
  const sidewaysAngle = sky.sidewaysStarTravelerAngle
  const rainAngle = rainRuleSidewaysAngle(speed)
  const rainAt03 = rainRuleSidewaysAngle(0.3)
  const rainAt09 = rainRuleSidewaysAngle(0.9)
  const realAt03 = runSky(0.3).sidewaysStarTravelerAngle
  const realAt09 = runSky(0.9).sidewaysStarTravelerAngle

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
              'Look at the two pictures and the tables. What do you notice about where the stars are, in the lab’s sky and in the traveler’s sky?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the lab saw that star at 90° and the traveler saw it at ${one(sidewaysAngle)}°. Comparing your prediction with the pictures and the table, what do you notice?`}
            {tutorStep === 'conceptual' && 'The stars did not move. So what changed?'}
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
          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> At {speed}c, the star the lab sees exactly sideways (90°) is
            seen by the traveler at {one(sidewaysAngle)}° from straight ahead. In the lab’s sky, {sky.countsLab.aheadOfSideways} of the 24 stars
            were less than 90° from straight ahead. In the traveler’s sky, {sky.countsTraveler.aheadOfSideways} were. The striped wedge held{' '}
            {sky.countsLab.within30OfAhead} stars for the lab and {sky.countsTraveler.within30OfAhead} for the traveler, and the dotted wedge held{' '}
            {sky.countsLab.within30OfBehind} for the lab and {sky.countsTraveler.within30OfBehind} for the traveler. The two stars straight ahead
            (0°) and straight behind (180°) were at the same angle for both.
          </p>
          <p style={paragraphStyle}>
            <strong>2. What changed.</strong> The stars did not move. Each observer measures the direction in which the starlight arrives,
            and the two observers are moving relative to each other, so they measure different directions for the same light. A moving
            observer is “running into” the starlight a little, so the direction the light seems to come from is tilted toward the way the
            observer is going. Neither measurement is the “real” direction. Both are correct for the observer who made them.
          </p>
          <p style={paragraphStyle}>
            <strong>3. An everyday example: rain.</strong> Rain falls straight down, but when you drive through it, it seems to slant toward
            you, and the faster you drive, the more it slants. If the rain falls at 10 metres per second and you drive at 10 metres per
            second, it seems to come in at 45 degrees. Starlight does something like this, with the speed of light in place of the rain’s
            speed. At low speeds the numbers are nearly the same: at 0.3c the rain rule puts the sideways star at {one(rainAt03)}° and the
            real answer is {one(realAt03)}°. At 0.9c the rain rule says {one(rainAt09)}° and the real answer is {one(realAt09)}°. The rain
            rule fails there because the way speeds and times behave near the speed of light (Experiments 3 to 5) is not the rain’s. For
            your speed of {speed}c, the rain rule gives {one(rainAngle)}° and the real answer is {one(sidewaysAngle)}°.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The worked formula.</strong> The traveler’s angle comes from the lab’s angle θ and the speed:{' '}
            cos θ′ = (cos θ + {speed}) ÷ (1 + {speed} × cos θ). Here <em>cos</em> is a number between −1 and 1 that tells you how far
            ahead (1) or behind (−1) a direction is. For the sideways star, θ = 90°, and cos 90° = 0, so cos θ′ = ({0} + {speed}) ÷ (1 + 0) ={' '}
            {speed}. The angle whose cos is {speed} is {one(sidewaysAngle)}°. The star has not moved. Only the traveler’s measurement of its
            direction is different. (The formula follows from how the energy and momentum of a pulse of light change between observers, the
            same change as in Experiment 5.)
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why two stars do not move.</strong> Straight ahead and straight behind are along the line of travel, so there is no
            sideways motion to tilt the light.
          </p>
          <p style={paragraphStyle}>
            <strong>6. The light clock again.</strong> In the light clock of the first chapter, a ray that went straight across for one
            observer was slanted for the other. Starlight arriving sideways for the lab is slanted for the traveler in the same way.
          </p>
          <p style={paragraphStyle}>
            <strong>7. A real example.</strong> Earth moves around the Sun at about 30 kilometres per second, about one ten-thousandth of
            the speed of light. Because of it, each star seems to trace a tiny ellipse in the sky each year, by at most about 20 arcseconds
            (an arcsecond is 1/3600 of a degree, so 20 arcseconds is about a 180th of a degree). The effect was discovered in 1727 by James
            Bradley, who was looking for something else.
          </p>
          <p style={paragraphStyle}>
            <strong>8. What was shown, and what was not.</strong> You saw directions only, on a flat slice of the sky, for stars very far away
            and at rest in the lab. You did not see brightness or color. The next experiment asks what happens to the color.
          </p>
        </div>
      )}
    </div>
  )
}
