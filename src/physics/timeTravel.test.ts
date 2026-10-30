import { describe, it, expect } from 'vitest'
import {
  PRESET_SPEED,
  PRESET_TRIP_YEARS,
  PRESET_SEPARATION_LY,
  CLOCK_CHOICES,
  SPEED_CHOICES,
  SEPARATION_CHOICES_LY,
  movingClockYears,
  clockOffsetYears,
  exitFrameTimeFromB,
  exitFrameTimeFromA,
  closedPathExists,
  timeGainedYears,
  entryAndExitEvents,
  entryInsideExitCone,
  smallestSpeedForClosedPath,
  timeForOffsetToReach,
  nearestChoice,
  predictionOneAnswerId,
  predictionTwoAnswer,
  predictionTwoAnswerId,
  BEFORE_CHOICES,
  PICTURE_ENTRY_TIME_YEARS,
  pictureOne,
  pictureTwo,
  pictureThree,
  clockGuessYears,
  beforeGuessMarker,
  trialPicture,
  friendlyDuration,
  durationRulerPosition,
  DURATION_RULER,
  TRIAL_DEFAULT_SPEED,
  TRIAL_DEFAULT_SEPARATION_LY,
  compare,
  resultsCheckUp,
  exampleSteps,
  TESTED,
} from './timeTravel'

describe('travel to the future: the offset between the mouths (the twin formula)', () => {
  it('test 1: the offset is 4 years at 0.8c over 10 years, 8.589 at 0.99c and 0.0501 at 0.1c', () => {
    expect(clockOffsetYears(0.8, 10)).toBeCloseTo(4, 9)
    expect(clockOffsetYears(0.99, 10)).toBeCloseTo(8.589, 3)
    expect(clockOffsetYears(0.1, 10)).toBeCloseTo(0.0501, 4)
  })
  it('test 2: the moving mouth counts 6 years at 0.8c over 10 years', () => {
    expect(movingClockYears(0.8, 10)).toBeCloseTo(6, 9)
  })
  it('test 3: no offset at rest, and the offset grows with speed', () => {
    expect(clockOffsetYears(0, 10)).toBe(0)
    let last = -1
    for (const beta of SPEED_CHOICES) {
      const now = clockOffsetYears(beta, 10)
      expect(now).toBeGreaterThan(last)
      last = now
    }
  })
  it('rejects speeds at or above c, negative speeds and a zero trip', () => {
    expect(() => clockOffsetYears(1, 10)).toThrow(RangeError)
    expect(() => clockOffsetYears(-0.1, 10)).toThrow(RangeError)
    expect(() => clockOffsetYears(0.5, 0)).toThrow(RangeError)
  })
})

describe('the tunnel link', () => {
  it('entering B comes out of A earlier by the offset; entering A comes out of B later', () => {
    expect(exitFrameTimeFromB(10, 4)).toBe(6)
    expect(exitFrameTimeFromA(10, 4)).toBe(14)
  })
})

