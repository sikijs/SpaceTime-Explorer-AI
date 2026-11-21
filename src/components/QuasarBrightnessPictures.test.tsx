import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  BRIGHTNESS_CHOICES_SOLAR,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  SPIN_CHOICES,
  brightnessRatio,
  BRIGHTNESS_RULER_MAX_SOLAR,
  BRIGHTNESS_RULER_MIN_SOLAR,
  MILKY_WAY_LUMINOSITY_SOLAR,
  THREE_C_273_LUMINOSITY_SOLAR,
  brightnessRatioRange,
  galaxyToSourceWidthRatio,
  lightDayAU,
  rulerTicksBetween,
  runQuasarExperiment,
  sizeLimitAU,
} from '../physics/quasarBrightness'
import { formatNumber } from './QuasarBrightnessFormat'
import { BrightnessCaption, BrightnessPicture, FuelCaption, FuelPicture, SizeCaption, SizePicture } from './QuasarBrightnessPictures'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, the numbers on the pictures and in the captions are the physics module's, and the
// captions follow the project's standard (how to read, every element, a worked moment, three-part look-fors, where the picture comes from).

const result = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)

describe('Picture A, brightness', () => {
  const svg = renderToStaticMarkup(createElement(BrightnessPicture))
  const caption = renderToStaticMarkup(createElement(BrightnessCaption))

  it('labels both objects on the canvas and states the ratio from the module', () => {
    expect(svg).toContain('Picture A')
    expect(svg).toContain('Milky Way')
    expect(svg).toContain('3C 273')
    expect(svg).toContain(`about ${formatNumber(brightnessRatio(PART_ONE_LUMINOSITY_SOLAR))} times brighter`)
    const range = brightnessRatioRange(PART_ONE_LUMINOSITY_SOLAR)
    expect(svg).toContain(`${formatNumber(range.low)} to ${formatNumber(range.high)}`)
    expect(svg).not.toContain('NaN')
  })

  it('has a caption in the standard form, with three three-part look-fors and a worked moment', () => {
    for (const phrase of ['How to read this diagram.', 'A worked moment.', 'What to look for.', 'Where the real picture comes from.']) expect(caption).toContain(phrase)
    expect((caption.match(/Look at:/g) ?? []).length).toBe(3)
    expect((caption.match(/What it means:/g) ?? []).length).toBe(3)
    expect((caption.match(/Why it matters:/g) ?? []).length).toBe(3)
    expect(caption).toContain('4,000,000,000,000 ÷ 25,000,000,000 = 160')
    expect(caption).toContain('Measured:')
    expect(caption).toContain('Calculated here:')
    expect(caption).not.toContain('NaN')
  })
})

describe('Picture A, the two bars (restored from the specification, 2026-11-21)', () => {
  const svg = renderToStaticMarkup(createElement(BrightnessPicture))
  const caption = renderToStaticMarkup(createElement(BrightnessCaption))

  it('draws a bar for the Milky Way\'s stars and a bar for 3C 273\'s light, each labelled on the canvas', () => {
    expect(svg).toContain('brightness-bars')
    expect(svg).toContain('the light of all the Milky Way’s stars together')
    expect(svg).toContain('the light of 3C 273')
  })

  it('the bars end where the values sit on the ruler, so the quasar\'s bar is longer by the module\'s number of ticks', () => {
    const ticks = rulerTicksBetween(MILKY_WAY_LUMINOSITY_SOLAR, THREE_C_273_LUMINOSITY_SOLAR)
    expect(ticks).toBeCloseTo(Math.log10(brightnessRatio(THREE_C_273_LUMINOSITY_SOLAR)), 10)
    const widths = [...svg.matchAll(/<rect x="40" y="(?:40|58)" width="([\d.]+)"/g)].map((m) => Number(m[1]))
    expect(widths.length).toBe(2)
    const pxPerTick = 520 / Math.log10(BRIGHTNESS_RULER_MAX_SOLAR / BRIGHTNESS_RULER_MIN_SOLAR)
    expect((widths[1] - widths[0]) / pxPerTick).toBeCloseTo(ticks, 6)
  })

  it('the caption names the bars, says the bar length only grows by ticks, and gives the module\'s number', () => {
    expect(caption).toContain('Two bars above the ruler')
    expect(caption).toContain(`about ${formatNumber(rulerTicksBetween(MILKY_WAY_LUMINOSITY_SOLAR, THREE_C_273_LUMINOSITY_SOLAR))} ticks longer`)
    expect(caption).toContain('the two bars, amber and sky-blue, one above the other')
  })
})

