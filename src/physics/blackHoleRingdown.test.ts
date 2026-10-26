import { describe, it, expect } from 'vitest'
import {
  compareWithMeasured,
  dimensionlessPitch,
  detectedDampingTimeMs,
  detectedFrequencyHz,
  GW250114_RINGDOWN,
  gw250114Ringing,
  lightCrossingTimeS,
  MASS_CHOICES_SOLAR,
  pitchAnswer,
  pitchMarker,
  qualityFactor,
  comparisonRows,
  FASTER_SPIN,
  SECOND_TONE_SIGNIFICANCE,
  MASS_PICTURE_AXES,
  pitchGuessMark,
  pitchMassPicture,
  pitchSpinPicture,
  ringdownWaveform,
  ringing,
  ringingPicture,
  RINGING_AXIS_MS,
  SPIN_CHOICES,
  SWINGS_AXIS,
  SWINGS_CHOICES,
  swingsAnswer,
  swingsGuessBar,
  swingsPicture,
  swingsPosition,
  TRIAL_WAVE_SWINGS,
  trialRinging,
  checkUp,
  massTable,
  pitchGuessResult,
  ringingWorked,
  swingsGuessGap,
  spinTable,
} from './blackHoleRingdown'

// A separate calculation with the constants written out (CODATA G, c and the nominal solar mass GM = 1.32712440018e20 m^3/s^2).
const TM_PER_SUN_S = 1.32712440018e20 / 299792458 ** 3 // 4.9255e-6 s
function fitHz(massSolar: number, chi: number) {
  return (1.5251 - 1.1568 * (1 - chi) ** 0.1292) / (2 * Math.PI * massSolar * TM_PER_SUN_S)
}

describe('the light-crossing time G M / c^3', () => {
  it('is 4.9255 microseconds for one Sun and scales with the mass', () => {
    expect(lightCrossingTimeS(1)).toBeCloseTo(TM_PER_SUN_S, 10)
    expect(lightCrossingTimeS(62.7) / lightCrossingTimeS(1)).toBeCloseTo(62.7, 9)
  })
  it('rejects a mass that is not positive and finite', () => {
    expect(() => lightCrossingTimeS(0)).toThrow(RangeError)
    expect(() => lightCrossingTimeS(-1)).toThrow(RangeError)
    expect(() => lightCrossingTimeS(Infinity)).toThrow(RangeError)
  })
})

describe('the ringing of one black hole (the specification\'s numbers)', () => {
  it('is about 271.4 Hz and 3.76 ms for 62.7 Suns at spin 0.68, in the black hole\'s own frame', () => {
    const r = ringing(62.7, 0.68)
    expect(r.frequencyHz).toBeCloseTo(271.4, 0)
    expect(r.frequencyHz).toBeCloseTo(fitHz(62.7, 0.68), 3)
    expect(r.quality).toBeCloseTo(3.206, 2)
    expect(r.dampingTimeMs).toBeCloseTo(3.76, 2)
  })
  it('fades in about one swing at spin 0.68 (Q / pi)', () => {
    expect(ringing(62.7, 0.68).swingsToFade).toBeCloseTo(1.02, 2)
  })
  it('has a fade time equal to the quality factor over pi times the frequency', () => {
    const r = ringing(30, 0.5)
    expect((r.quality / (Math.PI * r.frequencyHz)) * 1000).toBeCloseTo(r.dampingTimeMs, 9)
    expect(r.swingsToFade).toBeCloseTo((r.frequencyHz * r.dampingTimeMs) / 1000, 9)
  })
  it('gives the trial examples: 10 Suns 1,702 Hz, 100 Suns 170 Hz, spin 0 190 Hz, spin 0.9 343 Hz', () => {
    expect(ringing(10, 0.68).frequencyHz).toBeCloseTo(1701.8, 0)
    expect(ringing(100, 0.68).frequencyHz).toBeCloseTo(170.2, 0)
    expect(ringing(62.7, 0).frequencyHz).toBeCloseTo(189.8, 0)
    expect(ringing(62.7, 0.9).frequencyHz).toBeCloseTo(343.2, 0)
  })
  it('matches a separate calculation at every mass and spin choice', () => {
    for (const m of MASS_CHOICES_SOLAR) {
      for (const s of SPIN_CHOICES) {
        // The project's G (in kpc units) differs from CODATA's in the sixth digit, so five digits are compared.
        expect(ringing(m, s).frequencyHz / fitHz(m, s)).toBeCloseTo(1, 5)
      }
    }
  })
})

