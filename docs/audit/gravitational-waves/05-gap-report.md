# Gap report: Gravitational Waves Experiment 5 (Stretched by Motion)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/05-redshift-of-a-receding-source.md | Components: src/components/GravitationalWaveRedshiftExperiment.tsx, GravitationalWaveRedshiftTutor.tsx | Physics module: src/physics/gravitationalWaveRedshiftExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
A chirp seen from a receding source at 0 to 0.9 c, with "Emitted" and "Detected" beacons, wave traces, and a "cycles behind" badge. Two predictions (higher/lower/same; more/less/exactly the classical stretch). Gaps: the caption is one short paragraph shown only after a run, with no reading guide, no marks; the intro and drawing preview both answers. The drawing already shows the contrast well (Emitted vs Detected). Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Detected frequency higher, lower or same as at the source? (:346-349) | higher / lower / same (:63-68); `directionPrediction`, `submittedDirectionPrediction` (:98,:100) | The "Emitted" vs "Detected" wave traces (:547-556): the detected wave is longer |
| 2 | Will the real stretch be exactly, more or less than an everyday Doppler effect? (:364-367) | exact / more / less (:70-75); `magnitudePrediction` (:99,:101) | **Not drawn.** The classical factor appears only as a number in Results (:590-591). Nearest picture: the Emitted/Detected pair; add a third "classical-only" trace on its own scale |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | `dopplerFactorFor(speed)`, `chirpStateAt` (:110-124); predictions not read by physics | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:457-568) | Q1: mark beside the Detected trace; Q2: mark on a classical-vs-real bar |
| A3 | Not met | Q1 and Q2 are choices; markers only | "Only a marker" note |
| A4 | Not met | n/a; the traces are drawn when `isActive` (:551,:556) | Draw marks then |
| A5 | Not met for Q2 | See table above | New small panel: classical factor vs real factor, its own scale |
| A6 | Not met | No source line (:457-578) | "Calculated here" for both factors |
| A7 | Not met | Intro (:272-343) has no mention of guess marks | New text |
| A8 | Partly met | Module has `classicalDopplerFactorFor`, `dopplerFactorFor` with 5 tests (physics/gravitationalWaveRedshiftExperiment.test.ts:5-35). Missing: mark positions, and the "higher/lower/same" and "exact/more/less" truth. The truth is decided inside the component with `runSummary.speed === 0` branches (:592-605) | Module function returning the answer for any speed |
| A9 | Not met | Tutor compare (GravitationalWaveRedshiftTutor.tsx:68) and Results "In fact" (:600-606) give the answers | As earlier |
| A10 | Not met | No sentence says guesses do not change results; "Change predictions" button (:394-415) | Report only |

## Rule B
- B0: One Results block (:580-614): emitted and detected frequency, measured and classical factor, a sentence on why, a prediction line with "In fact", and a velocity-only-redshift note. No tables.
- B1: Real reference exists: the exact relativistic Doppler factor is the module's own output; the "expected" classical alone is the comparison. A two-row check-up (classical vs real) is natural and the numbers are already in the module.
- B2: Not met.
- B3: Partly met. The speed slider changes the numbers, but no table or reference.
- B4: Partly met (text only, verdict).
- B5: Partly met. Factors from the module. The 0 or non-zero branch is in the component.

## Rule C
- C1: Partly met. "Arm X", "Arm Y", "Emitted", "Detected" and the badge "x behind" are drawn (:523-566). The badge's "behind" has no unit on the canvas (behind what? cycles).
- C2: Met. Emitted and Detected pulse and draw visibly different waves, and the badge changes with speed.
- C3: Partly met. A one-paragraph note (:569-578) appears only after a run starts; no "How to read this diagram" heading.
- C4: Partly met. It explains the beacon size and the direction of the difference; it does not explain the traces' colours, the arm overlay, the 10x scroll boost (:240-241), or the badge.
- C5: Not met. No worked numbers (for example 0.5 c, factor 0.577 vs 0.667).
- C6: Not met. The "What to look for" paragraph (:306-317) is a prose block before the run.
- C7: **Not met.** "What happens" says the arms pulse at the detected frequency, "slower than the frequency the source actually emitted" (:296-298), and "What to look for" says the factor is "slightly bigger than an everyday Doppler effect alone" (:315-316). These give both answers before the learner predicts (§12).
- C8: Partly met. "Doppler effect" and "redshift" are explained (:281-292); "time dilation" is used in Results (:594) and the tutor via cross-reference only; "Doppler factor" is shown in the readout (:452) before it is defined.

