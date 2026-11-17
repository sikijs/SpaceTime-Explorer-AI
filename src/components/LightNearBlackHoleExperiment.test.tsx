import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { lightPath, runLightNearBlackHoleExperiment, runPartOne } from '../physics/lightNearBlackHoleExperiment'
import type { BendChoice, CaptureChoice, JustOutsideChoice } from '../physics/lightNearBlackHoleExperiment'
import { LightNearBlackHoleExperiment } from './LightNearBlackHoleExperiment'
import {
  BlackHoleOptionsNote,
  GuessNotes,
  LightNearBlackHoleHeldBackLinks,
  LightNearBlackHoleIntro,
  LightNearBlackHoleLinks,
  PartTwoGuide,
  RealPictures,
  lightNearBlackHoleWordsEntries,
} from './LightNearBlackHoleIntro'
import { BendGraph, GraphCaption, LightPanel, PanelsCaption } from './LightNearBlackHolePictures'
import { LightNearBlackHoleResults } from './LightNearBlackHoleResults'
import { LightNearBlackHoleExplanation, LightNearBlackHoleTutor } from './LightNearBlackHoleTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks appear
// exactly when a guess is given and follow it, the real tables never change with a guess, and no page says "right" or "wrong" before the tutor.
// They do not check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
// A verdict on a guess. The page's own "does not say whether they are right" is taken out first.
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b|\bright (answer|guess)\b|off this time/i
const noOwnWords = (h: string) => h.replace(/says whether they are right|marked right or wrong|turned right around|swings right around|swings right round|right-hand|right around/g, '')
const WHITE = 'stroke="#ffffff"'
const bends: BendChoice[] = ['straight', 'bent', 'captured']
const captures: CaptureChoice[] = ['horizon', 'critical', 'ten']
const justs: JustOutsideChoice[] = ['small-bend', 'swings', 'captured-anyway']

const run = runPartOne()
const tables = (html: string) => (html.match(/<table[\s\S]*?<\/table>/g) ?? []).join('\n')
const results = (b: BendChoice, c: CaptureChoice, j: JustOutsideChoice, two = null as ReturnType<typeof runLightNearBlackHoleExperiment> | null) =>
  render(createElement(LightNearBlackHoleResults, { bendGuess: b, captureGuess: c, justOutsideGuess: j, partTwo: two }))
const panel = (aim: 5 | 2.6, o: Parameters<typeof LightPanel>[0]['outcomeGuess'], c: CaptureChoice | null, rings = true) =>
  render(
    createElement(LightPanel, {
      path: (aim === 5 ? run.five : run.justOutside).path,
      aim,
      progress: 1,
      showRings: rings,
      heading: `Beam aimed at ${aim}`,
      outcomeGuess: o,
      captureGuess: c,
    }),
  )
const beams = [run.five, run.justOutside].map((r) => ({
  aim: r.aimInHorizonRadii,
  label: `aim ${r.aimInHorizonRadii}`,
  outcome: r.path.outcome,
  exactDegrees: r.path.bendRadians === null ? null : (r.path.bendRadians * 180) / Math.PI,
}))
const graph = (critical: boolean, g: Parameters<typeof BendGraph>[0]['guesses']) => render(createElement(BendGraph, { beams, showCritical: critical, guesses: g }))
const count = (html: string, text: string) => html.split(text).length - 1

