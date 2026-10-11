# Black Holes and Strong Gravity — Experiment 6: Seeing the Fall From Far Away — Does Anyone See the Traveler Cross?

**Status: APPROVED by the owner on 2026-10-11, with all eleven "Decisions Needing Human Review" items taken as Claude's recommended defaults (including extending this group with a sixth experiment, Decision 1). Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 and drafted as a specification per Stage 3 on 2026-10-11. To be built one step at a time (§6); nothing is implemented yet. Learner-facing wording (introduction, prediction questions, captions, Results, tutor) is still subject to the owner's line-by-line review when it is drafted (§28.1).**

---

## Overview

Experiment 2 of this group found that a clock hovering near a black hole ticks more and more slowly as seen from far away. Experiment 5 followed a traveler who falls in and found that the traveler's own clock reaches the horizon in a finite time, while a far-away clock reads later and later without limit. Both experiments were careful to say what they did **not** model: Experiment 5's "far-away clock" is the time on a clock at rest far away *when the traveler passes each distance*, and its specification and tutor say plainly that this is a comparison of clocks, **not what a far-away observer would see**. Light from near the horizon takes time to get out, and Experiment 5 leaves that out.

This experiment puts it back in and asks: **what does a far-away observer actually receive from a traveler who falls in, and do they ever see the traveler cross the horizon?**

The traveler sends a short flash of light at regular steps of **their own watch**. A far-away observer receives the flashes and records when each one arrives on their own clock.

The new idea is one thing: **the flashes arrive further and further apart, by an amount that grows without limit as the traveler nears the horizon, and the flash sent as the traveler crosses the horizon never arrives at all. So the far-away observer never sees the traveler cross, even though the traveler crosses in a finite time. Two effects stretch the gaps, and they multiply: gravity slowing the traveler's clock (Experiment 2), and the traveler moving away from the observer as they fall (the receding-source effect of Gravitational Waves Experiment 5).**

The learner picks a black hole and a release distance, runs the fall, and watches two rows of ticks: the evenly spaced flashes **as sent** on the traveler's watch, and the same flashes **as received** on the observer's clock, with lines joining them. A graph shows how much the spacing is stretched against the traveler's distance above the horizon, with the gravity part, the motion part and the total drawn together. A second graph shows the observer's clock reading at arrival against the traveler's watch reading at sending, running upward without limit as the traveler nears the horizon.

The experiment is a **thought experiment** about a thin pulse of light sent straight outward to an observer very far away, for a non-rotating, uncharged black hole. It does not model brightness, color, what a camera would see, or anything inside the horizon.

---

## Learning Objective

After this experiment, the learner should understand:

1. A far-away observer receives each flash **later** than it was sent, and the delay grows as the traveler gets nearer the horizon, because light from closer in has to climb out of stronger gravity.
2. Flashes sent at **equal steps of the traveler's watch** arrive **unequally spaced**. For a fall from 10 horizon radii, flashes 2.45 light-times apart on the traveler's watch (a light-time is the time light takes to cross one horizon radius, as in Experiment 5) arrive 2.6 apart at first and 5.0 apart by the nineteenth. This stretching is a number, the **stretch factor** of the spacing, which starts at 1.054 and reaches 191 at 0.01 horizon radii from the horizon and about 19,000 at 0.0001. Each tenfold closing of the gap multiplies it by 10, so it has no limit.
3. Two separate things stretch the spacing and their factors multiply: **gravity** slows the traveler's watch as seen from far away (Experiment 2's factor, `1 ÷ √(1 − 1/r)`), and **motion** (the traveler is moving away, so each flash has a little further to travel than the one before, as for a receding source in Gravitational Waves Experiment 5). At 2 horizon radii, from rest at 10: `1.414 × 2.236 = 3.162`.
4. The flash sent as the traveler crosses the horizon, and any sent after, **never arrives**. Flashes sent just before arrive later and later: each tenfold closing of the gap adds about `2 ln 10 ≈ 4.6` light-times to the observer's clock reading, twice the 2.3 of Experiment 5's far-away clock, because light delay adds to the slowing. So the observer waits without limit for the last flashes, and **never sees the traveler cross**, even though the traveler's own watch crosses in a finite time.
5. This does not contradict Experiment 5. It is the same event, described by different observers: on the traveler's own watch the crossing happens (Experiment 5); in the observer's received flashes it never appears (this experiment). Neither one is "the real time".
6. What the experiment does not say: how bright the flashes are or what color they become, what a camera would see, how a real telescope would observe a real black hole, or anything inside the horizon.

---

## Physical Situation

