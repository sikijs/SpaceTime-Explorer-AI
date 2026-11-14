import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runHubblePair } from '../physics/hubblesLawExperiment'
import type { RedshiftGuess, SpeedGuess } from '../physics/hubblesLawExperiment'
import { HubblesLawExperiment } from './HubblesLawExperiment'
import { PairPicture, Part1Caption, Part2Caption, colorForRedshift } from './HubblesLawPictures'
import { HubblesLawResults } from './HubblesLawResults'
import { HubblesLawTutor } from './HubblesLawTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// light has arrived. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const pair = runHubblePair(16.5)
const picture = (props: Partial<Parameters<typeof PairPicture>[0]>) =>
  clean(renderToStaticMarkup(createElement(PairPicture, { pair, progress: 1, started: true, guesses: null, idPrefix: 't', ...props })))
const guess = (speed: SpeedGuess, redshift: RedshiftGuess) => ({ speed, redshift })

describe('Cosmology 1 renders (Part 1)', () => {
  const html = clean(renderToStaticMarkup(createElement(HubblesLawExperiment, {})))

  it('the page renders at rest: Part 1, words box, seven links and Start over, no later Part and no white mark', () => {
    expect(html).toContain('Cosmology 1: Hubble')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of [
      'hubble-cosmological-redshift',
      'hubble-constant-and-tension',
      'arxiv.org/abs/2112.04510',
      'arxiv.org/abs/1807.06209',
      'arxiv.org/abs/astro-ph/0702510',
      'pia04210-coma-cluster-of-galaxies',
      'PMC522427',
    ]) {
      expect(html).toContain(href)
    }
    expect(html).toContain('target="_blank"')
    expect(html).toContain('Start over')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('the introduction says the guesses never change the pictures and gives neither answer away', () => {
    expect(html).toContain('Your guesses never change the real pictures or tables')
    expect(html).toContain('drawn on the pictures in white')
    expect(html).toContain('rubber band')
    expect(html).toContain('Some new words')
    expect(html).not.toContain('The farther away a galaxy is, the more its light is stretched')
    expect(html).not.toContain('the rate things stretch with distance')
    expect(html).not.toContain('in proportion')
    expect(html).not.toContain('deeper red')
  })

  it('explains redshift, the pattern and the number that sets its size, without saying what the rule is', () => {
    expect(html).toContain('What redshift is.')
    expect(html).toContain('stretching a spring')
    expect(html).toContain('Because <strong>space itself is expanding</strong>')
    expect(html).toContain('a wave drawn on a rubber band')
    expect(html).toContain('a little more every moment of its journey')
    expect(html).toContain('The tutor explains the difference at the end')
    expect(html).toContain('fingerprint')
    expect(html).toContain('a wavelength of 500 nanometres arrives as 505')
    expect(html).toContain('means a rule that links')
    expect(html).toContain('taxi fare')
    expect(html).toContain('km/s per Mpc')
    expect(html).toContain('What the rule says is what you are about to find out')
    expect(html).toContain('spectral lines')
    for (const giveaway of ['farther galaxy is redder', 'faster the galaxy', 'twice the distance', 'doubling', 'in proportion', 'the more its light']) {
      expect(html).not.toContain(giveaway)
    }
  })

  it('holds back Hubble\'s Law, the formulas and the speeds until after the run', () => {
    // No formula in the introduction: it would show that redshift grows with distance, which is what the guesses are about (§12).
    for (const symbol of ['H0 ×', '÷ c', 'z = H0', '<code>']) expect(html).not.toContain(symbol)
    // It names the ingredients and their symbols, but not how they combine.
    expect(html).toContain('The rule uses three ingredients')
    expect(html).toContain('written <strong>d</strong>')
    expect(html).toContain('written <strong>H0</strong>')
    expect(html).toContain('written <strong>c</strong>')
    expect(html).toContain('written <strong>z</strong>')
    expect(html).toContain('How they combine appears in the Words and formulas box after your first run')
    expect(html).toContain('appear here after your first run')
    expect(html).not.toContain('v = H0')
    expect(html).not.toContain('1,155')
    expect(html).not.toContain('2,310')
    expect(html).not.toContain('0.004 to 0.008')
    expect(html).not.toContain('Calculated here:')
  })

  it('the Run button waits for both guesses, and Part 1 names the pair', () => {
    expect(html).toContain('Answer both questions above to run')
    expect(html).toContain('Galaxy B at 16.5 Mpc')
    expect(html).toContain('Galaxy A at 33 Mpc')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })
})

describe('Cosmology 1 renders (the picture)', () => {
  it('draws the labels, and "not run yet" with no bars, rings or marks before the run', () => {
    const html = picture({ started: false, progress: 0 })
    expect(html).toContain('Galaxy B (16.5 Mpc)')
    expect(html).toContain('Galaxy A (33 Mpc)')
    expect(html).toContain('Earth')
    expect(html).toContain('Recession speed (km/s)')
    expect(html).toContain('not run yet')
    expect(html).not.toContain('1,155 km/s')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws the speed bars with their real numbers once the light has arrived', () => {
    const html = picture({})
    expect(html).toContain('1,155 km/s')
    expect(html).toContain('2,310 km/s')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws no white mark while the light is still travelling, even with guesses given', () => {
    const html = picture({ progress: 0.5, guesses: guess('twice', 'farther') })
    expect(html).not.toContain('YOUR GUESS')
  })

  it('draws two YOUR GUESS boxes once the light has arrived, and the bar follows the guess', () => {
    const widths = (speed: SpeedGuess) => {
      const html = picture({ guesses: guess(speed, 'farther') })
      expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
      const match = html.match(/<rect x="120" y="272" width="([\d.]+)"/)
      expect(match).not.toBeNull()
      return Number(match![1])
    }
    const twice = widths('twice')
    const same = widths('same')
    const half = widths('half')
    expect(twice).toBeGreaterThan(same)
    expect(same).toBeGreaterThan(half)
    expect(same / half).toBeCloseTo(2, 1)
  })

  it('puts the second marker on a different row for each guess, and a bracket for "no difference"', () => {
    const near = picture({ guesses: guess('twice', 'nearer') })
    const far = picture({ guesses: guess('twice', 'farther') })
    const same = picture({ guesses: guess('twice', 'same') })
    expect(near).toContain('B looks redder')
    expect(far).toContain('A looks redder')
    expect(same).toContain('no difference')
    expect(near).toContain('cy="62" r="26"')
    expect(far).toContain('cy="142" r="26"')
    expect(same).not.toContain('r="26"')
    expect(same).toContain('<path d="M 530 62 H 540 V 142 H 530"')
  })

  it('draws pink and no white marks for the learner\'s own pair', () => {
    const html = picture({ yours: true, guesses: null })
    expect(html).toContain('#f472b6')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('the real bars do not change with a guess', () => {
    const a = picture({ guesses: guess('twice', 'farther') })
    const b = picture({ guesses: guess('half', 'nearer') })
    for (const html of [a, b]) {
      expect(html).toContain('1,155 km/s')
      expect(html).toContain('2,310 km/s')
    }
  })
})

describe('Cosmology 1 renders (the light\'s colour)', () => {
  const channel = (css: string) => css.match(/\d+/g)!.map(Number)
  const apart = (z1: number, z2: number) => {
    const [, g1, b1] = channel(colorForRedshift(z1))
    const [, g2, b2] = channel(colorForRedshift(z2))
    return Math.abs(g1 - g2) + Math.abs(b1 - b2)
  }

  it('makes the Part 1 pair, and the largest pair Part 2 can draw, clearly different colours', () => {
    const p1 = runHubblePair(16.5)
    expect(apart(p1.near.redshift, p1.far.redshift)).toBeGreaterThan(40)
    const p2 = runHubblePair(100)
    expect(apart(p2.near.redshift, p2.far.redshift)).toBeGreaterThan(40)
  })

  it('is redder for a bigger redshift everywhere, and unshifted light is pale', () => {
    let last = colorForRedshift(0)
    expect(last).toBe('rgb(230, 240, 255)')
    for (const z of [0.001, 0.004, 0.008, 0.023, 0.047]) {
      expect(channel(colorForRedshift(z))[1]).toBeLessThan(channel(last)[1])
      last = colorForRedshift(z)
    }
  })

  it('draws the rings in different colours for B and for A', () => {
    const html = picture({})
    expect(html).toContain(`stroke="${colorForRedshift(pair.near.redshift)}"`)
    expect(html).toContain(`stroke="${colorForRedshift(pair.far.redshift)}"`)
    expect(colorForRedshift(pair.near.redshift)).not.toBe(colorForRedshift(pair.far.redshift))
  })
})

describe('Cosmology 1 renders (the captions)', () => {
  it('Part 1\'s caption names every element, gives the worked moment, and holds the look-fors until the light has arrived', () => {
    const before = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: false })))
    expect(before).toContain('How to read this diagram')
    expect(before).toContain('What appears when')
    expect(before).toContain('megaparsec')
    // The worked moment and the look-fors wait until the light has arrived, because they give both speeds (§12).
    expect(before).not.toContain('A worked moment')
    expect(before).not.toContain('1,155')
    expect(before).not.toContain('2,310')
    expect(before).not.toContain('501.9')
    expect(before).not.toContain('What to look for')
    const after = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: true })))
    expect(after).toContain('A worked moment')
    expect(after).toContain('1,155 km/s')
    expect(after).toContain('501.9 nm')
    expect(after).toContain('What to look for')
    expect(after).toContain('Look at')
    expect(after).toContain('What it means')
    expect(after).toContain('Why it matters')
    for (const html of [before, after]) {
      expect(html).toContain('They do not say whether it is right')
      expect(html).not.toContain('in proportion')
      expect(html).not.toContain('NaN')
    }
  })

  it('Part 2\'s caption says there are no white marks and that the numbers are trial values', () => {
    const ran = clean(renderToStaticMarkup(createElement(Part2Caption, { ran: true })))
    expect(ran).toContain('trial values')
    expect(ran).toContain('no white marks')
    expect(clean(renderToStaticMarkup(createElement(Part2Caption, { ran: false })))).toContain('press “Show my pair”')
  })
})

