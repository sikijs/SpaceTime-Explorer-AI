import { useState } from 'react'
import {
  FALL_CHOICES,
  PASS_CHOICES,
  PUBLISHED_2025,
  PUBLISHED_2026,
  MERGER_DISTANCE_KPC,
  SIDEWAYS_SPEED_2025_KM_S,
  SIDEWAYS_SPEED_2026_KM_S,
  SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S,
  APPROACH_SPEED_KM_S,
  APPROACH_SPEED_ALTERNATIVE_KM_S,
  distanceKpc,
  exampleSteps,
  fallAnswer,
  fallGuessResult,
  passAnswer,
  passGuessResult,
  resultsCheckUp,
  tutorFigures,
} from '../physics/localGroupCollision'
import type { FallChoiceId, PassChoiceId } from '../physics/localGroupCollision'

// Cosmic Horizons, Experiment 25: Part 4, the tutor. Wording approved by the owner (CLAUDE.md §28.1) from the Step 7 draft. Observe, compare with the predictions, one conceptual
// question, then the explanation. Every number comes from the physics module (localGroupCollision.ts), never typed in by hand (CLAUDE.md §9), except the everyday illustrations
// (a ball dropped from a tower, a skater pulling in her arms, a ball on a string). The predictions are marked only in the explanation (CLAUDE.md §12, §13).

