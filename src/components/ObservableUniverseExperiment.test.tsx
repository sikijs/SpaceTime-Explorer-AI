import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LeftGuess, TodayGuess } from '../physics/observableUniverseExperiment'
import { ObservableUniverseExperiment } from './ObservableUniverseExperiment'
import { DistanceGraph, DistancePicture, OwnSourcePicture, Part1DistanceCaption, Part1GraphCaption, Part2Caption } from './ObservableUniversePictures'
import { ObservableUniverseResults } from './ObservableUniverseResults'
import { ObservableUniverseExplanation, ObservableUniverseTutor, tutorPrompt } from './ObservableUniverseTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before the
// tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. ("pointing left" is not a verdict; the page's own "not whether it is right" is taken out first.)
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b/i
const todayAll: TodayGuess[] = ['less', 'about', 'more']
const leftAll: LeftGuess[] = ['thirteen', 'few', 'closer']
const guesses = (today: TodayGuess, left: LeftGuess) => ({ today, left })
const picture = (props: Partial<Parameters<typeof DistancePicture>[0]>) => render(createElement(DistancePicture, { progress: 1, finished: false, guesses: null, ...props }))
const WHITE = 'stroke="#ffffff"'

describe('Cosmology 8 renders (at rest)', () => {
  const html = render(createElement(ObservableUniverseExperiment, {}))

  it('renders the heading, Part 1, the words box, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 8: How Far Can We See? The Observable Universe')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['arxiv.org/abs/1807.06209', 'Planck_and_the_cosmic_microwave_background', 'wmap/shape.html', 'hubble-constant-and-tension', 'Joseph_Silk']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('keeps the two guess questions exactly as approved and has the step-by-step introduction', () => {
    expect(html).toContain("A galaxy's light has been travelling toward us for 10 billion years. How far away is that galaxy today?")
    expect(html).toContain('The oldest light we can see left its source when the universe was very young. How far away was that source when the light left it?')
    for (const choice of ['Less than 10 billion light-years', 'About 10 billion light-years', 'More than 10 billion light-years', 'About 13 billion light-years', 'A few billion light-years', 'Far closer than that, under 100 million light-years'])
      expect(html).toContain(choice)
    for (const lead of ['The question.', 'What happens.', 'Step 1: what', 'Step 2: the oldest light.', 'Step 3: redshift, a reminder.', 'Step 4: three distances for one source.', 'Step 5: the units.', 'Step 6: why ask this at all.', 'Your job.', 'What to look for.', 'How this page is laid out.', 'Your guesses and the real pictures.', 'What we assume.', 'Some new words:'])
      expect(html).toContain(lead)
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('drawn on the real picture in <strong>white</strong>')
  })

  it('gives away no answer before the run (§12)', () => {
    for (const answer of ['16.89', '16.9', '5.63', '41 million', '40.9', '1090.8', '957,000', 'rubber band', 'ant starts', 'not faster-than-light']) expect(html).not.toContain(answer)
    // The page that says what the tutor asks, and the two formulas that give guess 2's answer away, wait for the run.
    expect(html).not.toContain('ask_astro')
    expect(html).not.toContain('Formula: the distance when the light left')
    expect(html).toContain('appears here after your first Run')
    expect(html).toContain('two more formulas appear here after your first run')
  })

  it('draws no picture and no caption before the run', () => {
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('How to read this picture')
    expect(html).not.toContain('>YOUR GUESS<')
  })
})