describe('the closed path', () => {
  it('test 4: closed for (0.8c, 10 years, 1 light-year), not for 0.1c, and the boundary is not closed', () => {
    expect(closedPathExists(clockOffsetYears(0.8, 10), 1)).toBe(true)
    expect(closedPathExists(clockOffsetYears(0.1, 10), 1)).toBe(false)
    expect(closedPathExists(4, 4)).toBe(false)
    expect(closedPathExists(4.0001, 4)).toBe(true)
  })
  it('test 5: the time gained is 3 years for the preset, and 0 when the path is not closed', () => {
    expect(timeGainedYears(clockOffsetYears(0.8, 10), 1)).toBeCloseTo(3, 9)
    expect(timeGainedYears(clockOffsetYears(0.1, 10), 1)).toBe(0)
  })
  it('test 6: the smallest speed for (10 years, 1 light-year) is 0.4359, where the offset equals 1 year', () => {
    const beta = smallestSpeedForClosedPath(10, 1)!
    expect(beta).toBeCloseTo(0.4359, 4)
    expect(clockOffsetYears(beta, 10)).toBeCloseTo(1, 9)
    expect(closedPathExists(clockOffsetYears(beta + 0.01, 10), 1)).toBe(true)
    expect(closedPathExists(clockOffsetYears(beta - 0.01, 10), 1)).toBe(false)
  })
  it('there is no speed that works when the separation is as long as the trip', () => {
    expect(smallestSpeedForClosedPath(10, 10)).toBeNull()
    expect(smallestSpeedForClosedPath(10, 12)).toBeNull()
  })
  it('test 7: the exit is on the past side of the entry, and the entry is inside the exit event\'s light cone when offset > separation', () => {
    const { entry, exit } = entryAndExitEvents(10, 4, 1)
    expect(exit.time).toBeLessThan(entry.time)
    expect(entryInsideExitCone(4, 1)).toBe(true)
    expect(entryInsideExitCone(0.5, 1)).toBe(false)
    expect(entryInsideExitCone(1, 1)).toBe(false) // on the cone's edge, light only
  })
  it('the cone test and the arrival-time test agree for every control setting', () => {
    for (const beta of SPEED_CHOICES) {
      for (const sep of SEPARATION_CHOICES_LY) {
        const offset = clockOffsetYears(beta, PRESET_TRIP_YEARS)
        expect(entryInsideExitCone(offset, sep.ly)).toBe(closedPathExists(offset, sep.ly))
      }
    }
  })
  it('test 8: the offset builds up at a steady rate, reaching 1 year after 2.5 years at 0.8c', () => {
    expect(timeForOffsetToReach(0.8, 1)).toBeCloseTo(2.5, 9)
    expect(clockOffsetYears(0.8, timeForOffsetToReach(0.8, 1))).toBeCloseTo(1, 9)
    expect(() => timeForOffsetToReach(0, 1)).toThrow(RangeError)
  })
})

describe('answers, buttons and the preset', () => {
  it('test 9: the nearest-choice helper picks the closest button, and Prediction 1 is "6 years"', () => {
    expect(nearestChoice(CLOCK_CHOICES, 5.2, (c) => c.years).id).toBe('6')
    expect(nearestChoice(CLOCK_CHOICES, 3.1, (c) => c.years).id).toBe('4')
    expect(predictionOneAnswerId()).toBe('6')
  })
  it('Prediction 2 is "yes": the preset gets back before it left', () => {
    expect(predictionTwoAnswer()).toBe(true)
    expect(PRESET_SPEED).toBe(0.8)
    expect(PRESET_TRIP_YEARS).toBe(10)
    expect(PRESET_SEPARATION_LY).toBe(1)
  })
  it('Prediction 2 has a yes and a no button, and the answer button is "yes"', () => {
    expect(BEFORE_CHOICES.map((c) => c.id)).toEqual(['yes', 'no'])
    expect(predictionTwoAnswerId()).toBe('yes')
  })
  it('the control settings give the specified outcomes: 1 light-year closed at 0.8c, not at 0.1c; 1 light-day closed even at 0.1c; 8.589 years at 0.99c', () => {
    const day = SEPARATION_CHOICES_LY[0].ly
    expect(day).toBeCloseTo(0.0027, 4)
    expect(closedPathExists(clockOffsetYears(0.1, 10), day)).toBe(true)
    expect(closedPathExists(clockOffsetYears(0.1, 10), 1)).toBe(false)
    expect(closedPathExists(clockOffsetYears(0.99, 10), 5)).toBe(true)
    expect(closedPathExists(clockOffsetYears(0.5, 10), 5)).toBe(false)
  })
  it('test 10: the module has no state that a prediction could change (the same call gives the same answer)', () => {
    expect(clockOffsetYears(0.8, 10)).toBe(clockOffsetYears(0.8, 10))
    expect(predictionTwoAnswer()).toBe(predictionTwoAnswer())
  })
})

