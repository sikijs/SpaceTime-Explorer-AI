import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { GravityGuess, LooksGuess } from '../physics/darkEnergyExperiment'
import { DarkEnergyExperiment } from './DarkEnergyExperiment'
import { BrightnessGraph, ExpansionPanel, Part1GraphCaption, Part1PanelCaption, Part1SupernovaCaption, Part2Caption, SupernovaPicture } from './DarkEnergyPictures'
import { DarkEnergyResults } from './DarkEnergyResults'
import { DarkEnergyExplanation, DarkEnergyTutor, tutorPrompt } from './DarkEnergyTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before the
// tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const guesses = (gravity: GravityGuess, looks: LooksGuess) => ({ gravity, looks })
const WHITE = 'stroke="#ffffff"'
// The mark itself (a circle) must be white, not only the box beside it.
const WHITE_CIRCLE = /<circle[^>]*fill="none"[^>]*stroke="#ffffff"/
const gravityAll: GravityGuess[] = ['slow', 'speed', 'none']
const looksAll: LooksGuess[] = ['brighter', 'same', 'dimmer']
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length

describe('Cosmology 5 renders (at rest)', () => {
  const html = render(createElement(DarkEnergyExperiment, {}))

  it('renders the heading, Part 1, the words box, the first links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 5: Dark Energy')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['heic1611a', 'expansion-rate-puzzle-persists', 'hubble-completes-eight-year-effort', 'building-blocks', 'science.nasa.gov/dark-matter', 'supernovas.html', '13852_Roman_Standard_Candle', 'foolproof.html', '1807.06209', '2503.14738']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('has the longer introduction, with its worked numbers, the daily-life picture and the two-parts paragraphs', () => {
    for (const lead of [
      'The question.',
      'What happens.',
      'Think of the stretching the way you would think of a car’s speed.',
      'But how do you measure how far away something is?',
      'A daily-life picture, with numbers.',
      'Why “squared”?',
      'What is a standard candle?',
      'Two kinds of candle.',
      'How is a candle’s true brightness found?',
      'In this experiment',
      'The standard candle used here.',
      'The two ideas put together.',
      'Two kinds of universe.',
      'Dark energy and dark matter: two different things.',
      'An everyday way to keep them apart.',
      'Do they come from the same source?',
      'Distance and redshift, a reminder.',
      'What you will do.',
      'Your guesses never change the real pictures or tables.',
      'What we assume.',
      'Some new words.',
    ])
      expect(html).toContain(lead)
    expect(html).toContain('1 ÷ (2 × 2) = 1 ÷ 4 = 0.25')
    expect(html).toContain('1 ÷ (10 × 10) = 1 ÷ 100 = 0.01')
    expect(html).toContain('about 3.26 million light-years')
    expect(html).toContain('2 × 2 = 4 times as big')
    expect(html).toContain('a <em>kind</em> of object, or a <em>kind</em> of event')
    expect(html).toContain('almost 800 of them in 18 galaxies out to 65 million light-years')
    expect(html).toContain('each rung or measurement technique relies upon the previous step for calibration')
    expect(html).toContain('so the true brightness cancels out')
    expect(html).toContain('dark energy is not the same as dark matter')
    expect(html).toContain('none of them says that they share a source (or that they do not)')
    expect(html).toContain('balloon with coins glued to its rubber')
  })

  it('compares dark matter with dark energy in a table, and says nothing about what the introduction must not give away', () => {
    const intro = html.slice(html.indexOf('The question.'), html.indexOf('Words and formulas'))
    for (const row of ['What does it do?', 'Where does it act?', 'How was it found?', 'How much of the universe?', 'Do we know what it is?']) expect(intro).toContain(row)
    expect(intro).toContain('From how bright very distant supernovae look')
    for (const phrase of ['instead of slower', 'looks dimmer than the best fit', 'is how we can tell', 'gravity slows', 'slows the expansion', 'must be farther away', 'pull on the expansion']) expect(intro).not.toContain(phrase)
  })

  it('defines the standard candle, Cepheid variable, parallax and cosmic distance ladder in the words box', () => {
    const box = html.slice(html.indexOf('Words and formulas'), html.indexOf('Want to know more?'))
    for (const term of ['Standard candle', 'Cepheid variable', 'Parallax', 'Cosmic distance ladder', 'Inverse-square rule']) expect(box).toContain(term)
    expect(box).toContain('parallax, then Cepheids, then Type Ia supernovae')
    expect(box).toContain('Light spreads over a ball whose surface grows as distance squared')
  })

  it('holds back the after-run links and the formulas until the first Run', () => {
    for (const href of ['dark-energy-is-responsible', 'roman-space-telescope', 'what-is-dark-energy-', 'The_dark_Universe', 'kva.se', 'astro-ph/9805201', 'astro-ph/9812133']) expect(html).not.toContain(href)
    expect(html).toContain('appear here after your first Run')
    expect(html).toContain('appear here after your first run')
    expect(html).not.toContain('Formula 1')
  })

  it('draws only Earth and the three positions, a graph with axes only and a panel with axes only, and no guess box', () => {
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('dashed ring = ')
    expect(html).not.toContain('stroke-dasharray="4 3"')
    expect(html).not.toContain('% as bright')
    expect(html).not.toContain('stroke="#38bdf8"')
    expect(html).not.toContain('stroke="#4ade80"')
    expect(html).toContain('How to read this picture: three exploding stars.')
    expect(html).not.toContain('How to read this picture: brightness against redshift.')
    expect(html).not.toContain('How to read this picture: is the expansion speeding up or slowing down today?')
    expect(html).toContain('Picture 1: three exploding stars')
    expect(html).toContain('Picture 2: brightness against redshift')
    expect(html).toContain('Picture 3: is the expansion speeding up or slowing down today?')
    expect(html).not.toContain('above zero: slowing down')
  })
})

