import type { CauseChoice, LastFlashChoice, SpacingChoice } from '../physics/seeingTheFallExperiment'

// The three guess questions of Black Holes 6 and their choices, exactly as the owner approved them (2026-10-12). Shared by
// the page, the pictures, the results and the tutor so that every place uses the same words.
export const SPACING_QUESTION =
  'A traveler falls toward a black hole, sending a flash of light once every few seconds of their own watch. A far-away observer receives the flashes. As the traveler nears the horizon, how do the flashes arrive?'
export const SPACING_CHOICES: Array<{ value: SpacingChoice; label: string }> = [
  { value: 'same', label: 'At the same spacing as they were sent' },
  { value: 'closer', label: 'Closer together' },
  { value: 'further', label: 'Further and further apart' },
]

export const LAST_FLASH_QUESTION = 'Does the far-away observer ever receive the flash that is sent as the traveler crosses the horizon?'
export const LAST_FLASH_CHOICES: Array<{ value: LastFlashChoice; label: string }> = [
  { value: 'soon', label: 'Yes, soon after it is sent' },
  { value: 'long-wait', label: 'Yes, but only after a very long wait' },
  { value: 'never', label: 'No, it never arrives' },
]

export const CAUSE_QUESTION =
  'Two effects could change how far apart the flashes arrive: gravity slowing the traveler\'s watch (Black Holes 2), and the traveler moving away as they fall (like the receding source in Gravitational Waves, Experiment 5). Which of them do you think matters?'
export const CAUSE_CHOICES: Array<{ value: CauseChoice; label: string }> = [
  { value: 'gravity', label: 'Only gravity' },
  { value: 'motion', label: "Only the traveler's motion" },
  { value: 'both', label: 'Both, and together they matter more than either alone' },
]

export const spacingLabel = (c: SpacingChoice) => SPACING_CHOICES.find((x) => x.value === c)!.label
export const lastFlashLabel = (c: LastFlashChoice) => LAST_FLASH_CHOICES.find((x) => x.value === c)!.label
export const causeLabel = (c: CauseChoice) => CAUSE_CHOICES.find((x) => x.value === c)!.label
