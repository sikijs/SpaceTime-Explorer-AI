// Real, standard value of Newton's constant in galactic units:
// kiloparsecs x (km/s)^2 per solar mass.
export const GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS = 4.30091e-6

// Real, standard unit-conversion constants (a kiloparsec in km; a Julian year in seconds).
export const KM_PER_KPC = 3.0856775814913673e16
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60

// Illustrative visible-matter model: the enclosed visible mass rises with radius and levels off,
// M_visible(r) = VISIBLE_MASS * r / (r + VISIBLE_SCALE_RADIUS), so almost all of it lies within a few
// scale radii of the center, like the bright part of a real galaxy. Not a fit to a real galaxy.
export const VISIBLE_MASS_SOLAR_MASSES = 8e10
export const VISIBLE_SCALE_RADIUS_KPC = 4

// Illustrative dark-matter halo (a "pseudo-isothermal" shape, a standard simple choice):
// M_halo(r) = amount * HALO_MASS_PER_KPC * (r - HALO_CORE_RADIUS * atan(r / HALO_CORE_RADIUS)),
// whose enclosed mass keeps growing roughly in proportion to r, so it dominates far from the center.
// `amount` is the learner's control: 0 = no dark matter, 1 = the amount that matches the observed
// speed, 2 = twice that amount. The constants were tuned for this teaching model, not taken from a
// published fit.
export const HALO_MASS_PER_KPC_SOLAR_MASSES = 1.2e10
export const HALO_CORE_RADIUS_KPC = 5

// A real, given, rounded value (the Milky Way near the Sun), used only as a comparison line.
export const OBSERVED_SPEED_KM_PER_S = 220

export const MIN_RADIUS_KPC = 5
export const MAX_RADIUS_KPC = 30
export const MAX_DARK_MATTER_AMOUNT = 2

export function visibleEnclosedMass(radiusKpc: number): number {
  return (VISIBLE_MASS_SOLAR_MASSES * radiusKpc) / (radiusKpc + VISIBLE_SCALE_RADIUS_KPC)
}

export function haloEnclosedMass(radiusKpc: number, amount: number): number {
  return (
    amount *
    HALO_MASS_PER_KPC_SOLAR_MASSES *
    (radiusKpc - HALO_CORE_RADIUS_KPC * Math.atan(radiusKpc / HALO_CORE_RADIUS_KPC))
  )
}

// v = sqrt(G * M_enclosed / r): the circular-orbit relation from Gravity and Curved Spacetime
// Experiment 6, restated here in real units (that module is dimensionless, so it is not imported).
export function circularSpeedKmPerS(radiusKpc: number, enclosedMassSolarMasses: number): number {
  return Math.sqrt((GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS * enclosedMassSolarMasses) / radiusKpc)
}

export interface RotationCurvePoint {
  radiusKpc: number
  visibleOnlySpeedKmPerS: number
  withDarkMatterSpeedKmPerS: number
}

export function rotationCurve(amount: number, radiiKpc: number[]): RotationCurvePoint[] {
  return radiiKpc.map((radiusKpc) => {
    const visibleMass = visibleEnclosedMass(radiusKpc)
    return {
      radiusKpc,
      visibleOnlySpeedKmPerS: circularSpeedKmPerS(radiusKpc, visibleMass),
      withDarkMatterSpeedKmPerS: circularSpeedKmPerS(
        radiusKpc,
        visibleMass + haloEnclosedMass(radiusKpc, amount),
      ),
    }
  })
}

// Time for one lap, in years: 2 * pi * r / v, converting kiloparsecs to kilometers.
export function orbitalPeriodYears(radiusKpc: number, speedKmPerS: number): number {
  return (2 * Math.PI * radiusKpc * KM_PER_KPC) / speedKmPerS / SECONDS_PER_YEAR
}

export interface DarkMatterResult {
  amount: number
  curve: RotationCurvePoint[]
}

// One sample per kiloparsec across the outer galaxy the experiment covers.
const CURVE_RADII_KPC = Array.from(
  { length: MAX_RADIUS_KPC - MIN_RADIUS_KPC + 1 },
  (_, i) => MIN_RADIUS_KPC + i,
)

export function runDarkMatterExperiment(amount: number): DarkMatterResult {
  return { amount, curve: rotationCurve(amount, CURVE_RADII_KPC) }
}
