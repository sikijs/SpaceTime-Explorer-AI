import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { FourTimesGuess, RingSizeGuess } from '../physics/gravitationalLensingExperiment'
import { GravitationalLensingExperiment } from './GravitationalLensingExperiment'
import { MassGraph, Part1GraphCaption, Part1SideCaption, Part1SkyCaption, Part2Caption, SideView, SkyView } from './GravitationalLensingPictures'
import { GravitationalLensingResults } from './GravitationalLensingResults'
import { GravitationalLensingExplanation, GravitationalLensingTutor, tutorPrompt } from './GravitationalLensingTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run has finished,
// the white marks appear exactly when a guess is given and the run has finished, and no page says "right", "wrong" or "matched" before the
// tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. ("pointing outward" is not a verdict; the page's own "not whether it is right" is taken out first.)
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b/i
const ringAll: RingSizeGuess[] = ['larger', 'same', 'smaller']
const fourAll: FourTimesGuess[] = ['four', 'two', 'same']
const guesses = (ringSize: RingSizeGuess, fourTimes: FourTimesGuess) => ({ ringSize, fourTimes })
const sky = (props: Partial<Parameters<typeof SkyView>[0]>) => render(createElement(SkyView, { ringProgress: 1, yourMass: null, yourProgress: 0, finished: false, guesses: null, ...props }))
const graph = (props: Partial<Parameters<typeof MassGraph>[0]>) => render(createElement(MassGraph, { yourMass: null, finished: false, guesses: null, ...props }))
const WHITE_RING = /<circle[^>]*fill="none"[^>]*stroke="#ffffff"/

