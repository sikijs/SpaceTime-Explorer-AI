import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runLengthContractionExperiment } from '../physics/lengthContractionExperiment'
import type { LengthChoice } from '../physics/lengthContractionExperiment'
import { Experiment6, PART_LEADS, Part3Results } from './Experiment6'
import { BarsCaption, GapBars, PanelsCaption, ThreeClockPanels } from './Experiment6Pictures'
import { Experiment6Explanation, Experiment6Tutor } from './Experiment6Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when guesses are given.
// They do not check how the page looks.
const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.8, 0.9]
const CHOICES: LengthChoice[] = ['same', 'shorter', 'longer']
const GUESSES = [0, 0.433, 0.5, 1, 3, -1]

describe('Relativity 6 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part and no mark', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
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
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the speed buttons have left the first screen, and the prediction names the 0.5c tick from the module', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    expect(html).not.toContain('Moving clock speed')
    expect(html).toContain('<strong>1.155 seconds</strong>')
    expect(html).toContain('Guess 1:')
    expect(html).toContain('Guess 2:')
  })

  it('the links from the start are the four NASA pages; the Einstein Online page is held back; the 1905 paper is not linked', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    expect(html).toContain('science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space')
    expect(html).toContain('how_fast_is_the_speed.htm')
    expect(html).toContain('spaceplace.nasa.gov/time-travel/en/')
    expect(html).toContain('pwg.gsfc.nasa.gov/stargaze/Lframes1.htm')
    expect(html).not.toContain('einstein-online.info')
    expect(html).not.toContain('onlinelibrary.wiley.com')
    expect(html).toContain('target="_blank"')
  })

  it('the introduction uses the chapters\' titles, adds the statement about guesses, and does not hand over the answers', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    for (const text of ['Why time dilation happens', 'A moving clock', 'Two clocks at rest', 'Your guesses and the real pictures.', 'a marker only', 'mirrors only 15 cm apart', 'imagined']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('Experiment 4')
    expect(html).not.toContain('Experiment 2')
    expect(html).not.toContain('Experiments 3')
    // the answers, and the words that name them, are not in the introduction
    for (const text of ['0.433', '0.4330', '1.333', 'length contraction', 'Length contraction', '√']) {
      expect(html).not.toContain(text)
    }
  })

  it('the words box has every entry and the one formula with its worked example', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    for (const term of ['Light clock', 'Tick', 'Mirror', 'Light pulse', 'Light-second', 'Lab', 'Lab seconds', 'Lab time', 'Reference frame', 'At rest / moving', 'Along its own length', 'c', 'Time dilation', 'Time dilation factor', 'Clock’s own reading', 'What if (imagined)', 'Formula, distance = speed × time']) {
      expect(html).toContain(`<strong>${term}:</strong>`)
    }
    expect(html).toContain('0.5 ÷ 1 = 0.5 second')
  })

  it('the panels are labelled on the canvas, the clock with the same length as at rest is violet and says IMAGINED', () => {
    const e = runLengthContractionExperiment(0.5)
    const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: 0, running: false }))
    for (const text of ['Rest clock: length 0.500 light-seconds', 'at rest in the lab', 'IMAGINED: moving clock,', 'same length as at rest, seen from the lab', 'Moving clock, shorter:', 'Back mirror', 'Front mirror', 'Light pulse', 'Path of the light', 'Where the mirrors started', 'reading at the start', 'Moving clocks at']) {
      expect(html).toContain(text)
    }
    expect(html).toContain('#6d28d9')
    expect(html).not.toContain('NaN')
  })

  it('the panels render at every allowed speed, before, during and after the run, with no NaN', () => {
    for (const v of SPEEDS) {
      const e = runLengthContractionExperiment(v)
      const end = Math.max(e.sameLength.tickDuration, e.shorterLength.tickDuration)
      for (const t of [0, e.shorterLength.tickDuration / 2, e.shorterLength.tickDuration, end]) {
        const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: t, running: t < end }))
        expect(html).not.toContain('NaN')
      }
    }
  })

  it('the three gap bars show every gap and carry no white mark without guesses', () => {
    const e = runLengthContractionExperiment(0.5)
    const html = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: null, label: 'x' }))
    for (const text of ['Rest clock', 'length of the clock', 'IMAGINED:', 'same length', 'Moving clock,', 'shorter', 'length: 0.500 light-seconds', 'length: 0.433 light-seconds']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('every guess gives one white YOUR GUESS box and one marker tag that says it is a marker only; the bars do not change', () => {
    const e = runLengthContractionExperiment(0.5)
    const without = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: null, label: 'x' }))
    for (const choice of CHOICES) {
      for (const g of GUESSES) {
        const html = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: { choice, gap: g }, label: 'x' }))
        expect(html.match(/YOUR GUESS: /g)?.length).toBe(1)
        expect(html).toContain('YOUR GUESS (a marker only):')
        expect(html).not.toContain('NaN')
        expect(html).toContain('length: 0.500 light-seconds')
        expect(html).toContain('length: 0.433 light-seconds')
      }
    }
    expect(without).not.toContain('a marker only')
    const off = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: { choice: 'longer', gap: 9 }, label: 'x' }))
    expect(off).toContain('(off the scale)')
    expect(off).toContain('longer than at rest')
  })

  it('a different guess gives a different mark, and the marker names the chosen clock', () => {
    const e = runLengthContractionExperiment(0.5)
    const a = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: { choice: 'same', gap: 0.5 }, label: 'x' }))
    const b = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: { choice: 'shorter', gap: 0.2 }, label: 'x' }))
    expect(a).not.toBe(b)
    expect(a).toContain('the same length as at rest')
    expect(b).toContain('shorter than at rest')
  })

  it('Drawing A writes the learner\'s speed in pink, has no white mark, and keeps one scale at every speed', () => {
    for (const v of SPEEDS) {
      const e = runLengthContractionExperiment(v)
      const html = renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: v, guesses: null, label: 'x' }))
      expect(html).toContain(`your speed: ${v}c`)
      expect(html).toContain('#f472b6')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('NaN')
    }
  })

  it('the panels caption names the three clocks and the imagined clock; it states no gap or tick length', () => {
    const html = renderToStaticMarkup(createElement(PanelsCaption))
    for (const text of ['How to read the three light clocks.', 'Three panels', 'Rest clock', 'IMAGINED', 'back mirror', 'front mirror', 'Lab time', 'When the run ends']) {
      expect(html).toContain(text)
    }
    for (const text of ['0.433', '1.155', '1.333', 'contract']) {
      expect(html).not.toContain(text)
    }
  })

  it('the bars caption has the worked numbers from the module, the white-marker explanation and look-fors in three parts', () => {
    const e = runLengthContractionExperiment(0.5)
    const html = renderToStaticMarkup(createElement(BarsCaption, { name: 'the length bars', experiment: e, guesses: true, pink: false }))
    for (const text of ['How to read the length bars.', '0.500 ÷ 0.5 = 1.000 s', '0.500 ÷ 1.5 = 0.333 s', '0.433 ÷ 0.5 = 0.866 s', '0.433 ÷ 1.5 = 0.289 s', 'one tick took 1.333 s', 'it is only a marker', '0.017 light-seconds to the right of the end of the amber bar', 'Look at:', 'What it means:', 'Why it matters:', '0.500 − 0.433 = 0.067 light-seconds shorter than the rest length']) {
      expect(html).toContain(text)
    }
    expect(html.match(/<strong>Look at:<\/strong>/g)?.length).toBe(5)
    const pink = renderToStaticMarkup(createElement(BarsCaption, { name: 'Drawing A', experiment: runLengthContractionExperiment(0.8), guesses: false, pink: true }))
    expect(pink).toContain('Pink')
    expect(pink).toContain('0.300 ÷ 0.2 = 1.500 s')
    expect(pink).not.toContain('YOUR GUESS')
  })

  it('the tutor asks three questions that point to the white marks by name', () => {
    const run = runLengthContractionExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment6Tutor, { run, predictionChoice: 'same', prediction: 0.45 }))
    expect(html).toContain('Look at the three clocks and at the strip of length bars.')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks each guess with no score and no verdict, with the module\'s numbers and the chapters\' titles', () => {
    const run = runLengthContractionExperiment(0.5)
    for (const choice of CHOICES) {
      for (const g of [0.3, 0.433, 0.5, 5]) {
        const html = renderToStaticMarkup(createElement(Experiment6Explanation, { run, predictionChoice: choice, prediction: g }))
        expect(html).toContain('Your guesses, marked.')
        expect(html).toContain('Try it in Part 2.')
        expect(html).toContain('5. A name.')
        expect(html).not.toContain('NaN')
        expect(html).not.toMatch(/\bwrong\b/i)
        expect(html).not.toMatch(/\bcorrect\b/i)
        expect(html).not.toMatch(/\bright answer\b/i)
      }
    }
    const html = renderToStaticMarkup(createElement(Experiment6Explanation, { run, predictionChoice: 'same', prediction: 0.4 }))
    for (const text of ['You chose the same length as at rest.', 'shorter than at rest', '0.033 light-seconds less than that length', '0.4975', '0.300', '1.010 s at 0.1c', '2.778 s at 0.8c', '0.218', '5.263 s']) {
      expect(html).toContain(text)
    }
    const same = renderToStaticMarkup(createElement(Experiment6Explanation, { run, predictionChoice: 'shorter', prediction: 0.433 }))
    expect(same).toContain('the same as that length, to three decimals')
    expect(html).not.toContain('Experiments 3 and 4')
    expect(html).not.toContain('Experiments 4 and 5')
  })
})

