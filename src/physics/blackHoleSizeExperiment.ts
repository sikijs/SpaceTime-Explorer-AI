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

// ---------------------------------------------------------------------------------------------------
// Audit update (Black Holes 1): numbers for the white guess marks, the fixed Part 1 run, the check-up
// and the "Meet the six objects" strip. Nothing above this line changes.
// ---------------------------------------------------------------------------------------------------

export const KM_PER_AU = 149_597_870.7

// The guesses. Each button's answer as a number, so the interface draws the white mark from the module.
export type SunRadiusGuess = 'about-6000-km' | 'about-30-km' | 'about-3-km'
export type MassScalingGuess = 'ten' | 'thousand' | 'million'

export const SUN_RADIUS_GUESS_KM: Record<SunRadiusGuess, number> = {
  'about-6000-km': 6000,
  'about-30-km': 30,
  'about-3-km': 3,
}

// How many times wider the horizon of 1,000 Suns would be than the horizon of one Sun, as guessed.
export const MASS_SCALING_GUESS_RATIO: Record<MassScalingGuess, number> = {
  ten: 10,
  thousand: 1000,
  million: 1_000_000,
}

// Picture 1b's fixed pair: one Sun against this many Suns (no preset pair differs by exactly 1,000).
export const COMPARISON_MASS_RATIO = 1000

export interface MassComparison {
  smallMassSolarMasses: number
  largeMassSolarMasses: number
  smallHorizonKm: number
  largeHorizonKm: number
  realRatio: number // large horizon / small horizon
}

export function compareHorizonsOfSunAndThousandSuns(): MassComparison {
  const small = 1
  const large = COMPARISON_MASS_RATIO
  const smallHorizonKm = horizonRadiusKm(small)
  const largeHorizonKm = horizonRadiusKm(large)
  return {
    smallMassSolarMasses: small,
    largeMassSolarMasses: large,
    smallHorizonKm,
    largeHorizonKm,
    realRatio: largeHorizonKm / smallHorizonKm,
  }
}

// The guessed horizon width for 1,000 Suns, in km, given a guess about the ratio (what the white bar shows).
export function guessedLargeHorizonKm(guess: MassScalingGuess): number {
  return horizonRadiusKm(1) * MASS_SCALING_GUESS_RATIO[guess]
}

// Part 1 always runs the real Sun, squeezed from its real radius down to exactly its horizon radius.
export function runPartOneSqueeze(): BlackHoleSizeResult {
  return runBlackHoleSizeExperiment('sun', horizonRadiusKm(1))
}

// A guess's radius as a multiple of the Sun's real horizon radius (where the white mark sits on the ruler).
export function guessInHorizonRadii(guess: SunRadiusGuess): number {
  return SUN_RADIUS_GUESS_KM[guess] / horizonRadiusKm(1)
}

// The page's marking of each guess, for the tutor only. A guess is "the model's answer" if it equals the real
// value to the precision the choice is written in (3 km for 2.95 km: the choice says "about").
export function sunRadiusGuessIsModelAnswer(guess: SunRadiusGuess): boolean {
  return Math.round(horizonRadiusKm(1)) === SUN_RADIUS_GUESS_KM[guess]
}

export function massScalingGuessIsModelAnswer(guess: MassScalingGuess): boolean {
  return MASS_SCALING_GUESS_RATIO[guess] === Math.round(compareHorizonsOfSunAndThousandSuns().realRatio)
}

// "Meet the six objects" strip: every number comes from here.
export interface ObjectCard {
  id: ObjectPreset['id']
  label: string
  massSolarMasses: number
  realRadiusKm: number | null
  horizonRadiusKm: number
  horizonRadiusAu: number
  horizonOverRealRadius: number | null // for objects with a real size; null for the three black holes
  alreadyBlackHole: boolean
}

export function objectCards(): ObjectCard[] {
  return OBJECT_PRESETS.map((p) => {
    const horizon = horizonRadiusKm(p.massSolarMasses)
    return {
      id: p.id,
      label: p.label,
      massSolarMasses: p.massSolarMasses,
      realRadiusKm: p.realRadiusKm,
      horizonRadiusKm: horizon,
      horizonRadiusAu: horizon / KM_PER_AU,
      horizonOverRealRadius: p.realRadiusKm === null ? null : horizon / p.realRadiusKm,
      alreadyBlackHole: p.realRadiusKm === null,
    }
  })
}

// ---- The check-up (Table 1): published values the page's numbers are compared with --------------------
// Each value was read on 2026-11-16 on the page named beside it; see 01-draft-wording.md.
export const PUBLISHED = {
  // NASA Chandra, "Stellar Black Holes" (revised 9 Oct 2026): "30 kilometers" for 10 Suns; "about 3 kilometers"
  // per solar mass.
  kmPerSolarMass: 3,
  tenSunsHorizonKm: 30,
  // NASA Sun and Earth Fact Sheets: volumetric mean radius.
  sunRadiusKm: 695_700,
  earthRadiusKm: 6371,
  // NASA NICER: PSR J0437-4715 equatorial radius 11.36 km (2024); PSR J0740+6620 about 24.8 km across (one
  // team) and 27.4 km across (the other team) in 2021, so radii of about 12.4 and 13.7 km. The range runs from
  // the smallest to the largest of these.
  neutronStarRadiusKmLow: 11.36,
  neutronStarRadiusKmHigh: 13.7,
  // NASA Earth and Sun Fact Sheets: escape velocity (km/s), at Earth's surface and at the Sun's surface.
  earthEscapeSpeedKmPerS: 11.186,
  sunEscapeSpeedKmPerS: 617.6,
  // ESO eso2208 (12 May 2022): "four million times more massive than our Sun". A rounded figure.
  sgrAStarMassSolarMasses: 4.0e6,
} as const

