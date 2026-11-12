import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EARTH_GRAVITY, runTidalEffectExperiment } from '../physics/tidalEffectExperiment'
import type { PredictionChoice } from '../physics/tidalEffectExperiment'
import {
  Cabin,
  DrawingA,
  DrawingACaption,
  LabelledCabin,
  Part1Caption,
  Part1Graph,
  TidalEffectExperiment,
  INITIAL_HEIGHT_METERS,
  INITIAL_SEPARATION_METERS,
} from './TidalEffectExperiment'
import { TidalEffectExplanation, TidalEffectTutor } from './TidalEffectTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// graph is complete. They do not check how the page looks.
const at = (g: number, s: number) => runTidalEffectExperiment(g * EARTH_GRAVITY, 2, 1, s)
const SETTINGS: Array<[number, number]> = [
  [0.1, 0.02],
  [0.5, 0.1],
  [1, 0.3],
  [2, 0.6],
  [5, 0.9],
]
const CHOICES: PredictionChoice[] = ['converge', 'same', 'apart']

describe('Gravity 3 renders', () => {
  it('the page renders at rest: Part 1, links, words box and Start over, but no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Drop the balls')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('a marker only')
    expect(html).not.toContain('NaN')
  })

  it('the introduction explains the Parts first, and neither the intro nor the controls use the word "convergence" or hint at the answer', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectExperiment, {}))
    const layout = html.indexOf('How this page is laid out.')
    expect(layout).toBeGreaterThan(-1)
    expect(html.indexOf('Part 1')).toBeGreaterThan(layout)
    expect(html).not.toContain('onvergence')
    expect(html).not.toContain('quietly doing a lot of work')
    expect(html).not.toContain('no matter how big the cabin is')
    expect(html).toContain('Your guesses never change the real pictures')
    expect(html).toContain('What “strength” means.')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('only the neutral NASA Glenn link is shown at rest; the NOAA tides page is held back until after the tutor', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectExperiment, {}))
    expect(html).toContain('free-fall-without-air-resistance')
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('what-causes-tides')
    expect(html).toContain('held back')
  })

  it('the words box does not show the separation formula before the run', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectExperiment, {}))
    expect(html).not.toContain('(time ÷ fall time)')
    expect(html).not.toContain('1 − strength')
    expect(html).toContain('time to reach the floor')
  })

  it('the original Cabin and the starting constants are unchanged for Experiment 5', () => {
    const r = at(1, 0.3)
    const html = renderToStaticMarkup(createElement(Cabin, { label: 'Planet', result: r, scene: 'planet', elapsedSeconds: 0 }))
    expect(html).toContain('Planet')
    expect(html).toContain('Separation:')
    expect(INITIAL_HEIGHT_METERS).toBe(2)
    expect(INITIAL_SEPARATION_METERS).toBe(1)
  })

  it('the labelled cabins show the floor, a left/right ball key and the arrows, with nothing slanted or white', () => {
    const r = at(1, 0.3)
    const planet = renderToStaticMarkup(createElement(LabelledCabin, { label: 'Planet cabin', result: r, scene: 'planet', elapsedSeconds: 0, strengthG: 1 }))
    expect(planet).toContain('floor')
    expect(planet).toContain('left ball')
    expect(planet).toContain('right ball')
    expect(planet).toContain('Gravity pulls the balls down')
    expect(planet).toContain('#16a34a')
    expect(planet).toContain('1.000 m')
    const rocket = renderToStaticMarkup(createElement(LabelledCabin, { label: 'Rocket cabin', result: r, scene: 'rocket', elapsedSeconds: 0, strengthG: 1 }))
    expect(rocket).toContain('A rocket pushes the cabin up')
    expect(rocket).toContain('rocket push')
    expect(rocket).toContain('#dc2626')
    for (const html of [planet, rocket]) {
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('rotate')
      expect(html).not.toContain('NaN')
    }
    const weak = renderToStaticMarkup(createElement(LabelledCabin, { label: 'Rocket cabin', result: r, scene: 'rocket', elapsedSeconds: 0, strengthG: 0.5 }))
    const strong = renderToStaticMarkup(createElement(LabelledCabin, { label: 'Rocket cabin', result: r, scene: 'rocket', elapsedSeconds: 0, strengthG: 2 }))
    expect(weak).not.toBe(strong)
  })

  it('Part 1 graph: legend, axis titles and the 1.2 m axis are drawn for every setting', () => {
    for (const [g, s] of SETTINGS) {
      const r = at(g, s)
      const html = renderToStaticMarkup(
        createElement(Part1Graph, { result: r, revealUpToSeconds: r.timeToFloorSeconds, complete: true, planetGuess: null, rocketGuess: null })
      )
      for (const text of ['Planet cabin: solid indigo line', 'Rocket cabin: dashed amber line', 'Time since release (s)', 'Separation between the balls (m)', '1.2 m', 'start: 1 m']) {
        expect(html).toContain(text)
      }
      expect(html).not.toContain('NaN')
    }
  })

  it('the white marks are drawn only when the graph is complete and a guess is given, one per guess, with the module\'s box text', () => {
    const r = at(1, 0.3)
    const base = { result: r, revealUpToSeconds: r.timeToFloorSeconds }
    expect(renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, planetGuess: null, rocketGuess: null }))).not.toContain('YOUR GUESS')
    expect(
      renderToStaticMarkup(createElement(Part1Graph, { ...base, revealUpToSeconds: 0.2, complete: false, planetGuess: 'converge', rocketGuess: 'same' }))
    ).not.toContain('YOUR GUESS')
    const one = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, planetGuess: 'apart', rocketGuess: null }))
    expect(one.match(/YOUR GUESS/g)?.length).toBe(1)
    expect(one).toContain('planet cabin')
    for (const planet of CHOICES) {
      for (const rocket of CHOICES) {
        const html = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, planetGuess: planet, rocketGuess: rocket }))
        expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
        expect(html.match(/a marker only/g)?.length).toBe(2)
        expect(html).toContain('#ffffff')
        expect(html).toContain(`the balls ${planet === 'converge' ? 'drift together' : planet === 'same' ? 'stay the same distance apart' : 'drift apart'}`)
      }
    }
  })

  it('each ring sits in the same place whatever the guess', () => {
    const r = at(1, 0.3)
    const rings = (planetGuess: PredictionChoice) =>
      renderToStaticMarkup(createElement(Part1Graph, { result: r, revealUpToSeconds: r.timeToFloorSeconds, complete: true, planetGuess, rocketGuess: 'same' })).match(/<circle[^>]*r="11"[^>]*>/g)
    expect(rings('converge')).toBeTruthy()
    expect(rings('converge')).toEqual(rings('same'))
    expect(rings('converge')).toEqual(rings('apart'))
  })

  it('Drawing A is pink, keeps the grey Part 1 line, uses the fixed scale and carries no white mark', () => {
    for (const [g, s] of SETTINGS) {
      const html = renderToStaticMarkup(createElement(DrawingA, { result: at(g, s), settingsLabel: `${g}g, strength ${s}` }))
      expect(html).toContain('#f472b6')
      expect(html).toContain('#f9a8d4')
      expect(html).toContain('from Part 1')
      expect(html).toContain('2 s')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
  })

  it('Drawing A looks different for different settings', () => {
    const a = renderToStaticMarkup(createElement(DrawingA, { result: at(0.5, 0.1), settingsLabel: 'a' }))
    const b = renderToStaticMarkup(createElement(DrawingA, { result: at(2, 0.6), settingsLabel: 'a' }))
    expect(a).not.toBe(b)
  })

  it('the captions give the worked moment and three-part look-at items, with the module\'s numbers', () => {
    const part1 = renderToStaticMarkup(createElement(Part1Caption))
    expect(part1).toContain('How to read this diagram.')
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('0.925')
    expect(part1).toContain('0.700')
    expect(part1).toContain('(time ÷ fall time)')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const a = renderToStaticMarkup(createElement(DrawingACaption))
    expect(a).toContain('How to read Drawing A.')
    expect(a).toContain('0.400')
    expect(a).toContain('0.45 seconds')
    expect(a.match(/Look at:/g)?.length).toBe(1)
  })

  it('the tutor\'s first prompt points to the white marks by name and gives no verdict', () => {
    const html = renderToStaticMarkup(createElement(TidalEffectTutor, { planetPrediction: 'converge', rocketPrediction: 'same', result: at(1, 0.3) }))
    expect(html).toContain('white marks')
    expect(html).not.toContain('two separation graphs')
    expect(html).not.toContain('Your guesses, marked.')
    expect(html).not.toContain('tidal effect')
  })

  it('the explanation marks both guesses, uses the module\'s numbers and is the first place "tidal effect" is named', () => {
    for (const planet of CHOICES) {
      for (const rocket of CHOICES) {
        const html = renderToStaticMarkup(createElement(TidalEffectExplanation, { planetPrediction: planet, rocketPrediction: rocket, result: at(1, 0.3) }))
        expect(html).toContain('Your guesses, marked.')
        expect(html).toContain('0.700 m')
        expect(html).toContain('1.000 m')
        expect(html).toContain('lamp post')
        expect(html).toContain('tidal effect')
        expect(html).toContain('equivalence principle (Experiment 1)')
        expect(html).not.toContain('NaN')
      }
    }
    const html = renderToStaticMarkup(createElement(TidalEffectExplanation, { planetPrediction: 'converge', rocketPrediction: 'same', result: at(1, 0.3) }))
    expect(html).toContain('matched')
  })
})
