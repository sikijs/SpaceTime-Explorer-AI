import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runIntervalExperiment } from '../physics/spacetimeInterval'
import type { IntervalGuess } from '../physics/spacetimeInterval'
import {
  PART1_CLOCK_SPEED,
  PART1_PASSING_SPEED,
  ResultsBars,
  ResultsCaption,
  SetupCaption,
  SetupDiagram,
  SpacetimeIntervalExperiment,
  observersOf,
  referenceEntries,
} from './SpacetimeIntervalExperiment'
import { SpacetimeIntervalExplanation } from './SpacetimeIntervalTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when a guess is
// given. They do not check how the page looks.
const GUESSES: IntervalGuess[] = ['bigger', 'same', 'smaller']
const CLOCK_SPEEDS = [0, 0.3, 0.6, 0.9, 0.99]
const PASSING_SPEEDS = [-0.8, -0.5, 0, 0.5, 0.8]

describe('Spacetime Geometry 1 renders', () => {
  it('the page at rest shows the introduction, links, words box, Part 1 and Start over, and no later Part, no mark, no answer', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeIntervalExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Your guess and the real pictures')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('Interval squared')
    expect(html).not.toContain('Your prediction was')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('farther apart in time and in space')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest, and Run is disabled until a prediction is chosen', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeIntervalExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('every link opens in a new tab', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeIntervalExperiment, {}))
    const links = html.match(/<a [^>]*>/g) ?? []
    expect(links.length).toBe(3)
    links.forEach((l) => expect(l).toContain('target="_blank"'))
  })

  it('the results picture draws the white YOUR GUESS mark only when a guess is given', () => {
    const result = runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED)
    const none = renderToStaticMarkup(createElement(ResultsBars, { rows: observersOf(result), result, guess: null }))
    expect(none).not.toContain('>YOUR GUESS<')
    GUESSES.forEach((guess) => {
      const html = renderToStaticMarkup(createElement(ResultsBars, { rows: observersOf(result), result, guess }))
      expect(html).toContain('>YOUR GUESS<')
      expect(html).toContain('stroke="#ffffff"')
      expect(html).not.toContain('NaN')
    })
  })

  it('the white mark follows the guess: three guesses give three different positions', () => {
    const result = runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED)
    const circle = (guess: IntervalGuess) =>
      renderToStaticMarkup(createElement(ResultsBars, { rows: observersOf(result), result, guess })).match(/<circle cx="([\d.]+)"[^>]*r="9"/)?.[1]
    const xs = GUESSES.map(circle)
    expect(new Set(xs).size).toBe(3)
    expect(Number(circle('bigger'))).toBeGreaterThan(Number(circle('same')))
    expect(Number(circle('same'))).toBeGreaterThan(Number(circle('smaller')))
  })

  it('the real picture does not change with the guess: the bars and blocks are identical whatever the guess', () => {
    const result = runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED)
    const real = (g: IntervalGuess | null) =>
      renderToStaticMarkup(createElement(ResultsBars, { rows: observersOf(result), result, guess: g })).match(/<(?:rect|circle)[^>]*fill="#(?:38bdf8|f472b6|a3e635)"[^>]*>/g)
    expect(real('bigger')).toEqual(real('smaller'))
    expect(real('bigger')).toEqual(real(null))
  })

  it('both pictures render without NaN for every clock and passing speed, and Part 2 pictures are labelled "your speeds"', () => {
    CLOCK_SPEEDS.forEach((v) => {
      PASSING_SPEEDS.forEach((u) => {
        const result = runIntervalExperiment(v, u)
        const setup = renderToStaticMarkup(createElement(SetupDiagram, { clockSpeed: v, passingSpeed: u, progress: 1, yours: true }))
        const bars = renderToStaticMarkup(createElement(ResultsBars, { rows: observersOf(result), result, guess: null, yours: true }))
        expect(setup).not.toContain('NaN')
        expect(bars).not.toContain('NaN')
        expect(setup).toContain('your speeds')
        expect(bars).toContain('your speeds')
        expect(bars).not.toContain('>YOUR GUESS<')
      })
    })
  })

  it("the passing observer's arrow grows with the speed", () => {
    const len = (u: number) => {
      const html = renderToStaticMarkup(createElement(SetupDiagram, { clockSpeed: 0.6, passingSpeed: u, progress: null }))
      const m = html.match(/<line x1="([\d.]+)" y1="44" x2="([\d.]+)"/)
      return Math.abs(Number(m?.[2]) - Number(m?.[1]))
    }
    expect(len(0.8)).toBeGreaterThan(len(0.5))
  })

  it('captions: the guess item appears only with a guess, and every look-for item has its three parts', () => {
    const r = runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED)
    const withGuess = renderToStaticMarkup(createElement(ResultsCaption, { result: r, guess: true, part2: false }))
    const without = renderToStaticMarkup(createElement(ResultsCaption, { result: r, guess: false, part2: false }))
    expect(withGuess).toContain('It is only a marker')
    expect(without).not.toContain('>YOUR GUESS<')
    expect((withGuess.match(/Look at:/g) ?? []).length).toBe(3)
    expect((withGuess.match(/What it means:/g) ?? []).length).toBe(3)
    expect((withGuess.match(/Why it matters:/g) ?? []).length).toBe(3)
    expect((without.match(/Look at:/g) ?? []).length).toBe(2)
    expect(renderToStaticMarkup(createElement(SetupCaption, { part2: false }))).not.toContain('Change the clock')
    expect(renderToStaticMarkup(createElement(SetupCaption, { part2: true }))).toContain('Change the clock')
  })

  it('the words box shows the interval names and formula only after the Part 1 run', () => {
    expect(referenceEntries(false).map((e) => e.term)).not.toContain('Interval squared')
    expect(referenceEntries(false).map((e) => e.term)).not.toContain('Formula')
    const done = referenceEntries(true)
    expect(done.map((e) => e.term)).toEqual(expect.arrayContaining(['Interval squared', 'Interval', 'Formula']))
    expect(done.find((e) => e.term === 'Formula')?.meaning).toContain('1.25 × 1.25 − 0.75 × 0.75')
  })

  it("the tutor's explanation marks the guess, and ends with the Minkowski point", () => {
    GUESSES.forEach((predicted) => {
      const html = renderToStaticMarkup(createElement(SpacetimeIntervalExplanation, { clockSpeed: 0.6, passingSpeed: 0.5, predicted }))
      expect(html).toContain('Your guess, marked')
      expect(html).toContain('6. Space and time as one thing')
      expect(html).not.toContain('NaN')
    })
    expect(renderToStaticMarkup(createElement(SpacetimeIntervalExplanation, { clockSpeed: 0.6, passingSpeed: 0.5, predicted: 'same' }))).toContain('as you guessed')
    expect(renderToStaticMarkup(createElement(SpacetimeIntervalExplanation, { clockSpeed: 0.6, passingSpeed: 0.5, predicted: 'bigger' }))).toContain('which is not what you guessed')
  })
})
