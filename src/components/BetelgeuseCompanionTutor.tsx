import { useState } from 'react'
import {
  BETELGEUSE,
  brightnessRatio,
  chanceOfSigma,
  COMPANION,
  headsInARow,
  keplerPeriodYears,
  keplerWorking,
  matchingDistancePc,
  oneInChance,
  parsecsFromLightYears,
  periodAgreementPercent,
  periodSwingPercent,
  PLANETS,
  radiusAU,
  radiusRangeAU,
  runBetelgeuseCompanion,
  separationMismatchPercent,
  sigmaAnswer,
  SOLAR_RADII_PER_AU,
  sizeAnswer,
  widthAU,
} from '../physics/betelgeuseCompanion'
import type { Reach, SigmaAnswer } from '../physics/betelgeuseCompanion'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BetelgeuseCompanionTutorProps {
  reachPrediction: Reach
  sigmaPrediction: SigmaAnswer
  onExplained?: () => void
}

const reachWords: Record<Reach, string> = {
  'inside Earth': 'inside Earth’s orbit',
  'past Earth': 'past Earth’s orbit but not as far as Mars',
  'past Mars': 'past Mars but not as far as Jupiter',
  'past Jupiter': 'past Jupiter’s orbit',
}
const sigmaWords: Record<SigmaAnswer, string> = {
  '1 in 2': 'about 1 time in 2',
  '1 in 15': 'about 1 time in 15',
  '1 in 3.5 million': 'about 1 time in 3.5 million',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Cosmic Horizons Experiment 12. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (betelgeuseCompanion.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source table. The predictions are marked only
// in the explanation (the owner's choice for the group). The tutor does not say that the companion is confirmed, does not choose among the three estimates of its mass, does
// not combine the lines of evidence into one number, and does not say when Betelgeuse will explode.
export function BetelgeuseCompanionTutor({ reachPrediction, sigmaPrediction, onExplained }: BetelgeuseCompanionTutorProps) {
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
  const result = runBetelgeuseCompanion()
  const range = radiusRangeAU()
  const rightReach = sizeAnswer()
  const rightSigma = sigmaAnswer()
  const sigma = COMPANION.reportedSigma
  const width = widthAU(BETELGEUSE.angularDiameterMas, BETELGEUSE.distancePc)
  const jupiter = PLANETS[4].orbitAU
  const nasaParsecs = parsecsFromLightYears(700) // NASA's page says about 700 light-years
  const nasaRadius = radiusAU(BETELGEUSE.angularDiameterMas, nasaParsecs)
  const working = keplerWorking(result.modelSeparationAU, BETELGEUSE.massSolar, COMPANION.massSolar)
  const companionSwing = periodSwingPercent(
    { mass1Solar: BETELGEUSE.massSolar, mass2Solar: COMPANION.massChoicesSolar[0] },
    { mass1Solar: BETELGEUSE.massSolar, mass2Solar: COMPANION.massChoicesSolar[3] },
  )
  const starSwing = periodSwingPercent(
    { mass1Solar: BETELGEUSE.massChoicesSolar[0], mass2Solar: COMPANION.massSolar },
    { mass1Solar: BETELGEUSE.massChoicesSolar[2], mass2Solar: COMPANION.massSolar },
  )
  const sunLike = keplerPeriodYears(1, 1, 3e-6) // one year: the Earth round the Sun, as a check of the law
  const coins = headsInARow(sigma)
  const mismatch = separationMismatchPercent(BETELGEUSE.distancePc)
  const fainterBy = Math.round(brightnessRatio(COMPANION.magnitudeDifference))
  const inside = `${result.planetsInside.slice(0, -1).join(', ')} and ${result.planetsInside[result.planetsInside.length - 1]}`
  const oneInText = (z: number) => (oneInChance(z) < 1000 ? `1 time in ${Math.round(oneInChance(z))}` : `1 time in ${(oneInChance(z) / 1e6).toFixed(2)} million`)

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
              'Look at Picture 1. Next to the orbits of the planets, how big is Betelgeuse? Which orbits lie inside it, and which outside? And in Picture 2, how does the companion’s orbit compare with the star itself?'}
            {tutorStep === 'compare' &&
              `You predicted that Betelgeuse’s surface would reach ${reachWords[reachPrediction]}, and that noise alone would make a spot as strong as the reported one ${sigmaWords[sigmaPrediction]}. Now look at Tables 1 to 3 and at Pictures 1, 2 and 3. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'A team looked at the place and time where a companion was predicted, and saw a faint spot at 1.5 sigma. Other teams, using other kinds of data, found signs that follow the same cycle of about six years. What would make you trust the claim more, and what would make you wait?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that Betelgeuse’s surface would
            reach <em>{reachWords[reachPrediction]}</em>. With a radius of {result.radiusAU.toFixed(2)} AU (Table 1) it reaches <em>{reachWords[rightReach]}</em>: the orbits of{' '}
            {inside} are inside it, and Jupiter’s ({jupiter} AU) is not. {reachPrediction === rightReach ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {reachPrediction === 'past Jupiter' &&
              ` It is a natural thought, because NASA’s page says that if Betelgeuse replaced the Sun it “would stretch past Jupiter’s orbit”. That fits the star’s width across, which is ${width.toFixed(1)} AU (more than Jupiter’s ${jupiter} AU), but your prediction was about the surface measured from the centre, and that is the radius, half of the width: ${result.radiusAU.toFixed(2)} AU. Even the biggest radius the papers allow, ${range.max.toFixed(1)} AU, stops short of Jupiter.`}
            {reachPrediction === 'inside Earth' &&
              ` It is a natural thought, because we think of stars as small points of light. But Betelgeuse’s radius is ${Math.round(result.radiusSolarRadii)} times the Sun’s, ${result.radiusAU.toFixed(2)} AU, and the Earth is only 1 AU from the centre.`}
            {reachPrediction === 'past Earth' &&
              ` The surface reaches farther than that: ${result.radiusAU.toFixed(2)} AU, past Mars’s orbit (${PLANETS[3].orbitAU} AU).`}{' '}
            You also predicted that noise alone would make a spot as strong as the reported one <em>{sigmaWords[sigmaPrediction]}</em>. For {sigma} sigma the chance is{' '}
            {chanceOfSigma(sigma).toFixed(4)} (the area of the tail in Picture 3), and 1 ÷ {chanceOfSigma(sigma).toFixed(4)} = {oneInChance(sigma).toFixed(1)}, so <em>{sigmaWords[rightSigma]}</em>.{' '}
            {sigmaPrediction === rightSigma ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sigmaPrediction === '1 in 3.5 million' &&
              ` It is a natural thought, because 1 time in 3.5 million is what noise alone gives at 5 sigma, the usual bar for a discovery, and a team’s “detection” sounds like that. But the reported spot is only ${sigma} sigma, and ${sigma} sigma is not rare.`}
            {sigmaPrediction === '1 in 2' &&
              ` That is the chance of a spot that is merely stronger than the average noise (0 sigma, where half of all noise is stronger). A spot of ${sigma} sigma is stronger than that, and noise reaches it less often: ${oneInText(sigma)}.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. Why a star swells into a red supergiant.</strong> A star shines because, deep inside, the centres of atoms are squeezed together and join, and each joining gives off energy. For most of a
            star’s life this happens in its core, with hydrogen joining into helium. When the core runs out of hydrogen, NASA explains, it shrinks and heats up, helium starts to join in the core, and the hydrogen left in the shell
            round it gets hot enough to join too. The extra heat makes the outer layer of gas puff up, a little like a marshmallow held over a fire. A star that swells is far bigger, and in general a cooler surface glows
            redder: iron heated in a forge glows dull red, then orange, then white as it gets hotter. A star like the Sun will do this some 6 billion years from now (NASA); a much heavier star such as Betelgeuse does it as a red
            supergiant, and the heavier the star, the faster it uses its fuel (NASA’s page on stars).
          </p>

          <p style={paragraphStyle}>
            <strong>2. How we know how big it is.</strong> Nobody can hold a ruler to Betelgeuse. What a telescope can measure is the angle the star takes up in the sky: about {BETELGEUSE.angularDiameterMas} milliarcseconds, and
            what the distance measurement gives is {BETELGEUSE.distancePc} parsecs. A coin 2.4 centimetres across held 2.4 metres away takes up 0.01 radians (the width divided by the distance), and turned round, the width is the
            angle times the distance. For Betelgeuse, in the astronomers’ units where one milliarcsecond at one parsec is 0.001 AU: {BETELGEUSE.angularDiameterMas} × {BETELGEUSE.distancePc} × 0.001 = {width.toFixed(2)} AU across, so the
            radius is {result.radiusAU.toFixed(2)} AU, and one AU is {SOLAR_RADII_PER_AU.toFixed(0)} solar radii, so {Math.round(result.radiusSolarRadii)} solar radii. Joyce and others, with their own analysis, give{' '}
            {BETELGEUSE.joyceRadiusSolarRadii} (+116, −62), which agrees.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Why the answer is firm even though the size is not.</strong> The size is only as sure as the angle and the distance are. The papers allow distances from {BETELGEUSE.distanceRangePc[0]} to{' '}
            {BETELGEUSE.distanceRangePc[1]} parsecs and angles from {BETELGEUSE.angularDiameterRangeMas[0]} to {BETELGEUSE.angularDiameterRangeMas[1]} milliarcseconds, so the radius could be anywhere from {range.min.toFixed(1)} to{' '}
            {range.max.toFixed(1)} AU. NASA’s page puts Betelgeuse about 700 light-years away, which is about {nasaParsecs.toFixed(0)} parsecs, a little beyond that range; at that distance the same angle gives{' '}
            {nasaRadius.toFixed(1)} AU. In every case the surface reaches past Mars ({PLANETS[3].orbitAU} AU) and stops short of Jupiter ({jupiter} AU), which is why the answer to your first prediction does not depend on the exact
            size. One more check you saw in Table 4: the companion’s angle on the sky, {COMPANION.separationMas} milliarcseconds, times {BETELGEUSE.distancePc} parsecs gives {result.separationFromAngleAU.toFixed(2)} AU, and the model orbit’s{' '}
            {result.modelSeparationAU.toFixed(2)} AU (which does not use the distance) differs from it by {mismatch >= 0 ? '+' : '−'}{Math.abs(mismatch).toFixed(1)} percent. They agree best near {matchingDistancePc().toFixed(0)} parsecs. That check uses the position of the faint
            spot, so it is only as sure as the spot is.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What the orbit time can and cannot tell us.</strong> Kepler’s third law says that the time for one orbit, in years, squared equals the distance in AU cubed, divided by the two masses added together in solar masses. With{' '}
            {result.modelSeparationAU.toFixed(2)} AU, {BETELGEUSE.massSolar} and {COMPANION.massSolar}: {result.modelSeparationAU.toFixed(2)}³ ÷ {working.totalMass.toFixed(1)} = {working.cubed.toFixed(1)} ÷ {working.totalMass.toFixed(1)} = {working.periodSquared.toFixed(2)},
            and the square root is {result.periodYears.toFixed(2)} years, or {Math.round(result.periodDays).toLocaleString('en-US')} days. (As a check of the law, the Earth, at 1 AU round one solar mass, takes {sunLike.toFixed(1)} year.) That is
            within about {Math.ceil(periodAgreementPercent(result.periodDays))} percent of the long cycle in Betelgeuse’s light, quoted as {COMPANION.observedPeriodRangeDays[0].toLocaleString('en-US')} to{' '}
            {COMPANION.observedPeriodRangeDays[1].toLocaleString('en-US')} days. Now notice the see-saw: Betelgeuse is about {(BETELGEUSE.massSolar / COMPANION.massSolar).toFixed(0)} times heavier than the companion, like an adult and a small child on a
            see-saw, so the pair’s total hardly changes whatever the child weighs. Changing the companion from {COMPANION.massChoicesSolar[0]} to {COMPANION.massChoicesSolar[3]} solar masses moves the orbit time by only about {companionSwing.toFixed(0)} percent,
            while changing Betelgeuse’s own mass from {BETELGEUSE.massChoicesSolar[0]} to {BETELGEUSE.massChoicesSolar[2]} moves it by about {starSwing.toFixed(0)} percent. So the orbit time tells us about the total mass, and not about how it is shared out; that is why the
            companion’s mass comes from other methods, and why those methods give different answers (part 7). One more point: the idea of a companion was proposed to explain this very cycle, so the match between them is the idea doing its job,
            not an independent test of it.
          </p>

          <p style={paragraphStyle}>
            <strong>5. What “1.5 sigma” means.</strong> Every measurement has noise. Picture 3’s lavender curve shows how big a spot noise alone makes when there is nothing to find: most are small, a few are big. A spot of {sigma} sigma is{' '}
            {sigma} give-or-takes bigger than the average. Counting only the too-strong direction, noise alone makes a spot at least that strong {oneInText(sigma)}, about as often as getting {coins} heads in a row when flipping a coin ({coins} heads in a row is 1 time in {Math.pow(2, coins)}). The usual bar of 5 sigma, by contrast, is {oneInText(5)}, like {headsInARow(5)} heads in a row. A result that noise makes 1 time in 15 is not a discovery; it is
            something to check, and the team calls it a “probable” detection.
          </p>

          <p style={paragraphStyle}>
            <strong>6. Why a spot found where it was predicted counts for more.</strong> Suppose a friend tells you that they will be at gate 4 at noon, and at noon you see someone at gate 4 who might be them. You are more convinced than if you
            had spent the whole day at the station and picked out a faintly familiar face. In the first case there was one place and one time at which a chance resemblance could fool you; in the second there were thousands. The team’s 2024 pictures were
            taken within days of the date when the orbit said the companion would be farthest from Betelgeuse, and the spot was at the predicted separation ({COMPANION.separationMas} milliarcseconds) and direction ({COMPANION.positionAngleDegrees}° east of north), about the predicted
            brightness ({COMPANION.magnitudeDifference} magnitudes fainter, about {fainterBy} times), with a mass in the predicted range; the pictures taken in 2020, when the companion was predicted to be behind Betelgeuse, showed none. Five matches are
            more than one sigma alone says. But this experiment does not turn them into a probability, and neither do the papers, so it is a reason to take the idea seriously and to wait for more, not a confirmation.
          </p>

          <p style={paragraphStyle}>
            <strong>7. Independent signs, and what each can and cannot show.</strong> <em>The long cycle</em> (Goldberg and others, 2024) shows that something with a period of about six years affects Betelgeuse’s light; a companion is one explanation. <em>The faint spot</em>{' '}
            (Howell and others, 2025) is a direct picture, but only {sigma} sigma. <em>The wake</em> (Dupree and others, 2026, from Hubble and ground telescopes over nearly eight years) is a different kind of evidence: a trail of denser gas in Betelgeuse’s atmosphere that
            repeats with the cycle, which the Center for Astrophysics calls “direct evidence” of the companion. <em>The radio shape</em> (Matthews and others, 2026) is a slight change in Betelgeuse’s shape that follows the orbit, which they describe as “consistent with”
            the companion. Two further studies looked for light from the companion and saw none (Goldberg and others, and O’Grady and others, 2025): that rules out an accreting compact object and masses above about 1.5 solar masses, and points to a young star, so it limits what the
            companion can be without showing whether it exists. The mass is the part still open: about 1.17 (a minimum mass, from the star’s motion, with a large uncertainty), about {COMPANION.massSolar} (from a star-model analysis that assumes an age of 10 million years, in a range of 1.4 to 2.0), and
            “below about 1.5” (from the ultraviolet spectra). These come from different methods, they are not reconciled here, and the likeliest value in one paper is a little above the limit in another, though the ranges overlap. That is why this experiment calls the companion “strong evidence” and the mass
            “open”: several different kinds of data (the cycle, the spot, the wake and the radio shape) point the same way, and no clear picture has yet confirmed it. The sources’ own words range from “probable” to “direct evidence”, and the label is this project’s reading of them.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What would settle it, and what was shown and not shown.</strong> The next time the companion is expected to look farthest from Betelgeuse, and so be easiest to see, is 26 November 2027; a clear detection then, or none where it
            should be, would change the picture. You saw that Betelgeuse’s surface would reach {result.radiusAU.toFixed(2)} AU, past Mars and short of Jupiter, however the distance is chosen within the papers’ range; that a companion with an orbit of {result.modelSeparationAU.toFixed(1)} AU
            would go round in about {result.periodYears.toFixed(1)} years, as the star’s long cycle suggests; and how a weak hint, a prediction made in advance and several independent signs add up to “strong evidence” and not to “confirmed”. What this
            experiment did <strong>not</strong> do is weigh the companion, model the inside of the star, its pulsations or its dimming in 2019 and 2020, combine the evidence into one number, or say when Betelgeuse will explode (NASA’s page says that is not
            likely for about another 100,000 years, and Experiment 13 of this group is about a supernova).
          </p>
        </div>
      )}
    </div>
  )
}
