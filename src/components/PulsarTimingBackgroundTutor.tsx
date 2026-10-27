import { useState } from 'react'
import { CYCLE_CHOICES, cycleAnswer, cycleGuessResult, exampleSteps, hellingsDownsRows, pictureOne, pictureTwo, resultsCheckUp, shiftAnswer, shiftGuessResult, trialPicture } from '../physics/pulsarTimingBackground'
import type { CycleChoiceId, ShiftChoice } from '../physics/pulsarTimingBackground'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface PulsarTimingBackgroundTutorProps {
  cyclePrediction: CycleChoiceId
  shiftPrediction: ShiftChoice
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
function thousands(x: number): string {
  return commas(Math.round(x / 1000) * 1000)
}
function signed3(x: number): string {
  return (x < 0 ? '−' : '') + Math.abs(x).toFixed(3)
}

// The tutor of Frontier and Beyond Experiment 22. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "Tutor (Part 4)" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (pulsarTimingBackground.ts), never typed in by hand (CLAUDE.md §9), except the Earth and Neptune years, the clock that gains a second a day and the number of seconds in a day, which are
// everyday illustrations. The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say what makes the background as settled.
export function PulsarTimingBackgroundTutor({ cyclePrediction, shiftPrediction, onExplained }: PulsarTimingBackgroundTutorProps) {
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
  const check = resultsCheckUp()
  const steps = exampleSteps()
  const pic1 = pictureOne()
  const pic2 = pictureTwo()
  const heavier = trialPicture(1e10, 0.01).binary
  const wider = trialPicture(1e9, 0.1).binary
  const hd = hellingsDownsRows()
  const hdLowest = hd.find((r) => r.isLowest)!
  const hdAt = (angle: number) => hd.find((r) => r.angleDegrees === angle)!.value
  const cycleResult = cycleGuessResult(cyclePrediction)
  const shiftResult = shiftGuessResult(shiftPrediction)
  const cycleGuessLabel = CYCLE_CHOICES.find((c) => c.id === cyclePrediction)!.label
  const cycleAnswerLabel = CYCLE_CHOICES.find((c) => c.id === cycleAnswer())!.label
  const sigmaText = (low: number, high: number) => (low === high ? `${low}` : `${low} to ${high}`)

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, panel B. Find the cyan dot (the pair’s wave cycle), the orange bar (LIGO’s waves) and the cyan band (the cycles that 15 years of
                timing can pick out). Which is the longest, and which is the shortest? How far apart are the orange bar and the cyan dot?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>, panel B. Find the cyan dot and its pale band, and the pink line. Which is bigger, and by how much, as far as you can tell from the ruler?
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
                  <strong>The white marker and the box “YOUR GUESS”</strong> in panel B of Picture 1 are your guess for Prediction 1, how long one wave cycle lasts. How does it sit beside the cyan dot?
                </li>
                <li>
                  <strong>The white marker and the box</strong> in panel B of Picture 2 are your guess for Prediction 2, the size of the shift in a pulse’s arrival. How does it sit beside the cyan dot?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the rows “Wave cycle of the example pair” and “Timing shift”) and <strong>Table 2</strong> (the row “Wave cycle”), which have the real numbers for both
                predictions. Did anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose you timed only one pulsar, and its pulses arrived a little early for a while and then a little late. Gravitational waves could do that. What else
                might? And if you could watch many pulsars at once, what would you look for, to decide whether a wave was the cause?
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{cycleGuessLabel}</em>. The calculated wave cycle in Table 1 is{' '}
            <em>{n2(check.cycleYears)} years</em>, so the nearest answer is <em>{cycleAnswerLabel}</em>. {cycleResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you
            answered: <em>about {shiftPrediction} nanoseconds</em>. The calculated shift in Table 1 is <em>{n1(check.shiftNanoseconds)} nanoseconds</em>, so the nearest answer is <em>about {shiftAnswer()} nanoseconds</em>.{' '}
            {shiftResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both real numbers are calculated here, not measured: the first from Kepler’s law, and the second from the published
            strength of the wave with a rough estimate. What the teams measure is the background, not this one pair.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why the wave is so slow.</strong> Two black holes circle each other under their own gravity, and Kepler’s law ties the time for one orbit to how heavy they are and how far apart. Wider means slower, because
            the path is longer and the pull is weaker. Heavier means faster, because a stronger pull needs a faster orbit to balance it. The Earth takes 1 year to go round the Sun, and Neptune, about 30 times farther out,
            takes about 165 years. In Table 2 the pair’s orbit takes {n2(steps.orbitalPeriodYears)} years. Put the black holes ten times farther apart (0.1 parsecs) and it grows to {commas(wider.orbitalPeriodYears)} years. Make each
            ten times heavier instead (10 billion Suns) and it drops to {n2(heavier.orbitalPeriodYears)} years. LIGO’s black holes are a few tens of Suns, not billions, and its waves go through between {pic1.ligo.lowHz} and {pic1.ligo.peakHz} cycles every second, so this pair’s cycle is about{' '}
            {(pic1.pairOverLigoLongest / 1e9).toFixed(1)} to {(pic1.pairOverLigoShortest / 1e9).toFixed(1)} billion times longer than LIGO’s.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why one wave cycle is half an orbit.</strong> Picture two black holes of the same mass as the two ends of a dumbbell, turning round. After half a turn the dumbbell looks exactly as it did before, only
            with its ends swapped, as a ceiling fan with two blades looks the same twice in every turn. The wave comes from the shape of the pair, so it repeats each time the shape repeats: twice per orbit. So the wave cycle is{' '}
            {n2(steps.orbitalPeriodYears)} ÷ 2 = {n2(steps.waveCycleYears)} years, which is {n1(steps.waveFrequencyNanohertz)} nHz. In 15 years that is 15 ÷ {n2(steps.waveCycleYears)} = {n1(steps.cyclesInSpan)} cycles. That is why
            the pair sits inside the cyan band, and why 15 years of timing is long enough to see it go up and down more than once.
          </p>
          <p style={paragraphStyle}>
            <strong>3. How a shift of {n1(check.shiftNanoseconds)} billionths of a second can be seen.</strong> The wave’s strength, {(pic2.strain * 1e15).toFixed(1)} × 10⁻¹⁵, is the fraction by which it stretches and squeezes the
            path. The rough estimate in Picture 2 turns that into a shift: {(pic2.strain * 1e15).toFixed(1)} × 10⁻¹⁵ ÷ (6.28 × {(pic2.referenceFrequencyHz * 1e8).toFixed(1)} × 10⁻⁸) = {n1(pic2.shiftNanoseconds)} × 10⁻⁹ seconds. Compare
            that with the gap between pulses of a millisecond: the shift is about {thousands(pic2.pulsePeriodOverShift)} times smaller. A clock that gains or loses one second in a day is wrong by about one part in 86,400, which is
            the same kind of size. You could not see one second in a day by looking at the clock once. But if you compare it with a perfect clock every day for years, and the error rises and falls in a regular way, you can. The
            pulsars are the clocks, and the years of timing are the comparing. Averaging many pulses also cancels out each pulse’s own random wobble, which is why the teams need so much data.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why many pulsars, and what the Hellings–Downs pattern adds.</strong> A single pulsar can drift early or late for reasons of its own, as you may have said. A gravitational wave, though, passes through the space
            round all the pulsars at once, so it shifts their pulses in a shared way. How much two pulsars’ shifts go together depends on the angle between them in the sky. Table 3 gives the pattern: {hd[0].value.toFixed(1)} for two
            pulsars in the same direction, {signed3(hdLowest.value)} at about {n1(hdLowest.angleDegrees)} degrees (they tend to go opposite ways), {signed3(hdAt(90))} at 90 degrees and {hdAt(180).toFixed(2)} on opposite sides of the sky.
            Think of a crowd murmuring. One person’s cough might be anything. But if people all over the stadium make the same small sound in the same pattern, it is not one person. The pattern comes only from comparing
            pairs of pulsars, which is why one pulsar is never enough. The NANOGrav abstract reports that the correlations it found follow this pattern.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why this is evidence and not yet a discovery.</strong> Sigma says how hard it is to blame a result on chance, and the bigger the number, the harder. NANOGrav reports about {sigmaText(check.arrays[0].sigmaLow, check.arrays[0].sigmaHigh)} sigma,
            and the other arrays report about {sigmaText(check.arrays[1].sigmaLow, check.arrays[1].sigmaHigh)}, {sigmaText(check.arrays[2].sigmaLow, check.arrays[2].sigmaHigh)} and {sigmaText(check.arrays[3].sigmaLow, check.arrays[3].sigmaHigh)} sigma (Table 1). None
            reaches the usual bar of 5 for a discovery. A search that combines 121 pulsars from five arrays also found a significance that stays below 5. That is a real result, because it is hard to blame on chance, but a discovery needs more.
            The teams are combining their data to try to get there, and this page found no announcement of 5 sigma.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What the background is, and is not, known to be.</strong> It is probably the added waves of very many pairs of supermassive black holes, in the way a murmur is the sum of many voices. But that is not proven. The
            NANOGrav abstract says the result is also consistent with new physics in the early universe. This page did not test either explanation, and it does not show any one pair, how many pairs there are, or how they came to be so close.
          </p>
          <p style={paragraphStyle}>
            <strong>7. How sure we are.</strong> That pulsar timing shows a faint background at about 3 to 4 sigma in the best-known data set is strong evidence. What makes it is open. The numbers on this page come from abstracts and
            summaries, no paper was read in full, and the shift is a rough estimate, so check any number you want to rely on against its paper.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw that a pair of supermassive black holes sends out a wave that takes about {n2(steps.waveCycleYears)} years per cycle, about {(pic1.pairOverLigoLongest / 1e9).toFixed(1)} to {(pic1.pairOverLigoShortest / 1e9).toFixed(1)} billion times slower than LIGO’s; that a
            wave like that would shift a pulse’s arrival by about {n1(check.shiftNanoseconds)} billionths of a second; and that the evidence for such a background is at about 3 to 4 sigma, not yet 5. You did not see a single pair, the
            pulsars’ own data, or a confirmed discovery. Try the settings in Part 2 again if you like: they show how other pairs would sound, and the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
