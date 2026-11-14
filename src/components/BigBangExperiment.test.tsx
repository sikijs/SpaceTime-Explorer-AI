import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { galaxyTimeRow } from '../physics/bigBangExperiment'
import type { AgeGuess, TimeGuess } from '../physics/bigBangExperiment'
import { GALAXY_PRESETS } from '../physics/hubblesLawExperiment'
import { BigBangExperiment } from './BigBangExperiment'
import { BigBangPicture, Part1Caption, Part2Caption } from './BigBangPictures'
import type { PictureGalaxy } from './BigBangPictures'
import { BigBangResults } from './BigBangResults'
import { BigBangTutor } from './BigBangTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// backward run has finished. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '')
const galaxies: PictureGalaxy[] = GALAXY_PRESETS.map((p, i) => ({
  key: ['virgo', 'coma', 'far'][i],
  label: `${p.label} (${p.distanceMpc} Mpc)`,
  shortLabel: ['Virgo Cluster', 'Coma Cluster', 'Distant galaxy'][i],
  distanceMpc: p.distanceMpc,
  highlighted: i === 0,
  labelYOffset: [-40, 34, -56][i],
}))
const picture = (props: Partial<Parameters<typeof BigBangPicture>[0]>) =>
  clean(renderToStaticMarkup(createElement(BigBangPicture, { galaxies, mode: 'backward', progress: 1, arrived: true, guesses: null, showZoom: true, ...props })))
const guess = (time: TimeGuess, age: AgeGuess) => ({ time, age })
const rows = GALAXY_PRESETS.map((p) => galaxyTimeRow(p.distanceMpc))
const presetDistances = GALAXY_PRESETS.map((p) => ({ label: p.label, distanceMpc: p.distanceMpc }))

