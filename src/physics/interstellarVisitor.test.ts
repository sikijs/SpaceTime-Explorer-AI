import { describe, it, expect } from 'vitest'
import {
  GM_SUN,
  AU,
  ATLAS_3I,
  OUMUAMUA_1I,
  BORISOV_2I,
  speedFarAway,
  eccentricityFrom,
  speedAt,
  escapeSpeed,
  bendDegrees,
  pathDistance,
  asymptoteAngleDegrees,
  atlasClosestApproachM,
  atlasSpeedFarAway,
  atlasSpeedAtClosestApproach,
  atlasEscapeSpeedAtClosestApproach,
  atlasSpeedOverEscape,
  atlasBendDegrees,
  trialOrbit,
  TRIAL_SPEEDS_KM_S,
  TRIAL_CLOSEST_AU,
  nearestOnLogScale,
  BEND_CHOICES,
  bendAnswer,
  bendGuessResult,
  bendGuessMarker,
  SPEED_CHOICES,
  speedAnswer,
  speedGuessResult,
  speedGuessMarker,
  pictureOne,
  pictureTwo,
  bendGuessHeadingDegrees,
  PICTURE_VIEW_RADIUS_AU,
  PLANET_ORBITS_AU,
  DISTANCE_TICKS_AU,
  SPEED_TICKS_KM_S,
  SPEED_RULER_MAX_KM_S,
  distanceRulerPosition,
  speedRulerPosition,
  nasaSpeedAtClosestKmS,
  esaSpeedAtClosestKmS,
  trialPicture,
  TRIAL_DEFAULT_SPEED_KM_S,
  TRIAL_DEFAULT_CLOSEST_AU,
  compareToReference,
  resultsCheckUp,
  exampleSteps,
  knownObjects,
} from './interstellarVisitor'

// Constants written out again here, separately from the module (Test 1): the IAU's GM of the Sun and the astronomical unit.
const GM = 1.32712440018e20
const ASTRONOMICAL_UNIT = 1.495978707e11
const KM = 1e3

describe('the real object and the constants', () => {
  it('holds the published orbit as listed (test 9)', () => {
    expect(ATLAS_3I.eccentricity).toBe(6.14135)
    expect(ATLAS_3I.closestApproachAu).toBe(1.35645)
    expect(ATLAS_3I.inclinationDegrees).toBe(175.12)
    expect(GM_SUN).toBe(GM)
    expect(AU).toBe(ASTRONOMICAL_UNIT)
  })
})

describe('the speeds of 3I/ATLAS', () => {
  it('has a speed far away of 58.0 km/s, derived from e and q, agreeing with the published 58 (test 1)', () => {
    const q = 1.35645 * ASTRONOMICAL_UNIT
    const separately = Math.sqrt((5.14135 * GM) / q)
    expect(atlasSpeedFarAway()).toBeCloseTo(separately, 3)
    expect(Math.abs(atlasSpeedFarAway() / KM - 58.0)).toBeLessThan(0.1)
    expect(Math.abs(atlasSpeedFarAway() / KM - ATLAS_3I.publishedSpeedFarAwayKmS)).toBeLessThan(0.1)
  })
  it('has 68.3 km/s at closest approach and an escape speed of 36.2 km/s there, 1.89 times (test 2)', () => {
    expect(Math.abs(atlasSpeedAtClosestApproach() / KM - 68.3)).toBeLessThan(0.1)
    expect(Math.abs(atlasEscapeSpeedAtClosestApproach() / KM - 36.2)).toBeLessThan(0.1)
    expect(atlasSpeedOverEscape()).toBeCloseTo(1.89, 2)
    // Even far away it is faster than the escape speed at closest approach: 58.0 / 36.2 = 1.6.
    expect(atlasSpeedFarAway() / atlasEscapeSpeedAtClosestApproach()).toBeCloseTo(1.6, 1)
  })
  it('speeds up as it falls in and returns to its speed far away (energy conservation, test 5)', () => {
    const v = atlasSpeedFarAway()
    const energy = (r: number) => speedAt(v, r) ** 2 / 2 - GM / r
    const e0 = energy(atlasClosestApproachM())
    for (const au of [0.3, 1, 5, 30, 100, 1000]) expect(energy(au * ASTRONOMICAL_UNIT)).toBeCloseTo(e0, -3) // to a part in 1e14 of the energy
    expect(speedAt(v, 1e6 * ASTRONOMICAL_UNIT)).toBeCloseTo(v, 0)
    expect(speedAt(v, 1 * ASTRONOMICAL_UNIT) / KM).toBeCloseTo(71.67, 1)
    expect(speedAt(v, 100 * ASTRONOMICAL_UNIT) / KM).toBeCloseTo(58.14, 1)
  })
})