describe('Picture B, the light-day and light-week marks (restored from the specification, 2026-11-21)', () => {
  const svg = renderToStaticMarkup(createElement(SizePicture))
  const caption = renderToStaticMarkup(createElement(SizeCaption))

  it('labels one light-day and one light-week on the canvas, next to Neptune\'s orbit, one light-year and the Milky Way', () => {
    for (const label of ['Neptune’s orbit', 'one light-day', 'one light-week', 'one light-year', 'the Milky Way']) expect(svg).toContain(label)
  })

  it('the caption says five things to compare with and where the light-week mark sits', () => {
    expect(caption).toContain('five things to compare with')
    expect(caption).toContain('one light-week')
    expect(caption).toContain('where the sky-blue bar ends')
  })
})

describe('Picture B, size', () => {
  const svg = renderToStaticMarkup(createElement(SizePicture))
  const caption = renderToStaticMarkup(createElement(SizeCaption))

  it('labels everything on the canvas and states the limit and the ratio from the module', () => {
    for (const label of ['Picture B', 'size limit for a flicker of 7 days', 'Neptune’s orbit', 'one light-year', 'the Milky Way']) expect(svg).toContain(label)
    expect(svg).toContain(`about ${formatNumber(sizeLimitAU(7))} AU`)
    expect(svg).toContain(`about ${formatNumber(galaxyToSourceWidthRatio(7) / 1e6)} million times wider than the limit`)
    expect(svg).not.toContain('NaN')
  })

  it('has a caption in the standard form that says the flicker time is an example, with the worked numbers', () => {
    for (const phrase of ['How to read this diagram.', 'A worked moment.', 'What to look for.', 'Where the real picture comes from.', 'example']) expect(caption).toContain(phrase)
    expect((caption.match(/Why it matters:/g) ?? []).length).toBe(2)
    expect(caption).toContain(formatNumber(lightDayAU()))
    expect(caption).toContain(formatNumber(sizeLimitAU(7)))
    expect(caption).toContain(Math.round(galaxyToSourceWidthRatio(7)).toLocaleString('en-US'))
    expect(caption).toContain('not the measured flicker of 3C 273')
  })
})

describe('Picture C, fuel', () => {
  it('shows the module\'s two rates and its two shares for Part 1', () => {
    const svg = renderToStaticMarkup(createElement(FuelPicture, { result }))
    expect(svg).toContain('Picture C')
    expect(svg).toContain(`${formatNumber(result.infallSolarMassesPerYear)} Suns a year`)
    expect(svg).toContain(`${formatNumber(result.fusionSolarMassesPerYear)} Suns a year`)
    expect(svg).toContain('5.7 percent')
    expect(svg).toContain('0.71 percent')
    expect(svg).toContain('4.73 Suns a year')
  })

  it('every brightness and spin on the page draws, with no NaN, and a faster spin draws a shorter green bar', () => {
    for (const L of [PART_ONE_LUMINOSITY_SOLAR, ...BRIGHTNESS_CHOICES_SOLAR]) {
      let previous = Infinity
      for (const spin of SPIN_CHOICES) {
        const r = runQuasarExperiment(L, spin)
        const svg = renderToStaticMarkup(createElement(FuelPicture, { result: r }))
        const caption = renderToStaticMarkup(createElement(FuelCaption, { result: r }))
        expect(svg).not.toContain('NaN')
        expect(caption).not.toContain('NaN')
        const bar = Number(/<rect x="40" y="58" width="([\d.]+)"/.exec(svg)![1])
        expect(bar).toBeLessThan(previous)
        previous = bar
      }
    }
  })

  it('the caption works the formula through with the module\'s own numbers and ends at the table\'s answer', () => {
    const caption = renderToStaticMarkup(createElement(FuelCaption, { result }))
    for (const phrase of ['How to read this diagram.', 'A worked moment.', 'What to look for.', 'Where the real picture comes from.', 'Imagined for the question']) expect(caption).toContain(phrase)
    expect((caption.match(/Look at:/g) ?? []).length).toBe(2)
    expect(caption).toContain('1.53 × 10³⁹ watts')
    expect(caption).toContain(`gives ${formatNumber(result.infallSolarMassesPerYear)} Suns a year`)
  })
})

describe('the three pictures', () => {
  it('use no white anywhere, which is kept for the learner\'s guess marks', () => {
    const all = [
      renderToStaticMarkup(createElement(BrightnessPicture)),
      renderToStaticMarkup(createElement(SizePicture)),
      renderToStaticMarkup(createElement(FuelPicture, { result })),
    ].join('')
    expect(all).not.toMatch(/(fill|stroke)="(#fff|#ffffff|white)"/i)
  })
})

// ---- Step 4: the learner's white guess marks ----

import { FUEL_CHOICES, RATIO_CHOICES, WIDTH_CHOICES, fuelGuessMarker, ratioGuessMarker, widthGuessMarker } from '../physics/quasarBrightness'
import { fuelLabel, ratioLabel, widthLabel } from './QuasarBrightnessFormat'

