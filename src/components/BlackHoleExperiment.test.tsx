import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runRadialLightSpeedLaunch } from '../physics/blackHoleExperiment'
import type { SpeedCompareChoice, YesNo } from '../physics/blackHoleExperiment'
import { Part3Results } from './BlackHoleResults'
import { BlackHoleExperiment, EscapeGraph, LaunchDrawing, Part1DrawingCaption, Part1GraphCaption, Part2DrawingCaption, Part2GraphCaption, Part2Drawing } from './BlackHoleExperiment'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and
// the amber feature beside it is drawn. They do not check how the page looks.
const CHOICES: SpeedCompareChoice[] = ['much-slower', 'faster', 'cannot-escape']
const ANSWERS: YesNo[] = ['yes', 'no']
const guesses = (light: SpeedCompareChoice, heavy: SpeedCompareChoice, inBetween: YesNo) => ({ light, heavy, inBetween })
const graph = (props: Partial<Parameters<typeof EscapeGraph>[0]>) =>
  renderToStaticMarkup(
    createElement(EscapeGraph, { lightDone: false, heavyDone: false, curveMasses: null, sweepDone: false, guesses: null, ...props })
  )

describe('Gravity 7 renders (Part 1)', () => {
  it('the page renders at rest: Part 1, words box, links note and Start over, no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the introduction explains the Parts, says guesses never change the pictures and gives no answer away', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(html).toContain('How this page is laid out.')
    expect(html).toContain('Your guesses never change the real pictures or the numbers')
    expect(html).not.toContain('not even light')
    expect(html).not.toContain('place of no return')
    expect(html).not.toContain('Event horizon (')
  })

  it('the introduction embeds the two real pictures with their credits, and three drawings, with no answer given', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(html).toContain('images/black-holes/m87-eht-eso1907a.jpg')
    expect(html).toContain('images/black-holes/sgra-eht-eso2208.jpg')
    expect((html.match(/Image: EHT Collaboration \(CC BY 4\.0\), via ESO\./g) ?? []).length).toBe(2)
    expect(html.match(/<img [^>]*alt="[^"]+"/g)?.length).toBe(2)
    expect(html).toContain('Three throws from the same spot')
    expect(html).toContain('Same size, different concentration')
    expect(html).toContain('Your route through this page')
    expect(html).toContain('Does the squeezed ball pull harder?')
    expect(html).toContain('The hill around one mass, with three places marked')
    expect(html).toContain('how close to the centre you start')
    expect(html).toContain('4 ÷ 1² = 4')
    expect(html).toContain('4 ÷ 2² = 1')
    expect(html).toContain('0.11')
    expect(html).toContain('55 million light-years')
    expect(html).toContain('four')
    expect(html).not.toContain('not even light')
    expect(html).not.toContain('point of no return')
    expect(html).not.toContain('NaN')
  })

  it('the hill section answers "same mass, same distance" with the yes, the reason and the two cases, using module numbers', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {})).replace(/<!-- -->/g, '')
    expect(html).toContain('two objects, the same mass, one big and one squeezed small')
    expect(html).toContain('Yes, if you measure the distance from the centre of each')
    expect(html).toContain('4 ÷ 6² = 0.11 for the big one and for the squeezed one alike')
    expect(html).toContain('4 ÷ 4² = 0.25')
    expect(html).toContain('4 ÷ 3² = 0.44')
    expect(html).toContain('If you go inside the big ball')
    expect(html).not.toContain('NaN')
  })

  it('the words box holds back the event horizon and the formula until all three launches have run', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(html).toContain('Escape speed')
    expect(html).toContain('would give away what the launches show')
    expect(html).not.toContain('Escape speed formula')
  })

  it('the graph shows no white mark and no curve before anything has run', () => {
    const html = graph({ guesses: guesses('much-slower', 'faster', 'yes') })
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('<polyline')
  })

  it('the white marks follow what has been drawn: light mark after the light launch, heavy after the heavy, in between after the curve', () => {
    const g = guesses('much-slower', 'cannot-escape', 'yes')
    const countGuessBoxes = (html: string) => (html.match(/YOUR GUESS/g) ?? []).length
    expect(countGuessBoxes(graph({ guesses: g, lightDone: true }))).toBe(1)
    expect(countGuessBoxes(graph({ guesses: g, lightDone: true, heavyDone: true }))).toBe(2)
    expect(countGuessBoxes(graph({ guesses: g, lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6 }))).toBe(3)
    expect(countGuessBoxes(graph({ guesses: null, lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6 }))).toBe(0)
  })

  it('every guess combination renders a finished graph with all three boxes and no NaN, and the mark follows the guess', () => {
    const seen = new Set<string>()
    for (const light of CHOICES) {
      for (const heavy of CHOICES) {
        for (const inBetween of ANSWERS) {
          const html = graph({ guesses: guesses(light, heavy, inBetween), lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6 })
          expect(html).not.toContain('NaN')
          expect((html.match(/YOUR GUESS/g) ?? []).length).toBe(3)
          seen.add(html)
        }
      }
    }
    expect(seen.size).toBe(3 * 3 * 2)
  })

  it('the amber curve and the real dots are the same whatever the guesses', () => {
    const a = graph({ guesses: guesses('much-slower', 'faster', 'yes'), lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6 })
    const b = graph({ guesses: guesses('cannot-escape', 'much-slower', 'no'), lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6 })
    expect(a).toContain('mass 0.2: 32%')
    expect(a).toContain('mass 6: 173%')
    expect(a).toContain('<polyline')
    expect((a.match(/<polyline[^>]*>/g) ?? [])[0]).toBe((b.match(/<polyline[^>]*>/g) ?? [])[0])
    expect(a).toContain('Speed of light = 100 percent')
    expect(b).toContain('Speed of light = 100 percent')
  })

  it('the drawing labels every shape and draws the horizon only after a launch', () => {
    const before = renderToStaticMarkup(createElement(LaunchDrawing, { mass: null, trajectory: [], showHorizon: false }))
    expect(before).toContain('Central mass')
    expect(before).toContain('Launch point')
    expect(before).not.toContain('Event horizon')
    expect(before).not.toContain('Probe')
    const trajectory = runRadialLightSpeedLaunch(6, 1).trajectory
    const after = renderToStaticMarkup(createElement(LaunchDrawing, { mass: 6, trajectory, showHorizon: true }))
    expect(after).toContain('Event horizon (the point of no return)')
    expect(after).toContain('Probe')
    expect(after).not.toContain('NaN')
  })

  it('each Part 1 caption lists its "what to look for" items only once the feature is drawn, with the three parts', () => {
    const off = { lightDone: false, heavyDone: false, sweepDone: false }
    const on = { lightDone: true, heavyDone: true, sweepDone: true }
    const noneG = renderToStaticMarkup(createElement(Part1GraphCaption, off))
    expect(noneG).toContain('How to read the graph')
    expect(noneG).not.toContain('Look at')
    const noneD = renderToStaticMarkup(createElement(Part1DrawingCaption, off))
    expect(noneD).toContain('How to read the drawing')
    expect(noneD).toContain('Why the circle is sometimes missing')
    expect(noneD).toContain('Can the circle be inside the mass?')
    expect(noneD).toContain('9 millimetres')
    expect(noneD).not.toContain('Look at')
    const graph = renderToStaticMarkup(createElement(Part1GraphCaption, on))
    expect(graph).toContain('Look at')
    expect(graph).toContain('What it means')
    expect(graph).toContain('Why it matters')
    expect(graph).toContain('32 percent')
    expect(graph).toContain('173 percent')
    expect(graph).toContain('63 percent') // worked moment at mass 0.8
    expect(graph).toContain('122 percent') // worked moment at mass 3
    expect(graph).not.toContain('dashed violet circle in the drawing')
    const drawing = renderToStaticMarkup(createElement(Part1DrawingCaption, on))
    expect(drawing).toContain('Look at')
    expect(drawing).toContain('dashed violet circle in the drawing')
    expect(drawing).not.toContain('How to read the graph')
  })
})

