import { useState } from 'react'
import { guessPositionsOnStrip, runTwoClockExperiment } from '../physics/twoClockExperiment'
import { formatClockReading } from './clockFormat'

// Relativity of Time and Motion, Experiment 2's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/02-draft-wording.md, section 9). The prompts point to the two white YOUR GUESS marks
// by name and give no verdict; the explanation marks each guess with no score, taking every number from the physics module
// (CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment2TutorProps {
  onExplained?: () => void
  predictionA: number
  predictionB: number
  durationSeconds: number
}

const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function Experiment2Tutor({
  predictionA,
  predictionB,
  durationSeconds,
  onExplained,
}: Experiment2TutorProps) {
  const run = runTwoClockExperiment(durationSeconds)
  const actualA = run.elapsedTimeA
  const actualB = run.elapsedTimeB
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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the two clocks and at both rows of the strip. What did you notice? Did both clocks measure the same elapsed time?'}
            {tutorStep === 'compare' &&
              `You guessed that Clock A would read ${predictionA}s and Clock B would read ${predictionB}s. Those are the two white marks on the strip. The clocks really read ${actualA}s and ${actualB}s. What do you notice when you compare them?`}
            {tutorStep === 'conceptual' &&
              'Why do you think two separate clocks that both stand still measure the same elapsed time?'}
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
        <Experiment2Explanation predictionA={predictionA} predictionB={predictionB} durationSeconds={durationSeconds} />
      )}
    </div>
  )
}

function marking(name: string, guess: number, difference: number, actual: number): string {
  return difference === 0
    ? `Your guess for ${name}, ${guess} seconds, is the same as the ${actual} seconds it showed.`
    : `Your guess for ${name}, ${guess} seconds, was ${Math.abs(difference)} seconds ${difference > 0 ? 'more' : 'less'} than the ${actual} seconds ${name} showed.`
}

export function Experiment2Explanation({ predictionA, predictionB, durationSeconds }: { predictionA: number; predictionB: number; durationSeconds: number }) {
  const run = runTwoClockExperiment(durationSeconds)
  const { clockA: a, clockB: b } = guessPositionsOnStrip(durationSeconds, predictionA, predictionB)
  return (
    <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            When two clocks stand still relative to each other, they are in the same reference
            frame. Everyone in the same reference frame measures time in the same way.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            Both clocks started with the same reading and stayed still. So they stayed in agreement
            all the way through, and they measured the same elapsed time. This is a basic property
            of a reference frame: everyone standing still in that frame agrees about time.
          </p>
                  <p style={pointStyle}>
            <strong>Your guesses, marked.</strong> {marking('Clock A', predictionA, a.differenceFromReal, run.elapsedTimeA)}{' '}
            {marking('Clock B', predictionB, b.differenceFromReal, run.elapsedTimeB)}
          </p>
          <p style={pointStyle}>
            <strong>1. Why your guesses did not change the clocks.</strong> Whatever you guessed, each clock counted its own{' '}
            {run.elapsedTimeA} ticks. Think of two kitchen timers set side by side: guessing that one of them will ring early does
            not make it ring early. A different guess only changes the gap between your guess and the reading.
          </p>
          <p style={pointStyle}>
            <strong>2. What &ldquo;agree&rdquo; means.</strong> Two clocks agree when they show the same reading at the same moment.
            The dashed lines on the strip mark those moments. At Event A both read {formatClockReading(run.startEvent.clockReadingA)},
            and at Event B both read {formatClockReading(run.endEvent.clockReadingA)}, so each counted {run.elapsedTimeA} ticks and
            the difference between their elapsed times is {run.difference} seconds.
          </p>
          <p style={pointStyle}>
            <strong>3. Real clocks have to be kept in agreement.</strong> On this page the two clocks agree because we set them to.
            Real clocks do not agree on their own: about 450 atomic clocks in about 90 laboratories are compared all the time and
            corrected every month, and even then NIST&rsquo;s and the US Naval Observatory&rsquo;s time scales, which are kept apart
            in different places, rarely drift more than a few nanoseconds apart. A nanosecond is one billionth of a second.
          </p>
          <p style={{ ...pointStyle, marginBottom: 0 }}>
            <strong>4. What comes next.</strong> Both clocks here stand still in one reference frame. In the next chapter, &ldquo;A
            moving clock&rdquo;, one of them moves, and you will compare it with a clock at rest.
          </p>
        </div>
  )
}