describe('the pictures', () => {
  const sn = (props: Partial<Parameters<typeof SupernovaPicture>[0]>) => render(createElement(SupernovaPicture, { kind: 'best', share: 0.7, progress: 1, started: true, guess: null, ...props }))

  it('draws the dashed rings, the disks and the percentages only once the run has started', () => {
    const before = sn({ started: false, progress: 0 })
    expect(before).not.toContain('stroke-dasharray="4 3"')
    expect(before).not.toContain('% as bright')
    const after = sn({})
    expect(after).toContain('stroke-dasharray="4 3"')
    expect(after).toContain('69% as bright')
    expect(after).toContain('83% as bright')
    expect(after).toContain('61% as bright')
  })

  it('makes the disk smaller than its ring for the best fit, and eases from the ring size as the run plays', () => {
    expect(sn({ progress: 0 })).toContain('100% as bright')
    expect(sn({ progress: 0 })).not.toEqual(sn({ progress: 1 }))
    expect(sn({ progress: 0.5 })).not.toContain('NaN')
  })

  it('draws green disks in Part 1 and amber disks in Part 2, and the disks follow the share', () => {
    expect(sn({ kind: 'best' })).toContain('sn-glow-best')
    expect(sn({ kind: 'yours', share: 0.4 })).toContain('sn-glow-yours')
    expect(sn({ kind: 'yours', share: 0.4 })).not.toEqual(sn({ kind: 'yours', share: 0.9 }))
    expect(sn({ kind: 'yours', share: 0 })).toContain('100% as bright')
  })

  it('draws the white ring and one YOUR GUESS box only when a guess is given, different for each answer', () => {
    expect(sn({})).not.toContain('YOUR GUESS')
    const rings = looksAll.map((g) => sn({ guess: g }))
    for (const h of rings) {
      expect(count(h, 'YOUR GUESS')).toBe(1)
      expect(h).toMatch(WHITE_CIRCLE)
      expect(h).not.toContain('NaN')
    }
    expect(new Set(rings).size).toBe(3)
  })

  it('draws the blue and green lines only once drawn, the amber line only in Part 2, and the white marker only for a guess', () => {
    const before = render(createElement(BrightnessGraph, { drawn: null, share: null, guess: null }))
    expect(before).not.toContain('stroke="#38bdf8"')
    const part1 = render(createElement(BrightnessGraph, { drawn: 1, share: null, guess: null }))
    expect(part1).toContain('stroke="#38bdf8"')
    expect(part1).toContain('stroke="#4ade80"')
    expect(part1).not.toContain('stroke="#fbbf24"')
    expect(part1).not.toContain('YOUR GUESS')
    const part2 = render(createElement(BrightnessGraph, { drawn: 1, share: 0.4, guess: null }))
    expect(part2).toContain('stroke="#fbbf24"')
    const marks = looksAll.map((g) => render(createElement(BrightnessGraph, { drawn: 1, share: null, guess: g })))
    for (const h of marks) {
      expect(count(h, 'YOUR GUESS')).toBe(1)
      expect(h).toMatch(WHITE_CIRCLE)
      expect(h).not.toContain('NaN')
    }
    expect(new Set(marks).size).toBe(3)
  })

  it('draws the panel\'s curve and dots as the run goes, the amber dot in Part 2 and a white mark only at the end', () => {
    const axes = render(createElement(ExpansionPanel, { drawn: null, share: null, guess: null }))
    expect(axes).not.toContain('above zero: slowing down')
    expect(axes).not.toContain('r="6"')
    const half = render(createElement(ExpansionPanel, { drawn: 0.4, share: null, guess: 'slow' }))
    expect(half).not.toContain('YOUR GUESS')
    const full = render(createElement(ExpansionPanel, { drawn: 1, share: null, guess: null }))
    expect(full).toContain('matter only: +0.50')
    expect(full).toContain('best fit: -0.55')
    expect(full).toContain('the speed-up begins here (33%')
    expect(full).not.toContain('your trial share')
    expect(render(createElement(ExpansionPanel, { drawn: 1, share: 0.4, guess: null }))).toContain('your trial share: -0.10')
    const marks = gravityAll.map((g) => render(createElement(ExpansionPanel, { drawn: 1, share: null, guess: g })))
    for (const h of marks) {
      expect(count(h, 'YOUR GUESS')).toBe(1)
      expect(h).toMatch(/<(circle|line|polygon)[^>]*(stroke|fill)="#ffffff"/)
      expect(h).not.toContain('NaN')
    }
    expect(marks[0]).toContain('<polygon points=')
    expect(marks[0]).toMatch(/<polygon[^>]*fill="#ffffff"/)
    expect(marks[1]).toMatch(/<polygon[^>]*fill="#ffffff"/)
    expect(marks[2]).not.toContain('<polygon')
    expect(marks[2]).toMatch(WHITE_CIRCLE)
    expect(new Set(marks).size).toBe(3)
  })
})

