import { horizonRadiusKm } from './blackHoleSizeExperiment'

// The dead core of a star, cooled, not spinning and at rest, of a chosen mass in solar masses. What can hold it up?
//   below about 1.4 Suns:        electrons (degeneracy pressure): a white dwarf
//   from 1.44 up to about 2:     neutrons: a neutron star
//   above about 2 up to about 3: not known: a neutron star or a black hole (the neutron star's largest mass is a range)
//   above about 3:               no known pressure: a black hole
// These limits are standard results, given and not derived. The white dwarf's size is
//   R = 0.0131 R_sun x (M / M_sun)^(-1/3) x sqrt(1 - (M / 1.44 M_sun)^(4/3)),
// whose shape (the radius falls as the mass rises, and falls to zero at the limit) is the white dwarf's, and whose
// coefficient was fitted to a numerical integration of a white dwarf with the standard degenerate-electron equation of
// state (Chandrasekhar's), within about 3% up to 1.2 Suns and 7% up to 1.35. The integration is repeated in the test file.
// The closed form itself was not found in a source. The horizon radius is reused from Experiment 1.

export const CHANDRASEKHAR_LIMIT_SOLAR_MASSES = 1.44
export const SURE_NEUTRON_STAR_TOP_SOLAR_MASSES = 2.0 // up to here, neutrons hold it up
export const SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES = 3.0 // above here, nothing known holds it up
export const NEUTRON_STAR_RADIUS_KM = 12 // a round value, as in Experiment 1
export const MIN_CORE_MASS = 0.3
export const MAX_CORE_MASS = 10
const SUN_RADIUS_KM = 695_700
const WHITE_DWARF_COEFFICIENT_IN_SUN_RADII = 0.0131
const CURVE_POINTS = 121

export type CoreOutcome = 'white-dwarf' | 'neutron-star' | 'uncertain' | 'black-hole'

function checkPositive(coreMassSolarMasses: number) {
  if (!Number.isFinite(coreMassSolarMasses) || !(coreMassSolarMasses > 0)) {
    throw new RangeError('The core mass must be a positive, finite number of solar masses.')
  }
}

// The horizon radius for one solar mass, in km (about 2.953): the horizon radius is this times the mass in Suns.
export const HORIZON_KM_PER_SOLAR_MASS = horizonRadiusKm(1)

// The white dwarf's radius worked step by step, for the Results (so the interface does no physics, CLAUDE.md §9).
export interface WhiteDwarfRadiusSteps {
  massOverLimit: number // M / 1.44
  massFactor: number // (M / M_sun)^(-1/3)
  limitTerm: number // (M / 1.44)^(4/3)
  squeezeFactor: number // sqrt(1 - limitTerm): it falls to zero at the limit
  scaleKm: number // 0.0131 R_sun, in km
  radiusKm: number // scaleKm x massFactor x squeezeFactor
}

export function whiteDwarfRadiusSteps(coreMassSolarMasses: number): WhiteDwarfRadiusSteps {
  checkPositive(coreMassSolarMasses)
  if (coreMassSolarMasses >= CHANDRASEKHAR_LIMIT_SOLAR_MASSES) {
    throw new RangeError('A white dwarf must have less than 1.44 solar masses.')
  }
  const massOverLimit = coreMassSolarMasses / CHANDRASEKHAR_LIMIT_SOLAR_MASSES
  const massFactor = coreMassSolarMasses ** (-1 / 3)
  const limitTerm = massOverLimit ** (4 / 3)
  const squeezeFactor = Math.sqrt(1 - limitTerm)
  const scaleKm = WHITE_DWARF_COEFFICIENT_IN_SUN_RADII * SUN_RADIUS_KM
  return { massOverLimit, massFactor, limitTerm, squeezeFactor, scaleKm, radiusKm: scaleKm * massFactor * squeezeFactor }
}

// The radius of a white dwarf of the given mass. It falls as the mass rises, and falls to zero at the limit, so a mass at
// or above the limit is not a white dwarf.
export function whiteDwarfRadiusKm(coreMassSolarMasses: number): number {
  return whiteDwarfRadiusSteps(coreMassSolarMasses).radiusKm
}

