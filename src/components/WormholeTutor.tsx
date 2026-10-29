import { useState } from 'react'
import { CROSS_CHOICES, MASS_CHOICES, PREDICTION_THROAT_RADIUS_M, crossAnswer, crossGuessResult, exampleSteps, massAnswer, massGuessResult, resultsCheckUp, tutorFigures } from '../physics/wormholes'
import type { CrossChoiceId, MassChoiceId } from '../physics/wormholes'

// Evidence and Imagination, Experiment 1: Part 4, the tutor. Wording approved by the owner (CLAUDE.md §28.1) from the Step 7 draft. Observe, compare with the predictions, one conceptual question,
// then the explanation. Every number comes from the physics module (wormholes.ts), never typed in by hand (CLAUDE.md §9), except the everyday comparisons (a magnifying glass, a bridge that collapses).
// The predictions are marked only in the explanation (CLAUDE.md §12, §13). The tutor does not say that wormholes exist or that they cannot.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface WormholeTutorProps {
  crossPrediction: CrossChoiceId
  massPrediction: MassChoiceId
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function sci(x: number, digits: number = 1): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / Math.pow(10, exponent)
  return `${mantissa.toFixed(digits)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
const n2 = (x: number) => x.toFixed(2)

export function WormholeTutor({ crossPrediction, massPrediction, onExplained }: WormholeTutorProps) {
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

  const c = resultsCheckUp()
  const s = exampleSteps()
  const t = tutorFigures()
  const crossResult = crossGuessResult(crossPrediction)
  const massResult = massGuessResult(massPrediction)
  const crossGuessLabel = CROSS_CHOICES.find((x) => x.id === crossPrediction)!.label
  const crossAnswerLabel = CROSS_CHOICES.find((x) => x.id === crossAnswer())!.label
  const massGuessLabel = MASS_CHOICES.find((x) => x.id === massPrediction)!.label
  const massAnswerLabel = MASS_CHOICES.find((x) => x.id === massAnswer())!.label
  const [f1, f2, f3] = t.closingFractions
  const [t1, t2, t3] = t.closingTimes

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 2</strong>. Follow the four outlines from the first to the last. What happens to the narrowest part? Where is the yellow ray when the last outline is drawn: on the left, in the middle, or on the right? Then look at{' '}
                <strong>Picture 3, panel A</strong>: where does the cyan mark sit among the grey landmarks (the car, the Moon, the Earth, Jupiter, the Sun)?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white marker in Picture 2</strong> is Prediction 1. It is only a marker, because yes or no has no size. Where does it sit compared with the yellow ray?
                </li>
                <li>
                  <strong>The white diamond with the box “YOUR GUESS” on the ruler in Picture 3</strong> is Prediction 2. How does it sit beside the cyan mark?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the rows “The simplest throat, over time” and “Negative mass”. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose the throat were <strong>twice as wide</strong>, {t.doubledRadiusM} metres in radius instead of {t.radiusM}. Would the negative mass needed be <strong>more, the same, or less</strong>? And would the tension at the
                throat be more, the same, or less? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure.</p>
            </>
          )}
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
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
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{crossGuessLabel}</em>. The ray in Picture 2 does not reach the right-hand side, so the answer is <em>{crossAnswerLabel}</em>.{' '}
            {crossResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered <em>{massGuessLabel}</em>. The calculated mass in Table 1 is <em>{sci(c.massKg)} kg ({n2(c.massJupiters)} Jupiters)</em>, so the nearest answer is{' '}
            <em>{massAnswerLabel}</em>. {massResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both are calculated here from mathematics. No wormhole has been measured.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why the simplest throat closes.</strong> The Einstein–Rosen bridge is not a tunnel that stands open. It is a moment in the history of a black hole’s full solution. At T = {t1} it is {n2(f1)} of its opening size, at T = {t2} it is {n2(f2)}, at T = {t3} it is {n2(f3)}, and
            at T = {t.shutAtT} it is shut. A ray needs more time to cross than the throat stays open. Think of a bridge that collapses faster than you can walk across it: the bridge is real, but nobody gets over.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why holding a throat open needs negative energy.</strong> Ordinary matter pulls things together. Light rays passing a mass are bent towards each other, as a magnifying glass bends them. A throat needs the opposite: paths that come in must spread apart again on the far
            side, which is the outward flare of its walls. Making space flare outward at the narrowest point takes something that acts against the pulling-together, and that is negative energy. (Physicists name this the null energy condition. This page uses the name only.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. How big the cost is.</strong> A throat {PREDICTION_THROAT_RADIUS_M} m in radius needs π × {s.radiusM} × c² ÷ (2G) = {sci(s.closedFormKg)} kg of negative mass, {n2(s.jupiters)} Jupiters. A second formula, from a summary, gives {n2(c.secondaryJupiters)}. Both say about one Jupiter,
            for a tunnel {2 * PREDICTION_THROAT_RADIUS_M} metres across. The tension at the throat is {sci(s.tensionPa)} Pa. For a 3 km throat it is {sci(c.tension3kmPa)} Pa, which is the same size as the pressure at the centre of a massive neutron star.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the Casimir effect is not enough.</strong> Two plates {c.casimirGapM * 1e6} µm apart hold {sci(c.casimirJPerM2)} J per square metre, a real, measured negative energy. The throat needs {sci(c.neededJ)} J, so the plates fall short by {sci(c.shortfall)} times. To make up
            the gap you would need plates covering {n2(c.fractionOfUniverseSurface)} times the surface of the observable universe. It is also not known that negative energy of that kind can be gathered in bulk.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What the 2022 “wormhole” on a quantum computer was and was not.</strong> In 2022 a team reported a “traversable wormhole” on a quantum processor. It simulated a mathematical equivalent of one on a few of the processor’s basic memory units (qubits). It was not a tunnel in space, and whether it shows what was claimed
            is debated.
          </p>
          <p style={paragraphStyle}>
            <strong>6. About the question you were asked.</strong> A throat twice as wide needs {n2(t.massRatio)} times the negative mass, {sci(t.doubledMassKg)} kg ({n2(t.doubledJupiters)} Jupiters), because b₀ appears once in the formula. Its tension is {n2(t.tensionRatio)} times as much,{' '}
            {sci(t.doubledTensionPa)} Pa, because b₀ is squared in the denominator. So a bigger tunnel costs more mass but pulls less hard per square metre.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What is not settled, and how sure we are.</strong> The mathematics allows wormholes, and the simplest one closes. Holding one open needs negative energy that we have only in traces. No wormhole has been seen, and two searches for echoes found nothing significant. Whether a larger
            source of negative energy can exist is open. I am not saying wormholes exist, and I am not saying they cannot. The mass formula and the throat’s shape were not checked against Morris and Thorne’s paper, and no paper was read in full.
          </p>
        </div>
      )}
    </div>
  )
}
