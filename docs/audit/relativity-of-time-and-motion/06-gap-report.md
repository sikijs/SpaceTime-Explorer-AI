# Gap report: Relativity of Time and Motion Experiment 6 (Does Motion Change Length?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/06-length-contraction.md | Components: src/components/Experiment6.tsx, Experiment6Tutor.tsx | Physics module: src/physics/lengthContractionExperiment.ts (+ test, about 25 cases; reuses lightClockExperiment.ts) | Status: read-only, nothing changed

## Summary
Three light-clock panels along the direction of motion: a rest clock, a moving clock with its mirrors "as far apart as at rest" (a hypothetical) and a moving clock with the mirrors "closer together". The prediction has two parts (a choice and a distance in light-seconds), and the distance is a natural thing to draw as a white pair of mirror marks. This is the one experiment of the six with a real multi-sentence caption (`clocksCaption`, :335, shown :590-592), but it is a single paragraph with no look-for items and no worked moment. Older rule: no guess marks, no "Where the real picture comes from", no reading guide. Size: **L**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1a | Must the mirrors be as far apart, closer or farther (Experiment6.tsx:490-505) | Three buttons; `predictionChoice` (:267) | The mirror spacing in the two moving panels. A choice with no size of its own: marker only |
| 1b | How far apart, in light-seconds (:506-521) | Number; `predictionInput` (:268) | The gap between the back and front mirrors in a moving panel; it can be drawn to scale (mirror positions are on the panels' light-second scale, :123) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runLengthContractionExperiment(selectedVelocity)` (:288, :299); prediction not read | None |
| A2 | Not met | Guess is text only (:640-646: "You guessed that the two mirrors must be ...") | White "YOUR GUESS" mirror pair at the guessed gap, with a box and a line |
| A3 | Not met | None | Number gives a gap; the choice is a marker only (caption would say so) |
| A4 | N/A | No mark. Note: the panels draw the geometry before START (:288, :555-593) | The mark would be drawn once the mirrors' real positions are drawn |
| A5 | Met in principle | The mirror gap is already on the panels (scale shared, :94-96) | Mark can go on the existing panels |
| A6 | Not met | No line | Needs: calculated here; the "as far apart as at rest" clock is imagined and is not what happens (the tutor says so, Experiment6Tutor.tsx:181-182) |
| A7 | Not met | Intro (:350-426) has no statement; speed note (:432-436) explains units and the 0.9c cap | Add intro sentence and note |
| A8 | Not met | Module exports REST_LENGTH, run and state functions (lengthContractionExperiment.ts:12-125) | Tested function for the guess mark's position and the gap to the real length |
| A9 | Partly met | Compare prompt gives the guess and both real lengths (Experiment6Tutor.tsx:80); the explanation (:122-186) does not mark the guess | Prompts would name the mark |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:400-401) | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lists: speed, time-dilation tick, rest clock, two version blocks, the guess (:611-660). No tables | |
| B1 | Partly met | Same-physics reference: "Difference from the tick that time dilation gives" row already exists (:251-254) for each version; a "found equals expected" reading could be added. No measured value in the spec | Owner decides |
| B2 | Not met | No notes (values only by design, :229) | Notes on the difference row and the ratio row |
| B3 | Optional | Speed control | Owner's choice |
| B4 | Partly met | Guess lines beside real lengths, no tags | Tags |
| B5 | Partly met | Numbers from module | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Partly met | On the canvas: "start" (:176-187) and "front mirror when the pulse hit it" (:200). Back and front mirrors, the pulse, its path and the two heights of the legs are unlabelled; titles are HTML (:154, :569, :580) | Label on the canvas |
| C2 | Met | The two moving panels differ in mirror spacing at a shared scale (:94-96, :568-589) | Both moving panels use the same colours, and the hypothetical one is not marked "imagined" |
| C3 | Partly met | A paragraph caption under all three panels (:335, :590-592) | Detailed caption incomplete |
| C4 | Partly met | The caption names the rest and moving clocks, dashed lines, the faint turn mark and the offset legs; it does not define lab seconds, light-seconds, "c" or say what the yellow dot, the line and the black bars are, and is one dense paragraph | Short sections, bullets |
| C5 | Not met | No worked moment | Needed (for example 0.6c: gap 0.4 light-seconds) |
| C6 | Not met | No look-for items | Three-part items needed |
| C7 | Partly met | Before START the learner already sees the "closer together" panel's mirrors drawn nearer than the rest clock's (preview at :288, :555-593; the spec records the label hint as kept by the owner, 06-length-contraction.md:329-331) | Report only: part of Prediction 1 is visible before the guess; the owner decides |
| C8 | Met | Tick, light-second, lab time, time dilation defined or recalled before use (:365-387, :410-413) | |

## Rule D
Not applicable.

## Other findings
- O1: The spec records that wording approval was "blanket approval, no fresh read-through" (06-length-contraction.md:333). Not a conflict; noted because §28.1 says line-by-line.
- O2: The speed range is capped at 0.9c here while Experiments 3 to 5 allow 0.99c (:19-22), explained in a comment and the spec. At 0.01c the two ticks agree to three decimals (spec :331). Hardcoded button colours as in Experiments 3 to 5. The "front mirror when the pulse hit it" mark is a good example of labelling an element on the canvas.

## What an update would touch, and its size (O3, O4)
Experiment6.tsx (white mirror-pair mark, labels, caption rewrite, imagined colouring, intro, notes), Experiment6Tutor.tsx, lengthContractionExperiment.ts and test, the specification. Size: **Large**.

## Not checked
Browser appearance, narrow widths (the spec notes drawings shrink to about 213 by 33 px), dark mode. Code and text read only.
