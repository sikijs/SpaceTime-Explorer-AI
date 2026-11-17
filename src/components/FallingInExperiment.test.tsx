import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runFallingInExperiment, runPartOne } from '../physics/fallingInExperiment'
import type { EndChoice, FarClockChoice, StretchChoice } from '../physics/fallingInExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { FallingInExperiment } from './FallingInExperiment'
import {
  BlackHoleOptionsNote,
  FallingInHeldBackLinks,
  FallingInIntro,
  FallingInLinks,
  GuessNotes,
  PartTwoGuide,
  RealThings,
  fallingInWordsEntries,
} from './FallingInIntro'
import { FallCaption, FallPanel, StretchCaption, StretchGraph, TimeCaption, TimeGraph, fallScale, stateAt } from './FallingInPictures'
import { FallingInResults } from './FallingInResults'
import { FallingInExplanation, FallingInTutor } from './FallingInTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says
// "right" or "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
// A verdict on a guess. The page's own "does not say whether they are right" is taken out first.
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong|turned right around|right-hand|right edge|right of|to the right|right hand/g, '')
const WHITE = 'stroke="#ffffff"'
const ends: EndChoice[] = ['finite', 'never', 'depends']
const fars: FarClockChoice[] = ['same', 'settles', 'no-limit']
const stretches: StretchChoice[] = ['small', 'same', 'giant']

const run = runPartOne()
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const results = (e: EndChoice, f: FarClockChoice, s: StretchChoice, two = null as ReturnType<typeof runFallingInExperiment> | null) =>
  render(createElement(FallingInResults, { endGuess: e, farClockGuess: f, stretchGuess: s, partTwo: two }))
const time = (g: Parameters<typeof TimeGraph>[0]['guesses']) => render(createElement(TimeGraph, { result: run, progress: 1, guesses: g }))
const stretch = (g: StretchChoice | null) => render(createElement(StretchGraph, { presetId: 'stellar-black-hole', currentR: 1, guess: g }))
const count = (html: string, text: string) => html.split(text).length - 1

describe('Black Holes 5 renders (at rest)', () => {
  const html = render(createElement(FallingInExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 5: Falling In: What Does the Traveler Experience?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    expect(html).toContain('science.nasa.gov/universe/black-holes/')
    expect(html).toContain('science.nasa.gov/moon/tides/')
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
    expect(html).not.toContain('Picture 1: the fall')
    expect(html).not.toContain('How near the horizon, on each clock')
    expect(html).toContain('Pictures 1 to 3 appear here when you press Run')
  })

  it('has the two introduction drawings, schematic and with no numbers', () => {
    expect(html).toContain('Two watches.')
    expect(html).toContain('Why the feet are pulled harder.')
    expect(count(html, 'A schematic drawn for this page, not to scale')).toBe(2)
  })

  it('tells the learner the predictions never change the real pictures, that guesses are drawn in white and shown again beside the results', () => {
    expect(html).toContain('The real pictures and tables never change with your guesses')
    expect(html).toContain('drawn on them in white')
  })

  it('gives none of the answers before the run: no far-away reading, no stretch size, no spaghettification, no G2, no held-back links', () => {
    for (const leak of ['spaghettification', 'Spaghettification', 'G2', 'ln 10', '48.99', '64.4', '2.1 × 10⁷', 'eso1151', 'eso2018', 'beyond-the-brink', 'page8', 'growing stronger', 'Real things pulled toward black holes']) expect(html).not.toContain(leak)
  })

  it('says the three questions in the approved words', () => {
    expect(html).toContain("A traveler is dropped from rest near a black hole and falls straight toward it. On the traveler's own watch, does the trip to the horizon come to an end?")
    expect(html).toContain("A clock sits at rest far away and keeps time for the whole fall. As the traveler nears the horizon, what does that far-away clock read?")
    expect(html).toContain('At the moment a traveler reaches the horizon, how does the stretching (the difference in pull between their head and their feet) compare between a small black hole (10 Suns) and a giant one (Sagittarius A*)?')
    expect(html).toContain('It ends for some black holes and not for others')
  })

  it('has no verdict on a guess', () => {
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })
})

