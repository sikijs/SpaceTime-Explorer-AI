import { describe, expect, it } from 'vitest'
import {
  CMB_REDSHIFT,
  GALAXY_A_REDSHIFT,
  GUESS_ARROW_LENGTH_LIGHT_YEARS,
  GUESS_LEFT_THIRTEEN_LIGHT_YEARS,
  GUESS_LEFT_UNDER_LIGHT_YEARS,
  GUESS_TODAY_REFERENCE_LIGHT_YEARS,
  MAX_REDSHIFT,
  MIN_REDSHIFT,
  PLANCK_AGE_YEARS,
  PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS,
  PLANCK_BASED_EDGE_LIGHT_YEARS,
  PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG,
  REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS,
  REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS,
  SOURCE_PRESETS,
  actualLeft,
  actualToday,
  captionNumbers,
  checkUp,
  compareWithRange,
  distanceTable,
  galaxyA,
  leftGuessMark,
  leftGuessMatches,
  markLeftGuess,
  markTodayGuess,
  modelLightLeftYearsAfterBigBang,
  modelLightLeftYearsRounded,
  percentDifference,
  sourceB,
  todayGuessMarker,
  todayGuessMatches,
  whatYourNumbersShow,
  workedExamples,
  zoomAxisFor,
  zoomPanel,
  distanceTodayLightYears,
  distanceWhenLightLeftLightYears,
  lightTravelYears,
  runObservableUniverseExperiment,
  timeAfterBigBangYears,
} from './observableUniverseExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION, comovingDistanceMpc } from './darkEnergyExperiment'
import { universeAgeYears, relativeSizeAtTime } from './universeAgeExperiment'
import { RECOMBINATION_REDSHIFT, RECOMBINATION_YEARS_AFTER_BIG_BANG } from './cosmicMicrowaveBackgroundExperiment'

const L = BEST_FIT_DARK_ENERGY_FRACTION
const BILLION = 1e9
const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

// Independent literal values (not the module's imported constants), for the small-redshift check.
const C_KM_PER_S = 299792.458
const H0 = 70
const MPC_IN_LIGHT_YEARS = 3.2615637771674337e6

describe('small redshift', () => {
  it('agrees with c z / H0 when nothing has had time to stretch', () => {
    const z = 0.001
    const expectedLightYears = ((C_KM_PER_S * z) / H0) * MPC_IN_LIGHT_YEARS
    expect(relativeError(distanceTodayLightYears(z, L), expectedLightYears)).toBeLessThan(0.002)
    expect(relativeError(lightTravelYears(z, L), expectedLightYears)).toBeLessThan(0.002)
    expect(relativeError(distanceTodayLightYears(z, L), lightTravelYears(z, L))).toBeLessThan(0.002)
  })
})

const REDSHIFT_GRID = [0.01, 0.1, 0.5, 1, 2, 5, 10, 100, 1089.8]

describe('distance today versus the distance the light travelled', () => {
  it('is larger for every redshift above 0, and the ratio grows with redshift', () => {
    let previousRatio = 1
    for (const z of REDSHIFT_GRID) {
      const ratio = distanceTodayLightYears(z, L) / lightTravelYears(z, L)
      expect(ratio).toBeGreaterThan(1)
      expect(ratio).toBeGreaterThan(previousRatio)
      previousRatio = ratio
    }
  })
})

describe('distance when the light left', () => {
  it('equals the distance today divided by 1 + z, exactly', () => {
    for (const z of REDSHIFT_GRID) {
      expect(relativeError(distanceWhenLightLeftLightYears(z, L), distanceTodayLightYears(z, L) / (1 + z))).toBeLessThan(1e-12)
    }
  })

  it('rises and then falls, with its largest value at a redshift between 1 and 5', () => {
    const curve = runObservableUniverseExperiment(2).curve
    const best = curve.reduce((a, b) => (b.distanceWhenLightLeftLightYears > a.distanceWhenLightLeftLightYears ? b : a))
    expect(best.redshift).toBeGreaterThan(1)
    expect(best.redshift).toBeLessThan(5)
    expect(curve[0].distanceWhenLightLeftLightYears).toBeLessThan(best.distanceWhenLightLeftLightYears)
    expect(curve[curve.length - 1].distanceWhenLightLeftLightYears).toBeLessThan(best.distanceWhenLightLeftLightYears)
  })
})

