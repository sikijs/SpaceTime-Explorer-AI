import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { frontierClaims } from './frontierRecap'
import { evidenceClaims } from './evidenceClaims'
import { LABELLED_GROUPS, groupCounts, groupSizes, labelledChapterShare, labelledExperiments, totalCounts, unlabelledGroups } from './projectConclusion'

// Required tests of docs/experiments/conclusion/00-conclusion-page.md. The expected numbers are written out by hand from the project's
// chapter list (88 chapters in 8 groups), so a change that moves one shows up here.

const EVIDENCE = 'Evidence and Imagination: What Has Been Tested, What Has Not'
const GROUP_SIZES: [string, number][] = [
  ['Relativity of Time and Motion', 11],
  ['Gravity and Curved Spacetime', 9],
  ['Gravitational Waves', 7],
  ['Cosmology', 10],
  ['Black Holes and Strong Gravity', 10],
  ['Spacetime Geometry: What Is Real, What Is Seen', 10],
  [EVIDENCE, 7],
  ['Cosmic Horizons', 24],
]
const chapters = GROUP_SIZES.flatMap(([group, n]) => Array.from({ length: n }, () => ({ group })))
const allGroups = GROUP_SIZES.map(([g]) => g)

describe('project conclusion: the chapters and groups', () => {
  it('the project has 88 chapters in 8 groups, with the sizes the sidebar shows', () => {
    expect(chapters).toHaveLength(88)
    expect(groupSizes(chapters)).toEqual(GROUP_SIZES.map(([group, n]) => ({ group, chapters: n })))
  })

  it('the labelled groups’ names are exactly the app’s group names (src/App.tsx)', () => {
    const app = readFileSync('src/App.tsx', 'utf8')
    for (const { group } of LABELLED_GROUPS) expect(app, group).toContain(`'${group}'`)
  })

  it('31 of the 88 chapters are in a labelled group, and the other six groups are unlabelled', () => {
    expect(labelledChapterShare(chapters)).toEqual({ labelled: 31, total: 88 })
    expect(unlabelledGroups(allGroups)).toEqual(allGroups.slice(0, 6))
  })
})

describe('project conclusion: the counts follow the claim lists', () => {
  it('each labelled group’s counts equal its own claim list', () => {
    const counts = groupCounts()
    expect(counts.map((c) => c.group)).toEqual([EVIDENCE, 'Cosmic Horizons'])
    expect(counts[0].claims).toBe(evidenceClaims().length)
    expect(counts[1].claims).toBe(frontierClaims().length)
    for (const c of counts) expect(c.byLabel.reduce((s, b) => s + b.claims, 0)).toBe(c.claims)
  })

  it('Evidence and Imagination has 12 claims in 7 experiments and Cosmic Horizons 43 in 24', () => {
    expect(labelledExperiments(EVIDENCE)).toBe(7)
    expect(labelledExperiments('Cosmic Horizons')).toBe(24)
    expect(labelledExperiments('Cosmology')).toBe(0)
    const counts = groupCounts()
    expect(counts[0].claims).toBe(12)
    expect(counts[1].claims).toBe(43)
  })

  it('across both groups there are 55 findings: 12 settled, 15 strong evidence, 10 contested and 18 open', () => {
    const t = Object.fromEntries(totalCounts().map((c) => [c.label, c.claims]))
    expect(t).toEqual({ Settled: 12, 'Strong evidence': 15, Contested: 10, Open: 18 })
    expect(Object.values(t).reduce((a, b) => a + b, 0)).toBe(55)
  })
})

describe('project conclusion: adding labels for an older group updates the figures', () => {
  it('a group that gains an entry is no longer listed as unlabelled, and its claims join the totals', () => {
    const before = totalCounts()
    LABELLED_GROUPS.push({ group: 'Cosmology', claims: () => [{ experiment: 1, label: 'Settled', claim: 'A test claim for the Cosmology group' }] })
    try {
      expect(unlabelledGroups(allGroups)).not.toContain('Cosmology')
      expect(labelledChapterShare(chapters).labelled).toBe(41)
      expect(totalCounts()[0].claims).toBe(before[0].claims + 1)
      expect(groupCounts().map((g) => g.group)).toContain('Cosmology')
    } finally {
      LABELLED_GROUPS.pop()
    }
    expect(unlabelledGroups(allGroups)).toContain('Cosmology')
  })
})
