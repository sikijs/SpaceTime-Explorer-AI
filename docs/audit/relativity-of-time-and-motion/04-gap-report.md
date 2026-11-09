# Gap report: Relativity of Time and Motion Experiment 4 (The Light Clock: Why Time Dilation Happens)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/04-light-clock.md | Components: src/components/Experiment4.tsx, Experiment4Tutor.tsx | Physics module: src/physics/lightClockExperiment.ts (+ test, 23 tests) | Status: read-only, nothing changed

## Summary
Two animated light-clock panels (rest and moving) with one numeric prediction (the length of one moving tick, in lab seconds), a plain results list and a long tutor with a worked triangle. The drawing contrasts the two paths well, but it has almost no labels on the canvas, only a one-line caption per panel and no "How to read" caption. No guess mark, no "Where the real picture comes from", no reading guide. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "How many lab seconds will one tick of the moving clock take?" (Experiment4.tsx:392-396) | Number (:398-410); `predictionInput`, `submittedPrediction` (:193-194, :215) | The moving panel: the pulse's slanted path (length = c × the tick) and the panel's clock. No time scale is drawn |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runLightClockExperiment(selectedVelocity)` (:209, :218); prediction not read | None |
| A2 | Not met | Guess is text only (:532) | White "YOUR GUESS" mark |
| A3 | Not met | No mark | A numeric guess gives a tick time, and so a path length (c × guess) |
| A4 | N/A | No mark; during the run the path builds up (:112-114) | Mark should appear only once the path for the full tick is drawn (at completion) |
| A5 | Partly met | The path is drawn, but no time scale | Add a tick-time strip under each panel (rest 1.000 s, moving real value) on the same scale, with the white mark on the moving strip; or draw a white "guessed path" over the V at the guessed length |
| A6 | Not met | No line | "Calculated here from the speed; the light-clock set-up is imagined (a giant clock)" |
| A7 | Not met | Intro (:264-336) has no statement; speed control note (:342-345) covers units only | Add intro sentence and controls note (speed changes the drawings; guesses do not) |
| A8 | Not met | Module exports `runLightClockExperiment`, `lightClockStateAt`, `pulseHeightAtPhase`, `MIRROR_SEPARATION`, `REST_TICK_DURATION` (lightClockExperiment.ts:5-70) | Tested function for the guess mark's path length and position |
| A9 | Partly met | Compare prompt quotes guess and both real ticks (Experiment4Tutor.tsx:65-66); the explanation (:108-201) never mentions the guess | Prompts would name the mark; explanation would mark the guess (rule allows it there only) |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:303-304). No sentence about results | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lists for the rest clock and the moving clock plus the guess pair (:476-540). No tables | |
| B1 | Partly met | The same physics gives the tick (the triangle relation, tested at lightClockExperiment.test.ts:64-72); a "found equals expected" line would be circular. The spec cites no measured value | Not decided here |
| B2 | Not met | No notes (a line on c and light-second at :491-494 is only a glossary) | Notes under the two result groups |
| B3 | Optional | Speed control | Owner's choice |
| B4 | Partly met | "You guessed" / "The real time..." (:530-538), no tag | Tag on the moving tick row |
| B5 | Partly met | Numbers from the module; the tutor halves distances in the UI (Experiment4Tutor.tsx:172-175) | Move to module |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Not met | The SVG carries only "start" labels (:147-152). Mirrors, light pulse, pulse path and the sideways motion have no on-canvas labels; panel titles are HTML above the svg (:118) | Label mirrors, pulse and path on the canvas |
| C2 | Met | Rest panel has a vertical path, moving panel a slanted "V", same scale (:75-82, :155-160) | |
| C3 | Partly met | One-line captions only: "At rest in the lab"; "Moving at Xc (seen from the lab). Both mirrors move together. Dashed lines show where they started." (:456, :463) | A full "How to read" caption is missing |
| C4, C5, C6 | Not met | As C3 | Name both panels, say what the yellow dot, line, black bars and dashed marks mean, define lab seconds, give a worked moment (0.6c: tick 1.25 s) and three-part look-for items |
| C7 | Met | The preview draws only the starting position (the state at lab time 0), so no tick length is shown before the run (:210, :454-467) | Note: the preview rescales with the chosen speed (:76-82) |
| C8 | Met | Tick, light-second, lab seconds, reference frame all defined before use (:279-292, :302, :319-323) | |

## Rule D
Not applicable.

## Other findings
- O1: None against the spec. Spec items recorded as implementation notes (04-light-clock.md:160-165) match the code.
- O2: The tutor says light's constancy "is an established physical fact (it is Einstein's postulate)" (Experiment4Tutor.tsx:182-183) with no source; Experiment 5's introduction repeats it (Experiment5.tsx:346). The final paragraph (:194-199) says a traveller who ages one year "could find that many years have gone by on the lab's clocks", which reaches ahead to the twin experiments; no source. The "ball in a train" comparison (:115-123) is a good daily-life example for the diagonal.

## What an update would touch, and its size (O3, O4)
Experiment4.tsx (SVG labels, tick-time strip, caption, intro note), Experiment4Tutor.tsx, lightClockExperiment.ts and test, the specification. Size: **Medium**.

## Not checked
Browser appearance, narrow widths, dark mode, the wide-run layout above 0.93c. Code and text read only.

---

# Re-read, 2026-11-08: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `Experiment4.tsx` (558 lines), `Experiment4Tutor.tsx` (205 lines), `lightClockExperiment.ts` and the specification `04-light-clock.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover. It follows the pattern of Relativity 1 to 3 (`01-` to `03-gap-report.md`, `03-draft-wording.md`), so the owner's earlier answers can carry over. Experiment 4 differs from Experiment 3 in four ways: it has **one control** (the speed, no duration), the run is **one tick**, its two pictures are the **light-clock panels** (not a track), and the specification **deliberately holds back** the constancy of light's speed until the tutor.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card, one column: introduction, speed buttons, the guess box, START, the two panels (under START), then (after the run) Results and the tutor | Part 1 (the guess, START, the two panels, the new tick bars), Part 2 (the speed and Drawing A), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours |
| E3 | Partly met | The introduction, with its assumptions list, sits above the controls; no links list, no words box | See "Links" and "Words" below |
| E5 | N/A | One experiment, one part | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Met already for the results and the tutor** (both render only when the run is complete). **Not met for the control**: the speed buttons sit above START all the time. Moving them into Part 2 means Part 2 appears after the first Run, with a "Not run yet" note.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: a light clock and its tick, the light-second, the speed of light (the "c" note), reference frame, and time dilation. **Not searched or read yet**; the search and the fetch belong to the draft step. What was already found for Relativity 3 (2026-11-08) carries over: NASA Science, "How Big is Space?" (speed of light, fetched and read); **no plain official page for "light-second" or "reference frame"** (§29 rule 3(c)); NASA Glenn and NIST "Meter" read and not linked.
- **A difference from Experiment 3.** Here the introduction already names time dilation ("This effect is called time dilation", `Experiment4.tsx`, "The question"), and Experiment 3's run already showed it. What this experiment asks the learner to predict is the length of **one tick**, not whether time dilates. So an official time-dilation page would **not** give away this experiment's answer in the way it would in Experiment 3. **Recommend** searching for one (and for a light-clock page), reading it before linking, and checking that it does not state the tick-length answer.
- **Einstein's postulate has no source on the page.** The tutor says the constancy of light's speed "is an established physical fact (it is Einstein's postulate)" (`Experiment4Tutor.tsx`, the paragraph beginning "This experiment rests on one assumption"). A plain official page on it, if found, would also serve Experiment 5; if none, record it under §29 rule 3(c) and under "Open". **Not decided here.**
- **Real results.** The page uses none: the tick lengths come from the geometry the specification gives, not from a measurement, so there is no paper to link.
- **"Words and formulas": Not met.** None exists. Terms: light clock, tick, mirror, light pulse, light-second, lab seconds, lab time, reference frame, at rest / moving, speed, c, time dilation. **The specification reserves the algebraic formula** ("The algebraic formula itself is not shown in this experiment", `04-light-clock.md`, Results Display), and the tutor works the numbers with no algebra. **Recommend** keeping that: terms only, and no "Formula" entry. **Needs the owner's decision** (a formula entry would be a change to that specification line).

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". After a run the learner can change the speed and press START again; `handleStart` clears the guess box (`setPredictionInput('')`) and stores the new guess, so a changed guess can sit beside results made at another speed. Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guess is locked after START; START replaced after the first run by "Run your speed" in Part 2.

