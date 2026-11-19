import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HAWKING_PRESETS, PART_ONE_MASS_KG, SUN_MASS_KG, runHawkingRadiationExperiment } from '../physics/hawkingRadiationExperiment'
import type { DirectionAnswer, HotAnswer, LongerAnswer } from '../physics/hawkingRadiationExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { HawkingRadiationExperiment } from './HawkingRadiationExperiment'
import { GuessNotes, HawkingRadiationHeldBackLinks, HawkingRadiationIntro, HawkingRadiationLinks, hawkingRadiationWordsEntries } from './HawkingRadiationIntro'
import { Flow, FlowCaption, GraphCaption, LifetimeGraph, Thermometer, ThermometerCaption } from './HawkingRadiationPictures'
import { HawkingRadiationResults } from './HawkingRadiationResults'
import { HawkingRadiationTutor } from './HawkingRadiationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear exactly
// when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says "right" or
// "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|nothing here says whether they are right|turned right around|right-hand|right edge|right of|to the right|right hand|right end/g, '')
const WHITE = 'stroke="#ffffff"'
const hots: HotAnswer[] = ['big', 'small', 'same']
const directions: DirectionAnswer[] = ['losing', 'gaining', 'same']
const longers: LongerAnswer[] = ['ten', 'hundred', 'thousand']

const run = runHawkingRadiationExperiment(PART_ONE_MASS_KG)
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const count = (html: string, text: string) => html.split(text).length - 1
const thermo = (g: HotAnswer | null) => render(createElement(Thermometer, { result: run, guess: g }))
const flow = (g: DirectionAnswer | null) => render(createElement(Flow, { result: run, progress: 1, guess: g }))
const graph = (g: LongerAnswer | null) => render(createElement(LifetimeGraph, { result: run, guess: g }))
const results = (h: HotAnswer, d: DirectionAnswer, l: LongerAnswer, mass: number | null = null) =>
  render(createElement(HawkingRadiationResults, { hotGuess: h, directionGuess: d, longerGuess: l, partTwoMassKg: mass }))

