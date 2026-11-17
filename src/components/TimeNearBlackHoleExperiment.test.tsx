import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  runPartOne,
  runTimeNearBlackHoleExperiment,
  twoHolesAtTwoRadii,
} from '../physics/timeNearBlackHoleExperiment'
import type { ApproximationGuess, JustOutsideGuess, MassGuess } from '../physics/timeNearBlackHoleExperiment'
import { TimeNearBlackHoleExperiment } from './TimeNearBlackHoleExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { BlackHoleOptionsNote, DistanceTable, PartTwoGuide, TimeNearBlackHoleIntro, TimeNearBlackHoleLinks, TimeNearBlackHoleRealTests, timeNearBlackHoleWordsEntries } from './TimeNearBlackHoleIntro'
import {
  ClocksPicture,
  FactorPicture,
  ClocksCaption,
  FactorCaption,
  ReadingsCaption,
  TwoHolesCaption,
  ReadingsPicture,
  TwoHolesPicture,
} from './TimeNearBlackHolePictures'
import { TimeNearBlackHoleResults } from './TimeNearBlackHoleResults'
import { TimeNearBlackHoleExplanation, TimeNearBlackHoleTutor } from './TimeNearBlackHoleTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks
// appear exactly when a guess is given and follow it, the real tables never change with a guess, and no page says "right" or "wrong" before
// the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
// A verdict on a guess. The page's own "does not say whether they are right" is taken out first.
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong/g, '')
const WHITE = 'stroke="#ffffff"'
const justOutsideGuesses: JustOutsideGuess[] = ['same', 'half', 'tenth', 'stopped']
const massGuesses: MassGuess[] = ['small', 'giant', 'same']
const approximationGuesses: ApproximationGuess[] = ['still-accurate', 'worse-closer', 'never-accurate']

const partOne = runPartOne()
const holes = twoHolesAtTwoRadii()
const bars = {
  small: { label: holes.small.preset.label, factor: holes.small.factor, distanceKm: holes.small.distanceKm },
  giant: { label: holes.giant.preset.label, factor: holes.giant.factor, distanceKm: holes.giant.distanceKm },
}
const factorPicture = (guesses: { justOutside: JustOutsideGuess; approximation: ApproximationGuess } | null) =>
  render(createElement(FactorPicture, { title: 'Picture 2', result: partOne, guesses }))
const results = (j: JustOutsideGuess, m: MassGuess, a: ApproximationGuess, two = null as ReturnType<typeof runTimeNearBlackHoleExperiment> | null) =>
  render(createElement(TimeNearBlackHoleResults, { partOne, justOutsideGuess: j, massGuess: m, approximationGuess: a, partTwo: two }))
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')

describe('Black Holes 2 renders (at rest)', () => {
  const html = render(createElement(TimeNearBlackHoleExperiment, {}))

  it('renders the heading, Part 1, the words box, the real tests and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 2: Time Near a Black Hole: Does a Clock Ever Stop?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('Where to read about these tests'))
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Where to read about these tests (as of November 2026)')
    for (const href of [
      'nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal',
      'nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale',
      'nist.gov/node/1879246',
      'eso.org/public/news/eso1825/',
      'eso.org/public/news/eso1907/',
      'science.nasa.gov/universe/black-holes/types/',
      'arxiv.org/abs/2109.12238',
    ])
      expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
  })

  it('has an always-visible Start over, greyed out, and a disabled Run, and no "Change prediction"', () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('draws no white mark, no NaN and no picture before the run', () => {
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('<svg viewBox="0 0 640 360"')
    expect(html).toContain('Pictures 1 to 3 appear here when you press Run')
  })

  it('asks the three questions as three groups of buttons', () => {
    for (const label of ['About one tenth as fast', 'The one near the giant black hole', 'It will be accurate far from the horizon, but get worse the closer you get'])
      expect(html).toContain(label)
  })

  it('does not give away any guess before the run (CLAUDE.md §12)', () => {
    for (const giveaway of ['reaches zero', 'is zero at the horizon', 'does not depend on the mass', 'only on how many horizon radii', 'pull apart', 'frozen']) {
      expect(html).not.toContain(giveaway)
    }
    expect(html).not.toContain('√(1 −')
    expect(html).not.toContain('5.97')
    expect(html).not.toContain('0.0995')
  })

  it('says that predictions never change the real pictures or tables, in white, and which settings do', () => {
    expect(html).toContain('Your guesses never change the real pictures or tables')
    expect(html).toContain('in <strong>white</strong>')
    expect(html).toContain('do change the drawings in Part 2')
  })

  it('does not put the held-back NASA links above Part 1', () => {
    expect(html).not.toContain('what-happens-when-something-gets-too-close')
    expect(html).not.toContain('beyond-the-brink')
  })
})

describe('the words box (the shared ReferencePanel, as in the other experiments)', () => {
  const panel = (afterRun: boolean) => render(createElement(ReferencePanel, { entries: timeNearBlackHoleWordsEntries(afterRun) }))

  it('uses the shared blue panel with the standard summary line', () => {
    const h = panel(false)
    expect(h).toContain('<details')
    expect(h).toContain('Words and formulas: click to open a quick reference')
    expect(h).toContain('border:2px solid #0066cc')
  })

  it('defines every term the page introduces, including those from the expanded sections', () => {
    const h = panel(false)
    for (const term of ['Far-away clock', 'Hovering clock', 'Slowing factor', 'First-order formula', 'Logarithmic scale', 'Thought experiment', 'Atomic clock', 'Escape speed', 'Wavelength', 'Microsecond', '10⁻¹⁹', 'Light-year', 'Astronomical unit (AU)']) {
      expect(h).toContain(term)
    }
  })

  it('holds back the formula until after the first run', () => {
    const before = panel(false)
    const after = panel(true)
    expect(before).not.toContain('√(1 − r_s')
    expect(before).toContain('More words')
    expect(after).toContain('√(1 − r_s ÷ r)')
    expect(after).toContain('5.97 s')
    expect(after).not.toContain('More words')
  })
})

