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

---

# Re-read, 2026-11-08: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `Experiment3.tsx` (about 560 lines), `Experiment3Tutor.tsx` (219 lines), `movingClockExperiment.ts` and the specification `03-moving-clock.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover. It follows the pattern of Relativity 1 and 2 (`01-` and `02-gap-report.md`, `02-draft-wording.md`), so the owner's earlier answers can carry over. Experiment 3 differs from them in three ways: it has **two controls** (duration and speed), the guess is **one number**, and its drawing has **no time axis** at all.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card, one column: introduction, the track and two clocks, duration buttons, speed buttons, the guess box, START, then (after the run) Results and the tutor | Part 1 (the guess, START, the track and clocks, the new time bars), Part 2 (duration and speed), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours |
| E3 | Partly met | The introduction, with its assumptions list, sits above the controls; no links list, no words box | See "Links" and "Words" below |
| E5 | N/A | One experiment, one part | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Met already for the results and the tutor** (both render only when the run is complete, `Experiment3.tsx` results block and tutor block). **Not met for the controls**: today they sit above START and stay visible all the time. Moving them into Part 2 means Part 2 appears after the first Run, with a "Not run yet" note, as in Relativity 1 and 2.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: reference frame, light-second, the speed of light as a limit (the "c" note), and, for the tutor only, time dilation. **Not searched or read yet**; the search and the fetch belong to the draft step, and §29 rule 3(c) applies where no plain official page exists (as it did for "reference frame" in Relativity 2).
- **A tension to decide (§12).** A plain official page on time dilation would be the natural link, but this list is visible from the start, before the learner predicts, and such a page would give away what the run shows. Options: link only pages on the background ideas (light-second, speed of light) and leave time dilation to the tutor's explanation; or add a time-dilation link that appears only after the run. **Recommend** the first; the owner decides.
- **Real results.** The page uses none: the numbers come from the formula the specification gives, not from a measurement, so there is no paper to link. (Real tests of time dilation exist, such as the muon and airliner-clock experiments, but the specification does not use them. Adding them would be new content, not an audit fix; reported, not proposed.)
- **"Words and formulas": Not met.** None exists. Terms: clock reading, elapsed time, lab, lab time, reference frame, at rest, moving, speed, c (the speed of light), light-second, duration. "Time dilation" and "time dilation factor" are named only after the run (§12), so they enter the box only after the run, as the formula does. Formula: moving clock's time = lab time × √(1 − v²), with a worked example from the page. The formula would show the answer to the guess, so it appears only after the Part 1 run.

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction"; after a run the learner can edit the settings and press START again, and `handleStart` clears the guess box (`setPredictionInput('')`) and then stores the new guess in `submittedPrediction`, so a changed guess can sit beside results made under other settings. Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guess is locked after START; the START button replaced after the first run by "Run your settings" in Part 2.

