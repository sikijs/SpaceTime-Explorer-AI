import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MoreLessSameChoice, YesNoChoice } from '../physics/gpsTimeDilationExperiment'
import { GpsTimeDilationExperiment, OrbitRunNotice } from './GpsTimeDilationExperiment'
import {
  EffectGraph,
  OrbitDrawing,
  Part1DrawingCaption,
  Part1GraphCaption,
  Part2DrawingCaption,
  Part2GraphCaption,
} from './GpsTimeDilationPictures'
import type { OrbitKey } from './GpsTimeDilationPictures'
import { GpsTimeDilationResults } from './GpsTimeDilationResults'
import { GpsTimeDilationExplanation, GpsTimeDilationTutor } from './GpsTimeDilationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and
// the feature beside it is drawn. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const guesses = (speed: MoreLessSameChoice, balance: YesNoChoice, gps: MoreLessSameChoice) => ({ speed, balance, gps })
const ALL: OrbitKey[] = ['iss', 'gps', 'geostationary']
const graph = (props: Partial<Parameters<typeof EffectGraph>[0]>) =>
  clean(renderToStaticMarkup(createElement(EffectGraph, { done: [], curvesDone: false, guesses: null, ...props })))

describe('Gravity 9 renders (Part 1)', () => {
  it('the page renders at rest: Part 1, words box, one link and Start over, no later Part and no white mark', () => {
    const html = clean(renderToStaticMarkup(createElement(GpsTimeDilationExperiment, {})))
    expect(html).toContain('Gravity and Curved Spacetime 9: Real Clocks in Orbit')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('spaceplace.nasa.gov/orbits/en/')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the introduction says the guesses never change the pictures and gives no answer away', () => {
    const html = clean(renderToStaticMarkup(createElement(GpsTimeDilationExperiment, {})))
    expect(html).toContain('Your guesses never change the real pictures or the numbers')
    expect(html).toContain('drawn on the pictures in white')
    expect(html).toContain('bank account')
    expect(html).toContain('Some new words')
    expect(html).toContain('the same time Earth takes to spin once')
    expect(html).not.toContain('exactly one day')
    expect(html).not.toContain('swimmer')
    expect(html).not.toContain('moves slower than one orbiting lower')
    expect(html).not.toContain('Putting It All Together')
    expect(html).not.toContain('3,186')
    expect(html).not.toContain('+38')
    expect(html).not.toContain('38.5')
    expect(html).not.toContain('ashby')
    expect(html).not.toContain('Ashby')
    expect(html).not.toContain('time-travel')
    expect(html).not.toContain('Types_of_orbits')
    expect(html).toContain('after the tutor')
  })

  it('the three guesses are the approved wording, with the neutral first question', () => {
    const html = clean(renderToStaticMarkup(createElement(GpsTimeDilationExperiment, {})))
    expect(html).toContain('A satellite&#x27;s speed slows its clock down. As the satellite&#x27;s orbit gets higher, does that slowing get bigger, get smaller, or stay about the same?')
    expect(html).toContain('A bigger slowing')
    expect(html).toContain('A smaller slowing')
    expect(html).toContain('About the same slowing')
    expect(html).toContain('exactly cancel')
    expect(html).toContain('At GPS altitude (about 20,200 km)')
  })

  it('the words box holds back the effect formulas and the balance altitude until after the tutor', () => {
    const html = clean(renderToStaticMarkup(createElement(GpsTimeDilationExperiment, {})))
    expect(html).toContain('Microsecond')
    expect(html).not.toContain('Speed effect (formula)')
    expect(html).not.toContain('Height effect (formula)')
    expect(html).not.toContain('Balance altitude')
    expect(html).not.toContain('Orbital speed formula')
  })

  it('a bold notice above Run says all three orbits are needed and tracks them', () => {
    const rest = clean(renderToStaticMarkup(createElement(GpsTimeDilationExperiment, {})))
    expect(rest).toContain('Run all three orbits')
    expect(rest).toContain('Press Run three times')
    const one = clean(renderToStaticMarkup(createElement(OrbitRunNotice, { done: ['iss'], selected: 'gps', isRunning: false })))
    expect(one).toContain('1 of 3 orbits done. 2 more to run')
    expect(one).toContain('Press Run again')
    expect(one).toContain('GPS orbit (next)')
    const two = clean(renderToStaticMarkup(createElement(OrbitRunNotice, { done: ['iss', 'gps'], selected: 'geostationary', isRunning: true })))
    expect(two).toContain('2 of 3 orbits done. 1 more to run')
    expect(two).toContain('Geostationary orbit (running)')
    const all = clean(renderToStaticMarkup(createElement(OrbitRunNotice, { done: ALL, selected: 'iss', isRunning: false })))
    expect(all).toContain('All 3 orbits are done')
    expect(all).not.toContain('Press Run')
  })
})

