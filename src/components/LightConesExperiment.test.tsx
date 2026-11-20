import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PRESET_EVENTS, runLightConeExperiment } from '../physics/lightCones'
import type { LightConeGuess } from '../physics/lightCones'
import {
  BarsCaption,
  Diagram,
  DiagramCaption,
  LightConesExperiment,
  ResultsBars,
  referenceEntries,
} from './LightConesExperiment'
import { ConeFigure, ShoutFigure, SnapshotsFigure } from './LightConesFigures'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess ring appears exactly when a guess is given
// and the regions are drawn. They do not check how the page looks.
const GUESSES: LightConeGuess[] = ['slower', 'light-only', 'no']
const SPEEDS = [-0.5, -0.3, 0, 0.3, 0.5]

describe('Spacetime Geometry 2 renders', () => {
  it('the page at rest shows the introduction, three figures, links, words box, Part 1 and Start over, and no later Part, ring or answer', () => {
    const html = renderToStaticMarkup(createElement(LightConesExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('Your guess and the real pictures')
    expect(html).toContain('Figure A: a shout across a field')
    expect(html).toContain('Figure B: four snapshots of one flash')
    expect(html).toContain('Figure C: the snapshots stacked into a graph')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('Your prediction was')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Experiment 2 —')
    expect(html).not.toContain('Working it out yourself')
    expect(html).not.toContain('Timelike')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest, and Run is disabled until a prediction is chosen', () => {
    const html = renderToStaticMarkup(createElement(LightConesExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('every link opens in a new tab', () => {
    const html = renderToStaticMarkup(createElement(LightConesExperiment, {}))
    const links = html.match(/<a [^>]*>/g) ?? []
    expect(links.length).toBe(4)
    links.forEach((l) => expect(l).toContain('target="_blank"'))
  })

  it('the setup diagram at rest draws no cone, no regions and no ring', () => {
    const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: null, guess: 'slower' }))
    expect(html).not.toContain('Inside the cone')
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('NaN')
  })

  it('the white ring and YOUR GUESS box appear only when the regions are drawn and a guess is given', () => {
    const playing = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 0.5, guess: 'slower' }))
    expect(playing).not.toContain('>YOUR GUESS<')
    const noGuess = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 1, guess: null }))
    expect(noGuess).not.toContain('>YOUR GUESS<')
    expect(noGuess).toContain('Inside the cone')
    GUESSES.forEach((guess) => {
      const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 1, guess }))
      expect(html).toContain('>YOUR GUESS<')
      expect(html).not.toContain('NaN')
    })
    expect(renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 1, guess: 'no' }))).toContain('not even light could')
  })

  it('the ring follows the guess: a different guess gives a different ring', () => {
    const rings = GUESSES.map((guess) => {
      const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 1, guess }))
      return html.match(/<circle[^>]*r="9"[^>]*>/)?.[0]
    })
    expect(new Set(rings).size).toBe(3)
  })

  it('the key names the regions but does not say what they mean (the tutor does)', () => {
    const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: 0.3, progress: 1, guess: 'slower' }))
    expect(html).not.toContain('something slower than light could get here')
    expect(html).not.toContain('nothing could get here')
    expect(html).not.toContain('only light could get here')
  })

  it("the passing observer's arrow is longer for a faster observer and absent at rest", () => {
    const arrow = (speed: number) => renderToStaticMarkup(createElement(Diagram, { eventIndex: 0, passingSpeed: speed, progress: null })).match(/<polygon[^>]*>/)?.[0]
    expect(arrow(0)).toBeUndefined()
    expect(arrow(0.5)).not.toBe(arrow(0.3))
    expect(arrow(-0.5)).not.toBe(arrow(0.5))
  })

  it('the Part 2 drawing is labelled as the learner\'s own choices', () => {
    const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: 3, passingSpeed: -0.3, progress: 1, yours: true }))
    expect(html).toContain('your event and speed')
    expect(html).not.toContain('>YOUR GUESS<')
  })

  it('every event and speed draws without a NaN', () => {
    PRESET_EVENTS.forEach((_, i) => {
      SPEEDS.forEach((speed) => {
        const html = renderToStaticMarkup(createElement(Diagram, { eventIndex: i, passingSpeed: speed, progress: 1 }))
        expect(html).not.toContain('NaN')
        const result = runLightConeExperiment(PRESET_EVENTS[i], speed)
        const rows = [
          { name: 'The lab', reading: result.lab },
          { name: 'The passing observer', reading: result.passing },
        ]
        expect(renderToStaticMarkup(createElement(ResultsBars, { rows }))).not.toContain('NaN')
        const caption = renderToStaticMarkup(createElement(BarsCaption, { result, part2: true }))
        expect(caption).not.toContain('NaN')
        expect(caption).toContain('Look at:')
        expect(caption).toContain('Why it matters:')
      })
    })
  })

  it('the diagram caption shows the shaded regions and the ring only after the run, with three-part look-fors', () => {
    const before = renderToStaticMarkup(createElement(DiagramCaption, { complete: false, part2: false }))
    expect(before).not.toContain('The shaded regions')
    expect(before).not.toContain('white ring')
    expect(before).not.toContain('Look at:')
    expect(before).not.toContain('light-seconds past B')
    expect(before).not.toContain('A worked moment.')
    const after = renderToStaticMarkup(createElement(DiagramCaption, { complete: true, part2: false }))
    expect(after).toContain('The shaded regions')
    expect(after).toContain('white ring')
    expect(after).toContain('Look at:')
    expect(after).toContain('2.00 light-seconds past B')
    const part2 = renderToStaticMarkup(createElement(DiagramCaption, { complete: true, part2: true }))
    expect(part2).not.toContain('white ring and the YOUR GUESS box')
    expect(part2).not.toContain('NaN')
  })

  it('the words box holds back the speed, the formula and the case names until after the run', () => {
    const terms = (done: boolean) => referenceEntries(done).map((e) => e.term)
    expect(terms(false)).not.toContain('Speed needed')
    expect(terms(false)).not.toContain('time² − distance²')
    expect(terms(false)).not.toContain('Timelike, lightlike, spacelike')
    expect(terms(true)).toContain('Speed needed')
    expect(terms(true)).toContain('Timelike, lightlike, spacelike')
    const speed = referenceEntries(true).find((e) => e.term === 'Speed needed')?.meaning ?? ''
    expect(speed).toContain('3.00 ÷ 5.00 = 0.60')
    const formula = referenceEntries(true).find((e) => e.term === 'time² − distance²')?.meaning ?? ''
    expect(formula).toContain('25.00 − 9.00 = 16.00')
  })

  it('the three figures draw their labels and no event B, teal or rose, or meaning for the regions', () => {
    const a = renderToStaticMarkup(createElement(ShoutFigure))
    expect(a).toContain('Friend at 340 m')
    expect(a).toContain('Friend at 1,000 m')
    expect(a).toContain('The sound: 340 meters every second')
    const b = renderToStaticMarkup(createElement(SnapshotsFigure))
    expect(b).toContain('the flash goes off')
    const c = renderToStaticMarkup(createElement(ConeFigure))
    expect(c).toContain('Future half')
    expect(c).toContain('Past half')
    expect(c).toContain('Edge of the cone')
    ;[a, b, c].forEach((html) => {
      expect(html).not.toContain('NaN')
      expect(html).not.toContain('#14b8a6')
      expect(html).not.toContain('#fb7185')
      expect(html).not.toContain('B: the other event')
    })
  })
})
