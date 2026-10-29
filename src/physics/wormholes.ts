// Evidence and Imagination, Experiment 1: Can a wormhole exist? The shape of the simplest open throat, the negative energy that would hold it open, the closing of the simplest wormhole (the
// Einstein-Rosen bridge of a black hole), the Casimir energy (the only negative energy known) and the searches made. Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// This is a TOY from the mathematics: no wormhole has ever been seen. Every formula is a standard result worked here by hand and by an independent numerical integral (checked in the tests);
// none was read at its source (the Morris and Thorne paper could not be read as text), so each is "to be checked" (the specification's Open items a to d).
// Not modelled: any real source of the matter, how a wormhole would form, rotation, charge, quantum effects beyond the Casimir comparison, tides on a traveller, and time travel.

// ---- Constants (SI) ----
export const G = 6.6743e-11 // m^3 kg^-1 s^-2
export const C = 299_792_458 // m/s
export const HBAR = 1.054571817e-34 // J s
export const SUN_MASS_KG = 1.98847e30
export const JUPITER_MASS_KG = 1.89813e27
export const EARTH_MASS_KG = 5.9722e24
export const MOON_MASS_KG = 7.342e22
// Rough illustrative masses for the ruler (Picture 3); "a car" and "a mountain" are round numbers, not measurements.
export const CAR_MASS_KG = 1.5e3
export const MOUNTAIN_MASS_KG = 1e15
// The radius of the observable universe, 4.4 x 10^26 m (about 46.5 billion light-years), for the rough comparison of Decision 7. From memory; to be sourced if the comparison is kept.
export const OBSERVABLE_UNIVERSE_RADIUS_M = 4.4e26

function checkPositive(x: number, what: string): void {
  if (!Number.isFinite(x) || x <= 0) throw new RangeError(`${what} must be above zero.`)
}

// ---- The published statements (through summaries; to be checked at the papers) ----
// Kuhfittig 2022, repeating Morris and Thorne: the radial tension at a throat is about 5 x 10^41 dyn/cm^2 times (10 m / r0)^2, and for r0 = 3 km it has the same size as the pressure at the
// centre of a massive neutron star. No pressure for the neutron star is held here (none was read).
export const PUBLISHED_TENSION_AT_10_M_DYN_CM2 = 5e41
export const PUBLISHED_NEUTRON_STAR_MATCH_RADIUS_M = 3000
// A secondary summary says the mass at a throat is -(radius c^2)/G, about -1 Jupiter mass for 1 metre. The total derived below differs from it by a factor of pi/2.
export function secondaryNegativeMassKg(throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  return (throatRadiusM * C * C) / G
}
// Lamoreaux 1997 measured the Casimir force to within 5 percent (a search summary).
export const CASIMIR_MEASURED_WITHIN_PERCENT = 5

// ---- The shape of the simplest open throat (Morris-Thorne, no tides) ----
// Shape function b(r) = b0^2 / r and no tidal force. The circumference radius at a distance l along the tunnel is r(l) = sqrt(l^2 + b0^2).
export function shapeFunction(r: number, throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  if (r < throatRadiusM) throw new RangeError('The circumference radius cannot be less than the throat radius.')
  return (throatRadiusM * throatRadiusM) / r
}
// db/dr = -b0^2 / r^2. At the throat it is -1, which is below 1: the flare-out condition.
export function shapeSlope(r: number, throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  return -(throatRadiusM * throatRadiusM) / (r * r)
}
export function flareOutSlope(throatRadiusM: number): number {
  return shapeSlope(throatRadiusM, throatRadiusM)
}
export function circumferenceRadius(l: number, throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  return Math.sqrt(l * l + throatRadiusM * throatRadiusM)
}
// The drawn "embedding" height of the shape: z(r) = b0 arccosh(r / b0), the height of a catenoid (the integral of dr / sqrt(r/b - 1)).
export function embeddingHeight(r: number, throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  if (r < throatRadiusM) throw new RangeError('The circumference radius cannot be less than the throat radius.')
  return throatRadiusM * Math.acosh(r / throatRadiusM)
}
export interface ProfilePoint {
  l: number
  r: number
  z: number
}
// Points along the tunnel for the drawing, from -lMax to +lMax (z has the sign of l, so the two mouths flare away from each other).
export function embeddingProfile(throatRadiusM: number, lMax: number, steps: number = 100): ProfilePoint[] {
  checkPositive(throatRadiusM, 'The throat radius')
  checkPositive(lMax, 'The length')
  const out: ProfilePoint[] = []
  for (let i = 0; i <= steps; i++) {
    const l = -lMax + (2 * lMax * i) / steps
    const r = circumferenceRadius(l, throatRadiusM)
    out.push({ l, r, z: Math.sign(l) * embeddingHeight(r, throatRadiusM) })
  }
  return out
}