describe('Cosmology 1 renders (the results and the tutor)', () => {
  it('Table 1 and the check-up carry the real numbers, the guess tags and no verdict', () => {
    const html = clean(
      renderToStaticMarkup(createElement(HubblesLawResults, { pair, ownDistances: false, guesses: guess('half', 'nearer') }))
    )
    expect(html).toContain('Table 1: The pair')
    expect(html).toContain('Table 2: Check-up against published values')
    expect(html).toContain('1,155 km/s')
    expect(html).toContain('2,310 km/s')
    expect(html).toContain('0.00385')
    expect(html).toContain('0.00771')
    expect(html.match(/What this table tells us/g)?.length).toBe(2)
    expect(html).toContain('Between the two published values; not either of them')
    expect(html).toContain('not an independent check')
    expect(html).toContain('No published reference')
    expect(html).toContain('half as fast')
    expect(html).toContain('the nearer galaxy (B)')
    expect(html.match(/your guess/g)?.length).toBeGreaterThanOrEqual(4)
    for (const word of ['was right', 'was off', 'matched', 'correct', 'wrong']) expect(html).not.toContain(word)
    expect(html).not.toContain('NaN')
  })

  it('shows no guess block, and no tags, when there are no guesses', () => {
    const html = clean(renderToStaticMarkup(createElement(HubblesLawResults, { pair, ownDistances: false, guesses: null })))
    expect(html).not.toContain('Your guesses')
    expect(html).not.toContain('your guess')
  })

  it('follows the learner\'s own distances in Table 1 and leaves the check-up as it was', () => {
    const own = runHubblePair(100)
    const html = clean(renderToStaticMarkup(createElement(HubblesLawResults, { pair: own, ownDistances: true, guesses: null })))
    expect(html).toContain('your own distances')
    expect(html).toContain('7,000 km/s')
    expect(html).toContain('14,000 km/s')
    expect(html).toContain('z = 0.02335')
  })

  it('the tutor\'s first question gives no outcome and no verdict', () => {
    const html = clean(
      renderToStaticMarkup(createElement(HubblesLawTutor, { speedGuess: 'twice', redshiftGuess: 'farther', pair }))
    )
    expect(html).toContain('Look at the two speed bars and the two rings')
    expect(html).not.toContain('matches')
    expect(html).not.toContain('Hubble&#x27;s Law:')
    expect(html).not.toContain('raisins')
  })
})