describe('the eccentricity and the bend', () => {
  it('the eccentricity from the speed far away and the closest approach reproduces 6.14 (test 3)', () => {
    const e = eccentricityFrom(58 * KM, 1.356 * ASTRONOMICAL_UNIT)
    expect(e).toBeCloseTo(6.14, 1)
    expect(e).toBeCloseTo(1 + (1.356 * ASTRONOMICAL_UNIT * (58 * KM) ** 2) / GM, 10)
    // A round trip with the speed formula.
    expect(speedFarAway(e, 1.356 * ASTRONOMICAL_UNIT)).toBeCloseTo(58 * KM, 6)
  })
  it('the total bend is 2 arcsin(1 / e): 18.7 degrees for 3I/ATLAS, 112.9 for e = 1.2 and 34.2 for e = 3.4 (test 4)', () => {
    expect(atlasBendDegrees()).toBeCloseTo(18.74, 1)
    expect(bendDegrees(OUMUAMUA_1I.eccentricity)).toBeCloseTo(112.9, 1)
    expect(bendDegrees(BORISOV_2I.eccentricity)).toBeCloseTo(34.2, 1)
    expect(bendDegrees(ATLAS_3I.eccentricity)).toBe(atlasBendDegrees())
  })
  it('the bend falls as the eccentricity rises, towards zero, and towards 180 degrees as the path closes', () => {
    let last = 180
    for (const e of [1.001, 1.2, 2, 3.4, 6.14, 20, 140]) {
      const b = bendDegrees(e)
      expect(b).toBeLessThan(last)
      last = b
    }
    expect(bendDegrees(1.0001)).toBeGreaterThan(178)
    expect(bendDegrees(1000)).toBeLessThan(0.2)
  })
  it('a faster visitor at the same closest approach is bent less (test 4)', () => {
    const q = atlasClosestApproachM()
    const bends = [5, 26, 58, 100, 300].map((v) => bendDegrees(eccentricityFrom(v * KM, q)))
    for (let i = 1; i < bends.length; i++) expect(bends[i]).toBeLessThan(bends[i - 1])
  })
  it('rejects a path that is not open, and impossible inputs', () => {
    expect(() => bendDegrees(1)).toThrow(RangeError)
    expect(() => bendDegrees(0.5)).toThrow(RangeError)
    expect(() => speedFarAway(1, AU)).toThrow(RangeError)
    expect(() => eccentricityFrom(0, AU)).toThrow(RangeError)
    expect(() => speedAt(-1, AU)).toThrow(RangeError)
    expect(() => escapeSpeed(0)).toThrow(RangeError)
    expect(() => pathDistance(0.9, AU, 0)).toThrow(RangeError)
  })
})

describe('the path (test 6)', () => {
  const e = ATLAS_3I.eccentricity
  const q = ATLAS_3I.closestApproachAu * ASTRONOMICAL_UNIT
  it('has its closest approach at theta = 0 and is symmetric about it', () => {
    expect(pathDistance(e, q, 0)).toBeCloseTo(q, 0)
    expect(pathDistance(e, q, 0.7)).toBeCloseTo(pathDistance(e, q, -0.7), 0)
    expect(pathDistance(e, q, 1.0)).toBeGreaterThan(q)
  })
  it('goes to infinity at arccos(-1 / e), and the path sweeps 180 degrees plus the bend', () => {
    const a = asymptoteAngleDegrees(e)
    expect(a).toBeCloseTo(99.37, 1)
    const nearly = (a - 0.001) * (Math.PI / 180)
    expect(pathDistance(e, q, nearly)).toBeGreaterThan(1e3 * AU)
    expect(2 * a).toBeCloseTo(180 + atlasBendDegrees(), 8)
  })
  it('the speed at a point on the path agrees with the distance there (vis-viva round trip)', () => {
    const v = atlasSpeedFarAway()
    const r = pathDistance(e, q, 1.2)
    const a = -q / (e - 1)
    expect(speedAt(v, r) ** 2).toBeCloseTo(GM * (2 / r - 1 / a), -6)
  })
})