const TRIAL_BUTTON_ROUNDED_KM_S = 47 // the Part 2 button that stands for the 2026 value, 46.7 km/s

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LocalGroupCollisionTutorProps {
  fallPrediction: FallChoiceId
  passPrediction: PassChoiceId
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

export function LocalGroupCollisionTutor({ fallPrediction, passPrediction, onExplained }: LocalGroupCollisionTutorProps) {
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
  const c = resultsCheckUp()
  const s = exampleSteps()
  const t = tutorFigures()
  const sideways2026 = n1(SIDEWAYS_SPEED_2026_KM_S)
  const trialPasses = t.firstPassForTrialKpc
  const fallResult = fallGuessResult(fallPrediction)
  const passResult = passGuessResult(passPrediction)
  const fallGuessLabel = FALL_CHOICES.find((x) => x.id === fallPrediction)!.label
  const fallAnswerLabel = FALL_CHOICES.find((x) => x.id === fallAnswer())!.label
  const passGuessLabel = PASS_CHOICES.find((x) => x.id === passPrediction)!.label
  const passAnswerLabel = PASS_CHOICES.find((x) => x.id === passAnswer())!.label

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>. Find the ruler of times and the two marks on it, the pink one and the violet one. Which is the longer time? Now look at <strong>Picture 2, panel A</strong>. Follow the cyan path from Andromeda’s
                starting point. Does it run straight at the Milky Way, or does it curve? Where does it come closest, compared with the small dashed ring?
              </p>
              <p style={paragraphStyle}>
                Then look at <strong>panel B</strong>, the cyan curve. As the sideways speed goes up along the bottom, what happens to the first-pass distance up the side?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white mark with the box “YOUR GUESS” on the ruler in Picture 1</strong> is Prediction 1, the straight-fall time. How does it sit beside the pink and violet marks?
                </li>
                <li>
                  <strong>The white dashed line with the box “YOUR GUESS” in Picture 2, panel B</strong> is Prediction 2, the first-pass distance for {sideways2026} km/s. How does it sit beside the cyan dot, and beside the dashed {MERGER_DISTANCE_KPC} kpc line?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the rows “Straight fall” and “First pass for {sideways2026} km/s”) and <strong>Table 2</strong> (the row “First pass”). Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to
                hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose Andromeda’s sideways speed were <strong>twice</strong> as big. Would the first pass be about twice as far away, less than twice as far, or more than twice as far? Think about what a sideways speed does to a falling
                galaxy, and tell me why you think so.
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{fallGuessLabel}</em>. The calculated straight fall in Table 1 is <em>{n2(c.straightFallGyr)} billion years</em>, so the nearest answer is <em>{fallAnswerLabel}</em>.{' '}
            {fallResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} The simple “distance ÷ speed” time is {n2(c.constantSpeedGyr)} billion years, which is not the answer. For Prediction 2 you answered <em>{passGuessLabel}</em>. The calculated first
            pass for {sideways2026} km/s in Table 1 is <em>{n1(c.firstPass2026Kpc)} kpc</em>, so the nearest answer is <em>{passAnswerLabel}</em>. {passResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both numbers are calculated here, for two points
            that pull on each other. They are not measurements.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why a straight fall is shorter than distance ÷ speed.</strong> Think of a ball dropped from a tower. It starts slowly and speeds up the whole way, so it lands sooner than if it had kept its first speed. Andromeda is the same. It is {commas(distanceKpc())} kpc away and moving at{' '}
            {APPROACH_SPEED_KM_S} km/s now, and {commas(distanceKpc())} kpc ÷ {APPROACH_SPEED_KM_S} km/s is {n2(c.constantSpeedGyr)} billion years, but only if the speed never changed. The pull gets stronger as the galaxies get closer, so the speed keeps rising and the real fall takes{' '}
            {n2(c.straightFallGyr)} billion years, {n2(c.fallRatio)} times as long.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why a sideways speed makes a loop, and what sets the first pass.</strong> A sideways speed carries a “turning amount” (angular momentum) that gravity cannot remove. For {sideways2026} km/s it is {n1(distanceKpc())} × {sideways2026} = {commas(t.angularMomentum)} kpc·km/s. Think of a
            skater pulling in her arms, or a ball swung on a string and shortened: the closer in it gets, the faster it goes round. For the galaxies to meet head-on, that sideways motion would have to shrink to zero, so they swing past instead. At the closest point, the speed is{' '}
            {commas(t.angularMomentum)} ÷ {n1(c.firstPass2026Kpc)} = about {commas(t.speedAtFirstPassKmS)} km/s, nearly all of it sideways. The first pass depends strongly on the sideways speed. From Picture 2, panel B: 0 km/s gives a head-on fall,{' '}
            {trialPasses.slice(1).map((x, i, a) => (
              <span key={x.sidewaysKmS}>
                {x.sidewaysKmS} km/s{x.sidewaysKmS === TRIAL_BUTTON_ROUNDED_KM_S ? ' (the button’s rounded value of ' + sideways2026 + ')' : ''} gives {n1(x.firstPassKpc)} kpc{i < a.length - 1 ? (i === a.length - 2 ? ' and ' : ', ') : ''}
              </span>
            ))}
            . So doubling the sideways speed, from {n1(t.halfSidewaysKmS)} to {sideways2026} km/s, more than doubles the first pass, from {n1(t.firstPassAtHalfKpc)} to {n1(t.firstPassAtFullKpc)} kpc, about {n1(t.doublingRatio)} times. (The first pass goes roughly as the sideways speed squared,
            because the turning amount enters squared in p = L² ÷ GM, which is {n1(s.p)} kpc here.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why a close first pass is not yet a merger.</strong> The {n1(c.firstPass2026Kpc)} kpc first pass is outside the {MERGER_DISTANCE_KPC} kpc ring that both studies use to call a merger. Without friction, the pair would swing out to {commas(t.farthest2026Kpc)} kpc and come back every{' '}
            {n1(t.period2026Gyr)} billion years. The studies also include dynamical friction, a drag that a galaxy feels as it moves through another’s halo. It slows them and lets them settle together on later passes. That may be part of why the 2026 study’s median merger time,{' '}
            {PUBLISHED_2026.medianMergerTimeGyr} billion years (range {n1(c.medianLowGyr)} to {n1(c.medianHighGyr)}), is later than the {n2(c.firstPass2026Gyr)} billion years of this model’s first pass. This page does not model friction or compute a merger.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the two studies differ, and how little it takes.</strong> The 2025 study used about {SIDEWAYS_SPEED_2025_KM_S} km/s and the 2026 study {sideways2026} ± {n1(SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S)} km/s. The 2026 give-or-take ({n1(c.rangeLowKmS)} to {n1(c.rangeHighKmS)} km/s) gives first
            passes from {n1(t.firstPassForRange.low)} to {n1(t.firstPassForRange.high)} kpc. A sideways speed of {n1(c.sidewaysFor20Kpc)} km/s gives exactly {MERGER_DISTANCE_KPC} kpc, and that is inside the 2026 range but far below {SIDEWAYS_SPEED_2025_KM_S}. That may be one reason a study with a sideways speed
            near {SIDEWAYS_SPEED_2025_KM_S} finds about {PUBLISHED_2025.mergerPercentWithin10Gyr} percent merging within 10 billion years, and one with a range that reaches down to {Math.round(c.sidewaysFor20Kpc)} finds about {PUBLISHED_2026.mergerPercent} percent. The studies also treat the Large Magellanic Cloud
            differently. I am not saying which study is right.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What the model leaves out, and how sure we are.</strong> It uses two points and Newton’s gravity alone. It leaves out M33, the Large Magellanic Cloud, the halos’ size and friction. It also does not draw the thousands of random trial runs that give the studies’ percentages. What is strong
            evidence is that Andromeda is approaching. What is contested is whether the pair merge within 10 billion years. What is open is Andromeda’s real sideways motion, which Gaia’s next release (planned for December 2, 2026) may narrow. The papers do not say in which frame their sideways speeds are given,
            and the approach speed of {APPROACH_SPEED_KM_S} km/s is rounded from the literature ({APPROACH_SPEED_ALTERNATIVE_KM_S} with the 2026 study’s own solar motion). No paper was read in full for this page, so check any number you want to rely on against its source.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>6. What was shown, and what was not.</strong> You saw that a straight fall takes {n2(c.straightFallGyr)} billion years, that a sideways speed of {sideways2026} km/s gives a first pass of {n1(c.firstPass2026Kpc)} kpc, and that the first pass changes a lot as the sideways speed changes. You did
            not see a merger, a probability or the effect of other galaxies. Try the settings in Part 2 if you like: the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