describe('where the real-tests block sits', () => {
  const page = render(createElement(TimeNearBlackHoleExperiment, {}))
  const at = (needle: string) => page.indexOf(needle)

  it('is right after the “Clocks really do tick” section and before “Why a black hole is the strongest test”', () => {
    expect(at('Clocks really do tick at different rates')).toBeGreaterThan(0)
    expect(at('Where to read about these tests')).toBeGreaterThan(at('Clocks really do tick at different rates'))
    expect(at('Where to read about these tests')).toBeGreaterThan(at('The longest-running test.'))
    expect(at('Where to read about these tests')).toBeGreaterThan(at('Drawing 1: a clock higher up ticks a little faster'))
    expect(at('Where to read about these tests')).toBeLessThan(at('Why a black hole is the strongest test'))
  })

  it('appears once only, and is no longer after “What we assume”', () => {
    expect(count(page, 'Where to read about these tests')).toBe(1)
    expect(at('Where to read about these tests')).toBeLessThan(at('What we assume.'))
  })

  it('says what the list is: the tests above, where each was reported, and one more', () => {
    expect(page).toContain('These are the tests described above, with where each was reported, and one more that reaches nearer to a black hole')
  })

  it('keeps its three dated entries and their links', () => {
    for (const href of ['nist-pair-aluminum-atomic-clocks', 'eso.org/public/news/eso1825/', 'jila-atomic-clocks-measure-einsteins-general-relativity']) expect(page).toContain(href)
    for (const date of ['2010.', '26 July 2018.', '16 February 2022.']) expect(page).toContain(date)
  })
})

describe('the introduction, the real tests and the links', () => {
  it('render without NaN and with the three real tests, each with a link', () => {
    const intro = render(createElement(TimeNearBlackHoleIntro, {}))
    const tests = render(createElement(TimeNearBlackHoleRealTests, {}))
    const links = render(createElement(TimeNearBlackHoleLinks, {}))
    for (const h of [intro, tests, links]) expect(h).not.toContain('NaN')
    expect(count(tests, '<a ')).toBe(3)
    expect(links).toContain('Go deeper')
    expect(intro).toContain('33 centimeters')
    expect(intro).toContain('Black Holes 5')
  })
})

describe('the "Clocks really do tick" and "Why a black hole is the strongest test" sections', () => {
  const intro = render(createElement(TimeNearBlackHoleIntro, {}))

  it('give the clock tests their sourced numbers and the module’s worked examples', () => {
    for (const text of ['75-meter optical fiber', '90 billionths of a second', '100,000', '37 seconds', '317 billion years', '11.4 kilometers', '38 millionths of a second']) {
      expect(intro).toContain(text)
    }
    expect(intro).toContain('this page’s own arithmetic')
  })

  it('give the escape-speed ladder and the three black holes with their sources and module-computed sizes', () => {
    for (const text of ['11.2 kilometers per second', '618 kilometers per second', '299,792 kilometers per second', '55.2 times', 'about 27,000 light-years (ESO)', 'about 55 million light-years (ESO)', 'about 4 million Suns (ESO)', 'Neptune’s orbit (30 AU)', 'doughnut on the Moon']) {
      expect(intro).toContain(text)
    }
    expect(intro).toContain('29.5 km')
    expect(intro).toContain('12.7 million km')
    expect(intro).toContain('19.2 billion km')
    expect(intro).toContain('rounded 4.3 million Suns')
  })

  it('still give nothing away: no zero at the horizon, no mass independence, no verdict', () => {
    for (const giveaway of ['reaches zero', 'depends only on', 'does not matter', 'ticks at one tenth', 'frozen']) expect(intro).not.toContain(giveaway)
    // ("correct" is a fair word here: GPS clocks are corrected.) What must not appear is a verdict on a guess.
    expect(noOwnWords(intro)).not.toMatch(/\bwrong\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i)
    expect(intro).not.toContain('NaN')
  })
})

describe('the "Two clocks (new words)" section', () => {
  const intro = render(createElement(TimeNearBlackHoleIntro, {}))

  it('explains why two clocks, the far-away clock, the hovering clock, the comparison, the factor and the thought experiment', () => {
    for (const text of [
      'Why do we need two clocks?',
      'The far-away clock: our reference.',
      'The hovering clock: the one near the black hole.',
      'How do we compare them from far away?',
      'What we compare: the slowing factor.',
      'A thought experiment.',
      'helicopter',
      'identical',
    ]) {
      expect(intro).toContain(text)
    }
  })

  it('gets its sizes from the module: 2 horizon radii is about 59.1 km around the 10-Sun hole, whose horizon radius is about 29.5 km', () => {
    expect(intro).toContain('59.1 km')
    expect(intro).toContain('29.5 km')
  })

  it('works the slowing factor with made-up numbers and says they are not results', () => {
    expect(intro).toContain('36 ÷ 60 = 0.6')
    expect(intro).toContain('60% of the normal rate')
    expect(intro).toContain('These are not the experiment’s results')
  })

  it('does not reveal the actual factor or its value at 1.01 or 2 horizon radii', () => {
    for (const hidden of ['0.0995', '0.7071', '5.97', '42.43']) expect(intro).not.toContain(hidden)
  })
})

