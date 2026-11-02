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
