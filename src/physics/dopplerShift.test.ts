import { describe, it, expect } from 'vitest'
import {
  everydayFrequencyFactorOf,
  frequencyFactorFromTravelerAngle,
  frequencyFactorOf,
  labCrossingAngle,
  rangeOf,
  runDoppler,
  travelerCrossingAngle,
  wavelengthNm,
} from './dopplerShift'
import { rayAsMeasuredByTraveler, travelerAngleOf } from './aberration'
import { dopplerFactorFor } from './gravitationalWaveRedshiftExperiment'

// Tests for Experiment 8 (docs/experiments/spacetime-geometry/08-doppler-shift.md, "Required Physics Tests"). The numbers in the
// tables of the specification are written out here by hand, so a wrong formula in the module cannot make a test pass.

const SPEEDS = [0.3, 0.6, 0.9, 0.99]
const LAB_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]
const dilation = (speed: number) => Math.sqrt(1 - speed * speed)

describe('speed 0 changes nothing (test 1)', () => {
  it('has factor 1 at every angle, on both sides of the line of travel', () => {
    for (const angle of [...LAB_ANGLES, 195, 270, 345]) {
      expect(frequencyFactorOf(angle, 0)).toBe(1)
      expect(everydayFrequencyFactorOf(angle, 0)).toBe(1)
    }
  })
})

describe('the three routes to the same factor (tests 2 and 3)', () => {
  it('the lab-angle form equals the traveler-angle form for the same star', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        const viaTraveler = frequencyFactorFromTravelerAngle(travelerAngleOf(angle, speed), speed)
        expect(viaTraveler).toBeCloseTo(frequencyFactorOf(angle, speed), 7)
      }
    }
  })

  it('equals the energy of the ray as the traveler measures it (the energy-and-momentum route of Experiment 5)', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(rayAsMeasuredByTraveler(angle, speed).energy).toBeCloseTo(frequencyFactorOf(angle, speed), 9)
      }
    }
  })
})

describe('straight ahead and straight behind (test 4)', () => {
  const ahead = [1.363, 2.0, 4.359, 14.107]
  const behind = [0.734, 0.5, 0.229, 0.071]
  it('has (1 + β) ÷ D straight ahead and (1 − β) ÷ D straight behind, as in the specification table', () => {
    SPEEDS.forEach((speed, i) => {
      expect(frequencyFactorOf(0, speed)).toBeCloseTo(ahead[i], 3)
      expect(frequencyFactorOf(180, speed)).toBeCloseTo(behind[i], 3)
      expect(frequencyFactorOf(0, speed)).toBeCloseTo((1 + speed) / dilation(speed), 9)
      expect(frequencyFactorOf(180, speed)).toBeCloseTo((1 - speed) / dilation(speed), 9)
    })
  })

  it('the factor straight behind is the receding-source factor of Gravitational Waves Experiment 5', () => {
    for (const speed of SPEEDS) {
      expect(frequencyFactorOf(180, speed)).toBeCloseTo(dopplerFactorFor(speed), 9)
    }
  })
})

describe('the sideways star (test 5)', () => {
  const expected = [1.048, 1.25, 2.294, 7.089]
  it('has factor 1 ÷ D, while the everyday factor is exactly 1', () => {
    SPEEDS.forEach((speed, i) => {
      expect(frequencyFactorOf(90, speed)).toBeCloseTo(expected[i], 3)
      expect(frequencyFactorOf(90, speed)).toBeCloseTo(1 / dilation(speed), 9)
      expect(everydayFrequencyFactorOf(90, speed)).toBe(1)
    })
  })
})

describe('the factor falls steadily as the angle rises (test 6)', () => {
  it('is strictly lower at every larger angle from 0 to 180 degrees', () => {
    for (const speed of SPEEDS) {
      for (let i = 1; i < LAB_ANGLES.length; i += 1) {
        expect(frequencyFactorOf(LAB_ANGLES[i], speed)).toBeLessThan(frequencyFactorOf(LAB_ANGLES[i - 1], speed))
      }
    }
  })
})

describe('the table of factors (test 7)', () => {
  // Written out by hand from the specification, for lab angles 0, 30, 60, 90, 120, 150, 180.
  const table: Record<number, number[]> = {
    0.3: [1.363, 1.321, 1.206, 1.048, 0.891, 0.776, 0.734],
    0.6: [2.0, 1.9, 1.625, 1.25, 0.875, 0.6, 0.5],
    0.9: [4.359, 4.082, 3.327, 2.294, 1.262, 0.506, 0.229],
    0.99: [14.107, 13.167, 10.598, 7.089, 3.58, 1.011, 0.071],
  }
  it('matches the specification to three decimal places', () => {
    for (const speed of SPEEDS) {
      ;[0, 30, 60, 90, 120, 150, 180].forEach((angle, i) => {
        expect(frequencyFactorOf(angle, speed)).toBeCloseTo(table[speed][i], 3)
      })
    }
  })
})