describe('the captions (one for each picture)', () => {
  it('explains the white ring only once it is drawn, and keeps its look-fors to what is on screen', () => {
    const rest = render(createElement(Part1SupernovaCaption, { started: false, arrived: false }))
    const running = render(createElement(Part1SupernovaCaption, { started: true, arrived: false }))
    const done = render(createElement(Part1SupernovaCaption, { started: true, arrived: true }))
    expect(rest).toContain('How to read this picture: three exploding stars.')
    expect(rest).not.toContain('dashed blue ring')
    expect(rest).not.toContain('What to look for')
    expect(running).toContain('dashed blue ring')
    expect(running).toContain('A worked moment.')
    expect(running).toContain('(2358 ÷ 2833)²')
    expect(running).not.toContain('white ring')
    expect(count(running, 'Look at:')).toBe(2)
    expect(done).toContain('only a marker')
    expect(count(done, 'Look at:')).toBe(3)
    expect(count(done, 'What it means:')).toBe(3)
    expect(count(done, 'Why it matters:')).toBe(3)
    expect(done).not.toContain('NaN')
  })

  it('gives the graph and the panel their own captions, with the white marks explained only at the end', () => {
    const graph = render(createElement(Part1GraphCaption, { started: true, arrived: false }))
    const graphDone = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    const panel = render(createElement(Part1PanelCaption, { started: true, arrived: false }))
    const panelDone = render(createElement(Part1PanelCaption, { started: true, arrived: true }))
    expect(graph).toContain('How to read this picture: brightness against redshift.')
    expect(panel).toContain('How to read this picture: is the expansion speeding up or slowing down today?')
    expect(graph).not.toContain('white marker')
    expect(panel).not.toContain('white arrow or dot')
    expect(graphDone).toContain('only a marker')
    expect(panelDone).toContain('only a marker')
    expect(count(graphDone, 'Look at:')).toBe(3)
    expect(count(panelDone, 'Look at:')).toBe(3)
    expect(panelDone).toContain('+0.50')
    expect(panelDone).toContain('-0.55')
    expect(graphDone).not.toContain('NaN')
    expect(panelDone).not.toContain('NaN')
  })

  it('keeps each caption about its own picture', () => {
    const sn = render(createElement(Part1SupernovaCaption, { started: true, arrived: true }))
    const graph = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(sn).not.toContain('green dashed line')
    expect(graph).not.toContain('dashed blue ring')
  })

  it('follows the share in the Part 2 caption', () => {
    const a = render(createElement(Part2Caption, { share: 0.4 }))
    const b = render(createElement(Part2Caption, { share: 0.9 }))
    expect(a).toContain('40 percent dark energy')
    expect(a).toContain('-0.10')
    expect(a).not.toEqual(b)
    expect(a).toContain('Look at:')
    expect(a).not.toContain('NaN')
  })
})

