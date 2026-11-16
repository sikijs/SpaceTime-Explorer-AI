import { existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  compareHorizonsOfSunAndThousandSuns,
  horizonRadiusKm,
  runBlackHoleSizeExperiment,
  runPartOneSqueeze,
} from '../physics/blackHoleSizeExperiment'
import type { MassScalingGuess, SunRadiusGuess } from '../physics/blackHoleSizeExperiment'
import { BlackHoleSizeExperiment } from './BlackHoleSizeExperiment'
import { BallPicture, HorizonBarsPicture, PartOneCaption, PartTwoCaption, RulerPicture } from './BlackHoleSizePictures'
import { BlackHoleSizeResults } from './BlackHoleSizeResults'
import { BlackHoleSizeTutor } from './BlackHoleSizeTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks
// appear exactly when a guess is given, the real tables never change with a guess, and no page says "right" or "wrong" before the tutor.
// They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. The page's own "does not say whether it is right" and "no 'right' or 'wrong'" are taken out first.
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/does not say whether it is right|whether they are right|no “right” or “wrong”|says nothing about right or wrong/g, '')
const WHITE = 'stroke="#ffffff"'
const sunGuesses: SunRadiusGuess[] = ['about-6000-km', 'about-30-km', 'about-3-km']
const massGuesses: MassScalingGuess[] = ['ten', 'thousand', 'million']

const partOne = runPartOneSqueeze()
const comparison = compareHorizonsOfSunAndThousandSuns()
const ruler = (props: Partial<Parameters<typeof RulerPicture>[0]>) =>
  render(
    createElement(RulerPicture, {
      title: 'Picture 1: the ruler',
      objectLabel: 'The Sun',
      horizonKm: partOne.horizonRadiusKm,
      startKm: partOne.startRadiusKm,
      minKm: partOne.horizonRadiusKm * 0.1,
      markerRadiusKm: partOne.horizonRadiusKm,
      status: 'complete',
      hypotheticalStart: false,
      reserveGuessRow: true,
      guess: null,
      ...props,
    }),
  )
const results = (sun: SunRadiusGuess, mass: MassScalingGuess, two: ReturnType<typeof runBlackHoleSizeExperiment> | null = null) =>
  render(createElement(BlackHoleSizeResults, { partOne, sunGuess: sun, massGuess: mass, partTwo: two }))

