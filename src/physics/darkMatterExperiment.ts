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

// ---------------------------------------------------------------------------------------------
// Audit update (2026-11-14): numbers for the guess marks, the tutor's marking, the amount verdict,
// the check-up and the worked examples, so the interface only displays what is computed here.
// Nothing above this line was changed.
// ---------------------------------------------------------------------------------------------

// The page's own rule for "matches": within 5 percent of the measured reference at every distance.
// A rule of this page (used since the first version), not a published cut-off.
export const MATCH_TOLERANCE = 0.05

// Distances of the three marker stars (the specification's "Display" section) and the fixed span of
// simulated time played back in the animation. Playback speed never changes the result.
export const MARKER_STAR_RADII_KPC = [8, 16, 30]
export const SIMULATED_SPAN_YEARS = 1e9

// Published values the check-up sets beside the page's reference speed (abstracts read 2026-11-14).
export const PUBLISHED_SUN_SPEED_EILERS_KM_PER_S = 229.0 // Eilers and others 2018, arXiv:1810.09466
export const PUBLISHED_SUN_SPEED_REID_KM_PER_S = 240 // Reid and others 2014, arXiv:1401.5377
// NASA Starchild (written 2000): "about 230 million years" for the Sun's lap of the Milky Way.
export const PUBLISHED_SUN_LAP_YEARS = 230e6

export type SpeedGuess = 'faster' | 'slower' | 'same'
export type MeasuredGuess = 'match' | 'faster' | 'slower'

// The size of the white guess line (guess 1) in km/s over the graph's range. Illustrative: it gives
// the guess a visible direction and carries no physical meaning.
export const GUESS_LINE_STEP_KM_PER_S = 60

function visibleOnlySpeedAt(radiusKpc: number): number {
  return circularSpeedKmPerS(radiusKpc, visibleEnclosedMass(radiusKpc))
}

export interface GuessLine {
  startRadiusKpc: number
  startSpeedKmPerS: number
  endRadiusKpc: number
  endSpeedKmPerS: number
}

// Guess 1: a direction only. The line starts on the visible-only line at the near end of the graph
// and rises, stays level or falls by a fixed step.
export function guessLineEndpoints(guess: SpeedGuess): GuessLine {
  const start = visibleOnlySpeedAt(MIN_RADIUS_KPC)
  const step = guess === 'faster' ? GUESS_LINE_STEP_KM_PER_S : guess === 'slower' ? -GUESS_LINE_STEP_KM_PER_S : 0
  return {
    startRadiusKpc: MIN_RADIUS_KPC,
    startSpeedKmPerS: start,
    endRadiusKpc: MAX_RADIUS_KPC,
    endSpeedKmPerS: start + step,
  }
}

export interface GuessMarker {
  radiusKpc: number
  // The visible-only speed at that distance, where the marker is anchored.
  anchorSpeedKmPerS: number
  // The measured reference speed, which the marker points toward, past or stops short of.
  measuredSpeedKmPerS: number
  kind: 'equals' | 'up' | 'down'
}

// Guess 2: a marker only (three answers carry no size), at the far end of the graph.
export function guessMarker(guess: MeasuredGuess): GuessMarker {
  return {
    radiusKpc: MAX_RADIUS_KPC,
    anchorSpeedKmPerS: visibleOnlySpeedAt(MAX_RADIUS_KPC),
    measuredSpeedKmPerS: OBSERVED_SPEED_KM_PER_S,
    kind: guess === 'match' ? 'equals' : guess === 'faster' ? 'up' : 'down',
  }
}

// What the visible-only model actually gives for guess 1: a far star against a near star, using the
// page's own 5 percent rule for "about the same".
export function actualSpeedComparison(): SpeedGuess {
  const near = visibleOnlySpeedAt(MIN_RADIUS_KPC)
  const far = visibleOnlySpeedAt(MAX_RADIUS_KPC)
  if (Math.abs(far - near) / near <= MATCH_TOLERANCE) return 'same'
  return far > near ? 'faster' : 'slower'
}

// What the page's measured reference gives for guess 2: the measured speed against the
// visible-only line far from the centre.
export function actualMeasuredComparison(): MeasuredGuess {
  const visibleFar = visibleOnlySpeedAt(MAX_RADIUS_KPC)
  if (Math.abs(OBSERVED_SPEED_KM_PER_S - visibleFar) / visibleFar <= MATCH_TOLERANCE) return 'match'
  return OBSERVED_SPEED_KM_PER_S > visibleFar ? 'faster' : 'slower'
}

// The tutor marks each guess (the Results does not).
export function speedGuessMatches(guess: SpeedGuess): boolean {
  return guess === actualSpeedComparison()
}
export function measuredGuessMatches(guess: MeasuredGuess): boolean {
  return guess === actualMeasuredComparison()
}

// Whether an amount reproduces the measured reference within MATCH_TOLERANCE at every distance
// (moved out of the component).
export type AmountVerdict = 'match' | 'too-little' | 'too-much'
export function amountVerdict(amount: number): AmountVerdict {
  const curve = runDarkMatterExperiment(amount).curve
  const worst = Math.max(
    ...curve.map((p) => Math.abs(p.withDarkMatterSpeedKmPerS - OBSERVED_SPEED_KM_PER_S) / OBSERVED_SPEED_KM_PER_S),
  )
  if (worst <= MATCH_TOLERANCE) return 'match'
  return curve.some((p) => p.withDarkMatterSpeedKmPerS < OBSERVED_SPEED_KM_PER_S * (1 - MATCH_TOLERANCE))
    ? 'too-little'
    : 'too-much'
}

