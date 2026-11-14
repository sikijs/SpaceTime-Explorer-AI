import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { SkyGuess, TemperatureGuess } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { CosmicMicrowaveBackgroundExperiment } from './CosmicMicrowaveBackgroundExperiment'
import { CmbPicture, Part1Caption, Part2Caption } from './CosmicMicrowaveBackgroundPictures'
import { CosmicMicrowaveBackgroundResults } from './CosmicMicrowaveBackgroundResults'
import { CosmicMicrowaveBackgroundTutor } from './CosmicMicrowaveBackgroundTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// and the white marks appear exactly when a guess is given and the run has finished. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const Z = 1089.8
const picture = (props: Partial<Parameters<typeof CmbPicture>[0]>) =>
  clean(renderToStaticMarkup(createElement(CmbPicture, { mode: 'part1', redshift: Z, arrived: true, guesses: null, ...props })))
const guess = (temperature: TemperatureGuess, sky: SkyGuess) => ({ temperature, sky })

describe('Cosmology 3 renders (Part 1, at rest)', () => {
  const html = clean(renderToStaticMarkup(createElement(CosmicMicrowaveBackgroundExperiment, {})))

  it('renders Part 1, the words box, the first links and an enabled-looking Start over, with no later Part and no white mark', () => {
    expect(html).toContain('Cosmology 3: The Cosmic Microwave Background')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['universe/overview', 'what-is-a-light-year']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run: travel from today back to recombination<\/button>/)
  })

  it('holds back the after-run links (ESA, WMAP, Fixsen) until the first Run', () => {
    for (const href of ['esa.int', 'wmap-overview', 'arxiv.org/abs/0911.1955']) expect(html).not.toContain(href)
    expect(html).toContain('appear here after your first Run')
  })

  it('has the approved seven-part "What happens", and the daily-life pictures stay', () => {
    expect(html).toContain('What happens.')
    for (const lead of [
      'A universe full of light, but no way to see far.',
      'Why light could not get far.',
      'The fog lifts.',
      'How long ago, and how long it is.',
      'Why it is the oldest light we can see.',
      'Stretched on the way, so now invisible.',
      'In one sentence.',
      'A daily-life picture.',
    ]) {
      expect(html).toContain(lead)
    }
    expect(html).toContain('pinball machine')
    expect(html).toContain('balloon')
    expect(html).toContain('about <strong>19 hours</strong>')
    expect(html).toContain('about 1 part in 36,000')
    expect(html).toContain('from every part of the sky')
    expect(html).toContain('1964 to 1965')
  })

  it('says the guesses never change the pictures, names the four Parts and gives neither answer away', () => {
    expect(html).toContain('Your guesses never change the real pictures or tables')
    expect(html).toContain('drawn in <strong>white</strong>')
    expect(html).toContain('The four Parts of this page.')
    expect(html).toContain('Some new words.')
    expect(html).not.toContain('Experiment 1')
    // Held for after the run (§12): the temperatures, the stove colours, the size of the sky's differences, the formula.
    for (const held of ['2,972', '2.972', '100,000', 'white-hot', 'dull red, then orange', '1090.8', 'T = T0', 'time back = ', 'horizon problem', 'Inflation', 'stove']) {
      expect(html).not.toContain(held)
    }
  })

  it('draws a plain grey bar with names only before the run: no hot, no cold, no gradient colours, no temperature marks', () => {
    expect(html).toContain('Recombination')
    expect(html).toContain('Today (Earth)')
    expect(html).toContain('the two marks are drawn when the run has finished')
    expect(html).not.toContain('url(#cmb-journey-gradient)')
    expect(html).not.toMatch(/\bhot\b/)
    expect(html).not.toMatch(/\bcold\b/)
    expect(html).not.toContain('z ≈ 1089.8,')
    expect(html).not.toContain('(measured)')
    expect(html).not.toContain('The sky in every direction, as seen today')
  })

  it('names the two guesses in the approved wording', () => {
    expect(html).toContain('As you go back in time toward recombination')
    expect(html).toContain('Do you think the background')
    expect(html).toContain('Answer both questions above to run')
  })
})

