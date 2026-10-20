// Frontier and Beyond, Experiment 7: do we need dark matter, or does gravity change? Wide binary stars.
// See docs/experiments/frontier-and-beyond/07-wide-binary-stars.md, "Physics Model".
//
// No new physics beyond textbook relations: the circular-orbit speed v = sqrt(G M / s) and the pull g = G M / s^2 of two stars of total mass M
// at separation s, and the fact that a pull `gamma` times Newton's gives a speed sqrt(gamma) times Newton's (v^2 is proportional to the pull).
// The modified-gravity boost is NOT derived here: it is the published number (about 1.4 for wide binaries in the Galaxy's field), and the model
// does not draw how a boost switches on with separation. The contamination model is a toy (a fraction of pairs that move k times faster), not
// any team's analysis. This module does not analyse any Gaia data.

// Constants, in SI units (the values the specification's hand calculations use).
export const G = 6.674e-11 // m^3 kg^-1 s^-2
export const SOLAR_MASS_KG = 1.989e30
export const AU_M = 1.496e11
export const PARSEC_IN_AU = 206264.8
export const A0 = 1.2e-10 // m/s^2, the MOND acceleration scale (a value from the MOND literature, a search summary only)

// The boost in the pull that the papers give for wide binaries in the Galaxy's field (Chae 2023: 1.43 +/- 0.06; Banik 2024: "about 20 percent" in speed).
export const GAMMA_MOND_WIDE_BINARY = 1.4

// The local dark-matter density, about 0.01 solar masses per cubic parsec (a widely quoted order of magnitude, not read at a source).
export const LOCAL_DARK_MATTER_SOLAR_MASSES_PER_PC3 = 0.01

export type PublishedKind = 'gamma' | 'other'
export interface PublishedResult {
  name: string
  year: number
  binaries: number | null // null when the abstract read does not give a number
  quantity: string
  kind: PublishedKind // 'gamma' results can be drawn on one picture; the others report something that is not comparable
  value: number | null
  errorPlus: number
  errorMinus: number
  sigma: number | null // a significance the abstract states, with its direction in `note`
  note: string
  source: string
}

