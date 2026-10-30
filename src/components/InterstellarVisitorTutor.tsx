import { useState } from 'react'
import {
  ATLAS_3I,
  BEND_CHOICES,
  SPEED_CHOICES,
  bendAnswer,
  bendGuessResult,
  exampleSteps,
  knownObjects,
  pictureTwo,
  resultsCheckUp,
  speedAnswer,
  speedGuessResult,
  trialPicture,
} from '../physics/interstellarVisitor'
import type { BendChoiceId, SpeedChoiceId } from '../physics/interstellarVisitor'

// Cosmic Horizons, Experiment 24: Part 4, the tutor. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "Tutor (Part 4)" and the group's tutor
// pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (interstellarVisitor.ts), never typed in by hand (CLAUDE.md §9), except the comparisons that are everyday illustrations (a ball thrown up, a skateboard in a dip, a ball rolling past a magnet).
// The predictions are marked only in the explanation (the owner's choice for the group). The tutor says what the model shows and what it leaves out; it does not say what the object is.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface InterstellarVisitorTutorProps {
  bendPrediction: BendChoiceId
  speedPrediction: SpeedChoiceId
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

export function InterstellarVisitorTutor({ bendPrediction, speedPrediction, onExplained }: InterstellarVisitorTutorProps) {
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
  const p2 = pictureTwo()
  const known = knownObjects()
  const near = p2.curve[0]
  const slow = trialPicture(26, ATLAS_3I.closestApproachAu)
  const fast = trialPicture(100, ATLAS_3I.closestApproachAu)
  const close = trialPicture(58, 0.3)
  const far = trialPicture(58, 3)
  const bendResult = bendGuessResult(bendPrediction)
  const speedResult = speedGuessResult(speedPrediction)
  const bendGuessLabel = BEND_CHOICES.find((x) => x.id === bendPrediction)!.label
  const bendAnswerLabel = BEND_CHOICES.find((x) => x.id === bendAnswer())!.label
  const speedGuessLabel = SPEED_CHOICES.find((x) => x.id === speedPrediction)!.label
  const speedAnswerLabel = SPEED_CHOICES.find((x) => x.id === speedAnswer())!.label

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>. Follow the cyan line from the bottom of the picture to the top. Does it go round and round the Sun like the grey circles, or does it pass the Sun once? Where is its closest approach compared
                with the orbits of the Earth and Mars?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>. Find the solid cyan line, the speed of 3I/ATLAS, and the dashed cyan line, the escape speed. Which one is higher near the Sun, and which is higher far away? How does the solid line change as you go from left to right?
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
                  <strong>The white line and the box “YOUR GUESS”</strong> in Picture 1 are your guess for Prediction 1, how much the Sun bent the path. How does the angle it makes with the dashed line compare with the angle that the cyan arrow makes?
                </li>
                <li>
                  <strong>The white marker and the box</strong> in Picture 2 are your guess for Prediction 2, how fast it was going at its closest approach. How does it sit beside the cyan dot?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong> (the rows “Total bend” and “Speed at closest approach”), <strong>Table 2</strong> (the same two rows) and <strong>Table 3</strong> (the row for 3I/ATLAS), which have the real numbers for both predictions. Did anything match what you
                expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose a visitor came in much faster than 3I/ATLAS, but passed the Sun at the same closest approach. Would the Sun bend its path more than it bent the path of 3I/ATLAS, less, or the same? Think about what the Sun’s pull does
                to a visitor as it goes by, and tell me why you think so.
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{bendGuessLabel}</em>. The calculated bend in Table 1 is <em>{n1(c.bendDegrees)} degrees</em>, so the nearest answer is{' '}
            <em>{bendAnswerLabel}</em>. {bendResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered: <em>{speedGuessLabel}</em>. The calculated speed at closest approach in Table 1 is <em>{n1(c.speedAtClosestKmS)} km/s</em>, so the
            nearest answer is <em>{speedAnswerLabel}</em>. {speedResult === 'matched' ? 'Your prediction matched.' : 'Your prediction did not match.'} Both real numbers are calculated here from the published eccentricity and closest approach of 3I/ATLAS and the Sun’s gravity. They are not
            measurements of the bend and of the speed themselves, although NASA’s and ESA’s published speeds at closest approach agree with the calculated one.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why a speed above the escape speed means an open path.</strong> Think of the ball thrown up from the ground. Climbing away from the Earth costs it speed all the way, and if it starts too slowly, all its speed is used up before it gets far, and it falls back. If it starts fast
            enough, it still has speed left over when it is far away, and it never comes back. The same bookkeeping works for 3I/ATLAS. At its closest approach it was going {n1(s.speedAtClosestKmS)} km/s, and the escape speed there is {n1(s.escapeSpeedKmS)} km/s, so it was going {n2(c.speedOverEscape)} times as fast as it needed to
            to escape. Climbing out from there uses up exactly the escape speed’s worth of motion, and what is left over is the speed far away. In numbers, working with the squares of the speeds (the energy of motion goes with the square of the speed): {n2(s.speedAtClosestKmS)}² − {n2(s.escapeSpeedKmS)}² = {commas(s.sumOfSquares)} − {commas(s.escapeSpeedSquared)} = {commas(s.speedFarAwaySquared)},
            and the square root of {commas(s.speedFarAwaySquared)} is {n2(s.speedFarAwayKmS)} km/s, which is the speed far away in Table 2 (58.0 km/s to one decimal place). If the visitor had been going slower than the escape speed there, there would have been nothing left over, and it could only have gone round the Sun in a closed path.
            That is why a visitor that arrives from far away with any speed at all is always on an open path: it already has speed left over.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the speed rises on the way in and falls on the way out.</strong> The Sun’s pull speeds up anything that falls towards it, like a skateboarder who rolls down the slope into a dip: fastest at the bottom, and slowing down on the way up the other side. At each distance from the Sun the
            speed is always the same, whether the visitor is going in or out, which is why Picture 2 has one line. For 3I/ATLAS, the speed rises from {n1(s.speedFarAwayKmS)} km/s far away to {n1(s.speedAtClosestKmS)} km/s at its closest approach, {n1(s.speedAtClosestKmS - s.speedFarAwayKmS)} km/s more, or {Math.round(p2.gainShare * 100)} percent,
            and it gives it all back on the way out. If it had come as close as {near.au.toFixed(1)} AU, it would have been going {n1(near.speedKmS)} km/s there. At a given distance the Sun adds the same amount to the square of the speed, whatever the visitor’s speed (at {s.closestApproachAu} AU it adds {commas(s.escapeSpeedSquared)} to the square of the speed in km/s), so a fast visitor’s speed rises by a smaller share than a slow one’s.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why a faster visitor is bent less.</strong> The Sun’s pull turns the path sideways for as long as the visitor is near it. A faster visitor spends less time near the Sun, so the pull has less time to turn it. Think of a ball rolling past a magnet: a slow ball is pulled round, and a fast one whistles
            past with hardly any change of direction. The numbers show it. At the closest approach of 3I/ATLAS, {ATLAS_3I.closestApproachAu} AU, a visitor with a speed far away of 26 km/s would be bent {n1(slow.bendDegrees)} degrees, one with 58 km/s, like 3I/ATLAS, {n1(c.bendDegrees)} degrees, and one with 100 km/s only {n1(fast.bendDegrees)} degrees (Drawing A). The closeness of the pass matters too, because the pull is stronger
            when the visitor is nearer: at 58 km/s, a closest approach of 0.3 AU gives {n1(close.bendDegrees)} degrees and 3 AU gives {n1(far.bendDegrees)} degrees. Both effects are in the eccentricity, e = 1 + (closest approach × speed far away²) ÷ GM: a faster visitor, or one that passes farther away, has a bigger
            eccentricity, and a bigger eccentricity gives a smaller bend, 2 × arcsin(1 ÷ e). Table 3 shows the result for the three known visitors, whose speeds and closest approaches differ: ʻOumuamua’s eccentricity, {known[0].eccentricity}, gives a bend of {n1(known[0].bendDegrees)} degrees, Borisov’s, {known[1].eccentricity}, gives {n1(known[1].bendDegrees)} degrees, and 3I/ATLAS’s, {known[2].eccentricity}, gives {n1(known[2].bendDegrees)} degrees.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What the model leaves out, and what the path does not tell us.</strong> The calculation uses the Sun’s gravity alone. It leaves out the pulls of the planets, which are expected to be small compared with the Sun’s at these speeds but were not worked out here, the push of the comet’s own gas as it boils off (astronomers have measured a tiny push of this kind), and the effects of relativity, which are tiny
            at these speeds. It also says nothing about what 3I/ATLAS is made of or how old it is: the path shows that it came from outside the solar system and that it is leaving, but not which star it came from. Those questions, and the gas and dust it gave off, are separate, and some are still debated.
          </p>
          <p style={paragraphStyle}>
            <strong>5. How sure we are.</strong> That 3I/ATLAS came from outside the solar system, and the shape of its path, is settled: its eccentricity is about {n2(ATLAS_3I.eccentricity)} and its closest approach about {n2(ATLAS_3I.closestApproachAu)} AU. Those are certain to about three figures: different published fits of the orbit differ by a few thousandths in the eccentricity, because they treat the push of the comet’s own gas and the errors of the observations in different ways. The formulas are standard results for a path under the Sun’s gravity alone. The numbers on this page come from Wikipedia’s table of the orbit, the
            discovery paper’s abstract and the pages of NASA and ESA; no paper was read in full, so check any number you want to rely on against its source.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>6. What was shown, and what was not.</strong> You saw that 3I/ATLAS was going {n1(s.speedAtClosestKmS)} km/s at its closest approach, {n2(c.speedOverEscape)} times the escape speed there, so that its path is open; that the Sun bent its path by {n1(c.bendDegrees)} degrees; and that a slower visitor or a closer pass would be bent more. You did not
            see where it came from, what it is made of, or how the path would change with the planets’ pulls. Try the settings in Part 2 again if you like: they show how other speeds and closest approaches would do, and the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
