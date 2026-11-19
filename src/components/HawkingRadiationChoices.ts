import type { DirectionAnswer, HotAnswer, LongerAnswer } from '../physics/hawkingRadiationExperiment'

// The three guess questions of Black Holes 10 and their choices, as the owner approved them on 2026-10-12. The second question loses one sentence in the
// audit update (2026-11-19): "A black hole of 10 Suns glows at a temperature far below that" pointed toward the first answer and toward the direction
// (docs/audit/black-holes-and-strong-gravity/10-draft-wording.md, section 5). Shared by the page, the results and the tutor.
const DEGREES_BELOW_FREEZING = 270

export const HOT_QUESTION = 'A black hole is huge, and a small one is tiny. Which do you think would be hotter, if they glowed with heat?'
export const HOT_CHOICES: Array<{ value: HotAnswer; label: string }> = [
  { value: 'big', label: 'The big one' },
  { value: 'small', label: 'The small one' },
  { value: 'same', label: 'Both the same' },
]

export const directionQuestion = (backgroundKelvin: number) =>
  `Black holes in space are surrounded by the cold, faint heat of the cosmic microwave background, at ${backgroundKelvin} K, about ${DEGREES_BELOW_FREEZING} degrees below freezing. Do you think a black hole of 10 Suns is losing mass, gaining mass, or staying the same?`
export const DIRECTION_CHOICES: Array<{ value: DirectionAnswer; label: string }> = [
  { value: 'losing', label: 'Losing mass' },
  { value: 'gaining', label: 'Gaining mass' },
  { value: 'same', label: 'Staying the same' },
]

export const LONGER_QUESTION = 'A black hole of 1 Sun, which has the same mass as our Sun, left completely alone in cold space with nothing falling in, would take an extremely long time to evaporate. Now think of a black hole with ten times that mass: 10 Suns. Compared with the 1-Sun black hole, how many times longer do you think the 10-Suns black hole would take to evaporate?'
export const LONGER_CHOICES: Array<{ value: LongerAnswer; label: string }> = [
  { value: 'ten', label: 'About 10 times as long' },
  { value: 'hundred', label: 'About 100 times as long' },
  { value: 'thousand', label: 'About 1,000 times as long' },
]

export const hotLabel = (c: HotAnswer) => HOT_CHOICES.find((x) => x.value === c)!.label
export const directionLabel = (c: DirectionAnswer) => DIRECTION_CHOICES.find((x) => x.value === c)!.label
export const longerLabel = (c: LongerAnswer) => LONGER_CHOICES.find((x) => x.value === c)!.label