describe('Black Holes 1 renders (at rest)', () => {
  const html = render(createElement(BlackHoleSizeExperiment, {}))

  it('renders the heading, Part 1, the words box, the news, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Black Holes 1: How Small Must Something Be to Become a Black Hole?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Recent news from black-hole science (as of November 2026)')
    for (const href of [
      'science.nasa.gov/universe/black-holes/',
      'science.nasa.gov/universe/black-holes/types/',
      'eso.org/public/news/eso1907/',
      'eso.org/public/news/eso2408/',
      'csiro.au/en/news/all/news/2026/november/confirm-black-hole',
      'ligo.caltech.edu/MIT/news/ligo20260526',
    ])
      expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('has the two approved guess questions, three buttons each, and tells the learner the guesses never change the pictures', () => {
    expect(html).toContain('To turn the Sun into a black hole, you would have to squeeze all of its mass into a ball of what radius?')
    expect(html).toContain('A black hole has 1,000 times the mass of another black hole. How much wider is its horizon?')
    for (const choice of [
      'About 6,000 kilometers, the size of Earth',
      'About 30 kilometers',
      'About 3 kilometers, a few city blocks',
      'About 10 times wider',
      'About 1,000 times wider',
      'About a million times wider',
    ])
      expect(html).toContain(choice)
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('in <strong>white</strong>')
    expect(html).toContain('Answer both questions to run.')
  })

  it('shows the six images with their credits unaltered, and their files exist', () => {
    for (const credit of [
      'Image: EHT Collaboration (CC BY 4.0), via ESO.',
      'Image: ESO/L. Calçada/Space Engine (spaceengine.org).',
      'Image: ESO.',
      'Image: ESA/Webb, NASA &amp; CSA, A. Leroy.',
      'Image: NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble).',
    ])
      expect(html).toContain(credit)
    for (const file of ['m87-eht-eso1907a', 'sgra-eht-eso2208', 'gaia-bh3-eso2408a', 's2-orbit-eso0226c', 'm77-webb-sci26004b', 'crab-hubble-heic0515a'])
      expect(existsSync(`public/images/black-holes/${file}.jpg`)).toBe(true)
    expect(count(html, '<img ')).toBe(6)
    expect(html).toContain('An artist’s impression, not a photograph.')
    for (const img of html.match(/<img [^>]*>/g) ?? []) expect(img).toMatch(/alt="[^"]{20,}/)
  })

  it('gives away no answer before the run (§12)', () => {
    for (const answer of ['2.95', '2,950', '236,000', '235,000', '8.86 mm', 'Check it against NASA', 'xray_sources/blackholes_stellar', 'objects/black_holes1']) expect(html).not.toContain(answer)
    expect(html).not.toContain('Schwarzschild radius:')
    expect(html).not.toContain('r = 2GM / c²')
    expect(html).toContain('appear here after your first run')
  })

  it('answers "wouldn\'t a black hole pull harder?" without printing a horizon size (§12)', () => {
    expect(html).toContain('But wouldn’t a black hole pull harder?')
    expect(html).toContain('Same mass and same distance mean the same pull')
    expect(html).toContain('A bowling ball and a beach ball full of sand')
    const section = html.slice(html.indexOf('But wouldn’t a black hole pull harder?'), html.indexOf('Drawing 1: the same pull'))
    expect(section).not.toMatch(/\b3 km\b|\b3 kilometers\b|2\.95|about 3 /)
    expect(section).toContain('almost 700,000 kilometers')
  })

  it('explains why a core stops shrinking, with the right limit for each stage, and no answer to a guess', () => {
    for (const text of ['Why a squeezed core can stop shrinking', 'electron degeneracy pressure', 'parking lot with one car to a space', 'about 1.4 times the Sun’s mass', 'Chandrasekhar limit', 'between about 1 and', '3 times the Sun’s mass', 'a few tens of kilometers across'])
      expect(html).toContain(text)
    expect(html).toContain('chandra.harvard.edu/xray_sources/white_dwarfs.html')
    expect(html).toContain('imagine.gsfc.nasa.gov/science/objects/neutron_stars1.html')
    // The white dwarf's limit is not used as the neutron star's: the page says that electrons hold up a white dwarf, and neutrons a neutron star.
    expect(html).not.toContain('electron degeneracy pressure) holds up a neutron star')
    expect(html).toContain('Neutrons follow the')
    expect(html).toContain('Degeneracy pressure:')
    expect(html).toContain('the heaviest a white dwarf can be, about 1.4 times the Sun’s mass')
    expect(html).toContain('every bridge has a maximum load')
    expect(html).toContain('The neutron-star limit, about')
  })

  it('does not print what the live pages did not say', () => {
    expect(html).not.toContain('1054')
    expect(html).not.toContain('neutron star at its centre')
    expect(html).toContain('NASA’s measurements give radii from about 11 to 14 kilometers')
    expect(html).toContain('ESO’s release rounds it to “four million”')
    expect(html).not.toContain('14 July 2025')
  })

  it('draws no picture and no caption before the run', () => {
    expect(html).not.toContain('Picture 1: the ruler')
    expect(html).not.toContain('Picture 1b: one Sun')
    expect(html).not.toContain('How to read these diagrams')
    expect(html).toContain('Picture 1 (the ruler) appears here when you press Run.')
  })
})

