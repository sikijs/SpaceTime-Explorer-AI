import { describe, it, expect } from 'vitest'
import {
  M87_STAR,
  SGR_A_STAR,
  M87_RING_2017_TO_2021,
  KM_PER_PARSEC,
  shadowDiameterKm,
  shadowOverHorizon,
  angularSizeMicroarcsec,
  shadowAngleMicroarcsec,
  realShadowMicroarcsec,
  massRatio,
  distanceRatio,
  calculatedSizeRatio,
  measuredSizeRatio,
  compareWithMeasured,
  checkRealBlackHole,
  SIZE_CHOICES,
  sizeAnswer,
  sizeChoiceRatio,
  sizeGuessResult,
  HORIZON_CHOICES,
  horizonAnswer,
  horizonGuessResult,
  guessShadowDiameterKm,
  pictureOne,
  horizonAngleMicroarcsec,
  ratioRulerPosition,
  sizeGuessMarker,
  pictureTwo,
  horizonGuessMarker,
  PICTURE_TWO_BEAM_AIMS,
  PICTURE_TWO_VIEW_RADIUS,
  TRIAL_MASS_CHOICES_SOLAR,
  TRIAL_DISTANCE_CHOICES_PC,
  TRIAL_RULER_MIN_MICROARCSEC,
  TRIAL_RULER_MAX_MICROARCSEC,
  trialRulerPosition,
  trialPicture,
} from './blackHoleShadow'
import { horizonRadiusKm } from './blackHoleSizeExperiment'

const G = 6.6743e-11
const C = 299792458
const SUN = 1.98847e30

describe('the shadow diameter', () => {
  it('is 6 sqrt(3) G M / c^2, worked out separately in SI units', () => {
    for (const m of [10, 4e6, 6.5e9]) {
      const gmOverC2Km = (G * m * SUN) / (C * C) / 1000
      expect(shadowDiameterKm(m) / (6 * Math.sqrt(3) * gmOverC2Km)).toBeCloseTo(1, 3)
    }
  })
  it('is 2.598 times the horizon diameter for any mass', () => {
    for (const m of [1, 30, 4e6, 6.5e9]) {
      expect(shadowDiameterKm(m) / (2 * horizonRadiusKm(m))).toBeCloseTo(3 * Math.sqrt(3) / 2, 9)
    }
    expect(shadowOverHorizon()).toBeCloseTo(2.598076, 5)
  })
  it('rejects a mass that is not positive and finite', () => {
    expect(() => shadowDiameterKm(0)).toThrow(RangeError)
    expect(() => shadowDiameterKm(-1)).toThrow(RangeError)
    expect(() => shadowDiameterKm(Infinity)).toThrow(RangeError)
  })
})

describe('the angle in the sky', () => {
  it('gives about 39.7 microarcseconds for M87* and 50.35 for Sagittarius A*', () => {
    expect(realShadowMicroarcsec(M87_STAR)).toBeCloseTo(39.7, 1)
    expect(realShadowMicroarcsec(SGR_A_STAR)).toBeCloseTo(50.35, 1)
  })
  it('is proportional to the mass and inversely proportional to the distance', () => {
    const base = shadowAngleMicroarcsec(1e6, 1e4)
    expect(shadowAngleMicroarcsec(2e6, 1e4) / base).toBeCloseTo(2, 9)
    expect(shadowAngleMicroarcsec(1e6, 2e4) / base).toBeCloseTo(0.5, 9)
  })
  it('turns a width and a distance into an angle (1 AU at 1 parsec is 1 arcsecond)', () => {
    const au = 149597870.7
    expect(angularSizeMicroarcsec(au, KM_PER_PARSEC)).toBeCloseTo(1e6, -1)
  })
  it('rejects a distance that is not positive', () => {
    expect(() => shadowAngleMicroarcsec(1e6, 0)).toThrow(RangeError)
    expect(() => angularSizeMicroarcsec(1, -1)).toThrow(RangeError)
  })
})

