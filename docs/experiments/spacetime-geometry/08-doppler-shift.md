# Experiment 8 (Spacetime Geometry): The Doppler Effect, Why a Fast Traveler Sees the Colors of the Sky Shift

**Status: APPROVED by the owner on 2026-10-16 ("approved", read as approving the specification with all twelve "Decisions Needing Human Review" on their defaults; Claude should say so if the owner meant otherwise). That includes Decision 1's one-line edit of Experiment 7's approved "What's next", which is not yet made. Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-16, at the owner's earlier request ("lets do 1,2 and 3 in that order": aberration, then the Doppler effect, then a fast object looking rotated). Not approved. Nothing is implemented yet. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1). Every number marked "computed" was computed by script on 2026-10-16 and must be re-checked by the physics tests before the build is approved.**

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". This is the sixth item of the roadmap in `01-the-interval.md` ("Relativistic Doppler effect. Color shifts in both directions, connecting to the redshift in Gravitational Waves 5"), and the second of the three items the owner asked for.

---

## Overview

Experiment 7 showed that a traveler flying through a ring of distant stars sees them **crowded ahead**. This experiment asks the next question, which Experiment 7 left open: **what happens to the color of the starlight?**

> **A traveler flying through the ring of stars sees the light of the stars ahead shifted toward blue, and the light of the stars behind shifted toward red. And, surprisingly, even a star that the lab sees exactly sideways is shifted toward blue.**

The situation is the one of Experiment 7: a ring of 24 distant stars at rest in the lab, evenly spaced, and a traveler flying through the middle at a steady speed. To keep the idea clean, every star sends out the **same single color of light** (a toy choice, stated to the learner). In the lab's sky all 24 stars have that color. In the traveler's sky the colors differ from star to star: ahead they are bluer, behind they are redder, and the point where blue turns to red lies **ahead of sideways**, not at sideways.

What is new compared with Gravitational Waves Experiment 5 (the redshift of a *receding* source):

- **Both directions**: stretched (red) when moving away from a star, squeezed (blue) when moving toward it.
- **It depends on the direction of the star**, not only on the speed, and it uses the angle `θ` and the star positions of Experiment 7.
- **The sideways case.** An everyday (non-relativistic) calculation says a star at exactly sideways would show no shift. The relativistic result is a shift toward blue by the factor `1 ÷ D`, where `D` is the time dilation factor of Experiment 3. The learner meets the difference between the everyday and the relativistic answer for the second time (the first was the "rain rule" in Experiment 7).

Honest limits, stated to the learner and not hidden:

- **Every star sends out one pure color.** Real stars send out a mixture of colors, so the real sky would change color in a more complicated way.
- **Only the color (the frequency) is shown, not the brightness.** Brightness changes too, and is not part of this experiment (Decision 1).
- **A flat slice of the sky** (the ring), as in Experiment 7. The stars are very far away and at rest in the lab.
- **Some shifts go outside the colors the eye can see.** Where the light shifts beyond violet or beyond red, the picture says "ultraviolet" or "infrared" instead of drawing a color. (Decision 3.)
- **The formula is used, not derived.** One sentence says where it comes from, with a worked example.

---

## Learning Objective

After this experiment, the learner should understand:

1. **The color of light that an observer measures depends on how the observer moves**, not only on the star. Light from a star the traveler is moving toward is shifted toward blue (higher frequency, shorter wavelength). Light from a star the traveler is moving away from is shifted toward red (lower frequency, longer wavelength). This is the Doppler effect, the same idea as a siren that rises in pitch as it comes toward you and drops as it goes away.
2. **The size of the shift depends on speed and on direction.** It is largest straight ahead (`(1 + β) ÷ D`, which is 2.00 at 0.6c) and smallest straight behind (`(1 − β) ÷ D`, 0.50 at 0.6c), and it changes smoothly in between.
3. **Even a star that the lab sees exactly sideways is shifted toward blue** for the traveler (by `1 ÷ D`, 1.25 at 0.6c). The everyday calculation would give no shift for it, so the extra factor `1 ÷ D` is the effect of **time dilation**: the traveler's clock runs slow, so it counts more wave crests per tick of its own clock.
4. **The relativistic factor is the everyday factor divided by `D`.** In Gravitational Waves Experiment 5 the same two pieces appeared for a *receding source*; the number for a star straight behind the traveler is exactly the number found there.
5. **Where blue turns to red is not at "sideways".** In the traveler's own sky, the dividing line between bluer and redder stars is ahead of the 90-degree line, because of the same `D` factor.
6. **The stars have not changed color.** Each observer measures the light that reaches them, and the two observers measure different frequencies for the same light. Neither is "the real color".

---

## Physical Situation

### Reused