describe('Gravity 7 renders (Part 2)', () => {
  const ref = [
    { mass: 0.2, label: 'Part 1: mass 0.2', farthest: 3, row: 0 },
    { mass: 6, label: 'Part 1: mass 6', farthest: 1.1, row: 1 },
  ]

  it('Part 2 is not on the page before the first launch has finished', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Launch with my mass')
  })

  it('the Part 2 drawing labels its shapes, draws grey Part 1 launches and your pink launch with its horizon', () => {
    const trajectory = runRadialLightSpeedLaunch(3, 1).trajectory
    const html = renderToStaticMarkup(createElement(Part2Drawing, { yoursMass: 3, yoursTrajectory: trajectory, reference: ref }))
    expect(html).toContain('Central mass')
    expect(html).toContain('Launch point (distance 1)')
    expect(html).toContain('Your probe')
    expect(html).toContain('Your event horizon (mass 3.0)')
    expect(html).toContain('radius 1.50')
    expect(html).toContain('Part 1: mass 0.2')
    expect(html).toContain('Part 1: mass 6')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('stroke="#ffffff"')
  })

  it('before any launch the Part 2 drawing shows no pink probe and no pink horizon', () => {
    const html = renderToStaticMarkup(createElement(Part2Drawing, { yoursMass: null, yoursTrajectory: [], reference: [] }))
    expect(html).not.toContain('Your probe')
    expect(html).not.toContain('Your event horizon')
    expect(html).not.toContain('grey: Part 1')
  })

  it('pink dots follow the learner\'s masses on the graph and never change the amber curve', () => {
    const base = { lightDone: true, heavyDone: true, sweepDone: true, curveMasses: 6, guesses: null }
    const none = renderToStaticMarkup(createElement(EscapeGraph, base))
    const some = renderToStaticMarkup(createElement(EscapeGraph, { ...base, yours: [1, 3] }))
    expect(none).not.toContain('your mass')
    expect(some).toContain('your mass 3.0: 122%')
    expect(some).not.toContain('NaN')
    expect((none.match(/<polyline[^>]*>/g) ?? [])[0]).toBe((some.match(/<polyline[^>]*>/g) ?? [])[0])
    const different = renderToStaticMarkup(createElement(EscapeGraph, { ...base, yours: [1, 5] }))
    expect(different).toContain('your mass 5.0: 158%')
    expect(different).not.toBe(some)
  })

  it('the Part 2 captions give a worked moment and look-at items only after a launch, in three parts, from the learner\'s own mass, each under its own picture', () => {
    const none = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [], curveDrawn: false }))
    expect(none).toContain('How to read the graph')
    expect(none).not.toContain('Look at')
    expect(none).not.toContain('worked moment, from your latest launch')
    const noneD = renderToStaticMarkup(createElement(Part2DrawingCaption, { yours: [], curveDrawn: false }))
    expect(noneD).toContain('How to read the drawing')
    expect(noneD).toContain('Why a circle is sometimes missing')
    expect(noneD).toContain('Can the circle be inside the mass?')
    const one = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [3], curveDrawn: false })).replace(/<!-- -->/g, '')
    expect(one).toContain('A worked moment, from your latest launch.')
    expect(one).toContain('122 percent')
    expect(one).toContain('Look at')
    expect(one).toContain('What it means')
    expect(one).toContain('Why it matters')
    expect(one).not.toContain('against the amber curve')
    const withCurve = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [3, 1], curveDrawn: true }))
    expect(withCurve).toContain('against the amber curve')
    expect(withCurve).toContain('one against another')
    expect(withCurve).not.toContain('against the grey ring of the launch point')
    const drawing = renderToStaticMarkup(createElement(Part2DrawingCaption, { yours: [3, 1], curveDrawn: true }))
    expect(drawing).toContain('against the grey ring of the launch point')
  })
})