describe('how the pitch depends on mass and spin', () => {
  it('halves when the mass doubles (pitch times mass is fixed for a given spin)', () => {
    expect(ringing(20, 0.68).frequencyHz / ringing(40, 0.68).frequencyHz).toBeCloseTo(2, 9)
    expect(ringing(25, 0.3).frequencyHz * 25).toBeCloseTo(ringing(80, 0.3).frequencyHz * 80, 6)
  })
  it('rises with spin at a fixed mass', () => {
    let last = 0
    for (const s of SPIN_CHOICES) {
      const f = ringing(62.7, s).frequencyHz
      expect(f).toBeGreaterThan(last)
      last = f
    }
  })
  it('makes the ringing last longer (in time and in swings) with spin', () => {
    let lastT = 0
    let lastQ = 0
    for (const s of SPIN_CHOICES) {
      const r = ringing(62.7, s)
      expect(r.dampingTimeMs).toBeGreaterThan(lastT)
      expect(r.quality).toBeGreaterThan(lastQ)
      lastT = r.dampingTimeMs
      lastQ = r.quality
    }
  })
  it('lengthens the fade time in proportion to the mass, at a fixed spin, while the number of swings stays the same', () => {
    const a = ringing(10, 0.68)
    const b = ringing(100, 0.68)
    expect(b.dampingTimeMs / a.dampingTimeMs).toBeCloseTo(10, 9)
    expect(b.swingsToFade).toBeCloseTo(a.swingsToFade, 12)
  })
  it('does not depend on the mass for the dimensionless pitch and Q', () => {
    expect(dimensionlessPitch(0.68)).toBeCloseTo(0.5267, 3)
    expect(qualityFactor(0)).toBeCloseTo(2.1187, 3)
  })
  it('rejects a spin outside 0 up to, but not including, 1', () => {
    expect(() => ringing(10, -0.1)).toThrow(RangeError)
    expect(() => ringing(10, 1)).toThrow(RangeError)
    expect(() => ringing(10, NaN)).toThrow(RangeError)
  })
})

describe('what the detectors record (the redshift stretch)', () => {
  it('divides the pitch and multiplies the times by 1 + z', () => {
    expect(detectedFrequencyHz(300, 0.1)).toBeCloseTo(300 / 1.1, 12)
    expect(detectedDampingTimeMs(4, 0.1)).toBeCloseTo(4.4, 12)
  })
  it('gives GW250114 249.0 Hz and 4.10 ms in the detectors', () => {
    const g = gw250114Ringing()
    expect(g.detectedFrequencyHz).toBeCloseTo(249.0, 0)
    expect(g.detectedDampingTimeMs).toBeCloseTo(4.1, 1)
    expect(g.detectedFrequencyHz * g.detectedDampingTimeMs).toBeCloseTo(g.frequencyHz * g.dampingTimeMs, 9) // the swings do not change
  })
})

describe('calculated against measured', () => {
  it('compares 249.0 Hz with 251.7 Hz (1.1 percent) and 4.10 ms with 4.09 ms (0.2 percent)', () => {
    const c = compareWithMeasured()
    expect(c.frequencyRatio).toBeCloseTo(1.011, 3)
    expect(c.frequencyPercent).toBeCloseTo(1.1, 0)
    expect(c.dampingRatio).toBeCloseTo(0.998, 3)
    expect(c.dampingPercent).toBeCloseTo(-0.2, 0)
  })
  it('finds the calculated values inside the measured values\' 90 percent ranges', () => {
    const c = compareWithMeasured()
    expect(c.frequencyInsideRange).toBe(true)
    expect(c.dampingInsideRange).toBe(true)
    expect(GW250114_RINGDOWN.measuredFrequencyHz - GW250114_RINGDOWN.measuredFrequencyMinusHz).toBeLessThan(c.calculatedFrequencyHz)
  })
})

