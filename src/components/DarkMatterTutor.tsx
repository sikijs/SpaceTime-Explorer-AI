import { useState } from 'react'
import {
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  rotationCurve,
} from '../physics/darkMatterExperiment'

type SpeedComparisonChoice = 'faster' | 'slower' | 'same'
type MeasuredChoice = 'match' | 'faster' | 'slower'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DarkMatterTutorProps {
  predictedSpeed: SpeedComparisonChoice
  predictedMeasured: MeasuredChoice
  onExplained?: () => void
}

const speedLabels: Record<SpeedComparisonChoice, string> = {
  faster: 'faster than a near one',
  slower: 'slower than a near one',
  same: 'about the same speed as a near one',
}

const measuredLabels: Record<MeasuredChoice, string> = {
  match: 'match the visible-matter prediction',
  faster: 'be faster than predicted',
  slower: 'be slower than predicted',
}

// Computed from the physics model, so the numbers quoted below can never drift from it.
const [innerPoint, outerPoint] = rotationCurve(0, [MIN_RADIUS_KPC, MAX_RADIUS_KPC])

export function DarkMatterTutor({ predictedSpeed, predictedMeasured, onExplained }: DarkMatterTutorProps) {
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
              'Compare the blue line (visible matter only) with the green dashed line (measured speed). What do you notice, especially far from the center?'}
            {tutorStep === 'compare' &&
              `You predicted that, with only visible matter, a far star would orbit ${speedLabels[predictedSpeed]}, and that the measured speeds would ${measuredLabels[predictedMeasured]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If the stars far from the center move faster than the matter we can see can explain, what might be going on?'}
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
            <strong>1. Orbit speed depends on the mass inside the orbit.</strong> A star circling a galaxy
            moves at <code>v = √(G × M / r)</code>, where <code>M</code> is the mass inside its orbit and{' '}
            <code>r</code> is its distance from the center, the same idea behind the "just right" speed in the
            Orbits experiment. So measuring how fast stars orbit at different distances is a way to weigh a
            galaxy.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. If the visible matter were all the mass</strong>, nearly all of it would sit near the
            center, so stars farther out should orbit more slowly, just as Neptune (about 5.4 km/s) moves much
            more slowly than Earth (about 30 km/s) around the Sun. In this model the visible-only speed falls
            from about {innerPoint.visibleOnlySpeedKmPerS.toFixed(0)} km/s at {MIN_RADIUS_KPC} kpc to about{' '}
            {outerPoint.visibleOnlySpeedKmPerS.toFixed(0)} km/s at {MAX_RADIUS_KPC} kpc.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Real galaxies do not behave that way.</strong> Measured speeds stay high, roughly{' '}
            {OBSERVED_SPEED_KM_PER_S} km/s, far from the center. There must be more mass pulling inward than
            the matter we can see.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The simplest explanation is unseen mass: dark matter.</strong> It pulls with gravity
            but gives off no light we can detect, and astronomers estimate there is roughly five times as much
            of it as ordinary matter. This kind of reasoning has worked before: in 1846, astronomers saw that
            Uranus was drifting from its expected path and worked out that the gravity of an unseen planet
            must be pulling on it, and Neptune was found almost exactly where they predicted. The difference
            is that dark matter has never been seen directly, only inferred from its gravity, and what it is
            made of is still unknown. Dark matter is the leading explanation, supported by several independent
            kinds of evidence, while modified-gravity ideas such as MOND fit galaxy rotation curves well but
            have a harder time with other observations such as galaxy clusters and the cosmic microwave
            background.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Keep in mind</strong> that this experiment used ordinary Newtonian gravity, which is
            fine at these speeds, and a simple teaching model of the galaxy's mass, not a fit to a real
            galaxy. The measured speed was a given, rounded value, and real curves are not perfectly flat.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. Not covered here:</strong> what dark matter is made of, gravitational lensing and
            galaxy clusters as further evidence, and the tiny ripples in the cosmic microwave background (a
            later topic). Dark energy, mentioned in the Big Bang experiment, is a different idea.
          </p>
        </div>
      )}
    </div>
  )
}
