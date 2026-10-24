import { useState } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  distanceErrorWorkedExample,
  distanceTravelledPc,
  runWhiteDwarfExplosion,
  shellSpeedWorkedExample,
  sizeAnswer,
  speedAnswer,
  SPEED_OF_LIGHT_KM_S,
  WHITE_DWARF_EXPLOSION,
} from '../physics/whiteDwarfExplosion'
import type { SizeAnswer, SpeedAnswer } from '../physics/whiteDwarfExplosion'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface WhiteDwarfExplosionTutorProps {
  sizePrediction: SizeAnswer
  speedPrediction: SpeedAnswer
  onExplained?: () => void
}

const sizeWords: Record<SizeAnswer, string> = {
  'about 0.5 Suns': 'about 0.5 Suns',
  'about 1.0 Sun': 'about 1.0 Sun',
  'about 1.4 Suns': 'about 1.4 Suns (the limit)',
}
const speedWords: Record<SpeedAnswer, string> = {
  'about 50 km/s': 'about 50 kilometres a second',
  'about 5,000 km/s': 'about 5,000 kilometres a second',
  'about 300,000 km/s': 'about 300,000 kilometres a second (the speed of light)',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const thousandsComma = (value: number): string => Math.round(value).toLocaleString('en-US')
const roundTo = (value: number, step: number): number => Math.round(value / step) * step

// The tutor of Frontier and Beyond Experiment 14. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (whiteDwarfExplosion.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source table. The predictions are marked only in
// the explanation (the owner's choice for the group). The tutor does not say how many Type Ia supernovae are double detonations, does not say that the standard-candle method
// is in trouble, does not say that this remnant explains the Hubble tension, and does not choose between the double detonation and the other reading beyond the status label.
export function WhiteDwarfExplosionTutor({ sizePrediction, speedPrediction, onExplained }: WhiteDwarfExplosionTutorProps) {
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
  const d = WHITE_DWARF_EXPLOSION
  const result = runWhiteDwarfExplosion()
  const rightSize = sizeAnswer()
  const rightSpeed = speedAnswer()
  const typical = runWhiteDwarfExplosion({ massSolar: d.pictureMassesSolar[0] })
  const nearLimit = runWhiteDwarfExplosion({ massSolar: d.pictureMassesSolar[3] })
  const shellExample = shellSpeedWorkedExample(d.outerShellPc, result.ageYears)
  const brightnessExample = distanceErrorWorkedExample(-0.2)
  const slowReach = distanceTravelledPc(50, result.ageYears)
  const lightReach = distanceTravelledPc(SPEED_OF_LIGHT_KM_S, result.ageYears)

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
              'Look at Picture 1. Which white dwarf is the smallest and which is the heaviest, and what happens to the size as the weight goes up? Then look at Picture 3: how many shells of calcium are there, and how far apart are they?'}
            {tutorStep === 'compare' &&
              `You predicted that the white dwarf in the remnant was ${sizeWords[sizePrediction]}, and that the outer shell has moved ${speedWords[speedPrediction]}. Now look at Tables 1 and 2 and at Pictures 2 and 3. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'Two teams look at the same remnant. One says the two shells of calcium show a double detonation. Another says they could come from instabilities in a different kind of explosion. What would you want to measure next to tell them apart?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that the white dwarf in the remnant was{' '}
            <em>{sizeWords[sizePrediction]}</em>. The simulation that matches the two shells has {result.simulationMassSolar.toFixed(3)} Suns (Table 1), so <em>{sizeWords[rightSize]}</em> is the nearest answer.{' '}
            {sizePrediction === rightSize ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sizePrediction === 'about 1.4 Suns' &&
              ` It is the textbook story: a white dwarf is said to explode as it nears 1.4 Suns, and that is the route NASA describes. But the simulation that matches this remnant is ${result.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit. That is for this one remnant. It does not say that every Type Ia supernova works this way.`}
            {sizePrediction === 'about 0.5 Suns' &&
              ` A white dwarf of 0.5 Suns is a typical one (NASA says a typical white dwarf is about half the Sun), so it is a reasonable guess. But the simulation that matches the two shells needs a carbon-oxygen core of ${d.simulationCoreSolar} Suns, which is much heavier than a typical white dwarf.`}
            {sizePrediction === 'about 1.0 Sun' &&
              ` That is the weight the simulation gives for the core, ${d.simulationCoreSolar} Suns, and the 2026 analysis gives a core of about ${d.analysis2026CoreSolar} Sun. It is for this one remnant, and the weight comes from the simulation that fits, not from weighing the star.`}{' '}
            You also predicted that the outer shell has moved <em>{speedWords[speedPrediction]}</em>. Its distance, {d.outerShellPc} parsecs, divided by the remnant’s age of {result.ageYears} years gives about{' '}
            {thousandsComma(roundTo(result.outerShellSpeedKmS, 10))} km/s (Table 2), so <em>{speedWords[rightSpeed]}</em> is the nearest answer. {speedPrediction === rightSpeed ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {speedPrediction === 'about 50 km/s' &&
              ` At 50 km/s, in ${result.ageYears} years a shell would get only ${slowReach.toFixed(3)} parsecs from the centre. The outer shell is ${d.outerShellPc} parsecs out, so it has had to move much faster.`}
            {speedPrediction === 'about 300,000 km/s' &&
              ` At the speed of light, in ${result.ageYears} years a shell would be ${lightReach.toFixed(1)} parsecs out, but the outer shell is ${d.outerShellPc}. Nothing in an explosion like this reaches the speed of light: the shell has gone about ${(result.outerShellFractionOfLightSpeed * 100).toFixed(0)} percent as far as light would.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why a white dwarf has a limit, and why a heavy one is small.</strong> Think of a theatre where every seat holds one person. A white dwarf holds itself up in a similar way: no two electrons can be in
            exactly the same state, so when they are crowded together they push back (electron degeneracy pressure, Black Holes Experiment 9). A heavier white dwarf has more weight to hold up, so its electrons
            have to be packed tighter, and the star shrinks. A white dwarf of {typical.massSolar} Suns has a radius of {typical.radiusEarths.toFixed(2)} Earth radii, and one of {nearLimit.massSolar} Suns only {nearLimit.radiusEarths.toFixed(2)}
            (Picture 1). The squeezing cannot go on for ever: at {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns in the model this page reuses (1.4 in NASA’s and Chandra’s pages) the electrons cannot hold any more, and that is the limit.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Route 1: the white dwarf grows to the limit.</strong> NASA describes it: gas flows onto the white dwarf from a partner, and as it nears 1.4 Suns “the pressure at the center will exceed the
            threshold for the carbon and oxygen nuclei to start to fuse uncontrollably”. <strong>Why does the centre ignite?</strong> Inside a white dwarf the carbon and oxygen are fuel that the star could not burn when it was making
            energy, because its core was never squeezed hard enough. Fusion needs the nuclei pushed very close together. Each bit of gas from the partner adds weight, and the weight squeezes
            the centre harder. Near the limit, the centre is squeezed enough for the nuclei to start to fuse. Then comes the “uncontrollably” in NASA’s sentence. In an ordinary star, heat makes
            the gas expand and cool, which keeps fusion steady. A white dwarf is held up by electron degeneracy pressure, which hardly changes with heat, so the star does not expand and cool.
            The fusion makes heat, the heat speeds up the fusion, and so on. It is like a pot with its lid clamped on, where an open pan could bubble over and cool. The result is a runaway,
            and the star explodes. Think of filling ten bottles to the same line: they all weigh nearly the same. If every white dwarf exploded when it reached the same
            weight, the explosions would give out nearly the same energy, and that is why NASA says astronomers use Type Ia supernovae as “standard candles”. This was the older idea, and it would explain why the explosions look alike.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Route 2: a double detonation.</strong> A white dwarf can also collect a thin layer of helium on its surface. In a firework, a small charge can set off a big one, and the idea here is similar: if the
            helium layer ignites, a shock runs inward and compresses the carbon-oxygen core, and the core may then ignite too. ESO’s release calls this a “double-detonation” mechanism. In the simulation that matches the
            remnant, the helium layer is only {d.simulationShellSolar} Suns, a thin layer on a core of {d.simulationCoreSolar}. The whole white dwarf is {result.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit, so on this route it does not
            have to reach the limit first.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What two shells of calcium show.</strong> Das and others (2025) found calcium glowing in two separate rings, at {d.innerShellPc} and {d.outerShellPc} parsecs from the centre (Picture 3). Each radius is good to about{' '}
            {d.shellUncertaintyPc} parsecs, and the gap between them, {result.shellGapPc.toFixed(2)} parsecs, is about {result.separationInUncertainties.toFixed(1)} times the two give-or-takes together, so the two peaks are real. Simulations of a double detonation put
            the calcium made in the helium layer in the outer shell and the calcium made in the core in the inner one. Now the speed. If you drive 300 km in 3 hours, you averaged 100 km/h. The outer shell is {d.outerShellPc} parsecs, about{' '}
            {(shellExample.radiusKm / 1e12).toFixed(0)} million million km, from the centre, and it has had about {result.ageYears} years, about {(shellExample.ageSeconds / 1e9).toFixed(1)} thousand million seconds, so its average speed is{' '}
            {thousandsComma(roundTo(shellExample.speedKmS, 10))} km/s, about {(shellExample.fractionOfLight * 100).toFixed(0)} percent of the speed of light. It is an average: the gas has slowed since the explosion.
          </p>
          <p style={paragraphStyle}>
            <strong>5. One remnant is not all of them.</strong> What the two shells mean is not settled, and the status label says so. Das and others, and a 2026 study by Mandal and others of the remnant’s small-scale structure, find
            that a double detonation of a white dwarf of about 1 Sun fits. Das and others also say that a “quadruple detonation” in a merger of white dwarfs could look similar. Soker (2025) suggests a different kind of explosion, in
            which instabilities make the two shells (read in its abstract only). You were asked what you would measure next, and you may well have thought of something these papers have not. Even if the double detonation is right for this
            remnant, nothing here says how many of the Type Ia supernovae seen in distant galaxies exploded this way. That is still open.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Why distances care.</strong> Picture two lamps of exactly the same brightness. The one down the road looks dimmer, and because you know they are the same lamp, the dimness tells you how far away it is. A lamp
            that looks a quarter as bright is twice as far, because brightness falls as 1 ÷ distance². Type Ia supernovae are used the same way, as lamps in distant galaxies (Experiments 1 and 2 used distances like these). Now suppose a supernova
            actually gave out {(brightnessExample.brightnessFraction * 100).toFixed(0)} percent of the light that was assumed. The distance would come out wrong by 1 ÷ the square root of {brightnessExample.brightnessFraction.toFixed(1)}, which is 1 ÷ {brightnessExample.squareRoot.toFixed(3)} = {brightnessExample.distanceFactor.toFixed(3)}, so {brightnessExample.percent.toFixed(1)} percent too large
            (Picture 3). This page does not say how big the real differences between Type Ia supernovae are, or how astronomers deal with them. Those are matters for other sources, so nothing here says that distances measured with them are wrong.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that a white dwarf shrinks as it gets heavier, with a limit at about 1.4 Suns; that two routes to an explosion have been proposed; that in one remnant two separate
            shells of calcium, {d.innerShellPc} and {d.outerShellPc} parsecs out, match a double detonation of a white dwarf of about {result.simulationMassSolar.toFixed(2)} Suns, {result.percentBelowLimit.toFixed(0)} percent below the limit; that their average speeds are about{' '}
            {thousandsComma(roundTo(result.innerShellSpeedKmS, 100))} and {thousandsComma(roundTo(result.outerShellSpeedKmS, 100))} km/s; and how a difference in brightness would carry into a distance. You did not see a simulation of either explosion, a count of how many Type Ia
            supernovae explode each way, or a measurement of how much real Type Ia supernovae differ. A second remnant with the same pattern, or a reading of the first that explains the shells another way, could change the picture.
          </p>
        </div>
      )}
    </div>
  )
}