describe('Cosmology 3 renders (the picture)', () => {
  it('before the run has finished: grey bar, empty scale, no marks, no sky, no strip, no white', () => {
    const html = picture({ redshift: 0, arrived: false })
    expect(html).toContain('the two marks are drawn when the run has finished')
    expect(html).toContain('1 K')
    expect(html).toContain('10,000 K')
    expect(html).not.toContain('url(#cmb-journey-gradient)')
    expect(html).not.toContain('Today: ')
    expect(html).not.toContain('calculated here')
    expect(html).not.toContain('The sky in every direction')
    expect(html).not.toContain('How much do directions differ')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws no white mark while the run is still going, even with guesses given', () => {
    const html = picture({ redshift: 500, arrived: false, guesses: guess('higher', 'uniform') })
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('stroke="#ffffff"')
  })

  it('once the run has finished: the colours, the green and amber marks, the sky, the strip and the measured spread', () => {
    const html = picture({})
    expect(html).toContain('url(#cmb-journey-gradient)')
    expect(html).toContain('z ≈ 1089.8')
    expect(html).toContain('Today: 2.725 K (measured)')
    expect(html).toContain('Recombination: 2,972 K (calculated here)')
    expect(html).toContain('The sky in every direction, as seen today (illustrative)')
    expect(html.match(/about 2\.725 K/g)?.length).toBe(7)
    expect(html).toContain('How much do directions differ?')
    expect(html).toContain('Measured: about 1 in 100,000 (about 0.000027 K)')
    for (const tick of ['1 in 10', '1 in 100,000', '1 in 1,000,000', 'bigger difference', 'smaller difference']) expect(html).toContain(tick)
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws two YOUR GUESS boxes once the run has finished, with each guess in words', () => {
    const html = picture({ guesses: guess('same', 'varies') })
    expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
    expect(html).toContain('the same as today')
    expect(html).toContain('varies a lot')
    const other = picture({ guesses: guess('higher', 'uniform') })
    expect(other).toContain('hotter at recombination')
    expect(other).toContain('about the same in every direction')
  })

  it('draws a different marker for each temperature guess: an arrow right, an arrow left, a tick on today', () => {
    const higher = picture({ guesses: guess('higher', 'uniform') })
    const lower = picture({ guesses: guess('lower', 'uniform') })
    const same = picture({ guesses: guess('same', 'uniform') })
    expect(higher).toContain('hotter at recombination')
    expect(lower).toContain('cooler at recombination')
    expect(new Set([higher.length, lower.length, same.length]).size).toBeGreaterThan(1)
    // The two arrows' heads point in opposite directions: the head's tip is to the right of its base for "higher", to the left for "lower".
    const tip = (html: string) => {
      const m = html.match(/<path d="M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+) Z" fill="#ffffff"/)
      expect(m).not.toBeNull()
      return { base: Number(m![1]), tip: Number(m![3]) }
    }
    const h = tip(higher)
    const l = tip(lower)
    expect(h.tip).toBeGreaterThan(h.base)
    expect(l.tip).toBeLessThan(l.base)
    // The tick for "the same" is one vertical white line on today's mark and carries no arrow head for guess 1.
    expect(same).toContain('stroke-width="4"')
  })

  it('joins the sky guess to the smaller-difference end for "about the same" and the bigger-difference end for "varies a lot"', () => {
    const tipOf = (html: string) => {
      const all = html.match(/<path d="M ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+ L ([\d.]+) [\d.]+ Z" fill="#ffffff"/g)!
      const last = all[all.length - 1]
      return Number(last.match(/L ([\d.]+) [\d.]+ Z/)![1])
    }
    const uniform = tipOf(picture({ guesses: guess('same', 'uniform') }))
    const varies = tipOf(picture({ guesses: guess('same', 'varies') }))
    expect(uniform).toBe(590)
    expect(varies).toBe(70)
    expect(varies).toBeLessThan(uniform)
  })

  it('the real marks and numbers do not change with a guess', () => {
    for (const g of [guess('same', 'varies'), guess('higher', 'uniform'), guess('lower', 'uniform')]) {
      const html = picture({ guesses: g })
      expect(html).toContain('Today: 2.725 K (measured)')
      expect(html).toContain('Recombination: 2,972 K (calculated here)')
      expect(html).toContain('Measured: about 1 in 100,000')
    }
  })

  it('Part 2 draws a pink marker and its temperature, and no white marks, sky or strip; the pink marker follows the moment', () => {
    const a = picture({ mode: 'part2', redshift: Z, yourRedshift: 100 })
    const b = picture({ mode: 'part2', redshift: Z, yourRedshift: 900 })
    for (const html of [a, b]) {
      expect(html).toContain('#f472b6')
      expect(html).toContain('your moment: z =')
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('The sky in every direction')
      expect(html).not.toContain('How much do directions differ')
      expect(html).toContain('Today: 2.725 K (measured)')
      expect(html).not.toContain('NaN')
    }
    expect(a).toContain('your moment: z = 100, 275 K (calculated)')
    expect(b).toContain('your moment: z = 900, 2,455 K (calculated)')
    const xOf = (html: string) => Number(html.match(/<line x1="([\d.]+)"[^>]*stroke="#f472b6"/)![1])
    expect(xOf(a)).not.toBe(xOf(b))
  })
})

