import { describe, expect, it } from 'vitest'
import { EXPERIMENT_NUMBERS, STATUS_LABELS, claimsWithLabel, displayNumber, experimentsWithLabel, frontierClaims, frontierFacts, labelCounts } from './frontierRecap'

// Required tests of docs/experiments/cosmic-horizons/closing-recap.md. The expected numbers below are written out by hand from the
// specification's table, so a change to an earlier experiment that moves a figure shows up here.

function figureOf(experiment: number, label?: string) {
  const claim = frontierClaims().find((c) => c.experiment === experiment && c.figure && (label === undefined || c.label === label))
  if (!claim || !claim.figure) throw new Error(`Experiment ${experiment} has no figure`)
  return claim.figure
}

describe('frontier recap: the claims cover the whole group', () => {
  const claims = frontierClaims()

  it('every one of the twenty-four experiments appears at least once, and Experiment 16 never does', () => {
    expect(EXPERIMENT_NUMBERS).toHaveLength(24)
    const seen = new Set(claims.map((c) => c.experiment))
    for (const n of EXPERIMENT_NUMBERS) expect(seen.has(n), `Experiment ${n}`).toBe(true)
    expect(seen.has(16)).toBe(false)
    for (const n of seen) expect(EXPERIMENT_NUMBERS).toContain(n)
  })

  it('every claim has one of the four labels and some wording', () => {
    for (const c of claims) {
      expect(STATUS_LABELS).toContain(c.label)
      expect(c.claim.length).toBeGreaterThan(5)
    }
  })

  it('no experiment has the same claim twice, and none has the same label on the same claim', () => {
    const keys = claims.map((c) => `${c.experiment}|${c.label}|${c.claim}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('frontier recap: the numbers a learner sees', () => {
  it('the sidebar numbers run 1 to 24 in a row: the specification’s Experiment 25 is the learner’s 24', () => {
    expect(EXPERIMENT_NUMBERS.map(displayNumber)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1))
    expect(displayNumber(15)).toBe(15)
    expect(displayNumber(17)).toBe(16)
    expect(displayNumber(25)).toBe(24)
  })

  it('there is no Experiment 16 or Experiment 26 to display', () => {
    expect(() => displayNumber(16)).toThrow(RangeError)
    expect(() => displayNumber(26)).toThrow(RangeError)
  })
})

describe('frontier recap: the sorting by label', () => {
  it('Settled claims are in experiments 9, 11, 23 and 24 (Experiment 12’s “what a red supergiant is” was dropped as not a finding)', () => {
    expect(experimentsWithLabel('Settled')).toEqual([9, 11, 23, 24])
  })

  it('Contested claims are in experiments 1, 2, 3, 4, 7, 13, 14, 17 and 25', () => {
    expect(experimentsWithLabel('Contested')).toEqual([1, 2, 3, 4, 7, 13, 14, 17, 25])
  })

  it('the counts add up to every claim, and the experiment count never exceeds twenty-four', () => {
    const counts = labelCounts()
    expect(counts.map((c) => c.label)).toEqual(STATUS_LABELS)
    expect(counts.reduce((sum, c) => sum + c.claims, 0)).toBe(frontierClaims().length)
    for (const c of counts) {
      expect(c.claims).toBe(claimsWithLabel(c.label).length)
      expect(c.experiments).toBeLessThanOrEqual(24)
      expect(c.experiments).toBeGreaterThan(0)
    }
  })

  it('experiments 13, 14, 17 and 25 hold three different labels, and Experiment 12 two (Strong evidence and Open)', () => {
    const labelsOf = (n: number) => new Set(frontierClaims().filter((c) => c.experiment === n).map((c) => c.label))
    for (const n of [13, 14, 17, 25]) expect(labelsOf(n).size, `Experiment ${n}`).toBe(3)
    expect([...labelsOf(12)].sort()).toEqual(['Open', 'Strong evidence'])
  })
})

describe('frontier recap: the numbers in the explanatory text', () => {
  const facts = frontierFacts()

  it('Experiment 2: DESI’s hint sits between 2.7 and 3.2 sigma', () => {
    expect(facts.desiSigmaLow).toBeCloseTo(2.7, 5)
    expect(facts.desiSigmaHigh).toBeCloseTo(3.2, 5)
  })

  it('Experiment 21: the pulsar-timing hum runs from 3 to 4 sigma, below 5', () => {
    expect(facts.pulsarSigmaLow).toBe(3)
    expect(facts.pulsarSigmaHigh).toBe(4)
    expect(facts.pulsarSigmaHigh).toBeLessThan(5)
  })

  it('Experiment 8: ALPHA-g’s 0.75 has a combined give-or-take of 0.21', () => {
    expect(facts.antimatterRatio).toBeCloseTo(0.75, 2)
    expect(facts.antimatterPlusMinus).toBeCloseTo(0.206, 3)
  })

  it('Experiment 9: the JILA test was across 1 millimetre', () => {
    expect(facts.jilaMillimetres).toBe(1)
  })
})

describe('frontier recap: the figures the specification quotes, each read from the earlier experiment', () => {
  it('Experiment 1: SH0ES and Planck disagree by 4.89 sigma', () => {
    expect(figureOf(1).value).toBeCloseTo(4.89, 2)
  })

  it('Experiment 2: DESI’s July 2026 bar is 2.7 sigma', () => {
    expect(figureOf(2).value).toBeCloseTo(2.7, 5)
  })

  it('Experiment 4: DESI’s July 2026 ceiling is 0.0592 eV', () => {
    expect(figureOf(4).value).toBeCloseTo(0.0592, 4)
  })

  it('Experiment 5: MoM-z14 is at redshift 14.44', () => {
    expect(figureOf(5).value).toBeCloseTo(14.44, 2)
  })

  it('Experiment 7: the 2026 wide-binary speed-up is 1.60', () => {
    expect(figureOf(7).value).toBeCloseTo(1.6, 2)
  })

  it('Experiment 8: ALPHA-g measured 0.75 of g', () => {
    expect(figureOf(8).value).toBeCloseTo(0.75, 2)
  })

  it('Experiment 9: the clock saw the effect across 1 mm', () => {
    expect(figureOf(9).value).toBe(1)
  })

  it('Experiment 10: a lunar clock gains about 56 microseconds a day', () => {
    expect(figureOf(10).value).toBeCloseTo(56.02, 2)
  })

  it('Experiment 11: Parker Solar Probe’s speed is 192.22 km/s', () => {
    expect(figureOf(11).value).toBeCloseTo(192.22, 2)
  })

  it('Experiment 13: the published mass estimates run from 8 to 24 Suns', () => {
    const range = figureOf(13)
    expect(range.value).toBe(8)
    expect(range.high).toBe(24)
  })

  it('Experiment 15: the NICER star’s radius is 11.36 km', () => {
    expect(figureOf(15).value).toBeCloseTo(11.36, 2)
  })

  it('Experiment 17: the star faded by more than 10,000 times', () => {
    expect(figureOf(17).value).toBe(10000)
  })

  it('Experiment 18: the total area rose 1.57 times', () => {
    expect(figureOf(18).value).toBeCloseTo(1.573, 2)
  })

  it('Experiment 19: the detectors measured 251.7 Hz', () => {
    expect(figureOf(19).value).toBeCloseTo(251.7, 1)
  })

  it('Experiment 20: the final black hole’s best-fit mass is 225 Suns', () => {
    expect(figureOf(20).value).toBe(225)
  })

  it('Experiment 21: M87*’s measured ring is 42 µas', () => {
    expect(figureOf(21).value).toBe(42)
  })

  it('Experiment 22: NANOGrav’s evidence reaches 4 sigma, below 5', () => {
    const sigma = figureOf(22).value
    expect(sigma).toBe(4)
    expect(sigma).toBeLessThan(5)
  })

  it('Experiment 23: CAPERS-LRD-z9 is at redshift 9.288', () => {
    expect(figureOf(23).value).toBeCloseTo(9.288, 3)
  })

  it('Experiment 24: the Sun bent 3I/ATLAS’s path by 18.7 degrees', () => {
    expect(figureOf(24).value).toBeCloseTo(18.7, 1)
  })

  it('Experiment 25: the 2026 study gave about 90 percent, and the claim names the 2025 study’s 50', () => {
    expect(figureOf(25).value).toBe(90)
    const claim = frontierClaims().find((c) => c.experiment === 25 && c.label === 'Contested')
    expect(claim?.claim).toContain('50 percent')
  })
})
