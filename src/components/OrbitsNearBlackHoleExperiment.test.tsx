import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  runFarPair,
  runOrbitsNearBlackHoleExperiment,
  runPartOne,
} from '../physics/orbitsNearBlackHoleExperiment'
import type { FarGuess, LastSafeGuess, NudgeGuess } from '../physics/orbitsNearBlackHoleExperiment'
import { OrbitsNearBlackHoleExperiment } from './OrbitsNearBlackHoleExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import {
  BlackHoleOptionsNote,
  GuessNotes,
  OrbitsNearBlackHoleIntro,
  OrbitsNearBlackHoleLinks,
  PartTwoGuide,
  RealOrbits,
  orbitsNearBlackHoleWordsEntries,
} from './OrbitsNearBlackHoleIntro'
import { DistanceGraph, FarGuessStrip, FarPairCaption, GraphCaption, PanelPair, PanelsCaption } from './OrbitsNearBlackHolePictures'
import { OrbitsNearBlackHoleResults } from './OrbitsNearBlackHoleResults'
import { OrbitsNearBlackHoleExplanation, OrbitsNearBlackHoleTutor } from './OrbitsNearBlackHoleTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks
// appear exactly when a guess is given and follow it, the real tables never change with a guess, and no page says "right" or "wrong" before
// the tutor. They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
// A verdict on a guess. The page's own "does not say whether they are right" is taken out first.
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong|ordinary gravity is right there/g, '')
const WHITE = 'stroke="#ffffff"'
const nudgeGuesses: NudgeGuess[] = ['wobbles', 'spirals-in', 'flies-off']
const lastSafeGuesses: LastSafeGuess[] = ['anywhere', 'three', 'ten']

const partOne = runPartOne()
const farPair = runFarPair()
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const results = (n: NudgeGuess, l: LastSafeGuess, f: FarGuess, two = null as ReturnType<typeof runOrbitsNearBlackHoleExperiment> | null) =>
  render(createElement(OrbitsNearBlackHoleResults, { partOne, farPair, nudgeGuess: n, lastSafeGuess: l, farGuess: f, partTwo: two }))
const pair = (n: NudgeGuess | null, l: LastSafeGuess | null, turns = 10) =>
  render(createElement(PanelPair, { result: partOne, turnsReached: turns, showLastSafeOrbit: true, nudgeGuess: n, lastSafeGuess: l }))
const graph = (l: LastSafeGuess | null) =>
  render(
    createElement(DistanceGraph, {
      ordinary: partOne.ordinary,
      exact: partOne.exact,
      startInHorizonRadii: partOne.startInHorizonRadii,
      turnsReached: 10,
      showLastSafe: true,
      logAxis: true,
      lastSafeGuess: l,
    }),
  )

describe('Black Holes 3 renders (at rest)', () => {
  const html = render(createElement(OrbitsNearBlackHoleExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 3: Orbits Near a Black Hole: Is There a Point of No Safe Orbit?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('Real orbits we have seen, and recent news (as of November 2026)'))
    expect(html).toContain('eso.org/public/news/eso2006/')
    expect(html).toContain('eso.org/public/news/eso2612/')
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
    expect(html).not.toContain('viewBox="0 0 400 512"')
    expect(html).toContain('Pictures 1, 1b and 2 appear here when you press Run')
  })

  it('keeps the three approved questions and their buttons unchanged', () => {
    for (const label of [
      'It wobbles a little and keeps circling',
      'It spirals in and crosses the horizon',
      'It flies off',
      'Anywhere outside the horizon',
      'About 3 horizon radii from the center',
      'About 10 horizon radii from the center',
      'Very different',
      'Nearly the same',
    ])
      expect(html).toContain(label)
  })

  it('does not give away any guess before the run (CLAUDE.md §12)', () => {
    for (const giveaway of [
      '6GM/c²',
      'is at 3 horizon radii',
      'last safe orbit is at',
      '3.03',
      '3.025',
      'plunged after',
      'crossed the horizon after',
      '1.5 turns',
      'heasarc',
      'Taking the plunge',
      'ISCO',
      'marble',
    ])
      expect(html).not.toContain(giveaway)
    expect(html).not.toContain('0.158')
    expect(html).not.toContain('0.162')
    expect(html).not.toContain('0.707')
  })

  it('says that predictions never change the real pictures or tables, and that they are drawn in white', () => {
    expect(html).toContain('The real pictures and tables do not change with your guesses')
    expect(html).toContain('drawn on the real pictures in white')
  })

  it('has the guess notes under each question, and the lock sentence only after a run', () => {
    expect(html).toContain('About question 1')
    expect(html).toContain('About question 2')
    expect(html).toContain('About question 3')
    expect(html).not.toContain('Your prediction is locked')
  })
})

