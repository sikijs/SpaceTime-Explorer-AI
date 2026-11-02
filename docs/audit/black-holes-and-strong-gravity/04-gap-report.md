# Gap report: Black Holes and Strong Gravity Experiment 4 (Light Near a Black Hole: Can Light Be Trapped?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/04-light-near-a-black-hole.md | Components: src/components/LightNearBlackHoleExperiment.tsx, LightNearBlackHoleTutor.tsx | Physics module: src/physics/lightNearBlackHoleExperiment.ts (+ .test.ts, 30 cases) | Status: read-only, nothing changed

## Summary
Three predictions, a bird's-eye picture of the light's path and a graph of total bend against aim, each with a "How to read" caption; a Results part with a main table, a three-black-holes table, three text prediction checks and worked math; a tutor. Good structure. Gaps: no guess marks, no source lines, no check-up or table notes, "What to look for" is missing from the captions (only the intro has one). The graph is a natural home for all three guesses. Size: **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Beam aimed to pass 5 horizon radii out: what happens? (LightNearBlackHoleExperiment.tsx:~680-700) | straight on / bent then escapes / captured (:53-58); `bendPrediction` locked as `submittedBend` (:505-509) | Graph (BendGraph, :334): bend at aim 5 (real value is in `checks.five`) |
| 2 | How close to the center must light be aimed to be captured? (:699) | 1 horizon radius / about 2.6 / about 10 (:60-65); `capturePrediction` | Graph: the green critical-aim line (x = 2.598); path picture's green ring |
| 3 | Aimed only a little farther out than the capture distance: what happens? | small bend / swings round more than 180° and escapes / captured anyway (:67-72); `justOutsidePrediction` | Graph: bend just right of the green line (aim 2.6, over 360°, near the top where the axis stops at 400°) |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :459-461 | Listed |
| A1 | Met | `runLightNearBlackHoleExperiment`, `lightPath`, `bendCurve`; prediction state only picks wording at :995-1036 | None |
| A2 | Not met | no mark in the path picture (:221) or BendGraph (:345) | P2: white YOUR GUESS vertical line at x = 1 / 2.6 / 10; P1: white dot on the graph at x = 5 at the bend guessed (about 0° for "straight on", etc.) ; P3: white mark near the top right of the green line |
| A3 | Not met | | P2 follows the guess; P1 and P3 follow it partly (an outcome such as "captured" has no height, so a marker) |
| A4 | Not met | the graph's green line and curves appear at once | Marks appear with the picture |
| A5 | Met in principle | all three answers live on the graph, which exists | None needed beyond marks; P1 at x = 5 is a fixed aim, whatever aim the learner chose |
| A6 | Not met | no source line under either picture (:866-931) | Needed: paths and bends calculated here from the equation for light near a black hole; the orange simple formula is Gravity Exp 8's; nothing measured (the 3√3/2 critical aim is the same exact theory) |
| A7 | Not met | intro (:566-680) says nothing of predictions not changing pictures, white marks or controls | Add; add a note by the black hole and aim controls |
| A8 | Not met | module has `weakFieldBendRadians`, `lightPath`, `runLightNearBlackHoleExperiment`, `bendCurve`, constants `CRITICAL_AIM_IN_HORIZON_RADII`, `PHOTON_SPHERE_IN_HORIZON_RADII` | Missing: guess to graph position mapping and tests |
| A9 | Partly | Tutor observe/compare (LightNearBlackHoleTutor.tsx:~114-117): observe points to the path, compare restates guesses; explained step does not mark | Tutor must name marks and mark each prediction |
| A10 | Not met as such | no "predictions do not change" sentence found; "locked in" wording only | n/a |

## Rule B
- B0 tables today: main Results table, 5 to 7 rows depending on outcome (:942-990): what happened, bend, simple formula value, turns swept, closest approach, critical aim, where light can circle; "critical aims for all three black holes" table (:1078); three prediction checks (:995-1036); worked math (:1039-1075); daily-life comparison (ball and funnel, :1105); "can and cannot tell you" box (:1122).
- B1 Not met. Reference: the exact bend versus the simple formula 2/b (already row 3 "so the exact bend is N times larger"); the critical aim 3√3/2 is the same theory. No measurement of light near a black hole is cited in this experiment (the spec relates to later experiments).
- B2 Not met: no "What this table tells us"; the paragraph before the three-hole table (:1066-1070) is the nearest.
- B3 N/A: the controls pick a hole and an aim; nothing published to compare.
- B4 Partly: guesses are in text with verdicts ("So your prediction was right / off this time", :998-1036); no tag on a row; not drawn.
- B5 Partly: table numbers come from the module. The UI does arithmetic: `toDegrees`, `formatLarger`, and the "checks" calls (`checks.five`, `.two`, `.ten`, ...); worked math writes "√3 is about 1.732" and "A radian is about 57.3°" as literals (:1043-1060).

## Rule C
- C1 Met (read): the path picture has a header, a live readout, labelled rings, aim line and scale bar (:221-345); the graph has labelled axes, curves, green line, x mark (BendGraph).
- C2 Met: blue path versus dashed straight line; blue versus orange curve; rose capture area.
- C3 Met: two captions (:867, :908).
- C4 Mostly met: names the picture, each line, ring and bend with 180° example; scale bar; axes and limit (graph stops at 400°). No "when things appear" order for the run (the path is drawn as the run plays).
- C5 Not met: no worked moment with real numbers in the captions (the Results has worked math).
- C6 Not met: neither caption has "What to look for" (only the intro, :645); no Look at / Means / Why.
- C7 Partly: the path caption defines the "critical aim" and the green ring (:884-887) and the graph caption names the green line (:922), which is Prediction 2's answer (2.6). Both appear only after lock-in. The intro keeps clear of the answers (comment :561-565 not checked line by line).
- C8 Met: aim distance, bend, captured, horizon, horizon radius and AU are defined in the word list (:618-627); "critical aim" is defined in the caption at first drawing; "radian" is explained in the Results math (:1060).

## Other findings
- O1: none against the spec found in the parts read.
- O2: verdict sentences in the Results ("right", "off this time") are the older-rule form.
- O2: Results prediction check 2 contains a hard-coded list "aimed at 2.5 ... 2 ... 2.7 ... 10" computed in `checks` but written in the text; if checks change, the wording does not.
- O2: ball-and-funnel comparison (:1105) has no source (labelled an analogy).

## What an update would touch, and its size (O3, O4)
LightNearBlackHoleExperiment.tsx (marks in BendGraph and path picture, source lines, check-up, notes, caption look-for items, intro and control notes), LightNearBlackHoleTutor.tsx, physics/lightNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser; BendGraph's SVG internals and the tutor's explained step were not read line by line. Intro comment at :561 and the "What we assume" list (:649-680) only skimmed. Links: none on this page.