## Other findings
- O1: None found. Spec says wording approved 2026-10-04.
- O2: (a) §12 hints above. (b) "Slightly bigger" (:315) understates it: at 0.9 c the real factor (about 0.23) differs from the classical (0.53) by more than a factor of two (computed from the formulas in the module; not run). (c) The speed range up to 0.9 c for a gravitational-wave source is a toy; the page says so. (d) "first defined in the Gravity and Curved Spacetime chapter" (:290) is a chapter reference, not a link.

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: M** (one new classical-vs-real mini panel, marks on two existing/new areas, caption rewrite).

## Not checked
Not run in a browser. The factor values quoted in O2 are my arithmetic, not a run. PROJECT.md/AGENTS.md not read in detail.

## Step 1 re-read and additions (2026-11-07)
Re-read of the component (`GravitationalWaveRedshiftExperiment.tsx`, 627 lines), the tutor (143 lines), the module (22 lines, two functions, five tests) and the specification against Rule E, the rules the owner added to `CLAUDE.md` on 2026-11-07 and the first report, using the Gravitational Waves 1 to 4 audits as the pattern. Nothing was run in a browser; nothing was changed in the app.

- **E1 to E3 Not met.** One `exp-card` (:271) holds the introduction, both predictions, the speed slider, Run, the readout, the diagram, the note, the Results and the "Change predictions" button; the tutor is a second card below. There are no Parts, coloured lines or leads, no "Words and formulas" box and no links.
- **E4 n/a until built.** Part 1's lead must not give the answers; the introduction currently does (first report, C7).
- **E5.** One control (the speed slider) and one Run. The mapping onto the four Parts is the owner's decision (question 2 below).
- **New rule, "Parts 2, 3 and 4 appear after the first Run".** Today the Results and the tutor appear after the first run (:580, :618), so that part is already met. A Part 2 does not exist yet.
- **New rule, "Links and Words".** Not met: no "Want to know more?" list and no words box. The page uses no real measured result, so there is no original paper to link; plain official pages are needed for "Doppler effect", "redshift" and, in the closing note, "cosmological redshift". Step 2 searches for them and fetches each one before any wording is approved; where none is found, §29 rule 3(c) applies.
- **New rule, "Start over, not Change prediction".** Not met: the "Change predictions" button (:394-415, label at :412) appears only after a run. It would become an always-visible "Start over". Two predictions lock together on the first Run.
- **A5 refined (the second prediction).** The classical factor and the real factor are both already computed in the module (`classicalDopplerFactorFor`, `dopplerFactorFor`), so a "classical vs real" panel can be drawn without a run. Neither guess has a size of its own, so both marks would be markers only (question 3).
- **A8 refined.** The module lacks the truth of each guess ("higher, lower or the same" and "exactly, more or less"), which the component decides with `speed === 0` branches (:592-606). It also lacks a function for the stretch of each wave (1 ÷ factor), if the picture shows stretch rather than factor (question 3).
- **A prediction can only have a fixed answer at a fixed, non-zero speed.** At speed 0 both answers are "the same" and "exactly", and at any speed from 0.05c up they are "lower" and "more". The first build lets the learner predict and then pick any speed, so the real answer to the prediction depends on a slider the learner moves after guessing. Part 1 needs one fixed speed, as Gravitational Waves 3 fixed its mass (question 2).
- **New finding O2(b) made exact.** "Slightly more" (:315, tutor :71 and the specification) understates the effect. Computed from the module's formulas (my arithmetic, not a run): the classical and the real factor are 0.769 and 0.734 at 0.3c, 0.667 and 0.577 at 0.5c, 0.588 and 0.420 at 0.7c, and 0.526 and 0.229 at 0.9c. As stretch (1 ÷ factor) that is 1.30 against 1.36, 1.50 against 1.73, 1.70 against 2.38 and 1.90 against 4.36. The gap is small at low speed and large at high speed, so "slightly" is wrong across most of the slider.
- **New finding O6, the readout names a number before it is defined.** "Doppler factor" appears in the live readout (:452) before the introduction defines it (first report C8). A new word, "Doppler factor", needs a plain meaning at the point where it first appears.
- **New finding O7, a possible conflict with the specification.** The specification says the same fixed observer-time window plays at every speed (§11). The page also says the detected wave "pulses at the detected frequency". Both are true in the code, but the "Emitted" beacon uses the unscaled reference chirp (:124), so "Emitted" and "Detected" are two clocks running at different rates inside one window, not two moments of one wave. The caption should say this; nothing in the physics is wrong.