describe('where blue turns to red (test 8)', () => {
  it('is at 98.8, 109.5, 128.8 and 150.2 degrees in the lab’s sky', () => {
    const expected = [98.8, 109.5, 128.8, 150.2]
    SPEEDS.forEach((speed, i) => expect(labCrossingAngle(speed) as number).toBeCloseTo(expected[i], 1))
  })

  it('is ahead of sideways in the traveler’s sky, at arccos((1 − D) ÷ β), and the factor is 1 there', () => {
    const expected = [Math.acos((1 - dilation(0.3)) / 0.3), Math.acos((1 - dilation(0.6)) / 0.6), Math.acos((1 - dilation(0.9)) / 0.9), Math.acos((1 - dilation(0.99)) / 0.99)]
    SPEEDS.forEach((speed, i) => {
      const angle = travelerCrossingAngle(speed) as number
      expect(angle).toBeLessThan(90)
      expect(angle).toBeCloseTo((expected[i] * 180) / Math.PI, 9)
      expect(frequencyFactorFromTravelerAngle(angle, speed)).toBeCloseTo(1, 9)
      expect(frequencyFactorOf(labCrossingAngle(speed) as number, speed)).toBeCloseTo(1, 9)
      // 70.5 degrees at 0.6c, from the specification's worked example
    })
    expect(travelerCrossingAngle(0.6) as number).toBeCloseTo(70.5, 1)
  })

  it('is null at speed 0, where there is no shift', () => {
    expect(labCrossingAngle(0)).toBeNull()
    expect(travelerCrossingAngle(0)).toBeNull()
  })
})

describe('the ring of 24 stars (test 9)', () => {
  it('has 13, 15, 17 and 21 stars shifted toward blue and 11, 9, 7 and 3 toward red', () => {
    const blue = [13, 15, 17, 21]
    const red = [11, 9, 7, 3]
    SPEEDS.forEach((speed, i) => {
      const result = runDoppler(speed)
      expect(result.stars).toHaveLength(24)
      expect(result.towardBlueCount).toBe(blue[i])
      expect(result.towardRedCount).toBe(red[i])
    })
  })

  it('has no shift at all for the lab itself (speed 0): all 24 stars at factor 1', () => {
    const result = runDoppler(0)
    expect(result.towardBlueCount).toBe(0)
    expect(result.towardRedCount).toBe(0)
    result.stars.forEach((star) => expect(star.factor).toBe(1))
  })
})

describe('relativistic = everyday ÷ D (test 10)', () => {
  it('holds at every angle and speed', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(frequencyFactorOf(angle, speed)).toBeCloseTo(everydayFrequencyFactorOf(angle, speed) / dilation(speed), 9)
      }
    }
  })

  it('gives the everyday numbers of the specification at 0.6c: 1.6 ahead, 1.0 sideways, 0.4 behind', () => {
    expect(everydayFrequencyFactorOf(0, 0.6)).toBeCloseTo(1.6, 12)
    expect(everydayFrequencyFactorOf(90, 0.6)).toBeCloseTo(1, 12)
    expect(everydayFrequencyFactorOf(180, 0.6)).toBeCloseTo(0.4, 12)
  })
})

describe('wavelength and range (test 11)', () => {
  it('has the wavelengths of the specification for a 550-nanometre source', () => {
    const ahead = [404, 275, 126, 39]
    const sideways = [525, 440, 240, 78]
    const behind = [750, 1100, 2397, 7759]
    SPEEDS.forEach((speed, i) => {
      const result = runDoppler(speed)
      expect(result.stars[0].wavelengthNm).toBeCloseTo(ahead[i], 0)
      expect(result.stars[6].wavelengthNm).toBeCloseTo(sideways[i], 0)
      expect(result.stars[12].wavelengthNm).toBeCloseTo(behind[i], 0)
    })
  })

  it('divides the wavelength by the factor', () => {
    expect(wavelengthNm(550, 2)).toBe(275)
    expect(wavelengthNm(550, 0.5)).toBe(1100)
  })

  it('includes both ends of the visible range at 400 and 700 nanometres', () => {
    expect(rangeOf(399.9)).toBe('ultraviolet')
    expect(rangeOf(400)).toBe('visible')
    expect(rangeOf(550)).toBe('visible')
    expect(rangeOf(700)).toBe('visible')
    expect(rangeOf(700.1)).toBe('infrared')
  })

  it('puts the 0.6c stars straight ahead in the ultraviolet and straight behind in the infrared, and the sideways one in the visible', () => {
    const result = runDoppler(0.6)
    expect(result.stars[0].range).toBe('ultraviolet')
    expect(result.stars[6].range).toBe('visible')
    expect(result.stars[12].range).toBe('infrared')
  })
})

describe('symmetry above and below the line of travel (test 12)', () => {
  it('gives the same factor for θ and 360 − θ', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(frequencyFactorOf(360 - angle, speed)).toBeCloseTo(frequencyFactorOf(angle, speed), 12)
      }
    }
  })
})

describe('out-of-range inputs (test 13)', () => {
  it('throws a RangeError for a speed below 0 or at or above c', () => {
    for (const bad of [-0.1, 1, 1.5, Number.NaN]) {
      expect(() => frequencyFactorOf(90, bad)).toThrow(RangeError)
      expect(() => frequencyFactorFromTravelerAngle(90, bad)).toThrow(RangeError)
      expect(() => everydayFrequencyFactorOf(90, bad)).toThrow(RangeError)
      expect(() => runDoppler(bad)).toThrow(RangeError)
      expect(() => labCrossingAngle(bad)).toThrow(RangeError)
    }
  })

  it('throws a RangeError for a non-positive wavelength or factor', () => {
    expect(() => wavelengthNm(0, 1)).toThrow(RangeError)
    expect(() => wavelengthNm(550, 0)).toThrow(RangeError)
    expect(() => rangeOf(-5)).toThrow(RangeError)
    expect(() => runDoppler(0.6, 0)).toThrow(RangeError)
  })

  it('throws a RangeError for an angle that is not a number', () => {
    expect(() => frequencyFactorOf(Number.NaN, 0.6)).toThrow(RangeError)
  })
})

describe('every star has a positive factor', () => {
  it('has a positive factor for every star at every speed', () => {
    for (const speed of SPEEDS) {
      runDoppler(speed).stars.forEach((star) => expect(star.factor).toBeGreaterThan(0))
    }
  })
})