// The x of the white mark's bar: the rectangle that is 5 wide, drawn as x - 2.5.
function markX(svg: string): number {
  const m = svg.match(/data-testid="guess-mark"><rect x="([\d.]+)" y="[\d.-]+" width="5"/)
  return m ? Number(m[1]) + 2.5 : Number.NaN
}

describe('the white YOUR GUESS marks', () => {
  const none = [renderToStaticMarkup(createElement(BrightnessPicture)), renderToStaticMarkup(createElement(SizePicture)), renderToStaticMarkup(createElement(FuelPicture, { result }))]

  it('without a guess nothing white is drawn, and the real picture is exactly what it was', () => {
    for (const svg of none) {
      expect(svg).not.toContain('YOUR GUESS')
      expect(svg).not.toContain('guess-mark')
    }
  })

  it('with a guess, each picture shows a YOUR GUESS box, its mark and the words of the answer chosen', () => {
    for (const c of RATIO_CHOICES) {
      const svg = renderToStaticMarkup(createElement(BrightnessPicture, { guess: c.id }))
      expect(svg).toContain('YOUR GUESS')
      expect(svg).toContain(ratioLabel(c.id))
    }
    for (const c of WIDTH_CHOICES) {
      const svg = renderToStaticMarkup(createElement(SizePicture, { guess: c.id }))
      expect(svg).toContain('YOUR GUESS')
      expect(svg).toContain(widthLabel(c.id))
    }
    for (const c of FUEL_CHOICES) {
      const svg = renderToStaticMarkup(createElement(FuelPicture, { result, guess: c.id }))
      expect(svg).toContain('YOUR GUESS')
      expect(svg).toContain(fuelLabel(c.id))
      expect(svg).not.toContain('NaN')
    }
  })

  it('a different guess gives a mark at a different place, which follows the physics module\'s position', () => {
    const expectedX = (position: number) => 40 + position * (560 - 40)
    const check = (xs: number[], positions: number[]) => {
      expect(new Set(xs.map((x) => x.toFixed(2))).size).toBe(xs.length)
      xs.forEach((x, i) => expect(Math.abs(x - expectedX(positions[i]))).toBeLessThan(0.01))
    }
    check(
      RATIO_CHOICES.map((c) => markX(renderToStaticMarkup(createElement(BrightnessPicture, { guess: c.id })))),
      RATIO_CHOICES.map((c) => ratioGuessMarker(c.id).position),
    )
    check(
      WIDTH_CHOICES.map((c) => markX(renderToStaticMarkup(createElement(SizePicture, { guess: c.id })))),
      WIDTH_CHOICES.map((c) => widthGuessMarker(c.id).position),
    )
    check(
      FUEL_CHOICES.map((c) => markX(renderToStaticMarkup(createElement(FuelPicture, { result, guess: c.id })))),
      FUEL_CHOICES.map((c) => fuelGuessMarker(c.id).position),
    )
  })

  it('the white guess does not change the real part of the picture', () => {
    const strip = (svg: string) => svg.replace(/<g data-testid="guess-mark">.*?<\/g>/, '').replace(/<line[^>]*stroke="#ffffff"[^>]*><\/line>/, '').replace(/viewBox="[^"]*"/, '')
    const withGuess = renderToStaticMarkup(createElement(BrightnessPicture, { guess: 'ten' }))
    expect(strip(withGuess)).toBe(strip(none[0]))
  })

  it('the captions explain the white mark only when a guess is shown, and say it is not a measurement', () => {
    for (const C of [BrightnessCaption, SizeCaption]) {
      const without = renderToStaticMarkup(createElement(C, {}))
      const withG = renderToStaticMarkup(createElement(C, { withGuess: true }))
      expect(without).not.toContain('YOUR GUESS')
      expect(withG).toContain('The white YOUR GUESS box')
      expect(withG).toContain('not a measurement')
      expect(withG).toContain('What appears when')
    }
    const without = renderToStaticMarkup(createElement(FuelCaption, { result }))
    const withG = renderToStaticMarkup(createElement(FuelCaption, { result, withGuess: true }))
    expect(without).not.toContain('YOUR GUESS')
    expect(withG).toContain('The white YOUR GUESS box')
  })

  it('no caption says right, wrong or matched (the tutor marks the guesses, not the pictures)', () => {
    for (const html of [
      renderToStaticMarkup(createElement(BrightnessCaption, { withGuess: true })),
      renderToStaticMarkup(createElement(SizeCaption, { withGuess: true })),
      renderToStaticMarkup(createElement(FuelCaption, { result, withGuess: true })),
    ]) {
      expect(html).not.toMatch(/\b(correct|wrong|matched|right answer)\b/i)
    }
  })
})
