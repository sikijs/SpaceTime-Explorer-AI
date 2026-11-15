import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { DarkEnergyGuess, MatterOnlyGuess } from '../physics/universeAgeExperiment'
import { UniverseAgeExperiment } from './UniverseAgeExperiment'
import { AgeGraph, Part1GraphCaption, Part2Caption } from './UniverseAgePictures'
import { UniverseAgeResults } from './UniverseAgeResults'
import { UniverseAgeExplanation, UniverseAgeTutor, tutorPrompt } from './UniverseAgeTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before
// the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. ("pointing right" and "the right shape" are not verdicts, so a bare "right" is not matched.)
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b/i
const matterAll: MatterOnlyGuess[] = ['longer', 'shorter', 'same']
const darkAll: DarkEnergyGuess[] = ['older', 'younger', 'same']
const guesses = (matter: MatterOnlyGuess, dark: DarkEnergyGuess) => ({ matter, dark })
const graph = (props: Partial<Parameters<typeof AgeGraph>[0]>) => render(createElement(AgeGraph, { drawn: 1, share: null, shareDrawn: 1, finished: false, guesses: null, ...props }))

describe('Cosmology 6 renders (at rest)', () => {
  const html = render(createElement(UniverseAgeExperiment, {}))

  it('renders the heading, Part 1, the words box, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 6: How Old Is the Universe?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['1807.06209', 'wmap-overview', 'hubble-constant-and-tension', '37087-info-04-1997', 'astro-ph/9706128', '2302.07899', 'what-is-dark-energy']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('keeps the two guess questions exactly as approved and the introduction\'s existing sections, and adds the layout and guess paragraphs', () => {
    expect(html).toContain("so gravity has been slowing the expansion all along, would its age be longer than, shorter than, or the same as Experiment 2's constant-speed estimate (about 14 billion years)?")
    expect(html).toContain('Dark energy speeds the expansion up in recent times. Compared with a matter-only universe, would adding dark energy make the universe older, younger, or the same age?')
    for (const lead of [
      'The question.',
      'What happens.',
      'Where this comes from.',
      'A new term: the universe’s relative size.',
      'The quick way.',
      'When the quick way is right.',
      'Each part of the picture is part of the universe.',
      'Where the picture stops.',
      'A worked example.',
      'There is only one real universe, with one real age, and nothing here changes it.',
      'So we compare possible universes, on paper.',
      'What is kept the same.',
      'What is different.',
      'Older means a longer time; younger means a shorter time.',
      'Why bother?',
      'A picture to hold on to.',
      'What it does not mean.',
      'How you will see it.',
      'What “older” and “younger” mean here.',
      'A daily-life picture.',
      'Your job.',
      'What to look for.',
      'How this page is laid out.',
      'Your guesses and the real pictures.',
      'What we assume.',
      'Some new words.',
    ])
      expect(html).toContain(lead)
    // "What happens" says what the learner does in this experiment, before any recap of earlier ones
    const what = html.slice(html.indexOf('What happens.'), html.indexOf('Where this comes from.'))
    expect(what).toContain('In this experiment you find out')
    expect(what).toContain('First you make two guesses.')
    expect(what).toContain('you choose a share of dark energy yourself and watch a fourth, amber line')
    expect(what).not.toContain('Cosmology 5')
    // the relative-size explanation: why not kilometres, a worked example with numbers and the photocopier picture
    expect(html).toContain('we cannot give the universe one size in kilometres')
    expect(html).toContain('0.5 × 100 = 50 million light-years apart')
    expect(html).toContain('print it on a photocopier at 50 percent')
    expect(html).toContain('says nothing about whether the universe has an edge')
    // "What to look for" in the introduction: four items, each in three parts, and no result
    const look = html.slice(html.indexOf('What to look for.'), html.indexOf('How this page is laid out.'))
    expect(count(look, '<strong>Look at:</strong>')).toBe(4)
    expect(count(look, '<strong>What it means:</strong>')).toBe(4)
    expect(count(look, '<strong>Why it matters:</strong>')).toBe(4)
    expect(look).toContain('We reuse <strong>dark energy</strong>')
    expect(html).toContain('200 ÷ 10 = <strong>20 minutes</strong>')
    expect(html).toContain('It could be shorter or longer, depending on what the tap did')
    expect(html).toContain('(These two numbers are only an example to show the words. They are not results.)')
    expect(html).toContain('the same expansion speed today')
    expect(html).toContain('Older and younger (in this experiment)')
    expect(html).toContain('Your guesses never change the real pictures or tables.')
    expect(html).toContain('in a box labelled YOUR GUESS')
    expect(html).toContain('Parts 2, 3 and 4 appear when your first run has finished.')
    expect(html).toContain('as of November 2026, NASA says space-telescope measurements give around 70 to 76')
    expect(html).toContain('older than about 13.3 billion years')
    expect(html).toContain('The dark energy here is <strong>constant</strong>')
  })

  it('does not reveal the matter-only age, the "two thirds" fact or the clusters verdict above Part 1', () => {
    const intro = html.slice(html.indexOf('The question.'), html.indexOf('Part 1: Predict, then watch'))
    for (const phrase of [/two thirds/i, /\(2 ÷ 3\)/, /9\.31/, /too young/i, /cannot be the real one/i, /is older than/i, /is younger than/i, /redshift/i]) expect(intro).not.toMatch(phrase)
  })

  it('holds the formulas and their worked examples in the words box until after the first run', () => {
    const box = html.slice(html.indexOf('Words and formulas'), html.indexOf('Want to know more?'))
    for (const term of ['Age of the universe', 'Hubble time', 'Hubble tension', 'Relative size', 'Expansion history', 'Flat universe', 'Star cluster']) expect(box).toContain(term)
    expect(box).toContain('Formula: the Hubble time')
    expect(box).not.toContain('Formula: the age with no dark energy')
    expect(box).not.toContain('Formula: the age with dark energy share L')
    expect(box).toContain('appear here after your first run')
  })

  it('draws no graph, no caption, no grey line and no guess box before the run', () => {
    expect(html).not.toContain('How big the universe was, from the Big Bang to today')
    expect(html).not.toContain('How to read this diagram')
    expect(html).not.toContain('YOUR GUESS</text>')
    expect(html).not.toContain('Oldest known star clusters:')
    expect(html).toContain('After you press Run, the graph is drawn')
  })
})