describe('the introduction, the real orbits and the links', () => {
  const intro = render(createElement(OrbitsNearBlackHoleIntro))
  const real = render(createElement(RealOrbits))
  const links = render(createElement(OrbitsNearBlackHoleLinks))

  it('render without NaN, with the question, the stone-on-a-string comparison and the two pictures', () => {
    expect(intro).not.toContain('NaN')
    expect(real).not.toContain('NaN')
    expect(intro).toContain('Going round in a circle')
    expect(intro).toContain('stone on a string')
    expect(intro).toContain('Two sets of rings around a black hole')
    expect(real).toContain('s2-orbit-eso0226c.jpg')
    expect(real).toContain('sgra-eht-eso2208.jpg')
    expect(real).toContain('Image: ESO.')
    expect(real).toContain('EHT Collaboration (CC BY 4.0), via ESO')
  })

  it('gives the sourced S2 and S301 figures, with the horizon radii from the module', () => {
    expect(real).toContain('rosette')
    expect(real).toContain('once every 16 years')
    expect(real).toContain('120 times the distance from the Earth to the Sun')
    expect(real).toContain('8.7 years')
    expect(real).toContain('25,000 km a second')
    expect(real).toContain('1.78 billion km')
    expect(real).toContain('2031')
    expect(real).toContain('less than about 1,600')
    expect(real).toContain('about 140')
    expect(real).toContain('about 150')
    expect(real).toContain('The paper in <em>Nature</em> was not read')
  })

  it('defines the last safe orbit without giving its distance, and the horizon radius', () => {
    expect(intro).toContain('<strong>last safe orbit</strong> is the closest distance at which a circular orbit can still survive a small nudge')
    expect(intro).toContain('<strong>horizon radius</strong>')
    expect(intro).not.toMatch(/last safe orbit[^.]*\b3 horizon radii/)
  })

  it('shows the two ESO links from the start and holds the two NASA links back', () => {
    expect(links).toContain('eso.org/public/news/eso2006/')
    expect(links).toContain('eso.org/public/news/eso2612/')
    expect(links).not.toContain('heasarc')
    expect(links).toContain('held back')
  })
})

describe('the words box (the shared ReferencePanel, as in the other experiments)', () => {
  const before = orbitsNearBlackHoleWordsEntries(false)
  const after = orbitsNearBlackHoleWordsEntries(true)

  it('uses the shared blue panel', () => {
    const html = render(createElement(ReferencePanel, { entries: before }))
    expect(html).toContain('Words and formulas')
  })

  it('defines the specialised terms the page uses', () => {
    const terms = before.map((e) => e.term)
    for (const term of ['Circular orbit', 'Nudge', 'Plunge', 'Last safe orbit', 'Launch speed', 'Precess', 'Accretion disk', 'Astronomical unit (AU)'])
      expect(terms).toContain(term)
  })

  it('holds back the formulas and the value of the last safe orbit until after the first run', () => {
    const textBefore = JSON.stringify(before)
    expect(textBefore).not.toContain('6GM/c²')
    expect(textBefore).not.toContain('88.6')
    expect(textBefore).toContain('appear here after your first run')
    const textAfter = JSON.stringify(after)
    expect(textAfter).toContain('6GM/c²')
    expect(textAfter).toContain('3 × 29.5 km = 88.6 km')
    expect(textAfter).toContain('0.707 and 0.500')
    expect(textAfter).toContain('6 times the black hole')
  })
})

