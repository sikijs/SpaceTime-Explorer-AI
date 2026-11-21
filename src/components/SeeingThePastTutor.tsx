import { useState } from 'react'
import { imageComparedWithShip, measuredPositionAt, runSeeingExperiment } from '../physics/seeingThePast'
import type { Direction } from '../physics/seeingThePast'

type Prediction = 'slower' | 'same' | 'faster'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SeeingThePastTutorProps {
  direction: Direction
  speed: number
  predicted: Prediction
  onExplained?: () => void
}

// How each answer reads when the tutor names the real result.
const answerPhrases: Record<Prediction, string> = {
  slower: "slower than the spaceship's real speed",
  same: "the same as the spaceship's real speed",
  faster: "faster than the spaceship's real speed",
}

const predictionClauses: Record<Prediction, string> = {
  slower: "its image would move slower than the spaceship's real speed",
  same: "its image would move at the same speed as the spaceship's real speed",
  faster: "its image would move faster than the spaceship's real speed",
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function SeeingThePastTutor({ direction, speed, predicted, onExplained }: SeeingThePastTutorProps) {
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
  const two = (value: number) => value.toFixed(2)
  const run = runSeeingExperiment(direction, speed)
  const last = run.samples[run.samples.length - 1]
  const startPosition = two(measuredPositionAt(direction, speed, 0))
  const endPosition = two(measuredPositionAt(direction, speed, run.measuredDuration))
  const approaching = direction === 'approaching'
  const directionWords = approaching ? 'toward the lab' : 'away from the lab'
  const imageAboveLight = run.imageSpeed > 1
  // The tutor marks the guess here, and nowhere earlier (CLAUDE.md §12, §13). The answer is the module's, not typed in.
  const answer = imageComparedWithShip(direction, speed)
  const guessWasRight = predicted === answer

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
      {/* Wording approved by the owner on 2026-10-14 and, for the audit update, on 2026-11-21 (CLAUDE.md §28.1). Follows the tutor sequence in the specification:
          observe, compare with the prediction, one conceptual question, then the explanation and the limits. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Picture 1, Picture 2 and Panel B, and find the white YOUR GUESS ring. Then try other directions and speeds in Part 2. What do you notice about the hollow square compared with the solid square, and about the two lines in Picture 2?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run the spaceship really moved at ${two(run.measuredSpeed)}c and its image seemed to move at ${two(run.imageSpeed)}c. Find your white ring in Panel B and the hollow diamond. What do you notice?`}
            {tutorStep === 'conceptual' &&
              (approaching
                ? 'At the moment the lab looks, the telescope shows light that left the spaceship earlier. For a spaceship coming toward the lab, is the trip for the later light longer or shorter than the trip for the earlier light? What would that do to the gaps between the times when the pictures arrive?'
                : 'At the moment the lab looks, the telescope shows light that left the spaceship earlier. For a spaceship going away from the lab, is the trip for the later light longer or shorter than the trip for the earlier light? What would that do to the gaps between the times when the pictures arrive?')}
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
            <strong>Your guess.</strong> You guessed that {predictionClauses[predicted]}.{' '}
            {guessWasRight
              ? `Your guess was right. The image's speed was ${two(run.imageSpeed)}c, against the spaceship's ${two(run.measuredSpeed)}c.`
              : `Your guess was not right this time. The image was ${answerPhrases[answer]}: ${two(run.imageSpeed)}c against the spaceship's ${two(run.measuredSpeed)}c.`}
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the drawings show, in your own numbers.</strong> The spaceship flew {directionWords} at{' '}
            {two(run.measuredSpeed)}c. It covered {two(run.distanceCovered)} light-seconds, from {startPosition}{' '}
            light-seconds away to {endPosition} light-seconds away, and that took {two(run.measuredDuration)} seconds on
            the lab's clock. Now the images. Light sent at the start, from {startPosition} light-seconds away, takes{' '}
            {startPosition} seconds to arrive, so the first image arrived at time {two(run.firstLooking)}. Light sent at
            the end, from {endPosition} light-seconds away, takes {endPosition} seconds, so the last image arrived at
            time {two(run.measuredDuration)} + {endPosition} = {two(run.lastLooking)}. The two images were{' '}
            {two(run.imageDuration)} seconds apart, so the image covered the same {two(run.distanceCovered)} light-seconds
            in {two(run.imageDuration)} seconds. That is {two(run.distanceCovered)} ÷ {two(run.imageDuration)} ={' '}
            {two(run.imageSpeed)}c, compared with the spaceship's real {two(run.measuredSpeed)}c.
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: postcards.</strong> A friend travels toward you and mails you one postcard at
            the end of each day. Each card is mailed from a place a little closer to you than the one before, so its trip
            is a little shorter, and the cards arrive less than a day apart. If the friend travels away from you, each card
            is mailed from farther away, its trip is longer, and the cards arrive more than a day apart. The spaceship's
            light works like the postcards. For your spaceship, which flew {directionWords}, each later image had a{' '}
            {approaching ? 'shorter' : 'longer'} trip than the one before, so the images arrived{' '}
            {approaching ? 'closer together' : 'farther apart'} than the moments when the light was sent.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The cone, pointing back in time.</strong> The light that reaches the telescope at one moment lies
            on the past light cone of that moment, the same cone as in Experiment 2 but turned to point back in time. The
            place where the cone crosses the spaceship's path is where the spaceship looks to be. It is always lower on
            the map, which means earlier, than where the spaceship really is at the moment of looking. In your run, at the
            last moment of looking, time {two(last.lookingTime)}, the spaceship really was {two(last.measuredPosition)}{' '}
            light-seconds away, but it looked to be {two(last.seenPosition)} light-seconds away, which is where it was at
            time {two(last.emissionTime)}. As the looking time goes up, the place where the cone crosses the path moves
            along the path at a different rate from the spaceship itself.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why this is not a contradiction.</strong> The spaceship's real speed, measured with the lab's ruler
            and clocks, was below the speed of light in every run. The image's speed is how fast the place where the
            spaceship <em>looks</em> to be changes. {imageAboveLight
              ? `In your run, that was ${two(run.imageSpeed)}c, which is more than the speed of light. `
              : `In your run it was ${two(run.imageSpeed)}c, which is less than the speed of light. `}
            Nothing breaks, because nothing travels along the image. Each picture is made by light that left the
            spaceship at a different time, and every piece of that light travels at the speed of light. No object and no
            signal moves from one place where the spaceship looks to be to the next. Astronomers describe the apparent faster-than-light motion of real jets in space as an illusion in the same way
            (see the links at the end of Part 3). Part 2's other runs show it too: a spaceship coming toward the lab faster than 0.5c gives an image faster than light, and one going away never does.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What this effect is not.</strong> It comes only from the time light takes to travel. It would be
            there even in a world with no relativity. It is in this group because the difference between what is measured
            and what is seen is needed later, and because it uses the light cone you already know, pointing back in time.
            Effects that really are relativistic are a different matter.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What was shown, and what was not.</strong> You saw one spaceship coming toward the lab at 0.6c in Part 1, and in Part 2 whatever settings you chose, flying toward or away from
            the lab at four possible speeds, one direction at a time, along one line. You saw only where the spaceship looks to
            be. You did not see its brightness or its color, and you did not see a spaceship moving across the line of
            sight, where the picture is different.
          </p>
        </div>
      )}
    </div>
  )
}
