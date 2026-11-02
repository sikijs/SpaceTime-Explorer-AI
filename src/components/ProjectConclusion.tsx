// The project's Conclusion page: a last chapter, not an experiment. It adds no physics, no controls, no prediction and no tutor. It
// looks back over all the groups: the journey, how well each kind of answer is tested, what is contested or open, how to read a
// headline, what the project did not do, and where to go next. Every count and figure comes from `projectConclusion`, `frontierRecap`
// and `evidenceClaims`, which read them from the experiments' own modules (CLAUDE.md §9). See
// docs/experiments/conclusion/00-conclusion-page.md (approved with defaults on 2026-11-02). The wording is draft for the owner's
// line-by-line approval (CLAUDE.md §28.1).
import type { ReactNode } from 'react'
import { STATUS_LABELS, frontierFacts } from '../physics/frontierRecap'
import { featuredFindings, groupCounts, groupSizes, labelledChapterShare, totalCounts, unlabelledGroups, withoutConclusion } from '../physics/projectConclusion'

const textStyle = { fontSize: '0.9375rem', lineHeight: 1.6 } as const

interface ConclusionChapter {
  title: string
  group: string
}

interface ProjectConclusionProps {
  // The app's chapters (title and group), so the counts follow the real list.
  chapterRefs?: ConclusionChapter[]
  // The order the sidebar shows the groups in.
  groupOrder?: string[]
  // Jumps to a chapter by its position in the list.
  onSelectChapter?: (index: number) => void
}

// One sentence per group on what it asked and found, written from each group's own approved overview and summaries. Keyed by the
// app's group names; a group not in this list is shown by name only.
const JOURNEY: Record<string, string> = {
  'Relativity of Time and Motion':
    'Light travels at the same speed for everyone, so two observers who move differently disagree about time, length and what happens “at the same time”.',
  'Gravity and Curved Spacetime':
    'Gravity can be understood as the curve of spacetime, and it changes how clocks run. The GPS satellites are the working example.',
  'Gravitational Waves': 'Moving masses make ripples in spacetime, and the ripples can be detected.',
  Cosmology: 'The universe is expanding, and what we know about its past, its contents and its fate.',
  'Black Holes and Strong Gravity':
    'What gravity does when it is strongest: time, orbits, light and a falling traveler near a black hole, where black holes come from, and how one might end.',
  'Spacetime Geometry: What Is Real, What Is Seen': 'What every observer agrees on, what each measures differently, and what each only sees.',
  'Evidence and Imagination: What Has Been Tested, What Has Not':
    'What has been tested, and what the mathematics allows but nobody has seen, such as wormholes and travel to the past.',
  'Cosmic Horizons':
    'Recent results that are still being tested: where measurements disagree, where something unexpected has been seen, and what it takes to call a result a discovery.',
}

