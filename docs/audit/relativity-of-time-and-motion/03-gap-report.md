# Gap report: Relativity of Time and Motion Experiment 3 (Moving Clock)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/03-moving-clock.md | Components: src/components/Experiment3.tsx, Experiment3Tutor.tsx | Physics module: src/physics/movingClockExperiment.ts (+ test, 21 tests) | Status: read-only, nothing changed

## Summary
A track drawing (lab clock, moving clock, distance) with two digital clocks, controls for duration and speed, one numeric prediction, a plain results list and a four-step tutor with a worked formula. Older rule: no guess mark, no reading guide, no "Where the real picture comes from". The biggest finding for Rule C is that the drawing looks the same at every speed (the track is rescaled so the moving clock always ends at the far end, :250-251), so the contrast between the two clocks lives only in the digital readouts. The predicted quantity (the moving clock's reading) has no picture to sit on. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | What will the moving clock show at the end (Experiment3.tsx:379-382) | Number of seconds (:384-396); `predictionInput`, `submittedPrediction` (:112-113, :139) | The moving clock's reading, in the clock box (:272-274). The track (:66-99) shows distance, not time, so the answer has no place on a picture |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runMovingClockExperiment(selectedDuration, selectedVelocity)` (:134, :142); prediction not used | None |
| A2 | Not met | Guess shown as text only (:473) | White "YOUR GUESS" mark at the guessed reading |
| A3 | Not met | No mark | Numeric guess has a position on a time scale |
| A4 | N/A | No mark; results show on completion (:424) | Mark would appear once the real readings exist |
| A5 | Not met | The track has no time axis | Add a panel to the track picture: two time bars (lab elapsed, moving elapsed) on one scale, with the white mark on the moving bar |
| A6 | Not met | No such line | "Calculated here from the speed and the duration; not measured" |
| A7 | Not met | Intro (:185-238) has no statement; speed control has a note on units only (:328-332) | Add intro sentence and a controls note (speed and duration change the drawing and the numbers; guesses do not) |
| A8 | Not met | Module exports `timeDilationFactorFor`, `runMovingClockExperiment`, `movingClockStateAt` (movingClockExperiment.ts:6, :20, :53) | Add a tested function for the mark's position and gap to the real reading |
| A9 | Partly met | Compare prompt gives guess and both real readings (Experiment3Tutor.tsx:81-82); the explanation marks the guess in words ("Great! You sensed...", :121-133), as the rule wants, but the choice logic `classifyPrediction` lives in the component (:21-31), untested, and nothing is said for a guess near neither value | Prompts would name the mark; move the classification to the module with tests |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:207-208). Nothing says predictions do not change results | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results list (:424-481): duration, speed, distance, lab and moving elapsed, difference, factor, guess vs real. No tables | |
| B1 | Partly met | A reference exists: the same physics (Δt_moving = Δt_lab × √(1 − v²)); but the page computes the real value from the same formula, so "expected beside found" would be circular. The spec lists no measured source | A check-up would need a real measured value; none in the spec. Not decided here |
| B2 | Not met | No notes under the results | Note on the factor line and the difference line |
| B3 | N/A or optional | The speed control changes numbers and the drawing's label only | Owner's choice |
| B4 | Partly met | "You guessed" / "The real time the moving clock measured" (:473-478), no tags | Tag on the moving-clock row |
| B5 | Partly met | Numbers come from the module; the 1 − v² arithmetic is done in the tutor (Experiment3Tutor.tsx:167-176) | Move to module |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Partly met | SVG text: "Lab clock", "N light-seconds", "End of run" (:85-95). The moving clock's rectangle carries only a distance number, not the words "Moving clock"; the amber travelled-distance line and the grey track have no label (:79-82, :89-92) | Label the moving clock, the track and the amber line |
| C2 | Not met | At every speed the moving clock ends at the same far end of the track (:67-69, note :249-252) | Drawing hardly changes with speed; contrast is only in the numbers. A visual for the two elapsed times is needed |
| C3 | Partly met | Only a one-line note (:249-252) | A "How to read" caption is needed |
| C4, C5, C6 | Not met | As C3 | Full caption with worked moment (for example 0.6c, 10 s: 8.0 s) and three-part look-for items |
| C7 | Met | Nothing predicted is shown before the run; the drawing is a preview of the track only | |
| C8 | Partly met | Reference frame, lab time and light-second are defined in the assumptions list (:222-236); "time dilation" is named only by the tutor after the run (Experiment3Tutor.tsx:135), which is correct (§12) | One point: the intro's example of two friends who "meet up again for dinner" (:195-197) brings in a clock that returns, which a later experiment (the twin paradox) examines. §15 asks that examples not bring in later physics |

## Rule D
Not applicable.

## Other findings
- O1: None against the spec. The spec's results notes (03-moving-clock.md:257-262) say the interface shows model values only; the tutor does some arithmetic in the UI (:167-176), a small break from §9.
- O2: Buttons use inline colours (#007bff, #f0f0f0; Experiment3.tsx:28-37) instead of the shared `.toggle-button` class (CLAUDE.md §27); the same in Experiments 4, 5, 6. Tutor boxes use fixed colours (#f0f7ff). Dark-mode appearance not checked.

## What an update would touch, and its size (O3, O4)
Experiment3.tsx (track picture, new time-bars panel, intro, caption, results notes), Experiment3Tutor.tsx, movingClockExperiment.ts and its test, the specification. Size: **Medium**.

## Not checked
Browser appearance, narrow widths, dark mode. Code and text read only.