// The lowest and highest amounts (to 0.01) that count as a match.
export function matchingAmountBand(): { low: number; high: number } {
  let low = Infinity
  let high = -Infinity
  for (let i = 0; i <= Math.round(MAX_DARK_MATTER_AMOUNT * 100); i++) {
    const amount = i / 100
    if (amountVerdict(amount) === 'match') {
      low = Math.min(low, amount)
      high = Math.max(high, amount)
    }
  }
  return { low, high }
}

// (value - reference) / reference, in percent.
export function percentDifference(value: number, reference: number): number {
  return ((value - reference) / reference) * 100
}

// A plain reading of a difference: "less", "more" or "the same". `withinPercent` is 0 where no accepted
// range exists (only exact equality reads "the same").
export type Reading = 'less' | 'more' | 'the same'
export function readingFor(differencePercent: number, withinPercent = 0): Reading {
  if (Math.abs(differencePercent) <= withinPercent) return 'the same'
  return differencePercent < 0 ? 'less' : 'more'
}

export function lapsInSimulatedSpan(radiusKpc: number, speedKmPerS: number): number {
  return SIMULATED_SPAN_YEARS / orbitalPeriodYears(radiusKpc, speedKmPerS)
}

// Share of the mass inside an orbit that is dark matter (calculated here, no published range read).
export function darkMatterShare(radiusKpc: number, amount: number): number {
  const halo = haloEnclosedMass(radiusKpc, amount)
  return halo / (visibleEnclosedMass(radiusKpc) + halo)
}

export interface CheckUpRow {
  id: 'a' | 'b' | 'c' | 'd' | 'e'
  thisPage: number
  beside: number
  differencePercent: number
  reading: Reading
}

// The check-up table. All rows are independent of the learner's Part 2 amount.
export function checkUp(): CheckUpRow[] {
  const sunRadius = MARKER_STAR_RADII_KPC[0]
  const matching = rotationCurve(1, [MIN_RADIUS_KPC, ...Array.from({ length: MAX_RADIUS_KPC - MIN_RADIUS_KPC }, (_, i) => MIN_RADIUS_KPC + 1 + i)])
  const matchingWorst = matching.reduce(
    (worst, p) => {
      const d = percentDifference(p.withDarkMatterSpeedKmPerS, OBSERVED_SPEED_KM_PER_S)
      return Math.abs(d) > Math.abs(worst) ? d : worst
    },
    0,
  )
  const row = (id: CheckUpRow['id'], thisPage: number, beside: number, within = 0): CheckUpRow => {
    const differencePercent = percentDifference(thisPage, beside)
    return { id, thisPage, beside, differencePercent, reading: readingFor(differencePercent, within) }
  }
  const matchingSpeedAtSun = rotationCurve(1, [sunRadius])[0].withDarkMatterSpeedKmPerS
  return [
    row('a', visibleOnlySpeedAt(sunRadius), OBSERVED_SPEED_KM_PER_S),
    row('b', visibleOnlySpeedAt(MAX_RADIUS_KPC), OBSERVED_SPEED_KM_PER_S),
    // Row c is reported for the worst distance; "the same" uses the page's own 5 percent rule.
    {
      id: 'c',
      thisPage: matchingSpeedAtSun,
      beside: OBSERVED_SPEED_KM_PER_S,
      differencePercent: matchingWorst,
      reading: readingFor(matchingWorst, MATCH_TOLERANCE * 100),
    },
    row('d', orbitalPeriodYears(sunRadius, matchingSpeedAtSun), PUBLISHED_SUN_LAP_YEARS),
    row('e', OBSERVED_SPEED_KM_PER_S, PUBLISHED_SUN_SPEED_EILERS_KM_PER_S),
  ]
}

// ---------------------------------------------------------------------------------------------
// Numbers for the introduction's "What happens" (owner-approved wording, 2026-11-14): the Doppler
// shift of a spectral line, a siren for comparison, the mass inside an orbit from a speed, and the
// "four times the mass, twice the speed" rule. All are plain arithmetic on the page's own formulas.
// ---------------------------------------------------------------------------------------------

export const SPEED_OF_LIGHT_KM_PER_S = 299792.458
// The laboratory wavelength of the red glow of hydrogen (a well-known value; no source was read for it).
export const HYDROGEN_RED_LINE_NM = 656.3
// The speed of sound in air, about 340 m/s (general knowledge, not sourced), used only for the siren comparison.
export const SPEED_OF_SOUND_M_PER_S = 340

// A speed as a fraction of the speed of light.
export function fractionOfLightSpeed(speedKmPerS: number): number {
  return speedKmPerS / SPEED_OF_LIGHT_KM_PER_S
}

// The change in wavelength of a line moving at `speedKmPerS`: wavelength x speed / c (small speeds).
export function dopplerShiftNanometres(speedKmPerS: number, wavelengthNm = HYDROGEN_RED_LINE_NM): number {
  return wavelengthNm * fractionOfLightSpeed(speedKmPerS)
}

// How much a siren's pitch changes, in percent, for a source moving at `sourceM_PerS` (small speeds).
export function sirenShiftPercent(sourceMetresPerSecond: number): number {
  return (sourceMetresPerSecond / SPEED_OF_SOUND_M_PER_S) * 100
}

// The mass inside an orbit from a speed: M = v^2 x r / G (the page's formula turned around).
export function enclosedMassFromSpeed(speedKmPerS: number, radiusKpc: number): number {
  return (speedKmPerS * speedKmPerS * radiusKpc) / GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS
}

// If the mass inside becomes `massRatio` times as large, the speed needed becomes this many times as large.
export function speedRatioForMassRatio(massRatio: number): number {
  return Math.sqrt(massRatio)
}