describe('the predictions', () => {
  it('has a higher pitch for a faster spin', () => {
    expect(pitchAnswer()).toBe('higher')
  })
  it('has about one swing before the ringing falls to 1/e', () => {
    expect(swingsAnswer()).toBe(1)
  })
  it('picks the nearest swings button on a log scale, not a plain distance', () => {
    // 5 is 1.67 times 3 but half of 10 (a factor of 2), so 3 is nearer on a log scale; in plain distance 3 is nearer too (2 against 5).
    expect(swingsAnswer(5)).toBe(3)
    expect(swingsAnswer(6)).toBe(10) // 6/3 = 2, 10/6 = 1.67
    expect(swingsAnswer(0.2)).toBe(0.3) // 0.3/0.2 = 1.5, 0.2/0.1 = 2
  })
  it('keeps the swings buttons in order, with the answer among them', () => {
    expect([...SWINGS_CHOICES]).toEqual([...SWINGS_CHOICES].sort((a, b) => a - b))
    expect(SWINGS_CHOICES).toContain(swingsAnswer())
  })
  it('gives a marker for each pitch guess that follows the guess', () => {
    expect(pitchMarker('lower')).toBe(-1)
    expect(pitchMarker('same')).toBe(0)
    expect(pitchMarker('higher')).toBe(1)
  })
})

describe('Picture 1: the wave, the swings and the comparison', () => {
  const pic = ringingPicture()
  it('has a period of one over the detected pitch (about 4.0 ms) and a fade time of 4.10 ms', () => {
    expect(pic.periodMs).toBeCloseTo(1000 / 249.0, 1)
    expect(pic.periodMs).toBeCloseTo(4.02, 1)
    expect(pic.dampingTimeMs).toBeCloseTo(4.1, 1)
    expect(pic.swingsToFade).toBeCloseTo(1.02, 2)
    expect(pic.swingsToFade).toBeCloseTo(pic.dampingTimeMs / pic.periodMs, 9) // the swings do not depend on the frame
  })
  it('starts at a crest of height 1 and fades along e^(-t/tau)', () => {
    expect(pic.wave[0].tMs).toBe(0)
    expect(pic.wave[0].value).toBeCloseTo(1, 12)
    for (const p of pic.wave) {
      expect(p.envelope).toBeCloseTo(Math.exp(-p.tMs / pic.dampingTimeMs), 12)
      expect(Math.abs(p.value)).toBeLessThanOrEqual(p.envelope + 1e-12)
    }
    expect(pic.wave[pic.wave.length - 1].tMs).toBeCloseTo(RINGING_AXIS_MS, 9)
  })
  it('crosses zero a quarter of a period in, and has fallen to 1/e at one fade time', () => {
    const w = ringdownWaveform(250, 4, 20, 20001)
    const quarter = w.find((p) => p.tMs >= 1)! // a quarter of the 4 ms period
    expect(Math.abs(quarter.value)).toBeLessThan(2e-3)
    const atTau = w.find((p) => p.tMs >= 4)!
    expect(atTau.envelope).toBeCloseTo(Math.exp(-1), 3)
  })
  it('puts the swings on a log axis: the ends at 0 and 1, equal factors at equal steps', () => {
    expect(swingsPosition(SWINGS_AXIS.min)).toBeCloseTo(0, 12)
    expect(swingsPosition(SWINGS_AXIS.max)).toBeCloseTo(1, 12)
    expect(swingsPosition(3) - swingsPosition(1)).toBeCloseTo(swingsPosition(30) - swingsPosition(10), 12)
    expect(() => swingsPosition(0)).toThrow(RangeError)
  })
  it('keeps every button and the real value inside the axis, in order', () => {
    const sp = swingsPicture()
    expect(sp.realSwings).toBeCloseTo(1.02, 2)
    expect(sp.realPosition).toBeGreaterThan(0)
    expect(sp.realPosition).toBeLessThan(1)
    let last = -1
    for (const t of sp.ticks) {
      expect(t.position).toBeGreaterThan(0)
      expect(t.position).toBeLessThan(1)
      expect(t.position).toBeGreaterThan(last)
      last = t.position
    }
  })
  it('moves the guess bar with the guess (a different guess, a different place) and puts a guess of 1 next to the real value', () => {
    const positions = SWINGS_CHOICES.map((c) => swingsGuessBar(c).position)
    expect(new Set(positions).size).toBe(SWINGS_CHOICES.length)
    expect(swingsGuessBar(3).swings).toBe(3)
    expect(Math.abs(swingsGuessBar(1).position - swingsPicture().realPosition)).toBeLessThan(0.01)
  })
  it('has a calculated and a measured value in each comparison row, inside its own axis, with the range around the measured value', () => {
    const rows = comparisonRows()
    expect(rows.map((r) => r.name)).toEqual(['pitch', 'fade time'])
    const [pitch, fade] = rows
    expect(pitch.calculated).toBeCloseTo(249.0, 0)
    expect(pitch.measured).toBe(251.7)
    expect(pitch.low).toBeCloseTo(246.7, 9)
    expect(pitch.high).toBeCloseTo(256.8, 9)
    expect(fade.calculated).toBeCloseTo(4.1, 1)
    expect(fade.measured).toBe(4.09)
    expect(fade.low).toBeCloseTo(3.71, 9)
    expect(fade.high).toBeCloseTo(4.51, 9)
    for (const r of rows) {
      for (const v of [r.calculated, r.measured, r.low, r.high]) {
        expect(v).toBeGreaterThan(r.axisMin)
        expect(v).toBeLessThan(r.axisMax)
      }
      expect(r.low).toBeLessThan(r.measured)
      expect(r.high).toBeGreaterThan(r.measured)
    }
  })
})

