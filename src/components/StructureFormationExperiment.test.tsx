import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { GrowthGuess, HeadStartGuess } from '../physics/structureFormationExperiment'
import { StructureFormationExperiment } from './StructureFormationExperiment'
import { ExcessCaption, ExcessGraph, GrowthGraph, NeededSizeCaption, NeededSizePicture, Part1GrowthCaption, StripCaption, StripPicture } from './StructureFormationPictures'
import { StructureFormationResults } from './StructureFormationResults'
import { StructureFormationExplanation, StructureFormationTutor, tutorPrompt } from './StructureFormationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before the
// tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. ("pointing" is not a verdict; the page's own "not whether it is right" is taken out first.)
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b/i
const growthAll: GrowthGuess[] = ['ten', 'thousand', 'million']
const headAll: HeadStartGuess[] = ['none', 'small', 'decides']
const guesses = (growth: GrowthGuess, headStart: HeadStartGuess) => ({ growth, headStart })
const graph = (props: Partial<Parameters<typeof GrowthGraph>[0]>) => render(createElement(GrowthGraph, { progress: 1, finished: false, guesses: null, ...props }))
const WHITE = 'stroke="#ffffff"'

describe('Cosmology 9 renders (at rest)', () => {
  const html = render(createElement(StructureFormationExperiment, {}))

  it('renders the heading, Part 1, the words box, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 9: How Did Galaxies Form? Growing Structure from Tiny Ripples')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['mather/cobe/science.html', 'Planck_reveals_an_almost_perfect_Universe', 'planck-mission-explores-the-history', 'arxiv.org/abs/1807.06209', 'wmap/shape.html', 'hubble-constant-and-tension']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('has the two guess questions and has the step-by-step introduction', () => {
    expect(html).toContain('Guess 1: how much will the extra density grow?')
    expect(html).toContain('By today, how many times bigger will its extra density be than it was at the start?')
    expect(html).toContain('Guess 2: what would a head start do?')
    expect(html).toContain('Would that change the growth you guessed in Guess 1?')
    for (const choice of ['About 10 times', 'About 1,000 times', 'About a million times', 'No difference', 'A small difference', 'It would decide the outcome']) expect(html).toContain(choice)
    for (const lead of ['The question.', 'What happens.', 'Step 1: the oldest light, a reminder.', 'Step 2: a new word, density excess.', 'Step 3: the tug-of-war.', 'Step 4: growth.', 'Step 5: a clump.', 'Step 6: redshift, a reminder.', 'Step 7: why ask this at all.', 'Your job.', 'What to look for.', 'How this page is laid out.', 'Your guesses and the real pictures.', 'What we assume.', 'Some new words:', 'As of November 2026.'])
      expect(html).toContain(lead)
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('drawn on the real graph in <strong>white</strong>')
  })

  it('gives away no answer before the run (§12)', () => {
    for (const answer of ['849.7', '2,649', '2649', '3.1 times', 'starts at redshift 3,400', 'savings account', 'grows only in step', 'clump together first', 'ask_astro', '0.0085']) expect(html).not.toContain(answer)
    // Pages and formulas that say what the tutor asks, and the head-start premise, wait for the run.
    expect(html).not.toContain('Formula: the starting size needed')
    expect(html).not.toContain('jpl.nasa.gov/news/nasa-reveals')
    expect(html).toContain('appear here after your first Run')
    expect(html).toContain('three more formulas appear here after your first run')
  })

  it('draws no picture and no caption before the run', () => {
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('How to read this picture')
    expect(html).not.toContain('>YOUR GUESS<')
  })
})