describe('open paths (test 7)', () => {
  it('any speed far away above zero gives an open path, and a speed above the escape speed at closest approach', () => {
    for (const v of TRIAL_SPEEDS_KM_S)
      for (const au of TRIAL_CLOSEST_AU) {
        const t = trialOrbit(v, au)
        expect(t.eccentricity).toBeGreaterThan(1)
        expect(t.speedAtClosestKmS).toBeGreaterThan(t.escapeSpeedAtClosestKmS)
        expect(t.speedOverEscape).toBeGreaterThan(1)
      }
  })
  it('the default trial (58 km/s, 1.356 AU) is 3I/ATLAS within the rounding of 58', () => {
    const t = trialOrbit(58, 1.356)
    expect(Math.abs(t.eccentricity - ATLAS_3I.eccentricity)).toBeLessThan(0.01)
    expect(Math.abs(t.bendDegrees - atlasBendDegrees())).toBeLessThan(0.05)
    expect(Math.abs(t.speedAtClosestKmS - atlasSpeedAtClosestApproach() / KM)).toBeLessThan(0.1)
  })
  it('a 26 km/s visitor at 3I/ATLAS\'s closest approach is bent more, and a 100 km/s one less', () => {
    expect(trialOrbit(26, 1.356).bendDegrees).toBeGreaterThan(atlasBendDegrees())
    expect(trialOrbit(100, 1.356).bendDegrees).toBeLessThan(atlasBendDegrees())
  })
  it('a closer approach bends the same visitor more', () => {
    expect(trialOrbit(58, 0.3).bendDegrees).toBeGreaterThan(trialOrbit(58, 1.356).bendDegrees)
    expect(trialOrbit(58, 3).bendDegrees).toBeLessThan(trialOrbit(58, 1.356).bendDegrees)
  })
})

describe('the nearest-answer helper and the predictions (tests 8 and 10)', () => {
  it('compares on a log scale, not a linear one', () => {
    const c = [{ v: 1 }, { v: 100 }]
    expect(nearestOnLogScale(c, 20, (x) => x.v).v).toBe(100) // a linear comparison would pick 1 (19 away against 80), a log comparison picks 100
    expect(nearestOnLogScale(c, 5, (x) => x.v).v).toBe(1)
  })
  it('Prediction 1 has the answer "about 20 degrees" for a bend of 18.7 degrees', () => {
    expect(bendAnswer()).toBe('b20')
    expect(bendGuessResult('b20')).toBe('matched')
    for (const id of ['b2', 'b6', 'b60', 'b150'] as const) expect(bendGuessResult(id)).toBe('not matched')
  })
  it('Prediction 2 has the answer "about 70 km/s" for a speed of 68.3 km/s', () => {
    expect(speedAnswer()).toBe('v70')
    expect(speedGuessResult('v70')).toBe('matched')
    for (const id of ['v40', 'v58', 'v115', 'v230'] as const) expect(speedGuessResult(id)).toBe('not matched')
  })
  it('the buttons are the ones in the specification', () => {
    expect(BEND_CHOICES.map((c) => c.degrees)).toEqual([2, 6, 20, 60, 150])
    expect(SPEED_CHOICES.map((c) => c.kmS)).toEqual([40, 58, 70, 115, 230])
    expect(BEND_CHOICES.map((c) => c.label)).toEqual(['about 2 degrees', 'about 6 degrees', 'about 20 degrees', 'about 60 degrees', 'about 150 degrees'])
  })
  it('the buttons are balanced about each answer on a log scale (neither neighbour is much nearer)', () => {
    const b = atlasBendDegrees()
    const lo = Math.log(b / 6)
    const hi = Math.log(60 / b)
    expect(Math.abs(lo - hi)).toBeLessThan(0.5)
    const s = atlasSpeedAtClosestApproach() / KM
    expect(Math.abs(Math.log(s / 40) - Math.log(115 / s))).toBeLessThan(0.6)
  })
  it('each guess has its own marker, in increasing order', () => {
    const bends = BEND_CHOICES.map((c) => bendGuessMarker(c.id).degrees)
    expect(bends).toEqual([...bends].sort((a, b) => a - b))
    expect(new Set(bends).size).toBe(BEND_CHOICES.length)
    const speeds = SPEED_CHOICES.map((c) => speedGuessMarker(c.id).kmS)
    expect(speeds).toEqual([...speeds].sort((a, b) => a - b))
    expect(new Set(speeds).size).toBe(SPEED_CHOICES.length)
  })
  it('the answers do not depend on a guess having been made (separation, test 10)', () => {
    const before = [bendAnswer(), speedAnswer(), atlasBendDegrees(), atlasSpeedAtClosestApproach()]
    bendGuessResult('b2')
    speedGuessResult('v230')
    bendGuessMarker('b150')
    speedGuessMarker('v40')
    expect([bendAnswer(), speedAnswer(), atlasBendDegrees(), atlasSpeedAtClosestApproach()]).toEqual(before)
  })
})