describe('Gravity 9 orbit drawing', () => {
  const draw = (props: Partial<Parameters<typeof OrbitDrawing>[0]>) =>
    clean(renderToStaticMarkup(createElement(OrbitDrawing, { done: [], current: null, progress: 1, showBalance: false, yoursKm: null, ...props })))

  it('labels Earth and the scale note, and shows no ring, altitude or balance ring before a run', () => {
    const html = draw({})
    expect(html).toContain('Earth')
    expect(html).toContain('Not to scale')
    expect(html).not.toContain('Altitude:')
    expect(html).not.toContain('Balance altitude')
    expect(html).not.toContain('NaN')
  })

  it('a finished run labels the orbit, the satellite and the altitude', () => {
    const html = draw({ current: 'gps' })
    expect(html).toContain('Satellite (GPS)')
    expect(html).toContain('Altitude: 20,200 km')
    expect(html).not.toContain('NaN')
  })

  it('the altitude line waits until the run has finished', () => {
    const html = draw({ current: 'gps', progress: 0.5 })
    expect(html).toContain('Satellite (GPS)')
    expect(html).not.toContain('Altitude: 20,200 km')
    expect(html).not.toContain('NaN')
  })

  it('the balance ring is drawn only when all three orbits have run, and gives its altitude', () => {
    expect(draw({ done: ['iss', 'gps'], current: 'geostationary' })).not.toContain('Balance altitude')
    const html = draw({ done: ['iss', 'gps'], current: 'geostationary', showBalance: true })
    expect(html).toContain('Balance altitude')
    expect(html).toContain('3,186 km')
  })

  it('Part 2 draws the learner\'s own altitude in pink', () => {
    const html = draw({ done: ALL, yoursKm: 2000 })
    expect(html).toContain('Your satellite: 2,000 km')
    expect(html).toContain('#f472b6')
    expect(html).not.toContain('NaN')
  })

  it('earlier orbits are named in a legend of faint rings', () => {
    const html = draw({ done: ['iss'], current: 'gps' })
    expect(html).toContain('Faint grey rings: orbits already run')
    expect(html).toContain('ISS: 400 km')
  })
})

describe('Gravity 9 graph and white marks', () => {
  it('has labelled axes, the zero line and no mark, curve or dot before a run', () => {
    const html = graph({})
    expect(html).toContain('Altitude above Earth')
    expect(html).toContain('µs per day')
    expect(html).toContain('Same as a ground clock')
    expect(html).toContain('the clock runs fast')
    expect(html).toContain('the clock runs slow')
    expect(html).not.toContain('Speed effect (slowing)')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
  })

  it('each run adds three labelled dots, and the curves wait for the third', () => {
    const one = graph({ done: ['iss'] })
    expect(one).toContain('ISS 400 km')
    expect(one).toContain('Speed effect (slowing)')
    expect(one).toContain('Height effect (speeding up)')
    expect(one).toContain('Net: both together')
    expect(one).toContain('net −24.7')
    expect(one).not.toContain('<polyline')
    const three = graph({ done: ALL, curvesDone: true })
    expect((three.match(/<polyline/g) ?? []).length).toBe(3)
    expect(three).not.toContain('NaN')
  })

  it('no white mark appears without a guess, even when the curves are drawn', () => {
    expect(graph({ done: ALL, curvesDone: true })).not.toContain('YOUR GUESS')
  })

  it('guess 3 appears once the GPS orbit has run, and guesses 1 and 2 only after the curves', () => {
    const gpsOnly = graph({ done: ['gps'], guesses: guesses('less', 'yes', 'more') })
    expect(gpsOnly).toContain('YOUR GUESS')
    expect(gpsOnly).toContain('faster')
    expect(gpsOnly).not.toContain('a smaller slowing')
    expect(gpsOnly).not.toContain('yes, there is one')
    const issOnly = graph({ done: ['iss'], guesses: guesses('less', 'yes', 'more') })
    expect(issOnly).not.toContain('YOUR GUESS')
    const full = graph({ done: ALL, curvesDone: true, guesses: guesses('less', 'yes', 'more') })
    expect(full).toContain('a smaller slowing')
    expect(full).toContain('yes, there is one')
    expect((full.match(/YOUR GUESS/g) ?? []).length).toBe(3)
  })

  it('the marks follow the guesses and differ when the guesses differ', () => {
    const a = graph({ done: ALL, curvesDone: true, guesses: guesses('more', 'no', 'less') })
    const b = graph({ done: ALL, curvesDone: true, guesses: guesses('less', 'yes', 'more') })
    expect(a).toContain('a bigger slowing')
    expect(a).toContain('no, there is not')
    expect(a).toContain('slower')
    expect(a).not.toBe(b)
    const same = graph({ done: ALL, curvesDone: true, guesses: guesses('same', 'yes', 'same') })
    expect(same).toContain('about the same slowing')
    expect(same).toContain('same rate')
    expect(same).not.toContain('NaN')
  })

  it('the learner\'s own altitudes are pink dots outlined in each effect\'s colour, the last one labelled', () => {
    const html = graph({ done: ALL, curvesDone: true, yours: [2000, 5000] })
    expect(html).toContain('#f472b6')
    expect(html).toContain('your altitude 5,000 km: net +9.60 µs/day')
    expect(html).not.toContain('your altitude 2,000 km')
    expect(html).not.toContain('NaN')
  })
})

