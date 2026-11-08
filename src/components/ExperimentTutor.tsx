import { useState } from 'react'
import { guessPositionOnStrip, runClockExperiment } from '../physics/clockExperiment'
import { formatClockReading } from './clockFormat'

// Relativity of Time and Motion, Experiment 1's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/01-draft-wording.md, section 9). The prompts point to the white YOUR GUESS mark by
// name and give no verdict; the explanation marks the guess with no score, taking every number from the physics module
// (CLAUDE.md §9).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ExperimentTutorProps {
  onExplained?: () => void
  predictionSeconds: number
  durationSeconds: number
}

const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function ExperimentTutor({
  predictionSeconds,
  durationSeconds,
  onExplained,
}: ExperimentTutorProps) {
  const actualSeconds = runClockExperiment(durationSeconds).elapsedTime
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
            {tutorStep === 'observe' && 'What did you notice while the clock was running, and when it stopped? Look at the clock and at the strip.'}
            {tutorStep === 'compare' &&
              `You guessed ${predictionSeconds} seconds, and the clock really showed ${actualSeconds} seconds. Your guess is the white mark on the strip, and the clock's end reading is Event B. What do you notice when you compare them? What if they had been different?`}
            {tutorStep === 'conceptual' &&
              "What does the clock's final reading tell us about the time that passed between the start and the end of the experiment?"}
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
        <ExperimentExplanation predictionSeconds={predictionSeconds} durationSeconds={durationSeconds} />
      )}
    </div>
  )
}

export function ExperimentExplanation({ predictionSeconds, durationSeconds }: { predictionSeconds: number; durationSeconds: number }) {
  const actualSeconds = runClockExperiment(durationSeconds).elapsedTime
  const difference = guessPositionOnStrip(durationSeconds, predictionSeconds).differenceFromReal
  const run = runClockExperiment(durationSeconds)
  const shortRun = runClockExperiment(5)
  const longRun = runClockExperiment(20)
  // Point 2's imagined clock (a clock that started at 30 seconds), labelled "as an example only"; its numbers come from the module.
  const example = { start: 30, end: 30 + run.elapsedTime, elapsed: runClockExperiment(run.elapsedTime).elapsedTime }
  return (
    <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            A clock is a way to measure how much time passes between two events.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            When the experiment started, the clock showed one reading. When it ended, it showed
            another. The difference between the two readings is how much time passed, according to
            that clock.
          </p>
          <p style={pointStyle}>
            <strong>Your guess, marked.</strong>{' '}
            {difference === 0
              ? `Your guess of ${predictionSeconds} seconds is the same as the clock's ${actualSeconds} seconds. The clock counted exactly that many ticks between the start and the end.`
              : `Your guess of ${predictionSeconds} seconds was ${Math.abs(difference)} seconds ${difference > 0 ? 'more' : 'less'} than the ${actualSeconds} seconds the clock showed. The clock counted ${actualSeconds} ticks between the start and the end, so its end reading is ${actualSeconds} seconds after its start reading.`}
          </p>
          <p style={pointStyle}>
            <strong>1. Why your guess did not change the clock.</strong> Whatever you guessed, the clock counted the same{' '}
            {actualSeconds} ticks. Your guess was about the clock; it was never part of it. Think of a kitchen timer: if you
            guess the cake needs 20 minutes and it really needs 25, the timer still counts the same 25 minutes. A different
            guess would only have meant a different gap between your guess and the clock&rsquo;s reading, never a different reading.
          </p>
          <p style={pointStyle}>
            <strong>2. Elapsed time is a difference.</strong> Elapsed time is not the end reading on its own. It is the end
            reading minus the start reading. In this run the start reading was {formatClockReading(run.initialClockReading)}, so
            the two happened to be the same: {formatClockReading(run.finalClockReading)} −{' '}
            {formatClockReading(run.initialClockReading)} = {run.elapsedTime} seconds. Now imagine, as an example only, a clock
            that started at {formatClockReading(example.start)} and ended at {formatClockReading(example.end)}. Its end reading
            is not {example.elapsed}, but the time that passed is still {formatClockReading(example.end)} −{' '}
            {formatClockReading(example.start)} = {example.elapsed} seconds. The same number of ticks went by.
          </p>
          <p style={pointStyle}>
            <strong>3. A reading belongs to an event.</strong> The {formatClockReading(run.finalClockReading)} is the clock&rsquo;s
            reading at Event B. It is not &ldquo;the time&rdquo; in general. Think of a bus ticket stamped 14:05 when you board:
            by itself it only says what the machine&rsquo;s clock read at that moment. It tells you nothing about how long the
            trip took until you have a second stamp at the end. A reading is attached to an event, and it takes two events to say
            how much time passed.
          </p>
          <p style={pointStyle}>
            <strong>4. According to this clock.</strong> That is why the explanation says &ldquo;according to that clock&rdquo;.
            Elapsed time is always a measurement made by some particular clock. In this experiment there is only one clock, so
            &ldquo;{run.elapsedTime} seconds&rdquo; simply means {run.elapsedTime} seconds on this clock, and nothing else exists
            that could disagree with it. The next chapter, &ldquo;Two clocks at rest&rdquo;, puts a second clock beside it.
          </p>
          <p style={{ ...pointStyle, marginBottom: 0 }}>
            <strong>5. Try Part 2.</strong> In Part 2 you can run other lengths and see the same thing. A{' '}
            {shortRun.experimentDuration}-second run ends at {formatClockReading(shortRun.finalClockReading)} and a{' '}
            {longRun.experimentDuration}-second run ends at {formatClockReading(longRun.finalClockReading)}. If you have run some,
            &ldquo;Runs so far&rdquo; lists them. The end reading is always the start reading plus the ticks the clock counted.
          </p>
        </div>
  )
}
