import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { guessPositionOnBars, runMovingClockExperiment } from '../physics/movingClockExperiment'
import { BarsCaption, Experiment3, MovingClockBars, MovingClockReadouts, MovingClockTrack, TrackCaption } from './Experiment3'
import { Experiment3Explanation, Experiment3Tutor } from './Experiment3Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when a guess is
// given. They do not check how the page looks.
const SETTINGS: Array<[number, number]> = [[5, 0], [10, 0.5], [20, 0.8], [30, 0.1], [120, 0.99]]
const GUESSES = [0, 8.66, 10, 20, 500, -4]

describe('Relativity 3 renders', () => {
  it('the whole page renders at rest: Part 1, link, words box and Start over, but no later Part, no mark and no formula', () => {
    const html = renderToStaticMarkup(createElement(Experiment3, {}))
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
    expect(html).not.toContain('Time dilation')
    expect(html).not.toContain('NaN')
  })

  it('the introduction says what a light clock is, with the worked example, and the words box lists light clock and tick', () => {
    const html = renderToStaticMarkup(createElement(Experiment3, {}))
    expect(html).toContain('What is a light clock?')
    expect(html).toContain('15 + 15 = 30 cm per tick')
    expect(html).toContain('<strong>Light clock:</strong>')
    expect(html).toContain('<strong>Tick:</strong>')
  })

  it('the introduction explains what is tested and what happens, step by step, and the words box lists event', () => {
    const html = renderToStaticMarkup(createElement(Experiment3, {}))
    expect(html).toContain('An <strong>event</strong> is one moment at one place.')
    expect(html).toContain('<strong>Event:</strong>')
    expect(html).toContain('<strong>Start.</strong>')
    expect(html).toContain('<strong>Compare.</strong>')
    expect(html).toContain('150,000 km every second')
    expect(html).toContain('roughly 600,000 times faster than an airliner')
    expect(html).toContain('Neither clock is broken or built differently')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment3, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the track labels every drawn part and its numbers come from the run', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const html = renderToStaticMarkup(createElement(MovingClockTrack, { experiment: e, distanceTravelled: e.distanceTravelled, label: 'x' }))
    for (const text of ['Lab clock', 'Moving clock: 5.00 light-seconds from the lab clock', 'End of run', 'Track (the moving clock', 'Distance travelled so far']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
    const rest = runMovingClockExperiment(10, 0)
    expect(renderToStaticMarkup(createElement(MovingClockTrack, { experiment: rest, distanceTravelled: 0, label: 'x' }))).not.toContain('NaN')
  })

  it('the bars draw a white mark only when a guess is given, for every setting and guess, and flag an off-scale guess', () => {
    for (const [d, v] of SETTINGS) {
      const e = runMovingClockExperiment(d, v)
      const none = renderToStaticMarkup(createElement(MovingClockBars, { experiment: e, pink: false, guess: null, label: 'x' }))
      expect(none).not.toContain('YOUR GUESS:')
      for (const g of GUESSES) {
        const html = renderToStaticMarkup(createElement(MovingClockBars, { experiment: e, pink: false, guess: g, label: 'x' }))
        expect(html).toContain(`YOUR GUESS: ${g} seconds`)
        expect(html).not.toContain('NaN')
        expect(html.split('(off the scale)').length - 1).toBe(guessPositionOnBars(e, g).offEdge ? 1 : 0)
      }
    }
  })

  it('the bars are labelled and carry the module\'s numbers', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const html = renderToStaticMarkup(createElement(MovingClockBars, { experiment: e, pink: false, guess: 9, label: 'x' }))
    for (const text of ['Lab clock', 'Moving clock', '10.000 s', '8.660 s', '0 s', '10 s', '20 s', 'both clocks start together']) {
      expect(html).toContain(text)
    }
  })

  it('Drawing A is pink and carries no white mark', () => {
    const e = runMovingClockExperiment(20, 0.8)
    const html = renderToStaticMarkup(createElement(MovingClockBars, { experiment: e, pink: true, guess: null, label: 'x' }))
    expect(html).toContain('#f472b6')
    expect(html).toContain('12.000 s')
    expect(html).toContain('40 s')
    expect(html).not.toContain('YOUR GUESS:')
  })

  it('the captions give the worked moment and three-part look-at items, and the guess item only for Part 1', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const part1 = renderToStaticMarkup(createElement(BarsCaption, { name: 'the two time bars', experiment: e, guesses: true, pink: false }))
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('10 × 0.866 = 8.660')
    expect(part1).toContain('0.340 seconds to the right of')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const drawing = renderToStaticMarkup(createElement(BarsCaption, { name: 'Drawing A', experiment: runMovingClockExperiment(10, 0.8), guesses: false, pink: true }))
    expect(drawing.match(/Look at:/g)?.length).toBe(1)
    expect(drawing.match(/What it means:/g)?.length).toBe(1)
    expect(drawing.match(/Why it matters:/g)?.length).toBe(1)
    expect(drawing).not.toContain('YOUR GUESS')
    expect(drawing).toContain('10 × 0.600 = 6.000')
    const track = renderToStaticMarkup(createElement(TrackCaption))
    expect(track).toContain('How to read the track and the clocks.')
  })

  it('each clock is read from the module: the lab clock counts, the moving clock counts less', () => {
    const e = runMovingClockExperiment(10, 0.5)
    const end = renderToStaticMarkup(createElement(MovingClockReadouts, { experiment: e, time: 10, running: false, label: 'Clocks' }))
    expect(end).toContain('00:10.0')
    expect(end).toContain('00:08.7')
    const mid = renderToStaticMarkup(createElement(MovingClockReadouts, { experiment: e, time: 5, running: true, label: 'Clocks' }))
    expect(mid).toContain('00:05.0')
    expect(mid).toContain('running...')
    expect(renderToStaticMarkup(createElement(MovingClockReadouts, { experiment: null, time: 0, running: false, label: 'Clocks' }))).toContain('00:00.0')
  })

  it('the tutor asks first, and shows no explanation or verdict before its last step', () => {
    const html = renderToStaticMarkup(createElement(Experiment3Tutor, { velocity: 0.5, durationSeconds: 10, prediction: 7 }))
    expect(html).toContain('Look at the two clocks and at the two bars')
    expect(html).not.toContain('Your guess, marked')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks the guess, then gives points 1 to 4 once and in order, with the module\'s numbers', () => {
    for (const g of [7, 8.66, 10, 25]) {
      const html = renderToStaticMarkup(createElement(Experiment3Explanation, { velocity: 0.5, durationSeconds: 10, prediction: g }))
      const order = ['Your guess, marked.', '1. Why your guess did not change the clocks.', '2. What the bars show.', '3. Try it in Part 2.', '4. What comes next.']
      let at = -1
      for (const heading of order) {
        const found = html.indexOf(heading)
        expect(found).toBeGreaterThan(at)
        expect(html.indexOf(heading, found + 1)).toBe(-1)
        at = found
      }
      expect(html).toContain('0.866')
      expect(html).toContain('2.679')
      expect(html).not.toContain('NaN')
    }
    const wrong = renderToStaticMarkup(createElement(Experiment3Explanation, { velocity: 0.5, durationSeconds: 10, prediction: 7 }))
    expect(wrong).toContain('1.660 seconds less than the moving clock’s 8.660 seconds')
    expect(wrong).toContain('3.000 seconds less than the lab clock’s 10.000 seconds')
    expect(wrong).not.toContain('Great!')
    expect(wrong).not.toContain('not alone')
    const near = renderToStaticMarkup(createElement(Experiment3Explanation, { velocity: 0.5, durationSeconds: 10, prediction: 8.5 }))
    expect(near).toContain('Great!')
    const lab = renderToStaticMarkup(createElement(Experiment3Explanation, { velocity: 0.5, durationSeconds: 10, prediction: 10 }))
    expect(lab).toContain('not alone')
    expect(lab).toContain('the same as the lab clock’s 10.000 seconds')
  })

  it('at 0c the explanation says the clocks agree and does not claim the moving clock read less', () => {
    const html = renderToStaticMarkup(createElement(Experiment3Explanation, { velocity: 0, durationSeconds: 10, prediction: 10 }))
    expect(html).toContain('the two clocks agree')
    expect(html).not.toContain('Great!')
    expect(html).not.toContain('NaN')
  })
})
