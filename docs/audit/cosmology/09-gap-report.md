# Gap report: Cosmology Experiment 9 (How did galaxies form? Structure formation)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/09-structure-formation.md | Components: src/components/StructureFormationExperiment.tsx (1,160 lines), StructureFormationTutor.tsx | Physics module: src/physics/structureFormationExperiment.ts (+ .test.ts, 17 tests) | Status: read-only, nothing changed

## Summary
Four pictures (a strip of dots, a growth-against-time graph, a density-excess graph for the chosen ripple, a "how big must a ripple start" scale), two controls (kind of matter, starting size), two predictions, Results with a six-row table, a worked calculation, a daily-life comparison and a "what this model can and cannot tell you" box, a 3-prompt tutor. Biggest gaps: no guess marks (and Prediction 1's answer, a growth factor, has a clear home on Picture 2), no "Where the real picture comes from", no check-up with a reference, no "What this table tells us", and the caption prints the real growth numbers and the head-start factor before the run, which answers both predictions. The right/wrong logic is hard-coded in the component. Size: **M** to **L** (four pictures, but only one or two need marks).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | From the oldest light's release to today, about how many times denser than average will a slightly denser region become (relative to its start)? (StructureFormationExperiment.tsx:369-372; choices :34-38) | About 10 times / About 1,000 times / About a million times | Picture 2's amber line at "today" (growth graph, :643-735); the same value is in Results (:1066-1072) |
| 2 | If the region could start gathering matter earlier, would that change the answer? (:389-391; choices :41-45) | No difference / A small difference / It would decide the outcome | Picture 2's violet line against the amber line (the head start, :713-716); Picture 4's two dots (:817-855) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result`, `ordinaryResult`, `darkResult` come from `runStructureFormationExperiment` with kind and start size only (module :146); the predictions feed text only (:1066-1095) and tutor props (:1151-1156) | none |
| A2 | Not met | No guess element in the four SVGs (:544-855) | Prediction 1: a white "YOUR GUESS" mark on Picture 2's growth axis at 10 / 1,000 / 1,000,000 with a line to the "today" end; Prediction 2: a marker between the two lines at today |
| A3 | Partly | Prediction 1 has a size (10, 1,000, 1,000,000 are positions on the log axis, a mark can follow the guess); Prediction 2 is a three-way choice (marker, caption must say marker only) | |
| A4 | Not met | Lines draw during the 9-second Run (caption :~1000) | Draw marks when the lines reach "today" |
| A5 | Met (picture exists) | Picture 2 carries both | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: growth factors calculated here from the simplified model (flat, 70% dark energy, H0 70, no radiation); the dark matter start at redshift about 3,400 is "a given real value" (Results :1128-1131); the recombination redshift 1089.8 is measured by others; the strip's glow is an illustration; the learner's starting size is "your own illustrative choice" |
| A7 | Not met | Intro (:291-336) and the controls (:~440-524) say nothing about guesses never changing the pictures or tables | Add sentences; note by the controls |
| A8 | Partly met | Growth, excess and required start values come from the module; the correctness tests are hard-coded in the component: `submittedGrowthPrediction === 'thousand'` (:~1073) and `=== 'none'` (:~1090); `HEAD_START_EXAMPLE_DELTA = 1e-3` is a component constant (:48); the example runs and the ratio dark/ordinary are computed in the component | Module functions for the guess marks and the verdicts' inputs, with tests |
| A9 | Not met | Tutor compare prompt (StructureFormationTutor.tsx:88-89) restates the guesses and names no mark; verdicts in Results (Experiment.tsx:1074-1095) | Prompts to name marks; verdict placement is the owner's decision |
| A10 | Not found | no "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:1020-1145): a table of up to six rows (start redshift; growth by today; density excess today; redshift of clump if any; starting size needed, this kind; starting size needed, the other kind); "A simple calculation"; two "Checking your ... prediction" paragraphs with right/off (and "partly right"); "A comparison from daily life" (savings account); a box "What this model can and cannot tell you"; "What this model simplifies".
- B1: Not met as a check-up. A real reference exists only partially: the oldest light's 1 part in 100,000 is a temperature ripple (the page itself says it is not the same as a density excess), and the recombination redshift 1089.8; no accepted value for the growth factor or the needed starting size exists in the page, so a check-up must not invent one.
- B2: Not met. No "What this table tells us"; the "simple calculation" and "can and cannot tell" box carry meaning in prose.
- B3: N/A / optional. The table follows the controls, but no real reference exists for the learner's own starting size; the page already says so.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module with tests; the dark/ordinary ratio in the text is computed in the component).

## Rule C
- C1: Mostly met. Titles and axis labels on all four pictures (:557, :608-637, :656-720, :749-801, :830-851); line labels "ordinary", "dark" and "no dark energy" at the right edge (:713-719); the clump threshold labelled (:792). Not confirmed: the moving dot (explained only in the caption) and the strip's "stretched N times" label is present (:626-637).
- C2: Met. Chosen kind and start size change the strip, lines, Picture 3 and Picture 4's green dot.
- C3: Met in form. "How to read these diagrams" (:859) beneath all four, appearing only once predictions are submitted (the pictures are inside the `hasSubmittedPrediction` block, not re-checked at line level).
- C4: Mostly met. Per-picture sections with "What is drawn / What it shows" items, axes and log ticks explained, colours, the "Running it" paragraph. Defines density excess and growth with a numeric example (:866-872). Terms "redshift" and "recombination" are used by reference to earlier experiments.
- C5: Met. A worked example appears in the caption (1 part in 1,000 times 100 gives 1 part in 10, :869-872) and Picture 4 (1 ÷ growth, :~976-983).
- C6: Partly met. Two items are headed "What to look for" (:926, :963) with a Look-at-and-meaning flavour but no explicit "Look at / What it means / Why it matters" parts; other pictures have none.
- C7: Not met. The Picture 2 "What to look for" item prints the real growth numbers "By today, the amber line has grown about N times and the violet line about M times, so the head start is worth a factor of about X" (:926-931), the dashed line item prints the no-dark-energy comparison (:~935-940), and Picture 4 gives the required starting sizes (:~976-983). These give Prediction 1's value and Prediction 2's outcome before the run (the caption is shown after predictions are locked but numbers are live even before Run).
- C8: Mostly met. Density excess, growth, clump and redshift are defined before use (:304-312); "megaparsec" and "flat" are glossed in the assumptions (:~336-340).

## Other findings
- O1: None found against the specification in what was read.
- O2: Prediction 2's verdict says "partly right" for both 'small' and 'decides' (:~1090-1093), so the two non-"No difference" answers are not told apart; Prediction 1 is checked with the ordinary matter growth at about 1,000 times "for any starting size" but the table above shows the learner's chosen kind (which may be dark matter, about a different growth). The page says the dark matter start (redshift about 3,400) is a "given real value" with no source cited in the text. The savings-account comparison is flagged as inexact. Strip dots are drawn "at the model's true density excess" so a tiny ripple looks smooth: stated in the caption. No links list.

## What an update would touch, and its size
StructureFormationExperiment.tsx, StructureFormationTutor.tsx, src/physics/structureFormationExperiment.ts and test, specification 09-structure-formation.md. Size **M** to **L**: marks on Picture 2 (and optionally Picture 4), the verdict logic moved into the module, caption rewrite on a four-picture caption (remove the live numbers that reveal both answers), "What this table tells us" for a six-row table, tags on rows.

## Not checked
Browser rendering; whether the caption is hidden before predictions (read from the structure, not run); the tutor's explanation text; control block line numbers (approximate); the specification's decisions table.

---

# Re-read, 2026-11-15 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked with a scratch script that imports the module (kept outside the repo) and are not yet in a test.

## What the module returns (hand-checked; Hubble constant 70, dark energy 70%, no radiation)
| Quantity | Value |
|---|---|
| Growth from the oldest light (z 1089.8) to today | **849.7** times (ordinary matter) |
| Growth from z 3400 to today (the dark matter head start) | **2,649.3** times |
| Head-start factor | **3.12** (0.49 of a decade on the log axis) |
| Growth with no dark energy | exactly 1 + z: 1,090.8 and 3,401.0 |
| Growth lost to dark energy | 22.1 percent, for both starts |
| Starting size needed for a clump by today | 1 part in 849.7 (ordinary), 1 part in 2,649.3 (with dark matter) |
| Start times in this model | ordinary matter 471,931 years; dark matter **85,721 years** after the Big Bang |
| Presets today (ordinary, then with dark matter) | 1 in 100,000: 0.0085, 0.0265 (no clump); 1 in 10,000: 0.085, 0.265 (no clump); 1 in 1,000: 0.850 (no clump), 2.649 (a clump at z 2.36); 1 in 500: 1.699 (a clump at z 1.09), 5.299 (a clump at z 5.79) |
| 1 part in 100,000 × the growth | 1 part in 118 (ordinary), 1 part in 38 (with dark matter) |
| The model's growth factor against D(a) = a | 1.0000 at z 1000, 100 and 10; 0.953 at z 1; 0.779 at z 0 |
| Carroll, Press and Turner (1992) approximation, for 0.3 and 0.7 | g = 0.7779, so 0.7779 × 1,090.8 = **848.6** (0.13 percent below the module's 849.7) |
| Growth from the baryon drag redshift 1060 instead of 1089.8 | 826.5 (2.7 percent less) |

1. **The old caption says dark matter starts "at about 50 thousand years in this model" (`StructureFormationExperiment.tsx:917`). The module puts it at 85,721 years.** The 50 thousand is the real figure (radiation included); the model leaves radiation out. The page therefore prints a number the module does not give. The default words it from the module ("about 86 thousand years in this model") and says the real time is shorter if a source is read.
2. **The module's growth agrees with an independent published approximation to 0.13 percent** (849.7 against 848.6). That makes a real check-up row, once a page that prints the formula has been read.
3. **The module's clump line at 1 is a round number.** Standard textbook linear theory collapses a spherical region at a linear density excess of about 1.686. The page says 1 ("twice the average"). A constant change is a physics decision, so it is reported, not changed.
4. **Ordinary matter is released from the light at the baryon drag epoch, redshift about 1060 (Planck 2018, read by the helper in Cosmology 8), not at last scattering, 1089.8.** Starting from 1060 gives 826.5, 2.7 percent less. The page says ordinary matter starts "at the oldest light's release".

## Corrections to the 2026-11-02 report
- **C7.** The old report counts the caption's live growth numbers as a reveal. Nothing is drawn before Run (the pictures sit inside `hasSubmittedPrediction`, set by the first Run), so the caption's numbers come after the learner has guessed and run. **What does hand answers over early:** the control buttons, visible and greyed out before the guesses, read "Ordinary plus dark matter (starts at redshift 3,400)" and "Ordinary matter only (starts at redshift 1089.8)" (`:454-456`), which tell the learner that dark matter starts earlier, the premise of guess 2; and the introduction's assumptions say "Dark matter is assumed to be able to start gathering at a given earlier time ... (about 3,400)" (`:339-340`, `:357-359`).
- **The live readout under Run** (`:528-538`) prints the growth ("The ripple has grown N times") during the run, which is guess 1's answer, but it is after the guess.
- **Results gives verdicts** ("so your prediction was right / off this time" and "partly right", `:1073-1092`) and answers the tutor's conceptual question first: "A comparison from daily life" (the savings account: "it does not suddenly explode, it grows steadily", `:1094-1100`) is the answer to "why does the ripple not grow explosively?" (`StructureFormationTutor.tsx:90-91`), and "While matter dominates, a ripple grows in step with the size of the universe" is in the Results text (`:1069-1072`) and the caption (`:930-932`) before the tutor asks.
- **Parts 2 to 4 vanish when the kind of matter or the starting size changes.** `handleKindChange`, `handlePresetChange`, `handleCustom` and the slider call `setStatus('idle')` (`:190`, `:195`, `:199`, `:501`), which hides Results and unmounts the tutor, and each Run remounts the tutor (`key={runCount}`, `:1152`).
- **"Change predictions" appears only after the guesses are locked** (`:420-440`) and reopens both questions without clearing the choices or the results. The standing rule replaces it with an always-visible "Start over".
- **No render test exists** for this experiment (`src/components` has `StructureFormationExperiment.tsx` and `StructureFormationTutor.tsx`, no `.test.tsx`).
- **Heading** "Experiment 9 — How Did Galaxies Form? ..." (`:286`) has no group name; it would read **Cosmology 9: ...**. Cross-references say "Experiment 3", "Experiment 4", "Experiments 5, 6 and 8", etc.: to be checked against the sidebar's names.
- **Date.** Nothing says "as of" any date.
- **Verdict logic and example numbers are in the component:** `submittedGrowthPrediction === 'thousand'` (`:1073`), `=== 'none'` (`:1090`), `HEAD_START_EXAMPLE_DELTA = 1e-3` (`:48`), the head-start ratio and "1 part in 118" (`:1063`) all computed in the interface.
- **"About 1,000 times" is the only answer marked right**, against 849.7; it is the nearest on a log scale (0.07 of a decade away, against 1.93 for "10 times" and 3.07 for "a million").

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the controls, Run, the readout, all four pictures, the caption and Results (`:288-1148`); the tutor is a second card | Part 1 (guesses, Run, the growth graph), Part 2 (the two controls and the pictures that follow them), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run; Start over
**Partly met**, the same defect as Cosmology 1 to 8. Suggested fix as before: after the first Run, Parts 2 to 4 stay; a changed kind of matter or starting size changes only Part 2's drawings until its own Run; the tutor is not remounted. **"Start over" replaces "Change predictions"** (always visible, greyed out until a guess or a run exists and while a run plays; it clears everything).

## Predictions and where their answers live (A5, sharpened)
Both answers live on the **growth graph** (old Picture 2), which needs no starting size and no choice of matter, so **Part 1 can be fixed on it**. The strip, the learner's ripple graph and the needed-size panel depend on the learner's two controls, so they belong to Part 2.
- **Guess 1 (about 10, 1,000 or a million times):** the real answer is the amber line's end at "today" (849.7). 10 and 1,000 have positions on the growth axis (1 to 5,000), so a white tick at that height at the "today" end; **a million is off the axis** (5,000 is the top), so an edge arrow pointing up labelled "off this scale". Stretching the axis to a million would squash the real curves into the bottom third. Drawn when the run ends.
- **Guess 2 (no difference, a small difference, it would decide the outcome):** three answers carry no size, so a white **marker**: a ring on the amber line's end ("no difference"), a short white up-arrow from it ("a small difference") or a longer one ("it would decide"), pointing toward the violet line's end, in a YOUR GUESS box; **marker only**, the caption says so. The real counterpart is the gap between the two lines at "today" (849.7 and 2,649.3, a factor of 3.12). "Decides the outcome" is really about whether a clump forms, which lives on the needed-size panel in Part 2 (1 part in 849.7 and 1 part in 2,649.3, with 1 part in 1,000 between them); the tutor explains that there.
- **Where the real picture comes from.** *Calculated here:* every curve and number (a flat universe, 70% dark energy, H0 70, no radiation; the growth formula in the module). *Given, measured by others:* the oldest light's redshift 1089.8 (Planck 2018) and the matter-radiation equality redshift about 3,400 (the module's constant; Planck 2018 gives a figure to be read). *Illustration:* the strip's dots and the green glow (Part 2). *Your guess:* the white marks only. No element in Part 1 is imagined.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: density excess, growth, clump, redshift, ripple, dark matter, ordinary matter, dark energy, flat universe, radiation (left out), Hubble tension, the cosmic microwave background, matter-radiation equality, baryon drag epoch (if used), linear growth, megaparsec, "part in 100,000", Hubble constant. Formulas with worked examples from the page's own numbers: density excess today = start × growth (1 part in 1,000 × 850 ≈ 0.85); the starting size needed = 1 ÷ growth (1 ÷ 850 = 1 part in 850); growth with no dark energy = 1 + z (1,090.8). **Held back until after the run (§12):** the growth number itself and the needed sizes (they give guess 1 away).
- **"Want to know more?" links (new).** None exists. Nothing is linked until the owner approves. Candidates, read on 2026-11-15 by a helper agent whose fetch tool returns model summaries (so each quotation must be checked against the live page): Planck 2018 (arXiv:1807.06209); the COBE page (NASA GSFC, "fluctuations ... only one part in 100,000"); ESA "Planck reveals an almost perfect Universe" (2013, "tiny temperature fluctuations that correspond to regions of slightly different densities ... the seeds of all future structure"); NASA/JPL "Planck Mission Explores the History of Our Universe" (2015); NASA/JPL "NASA Reveals New Details About Dark Matter's Influence on Universe" (26 January 2026, "Scientists think dark matter began to clump together first and that those dark matter clumps then pulled together regular matter"); NASA "Hubble maps the cosmic web of clumpy dark matter in 3-D" (2007, "normal matter ... collect within the densest concentrations of dark matter"); NASA "The Shape of the Universe" and the Hubble-constant page already read for Cosmology 6 and 8.

## Sources read for this experiment (helper agent, 2026-11-15; model summaries)
| Item | Result | Fetched live |
|---|---|---|
| Planck 2018 Table 2, z_eq | 3407 ± 31 (TT,TE,EE+lowE), 3402 ± 26 (+lensing), 3387 ± 21 (+lensing+BAO); the module's "about 3400" is within about 1 sigma of all three | yes (ar5iv HTML copy) |
| Planck 2018 Table 2, z_drag | 1059.93 ± 0.30, 1059.94 ± 0.30, 1060.01 ± 0.29 | yes |
| Planck 2018 Table 2, z_star | 1089.95 ± 0.27, 1089.92 ± 0.25, 1089.80 ± 0.21; the module's 1089.8 is the +BAO value only | yes |
| Carroll, Press and Turner (1992) growth formula g = 5 Ωm / 2 ÷ [Ωm^(4/7) − ΩΛ + (1 + Ωm/2)(1 + ΩΛ/70)] | printed in the paper arXiv:astro-ph/0006089 ("the approximate expression for the growth factor quoted by Carroll, Press and Turner (1992)"); the 1992 paper itself was not read (ADS returned HTTP 405); g = 0.7779 for 0.3 and 0.7 | yes (the quoting paper) |
| Spherical collapse threshold 1.686 | arXiv:1005.0233: "reaching the correct value for δ_c = 1.686 at the collapse scale factor" (for a universe with matter only); **no fetched page says that the linear model stops being valid as δ approaches 1** | yes |
| About 1 part in 100,000 | NASA GSFC, COBE "Science Results": "only one part in 100,000 compared to the 2.73 degree Kelvin average"; the same page calls them "density ripples"; not attributed to Planck on any page read | yes |
| Dark matter clumped first, ordinary matter followed | NASA/JPL, 26 January 2026 (the sentence quoted above) | yes |
| Ripples are the seeds of structure | ESA 2013 and NASA/JPL 2015 pages | yes |
| Temperature ripples are not the same as density ripples (the factor about 3) | **none**: the COBE page calls them density ripples without distinguishing them; the ESA page says the temperature fluctuations "correspond to regions of slightly different densities" | no official page found |
| Ordinary matter is held smooth by light until the universe becomes transparent | **no plain official page found**; only a Caltech/IPAC lecture (Lahav, 2004: "Before recombination, the baryons and photons are tightly coupled") | no plain official page found |


## Wording and claims to check (new and restated)
- **"About 50 thousand years in this model"** (caption `:917`): the module gives 85,721.
- **"3,400"** (module `MATTER_RADIATION_EQUALITY_REDSHIFT`, "not checked against a primary source" in the specification): Planck 2018 prints a value; to be read.
- **"1 part in 100,000"** for the oldest light (intro `:293`, `:349`): an official page is to be read.
- **"Ordinary matter was held smooth by light until the oldest light was released"** (spec, tutor point 4): an official page saying so is to be read.
- **The dark matter "head start" of about 3.1** is the model's, not a measured quantity; the page calls it "worked out in this simple model" (spec Decision 4 says the real head start is smaller because growth before equality is only logarithmic).
- **"About a fifth less"** (spec) and the tutor's "about 22% less": the module gives 22.1 percent.
- **The savings-account comparison** is Claude's own picture with no source, flagged inexact by the page.
- **`onComplete` fires on every Run;** not harmful.

## B1 to B3, recommendation
Suggested **check-up table** (rows that do not depend on the learner's two controls):
- (a) **Growth since the oldest light, exact integral against the Carroll, Press and Turner approximation:** 849.7 against 848.6 (0.13 percent apart). Reading: "the same, to within 0.2 percent". *Needs the page that prints the formula to be read.*
- (b) **Growth with dark energy against without:** 849.7 against 1,090.8 (exactly the universe's growth in size). Reading: "less, by 22 percent". A calculated comparison, no published value.
- (c) **The head start:** 2,649.3 against 849.7, a factor of 3.12. Reading: "calculated here only".
- (d) **The oldest light's redshift:** 1089.8 against Planck 2018's 1089.80 ± 0.21: "the same".
- (e) **When matter began to outweigh radiation:** the module's 3,400 against Planck 2018's published figure [to be read].
"What this table tells us" under each. **Setting-following table (item 3): not warranted** (no real reference exists for the learner's own starting size, which the page says is illustrative); keep a short "What your numbers show" note in trial values and a table of your kind of matter and starting size beside the two fixed starts. **The learner's guesses** shown beside the results with a tag on the row (guess 1 at the "grown by today" row of the fixed-starts table, guess 2 at the head-start row).

## Updated size
**Large** (was Medium to Large). Part 1 rebuilt on the growth graph with two sets of white marks and two dashed references; the page in four Parts with Part 2 holding the controls and three pictures (strip, ripple graph, needed sizes) with their own captions; a long introduction; a check-up; the verdict logic moved into the module with tests; a words box; links; a tutor that marks both guesses; a new render test file. **No change to approved physics.**

## Questions for the owner, each with a suggested default
1. **Part 1 fixed on the growth graph only** (both kinds of matter, no start size); the kind of matter, the starting size, the strip, the ripple graph and the needed-size panel move to Part 2. *Default: yes.*
2. **Guess 1 mark:** a white tick at 10 or 1,000 times on the growth axis at the "today" end, and for "about a million" an edge arrow labelled "off this scale" (the axis stops at 5,000). *Default: yes.*
3. **Guess 2 mark (marker only):** a ring, a short arrow or a longer arrow from the amber line's end toward the violet line's, fixed lengths that mean nothing as numbers. *Default: yes.*
4. **Marking guess 2:** keep the approved logic: "No difference" is not what the model gives; "A small difference" and "It would decide the outcome" are both "partly" (the head start is a factor of 3.1, and for some starting sizes it decides). *Default: keep.*
5. **Two dashed "without dark energy" lines** (one for each start) in Part 1's graph, not one for the chosen kind. *Default: yes.*
6. **Hold back until after the run (§12):** the control labels' "starts at redshift 3,400", the intro's dark matter head-start assumption, the live growth readout, the needed sizes, the savings-account comparison and "grows in step with the universe's size". *Default: yes.*
7. **Results:** verdicts and "A simple calculation" moved to the tutor; the tables and numbers kept; both guesses shown with tags. *Default: yes.*
8. **Check-up rows (a) to (e)** as above, each only where its source is read. *Default: yes.*
9. **No setting-following comparison columns;** a "What your numbers show" note instead. *Default: yes.*
10. **The clump line at 1 (the standard linear value is about 1.686):** keep the constant and say so in the notes, once the 1.686 is read. *Default: keep.*
11. **Baryon drag redshift 1060 against 1089.8:** keep 1089.8 and say the difference is about 3 percent (826 against 850), once 1060 is read. *Default: keep.*
12. **The "about 50 thousand years" in the caption** replaced by the module's "about 86 thousand years in this model". *Default: yes.*
13. **Links and words** as above; link only what is read; record the gaps. *Default: yes.*
14. **"Change predictions" replaced by "Start over", the heading changed to "Cosmology 9: ..." and the sidebar's names in cross-references.** *Default: yes.*
15. **Introduction:** longer, more detailed and up to date ("as of November 2026"), as you asked for Cosmology 7 and 8. *Default: yes.*

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; the helper's sources were read through model summaries and are to be spot-checked against the live pages (the 1992 Carroll, Press and Turner paper and the textbook value of 1.686 as a limit near 1 were not read); the specification was read in full but not compared line by line with the page; line numbers are from the files as read today; the module's 17 tests were counted from the report and not re-run; the strip's drawing code (`particleX`) was read, not checked by eye.
