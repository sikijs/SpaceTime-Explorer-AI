import type { LimitAnswer, SizeAnswer, ThresholdAnswer } from '../physics/blackHoleFormationExperiment'

// The three guess questions of Black Holes 9 and their choices, exactly as the owner approved them (2026-10-12, the second reworded the same day).
// Shared by the page, the pictures, the results and the tutor so that every place uses the same words.
export const SIZE_QUESTION =
  'A white dwarf is a dead star held up by the push of its electrons. If you add more mass to a white dwarf, what do you think happens to its size?'
export const SIZE_CHOICES: Array<{ value: SizeAnswer; label: string }> = [
  { value: 'bigger', label: 'It gets bigger' },
  { value: 'same', label: 'It stays the same size' },
  { value: 'smaller', label: 'It gets smaller' },
]

export const THRESHOLD_QUESTION = "At about what mass do you think a dead star's core first becomes a black hole? (This is the mass of the core, the middle part that has run out of fuel, not of the whole star. A star's outer layers are not counted.)"
export const THRESHOLD_CHOICES: Array<{ value: ThresholdAnswer; label: string }> = [
  { value: 'about-one', label: 'About the mass of the Sun (1 Sun)' },
  { value: 'about-three', label: "About 3 times the Sun's mass (3 Suns)" },
  { value: 'about-thirty', label: "About 30 times the Sun's mass (30 Suns)" },
]

export const LIMIT_QUESTION =
  "A neutron star is held up by neutrons instead of electrons. Do you think the largest mass a neutron star can have is higher than, the same as, or lower than a white dwarf's?"
export const LIMIT_CHOICES: Array<{ value: LimitAnswer; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'same', label: 'The same' },
  { value: 'lower', label: 'Lower' },
]

export const sizeLabel = (c: SizeAnswer) => SIZE_CHOICES.find((x) => x.value === c)!.label
export const thresholdLabel = (c: ThresholdAnswer) => THRESHOLD_CHOICES.find((x) => x.value === c)!.label
export const limitLabel = (c: LimitAnswer) => LIMIT_CHOICES.find((x) => x.value === c)!.label

// The short words in the white YOUR GUESS boxes on the pictures.
export const SIZE_TEXT: Record<SizeAnswer, string> = { bigger: 'the size gets bigger', same: 'the same size', smaller: 'the size gets smaller' }
export const THRESHOLD_TEXT: Record<ThresholdAnswer, string> = { 'about-one': 'about 1 Sun', 'about-three': 'about 3 Suns', 'about-thirty': '30 Suns: off the scale' }
export const LIMIT_TEXT: Record<LimitAnswer, string> = { higher: 'higher than a white dwarf’s', same: 'the same as a white dwarf’s', lower: 'lower than a white dwarf’s' }
