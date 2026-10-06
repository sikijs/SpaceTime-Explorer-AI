import { useState } from 'react'

type TimeComparisonChoice = 'longer' | 'shorter' | 'same'
type AgeComparisonChoice = 'muchLonger' | 'muchShorter' | 'close'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BigBangTutorProps {
  predictedTimeComparison: TimeComparisonChoice
  predictedAgeComparison: AgeComparisonChoice
  onExplained?: () => void
}

const timeComparisonLabels: Record<TimeComparisonChoice, string> = {
  longer: 'longer',
  shorter: 'shorter',
  same: 'the same',
}

const ageComparisonLabels: Record<AgeComparisonChoice, string> = {
  muchLonger: 'much longer than the real universe age',
  muchShorter: 'much shorter than the real universe age',
  close: 'close to, but not exactly, the real universe age',
}

export function BigBangTutor({ predictedTimeComparison, predictedAgeComparison, onExplained }: BigBangTutorProps) {
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
              'What did you notice about where the galaxies\' markers ended up, and when, as the animation played?'}
            {tutorStep === 'compare' &&
              `You predicted the implied time would be ${timeComparisonLabels[predictedTimeComparison]} for a farther galaxy, and that it would come out ${ageComparisonLabels[predictedAgeComparison]}. Comparing that to what actually happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "If every galaxy, no matter how far away, points back to the same moment, what might that suggest about the universe's whole history?"}
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
            <strong>1. Running Hubble's Law backward</strong>, the time for any galaxy to reach
            zero distance from us is <code>1 / H0</code> — the same number no matter how far away
            it is. This is called the <strong>Hubble time</strong>.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This naive, constant-speed number comes out close to the real,
            independently measured age of the universe</strong> (about 13.8 billion years) —
            informative, but not the real derivation. The universe's actual expansion rate has
            sped up and slowed down across its history (matter, radiation, and dark energy each
            played a part), so simply running today's rate backward does not perfectly retrace the
            real history.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This shared moment is popularly called "the Big Bang"</strong> — but it is
            not an explosion happening at one special point in a pre-existing space, and
            specifically not centered on Earth or the Milky Way. An observer on any other galaxy
            would see exactly the same pattern, with every other galaxy (including ours) pointing
            back to the same moment.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Not covered here:</strong> the real expanding-universe model (general
            relativity's cosmology), how the expansion rate has actually changed over time, and
            dark energy — later topics.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. One puzzle this simple picture does raise:</strong> the universe looks
            almost the same temperature and brightness in every direction, yet tracing opposite
            patches of sky back to the Hubble time shows they were never close enough for light to
            travel between them. This is the <strong>horizon problem</strong>. The leading
            explanation, <strong>cosmic inflation</strong>, says space itself stretched
            extraordinarily fast in the first tiny fraction of a second, blowing up one small,
            already-even patch into our whole visible universe — like stretching one smooth square
            of a wrinkled bedsheet until it covers an entire football field. Inflation is still an
            actively debated theory, not a settled fact; it explains the horizon problem well, but
            there isn't yet a definitive, falsifiable test confirming it happened.
          </p>
        </div>
      )}
    </div>
  )
}
