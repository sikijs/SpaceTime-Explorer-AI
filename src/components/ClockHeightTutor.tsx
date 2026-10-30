import { useState } from 'react'
import {
  gapAnswer,
  G_EARTH,
  heightAnswer,
  JILA_2022,
  rateDifference,
  SECONDS_PER_YEAR,
  sigmasFromExpected,
  signalToPrecision,
  smallestHeight,
  SPEED_OF_LIGHT,
  timeGap,
  WISCONSIN_2023,
} from '../physics/clockHeight'
import type { LengthScale, TimeScale } from '../physics/clockHeight'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ClockHeightTutorProps {
  gapPrediction: TimeScale
  heightPrediction: LengthScale
  onExplained?: () => void
}

const gapWords: Record<TimeScale, string> = {
  microsecond: 'about 3 microseconds (millionths of a second)',
  nanosecond: 'about 3 nanoseconds (billionths of a second)',
  picosecond: 'about 3 picoseconds (trillionths of a second)',
}
const heightWords: Record<LengthScale, string> = {
  metre: 'about 1 metre',
  centimetre: 'about 1 centimetre',
  millimetre: 'about 1 millimetre',
}

// "1.09 × 10⁻¹⁶" from a number, with the exponent in superscript digits.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (value: number, digits = 2) => {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
const tenTo = (exponent: number) => `10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
const timeText = (seconds: number) => {
  if (seconds < 1e-12) return `${(seconds * 1e15).toPrecision(3)} femtoseconds`
  if (seconds < 1e-9) return `${(seconds * 1e12).toPrecision(3)} picoseconds`
  if (seconds < 1e-6) return `${(seconds * 1e9).toPrecision(3)} nanoseconds`
  if (seconds < 1e-3) return `${(seconds * 1e6).toPrecision(3)} microseconds`
  return `${(seconds * 1e3).toPrecision(3)} milliseconds`
}
const lengthText = (metres: number) => (metres < 0.1 ? `${(metres * 1000).toPrecision(2)} mm` : `${metres.toPrecision(2)} m`)

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Cosmic Horizons Experiment 9. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes
// from the physics module (clockHeight.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source table.
// The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say that clocks "slow down time" in an
// absolute way: it says that two clocks tick at different rates when they are compared.
export function ClockHeightTutor({ gapPrediction, heightPrediction, onExplained }: ClockHeightTutorProps) {
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
  const rightGap = gapAnswer()
  const rightHeight = heightAnswer()
  const cSquared = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const perMetre = rateDifference(1)
  const gapMetre = timeGap(1, SECONDS_PER_YEAR)
  const gapMillimetre = timeGap(0.001, SECONDS_PER_YEAR)
  const jilaSignal = signalToPrecision(0.001, JILA_2022.precision)
  const wisconsinCombined = Math.sqrt(WISCONSIN_2023.statistical ** 2 + WISCONSIN_2023.systematic ** 2)
  const wisconsinSigmas = sigmasFromExpected(WISCONSIN_2023.measured, WISCONSIN_2023.statistical, WISCONSIN_2023.systematic, WISCONSIN_2023.expected)
  const wristGap = 0.001 * 365.25 // the watch example: a thousandth of a second a day, over a year

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
              'Look at Picture 2. How does the gap after a year change as the height goes from 1 millimetre to 1 kilometre? Which of those gaps could you imagine measuring, and which seem too small?'}
            {tutorStep === 'compare' &&
              `You predicted that two clocks 1 metre apart would read ${gapWords[gapPrediction]} apart after a year, and that a difference in rate of one part in ${tenTo(19)} goes with a height of ${heightWords[heightPrediction]}. Now look at Table 1 and Table 2, and at Pictures 1 to 3. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'A clock on a mountain top ticks a little faster than an identical clock in the valley. Could you use two such clocks to tell which of two places is higher? What else might change the rate of a clock, that you would have to rule out first?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that two clocks 1 metre
            apart would be <em>{gapWords[gapPrediction]}</em> apart after a year. The gap is {sci(perMetre)} × {SECONDS_PER_YEAR.toLocaleString('en-US')} seconds ={' '}
            {timeText(gapMetre)}, which is <em>{gapWords[rightGap]}</em>. {gapPrediction === rightGap ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {gapPrediction === 'microsecond' &&
              ' It is a natural thought: a whole year sounds long enough for a big gap. But the fraction is only about one part in nine thousand trillion, and even a year of 31.6 million seconds turns that into only billionths of a second.'}
            {gapPrediction === 'picosecond' &&
              ' It is a natural thought: the effect sounds too small to matter. But a year is 31.6 million seconds, and a tiny fraction of that adds up to billionths of a second, a thousand times more than trillionths.'}{' '}
            You also predicted that a difference in rate of one part in {tenTo(19)} goes with a height of <em>{heightWords[heightPrediction]}</em>. A height of 1 millimetre
            gives {sci(rateDifference(0.001))}, which is about one part in {tenTo(19)}, so the answer is <em>{heightWords[rightHeight]}</em>.{' '}
            {heightPrediction === rightHeight ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {heightPrediction === 'metre' &&
              ` It is a natural thought: a metre is an ordinary size. But 1 metre gives ${sci(perMetre)}, a thousand times more than one part in ${tenTo(19)}.`}
            {heightPrediction === 'centimetre' &&
              ` It is a natural thought. But 1 centimetre gives ${sci(rateDifference(0.01))}, ten times more than one part in ${tenTo(19)}.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What ticks faster, and by how much.</strong> In Gravity Experiment 2 you saw that gravity changes the rate of a clock: a clock where gravity is
            weaker ticks a little faster than one where it is stronger. The rule is that the fraction by which the higher clock ticks faster is{' '}
            <strong>g × h ÷ c²</strong>. For a height of 1 metre: {G_EARTH} × 1 ÷ ({sci(cSquared, 3)}) = {sci(perMetre)}. That means that for about every
            nine thousand trillion ticks of the lower clock, the higher one makes one more. Ten times the height gives ten times the fraction, which is why Picture 1 is a straight
            line. Notice what the rule says and what it does not: when the two clocks are compared, they tick at different rates, and the one higher up ticks faster. It
            does not say that time “slows down” for anyone in an absolute way. Each clock, looked at on its own, ticks normally.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why a tiny fraction still matters.</strong> A small difference adds up. Think of two wrist watches, one of which gains a thousandth of a second
            every day. After a day nobody can tell them apart, but after a year of 365.25 days the gap is 0.001 × 365.25 = {wristGap.toFixed(2)} seconds, and you
            could measure that with a stopwatch. For the clocks of this experiment the fraction is far smaller, but the same idea holds: {sci(perMetre)} ×{' '}
            {SECONDS_PER_YEAR.toLocaleString('en-US')} seconds = {timeText(gapMetre)} after a year for 1 metre, and {timeText(gapMillimetre)} for 1 millimetre. Comparing the
            two clocks for longer makes the gap bigger and the difference easier to see.
          </p>

          <p style={paragraphStyle}>
            <strong>3. What precision means for height.</strong> A clock’s precision is the smallest difference in rate that it can notice. Turn the rule round and
            you get the smallest height it can notice: the precision divided by {sci(perMetre)}. A clock good to {tenTo(-16)} can notice {lengthText(smallestHeight(1e-16))};
            one good to {tenTo(-18)} can notice {lengthText(smallestHeight(1e-18))}; one good to {tenTo(-19)}, which is what Prediction 2 asked about, can notice{' '}
            {lengthText(smallestHeight(1e-19))}; and one good to the JILA clock’s {sci(JILA_2022.precision, 1)} could notice {lengthText(smallestHeight(JILA_2022.precision))}.
            A clock a hundred times more precise can tell heights a hundred times smaller. That is the sense in which a clock “tells” how high it is: its rate stands for
            its height. It is like a bathroom scale: one good to a kilogram can tell that you have put on a bag of sugar, and one good to a gram can tell that you have
            put on a coin.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What two laboratories measured.</strong> The JILA team, in 2022, held about 100,000 strontium atoms in a pattern of laser light and compared the
            rates of the top and the bottom of one cloud, about a millimetre tall. The effect across 1 millimetre is {sci(rateDifference(0.001))}, and the reported
            precision, {sci(JILA_2022.precision, 1)}, is {jilaSignal.toFixed(1)} times smaller, so the difference was clearly larger than the precision. The release says
            that they resolved it in about 30 minutes of averaging. The Wisconsin team measured a gradient across 1 centimetre of {WISCONSIN_2023.measured} ±{' '}
            {WISCONSIN_2023.statistical} ± {WISCONSIN_2023.systematic} (in units of {tenTo(-19)} per centimetre) and expected {WISCONSIN_2023.expected}. This experiment
            combines the two give-or-takes in the simplest way, √({WISCONSIN_2023.statistical}² + {WISCONSIN_2023.systematic}²) = {wisconsinCombined.toFixed(2)}, so the result
            is {(WISCONSIN_2023.measured - WISCONSIN_2023.expected).toFixed(1)} ÷ {wisconsinCombined.toFixed(2)} = {wisconsinSigmas.toFixed(2)} sigma from what the rule
            says, which is below 2 sigma, so compatible with it. So two laboratories, with different clocks, saw the effect over a very small height, and it agrees
            with the rule. That is what “settled” means here.
          </p>

          <p style={paragraphStyle}>
            <strong>5. Reading heights from clocks: what has been done, and what is hard.</strong> The rule has been checked on a much larger scale than the laboratory
            tests. For 450 metres, the height of the observatory floor of Tokyo Skytree, this experiment’s rule gives {G_EARTH} × 450 ÷ ({sci(cSquared, 3)}) ={' '}
            {sci(rateDifference(450))}, and over a day of 86,400 seconds that is {timeText(timeGap(450, 86_400))}. In 2020 two optical lattice clocks, one at the foot and
            one on that floor, gave what RIKEN calls another validation of Einstein’s theory. In 2018 a transportable clock was compared with a clock about 1,000 metres
            different in height, and the gravity difference that the clocks gave agreed with conventional methods. Euramet calls that a proof of principle: it shows that a
            clock can tell a height, and it is not yet a routine way of measuring one. What makes it hard is that the experiment’s case is the easy one: two identical clocks
            compared exactly. In real life, anything else that changes how a clock ticks has to be measured and removed, and the clocks have to be compared across a link. A
            clock also responds to the pull of everything near it, not only to its height, and the Earth’s pull is not the same everywhere, so this experiment’s single value
            of g is a simplification that is good for heights of a few kilometres. NIST says that clocks like these could also help to measure the shape and gravity of the
            Earth.
          </p>

          <p style={paragraphStyle}>
            <strong>6. The plan to redefine the second.</strong> The best optical clocks are now more accurate than the caesium clocks that define the second today. At its 28th
            general conference, on 13 to 15 October 2026, the BIPM’s member states did <em>not</em> adopt a new definition. Their Resolution 4 asks the committee that prepares their
            work to work toward a proposal, with a date, for the conference of 2030, and notes that no consensus has been reached on which atom, or atoms, to use. So this is a
            plan, and not a result.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that a higher clock ticks faster by g × h ÷ c², how a tiny fraction adds up to billionths of a second
            in a year, how a clock’s precision gives the smallest height it can notice, and that laboratories saw the effect over about a millimetre and a centimetre, and field tests over hundreds of metres. What
            this experiment did <strong>not</strong> do is model how an optical clock works, analyse any laboratory’s data, or show that the second will be redefined.
          </p>
        </div>
      )}
    </div>
  )
}