The same fall as Experiment 5: a small traveler released **from rest** at a chosen distance `r0` (in horizon radii) from a non-rotating, uncharged black hole, falling straight in. The traveler sends a **short flash of light straight outward** at **20 evenly spaced steps of their own watch** from the release to the horizon: at watch readings `k × τ_h ÷ 20` for `k = 0, 1, …, 19`, where `τ_h` is the watch reading at the horizon, plus a 20th flash sent exactly at the horizon (`k = 20`). An observer **at rest, very far away** records when each flash arrives on their own clock. Arrival times are counted from the arrival of the first flash (sent at the release), so the observer's distance does not matter (it adds the same constant to every arrival).

### The equations (given, not derived)

With `r` in horizon radii (`r_s = 1`), time in horizon light-times (`r_s ÷ c`), `E = √(1 − 1/r0)`, for a non-rotating, uncharged black hole, from standard general relativity:

```
the traveler's watch:         τ = ½ r0^1.5 (η + sin η),   with cos η = 2r/r0 − 1         (as in Experiment 5)
the far-away clock at sending: dt/dr = −E ÷ [(1 − 1/r) √(1/r − 1/r0)]                     (as in Experiment 5)
the delay of an outgoing flash: the observer's clock reading at arrival is  t − r − ln(r − 1) + a constant
the stretch factor:           (1 + z) = dt_arrival/dτ = [E + √(1/r − 1/r0)] ÷ (1 − 1/r)
        = gravity part × motion part, where
        gravity part = 1 ÷ √(1 − 1/r)                          (Experiment 2's clock-rate factor, restated)
        motion part  = [E + √(1/r − 1/r0)] ÷ √(1 − 1/r)       (the receding-source factor for the traveler's speed
                                                                relative to an observer at rest at that distance)
```

All are **given, not derived**. The term `r + ln(r − 1)` (the distance light must travel, with the slowing of light near the horizon taken into account) is introduced in plain language as "how long light takes to climb out from distance `r`", with no named object. The stretch factor is the ratio of the gap between two arriving flashes to the gap between them as sent. At release it is `1 ÷ √(1 − 1/r0)` (a static source: gravity only), and near the horizon it is about `2E ÷ (r − 1)`.

### Facts the model reproduces (computed, not looked up; the tests check them)

- The stretch factor equals gravity part × motion part at every distance (the two routes to it agree).
- At release it equals `1 ÷ √(1 − 1/r0)`, and the motion part is exactly 1 (the traveler is not yet moving).
- Near the horizon each tenfold closing of the gap multiplies it by 10 (`(1 + z)(r − 1) → 2E`), and adds `2 ln 10` to the arrival time.
- The arrival time of the flash sent at distance `r` equals the far-away clock of Experiment 5 plus the delay `r0 + ln(r0 − 1) − r − ln(r − 1)`.

### Illustrative results (computed in a feasibility check on 2026-10-11, in a scratch script outside the project; the tests will check them)

A fall from rest at 10 horizon radii, times in horizon light-times (arrival counted from the arrival of the first flash):

| Distance | Traveler's watch | Observer's clock at arrival | Stretch factor | Gravity part | Motion part |
|---|---|---|---|---|---|
| 10 (release) | 0 | 0 | 1.054 | 1.054 | 1.000 |
| 5 | 40.65 | 49.78 | 1.581 | 1.118 | 1.414 |
| 2 | 47.66 | 63.66 | 3.162 | 1.414 | 2.236 |
| 1.5 | 48.39 | 66.50 | 5.104 | 1.732 | 2.947 |
| 1.1 | 48.88 | 70.79 | 20.33 | 3.317 | 6.130 |
| 1.01 | 48.975 | 75.63 | 191.1 | 10.05 | 19.02 |
| 1.001 | 48.984 | 80.26 | 1,899 | 31.64 | 60.01 |
| 1.0001 | 48.985 | 84.86 | 18,975 | 100.0 | 189.7 |
| 1 (the horizon) | 48.985 | **no limit** | no limit | no limit | no limit |