describe('Relativity 6 introduction is about length and connects light\'s travel to it', () => {
  const html = () => renderToStaticMarkup(createElement(Experiment6, {})).replace(/&#x27;/g, "'")
  // The part of the page above Part 1: the introduction, the links and the words box.
  const introduction = () => html().split('Part 1: Predict, then watch')[0]

  it('asks the length question and defines the length of the clock before using ticks as a tool', () => {
    const h = html()
    for (const text of [
      'how long is it when it is moving along its own length',
      'The length of the clock is the distance from the back mirror to the front mirror',
      'We will use ticks later, only as a tool',
      'This standing-still length, 0.500 light-seconds, is the length we compare the moving clock with',
    ]) {
      expect(h).toContain(text)
    }
  })

  it('Step 3 connects the travel of light to length with the echo, the walk and the corridor, and a light-second as a length', () => {
    const h = html()
    for (const text of [
      'Step 3: how the travel of light measures a length',
      'An echo.',
      '340 metres',
      'A walk.',
      'A corridor.',
      '12 metres',
      'A light-second is simply a length measured by light',
      'every possible length of the clock gives its own round-trip',
    ]) {
      expect(h).toContain(text)
    }
  })

  it('the table of two possible lengths and the worked example take their numbers from the module', () => {
    const h = html()
    // 0.500 light-second at 0.5c: 1.00 s forward, 0.33 s back, 1.33 s in all. 0.400: 0.80 s, 0.27 s, 1.07 s.
    expect(h).toContain('0.500 light-second')
    expect(h).toMatch(/forward(<!-- -->)?\s*(<!-- -->)?1\.00 s/)
    expect(h).toContain('1.33 s')
    expect(h).toContain('0.400 light-second')
    expect(h).toContain('1.07 s')
    expect(h).toContain('0.33 second')
    expect(h).toContain('only what that one possible')
  })

  it('the invented-tick worked example takes its numbers from the module and is not the real tick', () => {
    const h = html()
    // An invented tick of 2.0 s at 0.5c gives a length of 0.75 light-second: 1.50 s forward and 0.50 s back.
    expect(h).toContain('A small worked example with invented numbers.')
    expect(h).toContain('Try 0.750 light-second.')
    expect(h).toContain('1.50 s')
    expect(h).toContain('This is not the real')
  })

  it('has Steps 4 to 6 and does not say which length fits, or use the words length contraction', () => {
    const h = introduction()
    expect(h).toContain('the pulse is not carried along by the clock')
    expect(h).toContain('Step 5: the rule we keep')
    expect(h).toContain('Step 6: how we find the length')
    expect(h).not.toContain('length contraction')
    expect(h).not.toContain('0.433')
    expect(h).not.toContain('1.155')
  })

  it('the words box has the new length entries', () => {
    const h = html()
    for (const text of ['Length (of the clock)', 'Rest length', 'Length measured by light', 'As seen from the lab']) {
      expect(h).toContain(text)
    }
  })
})

describe('Relativity 6 prediction is about the length of the moving clock', () => {
  const html = () => renderToStaticMarkup(createElement(Experiment6, {})).replace(/&#x27;/g, "'")

  it('asks for the length, with the choices same, shorter and longer, and a length in light-seconds', () => {
    const h = html()
    for (const text of [
      'The clock standing still is <strong>0.5 light-seconds long</strong>',
      'the <strong>length of the moving clock</strong>, as seen from the lab, must be',
      'The same length as at rest',
      'Shorter than at rest',
      'Longer than at rest',
      'how long must it be, in light-seconds? Type a number.',
      'Enter a length in light-seconds',
    ]) {
      expect(h).toContain(text)
    }
  })

  it('no longer offers the old mirror-distance choices', () => {
    const h = html()
    for (const text of ['As far apart as at rest', 'Closer together', 'Farther apart', 'Enter light-seconds"']) {
      expect(h).not.toContain(text)
    }
  })

  it('the three clocks have the length names on the canvas and in the bars', () => {
    const e = runLengthContractionExperiment(0.5)
    const panels = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: 0, running: false }))
    expect(panels).toContain('Rest clock: length 0.500 light-seconds')
    expect(panels).toContain('Moving clock, shorter:')
    expect(panels).not.toContain('mirrors closer together')
  })
})