describe('Black Holes 4 renders (at rest)', () => {
  const html = render(createElement(LightNearBlackHoleExperiment, {}))

  it('renders the heading, Part 1, the words box and the links, with no later Part', () => {
    expect(html).toContain('Black Holes 4: Light Near a Black Hole: Can Light Be Trapped?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html.indexOf('Words and formulas: click to open')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Words and formulas: click to open')).toBeGreaterThan(html.indexOf('What we assume'))
    expect(html).toContain('science.nasa.gov/mission/hubble/science/universe-uncovered/hubbles-gravitational-lenses/')
    expect(html).toContain('science.nasa.gov/universe/black-holes/')
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
    expect(html).not.toContain('Beam aimed at')
    expect(html).not.toContain('The total bend against the aim distance')
    expect(html).toContain('Pictures 1 and 2 appear here when you press Run')
  })

  it('tells the learner the predictions never change the real pictures, that guesses are drawn in white and shown again beside the results', () => {
    expect(html).toContain('The real pictures and tables never change with your guesses')
    expect(html).toContain('drawn on them in white')
  })

  it('gives none of the answers before the run: no critical aim, no photon sphere, no shadow, no second beam\'s aim, no held-back links', () => {
    for (const leak of ['2.598', 'photon sphere', 'Photon sphere', 'aimed at 2.6', 'Aim: 2.6', 'anatomy', 'eso1907', 'eso2208', 'arxiv.org', 'Real black-hole pictures']) expect(html).not.toContain(leak)
    expect(html).not.toMatch(/3√3/)
  })

  it('says the three questions in the approved words', () => {
    expect(html).toContain('A beam of light is aimed to pass a black hole at 5 horizon radii from its center, well outside the edge. What happens to its path?')
    expect(html).toContain("How close to a black hole's center must light be aimed to be captured?")
    expect(html).toContain('Light is aimed only a tiny bit farther out than the capture distance. What happens?')
    expect(html).toContain('It swings right around the black hole, turning by more than 180°, and then escapes')
  })

  it('has no verdict on a guess', () => {
    expect(noOwnWords(html)).not.toMatch(VERDICT)
  })
})

describe('the introduction, links and words', () => {
  it('defines its terms before using them and links only pages that were read', () => {
    const html = render(createElement(LightNearBlackHoleIntro))
    for (const term of ['aim distance', 'bend', 'captured', 'horizon radius', 'exact theory of gravity', 'simple formula', 'astronomical unit']) expect(html.toLowerCase()).toContain(term)
    expect(html).toContain('abell2813-hubble-potw2115a.jpg')
    expect(html).toContain('ESA/Hubble &amp; NASA, D. Coe')
    expect(html).toContain('esahubble.org/images/potw2115a/')
    expect(html).toContain('Creative Commons Attribution 4.0')
    expect(html).toContain('How a lens makes two pictures of one galaxy')
    expect(html).toContain('not to scale')
    expect(html).toContain('not identical copies')
    expect(html).toContain('mirror image')
    expect(html).not.toContain('brightens each one differently')
    const links = render(createElement(LightNearBlackHoleLinks))
    expect(links).toContain('Want to know more?')
    expect(links).toContain('esahubble.org/news/heic1505/')
    expect(links).toContain('hubble-captures-a-mirrored-galaxy')
    expect((links.match(/target="_blank"/g) ?? []).length).toBe(4)
  })

  it('holds the answer-giving words and links back until after the run', () => {
    const before = lightNearBlackHoleWordsEntries(false)
    const after = lightNearBlackHoleWordsEntries(true)
    expect(before.map((e) => e.term)).toContain('Formula: the simple bend')
    expect(JSON.stringify(before)).not.toContain('2.598')
    expect(after.map((e) => e.term)).toEqual(expect.arrayContaining(['Critical aim', 'Where light can circle (the photon sphere)', 'Shadow']))
    expect(JSON.stringify(after)).toContain('2.598')
    expect(JSON.stringify(after)).toContain('5.2')
    const held = render(createElement(LightNearBlackHoleHeldBackLinks))
    for (const url of ['science.nasa.gov/universe/black-holes/anatomy/', 'eso.org/public/news/eso1907/', 'eso.org/public/news/eso2208/', 'eso.org/public/news/eso2406/', 'arxiv.org/abs/1906.11243', 'arxiv.org/abs/2509.24593'])
      expect(held).toContain(url)
    expect(render(createElement(ReferencePanel, { entries: after }))).toContain('Words and formulas')
  })

  it('has notes under each question that give nothing away', () => {
    for (const n of [1, 2, 3] as const) {
      const notes = render(createElement(GuessNotes, { n }))
      expect(notes).toContain('The situation.')
      expect(notes).toContain('What the choices mean.')
      expect(notes).toContain('How to answer.')
      expect(notes).not.toContain('2.598')
      expect(notes).not.toContain('aimed at 2.6')
      expect(noOwnWords(notes)).not.toMatch(VERDICT)
    }
    expect(render(createElement(GuessNotes, { n: 1 }))).toContain('148 km')
  })

  it('shows real pictures only in the block that appears after the run, with their credits', () => {
    const real = render(createElement(RealPictures))
    expect(real).toContain('m87-eht-eso1907a.jpg')
    expect(real).toContain('sgra-eht-eso2208.jpg')
    expect(real).toContain('EHT Collaboration (CC BY 4.0), via ESO')
    expect(real).toContain('around 2.5 times smaller')
    expect(real).toContain('roughly twice as big')
    expect(real).toContain('Experiment 20')
    expect(real).toContain('Straight, a little bent, swung round')
  })

  it('has a Part 2 guide that says the results and tutor stay, and an options note in kilometers', () => {
    expect(render(createElement(PartTwoGuide))).toContain('The results and the tutor stay where they are')
    expect(render(createElement(BlackHoleOptionsNote))).toContain('29.5 km')
  })
})

