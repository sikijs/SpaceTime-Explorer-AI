import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PRESET_EVENTS } from '../physics/lightCones'
import { runCauseBeforeEffectExperiment } from '../physics/causeBeforeEffect'
import type { PredictionAnswer } from '../physics/causeBeforeEffect'
import { BarsCaption, CauseBeforeEffectExperiment, Diagram, DiagramCaption, ResultsBars, StripCaption, referenceEntries } from './CauseBeforeEffectExperiment'
import { ChainFigure, SameMomentFigure, ScrambledFigure, SeeingFigure, SpeedStrip } from './CauseBeforeEffectFigures'
import { CauseBeforeEffectTutor } from './CauseBeforeEffectTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess ring appears exactly when a guess is given
// and the strip is drawn. They do not check how the page looks.
const GUESSES: PredictionAnswer[] = ['yes', 'same-moment', 'no']
const SPEEDS = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]
const PART1 = PRESET_EVENTS[3]

describe('Spacetime Geometry 3 renders', () => {
  it('the page at rest shows the introduction, five pictures, links, words box, Part 1 and Start over, and no later Part, ring or answer', () => {
    const html = renderToStaticMarkup(createElement(CauseBeforeEffectExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Your guess and the real pictures')
    expect(html).toContain('How to read Figure A')
    expect(html).toContain('How to read Figure B')
    expect(html).toContain('How to read Figure C')
    expect(html).toContain('How to read Figure D')
    expect(html).toContain('How to read Figure E')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('Which event each observer finds first, for every speed')
    expect(html).not.toContain('only recorded here')
    expect(html).not.toContain('Your prediction was')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Experiment 3 —')
    expect(html).not.toContain('Working out a possible cause')
    expect(html).not.toContain('Above means later')
    expect(html).not.toContain('The flip speed')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest, and Run is disabled until a prediction is chosen', () => {
    const html = renderToStaticMarkup(createElement(CauseBeforeEffectExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('every link opens in a new tab, and there are seven', () => {
    const html = renderToStaticMarkup(createElement(CauseBeforeEffectExperiment, {}))
    const links = html.match(/<a [^>]*>/g) ?? []
    expect(links.length).toBe(7)
    links.forEach((l) => expect(l).toContain('target="_blank"'))
  })

  it('the figures render, label their parts, and use no white', () => {
    for (const html of [ChainFigure, ScrambledFigure, SeeingFigure, SameMomentFigure].map((f) => renderToStaticMarkup(createElement(f)))) {
      expect(html).not.toContain('NaN')
      expect(html).not.toContain('#ffffff')
    }
    expect(renderToStaticMarkup(createElement(ChainFigure))).toContain('Flash arrives at the switch')
    expect(renderToStaticMarkup(createElement(ScrambledFigure))).toContain('IMAGINED')
    expect(renderToStaticMarkup(createElement(SeeingFigure))).toContain('A careful observer')
    expect(renderToStaticMarkup(createElement(SameMomentFigure))).toContain('tilted')
  })

  it('the setup diagram at rest draws no cone and no lines', () => {
    const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 3, passingSpeed: 0.3, progress: null }))
    expect(html).not.toContain('Teal: inside the cone')
    expect(html).not.toContain('Sky-blue line')
    expect(html).not.toContain('NaN')
  })

  it('the finished diagram draws the cone key and has no guess ring (the ring lives on the strip)', () => {
    const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 3, passingSpeed: 0.3, progress: 1 }))
    expect(html).toContain('Teal: inside the cone')
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('NaN')
  })

  it('the strip draws the white ring and the YOUR GUESS box for each answer, and a different place for each', () => {
    const rings = GUESSES.map((g) => {
      const html = renderToStaticMarkup(createElement(SpeedStrip, { event: PART1, passingSpeed: 0.3, guess: g }))
      expect(html).toContain('>YOUR GUESS<')
      expect(html).toContain('#ffffff')
      expect(html).not.toContain('NaN')
      return html.match(/<circle cx="([0-9.]+)"[^>]*stroke="#ffffff"/)?.[1]
    })
    expect(new Set(rings).size).toBe(3)
  })

  it('the strip draws no ring without a guess, none for a place the strip does not have, and the guess never changes the strip itself', () => {
    const none = renderToStaticMarkup(createElement(SpeedStrip, { event: PART1, passingSpeed: 0.3 }))
    expect(none).not.toContain('>YOUR GUESS<')
    const inside = renderToStaticMarkup(createElement(SpeedStrip, { event: PRESET_EVENTS[0], passingSpeed: 0.3, guess: 'yes' }))
    expect(inside).not.toContain('>YOUR GUESS<')
    // The stretches drawn are the same with or without a guess: only the white ring and its box are added.
    const withGuess = renderToStaticMarkup(createElement(SpeedStrip, { event: PART1, passingSpeed: 0.3, guess: 'no' }))
    expect(withGuess).toContain(none.replace('</svg>', '').replace(/^<svg[^>]*>/, '').trim().slice(0, 200))
  })

  it('the Part 2 strip is framed and titled in the Part 2 colour and has no guess', () => {
    const html = renderToStaticMarkup(createElement(SpeedStrip, { event: PART1, passingSpeed: 0.6, yours: true }))
    expect(html).toContain('#be185d')
    expect(html).toContain('Your event:')
    expect(html).not.toContain('>YOUR GUESS<')
  })

  it('captions, bars and the words box render for every event and every speed without NaN', () => {
    for (let i = 0; i < PRESET_EVENTS.length; i++) {
      for (const u of SPEEDS) {
        const r = runCauseBeforeEffectExperiment(PRESET_EVENTS[i], u)
        const parts = [
          renderToStaticMarkup(createElement(Diagram, { eventIndex: i, passingSpeed: u, progress: 1, yours: true })),
          renderToStaticMarkup(createElement(ResultsBars, { rows: [{ name: 'The lab', color: '#38bdf8', reading: r.lab }, { name: 'P', color: '#8b5cf6', reading: r.passing }] })),
          renderToStaticMarkup(createElement(DiagramCaption, { complete: true, part2: true, result: r })),
          renderToStaticMarkup(createElement(StripCaption, { result: r, part2: true, guess: null })),
          renderToStaticMarkup(createElement(BarsCaption, { result: r, part2: true })),
          renderToStaticMarkup(createElement(SpeedStrip, { event: PRESET_EVENTS[i], passingSpeed: u, yours: true })),
        ]
        parts.forEach((h) => expect(h).not.toContain('NaN'))
      }
    }
  })

  it('the caption before the run hides the worked moment and what to look for; after it, "What to look for" is in three parts', () => {
    const r = runCauseBeforeEffectExperiment(PART1, 0.3)
    const before = renderToStaticMarkup(createElement(DiagramCaption, { complete: false, part2: false, result: r }))
    expect(before).not.toContain('What to look for')
    expect(before).not.toContain('The coloured regions')
    expect(before).not.toContain('above')
    const after = renderToStaticMarkup(createElement(DiagramCaption, { complete: true, part2: false, result: r }))
    expect(after).toContain('Look at:')
    expect(after).toContain('What it means:')
    expect(after).toContain('Why it matters:')
    const strip = renderToStaticMarkup(createElement(StripCaption, { result: r, part2: false, guess: 'no' }))
    expect(strip).toContain('White ring and the YOUR GUESS box')
    expect(strip).toContain('It is only a marker')
  })

  it('the words box holds the flip speed and the case names only after the run, with numbers from the module', () => {
    const before = referenceEntries(false).map((e) => e.term)
    expect(before).not.toContain('The flip speed')
    expect(before).not.toContain('Reachable, light only, unreachable')
    const after = referenceEntries(true)
    const flip = after.find((e) => e.term === 'The flip speed')
    expect(flip?.meaning).toContain('0.60c')
    expect(after.find((e) => e.term === 'time² − distance²')?.meaning).toContain('−16.00')
  })

  it('the tutor\'s first question points to the white ring', () => {
    for (const g of GUESSES) {
      const html = renderToStaticMarkup(createElement(CauseBeforeEffectTutor, { event: PART1, passingSpeed: 0.3, predicted: g }))
      expect(html).toContain('white ring')
      expect(html).not.toContain('NaN')
    }
  })
  it('the diagram labels each observer\'s own clock reading at B only after that observer\'s line has reached B, using the physics numbers', () => {
    const idle = renderToStaticMarkup(createElement(Diagram, { eventIndex: 3, passingSpeed: 0.3, progress: null }))
    expect(idle).not.toContain('lab clock')
    expect(idle).not.toContain('passing clock')
    // When the run has ended both lines have reached B, so both labels are drawn.
    const done = renderToStaticMarkup(createElement(Diagram, { eventIndex: 3, passingSpeed: 0.3, progress: 1 }))
    const r = runCauseBeforeEffectExperiment(PRESET_EVENTS[3], 0.3)
    expect(done).toContain(`lab clock: ${r.lab.timeBetween.toFixed(2)} s`)
    expect(done).toContain(`passing clock: ${r.passing.timeBetween.toFixed(2)} s`)
    expect(r.passing.timeBetween).not.toBeCloseTo(r.lab.timeBetween, 1)
  })
})
