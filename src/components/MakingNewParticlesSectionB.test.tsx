import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  SECTION_B_PASSING_SPEED,
  SECTION_B_PIECE_MASS,
  decayMassGuessMarker,
  passingObserverMassGuessMarker,
  runDecay,
} from '../physics/makingNewParticles'
import {
  DecayDiagram,
  DecayDiagramCaption,
  DecayLedger,
  DecayLedgerCaption,
  MakingNewParticlesDecay,
} from './MakingNewParticlesDecay'
import { MakingNewParticlesDecayTutor } from './MakingNewParticlesDecayTutor'
import { DecayResults } from './MakingNewParticlesDecayResults'
import {
  CollisionToDecayCaption,
  CollisionToDecayLead,
  CollisionToDecayPicture,
  DecayBookkeepingCaption,
  DecayBookkeepingLead,
  DecayBookkeepingPicture,
  LastingTimesCaption,
  LastingTimesLead,
  LastingTimesPicture,
  MakingNewParticlesDecayLinks,
  SECTION_B_REFERENCE_ENTRIES,
  SectionBFormulasAndJob,
  SectionBIntroduction,
} from './MakingNewParticlesDecayIntro'

// Render checks only (no browser): Section B of Experiment 6 after the audit of 2026-11-23. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const R = SECTION_B_PIECE_MASS
const U = SECTION_B_PASSING_SPEED
const run = runDecay(R, U)
const render = (node: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(node)
const count = (html: string, text: string) => (html.match(new RegExp(text, 'g')) ?? []).length
const GUESSES1 = ['less', 'same', 'more'] as const
const GUESSES2 = ['same', 'different'] as const

const ledger = (fill: number, g1: (typeof GUESSES1)[number] | null, g2: (typeof GUESSES2)[number] | null, withGuesses = true) =>
  render(createElement(DecayLedger, { pieceMass: R, passingSpeed: U, fill, guess1: g1, guess2: g2, withGuesses }))
// The x position of the white ticks (stroke #ffffff, width 4), in the order they are drawn.
const tickXs = (html: string) => [...html.matchAll(/<line x1="([\d.]+)"[^>]*stroke="#ffffff" stroke-width="4"/g)].map((m) => Number(m[1]))
// The widths of the grey and the purple bars: they must never depend on a guess.
const barWidths = (html: string) => [...html.matchAll(/<rect x="12"[^>]*width="([\d.]+)"[^>]*fill="(#94a3b8|#c4b5fd|#38bdf8)"/g)].map((m) => `${m[2]}:${m[1]}`)

describe('Section B: the first screen, before any Run', () => {
  const html = render(createElement(MakingNewParticlesDecay))

  it('has Part 1 only, with Start over (greyed out) and no Change prediction button', () => {
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Run again')
  })

  it('asks both predictions, fixes r = 0.25 and +0.3c, and keeps Run off until both are chosen', () => {
    expect(html).toContain('Make a prediction (1 of 2): how the masses compare')
    expect(html).toContain('Make a prediction (2 of 2): the passing observer')
    expect(html).toContain('(a) The pieces&#x27; masses add up to less than the parent&#x27;s mass.')
    expect(html).toContain('(c) More than the parent&#x27;s mass.')
    expect(html).toContain('(b) Not the same as the lab&#x27;s.')
    expect(html).toContain('Each piece has 0.25 times the parent')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Run \(the lab, then the passing observer\)<\/button>/)
    expect(html).toContain('Choose both predictions above to run the experiment.')
  })

  it('has the heading, the part leads without a heading of their own for the introduction, and no controls yet', () => {
    expect(html).toContain('Section B: Decay, what happens when a particle comes apart?')
    expect(html).toContain('What we are about to do.')
    expect(html).not.toContain('Run these settings')
    expect(html).not.toContain('Part 1 — ')
    expect(html).not.toContain('Part 2 — Decay')
  })

  it('tells the learner the predictions never change the pictures or the tables, and where the guesses are drawn', () => {
    expect(html).toContain('Your predictions never change the pictures or the tables.')
    expect(html).toContain('Your guesses are drawn on the real bars in white. They never change them.')
    expect(html).toContain('If you want to change your predictions, press Start over.')
  })

  it('has the introduction: what a decay is, why it cannot be timed, what must stay the same, and the unit', () => {
    const intro = render(createElement(SectionBIntroduction))
    for (const text of ['A particle that comes apart.', 'Decay is happening all around us.', 'Why we cannot say when a single particle will decay.', 'What must stay the same.', 'Our unit.', 'Why this is worth doing.', 'popcorn', 'ice skaters']) {
      expect(intro).toContain(text)
    }
    expect(intro).toContain('This page does not model when a decay happens')
  })

  it('does not answer the prediction before the run (§12): no word on how the masses compare, no real example with masses, no r = 0.3 numbers', () => {
    const before = [
      render(createElement(SectionBIntroduction)),
      render(createElement(SectionBFormulasAndJob)),
      render(createElement(DecayBookkeepingPicture)),
      render(createElement(DecayBookkeepingCaption)),
      render(createElement(CollisionToDecayPicture)),
      render(createElement(CollisionToDecayCaption)),
      render(createElement(DecayBookkeepingLead)),
      render(createElement(CollisionToDecayLead)),
      render(createElement(LastingTimesLead)),
      render(createElement(LastingTimesCaption)),
      render(createElement(DecayDiagramCaption, { pieceMass: R, passingSpeed: U, progress: null })),
      html,
    ].join(' ')
    expect(before).not.toMatch(/always have less mass|weigh less|lighter than the parent|less mass than/i)
    expect(before).not.toContain('98.823')
    expect(before).not.toContain('134.9768')
    expect(before).not.toContain('thorium-234')
    expect(render(createElement(SectionBFormulasAndJob))).not.toContain('r = 0.3')
    expect(render(createElement(SectionBFormulasAndJob))).not.toContain('0.8c')
  })

  it('says the Large Hadron Collider is the machine of Section A, and explains how it makes unstable particles and how a detector sees their pieces', () => {
    const intro = render(createElement(SectionBIntroduction))
    expect(intro).toContain('How an accelerator makes unstable particles.')
    expect(intro).toContain('the same machine that Section A described')
    expect(intro).toContain('four large detectors record what comes out')
    expect(intro).toContain('1.5 billion')
    expect(intro).toContain('general physics, not a line on the CERN pages')
    expect(intro).toContain('does not record the particle itself')
    expect(intro).not.toContain('Machines like the Large Hadron Collider make many unstable particles')
  })

  it('has a drawing of a collision becoming a decay, with a three-part caption, that carries no number and no mass comparison', () => {
    const svg = render(createElement(CollisionToDecayPicture))
    for (const text of ['The detector surrounds the collision point', '1. Two beams meet head-on', '2. A new, unstable particle appears and lasts a tiny moment', '3. It decays']) expect(svg).toContain(text)
    expect(svg).not.toMatch(/>\s*\d+(\.\d+)?\s*</)
    const caption = render(createElement(CollisionToDecayCaption))
    expect(caption).toContain('How to read this drawing.')
    expect(count(caption, 'Look at:')).toBe(3)
    expect(count(caption, 'What it means:')).toBe(3)
    expect(count(caption, 'Why it matters:')).toBe(3)
    expect(caption).toContain('Imagined for the question:')
    expect(render(createElement(MakingNewParticlesDecay))).toContain('The detector surrounds the collision point')
  })

  it('has a lead-in above each of the two drawings, saying what will be seen and what it is for, placed before the drawing and without an answer', () => {
    const page = render(createElement(MakingNewParticlesDecay))
    const a = page.indexOf('About the next drawing: &quot;From a collision to a decay&quot;.')
    const b = page.indexOf('<svg', a)
    expect(a).toBeGreaterThan(-1)
    expect(b).toBeGreaterThan(a)
    expect(page.slice(a, b)).toContain('three steps from top to bottom')
    expect(page.slice(a, b)).toContain('no numbers')
    const c = page.indexOf('About the next drawing: &quot;How long do particles last?&quot;')
    const d = page.indexOf('<svg', c)
    expect(c).toBeGreaterThan(a)
    expect(d).toBeGreaterThan(c)
    expect(page.slice(c, d)).toContain('a ruler of times in seconds')
    expect(page.slice(c, d)).toContain('<em>when</em> particles decay')
  })

  it('has a lead-in above the bookkeeping drawing too, before the drawing and without an answer', () => {
    const page = render(createElement(MakingNewParticlesDecay))
    const a = page.indexOf('About the next drawing: &quot;A decay: nothing hits the parent&quot;.')
    const b = page.indexOf('<svg', a)
    expect(a).toBeGreaterThan(-1)
    expect(b).toBeGreaterThan(a)
    expect(page.slice(a, b)).toContain('The books')
    expect(page.slice(a, b)).toContain('drawn the same size on purpose')
    expect(a).toBeLessThan(page.indexOf('About the next drawing: &quot;From a collision to a decay&quot;'))
  })

  it('gives the formulas without a worked example, and the job in four parts', () => {
    const job = render(createElement(SectionBFormulasAndJob))
    for (const text of ['The pieces&#x27; energy.', 'The pieces&#x27; momentum.', 'Mass given up:', 'The system&#x27;s mass of the pieces:', 'What happens.', 'Your job.', 'What we assume.']) {
      expect(job).toContain(text)
    }
  })

  it('has two pictures of its own in the introduction, each with a three-part caption and a "Where the real picture comes from" line', () => {
    for (const caption of [render(createElement(DecayBookkeepingCaption)), render(createElement(LastingTimesCaption))]) {
      expect(caption).toContain('How to read this drawing.')
      expect(count(caption, 'Look at:')).toBe(count(caption, 'What it means:'))
      expect(count(caption, 'Look at:')).toBe(count(caption, 'Why it matters:'))
      expect(count(caption, 'Look at:')).toBeGreaterThanOrEqual(2)
      expect(caption).toContain('Calculated here:')
      expect(caption).toContain('Imagined for the question:')
    }
    expect(render(createElement(DecayBookkeepingPicture))).toContain('total energy before: 1')
    expect(render(createElement(DecayBookkeepingPicture))).toContain('total energy after: 1')
    expect(render(createElement(LastingTimesPicture))).toContain('The neutral pion')
    expect(render(createElement(LastingTimesPicture))).toContain('Uranium-238')
  })

  it('draws the two pictures of the introduction without any mass comparison: every circle in the bookkeeping picture has the same size', () => {
    const svg = render(createElement(DecayBookkeepingPicture))
    const radii = [...svg.matchAll(/<circle[^>]*r="(\d+)"[^>]*fill="#38bdf8"/g)].map((m) => m[1])
    expect(new Set(radii).size).toBe(1)
    expect(render(createElement(DecayBookkeepingCaption))).toContain('The circles are all drawn the same size, and that size means nothing')
  })
})

