import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  PART1_STRIP_SCALE_END,
  PART2_STRIP_SCALE_END,
  runSimultaneityExperiment,
} from '../physics/relativityOfSimultaneityExperiment'
import type { FrameAgreementChoice, OrderChoice } from '../physics/relativityOfSimultaneityExperiment'
import { Experiment7, PART_LEADS, Part3Results } from './Experiment7'
import { EventStrip, PanelsCaption, SimultaneityPanels, StripCaption } from './Experiment7Pictures'
import { Experiment7Explanation, Experiment7Tutor } from './Experiment7Tutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white markers appear exactly when guesses are given.
// They do not check how the page looks.
const ORDERS: OrderChoice[] = ['same', 'back', 'front']
const AGREEMENTS: FrameAgreementChoice[] = ['agree', 'disagree']
const PART2_SPEEDS = [0, 0.01, 0.1, 0.3, 0.5, 0.8, 0.9]

describe('Relativity 7 renders', () => {
  it('the whole page renders at rest: Part 1, links, words box and Start over, but no later Part and no marker', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only):')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the speed buttons have left the first screen, and the prediction is written for 0.5c', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    expect(html).not.toContain('Block speed')
    expect(html).not.toContain('0c (at rest)')
    expect(html).toContain('Guess 1:')
    expect(html).toContain('Guess 2:')
    expect(html).toContain('<strong>0.5c</strong>')
  })

  it('the introduction no longer hands over the answers, and uses the chapters\' titles', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    expect(html).not.toContain('sees the flash reach both ends together')
    expect(html).not.toContain('The lab sees something different')
    for (const text of [
      'Step 1: a block and a flash.',
      'Step 2: two events.',
      'Step 3: who is asking, and with which clocks.',
      'Does motion change length?',
      'Why can’t light go faster?',
      'A moving clock',
      'Two clocks at rest',
      'Your guesses and the real pictures.',
      'a marker only',
      'light-second</strong> is the distance light travels in one second',
    ]) {
      expect(html).toContain(text)
    }
    // Old chapter numbers are gone from the wording (the page's own title is "Experiment 7").
    expect(html).not.toContain('Experiment 3')
    expect(html).not.toContain('Experiment 5')
    expect(html).not.toContain('Experiment 6')
  })

  it('the Part leads give no answer', () => {
    for (const lead of Object.values(PART_LEADS)) {
      expect(lead).not.toMatch(/back end first|front end first|disagree|is shorter|NaN/)
    }
    expect(PART_LEADS.part1).toContain('0.5c')
  })

  it('the links from the start are the three NASA pages; the two Einstein Online pages are held back; the 1905 paper is not linked', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    expect(html).toContain('science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space')
    expect(html).toContain('how_fast_is_the_speed.htm')
    expect(html).toContain('pwg.gsfc.nasa.gov/stargaze/Lframes1.htm')
    expect(html).not.toContain('einstein-online.info')
    expect(html).not.toContain('fourmilab')
    expect(html).toContain('target="_blank"')
  })

  it('the words box has the new entries and withholds the arrival-time sums', () => {
    const html = renderToStaticMarkup(createElement(Experiment7, {}))
    for (const text of ['Simultaneity', 'Relativity of simultaneity', 'Event', 'Block’s own clocks, block’s own time', 'Formula, time = distance ÷ speed', '0.25 ÷ 1 = 0.25 second']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('÷ (c')
  })
})

