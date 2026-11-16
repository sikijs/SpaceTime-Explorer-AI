# Draft wording: Cosmology Experiment 9 (How Did Galaxies Form? Growing Structure from Tiny Ripples)
Date: 2026-11-15 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the ninth of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-15): "defaults" to the fifteen questions at the end of `09-gap-report.md`, each with its default taken (Part 1 fixed on the growth graph; guess marks as proposed; guess 2 keeps the approved "partly" logic; two dashed lines; the head-start premise held back until after the run; verdicts moved to the tutor; check-up rows (a) to (e); no comparison columns; the clump line kept at 1; the drag redshift kept at 1089.8; the caption's "50 thousand years" replaced by the module's; links and words; Start over; a longer, more detailed, up-to-date introduction).

**Sources:** read on 2026-11-15 by a helper agent whose fetch tool returns short model summaries, not raw text, so every quotation and figure must be spot-checked against the live page before it is printed. No page is linked that has not been read. Worked numbers come from the module (hand-checked with a scratch script on 2026-11-15; to be put in tests).

## What the sources changed (read these first)
1. **Planck 2018 (arXiv:1807.06209, Table 2) prints the numbers the module restates:** z_star 1089.95 ± 0.27, 1089.92 ± 0.25 and 1089.80 ± 0.21 (the module's 1089.8 is the last column, with BAO); z_eq 3407 ± 31, 3402 ± 26 and 3387 ± 21 (the module's "about 3400" is within about 1 sigma of all three); z_drag about 1060 (1059.93 to 1060.01). **The draft keeps 1089.8 and 3,400 and says so in Table 1's notes.**
2. **Ordinary matter is released from the light at the baryon drag epoch, redshift about 1060, not 1089.8.** Starting from 1060 would give 826.5 instead of 849.7 (2.7 percent less). The draft keeps the module's start and says this in the check-up note for row (d) (Question 11, default: keep).
3. **The growth number has an independent check.** The Carroll, Press and Turner (1992) approximation gives 848.6; the formula is printed in the paper arXiv:astro-ph/0006089 (the 1992 paper itself was not read). **Table 1, row (a).**
4. **The clump line at 1 is the module's round number.** The standard linear collapse value is about 1.686 (arXiv:1005.0233, for a matter-only universe). The draft keeps the module's constant and says so in the tutor's limits (Question 10, default: keep). No fetched page says the linear model stops being valid as the density excess approaches 1, so the page does not say it.
5. **The old caption's "about 50 thousand years in this model" is replaced:** the module puts dark matter's start at 85,721 years, "about 86 thousand years in this model". No source for the real figure was read, so the page does not state it.
6. **Gaps (§29 rule 3(c)):** no official page says the temperature ripples of the oldest light are not the same as the matter density ripples (the COBE page calls them "density ripples" without distinguishing them; ESA says they "correspond to regions of slightly different densities"); no plain official page says ordinary matter is held smooth by light until the universe becomes transparent (only a Caltech/IPAC lecture, Lahav 2004). The draft states both as the model's own assumptions, not as sourced facts.
7. **No single official page says all of: ripples of about 1 part in 100,000, dark matter clumped first, ordinary matter followed.** The page uses three: NASA GSFC's COBE page (the size), ESA's and NASA/JPL's Planck pages (the seeds) and NASA/JPL's 26 January 2026 page (dark matter first), and says so.