describe('the cosmic microwave background', () => {
  const result = runObservableUniverseExperiment(CMB_REDSHIFT)

  it('is about 44.6 billion light-years away today and about 41 million when the light left', () => {
    expect(relativeError(result.distanceTodayLightYears, 44.6 * BILLION)).toBeLessThan(0.01)
    expect(relativeError(result.distanceWhenLightLeftLightYears, 41e6)).toBeLessThan(0.02)
  })

  it('has a light-travel time within 0.5% of the age of the universe', () => {
    expect(relativeError(result.lightTravelYears, universeAgeYears(L))).toBeLessThan(0.005)
  })

  it('matches the specification table at the other presets, to 1%', () => {
    const expected: Array<[number, number, number, number]> = [
      // redshift, light travelled, distance today, distance when the light left (billion light-years)
      [0.5, 5.04, 6.16, 4.11],
      [2, 10.24, 16.89, 5.63],
      [10, 13.0, 30.79, 2.8],
    ]
    for (const [z, travelled, today, left] of expected) {
      const run = runObservableUniverseExperiment(z)
      expect(relativeError(run.lightTravelYears, travelled * BILLION)).toBeLessThan(0.01)
      expect(relativeError(run.distanceTodayLightYears, today * BILLION)).toBeLessThan(0.01)
      expect(relativeError(run.distanceWhenLightLeftLightYears, left * BILLION)).toBeLessThan(0.01)
    }
  })

  it('has a recession speed today of about 3 times the speed of light', () => {
    expect(result.recessionSpeedTodayOverC).toBeGreaterThan(3)
    expect(result.recessionSpeedTodayOverC).toBeLessThan(3.4)
  })

  it('restates the same redshift that Experiment 3 uses', () => {
    expect(CMB_REDSHIFT).toBe(RECOMBINATION_REDSHIFT)
  })
})

describe('timeAfterBigBangYears', () => {
  it('is the exact inverse of Experiment 6 relativeSizeAtTime', () => {
    for (const share of [0, 0.3, 0.7]) {
      for (const a of [0.001, 0.01, 0.1, 0.5, 0.9, 1]) {
        const years = timeAfterBigBangYears(a, share)
        expect(relativeError(relativeSizeAtTime(years, share), a)).toBeLessThan(1e-9)
      }
    }
  })

  it("reaches today's age when the universe has today's size", () => {
    for (const share of [0, 0.3, 0.7]) {
      expect(relativeError(timeAfterBigBangYears(1, share), universeAgeYears(share))).toBeLessThan(1e-12)
    }
  })
})

describe('light-travel time', () => {
  it('is always less than the age of the universe, and increases with redshift', () => {
    const age = universeAgeYears(L)
    let previous = 0
    for (const z of REDSHIFT_GRID) {
      const years = lightTravelYears(z, L)
      expect(years).toBeLessThan(age)
      expect(years).toBeGreaterThan(previous)
      previous = years
    }
  })
})

describe('the two curves separate', () => {
  it('keeps the light-travelled distance below c times the age while the distance today keeps rising past it', () => {
    const age = universeAgeYears(L)
    let previousToday = 0
    for (const z of REDSHIFT_GRID) {
      expect(lightTravelYears(z, L)).toBeLessThan(age)
      const today = distanceTodayLightYears(z, L)
      expect(today).toBeGreaterThan(previousToday)
      previousToday = today
    }
    expect(distanceTodayLightYears(10, L)).toBeGreaterThan(age)
    expect(distanceTodayLightYears(CMB_REDSHIFT, L)).toBeGreaterThan(3 * age)
  })
})

describe("Experiment 5's comoving distance function", () => {
  it('stays accurate at the cosmic microwave background redshift', () => {
    const defaultSteps = comovingDistanceMpc(CMB_REDSHIFT, L)
    const fine = comovingDistanceMpc(CMB_REDSHIFT, L, 200000)
    expect(relativeError(defaultSteps, fine)).toBeLessThan(0.001)
  })
})

