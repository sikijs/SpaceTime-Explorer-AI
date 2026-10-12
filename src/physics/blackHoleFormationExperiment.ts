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

// The radius of a white dwarf of the given mass. It falls as the mass rises, and falls to zero at the limit, so a mass at
// or above the limit is not a white dwarf.
export function whiteDwarfRadiusKm(coreMassSolarMasses: number): number {
  checkPositive(coreMassSolarMasses)
  if (coreMassSolarMasses >= CHANDRASEKHAR_LIMIT_SOLAR_MASSES) {
    throw new RangeError('A white dwarf must have less than 1.44 solar masses.')
  }
  const ratio = coreMassSolarMasses / CHANDRASEKHAR_LIMIT_SOLAR_MASSES
  return (
    WHITE_DWARF_COEFFICIENT_IN_SUN_RADII * SUN_RADIUS_KM * coreMassSolarMasses ** (-1 / 3) * Math.sqrt(1 - ratio ** (4 / 3))
  )
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
