# Gap report: Cosmology Experiment 10 (The fate of the universe)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/10-fate-of-the-universe.md (and closing-synthesis.md, see Other findings) | Components: src/components/FateOfTheUniverseExperiment.tsx (1,199 lines), FateOfTheUniverseTutor.tsx, and the closing section src/components/CosmologySynthesis.tsx | Physics module: src/physics/fateOfTheUniverseExperiment.ts (+ .test.ts, 23 tests) | Status: read-only, nothing changed

## Summary
Three pictures (a size-against-time graph for the next 100 billion years with a no-dark-energy reference, four bars for the first four doublings, a strip of galaxies), a "share of dark energy" control, two predictions about the real best-fit universe, Results with an eight-row table, a worked calculation, an expansion-rate explanation with several examples, daily-life comparisons, and two "can and cannot tell you" boxes, a 3-prompt tutor, and the Cosmology closing synthesis below. Both predictions have natural homes: Prediction 1 on the graph (curve shape), Prediction 2 on the bars (the second doubling's length: 5, 11 or 30 billion years). Gaps: no marks, no "Where the real picture comes from", no check-up, no "What this table tells us", and a hard-coded verdict. Size: **L** (three pictures and an eight-row table need the work; the caption is the longest of the group).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | The universe is expanding today. What does the far future look like? (FateOfTheUniverseExperiment.tsx:382; choices :34-38) | Slows down and stops / Keeps going but ever more slowly / Keeps speeding up and never stops | Picture 1, the gold line's shape on the size graph (:531-620); the pink "speeding up" dot |
| 2 | If the universe takes about 11 billion years to double from today, how long will the next doubling take, from 2x to 4x? (:~398-402; choices :41-45) | Shorter (about 5 billion) / About the same (about 11 billion) / Much longer (about 30 billion) | Picture 2, the second bar's length against the first (:622-725) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result`, `realResult`, `noDarkEnergyResult` depend on the share only (module :97); predictions only feed text (:1088-1110) and tutor props (:1185+) | none |
| A2 | Not met | No guess element in the three SVGs (:531-770) | Prediction 1: a white guess curve (flattening to a stop / flattening slowly / curving up) on Picture 1 with a "YOUR GUESS" box; Prediction 2: a white bar of 5 / 11 / 30 billion years beside the second bar on Picture 2 |
| A3 | Not met | | Prediction 2 has a length (follows the guess); Prediction 1 is a three-way choice (a drawn curve per choice, caption says it is only a sketch) |
| A4 | Not met | The graph, bars and strip draw during the 10-second Run (:774-780) | Draw marks after the run reaches the relevant feature (end of the run for the graph, after the second bar for the bars) |
| A5 | Met (pictures exist) | graph and bars already carry both | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: the lines and bars are calculated here from the Experiment 5/6 model (flat, matter plus constant dark energy, H0 70, no radiation); today's 30/70 matter and dark energy split is the page's best-fit value; whether dark energy is constant is open (the page says so at :~1050-1060 and :1141-1146); the strip is not to scale |
| A7 | Not met | Intro (:264-340) and the control (:~455-514) say nothing about guesses never changing the pictures or tables | Add sentences; note beside the share control; also say the predictions are about the real best-fit universe whatever share is chosen |
| A8 | Partly met | Sizes, doubling times and rates come from the module; the guess verdicts are hard-coded strings in the component (`=== 'faster'` :1095, `=== 'same'` :1109) and the "real" examples are run in the component (`realResult`, `noDarkEnergyResult`); the 5/11/30-billion-year answer labels are typed into the labels (:41-45) | Module functions for the guess marks, with tests (the module already tests doubling times and settled values, 23 tests) |
| A9 | Not met | Tutor compare prompt (FateOfTheUniverseTutor.tsx:98-99) restates the guesses and names no mark; verdicts in Results (Experiment.tsx:1095-1110) | Prompts to name marks; verdict placement is the owner's decision |
| A10 | Not found | A code comment says "Choices are not scored here" (:31-32) but no learner-facing sentence says predictions do not change the results | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:922-1180): an 8-row table (size in 50 and 100 billion years; the first four doublings; do the doublings settle; speeding up today; when it starts speeding up; expansion rate today and after 100 billion years; the value it settles toward); "A simple calculation" (three branches by share); "What the expansion rate means for a galaxy's speed"; "Why the expansion rate is what it is" with a floor table for 90%, best fit and 33%; "Does dark energy change?" (DESI 2025, 2026 mixed); two daily-life comparisons (taps, savings account), a ball-throwing comparison for 0%; "What this model can and cannot tell you"; "What this model simplifies".
- B1: Not met as a check-up. No measured value exists for the future; the real references are today's expansion rate (70, illustrative) and the 0.30 / 0.70 split (the page's own). The page already marks everything as "what the model gives, not a prediction" (:1141-1146); a check-up would only be a "for the record" row set (e.g. DESI 2025 hint vs constant) and must say "not settled".
- B2: Not met. No "What this table tells us" under the eight-row table; the paragraphs that follow carry what/means/why but are not tied to rows.
- B3: Partly met. The table follows the control; there is no published reference for the future, so the "Published value / How yours compares" columns are not warranted (optional per §14).
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module with tests; the 50-year estimate comparison and floor values are computed from module functions in the component).

