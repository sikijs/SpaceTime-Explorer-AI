import { evidenceClaims } from './evidenceClaims'
import { STATUS_LABELS, frontierClaims } from './frontierRecap'
import type { Claim, StatusLabel } from './frontierRecap'

// The Conclusion page's figures (docs/experiments/conclusion/00-conclusion-page.md): how many chapters each group has, which groups carry
// status labels, and how many findings each label has across them. Every number is read from the experiments' own claim lists, never typed
// in again (CLAUDE.md §9). There is no new physics in this file.
//
// Adding labels for an older group later (the owner's planned audit) takes one step: add an entry to LABELLED_GROUPS with that group's
// claims. The counts, the list of groups without labels and the page's note about them then follow from this file.

// The group names are exactly the app's (`groupOrder` in src/App.tsx).
export interface LabelledGroup {
  group: string
  claims: () => Claim[]
}

export const LABELLED_GROUPS: LabelledGroup[] = [
  { group: 'Evidence and Imagination: What Has Been Tested, What Has Not', claims: evidenceClaims },
  { group: 'Cosmic Horizons', claims: frontierClaims },
]

// A chapter, as far as this file needs to know: which group it belongs to.
export interface ChapterRef {
  group: string
}

// How many chapters each group has. The groups come in the order given (the sidebar's `groupOrder`); a group not in that order follows,
// in the order it first appears in the chapter list. Without an order, the groups come in the order they first appear in the list.
export function groupSizes(chapters: ChapterRef[], order: string[] = []): { group: string; chapters: number }[] {
  const sizes = new Map<string, number>()
  for (const c of chapters) sizes.set(c.group, (sizes.get(c.group) ?? 0) + 1)
  const rank = (group: string) => {
    const i = order.indexOf(group)
    return i === -1 ? order.length : i
  }
  return [...sizes].map(([group, count]) => ({ group, chapters: count })).sort((a, b) => rank(a.group) - rank(b.group))
}

// The groups that carry no labels yet (no entry in LABELLED_GROUPS), given the app's group names.
export function unlabelledGroups(allGroups: string[]): string[] {
  const labelled = new Set(LABELLED_GROUPS.map((g) => g.group))
  return allGroups.filter((g) => !labelled.has(g))
}

// The number of distinct experiments with at least one claim in a labelled group.
export function labelledExperiments(group: string): number {
  const entry = LABELLED_GROUPS.find((g) => g.group === group)
  if (!entry) return 0
  return new Set(entry.claims().map((c) => c.experiment)).size
}

export interface GroupCounts {
  group: string
  experiments: number
  claims: number
  byLabel: { label: StatusLabel; claims: number }[]
}

// For each labelled group, how many claims it has under each of the four labels.
export function groupCounts(): GroupCounts[] {
  return LABELLED_GROUPS.map(({ group, claims }) => {
    const list = claims()
    return {
      group,
      experiments: labelledExperiments(group),
      claims: list.length,
      byLabel: STATUS_LABELS.map((label) => ({ label, claims: list.filter((c) => c.label === label).length })),
    }
  })
}

// Across every labelled group, how many claims each label has.
export function totalCounts(): { label: StatusLabel; claims: number }[] {
  const groups = groupCounts()
  return STATUS_LABELS.map((label, i) => ({ label, claims: groups.reduce((sum, g) => sum + g.byLabel[i].claims, 0) }))
}

// How many of the app's chapters are in a labelled group, and how many chapters there are in all.
export function labelledChapterShare(chapters: ChapterRef[]): { labelled: number; total: number } {
  const labelled = new Set(LABELLED_GROUPS.map((g) => g.group))
  return { labelled: chapters.filter((c) => labelled.has(c.group)).length, total: chapters.length }
}

// The few contested and open findings the Conclusion page names (the specification's section 3). Each is one claim from a labelled group,
// found by group, experiment number and label, so the wording and the figures come from the claim lists.
export interface FeaturedKey {
  group: string
  experiment: number
  label: StatusLabel
}

export const FEATURED: FeaturedKey[] = [
  { group: 'Cosmic Horizons', experiment: 1, label: 'Contested' },
  { group: 'Cosmic Horizons', experiment: 2, label: 'Contested' },
  { group: 'Evidence and Imagination: What Has Been Tested, What Has Not', experiment: 7, label: 'Contested' },
  { group: 'Evidence and Imagination: What Has Been Tested, What Has Not', experiment: 1, label: 'Open' },
  { group: 'Evidence and Imagination: What Has Been Tested, What Has Not', experiment: 2, label: 'Open' },
  { group: 'Evidence and Imagination: What Has Been Tested, What Has Not', experiment: 6, label: 'Open' },
]

export interface FeaturedFinding extends FeaturedKey {
  claim: Claim
}

export function featuredFindings(): FeaturedFinding[] {
  return FEATURED.map((key) => {
    const entry = LABELLED_GROUPS.find((g) => g.group === key.group)
    const claim = entry?.claims().find((c) => c.experiment === key.experiment && c.label === key.label)
    if (!claim) throw new Error(`No ${key.label} claim for experiment ${key.experiment} of ${key.group}`)
    return { ...key, claim }
  })
}