describe('the two real black holes', () => {
  it('has the mass ratio 1,625 and the distance ratio about 2,061', () => {
    expect(massRatio()).toBeCloseTo(1625, 6)
    expect(distanceRatio()).toBeCloseTo(16.8e6 / 8.15e3, 6)
    expect(distanceRatio()).toBeGreaterThan(2060)
    expect(distanceRatio()).toBeLessThan(2062)
  })
  it('has the calculated size ratio equal to mass ratio over distance ratio, about 0.79', () => {
    expect(calculatedSizeRatio()).toBeCloseTo(massRatio() / distanceRatio(), 9)
    expect(calculatedSizeRatio()).toBeCloseTo(0.788, 2)
    expect(calculatedSizeRatio()).toBeLessThan(1)
  })
  it('has measured rings with a ratio below 1 as well (0.81 with 42, 0.85 with 43.9)', () => {
    expect(measuredSizeRatio()).toBeCloseTo(42 / 51.8, 9)
    expect(measuredSizeRatio(true)).toBeCloseTo(43.9 / 51.8, 9)
    expect(measuredSizeRatio(true)).toBeLessThan(1)
  })
  it('holds the published values as given', () => {
    expect(M87_STAR.ringMicroarcsec).toBe(42)
    expect(M87_STAR.ringUncertainty).toBe(3)
    expect(M87_RING_2017_TO_2021).toEqual({ ringMicroarcsec: 43.9, ringUncertainty: 0.6 })
    expect(SGR_A_STAR.ringMicroarcsec).toBe(51.8)
    expect(SGR_A_STAR.ringUncertainty).toBe(2.3)
    expect(M87_STAR.massSolar).toBe(6.5e9)
    expect(SGR_A_STAR.massSolar).toBe(4.0e6)
    expect(M87_STAR.distancePc).toBe(16.8e6)
    expect(SGR_A_STAR.distancePc).toBe(8.15e3)
  })
})

describe('calculated against measured', () => {
  it('reports the difference in microarcseconds, percent and uncertainties', () => {
    const c = compareWithMeasured(50, 40, 5)
    expect(c.differenceMicroarcsec).toBe(10)
    expect(c.differencePercent).toBe(25)
    expect(c.differenceInUncertainties).toBe(2)
    expect(c.withinOneUncertainty).toBe(false)
    const d = compareWithMeasured(38, 40, 5)
    expect(d.differenceMicroarcsec).toBe(-2)
    expect(d.differencePercent).toBe(-5)
    expect(d.differenceInUncertainties).toBeCloseTo(-0.4, 12)
    expect(d.withinOneUncertainty).toBe(true)
  })
  it('puts the calculated M87* shadow below the 2019 ring by about 2.3 microarcseconds, within its 3', () => {
    const c = checkRealBlackHole(M87_STAR)
    expect(c.differenceMicroarcsec).toBeCloseTo(39.7 - 42, 1)
    expect(c.withinOneUncertainty).toBe(true)
  })
  it('puts it about 4.2 below the later 43.9 ring, which is many more of its small uncertainty', () => {
    const c = checkRealBlackHole(M87_STAR, true)
    expect(c.differenceMicroarcsec).toBeCloseTo(39.7 - 43.9, 1)
    expect(c.differenceInUncertainties).toBeLessThan(-5)
    expect(c.withinOneUncertainty).toBe(false)
  })
  it('puts the calculated Sagittarius A* shadow about 1.5 below its ring, within its 2.3', () => {
    const c = checkRealBlackHole(SGR_A_STAR)
    expect(c.differenceMicroarcsec).toBeCloseTo(50.35 - 51.8, 1)
    expect(c.withinOneUncertainty).toBe(true)
  })
  it('rejects a measured value or uncertainty that is not positive', () => {
    expect(() => compareWithMeasured(1, 0, 1)).toThrow(RangeError)
    expect(() => compareWithMeasured(1, 1, 0)).toThrow(RangeError)
  })
})

