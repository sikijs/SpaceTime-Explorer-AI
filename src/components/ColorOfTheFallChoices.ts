import type { ColorChoice, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'

// The three guess questions of Black Holes 7 and their choices, exactly as the owner approved them (2026-10-12). Shared by the page, the
// pictures, the results and the tutor so that every place uses the same words.
export const COLOR_QUESTION =
  'A traveler falling into a black hole shines a steady green lamp straight outward to a far-away observer. As the traveler falls, what happens to the color the observer receives?'
export const COLOR_CHOICES: Array<{ value: ColorChoice; label: string }> = [
  { value: 'same', label: 'It stays green' },
  { value: 'bluer', label: 'It turns bluer (a shorter wavelength)' },
  { value: 'limit', label: 'It turns redder (a longer wavelength), but only up to a point, then stays the same' },
  { value: 'no-limit', label: 'It turns redder (a longer wavelength) and keeps on getting redder, with no limit' },
]

export const VISIBLE_QUESTION = "For a fall from rest at 10 horizon radii, does the lamp's light stay visible to the eye all the way down?"
export const VISIBLE_CHOICES: Array<{ value: VisibleChoice; label: string }> = [
  { value: 'all-the-way', label: 'Yes, all the way to the horizon, only dimmer' },
  { value: 'near-horizon', label: 'Yes, until the traveler is very close to the horizon' },
  { value: 'well-before', label: 'No, it stops being visible light well before the horizon' },
]

export const MASS_QUESTION = 'Would the color the observer receives at 5 horizon radii from the center be different for a 10-Sun black hole and for M87*?'
export const MASS_CHOICES: Array<{ value: MassChoice; label: string }> = [
  { value: 'small', label: 'Yes, much redder for the 10-Sun black hole' },
  { value: 'big', label: 'Yes, much redder for M87*' },
  { value: 'same', label: 'No, the same' },
]

export const colorLabel = (c: ColorChoice) => COLOR_CHOICES.find((x) => x.value === c)!.label
export const visibleLabel = (c: VisibleChoice) => VISIBLE_CHOICES.find((x) => x.value === c)!.label
export const massLabel = (c: MassChoice) => MASS_CHOICES.find((x) => x.value === c)!.label