export function coreOutcome(coreMassSolarMasses: number): CoreOutcome {
  checkPositive(coreMassSolarMasses)
  if (coreMassSolarMasses < CHANDRASEKHAR_LIMIT_SOLAR_MASSES) return 'white-dwarf'
  if (coreMassSolarMasses <= SURE_NEUTRON_STAR_TOP_SOLAR_MASSES) return 'neutron-star'
  if (coreMassSolarMasses <= SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES) return 'uncertain'
  return 'black-hole'
}

// The radius of what holds the core up: the white dwarf's, or the neutron star's (also for the uncertain zone, if it
// holds); none for a black hole.
function heldUpRadius(coreMassSolarMasses: number): number | null {
  const outcome = coreOutcome(coreMassSolarMasses)
  if (outcome === 'white-dwarf') return whiteDwarfRadiusKm(coreMassSolarMasses)
  if (outcome === 'black-hole') return null
  return NEUTRON_STAR_RADIUS_KM
}

export interface LadderZone {
  outcome: CoreOutcome
  fromSolarMasses: number
  toSolarMasses: number
}

// The zones in order of mass, from the smallest core mass to the largest, with no gaps and no overlap.
export const LADDER: LadderZone[] = [
  { outcome: 'white-dwarf', fromSolarMasses: MIN_CORE_MASS, toSolarMasses: CHANDRASEKHAR_LIMIT_SOLAR_MASSES },
  { outcome: 'neutron-star', fromSolarMasses: CHANDRASEKHAR_LIMIT_SOLAR_MASSES, toSolarMasses: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES },
  { outcome: 'uncertain', fromSolarMasses: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, toSolarMasses: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES },
  { outcome: 'black-hole', fromSolarMasses: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, toSolarMasses: MAX_CORE_MASS },
]

export interface CurvePoint {
  coreMassSolarMasses: number
  horizonRadiusKm: number
  heldUpRadiusKm: number | null
}

export interface CoreResult {
  coreMassSolarMasses: number
  outcome: CoreOutcome
  horizonRadiusKm: number // reused from Experiment 1
  heldUpRadiusKm: number | null // null for a black hole
  radiusOverHorizon: number | null // heldUpRadiusKm / horizonRadiusKm; null for a black hole
  ladder: LadderZone[]
  // From the smallest to the largest core mass, spaced evenly in the logarithm of the mass, for the pictures.
  curve: CurvePoint[]
}

