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

## Step 1 re-read and additions (2026-11-04)
Re-read of the component, tutor, module and specification against Rule E and against the first report. Nothing was run in a browser; nothing was changed in the app.

- **Corrections to the first report.**
  - O2(a) understated the early reveal. The introduction gives the answer to **both** predictions, not one. "What happens" (:285-289) says "one arm stretch while the other squeezes ... before both settle back to normal", which answers Prediction 1 (opposite) and Prediction 2 (back to normal). The "ripple" paragraph (:264-275) also says space is squeezed one way and stretched the other way, "then swapping". Under §12 this is the biggest wording gap.
  - The Results "In fact" lines (:500-509) and the tutor's compare step (Tutor:67-68) both give the verdict early. The tutor's compare step is the only place the new rule allows it, and only by naming the marks.
- **E1 to E3 Not met.** One card holds the introduction, both predictions, the sliders, the presets, Run, the arm picture, the graph and the Results. There are no Parts, coloured lines or leads. The tutor box already has the blue heading colour but no "Part 4" heading.
- **E4 N/A until built.**
- **E5, a structural question for the owner.** In this experiment the sliders and presets are used **before** Run, and they set what the run shows (the arm picture and graph are drawn from them). In the Cosmic Horizons audits Part 1 ran the real measurement and Part 2 came afterwards with its own drawing. Here the controls come first. Options: (i) Part 1 runs at the "Typical detected event" setting with no sliders, and Part 2 holds the sliders, the presets and a second run with its own drawing; (ii) keep the sliders in Part 1 and have Part 2 hold only a note; (iii) another arrangement. Claude does not decide this.
- **C1/C2 added.** The arm picture has no rest-length reference. The learner cannot see how far an arm has moved from rest, only the arm's current length. A dashed rest outline would show the stretch and squeeze directly.
- **A4 clarified.** The graph is drawn only once a run starts (:421), so its two guess marks can appear only then. Before the run there is no feature for a mark to sit beside.
- **B0/B1/B2 added.** The Results has no table. Option for the owner: turn "Arm X ranged from ... to ..." into a small table of lowest, highest, stretch and squeeze for each arm, with a "What this table tells us" note. There is no real reference to put in a check-up (the real strain is about 1 part in 10^21; these numbers are 0.08 to 0.4), so the check-up would be left out.
- **O2(c) cross-references.** The introduction, tutor and chapter summary say "Experiment 4" and "Experiment 5" for experiments in the Gravity and Curved Spacetime group. A learner sees several pages with those numbers. Wording should name the chapter or the title (for example "the Curved Spacetime experiment").
- **O2(d) sources.** The 2015 detection, the 1.3 billion light-years and the "one-thousandth of a proton" figure have no source on the page. Rule D does not apply outside Cosmic Horizons, so this is a recommendation, not a gap.

### Decisions for the owner before Step 2 (wording)
1. **Page layout (E5).** Option (i), (ii) or (iii) above.
2. **Introduction.** Rewrite "What happens" and the "ripple" paragraph so they do not give either answer (§12)? Recommended: yes.
3. **Guess marks.** One white "YOUR GUESS" marker pair on the graph for Prediction 1 and one marker at the graph's right edge for Prediction 2. Both are choices with no size, so the caption would say they are only markers.
4. **Results.** Option to add the small table and note (B0/B2), and to drop the "In fact" lines so the guesses are shown only, tagged to the row where the number appears.
5. **Rest outline** on the arm picture (C1/C2).
6. **Cross-references** renamed as above (O2(c)); sources for the real figures (O2(d)): yes or no.

## Resolution (2026-11-04)
Every gap above was fixed at the owner's direction (all defaults, then changes from review); see `01-draft-wording.md` ("Differences between this draft and the built page") and the specification's last Implementation Note. Open: no plain official page for "strain"; a wrong guess, the other presets, the extreme slider settings and narrow widths were not checked.