describe('Relativity 6 Part leads are about length', () => {
  it('Part 1 shows its lead on the page and gives no answer', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {})).replace(/&#x27;/g, "'")
    expect(html).toContain('What we are about to do.')
    expect(html).toContain('First you make two guesses about the length of the moving clock')
    expect(html).toContain('a strip of three bars appears that shows the length of each clock')
    for (const text of ['0.433', '1.155', 'shorter than', 'contraction']) {
      expect(PART_LEADS.part1).not.toContain(text)
    }
  })

  it('every lead speaks of length, not of the distance between the mirrors', () => {
    for (const lead of Object.values(PART_LEADS)) {
      expect(lead).not.toContain('mirrors')
      expect(lead).not.toContain('how far apart')
    }
    expect(PART_LEADS.part2).toContain('see how the length of the moving clock changes with speed')
    expect(PART_LEADS.part2).toContain('from 0.01c to 0.9c')
    expect(PART_LEADS.part3).toContain('Here are the lengths from the Part 1 run, and how we found them')
    expect(PART_LEADS.part4).toContain('explains what the lengths tell us')
  })

  it('Part 2 says the speed changes the drawings but not Part 1, Part 3 or the guesses', () => {
    expect(PART_LEADS.part2).toContain('It does not change Part 1’s pictures, the results in Part 3, or your guesses.')
    expect(PART_LEADS.part3).toContain('Nothing in this Part changes with your guesses or with the speed you choose in Part 2.')
  })
})

