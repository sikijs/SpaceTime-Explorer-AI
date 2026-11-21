import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PART_ONE_DIRECTION, PART_ONE_SPEED, checkUpRows, runSeeingExperiment } from '../physics/seeingThePast'
import type { SpeedGuess } from '../physics/seeingThePast'
import { SeeingThePastJetLinks, SeeingThePastResultsTables } from './SeeingThePastResults'
import { SeeingThePastTutor } from './SeeingThePastTutor'
import { SeeingThePastIntro, SeeingThePastLinks, seeingThePastWordsEntries } from './SeeingThePastIntro'

// Render checks only (no browser): Part 3 shows the physics module's numbers and the learner's guess beside them, never marked right or wrong; the tutor marks the
// guess only in its explanation; the introduction and the words box keep back what the learner is asked to predict. Pressing the tutor's buttons is checked in Chrome.

const run = runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED)
const GUESSES: SpeedGuess[] = ['slower', 'same', 'faster']
const tables = (guess: SpeedGuess) => renderToStaticMarkup(createElement(SeeingThePastResultsTables, { prediction: guess }))

describe('Part 3: the results tables', () => {
  const html = tables('faster')

  it('shows Table 1 with the module\'s numbers for the real motion and the image', () => {
    expect(html).toContain('Table 1: The spaceship and its image')
    expect(html).toContain(`${run.measuredSpeed.toFixed(2)}c`)
    expect(html).toContain(`${run.imageSpeed.toFixed(2)}c`)
    expect(html).toContain(run.measuredDuration.toFixed(2))
    expect(html).toContain(run.imageDuration.toFixed(2))
  })

  it('has the check-up, Table 2, with every row from the module and its reading', () => {
    expect(html).toContain('Table 2: A check-up against this page&#x27;s own physics')
    const rows = checkUpRows(PART_ONE_DIRECTION, PART_ONE_SPEED)
    expect(rows.length).toBe(3)
    expect(html).toContain('the same')
    expect(html).toContain(`less, by ${rows[2].gap.toFixed(2)} seconds`)
    expect(html).toContain(`${PART_ONE_SPEED} ÷ (1 − ${PART_ONE_SPEED}) = 1.50c`)
  })

  it('has a "What this table tells us" note under each table, in the three-part form', () => {
    expect((html.match(/What this table tells us/g) ?? []).length).toBe(2)
    expect((html.match(/What it is:/g) ?? []).length).toBe(2)
    expect((html.match(/What it means:/g) ?? []).length).toBe(2)
    expect((html.match(/Why it matters:/g) ?? []).length).toBe(2)
    expect((html.match(/How sure this is:/g) ?? []).length).toBe(2)
  })

  it('shows the guess beside the results, with a white tag on the image row, and says it is not marked', () => {
    for (const guess of GUESSES) {
      const h = tables(guess)
      expect(h).toContain('Your guess, beside the results.')
      expect(h).toContain(`Your prediction:</strong> ${{ slower: 'slower than', same: 'the same as', faster: 'faster than' }[guess]} the spaceship&#x27;s real speed`)
      expect((h.match(/your guess<\/span>/g) ?? []).length).toBe(2)
    }
    expect(html).toContain('nothing here says whether it is right. The tutor does that')
  })

  it('never says right, wrong, matched or "only recorded here"', () => {
    for (const guess of GUESSES) {
      const h = tables(guess).toLowerCase()
      expect(h).not.toContain('only recorded here')
      expect(h).not.toContain('matched')
      expect(h).not.toContain('wrong')
      expect(h).not.toContain('was right')
    }
  })

  it('the tables do not change with the guess (CLAUDE.md §14)', () => {
    const strip = (h: string) => h.slice(h.indexOf('Table 1:'))
    expect(strip(tables('slower'))).toBe(strip(tables('faster')))
    expect(strip(tables('same'))).toBe(strip(tables('faster')))
  })
})

describe('the links about real jets (held until after the run)', () => {
  const html = renderToStaticMarkup(createElement(SeeingThePastJetLinks))

  it('lists the three pages, each opening in a new tab, and says they do not state this page\'s formula', () => {
    for (const href of ['public.nrao.edu/gallery/jets-that-appear-faster-than-light', 'hubble-spots-ultra-speedy-jet-blasting-from-star-crash', 'chandra.harvard.edu/blog/node/748']) {
      expect(html).toContain(href)
    }
    expect((html.match(/target="_blank"/g) ?? []).length).toBe(3)
    expect(html).toContain('None of them states the formula this page uses')
  })
})

describe('the introduction keeps back what Part 1 asks the learner to predict', () => {
  const intro = renderToStaticMarkup(createElement(SeeingThePastIntro))
  const links = renderToStaticMarkup(createElement(SeeingThePastLinks))
  const entriesBefore = JSON.stringify(seeingThePastWordsEntries(false))
  const entriesAfter = JSON.stringify(seeingThePastWordsEntries(true))

  it('has no postcard comparison, no worked example and no word on whether the image is faster or slower', () => {
    const text = intro.toLowerCase()
    for (const w of ['postcard', '4 ÷ 6', '0.67c', 'closer together', 'shorter trip', 'looks faster', 'image seems to move faster']) expect(text).not.toContain(w)
  })

  it('has Figures A and B, and a sentence saying the guess never changes the real pictures', () => {
    expect(intro).toContain('How to read Figure A.')
    expect(intro).toContain('How to read Figure B.')
    expect(intro).toContain('Your guess never changes the real pictures or the tables.')
  })

  it('links only the pages about light taking time above Part 1, not the jet pages', () => {
    expect(links).toContain('cosmic-distances')
    expect(links).toContain('time-travel-observing-cosmic-history')
    expect(links).toContain('light-year')
    expect(links.toLowerCase()).not.toContain('faster than light')
    expect(links).not.toContain('nrao.edu')
  })

  it('shows the formulas in the words box only after the first Run', () => {
    expect(entriesBefore).not.toContain('v ÷ (1 − v)')
    expect(entriesBefore).toContain('after your first Run')
    expect(entriesAfter).toContain('v ÷ (1 − v)')
    expect(entriesAfter).toContain('1.50c')
    expect(entriesAfter).not.toContain('after your first Run')
  })
})

describe('Part 4: the tutor', () => {
  const html = renderToStaticMarkup(createElement(SeeingThePastTutor, { direction: PART_ONE_DIRECTION, speed: PART_ONE_SPEED, predicted: 'slower' }))

  it('starts with the observe question, which names the white ring and Panel B, and marks nothing yet', () => {
    expect(html).toContain('find the white YOUR GUESS ring')
    expect(html).toContain('Panel B')
    expect(html.toLowerCase()).not.toContain('your guess was')
    expect(html.toLowerCase()).not.toContain('not right this time')
  })

  it('shows no explanation before the three questions are answered', () => {
    expect(html).not.toContain('What the drawings show, in your own numbers')
  })
})
