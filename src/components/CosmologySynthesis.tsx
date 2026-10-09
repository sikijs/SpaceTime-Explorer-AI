// The Cosmology chapter's closing synthesis. It adds no physics and no controls: it retells the chapter's
// results as one chain of evidence. Every figure is computed from the earlier experiments' own constants
// and functions (imported, never typed in again), so it cannot drift from what the learner saw. See
// docs/experiments/cosmology/closing-synthesis.md.
import { GALAXY_PRESETS, recessionSpeedKmPerS, HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from '../physics/hubblesLawExperiment'
import { REAL_UNIVERSE_AGE_YEARS, hubbleTimeYears } from '../physics/bigBangExperiment'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbTemperatureKelvin,
} from '../physics/cosmicMicrowaveBackgroundExperiment'
import { OBSERVED_SPEED_KM_PER_S } from '../physics/darkMatterExperiment'
import {
  OBSERVED_RING_ARCSECONDS,
  OBSERVED_TOTAL_MASS_SOLAR_MASSES,
  VISIBLE_MASS_FRACTION,
  runGravitationalLensingExperiment,
} from '../physics/gravitationalLensingExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION } from '../physics/darkEnergyExperiment'
import { universeAgeYears } from '../physics/universeAgeExperiment'
import {
  CMB_REDSHIFT,
  distanceTodayLightYears,
  lightTravelYears,
} from '../physics/observableUniverseExperiment'
import {
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  growthBetween,
} from '../physics/structureFormationExperiment'
import { runFateOfTheUniverseExperiment } from '../physics/fateOfTheUniverseExperiment'

const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)
const whole = (value: number) => Math.round(value).toLocaleString('en-US')

const textStyle = { fontSize: '0.9375rem', lineHeight: 1.6 } as const

