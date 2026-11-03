# Gap report: Cosmic Horizons Experiment 11 (The fastest spacecraft)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/11-the-fastest-spacecraft.md | Components: src/components/FastestSpacecraftExperiment.tsx, FastestSpacecraftTutor.tsx | Physics module: src/physics/fastestSpacecraft.ts (+ .test.ts, 28 `it`s) | Status: read-only, nothing changed

## Summary
Older-pattern experiment (2 predictions, 3 pictures + orbit drawing, 2 controls, 4 tables, tutor, Words panel). Gaps: no guess marks; no check-up/notes/predictions block; no source lines; no "predictions do not change" wording; white = learner's own point. Note a quirk: Prediction 2 asks about a clock gap in a day at the closest point, which is Picture 3's top graph in milliseconds. Size **L** with Rule B (A + C: M).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | Gravity and speed at closest point: both slow / both speed up / work against? (FastestSpacecraftExperiment.tsx:887) | (:556-560) | Picture 1, the probe's bar (lavender gravity part and green motion part). Category: marker |
| 2 | Clock gap after a day at the closest point (:900) | ~35 us / ms / s (:561-565) | Picture 3 top graph (ms a day) at closest point; or Picture 1 total |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | pictures take `yours: Yours` from controls (:198,:333,:432); predictions go to tutor (:1229) | none |
| A2 | Not met | no YOUR GUESS | white box + line on Picture 1 and Picture 3 |
| A3 | Not met | | marker for Prediction 1 with the caption saying so |
| A4 | Not met | Pictures grow by stage (look-for slices :1020) | draw once feature exists |
| A5 | N/A | pictures exist | decide Picture 1 vs 3 for the size guess (owner) |
| A6 | Not met | | measured (NASA: distance, speed), calculated here (the lag; "no measurement by the mission" per spec), imagined (none) |
| A7 | Not met | "Nothing here is graded." (:834-835); controls note near :1085 | add the rule's wording |
| A8 | Partly met | `effectsAnswer`, `sizeAnswer`, `lagMillisecondsPerDay`, `effectsOf`, `timeScale` tested (fastestSpacecraft.ts:154,164,171,174,120) | numeric values for the guess buttons (35e-6, 35e-3, 35 s) |
| A9 | Not met | prompt "Look at Picture 1..." (FastestSpacecraftTutor.tsx:119-121); explanation-only marking (:167-177) | name the marks |
| A10 | Older rule, partly | "Your predictions are recorded and not marked here." (:960); no sentence that they leave the pictures unchanged | |

## Rule B
B0: Table 1 what changes each clock's rate (:1146); Table 2 round the orbit (:1159); Table 3 published facts (:1180); Table 4 your point on the orbit (:1197). Unit note at :1143.
| Item | Result | Gap |
|---|---|---|
| B1 | Not met | Reference: NASA's published closest distance and speed (`PARKER` constants) vs the page's own; the lag itself has no measurement to compare (spec: calculation, not a measurement), so the check-up must say "no reference" for it |
| B2 | Not met | no notes |
| B3 | Partly | Table 4 follows the point; owner decides |
| B4 | Not met | no block |
| B5 | Partly | no check-up functions |

## Rule C
- C1: Not checked visually (50 SVG texts, 4 aria-labels).
- C2: Met in code (white-outlined third bar, white ring :199, :292, :402).
- C3: Met: drawing :761, Pictures :990, :1032, :1057.
- C4: Mostly met; AU, ms, km/s defined (:770, :1143).
- C5: Met: :785, :1012, :1038, :1069.
- C6: Met (structure): 11 triples; Picture 1 list gated by stage (:1020).
- C7: Met so far as read (:802 defers numbers to after the run). Pre-run NASA blog links (:850-856) are mission news; not checked whether they state the speeds the predictions ask about.
- C8: Partly checked.

## Rule D
- D1: Met in structure ("Why this spacecraft, and why now", "(October 2026)").
- D2: As C.
- D3: Partly. Pre-run: two NASA Parker blogs, NASA Parker page, NASA Sun, NASA SVS, NIST Moon time (:850-875); the paper (Fox 2016, publisher page, may need subscription) after the run (:1219). No plain official page on time dilation beyond the NIST one; no 3(c) rows (grep: none in spec 11).
- D4: Not met (= Rule B).

## Other findings
- O1: white = learner's own point (`YOURS_COLOR` :44).
- O2: Prediction 2 buttons are in micro/milli/seconds but Picture 3's top graph is in milliseconds; a mark will need one agreed unit. Spec (213 lines) has no source table of the 3(c) type.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts: after the introduction the page runs on in one column. No coloured lines, headings or leads.
- **The controls already change Part 1 pictures.** The slider and the duration add a white mark to each picture (a bar on Picture 1, a ring on Picture 2, a ring on Picture 3) and fill in Table 4. Under the rule a learner's own setting is pink.
- **Colour clash found.** White was the learner's own point; no other colour clashed.
- **O2 resolved.** Prediction 2's answers (microseconds, milliseconds, seconds) are placed on a thin line in milliseconds (35 microseconds is 0.035 ms; 35 seconds is 35,000 ms, off the scale, so an arrow at the edge). Prediction 1 is a category, drawn as two direction arrows (a marker only).
- **B1 reference.** NASA's own words for the closest approach ("430,000 miles per hour", "3.8 million miles") and its speed against the two-body oval. The lag itself has no measurement, so no row.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch
FastestSpacecraftExperiment.tsx (Pictures 1 and 3, intro, Results), FastestSpacecraftTutor.tsx, fastestSpacecraft.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M** / **L** with Rule B.

## Not checked
Browser rendering; Words panel; contents of the pre-run NASA blogs; per-stage gating of Pictures 2/3 lists.