describe('the introduction, links and words', () => {
  it('uses NASA\'s tides page as the everyday example and defines its terms', () => {
    const html = render(createElement(FallingInIntro))
    for (const term of ['traveler’s clock', 'far-away clock', 'horizon light-time', 'stretch', 'astronomical unit', 'from rest']) expect(html.toLowerCase()).toContain(term)
    expect(html).toContain('NASA explains that the Moon')
    const links = render(createElement(FallingInLinks))
    expect(links).toContain('Want to know more?')
    expect((links.match(/target="_blank"/g) ?? []).length).toBe(2)
  })

  it('holds the answer-giving words and links back until after the run', () => {
    const before = fallingInWordsEntries(false)
    const after = fallingInWordsEntries(true)
    expect(before.map((e) => e.term)).toContain('Formula: the stretch')
    expect(JSON.stringify(before)).not.toContain('48.99')
    expect(JSON.stringify(before)).not.toContain('ln 10')
    expect(after.map((e) => e.term)).toEqual(expect.arrayContaining(["Formula: the traveler's clock", 'The far-away clock near the horizon']))
    expect(JSON.stringify(after)).toContain('48.99')
    const held = render(createElement(FallingInHeldBackLinks))
    for (const url of ['beyond-the-brink', 'page8.html', 'eso1151', 'eso1512', 'eso2018', 'tdes_swift', 'nasas-swift-sees-wandering', 'frequently-asked-questions-faqs-on-black-holes']) expect(held).toContain(url)
    expect(render(createElement(ReferencePanel, { entries: after }))).toContain('Words and formulas')
  })

  it('has notes under each question that give nothing away', () => {
    for (const n of [1, 2, 3] as const) {
      const notes = render(createElement(GuessNotes, { n }))
      expect(notes).toContain('The situation.')
      expect(notes).toContain('What the choices mean.')
      expect(notes).toContain('How to answer.')
      expect(notes).not.toContain('48.99')
      expect(notes).not.toContain('without limit, however')
      expect(noOwnWords(notes)).not.toMatch(VERDICT)
    }
    expect(render(createElement(GuessNotes, { n: 1 }))).toContain('295 km')
  })

  it('has real things only in the block that appears after the run: stars, G2 with its outcome, small and large black holes, each with its limits', () => {
    const real = render(createElement(RealThings))
    expect(real).toContain('spaghettification')
    expect(real).toContain('Infalling objects stretch out like noodles')
    expect(real).toContain('27 July 2026')
    expect(real).toContain('G2')
    expect(real).toContain('could not confirm any significant stretching')
    expect(real).toContain('young star with a massive core')
    expect(real).toContain('May 2014')
    expect(real).not.toContain('mid-2013')
    expect(real).toContain('last updated in 1995')
    expect(real).toContain('Neither NASA page is about a star')
    expect(real).toContain('Nothing has ever been seen crossing one')
    expect(real).not.toContain('NaN')
  })

  it('has a Part 2 guide that says the results and tutor stay, and an options note in kilometers', () => {
    expect(render(createElement(PartTwoGuide))).toContain('The results and the tutor stay where they are')
    expect(render(createElement(BlackHoleOptionsNote))).toContain('29.5 km')
  })
})

