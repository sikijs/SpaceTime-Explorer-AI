import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PART_ONE_PRESET_ID, PART_ONE_SPIN, runSpinningBlackHoleExperiment } from '../physics/spinningBlackHoleExperiment'
import type { EdgeAnswer, EnergyAnswer, HorizonAnswer } from '../physics/spinningBlackHoleExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { SpinningBlackHoleExperiment } from './SpinningBlackHoleExperiment'
import { GuessNotes, RealSpinningBlackHoles, SpinningBlackHoleHeldBackLinks, SpinningBlackHoleIntro, SpinningBlackHoleLinks, spinningBlackHoleWordsEntries } from './SpinningBlackHoleIntro'
import { EdgesCaption, EdgesGraph, EnergyCaption, EnergyPicture, MapCaption, SafeOrbitMap } from './SpinningBlackHolePictures'
import { SpinningBlackHoleResults } from './SpinningBlackHoleResults'
import { SpinningBlackHoleTutor } from './SpinningBlackHoleTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, white is used for nothing but guesses, and no page says
// "right" or "wrong" before the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|nothing here says whether they are right|turned right around|right-hand|right edge|right of|to the right|right hand/g, '')
const WHITE = 'stroke="#ffffff"'
const edges: EdgeAnswer[] = ['closer', 'same', 'farther']
const horizons: HorizonAnswer[] = ['bigger', 'same', 'smaller']
const energies: EnergyAnswer[] = ['with', 'against', 'same']

const run = runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, PART_ONE_SPIN)
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const count = (html: string, text: string) => html.split(text).length - 1
const map = (g: { with: EdgeAnswer; against: EdgeAnswer; horizon: HorizonAnswer } | null, progress = 1) => render(createElement(SafeOrbitMap, { result: run, progress, guesses: g }))
const graph = (g: { with: EdgeAnswer; against: EdgeAnswer; horizon: HorizonAnswer } | null, progress = 1) => render(createElement(EdgesGraph, { result: run, progress, guesses: g }))
const energy = (g: EnergyAnswer | null, progress = 1) => render(createElement(EnergyPicture, { result: run, progress, guess: g }))
const results = (w: EdgeAnswer, a: EdgeAnswer, h: HorizonAnswer, e: EnergyAnswer, two = null as ReturnType<typeof runSpinningBlackHoleExperiment> | null) =>
  render(createElement(SpinningBlackHoleResults, { withGuess: w, againstGuess: a, horizonGuess: h, energyGuess: e, partTwo: two }))

