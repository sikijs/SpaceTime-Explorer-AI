import { combineSpeeds } from './addingSpeeds'
import { HELIUM_OBSERVED_LBT, LITHIUM_OBSERVED_E10, LITHIUM_THEORY_E10 } from './earlyUniverseRecipe'
import type { Claim } from './frontierRecap'
import { MEASURED_SPEED_KM_S } from './microwaveDipole'
import { REST_LIFETIME_US } from './muonLifetime'
import { PRESET_SPEED, PRESET_TRIP_YEARS, movingClockYears } from './timeTravel'
import { PRESET_CLOSEST_RADII, PRESET_TARGET_ID, trialDelay } from './sunDelay'

// "Evidence and Imagination: What Has Been Tested, What Has Not", the group's findings by status label, for the Conclusion page
// (docs/experiments/conclusion/00-conclusion-page.md). The labels and wording repeat each experiment's built "Where this stands" text
// (checked against the pages on 2026-11-02), not the specification's, so the Conclusion cannot say more than a page does. Every figure is
// read from the experiment's own module (CLAUDE.md §9). There is no new physics in this file. The claim wording is draft text for the
// owner's line-by-line approval (CLAUDE.md §28.1).
//
// The experiment numbers are the sidebar's numbers (1 to 7 in this group), the same as the specification's.
export function evidenceClaims(): Claim[] {
  const lithiumRatio = LITHIUM_THEORY_E10.value / LITHIUM_OBSERVED_E10.value
  return [
    { experiment: 1, label: 'Settled', claim: 'What the equations say: the simplest wormhole throat closes, and an open one needs negative energy' },
    { experiment: 1, label: 'Open', claim: 'Whether any wormhole exists; none has been seen' },
    {
      experiment: 2,
      label: 'Settled',
      claim: 'A clock that moves fast counts less time than one that stays behind, so travel to the future is real and has been measured with real clocks',
      figure: {
        value: movingClockYears(PRESET_SPEED, PRESET_TRIP_YEARS),
        decimals: 0,
        unit: 'years',
        what: `what a clock moving at ${PRESET_SPEED} times the speed of light counts over a ${PRESET_TRIP_YEARS}-year trip`,
      },
    },
    { experiment: 2, label: 'Open', claim: 'Whether a path back in time can exist; none has been seen, and nobody has proved whether nature allows one' },
    {
      experiment: 3,
      label: 'Settled',
      claim: 'The rule for adding speeds, tested in water in 1851 and with a flash of light from fast particles in 1964 (old tests, not a new result)',
      figure: { value: combineSpeeds(0.5, 0.5), decimals: 1, unit: 'times the speed of light', what: 'two speeds of half the speed of light, added by the rule' },
    },
    {
      experiment: 4,
      label: 'Settled',
      claim: 'Moving muons live longer, as special relativity says, in two old tests (a mountain in 1962 and a storage ring at CERN in 1977)',
      figure: { value: REST_LIFETIME_US, decimals: 3, unit: 'microseconds', what: 'a muon’s lifetime at rest' },
    },
    {
      experiment: 5,
      label: 'Settled',
      claim: 'The Sun adds time to a signal that passes it, measured in tests from the 1960s to 2002 (old tests, not a new result)',
      figure: {
        value: trialDelay(PRESET_TARGET_ID, PRESET_CLOSEST_RADII).delayUs,
        decimals: 1,
        unit: 'microseconds',
        what: 'the extra time on a round trip to Venus that just touches the Sun',
      },
    },
    { experiment: 5, label: 'Open', claim: 'Whether any tiny deviation exists below what the tests could see' },
    {
      experiment: 6,
      label: 'Settled',
      claim: 'Helium (by one telescope’s measurement) and deuterium match the calculation; a second helium value is lower and the page does not choose between them',
      figure: { value: HELIUM_OBSERVED_LBT.value * 100, decimals: 2, unit: 'percent', what: 'helium’s share of the weight of ordinary matter, measured with the Large Binocular Telescope' },
    },
    {
      experiment: 6,
      label: 'Open',
      claim: 'Lithium-7: the calculation is several times the measurement, and no cause has been settled',
      figure: { value: lithiumRatio, decimals: 1, unit: 'times', what: 'the published calculation over the measurement' },
    },
    {
      experiment: 7,
      label: 'Settled',
      claim: 'The microwave sky is a little warmer in one direction and cooler in the opposite one, matching a motion of the Solar System relative to the glow’s own frame',
      figure: { value: MEASURED_SPEED_KM_S, decimals: 0, unit: 'km/s', what: 'the speed that fits the difference' },
    },
    { experiment: 7, label: 'Contested', claim: 'Whether faraway quasars agree: their counts are lopsided in a similar direction, but more than our motion alone should give' },
  ]
}
