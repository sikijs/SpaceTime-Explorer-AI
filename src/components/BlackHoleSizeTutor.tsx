import { useState } from 'react'
import {
  compareHorizonsOfSunAndThousandSuns,
  horizonRadiusKm,
  massScalingGuessIsModelAnswer,
  objectCards,
  PUBLISHED,
  runBlackHoleSizeExperiment,
  SUN_RADIUS_GUESS_KM,
  sunEscapeSpeedCheck,
  sunRadiusGuessIsModelAnswer,
} from '../physics/blackHoleSizeExperiment'
import type { MassScalingGuess, SunRadiusGuess } from '../physics/blackHoleSizeExperiment'

type SunRadiusChoice = SunRadiusGuess
type MassScalingChoice = MassScalingGuess
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleSizeTutorProps {
  predictedSunRadius: SunRadiusChoice
  predictedMassScaling: MassScalingChoice
  onExplained?: () => void
}

const sunRadiusLabels: Record<SunRadiusChoice, string> = {
  'about-6000-km': 'about 6,000 kilometers, the size of Earth',
  'about-30-km': 'about 30 kilometers',
  'about-3-km': 'about 3 kilometers, a few city blocks',
}

const massScalingLabels: Record<MassScalingChoice, string> = {
  ten: 'about 10 times wider',
  thousand: 'about 1,000 times wider',
  million: 'about a million times wider',
}