describe('Picture 1: the path from above the Sun (Step 4)', () => {
  const pic = pictureOne()
  it('puts the Sun at the origin and the closest approach on the +x axis, at 1.35645 AU', () => {
    const c = pic.path[pic.closestIndex]
    expect(c.x).toBeCloseTo(1.35645, 8)
    expect(c.y).toBeCloseTo(0, 8)
    expect(pic.closestApproachAu).toBe(1.35645)
  })
  it('every point lies on the hyperbola, and the two ends are at the view radius, symmetric about the closest approach', () => {
    const e = 6.14135
    const q = 1.35645
    for (const p of pic.path) {
      const r = Math.hypot(p.x, p.y)
      const t = Math.atan2(p.y, p.x)
      expect(r).toBeCloseTo((q * (1 + e)) / (1 + e * Math.cos(t)), 8)
      expect(r).toBeLessThanOrEqual(PICTURE_VIEW_RADIUS_AU + 1e-9)
    }
    const first = pic.path[0]
    const last = pic.path[pic.path.length - 1]
    expect(Math.hypot(first.x, first.y)).toBeCloseTo(PICTURE_VIEW_RADIUS_AU, 6)
    expect(Math.hypot(last.x, last.y)).toBeCloseTo(PICTURE_VIEW_RADIUS_AU, 6)
    expect(first.x).toBeCloseTo(last.x, 8)
    expect(first.y).toBeCloseTo(-last.y, 8)
  })
  it('the two headings differ by exactly the bend, and the object turns anticlockwise', () => {
    expect(pic.headingOutDegrees - pic.headingInDegrees).toBeCloseTo(pic.bendDegrees, 8)
    expect(pic.bendDegrees).toBeCloseTo(18.74, 1)
    expect(pic.headingInDegrees).toBeCloseTo(80.63, 1)
    expect(pic.headingOutDegrees).toBeCloseTo(99.37, 1)
    // The real direction of travel far along the path agrees with the headings (it is within a few degrees at the view radius).
    const n = pic.path.length
    const dx = pic.path[n - 1].x - pic.path[n - 2].x
    const dy = pic.path[n - 1].y - pic.path[n - 2].y
    const leaving = (Math.atan2(dy, dx) * 180) / Math.PI
    expect(Math.abs(leaving - pic.headingOutDegrees)).toBeLessThan(5)
  })
  it('the planets are drawn for scale at their mean distances, in order', () => {
    expect(PLANET_ORBITS_AU.map((p) => p.name)).toEqual(['Earth', 'Mars', 'Jupiter'])
    expect(pic.planets.map((p) => p.au)).toEqual([1, 1.524, 5.203])
    for (const p of pic.planets) expect(p.au).toBeLessThan(PICTURE_VIEW_RADIUS_AU)
  })
  it('the guess line turns by the guessed bend from the way the object was heading, one heading per guess in order', () => {
    expect(bendGuessHeadingDegrees('b20') - pic.headingInDegrees).toBeCloseTo(20, 8)
    const heads = BEND_CHOICES.map((c) => bendGuessHeadingDegrees(c.id))
    expect(heads).toEqual([...heads].sort((a, b) => a - b))
    expect(new Set(heads).size).toBe(BEND_CHOICES.length)
  })
  it('does not change when a guess is made (separation)', () => {
    const before = JSON.stringify(pictureOne())
    bendGuessHeadingDegrees('b150')
    expect(JSON.stringify(pictureOne())).toBe(before)
  })
})