describe('the pictures (every drawn number comes from the module)', () => {
  it('Picture 1: A counts 10 years, B counts 6, the offset is 4, and B turns round 4.5 light-years out after 5.625 years', () => {
    const p = pictureOne()
    expect(p.stayAtHomeYears).toBe(10)
    expect(p.movingYears).toBeCloseTo(6, 9)
    expect(p.offsetYears).toBeCloseTo(4, 9)
    expect(p.farthestLy).toBeCloseTo(4.5, 9)
    expect(p.outYears).toBeCloseTo(5.625, 9)
  })
  it('Picture 1: the out-and-back trip at 0.8c really ends 1 light-year from A and takes 10 years', () => {
    const p = pictureOne()
    const backYears = p.tripYears - p.outYears
    expect(p.speed * p.outYears - p.speed * backYears).toBeCloseTo(p.separationLy, 9)
    expect(p.speed * p.outYears).toBeCloseTo(p.farthestLy, 9)
  })
  it('Picture 2: entry at B (5, 1), exit at A (1, 0), arrival at B (2, 1): 3 years before the entry; a closed loop; entry inside the exit cone', () => {
    const p = pictureTwo()
    expect(p.entry).toEqual({ time: PICTURE_ENTRY_TIME_YEARS, position: 1 })
    expect(p.exit.time).toBeCloseTo(1, 9)
    expect(p.exit.position).toBe(0)
    expect(p.arrival.time).toBeCloseTo(2, 9)
    expect(p.arrival.position).toBe(1)
    expect(p.timeGainedYears).toBeCloseTo(3, 9)
    expect(p.timeGainedYears).toBeCloseTo(timeGainedYears(p.offsetYears, p.separationLy), 9)
    expect(p.closed).toBe(true)
    expect(p.entryInsideExitCone).toBe(true)
  })
  it('Picture 2: the exit is after the start of the machine (time 0)', () => {
    expect(pictureTwo().exit.time).toBeGreaterThan(0)
  })
  it('Picture 3: offset 4 years against light-travel time 1 year, 3 years gained', () => {
    const p = pictureThree()
    expect(p.offsetYears).toBeCloseTo(4, 9)
    expect(p.lightTravelYears).toBe(1)
    expect(p.timeGainedYears).toBeCloseTo(3, 9)
    expect(p.closed).toBe(true)
  })
  it('the guess helpers follow the button: 6 years is 6, "yes" is a marker before', () => {
    expect(clockGuessYears('6')).toBe(6)
    expect(clockGuessYears('2')).toBe(2)
    expect(beforeGuessMarker('yes').before).toBe(true)
    expect(beforeGuessMarker('no').before).toBe(false)
    expect(() => clockGuessYears('7')).toThrow(RangeError)
  })
})

describe('"Now try it yourself": the trial picture for the controls', () => {
  it('the default settings give exactly the real Picture 3 numbers', () => {
    const t = trialPicture(TRIAL_DEFAULT_SPEED, TRIAL_DEFAULT_SEPARATION_LY)
    const p = pictureThree()
    expect(t.offsetYears).toBeCloseTo(p.offsetYears, 12)
    expect(t.lightTravelYears).toBe(p.lightTravelYears)
    expect(t.timeGainedYears).toBeCloseTo(p.timeGainedYears, 12)
    expect(t.closed).toBe(p.closed)
    expect(t.factor).toBeCloseTo(0.6, 12)
  })
  it('settings give the specified outcomes: 0.1c at 1 light-year no; 0.1c at 1 light-day yes; 0.5c at 1 yes and at 3 no; 0.99c at 5 yes', () => {
    expect(trialPicture(0.1, 1).closed).toBe(false)
    expect(trialPicture(0.1, 1).timeGainedYears).toBe(0)
    const day = trialPicture(0.1, 1 / 365.25)
    expect(day.closed).toBe(true)
    expect(day.timeGainedYears).toBeCloseTo(0.0501 - 0.0027, 3)
    expect(trialPicture(0.5, 1).closed).toBe(true)
    expect(trialPicture(0.5, 1).timeGainedYears).toBeCloseTo(0.3397, 3)
    expect(trialPicture(0.5, 3).closed).toBe(false)
    expect(trialPicture(0.99, 5).closed).toBe(true)
    expect(trialPicture(0.99, 5).timeGainedYears).toBeCloseTo(3.589, 3)
  })
  it('every one of the 20 settings: closed exactly when the offset is longer, and the time gained is the difference', () => {
    for (const beta of SPEED_CHOICES) {
      for (const sep of SEPARATION_CHOICES_LY) {
        const t = trialPicture(beta, sep.ly)
        expect(t.closed).toBe(t.offsetYears > t.lightTravelYears)
        expect(t.timeGainedYears).toBeCloseTo(t.closed ? t.offsetYears - t.lightTravelYears : 0, 12)
        expect(t.offsetRulerPosition).toBeGreaterThan(0)
        expect(t.offsetRulerPosition).toBeLessThan(1)
        expect(t.lightRulerPosition).toBeGreaterThan(0)
        expect(t.lightRulerPosition).toBeLessThan(1)
      }
    }
  })
  it('the smallest speed that works: 0.4359 for 1 light-year, 0.866 for 5, and the offset at that speed equals the separation', () => {
    expect(trialPicture(0.8, 1).smallestSpeed).toBeCloseTo(0.4359, 4)
    expect(trialPicture(0.8, 5).smallestSpeed).toBeCloseTo(0.866, 3)
    expect(clockOffsetYears(trialPicture(0.8, 5).smallestSpeed!, 10)).toBeCloseTo(5, 9)
  })
  it('a faster mouth gives a larger offset and a smaller factor, and the log ruler grows with the duration', () => {
    expect(trialPicture(0.9, 1).offsetYears).toBeGreaterThan(trialPicture(0.5, 1).offsetYears)
    expect(trialPicture(0.9, 1).factor).toBeLessThan(trialPicture(0.5, 1).factor)
    expect(durationRulerPosition(DURATION_RULER.minYears)).toBeCloseTo(0, 12)
    expect(durationRulerPosition(DURATION_RULER.maxYears)).toBeCloseTo(1, 12)
    expect(durationRulerPosition(1)).toBeCloseTo(0.75, 12)
  })
  it('friendlyDuration writes years and days in plain words', () => {
    expect(friendlyDuration(1)).toBe('1 year')
    expect(friendlyDuration(4)).toBe('4 years')
    expect(friendlyDuration(8.589)).toBe('8.59 years')
    expect(friendlyDuration(1 / 365.25)).toBe('1 day')
    expect(friendlyDuration(0.0501)).toBe('18 days')
    expect(friendlyDuration(0.0027)).toBe('1 day')
    expect(() => friendlyDuration(0)).toThrow(RangeError)
  })
})