describe('Gravity 9 Part 2 lead', () => {
  it('names the three numbers and what the pink dots are (visible once Part 2 shows; checked in the source of the page)', () => {
    // Part 2 appears only after the first Run, so the lead cannot be rendered statically; check the source text instead.
    const src = readFileSync(new URL('./GpsTimeDilationExperiment.tsx', import.meta.url), 'utf8')
    expect(src).toContain('You will get three numbers, in microseconds per day')
    expect(src).toContain('the slowing from the satellite&rsquo;s speed, the speeding up from its height, and the net of the two')
    expect(src).toContain('one for each number, each outlined in the colour of its curve')
  })
})

describe('Gravity 9 captions (Part 1 and Part 2)', () => {
  const cap = (el: ReturnType<typeof createElement>) => clean(renderToStaticMarkup(el))

  it('the drawing caption says it is not to scale and gives look-at items only for what is drawn', () => {
    const none = cap(createElement(Part1DrawingCaption, { done: [] }))
    expect(none).toContain('How to read the orbit drawing')
    expect(none).toContain('Not to scale')
    expect(none).not.toContain('Look at:')
    const two = cap(createElement(Part1DrawingCaption, { done: ['iss', 'gps'] }))
    expect(two).toContain('Look at:')
    expect(two).toContain('What it means:')
    expect(two).toContain('Why it matters:')
    expect(two).toContain('about 51 times higher')
    expect(two).not.toContain('looks fixed in the sky')
    const all = cap(createElement(Part1DrawingCaption, { done: ALL }))
    expect(all).toContain('looks fixed in the sky')
    expect(all).toContain('does not show Earth spinning')
    expect(all).not.toContain('exactly one day')
  })

  it('the graph caption holds back the GPS numbers, the curves and the crossover until they are drawn', () => {
    const iss = cap(createElement(Part1GraphCaption, { done: ['iss'] }))
    expect(iss).toContain('How to read the graph')
    expect(iss).toContain('microseconds per day')
    expect(iss).toContain('The numbers for a worked moment appear here once the GPS orbit has been run')
    expect(iss).toContain('−24.74')
    expect(iss).not.toContain('+38.51')
    expect(iss).not.toContain('3,186')
    expect(iss).not.toContain('violet curve from left to right')
    const gps = cap(createElement(Part1GraphCaption, { done: ['gps'] }))
    expect(gps).toContain('+38.51')
    expect(gps).not.toContain('3,186')
    const all = cap(createElement(Part1GraphCaption, { done: ALL }))
    expect(all).toContain('violet curve from left to right')
    expect(all).toContain('3,186')
  })

  it('the captions explain the white marks as markers and name every colour', () => {
    const html = cap(createElement(Part1GraphCaption, { done: ['iss'] }))
    expect(html).toContain('only a marker')
    expect(html).toContain('direction')
    expect(html).toContain('violet')
    expect(html).toContain('green')
    expect(html).toContain('amber')
    expect(html).toContain('white marks')
  })

  it('Part 2 captions say what appears after the first run and then give the worked moment', () => {
    const before = cap(createElement(Part2GraphCaption, { yours: [], curvesDone: false }))
    expect(before).toContain('appear here after your first run')
    expect(cap(createElement(Part2DrawingCaption, { yours: [], curvesDone: false }))).toContain('appears here after your first run')
    const after = cap(createElement(Part2GraphCaption, { yours: [2000], curvesDone: true }))
    expect(after).toContain('A worked moment, from your latest altitude')
    expect(after).toContain('−8.52')
    expect(after).toContain('Look at:')
    const drawing = cap(createElement(Part2DrawingCaption, { yours: [2000], curvesDone: true }))
    expect(drawing).toContain('below the ring')
  })
})

