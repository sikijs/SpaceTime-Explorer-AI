import { useState } from 'react'
import {
  chanceOfAtLeastOne,
  DES_RECALIBRATION,
  distanceRange,
  oneSidedChance,
  PUBLISHED_SIGMAS,
  recalibrationEffect,
  runEvolvingDarkEnergy,
} from '../physics/evolvingDarkEnergy'
import type { DarkEnergyFit, DistanceRange, RecalibrationEffect } from '../physics/evolvingDarkEnergy'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EvolvingDarkEnergyTutorProps {
  fit: DarkEnergyFit
  distancePrediction: DistanceRange
  recalibrationPrediction: RecalibrationEffect
  onExplained?: () => void
}

const distanceWords: Record<DistanceRange, string> = {
  under05: 'less than 0.5 percent',
  between05and2: 'between 0.5 and 2 percent',
  between2and5: 'between 2 and 5 percent',
  over5: 'more than 5 percent',
}
const recalibrationWords: Record<RecalibrationEffect, string> = {
  weaker: 'weaker',
  same: 'about the same',
  stronger: 'stronger',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 2. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI
// Tutor Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded.
// Every number comes from the physics module (evolvingDarkEnergy.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in
// the explanation (the owner's choice for the group), never before it. The wording about DESI's July 2026 analysis follows its release page and
// the abstract of arXiv:2607.27410, and the wording about the recalibration follows the abstract of arXiv:2511.07517.
export function EvolvingDarkEnergyTutor({ fit, distancePrediction, recalibrationPrediction, onExplained }: EvolvingDarkEnergyTutorProps) {
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
  const one = (value: number) => value.toFixed(1)
  const published = (value: number) => String(value).replace('-', '−')

  // The tutor always talks about z = 0.5, the redshift Prediction 1 names, whatever the learner chose with "How far back?".
  const atHalf = runEvolvingDarkEnergy(fit, 0.5).atChosenRedshift
  const distanceSize = Math.abs(atHalf.distanceDifferencePercent)
  const actualRange = distanceRange(atHalf.distanceDifferencePercent)
  const densityPercent = Math.abs((atHalf.densityRatio - 1) * 100)
  const actualRecalibration = recalibrationEffect()
  const sigmaOf = (name: string) => PUBLISHED_SIGMAS.find((p) => p.name === name)!.sigma
  const chance3 = oneSidedChance(3)
  const chance5 = oneSidedChance(5)
  const hundredTeams = chanceOfAtLeastOne(chance3, 100)

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
              'Look at Pictures 1 and 2. What do you notice about how far the orange line is from the grey line in Picture 1, and how far it is from the grey line in Picture 2?'}
            {tutorStep === 'compare' &&
              `You predicted that the distance to a galaxy at redshift 0.5 would be ${distanceWords[distancePrediction]} different, and that the recalibration of the Dark Energy Survey’s supernovae would make the preference ${recalibrationWords[recalibrationPrediction]}. Look at Picture 2 and Picture 3 again. Is there anything that surprises you? I will say how each prediction compared once you have thought about it.`}
            {tutorStep === 'conceptual' &&
              'Suppose you were a scientist looking at these results. What would you want to see before you called this a discovery that dark energy changes?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted
            that, with {fit.name}, the distance to a galaxy at redshift 0.5 would be <em>{distanceWords[distancePrediction]}</em> different from the
            constant case. It is {two(distanceSize)} percent {atHalf.distanceDifferencePercent < 0 ? 'nearer' : 'farther'}, which is{' '}
            <em>{distanceWords[actualRange]}</em>. {distancePrediction === actualRange ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            You predicted that the recalibration of the Dark Energy Survey’s supernovae would make the preference{' '}
            <em>{recalibrationWords[recalibrationPrediction]}</em>. It became <em>{recalibrationWords[actualRecalibration]}</em>: from{' '}
            {one(DES_RECALIBRATION.beforeSigma)} sigma to {one(DES_RECALIBRATION.afterSigma)} sigma.{' '}
            {recalibrationPrediction === actualRecalibration ? 'Your prediction matched.' : 'Your prediction did not match.'} Either way, the parts below
            explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> With {fit.name}, the fitted dark energy has w₀ = {published(fit.w0)}{' '}
            and wₐ = {published(fit.wa)}. Back when the universe was two thirds of its present size (redshift 0.5), its density was{' '}
            {three(atHalf.densityRatio)} times today’s: about {Math.round(densityPercent)} percent {atHalf.densityRatio > 1 ? 'more' : 'less'}. That
            is a real change, like the thermostat of the introduction being turned up or down by that much. But the effect on how far away a
            galaxy looks is only {two(distanceSize)} percent, and on how bright a supernova looks only {three(Math.abs(atHalf.magnitudeDifference))}{' '}
            magnitudes.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why a big change in dark energy makes a small change in distance.</strong> A distance is the whole journey of the light
            added up, and dark energy is only part of what shapes that journey: matter pulls too, and today’s dark energy is the same in both
            descriptions. Think of a road trip. If one stretch of the road, a fifth of the trip, were 12 percent slower, the whole trip would be
            only about 0.2 × 12 = 2.4 percent longer, not 12. (This is a rough comparison, not the real calculation, which the computer does
            by adding up the journey in small steps.) That is why, at the same time in the past, the density in Picture 1 moves by a larger percentage than the distance in
            Picture 2 does. It also explains why a survey needs a very large number of supernovae to notice it: a difference of a
            couple of percent is like noticing that a 100-metre track is 98 metres long. You would not feel it walking. You would need a good
            measuring tape and many careful measurements.
          </p>

          <p style={paragraphStyle}>
            <strong>3. A hint, evidence and a discovery.</strong> In Experiment 1 you met the usual bar of 5 sigma. Counting one direction only,
            chance alone gives a result at least 5 sigma away about once in {Math.round(1 / chance5 / 1e5) / 10} million tries. A 3 sigma result is
            far easier for chance to produce: about once in {Math.round(1 / chance3)} tries. That sounds rare, but think of it this way. If 100
            different teams each looked for a hint and chance alone were at work, the chance that at least one of them saw a 3 sigma hint is about{' '}
            {Math.round(hundredTeams * 100)} percent. And science looks in many places at once. This is why a 3 or 4 sigma result is called a hint or
            evidence, not a discovery, and why in particle physics a number of 3 and 4 sigma hints have gone away when more data arrived (CERN
            describes this when it explains the five sigma rule). The published results here run from {one(sigmaOf('Pantheon+'))} to{' '}
            {one(sigmaOf('DES Y5'))} sigma, and none reaches 5.
          </p>

          <p style={paragraphStyle}>
            <strong>4. Why the supernova collection matters.</strong> The galaxy ruler and the microwave background are the same in all three
            fits. Only the supernovae change, and the preference changes with them: {one(sigmaOf('Pantheon+'))} sigma with Pantheon+,{' '}
            {one(sigmaOf('Union3'))} with Union3 and {one(sigmaOf('DES Y5'))} with DES Y5. Each collection was gathered by different telescopes and
            calibrated in a different way, and a small difference in calibration is a small difference in the distances. If a hint depends this
            much on which collection you choose, it is a sign that the calibrations, and not only dark energy, may be playing a part.
          </p>

          <p style={paragraphStyle}>
            <strong>5. The recalibration.</strong> In 2025 the Dark Energy Survey team improved how they calibrate their supernovae. With the new
            calibration, the preference for a changing dark energy fell from {one(DES_RECALIBRATION.beforeSigma)} to{' '}
            {one(DES_RECALIBRATION.afterSigma)} sigma, and the team’s own summary is that it is only a weak preference for evolving dark energy. It
            is like re-checking your ruler and finding that it was a little off: your measurements change, though not necessarily everything
            about them.
          </p>

          <p style={paragraphStyle}>
            <strong>6. A newer result, in July 2026.</strong> DESI studied another map of the early universe: the dark gaps that gas clouds
            leave in the light of very distant quasars (called the <em>Lyman-alpha forest</em>). On its own, DESI says, this new measurement
            agrees with the standard model, a constant dark energy. DESI points out two ways to read that: the hints of a changing dark energy
            may fade away, or a more complex model may be needed to explain all the results at once. When the same team combined the new
            measurement with the other data, they still found a preference for a changing dark energy, now 2.7 sigma with the microwave
            background (it was {one(sigmaOf('DESI + CMB alone'))}) and 3.2 sigma with supernovae too.
          </p>

          <p style={paragraphStyle}>
            <strong>7. Where this leaves us.</strong> The data are real. A changing dark energy fits them a little better than a constant one, by
            amounts that move up and down as the data and the calibrations improve, and none is at the bar for a discovery. Careful scientists read
            the same numbers differently, which is why the status is <strong>Contested</strong>. The next data releases from DESI are expected
            to say more. As of October 2026, nobody can say whether dark energy changes.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw published best-fit values, compared with a constant dark energy that has
            the same amount of matter, and you saw their quoted sigma values. What this experiment did not show is what dark energy is, why it
            might change, or how the fits are made. The two-number description is the simplest curve that fits the data, not a known fact, and the
            far-left part of Picture 1 is where the data reach least.
          </p>
        </div>
      )}
    </div>
  )
}