describe('the graph', () => {
  it('draws the purple, blue and green lines and no amber line in Part 1', () => {
    const h = graph({})
    expect(h).toContain('stroke="#a78bfa"')
    expect(h).toContain('stroke="#38bdf8"')
    expect(h).toContain('stroke="#4ade80"')
    expect(h).not.toContain('stroke="#fbbf24"')
    expect(h).not.toContain('Your trial share')
    expect(h).not.toContain('NaN')
  })

  it('labels every line and every end dot with its age, once the sweep has reached it', () => {
    const none = graph({ drawn: 0.05 })
    expect(none).not.toContain('billion years</text>')
    const full = graph({})
    expect(full).toContain('Matter only: 9.31 billion years')
    expect(full).toContain('Best fit (70%): 13.47 billion years')
    expect(full).toContain('Constant speed: 13.97 billion years')
    expect(full).toContain('Constant speed (Cosmology 2; calculated here)')
    expect(full).toContain('today’s size')
    expect(full).toContain('Relative size (today = 1)')
    expect(full).toContain('Time since the Big Bang (billions of years)')
  })

  it('draws the grey line only once the run has finished, with the lower-limit wording', () => {
    expect(graph({ finished: false })).not.toContain('Oldest known star clusters:')
    const h = graph({ finished: true })
    expect(h).toContain('Oldest known star clusters:')
    expect(h).toContain('older than about 13.3')
    expect(h).toContain('billion years (a 2023 study)')
  })

  it('draws the amber line and its dot only in Part 2, following the share', () => {
    const a = graph({ share: 0.4 })
    expect(a).toContain('stroke="#fbbf24"')
    expect(a).toContain('Your share (40%): 10.98 billion years')
    expect(a).toContain('Your trial share')
    expect(a).not.toEqual(graph({ share: 0.9 }))
    expect(graph({ share: 0.9 })).toContain('Your share (90%): 17.85 billion years')
    expect(graph({ share: 0, shareDrawn: 0.05 })).not.toContain('Your share')
  })

  it('draws the white marks and two YOUR GUESS boxes only when the run has finished and guesses are given', () => {
    expect(graph({ guesses: guesses('shorter', 'older') })).not.toContain('YOUR GUESS')
    expect(graph({ finished: true })).not.toContain('YOUR GUESS')
    for (const m of matterAll)
      for (const d of darkAll) {
        const h = graph({ finished: true, guesses: guesses(m, d) })
        expect(count(h, 'YOUR GUESS')).toBe(2)
        expect(h).toMatch(/stroke="#ffffff"/)
        expect(h).not.toContain('NaN')
        expect(h).toContain('guess 1, from the purple dot')
        expect(h).toContain('guess 2, from the blue dot')
      }
  })

  it('makes a different mark for each answer: an arrow pointing left, an arrow pointing right or a ring', () => {
    const first = matterAll.map((m) => graph({ finished: true, guesses: guesses(m, 'older') }))
    expect(new Set(first).size).toBe(3)
    const second = darkAll.map((d) => graph({ finished: true, guesses: guesses('shorter', d) }))
    expect(new Set(second).size).toBe(3)
    // a ring is a white circle with no fill; an arrow has a white polygon head
    const ring = graph({ finished: true, guesses: guesses('same', 'older') })
    expect(ring).toMatch(/<circle[^>]*fill="none"[^>]*stroke="#ffffff"/)
    expect(count(ring, '<polygon')).toBe(1)
    const arrows = graph({ finished: true, guesses: guesses('shorter', 'younger') })
    expect(count(arrows, '<polygon')).toBe(2)
    expect(arrows).not.toMatch(/<circle[^>]*fill="none"[^>]*stroke="#ffffff"/)
  })

  it('points the arrows the right way: guess 1 left for shorter and right for longer, guess 2 right for older and left for younger', () => {
    const polygonX = (h: string) => [...h.matchAll(/<polygon points="([\d.]+),[\d.]+ ([\d.]+),/g)].map((m) => [Number(m[1]), Number(m[2])])
    const [shorter] = polygonX(graph({ finished: true, guesses: guesses('shorter', 'same') }))
    const [longer] = polygonX(graph({ finished: true, guesses: guesses('longer', 'same') }))
    expect(shorter[1]).toBeGreaterThan(shorter[0]) // head tip at the left of its base
    expect(longer[1]).toBeLessThan(longer[0]) // head tip at the right of its base
    const [older] = polygonX(graph({ finished: true, guesses: guesses('same', 'older') }))
    const [younger] = polygonX(graph({ finished: true, guesses: guesses('same', 'younger') }))
    expect(older[1]).toBeLessThan(older[0])
    expect(younger[1]).toBeGreaterThan(younger[0])
  })

  it('does not let the real picture depend on a guess: the lines and dots are the same with and without marks', () => {
    const withMarks = graph({ finished: true, guesses: guesses('longer', 'younger') })
    const without = graph({ finished: true })
    for (const piece of ['Matter only: 9.31 billion years', 'Best fit (70%): 13.47 billion years', 'Constant speed: 13.97 billion years']) {
      expect(withMarks).toContain(piece)
      expect(without).toContain(piece)
    }
    expect(withMarks.match(/<polyline[^>]*>/g)).toEqual(without.match(/<polyline[^>]*>/g))
  })
})

describe('the captions', () => {
  it('shows only the axes before the run starts, the lines and dots when it starts, and the rest when it ends', () => {
    const before = render(createElement(Part1GraphCaption, { started: false, arrived: false }))
    expect(before).toContain('How to read this diagram')
    expect(before).toContain('The two axes.')
    expect(before).not.toContain('The three lines.')
    expect(before).not.toContain('The dots.')
    const during = render(createElement(Part1GraphCaption, { started: true, arrived: false }))
    expect(during).toContain('The three lines.')
    expect(during).toContain('The dots.')
    expect(during).not.toContain('The grey dotted line.')
    expect(during).not.toContain('The white marks')
    expect(during).not.toContain('A worked moment')
    expect(during).not.toContain('What to look for')
    const after = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    for (const piece of ['The grey dotted line.', 'The white marks, below the time axis.', 'A worked moment (real numbers).', 'What to look for.']) expect(after).toContain(piece)
  })

  it('keeps the "two thirds" calculation and every number that gives guess 1 away until the run has finished', () => {
    const during = render(createElement(Part1GraphCaption, { started: true, arrived: false }))
    for (const phrase of ['(2 ÷ 3)', '9.31', 'two thirds', '4.0 billion years', 'too young']) expect(during).not.toContain(phrase)
    const after = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(after).toContain('(2 ÷ 3) × 13.97 = 9.31')
    expect(after).toContain('13.97 × 0.797 × 1.210 = 13.47')
  })

  it('gives each look-for item in three parts with real numbers, and says the marks are only markers', () => {
    const after = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(count(after, 'What it means:')).toBeGreaterThanOrEqual(5)
    expect(count(after, 'Why it matters:')).toBeGreaterThanOrEqual(5)
    expect(count(after, 'Look at')).toBeGreaterThanOrEqual(5)
    expect(after).toContain('at 4 billion years the blue line is already at 0.57, the green line at 0.39 and the purple line at 0.29')
    expect(after).toContain('is about 4.0 billion years to the left of the grey line (13.3)')
    expect(after).toContain('by only 0.17')
    expect(after).toContain('only markers')
    expect(after).not.toMatch(/\b(right|wrong|matched)\b[^<]*your guess/i)
  })

  it('Part 2 caption follows the share and names the pass share', () => {
    const low = render(createElement(Part2Caption, { share: 0 }))
    const high = render(createElement(Part2Caption, { share: 0.8 }))
    expect(low).toContain('to the left of')
    expect(high).toContain('to the right of')
    expect(low).toContain('from a share of about 69 percent upward')
    expect(low).not.toEqual(high)
    expect(low).not.toContain('NaN')
  })
})

describe('Part 3, the results', () => {
  const part3 = (share: number, g = guesses('shorter', 'older') as ReturnType<typeof guesses> | null) => render(createElement(UniverseAgeResults, { guesses: g, share }))
  const html = part3(0.7)

  it('has Table 1 with its five rows, the published figures and the plain readings', () => {
    expect(html).toContain('Table 1: Check-up')
    expect(html).toContain('13.797 ± 0.023 (Planck 2018)')
    expect(html).toContain('less, by 0.33')
    expect(html).toContain('the same, within the published uncertainty')
    expect(html).toContain('less, by 3.99')
    expect(html).toContain('more, by 0.17')
    expect(html).toContain('Less (two thirds); calculated here only')
    expect(html).toContain('older than about 13.30')
    expect(html).toContain('No cut-off such as')
    expect(html).not.toContain('close enough”</strong>')
    expect(html).not.toContain('NaN')
  })

  it('has a "What this table tells us" note under each of the three tables, each with what it is, what it means and why it matters', () => {
    expect(count(html, 'What this table tells us')).toBe(3)
    expect(count(html, 'What it is')).toBeGreaterThanOrEqual(7)
    expect(count(html, 'What it means:')).toBeGreaterThanOrEqual(5)
    expect(count(html, 'Why it matters:')).toBeGreaterThanOrEqual(5)
    expect(html).toContain('about 1.2 percent')
  })

  it('has Table 2 with the published value and how yours compares, the amber row following the share', () => {
    expect(html).toContain('Table 2: The ages')
    expect(html).toContain('Published value')
    expect(html).toContain('How yours compares')
    expect(html).toContain('13.47')
    const matterOnly = part3(0)
    const rowOf = (h: string) => h.slice(h.indexOf('Table 2: The ages'), h.indexOf('The oldest known star clusters (lower limit)'))
    expect(rowOf(matterOnly)).toContain('9.31')
    expect(rowOf(matterOnly)).toContain('less, by 4.48')
    expect(matterOnly).toContain('your universe is <strong>younger</strong> than this')
    expect(rowOf(part3(0.8))).toContain('15.03')
    expect(rowOf(part3(0.8))).toContain('more, by 1.23')
    expect(html).toContain('your universe is <strong>older</strong> than this')
  })

  it('updates "What your numbers show" with the share and ends with the trial-values line', () => {
    expect(html).toContain('What your numbers show.')
    expect(html).toContain('With <strong>70%</strong> dark energy, your universe is <strong>13.47</strong> billion years old')
    expect(part3(0)).toContain('With <strong>0%</strong> dark energy, your universe is <strong>9.31</strong> billion years old')
    expect(part3(0.8)).toContain('<strong>more than</strong> the measured')
    expect(html).toContain('These are trial values and your own numbers. They do not say the real universe is like that.')
  })

  it('has Table 3 with 13.47, 13.99 and 13.80', () => {
    expect(html).toContain('Table 3: Which values give 13.8?')
    expect(html).toContain('13.99')
    expect(html).toContain('<strong>13.80</strong>')
    expect(html).toContain('NASA, August 2025')
  })

  it('tells the clusters history with ESA\'s and Chaboyer\'s numbers and no unsupported figure', () => {
    expect(html).toContain('about 14.6 billion years')
    expect(html).toContain('Hipparcos gave about 11')
    expect(html).toContain('11.5 ± 1.3')
    for (const gone of ['16 to 20', '12 to 13', 'pointed toward dark energy', 'one of the clues']) expect(html).not.toContain(gone)
  })

  it('shows both guesses beside the results, as guesses only, with tags on the rows, and only when there are guesses', () => {
    expect(html).toContain('Your guesses')
    expect(html).toContain('it would be younger than that estimate')
    expect(html).toContain('it would make the universe older')
    expect(count(html, 'YOUR GUESS|Your guess')).toBeGreaterThan(0)
    expect(count(html, 'Guess 1')).toBeGreaterThan(0)
    expect(part3(0.7, null)).not.toContain('Your guesses')
    expect(part3(0.7, null).length).toBeLessThan(html.length)
  })

  it('never says right, wrong or matched, and never changes Table 1 or Table 3 with a guess or the share', () => {
    for (const m of matterAll)
      for (const d of darkAll) {
        const h = part3(0.7, guesses(m, d))
        // the page's own note "not whether it is right" says the tags are not a verdict, so it is taken out before looking for one
        expect(h.replace('not whether it is right', '')).not.toMatch(VERDICT)
        expect(h).not.toContain('That is what you guessed')
      }
    const table1 = (h: string) => h.slice(h.indexOf('Table 1: Check-up'), h.indexOf('Table 2: The ages'))
    expect(table1(part3(0, null)).replace(/<span[^>]*>.*?<\/span>/g, '')).toEqual(table1(part3(0.9, guesses('longer', 'younger'))).replace(/<span[^>]*>.*?<\/span>/g, ''))
    const table3 = (h: string) => h.slice(h.indexOf('Table 3: Which values'))
    expect(table3(part3(0, null))).toEqual(table3(part3(0.9, guesses('same', 'same'))))
  })
})

describe('Part 4, the tutor', () => {
  it('asks the observe, compare and conceptual questions with no verdict, naming the white marks', () => {
    for (const m of matterAll)
      for (const d of darkAll)
        for (const step of ['observe', 'compare', 'conceptual'] as const) {
          const text = tutorPrompt(step, m, d)
          expect(text).not.toMatch(VERDICT)
          expect(text).not.toContain('That is what you guessed')
        }
    expect(tutorPrompt('observe', 'same', 'same')).toContain('white marks')
    expect(tutorPrompt('compare', 'shorter', 'older')).toContain('white arrow pointing left from the purple dot')
    expect(tutorPrompt('compare', 'shorter', 'older')).toContain('white arrow pointing right from the blue dot')
    expect(tutorPrompt('compare', 'same', 'same')).toContain('white ring round the purple dot')
    expect(tutorPrompt('compare', 'same', 'same')).toContain('white ring round the blue dot')
    expect(tutorPrompt('conceptual', 'same', 'same')).toContain('Why might it have turned out so close?')
  })

  it('starts at the first question and gives no explanation yet', () => {
    const h = render(createElement(UniverseAgeTutor, { predictedMatterOnly: 'shorter', predictedDarkEnergy: 'older' }))
    expect(h).toContain('Look at where each line reaches size 1')
    expect(h).not.toContain('That is what you guessed')
    expect(h).not.toContain('That is not what you guessed')
    expect(h).not.toContain('(2 ÷ 3)')
  })

  it('marks each guess correctly in the explanation, for all nine pairs', () => {
    for (const m of matterAll)
      for (const d of darkAll) {
        const h = render(createElement(UniverseAgeExplanation, { predictedMatterOnly: m, predictedDarkEnergy: d }))
        const expectedOk = (m === 'shorter' ? 1 : 0) + (d === 'older' ? 1 : 0)
        expect(count(h, 'That is what you guessed.')).toBe(expectedOk)
        expect(count(h, 'That is not what you guessed.')).toBe(2 - expectedOk)
        expect(h).not.toContain('NaN')
      }
  })

  it('quotes the real numbers, the sourced figures and the clusters marker, and drops the old 12.5 and the 1990s claim', () => {
    const h = render(createElement(UniverseAgeExplanation, { predictedMatterOnly: 'shorter', predictedDarkEnergy: 'older' }))
    expect(h).toContain('(2 ÷ 3) × 13.97 ≈ 9.31 billion years')
    expect(h).toContain('The graph shows the blue dot at 9.31, left of the purple dot at 13.97.')
    expect(h).toContain('The green dot is at 13.47, right of the blue dot at 9.31.')
    expect(h).toContain('Planck 2018: 13.797 ± 0.023')
    expect(h).toContain('older than about 13.3 billion years, from a 2023 study')
    for (const gone of ['12.5', 'one of the clues', 'pointed toward dark energy']) expect(h).not.toContain(gone)
    expect(h).toContain('A car trip.')
    expect(h).toContain('The same car trip, the other way.')
  })
})
