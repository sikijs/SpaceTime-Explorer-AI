# Gap report: Relativity of Time and Motion Experiment 1 (What Does a Clock Measure?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/01-clock.md | Components: src/components/Experiment1.tsx, src/components/ExperimentTutor.tsx | Physics module: src/physics/clockExperiment.ts (+ clockExperiment.test.ts, 7 tests) | Status: read-only, nothing changed

## Summary
One digital clock, a duration choice, one numeric prediction, a plain results list, an "Event Interval" strip and a four-step tutor. It follows the older rule: the guess appears only as text beside the real value. It has no guess mark, no caption, no "Where the real picture comes from" line and no reading guide. The only drawing is the Event Interval strip, which has no scale. Size: **S** (wording and one marker on the strip; M if a scaled axis is added to the strip).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "When it ends, what will the clock show?" (Experiment1.tsx:226-228) | A number of seconds, typed (230-244); held in `predictionInput`, then `submittedPrediction` (:32, :41) | The clock reading at Event B (END) on the Event Interval strip (:388-398), or the clock readout (:139-151) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | Real result comes from `runClockExperiment(selectedDuration)` (:45); `predictionValue` is never read by it | None |
| A2 | Not met | No white mark or "YOUR GUESS" box anywhere; guess shown as text only (:300, :246) | A white "YOUR GUESS" marker at the guessed reading beside Event B on the strip |
| A3 | Not met | No mark exists | A numeric guess has a position; the mark would follow it |
| A4 | N/A | No mark exists | The mark would appear only after the run, once Event B is drawn (strip appears at :322 only on completion, which already satisfies this) |
| A5 | Not met | The strip (:334-399) is two dots on an unscaled line | The strip needs a time scale (0 to the chosen duration) so a guess can sit at a position; add it to the same strip, not a new picture |
| A6 | Not met | No "Where the real picture comes from" line | A line: the readings are calculated here from the chosen duration (nothing measured or imagined) |
| A7 | Not met | Intro (:95-135) has no statement about guesses and pictures | Add the new intro sentences; no controls change drawings except the duration, which changes the readings |
| A8 | Not met | Module has only `runClockExperiment` (clockExperiment.ts:22-39) | Add a tested function giving the guess's position on the strip and its distance from the real value |
| A9 | Partly met | Tutor compare prompt quotes both numbers (ExperimentTutor.tsx:54); explanation (:96-107) does not mention the prediction | Prompts would point to the white mark by name; the spec says the tutor does not score (spec 01-clock.md:180, :255) so do not add a verdict |
| A10 | Not met (older rule is not stated as such) | "A wrong guess is fine. Guesses are not scored." (:121-123). Nothing says predictions do not change the results | Current state; the new rule needs the explicit sentence |

## Rule B
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| B0 | | Results block of plain lines (:262-305); Event Interval strip (:322-413). No tables | |
| B1 | N/A | No external reference exists; the spec lists none | Elapsed time equals the chosen duration by construction; at most a "the same" reading |
| B2 | Not met | No notes under the results | Notes would be needed only if a table is added; the lines are simple |
| B3 | N/A | The only control is the duration; no comparison to add | None |
| B4 | Partly met | "You guessed" beside "The real elapsed time" (:298-304), no tag on the row | Guess shown beside the result already; a tag on the elapsed-time row would complete it |
| B5 | Partly met | Numbers come from the module; no comparison number exists | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| C1 | Met | Strip labelled "Event A / START", "Event B / END", "elapsed time" (:342-411); clock readout is a text box | None |
| C2 | N/A | Nothing to compare in the drawing; duration changes only the numbers | |
| C3 | Not met | No "How to read" caption under the clock or the strip | A caption is needed |
| C4 | Not met | As C3 | Name the clock readout and the strip, define event and elapsed time, say when each appears |
| C5 | Not met | As C3 | A worked moment (for example 10 s: 00:00:00 to 00:00:10) |
| C6 | Not met | As C3 | Look at / What it means / Why it matters items, drawn only once the strip appears |
| C7 | Met | Nothing predicted is revealed before the run (the strip shows only after completion, :322) | |
| C8 | Met | "Event", "elapsed time", "tick" defined in the intro (:100-118) | |

## Rule D
Not applicable (not a Cosmic Horizons experiment).

## Other findings
- O1: CLAUDE.md §27 table lists this experiment "Complete"; spec and code agree on the prediction shape (spec :98-118). No conflict found.
- O2: The intro claim that "A stopwatch ... just counts ticks" and "a heart beating" are everyday comparisons with no source; harmless. The tutor's final explanation (ExperimentTutor.tsx:99-104) gives the full idea in two sentences and is simple. The page is at maxWidth 600 (:85), narrower than later experiments (900).

## What an update would touch, and its size (O3, O4)
Experiment1.tsx, ExperimentTutor.tsx (prompt wording), clockExperiment.ts and clockExperiment.test.ts (guess position function), the specification. Size: **Small** (Medium if the strip gets a scaled axis).

## Not checked
Browser appearance, narrow widths, dark mode. The page was not run; judgement is from reading the code and the specification only.
