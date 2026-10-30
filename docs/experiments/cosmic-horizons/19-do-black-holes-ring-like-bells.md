# Experiment 19 (Cosmic Horizons): Do Black Holes Ring Like Bells? (GW250114's Ringdown and the "No-Hair" Test)

**Status: Specification APPROVED by the owner on 2026-10-26 ("approved", read as all twelve decisions on their defaults). PROPOSED by Claude on 2026-10-26 per `CLAUDE.md` §23 Stages 1 to 3, as the nineteenth experiment of the group (`00-group-proposal.md`, Part D, entry 19). Nothing is implemented. On 2026-10-26 a further attempt to read the fit's coefficients at Berti, Cardoso and Will (2006) (ar5iv copy and PDF, through a summarising fetch) did not show the table; the paper says only that its fits are "accurate within a few percent"; open item (a) therefore still stands. Every number below comes from an abstract, a search summary or a partial fetch on 2026-10-26 (see "Sources read"); the two fit formulas were NOT read in the paper that gives them. Decisions for the owner are at the end; each has a default.**

**Corrections and checks against the group proposal.**

1. **"A remnant of about 63 solar masses and spin 0.7 rings at roughly 270 hertz" is right for the source frame, and the detected value is lower.** The published fit (Berti, Cardoso and Will; coefficients from a search summary, not read at the paper) gives **271 Hz** for 62.7 Suns at spin 0.68 in the black hole's own frame. The LIGO paper (arXiv:2509.08099, partial read of its HTML) reports **251.7 Hz** (90% range −5.0 to +5.1) for the (2,2,0) tone, as measured at the detectors, where the signal is stretched by the redshift (1 + z, z about 0.09, from Experiment 18): 271 ÷ 1.09 = **249 Hz**. The two agree. The page must say which frame each number is in, or the learner will think the physics disagrees by 8 percent.
2. **Damping time.** The same fit gives a decay time of **3.76 ms** in the source frame (4.10 ms as detected); the paper's value is **4.09 ms** (−0.38, +0.42). This also agrees.
3. **"Tones" and "overtone".** The paper's abstract says at least two quasi-normal modes are needed, and the second (a faster-fading overtone of the same tone) is statistically significant for about one cycle. A separate 2026 analysis (arXiv:2605.03576, read in a search summary only) puts the overtone's significance at 99.9 percent in one framework and 82.5 percent in an older one. **So the second tone is evidence, not certain.** The page must not say "two tones were heard" without that qualification. The proposal's "the second's mass and spin matched the first's" is the paper's "tens of percent" only; the 2026 sources also mention a (4,4) tone constrained to tens of percent.
4. **"To within tens of percent" versus "a few percent".** The abstract says the main tone's frequency matches Kerr "within a few percent" and the spectroscopic pattern (tone and overtone together) "to tens of percent". The page uses both, each for its own claim.

**Status label proposed for the learner (as of October 2026):** *Strong evidence* (from one very clear event, at a precision of a few percent for the main tone and tens of percent for the second tone) that the remnant of GW250114 rings as a black hole of its measured mass and spin should, as general relativity says. *Settled* is not used: one event, and the overtone is the weaker part. Not *Contested*: no source read disputes the result, though the overtone's significance depends on the analysis.

---

## Overview

Experiments 8 and 18 of Black Holes and of this group showed that a black hole is described by a mass and a spin, and that the merger GW250114 made one of 62.7 Suns with spin 0.68. This experiment asks what the new black hole does **right after the merger**: it is dented and shaken, like a struck bell, and it settles by giving off gravitational waves of a few definite pitches that fade away. General relativity says those pitches and fade times depend **only on the mass and spin**, nothing else ("a black hole has no hair"). So the signal is a test: measure the pitch and fade time, and see whether the mass and spin they imply match the mass and spin found a different way (from the inspiral before the merger).

The experiment asks three questions:

1. **What sets the pitch?** The learner chooses a mass and a spin and hears or sees the pitch and fade time change.
2. **How long does the ringing last?** About one cycle per fade: a black hole is a very "dull" bell.
3. **What was actually tested?** What was measured (a frequency and a fade time, with give-or-take), what was calculated (what Einstein's theory says for that mass and spin), and what "matches to a few percent" means.

The model is **a published fit for one tone, calculated here, compared with the measured values**. It does not simulate the merger.

## Learning Objective

By the end the learner can say, in their own words:

1. A newly merged black hole rings, and the ringing has a pitch (frequency) and a fade time.
2. For a given spin, a bigger mass gives a lower pitch and a longer fade (pitch × mass is fixed, as a bell twice as big rings an octave lower).
3. For a given mass, a faster spin gives a higher pitch and a slower fade.
4. The "no-hair" idea: pitch and fade time are fixed by mass and spin alone, so two tones give two independent checks.
5. For GW250114, the measured main tone (251.7 Hz, 4.09 ms at the detectors) agrees with the calculation from the independently found mass and spin to a few percent; the second tone agrees to tens of percent and is the weaker evidence.

## Physical Situation

The remnant of GW250114: 62.7 Suns (source frame), spin 0.68, redshift about 0.09. It rings in its main quadrupole tone (called (2,2,0): the "2,2" is the shape, "0" the main tone) at about 271 Hz in its own frame, fading in about 3.8 ms. The detectors record it stretched by 1.09.

## Physics Model (`src/physics/blackHoleRingdown.ts`, proposed)

| Part | What it computes | Source |
|---|---|---|
| **Ring frequency** | `f = [1.5251 − 1.1568 (1 − χ)^0.1292] ÷ (2π G M/c³)`; 62.7 Suns, χ = 0.68: **271.4 Hz**. | Berti, Cardoso and Will fit (coefficients from a search summary; **to be read at the paper**) |
| **Quality factor** | `Q = 0.7000 + 1.4187 (1 − χ)^(−0.4990)`: **3.21** at χ = 0.68. | same |
| **Fade time** | `τ = Q ÷ (π f)`: **3.76 ms**. Cycles to fade by 1/e: `Q ÷ π` = **1.02**. | derived from the two above |
| **Redshift** | detector-frame values = source-frame ÷ (1 + z): **249.0 Hz**, **4.10 ms**. | Experiment 18's z (to be read at the paper) |
| **Comparison** | measured ÷ calculated: 251.7 ÷ 249.0 = **1.011** (1.1 percent above); 4.09 ÷ 4.10 = **0.998**. | paper's values (partial read) |
| **Trial values** | the learner's mass and spin give the pitch and fade time by the same formulas (for example 10 Suns, χ 0.68: **1,702 Hz**; 100 Suns: **170 Hz**; χ 0 at 62.7: **190 Hz**; χ 0.9: **343 Hz**). | same |
| **Answers** | predictions' answers and nearest-answer helpers. | arithmetic |

The module imports `horizonRadius`/mass units from Black Holes 8's and Experiment 18's modules where useful and invents no new physics. How accurate the fit is for this tone has **not been checked in any source** (see open items); the page must not claim an accuracy until it is.

## Learner Controls ("Now try it yourself", trial values)

1. **Mass of the black hole** (a handful of presets: 10, 30, 62.7, 100 Suns, and a supermassive example).
2. **Spin** (0, 0.5, 0.68, 0.9, 0.99).
The pictures that follow the controls say their numbers are trial values, not what GW250114 did (§14, wording to be owner-approved).

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **If the remnant had spun faster (same mass), would the pitch be higher, lower or the same?** Answer: higher (271 Hz at 0.68; 343 Hz at 0.9). Drawn as a white marker on the pitch scale.
2. **How many swings (cycles) does the ring last before it fades to about a third (1/e) of its size?** Buttons balanced about the answer, **about 1**. The learner will probably guess dozens, like a church bell.
The guesses are drawn in white on the real picture and never change it; the tutor marks them.

## Experiment Behavior

### Introduction (to be drafted to §29 and §14 once approved)
Outline: tapping a wine glass or a bell (daily-life example for pitch set by size and shape); the merger leaving a lopsided black hole; "no hair" explained as "only two numbers describe it", with a reminder of mass and spin from Black Holes 8; what the detectors hear (frequency, fade time, and the redshift stretching); the learner's job; that predictions never change the real pictures. Terms defined before use: *frequency (hertz)*, *fade time*, *tone/overtone*, *no-hair*, *redshift stretch*.

### Display (three pictures, each with a caption to §14 and §29 and a "Where the real picture comes from" line)
1. **The signal:** a fading sine wave for the main tone (calculated) with the measured 251.7 Hz and 4.09 ms drawn beside it (measured, with give-or-take bars), so the two can be seen to agree.
2. **Pitch against spin** for the chosen mass: the curve of `f(χ)`, with GW250114's point and the guess marker.
3. **Pitch against mass** for the chosen spin (bigger mass, lower pitch).
Plus a labelled illustration of a bell and a dented black hole (not to scale).

### Run
Five stages (event, ringing builds, the tone, the fit, the comparison), as in earlier experiments; the pictures build up and the guesses appear once the feature beside them is drawn (§14).

### Results (neutral, then explained by the tutor)
A check-up table (calculated vs measured for pitch and fade time, with a plain reading), a note under each table, the predictions beside the results, and a table of the trial values. No "right/wrong" (§14).

## Expected Observations
The calculated and measured main tone agree (1.1 percent); the pitch rises with spin and falls with mass; the ring fades in about one cycle.

## Expected Learner Understanding
A black hole's ring is a fingerprint of its mass and spin, which turns the signal into a test of general relativity, and the test passed once, at modest precision for the second tone.

## New Concepts Introduced
Ringdown, quasi-normal mode, overtone, no-hair theorem, quality factor (cycles to fade).

## Relationship to Previous Experiments
Black Holes 8 (spin), Gravitational Waves 1, 2 and 4 (waves, the chirp, real events), Experiment 18 (the same event, the masses and spin, the redshift).

## Relationship to Later Experiments
Experiment 20 (the heaviest merger) rings at a lower pitch; Experiments 21 and 23 involve black holes at other scales.

## Required Physics Tests (proposed; each must fail when the module is deliberately broken)
1. `f(62.7, 0.68)` is 271.4 Hz (± 0.5) and `τ` is 3.76 ms.
2. For fixed spin, `f × M` is constant (doubling the mass halves the pitch).
3. `f` rises and `τ` rises with spin; `Q` rises with spin.
4. Cycles to fade `Q ÷ π` is about 1.02 at 0.68.
5. Detector-frame values equal source-frame divided by 1 + z (249.0 Hz, 4.10 ms).
6. Comparison ratios (1.011 and 0.998) and their readings.
7. The trial-value examples listed above.
8. The prediction answers and the guess markers follow the guess (§14 rule 3).

## AI Tutor Behavior (to be drafted once approved)
Predict, observe, compare, explain, per §12 and §13. It marks each prediction only in its explanation, uses the bell comparison and a worked calculation (`f = 0.5267 ÷ (2π × 3.09 × 10⁻⁴ s)`), and leaves out the full derivation of the fit.

### Chapter summary (to be drafted once approved)

## Links ("Want to know more?", §29 rule 3; each fetched on 2026-10-26)
Before the run (plain official pages): [NASA: Black holes](https://science.nasa.gov/universe/black-holes/) (loaded; what a black hole is, the event horizon, and how black holes are detected, including by gravitational waves); [NASA Space Place: What is a gravitational wave?](https://spaceplace.nasa.gov/gravitational-waves/en/) (loaded; a gravitational wave as a ripple in space, and LIGO's first detection in 2015). After the run, so as not to give away the predictions: [arXiv:2509.08099](https://arxiv.org/abs/2509.08099) (the LIGO, Virgo and KAGRA paper; abstract read), [arXiv:gr-qc/0512160](https://arxiv.org/abs/gr-qc/0512160) (Berti, Cardoso and Will, Phys. Rev. D 73, 064030; title and abstract read; the coefficients were not found in it), [arXiv:2605.03576](https://arxiv.org/abs/2605.03576) (a 2026 re-analysis; abstract read). **Not linked:** the LIGO "What are gravitational waves?" page and the Caltech release (both gave a certificate error on 2026-10-26); no plain official page on the no-hair idea was found.

## Sources read (2026-10-26; none in full)
| Source | What was read | What it gave |
|---|---|---|
| arXiv:2509.08099 abstract (fetched) | abstract | at least two modes needed; few-percent and tens-of-percent claims |
| arXiv:2509.08099 HTML (first 100,000 of 153,772 characters, through a summarising fetch) | partial | 251.7 Hz (−5.0, +5.1), 4.09 ms (−0.38, +0.42); area formula |
| arXiv:2605.03576 abstract (fetched 2026-10-26; a first search summary had given 86.2, which the abstract corrects to 82.5) | abstract | overtone significance 82.5 to 99.9 percent |
| Berti, Cardoso, Will fit (search summary only; the paper's page did not show the coefficients) | summary | f₁ = 1.5251, f₂ = −1.1568, f₃ = 0.1292 (frequency); the quality-factor coefficients 0.7000, 1.4187, −0.4990 were from my own recall of the paper and were **not found in any source** |
| arXiv:2605.03576 abstract (fetched 2026-10-26) | abstract | "the inferred significance increasing from 82.5% to 99.9%" for the first overtone |
| arXiv:gr-qc/0512160 (abstract page, an ar5iv copy and the PDF, through summarising fetches) | title, abstract; the table of coefficients was not found | the fits are "accurate within a few percent" |
| NASA black holes page; NASA Space Place gravitational waves page (fetched 2026-10-26) | summaries | what each page covers |
| Caltech press page; LIGO "What are gravitational waves?" page | failed | certificate error |

## Conflicts between sources, and how this specification handles them
- The proposal's "270 Hz" is the source-frame value; the paper's 251.7 Hz is the detector value. Both are shown, with their frames named.
- The overtone's significance differs by analysis (82.5 percent versus 99.9 percent): the page states the range and that it is a weaker result than the main tone.

## Facts that may change (re-check by the dates shown)
| Fact | Source | Checked |
|---|---|---|
| 251.7 Hz and 4.09 ms | arXiv:2509.08099 (partial) | 2026-10-26 |
| Overtone significance (82.5 to 99.9 percent) | arXiv:2605.03576 (abstract) | 2026-10-26 |
| Redshift 0.09, final mass 62.7 Suns, spin 0.68 | summaries of the area-law paper's supplement (Experiment 18) | 2026-10-25 |
| Later events with a measured ringdown or a second tone | not searched | not checked |

## Open items (known before approval)
(a) **Update 2026-10-26: an independent check by Leaver's method was attempted and FAILED; it is not a check.** A script written from recalled coefficients did not reproduce the known non-spinning result (it gave 0.3348 − 0.0502i against the literature's 0.37367 − 0.08896i, which is itself recalled, not read), so its numbers were discarded and the recalled Leaver coefficients are wrong. The only anchor left is that the fit at spin 0 gives 2πMf = 0.3683 and Q = 2.12, within about 1.4 and 0.9 percent of that recalled value; this is consistent with the paper's "accurate within a few percent" (read) but is not a source check. The page must call the fit "a published fit, good to a few percent" and no closer. The fit formulas, and especially the quality-factor coefficients, have **not been verified** in any source; they must be read at Berti, Cardoso and Will (2006) or Berti's online tables before the module is built. The numbers above that depend on them (3.21, 3.76 ms, 1.02 cycles) are unverified, although the frequency and fade time agree with the paper's measured values, which is an indirect check. (b) The paper was read only in part and its redshift and final mass and spin were not checked in its text. (c) The Caltech page and other official releases were not read. (d) The "wine glass" and "bell" comparisons need a plain-language check. (e) Not checked: newer results.

## Decisions for the owner (each on a default; change any you like)
1. **Status label:** *Strong evidence* (as above). Default: yes.
2. **Model:** one tone (the (2,2,0) mode) from the published fit; the overtone is described and shown in the signal picture, not calculated. Default: yes.
3. **Frame:** show both the source-frame and the detector-frame numbers, and teach the 1 + z stretch in one sentence. Default: yes.
4. **Prediction 1:** spin up, pitch higher, lower or same. Default: yes.
5. **Prediction 2:** how many swings before the ring fades to 1/e (balanced buttons about 1). Default: yes.
6. **Controls:** mass presets and spin presets. Default: yes.
7. **Sound:** none (no audio), to keep the stack simple. Default: yes. (Hearing the pitch would help, but 271 Hz is a plain tone and the project has no audio yet.)
8. **Introduction** includes the bell example and defines "no-hair" in plain words. Default: yes.
9. **Links:** the paper plus plain official pages found by fetch. Default: yes.
10. **Significance figures** for the overtone are quoted as a range with the analyses named. Default: yes.
11. **The overtone is shown but marked weaker.** Default: yes.
12. **Where it stops:** no test-of-gravity alternatives (for example the second tone's deviation) beyond a mention. Default: yes.

## Not built
Everything: this is a draft specification only.

## Implementation Notes

**Step 1 done (2026-10-26): the physics model and tests** (`src/physics/blackHoleRingdown.ts`, 22 tests in `blackHoleRingdown.test.ts`, checked by eleven deliberate breaks). The prediction 2 buttons are 0.1, 0.3, 1, 3, 10 and 30 swings (the spec said "balanced about 1"); the supermassive example is Sagittarius A* at 4.3 million Suns (Black Holes 1's preset). An independent Leaver's-method check failed and was discarded (see open item (a)).

**Steps 2 and 3 done (2026-10-26): the interface skeleton, the introduction and the two predictions** (`src/components/BlackHoleRingdownExperiment.tsx`, wired into `src/App.tsx` with a placeholder summary). Wording approved by the owner on 2026-10-26 ("approved", after Step 3), covering the introduction, the bell-and-black-hole illustration and its guide, the added "Why a bigger bell has a lower note" explanation (the owner's text, with the examples of a ruler, a guitar string and a swing filled in by Claude where the pasted text broke off), the new-word list, the Words panel, the two links (NASA's black holes page and NASA Space Place's gravitational waves page, fetched 2026-10-26; the LIGO page gave a certificate error and is left out) and both predictions. Not checked: other browsers, narrow widths, keyboard use, a real learner. Unsourced in the page: the piano-note comparison (27 Hz and 262 Hz), the wine-glass and bowl comparison, and that gravitational waves spread out like sound.

**Steps 4 to 8 done (2026-10-26), each with the owner's wording approval ("wording approved") as it was built.** Step 4: the run (three stages, then five) and Picture 1 (panel A the calculated fading wave, panel B the swings on a log scale with Prediction 2's guess in white, panel C calculated against measured). Step 5: Picture 2 (pitch against spin, with Prediction 1's guess as a white arrow marker) and Picture 3 (pitch against mass); both in the black hole's own frame, Picture 1 in the detectors' frame. Step 6: Part 2, "Now try it yourself", with two controls (mass, spin) and Drawing A. Step 7: Part 3, the results (a check-up table, a spin table, a mass table, a note under each, the predictions beside the results). Step 8: Part 4, the tutor (three questions, then an explanation in seven parts that marks both predictions), and the post-run paper links. **Differences from this specification to approve:** (1) no fourth table of the learner's trial values (CLAUDE.md §14 makes it optional, and Drawing A already shows the numbers); (2) the run has five stages named "The ringing after the merger", "How fast it fades", "What the detectors measured", "Pitch and spin" and "Pitch and mass", not the specification's "event, ringing builds, the tone, the fit, the comparison"; (3) Prediction 2's buttons (0.1, 0.3, 1, 3, 10, 30 swings); (4) the supermassive example, Sagittarius A* at 4.3 million Suns; (5) Picture 1 has a panel B that draws the swings (the specification's Picture 1 had only the wave and the measured values) and Pictures 2 and 3 are drawn before the redshift stretch; (6) a "swings in one fade time" row made from the two measured numbers, in the check-up table; (7) the introduction's bell explanation (the owner's text) and a "What you will do" paragraph; (8) the papers' links are shown after the run.

**Correction made at Step 8 (2026-10-26):** the second tone's significance. A search summary had given "86.2 to 99.9 percent"; the abstract of arXiv:2605.03576, read directly, says "from 82.5% to 99.9%". The page, the tutor and this specification now say 82.5. The owner had approved the earlier wording at Step 7 and was told of the correction at Step 8.

**Step 9 done (2026-10-26): the chapter summary draft and the complete-flow test.** The summary (`blackHoleRingdownSummary()` in `src/App.tsx`) reads every number from the physics module; Experiment 18's "What's next" now points to this experiment (draft wording). Complete-flow test in Chrome, with the stage timer shortened to 120 ms (and restored): all 18 prediction pairs (3 pitch guesses by 6 swings guesses) from "Start over" through the predictions, the run, Parts 2 to 4, the three tutor questions and the explanation, and all 25 control settings of Part 2 compared with a separate calculation (CODATA constants written out in the script): 882 checks, all passed, except that the "summary before the tutor" check was run on a browser that already had this chapter saved as explained (the app's saved progress), and was then run again from a cleared state: no summary before the explanation, the hint line shown, "completed" set when the run ended and "explained" set after the explanation. At a window width of 454 px there was no sideways scrolling and Picture 1 was drawn 371 px wide, with small text (as in the group's other experiments). Not checked: other browsers, keyboard use, widths below about 450 px, a real learner.

**Differences from this specification to approve (added at Step 10):** (9) the second tone (overtone) is described in the introduction, the Words panel and the notes, but is not drawn in Picture 1 (Decision 2 said it would be shown in the signal picture); (10) the "Tones, and a stretch" paragraph, seven added Words entries (swing, tone, redshift and the stretch, give-or-take, millisecond, light-year, quality factor) and the matching new-words list, added by the review; (11) the second tone's figures, the published 82.5 and 99.9 percent, are a module constant (`SECOND_TONE_SIGNIFICANCE`); (12) Picture 2's guess marker sits at spin 0.9 (the next spin choice up) and Picture 3 has no guess.

**Approvals (2026-10-26):** the owner approved the wording of every step, the chapter summary, Experiment 18's changed "What's next", the review's fixes, and all twelve differences from the specification (items 1 to 12 above) ("wording approved, differences approved"). **Committed.**

**Step 10 done (2026-10-26): the final review.** The finished experiment was compared with `docs/PROJECT.md`, `AGENTS.md`, `CLAUDE.md` (§9, §12, §14 "Animated Diagrams", "Reading the Results" and "Predictions and the Real Results", §15, §29), this specification and the intended learning sequence. **What was found and fixed.** (1) **§9, numbers typed in the page:** the published 82.5 and 99.9 percent were typed in five places (the page, the tutor, the summary), three spins (0.99, 0.9, 0.68) in text and a "five swings" were typed, and the mass label 62.7 was typed; they now come from the module. (2) **§15, terms used before they are defined:** "tone" (used in the status line), "redshift" and "stretch" (first used in a "where the real picture comes from" line), "give-or-take", "millisecond", "light-year", "swing" and "quality factor" were missing from the Words panel or the introduction; they are now defined, with a new introduction paragraph. (3) **A source correction found at Step 8:** 86.2 became 82.5 (see above). (4) **A test gap** (the mass table's fade-time column) found by the deliberate breaks and closed at Step 8. (5) **Difference from the specification:** the second tone is not drawn in Picture 1 (item 9 above). **Checked and found sound:** the real pictures and tables never change with a guess (checked in all 18 pairs and 25 control settings); each guess appears on the picture where its answer lives, in white, with a "YOUR GUESS" box, and only once the feature beside it is drawn; the introduction before the run contains none of the real numbers or answers (21 strings searched on the rendered page); every picture that carries a guess has a "Where the real picture comes from" line; the results have the check-up, the notes, and the predictions beside the results; the check mark and the saved "explained" mark behave as designed. **Not done or not checked:** the project has no lint configuration, so no lint was run; other browsers, keyboard use, widths below about 450 px and a real learner; the fit's coefficients at the source (open item (a)); the unsourced statements listed in the open items of `CLAUDE.md`'s table row.