## Layout
- **Above Part 1 (no heading):** a long, step-by-step introduction; a "Want to know more?" list; a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the two guesses (unchanged); Start over (always visible); Run; **Picture 1, the growth graph** (both kinds of matter, two dashed "without dark energy" lines, no starting size); white guess marks after the run; "Where the real picture comes from".
- **Part 2 (pink), "Now try it yourself":** the two controls (what matter is gathering; the starting size) and Run; **Picture 2** (the strip of dots), **Picture 3** (your ripple's density excess) and **Picture 4** (how big must a ripple start), each with its own caption.
- **Part 3 (teal), "The results":** the guesses beside the results; Table 1 (a check-up); Table 2 (the two fixed starts and your own); "What this table tells us" under each.
- **Part 4 (blue), "The tutor":** three questions, then an explanation marking each guess.
- **Colours:** **white** only for the learner's guess. **Amber** for ordinary matter, **violet** for ordinary plus dark matter, **red dashed** for "without dark energy" (changed from light grey on 2026-11-16, because grey was hard to read in the captions on the light page and blue merged with violet; red is `#dc2626`), **green** for the clump line and glow (the glow is schematic), **pink** for the learner's own starting size and settings (Part 2). Dark background so white shows. Nothing is "imagined" on this page.
- **Parts 2 to 4 appear after the first Run and stay** when the kind of matter or the starting size changes; the tutor is not restarted.

---

## 1. Introduction (above Part 1; no answers given, §12)

**Title:** Cosmology 9: How Did Galaxies Form? Growing Structure from Tiny Ripples

**The question.** "The oldest light we can see (the cosmic microwave background, from Cosmology 3) shows an early universe that was almost perfectly smooth: its temperature differs by only about 1 part in 100,000 from place to place. Yet today the universe is full of galaxies, with huge empty spaces between them. How did a nearly smooth universe turn into a lumpy one?"

**What happens** (revised 2026-11-16 at the owner's request: a longer explanation, with the guesses in their own paragraph). Paragraph 1: "**What happens.** You will look at one small region of the early universe. Picture a patch of space, and the matter inside it. Most patches hold about the same amount of matter, the average. But this patch is a tiny bit different: it holds just slightly *more* matter than average, so it is just slightly denser. Think of a big hall where people are spread almost evenly, except for one spot that is a little more crowded than the rest. That patch is the “region” in this experiment."

Paragraph 2: "We then follow that one region through time, from the moment the oldest light was released (the very earliest time this model looks at for ordinary matter) all the way to today. During all those billions of years two things are going on. The region’s extra gravity pulls in more matter, which would make the extra density grow. At the same time space is expanding, which spreads matter out and works against that growth. At every moment we can ask one question: *by what factor has the extra density grown since the start?* For example, if a region began 1 part in 1,000 denser than average and its extra density has grown 10 times, it is now 10 parts in 1,000 (1 part in 100) denser than average. That factor is the **growth** (Step 4). The experiment shows you how big that growth can get between the oldest light and today, and how the answer depends on the kind of matter that is gathering."

Paragraph 3: "**Your guesses.** First you make two guesses. Then you press **Run**, and a graph shows how many times such a region grows. Your guesses are drawn on the graph in white. In **Part 2** you choose what kind of matter is gathering and how much denser than average your region starts, and you watch your own region. The results and a tutor follow."

**Step 1: the oldest light, a reminder.** "In Cosmology 3 you met the oldest light we can see. NASA's COBE page says its temperature ripples are 'only one part in 100,000 compared to the 2.73 degree Kelvin average'. ESA says these tiny temperature differences 'correspond to regions of slightly different densities at very early times, representing the seeds of all future structure: the stars and galaxies of today'. So the story of every galaxy begins with a region that was a tiny bit denser than its surroundings."

**Step 2: a new word, density excess.** "The **density excess** is how much denser than average a region is. A density excess of 0.1 means 10 percent denser: if an average patch of space holds 100 grains of matter, this one holds 110. A density excess of 1 means twice the average. (This is an everyday picture, not a measurement.)"

**Step 3: the tug-of-war.** "A region that is slightly denser has slightly more gravity, so it pulls in a little extra matter from around it. With that extra matter it is denser still, so it pulls harder. But space is also expanding (Cosmology 1 and 2), and the expansion keeps spreading everything out. The two effects work against each other. This experiment is about how that contest comes out."

**Step 4: growth.** "The **growth** is how many times bigger the density excess has become since the region started. If a region starts 1 part in 1,000 denser and its density excess grows 100 times, it ends up 1 part in 10 denser."

**Step 5: a clump.** "A **clump** is a region that has become dense enough (a density excess of 1, twice the average) that it would pull itself together into a lump held together by its own gravity, such as a galaxy. This experiment says *when* a region would become a clump. It does not say what the clump looks like."

**Step 6: redshift, a reminder.** "In Cosmology 1 and 8 you met **redshift**: a number that tells how long ago something was. A bigger redshift means an earlier time."

**Step 7: why ask this at all.** "Every galaxy, and every cluster of galaxies, started as a tiny difference in density. Working out how fast those differences could grow tells us what the early universe must have been like, and it brings together the oldest light (Cosmology 3), dark matter (Cosmology 4) and dark energy (Cosmology 5)."

**Your job.** "First, make two guesses. Then press Run. Afterwards, in Part 2, choose a kind of matter and a starting size of your own."

**What to look for.** "**Look at:** the two lines on the graph. **What it means:** one line is for ordinary matter and the other is for dark matter, and each shows how many times a region of that kind of matter has grown. **Why it matters:** how high they climb is the whole question. In Part 2, look at whether your own region becomes a clump." *(Revised 2026-11-16: the two kinds of matter are now named.)*

**How this page is laid out.** "Below this introduction the page has four parts. **Part 1** is where you guess and watch. **Part 2** is where you try your own settings. **Part 3** shows the results and what they mean. **Part 4** is the tutor. Parts 2, 3 and 4 appear when your first run has finished."

**Your guesses and the real pictures (new, §14).** "Your guesses never change the real pictures or tables. They are drawn on the real graph in **white**, in a box labelled YOUR GUESS, after the run, and shown again beside the results. The real pictures come from the physics. The kind of matter and the starting size you choose in Part 2 do change the strip, your ripple's graph and the pink row of the table, but never the Part 1 graph. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess."

**What we assume.**
- "The same simplified universe as Cosmology 5, 6 and 8: 'flat' (space on the very largest scales is not curved, so straight parallel paths stay parallel), with matter and a constant dark energy (70 percent), and an illustrative Hubble constant of 70 km/s per megaparsec (a megaparsec is about 3.3 million light-years). Published values range from about 67 to 73: the 'Hubble tension'. **Radiation** (the light and other very fast particles of the early universe) is left out, so the model cannot describe the time before matter outweighed radiation."
- "Only the first, simple stage of growth is modelled: a region that is still only slightly denser than average. Real structure formation also involves pressure, gas cooling, the birth of stars and mergers of clumps, and none of these are modelled."
- "The starting size of the region is your own illustrative choice, not a measurement. The oldest light's 1 part in 100,000 is a difference in *temperature*, which is not the same as how much denser a region of matter is, and how the two are related depends on the size of the region. This model does not capture that. (No official page was found that says how they differ.)"
- "A single region is treated on its own. Real galaxies form where many ripples of many sizes overlap."
- "The model says *when* a region would become a clump. It does not say what the clump looks like."
- "The ripples of the oldest light are the seeds. For ordinary matter the model lets a region start growing when the oldest light was released." *(The dark matter assumption appears in Part 2 after the run: §12.)*

**Some new words:** density excess, growth, clump, redshift, ripple, megaparsec. All are in the Words and formulas box.

**As of November 2026 (up to date, §29).** "The best measurements of the oldest light come from ESA's Planck satellite. Its final results (the 2018 paper, revised in 2021) give the redshift of the oldest light as 1089.8 and the redshift when matter began to outweigh radiation as about 3,400 (3,387 to 3,407, depending on which data are combined). This experiment uses both as given values." **[Planck 2018, Table 2: read through a summary; no 2025 or 2026 news was searched for, so the page claims none]**

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)

**Before the run**
1. **NASA GSFC: COBE science results** — "John Mather's page on COBE, the first satellite to measure the oldest light's ripples: 'only one part in 100,000'." *(read; last updated 11 April 2013)*
2. **ESA: Planck reveals an almost perfect Universe (2013)** — "ESA's plain page: the oldest light's tiny temperature differences 'correspond to regions of slightly different densities ... the seeds of all future structure'." *(read)*
3. **NASA/JPL: Planck mission explores the history of our universe (2015)** — "Planck's maps 'show where matter had just begun to clump together into the seeds of the galaxies we see around us today'." *(read)*
4. **Planck Collaboration (2018): cosmological parameters** — `https://arxiv.org/abs/1807.06209` — "The paper behind the oldest light's redshift (1089.8) and the redshift when matter began to outweigh radiation (about 3,400). A technical paper; the abstract is the readable part." *(abstract and an HTML copy of Table 2 read)*
5. **NASA: The Shape of the Universe** — "The page behind the word 'flat' in the assumptions." *(read for Cosmology 8)*
6. **NASA: the Hubble constant and the tension** — "NASA's plain page behind the range 67 to 73." *(read for Cosmology 6 and 8; to be re-read)*

**After the run** *(they say what the tutor asks about: dark matter first, and the size of the growth)*
7. **NASA/JPL: NASA reveals new details about dark matter's influence on the universe (26 January 2026)** — "'Scientists think dark matter began to clump together first and that those dark matter clumps then pulled together regular matter.'" *(read)*
8. **NASA: Hubble maps the cosmic web of clumpy dark matter in 3-D (2007)** — "'normal matter, including all stars and galaxies, collect within the densest concentrations of dark matter'." *(read)*
9. **The growth approximation, printed in arXiv:astro-ph/0006089** — "A technical paper that quotes the Carroll, Press and Turner (1992) formula for how much a ripple grows; this page checks its own number against it. The 1992 paper itself was not read." *(read)*
10. **Spherical collapse model in dark energy cosmologies (arXiv:1005.0233)** — "A technical paper that gives 1.686 as the linear density excess at which a region collapses, for a universe with matter only; this page's clump line is a simpler 1." *(read)*

**Gaps (§29 rule 3(c)), searched 2026-11-15:** no official page says the temperature ripples of the oldest light are not the same as the matter density ripples (the COBE page calls them density ripples); no plain official page says ordinary matter is held smooth by light until the universe becomes transparent (only a Caltech/IPAC lecture by Lahav, 2004, which is not plain language and is not linked); no official page says all of "ripples of 1 part in 100,000, dark matter first, ordinary matter afterwards" together; the 1992 Carroll, Press and Turner paper was not read (ADS returned an error); no fetched page says the linear model stops being valid as the density excess approaches 1; the savings-account picture has no source.

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses about how a slightly denser region of the early universe grows. Then you will press Run and watch a graph draw itself. It has two lines, one for **ordinary matter** (the matter in stars, planets and us) and one for **dark matter** (matter we cannot see, but whose gravity we can feel). Each line shows how many times the region’s extra density grows. Your guesses are drawn on the graph in white. Nothing you guess changes the real graph." *(Revised 2026-11-16: the two kinds of matter are now named.)*

**Guess 1 and Guess 2 (revised 2026-11-16 at the owner's request, to say more clearly what the learner will do; the answer choices are unchanged).** Guess 1: "Guess 1: how much will the extra density grow? A region starts only slightly denser than average. Gravity pulls extra matter into it, which makes it denser still, while the expansion of space works against that. We follow it from the moment the oldest light was released until today. By today, how many times bigger will its extra density be than it was at the start? (For example, a region that starts 1 part in 1,000 denser and grows 10 times ends 1 part in 100 denser.) Choose the size you think is closest." About 10 times / About 1,000 times / About a million times. Guess 2: "Guess 2: what would a head start do? In this model, a region starts gathering matter at the moment the oldest light was released. Now imagine it could start earlier, before that moment, so it had more time to grow. Would that change the growth you guessed in Guess 1? Choose how big a difference you think it would make." No difference / A small difference / It would decide the outcome. *(The wording approved on 2026-10-09 was: Guess 1, "Gravity pulls extra matter into a slightly denser region. Starting when the oldest light was released and acting until today, about how many times denser than average (relative to its start) will that region become?"; Guess 2, "Suppose the region could start gathering matter earlier, before the oldest light was released. Would that change the answer?".)*

**Locked line (after Run):** "Your guesses are locked while you try other settings. To change them, press Start over." **Start over** replaces "Change predictions": always visible, greyed out until a guess is chosen or a run exists and while a run plays; it clears the guesses, runs, results and tutor.

**Run:** nine seconds, fixed (§11). Before Run nothing is drawn and no number is printed. At Run the two lines draw from their starts toward today; the end labels (the numbers) and the white marks appear when the run ends (A4).

**White guess marks (drawn when the run ends; each with a YOUR GUESS box joined by a line):**
- **Guess 1 (on the graph, at the "today" end):** a white tick across the right-hand end of the graph at the guessed height: at **10** times for "About 10 times", at **1,000** times for "About 1,000 times". "About a million times" is off the top of the graph (it stops at 5,000), so it is an **arrow at the top edge pointing up**, labelled "off this scale: about a million". Box: "YOUR GUESS: about 10 / 1,000 / a million times". The first two are drawn at their true heights on the axis.
- **Guess 2 (marker only):** a white mark on the amber line's end pointing toward the violet line's end: a **ring** for "No difference", a **short arrow** for "A small difference", a **longer arrow** for "It would decide the outcome". Box: "YOUR GUESS: starting earlier: no difference / a small difference / it would decide". **Only a marker:** the arrows have fixed lengths that mean nothing as numbers; the caption says so.

**Where the real picture comes from (under the graph, after the run).**
- "**Calculated here:** both lines, the dashed lines and every number, for a flat universe with 70 percent dark energy and a Hubble constant of 70, without radiation (the model of Cosmology 1, 2, 5 and 8), by the growth formula in the Words and formulas box."
- "**Given by others, not worked out here:** the oldest light's redshift, 1089.8, and the redshift when matter began to outweigh radiation, about 3,400 (Planck 2018; see Table 1)."
- "**Your guess:** the white marks only. Nothing on this page is imagined."

### Caption (under the graph; each section appears as its feature is drawn)

**Picture 1, the growth graph: how many times a ripple grows.**
- "Along the bottom is time since the Big Bang, from 10 thousand years to 10 billion years. Each tick is ten times the one before, so the early times are not squashed into the corner. Up the side is how many times a region's density excess has grown since it started. Each tick is again ten times the one before (1, 10, 100, 1,000)."
- "The **amber line** is ordinary matter alone. In this model it starts growing when the oldest light was released, about **472 thousand years** after the Big Bang (this model leaves out light, so the real figure is about 380 thousand, as in Cosmology 3). The **violet line** is ordinary plus dark matter. In this model it starts earlier, about **86 thousand years** after the Big Bang. The graph does not depend on how big you choose the starting ripple."
- "The two **red dashed lines** show the same growth with **no dark energy at all**, one for each start. They lie just above their solid lines at the end."
- "When you press **Run**, watch for about 9 seconds. The lines draw from their starts, and a dot rides on each. The motion is drawn to help you notice the growth; it is not a movie of real history, but the numbers at the end are exact."
- *Worked moment (after the run):* "Growth is how many times bigger the density excess has become. A region that starts 1 part in 1,000 denser and grows 100 times ends 1 part in 10 denser."
- *What to look for (each appears when its feature is drawn):* (1) "**Look at** the end of the amber line. **What it means:** a region of ordinary matter has grown about 850 times between the oldest light's release and today. **Why it matters:** this is the number your first guess was about." (2) "**Look at** the end of the violet line against the amber line. **What it means:** with the earlier start the growth is about 2,649 times, 3.1 times the amber line's. **Why it matters:** this is the comparison your second guess was about." (3) "**Look at** each dashed line against its solid line. **What it means:** with no dark energy the growth would be 1,090.8 and 3,401, about 22 percent more than the solid lines. **Why it matters:** it shows that dark energy takes some of the growth away; why is for the tutor." (4) "**Look at** the white marks. **What it means:** each shows what you guessed, beside the real lines. **Why it matters:** you can compare at a glance; the tutor goes through each guess. The marks do not say right or wrong."
- "**The white marks are only markers where a guess has no size.** Guess 1's ticks at 10 and 1,000 are at their true heights; the arrow for 'about a million' means only 'off the top of the graph'. Guess 2's ring and arrows have fixed lengths that mean nothing as numbers."

*(Held for the tutor and Part 3, §12: why the growth is only in step with the universe's size, the savings-account picture, why a head start matters, the sizes needed to become a clump, and the verdict on both guesses.)*

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now you choose what kind of matter is gathering and how much denser than average your region starts. Press Run and watch your own region grow, in a strip, on a graph and against the sizes needed to become a clump. Your guesses do not change anything in this part; your choices do."

**Controls.**
- "What matter is gathering:" **Ordinary matter only (starts at redshift 1089.8)** / **Ordinary plus dark matter (starts at redshift 3,400)**.
- "How much denser than average the early region starts (its starting density excess):" **1 part in 100,000** / **1 part in 10,000** / **1 part in 1,000** / **1 part in 500** / **Custom** (a slider on a scale where each step multiplies, from 1 part in 100,000 to 1 part in 500).
- **Run: watch your region grow** (nine seconds, fixed). A choice changes the pictures below only after its own Run; Parts 2 to 4 stay on screen.

**New note, shown with the controls (after the run, §12):** "For ordinary plus dark matter this model lets a region start growing earlier, at redshift about 3,400 (when matter began to outweigh radiation), instead of at the oldest light's release. That earlier start is a given value, not something the model works out, and what dark matter is made of is not specified (Cosmology 4)."

**Note beside the controls (new):** "Your guesses do not change the drawings or tables, but these settings do: they change the strip, Picture 3 and the pink row in Part 3. These starting sizes are **trial values**: they show what would happen for a region that starts that much denser, and they do not say the real universe started that way. The starting size is your own illustrative choice, not a measurement."

**Readout (live during the run):** time since the Big Bang; redshift; "the ripple has grown N times"; "space has stretched N times since the start"; the density excess.

**Picture 2, the strip.** *Caption:* "A long, thin slice of the early universe. Each dot is a small bit of matter. **Amber dots** are ordinary matter and **violet dots** are dark matter (shown only for 'ordinary plus dark matter'; the split is not to scale with the real proportions). The middle is the slightly denser region. As the ripple grows, dots drift toward the middle and crowd together. The crowding is drawn at the model's true density excess, with nothing exaggerated, so a tiny ripple such as 1 part in 100,000 really does look almost perfectly smooth even after it has grown thousands of times. The picture follows one fixed patch of matter, so the dots keep their place on the screen while the space between them stretches; the label says by how much. **The green glow**, if your ripple reaches a density excess of 1, is only an illustration of a clump; the model does not compute what the clump looks like." *What to look for:* "**Look at** the dots as the run goes on. **What it means:** they drift toward the middle by an amount set by your ripple's density excess. **Why it matters:** it shows what a growing ripple does to the matter around it."

**Picture 3, your ripple.** *Caption:* "The density excess of the starting size you chose, against the same time axis as Picture 1. Up the side, each tick is ten times the one before, from 0.00001 (1 part in 100,000) to 1 (twice the average). The **green dashed line** marks a density excess of 1. A ripple that reaches it has become a clump, and the model stops following it there, because the simple description of a slightly denser region no longer applies once it is that dense." *What to look for:* "**Look at** your line against the green dashed line. **What it means:** [your ripple ends today at a density excess of about X, so it did / did not become a clump (at redshift Y)]. **Why it matters:** it is the model's answer to 'would this region become a galaxy?' for your starting size."

**Picture 4, how big must a ripple start.** *Caption:* "Four dots on one sideways scale of density excess, each tick ten times the one before. Further right means a bigger starting difference. Since a ripple grows by a fixed number of times, you can work backward: the smallest starting ripple that reaches 1 by today is 1 divided by that number. For ordinary matter the growth is about 850, so the ripple must start at about 1 ÷ 850 = 1 part in 850. With the earlier start the growth is about 2,649, so it needs only about 1 part in 2,650. **Your starting size** is the pink dot: if it is to the right of a kind of matter's dot, your ripple is big enough to become a clump with that kind of matter. **The red dot at the far left** is the size of the oldest light's ripple, 1 part in 100,000, but be careful: that is a difference in *temperature* (Cosmology 3), which is not the same as how much denser a region of matter is. The picture puts them side by side for reference only. This model does not say whether the real universe started with enough, and it does not draw that conclusion." *What to look for:* "**Look at** the pink dot against the amber and violet dots. **What it means:** [it is to the right of / between / to the left of the two]. **Why it matters:** the gap between the amber and violet dots is the range of starting sizes where the earlier start decides whether a clump forms."

**Where the real picture comes from (Part 2).** "*Calculated here:* every line and number, from the growth formula; the strip's dots are drawn at the model's true density excess. *Given by others:* the two start redshifts (Planck 2018). *An illustration, not computed:* the green glow and the split of dots into amber and violet. *Your choice:* the kind of matter and the starting size (trial values). Nothing here is imagined."

---

## 5. Part 3: The results (teal)

**Lead.** "These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the pink row follows your settings in Part 2."

**The learner's guesses beside the results** (guess only, no "matched"; a tag on the rows): "You guessed: a region would become **[about 10 / about 1,000 / about a million]** times denser (tag on Table 2, 'Ordinary matter' row, 'Times it grew'). You guessed: starting earlier would make **[no difference / a small difference / it would decide the outcome]** (tag on Table 2, the 'with dark matter' row, 'Times it grew')."

### Table 1: a check-up (this model against published values)
| What we compare | This model | Published | Reading |
|---|---|---|---|
| (a) How many times a ripple grows since the oldest light | 849.7 | 848.6 (the Carroll, Press and Turner approximation, for 0.3 and 0.7) | more, by 1.1 (0.13 percent); the formula is itself an approximation |
| (b) The same growth, with dark energy against without | 849.7 against 1,090.8 | none: a calculated comparison | less, by 22.1 percent |
| (c) The head start | 2,649.3 against 849.7 | none: calculated here only | a factor of 3.12 |
| (d) The oldest light's redshift | 1089.8 | 1089.80 ± 0.21 (Planck 2018, with BAO); 1089.92 and 1089.95 in the other two columns | within the published range |
| (e) When matter began to outweigh radiation | redshift 3,400 | 3,387 ± 21, 3,402 ± 26 and 3,407 ± 31 (Planck 2018) | within the published range |

**What this table tells us.** (a) *What it is:* the model's growth for ordinary matter beside an independent published approximation. *What it means:* 849.7 against 848.6, 1.1 (0.13 percent) apart. *Why it matters:* two different methods agree, so the number is not an accident of this model's integral. *How sure:* the approximation is itself approximate and its accuracy was not read; the 1992 paper itself was not read. (b) *What it is:* the growth with dark energy beside the growth with none (which is exactly the universe's growth in size, 1 + z). *What it means:* dark energy takes away 22.1 percent. *Why it matters:* it is the late flattening you see in the graph, and the thread picked up in Cosmology 10. (c) *What it is:* how much more the earlier start grows. *What it means:* 3.12 times. *Why it matters:* it is the head start; whether it decides an outcome depends on the starting size (Picture 4). (d) *What it is:* the redshift of the oldest light that this experiment uses as the start of ordinary matter's growth. *What it means:* it lies inside the range Planck gives. *Why it matters:* it fixes where the amber line starts. *How sure:* ordinary matter is released from the light a little later, at the baryon drag redshift of about 1060 (Planck 2018); starting there would give about 826.5, 2.7 percent less than 849.7. (e) *What it is:* the given redshift where dark matter's start is set. *What it means:* it lies inside the range Planck gives. *Why it matters:* it fixes where the violet line starts. *How sure:* the model leaves radiation out, so its own times for these starts are rough (472 thousand and 86 thousand years).

### Table 2: the starts and your own (calculated here)
| | Starts at redshift (time after the Big Bang) | Times it grew by today | Without dark energy | Starting size needed to be a clump |
|---|---|---|---|---|
| Ordinary matter | 1089.8 (about 472 thousand years) | 849.7 | 1,090.8 | 1 part in 850 |
| Ordinary plus dark matter | 3,400 (about 86 thousand years) | 2,649.3 | 3,401 | 1 part in 2,650 |
| **Your region** *(pink)* | *your start* | *times it grew* | *1 + start redshift* | *the size for your kind of matter* |

Under the table: "**Your region:** starting size *[1 part in N]*, density excess today *[X]*, *[it became a clump at redshift Y / it did not become a clump]*."

**What this table tells us.** *What it is:* how much a ripple grows for each start, and how big it must start to become a clump, with your own region beside them. *What it means with the real numbers:* ordinary matter grows 849.7 times and needs a start of 1 part in 850; with the earlier start the growth is 2,649.3 and it needs only 1 part in 2,650. A start of 1 part in 1,000 lies between them: it becomes a clump only with the earlier start (density excess 2.65 against 0.85 today). *Why it matters:* it shows how big the starting ripple must be, and how much the earlier start helps. *How sure:* the model counts a density excess of 1 as a clump; the usual textbook figure for the linear value at which a region collapses is about 1.686 (arXiv:1005.0233, for a universe with matter only), so the clump times here are approximate. The oldest light's 1 part in 100,000 is a temperature difference and is not compared with these sizes.

**What your numbers show** *(updates with your settings, in trial values).* "With **[kind of matter]** and a starting size of **[1 part in N]**, your region grows **[x]** times and ends today at a density excess of **[X]**: **[it becomes a clump at redshift Y / it does not become a clump]**. For a region of that kind, the size needed is **[1 part in M]**; yours is **[bigger / smaller]** than that. **These are trial values and your own numbers. They do not say the real universe started that way.**"

**Removed from Results (moved to the tutor, §12):** "so your prediction was right / off" and "partly right", "A simple calculation", "A comparison from daily life" (the savings account), "While matter dominates, a ripple grows in step with the size of the universe", and "What this model can and cannot tell you"'s statement about whether the real universe had enough. **Kept:** the numbers in the tables and "What this model simplifies".

---

## 6. Part 4: The tutor (blue)

**Lead.** "The tutor asks you three questions about what you saw, then explains it and goes through your two guesses."

- **Observe:** "Look at the two lines on the growth graph and at your own ripple in Part 2. How many times did the ripple grow? Did the starting size you chose become a clump? Look at your white marks too: where did each one sit against the real lines?"
- **Compare:** "You guessed that a slightly denser region would become **[about 10 / 1,000 / a million]** times denser between the oldest light's release and today (your white tick or arrow), and that starting earlier would make **[no difference / a small difference / it would decide the outcome]** (your white ring or arrow). What do you notice when you compare each white mark with the real lines?"
- **Conceptual (kept):** "Gravity pulls extra matter into a denser region, and the extra matter makes it pull harder. So why does the ripple not grow explosively?"
- **Explanation:** the eight approved points are kept, with these changes: (i) point 3 starts by marking guess 1 ("You guessed about [N] times (the white tick): the model gives about 850. **[That is / That is not]** what you guessed"), from the module; the closest answer on a scale where each tick is ten times the one before is "about 1,000" (0.07 of a tick away, against 1.93 for "about 10" and 3.07 for "about a million"); (ii) point 4 marks guess 2 ("You guessed [X] (the white ring or arrow): the earlier start multiplies the growth by 3.1, and for a starting size of 1 part in 1,000 it decides whether a clump forms (0.85 against 2.65). **That is partly what you guessed** / **That is not what you guessed**" for "No difference"); "No difference" is the only answer marked off, as the owner approved on 2026-10-09; (iii) point 2 now holds the savings-account picture, moved from Results ("a small interest rate: in any one year the balance barely changes, but over many years it has grown many times over; not exact, because a ripple's growth is set by how much the universe has expanded, not by a fixed rate") and the statement that, while matter dominates, a ripple grows in step with the universe's size; (iv) point 4 quotes NASA/JPL (26 January 2026): "Scientists think dark matter began to clump together first and that those dark matter clumps then pulled together regular matter", and says the reason in the model is an assumption (light holds ordinary matter smooth until the oldest light is released), for which no plain official page was found; (v) point 5 is kept, with the dashed lines named; (vi) point 6 now says that the temperature ripples and the matter ripples are not the same number, and that no official page read says how they differ, without saying or implying either that the puzzle is solved or that it is not (the owner's standing rule for this point); (vii) point 7 (the honest limits) adds that the clump line at 1 is a simple round number (the standard linear value is about 1.686) and that ordinary matter is released from the light a little later than the oldest light's release (the baryon drag redshift of about 1060, Planck 2018), which would trim the growth by about 3 percent; (viii) the cross-references use the sidebar names ("Cosmology 3", "Cosmology 4", "Cosmology 5 and 8").

---

## 7. Words and formulas (collapsed box above Part 1)
**Entries (plain meaning each):** density excess; growth; clump; redshift; ripple; ordinary matter; dark matter (Cosmology 4); dark energy (Cosmology 5); the cosmic microwave background (Cosmology 3); radiation (left out); flat universe; Hubble constant; Hubble tension; megaparsec; "1 part in 100,000"; matter-radiation equality (the time when matter began to outweigh radiation; redshift about 3,400); linear growth ("the simple first stage, while a region is only slightly denser than average").
**Formulas with worked examples (from the page's own numbers):** density excess today = starting size × growth (1 part in 1,000 × 100 = 1 part in 10). **Held back until after the run (§12):** the growth with no dark energy = 1 + the start redshift (1,090.8 and 3,401); the starting size needed = 1 ÷ growth (1 ÷ 850 = 1 part in 850); density excess today = start × growth (0.001 × 849.7 ≈ 0.85); the growth formula itself (an integral; its early-time limit is D(a) = a).

---

## 8. Source table (for the specification's "Audit Update")
| Idea or number | Source | Read? | Date |
|---|---|---|---|
| z_star 1089.80 ± 0.21 (with BAO); z_eq 3387 ± 21 to 3407 ± 31; z_drag about 1060 | Planck 2018 VI (arXiv:1807.06209), Table 2, via an HTML copy | read (helper; a model summary) | 2026-11-15 |
| Growth approximation g = 5Ωm/2 ÷ [Ωm^(4/7) − ΩΛ + (1 + Ωm/2)(1 + ΩΛ/70)] = 0.7779 | printed in arXiv:astro-ph/0006089, quoting Carroll, Press and Turner (1992) | read (the quoting paper); the 1992 paper not read | 2026-11-15 |
| 1.686, for a matter-only universe | arXiv:1005.0233 | read (helper) | 2026-11-15 |
| "Only one part in 100,000"; "density ripples" | NASA GSFC, COBE science results (last updated 11 April 2013) | read (helper) | 2026-11-15 |
| Temperature fluctuations "correspond to regions of slightly different densities ... the seeds of all future structure" | ESA, Planck reveals an almost perfect Universe (21 March 2013) | read (helper) | 2026-11-15 |
| Planck's maps show "where matter had just begun to clump together into the seeds of the galaxies" | NASA/JPL (5 February 2015) | read (helper) | 2026-11-15 |
| Dark matter began to clump first; regular matter pulled in after | NASA/JPL (26 January 2026) | read (helper) | 2026-11-15 |
| Normal matter collects in the densest concentrations of dark matter | NASA, Hubble cosmic web (2007) | read (helper) | 2026-11-15 |
| Temperature ripples are not the same as matter ripples (the factor about 3) | none | **gap: no official page found** | 2026-11-15 |
| Light holds ordinary matter smooth until the universe is transparent | none plain and official (a Caltech/IPAC lecture only) | **gap: no plain official page found** | 2026-11-15 |
| The linear model stops being valid near a density excess of 1 | none read | **gap: not stated** | 2026-11-15 |
| The real time of dark matter's start (about 50 thousand years) | none read | **gap: not stated; the page uses the module's 86 thousand** | 2026-11-15 |
| Flat universe; Hubble constant 67 to 73 | NASA pages read for Cosmology 6 and 8 | read; to be re-read | |
| The savings-account picture | none | **gap: Claude's own everyday picture, labelled inexact** | 2026-11-15 |

## Questions for the owner on this draft
A. **Guess 2's marking wording.** Default as drafted: "That is partly what you guessed" for "A small difference" and "It would decide the outcome", "That is not what you guessed" for "No difference". Say if you want a different phrase.
B. **The red dashed lines and the colours** as drafted (two dashed lines, one per start; amber, violet, red, green, pink). Default: yes.
C. **"Starts at redshift 3,400" appears on the control button only after the run** (it is a Part 2 control, so it appears with Part 2). Default: yes.
D. **Table 1 row (a)** says "more, by 1.1 (0.13 percent)" and not "the same", because the published figure is itself an approximation and no accuracy was read for it. Default: yes.
E. **Part 2's defaults:** "Ordinary plus dark matter" and "1 part in 1,000" (the preset where the earlier start decides the outcome), as today. Default: yes.
F. **The baryon drag redshift 1060** is mentioned in Table 1's note (d) and the tutor's limits, not drawn. Default: yes.

## What the module will need (for the physics step; tests first)
New functions in `structureFormationExperiment.ts`, each with tests, none changing an existing physics function: the two fixed starts and their results; guess 1's answer (the closest of 10, 1,000 and a million on a log scale) and matching; guess 1's mark (tick position for 10 and 1,000, the edge-arrow case for a million, the axis range 1 to 5,000); guess 2's marker kinds and fixed arrow lengths (a ring, a short arrow, a longer arrow); guess 2's marking ("not" for No difference, "partly" for the other two) from the head-start factor and the decides-or-not example; the growth with no dark energy for both starts; the start times in this model (471,931 and 85,721 years, and their rounded text); the check-up rows (a) to (e) with readings (including the Carroll, Press and Turner approximation as a tested function `growthApproximationCPT`); the drag-redshift note's number (826.5, from `growthBetween(1060, 0, L)`); Table 2's rows and "What your numbers show" values (including the clump redshift and the bigger-or-smaller reading against the size needed); the worked examples (1 part in 1,000 × 100; 1 ÷ 850; 0.001 × 849.7; the 1 part in 100,000 case, 1 part in 118 and 1 part in 38); published constants (Planck's z_star, z_eq and z_drag ranges). A new `StructureFormationExperiment.test.tsx` covers the interface.

## Not checked
Not built, not run, not viewed in a browser; the wording is not yet approved; every source was read through a helper's summary and must be re-read against the live pages before printing; the 1992 Carroll, Press and Turner paper was not read; the drag-redshift and approximation arithmetic is mine and is to be put in tests; the worked numbers (849.7, 2,649.3, 3.12, 1,090.8, 3,401, 22.1 percent, 471,931 and 85,721 years, 0.85 and 2.65, 826.5, 848.6, 1 in 118 and 1 in 38) were worked with a scratch script from the module on 2026-11-15 and are to be rechecked in the module's tests; the Words and formulas box's other entries are listed but not written out; the exact positions of the white marks on the graph and where the two end labels sit are to be settled by the browser check.
