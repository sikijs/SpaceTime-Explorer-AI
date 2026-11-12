import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runGravitationalTimeDilationExperiment } from '../physics/gravitationalTimeDilationExperiment'
import {
  DrawingA,
  DrawingACaption,
  GravitationalTimeDilationExperiment,
  Part1Caption,
  Part1Graph,
  RocketCabinClocks,
  RUN_DURATION_FLOOR_SECONDS,
} from './GravitationalTimeDilationExperiment'
import { GravitationalTimeDilationExplanation, GravitationalTimeDilationTutor } from './GravitationalTimeDilationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marker appears exactly when a guess is given and
// the graph is complete. They do not check how the page looks.
const at = (s: number) => runGravitationalTimeDilationExperiment(s)
const STRENGTHS = [0.05, 0.1, 0.3, 0.6, 0.85, 0.9]
const CHOICES = ['sameRate', 'differentRates'] as const

describe('Gravity 2 renders', () => {
  it('the page renders at rest: Part 1, words box, links note and Start over, but no later Part and no white marker', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Start the clocks')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only)')
    expect(html).not.toContain('NaN')
  })

  it('the introduction explains the Parts before it first mentions one', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    const layout = html.indexOf('How this page is laid out.')
    expect(layout).toBeGreaterThan(-1)
    expect(html.indexOf('Part 1')).toBeGreaterThan(layout)
  })

  it('the introduction defines a tick and says guesses never change the pictures', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    expect(html).toContain('one beat')
    expect(html).toContain('Your guess never changes the real pictures')
    expect(html).toContain('drawn on the graph in white')
    expect(html).not.toContain('height seems')
  })

  it('the introduction explains strength in its own paragraph, with the real 1g, 10 m value, and does not hint at the answer', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    expect(html).toContain('What “strength” means.')
    expect(html).toContain('volume')
    expect(html).toContain('1.09×10⁻¹⁵')
    expect(html).toContain('no unit')
    expect(html).not.toContain('the bigger the difference between the two clocks')
    expect(html).not.toContain('the bigger the strength, the bigger the difference')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('only the two neutral links (JPL and NIST) are shown at rest; the NASA Chandra page is held back until after the tutor', () => {
    const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExperiment, {}))
    expect(html).toContain('jpl.nasa.gov/news/what-is-an-atomic-clock')
    expect(html).toContain('nist.gov/atomic-clocks/how-do-atomic-clocks-work')
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('putting-einstein-test')
    expect(html).not.toContain('einsteins-theory-of-relativity')
    expect(html).toContain('held back')
  })

  it('the shared clock panel is unchanged (Gravity 5 uses it)', () => {
    const html = renderToStaticMarkup(createElement(RocketCabinClocks, { ceilingTicks: 7.14, floorTicks: 5 }))
    expect(html).toContain('Ceiling clock')
    expect(html).toContain('Floor clock')
    expect(html).toContain('7.14')
    expect(RUN_DURATION_FLOOR_SECONDS).toBe(10)
  })

  it('Part 1 graph: legend, axis titles and end labels are drawn', () => {
    const html = renderToStaticMarkup(
      createElement(Part1Graph, { result: at(0.3), revealUpToFloorSeconds: 10, complete: true, guess: null })
    )
    for (const text of ['Floor clock: solid indigo line', 'Ceiling clock: dashed amber line', 'Time on the floor clock (s)', 'Ticks counted', '14.29']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
  })

  it('the white marker is drawn only when the graph is complete and a guess is given, with the module\'s box text', () => {
    const base = { result: at(0.3), revealUpToFloorSeconds: 10 }
    expect(renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, guess: null }))).not.toContain('YOUR GUESS')
    expect(
      renderToStaticMarkup(createElement(Part1Graph, { ...base, revealUpToFloorSeconds: 4, complete: false, guess: 'sameRate' }))
    ).not.toContain('YOUR GUESS')
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, guess: choice }))
      expect(html).toContain('YOUR GUESS (a marker only)')
      expect(html).toContain(choice === 'sameRate' ? 'the clocks tick at the same rate' : 'the clocks tick at different rates')
      expect(html).toContain('#ffffff')
    }
  })

  it('the marker sits in the same place whatever the guess', () => {
    const ring = (guess: 'sameRate' | 'differentRates') =>
      renderToStaticMarkup(createElement(Part1Graph, { result: at(0.3), revealUpToFloorSeconds: 10, complete: true, guess })).match(/<ellipse[^>]*>/)?.[0]
    expect(ring('sameRate')).toBeDefined()
    expect(ring('sameRate')).toBe(ring('differentRates'))
  })

  it('Drawing A is pink, keeps the grey Part 1 line, uses the fixed 0 to 25 axis for presets and carries no white mark', () => {
    for (const s of STRENGTHS) {
      const html = renderToStaticMarkup(createElement(DrawingA, { result: at(s) }))
      expect(html).toContain('#f472b6')
      expect(html).toContain('from Part 1')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
    for (const s of [0.1, 0.3, 0.6]) {
      expect(renderToStaticMarkup(createElement(DrawingA, { result: at(s) }))).toContain('>25<')
    }
    expect(renderToStaticMarkup(createElement(DrawingA, { result: at(0.9) }))).toContain('>100<')
  })

  it('Drawing A looks different for different strengths', () => {
    expect(renderToStaticMarkup(createElement(DrawingA, { result: at(0.1) }))).not.toBe(
      renderToStaticMarkup(createElement(DrawingA, { result: at(0.6) }))
    )
  })

  it('the captions give the worked moment and three-part look-at items, with the module\'s numbers', () => {
    const part1 = renderToStaticMarkup(createElement(Part1Caption))
    expect(part1).toContain('How to read this diagram.')
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('7.14')
    expect(part1).toContain('14.29')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const a = renderToStaticMarkup(createElement(DrawingACaption))
    expect(a).toContain('How to read Drawing A.')
    expect(a).toContain('25.00')
    expect(a).toContain('11.11')
    expect(a.match(/Look at:/g)?.length).toBe(1)
  })

  it('the tutor\'s first prompt points to the white marker by name and gives no verdict', () => {
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(GravitationalTimeDilationTutor, { predictionChoice: choice, result: at(0.3) }))
      expect(html).toContain('white marker')
      expect(html).not.toContain('Your guess, marked.')
    }
  })

  it('the explanation marks the guess, uses the module\'s numbers and the Relativity Experiment 3 reference', () => {
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(GravitationalTimeDilationExplanation, { predictionChoice: choice, result: at(0.3) }))
      expect(html).toContain('Your guess, marked.')
      expect(html).toContain(choice === 'sameRate' ? 'the same rate' : 'different rates')
      expect(html).toContain('14.29')
      expect(html).toContain('1.43')
      expect(html).toContain('1.09×10⁻¹⁵')
      expect(html).toContain('In this simplified model')
      expect(html).toContain('Relativity Experiment 3, the moving clock')
      expect(html).not.toContain('Experiment 4')
      expect(html).not.toContain('NaN')
    }
  })
})