describe('Section B: the links and the "Words and formulas" box', () => {
  const links = render(createElement(MakingNewParticlesDecayLinks))

  it('lists the pages that were read, each in a new tab, with the date read', () => {
    expect(links).toContain('Want to know more?')
    for (const href of [
      'https://www.epa.gov/radiation/radiation-basics',
      'https://www.nrc.gov/reading-rm/basic-ref/students/science-101/what-are-different-types-of-radiation.html',
      'https://www.nrc.gov/about-nrc/radiation/health-effects/radiation-basics.html',
      'https://pdglive.lbl.gov/Particle.action?node=S009',
      'https://se.copernicus.org/articles/1/5/2010/',
      'https://home.cern/science/accelerators',
      'https://home.cern/science/accelerators/large-hadron-collider/',
      'https://arxiv.org/abs/1909.02257',
    ]) {
      expect(links).toContain(`href="${href}"`)
    }
    expect(links).toContain('href="https://www.nndc.bnl.gov/nudat3/decaysearchdirect.jsp?nuc=238U&amp;unc=nds"')
    expect(count(links, 'target="_blank"')).toBe(count(links, '<a '))
    expect(count(links, '23 November 2026') + count(links, '22 November 2026')).toBeGreaterThanOrEqual(9)
  })

  it('records the gaps and does not link a page that was not read', () => {
    expect(links).toContain('No plain-language page from CERN, Fermilab, NASA or another official source')
    expect(links).toContain('KamLAND')
    expect(links).not.toMatch(/href="[^"]*(kamland|nature\.com|livechart|glossary)/i)
  })

  it('holds the two Particle Adventure pages back from the introduction, because they state the answer to the first prediction', () => {
    expect(links).not.toContain('particleadventure.org')
    expect(readFileSync(new URL('./MakingNewParticlesDecayIntro.tsx', import.meta.url), 'utf8')).toContain('particleadventure.org/weak.html')
  })

  it('has its own box, with no Section A or Experiment 5 section, picture or guess-tick wording', () => {
    const terms = SECTION_B_REFERENCE_ENTRIES.map((e) => e.term)
    for (const word of ['Decay', 'Half-life', 'Momentum', 'Alpha particle', 'Threshold']) expect(terms.some((t) => t.startsWith(word))).toBe(true)
    expect(JSON.stringify(SECTION_B_REFERENCE_ENTRIES)).not.toMatch(/Section A|Section C|guess tick|Part 3 tests/)
    expect(render(createElement(MakingNewParticlesDecay))).toContain('Words and formulas')
  })
})

