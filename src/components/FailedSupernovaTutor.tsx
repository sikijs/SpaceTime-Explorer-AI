import { useState } from 'react'
import {
  countAnswer,
  countGuessGap,
  FAILED_SUPERNOVA_DATA,
  neutrinoMassWorked,
  pushAnswer,
  pushGuessGap,
  runCheckUp,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  timeline,
} from '../physics/failedSupernova'
import type { CountAnswer, PushAnswer } from '../physics/failedSupernova'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface FailedSupernovaTutorProps {
  pushPrediction: PushAnswer
  countPrediction: CountAnswer
  onExplained?: () => void
}

const pushWords: Record<PushAnswer, string> = {
  'about the same': 'about the same as a typical supernova’s',
  'about 1 in 100': 'about 1 in 100 of a typical supernova’s',
  'about 1 in 10,000': 'about 1 in 10,000 of a typical supernova’s',
}
const countWords: Record<CountAnswer, string> = {
  'fewer than 1': 'less than 1 in every 100',
  'about 10 to 20': 'about 10 to 20 in every 100',
  'about half': 'about half: about 50 in every 100',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function sci(x: number): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / 10 ** exponent
  return `${mantissa.toFixed(1)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
function thousands(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

// The tutor of Cosmic Horizons Experiment 17. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior" and the
// group's tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (failedSupernova.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not
// decide between the two readings, does not say how many black holes came this way, and does not say that the star became a black hole as a fact.
export function FailedSupernovaTutor({ pushPrediction, countPrediction, onExplained }: FailedSupernovaTutorProps) {
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
  const d = FAILED_SUPERNOVA_DATA
  const check = runCheckUp()
  const w = neutrinoMassWorked()
  const rightPush = pushAnswer()
  const rightCount = countAnswer()
  const pushGap = pushGuessGap(pushPrediction)
  const countGap = countGuessGap(countPrediction)
  const [estimateLo, estimateHi] = d.maximumMassEstimateRangeSolar
  const marks = timeline()

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
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, the time line of what telescopes saw. In 2016 to 2019 the star faded by a factor of more than 100, and in
                2022 to 2023 it could not be seen in visible light. Is there any row that shows a sudden, bright flash, the way an ordinary supernova would look? What do you see instead?
              </p>
              <p style={paragraphStyle}>
                Now look at the <strong>upper half of Picture 2</strong>. Find the red bar and the three blue marks along the scale (at 2.0, 2.2 to 2.3 and 3.0 Suns). Where does the red bar end, compared
                with the blue marks? And how long is the short yellow bar at its right-hand end?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                Now bring your own guesses back. In Part 1 you made two predictions, and they are drawn in white on the pictures, so you can see each guess next to the real result.
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Lower half of Picture 2:</strong> the white triangle is your guess for Prediction 1. The orange bar is the discovery paper’s estimate of the failed supernova’s push, the yellow bar is
                  a typical supernova’s, and the grey bar is the other 2026 paper’s wording. How far along the scale is your triangle from the orange bar? Remember that each tick is 10 times more, so a
                  short gap on the line can mean a big difference in energy.
                </li>
                <li>
                  <strong>Picture 3:</strong> the white outlines are your guess for Prediction 2, and the red dots are the survey’s estimate. How many of the red dots do your outlines cover?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, which has the numbers for both predictions (the rows that say “You predicted”). Did anything match what you expected, or surprise you? Tell me what you
                notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. The star M31-2014-DS1 faded from view in visible light, but a space telescope still sees a faint glow of infrared light where it was. Two teams
                looked at that same faint, dusty glow. One says a black hole is hiding in the dust. Another says two stars merged and a star is hiding in the dust.
              </p>
              <p style={paragraphStyle}>
                Suppose you could make <strong>one more observation</strong>. What would you look for, to tell the two teams apart, and why would it help?
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{pushWords[pushPrediction]}</em>. The
            discovery paper estimates the push at {thousands(check.pushOneIn.lowOneIn)} to {thousands(check.pushOneIn.highOneIn)} times weaker than a typical supernova’s (1 in {thousands(check.pushOneIn.lowOneIn)} to 1 in{' '}
            {thousands(check.pushOneIn.highOneIn)}), so the nearest answer is <em>{pushWords[rightPush]}</em>. {pushPrediction === rightPush ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {pushGap.verdict === 'stronger' &&
              ` Your answer is a stronger push than the whole estimated range: the real push is ${thousands(pushGap.nearTimes)} to ${thousands(pushGap.farTimes)} times weaker than your answer says.`}{' '}
            For Prediction 2 you answered: <em>{countWords[countPrediction]}</em>. The survey’s best count is {check.failedRange.central.toFixed(0)} in every 100 (a 90 percent range of {check.failedRange.low.toFixed(0)} to{' '}
            {check.failedRange.high.toFixed(0)}), so the nearest answer is <em>{countWords[rightCount]}</em>. {countPrediction === rightCount ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {countGap.verdict === 'below' && ` The survey’s best count is ${countGap.times.toFixed(0)} times the top of your answer.`}
            {countGap.verdict === 'above' && ` The bottom of your answer is ${countGap.times.toFixed(1)} times the survey’s best count.`} Keep in mind that this count rests on one clearly detected failed supernova.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why a collapse does not always end in a flash.</strong> In Experiment 13 the core fell in and almost all the energy left as neutrinos, with a shock running outward through the star.
            Worked sum: the energy of that collapse is E = GM² ÷ R = {sci(w.energyJ)} joules (for 1.4 Suns and 12 km), and dividing by c² ({sci(w.cSquared)}) gives {sci(w.massKg)} kg, which is{' '}
            {w.massSolar.toFixed(2)} Suns. Published work puts it at about 0.2 to 0.5 Suns, so the collapse gives off as much energy as the mass of {w.massSolar.toFixed(2)} Suns holds, and only a tiny part
            of it is left to push the outer layers. In an ordinary supernova that is enough to throw them out. In a failed supernova the idea is that the shock fades before it can. As an analogy
            only, not physics: think of a firework that fizzles and sinks, where an ordinary supernova is the firework that goes off.
          </p>
          <p style={paragraphStyle}>
            <strong>2. What stays collapsed.</strong> The star weighed about {check.starSolar} Suns at the end of its life and at most about {check.thrownOffSolar} Sun was thrown off, so {check.starSolar} − {check.thrownOffSolar} ={' '}
            {check.remnantSolar.toFixed(1)} Suns stayed, {check.collapsedPercent.toFixed(0)} percent of the star. Compared with the most a neutron star may weigh (one 2026 estimate: {estimateLo} to {estimateHi} Suns), {check.remnantSolar.toFixed(1)} ÷ {estimateHi} ={' '}
            {check.overEstimateTop.toFixed(2)}, about {check.overEstimateTop.toFixed(1)} times as much, and it is above the {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES.toFixed(1)} Suns above which nothing known can hold a core up. By those limits, that much weight
            would be a black hole. To leave a neutron star instead, at least {check.thrownOffNeededSolar.toFixed(1)} Suns would have to be thrown off, {check.thrownOffNeededOverPaper.toFixed(0)} times more than the paper’s estimate. The limits are rough,
            and the {check.remnantSolar.toFixed(1)} Suns is an estimate from a model, not a weighing.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the push is so weak, and why there is no flash.</strong> A typical supernova gives its gas about {sci(d.supernovaGasErg)} erg. The discovery paper estimates the failed supernova’s
            shock at {sci(d.weakShockErgRange[0])} to {sci(d.weakShockErgRange[1])} erg. Worked sum: {sci(d.weakShockErgRange[0])} ÷ {sci(d.supernovaGasErg)} = 1 in {thousands(check.pushOneIn.highOneIn)}, and {sci(d.weakShockErgRange[1])} ÷ {sci(d.supernovaGasErg)} = 1 in{' '}
            {thousands(check.pushOneIn.lowOneIn)}. That is like a full bathtub (about 200 litres) set beside one cup of water (about 0.2 litre), for the stronger end. Too little push means the outer layers are not thrown out,
            so there is no bright flash. The other 2026 paper words it even lower (1 in {thousands(check.apjlPushOneIn.lowOneIn)} to 1 in {thousands(check.apjlPushOneIn.highOneIn)}), so the sources differ, and nobody measured the push directly.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What the telescopes saw.</strong> Picture 1 is only the published marks:
          </p>
          <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
            {marks.map((m) => (
              <li key={m.label}>
                <strong>{m.label}:</strong> {m.text}.
              </li>
            ))}
          </ul>
          <p style={paragraphStyle}>
            Nothing in these marks is a bright flash. That is the evidence that is strong. What caused the fade is where the teams disagree.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The two readings, and what would settle it.</strong> One team reads the star as a collapse into a black hole with the outer layers falling back, hidden in dust. Two other teams read it as
            two stars that merged, leaving a dust-covered star. Both use the same observations: the fade, the infrared glow and the lack of X-rays so far. The discovery team says the dust blocks the
            X-rays and that they should appear in about {d.xrayWaitYears} years, so waiting for X-rays is one test. Another is later infrared pictures, which show how the glow changes. You were asked what you would look for.
            Whatever you thought of, notice what it does: it picks something the two readings expect to be different. The page does not choose between them, because the papers do not settle it yet.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How common, and why the give-or-take is large.</strong> The survey’s best count is {check.failedRange.central.toFixed(0)} in 100, which is 1 massive star in every {(100 / check.failedRange.central).toFixed(1)}. But the range is{' '}
            {check.failedRange.low.toFixed(0)} to {check.failedRange.high.toFixed(0)}, and {check.failedRange.high.toFixed(0)} ÷ {check.failedRange.low.toFixed(0)} = {check.topOverBottom.toFixed(1)}, so the top is almost 10 times the bottom. Think of seeing one rare bird in a whole
            year of watching: you know such a bird exists, but one sighting cannot tell you how many there are. The survey is like that, because it found only one clearly detected failed supernova.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw a star that faded with no flash, the estimates of what stayed collapsed and how weak the push was, and how common failed
            supernovae may be. You did not see a measured weight or a measured push, X-rays from the object, a settled answer between the two readings, or how many black holes in the Galaxy came this way.
          </p>
        </div>
      )}
    </div>
  )
}
