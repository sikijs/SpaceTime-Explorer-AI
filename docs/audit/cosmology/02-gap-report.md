# Gap report: Cosmology Experiment 2 (The Big Bang)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/02-the-big-bang.md | Components: src/components/BigBangExperiment.tsx, BigBangTutor.tsx | Physics module: src/physics/bigBangExperiment.ts (+ .test.ts, 8 tests; also reuses hubblesLawExperiment.ts) | Status: read-only, nothing changed

## Summary
Two pictures (a time ruler counting down and a row of galaxies sliding to Earth), a "play forward" replay, two predictions, Results of prose with an amber note (no tables), a 3-prompt tutor with a five-point explanation. Verdicts ("right / off this time") sit in Results, not the tutor. No guess marks, no check-up, no reading guide, no worked moment or three-part look-for items, no "Where the real picture comes from". The 13.8-billion-year real age is a real reference the guess could be drawn against. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Farther galaxy's implied time since zero distance: longer, shorter, same? (BigBangExperiment.tsx:351-352; state :86, :88) | Longer / Shorter / The same (:57-61) | The ruler (picture 1, :538-604): its 0 end is the same for every galaxy; also the "reaches Earth" moment in picture 2 (:606-673) |
| 2 | How will this experiment's answer compare with the real age (about 13.8 billion years)? (:368-370) | Much longer / Much shorter / Close, but not exact (:64-68) | The ruler's "13.97 billion years ago" end (:585); no 13.8 mark exists on it |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runBigBangExperiment(selectedDistanceMpc)` (:112) and `distanceAtPastTimeMpc` (:627) take no prediction input; prediction state is used only in text (:388-394, :730-745) and tutor props (:782-783) | none |
| A2 | Not met | No guess element in either SVG (:538-673) | White "YOUR GUESS" boxes: Prediction 2 on the ruler at a position for the guess relative to the real-age tick; Prediction 1 on picture 2 / ruler |
| A3 | Not met | | Guesses are 3-way choices: markers, caption to say "marker only". Prediction 2 could carry a size ("much longer" etc.) only if the owner defines it |
| A4 | Not met | The ruler appears with the Run (:538) | Mark after the backward run finishes |
| A5 | Not met | The real 13.8 Gyr age has no mark on the ruler | Add a "real measured age" tick on the ruler as its own labelled element |
| A6 | Not met | no "Where the real picture comes from" | Needed: Hubble time = 1/H0 (calculated here); 13.8 Gyr (measured by others; not derived here, as intro :339-340 says); galaxy distances illustrative |
| A7 | Not met | Introduction (:258-346) has no statement about guesses or white marks | Add sentences; note beside Galaxy buttons (:421-477) |
| A8 | Not met | `ACTUAL_TIME_COMPARISON = 'same'`, `ACTUAL_AGE_COMPARISON = 'close'` are constants in the component (:73-74); module has no function for a guess's mark position | Module functions plus tests for mark positions; the "close" verdict is only tested as "within about 10%" (bigBangExperiment.test.ts:25) |
| A9 | Not met | Tutor compare prompt restates the guess but names no mark (BigBangTutor.tsx:64-65); the verdict is in Results (BigBangExperiment.tsx:735-745), not the tutor | Prompts to name the marks; the owner to decide where verdicts go (§14) |
| A10 | Not found | No "do not change the results" sentence in BigBangExperiment.tsx or BigBangTutor.tsx | Absent here, although CLAUDE.md §14 says older experiments carry it |

## Rule B
- B0: Results (:720-776): the Hubble time sentence, two "Checking your ... prediction" paragraphs with right/off, an "Earth is not special" paragraph, and an amber "not how astronomers measure the age" box. No tables.
- B1: Not met. A real reference exists: measured age 13.8 Gyr (`REAL_UNIVERSE_AGE_YEARS`, :5 and :766). A check-up row would be "this model (about 14.0 Gyr, calculated) vs measured 13.8 Gyr", reading "more", not "close enough" (no accepted cut-off); the test uses 10% (bigBangExperiment.test.ts:25) which is a code threshold, not a published one.
- B2: Not met (no tables; the amber box says what and why but without numbers beyond 13.8).
- B3: N/A. Galaxy choice only moves marks; the Hubble time does not change with it.
- B4: Partly met (guess shown in prose with verdict; no tag on a row, and verdict wording against §14).
- B5: Not met (no comparison functions).

## Rule C
- C1: Partly met. Labelled: "Earth" (:622), each galaxy (:668), ruler ends (:585, :588), pointer text (:601-602). Unlabelled: the ruler's alternating blocks and ticks, the gold trail (named only in the caption), the "singularity" is labelled only at the ruler end.
- C2: Met. Different distance gives a different starting x (`positionXForDistance` :38-41); the selected galaxy is gold and pulsing.
- C3: Partly met. "How to read this diagram" (:678) appears beneath the pictures but only after predictions are locked (`hasSubmittedPrediction` :675).
- C4: Partly met. Explains Earth, selected galaxy, ruler, backward run, forward replay (:678-713). Does not define "billion years ago", "Mpc", "Hubble time" in the caption (Hubble time and singularity are defined in the intro :267-273); no colours for non-selected galaxies stated beyond "dot".
- C5: Not met. No worked moment with numbers in the caption. The intro example (:302-306) sets up the sum but gives no result (16.5 Mpc at 1,155 km/s is not worked).
- C6: Not met. The "watch ..." items (:696-699, :711-713) are single sentences, not Look at / Means / Matters.
- C7: Partly met. :698-699 "Watch whether every galaxy reaches that moment at the same time, or at different times" nearly restates Prediction 1 (same / longer / shorter) and so hints at it; :711-713 ("the farther galaxy moves out faster ... because Hubble's Law makes recession speed proportional to distance") gives a mechanism in the caption.
- C8: Partly met. "singularity", "Hubble time", "horizon problem", "cosmic inflation" are defined in the introduction before use; "Mpc" and "recession speed" are not defined here (assumed from Experiment 1).

## Other findings
- O1: None against the specification found in what was read (spec's decisions not re-read). CLAUDE.md §14 vs. code: no older-rule sentence (A10).
- O2: The introduction gives a long horizon-problem and inflation paragraph (:276-292) before the learner predicts; it is outside the experiment's own results and states inflation "explains the horizon problem well", unsourced here. The bedsheet / football field comparison is also unsourced. The Results box gives the answer to Prediction 2 ("close to this experiment's naive estimate"), which is after the run, so acceptable. No links list (not required outside Cosmic Horizons).

## What an update would touch, and its size
BigBangExperiment.tsx, BigBangTutor.tsx, src/physics/bigBangExperiment.ts and test, the specification 02-the-big-bang.md. Size **M**.

## Not checked
Rendering in a browser, the forward-replay behaviour at runtime, the specification's decisions table in full, the tutor's explanation text after line 100 (only grepped).

---

# Re-read, 2026-11-14: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `BigBangExperiment.tsx` (789 lines), `BigBangTutor.tsx` (150), `bigBangExperiment.ts` (55, 8 tests) and the specification `02-the-big-bang.md`, following the Cosmology 1 audit. Nothing in the app changed. Rules A to C above stand as written **except the corrections below**; this section adds what they did not cover.

## What the module returns (H0 = 70 km/s per Mpc; hand-checked with node, not yet in a test)
| Quantity | Value |
|---|---|
| The Hubble time, 1 / H0 (same for every galaxy) | 13.968 billion years |
| Virgo, worked by hand: 16.5 Mpc × 3.0857 × 10¹⁹ km ÷ 1,155 km/s | 4.408 × 10¹⁷ s = 13.968 billion years (same) |
| The real age used for comparison (`REAL_UNIVERSE_AGE_YEARS`) | 13.8 billion years (source **not read**: the code says "Planck-era LambdaCDM") |
| This page's answer against it | 0.168 billion years more, 1.2 percent |
| 1 / H0 at the published H0 of Cosmology 1's check-up: 73.04 / 67.4 | 13.39 / 14.51 billion years (the measured 13.8 lies between them) |

1. **Guess 1 has one answer for any galaxy: the same.** 1 / H0 does not depend on distance, so every galaxy reaches zero distance at the same moment, and one Run draws all three presets doing it together.
2. **Guess 2's two numbers are 1.2 percent apart, and the picture cannot show it.** The ruler runs from 13.97 billion years ago to 0 across about 310 pixels, so the real age of 13.8 would sit about 3 pixels from the ruler's left end: no tick for it exists (the old report said so), and if one were added it would be unreadable. A guess about "much longer, much shorter or close" needs a **zoomed strip** (suggested: 12 to 16 billion years) in the same picture, on its own scale.
3. **"Close, but not exact" is the page's own wording, with no published cut-off.** The test marks it as "within about 10 percent" (`bigBangExperiment.test.ts:25`), a code threshold. The new Results would say "1.2 percent more" and let the tutor say "close", not invent a rule (CLAUDE.md §14, "Reading the Results").
4. **The numbers answer the Hubble-tension question too.** At the two published H0 values this experiment's answer would be 13.39 and 14.51 billion years, so the measured 13.8 lies between them. That is a real comparison, but 13.8 does not come from 1 / H0 (it comes from a fit of the full model), so a row must say it is not an independent check.

## Corrections to the 2026-11-02 report
- **C7 was marked "Partly met" and is not met.** (a) The introduction's "A simple example" (`:~302`) says that dividing a galaxy's distance by its speed gives the time back to zero, with the speed 70 km/s for every Mpc: any learner who does the sum sees the distance cancel, so the answer to guess 1 is in the introduction, before the guesses. (b) "What to look for" (`:~314`, "Notice when each one reaches Earth") and the caption's bullet "Watch whether every galaxy reaches that moment at the same time, or at different times" (`:~698`) restate guess 1's three options. (c) The caption's last bullet gives a mechanism ("because Hubble's Law makes recession speed proportional to distance"). All three are §12 problems.
- **A10 stands (no older-rule sentence), but the Results gives the verdicts "so your prediction was right / off this time" for both guesses before the tutor** (`:735-745`), which §14 reserves for the tutor.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the galaxy buttons, Run, the readout, "Play forward", both pictures, the caption and Results (`:253-776`); the tutor is a second card | Part 1 (guesses, Run, the pictures, Play forward), Part 2 (the controls), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met, with a defect.** The Results and the tutor appear once the first backward run has finished (`:~708`, `:~778`). **But moving the custom slider after a run sets the status back to idle (`:~452`), which hides the Results and unmounts the tutor, and pressing Run again remounts the tutor from its first question** (`key={runCount}`, `:~780`). Choosing a preset keeps the results but resets the forward replay. This is the same defect as Cosmology 1 had. The galaxy buttons are also disabled until both guesses are made (`:~427`). Suggested fix: after the first Run, Parts 2 to 4 stay; changing a setting changes only the Part 2 drawing until its own run; the tutor is not remounted.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** A "Change predictions" button appears only after the first Run (`:~395`). It must become an always-visible "Start over" (greyed out until a guess is chosen or a run exists, and while a run plays), clearing the guesses, runs, results, forward replay and tutor progress; the page says the guesses are locked after Run. Replaced, and said so in the specification (no need to ask the owner).

## Predictions and where their answers live (A5, sharpened)
- **Guess 1 (a farther galaxy's time back to zero: longer, shorter or the same):** the answer is when each galaxy reaches Earth, which the galaxy picture already draws, but nothing says the arrival time as a number for each galaxy. Suggested: a small **"Time to reach Earth" panel** in the same picture (a bar for each of the three presets, all 13.97 billion years, on a 0 to 16 scale), with a **white marker** for the guess beside the farthest galaxy's bar: an arrow past the bar's end for "longer", an arrow ending short of it for "shorter", a bar-end tick for "the same". **Marker only** (the three answers carry no size), and the caption says so.
- **Guess 2 (this page's answer against the real age: much longer, much shorter or close):** the answer lives in the 1.2 percent gap between 13.97 and 13.8, which needs the **zoomed strip** in finding 2: the page's 13.97 as a tick, the measured 13.8 as its own labelled tick (a different colour, "measured by others, not derived here"), the guess as a white marker (left of the measured tick well away for "much shorter", right of it well away for "much longer", on it for "close"). **Marker only.** Drawn only once the backward run has finished (A4).
- **One Run** (backward) shows both, so Parts 2 to 4 can appear after it. "Play forward" stays as an optional replay under Part 1's picture.
- **"Where the real picture comes from":** *calculated here* (1 / H0 at H0 = 70, the unit conversions, each galaxy's recession speed, the backward positions); *measured*: the age of 13.8 billion years (**source not read; to be searched**), the Virgo and Coma distances (Cosmology 1's sources), the Hubble constant range; *imagined for the question*: the constant-speed backward run is not the real history, and the spacing of the galaxies in the drawing is illustrative.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: Big Bang, Hubble time, singularity, megaparsec, recession speed, Hubble constant, Hubble's Law (as in Cosmology 1), billion years, constant speed, horizon problem and cosmic inflation (defined in the introduction at present). Formula and worked example, from the page's own numbers (checked above): time back = distance ÷ speed = 16.5 Mpc × 3.0857 × 10¹⁹ km ÷ 1,155 km/s = 4.408 × 10¹⁷ s = 13.97 billion years. **Held back until after the Run (§12):** that the answer does not depend on distance, which is guess 1.
- **"Want to know more?" links (new).** None exists. Candidates to search (none read): a plain NASA or ESA page on the Big Bang and the age of the universe; the original source of 13.8 billion years (Planck 2018 results VI, whose abstract the Cosmology 1 helper read for H0 but not for the age); a plain official page on cosmic inflation and the horizon problem; Hubble 1929 and the two NASA pages already read for Cosmology 1 (to be re-read before reuse). Per §29 rule 3(c), link only what is read and record any gap. The Big Bang's **"not an explosion in a pre-existing space"** claim (tutor point 3) and **"the Hubble time as a measure of the age"** have no source read.

## Wording and claims to check (new and restated)
- **The introduction's horizon-problem and inflation paragraph (`:276-292`)** is long, comes before the guesses, says inflation "explains the horizon problem well", and says the tests are not yet definitive; none of that is sourced. The same material is the tutor's point 5. It also says that tracing opposite patches of sky "back to the Hubble time" shows light could not cross between them: that is a statement about the real universe's history, while this page's own model is a constant-speed one, so the sentence mixes the two. **Owner to decide (question 5).**
- **The Results box** (`:~760-775`) says the real age is "close to this experiment's naive estimate"; with the verdicts moved to the tutor it would show the two numbers and "1.2 percent more" and leave "close" to the tutor.
- **The matter, radiation and dark energy claim** ("each played a part", Results and tutor point 2) has no source read; NASA's Cosmology 1 page says the expansion has been speeding up for about five billion years because of dark energy (read in full, 2026-11-14).
- **"Experiment 1" in the caption and the assumptions** has no group name; the learner's sidebar says "Hubble's Law" under Cosmology. The heading "Experiment 2 — The Big Bang" would read **Cosmology 2: The Big Bang** (matches the sidebar and the Cosmology 1 heading).
- **"Hubble's Law" and "Hubble constant" are used here as already known** (from Cosmology 1) without being restated; the new words box would carry them.
- **The bedsheet-and-football-field picture** is unsourced (a daily-life picture, §15, needs the owner's approval).
- `onComplete` fires on every Run (`:~163`); not harmful but noted.

## B1 to B3, recommendation
A real reference exists independent of the page's code, **if** a source for the age is read: the measured 13.8 billion years. Suggested **check-up table**: (a) this page's answer, 13.97 billion years, against the measured 13.8: reading "more, by 1.2 percent" (no accepted cut-off, so no "close enough"); (b) the Hubble constant used, 70, against the published 73.04 and 67.4 (Cosmology 1's sources, if re-read): "between"; (c) 1 / H0 at those two values, 13.39 and 14.51 billion years: "the measured age lies between them", with the note that 13.8 is not found from 1 / H0 (so not an independent test); (d) the galaxy's own time back to zero: "the same for every galaxy, calculated only". "What this table tells us" under it, with a daily-life comparison (the burning candle in the introduction). **No setting-following table:** the Part 2 drawing shows what the distance changes (nothing about the time). **The learner's guesses** shown beside the results with a tag on the table row, guess only. All need module functions and tests.

## Updated size
**Medium to Large.** Two new panels in the existing picture (time to reach Earth; the zoomed age strip), two white marker sets, labels, a new caption, a page rebuilt around Parts, a module (the arrival-time numbers, marker positions, tutor marking, check-up rows, worked example) and tests, a rewritten introduction, Results and tutor, a words box, links, the specification. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: Virgo highlighted, all three presets drawn, one backward Run, "Play forward" as an optional replay under the picture; Parts 2 to 4 appear after the first Run.
2. **What does Part 2 change?** Suggested default: a custom galaxy (1 to 200 Mpc) drawn in pink as an extra galaxy with its own speed and arrival time (so the learner sees that it arrives at the same moment), and the choice of which preset is highlighted. The Hubble time does not change with it, and the page says so after Run.
3. **Marks:** guess 1 as a white marker on a new "Time to reach Earth" panel; guess 2 as a white marker on a new zoomed strip (12 to 16 billion years) beside the page's 13.97 and a separately labelled measured 13.8; both markers only, drawn after the backward run. Suggested default: yes.
4. **Introduction, caption and Results neutral:** hold "A simple example" (the division), the "What to look for" hint and the caption's "same time or different times" bullet and mechanism until after Run; move the "right / off" lines to the tutor; add the Parts paragraph, the guess paragraph and "Some new words". Suggested default: yes.
5. **The horizon-problem and inflation paragraph in the introduction:** remove it from the introduction (it stays as the tutor's point 5 and gets a link if a plain official page is found) because it is long, unsourced and contested. Suggested default: remove from the introduction, keep in the tutor.
6. **Check-up table** as in B1 to B3, only rows whose sources are read, no setting-following table. Suggested default: yes, small.
7. **A Hubble-constant control (67 to 73) in Part 2:** not in the specification; it would move this page's answer between 13.4 and 14.5 billion years and let the learner compare it with 13.8. Suggested default: **no** (scope, §16); your call.
8. **Links and words box:** search and read a plain Big Bang and age page, the age's original source, an inflation and horizon page; reuse Cosmology 1's links only after re-reading; link only what is read and record gaps. Suggested default: yes.
9. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule). Listed so you can see it. Suggested default: yes.
10. **Heading and cross-references:** "Cosmology 2: The Big Bang", "Cosmology 1" in place of bare "Experiment 1", and the specification's status lines brought up to date in the Audit Update. Suggested default: yes.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; no source page searched or fetched, so 13.8 billion years, the matter, radiation and dark energy claim, the inflation claims and the "not an explosion" claim are **not verified**; the table of numbers was made by hand with node (nothing left in the repo) and is not yet in a test; the specification was compared for the wording and behaviour cited, not line by line; line numbers marked `~` are approximate, read from the component's source order.
