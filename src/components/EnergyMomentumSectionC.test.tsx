import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SECTION_C_PASSING_SPEED, SECTION_C_SPEED, reactionCheckUpRows, reactionGuessMarker, runReactionExperiment } from '../physics/energyMomentum'
import {
  EnergyMomentumReactions,
  PART_THREE_REFERENCE_ENTRIES,
  ReactionCaptions,
  ReactionDiagram,
  ReactionLinks,
  ReactionResults,
} from './EnergyMomentumReactions'
import { EnergyMomentumReactionsTutor } from './EnergyMomentumReactionsTutor'

// Render checks only (no browser): Section C of Experiment 5 after the audit of 2026-11-21. Pressing Run, the playback, the locking, Start over and the automatic choice of the
// next process are checked in Chrome.

const GUESSES = ['less', 'same', 'more'] as const
const diagram = (guess: (typeof GUESSES)[number] | null, progress = 1, kind: 'annihilation' | 'pair-creation' | 'helium-binding' = 'annihilation', setting = SECTION_C_SPEED, own = false) =>
  renderToStaticMarkup(createElement(ReactionDiagram, { kind, setting, passingSpeed: SECTION_C_PASSING_SPEED, progress, guess, own }))
const results = (guess: (typeof GUESSES)[number], heliumRun = false) => renderToStaticMarkup(createElement(ReactionResults, { prediction: guess, heliumRun }))