describe('Gravity 7 renders (Part 3)', () => {
  const G1 = { light: 'much-slower' as const, heavy: 'cannot-escape' as const, inBetween: 'yes' as const }
  const html = (props: Partial<Parameters<typeof Part3Results>[0]>) =>
    renderToStaticMarkup(
      createElement(Part3Results, { lightDone: false, heavyDone: false, sweepDone: false, guesses: G1, yours: [], ...props })
    ).replace(/<!-- -->/g, '')

  it('Part 3 is not on the page before the first launch has finished', () => {
    const page = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(page).not.toContain('Part 3: The results')
  })

  it('before any launch every row says "not run yet" and shows no number, no check-up and no reading notes', () => {
    const h = html({})
    expect((h.match(/not run yet/g) ?? []).length).toBe(12)
    expect(h).not.toContain('32%')
    expect(h).not.toContain('173%')
    expect(h).not.toContain('Table 2')
    expect(h).not.toContain('What this table tells us')
    expect(h).toContain('What to do next')
    expect(h).not.toContain('NaN')
  })

  it('shows a number only for a launch that has been run', () => {
    const light = html({ lightDone: true })
    expect(light).toContain('32%')
    expect(light).toContain('0.10')
    expect(light).not.toContain('173%')
    expect(light).not.toContain('changes at mass')
    expect(light).toContain('What this table tells us')
    expect(light).toContain('Table 2')
    expect(light).not.toContain('below 2.0')
    expect(light).not.toContain('2.0')
    expect(html({ lightDone: true, sweepDone: true })).toContain('below a certain mass, 2.0')
    expect(light).toContain('For the light mass the wall is only 32 percent')
    expect(light).not.toContain('For the heavy mass the wall')
    const heavy = html({ heavyDone: true })
    expect(heavy).toContain('173%')
    expect(heavy).toContain('3.00')
    expect(heavy).not.toContain('32%')
  })

  it('with all three launches: the three real rows, the check-up rows and the third row\'s worked numbers', () => {
    const h = html({ lightDone: true, heavyDone: true, sweepDone: true })
    expect(h).toContain('32%')
    expect(h).toContain('173%')
    expect(h).toContain('changes at mass 2.0')
    expect(h).toContain('100%')
    expect(h).toContain('exactly on the horizon')
    expect(h).toContain('inside the horizon')
    expect(h).toContain('outside the horizon')
    expect((h.match(/the same/g) ?? []).length).toBeGreaterThanOrEqual(5)
    expect(h).toContain('(2 × 2.0 ÷ 1), which is the square root of 4.0, which is 2.0')
    expect(h).not.toContain('NaN')
  })

  it('shows the guesses only as guesses: a tag on each row, and never "right", "wrong" or "matched"', () => {
    const h = html({ lightDone: true, heavyDone: true, sweepDone: true })
    expect((h.match(/>your guess<\/span>/g) ?? []).length).toBe(3)
    expect(h).toContain('much slower than light')
    expect(h).toContain('nothing can escape at all')
    expect(h).toContain('yes, something special happens in between')
    expect(h).not.toMatch(/\b(wrong|matched|correct|you were right)\b/i)
  })

  it('a different guess changes only the tags, never the numbers', () => {
    const a = html({ lightDone: true, heavyDone: true, sweepDone: true, guesses: G1 })
    const b = html({ lightDone: true, heavyDone: true, sweepDone: true, guesses: { light: 'faster', heavy: 'much-slower', inBetween: 'no' } })
    expect(a).not.toBe(b)
    expect(b).toContain('faster than light')
    expect(b).toContain('no, nothing special happens in between')
    for (const needle of ['32%', '173%', '0.10', '3.00', 'changes at mass 2.0']) {
      expect(a).toContain(needle)
      expect(b).toContain(needle)
    }
  })

  it('the pink line follows the learner\'s latest launch and is absent before one', () => {
    expect(html({ lightDone: true })).not.toContain('Your own launch in Part 2')
    const h = html({ lightDone: true, yours: [3, 1.5] })
    expect(h).toContain('Mass 1.5: escape speed 87 percent')
    expect(h).not.toContain('Mass 3.0: escape speed 122 percent')
    expect(h).toContain('trial values')
  })
})

