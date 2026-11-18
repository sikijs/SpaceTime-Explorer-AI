import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { causeGuessMarker, runPartOne, runSeeingTheFallExperiment, spacingSummary } from '../physics/seeingTheFallExperiment'
import type { CauseChoice, LastFlashChoice, SpacingChoice } from '../physics/seeingTheFallExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { SeeingTheFallExperiment } from './SeeingTheFallExperiment'
import { GuessNotes, SeeingTheFallHeldBackLinks, SeeingTheFallIntro, SeeingTheFallLinks, seeingTheFallWordsEntries } from './SeeingTheFallIntro'
import { ClockCaption, ClockGraph, FlashRows, FlashesCaption, StretchCaption, StretchGraph } from './SeeingTheFallPictures'
import { SeeingTheFallResults } from './SeeingTheFallResults'
import { SeeingTheFallExplanation, SeeingTheFallTutor } from './SeeingTheFallTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says
// "right" or "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong|turned right around|right-hand|right edge|right of|to the right|right hand/g, '')
const WHITE = 'stroke="#ffffff"'
const spacings: SpacingChoice[] = ['same', 'closer', 'further']
const lasts: LastFlashChoice[] = ['soon', 'long-wait', 'never']
const causes: CauseChoice[] = ['gravity', 'motion', 'both']

const run = runPartOne()
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const count = (html: string, text: string) => html.split(text).length - 1
const results = (s: SpacingChoice, l: LastFlashChoice, c: CauseChoice, two = null as ReturnType<typeof runSeeingTheFallExperiment> | null) =>
  render(createElement(SeeingTheFallResults, { spacingGuess: s, lastFlashGuess: l, causeGuess: c, partTwo: two }))
const stretch = (g: { spacing: SpacingChoice; cause: CauseChoice } | null) => render(createElement(StretchGraph, { result: run, progress: 1, guesses: g }))
const clock = (g: LastFlashChoice | null) => render(createElement(ClockGraph, { result: run, progress: 1, guess: g }))