describe('the white marks on the path pictures', () => {
  it('draw nothing white without a guess, and nothing about the answers before the rings are drawn', () => {
    const bare = panel(5, null, null, false)
    expect(bare).not.toContain(WHITE)
    expect(bare).not.toContain('YOUR GUESS')
    expect(bare).not.toContain('critical aim')
    expect(bare).not.toContain('light can circle here')
    expect(bare).not.toContain('NaN')
  })

  it('draw a YOUR GUESS box for guess 1 and guess 2 on the left picture, and follow the guess', () => {
    const texts = new Set<string>()
    for (const b of bends) {
      const h = panel(5, { kind: 'bend', guess: b }, 'critical')
      expect(h).toContain(WHITE)
      expect(count(h, 'YOUR GUESS')).toBe(2)
      texts.add(h)
    }
    expect(texts.size).toBe(3)
    expect(panel(5, { kind: 'bend', guess: 'straight' }, null)).toContain('the beam goes straight on')
    expect(panel(5, { kind: 'bend', guess: 'captured' }, null)).toContain('the beam is captured')
  })

  it('draw a YOUR GUESS box for guess 3 on the right picture, and follow the guess', () => {
    const outputs = justs.map((j) => panel(2.6, { kind: 'justOutside', guess: j }, null))
    expect(new Set(outputs).size).toBe(3)
    expect(outputs[1]).toContain('swings round, over 180°')
    for (const o of outputs) expect(count(o, 'YOUR GUESS')).toBe(1)
  })

  it('draw guess 2 as a ring at the distance chosen, or as an arrow at the edge when it is off the picture', () => {
    const horizon = panel(5, null, 'horizon')
    const critical = panel(5, null, 'critical')
    const ten = panel(5, null, 'ten')
    expect(new Set([horizon, critical, ten]).size).toBe(3)
    expect(ten).toContain('off this view')
    expect(critical).not.toContain('off this view')
    expect(horizon).not.toContain('off this view')
    expect(panel(2.6, null, 'ten')).toContain('off this view')
  })
})

