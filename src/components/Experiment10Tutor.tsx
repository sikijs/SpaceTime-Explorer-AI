import { useState } from 'react'
import { markTwinGuess, runTwinParadoxExperiment, twinWorkedNumbers } from '../physics/twinParadoxExperiment'
import type { TwinOutcome, TwinParadoxResult } from '../physics/twinParadoxExperiment'

// Relativity of Time and Motion, Experiment 10's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/10-draft-wording.md, section 9, approved on 2026-11-11). The prompts point to the
// white YOUR GUESS marker and the two bars by name and give no verdict; the explanation marks the guess with no score. Every
// number and the marking come from the physics module (CLAUDE.md §9). The wording is the owner's to approve line by line
// (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

const guessWords: Record<TwinOutcome, string> = {
  sameAge: 'the twins would be the same age',
  earthOlder: 'the Earth twin would be older',
  travelerOlder: 'the traveling twin would be older',
}

interface Experiment10TutorProps {
  result: TwinParadoxResult
  guess: TwinOutcome
  onExplained?: () => void
}

export function Experiment10Tutor({ result, guess, onExplained }: Experiment10TutorProps) {
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
              'Look at the two bars. Which clock counted less: the Earth twin\'s or the traveling twin\'s? Or did they count the same?'}
            {tutorStep === 'compare' &&
              `You guessed that ${guessWords[guess]}. That is the white marker. The bars end at ${result.labElapsedTime.toFixed(3)} s and ${result.travelerElapsedTime.toFixed(3)} s, with a gap of ${result.ageDifference.toFixed(3)} s. What do you notice when you compare your marker with the bars?`}
            {tutorStep === 'conceptual' &&
              "Both twins could argue the other one's clock should run slow, since motion is relative. But only one of them turns around. Why do you think that difference matters?"}
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

      {tutorStep === 'explained' && <Experiment10Explanation result={result} guess={guess} />}
    </div>
  )
}

// The tutor's explanation (after the learner has answered the three prompts). Exported so a test can render it directly.
export function Experiment10Explanation({ result, guess }: { result: TwinParadoxResult; guess: TwinOutcome }) {
  const marking = markTwinGuess(guess, result)
  const w = twinWorkedNumbers(result.distance, result.velocity)
  const slow = runTwinParadoxExperiment(result.distance, 0.1)
  const fast = runTwinParadoxExperiment(result.distance, 0.8)
  return (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            Let's go through it one step at a time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. The traveling twin really is younger.</strong> Not just from one twin's
            point of view — genuinely, when they're back together comparing the same two clocks.
            At {result.velocity}c over a {result.distance}-light-second trip each way, the Earth
            twin's clock reads {result.labElapsedTime.toFixed(3)} seconds while the traveling
            twin's reads {result.travelerElapsedTime.toFixed(3)} seconds — a real difference of{' '}
            {result.ageDifference.toFixed(3)} seconds.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The two twins are not in the same kind of situation.</strong> The Earth
            twin never changes direction — they stay at the same constant speed (zero) the whole
            time. The traveling twin does change direction, turning around partway through. That's
            a real difference between them, not just a difference in who you happen to be
            watching from.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A familiar version of this.</strong> Picture two friends starting at the same
            corner. One just stands there the whole time. The other walks to the store down the
            street and walks back. Both of them could say "I was moving at some point" — but only
            one of them can honestly say "I never changed which way I was facing." The friend who
            went to the store and back isn't in the same kind of situation as the one who stayed
            put, even setting aside who was "really" moving at any given moment. Turning around is
            something that happened to one friend and not the other — a fact both of them would
            agree on, no matter who you ask. The traveling twin is in exactly that position:
            turning around is something that happened to them, not to the Earth twin, and everyone
            agrees on that.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. A clock counts its own path.</strong> Think of two drivers going from city A to city B. One takes the
            straight road, 6 km. The other takes a detour through city C, 10 km. Their odometers end up different, and nobody asks
            "how did the turn at C change the odometer?" The turn matters only because it made the two routes different. An odometer
            simply counts the length of the route its car took. A clock does something like it: it counts the time along the path it
            took, through space and through time. Two clocks that start together and meet again on different paths can read
            different totals. (One twist: for clocks, the detour gives the <em>smaller</em> reading, not the larger one.)
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Why the Earth twin's view is the simple one.</strong> The Earth twin never turns, so their point of view
            stays steady for the whole trip. In a steady point of view you can use the rule from “The moving clock” directly: a
            moving clock ticks √(1 − v²) as fast as the Earth twin's clock. At {result.velocity}c, the trip out takes{' '}
            {result.distance} ÷ {result.velocity} = {parseFloat(w.oneWayLabTime.toFixed(3))} s and the trip back takes{' '}
            {parseFloat(w.oneWayLabTime.toFixed(3))} s, so the Earth twin's clock reads {result.labElapsedTime.toFixed(3)} s. The
            traveling twin's clock ticks {result.timeDilationFactor.toFixed(3)} as fast the whole time, so it reads{' '}
            {result.labElapsedTime.toFixed(3)} × {result.timeDilationFactor.toFixed(3)} = {result.travelerElapsedTime.toFixed(3)} s.
            Look at the arithmetic: <strong>there is no acceleration in it.</strong> The turnaround could be instant or slow, and
            the answer would be the same, as long as the speed is the same. That is why this page treats it as instant. So the push
            does not change the traveling twin's clock; it is a sign that the traveling twin took a different path.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Why the traveling twin can't just say "I'm the one standing still."</strong> While cruising, they can, and
            from their point of view the Earth twin's clock runs slow. That argument is fine for one leg. But to get home they must
            turn around, and that changes their point of view. As in “At the same time... for whom?”, what counts as "the same
            moment" depends on who is moving. A traveler heading out and a traveler heading back do not agree on what is happening
            on Earth "right now". The push you feel at the turnaround is the sign that this switch happened. The "the Earth twin's
            clock runs slow too" argument only works if you stay in one steady point of view for the whole trip, and the traveling
            twin cannot.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. That is what resolves the paradox.</strong> The twins are not in symmetric situations: the Earth twin keeps
            one steady point of view the whole time, and the traveling twin does not. So there is no real contradiction in them
            agreeing, when they meet, that the traveling twin's clock counted less.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Nothing new happened, physics-wise.</strong> These numbers are exactly
            the time dilation of “The moving clock” — the same clock ticking slower while it moves — just
            added up over the traveling twin's whole round trip instead of a single tick.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>8. Your guess, marked.</strong> You guessed that {guessWords[marking.guessed]}. The traveling twin's clock read{' '}
            {result.travelerElapsedTime.toFixed(3)} s against the Earth twin's {result.labElapsedTime.toFixed(3)} s.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>9. Try it in Part 2.</strong> Try 0.1c (gap {slow.ageDifference.toFixed(3)} s) and 0.8c (gap{' '}
            {fast.ageDifference.toFixed(3)} s). The traveling twin's clock is the shorter one both times; only the size of the gap
            changes.
          </p>
        </div>
  )
}