describe('Section C: the first screen, before any Run', () => {
  const html = renderToStaticMarkup(createElement(EnergyMomentumReactions))

  it('has Part 1 only, with Start over (greyed out) and no Change prediction button', () => {
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('fixes Part 1 on a particle and its antiparticle at 0.6c, and offers the three answers', () => {
    expect(html).toContain(`${SECTION_C_SPEED}c`)
    expect(html).toContain(`+${SECTION_C_PASSING_SPEED}c`)
    expect(html).toContain('(a) The total mass after is less than before.')
    expect(html).toContain('(b) The total mass is the same.')
    expect(html).toContain('(c) The total mass after is more than before.')
    expect(html).not.toContain('Which process')
  })

  it('tells the learner the predictions never change the pictures or the tables', () => {
    expect(html).toContain('Your prediction never changes the pictures or the tables.')
    expect(html).toContain('YOUR GUESS')
  })

  it('keeps back what the learner is asked to predict (§12): no energy-released rule, no "not the sum of the pieces\' masses" line', () => {
    expect(html).not.toContain('<strong>Energy released:</strong>')
    expect(html).not.toContain('the drop in the total of the rest masses')
    expect(html).not.toContain('it is not the sum of the pieces')
    expect(html).not.toContain('which things change and which do not')
  })

  it('names the sections A and B in its text, not Part 1 and Part 2', () => {
    const withSkips = renderToStaticMarkup(createElement(EnergyMomentumReactions, { skippedPartOne: true, skippedPartTwo: true }))
    expect(withSkips).toContain('If you skipped Section A.')
    expect(withSkips).toContain('If you skipped Section B.')
    expect(withSkips).not.toContain('If you skipped Part')
  })

  it('has the links list above Part 1, with the pages that were read', () => {
    expect(html).toContain('Want to know more?')
    expect(html).toContain('https://home.cern/science/physics/antimatter/')
    expect(html).toContain('https://www.nibib.nih.gov/science-education/science-topics/nuclear-medicine')
    expect(html).toContain('https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sun.html')
  })
})

describe('the links and the words box', () => {
  it('opens every link in a new tab and records the gaps (§29 rule 3(c))', () => {
    const links = renderToStaticMarkup(createElement(ReactionLinks))
    expect(links).toContain('target="_blank"')
    expect(links).toContain('binding energy and mass defect')
    expect(links).toContain('the electron-volt')
    expect(links).toContain('physics.nist.gov/cgi-bin/cuu/Value?malc2mev')
  })

  it('no longer lists "Energy released" (it would give the prediction away), and adds the mass ledger and the guess tick', () => {
    const terms = PART_THREE_REFERENCE_ENTRIES.map((e) => e.term)
    expect(terms).not.toContain('Energy released')
    expect(terms).toContain('Mass ledger')
    expect(terms).toContain('Your guess tick (Section C)')
  })
})

describe('Picture 1: the white guess tick on the mass ledger', () => {
  it('draws no guess without one, and before the ledger is drawn', () => {
    expect(diagram(null)).not.toContain('YOUR GUESS')
    expect(diagram('same', 0.1)).not.toContain('YOUR GUESS')
    expect(diagram('same', null as unknown as number)).not.toContain('YOUR GUESS')
  })

  it('draws one YOUR GUESS box with the words of its answer, once the ledger is drawn', () => {
    for (const guess of GUESSES) {
      const html = diagram(guess)
      expect(html).toContain('YOUR GUESS')
      expect(html).toContain(reactionGuessMarker(guess, 2).label.replace('YOUR GUESS: ', ''))
      expect(html).toContain('stroke="#ffffff"')
    }
  })

  it('never says right, wrong or matched', () => {
    for (const guess of GUESSES) {
      const html = diagram(guess)
      const box = html.slice(html.indexOf('YOUR GUESS') - 200, html.indexOf('YOUR GUESS') + 400)
      expect(box.replace(/aria-label="[^"]*"/, '').toLowerCase()).not.toMatch(/\bwrong\b|matched/)
      expect(html.slice(html.indexOf('YOUR GUESS'), html.indexOf('YOUR GUESS') + 200)).not.toMatch(/\bright\b|\bwrong\b|matched/)
    }
  })

  it('does not change a bar: every guess draws the same bars and numbers as no guess', () => {
    const bars = (html: string) => html.match(/<rect[^>]*height="10"[^>]*>/g)
    for (const guess of GUESSES) expect(bars(diagram(guess))).toEqual(bars(diagram(null)))
    const labels = (html: string) => html.match(/>\d+\.\d\d</g)
    for (const guess of GUESSES) expect(labels(diagram(guess))).toEqual(labels(diagram(null)))
  })

  it('draws a different mark for a different guess (the tick follows the answer)', () => {
    const tickX = (guess: (typeof GUESSES)[number]) => diagram(guess).match(/<line x1="([\d.]+)"[^>]*stroke="#ffffff" strokeWidth="4"/)?.[1] ?? diagram(guess).match(/<line x1="([\d.]+)" y1="[\d.]+" x2="[\d.]+" y2="[\d.]+" stroke="#ffffff"/)?.[1]
    const xs = GUESSES.map(tickX)
    expect(new Set(xs).size).toBe(3)
    expect(Number(xs[0])).toBeLessThan(Number(xs[1]))
    expect(Number(xs[1])).toBeLessThan(Number(xs[2]))
  })

  it('draws no tick in Part 2\'s drawings (no guess) and calls them Drawing A and B', () => {
    const html = diagram(null, 1, 'pair-creation', 2, true)
    expect(html).not.toContain('YOUR GUESS')
    expect(html).toContain('Drawing A')
    expect(html).toContain('Drawing B')
    expect(html).not.toContain('Picture 1')
  })
})

describe('the captions', () => {
  const caption = (progress: number | null, guess: (typeof GUESSES)[number] | null = 'less', own = false, kind: 'annihilation' | 'helium-binding' = 'annihilation', setting = SECTION_C_SPEED) =>
    renderToStaticMarkup(createElement(ReactionCaptions, { kind, setting, passingSpeed: SECTION_C_PASSING_SPEED, progress, guess, own }))

  it('explains a feature only once it is drawn: the ledger and the tick not before the run, Picture 2 not before the lab\'s picture ends', () => {
    const idle = caption(null)
    expect(idle).toContain('How to read this diagram')
    expect(idle).not.toContain('The four bars of the mass ledger')
    expect(idle).not.toContain('The white tick')
    expect(idle).not.toContain('Picture 2: the same reaction')
    const early = caption(0.05)
    expect(early).not.toContain('The four bars of the mass ledger')
    const done = caption(1)
    expect(done).toContain('The four bars of the mass ledger')
    expect(done).toContain('The white tick and the YOUR GUESS box')
    expect(done).toContain('Picture 2: the same reaction')
    expect(done).toContain('only a marker')
  })

  it('gives every look-for item in three parts and a "Where the real picture comes from" line', () => {
    const done = caption(1)
    const items = (done.match(/Look at:/g) ?? []).length
    expect(items).toBe(6)
    expect((done.match(/What it means:/g) ?? []).length).toBe(items)
    expect((done.match(/Why it matters:/g) ?? []).length).toBe(items)
    expect(done).toContain('Where the real picture comes from')
  })

  it('does not say how the sum of the rest masses compares before and after, and gives the numbers from the physics module', () => {
    const done = caption(1)
    expect(done).toContain('The page does not say how they compare')
    const result = runReactionExperiment('annihilation', SECTION_C_SPEED, SECTION_C_PASSING_SPEED)
    expect(done).toContain(result.sumOfRestMassesBefore.toFixed(2))
  })

  it('separates what was measured, calculated and imagined, naming CODATA (NIST) for helium', () => {
    expect(caption(1)).toContain('Measured:</strong> nothing on this page')
    const helium = caption(1, null, false, 'helium-binding', 0)
    expect(helium).toContain('CODATA 2022')
    expect(helium).toContain('NIST')
  })

  it('shows no guess tick text in Part 2\'s caption', () => {
    expect(caption(1, 'less', true)).not.toContain('The white tick')
  })
})

describe('Part 3: the results', () => {
  it('has the check-up with a reading for every row, and the module\'s numbers', () => {
    const html = results('less')
    const rows = reactionCheckUpRows(runReactionExperiment('annihilation', SECTION_C_SPEED, SECTION_C_PASSING_SPEED))
    expect(rows).toHaveLength(7)
    expect(html).toContain('The check-up')
    expect((html.match(/the same<\/td>/g) ?? []).length).toBeGreaterThanOrEqual(7)
    expect(html).toContain('2.5000')
    expect(html).toContain('2.0000')
  })

  it('has a "What this table tells us" note in the three-part form under each table group', () => {
    const html = results('same')
    const notes = (html.match(/What (this table tells|these two tables tell) us/g) ?? []).length
    expect(notes).toBe(5)
    expect((html.match(/What it is:|What they are:/g) ?? []).length).toBe(5)
    expect((html.match(/Why it matters:/g) ?? []).length).toBe(5)
  })

  it('shows the guess beside the results with one tag, and never marks it', () => {
    for (const guess of GUESSES) {
      const html = results(guess)
      expect((html.match(/your guess<\/span>/g) ?? []).length).toBe(1)
      const block = html.slice(html.indexOf('Your prediction, beside the results'), html.indexOf('Now that you have run it')).toLowerCase()
      expect(block).toContain('it shows only what you chose')
      expect(block).not.toMatch(/\bright\b|\bwrong\b|matched/)
    }
  })

  it('shows the same real numbers for every guess', () => {
    const numbers = (html: string) => html.replace(/style="[^"]*"/g, '').match(/\d\.\d{4}/g)
    expect(numbers(results('less'))).toEqual(numbers(results('same')))
    expect(numbers(results('less'))).toEqual(numbers(results('more')))
  })

  it('includes the two lines that left the introduction', () => {
    const html = results('same')
    expect(html).toContain('Now that you have run it')
    expect(html).toContain('Energy released:')
    expect(html).toContain('The system&#x27;s mass is not the sum of the pieces&#x27; masses')
  })

  it('says "not run yet" for the helium check-up until helium has been run, then shows it against the published reference', () => {
    expect(results('same', false)).toContain('Not run yet.')
    expect(results('same', false)).not.toContain('Published reference')
    const run = results('same', true)
    expect(run).toContain('Published reference')
    expect(run).toContain('28.2956 MeV')
    expect(run).toContain('the same')
    expect(run).not.toContain('Not run yet.')
  })
})

describe('Part 4: the tutor', () => {
  const tutor = renderToStaticMarkup(createElement(EnergyMomentumReactionsTutor, { kind: 'annihilation', setting: SECTION_C_SPEED, passingSpeed: SECTION_C_PASSING_SPEED, predicted: 'less' }))

  it('starts with the observe question naming Picture 1 and Part 3, and does not mark the guess yet', () => {
    expect(tutor).toContain('Look at the mass ledger in Picture 1 and at the tables in Part 3')
    expect(tutor.toLowerCase()).not.toMatch(/\bright\b|\bwrong\b/)
  })
})