describe('the predictions', () => {
  it('answers Prediction 1 with "a little smaller"', () => {
    expect(sizeAnswer()).toBe('a-little-smaller')
    expect(sizeGuessResult('a-little-smaller')).toBe('matched')
    expect(sizeGuessResult('much-bigger')).toBe('not matched')
    expect(sizeGuessResult('about-the-same')).toBe('not matched')
  })
  it('has Prediction 1 buttons balanced about 1 on a log scale, two on each side and one at 1', () => {
    const logs = SIZE_CHOICES.map((c) => Math.log(c.ratio))
    expect(logs.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 12)
    expect(sizeChoiceRatio('about-the-same')).toBe(1)
    expect(() => sizeChoiceRatio('nonsense' as never)).toThrow(RangeError)
  })
  it('answers Prediction 2 with the button nearest 2.6, which is 3', () => {
    expect(horizonAnswer()).toBe(3)
    expect(horizonGuessResult(3)).toBe('matched')
    for (const c of HORIZON_CHOICES.filter((x) => x !== 3)) expect(horizonGuessResult(c)).toBe('not matched')
  })
  it('draws a guess as a shadow that is that many times the horizon diameter', () => {
    expect(guessShadowDiameterKm(10, 1)).toBeCloseTo(2 * horizonRadiusKm(10), 9)
    expect(guessShadowDiameterKm(10, 3)).toBeCloseTo(6 * horizonRadiusKm(10), 9)
    expect(guessShadowDiameterKm(10, 3)).not.toBeCloseTo(shadowDiameterKm(10), 3)
    expect(() => guessShadowDiameterKm(10, 0)).toThrow(RangeError)
  })
  it('does not depend on any guess (the real results are fixed)', () => {
    const before = [realShadowMicroarcsec(M87_STAR), realShadowMicroarcsec(SGR_A_STAR), calculatedSizeRatio()]
    sizeGuessResult('much-smaller')
    horizonGuessResult(10)
    guessShadowDiameterKm(1, 10)
    expect([realShadowMicroarcsec(M87_STAR), realShadowMicroarcsec(SGR_A_STAR), calculatedSizeRatio()]).toEqual(before)
  })
})

describe('Picture 1', () => {
  it('has the horizon 1 / 2.598 of the shadow in the sky for any black hole, about 15.3 and 19.4 microarcseconds', () => {
    const pic = pictureOne()
    for (const r of pic.rows) expect(r.shadowMicroarcsec / r.horizonMicroarcsec).toBeCloseTo(3 * Math.sqrt(3) / 2, 9)
    expect(pic.rows[0].horizonMicroarcsec).toBeCloseTo(19.38, 1)
    expect(pic.rows[1].horizonMicroarcsec).toBeCloseTo(15.28, 1)
    expect(horizonAngleMicroarcsec(1e6, 1e4)).toBeCloseTo(angularSizeMicroarcsec(2 * horizonRadiusKm(1e6), 1e4 * KM_PER_PARSEC), 9)
  })
  it('lists Sagittarius A* first and M87* second, with the real data and ratios', () => {
    const pic = pictureOne()
    expect(pic.rows.map((r) => r.id)).toEqual(['sgrA', 'm87'])
    expect(pic.rows[0].ringMicroarcsec).toBe(51.8)
    expect(pic.rows[1].ringMicroarcsec).toBe(42)
    expect(pic.rows[0].shadowMicroarcsec).toBeCloseTo(realShadowMicroarcsec(SGR_A_STAR), 12)
    expect(pic.calculatedRatio).toBeCloseTo(0.788, 2)
    expect(pic.measuredRatio).toBeCloseTo(0.811, 2)
  })
  it('fits both rings and their bands inside the 0 to 60 microarcsecond axis', () => {
    const pic = pictureOne()
    for (const r of pic.rows) {
      expect(r.ringMicroarcsec + r.ringUncertainty).toBeLessThan(pic.axisMaxMicroarcsec)
      expect(r.shadowMicroarcsec).toBeLessThan(pic.axisMaxMicroarcsec)
    }
    expect(pic.barMicroarcsec).toBe(10)
  })
  it('puts ratios on a log ruler from 0.1 to 10: 1 in the middle, the ends at 0 and 1', () => {
    expect(ratioRulerPosition(0.1)).toBeCloseTo(0, 12)
    expect(ratioRulerPosition(1)).toBeCloseTo(0.5, 12)
    expect(ratioRulerPosition(10)).toBeCloseTo(1, 12)
    expect(ratioRulerPosition(2) - 0.5).toBeCloseTo(0.5 - ratioRulerPosition(0.5), 12)
    expect(ratioRulerPosition(1000)).toBe(1)
    expect(() => ratioRulerPosition(0)).toThrow(RangeError)
  })
  it('puts each guess where its ratio is, and a different guess in a different place', () => {
    const positions = SIZE_CHOICES.map((c) => sizeGuessMarker(c.id).position)
    expect(positions).toEqual([...positions].sort((a, b) => b - a))
    expect(new Set(positions).size).toBe(5)
    expect(sizeGuessMarker('about-the-same').position).toBeCloseTo(0.5, 12)
    expect(sizeGuessMarker('a-little-smaller').ratio).toBeCloseTo(1 / 1.5, 12)
  })
  it('puts the calculated and measured ratios close together on the ruler, between "a little smaller" and "about the same"', () => {
    const pic = pictureOne()
    const calc = ratioRulerPosition(pic.calculatedRatio)
    expect(calc).toBeLessThan(sizeGuessMarker('about-the-same').position)
    expect(calc).toBeGreaterThan(sizeGuessMarker('a-little-smaller').position)
    expect(Math.abs(calc - ratioRulerPosition(pic.measuredRatio))).toBeLessThan(0.02)
  })
})