describe('Picture 1: the three distances for Galaxy A and Source B', () => {
  it('draws every bar, label, the two groups and the zoomed panel with its own scale, and no white before the run has finished', () => {
    const h = picture({ progress: 1, finished: false, guesses: guesses('more', 'closer') })
    for (const label of ['Earth', 'Galaxy A (redshift 2)', 'Source B: the oldest light we can see (redshift 1089.8)', 'How far the light travelled', 'How far away the source is today', 'How far away it was when the light left', 'The source', 'Distance from Earth (billions of light-years)', 'Zoomed in: Source B when the light left (a different scale)', 'Distance from Earth (millions of light-years)'])
      expect(h).toContain(label)
    expect(count(h, 'How far away the source is today')).toBe(2)
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain('NaN')
  })

  it('draws the numbers from the module on its labels', () => {
    const h = picture({})
    expect(h).toContain('10.24 billion light-years')
    expect(h).toContain('16.89 billion light-years')
    expect(h).toContain('13.47 billion light-years')
    expect(h).toContain('44.61 billion light-years')
    expect(h).toContain('41 million light-years')
  })

  it('draws no white and no bar length at the start of a run, then grows the bars', () => {
    const start = picture({ progress: 0, finished: false })
    const end = picture({ progress: 1, finished: false })
    expect(start).not.toContain(WHITE)
    expect(start).not.toBe(end)
  })

  it('draws two white YOUR GUESS boxes for every pair of guesses once the run has finished, and one white mark per guess', () => {
    for (const t of todayAll)
      for (const l of leftAll) {
        const h = picture({ finished: true, guesses: guesses(t, l) })
        expect(count(h, 'YOUR GUESS')).toBe(2)
        expect(h).toContain(WHITE)
        expect(h).not.toContain('NaN')
        expect(h).not.toMatch(VERDICT)
      }
  })

  it('draws no white when the run has finished but there is no guess', () => {
    expect(picture({ finished: true, guesses: null })).not.toContain(WHITE)
  })

  it('draws a different mark for each guess', () => {
    const today = todayAll.map((t) => picture({ finished: true, guesses: guesses(t, 'closer') }))
    expect(new Set(today).size).toBe(3)
    const left = leftAll.map((l) => picture({ finished: true, guesses: guesses('more', l) }))
    expect(new Set(left).size).toBe(3)
  })

  it('draws guess 2 where its answer has a place: the main axis for 13 billion, the zoomed panel for the other two', () => {
    expect(picture({ finished: true, guesses: guesses('more', 'few') })).toContain('off this scale')
    expect(picture({ finished: true, guesses: guesses('more', 'closer') })).not.toContain('off this scale')
    expect(picture({ finished: true, guesses: guesses('more', 'thirteen') })).not.toContain('off this scale')
    expect(picture({ finished: true, guesses: guesses('more', 'thirteen') })).toContain('about 13 billion ly')
    expect(picture({ finished: true, guesses: guesses('more', 'closer') })).toContain('under 100 million ly')
  })

  it('states each guess in its box in the learner\'s words', () => {
    expect(picture({ finished: true, guesses: guesses('less', 'few') })).toContain('less than 10 billion ly')
    expect(picture({ finished: true, guesses: guesses('about', 'few') })).toContain('about 10 billion ly')
    expect(picture({ finished: true, guesses: guesses('more', 'few') })).toContain('more than 10 billion ly')
    expect(picture({ finished: true, guesses: guesses('more', 'few') })).toContain('a few billion ly')
  })
})

describe('Picture 1 caption', () => {
  const before = render(createElement(Part1DistanceCaption, { started: true, arrived: false }))
  const after = render(createElement(Part1DistanceCaption, { started: true, arrived: true }))

  it('lists every drawn element before the run ends, with the units defined', () => {
    for (const text of ['Earth', 'blue bar', 'gold bar', 'green bar', 'zoomed panel', 'true scale', 'light-year', 'billions of light-years', 'about 8 seconds', 'each tick is 20 million']) expect(before).toContain(text)
  })

  it('shows the worked moment, the marker note and the three-part look-for items only once the run has ended', () => {
    for (const text of ['A worked moment.', 'The white marks are only markers.', 'What to look for.']) {
      expect(before).not.toContain(text)
      expect(after).toContain(text)
    }
    expect(count(after, '<strong>Look at:</strong>')).toBe(3)
    expect(count(after, '<strong>What it means:</strong>')).toBe(3)
    expect(count(after, '<strong>Why it matters:</strong>')).toBe(3)
    expect(before).not.toContain('16.89')
    expect(before).not.toContain('41 million')
    expect(after).toContain('16.89')
    expect(after).toContain('41 million')
  })

  it('does not give a verdict', () => {
    expect(before.replace('not whether it is right', '')).not.toMatch(VERDICT)
    expect(after.replace('None of them says right or wrong', '')).not.toMatch(VERDICT)
  })
})