// Picture 3's bars are the 'gamma' results in this order; the others are table rows only.
export const PUBLISHED_RESULTS: PublishedResult[] = [
  {
    name: 'Chae',
    year: 2023,
    binaries: 26615,
    quantity: 'g_obs / g_pred at g_N of about 10^-10.15 m/s^2',
    kind: 'gamma',
    value: 1.43,
    errorPlus: 0.06,
    errorMinus: 0.06,
    sigma: 10,
    note: 'a deviation from Newton at 10 sigma',
    source: 'arXiv:2305.04613 (ApJ 952, 128)',
  },
  {
    name: 'Chae',
    year: 2024,
    binaries: 2463,
    quantity: 'g_obs / g_pred at or below 10^-10 m/s^2',
    kind: 'gamma',
    value: 1.49,
    errorPlus: 0.21,
    errorMinus: 0.19,
    sigma: 5.0,
    note: 'about 5.0 sigma for the deviation; a velocity boost of 1.20 +/- 0.06 (stat) +/- 0.05 (sys) beyond 5 kAU',
    source: 'arXiv:2309.10404',
  },
  {
    name: 'Chae and colleagues',
    year: 2026,
    binaries: 36,
    quantity: 'gravity boost factor gamma',
    kind: 'gamma',
    value: 1.6,
    errorPlus: 0.24,
    errorMinus: 0.14,
    sigma: null,
    note: 'version 3 of the abstract; "dominated by two systems" whose speeds exceed their Newtonian escape speeds',
    source: 'arXiv:2601.21728 (29 January 2026, revised 19 September 2026)',
  },
  {
    name: 'Saad and Ting (forward-modelled orbits)',
    year: 2026,
    binaries: 36,
    quantity: 'gravity boost factor gamma, the same 36 binaries',
    kind: 'gamma',
    value: 1.0,
    errorPlus: 0.24,
    errorMinus: 0.19,
    sigma: null,
    note: 'consistent with Newton',
    source: 'arXiv:2603.11015 (11 March 2026)',
  },
  {
    name: 'Saad and Ting (geometric de-projection)',
    year: 2026,
    binaries: 36,
    quantity: 'gravity boost factor gamma, the same 36 binaries',
    kind: 'gamma',
    value: 1.56,
    errorPlus: 0.21,
    errorMinus: 0.18,
    sigma: null,
    note: 'the replacement that reproduces the first team\'s value',
    source: 'arXiv:2603.11015 (11 March 2026)',
  },
  {
    name: 'Banik and colleagues',
    year: 2024,
    binaries: 8611,
    quantity: 'alpha_grav (0 is Newton, 1 is MOND)',
    kind: 'other',
    value: -0.021,
    errorPlus: 0.065,
    errorMinus: 0.045,
    sigma: 19,
    note: 'Newtonian dynamics preferred at 19 sigma',
    source: 'arXiv:2311.03436 (MNRAS 527, 4573)',
  },
  {
    name: 'Chae',
    year: 2025,
    binaries: 312,
    quantity: 'anomaly parameter, from 3D velocities',
    kind: 'other',
    value: null,
    errorPlus: 0,
    errorMinus: 0,
    sigma: null,
    note: 'an anomaly at accelerations below 10^-9 m/s^2 that agrees with MOND',
    source: 'arXiv:2502.09373',
  },
  {
    name: 'Pittordis, Sutherland and Shepherd',
    year: 2025,
    binaries: null,
    quantity: 'fit of Newton and MOND models',
    kind: 'other',
    value: null,
    errorPlus: 0,
    errorMinus: 0,
    sigma: null,
    note: 'Newtonian models fit significantly better, with a caveat about the triple-star population',
    source: 'arXiv:2504.07569',
  },
  {
    name: 'Saglia and colleagues',
    year: 2025,
    binaries: 32,
    quantity: 'orbital velocities, with radial velocities from HARPS',
    kind: 'other',
    value: null,
    errorPlus: 0,
    errorMinus: 0,
    sigma: null,
    note: 'consistent with Newtonian dynamics; a limited sample',
    source: 'arXiv:2506.05049',
  },
  {
    name: 'Cookson and colleagues',
    year: 2026,
    binaries: null,
    quantity: 'velocity distribution of a high-purity sample within 130 pc',
    kind: 'other',
    value: null,
    errorPlus: 0,
    errorMinus: 0,
    sigma: null,
    note: 'no 20 percent enhancement; Newtonian gravity is up to 1500 times more likely than MOND for the cleanest sample',
    source: 'arXiv:2602.24035 (27 February 2026)',
  },
]

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// The speed of a circular orbit of two stars of total mass M (in solar masses) and separation s (in AU), in metres per second.
export function orbitalSpeed(totalMassSuns: number, separationAu: number): number {
  requirePositive(totalMassSuns, 'The total mass')
  requirePositive(separationAu, 'The separation')
  return Math.sqrt((G * totalMassSuns * SOLAR_MASS_KG) / (separationAu * AU_M))
}

// The pull between the stars, g = G M / s^2, in metres per second per second (the acceleration of one star towards the other).
export function pullOnPair(totalMassSuns: number, separationAu: number): number {
  requirePositive(totalMassSuns, 'The total mass')
  requirePositive(separationAu, 'The separation')
  return (G * totalMassSuns * SOLAR_MASS_KG) / Math.pow(separationAu * AU_M, 2)
}

// The pull in units of a0.
export function pullInA0(totalMassSuns: number, separationAu: number): number {
  return pullOnPair(totalMassSuns, separationAu) / A0
}

function requireGamma(gamma: number): void {
  if (!Number.isFinite(gamma) || gamma < 1) throw new RangeError('The boost factor must be at least 1')
}

// A pull gamma times Newton's gives a speed sqrt(gamma) times Newton's, because v^2 = G M / s is proportional to the pull.
export function speedBoost(gamma: number): number {
  requireGamma(gamma)
  return Math.sqrt(gamma)
}
export function speedBoostPercent(gamma: number): number {
  return (speedBoost(gamma) - 1) * 100
}