describe('Black Holes 1: the white guess marks', () => {
  it('draws no white mark and no YOUR GUESS box when no guess is given', () => {
    const h = ruler({ guess: null })
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain(WHITE)
    const bars = render(createElement(HorizonBarsPicture, { smallKm: comparison.smallHorizonKm, largeKm: comparison.largeHorizonKm, guess: null }))
    expect(bars).not.toContain('YOUR GUESS')
    expect(bars).not.toContain('stroke="#ffffff"')
  })

  it('draws a box and a white line for a guess on the ruler, and a different guess is drawn in a different place', () => {
    const xs = sunGuesses.map((g) => {
      const km = { 'about-6000-km': 6000, 'about-30-km': 30, 'about-3-km': 3 }[g]
      const h = ruler({ guess: { km, label: g } })
      expect(h).toContain('YOUR GUESS')
      expect(h).toContain(g)
      expect(h).toContain('stroke="#ffffff"')
      expect(h).not.toContain('NaN')
      return h.match(/<line x1="([\d.]+)" y1="-6"[^>]*stroke="#ffffff"/)?.[1]
    })
    expect(new Set(xs).size).toBe(3)
    expect(Number(xs[0])).toBeGreaterThan(Number(xs[1]))
    expect(Number(xs[1])).toBeGreaterThan(Number(xs[2]))
  })

  it('draws a white bar for a guess in the bars picture, and its length follows the guess', () => {
    const widths = massGuesses.map((g) => {
      const widthKm = horizonRadiusKm(1) * { ten: 10, thousand: 1000, million: 1_000_000 }[g]
      const h = render(createElement(HorizonBarsPicture, { smallKm: comparison.smallHorizonKm, largeKm: comparison.largeHorizonKm, guess: { widthKm, label: g } }))
      expect(h).toContain('YOUR GUESS')
      expect(h).not.toContain('NaN')
      return Number(h.match(/<rect x="215" y="216" width="([\d.]+)"/)?.[1])
    })
    expect(widths[0]).toBeLessThan(widths[1])
    expect(widths[1]).toBeLessThan(widths[2])
  })

  it('the two real bars are the same whatever the guess', () => {
    const real = (g: MassScalingGuess) => {
      const h = render(createElement(HorizonBarsPicture, { smallKm: comparison.smallHorizonKm, largeKm: comparison.largeHorizonKm, guess: { widthKm: horizonRadiusKm(1) * { ten: 10, thousand: 1000, million: 1_000_000 }[g], label: g } }))
      return h.match(/<rect x="215" y="72"[^>]*>/)?.[0] + '|' + h.match(/<rect x="215" y="122"[^>]*>/)?.[0]
    }
    expect(real('ten')).toBe(real('million'))
  })

  it('Part 2 pictures carry no white mark', () => {
    const r2 = runBlackHoleSizeExperiment('earth', 0.5)
    const h = render(createElement(BallPicture, { markerRadiusKm: r2.chosenRadiusKm, horizonKm: r2.horizonRadiusKm }))
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain('stroke="#ffffff"')
    expect(h).toContain('The ball')
    expect(h).toContain('Horizon radius')
    expect(h).not.toContain('NaN')
    const h2 = ruler({ reserveGuessRow: false, chosenRadiusKm: partOne.horizonRadiusKm * 10, status: 'running' })
    expect(h2).not.toContain('YOUR GUESS')
    expect(h2).toContain('your chosen radius')
  })
})

describe('Black Holes 1: captions', () => {
  const caption = (complete: boolean) =>
    render(createElement(PartOneCaption, { complete, sunHorizonKm: comparison.smallHorizonKm, squeezeFactor: partOne.squeezeNeeded as number, largeHorizonKm: comparison.largeHorizonKm }))

  it('explains every drawn element, including the white marks, and says they are only guesses', () => {
    const h = caption(false)
    for (const text of ['How to read these diagrams', 'logarithmic ruler', 'The yellow dot', 'The red line is the horizon radius', 'The gray dots', 'The white mark and the YOUR GUESS box', 'Picture 1b', 'The two red bars', 'The white bar and its YOUR GUESS box'])
      expect(h).toContain(text)
    expect(h).toContain('your guess only')
  })

  it('holds the worked moment and the three-part "what to look for" until the run has finished', () => {
    const before = caption(false)
    expect(before).not.toContain('A worked moment')
    expect(before).not.toContain('What to look for')
    expect(before).not.toContain('2.95')
    const after = caption(true)
    expect(after).toContain('A worked moment')
    expect(after).toContain('2.95 km')
    expect(after).toContain('2,950 km')
    expect(count(after, 'Look at:')).toBe(3)
    expect(count(after, 'What it means:')).toBe(3)
    expect(count(after, 'Why it matters:')).toBe(3)
    expect(after).not.toContain('NaN')
  })

  it('has no verdict on a guess', () => {
    expect(noOwnWords(caption(true))).not.toMatch(VERDICT)
    expect(noOwnWords(render(createElement(PartTwoCaption, { hasRun: true, objectLabel: 'Earth' })))).not.toMatch(VERDICT)
  })

  it('Part 2 caption shows its "what to look for" only after a run', () => {
    expect(render(createElement(PartTwoCaption, { hasRun: false, objectLabel: 'Earth' }))).not.toContain('Look at:')
    expect(count(render(createElement(PartTwoCaption, { hasRun: true, objectLabel: 'Earth' })), 'Look at:')).toBe(2)
  })
})

