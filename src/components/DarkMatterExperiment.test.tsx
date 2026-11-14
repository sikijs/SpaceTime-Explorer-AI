import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MeasuredGuess, SpeedGuess } from '../physics/darkMatterExperiment'
import { DarkMatterExperiment } from './DarkMatterExperiment'
import { GalaxyPicture, GraphPicture, Part1GalaxyCaption, Part1GraphCaption, Part2GalaxyCaption, Part2GraphCaption } from './DarkMatterPictures'
import { DarkMatterResults } from './DarkMatterResults'
import { DarkMatterTutor, tutorPrompt } from './DarkMatterTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before the
// tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const guess = (speed: SpeedGuess, measured: MeasuredGuess) => ({ speed, measured })
const WHITE = 'stroke="#ffffff"'

describe('Cosmology 4 renders (at rest)', () => {
  const html = render(createElement(DarkMatterExperiment, {}))

  it('renders the heading, Part 1, the words box, the first links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 4: Dark Matter')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['doppler-shift-of-a-stars-spectrum', 'milkyway_info', 'question18']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('has the approved eight-step "What happens", with its worked numbers, and the daily-life pictures', () => {
    for (const lead of [
      'What happens.',
      'Stars go round a galaxy the way planets go round the Sun.',
      'There is one “just right” speed.',
      'More pull needs a faster orbit.',
      'So speed lets us weigh a galaxy.',
      'How we measure the speeds.',
      'Two ways to count the mass.',
      'Do the two counts agree?',
      'What you do.',
      'A daily-life picture.',
      'A sealed-box picture.',
      'New terms.',
      'What you will do.',
      'Your guesses and the real pictures.',
      'What we assume.',
      'Some new words.',
    ])
      expect(html).toContain(lead)
    // Numbers come from the module: step 3, step 5 and step 6.
    expect(html).toContain('the speed needed becomes <strong>2 times</strong> as large')
    expect(html).toContain('<strong>0.48 nanometres</strong>')
    expect(html).toContain('to about 655.8 nanometres')
    expect(html).toContain('0.07 percent')
    expect(html).toContain('about <strong>120 times</strong> bigger')
    expect(html).toContain('<strong>2.3 × 10¹⁰ solar masses</strong>')
    expect(html).toContain('(c)')
    expect(html).toContain('You carry a bag')
    expect(html).toContain('1 × 4² ÷ 1 = 16 newtons')
    expect(html).toContain('Your guesses never change the real pictures or tables')
  })

  it('says nothing in the introduction about what the blue line does or what is measured', () => {
    const intro = html.slice(html.indexOf('The question.'), html.indexOf('Words and formulas'))
    for (const phrase of ['stays high', 'flat rotation', 'falls from', 'faster than predicted', 'flying apart']) expect(intro).not.toContain(phrase)
  })

  it('holds back the after-run links and the formula until the first Run', () => {
    for (const href of ['science.nasa.gov/dark-matter', 'spaceplace', 'euclid', 'physicstoday', 'arxiv.org/abs/1810.09466', 'arxiv.org/abs/1401.5377', 'factsheet', 'neptune-facts']) expect(html).not.toContain(href)
    expect(html).toContain('appear here after your first Run')
    expect(html).toContain('appear here after your first run')
  })

  it('draws the galaxy with no halo and a graph with axes but no lines, no caption and no guess box', () => {
    expect(html).toContain('The galaxy, seen from above')
    expect(html).toContain('no dark matter halo')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('How to read this picture: orbit speed')
    expect(html).toContain('How to read this picture: the galaxy, seen from above.')
    const galaxy = html.slice(html.indexOf('<svg'), html.indexOf('</svg>'))
    expect(galaxy).not.toContain('km/s')
    expect(html).not.toContain('stroke="#38bdf8"')
    expect(html).not.toContain('stroke="#4ade80"')
  })
})