describe('Picture 2: the graph', () => {
  const h = render(createElement(DistanceGraph, { marks: [{ redshift: 2, label: 'Galaxy A', color: '#e2e8f0' }, { redshift: 1089.8, label: 'Source B', color: '#e2e8f0' }] }))

  it('draws the three curves, their labels, both sources and both axes, and nothing white', () => {
    for (const label of ['The three distances for every source', 'Source today', 'Light travelled', 'When the light left', 'Galaxy A', 'Source B', 'Source redshift (each tick is ten times the one before)', 'Distance (billions of light-years)']) expect(h).toContain(label)
    expect(count(h, '<polyline')).toBe(3)
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('NaN')
  })

  it('has a caption whose look-for items appear only after the run', () => {
    const before = render(createElement(Part1GraphCaption, { arrived: false }))
    const after = render(createElement(Part1GraphCaption, { arrived: true }))
    expect(before).not.toContain('What to look for.')
    expect(count(after, '<strong>Look at:</strong>')).toBe(2)
    expect(after).toContain('13.47')
    expect(after).toContain('44.61')
  })
})

describe('Part 2: the learner\'s source', () => {
  it('draws the three bars for any redshift without NaN, in a pink frame, with a zoomed strip only when the green bar is short', () => {
    for (const z of [0.1, 0.5, 2, 10, 100, 500, 1089.8]) {
      const h = render(createElement(OwnSourcePicture, { redshift: z, progress: 1 }))
      expect(h).not.toContain('NaN')
      expect(h).toContain('Your source (redshift')
      expect(h).toContain('#f472b6')
      expect(h).not.toContain(WHITE)
    }
    expect(render(createElement(OwnSourcePicture, { redshift: 1089.8, progress: 1 }))).toContain('Zoomed in: your source when the light left')
    expect(render(createElement(OwnSourcePicture, { redshift: 2, progress: 1 }))).not.toContain('Zoomed in')
  })

  it('changes the picture when the source changes, and has a caption with a look-for item', () => {
    expect(render(createElement(OwnSourcePicture, { redshift: 0.5, progress: 1 }))).not.toBe(render(createElement(OwnSourcePicture, { redshift: 10, progress: 1 })))
    const c = render(createElement(Part2Caption, { redshift: 10 }))
    expect(c).toContain('<strong>Look at:</strong>')
    expect(c).toContain('13.00 billion light-years')
  })

  it('draws a pink line on the graph for the chosen source only', () => {
    const g = render(createElement(DistanceGraph, { marks: [{ redshift: 10, label: 'Your source', color: '#f472b6' }] }))
    expect(g).toContain('Your source')
    expect(g).toContain('#f472b6')
    expect(g).not.toContain('Galaxy A')
  })
})

