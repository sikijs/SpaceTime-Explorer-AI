import { existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { J0529_LUMINOSITY_SOLAR, j0529RateCheck, lightPerKilogramRatio } from '../physics/quasarBrightness'
import { QuasarBrightnessExperiment } from './QuasarBrightnessExperiment'
import { formatNumber } from './QuasarBrightnessFormat'
import {
  QuasarBrightnessHeldBack,
  QuasarBrightnessHeldBackLinks,
  QuasarBrightnessIntro,
  QuasarBrightnessLinks,
  quasarBrightnessWordsEntries,
} from './QuasarBrightnessIntro'

// Render checks only (no browser): the introduction keeps clear of what the page will ask the learner to predict, what is held back appears only after a
// Run, the images exist and carry alt text and credit, and every link opens in a new tab. They do not check how the page looks.

const intro = renderToStaticMarkup(createElement(QuasarBrightnessIntro))
const links = renderToStaticMarkup(createElement(QuasarBrightnessLinks))
const heldBack = renderToStaticMarkup(createElement(QuasarBrightnessHeldBack))
const heldBackLinks = renderToStaticMarkup(createElement(QuasarBrightnessHeldBackLinks))

describe('Black Holes 11 introduction (Step 3)', () => {
  it('is long and teaches the question, the engine and both halves of the puzzle', () => {
    expect(intro.length).toBeGreaterThan(9000)
    for (const phrase of ['The question.', 'Why even ask this.', 'What a quasar looks like.', 'What feeds a quasar.', 'The question has two halves.', 'Where does the energy come from?', 'How big can the source be?', 'Some new words.', 'does not do']) {
      expect(intro).toContain(phrase)
    }
  })

  it('does not give away what the learner will be asked to predict (CLAUDE.md §12)', () => {
    for (const secret of ['4 trillion', '0.71', '25 billion', '20 to 30 billion', '1,212', '5.2 million', '5,217,840', 'Suns a year', '160 times', '500 trillion', 'Sun per day']) {
      expect(intro).not.toContain(secret)
    }
  })

  it('does not use white, which is kept for the learner\'s guess marks', () => {
    expect(intro).not.toMatch(/fill="(#fff|#ffffff|white)"/i)
  })

  it('shows five images, each with a long alt text, a credit line and a licence statement, and every file exists', () => {
    const images = intro.match(/<img [^>]*>/g) ?? []
    expect(images.length).toBe(5)
    for (const img of images) {
      expect(img).toMatch(/alt="[^"]{40,}"/)
      const src = /src="([^"]+)"/.exec(img)![1]
      expect(src).toContain('images/quasars/')
      expect(existsSync(`public/${src.slice(src.indexOf('images/'))}`)).toBe(true)
    }
    for (const credit of ['ESA/Hubble &amp; NASA', 'John Bahcall', 'Bin Ren', 'ESO/L. Calçada', 'NASA/CXC/SAO/H. Marshall']) expect(intro).toContain(credit)
    expect(intro.match(/CC BY 4\.0/g)?.length).toBe(3)
    expect(intro).toContain('NASA should be acknowledged as the source')
    expect(intro).toContain('artist’s impression, not a photograph')
  })

  it('numbers its figures one to five in order', () => {
    const positions = [1, 2, 3, 4, 5].map((n) => intro.indexOf(`Figure ${n}.`))
    for (const p of positions) expect(p).toBeGreaterThan(-1)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })
})

