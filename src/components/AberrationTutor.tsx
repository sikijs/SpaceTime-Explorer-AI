import { useState } from 'react'
import { predictionMatches, runSky, sidewaysRayPush, smallSpeedShiftArcseconds } from '../physics/aberration'
import type { SidewaysGuess } from '../physics/aberration'
import { RayPushDrawing } from './AberrationPushDrawing'

type Prediction = SidewaysGuess
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

export const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const one = (value: number) => value.toFixed(1)
const three = (value: number) => value.toFixed(3)

// The tutor's explanation (shown only after the learner has answered the three questions). Audit update of 2026-11-23 (wording in docs/audit/spacetime-geometry/07-draft-wording-cause.md,
// approved by the owner on 2026-11-23, CLAUDE.md §28.1): items 2 to 5 now show the cause step by step, with the real numbers and a drawing. Every number comes from the physics module.
export function AberrationExplanation({ speed, predicted }: { speed: number; predicted: Prediction }) {
  const sky = runSky(speed)
  const sidewaysAngle = sky.sidewaysStarTravelerAngle
  const push = sidewaysRayPush(speed)
  const across = String(Number(push.travelerPushAcross.toFixed(3))) // 1
  const push03 = sidewaysRayPush(0.3)
  const push09 = sidewaysRayPush(0.9)
  const D = sky.timeDilationFactor
  const matched = predictionMatches(predicted, speed)
  const earthSpeed = 29.78
  const earthShift = smallSpeedShiftArcseconds(earthSpeed)
  return (
    <div>
      <p style={paragraphStyle}>
        <strong>0. Your guess, marked.</strong> You guessed that {predictionClauses[predicted]}. The traveler saw the star at {one(sidewaysAngle)}°, which is{' '}
        {sidewaysAngle < 90 ? 'ahead of sideways, less than 90° from straight ahead' : sidewaysAngle > 90 ? 'behind sideways, more than 90° from straight ahead' : 'exactly sideways'}, so your guess was{' '}
        <strong>{matched ? 'right' : 'not right this time'}</strong>. (At every speed offered, 0.3c, 0.6c, 0.9c and 0.99c, the traveler sees that star ahead of sideways.)
      </p>
      <p style={paragraphStyle}>
        <strong>1. What the results show, in your own numbers.</strong> At {speed}c, the star the lab sees exactly sideways (90°) is seen by the traveler at {one(sidewaysAngle)}° from straight
        ahead. In the lab’s sky, {sky.countsLab.aheadOfSideways} of the 24 stars were less than 90° from straight ahead. In the traveler’s sky, {sky.countsTraveler.aheadOfSideways} were. The striped
        wedge held {sky.countsLab.within30OfAhead} stars for the lab and {sky.countsTraveler.within30OfAhead} for the traveler, and the dotted wedge held {sky.countsLab.within30OfBehind} for the
        lab and {sky.countsTraveler.within30OfBehind} for the traveler. The two stars straight ahead (0°) and straight behind (180°) were at the same angle for both.
      </p>
      <p style={paragraphStyle}>
        <strong>2. What each observer measures: the direction the light comes from.</strong> A ray of starlight carries a <em>push</em>: it hits what it lands on a little, in the direction it is
        travelling. (Physicists call this push <em>momentum</em>. You met it in Experiment 5: a pulse of light has both energy and momentum.) You see a star in the direction the light came{' '}
        <em>from</em>, which is the direction opposite to its push. So to find the direction an observer sees, find the direction of the ray’s push and turn it round.
      </p>
      <p style={paragraphStyle}>
        <strong>3. The lab’s numbers.</strong> Take the star the lab sees exactly sideways, the one with the yellow ring. Its ray reaches the lab travelling straight across the line of travel, so its
        push is straight across. Say the push across is {push.labPushAcross} (a unit we choose) and the push along the line of travel is {push.labPushAlong}. The ray’s energy is also 1, because for
        light the energy always equals the size of the push. The lab turns the push round and sees the star straight sideways, at 90°.
      </p>
      <div style={paragraphStyle}>
        <strong>4. What the traveler’s motion does.</strong> Think of rain on a car. When the car is parked, rain falling straight down pushes straight down on the windscreen. Drive along the road and
        you meet the rain from in front as well: there is now a push on the windscreen toward the back of the car, because you are driving into the rain, and the rain’s straight-down push is the same
        as before. The rule is this: <em>the push along your direction of travel changes when you move, and the push across it does not.</em> The ray of starlight follows the same rule, but with a
        difference that comes from relativity. Experiment 5 showed how energy and momentum along the motion change for a moving observer, using the factor D of Experiment 3 (D = √(1 − speed²)).
        Applying it here, at {speed}c, where D = {three(D)}:
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The push across the line of travel:</strong> unchanged, {across}.
          </li>
          <li>
            <strong>The push along the line of travel:</strong> the traveler finds a push toward the back of {speed} ÷ {three(D)} = {three(push.travelerPushBackward)}. (For the lab it was{' '}
            {push.labPushAlong}.)
          </li>
          <li>
            <strong>The ray’s energy:</strong> the traveler finds 1 ÷ {three(D)} = {three(push.travelerEnergy)}. (This change in energy is a change in the light’s colour: the subject of the next
            experiment.)
          </li>
          <li>
            <strong>A check:</strong> for light, the energy should equal the size of the push. The size is √({three(push.travelerPushBackward)}² + {across}²) ={' '}
            {three(push.travelerPushSize)}, and the energy is {three(push.travelerEnergy)}. They agree.
          </li>
        </ul>
      </div>
      <p style={paragraphStyle}>
        <strong>5. Turning the push round.</strong> The traveler turns the push round to find the direction of the star. The push is {across} across and{' '}
        {three(push.travelerPushBackward)} toward the back, so the star lies {across} across and {three(push.travelerPushBackward)} toward the <em>front</em>. That is an angle
        from straight ahead of arctan({across} ÷ {three(push.travelerPushBackward)}) = {one(push.starAngle)}°. The traveler sees the star at {one(push.starAngle)}°, not 90°. The
        star has not moved. The traveler’s own motion added a push toward the back, and turned round, that puts the star toward the front. Neither measurement is the “real” direction. Both are
        correct for the observer who made them. In one line, for any star: cos θ′ = (cos θ + {speed}) ÷ (1 + {speed} × cos θ). For the sideways star, cos 90° = 0, so cos θ′ = {speed}, and the angle is{' '}
        {one(sidewaysAngle)}°. It gives the same {one(sidewaysAngle)}°.
      </p>
      <RayPushDrawing speed={speed} />
      <p style={paragraphStyle}>
        <strong>Why the rain rule is close but not right.</strong> If starlight were rain, the push toward the back would be just the traveler’s speed, {speed} (the rain rule), and the angle would be{' '}
        {one(push.rainRuleAngle)}°. For light the push toward the back is {speed} ÷ {three(D)} = {three(push.travelerPushBackward)}, bigger than {speed}, because D is smaller than 1. At low speeds D is
        almost 1, so the two agree: at 0.3c the push is {three(push03.travelerPushBackward)} against 0.3, and the angles are {one(push03.starAngle)}° and {one(push03.rainRuleAngle)}°. At 0.9c D is{' '}
        {three(runSky(0.9).timeDilationFactor)}, the push is {three(push09.travelerPushBackward)} against 0.9, and the angles are {one(push09.starAngle)}° and {one(push09.rainRuleAngle)}°. That is
        why the rain picture works for slow travelers and fails for fast ones: it leaves out D.
      </p>
      <p style={paragraphStyle}>
        <strong>6. Why two stars do not move.</strong> Straight ahead and straight behind are along the line of travel, so there is no sideways motion to tilt the light.
      </p>
      <p style={paragraphStyle}>
        <strong>7. The light clock again.</strong> In the light clock of the first chapter, a ray that went straight across for one observer was slanted for the other. Starlight arriving sideways
        for the lab is slanted for the traveler in the same way.
      </p>
      <p style={paragraphStyle}>
        <strong>8. A real example.</strong> Earth moves around the Sun at {earthSpeed} kilometres per second on average (NASA’s Earth Fact Sheet), about one ten-thousandth of the speed of light:{' '}
        {earthSpeed} ÷ 299,792 = {(earthSpeed / 299792.458).toFixed(7)}. Because of it, each star seems to trace a tiny path in the sky each year, and ESA’s Gaia pages say the effect was discovered by
        James Bradley in 1727. Worked out here, for a star at right angles to Earth’s motion, that speed ratio is an angle of about {earthShift.toFixed(1)} arcseconds (an arcsecond is 1/3600 of a
        degree, so this is about a 180th of a degree). That number is computed on this page, not a published measurement. NASA Goddard’s history page, linked above, tells how Bradley worked out the
        same kind of number.
      </p>
      <p style={paragraphStyle}>
        <strong>9. What was shown, and what was not.</strong> You saw directions only, on a flat slice of the sky, for stars very far away and at rest in the lab. You did not see brightness or color.
        The next experiment asks what happens to the color.
      </p>
    </div>
  )
}

// Wording approved by the owner on 2026-10-16 (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior": observe, compare with the
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
  const sidewaysAngle = runSky(speed).sidewaysStarTravelerAngle

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
              'Look at the two pictures, the white YOUR GUESS mark on the traveler’s sky and the tables. What do you notice about where the stars are, in the lab’s sky and in the traveler’s sky?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. That is the white mark. In this run, the lab saw that star at 90° and the traveler saw it at ${one(sidewaysAngle)}°, where the yellow ring is. Comparing the white mark with the yellow ring, what do you notice?`}
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

      {tutorStep === 'explained' && <AberrationExplanation speed={speed} predicted={predicted} />}
    </div>
  )
}