describe('Part 3: the results', () => {
  const html = (t: TodayGuess, l: LeftGuess, z = 10) => render(createElement(ObservableUniverseResults, { guesses: guesses(t, l), redshift: z }))

  it('shows the guesses beside the results with a tag on each row, and never says right or wrong', () => {
    for (const t of todayAll)
      for (const l of leftAll) {
        const h = html(t, l)
        expect(h).toContain('Your guesses')
        expect(count(h, '>your guess<')).toBe(2)
        expect(h.replace('not whether it is right', '')).not.toMatch(VERDICT)
        expect(h).not.toContain('NaN')
      }
  })

  it('shows no guess block and no tag before there is a guess', () => {
    const h = render(createElement(ObservableUniverseResults, { guesses: null, redshift: 10 }))
    expect(h).not.toContain('Your guesses')
    expect(h).not.toContain('>your guess<')
  })

  it('has the check-up with its four rows, published values, readings and the "What this table tells us" notes', () => {
    const h = html('more', 'closer')
    for (const text of ['Table 1: Check-up', '(a) The oldest light', '(b) The same distance', '(c) When the oldest light left', '(d) The age of the universe', 'Planck 2018', 'Wikipedia', 'less, by about', 'more, by about', '13.787', '472,000']) expect(h).toContain(text)
    expect(count(h, 'What this table tells us')).toBe(2)
    expect(count(h, '<strong>Why it matters:</strong>') + count(h, '<strong>Why it matters.</strong>')).toBeGreaterThanOrEqual(5)
  })

  it('has Table 2 with the three distances and the pink row, and says the values are trial values', () => {
    const h = html('more', 'closer')
    for (const text of ['Table 2: The three distances', 'Galaxy A (redshift 2)', 'Source B, the oldest light', 'Your source', '16.89', '44.61', 'What your numbers show', 'trial values', 'do not say that a real galaxy is like that']) expect(h).toContain(text)
  })

  it('never changes a table with a guess, and changes only the pink row and its note with the source', () => {
    const tables = (h: string) => h.slice(h.indexOf('Table 1: Check-up'))
    const base = tables(html('more', 'closer', 10))
    for (const t of todayAll) for (const l of leftAll) expect(tables(html(t, l, 10))).toBe(base)
    const other = tables(html('more', 'closer', 0.5))
    expect(other).not.toBe(base)
    const table1 = (h: string) => h.slice(h.indexOf('Table 1: Check-up'), h.indexOf('Table 2:'))
    expect(table1(html('more', 'closer', 0.5))).toBe(table1(html('more', 'closer', 10)))
  })

  it('takes the pink row\'s numbers from the chosen source', () => {
    const row = (h: string) => h.slice(h.indexOf('<strong style="color:#f472b6">Your source</strong>'), h.indexOf('What this table tells us', h.indexOf('<strong style="color:#f472b6">Your source</strong>')))
    const half = row(html('more', 'closer', 0.5))
    for (const n of ['5.04', '6.16', '4.11']) expect(half).toContain(n)
    const ten = row(html('more', 'closer', 10))
    for (const n of ['13.00', '30.79', '2.80']) expect(ten).toContain(n)
    expect(half).not.toContain('30.79')
  })

  it('does not answer the tutor\'s conceptual question or give the verdicts', () => {
    const h = html('more', 'closer')
    for (const text of ['Why the distances differ', 'rubber band', 'A simple calculation', 'Nothing travelled faster than light', 'prediction was']) expect(h).not.toContain(text)
    expect(h).not.toMatch(/\bant\b/)
  })
})

describe('Part 4: the tutor', () => {
  it('asks three questions with no outcome and no verdict, naming the white marks', () => {
    for (const t of todayAll)
      for (const l of leftAll) {
        for (const step of ['observe', 'compare', 'conceptual'] as const) {
          const prompt = tutorPrompt(step, t, l)
          expect(prompt).not.toMatch(VERDICT)
          expect(prompt).not.toContain('NaN')
        }
        expect(tutorPrompt('compare', t, l)).toContain('white')
        expect(tutorPrompt('observe', t, l)).toContain('white marks')
      }
    expect(tutorPrompt('conceptual', 'more', 'closer')).toContain('44.6')
  })

  it('starts on its first question and marks nothing until the explanation', () => {
    const h = render(createElement(ObservableUniverseTutor, { predictedToday: 'more', predictedLeft: 'closer' }))
    expect(h).toContain('Compare the three bars for Galaxy A and for Source B')
    expect(h).not.toContain('That is what you guessed')
    expect(h).not.toContain('That is not what you guessed')
  })

  it('marks each guess once, and only the two the model gives as what you guessed', () => {
    for (const t of todayAll)
      for (const l of leftAll) {
        const h = render(createElement(ObservableUniverseExplanation, { predictedToday: t, predictedLeft: l }))
        expect(count(h, 'That is what you guessed') + count(h, 'That is not what you guessed')).toBe(2)
        expect(count(h, 'That is what you guessed')).toBe((t === 'more' ? 1 : 0) + (l === 'closer' ? 1 : 0))
        expect(h).not.toContain('NaN')
        expect(h).not.toMatch(VERDICT)
      }
  })

  it('has the eight points, the rubber band, the NASA quotation and the figures from the module', () => {
    const h = render(createElement(ObservableUniverseExplanation, { predictedToday: 'more', predictedLeft: 'closer' }))
    for (const n of ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.']) expect(h).toContain(`<strong>${n} `)
    expect(h).toMatch(/\bant\b/)
    for (const text of ['rubber band', 'is not in contradiction with the limit for zero mass particles', '3.2 times the speed of light', '957,000', '41 million', '13.47', '44.6', 'Cosmology 1', 'Cosmology 6', '472,000']) expect(h).toContain(text)
  })
})