describe('the links', () => {
  it('open in a new tab, say what the learner will find, and are plain pages before the run', () => {
    for (const html of [links, heldBack, heldBackLinks]) {
      const anchors = html.match(/<a [^>]*>/g) ?? []
      expect(anchors.length).toBeGreaterThan(0)
      for (const a of anchors) {
        expect(a).toContain('target="_blank"')
        expect(a).toContain('rel="noreferrer"')
        expect(a).toMatch(/href="https:\/\//)
      }
    }
    expect((links.match(/<li/g) ?? []).length).toBe(21)
    for (const url of ["black-holes/types", "hubble-spots-double-quasars", "news-2024-022", "svs.gsfc.nasa.gov/12539", "frequently-roam-galaxy-centers", "black-holes/anatomy", "56984-black-hole-at-the-centre", "blackholes3.html", "ask_astro/quasar", "teenage-years-of-quasars", "most-quasars-live-on-snacks", "StarChild/universe_level1/quasars", "Integral_rolls_back_history"]) expect(links).toContain(url)
    expect(links).toContain('Want to know more?')
    expect(links).toContain('science.nasa.gov/mission/hubble')
    expect(links).toContain('chandra.harvard.edu')
    expect(links).toContain('esahubble.org')
  })

  it('keep the pages that carry the answers back until after the run', () => {
    for (const held of ['openstax.org', 'ar5iv.labs.arxiv.org', 'eso.org/public/news/eso2402', 'arxiv.org/abs/2402.15101', 'xray_sources/quasars.html', 'news.mit.edu']) {
      expect(links).not.toContain(held)
      expect(heldBack + heldBackLinks).toContain(held)
    }
  })

  it('never link a page that was not read: no Nature, Springer, ADS or NOIRLab link (Schmidt 1963 and NOIRLab could not be fetched)', () => {
    for (const html of [links, heldBack, heldBackLinks]) {
      for (const bad of ['nature.com', 'springer.com', 'ui.adsabs', 'noirlab', 'wikipedia']) expect(html).not.toContain(bad)
    }
  })
})

describe('what is held back until the first Run', () => {
  it('holds the record-breaker and its numbers, with the check against the physics module', () => {
    const check = j0529RateCheck(0.1)
    expect(heldBack).toContain('What astronomers have found lately')
    expect(heldBack).toContain('over 500')
    expect(heldBack).toContain('just over a Sun per day')
    expect(heldBack).toContain(`${(J0529_LUMINOSITY_SOLAR / 1e12).toLocaleString('en-US')} trillion Suns of light`)
    expect(heldBack).toContain(formatNumber(check.modelSolarMassesPerYear))
    expect(heldBack).toContain('ESO does not state the efficiency')
    for (const date of ['September 2025', 'November 2025', 'June 2026']) expect(heldBack).toContain(date)
  })

  it('the page shows none of it before Run, and the formulas stay out of the words box', () => {
    const page = renderToStaticMarkup(createElement(QuasarBrightnessExperiment, {}))
    expect(page).toContain('Want to know more?')
    expect(page).toContain('Words and formulas')
    expect(page).not.toContain('What astronomers have found lately')
    expect(page).not.toContain('More to read, now that you have run it')
    expect(page).not.toContain('Formula: mass needed each second')
    expect(page).toContain('appear after your first run')
  })
})

describe('the words box', () => {
  const before = quasarBrightnessWordsEntries(false)
  const after = quasarBrightnessWordsEntries(true)

  it('defines every specialised word the introduction uses, from the start', () => {
    const terms = before.map((e) => e.term).join(' | ')
    for (const word of ['Quasar', 'Galaxy', 'Suns', 'Luminosity', 'Supermassive black hole', 'Accretion disc', 'Jet', 'Redshift', 'Fusion', 'Efficiency', 'Flicker', 'Light-year', 'AU', 'Log ruler']) {
      expect(terms).toContain(word)
    }
    for (const e of before) expect(e.meaning.length).toBeGreaterThan(30)
  })

  it('holds fusion\'s share and the formulas until after the run, then gives each a worked example from the module', () => {
    expect(before.some((e) => e.meaning.includes('0.71'))).toBe(false)
    expect(before.some((e) => e.term.startsWith('Formula'))).toBe(false)
    expect(after.length).toBe(before.length + 4)
    const text = after.map((e) => e.meaning).join(' ')
    expect(text).toContain('0.71 percent')
    expect(text).toContain(formatNumber(lightPerKilogramRatio(0)))
    expect(text).toContain('42 percent')
    expect(text).toContain('32 percent')
  })
})


describe('where the light comes from: the step-by-step section and the numbers held back', () => {
  const intro = renderToStaticMarkup(createElement(QuasarBrightnessIntro))
  const held = renderToStaticMarkup(createElement(QuasarBrightnessHeldBack))

  it('the introduction gives the chain of steps and what is not modelled, and cites the pages it uses', () => {
    expect(intro).toContain('Where the light comes from, step by step')
    for (const phrase of ['The black hole itself gives out nothing', 'The gas forms a spinning disk', 'turns it into heat', 'Very hot things glow', 'So why does it out-shine a galaxy', 'What this page does not model']) {
      expect(intro).toContain(phrase)
    }
    for (const url of ['black-holes/anatomy', '56984-black-hole-at-the-centre', 'blackholes3.html']) expect(intro).toContain(url)
  })

  it('the introduction does not give fusion\'s share, the mass that must fall in each year, or 3C 273\'s brightness (CLAUDE.md section 12)', () => {
    expect(intro).not.toContain('0.71')
    expect(intro).not.toContain('4.73')
    expect(intro).not.toContain('38.08')
    expect(intro).not.toContain('Suns a year')
  })

  it('the numbers appear after the first Run, from the physics module', () => {
    expect(held).toContain('The energy, in numbers')
    expect(held).toContain('0.71 percent')
    expect(held).toContain('5.7 percent')
    expect(held).toContain('42.3 percent')
    expect(held).toContain('4.73 Suns of mass')
    expect(held).toContain('38.08 Suns of hydrogen')
    expect(held).not.toContain('NaN')
  })
})

describe('does a quasar keep growing, and were quasars more common long ago', () => {
  const intro = renderToStaticMarkup(createElement(QuasarBrightnessIntro))

  it('says a quasar fades, that the lifetime is uncertain, that growth is slow, and why far quasars show the past', () => {
    for (const phrase of ['Not for ever', 'It fades, and the black hole stays', 'How long a quasar lasts is uncertain', '10 million to a few billion years', 'grows while the quasar shines, slowly', 'Were quasars around long ago', 'looking back in time']) {
      expect(intro).toContain(phrase)
    }
  })

  it('does not print the lines that the NASA pages do not contain (checked against the pages on 2026-11-21)', () => {
    expect(intro).not.toContain('many more quasars than we see')
    expect(intro).not.toContain('reduced accretion')
    expect(intro).not.toContain('from 10 million')
  })

  it('does not give the record-breaker held back until the first Run', () => {
    expect(intro).not.toContain('J0529')
    expect(intro).not.toContain('just over a Sun per day')
  })
})
