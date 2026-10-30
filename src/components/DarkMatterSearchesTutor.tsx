import { useState } from 'react'
import {
  chanceOfNoEvents,
  countRange,
  EXPECTED_AT_LIMIT,
  globalEffect,
  globalSigma,
  limitAtLiveDays,
  LZ230616,
  LZ_DECEMBER_2025,
  LZ_LIMIT_2025,
  OTHER_BORON8_SIGMAS,
  runDarkMatterSearches,
  TRIES_FOR_LZ_GLOBAL,
} from '../physics/darkMatterSearches'
import type { Background, CountRange, GlobalEffect } from '../physics/darkMatterSearches'
import { chanceOfAtLeastOne } from '../physics/evolvingDarkEnergy'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DarkMatterSearchesTutorProps {
  strength: number // the learner's own search ("Try your own search")
  exposure: number
  background: Background
  tries: number // "How many places did you look?"
  countPrediction: CountRange
  effectPrediction: GlobalEffect
  onExplained?: () => void
}

const countWords: Record<CountRange, string> = {
  point23: 'about 0.23 events',
  twoPoint3: 'about 2.3 events',
  twentyThree: 'about 23 events',
}
const effectWords: Record<GlobalEffect, string> = {
  lower: 'lower than 3.4 sigma',
  same: 'the same, 3.4 sigma',
  higher: 'higher than 3.4 sigma',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Cosmic Horizons Experiment 6. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number
// comes from the physics module (darkMatterSearches.ts), never typed in by hand (CLAUDE.md §9). The published statements follow the sources in the
// specification's source table (the SLAC release of 8 December 2025 and the abstracts of arXiv:2609.02823, 2609.08893 and 2609.10504, through fetch
// summaries). The predictions are marked only in the explanation (the owner's choice for the group), never before it. The tutor does not call the
// event dark matter, and does not call it a fluke.
export function DarkMatterSearchesTutor({ strength, exposure, background, tries, countPrediction, effectPrediction, onExplained }: DarkMatterSearchesTutorProps) {
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

  const mine = runDarkMatterSearches(strength, exposure, background, tries)
  const actualCount = countRange(0.1, 10)
  const actualEffect = globalEffect()
  const percent = (value: number) => (value * 100).toFixed(1)
  const f2 = (value: number) => value.toFixed(2)
  const noneAtLimit = chanceOfNoEvents(EXPECTED_AT_LIMIT)
  const limitNone = limitAtLiveDays(1000, 'none')
  const limitGrows = limitAtLiveDays(1000, 'grows')
  const daysRatio = 1000 / LZ_LIMIT_2025.liveDays
  // The dice comparison: a 1-in-20 chance in one try, and the chance that at least one of the tries gives it.
  const diceChance = chanceOfAtLeastOne(1 / 20, 14)
  const globalAt14 = globalSigma(LZ230616.localSigma, 14)
  const cm2 = (value: number) => {
    const [mantissa, exponent] = value.toExponential(1).split('e')
    return `${mantissa} × 10^${Number(exponent)} cm²`
  }

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
              'Look at Picture 1 and Picture 3. What do you notice about where today’s limit sits on Picture 1, and about where the five bars of Picture 3 sit compared with the 3 sigma and 5 sigma lines?'}
            {tutorStep === 'compare' &&
              `You predicted that a particle ten times weaker than the limit, searched for ten times longer with no background, would be expected to give ${countWords[countPrediction]}, and that, once all the places the search looked are counted, the strength of the 2026 event would be ${effectWords[effectPrediction]}. Now look at Table 1 and Table 2, and at your own search. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              `A detector that saw nothing for ${LZ_DECEMBER_2025.liveDays} live days is now reported to have seen one strange event. How would you decide whether that event is dark matter, a fluke, or something else? What would you want to know?`}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted{' '}
            <em>{countWords[countPrediction]}</em> for a particle ten times weaker than the limit, searched for ten times longer. Ten times weaker means
            ten times fewer bumps, and ten times longer means ten times more, so the two cancel: {EXPECTED_AT_LIMIT.toFixed(4)} × 0.1 × 10 ={' '}
            {EXPECTED_AT_LIMIT.toFixed(4)}, which is <em>{countWords[actualCount]}</em>.{' '}
            {countPrediction === actualCount ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {countPrediction === 'twentyThree' &&
              ' It is an easy mistake to make: the longer run is the change that is easiest to notice, and the weaker interaction is easy to forget.'}
            {countPrediction === 'point23' &&
              ' It is an easy mistake to make: the weaker interaction is the change that is easiest to notice, and the longer run is easy to forget.'}{' '}
            You predicted that the strength of the 2026 event, with all the places looked counted, would be <em>{effectWords[effectPrediction]}</em>. LZ’s
            published numbers are {LZ230616.localSigma} sigma at the place where the event appeared and {LZ230616.globalSigma} sigma overall, which is{' '}
            <em>{effectWords[actualEffect]}</em>. {effectPrediction === actualEffect ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {effectPrediction === 'same' &&
              ' It is a natural thought, because the event is the event. What changes is not the event but the question: how often would chance alone give an excess this strong somewhere?'}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. Your own search, in numbers.</strong> You tried a strength of {strength} times today’s limit and an exposure of {exposure} times the
            reference. A search expects {EXPECTED_AT_LIMIT.toFixed(4)} × {strength} × {exposure} = {mine.expected.toFixed(3)} bumps. The chance of seeing
            none is e^(−{mine.expected.toFixed(3)}) = {percent(mine.chanceOfNoEvents)} percent, and the chance of seeing at least one is{' '}
            {percent(mine.chanceOfAtLeastOneEvent)} percent. {mine.expected > EXPECTED_AT_LIMIT
              ? 'Your particle is stronger than the limit for that exposure, so a search that saw nothing would rule it out.'
              : mine.expected < EXPECTED_AT_LIMIT
                ? 'Your particle is weaker than the limit for that exposure, so a search that saw nothing would not rule it out.'
                : 'Your particle sits exactly at the limit for that exposure.'}
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why seeing nothing still teaches something.</strong> Think of rain on a roof. If you expected 5 raindrops on a small tile in a
            minute and none fell, that would be surprising: the forecast was probably wrong. If you expected a tenth of a raindrop and none fell, it would
            tell you nothing. Dark-matter searches work the same way. A <strong>limit</strong> is the strength at which seeing none would be a 1-in-10
            accident: e^(−{EXPECTED_AT_LIMIT.toFixed(4)}) = {percent(noneAtLimit)} percent. A search that sees nothing rules out the stronger
            interactions, and says nothing about the weaker ones. That is also why a ten times longer run can test an interaction ten times weaker: the
            longer run gives ten times as many chances for a bump, which makes up for each interaction being ten times less likely to cause one.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Why more data does not help for ever.</strong> If the search had no background, a limit would fall in step with the data. LZ’s{' '}
            {cm2(LZ_LIMIT_2025.crossSectionCm2)} after {LZ_LIMIT_2025.liveDays} live days would become {cm2(LZ_LIMIT_2025.crossSectionCm2)} ÷{' '}
            {daysRatio.toFixed(3)} = {cm2(limitNone)} after 1,000 live days. If a background grows with the data, extra flashes that are not dark matter
            get in the way, and the limit falls only by the square root: {cm2(LZ_LIMIT_2025.crossSectionCm2)} ÷ {Math.sqrt(daysRatio).toFixed(2)} ={' '}
            {cm2(limitGrows)}. These are two idealised rules, not LZ’s own forecast. Neutrinos from the Sun’s core are one such background. LZ saw the boron-8 kind at {LZ_DECEMBER_2025.boron8Sigma} sigma, stronger than the {OTHER_BORON8_SIGMAS.xenonNT} sigma of XENONnT and
            the {OTHER_BORON8_SIGMAS.pandaX4T} sigma of PandaX-4T. That is a real discovery in its own right, and a sign that the detector is
            reaching the neutrino fog, where the Sun’s neutrinos make the same kind of flash as a light dark-matter particle.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What has, and has not, been ruled out.</strong> LZ’s {LZ_DECEMBER_2025.liveDays} live days showed no sign of dark-matter
            particles of {LZ_DECEMBER_2025.massRangeGeV.low} to {LZ_DECEMBER_2025.massRangeGeV.high} times a proton’s mass, and the simplest kinds of
            particle are ruled out at the masses and strengths searched. That does <em>not</em> mean that dark matter does not exist. Its gravity is
            measured (Cosmology Experiments 4 and 7): galaxies spin too fast, and light is bent by more mass than we can see. What is ruled out is one
            kind of particle in one range of masses and strengths.
          </p>

          <p style={paragraphStyle}>
            <strong>5. The unexpected event.</strong> In 2026 LZ searched a wider range of recoil energies and reported one event at{' '}
            {LZ230616.energyKeV} keV (give or take {LZ230616.statisticalKeV} from counting and {LZ230616.systematicKeV} from the instrument), after{' '}
            {LZ230616.exposureTonneYears} tonne-years. Counting only the place where it appeared, the chance that chance alone gives so strong an excess
            is {mine.localChance.toExponential(2)}, or {LZ230616.localSigma} sigma. But the search looked in many places, and the more places you look,
            the more likely it is that something odd turns up in one of them. Think of rolling 14 twenty-sided dice. Any one die shows a 20 only 1 time in
            20, but the chance that at least one of the 14 does is 1 − (19/20)^14 = {percent(diceChance)} percent. In the same way, about{' '}
            {TRIES_FOR_LZ_GLOBAL.toFixed(1)} independent places turn {LZ230616.localSigma} sigma into {LZ230616.globalSigma} sigma (14 places give{' '}
            {globalAt14.toFixed(1)}), which is below the 3 sigma line of “evidence” (Experiment 2). You chose {tries} places and got {f2(mine.globalSigma)}{' '}
            sigma. This is only an illustration: LZ did not count independent places, and its own number comes from a more detailed method.
          </p>

          <p style={paragraphStyle}>
            <strong>6. What is said about it.</strong> The collaboration’s own paper says that the event “does not establish a dark matter origin”. Theory groups posted proposals within days. One paper studies a possible interpretation with two kinds of dark-matter particle, in which a particle changes into the other kind as it bumps a nucleus (Yuan and colleagues, 8 September 2026). Another asks whether neutrinos bumping a nucleus could account for it, and finds that they cannot in any of the scenarios it considered (Chattaraj and colleagues, 9 September 2026). These papers are early. None of them is established, and this experiment does not say which, if
            any, is right. It would be wrong to call the event dark matter, and it would be wrong to call it a fluke: it is an open question.
          </p>

          <p style={paragraphStyle}>
            <strong>7. What would settle it.</strong> More data from LZ, which plans over {LZ_DECEMBER_2025.plannedLiveDaysBy2028} live days by 2028, would
            show whether more events appear at similar energies. Independent experiments, such as XENONnT and PandaX-4T, could look for the same kind of
            event with different detectors. Until then, whether the event is a one-off or the start of a pattern cannot be told from this
            one event alone.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw how the expected number of bumps, the chance of seeing none and the limit follow
            from the strength and the exposure, how the limit improves with more data under two idealised rules, and how counting the places looked
            changes how sure an excess is. What this experiment did <strong>not</strong> do is reproduce LZ’s limits, which come from a more detailed
            statistical method, or say what the event at {LZ230616.energyKeV} keV is.
          </p>
        </div>
      )}
    </div>
  )
}