describe('Picture 2: pitch against spin', () => {
  const pic = pitchSpinPicture()
  it('is for the mass of the black hole GW250114 made, from spin 0 to 0.99 in steps of 0.01', () => {
    expect(pic.massSolar).toBe(62.7)
    expect(pic.curve.length).toBe(100)
    expect(pic.curve[0].spin).toBe(0)
    expect(pic.curve[99].spin).toBeCloseTo(0.99, 12)
  })
  it('rises with spin, from 190 Hz at 0 to 457 Hz at 0.99', () => {
    for (let i = 1; i < pic.curve.length; i++) expect(pic.curve[i].frequencyHz).toBeGreaterThan(pic.curve[i - 1].frequencyHz)
    expect(pic.curve[0].frequencyHz).toBeCloseTo(189.8, 0)
    expect(pic.curve[99].frequencyHz).toBeCloseTo(457.1, 0)
    expect(pic.curve[99].frequencyHz).toBeLessThan(pic.axisMaxHz)
  })
  it('has the real point (spin 0.68, 271.4 Hz in the black hole\'s own frame, 249.0 Hz at the detectors) on the curve', () => {
    expect(pic.real.spin).toBe(0.68)
    expect(pic.real.frequencyHz).toBeCloseTo(271.4, 0)
    expect(pic.detectedRealHz).toBeCloseTo(249.0, 0)
    expect(pic.curve[68].frequencyHz).toBeCloseTo(pic.real.frequencyHz, 9)
  })
  it('has the imagined faster point at spin 0.9 (343.2 Hz), higher than the real one, on the curve', () => {
    expect(FASTER_SPIN).toBe(0.9)
    expect(pic.faster.frequencyHz).toBeCloseTo(343.2, 0)
    expect(pic.faster.frequencyHz).toBeGreaterThan(pic.real.frequencyHz)
    expect(pic.curve[90].frequencyHz).toBeCloseTo(pic.faster.frequencyHz, 9)
  })
  it('draws the guess as a marker that follows the guess, at the faster spin, from the real pitch', () => {
    expect(pitchGuessMark('lower').direction).toBe(-1)
    expect(pitchGuessMark('same').direction).toBe(0)
    expect(pitchGuessMark('higher').direction).toBe(1)
    expect(pitchGuessMark('higher').spin).toBe(0.9)
    expect(pitchGuessMark('higher').fromHz).toBeCloseTo(pic.real.frequencyHz, 9)
  })
})