- Flat spacetime, constant velocities, `c = 1`; the traveler's speed `β` (a fraction of `c`) and the time dilation factor `D = √(1 − β²)` of Experiment 3.
- **The ring of 24 stars, the lab's angle `θ`, the traveler's angle `θ'`, the direction of travel, the two pictures, the star we follow, and the wedges** from Experiment 7 (`src/physics/aberration.ts`: `travelerAngleOf`, `runSky`, `rayAsMeasuredByTraveler`).
- **Energy and momentum of a pulse of light** (Experiment 5): a pulse of light has energy `E` and momentum `pc = E`, and a light wave of frequency `f` has `E = h f`. The transformation of a ray's energy is the one already computed by `rayAsMeasuredByTraveler` (`E'` for `E = 1`). The ratio `E' ÷ E` is also the ratio of frequencies `f' ÷ f`, which is the number this experiment shows.
- **Redshift** (Gravity and Curved Spacetime, Experiment 2) and **the Doppler effect for a receding source** (Gravitational Waves, Experiment 5, which defined "Doppler effect" for the learner). Both words are reused, not redefined.

### What is new

- **Frequency shift factor `f' ÷ f`:** the frequency the traveler measures for a star's light, divided by the frequency the lab measures for the same light. Above 1 means shifted toward blue; below 1 means shifted toward red.
- **Wavelength:** the distance between two crests of the light wave. Higher frequency means shorter wavelength (`wavelength' = wavelength ÷ (f' ÷ f)`).
- **Blueshift** (the new word, introduced as the opposite of redshift) and the idea of **the visible range** (about 400 to 700 nanometres) with **ultraviolet** and **infrared** as the colors beyond it.
- **The crossing line:** the angle `θ'` in the traveler's sky where `f' ÷ f = 1`.

### Simplifying assumptions (all stated to the learner in plain language)

- All the stars are very far away, at rest in the lab, on one ring in the plane of the traveler's motion, and each sends out one pure color. The lab's color is **550 nanometres** (a yellow-green, near the middle of the visible range) as a toy value (Decision 2).
- The traveler moves at a steady speed through the centre of the ring; only that moment is looked at.
- Only the frequency (color) is shown, not the brightness.
- Light's frequency is measured by each observer; no detector or eye is modeled.

### Not introduced

Brightness and the headlight effect, the Doppler shift of sound as a calculation (only the siren as an everyday picture), the transverse Doppler effect as a named term (the sideways case is shown and explained, not named; Decision 8), a moving source of unequal speed, cosmological redshift (Cosmology and Gravitational Waves 5 already mention it), the fast object looking rotated (Experiment 9), and any real star's spectrum.

---

## Physics Model

### The rule

From Experiment 7, a ray from the star at lab angle `θ` has energy `E' = E (1 + β cos θ) ÷ D` for the traveler (the line `E'` of "The rule" in `07-aberration.md`). Because `E = h f` for light, the frequency the traveler measures is multiplied by the same factor:

`f' ÷ f = (1 + β cos θ) ÷ D`

Using the traveler's own angle for the same star, the factor can also be written

`f' ÷ f = D ÷ (1 − β cos θ')`

(Both are the same number. The tests check that they agree.) The everyday (non-relativistic) result for an observer moving toward the star is `1 + β cos θ`, so the relativistic factor is the everyday one divided by `D` (Learning Objective 4).

### Worked example (also for the tutor, with real numbers)

`β = 0.6`, so `D = 0.8`.

- **Straight ahead, `θ = 0°`:** `f' ÷ f = (1 + 0.6) ÷ 0.8 = 2.00`. The light is twice the frequency, so its wavelength is `550 ÷ 2 = 275` nanometres, which is ultraviolet.
- **The star the lab sees sideways, `θ = 90°`:** `f' ÷ f = (1 + 0) ÷ 0.8 = 1.25`. Wavelength `550 ÷ 1.25 = 440` nanometres: a blue-violet. The everyday answer would be 1.00, no shift.
- **Straight behind, `θ = 180°`:** `f' ÷ f = (1 − 0.6) ÷ 0.8 = 0.50`. Wavelength `550 ÷ 0.5 = 1100` nanometres, which is infrared. (The same number as the receding source of Gravitational Waves 5 at 0.6c.)
- **The crossing line.** `f' ÷ f = 1` when `cos θ = (D − 1) ÷ β`, which is `θ = 109.5°` in the lab's sky, and `cos θ' = (1 − D) ÷ β` in the traveler's sky, which is `θ' = 70.5°` at 0.6c (ahead of sideways, not at 90°).

### Numbers (computed 2026-10-16; the tests recompute them)

`f' ÷ f` for a lab angle `θ`:

| lab `θ` | `β = 0.3` | `β = 0.6` | `β = 0.9` | `β = 0.99` |
|---|---|---|---|---|
| 0 | 1.363 | 2.000 | 4.359 | 14.107 |
| 30 | 1.321 | 1.900 | 4.082 | 13.167 |
| 60 | 1.206 | 1.625 | 3.327 | 10.598 |
| 90 | 1.048 | 1.250 | 2.294 | 7.089 |
| 120 | 0.891 | 0.875 | 1.262 | 3.580 |
| 150 | 0.776 | 0.600 | 0.506 | 1.011 |
| 180 | 0.734 | 0.500 | 0.229 | 0.071 |

