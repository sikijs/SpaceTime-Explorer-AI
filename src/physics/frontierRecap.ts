import { tensionSigma, EARLY_MEASUREMENT, LATE_MEASUREMENTS } from './hubbleTension'
import { PUBLISHED_SIGMAS } from './evolvingDarkEnergy'
import { DESI_JULY_2026 } from './neutrinoMass'
import { MOM_Z14_REDSHIFT } from './earliestGalaxies'
import { PUBLISHED_RESULTS as WIDE_BINARY_RESULTS } from './wideBinaries'
import { ALPHA_2023 } from './antimatterGravity'
import { JILA_2022 } from './clockHeight'
import { NIST_2024 } from './lunarClocks'
import { PARKER } from './fastestSpacecraft'
import { massEstimates } from './catchingASupernova'
import { NEUTRON_STAR_DATA } from './neutronStarSize'
import { FAILED_SUPERNOVA_DATA } from './failedSupernova'
import { totalAreaBeforeKm2, areaAfterKm2 } from './horizonAreaLaw'
import { GW250114_RINGDOWN } from './blackHoleRingdown'
import { GW231123 } from './heaviestMerger'
import { M87_STAR } from './blackHoleShadow'
import { PUBLISHED_RESULTS as PULSAR_RESULTS } from './pulsarTimingBackground'
import { CAPERS_LRD_Z9 } from './blackHoleGrowth'
import { atlasBendDegrees } from './interstellarVisitor'
import { PUBLISHED_2025, PUBLISHED_2026 } from './localGroupCollision'

// Cosmic Horizons, closing recap ("The Frontier recap"): "Putting It All Together: What Is Settled, What Is Contested, What Is Open?"
// (docs/experiments/cosmic-horizons/closing-recap.md).
// The recap sorts the group's claims by the four status labels each experiment already carries. Every figure a claim quotes is read here
// from the earlier experiment's own module, never typed in again (CLAUDE.md §9), so the recap cannot drift from the experiments.
// There is no new physics in this file. The claim wording is draft text for the owner's line-by-line approval (CLAUDE.md §28.1).

export type StatusLabel = 'Settled' | 'Strong evidence' | 'Contested' | 'Open'

export const STATUS_LABELS: StatusLabel[] = ['Settled', 'Strong evidence', 'Contested', 'Open']

// Experiment 16 ("Where does gold come from?") was dropped on 2026-10-25, so the group's numbers are 1 to 15 and 17 to 25.
export const EXPERIMENT_NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25]

// A real number from the earlier experiment, with its unit and what it is, read from that experiment's module.
export interface Figure {
  value: number
  // Set when the figure is a range, from value up to high.
  high?: number
  unit: string
  what: string
}

export interface Claim {
  experiment: number
  label: StatusLabel
  claim: string
  figure?: Figure
}

function wideBinaryGamma2026(): number {
  const result = WIDE_BINARY_RESULTS.find((r) => r.kind === 'gamma' && r.year === 2026 && r.name === 'Chae and colleagues')
  if (!result || result.value === null) throw new Error('The 2026 wide-binary result is missing from the module')
  return result.value
}

function nanogravSigmaHigh(): number {
  const result = PULSAR_RESULTS.find((r) => r.id === 'nanograv')
  if (!result) throw new Error('The NANOGrav result is missing from the module')
  return result.sigmaHigh
}

function supernovaMassRange(): [number, number] {
  const estimates = massEstimates()
  return [Math.min(...estimates.map((e) => e.lowSolar)), Math.max(...estimates.map((e) => e.highSolar))]
}

function lymanAlphaSigma(): number {
  const bar = PUBLISHED_SIGMAS.find((b) => b.name.includes('July 2026 Lyman-alpha'))
  if (!bar) throw new Error('The July 2026 DESI bar is missing from the module')
  return bar.sigma
}