describe('the notes under the Part 1 questions', () => {
  it('give the situation with real numbers and give nothing away', () => {
    const n1 = render(createElement(GuessNotes, { n: 1 }))
    const n2 = render(createElement(GuessNotes, { n: 2 }))
    const n3 = render(createElement(GuessNotes, { n: 3 }))
    expect(n1).toContain('59.1 km')
    expect(n1).toContain('0.6%')
    expect(n3).toContain('20 horizon radii')
    for (const h of [n1, n2, n3]) {
      expect(h).toContain('How to answer')
      expect(h).not.toContain('NaN')
      expect(noOwnWords(h)).not.toMatch(VERDICT)
      expect(h).not.toContain('6GM')
      expect(h).not.toMatch(/\bis at 3\b/)
    }
  })
})

describe('Picture 1 and its white marks (guesses 1 and 2)', () => {
  it('draws no white mark and no YOUR GUESS box without a guess', () => {
    const h = pair(null, null)
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain(WHITE.replace('#ffffff', '#ffffff'.toUpperCase()))
    expect(h).not.toContain('stroke="#ffffff"')
  })

  it('draws a YOUR GUESS box with the guess in it for guess 1 and for guess 2', () => {
    const h = pair('spirals-in', 'three')
    expect((h.match(/YOUR GUESS/g) ?? []).length).toBe(2)
    expect(h).toContain('it spirals in')
    expect(h).toContain('last safe place: 3 horizon radii')
  })

  it('makes guess 1 follow the guess: a different shape for each answer', () => {
    const marks = nudgeGuesses.map((g) => pair(g, null))
    expect(new Set(marks).size).toBe(3)
    expect(marks[0]).toContain('r="13"')
    expect(marks[1]).not.toContain('r="13"')
  })

  it('makes guess 2 follow the guess: a ring for 3, an off-view arrow for 10, a bar for anywhere', () => {
    const marks = lastSafeGuesses.map((g) => pair(null, g))
    expect(new Set(marks).size).toBe(3)
    expect(marks[2]).toContain('off this view')
    expect(marks[1]).not.toContain('off this view')
    expect(marks[1]).toContain('stroke-width="6"')
  })

  it('does not change the real paths with a guess: the probes’ trails are the same whatever is guessed', () => {
    const trail = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    expect(trail(pair('wobbles', 'ten'))).toBe(trail(pair('spirals-in', 'three')))
    expect(trail(pair(null, null))).toBe(trail(pair('flies-off', 'anywhere')))
  })

  it('draws without NaN, at the start, mid-run and at the end', () => {
    for (const turns of [0, 0.5, 1.5, 10]) expect(pair('wobbles', 'ten', turns)).not.toContain('NaN')
  })
})

describe('Picture 1b and its white bracket (guess 3)', () => {
  it('draws a different sign for each answer, in a YOUR GUESS box, and says it is only a marker', () => {
    const a = render(createElement(FarGuessStrip, { guess: 'very-different' }))
    const b = render(createElement(FarGuessStrip, { guess: 'nearly-same' }))
    expect(a).not.toBe(b)
    expect(a).toContain('≠')
    expect(b).toContain('≈')
    expect(a).toContain('YOUR GUESS')
    expect(a).toContain('only a marker')
  })

  it('draws the 20-radii pair with no white mark of its own', () => {
    const h = render(createElement(PanelPair, { result: farPair, turnsReached: 10, showLastSafeOrbit: true, compact: true }))
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain('NaN')
  })
})