describe('the "What happens" and "What we assume" sections', () => {
  const intro = render(createElement(TimeNearBlackHoleIntro, {}))

  it('lay out the order of the page in five steps, with the run length and the Start over button', () => {
    for (const text of [
      'You make three guesses (Part 1).',
      'You press Run.',
      'The pictures fill in.',
      'Parts 2, 3 and 4 appear.',
      'You can start over.',
      'about 10 seconds of real time',
      'Playing it faster or slower would not change what the clocks read',
      'grayed out until there is something to clear',
    ]) {
      expect(intro).toContain(text)
    }
    expect(intro).toContain('Your job.')
    expect(intro).toContain('What to look for.')
  })

  it('explain each of the seven assumptions in plain words, with the module’s numbers', () => {
    for (const text of [
      'It is a thought experiment.',
      'Only two clocks, each held at rest, are compared.',
      'Nothing inside the horizon is modeled.',
      'The formula for the slowing is given, not derived.',
      'The far-away clock is treated as infinitely far away.',
      'Distance is measured as in Black Holes 1.',
      'The masses are rounded.',
      'at 1.001 horizon radii',
      'divide',
      'Black Holes 3',
      'Black Holes 5',
      'Black Holes 8',
    ]) {
      expect(intro).toContain(text)
    }
    expect(intro).toContain('29.8 km')
  })

  it('keep the playback time shared with the animation and the caption', () => {
    expect(render(createElement(ClocksCaption, { complete: false, result: partOne }))).toContain('about 10 seconds of real time')
  })
})

describe('the notes under the Part 1 questions', () => {
  const page = render(createElement(TimeNearBlackHoleExperiment, {}))

  it('add a situation, the meaning of the choices and what the learner already knows, under each of the three questions', () => {
    expect(count(page, 'The situation\\.')).toBeGreaterThanOrEqual(3 + 0)
    expect(count(page, 'What the choices mean\\.')).toBe(3)
    expect(page).toContain('What you already know.')
    expect(page).toContain('What “accurate” means.')
    expect(page).toContain('Something to think about.')
    expect(page).toContain('There are three questions.')
    expect(page).toContain('You can change an answer until you press Run')
  })

  it('give real sizes from the module: the 1% clock is about 29.8 km out, 295 meters outside the edge; the two clocks are 59.1 km and 38.4 billion km out', () => {
    expect(page).toContain('about 29.8 km from the center')
    expect(page).toContain('about 295 meters outside the edge')
    expect(page).toContain('about 59.1 km from the center of the small one')
    expect(page).toContain('about 38.4 billion km, about 257 AU from the center of M87*')
    expect(page).toContain('650 million times as heavy')
  })

  it('count ticks for question 1 from the module’s heights: 10, 5 and 1', () => {
    expect(page).toContain('about 10 times if it runs at the same rate')
    expect(page).toContain('about 5 times if it is half as fast')
    expect(page).toContain('about 1 time if it is one tenth as fast')
  })

  it('give nothing away before the run: no rate at 1.01 or 2 radii, no mass independence, no verdict', () => {
    // The visible text only: the raw markup has style values such as "0.75rem".
    const text = page.replace(/<[^>]+>/g, ' ')
    for (const hidden of ['0.0995', '0.7071', '5.97', '42.43', '0.505', '0.75', 'does not depend', 'reaches zero', 'frozen']) expect(text).not.toContain(hidden)
    // (The third answer option itself says "wrong everywhere near a black hole"; that is a choice, not a verdict.)
    const noChoices = noOwnWords(page).replace(/wrong everywhere near a black hole/g, '')
    expect(noChoices).not.toMatch(/\bwrong\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i)
  })

  it('keep the three approved questions and their buttons unchanged', () => {
    expect(page).toContain('only 1% farther from the center than the horizon is')
    expect(page).toContain('Which one ticks more slowly, compared with a clock far away?')
    expect(page).toContain('still be accurate right next to a black hole')
    for (const label of ['About the same rate', 'It has stopped', 'They tick at the same relative rate', 'Yes, it will still be about as accurate']) expect(page).toContain(label)
  })
})

const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length