describe('Black Holes 8 renders (at rest)', () => {
  const html = render(createElement(SpinningBlackHoleExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 8: Spinning Black Holes: Does Spin Change Where Orbits Are Safe?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('>Want to know more?</h4>'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    for (const url of ['science.nasa.gov/universe/black-holes/anatomy/', 'nustar.caltech.edu/news/nustar130227', 'mpifr-bonn.mpg.de/pressreleases/2025/6', 'eso.org/public/images/eso1907a/', 'esahubble.org/images/opo0020a/', 'arxiv.org/abs/2011.08948', 'arxiv.org/abs/2102.09093', 'arxiv.org/abs/1302.7002', 'arxiv.org/abs/2507.08219', 'doi.org/10.1086/151796', 'doi.org/10.1103/PhysRevLett.11.237']) {
      expect(html).toContain(url)
    }
    expect(html).toContain('target="_blank"')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
  })

  it('has an always-visible Start over, greyed out, and a disabled Run, and no "Change prediction"', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Change predictions')
  })

  it('draws no white mark, no NaN and none of the Part 1 pictures before the run', () => {
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('How to read Picture 1')
    expect(html).toContain('Pictures 1, 2 and 3 appear here when you press Run')
  })

  it('has the three introduction figures, with their credits and no white', () => {
    expect(html).toContain('Figure 1. A spinning black hole, as an artist imagines it.')
    expect(html).toContain('NASA/JPL-Caltech')
    expect(html).toContain('Figure 2. The skater.')
    expect(html).toContain('Figure 3. Two ways round.')
    expect(html).not.toContain('#ffffff')
  })

  it('tells the learner the predictions never change the real pictures, and that guesses are drawn in white and shown again beside the results', () => {
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('in white')
    expect(html).not.toContain('Your prediction is locked')
  })

  it('keeps the four questions as approved and gives nothing away before the run', () => {
    for (const q of ['where do you think the last safe orbit is?', 'Now the probe circles against the spin.', 'does its horizon (the point of no return) get bigger, stay the same size, or get smaller?', 'Which probe do you think gives up more']) {
      expect(html).toContain(q)
    }
    const before = html.toLowerCase()
    for (const word of ['frame dragging', 'ergosphere', 'penrose', 'molasses']) expect(before).not.toContain(word)
    expect(html).not.toContain('0.9985') // the measured spins wait until after the first run
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('keeps the formulas, with their worked numbers, and the later words out of the words box until after the first run', () => {
    const before = render(createElement(ReferencePanel, { entries: spinningBlackHoleWordsEntries(false) }))
    const after = render(createElement(ReferencePanel, { entries: spinningBlackHoleWordsEntries(true) }))
    expect(before).not.toContain('Frame dragging')
    expect(before).not.toContain('Formula: the horizon')
    expect(before).toContain('Last safe orbit; ISCO')
    expect(after).toContain('Frame dragging')
    expect(after).toContain('Formula: the energy given up')
    expect(after).toContain('0.718')
  })
})

describe('the white guess marks', () => {
  it('draw nothing white without a guess, on all three pictures', () => {
    for (const html of [map(null), graph(null), energy(null)]) {
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('draw every guess in white, in a YOUR GUESS box, once a guess is given', () => {
    const g = { with: 'closer', against: 'farther', horizon: 'smaller' } as const
    for (const html of [map(g), graph(g)]) {
      expect(count(html, 'YOUR GUESS')).toBe(3)
      expect(html).toContain(WHITE)
    }
    expect(count(energy('with'), 'YOUR GUESS')).toBe(1)
    expect(energy('with')).toContain(WHITE)
  })

  it('follow the guess: a different guess gives a different mark, and the real drawing does not change', () => {
    const marks = edges.map((w) => map({ with: w, against: 'same', horizon: 'same' }))
    expect(new Set(marks).size).toBe(3)
    const horizonMarks = horizons.map((h) => map({ with: 'same', against: 'same', horizon: h }))
    expect(new Set(horizonMarks).size).toBe(3)
    const energyMarks = energies.map((e) => energy(e))
    expect(new Set(energyMarks).size).toBe(3)
    const strip = (h: string) => h.replace(/<g>[\s\S]*?YOUR GUESS[\s\S]*?<\/g>/g, '')
    const rings = (h: string) => (h.match(/<circle[^>]*>/g) ?? []).filter((c) => !c.includes('#ffffff')).join('')
    expect(rings(marks[0])).toBe(rings(marks[1]))
    expect(strip(graph({ with: 'closer', against: 'same', horizon: 'same' }))).toBeTruthy()
  })

  it('put "closer" inside the dashed ring and "farther" outside it, on the map', () => {
    const cx = 225
    const cy = 290
    const markPoint = (h: string) => {
      const m = h.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="12" fill="none" stroke="#ffffff"/)
      return { x: Number(m![1]), y: Number(m![2]) }
    }
    const distance = (h: string) => Math.hypot(markPoint(h).x - cx, markPoint(h).y - cy) / 42
    expect(distance(map({ with: 'closer', against: 'same', horizon: 'same' }))).toBeCloseTo(2, 3)
    expect(distance(map({ with: 'same', against: 'same', horizon: 'same' }))).toBeCloseTo(3, 3)
    expect(distance(map({ with: 'farther', against: 'same', horizon: 'same' }))).toBeCloseTo(4, 3)
  })

  it('uses violet for the horizon and cyan for the "now" dots (white is for guesses only)', () => {
    const html = map(null) + graph(null) + energy(null)
    expect(html).toContain('#c084fc')
    expect(graph(null)).toContain('#22d3ee')
    expect(html).not.toContain('#e2e8f0" strokeWidth={1.5}')
  })

  it('say in the captions that a white mark is only a marker, and name every drawn thing', () => {
    const m = render(createElement(MapCaption, { result: run, number: 1, complete: true, withGuesses: true }))
    expect(m).toContain('only a marker')
    expect(m).toContain('<strong>Look at</strong>')
    expect(m).toContain('<strong>What it means:</strong>')
    expect(m).toContain('<strong>Why it matters:</strong>')
    expect(render(createElement(EdgesCaption, { result: run, number: 2, complete: true, withGuesses: true }))).toContain('only a marker')
    expect(render(createElement(EnergyCaption, { result: run, number: 3, complete: true, withGuesses: true }))).toContain('only a marker')
  })

  it('leave the white-mark sentence out of the captions before the run has finished', () => {
    expect(render(createElement(MapCaption, { result: run, number: 1, complete: false, withGuesses: true }))).not.toContain('YOUR GUESS boxes')
  })

  it('keep outcomes and mechanism out of the captions (they are the tutor\'s)', () => {
    const all = [MapCaption, EdgesCaption, EnergyCaption].map((c) => render(createElement(c, { result: run, number: 1, complete: true, withGuesses: true }))).join(' ')
    expect(all.toLowerCase()).not.toContain('frame dragging')
    expect(all).not.toContain('bends down')
    expect(all).not.toContain('the horizon gets smaller')
    expect(noOwnWords(all)).not.toMatch(VERDICT)
  })
})

describe('the results (Part 3)', () => {
  it('are the same for every combination of guesses', () => {
    const base = tables(results('closer', 'farther', 'smaller', 'with'))
    for (const w of edges) for (const h of horizons) for (const e of energies) expect(tables(results(w, 'same', h, e)).replace(/your guess \d/g, '')).toBe(base.replace(/your guess \d/g, ''))
  })

  it('show the guesses beside the results, tag the rows, and never mark a guess', () => {
    const html = results('closer', 'farther', 'smaller', 'with')
    expect(html).toContain('Your guesses, beside the results.')
    for (const n of [1, 2, 3, 4]) expect(html).toContain(`your guess ${n}`)
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })

  it('have a check-up, a note under every table, and no NaN', () => {
    const html = results('same', 'same', 'same', 'same')
    expect(html).toContain('Table 1: A check-up on the calculation')
    expect(count(html, 'What this table tells us')).toBe(4 - 1) // Table 3 has no note until it is run
    expect(html).toContain('Not run yet.')
    expect(html).not.toContain('NaN')
    expect(html).toContain('the same')
    expect(html).toContain('outside the horizon')
  })

  it('add the note under Table 3 once Part 2 has been run, with the learner\'s own numbers', () => {
    const two = runSpinningBlackHoleExperiment('m87-star', 0.99)
    const html = results('same', 'same', 'same', 'same', two)
    expect(count(html, 'What this table tells us')).toBe(4)
    expect(html).toContain('trial values')
    expect(html).not.toContain('Not run yet.')
  })

  it('give the real-black-hole examples with their sources and say they are not outputs of this page', () => {
    const html = render(createElement(RealSpinningBlackHoles))
    for (const word of ['Cygnus X-1', 'NGC 1365', 'GW231123', '0.9985', '2.5 gravitational radii', 'How sure', 'not outputs of this page', 'CC BY 4.0']) expect(html).toContain(word)
  })
})

describe('the tutor and the notes', () => {
  it('names the white marks in its first prompts, and marks nothing before its explanation', () => {
    const html = render(
      createElement(SpinningBlackHoleTutor, {
        predictedWith: 'closer',
        predictedAgainst: 'farther',
        predictedHorizon: 'smaller',
        predictedEnergy: 'with',
        matches: { with: true, against: true, horizon: true, energy: true },
      }),
    )
    expect(html).toContain('white YOUR GUESS marks')
    expect(noOwnWords(html)).not.toMatch(VERDICT)
    expect(html.toLowerCase()).not.toContain('frame dragging')
  })

  it('has a note under each of the four questions that says only where the guess will be drawn', () => {
    for (const n of [1, 2, 3, 4] as const) expect(render(createElement(GuessNotes, { n }))).toContain('in white')
  })

  it('holds the pages that name the effect until after the run', () => {
    const html = render(createElement(SpinningBlackHoleHeldBackLinks))
    expect(html).toContain('nasa.gov/universe/nasa-simulation-suggests-black-holes-may-make-ideal-dark-matter-labs')
    expect(html).toContain('einstein.stanford.edu/MISSION/mission1.html')
    expect(render(createElement(SpinningBlackHoleLinks))).not.toContain('einstein.stanford.edu')
  })

  it('renders the introduction alone with no answer words', () => {
    const html = render(createElement(SpinningBlackHoleIntro))
    expect(html.toLowerCase()).not.toContain('frame dragging')
    expect(html).not.toContain('NaN')
  })
})
