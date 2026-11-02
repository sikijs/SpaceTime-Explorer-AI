import { useState } from 'react'
import {
  DIFFERENCE_ANSWER_CHOICES,
  MEASURED_SPEED_KM_S,
  MICROWAVE_TEMPERATURE_K,
  PLANCK_DIPOLE_AMPLITUDE_UK,
  QUASAR_EXPECTED_AMPLITUDE,
  QUASAR_OBSERVED_AMPLITUDE,
  QUASAR_SIGNIFICANCE,
  SPEED_ANSWER_CHOICES,
  SPEED_OF_LIGHT_KM_S,
  differenceGuessResult,
  predictionOneAnswerId,
  predictionTwoAnswerId,
  speedGuessResult,
  trialFigures,
  tutorFigures,
} from '../physics/microwaveDipole'

// Evidence and Imagination, Experiment 7: Part 4, the tutor. The wording is Claude's DRAFT of 2026-11-02, for the owner's approval (CLAUDE.md §28.1). Observe, compare with the predictions, one
// conceptual question, then the explanation. Every number comes from the physics module (microwaveDipole.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation
// (CLAUDE.md §12, §13). The tutor does not claim more than the sources read show, and says which statements are not checked at a source.
// Unsourced here: the wading-into-the-sea and train-platform comparisons; that shifting every frequency of a glow by the same fraction looks like a glow warmer by that fraction (the 2025 review's equation 13 is
// consistent with it; the page did not derive it); that the speed is a speed relative to a convenient frame and not a true rest (the Relativity chapter's own teaching, not a source read for this page); and the
// statement that a result is stronger when two routes agree. From a source read: the rule T = T0 √(1 − β²) ÷ (1 − β cos θ) (the review's equation 13); the speed 369.82 ± 0.11 km/s and T0 = 2.72548 K (the review);
// the amplitude 3362.08 ± 0.64 µK (NASA's table); the quasar figures and "either the rest frames in which matter and radiation appear isotropic are not the same, or … an unexpected intrinsic anisotropy in at least one of them" (the 2025
// review's abstract); and the 2026 reanalysis's "cannot be explained solely by the clustering dipole or mode coupling from the survey mask" (its abstract).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface MicrowaveDipoleTutorProps {
  differenceGuess: string
  speedGuess: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const k5 = (x: number) => x.toFixed(5)
const k6 = (x: number) => x.toFixed(6)
const lowerFirst = (w: string) => w.charAt(0).toLowerCase() + w.slice(1)
const km = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 2 })

