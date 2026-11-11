import { useState } from 'react'
import { blockFrameEventsFor, lorentzWorkedNumbers, markTimeGuess } from '../physics/lorentzTransform'
import type { TimeChoice } from '../physics/lorentzTransform'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'

// Relativity of Time and Motion, Experiment 11's tutor (Part 4), audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 11-draft-wording.md, section 9, approved on 2026-11-11). The prompts point to the white YOUR GUESS marker and the two rows of the panel
// by name and give no verdict; the explanation marks the guess with no score. Every number and the marking come from the physics module
// (CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

const guessWords: Record<TimeChoice, string> = {
  same: 'the two events would come out at the same time',
  different: 'the two events would come out at different times',
}

interface Experiment11TutorProps {
  result: SimultaneityResult
  guess: TimeChoice
  onExplained?: () => void
}

const f3 = (n: number) => n.toFixed(3)
const para = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function Experiment11Tutor({ result, guess, onExplained }: Experiment11TutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')
  const marking = markTimeGuess(guess, result)

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
              'Look at the row “The block’s own clocks” in the panel. Are the two markers at the same time, or at different times?'}
            {tutorStep === 'compare' &&
              `You guessed ${guessWords[guess]}. That is the white marker. The block's own clocks read ${f3(marking.blockBackTime)} s for the back event and ${f3(marking.blockFrontTime)} s for the front event, while the lab's clocks read ${f3(marking.labBackTime)} s and ${f3(marking.labFrontTime)} s. What do you notice when you compare your marker with the two rows?`}
            {tutorStep === 'conceptual' &&
              "Why do you think the calculation gives the same time for both events in the block's frame, even though the lab clock said they happened at different times?"}
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

      {tutorStep === 'explained' && <Experiment11Explanation result={result} guess={guess} />}
    </div>
  )
}

// The tutor's explanation (after the learner has answered the three prompts). Exported so a test can render it directly.
export function Experiment11Explanation({ result, guess }: { result: SimultaneityResult; guess: TimeChoice }) {
  const events = blockFrameEventsFor(result)
  const v = result.velocity
  const back = lorentzWorkedNumbers(events.lab.back, v)
  const front = lorentzWorkedNumbers(events.lab.front, v)
  const marking = markTimeGuess(guess, result)
  const at = (speed: number) => blockFrameEventsFor(runSimultaneityExperiment(speed))
  const rest = at(0)
  const slow = at(0.1)
  const fast = at(0.8)
  const fastest = at(0.9)
  return (
    <div>
      <p style={para}>Let's go through it one step at a time.</p>
      <p style={para}>
        <strong>1. This confirms what you already knew, from a new direction.</strong> You already knew this from “At the same time...
        for whom?” and “Same time, different line”. What is new is that a calculation gives it too. Both events come out at{' '}
        {f3(events.block.back.time)} seconds in the block's frame — the same fact “At the same time... for whom?” gave you in numbers
        and “Same time, different line” gave you as a picture. This calculation isn't a new physical fact. It's a third, independent
        way of arriving at the same one, by actually doing the math instead of reasoning about it or drawing it.
      </p>
      <p style={para}>
        <strong>Working the numbers.</strong> The rule is: <code>time' = (1 ÷ time dilation factor) × (time − v × position)</code>. At{' '}
        {v}c, the time dilation factor is {f3(back.factor)}, so <code>1 ÷</code> that is {f3(back.inverseFactor)}. For the back event —
        lab time {f3(events.lab.back.time)} s, lab position {f3(events.lab.back.position)} light-seconds:{' '}
        <code>
          {f3(back.inverseFactor)} × ({f3(events.lab.back.time)} − {v} × {f3(events.lab.back.position)}) = {f3(back.blockTime)}
        </code>{' '}
        s. For the front event — lab time {f3(events.lab.front.time)} s, lab position {f3(events.lab.front.position)} light-seconds:{' '}
        <code>
          {f3(front.inverseFactor)} × ({f3(events.lab.front.time)} − {v} × {f3(events.lab.front.position)}) = {f3(front.blockTime)}
        </code>{' '}
        s. Same number, from two different starting points — exactly the confirmation “At the same time... for whom?” already promised.
      </p>
      <p style={para}>
        <strong>2. The two new tilted lines are the block's own "straight up" and "straight across."</strong> The lab's vertical line
        is its own time direction, and the lab's horizontal line is its own "now." The block has exactly the same kind of pair of lines
        — just tilted, because it's moving. They're not a trick of the diagram; they're the block's own natural axes, drawn on the same
        page as the lab's.
      </p>
      <p style={para}>
        <strong>3. Nothing physical changed.</strong> It's the same block, the same flash, the same two events. All that happened is
        that we described those events using the block's own ruler-and-clock convention instead of the lab's — the way converting
        kilometers to miles doesn't change a distance, only how it's written down.
      </p>
      <p style={para}>
        <strong>4. This ties the whole sequence together.</strong> “At the same time... for whom?” gave you two numbers. “Drawing
        Spacetime” turned the situation into a picture. “Same time, different line” added one more line to it. This calculation is the
        actual mathematical bridge that connects the lab's numbers to the block's own — the Lorentz transformation.
      </p>
      <p style={para}>
        <strong>5. Your guess, marked.</strong> You guessed that {guessWords[marking.chosen]}. The block's own clocks read{' '}
        {f3(marking.blockBackTime)} s and {f3(marking.blockFrontTime)} s.
      </p>
      <p style={{ ...para, marginBottom: 0 }}>
        <strong>6. Try it in Part 2.</strong> Try 0c: the orange axes lie on the lab's, and the block's times are the lab's,{' '}
        {f3(rest.block.back.time)} s each. Then 0.1c (the lab's times {f3(slow.lab.back.time)} s and {f3(slow.lab.front.time)} s), 0.8c
        ({f3(fast.lab.back.time)} s and {f3(fast.lab.front.time)} s) and 0.9c ({f3(fastest.lab.back.time)} s and{' '}
        {f3(fastest.lab.front.time)} s): the lab's times move apart, and the block's times stay at {f3(fast.block.back.time)} s.
      </p>
    </div>
  )
}