describe('Picture 2 and its white line (guess 2)', () => {
  it('draws no white mark without a guess', () => {
    expect(graph(null)).not.toContain('YOUR GUESS')
  })

  it('draws a white line at the guessed distance, higher for 10 than for 3, and a bar for anywhere', () => {
    const y = (h: string) => Number(/<line x1="70" y1="([\d.]+)" x2="600" y2="[\d.]+" stroke="#ffffff"/.exec(h)?.[1])
    const three = y(graph('three'))
    const ten = y(graph('ten'))
    expect(three).toBeGreaterThan(ten)
    expect(Number.isNaN(three)).toBe(false)
    expect(graph('anywhere')).toContain('YOUR GUESS')
    expect(graph('anywhere')).not.toBe(graph('three'))
  })

  it('does not change the real lines with a guess', () => {
    const lines = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    expect(lines(graph('ten'))).toBe(lines(graph(null)))
  })

  it('has no NaN on either axis', () => {
    expect(graph('ten')).not.toContain('NaN')
    const own = render(
      createElement(DistanceGraph, {
        ordinary: partOne.ordinary,
        exact: partOne.exact,
        startInHorizonRadii: 2,
        turnsReached: 10,
        showLastSafe: true,
        logAxis: false,
      }),
    )
    expect(own).not.toContain('NaN')
    expect(own).not.toContain('YOUR GUESS')
  })
})

describe('the captions', () => {
  const caption = (complete: boolean) => ({
    panels: render(createElement(PanelsCaption, { complete, result: partOne })),
    far: render(createElement(FarPairCaption, { complete, result: farPair })),
    graph: render(createElement(GraphCaption, { complete, result: partOne })),
  })

  it('each names its own picture', () => {
    const c = caption(true)
    expect(c.panels).toContain('How to read Picture 1')
    expect(c.far).toContain('How to read Picture 1b')
    expect(c.graph).toContain('How to read Picture 2')
  })

  it('before the run is over: structure only, no last safe orbit value, no worked moment, no what-to-look-for', () => {
    const c = caption(false)
    for (const h of Object.values(c)) {
      expect(h).not.toContain('What to look for')
      expect(h).not.toContain('NaN')
    }
    expect(c.panels).not.toContain('dashed purple ring')
    expect(c.panels).not.toContain('white marks')
    expect(c.panels).toContain('When the run finishes')
    expect(c.far).not.toContain('The white bracket')
    expect(c.graph).not.toContain('Purple: the exact theory')
  })

  it('after the run: a worked moment with these numbers and a three-part list for each picture', () => {
    const c = caption(true)
    expect(c.panels).toContain('0.707')
    expect(c.panels).toContain('0.500')
    expect(c.panels).toContain('after about 1.5 turns')
    expect(c.far).toContain('2.6%')
    for (const h of Object.values(c)) {
      const look = (h.match(/<strong>Look at:<\/strong>/g) ?? []).length
      expect(look).toBeGreaterThanOrEqual(2)
      expect((h.match(/<strong>What it means:<\/strong>/g) ?? []).length).toBe(look)
      expect((h.match(/<strong>Why it matters:<\/strong>/g) ?? []).length).toBe(look)
    }
  })

  it('explain the white marks and that guesses 1 and 3 are only markers', () => {
    const c = caption(true)
    expect(c.panels).toContain('only a marker')
    expect(c.far).toContain('only a marker')
    expect(c.graph).toContain('only your guess')
  })

  it('give no verdict (that is the tutor’s job)', () => {
    for (const h of Object.values(caption(true))) expect(noOwnWords(h)).not.toMatch(VERDICT)
  })

  it('the own-run captions name Pictures 3 and 4 and have no white marks', () => {
    const own = runOrbitsNearBlackHoleExperiment('sgr-a-star', 2.5)
    const p = render(createElement(PanelsCaption, { complete: true, result: own, own: true }))
    const g = render(createElement(GraphCaption, { complete: true, result: own, own: true }))
    expect(p).toContain('How to read Picture 3')
    expect(g).toContain('How to read Picture 4')
    expect(p).not.toContain('white marks')
    expect(g).not.toContain('YOUR GUESS')
    expect(p).toContain('Sagittarius A*')
    expect(p).not.toContain('NaN')
  })
})