describe('Picture 1: the growth graph', () => {
  it('draws the labelled axes, both lines and both dashed lines, and no white before the run has finished', () => {
    const h = graph({ progress: 1, finished: false, guesses: guesses('thousand', 'small') })
    for (const text of ['How many times a ripple grows', 'Times grown since its start', 'Time since the Big Bang', '10 thousand', '10 billion', 'the model leaves out light']) expect(h).toContain(text)
    expect(count(h, '<polyline')).toBe(4)
    expect(count(h, 'stroke-dasharray="4 4"')).toBe(2)
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain('NaN')
  })

  it('prints the numbers at the end of the lines only once the run has finished', () => {
    const running = graph({ progress: 0.5, finished: false })
    const done = graph({ progress: 1, finished: true })
    for (const text of ['Ordinary matter: about 850 times', 'With dark matter: about 2,649 times', 'Dashed, without dark energy']) {
      expect(running).not.toContain(text)
      expect(done).toContain(text)
    }
  })

  it('grows the lines during the run', () => {
    expect(graph({ progress: 0.1 })).not.toBe(graph({ progress: 1 }))
  })

  it('draws two white YOUR GUESS boxes for every pair of guesses once the run has finished', () => {
    for (const g of growthAll)
      for (const hs of headAll) {
        const h = graph({ finished: true, guesses: guesses(g, hs) })
        expect(count(h, 'YOUR GUESS')).toBe(2)
        expect(h).toContain(WHITE)
        expect(h).not.toContain('NaN')
        expect(h).not.toMatch(VERDICT)
      }
  })

  it('draws no white when the run has finished but there is no guess', () => {
    expect(graph({ finished: true, guesses: null })).not.toContain(WHITE)
  })

  it('draws a different mark for each guess', () => {
    expect(new Set(growthAll.map((g) => graph({ finished: true, guesses: guesses(g, 'none') }))).size).toBe(3)
    expect(new Set(headAll.map((hs) => graph({ finished: true, guesses: guesses('thousand', hs) }))).size).toBe(3)
  })

  it('draws guess 1 as an arrow only for "about a million", which is off the top of the graph', () => {
    expect(graph({ finished: true, guesses: guesses('million', 'none') })).toContain('off this scale: about a million')
    expect(graph({ finished: true, guesses: guesses('ten', 'none') })).not.toContain('off this scale')
    expect(graph({ finished: true, guesses: guesses('thousand', 'none') })).not.toContain('off this scale')
  })

  it('states each guess in its box in the learner\'s words', () => {
    expect(graph({ finished: true, guesses: guesses('ten', 'none') })).toContain('about 10 times')
    expect(graph({ finished: true, guesses: guesses('thousand', 'small') })).toContain('about 1,000 times')
    expect(graph({ finished: true, guesses: guesses('thousand', 'small') })).toContain('a small difference')
    expect(graph({ finished: true, guesses: guesses('thousand', 'decides') })).toContain('it would decide')
  })
})

describe('Picture 1 caption', () => {
  const before = render(createElement(Part1GrowthCaption, { arrived: false }))
  const after = render(createElement(Part1GrowthCaption, { arrived: true }))

  it('lists every drawn element before the run ends, with the times from the module', () => {
    for (const text of ['amber line', 'violet line', 'red dashed lines', 'time since the Big Bang', '472 thousand years', '86 thousand years', 'about 9 seconds']) expect(before).toContain(text)
    expect(before).not.toContain('50 thousand')
  })

  it('shows the worked moment, the marker note and the three-part look-for items only once the run has ended', () => {
    for (const text of ['A worked moment.', 'The white marks are only markers', 'What to look for.']) {
      expect(before).not.toContain(text)
      expect(after).toContain(text)
    }
    expect(count(after, '<strong>Look at:</strong>')).toBe(4)
    expect(count(after, '<strong>What it means:</strong>')).toBe(4)
    expect(count(after, '<strong>Why it matters:</strong>')).toBe(4)
    expect(before).not.toContain('850')
    expect(after).toContain('850')
    expect(after).toContain('2,649')
    expect(after).toContain('28 percent more')
  })

  it('does not give the mechanism or a verdict', () => {
    for (const h of [before, after]) {
      expect(h).not.toContain('in step with')
      expect(h).not.toContain('savings')
      expect(h.replace('None of them says right or wrong', '')).not.toMatch(VERDICT)
    }
  })
})