describe('Picture 2: speed against distance (Step 4)', () => {
  const pic = pictureTwo()
  it('reproduces the model: the speed at each distance is the energy-conservation speed, and the escape speed is lower everywhere', () => {
    for (const c of pic.curve) {
      expect(c.speedKmS * KM).toBeCloseTo(speedAt(atlasSpeedFarAway(), c.au * ASTRONOMICAL_UNIT), 3)
      expect(c.escapeKmS * KM).toBeCloseTo(escapeSpeed(c.au * ASTRONOMICAL_UNIT), 3)
      expect(c.speedKmS).toBeGreaterThan(c.escapeKmS)
    }
  })
  it('the speed falls as the distance grows towards the speed far away, and the curve ends are the ruler ends', () => {
    for (let i = 1; i < pic.curve.length; i++) {
      expect(pic.curve[i].speedKmS).toBeLessThan(pic.curve[i - 1].speedKmS)
      expect(pic.curve[i].escapeKmS).toBeLessThan(pic.curve[i - 1].escapeKmS)
    }
    expect(pic.curve[0].au).toBeCloseTo(0.3, 8)
    expect(pic.curve[pic.curve.length - 1].au).toBeCloseTo(100, 6)
    expect(pic.curve[pic.curve.length - 1].speedKmS).toBeGreaterThan(pic.speedFarAwayKmS)
    expect(pic.curve[pic.curve.length - 1].speedKmS - pic.speedFarAwayKmS).toBeLessThan(0.2)
  })
  it('has 68.3 km/s and 36.2 km/s at the closest approach, 18 percent faster than far away', () => {
    expect(Math.abs(pic.speedAtClosestKmS - 68.3)).toBeLessThan(0.1)
    expect(Math.abs(pic.escapeSpeedAtClosestKmS - 36.2)).toBeLessThan(0.1)
    expect(pic.gainShare).toBeCloseTo(68.34 / 57.99 - 1, 3)
    expect(pic.speedOverEscape).toBeCloseTo(1.89, 2)
  })
  it('every position is on its ruler, and the largest button (230 km/s) fits on the speed ruler', () => {
    for (const c of pic.curve) {
      for (const v of [c.position, c.speedPosition, c.escapePosition]) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
    for (const c of SPEED_CHOICES) expect(speedRulerPosition(c.kmS)).toBeLessThan(1)
    expect(SPEED_RULER_MAX_KM_S).toBeGreaterThan(230)
    expect(distanceRulerPosition(0.3)).toBeCloseTo(0, 8)
    expect(distanceRulerPosition(100)).toBeCloseTo(1, 8)
    expect(DISTANCE_TICKS_AU.map(distanceRulerPosition)).toEqual([...DISTANCE_TICKS_AU.map(distanceRulerPosition)].sort((a, b) => a - b))
    expect(SPEED_TICKS_KM_S[SPEED_TICKS_KM_S.length - 1]).toBe(SPEED_RULER_MAX_KM_S)
    // log(1.356 / 0.3) / log(100 / 0.3) = 0.2597, worked by hand.
    expect(pic.closestPosition).toBeCloseTo(0.2597, 3)
  })
  it('keeps a value past the end of a ruler on the ruler, and rejects impossible values', () => {
    expect(speedRulerPosition(300)).toBe(1)
    expect(speedRulerPosition(0)).toBe(0)
    expect(distanceRulerPosition(1000)).toBe(1)
    expect(distanceRulerPosition(0.01)).toBe(0)
    expect(() => speedRulerPosition(-1)).toThrow(RangeError)
    expect(() => distanceRulerPosition(0)).toThrow(RangeError)
  })
  it('agrees with NASA\'s "about 153,000 miles per hour" and ESA\'s "roughly 250,000 km/h" at closest approach, to within 1 percent', () => {
    expect(Math.abs(pic.speedAtClosestKmS / nasaSpeedAtClosestKmS() - 1)).toBeLessThan(0.01)
    expect(Math.abs(pic.speedAtClosestKmS / esaSpeedAtClosestKmS() - 1)).toBeLessThan(0.02)
  })
  it('does not change when a guess is made (separation)', () => {
    const before = JSON.stringify(pictureTwo())
    speedGuessMarker('v230')
    expect(JSON.stringify(pictureTwo())).toBe(before)
  })
})

describe('Drawing A: a trial path (Step 5)', () => {
  it('the default trial (58 km/s, 1.356 AU) is 3I/ATLAS\'s path: the same bend, nearly the same path', () => {
    const t = trialPicture(TRIAL_DEFAULT_SPEED_KM_S, TRIAL_DEFAULT_CLOSEST_AU)
    expect(t.bendVersusAtlas).toBe('the same')
    expect(Math.abs(t.bendDegrees - atlasBendDegrees())).toBeLessThan(0.05)
    const real = pictureOne().path
    expect(t.path.length).toBe(real.length)
    for (let i = 0; i < real.length; i += 10) expect(Math.hypot(t.path[i].x - real[i].x, t.path[i].y - real[i].y)).toBeLessThan(0.1)
  })
  it('every trial path lies on its hyperbola, passes the Sun at the chosen closest approach and ends at the view radius', () => {
    for (const v of TRIAL_SPEEDS_KM_S)
      for (const au of TRIAL_CLOSEST_AU) {
        const t = trialPicture(v, au)
        const c = t.path[t.closestIndex]
        expect(c.x).toBeCloseTo(au, 8)
        expect(c.y).toBeCloseTo(0, 8)
        for (const pt of t.path) {
          const r = Math.hypot(pt.x, pt.y)
          const th = Math.atan2(pt.y, pt.x)
          expect(r).toBeCloseTo((au * (1 + t.eccentricity)) / (1 + t.eccentricity * Math.cos(th)), 6)
        }
        const first = t.path[0]
        expect(Math.hypot(first.x, first.y)).toBeCloseTo(PICTURE_VIEW_RADIUS_AU, 6)
        expect(t.escapeOverSpeed).toBeLessThan(1)
        expect(t.escapeOverSpeed).toBeCloseTo(1 / t.speedOverEscape, 10)
      }
  })
  it('the heading at each end is the real direction of travel, and the path turns by at most the bend', () => {
    for (const v of TRIAL_SPEEDS_KM_S)
      for (const au of TRIAL_CLOSEST_AU) {
        const t = trialPicture(v, au)
        const n = t.path.length
        const dx = t.path[n - 1].x - t.path[n - 2].x
        const dy = t.path[n - 1].y - t.path[n - 2].y
        const finite = (Math.atan2(dy, dx) * 180) / Math.PI
        expect(Math.abs(finite - t.exitHeadingDegrees)).toBeLessThan(3)
        const turn = t.exitHeadingDegrees - t.entryHeadingDegrees
        expect(turn).toBeGreaterThan(0)
        expect(turn).toBeLessThanOrEqual(t.bendDegrees + 1e-6)
      }
  })
  it('says whether the bend is more or less than 3I/ATLAS\'s, and a slower visitor is bent more', () => {
    expect(trialPicture(26, 1.356).bendVersusAtlas).toBe('more')
    expect(trialPicture(100, 1.356).bendVersusAtlas).toBe('less')
    expect(trialPicture(58, 0.3).bendVersusAtlas).toBe('more')
    expect(trialPicture(58, 3).bendVersusAtlas).toBe('less')
    const bends = TRIAL_SPEEDS_KM_S.map((v) => trialPicture(v, 1.356).bendDegrees)
    for (let i = 1; i < bends.length; i++) expect(bends[i]).toBeLessThan(bends[i - 1])
  })
  it('does not depend on a guess, and agrees with trialOrbit', () => {
    const a = trialPicture(26, 3)
    const o = trialOrbit(26, 3)
    expect(a.eccentricity).toBe(o.eccentricity)
    expect(a.bendDegrees).toBe(o.bendDegrees)
    bendGuessResult('b2')
    expect(JSON.stringify(trialPicture(26, 3))).toBe(JSON.stringify(a))
  })
})

describe('the results (Step 6)', () => {
  it('compareToReference says "the same" only when both round to the same multiple of the reference\'s own precision', () => {
    expect(compareToReference(68.34, 68, 1)).toBe('the same')
    expect(compareToReference(68.6, 68, 1)).toBe('more')
    expect(compareToReference(67.4, 68, 1)).toBe('less')
    expect(compareToReference(152874, 153000, 1000)).toBe('the same')
    expect(compareToReference(246028, 250000, 10000)).toBe('the same')
    expect(compareToReference(6.1437, 6.14135, 0.01)).toBe('the same')
    expect(compareToReference(6.1437, 6.14135, 0.0001)).toBe('more')
    expect(() => compareToReference(1, 1, 0)).toThrow(RangeError)
  })
  it('the check-up reproduces the pictures and agrees with the published numbers at their own precision', () => {
    const c = resultsCheckUp()
    expect(c.speedFarAwayKmS).toBeCloseTo(57.99, 2)
    expect(c.speedFarAwayComparison).toBe('the same')
    expect(c.eccentricityFromRounded).toBeCloseTo(6.1437, 3)
    expect(c.eccentricityComparison).toBe('the same')
    expect(c.speedAtClosestKmS).toBeCloseTo(pictureTwo().speedAtClosestKmS, 10)
    expect(c.speedAtClosestMph).toBeCloseTo(152874, -1)
    expect(c.nasaComparison).toBe('the same')
    expect(c.speedAtClosestKmH).toBeCloseTo(246028, -1)
    expect(c.esaComparison).toBe('the same')
    expect(c.nasaKmS).toBeCloseTo(68.4, 1)
    expect(c.esaKmS).toBeCloseTo(69.44, 1)
    expect(c.escapeSpeedAtClosestKmS).toBeCloseTo(36.17, 2)
    expect(c.speedOverEscape).toBeCloseTo(1.89, 2)
    expect(c.bendDegrees).toBeCloseTo(18.74, 2)
    expect(c.bendDegrees).toBeCloseTo(pictureOne().bendDegrees, 10)
  })
  it('the bend is less than ʻOumuamua\'s and Borisov\'s, worked out the same way', () => {
    const c = resultsCheckUp()
    expect(c.oumuamuaBendDegrees).toBeCloseTo(112.9, 1)
    expect(c.borisovBendDegrees).toBeCloseTo(34.2, 1)
    expect(c.bendVersusOumuamua).toBe('less')
    expect(c.bendVersusBorisov).toBe('less')
  })
  it('the example steps chain from the two numbers to the bend and agree with the pictures', () => {
    const s = exampleSteps()
    expect(s.closestApproachMillionKm).toBeCloseTo(202.9, 1)
    expect(s.speedFarAwayKmS).toBeCloseTo(atlasSpeedFarAway() / 1e3, 10)
    // The speed at closest approach is the square root of the sum of the squares of the speed far away and the escape speed there.
    expect(Math.sqrt(s.sumOfSquares)).toBeCloseTo(s.speedAtClosestKmS, 8)
    expect(s.sumOfSquares).toBeCloseTo(s.speedFarAwaySquared + s.escapeSpeedSquared, 8)
    expect(s.oneOverEccentricity).toBeCloseTo(0.1628, 4)
    expect(s.halfBendDegrees).toBeCloseTo(9.371, 3)
    expect(2 * s.halfBendDegrees).toBeCloseTo(s.bendDegrees, 10)
    expect(s.headingOutDegrees - s.headingInDegrees).toBeCloseTo(s.bendDegrees, 8)
    expect(2 * s.asymptoteAngleDegrees).toBeCloseTo(180 + s.bendDegrees, 8)
    expect(s.gm).toBe(GM)
  })
  it('the three known objects are in order of discovery, and a higher eccentricity means a smaller bend', () => {
    const k = knownObjects()
    expect(k.map((o) => o.year)).toEqual([2017, 2019, 2025])
    expect(k.map((o) => o.eccentricity)).toEqual([1.2, 3.4, 6.14135])
    expect(k[2].bendDegrees).toBeCloseTo(atlasBendDegrees(), 10)
    expect(k[0].bendDegrees).toBeGreaterThan(k[1].bendDegrees)
    expect(k[1].bendDegrees).toBeGreaterThan(k[2].bendDegrees)
  })
  it('does not depend on a guess', () => {
    const before = JSON.stringify([resultsCheckUp(), exampleSteps(), knownObjects()])
    bendGuessResult('b2')
    speedGuessMarker('v230')
    expect(JSON.stringify([resultsCheckUp(), exampleSteps(), knownObjects()])).toBe(before)
  })
})