describe('Gravity 9 results (Part 3)', () => {
  const results = (props: Partial<Parameters<typeof GpsTimeDilationResults>[0]>) =>
    clean(renderToStaticMarkup(createElement(GpsTimeDilationResults, { done: [], guesses: null, yours: [], ...props })))

  it('shows no number for an orbit that has not run', () => {
    const none = results({})
    expect(none).toContain('Run an orbit in Part 1')
    expect(none).not.toContain('+38.51')
    expect(none).not.toContain('3.873')
    const iss = results({ done: ['iss'] })
    expect(iss).toContain('7.673 km/s')
    expect(iss).toContain('not run yet')
    expect(iss).not.toContain('+38.51')
    expect(iss).not.toContain('3.873')
  })

  it('has two tables, a "What this table tells us" note under each, and the check-up rows once run', () => {
    const html = results({ done: ALL })
    expect(html).toContain('Table 1: the orbits you watched')
    expect(html).toContain('Table 2, check-up')
    expect((html.match(/What this table tells us/g) ?? []).length).toBe(2)
    expect(html).toContain('+38.51 µs/day')
    expect(html).toContain('4.4647 × 10⁻¹⁰ faster (Ashby 2003)')
    expect(html).toContain('4.458 × 10⁻¹⁰ faster')
    expect(html).toContain('close: 0.16 percent apart')
    expect(html).toContain('close: 0.12 percent apart')
    expect(html).toContain('the same')
    expect(html).toContain('How sure')
    expect(html).not.toContain('NaN')
  })

  it('shows the guesses only, with tags and no verdict', () => {
    const html = results({ done: ALL, guesses: guesses('more', 'no', 'less') })
    expect(html).toContain('Your guesses, beside the results')
    expect(html).toContain('a bigger slowing')
    expect(html).toContain('No, there is not')
    expect(html).toContain('slower than a ground clock')
    expect(html).toContain('your guess')
    expect(html).toContain('The tutor marks them')
    expect(html).not.toContain('That was right')
    expect(html).not.toContain('not right')
    expect(html).not.toContain('matched')
  })

  it('a guess changes nothing in the tables themselves', () => {
    const strip = (h: string) => h.replace(/<span[^>]*>your guess<\/span>/g, '')
    const a = results({ done: ALL, guesses: guesses('more', 'no', 'less') })
    const b = results({ done: ALL, guesses: guesses('less', 'yes', 'more') })
    const tables = (h: string) => strip(h).match(/<table[\s\S]*?<\/table>/g)!.join('')
    expect(tables(a).replace(/Yes, it|your guess/g, '')).toContain('+38.51')
    expect(tables(a).match(/\d+\.\d+/g)).toEqual(tables(b).match(/\d+\.\d+/g))
  })

  it('the pink line follows the learner\'s latest altitude and says it is only a trial value', () => {
    const html = results({ done: ALL, yours: [2000, 5000] })
    expect(html).toContain('Your latest altitude, 5,000 km')
    expect(html).toContain('+9.60')
    expect(html).toContain('trial values of your own')
  })
})

describe('Gravity 9 tutor (Part 4)', () => {
  const tutor = (g: [MoreLessSameChoice, YesNoChoice, MoreLessSameChoice]) =>
    clean(renderToStaticMarkup(createElement(GpsTimeDilationTutor, { speedGuess: g[0], balanceGuess: g[1], gpsGuess: g[2] })))

  it('the first prompt states no outcome and no verdict', () => {
    const html = tutor(['less', 'yes', 'more'])
    expect(html).toContain('Which of the three curves is closest to the zero line at the GPS altitude')
    expect(html).not.toContain('It ran fast')
    expect(html).not.toContain('3,186')
    expect(html).not.toContain('+38')
    expect(html).not.toContain('That was right')
    expect(html).not.toContain('Your guesses, marked')
  })

  const explain = (a: MoreLessSameChoice, b: YesNoChoice, c: MoreLessSameChoice) =>
    clean(renderToStaticMarkup(createElement(GpsTimeDilationExplanation, { speedGuess: a, balanceGuess: b, gpsGuess: c })))

  it('the explanation marks each guess right when it is right', () => {
    const html = explain('less', 'yes', 'more')
    expect(html).toContain('Your guesses, marked')
    expect((html.match(/That was right\./g) ?? []).length).toBe(3)
    expect(html).not.toContain('not right')
    expect(html).toContain('a smaller slowing')
    expect(html).toContain('3,186 km')
    expect(html).toContain('+38.51 µs/day')
    expect(html).toContain('within 0.16 percent')
    expect(html).toContain('within 0.12 percent')
    expect(html).toContain('10.229 999 995 43 MHz')
    expect(html).toContain('a few miles each day')
    expect(html).toContain('the first experiment in this journey')
    expect(html).not.toContain('the whole project')
    expect(html).not.toContain('NaN')
  })

  it('the explanation marks each guess not right when it is wrong', () => {
    const html = explain('more', 'no', 'less')
    expect((html.match(/That was not right\./g) ?? []).length).toBe(3)
    expect(html).not.toContain('That was right')
    expect(html).toContain('a bigger slowing')
    expect(html).toContain('no, there is not')
    expect(html).toContain('the clock runs faster')
  })
})