describe('Relativity 7 pictures', () => {
  it('the panels render at every speed with their labels on the canvas and no NaN', () => {
    for (const v of PART2_SPEEDS) {
      const r = runSimultaneityExperiment(v)
      for (const t of [0, r.backEventLabTime / 2, r.backEventLabTime, r.frontEventLabTime, Math.max(r.frontEventLabTime, r.rodFrameEventTime)]) {
        const html = renderToStaticMarkup(createElement(SimultaneityPanels, { geometry: r, playTime: t, speedLabel: `${v}c` }))
        expect(html).not.toContain('NaN')
        for (const text of ['Back end', 'Front end', 'Flash released here', 'THE BLOCK’S OWN POINT OF VIEW', 'THE LAB’S POINT OF VIEW']) {
          expect(html).toContain(text)
        }
      }
    }
  })

  it('the readouts show a time only once the dot has turned green', () => {
    const r = runSimultaneityExperiment(0.5)
    const early = renderToStaticMarkup(createElement(SimultaneityPanels, { geometry: r, playTime: 0, speedLabel: '0.5c' }))
    expect(early).not.toContain('0.144 s')
    const late = renderToStaticMarkup(createElement(SimultaneityPanels, { geometry: r, playTime: r.frontEventLabTime, speedLabel: '0.5c' }))
    expect(late).toContain('0.144 s')
    expect(late).toContain('0.433 s')
  })

  it('the strip has no white marker without guesses, and one marker per guess with them', () => {
    const r = runSimultaneityExperiment(0.5)
    const plain = renderToStaticMarkup(createElement(EventStrip, { result: r, scaleEnd: PART1_STRIP_SCALE_END, pinkSpeed: null, guesses: null, label: 'x' }))
    expect(plain).not.toContain('YOUR GUESS (')
    expect(plain).toContain('back end 0.144 s')
    expect(plain).toContain('front end 0.433 s')
    expect(plain).toContain('both ends 0.250 s')
    expect(plain).toContain('gap 0.289 s')
    for (const order of ORDERS) {
      for (const agreement of AGREEMENTS) {
        const html = renderToStaticMarkup(createElement(EventStrip, { result: r, scaleEnd: PART1_STRIP_SCALE_END, pinkSpeed: null, guesses: { order, agreement }, label: 'x' }))
        expect(html).not.toContain('NaN')
        expect(html.match(/YOUR GUESS \(a marker only\)/g)?.length).toBe(2)
        expect(html).toContain(order === 'same' ? 'at the same time' : order === 'back' ? 'the back end first' : 'the front end first')
        expect(html).toContain(agreement === 'agree' ? 'would agree with the lab' : 'would disagree with the lab')
      }
    }
  })

  it('the strip renders at every Part 2 speed, including 0c (dots on top of each other), with the speed in pink and no marker', () => {
    for (const v of PART2_SPEEDS) {
      const html = renderToStaticMarkup(createElement(EventStrip, { result: runSimultaneityExperiment(v), scaleEnd: PART2_STRIP_SCALE_END, pinkSpeed: v, guesses: null, label: 'x' }))
      expect(html).not.toContain('NaN')
      expect(html).toContain(`your speed: ${v}c`)
      expect(html).not.toContain('YOUR GUESS (')
    }
    const rest = renderToStaticMarkup(createElement(EventStrip, { result: runSimultaneityExperiment(0), scaleEnd: PART2_STRIP_SCALE_END, pinkSpeed: 0, guesses: null, label: 'x' }))
    expect(rest).toContain('gap 0.000 s')
  })

  it('PanelsCaption (from the start) names the elements but gives no times and no answer', () => {
    const html = renderToStaticMarkup(createElement(PanelsCaption))
    expect(html).toContain('How to read the two pictures.')
    expect(html).toContain('Playback time')
    expect(html).not.toContain('0.144')
    expect(html).not.toContain('0.433')
    expect(html).not.toMatch(/disagree|back end first/)
  })

  it('StripCaption has the worked numbers from the module and three-part look-fors', () => {
    const r = runSimultaneityExperiment(0.5)
    const html = renderToStaticMarkup(createElement(StripCaption, { result: r, guesses: true, pink: false }))
    for (const text of ['How to read the strip of event times.', '0.25 ÷ 1 = 0.250 s', '0.2165 ÷ 1.5 = 0.144 s', '0.2165 ÷ 0.5 = 0.433 s', 'has no size, it just points at the choice you made']) {
      expect(html).toContain(text)
    }
    expect(html.match(/<strong>Look at:<\/strong>/g)?.length).toBe(5)
    expect(html.match(/<strong>What it means:<\/strong>/g)?.length).toBe(5)
    expect(html.match(/<strong>Why it matters:<\/strong>/g)?.length).toBe(5)
    const noGuess = renderToStaticMarkup(createElement(StripCaption, { result: r, guesses: false, pink: false }))
    expect(noGuess.match(/<strong>Look at:<\/strong>/g)?.length).toBe(4)
    const pink = renderToStaticMarkup(createElement(StripCaption, { result: runSimultaneityExperiment(0.8), guesses: false, pink: true }))
    expect(pink).toContain('How to read the two views at your speed.')
    expect(pink).toContain('0.15 ÷ 1.8 = 0.083 s'.replace('0.15', '0.1500'))
    expect(pink).toContain('0.667 s at 0.8c')
    expect(pink).not.toContain('NaN')
  })
})

