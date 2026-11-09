import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { guessPositionOnTickBars, lightClockStateAt, runLightClockExperiment } from '../physics/lightClockExperiment'
import { BarsCaption, ClocksAndBarsBox, Experiment4, LightClockPanels, PanelsCaption, TickBars } from './Experiment4'
import { Experiment4Explanation, Experiment4Tutor } from './Experiment4Tutor'
import { RightTriangleFigure, TriangleCaption, WhyTimeDilationSection } from './LightClockWhy'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when a guess is
// given. They do not check how the page looks.
const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.8, 0.93, 0.99]
const GUESSES = [0, 1, 1.155, 2, 5, -1]

describe('Relativity 4 renders', () => {
  it('the whole page renders at rest: Part 1, both links, words box and Start over, but no later Part and no mark', () => {
    const html = renderToStaticMarkup(createElement(Experiment4, {}))
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
    expect(html).toContain('science.nasa.gov')
    expect(html).toContain('einstein-online.info')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment4, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the introduction has one merged light-clock paragraph, the 15 cm sentence, the c definition and the chapters\' titles', () => {
    const html = renderToStaticMarkup(createElement(Experiment4, {}))
    expect(html.match(/What a light clock is\./g)?.length).toBe(1)
    expect(html).not.toContain('A daily-life picture')
    expect(html).toContain('mirrors only 15 cm apart')
    expect(html).toContain('A speed written as 0.5c is half of that.')
    expect(html).toContain('A moving clock')
    expect(html).toContain('Two clocks at rest')
    expect(html).not.toContain('Experiment 3')
    expect(html).not.toContain('Experiment 2')
    // the owner chose (2026-11-08) to explain the whole reason in the introduction, so the constancy of light's speed is now stated there
    expect(html).toContain('Why does time dilation happen?')
    expect(html).toContain('light always travels at the same speed')
    // but the introduction must not hand over Part 1's answer (0.5c gives 1.155 s)
    expect(html).not.toContain('1.155')
    expect(html).not.toContain('1.1547')
    expect(html).toContain('You can now work out your guess with the steps above.')
  })

  it('the words box lists the sixteen terms, with the right-triangle rule in words and numbers and no algebra', () => {
    const html = renderToStaticMarkup(createElement(Experiment4, {}))
    for (const term of ['Light clock', 'Tick', 'Mirror', 'Light pulse', 'Light-second', 'Lab seconds', 'Lab time', 'Reference frame', 'At rest / moving', 'Sideways', 'Right triangle', 'Diagonal', 'Postulate', 'Formula', 'c', 'Time dilation']) {
      expect(html).toContain(`<strong>${term}:</strong>`)
    }
    expect(html).toContain('3 × 3 + 4 × 4 = 9 + 16 = 25 = 5 × 5')
  })

  it('every panel part is labelled on the canvas, at rest, mid-run and at the end, for every speed', () => {
    for (const v of SPEEDS) {
      const e = runLightClockExperiment(v)
      for (const t of [0, e.movingTickDuration / 2, e.movingTickDuration]) {
        const html = renderToStaticMarkup(createElement(LightClockPanels, { geometry: e, labTime: t, running: false, movingTitle: 'Moving clock: seen from the lab' }))
        for (const text of ['Rest clock: at rest in the lab', 'Moving clock: seen from the lab', 'Top mirror', 'Bottom mirror', 'Light pulse', 'Path of the light']) {
          expect(html).toContain(text)
        }
        expect(html).not.toContain('NaN')
      }
    }
    const mid = runLightClockExperiment(0.5)
    expect(renderToStaticMarkup(createElement(LightClockPanels, { geometry: mid, labTime: mid.movingTickDuration, running: false, movingTitle: 'x' }))).toContain('Where the mirrors started')
  })

  it('each panel\'s reading comes from the module', () => {
    const e = runLightClockExperiment(0.5)
    const end = lightClockStateAt(e, e.movingTickDuration)
    expect(end.movingClockReading).toBeCloseTo(1, 12)
    const html = renderToStaticMarkup(createElement(LightClockPanels, { geometry: e, labTime: e.movingTickDuration, running: false, movingTitle: 'x' }))
    expect(html).toContain('00:01.2') // lab time 1.155 s shows as 00:01.2 on the rest clock
    expect(html).toContain('00:01.0') // the moving clock's own reading after its one tick
    expect(html).toContain('Lab time: <strong>1.155 s</strong>')
  })

  it('the bars draw a white mark only when a guess is given, for every speed and guess, and flag an off-scale guess', () => {
    for (const v of SPEEDS) {
      const e = runLightClockExperiment(v)
      const none = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pink: false, guess: null, label: 'x' }))
      expect(none).not.toContain('YOUR GUESS:')
      for (const g of GUESSES) {
        const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pink: false, guess: g, label: 'x' }))
        expect(html).toContain(`YOUR GUESS: ${g} seconds`)
        expect(html).not.toContain('NaN')
        expect(html.split('(off the scale)').length - 1).toBe(guessPositionOnTickBars(e, g).offEdge ? 1 : 0)
      }
    }
  })

  it('each readout says when it was read, and the bars say they show one tick in lab seconds', () => {
    const e = runLightClockExperiment(0.5)
    const start = renderToStaticMarkup(createElement(LightClockPanels, { geometry: e, labTime: 0, running: false, movingTitle: 'x' }))
    expect(start.match(/reading at the start/g)?.length).toBe(2)
    const mid = renderToStaticMarkup(createElement(LightClockPanels, { geometry: e, labTime: 0.5, running: true, movingTitle: 'x' }))
    expect(mid.match(/reading now/g)?.length).toBe(2)
    const end = renderToStaticMarkup(createElement(LightClockPanels, { geometry: e, labTime: e.movingTickDuration, running: false, movingTitle: 'x' }))
    expect(end.match(/reading when the run ended/g)?.length).toBe(2)
    const bars = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pink: false, guess: null, label: 'x' }))
    expect(bars).toContain('one tick: 1.000 s')
    expect(bars).toContain('one tick: 1.155 s')
    expect(bars).toContain('one tick of each clock, in lab seconds')
  })

  it('the clocks-and-bars box explains the two questions, with an example, a table and the module\'s numbers (Part 1 at 0.5c)', () => {
    const html = renderToStaticMarkup(createElement(ClocksAndBarsBox, { experiment: runLightClockExperiment(0.5) }))
    for (const text of [
      'Reading the clocks and the bars together.',
      'Question 1, for the clocks:',
      'Question 2, for the bars:',
      'Start a stopwatch when a race begins.',
      'the lab’s clocks show 1.155 seconds',
      '00:01.2 (really 1.155 s)',
      '>00:01.0<',
      'its first tick, 1.000 s, plus 0.155 s of its second tick, which has already begun',
      'The bar shows only one tick: 1.000 s.',
      'it has counted exactly one tick on its own display: 00:01.0',
      'The bar shows how long that same tick lasted on the lab’s clocks: 1.155 s.',
      'This is the important part.',
      '00:01.0 on its own display, 1.155 on the lab’s clocks',
      'That difference is time dilation.',
      'One more link between the two.',
    ]) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
  })

  it('the box follows the run: at 0.8c the rest clock shows 1.667 (display 00:01.7); at 0.99c it has finished seven whole ticks', () => {
    const a = renderToStaticMarkup(createElement(ClocksAndBarsBox, { experiment: runLightClockExperiment(0.8) }))
    expect(a).toContain('00:01.7 (really 1.667 s)')
    expect(a).toContain('plus 0.667 s of its second tick')
    expect(a).toContain('1.667 s</td>')
    const b = renderToStaticMarkup(createElement(ClocksAndBarsBox, { experiment: runLightClockExperiment(0.99) }))
    expect(b).toContain('7 whole ticks of 1.000 s each, plus 0.089 s of the next tick')
    expect(b).not.toContain('NaN')
    for (const v of SPEEDS) {
      expect(renderToStaticMarkup(createElement(ClocksAndBarsBox, { experiment: runLightClockExperiment(v) }))).not.toContain('NaN')
    }
  })

  it('the bars mark where the run stopped, at the end of the moving bar, for every speed', () => {
    const e = runLightClockExperiment(0.5)
    const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pink: false, guess: 1.3, label: 'x' }))
    expect(html).toContain('run stopped: lab time 1.155 s')
    for (const v of SPEEDS) {
      const x = runLightClockExperiment(v)
      for (const basis of ['rest', 'moving'] as const) {
        const out = renderToStaticMarkup(createElement(TickBars, { experiment: x, basis, pink: basis === 'moving', guess: null, label: 'x' }))
        expect(out).toContain(`run stopped: lab time ${x.movingTickDuration.toFixed(3)} s`)
        expect(out).not.toContain('NaN')
      }
    }
  })

  it('the bars are labelled and carry the module\'s numbers', () => {
    const e = runLightClockExperiment(0.5)
    const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pink: false, guess: 1.3, label: 'x' }))
    for (const text of ['Rest clock', 'Moving clock', '1.000 s', '1.155 s', '0 s', '1 s', '2 s', 'both pulses leave the bottom mirror together']) {
      expect(html).toContain(text)
    }
  })

  it('Drawing A is pink, on a scale to twice the moving tick, and carries no white mark', () => {
    const e = runLightClockExperiment(0.8)
    const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'moving', pink: true, guess: null, label: 'x' }))
    expect(html).toContain('#f472b6')
    expect(html).toContain('1.667 s')
    expect(html).toContain('3.333 s')
    expect(html).not.toContain('YOUR GUESS:')
  })

  it('the captions give the worked moment and three-part look-at items, and the guess item only for Part 1', () => {
    const e = runLightClockExperiment(0.5)
    const panels = renderToStaticMarkup(createElement(PanelsCaption))
    expect(panels).toContain('How to read the two light clocks.')
    expect(panels).not.toContain('Look at:')
    const part1 = renderToStaticMarkup(createElement(BarsCaption, { name: 'the two tick bars', experiment: e, guesses: true, pink: false }))
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('0.5 × 1.155 = 0.577')
    expect(part1).toContain('0.145 seconds to the right of')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const drawing = renderToStaticMarkup(createElement(BarsCaption, { name: 'Drawing A', experiment: runLightClockExperiment(0.8), guesses: false, pink: true }))
    expect(drawing.match(/Look at:/g)?.length).toBe(1)
    expect(drawing.match(/What it means:/g)?.length).toBe(1)
    expect(drawing.match(/Why it matters:/g)?.length).toBe(1)
    expect(drawing).not.toContain('YOUR GUESS')
    expect(drawing).toContain('0.8 × 1.667 = 1.333')
    // neither caption states that light's speed is constant: the tutor does that
    expect(part1).not.toContain('constant')
    expect(drawing).not.toContain('constant')
  })

  it('the introduction gives the seven steps once and in order, with the 0.6c worked example from the module', () => {
    const html = renderToStaticMarkup(createElement(WhyTimeDilationSection))
    const order = ['Step 1. A tick is a distance divided by a speed.', 'Step 2. One tick, two views.', 'Step 3. The slanted path is longer.', 'Step 4. Light does not speed up to make up the difference.', 'Step 5. A longer path at the same speed takes more time.', 'Step 6. What the moving clock itself says.', 'Step 7. Not only light clocks.', 'In one breath.', 'How to use this in Part 1.']
    let at = -1
    for (const heading of order) {
      const found = html.indexOf(heading)
      expect(found).toBeGreaterThan(at)
      expect(html.indexOf(heading, found + 1)).toBe(-1)
      at = found
    }
    // the worked example: a 3-4-5 triangle at 0.6c, a tick of 1.25 s, a factor of 0.8, and 10 lab seconds counting as 8
    for (const text of ['0.375', '0.625', '0.390625', '1.25', '0.8', '10 × 0.8 = 8', 'The tick is longer than 1 s.', 'The tick is shorter than 1.5 s.', 'They are the same, so the flash reaches the mirror exactly when the trip up ends. The tick is 1.25 s.', 'Another way to see it.']) {
      expect(html).toContain(text)
    }
    // the trial values: 1.0 s needs 0.583, 1.5 s needs 0.673, each shown with the same four lines
    expect(html).toContain('it must go 0.583')
    expect(html).toContain('it only has to go 0.673')
    expect(html.split('How far the flash needs to go to reach the mirror').length - 1).toBe(3)
    // it is not Part 1's run
    expect(html).not.toContain('1.155')
    expect(html).not.toContain('NaN')
  })

  it('the triangle picture labels every part on the canvas and carries the module\'s numbers', () => {
    const html = renderToStaticMarkup(createElement(RightTriangleFigure, { label: 'x' }))
    for (const text of ['The clock slides sideways: 0.375', 'The flash rises: 0.5', 'The diagonal (the flash’s path): 0.625', 'square corner', 'Flash leaves the bottom mirror', 'Top mirror, now further along', '0.5 × 0.5 + 0.375 × 0.375 = 0.25 + 0.140625 = 0.390625', '0.625 × 0.625 = 0.390625: the two are equal']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
    const caption = renderToStaticMarkup(createElement(TriangleCaption))
    expect(caption).toContain('How to read this drawing.')
    expect(caption).toContain('A worked moment.')
    expect(caption.match(/Look at:/g)?.length).toBe(3)
    expect(caption.match(/What it means:/g)?.length).toBe(3)
    expect(caption.match(/Why it matters:/g)?.length).toBe(3)
    expect(caption).toContain('2 × 0.625 = 1.25')
  })

  it('the tutor asks first, and shows no explanation or verdict before its last step', () => {
    const html = renderToStaticMarkup(createElement(Experiment4Tutor, { velocity: 0.5, prediction: 1 }))
    expect(html).toContain('Look at the two light paths and at the two bars')
    expect(html).not.toContain('Your guess, marked')
    expect(html).not.toContain('NaN')
  })

  it('the explanation gives the time dilation formula and the worked numbers at 0.5c, as Experiment 3 does', () => {
    const html = renderToStaticMarkup(createElement(Experiment4Explanation, { velocity: 0.5, prediction: 1.2 }))
    for (const text of ['time dilation', 'About the formula.', 'Δt_moving = Δt_lab × √(1 − v²)', 'works like a dial', '1 − v² = 1 − 0.25 = 0.750', '√0.750 = 0.866', '1.155 × 0.866 = 1.000', 'It is the same factor you saw in']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks the guess, then gives points 1 to 4 once and in order, with the module\'s numbers', () => {
    for (const g of [1, 1.3, 1.155, 5]) {
      const html = renderToStaticMarkup(createElement(Experiment4Explanation, { velocity: 0.5, prediction: g }))
      const order = ['Your guess, marked.', '1. Why your guess did not change the clocks.', '2. What the bars show.', '3. Try it in Part 2.', '4. What comes next.']
      let at = -1
      for (const heading of order) {
        const found = html.indexOf(heading)
        expect(found).toBeGreaterThan(at)
        expect(html.indexOf(heading, found + 1)).toBe(-1)
        at = found
      }
      expect(html).toContain('1.005')
      expect(html).toContain('1.667')
      expect(html).toContain('7.089')
      expect(html).toContain('A <strong>right triangle</strong> is a triangle with one square corner.')
      expect(html).toContain('0.289')
      expect(html).toContain('0.577')
      expect(html).not.toContain('NaN')
    }
    const wrong = renderToStaticMarkup(createElement(Experiment4Explanation, { velocity: 0.5, prediction: 1.3 }))
    expect(wrong).toContain('0.145 seconds more than the 1.155 seconds one tick of the moving clock took')
    expect(wrong).toContain('0.300 seconds more than the rest clock’s 1.000 seconds')
    const right = renderToStaticMarkup(createElement(Experiment4Explanation, { velocity: 0.5, prediction: 1.1547005383792515 }))
    expect(right).toContain('is the same as the 1.155 seconds one tick of the moving clock took')
  })
})