describe('the white marks on the graph', () => {
  it('draws nothing white without guesses, and no green line before the run has finished', () => {
    const bare = graph(false, null)
    expect(bare).not.toContain(WHITE)
    expect(bare).not.toContain('YOUR GUESS')
    expect(bare).not.toContain('critical aim (2.598)')
    expect(bare).not.toContain('NaN')
    expect(graph(true, null)).toContain('critical aim (2.598)')
  })

  it('draws three boxes for three guesses, and every choice gives a different drawing', () => {
    const seen = new Set<string>()
    for (const b of bends) for (const c of captures) for (const j of justs) {
      const h = graph(true, { bend: b, capture: c, justOutside: j })
      expect(count(h, 'YOUR GUESS')).toBe(3)
      expect(h).toContain(WHITE)
      expect(h).not.toContain('NaN')
      seen.add(h)
    }
    expect(seen.size).toBe(27)
  })

  it('draws a captured guess inside the rose area (no height) and the others at a band', () => {
    const cap = graph(true, { bend: 'captured', capture: null, justOutside: null })
    expect(cap).toContain('>is captured<')
    const swings = graph(true, { bend: null, capture: null, justOutside: 'swings' })
    expect(swings).toContain('>swings round, over 180°<')
  })

  it('draws the real curves the same for every guess', () => {
    const real = (h: string) => (h.match(/<polyline[^>]*>/g) ?? []).join('')
    const bare = real(graph(true, null))
    for (const j of justs) expect(real(graph(true, { bend: 'bent', capture: 'critical', justOutside: j }))).toBe(bare)
  })
})

describe('the captions', () => {
  it('give the worked moment and what to look for in three parts, and show the guess item only when the marks are drawn', () => {
    const during = render(createElement(PanelsCaption, { complete: false }))
    const after = render(createElement(PanelsCaption, { complete: true }))
    for (const h of [during, after]) {
      expect(h).toContain('What to look for')
      expect(h).toContain('Look at:')
      expect(h).toContain('What it means:')
      expect(h).toContain('Why it matters:')
      expect(h).toContain('A worked moment')
      expect(h).toContain('148 km')
      expect(h).not.toContain('NaN')
    }
    expect(during).not.toContain('YOUR GUESS')
    expect(during).not.toContain('green ring')
    expect(after).toContain('YOUR GUESS')
    expect(after).toContain('green ring')
    expect(after).toContain('only a marker')
  })

  it('give the graph caption a worked moment from the simple formula and show the green line only once it is drawn', () => {
    const during = render(createElement(GraphCaption, { complete: false }))
    const after = render(createElement(GraphCaption, { complete: true }))
    expect(during).toContain('2 ÷ 20 = 0.1 radian')
    expect(during).not.toContain('green line')
    expect(after).toContain('the green line')
    expect(after).toContain('YOUR GUESS')
    expect(render(createElement(GraphCaption, { complete: true, own: true }))).not.toContain('YOUR GUESS')
    expect(render(createElement(PanelsCaption, { complete: true, own: true }))).not.toContain('YOUR GUESS')
  })

  it('say nothing is a verdict', () => {
    for (const h of [render(createElement(PanelsCaption, { complete: true })), render(createElement(GraphCaption, { complete: true }))]) expect(noOwnWords(h)).not.toMatch(VERDICT)
  })
})