describe('Black Holes 6 renders (at rest)', () => {
  const html = render(createElement(SeeingTheFallExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 6: Seeing the Fall From Far Away: Does Anyone See the Traveler Cross?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    expect(html).toContain('imagine.gsfc.nasa.gov/science/objects/black_holes1.html')
    expect(html).toContain('science.nasa.gov/universe/black-holes/anatomy/')
    expect(html).toContain('target="_blank"')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
  })

  it('has an always-visible Start over, greyed out, and a disabled Run, and no "Change prediction"', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('draws no white mark, no NaN and none of the Part 1 pictures before the run', () => {
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('How to read Picture 1')
    expect(html).toContain('Pictures 1 to 3 appear here when you press Run')
  })

  it('has the two introduction drawings, schematic, with no numbers and no white', () => {
    expect(html).toContain('The observer’s view')
    expect(html).toContain('Two flashes')
    expect(count(html, 'A schematic drawn for this page, not to scale')).toBeGreaterThanOrEqual(2)
  })

  it('tells the learner the predictions never change the real pictures, and that guesses are drawn in white and shown again beside the results', () => {
    expect(html).toContain('never change with your guesses')
    expect(html).toContain('in white')
  })

  it('says the three questions in the approved words', () => {
    expect(html).toContain('As the traveler nears the horizon, how do the flashes arrive?')
    expect(html).toContain('Does the far-away observer ever receive the flash that is sent as the traveler crosses the horizon?')
    expect(html).toContain('Which of them do you think matters?')
    for (const label of ['At the same spacing as they were sent', 'Closer together', 'Further and further apart', 'Yes, soon after it is sent', 'No, it never arrives', 'Only gravity']) expect(html).toContain(label)
  })

  it('gives none of the answers before the run: no growth numbers, no held-back words or links, no colour', () => {
    for (const leak of ['hover just above', 'never appears to cross', 'eso1835', 'nustar.caltech', 'page8', '18,975', '19,000', '4.6 light-times', 'redder', 'redshift']) expect(html).not.toContain(leak)
  })

  it('has no verdict on a guess', () => {
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })
})

describe('the introduction, links and words', () => {
  it('holds the formula and the tenfold rule back until after the run', () => {
    const before = seeingTheFallWordsEntries(false).map((e) => `${e.term} ${e.meaning}`).join(' ')
    const after = seeingTheFallWordsEntries(true).map((e) => `${e.term} ${e.meaning}`).join(' ')
    expect(before).not.toContain('3.162')
    expect(before).not.toContain('4.6')
    expect(after).toContain('3.162')
    expect(after).toContain('4.6')
    expect(after.length).toBeGreaterThan(before.length)
  })

  it('defines every term the introduction promises', () => {
    const terms = seeingTheFallWordsEntries(false).map((e) => e.term.toLowerCase()).join(' | ')
    for (const word of ['flash', 'as sent', 'as received', 'observer', 'light travel time', 'stretch factor', 'horizon light-time']) expect(terms).toContain(word)
    expect(render(createElement(ReferencePanel, { entries: seeingTheFallWordsEntries(false) }))).toContain('Words and formulas')
  })

  it('shows two official pages from the start, and holds back the six that say what a watcher sees or measures', () => {
    const links = render(createElement(SeeingTheFallLinks))
    expect(links).not.toContain('page8')
    const held = render(createElement(SeeingTheFallHeldBackLinks))
    for (const url of ['page8.html', 'beyond-the-brink', 'frequently-asked-questions-faqs-on-black-holes', 'eso1835', 'arxiv.org/abs/1810.12641', 'nustar.caltech.edu/news/129', 's41586-021-03667-0']) expect(held).toContain(url)
    expect(held).toContain('1995')
    expect(held.replace(/style="[^"]*"/g, '')).not.toMatch(/redder|colou?r/i)
    expect(count(held, 'target="_blank"')).toBeGreaterThanOrEqual(7)
  })

  it('has notes under each question that name the picture and give nothing away', () => {
    expect(render(createElement(GuessNotes, { n: 1 }))).toContain('Picture 2')
    expect(render(createElement(GuessNotes, { n: 2 }))).toContain('Picture 3')
    expect(render(createElement(GuessNotes, { n: 3 }))).toContain('Picture 2')
    for (const n of [1, 2, 3] as const) expect(render(createElement(GuessNotes, { n }))).not.toMatch(/never arrives|grow|no limit/)
  })

  it('has an introduction without the answers', () => {
    const intro = render(createElement(SeeingTheFallIntro))
    for (const leak of ['never arrives', 'never receive', 'no limit', 'without limit', '4.6', 'both causes']) expect(intro).not.toContain(leak)
  })
})

describe('the pictures', () => {
  it('draw Picture 1 with no white at all and no NaN, before and after the run', () => {
    for (const progress of [0, 0.5, 1]) {
      const html = render(createElement(FlashRows, { result: run, progress }))
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
  })

  it('draw the flash dots of Picture 2 in the traveler’s cyan and the reference lines in grey, not white', () => {
    const html = stretch(null)
    expect(html).not.toContain('#ffffff')
    expect(html).not.toContain('NaN')
    expect(clock(null)).not.toContain('#ffffff')
    expect(clock(null)).not.toContain('NaN')
  })
})

describe('the white marks on Picture 2 (guesses 1 and 3)', () => {
  it('draw nothing white without a guess', () => {
    expect(stretch(null)).not.toContain(WHITE)
  })

  it('draw a YOUR GUESS box for each of the two guesses', () => {
    const html = stretch({ spacing: 'further', cause: 'both' })
    expect(count(html, 'YOUR GUESS')).toBe(2)
    expect(html).toContain('further and further apart')
    expect(html).toContain('both, together')
  })

  it('follow guess 1: each answer puts a different mark in a different place', () => {
    const marks = spacings.map((spacing) => stretch({ spacing, cause: 'both' }))
    expect(new Set(marks).size).toBe(3)
    expect(marks[0]).toContain('the same spacing')
    expect(marks[1]).toContain('closer together')
  })

  it('follow guess 3: each answer points to a different curve', () => {
    const marks = causes.map((cause) => stretch({ spacing: 'further', cause }))
    expect(new Set(marks).size).toBe(3)
    expect(causeGuessMarker('gravity')).not.toEqual(causeGuessMarker('motion'))
  })

  it('keep the real curves the same for every guess (the white parts are the only difference)', () => {
    const polylines = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    const base = polylines(stretch(null))
    for (const spacing of spacings) for (const cause of causes) expect(polylines(stretch({ spacing, cause }))).toBe(base)
  })
})

describe('the white mark on Picture 3 (guess 2)', () => {
  it('draws a YOUR GUESS box that follows the guess, and nothing white without one', () => {
    expect(clock(null)).not.toContain(WHITE)
    const marks = lasts.map((l) => clock(l))
    for (const html of marks) expect(count(html, 'YOUR GUESS')).toBe(1)
    expect(new Set(marks).size).toBe(3)
    expect(marks[2]).toContain('it never arrives')
    expect(marks[0]).toContain('soon after it is sent')
  })

  it('draws the real curve the same for every guess', () => {
    const polylines = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    const base = polylines(clock(null))
    for (const l of lasts) expect(polylines(clock(l))).toBe(base)
  })
})

describe('the captions', () => {
  it('give a worked moment and what to look for in three parts, and show items only once their feature is drawn', () => {
    const early = render(createElement(FlashesCaption, { result: run, started: true, complete: false }))
    const done = render(createElement(FlashesCaption, { result: run, started: true, complete: true }))
    expect(early).toContain('A worked moment')
    expect(count(done, 'Why it matters:')).toBeGreaterThan(count(early, 'Why it matters:'))
    expect(done).toContain('flash 20’s dashed line')
    expect(early).not.toContain('flash 20’s dashed line')
    for (const html of [done, render(createElement(StretchCaption, { result: run, complete: true, withGuesses: true })), render(createElement(ClockCaption, { result: run, complete: true, withGuess: true }))]) {
      expect(html).toContain('Look at')
      expect(html).toContain('What it means:')
      expect(html).toContain('Why it matters:')
    }
  })

  it('mention the white marks only when they are drawn, and say a mark is only a marker', () => {
    const without = render(createElement(StretchCaption, { result: run, complete: false, withGuesses: true }))
    const withMarks = render(createElement(StretchCaption, { result: run, complete: true, withGuesses: true }))
    expect(without).not.toContain('YOUR GUESS')
    expect(withMarks).toContain('YOUR GUESS')
    expect(withMarks).toContain('only a marker')
  })

  it('take their worked numbers from the module', () => {
    const spacing = spacingSummary(run)
    const html = render(createElement(FlashesCaption, { result: run, started: true, complete: true }))
    expect(html).toContain('2.45')
    expect(html).toContain(String(Number(spacing.lastReceived.toPrecision(3))))
    expect(render(createElement(StretchCaption, { result: run, complete: true }))).toContain('3.16')
  })

  it('say nothing about the mechanism or the verdict, which belong to the tutor', () => {
    for (const html of [render(createElement(FlashesCaption, { result: run, started: true, complete: true })), render(createElement(StretchCaption, { result: run, complete: true })), render(createElement(ClockCaption, { result: run, complete: true }))]) {
      expect(html).not.toContain('What is really happening')
      expect(html).not.toContain('never sees the traveler cross')
      expect(noOwnWords(html)).not.toMatch(VERDICT)
    }
  })
})

describe('Part 3, the results', () => {
  const base = results('further', 'never', 'both')

  it('never changes its tables with a guess', () => {
    const baseTables = tables(base)
    for (const s of spacings) for (const l of lasts) for (const c of causes) expect(tables(results(s, l, c))).toBe(baseTables)
  })

  it('shows the guesses with a tag on the rows they belong to, and says nothing about right or wrong', () => {
    expect(base).toContain('Further and further apart')
    expect(base).toContain('No, it never arrives')
    expect(base).toContain('Both, and together they matter more than either alone')
    expect(count(base, 'your guess')).toBeGreaterThanOrEqual(3)
    expect(noOwnWords(base)).not.toMatch(VERDICT)
    expect(results('same', 'soon', 'gravity')).toContain('At the same spacing as they were sent')
  })

  it('has four tables, each with a "What this table tells us" note, and a check-up first', () => {
    expect(count(base, '<table')).toBeGreaterThanOrEqual(3)
    expect(base).toContain('Table 1: A check-up on the calculation')
    expect(base.indexOf('Table 1: A check-up')).toBeLessThan(base.indexOf('Table 2: The fall'))
    expect(base).toContain('What this table tells us')
    expect(base).toContain('the same')
    expect(base).not.toContain('NaN')
  })

  it('gives the numbers of the Part 1 fall', () => {
    expect(base).toContain('Table 2: The fall of Part 1')
    expect(base).toContain('Table 4: Close to the horizon')
    expect(base).toContain('2.45')
    expect(base).toContain('5.03')
    expect(base).toContain('Never arrives')
  })

  it('says "Not run yet" until a Part 2 run exists, then follows it', () => {
    expect(base).toContain('Not run yet')
    const two = runSeeingTheFallExperiment('sgr-a-star', 5)
    const html = results('further', 'never', 'both', two)
    expect(html).not.toBe(base)
    expect(html).toContain('Sagittarius A*')
  })

  it('has the real observations marked as outside the model, with their dates and sources, and no colour', () => {
    expect(base).toContain('outside')
    for (const word of ['GRAVITY', '2018', 'NuSTAR', '2021', 'Goddard']) expect(base).toContain(word)
    expect(base).not.toMatch(/redder|redshift/i)
  })
})

describe('Part 4, the tutor', () => {
  it('starts with its observation question, which points to the white marks by name, and holds back the explanation', () => {
    const html = render(createElement(SeeingTheFallTutor, { predictedSpacing: 'further', predictedLastFlash: 'never', predictedCause: 'both' }))
    expect(html).toContain('white marks on Pictures 2 and 3')
    expect(html).not.toContain('Black Holes 5')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('marks each guess in the explanation, and nowhere earlier', () => {
    const right = render(createElement(SeeingTheFallExplanation, { predictedSpacing: 'further', predictedLastFlash: 'never', predictedCause: 'both' }))
    const wrong = render(createElement(SeeingTheFallExplanation, { predictedSpacing: 'same', predictedLastFlash: 'soon', predictedCause: 'gravity' }))
    expect(right).toContain('that matches what the model gives')
    expect(wrong).toContain('that is not what the model gives')
    expect(right).not.toBe(wrong)
  })

  it('takes its numbers from the module and keeps the mechanism and the conclusion here', () => {
    const html = render(createElement(SeeingTheFallExplanation, { predictedSpacing: 'further', predictedLastFlash: 'never', predictedCause: 'both' }))
    expect(html).toContain('5.03')
    expect(html).toContain('3.16')
    expect(html).not.toContain('NaN')
  })
})
