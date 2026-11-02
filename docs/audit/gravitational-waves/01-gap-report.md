# Gap report: Gravitational Waves Experiment 1 (Ripples in Spacetime)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/01-gravitational-waves.md | Components: src/components/GravitationalWaveExperiment.tsx, GravitationalWaveTutor.tsx | Physics module: src/physics/gravitationalWaveExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Two arms stretch and squeeze under a wave; amplitude and frequency sliders plus three presets; two predictions; a Results block; a 4-step tutor. Gaps: no "How to read this diagram" caption, no on-canvas labels, no reading guide, no guess marks (the older rule applies). Both predictions have fixed answers (always "opposite" and "back to original"), so there is nothing a guess could be drawn against except the arm graph. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Do both arms do the same thing or opposite things? (:102-106) | same-way / opposite-ways (:78-81); state `directionPrediction`, locked as `submittedDirectionPrediction` (:179,:181) | Arm graph (:421-455): the two traces mirror each other about the dashed rest line |
| 2 | After the wave passes, arms longer / shorter / back to original? (:142-145) | longer / shorter / back-to-original (:83-87); `afterPrediction` (:180,:182) | Right-hand end of the arm graph (final value vs the dashed rest line) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met (listed) | above | None |
| A1 | Met | Real values come from `gravitationalWaveStateAt(displayedTime, amplitude, frequency)` (:189); prediction state is read only for gating and for text (:184,:459-509) | None |
| A2 | Not met | No white mark or "YOUR GUESS" box anywhere in the SVGs (:408-448) | Q1: a marker pair on the arm graph; Q2: a marker at the graph's right edge. Both need the graph to exist before the run ends |
| A3 | Not met | Not drawn. Both are choices with no size, so markers would do | Caption would have to say "only a marker" |
| A4 | Not met | n/a today. The arm graph appears only after the run starts (:421) | Marks to be drawn only when the graph is drawn |
| A5 | Partly met | Both answers can sit on the existing arm graph, no new picture needed | Mark panel on the arm graph |
| A6 | Not met | No "Where the real picture comes from" line under either picture (:408-455) | Add: calculated here by the toy model, not measured |
| A7 | Not met | Introduction (:257-321) never mentions predictions or white marks | New intro paragraph (and a note beside the two sliders) |
| A8 | Not met | Module exports only `BASE_ARM_LENGTH`, `gravitationalWaveStateAt` (src/physics/gravitationalWaveExperiment.ts). The "actual" answers are constants in the component (`ACTUAL_DIRECTION`, `ACTUAL_AFTER`, :65-66), not module outputs | Module functions for each guess's mark position and the real value, with tests |
| A9 | Not met | Tutor "compare" step states the real answers (GravitationalWaveTutor.tsx:67-68) and Results already says "In fact" (:501-508). Tutor does not name any mark | Tutor to name marks; "In fact" belongs in the explanation only |
| A10 | Not met | No sentence anywhere says guesses do not change the results (grep of the component finds only code comments) | CLAUDE.md §14 says older experiments carry this line; this one does not |

## Rule B
- B0: One "Results" block (:457-519): amplitude/frequency line, arm min/max lengths, a sentence about opposite motion, two prediction lines, and a "A real detection" note. No tables.
- B1: Real reference exists in the spec: strain about 1 part in 10^21, arms 4 km (:511-516). It cannot be compared with the toy numbers (the strain here is 0.08 to 0.4), so a check-up row would be "not comparable". Likely **N/A**; owner to decide.
- B2: Not met. No "What this table tells us" notes; the Results paragraphs give numbers but not what they mean or why they matter.
- B3: N/A. The controls only move the drawing; no real reference.
- B4: Partly met. Guesses shown beside "In fact" lines (:500-509) with no tag on a row and with a verdict ("In fact"), not guess-only.
- B5: Not met. Min/max and the `(max - base)` / `(base - min)` arithmetic are done in the component (:483-493), not the module.

## Rule C
- C1: Not met. Arm lines and three dots are drawn with no text (:414-418); the source/wave is not drawn at all. The graph has a colour legend only (:451-454).
- C2: Partly met. Slider changes amplitude and frequency, and the drawing changes. Arm X and Y are only told apart by graph colour.
- C3: Not met. No caption under either picture.
- C4: Not met (no caption).
- C5: Not met. No worked moment with numbers.
- C6: Not met. No "what to look for" list.
- C7: Met by absence (nothing in a caption), but the **intro** "What happens" (:285-289) says one arm stretches while the other squeezes, which is Prediction 1's answer, shown before the prediction (§12). See O2.
- C8: Partly met. "Polarization" is quoted in an assumption (:311) and tutor point 2 (Tutor:119-120) with only a half-definition; "strain" appears (:404) and is not defined until Experiment 2's results.

## Other findings
- O1: Spec header says wording approved 2026-09-29; consistent. No conflict found. Not checked against docs/PROJECT.md in detail.
- O2: (a) Intro "What happens" gives Prediction 1's answer before the prediction (:285-289) and the pond paragraph (:276-284) hints at it. (b) Both predictions have a fixed truth, so they test a fact stated in the intro. (c) "Experiment 4 showed..." (:258, Tutor:70) uses the specification number of the Gravity chapter's Experiment 4 with no chapter name; a learner sees many "Experiment 4" pages. (d) The 1.3 billion light-years, one-thousandth of a proton and 2015 claims (:511-516) have no link or source on the page.

## What an update would touch, and its size
Component, tutor, physics module (+ tests), spec; possibly a new caption block. **Size: M** (caption and labels are new, plus a mark panel on the graph and module functions).

## Not checked
Not run in a browser. Did not read docs/PROJECT.md or AGENTS.md line by line. Sources for the real figures not opened.
