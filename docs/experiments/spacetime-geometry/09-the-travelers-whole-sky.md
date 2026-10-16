# Experiment 9 (Spacetime Geometry): The Traveler's Whole Sky, Direction, Color and Brightness Together

**Status: APPROVED by the owner on 2026-10-16 ("approve", read as approving the specification with all twelve "Decisions Needing Human Review" on their defaults, including the one-line edit of Experiment 8's "What's next", not yet made; Claude should say so if the owner meant otherwise). Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-16, at the owner's direction. Implementation has begun (see "Implementation Notes"). The owner chose this plan on 2026-10-16: Experiment 9 (this one, the whole sky, which includes brightness), then Experiment 10 (a fast object looks rotated, not squashed), then a closing "putting it all together" section on Experiment 10's page that recaps the whole group (not an experiment, no predictions, no new physics). The pushing-harder-gives-less-speed idea was left to that recap, at most a sentence or two. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1). Every number marked "computed" was computed by script on 2026-10-16 and must be re-checked by the physics tests before the build is approved.**

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". This is the ninth experiment of the group. It finishes the thread of Experiments 7 and 8 (what a fast traveler sees when looking out at the stars: where the stars are, then what color) with the missing third property, **brightness**, and puts the three together in one picture. Experiment 7's "What's next" promised "colour and brightness"; Experiment 8 delivered the colour and left brightness for here (its Decision 1).

---

## Overview

Experiment 7 showed that a fast traveler sees the stars **crowded ahead**. Experiment 8 showed that their light is **shifted toward blue ahead and toward red behind**, and, surprisingly, even a star the lab sees sideways is shifted toward blue. This experiment asks the last question about the same ring of stars: **how bright does each star look?**

> **A traveler flying through the ring of stars sees the stars ahead brighter than the lab does, and the stars behind dimmer. And, as with the color, even the star the lab sees exactly sideways looks brighter.**

The situation is the one of Experiments 7 and 8: a ring of 24 distant stars at rest in the lab, evenly spaced, each sending out the same single color (550 nanometres) and the same brightness as far as the lab is concerned; a traveler flies through the middle at a steady speed. The new idea is one number per star, the **brightness factor** `B' ÷ B`: the brightness the traveler measures divided by the brightness the lab measures for the same star. Above 1 means brighter for the traveler; below 1 means dimmer.

The result is the **square** of the color's shift factor of Experiment 8:

`B' ÷ B = (f' ÷ f)² = ((1 + β cos θ) ÷ D)²`

The learner is given the reason in plain terms: light arrives as a stream of tiny packets (photons). A traveler flying toward a star meets the packets **more often** (by the factor `f' ÷ f`) and each packet carries **more energy** (by the same factor, because a bluer light's packets carry more energy), so the energy arriving each second goes up by that factor **twice over**. Flying away does the opposite twice over.

The run builds the traveler's whole sky **in three layers**, each one a property the learner has already met or is about to meet: first the **direction** (Experiment 7), then the **color** (Experiment 8), then the **brightness** (new). At the end the learner has one picture in which each star has the direction, the color (or UV/IR marker) and the brightness the traveler measures.

A neat connection that the experiment makes visible: **a star is brighter for the traveler exactly when it is bluer** (the factor is above 1 for both), and **dimmer exactly when it is redder**. The line where blue turns to red (Experiment 8's crossing line) is also the line where brighter turns to dimmer.

Honest limits, stated to the learner and not hidden:

- **Every star is a single point sending out one pure color.** Real stars send out a mixture of colors; the real sky would change in a more complicated way.
- **"Brightness" means the energy of light arriving each second on a surface that faces the star, as measured by each observer's instrument.** It is not what an eye would report: an eye cannot see ultraviolet or infrared, and it does not respond to brightness in a simple proportional way. Where light has shifted outside the visible range, it still has a brightness for an instrument, but the picture marks it with UV or IR as in Experiment 8.
- **Only each star's own brightness is shown.** Nothing is said about the total light of the whole sky, the glow between the stars, or the brightness of extended objects (these change differently).
- **A flat slice of the sky** (the ring), as in Experiments 7 and 8, and **the stars are very far away and at rest in the lab**.
- **The formula is used, not derived.** One sentence says where it comes from, with a worked example.

---

## Learning Objective

After this experiment, the learner should understand:

1. **The brightness of a star depends on how the observer moves**, not only on the star. A traveler sees a star it is flying toward **brighter** than the lab does, and a star it is flying away from **dimmer**. Nothing about the star has changed.
2. **The size of the change depends on speed and direction, and is larger than the color's change.** The brightness factor is the **square** of the color's shift factor: `((1 + β cos θ) ÷ D)²`. It is largest straight ahead (`(1 + β) ÷ (1 − β)`, 4.00 at 0.6c) and smallest straight behind (`(1 − β) ÷ (1 + β)`, 0.25 at 0.6c).
3. **Even the star the lab sees exactly sideways looks brighter** (by `1 ÷ D²`, 1.56 at 0.6c). The reason is the same as for the color (time dilation, Experiment 3), applied twice.
4. **The reason for the square:** two things change at once. The traveler meets the packets of light **more often**, and each packet carries **more energy**. Each is changed by the same factor, so the energy arriving each second is changed by that factor twice. (For a star behind, both go the other way.)
5. **Direction, color and brightness are three properties of one ray of light, and one calculation gives all three.** The ray's energy and direction change together (Experiments 5 and 7). A star shifted toward blue is brighter; a star shifted toward red is dimmer; the line between them is the same line.
6. **The stars have not changed.** Neither the lab's view nor the traveler's is "the real sky". Each observer measures the light that reaches them.

---

## Physical Situation

### Reused

- Flat spacetime, constant velocities, `c = 1`; the traveler's speed `β` and the time dilation factor `D = √(1 − β²)` (Experiment 3).
- **The ring of 24 stars, the lab's angle `θ`, the traveler's angle `θ'`, the direction of travel, the two pictures, the star we follow, the wedges, the four speed presets** (Experiment 7, `src/physics/aberration.ts`).
- **The shift factor `f' ÷ f`, the wavelength, the visible range, the UV and IR markers, the spectrum bar and the crossing line** (Experiment 8, `src/physics/dopplerShift.ts`).
- **The energy of a pulse of light** and `E = h f` (Experiment 5, Experiment 8). A beam of light is a stream of photons, each of energy `h f`; the word "photon" is already used in this project (Experiment 5).

### What is new

- **Brightness** of a star as an observer measures it: the energy of light arriving each second on a surface that faces the star. It is the number of photons arriving each second multiplied by the energy of each.
- **The brightness factor `B' ÷ B`:** the traveler's brightness divided by the lab's for the same star. Above 1 is brighter, below 1 is dimmer.
- **Why it is the square:** the photons arrive `f' ÷ f` times as often, and each carries `f' ÷ f` times the energy.
- **The "whole sky" picture:** each star drawn with its direction, its color and its brightness, together.

### Simplifying assumptions (all stated to the learner in plain language)

- All the stars are very far away, at rest in the lab, on one ring in the plane of the traveler's motion; each sends out one pure color of 550 nanometres, and each has the same brightness for the lab (the lab's brightness for any star is taken as 1, so the factor is the traveler's brightness in lab-star units).
- The traveler moves at a steady speed through the centre of the ring; only that moment is looked at.
- Brightness means what an instrument facing the star measures, not what an eye reports.
- Only the brightness of each star is shown, not that of any extended object or of the whole sky.

### Not introduced

The "headlight effect" as the name of a moving *source's* beaming (the formula for a moving source differs from this one, and the learner is not told it), the brightness of extended objects (surface brightness), the total light of the sky, the cosmic microwave background's directional warmth, the magnitude scale astronomers use, and the fast object looking rotated (Experiment 10).

---

## Physics Model

### The rule

From Experiment 8, the traveler measures a star's light at the frequency factor `f' ÷ f = (1 + β cos θ) ÷ D`. A beam of light is a stream of photons. The traveler meets photons `f' ÷ f` times as often as the lab, and each photon has energy `h f' = (f' ÷ f) h f`. The energy arriving each second on a surface facing the star therefore changes by the product:

`B' ÷ B = (f' ÷ f)² = ((1 + β cos θ) ÷ D)²`

Written with the traveler's own angle `θ'` for the same star (the same number):

`B' ÷ B = (D ÷ (1 − β cos θ'))²`

The everyday (non-relativistic) result for the same two effects, for an observer moving toward the star, is `(1 + β cos θ)²`, so the relativistic factor is the everyday one divided by `D²`.

(The derivation of "the photons arrive `f' ÷ f` times as often" is not given to the learner, and has **no source check** yet; see "Real-World Facts Used". It is the standard transformation of a plane light wave, and the tests check that the energy route and the angle route agree.)

### Worked example (also for the tutor, with real numbers)

`β = 0.6`, so `D = 0.8`.

- **Straight ahead, `θ = 0°`:** `f' ÷ f = 2.00`, so photons arrive twice as often and each has twice the energy: `B' ÷ B = 2.00 × 2.00 = 4.00`. The star looks four times as bright.
- **The star the lab sees sideways, `θ = 90°`:** `f' ÷ f = 1.25`, `B' ÷ B = 1.25² = 1.5625`, about 1.56. The everyday answer would be 1.00.
- **Straight behind, `θ = 180°`:** `f' ÷ f = 0.50`, `B' ÷ B = 0.25`. The star looks a quarter as bright.
- **The crossing line:** `B' ÷ B = 1` exactly where `f' ÷ f = 1`, so at the same lab angle, `θ = 109.5°` (traveler's angle `70.5°`) at 0.6c, the line of Experiment 8.

### Numbers (computed 2026-10-16; the tests recompute them)

`B' ÷ B` for a lab angle `θ`:

| lab `θ` | `β = 0.3` | `β = 0.6` | `β = 0.9` | `β = 0.99` |
|---|---|---|---|---|
| 0 | 1.857 | 4.000 | 19.000 | 199.0 |
| 30 | 1.744 | 3.608 | 16.665 | 173.4 |
| 60 | 1.453 | 2.641 | 11.066 | 112.3 |
| 90 | 1.099 | 1.563 | 5.263 | 50.25 |
| 120 | 0.794 | 0.766 | 1.592 | 12.82 |
| 150 | 0.602 | 0.361 | 0.256 | 1.022 |
| 180 | 0.538 | 0.250 | 0.053 | 0.005 |

The number of the 24 stars that are brighter for the traveler (`B' ÷ B > 1`) is 13, 15, 17 and 21 at the four speeds, and dimmer 11, 9, 7 and 3: the same counts as the stars shifted toward blue and toward red in Experiment 8, because a factor above 1 for the color is above 1 for the brightness.

The everyday comparison for the tutor (computed): for the lab-sideways star the everyday brightness factor is 1.00 at every speed; the relativistic factor is 1.099, 1.563, 5.263 and 50.25.

### New: a small independent physics module

```typescript
// src/physics/travelerSky.ts (proposed)
export function brightnessFactorOf(labAngleDegrees: number, speed: number): number
// (frequencyFactorOf)², with exact values on the line of travel
export function brightnessFactorFromTravelerAngle(travelerAngleDegrees: number, speed: number): number
// (D ÷ (1 − β cos θ'))², the second form
export function everydayBrightnessFactorOf(labAngleDegrees: number, speed: number): number
// (1 + β cos θ)², for the tutor's comparison
export function runTravelerSky(speed: number, sourceNm = 550): TravelerSkyResult
// the 24 stars, each with lab angle, traveler angle, color factor, wavelength, range, brightness factor;
// counts brighter and dimmer; the crossing angles in both skies; D
```

It reuses `runSky`, `travelerAngleOf` and `rayAsMeasuredByTraveler` from `aberration.ts`, and `frequencyFactorOf`, `wavelengthNm`, `rangeOf`, `runDoppler` and the crossing angles from `dopplerShift.ts`, and invents no new physical assumption. Out-of-range inputs throw `RangeError` (as those modules do).

---

## Learner Controls

1. **The traveler's speed:** four presets, 0.3c, 0.6c, 0.9c, 0.99c (as Experiments 7 and 8).
2. **Run:** gated on both predictions.

Changing the speed clears the predictions (the size of the change depends on it).

---

## Prediction Activity

Draft wording (§28.1). Two questions, in this order, both answered before Run is enabled (the pattern of Experiment 8). Not scored while the learner is predicting; the tutor's explanation marks each as matched or not matched (the pattern the owner chose for Experiment 8).

> **Question 1.** Every star has the same brightness for the lab. The traveler flies through the middle of the ring at the speed you chose. The star straight ahead of the traveler is the one the traveler is flying toward. Compared with the lab's view of that star, does the traveler see it **brighter**, **the same brightness**, or **dimmer**?
>
> **Question 2.** Now take the star that the lab sees exactly sideways: it is neither ahead of the traveler's path nor behind it. Does the traveler see it **brighter**, **the same brightness**, or **dimmer** than the lab sees it?

Right answers: Question 1, brighter; Question 2, brighter, at every speed offered. Question 1 follows from the idea of Experiment 8. Question 2 is the surprise, and tests whether the learner can carry the lesson of Experiment 8 (the color of the sideways star shifted) to brightness. The wording gives no hint of the answer, and both questions ask about direction of change only, not a number.

---

## Experiment Behavior

### Introduction (draft; the owner approves the wording, §28.1)

The rules are those of Experiments 5 to 8 (`CLAUDE.md` §15, §12): every term defined in plain language before it is used, a concept before its formula, a worked example with real numbers after the run, a daily-life example for an idea that is not obvious, nothing the learner is asked to predict revealed in advance, and a collapsed "Words and formulas" panel that gains the formula only after the run.

- **The question.** In Experiment 7 we saw that a traveler and the lab see the same stars in different directions. In Experiment 8 we saw that the colors can differ too. Does the **brightness** of a star differ as well? And what would the traveler's sky look like with all three differences at once?
- **New words, each with an example.**
  - **Brightness:** how much energy the light from a star brings to a surface facing it each second. A brighter star brings more. (Also repeated: frequency, wavelength, nanometres, UV and IR, the shift factor `f' ÷ f`, from Experiment 8, each in one line.)
  - **Photon:** a tiny packet of light. Light from a star reaches you as a stream of photons. A bluer light's photons carry more energy each than a redder light's. (The word was met in Experiment 5; it is repeated here in one sentence.)
  - **The brightness factor `B' ÷ B`:** the brightness the traveler measures divided by the brightness the lab measures for the same star. 2.00 means twice as bright; 0.50 means half as bright.
- **An everyday example that does not reveal the answer** (Decision 5, wording to approve): "How hard it rains on you can depend on whether you stand still, run into the rain or run away from it. The rain has not changed. What reaches you has." The direction of the change is not said.
- **What happens.** The ring of 24 stars is shown as the lab sees it. Then the traveler's sky is built in **three layers**: first where each star is (the direction, as in Experiment 7), then the color of each star (as in Experiment 8), then how bright each star is. When all three layers are on, you are looking at the traveler's whole sky.
- **Your job.** Choose the traveler's speed. Predict the brightness of two stars, as asked. Press Run. You are not graded while predicting; the tutor will compare your predictions with the result afterwards.
- **What we assume.** Every star is a single point sending out one pure color; the stars are very far away and at rest in the lab; the traveler moves at a steady speed; we show a flat slice of the sky; "brightness" is what an instrument facing the star measures, not what an eye reports; and we show each star's own brightness, not the glow of the whole sky.

### Display

Two pictures of the sky, side by side (stacked on a narrow window), on the dark-canvas style of Experiments 7 and 8 and on the same scale: **The lab's sky** (sky blue outline) and **The traveler's sky** (purple outline), with the ring, the traveler at the centre, the direction of travel, the labeled stars, the star we follow, the star straight ahead, the wedges, the UV and IR markers and the crossing line, all as in Experiments 7 and 8. The new element is **brightness, drawn as the size and strength of a soft glow around each star**:

- In the lab's sky every star has the same glow (the lab's brightness, taken as 1).
- In the traveler's sky each star's glow is scaled by its brightness factor: a brighter star has a bigger, stronger glow, a dimmer star a smaller, fainter one. The glow's scale is the same in both pictures, so the learner can compare any two stars. Because the factor ranges from 0.005 to 199 across the speeds, the glow uses a compressed scale, and **the number is always written on the labeled stars** (straight ahead, the star we follow, straight behind) as `×4.00`, so the picture never has to be read by eye alone (§14.2).
- A star shown as a UV or IR marker keeps its marker and has its glow drawn around it, since its brightness is still measured by an instrument.

A **brightness bar** under the pictures (beside the spectrum bar of Experiment 8): a scale of `B' ÷ B` on a logarithmic axis from 0.1 to 100 (a worked reading in the caption explains why a log scale is used), with the lab's mark at 1, and, after the run, marks for the three labeled stars with their factor and the label "off the end" where one lies past either end.

A **"How to read this diagram"** caption beneath, written to the standard of `CLAUDE.md` §14 and in the picture-by-picture style the owner asked for on Experiment 8 (a sentence on who the lab observer and traveler are and what "at the moment the traveler passes through the centre" means; each picture in turn; every drawn element; each term; what appears when, in the order of the three layers; a worked moment with real numbers; and "what to look for"). The caption does not say which way any brightness changes before the run.

### Run

Staged, at a pace the learner can follow (the physics result does not depend on playback speed, §11):

1. The lab's sky appears: 24 stars, one color, one brightness.
2. **Layer 1, direction.** The traveler's sky is built a pair of stars at a time, from straight ahead around to straight behind, in the lab's color and brightness, as in Experiment 7. A label says "Layer 1: direction".
3. **Layer 2, color.** Each star takes the color (or UV/IR marker) the traveler measures, as in Experiment 8. A label says "Layer 2: color".
4. **Layer 3, brightness.** Each star's glow grows or shrinks to its brightness factor, starting from straight ahead. A label says "Layer 3: brightness". The brightness bar's marks, the wedge counts and the crossing line appear.
5. The results table, and then the tutor.

### Results (neutral, then explained by the tutor after the learner has responded)

For the chosen speed: a table of the seven stars of Experiment 7 (lab angle 0° to 180° in steps of 30°) with the traveler's angle, the shift factor `f' ÷ f`, the wavelength and range, and the brightness factor `B' ÷ B`; the number of stars brighter and dimmer than the lab sees them (of the 24); the crossing angle in the traveler's sky; the time dilation factor `D`; and the learner's two predictions, recorded and not marked. Nothing says why.

---

## Expected Observations

- The traveler's sky is **bright ahead and dim behind**, with the brightest star straight ahead and the dimmest straight behind.
- The star the lab sees sideways is **brighter** for the traveler, at every speed, and more so at higher speed (1.10, 1.56, 5.26 and 50.25 times).
- The brightness changes **more than the color**: at 0.6c the star straight ahead has twice the frequency but four times the brightness.
- A star is brighter exactly when it is bluer: the 13, 15, 17 and 21 brighter stars are the same stars as the blueshifted ones of Experiment 8, and the dividing line is the same line.
- The faster the traveler, the more extreme the brightness: at 0.99c the star straight ahead is 199 times as bright, and the star straight behind is about 1/200 as bright.

## Expected Learner Understanding

The learner should be able to say that the brightness of starlight measured by a moving observer depends on the observer's direction of motion: brighter ahead, dimmer behind, and, surprisingly, brighter even at "sideways"; that it changes by the square of the color's factor because the photons arrive more often and each carries more energy; that the stars have not changed; and that direction, color and brightness are three properties of one ray that change together. They should not leave thinking that the picture shows what an eye would see, or that real stars are single points of one pure color.

---

## New Concepts Introduced

**Brightness of a star as an observer measures it**, **the brightness factor `B' ÷ B`**, the idea that **the energy arriving each second depends on two things (how often photons arrive and how much energy each carries)**, and the idea that **the direction, the color and the brightness of a ray are three observer-dependent measurements of one thing**.

## Relationship to Previous Experiments

- **Experiment 7 (aberration):** the same ring, angles and ray; layer 1 of the run is Experiment 7.
- **Experiment 8 (the Doppler effect):** the same factor `f' ÷ f` and the same colors and crossing line; layer 2 of the run is Experiment 8. This experiment squares the factor for brightness (Experiment 8's Decision 1 deferred brightness to here).
- **Experiment 5 (energy, momentum and mass):** the energy of a pulse of light, `E = h f`, and photons.
- **Experiment 3 of the first chapter (time dilation):** the extra factor `1 ÷ D²` in the sideways case is the time dilation factor, applied twice.
- **Experiment 4 (what you see is the past):** unchanged; the stars are far away and at rest, so light travel time does not enter.

## Relationship to Later Experiments

- **Experiment 10 (a fast object looks rotated, proposed):** it uses the directions of Experiment 7 and the light travel time of Experiment 4, together with the shortening of a moving object; it does not need color or brightness.
- **The closing recap** (a section on Experiment 10's page, not an experiment): recaps the group, including seen versus measured.

---

## Required Physics Tests

(For `src/physics/travelerSky.test.ts`; the numbers are recomputed in the tests.)

1. At `β = 0`, `brightnessFactorOf(θ, 0) = 1` for every `θ`.
2. The brightness factor is the square of Experiment 8's `frequencyFactorOf`, at several `θ` and `β`.
3. The two forms agree: `brightnessFactorOf(θ, β)` equals `brightnessFactorFromTravelerAngle(θ', β)` with `θ' = travelerAngleOf(θ, β)`.
4. The energy route agrees: `brightnessFactorOf(θ, β)` equals the square of the `energy` returned by `rayAsMeasuredByTraveler(θ, β)` (for `E = 1`).
5. Straight ahead, `(1 + β) ÷ (1 − β)`; straight behind, `(1 − β) ÷ (1 + β)` (the table's values).
6. At `θ = 90°`, the factor is `1 ÷ D²` (1.099, 1.563, 5.263, 50.25), and the everyday factor is exactly 1.
7. The factor falls steadily as `θ` rises from 0° to 180°, at every `β > 0`.
8. The table of factors above, to a stated tolerance.
9. The counts of stars brighter and dimmer (13/11, 15/9, 17/7, 21/3) equal Experiment 8's counts toward blue and toward red, and the factor equals 1 at Experiment 8's crossing angles.
10. Relativistic factor = everyday factor ÷ `D²`, at every `θ` and `β`.
11. A star is brighter exactly when its color factor is above 1, dimmer exactly when below 1, at every star of the ring and every speed.
12. The symmetry between the stars above and below the line of travel (`θ` and `360° − θ` give the same factor).
13. `RangeError` for `speed < 0` and `speed ≥ 1`, and for a non-finite angle.

---

## AI Tutor Behavior

The same pattern as Experiments 3 to 8 (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, after the learner has responded. The tutor does not invent physics and reports only what the physics module produced. The explanation begins by marking each prediction as matched or not matched (the owner's choice for Experiment 8).

1. **Observe.** "Look at the two pictures, the bars and the table. What do you notice about the brightness of the stars in the lab's sky and in the traveler's sky? Compare it with the colors."
2. **Compare with the predictions.** "You predicted that the star straight ahead would look [brighter / the same / dimmer] and the sideways star [brighter / the same / dimmer]. In this run, the straight-ahead star's brightness factor was [factor] and the sideways star's was [factor]. Comparing that with your predictions, what do you notice?"
3. **Conceptual question.** "The stars have not changed. So why would a star that is neither ahead nor behind look brighter? And why would the brightness change by more than the color did?"
4. **Explanation**, after the learner has responded (the owner's wording to approve):
   0. **Your predictions, marked,** each beside the result.
   1. **What the results show,** in the learner's own numbers (the factors of the three labeled stars; the counts; the crossing angle).
   2. **A daily-life example: rain.** Running into the rain you are hit more often by drops, and each drop hits harder. The rain has not changed. The two effects add up to much more rain on you than from either alone (in the same way, but with different numbers, as the two effects on light).
   3. **The two effects, with simple math.** Light arrives as photons. If the traveler flies toward a star, the photons arrive more often by the factor `f' ÷ f`, and each carries more energy by the factor `f' ÷ f`. At 0.6c, for the star straight ahead, `f' ÷ f = 2.00`: twice as often and twice the energy each, `2.00 × 2.00 = 4.00` times the energy each second. For the star straight behind, `0.50 × 0.50 = 0.25`.
   4. **Why the sideways star is brighter: time dilation twice.** The sideways star has the everyday factor 1.00 for both, and the real factor is `1 ÷ D` for each (`D = 0.8`, so `1.25`), so `1.25 × 1.25 = 1.56`.
   5. **The worked formula,** with the learner's own speed and the sideways star: `B' ÷ B = ((1 + β cos θ) ÷ D)² = (1 ÷ D)²`.
   6. **Direction, color and brightness are one calculation.** The same change of a ray's energy that gave the angle (Experiment 7) gave the color (Experiment 8) and now the brightness. A star is brighter exactly when it is bluer, and the line where blue turns to red is also where brighter turns to dimmer (the dashed line of the picture).
   7. **What was shown and not shown.** Single points of one pure color, a flat slice of the sky, brightness as an instrument measures it and not an eye, no glow of the whole sky and no extended objects.

### Chapter summary (draft, for the owner's review)

Shown below the experiment only after the tutor's explanation. "What you learned": a traveler's whole sky differs from the lab's in three linked ways: the stars are crowded ahead, shifted toward blue ahead and toward red behind, and brighter ahead and dimmer behind, by `((1 + β cos θ) ÷ D)²`: at 0.6c, 4.00 times as bright straight ahead and 0.25 times straight behind. Even the star the lab sees sideways is brighter, by `1 ÷ D²` (1.56 at 0.6c). A star is brighter exactly when it is bluer. The stars have not changed. "What's next": a pointer to Experiment 10 (a fast object looks rotated, not squashed), if the owner approves that experiment's direction (Decision 7).

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| The energy of light is proportional to its frequency, `E = h f`; light arrives as photons | Standard physics; already in Experiments 5 and 8 | Not checked in this session |
| A distant star's brightness measured by an observer moving toward it changes by the square of the Doppler factor (photons arrive more often, each has more energy) | Derived here from the transformation of a plane light wave; checked on 2026-10-16 against two secondary sources: Oikofuge's "The Celestial View From A Relativistic Starship, Part 3" (the energy received varies as η², from the photon energy and the photon rate each changing by η, for point sources) and John Baez's Physics FAQ page on the relativistic spaceship (qualitative: stars in front get brighter, from the rear fainter, because photons arrive more often toward the source) | Checked against secondary sources only; no original paper or textbook |
| The visible range is about 400 to 700 nanometres | Experiment 8's table | Unchecked there too |
| Rain hits you more often and harder when you run into it | General knowledge | Widely stated; used only as a qualitative picture |
| Everything in "Not introduced" (moving-source beaming, the cosmic microwave background's directional warmth) | Not used | Left out because it has no source check |

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **One experiment with three layers, or three experiments.** Default: one experiment, with the run in three layers (direction, then color, then brightness) and brightness as the only new idea. Alternative: a brightness-only experiment and leave the combined picture to the recap.
2. **Predictions about brightness only, or about all three.** Default: two questions about brightness only (straight ahead, then sideways), because direction and color were predicted in Experiments 7 and 8. Alternative: also ask for a prediction about the sideways star's direction or color.
3. **How brightness is drawn.** Default: the size and strength of a glow around each star on a compressed scale, with the number written on the labeled stars, plus a logarithmic brightness bar. Alternative: the size of the dot itself, or a plain number next to every star.
4. **The brightness bar's scale.** Default: logarithmic from 0.1 to 100, with "off the end" for the rest (at 0.99c the factor reaches 199 and 0.005). Alternative: a table only, no bar.
5. **An everyday example in the introduction.** Default: rain on a person who stands still, runs into it or runs away, with the direction of the change not stated. Alternative: none in the introduction, only in the tutor. (Risk: it previews the answer to Question 1.)
6. **Layer toggles after the run.** Default: none; the layers are shown in order during the run only. Alternative: three on/off buttons after the run, to turn color and brightness on and off and compare.
7. **The chapter summary's "What's next".** Default: points to Experiment 10 (a fast object looks rotated, not squashed), now that the owner has chosen the order. Alternative: no pointer. A one-line edit of Experiment 8's "What's next" (now "This group has no further experiment yet.") is also needed, with the owner's approval.
8. **Total light of the sky.** Default: not shown or mentioned (the sum of the stars' factors, 27.6, 44.3, 177 and 1,797 at the four speeds, is a separate idea). Alternative: add it as a result line.
9. **Speed presets.** Default: 0.3c, 0.6c, 0.9c and 0.99c, as in Experiments 7 and 8. Alternative: add 0.1c.
10. **A real example in the tutor.** Default: none (the examples considered have no source check or use a different formula; see "Real-World Facts Used"). Alternative: one, after a source check.
11. **The name "headlight effect".** Default: not used (it names a moving source's beaming, whose formula differs). Alternative: use it after the run, with that caution.
12. **Spacetime diagrams.** Default: none; this experiment is about light arriving at an observer, not events.

---

## Success Criteria

1. The physics module gives, for each speed and lab angle, the brightness factor, and the numbers agree with the table above (to a stated tolerance), with the square of Experiment 8's factor, and with the independent energy route and the traveler-angle form.
2. The learner predicts both questions before the run; Run requires both.
3. The two pictures show the same 24 stars, labeled, with the lab's single brightness and color and the traveler's measured direction, color (or UV and IR marker) and brightness clearly different, and never rely on size or color alone (the numbers are written on the labeled stars).
4. The brightness bar and the crossing line show the contrast between the two pictures and between "sideways" and "where brighter turns to dimmer".
5. The run shows the three layers in order and names each.
6. The results are neutral; the explanation comes only after the learner has responded; the predictions are marked only in the explanation.
7. The introduction and caption define every term and formula, with a worked example and a note of what the formula does not mean, and neither says which way any brightness changes before the learner has predicted and observed (any worked example appears after the run).
8. The experiment never says or draws that the stars change, and says plainly that brightness is what an instrument measures, not an eye.
9. The "Words and formulas" panel lists every term and formula (the formula after the run).
10. A star is brighter exactly when it is bluer, and nothing contradicts Experiments 1 to 8 of this group or the earlier chapters.

---

## Implementation Notes

**Built (2026-10-16), §21 Steps 2 and 3 only:** the physics model (`src/physics/travelerSky.ts`) and its tests (`src/physics/travelerSky.test.ts`: all thirteen required tests, as 16 test cases, with the specification's table written out by hand). Exports: `brightnessFactorOf`, `brightnessFactorFromTravelerAngle`, `everydayBrightnessFactorOf` and `runTravelerSky`, with the types `TravelerSkyStar` and `TravelerSkyResult`. It reuses `frequencyFactorOf`, `frequencyFactorFromTravelerAngle`, `everydayFrequencyFactorOf` and `runDoppler` from `dopplerShift.ts` (which in turn reuse `aberration.ts`), so the three routes to the factor (the lab angle, the traveler's angle, and the energy of the ray from Experiment 5) agree. A mutation check (eight deliberate breaks: a cube instead of a square, no square, the traveler-angle form off by 1%, the everyday factor not squared, counting factor 1 as brighter, counting factor 1 as dimmer, halving the factor, and inverting the factor) was caught by at least one test each (three of them by one test only). **Not built yet:** the interface, introduction, "Words and formulas" panel, pictures, the brightness bar, the two predictions, the three-layer run, results, tutor and chapter summary, and the one-line edit of Experiment 8's "What's next".

Differences from the specification so far: none.

**Step 4, the basic interface (2026-10-16), draft wording for the owner's review:** `src/components/TravelerSkyExperiment.tsx`, registered as chapter 9 of the group in `src/App.tsx` (with the chapter summary from this specification, not yet shown because there is no tutor). It has the introduction, the "Words and formulas" panel (terms only), the speed control (0.3c, 0.6c, 0.9c, 0.99c), the lab's sky (24 stars from `runSky`, each in the 550 nm color with the lab's one glow; the labeled stars, the yellow ring on the star we follow, a dashed white ring on the star straight ahead, and the striped and dotted wedges with their counts), a held place for the traveler's sky, the logarithmic brightness bar (0.1 to 100) with the lab's mark at 1, and the picture-by-picture "How to read this diagram" caption (the style the owner asked for on Experiment 8). The glow scale (`glowRadius`, `glowOpacity`) is already in place for the run. Experiment 8's "What's next" now points to this experiment (Decision 7, approved with the specification). Not built yet: the two predictions, Run, the three-layer traveler's sky, the numbers on the labeled stars, the bar's marks for the traveler's stars, the crossing line, the results, the tutor, the formula with its worked example, progress marks.

Differences from the specification in Step 4, for the owner's approval:
1. **The formula and its worked example are left out of the introduction and the caption** until after the run, as in Experiments 7 and 8: any worked example shows which way a brightness changes, which the predictions ask (§12). The caption's worked moment is a neutral one (reading the bar).
2. **The caption's description of the run and the traveler's sky is written now**, for the later steps (the three layers, the numbers on the labeled stars, the crossing lines), so it describes things that appear only after the run; each is introduced as appearing after Run.
3. **The glow's scale** is a compressed (logarithmic) one, as the specification says, with the exact choice (a factor of 1 gives a middling glow, each factor of ten adds a fixed step) made here; the numbers on the labeled stars give the exact values.
4. **The lab's star color** is drawn as in Experiment 8 (a bright green, a little greener than the yellow-green the text calls it).

**Step 5 and 6, the learner interaction (2026-10-16), draft wording for the owner's review:** the two predictions (the specification's wording, each with Brighter / The same brightness / Dimmer; changing the speed clears both), Run (off until both are made), and the staged run (12 seconds) in three layers, each built in 13 steps from straight ahead to straight behind and named in the picture: Layer 1 puts the stars at the traveler's directions in the lab's color and glow, Layer 2 gives each its measured color (or a hollow UV or IR marker), Layer 3 gives each its measured brightness (the glow). Then the numbers appear on the three labeled stars (such as "×4.00"), the bar gets three marks (straight ahead, the star we follow, straight behind; a factor past either end is drawn just inside that end and says so), and the wedge counts and the crossing lines (with the 90° line) appear. `onComplete` is called when the run ends. Not built yet: the results table, the formula and its worked example, the tutor, the explained mark.

Differences from the specification in Steps 5 and 6, for the owner's approval:
5. **The run lasts 12 seconds**, longer than Experiments 7 and 8's 9, because it has three layers.
6. **The layer name is written in the bottom-left of the traveler's picture** while the run is shown ("Layer 1: direction", and so on) and reads "All three layers on" at the end.
7. **At 0.99c the glow of the star straight ahead is large** (a factor of 199 on the compressed scale) and covers its UV marker; the number written beside it gives the exact value.

**Results (2026-10-16), draft wording for the owner's review:** the neutral results panel after the run (the predictions recorded and not marked there, with a pointer that the tutor's explanation compares them with the result; the seven-star table with the traveler's angle, the color shift factor, the wavelength, the range and the brightness factor; the brighter and dimmer counts beside the blue and red counts; the angle where both factors are exactly 1, in both skies; and `D`), and the formula entry ("The brightness factor formula", with the worked example for 0.6c) in "Words and formulas", added only after the run (checked in Chrome: absent before the run, present after). Factors below 0.1 are written with three decimals so that 0.005 does not show as 0.01. Not built yet: the tutor, the explained mark, and the chapter summary's display.

Difference from the specification, for the owner's approval:
8. **The results panel shows the color shift factor, wavelength and range beside the brightness factor** (the specification lists them as part of the table), and a line repeating Experiment 8's blue and red counts beside the brighter and dimmer counts, so the equal counts can be seen.

**Tutor (2026-10-16), draft wording for the owner's review:** `src/components/TravelerSkyTutor.tsx`, wired into `TravelerSkyExperiment.tsx` (restarting at its first question after each run, and calling `onTutorComplete` at the explanation). Observe, compare with both predictions (the brightness factors of the straight-ahead and sideways stars), the conceptual question, then the explanation: the predictions marked as matched or not matched (at the start, and nowhere earlier), the learner's numbers, the rain example, the two effects with simple math (photons more often, each with more energy, so the factor twice), why the sideways star is brighter (time dilation twice, with the everyday 1.00 beside it), the worked formula, direction, color and brightness as one calculation (brighter exactly when bluer, and the same dividing line), and what was and was not shown. Every number comes from the physics module. No real-world example is used (Decision 10's default). The chapter summary is wired to show after the tutor's explanation (checked in Chrome: it is absent before, and the tutor's three questions reach the explanation and its first paragraph; that the summary itself then appears was not directly confirmed, and is left to the complete-flow test). Not done yet: the complete-flow test across all speeds and predictions, and the final review.

Difference from the specification, for the owner's approval:
9. **The tutor's explanation ends its second part with a remark that the numbers for light are not the rain's** ("the idea of two effects at once is the same"), because the specification's rain example would otherwise suggest the two effects add or multiply exactly as for rain, which was not checked.

**Complete-flow test (2026-10-16), in Chrome:** all four speeds with all nine prediction pairs (36 full runs, from a cleared saved state), each driven end to end through the page. Checked per run: Run is off with no prediction and with one, and on with both; the "Running..." state; the three layers appear in order and are named ("Layer 1: direction", "Layer 2: color", "Layer 3: brightness", then "All three layers on"); the formula entry is absent before the run and present after; the traveler's sky has the right number of UV and IR markers (recomputed independently from the formula); the numbers written on the three labeled stars are right; the seven table rows' color and brightness factors match the formula; the brighter and dimmer counts in the results text; the learner's predictions are recorded and not marked in the results; all three marks are on the brightness bar; nothing is marked and no summary shows before the tutor's explanation; the three tutor steps require a non-empty answer; the explanation marks each prediction correctly as matched or not matched against the real factors; the chapter summary (with its pointer to the next experiment) shows after the explanation; changing the speed clears the predictions and the tutor. All 36 runs passed. The test script reported 18 differences, all at 0.9c, between the table's two-decimal brightness factors (such as 0.26) and the exact values (0.256); each is rounding to two decimals and within 0.0051, so they are a too-tight tolerance in the test script and not a defect, and the script's other checks found nothing. No console errors were looked for in this run. Not checked: narrow windows, browsers other than Chrome, a real learner, and the final review against the specification.

**Final review (2026-10-16), §21 Step 10:** compared with the Success Criteria, the Learning Objectives and the Required Physics Tests. All thirteen required tests are in `travelerSky.test.ts` (16 test cases, checked by eight deliberate breaks of the module); the full suite passes (852 of 852, 55 files). Against the criteria: the module's numbers agree with the table, with the square of Experiment 8's factor and with the energy and traveler-angle routes (1); Run requires both predictions (2); the two pictures show the same 24 stars with the direction, color or UV and IR marker, and glow clearly different, with the numbers written on the labeled stars so size is never the only cue (3); the brightness bar and the crossing line show the contrasts (4); the run shows and names the three layers (5); the results are neutral, the explanation comes after the learner's answers, and the predictions are marked only in the explanation (6); the introduction and caption say nothing about which way a brightness changes before the run, and the formula and its worked example appear only after it (7, 9); no text says the stars change, and the text says brightness is what an instrument measures, not an eye (8); a star is brighter exactly when it is bluer, in the physics tests and in the tutor (10). The only change made in the review: tidying the imports of `travelerSky.ts` (a duplicated import and an unused re-export removed; no change in behavior). Open items: (1) the owner's approval of all learner-facing wording (§28.1), and of differences 1 to 9 above; (2) the brightness formula was checked only against two secondary sources (the table above); (3) the claim, in the tutor's fourth part, that counting per tick of the slower clock raises each effect by `1 ÷ D`, and the rain remark, have no source check; (4) not checked at narrow widths (an attempt to resize the browser window did not take effect, so the layout was not seen narrow), in browsers other than Chrome, or with a real learner; (5) `npm run build` still fails on 25 existing TypeScript errors in other files (none in this experiment's); (6) not committed, and `CLAUDE.md` does not yet describe this experiment.

**Wording approved (2026-10-16):** the owner approved all learner-facing wording (§28.1), including the introduction, both captions, the predictions, the results, the tutor (with its marking of the predictions as matched or not matched) and the chapter summary. The owner has not yet approved differences 1 to 9 above.

**Differences approved (2026-10-16):** the owner approved all nine differences from the specification listed above ("approved"). The specification's header paragraph above still reads as written at approval and is left as it was.