describe('Cosmology 2 renders (Part 1)', () => {
  const html = clean(renderToStaticMarkup(createElement(BigBangExperiment, {})))

  it('the page renders at rest: Part 1, words box, nine links and Start over, no later Part and no white mark', () => {
    expect(html).toContain('Cosmology 2: The Big Bang')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of [
      'hubble-big-bang',
      'webb/big-bang-q-and-a',
      'universe/overview',
      'what-can-we-learn-from-the-universes-baby-picture',
      'hubble-cosmological-redshift',
      'hubble-constant-and-tension',
      'PMC522427',
      'arxiv.org/abs/2112.04510',
      'arxiv.org/abs/1807.06209',
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
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('the introduction says the guesses never change the pictures and gives neither answer away', () => {
    expect(html).toContain('Your guesses never change the real pictures or tables')
    expect(html).toContain('drawn on the pictures in white')
    expect(html).toContain('candle')
    expect(html).toContain('Some new words')
    expect(html).not.toContain('A simple example')
    expect(html).not.toContain('Notice when each one reaches Earth')
    expect(html).not.toContain('dividing its distance')
    expect(html).not.toContain('Experiment 1')
  })

  it('explains the Big Bang and the matching-sky puzzle in plain steps, without giving either guess away', () => {
    expect(html).toContain('What the Big Bang was not.')
    expect(html).toContain('not an explosion in one place')
    expect(html).toContain('A puzzle the Big Bang has to answer: why does the whole sky match?')
    for (const step of ['The glow.', 'Why that is strange.', 'The catch.', 'A picture of it.', 'The leading idea: cosmic inflation.', 'How sure are we?', 'Why it is here.']) {
      expect(html).toContain(step)
    }
    expect(html).toContain('two cups of tea')
    expect(html).toContain('380,000 years')
    expect(html).toContain('horizon problem')
    expect(html).toContain('wrinkled bedsheet')
    expect(html).toContain('a current theory, not a settled fact')
    // Held for the tutor and the results (§12): how the times compare, and how this page's answer compares with the real age.
    expect(html).not.toContain('same moment')
    expect(html).not.toContain('13.97')
    expect(html).not.toContain('13,970,000,000')
    expect(html).not.toContain('1.2 percent')
  })

  it('holds back the formula, the worked numbers and the real answers until after the run', () => {
    expect(html).toContain('appear here after your first run')
    expect(html).not.toContain('time back = distance')
    expect(html).not.toContain('4.408')
    expect(html).not.toContain('13.97 billion years ago, if')
    expect(html).not.toContain('Calculated here:')
    expect(html).not.toContain('A worked moment')
    expect(html).not.toContain('What to look for')
    expect(html).not.toContain('0.17 billion')
  })

  it('names the guesses as the two questions, in the approved wording', () => {
    expect(html).toContain('If you picked a farther galaxy instead of a nearer one')
    expect(html).toContain('How do you think this page')
    expect(html).toContain('Answer both questions above to run')
  })
})

describe('Cosmology 2 renders (the picture)', () => {
  it('draws the labels and "not run yet", with no bars, strip or marks before the run', () => {
    const html = picture({ mode: 'idle', progress: 0, arrived: false })
    expect(html).toContain('Virgo Cluster (16.5 Mpc)')
    expect(html).toContain('Coma Cluster (100 Mpc)')
    expect(html).toContain('A very distant galaxy (200 Mpc)')
    expect(html).toContain('Earth')
    expect(html).toContain('0: the singularity')
    expect(html).toContain('Time to reach Earth (billion years)')
    expect(html).toContain('Zoom: this page')
    expect(html).toContain('not run yet')
    expect(html).toContain('the strip is drawn when the run has finished')
    // This page's answer is the ruler's own end, so it is not printed until Run is pressed (§12).
    expect(html).not.toContain('13.97')
    expect(html).toContain('the number appears when you press Run')
    expect(html).toContain('the pointer counts the years once you press Run')
    expect(html).not.toContain('measured by others')
    expect(html).not.toContain('this page&#x27;s answer (calculated)')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws the bars, the amber and green ticks and the numbers once the run has finished', () => {
    const html = picture({})
    expect(html).toContain('13.97 billion years ago')
    expect(html).toContain('0.00 billion years left to go')
    expect(html).toContain('measured by others (NASA): 13.8')
    expect(html).toContain('(calculated): 13.97')
    expect(html).toContain('>13.97<')
    expect(html).toContain('scale: 0 to 16 billion years')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('NaN')
  })

  it('draws no white mark while the run is still going, even with guesses given', () => {
    const html = picture({ mode: 'backward', progress: 0.5, arrived: false, guesses: guess('same', 'close') })
    expect(html).not.toContain('YOUR GUESS')
  })

  it('draws two YOUR GUESS boxes once the run has finished', () => {
    const html = picture({ guesses: guess('same', 'close') })
    expect(html.match(/YOUR GUESS/g)?.length).toBe(2)
    expect(html).toContain('farther: the same')
    expect(html).toContain('close, not exact')
  })

  it('draws a different marker for each time guess: an arrow past the end, an arrow that stops short, a tick', () => {
    const longer = picture({ guesses: guess('longer', 'close') })
    const shorter = picture({ guesses: guess('shorter', 'close') })
    const same = picture({ guesses: guess('same', 'close') })
    expect(longer).toContain('farther: longer')
    expect(shorter).toContain('farther: shorter')
    expect(same).toContain('farther: the same')
    const markers = [longer, shorter, same].map((h) => h.match(/<(?:path|line)[^>]*stroke="#ffffff"|<path[^>]*fill="#ffffff"/g)?.length ?? 0)
    expect(new Set([longer.length, shorter.length, same.length]).size).toBeGreaterThan(1)
    expect(markers.every((n) => n > 0)).toBe(true)
  })

  it('moves the age marker with the guess: much shorter left of much longer, close between them', () => {
    const xOf = (age: AgeGuess) => {
      const html = picture({ guesses: guess('same', age) })
      const m = html.match(/<path d="M ([\d.]+) [\d.]+ L [\d.]+ [\d.]+ L ([\d.]+) [\d.]+ Z" fill="#ffffff"/g)
      expect(m).not.toBeNull()
      const last = m![m!.length - 1]
      return Number(last.match(/L ([\d.]+) [\d.]+ L/)![1])
    }
    const left = xOf('muchShorter')
    const middle = xOf('close')
    const right = xOf('muchLonger')
    expect(left).toBeLessThan(middle)
    expect(middle).toBeLessThan(right)
  })

  it('draws a pink galaxy and bar for the learner\'s own galaxy, and no white marks or strip in Part 2', () => {
    const own: PictureGalaxy = { key: 'own', label: 'Your galaxy (50 Mpc)', shortLabel: 'Your galaxy', distanceMpc: 50, highlighted: false, labelYOffset: 54, yours: true }
    const html = picture({ galaxies: [...galaxies, own], guesses: null, showZoom: false })
    expect(html).toContain('Your galaxy (50 Mpc)')
    expect(html).toContain('#f472b6')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('Zoom: this page')
  })

  it('the real bars and ticks do not change with a guess', () => {
    for (const g of [guess('same', 'close'), guess('longer', 'muchLonger')]) {
      const html = picture({ guesses: g })
      expect(html).toContain('>13.97<')
      expect(html).toContain('measured by others (NASA): 13.8')
    }
  })
})

describe('Cosmology 2 renders (the captions)', () => {
  it('Part 1\'s caption names every element and holds the worked moment and look-fors until the run has finished', () => {
    const before = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: false })))
    expect(before).toContain('How to read this diagram')
    expect(before).toContain('What appears when')
    expect(before).toContain('megaparsec')
    expect(before).toContain('zoom strip')
    expect(before).not.toContain('13.97')
    expect(before).not.toContain('A worked moment')
    expect(before).not.toContain('4.408')
    expect(before).not.toContain('What to look for')
    expect(before).not.toContain('0.17 billion years, or 1.2 percent')
    expect(before).not.toContain('0.17 billion')
    expect(before).toContain('too close to tell apart')
    const after = clean(renderToStaticMarkup(createElement(Part1Caption, { arrived: true })))
    expect(after).toContain('A worked moment')
    expect(after).toContain('4.408 × 10¹⁷')
    expect(after).toContain('What to look for')
    expect(after).toContain('Look at')
    expect(after).toContain('What it means')
    expect(after).toContain('Why it matters')
    expect(after).toContain('1.2 percent')
    expect(after).toContain('only about 0.17 billion years apart')
    for (const h of [before, after]) {
      expect(h).toContain('They do not say whether it is right')
      expect(h).toContain('no scientific meaning')
      expect(h).not.toContain('NaN')
    }
  })

  it('Part 2\'s caption says there are no white marks and that the numbers are trial values', () => {
    const ran = clean(renderToStaticMarkup(createElement(Part2Caption, { ran: true })))
    expect(ran).toContain('trial values')
    expect(ran).toContain('no white')
    expect(clean(renderToStaticMarkup(createElement(Part2Caption, { ran: false })))).toContain('Show my galaxy')
  })
})

