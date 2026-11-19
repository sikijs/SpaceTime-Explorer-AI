import { useState } from 'react'
import { runIntervalExperiment } from '../physics/spacetimeInterval'

type Prediction = 'bigger' | 'same' | 'smaller'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SpacetimeIntervalTutorProps {
  clockSpeed: number
  passingSpeed: number
  predicted: Prediction
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  bigger: 'the number would be bigger for the lab than for the clock itself',
  same: 'the number would be the same for the lab and for the clock itself',
  smaller: 'the number would be smaller for the lab than for the clock itself',
}

// How the guess compares with what was found, for the tutor's marking of the guess (no score; the learner's own words stay theirs).
const predictionSummary: Record<Prediction, string> = {
  bigger: 'bigger than',
  same: 'the same as',
  smaller: 'smaller than',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function SpacetimeIntervalTutor({ clockSpeed, passingSpeed, predicted, onExplained }: SpacetimeIntervalTutorProps) {
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
  const { lab, clockFrame, passing } = runIntervalExperiment(clockSpeed, passingSpeed)
  const two = (value: number) => Math.abs(value).toFixed(2)

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
      {/* Draft wording, awaiting the owner's approval (CLAUDE.md §28.1). Follows the tutor sequence in the specification:
          observe, compare with the prediction, one conceptual question, then the explanation and the limits. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              "Look at the table and the bars. What happened to the time between the ticks as seen from the lab? What happened to the distance?"}
            {tutorStep === 'compare' &&
              `You guessed that the lab's number would be ${predictionSummary[predicted]} the clock's own. That is the white mark on the side scale. In the table, the lab's number is ${two(lab.intervalSquared)}, the clock's own frame's number is ${two(clockFrame.intervalSquared)}, and the passing observer's is ${two(passing.intervalSquared)}. What do you notice when you compare them with your guess?`}
            {tutorStep === 'conceptual' &&
              'The time and the distance can differ from one observer to the next. Why might one combination of them stay the same?'}
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

      {tutorStep === 'explained' && <SpacetimeIntervalExplanation clockSpeed={clockSpeed} passingSpeed={passingSpeed} predicted={predicted} />}
    </div>
  )
}

// The tutor's explanation (its last step). Every number comes from the experiment's own model (CLAUDE.md §9).
export function SpacetimeIntervalExplanation({ clockSpeed, passingSpeed, predicted }: { clockSpeed: number; passingSpeed: number; predicted: Prediction }) {
  const { lab, clockFrame, passing } = runIntervalExperiment(clockSpeed, passingSpeed)
  const two = (value: number) => Math.abs(value).toFixed(2)
  // Compared at the two decimals shown to the learner, so a guess is never marked on a difference the table does not show.
  const actual: Prediction = two(lab.intervalSquared) === two(clockFrame.intervalSquared) ? 'same' : lab.intervalSquared > clockFrame.intervalSquared ? 'bigger' : 'smaller'
  const guessMatches = predicted === actual
  return (
    <div>
          <p style={paragraphStyle}>
            <strong>Your guess, marked.</strong> You guessed that {predictionClauses[predicted]}. The lab&rsquo;s number was{' '}
            {two(lab.intervalSquared)} and the clock&rsquo;s own frame&rsquo;s was {two(clockFrame.intervalSquared)}, so the lab&rsquo;s number was {predictionSummary[actual]} the clock&rsquo;s own{guessMatches ? ', as you guessed' : ', which is not what you guessed'}.
          </p>
          <p style={paragraphStyle}>
            <strong>1. The time and the distance can change from observer to observer, but one combination did not.</strong> For the lab, the time between
            the ticks was {two(lab.timeBetween)} seconds and the distance was {two(lab.distanceBetween)} light-seconds. For the
            clock itself it was {two(clockFrame.timeBetween)} seconds and {two(clockFrame.distanceBetween)} light-seconds. For the
            passing observer it was {two(passing.timeBetween)} seconds and {two(passing.distanceBetween)} light-seconds. But the
            number you get by squaring the time, squaring the distance and subtracting came out as {two(lab.intervalSquared)},{' '}
            {two(clockFrame.intervalSquared)} and {two(passing.intervalSquared)}. This number is called the{' '}
            <strong>interval squared</strong>, and its square root is called the <strong>interval</strong>. Here the interval
            is {Math.sqrt(clockFrame.intervalSquared).toFixed(2)} seconds.
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: a stick on a table.</strong> Lay a stick on a table. Say it is 5 centimeters long.
            Look at it from one side and it stretches 3 centimeters east to west and 4 centimeters north to south. Check:
            3 × 3 + 4 × 4 = 9 + 16 = 25, and the square root of 25 is 5. Now look at it from a different angle. The east-west
            part might be 5 and the north-south part 0: 5 × 5 + 0 × 0 = 25, and again the square root is 5. The two parts
            change with the angle you look from, but the whole, the stick's length, does not. Time and distance behave a little
            like those two parts: they can change from observer to observer, and the interval is the whole that stays put. You can
            think of motion as trading some of one for some of the other, with the interval staying fixed in the trade.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Where the example stops working.</strong> The stick is not an exact match. For the stick, we{' '}
            <em>add</em> the squares (east × east + north × north). For the interval, we <em>subtract</em> them (time × time −
            distance × distance). That minus sign is what makes space and time together different from ordinary space. This
            experiment did not explain why there is a minus sign.
          </p>
          <p style={paragraphStyle}>
            <strong>4. For a clock, the interval is the clock's own time.</strong> In the clock's own frame, the clock does not
            move, so the distance is {two(clockFrame.distanceBetween)} and the time is {two(clockFrame.timeBetween)} seconds:{' '}
            {two(clockFrame.timeBetween)} × {two(clockFrame.timeBetween)} − {two(clockFrame.distanceBetween)} ×{' '}
            {two(clockFrame.distanceBetween)} = {two(clockFrame.intervalSquared)}. So the interval is just what the clock's face
            reads between the two ticks. Everyone agrees on that, whatever time and distance they found. This is the idea from
            the one-clock experiment of the first chapter (&ldquo;One clock&rdquo;): a clock measures elapsed time along its own history. The interval is that same idea,
            now stated for any two events.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What was shown, and what was not.</strong> You saw that the interval is the same for these three
            observers, for this one pair of events: two ticks of one clock. You did not see that it holds for any pair of
            events; later experiments come back to that. And the experiment did not work out why the subtraction, and not
            addition, is the combination that stays the same.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Space and time as one thing.</strong> In 1908 Hermann Minkowski gave a lecture in which he said that space by
            itself and time by itself would fade into shadows, and only a union of the two would stay. The interval is the first piece
            of that union you have met.
          </p>
        </div>
  )
}
