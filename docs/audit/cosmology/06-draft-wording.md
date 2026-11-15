# Draft wording: Cosmology Experiment 6 (How Old Is the Universe?)
Date: 2026-11-15 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the sixth of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-15): **Q3 "yes, as written"** (both guess questions stay exactly as written; read here as also keeping the introduction's existing sentence "Experiment 5 showed it has slowed down and later sped up", see question B); **Q6 yes** (the ages table gets "Published value" and "How yours compares" columns and a "What your numbers show" paragraph); **Q7 "you decide what is best"** (decided below); **Q11 "How old is the universe"** (title); **defaults for all others.**

**Facts in this draft come from pages fetched on 2026-11-15 through helper agents whose fetch tool returns short, model-summarised extracts, not raw text.** Every quotation and figure marked [recheck] must be compared with the live page before it is printed. No page is linked that was not read.

## What the sources changed (read these first)
1. **The page's "oldest star clusters, about 12.5 billion years" is not supported by what was read, and the history around it is partly wrong.**
   - A 2023 study (Cimatti and Moresco, *Astrophysical Journal* 953, 149; arXiv 2302.07899) finds the selected oldest objects "older than 13.3 Gyr" (abstract), with individual clusters at 13.6 ± 0.5, 13.80 ± 0.75 and 14.9 (−0.9, +0.5) Gyr. It assumes a matter share of 0.3 and a formation redshift of 11 to 30 (so these ages are model-dependent).
   - ESA (Hipparcos press release, 1997): "Other estimates of the oldest stars assigned to them an age of 14.6 billion years"; Hipparcos investigators "arrive at an age of 11 billion years for the oldest stars". Chaboyer and others (1997): "11.5 ± 1.3 Gyr, with a one-sided, 95% confidence level lower limit of 9.5 Gyr".
   - **"About 16 to 20 billion years" (early 1990s) is not supported by anything read; ESA says 14.6. "About 12 to 13 billion years" (after Hipparcos) is not supported either; the sources say about 11 to 11.5.** Both are replaced by the sourced numbers.
   - **My decision on question 7 (yours to overrule): change the comparison marker from 12.5 to 13.3 billion years, worded "older than about 13.3 billion years (a lower limit from a 2023 study)".** It is the only recent, primary, quoted figure read. The cost: this changes the module constant `OLDEST_STARS_AGE_YEARS` (a comparison marker, **not** the age physics) and the share at which a universe passes the marker moves from about 0.61 to about **0.69** (age 13.28 at 0.685, 13.47 at 0.70). The best fit (0.70) still passes, by only 0.17 billion years, so the caption says it is a rough test. Matter only (9.31) fails by about 4.0 either way. The tests that mention 12.5 are updated; no age formula changes.
2. **The measured age gets a source.** Planck 2018 (arXiv 1807.06209), Table 2 (read in the paper's HTML copy; the abstract itself does not give the age): age **13.797 ± 0.023** billion years (TT,TE,EE+lowE+lensing), 13.787 ± 0.020 with BAO; H0 67.36 ± 0.54 (abstract: 67.4 ± 0.5); matter share 0.3153 ± 0.0073; dark energy 0.6847 ± 0.0073 (the paper says that in a flat universe a matter constraint "translates directly" into a dark energy one). **The page's "Planck-like pair" (67.4 and 68.5 percent) is therefore a rounding of the paper's values, now sourced.** NASA's WMAP page (dated 16 April 2026) says "13.77 billion years old to within a half percent". ESA's 2013 Planck page says 13.82, but it is the 2013 release and is not used as a figure.
3. **The Hubble tension gets a plain NASA page** (Hubble constant and tension, dated 4 August 2025): space-telescope measurements "around 70-76", the CMB "about 67-68", "an age for the universe of about 13.8 billion years". The page's "about 67 to 73" is replaced by NASA's two ranges.
4. **Gap (§29 rule 3(c)):** no plain official page read says that the age depends on what the universe contains, or gives "two thirds of the Hubble time" for a matter-only universe. The only page found is Wikipedia ("Einstein–de Sitter universe": "its current age 2/3 times the Hubble time"), which is not official and is **not linked**. The introduction defines the idea in its own words and the specification will record the gap. **Also a gap:** no page read says the 1990s clash between old stars and a matter-only age "pointed toward dark energy"; **that sentence is dropped** and the history is told only with ESA's numbers. The tutor still says, as reasoning and not as history, that a universe cannot be younger than the things in it.
5. **Not used:** "9.3 billion years" is not stated on any page; it is this page's own calculation, labelled "calculated here".

## Layout
- **Above Part 1 (no heading):** the introduction (as written, with the changes listed below), a "Want to know more?" list, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the two guesses (unchanged); **Start over** (always visible); **Run**; one graph with the purple, blue and **green** (astronomers' best fit, 70 percent) lines; white guess marks after the run; "Where the real picture comes from"; one caption.
- **Part 2 (pink), "Now try it yourself":** the share control (none, best fit, custom 0 to 90 percent), its own graph with an **amber** line for the learner's share, the readout, its own caption.
- **Part 3 (teal), "The results":** Table 1 (a check-up), Table 2 (the ages, with "Published value" and "How yours compares"), Table 3 (which values give 13.8), "What this table tells us" under each, "What your numbers show", the learner's guesses beside the results.
- **Part 4 (blue), "The tutor":** three questions, then the explanation, marking each guess.
- **Why Part 1's line is green and not gold (new, for approval):** at the starting best fit the old gold line is the astronomers' result. Gold stays only as the colour of the learner's own share, now **amber**, in Part 2 (the Cosmology 5 pattern). **Parts 2 to 4 appear after the first Run** and stay when the share changes.

---

## 1. Introduction (above Part 1)

**Title:** Cosmology 6: How Old Is the Universe? *(was "Experiment 6 — How Old Is the Universe?"; the sidebar's own title "The Age of the Universe" is left to the owner, question C)*

**Kept as written (Q3):** "The question", "What happens", "A new term: the universe's relative size", "What 'older' and 'younger' mean here", "A daily-life picture" (the bathtub), "Your job". Changes inside them:
- Cross-references named for the sidebar: "the Big Bang experiment (Cosmology 2)", "Cosmology 5 (Dark Energy)", "Cosmology 1 (Hubble's Law)".
- "What happens": "…the graph shows how big the universe has been at every moment since the Big Bang, in three versions…" is rewritten for the new layout: "**In Part 1** you will see how big the universe has been at every moment since the Big Bang, in three versions: Experiment 2's constant-speed picture, a universe with only matter, and the universe astronomers' measurements point to (about 70 percent dark energy). **In Part 2** you choose a share of dark energy yourself."
- "What to look for" loses "Move the dark energy share and watch how the gold line's end point moves" (now in Part 2) and the clause "We reuse dark energy, redshift, ..." becomes "We reuse **dark energy**, the **Hubble time** and the **Big Bang** from earlier experiments, with the same meaning." (**redshift** dropped: this page does not use it.)

**New: "How this page is laid out."** "Below this introduction the page has four parts. **Part 1** is where you guess and watch. **Part 2** is where you try your own settings. **Part 3** shows the results and what they mean. **Part 4** is the tutor. Parts 2, 3 and 4 appear when your first run has finished."

**New: "Your guesses and the real pictures."** "Your guesses never change the real pictures or tables. They are drawn on the real picture in **white**, in a box labelled YOUR GUESS, and shown again beside the results. The real pictures come from the physics. The share of dark energy you choose in Part 2 does change the amber line and the amber rows of the tables, but never the blue, purple or green ones."

**Assumptions (kept, with three changes):**
- Bullet 2 now reads: "The Hubble constant is the same illustrative value as in Cosmology 1 (70 km/s per megaparsec). Real measurements disagree a little, which is called the **Hubble tension**: as of November 2026, NASA says space-telescope measurements give around 70 to 76 and measurements from the cosmic microwave background about 67 to 68. The real measured age (about 13.8 billion years) comes from the lower value and a slightly lower dark energy share, which the results will show."
- Bullet 5 now reads: "The real measured age is a given value, not worked out here. The age of the oldest known star clusters is used only as a comparison marker: a 2023 study finds the oldest ones older than about 13.3 billion years, a figure that depends on the model the study used."
- **New bullet:** "The dark energy here is **constant** (it never changes). As of November 2026 some recent measurements hint that it may change with time; Cosmic Horizons has an experiment on that. This page does not try that idea."

**Some new words (line):** "age of the universe, relative size, expansion history, flat universe, Hubble tension, star cluster. Each is in the Words and formulas box below."

*(§12 check: the introduction still says, as approved, "Experiment 5 showed it has slowed down and later sped up" and both guess questions keep their premises, at the owner's instruction. Nothing new is added that says "shorter" or "older". The "two thirds" fact and the history are held for the tutor and Part 3.)*

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)

1. **Planck Collaboration (2018): cosmological parameters** — `https://arxiv.org/abs/1807.06209` — "The paper behind the most precise measurements of the universe's age (about 13.8 billion years), its expansion rate and its matter and dark energy shares. A technical paper; the table of parameters is the part to look for." *(abstract and Table 2 read; the age is in the table, not the abstract)*
2. **NASA WMAP: mission overview** — `https://science.nasa.gov/mission/wmap/wmap-overview/` — "NASA's page on the WMAP mission, which measured the universe's age at about 13.77 billion years and its make-up (about 5, 25 and 70 percent)." *(read; dated 16 April 2026; it does not explain how the age is worked out)*
3. **NASA: The Hubble constant and the tension** — `https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/` — "NASA's plain page on why two ways of measuring the expansion rate disagree, and how that rate gives an age of about 13.8 billion years." *(read; dated 4 August 2025)*
4. **ESA: Hipparcos revises the scale of the cosmos (1997)** — `https://sci.esa.int/web/hipparcos/-/37087-info-04-1997-esa-s-hipparcos-satellite-revises-the-scale-of-the-cosmos` — "ESA's 1997 announcement that the Hipparcos satellite's distances made the oldest stars younger than thought. Written as news of its time, so its numbers are old." *(read)*
5. **Chaboyer and others (1997): the ages of globular clusters** — `https://arxiv.org/abs/astro-ph/9706128` — "A technical paper working out how the new Hipparcos distances lower the ages of the oldest star clusters. The abstract is the readable part." *(abstract read)*
6. **Cimatti and Moresco (2023): the oldest stars as a clock** — `https://arxiv.org/abs/2302.07899` — "A recent paper that uses the oldest star clusters and stars to set a lower limit on the universe's age (older than 13.3 billion years). A technical paper; the abstract is the readable part." *(abstract read; page at iopscience.iop.org also read)*
7. **NASA: What is dark energy?** — `https://science.nasa.gov/universe/the-universe-is-expanding-faster-these-days-and-dark-energy-is-responsible-so-what-is-dark-energy` — "NASA's plain explainer on dark energy, the ingredient that changes the age. The same page is linked from Cosmology 5." *(read for Cosmology 5; to be re-read before printing)*

**Gaps (§29 rule 3(c)), searched 2026-11-15:** no plain official page was found that explains **how the age is worked out from the expansion history** or that **the age depends on the contents** (tried: NASA's old WMAP age page, which redirects to the overview above; `science.nasa.gov/universe/how-old-is-the-universe/`, which returned 404; the NASA visualisation page `svs.gsfc.nasa.gov/30133/` was seen only as a snippet and is not linked); the **Hipparcos-to-dark-energy link** is not on any page read. Not tried: a NASA Universe 101 "fate of the universe" page. The ESA 2013 Planck page (13.82 billion years) was read but is older data and is not linked.

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses. Then you will press Run and watch one graph being drawn: three lines showing how big the universe has been since the Big Bang, one for each of three versions of the universe. Your guesses are drawn on the graph in white. Nothing you guess changes the real graph."

**Guess 1 and Guess 2: exactly as written (Q3).** Guess 1: "If the universe contained only matter, so gravity has been slowing the expansion all along, would its age be longer than, shorter than, or the same as Experiment 2's constant-speed estimate (about 14 billion years)?" Longer / Shorter / The same. Guess 2: "Dark energy speeds the expansion up in recent times. Compared with a matter-only universe, would adding dark energy make the universe older, younger, or the same age?" Older / Younger / The same age.

**Locked line (after Run):** "Your guesses are locked while you try other settings. To change them, press Start over." **Start over** replaces "Change predictions": always visible, greyed out until a guess is chosen or a run exists and while a run plays; it clears the guesses, runs, results and tutor, and returns the page to its first state.

**Run:** one run plays nine seconds (fixed; playback speed never changes the result, §11). Before Run the graph is **not drawn at all** (no legend, no grey line, no "today's size" line). At Run the axes and the "today's size" line appear, the three lines are drawn from the Big Bang to their end dots (purple, blue, green), and each dot gets its age label when reached. The grey "oldest star clusters" line appears when the run ends, with the white guess marks.

**On-canvas labels (new or kept):** title, axis titles, "today's size", the legend (kept, "Gold" becomes "Green: astronomers' best fit (about 70% dark energy)"), the dots' labels with their ages (kept); **new:** "calculated here" under each legend entry; the grey line's label rewritten (see the caption).

**White guess marks (drawn when the run ends; each with a "YOUR GUESS" box joined by a line):**
- **Guess 1:** a white arrow starting at the **purple dot** and pointing **left** for "Shorter", **right** for "Longer", with a white ring around the purple dot for "The same". Box: "YOUR GUESS: matter only is shorter than / longer than / the same as this".
- **Guess 2:** the same kind of white arrow starting at the **blue dot**: pointing **right** for "Older", **left** for "Younger", with a ring for "The same age". Box: "YOUR GUESS: dark energy gives an older / younger / the same age as this".
- **Markers only.** The arrows have a fixed length and are not your numbers; they show only which side of the dot you guessed. The caption says so. The arrows are drawn below the "today's size" line so they do not cover the age labels.

**Where the real picture comes from (under the graph).**
- "**Calculated here:** all three lines and every age on them, from the formulas in the Words and formulas box, for a flat universe with matter and a constant dark energy and the page's 70 km/s per megaparsec. **The green line is a calculation at 70 percent dark energy, not a plot of measurements.**"
- "**Measured (by others):** the oldest known star clusters are older than about 13.3 billion years (a lower limit from a 2023 study by Cimatti and Moresco, which depends on the model it used). It is given here, not worked out."
- "**Imagined for the question:** the matter-only universe (we cannot visit one), Experiment 2's constant-speed line (a simplified picture), and, in Part 2, your own share of dark energy."
- "**Your guess:** the white marks only."

### Caption: How to read this diagram *(beneath the graph; each section appears as its feature is drawn)*

**The graph.** "The graph tells the story of how big the universe has been at each moment since the Big Bang. It asks one question of each version of the story: when does it reach the size the universe has today? That moment is the **age** of that universe."
- "**Across the bottom is time**, counted from the Big Bang (far left), in billions of years. Moving right means later. ('A billion years' is 1,000,000,000 years.)"
- "**Up the side is the universe's relative size:** how far apart galaxies were compared with today. The dashed line at 1 is 'today's size'. A height of 0.5 means galaxies were half as far apart as now; 0 is the Big Bang. It is not the size of any physical object."

**The three lines.** "All three start together at size 0 at the Big Bang."
- "**Purple dashed line:** Experiment 2's picture, in which the universe grew at one constant speed. It is a straight line."
- "**Blue line:** a universe containing only matter."
- "**Green line:** a universe with about 70 percent dark energy, the value astronomers' measurements point to (a rounded value; NASA's WMAP page gives about 70)."

**The dots.** "Each line stops at a dot on the 'today's size' line. The dot marks the moment that version reaches today's size. **The number in its label is that version's age**, in billions of years. The farther right the dot, the older the universe. The labels are at different heights only so they do not overlap."

**The grey dotted line** *(appears when the run ends).* "It marks about **13.3 billion years**, a lower limit for the age of the oldest known star clusters from a 2023 study. A universe cannot be younger than the things inside it, like a pot that cannot have been boiling for longer than the stove has existed. So a dot to the **left** of the grey line describes a universe too young to be the real one. A dot to the right passes the test, but that only shows it is not too young, not that its age is exactly right. The 13.3 depends on the model the study used, so treat the line as a rough test."

**The white marks** *(appear when the run ends).* "The white arrows and rings are **your guesses**. They are only markers: the arrow's length means nothing as a number, and the rings stand for 'the same'. They do not say right or wrong."

**A worked moment (real numbers).** "Look at the blue dot. The universe in that version reaches today's size after **9.31 billion years**. Why that number? Experiment 2's Hubble time is 13.97 billion years, and for this version the page's calculation gives (2 ÷ 3) × 13.97 = 9.31. The green dot sits at **13.47**, the purple at **13.97**."
*(Held back until after the run (§12), because it gives guess 1's answer away: the words "two thirds" and the sentence "Why that number?". Before the run the worked moment would show only the three dots and their numbers. In the finished page the full worked moment appears when the dots are drawn, i.e. after the run has begun; the guess is locked by then. **Owner to rule, question D.**)*

**What to look for** *(each item appears once its feature is drawn)*
1. **Look at** the three dots on the 'today's size' line. **What it means:** purple 13.97, green 13.47 and blue 9.31 billion years: three different ages from three different stories of the expansion. **Why it matters:** the age depends on the whole history of the expansion, not on today's speed alone, and today's speed is the same in all three.
2. **Look at** how steeply each line rises at the start. **What it means:** at 4 billion years the blue line is already at 0.57, the green line at 0.39 and the purple line at 0.29. **Why it matters:** the blue universe is biggest early, so it has the shortest way to go and gets to today's size first.
3. **Look at** the grey dotted line against the blue dot. **What it means:** the blue dot (9.31) is about 4.0 billion years to the left of the grey line (13.3). **Why it matters:** a universe younger than the stars inside it cannot be the real one.
4. **Look at** the green dot against the grey line. **What it means:** 13.47 is to the right of 13.3, by only 0.17. **Why it matters:** this universe passes the test, but narrowly, which is why the line is only a rough test.
5. **Look at** the white marks. **What it means:** each shows which side of its dot your guess was on. **Why it matters:** you can compare your guess with the real graph directly; the tutor goes through each guess in Part 4.

*(Not stated here, held for the tutor: why matter makes the expansion slow down; why dark energy makes the universe older; that the straight line was close by coincidence; the verdict on both guesses.)*

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now you choose how much dark energy the universe has. Press Run and an amber line is drawn for your choice, beside the blue, purple and green lines from Part 1. Your guesses do not change anything in this part; your settings do."

**Control.** "Share of the universe's energy that is dark energy:" **None (matter only)** / **The best fit to observations (about 70%)** / **Custom** (a slider, 0 to 90 percent). A choice changes the amber line and the readout only after its own **Run**; Parts 2 to 4 stay on screen.

**Note beside the control (new):** "Your guesses do not change the drawings or the tables. These settings do, but only the amber line and the amber rows. While the setting is on the best fit, the amber line lies on the green one, so change it to see the amber line move."

**Readout (as now):** share; age; matter-only age; Hubble time; "This universe is older / younger than the oldest known star clusters (older than about 13.3 billion years)." *(the old "about 12.5" is replaced).*

**Graph:** the Part 1 graph without the white marks, with the amber line and an amber dot with its age label. **Caption** ("How to read this diagram", short): what amber means; the readout; "**Look at** where the amber dot lands against the grey line. **What it means:** the amber dot is left of the grey line when the share is below about 69 percent. **Why it matters:** below that share this model's universe is younger than the oldest stars, so it cannot be the real one." **Where the real picture comes from:** *calculated here:* the amber line; *imagined:* the share you choose.

---

## 5. Part 3: The results (teal)

**Lead.** "These are the results of your first run, with what each table means. The ages come from the physics and do not change with your guesses; only the amber rows follow your settings in Part 2."

**The learner's guesses beside the results** (a small block above Table 1): "You guessed: matter only would be **[Longer / Shorter / The same]** than Experiment 2's constant-speed estimate (tag on Table 2, row 'Matter only'). You guessed: adding dark energy would make the universe **[Older / Younger / The same age]** (tag on Table 2, row 'Your universe'). This shows only your guess; the tutor goes through it in Part 4." *(guess only, no "matched", §12, §13)*

### Table 1: a check-up
| What we compare | Calculated here | Published | Reading |
|---|---|---|---|
| (a) The best fit's age against the measured age | 13.47 billion years | 13.797 ± 0.023 (Planck 2018) | less, by 0.33 |
| (b) The Planck-like pair (H0 67.4, 68.5% dark energy) against the measured age | 13.80 | 13.797 ± 0.023 | the same, to the digits shown |
| (c) Matter only against the oldest star clusters | 9.31 | older than about 13.3 (2023 study; depends on its model) | less, by about 4.0 |
| (d) Experiment 2's Hubble time against the measured age | 13.97 | 13.797 ± 0.023 | more, by 0.17 |
| (e) Matter only against the Hubble time | 9.31 against 13.97 (ratio 0.667) | none read (the page's own calculation) | less (two thirds); calculated here only |

**What this table tells us.**
- **(a)** *What it is:* the age the page's model gives for 70 percent dark energy and 70 km/s, beside the age Planck found. *What it means:* 13.47 is 0.33 billion years less than 13.797, and Planck's own uncertainty is 0.023. *Why it matters:* the model is the right shape but with rounded inputs (70, not 67.4), so it lands close but not on the published number. Row (b) shows why: use the published inputs and the gap goes.
- **(b)** *What it is:* the same formula with the values that the Planck paper gives (67.36, rounded to 67.4, and a dark energy share of 0.6847, rounded to 68.5 percent). *What it means:* 13.796 against 13.797. *Why it matters:* the simple model you are using is the real model for the age; only its inputs were illustrative. (The two are the same to the digits shown; a different rounding would shift the last digit.)
- **(c)** *What it is:* the matter-only age against the lower limit for the oldest star clusters. *What it means:* 9.31 against "older than about 13.3": the universe would be about 4 billion years younger than stars inside it. The 13.3 depends on the study's model (it assumed a matter share of 0.3), so it is a rough test. *Why it matters:* a universe cannot be younger than its own stars, so this version cannot be the real one, whatever the exact figure.
- **(d)** *What it is:* the straight-line estimate from Cosmology 2. *What it means:* 13.97 is 0.17 more than 13.797, about 1.2 percent. *Why it matters:* it is close, but the tutor asks you why in Part 4.
- **(e)** *What it is:* the matter-only age as a fraction of the Hubble time. *What it means:* exactly two thirds in this model, a result of the calculation and not a measurement; no official page read states it (§29 rule 3(c)). *Why it matters:* it is the "simple calculation" the page lets you do by hand: (2 ÷ 3) × 13.97 = 9.31.

### Table 2: the ages *(follows your Part 2 settings; the amber row)*
| Version | Your value (billion years) | Published value | How yours compares |
|---|---|---|---|
| Matter only | 9.31 | none: an imagined universe | not compared |
| Experiment 2's constant-speed estimate (Hubble time) | 13.97 | none: a simplified picture | not compared |
| **Your universe** *(amber)* | *your age* | 13.797 ± 0.023 (Planck 2018) | *less / more / the same, by …* |
| The oldest known star clusters (lower limit) | n/a | older than about 13.3 | *your universe is older / younger than this, by …* |

**What this table tells us.** *What it is:* the page's four ages, with the one row you control. *What it means:* a universe passes the star test (older than 13.3) from about 69 percent dark energy; it equals the measured 13.8 at about 72.5 percent (with the page's 70 km/s). *Why it matters:* the match to the real age depends on the inputs, not only on the share (Table 3).

**What your numbers show** *(a short paragraph that updates with your trial values)*. "With **[0% / 70% / your share]** dark energy, your universe is **[9.31 / 13.47 / …]** billion years old: **[less / more]** than the measured 13.797 by **[…]**, and **[older / younger]** than the oldest known star clusters by **[…]**. Check (c) still holds for matter only. As you raise the share, the age rises every time. **These are trial values and your own numbers. They do not say the real universe is like that.**"

### Table 3: which values give 13.8?
| Hubble constant | Dark energy | Age (billion years) |
|---|---|---|
| 70 | 70% | 13.47 |
| 67.4 only | 70% | 13.99 |
| 67.4 and 68.5% | 68.5% | 13.80 |

**What this table tells us.** *What it is:* the old "Why not exactly 13.8?" box as a table. *What it means:* lowering H0 alone overshoots (13.99); lowering both gives 13.80. *Why it matters:* the real age needs both numbers to be right. The Hubble constant is still debated (NASA, August 2025: space telescopes about 70 to 76, the microwave background about 67 to 68), so the 70 here is only illustrative.

**Removed from Results (moved to the tutor, §12):** "Checking your first / second prediction: … so your prediction was right / off"; "That is a problem… cannot be the real one"; the paragraph "Why Experiment 2's estimate came out close". **Kept:** "A simple calculation" paragraph (after the run), the "Remember" note.

**History paragraph, rewritten (Part 3, after Table 1, with sources):** "**The oldest star clusters, and a puzzle of the 1990s.** In 1997 ESA reported that the Hipparcos satellite's distances showed the oldest stars were farther away, and so brighter and younger, than thought: other estimates had given them about 14.6 billion years, and Hipparcos gave about 11. Chaboyer and others (1997) found 11.5 ± 1.3 billion years. A recent study (2023) finds the oldest ones older than about 13.3. The estimates have moved a good deal as the methods improved, which is why the page treats the marker as a rough test and not a precise figure." *(ESA 1997 and Chaboyer 1997 read; Cimatti and Moresco 2023 read; the old "16 to 20" and "12 to 13" figures are gone. The old sentence about dark energy and the 1990s is dropped (gap).)*

---

## 6. Part 4: The tutor (blue)

**Lead.** "The tutor asks you three questions about what you saw, then explains it and goes through your two guesses."

- **Observe:** "Look at where each line reaches size 1 on the graph. What do you notice about the blue line (matter only), the purple dashed line (the constant-speed picture) and the green line (astronomers' best fit)? Look at the white marks too: where did each one sit against its dot?"
- **Compare:** "You guessed that a matter-only universe would **[be older than / be younger than / be the same age as]** Experiment 2's constant-speed estimate, drawn as the white arrow at the purple dot, and that adding dark energy would **[make the universe older / younger / leave it the same age]**, the white arrow at the blue dot. What do you notice when you compare each white mark with the real dots?"
- **Conceptual (kept):** "Experiment 2's straight-line estimate came out close to the real age, even though the real expansion rate has changed. Why might it have turned out so close?"
- **Explanation:** the seven approved points are kept as written, with **three changes**: (i) each guess is marked in its point: point 2 starts "You guessed [X] for the white arrow at the purple dot: this **[matches / does not match]** what the graph shows: the blue dot is at 9.3, left of the purple dot at 14.0" and point 3 starts the same way for the arrow at the blue dot (the green dot at 13.5 sits right of it at 9.3); (ii) point 4 now reads "…gives about 13.8 billion years, matching the measured age (Planck 2018: 13.797 ± 0.023)"; (iii) point 6 now reads "…it would be younger than the oldest known star clusters (older than about 13.3 billion years, from a 2023 study), so it cannot be the real one", and the 1990s history is left to Part 3. *(Marking text is decided by the module from the learner's choice, not typed into the component.)*

---

## 7. Words and formulas (collapsed box above Part 1)
**Entries (plain meaning each):** age of the universe; Big Bang; Hubble constant; Hubble time; Hubble tension; relative size; expansion history; flat universe; matter; dark energy; radiation; inflation; star cluster ("a ball of hundreds of thousands of stars that formed together; the oldest are among the oldest things we can date"); billion years.
**Formulas with worked examples:**
- **Hubble time** = 1 ÷ H0. At 70 km/s per megaparsec this is 13.97 billion years.
- **Age of the universe with dark energy share L** (flat universe): age = Hubble time × (2 ÷ (3 × √L)) × asinh(√(L ÷ (1 − L))). Worked case at L = 0.70: √0.7 = 0.837; 2 ÷ (3 × 0.837) = 0.797; √(0.7 ÷ 0.3) = 1.528; asinh(1.528) = 1.2095; so 13.97 × 0.797 × 1.2095 = 13.47 billion years. *(The module checks this closed form against a direct numerical integral.)*
**Held back until after the run (§12):** the matter-only case "(2 ÷ 3) × Hubble time = 9.31" and the sentence that adding dark energy raises the age; both are in Part 3 and the tutor.

---

## 8. Source table (for the specification's "Audit Update")
| Idea or number | Source | Read? | Date |
|---|---|---|---|
| Age 13.797 ± 0.023 (13.787 ± 0.020 with BAO); H0 67.36; matter 0.3153; dark energy 0.6847 | Planck 2018 VI, Table 2 (HTML copy) | read (helper) | 2026-11-15 |
| H0 67.4 ± 0.5; matter 0.315 ± 0.007 | Planck 2018 VI, abstract | read | 2026-11-15 |
| Age 13.77 within a half percent; 5 / 25 / 70 percent | NASA WMAP overview (16 Apr 2026) | read (helper) | 2026-11-15 |
| Space telescopes 70 to 76, CMB 67 to 68; age about 13.8 | NASA Hubble constant and tension (4 Aug 2025) | read (helper) | 2026-11-15 |
| Oldest stars 14.6 earlier, about 11 after Hipparcos; Universe 9 to 12 | ESA Hipparcos press release INFO 04-1997 | read (helper) | 2026-11-15 |
| Oldest clusters 11.5 ± 1.3, lower limit 9.5 | Chaboyer and others 1997, abstract | read (helper) | 2026-11-15 |
| Oldest objects older than 13.3; clusters 13.6, 13.8, 14.9; assumes matter 0.3 | Cimatti and Moresco 2023 | read (helper) | 2026-11-15 |
| "16 to 20 billion years" (early 1990s); "12 to 13" (after Hipparcos) | none read | **unsupported; replaced** | 2026-11-15 |
| 1990s clash "pointed toward dark energy" | none read | **gap; dropped** | 2026-11-15 |
| Matter-only flat age = (2/3) Hubble time | Wikipedia only | **gap: no official page; not linked** | 2026-11-15 |
| How the age is worked out from the expansion history; age depends on contents | none official | **gap** | 2026-11-15 |
| Dark energy may change with time | DESI 2025 (read for Cosmology 5) | to be re-read before printing | |

## Questions for the owner on this draft
A. **The clusters marker (my Q7 decision).** Default as drafted: 12.5 → "older than about 13.3" (2023 study), the pass share moving from about 0.61 to about 0.69, the old "16 to 20" and "12 to 13" figures removed, and the 1990s history told with ESA's 14.6 and 11 and Chaboyer's 11.5. Say if you prefer to keep 12.5 or to use a different figure.
B. **Introduction sentence kept (Q3 read as "as written").** The introduction still says "Experiment 5 showed it has slowed down and later sped up". It hints at both guesses; I kept it because you said "as written". Say if you want it removed after all.
C. **Title and heading.** "Cosmology 6: How Old Is the Universe?" for the page heading, as you said. The sidebar's title is still "The Age of the Universe" and its "learned" summary is unchanged. Say if the sidebar title should change too (a change to `src/App.tsx`).
D. **The worked moment.** Default: the "two thirds" calculation appears in the caption only after the dots are drawn (the guess is locked by then). Alternative: hold it back until Part 3.
E. **Green for the best fit (Part 1), amber for the learner's share (Part 2).** Default: yes (the Cosmology 5 pattern).
F. **Part 2's caption is short** and Part 2 carries no table. Default: yes.
G. **Arrows as guess marks** (a fixed-length arrow from the dot you compare with, a ring for "the same"). Default: yes.

## What the module will need (for the physics step; tests first)
New functions in `universeAgeExperiment.ts`, each with tests, none changing an existing age function: the guess-mark data (which side and which dot, for both guesses); marking (a guess against the real result); the comparison to the published age (less / more / the same, by how much) and to the clusters marker; the check-up rows (a) to (e); the Table 3 rows; worked examples (the 13.47 case and the 9.31 case); the "What your numbers show" values; published constants (Planck age and uncertainty, 13.3, the NASA ranges). **One constant changes:** `OLDEST_STARS_AGE_YEARS` 12.5e9 → 13.3e9, with the two tests that mention 12.5 updated (matter only is younger, 70 percent older, the pass share about 0.69). A new `UniverseAgeExperiment.test.tsx` covers the interface.

## Not checked
Not built, not run, not viewed in a browser; the wording is not yet approved; helper-read sources must be re-read against live pages before printing (the Planck age is from the paper's HTML copy; all the pages' quotes came through a summarising fetch tool); the links were read by helpers but their loading was not separately checked by me today; the worked numbers (13.47, 9.31, 0.57 / 0.39 / 0.29 at 4 billion years, the 0.69 and 72.5 percent crossings, the 13.99 and 13.80 rows) were worked by hand with node from the module's closed forms and are to be rechecked in the module; the "Words and formulas" box's other entries are listed but not written out.


---

## Revisions after the owner's review of the built page, 2026-11-15 (the built wording supersedes the matching text above)
The owner asked for more clarity in five introduction paragraphs; each was rewritten in `src/components/UniverseAgeExperiment.tsx` and approved ("everything looks good"). The text of record is the page; the specification's Audit Update summarises it.
1. **"What happens"** now says what the learner does here (two guesses, Run, a graph of three versions with a dot and an age on each line, white guess marks, then Part 2's amber line, then results and a tutor). The recap of Cosmology 2 and 5 moved to a new **"Where this comes from"** paragraph.
2. **"A new term: the universe's relative size"**: why a size in kilometres cannot be used; faraway galaxies; today as the yardstick (1); a worked example (100 million light-years apart today is 50 million at 0.5 and 25 million at 0.25); a photocopier at 50 percent; what it does not mean; how it shows on the graph. The words box entry was expanded to match.
3. **"What 'older' and 'younger' mean here"**: one real universe; compare possible universes on paper; what is kept the same (start, end, expansion speed today) and what differs (the contents); older means a longer time (12 against 10 billion years, marked "not results"; a 14-second against a 12-second race); how it reads on the graph; why bother. A first line about the real universe not being younger than its oldest things was removed (it gives the clusters verdict away). A words box entry was added.
4. **"A daily-life picture"** (the bathtub): 200 ÷ 10 = 20 minutes; when it is right; tub, level, flow, filling time, quick sum and tap history mapped onto the universe, the Hubble time and the expansion history; where the picture stops. It still says nothing about which way the tap changed.
5. **"What to look for"**: four items in Look at, What it means and Why it matters (the dots and ages, how each line rises, the white marks, Part 2's amber dot), with no result; the grey line is left to the caption.
Also: the published Planck age is shown to three decimals (13.797 ± 0.023); the history paragraph is headed "how their ages have moved"; the amber legend entry moved to the second legend row.