export function CosmologySynthesis() {
  const L = BEST_FIT_DARK_ENERGY_FRACTION
  const coma = GALAXY_PRESETS.find((g) => g.label === 'Coma Cluster')!
  const lensing = runGravitationalLensingExperiment(OBSERVED_TOTAL_MASS_SOLAR_MASSES)
  const massRatio = 1 / VISIBLE_MASS_FRACTION
  const ordinaryGrowth = growthBetween(RECOMBINATION_REDSHIFT, 0, L)
  const darkGrowth = growthBetween(MATTER_RADIATION_EQUALITY_REDSHIFT, 0, L)
  const noDark = runFateOfTheUniverseExperiment(0)
  const real = runFateOfTheUniverseExperiment(L)

  const rows: Array<[string, string, string]> = [
    ["1. Hubble's Law", 'Farther galaxies are redder and recede faster', 'Space is expanding'],
    [
      '2. The Big Bang',
      `Running the expansion backward gives about ${billions(hubbleTimeYears(), 0)} billion years`,
      'There was a beginning, about that long ago',
    ],
    [
      '3. The oldest light',
      `A ${CMB_TEMPERATURE_TODAY_KELVIN} K glow, stretched from about ${whole(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT))} K`,
      'The early universe was hot and dense',
    ],
    ['4. Dark matter', 'Stars orbit faster than visible matter explains', 'Unseen mass in galaxies'],
    ['5. Dark energy', 'Distant supernovae look dim', 'The expansion is speeding up'],
    [
      '6. The age',
      `About ${Math.round(L * 100)}% dark energy gives about ${billions(universeAgeYears(L))} billion years`,
      'The pieces agree on an age',
    ],
    [
      '7. Lensing',
      `A cluster's ring needs about ${massRatio.toFixed(1)} times its visible mass`,
      'A second, independent sign of unseen mass',
    ],
    [
      '8. The observable universe',
      `Source about ${billions(distanceTodayLightYears(CMB_REDSHIFT, L), 0)} billion light-years away, light about ${billions(lightTravelYears(CMB_REDSHIFT, L))} billion years old`,
      'Space stretched while the light travelled',
    ],
    [
      '9. Structure formation',
      `A ripple grows about ${whole(ordinaryGrowth)} times (${whole(darkGrowth)} with dark matter)`,
      'Galaxies can grow from tiny ripples',
    ],
    [
      '10. The fate of the universe',
      'Doubling times settle (constant dark energy) or lengthen forever (none)',
      'The future depends on dark energy',
    ],
  ]

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem', ...textStyle }}>
      <h2 style={{ marginTop: 0 }}>Putting It All Together: What Is the Universe Made Of, and How Do We Know?</h2>
      <p>
        You have now run all ten experiments in this chapter. Each one answered a different question, but they
        were never separate. Together they tell one story, and it is a story built from evidence. This section
        puts the pieces in order, and says plainly which parts we can be sure of and which are still open. It
        adds nothing new: every number below is one you have already seen.
      </p>

      <h3>The story in six steps</h3>
      <p>
        <strong>1. The universe is expanding</strong> (Experiment 1). Faraway galaxies are redder, because their
        light has been stretched, and they move away faster the farther they are. At{' '}
        {HUBBLE_CONSTANT_KM_PER_S_PER_MPC} kilometers per second for each megaparsec, a galaxy{' '}
        {coma.distanceMpc} megaparsecs away, like the Coma Cluster, moves away at{' '}
        {whole(recessionSpeedKmPerS(coma.distanceMpc))} kilometers per second. This is space itself stretching,
        not galaxies flying through space.
      </p>
      <p>
        <strong>2. It had a hot, dense beginning</strong> (Experiments 2 and 3). Run the expansion backward and
        every distance shrinks to zero about {billions(hubbleTimeYears(), 0)} billion years ago, close to the
        measured age of {billions(REAL_UNIVERSE_AGE_YEARS)} billion years (a rough estimate, not the real
        calculation). A hot beginning should have left an afterglow, and it did: the oldest light we can see
        was released when the universe was about {whole(RECOMBINATION_YEARS_AFTER_BIG_BANG)} years old and about{' '}
        {whole(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT))} K. Space has stretched about{' '}
        {whole(1 + RECOMBINATION_REDSHIFT)} times since, so it now arrives as a faint microwave glow at{' '}
        {CMB_TEMPERATURE_TODAY_KELVIN} K.
      </p>
      <p>
        <strong>3. Most of what is there is unseen</strong> (Experiments 4, 7 and 5). We found this out in three
        ways.
      </p>
      <ul>
        <li>
          Stars far out in a galaxy orbit at about {OBSERVED_SPEED_KM_PER_S} kilometers per second, far faster
          than the visible matter alone could hold them (Experiment 4).
        </li>
        <li>
          A cluster of galaxies bends the light of a galaxy behind it into a ring about{' '}
          {OBSERVED_RING_ARCSECONDS} arcseconds wide. Its visible matter could make a ring of only about{' '}
          {Math.round(lensing.visibleOnlyRingArcseconds)}, so the cluster needs about {massRatio.toFixed(1)} times
          the visible mass: only about {Math.round(VISIBLE_MASS_FRACTION * 100)}% of its mass is visible
          (Experiment 7). This is a different method, weighing with light and not with orbits, and it points the
          same way. Two independent methods agreeing is what makes the case strong. The unseen mass is called{' '}
          <strong>dark matter</strong>.
        </li>
        <li>
          Distant supernovae look dimmer than a universe with only matter would make them, so the expansion has
          been speeding up. The name for whatever drives this is <strong>dark energy</strong>, which fits best at
          about {Math.round(L * 100)}% of the total (Experiment 5).
        </li>
      </ul>
      <p>
        <strong>4. Together they give a consistent history</strong> (Experiments 6 and 8). With matter only, the
        universe would be about {billions(universeAgeYears(0))} billion years old, too young to hold the oldest
        stars. With about {Math.round(L * 100)}% dark energy it comes out near {billions(universeAgeYears(L))}{' '}
        billion years, and the measured value is {billions(REAL_UNIVERSE_AGE_YEARS)} (Experiment 6). The same
        history explains why the farthest light we can see has travelled about{' '}
        {billions(lightTravelYears(CMB_REDSHIFT, L))} billion years, yet its source is now about{' '}
        {billions(distanceTodayLightYears(CMB_REDSHIFT, L), 0)} billion light-years away: space stretched while
        the light was on its way (Experiment 8).
      </p>
      <p>
        <strong>5. Galaxies grew from tiny ripples</strong> (Experiment 9). Gravity can grow a small excess of
        matter only in step with the size of the universe, about {whole(ordinaryGrowth)} times since the
        oldest light, and about {whole(darkGrowth)} times with dark matter's head start. This is why dark
        matter matters for galaxies as well as for orbits. Whether the real ripples started large enough was
        something that model could not say.
      </p>
      <p>
        <strong>6. Where it is heading depends on dark energy</strong> (Experiment 10). With only matter, the
        expansion would slow down forever without quite stopping: each doubling of the universe's size would take
        longer, about {billions(noDark.doublings[0].years, 0)}, then {billions(noDark.doublings[1].years, 0)},
        then {billions(noDark.doublings[2].years, 0)} billion years. With a constant dark energy, each doubling
        takes about the same time, settling toward about {billions(real.longTermDoublingTimeYears)} billion years.
        But that assumes dark energy never changes.
      </p>

      <h3>How it fits together</h3>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
          <thead>
            <tr>
              {['Experiment', 'What we saw', 'What it tells us'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '0.4rem 0.75rem 0.4rem 0',
                    borderBottom: '2px solid var(--border-color, #ccc)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([experiment, saw, tells]) => (
              <tr key={experiment}>
                <td style={{ padding: '0.4rem 0.75rem 0.4rem 0', borderBottom: '1px solid var(--border-color, #ddd)' }}>
                  {experiment}
                </td>
                <td style={{ padding: '0.4rem 0.75rem 0.4rem 0', borderBottom: '1px solid var(--border-color, #ddd)' }}>
                  {saw}
                </td>
                <td style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--border-color, #ddd)' }}>{tells}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>What we are sure of, and what is still open</h3>
      <p>
        The parts these experiments support most directly are: the universe is expanding; it began hot and dense
        and left an afterglow; there is mass we cannot see, found in two independent ways; and the expansion has
        been speeding up.
      </p>
      <p style={{ marginBottom: '0.25rem' }}>Still open:</p>
      <ul>
        <li>
          <strong>What dark matter and dark energy actually are.</strong> We know what they do, not what they are
          (Experiments 4 and 5).
        </li>
        <li>
          <strong>Whether dark energy is constant.</strong> This chapter assumed it is, but it is being tested
          (Experiment 10).
        </li>
        <li>
          <strong>The Hubble tension.</strong> Published values of today's expansion rate range from about 67 to
          73, and astronomers do not yet agree why (Experiments 1 and 6).
        </li>
        <li>
          <strong>Whether the early ripples were big enough</strong> to grow into the galaxies we see
          (Experiment 9).
        </li>
        <li>
          <strong>What happened at the very beginning,</strong> including a brief burst of extremely fast
          expansion called inflation, which this chapter only mentioned (Experiment 2).
        </li>
      </ul>

      <h3>How this fits with relativity</h3>
      <p>
        Cosmology is an application of the ideas from the first two chapters, not a separate subject. The
        bending of light by a cluster in Experiment 7 is the same bending of light by mass you met in Gravity
        Experiment 8. And the formulas this chapter used for how the expansion rate depends on matter and dark
        energy come from general relativity applied to the whole universe. We gave them to you without deriving
        them.
      </p>

      <h3>Why we waited until now to say this</h3>
      <p style={{ marginBottom: 0 }}>
        We could have started the chapter with the full picture. But that would have asked you to accept a list
        of claims before you had any reason to believe them. Instead, each experiment was one small piece of
        evidence, and only now, with all of it in hand, does the picture read as "that is just what I watched
        happen."
      </p>
    </div>
  )
}