// ---- The energy it needs ----
// Energy density rho c^2 = -c^4 b0^2 / (8 pi G r^4): negative everywhere (J/m^3).
export function energyDensity(r: number, throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  if (r < throatRadiusM) throw new RangeError('The circumference radius cannot be less than the throat radius.')
  return -((C ** 4) * throatRadiusM * throatRadiusM) / (8 * Math.PI * G * r ** 4)
}
// The radial tension at the throat, tau0 = c^4 / (8 pi G b0^2) (Pa).
export function throatTension(throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  return C ** 4 / (8 * Math.PI * G * throatRadiusM * throatRadiusM)
}
// 1 Pa = 10 dyn/cm^2.
export function tensionInDynPerCm2(throatRadiusM: number): number {
  return throatTension(throatRadiusM) * 10
}
// The total negative mass over both sides, found by integrating the density over the proper volume: -pi b0 c^2 / (2 G) (this function returns its size in kg).
export function totalNegativeMassKg(throatRadiusM: number): number {
  checkPositive(throatRadiusM, 'The throat radius')
  return (Math.PI * throatRadiusM * C * C) / (2 * G)
}
// The same total by a numerical integral (a check of the closed form): one side is the integral of 4 pi r^2 |rho| / sqrt(1 - b/r) dr from b0 to infinity, which becomes
// (b0 c^2 / 2G) times the integral of du / sqrt(1 - u^2) from 0 to 1 with u = b0 / r; the midpoint rule is used with the end singularity handled by u = sin(t).
export function totalNegativeMassNumericKg(throatRadiusM: number, steps: number = 200_000): number {
  checkPositive(throatRadiusM, 'The throat radius')
  let sum = 0
  for (let i = 0; i < steps; i++) {
    // The substitution u = sin t (r = b0 / sin t) turns the range r from b0 to infinity into t from pi/2 to 0 and removes the end singularity; the density and the proper volume are
    // still evaluated at each step, so this is a real integral of the density and not a restatement of the closed form.
    const t = ((i + 0.5) / steps) * (Math.PI / 2)
    const u = Math.sin(t)
    const r = throatRadiusM / u
    const dr = (throatRadiusM * Math.cos(t)) / (u * u) * (Math.PI / 2 / steps) // |dr| for a step dt
    const density = Math.abs(energyDensity(r, throatRadiusM)) / (C * C) // kg/m^3
    const properVolume = (4 * Math.PI * r * r) / Math.sqrt(1 - throatRadiusM / r * (throatRadiusM / r)) * dr
    sum += density * properVolume
  }
  return 2 * sum // both sides of the throat
}
export function negativeMassInUnits(massKg: number): { earths: number; jupiters: number; suns: number } {
  checkPositive(massKg, 'The mass')
  return { earths: massKg / EARTH_MASS_KG, jupiters: massKg / JUPITER_MASS_KG, suns: massKg / SUN_MASS_KG }
}
// The energy (J) of that negative mass, M c^2.
export function negativeEnergyNeededJ(throatRadiusM: number): number {
  return totalNegativeMassKg(throatRadiusM) * C * C
}