describe('the results: check-up, steps and what has been tested', () => {
  it('compare: within 1 percent is the same, otherwise more or less', () => {
    expect(compare(4, 4)).toBe('the same')
    expect(compare(4.03, 4)).toBe('the same')
    expect(compare(4.1, 4)).toBe('more')
    expect(compare(3.9, 4)).toBe('less')
    expect(() => compare(0, 4)).toThrow(RangeError)
  })
  it('the check-up: the offset by the formula equals the tunnel link\'s jump, and the gain equals the diagram\'s, both "the same"', () => {
    const c = resultsCheckUp()
    expect(c.offsetFormulaYears).toBeCloseTo(4, 9)
    expect(c.offsetFromLinkYears).toBeCloseTo(4, 9)
    expect(c.offsetVersusLink).toBe('the same')
    expect(c.timeGainedYears).toBeCloseTo(3, 9)
    expect(c.gainedFromDiagramYears).toBeCloseTo(3, 9)
    expect(c.gainedVersusDiagram).toBe('the same')
  })
  it('the check-up: B counts 0.6 of A, less; the offset is 4 times the light-travel time, more; and the moving clock is behind', () => {
    const c = resultsCheckUp()
    expect(c.movingOverStayAtHome).toBeCloseTo(0.6, 9)
    expect(c.movingVersusStayAtHome).toBe('less')
    expect(c.offsetOverLight).toBeCloseTo(4, 9)
    expect(c.offsetVersusLight).toBe('more')
    expect(c.movingClockIsBehind).toBe(true)
  })
  it('the steps: 0.8 squared is 0.64, one minus that is 0.36, the factor 0.6, B counts 6, offset 4, gain 3', () => {
    const e = exampleSteps()
    expect(e.speedSquared).toBeCloseTo(0.64, 9)
    expect(e.oneMinusSquared).toBeCloseTo(0.36, 9)
    expect(e.factor).toBeCloseTo(0.6, 9)
    expect(e.tripYears * e.factor).toBeCloseTo(e.movingYears, 9)
    expect(e.offsetYears).toBeCloseTo(4, 9)
    expect(e.timeGainedYears).toBeCloseTo(3, 9)
  })
  it('the table of what has been tested has five rows, only the forward one marked "Measured", and none claims a path back was seen', () => {
    expect(TESTED).toHaveLength(5)
    expect(TESTED.filter((r) => r.status === 'Measured')).toHaveLength(1)
    expect(TESTED[0].idea).toBe('Travel to the future')
    expect(TESTED.filter((r) => r.status === 'Not seen')).toHaveLength(2)
    expect(TESTED.every((r) => r.idea.length > 0 && r.what.length > 0)).toBe(true)
  })
})
