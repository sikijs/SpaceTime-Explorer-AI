// Frontier and Beyond, Experiment 4: can the universe weigh a neutrino? (DESI's limit on the neutrino mass).
// See docs/experiments/frontier-and-beyond/04-can-the-universe-weigh-a-neutrino.md, "Physics Model".
//
// No new physics beyond standard textbook relations: the neutrino temperature (4/11)^(1/3) T, the typical energy 3.151 k T, the
// density Omega_nu h^2 = (sum of masses) / 93.14 eV, and the small-clump smoothing 8 f_nu. The microwave-background temperature, its
// release redshift, the age function and the Planck-like matter fraction are reused from earlier experiments. This model does NOT
// reproduce DESI's limit: that comes from a full fit that also uses the expansion history and the lensing of the microwave background.
import { CMB_TEMPERATURE_TODAY_KELVIN, RECOMBINATION_REDSHIFT, RECOMBINATION_YEARS_AFTER_BIG_BANG } from './cosmicMicrowaveBackgroundExperiment'
import { MEASUREMENTS as HUBBLE_MEASUREMENTS } from './hubbleTension'
import { PLANCK_OWN } from './lumpiness'
import { timeAfterBigBangYears } from './observableUniverseExperiment'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import { PLANCK_LIKE_DARK_ENERGY_FRACTION } from './universeAgeExperiment'

export type Ordering = 'normal' | 'inverted'

// The oscillation experiments' mass-squared gaps (NuFIT 6.0, arXiv:2410.05380), in eV squared. The numbers were taken from a search
// result, not read at the paper's table (the specification's source table): re-check before the wording is approved.
export const MASS_SQUARED_GAPS = {
  solar: 7.49e-5, // delta m^2_21
  atmosphericNormal: 2.513e-3, // delta m^2_31, normal ordering
  atmosphericInverted: 2.484e-3, // |delta m^2_31|, inverted ordering (the gap is negative there)
}

export interface NeutrinoBound {
  name: string
  kind: 'floor' | 'ceiling' | 'direct'
  value: number // eV, for the sum of the three masses (KATRIN: one neutrino kind, see the specification)
  confidence: string
  year: number
  drawn: boolean // drawn in Picture 3 (Decision 8); the others are in the table and the tutor only
  source: string
}

// The floors, computed from the gaps (the specification's rules).
export function oscillationFloor(ordering: Ordering): number {
  if (ordering === 'normal') {
    return Math.sqrt(MASS_SQUARED_GAPS.solar) + Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal)
  }
  if (ordering === 'inverted') {
    const heavy = MASS_SQUARED_GAPS.atmosphericInverted
    return Math.sqrt(heavy) + Math.sqrt(heavy + MASS_SQUARED_GAPS.solar)
  }
  throw new RangeError('The ordering must be normal or inverted')
}

// Published values, checked against the abstracts and the DESI paper's HTML page on 2026-10-19 (the specification's "Real-World Facts
// Used, and Source Status"). The floors are computed from the gaps above.
export const BOUNDS: NeutrinoBound[] = [
  { name: 'Oscillations, normal ordering', kind: 'floor', value: oscillationFloor('normal'), confidence: 'at least', year: 2024, drawn: true, source: 'NuFIT 6.0, Esteban et al., arXiv:2410.05380 (computed from its gaps)' },
  { name: 'Oscillations, inverted ordering', kind: 'floor', value: oscillationFloor('inverted'), confidence: 'at least', year: 2024, drawn: true, source: 'NuFIT 6.0, Esteban et al., arXiv:2410.05380 (computed from its gaps)' },
  { name: 'KATRIN (one neutrino kind)', kind: 'direct', value: 0.45, confidence: '90 percent', year: 2025, drawn: false, source: 'Aker et al., arXiv:2406.13516' },
  { name: 'Planck 2018 + BAO', kind: 'ceiling', value: 0.12, confidence: '95 percent', year: 2018, drawn: true, source: 'Planck Collaboration, arXiv:1807.06209' },
  { name: 'DESI + CMB with Planck PR4', kind: 'ceiling', value: 0.1, confidence: '95 percent', year: 2024, drawn: false, source: 'Allali and Notari, arXiv:2406.14554' },
  { name: 'DESI DR2 + CMB (March 2025)', kind: 'ceiling', value: 0.0642, confidence: '95 percent', year: 2025, drawn: true, source: 'Elbers et al., arXiv:2503.14744' },
  { name: 'DESI DR2 + CMB, evolving dark energy', kind: 'ceiling', value: 0.163, confidence: '95 percent', year: 2025, drawn: true, source: 'Elbers et al., arXiv:2503.14744' },
  { name: 'DESI DR2 + CMB, no Lyman-alpha full shape (July 2026)', kind: 'ceiling', value: 0.0565, confidence: '95 percent', year: 2026, drawn: false, source: 'DESI Collaboration, arXiv:2607.27410, section VI.4.2' },
  { name: 'DESI DR2 + CMB (July 2026)', kind: 'ceiling', value: 0.0592, confidence: '95 percent', year: 2026, drawn: true, source: 'DESI Collaboration, arXiv:2607.27410, section VI.4.2' },
]