describe('Section B: the white guess marks', () => {
  it('are drawn only once the ledger is full, and never in Part 2\'s ledger', () => {
    expect(tickXs(ledger(0.5, 'less', 'same'))).toEqual([])
    expect(ledger(0.5, 'less', 'same')).not.toContain('YOUR GUESS')
    expect(tickXs(ledger(1, 'less', 'same'))).toHaveLength(2)
    expect(ledger(1, 'less', 'same')).toContain('YOUR GUESS')
    const own = render(createElement(DecayLedger, { pieceMass: R, passingSpeed: U, fill: 1 }))
    expect(own).not.toContain('YOUR GUESS')
    expect(tickXs(own)).toEqual([])
  })

  it('take their place and their words from the physics module, and move with the guess', () => {
    const scale = 340 / Math.max(1.25, run.sumOfRestMasses)
    for (const g of GUESSES1) {
      const html = ledger(1, g, null)
      const marker = decayMassGuessMarker(g)
      expect(tickXs(html)[0]).toBeCloseTo(12 + marker.tickPosition * scale, 1)
      expect(html).toContain(marker.label.replace('YOUR GUESS: ', '').replace("'", '&#x27;'))
    }
    const xs = GUESSES1.map((g) => tickXs(ledger(1, g, null))[0])
    expect(new Set(xs).size).toBe(3)
    for (const g of GUESSES2) {
      const html = ledger(1, null, g)
      expect(tickXs(html)[0]).toBeCloseTo(12 + passingObserverMassGuessMarker(g, run).tickPosition * scale, 1)
    }
    expect(tickXs(ledger(1, null, 'same'))[0]).not.toBeCloseTo(tickXs(ledger(1, null, 'different'))[0], 0)
  })

  it('never change a bar: the grey, sky-blue and purple bars are the same for every guess', () => {
    const base = barWidths(ledger(1, null, null))
    expect(base).toHaveLength(4)
    for (const g1 of GUESSES1) for (const g2 of GUESSES2) expect(barWidths(ledger(1, g1, g2))).toEqual(base)
    expect(barWidths(ledger(1, null, null, false))).toEqual(base)
  })

  it('are only markers: the ledger caption says so, only when guesses are drawn, and gives the three positions', () => {
    const withGuesses = render(createElement(DecayLedgerCaption, { pieceMass: R, passingSpeed: U, withGuesses: true }))
    const without = render(createElement(DecayLedgerCaption, { pieceMass: R, passingSpeed: U }))
    expect(withGuesses).toContain('They are only')
    expect(withGuesses).toContain('0.75, 1.00 or 1.25 of the parent')
    expect(without).not.toContain('YOUR GUESS')
    expect(without).not.toContain('They are only')
  })
})