export function MicrowaveDipoleTutor({ differenceGuess, speedGuess, onExplained }: MicrowaveDipoleTutorProps) {
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

  const t = tutorFigures()
  const r = t.real
  const c = t.check
  const differenceGuessLabel = lowerFirst(DIFFERENCE_ANSWER_CHOICES.find((x) => x.id === differenceGuess)!.label)
  const differenceAnswerLabel = lowerFirst(DIFFERENCE_ANSWER_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label)
  const speedGuessLabel = lowerFirst(SPEED_ANSWER_CHOICES.find((x) => x.id === speedGuess)!.label)
  const speedAnswerLabel = lowerFirst(SPEED_ANSWER_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label)
  const differenceResult = differenceGuessResult(differenceGuess)
  const speedResult = speedGuessResult(speedGuess)
  const light = Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')
  const fast = trialFigures(3000, 0)
  const low26 = Math.min(...QUASAR_SIGNIFICANCE.bashir2026)
  const high26 = Math.max(...QUASAR_SIGNIFICANCE.bashir2026)
  const amplitudeK = PLANCK_DIPOLE_AMPLITUDE_UK.value / 1000000

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 1, Part C</strong>: the dartboard-style disk of the whole sky, and its colour bar. Then look at <strong>Picture 2</strong>: the two rulers. Last, look at <strong>Picture 3</strong>: the quasar dipole’s size against the expected size, the two directions, and the three rows of σ. What do you notice about which direction is warmest, about how big the difference is
                beside the average temperature, and about whether the quasars’ dipole is the size that was expected?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white diamond and the box “YOUR GUESS” in Picture 2, Part A</strong> is your guess for the difference between the temperature straight ahead and straight behind. How does it sit beside the cyan dot on the same ruler?
                </li>
                <li>
                  <strong>The white diamond in Picture 2, Part B</strong> is your guess for the Solar System’s speed relative to the glow. How does it sit beside the green dot, and beside the Earth’s dot and the note about light?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the first row, and <strong>Table 2</strong>, steps 7 and 9. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I would like you to look first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose the Solar System were moving <strong>twice as fast</strong> relative to the glow: {km(t.doubleSpeedKmS)} km/s instead of {km(MEASURED_SPEED_KM_S)} km/s. Would the difference between the temperature straight ahead and straight behind then be about <strong>half</strong> as big, <strong>the same</strong>, about <strong>twice</strong> as big, or about{' '}
                <strong>four times</strong> as big? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure. The trial speeds in Drawing A may help.</p>
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{differenceGuessLabel}</em> for the difference between straight ahead and straight behind. The difference worked out on this page is {k5(r.aheadMinusBehindK)} K, nearest to <em>{differenceAnswerLabel}</em>, so{' '}
            {differenceResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you answered <em>{speedGuessLabel}</em> for the Solar System’s speed relative to the glow. The measured speed is {km(MEASURED_SPEED_KM_S)} km/s, nearest to <em>{speedAnswerLabel}</em>, so{' '}
            {speedResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} The first number is calculated here from the measured speed, and the second is a published measurement.
          </p>
          <p style={paragraphStyle}>
            <strong>1. The answer to the question.</strong> Is the microwave sky equally warm in every direction? Almost, but not quite. Straight ahead it is {k6(r.aheadK)} K, straight behind it is {k6(r.behindK)} K, and sideways it is about the average, {MICROWAVE_TEMPERATURE_K} K. The difference between straight ahead and straight behind is {n2(r.aheadMinusBehindK * 1000)} mK, only about 1 part in {Math.round(t.differenceOneInParts)} of the glow’s
            temperature. This warm-and-cool pattern is the dipole. It is tiny, which is why it took a satellite such as Planck to measure it so well.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why a moving observer sees it.</strong> Two ideas from the introduction fit together. First, light from something hotter has a higher frequency. Second, if you move toward a source of light you meet its waves more often, so you measure a higher frequency. Think of wading into the sea: you meet more waves each minute when you walk into them than when you walk away from them. The glow is made of waves of many frequencies. An observer who is moving
            toward one part of the sky meets all of those waves a little more often, so every frequency from that part of the sky is raised by the same small fraction. Light with every frequency raised by the same fraction looks like the glow of something warmer by that same fraction. The 2025 review that this page read gives the exact rule, T = T₀ × √(1 − β²) ÷ (1 − β cos θ), which is the rule of Experiment 8 written for temperature. This page did not derive it.
          </p>
          <p style={paragraphStyle}>
            <strong>A worked count.</strong> The speed as a fraction of the speed of light, β, is {km(MEASURED_SPEED_KM_S)} ÷ {light} = {t.beta.toFixed(7)}. Straight ahead the glow is warmer by that fraction: {MICROWAVE_TEMPERATURE_K} × (1 + {t.beta.toFixed(7)}) = {t.simpleAheadK.toFixed(4)} K. Straight behind it is cooler by the same fraction: {MICROWAVE_TEMPERATURE_K} × (1 − {t.beta.toFixed(7)}) = {t.simpleBehindK.toFixed(4)} K. The page draws the exact rule, which differs from this simple count by only about {t.exactMinusSimpleAheadK.toFixed(6)} K. Sideways you are neither moving toward the waves nor
            away from them, so the temperature is about the average.
          </p>
          <p style={paragraphStyle}>
            <strong>3. From the pattern to the speed.</strong> Now run it backwards. Planck measured how far the warmest spot is above the average: {PLANCK_DIPOLE_AMPLITUDE_UK.value} µK, which is {amplitudeK.toFixed(8)} K. Divide by the average temperature: {amplitudeK.toFixed(8)} ÷ {MICROWAVE_TEMPERATURE_K} = {t.beta.toFixed(7)}. Multiply by the speed of light: {t.beta.toFixed(7)} × {light} km/s = {n2(t.planckSpeedKmS)} km/s. That is about {n1(t.timesEarthSpeed)} times the Earth’s speed round the
            Sun, and only {n2(t.percentOfLightSpeed)} percent of the speed of light. It is like working out how fast a car is going from how much higher its horn sounds as it comes toward you.
          </p>
          <p style={paragraphStyle}>
            <strong>4. “Relative to the glow”.</strong> A speed is always a speed relative to something. A train passing a platform at 100 km/h is moving at 100 km/h relative to the platform, and the platform is moving at 100 km/h the other way relative to the train. Neither is the “true” state of rest. In the same way, {km(MEASURED_SPEED_KM_S)} km/s is the Solar System’s speed relative to the glow’s own frame, which is a convenient reference, as the platform is for the train. It does not make the glow’s frame a special place in space, and nothing in the Relativity chapter changes: every
            frame is just as valid. In the glow’s own frame the glow looks the same in every direction, on average, and the dipole tells us how fast the Solar System’s frame is moving compared with that one.
          </p>
          <p style={paragraphStyle}>
            <strong>5. About the question you were asked.</strong> With twice the speed, {km(t.doubleSpeedKmS)} km/s, the difference would be about <strong>twice</strong> as big: {n2(t.doubleSpeedDifferenceOverReal)} times the real one. Twice the speed means twice the fraction β, so straight ahead is warmer by twice as much and straight behind cooler by twice as much, and the difference doubles. Drawing A showed the same thing: a trial speed of 3,000 km/s is {n2(fast.speedOverReal)} times the measured speed, and the difference came out {n2(fast.differenceOverReal)} times the real one.
          </p>
          <p style={paragraphStyle}>
            <strong>6. The second test, and why it matters.</strong> If the microwave pattern really comes from the Solar System’s motion, then the distant objects of the sky should show the same motion in their own way: a few more quasars should be counted on the side we are moving toward, in the same direction, by an amount that can be calculated. In science a result is stronger when two different routes agree. Here they agree in direction, {n2(c.direction.separationDegrees)}° apart, but the counted size, {QUASAR_OBSERVED_AMPLITUDE}, is {n2(c.quasarSize.timesExpected)} times the expected
            {' '}{QUASAR_EXPECTED_AMPLITUDE}. The 2021 paper gives {QUASAR_SIGNIFICANCE.secrest2021}σ, a 2025 review says “now exceeds 5σ”, and a 2026 reanalysis of the same quasars gives {low26}σ to {high26}σ, and says that the difference “cannot be explained solely by the clustering dipole or mode coupling from the survey mask” (in plain words: not just by the quasars’ own bunching, and not just by gaps in the part of the sky that was surveyed). The 2025 review says that either the rest frames in which matter and radiation look the same in every direction are not the same, or there is an unexpected lopsidedness in at least one of them. This page cannot say which, if either, is right, and it does not choose
            between the three analyses. That is why this part is called Contested.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What is settled, and what this page does not show.</strong> That the microwave sky has a warm side and a cool side, matching a Solar System moving at about {Math.round(MEASURED_SPEED_KM_S)} km/s relative to the glow’s frame, has been measured again and again: NASA’s table lists five analyses, from 1996 to 2021, and two of them agree within their give-or-takes (Table 1). That is the Settled part. This page read NASA’s table, the start of the 2025 review and the abstracts of the quasar papers, and the 2021 paper’s numbers through a converted web copy; it did not
            read the Planck papers or any paper in full. It does not show what set the Solar System moving, the glow’s much smaller ripples, the small yearly change as the Earth goes round the Sun, or the older measurements in NASA’s table. So it shows the idea and the size of the effect, not the papers’ full analysis.
          </p>
        </div>
      )}
    </div>
  )
}