## Rule A to C: what the re-read sharpens
- **One guess, one white mark.** The guess is one number (one moving tick, in lab seconds). The first report offered two places (A5). **Recommend a new panel of two time bars on one scale** under the two light-clock panels, "Rest clock, one tick" (1.000 s) and "Moving clock, one tick, on the lab's clocks" (for example 1.155 s at 0.5c), with the white YOUR GUESS mark on the moving bar, as in Relativity 3. **Not recommended: drawing the guess as a white "guessed V" on the moving panel.** The speed is fixed, so a guessed tick of g seconds does not match the clock's geometry (the sideways distance would be v·g but the path would be c·g, which no triangle with a mirror gap of 0.5 allows unless g is the real value); the drawing would show an impossible clock. The bars avoid that.
- **The scale.** Part 1 is fixed at 0.5c, so the moving tick is 1.155 s; a scale from 0 to **twice the rest tick (2 s)** fits it, with an edge arrow for a guess outside. In Part 2 the speed varies (a tick of 1.005 s at 0.1c, 1.667 s at 0.8c and 7.089 s at 0.99c), so Drawing A's scale would run from 0 to **twice the moving tick** (as in Relativity 3, where the scale followed the duration), with a note that it changes. **Needs the owner's decision.**
- **One control.** Part 1 fixed at the page's current default, 0.5c (the specification's worked example, 0.6c, is not a preset; see Relativity 3, question 2). The speed (0.1c, 0.3c, 0.5c, 0.8c and "Other" 0.01c to 0.99c; **no 0c preset here**, because a tick needs motion to show the effect, and the specification lists none) moves to Part 2, which opens at 0.8c. **Moves a setup item of the specification (Learner Controls), so it needs the owner's decision.**
- **Part 2 drawing (Drawing A).** The two light-clock panels and the tick bars for the learner's speed, with the moving bar and its number in pink, no white mark (the guess was for the Part 1 run), and a "Runs so far" list with one line per run (for example "0.8c: rest tick 1.000 s, moving tick 1.667 s"). The learner can then see the diagonal and the tick lengthen with speed, which is Expected Observation 4.
- **C1, labels on the canvas.** The panels' SVG has only two "start" labels. Label: "Top mirror", "Bottom mirror", "Light pulse" (the yellow dot), "Path of the light" (the yellow line), "Where the mirrors started" (the dashed lines, now just "start"), and each panel's title inside the picture. At the high speeds the panels are stacked and the drawing is 720 units wide (`WIDE_THRESHOLD_LS`, above about 0.93c); the labels must still fit there. **Not checked by eye.**
- **C3 to C6, captions.** A full caption for the two panels ("How to read the two light clocks": the yellow dot, line, black bars, dashed marks, the clock readouts, what a longer line means, a worked moment such as 0.6c with a tick of 1.25 s, three-part look-for items), and one for the tick bars. The existing one-line captions ("At rest in the lab"; "Moving at Xc...") become part of these.
- **A9, the tutor.** The compare prompt quotes the numbers but not the mark; the explanation never mentions the guess. The specification's step 2 ("Prediction comparison") asks only for the numbers, so marking the guess in the explanation (with no score) is consistent. Unlike Experiment 3, **there are no "Great!" or "not alone" lines here and no margin to confirm.** The prompts would name the white mark.
- **O1, arithmetic in the tutor.** "Working out the diagonal" halves the sideways distance and the path in the component (`Experiment4Tutor.tsx`, the paragraph beginning "Working out the diagonal"). **Recommend** a small tested module function that returns the half-trip numbers (rise, sideways, diagonal), and the tutor displays them (§9). The numbers do not change.
- **Introduction, overlap and cross-references.** "A daily-life picture" and "What a light clock is" say nearly the same thing, and the new "What is a light clock?" paragraph in Relativity 3 now says it a third time. The mirror gap of 150,000 km ("a giant clock... so that the numbers are easy to read") is consistent with Experiment 3's 15 cm example. **Recommend** merging the two Experiment 4 paragraphs into one, keeping the heartbeat/pendulum comparison and the giant-clock note, and changing "Experiment 2" and "Experiment 3" to the chapters' titles. **Drafted for the owner's approval, not changed here.** The introduction already follows the specification's rule not to state the constancy of light's speed before the run; the draft keeps that.
- **A5 and "Where the real picture comes from".** Needed under both panels and the bars: "Calculated here from the speed; the light clock is imagined (a giant clock with mirrors half a light-second apart; real clocks are much smaller); no instrument measured it."
- **B1 to B3, recommendation as in Relativity 1 to 3.** The page computes the tick from the same triangle a check would use, so a check-up would be circular, and the control only moves marks and numbers. **No check-up and no setting-following table;** keep the plain results lines, add the guess tag on the moving tick line (B4), and add a short note under the results (B2: the two light paths, the two ticks and the light's speed, what each is, what it means with the real numbers, why it matters), without the mechanism (the tutor's).
- **The run's animation guard.** Already present (progress clamped at 0, `Experiment4.tsx`; recorded in the specification), so the blank-page bug found in Relativity 3 does not apply. The clamped value is not re-checked for the stacked wide layout.
- **Page width.** Already 900 px (the outer div), so no change.
- **Buttons.** `Experiment4.tsx` has no `toggle-button` class; it uses inline colours. **Recommend** the shared class, as for Relativity 3. Tutor colours stay as they are.
- **Scroll on START.** START scrolls the clocks into view (`displayRef.current?.scrollIntoView`). With the Parts layout the picture stays in Part 1, so the scroll still makes sense; to be re-checked in the browser.