## Rule C
- C1: Mostly met. Graph axes, "today" line, legend, white dot and pink dot labels; bar rows with a time scale and "(off the scale)"; strip with galaxy labels A, B, C, "our cluster" and a spacing line (:~540-770, text elements listed at :557-801 area, per the caption's items). Individual labels not all re-read; the strip's real-spacing line of text is named in the caption.
- C2: Met. The gold line, bars, pink dashed line and strip all follow the share; the blue dashed line is the 0% reference.
- C3: Met in form. "How to read this diagram" (:774) beneath the three pictures (not checked whether it is hidden before predictions are locked).
- C4: Mostly met. Per-picture sections, axes and log ticks explained, every colour, dot and line, "off the scale" markers, the line of numbers above, short bullets. Units "x", "billions of years" and "kilometers per second per megaparsec" are explained.
- C5: Partly met. Worked numbers inside the caption are only generic ("if the first bar is 10 billion years long ..."); the fully worked numbers are in Results ("A simple calculation").
- C6: Not met. Items are descriptive; no "Look at / What it means / Why it matters" structure.
- C7: Not met (partly). The caption states how to read a straight / flattening / upward-bending line (:~800-805), says the pink dot is "the moment the expansion changes from slowing down to speeding up" and "with no dark energy it never appears" (:~813-817), that "the pink dashed line marks the value the doubling time settles toward" (:~843-846), and asks "Are they getting longer, staying about the same, or getting shorter?" (:~838-840), which restates Prediction 2's options. Together they point toward both answers (speeding up forever; the doubling time settling).
- C8: Mostly met. size, doubling time, expansion rate, megaparsec, contribution and "flat" are defined before use (:274-320); "Big Crunch" and "Big Rip" appear in a Results box without definitions beyond a bracket description.

## Other findings
- O1: The Cosmology closing synthesis (`closing-synthesis.md`; CosmologySynthesis.tsx, shown after the explanation, :1196) imports figures from the earlier experiments' physics modules (hubblesLawExperiment, bigBangExperiment, darkMatterExperiment, darkEnergyExperiment, universeAgeExperiment and others, CosmologySynthesis.tsx:5-27). Any update that renames or moves a module function would have to keep the synthesis in step. It has no prediction of its own. Not otherwise audited.
- O2: Date-bound claim in Results: "in 2025, results from the DESI survey ... hinted that dark energy may be weakening ... Newer results in 2026 have been mixed, and one of them moved back toward a constant dark energy. At the time of writing (October 2026), the question is still open" (:~1056-1062); no source is cited on this page (the specification may record one; not checked). The two predictions are about the real best-fit universe but the picture the learner sees follows the chosen share, so a learner on a different share sees a gold line that does not match the real-universe answer (the Results box does give the real universe's numbers). The Prediction 2 answer labels carry numbers (5, 11, 30 billion years) that the Results confirm; the first (11 billion years) presupposes the learner knows the real value. The 0.30/0.70 split and the "2 x sqrt 2 = 2.83" ratio are stated without a source in the text. The ball-throwing escape-speed comparison is labelled an analogy. No links list.

## What an update would touch, and its size
FateOfTheUniverseExperiment.tsx, FateOfTheUniverseTutor.tsx, src/physics/fateOfTheUniverseExperiment.ts and test, specification 10-fate-of-the-universe.md, and a consistency check of CosmologySynthesis.tsx and closing-synthesis.md. Size **L**: guess marks on two pictures, verdicts moved into the module, a reading guide for an eight-row table, a caption rewrite of the longest caption in the group (three reveals to remove).

## Not checked
Browser rendering; whether the pictures and caption are hidden until predictions are locked; the tutor's explanation text; the line numbers marked "~" (read from a filtered view); the specification's decisions table and any source it records for the DESI statements; CosmologySynthesis.tsx beyond its imports.

---

# Re-read, 2026-11-16 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked with a scratch script that bundles the module (kept outside the repo) and are not yet in a test. The 2026-11-02 report above is kept as written; this section corrects and extends it.

## What the module returns (hand-checked; Hubble constant 70)
| Quantity | 0% | 10% | 30% | **70% (the real best fit)** | 90% |
|---|---|---|---|---|---|
| Age today in this comparison (billion years) | 9.31 | 9.64 | 10.46 | **13.47** | 17.85 |
| Size in 50 billion years (today = 1) | 3.44 | 5.00 | 8.94 | **21.26** | 30.37 |
| Size in 100 billion years | 5.2 | 15.7 | 63.5 | **424.8** | 906.3 |
| The first four doublings (billion years) | 17.03, 48.16, 136.21, 385.27 | 15.10, 25.53, 29.76, 30.51 | 12.92, 16.71, 17.54, 17.66 | **10.68, 11.44, 11.56, 11.57** | 9.98, 10.18, 10.20, 10.21 |
| Settles to (billion years) | never | 30.62 | 17.68 | **11.57** | 10.21 |
| Speeding up today? | no | no | no | **yes** | yes |
| The speed-up starts at size / years from now | never | 1.651 / +9.75 | 1.053 / +0.74 | **0.598 / 6.14 billion years ago** | 0.382 / 11.39 billion years ago |
| Expansion rate today, at 100 billion years, settled (km/s per Mpc) | 70, 6.0, 0 | 70, 22.2, 22.1 | 70, 38.3, 38.3 | **70, 58.6, 58.6** | 70, 66.4, 66.4 |

These agree with the specification's tables (the spec's 17.0 / 48.2 / 136.2; 10.7 / 11.4 / 11.6; 0.598; 58.6) and with the page's own examples.

Other values the page and tutor print, all computed by the module or by code in the component:
- **Prediction 2's answer.** The real second doubling takes **11.44** billion years. On a log scale it is 0.017 of a decade from "about 11" (the middle choice), 0.360 from "about 5" and 0.419 from "about 30". The question's own wording ("Suppose the universe takes about 11 billion years to double ... how long will the *next* doubling take?") already puts "about 11" in the learner's head, and the middle choice repeats that number (see O2).
- **Prediction 1's answer.** For the real universe the size is 21.3 in 50 billion years and 424.8 in 100 billion years, and the expansion keeps speeding up (a galaxy 100 megaparsecs away moves at 7,000 km/s today and at about 124,524 km/s after 50 billion years). The gold line on a log axis is nearly straight after about 30 billion years (the doublings are all 11.4 to 11.6).
- **The graph's past.** The axis runs from 10 billion years ago. With no dark energy the universe is only 9.31 billion years old today in this comparison, so that curve starts a little to the right of the left edge (points below 0.1× are skipped, `Experiment.tsx:213-216`); the caption says "back to 10 billion years ago" for every share.

## Corrections to the 2026-11-02 report
- **C3, "hidden before predictions".** The three pictures, the readout and the caption sit inside `hasSubmittedPrediction` (`:529`), which is set by the first Run, so nothing is drawn before the learner has guessed and run. That item is met.
- **C7 is smaller than the old report says.** The caption does say "with no dark energy [the pink dot] never appears" and describes straight, flattening and upward lines, but it is shown only after the guesses are locked. What does hand answers over before the guess: (a) **the question itself**, "Experiments 5 and 6 showed that dark energy has been speeding that expansion up. So what happens next?" (`:264-266`), which points at the third choice of prediction 1 ("keeps speeding up"); (b) **the choice labels of prediction 2** carry the numbers 5, 11 and 30 billion years, and the question's stem says "about 11 billion years" for the first doubling (`:398-401`); (c) the controls are drawn but disabled before the guesses, and one is labelled "The best fit to observations (about 70%)" (in the controls), which only names the real share and gives nothing away.
- **The two questions are about the real universe, but the pictures follow the slider.** Both predictions are marked "against the real 70% case" (spec), yet the three pictures and the table show the learner's chosen share (the default, 70%, matches). A learner who first picks 0% sees a gold line that does not answer prediction 1 for the real universe. Under the new rules Part 1 is fixed on the real universe.
- **Results gives verdicts and the tutor's answers first.** "So your prediction was right / off this time" for both predictions (`:1094-1112`); for 0% the escape-speed ball comparison ("a flat universe with only matter is exactly that borderline case: gravity slows the expansion forever, but never quite stops it", `:1121-1129`) is the answer to the tutor's conceptual question ("why does the universe not simply fall back together?", `Tutor.tsx:100`); the savings-account comparison (`:1116-1120`) is the tutor's point 3.
- **Results and the tutor vanish and reset when the share changes.** `handleModeChange` and the slider call `setStatus('idle')` when a run is complete (`:150`, `:494`), which removes Results and unmounts the tutor (both are inside `status === 'complete'`, `:914`, `:1184`); every Run remounts the tutor (`key={runCount}`, `:1186`) and clears `explanationReached`. This is the same defect as Cosmology 1 to 9.
- **"Change predictions"** (`:432-452`) appears only after the first Run and reopens both questions while keeping the chosen share and the earlier choices. The standing rule replaces it with an always-visible "Start over".
- **Verdict logic and examples are in the components.** `submittedFarFuturePrediction === 'faster'` (`:1094`) and `=== 'same'` (`:1108`); `hasSettled` (5 percent, `:235`), `ruleApplies` (70 percent, `:240`), `settledEstimate` and the percentage gap (`:242-244`), the 100-megaparsec galaxy speeds (`:245-247`) and the matter contribution after 50 billion years are all computed in the component; the tutor computes `settledGrowthPercentPerBillion`, `ruleOf70Years` and `matterPartLater` (`Tutor.tsx:73-77`). The labels "about 5 / 11 / 30 billion years" are typed text (`:41-45`, `Tutor.tsx:34-38`).
- **No render test exists** for this experiment (`src/components` has the component and tutor, no `.test.tsx`).
- **Heading** "Experiment 10 — The Fate of the Universe ..." (`:259`) has no group name; it would read **Cosmology 10: ...**. Cross-references say "Experiments 1 and 2", "Experiments 5 and 6", "Experiment 3", "Experiment 8", "Experiment 4" (in the Gravity chapter: the curved-space picture, now "Curved Spacetime") and "the Orbits experiment in the Gravity chapter" (the sidebar calls it "Why Do Planets Orbit Instead of Falling In?"); they would use the sidebar's names.
- **Date.** "At the time of writing (October 2026)" (`:1075`) is the only date; there is no "as of November 2026" and no source for any DESI statement on the page (see "Sources").
- **`onComplete` fires on every Run;** not harmful.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both predictions, the share control, Run, the readout, three pictures, the caption and Results (`:262-1181`); the tutor is a second card, and the closing synthesis a third | Part 1 (predictions, Run, the graph and bars of the real universe), Part 2 (the share control and the pictures that follow it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no "Words and formulas" box | See "Links and Words" |
| E5 | n/a | | The "Putting It All Together" synthesis stays below Part 4, after the tutor's explanation, as now |

## Parts 2 to 4 appear after the first Run; Start over
**Partly met**, the same defect as Cosmology 1 to 9 (see the corrections above). Suggested fix: after the first Run, Parts 2 to 4 stay; changing the share changes only Part 2's drawings until its own Run; the tutor is not remounted; "Start over" replaces "Change predictions" (always visible, greyed out until a guess or a run exists and while a run plays; it clears everything, including the synthesis).

## Predictions and where their answers live (A5, sharpened)
Both answers live on the **real 70% universe**, so **Part 1 can be fixed on it**, with no control. The share control, the learner's own gold-or-pink graph, bars and the galaxy strip belong to Part 2.
- **Guess 1 (slows and stops / keeps going but ever more slowly / keeps speeding up):** the real answer is the shape of the gold 70% line on the graph (21.3× in 50 billion years, 424.8× in 100), set against the blue dashed 0% line (3.4×, 5.2×). All three choices are shapes, not sizes, so the mark is a white **sketch**, "shape only, not to scale": from "today" a line that goes flat (stops), a line that bends toward flat (slower), or a line that bends upward (faster), each in a YOUR GUESS box, and the caption says it is only a sketch. Drawn when the run ends.
- **Guess 2 (about 5 / about 11 / about 30 billion years):** these *do* have lengths, so a white bar of 5, 11 or 30 billion years is drawn beside the real second bar (11.44) on the bars picture (its scale is 0 to 80), in a YOUR GUESS box. The real counterpart sits in the same picture, so no new panel is needed. Drawn after the second bar.
- **Where the real picture comes from.** *Calculated here:* every line, bar and number, from the model of Cosmology 5, 6 and 8 run forward (flat, matter plus a constant dark energy, H0 70, no radiation); today's 0.30 / 0.70 split is the page's best-fit value (Planck 2018 gives a figure to be read, see "Sources"). *Assumed, not known:* that dark energy never changes. *Illustration:* the galaxy strip (not to scale) and the axis out to 100 billion years (an axis choice, not an event). *Your guess:* the white marks only. Nothing here is imagined.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: size (of the universe), doubling time, expansion rate, Hubble constant and Hubble tension, megaparsec, contribution (matter's, dark energy's), flat, dark energy, constant dark energy, matter, radiation (left out), speeding up (and why it is not the same as the rate rising), settle, "Big Crunch" and "Big Rip" (both named in the Results box without a definition beyond a bracket), escape speed, DESI. Formulas with worked examples from the page's own numbers: size doubles every T years → size after t = 2^(t ÷ T) (2^(50 ÷ 11.6) ≈ 20, against the model's 21.3); the settled doubling time = ln 2 ÷ (H0 × √(dark energy share)) in time units; the expansion rate = today's rate × √(matter's contribution + dark energy's contribution); a galaxy's speed = the expansion rate × its distance (70 × 100 = 7,000 km/s). **Held back until after the run (§12):** the settled doubling time and the 50-billion-year estimate (they give prediction 2 away), the speed-up facts, and the ball and savings-account comparisons.
- **"Want to know more?" links (new).** None exists. Nothing is linked until the owner approves. Candidates are listed under "Sources".

## Wording and claims to check (new and restated)
- **The DESI claims** (`:1068-1075`; "some recent results hint that dark energy may be weakening", `:348` and `:1144`; the tutor's point 6) are date-bound and unsourced on the page.
- **"flat to within less than half a percent"** (`:311-313`): unsourced on the page.
- **0.30 and 0.70** as "the real universe's" shares (`:289`, `:314`): the page's own best-fit values; the specification does not name a source for them (Planck 2018 gives a different second decimal, see "Sources").
- **"2 × the square root of 2 = 2.83"** (the 0% ratio): exact (2^(3/2)), a result of the model.
- **"That speed-up is what the supernovae in Experiment 5 revealed"** (`Tutor.tsx:190`): belongs to Cosmology 5.
- **The savings-account and bath-taps comparisons** are Claude's own pictures with no source, flagged inexact by the page.
- **"the model gives a switch about 6 billion years ago"** (`Tutor.tsx:188`): the module gives 6.14 billion years ago (7.3 billion years after the Big Bang, against 13.47 today); a real published figure is to be read.

## Suggested check-up table (B1 to B3, recommendation)
Rows that do not depend on the learner's share (the real 70% case), each only where a source is read:
- (a) **The dark energy share used:** 0.70 against Planck 2018's Ω_Λ [to be read].
- (b) **When the expansion began to speed up:** the model's 6.14 billion years ago against a published figure [to be read].
- (c) **Today's expansion rate:** 70 against the published range 67 to 73 ("within the range", the Hubble tension).
- (d) **The settled doubling time, exact against the "rule of 70" approximation:** 11.57 against 70 ÷ 6.0 ≈ 11.6: "the same", a check inside the page's own arithmetic.
- (e) **The future sizes and doublings:** 21.3× in 50 billion years, 424.8× in 100, doublings 10.7, 11.4, 11.6, 11.6: "none: calculated here only", and "not settled" for whether dark energy is constant.
"What this table tells us" under each table. The existing eight-row table follows the learner's share; **a "Published value" column is not warranted** (no published future exists, and the page says so) and a short "What your numbers show" note in trial values is enough. **The learner's guesses** shown beside the results with a tag on the row, never "right" (guess 1 at the "size in 50 and 100 billion years" row of the fixed table, guess 2 at the "the first four doublings" row).

## Updated size
**Large** (unchanged). Part 1 rebuilt on the real universe with two sets of white marks; the page in four Parts with Part 2 holding the control and three pictures with their own captions; a long introduction with a "words" box and links; a check-up; the verdict logic and the example arithmetic moved into the module with tests; a tutor that marks both guesses; a new render test file. **No change to approved physics.**

## Questions for the owner, each with a suggested default
1. **Part 1 fixed on the real 70% universe** (graph of the gold 70% line with the blue dashed 0% line, and the doubling bars); the share control, the learner's own graph and bars and the galaxy strip move to Part 2. *Default: yes.*
2. **Guess 1 mark:** a white sketch from "today" (a line that goes flat, bends toward flat, or bends upward), "shape only, not to scale", in a YOUR GUESS box. *Default: yes.*
3. **Guess 2 mark:** a white bar of 5, 11 or 30 billion years beside the real second bar (11.44) on the bars picture. *Default: yes.*
4. **Marking the guesses (tutor only):** guess 1 "keeps speeding up" is the model's answer; guess 2 "about the same, about 11 billion years" is the model's answer (11.44). *Default: keep.*
5. **Colours:** white for the guess; gold stays the real universe in Part 1; **pink for "your universe" in Part 2** (the learner's own setting), so the existing pink "speed-up" dot and "settles to" line change to another colour (for example green); blue dashed stays the 0% reference. *Default: yes.*
6. **Hold back until after the run (§12):** the intro's "Experiments 5 and 6 showed that dark energy has been speeding that expansion up" (it points at one choice of guess 1), the savings-account and ball comparisons, the "settles to" values and the Results verdicts. *Default: yes; the intro sentence reworded so it does not say the expansion is speeding up.* Note that prediction 2's own stem ("about 11 billion years") and choice labels (5, 11, 30) are part of the approved question; reword or keep? *Default: keep the approved question.*
7. **Results:** verdicts and the "simple calculation" moved to the tutor; the tables and numbers kept; both guesses shown with tags. *Default: yes.*
8. **Check-up rows (a) to (e)** as above, each only where its source is read. *Default: yes.*
9. **No setting-following comparison columns;** a "What your numbers show" note instead. *Default: yes.*
10. **DESI wording:** keep the sentence but give it a date ("as of November 2026") and a source once read; if no official page confirms a 2026 result, say only what 2025 said. *Default: yes.*
11. **Links and words** as above; link only what is read; record the gaps. *Default: yes.*
12. **"Change predictions" replaced by "Start over", the heading changed to "Cosmology 10: ..." and the sidebar's names in cross-references.** *Default: yes.*
13. **Introduction:** longer, more detailed and up to date ("as of November 2026"), as you asked for Cosmology 7 to 9; the long "flat" explanation kept but shortened where it repeats Cosmology 5, 6 and 8. *Default: yes.*
14. **The closing synthesis** ("Putting It All Together") stays below Part 4, shown after the tutor's explanation, unchanged; its figures are checked against any module function this audit touches. *Default: yes.*

## Sources
Read on 2026-11-16 by a helper agent, whose fetch tool returns **model summaries**, not the raw pages: every quotation below must be spot-checked against the live page before the wording is approved. Nothing is linked until the owner approves it.
| Claim on the page | Page fetched (date on page) | Result | Note |
|---|---|---|---|
| DESI hint that dark energy may be evolving | DESI DR2 results paper, arXiv:2503.14738 (submitted 18 March 2025, v3 9 October 2025) | read | "preferred over ΛCDM at 3.1σ" for DESI BAO plus CMB; 2.8 to 4.2σ depending on the supernova sample. The abstract does not say "weakening"; it favours w0 > -1, wa < 0 |
| the same | DESI collaboration release, 19 March 2025 | read | "strengthen hints that dark energy is evolving"; no sigma and no "not a discovery" wording |
| the same | Berkeley Lab press release; NOIRLab release noirlab2512 | **not read** | Berkeley Lab returned 403; NOIRLab came back empty. Do not cite |
| "not strong enough to count as a discovery" | none | **no official page found** | Only the sigma values above (all below 5σ); secondary sources (EarthSky, Scientific American) seen only as search snippets |
| "errors in the supernova measurements could explain it" | none | **no official page found** | The DES-SN5YR reanalysis (arXiv:2503.06712) was seen only as a snippet ("only a weak preference"); not fetched |
| "Newer results in 2026 have been mixed, and one moved back toward a constant dark energy" | DESI collaboration, DR2 Lyman-alpha results (30 July 2026) | read | Lyman-alpha data "agree with the standard model, which could indicate that the current hints of evolving dark energy may fade away"; it also allows "a more complex model may be needed". The newest official page found; the question is still open |
| the same | Dark Energy Survey final supernova and BAO release, via IFAE (22 January 2026) | read | "fit the evolving dark energy model, but no better than they fit the standard model" |
| When the expansion began to speed up (the page: about 6 billion years ago) | NASA Hubble (16 November 2006) | read | "began speeding up about five to six billion years ago" |
| the same | NASA Hubble, "Dark energy changes the universe" (updated 17 April 2023) | read | "about 7.5 billion years ago" |
| the same | NASA, "Dark Energy" (updated 12 August 2026) | read | "Nine billion years after the universe began, its expansion started to speed up", about 4.8 billion years ago with an age of 13.8 |
| Fate: the expansion goes on forever | NASA, "Cosmic History" (updated 12 August 2026) | read | "it's likely the universe will continue to expand forever"; it does not say "speeds up forever" or name alternatives |
| Big Crunch, Big Rip | NASA Hubble, "Dark energy changes the universe" (2023) | read | names both, for dark energy that is not constant |
| Flat to within less than half a percent; matter share | Planck 2018 results VI, arXiv:1807.06209, v1 text (HTML copy) | read | curvature Ω_K = 0.001 ± 0.002 (with BAO); Ω_m = 0.315 ± 0.007; H0 = 67.4 ± 0.5. **Ω_Λ is not stated in the abstract:** 0.685 would be 1 - Ω_m for a flat universe |
| Flatness in plain words | ESA Planck pages | **no plain official page found** | ESA's Planck highlights page (2013) gives dark energy 68.3 percent, nothing on flatness |
| Bound systems (galaxies, the Solar System) do not expand | NASA "Ask an Astrophysicist" (19 June 2002) | read, weak | does not plainly say it; **no plain official page found** |
| Hubble constant range | NASA, "The Hubble constant and the tension" (updated 4 August 2025) | read | about 70 to 76 from space telescopes and about 67 to 68 from the oldest light; the page's "67 to 73" is a combination, not NASA's wording |

**Three things the sources change in the page or the report.**
1. **The model's "about 6 billion years ago" sits among inconsistent official figures** (5 to 6 in 2006, 7.5 in 2023, about 4.8 from 2026). The page should say the model's figure is its own (6.14), and that published estimates differ; a check-up row (b) cannot say "the same" or "close".
2. **The page's 0.30 and 0.70 are rounded** against Planck 2018 (Ω_m 0.315 ± 0.007, so about 0.685 for dark energy if the universe is flat). Row (a) reads "within about 2 standard errors" only if the owner accepts that wording; the page's own figures stay as illustrative.
3. **The DESI sentence can be dated and sourced for what it says** ("hinted", 3.1σ, below 5σ; 2026 results mixed; still open), but "not strong enough to count as a discovery" and "errors in the supernova measurements" have no fetched official page and should be reworded to what the sources say, or marked as a gap under §29 rule 3(c).

**Gaps to record under "Open"** (no plain official page found): a discovery threshold for the DESI hint; supernova errors as an explanation; flatness in plain words; bound systems not expanding; the CMB page on flatness. Three pages could not be read (Berkeley Lab, NOIRLab, the Planck PDF); several guessed URLs returned 404.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; the tutor's wording was read in the file, not viewed; `CosmologySynthesis.tsx` and `closing-synthesis.md` were not re-read beyond what the older report says; the specification's Decisions table was not compared line by line with the page; line numbers are from the files as read today; the module's 23 tests were counted and not re-run; sources are model summaries (see "Sources") and are to be spot-checked against the live pages.
