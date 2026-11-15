import { useState } from 'react'
import {
  OBSERVED_RING_ARCSECONDS,
  VISIBLE_MASS_FRACTION,
  markFourTimesGuess,
  markRingSizeGuess,
  ringComparisonExample,
  workedOutVisibleShare,
} from '../physics/gravitationalLensingExperiment'
import type { FourTimesGuess, RingSizeGuess } from '../physics/gravitationalLensingExperiment'

// Cosmology, Experiment 7, Part 4: the tutor (docs/audit/cosmology/07-draft-wording.md, section 6).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalLensingTutorProps {
  predictedRingSize: RingSizeGuess
  predictedFourTimes: FourTimesGuess
  onExplained?: () => void
}

const ringSizeLabels: Record<RingSizeGuess, string> = {
  larger: 'a larger ring',
  same: 'a ring of the same size',
  smaller: 'a smaller ring',
}
const fourTimesLabels: Record<FourTimesGuess, string> = {
  four: 'four times as wide',
  two: 'twice as wide',
  same: 'about the same width',
}
const ringSizeMarks: Record<RingSizeGuess, string> = {
  larger: 'white arrow pointing outward from the blue ring',
  smaller: 'white arrow pointing inward from the blue ring',
  same: 'small white ring on the blue ring',
}
const fourTimesMarks: Record<FourTimesGuess, string> = {
  four: 'white ring four times the width of the blue ring',
  two: 'white ring twice the width of the blue ring',
  same: 'white ring the same width as the blue ring',
}

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const a = (v: number) => v.toFixed(1)

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', ringSize: RingSizeGuess, fourTimes: FourTimesGuess): string {
  if (step === 'observe')
    return 'Compare the rings on the picture of the sky: the dashed blue ring (the visible matter alone), the dotted green ring (the observed one) and, if you have used Part 2, your gold ring. Look at your white marks too: where did each one sit against the real rings?'
  if (step === 'compare')
    return `You guessed that more mass would give ${ringSizeLabels[ringSize]} (your ${ringSizeMarks[ringSize]}), and that four times the mass would give a ring ${fourTimesLabels[fourTimes]} (your ${fourTimesMarks[fourTimes]}). What do you notice when you compare each white mark with the real rings and the violet imagined one?`
  return 'The ring of the real cluster is much bigger than the one its visible matter would make. What might explain the difference?'
}

export function GravitationalLensingTutor({ predictedRingSize, predictedFourTimes, onExplained }: GravitationalLensingTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedRingSize, predictedFourTimes)}</p>
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button
            type="button"
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

      {tutorStep === 'explained' && <GravitationalLensingExplanation predictedRingSize={predictedRingSize} predictedFourTimes={predictedFourTimes} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function GravitationalLensingExplanation({ predictedRingSize, predictedFourTimes }: { predictedRingSize: RingSizeGuess; predictedFourTimes: FourTimesGuess }) {
  const first = markRingSizeGuess(predictedRingSize)
  const second = markFourTimesGuess(predictedFourTimes)
  const e = ringComparisonExample()
  const share = workedOutVisibleShare()
  const visiblePercent = Math.round(VISIBLE_MASS_FRACTION * 100)
  return (
    <div>
      <p style={paragraph}>
        <strong>1. Mass bends light, so a lined-up source becomes a ring.</strong> This is the idea from Gravity and Curved Spacetime Experiment 8: light passing a mass is bent toward it. If the distant galaxy, the cluster and Earth are lined up almost perfectly, light that passes the cluster on every side is bent toward us, and we see the galaxy smeared into a ring around the cluster.
      </p>
      <p style={paragraph}>
        <strong>2. More mass gives a larger ring.</strong> You guessed that more mass would give {ringSizeLabels[predictedRingSize]} (the {ringSizeMarks[predictedRingSize]}). The real rings show it: the cluster&rsquo;s visible matter alone makes a ring of {a(first.visibleRingArcseconds)} arcseconds (the blue ring) and the observed cluster, with more mass, makes {a(first.observedRingArcseconds)} (the green ring).{' '}
        <strong>{first.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> More mass bends light more strongly, so light is pulled in from farther out and the ring is larger.
      </p>
      <p style={paragraph}>
        <strong>3. The ring grows as the square root of the mass.</strong> You guessed that four times the mass would give a ring {fourTimesLabels[predictedFourTimes]} (the {fourTimesMarks[predictedFourTimes]}). The violet imagined ring, for four times the visible mass, is {a(second.fourTimesRingArcseconds)} arcseconds against the blue ring&rsquo;s {a(second.visibleRingArcseconds)}: exactly {second.multiple.toFixed(0)} times as wide, because the square root of 4 is 2.{' '}
        <strong>{second.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> Nine times the mass would make the ring three times as wide. A familiar comparison: a square garden with four times the area is only twice as wide. The ring works the same way, with the cluster&rsquo;s mass playing the part of the garden&rsquo;s area and the ring&rsquo;s width the part of the garden&rsquo;s width. So each extra bit of mass buys a smaller gain in the ring.
      </p>
      <p style={paragraph}>
        <strong>4. So the ring weighs the cluster, whatever the mass is made of.</strong> Gravity bends light the same way for any kind of mass, glowing or dark. That is why measuring the ring tells us how much mass is inside it, much as the sag of a shelf tells you the weight of what sits on it without opening the bag.
      </p>
      <p style={paragraph}>
        <strong>5. For the real cluster, most of the mass is unseen.</strong> The observed ring is {OBSERVED_RING_ARCSECONDS} arcseconds. Visible matter, about {visiblePercent} percent of the total, could make a ring of only {a(e.visibleRingArcseconds)}. The observed ring is about {e.ratio.toFixed(1)} times as wide, and since the ring grows as the square root of the mass, that needs about {e.massRatio.toFixed(1)} times the visible mass ({e.ratio.toFixed(1)} × {e.ratio.toFixed(1)} ≈ {e.massRatio.toFixed(1)}). So most of the cluster&rsquo;s mass is something we cannot see. The {visiblePercent} percent is worked out here from two papers (the universe has about {share.universalPercent.toFixed(1)} percent ordinary matter by Planck&rsquo;s numbers, and big clusters hold about 7 percent less, {share.clusterPercent.toFixed(1)}), not quoted from a page.
      </p>
      <p style={paragraph}>
        <strong>6. This is a second, independent line of evidence for dark matter.</strong> In Cosmology 4 the evidence came from the speeds of stars in a galaxy. Here it comes from the bending of light by a whole cluster, with no star&rsquo;s speed measured at all. Two different methods pointing to the same unseen mass is what makes the case strong.
      </p>
      <p style={paragraph}>
        <strong>7. Lensing says how much mass there is, and where, but not what it is made of.</strong> No source read for this page says what dark matter is made of, and nothing in this experiment tells us.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>8. Not covered here:</strong> real lensing also makes arcs and multiple images of the same galaxy, weak lensing, lensing by a single star, and the time delays between images. Lumpy clusters such as the Bullet Cluster show the unseen mass in a different place from the hot gas (Chandra, 2006; Clowe and others, 2006). Remember too that this experiment used a perfectly round cluster with a perfect line-up, fixed rounded distances, and given reference values for the observed ring and the visible share.
      </p>
    </div>
  )
}
