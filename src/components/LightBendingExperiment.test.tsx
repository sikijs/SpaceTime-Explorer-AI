import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LIGHT_MASS, runLightBendingExperiment } from '../physics/lightBendingExperiment'
import type { BendChoice, MoreLessSameChoice } from '../physics/lightBendingExperiment'
import {
  BendGraph,
  FlybyDrawing,
  RunAllNotice,
  LightBendingExperiment,
  Part1DrawingCaption,
  Part1GraphCaption,
  Part2DrawingCaption,
  Part2GraphCaption,
} from './LightBendingExperiment'
import { LightBendingResults } from './LightBendingResults'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and
// the feature beside it is drawn. They do not check how the page looks.
const guesses = (bent: BendChoice, closer: MoreLessSameChoice, real: MoreLessSameChoice) => ({ bent, closer, real })
const graph = (props: Partial<Parameters<typeof BendGraph>[0]>) =>
  renderToStaticMarkup(createElement(BendGraph, { farDone: false, closeDone: false, curveAim: null, sweepDone: false, guesses: null, ...props }))
const pass = (aim: number) => {
  const r = runLightBendingExperiment(LIGHT_MASS, aim)
  const points = r.trajectory.filter((p) => p.x >= -8 && p.x <= 8).map((p) => ({ x: p.x, y: p.y }))
  return {
    aim,
    points,
    complete: true,
    degrees: r.simulatedDeflectionAngle === null ? null : (r.simulatedDeflectionAngle * 180) / Math.PI,
    fell: r.outcome === 'falls-in',
  }
}

