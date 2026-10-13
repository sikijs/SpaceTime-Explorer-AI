import { useState } from 'react'
import { runLightConeExperiment } from '../physics/lightCones'
import type { EventRelation } from '../physics/lightCones'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'

type Prediction = 'slower' | 'light-only' | 'no'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LightConesTutorProps {
  event: WorldlinePoint
  passingSpeed: number
  predicted: Prediction
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  slower: 'something slower than light could get from O to B',
  'light-only': 'only light itself could get from O to B',
  no: 'nothing could get from O to B, not even light',
}

const relationWords: Record<EventRelation, string> = {
  reachable: 'reachable',
  'light-only': 'light only',
  unreachable: 'unreachable',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function LightConesTutor({ event, passingSpeed, predicted, onExplained }: LightConesTutorProps) {
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

  // Every number below comes from the experiment's own model, never typed in by hand.
  const { lab, passing, lightFrontPositionAtEventTime } = runLightConeExperiment(event, passingSpeed)
  const two = (value: number) => Math.abs(value).toFixed(2)
  const signed = (value: number) => value.toFixed(2).replace('-', '−')
  const relation = lab.relation
  // How far the flash was past (positive) or short of (negative) B's place at the moment B happened, in the lab.
  const flashMargin = Math.abs(lightFrontPositionAtEventTime) - Math.abs(lab.distanceBetween)

  const flashSentence =
    relation === 'reachable'
      ? `By the time B happened, the flash had already gone ${two(flashMargin)} light-seconds past B's place.`
      : relation === 'light-only'
        ? "At the moment B happened, the front of the flash was exactly at B's place."
        : `At the moment B happened, the front of the flash was still ${two(flashMargin)} light-seconds short of B's place.`

  const meaning =
    relation === 'reachable'
      ? 'There is more time than distance, so something slower than light could make the trip.'
      : relation === 'light-only'
        ? 'The time and the distance are equal, so only light, going at its full speed, could make the trip.'
        : 'There is less time than distance, so even light could not make the trip.'

  const caseName =
    relation === 'reachable' ? 'timelike' : relation === 'light-only' ? 'lightlike' : 'spacelike'

  const speedSide =
    relation === 'reachable'
      ? 'below 1, so below the speed of light'
      : relation === 'light-only'
        ? 'exactly 1, the speed of light'
        : 'above 1, so above the speed of light'

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
      {/* Wording approved by the owner on 2026-10-13 (CLAUDE.md §28.1). Follows the tutor sequence in the specification:
          observe, compare with the prediction, one conceptual question, then the explanation and the limits. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              "Look at the drawing of the flash. In the lab, did the flash from O get to B's place before B happened, exactly when B happened, or after?"}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In the table, the lab's number is ${signed(lab.intervalSquared)} and the passing observer's number is ${signed(passing.intervalSquared)}. The "Which case" column says "${relationWords[lab.relation]}" for the lab and "${relationWords[passing.relation]}" for the passing observer. Comparing that to what you predicted, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The passing observer measured a different time and a different distance. Why might they still agree on whether the flash could have reached B?'}
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
            <strong>1. What happened in the lab.</strong> B happened {two(lab.timeBetween)} seconds after O and{' '}
            {two(lab.distanceBetween)} light-seconds away. Light covers 1 light-second in 1 second, so in {two(lab.timeBetween)}{' '}
            seconds the flash from O spread {two(lab.timeBetween)} light-seconds. {flashSentence} {meaning}
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: a shout across a field.</strong> Sound travels about 340 meters every second.
            Shout at time 0, and look at what is happening 2 seconds later, when the sound has covered 2 × 340 = 680 meters.
            A friend standing 340 meters away has already heard you: the sound went past long ago, so your shout could have
            affected what they did. A friend standing exactly 680 meters away is hearing you at that very moment. A friend
            standing 1,000 meters away has heard nothing yet, so whatever they do at that moment, your shout cannot be the
            cause. These are the same three cases you met with light: "already arrived", "arriving right now" and "not yet".
          </p>
          <p style={paragraphStyle}>
            <strong>3. The same test with numbers.</strong> In the lab, the time was {two(lab.timeBetween)} seconds and the
            distance was {two(lab.distanceBetween)} light-seconds. Multiply each by itself: {two(lab.timeBetween)} ×{' '}
            {two(lab.timeBetween)} = {two(lab.timeBetween ** 2)} and {two(lab.distanceBetween)} × {two(lab.distanceBetween)} ={' '}
            {two(lab.distanceBetween ** 2)}. Subtract: {two(lab.timeBetween ** 2)} − {two(lab.distanceBetween ** 2)} ={' '}
            {signed(lab.intervalSquared)}. This is the number from the last experiment, time² − distance². Comparing the time
            with the distance, and checking whether this number is positive, zero or negative, are the same test. A positive
            number means more time than distance, so something slower than light could make the trip. Zero means the time
            and the distance are equal, so only light could. A negative number means less time than distance, so nothing
            could. Physicists call these three cases <strong>timelike</strong>, <strong>lightlike</strong> and{' '}
            <strong>spacelike</strong>. Your event was {caseName}.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why everyone agrees.</strong> The passing observer found {two(passing.timeBetween)} seconds and{' '}
            {two(passing.distanceBetween)} light-seconds. Those are not the lab's numbers, but their time² − distance² is{' '}
            {signed(passing.intervalSquared)}, the same as the lab's {signed(lab.intervalSquared)}. This is what the last
            experiment showed: the interval squared is the same for every observer. So its sign is the same for every observer too. A
            number that is positive for one observer is positive for all of them, and cannot turn negative for someone who is
            moving. That means all observers agree on which of the three cases an event is. Another way to see it is to
            look at the speed needed to get from O to B. The lab found {two(lab.speedNeeded)} of the speed of light, and
            the passing observer found {two(passing.speedNeeded)}.{' '}
            {two(lab.speedNeeded) === two(passing.speedNeeded)
              ? `The two numbers are the same here, and both are ${speedSide}. For the other events they would differ, but they would stay on the same side of 1.`
              : `The two numbers differ, but both are ${speedSide}.`} This is
            why the light cone is a real feature of spacetime and not a matter of opinion: every observer draws the same
            cone.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Where the shout example stops working.</strong> A fast jet can overtake the sound of your shout, and
            observers moving through the air do not all agree on how fast the sound goes. Light is different. Its speed is the
            same for every observer (Experiment 5, "Why can't light go faster?"), and nothing can overtake it. That is why the
            cone, whose edges are the paths of light, is the same for everyone.
          </p>
          <p style={paragraphStyle}>
            <strong>6. A negative interval squared.</strong> In the last experiment, the square root of the interval
            squared, the interval, was the time a clock reads between two of its ticks. That idea works when the number is
            positive. When the number is negative, as for an unreachable event, no clock could travel from one event to the
            other, because it would have to go faster than light. So in that case the number is not a clock's time squared, and
            this experiment does not give it another meaning.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What was shown, and what was not.</strong> You saw five possible events, one passing observer at a
            time, and one dimension of space. You saw that all observers agree on the case. You did not see what the cone
            means for the order of events, or for cause and effect: a later experiment returns to that. And you did not see the
            cone in three dimensions, where it is a growing ball of light.
          </p>
        </div>
      )}
    </div>
  )
}
