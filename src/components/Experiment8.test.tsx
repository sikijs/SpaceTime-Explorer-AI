import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { OrderChoice } from '../physics/spacetimeDiagramView'
import { Experiment8, PART_LEADS, Part3Results } from './Experiment8'
import { DiagramCaption, LookFor, SpacetimeDiagram, WorkedMoment } from './Experiment8Pictures'
import { Experiment8Tutor } from './Experiment8Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marker appears exactly when a guess is given and
// its dot is drawn. They do not check how the page looks.
const ORDERS: OrderChoice[] = ['same', 'back', 'front']
const SPEEDS = [0, 0.01, 0.1, 0.3, 0.5, 0.8, 0.9]
const END = 10

describe('Relativity 8 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part and no marker', () => {
    const html = renderToStaticMarkup(createElement(Experiment8, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS:')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment8, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the speed buttons have left the first screen, and the prediction is written for 0.5c', () => {
    const html = renderToStaticMarkup(createElement(Experiment8, {}))
    expect(html).not.toContain('Block speed')
    expect(html).not.toContain('0c (at rest)')
    expect(html).toContain('<strong>0.5c</strong>')
  })

  it('the introduction uses the chapters\' titles and defines the light-second, with both sketches and no "rod"', () => {
    const html = renderToStaticMarkup(createElement(Experiment8, {}))
    for (const text of [
      'At the same time... for whom?',
      'One clock',
      'Why can’t light go faster?',
      'Does motion change length?',
      'light-second</strong> is the distance light travels in one second',
      'From a block to two leaning lines',
      'From a flash to two leaning lines',
      'Your guess and the real picture.',
    ]) {
      expect(html).toContain(text)
    }
    // the page's own heading says "Experiment 8"; nothing else may name a chapter by number
    expect(html.replace('Experiment 8 — Drawing Spacetime', '')).not.toMatch(/Experiment [1-9]\b/)
    expect(html).not.toMatch(/\b[Rr]ods?\b/)
  })

  it('the three links from the start are listed and the held-back page is not', () => {
    const html = renderToStaticMarkup(createElement(Experiment8, {}))
    expect(html).toContain('how_fast_is_the_speed.htm')
    expect(html).toContain('einstein-online.info/en/speed_of_light/')
    expect(html).not.toContain('einstein-online.info/en/spacetime/')
  })

  it('the Part 1 lead gives no answer, and each Part lead is written', () => {
    expect(PART_LEADS.part1).not.toMatch(/back end first|front end first|same time/i)
    expect(PART_LEADS.part1).toContain('0.5c')
    expect(PART_LEADS.part2).toContain('0.9c')
    expect(PART_LEADS.part3).toContain('Nothing in this Part changes')
    expect(PART_LEADS.part4).toContain('white marker')
  })
})

describe('Relativity 8 diagram', () => {
  const draw = (v: number, animTime: number, guess: OrderChoice | null, extra: Record<string, unknown> = {}) => {
    const diagram = spacetimeDiagramFor(runSimultaneityExperiment(v))
    return renderToStaticMarkup(
      createElement(SpacetimeDiagram, { diagram, animTime, title: 'T', label: 'L', guess, ...extra }),
    )
  }

  it('draws labelled axes, tick marks and a key at every speed, with no NaN', () => {
    for (const v of SPEEDS) {
      const html = draw(v, END, null)
      expect(html).toContain('position (light-seconds)')
      expect(html).toContain('time (seconds)')
      expect(html).toContain('Flash released here')
      expect(html).toContain('Back end of the block')
      expect(html).toContain('Front end of the block')
      expect(html).toContain('Light going to the back end')
      expect(html).toContain('Light going to the front end')
      expect(html).not.toContain('NaN')
    }
  })

  it('shows the white marker only when a guess is given and its dot is drawn', () => {
    expect(draw(0.5, END, null)).not.toContain('YOUR GUESS:')
    expect(draw(0.5, 0, 'back')).not.toContain('YOUR GUESS:')
    expect(draw(0.5, END, 'same')).toContain('YOUR GUESS: both at the same time')
    expect(draw(0.5, END, 'back')).toContain('YOUR GUESS: the back end&#x27;s worldline first')
    expect(draw(0.5, END, 'front')).toContain('YOUR GUESS: the front end&#x27;s worldline first')
    // the back dot is drawn at 0.144 s but the front dot is not yet: a "front" marker waits
    expect(draw(0.5, 0.2, 'back')).toContain('YOUR GUESS:')
    expect(draw(0.5, 0.2, 'front')).not.toContain('YOUR GUESS:')
    expect(draw(0.5, 0.2, 'same')).not.toContain('YOUR GUESS:')
  })

  it('a different guess gives a different mark, and the dots and numbers do not change with the guess', () => {
    const back = draw(0.5, END, 'back')
    const front = draw(0.5, END, 'front')
    expect(back).not.toBe(front)
    for (const html of [back, front, draw(0.5, END, 'same')]) {
      expect(html).toContain('0.144 s')
      expect(html).toContain('0.433 s')
    }
  })

  it('Part 2 writes the speed in pink and draws every speed at one scale, with no marker', () => {
    const scaleDiagrams = [0, 0.9].map((v) => spacetimeDiagramFor(runSimultaneityExperiment(v)))
    for (const v of SPEEDS) {
      const html = draw(v, END, null, { scaleDiagrams, pinkSpeed: v })
      expect(html).toContain(`your speed: ${v}c`)
      expect(html).not.toContain('YOUR GUESS:')
      expect(html).not.toContain('NaN')
    }
  })

  it('at 0c the two dots are level and are named as both ends reached', () => {
    expect(draw(0, END, null)).toContain('both ends reached')
  })
})

describe('Relativity 8 captions, results and tutor', () => {
  it('the caption names every drawn thing, defines the light-second and gives no times', () => {
    const html = renderToStaticMarkup(createElement(DiagramCaption, { speedLabel: '0.5c', part: 1 }))
    for (const text of ['How to read this diagram.', 'The amber dot', 'The two solid lines', 'The two dashed lines', 'The dots', 'The white marker', 'a light-second is the distance light travels in one second']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('0.144')
    expect(html).not.toContain('0.433')
  })

  it('the worked moment at 0.5c has the module\'s numbers, and at 0c and 0.01c it does not say the block is shorter or lose decimals', () => {
    const at = (v: number) => {
      const result = runSimultaneityExperiment(v)
      return renderToStaticMarkup(createElement(WorkedMoment, { result, diagram: spacetimeDiagramFor(result), part: v === 0.5 ? 1 : 2 }))
    }
    const half = at(0.5)
    expect(half).toContain('0.433 light-seconds')
    expect(half).toContain('0.2165 ÷ 1.5')
    expect(half).toContain('0.144 s')
    expect(half).toContain('1.5c')
    expect(half).toContain('0.5c')
    expect(half).toContain('0.289 s lower')
    const rest = at(0)
    expect(rest).not.toContain('shorter')
    expect(rest).toContain('same height')
    expect(at(0.01)).toContain('0.49997')
    expect(at(0.8)).toContain('0.083 s')
  })

  it('what to look for has all three parts for every item, in Part 1 and Part 2', () => {
    const r = runSimultaneityExperiment(0.5)
    for (const part of [1, 2] as const) {
      const html = renderToStaticMarkup(createElement(LookFor, { result: r, part, runs: [r] }))
      expect((html.match(/Look at:/g) ?? []).length).toBe(part === 1 ? 4 : 2)
      expect((html.match(/What it means:/g) ?? []).length).toBe(part === 1 ? 4 : 2)
      expect((html.match(/Why it matters:/g) ?? []).length).toBe(part === 1 ? 4 : 2)
    }
  })

  it('the results show the guess as a tag and no "Actual result" line, for every guess', () => {
    const r = runSimultaneityExperiment(0.5)
    const diagram = spacetimeDiagramFor(r)
    for (const guess of ORDERS) {
      const html = renderToStaticMarkup(createElement(Part3Results, { r, diagram, submitted: guess }))
      expect(html).toContain('your guess')
      expect(html).toContain('What this table tells us.')
      expect(html).not.toContain('Actual result')
      expect(html).not.toMatch(/\bright\b|\bwrong\b|matched/)
      expect(html).not.toContain('NaN')
    }
  })

  it('the tutor opens on the observe step and names the white marker only after the learner has looked', () => {
    const r = runSimultaneityExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment8Tutor, { result: r, predictionOrder: 'front' }))
    expect(html).toContain('Which dot is lower on the diagram')
    expect(html).not.toContain('white marker')
  })
})
