# Gap report: Gravitational Waves Experiment 5 (Stretched by Motion)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/05-redshift-of-a-receding-source.md | Components: src/components/GravitationalWaveRedshiftExperiment.tsx, GravitationalWaveRedshiftTutor.tsx | Physics module: src/physics/gravitationalWaveRedshiftExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
A chirp seen from a receding source at 0 to 0.9 c, with "Emitted" and "Detected" beacons, wave traces, and a "cycles behind" badge. Two predictions (higher/lower/same; more/less/exactly the classical stretch). Gaps: the caption is one short paragraph shown only after a run, with no reading guide, no marks; the intro and drawing preview both answers. The drawing already shows the contrast well (Emitted vs Detected). Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Detected frequency higher, lower or same as at the source? (:346-349) | higher / lower / same (:63-68); `directionPrediction`, `submittedDirectionPrediction` (:98,:100) | The "Emitted" vs "Detected" wave traces (:547-556): the detected wave is longer |
| 2 | Will the real stretch be exactly, more or less than an everyday Doppler effect? (:364-367) | exact / more / less (:70-75); `magnitudePrediction` (:99,:101) | **Not drawn.** The classical factor appears only as a number in Results (:590-591). Nearest picture: the Emitted/Detected pair; add a third "classical-only" trace on its own scale |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | `dopplerFactorFor(speed)`, `chirpStateAt` (:110-124); predictions not read by physics | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:457-568) | Q1: mark beside the Detected trace; Q2: mark on a classical-vs-real bar |
| A3 | Not met | Q1 and Q2 are choices; markers only | "Only a marker" note |
| A4 | Not met | n/a; the traces are drawn when `isActive` (:551,:556) | Draw marks then |
| A5 | Not met for Q2 | See table above | New small panel: classical factor vs real factor, its own scale |
| A6 | Not met | No source line (:457-578) | "Calculated here" for both factors |
| A7 | Not met | Intro (:272-343) has no mention of guess marks | New text |
| A8 | Partly met | Module has `classicalDopplerFactorFor`, `dopplerFactorFor` with 5 tests (physics/gravitationalWaveRedshiftExperiment.test.ts:5-35). Missing: mark positions, and the "higher/lower/same" and "exact/more/less" truth. The truth is decided inside the component with `runSummary.speed === 0` branches (:592-605) | Module function returning the answer for any speed |
| A9 | Not met | Tutor compare (GravitationalWaveRedshiftTutor.tsx:68) and Results "In fact" (:600-606) give the answers | As earlier |
| A10 | Not met | No sentence says guesses do not change results; "Change predictions" button (:394-415) | Report only |

## Rule B
- B0: One Results block (:580-614): emitted and detected frequency, measured and classical factor, a sentence on why, a prediction line with "In fact", and a velocity-only-redshift note. No tables.
- B1: Real reference exists: the exact relativistic Doppler factor is the module's own output; the "expected" classical alone is the comparison. A two-row check-up (classical vs real) is natural and the numbers are already in the module.
- B2: Not met.
- B3: Partly met. The speed slider changes the numbers, but no table or reference.
- B4: Partly met (text only, verdict).
- B5: Partly met. Factors from the module. The 0 or non-zero branch is in the component.

## Rule C
- C1: Partly met. "Arm X", "Arm Y", "Emitted", "Detected" and the badge "x behind" are drawn (:523-566). The badge's "behind" has no unit on the canvas (behind what? cycles).
- C2: Met. Emitted and Detected pulse and draw visibly different waves, and the badge changes with speed.
- C3: Partly met. A one-paragraph note (:569-578) appears only after a run starts; no "How to read this diagram" heading.
- C4: Partly met. It explains the beacon size and the direction of the difference; it does not explain the traces' colours, the arm overlay, the 10x scroll boost (:240-241), or the badge.
- C5: Not met. No worked numbers (for example 0.5 c, factor 0.577 vs 0.667).
- C6: Not met. The "What to look for" paragraph (:306-317) is a prose block before the run.
- C7: **Not met.** "What happens" says the arms pulse at the detected frequency, "slower than the frequency the source actually emitted" (:296-298), and "What to look for" says the factor is "slightly bigger than an everyday Doppler effect alone" (:315-316). These give both answers before the learner predicts (§12).
- C8: Partly met. "Doppler effect" and "redshift" are explained (:281-292); "time dilation" is used in Results (:594) and the tutor via cross-reference only; "Doppler factor" is shown in the readout (:452) before it is defined.

## Other findings
- O1: None found. Spec says wording approved 2026-10-04.
- O2: (a) §12 hints above. (b) "Slightly bigger" (:315) understates it: at 0.9 c the real factor (about 0.23) differs from the classical (0.53) by more than a factor of two (computed from the formulas in the module; not run). (c) The speed range up to 0.9 c for a gravitational-wave source is a toy; the page says so. (d) "first defined in the Gravity and Curved Spacetime chapter" (:290) is a chapter reference, not a link.

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: M** (one new classical-vs-real mini panel, marks on two existing/new areas, caption rewrite).

## Not checked
Not run in a browser. The factor values quoted in O2 are my arithmetic, not a run. PROJECT.md/AGENTS.md not read in detail.
