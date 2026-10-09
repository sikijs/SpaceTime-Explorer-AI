import { useState } from 'react'
import {
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  RECOMBINATION_REDSHIFT,
  runStructureFormationExperiment,
} from '../physics/structureFormationExperiment'

type GrowthChoice = 'ten' | 'thousand' | 'million'
type HeadStartChoice = 'none' | 'small' | 'decides'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface StructureFormationTutorProps {
  predictedGrowth: GrowthChoice
  predictedHeadStart: HeadStartChoice
  onExplained?: () => void
}

const growthLabels: Record<GrowthChoice, string> = {
  ten: 'about 10 times',
  thousand: 'about 1,000 times',
  million: 'about a million times',
}

const headStartLabels: Record<HeadStartChoice, string> = {
  none: 'would make no difference',
  small: 'would make a small difference',
  decides: 'would decide the outcome',
}

// The starting size used to show that a head start can decide the outcome (the 1-part-in-1,000 preset).
const EXAMPLE_START_DELTA = 1e-3

const whole = (value: number) => Math.round(value).toLocaleString('en-US')
// "1 part in 850", rounded the same way as the Results panel (to the nearest 10 above 1,000).
const partsIn = (delta: number) => {
  const parts = 1 / delta
  return `1 part in ${(parts >= 1000 ? Math.round(parts / 10) * 10 : Math.round(parts)).toLocaleString('en-US')}`
}

export function StructureFormationTutor({ predictedGrowth, predictedHeadStart, onExplained }: StructureFormationTutorProps) {
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
  const ordinary = runStructureFormationExperiment('ordinary', EXAMPLE_START_DELTA)
  const dark = runStructureFormationExperiment('ordinary-plus-dark', EXAMPLE_START_DELTA)
  const ordinaryGrowth = ordinary.growthSinceStart
  const darkGrowth = dark.growthSinceStart
  const sizeRatio = 1 + RECOMBINATION_REDSHIFT
  const lostToDarkEnergyPercent = (1 - ordinaryGrowth / sizeRatio) * 100
  const headStartFactor = darkGrowth / ordinaryGrowth

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
              'Look at the growth graph and at your own ripple. How many times did the ripple grow? Did the starting size you chose become a clump?'}
            {tutorStep === 'compare' &&
              `You predicted that a slightly denser region would become ${growthLabels[predictedGrowth]} denser between the oldest light's release and today, and that starting earlier ${headStartLabels[predictedHeadStart]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Gravity pulls extra matter into a denser region, and the extra matter makes it pull harder. So why does the ripple not grow explosively?'}
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
            <strong>1. A small excess pulls in more matter, and so grows.</strong> A region that is slightly
            denser than average has slightly more gravity, so it draws in matter from around it. With more
            matter in it, it is denser still.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The expansion works against it.</strong> While this goes on, space is stretching, which
            spreads matter apart. Working out the two effects together, the result, while matter dominates, is
            that a ripple grows only in step with the size of the universe: if the universe doubles in size, the
            ripple doubles. That is why it does not grow explosively.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. So the total growth is limited.</strong> From the oldest light's release to today, the
            universe grew about {whole(sizeRatio)} times in size, so a ripple could grow by at most that
            factor. With dark energy it grows about {whole(ordinaryGrowth)} times, about{' '}
            {Math.round(lostToDarkEnergyPercent)}% less. For example, a region that starts at{' '}
            {partsIn(EXAMPLE_START_DELTA)} (a density excess of {EXAMPLE_START_DELTA}) ends at about{' '}
            {EXAMPLE_START_DELTA} × {whole(ordinaryGrowth)} ≈ {ordinary.densityExcessToday.toPrecision(2)},
            which is a little short of the density excess of 1 that counts as a clump.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Dark matter can start gathering earlier.</strong> Ordinary matter was held smooth by
            light until the oldest light was released (Experiment 3). Dark matter (Experiment 4) does not
            interact with light, so in this model it can start growing earlier, at redshift about{' '}
            {whole(MATTER_RADIATION_EQUALITY_REDSHIFT)} instead of {RECOMBINATION_REDSHIFT}. That gives it a
            head start of a factor of about {headStartFactor.toFixed(1)} in growth: about{' '}
            {whole(darkGrowth)} times against about {whole(ordinaryGrowth)}. The same region, starting at{' '}
            {partsIn(EXAMPLE_START_DELTA)}, would reach about {dark.densityExcessToday.toPrecision(2)}: a clump.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Dark energy slows the growth late on.</strong> As the expansion speeds up (Experiment
            5), it becomes harder for gravity to gather matter, so the growth slows. You can see this as the
            small gap between the dashed line and the solid line at the end of the growth graph. We will come
            back to this in the next experiment.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. How big a ripple must start.</strong> Working backward from the growth, a region must
            start about {partsIn(ordinary.requiredStartDelta)} denser to become a clump with ordinary matter,
            and about {partsIn(dark.requiredStartDelta)} denser with the head start. The oldest light's ripple
            is about 1 part in 100,000, but that is a difference in <em>temperature</em>, not in how much
            denser a region of matter is, and how the two are related depends on the size of the region. So
            this model does not say whether the real universe had enough, and the real, more detailed story
            needs physics this experiment does not model.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. The honest limits.</strong> This is a first-order picture of one region that is still
            only slightly denser than average. The starting size is your own illustrative choice, and the dark
            matter head start is a given real value, not something the model works out. The model also leaves
            out radiation, as in Experiments 5, 6 and 8.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>8. Not covered here:</strong> the real shape of the early ripples, how a clump collapses into a
            galaxy, how galaxies merge into larger groups, and the web-like pattern the galaxies make across the
            universe.
          </p>
        </div>
      )}
    </div>
  )
}
