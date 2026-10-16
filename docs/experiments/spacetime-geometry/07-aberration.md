# Experiment 7 (Spacetime Geometry): Aberration, Why the Sky Bunches Up Ahead of a Fast Traveler

**Status: APPROVED by the owner on 2026-10-16 ("approved, all defaults"), with all thirteen "Decisions Needing Human Review" taken on their defaults.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-16, at the owner's request ("lets do 1,2 and 3 in that order": aberration, then the Doppler effect, then a fast object looking rotated). On the same day, while building, Claude corrected the specification's naming of the time dilation factor: it is `D = √(1 − β²)` as in Experiment 3, not `γ` (the formulas are the same, written with `D`). All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1). Every number marked "computed" was computed by script on 2026-10-16 and must be re-checked by the physics tests before approval of the build.

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". This is the fifth item of the roadmap in `01-the-interval.md` (approved as a direction only: "Aberration. Why the sky bunches up ahead of a fast traveler."). It is the first of the three roadmap items the owner asked for, in this order: aberration (this one), the relativistic Doppler effect (Experiment 8), and a fast object looking rotated (Experiment 9). The numbering here assumes that order; it is not approved.

---

## Overview

Experiment 4 showed that what an observer **sees** differs from what they **measure**, because light takes time to travel. That effect needs no relativity. This experiment adds one that does:

> **Two observers who are moving relative to each other, looking at the same star at the same moment, see the light coming from different directions.**

The situation: a ring of 24 distant stars, all at rest in the lab, spread evenly around the lab's sky (one every 15 degrees). A spaceship flies through the middle of the ring at a steady speed. The lab observer sees the 24 stars evenly spaced. The traveler, looking at the **same light** at the same moment, sees them **crowded toward the direction they are travelling and thinned out behind them**. A star that the lab sees exactly sideways is seen by the traveler **ahead** of sideways. The faster the traveler, the stronger the crowding: at 0.9 of the speed of light, 21 of the 24 stars are in the traveler's forward half of the sky, instead of 11.

Nothing about the stars changes, and no star moves. It is the **direction of the incoming light** that each observer measures, and the two observers measure different directions for the same ray. Both are right. The result comes from the way energy and momentum change between observers (Experiment 5, applied to a pulse of light), and it is the same idea as the slanted light path in the light clock of Experiment 4 of the first chapter.

The learner picks a speed, predicts where the traveler will see the star that the lab sees directly sideways, and runs the experiment. Two pictures of the sky, drawn with the same ring of stars, are compared: the lab's and the traveler's.

Honest limits, stated to the learner and not hidden:

- **This is a flat slice of the sky.** The real sky is a sphere, and the crowding is toward a point (the direction of travel) in all directions around it. The picture shows a ring, which is the sky cut along the line of travel.
- **Only directions are shown.** Brightness and color also change for a fast traveler, which is the next experiment. Nothing here says the stars look brighter or dimmer.
- **The stars are very far away and at rest in the lab,** so there is no parallax and no light-travel-time effect to worry about (Experiment 4).
- **The formula is used, not derived.** One line says where it comes from (Experiment 5's energy and momentum of a pulse of light), with a worked example.

---

## Learning Objective

After this experiment, the learner should understand:

1. **Direction is not the same for every observer.** The direction from which a ray of light arrives depends on how the observer is moving. Two observers moving relative to each other measure different directions for the same ray.
2. For a traveler moving at speed `v`, the angle between a star's direction and the direction of travel is **smaller** than the lab's angle, for every star except the ones dead ahead and dead behind, which do not move. So the stars bunch up **ahead** of the traveler and thin out **behind**.
3. The effect grows with speed. The star the lab sees **sideways** (90 degrees) is seen by the traveler at `arccos(v)`: 72.5 degrees at 0.3c, 53.1 at 0.6c, 25.8 at 0.9c, 8.1 at 0.99c. At speeds near `c`, nearly the whole sky is squeezed into a small circle ahead.
4. The same ray, with the same stars, is described by two observers; neither description is an illusion and neither is "the real direction". (The same stance as the interval and the system's mass: what each observer measures depends on them, and the formula connects the two.)
5. (A short remark.) At low speeds the effect is tiny and follows the everyday idea of rain slanting past a moving car. At speeds near `c` the relativistic result differs from that everyday calculation, which is why it needed relativity.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities, `c = 1`.
- A pulse of light has energy `E` and momentum `pc = E` (Experiment 5). Energy and momentum along the motion change between observers by the same transformation as time and position (Experiment 5; `readingFor` in `src/physics/energyMomentum.ts`); momentum across the motion does not change.
- "Reference frame" (Experiment 2): the lab's and the traveler's.
- The light-clock picture (first chapter, Experiment 4): light going straight across for one observer goes slantwise for the other. Here it is the same fact, for starlight.
- The idea that what is seen is the light that arrives (Experiment 4), with the difference that here the source is far away and at rest, so the light's travel time does not matter.

### What is new

- **Direction angle `θ`:** the angle between the direction **toward a star** and the direction **the traveler is moving**, measured from the direction of travel: 0 degrees is straight ahead, 90 degrees is straight sideways, 180 degrees is straight behind. For the lab, "the direction of travel" means the direction the traveler moves, drawn as an arrow.
- **Aberration:** the change in a star's direction angle between two observers (`θ` for the lab, `θ'` for the traveler).
- **A ring of 24 stars**, evenly spaced in the lab's sky (`θ = 0°, 15°, 30°, … , 345°`).
- **The sky as the lab sees it** and **the sky as the traveler sees it**.
- **A star count in a wedge:** how many of the 24 stars lie within 30 degrees of straight ahead, and within 30 degrees of straight behind, for each observer.

### Simplifying assumptions (all stated to the learner in plain language)

- All the stars are very far away, at rest in the lab, and lie on one ring in the plane of the traveler's motion.
- The traveler moves at a steady speed through the centre of the ring. Only the moment the traveler is at the centre is looked at.
- Only the direction of each star's light is shown. Not its brightness, color or size.
- The traveler and the lab observer are both at the centre of the ring at that moment, so they receive the same rays.

### Not introduced

Brightness (the "headlight effect"), color and the Doppler shift (the next experiment), the apparent shape of an extended object (Experiment 9), parallax, the sky as a full sphere, an accelerating traveler, stars that move, gravity, and the speed of the star's own motion.

---

## Physics Model

### The rule

A ray of starlight reaches the centre of the ring. Take the direction of travel as the `x` axis. For the lab, the star is at angle `θ` from `+x`, so the **ray's energy and momentum** are

`E, p_x c = −E cos θ, p_y c = −E sin θ`

(the ray travels from the star toward the centre, which is opposite to the direction toward the star). A traveler moving at speed `β` (a fraction of `c`) along `+x` measures, by the same transformation as Experiment 5:

`E' = (E − β p_x c) ÷ D = E (1 + β cos θ) ÷ D`
`p_x' c = (p_x c − β E) ÷ D = −E (cos θ + β) ÷ D`
`p_y' c = p_y c = −E sin θ`   (momentum across the motion is unchanged)

where `D = √(1 − β²)` is the time dilation factor of the first chapter (Experiment 3; a number below 1, so dividing by it makes a number larger). The direction toward the star, as the traveler measures it, is opposite to the ray's momentum, so

`cos θ' = −p_x' c ÷ E' = (cos θ + β) ÷ (1 + β cos θ)`
`sin θ' = −p_y' c ÷ E' = D sin θ ÷ (1 + β cos θ)`

The first line is the working formula. (A check: `cos²θ' + sin²θ' = 1`.) The ratio `E' ÷ E = (1 + β cos θ) ÷ D` is how the light's energy changes, which is not shown here and is the subject of Experiment 8.

For stars on the other side of the ring (`180° < θ < 360°`), the same rule applies to the mirror image: `θ'` is `360° − θ'(360° − θ)`.

### Worked example (also for the tutor, with real numbers)

`β = 0.6`, so `D = 0.8`. The star the lab sees sideways: `θ = 90°`, `cos θ = 0`.

`cos θ' = (0 + 0.6) ÷ (1 + 0) = 0.6`, so `θ' = 53.1°`.

The traveler sees that star 53.1 degrees from straight ahead, not 90. The star the lab sees at `θ = 150°` has `cos θ = −0.866`, so `cos θ' = (−0.866 + 0.6) ÷ (1 − 0.520) = −0.554`, `θ' = 123.6°`. A move of 26.4 degrees toward the front for a star that began behind sideways. The star dead ahead, `θ = 0`: `cos θ' = 1.6 ÷ 1.6 = 1`, so `θ' = 0°`. The star dead behind, `θ = 180°`: `cos θ' = (−1 + 0.6) ÷ (1 − 0.6) = −1`, so `θ' = 180°`. Those two do not move.

### Numbers (computed 2026-10-16; the tests recompute them)

The traveler's angle `θ'` for a lab angle `θ`, in degrees:

| lab `θ` | `β = 0.3` | `β = 0.6` | `β = 0.9` | `β = 0.99` |
|---|---|---|---|---|
| 0 | 0.0 | 0.0 | 0.0 | 0.0 |
| 30 | 22.2 | 15.3 | 7.0 | 2.2 |
| 60 | 45.9 | 32.2 | 15.1 | 4.7 |
| 90 | 72.5 | 53.1 | 25.8 | 8.1 |
| 120 | 103.6 | 81.8 | 43.3 | 14.0 |
| 150 | 139.9 | 123.6 | 81.1 | 29.6 |
| 180 | 180.0 | 180.0 | 180.0 | 180.0 |

The lab angle that the traveler sees exactly sideways (`θ' = 90°`) is `arccos(−β)`: 107.5° at 0.3c, 126.9° at 0.6c, 154.2° at 0.9c, 171.9° at 0.99c. So the traveler's forward half of the sky takes in everything the lab sees up to that angle.

Counts for the ring of 24 stars (the lab's even spacing is 11 stars strictly ahead of sideways, 11 strictly behind, and 2 exactly sideways; 5 stars within 30° of straight ahead; 5 within 30° of straight behind):

| | lab | `β = 0.3` | `β = 0.6` | `β = 0.9` | `β = 0.99` |
|---|---|---|---|---|---|
| strictly ahead of sideways (`θ' < 90°`) | 11 | 15 | 17 | 21 | 23 |
| within 30° of straight ahead | 5 | 5 | 7 | 13 | 21 |
| within 30° of straight behind | 5 | 3 | 3 | 1 | 1 |

An everyday comparison for the tutor (computed): if starlight behaved like rain falling at speed 1 past a vehicle moving at speed `β`, a sideways star would be seen at `90° − arctan β` from straight ahead: 73.3° at 0.3c, 59.0° at 0.6c, 48.0° at 0.9c, 45.3° at 0.99c. The relativistic values are 72.5°, 53.1°, 25.8°, 8.1°. They agree to within one degree at 0.3c and differ a great deal at 0.9c and above. (Decision 8.)

### New: a small independent physics module

```typescript
// src/physics/aberration.ts (proposed)
export interface SkyStar {
  labAngle: number         // θ in degrees, 0 ≤ θ < 360, measured from the direction of travel
  travelerAngle: number    // θ' in degrees, same convention
}

export function travelerAngleOf(labAngleDegrees: number, speed: number): number
// cos θ' = (cos θ + β) ÷ (1 + β cos θ), with θ' on the same side (above or below the line of travel) as θ

export function labAngleOf(travelerAngleDegrees: number, speed: number): number
// the inverse, with β replaced by −β

export function runSky(speed: number, starCount = 24): { stars: SkyStar[]; countsLab: WedgeCounts; countsTraveler: WedgeCounts; sidewaysStarAngle: number }
// countsX: { aheadOfSideways, within30OfAhead, within30OfBehind }
```

It uses no new physical assumption. As a check, the module also computes the transformation from the ray's energy and momentum (the three formulas above) and the tests compare it with the closed form, so the two routes to `θ'` agree (test 2). Out-of-range inputs throw `RangeError` (`speed < 0` or `speed ≥ 1`; `starCount < 1`).

### Sign convention and limits

- Angles are measured from the direction of travel, as above. A star below the line of travel is shown mirrored (`360° − θ`), so the picture is symmetric above and below the line.
- `speed = 0` returns the lab's angles unchanged. The learner's presets do not include 0 (Decision 4).
- No experiment preset reaches `β = 1`. At 0.99c the crowding is strong (the sideways star at 8.1°) but the picture is still readable.

---

## Learner Controls

1. **The traveler's speed:** four presets, 0.3c, 0.6c, 0.9c, 0.99c (Decision 4). "0.9c is nine tenths of the speed of light" is defined in the introduction and the caption.
2. **Run:** gated on the prediction.

Changing the speed, or the prediction, returns to the setup; changing the speed clears the prediction, because the right answer's size depends on it (the direction of the shift does not).

---

## Prediction Activity

Draft wording (§28.1):

> **The question.** One star lies exactly sideways from the lab observer's point of view: neither ahead of the traveler's path nor behind it. The traveler flies through the middle of the ring at the speed you chose. Where does the traveler see that star?
>
> (a) Exactly sideways, the same as the lab. (b) Ahead of sideways, nearer the direction of travel. (c) Behind sideways, further from the direction of travel.

Not scored. Run stays disabled until an answer is chosen. The learner is not told which is right. The right answer is (b) at every speed offered. (a) is the natural guess ("a star is where it is"); (c) is the guess that the traveler "leaves the star behind". The prediction concerns the **direction** only, so the learner is not asked to guess an angle.

---

## Experiment Behavior

### Introduction (draft; the owner approves the wording, §28.1)

The rules are those of Experiments 5 and 6 (`CLAUDE.md` §15): every term defined in plain language before use, a concept before its formula, a worked example with real numbers and a note of what the formula does not mean, a daily-life example for ideas that are not obvious, nothing the learner is asked to predict revealed (§12), and a collapsed "Words and formulas" panel.

- **The question.** In Experiment 4 we saw that what you see is not the same as what you measure, because light takes time to arrive. Here is a second difference. Two observers who are moving relative to each other can look at the same star at the same moment and see the light coming from different directions. How different? Does the star seem to be in the same place for both of them?
- **New words, each with an example:**
  - **Direction of travel:** the way the traveler is moving, drawn as an arrow.
  - **The angle `θ` (the Greek letter "theta"):** how far a star is from straight ahead, measured around from the direction of travel. 0 degrees is straight ahead, 90 degrees is exactly sideways (like 3 o'clock on a clock when you face 12), 180 degrees is straight behind. Example: a star at 45 degrees is halfway between straight ahead and sideways.
  - **Speed written as `0.6c`:** a fraction of the speed of light, `c`. 0.6c is six tenths of the speed of light. (As in the earlier experiments.)
  - **Aberration:** the change in the direction a star seems to be in when the observer moves. (The word is defined here and the learner is not told which way it goes.)
- **A daily-life example that does not reveal the answer:** "Stand on a spot and point at a distant tree. Walk sideways and point again. The tree is in the same direction for any reasonable walk, because it is so far away." The intent: for stars, distance is not the issue, only speed relative to light.
  *Owner decision (9):* whether to use this one, or to give the daily-life example only in the tutor, after the prediction.
- **Formulas needed here, in words, with a worked example:**
  - The rule in words: "the star's angle for the traveler is worked out from the lab's angle and the traveler's speed." The formula `cos θ' = (cos θ + β) ÷ (1 + β cos θ)`, with `cos` explained as "a number between −1 and 1 that tells you how far ahead (1) or behind (−1) a direction is". A worked example: `β = 0.6` and `θ = 90°`. *What it does not mean:* the star has not moved. Only the traveler's measurement of its direction has changed.
  - "Where it comes from" (one sentence, optional, Decision 7): it follows from how a ray's energy and momentum change between observers, the same change as in Experiment 5.
- **What happens.** A ring of 24 stars is shown, evenly spaced, as the lab sees them. The traveler flies through the middle. Then the same stars are shown as the traveler sees them.
- **Your job.** Choose the speed, predict where the traveler will see the star that the lab sees exactly sideways, and press Run. You are not graded. Run stays off until you choose a prediction.
- **What we assume.** The stars are very far away and at rest in the lab; the traveler moves at a steady speed; we show a flat slice of the sky along the line of travel; only directions are shown.

### Display

Two circular pictures of the sky, side by side (stacked on a narrow window), on the dark-canvas style of the earlier experiments, on the same scale:

1. **"The lab's sky" (sky blue).** A ring with 24 dots at the lab's angles. An arrow through the centre marked "the traveler's direction of travel". Four stars are labeled directly on the canvas: "straight ahead (0°)", "sideways (90°)" (both sideways stars, top and bottom), "straight behind (180°)". The sideways star the prediction is about is outlined.
2. **"The traveler's sky" (purple).** The same ring with the same 24 stars at the traveler's angles, the same arrow marked "the direction of travel", and the same four labeled stars. The tracked star keeps its outline, so the learner can find it in both pictures.
3. **The wedges.** In each picture the forward wedge (within 30 degrees of straight ahead) and the backward wedge (within 30 degrees of straight behind) are shaded with a **fill pattern** and not by color alone (§14.2), and the number of stars in each wedge is written beside it.
4. **A third picture, after the run:** a pair of bars per wedge, lab against traveler, so that the change in the counts is a visible contrast, and the tracked star's angle written under each picture ("lab: 90°, traveler: 53.1°").

A "How to read this diagram" caption beneath, written to the standard of `CLAUDE.md` §14 (detailed, plain words, short sections or lists): name each picture and whose view it is and when it appears; list every drawn element (the ring, each dot, the arrow, the labels, each shaded wedge and its pattern, each bar, each angle number); define degrees, `θ`, `c` and "0.6c"; a worked moment with real numbers (the `β = 0.6`, `θ = 90°` case, and the `θ = 150°` case); and a "what to look for" list (is the pattern of dots the same in both pictures? where are the dots crowded? which two dots do not move?). The caption does not say which way the dots move before the run.

### Run

Staged, at a pace the learner can follow (the physics result does not depend on playback speed, §11):

1. The lab's sky appears: 24 stars evenly spaced, with the wedges counted. A small spaceship icon sits at the centre, pointing along the arrow.
2. The traveler passes through the centre at the chosen speed (the spaceship icon moves through the centre of the lab's picture).
3. The traveler's sky is built up star by star, from straight ahead around to straight behind, one star every fraction of a second. For each star, a short ray is drawn from the star to the centre in both pictures, so the learner sees the same ray at two angles. (The dots do not slide from one place to another: that would suggest the stars move, which is not what happens. Decision 6.)
4. The wedge counts and the bars appear.
5. The results table appears, and then the tutor.

### Results (neutral, then explained by the tutor after the learner has responded)

For the chosen speed: a table with a row for each of seven stars (lab angle 0°, 30°, 60°, 90°, 120°, 150°, 180°), the lab's angle and the traveler's angle, and the change; the three counts (strictly ahead of sideways, within 30° ahead, within 30° behind) for the lab and the traveler; the time dilation factor `D` for the chosen speed; and the learner's prediction, recorded and not marked. Nothing says which way the stars "moved" and nothing is explained here.

---

## Expected Observations

- The two pictures show the same 24 stars, evenly spaced in one and crowded forward in the other.
- Straight ahead and straight behind do not move; everything in between moves toward the front; the sideways star moves most.
- The faster the traveler, the stronger the crowding. At 0.99c nearly the whole sky is within a small circle ahead.
- The number of stars within 30 degrees ahead grows with speed (5, 5, 7, 13, 21 at lab, 0.3c, 0.6c, 0.9c, 0.99c), and the number within 30 degrees behind shrinks (5, 3, 3, 1, 1).

## Expected Learner Understanding

The learner should be able to say that two observers moving relative to each other see the same star in different directions, that the traveler sees the stars crowded toward the direction of travel, that it grows with speed, and that the stars have not moved: it is the direction of the incoming light, as each observer measures it, that differs. They should not leave thinking that the stars' brightness or color has been shown.

---

## New Concepts Introduced

**Direction of travel**, **angle `θ`**, **aberration**, and the idea that the direction of a ray of light is an observer-dependent measurement.

## Relationship to Previous Experiments

- **Experiment 4 (what you see is the past):** that was about *when* light left; this is about *which way* it arrives. Experiment 4 said aberration was "a later experiment".
- **Experiment 5 (energy, momentum and mass):** the angle formula follows from the transformation of a ray's energy and momentum (the ray is a pulse of light with `pc = E`).
- **The first chapter's light clock (Experiment 4 there):** light that goes straight across for one observer goes at a slant for the other. Aberration is that fact for starlight: a star at 90 degrees for the lab is at `arccos β` for the traveler, which is the slant in the light clock.
- **The time dilation factor `D`:** used in the formula for `sin θ'` and named as in Experiment 3.

## Relationship to Later Experiments

- **Experiment 8 (the Doppler effect, proposed):** the same rule also gives `E' ÷ E = (1 + β cos θ) ÷ D`, the change in the light's energy, so it is the change in color and brightness that depends on direction. This experiment deliberately shows only direction.
- **Experiment 9 (a fast object looks rotated, proposed):** a fast object's apparent rotation comes from aberration (the directions of light from its different parts change) together with the light-travel-time effect of Experiment 4.

---

## Required Physics Tests

(For `src/physics/aberration.test.ts`; the numbers are recomputed in the tests.)

1. At `β = 0`, `travelerAngleOf(θ, 0) = θ` for every `θ`.
2. The closed form agrees with the energy-and-momentum route (the three transformed components give the same `θ'`) for several `θ` and `β`.
3. `θ = 0` and `θ = 180` do not change, at every `β`.
4. For `0 < θ < 180` and `β > 0`, `θ' < θ`, and `θ'` rises steadily as `θ` rises (at each `β`), so the order of the stars around the ring never changes.
5. `θ' = arccos(β)` for `θ = 90` (the table's 72.5, 53.1, 25.8, 8.1).
6. The table of `θ'` values above, to a stated tolerance.
7. Round trip: `labAngleOf(travelerAngleOf(θ, β), β) = θ`.
8. Symmetry: `θ' (360 − θ) = 360 − θ' (θ)`.
9. The counts of the 24-star ring (the second table), including the lab's 5, 5 and 11.
10. The angle `arccos(−β)` that the traveler sees at 90 degrees.
11. `sin² θ' + cos² θ' = 1` and `E'` positive for all `θ` and `β` offered.
12. `RangeError` for `speed < 0`, `speed ≥ 1`, and `starCount < 1`.
13. The everyday-rain comparison values in the tutor (73.3, 59.0, 48.0, 45.3).

---

## AI Tutor Behavior

The tutor follows the same pattern as Experiments 3 to 6 (`CLAUDE.md` §13): **observe, compare with the prediction, a conceptual question, then the explanation**, after the learner has responded. The tutor does not invent physics and reports only what the physics module produced.

1. **Observe.** "Look at the two pictures and the table. What do you notice about where the stars are, in the lab's sky and in the traveler's sky?"
2. **Compare with the prediction.** "You predicted that the traveler would see the sideways star [exactly sideways / ahead of sideways / behind sideways]. In this run it was at [53.1°] for the traveler and 90° for the lab. Comparing that with your prediction, what do you notice?" (The reply is not marked right or wrong; nothing is said about the stars in general yet.)
3. **Conceptual question.** "The stars did not move. So what changed?"
4. **Explanation**, after the learner has responded (the owner's wording to approve):
   1. **What the results show,** in the learner's own numbers (the sideways star's two angles; the counts; the stars that did not move).
   2. **What changed.** Each observer measures the direction of the incoming light. A moving observer is "running into" the starlight a little, so the light's direction, as they measure it, is tilted toward the way they are going. The stars are where they were.
   3. **A daily-life example, with simple math.** Rain falling straight down seems to slant toward you when you drive through it, and the faster you drive, the more it slants. If rain falls at 10 metres per second and you drive at 10 metres per second, it seems to come in at 45 degrees. Starlight does the same thing, with the speed of light in place of the rain's speed. At low speeds the numbers are nearly the same: at 0.3c the rain rule puts the sideways star at 73.3° and the real answer is 72.5°. At 0.9c the rain rule says 48.0° and the real answer is 25.8°, because the way speeds and times behave near `c` (Experiments 3 to 5) is not the rain's.
   4. **The worked formula,** with the learner's own speed and the sideways star: `cos θ' = (0 + β) ÷ (1 + 0) = β`. At 0.6c, `θ' = arccos 0.6 = 53.1°`.
   5. **Why two stars do not move.** Straight ahead and straight behind are along the line of travel, so there is no sideways motion to tilt the light.
   6. **The light-clock link.** In the light clock of the first chapter, a ray that went straight across for one observer was slanted for the other. Starlight arriving sideways for the lab is slanted for the traveler in exactly the same way.
   7. **A real example.** Earth moves around the Sun at about 30 kilometres per second, one ten-thousandth of the speed of light. Astronomers see every star trace a tiny ellipse each year because of it, at most about 20 arcseconds (a 180th of a degree), and the effect was discovered in 1727 by James Bradley. (An arcsecond is 1/3600 of a degree.)
   8. **What was shown and not shown.** Directions only; a flat slice of the sky; not brightness or colour. "The next experiment asks what happens to the colour."

### Chapter summary (draft, for the owner's review)

Shown below the experiment only after the tutor's explanation. "What you learned": two observers who move relative to each other measure different directions for the same ray of light, so a traveler sees the stars crowded toward the direction of travel and thinned out behind, and the faster the traveler, the stronger the crowding: for the star the lab sees sideways, the traveler sees it at 72.5 degrees at 0.3c, 53.1 degrees at 0.6c and 25.8 degrees at 0.9c. The two stars straight ahead and straight behind do not move. The stars themselves have not moved; it is the direction of the light, as each observer measures it, that differs. "What's next": "You saw only the direction of the light. Its colour and brightness change too, which the next experiment shows."

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| Stellar aberration was discovered by James Bradley in 1727 while he was looking for stellar parallax | Britannica; MacTutor biography (search results) | Confirmed by search, 2026-10-16 |
| The constant of aberration is 20.49551 arcseconds, set by the ratio of Earth's orbital speed to the speed of light | Britannica "constant of aberration" (search result) | Confirmed by search, 2026-10-16 |
| Earth's orbital speed is about 29.78 kilometres per second; `29.78 ÷ 299,792.458` radians is about 20.49 arcseconds | | The ratio is **computed** by Claude; the speed was not confirmed in the search results. The tutor should say "about 30 kilometres per second" |
| Each star traces a small ellipse each year because of aberration | General statement, in the search results' summary | Not separately checked. The tutor should say it as general knowledge |
| An arcsecond is 1/3600 of a degree; 20 arcseconds is a 180th of a degree | Arithmetic | Computed |
| The formula `cos θ' = (cos θ + β) ÷ (1 + β cos θ)` | Standard relativistic aberration; derived here from the transformation of a ray's energy and momentum (checked by the tests' second route) | Derived; no source was consulted for the formula itself |
| The rain comparison values (73.3°, 59.0°, 48.0°, 45.3°) | | Computed by Claude from `90° − arctan β` |

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **The order.** Default: aberration, then the Doppler effect, then the rotated object (as the owner asked). Aberration comes first because Experiment 8 and 9 both use it.
2. **A flat slice of the sky (a ring), not the whole sphere.** Default: a ring of stars in the plane of motion, with the limit stated. Alternative: a sphere shown in 3-D (much more work, and no new physics).
3. **24 stars, 15 degrees apart.** Default: 24. Alternative: 12 (clearer dots, a rougher picture) or 36.
4. **Speed presets 0.3c, 0.6c, 0.9c, 0.99c.** Default: those four. Alternative: add 0.1c or 0.5c.
5. **The prediction.** Default: where the traveler sees the star the lab sees sideways (a direction only, three answers). Alternative: how the stars will be spread overall ("evenly / crowded ahead / crowded behind"), which is closer to the experiment's title but easier to guess.
6. **The run shows the same ray at two angles, and the dots do not slide.** Default: no sliding, to avoid suggesting the stars move. Alternative: a slow slide with a label saying the stars are not moving.
7. **The formula's origin.** Default: one optional sentence ("it follows from how a ray's energy and momentum change between observers, as in Experiment 5") with the formula given and a worked example. Alternative: a full derivation (long) or no origin.
8. **The rain comparison in the tutor.** Default: yes, a daily-life example and a short comparison of the numbers. Risk: the learner may take the rain rule to be the real rule. The tutor says it is not, and the two are shown side by side. Alternative: the rain example without the comparison.
9. **The introduction's daily-life example.** Default: none in the introduction, because anything that previews the direction of the shift reveals the answer (§12); the rain example is given only after the prediction. Alternative: add a neutral "distant tree" example.
10. **Real example (Bradley, 1727, 20 arcseconds).** Default: yes, in the tutor, with the sources above. Alternative: leave it out.
11. **Progress marks and chapter summary.** Default: as in Experiment 4: `completed` when the run ends, `explained` when the tutor reaches its explanation, a summary after that.
12. **Spacetime diagrams.** Default: none; this experiment is about directions in space, not events. Alternative: add a small spacetime diagram of the ray's path.
13. **Wording of "not moved".** The experiment says plainly that the stars have not moved. Default: yes. (The first draft of the tutor says "running into the starlight" in a plain-language sentence; the owner may prefer to remove it as too loose a picture.)

---

## Success Criteria

1. The physics module gives, for each speed and lab angle, the traveler's angle, and the numbers agree with the tables above (to a stated tolerance) and with the independent energy-and-momentum route.
2. The learner predicts before the run; Run requires a prediction.
3. The two pictures show the same 24 stars, labeled, in clearly different treatments (colour and a pattern) for the lab's and the traveler's view; the four labeled stars and the tracked star can be found in both.
4. The wedges and counts show the contrast between the two pictures without relying on colour alone.
5. The results are neutral; the explanation comes only after the learner responds.
6. The introduction and caption define every term and every formula, with a worked example and a note of what the formula does not mean, and neither says which way the stars shift before the learner has predicted and observed.
7. The experiment never says or draws that the stars move, never shows brightness or color as changed, and says plainly that only directions are shown.
8. The Words and formulas panel lists every term and formula.
9. Nothing in it contradicts Experiments 1 to 6 of this group, or the first chapter's Experiments 1 to 11.

---

## Implementation Notes

**Built (2026-10-16), §21 Steps 2 and 3 only:** the physics model (`src/physics/aberration.ts`) and its tests (`src/physics/aberration.test.ts`: all thirteen required tests, as 26 test cases, with the specification's tables written out by hand). Exports: `travelerAngleOf`, `labAngleOf`, `rayAsMeasuredByTraveler` (the energy-and-momentum route, using `readingFor` and `makeReading` from `energyMomentum.ts`), `runSky`, `wedgeCounts`, `angleFromAhead` and `rainRuleSidewaysAngle`. The angle is computed as `atan2(D sin θ, cos θ + β)`, which equals the closed form (both have the same positive denominator) and is exact on the line of travel; the tests compare it against an independent `acos` form and against the momentum route. A mutation check (eight deliberate breaks: the sign of the speed, no `D`, `D` inverted, the inverse with the wrong sign, a 35-degree wedge, a sideways star counted as ahead, the rain rule with `arcsin`, and a changed momentum across the motion) was caught by at least one test each (the 35-degree wedge by one test only, the table of counts). **Not built at that point:** the interface, introduction, "Words and formulas" panel, pictures, prediction, results, tutor and chapter summary. The specification's naming of the time dilation factor was corrected from `γ` to `D = √(1 − β²)` (Experiment 3's factor) while building.

**Step 4, the basic interface (2026-10-16), draft wording for the owner's review:** `src/components/AberrationExperiment.tsx`, registered as chapter 7 of the group in `src/App.tsx` (with the chapter summary from this specification, not yet shown because there is no tutor). It has the introduction, the "Words and formulas" panel (terms only), the speed control (0.3c, 0.6c, 0.9c, 0.99c), the lab's sky (24 stars from `runSky`, labeled stars, the yellow ring on the star we follow, the striped and dotted wedges with their counts), a held place for the traveler's sky, and the "How to read this diagram" caption. Not built yet: Run, the traveler's sky, the prediction, the results, the tutor, the formula with its worked example, progress marks.

**Differences from the specification in Step 4, for the owner's approval:**
1. **The formula and its worked example are left out of the introduction and the caption** until after the run. The specification puts a worked example (`β = 0.6`, `θ = 90°` and `θ = 150°`) in the introduction and the caption, but any worked example of the formula shows which way a star's direction changes, which is what the prediction asks (§12, and Success Criterion 6 of this specification). They are to appear after the learner has predicted and run (the results panel and tutor), and the "Words and formulas" panel gains the formula then.
2. **The introduction's question is worded neutrally** ("do they see it in the same direction, or does motion change it, and if so, which way?"), instead of saying the two observers "see the light coming from different directions", which would rule out prediction answer (a).
3. **The caption's worked moment** is a neutral one (reading an angle: the star at 45 degrees), and its "what to look for" list asks questions without saying which way the stars shift.
4. **The previous experiment's "What's next"** (Experiment 6, in `src/App.tsx`) now points to this experiment, replacing "This group has no further experiment yet" (the same kind of fix as for Experiments 4 and 5; the wording is a draft, because Experiment 6's wording was approved).

**Steps 5 to 8 (2026-10-16), draft wording for the owner's review:** the prediction (three answers, cleared when the speed changes) that gates Run; the staged run (the traveler's icon flies in, the traveler's sky is built a pair of stars at a time with the same ray drawn at its two angles in both pictures, then the traveler's wedge counts appear; 9 seconds, the physics does not depend on it); the results panel (the prediction recorded and not marked, the followed star's two angles, a table of seven stars with the change, a table of the three counts, a pair of bars for each count, and D); the tutor (`AberrationTutor.tsx`: observe, compare, one conceptual question, then an eight-part explanation); the formula entry in "Words and formulas" (added only after a run has ended); and the progress marks and chapter summary.

**Complete-flow test (Chrome, 2026-10-16):** all four speeds with all three predictions (12 runs, 33 checks per speed): Run disabled without a prediction, the 24 stars drawn in both pictures, the followed star's traveler angle (72.5, 53.1, 25.8, 8.1), the traveler's wedge counts (5 and 3, 7 and 3, 13 and 1, 21 and 1), D (0.954, 0.800, 0.436, 0.141), the formula entry appearing only after a run, the chapter summary hidden until the tutor's explanation, the explanation's numbers, and the prediction cleared by a speed change. All passed. Not checked: narrow widths, browsers other than Chrome, a real learner.

**Differences from the specification in Steps 5 to 8, for the owner's approval:**
5. The followed star's label sits in the top-right corner with a leader line (and the other sideways star's at the bottom right), in both pictures, because at high speeds the followed star lies next to the "straight ahead" label.
6. The results add a "Change" column (traveler's angle minus the lab's) and a counts table with the same three counts as the bars; the bars use the lab's solid fill and the traveler's striped fill.
7. The traveler's icon flies in during the first 15% of the run, a stage the specification describes only as "the spaceship icon moves through the centre".
8. The tutor keeps the specification's "running into the starlight" sentence (Decision 13) as drafted.

**Final review (2026-10-16):** compared against this specification's Success Criteria, `docs/PROJECT.md`'s prediction, experiment, observation, explanation sequence, and `CLAUDE.md` §12, §14 and §15. Findings, all fixed: the rays had no label on the canvas (§14.1), so "arrows in: rays of starlight" was added to both pictures while rays are shown; and the bars' note referred to a "full width" that is not drawn, so the clause was removed. A text scan found no sentence that says or implies the stars move (Criterion 7). Known gaps, not fixed: Criterion 6 asks for the formula and a worked example in the introduction and caption, which were deliberately moved to after the run (difference 1 of Step 4); there is no lint configuration in the project, so lint was not run; narrow widths, browsers other than Chrome and a real learner were not checked; Earth's orbital speed (about 30 km/s) has no source check. 812 tests pass.
