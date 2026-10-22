// Frontier and Beyond, Experiment 12: the star that may be about to explode, what is Betelgeuse, and does it have a companion?
// See docs/experiments/frontier-and-beyond/12-betelgeuse-and-its-companion.md, "Physics Model".
//
// No new physics: (1) a size from an angle and a distance, radius = 1/2 x angular diameter x distance (the small-angle relation, with the angle in radians); (2) Kepler's
// third law in astronomers' units, period^2 = separation^3 / (total mass), with the period in years, the separation in astronomical units and the masses in solar masses;
// (3) the chance that noise alone gives a result at least `z` sigma, counting one direction only (the convention of Experiment 1 of this group). The star is a sphere with
// a sharp edge, the companion's orbit is a circle, and the module does not model the star's inside, its pulsations, the Great Dimming, or the way the five lines of evidence
// might be combined into one number (the papers give none). This module imports nothing.

// Units. 1 parsec = 648,000 / pi astronomical units (the IAU's definition); the solar radius is the IAU's nominal 695,700 km and the astronomical unit is exact, so
// one astronomical unit is 149,597,870.7 / 695,700 = 215.03 solar radii; the year is the Julian year of 365.25 days.
export const ASTRONOMICAL_UNIT_KM = 149_597_870.7
export const SOLAR_RADIUS_KM = 695_700
export const AU_PER_PARSEC = 648_000 / Math.PI
export const SOLAR_RADII_PER_AU = ASTRONOMICAL_UNIT_KM / SOLAR_RADIUS_KM
export const DAYS_PER_YEAR = 365.25
const MILLIARCSECONDS_PER_RADIAN = (180 / Math.PI) * 3600 * 1000

// The planets' orbits as circles (standard values; not read from a source for this page, see the specification's open items).
export const PLANETS = [
  { name: 'Mercury', orbitAU: 0.387 },
  { name: 'Venus', orbitAU: 0.723 },
  { name: 'Earth', orbitAU: 1.0 },
  { name: 'Mars', orbitAU: 1.524 },
  { name: 'Jupiter', orbitAU: 5.203 },
] as const

// Betelgeuse. Distance and its range: Joyce and others (2020), 168 (+27, -15) pc. Angular diameter: Howell and others (2025) quote 40 +/- 1.4 mas (2020) and 41 +/- 1.2 mas
// (2024) and a model value of about 42 mas; the module's default is 41. The mass is the Howell paper's adopted ~17.5 solar masses; Joyce and others give 16.5 to 19. Joyce's
// radius, 764 (+116, -62) solar radii, is kept to compare with the radius worked out here.
export const BETELGEUSE = {
  distancePc: 168,
  distanceRangePc: [153, 195] as const,
  angularDiameterMas: 41,
  angularDiameterRangeMas: [40, 42] as const,
  massSolar: 17.5,
  massChoicesSolar: [16.5, 17.5, 19] as const,
  joyceRadiusSolarRadii: 764,
}