describe('runObservableUniverseExperiment', () => {
  it('reports consistent values and a graph curve across the offered range', () => {
    const result = runObservableUniverseExperiment(2)
    expect(result.stretchingFactor).toBe(3)
    expect(result.todayOverTravelled).toBeCloseTo(result.distanceTodayLightYears / result.lightTravelYears, 12)
    expect(result.curve[0].redshift).toBeCloseTo(MIN_REDSHIFT, 12)
    expect(relativeError(result.curve[result.curve.length - 1].redshift, MAX_REDSHIFT)).toBeLessThan(1e-12)
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].redshift).toBeGreaterThan(result.curve[i - 1].redshift)
    }
  })

  it('offers presets that all lie within the offered redshift range', () => {
    for (const preset of SOURCE_PRESETS) {
      expect(preset.redshift).toBeGreaterThanOrEqual(MIN_REDSHIFT)
      expect(preset.redshift).toBeLessThanOrEqual(MAX_REDSHIFT)
    }
  })
})

describe('the two fixed sources of Part 1', () => {
  it('are the redshift 2 galaxy and the oldest light', () => {
    expect(GALAXY_A_REDSHIFT).toBe(2)
    expect(galaxyA().redshift).toBe(2)
    expect(sourceB().redshift).toBe(CMB_REDSHIFT)
  })

  it("Galaxy A's light travelled about 10 billion years and its source is farther than that today", () => {
    expect(relativeError(galaxyA().lightTravelYears, 10.24 * BILLION)).toBeLessThan(0.01)
    expect(relativeError(galaxyA().distanceTodayLightYears, 16.89 * BILLION)).toBeLessThan(0.01)
  })
})

describe('what the model gives for each guess', () => {
  it("Galaxy A is more than 10 billion light-years away today, so 'more' is the answer and the others are not", () => {
    expect(actualToday()).toBe('more')
    expect(todayGuessMatches('more')).toBe(true)
    expect(todayGuessMatches('less')).toBe(false)
    expect(todayGuessMatches('about')).toBe(false)
  })

  it("Source B was under 100 million light-years away when the light left, so only 'closer' matches", () => {
    expect(actualLeft()).toBe('closer')
    expect(leftGuessMatches('closer')).toBe(true)
    expect(leftGuessMatches('thirteen')).toBe(false)
    expect(leftGuessMatches('few')).toBe(false)
    expect(sourceB().distanceWhenLightLeftLightYears).toBeLessThan(GUESS_LEFT_UNDER_LIGHT_YEARS)
  })

  it('reads its answers from the model, not from typed-in values', () => {
    expect(GUESS_TODAY_REFERENCE_LIGHT_YEARS).toBe(10e9)
    expect(galaxyA().distanceTodayLightYears).toBeGreaterThan(GUESS_TODAY_REFERENCE_LIGHT_YEARS)
  })
})

describe('the white guess marks', () => {
  it("guess 1's line is at 10 billion, with an arrow left for less, right for more and a ring for about", () => {
    const less = todayGuessMarker('less')
    const more = todayGuessMarker('more')
    const about = todayGuessMarker('about')
    for (const m of [less, more, about]) expect(m.lineAtLightYears).toBe(10e9)
    expect(less.kind).toBe('left')
    expect(less.arrowToLightYears).toBeLessThan(less.arrowFromLightYears)
    expect(more.kind).toBe('right')
    expect(more.arrowToLightYears).toBeGreaterThan(more.arrowFromLightYears)
    expect(more.arrowToLightYears - more.arrowFromLightYears).toBe(GUESS_ARROW_LENGTH_LIGHT_YEARS)
    expect(about.kind).toBe('ring')
    expect(about.arrowToLightYears).toBe(about.arrowFromLightYears)
  })

  it('each of guess 1 answers gives a different mark', () => {
    const marks = (['less', 'about', 'more'] as const).map((g) => JSON.stringify(todayGuessMarker(g)))
    expect(new Set(marks).size).toBe(3)
  })

  it("guess 2: 'about 13 billion' is a line on the main axis at 13 billion", () => {
    expect(leftGuessMark('thirteen')).toEqual({ panel: 'main', kind: 'line', atLightYears: GUESS_LEFT_THIRTEEN_LIGHT_YEARS })
    expect(GUESS_LEFT_THIRTEEN_LIGHT_YEARS).toBe(13e9)
  })

  it("guess 2: 'under 100 million' is a bracket from 0 to 100 million on the zoomed panel", () => {
    expect(leftGuessMark('closer')).toEqual({ panel: 'zoom', kind: 'bracket', fromLightYears: 0, toLightYears: 100e6 })
  })

  it("guess 2: 'a few billion' has no size, so it is only an edge arrow with no position", () => {
    const mark = leftGuessMark('few')
    expect(mark).toEqual({ panel: 'zoom', kind: 'edge-arrow', hasSize: false })
    expect(Object.keys(mark)).not.toContain('atLightYears')
    expect(Object.keys(mark)).not.toContain('toLightYears')
  })

  it('guess 2 answers give three different marks', () => {
    const marks = (['thirteen', 'few', 'closer'] as const).map((g) => JSON.stringify(leftGuessMark(g)))
    expect(new Set(marks).size).toBe(3)
  })
})