describe('Picture 2', () => {
  it('captures the beams aimed inside 2.598 horizon radii and lets the others escape', () => {
    const pic = pictureTwo()
    expect(pic.beams.map((b) => b.aim)).toEqual([...PICTURE_TWO_BEAM_AIMS])
    for (const b of pic.beams) expect(b.outcome).toBe(b.aim < pic.shadowRadius ? 'captured' : 'escapes')
    expect(pic.beams.filter((b) => b.outcome === 'captured').length).toBe(3)
    expect(pic.beams.filter((b) => b.outcome === 'escapes').length).toBe(4)
  })
  it('has the shadow radius equal to 3 sqrt(3) / 2 and 2.598 times the edge radius of 1', () => {
    const pic = pictureTwo()
    expect(pic.shadowRadius).toBeCloseTo(3 * Math.sqrt(3) / 2, 12)
    expect(pic.shadowOverHorizon).toBeCloseTo(2.598076, 5)
    expect(pic.horizonRadius).toBe(1)
  })
  it('bends the beam aimed at 2.7 by about 167 degrees (Black Holes Experiment 4) and gives no bend for a captured beam', () => {
    const pic = pictureTwo()
    const b27 = pic.beams.find((b) => b.aim === 2.7)!
    expect(b27.bendDegrees).toBeCloseTo(167.27, 0)
    for (const b of pic.beams.filter((x) => x.outcome === 'captured')) expect(b.bendDegrees).toBeNull()
  })
  it('bends the beams less the further out they are aimed', () => {
    const bends = pictureTwo().beams.filter((b) => b.outcome === 'escapes').map((b) => b.bendDegrees as number)
    expect(bends).toEqual([...bends].sort((a, b) => b - a))
  })
  it('keeps each path inside (or just at) the view, and ends captured beams at the edge', () => {
    const pic = pictureTwo()
    for (const b of pic.beams) {
      for (const p of b.points.slice(1)) expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(PICTURE_TWO_VIEW_RADIUS + 0.5)
      expect(b.points.length).toBeGreaterThan(5)
      if (b.outcome === 'captured') {
        const end = b.points[b.points.length - 1]
        expect(Math.hypot(end.x, end.y)).toBeCloseTo(1, 6)
      }
    }
  })
  it('draws each guess as a circle with that many horizon radii, and the biggest guess fits in the view', () => {
    for (const c of HORIZON_CHOICES) {
      expect(horizonGuessMarker(c).radiusInHorizonRadii).toBe(c)
      expect(horizonGuessMarker(c).radiusInHorizonRadii).toBeLessThanOrEqual(PICTURE_TWO_VIEW_RADIUS)
    }
    expect(horizonGuessMarker(3).radiusInHorizonRadii).not.toBeCloseTo(pictureTwo().shadowRadius, 1)
  })
})