describe('Picture 3: pitch against mass', () => {
  const pic = pitchMassPicture()
  it('is at the real spin, for the five example masses, in the black hole\'s own frame', () => {
    expect(pic.spin).toBe(0.68)
    expect(pic.points.map((p) => p.massSolar)).toEqual([10, 30, 62.7, 100, 4.3e6])
    expect(pic.points[0].frequencyHz).toBeCloseTo(1701.8, 0)
    expect(pic.points[2].frequencyHz).toBeCloseTo(271.4, 0)
    expect(pic.points[3].frequencyHz).toBeCloseTo(170.2, 0)
  })
  it('falls as the mass rises, along a straight line of slope -1 on the log scales (pitch times mass is fixed)', () => {
    for (let i = 1; i < pic.points.length; i++) expect(pic.points[i].frequencyHz).toBeLessThan(pic.points[i - 1].frequencyHz)
    const k = pic.points[0].frequencyHz * pic.points[0].massSolar
    for (const p of pic.points) expect(p.frequencyHz * p.massSolar).toBeCloseTo(k, 6)
    const run = pic.line.to.xPosition - pic.line.from.xPosition
    const rise = pic.line.to.yPosition - pic.line.from.yPosition
    const decadesX = Math.log10(MASS_PICTURE_AXES.mass.max / MASS_PICTURE_AXES.mass.min)
    const decadesY = Math.log10(MASS_PICTURE_AXES.pitch.max / MASS_PICTURE_AXES.pitch.min)
    expect((rise * decadesY) / (run * decadesX)).toBeCloseTo(-1, 9)
  })
  it('gives Sagittarius A* about 0.004 Hz, one swing every 4 minutes', () => {
    const sgr = pic.points[4]
    expect(sgr.frequencyHz).toBeCloseTo(0.00396, 4)
    expect(sgr.periodSeconds / 60).toBeCloseTo(4.2, 1)
  })
  it('keeps every point inside both axes', () => {
    for (const p of pic.points) {
      expect(p.xPosition).toBeGreaterThan(0)
      expect(p.xPosition).toBeLessThan(1)
      expect(p.yPosition).toBeGreaterThan(0)
      expect(p.yPosition).toBeLessThan(1)
    }
  })
})

describe('Part 2: the learner\'s own trial black hole', () => {
  it('is the real black hole when the settings are the real ones: ratios of 1 and the same position', () => {
    const t = trialRinging(62.7, 0.68)
    expect(t.pitchOverReal).toBeCloseTo(1, 12)
    expect(t.fadeTimeOverReal).toBeCloseTo(1, 12)
    expect(t.pitchPosition).toBeCloseTo(t.realPitchPosition, 12)
    expect(t.frequencyHz).toBeCloseTo(271.4, 0)
    expect(t.swingsToFade).toBeCloseTo(1.02, 2)
  })
  it('gives one swing as one over the trial\'s own pitch, so it scales with the mass (4.3 million Suns: about 4 minutes)', () => {
    const t = trialRinging(10, 0.9)
    expect(t.periodSeconds).toBeCloseTo(1 / t.frequencyHz, 12)
    expect(t.periodSeconds).not.toBeCloseTo(1 / trialRinging(62.7, 0.68).frequencyHz, 4)
    expect(trialRinging(4.3e6, 0.68).periodSeconds / 60).toBeCloseTo(4.2, 1)
    expect(trialRinging(62.7, 0.68).periodSeconds * 1000).toBeCloseTo(3.68, 1)
  })
  it('changes the pitch ratio with the mass (10 times lighter: 10 times higher) and not the swings', () => {
    const light = trialRinging(6.27, 0.68)
    expect(light.pitchOverReal).toBeCloseTo(10, 9)
    expect(light.fadeTimeOverReal).toBeCloseTo(0.1, 9)
    expect(light.swingsToFade).toBeCloseTo(trialRinging(62.7, 0.68).swingsToFade, 12)
    expect(light.pitchPosition).toBeGreaterThan(trialRinging(62.7, 0.68).pitchPosition)
  })
  it('changes the swings with the spin, and not with the mass', () => {
    const a = trialRinging(10, 0)
    const b = trialRinging(4.3e6, 0)
    const c = trialRinging(10, 0.99)
    expect(a.swingsToFade).toBeCloseTo(b.swingsToFade, 12)
    expect(c.swingsToFade).toBeGreaterThan(a.swingsToFade * 4)
    expect(a.swingsToFade).toBeCloseTo(0.675, 2)
    expect(c.swingsToFade).toBeCloseTo(4.72, 1)
  })
  it('draws a wave in swings that starts at 1, falls as e^(-pi s / Q), and crosses zero a quarter of a swing in', () => {
    const t = trialRinging(62.7, 0.68)
    expect(t.wave[0].value).toBeCloseTo(1, 12)
    expect(t.wave[t.wave.length - 1].swings).toBeCloseTo(TRIAL_WAVE_SWINGS, 12)
    for (const p of t.wave) expect(p.envelope).toBeCloseTo(Math.exp((-Math.PI * p.swings) / t.quality), 12)
    const atFade = t.wave.find((p) => p.swings >= t.swingsToFade)!
    expect(atFade.envelope).toBeCloseTo(Math.exp(-1), 1)
    const quarter = t.wave.find((p) => p.swings >= 0.25)!
    expect(Math.abs(quarter.value)).toBeLessThan(0.02)
  })
  it('gives the real black hole\'s envelope for comparison, whatever the settings', () => {
    const a = trialRinging(10, 0)
    const b = trialRinging(100, 0.9)
    expect(a.realEnvelope).toEqual(b.realEnvelope)
    expect(a.realEnvelope[0].envelope).toBe(1)
    const real = trialRinging(62.7, 0.68)
    expect(real.realEnvelope[100].envelope).toBeCloseTo(real.wave[100].envelope, 12)
  })
  it('keeps every choice inside the pitch axis', () => {
    for (const m of MASS_CHOICES_SOLAR) {
      for (const s of SPIN_CHOICES) {
        const t = trialRinging(m, s)
        expect(t.pitchPosition).toBeGreaterThan(0)
        expect(t.pitchPosition).toBeLessThan(1)
      }
    }
  })
})