export const CEILINGS: NeutrinoBound[] = BOUNDS.filter((b) => b.kind === 'ceiling')
export const DESI_JULY_2026: NeutrinoBound = BOUNDS.find((b) => b.name === 'DESI DR2 + CMB (July 2026)')!

// Constants (standard values; see the specification's source table for what has and has not been checked).
export const BOLTZMANN_EV_PER_KELVIN = 8.617333262e-5
export const MEAN_ENERGY_IN_KT = 3.151 // average energy of a Fermi-Dirac neutrino, in units of k T
export const EV_FOR_ONE_OMEGA_H_SQUARED = 93.14
export const HUBBLE_PARAMETER_H = HUBBLE_MEASUREMENTS.find((m) => m.side === 'early')!.value / 100 // Planck 2018: 0.674
export const OMEGA_MATTER = PLANCK_OWN.omegaMatter // 0.315
export const SMOOTHING_FACTOR = 8 // small clumps are smoothed by about 8 x the neutrinos' share of the matter
export const MAX_TOTAL_MASS_EV = 0.5 // above this the 8 f_nu estimate begins to fail
export const ROOM_VERY_LITTLE_RATIO = 1.2 // Decision 6: "very little room" is a ceiling at most 20 percent above the floor
export const EQUAL_SPLIT = 3
export const PREDICTION_TOTAL_MASS_EV = 0.06 // the total the two predictions use (Prediction 1 states it)

function requirePositive(value: number, what: string): void {
  if (!(value > 0)) throw new RangeError(`${what} must be greater than zero`)
}

// T_nu = (4/11)^(1/3) T_photon.
export function neutrinoTemperatureKelvin(photonTemperatureKelvin: number): number {
  requirePositive(photonTemperatureKelvin, 'The temperature')
  return Math.cbrt(4 / 11) * photonTemperatureKelvin
}

// The typical energy of a neutrino at a temperature, 3.151 k T, in eV.
export function typicalEnergyEv(temperatureKelvin: number): number {
  requirePositive(temperatureKelvin, 'The temperature')
  return MEAN_ENERGY_IN_KT * BOLTZMANN_EV_PER_KELVIN * temperatureKelvin
}

export const NEUTRINO_TEMPERATURE_TODAY_KELVIN = neutrinoTemperatureKelvin(CMB_TEMPERATURE_TODAY_KELVIN)
export const TYPICAL_ENERGY_TODAY_EV = typicalEnergyEv(NEUTRINO_TEMPERATURE_TODAY_KELVIN)

// The redshift at which a neutrino of this mass turns from light-like to matter-like: typical energy = mass (a rule of thumb).
export function heavyRedshift(massEachEv: number): number {
  requirePositive(massEachEv, 'The mass')
  return massEachEv / TYPICAL_ENERGY_TODAY_EV - 1
}

// Years after the Big Bang when that happens, from Cosmology Experiment 6's age function. A redshift at or below 0 is "now".
export function heavyTimeYears(massEachEv: number): number {
  const z = heavyRedshift(massEachEv)
  if (z <= 0) throw new RangeError('This neutrino is not yet light-like today: its mass is above the typical energy')
  // timeAfterBigBangYears uses the project's Hubble constant (70); times scale exactly as 1 / H0, so rescale to Planck's 67.4 (the same
  // value that gives h in the matter share), the way universeAgeYears does.
  const projectToPlanck = HUBBLE_CONSTANT_KM_PER_S_PER_MPC / (HUBBLE_PARAMETER_H * 100)
  return timeAfterBigBangYears(1 / (1 + z), PLANCK_LIKE_DARK_ENERGY_FRACTION) * projectToPlanck
}

// The neutrinos' share of the universe's whole energy: Omega_nu = (sum of masses / 93.14 eV) / h^2.
export function energyDensityShare(totalMassEv: number): number {
  requirePositive(totalMassEv, 'The total mass')
  return totalMassEv / EV_FOR_ONE_OMEGA_H_SQUARED / (HUBBLE_PARAMETER_H * HUBBLE_PARAMETER_H)
}

