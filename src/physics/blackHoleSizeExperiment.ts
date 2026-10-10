import { GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS, KM_PER_KPC } from './darkMatterExperiment'
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// For the three objects that are already black holes there is no real radius to squeeze from, so the
// squeeze starts from a hypothetical ball this many horizon radii wide (labeled "hypothetical" on screen).
export const HYPOTHETICAL_START_IN_HORIZON_RADII = 100
// The end of the squeeze slider, in horizon radii.
export const MIN_RADIUS_IN_HORIZON_RADII = 0.1

const CURVE_POINTS = 101

export interface ObjectPreset {
  id: 'earth' | 'sun' | 'neutron-star' | 'stellar-black-hole' | 'sgr-a-star' | 'm87-star'
  label: string
  massSolarMasses: number
  realRadiusKm: number | null // null for the three black holes
}

// Rounded, real, given values (see the specification's table and its note on sources). The stellar black
// hole's 10 solar masses is an illustrative round value; the neutron star's 12 km is a round value inside
// the observed range.
export const OBJECT_PRESETS: ObjectPreset[] = [
  { id: 'earth', label: 'Earth', massSolarMasses: 3.0e-6, realRadiusKm: 6371 },
  { id: 'sun', label: 'The Sun', massSolarMasses: 1, realRadiusKm: 695_700 },
  { id: 'neutron-star', label: 'A neutron star', massSolarMasses: 1.4, realRadiusKm: 12 },
  { id: 'stellar-black-hole', label: 'A stellar black hole', massSolarMasses: 10, realRadiusKm: null },
  { id: 'sgr-a-star', label: 'Sagittarius A*', massSolarMasses: 4.3e6, realRadiusKm: null },
  { id: 'm87-star', label: 'M87*', massSolarMasses: 6.5e9, realRadiusKm: null },
]

// G x M / c^2 comes out in kiloparsecs when G is in kpc (km/s)^2 per solar mass, M in solar masses and
// c in km/s; multiplying by KM_PER_KPC converts it to kilometers.
function gmOverCSquaredKm(massSolarMasses: number): number {
  return (
    ((GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS * massSolarMasses) / REAL_SPEED_OF_LIGHT_KM_PER_S ** 2) *
    KM_PER_KPC
  )
}

// The horizon radius, r_s = 2GM/c^2, in kilometers. Given by general relativity for a non-rotating,
// uncharged object; used here, not derived.
export function horizonRadiusKm(massSolarMasses: number): number {
  return 2 * gmOverCSquaredKm(massSolarMasses)
}

// radius / horizon radius.
export function radiusInHorizonRadii(radiusKm: number, massSolarMasses: number): number {
  return radiusKm / horizonRadiusKm(massSolarMasses)
}

// True if the radius is at or below the horizon radius.
export function isBlackHole(radiusKm: number, massSolarMasses: number): boolean {
  return radiusKm <= horizonRadiusKm(massSolarMasses)
}

// The speed that ordinary gravity (Gravity Experiments 6 and 7's escape-speed idea, written in real units)
// would need to escape from a ball of this radius, as a fraction of the speed of light:
// sqrt(2GM/r) / c = sqrt(r_s / r). Exactly 1 at the horizon radius. Above 1 does not mean anything travels
// faster than light; it means nothing can escape.
export function ordinaryGravityEscapeSpeedFractionOfLight(radiusKm: number, massSolarMasses: number): number {
  return Math.sqrt(horizonRadiusKm(massSolarMasses) / radiusKm)
}

export interface BlackHoleSizeResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startRadiusKm: number // the real radius, or 100 horizon radii if there is none
  startIsHypothetical: boolean
  squeezeNeeded: number | null // real radius / horizon radius; null if the object has no real radius
  chosenRadiusKm: number
  chosenInHorizonRadii: number
  becomesBlackHole: boolean
  escapeSpeedFractionOfLight: number // by the ordinary-gravity formula, at the chosen radius
  curve: Array<{ progress: number; radiusKm: number }> // evenly spaced in log(radius), start to chosen
}

export function runBlackHoleSizeExperiment(
  presetId: ObjectPreset['id'],
  chosenRadiusKm: number,
): BlackHoleSizeResult {
  const preset = OBJECT_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown object: ${presetId}`)
  if (!(chosenRadiusKm > 0)) throw new Error('The chosen radius must be greater than zero.')

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  const startIsHypothetical = preset.realRadiusKm === null
  const startRadiusKm = preset.realRadiusKm ?? horizon * HYPOTHETICAL_START_IN_HORIZON_RADII

  const logStart = Math.log(startRadiusKm)
  const logEnd = Math.log(chosenRadiusKm)
  const curve = Array.from({ length: CURVE_POINTS }, (_, i) => {
    const progress = i / (CURVE_POINTS - 1)
    // Pin the ends exactly so the curve starts and ends at the stated radii.
    const radiusKm =
      i === 0 ? startRadiusKm : i === CURVE_POINTS - 1 ? chosenRadiusKm : Math.exp(logStart + (logEnd - logStart) * progress)
    return { progress, radiusKm }
  })

  return {
    preset,
    horizonRadiusKm: horizon,
    startRadiusKm,
    startIsHypothetical,
    squeezeNeeded: preset.realRadiusKm === null ? null : preset.realRadiusKm / horizon,
    chosenRadiusKm,
    chosenInHorizonRadii: chosenRadiusKm / horizon,
    becomesBlackHole: isBlackHole(chosenRadiusKm, preset.massSolarMasses),
    escapeSpeedFractionOfLight: ordinaryGravityEscapeSpeedFractionOfLight(chosenRadiusKm, preset.massSolarMasses),
    curve,
  }
}