describe('Gravity 8 renders (Part 1)', () => {
  it('the page renders at rest: Part 1, words box, links note and Start over, no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(LightBendingExperiment, {}))
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

  it('a bold notice above Run says all three passes are needed and tracks them', () => {
    const rest = renderToStaticMarkup(createElement(LightBendingExperiment, {})).replace(/<!-- -->/g, '')
    expect(rest).toContain('Run all three passes')
    expect(rest).toContain('Press Run three times')
    expect(rest).toContain('Far pass')
    expect(rest).toContain('Close pass')
    expect(rest).toContain('Slow sweep')
    const one = renderToStaticMarkup(createElement(RunAllNotice, { done: ['far'], selected: 'close', isRunning: false })).replace(/<!-- -->/g, '')
    expect(one).toContain('1 of 3 passes done. 2 more to run')
    expect(one).toContain('Press Run again')
    expect(one).toContain('Close pass (next)')
    const two = renderToStaticMarkup(createElement(RunAllNotice, { done: ['far', 'close'], selected: 'sweep', isRunning: true })).replace(/<!-- -->/g, '')
    expect(two).toContain('2 of 3 passes done. 1 more to run')
    expect(two).toContain('Slow sweep (running)')
    const all = renderToStaticMarkup(createElement(RunAllNotice, { done: ['far', 'close', 'sweep'], selected: 'far', isRunning: false })).replace(/<!-- -->/g, '')
    expect(all).toContain('All 3 passes are done')
    expect(all).not.toContain('Press Run')
  })

  it('the introduction says the guesses never change the pictures and gives no answer away', () => {
    const html = renderToStaticMarkup(createElement(LightBendingExperiment, {})).replace(/<!-- -->/g, '')
    expect(html).toContain('Your guesses never change the real pictures or the numbers')
    expect(html).toContain('drawn on the pictures in white')
    expect(html).toContain('Some new words')
    expect(html).toContain('not in metres, kilometres or light-years')
    expect(html).toContain('rolling a ball in a straight line past a post')
    expect(html).not.toContain('1919')
    expect(html).not.toContain('Eddington')
    expect(html).not.toContain('exactly twice')
    expect(html).not.toContain('lensing')
    expect(html).not.toContain('exactly double')
  })

  it('the words box holds back the real-universe formula and the links until later', () => {
    const html = renderToStaticMarkup(createElement(LightBendingExperiment, {})).replace(/<!-- -->/g, '')
    expect(html).toContain('Aim distance')
    expect(html).not.toContain('Real-universe formula')
    expect(html).not.toContain('esahubble.org')
    expect(html).toContain('after the tutor')
  })

  it('the drawing labels its shapes and draws the pass, the bend and the horizon only once a pass exists', () => {
    const before = renderToStaticMarkup(createElement(FlybyDrawing, { current: null, color: '#f59e0b', beamLabel: 'Light beam', showHorizon: false, guess1: null }))
    expect(before).toContain('Central mass')
    expect(before).toContain('1 unit')
    expect(before).not.toContain('Aim:')
    expect(before).not.toContain('Event horizon')
    const after = renderToStaticMarkup(createElement(FlybyDrawing, { current: pass(3), color: '#f59e0b', beamLabel: 'Light beam', showHorizon: true, guess1: null }))
    expect(after).toContain('Where the light would go')
    expect(after).toContain('with no gravity')
    expect(after).toContain('Aim: 3.0')
    expect(after).toContain('Bent by 9.5°')
    expect(after).toContain('Event horizon (radius 0.5)')
    expect(after).not.toContain('NaN')
  })

  it('a pass that falls in says so and shows no angle', () => {
    const html = renderToStaticMarkup(createElement(FlybyDrawing, { current: pass(0.5), color: '#f59e0b', beamLabel: 'Light beam', showHorizon: true, guess1: null }))
    expect(html).toContain('Fell into the mass')
    expect(html).not.toContain('Bent by')
    expect(html).not.toContain('NaN')
  })

  it('the white ring for the first guess follows the guess and appears with the path', () => {
    const yes = renderToStaticMarkup(createElement(FlybyDrawing, { current: pass(3), color: '#f59e0b', beamLabel: 'Light beam', showHorizon: true, guess1: 'yes' }))
    const no = renderToStaticMarkup(createElement(FlybyDrawing, { current: pass(3), color: '#f59e0b', beamLabel: 'Light beam', showHorizon: true, guess1: 'no' }))
    expect(yes).toContain('YOUR GUESS')
    expect(yes).toContain('yes, it bends')
    expect(no).toContain('no, it stays straight')
    expect(yes).not.toBe(no)
  })

  it('the graph draws amber dots as launches finish, the curve and green curve after the sweep, and no white mark without a guess', () => {
    const none = graph({})
    expect(none).toContain('Bending angle for each aim distance')
    expect(none).not.toContain('stroke="#ffffff"')
    const far = graph({ farDone: true })
    expect(far).toContain('far pass: aim 3.0')
    expect(far).not.toContain('Real universe')
    const all = graph({ farDone: true, closeDone: true, curveAim: 0.8, sweepDone: true })
    expect(all).toContain('Real universe: from the general relativity formula')
    expect(all).toContain('Simulated: ordinary gravity')
    expect(all).toContain('Falls in:')
    expect(all).not.toContain('NaN')
  })

  it('white marks appear only after the sweep, and follow the guess', () => {
    const base = { farDone: true, closeDone: true, curveAim: 0.8 }
    const before = graph({ ...base, sweepDone: false, guesses: guesses('yes', 'more', 'more') })
    expect(before).not.toContain('YOUR GUESS')
    const more = graph({ ...base, sweepDone: true, guesses: guesses('yes', 'more', 'more') })
    const less = graph({ ...base, sweepDone: true, guesses: guesses('yes', 'less', 'less') })
    expect((more.match(/YOUR GUESS/g) ?? []).length).toBe(2)
    expect(more).toContain('closer bends more')
    expect(less).toContain('closer bends less')
    expect(more).toContain('real bends more')
    expect(less).toContain('real bends less')
    expect(more).not.toBe(less)
    expect(more).not.toContain('NaN')
  })

  it('pink dots follow the learner\'s aims and never change the amber curve', () => {
    const base = { farDone: true, closeDone: true, curveAim: 0.8, sweepDone: true, guesses: null }
    const none = graph(base)
    const some = graph({ ...base, yours: [1.5, 2.5] })
    expect(none).not.toContain('your aim')
    expect(some).toContain('your aim 2.5: 11.5°')
    expect((none.match(/<polyline[^>]*>/g) ?? [])[1]).toBe((some.match(/<polyline[^>]*>/g) ?? [])[1])
    const falls = graph({ ...base, yours: [0.5] })
    expect(falls).toContain('your aim 0.5: falls in')
  })

  it('the Part 1 captions list each "what to look for" item only once its feature is drawn, with the three parts, and split by picture', () => {
    const off = { farDone: false, closeDone: false, sweepDone: false }
    const on = { farDone: true, closeDone: true, sweepDone: true }
    const noneD = renderToStaticMarkup(createElement(Part1DrawingCaption, off))
    expect(noneD).toContain('How to read the drawing')
    expect(noneD).not.toContain('Look at')
    const noneG = renderToStaticMarkup(createElement(Part1GraphCaption, off))
    expect(noneG).toContain('How to read the graph')
    expect(noneG).not.toContain('Look at')
    // numbers for passes not yet run are not shown (§12)
    expect(noneG).not.toContain('14.4°')
    expect(noneG).not.toContain('7.0°')
    const farOnly = renderToStaticMarkup(createElement(Part1DrawingCaption, { farDone: true, closeDone: false, sweepDone: false })).replace(/<!-- -->/g, '')
    expect(farOnly).toContain('9.5°')
    expect(farOnly).not.toContain('28.5°')
    expect(farOnly).toContain('Run the close pass')
    const drawing = renderToStaticMarkup(createElement(Part1DrawingCaption, on)).replace(/<!-- -->/g, '')
    expect(drawing).toContain('Look at')
    expect(drawing).toContain('What it means')
    expect(drawing).toContain('Why it matters')
    expect(drawing).toContain('9.5°')
    expect(drawing).toContain('28.5°')
    expect(drawing).not.toContain('How to read the graph')
    expect(drawing).toContain('How aim is counted.')
    expect(drawing).toContain('light-year')
    expect(drawing).toContain('graph paper')
    expect(drawing).toContain('A worked example of the aim.')
    expect(drawing).toContain('rolling a ball in a straight line past a post')
    expect(drawing).not.toContain('circle-radii')
    expect(drawing).not.toContain('right angles')
    expect(drawing).toContain('aims of 0.7 and smaller fall in')
    const graphCap = renderToStaticMarkup(createElement(Part1GraphCaption, on)).replace(/<!-- -->/g, '')
    expect(graphCap).toContain('14.3°')
    expect(graphCap).toContain('7.0°')
    expect(graphCap).toContain('35.2°')
    expect(graphCap).toContain('28.6°')
    expect(graphCap).not.toContain('How to read the drawing')
  })
})

describe('Gravity 8 renders (Part 2)', () => {
  it('Part 2 is not on the page before the first pass has finished', () => {
    const html = renderToStaticMarkup(createElement(LightBendingExperiment, {}))
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Launch with my aim')
  })

  it('the Part 2 drawing shows grey Part 1 paths and the learner\'s pink pass', () => {
    const html = renderToStaticMarkup(
      createElement(FlybyDrawing, {
        current: pass(2),
        color: '#f472b6',
        beamLabel: 'Your light beam',
        showHorizon: true,
        guess1: null,
        references: [{ label: 'Part 1: aim 3.0', aim: 3, points: pass(3).points }],
      })
    )
    expect(html).toContain('Part 1: aim 3.0')
    expect(html).toContain('Aim: 2.0')
    expect(html).toContain('Bent by 14.4°')
    expect(html).not.toContain('stroke="#ffffff"')
  })

  it('the Part 2 captions give worked numbers and look-at items only after a pass, split by picture', () => {
    const noneD = renderToStaticMarkup(createElement(Part2DrawingCaption, { yours: [], sweepDone: false }))
    expect(noneD).toContain('How to read the drawing')
    expect(noneD).not.toContain('Look at')
    const noneG = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [], sweepDone: false }))
    expect(noneG).toContain('How to read the graph')
    expect(noneG).not.toContain('worked moment, from your latest pass')
    const one = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [2], sweepDone: false })).replace(/<!-- -->/g, '')
    expect(one).toContain('A worked moment, from your latest pass.')
    expect(one).toContain('14.4°')
    expect(one).toContain('28.6°')
    expect(one).toContain('Look at')
    expect(one).not.toContain('against the amber curve')
    const withCurve = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [2, 1], sweepDone: true }))
    expect(withCurve).toContain('against the amber curve')
    expect(withCurve).toContain('one against another')
    const drawing = renderToStaticMarkup(createElement(Part2DrawingCaption, { yours: [2], sweepDone: true }))
    expect(drawing).toContain('against the grey paths')
    const fell = renderToStaticMarkup(createElement(Part2GraphCaption, { yours: [0.5], sweepDone: true }))
    expect(fell).toContain('falls in')
  })
})