describe('Section B: the captions', () => {
  it('explain a feature only once it is drawn (§12): nothing about Picture 2 before it appears, and the worked moment only under the ledger', () => {
    const before = render(createElement(DecayDiagramCaption, { pieceMass: R, passingSpeed: U, progress: null }))
    const lab = render(createElement(DecayDiagramCaption, { pieceMass: R, passingSpeed: U, progress: 0.3 }))
    const both = render(createElement(DecayDiagramCaption, { pieceMass: R, passingSpeed: U, progress: 0.6 }))
    expect(before).not.toContain('What to look for')
    expect(lab).toContain('the yellow ring and then the two pieces in Picture 1')
    expect(lab).not.toContain('the numbers under the two pieces in Picture 2')
    expect(both).toContain('the numbers under the two pieces in Picture 2')
    for (const html of [before, lab, both]) expect(html).not.toContain('worked moment')
    expect(render(createElement(DecayLedgerCaption, { pieceMass: R, passingSpeed: U }))).toContain('A worked moment (r = 0.3, which is not one of the buttons).')
  })

  it('gives every look-for item in three parts, with the module\'s numbers, and no verdict', () => {
    const caps = [
      render(createElement(DecayDiagramCaption, { pieceMass: R, passingSpeed: U, progress: 0.6 })),
      render(createElement(DecayLedgerCaption, { pieceMass: R, passingSpeed: U, withGuesses: true })),
    ]
    for (const html of caps) {
      expect(count(html, 'Look at:')).toBe(count(html, 'What it means:'))
      expect(count(html, 'Look at:')).toBe(count(html, 'Why it matters:'))
      expect(html).toContain('Calculated here:')
      expect(html.toLowerCase()).not.toMatch(/was right|were right|not this time|\bwrong\b|matched/)
    }
    expect(caps[0]).toContain('0.39 and 0.66')
    expect(caps[1]).toContain('the pieces’ rest masses add up to 0.50, and the parent’s mass is 1')
    expect(caps[1]).toContain('Mass given up: 1 − 0.50 = 0.50')
  })

  it('names the pictures Picture 1 and Picture 2 and draws the same decay for the module\'s numbers', () => {
    const svg = render(createElement(DecayDiagram, { pieceMass: R, passingSpeed: U, progress: 1 }))
    expect(svg).toContain('Picture 1: the lab&#x27;s view')
    expect(svg).toContain('Picture 2: the same decay, as the passing observer measures it')
    expect(svg).toContain('energy 0.50')
    expect(svg).toContain('speed 0.87c')
  })
})

