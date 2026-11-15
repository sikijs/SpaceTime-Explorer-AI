# Draft wording: Cosmology Experiment 5 (Dark Energy)
Date: 2026-11-15 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the fifth of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-15): defaults accepted for all twelve questions at the end of `05-gap-report.md`, **except question 3: the introduction is to be more detailed and explanatory** (done below; it is much longer than the old one and adds worked numbers and everyday pictures).

**Facts in this draft come from pages and abstracts fetched on 2026-11-15 through helper agents whose fetch tool returns short quotes and summaries, not raw text.** Every quotation and figure marked [recheck] must be compared with the live page before it is printed. All 14 links were checked to load (HTTP 200) on 2026-11-15; loading is not the same as reading, and the source table at the end says which were read. No page is linked that was not read.

## What the sources changed (read these first)
1. **The page's rounded 70 percent sits at the top of NASA's stated range.** NASA (Dark Energy page): "approximately 68.3 to 70% of the universe is dark energy"; NASA (Building Blocks): "normal or visible matter (5%), dark matter (27%), and dark energy (68%)". No year or data set is given on either page. The Planck 2018 paper (arXiv 1807.06209) gives the matter share as 0.315 ± 0.007; **a dark energy share of 0.685 is not stated in the text read (it is 1 minus 0.315 for a flat universe)**, so this draft calls it "worked out from" and does not quote it as stated. **This draft keeps 70 (a given constant, and the physics is not changed) and says it is a rounded value at the top of NASA's range.** Changing it would change `BEST_FIT_DARK_ENERGY_FRACTION`, the verdict band and the tests: a physics decision, not made here. **Question A.**
2. **The "70 / 25 / 5 percent" line in the tutor does not match the sources.** NASA gives 68 / 27 / 5, which sums to 100. The page's own model has only matter and dark energy (30 and 70). The draft uses NASA's three numbers for the real universe, labelled as such, and says the page's model folds dark matter and ordinary matter into one "matter" share.
3. **"Shines as brightly as billions of Suns" has no official source.** The pages read say a Type Ia supernova gives "about the same amount of light" each time (Chandra) and nothing about a comparison with the Sun. **The sentence is dropped** and replaced by the sourced statement. §29 rule 3(c): recorded as a gap, **question B** if you want it back.
4. **Sourced:** a white dwarf pulling gas from a companion until it passes a critical mass (NASA Cosmic Times 1993; NASA SVS; Chandra: "the Chandrasekhar limit of 1.4 solar masses"); peak brightness about the same (Chandra); brighter ones fade more slowly "over the first 15 days" (NASA Cosmic Times, naming Mark Phillips); the 1998 finding that distant supernovae looked dimmer than expected (NASA Dark Energy page); two teams in 1998, a Nobel Prize in 2011, and the prize motivation "for the discovery of the accelerating expansion of the Universe through observations of distant supernovae" (Royal Swedish Academy of Sciences page; **nobelprize.org returned 403 and was not read**).
5. **Riess and others (1998), abstract:** 16 high-redshift and 34 nearby supernovae; the distances of the distant ones are "on average, 10% to 15% farther than expected in a low mass density (Omega_M=0.2) Universe without a cosmological constant". **This is a different comparison from the page's** (the page compares with a universe that is all matter, Omega_M = 1). The draft does **not** set the 10 to 15 percent beside the page's 20 percent (2833 against 2358 Mpc at redshift 0.5) as if they were the same measurement, and says why. The "0.25 magnitudes" figure sometimes quoted was **not verified** and is not used. **Perlmutter and others (1999), abstract:** 42 supernovae at redshifts 0.18 to 0.83; for a flat universe, matter share 0.28 (+0.09, -0.08 statistical); the data are "strongly inconsistent with a Lambda = 0 flat cosmology". The "99 percent" and "14.9 billion years" figures came from the full text and were **not confirmed**; not used.
6. **Dark energy's status needs a date.** NASA's Roman page: recent observations "suggest dark energy may be changing over time". DESI (arXiv 2503.14738, March 2025, abstract): a dynamical dark energy model is preferred "over ΛCDM ... 2.8-4.2σ depending on which SNe sample is used", and the paper says ΛCDM "is being challenged ... and that dynamical dark energy offers a possible solution". The draft says **"as of November 2026"**, quotes the abstract's own words, does **not** say "not yet settled" (that was the agent's wording, not the paper's) and points to Cosmic Horizons' dark-energy experiment. [recheck whether the paper's published version changed any number.]
7. **Four candidate explanations** appear on NASA's page (vacuum energy, quintessence, cosmic defects, a flaw in general relativity). They are listed in the words box and the tutor's "not covered", not in the introduction.

## Layout
- **Above Part 1 (no heading):** a longer, neutral introduction, a "Want to know more?" list, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** two guesses; **Start over** (always visible); **Run**; the supernova picture and the graph (blue and green) and the new "slowing or speeding up" panel, all for the best fit (70 percent); white guess marks after the Run; "Where the real picture comes from"; one caption.
- **Part 2 (pink), "Now try it yourself":** the share control (none, best fit, custom 0 to 90 percent); its own drawing (the supernovae, the graph with an amber line and the panel with an amber dot); its own caption.
- **Part 3 (teal), "The results":** Table 1 (a check-up), Table 2 (distances and brightness at three redshifts), "What this table tells us" under each, the learner's guesses beside the results.
- **Part 4 (blue), "The tutor":** three questions, then an explanation that marks each guess.
- **Colours:** white only for the learner's guess; blue for matter only; **green** for astronomers' best fit (the dashed line, and in Part 1 the glowing disks); **amber** for the learner's own share (Part 2 only); a dark background so white shows.
- **Why Part 1's disks are green and not amber (new, for approval):** in the old page the amber line sat exactly on the green line at the starting best-fit share, so two lines showed one thing. In Part 1 only blue and green are drawn; amber appears in Part 2, where the share can differ.

---

## 1. Introduction (above Part 1; no answers given, §12) — **longer and more explanatory, at the owner's instruction**

**Title:** Cosmology 5: Dark Energy

**The question.** "Is the expansion of the universe speeding up, slowing down, or staying steady, and how could anyone possibly tell?"

**What happens.** *(rewritten, more detailed)*
"In Cosmology 1 (Hubble's Law) you saw that faraway galaxies move away from us faster than nearby ones, and that this is because space itself is stretching. In Cosmology 2 (the Big Bang) you read that the stretching has not always happened at the same pace. This experiment asks how astronomers found that out.

*Think of the stretching the way you would think of a car's speed.* A car can be speeding up, slowing down or holding steady, and you can tell which by watching the speedometer over a minute or two. The universe's 'speedometer' is the rate at which space stretches, and we cannot watch it for a minute. The change we are asking about takes billions of years. So astronomers use a trick: **light is a record of the past.** Light from a faraway galaxy set off long ago, and on its way to us it crossed space that was stretching the whole time. How far the light had to go depends on how the stretching went. So if we can measure how far away something really is, we have measured part of the history of the stretching.

*But how do you measure how far away something is?* You need something whose true brightness you already know. A 100-watt bulb at the far end of a street looks dimmer than a 100-watt bulb next to you, and from how dim it looks you can work out how far away it is. An object whose true brightness is known is called a **standard candle**."

**A daily-life picture, with numbers.** *(kept and extended; the old closing sentence "If they look dimmer than you expected, the car is farther away" is moved to the caption and the tutor, §12)*
"Look at a car's headlights at night. Light spreads out as it travels, so it gets thinner the farther it goes. A car **twice** as far away looks **one quarter** as bright: 1 ÷ (2 × 2) = 1 ÷ 4. A car **ten** times as far away looks **one hundred** times dimmer: 1 ÷ (10 × 10) = 1 ÷ 100. This is called the **inverse-square rule**: brightness falls as one over the distance multiplied by itself. If you know the headlights' true brightness, then how bright they look tells you how far away the car is."

**The standard candle used here.** *(rewritten: no 'billions of Suns'; sourced facts only)*
"A **Type Ia supernova** is a special kind of exploding star. It begins as a **white dwarf**: the small, dense, glowing core left behind when a star like our Sun runs out of fuel. If a white dwarf has a companion star close by, it can pull gas off it. As the gas piles on, the white dwarf gets heavier, until it passes a limit of about 1.4 times the mass of our Sun and can no longer hold itself together. It then explodes. ('Type Ia' is just astronomers' label for this kind, based on what its light looks like.) Because every one of these explosions starts from nearly the same situation, they give out **about the same amount of light** each time. That is what makes them useful as standard candles.

They are not perfectly identical, but the differences can be allowed for: a slightly brighter one fades more slowly over its first two weeks or so, so watching how fast a supernova fades lets astronomers correct for small differences. In this experiment we simplify and treat every Type Ia supernova as exactly the same."
*(sourced: Chandra, "about the same amount of light", "Chandrasekhar limit of 1.4 solar masses"; NASA Cosmic Times, "brighter Type Ia supernovae fade more slowly over the first 15 days"; NASA SVS, "a white dwarf — the leftover core of a dead star"; [recheck] each quote. "A star like our Sun" is the page's own simplification, as before.)*

**The two ideas put together.** *(replaces "Why even ask this"; neutral about the direction)*
"If a supernova's true brightness is known, how bright it looks tells us how far away it is (the inverse-square rule). And how far away it is depends on how space stretched while its light was travelling to us. So the brightness of faraway supernovae can be used to read the history of the stretching. This experiment compares what we would see in two different kinds of universe. You will make guesses about both before you see them."

**Two kinds of universe.** *(new; rewritten 2026-11-15 to separate dark energy from dark matter)*
"A **universe with only matter** is one where everything in space is stars, gas, dust and anything else that has mass. A **universe with dark energy** also contains an extra ingredient that astronomers call **dark energy**: the name for whatever could make the stretching of space speed up. Whether our real universe has it, and how much, is the question you will explore. The page measures the amount as a **share** of all the energy in the universe: 0 percent means none, 70 percent means seven tenths of everything. Matter makes up the rest."

**Dark energy and dark matter: two different things.** *(new, at the owner's request of 2026-11-15, so that the learner has no confusion between them; sources below)*
"You may have met another 'dark' thing in **Cosmology 4: dark matter**. The two names sound alike, but astronomers treat them as **two different things**. NASA puts it this way: 'dark energy is not the same as dark matter. Their main similarity is that we don't yet know what they are!' Here is how they differ:

| | **Dark matter** | **Dark energy** |
|---|---|---|
| **What does it do?** | It has mass, so it has gravity. It is the invisible 'glue' that helps hold galaxies and clusters of galaxies together. | It is the name for whatever could make the stretching of **space itself** speed up. |
| **Where does it act?** | Inside and around galaxies and clusters, where there is matter to pull on. | Across the whole of space, on the largest scales. |
| **How was it found?** | From how fast stars orbit inside galaxies (Cosmology 4), from how clusters of galaxies move, and from how gravity bends the light of galaxies behind them. | From how dim very distant supernovae look (this experiment). |
| **How much of the universe?** | About 27 percent (NASA). | About 68 percent (NASA); the page's model uses a rounded 70. |
| **Do we know what it is?** | No. | No. |

**An everyday way to keep them apart.** Think of a balloon with coins glued to its rubber, being blown up. The coins stay the same size and are held in place by their own glue: that is like **matter**, and dark matter is the part of it we cannot see. The rubber stretching between the coins is like **space expanding**. Dark energy is not another coin. It is the name for whatever could change *how fast the rubber stretches*. Dark matter is something **in** space; dark energy is something about **space itself**.

**Do they come from the same source?** Nobody knows of a link. The pages this experiment draws on describe them as separate, found in different ways and doing different jobs, and none of them says that they share a source (or that they do not). What each one is made of is unknown, and this experiment does not claim a connection between them. When this page says 'matter', it means **all** the matter together, dark matter and ordinary matter. It has no separate 'dark matter' dial: the only dial is the share of dark energy."
*(sourced: NASA Dark Energy page, "dark energy is not the same as dark matter. Their main similarity is that we don't yet know what they are!" [recheck: read through a helper's digest]; NASA Dark Matter page ("the invisible glue that holds the universe together"; ordinary matter about 5 percent, dark matter about 27 percent) and NASA Building Blocks (5 / 27 / 68); ESA Euclid, "What is dark energy?" (found from supernovae in the late 1990s; a constant 'intrinsic property of the vacuum of space'). **No official page read says whether they might share a source**, so the paragraph says only that the sources do not say; that is a statement about the sources, not about the physics. The balloon-and-coins picture is a daily-life aid written here; it is the owner's to approve (§15, §28.1). It deliberately says nothing about what gravity does to the expansion, which is Guess 1's answer (§12).)*

**Distance and redshift, a reminder.** *(new)*
"Distances here are in **megaparsecs (Mpc)**. One megaparsec is about 3.26 million light-years, which is about 31 million million million kilometres. **Redshift** is a number that says how much the light of a faraway object has been stretched on its way to us, as space stretched. A bigger redshift means the object is farther away and its light set off longer ago. The three supernovae here are at redshifts 0.2, 0.5 and 0.8."
*(3.26 million light-years per Mpc: [recheck]; Cosmology 1 defines both terms; the page keeps its first-use definitions short and points to the box.)*

**What you will do.** *(replaces "Your job" and "What to look for")*
"The page below has four parts. **Part 1** asks for two guesses; then you press **Run** and watch three supernovae, one graph and one small panel, all for the universe astronomers' best measurements point to. **Part 2** lets you choose your own share of dark energy and see what changes. **Part 3** gives the results, with a short guide to reading them. **Part 4** is a tutor who talks it over with you.

**Your guesses never change the real pictures or tables.** After you press Run, they are drawn on the pictures in white, and shown again beside the results. The only things that change the drawings are the share you choose in Part 2. If you press Run and see nothing change when you change a guess, that is not a fault: a guess is only a guess."
*(A7; "Start over" is mentioned in Part 1's locked line.)*

**What we assume.** *(updated; the old bullets kept in substance)*
- "**Flat.** Space on the very largest scales is treated as not curved, the way a flat sheet is not curved, so straight parallel paths stay parallel. (In Gravity and Curved Spacetime you met a curved surface, the sphere.) This is a simplification, and a good one for the redshifts used here." *(kept; the cross-reference to be checked against the sidebar.)*
- "**Only matter and dark energy.** Light and other radiation, which matter only very early on, are left out. Matter's share is 100 percent minus dark energy's share. In the real universe about 27 percent is dark matter and about 5 percent is ordinary matter (NASA); the page adds them together as 'matter'." *(changed: sourced split, 68 / 27 / 5, NASA Building Blocks [recheck].)*
- "**Dark energy is treated as constant:** the same in every bit of space at all times. This is the simplest model. As of November 2026 astronomers are testing whether it is exactly constant: in 2025 the DESI survey reported that dark energy that changes with time fits its data better than a constant one, by 2.8 to 4.2 'sigma' (a measure of how unlikely the pattern is to be chance; bigger means less likely) depending on which supernova list is used, and described this as a possible solution to tensions in the standard model. That question is explored in the Cosmic Horizons experiment on evolving dark energy. It is **not** tested here." *(changed: dated; quotes DESI's abstract; "sigma" explained; [recheck] the numbers and the experiment's name in the sidebar.)*
- "**The Hubble constant** is the same illustrative 70 km/s per megaparsec as in Cosmology 1; published values run from about 67 to 73, a disagreement known as the 'Hubble tension'." *(kept.)*
- "**Every supernova is treated as exactly equally bright.** In reality astronomers correct for small differences." *(kept.)*
- "**The 'best fit' is a model, not data.** It is a dark energy share of **70 percent** (a rounded value; NASA gives 'approximately 68.3 to 70%') that makes the model's supernova brightness match what astronomers have measured. The green line is calculated here from that share; it is **not** a plot of individual supernovae." *(changed: sourced; no longer says 'it stands for what is measured'.)*
- "Only redshifts up to 1 are shown." *(kept.)*
- "Nothing here claims to say what dark energy is." *(kept.)*

**Some new words:** dark matter (a reminder from Cosmology 4), supernova, Type Ia supernova, white dwarf, standard candle, brightness, inverse-square rule, redshift, megaparsec, expansion, matter, dark energy, flat universe, Hubble constant, deceleration number, sigma. "Open the Words and formulas box for each."

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)

1. **NASA: What is dark energy?** — `https://science.nasa.gov/universe/the-universe-is-expanding-faster-these-days-and-dark-energy-is-responsible-so-what-is-dark-energy` — "NASA's plain explainer on what dark energy is, how distant supernovae that looked dimmer than expected led to its discovery in 1998, and four ideas for what it could be." *(read)*
2. **NASA: Building Blocks of the universe** — `https://science.nasa.gov/universe/overview/building-blocks/` — "NASA's short page on how much of the universe is ordinary matter, dark matter and dark energy (5, 27 and 68 percent)." *(read; no year or data set stated on the page)*
3. **NASA Roman Space Telescope: dark energy** — `https://science.nasa.gov/mission/roman-space-telescope/dark-energy` — "How a coming NASA telescope will use thousands of supernovae to test dark energy, including whether it changes over time." *(read)*
4. **Chandra: Supernovas and supernova remnants** — `https://chandra.harvard.edu/xray_sources/supernovas.html` — "A plain page from NASA's Chandra X-ray Center on how a white dwarf becomes a Type Ia supernova and why these explosions work as standard candles." *(read)*
5. **NASA SVS: Standard candle supernovae** — `https://svs.gsfc.nasa.gov/vis/a010000/a013800/a013852/13852_Roman_Standard_Candle_Supernovae_transP.html` — "A transcript of a short NASA video that explains what a standard candle is and how Type Ia supernovae are used to measure distance." *(read; a transcript)*
6. **NASA Cosmic Times: Fool-proofing galactic candles (1993)** — `https://imagine.gsfc.nasa.gov/educators/programs/cosmictimes/online_edition/1993/foolproof.html` — "A short NASA article, written as 1993 news, on how astronomers learned that brighter Type Ia supernovae fade more slowly and used that to correct their distances." *(read; written in 1993)*
7. **Royal Swedish Academy of Sciences: the 2011 Nobel Prize in Physics** — `https://www.kva.se/en/news/nobelpriset-i-fysik-2011-2/` — "The announcement from the academy that awards the prize: who won, and why, for finding that the expansion of the universe is speeding up." *(read; nobelprize.org itself could not be opened; the page quotes a 2011 figure of 'roughly 75 percent' for dark energy, which is older than NASA's 68 percent, and the page does not use it)*
8. **Riess and others (1998): supernova evidence for an accelerating universe** — `https://arxiv.org/abs/astro-ph/9805201` — "The first team's paper. A technical paper; the abstract (the summary) is the readable part." *(abstract read only)*
9. **Perlmutter and others (1999): 42 high-redshift supernovae** — `https://arxiv.org/abs/astro-ph/9812133` — "The second team's paper. A technical paper; the abstract is the readable part." *(abstract read only)*
10. **Planck Collaboration (2018): cosmological parameters** — `https://arxiv.org/abs/1807.06209` — "The paper behind the most precise measure of how much of the universe is matter (about 31.5 percent). A technical paper; read the abstract only." *(abstract read, partly: see "What the sources changed" 1)*
11. **NASA: Dark Matter** — `https://science.nasa.gov/dark-matter/` — "NASA's page on dark matter, the other 'dark' ingredient: how it holds galaxies together and how it was found. Read it beside this experiment to see the difference." *(read; no date or data set on the 27 percent)*
12. **ESA Euclid: What is dark energy?** — `https://sci.esa.int/web/euclid/-/what-is-dark-energy-` — "The European Space Agency's plain explainer on dark energy, including the idea that it is a constant property of empty space and how the Euclid telescope will test that." *(read)*
13. **ESA: The dark Universe** — `https://www.esa.int/Science_Exploration/Space_Science/Euclid/The_dark_Universe` — "A short ESA page that sets dark matter and dark energy side by side." *(read)*
14. **DESI Collaboration (2025): baryon acoustic oscillation results** — `https://arxiv.org/abs/2503.14738` — "The 2025 survey result that hints dark energy may change over time. A technical paper; the abstract is the readable part." *(abstract read)*

**Gaps (§29 rule 3(c)):** no official page read says whether dark matter and dark energy might share a source (the intro says only that the sources do not say); the **NASA/JPL Education** page on dark matter and dark energy (jpl.nasa.gov/edu, updated 18 Jun 2025) was read by a helper but returned HTTP 403 to my own check, so it is **not linked**; **dark matter thinning out as space stretches** was not found on any page read, so the page does not say it; no plain official page found for **"billions of Suns"** (dropped); **nobelprize.org** returned 403 (the Royal Swedish Academy's page stands in); no ESA page with the 68 / 27 / 5 split was found (ESA's Planck "cosmic recipe" URL returned 404; an ESA Planck page that loaded gave no percentages); no plain official page defining **"deceleration parameter"** (defined in the words box); no plain official page for **"inverse-square rule"** was searched (a standard idea, worked in the page's own words). Candidates seen but not read: none.

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses. Then you will press Run and watch three exploding stars at three distances, one graph and one small panel, all drawn for the universe astronomers' measurements point to. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures."

**Guess 1 (as now):** "If the universe contained only matter, how would gravity affect the expansion?" **Slow it down / Speed it up / Not change it.**

**Guess 2 (as now):** "Now suppose the expansion were speeding up instead. A faraway supernova's light would travel through space that has been stretching faster and faster. Compared with a universe that is slowing down, would that supernova look brighter, the same, or dimmer?" **Brighter / The same / Dimmer.**
*(§12 check: the wording of both questions is unchanged from the page the owner approved; Guess 2 already states its premise (speeding up) and not its answer.)*

**Locked line (after Run):** "Your guesses are locked while you try other settings. To change them, press Start over." **Start over** is always visible and greyed out until a guess is chosen or a run exists, and while a run plays. It clears the guesses, the runs, the results and the tutor, and returns the page to its first state.

**Run:** one run plays four seconds (fixed; playback speed never changes the result, §11). Before Run the supernova picture shows only Earth and the three supernova positions with their redshift labels. At Run: the dashed rings (what a matter-only universe predicts) and the blue line appear; the glowing green disks ease from the ring size to their final size; the green dashed line and the panel's curve are drawn out from the left; "x% as bright" labels fill in. **The white guess marks appear when the run ends (§12, A4).**

**The panel (new): "Is the expansion speeding up or slowing down today?"** A small graph on its own scale beside the brightness graph. Across the bottom: the share of dark energy, 0 to 90 percent. Up the side: the **deceleration number** (explained in the caption): above zero means the expansion is slowing down, below zero means it is speeding up, on the line means steady. The curve is drawn when the run starts. Two dots on it: a blue dot at 0 percent ("matter only") and a green dot at 70 percent ("astronomers' best fit"). A dashed vertical line marks the share where the curve crosses zero (33 percent), labelled "the speed-up begins here (in this model)".

**On-canvas labels (new or kept):** supernova picture: title (kept), "Earth" (kept), "redshift 0.2 / 0.5 / 0.8" (kept), "x% as bright" (kept), the legend (kept, with its wording changed to "dashed ring = how bright it would look in a matter-only universe" and "green disk = how bright it looks with astronomers' best fit (70% dark energy)"); **new**: "a supernova" beside the first disk, "the same true brightness for all three (assumed)". Graph: title, axes, legend (kept); **new**: "calculated here" under the blue and green legend lines. Panel: title, axes, "slowing down" above the zero line and "speeding up" below it, the two dots' labels.

**White guess marks (drawn when the run ends; each with a "YOUR GUESS" box joined by a line):**
- **Guess 1: a white arrow on the panel at 0 percent (matter only).** "Slow it down": an arrow pointing up from the zero line (towards "slowing down"). "Speed it up": an arrow pointing down. "Not change it": a white dot on the zero line. Box: "YOUR GUESS: gravity alone slows / speeds up / does not change the expansion". **A marker only**: the arrow's length is fixed (0.3 on the panel's scale) and means nothing as a number; the blue dot shows the real value. The caption says so.
- **Guess 2: two white marks at redshift 0.5.** (a) *On the supernova picture:* a white ring round the middle supernova. "Brighter": larger than the dashed ring (1.3 times its radius). "The same": the same size as the dashed ring. "Dimmer": smaller (0.7 times its radius). (b) *On the brightness graph:* a white marker at redshift 0.5. "Brighter": above the blue line at 1.10. "The same": on the blue line at 1.00. "Dimmer": below it at 0.85. Box on each: "YOUR GUESS: it looks brighter / the same / dimmer than a matter-only universe". **Markers only**: the sizes and heights are fixed, not your own numbers. The caption says so. *(the graph's vertical scale grows from 1.05 to 1.15 at the top so the "brighter" marker fits.)*

**Where the real picture comes from (under the pictures).**
- "**Measured:** the astronomers' best fit of about **70 percent** dark energy is a rounded value. NASA gives 'approximately 68.3 to 70%'. It comes from real supernova measurements, first reported in 1998 and 1999 by two teams, and many measurements since. It is given here, not worked out."
- "**Calculated here:** every distance, every brightness, the blue line, the green dashed line, the panel's curve and the redshift-0.5 numbers, from the formulas in the Words and formulas box using the page's 70 km/s per megaparsec. **The green line is a calculation at 70 percent, not a plot of supernovae.**"
- "**Imagined for the question:** the three supernovae at redshifts 0.2, 0.5 and 0.8; the assumption that all three are exactly equally bright; the 'matter-only universe' (we can't visit one); and, in Part 2, your own share of dark energy."
- "**Your guess:** the white marks only."

### Caption: How to read this diagram *(beneath the pictures; each section appears as its picture appears)*

**The three pictures.**
- "**Left: three exploding stars.** **Earth** is on the far left, where we are looking from. The three stars are **Type Ia supernovae** at redshifts 0.2, 0.5 and 0.8. A bigger redshift means farther away. We assume all three are exactly equally bright in truth, so any difference in how bright they look comes from distance alone."
- "**Middle: a graph of brightness against redshift.** Across the bottom is redshift (how far away, from 0 to 1). Up the side is **brightness compared with a matter-only universe**: 1.0 means 'exactly as bright as a matter-only universe predicts' and 0.7 means '70 percent as bright'."
- "**Right: a panel on whether the expansion is speeding up or slowing down today.** Across the bottom is the share of dark energy (0 to 90 percent). Up the side is the **deceleration number**. Above the zero line the expansion is slowing down; below it, speeding up. It is a number this page's model gives for 'today' in each universe."

**The marks.**
- "The **dashed blue ring** and the **blue line** are the **matter-only prediction**: how bright each supernova would look in a universe made of only matter. The blue line is flat at 1.0 because everything is measured against it."
- "The **glowing green disk** and the **green dashed line** are how bright the supernova looks, and the line astronomers' best fit gives. A disk's *area* is drawn in proportion to its brightness; the percentage under it says how bright it is compared with its ring."
- "The **blue dot** and the **green dot** on the panel mark two universes: matter only (0 percent) and the best fit (70 percent)."
- "The **white marks** are **your guesses**. They are only marks: guess 1 is an arrow or a dot with a fixed length; guess 2 is a ring and a marker with fixed sizes. They are not your numbers, and they do not say right or wrong."

**A worked moment (real numbers).** "Look at the middle supernova, at redshift 0.5. A matter-only universe puts it at about **2,358 Mpc**. The best fit puts it at about **2,833 Mpc**. Brightness falls with the square of the distance, so compared with matter-only it is (2,358 ÷ 2,833)² = 0.8324² = **0.69**: about 69 percent as bright, or 31 percent dimmer."
*(calculated; matches the specification's table; [recheck in the module])*

**What to look for** *(each item appears once its feature is drawn)*
1. **Look at** the green disk at redshift 0.5 inside its dashed ring. **What it means:** the disk is smaller; it is 69 percent as bright as the ring. **Why it matters:** the ring is what a matter-only universe predicts, so the gap between ring and disk is the difference the experiment is built to show.
2. **Look at** the green dashed line against the blue line, from left to right. **What it means:** they start together at redshift 0 and spread apart: the green line is at 0.83 at redshift 0.2, 0.69 at 0.5, 0.61 at 0.8 and 0.58 at 1. **Why it matters:** the farther away a supernova is, the bigger the difference between the two universes, so only very distant supernovae can tell them apart.
3. **Look at** where the lines meet, at the far left. **What it means:** at redshift 0.01 the two universes put a supernova at almost the same distance (a difference of half of one percent). **Why it matters:** this is why Hubble's simple formula (Cosmology 1) worked for nearby galaxies: the versions of the universe disagree only at large distances.
4. **Look at** the blue dot and the green dot on the panel. **What it means:** the blue dot sits at +0.50, and the green dot at −0.55. **Why it matters:** the deceleration number is the page's way of saying 'slowing or speeding up today', and the two universes sit on opposite sides of zero.
5. **Look at** the white marks. **What it means:** each shows where your guess sat against the real picture. **Why it matters:** you can compare your guess with the real picture directly; the tutor goes through each guess in Part 4.

*(Not stated here, held for the tutor: that dimmer means farther away and that farther means the expansion sped up; why matter slows the expansion; the verdict on both guesses; the history of the 1998 discovery.)*

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now choose your own share of dark energy and see what changes. The amber line, the amber disks and the amber dot show your universe next to the best fit. **Your guesses do not change anything here; the share does.**"

**Note beside the controls.** "Your guesses from Part 1 are locked. Changing the share changes only the amber drawings, and the 'your universe' columns in Part 3. It does not change the blue line, the green line, the dashed rings, the tables' other columns or your white marks. The shares are **trial values**: they show what would happen in a universe with that much dark energy, and they do not say the real universe is like that. While the share is on the best fit (70 percent), your amber drawings lie exactly on the green ones, so change the share to see something move."

**Controls (as now):** None (matter only) / The best fit (about 70 percent) / Custom, 0 to 90 percent. A change **updates the Part 2 drawing at once and never hides Parts 3 and 4, and the tutor is not reset.** The Part 2 pictures play from the first state whenever the learner presses Part 2's own Run.

**Part 2's pictures:** the supernova picture with **amber disks** for the learner's share; the brightness graph with the **amber line**; the panel with an **amber dot** at the learner's share. A one-line readout: "At *x* percent, today the expansion is slowing down / speeding up (deceleration number *q*)." *(the same line the old page gave, now beside the amber dot, no longer above the pictures before Run.)*

**Caption additions (Part 2):** "The **amber** disks, line and dot are your trial share. Where the amber line sits **below** the blue line, the stars look dimmer than a matter-only universe predicts. If the amber line lies on the green line, your universe matches astronomers' best fit. The amber dot slides along the panel's curve as you change the share, and crosses the zero line at about 33 percent." *(the old 'Things to try' bullets are replaced by these three sentences and a "What to look for": Look at the amber line / What it means / Why it matters, for the three presets.)*

---

## 5. Part 3: The results (teal)

**Lead.** "Here are the numbers behind the pictures, with a short guide to reading them."

### Table 1: a check-up
| What we check | What we expect | What we found | Reading |
|---|---|---|---|
| (a) Expansion today, matter only | Slowing down (gravity pulls matter together) *[to the tutor: not stated here; see note]* | deceleration number +0.50 (slowing down) | calculated here |
| (a2) Expansion today, best fit | Speeding up, as the 1998 and 1999 supernova results found (NASA) | −0.55 (speeding up) | the same direction as the published finding |
| (b) Brightness at redshift 0.5, best fit | 1.00 in a matter-only universe | 0.69 | less |
| (c) Share at which the speed-up begins | the model's own value, exactly 1/3 (33 percent) | the best fit, 70 percent, is well above it | calculated here only |
| (d) The best fit's dark energy share | NASA: "approximately 68.3 to 70%" | 70 percent | within NASA's stated range (at its top) |

*(§12: row (a)'s "What we expect" shows **only the number**, not the word "slowing down", **until the learner reaches the tutor's explanation**, because the word is Guess 1's answer. Open question: should rows (a) and (a2) appear before the tutor at all? Default: they appear, with the readings 'calculated here' and 'speeding up, as found in 1998 and 1999'; the word 'slowing down' in the "What we found" column of (a) is shown only after the learner has reached the tutor's explanation, and before that the cell reads "calculated here: +0.50" with the sign explained in the note. **Question C.**)*

**What this table tells us**
- **(a) and (a2): today's expansion.** *What it is:* the deceleration number says, in one number, whether the expansion is slowing down (above zero), speeding up (below zero) or steady (zero) today. *What it means:* in this model matter alone gives +0.50 and the best fit gives −0.55, so the two universes are on opposite sides of zero. *Why it matters:* it turns a long history into one number that anybody can compare. Think of a car's dashboard: the sign says whether you are on the accelerator or the brake. It is a model number, calculated here: q = 0.5 − 1.5 × share, so at 70 percent q = 0.5 − 1.05 = −0.55.
- **(b) Brightness at redshift 0.5.** *What it is:* how bright the supernova looks compared with a matter-only universe. *What it means:* 0.69, so 31 percent dimmer, which means it is about 20 percent farther away (2,833 against 2,358 Mpc). *Why it matters:* a dimmer-than-expected supernova is farther away than expected, and distance records the stretching's history. **Careful with published numbers:** Riess and others (1998) reported distances 10 to 15 percent *farther* than a universe with a low matter density (20 percent) and no dark energy. That is a different comparison from this page's (a universe that is all matter), so the two percentages cannot be set side by side. *How sure:* the 69 percent is a calculation at a rounded 70 percent, not a measurement.
- **(c) Where the speed-up begins.** *What it is:* the share at which the deceleration number reaches zero. *What it means:* in this model, 33 percent: for any share above it the expansion speeds up. *Why it matters:* it shows that a **fairly small** share can win. Matter's pull and dark energy's push balance out at one third dark energy; the real universe is at about double that. *How sure:* this is the page's model (flat, constant dark energy), not a measurement.
- **(d) The best fit.** *What it is:* the share of the universe's energy that astronomers' fits give to dark energy. *What it means:* the page's 70 percent is a rounded value; NASA's two pages say "approximately 68.3 to 70%" and 68 percent, and Planck's matter share (0.315 ± 0.007) leaves 68.5 percent for dark energy in a flat universe (worked out here, not stated in the paper's abstract). *Why it matters:* this share fixes the green line. A few percent either way would not change the story. *How sure:* the exact value depends on the data set and the date; none of the pages read gives both.

### Table 2: how far and how bright
Columns: Redshift / Distance, matter only (Mpc) / Distance, your universe (Mpc) / Brightness / **Your guess** (tag on the redshift-0.5 row only). Rows 0.2, 0.5, 0.8. *(as now; the "your universe" columns follow Part 2's share; at 70 percent they show 980 / 2,833 / 5,018.)*

**What this table tells us**
- *What it is:* the distance each supernova appears to have in each universe, and how bright it looks compared with a matter-only universe.
- *What it means:* at 70 percent, a supernova at redshift 0.2 looks 83 percent as bright, at 0.5 69 percent and at 0.8 61 percent, because its distance is 980 against 896, 2,833 against 2,358 and 5,018 against 3,926 Mpc. The farther the supernova, the bigger the gap.
- *Why it matters:* the gap grows with distance, which is why astronomers needed supernovae out to redshift 0.5 and beyond, and why nearby galaxies could not settle the question.
- **A worked example (kept).** At redshift 0.5, (2,358 ÷ 2,833)² = 0.69.
- **Trial values (new).** The 'your universe' columns follow Part 2's share. "These are trial values. They show what would happen in a universe with that much dark energy, and do not say the real universe is like that."

**Your guesses beside the results.** "Guess 1: *Slow it down / Speed it up / Not change it* (about gravity in a matter-only universe), shown at the deceleration-number row of Table 1. Guess 2: *Brighter / The same / Dimmer* (about a faraway supernova if the expansion were speeding up), shown at the redshift-0.5 row of Table 2 (0.69). It shows the guess only, never 'matched' or 'right'; the tutor does that."

**"Dimmer" and "slowing down" are NOT spelled out in the results sentences** (the old 'with this share, distant supernovae look dimmer than the best fit says' lines go to Part 2's readout as numbers only, with 'dimmer' and 'brighter' allowed since Guess 2 is by then locked and the run is over). *(Recommended: the old verdict sentence about the 5 percent band becomes "At *x* percent the brightness stays within 5 percent of the best fit's at every redshift. (The 5 percent is this page's own yardstick, not a published one.) This happens for shares from about 66 to 74 percent." [calculated; to be tested].)*

**Remember (kept, shortened):** "This model treats the universe as flat, with only matter and a constant dark energy, and treats supernovae as equally bright. The best fit is a model, not raw data. The Hubble constant is the illustrative 70 km/s per megaparsec; the real value is still debated (about 67 to 73)."

---

## 6. Part 4: The tutor (blue)

**Lead.** "A tutor will ask you three questions, then go over what you saw and mark your two guesses."

**Questions (point to the marks by name):**
1. *Observe:* "Look at the blue line (matter only) and the green dashed line (astronomers' best fit) on the graph, and at the glowing green disks inside their dashed rings. What do you notice as redshift increases?"
2. *Compare:* "You made two guesses, drawn in white: *[guess 1's label]* on the panel, and *[guess 2's label]* on the supernova picture and the graph. Look at the white marks beside the real picture. What do you notice?" *(the marks named; the guess's answer is not said)*
3. *Conceptual:* "If distant supernovae look dimmer than a slowing universe predicts, what must have happened to the expansion while their light was on its way to us?" *(kept)*

**Explanation (each guess marked here and nowhere earlier; wording drafted for approval):**
1. *(kept)* "**A standard candle's dimness tells us its distance.** A Type Ia supernova gives out about the same amount of light each time, and light spreads out as it travels, so brightness falls with the square of the distance: a supernova that looks one quarter as bright is twice as far away."
2. **Your first guess** — *you said gravity alone would **[slow it down / speed it up / not change]** the expansion (the white arrow on the panel).* "In a universe with only matter, gravity slows the expansion: matter pulls on other matter, which works against the stretching. That is the blue dot at +0.50 on the panel. **[If the guess was 'slow it down':] That is what you guessed, so the white arrow points the same way as the blue dot.** [Otherwise:] **That is not what you guessed.**" *(marked here, after the run; 'daily-life' picture: a ball rolling up a hill slows down because the hill pulls back; kept short; for approval.)*
3. **Your second guess** — *you said a faraway supernova would **[look brighter / the same / dimmer]** (the white ring and the white marker).* "In the best fit it looks dimmer: at redshift 0.5, 69 percent as bright, because the extra stretching of space has carried it farther away. **[Marked as above.]**" *(kept in substance; the old "so your prediction was right/off" lines move here.)*
4. *(rewritten, sourced)* "**Real distant supernovae look dimmer than a slowing universe predicts.** So they are farther away than a slowing universe says, and the expansion must have sped up while their light was on its way. Two teams found this in 1998 (the 2011 Nobel Prize in Physics went to three of the astronomers involved: the academy's words are 'for the discovery of the accelerating expansion of the Universe through observations of distant supernovae')." *(Royal Swedish Academy page; [recheck]; does not say 'two teams in 1998 and 1999' because the page says 1998; Perlmutter's paper is dated December 1998 and published in 1999, which is why the old page said '1998 and 1999': **question D**.)*
5. *(rewritten, sourced)* "**Dark energy is the name for whatever drives the speed-up.** NASA gives it about 68 percent of the universe's energy, with dark matter about 27 percent and ordinary matter about 5 percent. What it is, nobody yet knows. NASA lists four ideas (a built-in energy of empty space, a new kind of changing energy, odd 'defects' in space, or a flaw in our theory of gravity). The simplest model, used here, is a constant energy of empty space. As of November 2026, whether it is truly constant is being tested: DESI's 2025 result prefers a changing one by 2.8 to 4.2 sigma, and the Cosmic Horizons experiment on evolving dark energy looks at it."
6. *(kept, extended; may now state the matter's effect because the guesses are marked)* "**Dark energy is a different idea from dark matter** (Cosmology 4). Dark matter has mass and so has gravity; it helps hold galaxies together. Dark energy is whatever makes the expansion of space itself speed up. They were found in different ways (orbit speeds and lensing for dark matter, dim supernovae for dark energy) and they take different shares of the universe (about 27 and 68 percent, NASA). Nobody yet knows what either one is, and the sources read here do not say whether they are connected."
7. *(kept)* "**Nearby objects agree in every universe.** For close-by supernovae all the models give almost the same distance (at redshift 0.01, within half of one percent), which is why the simple formula in Cosmology 1 worked for nearby galaxies."
8. *(kept, shortened)* "**Not covered here:** what dark energy is, whether it changes over time, radiation in the early universe, curved universes and how real supernova data are calibrated. Remember that this experiment used a flat universe, a constant dark energy and perfectly equal supernovae, and that the best fit is a model, not raw data."

---

## 7. Words and formulas (collapsed box above Part 1)
**Plain meanings** (each with its real-life or worked anchor): **supernova** (an exploding star); **Type Ia supernova** (the kind used here: a white dwarf that explodes after pulling gas from a companion); **white dwarf** (the dense, glowing core left when a star like the Sun runs out of fuel); **standard candle** (an object whose true brightness is known, such as a 100-watt bulb); **brightness** (how much light reaches us); **inverse-square rule** (brightness = true brightness ÷ (distance × distance), up to a constant: twice as far → one quarter as bright); **redshift**; **megaparsec (Mpc)** (about 3.26 million light-years); **expansion** (space stretching); **matter**; **dark energy** (the name for whatever could make the expansion speed up; not the same as dark matter); **dark matter** (invisible matter that has gravity and helps hold galaxies together; Cosmology 4); **flat universe**; **Hubble constant** (70 km/s per Mpc here); **deceleration number** (positive: slowing down, negative: speeding up, zero: steady); **sigma** (a measure of how unlikely a pattern is to be chance: bigger is less likely); **the four ideas for dark energy** (a built-in energy of empty space, a new changing energy called quintessence, cosmic defects, a flaw in general relativity: NASA). *(held back until after the Run (§12): that gravity slows the expansion and that distant supernovae are dimmer in the best fit.)*

**Formulas with worked examples (from the page's own numbers):**
- **Brightness against distance:** brightness compared with matter-only = (distance matter-only ÷ distance your universe)². At redshift 0.5: (2,358 ÷ 2,833)² = 0.69.
- **Deceleration number:** q = 0.5 − 1.5 × (dark energy share). At 70 percent: 0.5 − 1.05 = −0.55. At 0: +0.50. It is zero at 1/3: 0.5 − 1.5 × (1/3) = 0.
- **Expansion rate:** E(z) = √[(1 − share) × (1 + z)³ + share]. At redshift 0.5 and share 0.7: √[0.3 × 3.375 + 0.7] = √1.7125 = 1.309. *(the distance itself needs a sum over many steps; the page does it by computer and says so.)*
- **Luminosity distance:** (1 + redshift) × (a sum of 1/E over the path, times c ÷ H₀). The page does the sum with Simpson's rule; the matter-only and all-dark-energy cases have closed forms that the tests compare against.

---

## 8. Source table (for the specification's "Audit Update")
| Idea or number | Source | Read? | Date |
|---|---|---|---|
| Dark energy and acceleration; 68.3 to 70 percent; the four ideas; the 1998 supernova finding | NASA, "What is Dark Energy?" | read (helper) | 2026-11-15 |
| 5 / 27 / 68 percent | NASA, "Building Blocks" | read (helper); no year or data set | 2026-11-15 |
| Roman and changing dark energy | NASA Roman, "Dark Energy" | read (helper) | 2026-11-15 |
| Type Ia: white dwarf, 1.4 solar masses, about the same light | Chandra, "Supernovas and supernova remnants" | read (helper) | 2026-11-15 |
| Standard candle; white dwarf as "leftover core" | NASA SVS transcript | read (helper) | 2026-11-15 |
| Brighter ones fade more slowly (15 days; Phillips) | NASA Cosmic Times 1993 | read (helper) | 2026-11-15 |
| 2011 Nobel Prize, winners, motivation, two teams, 1998 | Royal Swedish Academy of Sciences | read (helper); nobelprize.org 403, not read | 2026-11-15 |
| 10 to 15 percent farther; 16 + 34 supernovae | Riess and others 1998, abstract | abstract read | 2026-11-15 |
| 42 supernovae; matter share 0.28 | Perlmutter and others 1999, abstract | abstract read | 2026-11-15 |
| Matter share 0.315 ± 0.007 (dark energy 0.685 is 1 − 0.315, not stated) | Planck 2018 VI, abstract | abstract read, partly | 2026-11-15 |
| 2.8 to 4.2 sigma for evolving dark energy | DESI 2025, abstract | abstract read | 2026-11-15 |
| Dark energy "is not the same as dark matter"; four ideas | NASA, "What is Dark Energy?" | read (helper digest) | 2026-11-15 |
| Dark matter as "invisible glue"; 27 percent | NASA, "Dark Matter" | read (helper digest) | 2026-11-15 |
| Dark energy a constant property of the vacuum; found from supernovae in the late 1990s | ESA Euclid, "What is dark energy?" | read (helper digest) | 2026-11-15 |
| Dark matter and dark energy "distinct" | ESA, "The dark Universe" | read (helper digest; the 'not understood as the same phenomenon' wording is the digest's, not used) | 2026-11-15 |
| Whether they share a source | none | **gap: no page says** | 2026-11-15 |
| "Billions of Suns" | none official | **gap** | 2026-11-15 |
| Parsec in light-years; Hubble tension | earlier experiments' sources | to be re-read before printing | |

## Questions for the owner on this draft
A. **70 percent vs NASA's range.** Default: keep 70, say it is at the top of NASA's "approximately 68.3 to 70%", change nothing in the physics.
B. **"Billions of Suns."** Default: dropped (no official source).
C. **Table 1, row (a).** Default: show "+0.50, calculated here" and reveal the word "slowing down" only after the tutor's explanation.
D. **"1998 and 1999".** Default: say "1998" for the finding (the academy's page) and mention the two papers' dates (Riess May 1998 on arXiv; Perlmutter December 1998 on arXiv, published 1999) in the link text only if you want it.
E. **Part 1's disks green, Part 2's amber** (so amber does not hide on the green line). Default: yes.
F. **Graph vertical scale to 1.15** so the "brighter" marker fits. Default: yes.

G. **Dark energy against dark matter (new, 2026-11-15).** Default as drafted: a comparison table, the balloon-and-coins picture and the plain statement that the sources do not say whether they share a source. Say if you want the balloon picture changed or dropped, or the "do they share a source?" paragraph worded differently.

## Not checked
Not built, not run, not viewed in a browser; the wording is not yet approved; helper-read sources must be re-read against live pages before printing (nobelprize.org was not read); all 14 links loaded (HTTP 200) on 2026-11-15; the module's guess-marker and verdict-band numbers are not yet in a test (the 66 to 74 percent band and the 1/3 crossing were worked by hand in node); the worked numbers in the caption come from a hand run and are to be rechecked in the module.


---

## Addendum, 2026-11-15 (owner's request: clarify "standard candle", and explain the inverse-square rule briefly) — approved as drafted

**Replaces** the sentence "An object whose true brightness is known is called a standard candle." (now "An object like that is called a standard candle; more on what that means just below.") and **adds**, after the headlight paragraph and before "The standard candle used here":

- **Why "squared"?** "The light spreads out over the surface of a ball that keeps growing as the light travels. Twice as far, and the ball's surface is 2 × 2 = 4 times as big, so each patch of it, including the patch that is your eye, gets one quarter of the light." *(the geometric reason for the rule; written here, the owner's to approve, §15.)*
- **What is a standard candle?** A *kind* of object or event that gives out a known amount of light; every one of that kind gives out the same amount; different kinds for different distances. *(NASA SVS: "a type of object or event that emits a specific, known amount of light".)*
- **Two kinds of candle.** Cepheid variables (steady pulse tied to true brightness; nearer galaxies; the Hubble Key Project measured almost 800 in 18 galaxies out to 65 million light-years) and Type Ia supernovae (far brighter, used much farther away; the kind this experiment uses). *(ESA/Hubble "Cosmic distance ladder"; NASA "Hubble Completes Eight-Year Effort"; NASA "Webb and Hubble": "so bright they are used to measure cosmic distances far beyond the range of the Cepheids".)*
- **How is a candle's true brightness found?** Parallax calibrates nearby Cepheids; Cepheids in galaxies that have hosted a supernova fix the supernova's true brightness; "each rung or measurement technique relies upon the previous step for calibration" (NASA); the cosmic distance ladder; the pacing-a-road-and-a-measuring-wheel picture.
- **In this experiment** the supernovae are treated as exactly equally bright and all brightness is compared with a matter-only universe, so the true brightness cancels out.

**Words box:** longer "Standard candle" and "Inverse-square rule" entries; new "Cepheid variable", "Parallax" and "Cosmic distance ladder". **"Some new words"** line extended.

**Three links added above Part 1** (all loaded, HTTP 200, 2026-11-15; read through helper digests): ESA/Hubble "Cosmic distance ladder" (`esahubble.org/images/heic1611a/`); NASA "Webb and Hubble telescopes affirm universe's expansion rate puzzle persists"; NASA "Hubble completes eight-year effort to measure the expanding universe" (the source of the 800 / 18 / 65 million figures, held in the module as `PUBLISHED_KEY_PROJECT`).

**Left out on purpose (no official page read):** the tip of the red giant branch and other candles; Henrietta Leavitt and the name "period-luminosity relation" (NASA's page names her, but its date is only the digest's wording, and the formal name appeared only on non-official pages); "visible across billions of light-years" for Type Ia supernovae.

**Source table additions:** standard-candle definition (NASA SVS, read); Cepheids as standard candles and the parallax-Cepheid-Type Ia chain (ESA/Hubble heic1611a and opo1812a, read); Key Project figures (NASA, read); "each rung ... relies upon the previous step for calibration" (NASA Webb and Hubble, read). All through helper digests; every quote to be rechecked against the live page before it is printed.
