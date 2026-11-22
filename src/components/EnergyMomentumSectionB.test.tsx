import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  SECTION_B_PASSING_SPEED,
  SECTION_B_SPEED,
  collisionCheckUpRows,
  collisionGuessMarker,
  everydayTotalGuessMarker,
  runCollisionExperiment,
} from '../physics/energyMomentum'
import {
  CollisionCaptions,
  CollisionDiagram,
  CollisionResults,
  EnergyMomentumCollision,
  EnergyMomentumCollisionLinks,
  PART_TWO_REFERENCE_ENTRIES,
  collisionMilestones,
} from './EnergyMomentumCollision'
import { EnergyMomentumCollisionTutor } from './EnergyMomentumCollisionTutor'

// Render checks only (no browser): Section B of Experiment 5 after the audit of 2026-11-21. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const GUESSES = ['less', 'same', 'more'] as const
const run = runCollisionExperiment(SECTION_B_SPEED, SECTION_B_PASSING_SPEED)
const results = (guess: (typeof GUESSES)[number], everydayGuess: 'same' | 'different' = 'different') =>
  renderToStaticMarkup(createElement(CollisionResults, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, prediction: guess, everydayGuess }))
const diagram = (progress: number | null, guess: (typeof GUESSES)[number] | null) =>
  renderToStaticMarkup(createElement(CollisionDiagram, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, progress, guess }))
const totalsDiagram = (progress: number | null, everydayGuess: 'same' | 'different' | null) =>
  renderToStaticMarkup(createElement(CollisionDiagram, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, progress, guess: 'more', everydayGuess }))
const totalsCaptions = (progress: number | null, everydayGuess: 'same' | 'different' | null) =>
  renderToStaticMarkup(createElement(CollisionCaptions, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, progress, guess: 'more', everydayGuess }))
const captions = (progress: number | null, guess: (typeof GUESSES)[number] | null) =>
  renderToStaticMarkup(createElement(CollisionCaptions, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, progress, guess }))