describe('Picture 2 and its white marks', () => {
  it('draws no white mark without a guess, and no YOUR GUESS box', () => {
    const h = factorPicture(null)
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('YOUR GUESS')
    expect(h).toContain('your distance')
  })

  it('draws a white ring and two YOUR GUESS boxes with a guess, with the guess in each box', () => {
    const h = factorPicture({ justOutside: 'tenth', approximation: 'worse-closer' })
    expect(h).toContain(WHITE)
    expect(count(h, 'YOUR GUESS')).toBe(2)
    expect(h).toContain('guess 1: ticks at one tenth the rate (0.1)')
    expect(h).toContain('guess 3: accurate far away, worse closer in')
    expect(h).toContain('only a marker')
  })

  it('makes the mark follow guess 1: a different guess gives a different height', () => {
    const marks = justOutsideGuesses.map((j) => factorPicture({ justOutside: j, approximation: 'worse-closer' }))
    expect(new Set(marks).size).toBe(4)
  })

  it('does not change the real lines with a guess: the lines are the same whatever is guessed', () => {
    const path = (h: string) => (h.match(/<path d="M [^"]*"[^>]*stroke="#(22d3ee|fb923c)"/g) ?? []).join('|')
    const a = path(factorPicture({ justOutside: 'same', approximation: 'still-accurate' }))
    const b = path(factorPicture({ justOutside: 'stopped', approximation: 'never-accurate' }))
    expect(a.length).toBeGreaterThan(0)
    expect(a).toBe(b)
  })

  it('has no NaN', () => {
    for (const j of justOutsideGuesses) for (const a of approximationGuesses) expect(factorPicture({ justOutside: j, approximation: a })).not.toContain('NaN')
  })
})

describe('Picture 2b and its white marker', () => {
  const pic = (guess: MassGuess | null) => render(createElement(TwoHolesPicture, { ...bars, guess }))

  it('draws the two real bars with no mark without a guess', () => {
    const h = pic(null)
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('YOUR GUESS')
    expect(count(h, 'width="80"')).toBe(2)
    expect(h).toContain('0.7071')
    expect(h).toContain(bars.small.label)
    expect(h).toContain(bars.giant.label)
  })

  it('draws a different marker for each guess, in a YOUR GUESS box, and says it is a marker only', () => {
    const marks = massGuesses.map(pic)
    expect(new Set(marks).size).toBe(3)
    for (const h of marks) {
      expect(h).toContain(WHITE)
      expect(h).toContain('YOUR GUESS')
      expect(h).toContain('a marker only')
      expect(h).not.toContain('NaN')
    }
    expect(count(marks[0], 'r="16"')).toBe(1)
    expect(count(marks[1], 'r="16"')).toBe(1)
    expect(count(marks[2], 'r="16"')).toBe(2)
  })

  it('draws both bars at the same height whatever is guessed', () => {
    const heights = (h: string) => (h.match(/<rect x="\d+" y="[\d.]+" width="80"/g) ?? []).join('|')
    expect(heights(pic('small'))).toBe(heights(pic('giant')))
  })
})

describe('the clocks and the readings', () => {
  it('draw without NaN, with the final readings', () => {
    const clocks = render(createElement(ClocksPicture, { title: 'Picture 1', result: partOne, readings: { far: 60, hovering: partOne.hoveringClockReadingSeconds } }))
    expect(clocks).toContain('Reads 60.00 s')
    expect(clocks).toContain('Reads 5.97 s')
    expect(clocks).not.toContain('NaN')
    const readings = render(createElement(ReadingsPicture, { title: 'Picture 3', progress: 1, readings: { far: 60, hovering: 5.97 } }))
    expect(readings).not.toContain('NaN')
  })
})

describe('the Part 1 captions: one under each picture', () => {
  const clocks = (complete: boolean) => render(createElement(ClocksCaption, { complete, result: partOne }))
  const factor = (complete: boolean) => render(createElement(FactorCaption, { complete, result: partOne }))
  const twoHoles = () => render(createElement(TwoHolesCaption, { twoHoles: holes }))
  const readings = (complete: boolean) => render(createElement(ReadingsCaption, { complete, result: partOne }))
  const text = (h: string) => h.replace(/<[^>]+>/g, ' ')

  it('each has its own title naming its picture', () => {
    expect(clocks(true)).toContain('How to read Picture 1, the two clocks.')
    expect(factor(true)).toContain('How to read Picture 2, the rate against distance.')
    expect(twoHoles()).toContain('How to read Picture 2b, the same distance around two black holes.')
    expect(readings(true)).toContain('How to read Picture 3, the readings over time.')
  })

  it('the page puts each caption after its own picture and before the next picture, with the 2b caption only after the run', async () => {
    const source = await import('node:fs/promises').then((fs) => fs.readFile(new URL('./TimeNearBlackHoleExperiment.tsx', import.meta.url), 'utf-8'))
    const at = (needle: string) => source.indexOf(needle)
    const order = ['<ClocksPicture', '<ClocksCaption', '<FactorPicture', '<FactorCaption', '<TwoHolesPicture', '<TwoHolesCaption', '<ReadingsPicture', '<ReadingsCaption']
    const positions = order.map(at)
    expect(positions.every((p) => p > 0)).toBe(true)
    expect([...positions].sort((x, y) => x - y)).toEqual(positions)
    // the 2b picture and caption sit inside the part1Done branch, before the "appears when the run finishes" note
    const branch = source.slice(at('{part1Done ? ('), at('Picture 2b (the same distance around two black holes) appears'))
    expect(branch).toContain('<TwoHolesPicture')
    expect(branch).toContain('<TwoHolesCaption')
    // no combined caption is left
    expect(source).not.toContain('PartOneCaption')
  })

  it('before the run: every picture’s structure is explained, and no result number or "what to look for" appears', () => {
    for (const h of [clocks(false), factor(false), readings(false)]) {
      const plain = text(h)
      expect(plain).toContain('What is drawn')
      expect(plain).not.toContain('What to look for')
      expect(plain).not.toContain('A worked moment')
      for (const hidden of ['5.97', '0.0995', '0.505', '0.7071']) expect(plain).not.toContain(hidden)
      expect(plain).toContain('appear here when the run has finished')
    }
  })

  it('name every drawn element, colour and unit of Picture 1', () => {
    const h = text(clocks(false))
    for (const word of ['gold dial', 'blue dial', 'hand goes around once', 'logarithmic', 'red line is the horizon', 'shaded purple box', 'blue dot', 'dotted blue line', 'gold note', 'horizon radius', 'kilometers', 'What this picture is not', 'both dials read 0']) {
      expect(h).toContain(word)
    }
  })

  it('name every drawn element of Picture 2, including the white marks and that guess 3 is only a marker', () => {
    const h = text(factor(false))
    for (const word of ['height of a line', 'solid blue line', 'dashed orange line', 'red line on the left is the horizon', 'dotted vertical line', 'key under the graph', 'YOUR GUESS', 'white ring', 'white bracket', 'only a marker', 'do not change the lines']) {
      expect(h).toContain(word)
    }
  })

  it('explain Picture 2b’s bars, its own scale and each form of the white marker', () => {
    const h = text(twoHoles())
    for (const word of ['Two blue bars', 'own scale', 'ring on the small bar', 'ring on the giant bar', 'dashed white line', 'only a marker', 'YOUR GUESS', '0.7071']) expect(h).toContain(word)
  })

  it('explain Picture 3’s axes, lines, dots and growth during the run', () => {
    const h = text(readings(false))
    for (const word of ['gold line is the far-away clock', 'blue line is the hovering clock', 'steeper line', 'two dots', 'grow from the bottom left corner']) expect(h).toContain(word)
  })

  it('after the run: a worked moment with this run’s numbers and a three-part list for each picture', () => {
    const c = clocks(true)
    expect(text(c)).toContain('5.97 ÷ 60.00 = 0.0995')
    expect(count(c, 'Look at:')).toBe(3)
    expect(count(c, 'What it means:')).toBe(3)
    expect(count(c, 'Why it matters:')).toBe(3)
    expect(c).toContain('0.597')
    const f = factor(true)
    expect(text(f)).toContain('1 ÷ 1.01 = 0.9901')
    expect(text(f)).toContain('0.0995')
    expect(count(f, 'Look at:')).toBe(3)
    expect(count(f, 'Why it matters:')).toBe(3)
    const b = twoHoles()
    expect(count(b, 'Look at:')).toBe(2)
    expect(count(b, 'Why it matters:')).toBe(2)
    const r = readings(true)
    expect(text(r)).toContain('5.97 ÷ 60.00 = 0.0995')
    expect(count(r, 'Look at:')).toBe(2)
    expect(count(r, 'Why it matters:')).toBe(2)
    for (const h of [c, f, b, r]) expect(h).not.toContain('NaN')
  })

  it('give no verdict and no full mechanism (that is the tutor)', () => {
    for (const h of [clocks(true), factor(true), twoHoles(), readings(true)]) {
      expect(noOwnWords(h)).not.toMatch(VERDICT)
      for (const mechanism of ['redshift', 'stretched', 'depends only on', 'does not depend', 'reaches zero']) expect(h).not.toContain(mechanism)
    }
  })
})

describe('Part 2: the text, the notes under the controls and the three separate captions', () => {
  const own = runTimeNearBlackHoleExperiment('sgr-a-star', 3)
  const text = (h: string) => h.replace(/<[^>]+>/g, ' ')
  const guide = render(createElement(PartTwoGuide, {}))

  it('the guide gives the five steps, the run length and the 1.001 limit, and no result', () => {
    for (const word of ['How Part 2 works.', 'Choose a black hole.', 'Choose a distance for the hovering clock,', 'Press “Run your choice”.', 'Compare.', 'Read the numbers.', 'about 10 seconds', '1.001', 'Table 4 in Part 3', 'Your guesses are not drawn on them']) {
      expect(text(guide)).toContain(word)
    }
    for (const hidden of ['0.0995', '0.7071', '5.97', '42.43', '0.3015']) expect(text(guide)).not.toContain(hidden)
  })

  it('describes the three black holes with their masses and the module’s horizon radii', () => {
    const h = text(render(createElement(BlackHoleOptionsNote, {})))
    for (const word of ['A stellar black hole', '10 Suns (a round, typical size)', 'Sagittarius A*', 'a rounded 4.3 million', 'M87*', 'about 6.5 billion Suns (ESO)', '29.5 km', '12.7 million km', '19.2 billion km']) {
      expect(h).toContain(word)
    }
  })

  it('the distance table says what each preset means in kilometers for the chosen black hole, and shows no slowing factor', () => {
    const stellar = text(render(createElement(DistanceTable, { presetId: 'stellar-black-hole' })))
    expect(stellar).toContain('What each preset means for A stellar black hole')
    expect(stellar).toContain('2,950 km')
    expect(stellar).toContain('29.8 km')
    expect(stellar).toContain('295 m')
    expect(stellar).toContain('the closest the control allows')
    expect(stellar).toContain('far')
    const m87 = text(render(createElement(DistanceTable, { presetId: 'm87-star' })))
    expect(m87).toContain('What each preset means for M87*')
    expect(m87).toContain('38.4 billion km')
    expect(stellar).not.toBe(m87)
    for (const hidden of ['0.0995', '0.7071', 'factor']) expect(stellar).not.toContain(hidden)
  })

  it('has three separate captions for Pictures 4, 5 and 6, each with its own title', () => {
    expect(render(createElement(ClocksCaption, { complete: true, result: own, own: true }))).toContain('How to read Picture 4, your two clocks.')
    expect(render(createElement(FactorCaption, { complete: true, result: own, own: true }))).toContain('How to read Picture 5, your rate against distance.')
    expect(render(createElement(ReadingsCaption, { complete: true, result: own, own: true }))).toContain('How to read Picture 6, your readings over time.')
  })

  it('use the learner’s own black hole and distance, from the module', () => {
    const c = text(render(createElement(ClocksCaption, { complete: true, result: own, own: true })))
    expect(c).toContain('Sagittarius A*')
    expect(c).toContain('3 horizon radii')
    expect(c).toContain('your run')
    expect(c).toContain('Pictures 5 and 6')
    expect(c).toContain('Run your choice')
    expect(c).toContain('48.99 ÷ 60.00 = 0.8165')
    const f = text(render(createElement(FactorCaption, { complete: true, result: own, own: true })))
    expect(f).toContain('1 ÷ 3 = 0.3333')
    expect(f).toContain('0.8165')
    expect(f).toContain('0.8333')
  })

  it('have no white mark and no talk of your guesses being drawn; they say the graph follows the settings', () => {
    const f = text(render(createElement(FactorCaption, { complete: true, result: own, own: true })))
    expect(f).toContain('Your guesses are not drawn on this graph')
    for (const word of ['white ring', 'white bracket', 'YOUR GUESS', 'only a marker']) expect(f).not.toContain(word)
  })

  it('before the run is over, show structure only; after, a worked moment and three-part lists', () => {
    for (const Caption of [ClocksCaption, FactorCaption, ReadingsCaption]) {
      const before = text(render(createElement(Caption, { complete: false, result: own, own: true })))
      expect(before).toContain('What is drawn')
      expect(before).not.toContain('What to look for')
      expect(before).not.toContain('A worked moment')
      expect(before).toContain('when your run has finished')
      const after = render(createElement(Caption, { complete: true, result: own, own: true }))
      expect(text(after)).toContain('A worked moment, with your numbers')
      expect(count(after, 'Look at:')).toBe(count(after, 'Why it matters:'))
      expect(count(after, 'Look at:')).toBeGreaterThanOrEqual(2)
      expect(after).not.toContain('NaN')
    }
  })

  it('the page uses them in order under Pictures 4, 5 and 6, and nothing of the old combined caption is left', async () => {
    const source = await import('node:fs/promises').then((fs) => fs.readFile(new URL('./TimeNearBlackHoleExperiment.tsx', import.meta.url), 'utf-8'))
    const at = (n: string) => source.indexOf(n)
    const order = ['<PartTwoGuide', '<BlackHoleOptionsNote', '<DistanceTable', '<ClocksPicture title="Picture 4"', '<ClocksCaption', '<FactorPicture title="Picture 5"', '<FactorCaption', '<ReadingsPicture title="Picture 6"', '<ReadingsCaption']
    const positions = order.map((n) => source.indexOf(n, at('Part 2: Now try it yourself')))
    expect(positions.every((p) => p > 0)).toBe(true)
    expect([...positions].sort((x, y) => x - y)).toEqual(positions)
    expect(source).not.toContain('PartTwoCaption')
  })

  it('does not show Part 2 or its controls before the first Run has finished', () => {
    const page = render(createElement(TimeNearBlackHoleExperiment, {}))
    for (const later of ['Part 2: Now try it yourself', 'How Part 2 works.', 'Run your choice']) expect(page).not.toContain(later)
  })
})

describe('Part 3, the results', () => {
  it('renders every table and note, shows the guesses and the white tags, and says nothing is marked', () => {
    const h = results('tenth', 'same', 'worse-closer')
    expect(h).toContain('Your guesses, beside the results')
    expect(h).toContain('About one tenth as fast')
    expect(count(h, 'your guess')).toBeGreaterThanOrEqual(6)
    for (const t of ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5']) expect(h).toContain(t)
    expect(count(h, '<strong>What this table tells us</strong>')).toBe(4)
    expect(h).toContain('Not run yet')
    expect(h).toContain('NIST')
    expect(h).not.toContain('NaN')
  })

  it('never says right or wrong: that is the tutor', () => {
    for (const j of justOutsideGuesses) expect(noOwnWords(results(j, 'small', 'still-accurate'))).not.toMatch(VERDICT)
  })

  it('shows the same real tables whatever is guessed', () => {
    const a = tables(results('same', 'small', 'still-accurate'))
    const b = tables(results('stopped', 'giant', 'never-accurate'))
    expect(a.length).toBeGreaterThan(0)
    expect(a).toBe(b)
  })

  it('reads the check-up in "the same", "more" or "less" with numbers beside, and the GPS row against the published 45', () => {
    const h = results('tenth', 'same', 'worse-closer')
    expect(h).toContain('0.9487')
    expect(h).toContain('0.9500')
    expect(h).toContain('0.5050')
    expect(h).toContain('45, as NIST publishes it')
    expect(h).toContain('45.7')
    expect(tables(h)).not.toMatch(/\bclose\b/)
    expect(tables(h)).not.toContain('1 times as large')
    expect(h).toContain('407% more')
  })

  it('adds the learner’s own run to Table 4 when there is one, and the held-back NASA links', () => {
    const h = results('tenth', 'same', 'worse-closer', runTimeNearBlackHoleExperiment('sgr-a-star', 3))
    expect(h).not.toContain('Not run yet')
    expect(h).toContain('Sagittarius A*')
    expect(h).toContain('0.8165')
    expect(h).toContain('what-happens-when-something-gets-too-close')
    expect(h).toContain('beyond-the-brink')
    expect(h).toContain('trial values')
  })
})

describe('Part 3: the reading guide, the fuller notes and the numbers in them', () => {
  const run = runTimeNearBlackHoleExperiment('sgr-a-star', 3)
  const h = results('tenth', 'same', 'worse-closer', run)
  const plain = h.replace(/<[^>]+>/g, ' ')

  it('opens with a plain reading guide: what each of the five tables is and the four parts of every note', () => {
    for (const word of ['How to read these tables.', 'blood test', 'what it is', 'what it means', 'why it matters', 'how sure we are', 'Table 1', 'Table 5', 'not an official scale']) {
      expect(plain).toContain(word)
    }
  })

  it('every note has what it is, what it means with the real numbers, why it matters and how sure', () => {
    expect(count(h, 'What it is\\.')).toBe(5)
    expect(count(h, 'What it means, with the real numbers\\.')).toBe(5)
    expect(count(h, 'Why it matters\\.')).toBe(5)
    expect(count(h, 'How sure is the number\\?')).toBe(4)
  })

  it('Table 1 works the simple against the exact formula step by step, with a daily-life comparison and an honest GPS line', () => {
    for (const word of ['√(1 − 1 ÷ 10) = √0.9 = 0.9487', '1 − 1 ÷ (2 × 10) = 1 − 0.05 = 0.9500', '0.0013 ÷ 0.9487 = 0.139%', '6.07% more', '407% more', 'allow 20 minutes for every mile', 'would round to 46', 'about 0.7 microseconds per day', '1.49%']) {
      expect(plain).toContain(word)
    }
  })

  it('Table 2 gives the worked factor, its inverse and the slow-motion comparison', () => {
    for (const word of ['1 ÷ 0.0995 = 10.05', 'about 10 seconds pass on the far-away clock', 'slow motion', '60 ÷ 0.0995', 'about 10 minutes']) expect(plain).toContain(word)
  })

  it('Table 3 shows the masses, the distances and the three equal readings', () => {
    for (const word of ['0.7071, 0.7071, 0.7071', '42.43 s, 42.43 s, 42.43', '650 million times as heavy', '59.1 km', '38.4 billion km', 'Mass']) expect(plain).toContain(word)
  })

  it('Table 4 compares the learner’s run with Part 1’s and says they are trial values', () => {
    expect(plain).toContain('Compared with Part 1’s run (factor 0.0995)')
    expect(plain).toContain('your factor is more than Part 1’s (0.8165 against 0.0995)')
    expect(plain).toContain('trial values')
    const same = render(createElement(TimeNearBlackHoleResults, { partOne, justOutsideGuess: 'tenth', massGuess: 'same', approximationGuess: 'worse-closer', partTwo: partOne })).replace(/<[^>]+>/g, ' ')
    expect(same).toContain('your factor is the same as Part 1’s')
  })

  it('Table 5 has how far out each object is in horizon radii and what the slowing adds up to in a year', () => {
    for (const word of ['How far out, in horizon radii', 'Over a year', 'about 719 million', 'about 236000', 'milliseconds behind', 'seconds behind', 'days behind']) {
      expect(plain.replace(/(\d),(\d)/g, '$1$2')).toContain(word)
    }
  })

  it('splits the limits into short items and describes each NASA page', () => {
    for (const word of ['A thought experiment.', 'Two clocks at rest.', 'The simplest black hole.', 'Far away is treated as infinitely far.', 'Rounded values.', 'the subject of Black Holes 5', 'a NASA visualization of a camera falling']) {
      expect(plain).toContain(word)
    }
  })

  it('still gives no verdict and has no NaN', () => {
    expect(noOwnWords(h)).not.toMatch(VERDICT)
    expect(h).not.toContain('NaN')
  })
})

describe('wording problems found on a full read of the page (each is now fixed)', () => {
  const own = runTimeNearBlackHoleExperiment('sgr-a-star', 3)
  const text = (h: string) => h.replace(/<[^>]+>/g, ' ')
  const clocks = (r: typeof partOne, o = false) => text(render(createElement(ClocksCaption, { complete: true, result: r, own: o })))
  const factor = (r: typeof partOne, o = false) => text(render(createElement(FactorCaption, { complete: true, result: r, own: o })))
  const readings = (r: typeof partOne, o = false) => text(render(createElement(ReadingsCaption, { complete: true, result: r, own: o })))

  it('no caption runs “Picture” into its number, as in “Picture1”', () => {
    for (const h of [clocks(partOne), factor(partOne), readings(partOne), clocks(own, true), factor(own, true), readings(own, true)]) {
      expect(h).not.toMatch(/Picture\d/)
    }
    expect(factor(partOne)).toContain('as in Picture 1.')
    expect(factor(own, true)).toContain('as in Picture 4.')
  })

  it('never says “1 seconds”: the ratio is shown to three figures with the plural right', () => {
    expect(factor(partOne)).toContain('about 10 seconds on the far-away clock for every 1 second')
    expect(factor(own, true)).toContain('about 1.22 seconds on the far-away clock for every 1 second')
    for (const h of [factor(partOne), factor(own, true)]) expect(h).not.toContain('1 seconds')
  })

  it('describes the hands correctly: turns for a hand that went round several times, “only … of a turn” for less than one', () => {
    expect(clocks(partOne)).toContain('the gold hand has made 6 full turns and is back at the top; the blue hand has made only 0.597 of a turn')
    expect(clocks(own, true)).toContain('the blue hand has made 4.899 turns')
    expect(clocks(own, true)).not.toContain('only 4.899')
  })

  it('does not claim the hands end “far apart” for every run', () => {
    for (const h of [clocks(partOne), clocks(own, true)]) {
      expect(h).not.toContain('ended far apart')
      expect(h).toContain('ended apart')
    }
  })

  it('the own-run captions name Picture 4 and “Run your choice”, not Picture 1 or Run', () => {
    expect(clocks(own, true)).toContain('Nothing else in Picture 4 moves')
    expect(clocks(own, true)).not.toContain('Nothing else in Picture 1 moves')
    expect(readings(own, true)).toContain('before you press Run your choice')
    expect(readings(partOne)).toContain('before you press Run.')
  })

  it('does not call the real-tests list a list of “real tests” a second time, and claims nothing about where experiments “would have to go”', () => {
    const intro = text(render(createElement(TimeNearBlackHoleRealTests, {})))
    expect(intro).toContain('Where to read about these tests')
    expect(intro).not.toContain('would have to go')
    expect(intro).toContain('None was made at the edge of a black hole’s horizon')
  })

  it('has American spelling throughout the new text (grayed, not greyed)', () => {
    const page = text(render(createElement(TimeNearBlackHoleIntro, {})))
    expect(page).not.toContain('greyed')
  })

  it('the Table 3 note lists the three distances without the “about … AU” fragments that made it hard to read', () => {
    const h = text(render(createElement(TimeNearBlackHoleResults, { partOne, justOutsideGuess: 'tenth', massGuess: 'same', approximationGuess: 'worse-closer', partTwo: null })))
    expect(h).toContain('the clocks are 59.1 km, 25.4 million km and 38.4 billion km from their centers')
  })

  it('the tutor says “0.0316” in the text as in the table, and the S2 sentence does not say “stretched” twice', () => {
    const h = text(render(createElement(TimeNearBlackHoleExplanation, { predictedJustOutside: 'tenth', predictedMass: 'same', predictedApproximation: 'worse-closer' })))
    expect(h).toContain('At 1.001 it is 0.0316')
    expect(h).toContain('looks redder')
    expect((h.match(/stretched to longer wavelengths/g) ?? []).length).toBe(0)
  })

  it('names all the kinds of black hole NASA uses, not just two', () => {
    const page = text(render(createElement(TimeNearBlackHoleIntro, {})))
    expect(page).toContain('stellar-mass, intermediate-mass and supermassive')
    expect(page).toContain('Two kinds matter here')
  })

  it('for every black hole and every distance the learner can choose: no “1 times”, no “1 seconds”, no NaN, and “times as large” only from 2 up', () => {
    for (const hole of ['stellar-black-hole', 'sgr-a-star', 'm87-star'] as const) {
      for (const d of [100, 10, 3, 1.5, 1.1, 1.01, 1.001]) {
        const r = runTimeNearBlackHoleExperiment(hole, d)
        const pages = [
          clocks(r, true),
          factor(r, true),
          readings(r, true),
          text(render(createElement(TimeNearBlackHoleResults, { partOne, justOutsideGuess: 'half', massGuess: 'small', approximationGuess: 'still-accurate', partTwo: r }))),
        ]
        for (const h of pages) {
          expect(h).not.toMatch(/\b1(\.0\d*)? times as large|\b1 seconds\b/)
          expect(h).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
  })

  it('uses “gray”, not “grey”, in the Picture 1 caption', () => {
    expect(clocks(partOne)).toContain('The small gray line')
    expect(clocks(partOne)).not.toContain('grey')
  })

  it('says “These are the three from Black Holes 1” in Part 2’s guide', () => {
    expect(text(render(createElement(PartTwoGuide, {})))).toContain('These are the three from Black Holes 1')
  })
})

describe('Part 4, the tutor', () => {
  const tutor = render(createElement(TimeNearBlackHoleTutor, { predictedJustOutside: 'half', predictedMass: 'small', predictedApproximation: 'still-accurate' }))
  const explain = (j: JustOutsideGuess, m: MassGuess, a: ApproximationGuess) =>
    render(createElement(TimeNearBlackHoleExplanation, { predictedJustOutside: j, predictedMass: m, predictedApproximation: a }))
  const plain = (h: string) => h.replace(/<[^>]+>/g, ' ')

  it('opens by pointing to the white marks by name, with question 1 of 3 and a note that the answers are not marked', () => {
    expect(tutor).toContain('white YOUR GUESS marks')
    expect(tutor).toContain('Picture 2b')
    expect(tutor).toContain('Question 1 of 3')
    expect(tutor).toContain('Your answers')
    expect(tutor).toContain('are not marked')
    expect(tutor).toContain('Some things to look at as you answer')
    expect(tutor).not.toContain('NaN')
  })

  it('gives no answer, no marking and no result number before the explanation', () => {
    const text = plain(tutor)
    for (const hidden of ['That matches', 'That is not what the model gives', '0.0995', '0.7071', '5.97', '√(1 −']) expect(text).not.toContain(hidden)
  })

  it('the Part 4 lead says what the tutor will do, in order, and that the answers are not marked', () => {
    return import('node:fs/promises')
      .then((fs) => fs.readFile(new URL('./TimeNearBlackHoleExperiment.tsx', import.meta.url), 'utf-8'))
      .then((source) => {
        const lead = source.slice(source.indexOf('title="Part 4: The tutor"'), source.indexOf('<TimeNearBlackHoleTutor'))
        for (const word of ['three questions, one at a time', 'how your three guesses compare with the pictures', 'one question about why', 'what to', 'not marked']) expect(lead).toContain(word)
      })
  })

  it('marks all three right guesses as matching, each pointing at its mark', () => {
    const h = explain('tenth', 'same', 'worse-closer')
    expect(count(h, 'That matches')).toBe(3)
    expect(h).not.toContain('That is not what the model gives')
    const text = plain(h)
    expect(text).toContain('In Picture 2 your white ring sat at 0.1 and the blue dot at 0.0995')
    expect(text).toContain('In Picture 2b the two bars had the same height')
    expect(text).toContain('pull apart toward the horizon')
  })

  it('marks three different guesses as different, with the reason for each', () => {
    const h = explain('half', 'small', 'still-accurate')
    expect(count(h, 'That is not what the model gives')).toBe(3)
    expect(h).not.toContain('That matches')
    const text = plain(h)
    expect(text).toContain('Half as fast is what the simple formula')
    expect(text).toContain('The factor depends only on how many horizon radii away the clock is, not on the mass')
    expect(text).toContain('near the horizon gravity is not weak')
    expect(explain('stopped', 'giant', 'never-accurate')).toContain('it has not stopped')
    expect(plain(explain('same', 'same', 'never-accurate'))).toContain('which is why it worked for Earth and for GPS satellites')
  })

  it('keeps the specification’s seven points, plus what to take away and how to check it', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    for (const title of [
      '1. The slowing factor depends only on how many horizon radii away the clock is',
      '2. The factor falls toward zero at the horizon',
      '3. Why this happens',
      '4. The simple formula from the earlier experiments is only an approximation',
      '5. Real objects, for scale',
      '6. What this does and does not say',
      '7. The honest limits',
      'What to take away',
      'To check this for yourself',
    ]) {
      expect(text).toContain(title)
    }
  })

  it('works point 1 at 2 radii and checks it against Table 3’s two black holes, with a daily-life comparison', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    for (const word of ['1 ÷ 2 = 0.5', '1 − 0.5 = 0.5', '0.7071', '42.43 seconds', '59.1 ÷ 29.5 = 2', '38.4 billion km', '19.2 billion km', 'r ÷ r_s = 2 too', 'halfway up', 'an analogy for the ratio, not a statement about time']) {
      expect(text).toContain(word)
    }
  })

  it('point 2 has the table of the factor from 100 to 1.001 radii and answers the title question', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    for (const word of ['0.9950', '0.9487', '0.8165', '0.7071', '0.5774', '0.3015', '0.0995', '0.0316', 'ticks of yours', 'never quite stops']) expect(text).toContain(word)
  })

  it('point 3 gives the flashes picture with a worked number, the redshift word, the S2 measurement and the difference from motion', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    for (const word of ['redshift', '1 ÷ 0.0995 = 10.05 times farther apart', 'S2', 'longer wavelengths', 'Relativity of Time and Motion', 'Neither clock is moving']) expect(text).toContain(word)
  })

  it('point 4 tables the simple formula against the exact one, and point 5 gives the real objects, with a year of each', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    for (const word of ['0.139% too high', '6.07% too high', '407% too high', 'still 0.5, where the exact answer is 0', '719 million horizon radii', 'milliseconds a year', 'seconds a year', 'days behind', 'Table 5']) {
      expect(text.replace(/(\d),(\d)/g, '$1$2')).toContain(word)
    }
  })

  it('points 6 and 7 name Black Holes 5 and list the limits; none of the explanation is a number-free claim of "close" or "not close"', () => {
    const text = plain(explain('tenth', 'same', 'worse-closer'))
    expect(text).toContain('Black Holes 5')
    expect(text).toContain('should not be read as saying that time stops for someone falling in')
    expect(text).toContain('thought experiment')
    expect(text).not.toMatch(/\bnot close\b/)
    expect(text).not.toContain('NaN')
  })
})