The lab angle where the shift is 1 (blue turns to red): 98.8°, 109.5°, 128.8°, 150.2° for the four speeds. For the 24-star ring, the number of stars shifted toward blue (`f' ÷ f > 1`) is 13, 15, 17 and 21, and toward red is 11, 9, 7 and 3 (the star at the crossing is not exactly on a ring position at any of these speeds).

Wavelengths of a 550-nanometre source (computed): straight ahead 404, 275, 126, 39 nanometres; the lab-sideways star 525, 440, 240, 78; straight behind 750, 1100, 2397, 7759. At 0.3c everything stays near the visible range (404 to 750); from 0.6c on, most of the sky is ultraviolet or infrared.

The everyday comparison for the tutor (computed): the everyday factor for the lab-sideways star is 1.00 at every speed; the relativistic factor is 1.048, 1.250, 2.294 and 7.089.

### New: a small independent physics module

```typescript
// src/physics/dopplerShift.ts (proposed)
export function frequencyFactorOf(labAngleDegrees: number, speed: number): number
// (1 + β cos θ) ÷ D, with exact values on the line of travel
export function frequencyFactorFromTravelerAngle(travelerAngleDegrees: number, speed: number): number
// D ÷ (1 − β cos θ'), the second form
export function everydayFrequencyFactorOf(labAngleDegrees: number, speed: number): number
// 1 + β cos θ, for the tutor's comparison
export function wavelengthNm(sourceNm: number, factor: number): number
export function rangeOf(wavelengthNm: number): 'ultraviolet' | 'visible' | 'infrared'
export function runDoppler(speed: number, sourceNm = 550): DopplerResult
// the 24 stars with lab angle, traveler angle, factor, wavelength and range; counts; the crossing angles in both skies; D
```

It reuses `travelerAngleOf`, `runSky` and `rayAsMeasuredByTraveler` from `aberration.ts` and `timeDilationFactorFor` from `movingClockExperiment.ts`, and invents no new physical assumption. Out-of-range inputs throw `RangeError` (`speed < 0` or `≥ 1`; non-positive wavelength).

---

## Learner Controls

1. **The traveler's speed:** four presets, 0.3c, 0.6c, 0.9c, 0.99c (as Experiment 7).
2. **Run:** gated on both predictions.

Changing the speed clears the predictions (the size of the shift depends on it).

---

## Prediction Activity

