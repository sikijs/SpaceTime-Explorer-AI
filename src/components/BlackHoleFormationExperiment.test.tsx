import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PART_ONE_MASS, runBlackHoleFormationExperiment } from '../physics/blackHoleFormationExperiment'
import type { LimitAnswer, SizeAnswer, ThresholdAnswer } from '../physics/blackHoleFormationExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { BlackHoleFormationExperiment } from './BlackHoleFormationExperiment'
import { BlackHoleFormationHeldBackLinks, BlackHoleFormationIntro, BlackHoleFormationLinks, GuessNotes, RealDeadStars, blackHoleFormationWordsEntries } from './BlackHoleFormationIntro'
import { GraphCaption, Ladder, LadderCaption, RulerCaption, SizeRuler, WhiteDwarfGraph } from './BlackHoleFormationPictures'
import { BlackHoleFormationResults } from './BlackHoleFormationResults'
import { BlackHoleFormationTutor } from './BlackHoleFormationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says
// "right" or "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|nothing here says whether they are right|turned right around|right-hand|right edge|right of|to the right|right hand|right end/g, '')
const WHITE = 'stroke="#ffffff"'
const sizes: SizeAnswer[] = ['bigger', 'same', 'smaller']
const thresholds: ThresholdAnswer[] = ['about-one', 'about-three', 'about-thirty']
const limits: LimitAnswer[] = ['higher', 'same', 'lower']

const run = runBlackHoleFormationExperiment(PART_ONE_MASS)
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const count = (html: string, text: string) => html.split(text).length - 1
const ladder = (g: { threshold: ThresholdAnswer; limit: LimitAnswer } | null) => render(createElement(Ladder, { result: run, guesses: g }))
const graph = (g: SizeAnswer | null) => render(createElement(WhiteDwarfGraph, { result: run, guess: g }))
const results = (s: SizeAnswer, t: ThresholdAnswer, l: LimitAnswer, two = null as ReturnType<typeof runBlackHoleFormationExperiment> | null) =>
  render(createElement(BlackHoleFormationResults, { sizeGuess: s, thresholdGuess: t, limitGuess: l, partTwo: two }))