describe('the pictures', () => {
  it('draws the blue and green lines only once the run has started, and the purple line only in Part 2', () => {
    const before = render(createElement(GraphPicture, { drawn: null, amount: null, guesses: null }))
    expect(before).not.toContain('stroke="#38bdf8"')
    const part1 = render(createElement(GraphPicture, { drawn: 1, amount: null, guesses: null }))
    expect(part1).toContain('stroke="#38bdf8"')
    expect(part1).toContain('stroke="#4ade80"')
    expect(part1).not.toContain('stroke="#c084fc"')
    const part2 = render(createElement(GraphPicture, { drawn: 1, amount: 1, guesses: null }))
    expect(part2).toContain('stroke="#c084fc"')
  })

  it('draws white marks and both YOUR GUESS boxes only when a guess is given, for every combination', () => {
    expect(render(createElement(GraphPicture, { drawn: 1, amount: null, guesses: null }))).not.toContain('YOUR GUESS')
    for (const s of ['faster', 'same', 'slower'] as const)
      for (const m of ['match', 'faster', 'slower'] as const) {
        const html = render(createElement(GraphPicture, { drawn: 1, amount: null, guesses: guess(s, m) }))
        expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
        expect(html).toContain(WHITE)
        expect(html).not.toContain('NaN')
      }
  })

  it('draws a different guess mark for each answer', () => {
    const lines = (['faster', 'same', 'slower'] as const).map((s) => render(createElement(GraphPicture, { drawn: 1, amount: null, guesses: guess(s, 'match') })))
    expect(new Set(lines).size).toBe(3)
    const markers = (['match', 'faster', 'slower'] as const).map((m) => render(createElement(GraphPicture, { drawn: 1, amount: null, guesses: guess('same', m) })))
    expect(new Set(markers).size).toBe(3)
  })

  it('shows the halo only when asked and only above zero, and speeds the stars up with more dark matter', () => {
    const g = (props: Partial<Parameters<typeof GalaxyPicture>[0]>) => render(createElement(GalaxyPicture, { amount: 0, progress: 0, showHalo: false, showSpeeds: true, ...props }))
    expect(g({ amount: 1 })).toContain('no dark matter halo')
    expect(g({ amount: 0, showHalo: true })).toContain('no dark matter halo')
    expect(g({ amount: 1, showHalo: true })).toContain('purple glow')
    expect(g({ amount: 0, progress: 0.5, showHalo: true })).not.toEqual(g({ amount: 2, progress: 0.5, showHalo: true }))
    expect(g({ amount: 2, progress: 0.5, showHalo: true })).not.toContain('NaN')
  })

  it('writes the stars\' speeds only once the run has started, so the picture does not answer guess 1', () => {
    const before = render(createElement(GalaxyPicture, { amount: 0, progress: 0, showHalo: false, showSpeeds: false }))
    const after = render(createElement(GalaxyPicture, { amount: 0, progress: 0, showHalo: false, showSpeeds: true }))
    expect(before).not.toContain('km/s')
    expect(after).toContain('169 km/s')
    expect(after).toContain('131 km/s')
    expect(after).toContain('101 km/s')
  })
})

describe('the captions (one for each picture)', () => {
  const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length

  it('gives the galaxy its own caption, with speeds, a worked moment and look-fors only as they appear', () => {
    const rest = render(createElement(Part1GalaxyCaption, { started: false, arrived: false }))
    const running = render(createElement(Part1GalaxyCaption, { started: true, arrived: false }))
    const done = render(createElement(Part1GalaxyCaption, { started: true, arrived: true }))
    expect(rest).toContain('How to read this picture: the galaxy, seen from above.')
    expect(rest).not.toContain('km/s')
    expect(rest).not.toContain('What to look for')
    expect(running).toContain('km/s')
    expect(running).not.toContain('What to look for')
    expect(done).toContain('A worked moment (real numbers).')
    expect(count(done, 'Look at:')).toBe(2)
    expect(count(done, 'What it means:')).toBe(2)
    expect(count(done, 'Why it matters:')).toBe(2)
    expect(done).not.toContain('white')
    expect(done).not.toContain('NaN')
  })

  it('gives the graph its own caption, and the white marks are explained only once they are drawn', () => {
    const running = render(createElement(Part1GraphCaption, { started: true, arrived: false }))
    const done = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(running).toContain('How to read this picture: orbit speed against distance.')
    expect(running).toContain('blue line')
    expect(running).not.toContain('white')
    expect(running).not.toContain('What to look for')
    expect(done).toContain('only a direction')
    expect(done).toContain('only a marker')
    expect(done).toContain('A worked moment (real numbers).')
    expect(count(done, 'Look at:')).toBe(4)
    expect(count(done, 'What it means:')).toBe(4)
    expect(count(done, 'Why it matters:')).toBe(4)
    expect(done).not.toContain('NaN')
  })

  it('keeps each picture\'s caption about its own picture', () => {
    const galaxy = render(createElement(Part1GalaxyCaption, { started: true, arrived: true }))
    const graph = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(graph).not.toContain('dashed rings')
    expect(galaxy).not.toContain('green dashed line')
    expect(galaxy).not.toContain('blue line')
  })

  it('gives each Part 2 picture its own caption with a worked moment and look-fors, following the amount', () => {
    const galaxy1 = render(createElement(Part2GalaxyCaption, { amount: 1 }))
    const galaxy2 = render(createElement(Part2GalaxyCaption, { amount: 0.5 }))
    const graph1 = render(createElement(Part2GraphCaption, { amount: 1 }))
    const graph2 = render(createElement(Part2GraphCaption, { amount: 0.5 }))
    expect(galaxy1).toContain('How to read this picture: the galaxy with your dark matter.')
    expect(graph1).toContain('How to read this picture: orbit speed with your dark matter.')
    for (const h of [galaxy1, graph1]) {
      expect(h).toContain('A worked moment (real numbers).')
      expect(h).toContain('What to look for')
      expect(h).not.toContain('NaN')
    }
    expect(count(galaxy1, 'Look at:')).toBe(2)
    expect(count(graph1, 'Look at:')).toBe(1)
    expect(galaxy1).not.toEqual(galaxy2)
    expect(graph1).not.toEqual(graph2)
  })
})

