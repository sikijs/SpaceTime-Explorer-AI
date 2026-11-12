import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runCurvedSpacetimeExperiment } from '../physics/curvedSpacetimeExperiment'
import type { PredictionChoice } from '../physics/curvedSpacetimeExperiment'
import { CurvedSpacetimeExperiment, DrawingA, DrawingACaption, Part1Caption, Part1Graph, Scene } from './CurvedSpacetimeExperiment'
import { CurvedSpacetimeExplanation, CurvedSpacetimeTutor } from './CurvedSpacetimeTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// graph is complete. They do not check how the page looks.
const at = (s: number) => runCurvedSpacetimeExperiment(1, s)
const STRENGTHS = [0.01, 0.1, 0.2, 0.5, 0.8, 0.99]
const CHOICES: PredictionChoice[] = ['converge', 'same', 'apart']
const PHRASE: Record<PredictionChoice, string> = {
  converge: 'the travelers drift closer together',
  same: 'the travelers stay the same distance apart',
  apart: 'the travelers drift farther apart',
}

describe('Gravity 4 renders', () => {
  it('the page renders at rest: Part 1, links note, words box and Start over, but no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Send them walking')
    expect(html).not.toContain('Walk Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('a marker only')
    expect(html).not.toContain('NaN')
  })

  it('the introduction explains the Parts first and does not hint at the answer', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExperiment, {}))
    const layout = html.indexOf('How this page is laid out.')
    expect(layout).toBeGreaterThan(-1)
    expect(html.indexOf('Part 1')).toBeGreaterThan(layout)
    expect(html).not.toContain('What does that convergence')
    expect(html).not.toContain('as straight as you possibly can” even mean')
    expect(html).toContain('Your guesses never change the real pictures')
    expect(html).toContain('What “curvature strength” means.')
    expect(html).toContain('a bigger strength number')
    expect(html).toContain('basketball')
    expect(html).not.toContain('divide 10 metres by the strength')
    expect(html).toContain('only a size picked')
    expect(html).toContain('6,371,000')
    expect(html).toContain('about 0.0000016, far below the smallest value you can choose (0.01)')
    expect(html).toContain('more than 300,000 times bigger than the 20 metres')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the two neutral links are listed from the start, open in a new tab, and the ESA page is held back until after the tutor', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExperiment, {}))
    expect(html).toContain('science.nasa.gov/earth/facts')
    expect(html).toContain('usgs.gov/media/images/great-circlegif')
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('esa.int')
    expect(html).toContain('held back')
  })

  it('the words box does not show the separation formula before the run', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExperiment, {}))
    expect(html).not.toContain('cos(')
    expect(html).toContain('distance to the pole')
  })

  it('the surfaces are labelled: travelers, start, the pole, the sphere outline', () => {
    const flat = renderToStaticMarkup(createElement(Scene, { label: 'Flat surface', result: at(0.5), scene: 'flat', distanceMeters: 0 }))
    const sphere = renderToStaticMarkup(createElement(Scene, { label: 'Curved surface', result: at(0.5), scene: 'sphere', distanceMeters: 0 }))
    for (const html of [flat, sphere]) {
      expect(html).toContain('left traveler')
      expect(html).toContain('right traveler')
      expect(html).toContain('start')
      expect(html).toContain('1.000 m')
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
    expect(sphere).toContain('the pole')
    expect(sphere).toContain('sphere (outline)')
    expect(sphere).toContain('The pole is 31.4 m from the start')
    expect(flat).not.toContain('the pole')
  })

  it('Part 1 graph: legend, axis titles and the 1.2 m axis are drawn for every strength', () => {
    for (const s of STRENGTHS) {
      const r = at(s)
      const html = renderToStaticMarkup(
        createElement(Part1Graph, { result: r, revealUpToMeters: r.maxDistanceMeters, complete: true, flatGuess: null, sphereGuess: null })
      )
      for (const text of [
        'Curved surface: solid indigo line',
        'Flat surface: dashed amber line',
        'Distance each traveler has walked (m)',
        'Separation between the travelers (m)',
        '1.2 m',
        'start: 1 m',
      ]) {
        expect(html).toContain(text)
      }
      expect(html).not.toContain('NaN')
    }
  })

  it('the white marks are drawn only when the graph is complete and a guess is given, one per guess, with the module\'s box text', () => {
    const r = at(0.5)
    const base = { result: r, revealUpToMeters: r.maxDistanceMeters }
    expect(renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, flatGuess: null, sphereGuess: null }))).not.toContain('YOUR GUESS')
    expect(
      renderToStaticMarkup(createElement(Part1Graph, { ...base, revealUpToMeters: 5, complete: false, flatGuess: 'same', sphereGuess: 'converge' }))
    ).not.toContain('YOUR GUESS')
    const one = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, flatGuess: null, sphereGuess: 'apart' }))
    expect(one.match(/YOUR GUESS/g)?.length).toBe(1)
    expect(one).toContain('curved surface')
    for (const flat of CHOICES) {
      for (const sphere of CHOICES) {
        const html = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, flatGuess: flat, sphereGuess: sphere }))
        expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
        expect(html.match(/a marker only/g)?.length).toBe(2)
        expect(html).toContain('#ffffff')
        expect(html).toContain(PHRASE[flat])
        expect(html).toContain(PHRASE[sphere])
      }
    }
  })

  it('each ring sits in the same place whatever the guess', () => {
    const r = at(0.5)
    const rings = (sphereGuess: PredictionChoice) =>
      renderToStaticMarkup(
        createElement(Part1Graph, { result: r, revealUpToMeters: r.maxDistanceMeters, complete: true, flatGuess: 'same', sphereGuess })
      ).match(/<circle[^>]*r="11"[^>]*>/g)
    expect(rings('converge')).toBeTruthy()
    expect(rings('converge')).toEqual(rings('same'))
    expect(rings('converge')).toEqual(rings('apart'))
  })

  it('Drawing A is pink, keeps the grey Part 1 line, uses the fixed 80 m scale and carries no white mark', () => {
    for (const s of STRENGTHS) {
      const html = renderToStaticMarkup(createElement(DrawingA, { result: at(s), settingsLabel: `${s}` }))
      expect(html).toContain('#f472b6')
      expect(html).toContain('#f9a8d4')
      expect(html).toContain('from Part 1')
      expect(html).toContain('80 m')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
  })

  it('Drawing A looks different for different strengths, and its axis grows for a very small strength', () => {
    const a = renderToStaticMarkup(createElement(DrawingA, { result: at(0.2), settingsLabel: 'a' }))
    const b = renderToStaticMarkup(createElement(DrawingA, { result: at(0.8), settingsLabel: 'a' }))
    expect(a).not.toBe(b)
    const small = renderToStaticMarkup(createElement(DrawingA, { result: at(0.1), settingsLabel: 'a' }))
    expect(small).toContain('160 m')
  })

  it('the captions give the worked moment and three-part look-at items, with the module\'s numbers', () => {
    const part1 = renderToStaticMarkup(createElement(Part1Caption))
    expect(part1).toContain('How to read this diagram.')
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('0.878')
    expect(part1).toContain('0.707')
    expect(part1).toContain('31.4')
    expect(part1).toContain('lines of longitude')
    expect(part1).toContain('cos(distance')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const a = renderToStaticMarkup(createElement(DrawingACaption))
    expect(a).toContain('How to read Drawing A.')
    expect(a).toContain('0.980')
    expect(a).toContain('0.697')
    expect(a).toContain('19.6')
    expect(a.match(/Look at:/g)?.length).toBe(1)
  })

  it('the tutor\'s first prompt points to the white marks by name and gives no verdict', () => {
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeTutor, { flatPrediction: 'same', spherePrediction: 'converge', result: at(0.5) }))
    expect(html).toContain('white marks')
    expect(html).not.toContain('both graphs')
    expect(html).not.toContain('Your guesses, marked.')
    expect(html).not.toContain('curved spacetime')
  })

  it('the explanation marks both guesses and uses the module\'s numbers', () => {
    for (const flat of CHOICES) {
      for (const sphere of CHOICES) {
        const html = renderToStaticMarkup(createElement(CurvedSpacetimeExplanation, { flatPrediction: flat, spherePrediction: sphere, result: at(0.5) }))
        expect(html).toContain('Your guesses, marked.')
        expect(html).toContain('0.000 m')
        expect(html).toContain('1.000 m')
        expect(html).toContain('0.878')
        expect(html).toContain('lines of longitude')
        expect(html).toContain('Experiment 3 (tidal effects)')
        expect(html).not.toContain('NaN')
      }
    }
    const html = renderToStaticMarkup(createElement(CurvedSpacetimeExplanation, { flatPrediction: 'same', spherePrediction: 'converge', result: at(0.5) }))
    expect(html).toContain('matched')
  })
})