// Prediction 1: how much faster is the orbit for a given percent increase in speed? The edges are my choice (the specification's decision 9).
export type BoostRange = 'none' | 'about20' | 'about40' | 'about100'
export function boostRange(percent: number): BoostRange {
  if (!Number.isFinite(percent) || percent < 0) throw new RangeError('The percent must not be negative')
  if (percent < 5) return 'none'
  if (percent < 30) return 'about20'
  if (percent < 70) return 'about40'
  return 'about100'
}

function requireFraction(fraction: number): void {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) throw new RangeError('The fraction must be between 0 and 1')
}
function requireFactor(factor: number): void {
  if (!Number.isFinite(factor) || factor < 1) throw new RangeError('The factor must be at least 1')
}

// The toy contamination model: a fraction f of the pairs move k times faster (a hidden companion), the rest move as Newton says. The average
// speed relative to Newton's is (1 - f) + f k.
export function contaminatedRatio(fraction: number, factor: number): number {
  requireFraction(fraction)
  requireFactor(factor)
  return 1 - fraction + fraction * factor
}
export function fakeBoostPercent(fraction: number, factor: number): number {
  return (contaminatedRatio(fraction, factor) - 1) * 100
}
// The fraction of pairs that would fake a boost of `boostPercent` percent. It can be above 1, which means that no fraction could.
export function fractionToFake(boostPercent: number, factor: number): number {
  if (!Number.isFinite(boostPercent) || boostPercent < 0) throw new RangeError('The boost must not be negative')
  if (!Number.isFinite(factor) || factor <= 1) throw new RangeError('The factor must be above 1 to fake a boost')
  return boostPercent / 100 / (factor - 1)
}

// Prediction 2: how much does the average rise? The edges are my choice (the specification's decision 9).
export type ContaminationRange = 'about2' | 'about20' | 'about100'
export function contaminationRange(fraction: number, factor: number): ContaminationRange {
  const percent = fakeBoostPercent(fraction, factor)
  if (percent < 8) return 'about2'
  if (percent < 50) return 'about20'
  return 'about100'
}

// The dark matter inside a sphere whose radius is the separation, at the local density, in solar masses (one sentence in the introduction).
export function darkMatterInsideSolarMasses(separationAu: number): number {
  requirePositive(separationAu, 'The separation')
  const radiusPc = separationAu / PARSEC_IN_AU
  return LOCAL_DARK_MATTER_SOLAR_MASSES_PER_PC3 * (4 / 3) * Math.PI * Math.pow(radiusPc, 3)
}

// The numbers of the learner's own pair and contamination.
export interface WideBinariesResult {
  totalMassSuns: number
  separationAu: number
  gamma: number
  fraction: number
  factor: number
  newtonSpeed: number // m/s
  pull: number // m/s^2
  pullInA0: number
  boostedSpeed: number // m/s
  speedBoostPercent: number
  contaminatedRatio: number
  fakeBoostPercent: number
  fractionNeededToFake: number | null // null when the factor is 1, because no fraction could fake a boost
  darkMatterInsideSolarMasses: number
}

export function runWideBinaries(totalMassSuns: number, separationAu: number, gamma: number, fraction: number, factor: number): WideBinariesResult {
  const newton = orbitalSpeed(totalMassSuns, separationAu)
  const boost = speedBoost(gamma)
  const boostPercent = speedBoostPercent(gamma)
  return {
    totalMassSuns,
    separationAu,
    gamma,
    fraction,
    factor,
    newtonSpeed: newton,
    pull: pullOnPair(totalMassSuns, separationAu),
    pullInA0: pullInA0(totalMassSuns, separationAu),
    boostedSpeed: newton * boost,
    speedBoostPercent: boostPercent,
    contaminatedRatio: contaminatedRatio(fraction, factor),
    fakeBoostPercent: fakeBoostPercent(fraction, factor),
    fractionNeededToFake: factor > 1 ? fractionToFake(boostPercent, factor) : null,
    darkMatterInsideSolarMasses: darkMatterInsideSolarMasses(separationAu),
  }
}
