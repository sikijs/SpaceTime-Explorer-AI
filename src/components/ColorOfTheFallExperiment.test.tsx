import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { colorGuessMarker, massGuessMarker, runColorOfTheFallExperiment, runPartOne, visibleGuessMarker } from '../physics/colorOfTheFallExperiment'
import type { ColorChoice, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { ColorOfTheFallExperiment } from './ColorOfTheFallExperiment'
import { ColorOfTheFallHeldBackLinks, ColorOfTheFallIntro, ColorOfTheFallLinks, GuessNotes, colorOfTheFallWordsEntries } from './ColorOfTheFallIntro'
import { ColorStrip, GraphCaption, StripCaption, WavelengthGraph } from './ColorOfTheFallPictures'
import { ColorOfTheFallResults } from './ColorOfTheFallResults'
import { ColorOfTheFallExplanation, ColorOfTheFallTutor } from './ColorOfTheFallTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says
// "right" or "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong|turned right around|right-hand|right edge|right of|to the right|right hand|nothing here says whether they are right/g, '')
const WHITE = 'stroke="#ffffff"'
const colors: ColorChoice[] = ['same', 'bluer', 'limit', 'no-limit']
const visibles: VisibleChoice[] = ['all-the-way', 'near-horizon', 'well-before']
const masses: MassChoice[] = ['small', 'big', 'same']

const run = runPartOne()
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const count = (html: string, text: string) => html.split(text).length - 1
const polylines = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
const results = (c: ColorChoice, v: VisibleChoice, m: MassChoice, two = null as ReturnType<typeof runColorOfTheFallExperiment> | null) =>
  render(createElement(ColorOfTheFallResults, { colorGuess: c, visibleGuess: v, massGuess: m, partTwo: two }))
const strip = (g: ColorChoice | null, progress = 1) => render(createElement(ColorStrip, { result: run, progress, guess: g }))
const graph = (g: { color: ColorChoice; visible: VisibleChoice } | null, panel?: { complete: boolean; guess: MassChoice | null }, progress = 1) =>
  render(createElement(WavelengthGraph, { result: run, progress, guesses: g, panel }))

describe('Black Holes 7 renders (at rest)', () => {
  const html = render(createElement(ColorOfTheFallExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 7: The Color of the Fall: What Color Does the Falling Traveler’s Light Have?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    for (const url of ['01_intro', '02_anatomy', '09_visiblelight', '07_infraredwaves', '06_microwaves', '05_radiowaves']) expect(html).toContain(`science.nasa.gov/ems/${url}/`)
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
    expect(html).toContain('Pictures 1 and 2 appear here when you press Run')
  })

  it('has the crests drawing, schematic, with no numbers on it and no white', () => {
    expect(html).toContain('A lamp’s crests')
    expect(html).toContain('A schematic drawn for this page, not to scale')
    expect(html).not.toContain('#ffffff')
  })

  it('tells the learner the predictions never change the real pictures, and that guesses are drawn in white and shown again beside the results', () => {
    expect(html).toContain('never change with your guesses')
    expect(html).toContain('in white')
    expect(html).toContain('press Start over')
  })

  it('says the three questions in the approved words', () => {
    expect(html).toContain('As the traveler falls, what happens to the color the observer receives?')
    expect(html).toContain('does the lamp&#x27;s light stay visible to the eye all the way down?'.replace('&#x27;', "'"))
    expect(html).toContain('be different for a 10-Sun black hole and for M87*?')
    for (const label of ['It stays green', 'It turns bluer (a shorter wavelength)', 'Yes, all the way to the horizon, only dimmer', 'No, the same']) expect(html).toContain(label)
  })

  it('gives none of the answers before the run: no held-back links, no formula, no worked numbers', () => {
    for (const leak of ['eso1825', 'page8', '1807.09409', 'gravitational redshift', 'Formula: the received wavelength', '869.6', '1.581', '10.4 mm', '6.83', 'S2']) expect(html).not.toContain(leak)
  })

  it('has no verdict on a guess', () => {
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })
})

describe('the introduction, links and words', () => {
  it('holds the formula and the word "redshift" back until after the run', () => {
    const before = colorOfTheFallWordsEntries(false).map((e) => `${e.term} ${e.meaning}`).join(' ')
    const after = colorOfTheFallWordsEntries(true).map((e) => `${e.term} ${e.meaning}`).join(' ')
    expect(before).not.toContain('1.581')
    expect(before).not.toContain('Redshift')
    expect(after).toContain('1.581')
    expect(after).toContain('869.6')
    expect(after).toContain('Redshift')
    expect(after.length).toBeGreaterThan(before.length)
  })

  it('defines every term the introduction promises', () => {
    const terms = colorOfTheFallWordsEntries(false).map((e) => e.term.toLowerCase()).join(' | ')
    for (const word of ['wavelength', 'nanometer', 'visible light', 'infrared', 'microwave', 'radio waves', 'as emitted', 'horizon', 'gap above the horizon', 'stretch factor', 'period']) expect(terms).toContain(word)
    expect(render(createElement(ReferencePanel, { entries: colorOfTheFallWordsEntries(false) }))).toContain('Words and formulas')
  })

  it('shows six NASA pages from the start, and holds back the three that say what a watcher sees or measures', () => {
    const links = render(createElement(ColorOfTheFallLinks))
    expect(count(links, 'target="_blank"')).toBe(6)
    for (const url of ['page8', 'eso1825', '1807.09409']) expect(links).not.toContain(url)
    const held = render(createElement(ColorOfTheFallHeldBackLinks))
    for (const url of ['imagine.gsfc.nasa.gov/educators/blackholes/imagine/page8.html', 'eso.org/public/news/eso1825/', 'arxiv.org/abs/1807.09409']) expect(held).toContain(url)
    expect(held).toContain('2015')
    expect(count(held, 'target="_blank"')).toBe(3)
  })

  it('has notes under each question that name the picture and give nothing away', () => {
    expect(render(createElement(GuessNotes, { n: 1 }))).toContain('Picture 1')
    expect(render(createElement(GuessNotes, { n: 2 }))).toContain('750 nm line')
    expect(render(createElement(GuessNotes, { n: 3 }))).toContain('small panel')
    for (const n of [1, 2, 3] as const) expect(render(createElement(GuessNotes, { n }))).not.toMatch(/no limit|redder|same/)
  })

  it('has an introduction without the answers', () => {
    const intro = render(createElement(ColorOfTheFallIntro))
    for (const leak of ['redshift', 'no limit', 'without limit', 'leaves visible', 'microwave band', '870', '1.581', 'does not depend']) expect(intro).not.toContain(leak)
    expect(intro).not.toMatch(/Experiment [0-9]/)
  })
})

describe('the pictures', () => {
  it('draw nothing white without a guess, before and after the run, and no NaN', () => {
    for (const progress of [0, 0.5, 1]) {
      const s = strip(null, progress)
      const g = graph(null, undefined, progress)
      for (const html of [s, g]) {
        expect(html).not.toContain('#ffffff')
        expect(html).not.toContain('NaN')
      }
    }
  })

  it('draw the “traveler now” dot of Picture 2 in the traveler’s cyan, with its legend', () => {
    const html = graph(null)
    expect(html).toContain('the traveler, now')
    expect(html).toContain('fill="#22d3ee" stroke="#fb923c"')
    expect(html).not.toContain('where the traveler is now')
  })

  it('draw the picture for the learner’s own settings with no white and no panel', () => {
    const two = runColorOfTheFallExperiment('sgr-a-star', 5)
    const html = render(createElement(WavelengthGraph, { result: two, progress: 1 })) + render(createElement(ColorStrip, { result: two, progress: 1 }))
    expect(html).not.toContain('#ffffff')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('at 5 horizon radii from the center, for two black holes')
  })
})

describe('the white mark on the strip (guess 1)', () => {
  it('draws a YOUR GUESS box that follows the guess', () => {
    const marks = colors.map((c) => strip(c))
    for (const html of marks) expect(count(html, 'YOUR GUESS')).toBe(1)
    expect(new Set(marks).size).toBe(4)
    expect(marks[0]).toContain('it stays green')
    expect(marks[3]).toContain('redder, with no limit')
    expect(colorGuessMarker('same')).not.toEqual(colorGuessMarker('bluer'))
  })

  it('keeps the real strip the same for every guess', () => {
    const rects = (h: string) => (h.match(/<rect[^>]*>/g) ?? []).filter((r) => !r.includes('#ffffff')).join('')
    const base = rects(strip(null))
    for (const c of colors) expect(rects(strip(c))).toBe(base)
  })
})

describe('the white marks on Picture 2 (guesses 1, 2 and 3)', () => {
  it('draw a YOUR GUESS box for each of the two guesses on the graph', () => {
    const html = graph({ color: 'no-limit', visible: 'well-before' })
    expect(count(html, 'YOUR GUESS')).toBe(2)
    expect(html).toContain('redder, with no limit')
    expect(html).toContain('not visible well before')
    expect(graph(null)).not.toContain(WHITE)
  })

  it('follow guess 1 and guess 2: each answer puts a different mark in a different place', () => {
    const c = colors.map((color) => graph({ color, visible: 'well-before' }))
    expect(new Set(c).size).toBe(4)
    const v = visibles.map((visible) => graph({ color: 'no-limit', visible }))
    expect(new Set(v).size).toBe(3)
    expect(visibleGuessMarker('all-the-way')).not.toEqual(visibleGuessMarker('near-horizon'))
  })

  it('draw the small panel with its own title, and its bars and white mark only once the run has finished', () => {
    const during = graph(null, { complete: false, guess: null }, 0.5)
    expect(during).toContain('The color at 5 horizon radii from the center, for two black holes')
    expect(during).toContain('Drawn when the run finishes')
    expect(during).not.toContain('M87*</text>')
    const done = graph(null, { complete: true, guess: null })
    expect(done).toContain('M87*')
    expect(done).toContain('10-Sun black hole')
    expect(done).not.toContain('YOUR GUESS')
  })

  it('follow guess 3: each answer draws a different mark in the panel', () => {
    const marks = masses.map((m) => graph(null, { complete: true, guess: m }))
    for (const html of marks) expect(count(html, 'YOUR GUESS')).toBe(1)
    expect(new Set(marks).size).toBe(3)
    expect(massGuessMarker('same')).not.toEqual(massGuessMarker('big'))
    expect(marks[2]).toContain('the same for both')
  })

  it('keep the real curve and bars the same for every guess (the white parts are the only difference)', () => {
    const bars = (h: string) => (h.match(/<rect[^>]*fill="#fb923c"[^>]*>/g) ?? []).join('')
    const base = polylines(graph(null, { complete: true, guess: null }))
    const baseBars = bars(graph(null, { complete: true, guess: null }))
    for (const c of colors) for (const v of visibles) for (const m of masses) {
      const html = graph({ color: c, visible: v }, { complete: true, guess: m })
      expect(polylines(html)).toBe(base)
      expect(bars(html)).toBe(baseBars)
    }
  })
})

describe('the captions', () => {
  it('give a worked moment and what to look for in three parts, and show items only once their feature is drawn', () => {
    const early = render(createElement(StripCaption, { result: run, started: true, complete: false }))
    const done = render(createElement(StripCaption, { result: run, started: true, complete: true }))
    expect(early).toContain('A worked moment')
    expect(count(done, 'Why it matters:')).toBeGreaterThan(count(early, 'Why it matters:'))
    expect(done).toContain('crosses the red edge of the rainbow')
    expect(early).not.toContain('crosses the red edge of the rainbow')
    const g = render(createElement(GraphCaption, { result: run, complete: true, withGuesses: true }))
    for (const html of [done, g]) {
      expect(html).toContain('Look at')
      expect(html).toContain('What it means:')
      expect(html).toContain('Why it matters:')
    }
  })

  it('mention the white marks and the small panel only when they are drawn, and say a mark is only a marker', () => {
    const without = render(createElement(GraphCaption, { result: run, complete: false, withGuesses: true }))
    const withMarks = render(createElement(GraphCaption, { result: run, complete: true, withGuesses: true }))
    expect(without).not.toContain('YOUR GUESS')
    expect(without).not.toContain('has its own title')
    expect(withMarks).toContain('YOUR GUESS')
    expect(withMarks).toContain('has its own title')
    expect(withMarks).toContain('only a marker')
    expect(render(createElement(StripCaption, { result: run, started: true, complete: true, withGuess: true }))).toContain('only a marker')
  })

  it('take their worked numbers from the module', () => {
    const html = render(createElement(StripCaption, { result: run, started: true, complete: true }))
    expect(html).toContain('870')
    expect(html).toContain('1.58')
    expect(html).toContain('580')
    expect(html).toContain('6.83')
    expect(render(createElement(GraphCaption, { result: run, complete: true }))).toContain('870')
  })

  it('say nothing about the mechanism or the verdict, which belong to the tutor', () => {
    for (const html of [render(createElement(StripCaption, { result: run, started: true, complete: true, withGuess: true })), render(createElement(GraphCaption, { result: run, complete: true, withGuesses: true }))]) {
      expect(html).not.toContain('What is really happening')
      expect(html).not.toContain('equal steps of its own clock')
      expect(noOwnWords(html)).not.toMatch(VERDICT)
    }
  })
})

describe('Part 3, the results', () => {
  const base = results('no-limit', 'well-before', 'same')

  it('never changes its tables with a guess', () => {
    const baseTables = tables(base)
    for (const c of colors) for (const v of visibles) for (const m of masses) expect(tables(results(c, v, m))).toBe(baseTables)
  })

  it('shows the guesses with a tag on the rows they belong to, and says nothing about right or wrong', () => {
    expect(base).toContain('It turns redder (a longer wavelength) and keeps on getting redder, with no limit')
    expect(base).toContain('No, it stops being visible light well before the horizon')
    expect(base).toContain('No, the same')
    expect(count(base, 'your guess')).toBeGreaterThanOrEqual(3)
    expect(noOwnWords(base)).not.toMatch(VERDICT)
    expect(results('same', 'all-the-way', 'small')).toContain('It stays green')
  })

  it('has four tables, each with a "What this table tells us" note, and a check-up first', () => {
    expect(count(base, '<table')).toBeGreaterThanOrEqual(3)
    expect(base).toContain('Table 1: A check-up on the calculation')
    expect(base.indexOf('Table 1: A check-up')).toBeLessThan(base.indexOf('Table 2: The fall'))
    for (const t of ['Table 2: The fall of Part 1', 'Table 3: Your own run', 'Table 4: Two black holes at 5 horizon radii']) expect(base).toContain(t)
    expect(count(base, 'What this table tells us')).toBeGreaterThanOrEqual(3)
    expect(base).toContain('the same')
    expect(base).not.toContain('NaN')
  })

  it('gives the numbers of the Part 1 fall', () => {
    for (const n of ['580 nm', '870 nm', '1.74 µm', '105 µm', '1.04 mm', '10.4 mm', '6.83 horizon radii', '5.83 above the horizon']) expect(base).toContain(n)
    expect(base).toContain('7.9 horizon radii')
  })

  it('says "Not run yet" until a Part 2 run exists, then follows it', () => {
    expect(base).toContain('Not run yet')
    const two = runColorOfTheFallExperiment('sgr-a-star', 5)
    const html = results('no-limit', 'well-before', 'same', two)
    expect(html).not.toBe(base)
    expect(html).toContain('Sagittarius A*')
    expect(html).toContain('trial values')
  })

  it('has the real observations marked as outside the model, with their dates and sources, and the 750 nm note', () => {
    expect(base).toContain('outside')
    for (const word of ['Goddard', '2015', 'ESO', '2018', 'S2', 'Sagittarius A*', 'gravitational redshift', 'siren', 'What this model can and cannot tell you']) expect(base).toContain(word)
    expect(base).toContain('700 nm')
  })
})

describe('Part 4, the tutor', () => {
  it('starts with its observation question, which points to the white marks by name, and holds back the explanation', () => {
    const html = render(createElement(ColorOfTheFallTutor, { predictedColor: 'no-limit', predictedVisible: 'well-before', predictedMass: 'same' }))
    expect(html).toContain('white marks on Pictures 1 and 2')
    expect(html).not.toContain('Black Holes 6')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('marks each guess in the explanation, and nowhere earlier', () => {
    const right = render(createElement(ColorOfTheFallExplanation, { predictedColor: 'no-limit', predictedVisible: 'well-before', predictedMass: 'same' }))
    const wrong = render(createElement(ColorOfTheFallExplanation, { predictedColor: 'same', predictedVisible: 'all-the-way', predictedMass: 'small' }))
    expect(count(right, 'that matches what the model gives')).toBe(3)
    expect(count(wrong, 'that is not what the model gives')).toBe(3)
    expect(right).not.toBe(wrong)
  })

  it('takes its numbers from the module and keeps the mechanism, the word redshift and the real star here', () => {
    const html = render(createElement(ColorOfTheFallExplanation, { predictedColor: 'no-limit', predictedVisible: 'well-before', predictedMass: 'same' }))
    for (const n of ['870 nm', '1.58', '6.83', '1.12', '1.41']) expect(html).toContain(n)
    expect(html).toContain('redshift')
    expect(html).toContain('S2')
    expect(html).not.toContain('NaN')
    expect(html).not.toMatch(/Experiment [0-9]/)
  })
})
