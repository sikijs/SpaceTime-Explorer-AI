import { useState } from 'react'
import {
  EARTH_SURFACE_GRAVITY_M_S2,
  gravityAnswer,
  gravityRealOverGuess,
  gwHeavierLowestAboveEstimateSolar,
  maximumMassOverNicerMass,
  NEUTRON_STAR_DATA,
  personWeightTonnes,
  predictionOneReal,
  predictionTwoReal,
  runNeutronStarSize,
  sizeAnswer,
  surfaceGravity,
  surfaceMinutesPerDistantHour,
} from '../physics/neutronStarSize'
import type { GravityAnswer, SizeAnswer } from '../physics/neutronStarSize'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface NeutronStarSizeTutorProps {
  sizePrediction: SizeAnswer
  gravityPrediction: GravityAnswer
  onExplained?: () => void
}

const sizeWords: Record<SizeAnswer, string> = {
  yes: 'yes, it would be a black hole',
  no: 'no, it would still be bigger than a black hole of its mass',
}
const gravityWords: Record<GravityAnswer, string> = {
  'about 10 times': 'about 10 times',
  'about a thousand times': 'about a thousand times (10³)',
  'about 100 billion times': 'about 100 billion times (10¹¹)',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function sci(x: number): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / 10 ** exponent
  return `${mantissa.toFixed(1)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

// The tutor of Frontier and Beyond Experiment 15. Wording approved by the owner on 2026-10-24 (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (neutronStarSize.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for the group, kept for this
// experiment). The tutor does not say what the maximum mass is beyond the published estimate, does not decide what the heavier object in GW230529 is, and does not explain
// what dense matter is made of.
export function NeutronStarSizeTutor({ sizePrediction, gravityPrediction, onExplained }: NeutronStarSizeTutorProps) {
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
  const d = NEUTRON_STAR_DATA
  const j = d.j0437
  const result = runNeutronStarSize()
  const one = predictionOneReal()
  const two = predictionTwoReal()
  const rightSize = sizeAnswer()
  const rightGravity = gravityAnswer()
  const gSurface = surfaceGravity(two.massSolar, two.radiusKm)
  const minutesPerHour = surfaceMinutesPerDistantHour(result.massSolar, result.radiusKm)
  const [estimateLo, estimateHi] = d.maximumMassEstimateRangeSolar
  const [gapLo, gapHi] = d.gapRangeSolar
  const [estimateLoOverNicer, estimateHiOverNicer] = maximumMassOverNicerMass()
  const gwAboveEstimate = gwHeavierLowestAboveEstimateSolar()
  const [uncertaintyLo, uncertaintyHi] = d.nasaRadiusUncertaintyPercent
  const personKg = d.examplePersonKg
  const personTonnes = personWeightTonnes(personKg, two.gravityInEarths)

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
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>. The big violet disc is the real neutron star, {result.radiusKm} km in radius, which makes it about{' '}
                {result.diameterKm.toFixed(1)} km across, roughly the size of a city. The red dashed circle in the middle is the size a black hole of the same weight would have. Which is bigger, and about
                how many times wider is the violet disc than the red circle?
              </p>
              <p style={paragraphStyle}>
                Now look at the <strong>lower half of Picture 2</strong>. The line starts at 1, which is the pull of gravity at the Earth’s surface, and each tick is 1,000 times more. Where does the
                yellow triangle sit: a little way along, or nearly at the end?
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
                  <strong>Picture 1:</strong> the cyan dashed circle is the imagined {one.radiusKm} km star from Prediction 1, and the white dashed circle is your guess. Is the white circle inside or
                  outside the cyan one? How do both compare with the red black-hole circle?
                </li>
                <li>
                  <strong>Lower half of Picture 2:</strong> the white triangle is your guess for Prediction 2, and the yellow triangle is the real value. How far apart are they? Remember that each
                  tick is 1,000 times more, so a short gap on the line can mean a huge difference in gravity.
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 2</strong>, which has the numbers for both predictions. Did anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you
                were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. In 2023, gravitational-wave detectors caught two objects merging, in an event called GW230529. The lighter object, {d.gw230529Secondary.lowSolar.toFixed(1)}{' '}
                to {d.gw230529Secondary.highSolar.toFixed(1)} Suns, is almost certainly a neutron star. The heavier one weighs about {d.gw230529Primary.massSolar.toFixed(1)} Suns (the measurements allow{' '}
                {d.gw230529Primary.lowSolar.toFixed(1)} to {d.gw230529Primary.highSolar.toFixed(1)}). That is above the published estimate of the heaviest neutron star, {estimateLo} to {estimateHi} Suns, which
                depends on assumptions, and in a range where LIGO’s summary says few objects have been seen ({gapLo} to {gapHi} Suns).
              </p>
              <p style={paragraphStyle}>
                So the heavier object could be a neutron star or a black hole, and the gravitational-wave data alone cannot say which. Suppose you could make <strong>one more measurement</strong> of it. What
                would you measure, and why would that measurement tell a neutron star from a black hole?
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{sizeWords[sizePrediction]}</em>. A{' '}
            {one.massSolar}-Sun star squeezed to {one.radiusKm} km is {one.radiusKm} ÷ {one.blackHoleRadiusKm.toFixed(2)} = {one.ratio.toFixed(2)} times wider than a black hole of its mass, so the answer is{' '}
            <em>{sizeWords[rightSize]}</em>. {sizePrediction === rightSize ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sizePrediction !== rightSize &&
              ` ${one.radiusKm} km sounds tiny, but a black hole of this mass is only ${one.blackHoleRadiusKm.toFixed(2)} km, so the star would have to be squeezed further.`}{' '}
            For Prediction 2 you answered: <em>{gravityWords[gravityPrediction]}</em>. Gravity at the surface is g = GM ÷ R² = {sci(gSurface)} m/s² (for {two.massSolar} Suns and {two.radiusKm} km), and
            dividing by the Earth’s {EARTH_SURFACE_GRAVITY_M_S2.toFixed(2)} m/s² gives about {sci(two.gravityInEarths)} times the Earth’s, so the nearest answer is <em>{gravityWords[rightGravity]}</em>.{' '}
            {gravityPrediction === rightGravity ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {gravityPrediction !== rightGravity &&
              ` The real value is about ${sci(gravityRealOverGuess(gravityPrediction))} times your guess.`}{' '}
            To feel how strong that is, a {personKg} kg person would be pulled as if they weighed about {sci(personTonnes)} tonnes.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What holds a neutron star up.</strong> When a massive star’s core collapses (Experiment 13), protons and electrons are squeezed into neutrons. Neutrons obey the same rule as the
            electrons in a white dwarf: no two can be in the same state, so when they are crowded together they push back. That push is what holds the star up (Black Holes Experiment 9). Think of a theatre where every seat holds one person: you cannot fit a second person into a seat, however hard you push. Crowded neutrons are like that, so squeezing them harder meets a stronger push back.
          </p>
          <p style={paragraphStyle}>
            <strong>2. How big, and how it is measured.</strong> Think of a lighthouse. Hot spots on the star’s surface shine X-ray beams, and as the star spins the beams sweep past, so NICER records a
            pulse each time. The shape of the pulses depends on the star’s size and gravity, and from that scientists work out the radius: {j.radiusKm} km, give or take +{j.radiusPlusKm} and −{j.radiusMinusKm},
            or about {uncertaintyLo} to {uncertaintyHi} percent (NASA).
          </p>
          <p style={paragraphStyle}>
            <strong>3. How close to a black hole.</strong> {result.radiusKm} ÷ {result.blackHoleRadiusKm.toFixed(2)} = {result.ratio.toFixed(2)}. The star is {result.ratio.toFixed(2)} times wider than a
            black hole of its mass. A black hole would be exactly 1. So the neutron star is close, but not close enough.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Gravity and the clock.</strong> The surface gravity is about {sci(result.gravityInEarths)} times the Earth’s.
            {result.clockRate !== null && minutesPerHour !== null && (
              <>
                {' '}
                A clock on the surface runs at √(1 − {result.blackHoleRadiusKm.toFixed(2)} ÷ {result.radiusKm}) = {result.clockRate.toFixed(3)}, so in an hour by a distant clock it counts about{' '}
                {minutesPerHour.toFixed(1)} minutes (Gravity Experiment 2).
              </>
            )}{' '}
            This is calculated here, not measured.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why there is a heaviest neutron star.</strong> A heavier star has more weight to hold up, so its neutrons are squeezed tighter, and it shrinks. Past some weight nothing can hold it
            up, and it becomes a black hole. One 2026 estimate puts that weight at {estimateLo} to {estimateHi} Suns, but it depends on assumptions about how matter behaves at such density, so it is not
            settled. Think of a stack of books pressing on a spring: each extra book squeezes it more, and past some load it is flattened for good. A neutron star is like that. Worked sum: {estimateLo} ÷ {result.massSolar} = {estimateLoOverNicer.toFixed(2)} and {estimateHi} ÷ {result.massSolar} = {estimateHiOverNicer.toFixed(2)}, so the estimate says a neutron star could weigh up to about one and a half times what the NICER star weighs.
          </p>
          <p style={paragraphStyle}>
            <strong>6. GW230529.</strong> Two objects merged. The lighter one, {d.gw230529Secondary.lowSolar.toFixed(1)} to {d.gw230529Secondary.highSolar.toFixed(1)} Suns, is almost certainly a neutron star. The heavier
            one, {d.gw230529Primary.lowSolar.toFixed(1)} to {d.gw230529Primary.highSolar.toFixed(1)} Suns (most likely about {d.gw230529Primary.massSolar.toFixed(1)}), lies above the {estimateLo} to {estimateHi} estimate, and LIGO’s
            summary says few objects have been seen between {gapLo} and {gapHi} Suns. But the gravitational-wave data alone cannot say whether it is a neutron star or a black hole. You were asked what you
            would measure, and you may have thought of something not mentioned here. Think of a sealed parcel: knowing its weight does not tell you what is inside. In the same way, the data tell us how heavy each object is, and weight alone does not say what an object is. Worked sum: the heavier object’s lowest possible weight, {d.gw230529Primary.lowSolar.toFixed(1)} Suns, is {d.gw230529Primary.lowSolar.toFixed(1)} − {estimateHi} = {gwAboveEstimate.toFixed(1)} Suns above the highest estimate for a neutron star, so it is above the estimate but not by much, and the estimate depends on assumptions.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw a real neutron star measured, how it compares with a black hole of its mass, and how strong its gravity is. You did not see what
            dense matter is made of, a measured surface gravity, or what the heavier object in GW230529 is.
          </p>
        </div>
      )}
    </div>
  )
}