The 20 evenly spaced flashes (every 2.449 light-times of the traveler's watch) arrive at 0, 2.60, 5.23, 7.90, 10.61, 13.35, 16.14, 18.97, 21.84, 24.77, 27.76, 30.81, 33.94, 37.15, 40.46, 43.91, 47.52, 51.37, 55.60 and 60.64: spacings growing from 2.60 to 5.03. The flash sent at the horizon never arrives. From 100 horizon radii the stretch factor at 1.0001 is about 19,900; from 2 horizon radii about 14,100. The seconds scale with the black hole as in Experiment 5 (one light-time is about 0.0000985 s for 10 Suns, 42.4 s for Sagittarius A* and 64,000 s for M87*).

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, about 12.7 million km) and M87* (about 6.5 billion Suns, about 19 billion km). Results in light-times depend only on the release distance in horizon radii; only the seconds change.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a thin flash of light,** sent straight outward from a small traveler who falls straight in from rest. The flash's own gravity does not matter.
- **The observer is at rest, very far away,** and the arrival times are counted from the first flash's arrival.
- **The equations are given, not derived,** for a black hole that does not spin and has no electric charge. Real black holes usually spin, which changes the details.
- **Only the timing of the flashes is modeled.** How bright they are, what color they become, and what a camera or telescope would show are not. In particular the experiment does not claim that the last flashes could be detected in practice.
- **The experiment stops at the horizon.** Nothing inside it is modeled. A flash sent at the horizon is followed only to say that it never arrives.

### Not introduced

Brightness and dimming of the flashes, the color of the light (wavelength) and the black hole's appearance in a picture or the "shadow", what the traveler sees on the way in, Hawking radiation, spinning (Kerr) black holes, the tortoise coordinate as a named object, the Schwarzschild metric as a named object, any inside-the-horizon story. All explicitly out of scope (`CLAUDE.md` §16). The tutor may name a few of them in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module, in the style of Experiments 2 to 5. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`), and the same speed-of-light constant as Experiment 5 (to be checked against the existing code). It does **not** import Experiment 5's, 4's, 3's or 2's modules, and a regression test checks this. It restates the traveler's-watch and far-away-clock equations in a few lines (as Experiments 3 and 4 restated theirs); a test checks them against Experiment 5's figures from the specification, not by import.

