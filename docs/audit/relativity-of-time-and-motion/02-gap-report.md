# Gap report: Relativity of Time and Motion Experiment 2 (Two Clocks at Rest)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/02-two-clocks.md | Components: src/components/Experiment2.tsx, src/components/Experiment2Tutor.tsx | Physics module: src/physics/twoClockExperiment.ts (+ test, 9 tests) | Status: read-only, nothing changed

## Summary
Two clock readouts, a duration choice, two numeric predictions (one per clock), a plain results list, an "Event Interval" strip with both clocks' readings and a four-step tutor. It introduces "reference frame" (:135-160). It follows the older rule and has no guess marks, no caption, no "Where the real picture comes from" line and no reading guide. Size: **S**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Clock A's reading at the end (Experiment2.tsx:303-310) | Number, `predictionA` then `submittedPredictionA` (:24, :26, :48) | Clock A's reading at Event B on the strip (:497-510) |
| 2 | Clock B's reading at the end (:328-347) | Number, `predictionB` then `submittedPredictionB` (:25, :27, :49) | Clock B's reading at Event B on the strip |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | Result from `runTwoClockExperiment(selectedDuration)` (:55); predictions not read by it | None |
| A2 | Not met | Guesses appear as text only (:391, :400) | White "YOUR GUESS" markers for A and B on the strip |
| A3 | Not met | No mark | Numeric guesses have positions; two marks (A and B) would follow them |
| A4 | N/A | No mark; the strip appears only on completion (:428) | Already consistent |
| A5 | Not met | Strip (:440-523) has two dots on an unscaled line | Add a time scale to the same strip |
| A6 | Not met | No such line | "Calculated here from the chosen duration" |
| A7 | Not met | Intro has no statement (:109-177) | Add sentence; the duration control changes only the readings |
| A8 | Not met | Module has `runTwoClockExperiment` only (twoClockExperiment.ts:16-54) | Tested helper for the marks' positions |
| A9 | Partly met | Compare prompt quotes guesses and real values (Experiment2Tutor.tsx:58-59); explanation (:101-112) does not mention the guesses | Prompts would name the marks; no verdict (spec: not scored) |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:163-164). No sentence that predictions do not change the results | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lines (:368-426); Event Interval strip (:428-525). No tables | |
| B1 | N/A | No external reference; "the same" is the only reading ("Difference ... 0 seconds", :409) | None |
| B2 | Not met | No notes | Only needed if a table is added |
| B3 | N/A | Duration only | |
| B4 | Partly met | "You guessed for Clock A ... The real elapsed time" (:391-404), no tags | Tags on the rows |
| B5 | Partly met | Numbers come from the module; no comparison number | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Met | Readouts titled "Clock A" and "Clock B" (:193, :212); strip labelled Event A / START, Event B / END (:450-453, :499-502) | None |
| C2 | N/A | Both clocks are meant to agree | |
| C3 | Not met | No caption under the clocks or the strip | Needed |
| C4, C5, C6 | Not met | As C3 | Name both pictures, define reference frame in the caption, a worked 10 s moment, three-part look-for items |
| C7 | Met | Nothing is revealed before the run | |
| C8 | Met | "Reference frame" defined before use (:135-160), "event" carried from Experiment 1 | "Event" itself is not redefined here (it is defined in Experiment 1's intro); only used on the strip |

## Rule D
Not applicable.

## Other findings
- O1: CLAUDE.md §27 lists this experiment as "Implemented" while Experiments 1 and 3-6 are "Complete" (a status label difference, not a code conflict).
- O2: During the run both readouts are set from one shared value (Experiment2.tsx:79-80), and each clock's own model value is used only at the end (:83-84). This is a display shortcut, and the model makes the two equal, but the UI does not read each clock separately. The tutor's explanation (Experiment2Tutor.tsx:102-111) states "everyone standing still in that frame agrees about time" as a general property; it follows the spec and has no source in the page.

## What an update would touch, and its size (O3, O4)
Experiment2.tsx, Experiment2Tutor.tsx, twoClockExperiment.ts and its test, the specification. Size: **Small** (Medium if the strip gets a scaled axis).

## Not checked
Browser appearance, narrow widths, dark mode. Code and text read only.