describe('the zoomed panel', () => {
  const panel = zoomPanel()

  it('runs from 0 to 100 million light-years with a tick every 20 million', () => {
    expect(panel.axisMaxLightYears).toBe(100e6)
    expect(panel.ticksLightYears).toEqual([0, 20e6, 40e6, 60e6, 80e6, 100e6])
  })

  it("shows Source B's green bar, 41 million light-years, at 41 percent of its axis", () => {
    expect(relativeError(panel.greenBarLightYears, 41e6)).toBeLessThan(0.02)
    expect(panel.greenBarFractionOfAxis).toBeCloseTo(panel.greenBarLightYears / 100e6, 12)
    expect(panel.greenBarFractionOfAxis).toBeGreaterThan(0.4)
    expect(panel.greenBarFractionOfAxis).toBeLessThan(0.42)
  })

  it('is far smaller than the main 50 billion axis can show (the reason the panel exists)', () => {
    expect(panel.greenBarLightYears / (50 * BILLION)).toBeLessThan(0.001)
  })
})

describe('what the tutor says about each guess', () => {
  it("marks guess 1 with Galaxy A's numbers", () => {
    const right = markTodayGuess('more')
    const wrong = markTodayGuess('less')
    expect(right.matches).toBe(true)
    expect(wrong.matches).toBe(false)
    expect(right.actual).toBe('more')
    expect(right.referenceLightYears).toBe(10e9)
    expect(right.todayMinusTravelledLightYears).toBeCloseTo(galaxyA().distanceTodayLightYears - galaxyA().lightTravelYears, 3)
    expect(relativeError(right.todayMinusTravelledLightYears, 6.65 * BILLION)).toBeLessThan(0.02)
  })

  it("marks guess 2 with Source B's numbers", () => {
    expect(markLeftGuess('closer').matches).toBe(true)
    expect(markLeftGuess('few').matches).toBe(false)
    expect(markLeftGuess('thirteen').matches).toBe(false)
    expect(markLeftGuess('few').actual).toBe('closer')
    expect(relativeError(markLeftGuess('few').sourceBLeftLightYears, 41e6)).toBeLessThan(0.02)
    expect(relativeError(markLeftGuess('few').sourceBTravelledLightYears, 13.47 * BILLION)).toBeLessThan(0.01)
  })
})

describe('readings against published values', () => {
  it('says less or more outside a published range and within it inside', () => {
    expect(compareWithRange(1, 2, 3).reading).toBe('less')
    expect(compareWithRange(4, 2, 3).reading).toBe('more')
    expect(compareWithRange(2.5, 2, 3).reading).toBe('within the published range')
    expect(compareWithRange(5, 5, 5).reading).toBe('the same')
  })

  it('works out the differences at each end of the range', () => {
    const c = compareWithRange(44, 45, 46)
    expect(c.differenceAtLow).toBe(-1)
    expect(c.differenceAtHigh).toBe(-2)
    expect(c.percentAtLow).toBeCloseTo((-1 / 45) * 100, 10)
    expect(percentDifference(110, 100)).toBeCloseTo(10, 12)
  })
})

describe('the model time the oldest light left', () => {
  it('is about 472,000 years after the Big Bang, and rounds to the nearest thousand', () => {
    expect(Math.abs(modelLightLeftYearsAfterBigBang() - 471_932)).toBeLessThan(5)
    expect(modelLightLeftYearsRounded()).toBe(472_000)
  })

  it("is later than the published 370,000 to 380,000, and the upper one equals Experiment 3's constant", () => {
    expect(modelLightLeftYearsAfterBigBang()).toBeGreaterThan(PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.high)
    expect(PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.high).toBe(RECOMBINATION_YEARS_AFTER_BIG_BANG)
  })
})