describe('Part 2: a trial black hole (Step 6)', () => {
  it('gives the real shadow when the trial values are a real black hole\'s own', () => {
    for (const bh of [SGR_A_STAR, M87_STAR]) {
      const t = trialPicture(bh.massSolar, bh.distancePc)
      expect(t.shadowMicroarcsec).toBeCloseTo(realShadowMicroarcsec(bh), 9)
      expect(t.sameAs).toBe(bh.id)
    }
    expect(trialPicture(1e8, 8150).sameAs).toBeNull()
    expect(trialPicture(4e6, 1e6).sameAs).toBeNull()
  })
  it('doubles the angle when the mass doubles and halves it when the distance doubles', () => {
    const base = trialPicture(1e8, 1e5).shadowMicroarcsec
    expect(trialPicture(2e8, 1e5).shadowMicroarcsec / base).toBeCloseTo(2, 9)
    expect(trialPicture(1e8, 2e5).shadowMicroarcsec / base).toBeCloseTo(0.5, 9)
  })
  it('keeps the shadow 2.598 times as wide in the sky as the horizon, for any trial', () => {
    for (const m of TRIAL_MASS_CHOICES_SOLAR) {
      for (const d of TRIAL_DISTANCE_CHOICES_PC) {
        const t = trialPicture(m, d)
        expect(t.shadowMicroarcsec / t.horizonMicroarcsec).toBeCloseTo(3 * Math.sqrt(3) / 2, 9)
      }
    }
  })
  it('matches a separate calculation in SI units for one trial (100 million Suns at 1 Mpc)', () => {
    const km = (6 * Math.sqrt(3) * G * 1e8 * SUN) / (C * C) / 1000
    const rad = km / (1e6 * KM_PER_PARSEC)
    expect(trialPicture(1e8, 1e6).shadowMicroarcsec / (rad * (180 / Math.PI) * 3600 * 1e6)).toBeCloseTo(1, 3)
  })
  it('reports the trial against Sagittarius A* and M87*, and the real marks never move with the trial', () => {
    const a = trialPicture(4e6, 8150)
    expect(a.shadowOverSgrA).toBeCloseTo(1, 9)
    expect(a.massOverSgrA).toBeCloseTo(1, 9)
    expect(a.distanceOverSgrA).toBeCloseTo(1, 9)
    const b = trialPicture(6.5e9, 16.8e6)
    expect(b.shadowOverM87).toBeCloseTo(1, 9)
    expect(b.shadowOverSgrA).toBeCloseTo(calculatedSizeRatio(), 9)
    const far = trialPicture(1e8, 1e6)
    expect(far.massOverSgrA).toBeCloseTo(25, 9)
    expect(far.distanceOverSgrA).toBeCloseTo(1e6 / 8150, 9)
    const c = trialPicture(1e9, 1e5)
    expect(c.realMarks).toEqual(a.realMarks)
    expect(c.realMarks[0].shadowMicroarcsec).toBeCloseTo(realShadowMicroarcsec(SGR_A_STAR), 9)
  })
  it('puts every possible trial on the ruler, with a heavier or nearer black hole further right', () => {
    for (const m of TRIAL_MASS_CHOICES_SOLAR) {
      for (const d of TRIAL_DISTANCE_CHOICES_PC) {
        const t = trialPicture(m, d)
        expect(t.shadowMicroarcsec).toBeGreaterThan(TRIAL_RULER_MIN_MICROARCSEC)
        expect(t.shadowMicroarcsec).toBeLessThan(TRIAL_RULER_MAX_MICROARCSEC)
        expect(t.horizonPosition).toBeLessThan(t.shadowPosition)
      }
    }
    expect(trialRulerPosition(10)).toBeGreaterThan(trialRulerPosition(1))
    expect(trialRulerPosition(TRIAL_RULER_MIN_MICROARCSEC)).toBe(0)
    expect(trialRulerPosition(TRIAL_RULER_MAX_MICROARCSEC)).toBe(1)
    expect(trialRulerPosition(1)).toBeCloseTo(2 / 7, 9)
    expect(trialPicture(1e9, 1e5).shadowPosition).toBeGreaterThan(trialPicture(1e8, 1e5).shadowPosition)
    expect(trialPicture(1e8, 1e5).shadowPosition).toBeGreaterThan(trialPicture(1e8, 1e6).shadowPosition)
  })
  it('rejects a trial that is not positive and finite', () => {
    expect(() => trialPicture(0, 1e5)).toThrow(RangeError)
    expect(() => trialPicture(1e8, -1)).toThrow(RangeError)
    expect(() => trialRulerPosition(0)).toThrow(RangeError)
  })
})