describe('Black Holes 1: the results (Part 3)', () => {
  it('shows both guesses, tagged, with no verdict', () => {
    const h = results('about-30-km', 'million')
    expect(h).toContain('About 30 kilometers')
    expect(h).toContain('About a million times wider')
    expect(count(h, '>your guess<')).toBe(4) // two in the block, two on the Table 2 rows
    expect(noOwnWords(h)).not.toMatch(VERDICT)
    expect(h).not.toContain('NaN')
  })

  it('never changes the tables with a guess (only the guess block changes)', () => {
    const tables = (h: string) => h.slice(h.indexOf('Table 1:'))
    const a = tables(results('about-6000-km', 'ten'))
    for (const s of sunGuesses) for (const m of massGuesses) expect(tables(results(s, m))).toBe(a)
  })

  it('has a check-up with a reading for each row, and says what each table tells us', () => {
    const h = results('about-3-km', 'thousand')
    for (const text of ['Table 1: A check-up on the numbers this page uses', 'the same, to the rounding', 'inside the published range', '7.5% more than ESO', 'Table 2: The real Sun, squeezed in Part 1', 'Table 3: Your own run, from Part 2'])
      expect(h).toContain(text)
    expect(count(h, 'What this table tells us')).toBeGreaterThanOrEqual(2)
    expect(h).toContain('<strong>What it is.</strong>')
    expect(h).toContain('<strong>What it means.</strong>')
    expect(h).toContain('<strong>Why it matters.</strong>')
  })

  it('says "Not run yet" for Table 3 until a Part 2 run is done, then shows that run', () => {
    expect(results('about-3-km', 'thousand')).toContain('Not run yet.')
    const two = runBlackHoleSizeExperiment('neutron-star', horizonRadiusKm(1.4) * 0.5)
    const h = results('about-3-km', 'thousand', two)
    expect(h).not.toContain('Not run yet.')
    expect(h).toContain('A neutron star')
    expect(h).toContain('Yes: all of the mass is at or inside its horizon radius.')
  })

  it('shows the six objects and the NASA links held back until now', () => {
    const h = results('about-3-km', 'thousand')
    for (const text of ['Meet the six objects', 'Earth', 'The Sun', 'A neutron star', 'A stellar black hole', 'Sagittarius A*', 'M87*', '8.86 mm', 'Check it against NASA', 'chandra.harvard.edu', 'sunfact', 'earthfact', 'nasas-nicer-probes', '20240822'])
      expect(h).toContain(text)
  })

  it('does not call the guess "right" or "wrong" and does not say "off this time"', () => {
    for (const s of sunGuesses) expect(noOwnWords(results(s, 'ten'))).not.toMatch(VERDICT)
  })
})

describe('Black Holes 1: the tutor', () => {
  it('points to the marks by name in its first question', () => {
    const h = render(createElement(BlackHoleSizeTutor, { predictedSunRadius: 'about-30-km', predictedMassScaling: 'ten' }))
    expect(h).toContain('white YOUR GUESS box')
    expect(h).toContain('Picture 1')
    expect(h).not.toContain('NaN')
    expect(noOwnWords(h)).not.toMatch(VERDICT)
  })
})
