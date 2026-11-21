import { useState } from 'react'
import {
  FLICKER_ILLUSTRATION_DAYS,
  FUSION_EFFICIENCY,
  J0529_LUMINOSITY_SOLAR,
  MILKY_WAY_LUMINOSITY_RANGE_SOLAR,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  checkUp,
  runQuasarExperiment,
  sizeLimitInNeptuneOrbits,
} from '../physics/quasarBrightness'
import type { FuelChoiceId, RatioChoiceId, WidthChoiceId } from '../physics/quasarBrightness'
import { formatNumber, formatPercent, formatSuns, fuelLabel, ratioLabel, widthLabel } from './QuasarBrightnessFormat'

// Black Holes 11, Step 6: Part 4, the tutor (docs/experiments/black-holes-and-strong-gravity/11-why-do-quasars-outshine-galaxies.md). The sequence follows the
// project's tutor pattern (CLAUDE.md §12, §13): observe, compare with the guesses, one conceptual question, then the explanation, where the guesses are marked.
// Every number comes from the physics module (§9). Draft wording, for the owner's approval (§28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface QuasarBrightnessTutorProps {
  ratioGuess: RatioChoiceId
  widthGuess: WidthChoiceId
  fuelGuess: FuelChoiceId
  // Whether each guess was the nearest button to the module's value, worked out in the physics module (`markGuesses`).
  matches: { ratio: boolean; width: boolean; fuel: boolean }
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function QuasarBrightnessTutor({ ratioGuess, widthGuess, fuelGuess, matches, onExplained }: QuasarBrightnessTutorProps) {
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
  const mark = (n: number, right: boolean) => `Your guess ${n}: ${right ? 'right' : 'off this time'}.`

  const run = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
  const rows = checkUp()
  const j0529 = rows.find((r) => r.id === 'j0529-rate')!
  const [mwLow, mwHigh] = MILKY_WAY_LUMINOSITY_RANGE_SOLAR
  const days = FLICKER_ILLUSTRATION_DAYS

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
              'Look at Pictures A, B and C, and find the white YOUR GUESS marks. Then try a few settings in Part 2. What do you notice about the green bar in Picture C when you change the spin, and when you change the brightness?'}
            {tutorStep === 'compare' &&
              `Find your three white marks. You guessed that 3C 273 is ${ratioLabel(ratioGuess)} than the Milky Way (Picture A); that a source that changes over about a week is ${widthLabel(widthGuess)} as the Milky Way (Picture B); and that ${fuelLabel(fuelGuess)} must fall in each year (Picture C). Which of your white marks sit close to the real picture, and which sit far from it? What do you notice?`}
            {tutorStep === 'conceptual' &&
              'In Picture C the green bar was much shorter than the orange one. Why might a kilogram of gas falling toward a black hole give out so much more light than a kilogram of hydrogen burning in a star?'}
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
          <p style={paragraphStyle}>
            <strong>1. One point of light, many galaxies.</strong> The Milky Way gives out about {formatSuns(mwLow)} to {formatSuns(mwHigh)} of light, and 3C 273 about {formatSuns(run.luminositySolar)}. Dividing,
            3C 273 is about {formatNumber(run.ratioToMilkyWay)} times brighter ({formatNumber(run.ratioToMilkyWayRange.low)} to {formatNumber(run.ratioToMilkyWayRange.high)} over the two published values for the Milky Way).
            {' '}{mark(1, matches.ratio)} You guessed {ratioLabel(ratioGuess)}. The brightness of 3C 273 is a round number, because published values range from about 2 to 5 trillion Suns, so the ratio is good to about a factor of two and not better.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Where the energy comes from: falling releases far more of a kilogram’s mass than fusion.</strong> Einstein’s E = mc² says that mass is stored energy: a share of a piece of matter’s mass can come out as light.
            A star turns {formatPercent(FUSION_EFFICIENCY)} of its hydrogen’s mass into light, by fusion. Falling toward a black hole does much better, as Black Holes 8 found: {formatPercent(run.infallEfficiency)} with no spin, and more with spin. A good comparison is a stone dropped from a cliff. It gives up energy as it falls, and it hits the ground hot and fast. Gas falling toward a black hole falls through a much stronger pull, so it gives up a much larger share of its mass before it is gone. It swirls into a hot disk and glows. This is a comparison only, and this page does not model the disk.
            The result: for the same light, falling in needs {formatNumber(run.infallSolarMassesPerYear)} Suns of mass a year, where fusion would need {formatNumber(run.fusionSolarMassesPerYear)} Suns of hydrogen a year. That is
            {' '}{formatNumber(run.lightPerKilogramRatio)} times less matter ({formatPercent(run.infallEfficiency)} ÷ {formatPercent(FUSION_EFFICIENCY)}). {mark(3, matches.fuel)} You guessed {fuelLabel(fuelGuess)}.
          </p>
          <p style={paragraphStyle}>
            <strong>3. How small the source must be.</strong> Think of a crowd doing “the wave”. It takes time to go round, because each person reacts only after seeing a neighbor. A source whose light brightens and fades as a whole in {days} days cannot be wider than the distance light covers in {days} days, because no part of it can learn of a change in another part faster than light travels. That is {days} light-days, about {formatNumber(run.sizeLimitAU)} AU, or about {formatNumber(sizeLimitInNeptuneOrbits(days))} times the width of Neptune’s orbit.
            The Milky Way is {formatNumber(run.galaxyToSourceWidthRatio / 1e6)} million times wider, so the source is about 1 part in {Math.round(run.galaxyToSourceWidthRatio).toLocaleString('en-US')} of the galaxy’s width.
            {' '}{mark(2, matches.width)} You guessed {widthLabel(widthGuess)} as the Milky Way. The week is an example from a review of quasar flickering, and not 3C 273’s own flicker time, and the rule gives a limit and not an exact size.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The two halves fit together.</strong> A galaxy of hundreds of billions of stars is bright because it has a great many stars, spread over 100,000 light-years. A quasar is bright for the opposite reason: a very small place, fed by a few Suns of gas a year, that turns a large share of what falls in into light. This is why a quasar can outshine the whole galaxy that holds it.
          </p>
          <p style={paragraphStyle}>
            <strong>5. A check on a real record-holder.</strong> J0529-4351, found in 2024 (ESO), is about {formatSuns(J0529_LUMINOSITY_SOLAR)}. At 10 percent the formula gives about {formatNumber(j0529.page)} Suns of mass a year, and ESO says its black hole takes “just over a Sun per day”, about 365 a year. The two agree to within about a tenth, but ESO does not say what share it used, so this shows that the method is consistent with a real object, and not that the 10 percent is known.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What is settled, and what is not.</strong> That quasars are fed by gas falling toward supermassive black holes is well established. The numbers for one quasar are not: the brightness of 3C 273 differs between sources, the spin of a real quasar’s black hole is not well known, and so the share of mass turned to light (about 6 percent up to about 42 percent in theory, and some textbooks quote about 32 percent as the extreme) is a range. How the disk makes its light, what drives the jets, and how fast a black hole can be fed (the subject of Cosmic Horizons 22) are not modeled here.
          </p>
          <p style={paragraphStyle}>
            <strong>7. The honest limits.</strong> This page used a stand-in: the share of mass that a probe gives up on its way down to the last safe orbit (Black Holes 8), as the share of falling gas that becomes light. It did not model the disk, magnetic fields, jets, dust, the host galaxy’s own light, or how long a quasar lasts. The one-week flicker, the three trial brightnesses and the “star-powered” bar are examples for the question, and not measurements.
          </p>
        </div>
      )}
    </div>
  )
}