describe('Relativity 7 caption at the edges of the speed range', () => {
  it('at 0c the worked moment does not say the block is shorter or that an end moves, and at 0.01c it shows enough decimals', () => {
    const rest = renderToStaticMarkup(createElement(StripCaption, { result: runSimultaneityExperiment(0), guesses: false, pink: true }))
    expect(rest).toContain('Neither end moves')
    expect(rest).not.toContain('the block is shorter')
    expect(rest).not.toContain('NaN')
    const tiny = renderToStaticMarkup(createElement(StripCaption, { result: runSimultaneityExperiment(0.01), guesses: false, pink: true }))
    expect(tiny).toContain('the block is shorter, 0.49997 light-seconds')
    expect(tiny).not.toContain('NaN')
  })
})

describe('Relativity 7 results and tutor', () => {
  it('the results take their numbers from the module, tag the guesses and have a note under each block', () => {
    const r = runSimultaneityExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Part3Results, { r, submitted: { order: 'back', agreement: 'disagree' } }))
    for (const text of ['0.144 s', '0.433 s', '0.289 s', '0.250 s', '0.433 light-seconds', 'your guess 1', 'your guess 2', 'the back end first', 'disagree with the lab', 'Where these numbers come from.']) {
      expect(html).toContain(text)
    }
    expect(html.match(/What this table tells us\./g)?.length).toBe(3)
    // The old line that stated the actual result next to the guess is gone (the marking is the tutor's).
    expect(html).not.toContain('Actual result')
    expect(html).not.toMatch(/matched|right|wrong/)
    expect(html).not.toContain('NaN')
  })

  it('the tutor asks about the pictures and the strip, and points to the white markers by name', () => {
    const r = runSimultaneityExperiment(0.5)
    const html = renderToStaticMarkup(createElement(Experiment7Tutor, { result: r, predictionOrder: 'same', predictionAgreement: 'agree' }))
    expect(html).toContain('Look at the two pictures and at the strip of event times.')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks each guess with no score and no verdict, and tries 0c, 0.1c, 0.8c and 0.9c from the module', () => {
    const r = runSimultaneityExperiment(0.5)
    for (const order of ORDERS) {
      for (const agreement of AGREEMENTS) {
        const html = renderToStaticMarkup(createElement(Experiment7Explanation, { result: r, predictionOrder: order, predictionAgreement: agreement }))
        expect(html).toContain('6. Your guesses, marked.')
        expect(html).toContain('back end first')
        expect(html).toContain('0.289 seconds before the front end')
        if (agreement === 'disagree') expect(html).toContain('disagree with')
        else expect(html).not.toContain('disagree with')
        expect(html).toContain('7. Try it in Part 2.')
        for (const gap of ['0.000', '0.050', '0.667', '1.032']) expect(html).toContain(gap)
        expect(html).toContain('A moving clock')
        expect(html).toContain('Does motion change length?')
        expect(html).not.toMatch(/\bright\b|\bwrong\b|correct|score:/)
        expect(html).not.toContain('NaN')
      }
    }
  })

  it('at 0c the marking says the two ends were reached at the same time (the old text always said the back end first)', () => {
    const rest = runSimultaneityExperiment(0)
    const html = renderToStaticMarkup(createElement(Experiment7Explanation, { result: rest, predictionOrder: 'same', predictionAgreement: 'agree' }))
    expect(html).toContain('two ends at the same time')
    expect(html).not.toContain('seconds before the front end')
  })
})