// Three significant figures, with thousands separators for large values.
function fmt(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function BlackHoleSizeTutor({ predictedSunRadius, predictedMassScaling, onExplained }: BlackHoleSizeTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, never typed in by hand. The radius
  // chosen here is irrelevant: only the horizon radii and the squeeze needed are used.
  const kmPerSolarMass = horizonRadiusKm(1)
  const squeezeFor = (id: 'earth' | 'sun' | 'neutron-star') => runBlackHoleSizeExperiment(id, 1).squeezeNeeded!
  const sunSqueeze = squeezeFor('sun')
  const earthSqueeze = squeezeFor('earth')
  const neutronSqueeze = squeezeFor('neutron-star')
  const cards = objectCards()
  const cardOf = (id: string) => cards.find((c) => c.id === id)!
  const earthHorizonMm = cardOf('earth').horizonRadiusKm * 1e6
  const stellarHorizonKm = cardOf('stellar-black-hole').horizonRadiusKm
  const sgrHorizonAu = cardOf('sgr-a-star').horizonRadiusAu
  const m87HorizonAu = cardOf('m87-star').horizonRadiusAu
  const thousandSuns = compareHorizonsOfSunAndThousandSuns()
  const sunCheck = sunEscapeSpeedCheck()
  const sunRadiusMatch = sunRadiusGuessIsModelAnswer(predictedSunRadius)
  const massScalingMatch = massScalingGuessIsModelAnswer(predictedMassScaling)

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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Picture 1, the ruler. Find the yellow dot, the red horizon line and the white YOUR GUESS box. Where is the Sun\'s dot compared with the red line? How many times did the Sun have to be squeezed, and what happened when the dot reached the line?'}
            {tutorStep === 'compare' &&
              `You guessed that the Sun would have to be squeezed to ${sunRadiusLabels[predictedSunRadius]}, and that a black hole with 1,000 times the mass would have a horizon ${massScalingLabels[predictedMassScaling]}. Compare the white YOUR GUESS box in Picture 1 with the red horizon line, and the white bar in Picture 1b with the two red bars. What do you notice?`}
            {tutorStep === 'conceptual' &&
              'A bigger mass needs a bigger ball to become a black hole. Why would more mass make the horizon radius larger, not smaller?'}
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
            <strong>Your two guesses.</strong> <em>First guess:</em> you guessed {sunRadiusLabels[predictedSunRadius]}.
            {sunRadiusMatch
              ? ` That matches what the model gives: the Sun's horizon radius is about ${fmt(kmPerSolarMass)} kilometers.`
              : ` That is not what the model gives: the Sun's horizon radius is about ${fmt(kmPerSolarMass)} kilometers. ${
                  predictedSunRadius === 'about-30-km'
                    ? `About 30 kilometers is the horizon radius of a black hole with 10 Suns' worth of mass, ten times the Sun's.`
                    : `A ball ${fmt(SUN_RADIUS_GUESS_KM[predictedSunRadius] / kmPerSolarMass)} times wider than the Sun's horizon radius is far too big: the Sun would have to be squeezed much smaller than that.`
                }`}{' '}
            <em>Second guess:</em> you guessed {massScalingLabels[predictedMassScaling]}.
            {massScalingMatch
              ? ` That matches: a black hole with 1,000 times the mass has a horizon about ${fmt(thousandSuns.largeHorizonKm)} kilometers in radius, against ${fmt(thousandSuns.smallHorizonKm)} for one Sun, exactly ${fmt(thousandSuns.realRatio)} times wider.`
              : ` That is not what the model gives: the horizon is exactly ${fmt(thousandSuns.realRatio)} times wider (${fmt(thousandSuns.largeHorizonKm)} kilometers against ${fmt(thousandSuns.smallHorizonKm)}). The horizon radius is directly proportional to the mass, so 1,000 times the mass gives 1,000 times the radius, not 10 times and not a million times.`}
          </p>
          <p style={paragraphStyle}>
            <strong>1. The critical size has a name and a formula.</strong> In this experiment the critical size has
            had one meaning all along: the <strong>horizon radius</strong>. If an object's whole mass is squeezed
            into a ball of that radius or smaller, it is a black hole. Here is where it comes from.
          </p>
          <p style={paragraphStyle}>
            <em>Escape speed.</em> To leave a ball's gravity for good, something has to be launched fast enough.
            That minimum speed is the <strong>escape speed</strong>. NASA's Earth Fact Sheet gives it for Earth as{' '}
            {PUBLISHED.earthEscapeSpeedKmPerS} kilometers per second. Think of throwing a ball upward: the harder you
            throw it, the higher it goes, and with enough speed it never comes back.
          </p>
          <p style={paragraphStyle}>
            <em>Squeezing raises it.</em> Squeeze the same mass into a smaller ball and the escape speed at its
            surface goes up, because you start closer to the middle. Keep squeezing and there is one radius where the
            escape speed reaches the speed of light. Nothing can go faster than light, so inside that radius nothing
            can escape, not even light. That radius is the horizon radius.
          </p>
          <p style={paragraphStyle}>
            <em>A check with the real Sun.</em> NASA's Sun Fact Sheet gives the escape speed from the Sun's surface as{' '}
            {sunCheck.sunEscapeSpeedKmPerS} kilometers per second, a tiny fraction of the speed of light (
            {Math.round(sunCheck.speedOfLightKmPerS).toLocaleString('en-US')} kilometers per second). We squeezed the Sun
            by a factor of about {fmt(sunCheck.squeezeFactor)}. The escape speed grows as the square root of that
            factor, which is about {sunCheck.speedGrowthFactor.toFixed(1)}. So {sunCheck.sunEscapeSpeedKmPerS} ×{' '}
            {sunCheck.speedGrowthFactor.toFixed(1)} ≈{' '}
            {(Math.round(sunCheck.escapeSpeedAtHorizonKmPerS / 100) * 100).toLocaleString('en-US')} kilometers per
            second: the speed of light. That is why {fmt(kmPerSolarMass)} kilometers is the Sun's horizon radius.
          </p>
          <p style={paragraphStyle}>
            <em>The name and the formula.</em> The horizon radius of a black hole that does not spin and has no
            electric charge is also called the <strong>Schwarzschild radius</strong>, after Karl Schwarzschild, who
            found it in 1916 by solving Einstein's equations. The formula is <strong>r = 2GM / c²</strong>. Here G is
            the gravitational constant (how strong gravity is), M is the mass and c is the speed of light. It comes
            from asking when the escape speed, √(2GM ÷ r), equals c. It works out to about {fmt(kmPerSolarMass)}{' '}
            kilometers for every solar mass. The speed of light appears because the horizon is the place where
            escaping would need exactly that speed.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The radius is directly proportional to the mass.</strong> Twice the mass means twice
            the radius. Here is a worked example. One Sun: 1 × {fmt(kmPerSolarMass)} ≈ {fmt(kmPerSolarMass)} km.
            Ten Suns: 10 × {fmt(kmPerSolarMass)} ≈ {fmt(stellarHorizonKm)} km. One thousand Suns: 1,000 ×{' '}
            {fmt(kmPerSolarMass)} ≈ {fmt(horizonRadiusKm(1000))} km. So 1,000 times the mass makes the horizon
            1,000 times wider. It does not make it 10 times wider, and it does not make it a million times
            wider. This also answers the question above: more mass pulls harder at every distance, so it takes
            a bigger ball, with its surface farther from the middle, to keep the pull from reaching the
            limit.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Real objects are far from the threshold, except one.</strong> The Sun would have to be
            squeezed about {fmt(sunSqueeze)} times smaller. Earth would have to be squeezed about{' '}
            {fmt(earthSqueeze)} times smaller, to a ball with a radius of only about {fmt(earthHorizonMm)}
            millimeters. A neutron star would only have to shrink about {fmt(neutronSqueeze)} times. That is why,
            in the earlier chapters, gravity's strange effects were tiny for ordinary objects and become large
            only around very compact ones.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Black holes come in very different sizes.</strong> A black hole of 10 Suns has a
            horizon about {fmt(stellarHorizonKm)} kilometers in radius, like a small city. Sagittarius A*, at
            the center of our galaxy, has one about {fmt(sgrHorizonAu)} AU, a fifth of the way from the Sun to
            Mercury. M87* has one about {fmt(m87HorizonAu)} AU, several times wider than the orbit of Neptune.
            The largest black holes are not "dense" in the everyday sense: spread over the whole volume inside
            their horizons, their average density is low, even lower than air, because the volume grows much
            faster than the mass.
          </p>
          <p style={paragraphStyle}>
            <strong>5. This is the same radius as in Experiment 7.</strong> In Gravity and Curved Spacetime,
            Experiment 7, you found the mass at which the escape speed reaches the speed of light, using
            ordinary gravity. The same thing happens here, in real units: the escape speed in the table reaches
            exactly the speed of light at the horizon radius. General relativity, the exact theory, gives the
            same number. What it adds is what the horizon really is. It is not a surface or a wall. It is a
            one-way boundary: you can cross it going in, and nothing, not even light, can come back out.
          </p>
          <p style={paragraphStyle}>
            <strong>6. The honest limits.</strong> This was a thought experiment. It did not say how a real
            object could be squeezed, and it says nothing about what happens inside the horizon. The formula was
            given, not derived, and it is for a black hole that does not spin and has no electric charge. Real
            black holes usually spin, and the horizon of a spinning one is more complicated. The real sizes of
            Earth, the Sun and the neutron star were rounded values.
          </p>
          <p style={paragraphStyle}>
            <strong>7. Not covered here.</strong> What time does near a black hole, what orbits and light do
            near it, and what falling in is like. This group of experiments takes those questions up next. If you
            would like a fuller picture of what black holes are and how we know about them, an optional guide to black holes appears just below this.
          </p>
        </div>
      )}
    </div>
  )
}