describe('Gravity 8 renders (Part 3)', () => {
  const G1 = guesses('yes', 'more', 'more')
  const html = (props: Partial<Parameters<typeof LightBendingResults>[0]>) =>
    renderToStaticMarkup(createElement(LightBendingResults, { farDone: false, closeDone: false, sweepDone: false, guesses: G1, yours: [], ...props })).replace(/<!-- -->/g, '')

  it('before any pass, no number is shown and a note says what to do', () => {
    const h = html({})
    expect(h).toContain('Run a pass in Part 1')
    expect(h).not.toContain('9.49')
    expect(h).not.toContain('9.5°')
    expect(h).not.toContain('0.6 percent')
    expect(h).not.toContain('NaN')
  })

  it('a row of numbers appears only for a pass that has run, with no verdict', () => {
    const h = html({ farDone: true })
    expect(h).toContain('9.49°')
    expect(h).toContain('19.10°')
    expect(h).toContain('not run yet')
    expect(h).not.toContain('28.47')
    expect(h).not.toContain('In fact')
    expect(h).not.toContain('That matches')
    expect(h).toContain('your guess')
    expect(h).toContain('Yes, it bends')
  })

  it('all three passes give the two tables with their notes, the check-up numbers and the guesses beside the results', () => {
    const h = html({ farDone: true, closeDone: true, sweepDone: true, yours: [2] })
    expect(h).toContain('Table 1: the passes you watched')
    expect(h).toContain('Table 2, check-up')
    expect((h.match(/What this table tells us/g) ?? []).length).toBe(2)
    expect(h).toContain('28.47°')
    expect(h).toContain('57.30°')
    expect(h).toContain('0.6 percent under')
    expect(h).toContain('2.0 percent under')
    expect(h).toContain('2.01')
    expect(h).toContain('Your guesses, beside the results')
    expect(h).toContain('trial values')
    expect(h).not.toContain('NaN')
  })

  it('the guess tag moves with the learner\'s answer and never changes a number', () => {
    const a = html({ farDone: true, closeDone: true, sweepDone: true, guesses: guesses('yes', 'more', 'more') })
    const b = html({ farDone: true, closeDone: true, sweepDone: true, guesses: guesses('no', 'less', 'same') })
    expect(a).toContain('Yes, it bends')
    expect(b).toContain('No, it stays straight')
    expect(b).toContain('closer bends less')
    expect(a.replace(/Yes, it bends|closer bends more|real bends more/g, '')).toContain('28.47°')
    expect(b).toContain('28.47°')
  })
})
