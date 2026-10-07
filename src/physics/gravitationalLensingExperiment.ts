// This experiment deliberately reuses earlier experiments' constants unchanged (imported, not
// redefined): the speed of light (Experiment 1), the megaparsec-to-kilometer conversion
// (Experiment 2), and the gravitational constant and kiloparsec-to-kilometer conversion
// (Experiment 4). It does not reuse Gravity and Curved Spacetime Experiment 8's code, which works in
// abstract units; it reuses that experiment's idea (the real bending angle is 4GM / (c^2 b)) in real
// units. See the specification's "Physics Model" and "Required Physics Tests".
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'
import { MPC_TO_KM } from './bigBangExperiment'
import { GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS, KM_PER_KPC } from './darkMatterExperiment'

// Given, rounded distances (Mpc) for one real situation (about the cluster Abell 1689: lens at
// redshift 0.18, source at redshift 2, flat universe, H0 = 70, matter share 30%). Not recomputed here.
export const LENS_DISTANCE_MPC = 630
export const SOURCE_DISTANCE_MPC = 1730
export const LENS_TO_SOURCE_DISTANCE_MPC = 1480

// Given, rounded real-world reference values, used only for comparison, not derived here.
export const OBSERVED_RING_ARCSECONDS = 47
export const VISIBLE_MASS_FRACTION = 0.15
export const OBSERVED_TOTAL_MASS_SOLAR_MASSES = 2.0e14

export const MIN_LENS_MASS_SOLAR_MASSES = 1e13
export const MAX_LENS_MASS_SOLAR_MASSES = 4e14

// Standard unit conversion: one radian in arcseconds.
const ARCSECONDS_PER_RADIAN = 206264.80624709636

const CURVE_POINTS = 31

// GM/c^2 in kilometers for a mass in solar masses (about 1.477 km per solar mass), derived from the
// reused constants: G (in kpc km^2/s^2 per solar mass) x km per kpc gives km^3/s^2 per solar mass.
export function gravitationalLengthKm(massSolarMasses: number): number {
  return (
    (GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS * massSolarMasses * KM_PER_KPC) /
    REAL_SPEED_OF_LIGHT_KM_PER_S ** 2
  )
}

// Angular radius of the Einstein ring, in arcseconds, for a round lens with the source exactly behind
// its center: theta = sqrt((4 G M / c^2) x D_ls / (D_l x D_s)). A standard textbook result. For a round
// lens, M is the mass inside the ring.
export function einsteinRingArcseconds(massSolarMasses: number): number {
  const fourGmOverC2Mpc = (4 * gravitationalLengthKm(massSolarMasses)) / MPC_TO_KM
  const thetaRadians = Math.sqrt(
    (fourGmOverC2Mpc * LENS_TO_SOURCE_DISTANCE_MPC) / (LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC),
  )
  return thetaRadians * ARCSECONDS_PER_RADIAN
}

// The real bending angle in arcseconds for light passing a mass at a given closest distance (km):
// 4GM / (c^2 b). Twice the ordinary-gravity value, as Experiment 8 showed.
export function bendingAngleArcseconds(massSolarMasses: number, closestApproachKm: number): number {
  return ((4 * gravitationalLengthKm(massSolarMasses)) / closestApproachKm) * ARCSECONDS_PER_RADIAN
}

// The mass (solar masses) inside a ring of a given angular radius: the ring formula run backward.
export function massInsideRingSolarMasses(ringArcseconds: number): number {
  const thetaRadians = ringArcseconds / ARCSECONDS_PER_RADIAN
  const fourGmOverC2Km =
    (thetaRadians ** 2 * LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC * MPC_TO_KM) / LENS_TO_SOURCE_DISTANCE_MPC
  return fourGmOverC2Km / (4 * gravitationalLengthKm(1))
}

export interface GravitationalLensingResult {
  massSolarMasses: number
  ringArcseconds: number
  // The closest the light passes to the cluster's center, b = theta x D_l.
  ringRadiusKm: number
  // The real bending angle at the ring's edge.
  bendingAngleArcseconds: number
  visibleOnlyMassSolarMasses: number
  visibleOnlyRingArcseconds: number
  observedRingArcseconds: number
  observedMassSolarMasses: number
  ringOverVisibleOnlyRing: number
  curve: Array<{ massSolarMasses: number; ringArcseconds: number }>
}

export function runGravitationalLensingExperiment(massSolarMasses: number): GravitationalLensingResult {
  const ringArcseconds = einsteinRingArcseconds(massSolarMasses)
  const ringRadiusKm = (ringArcseconds / ARCSECONDS_PER_RADIAN) * LENS_DISTANCE_MPC * MPC_TO_KM
  const visibleOnlyMassSolarMasses = VISIBLE_MASS_FRACTION * OBSERVED_TOTAL_MASS_SOLAR_MASSES
  const visibleOnlyRingArcseconds = einsteinRingArcseconds(visibleOnlyMassSolarMasses)
  const massRatio = MAX_LENS_MASS_SOLAR_MASSES / MIN_LENS_MASS_SOLAR_MASSES
  return {
    massSolarMasses,
    ringArcseconds,
    ringRadiusKm,
    bendingAngleArcseconds: bendingAngleArcseconds(massSolarMasses, ringRadiusKm),
    visibleOnlyMassSolarMasses,
    visibleOnlyRingArcseconds,
    observedRingArcseconds: OBSERVED_RING_ARCSECONDS,
    observedMassSolarMasses: massInsideRingSolarMasses(OBSERVED_RING_ARCSECONDS),
    ringOverVisibleOnlyRing: ringArcseconds / visibleOnlyRingArcseconds,
    // Log-spaced masses, since the allowed range spans a factor of 40.
    curve: Array.from({ length: CURVE_POINTS }, (_, i) => {
      const mass = MIN_LENS_MASS_SOLAR_MASSES * massRatio ** (i / (CURVE_POINTS - 1))
      return { massSolarMasses: mass, ringArcseconds: einsteinRingArcseconds(mass) }
    }),
  }
}