// ---- The closing of the simplest wormhole (the Einstein-Rosen bridge of a black hole) ----
// Kruskal coordinates (T, X), with the singularity at T^2 - X^2 = 1. The circumference radius r satisfies (x - 1) e^x = X^2 - T^2 with x = r / rs and rs = 2GM/c^2 (the horizon radius).
export function schwarzschildRadiusM(massKg: number): number {
  checkPositive(massKg, 'The mass')
  return (2 * G * massKg) / (C * C)
}
function kruskalFunction(x: number): number {
  return (x - 1) * Math.exp(x)
}
// Solve (x - 1) e^x = u for x = r / rs, for u > -1 (the function rises from -1 at x = 0, through 0 at x = 1).
export function arealRadiusFraction(u: number): number {
  if (!Number.isFinite(u) || u <= -1) {
    if (u === -1) return 0
    throw new RangeError('u must be above -1 (the singularity is at u = -1).')
  }
  let lo = 0
  let hi = 1
  while (kruskalFunction(hi) < u) hi *= 2
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (kruskalFunction(mid) < u) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
// The throat's circumference radius, as a fraction of the horizon radius, on the slice T: 1 at T = 0, falling to 0 at |T| = 1 (the pinch).
export function throatRadiusFraction(T: number): number {
  if (!Number.isFinite(T) || Math.abs(T) > 1) throw new RangeError('T must be between -1 and 1.')
  return arealRadiusFraction(-T * T)
}
export interface SlicePoint {
  X: number
  /** circumference radius as a fraction of the horizon radius */
  radiusFraction: number
  /** proper distance along the slice from the throat (X = 0), in horizon radii */
  distance: number
}
// The shape of the slice T of the bridge: the circumference radius against the proper distance along the slice (the silhouette of the tunnel). The proper length along the slice is
// d(ell) = 2 rs sqrt(e^-x / x) dX. Valid for |T| < 1 (at |T| = 1 the throat has pinched to nothing). The grid has an even number of steps so that it includes X = 0.
export function bridgeSlice(T: number, xMax: number = 3, steps: number = 600): SlicePoint[] {
  if (!Number.isFinite(T) || Math.abs(T) >= 1) throw new RangeError('The slice must have |T| below 1.')
  checkPositive(xMax, 'The range')
  const n = steps % 2 === 0 ? steps : steps + 1
  const dX = (2 * xMax) / n
  const xs: number[] = []
  const rs: number[] = []
  for (let i = 0; i <= n; i++) {
    const X = -xMax + i * dX
    xs.push(X)
    rs.push(arealRadiusFraction(X * X - T * T))
  }
  const integrand = (x: number) => 2 * Math.sqrt(Math.exp(-x) / x)
  const mid = n / 2
  const dist = new Array<number>(n + 1).fill(0)
  for (let i = mid + 1; i <= n; i++) dist[i] = dist[i - 1] + (dX * (integrand(rs[i - 1]) + integrand(rs[i]))) / 2
  for (let i = mid - 1; i >= 0; i--) dist[i] = dist[i + 1] - (dX * (integrand(rs[i + 1]) + integrand(rs[i]))) / 2
  return xs.map((X, i) => ({ X, radiusFraction: rs[i], distance: dist[i] }))
}
export interface RayPoint {
  T: number
  X: number
}
export interface RayTrace {
  points: RayPoint[]
  /** the T at which the ray meets the singularity */
  endsAtT: number
  /** did the ray ever enter the right-hand exterior (X > |T|)? */
  reachesRightExterior: boolean
}
// A light ray moving to the right at 45 degrees in the (T, X) picture from a point in the left-hand exterior (X < -|T|): X = startX + (T - startT). It is followed until it meets the
// singularity T^2 - X^2 = 1, and checked at every step for entering the right-hand exterior.
export function traceRightMovingRay(startT: number, startX: number, steps: number = 2000): RayTrace {
  if (!(startX < -Math.abs(startT))) throw new RangeError('The ray must start in the left-hand exterior (X below -|T|).')
  const k = startX - startT
  // Meets the singularity where T^2 - (T + k)^2 = 1, i.e. T = (1 + k^2) / (2 |k|) (k is negative).
  const endsAtT = (1 + k * k) / (2 * Math.abs(k))
  const points: RayPoint[] = []
  let reaches = false
  for (let i = 0; i <= steps; i++) {
    const T = startT + ((endsAtT - startT) * i) / steps
    const X = T + k
    points.push({ T, X })
    if (X > Math.abs(T) + 1e-12) reaches = true
  }
  return { points, endsAtT, reachesRightExterior: reaches }
}

// ---- The negative energy we know: the Casimir effect ----
// The energy per unit area of two ideal plates a distance d apart is -pi^2 hbar c / (720 d^3) (J/m^2); this returns its size.
export function casimirEnergyPerAreaJPerM2(gapM: number): number {
  checkPositive(gapM, 'The gap')
  return (Math.PI ** 2 * HBAR * C) / (720 * gapM ** 3)
}
export function casimirEnergyDensityJPerM3(gapM: number): number {
  checkPositive(gapM, 'The gap')
  return (Math.PI ** 2 * HBAR * C) / (720 * gapM ** 4)
}
// How many times too small a pair of plates of the given area is, for a throat of the given radius.
export function casimirShortfall(throatRadiusM: number, gapM: number, plateAreaM2: number = 1): number {
  checkPositive(plateAreaM2, 'The area')
  return negativeEnergyNeededJ(throatRadiusM) / (casimirEnergyPerAreaJPerM2(gapM) * plateAreaM2)
}
// The plate area (m^2) whose Casimir energy would equal the energy needed, and its size beside the surface of the sphere that bounds the observable universe (a rough illustration only).
export function casimirAreaNeededM2(throatRadiusM: number, gapM: number): number {
  return negativeEnergyNeededJ(throatRadiusM) / casimirEnergyPerAreaJPerM2(gapM)
}
export function fractionOfObservableUniverseSurface(areaM2: number): number {
  checkPositive(areaM2, 'The area')
  return areaM2 / (4 * Math.PI * OBSERVABLE_UNIVERSE_RADIUS_M ** 2)
}

// ---- What has been searched for (data, from the abstracts; to be checked at the papers) ----
export interface EchoSearch {
  id: string
  authors: string
  arxiv: string
  events: string[]
  /** the abstract's own words for the finding, quoted or closely paraphrased */
  finding: string
  /** a Bayes factor for the echo hypothesis, if one is given */
  bayesFactor: number | null
}
export const ECHO_SEARCHES: readonly EchoSearch[] = [
  {
    id: 'wu',
    authors: 'Wu, Zhang, Huang and Ren',
    arxiv: 'arXiv:2512.24730',
    events: ['GW150914', 'GW231226', 'GW250114'],
    finding: 'no statistically significant evidence for post-merger echoes; upper limits set',
    bayesFactor: null,
  },
  {
    id: 'lai',
    authors: 'Lai, Lan, Wang and Piao',
    arxiv: 'arXiv:2602.01615',
    events: ['GW231123'],
    finding: 'a Bayes factor of 1.87 for echoes that does not give robust evidence; the analyses support the black-hole interpretation',
    bayesFactor: 1.87,
  },
]

// ---- The predictions ----
export function nearestOnLogScale<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  checkPositive(value, 'The value')
  let best = choices[0]
  let bestGap = Infinity
  for (const c of choices) {
    const gap = Math.abs(Math.log10(valueOf(c)) - Math.log10(value))
    if (gap < bestGap) {
      bestGap = gap
      best = c
    }
  }
  return best
}

