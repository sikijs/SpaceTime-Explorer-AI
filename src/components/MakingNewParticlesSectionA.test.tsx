import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  SECTION_A_ENERGY_OF_MOTION,
  SECTION_A_NEW_MASS,
  ownObserverMassGuessMarker,
  ownObserverSystemMassOf,
  runMakingExperiment,
  usableEnergyGuessMarker,
} from '../physics/makingNewParticles'
import {
  BarsCaption,
  DiagramCaption,
  MakingBars,
  MakingDiagram,
  MakingNewParticlesExperiment,
  makingMilestones,
} from './MakingNewParticlesExperiment'
import { MakingNewParticlesDecay } from './MakingNewParticlesDecay'
import { MakingNewParticlesLinks, SECTION_A_REFERENCE_ENTRIES } from './MakingNewParticlesIntro'
import { MakingNewParticlesTutor } from './MakingNewParticlesTutor'
import { MakingResults } from './MakingNewParticlesResults'

// Render checks only (no browser): Section A of Experiment 6 after the audit of 2026-11-22. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const K = SECTION_A_ENERGY_OF_MOTION
const X = SECTION_A_NEW_MASS
const run = runMakingExperiment(K, X)
const GUESSES1 = ['setup-a', 'same', 'setup-b'] as const
const GUESSES2 = ['same', 'different'] as const

const diagram = (progress: number | null, ownGuess: 'same' | 'different' | null = null, own = false) =>
  renderToStaticMarkup(createElement(MakingDiagram, { result: run, progress, ownGuess, own }))
const bars = (fill: number, guess: (typeof GUESSES1)[number] | null, own = false) =>
  renderToStaticMarkup(createElement(MakingBars, { result: run, fill, guess, own }))
const diagramCaption = (progress: number | null, ownGuess: 'same' | 'different' | null = null, own = false) =>
  renderToStaticMarkup(createElement(DiagramCaption, { result: run, progress, ownGuess, own }))
const barsCaption = (progress: number | null, guess: (typeof GUESSES1)[number] | null = null, own = false) =>
  renderToStaticMarkup(createElement(BarsCaption, { result: run, progress, guess, own }))
const results = (g1: (typeof GUESSES1)[number] = 'setup-b', g2: (typeof GUESSES2)[number] = 'same') =>
  renderToStaticMarkup(
    createElement(MakingResults, {
      energyOfMotion: K,
      newMass: X,
      guess1Label: g1 === 'setup-a' ? '(a) Setup A, the stationary target.' : g1 === 'same' ? '(b) The same for both.' : '(c) Setup B, the head-on beams.',
      guess2Label: g2 === 'same' ? "(a) The same as the lab's." : "(b) Not the same as the lab's.",
    }),
  )
const count = (html: string, text: string) => (html.match(new RegExp(text, 'g')) ?? []).length