describe('Part 3 results', () => {
  const html = render(createElement(DarkEnergyResults, { guesses: guesses('slow', 'dimmer'), share: 0.7, explained: false }))
  const table1 = (h: string) => h.slice(h.indexOf('Table 1'), h.indexOf('Table 2'))
  const rowA = (h: string) => h.slice(h.indexOf('(a) Expansion today'), h.indexOf('(b) Expansion today'))

  it('has the check-up with five rows, a note under each table, and tags that show the guess only', () => {
    expect(html).toContain('Table 1: Check-up')
    for (const row of ['(a)', '(b)', '(c)', '(d)', '(e)']) expect(html).toContain(row)
    expect(count(html, 'What this table tells us')).toBe(2)
    expect(html).toContain('Table 2: How far and how bright')
    expect(html).toContain('Your guesses')
    expect(html).toContain('trial values')
    expect(html).not.toContain('NaN')
    for (const word of ['was right', 'was wrong', 'matched your', 'you were right', 'off this time']) expect(html).not.toContain(word)
    expect(html).toContain('approximately 68.3 to 70%')
    expect(html).toContain('Within NASA’s stated range')
  })

  it('shows row (a) as a number only until the tutor\'s explanation, then adds the word', () => {
    expect(rowA(html)).toContain('+0.50')
    expect(rowA(html)).not.toContain('slowing down')
    const explained = render(createElement(DarkEnergyResults, { guesses: guesses('slow', 'dimmer'), share: 0.7, explained: true }))
    expect(rowA(explained)).toContain('slowing down')
  })

  it('shows no guess block and no tags without guesses, and follows the share only in Table 2', () => {
    const none = render(createElement(DarkEnergyResults, { guesses: null, share: 0.7, explained: false }))
    expect(none).not.toContain('Your guesses')
    const zero = render(createElement(DarkEnergyResults, { guesses: null, share: 0, explained: false }))
    expect(zero).not.toEqual(none)
    expect(table1(zero)).toEqual(table1(none))
    expect(zero).toContain('100%')
  })

  it('puts guess 1 beside row (a) and guess 2 beside row (c) and redshift 0.5, and nowhere else', () => {
    const tags = (h: string) => count(h, '>your guess<')
    expect(tags(render(createElement(DarkEnergyResults, { guesses: null, share: 0.7, explained: false })))).toBe(0)
    expect(tags(html)).toBe(3)
    expect(rowA(html)).toContain('>your guess<')
    const rowC = html.slice(html.indexOf('(c) Brightness at redshift'), html.indexOf('(d) The share'))
    expect(rowC).toContain('>your guess<')
    const table2 = html.slice(html.indexOf('Table 2'))
    const half = table2.slice(table2.indexOf('<td style="padding:0.35rem 0.45rem;border-bottom:1px solid var(--border-color, #ccc);vertical-align:top;font-size:0.8125rem">0.5'))
    expect(half.slice(0, 600)).toContain('>your guess<')
  })
})