describe('Part 3: the results tables', () => {
  it('has a check-up of pitch, fade time and swings: calculated against measured', () => {
    const cu = checkUp()
    expect(cu.pitch.calculated).toBeCloseTo(249.0, 0)
    expect(cu.pitch.measured).toBe(251.7)
    expect(cu.pitch.percent).toBeCloseTo(1.1, 0)
    expect(cu.pitch.inside).toBe(true)
    expect(cu.fadeTime.calculated).toBeCloseTo(4.1, 1)
    expect(cu.fadeTime.measured).toBe(4.09)
    expect(cu.fadeTime.percent).toBeCloseTo(-0.2, 0)
    expect(cu.fadeTime.inside).toBe(true)
    expect(cu.redshiftStretch).toBeCloseTo(1.09, 12)
  })
  it('makes the measured swings from the two measured numbers (4.09 ms times 251.7 Hz = 1.03), with no range of its own', () => {
    const cu = checkUp()
    expect(cu.swings.measured).toBeCloseTo(1.029, 3)
    expect(cu.swings.calculated).toBeCloseTo(1.02, 2)
    expect(cu.swings.percent).toBeCloseTo(0.9, 0)
    expect(cu.swings.low).toBeNull()
    expect(cu.swings.inside).toBeNull()
  })
  it('puts the calculated pitch and fade time between the two ends of the measured range', () => {
    const cu = checkUp()
    expect(cu.pitch.low!).toBeLessThan(cu.pitch.calculated)
    expect(cu.pitch.high!).toBeGreaterThan(cu.pitch.calculated)
    expect(cu.fadeTime.low!).toBeLessThan(cu.fadeTime.calculated)
    expect(cu.fadeTime.high!).toBeGreaterThan(cu.fadeTime.calculated)
  })
  it('has the spin table: pitch rising and swings rising with spin, and a ratio of 1 at the real spin', () => {
    const rows = spinTable()
    expect(rows.map((r) => r.spin)).toEqual([0, 0.5, 0.68, 0.9, 0.99])
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].frequencyHz).toBeGreaterThan(rows[i - 1].frequencyHz)
      expect(rows[i].swingsToFade).toBeGreaterThan(rows[i - 1].swingsToFade)
    }
    expect(rows[2].pitchOverReal).toBeCloseTo(1, 12)
    expect(rows[0].frequencyHz).toBeCloseTo(189.8, 0)
    expect(rows[3].frequencyHz).toBeCloseTo(343.2, 0)
    expect(rows[3].pitchOverReal).toBeCloseTo(1.265, 2)
    expect(rows[4].swingsToFade).toBeCloseTo(4.72, 1)
  })
  it('has the mass table: pitch falling and times lengthening with mass, a ratio of 1 at the real mass', () => {
    const rows = massTable()
    expect(rows.map((r) => r.massSolar)).toEqual([10, 30, 62.7, 100, 4.3e6])
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].frequencyHz).toBeLessThan(rows[i - 1].frequencyHz)
      expect(rows[i].dampingTimeMs).toBeGreaterThan(rows[i - 1].dampingTimeMs)
      expect(rows[i].periodSeconds).toBeGreaterThan(rows[i - 1].periodSeconds)
    }
    expect(rows[2].pitchOverReal).toBeCloseTo(1, 12)
    expect(rows[0].frequencyHz).toBeCloseTo(1701.8, 0)
    expect(rows[0].dampingTimeMs).toBeCloseTo(0.6, 1)
    expect(rows[4].periodSeconds / 60).toBeCloseTo(4.2, 1)
    // the fade time is the quality factor over pi times the pitch, so it is not the time of one swing
    for (const r of rows) {
      expect(r.dampingTimeMs / 1000 / r.periodSeconds).toBeCloseTo(1.02, 2)
      expect(r.dampingTimeMs / 1000).not.toBeCloseTo(r.periodSeconds, 6)
    }
  })
})

