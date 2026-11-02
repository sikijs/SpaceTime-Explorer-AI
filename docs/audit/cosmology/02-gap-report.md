# Gap report: Cosmology Experiment 2 (The Big Bang)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/02-the-big-bang.md | Components: src/components/BigBangExperiment.tsx, BigBangTutor.tsx | Physics module: src/physics/bigBangExperiment.ts (+ .test.ts, 8 tests; also reuses hubblesLawExperiment.ts) | Status: read-only, nothing changed

## Summary
Two pictures (a time ruler counting down and a row of galaxies sliding to Earth), a "play forward" replay, two predictions, Results of prose with an amber note (no tables), a 3-prompt tutor with a five-point explanation. Verdicts ("right / off this time") sit in Results, not the tutor. No guess marks, no check-up, no reading guide, no worked moment or three-part look-for items, no "Where the real picture comes from". The 13.8-billion-year real age is a real reference the guess could be drawn against. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Farther galaxy's implied time since zero distance: longer, shorter, same? (BigBangExperiment.tsx:351-352; state :86, :88) | Longer / Shorter / The same (:57-61) | The ruler (picture 1, :538-604): its 0 end is the same for every galaxy; also the "reaches Earth" moment in picture 2 (:606-673) |
| 2 | How will this experiment's answer compare with the real age (about 13.8 billion years)? (:368-370) | Much longer / Much shorter / Close, but not exact (:64-68) | The ruler's "13.97 billion years ago" end (:585); no 13.8 mark exists on it |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runBigBangExperiment(selectedDistanceMpc)` (:112) and `distanceAtPastTimeMpc` (:627) take no prediction input; prediction state is used only in text (:388-394, :730-745) and tutor props (:782-783) | none |
| A2 | Not met | No guess element in either SVG (:538-673) | White "YOUR GUESS" boxes: Prediction 2 on the ruler at a position for the guess relative to the real-age tick; Prediction 1 on picture 2 / ruler |
| A3 | Not met | | Guesses are 3-way choices: markers, caption to say "marker only". Prediction 2 could carry a size ("much longer" etc.) only if the owner defines it |
| A4 | Not met | The ruler appears with the Run (:538) | Mark after the backward run finishes |
| A5 | Not met | The real 13.8 Gyr age has no mark on the ruler | Add a "real measured age" tick on the ruler as its own labelled element |
| A6 | Not met | no "Where the real picture comes from" | Needed: Hubble time = 1/H0 (calculated here); 13.8 Gyr (measured by others; not derived here, as intro :339-340 says); galaxy distances illustrative |
| A7 | Not met | Introduction (:258-346) has no statement about guesses or white marks | Add sentences; note beside Galaxy buttons (:421-477) |
| A8 | Not met | `ACTUAL_TIME_COMPARISON = 'same'`, `ACTUAL_AGE_COMPARISON = 'close'` are constants in the component (:73-74); module has no function for a guess's mark position | Module functions plus tests for mark positions; the "close" verdict is only tested as "within about 10%" (bigBangExperiment.test.ts:25) |
| A9 | Not met | Tutor compare prompt restates the guess but names no mark (BigBangTutor.tsx:64-65); the verdict is in Results (BigBangExperiment.tsx:735-745), not the tutor | Prompts to name the marks; the owner to decide where verdicts go (§14) |
| A10 | Not found | No "do not change the results" sentence in BigBangExperiment.tsx or BigBangTutor.tsx | Absent here, although CLAUDE.md §14 says older experiments carry it |

## Rule B
- B0: Results (:720-776): the Hubble time sentence, two "Checking your ... prediction" paragraphs with right/off, an "Earth is not special" paragraph, and an amber "not how astronomers measure the age" box. No tables.
- B1: Not met. A real reference exists: measured age 13.8 Gyr (`REAL_UNIVERSE_AGE_YEARS`, :5 and :766). A check-up row would be "this model (about 14.0 Gyr, calculated) vs measured 13.8 Gyr", reading "more", not "close enough" (no accepted cut-off); the test uses 10% (bigBangExperiment.test.ts:25) which is a code threshold, not a published one.
- B2: Not met (no tables; the amber box says what and why but without numbers beyond 13.8).
- B3: N/A. Galaxy choice only moves marks; the Hubble time does not change with it.
- B4: Partly met (guess shown in prose with verdict; no tag on a row, and verdict wording against §14).
- B5: Not met (no comparison functions).

## Rule C
- C1: Partly met. Labelled: "Earth" (:622), each galaxy (:668), ruler ends (:585, :588), pointer text (:601-602). Unlabelled: the ruler's alternating blocks and ticks, the gold trail (named only in the caption), the "singularity" is labelled only at the ruler end.
- C2: Met. Different distance gives a different starting x (`positionXForDistance` :38-41); the selected galaxy is gold and pulsing.
- C3: Partly met. "How to read this diagram" (:678) appears beneath the pictures but only after predictions are locked (`hasSubmittedPrediction` :675).
- C4: Partly met. Explains Earth, selected galaxy, ruler, backward run, forward replay (:678-713). Does not define "billion years ago", "Mpc", "Hubble time" in the caption (Hubble time and singularity are defined in the intro :267-273); no colours for non-selected galaxies stated beyond "dot".
- C5: Not met. No worked moment with numbers in the caption. The intro example (:302-306) sets up the sum but gives no result (16.5 Mpc at 1,155 km/s is not worked).
- C6: Not met. The "watch ..." items (:696-699, :711-713) are single sentences, not Look at / Means / Matters.
- C7: Partly met. :698-699 "Watch whether every galaxy reaches that moment at the same time, or at different times" nearly restates Prediction 1 (same / longer / shorter) and so hints at it; :711-713 ("the farther galaxy moves out faster ... because Hubble's Law makes recession speed proportional to distance") gives a mechanism in the caption.
- C8: Partly met. "singularity", "Hubble time", "horizon problem", "cosmic inflation" are defined in the introduction before use; "Mpc" and "recession speed" are not defined here (assumed from Experiment 1).

## Other findings
- O1: None against the specification found in what was read (spec's decisions not re-read). CLAUDE.md §14 vs. code: no older-rule sentence (A10).
- O2: The introduction gives a long horizon-problem and inflation paragraph (:276-292) before the learner predicts; it is outside the experiment's own results and states inflation "explains the horizon problem well", unsourced here. The bedsheet / football field comparison is also unsourced. The Results box gives the answer to Prediction 2 ("close to this experiment's naive estimate"), which is after the run, so acceptable. No links list (not required outside Cosmic Horizons).

## What an update would touch, and its size
BigBangExperiment.tsx, BigBangTutor.tsx, src/physics/bigBangExperiment.ts and test, the specification 02-the-big-bang.md. Size **M**.

## Not checked
Rendering in a browser, the forward-replay behaviour at runtime, the specification's decisions table in full, the tutor's explanation text after line 100 (only grepped).