describe('Relativity 6 pictures show the length and how it was found', () => {
  const e = runLengthContractionExperiment(0.5)
  const bars = (extra: Record<string, unknown> = {}) =>
    renderToStaticMarkup(createElement(GapBars, { experiment: e, pinkSpeed: null, guesses: null, label: 'x', ...extra }))

  it('every clock panel has a labelled length arrow between its mirrors, at the start and at the end of a run', () => {
    for (const t of [0, 0.4, 1.0, 3]) {
      const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: t, running: false }))
      expect(html.split('length of the clock').length - 1).toBe(3)
    }
  })

  it('the length arrow carries no number (the numbers come in the strip when the run ends)', () => {
    const html = renderToStaticMarkup(createElement(ThreeClockPanels, { geometry: e, labTime: 0, running: false }))
    expect(html).not.toContain('0.433')
  })

  it('the strip is titled, and each bar has the pulse trips that gave its length, from the module', () => {
    const html = bars()
    expect(html).toContain('Length of each clock, seen from the lab')
    expect(html).toContain('pulse: 0.500 s across, tick 1.000 s')
    expect(html).toContain('pulse: 1.000 s forward, 0.333 s back, tick 1.333 s')
    expect(html).toContain('pulse: 0.866 s forward, 0.289 s back, tick 1.155 s')
    expect(html).toContain('length of the clock = distance between its mirrors, in light-seconds')
  })

  it('Drawing A has its own title and the same trip times for the speed chosen', () => {
    const e8 = runLengthContractionExperiment(0.8)
    const html = renderToStaticMarkup(createElement(GapBars, { experiment: e8, pinkSpeed: 0.8, guesses: null, label: 'x' }))
    expect(html).toContain('Length of the moving clock at your speed')
    expect(html).toContain('your speed: 0.8c')
    expect(html).toContain('pulse: 1.500 s forward, 0.167 s back, tick 1.667 s')
  })

  it('the trip times do not depend on the guesses, and the white marks still appear', () => {
    const plain = bars()
    const guessed = bars({ guesses: { choice: 'shorter', gap: 0.45 } })
    expect(guessed).toContain('pulse: 0.866 s forward, 0.289 s back, tick 1.155 s')
    expect(guessed).toContain('YOUR GUESS: 0.45 light-seconds long')
    expect(plain).not.toContain('YOUR GUESS')
  })

  it('the source line under the panels separates measured, calculated here and imagined', () => {
    const html = renderToStaticMarkup(createElement(Experiment6, {}))
    expect(html).toContain('Measured:')
    expect(html).toContain('nothing on this page')
    expect(html).toContain('Calculated here from the speed:')
    expect(html).toContain('Imagined for the question:')
  })
})