describe('Cosmology 7 renders (at rest)', () => {
  const html = render(createElement(GravitationalLensingExperiment, {}))

  it('renders the heading, Part 1, the words box, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 7: Gravitational Lensing')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['hubble-gravitational-lenses', 'wordbank/gravitational-lensing', 'opo1037a', 'biggest-zoom-lens', 'glossary/term/79', 'stunning_Einstein_ring', 'Strong_gravitational_lenses_captured_by_Euclid', 'weic2418', 'Webb_brings_cosmic_lenses_into_focus', 'cosmos.astro.caltech.edu/news/90', 'astro-ph/0409132', 'hubble-constant-and-tension'])
      expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('keeps the two guess questions exactly as approved and has the step-by-step introduction with its new sections', () => {
    expect(html).toContain('If the cluster between us and a distant galaxy had more mass, would the ring of light we see be larger, the same size, or smaller?')
    expect(html).toContain('If the cluster had four times the mass, how wide would the ring be compared with before?')
    for (const lead of [
      'The question.',
      'What happens.',
      'Step 1: a reminder, gravity bends light.',
      'Step 2: what a lens is.',
      'Step 3: three players.',
      'Step 4: why a ring.',
      'When the line-up is not perfect.',
      'Arcs.',
      'Several separate images.',
      'A worked example.',
      'Why this experiment draws only a ring.',
      'A daily-life picture.',
      'Step 5: a new unit, the arcsecond.',
      'Step 6: why ask this at all.',
      'Step 7: visible and dark matter, a reminder.',
      'Step 8: lensing today (as of November 2026).',
      'Your job.',
      'What to look for.',
      'How this page is laid out.',
      'Your guesses and the real pictures.',
      'What we assume.',
      'Some new words.',
    ])
      expect(html).toContain(lead)
    expect(html).toContain('Gravity can act like a lens, magnifying and distorting the light of distant objects that would otherwise be invisible.')
    expect(html).toContain('29 May 1919')
    expect(html).toContain('135 lensed images of 42 background galaxies')
    expect(html).toContain('NGC 6505')
    expect(html).toContain('4.42 billion light-years')
    expect(html).toContain('about <strong>500</strong> strong-lens candidates')
    expect(html).toContain('about 250,000 distant galaxies')
    expect(html).toContain('2.06 km')
    expect(html).toContain('1/3600th of a degree')
    expect(html).toContain('Your guesses never change the real pictures or tables.')
    expect(html).toContain('as of November 2026, NASA says space-telescope measurements give around 70 to 76')
  })

  it('explains arcs and several images in plain words, with the worked 135 ÷ 42 and the schematic', () => {
    expect(html).toContain('Real life is rarely perfect.')
    expect(html).toContain('a roundish galaxy turns into a long thin curve')
    expect(html).toContain('They are copies of <em>one</em> galaxy, not different galaxies.')
    expect(html).toContain('135 ÷ 42 ≈ 3.2')
    expect(html).toContain('Move your head a little to the side and the ring breaks into bright arcs and spots')
    expect(html).toContain('Two skies, drawn for this page (a schematic, not a photograph)')
    expect(html).toContain('Perfect line-up: a complete ring')
    expect(html).toContain('Slightly off: arcs and separate images')
  })

  it('shows four real pictures from NASA and ESA/Hubble, each with alt text, a caption, the full credit, a source link and its licence', () => {
    const files = ['lensing-diagram-nasa-stsci.png', 'cosmic-horseshoe-esa-hubble-potw1151a-crop.jpg', 'cluster-0024-1654-esa-hubble-opo9610a.jpg', 'abell-1689-nasa-hubble-acs.jpg']
    for (const f of files) expect(html).toContain(f)
    expect(count(html, '<img ')).toBe(4)
    expect(count(html, '<figcaption')).toBe(5)
    for (const img of html.match(/<img [^>]*>/g) ?? []) expect(img).toMatch(/alt="[^"]{40,}"/)
    for (const credit of ['NASA, ESA, Ann Feild (STScI), Frank Summers (STScI)', 'ESA/Hubble &amp; NASA', 'W.N. Colley and E. Turner (Princeton University), J.A. Tyson (Bell Labs, Lucent Technologies) and NASA / ESA', 'NASA, N. Benitez (JHU), T. Broadhurst (Racah Institute of Physics/The Hebrew University), H. Ford (JHU), M. Clampin (STScI), G. Hartig (STScI), G. Illingworth (UCO/Lick Observatory), the ACS Science Team and ESA'])
      expect(html).toContain(credit)
    for (const href of ['science.nasa.gov/asset/webb/gravitational-lensing-diagram', 'esahubble.org/images/potw1151a', 'esahubble.org/images/opo9610a', 'science.nasa.gov/asset/hubble/galaxy-abell-1689s-gravitational-lens', 'esahubble.org/copyright']) expect(html).toContain(href)
    expect(count(html, 'CC BY 4.0')).toBe(2)
    expect(html).toContain('Cropped; no other change.')
    expect(html).toContain('Here the lens is a single massive galaxy and not a whole cluster')
  })

  it('has four look-for items in the three parts, and no result in them', () => {
    const look = html.slice(html.indexOf('What to look for.'), html.indexOf('How this page is laid out.'))
    expect(count(look, '<strong>Look at:</strong>')).toBe(4)
    expect(count(look, '<strong>What it means:</strong>')).toBe(4)
    expect(count(look, '<strong>Why it matters:</strong>')).toBe(4)
  })

  it('does not reveal the observed ring, the visible share, the square root or the conclusion above Part 1', () => {
    // the words a learner reads (tags and attributes, such as an image's height, are not text)
    const intro = html.slice(html.indexOf('The question.'), html.indexOf('Part 1: Predict, then watch')).replace(/<[^>]+>/g, ' ')
    for (const phrase of [/47/, /15 percent/i, /15%/, /square root/i, /more mass gives/i, /larger ring/i, /bigger ring/i, /most of the mass/i, /6\.7/, /twice as wide/i, /four times as wide/i, /second line of evidence/i, /mass is unseen/i])
      expect(intro).not.toMatch(phrase)
    expect(intro).toContain('They are explained, with their numbers, after you press Run.')
  })

  it('holds the ring formula and the after-run links until the first Run', () => {
    const box = html.slice(html.indexOf('Words and formulas'), html.indexOf('Want to know more?'))
    for (const term of ['Galaxy cluster', 'Gravitational lensing', 'Einstein ring', 'Degree, arcminute, arcsecond', 'Strong lensing', 'Weak lensing', 'Microlensing', 'Visible matter', 'Hubble tension', 'Formula: the real bending angle']) expect(box).toContain(term)
    expect(box).not.toContain('Formula: the ring radius')
    expect(box).toContain('appear here after your first run')
    for (const href of ['1e0657', 'astro-ph/0608407', '1309.3565', '1807.06209']) expect(html).not.toContain(href)
    expect(html).toContain('appear here after your first Run')
  })

  it('draws no picture, no caption, no ring and no guess box before the run', () => {
    expect(html).not.toContain('What we see on the sky from Earth')
    expect(html).not.toContain('Side view: light from a distant galaxy')
    expect(html).not.toContain('Ring radius against cluster mass')
    expect(html).not.toContain('How to read this picture')
    expect(html).not.toContain('YOUR GUESS</text>')
    expect(html).toContain('After you press Run, the two yellow dots set off')
  })
})