// The companion, from Howell and others (2025) and the papers they take the orbit from. The model separation is 1850 solar radii (Goldberg and others: 2.43 Betelgeuse radii).
// The observed period is quoted, not computed: about 2,100 days (Goldberg and others; the Center for Astrophysics release).
export const COMPANION = {
  separationMas: 52,
  positionAngleDegrees: 115,
  modelSeparationSolarRadii: 1850,
  massSolar: 1.6,
  massChoicesSolar: [1.17, 1.4, 1.6, 2.0] as const,
  reportedSigma: 1.5,
  magnitudeDifference: 6, // about 6 +/- 1 magnitudes fainter than Betelgeuse (in the blue band, Howell and others)
  observedPeriodDays: 2100,
  greatestElongations: ['2024 Dec 6', '2027 Nov 26', '2030 Nov 15', '2033 Nov 4'] as const,
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// Size from an angle and a distance. Radius = 1/2 x (angular diameter in radians) x distance; one milliarcsecond at one parsec is one thousandth of an astronomical unit, up to
// the small-angle factor, which is why this is exact enough here (the angle is about 4e-7 radians).
export function radiusAU(angularDiameterMas: number, distancePc: number): number {
  requirePositive(angularDiameterMas, 'The angular diameter')
  requirePositive(distancePc, 'The distance')
  const diameterRadians = angularDiameterMas / MILLIARCSECONDS_PER_RADIAN
  return 0.5 * diameterRadians * distancePc * AU_PER_PARSEC
}
export function radiusSolarRadii(angularDiameterMas: number, distancePc: number): number {
  return radiusAU(angularDiameterMas, distancePc) * SOLAR_RADII_PER_AU
}

// The smallest and largest radius over the ranges of distance and of angular diameter that the papers allow.
export function radiusRangeAU(): { min: number; max: number } {
  return {
    min: radiusAU(BETELGEUSE.angularDiameterRangeMas[0], BETELGEUSE.distanceRangePc[0]),
    max: radiusAU(BETELGEUSE.angularDiameterRangeMas[1], BETELGEUSE.distanceRangePc[1]),
  }
}

// Which planets' orbits lie inside a star of this radius centred on the Sun (so the planet would be inside the star).
export function planetsInside(radius: number): string[] {
  requirePositive(radius, 'The radius')
  return PLANETS.filter((p) => p.orbitAU < radius).map((p) => p.name)
}

// The separation seen on the sky (an angle at a distance) turned into a length.
export function separationAU(separationMas: number, distancePc: number): number {
  requirePositive(separationMas, 'The separation')
  requirePositive(distancePc, 'The distance')
  return (separationMas / MILLIARCSECONDS_PER_RADIAN) * distancePc * AU_PER_PARSEC
}
export function modelSeparationAU(): number {
  return COMPANION.modelSeparationSolarRadii / SOLAR_RADII_PER_AU
}
export function separationInRadii(separation: number, radius: number): number {
  requirePositive(separation, 'The separation')
  requirePositive(radius, 'The radius')
  return separation / radius
}

// Kepler's third law in astronomers' units: period (years)^2 = separation (AU)^3 / total mass (solar masses).
export function keplerPeriodYears(separation: number, mass1Solar: number, mass2Solar: number): number {
  requirePositive(separation, 'The separation')
  requirePositive(mass1Solar, 'The first mass')
  requirePositive(mass2Solar, 'The second mass')
  return Math.sqrt((separation * separation * separation) / (mass1Solar + mass2Solar))
}
export function periodDays(separation: number, mass1Solar: number, mass2Solar: number): number {
  return keplerPeriodYears(separation, mass1Solar, mass2Solar) * DAYS_PER_YEAR
}

// The chance that noise alone makes a result at least `z` sigma, counting one direction only: the upper tail of the normal curve, Q(z) = erfc(z / sqrt 2) / 2.
// erfc is worked out here (imports nothing): a series for small arguments, and a continued fraction for large ones, where the series would lose its digits.
function erfc(x: number): number {
  if (x < 0) return 2 - erfc(-x)
  if (x < 2) {
    // erf(x) = 2 / sqrt(pi) x sum (-1)^n x^(2n) / (n! (2n+1))
    let sum = 0
    let term = x
    for (let n = 0; n < 200; n++) {
      sum += term / (2 * n + 1)
      term *= (-x * x) / (n + 1)
      if (Math.abs(term) < 1e-18) break
    }
    return 1 - (2 / Math.sqrt(Math.PI)) * sum
  }
  // erfc(x) = exp(-x^2) / sqrt(pi) x 1 / (x + (1/2) / (x + 1 / (x + (3/2) / (x + 2 / (x + ...)))))
  let fraction = x
  for (let k = 120; k >= 1; k--) fraction = x + k / 2 / fraction
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / fraction
}
export function chanceOfSigma(z: number): number {
  if (!Number.isFinite(z) || z < 0) throw new RangeError('The number of sigma must not be negative')
  return 0.5 * erfc(z / Math.SQRT2)
}
// "1 time in N": N is one over the chance.
export function oneInChance(z: number): number {
  return 1 / chanceOfSigma(z)
}

// Astronomers' brightness scale: a difference of m magnitudes is a brightness ratio of 10^(0.4 m), so 5 magnitudes is exactly 100 times and 6 magnitudes about 251 times.
export function brightnessRatio(magnitudes: number): number {
  if (!Number.isFinite(magnitudes) || magnitudes < 0) throw new RangeError('The difference in magnitudes must not be negative')
  return Math.pow(10, 0.4 * magnitudes)
}

// For the predictions' answers.
// Prediction 1: how far out would Betelgeuse's surface reach if it replaced the Sun?
export type Reach = 'inside Earth' | 'past Earth' | 'past Mars' | 'past Jupiter'
export function reachOf(radius: number): Reach {
  requirePositive(radius, 'The radius')
  const orbit = (name: string) => PLANETS.find((p) => p.name === name)!.orbitAU
  if (radius >= orbit('Jupiter')) return 'past Jupiter'
  if (radius >= orbit('Mars')) return 'past Mars'
  if (radius >= orbit('Earth')) return 'past Earth'
  return 'inside Earth'
}
export function sizeAnswer(): Reach {
  return reachOf(radiusAU(BETELGEUSE.angularDiameterMas, BETELGEUSE.distancePc))
}

// Prediction 2: how often would noise alone make a spot at least as strong as the reported one? The three answer buttons.
export type SigmaAnswer = '1 in 2' | '1 in 15' | '1 in 3.5 million'
const SIGMA_ANSWERS: { label: SigmaAnswer; oneIn: number }[] = [
  { label: '1 in 2', oneIn: 2 },
  { label: '1 in 15', oneIn: 15 },
  { label: '1 in 3.5 million', oneIn: 3.5e6 },
]
// The button nearest to the true figure, comparing powers of ten (so 15.0 is nearest "1 in 15", and not "1 in 2").
export function sigmaAnswer(): SigmaAnswer {
  const truth = Math.log10(oneInChance(COMPANION.reportedSigma))
  let best = SIGMA_ANSWERS[0]
  for (const a of SIGMA_ANSWERS) {
    if (Math.abs(Math.log10(a.oneIn) - truth) < Math.abs(Math.log10(best.oneIn) - truth)) best = a
  }
  return best.label
}

// The learner's choices (the defaults are the published values).
export interface BetelgeuseSettings {
  distancePc?: number
  angularDiameterMas?: number
  betelgeuseMassSolar?: number
  companionMassSolar?: number
  sigma?: number
}
export interface BetelgeuseResult {
  distancePc: number
  radiusAU: number
  radiusSolarRadii: number
  planetsInside: string[]
  reach: Reach
  separationFromAngleAU: number // the 52 mas turned into a length at the chosen distance
  modelSeparationAU: number // 1850 solar radii
  separationInBetelgeuseRadii: number // the model separation over the radius
  periodYears: number
  periodDays: number
  periodMinusObservedPercent: number // against the observed 2,100 days
  sigma: number
  chanceOfNoise: number
  oneIn: number
}

export function runBetelgeuseCompanion(settings: BetelgeuseSettings = {}): BetelgeuseResult {
  const distancePc = settings.distancePc ?? BETELGEUSE.distancePc
  const diameter = settings.angularDiameterMas ?? BETELGEUSE.angularDiameterMas
  const m1 = settings.betelgeuseMassSolar ?? BETELGEUSE.massSolar
  const m2 = settings.companionMassSolar ?? COMPANION.massSolar
  const sigma = settings.sigma ?? COMPANION.reportedSigma
  const radius = radiusAU(diameter, distancePc)
  const model = modelSeparationAU()
  const days = periodDays(model, m1, m2)
  return {
    distancePc,
    radiusAU: radius,
    radiusSolarRadii: radius * SOLAR_RADII_PER_AU,
    planetsInside: planetsInside(radius),
    reach: reachOf(radius),
    separationFromAngleAU: separationAU(COMPANION.separationMas, distancePc),
    modelSeparationAU: model,
    separationInBetelgeuseRadii: separationInRadii(model, radius),
    periodYears: days / DAYS_PER_YEAR,
    periodDays: days,
    periodMinusObservedPercent: ((days - COMPANION.observedPeriodDays) / COMPANION.observedPeriodDays) * 100,
    sigma,
    chanceOfNoise: chanceOfSigma(sigma),
    oneIn: oneInChance(sigma),
  }
}
