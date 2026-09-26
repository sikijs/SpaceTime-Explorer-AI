import { useState } from 'react'
import type { TwinParadoxResult } from '../physics/twinParadoxExperiment'
import { actualOutcome } from './Experiment10'
import type { OutcomeChoice } from './Experiment10'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

const outcomeLabels: Record<OutcomeChoice, string> = {
  sameAge: 'the same age',
  earthOlder: 'the Earth twin is older',
  travelerOlder: 'the traveling twin is older',
}

interface Experiment10TutorProps {
  result: TwinParadoxResult
  predictionOutcome: OutcomeChoice
  onExplained?: () => void
}

export function Experiment10Tutor({ result, predictionOutcome, onExplained }: Experiment10TutorProps) {
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
  const actual = actualOutcome()

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
              'Look at the two ages. Is the traveling twin younger, older, or the same age as the Earth twin?'}
            {tutorStep === 'compare' &&
              `You predicted ${outcomeLabels[predictionOutcome]}. It is actually ${outcomeLabels[actual]}. Comparing what you expected to the real result, what do you notice?`}
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

      {tutorStep === 'explained' && (
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
            <strong>3. That difference is what resolves the paradox.</strong> The argument "each
            twin can say the other one is moving, so each should think the other's clock runs
            slow" only works while both twins keep moving at a constant velocity the whole time.
            The traveling twin doesn't — they turn around. Once that happens, the two twins are no
            longer in symmetric situations, so there's no real contradiction in them agreeing,
            afterward, on who aged less.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Nothing new happened, physics-wise.</strong> These numbers are exactly
            Experiment 3's time dilation — the same clock ticking slower while it moves — just
            added up over the traveling twin's whole round trip instead of a single tick.
          </p>
        </div>
      )}
    </div>
  )
}