describe('Cosmology 3 renders (the captions)', () => {
  it('Part 1\'s caption names every element, and holds the numbers, the worked moment and the look-fors until the run has finished', () => {
    const before = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: false })))
    expect(before).toContain('How to read this diagram')
    expect(before).toContain('What appears when')
    expect(before).toContain('tenfold scale')
    expect(before).toContain('Kelvin (K)')
    expect(before).toContain('plain grey')
    expect(before).not.toContain('A worked moment')
    expect(before).not.toContain('What to look for')
    expect(before).not.toContain('2,972')
    expect(before).not.toContain('one third of a pixel')
    expect(before).not.toContain('100,000')
    expect(before).not.toMatch(/\bhot\b/)
    expect(before).not.toMatch(/\bcold\b/)
    const after = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: true })))
    expect(after).toContain('A worked moment')
    expect(after).toContain('2.725 × (1 + 1089.8) = 2.725 × 1090.8 ≈ 2,972 K')
    expect(after).toContain('2.725 ÷ 100,000 ≈ 0.000027 K')
    expect(after).toContain('one third of a pixel')
    expect(after).toContain('Look at')
    expect(after).toContain('What it means')
    expect(after).toContain('Why it matters')
    for (const h of [before, after]) {
      expect(h).toContain('They do not say whether it is right')
      expect(h).toContain('only markers')
      expect(h).not.toContain('NaN')
    }
  })

  it('Part 2\'s caption says the pink marker is a calculation, that there are no white marks and that the numbers are trial values', () => {
    const html = clean(renderToStaticMarkup(createElement(Part2Caption, { chosen: true })))
    expect(html).toContain('calculation, not a measurement')
    expect(html).toContain('no white marks')
    expect(html).toContain('trial values')
  })
})

describe('Cosmology 3 renders (the results and the tutor)', () => {
  it('both tables carry the real numbers, the guess tags and no verdict', () => {
    const html = clean(renderToStaticMarkup(createElement(CosmicMicrowaveBackgroundResults, { guesses: guess('lower', 'varies') })))
    expect(html).toContain('Table 1: Check-up (calculated beside published)')
    expect(html).toContain('Table 2: The temperature at some moments (calculated here)')
    expect(html.match(/What this table tells us/g)?.length).toBe(2)
    expect(html).toContain('2.72548 ± 0.00057 K (Fixsen, 2009)')
    expect(html).toContain('The same: the difference, 0.00048 K, is inside the published give-or-take')
    expect(html).toContain('2,972 K, calculated: 2.725 × 1090.8')
    expect(html).toContain('A little less (0.92 percent)')
    expect(html).toContain('Given, not checked. The sources differ by about 1.3 percent')
    expect(html).toContain('Quoted, not checked here')
    expect(html).toContain('2,727.7 K')
    expect(html).toContain('5.45 K')
    expect(html).toContain('29.98 K')
    expect(html).toContain('275.2 K')
    expect(html).toContain('2,972.4 K')
    expect(html).toContain('which is about 2 °C, just above the freezing point of water')
    expect(html).toContain('More about the CMB')
    expect(html).toContain('−270.4 °C'.replace('−', '-'))
    expect(html).toContain('27 millionths of a kelvin')
    expect(html).toContain('1964 to 1965')
    // A small tag on each of the two rows the guesses are about (rows 2 and 4 of Table 1).
    expect(html.match(/>your guess</g)?.length ?? 0).toBe(2)
    expect(html).toContain('Your guesses')
    expect(html).toContain('hotter')
    for (const word of ['was right', 'was off', 'matched', 'correct', 'wrong']) expect(html).not.toContain(word)
    expect(html).not.toContain('NaN')
  })

  it('shows no guess block and no tags without guesses', () => {
    const none = clean(renderToStaticMarkup(createElement(CosmicMicrowaveBackgroundResults, { guesses: null })))
    expect(none).not.toContain('Your guesses')
    expect(none).not.toContain('The tags mark')
    expect(none).not.toContain('>your guess<')
  })

  it('the tutor\'s first question gives no outcome and no verdict', () => {
    const html = clean(renderToStaticMarkup(createElement(CosmicMicrowaveBackgroundTutor, { predictedTemperature: 'same', predictedSky: 'varies' })))
    expect(html).toContain('Look at the temperature panel')
    expect(html).not.toContain('matches')
    expect(html).not.toContain('slower')
    expect(html).not.toContain('2,972')
  })
})
