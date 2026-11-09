import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runInvariantLightSpeedExperiment } from '../physics/invariantLightSpeedExperiment'
import type { RuleChoice } from '../physics/invariantLightSpeedExperiment'
import { Experiment5 } from './Experiment5'
import { BarsCaption, PanelsCaption, ThreeClockPanels, TickBars } from './Experiment5Pictures'
import { Experiment5Explanation, Experiment5Tutor } from './Experiment5Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when guesses are given.
// They do not check how the page looks.
const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.8, 0.93, 0.99]
const CHOICES: RuleChoice[] = ['everyday', 'actual', 'same']
const GUESSES = [0, 1, 1.155, 2, 5, -1]

describe('Relativity 5 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part and no mark', () => {
    const html = renderToStaticMarkup(createElement(Experiment5, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS:')
    expect(html).not.toContain('YOUR GUESS (')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment5, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the links from the start are the three NASA pages; the two Einstein Online pages are held back', () => {
    const html = renderToStaticMarkup(createElement(Experiment5, {}))
    expect(html).toContain('science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space')
    expect(html).toContain('grc.nasa.gov/www/k-12/airplane/move.html')
    expect(html).toContain('pwg.gsfc.nasa.gov/stargaze/Lframes1.htm')
    expect(html).not.toContain('einstein-online.info')
    expect(html).toContain('target="_blank"')
  })

  it('the introduction uses the chapters\' titles, adds the statement about guesses, and does not hand over the answers', () => {
    const html = renderToStaticMarkup(createElement(Experiment5, {}))
    expect(html).toContain('Why time dilation happens')
    expect(html).toContain('Two clocks at rest')
    expect(html).not.toContain('Experiment 4')
    expect(html).not.toContain('Experiment 2')
    expect(html).toContain('Your guesses and the real pictures.')
    expect(html).toContain('a marker only')
    expect(html).toContain('mirrors only 15 cm apart')
    expect(html).toContain('labels it <strong>imagined</strong>')
    // the tick lengths and light speeds under the two rules are not in the introduction
    for (const text of ['1.155', '1.118', '1.1547', '1.667']) {
      expect(html).not.toContain(text)
    }
  })

  it('the words box has every entry and the one formula with its worked example', () => {
    const html = renderToStaticMarkup(createElement(Experiment5, {}))
    for (const term of ['Light clock', 'Tick', 'Mirror', 'Light source', 'Light pulse', 'Light-second', 'Lab seconds', 'Lab time', 'Reference frame', 'At rest / moving', 'Sideways', 'c', 'Everyday rule', 'Light’s actual rule', 'What if (imagined)', 'Time dilation factor', 'Postulate', 'Formula, speed = distance ÷ time']) {
      expect(html).toContain(`<strong>${term}:</strong>`)
    }
    expect(html).toContain('1.000 ÷ 1.000 = 1.000 light-second every second')
    // no square-root formula, which would give away the prediction
    expect(html).not.toContain('√')
  })

  it('the three panels are labelled on the canvas, the everyday rule is violet and says IMAGINED, and the readout notes say when read', () => {
    const e = runInvariantLightSpeedExperiment(0.5)
    const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: 0, running: false }))
    for (const text of ['Rest clock:', 'at rest in the lab', 'IMAGINED: moving clock,', 'everyday rule,', 'light&#x27;s actual rule:', 'Top mirror', 'Bottom mirror', 'Light pulse', 'Path of the light', 'Where the mirrors started', 'reading at the start', 'Moving clocks at']) {
      expect(html).toContain(text)
    }
    expect(html).toContain('#6d28d9')
    expect(html).not.toContain('NaN')
  })

  it('the panels render at every allowed speed, before, during and after the run, with no NaN', () => {
    for (const v of SPEEDS) {
      const e = runInvariantLightSpeedExperiment(v)
      for (const t of [0, e.everydayRule.movingTickDuration / 2, e.actualRule.movingTickDuration]) {
        const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: t, running: t < e.actualRule.movingTickDuration }))
        expect(html).not.toContain('NaN')
      }
    }
  })

  it('the three bars show every tick and carry no white mark without guesses', () => {
    const e = runInvariantLightSpeedExperiment(0.5)
    const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: null, label: 'x' }))
    for (const text of ['Rest clock', 'IMAGINED:', 'everyday rule', 'Light’s actual', 'one tick: 1.000 s', 'one tick: 1.155 s', 'run stopped: lab time 1.155 s']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('every guess gives two white YOUR GUESS boxes and one marker tag that says it is a marker only; the bars do not change', () => {
    const e = runInvariantLightSpeedExperiment(0.5)
    const without = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: null, label: 'x' }))
    for (const choice of CHOICES) {
      for (const g of GUESSES) {
        const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: { choice, everydayTick: g, actualTick: g }, label: 'x' }))
        expect(html.match(/YOUR GUESS: /g)?.length).toBe(2)
        expect(html).toContain('YOUR GUESS (a marker only):')
        expect(html).not.toContain('NaN')
        // the real bars are unchanged by a guess
        expect(html).toContain('one tick: 1.000 s')
        expect(html).toContain('one tick: 1.155 s')
      }
    }
    expect(without).not.toContain('a marker only')
    const off = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: { choice: 'same', everydayTick: 9, actualTick: -2 }, label: 'x' }))
    expect(off.match(/\(off the scale\)/g)?.length).toBe(2)
    expect(off).toContain('both rules give the same tick')
  })

  it('a different guess gives a different mark, and the marker names the chosen rule', () => {
    const e = runInvariantLightSpeedExperiment(0.5)
    const a = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: { choice: 'everyday', everydayTick: 0.5, actualTick: 1.5 }, label: 'x' }))
    const b = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'rest', pinkSpeed: null, guesses: { choice: 'actual', everydayTick: 1.5, actualTick: 0.5 }, label: 'x' }))
    expect(a).not.toBe(b)
    expect(a).toContain('the everyday rule gives the longer tick')
    expect(b).toContain('light&#x27;s actual rule gives the longer tick')
  })

  it('Drawing A writes the learner\'s speed in pink, has no white mark, and its scale follows the speed', () => {
    for (const v of SPEEDS) {
      const e = runInvariantLightSpeedExperiment(v)
      const html = renderToStaticMarkup(createElement(TickBars, { experiment: e, basis: 'actual', pinkSpeed: v, guesses: null, label: 'x' }))
      expect(html).toContain(`your speed: ${v}c`)
      expect(html).toContain('#f472b6')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('the panels caption names the three clocks and the imagined rule; it states no tick length', () => {
    const html = renderToStaticMarkup(createElement(PanelsCaption))
    for (const text of ['How to read the three light clocks.', 'Three panels', 'Rest clock', 'IMAGINED', 'everyday rule', 'light’s actual rule', 'Lab time', 'When the run ends']) {
      expect(html).toContain(text)
    }
    for (const text of ['1.155', '1.118', '1.000']) {
      expect(html).not.toContain(text)
    }
  })

  it('the bars caption has the worked numbers from the module, the white-marker explanation and look-fors in three parts', () => {
    const e = runInvariantLightSpeedExperiment(0.5)
    const html = renderToStaticMarkup(createElement(BarsCaption, { name: 'the three tick bars', experiment: e, guesses: true, pink: false }))
    for (const text of ['How to read the three tick bars.', '1.118 ÷ 1.000 = 1.118c', '1.155 ÷ 1.155 = 1.000c', 'it is only a marker', '0.200 seconds to the right of the end of the violet bar', 'Look at:', 'What it means:', 'Why it matters:', '1.155 − 1.000 = 0.155 seconds']) {
      expect(html).toContain(text)
    }
    expect(html.match(/<strong>Look at:<\/strong>/g)?.length).toBe(4)
    const pink = renderToStaticMarkup(createElement(BarsCaption, { name: 'Drawing A', experiment: runInvariantLightSpeedExperiment(0.8), guesses: false, pink: true }))
    expect(pink).toContain('Pink')
    expect(pink).toContain('0.8 × 1.667 = 1.333 light-seconds')
    expect(pink).not.toContain('YOUR GUESS')
  })

  it('the tutor asks three questions that point to the white marks by name', () => {
    const run = runInvariantLightSpeedExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment5Tutor, { run, prediction: { choice: 'same', everydayTick: 1, actualTick: 1.3 } }))
    expect(html).toContain('Look at the three clocks and at the three bars.')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks each guess with no score, then gives points 1 to 4 once and in order, with the module\'s numbers', () => {
    const run = runInvariantLightSpeedExperiment(0.5)
    for (const choice of CHOICES) {
      for (const g of [1, 1.3, 1.155, 5]) {
        const html = renderToStaticMarkup(createElement(Experiment5Explanation, { run, prediction: { choice, everydayTick: g, actualTick: g } }))
        const order = ['Your guesses, marked.', '1. Why your guesses did not change the clocks.', '2. What the bars show.', '3. Try it in Part 2.', '4. What comes next.']
        let at = -1
        for (const heading of order) {
          const found = html.indexOf(heading)
          expect(found).toBeGreaterThan(at)
          expect(html.indexOf(heading, found + 1)).toBe(-1)
          at = found
        }
        expect(html).not.toContain('NaN')
        expect(html).not.toMatch(/\bwrong\b/i)
        expect(html).not.toMatch(/\bcorrect\b/i)
        expect(html).not.toMatch(/\bright answer\b/i)
      }
    }
    const html = renderToStaticMarkup(createElement(Experiment5Explanation, { run, prediction: { choice: 'everyday', everydayTick: 1.2, actualTick: 1.155 } }))
    // numbers from the module: the everyday rule at 0.5c, the half-trip, the 0.1c, 0.8c and 0.99c ticks
    for (const text of ['1.118c', '0.559', '0.250', '0.866', '1.005', '1.667', '7.089', '1.407c', 'light’s actual rule gave the longer tick', 'was 0.200 seconds more than the 1.000 seconds', 'is the same as the 1.155 seconds']) {
      expect(html).toContain(text)
    }
    // the chapters' titles replace "Experiments 3 and 4"
    expect(html).not.toContain('Experiments 3 and 4')
    expect(html).not.toContain('Experiment 4')
  })

  it('the explanation does not number its first paragraphs, so points 1 to 4 are the only numbered ones', () => {
    const run = runInvariantLightSpeedExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment5Explanation, { run, prediction: { choice: 'actual', everydayTick: 1, actualTick: 1.155 } }))
    expect(html.match(/<strong>\d\. /g)?.length).toBe(4)
  })
})