describe('Section B: the first screen, before any Run', () => {
  const html = renderToStaticMarkup(createElement(EnergyMomentumCollision))

  it('has Part 1 only, with Start over (greyed out) and no Change prediction button', () => {
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('gives the fixed case and tells the learner the predictions never change the pictures or the tables', () => {
    expect(html).toContain(`${SECTION_B_SPEED}c`)
    expect(html).toContain('Your predictions never change the pictures or the tables.')
  })

  it('keeps back what the learner is asked to predict (§12): the introduction does not say the masses are not simply added', () => {
    expect(html).not.toContain('masses added together')
    expect(html).not.toContain('not simply the masses')
  })

  it('names the sections A and B and has no old "Part 1" cross-reference to Section A', () => {
    const skipped = renderToStaticMarkup(createElement(EnergyMomentumCollision, { skippedPartOne: true, onBackToPartOne: () => {}, onGoToPartThree: () => {} }))
    expect(skipped).toContain('Back to Section A')
    expect(skipped).toContain('Skip to Section C')
    expect(skipped).toContain('If you skipped Section A')
    expect(skipped).not.toContain('If you skipped Part 1')
    expect(html).not.toContain('In Part 1 we followed')
    expect(html).toContain('In Section A we followed')
  })

  it('has the links list above Part 1', () => {
    expect(html).toContain('Want to know more?')
    expect(html.indexOf('Want to know more?')).toBeLessThan(html.indexOf('Part 1: Predict, then watch'))
  })

  it('shows no guess tick before Run', () => {
    expect(html).not.toContain('>YOUR GUESS</text>')
  })
})

describe('the links and the words box', () => {
  it('links the pages that were read, in new tabs, and records the gap', () => {
    const links = renderToStaticMarkup(createElement(EnergyMomentumCollisionLinks))
    expect(links.match(/target="_blank"/g)?.length).toBe(3)
    expect(links).toContain('pwg.gsfc.nasa.gov/stargaze/Smoment.htm')
    expect(links).toContain('home.cern/science/accelerators/large-hadron-collider/')
    expect(links).toContain('No plain-language page from NASA, ESA, CERN or Fermilab')
  })

  it('lists every new word of the section, with an example for the formula, and holds back no answer', () => {
    const terms = PART_TWO_REFERENCE_ENTRIES.map((e) => e.term)
    for (const term of ['Collision', 'Conserved', 'System', 'Lump', 'Internal energy', 'Everyday momentum']) expect(terms).toContain(term)
    const mass = PART_TWO_REFERENCE_ENTRIES.find((e) => e.term.startsWith('Mass of a system'))!
    expect(mass.meaning).toContain('√16 = 4')
    // "Marker" is listed once, by Section A's entries (which now name the tick too), so the words box has no duplicate key
    expect(terms).not.toContain('Marker')
    expect(JSON.stringify(PART_TWO_REFERENCE_ENTRIES)).not.toMatch(/not simply|masses added together/)
  })
})

describe('the white guess tick on the mass bars', () => {
  it('is drawn only once the bars are drawn, and never in the passing observer picture before Run', () => {
    expect(diagram(null, 'more')).not.toContain('YOUR GUESS')
    expect(diagram(0.1, 'more')).not.toContain('YOUR GUESS')
    expect(diagram(0.3, 'more')).toContain('YOUR GUESS')
  })

  it('takes its label from the physics module for each answer, and draws none without a guess or in Part 2', () => {
    for (const guess of GUESSES) {
      const html = diagram(1, guess)
      expect(html).toContain(collisionGuessMarker(guess).label.replace('YOUR GUESS: ', ''))
    }
    expect(diagram(1, null)).not.toContain('YOUR GUESS')
  })

  it('moves with the guess: three answers draw three different tick positions', () => {
    const xs = GUESSES.map((g) => /<line x1="([\d.]+)" y1="[\d.]+" x2="\1"[^>]*stroke="#ffffff" stroke-width="4"/.exec(diagram(1, g))?.[1])
    expect(xs.every(Boolean)).toBe(true)
    expect(new Set(xs).size).toBe(3)
  })

  it('uses the same milestones for the drawing and the caption', () => {
    expect(collisionMilestones(null).barsDrawn).toBe(false)
    expect(collisionMilestones(0.3).barsDrawn).toBe(true)
    expect(collisionMilestones(0.3).observerDrawn).toBe(false)
    expect(collisionMilestones(0.5).observerDrawn).toBe(true)
  })
})

describe('the captions', () => {
  it('explain a feature only once it is drawn (§12): no bars or tick before the collision, no Picture 2 before the observer picture', () => {
    const idle = captions(null, 'more')
    expect(idle).toContain('How to read this diagram')
    expect(idle).not.toContain('The two short bars')
    expect(idle).not.toContain('The white tick')
    expect(idle).not.toContain('Picture 2: the same collision')
    const bars = captions(0.3, 'more')
    expect(bars).toContain('The two short bars')
    expect(bars).toContain('The white tick and the YOUR GUESS box')
    expect(bars).toContain('only a marker')
    expect(captions(1, 'more')).toContain('Picture 2: the same collision')
  })

  it('give each look-for item in three parts, and never say right, wrong or matched about the guess, or which bar is longer', () => {
    const html = captions(1, 'more')
    expect(html).toContain('Look at:')
    expect(html).toContain('What it means:')
    expect(html).toContain('Why it matters:')
    expect(html).not.toMatch(/\b(wrong|matched|matches)\b/i)
    expect(html).not.toMatch(/(was|is|are) right\b/i)
    expect(html).not.toContain('longer than')
    expect(html).toContain('Where the real picture comes from')
  })
})

describe('Part 3: the results', () => {
  it('has the check-up with the seven rows and a note under each table', () => {
    const html = results('more')
    expect(html).toContain('The check-up')
    for (const row of collisionCheckUpRows(run)) expect(html).toContain(row.check)
    expect((html.match(/What this table tells us/g) ?? []).length).toBe(6)
    expect(html).toContain('Why it matters:')
  })

  it('shows the guess beside the results, with a tag on the row of the lump mass, and never marks it', () => {
    for (const guess of GUESSES) {
      const html = results(guess)
      expect(html).toContain('Your predictions, beside the results')
      expect(html).toContain('your guess</span>')
      expect(html).not.toContain('Your prediction was')
      expect(html).not.toMatch(/\b(wrong|matched|matches)\b/i)
      expect(html).not.toMatch(/it was right|not this time/i)
    }
    expect(results('less')).toContain('Less than 2m.')
  })

  it('shows the second guess beside the results too, tagged on the everyday-momentum row, drawn from its own answer, and never marks it', () => {
    for (const second of ['same', 'different'] as const) {
      const html = results('more', second)
      expect(html).toContain('Your second guess:')
      expect(html).toContain(second === 'same' ? 'The same before and after.' : 'Not the same before and after.')
      expect(html).toContain('m × (the sum of the speeds)<span')
      expect((html.match(/your guess<\/span>/g) ?? []).length).toBe(2) // one tag per guess, each on its own row
      expect(html).not.toMatch(/\b(wrong|matched|matches)\b/i)
    }
  })

  it('does not change the tables with the second guess, apart from the guess block', () => {
    const strip = (html: string) => html.replace(/<div[^>]*>\s*<p[^>]*>Your predictions, beside the results[\s\S]*?<\/p><\/div>/, '')
    expect(strip(results('more', 'same'))).toBe(strip(results('more', 'different')))
  })

  it('does not change with the guess apart from the guess block', () => {
    const strip = (html: string) => html.replace(/<div[^>]*>\s*<p[^>]*>Your predictions, beside the results[\s\S]*?<\/p><\/div>/, '')
    expect(strip(results('less'))).toBe(strip(results('more')))
  })

  it('shows the module numbers: the lump mass and the system mass', () => {
    const html = results('same')
    expect(html).toContain(run.lumpMass.toFixed(4))
    expect(html).toContain(run.systemMass.toFixed(4))
  })

  it('says only here that the system mass is not simply the pieces added', () => {
    expect(results('same')).toContain('not simply the masses of the pieces added together')
  })
})

describe('Part 4: the tutor', () => {
  const tutor = (guess: (typeof GUESSES)[number]) =>
    renderToStaticMarkup(createElement(EnergyMomentumCollisionTutor, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, predicted: guess, everydayPredicted: 'same' }))

  it('starts with the observe prompt, which points to Part 3', () => {
    expect(tutor('more')).toContain('Look at the totals in Part 3')
  })

  it('names the white tick in the compare prompt, and marks the guess only in the explanation', () => {
    const source = readFileSync(new URL('./EnergyMomentumCollisionTutor.tsx', import.meta.url), 'utf8')
    expect(source).toContain('Look at the white tick on Picture 1, beside the grey and blue bars. How does your guess compare with the blue bar?')
    expect(source).toContain('realCollisionAnswerFor(result)')
    expect(tutor('more')).not.toContain('it was right')
    expect(tutor('more')).not.toContain('not this time')
  })

  it('points to the second white tick by name in the compare prompt, and marks the second guess only in the explanation, from the physics module', () => {
    const source = readFileSync(new URL('./EnergyMomentumCollisionTutor.tsx', import.meta.url), 'utf8')
    expect(source).toContain('Then look at the white tick on the outlined bar in the lower panel of Picture 2.')
    expect(source).toContain('realEverydayTotalAnswerFor(result)')
    expect(source).toContain('Your second guess was')
    // the first screen of the tutor (observe) marks nothing, whichever second guess was made
    for (const second of ['same', 'different'] as const) {
      const html = renderToStaticMarkup(
        createElement(EnergyMomentumCollisionTutor, { speed: SECTION_B_SPEED, passingSpeed: SECTION_B_PASSING_SPEED, predicted: 'more', everydayPredicted: second }),
      )
      expect(html).not.toContain('Your second guess was')
    }
  })
})

describe('the second guess: the passing observer\'s everyday totals (Part 1 only)', () => {
  it('is drawn only once the passing observer\'s lump has formed, not before Run and not while their picture is still approaching', () => {
    expect(collisionMilestones(null).totalsDrawn).toBe(false)
    expect(collisionMilestones(0.5).totalsDrawn).toBe(false)
    expect(collisionMilestones(0.75).totalsDrawn).toBe(true)
    expect(totalsDiagram(null, 'same')).not.toContain('everyday totals')
    expect((totalsDiagram(0.5, 'same').match(/YOUR GUESS/g) ?? []).length).toBe(1) // only the mass-bar guess
    expect((totalsDiagram(0.75, 'same').match(/YOUR GUESS/g) ?? []).length).toBe(2)
  })

  it('takes the real totals and the label from the physics module, and draws no second guess without one', () => {
    const html = totalsDiagram(1, 'different')
    expect(html).toContain(everydayTotalGuessMarker('different', run).label.replace('YOUR GUESS: ', ''))
    expect(html).toContain('Before: mass × speed')
    expect(html).toContain(run.newtonMomentumBefore.toFixed(2).replace('-', '−'))
    expect(html).toContain(run.newtonMomentumAfter.toFixed(2).replace('-', '−'))
    expect((totalsDiagram(1, null).match(/YOUR GUESS/g) ?? []).length).toBe(1)
  })

  it('moves with the guess: the two answers draw two different tick positions', () => {
    const tickX = (guess: 'same' | 'different') => {
      const all = [...totalsDiagram(1, guess).matchAll(/<line x1="([\d.]+)" y1="[\d.]+" x2="\1"[^>]*stroke="#ffffff" stroke-width="4"/g)]
      return all[all.length - 1][1]
    }
    expect(tickX('same')).not.toBe(tickX('different'))
  })

  it('is not drawn in Part 2\'s drawings', () => {
    const html = renderToStaticMarkup(createElement(CollisionDiagram, { speed: 0.5, passingSpeed: 0.2, progress: 1, own: true, everydayGuess: 'same' }))
    expect(html).not.toContain('everyday totals')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('has a caption only once the panel is drawn, with look-at / meaning / why-it-matters items and a "Where the real picture comes from" line, and no verdict', () => {
    expect(totalsCaptions(0.5, 'same')).not.toContain('lower panel')
    const html = totalsCaptions(1, 'same')
    expect(html).toContain('lower panel')
    expect(html).toContain('The solid purple bar')
    expect(html).toContain('The outlined purple bar')
    expect(html).toContain('only a marker')
    expect(html).toContain('Where the real picture comes from')
    expect(html.slice(html.indexOf('lower panel'))).not.toMatch(/the everyday rule (fails|breaks|works)|is wrong|is right|matched|correct/i)
    expect(totalsCaptions(1, null)).not.toContain('The white tick and the YOUR GUESS box. </strong> This is the answer you chose to the second')
  })
})
