import { useState } from 'react'
import { horizonRadiusKm, runBlackHoleSizeExperiment } from '../physics/blackHoleSizeExperiment'

type SunRadiusChoice = 'earth-size' | 'thirty-km' | 'three-km'
type MassScalingChoice = 'ten' | 'thousand' | 'million'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleSizeTutorProps {
  predictedSunRadius: SunRadiusChoice
  predictedMassScaling: MassScalingChoice
  onExplained?: () => void
}

const sunRadiusLabels: Record<SunRadiusChoice, string> = {
  'earth-size': 'about 6,000 kilometers, the size of Earth',
  'thirty-km': 'about 30 kilometers',
  'three-km': 'about 3 kilometers, a few city blocks',
}

const massScalingLabels: Record<MassScalingChoice, string> = {
  ten: 'about 10 times wider',
  thousand: 'about 1,000 times wider',
  million: 'about a million times wider',
}

const KM_PER_AU = 149_597_870.7

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
  const earthHorizonMm = horizonRadiusKm(3.0e-6) * 1e6
  const stellarHorizonKm = horizonRadiusKm(10)
  const sgrHorizonAu = horizonRadiusKm(4.3e6) / KM_PER_AU
  const m87HorizonAu = horizonRadiusKm(6.5e9) / KM_PER_AU

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
              'Look at the ruler. Where is the object\'s marker compared with the red horizon line? How many times would you have to squeeze the object, and what happened when you squeezed it past the line?'}
            {tutorStep === 'compare' &&
              `You predicted that the Sun would have to be squeezed to ${sunRadiusLabels[predictedSunRadius]}, and that a black hole with 1,000 times the mass would have a horizon ${massScalingLabels[predictedMassScaling]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'A bigger mass needs a bigger ball to become a black hole. Why would more mass make the critical radius larger, not smaller?'}
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
            <strong>1. The critical radius has a name and a formula.</strong> The horizon radius is also called
            the <strong>Schwarzschild radius</strong>, after the physicist Karl Schwarzschild, who first found
            it in Einstein's theory in 1916. The formula is <strong>r = 2GM / c²</strong>: G is the
            gravitational constant, M is the mass, and c is the speed of light. It works out to about{' '}
            {fmt(kmPerSolarMass)} kilometers for every solar mass. Why does the speed of light appear? Because
            the horizon is the place where escaping would need exactly that speed.
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
            near it, and what falling in is like. This group of experiments is planned to take those questions
            up next. If you would like a fuller picture of what black holes are and how we know about them,
            there is an optional guide just above this, below the Results.
          </p>
        </div>
      )}
    </div>
  )
}