```typescript
// src/physics/seeingTheFallExperiment.ts

export const MIN_START_IN_HORIZON_RADII = 2
export const MAX_START_IN_HORIZON_RADII = 100
export const FLASH_COUNT = 20                  // flashes before the horizon; a 21st, sent at the horizon, never arrives
export const BLACK_HOLE_PRESETS: ObjectPreset[]

// Experiment 2's factor, restated: how much slower a clock at distance r ticks, seen from far away.
export function gravityPart(rInHorizonRadii: number): number
// The receding-source factor for the traveler falling from rest at r0, measured at distance r.
export function motionPart(startInHorizonRadii: number, rInHorizonRadii: number): number
// The stretch factor of the spacing of arriving flashes, computed directly from the formula.
export function stretchFactor(startInHorizonRadii: number, rInHorizonRadii: number): number

// The traveler's watch, the far-away clock at sending and the observer's clock at arrival, in horizon light-times.
export function travelerWatch(startInHorizonRadii: number, rInHorizonRadii: number): number
export function arrivalTime(startInHorizonRadii: number, rInHorizonRadii: number): number   // requires r > 1

export interface Flash {
  index: number                         // 0 to FLASH_COUNT (the last one is sent at the horizon)
  sentWatch: number                     // the traveler's watch when sent
  distance: number                      // distance from the center when sent, in horizon radii
  arrival: number | null                // the observer's clock at arrival; null for the one sent at the horizon
  spacingAsSent: number                 // since the previous flash, on the traveler's watch
  spacingAsReceived: number | null      // since the previous flash, on the observer's clock
  stretchFactor: number | null          // between consecutive flashes
}

export interface SeeingTheFallResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  lightTimeSeconds: number
  travelerWatchAtHorizon: number
  flashes: Flash[]                      // FLASH_COUNT + 1 of them
  curve: Array<{ gap: number; gravity: number; motion: number; total: number; arrival: number }>  // gap above horizon, for the graphs
}

export function runSeeingTheFallExperiment(presetId: ObjectPreset['id'], startInHorizonRadii: number): SeeingTheFallResult
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback speed (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The release distance,** in horizon radii: presets **100, 20, 10, 5, 2** (as in Experiment 5). The distance in kilometers (and AU where natural) is shown beside it.
- **Run,** which plays the flashes in order over a fixed real duration independent of the physics (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A traveler falls toward a black hole, sending a flash of light once every few seconds of their own watch. A far-away observer receives the flashes. As the traveler nears the horizon, how do the flashes arrive?" (At the same spacing as they were sent / Closer together / Further and further apart.) The model's answer is the third.
2. "Does the far-away observer ever receive the flash sent as the traveler crosses the horizon?" (Yes, soon after it is sent / Yes, but only after a very long wait / No, it never arrives.) The model's answer is the third. The second is the tempting wrong answer, and the Results say why it is not right.
3. "The flashes' spacing is stretched. What causes the stretching?" (Gravity slowing the traveler's watch / The traveler moving away as they fall / Both, and together they stretch it more than either alone.) The model's answer is the third.

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The pictures, captions, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12). The choices need the owner's wording review (see Decision 7).

---

## Experiment Behavior

### Display

Three pictures, one above the other:

- **Picture 1, "The flashes as sent and as received" (two rows of ticks).** A **top row**, "the traveler's watch (flashes as sent)": 21 evenly spaced ticks, blue, numbered 0 to 20, with the last one (the flash sent at the horizon) marked in rose. A **bottom row**, "the observer's clock (flashes as received)": the same flashes at the times they arrive, orange, getting further apart, with the 21st shown as an arrow running off the end, labeled "never arrives". Thin lines join each tick on the top row to its arrival on the bottom row. The two rows have separate, labeled scales (horizon light-times) so the learner can see the spacing grow. During playback, flashes appear one after another, each with its line. Beside the rows, a live readout of the current flash: its number, the traveler's distance from the horizon when it was sent, the spacing as sent and as received, and the stretch factor.
- **Picture 2, "How much the spacing is stretched" (a graph).** Horizontal: the traveler's gap above the horizon, in horizon radii (log scale, from the release distance down to 0.0001). Vertical: stretch factor (log scale). Three curves: **gravity part** (orange, Experiment 2's factor), **motion part** (green) and **total** (blue, thick, the product). A dot on the total at each flash during playback. All three visible together so the learner can see the total is the two multiplied (`CLAUDE.md` §14.2). A dashed line at 1 ("not stretched").
- **Picture 3, "The observer's clock against the traveler's watch" (a graph).** Horizontal: the traveler's watch (0 to the horizon time). Vertical: the observer's clock when that flash arrives. A blue curve rising steeply and running upward without limit at the horizon time (drawn to the 0.0001 gap, labeled "keeps going, no limit"), a dashed straight line "no delay, no stretching: the clocks agree" for comparison, and the 20 flashes marked as dots. The horizon time is a labeled vertical line.
- Each picture has its own **"How to read this picture" caption** directly under it, shown after predictions are locked in, in the step-by-step style of the earlier experiments (and as clear and plain as Experiment 5's Picture 1 caption after its rewrite). The captions must say what each drawn thing is, what a flash and the two clocks are, what the stretch factor is (with a worked example), what the three curves are, what "never arrives" means, and that the experiment follows thin flashes straight out, not a camera view.
- **Live readout:** the black hole, the release distance (horizon radii and kilometers), the current flash, both clocks and the stretch factor.

### Results

States the black hole and release distance, the 20 flashes' first and last spacings as sent and as received, the stretch factor at the first and last flash and at 0.0001 horizon radii from the horizon, the arrival time of the last flash before the horizon, and that the flash sent at the horizon never arrives (in horizon light-times and in ordinary units); compares all three predictions with the model; includes simple math per `CLAUDE.md` §15, for example the stretch factor at 2 horizon radii worked as gravity part × motion part (`1 ÷ √(1 − 1/2) = 1.414`, `2.236`, `1.414 × 2.236 = 3.162`), using only quantities the experiment defines; includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a friend walking steadily away from you, tossing you a ball every second. Each ball has a little further to travel than the one before, so they reach you slightly more than a second apart, even though they are tossed a second apart. It is an analogy for the **motion part** only, with the loose statement "the further the thrower, the longer each toss takes"; there is no everyday comparison for the **gravity part**, which relies on Experiment 2.

### Introductory text

To be drafted during implementation, covering the question (what does a far-away observer see of the fall, and do they ever see the traveler cross?), what happens (step by step), the learner's job, what to look for, new terms defined in plain language before use (**flash**, **as sent**, **as received**, **observer**, **stretch factor**, with **horizon**, **horizon radius**, **horizon light-time** and **stretch** recalled from Experiment 5, and **light travel time** at first use), what it builds on (Experiment 2's slowed clocks, Experiment 5's fall, and Gravitational Waves Experiment 5's receding source), a "Why even ask this" paragraph that follows the style requested for Experiment 5 (put the learner in the observer's place, watching a friend fall, and ask whether they would ever see the friend cross, without giving the answer), and the assumptions above. The introduction says plainly that the equations are given and not derived, and that they are for a non-rotating black hole. Any statement that gives away the prediction answers (that the spacing grows without limit, that the last flash never arrives, that there are two causes) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **After "Run" completes:**
  1. Observation: "Look at the two rows. How do the gaps between the flashes compare on the top row and the bottom row, and what happens to the last flash? Now try a different release distance and compare."
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "In Experiment 5 the traveler's own watch reached the horizon in an ordinary time. Here the observer never receives the flash sent at the horizon. How can both be true?" — intended to let the learner reach "they are different pictures of the same event: the traveler's watch crosses, but the light sent at the crossing never gets out".
  4. Explanation: (1) the flashes arrive later than they were sent, with a delay that grows; (2) the spacing grows, with the numbers (2.6 up to 5.0 for the 20 flashes from 10 horizon radii, and the stretch factor reaching 191 at 0.01 and 19,000 at 0.0001 from the horizon) and the "×10 for each tenfold closing" pattern; (3) two causes multiply (gravity, Experiment 2; motion, Gravitational Waves Experiment 5), with the worked 2-horizon-radii example and the ball-tossing friend; (4) the last flash never arrives, and the arrival time grows by about 4.6 for each tenfold closing, twice Experiment 5's far-away clock; (5) so the observer never sees the traveler cross, while the traveler crosses in a finite time: same event, different descriptions, neither is "the real time"; (6) how this finishes Experiment 5's caveat (its far-away clock was a comparison of clocks, not what an observer receives), and ties back to Experiment 2's slowed clock; (7) honest limits: only the timing of thin flashes is modeled, not brightness, color or a camera view, nothing inside the horizon, non-rotating, uncharged, equations given not derived; no claim about what real telescopes detect.

---

## Required Physics Tests

1. `gravityPart(r)` equals `1 ÷ √(1 − 1/r)` at several `r` and throws a `RangeError` for `r` at or below 1; `motionPart(r0, r)` equals the receding-source factor written separately in the test file from the traveler's speed relative to a static observer, `γ(1 + β)` with `γ = E ÷ √(1 − 1/r)` (checked at several `r0` and `r`).
2. **The stretch factor decomposes:** `stretchFactor(r0, r)` equals `gravityPart(r) × motionPart(r0, r)` at every distance tested, and equals the direct formula `[E + √(1/r − 1/r0)] ÷ (1 − 1/r)`.
3. **At release** the stretch factor is `1 ÷ √(1 − 1/r0)` and the motion part is exactly 1.
4. **The stretch factor is found independently of the module's formula:** the test file differentiates `arrivalTime(r0, r(τ))` against `travelerWatch(r0, r(τ))` numerically (a small step in the watch) and agrees with `stretchFactor` to within 0.1% at several distances.
5. **Near the horizon the stretch factor has no limit:** `stretchFactor × (r − 1)` approaches `2E` (to within 1% between 1.01 and 1.0001), each tenfold closing multiplies it by 10 to within 1%, and it is monotonically increasing as `r` falls.
6. **The arrival time has no limit:** each tenfold closing of the gap adds `2 ln 10` to it, to within 0.02, between 1.001 and 1.0001; it increases as `r` falls; `arrivalTime` at `r ≤ 1` throws a `RangeError`.
7. **The arrival time agrees with Experiment 5's figures:** the observer's clock minus the delay term (`r0 + ln(r0 − 1) − r − ln(r − 1)`) equals the far-away clock's value in Experiment 5's table (59.8, 62.1 and 64.4 at 1.01, 1.001 and 1.0001, from 10), to within 0.2 (the table's own rounding), without importing Experiment 5's module.
8. **Illustrative-table values** (from 10 horizon radii: 49.78 at 5, 63.66 at 2, 75.63 at 1.01, 84.86 at 1.0001; stretch factors 1.581, 3.162, 191.1 and 18,975) match to within 0.1 or 0.5%.
9. **The 20 flashes:** evenly spaced on the traveler's watch (to within 1e-9); the first arrives at 0; the arrival spacings increase from flash to flash; the first spacing as received is 2.60 and the nineteenth 5.03 (within 0.05) for a fall from 10; the 21st (sent at the horizon) has `arrival: null`.
10. **The arrival is later than the sending at every flash after the first,** and the delay grows (each flash's arrival minus the traveler's watch increases).
11. **Results in light-times depend only on the release distance:** the three black holes give the same flashes in light-times; only the seconds scale with the mass, and `lightTimeSeconds` is the horizon radius divided by the speed of light.
12. **Reuse:** the module imports `horizonRadiusKm` and `OBJECT_PRESETS` from `blackHoleSizeExperiment` and does not import `fallingInExperiment`, `timeNearBlackHoleExperiment`, `orbitsNearBlackHoleExperiment`, `lightNearBlackHoleExperiment`, `blackHoleExperiment` or `orbitExperiment` (a regression test, as in Experiments 3 to 5).
13. **Determinism:** the same inputs give the same flashes.
14. **Validation:** a release distance not finite, at or below 1, or (in the experiment function) outside 2 to 100 throws a `RangeError`; the module does not clamp.
15. **Playback speed does not change the result** (`CLAUDE.md` §11): the flashes are computed from the black hole and release distance alone, with no wall-clock input.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Whether to extend this group, and the title and the one new idea.** Default: extend the group with a sixth experiment, "Seeing the Fall From Far Away: Does Anyone See the Traveler Cross?", with one idea (the observer receives ever-stretched flashes and never the last one), because Experiments 2 and 5 each left "what an observer actually receives" as an open, explicitly excluded question. Alternatives: a new group for it; or leave the Black Holes group closed at five and propose something else (spinning black holes, Hawking radiation or the inside of a black hole, all named as out of scope in earlier specifications).
2. **Including the two-cause breakdown.** Default: yes, the stretch factor is shown as gravity part × motion part, linking Experiment 2 and Gravitational Waves Experiment 5, because it is the most instructive part and the numbers are exact. Alternative: show only the total (simpler; hides why both of the earlier experiments are needed).
3. **The observer and the clock.** Default: an observer at rest very far away, arrival times counted from the first flash's arrival (the distance of the observer drops out). Alternative: choose a fixed observer distance (adds a control and a constant that has no physical meaning here).
4. **The number of flashes.** Default: 20 flashes evenly spaced on the traveler's watch, plus the one at the horizon. Alternative: more flashes (too crowded to read) or flashes spaced by distance (hides the "equal steps on the traveler's watch" idea).
5. **Three pictures.** Default: the two rows of ticks, the stretch-factor graph and the observer's-clock-against-watch graph. Alternative: drop Picture 3 and keep the rows and the stretch graph (less to draw; loses the "keeps going, no limit" contrast with the straight reference line).
6. **No brightness or color.** Default: leave them out, and say so plainly. The brightness and the color of the light are the natural next questions ("so what would one actually see?"), but they add wavelength, photon counts or energy and a claim about detection that this specification cannot check. Alternative: add a lamp of a given color and show its stretched wavelength (a small, concrete addition, not needed for the idea).
7. **The three predictions and their choices.** Default as above; the wording, especially Prediction 2 (its tempting wrong answer is the whole point) and Prediction 3, needs the owner's review.
8. **The daily-life comparison.** Default: the friend walking away and tossing a ball each second, labeled as an analogy for the motion part only; none for the gravity part. Alternative: a siren on a receding vehicle (sound, a different medium, common but needs the speed of sound), or none.
9. **Real-world sentence.** Default: none (as Experiment 5). Alternative: one tutor sentence saying that real telescopes see infalling gas fade and redden near a black hole's horizon, marked as outside what the experiment shows and **not checked against a primary source**.
10. **Experiment 5's summary line.** Default: when this experiment is built, change Experiment 5's "what's next" (now "no further experiment is planned in this chapter") to point to it, in draft wording for the owner's review, as in earlier steps. Alternative: leave Experiment 5's text alone.
11. **Not checked against a primary source:** the arrival-time delay `r + ln(r − 1)` for an outgoing flash, the stretch-factor formula `[E + √(1/r − 1/r0)] ÷ (1 − 1/r)`, its split into gravity and motion parts, and the statement that the flash sent at the horizon never arrives, are standard general relativity stated from general knowledge. Claude checked them on 2026-10-11 only against each other (the split recomputed two ways, the arrival times against the far-away clock of Experiment 5 plus the delay, and the large-`r` limits); see "Implementation Notes".

---

## Relationship to Previous Experiments

- **Black Holes and Strong Gravity Experiment 5 (falling in):** the same fall. That experiment's far-away clock is the time at which the traveler *passes* each distance; this experiment adds the light's journey to the observer, and resolves the caveat Experiment 5 states (a comparison of clocks, not what an observer receives).
- **Black Holes and Strong Gravity Experiment 2 (time near a black hole):** this experiment's gravity part is that experiment's clock-rate factor, now for a source that is also moving.
- **Gravitational Waves Experiment 5 (redshift of a receding source):** this experiment's motion part is the same kind of stretching of a source moving away.
- **Black Holes and Strong Gravity Experiments 1, 3 and 4:** the horizon radius and the three black holes; the plunge and the capture (the same one-way trip).
- **Gravity and Curved Spacetime Experiment 2 (gravitational time dilation):** the same idea of a clock ticking differently in gravity.

## Relationship to Later Experiments

- Nothing further is planned or approved. The topics this one deliberately leaves out (brightness and color of the light, what a telescope would show, spinning black holes, Hawking radiation, the inside of a black hole) are the natural candidates, but none is proposed.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, captions and Results are shown.
2. Picture 1 shows the flashes as sent (evenly spaced) and as received (visibly further apart), joined by lines, with the last flash shown as never arriving, and each part labeled on the canvas.
3. All three pictures label every drawn component (both rows and their scales, the joining lines, the last flash, the three curves, the reference lines, the horizon time), visually distinguish the traveler's watch (blue) from the observer's clock (orange), and carry their own "How to read this picture" caption (`CLAUDE.md` §14).
4. The stretch factor reaches the values the model computes and keeps growing toward the horizon, and the observer's clock at arrival keeps growing without limit.
5. The Results correctly state the spacings, the stretch factors, the never-arriving flash, compare all three predictions with the model, and include the worked calculation and the daily-life comparison.
6. The experiment states plainly that it is a thought experiment about thin flashes sent straight outward, that the equations are for a non-rotating, uncharged black hole and are given, not derived, that only timing is modeled (no brightness, color or camera view), and that nothing inside the horizon is modeled.
7. The experiment connects back to Experiments 2 and 5 of this group and to Gravitational Waves Experiment 5, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15).

---

## Implementation Notes

Nothing has been built. A feasibility check was run in a scratch script outside the project on 2026-10-11 (not part of the application): the traveler's watch (closed form) and the far-away clock (stepped numerically) were reused from Experiment 5's equations; the arrival time (far-away clock plus the delay term), the stretch factor and its gravity and motion parts reproduced the tables above; the stretch factor computed from the direct formula and from the product of the two parts agreed at every distance tested; each tenfold closing of the gap added 4.6 to the arrival time (4.628 and 4.607 against `2 ln 10 = 4.605`) and multiplied the stretch factor by 10.

- **Approval (2026-10-11):** the owner approved this specification, taking all eleven "Decisions Needing Human Review" items as Claude's recommended defaults (the owner had first asked for "all 4" experiments; only this one had been proposed, and the owner chose to approve it and have the other three topics proposed one at a time later).

- **Step 1, physics model and physics tests (2026-10-11):** built `src/physics/seeingTheFallExperiment.ts` and `src/physics/seeingTheFallExperiment.test.ts` (23 tests covering all 15 "Required Physics Tests"). The traveler's watch is the closed form; the far-away clock at sending is stepped numerically (Simpson's rule in the logarithm of the distance of the cycloid parameter from its value at the horizon), restated here and not imported from Experiment 5; the arrival time adds the delay `r0 + ln(r0 − 1) − r − ln(r − 1)`; the stretch factor is computed directly from `[E + √(1/r − 1/r0)] ÷ (1 − 1/r)` and, separately, as gravity part × motion part. **Differences from the interface in this specification, for the owner:** (1) `Flash.spacingAsSent` is `null` for the first flash (it has no previous flash) instead of a number; (2) the `curve` points also carry `watch` (the traveler's watch at that distance), because Picture 3 plots the observer's clock against it; (3) `SMALLEST_GAP_IN_HORIZON_RADII` (0.0001) is exported, and the curve is spaced geometrically in the gap with 161 points; (4) the speed of light is imported from `hubblesLawExperiment`, as in Experiment 5; the regression test still forbids every other experiment's module, including `fallingInExperiment`. **Independent checks in the test file:** the motion part from the traveler's speed (`γ(1 + β)`, with `γ = E ÷ √(1 − 1/r)`); the stretch factor against a central difference of the module's own arrival time against its own watch (within 0.1%); the arrival time minus the delay against an integration of the ratio of clock rates, and against Experiment 5's figures from its specification (59.8, 62.1, 64.4). **Checked that the tests are not vacuous:** changing the sign in the motion part failed 4 of 23, the sign of the delay term 7, the denominator of the stretch factor 8, and the gravity part 4. Results match the feasibility check: arrival times of 49.78, 63.66, 75.63 and 84.86 at 5, 2, 1.01 and 1.0001 from 10; stretch factors of 1.581, 3.162, 191.1 and 18,975; the 20 flashes arriving 2.60 to 5.03 apart (the last before the horizon at 60.64); about 19,900 and 14,100 at 1.0001 from 100 and 2. Full Vitest run: 563 passed (540 before). No type errors in the new files. **Not built yet:** the interface, predictions, introduction, Results, tutor and wiring into `src/App.tsx`.

- **Step 2, basic interface (2026-10-11):** built `src/components/SeeingTheFallExperiment.tsx` and wired it into `src/App.tsx` as chapter 6 of the "Black Holes and Strong Gravity" group. It has the black-hole buttons, the release presets (100, 20, 10, 5, 2), Run (10 seconds of real playback, independent of the result: the 21 flashes are played one after another, which is presentation only), a readout, and three pictures, each with a "How to read this picture" caption (**draft wording, for the owner's review**, written in the short numbered style of Experiment 5's rewritten caption). **Picture 1, the flashes as sent and as received:** a top row for the traveler's watch (blue dots numbered 0 to 20, flash 20 in rose), a bottom row for the observer's clock (orange dots, the same numbers), thin lines joining each flash to its arrival, and flash 20's dashed rose line running off the end, labeled "never arrives"; the picture's header gives the current flash, where the traveler was when it was sent, and the gap since the last flash as sent and as received, with the stretch. **Picture 2, how much the spacing is stretched (graph):** the gravity part (violet), the motion part (green) and the stretch factor, their product (amber, thick), against the gap above the horizon (log scale, farther on the left), with a dashed line at 1 and a white dot for each flash sent so far. **Picture 3, the observer's clock against the traveler's watch (graph):** an orange curve rising without limit at the horizon time, the dashed line "if the two clocks always agreed", a rose line at the horizon time, and a dot for each flash. Every drawn part is labeled on the canvas. **Differences from this specification, for the owner:** (1) the two rows of Picture 1 have their own labeled axes but share one scale (in horizon light-times), so a longer gap on the bottom row is a real stretching and the joining lines slant by the delay, where "Display" says "separate" scales; (2) the curves of Picture 2 are violet, green and amber, not orange, green and blue, because orange and blue already mean the observer's clock and the traveler's watch in the other two pictures; (3) Picture 2's horizontal axis shows the gap running from far (left) to near (right), so the traveler falls to the right. Other changes outside the new file: Experiment 5's chapter summary "what's next" line now points to this experiment (draft wording; Decision 10), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists). **Checked** in headless Chromium at 1200 and 390 pixels (scripted, three black holes and release distances, mid-run and at the end, with screenshots viewed at 1200): the pictures are absent until Run; the flashes appear one after another and the last one runs off the end; labels were repositioned after the first look (the subtitles of two graphs were cut off, curve labels overlapped, and flash 20's header said "0 horizon radii"); no console errors; no sideways scroll at 390 pixels (where the pictures are small and their labels very small, the app-wide limit seen in earlier experiments). The full Vitest run passed. **Not built yet, by design:** the three predictions and their gating (so the pictures show after Run without them, as in earlier experiments at this step), the introduction, the Results panel and the tutor. **Not checked:** a screen reader, other browsers.

- **Step 3, learner prediction interaction (2026-10-11):** added the three prediction questions from "Prediction Activity" to `src/components/SeeingTheFallExperiment.tsx`. Until all three are answered, the black-hole buttons, release buttons and Run are disabled. The first Run locks the predictions in; "Change predictions" reopens all three without resetting the chosen black hole or release distance, and hides the pictures again. The readout and all three pictures appear only after the first Run (§12). The choices are not marked yet (that is the Results step). **Wording, for the owner's review:** Predictions 1 and 2 are as in the specification ("how do the flashes arrive?" with "At the same spacing as they were sent / Closer together / Further and further apart"; "Does the far-away observer ever receive the flash that is sent as the traveler crosses the horizon?" with "Yes, soon after it is sent / Yes, but only after a very long wait / No, it never arrives"). **Prediction 3 was reworded** because the specification's draft ("The flashes' spacing is stretched. What causes the stretching?") says the spacing is stretched, which gives away Prediction 1's answer on the same screen. It now reads: "Two effects could change how far apart the flashes arrive: gravity slowing the traveler's watch (Experiment 2), and the traveler moving away as they fall (like the receding source in Gravitational Waves, Experiment 5). Which of them do you think matters?", with the choices "Only gravity", "Only the traveler's motion" and "Both, and together they matter more than either alone". The word "stretch" is avoided for the same reason. **Browser check** (headless Chromium, 1200 and 390 pixels, scripted, 20 checks per width, all passed): fresh load shows the three questions and no picture, with the controls and Run disabled; two answers keep Run disabled; three (the last chosen from the keyboard) enable it; no picture until Run; during the run Run reads "Running..." and the prediction buttons are disabled; after the run "Change predictions" appears and the prediction buttons stay disabled; changing the black hole hides the pictures and a new Run shows them again; "Change predictions" hides them, keeps the choices and the chosen black hole, and re-enables Run; Prediction 3 does not mention the spacing being stretched; no sideways scroll; no console errors. Full Vitest run: 563 passed. **Not checked:** a screen reader, other browsers. **Still not built:** the introduction, the Results panel and the tutor.

Next step, when authorized: the introduction (§21 Step 6, learner-facing text).