Draft wording (§28.1). Two questions, in this order, both answered before Run is enabled (the order of Gravitational Waves 5's two predictions). Not scored while the learner is predicting, and the learner is not told which is right until the tutor's explanation, which marks each prediction as matched or not matched (owner's choice, 2026-10-16).

> **Question 1.** Every star sends out the same color of light. The traveler flies through the middle of the ring at the speed you chose. The star straight ahead of the traveler is the one the traveler is flying toward. Compared with the lab's view of that star, does the traveler see its light **bluer**, **the same color**, or **redder**?
>
> **Question 2.** Now take the star that the lab sees exactly sideways: it is neither ahead of the traveler's path nor behind it. Does the traveler see its light **bluer**, **the same color**, or **redder** than the lab sees it?

Right answers: Question 1, bluer; Question 2, bluer, at every speed offered. Question 1 is the familiar siren idea. Question 2 is the surprise: "sideways, so no change" is the natural guess, and "the same color" is the answer the everyday calculation gives. Both questions ask about direction only, not a number.

---

## Experiment Behavior

### Introduction (draft; the owner approves the wording, §28.1)

The rules are those of Experiments 5 to 7 (`CLAUDE.md` §15, §12): every term defined in plain language before it is used, a concept before its formula, a worked example with real numbers and a note of what the formula does not mean, a daily-life example for an idea that is not obvious, nothing the learner is asked to predict revealed in advance, and a collapsed "Words and formulas" panel that gains the formula only after the run.

- **The question.** In Experiment 7 we saw that a traveler and the lab see the same stars in different directions. Does the *color* of the light change too? Light is a wave, and the color we see depends on how close together its crests are. Does the traveler's own motion change what color the light has?
- **New words, each with an example.**
  - **Frequency:** how many wave crests pass you each second. A siren of high pitch has a high frequency. For light, a higher frequency is a bluer color and a lower frequency is a redder one.
  - **Wavelength:** the distance between two crests. A higher frequency means a shorter wavelength. Wavelengths of light are written in **nanometres** (one billionth of a metre). The colors the eye can see run from about 400 nanometres (violet) to about 700 nanometres (red). Shorter than that is **ultraviolet**; longer is **infrared**. Our pictures use 550 nanometres for the stars, a yellow-green near the middle of the visible range.
  - **Shifted toward blue / toward red** (**blueshift**, **redshift**): the light is measured at a higher / lower frequency than before. *Redshift* is the word from Gravity and Curved Spacetime, Experiment 2 and Gravitational Waves, Experiment 5; blueshift is its opposite.
  - **The shift factor `f' ÷ f`:** the frequency the traveler measures divided by the frequency the lab measures. 2.00 means twice the frequency; 0.50 means half.
- **An everyday example that does not reveal the answer** (Decision 6, wording to approve): "The pitch of a siren depends on whether the ambulance is coming or going. The siren has not changed; the sound reaching you has." The direction of the shift is not said.
- **What happens.** The ring of 24 stars is shown, all one color, as the lab sees it. Then the same stars are shown as the traveler sees them, each with the color the traveler measures.
- **Your job.** Choose the traveler's speed. Predict the color of two stars, as asked. Press Run. You are not graded.
- **What we assume.** Every star sends out one pure color; the stars are very far away and at rest in the lab; the traveler moves at a steady speed; we show a flat slice of the sky, and only the color, not the brightness.

### Display

Two pictures of the sky, side by side (stacked on a narrow window), on the dark-canvas style of Experiment 7 and on the same scale: **The lab's sky** (sky blue outline) and **The traveler's sky** (purple outline), each with the 24 stars on the ring, the traveler at the centre, the direction of travel, the labeled stars, the star we follow and the wedges of Experiment 7. The new element is the **color of each star**:

- In the lab's sky all 24 stars are drawn in the 550-nanometre color.
- In the traveler's sky each star is drawn in the color of its measured wavelength if that is in the visible range. If it is outside, it is drawn as a **marker** and not a color: a hollow star with the letters **UV** (ultraviolet) or **IR** (infrared), so the picture never relies on color alone (§14.2) and never claims to show a color the eye cannot see.
- **A shift bar** under the pictures: a spectrum from 400 to 700 nanometres with the regions "ultraviolet" and "infrared" on the two sides, and, after the run, marks for the three labeled stars (straight ahead, the star we follow, straight behind) at their measured wavelengths, with the wavelength and the factor `f' ÷ f` written on each.
- **The crossing line**, after the run: a dashed line across the traveler's sky showing where the light changes from bluer to redder than the lab's color, labeled "blue turns to red here" with its angle, and the line at 90° for comparison.

A **"How to read this diagram"** caption beneath, written to the standard of `CLAUDE.md` §14 (detailed, plain words, short sections or lists): name each picture, whose view it is and when it appears; list every drawn element (the ring, each star, the arrow, the labels, each star color, the UV and IR markers, the shift bar and each of its marks, the crossing line and the 90° line); define frequency, wavelength, nanometre, blueshift, redshift and `f' ÷ f`; describe what appears when, in order; give a worked moment with real numbers (a neutral one before the run: reading a wavelength off the bar; the full worked moment for `β = 0.6` after the run, so the direction is not given away) and a "what to look for" list. The caption does not say which way any color shifts before the run.

### Run

Staged, at a pace the learner can follow (the physics result does not depend on playback speed, §11), as Experiment 7's:

1. The lab's sky appears: 24 stars, one color, with the shift bar showing the lab's wavelength.
2. The traveler flies through the centre.
3. The traveler's sky is built a pair of stars at a time, from straight ahead around to straight behind. As each pair appears, its color (or UV / IR marker) appears and the same ray is drawn at its two angles in both pictures (as in Experiment 7).
4. The shift bar's marks, the wedge counts and the crossing line appear.
5. The results table, and then the tutor.

### Results (neutral, then explained by the tutor after the learner has responded)

For the chosen speed: a table of the seven stars of Experiment 7 (lab angle 0° to 180° in steps of 30°) with the traveler's angle, the shift factor `f' ÷ f`, the wavelength in nanometres and the range (ultraviolet, visible or infrared); the number of stars shifted toward blue and toward red (of the 24); the crossing angle in the traveler's sky; the time dilation factor `D`; and the learner's two predictions, recorded and not marked. Nothing says why, and nothing says which way the stars "moved".

---

## Expected Observations

- The lab's sky is one color; the traveler's sky has the bluest light straight ahead and the reddest straight behind.
- The star the lab sees sideways is bluer for the traveler, at every speed, and more so at higher speed.
- The faster the traveler, the more of the sky is shifted toward blue: 13, 15, 17 and 21 of the 24 stars at 0.3c, 0.6c, 0.9c and 0.99c.
- The crossing between blue and red lies ahead of the 90-degree line in the traveler's sky.
- At 0.6c and above, most of the traveler's sky is ultraviolet or infrared (outside the colors the eye can see).

## Expected Learner Understanding

The learner should be able to say that the color of starlight measured by a moving observer depends on the observer's direction of motion: bluer ahead, redder behind, and, surprisingly, bluer even at "sideways"; that the stars have not changed color; and that the extra blueshift at sideways comes from the traveler's clock running slow. They should not leave thinking that brightness has been shown, or that real stars are a single color.

---

## New Concepts Introduced

**Frequency and wavelength of light** (the words), **nanometre**, **the visible range, ultraviolet and infrared**, **blueshift**, **the shift factor `f' ÷ f`**, and the idea that the **color of a ray of light is an observer-dependent measurement**, as the direction was in Experiment 7.

## Relationship to Previous Experiments

- **Experiment 7 (aberration):** the same ring, the same angles, the same ray; this experiment reads off a second property of each ray (its energy and so frequency) from the same transformation. The two effects are the two halves of one calculation.
- **Experiment 5 (energy, momentum and mass):** the energy of a ray changes between observers by the transformation of Experiment 5, and `E = h f` makes that a change in frequency.
- **Experiment 3 of the first chapter (time dilation) and Experiment 3's `D`:** the extra factor `1 ÷ D` is the time dilation factor; the explanation uses a clock that runs slow.
- **Gravitational Waves, Experiment 5:** the same Doppler effect for a receding source: classical stretching times `D`. The number for a star straight behind the traveler equals that experiment's factor at the same speed.
- **Cosmology, Experiment 1 and Gravity and Curved Spacetime, Experiment 2:** redshift as a word and a measurement.

## Relationship to Later Experiments

- **Experiment 9 (a fast object looks rotated, proposed):** it uses the directions of Experiment 7 and the light travel time of Experiment 4; it does not need the colors.
- **Brightness** (the "headlight effect") is not in this experiment (Decision 1); it follows from the same `E' ÷ E` and could be a later experiment or part of one.

---

## Required Physics Tests

(For `src/physics/dopplerShift.test.ts`; the numbers are recomputed in the tests.)

1. At `β = 0`, `frequencyFactorOf(θ, 0) = 1` for every `θ`.
2. The two forms agree: `frequencyFactorOf(θ, β)` equals `frequencyFactorFromTravelerAngle(θ', β)` with `θ' = travelerAngleOf(θ, β)`, for several `θ` and `β`.
3. The energy route agrees: `frequencyFactorOf(θ, β)` equals the `energy` returned by `rayAsMeasuredByTraveler(θ, β)` (for `E = 1`).
4. Straight ahead, `(1 + β) ÷ D`; straight behind, `(1 − β) ÷ D` (the table's values), and the latter equals `D ÷ (1 + β)`, the factor of Gravitational Waves 5's `dopplerFactorFor`.
5. At `θ = 90°`, the factor is `1 ÷ D` (1.048, 1.250, 2.294, 7.089), and the everyday factor is exactly 1.
6. The factor falls steadily as `θ` rises from 0° to 180°, at every `β > 0`.
7. The table of factors above, to a stated tolerance.
8. The crossing angles (98.8°, 109.5°, 128.8°, 150.2° in the lab's sky; `arccos((1 − D) ÷ β)` in the traveler's sky, below 90°), and the factor equals 1 there.
9. The counts of stars shifted toward blue and red (13/11, 15/9, 17/7, 21/3), and the lab's 24 stars at factor 1.
10. Relativistic factor = everyday factor ÷ `D`, at every `θ` and `β`.
11. The wavelength and range for each speed (the computed wavelengths above), including the visible-range limits at 400 and 700 nanometres.
12. The symmetry between the stars above and below the line of travel (`θ` and `360° − θ` give the same factor).
13. `RangeError` for `speed < 0`, `speed ≥ 1`, and a non-positive wavelength.

---

## AI Tutor Behavior

The same pattern as Experiments 3 to 7 (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, after the learner has responded. The tutor does not invent physics and reports only what the physics module produced.

1. **Observe.** "Look at the two pictures, the bar and the table. What do you notice about the color of the stars in the lab's sky and in the traveler's sky?"
2. **Compare with the predictions.** "You predicted that the star straight ahead would look [bluer / the same / redder] and the sideways star [bluer / the same / redder]. In this run the straight-ahead star's light was measured at [factor] times the lab's frequency, and the sideways star's at [factor]. Comparing that with your predictions, what do you notice?" (Not marked here.)
3. **Conceptual question.** "The stars have not changed color. So what is different for the traveler? And why would a star that is neither ahead nor behind change color?"
4. **Explanation**, after the learner has responded (the owner's wording to approve):
   0. **Your predictions, marked (the owner's choice, 2026-10-16):** each prediction beside the result, with "matched" or "did not match", shown at the start of the explanation and nowhere earlier (the Results panel still only records them).
   1. **What the results show,** in the learner's own numbers (the factors and wavelengths of the three labeled stars; the counts; the crossing angle).
   2. **A daily-life example: the siren.** An ambulance's siren sounds higher as it comes toward you and lower as it goes away. The siren has not changed; the sound waves reach you closer together when you are approaching them and farther apart when you are leaving. The same is true of the crests of a light wave, with the crests of light in place of the crests of sound. For a traveler flying toward a star the crests arrive more often, so the light looks bluer; away from a star they arrive less often, so it looks redder.
   3. **The everyday rule, with simple math.** Counting crests: if the traveler flies toward a star, the crests arrive more often by the factor `1 + β cos θ`. For the star straight ahead at 0.6c that is 1.6 times, and for the star straight behind it is 0.4 times. For a star exactly sideways (to the lab), the everyday rule gives no change, 1.00.
   4. **Why the relativistic answer is different: time dilation.** The traveler's clock runs slow by the factor `D` (Experiment 3). The traveler counts crests per tick of *its own* clock, and its tick is longer, so in each tick it counts more crests. This divides the everyday number by `D`. At 0.6c, `D = 0.8`, so each everyday number is multiplied by 1.25: the star straight ahead is `1.6 ÷ 0.8 = 2.00`, the sideways star `1.00 ÷ 0.8 = 1.25`, and the star straight behind `0.4 ÷ 0.8 = 0.50`. These are the numbers in your table.
   5. **The worked formula,** with the learner's own speed and the sideways star: `f' ÷ f = (1 + β cos θ) ÷ D = (1 + 0) ÷ D = 1 ÷ D`. (Where the formula comes from, one sentence: it is the same transformation of a ray's energy that gave the angle in Experiment 7, and the energy of light is proportional to its frequency.)
   6. **Where blue turns to red.** Because of the extra `1 ÷ D`, the stars at exactly 90° in the traveler's sky are already shifted toward red (by `D`), and the dividing line lies ahead of the 90-degree line, at the angle in the table.
   7. **A real example** (Decision 5): the light of a receding galaxy is redshifted, which is how astronomers measured the expansion of the universe (Cosmology, Experiment 1); the same effect from Earth's own motion makes the cosmic microwave background slightly hotter in one direction (to be verified before use; see "Real-World Facts Used").
   8. **What was shown and not shown.** Colors only; a flat slice of the sky; one pure color; no brightness.

### Chapter summary (draft, for the owner's review)

Shown below the experiment only after the tutor's explanation. "What you learned": two observers who move relative to each other measure different frequencies, and so different colors, for the same ray of light. A traveler sees starlight shifted toward blue ahead and toward red behind, by `(1 + β cos θ) ÷ D`: at 0.6c, 2.00 times the frequency straight ahead and 0.50 times straight behind. Even the star the lab sees sideways is shifted toward blue, by `1 ÷ D` (1.25 at 0.6c), because the traveler's clock runs slow. The stars have not changed color. "What's next": a short pointer to Experiment 9 (a fast object looks rotated), or no pointer, as the owner chooses (Decision 9).

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| The visible range is about 400 to 700 nanometres | General knowledge; standard | Not checked in this session; to be confirmed by search before approval |
| 550 nanometres is a yellow-green near the middle of the visible range | General knowledge | To be confirmed |
| A siren sounds higher as it approaches and lower as it recedes | General knowledge | Not checked; widely stated |
| The energy of light is proportional to its frequency, `E = h f` | Standard physics | To be confirmed |
| Redshift of receding galaxies is how the expansion was measured | Cosmology, Experiment 1 of this project | Already in the project |
| The cosmic microwave background looks slightly hotter in the direction of Earth's motion | General knowledge | **Unchecked; to be confirmed by search, or left out (Decision 5)** |
| The formula `f' ÷ f = (1 + β cos θ) ÷ D` | Derived here from the transformation of a ray's energy (checked by the tests' second route) | Derived; no source was consulted for the formula itself |
| The straight-behind factor equals Gravitational Waves 5's factor at the same speed | Computed and tested (test 4) | Computed |

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **Color only, or color and brightness.** Experiment 7's approved "What's next" says "Its colour and brightness change too, which the next experiment shows." Default: **color only** in this experiment, and ask the owner to approve a one-line edit of Experiment 7's "What's next" so that it no longer promises brightness (it would say "its colour changes too"). Alternative: add brightness as a second part (the brightness of a beam changes by the square of the same factor; this makes the experiment about twice the size).
2. **The source color.** Default: every star sends out one pure 550-nanometre light (yellow-green). Alternative: white light made of several colors (more realistic, more to explain), or a choice between a few source colors.
3. **How shifts outside the visible range are drawn.** Default: a hollow marker with "UV" or "IR" and no invented color. Alternative: draw a made-up false color.
4. **Speed presets.** Default: 0.3c, 0.6c, 0.9c and 0.99c, as in Experiment 7. Alternative: add 0.1c, where the shift is small and nearly all stars stay visible.
5. **A real example in the tutor.** Default: the redshifted galaxy (already in the project), and the cosmic microwave background's slight directional warmth only if it can be confirmed by a search, otherwise left out. Alternative: leave out all real examples.
6. **An everyday example in the introduction.** Default: the siren, with the direction of the shift not stated ("the siren has not changed; the sound reaching you has"), since the learner already knows the siren shifts both ways. Alternative: no example in the introduction, only in the tutor. (Risk: the siren example previews the answer to Question 1.)
7. **Two predictions, not one.** Default: two (straight ahead, then sideways), because the second is the surprise. Alternative: one prediction, about the sideways star only.
8. **Naming the "transverse Doppler effect".** Default: not named (the sideways case is shown and explained, with the word "Doppler" only). Alternative: name it, as textbooks do, after the run.
9. **The chapter summary's "What's next".** Default: points to Experiment 9 (a fast object looks rotated) only if the owner approves that experiment's direction; otherwise no pointer.
10. **The crossing line.** Default: shown (the dashed line in the traveler's sky, with the 90° line for comparison). Alternative: leave it out and mention the crossing only in the tutor.
11. **Order.** Default: the Doppler effect before the rotated object, as the owner asked.
12. **Spacetime diagrams.** Default: none; this experiment is about colors of rays in space, not events. Alternative: a small diagram of the wave crests arriving at a moving clock.

---

## Success Criteria

1. The physics module gives, for each speed and lab angle, the shift factor, and the numbers agree with the tables above (to a stated tolerance) and with the independent energy route and the traveler-angle form.
2. The learner predicts both questions before the run; Run requires both.
3. The two pictures show the same 24 stars, labeled, with the lab's single color and the traveler's measured colors (or UV and IR markers) clearly different, and never rely on color alone.
4. The shift bar and the crossing line show the contrast between the two pictures and between "sideways" and "where blue turns to red".
5. The results are neutral; the explanation comes only after the learner has responded.
6. The introduction and caption define every term and formula, with a worked example and a note of what the formula does not mean, and neither says which way any color shifts before the learner has predicted and observed (any worked example of the formula appears after the run, as in Experiment 7).
7. The experiment never says or draws that the stars change color, never shows brightness as changed, and says plainly that only color is shown.
8. The "Words and formulas" panel lists every term and formula (the formula after the run).
9. The number for a star straight behind the traveler equals Gravitational Waves, Experiment 5's factor at the same speed, and nothing contradicts Experiments 1 to 7 of this group or the earlier chapters.

---

## Implementation Notes

**Built (2026-10-16), §21 Steps 2 and 3 only:** the physics model (`src/physics/dopplerShift.ts`) and its tests (`src/physics/dopplerShift.test.ts`: all thirteen required tests, as 24 test cases, with the specification's tables written out by hand). Exports: `frequencyFactorOf`, `frequencyFactorFromTravelerAngle`, `everydayFrequencyFactorOf`, `wavelengthNm`, `rangeOf`, `labCrossingAngle`, `travelerCrossingAngle` and `runDoppler`, plus the constants `DEFAULT_SOURCE_NM`, `VISIBLE_MIN_NM` and `VISIBLE_MAX_NM`. It reuses `runSky` and `travelerAngleOf` from `aberration.ts` and `timeDilationFactorFor`. The tests also use `rayAsMeasuredByTraveler` (the energy route, test 3) and Gravitational Waves 5's `dopplerFactorFor` (test 4), so the three routes to the factor agree. A mutation check (nine deliberate breaks: `D` multiplied instead of divided, no `D`, the sign of the speed, the traveler form's sign, wavelength times factor instead of divided, the lower visible limit excluded, the crossing angle's sign, factor 1 counted as blue, and an inexact cosine at sideways) was caught by at least one test each (four of them by one or two tests only). **Not built yet:** the interface, introduction, "Words and formulas" panel, pictures, the two predictions, results, tutor and chapter summary, and the one-line edit of Experiment 7's "What's next" (Decision 1).

Differences from the specification so far: `labCrossingAngle` and `travelerCrossingAngle` return `null` at speed 0 (where there is no shift), which the specification does not say; and `runDoppler` takes an optional `starCount` (default 24), as `runSky` does.

**Step 4, the basic interface (2026-10-16), draft wording for the owner's review:** `src/components/DopplerShiftExperiment.tsx`, registered as chapter 8 of the group in `src/App.tsx` (with the chapter summary from this specification, not yet shown because there is no tutor). It has the introduction, the "Words and formulas" panel (terms only), the speed control (0.3c, 0.6c, 0.9c, 0.99c), the lab's sky (24 stars from `runSky`, all in the 550 nm color; the labeled stars, the yellow ring on the star we follow, a dashed white ring on the star straight ahead, and the striped and dotted wedges with their counts), a held place for the traveler's sky, the spectrum bar (300 to 800 nm, with the visible range in its colors, the UV and IR regions patterned, and the lab's 550 nm line), and the "How to read this diagram" caption. Not built yet: Run, the traveler's sky, the two predictions, the results, the tutor, the formula with its worked example, the bar's marks for the traveler's colors, the crossing line, progress marks.

**Differences from the specification in Step 4, for the owner's approval:**
1. **The formula and its worked example are left out of the introduction and the caption** until after the run, as in Experiment 7 (difference 1 there): any worked example shows which way a color shifts, which the predictions ask (§12). The caption's worked moment is the neutral one the specification lists (reading a wavelength off the bar).
2. **The introduction's everyday example is the siren, worded without a direction** (Decision 6's default), and the "shifted toward blue / red" definition says only that blue means a higher frequency and red a lower one, not which stars shift which way.
3. **Experiment 7's "What's next" was edited** (Decision 1's default, approved with the specification): "Its colour and brightness change too" became "Its colour changes too".
4. **This chapter's "What's next"** says "This group has no further experiment yet." for now (Decision 9: a pointer to Experiment 9 only if the owner approves that experiment's direction).
5. **The star color in the picture** comes from an ordinary piecewise approximation of the visible spectrum, written only for drawing (the physics gives the wavelength). The 550 nm star is drawn as a bright green, a little greener than the yellow-green the text calls it. The owner may want a different drawing color for the lab's stars.
6. **The two predicted stars are ringed in the pictures** (the star we follow in yellow, as in Experiment 7, and the star straight ahead with a dashed white ring), because both predictions are about them.

**Step 5 and 6, the learner interaction (2026-10-16), draft wording for the owner's review:** the two predictions (the specification's wording, each with Bluer / The same color / Redder; changing the speed clears both), Run (off until both are made), and the staged run (9 seconds, 13 steps from straight ahead to straight behind) that builds the traveler's sky in the measured colors, with hollow UV (solid outline) and IR (dashed outline) markers carrying their letters, then the spectrum bar's three marks (straight ahead, the star we follow, straight behind, each with wavelength and factor, drawn at the bar's end and marked "off the ... end" when off the scale) and the wedge counts. `onComplete` is called when the run ends. Not built yet: the results table, the formula and its worked example, the crossing line, the tutor, the explained mark.

Differences from the specification in Steps 5 and 6, for the owner's approval:
7. **No traveler-flying-in animation and no rays drawn at the two angles** (the specification's Run stages 2 and 3 say "as in Experiment 7"); the traveler is already at the centre, and the sky is built a pair of stars at a time.
8. **Crowding:** at high speed the UV markers ahead overlap, as the stars themselves do in Experiment 7; the results table (a later step) lists every number.

**Results, crossing line and tutor (2026-10-16), draft wording for the owner's review:** the neutral results panel (predictions recorded and not marked, the seven-star table with traveler's angle, shift factor, wavelength and range, the blue and red counts, the crossing angles and `D`), the dashed crossing line and dotted 90° line in the traveler's sky, the formula entry in "Words and formulas" after the run, and the tutor (`src/components/DopplerShiftTutor.tsx`: observe, compare with both predictions, a conceptual question, then an eight-part explanation: the learner's numbers, the siren, the everyday rule with numbers, why `D` divides it, the worked formula, where blue turns to red, the galaxy redshift example, and what was not shown). The chapter summary now shows after the tutor's explanation; its "What's next" still says the group has no further experiment (Decision 9). All numbers in the tutor come from the physics module. Difference for the owner's approval: **9.** the cosmic microwave background example is left out, because it has no source check (Decision 5's default). Not done yet: the complete-flow test across all speeds and predictions, and the final review.

**Complete-flow test (2026-10-16), in Chrome:** all four speeds with all nine prediction pairs (36 full runs), each driven end to end through the page. Checked per run: Run is off with no prediction and with one, and on with both; the "Running..." state; the traveler's sky has the right number of UV and IR markers for the speed (recomputed independently from the formula); the seven table rows' shift factors match the formula to 0.006; the blue count in the results text; the learner's first prediction is recorded; all three marks are on the spectrum bar; the three tutor steps require a non-empty answer and reach the eight-part explanation; the chapter summary is absent before the tutor and present after it (checked on the first run, from a cleared saved state); changing the speed clears the predictions and the tutor. All 36 runs passed, with no console errors. Also viewed at 0.99c: the crossing label (29.8°) and the bar's marks are readable. Not checked: narrow windows, browsers other than Chrome, a real learner, and the final review against the specification.

**Final review (2026-10-16), §21 Step 10:** compared with the Success Criteria, the Learning Objectives and the Required Physics Tests. All thirteen required tests are in `dopplerShift.test.ts` and pass; the full suite passed 836 of 836 on two reruns (one earlier run showed one failing test that did not repeat; its name was not captured). Found and fixed: the "How to read this diagram" caption did not explain the dashed crossing lines or the dotted 90° line, which appear after the run (§14); a bullet now does. Nothing found against criteria 1 to 9: the introduction and caption say nothing about which way a color shifts before the run, the formula and its worked example appear only after the run, the results are neutral, the explanation follows the learner's answers, and no text says the stars change color or shows brightness. Open items: (1) this file's header still says "Not approved. Nothing is implemented yet", which is out of date, and the owner has not decided whether to edit it; (2) the owner's approval of all learner-facing wording (§28.1) and of differences 1 to 9 above; (3) no source check for the visible range (400 to 700 nm), 550 nm as yellow-green, `E = h f` and the siren statement (the table above); (4) the formula itself was derived here and not checked against a source; (5) not checked at narrow widths, in browsers other than Chrome or with a real learner; (6) `npm run build` still fails on existing TypeScript errors in other files (25 reported; none in the Doppler files); (7) not committed.

**Wording approved (2026-10-16):** the owner approved all learner-facing wording (§28.1), including the introduction, both captions, the predictions, the results, the tutor (with its marking of the predictions as matched or not matched) and the chapter summary. The owner has not yet approved differences 1 to 9 above.

**Differences approved (2026-10-16):** the owner approved all nine differences from the specification listed above ("approved"). The specification's header paragraph above is out of date (it says "Not approved. Nothing is implemented yet") and is left as it was written.
