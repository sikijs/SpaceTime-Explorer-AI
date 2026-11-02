# Gap report: Relativity of Time and Motion Experiment 5 (Why Can't Light Go Faster?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/05-invariant-light-speed.md | Components: src/components/Experiment5.tsx, Experiment5Tutor.tsx | Physics module: src/physics/invariantLightSpeedExperiment.ts (+ test, 21 tests; reuses lightClockExperiment.ts) | Status: read-only, nothing changed

## Summary
Three light-clock panels (rest, moving under an "everyday rule", moving under light's actual rule). One prediction in three parts: which rule gives the longer tick (three buttons) and two tick durations (numbers). Older rule: no guess marks, one-line captions only, no "Where the real picture comes from", no reading guide. The "everyday rule" panel is a hypothetical but is drawn in the same colours and with the same caption as the real one. Size: **L** (three guesses, three panels, imagined-versus-real distinction, a full caption).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1a | Which rule makes the moving tick longer? (Experiment5.tsx:451-465) | Buttons: everyday / actual / both the same; `choice` (:217) | The two moving panels (their path lengths and tick times); a choice has no position, so a marker is needed |
| 1b | Ticks under the everyday rule (:466-481) | Number; `everydayInput` (:218) | The everyday-rule panel's tick |
| 1c | Ticks under light's actual rule (:483-495) | Number; `actualInput` (:219) | The actual-rule panel's tick |
All three are bundled into one `Prediction` object (:14-18, :233-240), saved at :250.

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runInvariantLightSpeedExperiment(selectedVelocity)` (:244, :255); prediction not read | None |
| A2 | Not met | Guess text only (:616-624) | White marks with "YOUR GUESS" on each moving panel |
| A3 | Not met | None | Numbers follow their tick; the choice (1a) is a marker only, and the caption would say so |
| A4 | N/A | No marks; panels build up during the run | Marks only after both ticks are drawn |
| A5 | Partly met | No time scale on the panels | Add a tick-time strip under the three panels on one scale, with white marks |
| A6 | Not met | No line | Needs: the actual-rule panel is calculated here; the everyday-rule panel is imagined (a "what if") and must be named so and drawn in another colour |
| A7 | Not met | Intro (:304-392) has no statement; speed control note units only (:398-401) | Add intro sentence and note |
| A8 | Not met | Module exports run and state functions (invariantLightSpeedExperiment.ts:24, :62-80) | Add tested guess-mark helpers; the tutor does arithmetic in the UI (Experiment5Tutor.tsx:146-153) |
| A9 | Partly met | Compare prompt restates the choice and both guesses beside the real values (Experiment5Tutor.tsx:82); the explanation (:124-177) does not mark the guess | Prompts would name the marks |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:360). Nothing says predictions do not change the results | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lists: rest clock, two rule blocks, "Your prediction" (:579-625). No tables | |
| B1 | Partly met | The actual rule matches Experiments 3 and 4 by the same physics (module test :52-70); the spec avoids experimental evidence on purpose (spec Decision 6, 05-invariant-light-speed.md:305) | No external reference allowed by the spec; leave as is unless owner decides |
| B2 | Not met | No notes (values only by design, :192) | Notes could point to the 1.000c versus above-c light speed rows |
| B3 | Optional | Speed control | Owner's choice |
| B4 | Partly met | Guess vs real lines (:616-624), no tags | Tags on the tick rows |
| B5 | Partly met | Numbers from the module | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Not met | The SVG has only "start" labels (:170-175); mirrors, pulse and path have none; panel titles are HTML (:155-157) | Label on the canvas |
| C2 | Partly met | The rest and the actual-rule panels differ in path. The two moving panels differ only in sideways reach: everyday rule v × 1 s versus actual rule v × γ s (module tests :29-46, :52), so at 0.1c they look almost the same. The everyday panel uses the same colours and caption as the real one (:553, :563) | A visible "imagined" distinction is missing (CLAUDE.md §14 item 2) |
| C3 | Partly met | One-line captions: "At rest in the lab"; the identical sentence under both moving panels (:542, :553, :563) | Full caption missing |
| C4, C5, C6 | Not met | As C3 | Name three panels, define lab seconds and light speed above c, worked moment (0.6c) and three-part look-for items |
| C7 | Partly met | The intro does not state the answer, but the intro says light "gets the lamp's speed added" and that this is "only a 'what if'" (:339-340), which tells the learner which rule is real before the prediction (the spec states the same at 05-invariant-light-speed.md:42, :167) | Report only: the real rule is announced before the learner predicts; the owner decides |
| C8 | Met | Tick, light-second, lab seconds, reference frame, c defined before use (:309-321, :359-360, :370-373) | |

## Rule D
Not applicable.

## Other findings
- O1: None found against the spec. The spec's open items are recorded resolved (05-invariant-light-speed.md:310-316).
- O2: "Einstein's postulate" is stated as the rule used in the course (:346-347); no source is given for the postulate, and the spec says evidence is left out on purpose. The tutor's "ball thrown from a train" daily-life example (Experiment5Tutor.tsx:135-136) fits §15. Same inline colours as Experiments 3, 4 and 6 for the buttons.

## What an update would touch, and its size (O3, O4)
Experiment5.tsx (panels, tick-time strip, imagined colouring, caption, intro, notes), Experiment5Tutor.tsx, invariantLightSpeedExperiment.ts and test, the specification. Size: **Large**.

## Not checked
Browser appearance, narrow widths, dark mode, wide layout above 0.93c. Code and text read only.