describe('the pictures', () => {
  it('draws the fall with no white at all, and the same fall for the same inputs', () => {
    const s = fallScale(10)
    const html = render(createElement(FallPanel, { result: run, progress: 1, pixelsPerHorizonRadius: s.pixelsPerHorizonRadius, scaleBarHorizonRadii: s.scaleBarHorizonRadii }))
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('fill="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toContain('still rising: it has no limit')
    const start = render(createElement(FallPanel, { result: run, progress: 0, pixelsPerHorizonRadius: s.pixelsPerHorizonRadius, scaleBarHorizonRadii: s.scaleBarHorizonRadii }))
    expect(start).not.toContain('still rising')
    expect(stateAt(run, 0).r).toBe(10)
    expect(stateAt(run, 1e9).r).toBe(1)
  })

  it('draws "the traveler, now" in Picture 3 in cyan, not white', () => {
    const html = stretch(null)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('fill="#ffffff"')
    expect(html).toContain('the traveler, now')
    expect(html).toContain('cyan dot')
  })
})

describe('the white marks on Picture 2', () => {
  it('draw nothing white without a guess', () => {
    const bare = time(null)
    expect(bare).not.toContain(WHITE)
    expect(bare).not.toContain('YOUR GUESS')
    expect(bare).not.toContain('NaN')
  })

  it('draw a YOUR GUESS box for guess 1 and follow it', () => {
    const outputs = ends.map((e) => time({ end: e, far: null }))
    expect(new Set(outputs).size).toBe(3)
    for (const o of outputs) {
      expect(o).toContain(WHITE)
      expect(count(o, 'YOUR GUESS')).toBe(1)
    }
    expect(outputs[0]).toContain('finite: reaches the horizon')
    expect(outputs[1]).toContain('never: keeps going')
    expect(outputs[1]).toContain('<polygon')
    expect(outputs[2]).toContain('depends on the black hole')
  })

  it('draw a YOUR GUESS box for guess 2 and follow it', () => {
    const outputs = fars.map((f) => time({ end: null, far: f }))
    expect(new Set(outputs).size).toBe(3)
    for (const o of outputs) expect(count(o, 'YOUR GUESS')).toBe(1)
    expect(outputs[2]).toContain('later and later, no limit')
    expect(outputs[0]).toContain('about the same')
    expect(outputs[1]).toContain('somewhat more, then settles')
  })

  it('draw both guesses together and keep the real curves the same for every guess', () => {
    const real = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    const bare = real(time(null))
    const seen = new Set<string>()
    for (const e of ends) for (const f of fars) {
      const h = time({ end: e, far: f })
      expect(count(h, 'YOUR GUESS')).toBe(2)
      expect(real(h)).toBe(bare)
      seen.add(h)
    }
    expect(seen.size).toBe(9)
  })
})

describe('the white mark on Picture 3', () => {
  it('draws a YOUR GUESS box that follows the guess, and nothing white without one', () => {
    const outputs = stretches.map((s) => stretch(s))
    expect(new Set(outputs).size).toBe(3)
    for (const o of outputs) {
      expect(o).toContain(WHITE)
      expect(count(o, 'YOUR GUESS')).toBe(1)
      expect(o).not.toContain('NaN')
    }
    expect(outputs[0]).toContain('stronger at the small hole')
    expect(outputs[1]).toContain('≈')
    expect(outputs[2]).toContain('stronger at the giant hole')
  })

  it('draws the real curves the same for every guess (the white connector is not a curve)', () => {
    const real = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).filter((t) => !t.includes('#ffffff')).join('')
    const bare = real(stretch(null))
    for (const s of stretches) expect(real(stretch(s))).toBe(bare)
  })
})

describe('the captions', () => {
  it('give the worked moment and what to look for in three parts, and show the guess item only when the marks are drawn', () => {
    for (const C of [FallCaption, TimeCaption, StretchCaption]) {
      const during = render(createElement(C, { complete: false, result: run }))
      const after = render(createElement(C, { complete: true, result: run }))
      for (const h of [during, after]) {
        expect(h).toContain('What to look for')
        expect(h).toContain('Look at:')
        expect(h).toContain('What it means:')
        expect(h).toContain('Why it matters:')
        expect(h).toContain('A worked moment')
        expect(h).not.toContain('NaN')
        expect(noOwnWords(h)).not.toMatch(VERDICT)
      }
      expect(during).not.toContain('YOUR GUESS')
      if (C !== FallCaption) expect(after).toContain('YOUR GUESS')
      expect(render(createElement(C, { complete: true, own: true, result: run }))).not.toContain('YOUR GUESS')
    }
  })

  it('take their worked numbers from the module', () => {
    const fall = render(createElement(FallCaption, { complete: true, result: run }))
    expect(fall).toContain('48.99')
    expect(fall).toContain('4.83 thousandths of a second')
    expect(fall).toContain('1,000 times')
    const t = render(createElement(TimeCaption, { complete: true, result: run }))
    expect(t).toContain('62.15')
    expect(render(createElement(StretchCaption, { complete: true, result: run }))).toContain('276')
    const own = runFallingInExperiment('sgr-a-star', 5)
    expect(render(createElement(FallCaption, { complete: true, own: true, result: own }))).toContain('11.9 minutes')
  })
})

