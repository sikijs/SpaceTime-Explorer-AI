import { useState } from 'react'
import {
  OBSERVED_TOTAL_MASS_SOLAR_MASSES,
  VISIBLE_MASS_FRACTION,
  runGravitationalLensingExperiment,
} from '../physics/gravitationalLensingExperiment'

type RingSizeChoice = 'larger' | 'same' | 'smaller'
type FourTimesChoice = 'four' | 'two' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalLensingTutorProps {
  predictedRingSize: RingSizeChoice
  predictedFourTimes: FourTimesChoice
  onExplained?: () => void
}

const ringSizeLabels: Record<RingSizeChoice, string> = {
  larger: 'a larger ring',
  same: 'a ring of the same size',
  smaller: 'a smaller ring',
}

const fourTimesLabels: Record<FourTimesChoice, string> = {
  four: 'four times as wide',
  two: 'twice as wide',
  same: 'about the same width',
}

export function GravitationalLensingTutor({
  predictedRingSize,
  predictedFourTimes,
  onExplained,
}: GravitationalLensingTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const real = runGravitationalLensingExperiment(OBSERVED_TOTAL_MASS_SOLAR_MASSES)
  const massRatio = real.observedMassSolarMasses / real.visibleOnlyMassSolarMasses
  const ringRatio = Math.sqrt(massRatio)
  const visiblePercent = Math.round(VISIBLE_MASS_FRACTION * 100)

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
              'Compare the three rings: the one for your chosen mass (gold), the dashed one that visible matter alone would make (blue), and the observed one (green). What do you notice?'}
            {tutorStep === 'compare' &&
              `You predicted that more mass would give ${ringSizeLabels[predictedRingSize]}, and that four times the mass would give a ring ${fourTimesLabels[predictedFourTimes]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The ring of the real cluster is much bigger than the one its visible matter would make. What might explain the difference?'}
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
            <strong>1. Mass bends light, so a lined-up source becomes a ring.</strong> This is the idea from
            Gravity and Curved Spacetime Experiment 8: light passing a mass is bent toward it. If the distant
            galaxy, the cluster and Earth are lined up almost perfectly, light that passes the cluster on every
            side is bent toward us, and we see the galaxy smeared into a ring around the cluster.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The ring grows as the square root of the mass.</strong> Four times the mass makes a ring
            only twice as wide, and nine times the mass makes it three times as wide. For example, the visible
            matter alone makes a ring of {real.visibleOnlyRingArcseconds.toFixed(1)} arcseconds. Four times
            that mass would make {(2 * real.visibleOnlyRingArcseconds).toFixed(1)} arcseconds, exactly double. A square
            garden is the same: four times the area is only twice as wide.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. So the ring weighs the cluster, whatever the mass is made of.</strong> Gravity bends
            light the same way for any kind of mass, glowing or dark. That is why measuring the ring tells us
            how much mass is inside it, much as the sag of a shelf tells you the weight of what sits on it
            without opening the bag.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. For the real cluster, most of the mass is unseen.</strong> The observed ring is{' '}
            {real.observedRingArcseconds.toFixed(0)} arcseconds. Visible matter, about {visiblePercent}% of the
            total, could make a ring of only {real.visibleOnlyRingArcseconds.toFixed(1)}. The observed ring is
            about {ringRatio.toFixed(1)} times as wide, and since the ring grows as the square root of the
            mass, that needs about {massRatio.toFixed(1)} times the visible mass ({ringRatio.toFixed(1)} ×{' '}
            {ringRatio.toFixed(1)} ≈ {massRatio.toFixed(1)}). So most of the cluster's mass is something we
            cannot see.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This is a second, independent line of evidence for dark matter.</strong> In Experiment 4,
            the evidence came from the speeds of stars in a galaxy. Here it comes from the bending of light by a
            whole cluster, with no star's speed measured at all. Two different methods pointing to the same
            unseen mass is what makes the case strong.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. Lensing says how much mass there is, and where, but not what it is made of.</strong>{' '}
            Nothing in this experiment tells us what dark matter is.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Not covered here:</strong> real lensing also makes arcs and multiple images of the same
            galaxy, weak lensing, lensing by a single star, and lumpy clusters such as the Bullet Cluster.
            Remember too that this experiment used a perfectly round cluster with a perfect line-up, fixed
            rounded distances, and given reference values for the observed ring and the visible share.
          </p>
        </div>
      )}
    </div>
  )
}
