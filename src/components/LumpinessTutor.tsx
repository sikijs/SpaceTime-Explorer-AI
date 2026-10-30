import { useState } from 'react'
import { EARLY_MEASUREMENT, kidsShift, MEASUREMENTS, runLumpiness, shift, sigma8OnCurve, tensionRange, tensionSigma } from '../physics/lumpiness'
import type { S8Measurement, ShiftDirection, TensionRange } from '../physics/lumpiness'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LumpinessTutorProps {
  focus: S8Measurement // the survey the learner is looking at (the main version, for DES)
  shiftPrediction: ShiftDirection
  rangePrediction: TensionRange
  onExplained?: () => void
}

const shiftWords: Record<ShiftDirection, string> = { lower: 'lower', same: 'about the same', higher: 'higher' }
const rangeWords: Record<TensionRange, string> = {
  under1: 'within 1 sigma of the microwave-background value (it agrees)',
  oneToTwoAndAHalf: 'between 1 and 2.5 sigma from it (partly)',
  over2AndAHalf: 'more than 2.5 sigma from it (clearly different)',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Cosmic Horizons Experiment 3. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes
// from the physics module (lumpiness.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice
// for the group), never before it. What changed in KiDS is given in the authors' own words (arXiv:2503.19441) and is NOT presented as an established
// cause; the wording about DES follows arXiv:2602.10065 and about the 2026 review arXiv:2602.12238.
export function LumpinessTutor({ focus, shiftPrediction, rangePrediction, onExplained }: LumpinessTutorProps) {
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

  const two = (value: number) => value.toFixed(2)
  const three = (value: number) => value.toFixed(3)
  const signed3 = (value: number) => (value < 0 ? `−${Math.abs(value).toFixed(3)}` : `+${value.toFixed(3)}`)

  const early = EARLY_MEASUREMENT
  const byName = (name: string) => MEASUREMENTS.find((m) => m.name === name)!
  const kids1000 = byName('KiDS-1000')
  const kidsLegacy = byName('KiDS-Legacy')
  const desNla = byName('DES Y6 (NLA)')
  const desTatt = byName('DES Y6 (TATT)')
  const actualShift = kidsShift()
  const desSigma = tensionSigma(desNla, early)
  const actualRange = tensionRange(desSigma)
  const mine = runLumpiness(focus)
  const kidsChange = shift(kids1000, kidsLegacy)
  const kids1000Sigma = tensionSigma(kids1000, early)
  const kidsLegacySigma = tensionSigma(kidsLegacy, early)
  const onCurve25 = sigma8OnCurve(early.value, 0.25)
  const onCurve35 = sigma8OnCurve(early.value, 0.35)

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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Pictures 1 and 3. What do you notice about where the two KiDS results and the Dark Energy Survey results sit compared with the microwave-background value?'}
            {tutorStep === 'compare' &&
              `You predicted that KiDS’s S₈ would come out ${shiftWords[shiftPrediction]} when the team re-analysed its complete data, and that the Dark Energy Survey’s 2026 value would be ${rangeWords[rangePrediction]}. Look at Pictures 1 and 3 again. Is there anything that surprises you? I will say how each prediction compared once you have thought about it.`}
            {tutorStep === 'conceptual' &&
              'KiDS’s value changed when the team improved how it worked out the distances of the galaxies, among other things. What would you want to check before deciding that the old value was wrong, or that the new one was?'}
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
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that
            KiDS’s S₈ would come out <em>{shiftWords[shiftPrediction]}</em> when the team re-analysed its complete data. It came out{' '}
            <em>{shiftWords[actualShift]}</em>: {kids1000.value} before, {kidsLegacy.value} after ({signed3(kidsChange)}).{' '}
            {shiftPrediction === actualShift ? 'Your prediction matched.' : 'Your prediction did not match.'} You predicted that the Dark Energy
            Survey’s 2026 value would be <em>{rangeWords[rangePrediction]}</em>. With the simple sigma worked out here it is {two(desSigma)} sigma
            below (and {two(tensionSigma(desTatt, early))} for the other version), which is <em>{rangeWords[actualRange]}</em>.{' '}
            {rangePrediction === actualRange ? 'Your prediction matched.' : 'Your prediction did not match.'} Either way, the parts below explain
            what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> You looked at {focus.name}. Its S₈ is {focus.value}, and the microwave
            background predicts {early.value}. The gap is {three(mine.gap)}. The combined give-or-take, from the {mine.surveyUncertaintyUsed} on the
            survey’s side facing the prediction and the {mine.earlyUncertaintyUsed} on the prediction’s side facing the survey, is{' '}
            {mine.combinedUncertainty.toFixed(4)}. So the gap is <strong>{two(mine.tension)} sigma</strong>
            {mine.paperSigma !== '' && <> (the paper’s own comparison, with fuller statistics: {mine.paperSigma})</>}.
          </p>

          <p style={paragraphStyle}>
            <strong>2. What S₈ combines, with an everyday example.</strong> Lensing measures a combination of two things, not each one. Compare a
            rectangle: a rectangle with an area of 24 could be 2 by 12, or 3 by 8, or 4 by 6. Knowing the area does not tell you the sides. S₈ is not
            exactly an area, but it works the same way: many pairs of Ωm and σ₈ give the same S₈. For the microwave-background value, {early.value}:
            at Ωm = 0.25 the matching σ₈ is {three(onCurve25)}, and at Ωm = 0.35 it is {three(onCurve35)}. Two quite different pairs, one S₈. That is
            why Picture 2 shows a curve for each measurement, not a point. It is also why the surveys are compared by S₈: it is the thing lensing
            fixes best.
          </p>

          <p style={paragraphStyle}>
            <strong>3. What changed in KiDS.</strong> The KiDS team says the rise in its S₈ “primarily results from improved redshift distribution
            estimation and calibration, as well as new survey area and improved image reduction”. In plain words: the team improved how it worked
            out how far away the lensed galaxies are, it added more sky, and it improved how the images were processed. Here is an everyday example of
            why the first of these could matter. Suppose you measure the heights of people in a photograph with a ruler, but the scale of the photo
            is a little wrong. Every height comes out wrong in the same way, because the same mistake applies to all of them. A mistake in the
            assumed distances of the lensed galaxies works a little like that: it applies to a whole survey at once. The authors say which changes
            mattered most, and this experiment cannot check that. It only reports it.
          </p>

          <p style={paragraphStyle}>
            <strong>4. Not an established cause.</strong> Notice what the sentence above is and is not. It is the authors’ own account of what
            changed, in the paper that reports the new value. It is not a demonstration that the old value was wrong because of that one thing, and a
            wrong distance could push the answer either way. Whether the old value or the new one is closer to the truth is something that other
            surveys, and other checks, help to decide. That is why the next part matters.
          </p>

          <p style={paragraphStyle}>
            <strong>5. A tension that went away, in one survey.</strong> KiDS-1000 was {two(kids1000Sigma)} sigma below the prediction with the simple
            sigma worked out here (the paper says {kids1000.paperSigma}). KiDS-Legacy is {two(kidsLegacySigma)} sigma away (the paper says{' '}
            {kidsLegacy.paperSigma}), well inside the
            range that chance alone gives easily. So in KiDS the tension went away when the measurement was improved. This is the example behind a
            remark from Experiment 1: cosmology has seen tensions disappear when measurements improved.
          </p>

          <p style={paragraphStyle}>
            <strong>6. A second survey that did not follow.</strong> The Dark Energy Survey’s Year 6 result, {desNla.value} or {desTatt.value} for its
            two versions, is still below the prediction: {two(desSigma)} and {two(tensionSigma(desTatt, early))} sigma with the simple sigma here, and the
            paper’s own comparison gives {desNla.paperSigma} and {desTatt.paperSigma}. A review published in February 2026
            looked at many measurements and concluded that survey-specific systematic effects, mistakes or limits particular to each survey,
            contribute substantially to the disagreements, while physics beyond the standard model remains possible. So the DES result may be a
            measurement problem of its own, or it may be telling us something. Nobody can yet say.
          </p>

          <p style={paragraphStyle}>
            <strong>7. Why the status is Contested.</strong> The data are real. Two careful surveys, with different telescopes and different
            teams, now give different answers. The fact that the first tension went away does not tell us whether the second will. And no result here
            reaches the 5 sigma bar for a discovery. As of October 2026, the question of whether the universe is as lumpy as the microwave background
            predicts is still open.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw a few published measurements, compared with a microwave-background
            prediction using a simple sigma, and the papers’ own figures beside it. What this experiment did not show is which survey is right, what
            made KiDS’s value rise, or why DES’s did not. Other surveys and other methods (such as counting clusters of galaxies) also measure
            lumpiness, and the 2026 review compares them; this experiment names none of their values. A tension is a puzzle, not yet a discovery, and one
            resolved tension does not settle the others.
          </p>
        </div>
      )}
    </div>
  )
}