// "Where to go next": official, general-audience pages. Each was fetched on 2026-11-02 (by a subagent, not read by Claude itself), and
// each loaded. Two candidates were left out: the Event Horizon Telescope's site (HTTP 403) and a NASA address for "dark energy" that
// served a dark matter page.
const LINKS: { href: string; name: string; what: string }[] = [
  { href: 'https://science.nasa.gov/universe/', name: 'NASA: the Universe', what: 'a plain introduction to the cosmos, with sections on stars, black holes, galaxies, dark matter and dark energy, and a glossary.' },
  { href: 'https://www.esa.int/Science_Exploration/Space_Science', name: 'ESA: Space Science', what: 'stories, images and videos from European Space Agency science missions such as Euclid, Webb and Gaia.' },
  { href: 'https://www.ligo.caltech.edu/page/what-are-gw', name: 'LIGO: What are gravitational waves?', what: 'a plain explanation of gravitational waves as ripples in spacetime and of LIGO’s first detection in 2015.' },
  { href: 'https://home.cern/science/physics', name: 'CERN: Physics', what: 'an overview of particle physics research at CERN, with sections on antimatter, dark matter and the early universe.' },
  { href: 'https://www.eso.org/public/', name: 'ESO: the European Southern Observatory', what: 'press releases, pictures and videos from ESO’s telescopes, such as the Very Large Telescope and ALMA.' },
  { href: 'https://www.desi.lbl.gov/', name: 'DESI: the Dark Energy Spectroscopic Instrument', what: 'the survey that maps millions of galaxies in three dimensions to study dark energy. Part of the site is aimed at scientists, and the front page is readable.' },
]

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export function ProjectConclusion({ chapterRefs = [], groupOrder = [], onSelectChapter }: ProjectConclusionProps) {
  // The page's own chapter is left out of every count; `firstChapterOf` still uses the full list, because its numbers are positions in it.
  const project = withoutConclusion(chapterRefs)
  const sizes = groupSizes(project, groupOrder)
  const total = project.length
  const share = labelledChapterShare(project)
  const unlabelled = unlabelledGroups(sizes.map((s) => s.group))
  const counts = groupCounts()
  const totals = totalCounts()
  const everyFinding = totals.reduce((sum, t) => sum + t.claims, 0)
  const featured = featuredFindings()
  const facts = frontierFacts()
  const firstChapterOf = (group: string) => chapterRefs.findIndex((c) => c.group === group)

  return (
    <div className="exp-card" style={{ marginTop: '1rem', padding: '1.5rem', ...textStyle }}>
      <h2 style={{ marginTop: 0 }}>Looking Back: What Do We Know, How Well, and What Is Still Open?</h2>

      <p className="summary-card" style={{ padding: '0.75rem 1rem' }}>
        <strong>Read this after the experiments.</strong> This page looks back over all {total} chapters, so it says what they found. If you have not run an
        experiment yet, you may want to run it first and come back: each one asks you to predict and watch before it explains. Everything here is “as of
        November 2026”.
      </p>

      <h3>1. The journey, in {sizes.length} steps</h3>
      <p>
        These are the project’s {sizes.length} groups, in the order the sidebar shows them. That is the order they were built in, not a single straight line of
        ideas: for example, Spacetime Geometry comes after Black Holes. Each button takes you to the group’s first chapter.
      </p>
      <ol>
        {sizes.map(({ group, chapters }) => (
          <li key={group} style={{ marginBottom: '0.5rem' }}>
            <strong>{group}</strong> ({chapters} chapters). {JOURNEY[group] ?? ''}{' '}
            {onSelectChapter && firstChapterOf(group) >= 0 && (
              <button type="button" className="secondary-button" style={{ padding: '0.2rem 0.75rem', fontSize: '0.875rem' }} onClick={() => onSelectChapter(firstChapterOf(group))}>
                Go to the first chapter
              </button>
            )}
          </li>
        ))}
      </ol>

      <h3>2. How well is each kind of answer tested?</h3>
      <p>
        The experiments in the last groups each carry one of four labels: <strong>{STATUS_LABELS[0]}</strong> (many independent measurements agree),{' '}
        <strong>{STATUS_LABELS[1]}</strong> (one clear result that experts widely accept), <strong>{STATUS_LABELS[2]}</strong> (the data are real, but experts
        disagree about what they mean) and <strong>{STATUS_LABELS[3]}</strong> (we do not know yet). A result can hold more than one label.
      </p>
      <p>
        {share.labelled} of the {share.total} chapters are in a group that labels every result. Together they hold {everyFinding} separate findings:{' '}
        {totals.map((t, i) => `${t.claims} ${t.label.toLowerCase()}${i < totals.length - 2 ? ', ' : i === totals.length - 2 ? ' and ' : '.'}`).join('')}
      </p>
      <ul>
        {counts.map((c) => (
          <li key={c.group}>
            <strong>{c.group}:</strong> {c.claims} findings in {c.experiments} experiments ({c.byLabel.map((b) => `${b.claims} ${b.label.toLowerCase()}`).join(', ')}).
          </li>
        ))}
      </ul>
      <p>The full list of Cosmic Horizons findings is at the bottom of its last experiment’s page.</p>
      {unlabelled.length > 0 && (
        <p>
          <strong>{unlabelled.length === 1 ? 'Why does one group have no label?' : `Why do ${unlabelled.length} groups have no label?`}</strong> {unlabelled.join(', ')}. Those groups were written
          before we started to label every result. They teach ideas that have been tested for a long time, and where a result in them is still debated, the
          experiment says so. The last groups label every result, because they are about the edge of what is known.
        </p>
      )}

      <h3>3. What is contested, and what is open</h3>
      <p>A few examples, each repeating what its own experiment says:</p>
      <ul>
        {featured.map((f) => (
          <li key={`${f.group}-${f.experiment}-${f.label}`}>
            <strong>{f.label}.</strong> {f.claim.claim} ({f.group.split(':')[0]}, Experiment {f.experiment}).
          </li>
        ))}
      </ul>

      <h3>4. How to read a headline</h3>
      <p>The experiments taught five questions that are worth asking of any science headline:</p>
      <ul>
        <li>
          <strong>Is it measured, or is it seen?</strong> A measurement allows for the time light takes to arrive; what is seen does not (Spacetime Geometry).
        </li>
        <li>
          <strong>How many sigma, and how many independent measurements?</strong> A hint of about {facts.desiSigmaLow} to {facts.desiSigmaHigh} sigma can fade or grow
          (Cosmic Horizons, Experiment 2), and a faint background at about {facts.pulsarSigmaLow} to {facts.pulsarSigmaHigh} sigma is not yet a discovery at 5 (Experiment 21).
        </li>
        <li>
          <strong>Is it one very clear event, or many?</strong> One merger of two black holes, GW250114, tested a 1971 prediction and the ringing of the new black hole
          (Cosmic Horizons, Experiments 17 and 18).
        </li>
        <li>
          <strong>Is it a tension, and has one gone away before?</strong> One tension about lumpiness went away with a larger survey; the Hubble tension has not
          (Cosmic Horizons, Experiments 3 and 1).
        </li>
        <li>
          <strong>What label would its own page give it?</strong> Settled, strong evidence, contested or open.
        </li>
      </ul>

      <h3>5. What this project did not do</h3>
      <ul>
        <li>The models are simplified. For example, the Milky Way and Andromeda are two points, and the black hole shadow uses the formula for a black hole that does not spin.</li>
        <li>The numbers come from papers, and in many experiments no paper was read in full: some were read only through an abstract or a summary. Each experiment’s own page says what was and was not read.</li>
        <li>No experiment has been checked with a real learner, and the pages have been checked in one browser, not in every browser or by keyboard in full.</li>
        <li>Everything is “as of November 2026”. A result may have moved since.</li>
      </ul>

      <h3>6. Where to go next</h3>
      <p>Official pages for a reader who wants more. Each link opens in a new tab.</p>
      <ul>
        {LINKS.map((l) => (
          <li key={l.href}>
            <ExternalLink href={l.href}>{l.name}</ExternalLink>: {l.what}
          </li>
        ))}
      </ul>

      <h3>7. Back to the Welcome page</h3>
      <p style={{ marginBottom: 0 }}>
        The Welcome page said that claims such as “GPS satellites need constant correction” can sound like science fiction, and that this project would let you run
        the experiment that shows why. You did: Gravity and Curved Spacetime Experiment 9 (GPS), and Cosmic Horizons Experiments 9, 10 and 11 (clocks at different heights, on the Moon
        and near the Sun) each show a clock’s rate depending on where it is and how fast it moves.
      </p>
    </div>
  )
}
