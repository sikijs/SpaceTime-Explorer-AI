import { describe, expect, it } from 'vitest'
import { evidenceClaims } from './evidenceClaims'
import { STATUS_LABELS } from './frontierRecap'

// Required tests of docs/experiments/conclusion/00-conclusion-page.md (the Evidence and Imagination claims). The expected labels and
// numbers are written out by hand from each experiment's built "Where this stands" text (2026-11-02), so a change to an earlier module
// or a page that moves one shows up here.

const claims = evidenceClaims()
const labelsOf = (n: number) => claims.filter((c) => c.experiment === n).map((c) => c.label)
const figureOf = (n: number) => {
  const c = claims.find((x) => x.experiment === n && x.figure)
  if (!c || !c.figure) throw new Error(`Experiment ${n} has no figure`)
  return c.figure
}

describe('evidence claims: coverage and labels', () => {
  it('all seven experiments appear, numbered 1 to 7, and every label is one of the four', () => {
    expect([...new Set(claims.map((c) => c.experiment))]).toEqual([1, 2, 3, 4, 5, 6, 7])
    for (const c of claims) {
      expect(STATUS_LABELS).toContain(c.label)
      expect(c.claim.length).toBeGreaterThan(10)
    }
  })

  it('no claim is repeated', () => {
    const keys = claims.map((c) => `${c.experiment}|${c.label}|${c.claim}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('each experiment carries the labels its page states', () => {
    expect(labelsOf(1)).toEqual(['Settled', 'Open'])
    expect(labelsOf(2)).toEqual(['Settled', 'Open'])
    expect(labelsOf(3)).toEqual(['Settled'])
    expect(labelsOf(4)).toEqual(['Settled'])
    expect(labelsOf(5)).toEqual(['Settled', 'Open'])
    expect(labelsOf(6)).toEqual(['Settled', 'Open'])
    expect(labelsOf(7)).toEqual(['Settled', 'Contested'])
  })

  it('there are 12 claims: 7 settled, 4 open and 1 contested', () => {
    expect(claims).toHaveLength(12)
    expect(claims.filter((c) => c.label === 'Settled')).toHaveLength(7)
    expect(claims.filter((c) => c.label === 'Open')).toHaveLength(4)
    expect(claims.filter((c) => c.label === 'Contested')).toHaveLength(1)
  })
})

describe('evidence claims: the figures, each read from the experiment’s module', () => {
  it('Experiment 2: a clock moving at 0.8 c counts 6 years on a 10-year trip', () => {
    expect(figureOf(2).value).toBeCloseTo(6, 6)
    expect(figureOf(2).what).toContain('0.8')
    expect(figureOf(2).what).toContain('10-year')
  })

  it('Experiment 3: half the speed of light added to half the speed of light is 0.8 of it, not 1', () => {
    expect(figureOf(3).value).toBeCloseTo(0.8, 6)
  })

  it('Experiment 4: a muon’s lifetime at rest is 2.197 microseconds', () => {
    expect(figureOf(4).value).toBeCloseTo(2.197, 3)
  })

  it('Experiment 5: the Sun adds about 232.5 microseconds to a round trip to Venus that touches it', () => {
    expect(figureOf(5).value).toBeCloseTo(232.5, 1)
  })

  it('Experiment 6: the helium measurement is 24.58 percent', () => {
    const helium = claims.find((c) => c.experiment === 6 && c.label === 'Settled')?.figure
    expect(helium?.value).toBeCloseTo(24.58, 2)
  })

  it('Experiment 6: the lithium-7 calculation is 3.8 times the measurement', () => {
    const lithium = claims.find((c) => c.experiment === 6 && c.label === 'Open')?.figure
    expect(lithium?.value).toBeCloseTo(3.81, 2)
  })

  it('Experiment 7: the microwave sky’s difference fits about 370 km/s', () => {
    expect(figureOf(7).value).toBeCloseTo(369.82, 2)
  })
})
