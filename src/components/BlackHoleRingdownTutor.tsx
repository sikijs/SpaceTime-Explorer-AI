import { useState } from 'react'
import { checkUp, FASTER_SPIN, GW250114_RINGDOWN, pitchGuessResult, ringingWorked, SECOND_TONE_SIGNIFICANCE, swingsGuessGap, trialRinging } from '../physics/blackHoleRingdown'
import { GW250114 } from '../physics/horizonAreaLaw'
import type { PitchChoice, SwingsChoice } from '../physics/blackHoleRingdown'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleRingdownTutorProps {
  pitchPrediction: PitchChoice
  swingsPrediction: SwingsChoice
  onExplained?: () => void
}

const pitchWords: Record<PitchChoice, string> = { lower: 'a lower pitch', same: 'about the same pitch', higher: 'a higher pitch' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

function fmt(hz: number): string {
  return Math.round(hz).toLocaleString('en-US')
}
function one(n: number): string {
  return n.toFixed(1)
}
function two(n: number): string {
  return n.toFixed(2)
}

// The tutor of Cosmic Horizons Experiment 19. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (blackHoleRingdown.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say that
// GW250114 "proves" general relativity, does not give the second tone's numbers as settled, and does not derive the published formula.
export function BlackHoleRingdownTutor({ pitchPrediction, swingsPrediction, onExplained }: BlackHoleRingdownTutorProps) {
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

  // Every number below is computed from the module.
  const w = ringingWorked()
  const pr = pitchGuessResult(pitchPrediction)
  const sg = swingsGuessGap(swingsPrediction)
  const cu = checkUp()
  const fast = trialRinging(GW250114_RINGDOWN.finalMassSolar, FASTER_SPIN)
  const real = trialRinging(GW250114_RINGDOWN.finalMassSolar, GW250114_RINGDOWN.finalSpin)
  const pitchGiveOrTakePercent = ((cu.pitch.high! - cu.pitch.low!) / 2 / cu.pitch.measured) * 100
  const fadeGiveOrTakePercent = ((cu.fadeTime.high! - cu.fadeTime.low!) / 2 / cu.fadeTime.measured) * 100

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
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, panel A, the blue wavy line. Count how many full swings you see before it has almost died away. Then
                look at panel B: how long is the green bar, and where does it sit on the scale?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>. Find the green dot and the pink dot. Which one is higher up the pitch scale, and what is different about the two black holes they stand for?
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
                  <strong>The white bar and the box “YOUR GUESS”</strong> in panel B of Picture 1 are your guess for Prediction 2. How does the white bar compare with the green bar?
                </li>
                <li>
                  <strong>The white arrow</strong> in Picture 2 is your guess for Prediction 1. It is only a marker for a direction, with no size. Where does it point, compared with where the pink dot sits
                  from the green dot?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the row “Swings in one fade time”) and <strong>Table 2</strong> (the rows for spin {GW250114_RINGDOWN.finalSpin} and spin {FASTER_SPIN}), which have the numbers for both
                predictions. Did anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Imagine a bell-maker whose plan says that a bell of a certain size and shape should ring at 200 hertz. You strike it, and it rings at 300.
                What would you conclude? That is an everyday comparison, not black-hole physics.
              </p>
              <p style={paragraphStyle}>
                Now the black hole. General relativity says that a settled black hole’s pitch and fade time are fixed by its mass and spin, and by nothing else. The teams found the mass and spin from the part
                of the signal before the ringing, and then measured the ringing. Suppose the ringing had come out at a different pitch from the one that the mass and spin should give. What do you think that
                could have meant? Make a guess, even if you are not sure.
              </p>
            </>
          )}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{pitchWords[pitchPrediction]}</em> for the faster spin.
            The calculated pitch is {fmt(pr.slowHz)} Hz at spin {GW250114_RINGDOWN.finalSpin} and {fmt(pr.fastHz)} Hz at spin {FASTER_SPIN}, which is {two(pr.ratio)} times as high, so the real answer is <em>{pitchWords[pr.real]}</em>.{' '}
            {pr.matched ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered: <em>about {swingsPrediction} {swingsPrediction === 1 ? 'swing' : 'swings'}</em>. The real number is{' '}
            {two(sg.realSwings)} swings, so the nearest answer is <em>about {sg.nearest} {sg.nearest === 1 ? 'swing' : 'swings'}</em>. {sg.matched ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sg.verdict === 'below' && ` The real number is ${two(sg.times)} times your answer.`}
            {sg.verdict === 'above' && ` Your answer is ${two(sg.times)} times the real number.`} Keep in mind that this is one event, and that the numbers rest on a published formula that is good to a few percent.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What sets the pitch.</strong> A settled black hole is described by two numbers only, its mass and its spin. That leaves it one natural unit of time, set by its mass: GM/c³, the time that light takes to cross
            a length of GM/c² (the length that is half of the horizon radius in Black Holes Experiment 1). For {w.massSolar} Suns that unit is {two(w.lightCrossingTimeMs)} ms. The formula says that at spin {w.spin} one swing lasts {one(w.swingInLightCrossingTimes)} of those
            units: {one(w.swingInLightCrossingTimes)} × {w.lightCrossingTimeMs.toFixed(3)} ms = {two(w.periodMs)} ms, which is a pitch of 1 ÷ {(w.periodMs / 1000).toFixed(6)} s = {fmt(w.frequencyHz)} Hz. (The {one(w.swingInLightCrossingTimes)} is 2π ÷ {w.dimensionlessPitch.toFixed(3)}, where {w.dimensionlessPitch.toFixed(3)} is the number that the
            published formula gives for a spin of {w.spin}.) Double the mass and the unit doubles, to {two(w.doubledMassLightCrossingTimeMs)} ms, so every swing takes twice as long and the pitch halves, to {fmt(w.doubledMassFrequencyHz)} Hz. That is the sense in which a bigger black hole rings lower, like a
            bigger bell. The step from “only two numbers” to “only this one unit of time” is a general argument and was not checked against a source for this page.
          </p>
          <p style={paragraphStyle}>
            <strong>2. What the spin does.</strong> The spin changes the number in the formula, and with it the pitch and how long the ringing lasts. At spin {FASTER_SPIN} the same {w.massSolar} Suns would ring at {fmt(fast.frequencyHz)} Hz, {two(fast.pitchOverReal)} times the pitch at spin {w.spin}, and it would take {one(fast.swingsToFade)} swings to fade
            to a third, against {one(real.swingsToFade)} at spin {w.spin}. So the number of swings depends on the spin alone and not on the mass, while the pitch depends on both. That is why, in principle, a measured pitch and a measured fade time together tell you both the mass and the spin.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the ringing is over so soon.</strong> How many swings the ringing lasts is set by a number called the quality factor, Q. The formula gives a Q of {two(w.quality)} at spin {w.spin}, and the ringing falls to a third of its size after Q ÷ π = {two(w.quality)} ÷ {Math.PI.toFixed(2)} = {two(w.swingsToFade)} swings. A struck bell
            rings for very many swings before it fades, so a black hole is a very dull bell. This was shown in Picture 1, where the wave is nearly gone after about one swing. This is a calculation, and the real ringing is recorded for only a short stretch.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the detectors saw {fmt(w.detectedFrequencyHz)} Hz and not {fmt(w.frequencyHz)} Hz.</strong> The pitch of {fmt(w.frequencyHz)} Hz is the black hole’s own. The signal had been travelling for about {GW250114.distanceBillionLightYears} billion light-years, while space itself expanded (Cosmology Experiment 1), and that stretched it by a factor of{' '}
            {two(w.stretch)}. Think of a record played a little too slowly: every swing takes longer and the pitch drops, but the number of swings does not change. So the detectors recorded a swing of {w.periodMs.toFixed(2)} × {two(w.stretch)} = {two(w.detectedPeriodMs)} ms, which is {fmt(w.detectedFrequencyHz)} Hz. Picture 1 is drawn this way so
            that it can be compared with the measurement. Pictures 2 and 3 are drawn before the stretch so that black holes can be compared with one another.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What the comparison tested.</strong> The mass and spin of the black hole after the merger were found from the earlier part of the signal. The formula turns them into an expected pitch and fade time: {one(cu.pitch.calculated)} Hz and {two(cu.fadeTime.calculated)} ms at the detectors. The ringing itself was
            then measured, separately: {one(cu.pitch.measured)} Hz and {two(cu.fadeTime.measured)} ms. They agree: the measured pitch is {one(Math.abs(cu.pitch.percent))} percent {cu.pitch.percent >= 0 ? 'above' : 'below'} the expected one and the fade time {one(Math.abs(cu.fadeTime.percent))} percent{' '}
            {cu.fadeTime.percent >= 0 ? 'above' : 'below'}, and each expected value lies inside the measured give-or-take. If the pitch had come out differently, that could have meant that something about the black hole other than its mass and spin matters, or that the theory is not complete, or that the
            mass and spin, or the ringing, had been measured wrongly. A bell that rings at 300 hertz instead of the planned 200 would raise the same kind of question. Here the main tone passed the test.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How sure we are.</strong> The measured pitch has a give-or-take of about {pitchGiveOrTakePercent.toFixed(0)} percent and the fade time of about {fadeGiveOrTakePercent.toFixed(0)} percent, so the test cannot see a difference smaller than that. The formula is itself good only to a few percent, so
            agreement to {one(Math.abs(cu.pitch.percent))} percent does not show that the formula is that exact. The mass and spin have give-or-takes of their own that this page does not combine. The second, faster-fading tone is weaker evidence: the teams report that it matches to tens of percent, and one 2026 analysis puts the
            chance that it is there at {SECOND_TONE_SIGNIFICANCE.earlierPercent} percent with an earlier method and {SECOND_TONE_SIGNIFICANCE.laterPercent} percent with a newer one. And it is one event, which is why the result is called strong evidence and not settled.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that a black hole rings, that the pitch falls as the mass rises and changes with the spin, that the ringing is over in about {one(w.swingsToFade)} swing, and that for one very clear event the main tone matches what the black hole’s mass and
            spin give, to a few percent. You did not see a new law of nature, a proof that nothing else about a black hole could ever matter (a few percent, and tens of percent for the second tone, leave room for small differences), or a calculation of the second tone. Try the settings in Part 2 again if you like: they show how
            other masses and spins would ring, and the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
