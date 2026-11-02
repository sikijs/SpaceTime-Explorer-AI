# Gap report: Gravitational Waves Experiment 2 (The Chirp: A Wave That Builds)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/02-the-chirp.md | Components: src/components/GravitationalWaveChirpExperiment.tsx, GravitationalWaveChirpTutor.tsx | Physics module: src/physics/gravitationalWaveChirpExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Same two-arm drawing, now driven by a rising chirp; one mass slider (0.2 to 6); three predictions; Results with an optional "Comparing your two runs" paragraph; 4-step tutor. Gaps: no caption, unlabelled drawing, no reading guide, no guess marks. The timing question compares two masses, but only one mass is on screen at a time. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Does the pitch speed up, slow down or stay the same? (:311) | pitchChoices (:80-84); `pitchPrediction` / `submittedPitchPrediction` (:154,:157) | Arm graph (:411-446): spacing of the oscillations along the time axis |
| 2 | Does the wave get stronger, weaker, same? (:319) | loudnessChoices (:86-90) | Arm graph: height of the oscillations |
| 3 | Small-mass or large-mass pair reaches its final moment sooner? (:327) | timingChoices (:92-96) | **No picture holds both masses.** Only one run's end time is drawn (graph x-axis = that run's cutoff) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | Run values come from `chirpRunFor`/`chirpStateAt` (:165-167); prediction state never feeds them | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:398-446) | Q1/Q2: marks on the arm graph. Q3: a second run-length bar |
| A3 | Not met | Not drawn; Q1 to Q3 are choices (markers only) | Say "only a marker" in the caption |
| A4 | Not met | n/a; the graph appears once the run starts (:411) | Marks only once the trace has been drawn |
| A5 | Not met for Q3 | The end time of the other mass is not drawn at all. Nearest picture: the arm graph; add a small "time to the final moment" bar panel for small vs large mass with its own scale | New panel in the graph area |
| A6 | Not met | No source line under the drawing or graph | Add "calculated here (a simplified stand-in, not LIGO's equations)" |
| A7 | Not met | Intro (:260-308) has no mention of predictions never changing pictures, or white marks. A note at :336-341 says the learner can "change predictions" | New intro text; note beside the mass slider |
| A8 | Not met | Module exports `chirpRunFor`, `chirpStateAt` only. Truth constants live in the component (`ACTUAL_PITCH`, `ACTUAL_LOUDNESS`, `ACTUAL_TIMING`, :28-30) | Module functions for mark positions and real values, with tests |
| A9 | Not met | Tutor compare step states every answer (GravitationalWaveChirpTutor.tsx:77-78); Results does too (:501-515). No marks to point to | As Experiment 1 |
| A10 | Not met | No sentence says guesses do not change results. The only related text says guesses are "locked in", and offers a **"Change predictions"** button after the run (:335-356) | Report only: the button lets a learner change guesses after seeing results, which the newer rule may want reconsidered |

## Rule B
- B0: One Results block (:448-525): a numbers paragraph (frequency and amplitude start and end, cutoff time, strain), arm ranges, an optional "Comparing your two runs" paragraph (:479-500), three prediction lines, and a "A real chirp" note. No tables.
- B1: Real reference: GW150914 rose from about 35 Hz to about 250 Hz over about 0.2 s (:517-523). The toy numbers (1 to about 4) are not on that scale, so a check-up would be "not comparable". Likely N/A.
- B2: Not met.
- B3: Partly met. The "Comparing your two runs" paragraph (:479-500) follows the slider, but it is not a table and has no reference.
- B4: Partly met. Guess beside "In fact" lines, no tag on a row, with a verdict.
- B5: Not met. "x louder" ratio and "strain x 50 %" are computed in the component (:461,:468), not in the module. The `* 50` factor is unexplained.

## Rule C
- C1: Not met. Arms and dots have no text (:404-408); the source is not drawn.
- C2: Partly met. Mass changes the run time and amplitude, but the picture of arms looks alike at start. The two masses are never on screen together.
- C3: Not met. Only a one-line graph legend (:441-445).
- C4 to C6: Not met (no caption, no worked moment, no look-for list).
- C7: Partly met. Intro "What happens" says pitch and loudness "build" (:276-280), and the coin analogy says "speeds up and gets louder" (:268-273): this gives Prediction 1 and 2's answers before the learner predicts (§12). The graph legend says "notice the oscillations getting faster and bigger" (:443-444).
- C8: Partly met. "Chirp" and "strain" are defined in passing; "amplitude" and "frequency" are never defined in the intro. "Mass" scale is "made-up" (:304).

## Other findings
- O1: Spec status says wording approved 2026-09-30; no conflict found.
- O2: (a) Intro gives answers to predictions 1 and 2 (see C7). (b) The "Orbit experiment" (Tutor:129) is a cross-reference by name to a different chapter. (c) "Twin Paradox's turnaround" (Tutor:139) likewise. (d) GW150914 figures (:517-523) have no link.

## What an update would touch, and its size
Component, tutor, physics module (+ tests), spec. **Size: M to L** (Q3 needs a new panel for two masses; the other two marks sit on the existing graph).

## Not checked
Not run in a browser. PROJECT.md/AGENTS.md not read in detail. Real-figure sources not opened.
