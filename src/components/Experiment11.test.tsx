import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { TimeChoice } from '../physics/lorentzTransform'
import { PART1_CLOCKS_SCALE_END, PART2_CLOCKS_SCALE_END } from '../physics/lorentzTransform'
import { Experiment11, PART_LEADS, Part3Results11 } from './Experiment11'
import { CheckUpTable, ClocksPanel, DiagramCaption11, LookFor11, WorkedMoment11 } from './Experiment11Pictures'
import { AxesSketch } from './Experiment11Sketch'
import { Experiment11Explanation, Experiment11Tutor } from './Experiment11Tutor'
import { SpacetimeDiagram } from './Experiment8Pictures'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marker, the panel and the two orange axes appear
// exactly when they should. They do not check how the page looks.
const GUESSES: TimeChoice[] = ['same', 'different']
const SPEEDS = [0, 0.01, 0.1, 0.3, 0.5, 0.8, 0.9]
const END = 10
const plain = (html: string) => html.replace(/&#x27;/g, "'").replace(/<!-- -->/g, '')

describe('Relativity 11 renders', () => {
  it('the page at rest shows Part 1, links, words box and Start over, but no later Part, no marker and no block-frame answer', () => {
    const html = renderToStaticMarkup(createElement(Experiment11, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('CALCULATE')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only)')
    expect(html).not.toContain('NaN')
  })

  it('Start over and Run are greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(Experiment11, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
    expect(html).not.toContain('0c (at rest)')
  })

  it("the introduction uses the chapters' titles and light-seconds, defines event, frame and axis, and has the sketch", () => {
    const html = plain(renderToStaticMarkup(createElement(Experiment11, {})))
    for (const text of [
      'At the same time... for whom?',
      'Drawing Spacetime',
      'Same time, different line',
      'Does motion change length?',
      '<strong>event</strong>',
      '<strong>frame</strong>',
      '<strong>axis</strong>',
      'What a frame’s own axes are',
      'Your guess and the real picture.',
      'A frame’s own axes.',
    ]) {
      expect(html.replace(/’/g, '’')).toContain(text)
    }
    expect(html.replace('Experiment 11 — The Block', '')).not.toMatch(/Experiment [1-9]\b/)
    expect(html).not.toMatch(/\b[Rr]ods?\b/)
    expect(html).not.toMatch(/\bls\b/)
  })

  it('the words box has the formulas with a worked example at 0.6c, and gives neither block-frame answer', () => {
    const html = plain(renderToStaticMarkup(createElement(Experiment11, {})))
    expect(html).toContain('Formula 1: the block’s own time')
    expect(html).toContain('1.25 × (0.5 − 0.6 × 0.2) = 0.475 s')
    expect(html).toContain('1.25 × (0.2 − 0.6 × 0.5) = -0.125 light-seconds')
    expect(html).not.toContain('0.250')
  })

  it('the links are listed from the start, each opens in a new tab, and the gaps are not linked', () => {
    const html = renderToStaticMarkup(createElement(Experiment11, {}))
    for (const href of [
      'https://www.einstein-online.info/en/explandict/lorentz-transformation-2/',
      'https://www.einstein-online.info/en/spacetime/',
      'https://www.einstein-online.info/en/spotlight/now/',
      'https://www.einstein-online.info/en/?p=11618',
      'https://www.einstein-online.info/en/?p=6554',
      'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_rel_sim/index.html',
      'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/Special_relativity_rel_sim/index.html',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('fnal.gov')
    expect(html).not.toContain('arxiv.org')
  })

  it('the leads of the four Parts give no answer', () => {
    for (const lead of Object.values(PART_LEADS)) {
      expect(lead).not.toMatch(/0\.250/)
      expect(lead).not.toMatch(/same time in the block/i)
    }
    expect(PART_LEADS.part1).toContain('0.5c')
  })

  it('the sketch labels both pairs, uses the module’s 0.25 lean, and shows no block, flash or event', () => {
    const html = plain(renderToStaticMarkup(createElement(AxesSketch)))
    for (const text of ['The lab’s time axis', 'The lab’s space axis', 'A moving frame’s time axis', 'A moving frame’s space axis', 'How to read this sketch', 'A worked moment', 'Where this picture comes from']) {
      expect(html).toContain(text)
    }
    expect(html).toContain('0.25')
    expect(html).not.toMatch(/Flash released|Back end reached/)
    expect(html).not.toContain('NaN')
  })

  it('the diagram draws the orange axes only when asked, and names them on the canvas and in the key', () => {
    const diagram = spacetimeDiagramFor(runSimultaneityExperiment(0.5))
    const base = { diagram, animTime: END, title: 't', label: 'x' }
    const without = renderToStaticMarkup(createElement(SpacetimeDiagram, { ...base, showSameMomentLines: true }))
    expect(without).not.toContain('#fb923c')
    const withAxes = plain(renderToStaticMarkup(createElement(SpacetimeDiagram, { ...base, showSameMomentLines: true, blockAxes: true })))
    expect(withAxes).toContain('#fb923c')
    expect(withAxes).toContain('The block’s own time axis')
    expect(withAxes).toContain('The block’s own space axis')
    expect(withAxes).toContain('Block’s own time axis')
    expect(withAxes).toContain('Same-moment line')
    expect(withAxes).not.toContain('A level line')
    expect(withAxes).not.toContain('NaN')
  })

  it('the panel labels both rows, and its numbers come from the run, at every speed, with no NaN', () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const html = plain(renderToStaticMarkup(createElement(ClocksPanel, { result, scaleEnd: PART2_CLOCKS_SCALE_END, guess: null, pinkSpeed: v, label: 'x' })))
      expect(html).toContain('The two events on two sets of clocks'.toUpperCase())
      expect(html).toContain('The lab’s clocks')
      expect(html).toContain('The block’s own clocks')
      expect(html).toContain('0.250 s')
      expect(html).not.toContain('NaN')
    })
    const half = plain(renderToStaticMarkup(createElement(ClocksPanel, { result: runSimultaneityExperiment(0.5), scaleEnd: PART1_CLOCKS_SCALE_END, guess: null, pinkSpeed: null, label: 'x' })))
    expect(half).toContain('Back end reached 0.144 s')
    expect(half).toContain('Front end reached 0.433 s')
  })

  it('the white marker appears only with a guess, never changes a number, and differs only in the marker', () => {
    const result = runSimultaneityExperiment(0.5)
    const render = (guess: TimeChoice | null) =>
      renderToStaticMarkup(createElement(ClocksPanel, { result, scaleEnd: PART1_CLOCKS_SCALE_END, guess, pinkSpeed: null, label: 'x' }))
    expect(render(null)).not.toContain('YOUR GUESS')
    GUESSES.forEach((g) => {
      const html = plain(render(g))
      expect(html).toContain('YOUR GUESS (a marker only):')
      expect(html).not.toContain('NaN')
    })
    const strip = (g: TimeChoice) => render(g).replace(/<g><line[^>]*stroke-dasharray="5 4"><\/line><rect[\s\S]*?YOUR GUESS[\s\S]*?<\/g>/, '')
    expect(strip('same')).toBe(strip('different'))
    expect(plain(render('same'))).toContain('the two events will come out at the same time')
    expect(plain(render('different'))).toContain('the two events will come out at different times')
  })

  it('the caption gives no numbers before the panel; the worked moment and look-fors give the quoted numbers', () => {
    const result = runSimultaneityExperiment(0.5)
    const before = renderToStaticMarkup(createElement(DiagramCaption11, { speedLabel: '0.5c', part: 1 }))
    expect(before).toContain('How to read this diagram')
    expect(before).not.toContain('0.250')
    expect(before).not.toContain('Look at:')
    const worked = plain(renderToStaticMarkup(createElement(WorkedMoment11, { result, part: 1 })))
    expect(worked).toContain('1.155')
    expect(worked).toContain('0.250 s')
    const looks = plain(renderToStaticMarkup(createElement(LookFor11, { result, part: 1 })))
    for (const text of ['Look at:', 'What it means:', 'Why it matters:', '0.289 s apart']) expect(looks).toContain(text)
    const eight = plain(renderToStaticMarkup(createElement(WorkedMoment11, { result: runSimultaneityExperiment(0.8), part: 2 })))
    expect(eight).toContain('1.667')
    expect(eight).toContain('0.250 s')
  })

  it('the check-up table reads "The same" in all four rows', () => {
    const html = plain(renderToStaticMarkup(createElement(CheckUpTable, { result: runSimultaneityExperiment(0.5) })))
    expect(html.match(/The same/g)).toHaveLength(4)
    expect(html).toContain('0.250 s')
    expect(html).toContain('-0.250 light-seconds')
    expect(html).not.toContain('NaN')
  })

  it('the results have a note under each block, the guess as a tag, and no "It is actually" line', () => {
    GUESSES.forEach((g) => {
      const html = plain(renderToStaticMarkup(createElement(Part3Results11, { r: runSimultaneityExperiment(0.5), submitted: g })))
      expect(html.match(/What this table tells us\./g)?.length).toBe(3)
      expect(html).toContain('your guess')
      expect(html).not.toMatch(/It is actually|matched|\bright\b|\bwrong\b/)
      expect(html).toContain('Check-up')
      expect(html).not.toContain('NaN')
    })
  })

  it('the tutor names the marker and the two rows, and marks the guess with no score', () => {
    const r = runSimultaneityExperiment(0.5)
    GUESSES.forEach((g) => {
      const prompts = plain(renderToStaticMarkup(createElement(Experiment11Tutor, { result: r, guess: g })))
      expect(prompts).toContain('The block’s own clocks')
      const html = plain(renderToStaticMarkup(createElement(Experiment11Explanation, { result: r, guess: g })))
      for (const text of ['1. This confirms what you already knew', 'You already knew this', '5. Your guess, marked.', '6. Try it in Part 2.', '1.155 × (0.144 − 0.5 × -0.144) = 0.250', '1.155 × (0.433 − 0.5 × 0.433) = 0.250']) {
        expect(html).toContain(text)
      }
      expect(html).not.toContain('NaN')
      expect(html).not.toMatch(/\bwrong\b|\bscore\b/i)
    })
  })

  it('the Part 2 diagram draws at every speed, with the orange axes and no NaN', () => {
    const scale = [0, 0.9].map((v) => spacetimeDiagramFor(runSimultaneityExperiment(v)))
    SPEEDS.forEach((v) => {
      const diagram = spacetimeDiagramFor(runSimultaneityExperiment(v))
      const html = renderToStaticMarkup(createElement(SpacetimeDiagram, { diagram, animTime: END, title: 't', label: 'x', scaleDiagrams: scale, pinkSpeed: v, showSameMomentLines: true, blockAxes: true }))
      expect(html).toContain('#fb923c')
      expect(html).not.toContain('NaN')
    })
  })
})