// Prediction 1: could a ray of light sent in at one mouth of the simplest wormhole come out of the other? A yes or no has no size, so a marker is drawn.
export const CROSS_CHOICES = [
  { id: 'yes', label: 'Yes, it could come out of the other mouth', crosses: true },
  { id: 'no', label: 'No, it could not', crosses: false },
] as const
export type CrossChoiceId = (typeof CROSS_CHOICES)[number]['id']
// The answer is found by following rays: none of the sample rays from the left-hand exterior ever enters the right-hand exterior.
export function lightCanCross(): boolean {
  for (const [T, X] of [
    [0, -1],
    [0, -3],
    [-2, -4],
    [1, -2],
    [0.5, -5],
  ] as const) {
    if (traceRightMovingRay(T, X).reachesRightExterior) return true
  }
  return false
}
export function crossAnswer(): CrossChoiceId {
  return lightCanCross() ? 'yes' : 'no'
}
// The tutor's mark (CLAUDE.md §12, §13): used in the explanation only.
export function crossGuessResult(id: CrossChoiceId): 'matched' | 'not matched' {
  return id === crossAnswer() ? 'matched' : 'not matched'
}
export function crossGuessMarker(id: CrossChoiceId): { crosses: boolean } {
  return { crosses: CROSS_CHOICES.find((c) => c.id === id)!.crosses }
}