describe('Part 4 tutor', () => {
  it('names the white marks in its questions and states no verdict before the explanation', () => {
    const html = render(createElement(DarkEnergyTutor, { predictedGravity: 'slow', predictedLooks: 'dimmer', onExplained: undefined }))
    expect(html).toContain('Look at the blue line')
    expect(html).not.toContain('That is what you guessed')
    expect(html).not.toContain('not what you guessed')
  })

  it('names the white marks in the compare step for every guess, with no verdict', () => {
    for (const g of gravityAll)
      for (const l of looksAll) {
        const text = tutorPrompt('compare', g, l)
        expect(text).toContain('white')
        expect(text).toContain('panel')
        for (const word of ['matches', 'not what', 'right', 'wrong', 'correct']) expect(text).not.toMatch(new RegExp(`\\b${word}\\b`))
      }
    expect(tutorPrompt('compare', 'slow', 'dimmer')).not.toEqual(tutorPrompt('compare', 'speed', 'dimmer'))
    expect(tutorPrompt('compare', 'slow', 'dimmer')).not.toEqual(tutorPrompt('compare', 'slow', 'brighter'))
  })

  it('marks each guess in the explanation, for every pair: exactly the right answer is marked as what was guessed', () => {
    const said = 'That is what you guessed.'
    const not = 'That is not what you guessed.'
    for (const g of gravityAll)
      for (const l of looksAll) {
        const html = render(createElement(DarkEnergyExplanation, { predictedGravity: g, predictedLooks: l }))
        expect(count(html, said)).toBe((g === 'slow' ? 1 : 0) + (l === 'dimmer' ? 1 : 0))
        expect(count(html, not)).toBe((g === 'slow' ? 0 : 1) + (l === 'dimmer' ? 0 : 1))
        expect(html).not.toContain('NaN')
      }
  })

  it('gives the explanation its sourced numbers, the dark matter distinction and the dated status', () => {
    const html = render(createElement(DarkEnergyExplanation, { predictedGravity: 'slow', predictedLooks: 'dimmer' }))
    expect(html).toContain('69 percent as bright')
    expect(html).toContain('2833 Mpc instead of 2358')
    expect(html).toContain('68 percent of the universe')
    expect(html).toContain('Dark energy is a different idea from dark matter')
    expect(html).toContain('the sources read here do not say whether they are connected')
    expect(html).toContain('As of November 2026')
    expect(html).toContain('2.8 to 4.2 sigma')
    expect(html).toContain('for the discovery of the accelerating expansion of the Universe')
  })
})

describe('the page\'s wiring', () => {
  it('draws Part 1\'s pictures for the best fit, with no amber and the guesses kept out until the run ends', async () => {
    const source = (await import('node:fs')).readFileSync(new URL('./DarkEnergyExperiment.tsx', import.meta.url), 'utf8')
    expect(source).toContain('<SupernovaPicture kind="best" share={BEST_FIT_DARK_ENERGY_FRACTION}')
    expect(source).toContain('guess={part1Done ? submitted!.looks : null}')
    expect(source).toContain('guess={part1Done ? submitted!.gravity : null}')
    expect(source).toContain('share={null}')
    expect(source).not.toContain('Change prediction')
    expect(source).toContain('handleStartOver')
  })

  it('keeps Parts 2 to 4 up when the share changes, and does not restart the tutor', async () => {
    const source = (await import('node:fs')).readFileSync(new URL('./DarkEnergyExperiment.tsx', import.meta.url), 'utf8')
    expect(source).not.toContain("setStatus('idle')")
    expect(source).not.toContain('key={runCount}')
    expect(source).toContain('the tutor does not restart')
  })
})