describe('Part 3, the results', () => {
  const base = results('finite', 'no-limit', 'small')

  it('never changes its tables with a guess', () => {
    const t = tables(base)
    for (const e of ends) for (const f of fars) for (const s of stretches) expect(tables(results(e, f, s))).toBe(t)
  })

  it('shows the guesses with a tag on the rows they belong to, and says nothing about right or wrong', () => {
    expect(base).toContain('Your guesses, beside the results')
    expect(count(base, 'your guess</span>')).toBeGreaterThanOrEqual(7)
    expect(noOwnWords(base)).not.toMatch(VERDICT)
    expect(base).toContain('Yes: it takes a finite time, and they get there')
    expect(results('never', 'same', 'giant')).toContain('Much stronger at the giant black hole')
  })

  it('has four tables, each with a "What this table tells us" note in the four parts, and a check-up first', () => {
    expect(count(base, '<strong>What this table tells us</strong>')).toBe(4)
    expect(count(base, '<strong>What it is.</strong>')).toBe(4)
    expect(count(base, '<strong>What it means.</strong>')).toBe(4)
    expect(count(base, '<strong>Why it matters.</strong>')).toBe(4)
    expect(count(base, '<strong>How sure we are.</strong>')).toBe(4)
    expect(base.indexOf('Table 1: A check-up')).toBeLessThan(base.indexOf('Table 2: The fall of Part 1'))
    expect(base).toContain('the same')
    expect(base).toContain('more')
  })

  it('gives the numbers of the Part 1 fall and the three black holes', () => {
    expect(base).toContain('48.99')
    expect(base).toContain('4.83 thousandths of a second')
    expect(base).toContain('34.6 minutes')
    expect(base).toContain('36.3 days')
    expect(base).toContain('2.1 × 10⁷ g')
    expect(base).toContain('1.1 × 10⁻⁴ g')
    expect(base).not.toContain('NaN')
  })

  it('says "Not run yet" until a Part 2 run exists, then follows it', () => {
    expect(base).toContain('Not run yet')
    const own = runFallingInExperiment('sgr-a-star', 20)
    const withOwn = results('finite', 'no-limit', 'small', own)
    expect(withOwn).not.toContain('Not run yet')
    expect(withOwn).toContain('Sagittarius A*')
    expect(withOwn).toContain('20 horizon radii')
    expect(withOwn).not.toContain('NaN')
  })

  it('works the simple math from the module, with the real things and the held-back links after the first run', () => {
    expect(base).toContain('31.62')
    expect(base).toContain('9.81 m/s²')
    expect(base).toContain('Real things pulled toward black holes, and recent news')
    expect(base).toContain('beyond-the-brink')
    expect(base).toContain('What this model can and cannot tell you')
    expect(base).toContain('A comparison from daily life')
    expect(base).not.toContain('far more than any body could survive')
  })
})

describe('Part 4, the tutor', () => {
  it('starts with its observation question, which points to the white marks by name, and holds back the explanation', () => {
    const html = render(createElement(FallingInTutor, { predictedEnd: 'finite', predictedFarClock: 'no-limit', predictedStretch: 'small' }))
    expect(html).toContain('white YOUR GUESS marks on Pictures 2 and 3')
    expect(html).not.toContain('First guess.')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Continue<\/button>/)
  })

  it('marks each guess in the explanation, and nowhere earlier', () => {
    for (const e of ends) for (const f of fars) for (const s of stretches) {
      const html = render(createElement(FallingInExplanation, { predictedEnd: e, predictedFarClock: f, predictedStretch: s }))
      expect(count(html, 'That matches the model') + count(html, 'That differs from the model')).toBe(3)
      expect(html.includes('That matches the model')).toBe(e === 'finite' || f === 'no-limit' || s === 'small')
      expect(html).not.toContain('NaN')
    }
    const right = render(createElement(FallingInExplanation, { predictedEnd: 'finite', predictedFarClock: 'no-limit', predictedStretch: 'small' }))
    expect(count(right, 'That matches the model')).toBe(3)
    const wrong = render(createElement(FallingInExplanation, { predictedEnd: 'never', predictedFarClock: 'same', predictedStretch: 'giant' }))
    expect(count(wrong, 'That differs from the model')).toBe(3)
  })

  it('takes its numbers from the module, quotes NASA for the small black hole, and does not claim survival without a source', () => {
    const html = render(createElement(FallingInExplanation, { predictedEnd: 'finite', predictedFarClock: 'no-limit', predictedStretch: 'small' }))
    expect(html).toContain('48.99')
    expect(html).toContain('34.6 minutes')
    expect(html).toContain('2.3')
    expect(html).toContain('276')
    expect(html).toContain('which can rip apart approaching objects before they get to the horizon')
    expect(html).not.toContain('far more than any body could survive')
    expect(html).not.toContain('spaghettification')
    expect(html).toContain('This page does not model a spinning black hole')
  })
})