describe('the sky view', () => {
  it('draws the blue and green rings and their labels once drawn, and no gold ring in Part 1', () => {
    const h = sky({})
    expect(h).toContain('stroke="#38bdf8"')
    expect(h).toContain('stroke="#4ade80"')
    expect(h).not.toContain('stroke="#fbbf24"')
    expect(h).toContain('Visible matter only')
    expect(h).toContain('Observed ring')
    expect(h).toContain('(47″, measured)')
    expect(h).toContain('20 arcseconds')
    expect(h).toContain('Cluster')
    expect(h).not.toContain('NaN')
    expect(sky({ ringProgress: 0.3 })).not.toContain('Observed ring')
  })

  it('draws the white marks, the violet imagined ring and two YOUR GUESS boxes only when finished and guesses are given', () => {
    expect(sky({ guesses: guesses('larger', 'two') })).not.toContain('YOUR GUESS')
    expect(sky({ finished: true })).not.toContain('YOUR GUESS')
    expect(sky({ finished: true })).not.toContain('imagined')
    for (const r of ringAll)
      for (const f of fourAll) {
        const h = sky({ finished: true, guesses: guesses(r, f) })
        expect(count(h, 'YOUR GUESS')).toBe(2)
        expect(h).toContain('stroke="#c084fc"')
        expect(h).toContain('imagined: four times')
        expect(h).toContain('the visible mass')
        expect(h).toContain('(36.4″)')
        expect(h).toMatch(/stroke="#ffffff"/)
        expect(h).not.toContain('NaN')
      }
  })

  it('makes a different mark for each answer: an arrow out, an arrow in or a small ring; and a guess ring at 1, 2 or 4 times the blue ring', () => {
    const first = ringAll.map((r) => sky({ finished: true, guesses: guesses(r, 'two') }))
    expect(new Set(first).size).toBe(3)
    const second = fourAll.map((f) => sky({ finished: true, guesses: guesses('larger', f) }))
    expect(new Set(second).size).toBe(3)
    const radii = (h: string) => [...h.matchAll(/<circle[^>]*cx="190"[^>]*cy="190"[^>]*r="([\d.]+)"[^>]*fill="none"[^>]*stroke="#ffffff"/g)].map((m) => Number(m[1]))
    expect(radii(second[0])[0]).toBeCloseTo(72.9 * 2.2, 0)
    expect(radii(second[1])[0]).toBeCloseTo(36.4 * 2.2, 0)
    expect(radii(second[2])[0]).toBeCloseTo(18.2 * 2.2, 0)
    // guess 1: the small ring has no arrow head, the arrows have a white head
    expect(count(sky({ finished: true, guesses: guesses('same', 'two') }), '<polygon')).toBe(0)
    expect(count(sky({ finished: true, guesses: guesses('larger', 'two') }), '<polygon')).toBe(1)
    expect(sky({ finished: true, guesses: guesses('same', 'two') })).toMatch(WHITE_RING)
  })

  it('points the arrow the right way: outward has its tip farther from the centre than its base, inward the other way', () => {
    // the arrow lies to the left of the cluster, so "farther from the centre" is farther left (a smaller x)
    const headXs = (h: string) => {
      const m = h.match(/<polygon points="([\d.]+),[\d.]+ ([\d.]+),/)!
      return { tip: Number(m[1]), base: Number(m[2]) }
    }
    const out = headXs(sky({ finished: true, guesses: guesses('larger', 'two') }))
    const inward = headXs(sky({ finished: true, guesses: guesses('smaller', 'two') }))
    expect(out.tip).toBeLessThan(out.base)
    expect(inward.tip).toBeGreaterThan(inward.base)
    expect(out.tip).toBeLessThan(inward.tip)
  })

  it('draws the gold ring only in Part 2, following the mass, and the real rings do not depend on a guess', () => {
    const gold = sky({ yourMass: 1e14, yourProgress: 1 })
    expect(gold).toContain('stroke="#fbbf24"')
    expect(gold).toContain('Ring for your chosen mass')
    expect(gold).not.toEqual(sky({ yourMass: 3e14, yourProgress: 1 }))
    expect(sky({ yourMass: 1e14, yourProgress: 0 })).not.toContain('stroke="#fbbf24"')
    const withMarks = sky({ finished: true, guesses: guesses('smaller', 'same') })
    const without = sky({ finished: true })
    expect(withMarks.match(/stroke="#38bdf8"/g)).toEqual(without.match(/stroke="#38bdf8"/g))
    expect(withMarks.match(/stroke="#4ade80"/g)).toEqual(without.match(/stroke="#4ade80"/g))
  })
})

describe('the graph and the side view', () => {
  it('draws the curve, the blue dot and the green line, no gold dot in Part 1, and the gold dot following the mass in Part 2', () => {
    const h = graph({})
    expect(h).toContain('stroke="#a78bfa"')
    expect(h).toContain('Observed ring: 47 arcseconds (measured)')
    expect(h).toContain('Ring for any mass (calculated here)')
    expect(h).toContain('Visible matter only')
    expect(h).not.toContain('Your chosen mass')
    expect(graph({ yourMass: 1e14 })).toContain('Your chosen mass')
    expect(graph({ yourMass: 1e14 })).not.toEqual(graph({ yourMass: 3e14 }))
    expect(h).not.toContain('NaN')
  })

  it('draws the white ring, the violet imagined point and one YOUR GUESS box only once finished, different for each answer', () => {
    expect(graph({ guesses: guesses('larger', 'two') })).not.toContain('YOUR GUESS')
    expect(graph({ finished: true })).not.toContain('imagined')
    const marks = fourAll.map((f) => graph({ finished: true, guesses: guesses('larger', f) }))
    for (const h of marks) {
      expect(count(h, 'YOUR GUESS')).toBe(1)
      expect(h).toMatch(WHITE_RING)
      expect(h).toContain('imagined: four times the visible mass')
      expect(h).not.toContain('NaN')
    }
    expect(new Set(marks).size).toBe(3)
  })

  it('draws the side view with Earth, the cluster, the source and the two rays, labelled', () => {
    const h = render(createElement(SideView, { mass: 2e14, travel: 0.5 }))
    for (const label of ['Earth', 'Galaxy cluster (the lens)', 'Distant galaxy', '(the source)', 'light rays', 'light bends toward it here']) expect(h).toContain(label)
    expect(h).not.toContain('NaN')
    expect(render(createElement(SideView, { mass: 4e14, travel: 0.5 }))).not.toEqual(render(createElement(SideView, { mass: 1e13, travel: 0.5 })))
  })
})

describe('the captions', () => {
  it('shows more of each caption as its feature is drawn, and the white marks, violet ring and worked moment only at the end', () => {
    const side = render(createElement(Part1SideCaption, { started: false }))
    expect(side).toContain('Earth')
    expect(side).not.toContain('two yellow dots')
    expect(render(createElement(Part1SideCaption, { started: true }))).toContain('two yellow dots')
    const before = render(createElement(Part1SkyCaption, { started: false, arrived: false }))
    expect(before).not.toContain('dashed blue ring')
    const during = render(createElement(Part1SkyCaption, { started: true, arrived: false }))
    expect(during).toContain('dashed blue ring')
    for (const phrase of ['white marks', 'violet', 'A worked moment', 'What to look for', '28.8']) expect(during).not.toContain(phrase)
    const after = render(createElement(Part1SkyCaption, { started: true, arrived: true }))
    for (const piece of ['dotted violet ring', 'The <strong>white marks</strong>', 'A worked moment.', 'What to look for.', '28.8 arcseconds farther out']) expect(after).toContain(piece)
    expect(after).toContain('only a marker')
  })

  it('gives look-for items in three parts with real numbers', () => {
    const sky3 = render(createElement(Part1SkyCaption, { started: true, arrived: true }))
    expect(count(sky3, 'What it means:')).toBe(3)
    expect(count(sky3, 'Why it matters:')).toBe(3)
    expect(sky3).toContain('exactly twice as wide (36.4 against 18.2)')
    const g = render(createElement(Part1GraphCaption, { started: true, arrived: true }))
    expect(g).toContain('about 2.0 × 10¹⁴ solar masses is inside the observed ring')
    expect(g).toContain('3.0 × 10¹³')
    expect(count(g, 'What it means:')).toBe(3)
    const g0 = render(createElement(Part1GraphCaption, { started: true, arrived: false }))
    expect(g0).not.toContain('violet')
    expect(count(g0, 'What it means:')).toBe(2)
  })

  it('does not say the square root, "most of the mass is unseen" or give a verdict in any caption', () => {
    for (const h of [render(createElement(Part1SideCaption, { started: true })), render(createElement(Part1SkyCaption, { started: true, arrived: true })), render(createElement(Part1GraphCaption, { started: true, arrived: true })), render(createElement(Part2Caption, { mass: 1e14 }))]) {
      expect(h).not.toMatch(/square root/i)
      expect(h).not.toMatch(/most of the mass/i)
      // the captions' own "do not say right or wrong" says the marks are not a verdict, so it is taken out before looking for one
      expect(h.replace(/(do|does) not say right or wrong/g, '')).not.toMatch(VERDICT)
    }
  })

  it('Part 2 caption follows the mass', () => {
    const low = render(createElement(Part2Caption, { mass: 3e13 }))
    const high = render(createElement(Part2Caption, { mass: 4e14 }))
    expect(low).toContain('less than')
    expect(high).toContain('more than')
    expect(low).not.toEqual(high)
    expect(low).not.toContain('NaN')
  })
})

describe('Part 3, the results', () => {
  const part3 = (mass: number, g = guesses('larger', 'two') as ReturnType<typeof guesses> | null) => render(createElement(GravitationalLensingResults, { guesses: g, mass }))
  const html = part3(2e14)

  it('has Table 1 with its four rows, the given and published values and the plain readings', () => {
    expect(html).toContain('Table 1: Check-up')
    expect(html).toContain('18.2 arcseconds')
    expect(html).toContain('about 50 in Broadhurst and others 2005')
    expect(html).toContain('less, by 28.8')
    expect(html).toContain('2.0 × 10¹⁴ solar masses')
    expect(html).toContain('Calculated here only')
    expect(html).toContain('more, by 0.4')
    expect(html).toContain('36.4 against 18.2 arcseconds')
    expect(html).toContain('exactly double')
    expect(html).toContain('no cut-off such as')
    expect(html).not.toContain('NaN')
  })

  it('has a "What this table tells us" note under each of the two tables, with what it is, what it means and why it matters', () => {
    expect(count(html, 'What this table tells us')).toBe(2)
    expect(count(html, 'What it is')).toBeGreaterThanOrEqual(5)
    expect(count(html, 'What it means')).toBeGreaterThanOrEqual(5)
    expect(count(html, 'Why it matters')).toBeGreaterThanOrEqual(5)
    expect(count(html, 'How sure')).toBeGreaterThanOrEqual(4)
  })

  it('has Table 2 with the published value and how yours compares, the gold row following the mass', () => {
    expect(html).toContain('Table 2: The rings')
    const rowOf = (h: string) => h.slice(h.indexOf('Your cluster'), h.indexOf('The observed ring (2'))
    expect(rowOf(part3(3e13))).toContain('18.2')
    expect(rowOf(part3(3e13))).toContain('less, by 28.8')
    expect(rowOf(part3(4e14))).toContain('66.5')
    expect(rowOf(part3(4e14))).toContain('more, by 19.5')
    expect(rowOf(part3(1e14))).not.toEqual(rowOf(part3(2e14)))
    expect(html).toContain('about 50 (Broadhurst and others 2005)')
  })

  it('updates "What your numbers show" with the mass and ends with the trial-values line', () => {
    expect(html).toContain('What your numbers show.')
    expect(part3(3e13)).toContain('your ring is <strong>18.2</strong> arcseconds')
    expect(part3(4e14)).toContain('your ring is <strong>66.5</strong> arcseconds')
    expect(html).toContain('These are trial values and your own numbers. They do not say the real cluster is like that.')
  })

  it('shows both guesses beside the results as guesses only, with tags on the rows, and only when there are guesses', () => {
    expect(html).toContain('Your guesses')
    expect(html).toContain('it would give a larger ring')
    expect(html).toContain('the ring would be twice as wide')
    expect(count(html, 'Guess 1')).toBe(1)
    expect(part3(2e14, null)).not.toContain('Your guesses')
    expect(part3(2e14, null).length).toBeLessThan(html.length)
  })

  it('never gives a verdict and never changes Table 1 with a guess or the mass', () => {
    for (const r of ringAll)
      for (const f of fourAll) {
        const h = part3(2e14, guesses(r, f))
        expect(h.replace(/not whether it is right/g, '')).not.toMatch(VERDICT)
        expect(h).not.toContain('That is what you guessed')
        expect(h).not.toMatch(/exactly twice as wide/i)
      }
    const table1 = (h: string) => h.slice(h.indexOf('Table 1: Check-up'), h.indexOf('Table 2: The rings'))
    const strip = (h: string) => h.replace(/<span[^>]*>.*?<\/span>/g, '')
    expect(strip(table1(part3(3e13, guesses('larger', 'two'))))).toEqual(strip(table1(part3(4e14, guesses('smaller', 'four')))))
  })

  it('does not answer the tutor\'s question: no "second line of evidence", no "most of the mass is unseen", no 2.6 times as wide', () => {
    for (const phrase of [/second line of evidence/i, /most of the (cluster's )?mass is/i, /independent/i, /times more mass than we can see/i]) expect(html).not.toMatch(phrase)
  })
})

describe('Part 4, the tutor', () => {
  it('asks the observe, compare and conceptual questions with no verdict, naming the white marks', () => {
    for (const r of ringAll)
      for (const f of fourAll)
        for (const step of ['observe', 'compare', 'conceptual'] as const) {
          const text = tutorPrompt(step, r, f)
          expect(text).not.toMatch(VERDICT)
          expect(text).not.toContain('That is what you guessed')
        }
    expect(tutorPrompt('observe', 'same', 'same')).toContain('white marks')
    expect(tutorPrompt('compare', 'larger', 'two')).toContain('white arrow pointing outward from the blue ring')
    expect(tutorPrompt('compare', 'smaller', 'four')).toContain('white arrow pointing inward from the blue ring')
    expect(tutorPrompt('compare', 'same', 'same')).toContain('small white ring on the blue ring')
    expect(tutorPrompt('compare', 'larger', 'two')).toContain('white ring twice the width of the blue ring')
    expect(tutorPrompt('conceptual', 'same', 'same')).toContain('What might explain the difference?')
  })

  it('starts at the first question and gives no explanation yet', () => {
    const h = render(createElement(GravitationalLensingTutor, { predictedRingSize: 'larger', predictedFourTimes: 'two' }))
    expect(h).toContain('Compare the rings on the picture of the sky')
    expect(h).not.toContain('That is what you guessed')
    expect(h).not.toContain('That is not what you guessed')
    expect(h).not.toContain('square root')
  })

  it('marks each guess correctly in the explanation, for all nine pairs', () => {
    for (const r of ringAll)
      for (const f of fourAll) {
        const h = render(createElement(GravitationalLensingExplanation, { predictedRingSize: r, predictedFourTimes: f }))
        const expectedOk = (r === 'larger' ? 1 : 0) + (f === 'two' ? 1 : 0)
        expect(count(h, 'That is what you guessed.')).toBe(expectedOk)
        expect(count(h, 'That is not what you guessed.')).toBe(2 - expectedOk)
        expect(h).not.toContain('NaN')
      }
  })

  it('quotes the real numbers, explains the conclusion and the independence, and names what is not covered', () => {
    const h = render(createElement(GravitationalLensingExplanation, { predictedRingSize: 'larger', predictedFourTimes: 'two' }))
    expect(h).toContain('makes a ring of 18.2 arcseconds (the blue ring)')
    expect(h).toContain('makes 47.0 (the green ring)')
    expect(h).toContain('36.4 arcseconds against the blue ring')
    expect(h).toContain('exactly 2 times as wide')
    expect(h).toContain('2.6 × 2.6 ≈ 6.7')
    expect(h).toContain('worked out here from two papers')
    expect(h).toContain('a second, independent line of evidence for dark matter')
    expect(h).toContain('No source read for this page says what dark matter is made of')
    expect(h).toContain('Bullet Cluster')
    expect(h).toContain('A familiar comparison: a square garden')
  })
})