describe('Part 2: the guide and the notes', () => {
  it('names Pictures 3 and 4 and says the guesses are not drawn on them', () => {
    const h = render(createElement(PartTwoGuide))
    expect(h).toContain('Pictures 3 and 4')
    expect(h).toContain('Your guesses are not drawn on them')
    expect(h).toContain('Table 3 in Part 3')
  })

  it('describes the three black holes with the module’s horizon radii', () => {
    const h = render(createElement(BlackHoleOptionsNote))
    expect(h).toContain('29.5 km')
    expect(h).not.toContain('NaN')
  })
})

describe('Part 3, the results', () => {
  const h = results('wobbles', 'ten', 'very-different')

  it('renders the four tables and their notes, shows the guesses and the white tags, and says nothing is marked', () => {
    for (const t of ['Table 1: A check-up on the model', 'Table 2: The two runs of Part 1', 'Table 3: Your own run', 'Table 4: Where real orbits sit, in horizon radii'])
      expect(h).toContain(t)
    expect((h.match(/<strong>What this table tells us<\/strong>/g) ?? []).length).toBe(4)
    expect(h).toContain('Your guesses, beside the results')
    expect((h.match(/your guess/g) ?? []).length).toBeGreaterThanOrEqual(6)
    expect(h).toContain('It wobbles a little and keeps circling')
    expect(h).toContain('About 10 horizon radii from the center')
    expect(h).toContain('Very different')
    expect(h).not.toContain('NaN')
  })

  it('never says right or wrong: that is the tutor', () => {
    expect(noOwnWords(h)).not.toMatch(VERDICT)
    expect(h).not.toContain('Checking your')
  })

  it('shows the same real tables whatever is guessed', () => {
    const reference = tables(results('spirals-in', 'three', 'nearly-same'))
    for (const [n, l, f] of [
      ['wobbles', 'anywhere', 'very-different'],
      ['flies-off', 'ten', 'nearly-same'],
    ] as Array<[NudgeGuess, LastSafeGuess, FarGuess]>)
      expect(tables(results(n, l, f))).toBe(reference)
  })

  it('reads the check-up as “the same”, “more” or “less” with numbers beside it', () => {
    expect(h).toContain('3.025')
    expect(h).toContain('<strong>more</strong>')
    expect(h).toContain('<strong>the same</strong>')
    expect(h).toContain('the same, to the rounding')
    expect(h).toContain('0.707')
  })

  it('gives the Part 1 numbers: 1.5 turns, 0.2 percent, the speeds and the 2.6 percent gap', () => {
    expect(h).toContain('1.5 turns')
    expect(h).toContain('2.6%')
    expect(h).toContain('0.158 and 0.162')
  })

  it('gives Table 4’s kilometers and the two stars in horizon radii, with the honest caveats', () => {
    expect(h).toContain('88.6 km')
    expect(h).toContain('38.1 million km')
    expect(h).toContain('57.6 billion km')
    expect(h).toContain('less than about 1,600')
    expect(h).toContain('about 140')
    expect(h).toContain('about 150')
    expect(h).toContain('Nature paper on S301 was not read')
  })

  it('says “Not run yet” for Table 3 before a Part 2 run, and shows the learner’s run after one', () => {
    expect(h).toContain('Not run yet')
    const own = runOrbitsNearBlackHoleExperiment('m87-star', 2.5)
    const after = results('wobbles', 'ten', 'very-different', own)
    expect(after).not.toContain('Not run yet')
    expect(after).toContain('2.5 horizon radii')
    expect(after).toContain('M87*')
    expect(after).toContain('trial values')
    expect(after).not.toContain('NaN')
  })

  it('has the held-back NASA links, the marble comparison and the limits box', () => {
    expect(h).toContain('heasarc.gsfc.nasa.gov/docs/objects/heapow/archive/compact_objects/isco_rxte.html')
    expect(h).toContain('heasarc.gsfc.nasa.gov/docs/nicer/science_nuggets/20240530.html')
    expect(h).toContain('6 times the black hole’s gravitational radius')
    expect(h).not.toContain('sometimes called the Schwarzschild radius')
    expect(h).toContain('A comparison from daily life')
    expect(h).toContain('What this model can and cannot tell you')
  })

  it('works for every black hole and every start the learner can choose', () => {
    for (const id of ['stellar-black-hole', 'sgr-a-star', 'm87-star'] as const)
      for (const start of [20, 6, 3.5, 3, 2.5, 1.6]) {
        const own = runOrbitsNearBlackHoleExperiment(id, start)
        const html = results('wobbles', 'ten', 'very-different', own)
        expect(html).not.toContain('NaN')
        expect(html).not.toContain('undefined')
      }
  })
})

