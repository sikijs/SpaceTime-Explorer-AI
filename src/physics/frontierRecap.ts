import { tensionSigma, EARLY_MEASUREMENT, LATE_MEASUREMENTS } from './hubbleTension'
import { PUBLISHED_SIGMAS } from './evolvingDarkEnergy'
import { DESI_JULY_2026 } from './neutrinoMass'
import { MOM_Z14_REDSHIFT } from './earliestGalaxies'
import { PUBLISHED_RESULTS as WIDE_BINARY_RESULTS } from './wideBinaries'
import { ALPHA_2023, combinedUncertainty } from './antimatterGravity'
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

// The number a learner sees in the sidebar: the chapters are numbered 1 to 24 in a row, so every experiment after the dropped Experiment 16
// is one lower than its specification number (the specification's Experiment 25 is the learner's 24). `experiment` in a claim stays the
// specification number; the page shows `displayNumber(experiment)`.
export function displayNumber(specNumber: number): number {
  if (!EXPERIMENT_NUMBERS.includes(specNumber)) throw new RangeError(`There is no Experiment ${specNumber} in this group`)
  return specNumber > 16 ? specNumber - 1 : specNumber
}

// A real number from the earlier experiment, with its unit and what it is, read from that experiment's module.
export interface Figure {
  value: number
  // Set when the figure is a range, from value up to high.
  high?: number
  // Set when the experiment says "more than" this value, not exactly this value.
  moreThan?: boolean
  // How many decimal places to show (display rounding only, as in the experiment the figure comes from).
  decimals: number
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

function pulsarResult(id: string) {
  const result = PULSAR_RESULTS.find((r) => r.id === id)
  if (!result) throw new Error(`The ${id} result is missing from the module`)
  return result
}

function nanogravSigmaHigh(): number {
  return pulsarResult('nanograv').sigmaHigh
}

function supernovaMassRange(): [number, number] {
  const estimates = massEstimates()
  return [Math.min(...estimates.map((e) => e.lowSolar)), Math.max(...estimates.map((e) => e.highSolar))]
}

function dovekieSigma(): number {
  const bar = PUBLISHED_SIGMAS.find((b) => b.name.startsWith('DES Y5 recalibrated'))
  if (!bar) throw new Error('The recalibrated DES bar is missing from the module')
  return bar.sigma
}

function lymanAlphaSigma(): number {
  const bar = PUBLISHED_SIGMAS.find((b) => b.name.includes('July 2026 Lyman-alpha'))
  if (!bar) throw new Error('The July 2026 DESI bar is missing from the module')
  return bar.sigma
}

// The numbers the recap's explanatory text quotes (section 3 of the specification), read from the experiments' modules so the text
// cannot drift from them (CLAUDE.md §9).
export interface FrontierFacts {
  // Experiment 2: the lowest and highest of DESI's two bars that the page puts side by side, in sigma.
  desiSigmaLow: number
  desiSigmaHigh: number
  // Experiment 21: the pulsar-timing evidence, from the lowest of the arrays' evidence to NANOGrav's, in sigma.
  pulsarSigmaLow: number
  pulsarSigmaHigh: number
  // Experiment 8: ALPHA-g's ratio to g and the page's combined give-or-take.
  antimatterRatio: number
  antimatterPlusMinus: number
  // Experiment 9: the height of the JILA clock's test, in millimetres.
  jilaMillimetres: number
}

export function frontierFacts(): FrontierFacts {
  return {
    desiSigmaLow: lymanAlphaSigma(),
    desiSigmaHigh: dovekieSigma(),
    pulsarSigmaLow: pulsarResult('epta').sigmaLow,
    pulsarSigmaHigh: nanogravSigmaHigh(),
    antimatterRatio: ALPHA_2023.ratio,
    antimatterPlusMinus: combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation),
    jilaMillimetres: JILA_2022.millimetres,
  }
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
      figure: { value: tensionSigma(LATE_MEASUREMENTS[0], EARLY_MEASUREMENT), decimals: 2, unit: 'sigma', what: 'the gap between the SH0ES and Planck measurements' },
    },
    {
      experiment: 2,
      label: 'Contested',
      claim: 'DESI’s hint that dark energy weakens with time',
      figure: { value: lymanAlphaSigma(), decimals: 1, unit: 'sigma', what: 'DESI’s July 2026 analysis, together with the microwave background' },
    },
    { experiment: 3, label: 'Contested', claim: 'Whether the Dark Energy Survey’s lumpiness is below the microwave background’s; the other survey, KiDS, no longer disagrees' },
    { experiment: 4, label: 'Contested', claim: 'How small the limit on the neutrinos’ total mass has become, and whether it leaves any room', figure: { value: DESI_JULY_2026.value, decimals: 4, unit: 'eV', what: 'DESI’s July 2026 ceiling on the neutrinos’ total mass' } },
    {
      experiment: 5,
      label: 'Strong evidence',
      claim: 'Galaxies already existed very early',
      figure: { value: MOM_Z14_REDSHIFT, decimals: 2, unit: '', what: 'the redshift of MoM-z14' },
    },
    { experiment: 5, label: 'Open', claim: 'What built them so fast' },
    { experiment: 6, label: 'Strong evidence', claim: 'What dark matter is not (the searches’ limits)' },
    { experiment: 6, label: 'Open', claim: 'What dark matter is, and what one unexplained event means' },
    {
      experiment: 7,
      label: 'Contested',
      claim: 'Whether gravity changes at very small pulls',
      figure: { value: wideBinaryGamma2026(), decimals: 2, unit: '', what: 'the 2026 speed-up of wide binaries, observed over predicted' },
    },
    {
      experiment: 8,
      label: 'Strong evidence',
      claim: 'Antihydrogen is attracted to the Earth',
      figure: { value: ALPHA_2023.ratio, decimals: 2, unit: 'of g', what: 'ALPHA-g’s measured ratio' },
    },
    { experiment: 8, label: 'Open', claim: 'Whether antimatter falls exactly as ordinary matter does' },
    {
      experiment: 9,
      label: 'Settled',
      claim: 'A higher clock ticks faster',
      figure: { value: JILA_2022.millimetres, decimals: 0, unit: 'mm', what: 'the height across which the JILA clock saw it' },
    },
    {
      experiment: 10,
      label: 'Strong evidence',
      claim: 'A clock on the Moon runs faster than one on the Earth, by calculation',
      figure: { value: NIST_2024.gainMicrosecondsPerDay, decimals: 0, unit: 'µs a day', what: 'microseconds gained each day, in the NIST paper' },
    },
    { experiment: 10, label: 'Open', claim: 'No clock on the Moon has measured it yet' },
    {
      experiment: 11,
      label: 'Settled',
      claim: 'The probe’s distance and speed, and the physics',
      figure: { value: PARKER.closestApproachSpeed / 1000, decimals: 2, unit: 'km/s', what: 'Parker Solar Probe’s speed at its closest approach' },
    },
    { experiment: 12, label: 'Strong evidence', claim: 'Betelgeuse has a companion' },
    { experiment: 12, label: 'Open', claim: 'The companion’s mass and nature' },
    { experiment: 13, label: 'Strong evidence', claim: 'A red supergiant exploded. Theory and one earlier supernova say almost all the energy leaves as neutrinos, though none were reported from this one' },
    {
      experiment: 13,
      label: 'Contested',
      claim: 'The star’s mass',
      figure: { value: massLow, high: massHigh, decimals: 0, unit: 'Suns', what: 'the range of published estimates of the star’s mass' },
    },
    { experiment: 13, label: 'Open', claim: 'Why it shed so much gas' },
    { experiment: 14, label: 'Strong evidence', claim: 'This one remnant came from a double detonation of a white dwarf' },
    { experiment: 14, label: 'Contested', claim: 'A 2025 paper reads the two shells of calcium in the remnant another way' },
    { experiment: 14, label: 'Open', claim: 'How many white-dwarf explosions (Type Ia supernovae) happen this way' },
    {
      experiment: 15,
      label: 'Strong evidence',
      claim: 'A neutron star of about 1.4 Suns is 11 to 12 km in radius',
      figure: { value: NEUTRON_STAR_DATA.j0437.radiusKm, decimals: 2, unit: 'km', what: 'the radius of PSR J0437−4715' },
    },
    { experiment: 15, label: 'Open', claim: 'How heavy a neutron star can be' },
    {
      experiment: 17,
      label: 'Strong evidence',
      claim: 'What was seen: the star faded with no bright supernova',
      figure: { value: FAILED_SUPERNOVA_DATA.visibleFadeFactor, moreThan: true, decimals: 0, unit: 'times', what: 'how much the star faded in visible light' },
    },
    { experiment: 17, label: 'Contested', claim: 'What it became: a black hole, or two stars that merged' },
    { experiment: 17, label: 'Open', claim: 'How often massive stars fail' },
    {
      experiment: 18,
      label: 'Strong evidence',
      claim: 'The total surface area of the black holes (their horizons) rose after the merger, as Hawking’s 1971 area theorem says it must',
      figure: { value: areaAfterKm2() / totalAreaBeforeKm2(), decimals: 2, unit: 'times', what: 'the area after the merger divided by the area before' },
    },
    {
      experiment: 19,
      label: 'Strong evidence',
      claim: 'The main tone of the ringing matches what the mass and spin give, to a few percent',
      figure: { value: GW250114_RINGDOWN.measuredFrequencyHz, decimals: 1, unit: 'Hz', what: 'the detectors’ measured frequency' },
    },
    {
      experiment: 20,
      label: 'Strong evidence',
      claim: 'GW231123 was the heaviest merger seen, between black holes that were probably spinning fast',
      figure: { value: GW231123.finalBestFitSolar, decimals: 0, unit: 'Suns', what: 'the best-fit mass of the final black hole' },
    },
    { experiment: 20, label: 'Open', claim: 'What made such black holes' },
    {
      experiment: 21,
      label: 'Strong evidence',
      claim: 'The ring sizes are close to what the masses and distances give',
      figure: { value: M87_STAR.ringMicroarcsec, decimals: 0, unit: 'microarcseconds', what: 'the measured ring of M87*' },
    },
    { experiment: 21, label: 'Open', claim: 'How tightly that tests gravity' },
    {
      experiment: 22,
      label: 'Strong evidence',
      claim: 'A faint background of very slow gravitational waves, not yet at 5 sigma',
      figure: { value: nanogravSigmaHigh(), decimals: 0, unit: 'sigma', what: 'the upper end of NANOGrav’s 15-year evidence' },
    },
    { experiment: 22, label: 'Open', claim: 'What makes it' },
    { experiment: 23, label: 'Settled', claim: 'The limit on how fast a black hole can feed (the Eddington limit), and growth that multiplies' },
    {
      experiment: 23,
      label: 'Strong evidence',
      claim: 'JWST sees growing black holes very early',
      figure: { value: CAPERS_LRD_Z9.redshift, decimals: 3, unit: '', what: 'the redshift of CAPERS-LRD-z9' },
    },
    { experiment: 23, label: 'Open', claim: 'Whether any broke the limit or started heavy, and what the little red dots are' },
    {
      experiment: 24,
      label: 'Settled',
      claim: 'That 3I/ATLAS is interstellar, on an open path',
      figure: { value: atlasBendDegrees(), decimals: 1, unit: 'degrees', what: 'how far the Sun bent its path' },
    },
    { experiment: 25, label: 'Settled', claim: 'Andromeda is coming towards the Milky Way, and its distance is known to a small give-or-take' },
    {
      experiment: 25,
      label: 'Contested',
      claim: `Andromeda’s sideways speed, and with it whether they merge within 10 billion years: the 2025 study gave ${PUBLISHED_2025.mergerPercentWithin10Gyr} percent`,
      figure: { value: PUBLISHED_2026.mergerPercent, decimals: 0, unit: 'percent', what: 'the 2026 study' },
    },
    { experiment: 25, label: 'Open', claim: 'How much the other galaxies matter, and what newer measurements will show (Gaia’s next release is expected in December 2026)' },
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