describe('Section A: the first screen, before any Run', () => {
  const html = renderToStaticMarkup(createElement(MakingNewParticlesExperiment))

  it('has Part 1 only, with Start over (greyed out) and no Change prediction button', () => {
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Section B: Decay')
  })

  it('asks both predictions, fixes K = 5 and X = 2, and keeps Run off until both are chosen', () => {
    expect(html).toContain('Make a prediction (1 of 2): which setup leaves more usable energy')
    expect(html).toContain('Make a prediction (2 of 2): the system&#x27;s own observer')
    expect(html).toContain('(a) Setup A, the stationary target.')
    expect(html).toContain('(b) The same for both.')
    expect(html).toContain('(c) Setup B, the head-on beams.')
    expect(html).toContain('(a) The same as the lab&#x27;s.')
    expect(html).toContain('(b) Not the same as the lab&#x27;s.')
    expect(html).toContain(`K = ${K}`)
    expect(html).toContain(`X = ${X}`)
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Run \(the lab, then the system&#x27;s own observer\)<\/button>/)
    expect(html).toContain('Choose both predictions above to run the experiment.')
    expect(html).not.toContain('Which setup leaves more usable energy, K')
  })

  it('tells the learner the predictions never change the pictures or the tables', () => {
    expect(html).toContain('Your predictions never change the pictures or the tables.')
    expect(html).toContain('YOUR GUESS')
  })

  it('has the introduction\'s explanation of making a new particle, with its own picture and a three-part caption, and no early reveal (§12)', () => {
    expect(html).toContain('Making a new particle: what it means.')
    expect(html).toContain('A particle that was not there before.')
    expect(html).toContain('price tag')
    expect(html).toContain('Energy can become mass')
    expect(html).toContain('How to read this drawing.')
    expect(count(html, 'Look at:')).toBeGreaterThanOrEqual(2)
    // the K = 3 worked numbers of both setups, and this run's numbers, are not given before the run
    expect(html).not.toContain('M = √(25 − 15) = √10')
    expect(html).not.toContain('3.162')
    expect(html).not.toContain('usable energy is 1.16')
    expect(html).not.toContain('1.74')
    // and the comparison that answers the prediction stays with the tutor
    expect(html).not.toMatch(/wreck|crumpl/i)
  })

  it('explains the machine: the source, the vacuum, the cavities that push, the magnets that steer and the chain, without answering the prediction', () => {
    for (const text of ['The machine: how an accelerator gives particles their energy of motion.', 'A source of particles.', 'A pipe with almost nothing in it.', 'Cavities that push.', 'Magnets that steer.', 'A chain of machines, in two layouts.']) {
      expect(html).toContain(text)
    }
    expect(html).toContain('swing')
    expect(html).toContain('16 MeV')
    expect(html).toContain('Those are the two setups this section compares.')
    expect(html).not.toMatch(/wastes|head-on (beams )?(is|are) better|Setup B leaves more usable energy than/i)
  })

  it('has a drawing of the machine with a three-part caption, the principles behind it and a step-by-step run, and none of it answers the prediction (§12)', () => {
    for (const text of [
      'Inside a particle accelerator (a simplified sketch)',
      'How to read this drawing.',
      'The principles behind the machine.',
      'An electric field pushes on electric charge.',
      'The push has to arrive at the right time.',
      'A magnet steers a moving charge, but does not speed it up.',
      'Close to the speed of light, pushes add energy but hardly any speed.',
      'How a run goes, step by step.',
      'Fill.',
      'Injection.',
      'Acceleration.',
      'Squeezing.',
      'Collision.',
      'The end of a run.',
    ]) {
      expect(html).toContain(text)
    }
    expect(html).toContain('about 6,930 times its own rest energy')
    // the caption's look-for items follow the three-part form (this caption has three; the first drawing has two)
    expect(count(html, 'Look at:')).toBeGreaterThanOrEqual(5)
    expect(count(html, 'What it means:')).toBe(count(html, 'Look at:'))
    expect(count(html, 'Why it matters:')).toBe(count(html, 'Look at:'))
    expect(html).toContain('Where the real picture comes from')
    // nothing in it says which setup leaves more usable energy
    expect(html).not.toMatch(/locked in energy|wastes|better setup/i)
  })

  it('has its own "Words and formulas" box, with no Experiment 5 section, picture or guess-tick wording', () => {
    const text = JSON.stringify(SECTION_A_REFERENCE_ENTRIES)
    expect(text).not.toMatch(/Section [ABC]\b/)
    expect(text).not.toMatch(/guess tick|ledger|annihilation|binding energy/i)
    const terms = SECTION_A_REFERENCE_ENTRIES.map((e) => e.term)
    expect(new Set(terms).size).toBe(terms.length)
    for (const t of ['Price of a particle', 'Usable energy, U = M − 2', 'Locked-in energy, L = K − U', 'Beam, target, stationary target']) expect(terms).toContain(t)
    expect(html).toContain('Words and formulas')
  })

  it('shows the links that were read, each in a new tab, and records the gap', () => {
    const links = renderToStaticMarkup(createElement(MakingNewParticlesLinks))
    expect(links).toContain('Want to know more?')
    for (const href of [
      'https://home.cern/science/accelerators',
      'https://home.cern/science/physics/12-steps-idea-discovery/',
      'https://home.cern/science/accelerators/large-hadron-collider/',
      'https://home.cern/science/accelerators/how-accelerator-works/',
      'https://home.cern/science/engineering/accelerating-radiofrequency-cavities/',
      'https://home.cern/science/engineering/pulling-together-superconducting-electromagnets/',
      'https://home.cern/science/engineering/vacuum-empty-interstellar-space/',
    ]) {
      expect(links).toContain(`href="${href}"`)
    }
    expect(count(links, 'target="_blank"')).toBe(7)
    expect(links).toContain('fixed target')
    expect(links).toContain('22 November 2026')
    expect(html).toContain('Want to know more?')
  })
})

describe('the milestones', () => {
  it('agree for the drawing and the captions', () => {
    expect(makingMilestones(null).ownDrawn).toBe(false)
    expect(makingMilestones(0.1).afterDrawn).toBe(false)
    expect(makingMilestones(0.3).afterDrawn).toBe(true)
    expect(makingMilestones(0.3).ownDrawn).toBe(false)
    expect(makingMilestones(0.5).ownDrawn).toBe(true)
    expect(makingMilestones(0.5).ownMassDrawn).toBe(false)
    expect(makingMilestones(0.75).ownMassDrawn).toBe(true)
    expect(makingMilestones(0.75).barsDrawn).toBe(false)
    expect(makingMilestones(0.9).barsDrawn).toBe(true)
    expect(makingMilestones(0.9).barsFilled).toBe(false)
    expect(makingMilestones(1).barsFilled).toBe(true)
  })
})

describe('the second guess: the lower panel of Picture 2', () => {
  it('is drawn only once the observer\'s collision has happened, never before Run and never in Part 2\'s drawings', () => {
    expect(diagram(null, 'same')).not.toContain('lower panel')
    expect(diagram(0.5, 'same')).toContain('lower panel')
    expect(count(diagram(0.5, 'same'), 'YOUR GUESS')).toBe(0)
    expect(count(diagram(0.75, 'same'), 'YOUR GUESS')).toBe(1)
    expect(diagram(1, null)).not.toContain('YOUR GUESS')
    expect(diagram(1, 'same', true)).not.toContain('lower panel')
    expect(diagram(1, 'same', true)).not.toContain('YOUR GUESS')
  })

  it('takes its numbers and its label from the physics module, and moves with the guess', () => {
    const { lab, own } = ownObserverSystemMassOf(run.stationaryTarget)
    for (const guess of GUESSES2) {
      const html = diagram(1, guess)
      expect(html).toContain(ownObserverMassGuessMarker(guess, run).label.replace('YOUR GUESS: ', '').replace("'", '&#x27;'))
      expect(html).toContain(lab.toFixed(2))
      expect(html).toContain(own.toFixed(2))
    }
    const tickX = (guess: 'same' | 'different') => {
      const all = [...diagram(1, guess).matchAll(/<line x1="([\d.]+)" y1="[\d.]+" x2="\1"[^>]*stroke="#ffffff" stroke-width="4"/g)]
      return all[all.length - 1][1]
    }
    expect(tickX('same')).not.toBe(tickX('different'))
  })

  it('the pictures are named Picture 1 and Picture 2 in Part 1 and Drawing A and B in Part 2', () => {
    expect(diagram(1, null)).toContain('Picture 1, Setup A')
    expect(diagram(1, null)).toContain('Picture 2: Setup A again')
    expect(diagram(1, null, true)).toContain('Drawing A, Setup A')
    expect(diagram(1, null, true)).toContain('Drawing B: Setup A again')
  })
})

describe('the first guess: the white outline on the bars', () => {
  it('is drawn only once the bars are full, never in Part 2, and takes its label from the physics module', () => {
    expect(count(bars(0.5, 'setup-b'), 'YOUR GUESS')).toBe(0)
    for (const guess of GUESSES1) {
      const html = bars(1, guess)
      expect(count(html, 'YOUR GUESS')).toBe(1)
      expect(html).toContain(usableEnergyGuessMarker(guess).label.replace('YOUR GUESS: ', ''))
    }
    expect(bars(1, null)).not.toContain('YOUR GUESS')
    expect(bars(1, 'setup-b', true)).not.toContain('YOUR GUESS')
  })

  it('outlines one bar for Setup A or B, and both bars with an "=" for "the same"', () => {
    const outlines = (html: string) => count(html, 'rx="4" fill="none" stroke="#ffffff" stroke-width="4"')
    expect(outlines(bars(1, 'setup-a'))).toBe(1)
    expect(outlines(bars(1, 'setup-b'))).toBe(1)
    expect(outlines(bars(1, 'same'))).toBe(2)
    expect(bars(1, 'same')).toContain('>=<')
    expect(bars(1, 'setup-a')).not.toContain('>=<')
  })

  it('puts the outline in a different place for each setup', () => {
    const y = (guess: (typeof GUESSES1)[number]) => /<rect x="136" y="([\d.]+)"[^>]*stroke="#ffffff"/.exec(bars(1, guess))?.[1]
    expect(y('setup-a')).toBeDefined()
    expect(y('setup-b')).toBeDefined()
    expect(y('setup-a')).not.toBe(y('setup-b'))
  })
})

describe('the captions', () => {
  it('explain a feature only once it is drawn (§12): nothing about Picture 2 or its lower panel before they appear', () => {
    const idle = diagramCaption(null, 'same')
    expect(idle).toContain('How to read this diagram')
    expect(idle).not.toContain('lower panel')
    expect(idle).not.toContain('Picture 2: Setup A again')
    expect(idle).not.toContain('The white tick')
    expect(idle).not.toContain('What to look for')
    const lab = diagramCaption(0.3, 'same')
    expect(lab).toContain('The bottom row')
    expect(lab).not.toContain('Picture 2: Setup A again')
    const observer = diagramCaption(0.5, 'same')
    expect(observer).toContain('Picture 2: Setup A again')
    expect(observer).not.toContain('lower panel')
    const done = diagramCaption(1, 'same')
    expect(done).toContain('lower panel')
    expect(done).toContain('The white tick and the YOUR GUESS box')
    expect(done).toContain('only a marker')
    expect(diagramCaption(1, null)).not.toContain('The white tick')
  })

  it('gives every look-for item in three parts, and a "Where the real picture comes from" line under each picture of Part 1 but not under Part 2\'s', () => {
    const picture = diagramCaption(1, 'same')
    const items = count(picture, 'Look at:')
    expect(items).toBe(3)
    expect(count(picture, 'What it means:')).toBe(items)
    expect(count(picture, 'Why it matters:')).toBe(items)
    expect(picture).toContain('Where the real picture comes from')
    const barItems = barsCaption(1, 'setup-b')
    expect(count(barItems, 'Look at:')).toBe(2)
    expect(count(barItems, 'What it means:')).toBe(2)
    expect(count(barItems, 'Why it matters:')).toBe(2)
    expect(barItems).toContain('Where the real picture comes from')
    expect(diagramCaption(1, null, true)).not.toContain('Where the real picture comes from')
    expect(barsCaption(1, null, true)).not.toContain('Where the real picture comes from')
  })

  it('moves the K = 3 worked moment out of the pre-run caption: it appears only in the bars caption, once the bars are drawn', () => {
    expect(diagramCaption(1, 'same')).not.toContain('√10')
    expect(barsCaption(1, 'setup-b')).toContain('√10')
  })

  it('explains the white outline only once the bars are full, and says it is only a marker', () => {
    expect(barsCaption(0.9, 'setup-b')).not.toContain('The white outline')
    const done = barsCaption(1, 'setup-b')
    expect(done).toContain('The white outline and the YOUR GUESS box')
    expect(done).toContain('only a marker')
    expect(barsCaption(1, null)).not.toContain('The white outline')
  })

  it('gives numbers from the module and no verdict between the setups, and says nothing about right or wrong', () => {
    const html = barsCaption(1, 'setup-b') + diagramCaption(1, 'same')
    expect(html).toContain(run.stationaryTarget.usable.toFixed(2))
    expect(html).toContain(run.headOn.usable.toFixed(2))
    expect(html).not.toMatch(/\bright\b.*\bguess|your guess was|matched|is correct/i)
    expect(html).not.toMatch(/head-on (leaves|gives) more|setup b is better|setup a is worse/i)
  })
})

describe('Part 3: the results', () => {
  it('shows both guesses beside the results, with one tag each on its own row, and never marks them', () => {
    for (const g1 of GUESSES1) {
      for (const g2 of GUESSES2) {
        const html = results(g1, g2)
        expect(html).toContain('Your predictions, beside the results')
        expect(html).toContain('Your first guess:')
        expect(html).toContain('Your second guess:')
        expect(count(html, 'your guess</span>')).toBe(2)
        expect(html).not.toMatch(/\b(wrong|matched|matches)\b|it was right|not this time/i)
      }
    }
    expect(results('setup-a', 'different')).toContain('(a) Setup A, the stationary target.')
    expect(results('setup-a', 'different')).toContain('(b) Not the same as the lab&#x27;s.')
  })

  it('tags the usable-energy row for the first guess and the observer\'s M row for the second', () => {
    const html = results()
    expect(html).toMatch(/Usable energy, M − 2<span[^>]*>your guess<\/span>/)
    expect(html).toMatch(/found by the system&#x27;s own observer<span[^>]*>your guess<\/span>/)
  })

  it('has a check-up of six rows that all read "the same", and a note in three parts under each of its four tables', () => {
    const html = results()
    expect(html).toContain('The check-up')
    expect(count(html, '>the same</td>')).toBe(6)
    expect(count(html, 'What this table tells us')).toBe(4)
    expect(count(html, 'What it is:')).toBe(4)
    expect(count(html, 'What it means with the real numbers:')).toBe(4)
    expect(count(html, 'Why it matters:')).toBe(4)
  })

  it('shows the module\'s numbers, and does not change with either guess apart from the guess block', () => {
    const html = results()
    expect(html).toContain(run.stationaryTarget.systemMass.toFixed(2))
    expect(html).toContain(run.headOn.usable.toFixed(2))
    expect(html).toContain(`${Math.abs(run.stationaryTarget.ownObserverSpeed).toFixed(2)}c`)
    const strip = (h: string) => h.replace(/<div[^>]*>\s*<p[^>]*>Your predictions, beside the results[\s\S]*?<\/p><\/div>/, '')
    expect(strip(results('setup-a', 'same'))).toBe(strip(results('setup-b', 'different')))
  })
})

describe('Part 4: the tutor', () => {
  const tutor = (g1: (typeof GUESSES1)[number], g2: (typeof GUESSES2)[number]) =>
    renderToStaticMarkup(createElement(MakingNewParticlesTutor, { energyOfMotion: K, newMass: X, predicted: g1, ownObserverPredicted: g2 }))

  it('starts with the observe question naming the bars and Part 3, and does not mark either guess yet', () => {
    for (const g1 of GUESSES1) {
      for (const g2 of GUESSES2) {
        const html = tutor(g1, g2)
        expect(html).toContain('Look at the first set of bars in the picture and at the tables in Part 3')
        expect(html).not.toContain('Your first guess was')
        expect(html).not.toContain('Your second guess was')
        expect(html.toLowerCase()).not.toMatch(/\bwrong\b/)
      }
    }
  })

  it('names both white marks in the compare prompt, marks both guesses only in the explanation, and reads the answers from the physics module', () => {
    const source = readFileSync(new URL('./MakingNewParticlesTutor.tsx', import.meta.url), 'utf8')
    expect(source).toContain('Look at the white outline on the bars.')
    expect(source).toContain('Then look at the white tick on the outlined bar in the lower panel of Picture 2.')
    expect(source).toContain('realUsableEnergyAnswerFor(result)')
    expect(source).toContain('realOwnObserverMassAnswerFor(result)')
    expect(source).toContain('Your first guess was')
    expect(source).toContain('Your second guess was')
  })

  it('no longer uses the neutral pion or the 280 MeV figure (no source was read), and labels the LHC figures as 2015 to 2018 values', () => {
    const source = readFileSync(new URL('./MakingNewParticlesTutor.tsx', import.meta.url), 'utf8')
    expect(source).not.toMatch(/pion|NEUTRAL_PION/i)
    expect(source).toContain('2015 to 2018')
    expect(source).toContain('worked out here from the formula, not taken from a source')
  })
})

describe('Section B keeps working, under its new names', () => {
  it('is headed "Section B: Decay" and points back to Section A', () => {
    const html = renderToStaticMarkup(createElement(MakingNewParticlesDecay, { skippedPartOne: true, onBackToPartOne: () => undefined }))
    expect(html).toContain('Section B: Decay')
    expect(html).not.toContain('Part 2 — Decay')
    expect(html).toContain('Back to Section A - Making a new particle')
    expect(html).toContain('If you skipped Section A.')
    expect(html).not.toMatch(/\bPart 1\b/)
  })
})
