import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { guessPositionOnStrip } from '../physics/clockExperiment'
import { ClockReadout, Experiment1, EventStrip, StripCaption, formatClockReading } from './Experiment1'
import { ExperimentExplanation, ExperimentTutor } from './ExperimentTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when a guess
// is given. They do not check how the page looks.
const DURATIONS = [5, 10, 20, 30, 60]
const GUESSES = [0, 7, 10, 20, 500, -4]

describe('Relativity 1 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part, no mark and no formula', () => {
    const html = renderToStaticMarkup(createElement(Experiment1, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS:')
    expect(html).not.toContain('Formula: elapsed time')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment1, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the strip draws the white guess only when a guess is given, for every duration and guess', () => {
    for (const duration of DURATIONS) {
      const none = renderToStaticMarkup(createElement(EventStrip, { duration, pink: false, guess: null, label: 'x' }))
      expect(none).not.toContain('YOUR GUESS:')
      for (const guess of GUESSES) {
        const html = renderToStaticMarkup(createElement(EventStrip, { duration, pink: false, guess, label: 'x' }))
        expect(html).toContain(`YOUR GUESS: ${guess} seconds`)
        expect(html).not.toContain('NaN')
        const off = guessPositionOnStrip(duration, guess).offEdge !== null
        expect(html.includes('(off the scale)')).toBe(off)
      }
    }
  })

  it('the strip is labelled and its numbers come from the duration', () => {
    const html = renderToStaticMarkup(createElement(EventStrip, { duration: 10, pink: false, guess: 7, label: 'x' }))
    for (const text of ['Event A, START', 'Event B, END', 'elapsed time: 10 seconds', '00:00:00', '00:00:10', '0 s', '10 s', '20 s']) {
      expect(html).toContain(text)
    }
  })

  it('Drawing A is pink and says "your length", and carries no white mark', () => {
    const html = renderToStaticMarkup(createElement(EventStrip, { duration: 20, pink: true, guess: null, label: 'x' }))
    expect(html).toContain('#f472b6')
    expect(html).toContain('Event B, END (your length)')
    expect(html).toContain('40 s')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('the captions give the worked moment and three-part look-at items, and the guess item only for Part 1', () => {
    const part1 = renderToStaticMarkup(createElement(StripCaption, { name: 'the Event Interval strip', duration: 10, guess: 7, pink: false }))
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('00:00:10 − 00:00:00 = 10 seconds')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const drawing = renderToStaticMarkup(createElement(StripCaption, { name: 'Drawing A', duration: 20, guess: null, pink: true }))
    expect(drawing.match(/Look at:/g)?.length).toBe(2)
    expect(drawing).not.toContain('YOUR GUESS')
    expect(drawing).toContain('00:00:20 − 00:00:00 = 20 seconds')
  })

  it('the clock reading formats as hours:minutes:seconds', () => {
    expect(formatClockReading(0)).toBe('00:00:00')
    expect(formatClockReading(10)).toBe('00:00:10')
    expect(formatClockReading(65)).toBe('00:01:05')
    const html = renderToStaticMarkup(createElement(ClockReadout, { seconds: 10, running: false, label: 'Clock' }))
    expect(html).toContain('00:00:10')
  })

  it('the tutor marks the guess in its explanation with the module\'s numbers and no early verdict', () => {
    const asked = renderToStaticMarkup(createElement(ExperimentTutor, { predictionSeconds: 7, durationSeconds: 10 }))
    expect(asked).toContain('Look at the clock and at the strip')
    expect(asked).not.toContain('Your guess, marked')
    expect(asked).not.toContain('NaN')
  })

  it('the explanation gives points 1 to 5 once, in order, with the module\'s numbers, for a guess of 7 and of 10', () => {
    for (const guess of [7, 10]) {
      const html = renderToStaticMarkup(createElement(ExperimentExplanation, { predictionSeconds: guess, durationSeconds: 10 }))
      const order = [
        'Your guess, marked.',
        '1. Why your guess did not change the clock.',
        '2. Elapsed time is a difference.',
        '3. A reading belongs to an event.',
        '4. According to this clock.',
        '5. Try Part 2.',
      ]
      let at = -1
      for (const heading of order) {
        const found = html.indexOf(heading)
        expect(found).toBeGreaterThan(at)
        expect(html.indexOf(heading, found + 1)).toBe(-1)
        at = found
      }
      expect(html).toContain('00:00:40 −')
      expect(html).toContain('00:00:30 = 10 seconds')
      expect(html).toContain('00:00:10 −')
      expect(html).toContain('5-second run ends at 00:00:05')
      expect(html).toContain('20-second run ends at 00:00:20')
      expect(html).not.toContain('NaN')
    }
    expect(renderToStaticMarkup(createElement(ExperimentExplanation, { predictionSeconds: 7, durationSeconds: 10 }))).toContain('3 seconds less')
    expect(renderToStaticMarkup(createElement(ExperimentExplanation, { predictionSeconds: 10, durationSeconds: 10 }))).toContain('is the same as')
  })

  it('the explanation never says "proper time" or "disagree about the time" before the next chapter (spec section 12)', () => {
    const html = renderToStaticMarkup(createElement(ExperimentExplanation, { predictionSeconds: 7, durationSeconds: 10 }))
    expect(html).not.toContain('proper time')
    expect(html).not.toContain('disagree about')
    expect(html).toContain('could disagree with it') // the one allowed sentence: nothing here can disagree
  })

  it('the tutor shows the explanation only at its last step', () => {
    const html = renderToStaticMarkup(createElement(ExperimentTutor, { predictionSeconds: 7, durationSeconds: 10 }))
    expect(html).not.toContain('1. Why your guess did not change the clock.')
  })
})