## Rule A to C: what the re-read sharpens
- **One guess, one white mark.** The guess is one number (the moving clock's reading). Natural place, as the first gap report found (A5): a new panel of **two time bars on one scale** under the track, "Lab clock" and "Moving clock", each from its start reading (0) to its end reading, with a white YOUR GUESS mark and box on the moving clock's bar. This also fixes C2: today the track is rescaled for each run, so every speed looks the same and the contrast between the clocks exists only in the numbers. **Needs the owner's decision on the scale** (default as in Relativity 1 and 2: 0 to twice the lab duration, with an edge arrow for an off-scale guess).
- **Two controls.** Part 1 fixed at the page's current defaults, 10 seconds and 0.5c (Part 1's moving clock would end at 8.660 seconds); duration **and speed** move to Part 2 (with the 0c baseline preset kept). **Moves setup items of the specification (Learner Controls), so it needs the owner's decision.** A nicer-numbers alternative would be 0.6c (10 s gives exactly 8.0, the specification's own worked example, `03-moving-clock.md` Results Display), but it is not one of the specification's presets (0.1, 0.3, 0.5, 0.8), so the default stays 0.5c unless the owner chooses.
- **Part 2 drawing (Drawing A).** The same track and time bars for the learner's own duration and speed, with the moving clock's bar and end mark in pink (the lab clock's bar stays amber/blue as in Part 1), no white mark (the guess was for the Part 1 run), and a "Runs so far" list with one line per run (for example "0.8c, 10 s: lab 10.000, moving 6.000"). The learner can then see the gap widen with speed and vanish at 0c, which is the specification's Expected Observations 4 and 5.
- **The track and C1.** Label the moving clock ("Moving clock" with its distance), the grey track ("Track, in light-seconds") and the amber line ("Distance travelled so far"), plus the note that the track is redrawn to fit each run (it already says so). Keep the rescaling; it is the specification's own choice (Implementation notes, "Diagram").
- **A9, the tutor.** The specification's tutor sequence already asks "Were you surprised?" and has replies for an accurate and a "very wrong" guess, so marking the guess in the explanation is consistent with it. Two points need the owner: (1) the "Great!" and "you're not alone" lines are the specification's own, with a margin the specification does not define; the implementation's margin (half the size of the effect) is **flagged in the specification as needing the owner's confirmation** (Implementation notes (tutor)) and is still unconfirmed; (2) at a low speed the margin shrinks to a few hundredths of a second (at 0.1c, 10 s: 0.025 s), so a guess of 10 gets the "not alone" line only if it is within 0.025 s of 10. That is the owner's call, not mine. **Recommend** moving the classification into the module with tests (§9) and keeping the margin rule unchanged until the owner says otherwise. The compare prompt would name the white mark; the explanation would mark the guess ("the same as" or "N seconds more or less than" the moving clock's real reading, and by how much it differs from the lab clock's), with no score.
- **O1, arithmetic in the tutor.** The "Your numbers" paragraph computes `v²`, `1 − v²` and the square root in the component (Experiment3Tutor.tsx, the "Your numbers" paragraph). **Recommend** a small tested module function that returns those three numbers, and the tutor displays them (§9). The numbers do not change.
- **C8, the introduction's example.** "Two friends ... meet up again for dinner" brings in a clock that comes back, which Experiment 10 (the twin paradox) examines. Needs a replacement example that does not return, **drafted for the owner's approval, not changed here**.
- **B1 to B3, recommendation as in Relativity 1 and 2.** The page computes the real value from the same formula it would be checked against, so a check-up would be circular, and the controls only move marks and numbers the pictures already show. **No check-up and no setting-following table;** keep the plain results lines, add the guess tag on the "What the moving clock measured" line (B4), and add under the results a short note on the factor line and the difference line (B2: what it is, what it means with the real numbers, why it matters), without the full mechanism (that is Experiment 4's).
- **Page width.** Already 900 px (`Experiment3.tsx`, the outer div), so no change.
- **Buttons (O2 of the first report).** `Experiment3.tsx` has no `toggle-button` class (Experiments 1 and 2 use it); its buttons use inline colours. **Recommend** switching to the shared class as part of this update, since the owner asked that its styling not change (§27). Tutor colours stay as they are (not checked in dark mode).

## Updated size
**Medium** (unchanged): the Parts layout, a time-bars panel with a white mark, a pink version for Part 2 with "Runs so far", captions for both, words box, links (search and fetch), Start over, the tutor's wording, the specification update, and tested module functions (the guess's position on the bars and its gap from the real reading; the tutor's classification; the tutor's `v²`, `1 − v²` and square-root numbers). Files: `Experiment3.tsx`, `Experiment3Tutor.tsx`, `movingClockExperiment.ts` and its test, the specification, `docs/DEVELOPMENT-STATE.md`.

## Questions for the owner before drafting (suggested defaults are the answers given for Relativity 1 and 2)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 10 seconds and 0.5c; duration and speed (with 0c) both move to Part 2? Default: yes. (Alternative: 0.6c for a result of exactly 8.0 seconds.)
3. **Bars:** two time bars (Lab clock, Moving clock) under the track on one scale from 0 to twice the lab duration, one white mark and box on the moving clock's bar, an edge arrow for an off-scale guess? Default: yes.
4. **Part 2 drawing:** the same track and bars for the learner's settings, the moving clock's bar in pink, no white mark, and a "Runs so far" list? Default: yes.
5. **Tutor marking:** the explanation marks the guess with no score, and the classification and the "Your numbers" arithmetic move into the module with tests; **the half-the-effect margin stays until you confirm or change it**? Default: yes.
6. **Introduction example:** replace the "friends who meet up again for dinner" example with one that has no return, drafted for your approval? Default: yes.
7. **Reading guide:** no check-up or setting-following table; a guess tag on the moving clock's line and a note under the results? Default: yes.
8. **Links:** run the search for plain official pages on the light-second and the speed of light, record a gap under §29 rule 3(c) where none exists, and **do not link a time-dilation page from the introduction** (it would answer the question before the learner predicts)? Default: yes.
9. **Buttons:** switch to the shared `toggle-button` class? Default: yes.
10. **Size:** accept Medium? Default: yes.

## Not checked (re-read)
The page was not run in a browser; dark mode and narrow widths were not looked at; no source page was searched or fetched for the links list. The margin figure at 0.1c was worked by hand from the code's rule (half of 0.0501 × 10 ≈ 0.025), not run.
