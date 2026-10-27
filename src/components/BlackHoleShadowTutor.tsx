import { useState } from 'react'
import { SIZE_CHOICES, checkUpRows, distanceRatio, fromMassRows, horizonAnswer, horizonGuessResult, massRatio, rangeRows, ratioRow, sizeAnswer, sizeChoiceRatio, sizeGuessResult } from '../physics/blackHoleShadow'
import type { HorizonChoice, SizeChoiceId } from '../physics/blackHoleShadow'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleShadowTutorProps {
  sizePrediction: SizeChoiceId
  horizonPrediction: HorizonChoice
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

function n1(x: number): string {
  return x.toFixed(1)
}
function n2(x: number): string {
  return x.toFixed(2)
}
function commas(x: number): string {
  return Math.round(x).toLocaleString('en-US')
}

// The tutor of Frontier and Beyond Experiment 21. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "Tutor (Part 4)" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (blackHoleShadow.ts), never typed in by hand (CLAUDE.md §9), except the two everyday trees, which are an illustration. The predictions are marked only in the explanation (the
// owner's choice for the group). The tutor does not give the reason for the gap in Table 1 as settled, and does not claim more than the abstracts say.
export function BlackHoleShadowTutor({ sizePrediction, horizonPrediction, onExplained }: BlackHoleShadowTutorProps) {
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

  // Every number below is computed from the module.
  const [sgrRow, m87Row] = fromMassRows()
  const ratios = ratioRow()
  const checkUp = checkUpRows()
  const ranges = rangeRows()
  const sizeResult = sizeGuessResult(sizePrediction)
  const horizonResult = horizonGuessResult(horizonPrediction)
  const sizeAnswerLabel = SIZE_CHOICES.find((c) => c.id === sizeAnswer())!.label
  const sizeGuessLabel = SIZE_CHOICES.find((c) => c.id === sizePrediction)!.label

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, panel A. Find the dashed cyan circle and the solid orange ring round each black hole. Which black hole’s
                circles look wider, or do they look about the same? How close does each orange ring come to its cyan circle?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>. Follow the red beams and the green beams from the left of the picture to the black hole. Where does the picture change from red to green, and where is
                the dashed cyan circle?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                Now bring your own guesses back. In Part 1 you made two predictions, and they are drawn in white on the real pictures, so you can see each guess next to the real result.
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white marker and the box “YOUR GUESS”</strong> in panel B of Picture 1 are your guess for Prediction 1. It is only a marker, because a guess has no size of its own here.
                  How does it sit beside the calculated and measured ratios?
                </li>
                <li>
                  <strong>The white dashed circle and the box</strong> in Picture 2 are your guess for Prediction 2. How does it compare with the dashed cyan circle?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the row “Size ratio”) and <strong>Table 2</strong> (the row “Shadow width ÷ edge width”), which have the real numbers for both predictions. Did
                anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Imagine two trees. One is 10 metres tall and stands 100 metres away. The other is 20 metres tall and stands 400 metres away. Which looks
                bigger to you, and why? That is an everyday comparison, not black-hole physics.
              </p>
              <p style={paragraphStyle}>
                Now the black holes. M87* is much heavier than Sagittarius A*, and also much farther away. What would you need to know, and what would you work out, to say which one’s shadow looks
                bigger in our sky? Make a guess, even if you are not sure.
              </p>
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{sizeGuessLabel}</em> (a ratio of{' '}
            {n2(sizeChoiceRatio(sizePrediction))}). The calculated ratio in Table 1 is <em>{n2(ratios.calculated)}</em>, so the nearest answer is <em>{sizeAnswerLabel}</em>.{' '}
            {sizeResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered: <em>{horizonPrediction} times</em>. The real number in Table 2 is{' '}
            <em>{n2(sgrRow.shadowOverHorizon)}</em>, so the nearest answer is <em>{horizonAnswer()} times</em>. {horizonResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both
            real numbers are calculated here from a simple formula, not measured: the measured quantity is the ring.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why the shadow is {n2(sgrRow.shadowOverHorizon)} times as wide as the edge.</strong> In Black Holes Experiment 4 you saw that a beam of light aimed closer than about {n2(sgrRow.shadowOverHorizon)} edge-radii
            from the centre is captured, and one aimed wider gets away. The shadow is the circle of those captured aims, so its radius is {n2(sgrRow.shadowOverHorizon)} edge-radii. The edge itself is 1 edge-radius. So
            the dark patch is {n2(sgrRow.shadowOverHorizon)} times as wide as the black hole, and this is the same for every black hole that does not spin, whatever its mass.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the two shadows look about the same size.</strong> How wide something looks is its real width divided by its distance. Take the two trees: 10 ÷ 100 = 0.10 and 20 ÷ 400 = 0.05. The shorter, nearer
            tree looks twice as big, even though the other is twice as tall. For the black holes, a shadow’s real width grows in step with the mass (it is always {n2(sgrRow.shadowOverHorizon)} times the edge, and the edge grows in step with the
            mass). M87* is {commas(massRatio())} times heavier than Sagittarius A* and {commas(distanceRatio())} times farther, so its shadow looks {commas(massRatio())} ÷ {commas(distanceRatio())} = {n2(ratios.calculated)} times as wide:{' '}
            {n1(m87Row.shadowMicroarcsec)} µas against {n1(sgrRow.shadowMicroarcsec)} µas. A mass {commas(massRatio())} times larger and a distance {commas(distanceRatio())} times larger almost cancel.
          </p>
          <p style={paragraphStyle}>
            <strong>3. What the ring is, and why it is not the shadow.</strong> The telescope does not photograph the shadow. It photographs the bright ring of hot, glowing gas round it, whose light is bent by the black hole. The shadow is
            the dark middle, and we <em>calculate</em> its size from the mass and distance. So the check in Table 1 sets a calculation beside a measurement of something related. The calculated shadows are {n1(Math.abs(checkUp[0].comparison.differencePercent))},{' '}
            {n1(Math.abs(checkUp[1].comparison.differencePercent))} and {n1(Math.abs(checkUp[2].comparison.differencePercent))} percent narrower than the rings, so the sizes agree to roughly a tenth. How a ring’s size relates to the shadow’s size is something the Event Horizon Telescope teams work out
            with care, and this page does not model it.
          </p>
          <p style={paragraphStyle}>
            <strong>4. How good is the match?</strong> Against the 2019 ring, the gaps are smaller than the measurements’ own give-or-take. Against M87*’s later ring, measured more precisely (± {checkUp[2].comparison.uncertainty} µas), the gap is
            about {n1(Math.abs(checkUp[2].comparison.differenceInUncertainties))} give-or-takes. That sounds large, but the calculated shadow has a give-or-take of its own, because the masses and distances do. In Table 3, M87*’s calculated shadow runs from about{' '}
            {n1(ranges[1].range.both.low)} to {n1(ranges[1].range.both.high)} µas and Sagittarius A*’s from about {n1(ranges[0].range.both.low)} to {n1(ranges[0].range.both.high)} µas, and every measured ring sits inside its range. Think of weighing a
            parcel on scales that read to the nearest kilogram: you cannot say it is exactly 10.2 kilograms. So the match is a real test, but only as tight as the masses are known. This page does not say why the calculated shadows come out a little
            smaller than the rings.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What was left out.</strong> The formula is for a black hole that does not spin. A spinning one has a shadow that is slightly smaller and not quite round. The page also leaves out the glow of the gas, the link between ring and shadow, and the telescope itself. M87*’s ring size
            stayed the same across the 2017, 2018 and 2021 observations (43.9 ± 0.6 µas) while the bright pattern round it changed. These are not tested by the numbers on this page.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How sure we are.</strong> That the Event Horizon Telescope has imaged rings round two black holes, and that their sizes are close to what the masses and distances give, is strong evidence. How tightly that tests gravity is open, because of the give-or-take on the
            masses and on the link between a ring and a shadow. The numbers on this page come from abstracts and summaries, and no paper was read in full.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that a black hole’s shadow is {n2(sgrRow.shadowOverHorizon)} times as wide as its edge, that how big it looks depends on the mass and the distance together, and that for two very different black holes
            the calculated and measured sizes are close, within a tenth. You did not see the shadow itself, a test of any rival to general relativity, or a reason for the gap in Table 1. Try the settings in Part 2 again if you like: they show how other masses and distances would look, and the real
            pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