describe('the tutor: marking the predictions and the worked numbers', () => {
  it('marks Prediction 1: only "higher" matches, and the numbers are 271 Hz and 343 Hz (1.26 times)', () => {
    expect(pitchGuessResult('higher').matched).toBe(true)
    expect(pitchGuessResult('lower').matched).toBe(false)
    expect(pitchGuessResult('same').matched).toBe(false)
    const r = pitchGuessResult('lower')
    expect(r.real).toBe('higher')
    expect(r.slowHz).toBeCloseTo(271.4, 0)
    expect(r.fastHz).toBeCloseTo(343.2, 0)
    expect(r.ratio).toBeCloseTo(1.265, 2)
  })
  it('marks Prediction 2: only 1 swing matches, and the gap to the real 1.02 is a factor', () => {
    const matches = SWINGS_CHOICES.filter((c) => swingsGuessGap(c).matched)
    expect(matches).toEqual([1])
    expect(swingsGuessGap(1).verdict).toBe('same')
    const low = swingsGuessGap(0.3)
    expect(low.verdict).toBe('below')
    expect(low.times).toBeCloseTo(1.02 / 0.3, 1)
    const high = swingsGuessGap(30)
    expect(high.verdict).toBe('above')
    expect(high.times).toBeCloseTo(30 / 1.02, 0)
    expect(high.nearest).toBe(1)
  })
  it('has the worked numbers: GM/c^3 = 0.309 ms, a swing of 11.9 of them, 271.4 Hz, 3.68 ms', () => {
    const w = ringingWorked()
    expect(w.lightCrossingTimeMs).toBeCloseTo(0.309, 3)
    expect(w.dimensionlessPitch).toBeCloseTo(0.5267, 3)
    expect(w.swingInLightCrossingTimes).toBeCloseTo(11.93, 1)
    expect(w.swingInLightCrossingTimes * w.lightCrossingTimeMs).toBeCloseTo(w.periodMs, 9)
    expect(w.frequencyHz).toBeCloseTo(271.4, 0)
    expect(w.periodMs).toBeCloseTo(3.68, 1)
    expect(w.quality).toBeCloseTo(3.206, 2)
    expect(w.swingsToFade).toBeCloseTo(1.02, 2)
  })
  it('halves the pitch when the mass doubles, and doubles the time unit', () => {
    const w = ringingWorked()
    expect(w.doubledMassFrequencyHz).toBeCloseTo(w.frequencyHz / 2, 9)
    expect(w.doubledMassLightCrossingTimeMs).toBeCloseTo(w.lightCrossingTimeMs * 2, 9)
  })
  it('gives the detector-frame values: 249.0 Hz and a swing of 4.02 ms, stretched by 1.09', () => {
    const w = ringingWorked()
    expect(w.detectedFrequencyHz).toBeCloseTo(249.0, 0)
    expect(w.detectedPeriodMs).toBeCloseTo(4.02, 1)
    expect(w.detectedPeriodMs / w.periodMs).toBeCloseTo(w.stretch, 12)
    expect(w.stretch).toBeCloseTo(1.09, 12)
  })
})

describe('the published figure for the second tone', () => {
  it('is 82.5 percent with the earlier analysis and 99.9 percent with the later one', () => {
    expect(SECOND_TONE_SIGNIFICANCE.earlierPercent).toBe(82.5)
    expect(SECOND_TONE_SIGNIFICANCE.laterPercent).toBe(99.9)
    expect(SECOND_TONE_SIGNIFICANCE.earlierPercent).toBeLessThan(SECOND_TONE_SIGNIFICANCE.laterPercent)
  })
})
