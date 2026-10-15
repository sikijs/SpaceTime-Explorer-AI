import { useState } from 'react'
import type { ReactNode } from 'react'
import { everydayCollisionExtraMassKg, runCollisionExperiment, totalsOf } from '../physics/energyMomentum'

type Prediction = 'less' | 'same' | 'more'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EnergyMomentumCollisionTutorProps {
  speed: number
  passingSpeed: number
  predicted: Prediction
  // Called once, when the learner reaches the explanation (the last step), so the next part can be shown.
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  less: 'the lump would have less mass than 2m',
  same: 'the lump would have exactly 2m',
  more: 'the lump would have more mass than 2m',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in scientific notation, such as 1.1 × 10⁻¹³.
function scientific(value: number, digits = 1): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 2 tutor sequence in the specification: observe,
// compare with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the
// physics model, never typed in by hand.
export function EnergyMomentumCollisionTutor({ speed, passingSpeed, predicted, onExplained }: EnergyMomentumCollisionTutorProps) {
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

  const result = runCollisionExperiment(speed, passingSpeed)
  const f = (value: number, digits = 3) => value.toFixed(digits).replace('-', '−')
  const lumpEnergy = result.labBefore[0].energy
  const labTotal = totalsOf(result.labBefore)
  const passingBefore = totalsOf(result.passingBefore)
  const passingAfter = totalsOf([result.passingAfter])
  const kineticPerLump = lumpEnergy - 1
  const everydayKg = everydayCollisionExtraMassKg(1, 100)
  const everydayJoules = 2 * 0.5 * 1 * 100 ** 2

  const paragraphs: ReactNode[] = []

  paragraphs.push(
    <>
      <strong>What the results show.</strong> In your run, each lump moved at {speed}c in the lab, so each had an energy of{' '}
      {f(lumpEnergy)} (in rest energies of one lump). The total energy was 2 × {f(lumpEnergy)} = {f(labTotal.energy)}, and the
      total momentum × c was {f(labTotal.momentumTimesC)}, because the two momenta point in opposite directions. After the
      collision there is one lump at rest, with an energy of {f(result.labAfter.energy)}. Its mass is the square root of{' '}
      {f(result.labAfter.energy)}² − 0² = {f(result.lumpMass)}, so the lump has a mass of {f(result.lumpMass)} <em>m</em>, not 2
      <em>m</em>. For the passing observer, who moved at {passingSpeed > 0 ? '+' : '−'}
      {Math.abs(passingSpeed)}c, the totals were different: an energy of {f(passingBefore.energy)} and a momentum × c of{' '}
      {f(passingBefore.momentumTimesC)} before, and {f(passingAfter.energy)} and {f(passingAfter.momentumTimesC)} after. But for
      each observer, the totals did not change in the collision.
    </>,
  )

  paragraphs.push(
    <>
      <strong>Where the energy goes.</strong> Before the collision, each lump had {f(kineticPerLump)} rest energies of energy of
      motion (kinetic energy), {f(lumpEnergy)} − 1. The two together had 2 × {f(kineticPerLump)} = {f(2 * kineticPerLump)}.
      Afterward, the lump is at rest, so there is no energy of motion. That energy has become <em>internal energy</em> of the
      lump: in clay, heat. Internal energy counts toward mass, so the lump is heavier than the two lumps added, by{' '}
      {f(result.extraMass)} <em>m</em>, which is exactly the kinetic energy that disappeared ({f(2 * kineticPerLump)}).
    </>,
  )

  paragraphs.push(
    <>
      <strong>Why energy and momentum are conserved for everyone, but the sum of the masses is not.</strong> The mass of a{' '}
      <em>single object</em> is the invariant of its own energy and momentum. A lump made from two objects is a different object.
      What is conserved is the <em>total</em> energy and the <em>total</em> momentum, and so the mass of the whole{' '}
      <em>system</em> taken together. Here it was {f(result.systemMass)} <em>m</em> before the collision (two moving lumps, total
      energy {f(labTotal.energy)}, total momentum {f(labTotal.momentumTimesC)}) and {f(result.lumpMass)} <em>m</em> after (one
      lump at rest). The passing observer finds the same {f(result.systemMass)} before and after, even though their energies and
      momenta differ from the lab's. The <em>sum of the parts' masses</em> did change, from 2 <em>m</em> to {f(result.lumpMass)}{' '}
      <em>m</em>.
    </>,
  )

  paragraphs.push(
    <>
      <strong>The everyday momentum fails.</strong> With the speeds the passing observer measured, the everyday sum m × (speed
      of Lump 1 + speed of Lump 2) was {f(result.newtonMomentumBefore)} <em>m</em> before the collision, and the everyday value
      for the lump afterward, 2<em>m</em> × (its speed), was {f(result.newtonMomentumAfter)} <em>m</em>. They are not equal, so for
      this observer the everyday rule is not conserved. The relativistic momentum, with its extra factor of 1 ÷ D(v), is
      conserved, as the table of momentum totals showed. A daily-life example: two billiard balls colliding. At everyday speeds
      the failure is too small to notice, which is why the everyday rule served for so long.
    </>,
  )

  paragraphs.push(
    <>
      <strong>An everyday number.</strong> Two 1-kilogram clay lumps collide head-on at 100 meters per second each. Their energy
      of motion is 2 × ½ × 1 × 100² = {everydayJoules.toLocaleString('en-US')} joules. Dividing by c² (about 9 × 10¹⁶) gives{' '}
      {scientific(everydayKg)} kilograms, about a tenth of a nanogram, added to a 2-kilogram lump. That is far too little for any
      scale to show.
    </>,
  )

  paragraphs.push(
    <>
      <strong>A remark on a common slogan.</strong> "Mass turns into energy" is a poor description. What happens is that energy
      moves between forms, and the total energy is conserved. When the internal energy of a thing changes, its mass changes with
      it. The next part shows the famous cases, where the change is large.
    </>,
  )

  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw one collision of two identical lumps, head-on, along one line,
      with nothing escaping. Forces and accelerations were not shown, and no particles were created or destroyed. The rule that
      the totals are conserved was used as a rule of the experiment, not derived here.
    </>,
  )

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

      {tutorStep !== 'explained' && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the totals in the results. Compare the totals before and after the collision, for the lab and for the passing observer. What do you notice?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the two masses added were 2 m, and the mass of the lump was ${f(result.lumpMass)} m. Comparing your prediction with the results, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The two lumps were moving, and the final lump is at rest in the lab. Where did the energy of their motion go?'}
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
          {paragraphs.map((content, index) => (
            <p key={index} style={paragraphStyle}>
              <strong>{index + 1}.</strong> {content}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
