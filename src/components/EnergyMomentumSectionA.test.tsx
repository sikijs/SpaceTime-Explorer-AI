import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  SECTION_A_PASSING_SPEED,
  SECTION_A_SPEED,
  checkUpRows,
  guessMarkerFor,
  readingFor,
  runInvariantExperiment,
} from '../physics/energyMomentum'
import { EnergyMomentumExperiment, ReadingBars } from './EnergyMomentumExperiment'
import { EnergyMomentumIntro, EnergyMomentumLinks, EnergyMomentumSources, energyMomentumWordsEntries } from './EnergyMomentumIntro'
import { EnergyMomentumResultsTables } from './EnergyMomentumResults'
import type { Prediction } from './EnergyMomentumResults'

// Render checks only (no browser): Section A of Experiment 5 after the audit of 2026-11-21. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const GUESSES: Prediction[] = ['same', 'nothing', 'one-number']
const run = runInvariantExperiment('particle', SECTION_A_SPEED, SECTION_A_PASSING_SPEED)
const rows = [
  { name: 'The lab', color: '#38bdf8', reading: run.lab },
  { name: 'The particle’s own observer', color: '#4ade80', reading: run.own! },
  { name: 'The passing observer', color: '#c4b5fd', reading: readingFor(SECTION_A_PASSING_SPEED, run.lab) },
]
const bars = (guess?: Prediction) => renderToStaticMarkup(createElement(ReadingBars, { rows, guess }))
const tables = (guess: Prediction) => renderToStaticMarkup(createElement(EnergyMomentumResultsTables, { prediction: guess }))

describe('Section A: the first screen, before any Run', () => {
  const html = renderToStaticMarkup(createElement(EnergyMomentumExperiment))

  it('has Part 1 only, with Start over (greyed out) and no Change prediction button', () => {
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('names the sections A, B and C and gives the fixed case in the question', () => {
    expect(html).toContain('Section A')
    expect(html).toContain('Skip to Section B - Collision')
    expect(html).toContain('Skip to Section C - Reactions')
    expect(html).toContain(`${SECTION_A_SPEED}c`)
    expect(html).toContain(`+${SECTION_A_PASSING_SPEED}c`)
  })

  it('keeps back what the learner is asked to predict (§12): no worked invariant, no time² − distance² hint in the question, no E² − (pc)² entry', () => {
    expect(html).not.toContain('1.155² − 0.577²')
    expect(html).not.toContain('Earlier, two observers measured')
    expect(html).not.toContain('A combination of the two')
    expect(html).not.toContain('<strong>E² − (pc)²:</strong>')
    expect(html).not.toContain('<strong>Invariant:</strong>')
  })

  it('tells the learner the predictions never change the pictures or the tables', () => {
    expect(html).toContain('Your prediction never changes the pictures or the tables.')
  })

  it('has the links list above Part 1 and the words box', () => {
    expect(html).toContain('Want to know more?')
    expect(html).toContain('https://home.cern/science/accelerators/large-hadron-collider/')
    expect(html).toContain('Words and formulas')
  })
})

describe('the words box and the introduction', () => {
  it('holds back the combination and the word "invariant" until after the first run, and adds them then', () => {
    const before = energyMomentumWordsEntries(false).map((e) => e.term)
    const after = energyMomentumWordsEntries(true).map((e) => e.term)
    expect(before).not.toContain('E² − (pc)²')
    expect(before).not.toContain('Invariant')
    expect(before).toContain('Marker')
    expect(after).toContain('E² − (pc)²')
    expect(after).toContain('Invariant')
  })

  it('has the links, the Einstein 1905 source and the recorded gap', () => {
    const links = renderToStaticMarkup(createElement(EnergyMomentumLinks))
    expect(links).toContain('target="_blank"')
    expect(links).toContain('No plain-language page from NASA, ESA')
    const sources = renderToStaticMarkup(createElement(EnergyMomentumSources))
    expect(sources).toContain('fourmilab.ch/etexts/einstein/E_mc2')
    expect(renderToStaticMarkup(createElement(EnergyMomentumIntro))).toContain('Relativity of Time and Motion')
  })
})

describe('Picture 2: the white guess marker', () => {
  it('draws no marker without a guess', () => {
    expect(bars()).not.toContain('YOUR GUESS')
  })

  it('draws one YOUR GUESS box for answers (a) and (b) and two for answer (c), and says it is only a marker', () => {
    for (const guess of GUESSES) {
      const html = bars(guess)
      const boxes = guessMarkerFor(guess).length
      // Once per box, and once per box in the picture's text description.
      expect((html.match(/YOUR GUESS/g) ?? []).length).toBe(boxes * 2)
      expect(html).toContain('They are only a marker.')
      // One white outline per observer for each box.
      expect((html.match(/stroke="#ffffff"/g) ?? []).length).toBeGreaterThanOrEqual(boxes * rows.length)
    }
  })

  it('never says right, wrong or matched', () => {
    for (const guess of GUESSES) expect(bars(guess).toLowerCase()).not.toMatch(/\bright\b|\bwrong\b|matched/)
  })

  it('does not change a bar: every guess draws the same bars and numbers as no guess', () => {
    const part = (html: string) => html.slice(html.indexOf('What each observer measures'), html.indexOf('The longest bar'))
    for (const guess of GUESSES) expect(part(bars(guess))).toBe(part(bars()))
  })
})

describe('Part 3: the results', () => {
  it("shows the module's numbers and the check-up with a reading for every row", () => {
    const html = tables('same')
    expect(checkUpRows(run, 'particle')).toHaveLength(4)
    expect(html).toContain('The check-up')
    expect(html).toContain('the same')
    expect(html).toContain('different')
    expect(html).toContain(run.lab.energy.toFixed(4))
    expect(html).toContain(run.passing.energy.toFixed(4))
  })

  it('has a "What this table tells us" note under each of the three tables, in the three-part form', () => {
    const html = tables('same')
    expect((html.match(/What this table tells us/g) ?? []).length).toBe(3)
    expect((html.match(/What it is:/g) ?? []).length).toBe(3)
    expect((html.match(/Why it matters:/g) ?? []).length).toBe(3)
  })

  it('shows the guess beside the results with a tag on the columns it names, and never marks it', () => {
    const tagged = (guess: Prediction) => (tables(guess).match(/your guess<\/span>/g) ?? []).length
    expect(tagged('same')).toBe(2)
    expect(tagged('nothing')).toBe(3)
    expect(tagged('one-number')).toBe(3)
    for (const guess of GUESSES) {
      const html = tables(guess)
      const block = html.slice(html.indexOf('Your prediction, beside the results'), html.indexOf('The check-up')).toLowerCase()
      expect(block).toContain('it shows only what you chose')
      expect(block).not.toMatch(/\bright\b|\bwrong\b|matched/)
    }
  })

  it('shows the same real numbers for every guess', () => {
    const numbers = (html: string) => html.replace(/style="[^"]*"/g, '').match(/\d\.\d{4}/g)
    expect(numbers(tables('same'))).toEqual(numbers(tables('nothing')))
    expect(numbers(tables('same'))).toEqual(numbers(tables('one-number')))
  })

  it('includes the two rules that left the introduction', () => {
    const html = tables('nothing')
    expect(html).toContain('Now that you have run it')
    expect(html).toContain('A combination of the two')
  })
})