describe('Cosmology 2 renders (the results and the tutor)', () => {
  it('Table 1 and the check-up carry the real numbers, the guess tags and no verdict', () => {
    const html = clean(renderToStaticMarkup(createElement(BigBangResults, { presetDistances, ownDistanceMpc: null, guesses: guess('longer', 'muchShorter') })))
    expect(html).toContain('Table 1: The time back to zero distance')
    expect(html).toContain('Table 2: Check-up against published values')
    expect(html).toContain('1,155 km/s')
    expect(html).toContain('14,000 km/s')
    expect(html.match(/13\.97 billion years/g)?.length).toBeGreaterThanOrEqual(5)
    expect(html.match(/What this table tells us/g)?.length).toBe(2)
    expect(html).toContain('More, by about 1.2 percent')
    expect(html).toContain('13.39 and 14.51 billion years')
    expect(html).toContain('Between the two published values; not either of them')
    expect(html).toContain('Not an independent check')
    expect(html).toContain('No published reference')
    expect(html).toContain('Important: this is not how astronomers measure')
    expect(html).toContain('longer')
    expect(html).toContain('much shorter than the real age')
    for (const word of ['was right', 'was off', 'matched', 'correct', 'wrong']) expect(html).not.toContain(word)
    expect(html).not.toContain('NaN')
  })

  it('shows no guess block and no tags without guesses, and adds the learner\'s own galaxy to Table 1', () => {
    const none = clean(renderToStaticMarkup(createElement(BigBangResults, { presetDistances, ownDistanceMpc: null, guesses: null })))
    expect(none).not.toContain('Your guesses')
    expect(none).not.toContain('your guess')
    const own = clean(renderToStaticMarkup(createElement(BigBangResults, { presetDistances, ownDistanceMpc: 37, guesses: null })))
    expect(own).toContain('Your galaxy')
    expect(own).toContain('37 Mpc')
    expect(own).toContain('2,590 km/s')
  })

  it('the tutor\'s first question gives no outcome and no verdict', () => {
    const html = clean(renderToStaticMarkup(createElement(BigBangTutor, { timeGuess: 'same', ageGuess: 'close', rows })))
    expect(html).toContain('Look at the three galaxies, the ruler and the three bars')
    expect(html).not.toContain('matches')
    expect(html).not.toContain('balloon')
    expect(html).not.toContain('Mather')
  })
})
