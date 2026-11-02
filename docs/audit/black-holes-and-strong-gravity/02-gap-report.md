# Gap report: Black Holes and Strong Gravity Experiment 2 (Time Near a Black Hole: Does a Clock Ever Stop?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/02-time-near-a-black-hole.md | Components: src/components/TimeNearBlackHoleExperiment.tsx, TimeNearBlackHoleTutor.tsx | Physics module: src/physics/timeNearBlackHoleExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (two clocks and ruler; rate against distance with exact and simple-formula lines; readings over time), a Results part with 3 tables, text-only prediction checks and a tutor. Pictures and captions are labelled and clear. Gaps: no guess marks, no "Where the real picture comes from", no check-up or per-table notes, no three-part "what to look for", Picture 3 caption has one item only. Size: **Medium** (Picture 2 can carry all three guesses on its existing axes; Results needs a reading guide).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Clock hovering 1% outside the horizon: how fast does it tick? (TimeNearBlackHoleExperiment.tsx:420) | same / half / one tenth / stopped (:63-68); `justOutsidePrediction`, locked into `submittedJustOutside` at first Run (:229-233) | Picture 2, height of the line at distance 1.01 (real value about 0.0995) |
| 2 | Two clocks at 2 horizon radii, near a 10-Sun and an M87* hole: which ticks more slowly? (:440) | small / giant / same rate (:70-75); `massPrediction` | Picture 2 at distance 2 (one line serves every mass); also the "all three black holes" table (:1022) |
| 3 | Will the simple formula still be accurate next to a horizon? (:460) | 3 buttons (:77-82); `approximationPrediction` | Picture 2: the gap between the solid and dashed lines |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :202-204 | Listed |
| A1 | Met | results come from `runTimeNearBlackHoleExperiment`, `exactSlowingFactor`, `firstOrderSlowingFactor`; no real value reads prediction state (:303, :925-1000 only choose the sentence to show) | None |
| A2 | Not met | no marks in Pictures 1-3 | P1: white YOUR GUESS mark at heights 1 / 0.5 / 0.1 / 0 above x = 1.01 on Picture 2. P2 and P3: markers (no size of their own) |
| A3 | Not met | | P1 follows the guess; P2 and P3 are marker-only, caption must say so |
| A4 | Not met | Picture 2 is drawn in full as soon as pictures appear (:693-768) | Marks can all appear with the picture; P3's mark should wait until the dashed line is drawn (it is drawn at once) |
| A5 | Partly | P2's answer has no picture of two black holes side by side | Add a small panel in Picture 2 (or beside it) showing the factor at 2 radii for the 10-Sun hole and for M87*, on the same scale |
| A6 | Not met | no source line under pictures (:832-920) | Needed: exact formula calculated here; masses are the rounded values from Experiment 1; Picture 3 is a calculation of two clocks, not a measurement |
| A7 | Not met | intro (:324-410) has no statement about predictions not changing pictures, white marks, or controls | Add; add a note beside the black-hole and distance controls (:515-590) |
| A8 | Not met | Module has `exactSlowingFactor`, `firstOrderSlowingFactor`, `runTimeNearBlackHoleExperiment`, `clockReadingsAt`, `surfaceSlowing`, curve | Missing: guess to height / marker mapping, tested |
| A9 | Partly met | Tutor "observe" (TimeNearBlackHoleTutor.tsx:112) points to "the two clocks", not to marks; "compare" (:115) restates the guesses; the explained step does not mark them (the marks of right/wrong are in the Results, below) | Tutor must name the marks and mark each prediction |
| A10 | Not met as such | no "predictions do not change" sentence found by search; "Your predictions are locked in above" (:497) | Nothing to quote |

## Rule B
- B0 tables today: Results table of 4 rows (:932-955); "Here are all three at your distance" table (:1024); "same effect on real objects" table (:1060); worked math list (:1000-1020); prediction checks (:957-996); a "model can and cannot tell you" box (:1096).
- B1 Not met. A real reference exists: the exact formula versus the simple formula of Gravity Exp 2 and 9, and the test that the simple formula matches Gravity Exp 9's GPS figure within 1% (module test :99). The Results row 4 already gives "x% too high". A check-up table could set "simple formula" beside "exact" at 10, 2, 1.01 radii. No measured value near a black hole exists (stated in the spec as a thought experiment).
- B2 Not met: no per-table "What this table tells us"; the paragraph after the real-object table (:1076) is partial.
- B3 N/A: controls select a distance and a hole; no published value to compare.
- B4 Partly: guesses shown in text (:957-996) with "right / off this time" verdicts (:964, :979, :991); no tag on a table row; not drawn on a picture.
- B5 Partly: all table numbers come from the module. UI has local arithmetic (`percentTooHigh`, `holesAtTwo`, "Math.round(1 / surfaces[0].rsOverR / 1e7) * 10" in the Results, :1076), and tutor calculates "tooHighAt..." percentages (Tutor:77-78) outside the module.

## Rule C
- C1 Met: clocks, horizon, ruler, dot, graph lines and legend are labelled in the SVG (:593-768, text at the lines found).
- C2 Met: the hands drift apart; blue and orange lines differ; changing distance moves the dot and both clock readings.
- C3 Met: "How to read these diagrams" (:833).
- C4 Mostly met: Picture 1 has 7 items (:844-885), Picture 2 has 3 (:892-907), Picture 3 has 1 (:914-919). Units: horizon radii, AU defined in intro (:352-362). Picture 3's axes and the "dots" get one short item; no mention of the 60 s run.
- C5 Not met: no worked moment with real numbers inside the caption (the Results math has one, :998-1020).
- C6 Not met: "What to look for" is only in the intro (:380) and a loose sentence in Picture 2 item 3 ("Look at where the two lines...", :903); not Look at / Means / Why.
- C7 Partly: Picture 2's caption (:903-906) directs the learner to where the formulas "pull apart" and "what each says at the horizon", which edges toward Prediction 3. The code comment (:326-329) deliberately keeps the intro clean; the picture only appears after lock-in.
- C8 Mostly met: far-away clock, hovering clock, horizon, horizon radius, AU defined before use (:352-362). "Logarithmic" is explained in the caption (:861).

## Other findings
- O1: none against the spec found in the parts read.
- O2: Results verdicts "So your prediction was right / off this time" are the older-rule form; new rule leaves verdicts to the tutor.
- O2: the "swimmer above a waterfall" comparison (:1081) is flagged in its own text as an analogy for the push, not for time slowing. Unsourced.

## What an update would touch, and its size (O3, O4)
TimeNearBlackHoleExperiment.tsx (marks on Picture 2, small panel for P2, source lines, check-up, notes, caption items, intro and control notes), TimeNearBlackHoleTutor.tsx, physics/timeNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser. SVG text was read from grep of the text elements, not every attribute. Tutor "explained" step read only by search for prediction wording. Links: none on this page.