describe('Part 2: the learner\'s two settings', () => {
  it('draws the strip for any settings without NaN, in a pink frame, with a glow only once a clump has formed', () => {
    for (const kind of ['ordinary', 'ordinary-plus-dark'] as const)
      for (const d of [1e-5, 1e-3, 2e-3]) {
        const h = render(createElement(StripPicture, { kind, startDelta: d, progress: 1 }))
        expect(h).not.toContain('NaN')
        expect(h).toContain('#f472b6')
        expect(h).not.toContain(WHITE)
      }
    expect(render(createElement(StripPicture, { kind: 'ordinary-plus-dark', startDelta: 1e-3, progress: 1 }))).toContain('A clump has formed')
    expect(render(createElement(StripPicture, { kind: 'ordinary-plus-dark', startDelta: 1e-3, progress: 0 }))).not.toContain('A clump has formed')
    expect(render(createElement(StripPicture, { kind: 'ordinary', startDelta: 1e-5, progress: 1 }))).not.toContain('A clump has formed')
  })

  it('draws violet dots only for ordinary plus dark matter', () => {
    expect(render(createElement(StripPicture, { kind: 'ordinary-plus-dark', startDelta: 1e-3, progress: 1 }))).toContain('Dark matter')
    expect(render(createElement(StripPicture, { kind: 'ordinary', startDelta: 1e-3, progress: 1 }))).not.toContain('Dark matter')
  })

  it('changes the pictures when a setting changes', () => {
    expect(render(createElement(StripPicture, { kind: 'ordinary', startDelta: 1e-3, progress: 1 }))).not.toBe(render(createElement(StripPicture, { kind: 'ordinary-plus-dark', startDelta: 1e-3, progress: 1 })))
    expect(render(createElement(ExcessGraph, { kind: 'ordinary', startDelta: 1e-4, progress: 1 }))).not.toBe(render(createElement(ExcessGraph, { kind: 'ordinary', startDelta: 1e-3, progress: 1 })))
    expect(render(createElement(NeededSizePicture, { startDelta: 1e-4 }))).not.toBe(render(createElement(NeededSizePicture, { startDelta: 1e-3 })))
  })

  it('draws the ripple graph with the clump line and the needed-size panel with its four rows, without NaN', () => {
    const e = render(createElement(ExcessGraph, { kind: 'ordinary-plus-dark', startDelta: 1e-3, progress: 1 }))
    for (const text of ['Your ripple: how much denser than average', 'Becomes a clump', 'Density excess (0.1 = 10% denser)']) expect(e).toContain(text)
    expect(e).not.toContain('NaN')
    const n = render(createElement(NeededSizePicture, { startDelta: 1e-3 }))
    for (const text of ["The oldest light's temperature ripple (not a density excess)", 'ordinary matter: 1 part in 850', 'with dark matter: 1 part in 2,650', 'Your starting size: 1 part in 1,000']) expect(n).toContain(text)
    expect(n).not.toContain('NaN')
  })

  it('has captions with a look-for item that follows the settings', () => {
    expect(render(createElement(StripCaption, {}))).toContain('<strong>Look at:</strong>')
    expect(render(createElement(ExcessCaption, { kind: 'ordinary-plus-dark', startDelta: 1e-3 }))).toContain('became a clump')
    expect(render(createElement(ExcessCaption, { kind: 'ordinary', startDelta: 1e-3 }))).toContain('did not become a clump')
    expect(render(createElement(NeededSizeCaption, { kind: 'ordinary', startDelta: 1e-3 }))).toContain('between the two')
    expect(render(createElement(NeededSizeCaption, { kind: 'ordinary', startDelta: 2e-3 }))).toContain('to the right of both')
    expect(render(createElement(NeededSizeCaption, { kind: 'ordinary', startDelta: 1e-5 }))).toContain('to the left of both')
  })
})

