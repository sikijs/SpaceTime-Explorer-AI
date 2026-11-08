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

---

# Re-read, 2026-11-08: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `Experiment2.tsx` (about 530 lines), `Experiment2Tutor.tsx`, `twoClockExperiment.ts` and the specification `02-two-clocks.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover. It follows the pattern of Relativity 1 (`01-gap-report.md`, re-read, and its approved draft), so the owner's earlier answers can carry over.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card, one column: introduction, two clocks, duration buttons, two guess boxes, START, then (after the run) Results, the Event Interval strip and the tutor | Part 1 (two guesses, START, the two clocks, the strip), Part 2 (duration), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours |
| E3 | Partly met | The introduction, with the "reference frame" box, sits above the controls; no links list, no words box | See "Links" and "Words" below |
| E5 | N/A | One experiment, one part | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Met already.** The results, the strip and the tutor render only when the run is complete. Part 2 (the duration choice) would have to appear after the first Run, with a "Not run yet" note, as in Relativity 1.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. There is no real experimental result, so there is no paper. Two background ideas need a plain official page: that clocks at different places can be compared and agree (clock synchronisation, for example from NIST's time pages), and what a "reference frame" is (from an official education source, for example NASA). **Not searched or read yet**; the search and the fetch belong to the draft step, and §29 rule 3(c) applies if no plain official page exists for "reference frame" (it is an idea an official page may only cover in a physics-course way).
- **"Words and formulas": Not met.** None exists. Terms on the page: clock, event, elapsed time, reading, duration, reference frame, at rest, synchronised (both clocks "set to the same reading", in "What we assume"). Formula: elapsed time = end reading − start reading, and the difference of the two clocks' elapsed times (|A − B|), with a worked example from the page. As in Relativity 1, a formula entry that shows the answer to the guess would appear only after the run (§12).

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** The only reset is "Run Again" inside the Results card, so it appears only after a run (Experiment2.tsx, the Results card's last block). Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guesses are locked after START; "Run Again" replaced by it.

## Rule A to C: what the re-read sharpens
- **Two guesses, two marks.** Each clock has its own guess (A and B). Natural drawing: the Event Interval strip becomes **two rows**, one for Clock A and one for Clock B, on one shared time scale (0 to twice the duration), each with Event A and Event B dots and its readings, and each with its own white YOUR GUESS mark and box ("YOUR GUESS for Clock A: N seconds"). Because both clocks read the same, the two rows line up exactly, which is the picture's point (Rule C2: it shows the contrast of "same" rather than hiding it).
- **A5 and the scale.** As in Relativity 1: a fixed scale from 0 to twice the duration (it does not depend on the guesses) with an edge arrow for a guess outside it. **Decision as in Relativity 1.**
- **Duration is both the setup and the control.** As in Relativity 1: Part 1 fixed at the specification's default of 10 seconds, the duration choice moves to Part 2 (which also meets the specification's repeat-the-experiment idea; check the specification for a "Multiple Runs" section when drafting). **Moves a setup item of the specification (section "Experiment Setup"), so it needs the owner's decision.**
- **A9, the tutor.** Here there is no conflict as in Relativity 1: the specification's tutor sequence already asks "Were your predictions correct?" (section "AI Tutor Behavior", step 2) and has replies for a wrong and a right prediction ("Tutor Adjustments"). So marking the guesses in the explanation, with no score and no verdict before it, is consistent with the specification. The current compare prompt quotes the numbers but does not name the marks; the explanation does not mention the guesses at all.
- **O2, a display shortcut worth deciding.** During the run both readouts are set from one shared value (Experiment2.tsx, the animation loop) and each clock's own model value is used only at the end. The UI does not read each clock separately. Because the picture's whole point is that two separate clocks agree, **recommend** a small tested module function that gives each clock's reading at a given simulation time, and the UI reads both from it (§9). The numbers do not change; only where they come from.
- **O3, an unsourced general claim in the tutor's explanation** ("everyone standing still in that frame agrees about time"): it follows the specification's sentence and has no source on the page. Reported, not changed. A "no plain official page found" note may be needed for it (§29 rule 3(c)).
- **B1 to B3, recommendation as in Relativity 1.** No outside reference exists (the clocks agree by construction), so **no check-up and no setting-following table**; keep the plain results lines, add the guess tags on the two elapsed-time lines (B4).
- **Page width.** Already 900 px (Experiment2.tsx, the outer div), so no change.
- **Tutor colours.** Fixed light colours as in Relativity 1 (not changed; not checked in dark mode).

## Updated size
**Medium** (was Small): the Parts layout, a two-row strip with two white marks and a pink version for Part 2, captions, words box, links (search and fetch), Start over, the tutor's wording, the specification update, and tested module functions (each guess's position and difference from the real value; each clock's reading at a given time). Files: `Experiment2.tsx`, `Experiment2Tutor.tsx`, `twoClockExperiment.ts` and its test, the specification, `docs/DEVELOPMENT-STATE.md`.

## Questions for the owner before drafting (suggested defaults are the answers given for Relativity 1)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Duration:** Part 1 fixed at 10 seconds and the duration choice moves to Part 2 (default 20)? Default: yes.
3. **Strip:** two rows (Clock A, Clock B) on one scale from 0 to twice the duration, a white mark and box per row, an edge arrow for an off-scale guess? Default: yes.
4. **Tutor marking:** the explanation marks each guess (the same as, or N seconds more or less than, the real reading), with no score and no verdict before it? Default: yes.
5. **Per-clock readings from the module:** add a tested function so each clock's readout is read separately (the numbers do not change)? Default: yes.
6. **Reading guide:** no check-up or setting-following table; guess tags on the two elapsed-time lines only? Default: yes.
7. **Links and "reference frame":** run the search for a plain official page on clock synchronisation and on reference frames, and if none exists for "reference frame" record it as a gap under §29 rule 3(c) and rely on the introduction's own definition? Default: yes.
8. **Size:** accept Medium? Default: yes.

## Not checked (re-read)
The page was not run in a browser; dark mode and narrow widths were not looked at; no source page was searched or fetched for the links list.
