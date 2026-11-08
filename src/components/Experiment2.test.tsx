import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { guessPositionsOnStrip } from '../physics/twoClockExperiment'
import { ClockReadouts, Experiment2, StripCaption, TwoClockStrip } from './Experiment2'
import { Experiment2Explanation, Experiment2Tutor } from './Experiment2Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess marks appear exactly when guesses are
// given. They do not check how the page looks.
const DURATIONS = [5, 10, 20, 30, 60]
const GUESSES: Array<[number, number]> = [[0, 0], [7, 12], [10, 10], [20, 20], [500, -4], [-4, 500]]

describe('Relativity 2 renders', () => {
  it('the whole page renders at rest: Part 1, link, words box and Start over, but no later Part, no marks and no formulas', () => {
    const html = renderToStaticMarkup(createElement(Experiment2, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS for')
    expect(html).not.toContain('Formulas:')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment2, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the strip draws a white mark for each clock only when guesses are given, for every duration and pair of guesses', () => {
    for (const duration of DURATIONS) {
      const none = renderToStaticMarkup(createElement(TwoClockStrip, { duration, pink: false, guesses: null, label: 'x' }))
      expect(none).not.toContain('YOUR GUESS for')
      for (const [a, b] of GUESSES) {
        const html = renderToStaticMarkup(createElement(TwoClockStrip, { duration, pink: false, guesses: { a, b }, label: 'x' }))
        expect(html).toContain(`YOUR GUESS for Clock A: ${a} seconds`)
        expect(html).toContain(`YOUR GUESS for Clock B: ${b} seconds`)
        expect(html).not.toContain('NaN')
        const marks = guessPositionsOnStrip(duration, a, b)
        const off = [marks.clockA.offEdge, marks.clockB.offEdge].filter((e) => e !== null).length
        expect(html.split('(off the scale)').length - 1).toBe(off)
      }
    }
  })

  it('the strip is labelled and its numbers come from the duration', () => {
    const html = renderToStaticMarkup(createElement(TwoClockStrip, { duration: 10, pink: false, guesses: { a: 7, b: 12 }, label: 'x' }))
    for (const text of ['Clock A', 'Clock B', 'Event A, START', 'Event B, END', 'elapsed: 10 seconds', '00:00:00', '00:00:10', '0 s', '10 s', '20 s']) {
      expect(html).toContain(text)
    }
  })

  it('Drawing A is pink and says "your length", and carries no white mark', () => {
    const html = renderToStaticMarkup(createElement(TwoClockStrip, { duration: 20, pink: true, guesses: null, label: 'x' }))
    expect(html).toContain('#f472b6')
    expect(html).toContain('Event B, END (your length)')
    expect(html).toContain('40 s')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('the captions give the worked moment and three-part look-at items, and the guess item only for Part 1', () => {
    const part1 = renderToStaticMarkup(createElement(StripCaption, { name: 'the Event Interval strip', duration: 10, guesses: true, pink: false }))
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('00:00:10 − 00:00:00 = 10 seconds')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const drawing = renderToStaticMarkup(createElement(StripCaption, { name: 'Drawing A', duration: 20, guesses: false, pink: true }))
    expect(drawing.match(/Look at:/g)?.length).toBe(2)
    expect(drawing).not.toContain('YOUR GUESS')
    expect(drawing).toContain('00:00:20 − 00:00:00 = 20 seconds')
  })

  it('each clock is read separately and both show the same time', () => {
    const html = renderToStaticMarkup(createElement(ClockReadouts, { duration: 10, time: 10, running: false, label: 'Clocks' }))
    expect(html.match(/00:00:10/g)?.length).toBe(2)
    const mid = renderToStaticMarkup(createElement(ClockReadouts, { duration: 10, time: 5, running: true, label: 'Clocks' }))
    expect(mid.match(/00:00:05/g)?.length).toBe(2)
    expect(mid).toContain('running...')
  })

  it('the tutor asks first, and shows no explanation or verdict before its last step', () => {
    const html = renderToStaticMarkup(createElement(Experiment2Tutor, { predictionA: 7, predictionB: 12, durationSeconds: 10 }))
    expect(html).toContain('Look at the two clocks and at both rows of the strip')
    expect(html).not.toContain('Your guesses, marked')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks each guess, then gives points 1 to 4 once and in order, with the module\'s numbers', () => {
    for (const [a, b] of [[7, 12], [10, 10]] as const) {
      const html = renderToStaticMarkup(createElement(Experiment2Explanation, { predictionA: a, predictionB: b, durationSeconds: 10 }))
      const order = ['Your guesses, marked.', '1. Why your guesses did not change the clocks.', '2. What “agree” means.', '3. Real clocks have to be kept in agreement.', '4. What comes next.']
      let at = -1
      for (const heading of order) {
        const found = html.indexOf(heading)
        expect(found).toBeGreaterThan(at)
        expect(html.indexOf(heading, found + 1)).toBe(-1)
        at = found
      }
      expect(html).toContain('difference between their elapsed times is 0 seconds')
      expect(html).not.toContain('NaN')
    }
    const wrong = renderToStaticMarkup(createElement(Experiment2Explanation, { predictionA: 7, predictionB: 12, durationSeconds: 10 }))
    expect(wrong).toContain('3 seconds less')
    expect(wrong).toContain('2 seconds more')
    const right = renderToStaticMarkup(createElement(Experiment2Explanation, { predictionA: 10, predictionB: 10, durationSeconds: 10 }))
    expect(right).toContain('is the same as')
  })
})
