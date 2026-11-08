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


---

# Re-read, 2026-11-08: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `Experiment1.tsx` (426 lines), `ExperimentTutor.tsx` (110), `clockExperiment.ts` (39) and the specification `01-clock.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything in a single column: introduction, clock, duration buttons, prediction, START, then (after the run) Results, Event Interval strip and tutor (Experiment1.tsx:84-424) | Split into Part 1 (prediction, START, clock, strip), Part 2 (duration), Part 3 (results), Part 4 (tutor). |
| E2 | Not met | No Part headings, coloured lines or leads | Four leads in the shared colours, drafted for approval. |
| E3 | Partly met | The introduction is above the controls (:95-135); there is no links list and no words box | See "Links" and "Words" below. |
| E4 | Not met | No leads exist | Drafted with the leads; Part 1's lead must not give the answer (§12). |
| E5 | N/A | One experiment, one part | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Met already.** The Results, the strip and the tutor render only when `isComplete` (:262, :322, :415). Under the Parts layout, Part 2 (the duration choice) would also have to appear after the first Run, with a visible note saying what to do next.

## Links and Words (2026-11-07 rule)
- **"Want to know more?" list: Not met.** None exists. There is no real result to cite, so rule 1 of the list has nothing to link. For the background idea (a clock counts regular repeats; how a second is defined), a plain official page is needed, for example from NIST or BIPM. **Not searched or read yet**; the search and the fetch belong to the draft step, and nothing is linked until read (§29 rule 3(c)).
- **"Words and formulas" box: Not met.** None exists. Terms on the page: clock, tick, elapsed time, event, clock reading, duration. One formula: elapsed time = final reading minus initial reading, with the page's own worked example (00:00:10 minus 00:00:00 is 10 seconds).

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** The only reset is "Run Again", inside the Results card (:343-354), so it appears only after a run. It clears the guess, the result and the clock, but is not visible from the first screen and is not greyed out. There is no "Change prediction" button. Needed: an always-visible "Start over", greyed until a guess or a run exists and while a run plays; a line saying the guess is locked after Run; and "Run Again" replaced by it.

## Rule A to C: items the re-read changes or sharpens
- **Duration is both the setup and the control.** The learner picks the duration before guessing (:152-216), and the guess is "what will the clock show", which depends on it. Under the Parts layout the usual pattern (as in Gravitational Waves 3 to 7) is: Part 1 fixed at the specification's default of 10 seconds, with the guess and one Run; Part 2 lets the learner choose another duration and run it (the specification's section 13 "Multiple Runs" is then met in Part 2). **This moves the duration control out of the setup, which the specification section 5 lists as a setup item, so it needs the owner's decision.**
- **A5 (strip scale), sharpened.** The guess is typed freely (any number, including 0, a negative number or 500). A mark on a time axis needs a fixed range that does not depend on the guess (Rule A, item 1). A guess outside the range would need an arrow at the edge, as Cosmic Horizons 9 to 11 do, and the white box would say the number. The range itself (for example 0 to twice the duration) is a decision.
- **A9, a conflict to settle (O1).** Specification sections 8 and 11 say the tutor does not score the guess ("without scoring it as correct or incorrect"), while the 2026-10-24 rule says the tutor marks each prediction in its explanation. Both cannot hold as written. In the Gravitational Waves audits the tutor marked each guess. For a learner who typed 10 and saw 10 the mark is trivial; for a learner who typed 7 it is the first lesson that the clock shows what it counted. The owner decides; nothing is done until then.
- **O2, the introduction and the prediction (section 12).** The introduction's "What a clock actually does" paragraph explains that elapsed time is the number of ticks between start and stop, and "What happens" says the experiment ends when the chosen time is up. A learner can work out the answer from that. This matches the specification's intent (the guess is meant to be easy; section 6: "The prediction does not need to be mathematically sophisticated"), so it is **not** a gap against Rule E, but it should be a conscious decision when the introduction is reworded. The tutor's pendulum and heartbeat comparisons stay in the introduction as daily-life examples (§15).
- **B1 to B3, recommendation for the owner's decision (Rule B is decided per experiment).** No outside reference exists; elapsed time equals the chosen duration by construction. Recommend: **no check-up table and no setting-following table**; keep the plain results lines and add the guess tag on the "real elapsed time" row (B4). The existing lines already read in plain words.
- **Page width.** The page is 600 px wide (:85), narrower than later experiments (900 px). A Parts layout with a labelled strip and caption would fit better wider; the owner decides, since it changes how the first chapter looks.
- **Tutor colours.** The tutor box uses fixed light colours (`#f0f7ff`, `#d9e8f5`, `#333`, ExperimentTutor.tsx:36-97) rather than the page's theme variables. Not checked in dark mode; later experiments' tutors may differ. Reported, not changed.

## Updated size
**Medium** (was Small). The Parts layout, the words box, the links list (search and fetch needed), Start over, a scaled strip with a guess mark and its caption, per-picture "Where the real picture comes from" line, leads, tutor prompt wording, the specification update, and one tested module function (the guess's position on the strip, whether it is off the edge, and its difference from the real value, plus tests). Files: `Experiment1.tsx`, `ExperimentTutor.tsx`, `clockExperiment.ts`, `clockExperiment.test.ts`, the specification, `docs/DEVELOPMENT-STATE.md`.

## Questions for the owner before drafting
1. **Gaps:** fix all of the above (the Parts layout, links, words box, Start over, guess mark with scaled strip, caption, "Where the real picture comes from", tutor marking)? Suggested default: yes, all.
2. **Duration:** Part 1 fixed at 10 seconds and the duration choice moves to Part 2? Suggested default: yes.
3. **Strip range:** fixed at 0 to twice the duration, with an edge arrow for a guess beyond it? Suggested default: yes.
4. **Tutor marking:** the tutor marks the guess in its explanation, with no score and no "right" or "wrong" before it? Suggested default: yes (and the specification's sections 8 and 11 updated to say so).
5. **Reading guide:** no check-up or setting-following table; only the guess tag on the real elapsed-time row? Suggested default: yes.
6. **Page width:** widen to 900 px to match later experiments? Suggested default: yes.

## Not checked (re-read)
The page was not run in a browser; dark mode and narrow widths were not looked at; no source page was searched or fetched for the links list.