export function runBlackHoleFormationExperiment(coreMassSolarMasses: number): CoreResult {
  if (!(coreMassSolarMasses >= MIN_CORE_MASS && coreMassSolarMasses <= MAX_CORE_MASS)) {
    throw new RangeError(`The core mass must be between ${MIN_CORE_MASS} and ${MAX_CORE_MASS} solar masses.`)
  }

  const curve: CurvePoint[] = []
  for (let i = 0; i < CURVE_POINTS; i++) {
    const mass = MIN_CORE_MASS * (MAX_CORE_MASS / MIN_CORE_MASS) ** (i / (CURVE_POINTS - 1))
    curve.push({ coreMassSolarMasses: mass, horizonRadiusKm: horizonRadiusKm(mass), heldUpRadiusKm: heldUpRadius(mass) })
  }

  const horizon = horizonRadiusKm(coreMassSolarMasses)
  const heldUp = heldUpRadius(coreMassSolarMasses)
  return {
    coreMassSolarMasses,
    outcome: coreOutcome(coreMassSolarMasses),
    horizonRadiusKm: horizon,
    heldUpRadiusKm: heldUp,
    radiusOverHorizon: heldUp === null ? null : heldUp / horizon,
    ladder: LADDER,
    curve,
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 9, 2026-11-18): the fixed Part 1 run, the answers to the three predictions, the places where the white
// guess marks are drawn, and the check-up against published values. The interface only displays these (CLAUDE.md §9).

// Part 1 squeezes a core of this many Suns: heavy enough to end as a black hole, so the title's event is the first thing watched.
export const PART_ONE_MASS = 5

export type SizeAnswer = 'bigger' | 'same' | 'smaller'
export type ThresholdAnswer = 'about-one' | 'about-three' | 'about-thirty'
export type LimitAnswer = 'higher' | 'same' | 'lower'

// Two numbers are "the same" when they agree to rounding error in the arithmetic, not to a chosen tolerance.
const SAME = 1e-9
function compareTo(value: number, reference: number): -1 | 0 | 1 {
  if (Math.abs(value - reference) <= SAME * Math.max(1, Math.abs(reference))) return 0
  return value < reference ? -1 : 1
}

// The two white dwarf masses the first prediction compares (the question: if you add mass, what happens to the size?).
const LIGHT_WHITE_DWARF_MASS = 0.6
const HEAVY_WHITE_DWARF_MASS = 1.0

// Prediction 1: what happens to a white dwarf's size as mass is added.
export function sizeAnswer(): SizeAnswer {
  const c = compareTo(whiteDwarfRadiusKm(HEAVY_WHITE_DWARF_MASS), whiteDwarfRadiusKm(LIGHT_WHITE_DWARF_MASS))
  return c > 0 ? 'bigger' : c < 0 ? 'smaller' : 'same'
}

// The mass each answer to Prediction 2 names, in Suns. Unlike the other two, this guess has a mass of its own.
export const THRESHOLD_GUESS_MASSES: Record<ThresholdAnswer, number> = { 'about-one': 1, 'about-three': 3, 'about-thirty': 30 }

// Prediction 2: the answer nearest (in ratio) to the mass above which nothing known holds a core up.
export function thresholdAnswer(): ThresholdAnswer {
  const choices = Object.keys(THRESHOLD_GUESS_MASSES) as ThresholdAnswer[]
  return choices.reduce((best, choice) =>
    Math.abs(Math.log(THRESHOLD_GUESS_MASSES[choice] / SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES)) <
    Math.abs(Math.log(THRESHOLD_GUESS_MASSES[best] / SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES))
      ? choice
      : best,
  )
}

// Prediction 3: a neutron star's largest sure mass, against a white dwarf's (the Chandrasekhar limit).
export function limitAnswer(): LimitAnswer {
  const c = compareTo(SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, CHANDRASEKHAR_LIMIT_SOLAR_MASSES)
  return c > 0 ? 'higher' : c < 0 ? 'lower' : 'same'
}

export interface Guesses {
  size: SizeAnswer
  threshold: ThresholdAnswer
  limit: LimitAnswer
}

// For the tutor, which marks each guess against the model's answer (the Results never do).
export function markGuesses(guesses: Guesses): Record<keyof Guesses, boolean> {
  return {
    size: guesses.size === sizeAnswer(),
    threshold: guesses.threshold === thresholdAnswer(),
    limit: guesses.limit === limitAnswer(),
  }
}

// Where each guess mark is drawn. Guess 2 has a mass of its own, so it is positional on the ladder; a mass above the ladder's right
// end is drawn as an arrow off the scale. Guesses 1 and 3 have no size of their own, so each is a marker only.
export function isOffScale(massSolarMasses: number): boolean {
  return massSolarMasses > MAX_CORE_MASS
}
export type SizeMarker = 'up' | 'flat' | 'down' // an arrow beside the white dwarf curve: bigger, the same, smaller
export type LimitMarker = 'right' | 'bar' | 'left' // from the Chandrasekhar edge: higher, the same, lower
export const SIZE_MARKERS: Record<SizeAnswer, SizeMarker> = { bigger: 'up', same: 'flat', smaller: 'down' }
export const LIMIT_MARKERS: Record<LimitAnswer, LimitMarker> = { higher: 'right', same: 'bar', lower: 'left' }

// ---- The check-up against published values. Every published figure below is from a page that was read (see the draft wording's source table,
// docs/audit/black-holes-and-strong-gravity/09-draft-wording.md). Nothing here is a chosen cut-off: a reading is "the same" only when the numbers
// agree at the precision the published figure is given to, and otherwise "less" or "more"; for a measured range it is "inside" or outside it.
export const PUBLISHED = {
  // NASA Imagine the Universe, "White Dwarfs": "1.4 times the mass of the Sun".
  chandrasekharLimitSolarMasses: 1.4,
  chandrasekharDecimals: 1,
  // Sirius B: Bond et al. 2017 (mass 1.018 ± 0.011 Suns); ESA/Hubble 2005 (diameter 12,000 km, rounded to two figures).
  siriusBMassSolarMasses: 1.018,
  siriusBDiameterKm: 12_000,
  // NICER, Choudhury et al. 2024 (PSR J0437-4715) and Salmi et al. 2024 (PSR J0740+6620): radius with its upper and lower error.
  neutronStarRadii: [
    { massSolarMasses: 1.418, radiusKm: 11.36, plusKm: 0.95, minusKm: 0.63 },
    { massSolarMasses: 2.073, radiusKm: 12.49, plusKm: 1.28, minusKm: 0.88 },
  ],
  // NASA Imagine the Universe, "Neutron Stars": a core "between about 1 and 3 solar masses" can be stopped by neutrons.
  nasaNeutronStarCoreToSolarMasses: 3,
  // Measured neutron star masses: Salmi et al. 2024 (2.073 ± 0.069) and Romani et al. 2022 (2.35 ± 0.17).
  heavyNeutronStarMasses: [2.073, 2.35],
} as const

export type CheckUpReading = 'the same' | 'less' | 'more' | 'inside the measured ranges'

export interface CheckUpRow {
  id: 'chandrasekhar' | 'siriusB' | 'neutronStarRadius' | 'blackHoleEdge' | 'sureNeutronStarEdge'
  page: number // the page's own value (Suns, or km for the two radii)
  published: number[] // the published value or values it is read against
  reading: CheckUpReading
  percentGap: number | null // (page ÷ published − 1) × 100 for a single published value; null otherwise
}

const percentGap = (page: number, published: number) => (page / published - 1) * 100
const readingAgainst = (page: number, published: number): CheckUpReading => {
  const c = compareTo(page, published)
  return c === 0 ? 'the same' : c < 0 ? 'less' : 'more'
}

export function checkUp(): CheckUpRow[] {
  const roundTo = (value: number, decimals: number) => Number(value.toFixed(decimals))

  const chandra = CHANDRASEKHAR_LIMIT_SOLAR_MASSES
  const siriusRadius = whiteDwarfRadiusKm(PUBLISHED.siriusBMassSolarMasses)
  const siriusPublished = PUBLISHED.siriusBDiameterKm / 2
  const insideBoth = PUBLISHED.neutronStarRadii.every((r) => NEUTRON_STAR_RADIUS_KM >= r.radiusKm - r.minusKm && NEUTRON_STAR_RADIUS_KM <= r.radiusKm + r.plusKm)
  const lightestHeavy = Math.min(...PUBLISHED.heavyNeutronStarMasses)

  return [
    {
      id: 'chandrasekhar',
      page: chandra,
      published: [PUBLISHED.chandrasekharLimitSolarMasses],
      reading: readingAgainst(roundTo(chandra, PUBLISHED.chandrasekharDecimals), PUBLISHED.chandrasekharLimitSolarMasses),
      percentGap: null,
    },
    {
      id: 'siriusB',
      page: siriusRadius,
      published: [siriusPublished],
      reading: readingAgainst(siriusRadius, siriusPublished),
      percentGap: percentGap(siriusRadius, siriusPublished),
    },
    {
      id: 'neutronStarRadius',
      page: NEUTRON_STAR_RADIUS_KM,
      published: PUBLISHED.neutronStarRadii.map((r) => r.radiusKm),
      reading: insideBoth ? 'inside the measured ranges' : NEUTRON_STAR_RADIUS_KM < PUBLISHED.neutronStarRadii[0].radiusKm - PUBLISHED.neutronStarRadii[0].minusKm ? 'less' : 'more',
      percentGap: null,
    },
    {
      id: 'blackHoleEdge',
      page: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
      published: [PUBLISHED.nasaNeutronStarCoreToSolarMasses],
      reading: readingAgainst(SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, PUBLISHED.nasaNeutronStarCoreToSolarMasses),
      percentGap: null,
    },
    {
      id: 'sureNeutronStarEdge',
      page: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
      published: [...PUBLISHED.heavyNeutronStarMasses],
      reading: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES < lightestHeavy ? 'less' : SURE_NEUTRON_STAR_TOP_SOLAR_MASSES > Math.max(...PUBLISHED.heavyNeutronStarMasses) ? 'more' : 'the same',
      percentGap: null,
    },
  ]
}