describe('Black Holes 9 renders (at rest)', () => {
  const html = render(createElement(BlackHoleFormationExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 9: How a Black Hole Forms: What Can Hold Up a Dead Star’s Core?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('>Want to know more?</h4>'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    for (const url of ['science.nasa.gov/universe/stars/"', 'esahubble.org/news/heic0516/', 'chandra.harvard.edu/photo/2000/0065/']) expect(html).toContain(url)
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
    expect(html).toContain('Pictures 1, 2 and 3 appear here when you press Run')
  })

  it('has the three introduction figures with their credits and no white', () => {
    expect(html).toContain('Figure 1. A star is a balance.')
    expect(html).toContain('Figure 2. A white dwarf beside the Earth, in an artist’s picture.')
    expect(html).toContain('Image: ESA and NASA, via ESA/Hubble (CC BY 4.0).')
    expect(html).toContain('Figure 3. The seats of the theatre.')
    expect(html).not.toContain('#ffffff')
  })

  it('keeps the owner’s six ideas, tells the learner the predictions never change the real pictures, and says the guesses are drawn in white', () => {
    for (const idea of ['A star is a balance.', 'The heat comes from fuel.', 'The fuel runs out.', 'Gravity then squeezes the core.', 'Squeezing brings in a different kind of push.', 'What is left depends on what holds the core up.']) expect(html).toContain(idea)
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('in white')
    expect(html).not.toContain('Your prediction is locked')
  })

  it('keeps the three questions as approved and gives nothing away before the run', () => {
    for (const q of ['If you add more mass to a white dwarf, what do you think happens to its size?', "At about what mass do you think a dead star's core first becomes a black hole? (This is the mass of the core, the middle part that has run out of fuel, not of the whole star. A star's outer layers are not counted.)", "Do you think the largest mass a neutron star can have is higher than, the same as, or lower than a white dwarf's?"]) {
      expect(html).toContain(q)
    }
    for (const word of ['Chandrasekhar', '1.44', 'Sirius B’s mass', 'mass gap']) expect(html).not.toContain(word)
    expect(html).not.toContain('heavier white dwarf is smaller')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('keeps the Chandrasekhar name, the formulas and the later words out of the words box until after the first run', () => {
    const before = render(createElement(ReferencePanel, { entries: blackHoleFormationWordsEntries(false) }))
    const after = render(createElement(ReferencePanel, { entries: blackHoleFormationWordsEntries(true) }))
    expect(before).not.toContain('Chandrasekhar')
    expect(before).not.toContain('Formula')
    expect(before).toContain('Degeneracy pressure')
    expect(after).toContain('Chandrasekhar limit')
    expect(after).toContain('Formula: a white dwarf’s radius')
    expect(after).toContain('5,655 km')
  })

  it('holds back the pages that give guesses away until after the first run', () => {
    const start = render(createElement(BlackHoleFormationLinks))
    for (const held of ['imagine.gsfc.nasa.gov', 'arxiv.org', 'stars/types', 'black-holes/types', 'eso2408']) expect(start).not.toContain(held)
    const later = render(createElement(BlackHoleFormationHeldBackLinks))
    for (const url of ['science.nasa.gov/universe/stars/types/', 'dwarfs2.html', 'neutron_stars.html', 'black-holes/types/', 'collapsing-star-gives-birth-to-a-black-hole', 'eso2408', 'su.se/english/news', 'arxiv.org/abs/2207.05124', 'arxiv.org/abs/2407.06789', 'arxiv.org/abs/2406.14466', 'arxiv.org/abs/2404.04248', 'arxiv.org/abs/2404.10486', 'arxiv.org/abs/1703.10625', 'arxiv.org/abs/1609.01283']) {
      expect(later).toContain(url)
    }
    expect(later).toContain('not read for this page')
  })
})

describe('the white guess marks', () => {
  it('draw nothing white without a guess, on the ladder and the graph', () => {
    for (const html of [ladder(null), graph(null)]) {
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('draw every guess in white, in a YOUR GUESS box, once a guess is given', () => {
    const l = ladder({ threshold: 'about-three', limit: 'higher' })
    expect(count(l, 'YOUR GUESS')).toBe(2)
    expect(l).toContain(WHITE)
    expect(count(graph('smaller'), 'YOUR GUESS')).toBe(1)
    expect(graph('smaller')).toContain(WHITE)
  })

  it('follow the guess: a different guess gives a different mark', () => {
    expect(new Set(thresholds.map((t) => ladder({ threshold: t, limit: 'same' }))).size).toBe(3)
    expect(new Set(limits.map((l) => ladder({ threshold: 'about-one', limit: l }))).size).toBe(3)
    expect(new Set(sizes.map((s) => graph(s))).size).toBe(3)
  })

  it('puts guess 2 at its own mass on the ladder (1 Sun left of 3 Suns) and an arrow off the right end for 30 Suns', () => {
    const ring = (h: string) => {
      const m = h.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="12" fill="none" stroke="#ffffff"/)
      return m ? Number(m[1]) : null
    }
    const one = ring(ladder({ threshold: 'about-one', limit: 'same' }))
    const three = ring(ladder({ threshold: 'about-three', limit: 'same' }))
    expect(one).not.toBeNull()
    expect(three).not.toBeNull()
    expect(one as number).toBeLessThan(three as number)
    // 1 Sun and 3 Suns on the log scale from 0.3 to 10 (60 to 640 px)
    const xFor = (m: number) => 60 + ((Math.log(m) - Math.log(0.3)) / (Math.log(10) - Math.log(0.3))) * 580
    expect(one as number).toBeCloseTo(xFor(1), 1)
    expect(three as number).toBeCloseTo(xFor(3), 1)
    const thirty = ladder({ threshold: 'about-thirty', limit: 'same' })
    expect(ring(thirty)).toBeNull()
    expect(thirty).toContain('30 Suns: off the scale')
  })

  it('uses cyan for your core, and rose for the black hole zone and the horizon (white is for guesses only)', () => {
    const html = ladder(null) + render(createElement(SizeRuler, { result: run, progress: 1 })) + graph(null)
    expect(html).toContain('#22d3ee')
    expect(html).toContain('#fb7185')
    expect(html).not.toContain('#e2e8f0" strokeWidth')
  })

  it('say in the captions that a white mark is only a marker, and every look-for has three parts', () => {
    const l = render(createElement(LadderCaption, { result: run, number: 1, complete: true, withGuesses: true }))
    expect(l).toContain('only a marker')
    expect(l).toContain('<strong>Look at</strong>')
    expect(l).toContain('<strong>What it means:</strong>')
    expect(l).toContain('<strong>Why it matters:</strong>')
    expect(render(createElement(GraphCaption, { result: run, number: 3, complete: true, withGuesses: true }))).toContain('only a marker')
    expect(render(createElement(RulerCaption, { result: run, number: 2 }))).toContain('<strong>Look at</strong>')
  })

  it('leave the white-mark sentence out of the captions before the run has finished', () => {
    expect(render(createElement(LadderCaption, { result: run, number: 1, complete: false, withGuesses: true }))).not.toContain('YOUR GUESS boxes')
  })

  it('keep the verdicts out of the captions (they are the tutor’s)', () => {
    const all = [LadderCaption, GraphCaption].map((c) => render(createElement(c, { result: run, number: 1, complete: true, withGuesses: true }))).join(' ')
    expect(noOwnWords(all)).not.toMatch(VERDICT)
  })
})

describe('the results (Part 3)', () => {
  it('are the same for every combination of guesses', () => {
    const strip = (h: string) => h.replace(/your guess \d/g, '')
    const base = strip(tables(results('smaller', 'about-three', 'higher')))
    for (const s of sizes) for (const t of thresholds) for (const l of limits) expect(strip(tables(results(s, t, l)))).toBe(base)
  })

  it('show the guesses beside the results, tag the rows, and never mark a guess', () => {
    const html = results('smaller', 'about-three', 'higher')
    expect(html).toContain('Your guesses, beside the results.')
    for (const n of [1, 2, 3]) expect(html).toContain(`your guess ${n}`)
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('have a check-up with published values, a note under every table, and no NaN', () => {
    const html = results('same', 'about-one', 'same')
    expect(html).toContain('Table 1: A check-up against published values')
    for (const word of ['1.4 Suns (NASA', '6,000 km', 'less by about 8%', 'inside the measured ranges', '2.073 and 2.35 Suns', 'the same, once rounded to 1.4']) expect(html).toContain(word)
    expect(count(html, 'What this table tells us')).toBe(4)
    expect(html).toContain('Not run yet.')
    expect(html).not.toContain('NaN')
  })

  it('add the note under Table 5 once Part 2 has been run, with the learner’s own numbers', () => {
    const html = results('same', 'about-one', 'same', runBlackHoleFormationExperiment(2.5))
    expect(count(html, 'What this table tells us')).toBe(5)
    expect(html).toContain('trial values')
    expect(html).not.toContain('Not run yet.')
  })

  it('give the real dead stars with their sources and say they are not outputs of this page', () => {
    const html = render(createElement(RealDeadStars))
    for (const word of ['Sirius B', 'GW230529', '2.35 ± 0.17', 'How sure', 'not outputs of this page', 'CC BY 4.0', 'Careful', 'N6946-BH1', 'Gaia BH3', 'a neutron star in the supernova of 1987']) expect(html.toLowerCase()).toContain(word.toLowerCase())
  })
})

describe('the tutor and the notes', () => {
  it('names the white marks in its first prompts, and marks nothing before its explanation', () => {
    const html = render(createElement(BlackHoleFormationTutor, { predictedSize: 'smaller', predictedThreshold: 'about-three', predictedLimit: 'higher', matches: { size: true, threshold: true, limit: true } }))
    expect(html).toContain('white YOUR GUESS marks')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('has a note under each of the three questions that says only where the guess will be drawn', () => {
    for (const n of [1, 2, 3] as const) expect(render(createElement(GuessNotes, { n }))).toContain('in white')
  })

  it('renders the introduction alone with no answer words', () => {
    const html = render(createElement(BlackHoleFormationIntro))
    expect(html).not.toContain('Chandrasekhar')
    expect(html).not.toContain('NaN')
  })
})