describe('Section B, Part 3: the results', () => {
  const results = (g1 = '(a) The pieces’ masses add up to less than the parent’s mass.', g2 = "(a) The same as the lab's.") =>
    render(createElement(DecayResults, { pieceMass: R, passingSpeed: U, guess1Label: g1, guess2Label: g2 }))
  const html = results()

  it('shows both guesses beside the results, with one tag each on its own row, and never marks them', () => {
    expect(html).toContain('Your predictions, beside the results')
    expect(html).toContain('Your first guess:')
    expect(html).toContain('Your second guess:')
    expect(html).toContain('It shows only what you chose.')
    expect(count(html, 'your guess</span>')).toBe(2)
    expect(html.toLowerCase()).not.toMatch(/\bwrong\b|matched|was right/)
  })

  it('has a check-up of seven rows that all read "the same", and a note in three parts under each of its five groups of tables (the two tables of pieces share one)', () => {
    expect(html).toContain('The check-up')
    expect(count(html, '>the same<')).toBe(7)
    expect(count(html, 'What this table tells us')).toBe(5)
    expect(count(html, 'What it is:')).toBe(5)
    expect(count(html, 'What it means with the real numbers:')).toBe(5)
    expect(count(html, 'Why it matters:')).toBe(5)
  })

  it('shows the module\'s numbers, and does not change with either guess apart from the guess block', () => {
    for (const n of ['0.5000', '0.4330', '0.8660', '0.3880', '0.6603', '1.0483', '0.2967', '0.6112', '1.0000']) expect(html).toContain(n)
    const strip = (s: string) => s.replace(/<div[^>]*>\s*<p[^>]*>.*?Your predictions, beside the results.*?<\/div>/s, '')
    expect(strip(results('(b) The same as the parent’s mass.', "(b) Not the same as the lab's."))).toBe(strip(html))
  })
})

describe('Section B, Part 4: the tutor', () => {
  const tutor = (g1: (typeof GUESSES1)[number], g2: (typeof GUESSES2)[number]) =>
    render(createElement(MakingNewParticlesDecayTutor, { pieceMass: R, passingSpeed: U, predicted: g1, passingPredicted: g2 }))
  const source = readFileSync(new URL('./MakingNewParticlesDecayTutor.tsx', import.meta.url), 'utf8')

  it('starts with the observe question naming the ledger, and does not mark either guess yet', () => {
    for (const g1 of GUESSES1) {
      for (const g2 of GUESSES2) {
        const html = tutor(g1, g2)
        expect(html).toContain('Look at the mass ledger. How long is the grey bar compared with the parent')
        expect(html).not.toContain('Your first guess was')
        expect(html).not.toContain('Your second guess was')
        expect(html.toLowerCase()).not.toMatch(/\bwrong\b/)
      }
    }
  })

  it('names both white ticks in the compare prompt, marks both guesses only in the explanation, and reads the answers from the physics module', () => {
    expect(source).toContain('Look at the white tick on the grey bar.')
    expect(source).toContain('Then look at the white tick on the purple bar.')
    expect(source).toContain('realDecayMassAnswerFor(result)')
    expect(source).toContain('realPassingObserverMassAnswerFor(result)')
    expect(source).toContain('Your first guess was')
    expect(source).toContain('Your second guess was')
  })

  it('uses the figures of the pages that were read, and says which are computed here', () => {
    expect(source).toContain('4.2697')
    expect(source).toContain('4.198')
    expect(source).toContain('4.468 billion')
    expect(source).toContain('98.823')
    expect(source).toContain('computed here')
    expect(source).toContain('47 ± 2 TW')
    expect(source).toContain('about 38 TW (+14, −13)')
    expect(source).not.toContain('about half of the heat')
    expect(source).not.toContain('supplies about half')
    expect(source).toContain('MakingNewParticlesDecayTutorLinks')
  })
})

describe('Section B keeps its old behavior in the chapter', () => {
  it('still ends Part 1 by calling onComplete and the tutor by calling onExplained (spec, Decision 14)', () => {
    const source = readFileSync(new URL('./MakingNewParticlesDecay.tsx', import.meta.url), 'utf8')
    expect(source).toContain('usePlayback(status, setStatus, setProgress, onComplete)')
    expect(source).toContain('onExplained={onExplained}')
  })
})