// Every claim of the group, as in the specification's table. One experiment can hold claims of several labels, so the recap sorts
// claims, not whole experiments.
export function frontierClaims(): Claim[] {
  const [massLow, massHigh] = supernovaMassRange()
  return [
    {
      experiment: 1,
      label: 'Contested',
      claim: 'The two ways of measuring the expansion rate disagree',
      figure: { value: tensionSigma(LATE_MEASUREMENTS[0], EARLY_MEASUREMENT), unit: 'sigma', what: 'the gap between SH0ES 2022 and Planck 2018' },
    },
    { experiment: 1, label: 'Open', claim: 'Why the two ways of measuring disagree' },
    {
      experiment: 2,
      label: 'Contested',
      claim: 'DESI’s hint that dark energy weakens with time',
      figure: { value: lymanAlphaSigma(), unit: 'sigma', what: 'DESI with the CMB, with the July 2026 Lyman-alpha analysis' },
    },
    { experiment: 3, label: 'Contested', claim: 'Whether the Dark Energy Survey’s lumpiness is below the microwave background’s (KiDS’s tension went away)' },
    { experiment: 4, label: 'Contested', claim: 'How small the limit on the neutrinos’ total mass has become, and whether it leaves any room', figure: { value: DESI_JULY_2026.value, unit: 'eV', what: 'DESI’s July 2026 ceiling on the total neutrino mass' } },
    {
      experiment: 5,
      label: 'Strong evidence',
      claim: 'Galaxies already existed very early',
      figure: { value: MOM_Z14_REDSHIFT, unit: '', what: 'the redshift of MoM-z14' },
    },
    { experiment: 5, label: 'Open', claim: 'What built them so fast' },
    { experiment: 6, label: 'Strong evidence', claim: 'What dark matter is not (the searches’ limits)' },
    { experiment: 6, label: 'Open', claim: 'What dark matter is, and what one unexplained event means' },
    {
      experiment: 7,
      label: 'Contested',
      claim: 'Whether gravity changes at very small pulls',
      figure: { value: wideBinaryGamma2026(), unit: '', what: 'the 2026 wide-binary speed-up (g observed ÷ g predicted)' },
    },
    {
      experiment: 8,
      label: 'Strong evidence',
      claim: 'Antihydrogen is attracted to the Earth',
      figure: { value: ALPHA_2023.ratio, unit: 'of g', what: 'ALPHA-g’s measured ratio' },
    },
    { experiment: 8, label: 'Open', claim: 'Whether antimatter falls exactly as ordinary matter does' },
    {
      experiment: 9,
      label: 'Settled',
      claim: 'A higher clock ticks faster',
      figure: { value: JILA_2022.millimetres, unit: 'mm', what: 'the height across which the JILA clock saw it' },
    },
    {
      experiment: 10,
      label: 'Strong evidence',
      claim: 'A lunar clock gains about 56 microseconds a day (a calculation)',
      figure: { value: NIST_2024.gainMicrosecondsPerDay, unit: 'µs a day', what: 'the gain of a clock on the Moon over one on the Earth, from the NIST paper' },
    },
    { experiment: 10, label: 'Open', claim: 'No clock on the Moon has measured it yet' },
    {
      experiment: 11,
      label: 'Settled',
      claim: 'The probe’s distance and speed, and the physics',
      figure: { value: PARKER.closestApproachSpeed / 1000, unit: 'km/s', what: 'Parker Solar Probe’s speed at its closest approach' },
    },
    { experiment: 12, label: 'Settled', claim: 'What a red supergiant is' },
    { experiment: 12, label: 'Strong evidence', claim: 'Betelgeuse has a companion' },
    { experiment: 12, label: 'Open', claim: 'The companion’s mass and nature' },
    { experiment: 13, label: 'Strong evidence', claim: 'A red supergiant exploded, and almost all the energy left as neutrinos' },
    {
      experiment: 13,
      label: 'Contested',
      claim: 'The star’s mass',
      figure: { value: massLow, high: massHigh, unit: 'Suns', what: 'the range of published estimates of the star’s mass' },
    },
    { experiment: 13, label: 'Open', claim: 'Why it shed so much gas' },
    { experiment: 14, label: 'Strong evidence', claim: 'This one remnant came from a double detonation of a white dwarf' },
    { experiment: 14, label: 'Contested', claim: 'A 2025 paper reads the two calcium shells another way' },
    { experiment: 14, label: 'Open', claim: 'How many Type Ia supernovae explode this way' },
    {
      experiment: 15,
      label: 'Strong evidence',
      claim: 'A neutron star of about 1.4 Suns is 11 to 12 km in radius',
      figure: { value: NEUTRON_STAR_DATA.j0437.radiusKm, unit: 'km', what: 'the radius of PSR J0437−4715' },
    },
    { experiment: 15, label: 'Open', claim: 'How heavy a neutron star can be' },
    {
      experiment: 17,
      label: 'Strong evidence',
      claim: 'What was seen: the star faded with no bright supernova',
      figure: { value: FAILED_SUPERNOVA_DATA.visibleFadeFactor, unit: 'times', what: 'the fade in visible light' },
    },
    { experiment: 17, label: 'Contested', claim: 'What it became: a black hole, or two stars that merged' },
    { experiment: 17, label: 'Open', claim: 'How often massive stars fail' },
    {
      experiment: 18,
      label: 'Strong evidence',
      claim: 'The total horizon area rose, as Hawking’s 1971 theorem requires',
      figure: { value: areaAfterKm2() / totalAreaBeforeKm2(), unit: 'times', what: 'the area after the merger over the area before' },
    },
    {
      experiment: 19,
      label: 'Strong evidence',
      claim: 'The main tone of the ringing matches what the mass and spin give, to a few percent',
      figure: { value: GW250114_RINGDOWN.measuredFrequencyHz, unit: 'Hz', what: 'the detectors’ measured frequency' },
    },
    {
      experiment: 20,
      label: 'Strong evidence',
      claim: 'GW231123 was the heaviest merger seen, with very fast spins',
      figure: { value: GW231123.finalBestFitSolar, unit: 'Suns', what: 'the best-fit mass of the final black hole' },
    },
    { experiment: 20, label: 'Open', claim: 'What made such black holes' },
    {
      experiment: 21,
      label: 'Strong evidence',
      claim: 'The ring sizes are close to what the masses and distances give',
      figure: { value: M87_STAR.ringMicroarcsec, unit: 'µas', what: 'the measured ring of M87*' },
    },
    { experiment: 21, label: 'Open', claim: 'How tightly that tests gravity' },
    {
      experiment: 22,
      label: 'Strong evidence',
      claim: 'A faint background of very slow gravitational waves, not yet at 5 sigma',
      figure: { value: nanogravSigmaHigh(), unit: 'sigma', what: 'the upper end of NANOGrav’s 15-year evidence' },
    },
    { experiment: 22, label: 'Open', claim: 'What makes it' },
    { experiment: 23, label: 'Settled', claim: 'The Eddington limit and exponential growth' },
    {
      experiment: 23,
      label: 'Strong evidence',
      claim: 'JWST sees growing black holes very early',
      figure: { value: CAPERS_LRD_Z9.redshift, unit: '', what: 'the redshift of CAPERS-LRD-z9' },
    },
    { experiment: 23, label: 'Open', claim: 'Whether any broke the limit or started heavy, and what the little red dots are' },
    {
      experiment: 24,
      label: 'Settled',
      claim: 'That 3I/ATLAS is interstellar, on an open path',
      figure: { value: atlasBendDegrees(), unit: 'degrees', what: 'how far the Sun bent its path' },
    },
    { experiment: 25, label: 'Strong evidence', claim: 'Andromeda is approaching and the galaxies will interact in some way' },
    {
      experiment: 25,
      label: 'Contested',
      claim: 'Whether they merge within 10 billion years',
      figure: { value: PUBLISHED_2026.mergerPercent, unit: 'percent', what: 'the 2026 study’s merger odds (the 2025 study gave ' + PUBLISHED_2025.mergerPercentWithin10Gyr + ' percent)' },
    },
    { experiment: 25, label: 'Open', claim: 'What Andromeda’s sideways motion really is, until Gaia’s next release' },
  ]
}

export function claimsWithLabel(label: StatusLabel): Claim[] {
  return frontierClaims().filter((c) => c.label === label)
}

// The experiments that hold at least one claim with this label, in order.
export function experimentsWithLabel(label: StatusLabel): number[] {
  return [...new Set(claimsWithLabel(label).map((c) => c.experiment))]
}

// How many claims and how many experiments each label has, for the plain sentence the recap shows (the specification's Decision 4).
export function labelCounts(): { label: StatusLabel; claims: number; experiments: number }[] {
  return STATUS_LABELS.map((label) => ({
    label,
    claims: claimsWithLabel(label).length,
    experiments: experimentsWithLabel(label).length,
  }))
}