export type CheckUpReading = 'the same' | 'the same, to the rounding' | 'inside the published range' | 'a different value'

// Rounds `found` to the number of decimal places the published value is written with.
function roundedToPublishedPlaces(found: number, published: number): number {
  const text = String(published)
  const decimals = text.includes('.') ? text.split('.')[1].length : 0
  return Number(found.toFixed(decimals))
}

export function readAgainstPublished(found: number, published: number): CheckUpReading {
  if (found === published) return 'the same'
  if (roundedToPublishedPlaces(found, published) === published) return 'the same, to the rounding'
  return 'a different value'
}

export function readAgainstRange(found: number, low: number, high: number): CheckUpReading {
  return found >= low && found <= high ? 'inside the published range' : 'a different value'
}

export interface CheckUpRow {
  what: string
  expected: string
  found: number
  reading: CheckUpReading | string
}

// How much more (positive) or less (negative) the used value is than a published rounder one, as a percent.
export function percentDifference(used: number, published: number): number {
  return ((used - published) / published) * 100
}

export function checkUpRows(): CheckUpRow[] {
  const sun = OBJECT_PRESETS.find((p) => p.id === 'sun')!
  const earth = OBJECT_PRESETS.find((p) => p.id === 'earth')!
  const ns = OBJECT_PRESETS.find((p) => p.id === 'neutron-star')!
  const sgr = OBJECT_PRESETS.find((p) => p.id === 'sgr-a-star')!
  const atHorizonEscape = ordinaryGravityEscapeSpeedFractionOfLight(horizonRadiusKm(1), 1)
  const tenSuns = horizonRadiusKm(10)
  return [
    {
      what: 'Escape speed at the horizon, by ordinary gravity (Gravity 7), as a fraction of the speed of light',
      expected: '1',
      found: atHorizonEscape,
      reading: readAgainstPublished(Number(atHorizonEscape.toFixed(6)), 1),
    },
    {
      what: 'Horizon radius of 1 Sun (km)',
      expected: String(PUBLISHED.kmPerSolarMass),
      found: horizonRadiusKm(1),
      reading: readAgainstPublished(horizonRadiusKm(1), PUBLISHED.kmPerSolarMass),
    },
    {
      what: 'Horizon radius of 10 Suns (km)',
      expected: String(PUBLISHED.tenSunsHorizonKm),
      found: tenSuns,
      reading: readAgainstPublished(tenSuns, PUBLISHED.tenSunsHorizonKm),
    },
    {
      what: 'Neutron-star radius used (km)',
      expected: `${PUBLISHED.neutronStarRadiusKmLow} to ${PUBLISHED.neutronStarRadiusKmHigh}`,
      found: ns.realRadiusKm as number,
      reading: readAgainstRange(
        ns.realRadiusKm as number,
        PUBLISHED.neutronStarRadiusKmLow,
        PUBLISHED.neutronStarRadiusKmHigh,
      ),
    },
    {
      what: "The Sun's radius used (km)",
      expected: String(PUBLISHED.sunRadiusKm),
      found: sun.realRadiusKm as number,
      reading: readAgainstPublished(sun.realRadiusKm as number, PUBLISHED.sunRadiusKm),
    },
    {
      what: "The Earth's radius used (km)",
      expected: String(PUBLISHED.earthRadiusKm),
      found: earth.realRadiusKm as number,
      reading: readAgainstPublished(earth.realRadiusKm as number, PUBLISHED.earthRadiusKm),
    },
    {
      what: "Sagittarius A*'s mass used (Suns)",
      expected: String(PUBLISHED.sgrAStarMassSolarMasses),
      found: sgr.massSolarMasses,
      reading: `${percentDifference(sgr.massSolarMasses, PUBLISHED.sgrAStarMassSolarMasses).toFixed(1)}% more than ESO's rounder figure`,
    },
  ]
}

// The tutor's check with the real Sun (audit update). The Sun's escape speed today (NASA's Sun Fact Sheet) times the square root of the squeeze
// factor, because ordinary-gravity escape speed is sqrt(2GM / r) and so grows as 1 / sqrt(r). It should come out at about the speed of light,
// which is why the horizon radius is where escaping needs that speed.
export interface SunEscapeSpeedCheck {
  sunEscapeSpeedKmPerS: number
  squeezeFactor: number
  speedGrowthFactor: number
  escapeSpeedAtHorizonKmPerS: number
  speedOfLightKmPerS: number
  ratioToSpeedOfLight: number
}

export function sunEscapeSpeedCheck(): SunEscapeSpeedCheck {
  const squeezeFactor = (OBJECT_PRESETS.find((p) => p.id === 'sun')!.realRadiusKm as number) / horizonRadiusKm(1)
  const speedGrowthFactor = Math.sqrt(squeezeFactor)
  const escapeSpeedAtHorizonKmPerS = PUBLISHED.sunEscapeSpeedKmPerS * speedGrowthFactor
  return {
    sunEscapeSpeedKmPerS: PUBLISHED.sunEscapeSpeedKmPerS,
    squeezeFactor,
    speedGrowthFactor,
    escapeSpeedAtHorizonKmPerS,
    speedOfLightKmPerS: REAL_SPEED_OF_LIGHT_KM_PER_S,
    ratioToSpeedOfLight: escapeSpeedAtHorizonKmPerS / REAL_SPEED_OF_LIGHT_KM_PER_S,
  }
}