describe('Black Holes 10 renders (at rest)', () => {
  const html = render(createElement(HawkingRadiationExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 10: Hawking Radiation: Does a Black Hole Slowly Disappear?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('>Want to know more?</h4>'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    for (const url of ['nature.com/articles/248030a0', 'nature.com/articles/s41586-026-10720-3', 'arxiv.org/abs/1809.00913']) expect(html).toContain(url)
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

  it('keeps "The question" word for word and has the introduction figures, with no white', () => {
    expect(html).toContain('So far, a black hole has been a one-way door: things fall in, and nothing comes out, not even light.')
    expect(html).toContain('The energy that leaves would come out of the black hole’s own mass.')
    expect(html).toContain('So which way does a black hole’s mass go, and can a black hole slowly disappear?')
    expect(html).toContain('Figure 1. The question of this page.')
    expect(html).toContain('Figure 3. The kelvin scale.')
    expect(html).not.toContain('#ffffff')
  })

  it('asks whether a black hole can disappear, without assuming it, and gives the reasons for asking', () => {
    expect(html).toContain('Why even ask this.')
    expect(html).toContain('It puts two big ideas side by side.')
    expect(html).toContain('This page does not assume the answer.')
    expect(html).not.toContain('how long it would take to disappear completely')
  })

  it('explains the laboratory copies in their own section, in five parts, with a drawing and the dates', () => {
    for (const w of ['Small copies of black holes, made in the laboratory.', '1. What is a laboratory analogue?', '2. Why make one?', '3. A comparison from daily life.', '4. What has been done.', '5. What this shows, and what it does not.', 'Figure 2. A comparison for a laboratory analogue.', 'Bose-Einstein condensate', '2016.', '2019.', 'July 2026.', 'It does not show']) expect(html).toContain(w)
    expect(html).not.toContain('#ffffff')
  })

  it('has the latest on Hawking radiation: never seen, laboratory analogues, with the dates', () => {
    for (const w of ['has never been observed in astronomy', 'laboratory analogues', '1 July 2026', 'Paderborn', 'Steinhauer', 'Black hole explosions?']) expect(html).toContain(w)
  })

  it('tells the learner the predictions never change the real pictures, and that the guesses are drawn in white', () => {
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('in white')
    expect(html).not.toContain('Your prediction is locked')
  })

  it('keeps the three questions, with the leaking sentence removed from the second', () => {
    expect(html).toContain('Which do you think would be hotter, if they glowed with heat?')
    expect(html).toContain('Do you think a black hole of 10 Suns is losing mass, gaining mass, or staying the same?')
    expect(html).not.toContain('glows at a temperature far below that')
    expect(html).toContain('how many times longer do you think the 10-Suns black hole would take to evaporate')
  })

  it('gives nothing away before the run: no direction of the mass, no cube rule, no "smaller is hotter", no evaporating-now story', () => {
    for (const w of ['gains mass', 'loses mass', 'smaller black hole is hotter', 'cube of', '10 × 10 × 10', 'KM3NeT', 'strongly disfavors', 'Formula:']) expect(html).not.toContain(w)
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('keeps the formulas and the answer words out of the words box until after the first run', () => {
    const before = render(createElement(ReferencePanel, { entries: hawkingRadiationWordsEntries(false) }))
    const after = render(createElement(ReferencePanel, { entries: hawkingRadiationWordsEntries(true) }))
    expect(before).not.toContain('Formula')
    expect(before).toContain('Hawking radiation')
    expect(before).toContain('Information paradox')
    expect(after).toContain('Formula: the temperature')
    expect(after).toContain('6.17 × 10⁻⁹ K')
    expect(after).toContain('Formula: the time to evaporate')
  })

  it('holds back the pages that say which way a mass goes or give the evaporation story until after the first run', () => {
    const start = render(createElement(HawkingRadiationLinks))
    for (const held of ['science.nasa.gov', 'imagine.gsfc', 'km3net', '2503.19227', '2505.24666']) expect(start).not.toContain(held)
    const later = render(createElement(HawkingRadiationHeldBackLinks))
    for (const url of ['science.nasa.gov/universe/black-holes/types/', 'ask_astro/black_holes.html', 'km3net.org', 'arxiv.org/abs/2503.19227', 'arxiv.org/abs/2505.24666']) expect(later).toContain(url)
    expect(later).toContain('not read for this page')
  })
})

describe('the white guess marks', () => {
  it('draw nothing white without a guess, on all three pictures', () => {
    for (const html of [thermo(null), flow(null), graph(null)]) {
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('draw every guess in white, in a YOUR GUESS box, once a guess is given', () => {
    for (const html of [thermo('small'), flow('gaining'), graph('hundred')]) {
      expect(count(html, 'YOUR GUESS')).toBe(1)
      expect(html).toContain(WHITE)
    }
  })

  it('follow the guess: a different guess gives a different mark, on each picture', () => {
    expect(new Set(hots.map(thermo)).size).toBe(3)
    expect(new Set(directions.map(flow)).size).toBe(3)
    expect(new Set(longers.map(graph)).size).toBe(3)
  })

  it('put the thermometer mark on the dot of the black hole the learner called hotter', () => {
    const ring = (h: string) => {
      const m = h.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="13" fill="none" stroke="#ffffff"/)
      return m ? Number(m[2]) : null
    }
    const big = ring(thermo('big'))
    const small = ring(thermo('small'))
    expect(big).not.toBeNull()
    expect(small).not.toBeNull()
    // the 1-Sun dot is hotter, so higher up the picture (a smaller y) than the 10-Suns dot
    expect(small as number).toBeLessThan(big as number)
    expect(ring(thermo('same'))).toBeNull()
  })

  it('put the graph mark at the guessed time: only "1,000 times" reaches the real 10-Suns time, and the zoom panel separates the three', () => {
    const rings = (h: string) => [...h.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="13" fill="none" stroke="#ffffff"/g)].map((m) => [Number(m[1]), Number(m[2])])
    const [ten, hundred, thousand] = longers.map((l) => rings(graph(l)))
    // two rings each: the upper graph's, and the zoom panel's
    expect(ten.length).toBe(2)
    expect(ten[1][0]).toBeLessThan(hundred[1][0])
    expect(hundred[1][0]).toBeLessThan(thousand[1][0])
    // on the upper graph a higher y means a shorter time, so the guesses rise from 10 to 1,000
    expect(thousand[0][1]).toBeLessThan(hundred[0][1])
    expect(hundred[0][1]).toBeLessThan(ten[0][1])
  })

  it('recolour the old white elements: green background, violet chosen ring, rose horizon, gold age lines', () => {
    const html = thermo(null) + flow(null) + graph(null)
    for (const colour of ['#4ade80', '#a78bfa', '#fb7185', '#fbbf24']) expect(html).toContain(colour)
    expect(html).not.toContain('white ring')
    expect(html).not.toContain('white line')
  })

  it('say in the captions that a white mark is only a marker, and every look-for has three parts', () => {
    const caps = [ThermometerCaption, FlowCaption, GraphCaption].map((c) => render(createElement(c, { result: run, number: 1, withGuesses: true })))
    // the third guess has a time of its own, so its caption says what the mark's length means and not that it is only a marker
    expect(caps[0]).toContain('only a marker')
    expect(caps[1]).toContain('only a marker')
    expect(caps[2]).toContain('where your answer puts the time')
    for (const c of caps) {
      expect(c).toContain('<strong>Look at:</strong>')
      expect(c).toContain('<strong>What it means:</strong>')
      expect(c).toContain('<strong>Why it matters:</strong>')
    }
  })

  it('keep the verdicts and the heat-flow rule out of the captions (the tutor’s)', () => {
    const all = [ThermometerCaption, FlowCaption, GraphCaption].map((c) => render(createElement(c, { result: run, number: 1, withGuesses: true }))).join(' ')
    expect(noOwnWords(all)).not.toMatch(VERDICT)
    expect(all).not.toContain('Heat flows from what is hotter')
    expect(flow(null)).not.toContain("So the black hole's mass")
  })
})

describe('the results (Part 3)', () => {
  it('are the same for every combination of guesses', () => {
    const strip = (h: string) => h.replace(/your guess \d/g, '')
    const base = strip(tables(results('small', 'gaining', 'thousand')))
    for (const h of hots) for (const d of directions) for (const l of longers) expect(strip(tables(results(h, d, l)))).toBe(base)
  })

  it('show the guesses beside the results, tag the rows, and never mark a guess', () => {
    const html = results('small', 'gaining', 'thousand')
    expect(html).toContain('Your guesses, beside the results.')
    for (const n of [1, 2, 3]) expect(html).toContain(`your guess ${n}`)
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('have a check-up with published values, a note under every table, and no NaN', () => {
    const html = results('same', 'same', 'ten')
    expect(html).toContain('Table 1: A check-up against published values')
    for (const w of ['one ten-millionth of a degree', '10⁻⁶', 'much longer than the age of the Universe', 'would have evaporated by now', 'does not explain why']) expect(html).toContain(w)
    expect(count(html, 'What this table tells us')).toBe(3)
    expect(html).not.toContain('NaN')
  })

  it('read Table 2 for the learner’s own black hole after a Part 2 run, and for 10 Suns before', () => {
    expect(results('big', 'losing', 'ten')).toContain('the black hole of Part 1')
    const m87 = HAWKING_PRESETS.find((p) => p.id === 'm87-star')!.massKg
    const html = results('big', 'losing', 'ten', m87)
    expect(html).toContain('M87*')
    expect(html).not.toContain('the black hole of Part 1')
  })

  it('have the two real photographs with their credit, the search for ending black holes, and the module’s coldness numbers', () => {
    const html = results('same', 'same', 'ten')
    for (const w of ['Figure 4. The only two black holes we have photographed.', 'EHT Collaboration (CC BY 4.0), via ESO', 'strongly disfavors', 'astronomically small']) expect(html).toContain(w)
    expect(html).not.toContain('trillions')
    expect(html).not.toContain('NaN')
  })
})

describe('the tutor and the notes', () => {
  it('names the white marks in its first prompts, and marks nothing before its explanation', () => {
    const html = render(createElement(HawkingRadiationTutor, { predictedHot: 'small', predictedDirection: 'gaining', predictedLonger: 'thousand', matches: { hot: true, direction: true, longer: true } }))
    expect(html).toContain('white YOUR GUESS marks')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('has a note under each of the three questions that says only where the guess will be drawn', () => {
    for (const n of [1, 2, 3] as const) expect(render(createElement(GuessNotes, { n }))).toContain('in white')
  })

  it('renders the introduction alone with no NaN', () => {
    expect(render(createElement(HawkingRadiationIntro))).not.toContain('NaN')
    expect(PART_ONE_MASS_KG).toBe(10 * SUN_MASS_KG)
  })
})