describe('Relativity 6 captions speak of length and connect light\'s travel to it', () => {
  const e = runLengthContractionExperiment(0.5)
  const bars = (guesses: boolean, pink = false, exp = e) =>
    renderToStaticMarkup(createElement(BarsCaption, { name: 'the length bars', experiment: exp, guesses, pink })).replace(/&#x27;/g, "'")

  it('the panels caption names the length, the double arrow and the shorter clock', () => {
    const html = renderToStaticMarkup(createElement(PanelsCaption)).replace(/&#x27;/g, "'")
    for (const text of ['The only difference is the <strong>length</strong> of the clock', 'is the same length as at rest', 'is shorter.', 'double arrow', 'length of the clock', 'compare lengths by eye', 'the tick is shorter for the clock that is shorter']) {
      expect(html).toContain(text)
    }
    for (const text of ['closer together', 'as far apart as at rest', 'distance between their mirrors']) {
      expect(html).not.toContain(text)
    }
  })

  it('the bars caption explains how each length was found, with the module\'s trip times', () => {
    const html = bars(true)
    for (const text of [
      'How each bar',
      'distance = speed',
      'the pulse crosses in 0.500 s',
      '1 × 0.5 = 0.500 light-seconds',
      'The trip times are written under each bar',
    ]) {
      expect(html).toContain(text)
    }
  })

  it('has five look-at items in three parts when the guess is drawn, the trip-time item with the real numbers', () => {
    const html = bars(true)
    expect(html.match(/<strong>Look at:<\/strong>/g)?.length).toBe(5)
    expect(html.match(/<strong>What it means:<\/strong>/g)?.length).toBe(5)
    expect(html.match(/<strong>Why it matters:<\/strong>/g)?.length).toBe(5)
    expect(html).toContain('1.000 s forward and 0.333 s back for violet; 0.866 s forward and 0.289 s back for amber')
    expect(html).toContain('the violet length 0.500 gives a tick of 1.333 s, and the amber length 0.433 gives a tick of 1.155 s')
    expect(html).toContain('a different length gives a different round trip')
  })

  it('without guesses there are four look-at items and no white-mark text; Drawing A speaks of length against speed', () => {
    const html = bars(false)
    expect(html.match(/<strong>Look at:<\/strong>/g)?.length).toBe(4)
    expect(html).not.toContain('YOUR GUESS')
    const pink = bars(false, true, runLengthContractionExperiment(0.8))
    expect(pink).toContain('Its length gets smaller as the speed goes up')
    expect(pink).toContain('0.4975')
    expect(pink).toContain('the length found in Part 1 depends on the speed')
  })

  it('no caption uses the old mirror-gap wording or gives the mechanism or the name of the effect', () => {
    for (const html of [bars(true), bars(false), bars(false, true, runLengthContractionExperiment(0.8))]) {
      for (const text of ['closer together', 'as far apart as at rest', 'mirror-gap', 'length contraction']) {
        expect(html).not.toContain(text)
      }
    }
  })
})

describe('Relativity 6 results put the length first and say how it was found', () => {
  const html = (v = 0.5, choice: LengthChoice = 'shorter', gap = 0.45) =>
    renderToStaticMarkup(createElement(Part3Results, { r: runLengthContractionExperiment(v), submitted: { choice, gap } })).replace(/&#x27;/g, "'").replace(/<!-- -->/g, '')

  it('the source note separates measured, calculated here and imagined, with lengths in the words', () => {
    const h = html()
    for (const text of ['Where these numbers come from.', 'nothing on this page', 'the lengths, tick times and light speeds', 'the violet clock, with its length kept the same as at rest']) {
      expect(h).toContain(text)
    }
    expect(h).not.toContain('mirror gaps')
  })

  it('leads with the length we are trying to find, then how it was found from light\'s travel time, then the tick time dilation gives', () => {
    const h = html()
    const order = ['The length we are trying to find.', 'How we found it: light', 'The tick that time dilation gives (']
    const at = order.map((t) => h.indexOf(t))
    expect(at.every((i) => i > -1)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
    for (const text of ['distance = speed × time', 'At rest the pulse crosses in 0.500 s, which is 0.500 light-seconds', 'we look for the length whose tick is 1.155 s', 'the link between the light']) {
      expect(h).toContain(text)
    }
  })

  it('each clock has its length as the headline and one sentence linking its trips to its tick, from the module', () => {
    const h = html()
    for (const text of [
      'Length, seen from the lab:',
      '0.500 light-seconds (1.000 of the length at rest)',
      '0.433 light-seconds (0.866 of the length at rest)',
      'The pulse’s trips took 1.000 s forward and 0.333 s back, so this length gives a tick of 1.333 s',
      'The pulse’s trips took 0.866 s forward and 0.289 s back, so this length gives a tick of 1.155 s',
      'The pulse crosses in 0.500 s, so one tick takes 1.000 s',
    ]) {
      expect(h).toContain(text)
    }
  })

  it('the notes say longer, shorter or the same in words, and give each Why it matters', () => {
    const h = html()
    expect(h).toContain('0.179 s longer than the tick time dilation gives')
    expect(h).toContain('0.067 shorter than the rest length')
    expect(h).toContain('the same as the tick time dilation gives')
    expect(h).toContain('with the length unchanged, this tick does not fit')
    expect(h).toContain('with this length, the tick fits')
    expect(h.match(/Why it matters:/g)?.length).toBeGreaterThanOrEqual(5)
  })

  it('shows the guess as lengths beside the results, with the tags and no verdict', () => {
    const h = html(0.5, 'longer', 0.6)
    expect(h).toContain('You guessed that the length of the moving clock must be longer than at rest, 0.6 light-seconds long')
    expect(h).toContain('Length, shorter clock: 0.433 light-seconds')
    expect(h).toContain('Your guesses are drawn on Part 1')
    for (const text of ['right', 'wrong', 'matched', 'correct']) {
      expect(h.toLowerCase()).not.toContain(` ${text} `)
    }
  })

  it('the results are the same for any guess, and the old mirror-distance wording is gone', () => {
    const a = html(0.5, 'same', 0.1).replace(/You guessed[^<]*/, '')
    const b = html(0.5, 'longer', 9).replace(/You guessed[^<]*/, '')
    expect(a).toBe(b)
    for (const text of ['Distance between the mirrors', 'mirrors as far apart as at rest', 'mirrors closer together', 'Mirrors ']) {
      expect(html()).not.toContain(text)
    }
  })

  it('works at the other speeds without any NaN', () => {
    for (const v of [0.01, 0.1, 0.3, 0.8, 0.9]) {
      expect(html(v)).not.toContain('NaN')
    }
  })
})

describe('Relativity 6 tutor leads with length and uses light as a tape measure', () => {
  const run = runLengthContractionExperiment(0.5)
  const explanation = (choice: LengthChoice = 'shorter', g = 0.45, r = run) =>
    renderToStaticMarkup(createElement(Experiment6Explanation, { run: r, predictionChoice: choice, prediction: g })).replace(/&#x27;/g, "'").replace(/<!-- -->/g, '')

  it('the questions ask about trip times and length, then the compare step names the lengths', () => {
    const html = renderToStaticMarkup(createElement(Experiment6Tutor, { run, predictionChoice: 'same', prediction: 0.45 })).replace(/&#x27;/g, "'")
    expect(html).toContain('what a trip time tells us about a length')
    expect(html).not.toContain('closer together')
  })

  it('the explanation is in length order: what we found, how, what fits, by how much, a name, only along the motion', () => {
    const h = explanation()
    const order = ['1. What we found.', '2. How we found it: light as a tape measure.', '3. What fits.', '4. By how much.', '5. A name.', '6. Only along the motion.', '7. Two things to remember.', 'Your guesses, marked.', 'Try it in Part 2.']
    const at = order.map((t) => h.indexOf(t))
    expect(at.every((i) => i > -1)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
    expect(h).not.toContain('NaN')
  })

  it('what we found and what fits use the module\'s lengths and ticks', () => {
    const h = explanation()
    for (const text of [
      'a moving clock is <strong>shorter</strong> than the same clock standing still',
      'At 0.5c it is 0.433 light-seconds long, against 0.500 at rest',
      'distance = speed × time',
      'the echo told us how far the cliff was',
      '0.500 s across means 0.500 light-seconds',
      'so one tick took 1.333 seconds',
      'so one tick took 1.155 seconds',
      'Only the length 0.433 light-seconds gives a tick of 1.155 seconds',
      'which does not fit',
      '0.500 × 0.866 is about 0.433',
    ]) {
      expect(h).toContain(text)
    }
  })

  it('the length that fits is found from the tick at every speed, and the name comes only after it', () => {
    for (const v of [0.01, 0.1, 0.3, 0.6, 0.8, 0.9]) {
      const r = runLengthContractionExperiment(v)
      const h = explanation('shorter', 0.4, r)
      expect(h).toContain(`Only the length ${r.shorterLength.lengthInLab.toFixed(3)} light-seconds gives a tick of ${r.timeDilationTick.toFixed(3)} seconds`)
      expect(h.indexOf('length contraction')).toBeGreaterThan(h.indexOf('3. What fits.'))
    }
  })

  it('the tutor does not describe the moving clock\'s own display and does not use the old mirror wording', () => {
    const h = explanation()
    for (const text of ['own display', 'closer together', 'as far apart as at rest', 'the gap was']) {
      expect(h).not.toContain(text)
    }
  })

  it('marks the guess as longer, shorter or the same as the length that fits, with no verdict', () => {
    expect(explanation('longer', 0.6)).toContain('0.167 light-seconds more than that length')
    expect(explanation('same', 0.4)).toContain('0.033 light-seconds less than that length')
    expect(explanation('shorter', 0.433)).toContain('the same as that length, to three decimals')
    for (const h of [explanation('longer', 0.6), explanation('same', 0.4)]) {
      expect(h).not.toMatch(/\b(wrong|correct|right answer)\b/i)
    }
  })
})