describe('Part 3 results', () => {
  const html = render(createElement(DarkMatterResults, { guesses: guess('same', 'match'), amount: 1 }))

  it('has the check-up with five rows, a note under each table, and tags that show the guess only', () => {
    expect(html).toContain('Table 1: Check-up')
    for (const row of ['(a)', '(b)', '(c)', '(d)', '(e)']) expect(html).toContain(row)
    expect((html.match(/What this table tells us/g) ?? []).length).toBe(2)
    expect(html).toContain('not an independent test')
    expect(html).toContain('Table 2: Speeds at three distances')
    expect(html).toContain('Your guesses')
    expect(html).not.toContain('NaN')
    for (const word of ['was right', 'was wrong', 'matched your', 'you were right', 'off this time']) expect(html).not.toContain(word)
  })

  it('shows no guess block and no tags without guesses, and follows the amount only in the last-but-one column', () => {
    const none = render(createElement(DarkMatterResults, { guesses: null, amount: 1 }))
    expect(none).not.toContain('Your guesses')
    const zero = render(createElement(DarkMatterResults, { guesses: null, amount: 0 }))
    expect(zero).not.toEqual(none)
    // Table 1 does not depend on the amount.
    const table1 = (h: string) => h.slice(h.indexOf('Table 1'), h.indexOf('Table 2'))
    expect(table1(zero)).toEqual(table1(none))
  })
})

describe('Part 4 tutor', () => {
  it('names the white marks in its questions and states no verdict before the explanation', () => {
    const html = render(createElement(DarkMatterTutor, { predictedSpeed: 'same', predictedMeasured: 'match', onExplained: undefined }))
    expect(html).toContain('Look at the blue line')
    expect(html).not.toContain('That matches')
    expect(html).not.toContain('not what')
  })
})

describe('the tutor\'s questions', () => {
  it('names the white marks in the compare step for every guess, with no outcome and no verdict', () => {
    for (const s of ['faster', 'same', 'slower'] as const)
      for (const m of ['match', 'faster', 'slower'] as const) {
        const text = tutorPrompt('compare', s, m)
        expect(text).toContain('white line')
        expect(text).toContain('at 30 kpc')
        for (const word of ['matches', 'not what', 'right', 'wrong', 'correct']) expect(text).not.toContain(word)
      }
    expect(tutorPrompt('compare', 'faster', 'match')).not.toEqual(tutorPrompt('compare', 'slower', 'match'))
    expect(tutorPrompt('conceptual', 'same', 'match')).not.toContain('dark matter')
  })
})

describe('the page\'s wiring', () => {
  it('draws no purple line in Part 1\'s graph and keeps the guesses out of it until the run ends', async () => {
    const source = (await import('node:fs')).readFileSync(new URL('./DarkMatterExperiment.tsx', import.meta.url), 'utf8')
    expect(source).toContain('amount={null} guesses={part1Done ? submitted : null}')
    expect(source).toContain('<GalaxyPicture amount={0} progress={shownProgress1} showHalo={false} showSpeeds={started} />')
  })
})

describe('tutor marking in the explanation', () => {
  // The tutor starts at its first question; the marking text is checked through the module's own answers instead.
  it('has the explanation text written for both outcomes', async () => {
    const source = (await import('node:fs')).readFileSync(new URL('./DarkMatterTutor.tsx', import.meta.url), 'utf8')
    expect(source).toContain('That matches what the calculation gives.')
    expect(source).toContain('That is not what the calculation gives.')
    expect(source).toContain('That matches what was measured.')
    expect(source).toContain('That is not what was measured.')
  })
})
