# Experiment 10 (Spacetime Geometry): A Fast Object Looks Rotated, Not Squashed

**Status: APPROVED by the owner on 2026-10-16 ("approve", read as approving the specification with all thirteen "Decisions Needing Human Review" on their defaults; Claude should say so if the owner meant otherwise). Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-16, at the owner's direction. Built, tested, complete-flow tested and finally reviewed 2026-10-16, and its wording approved the same day (see "Implementation Notes"). The owner chose this plan on 2026-10-16: Experiment 9 (the traveler's whole sky, built), then this experiment, then a closing "putting it all together" recap of the whole group, as a section on this experiment's page (not an experiment, no predictions, no new physics; at most a sentence or two on why pushing harder gives less speed). All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1). Every number marked "computed" was computed by script on 2026-10-16 and must be re-checked by the physics tests before the build is approved.**

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". This is the tenth and last experiment planned for the group. It is the roadmap's closing item in `01-the-interval.md` ("A fast object looks rotated, not squashed"), and the owner's third item after aberration (Experiment 7) and the Doppler effect (Experiment 8). It follows Experiment 9, which finished the traveler's view of the stars (direction, color, brightness).

---

## Overview

The first chapter showed that a moving object is **shorter along its direction of motion**, as the lab measures it (length contraction, Experiment 6). Experiment 4 of this group showed that **what you see is not the same as what you measure**, because light takes time to travel. This experiment puts the two together on one question:

> **If a cube flies past a camera at a speed close to the speed of light, will a photograph of it show a cube squashed along its motion?**

The natural answer is yes: the lab's ruler says the cube is shorter along its motion, so the photograph should show a squashed cube. The surprising answer is **no**:

> **The photograph shows a cube that looks turned, as if it had been rotated, and not squashed. The camera can even see the cube's trailing face, the face that points away from the direction of motion.**

The reason is the one of Experiment 4. A photograph records the light that arrives at the camera at one moment. Light from the far side of the cube has farther to go than light from the near side, so it left **earlier**, when the cube was **farther back**. The cube moves on while that light travels, so the far side appears to lag behind the near side. That lag exactly changes what the contraction would do: the front face is shorter (the contraction, measured by the lab), and the lag adds a view of the trailing face next to it. Together they match what a cube turned by an angle would show, where **`sin θ = β`** (the speed as a fraction of the speed of light).

The learner picks a speed, predicts what the photograph shows (squashed, the same, stretched or turned) and which faces the camera can see, and runs the experiment. Pictures show the cube as the lab measures it, where the light from each part left from, and the photograph, side by side with a photograph of the same cube at rest and with a photograph of a cube at rest turned by the matching angle.

No new physical law is used. The two ingredients, the travel time of light and the contraction, are both already in the project.

Honest limits, stated to the learner and not hidden:

- **The camera is far away and looks straight across the cube's path,** and its shutter is instant. A camera that is close, or looking along the path, would show different distortions. (Terrell and Penrose's result needs the small-angle idea. Stated in the specification's notes, and in one plain sentence to the learner.)
- **The cube is not really turned.** It is the same cube, moving in a straight line. Only the photograph looks as if it were turned.
- **A flat slice.** The cube is shown from above (its plan, a square) and as the flat photograph it makes, with its height not changing.
- **Only the shape is shown,** not the colors or brightness (Experiments 8 and 9).
- **The photograph is not what an eye would see.** An eye does not take an instant snapshot. This experiment is about one frozen moment, as in Experiments 7 to 9.
- **The formulas are used, not derived at length.** The two widths come from a short counting argument given with real numbers; the rotation angle is checked against it.

---

## Learning Objective

After this experiment, the learner should understand:

1. **What a camera records is the light that arrives at one moment.** Light from the far side of an object left earlier than light from the near side. (Experiment 4's idea, now applied to the parts of one object.)
2. **A moving object's far side appears to lag behind its near side,** by the speed times the extra distance the light travels. For a cube of side `L` seen from the side, the far side's light left `L ÷ c` earlier, in which time the cube moved `β L`.
3. **The lag lets the camera see the trailing face,** of width `β L`, beside the **front face, which is contracted** to `D L` (`D = √(1 − β²)`, the time dilation factor of Experiment 3, which is also the contraction factor of Experiment 6).
4. **The result looks exactly like the same cube at rest, turned by an angle `θ`,** with `cos θ = D` and `sin θ = β` (`θ = 17.5°`, 36.9°, 64.2° and 81.9° at 0.3c, 0.6c, 0.9c and 0.99c). The cube is not turned; its photograph looks as though it were.
5. **Length contraction is still real as a measurement** (the lab's ruler, at one lab time, finds the cube shorter), **but it is not what a photograph shows.** "Measured" and "seen" are different questions (Experiment 4), and both answers are right.
6. **The photograph is not squashed, and it is wider than the cube at rest** at every speed offered (1.25, 1.40, 1.34 and 1.13 times the cube's side). (A short remark: it is widest, 1.41 times, at about 0.71c, the speed at which the cube looks turned by 45 degrees.)
7. (A short remark, with a source.) A moving **sphere** keeps its round outline in the photograph; the effect was found independently by Terrell and by Penrose in 1959.

---

## Physical Situation

### Reused

- Flat spacetime, constant velocity, `c = 1`; the speed `β` and the time dilation factor `D = √(1 − β²)` (Experiment 3, `timeDilationFactorFor`).
- **Length contraction** (Experiment 6 of the first chapter): at one lab time, the lab measures a moving object's length along its motion as `D` times its length at rest. Only the length along the motion changes.
- **What you see is the light that arrives** (Experiment 4 of this group): light from a point left it earlier by its travel time, and the point moved on in the meantime. Here the distance is different for different parts of one object.
- **The Lorentz transformation** (`src/physics/lorentzTransform.ts`), to build the lab's measured cube from the cube at rest, as a check in the tests.
- **A pulse of light travels at `c`** and the idea of a frozen instant of looking (Experiments 7 to 9).

### What is new

- **A cube** of side `L` (a rest length) moving at a steady speed `β` in a straight line, with a **camera** far away on one side of its path, looking straight across it, at the moment the cube is exactly opposite the camera.
- **The faces of the cube,** named for the learner by what they point toward: the **front face** (toward the camera), the **back face** (away from the camera), the **leading face** (in the direction of motion) and the **trailing face** (away from the direction of motion).
- **The photograph:** the flat picture the camera records of the light arriving at it at one instant.
- **The extra distance and the lag:** a part of the cube that is farther from the camera by `d` sends its light `d ÷ c` earlier, and during that time the cube moves `β d`, so that part appears `β d` behind where the near part is.
- **"Looks turned":** the photograph of the moving cube has the same widths as the photograph of a cube at rest turned by an angle `θ`.

### Simplifying assumptions (all stated to the learner in plain language)

- The camera is very far away, so the light reaching it from all parts of the cube travels along parallel lines, and the cube's size is small compared with its distance from the camera.
- The camera looks straight across the cube's path (perpendicular to the motion), with an instant shutter, at the moment the cube is opposite it.
- The cube's side is `L`, its edges are along and across the motion, and the camera sees it from the side (a flat slice: the cube's plan is a square, and its height does not change).
- Constant speed, no gravity, no acceleration.
- Only the shape is shown, not the color or brightness.

### Not introduced

A camera that is near the path or looking along it (different, larger distortions), shapes other than the cube (the sphere appears once, in the tutor), the Lorentz transformation as a formula shown to the learner, the name "Terrell rotation" or "Terrell-Penrose effect" before the run (Decision 8), what a human eye sees, and the motion of the photograph over time (this is a single frozen moment).

---

## Physics Model

### The rule

Put the cube's side along the motion as `L`, and its depth (toward the camera) as `L`. At the instant of the photograph, in the lab:

- **The front face's width, as measured by the lab at one lab time, is `D L`** (length contraction, Experiment 6). Its depth does not change.
- **Light from the back face had `L` more distance to travel** to the camera than light from the front face (the camera is far away, so all rays are parallel), and so it **left `L ÷ c` earlier**. In that time the cube moved `β L`. So in the photograph the back face's trailing edge is `β L` **behind** the front face's trailing edge, and the camera sees the **trailing face** with an apparent width of `β L`.
- **The photograph's total width** is the front face plus the trailing face: `W = L (D + β)`.

The same photograph as a cube **at rest** turned by the angle `θ`: the front face appears with width `L cos θ` and the side face with width `L sin θ`, so the two agree when `cos θ = D` and `sin θ = β`. This is possible because `D² + β² = 1`. So `θ = arcsin β`.

The leading face is not seen (it points away from where the extra light comes from), and the back face is hidden behind the front face.

### Worked example (also for the tutor, with real numbers)

`β = 0.6`, so `D = 0.8`, and the cube's side is `L = 1` (take a cube whose side at rest is 1).

- The lab measures the front face at `D L = 0.8`: shorter, as in Experiment 6.
- The light from the back face had one more unit of distance to travel, so it left 1 unit of time earlier (in units where `c = 1`). The cube moves `0.6 × 1 = 0.6` in that time. So the trailing face appears with width `0.6`.
- The photograph is `0.8 + 0.6 = 1.4` wide. The cube at rest would be 1.0 wide. So the photograph is **wider** than the cube at rest and not squashed.
- A cube at rest turned by `θ = arcsin 0.6 = 36.9°` shows a front face `cos 36.9° = 0.8` wide and a side face `sin 36.9° = 0.6` wide: the same two numbers.

### Numbers (computed 2026-10-16; the tests recompute them)

| `β` | `D` (front face, `L = 1`) | trailing face `β L` | photograph width `L (D + β)` | matching turn `θ = arcsin β` |
|---|---|---|---|---|
| 0.3 | 0.954 | 0.300 | 1.254 | 17.46° |
| 0.6 | 0.800 | 0.600 | 1.400 | 36.87° |
| 0.9 | 0.436 | 0.900 | 1.336 | 64.16° |
| 0.99 | 0.141 | 0.990 | 1.131 | 81.89° |

The photograph is widest, at `√2 L = 1.414 L`, at `β = 1 ÷ √2 = 0.707`, where `θ = 45°`. **For a sphere** of radius `R`: the lab measures the contracted ellipse (semi-axes `D R` along the motion and `R` across), the same lag shears it, and the outline is again a circle of radius `√(D² R² + β² R²) = R` at every speed (the tests check this).

### New: a small independent physics module

```typescript
// src/physics/rotatedObject.ts (proposed)
export function frontFaceWidth(speed: number, side = 1): number
// D × L, the lab's measured (contracted) width
export function trailingFaceWidth(speed: number, side = 1): number
// β × L, the lag of the far side: its light left L ÷ c earlier and the cube moved β L
export function photographWidth(speed: number, side = 1): number
// front face plus trailing face
export function apparentTurnDegrees(speed: number): number
// arcsin β, the angle at which a cube at rest would look the same
export function runRotatedCube(speed: number, side = 1): RotatedCubeResult
// the cube's corners as the lab measures them, the time each corner's light left, where each corner appears
// in the photograph, the widths, the matching turn, the same numbers for the cube at rest, and for a cube at
// rest turned by the matching angle
export function sphereOutlineRadius(speed: number, radius = 1): number
// the radius of the moving sphere's outline in the photograph (always the sphere's own radius)
```

It reuses `timeDilationFactorFor` from `movingClockExperiment.ts`, and invents no new physical assumption. The main function does not use the closed forms above: it works out where each corner appears by solving "when did the light that arrives now leave this corner?" for each corner, so the tests can check the closed forms against an independent route. Out-of-range inputs throw `RangeError` (`speed < 0` or `≥ 1`; non-positive side or radius).

---

## Learner Controls

1. **The cube's speed:** four presets, 0.3c, 0.6c, 0.9c, 0.99c (as Experiments 7 to 9).
2. **Run:** gated on both predictions.

Changing the speed clears the predictions (the numbers depend on it).

---

## Prediction Activity

Draft wording (§28.1). Two questions, in this order, both answered before Run is enabled (the pattern of Experiments 8 and 9). Not scored while the learner is predicting; the tutor's explanation marks each as matched or not matched (the pattern the owner chose for Experiment 8).

> **Question 1.** The lab measures the cube as shorter along its direction of motion (Experiment 6). A camera far away, looking straight across the cube's path, takes one photograph at the moment the cube is opposite it. Compared with a photograph of the same cube at rest, will the photograph of the moving cube look **squashed** along its direction of motion, **the same as at rest**, **stretched** along its direction of motion, or **turned**, as though the cube were rotated?
>
> **Question 2.** Think about the cube's faces. The **front** face is the one toward the camera. The **leading** face is the one that points in the direction the cube is moving. The **trailing** face is the one that points the opposite way. Besides the front face, which other face, if any, can the camera see? **None**, **the leading face**, or **the trailing face**?

Right answers: Question 1, **turned**; Question 2, **the trailing face**, at every speed offered. Question 1's natural wrong answer is "squashed" (from the contraction), and a second tempting wrong answer is "stretched" (the photograph's total width is larger than the cube at rest). Question 2 is the surprise: most people expect the leading face, if any, to be the one that shows. Neither question asks for a number.

---

## Experiment Behavior

### Introduction (draft; the owner approves the wording, §28.1)

The rules are those of Experiments 5 to 9 (`CLAUDE.md` §15, §12): every term defined in plain language before it is used, a concept before its formula, a worked example with real numbers after the run, a daily-life example for an idea that is not obvious, nothing the learner is asked to predict revealed in advance, and a collapsed "Words and formulas" panel that gains the formulas only after the run.

- **The question.** In Experiment 6 of the first chapter we saw that a fast-moving object is shorter along its direction of motion, as the lab measures it. In Experiment 4 of this group we saw that what a camera records is not what a ruler measures, because light takes time to arrive. What does a photograph of a fast cube look like? Is the cube squashed in the photograph, as the ruler suggests?
- **New words, each with an example.**
  - **Photograph:** the picture a camera records of the light that reaches it at one instant. It is not the same as measuring the cube with a ruler.
  - **The faces of the cube:** the **front** face is the one toward the camera; the **back** face is the one away from it; the **leading** face is the one that points the way the cube is moving; the **trailing** face is the one that points the opposite way. (From above, the cube is a square, with the camera below it and the motion to the right; the four faces are the four sides of the square.)
  - **Contracted:** shorter along the motion, as in Experiment 6. (Also repeated: the time dilation factor `D` of Experiment 3, which is also the factor by which the length along the motion is shorter.)
  - **Turned (rotated):** a cube is turned when you look at it from an angle, so that you see two of its faces at once. A photograph "looks turned" if it looks like that.
- **An everyday example that does not reveal the answer** (Decision 5, wording to approve): "Imagine a very long train passing you, and you listen to it. The sound that reaches you now from the far end of the train was made a little earlier than the sound from the near end, because it had farther to travel. What you hear is a mixture of different moments." The direction of any effect on the shape is not said.
- **What happens.** A cube flies past a camera. When it is exactly opposite the camera, the camera takes one photograph. You see the cube from above, the way the lab measures it at that moment; where the light from each corner left the cube; and the photograph. Each is shown next to the same cube at rest.
- **Your job.** Choose the cube's speed. Predict what the photograph will look like, and which faces it will show, as asked. Press Run. You are not graded while you predict. The tutor will compare your predictions with the result afterwards.
- **What we assume.** The camera is very far away and looks straight across the cube's path; its shutter is instant; the cube moves at a steady speed; we show a flat slice, the cube from above and its photograph; we show only the shape, not color or brightness. The cube is the same cube at all times: it is not really turned.

### Display

Three pictures on the dark-canvas style of earlier experiments and on the same scale (stacked on a narrow window), each labeled directly on the canvas (§14):

1. **What the lab measures (sky blue outline).** The cube from above at the instant of the photograph: its plan (a square at rest, outlined faintly) and, solid, the moving cube as the lab measures it (contracted to a rectangle of width `D L` and depth `L`), with the faces labeled (front, back, leading, trailing), the arrow "direction of motion", and the camera drawn at the bottom, far away, with "to the camera" arrows.
2. **Where the light left from (purple outline).** The same view, adding, after the run's third stage, the **places where each corner was when the light now arriving left it**: faint copies of the back corners at positions `β L` farther back, and straight light rays going to the camera from each corner's emission place. The extra distance for the back corners is marked "extra distance `L`" and the lag "the cube moves `β L` meanwhile".
3. **The photograph (yellow outline), beside two comparison photographs.** The photograph of the moving cube as a flat picture: the **front face** (a rectangle, one shade) and the **trailing face** (a narrower rectangle, a darker shade) side by side, each with its width written on it. Beside it, **the cube at rest** (a square, for reference), and, after the run's last stage, **the cube at rest turned by the angle `θ`** (a front face and a side face with the same widths), with the label "same widths". The widths are written as numbers (`0.80` and `0.60` for `L = 1`), so the picture never relies on shade alone.

A **"How to read this diagram"** caption beneath, written to the standard of `CLAUDE.md` §14 and in the picture-by-picture style the owner asked for on Experiment 8 (who the lab observer and the camera are and what "at the instant of the photograph" means; each picture in turn; every drawn element, shade and arrow; each term; what appears when, in the order of the run; a worked moment with real numbers; and "what to look for"). The caption does not say what the photograph shows before the run.

### Run

Staged, at a pace the learner can follow (the physics result does not depend on playback speed, §11):

1. **The cube at rest is photographed.** A square front face of width `L`, as the reference photograph.
2. **The cube flies past** and reaches the point opposite the camera. The lab's measured picture (Picture 1) shows the contracted rectangle.
3. **Where the light left from** (Picture 2): the rays from the front corners and, longer ones, from the back corners, and the places where the back corners were when their light left (the lag).
4. **The photograph is assembled** (Picture 3): the front face, then the trailing face next to it, with their widths.
5. **The comparison:** the cube at rest, turned by `θ`, appears beside the photograph, and the widths are matched.
6. The results table, and then the tutor.

### Results (neutral, then explained by the tutor after the learner has responded)

For the chosen speed: the table of the cube's measured width (`D L`), the trailing face's apparent width (`β L`), the photograph's total width and the matching turn angle `θ`, beside the cube at rest (width `L`); `D`; the learner's two predictions, recorded and not marked there. Nothing says why.

---

## Expected Observations

- The photograph of the moving cube is **not squashed**: the cube's front face is shorter (`D L`) but the photograph also shows the trailing face next to it.
- The **trailing face** is visible, and the leading face is not.
- The photograph is **wider than the cube at rest** at every speed offered (1.25, 1.40, 1.34 and 1.13 times `L`).
- The photograph has **exactly the same two widths as a cube at rest turned by `θ`** (17.5°, 36.9°, 64.2°, 81.9°). At 0.99c the cube looks turned almost end-on (the trailing face is nearly as wide as the cube's side).
- The lab's ruler, at the same instant, still measures the cube as shorter (`D L`): both are true.

## Expected Learner Understanding

The learner should be able to say that a photograph of a very fast cube shows a cube that looks turned, not squashed, because light from the far side left earlier and the cube moved on in the meantime; that the camera can see the trailing face; that the cube has not turned and has not stopped being contracted as a measurement; and that "measured" and "seen" are different questions. They should not leave thinking that length contraction is wrong, that the cube is really rotating, or that this is what an eye or a nearby camera would see.

---

## New Concepts Introduced

**Photograph** (as distinct from a ruler measurement), **the extra distance and lag of the far side of an object**, **the trailing face and the leading face**, and the idea that **a fast object can look turned without being turned** (a "looks like" comparison).

## Relationship to Previous Experiments

- **Experiment 4 of this group (what you see is the past):** the same idea, light that arrives now left earlier, applied to the different parts of one object instead of the whole object.
- **Experiment 6 of the first chapter (length contraction):** the contraction is the front face's width `D L`, and stays true as a measurement.
- **Experiment 3 of the first chapter (time dilation):** `D` is the same factor.
- **Experiment 7 (aberration):** no new use; both are about what light arriving at an observer says about the source. (The specification does not claim a link between the two; the sources describe the rotation as a light-travel-time effect.)
- **Experiments 8 and 9:** the same frozen-instant way of looking; this experiment shows only the shape, not color or brightness.

## Relationship to Later Experiments

- **The closing recap** (a section on this experiment's page, not an experiment): recaps the whole group in plain words, including seen versus measured (Experiments 4 and 7 to 10).

---

## Required Physics Tests

(For `src/physics/rotatedObject.test.ts`; the numbers are recomputed in the tests.)

1. At `β = 0`, the photograph is the plain square: front face `L`, trailing face 0, total width `L`, turn angle 0.
2. **Brute-force route:** for a cube moving at `β`, with parallel rays toward the camera, solve for the time each corner's light left it (`t_emission = t_photo − (distance to camera) ÷ c`) and take the position where the corner was then. The corners' apparent positions in the photograph give the front face width `D L`, the trailing face width `β L` and the total `L (D + β)`, for several `β`.
3. **Lorentz route:** build the lab's measured cube by Lorentz-transforming the corners of the cube at rest to one lab time (using `lorentzTransform`); its width along the motion is `D L` and its depth is `L`.
4. **Rotation route:** a cube at rest, turned by `θ = arcsin β` and projected flat, has a front face of width `L cos θ` and a side face of width `L sin θ`, equal to `D L` and `β L`. The two photographs have the same widths at every speed offered.
5. The widths in the table above, to a stated tolerance.
6. `D² + β² = 1`, so `cos θ = D` exactly for `θ = arcsin β` (the identity that makes the rotation match).
7. The trailing face's width rises steadily with `β`, the front face's falls steadily, and the total is above `L` for every `β > 0` below `1`, and is largest at `β = 1 ÷ √2` where it is `√2 L`.
8. The leading face is never visible: no corner of the leading face appears to the right of the front face's leading edge, at any speed.
9. Symmetry: the photograph at `β` of a cube moving to the left is the mirror image of one moving to the right.
10. **A sphere:** the moving sphere's outline (the contracted ellipse sheared by the lag) has radius `R` at every speed: the outline width is `2R` and equals the width computed by the brute-force route over points on the sphere.
11. Scaling: the widths scale with the cube's side `L` (twice the side gives twice every width).
12. `RangeError` for `speed < 0`, `speed ≥ 1`, and a non-positive side or radius.

---

## AI Tutor Behavior

The same pattern as Experiments 3 to 9 (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, after the learner has responded. The tutor does not invent physics and reports only what the physics module produced. The explanation begins by marking each prediction as matched or not matched.

1. **Observe.** "Look at the three pictures and the table. What do you notice about the photograph of the moving cube, compared with the cube at rest and with the cube as the lab measures it?"
2. **Compare with the predictions.** "You predicted that the photograph would look [squashed / the same / stretched / turned], and that the camera could see [no other face / the leading face / the trailing face]. In this run, the front face was [width] wide and the trailing face [width]. Comparing that with your predictions, what do you notice?"
3. **Conceptual question.** "The lab's ruler says the cube is shorter. So why isn't the cube squashed in the photograph? And why can the camera see a face that points away from the direction the cube is moving?"
4. **Explanation**, after the learner has responded (the owner's wording to approve):
   0. **Your predictions, marked,** each beside the result.
   1. **What the results show,** in the learner's own numbers (the widths, the total, the matching turn angle).
   2. **A daily-life example: a long train and sound.** The sound from the far end of a long passing train left it earlier than the sound from the near end, because it had farther to travel. A photograph of light has the same feature: it records light from different moments. Light is much faster than sound, but a cube moving close to the speed of light moves a lot in the time the light takes to cross its own depth.
   3. **The counting, with simple math.** The back face is one cube-side farther from the camera than the front face, so its light left one side-length of light travel time earlier. At 0.6c, the cube moves `0.6 × 1 = 0.6` of its side in that time, so the back corners appear `0.6` behind where they would otherwise. The camera therefore sees the trailing face with width `0.6`, next to the front face at `0.8` (the contraction). Total: `0.8 + 0.6 = 1.4`, wider than the rest cube's `1.0`.
   4. **Why it looks turned.** A cube at rest turned by `36.9°` shows a front face `0.8` wide and a side face `0.6` wide: the same two numbers. The cube is the same cube and has not turned. Only the photograph looks as if it had.
   5. **The contraction is still real.** The lab's ruler, at one lab time, measures the cube at `0.8` of its side (Experiment 6). A photograph answers a different question: what light arrives at the camera now (Experiment 4). Both are true. Neither is "the real shape".
   6. **A sphere.** A moving sphere keeps its round outline in the photograph (the contraction and the lag cancel), a result found by Terrell and Penrose in 1959.
   7. **What was shown and what was not.** A flat slice, a camera far away looking straight across, an instant shutter, only the shape. A near camera, a camera looking along the path, and a human eye would show different distortions. The cube has not turned and has not stopped being contracted.

### Chapter summary (draft, for the owner's review)

Shown below the experiment only after the tutor's explanation. "What you learned": a camera records the light that arrives at one moment, and light from the far side of an object left earlier, when the object was farther back. So a very fast cube is photographed turned, not squashed: its front face is contracted to `D L` and its trailing face, of width `β L`, comes into view, exactly like a cube at rest turned by `θ = arcsin β` (at 0.6c, `0.80 + 0.60 = 1.40` wide, as a cube turned `36.9°`). The cube has not turned, and the lab's ruler still measures it as shorter: measured and seen are different questions. "What's next": no further experiment; the closing recap below follows (Decision 9).

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| A fast-moving cube, photographed by a distant camera looking across its path, looks as if it had been rotated by the angle `arcsin(v/c)` (the trailing face is visible), not squashed; this holds for a camera that subtends a small angle, an instant shutter and a camera perpendicular to the motion | The UBC mathematics page "Terrell Rotation" (personal.math.ubc.ca, 2001 course page), which states the angle and the conditions; Wikipedia "Terrell rotation", which describes the same effect qualitatively (the trailing face visible, the front face contracted) | Checked on 2026-10-16 against two secondary sources, which agree with the derivation here; no original paper read |
| A moving sphere keeps a circular outline | Wikipedia "Terrell rotation" (qualitatively); derived here (the outline of the sheared contracted ellipse has the sphere's own radius); the tests check it | Checked against a secondary source and the derivation |
| The effect was found independently by Roger Penrose (published January 1959) and James Terrell (published November 1959) | Wikipedia "Terrell rotation" | Checked against one secondary source |
| The contraction factor equals `D = √(1 − β²)` | Experiment 6 of the first chapter; already in the project | Already in the project |
| Light left the far side earlier by the extra distance divided by `c`, and a moving object moves on in that time | Straight-line geometry, with no relativity (as in Experiment 4) | Derived |
| A laboratory recreation of the effect with slowed light | Mentioned in the sources found, with differing dates (2024 and 2025) | **Not used** (Decision 10) until checked |
| A long train's sound from the far end left earlier than that of the near end | General knowledge | Widely stated; used as an everyday picture only |

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **One shape or two.** Default: the cube only in the experiment, and the sphere in one paragraph of the tutor (with its source and a test). Alternative: a shape control (cube or sphere), with a sphere picture (more to build and explain).
2. **Predictions.** Default: two (the overall look, then which face is seen). Alternative: one (the overall look only).
3. **Pictures.** Default: three (the lab's measured view from above, where the light left from, the photograph with its two comparison photographs), because each picture shows one idea. Alternative: two (merge the first two).
4. **How the comparison is drawn.** Default: the cube at rest and the cube at rest turned by `θ` beside the photograph, with the widths written on every face and "same widths" between the last two. Alternative: draw only the photograph and the turned cube, and mention the rest cube in the caption.
5. **An everyday example in the introduction.** Default: the long train and sound (the direction of any effect not stated). Alternative: none in the introduction, only in the tutor. (Risk: it hints that the far side shows "later".)
6. **Speed presets.** Default: 0.3c, 0.6c, 0.9c and 0.99c, as in Experiments 7 to 9. Alternative: add 0.71c, where the photograph is widest and the cube looks turned exactly 45 degrees (it would need its own explanation).
7. **The camera's distance.** Default: "very far away", with the small-angle condition stated in one plain sentence and no number. Alternative: show a nearby camera as a second case (a much bigger addition; the effect then changes).
8. **Naming the effect.** Default: not named before the run; the tutor names it once after the explanation ("this is called the Terrell-Penrose effect, after the two physicists who found it in 1959"). Alternative: not named at all.
9. **The chapter summary's "What's next".** Default: "no further experiment; the closing recap below follows", and the recap is the section on this page (the owner's plan). Alternative: no pointer.
10. **A real example in the tutor.** Default: none beyond Terrell and Penrose's 1959 papers (the laboratory recreation reports have differing dates and are unchecked). Alternative: one, after a source check.
11. **Heights and 3D.** Default: a flat slice (the cube's plan and its flat photograph, with its height not changing), stated to the learner. Alternative: draw the cube in three dimensions.
12. **The recap.** Default: written in a later step as a section on this experiment's page, only after this experiment is complete and its wording approved, and proposed to the owner on its own first (it is not part of this specification's approval). Alternative: include its outline in this specification now.
13. **Spacetime diagrams.** Default: none; this experiment is about light arriving at a camera, and a top view shows it directly. Alternative: a small diagram of the light paths.

---

## Success Criteria

1. The physics module gives, for each speed, the widths of the front and trailing faces and the matching turn angle, and the numbers agree with the table above (to a stated tolerance) and with three independent routes: the brute-force emission-time route, the Lorentz-transformed cube, and the cube at rest turned by `arcsin β`.
2. The learner predicts both questions before the run; Run requires both.
3. The three pictures are labeled directly on the canvas (every face, arrow, ray, ghost position, width and shade), and each width is written as a number so that no shade has to be relied on alone.
4. The pictures show the contrast between the cube as the lab measures it, the photograph, and the turned comparison.
5. The run shows its stages in order and names each.
6. The results are neutral; the explanation comes only after the learner has responded; the predictions are marked only in the explanation.
7. The introduction and caption define every term and formula, with a worked example and a note of what the formula does not mean, and neither says what the photograph looks like before the learner has predicted and observed (any worked example appears after the run).
8. The experiment never says or draws that the cube is really turned or that length contraction is wrong, and says plainly that this is one frozen instant seen by a distant camera, not what an eye or a near camera would see.
9. The "Words and formulas" panel lists every term and formula (the formulas after the run).
10. Nothing contradicts Experiments 1 to 9 of this group or the earlier chapters; in particular, the lab's measured width equals Experiment 6's contracted length.

---

## Implementation Notes

**Built (2026-10-16), §21 Steps 2 and 3 only:** the physics model (`src/physics/rotatedObject.ts`) and its tests (`src/physics/rotatedObject.test.ts`: all twelve required tests, as 13 test cases, with the specification's table written out by hand). Exports: `frontFaceWidth`, `trailingFaceWidth`, `photographWidth`, `apparentTurnDegrees`, `runRotatedCube` and `sphereOutlineRadius`, with the types `CornerName`, `CubeCorner` and `RotatedCubeResult`. `runRotatedCube` does not use the closed forms: it builds the cube's corners in its own frame, puts them at one lab time with `lorentzTransform` (the contraction of Experiment 6), takes the time each corner's light left it (the extra depth divided by `c`) and finds where the corner was then, and reads the widths from the corners' positions in the photograph. The tests check it against an independent route that uses neither the module nor the closed forms: a camera 10 million units away and a numerical solution (by bisection) of "when did the light that arrives now leave this corner?", which agrees to four decimal places (the small difference is the camera's finite distance), including for a cube moving the other way; against the cube at rest turned by arcsin β and projected flat; and, for the sphere, against a sampling of 80,000 points on its surface. A mutation check (nine deliberate breaks: the sign of the lag, the lag doubled, the front face stretched instead of contracted, the trailing face halved, the turn angle from the cosine, the leading-face test reversed, the Lorentz transformation by the wrong sign, the sphere without the contraction, and the total width taken as the front face only) was caught by at least one test each (four of them by one test only). **Not built yet:** the interface, introduction, "Words and formulas" panel, the three pictures, the two predictions, the run, results, tutor and chapter summary, and the closing recap.

**Built (2026-10-16), §21 Steps 4 to 10:** the interface (`src/components/RotatedObjectExperiment.tsx`), the tutor (`src/components/RotatedObjectTutor.tsx`) and the chapter entry (`src/App.tsx`): the introduction, the "Words and formulas" panel (the formulas added after the run), the speed control, the two predictions, Run (off until both are made), the five-stage run, the three pictures with a guide to each under it, the results panel, the tutor and the chapter summary. **Complete-flow tested in Chrome (2026-10-16):** all four speeds with all twelve prediction pairs (48 runs, run twice: once before and once after the interface changes below), with one real-time run at each speed to check the five stages in order; every run checked the table against an independent calculation, the tutor's numbers, the marking of both predictions (only "turned" and "the trailing face" match), the explanation and chapter summary appearing only after the three tutor answers, and no console errors. The other 44 runs were fast-forwarded by patching the browser clock, which skips only the animation's timing. **Final review (2026-10-16):** the review found and fixed three things: Picture 2 worked out the lag (`side × speed`) itself instead of reading `trailingFaceWidth` from the physics module (§9); Picture 2's left-hand note was crossed by the light lines at 0.9c and 0.99c, so it now sits in the picture's key; and, earlier, the pictures showed no rotated cube, so the turned cube is now drawn (see difference 2). **Wording approved by the owner on 2026-10-16** ("wording approved"). **Source status of the tutor's claims:** the Terrell and Penrose statements are as in the table above (secondary sources only); the tutor's closing remark that a camera close to the path, a camera looking along it and a human eye would show different distortions has no source check. **Not checked:** narrow widths (the browser window could not be resized in the test setup), browsers other than Chrome, and a real learner.

**Differences from the specification (all twelve approved by the owner on 2026-10-16; difference 1, the title, is approved as it stands, so it is kept unless the owner later asks for a question title):**

1. **Title.** Both the page heading and the chapter title say "A Fast Object Looks Rotated, Not Squashed", as this specification's title does, so the answer to Prediction 1 is visible before the learner predicts (§12). Kept as specified. Flagged for the owner, who may prefer a question title.
2. **The turned cube is drawn as a rotated square.** In Picture 3, the cube at rest turned by θ is drawn as a top-view square rotated by θ with the camera below (the two visible sides in yellow, the two hidden sides dashed, and a faint dashed square for the unturned cube), beside its photograph. The specification showed only the two flat boxes. Added at the owner's request on 2026-10-16 ("go with option 1") because nothing in the pictures looked rotated.
3. **A guide under each picture.** The specification had one "How to read this diagram" caption beneath all three pictures. There is now a short general box, then a guide directly under each picture that quotes and explains every label drawn in it (with a letter-in-the-post example for Picture 2), then a final box with the stages, the worked numbers and "what to look for". Requested by the owner.
4. **Longer introduction.** The train-and-sound example has real numbers (a 340 m train, 340 m per second, 0.3 s and 1.3 s), and "What happens" is a numbered list of the five stages.
5. **Pictures 1 and 2 have more labels than the specification listed:** a viewpoint note ("We look down on the cube from above…"), longer face labels, a key beside Picture 2, and the lag written above each arrow. Requested by the owner.
6. **Picture 3 layout.** The faces are named above each box and the widths are inside; the total width is written under the moving cube's photograph.
7. **Results.** The table has an extra row (the lab's measured width), and there are extra lines (the turned cube's two widths, whether the leading face appears, and D).
8. **The formulas panel** gains two entries after the run: the widths formula and the turn angle, each with a worked example at 0.6c.
9. **Tutor.** The effect is named in part 6, together with the sphere ("A sphere, and a name"), and part 6 gives the sphere's outline radius for a sphere of radius 1.00. Part 4 states D² + β² = 1.
10. **Chapter summary's "What's next":** "This is the last experiment of this group." (Decision 9 said "no further experiment; the closing recap below follows"; the recap is not built, so it is not mentioned.)
11. **A pointer line in the caption:** "Why the numbers come out this way. This is not explained here. After the run, the tutor explains it, and the 'Words and formulas' panel above gains the formulas."
12. **Prediction 1's choice labels** are longer than the specification's one-word choices ("Squashed along its direction of motion", and so on), and the module also exports `CornerName`, `CubeCorner` and `RotatedCubeResult`, which the specification's sketch did not list.

**Not done:** the closing recap of the whole group (a section on this experiment's page), which the owner's plan says is proposed on its own first.