describe('Part 4, the tutor', () => {
  const asked = render(createElement(OrbitsNearBlackHoleTutor, { predictedNudge: 'wobbles', predictedLastSafe: 'ten', predictedFar: 'very-different' }))
  const right = render(createElement(OrbitsNearBlackHoleExplanation, { predictedNudge: 'spirals-in', predictedLastSafe: 'three', predictedFar: 'nearly-same' }))
  const different = render(createElement(OrbitsNearBlackHoleExplanation, { predictedNudge: 'wobbles', predictedLastSafe: 'ten', predictedFar: 'very-different' }))

  it('opens by pointing to the white marks by name, with a note that the answers are not marked', () => {
    expect(asked).toContain('white YOUR GUESS marks on Pictures 1, 1b and 2')
    expect(asked).toContain('Your answers are not marked')
    expect(asked).toContain('Where does the blue probe stop plunging')
  })

  it('gives no answer, no marking and no result number before the explanation', () => {
    expect(asked).not.toContain('That matches')
    expect(asked).not.toContain('That differs')
    expect(asked).not.toContain('1.5 turns')
    expect(asked).not.toContain('NaN')
  })

  it('marks three guesses that match the model as matching, each with its numbers', () => {
    expect((right.match(/That matches the model/g) ?? []).length).toBe(3)
    expect(right).not.toContain('That differs')
    expect(right).toContain('after about 1.5 turns')
    expect(right).toContain('88.6 km')
    expect(right).toContain('only 2.6% apart')
  })

  it('marks three guesses that differ as different, with the reason', () => {
    expect((different.match(/That differs from the model/g) ?? []).length).toBe(3)
    expect(different).not.toContain('That matches')
    expect(different).toContain('The edge is much closer in than 10 horizon radii')
  })

  it('keeps the approved points and adds the real orbits, with S2 and S301 and the honest limits', () => {
    for (const lead of [
      '1. Ordinary gravity has no edge',
      '2. In the exact theory there is a last safe circular orbit',
      '3. Why this happens',
      '4. Circular orbits that exist but do not last',
      '5. Far away, the two rules agree closely',
      '6. Why the model’s edge is at about 3.03, not 3',
      '7. Real orbits',
      '8. The honest limits',
    ])
      expect(right).toContain(lead)
    expect(right).toContain('S301')
    expect(right).toContain('rosette')
    expect(right).toContain('the difference is small, not zero')
    expect(right).toContain('This experiment did not show any of that')
    expect(right).toContain('6GM/c²')
  })

  it('says “anywhere” differs for the exact theory, with the reason', () => {
    const anywhere = render(createElement(OrbitsNearBlackHoleExplanation, { predictedNudge: 'spirals-in', predictedLastSafe: 'anywhere', predictedFar: 'nearly-same' }))
    expect(anywhere).toContain('That differs from the model')
    expect(anywhere).toContain('in ordinary gravity that a circle is safe anywhere')
  })
})
