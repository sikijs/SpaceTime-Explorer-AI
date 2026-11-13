import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PART_ONE_PUSHES, runOrbitExperiment } from '../physics/orbitExperiment'
import type { OrbitOutcome, YesNo } from '../physics/orbitExperiment'
import { OrbitDrawing, OrbitExperiment, OutcomeGraph, Part1Caption, Part2Caption, PushStrengthExplanation } from './OrbitExperiment'
import { OrbitExplanation, OrbitTutor } from './OrbitTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// graph is complete. They do not check how the page looks.
const OUTCOMES: OrbitOutcome[] = ['falls-in', 'escapes', 'orbits']
const ANSWERS: YesNo[] = ['yes', 'no']
const PHRASE: Record<OrbitOutcome, string> = { 'falls-in': 'falls in', escapes: 'flies away', orbits: 'orbits' }
const RUNS = [
  { key: 'weak' as const, fraction: 0.2, outcome: 'falls-in' as const },
  { key: 'strong' as const, fraction: 2, outcome: 'escapes' as const },
  { key: 'inBetween' as const, fraction: 1, outcome: 'orbits' as const },
]
const path = (fraction: number) => runOrbitExperiment(1, 1, fraction).trajectory

describe('Gravity 6 renders', () => {
  it('the page renders at rest: Part 1, words box, links note and Start over, but no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(OrbitExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change predictions')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('#ffffff')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the introduction explains the Parts, says guesses never change the pictures, and keeps the approved question', () => {
    const html = renderToStaticMarkup(createElement(OrbitExperiment, {}))
    expect(html.indexOf('How this page is laid out.')).toBeGreaterThan(-1)
    expect(html).toContain('Your guesses never change the real pictures or the numbers')
    expect(html).toContain('Why do planets go around the Sun')
    expect(html).toContain('Experiment 4 (curved spacetime)')
    expect(html).toContain('one tenth of its starting distance')
    expect(html).toContain('is set to 1, and the object’s starting distance from it is set to 1')
    expect(html).toContain('Pull (of the mass)')
  })

  it('links are held back until after the tutor; formulas and the unit are held back until all three pushes have run', () => {
    const html = renderToStaticMarkup(createElement(OrbitExperiment, {}))
    expect(html).not.toContain('nasa.gov/learn')
    expect(html).not.toContain('esa.int')
    expect(html).toContain('appear after the tutor')
    expect(html).not.toContain('square root of 2')
    expect(html).not.toContain('Escape speed')
    expect(html).toContain('after you have run all three pushes')
  })

  it('the Part 1 buttons use plain names with push strength numbers and no percent sign', () => {
    const html = renderToStaticMarkup(createElement(OrbitExperiment, {}))
    expect(html).toContain('A very weak push (push strength 20)')
    expect(html).toContain('A very strong push (push strength 200)')
    expect(html).toContain('A push in between (push strength 100)')
    expect(html).not.toContain('% of circular')
  })

  it('the drawing is labelled: mass, object start, push arrow', () => {
    const html = renderToStaticMarkup(
      createElement(OrbitDrawing, { paths: [], arrow: { fraction: 0.2, color: '#f59e0b', label: 'Push (straight up)' }, ariaLabel: 'x' })
    )
    for (const text of ['Fixed mass', 'Object (start)', 'Push (straight up)']) expect(html).toContain(text)
    expect(html).not.toContain('#ffffff')
    expect(html).not.toContain('NaN')
  })

  it('the drawing says where a path continues beyond the picture, for the strong push but not for the weak one', () => {
    const strong = renderToStaticMarkup(
      createElement(OrbitDrawing, { paths: [{ id: 'a', label: 'push 200', color: '#f59e0b', points: path(2) }], arrow: null, ariaLabel: 'x' })
    )
    const weak = renderToStaticMarkup(
      createElement(OrbitDrawing, { paths: [{ id: 'a', label: 'push 20', color: '#f59e0b', points: path(0.2) }], arrow: null, ariaLabel: 'x' })
    )
    expect(strong).toContain('continues beyond the picture')
    expect(weak).not.toContain('continues beyond the picture')
  })

  it('the arrow grows with the push', () => {
    const arrow = (fraction: number) =>
      renderToStaticMarkup(createElement(OrbitDrawing, { paths: [], arrow: { fraction, color: '#f59e0b', label: 'p' }, ariaLabel: 'x' }))
    expect(arrow(0.2)).not.toBe(arrow(2))
  })

  it('the graph shows its rows, axis and note before the line is drawn, with no white mark', () => {
    const html = renderToStaticMarkup(createElement(OutcomeGraph, { partOneRuns: RUNS.slice(0, 1), complete: false, guesses: { weak: 'falls-in', strong: 'escapes', inBetween: 'yes' } }))
    for (const text of ['Flies away', 'Orbits', 'Falls in', 'Push strength (a fixed scale, 0 to 200)', 'push 20', 'The full line appears after all three pushes have run.']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('edge at about')
    expect(html).not.toContain('NaN')
  })

  it('once all three have run, the line with its two edges and three white marks appear, whatever the guess', () => {
    for (const weak of OUTCOMES) {
      for (const strong of OUTCOMES) {
        for (const middle of ANSWERS) {
          const html = renderToStaticMarkup(createElement(OutcomeGraph, { partOneRuns: RUNS, complete: true, guesses: { weak, strong, inBetween: middle } }))
          expect(html.match(/YOUR GUESS/g)?.length).toBe(3)
          expect(html).toContain('edge at about 43')
          expect(html).toContain('edge at about 141')
          expect(html).toContain(PHRASE[weak])
          expect(html).toContain(PHRASE[strong])
          expect(html).toContain(middle === 'yes' ? 'yes: something different in between' : 'no: nothing different in between')
          expect(html).not.toContain('NaN')
        }
      }
    }
    expect(renderToStaticMarkup(createElement(OutcomeGraph, { partOneRuns: RUNS, complete: true, guesses: null }))).not.toContain('YOUR GUESS')
  })

  it('a ring sits on the row the learner chose and the rows differ between guesses', () => {
    const ringsFor = (weak: OrbitOutcome) =>
      renderToStaticMarkup(createElement(OutcomeGraph, { partOneRuns: RUNS, complete: true, guesses: { weak, strong: 'escapes', inBetween: 'yes' } })).match(/<circle[^>]*r="11"[^>]*>/g)
    expect(ringsFor('falls-in')).not.toEqual(ringsFor('escapes'))
    expect(ringsFor('falls-in')).not.toEqual(ringsFor('orbits'))
  })

  it('Part 2 pink dots appear on the graph and carry no white mark', () => {
    const html = renderToStaticMarkup(
      createElement(OutcomeGraph, { partOneRuns: RUNS, complete: true, guesses: null, part2Runs: [{ fraction: 0.6, outcome: 'orbits' }] })
    )
    expect(html).toContain('#f472b6')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('Part 1 caption: worked moment from the module, three-part look-fors added as features appear', () => {
    const none = renderToStaticMarkup(createElement(Part1Caption, { runsDone: 0 }))
    const one = renderToStaticMarkup(createElement(Part1Caption, { runsDone: 1 }))
    const three = renderToStaticMarkup(createElement(Part1Caption, { runsDone: 3 }))
    for (const html of [none, one, three]) {
      expect(html).toContain('How to read this diagram.')
      expect(html).toContain('A worked moment.')
      expect(html).toContain('0.02')
      expect(html).toContain('0.04 ÷ 1.96')
    }
    expect(none).not.toContain('Look at:')
    expect(one.match(/Look at:/g)?.length).toBe(2)
    expect(three.match(/Look at:/g)?.length).toBe(3)
    expect(three.match(/What it means:/g)?.length).toBe(3)
    expect(three.match(/Why it matters:/g)?.length).toBe(3)
    expect(one).not.toContain('about 43')
    expect(three).toContain('about 43 and about 141')
  })

  it('Part 2 caption: worked push 60 from the module and three look-fors', () => {
    const html = renderToStaticMarkup(createElement(Part2Caption))
    expect(html).toContain('0.36 ÷ 1.64')
    expect(html).toContain('heavy teal (blue-green) line')
    expect(html).toContain('edge at about')
    expect(html).toContain('grey lines')
    expect(html).not.toContain('Part 1 caption')
    expect(html).toContain('0.22')
    expect(html.match(/Look at:/g)?.length).toBe(3)
    expect(html).not.toContain('NaN')
  })

  it('the push-strength explanation gives the yardstick and the page\'s own numbers, and the page holds it back at rest', () => {
    const html = renderToStaticMarkup(createElement(PushStrengthExplanation))
    for (const text of ['circular-orbit speed', 'perfect circle', 'the square root of 1, which is 1', 'exactly 1', 'half of it: a starting speed of 0.5', 'twice it: a starting speed of 2', 'a fifth of it: a starting speed of 0.2', 'Why this yardstick?', 'Where does that number come from, and does it depend on anything?', 'swinging a ball round on a string', 'the square root of (pull ÷ distance)', 'circular-orbit speed would be 2', 'it would be 0.5']) {
      expect(html).toContain(text)
    }
    expect(html).not.toContain('NaN')
    expect(renderToStaticMarkup(createElement(OrbitExperiment, {}))).not.toContain('What “push strength” means.')
  })

  it("the tutor's prompts point to the white marks by name and give no verdict", () => {
    const html = renderToStaticMarkup(createElement(OrbitTutor, { slowPrediction: 'falls-in', fastPrediction: 'escapes', inBetweenPrediction: 'yes' }))
    expect(html).toContain('What happened to each of the three pushes')
    expect(html).not.toContain('It falls into the mass')
    expect(html).not.toContain('always falls in')
  })

  it('the explanation marks all three guesses in every combination, with the module numbers', () => {
    for (const weak of OUTCOMES) {
      for (const strong of OUTCOMES) {
        for (const middle of ANSWERS) {
          const html = renderToStaticMarkup(createElement(OrbitExplanation, { slowPrediction: weak, fastPrediction: strong, inBetweenPrediction: middle }))
          expect(html).toContain('Your guesses, marked.')
          expect(html).toContain('a wide band of pushes, from about 43 to about 141')
          expect(html).toContain('1.2 times the start distance')
          expect(html).toContain('49 times')
          expect(html).toContain('Experiment 4 (curved spacetime)')
          expect(html).toContain('pale yellow dot')
          expect(html).toContain('how wide it is, not how heavy it is')
          expect(html).toContain('as close as 0.02')
          expect(html).toContain('as close as 0.11')
          expect(html).toContain('radius of 0.2, the edge would move up to about 58')
          expect(html).toContain('down to about 31')
          expect(html).not.toContain('always falls in')
          expect(html).not.toContain('NaN')
          expect(html.match(/That (matches|is different from)/g)?.length).toBe(3)
        }
      }
    }
    expect(PART_ONE_PUSHES.weak).toBe(0.2)
  })
})