### Questions for the owner (before wording is drafted)
1. **Which gaps to fix?** All of the first report's (marks for both guesses, a classical-vs-real panel, a source line, the introduction and control notes, a real caption with a worked moment and Look at / What it means / Why it matters, a module function for the truth of each guess, the tutor and Results no longer giving the answers) and, from this re-read, the four Parts, the links and words box and Start over. The agent suggests all.
2. **Part 1's fixed speed, and the slider.** Part 1 is one Run at one fixed speed, so the two predictions are about one real run; Part 2 has the speed slider (0 to 0.9c) with the learner's value in pink. The agent suggests 0.5c for Part 1 (the current default; classical factor 0.667, real factor 0.577). Which speed?
3. **The second picture, and how to draw the stretch.** The first guess lives on the "Emitted" and "Detected" traces. The second needs a new panel on the same picture, on its own scale, with two bars: the everyday-Doppler stretch and the real stretch. The agent suggests drawing **stretch** (1 ÷ factor: 1.50 against 1.73 at 0.5c, "how many times longer each wave is"), not the factor (0.667 against 0.577), because a longer bar then means more stretch and matches "more" and "less" in the question. This adds one small module function. Both guess marks are markers only (white box and outline: "higher / lower / the same" beside the Detected trace, and "exactly / more / less" against the everyday bar). OK?
4. **Check-up and a table for the slider.** The exact relativistic factor is a value the same physics predicts, so a short check-up (the everyday guess beside the real value, with "the real stretch is more") has a real reference. The agent suggests a check-up of two rows. The agent also suggests one optional table for the learner's speed (the factors and stretches at the speed they chose, beside the published value, which here is the same formula), but only if it tells the learner something the pictures do not; the 0.3, 0.5, 0.7, 0.9c numbers above suggest it does (the gap grows). Include the check-up? Include the speed table?
5. **"Slightly more".** Replace it everywhere with wording that says the extra stretch is always there and grows with speed (small at 0.3c, more than twice the everyday stretch at 0.9c). OK?
6. **Answers in the introduction and the Results.** Remove the lines that give both answers before the prediction ("slower than the frequency the source actually emitted", "slightly bigger than an everyday Doppler effect"), and move them to the tutor; the Results lose their "In fact" sentence. Same rule as Gravitational Waves 1 to 4. OK?

## Not checked (this re-read)
Not run in a browser. The factors in O2(b) are my arithmetic from the module's formulas (checked by a one-line script, not by the page). No source page has been searched or fetched yet.

## Outcome (2026-11-07)
The owner answered "all defaults" to the six questions and "approve with defaults" to the draft in `05-draft-wording.md`, and it was built (commits `18d5f0a`, `9567a46`, `cdc52ab`). What was done:
1. **The four Parts, one Run at 0.5c, Start over** (always visible), and the links list and words box above Part 1.
2. **One picture with two panels:** Panel A (the arms and the Emitted and Detected waves) and Panel B (the everyday and real stretch as bars, on a fixed scale of 0 to 4.5). Both guesses are white markers only.
3. **The module** now holds the stretch, the run summary, the two guess outcomes and matches, the marker choices and the comparison for the learner's speed (18 new tests).
4. **Question 1, "what does emitted mean?" (found while drafting).** Built as option (a): the Emitted wave is drawn at the pitch the readout calls emitted, so the two waves differ by exactly the Doppler factor (0.577 at 0.5c). The old page drew "Emitted" from a no-motion run, which made the gap between the two traces a stretch of 3.8, not the 1.73 it reported.
5. **Two choices beyond the approved draft** (to be confirmed by the owner): guess 1 is also drawn on Drawing A, labelled "for 0.5c" (the draft left Drawing A without a guess; the rule says to draw it where its answer lives); and "cycles behind" is counted against the Emitted wave, not against a no-motion run.
6. **Answers removed** from the introduction, the "What to look for" paragraph and the Results; "slightly more" is replaced everywhere, including the chapter summary in `src/App.tsx`, by wording that says the extra stretch is always there and grows with speed.

Open: the helper's source pages were read through a summariser and not by the agent; no plain official page for GW150914's detector-frame masses (§29 rule 3(c)); the owner has not reviewed the finished page. See the specification's "Audit update (2026-11-07)".
