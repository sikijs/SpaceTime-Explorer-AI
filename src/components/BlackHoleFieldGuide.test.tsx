import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { sizeLadder } from '../physics/blackHoleExperiment'
import { BlackHoleExperiment } from './BlackHoleExperiment'
import {
  BlackHoleFieldGuide,
  ChirpDrawing,
  EarlyUniverseDrawing,
  GUIDE_LINKS,
  MythQuiz,
  NeighboursDrawing,
  SizeLadder,
  SizeLadderDrawing,
  StarLifeDrawing,
  TimelineDrawing,
  formatLength,
} from './BlackHoleFieldGuide'

// Render checks only (no browser). The field guide opens only after the tutor's explanation, every link opens in a new tab, and every
// real number comes from the physics module or from a page read on 13 November 2026.
const guide = () => renderToStaticMarkup(createElement(BlackHoleFieldGuide)).replace(/<!-- -->/g, '')

describe('Gravity 7 field guide', () => {
  it('is not on the page before the tutor\'s explanation', () => {
    const page = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(page).not.toContain('The black hole field guide')
    expect(page).not.toContain('TON 618')
  })

  it('has the nine sections, in order, with the three kinds of label', () => {
    const html = guide()
    const titles = [
      '1. Myth, fact or still a mystery?',
      '2. A 240-year-old idea',
      '3. How small would it have to be?',
      '4. Where do black holes come from?',
      '5. Pictures of the invisible',
      '6. Hearing black holes collide',
      '7. Our neighbours',
      '8. The oldest, the biggest and the smallest',
      '9. Do black holes last for ever?',
    ]
    let at = -1
    for (const t of titles) {
      const i = html.indexOf(t)
      expect(i).toBeGreaterThan(at)
      at = i
    }
    expect(html).toContain('Real physics: calculated with the real formula, not by the probe model')
    expect(html).toContain('Real black holes: measured by astronomers')
    expect(html).not.toContain('NaN')
  })

  it('every link is https, opens in a new tab with noopener, and is listed again in "All the links in one place"', () => {
    const html = guide()
    const links = Object.values(GUIDE_LINKS)
    expect(links.length).toBe(24)
    const tail = html.slice(html.indexOf('All the links in one place'))
    for (const l of links) {
      expect(l.href.startsWith('https://')).toBe(true)
      expect(l.what.length).toBeGreaterThan(40)
      expect(html).toContain(`href="${l.href}"`)
      expect(tail).toContain(`href="${l.href}"`)
    }
    const anchors = html.match(/<a [^>]*>/g) ?? []
    expect(anchors.length).toBeGreaterThan(links.length)
    for (const a of anchors) {
      expect(a).toContain('target="_blank"')
      expect(a).toContain('rel="noopener noreferrer"')
    }
  })

  it('credits every real picture beside it, and says the NASA picture is a visualization, resized', () => {
    const html = guide()
    expect(html).toContain('Credit: NASA’s Goddard Space Flight Center/Jeremy Schnittman')
    expect(html).toContain('A computer visualization of a black hole, not a photograph')
    expect(html).toContain('Shown at a smaller size than the original; no other change')
    expect((html.match(/Image: EHT Collaboration \(CC BY 4\.0\), via ESO\./g) ?? []).length).toBe(2)
    expect((html.match(/<img [^>]*alt="[^"]{20,}"/g) ?? []).length).toBe(3)
  })

  it('uses only the verified facts: the history dates are hedged, the records are shown as disagreeing, and Hawking radiation uses only NASA\'s words', () => {
    const html = guide()
    expect(html).toContain('published a letter in the')
    expect(html).toContain('in the 1790s')
    expect(html).not.toContain('1783')
    expect(html).toContain('These sources do not agree on a single record')
    expect(html).toContain('66 billion times the Sun')
    expect(html).toContain('TON 618')
    expect(html).toContain('the total number of candidates within the GWTC to 218')
    expect(html).toContain('33 times that of the Sun')
    expect(html).toContain('totally unexpected')
    expect(html).toContain('no dedicated plain page about Hawking radiation')
    expect(html).toContain('So what is Hawking radiation?')
    expect(html).toContain('has never been measured')
    expect(html).toContain('university history site: a secondary source, not an official agency')
  })

  it('the myth quiz hides its answers until a button is pressed', () => {
    const html = renderToStaticMarkup(createElement(MythQuiz))
    expect((html.match(/Show the answer/g) ?? []).length).toBe(3)
    expect(html).not.toContain('Myth.')
    expect(html).not.toContain('Still a mystery')
  })

  it('the size ladder gives the real sizes from the module: the Sun about 3 km, the Earth about 9 mm', () => {
    const html = renderToStaticMarkup(createElement(SizeLadder)).replace(/<!-- -->/g, '')
    expect(html).toContain('3.0 kilometres')
    expect(html).toContain('The formula.')
    expect(html).toContain('about 9 millimetres')
    expect(html).not.toContain('NaN')
    for (const e of sizeLadder()) expect(html).toContain(e.name.replace(/ \(.*\)/, ''))
  })

  it('formatLength writes every size in friendly units', () => {
    expect(formatLength(1.04e-25)).toBe('1.0 × 10⁻²⁵ metres')
    expect(formatLength(1.09e-4)).toBe('0.11 millimetres')
    expect(formatLength(8.87e-3)).toBe('8.9 millimetres')
    expect(formatLength(2.82)).toBe('2.8 metres')
    expect(formatLength(2953)).toBe('3.0 kilometres')
    expect(formatLength(1.18e10)).toBe('11.8 million kilometres')
    expect(formatLength(1.92e13)).toBe('19.2 billion kilometres')
    expect(formatLength(0)).toBe('not a size')
  })

  it('every drawing renders, labelled, with no NaN', () => {
    const all = [
      renderToStaticMarkup(createElement(TimelineDrawing)),
      renderToStaticMarkup(createElement(StarLifeDrawing)),
      renderToStaticMarkup(createElement(ChirpDrawing)),
      renderToStaticMarkup(createElement(NeighboursDrawing)),
      renderToStaticMarkup(createElement(EarlyUniverseDrawing)),
      ...sizeLadder().map((_, i) => renderToStaticMarkup(createElement(SizeLadderDrawing, { selected: i, ladder: sizeLadder() }))),
    ]
    for (const h of all) {
      expect(h).toContain('role="img"')
      expect(h).toContain('aria-label=')
      expect(h).not.toContain('NaN')
      expect(h).not.toContain('Infinity')
    }
    expect(all[0]).toContain('Not to scale')
    expect(all[2]).toContain('not real LIGO data')
    expect(all[3]).toContain('Gaia BH3')
    expect(all[4]).toContain('CAPERS-LRD-z9')
  })
})