// Prediction 2: the negative mass that a tunnel 1 metre in radius would need, in kg, on a log scale.
export const PREDICTION_THROAT_RADIUS_M = 1
export const MASS_CHOICES = [
  { id: 'm3', label: 'about a thousand kilograms (a car)', kg: 1e3 },
  { id: 'm15', label: 'about a million billion kilograms (a mountain)', kg: 1e15 },
  { id: 'm23', label: 'about the mass of the Moon', kg: 1e23 },
  { id: 'm25', label: 'about the mass of the Earth', kg: 1e25 },
  { id: 'm27', label: 'about the mass of Jupiter', kg: 1e27 },
] as const
export type MassChoiceId = (typeof MASS_CHOICES)[number]['id']
export function massAnswer(): MassChoiceId {
  return nearestOnLogScale(MASS_CHOICES, totalNegativeMassKg(PREDICTION_THROAT_RADIUS_M), (c) => c.kg).id
}
export function massChoiceKg(id: MassChoiceId): number {
  return MASS_CHOICES.find((c) => c.id === id)!.kg
}
export function massGuessResult(id: MassChoiceId): 'matched' | 'not matched' {
  return id === massAnswer() ? 'matched' : 'not matched'
}
export function massGuessMarker(id: MassChoiceId): { kg: number } {
  return { kg: massChoiceKg(id) }
}

// ---- The ruler of masses (Picture 3) ----
export const MASS_LANDMARKS = [
  { id: 'car', label: 'a car', kg: CAR_MASS_KG },
  { id: 'mountain', label: 'a mountain', kg: MOUNTAIN_MASS_KG },
  { id: 'moon', label: 'the Moon', kg: MOON_MASS_KG },
  { id: 'earth', label: 'the Earth', kg: EARTH_MASS_KG },
  { id: 'jupiter', label: 'Jupiter', kg: JUPITER_MASS_KG },
  { id: 'sun', label: 'the Sun', kg: SUN_MASS_KG },
] as const
export const MASS_RULER = { minKg: 1e2, maxKg: 1e32, ticks: [1e3, 1e9, 1e15, 1e21, 1e27] } as const
// The position along the ruler, 0 to 1, on a log scale.
export function massRulerPosition(kg: number): number {
  checkPositive(kg, 'The mass')
  const a = Math.log10(MASS_RULER.minKg)
  const b = Math.log10(MASS_RULER.maxKg)
  return (Math.log10(kg) - a) / (b - a)
}

// ---- Trial values (the controls) ----
export const TRIAL_THROAT_RADII_M = [1e-3, 1, 1e3, 3e3, 1e4] as const
export const TRIAL_PLATE_GAPS_M = [1e-7, 1e-6, 1e-5] as const
export const TRIAL_DEFAULT_THROAT_RADIUS_M = 1
export const TRIAL_DEFAULT_PLATE_GAP_M = 1e-6
export interface TrialPicture {
  throatRadiusM: number
  plateGapM: number
  negativeMassKg: number
  inUnits: { earths: number; jupiters: number; suns: number }
  tensionPa: number
  tensionDynPerCm2: number
  neededJ: number
  casimirJPerM2: number
  shortfall: number
  plateAreaM2: number
  fractionOfUniverseSurface: number
  /** the published statement: a 3 km throat has a tension the size of a massive neutron star's centre */
  isPublishedNeutronStarMatch: boolean
}
export function trialPicture(throatRadiusM: number, plateGapM: number): TrialPicture {
  const mass = totalNegativeMassKg(throatRadiusM)
  return {
    throatRadiusM,
    plateGapM,
    negativeMassKg: mass,
    inUnits: negativeMassInUnits(mass),
    tensionPa: throatTension(throatRadiusM),
    tensionDynPerCm2: tensionInDynPerCm2(throatRadiusM),
    neededJ: negativeEnergyNeededJ(throatRadiusM),
    casimirJPerM2: casimirEnergyPerAreaJPerM2(plateGapM),
    shortfall: casimirShortfall(throatRadiusM, plateGapM),
    plateAreaM2: casimirAreaNeededM2(throatRadiusM, plateGapM),
    fractionOfUniverseSurface: fractionOfObservableUniverseSurface(casimirAreaNeededM2(throatRadiusM, plateGapM)),
    isPublishedNeutronStarMatch: throatRadiusM === PUBLISHED_NEUTRON_STAR_MATCH_RADIUS_M,
  }
}
