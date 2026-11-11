import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { ShapeChoice } from '../physics/spacetimeDiagramView'
import { Experiment9, PART_LEADS, Part3Results9 } from './Experiment9'
import { DiagramCaption9, LookFor9, WorkedMoment9 } from './Experiment9Pictures'
import { LevelLineSketch } from './Experiment9Sketch'
import { Experiment9Tutor } from './Experiment9Tutor'
import { SpacetimeDiagram } from './Experiment8Pictures'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marker and the two new lines appear exactly when
// they should. They do not check how the page looks.
const SHAPES: ShapeChoice[] = ['flat', 'tilted']
const SPEEDS = [0, 0.01, 0.1, 0.3, 0.5, 0.8, 0.9]
const END = 10

describe('Relativity 9 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part and no marker', () => {
    const html = renderToStaticMarkup(createElement(Experiment9, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only)')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest, and the speed buttons are not on the first screen', () => {
    const html = renderToStaticMarkup(createElement(Experiment9, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).not.toContain('Block speed')
    expect(html).not.toContain('0c (at rest)')
    expect(html).toContain('<strong>0.5c</strong>')
  })

  it('the introduction uses the chapters\' titles, defines frame, light-second, event and worldline, and has the new sketch', () => {
    const html = renderToStaticMarkup(createElement(Experiment9, {}))
    for (const text of [
      'At the same time... for whom?',
      'Drawing Spacetime',
      'Why can’t light go faster?',
      '<strong>frame</strong>',
      '<strong>light-seconds</strong>',
      '<strong>event</strong>',
      '<strong>worldline</strong>',
      'What a level line means',
      'Your guess and the real picture.',
    ]) {
      expect(html).toContain(text)
    }
    expect(html.replace('Experiment 9 — Same Time, Different Line', '')).not.toMatch(/Experiment [1-9]\b/)
    expect(html).not.toMatch(/\b[Rr]ods?\b/)
    expect(html).not.toMatch(/magenta/i)
  })

  it('the three links from the start are listed and the held-back page is not', () => {
    const html = renderToStaticMarkup(createElement(Experiment9, {}))
    expect(html).toContain('einstein-online.info/en/spotlight/now/')
    expect(html).toContain('einstein-online.info/en/relativity_space_time/')
    expect(html).toContain('einstein-online.info/en/speed_of_light/')
    expect(html).not.toContain('einstein-online.info/en/spacetime/')
  })

  it('the Part 1 lead gives no answer, and each Part lead is written', () => {
    expect(PART_LEADS.part1).not.toMatch(/\blean/i)
    expect(PART_LEADS.part1).toContain('0.5c')
    expect(PART_LEADS.part2).toContain('0.9c')
    expect(PART_LEADS.part3).toContain('Nothing in this Part changes')
    expect(PART_LEADS.part4).toContain('green line')
  })
})

describe('Relativity 9 sketch', () => {
  it('draws both pictures with their times, and gives no block or flash', () => {
    const html = renderToStaticMarkup(createElement(LevelLineSketch))
    for (const text of ['A LEVEL LINE', 'A LEANING LINE', 'same height: the same moment', 'different heights: different moments', '0.3 s', '0.2 s', '0.25 s for every light-second']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
    expect(html).not.toMatch(/\bblock\b.*\bflash\b.*reached/)
  })
})

describe('Relativity 9 diagram', () => {
  const draw = (v: number, animTime: number, extra: Record<string, unknown> = {}) => {
    const diagram = spacetimeDiagramFor(runSimultaneityExperiment(v))
    return renderToStaticMarkup(createElement(SpacetimeDiagram, { diagram, animTime, title: 'T', label: 'L', ...extra }))
  }
  const without0 = (v: number) => draw(v, END, { showSameMomentLines: false })

  it('draws the green and grey lines, named on the canvas, only when asked, at every speed and with no NaN', () => {
    for (const v of SPEEDS) {
      const withLines = draw(v, END, { showSameMomentLines: true })
      expect(withLines).toContain('The block’s own “same moment” line')
      expect(withLines).toContain('A level line: the lab’s “same moment”')
      expect(withLines).toContain('stroke="#34d399" stroke-width="4"')
      expect(without0(v)).not.toContain('stroke="#34d399" stroke-width="4"')
      expect(withLines).not.toContain('NaN')
      const without = draw(v, END, { showSameMomentLines: false })
      expect(without).not.toContain('The block’s own “same moment” line')
      // the key names the two new lines whenever the picture is an Experiment 9 picture
      expect(without).toContain('Lab’s level “same moment”')
    }
    expect(draw(0.5, END)).not.toContain('Lab’s level “same moment”')
  })

  it('the white example bar appears only with the green line, and differs between "flat" and "tilted"', () => {
    const flat = draw(0.5, END, { showSameMomentLines: true, shapeGuess: 'flat' })
    const tilted = draw(0.5, END, { showSameMomentLines: true, shapeGuess: 'tilted' })
    expect(flat).toContain('YOUR GUESS (a marker only): the line will be flat')
    expect(tilted).toContain('YOUR GUESS (a marker only): the line will be tilted')
    expect(flat).not.toBe(tilted)
    expect(draw(0.5, END, { showSameMomentLines: false, shapeGuess: 'flat' })).not.toContain('YOUR GUESS')
    expect(draw(0.5, END, { showSameMomentLines: true, shapeGuess: null })).not.toContain('YOUR GUESS')
  })

  it('the guess never changes the real lines or dots', () => {
    const strip = (html: string) => html.replace(/<g><line[^>]*stroke-dasharray="6 4"[\s\S]*?<\/g>$/, '')
    const a = draw(0.5, END, { showSameMomentLines: true, shapeGuess: 'flat' })
    const b = draw(0.5, END, { showSameMomentLines: true, shapeGuess: 'tilted' })
    for (const html of [a, b]) {
      expect(html).toContain('0.144 s')
      expect(html).toContain('0.433 s')
    }
    expect(strip(a).length).toBeGreaterThan(0)
  })

  it('Part 2 writes the speed in pink, uses one scale and shows no marker', () => {
    const scaleDiagrams = [0, 0.9].map((v) => spacetimeDiagramFor(runSimultaneityExperiment(v)))
    for (const v of SPEEDS) {
      const html = draw(v, END, { scaleDiagrams, pinkSpeed: v, showSameMomentLines: true })
      expect(html).toContain(`your speed: ${v}c`)
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })
})

describe('Relativity 9 captions, results and tutor', () => {
  it('the caption names every drawn thing, defines the light-second and gives no times or leans', () => {
    const html = renderToStaticMarkup(createElement(DiagramCaption9, { speedLabel: '0.5c', part: 1 }))
    for (const text of ['How to read this diagram.', 'The amber dot', 'The two solid lines', 'The green line', 'The pale grey dashed line', 'The white marker', 'a light-second is the distance light travels in one second']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('0.144')
    expect(html).not.toContain('0.433')
    expect(html).not.toContain('0.500')
  })

  it('the worked moment at 0.5c has the module\'s numbers, and at rest the line leans 0 and lies on the level line', () => {
    const at = (v: number) => {
      const result = runSimultaneityExperiment(v)
      return renderToStaticMarkup(createElement(WorkedMoment9, { result, diagram: spacetimeDiagramFor(result), part: v === 0.5 ? 1 : 2 }))
    }
    const half = at(0.5)
    expect(half).toContain('0.289 s')
    expect(half).toContain('0.577 light-second')
    expect(half).toContain('0.500 s for every light-second')
    const rest = at(0)
    expect(rest).toContain('0.000 s for every light-second')
    expect(rest).toContain('lies on the lab’s')
    expect(at(0.8)).toContain('0.800 s for every light-second')
  })

  it('what to look for has all three parts for every item, in Part 1 and Part 2', () => {
    const r = runSimultaneityExperiment(0.5)
    const diagram = spacetimeDiagramFor(r)
    for (const part of [1, 2] as const) {
      const html = renderToStaticMarkup(createElement(LookFor9, { result: r, diagram, part, runs: [r] }))
      const n = part === 1 ? 3 : 2
      expect((html.match(/Look at:/g) ?? []).length).toBe(n)
      expect((html.match(/What it means:/g) ?? []).length).toBe(n)
      expect((html.match(/Why it matters:/g) ?? []).length).toBe(n)
    }
  })

  it('the results show the lean and the guess as a tag, and no "It is actually" line, for every guess', () => {
    const r = runSimultaneityExperiment(0.5)
    const diagram = spacetimeDiagramFor(r)
    for (const guess of SHAPES) {
      const html = renderToStaticMarkup(createElement(Part3Results9, { r, diagram, submitted: guess }))
      expect(html).toContain('0.500 s for every light-second')
      expect(html).toContain('your guess')
      expect(html).toContain('What this table tells us.')
      expect(html).not.toContain('It is actually')
      expect(html).not.toMatch(/\bright\b|\bwrong\b|matched/)
      expect(html).not.toContain('NaN')
    }
  })

  it('the tutor opens on the observe step and names the white marker only after the learner has looked', () => {
    const r = runSimultaneityExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment9Tutor, { result: r, predictionShape: 'tilted' }))
    expect(html).toContain('Look at the green line')
    expect(html).not.toContain('white marker')
  })
})