## Updated size
**Medium** (unchanged): the Parts layout, labels on the canvas, a tick-bars panel with a white mark, a pink version for Part 2 with "Runs so far", two captions, words box, links (search and fetch), Start over, the merged introduction, the tutor's wording, the specification update, and tested module functions (the guess's position on the bars and its gap from the real tick; the tutor's half-trip numbers). Files: `Experiment4.tsx`, `Experiment4Tutor.tsx`, `lightClockExperiment.ts` and its test, the specification, `docs/DEVELOPMENT-STATE.md`.

## Questions for the owner before drafting (suggested defaults are the answers given for Relativity 1 to 3)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (no 0c) moves to Part 2, opening at 0.8c? Default: yes. (Alternative: 0.6c for a tick of exactly 1.25 s.)
3. **Bars:** two time bars (rest tick, moving tick) under the two panels, a white mark on the moving bar, an edge arrow; Part 1's scale 0 to twice the rest tick, Drawing A's scale 0 to twice the moving tick; **no white "guessed V"** (it would draw an impossible clock)? Default: yes.
4. **Part 2 drawing:** the two panels and the bars for the learner's speed, the moving bar in pink, no white mark, "Runs so far"? Default: yes.
5. **Tutor marking:** the explanation marks the guess with no score (no "Great!" lines exist here), and the half-trip arithmetic moves into the module with tests? Default: yes.
6. **Introduction:** merge "A daily-life picture" and "What a light clock is" into one paragraph, use the chapters' titles, keep the constancy of light's speed unstated before the run? Default: yes.
7. **Reading guide:** no check-up or setting-following table; a guess tag on the moving tick line and a note under the results? Default: yes.
8. **Links:** search for plain official pages on time dilation and the light clock (allowed here because the introduction already names time dilation; read first and check they do not give the tick answer), reuse Relativity 3's NASA page for the speed of light, record gaps under §29 rule 3(c) for the light-second, reference frame and Einstein's postulate where none exists? Default: yes.
9. **Words box:** terms only, no algebraic formula (the specification's reservation stays)? Default: yes.
10. **Buttons:** switch to the shared `toggle-button` class? Default: yes.
11. **Size:** accept Medium? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths and the stacked wide layout (above about 0.93c) were not looked at; no source page was searched or fetched for the links list. The tick values quoted (1.005 s at 0.1c, 1.667 s at 0.8c, 7.089 s at 0.99c) come from the module's formula and were checked with a one-line calculation (1/√(1 − v²)), not by running the page.