describe('Part 3: the results', () => {
  const html = (g: GrowthGuess, hs: HeadStartGuess, kind: 'ordinary' | 'ordinary-plus-dark' = 'ordinary-plus-dark', d = 1e-3) =>
    render(createElement(StructureFormationResults, { guesses: guesses(g, hs), kind, startDelta: d }))

  it('shows the guesses beside the results with a tag on each row, and never says right or wrong', () => {
    for (const g of growthAll)
      for (const hs of headAll) {
        const h = html(g, hs)
        expect(h).toContain('Your guesses')
        expect(count(h, '>your guess<')).toBe(2)
        expect(h.replace('not whether it is right', '')).not.toMatch(VERDICT)
        expect(h).not.toContain('NaN')
      }
  })

  it('shows no guess block and no tag before there is a guess', () => {
    const h = render(createElement(StructureFormationResults, { guesses: null, kind: 'ordinary', startDelta: 1e-3 }))
    expect(h).not.toContain('Your guesses')
    expect(h).not.toContain('>your guess<')
  })

  it('has the check-up with its five rows, published values, readings and the "What this table tells us" notes', () => {
    const h = html('thousand', 'small')
    for (const text of ['Table 1: Check-up', '(a) How many times', '(b) The same growth', '(c) The head start', '(d) The oldest light', '(e) When matter began', 'Carroll, Press and Turner', 'Planck 2018', 'more, by 1.1', 'less, by 22.1 percent', 'a factor of 3.12', 'within the published range', '826.5']) expect(h).toContain(text)
    expect(count(h, 'What this table tells us')).toBe(2)
    expect(count(h, '<strong>Why it matters:</strong>')).toBeGreaterThanOrEqual(5)
  })

  it('has Table 2 with the two starts and the pink row, and says the values are trial values', () => {
    const h = html('thousand', 'small')
    for (const text of ['Table 2: The starts and your own region', 'Ordinary matter', 'Ordinary plus dark matter', 'Your region', '849.7', '2,649.3', '1 part in 850', '1 part in 2,650', 'What your numbers show', 'trial values', 'do not say the real universe started that way']) expect(h).toContain(text)
  })

  it('never changes a table with a guess, and changes only the pink row and its note with the settings', () => {
    const tables = (h: string) => h.slice(h.indexOf('Table 1: Check-up'))
    const base = tables(html('thousand', 'small'))
    for (const g of growthAll) for (const hs of headAll) expect(tables(html(g, hs))).toBe(base)
    const table1 = (h: string) => h.slice(h.indexOf('Table 1: Check-up'), h.indexOf('Table 2:'))
    expect(table1(html('thousand', 'small', 'ordinary', 1e-5))).toBe(table1(html('thousand', 'small')))
    expect(tables(html('thousand', 'small', 'ordinary', 1e-5))).not.toBe(base)
  })

  it('takes the pink row from the chosen settings', () => {
    const row = (h: string) => h.slice(h.indexOf('<strong style="color:#f472b6">Your region</strong>'), h.indexOf('What this table tells us', h.indexOf('<strong style="color:#f472b6">Your region</strong>')))
    expect(row(html('thousand', 'small', 'ordinary', 1e-5))).toContain('1089.8')
    expect(row(html('thousand', 'small', 'ordinary', 1e-5))).toContain('it did not become a clump')
    expect(row(html('thousand', 'small', 'ordinary-plus-dark', 1e-3))).toContain('it became a clump')
  })

  it('does not answer the tutor\'s conceptual question or give the verdicts', () => {
    const h = html('thousand', 'small')
    for (const text of ['savings account', 'in step with the size of the universe', 'A simple calculation', 'A comparison from daily life', 'prediction was']) expect(h).not.toContain(text)
  })
})

describe('Part 4: the tutor', () => {
  it('asks three questions with no outcome and no verdict, naming the white marks', () => {
    for (const g of growthAll)
      for (const hs of headAll) {
        for (const step of ['observe', 'compare', 'conceptual'] as const) {
          const prompt = tutorPrompt(step, g, hs)
          expect(prompt).not.toMatch(VERDICT)
          expect(prompt).not.toContain('NaN')
          // none of the three questions gives a number from the results
          for (const number of ['850', '2,649', '2649', '3.1', '22']) expect(prompt).not.toContain(number)
        }
        expect(tutorPrompt('compare', g, hs)).toContain('white')
        expect(tutorPrompt('observe', g, hs)).toContain('white marks')
      }
  })

  it('starts on its first question and marks nothing until the explanation', () => {
    const h = render(createElement(StructureFormationTutor, { predictedGrowth: 'thousand', predictedHeadStart: 'small' }))
    expect(h).toContain('Look at the two lines on the growth graph')
    expect(h).not.toContain('That is what you guessed')
    expect(h).not.toContain('That is not what you guessed')
    expect(h).not.toContain('partly what you guessed')
  })

  it('marks each guess once, as the owner approved', () => {
    for (const g of growthAll)
      for (const hs of headAll) {
        const h = render(createElement(StructureFormationExplanation, { predictedGrowth: g, predictedHeadStart: hs }))
        const first = count(h, 'That is what you guessed') + count(h, 'That is not what you guessed')
        const partly = count(h, 'That is partly what you guessed')
        // guess 1 is marked "what you guessed" or "not what you guessed"; guess 2 is "partly" or "not"
        expect(partly).toBe(hs === 'none' ? 0 : 1)
        expect(first).toBe(hs === 'none' ? 2 : 1)
        expect(count(h, 'That is what you guessed')).toBe(g === 'thousand' ? 1 : 0)
        expect(h).not.toContain('NaN')
        expect(h).not.toMatch(VERDICT)
      }
  })

  it('has the eight points, the savings-account picture, the NASA quotation and the figures from the module', () => {
    const h = render(createElement(StructureFormationExplanation, { predictedGrowth: 'thousand', predictedHeadStart: 'small' }))
    for (const n of ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.']) expect(h).toContain(`<strong>${n} `)
    for (const text of ['savings account', 'Scientists think dark matter began to clump together first', '850', '2,649', '3.1', '1.686', '1,060', '2.65', '0.85', 'Cosmology 3', 'Cosmology 4', 'Cosmology 5', '1 part in 850', '1 part in 2,650', 'No official page read for this experiment']) expect(h).toContain(text)
  })
})
