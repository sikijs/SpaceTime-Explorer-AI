import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EARTH_GRAVITY, runEquivalencePrincipleExperiment } from '../physics/equivalencePrincipleExperiment'
import {
  Cabin,
  DrawingA,
  DrawingACaption,
  EquivalencePrincipleExperiment,
  Part1Caption,
  Part1Graph,
} from './EquivalencePrincipleExperiment'
import { EquivalencePrincipleExplanation, EquivalencePrincipleTutor } from './EquivalencePrincipleTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marker appears exactly when a guess is given and
// the graph is complete. They do not check how the page looks.
const at = (g: number) => runEquivalencePrincipleExperiment(g * EARTH_GRAVITY, 2)
const ACCELERATIONS = [0.1, 0.5, 1, 2, 5]
const CHOICES = ['differently', 'sameWay'] as const

describe('Gravity 1 renders', () => {
  it('the page renders at rest: Part 1, links, words box and Start over, but no later Part and no white marker', () => {
    const html = renderToStaticMarkup(createElement(EquivalencePrincipleExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Drop the ball')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only)')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(EquivalencePrincipleExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('only the first link is shown at rest; the four held back are not', () => {
    const html = renderToStaticMarkup(createElement(EquivalencePrincipleExperiment, {}))
    expect(html).toContain('free-fall-without-air-resistance')
    for (const held of ['einstein-online.info', 'arxiv.org/abs/2209.15487', 'imperial.ac.uk', 'apollo_15_feather_drop']) {
      expect(html).not.toContain(held)
    }
  })

  it('the introduction does not give the answer, and the words box does not either', () => {
    const html = renderToStaticMarkup(createElement(EquivalencePrincipleExperiment, {}))
    expect(html).not.toContain('weak sideways gravity')
    expect(html).not.toContain('there is no experiment here')
  })

  it('the cabins are labelled with the ball and the floor', () => {
    const html = renderToStaticMarkup(createElement(Cabin, { label: 'Cabin A', height: 1.5 }))
    expect(html).toContain('ball')
    expect(html).toContain('floor')
    expect(html).toContain('1.50 m')
  })

  it('Part 1 graph: legend, axis titles and the end time are drawn for every acceleration', () => {
    for (const g of ACCELERATIONS) {
      const r = at(g)
      const html = renderToStaticMarkup(
        createElement(Part1Graph, { result: r, revealUpToSeconds: r.timeToFloorSeconds, complete: true, guess: null })
      )
      for (const text of ['Cabin A: solid indigo line', 'Cabin B: dashed amber line', 'Time since release (s)', 'Height above the floor (m)']) {
        expect(html).toContain(text)
      }
      expect(html).toContain(`${r.timeToFloorSeconds.toFixed(2)} s`)
      expect(html).not.toContain('NaN')
    }
  })

  it('the white marker is drawn only when the graph is complete and a guess is given, with the module\'s box text', () => {
    const r = at(1)
    const base = { result: r, revealUpToSeconds: r.timeToFloorSeconds }
    expect(renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, guess: null }))).not.toContain('YOUR GUESS')
    expect(renderToStaticMarkup(createElement(Part1Graph, { ...base, revealUpToSeconds: 0.2, complete: false, guess: 'sameWay' }))).not.toContain('YOUR GUESS')
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(Part1Graph, { ...base, complete: true, guess: choice }))
      expect(html).toContain('YOUR GUESS (a marker only)')
      expect(html).toContain(choice === 'sameWay' ? 'the ball moves the same way in the two cabins' : 'the ball moves differently in the two cabins')
      expect(html).toContain('#ffffff')
    }
  })

  it('the marker sits in the same place whatever the guess', () => {
    const r = at(1)
    const ring = (guess: 'differently' | 'sameWay') =>
      renderToStaticMarkup(createElement(Part1Graph, { result: r, revealUpToSeconds: r.timeToFloorSeconds, complete: true, guess })).match(/<circle[^>]*r="10"[^>]*>/)?.[0]
    expect(ring('differently')).toBeDefined()
    expect(ring('differently')).toBe(ring('sameWay'))
  })

  it('Drawing A is pink, keeps the grey 1g line, uses the fixed scale and carries no white mark', () => {
    for (const g of ACCELERATIONS) {
      const html = renderToStaticMarkup(createElement(DrawingA, { result: at(g), accelerationLabel: `${g}g` }))
      expect(html).toContain('#f472b6')
      expect(html).toContain('#9ca3af')
      expect(html).toContain('1g, from Part 1')
      expect(html).toContain('2 s')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('Drawing A looks different for different accelerations', () => {
    const a = renderToStaticMarkup(createElement(DrawingA, { result: at(0.5), accelerationLabel: '0.5g' }))
    const b = renderToStaticMarkup(createElement(DrawingA, { result: at(2), accelerationLabel: '2g' }))
    expect(a).not.toBe(b)
  })

  it('the captions give the worked moment and three-part look-at items, with the module\'s numbers', () => {
    const part1 = renderToStaticMarkup(createElement(Part1Caption))
    expect(part1).toContain('How to read this diagram.')
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('0.64 seconds')
    expect(part1).toContain('1.50 metres')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const a = renderToStaticMarkup(createElement(DrawingACaption))
    expect(a).toContain('How to read Drawing A.')
    expect(a).toContain('0.45 seconds')
    expect(a).toContain('0.90 s')
    expect(a.match(/Look at:/g)?.length).toBe(1)
  })

  it('the tutor\'s first prompts point to the white marker by name and give no verdict', () => {
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(EquivalencePrincipleTutor, { predictionChoice: choice, result: at(1) }))
      expect(html).toContain('white marker')
      expect(html).not.toContain('two graphs')
      expect(html).not.toContain('Your guess, marked.')
    }
  })

  it('the explanation marks the guess, uses the module\'s numbers, and names the real test', () => {
    for (const choice of CHOICES) {
      const html = renderToStaticMarkup(createElement(EquivalencePrincipleExplanation, { predictionChoice: choice, result: at(1) }))
      expect(html).toContain('Your guess, marked.')
      expect(html).toContain(choice === 'sameWay' ? 'the same way in the two cabins' : 'differently in the two cabins')
      expect(html).toContain('0.64 seconds')
      expect(html).toContain('A word of care.')
      expect(html).toContain('MICROSCOPE')
      expect(html).not.toContain('NaN')
    }
  })
})
