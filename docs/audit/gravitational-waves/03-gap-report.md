# Gap report: Gravitational Waves Experiment 3 (Where the Energy Comes From)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/03-orbital-energy-loss.md | Components: src/components/GravitationalWaveEnergyExperiment.tsx, GravitationalWaveEnergyTutor.tsx | Physics module: src/physics/gravitationalWaveEnergyExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
The Experiment 2 chirp plus a new graph of remaining orbital energy; one mass slider; one prediction (energy increases / decreases / stays); Results; 4-step tutor. Gaps: no caption (graph legends only), no on-canvas labels, no reading guide, no guess marks; the introduction states the answer before the prediction. The prediction's picture exists (the energy graph), so marks are easy. Size: **S to M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | What happens to the orbital energy as pitch and loudness rise? (:301-304) | increases / decreases / stays-the-same (:82-86); `energyPrediction` / `submittedEnergyPrediction` (:99-100) | The energy graph (:433-461): the brown line's slope from the top-left to the bottom-right |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | `orbitalEnergyStateAt(displayedTime, mass)` (:109); prediction not read by physics | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:391-461) | A white line on the energy graph showing the guessed direction (rising, flat, falling) from the start value, with a box |
| A3 | Not met | The three choices have a slope, so the mark could follow the guess | Mark follows the guess |
| A4 | Not met | Graph appears once the run starts (:433). A mark should appear then | Draw at the same time as the real line |
| A5 | Met (the graph exists) | The picture is the energy graph | No new picture needed |
| A6 | Not met | No source line (:433-461) | "Calculated here from a toy formula" |
| A7 | Not met | Intro (:200-298) says nothing about guess marks. A note at :327-348 says the guess is "locked in" | New intro text and note beside the mass slider |
| A8 | Not met | Module exports `orbitalEnergyStateAt` only (src/physics/gravitationalWaveEnergyExperiment.ts:25-). Truth `ACTUAL_ENERGY` is a constant in the component (:28) | Module function giving the guess's line and the real value, with tests |
| A9 | Not met | Tutor compare (GravitationalWaveEnergyTutor.tsx:56) states the answer, as does Results (:477-481) | Tutor to name the mark |
| A10 | Not met | No sentence says guesses do not change results; a "Change prediction" button reopens the guess after a run (:327-348) | Report only |

## Rule B
- B0: One Results block (:463-490): energy numbers (start, remaining, radiated at the final moment), prediction line with "In fact", and "A real detection" note (GW150914, 3 solar masses). No tables.
- B1: Real reference in the spec: GW150914 radiated about 3 solar masses of energy in about 0.2 s. The toy energy is in "made-up units" (:289-292), so a check-up is not possible. Likely N/A.
- B2: Not met.
- B3: N/A (mass slider only rescales the drawing).
- B4: Partly met (text beside "In fact", no tag, with a verdict).
- B5: N/A or Partly met. Numbers come from the module; the final-moment values are taken from the last frame's state (:173-179).

## Rule C
- C1: Not met. Arms, dots and both graphs have no on-canvas labels (:397-451); the energy line has a legend sentence only (:452-460).
- C2: Partly met. Mass changes the energy scale; the graph is rescaled to each run's own start (:60-67), so two masses look the same shape. That is deliberate (all runs end near-empty) but hides the "bigger mass, more energy" contrast.
- C3: Not met (graph legend text only).
- C4/C5/C6: Not met. No worked moment; no look-for list.
- C7: **Not met.** The intro says the ripple "carries away some of their orbital energy" (:221-223), and "the orbiting pair's own energy draining away" (:250-252), and the pendulum paragraph says an inspiraling pair "loses energy" (:260-265). That gives Prediction 1's answer before the prediction. The graph legend (:455-458) also describes the fall before it is observed (shown only after the run starts, so lower concern).
- C8: Partly met. "Energy" and "orbital energy" are defined (:202-209). "Pitch" is used (:246) as in Experiment 2.

## Other findings
- O1: Spec header says wording approved iteratively in conversation (2026-09-30); `CLAUDE.md` lists 2026-10-13. Not a conflict, but two dates.
- O2: (a) The §12 hint above. (b) "More power than the combined light of every star in the observable universe" (:483-487) has no link on the page. (c) Intro refers to "the Black Hole experiment's same made-up mass scale" (:294) with no chapter name. (d) Energy "ending near-empty" (:456) is not strictly true: the model stops with energy remaining before merger (module `1 - s`).

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: S to M** (one prediction, one existing picture; the larger job is a caption and labels).

## Not checked
Not run in a browser. PROJECT.md/AGENTS.md not read in detail. The GW150914 figures were not checked against a source.
