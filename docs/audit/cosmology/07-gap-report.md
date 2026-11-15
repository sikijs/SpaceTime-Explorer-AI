# Gap report: Cosmology Experiment 7 (Gravitational Lensing)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/07-gravitational-lensing.md | Components: src/components/GravitationalLensingExperiment.tsx, GravitationalLensingTutor.tsx | Physics module: src/physics/gravitationalLensingExperiment.ts (+ .test.ts, 12 tests) | Status: read-only, nothing changed

## Summary
Three pictures (a side view with two light rays, a sky view with three rings, a ring-radius-against-mass graph), a "cluster mass" control, two predictions, Results with a three-row table, a worked calculation for the real cluster (Abell 1689, 47 arcseconds) and a "What this model simplifies" box, a 3-prompt tutor. The captions are thorough and per picture. Gaps: no guess marks, no "Where the real picture comes from", no "What this table tells us", no three-part look-for items, verdicts in Results, and Picture 3's caption gives away Prediction 2's answer before the run. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the cluster had more mass, would the ring be larger, the same, or smaller? (GravitationalLensingExperiment.tsx:286; state in :~100-110; ACTUAL = 'larger', :40) | larger / same / smaller (`ringSizeChoices`) | Picture 2, the gold ring against the blue and green rings (:516-582); Picture 3, the purple curve's slope (:585-668) |
| 2 | If the cluster had four times the mass, how wide would the ring be compared with before? (:304; ACTUAL = 'two', :41) | `fourTimesChoices` (two times is the real answer; the others include four times / etc.) | Picture 3: the purple curve at 4 x the chosen mass; Picture 2: a ring of twice the radius |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runGravitationalLensingExperiment(mass)` takes only the mass (module :79); predictions feed text only (:806-830) and tutor props (:899-903) | none |
| A2 | Not met | No guess element in the three SVGs (:444-668) | Prediction 2: a white "YOUR GUESS" ring in Picture 2 at the guessed radius (twice, four times...) and a white point on Picture 3 at 4 x mass; Prediction 1: a white arrow marker (ring grows / same / shrinks) on Picture 2 |
| A3 | Not met | | Prediction 2 has a size (a multiple of the current ring), so a ring can follow it; Prediction 1 is a marker; caption to say so |
| A4 | Not met | The gold ring grows on Run (caption :~718-721); blue and green are drawn from the start | Draw guess ring after the gold ring reaches its size |
| A5 | Met (pictures exist) | Picture 2 and 3 carry ring size | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: the 47 arcsecond ring measured for Abell 1689; distances 630, 1730 and 1480 Mpc fixed, rounded values (module :13-15); gold ring and purple curve calculated here; the visible-only 15% is an average for real clusters (module :19) |
| A7 | Not met | Intro (:205-262) and the controls (:~370-424) say nothing about guesses never changing the pictures or tables | Add sentences; a note by the mass control |
| A8 | Partly met | Ring sizes (including 4 x mass, `einsteinRingArcseconds(4*mass)`) are computed in the module; ACTUAL constants are in the component (:40-41); the "4 x mass is more than the slider allows" check is in the component (:~827) | Module functions for the guess ring and the multiple, with tests; `bendingAngleArcseconds` and `massInsideRingSolarMasses` already tested |
| A9 | Not met | Tutor observe prompt names "the three rings: gold, dashed blue, green" (GravitationalLensingTutor.tsx:77-78) which is a partial pointer to drawn items; the compare prompt (:79-80) restates the guess and names no mark; verdicts are in Results (Experiment.tsx:811, :827) | Prompts to name the guess marks; verdict placement is the owner's choice |
| A10 | Not found | no "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:779-890): a 3-row table (ring for your mass; ring that visible matter alone would make; observed ring, "a given value"); two "Checking your ... prediction" paragraphs with right/off and the numbers for 1x and 4x mass; "A simple calculation" (the 47-arcsecond ring needs about 2.0e14 solar masses; visible 15% gives a ring about 2.6 times smaller, sqrt of the mass ratio); an "In the real world" note; "A second line of evidence for dark matter"; a "What this model simplifies" box.
- B1: Partly met. The table sets your ring beside the visible-only ring and the observed ring; a real reference exists (the observed 47 arcseconds, test :95 gives about 2.0e14 solar masses). No "reading" column ("less", "the same", "more").
- B2: Not met. No "What this table tells us"; the paragraphs after it carry the content in prose.
- B3: Partly met: the table follows the mass control and has a reference, but no "Published value / How yours compares" columns nor a "trial values" closing line.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module; the relation of 4 x mass to twice the ring is in the module and test :52 "grows as the square root of the mass").

## Rule C
- C1: Mostly met. Picture 1 labels "Earth", "Galaxy cluster (the lens)", "Distant galaxy (the source)", "light rays", "light bends toward it here" (:484-512); Picture 2 labels "Cluster", "Observed ring", "Visible matter only", a ring label for the chosen ring and a scale bar "20 arcseconds" (:549-581); Picture 3 title and axes, "Your chosen mass" (:600-668). Not confirmed: the two yellow dots (described only in the caption).
- C2: Met. The gold ring and gold dot move with the mass; the bend in Picture 1 grows with mass (:~700).
- C3: Met in form. "How to read these diagrams" (:676) sits beneath all three pictures; the pictures and caption appear only after predictions are submitted (:441).
- C4: Mostly met. Per-picture sections, each element and colour named, the arcsecond defined in the intro (:~214-220) and again in Picture 3's bullet (:~751-753), the exaggerated bend admitted, what is not to scale. Short bullets. Playback order is described ("light travels first, then the ring").
- C5: Partly met. Real numbers in the caption: the real bend "about N arcseconds" (:~706) and the 20 arcsecond scale bar; the worked calculation is in Results, not the caption.
- C6: Not met. Items are "Compare" / "To read ..." sentences, not Look at / What it means / Why it matters.
- C7: Not met. Picture 3's first bullet states "four times the mass makes a ring only twice as wide" (:~747-749) and "rises quickly and then flattens", which is the answer to Prediction 2, and Picture 1's last bullet says "a heavier cluster visibly bends the rays more" (:~708-711), leaning toward Prediction 1's answer, both before the run.
- C8: Mostly met. Galaxy cluster, lensing, lens, source, Einstein ring, arcsecond, solar mass defined before use (:208-220); "Mpc" is used in the Results box without a definition (assumed from Experiment 1); "visible matter / dark matter" reused from Experiment 4.

## Other findings
- O1: None found against the specification in what was read (the spec confirms 47 arcseconds and the distances).
- O2: Unsourced in the text: the coin-at-2-km comparison (:~218-220; an arcsecond figure that can be checked), the wine-glass comparison, "hundreds or thousands of galaxies" and the "15% average for real clusters" (flagged as approximate in Results). The statement that the measured ring is "for a real cluster (Abell 1689)" rests on the specification. No links list.

## What an update would touch, and its size
GravitationalLensingExperiment.tsx, GravitationalLensingTutor.tsx, src/physics/gravitationalLensingExperiment.ts and test, specification 07-gravitational-lensing.md. Size **M**: guess ring and point on two pictures, module functions for them, reading column and "What this table tells us", caption rewrite (remove reveals, add three-part items).

## Not checked
Browser rendering; control block and prediction state line numbers (approximate); the tutor's explanation text; how the ring labels collide at small sizes; the specification's decisions table.

---

# Re-read, 2026-11-15 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked by hand with node from the module's formula (nothing left in the repo) and are not yet in a test.

**Answered in advance by the owner (2026-11-15):** "defaults for all questions" (given before this list was written, so every suggested default below is the answer taken), and the owner's instruction: *the concept is a bit hard to understand, so make the introduction detailed and explanatory in simple terms, use as many resources as needed, and give up-to-date information.*

## What the module returns (hand-checked, D_l 630, D_s 1730, D_ls 1480 Mpc)
| Mass (solar masses) | Ring radius (arcseconds) |
|---|---|
| 1 × 10¹³ | 10.5 |
| 3 × 10¹³ (visible only, 15% of 2 × 10¹⁴) | 18.2 |
| 1 × 10¹⁴ | 33.2 |
| 2 × 10¹⁴ | 47.0 |
| 4 × 10¹⁴ | 66.5 |

1. **Running the formula backward, a 47-arcsecond ring needs 2.0 × 10¹⁴ solar masses; 45 arcseconds needs 1.8 × 10¹⁴.** The specification's "published 1.9 × 10¹⁴ within about 45 arcseconds" is **not verified by this audit** (see "Sources").
2. **The observed ring is 2.58 times as wide as the visible-only ring and needs 6.66 times the visible mass.** The tutor's "2.6 × 2.6 ≈ 6.7" matches (6.66 rounds to 6.7).
3. **Four times the visible mass gives a ring of 36.4 arcseconds, exactly double 18.2; four times 2 × 10¹⁴ would be 94.1, beyond the slider's top (66.5).** The Results already says "more than the slider allows" for such a case.
4. **The bend at the ring's edge is 54.9 arcseconds for the observed ring** (θ × D_s ÷ D_ls = 47 × 1730 ÷ 1480), and the closest approach is about 144 kiloparsecs (4.4 × 10¹⁸ km). The caption's "about 55 arcseconds" is right.
5. **The three fixed distances check out against the stated situation** (a flat universe, H0 = 70, a matter share of 0.3, the cluster at redshift 0.18, the source at redshift 2): 626, 1727 and 1480 Mpc by a direct integral, against the module's rounded 630, 1730 and 1480.
6. **The page's one-centimetre coin at about two kilometres is right:** 1 cm spans one arcsecond at 2.06 km.
7. **The cosmic baryon fraction worked from Planck's own numbers** (Ω_b h² = 0.0224, H0 = 67.4, Ω_m = 0.315) is 0.1565, about 15.7 percent; Gonzalez and others (2013) find massive clusters' baryon fractions about 7 percent below the universal value, which gives about 14.6 percent. Both are my arithmetic on read numbers, and neither page states "about 15 percent".

## Corrections to the 2026-11-02 report
- **C7 and the introduction.** The old introduction does not state a guess's answer. But it says in its assumptions that the observed ring is "about 47 arcseconds" and the visible share "about 15%" (`GravitationalLensingExperiment.tsx:271-275`) before the learner has guessed or run, and the preset buttons read "Visible matter only (stars and hot gas, about 15% of the total)" and "Visible plus dark matter (the observed total)" (`:366`, `:375`). Those hand the conclusion ("most of the mass is unseen") to the learner before the tutor asks "What might explain the difference?". Default: hold the numbers until after the run.
- **Results answers the tutor's conceptual question first.** "A simple calculation" gives 2.6 times as wide and 6.7 times the mass (`:835-846`) and "A second line of evidence for dark matter" says the cluster holds "about 6.7 times more mass than we can see" (`:853-860`), before the tutor asks (`GravitationalLensingTutor.tsx:81-82`).
- **Results gives verdicts.** "so your prediction was right / off" for both guesses (`:810-812`, `:826-828`), and "That is exactly twice as wide" before the tutor.
- **The first Run lies on one ring.** The default mass is the observed total (`:97`, `:113`), so the gold ring lies exactly on the green ring (the caption says so, `:738-739`): two drawings of one thing. Part 1 should be fixed on the real cluster, with the learner's mass in Part 2.
- **Parts 2 to 4 vanish when the mass changes.** `handleModeChange` and the slider call `setStatus('idle')` (`:119`, `:401`), which hides Results and unmounts the tutor, and each Run remounts the tutor from its first question (`key={runCount}`, `:900`).
- **"Change predictions" appears only after the guesses are locked** (`:333-352`) and reopens both questions without clearing the mass or the results. The standing rule replaces it with an always-visible "Start over".
- **No render test exists** for this experiment (`src/components` has `GravitationalLensingExperiment.tsx` and `GravitationalLensingTutor.tsx`, no `.test.tsx`; Cosmology 1 to 6 each have one).
- **Heading** "Experiment 7 — Gravitational Lensing" (`:200`) has no group name; it would read **Cosmology 7: Gravitational Lensing**. Cross-references say "Gravity and Curved Spacetime Experiment 8", "Experiment 4", "Experiment 1" (`:211`, `:217`, `:245`, `:268`), to be checked against the sidebar names.
- **Date.** Nothing says "as of" any date; the owner asked for up-to-date information (§29 rule 1 style).
- The intro's old "Why even ask this" and wine-glass picture are neutral about the guesses and kept in spirit.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the mass buttons, Run, the readout, three pictures, the caption and Results (`:202-893`); the tutor is a second card | Part 1 (guesses, Run, the pictures of the real cluster), Part 2 (the mass control and its drawings), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run; Start over
Parts 2 to 4 appear only while `status === 'complete'` and vanish when the mass changes: **partly met**, the same defect as Cosmology 1, 2, 4, 5 and 6. Suggested fix as before: after the first Run, Parts 2 to 4 stay; a changed mass changes only Part 2's drawing and the amber row until its own Run; the tutor is not remounted. **"Start over" replaces "Change predictions"** (always visible, greyed out until a guess or a run exists and while a run plays; it clears everything).

## Predictions and where their answers live (A5, sharpened)
Both answers live on pictures that exist (A5 met), so **no new picture is needed**.
- **Guess 1 (more mass: larger, the same size or smaller ring):** the real answer is the green observed ring against the blue visible-only ring on the sky picture (47.0 against 18.2 arcseconds), and the two points on the graph. Suggested: a white **marker** on the sky picture: an arrow starting on the blue ring pointing outward ("larger"), inward ("smaller"), or a ring on it ("the same size"), in a YOUR GUESS box. **Marker only** (three answers carry no size); the caption says so. Drawn after the run.
- **Guess 2 (four times the mass: four times as wide, twice as wide, about the same):** this one has a size. Suggested: a white ring at the guessed multiple of the visible-only ring's radius (4 × 18.2 = 72.9, 2 × 18.2 = 36.4, 1 × 18.2 = 18.2 arcseconds), with a white point on the graph at four times the visible mass. The real counterpart is drawn beside it in **another colour and called "imagined"**: a ring of 36.4 arcseconds "for four times the visible mass", and its point on the graph curve. Both drawn after the run, each in a YOUR GUESS box.
- **Where the real picture comes from.** *Measured:* the observed ring, about 47 arcseconds (Abell 1689; a given value, source to be read; Broadhurst and others 2005 give an Einstein radius of "approximately 50" arcseconds for the giant arc). *Calculated here:* the blue visible-only ring (15 percent of the observed mass), the gold ring and curve, the bend angle, the formula; the distances 630, 1730 and 1480 Mpc (rounded, for a cluster at redshift 0.18 and a source at redshift 2). *Imagined for the question:* the "four times the visible mass" ring and point, the round cluster with a perfect line-up, and, in Part 2, your own mass.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: galaxy cluster, gravitational lensing, lens, source, Einstein ring, arc, multiple images, strong lensing, weak lensing, microlensing, arcsecond, arcminute, degree, solar mass, megaparsec (Mpc), light-year, visible matter, dark matter, redshift (only if the page uses it). Formulas with worked examples from the page's numbers: the arcsecond (1/3600 of a degree; a 1 cm coin at 2.06 km); the ring radius formula θ = √(4GM/c² × D_ls ÷ (D_l × D_s)) with its worked case; the real bending angle 4GM ÷ (c² b). **Held back until after the run (§12):** the ring formula and its square root (it gives guess 2's answer away) and the mass inside the ring.
- **"Want to know more?" links (new).** None exists. Read by helpers on 2026-11-15 (so far only through summaries): NASA Hubble "Gravitational lenses" (page date 6 August 2026); ESA/Hubble wordbank "gravitational lensing"; ESA/Hubble "Abell 1689" (opo1037a, 2010) and NASA "Biggest zoom lens in space" (2003, updated 2025); Broadhurst and others 2005 (arXiv astro-ph/0409132); the IAU glossary's arcsecond; ESA's Euclid Einstein ring (10 February 2025); ESA's Euclid strong-lens catalogue (19 March 2025); ESA/Webb "Cosmic Gems arc" (2024); ESA's COSMOS-Web lenses (30 September 2025); the COSMOS collaboration's Webb dark matter map (10 February 2026); after the run: Chandra and Clowe and others (2006) on the Bullet Cluster, Gonzalez and others (2013), Planck 2018. **Gaps (§29 rule 3(c)):** no official page read says the "about 15 percent" visible share of a cluster, or that lensing "does not say what dark matter is made of"; no source for the wine-glass picture; Walsh, Carswell and Weymann (1979), the first lens, did not load and was not read (the Nature page redirects to a login, ADS returned 405), so the page does not state its details; the NASA Hubble 2026 page's 1919 account is the only history read.

## Wording and claims to check (new and restated)
- **"About 47 arcseconds, measured for Abell 1689"** (module `OBSERVED_RING_ARCSECONDS`, intro `:272`). The specification cites a published 47.0 ± 1.2 from a web search of 2026-10-07 that is not recorded with a source. Broadhurst and others (2005) say "approximately 50" arcseconds "based on the radius of curvature of a giant low surface-brightness arc", with no source redshift stated in what was read. **A change to the constant is a physics decision**, so the default keeps 47 as "a given, rounded value" and says published estimates are about 47 to 50.
- **"Published 1.9 × 10¹⁴ solar masses within about 45 arcseconds"** (specification). Not found in what was read; the helper's 2.2 × 10¹⁴ is its own arithmetic from a mass-to-light ratio and is not used. The check-up shows the page's own 2.0 × 10¹⁴ as "calculated here only".
- **"About 15 percent visible"** (module `VISIBLE_MASS_FRACTION`). Supported only through my arithmetic on Planck and Gonzalez and others; the default words it "about 15 percent, worked out here from two papers" and keeps the constant.
- **"Hundreds or thousands of galaxies"** (intro `:210`). ESA says Abell 1689 has "about 1,000 galaxies and trillions of stars"; a cluster in general is "hundreds to thousands" (no page read). The default uses ESA's number for Abell 1689.
- **"2.2 billion light-years" (ESA) against the page's 630 Mpc.** 630 Mpc is an angular-diameter distance (about 2.05 billion light-years) and ESA's figure uses a different convention. The page does not set them side by side.
- **The wine-glass picture, the square garden and the shelf-sag picture** are Claude's own pictures with no source.
- `onComplete` fires on every Run; not harmful.

## B1 to B3, recommendation
Suggested **check-up table** (amount-independent rows):
- (a) **The ring the visible matter alone would make against the observed ring:** 18.2 against 47.0 arcseconds. Reading: "less, by 28.8". The observed ring is a given value (about 50 in Broadhurst and others).
- (b) **The mass inside the observed ring, running the formula backward:** 2.0 × 10¹⁴ solar masses. No outside value read. Reading: "calculated here only".
- (c) **The page's visible share (15 percent) against a figure worked out from two papers (about 14.6 percent):** reading "more, by about 0.4 points", marked "worked out here from read numbers".
- (d) **Four times the visible mass against the visible-only ring:** 36.4 against 18.2, exactly double. Reading: "calculated here only" (a result of the formula, not a measurement).
"What this table tells us" under each. **Setting-following table (item 3):** the existing three-row rings table follows the control; add "Published value" and "How yours compares" columns for the ring (47 given, about 50 in Broadhurst) and a "What your numbers show" paragraph in trial values, because the observed ring does not move with the control. **The learner's guesses** shown beside the results with a tag on the row (guess 1 at the visible-only and observed rows, guess 2 at the four-times row).

## Updated size
**Medium to Large** (was Medium). A long, up-to-date and explanatory introduction with a "Lensing today" section, two white marks on the sky picture and the graph with an imagined counterpart, the page in four Parts with Part 2's amber drawings, a check-up with a reading column, a words box, about 15 links, a tutor that marks both guesses, and a new render test file. **No change to approved physics.**

## Questions, each with the default taken (the owner said "defaults for all questions")
1. **Part 1 fixed on the real cluster** (observed total, 47 arcseconds), no mass control; the learner's mass and a gold ring in Part 2. *Default: yes.*
2. **Guess marks as above** (guess 1 an arrow or ring on the blue ring; guess 2 a white ring at 1×, 2× or 4× the visible-only ring and a graph point, with an "imagined" four-times-the-visible-mass ring and point). *Default: yes.*
3. **Introduction:** long, detailed, simple, with the owner's new instruction; holds back the 47, the 15 percent and the square-root rule until after the run; says "as of November 2026". *Default: yes.*
4. **Results:** move the verdicts, "exactly twice as wide", "A simple calculation" and "A second line of evidence for dark matter" to the tutor; keep the tables and numbers; show both guesses with tags. *Default: yes.*
5. **Check-up rows (a), (b), (c), (d)** as above. *Default: yes.*
6. **Setting-following table** with published value and comparison columns. *Default: yes.*
7. **47 arcseconds and the specification's 1.9 × 10¹⁴:** keep the constants; say they are given values, with published estimates about 47 to 50. *Default: keep the constants.*
8. **"About 15 percent":** keep, worded as worked out from Planck and Gonzalez and others. *Default: yes.*
9. **Links and words** as above; link only what is read; record the gaps. *Default: yes.*
10. **"Change predictions" replaced by "Start over".** *Default: yes.*
11. **Heading "Cosmology 7: Gravitational Lensing" and the sidebar's names in cross-references.** *Default: yes.*
12. **Own pictures (wine glass, garden, shelf):** keep, labelled as everyday comparisons and not sourced. *Default: yes.*

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; every source was read through helper summaries (a fetch tool that returns short extracts), so the NASA Hubble 2026 page, ESA/Hubble, Broadhurst and others, the IAU glossary, the Euclid and Webb pages, the Planck and Gonzalez figures and the Bullet Cluster pages are **not verified against the live pages**; the Walsh, Carswell and Weymann (1979) paper and the Rubin first-look page were not read; the module's 12 tests were counted and not re-run; the specification was read in full but not compared line by line with the page; line numbers are from the files as read today.