describe('the check-up (Table 1)', () => {
  const rows = checkUp()
  const row = (id: string) => rows.find((r) => r.id === id)!

  it('has the four rows a to d', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it("(a) the oldest light's source today: the model is less than the published figures", () => {
    expect(relativeError(row('a').model, 44.61 * BILLION)).toBeLessThan(0.001)
    expect(row('a').publishedLow).toBe(PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS.low)
    expect(row('a').publishedHigh).toBe(REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS)
    expect(row('a').comparison.reading).toBe('less')
    // 2.38 percent below 45.7 (the figure the page has always said, "about 2.4 percent").
    expect(row('a').comparison.percentAtHigh).toBeCloseTo(-2.38, 1)
    expect(row('a').comparison.differenceAtHigh).toBeLessThan(0)
  })

  it('(b) the model is less than the edge of the observable universe, by about 4 percent against 46.5', () => {
    expect(row('b').publishedLow).toBe(PLANCK_BASED_EDGE_LIGHT_YEARS.low)
    expect(row('b').publishedHigh).toBe(REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS)
    expect(row('b').comparison.reading).toBe('less')
    expect(row('b').comparison.percentAtHigh).toBeCloseTo(-4.06, 1)
  })

  it('(c) the model puts the departure later than the published 370,000 to 380,000 years', () => {
    expect(row('c').comparison.reading).toBe('more')
    expect(row('c').comparison.differenceAtLow).toBeGreaterThan(row('c').comparison.differenceAtHigh)
    expect(Math.abs(row('c').comparison.differenceAtHigh - 91_932)).toBeLessThan(5)
  })

  it("(d) the model's age is less than Planck's 13.787 billion years", () => {
    expect(row('d').publishedLow).toBe(PLANCK_AGE_YEARS)
    expect(row('d').publishedHigh).toBe(PLANCK_AGE_YEARS)
    expect(row('d').comparison.reading).toBe('less')
    expect(relativeError(row('d').model, universeAgeYears(L))).toBeLessThan(1e-12)
    expect(row('d').comparison.differenceAtLow).toBeCloseTo(-0.32e9, -7)
  })
})

describe('Table 2 and what the learner\'s numbers show', () => {
  it('has Galaxy A, Source B and the learner\'s source, in that order', () => {
    const rows = distanceTable(10)
    expect(rows.map((r) => r.label)).toEqual(['Galaxy A', 'Source B', 'Your source'])
    expect(rows.map((r) => r.redshift)).toEqual([2, CMB_REDSHIFT, 10])
  })

  it('takes every number from the model, and only the last row follows the learner', () => {
    const one = distanceTable(0.5)
    const two = distanceTable(10)
    expect(one[0]).toEqual(two[0])
    expect(one[1]).toEqual(two[1])
    expect(one[2]).not.toEqual(two[2])
    expect(relativeError(two[2].distanceTodayLightYears, 30.79 * BILLION)).toBeLessThan(0.01)
  })

  it('compares the learner\'s source with Galaxy A', () => {
    expect(whatYourNumbersShow(0.5).todayReadingAgainstGalaxyA).toBe('less')
    expect(whatYourNumbersShow(10).todayReadingAgainstGalaxyA).toBe('more')
    expect(whatYourNumbersShow(2).todayReadingAgainstGalaxyA).toBe('the same')
    const y = whatYourNumbersShow(10)
    expect(y.todayMinusGalaxyALightYears).toBeCloseTo(runObservableUniverseExperiment(10).distanceTodayLightYears - galaxyA().distanceTodayLightYears, 3)
    expect(y.todayOverTravelled).toBeGreaterThan(1)
  })
})

describe("the pictures' own numbers", () => {
  const n = captionNumbers()

  it('gives the gap between the distance today and the distance travelled', () => {
    expect(relativeError(n.galaxyAGapLightYears, 6.65 * BILLION)).toBeLessThan(0.02)
    expect(relativeError(n.sourceBGapLightYears, 31.14 * BILLION)).toBeLessThan(0.01)
  })

  it('puts the green curve\'s peak near redshift 1.6 at about 5.7 billion light-years', () => {
    expect(n.leftCurvePeakRedshift).toBeGreaterThan(1.3)
    expect(n.leftCurvePeakRedshift).toBeLessThan(2)
    expect(relativeError(n.leftCurvePeakLightYears, 5.7 * BILLION)).toBeLessThan(0.01)
  })

  it('gives the curves\' right-hand ends (blue near 13.5, gold past 44)', () => {
    expect(relativeError(n.travelCurveEndLightYears, 13.47 * BILLION)).toBeLessThan(0.01)
    expect(n.todayCurveEndLightYears).toBeGreaterThan(44 * BILLION)
  })
})

describe('the worked examples', () => {
  const w = workedExamples()

  it('13.47 billion years at 1 light-year per year is 13.47 billion light-years', () => {
    expect(relativeError(w.travelYears, 13.47 * BILLION)).toBeLessThan(0.01)
    expect(w.travelLightYears).toBe(w.travelYears)
  })

  it('44.61 billion divided by 1090.8 is about 41 million light-years', () => {
    expect(w.stretchingFactor).toBeCloseTo(1090.8, 6)
    expect(relativeError(w.leftLightYears, 41e6)).toBeLessThan(0.02)
    expect(relativeError(w.leftLightYears, sourceB().distanceWhenLightLeftLightYears)).toBeLessThan(1e-12)
  })

  it('70 km/s per Mpc times about 13,680 Mpc is about 957,000 km/s, about 3.2 times the speed of light', () => {
    expect(w.hubbleConstant).toBe(70)
    expect(relativeError(w.distanceTodayMpc, 13680)).toBeLessThan(0.01)
    expect(relativeError(w.recessionSpeedKmPerS, 957_000)).toBeLessThan(0.01)
    expect(w.recessionSpeedOverC).toBeCloseTo(sourceB().recessionSpeedTodayOverC, 12)
    expect(w.recessionSpeedOverC).toBeGreaterThan(3.1)
    expect(w.recessionSpeedOverC).toBeLessThan(3.3)
  })
})

describe("Part 2's zoomed strip", () => {
  it('picks the smallest axis that holds the distance when the light left, and none from 1 billion up', () => {
    expect(zoomAxisFor(41e6)).toBe(100e6)
    expect(zoomAxisFor(100e6)).toBe(100e6)
    expect(zoomAxisFor(150e6)).toBe(200e6)
    expect(zoomAxisFor(300e6)).toBe(500e6)
    expect(zoomAxisFor(800e6)).toBe(1e9)
    expect(zoomAxisFor(1e9)).toBeNull()
    expect(zoomAxisFor(5.6e9)).toBeNull()
  })

  it('needs a strip for the oldest light and none for the offered presets other than the oldest light', () => {
    expect(zoomAxisFor(sourceB().distanceWhenLightLeftLightYears)).toBe(100e6)
    for (const z of [0.5, 2, 10]) expect(zoomAxisFor(runObservableUniverseExperiment(z).distanceWhenLightLeftLightYears)).toBeNull()
  })
})

describe('module independence', () => {
  it('imports from the earlier experiments rather than redefining, and from none of the others', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./observableUniverseExperiment.ts', import.meta.url), 'utf-8'),
    )
    // Whole import statements, so imports written over several lines are read correctly.
    const imports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)].map((m) => ({
      names: m[1],
      module: m[2],
    }))
    const from = (name: string) =>
      imports
        .filter((i) => i.module.includes(name))
        .map((i) => i.names)
        .join(' ')
    expect(from('hubblesLawExperiment')).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    expect(from('hubblesLawExperiment')).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(from('bigBangExperiment')).toContain('MPC_TO_KM')
    expect(from('bigBangExperiment')).toContain('hubbleTimeYears')
    expect(from('darkEnergyExperiment')).toContain('comovingDistanceMpc')
    expect(from('darkEnergyExperiment')).toContain('BEST_FIT_DARK_ENERGY_FRACTION')
    expect(from('universeAgeExperiment')).toContain('universeAgeYears')
    for (const name of [
      'lightBendingExperiment',
      'cosmicMicrowaveBackgroundExperiment',
      'gravitationalLensingExperiment',
    ]) {
      expect(imports.some((i) => i.module.includes(name))).toBe(false)
    }
    // Experiment 5's distance function is imported, not rewritten here.
    expect(source).not.toMatch(/function\s+comovingDistanceMpc/)
  })
})