describe('Part 3, the results', () => {
  const base = results('bent', 'critical', 'swings')

  it('never changes its tables with a guess', () => {
    const t = tables(base)
    for (const b of bends) for (const c of captures) for (const j of justs) expect(tables(results(b, c, j))).toBe(t)
  })

  it('shows the guesses with a tag on the rows they belong to, and says nothing about right or wrong', () => {
    expect(base).toContain('Your guesses, beside the results')
    expect(count(base, 'your guess</span>')).toBeGreaterThanOrEqual(6)
    expect(noOwnWords(base)).not.toMatch(VERDICT)
    expect(base).toContain('It is bent noticeably and then escapes')
    expect(results('captured', 'ten', 'captured-anyway')).toContain('About 10 horizon radii')
  })

  it('has four tables, each with a "What this table tells us" note in the four parts, and a check-up first', () => {
    expect(count(base, '<strong>What this table tells us</strong>')).toBe(4)
    expect(count(base, '<strong>What it is.</strong>')).toBe(4)
    expect(count(base, '<strong>What it means.</strong>')).toBe(4)
    expect(count(base, '<strong>Why it matters.</strong>')).toBe(4)
    expect(count(base, '<strong>How sure we are.</strong>')).toBe(4)
    expect(base.indexOf('Table 1: A check-up')).toBeLessThan(base.indexOf('Table 2: The two beams'))
    expect(base).toContain('the same')
    expect(base).toContain('more')
  })

  it('gives the numbers of the two Part 1 beams and of the three black holes', () => {
    expect(base).toContain('33.8°')
    expect(base).toContain('22.9°')
    expect(base).toContain('390°')
    expect(base).toContain('1.58')
    expect(base).toContain('76.7 km')
    expect(base).toContain('2.598')
    expect(base).not.toContain('NaN')
  })

  it('says "Not run yet" until a Part 2 run exists, then follows it', () => {
    expect(base).toContain('Not run yet')
    const own = runLightNearBlackHoleExperiment('sgr-a-star', 3)
    const withOwn = results('bent', 'critical', 'swings', own)
    expect(withOwn).not.toContain('Not run yet')
    expect(withOwn).toContain('Sagittarius A*')
    expect(withOwn).toContain('98.5°')
    const captured = results('bent', 'critical', 'swings', runLightNearBlackHoleExperiment('m87-star', 2.5))
    expect(captured).toContain('It was captured: it reached the horizon.')
  })

  it('works the simple math from the module, with the real pictures and the held-back links after the first run', () => {
    expect(base).toContain('√3 is about 1.73')
    expect(base).toContain('A radian is about 57.3°')
    expect(base).toContain('Real black-hole pictures, and recent news')
    expect(base).toContain('science.nasa.gov/universe/black-holes/anatomy/')
    expect(base).toContain('What this model can and cannot tell you')
    expect(base).toContain('This page does not model a spinning black hole')
    expect(base).not.toContain('captures light in a different circle')
  })
})

describe('Part 4, the tutor', () => {
  it('starts with its observation question, which points to the white marks by name, and holds back the explanation', () => {
    const html = render(createElement(LightNearBlackHoleTutor, { predictedBend: 'bent', predictedCapture: 'critical', predictedJustOutside: 'swings' }))
    expect(html).toContain('white YOUR GUESS marks on Pictures 1 and 2')
    expect(html).not.toContain('First guess.')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Continue<\/button>/)
  })

  it('marks each guess in the explanation, and nowhere earlier', () => {
    for (const b of bends) for (const c of captures) for (const j of justs) {
      const html = render(createElement(LightNearBlackHoleExplanation, { predictedBend: b, predictedCapture: c, predictedJustOutside: j }))
      expect(count(html, 'That matches the model') + count(html, 'That differs from the model')).toBe(3)
      expect(html.includes('That matches the model')).toBe(b === 'bent' || c === 'critical' || j === 'swings')
      expect(html).not.toContain('NaN')
    }
    const right = render(createElement(LightNearBlackHoleExplanation, { predictedBend: 'bent', predictedCapture: 'critical', predictedJustOutside: 'swings' }))
    expect(count(right, 'That matches the model')).toBe(3)
    const wrong = render(createElement(LightNearBlackHoleExplanation, { predictedBend: 'captured', predictedCapture: 'ten', predictedJustOutside: 'small-bend' }))
    expect(count(wrong, 'That differs from the model')).toBe(3)
  })

  it('takes its numbers from the module and rewrites the Event Horizon Telescope point from pages that were read', () => {
    const html = render(createElement(LightNearBlackHoleExplanation, { predictedBend: 'bent', predictedCapture: 'critical', predictedJustOutside: 'swings' }))
    const five = (lightPath(5).bendRadians as number) * (180 / Math.PI)
    expect(html).toContain(`${Number(five.toPrecision(3))}°`)
    expect(html).toContain('2.598')
    expect(html).toContain('around 2.5 times smaller')
    expect(html).toContain('roughly twice as big')
    expect(html).not.toContain('generally described as matching')
    expect(html).toContain('This page does not model a spinning black hole')
    expect(html).not.toContain('captures light in a different circle')
  })
})
