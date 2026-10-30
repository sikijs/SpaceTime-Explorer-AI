import { useState } from 'react'
import {
  collapseWorkedExample,
  ergFromJoules,
  G,
  gasTimeWorkedExample,
  joulesFromErg,
  lightTravelAnswer,
  lightTravelTimesLongerThan,
  LIGHT_YEARS_PER_PARSEC,
  LITERATURE,
  massEstimates,
  MASS_2026,
  oneInN,
  overlaps,
  restShare,
  runCatchingASupernova,
  SOLAR_MASS_KG,
  SUPERNOVA,
  sunLifetimeEnergyJ,
  visibleShareAnswer,
} from '../physics/catchingASupernova'
import type { LightTravelAnswer, VisibleShareAnswer } from '../physics/catchingASupernova'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CatchingASupernovaTutorProps {
  sharePrediction: VisibleShareAnswer
  travelPrediction: LightTravelAnswer
  onExplained?: () => void
}

const shareWords: Record<VisibleShareAnswer, string> = {
  'about half': 'about half',
  '1 in 10': 'about 1 part in 10 (10 percent)',
  '1 in 100': 'about 1 part in 100 (1 percent)',
  '1 in 10,000': 'about 1 part in 10,000 (0.01 percent)',
}
const travelWords: Record<LightTravelAnswer, string> = {
  'a few months': 'a few months',
  'about 20 thousand years': 'about 20 thousand years',
  'about 20 million years': 'about 20 million years',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
// A number in the form 4.3 × 10⁵³.
function sciText(value: number, digits = 1): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
const thousandsComma = (value: number): string => Math.round(value).toLocaleString('en-US')
const millions = (value: number): string => (value / 1e6).toFixed(1)

// The tutor of Cosmic Horizons Experiment 13. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics
// module (catchingASupernova.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source table. The predictions are marked only
// in the explanation (the owner's choice for the group). The tutor does not say how heavy the star was, does not choose among the mass estimates, does not say that the
// collapse's energy is exact, and does not say what the neutron star is doing now.
export function CatchingASupernovaTutor({ sharePrediction, travelPrediction, onExplained }: CatchingASupernovaTutorProps) {
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
  const result = runCatchingASupernova()
  const rightShare = visibleShareAnswer()
  const rightTravel = lightTravelAnswer()
  const estimates = massEstimates()
  const lowest = estimates.reduce((a, b) => (a.highSolar < b.highSolar ? a : b))
  const top = estimates.reduce((a, b) => (a.highSolar > b.highSolar ? a : b))
  const overallLow = Math.min(...estimates.map((e) => e.lowSolar))
  const collapseExample = collapseWorkedExample(SUPERNOVA.coreMassSolar, SUPERNOVA.coreRadiusKm)
  const massKg = collapseExample.massKg
  const rest = restShare(result.collapseJ, result.gasMotionJ, result.lightJ)
  const lightHighOneIn = oneInN(joulesFromErg(SUPERNOVA.lightRangeErg[1]), result.collapseJ)
  const uniformBallErg = ergFromJoules(collapseExample.uniformBallEnergyJ)
  const lightPercentOfSun = result.sunLifetimes.light * 100
  const farFactor = lightTravelTimesLongerThan('about 20 thousand years')
  const outerSeconds = gasTimeWorkedExample(SUPERNOVA.gasShellRadiiCm[1], SUPERNOVA.windSpeedKmS).seconds
  const separate = estimates.filter((e) => e.who !== lowest.who && !overlaps(e, lowest)).length

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
              'Look at Picture 3. Which bar is the longest and which is the shortest? Remember that each step along the scale is 10 times more energy, so roughly how many times longer is the longest than the shortest? And in Picture 1, do the seven estimates of the star’s mass agree with each other?'}
            {tutorStep === 'compare' &&
              `You predicted that the visible light would be ${shareWords[sharePrediction]} of the energy the collapse frees, and that the star really exploded ${travelWords[travelPrediction]} before May 2023. Now look at Tables 1 to 3 and at Pictures 1, 2 and 3. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'The star was photographed before it exploded, and seven teams worked out its mass from those pictures and others. They did not all agree. What would you want to know about each method before deciding which one to trust?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that the visible light would be{' '}
            <em>{shareWords[sharePrediction]}</em> of the energy the collapse frees. With {sciText(ergFromJoules(result.lightJ))} erg against {sciText(result.collapseErg)} erg (Table 1) it is 1 part in{' '}
            {thousandsComma(result.lightOneIn)}, so <em>{shareWords[rightShare]}</em> is the nearest answer. {sharePrediction === rightShare ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sharePrediction === 'about half' &&
              ' It is a natural thought, because an explosion looks like a flash of light, and light is the only part we see, so it feels like the main part. But what we see is a tiny corner of the event.'}
            {sharePrediction === '1 in 10' &&
              ` A tenth would be 10 percent. Even the motion of the blown-off gas, which is much more than the light, is only 1 part in ${thousandsComma(result.gasMotionOneIn)} (${(result.gasMotionShare * 100).toFixed(2)} percent).`}
            {sharePrediction === '1 in 100' &&
              ` That is close to the share of the blast’s motion, 1 part in ${thousandsComma(result.gasMotionOneIn)}, which is about ${(result.gasMotionShare * 100).toFixed(1)} percent. The light is about ${Math.round(result.lightOneIn / result.gasMotionOneIn)} times smaller still.`}{' '}
            You also predicted that the star really exploded <em>{travelWords[travelPrediction]}</em> before May 2023. The light took {millions(result.lightTravelYears)} million years to arrive (Table 2), so the answer is{' '}
            <em>{travelWords[rightTravel]}</em>. {travelPrediction === rightTravel ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {travelPrediction === 'a few months' &&
              ' It is a natural thought, because news of an explosion reaches us within days, and we think of light as instant. But light is not instant: it takes time to cross space, and the distance here is huge.'}
            {travelPrediction === 'about 20 thousand years' &&
              ` That would be a distance of 20 thousand light-years. M101 is ${millions(result.lightYears)} million light-years away, about ${thousandsComma(Math.round(farFactor / 100) * 100)} times farther.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What a core-collapse supernova is.</strong> A star shines because its core makes energy, and that energy pushes outward and holds the star up against its own weight. A very heavy star ends with an iron
            core, which cannot make energy, so it is held up only by electron degeneracy pressure, the resistance of crowded electrons. Past about 1.4 Suns’ worth of material that is not enough, and the core falls in on itself
            in a fraction of a second, until its centre is as dense as an atomic nucleus and becomes very stiff. It springs back a little, like a ball hitting a hard floor, but it does not return to its old size: that stiff centre is the newborn neutron star. The gas still
            falling in crashes into it, like cars piling into one that has stopped, and a shock wave runs outward. NASA writes: “The core collapses and then rebounds, creating a shock wave that travels through the star’s outer layers.”
            The shock does not get far. It is pushing against gas that is still falling in, and it loses energy in breaking up iron nuclei and to escaping neutrinos, so it stalls, about 100 to 200 km from the centre. The newborn
            neutron star is extremely hot, because the energy of the fall has to go somewhere, and it gives off a flood of neutrinos. A small share of them are stopped by the gas behind the shock, and that heating, like a stove
            under a pot, is thought to push the shock on again until it throws the outer layers away. Simulations from many groups now produce explosions this way, but the details are still being worked out. What is left at the centre
            is a neutron star, about {SUPERNOVA.coreMassSolar} Suns’ worth of material in a ball about {SUPERNOVA.coreRadiusKm} km in radius.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Where the energy comes from.</strong> Think of dropping a very heavy weight from a great height: the heavier it is and the farther it falls, the more energy it gives up. The collapsing core is the
            same, on a huge scale. The energy it gives up is about G × M² ÷ R, where M is the mass and R the radius. With M = {SUPERNOVA.coreMassSolar} × {sciText(SOLAR_MASS_KG, 3)} = {sciText(massKg)} kg, R = {collapseExample.radiusM} m and
            G = {sciText(G, 3)}, that is {sciText(G, 3)} × ({sciText(massKg)})² ÷ {collapseExample.radiusM} = {sciText(result.collapseJ)} joules, or {sciText(result.collapseErg)} erg. Set beside the Sun’s whole-life output
            ({sciText(ergFromJoules(sunLifetimeEnergyJ()))} erg), this is about {Math.round(result.sunLifetimes.collapse)} times as much, and reviews quote {LITERATURE.neutrinoEnergyErg[0] / 1e53} to {LITERATURE.neutrinoEnergyErg[1] / 1e53} × 10⁵³ erg for the energy carried off
            by neutrinos, which is close. It is only a rough estimate: a ball of the same mass and size with the same density throughout would give 3/5 of it, {sciText(uniformBallErg)} erg, and a real neutron star needs general
            relativity.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why almost all of it leaves as neutrinos, and why none were seen.</strong> The blast’s motion and the light together are only {((1 - rest) * 100).toFixed(2)} percent of the collapse’s energy, so {(rest * 100).toFixed(2)} percent is
            left over. The published reviews say that more than about 99 percent of the energy of a collapse is carried away by neutrinos. A neutrino is a tiny particle that hardly ever interacts with anything: CERN says it can
            pass through the whole Earth. The matter in a collapsing core is so dense that light cannot get out of it quickly, while neutrinos, which hardly interact, slip out. (This is a general explanation that this page has not
            checked against a source.) Neutrinos were caught from SN 1987A in 1987, which is one way the reviews know the numbers. None were reported from SN 2023ixf, and that is as you would expect: the number of neutrinos reaching
            a detector falls with the square of the distance, like the light of a lamp. At twice the distance a detector catches one quarter as many, and at ten times the distance one hundredth. M101 is a very long way off, and
            Super-Kamiokande’s own estimate for SN 2023ixf was below its threshold (a search summary, not read at the paper). IceCube’s separate search was for higher-energy neutrinos from the blast hitting the gas, and found only
            background.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the flash is a tiny share and still a huge amount.</strong> The light is 1 part in {thousandsComma(result.lightOneIn)} of the collapse, and that is about one minute out of a 30-day month. Yet in absolute terms
            it is {sciText(ergFromJoules(result.lightJ))} erg, about {lightPercentOfSun.toFixed(1)} percent of everything the Sun will give out in ten billion years, released in weeks. The share is tiny because the collapse is enormous, not because
            the light is small. Even at the top of the usual range, {sciText(SUPERNOVA.lightRangeErg[1], 0)} erg, the light is 1 part in {thousandsComma(Math.round(lightHighOneIn / 100) * 100)}, so the answer to your first prediction does not depend on the exact value.
          </p>
          <p style={paragraphStyle}>
            <strong>5. We are looking at the past.</strong> A thunderstorm 3 kilometres away flashes first and booms about 9 seconds later, because sound is slow. Light is fast but not instant, and M101 is {SUPERNOVA.distanceMpc} megaparsecs
            away: {SUPERNOVA.distanceMpc} × {LIGHT_YEARS_PER_PARSEC} = {(SUPERNOVA.distanceMpc * LIGHT_YEARS_PER_PARSEC).toFixed(2)} million light-years. Light covers one light-year in a year, so the light seen in May 2023 had been travelling for {millions(result.lightTravelYears)} million years.
            The explosion itself happened that long ago, and we saw it only when the light arrived. This is the idea of Spacetime Geometry Experiment 4, here with a real star. The distance is good to about ± 0.15 Mpc, which changes
            the time by about half a million years, so “about 22 million years” is safe, and some pages that say 21 million use a slightly smaller distance (6.4 Mpc).
          </p>
          <p style={paragraphStyle}>
            <strong>6. What the gas tells us.</strong> A distance and a speed give a time. Think of cars leaving a traffic light at a steady 50 km/h: the car that is now 100 km away left 2 hours ago, and the one 50 km away left 1 hour ago.
            The first spectra showed dense gas out to {sciText(SUPERNOVA.gasShellRadiiCm[1])} cm ({result.gasShellAU[1].toFixed(1)} AU) from the star. If the gas moved at {SUPERNOVA.windSpeedKmS} km/s, which the authors assumed, then {sciText(SUPERNOVA.gasShellRadiiCm[1])} ÷ {sciText(SUPERNOVA.windSpeedKmS * 1e5)} ={' '}
            {sciText(outerSeconds)} seconds, which is {result.gasShedYearsBefore[1].toFixed(1)} years. So the star was shedding dense gas in the last {LITERATURE.paperGasYears[0]} to {LITERATURE.paperGasYears[1]} years of its life, much faster than usual. If the real speed were different, the time would change in proportion. Why a
            star would shed gas so fast just before it explodes is still an open question.
          </p>
          <p style={paragraphStyle}>
            <strong>7. Why the star’s mass is contested.</strong> A star was photographed before it exploded, so you might expect everyone to find the same mass, but the estimates run from {overallLow} to {top.highSolar} Suns. {lowest.who}’s{' '}
            {lowest.lowSolar} to {lowest.highSolar} shares no value with {separate} of the other {estimates.length - 1} estimates. The teams used different methods: how bright the star looked against models of stars, how its colours fit
            models with dust, how the star pulsed over many years, and the stars around it. A 2026 paper got {MASS_2026.lightCurveRangeSolar[0]} to {MASS_2026.lightCurveRangeSolar[1]} from modelling the explosion’s light and {MASS_2026.spectraRangeSolar[0]} to {MASS_2026.spectraRangeSolar[1]} from later spectra, and argues that dust round the star could make a
            brightness-based mass about {MASS_2026.dustBiasSolar} Suns too low. Think of judging someone’s weight from a photograph taken through frosted glass: the frosting makes them look smaller, and how much depends on how
            thick it is. That is the authors’ explanation. This experiment does not say whether it is right, or which estimate is.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw that the energy of a collapse is {sciText(result.collapseErg)} erg by a rough estimate; that the visible light is only about 1 part in {thousandsComma(Math.round(result.lightOneIn / 1000) * 1000)} of it, and the blast’s motion about 1 part in {thousandsComma(result.gasMotionOneIn)};
            that the light you saw in May 2023 left {millions(result.lightTravelYears)} million years ago; that the gas close to the star was shed in its last few years if it moved at the assumed speed; and that the estimates of the star’s mass disagree. What this experiment did <strong>not</strong> do is model the
            collapse, the neutrinos, the shock or the light itself, say how heavy the star was, or say what the neutron star is doing now. More careful work on the dust, and on the explosion’s light, may narrow the mass.
          </p>
        </div>
      )}
    </div>
  )
}