// The neutrinos' share of the matter: f_nu = Omega_nu / Omega_m.
export function matterShare(totalMassEv: number): number {
  return energyDensityShare(totalMassEv) / OMEGA_MATTER
}

// How much the smallest clumps are smoothed: 8 f_nu (a fraction; 0.0355 is 3.55 percent), for a small share only.
export function clumpSmoothing(totalMassEv: number): number {
  if (!(totalMassEv <= MAX_TOTAL_MASS_EV)) {
    throw new RangeError(`The 8 f_nu estimate is only used up to a total of ${MAX_TOTAL_MASS_EV} eV`)
  }
  return SMOOTHING_FACTOR * matterShare(totalMassEv)
}

export interface Room {
  ratio: number // ceiling / floor
  difference: number // ceiling - floor, negative when the ceiling is below the floor
}

export function roomUnder(ceiling: number, ordering: Ordering): Room {
  requirePositive(ceiling, 'The ceiling')
  const floor = oscillationFloor(ordering)
  return { ratio: ceiling / floor, difference: ceiling - floor }
}

export type RoomRange = 'plenty' | 'veryLittle' | 'none'

// The answer to Prediction 2. 'none' below the floor, 'veryLittle' up to 20 percent above it, otherwise 'plenty'.
export function roomRange(ceiling: number, ordering: Ordering): RoomRange {
  const { ratio } = roomUnder(ceiling, ordering)
  if (ratio < 1) return 'none'
  if (ratio <= ROOM_VERY_LITTLE_RATIO) return 'veryLittle'
  return 'plenty'
}

export type HeavyTiming = 'before' | 'after'

// The answer to Prediction 1: do three equal neutrinos turn heavy before or after the microwave background's release?
export function heavyBeforeRelease(totalMassEv: number): HeavyTiming {
  requirePositive(totalMassEv, 'The total mass')
  return heavyRedshift(totalMassEv / EQUAL_SPLIT) > RECOMBINATION_REDSHIFT ? 'before' : 'after'
}

export interface CeilingRoom {
  bound: NeutrinoBound
  normal: Room & { range: RoomRange }
  inverted: Room & { range: RoomRange }
}

export interface NeutrinoMassResult {
  totalMassEv: number
  massEachEv: number
  neutrinoTemperatureKelvin: number
  typicalEnergyTodayEv: number
  heavyRedshift: number // three equal masses
  heavyTimeYears: number
  heavyRedshiftOneNeutrino: number // the whole total in one neutrino: the answer does not depend on the split
  releaseRedshift: number
  releaseYears: number
  timesLaterThanRelease: number // heavyTimeYears / releaseYears
  heavyTiming: HeavyTiming
  share: number
  smoothing: number
  floors: { normal: number; inverted: number }
  rooms: CeilingRoom[] // one per ceiling, in the order of BOUNDS
}

export function runNeutrinoMass(totalMassEv: number): NeutrinoMassResult {
  requirePositive(totalMassEv, 'The total mass')
  const massEachEv = totalMassEv / EQUAL_SPLIT
  const z = heavyRedshift(massEachEv)
  const years = heavyTimeYears(massEachEv)
  return {
    totalMassEv,
    massEachEv,
    neutrinoTemperatureKelvin: NEUTRINO_TEMPERATURE_TODAY_KELVIN,
    typicalEnergyTodayEv: TYPICAL_ENERGY_TODAY_EV,
    heavyRedshift: z,
    heavyTimeYears: years,
    heavyRedshiftOneNeutrino: heavyRedshift(totalMassEv),
    releaseRedshift: RECOMBINATION_REDSHIFT,
    releaseYears: RECOMBINATION_YEARS_AFTER_BIG_BANG,
    timesLaterThanRelease: years / RECOMBINATION_YEARS_AFTER_BIG_BANG,
    heavyTiming: heavyBeforeRelease(totalMassEv),
    share: matterShare(totalMassEv),
    smoothing: clumpSmoothing(totalMassEv),
    floors: { normal: oscillationFloor('normal'), inverted: oscillationFloor('inverted') },
    rooms: CEILINGS.map((bound) => ({
      bound,
      normal: { ...roomUnder(bound.value, 'normal'), range: roomRange(bound.value, 'normal') },
      inverted: { ...roomUnder(bound.value, 'inverted'), range: roomRange(bound.value, 'inverted') },
    })),
  }
}
