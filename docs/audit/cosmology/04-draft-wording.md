# Draft wording: Cosmology Experiment 4 (Dark Matter)
Date: 2026-11-14 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the fourth of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-14): "defaults" to the eleven questions at the end of `04-gap-report.md`.

**Facts in this draft come from pages fetched on 2026-11-14 through helper agents whose fetch tool returns short quotes and summaries, not raw text.** Every quotation and figure marked [recheck] must be compared with the live page before it is printed. All 12 links were also checked to load (HTTP 200) on 2026-11-14; loading is not the same as reading, so the source table says which were read. No page is linked that was not read. The source table is at the end.

## What the sources changed (read these first)
1. **The page's 220 km/s is lower than both published values read.** Eilers and others (2018): v_c at the Sun = 229.0 ± 0.2 km/s (systematic errors 2 to 5 percent). Reid and others (2014): 240 ± 8 km/s. The page calls 220 "the Milky Way near the Sun, and many other galaxies". **This draft keeps 220 (it is a given constant in the module and the physics is not changed), says it is a rounded teaching value a little below those two papers, and drops "and many other galaxies".** Changing it to 229 would change `OBSERVED_SPEED_KM_PER_S`, the "amount that matches" and its tests: a physics decision, so it is **question A** below, not made here.
2. **Eilers and others also say the real curve is "gently but significantly declining" beyond the inner 5 kpc.** That supports the page's existing line "real curves are not perfectly flat", which stays.
3. **"About five times as much dark matter as ordinary matter" is sourced** (NASA, Dark Matter 101: "five times as much dark matter as ordinary matter"; ESA Euclid: "around five to one"; NASA: 5 percent and 27 percent of the universe). It is a figure for the **whole universe**, not for the inside of 30 kpc, and the draft says so.
4. **"Dark matter has never been seen directly" has no page that says it outright.** The nearest fetched sentence is NASA Space Place: "we mostly know it is there because of its gravitational pull on visible matter". The draft uses that wording instead.
5. **MOND: no plain official page found** (NASA, ESA, ESA/Hubble and NOIRLab searched; no fetched page names it). The sentence "modified-gravity ideas such as MOND fit galaxy rotation curves well, but many astronomers think they have a harder time with other observations" has **no source**. By the default it is **dropped** from the tutor and replaced by a sourced sentence about what is unknown. Recorded as a gap, §29 rule 3(c). **Question B** if you want it back.
6. **Rubin and Ford's two original papers could not be fetched** (ADS returned HTTP 405; IOP links not found). The 1970 abstract ("spectra of sixty-seven H II regions from 3 to 24 kpc ...") and the 1980 one ("Neither high nor low luminosity Sc galaxies have falling rotation curves") are known only from **search summaries**. They are **not linked**. Two read pages stand in: NASA's Dark Matter page (Rubin looked at the outer stars of spirals) and Rubin's own account in Physics Today (author and date not captured: [recheck]).
7. **The Sun's lap is sourced (NASA StarChild, February 2000): "about 230 million years"**, and the model gives 225. The page's wording is dated 2000; NASA's Milky Way page gives the Sun's distance as about 8 kpc and Reid gives 8.34 ± 0.16. The draft says "about 8 kpc".
8. **Earth 29.8 km/s and Neptune 5.4 km/s are sourced** (NASA Planetary Fact Sheet, a table row, updated 13 November 2026). The Uranus-and-Neptune story of 1846 is sourced (NASA Neptune Facts).
9. **The share of dark matter inside the orbit (about 40 percent at 8 kpc, 80 percent at 30 kpc) has no published range read.** The check-up row (c) is therefore **left out**; the figure appears only as "calculated here" in a note, if you want it at all (question C).

## Layout
- **Above Part 1 (no heading):** a neutral introduction, a "Want to know more?" list, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** two guesses; **Start over** (always visible); **Run**; the galaxy picture with **no halo** and three stars moving at the visible-matter-only speeds; the graph with the blue and green lines; white guess marks after the Run; "Where the real picture comes from"; one caption.
- **Part 2 (pink), "Now try it yourself":** the amount of dark matter (none, matching, custom 0 to 2); the halo, the purple line and the faster stars; its own caption.
- **Part 3 (teal), "The results":** Table 1 (a check-up), Table 2 (speeds at three distances), "What this table tells us" under each, the learner's guesses beside the results.
- **Part 4 (blue), "The tutor":** three questions, then an explanation that marks each guess.
- **Colours:** white only for the learner's guess; blue for visible-matter-only; green dashed for the measured speed; purple for the learner's dark matter (the line, the halo and the faster stars), shown only from Part 2; a dark background so white shows.

---

## 1. Introduction (above Part 1; no answers given, §12)

**Title:** Cosmology 4: Dark Matter

**The question.** "Is the matter we can see in a galaxy all the matter there is?"

**What happens.** "Stars orbit the centre of their galaxy, held in orbit by gravity, just as planets orbit the Sun. In the Orbits experiment (Gravity and Curved Spacetime) you found that, for a given mass and distance, there is one 'just right' sideways speed that keeps an object circling. That speed depends on how much mass is pulling inward: more mass inside the orbit means a faster orbit is needed. So by measuring how fast stars orbit, we can work out how much mass is pulling on them: in effect, we can weigh the galaxy. Here we compare two things: the orbit speeds we would expect from the matter we can see (stars and gas), and the speeds astronomers measure. The name for matter that gives off no light, but still pulls on other things with gravity, is **dark matter**. How much of it there is, if any, is what this experiment explores." *(kept from the present page; the Orbits name to be checked against the sidebar)*

**A daily-life picture.** "Whirl a ball on a string. The faster the ball goes, the harder the string has to pull it inward, so if you could feel only the string's pull, you could tell how fast the ball was moving. In the same way, how fast stars orbit tells us how hard gravity is pulling them inward, and so how much mass is doing the pulling." *(kept)*

**Why even ask this.** "Almost everything we know about the universe comes from light. But gravity works whether or not something shines: a dark object pulls just as hard as a glowing one. That gives us a second, independent way to count the mass in a galaxy, one that does not depend on light at all. If the count from light and the count from gravity agree, the matter we can see is all there is. If they do not, that is worth investigating." *(**restored in full at the owner's instruction, 2026-11-14 ("add the 'what happens' content in the old page to the new one")**. The last two sentences are conditional and do not say which will happen; they were flagged in the gap report as pointing toward guess 2, and are kept as the owner asked.)*

**How are the speeds measured?** "Astronomers use the same idea as the Doppler effect: the light from stars and gas on the side of a galaxy that is moving toward us is shifted very slightly toward blue, and light from the side moving away is shifted very slightly toward red. How big that shift is tells us how fast they are moving, without anyone having to travel there." *(supported by NASA's Webb page: "While the star is moving toward us, its spectrum is blueshifted ... moving away ... redshifted" and "astronomers can use Doppler shift to calculate exactly how fast an object is moving toward or away from us" [recheck]; that page is about a star, so "stars and gas on a galaxy's two sides" is the page's own extension, **for the owner to approve**. The two cross-references "Hubble's Law (Experiment 1 of this chapter)" and "Gravitational Waves Experiment 5" are dropped; the Doppler effect is in the words box.)*

**A sealed-box picture.** "Imagine a sealed, opaque box with only a small window. Through the window you can see some of what is inside. Then you weigh the whole box on a scale. If the scale reads far more than the contents you can see should weigh, something you cannot see is also in there. Astronomers do the same with galaxies: the \"window\" is the light we can see, and the \"scale\" is gravity, read from how fast stars orbit." *(**restored in full at the owner's instruction, 2026-11-14.** It is conditional ("if the scale reads far more"), so it does not state what the page will show. The draft's earlier plan to move it to the tutor is withdrawn; the tutor's point 3 no longer repeats it, and instead says in one line that the box picture is what the learner saw: see Section 6.)*

**Improvement added to "What happens" (new, for approval):** "**A worked sum for the string.** A 1 kg ball whirled at 2 m/s on a 1 m string needs a pull of 1 × 2² ÷ 1 = 4 newtons; at 4 m/s it needs 1 × 4² ÷ 1 = 16 newtons, four times as much. A faster orbit needs a harder pull, in the same way." *(calculated: force = mass × speed² ÷ radius; a daily-life anchor for the sentence \"more mass inside the orbit means a faster orbit is needed\"; for the owner to approve, §15.)*

**New terms.** "Distances here are in **kiloparsecs (kpc)**. One kiloparsec is about 3,260 light-years. Our Sun is roughly 8 kpc from the centre of the Milky Way. A graph of how fast things orbit at different distances from the centre is called a **rotation curve**. Masses are measured in **solar masses**, where one solar mass is the mass of our Sun." *(kept; 3,260 light-years rests on NASA's "one parsec equals 3.26 light-years, 1 kpc is 1,000 parsecs" [recheck]; the Sun's 8 kpc on NASA Imagine.)*

**What you will do.** *(replaces "Your job" and "What to look for")* "Below, the page has four parts. **Part 1** asks for two guesses, then you press Run and watch stars orbit a galaxy that has only the matter we can see, while two lines are drawn on a graph. **Part 2** lets you add some invisible matter yourself and see what changes. **Part 3** gives the results, with a short guide to reading them. **Part 4** is a tutor who talks it over with you. **Your guesses never change the real pictures or tables. After you press Run they are drawn on the graph in white, and shown again beside the results. The amount of dark matter in Part 2 does change the purple line, the purple glow and the speed of the stars, and nothing else.**"

**What we assume.** *(the six present bullets, with these changes)*
- Newtonian gravity: *(kept; add "Newtonian means ordinary gravity as Newton described it" in the words box.)*
- Circular orbits, spherical mass: *(kept.)*
- "The mass shapes used here are simple formulas, not a fit to one real galaxy. Their numbers were chosen so that, when the right amount of dark matter is added, the speeds land near the Milky Way's measured values. The 'visible matter only' line is therefore a calculation from a teaching model, not a measurement." *(kept in substance; "so the results land near" made exact.)*
- **Changed:** "The 'measured' speed is a single reference value of **220 km/s**, rounded, for the Milky Way near the Sun. Published measurements give a little more (229 and 240 km/s in two papers), and other galaxies have values of their own. Real measured curves are not perfectly flat. The line is a given value, not worked out here." **[recheck: 229.0 ± 0.2, Eilers and others 2018; 240 ± 8, Reid and others 2014. Question A.]**
- Only the outer galaxy, 5 to 30 kpc: *(kept.)*
- "Nothing here claims to say what dark matter is. The purple glow is just a shape that supplies extra mass." *(kept.)*

**Some new words:** galaxy, orbit, solar mass, kiloparsec, light-year, km/s, rotation curve, visible matter, dark matter, halo, Doppler effect, Newtonian gravity, enclosed mass, circular speed. "Open the Words and formulas box for each."

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)

1. **NASA: Dark Matter** — `https://science.nasa.gov/dark-matter/` — "A plain NASA overview of what dark matter is, how astronomers found it by watching how fast stars in galaxies move, and how much of the universe it makes up." *(read; page dated Aug 12, 2026)*
2. **NASA: Dark Matter 101, Looking for the Missing Mass** — `https://science.nasa.gov/universe/stories/quick-reads/dark-matter-101-looking-for-the-missing-mass/` — "A short NASA story on why astronomers needed 'missing mass' to explain spiral galaxies." *(read)*
3. **NASA Space Place: What Is Dark Matter?** — `https://spaceplace.nasa.gov/dark-matter/en/` — "A short, simple NASA explainer written for young readers." *(read)*
4. **ESA Euclid: What is dark matter?** — `https://sci.esa.int/web/euclid/-/what-is-dark-matter-` — "A European Space Agency explainer that follows the story from the first galaxy-speed measurements to today." *(read; published 8 September 2020)*
5. **Physics Today: Seeing dark matter in the Andromeda galaxy** — `https://physicstoday.aip.org/opinion/seeing-dark-matter-in-the-andromeda-galaxy` — "An account of the 1970 Andromeda measurements, written by the astronomer behind them. Aimed at a reader with some science background." *(read; author and date not captured: [recheck] before approving "written by the astronomer behind them")*
6. **The Milky Way's circular speed, 5 to 25 kpc (Eilers and others, 2018)** — `https://arxiv.org/abs/1810.09466` — "The paper behind the value near 229 km/s. A technical paper; the abstract (summary) is the readable part." *(abstract read only)*
7. **The structure and speed of the Milky Way (Reid and others, 2014)** — `https://arxiv.org/abs/1401.5377` — "The paper behind the value near 240 km/s. A technical paper; the abstract is the readable part." *(abstract read only)*
8. **NASA: Doppler Shift of a Star's Spectrum** — `https://science.nasa.gov/asset/webb/doppler-shift-of-a-stars-spectrum/` — "A short NASA picture and caption showing how a moving star's light is shifted toward blue or red." *(read; about a star, not a galaxy)*
9. **NASA Imagine the Universe: The Milky Way** — `https://imagine.gsfc.nasa.gov/features/cosmic/milkyway_info.html` — "NASA's facts on the Milky Way's size, with kiloparsecs and the Sun's distance from the centre." *(read; this host was reported not loading on 2026-10-25, and it loaded on 2026-11-14: [recheck] before approving)*
10. **NASA Starchild: how long does the Sun take to orbit the galaxy?** — `https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question18.html` — "A short NASA answer: about 230 million years for one lap. Written in 2000." *(read)*
11. **NASA Planetary Fact Sheet** — `https://nssdc.gsfc.nasa.gov/planetary/factsheet/` — "A table of facts on each planet, including how fast each one moves around the Sun." *(read; a table, not a story)*
12. **NASA: Neptune Facts** — `https://science.nasa.gov/neptune/neptune-facts/` — "NASA's facts on Neptune, including how its planet was predicted from the odd path of Uranus in 1846." *(read)*

**Gaps (§29 rule 3(c)):** no plain official page for **MOND**; Rubin and Ford's original 1970 and 1980 papers **could not be fetched** (so not linked; "the original paper behind each result" is therefore met for the speed by Eilers and Reid, and for the historical measurement only by NASA's page and Rubin's own account); no plain official page **defining "rotation curve"** (NASA's Dark Matter page describes the idea without the name). Candidates seen but not read: NASA Hubble "dark matter" page, NASA StarChild dark matter page, NASA Imagine dark matter page.

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses. Then you will press Run and watch a galaxy made only of the matter we can see: three stars orbit it, and two lines are drawn on a graph. Your guesses are drawn on the graph in white. Nothing you guess changes the real picture."

**Guess 1 (as now):** "If the stars and gas we can see were all the mass in the galaxy, how would the orbit speed of a star far from the centre compare with a star nearer the centre?" **Faster / Slower / About the same.**

**Guess 2 (as now):** "Astronomers measure the real speeds of far-out stars. Do you think the measured speeds will match what the visible matter predicts?" **They will match / Faster than predicted / Slower than predicted.**

**Locked line (after Run):** "Your guesses are locked while you try other settings. To change them, press Start over." **Start over** is always visible and greyed out until a guess is chosen or a run exists, and while a run plays. It clears the guesses, the runs, the results and the tutor, and returns the page to its first state.

**Run:** one run plays six seconds of stars orbiting for a fixed span of a billion years of galaxy time (as now). The stars move at the visible-matter-only speeds. The blue line and the green dashed line are drawn when Run starts. The guess marks appear when the run ends (§12, A4).

**On-canvas labels (new or kept):** galaxy picture: "The galaxy, seen from above" (kept); "visible matter (stars, gas)" (kept); rings "8 kpc (about the Sun)", "16 kpc", "30 kpc" (kept); "= a star orbiting at that distance" (kept); **new**: each star labelled with its distance and speed ("star at 8 kpc, 169 km/s"); the line "no dark matter halo" in Part 1 (kept). Graph: title, axes, legend (kept); **new**: "measured near the Sun, rounded (given)" on the green line; "calculated here from a teaching model" on the blue line.

**White guess marks (drawn when the run ends; each with a "YOUR GUESS" box joined by a line):**
- **Guess 1: a white line from the blue line's start (5 kpc, 196 km/s).** "Faster": it rises to 256 km/s at 30 kpc. "About the same": it stays at 196. "Slower": it falls to 136 km/s at 30 kpc. Box: "YOUR GUESS: a far star goes faster / about the same / slower". **A direction only**: its slope is a fixed size and has no meaning as a number (the real blue line is separate). The caption says so.
- **Guess 2: a white marker at 30 kpc beside the blue line's end.** "They will match": a white "=" between the blue and green lines. "Faster": a white arrow pointing up, from the blue line's end towards the green line and past it. "Slower": a white arrow pointing down from the blue line's end. Box: "YOUR GUESS: measured speeds match / are faster than / are slower than the visible-matter line". **A marker only**: three answers carry no size. The caption says so.

**Where the real picture comes from (under the picture).**
- "**Measured:** the green dashed line, **220 km/s**, is a rounded reference value for the Milky Way near the Sun. Published measurements are a little higher (229 km/s, Eilers and others 2018; 240 km/s, Reid and others 2014). It is given, not worked out here."
- "**Calculated here:** the blue line, from a teaching model of the galaxy's visible matter, using v = √(G × M ÷ r). The stars' speeds, the length of each lap and the number of laps follow from it. The model was made up for this experiment; it is not a fit to a real galaxy."
- "**Imagined for the question:** the three stars' positions, the galaxy seen from above, and (in Part 2) the purple glow and the amount of dark matter. Nobody has photographed dark matter."
- "**Your guess:** the white marks only."

### Caption: How to read this diagram *(beneath the pictures; sections appear as their picture appears)*

**The two pictures.**
- "**Left: the galaxy, seen from above.** The bright patch in the middle is the **visible matter**: the stars and gas we can see. The three dashed rings are **8, 16 and 30 kpc** from the centre; 8 kpc is about where our Sun is in the Milky Way. A small star orbits on each ring. In Part 1 there is nothing else in this picture."
- "**Right: a graph of orbit speed against distance** from the centre (a **rotation curve**). Across the bottom is distance in kpc (5 to 30). Up the side is speed in **km/s** (kilometres per second; 220 km/s is about 800,000 km an hour)."

**The lines and marks.**
- "The **blue line** is the speed each star would need if the visible matter were all the mass. It is **calculated here** from a teaching model."
- "The **green dashed line** is a measured speed near the Sun, **220 km/s**, drawn flat across the graph as a reference. It is rounded and given."
- "The **white line or marker** is **your guess**. It is only a mark: guess 1 shows a direction (up, flat or down) with no size of its own, and guess 2 is a marker (an equals sign or an arrow) placed at 30 kpc. It does not say right or wrong."
- "A star's laps: the three stars move at the blue-line speeds for a fixed billion years of galaxy time, played back in six seconds. A faster star completes more laps."

**A worked moment (real numbers).** "Look at the star on the 8 kpc ring. The blue line says 169 km/s there. One lap is 2 × π × 8 kpc ÷ 169 km/s, which comes to about 290 million years. In the six seconds of the run, a billion years go past, so this star makes a little over three laps. *(calculated: 2π × 8 × 3.0857×10¹⁶ km ÷ 169.3 km/s ÷ 31,557,600 s = 2.9×10⁸ years; 10⁹ ÷ 2.9×10⁸ = 3.4 laps)* [recheck in the module]"

**What to look for** *(each item appears once its feature is drawn)*
1. **Look at** the blue line, left to right. **What it means:** it starts at 196 km/s at 5 kpc and ends at 101 km/s at 30 kpc: a drop of about half. **Why it matters:** this is the speed the visible matter alone would give, so it is what a star would need to stay in orbit if nothing else were pulling.
2. **Look at** the green dashed line. **What it means:** it stays at 220 km/s across the whole graph. **Why it matters:** it is the measured speed that the blue line is being compared with; it is a given value, not something this page works out.
3. **Look at** the gap between the two lines at 30 kpc. **What it means:** at 30 kpc the blue line is at 101 and the green line at 220, a difference of 119 km/s; at 8 kpc it is 169 and 220, a difference of 51. **Why it matters:** the experiment's question is whether the matter we can see is enough, and this gap is the place where the two numbers sit side by side.
4. **Look at** the white marks. **What it means:** each shows where your guess sat against the lines you now see. **Why it matters:** you can compare your picture with the real one directly; the tutor goes through each guess in Part 4.
5. **Look at** the three stars. **What it means:** the star on the 8 kpc ring moves at 169 km/s and the star on the 30 kpc ring at 101 km/s, so the inner star finishes more laps in the same time. **Why it matters:** a star's speed decides how many laps it completes, so the stars' motion is another way of reading the same graph.

*(Not stated here, held for the tutor: that the blue line falls because the visible matter is concentrated in the middle, the planets comparison, and the verdict on both guesses.)*

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now add some invisible matter yourself. Pick an amount of dark matter and press Run. A purple line is drawn on the graph, the purple glow appears around the galaxy, and the three stars speed up or slow down. **Your guesses do not change anything here; the amount does.**"

**Note beside the controls.** "Your guesses from Part 1 are locked. Changing the amount changes only the purple line, the purple glow and the stars' speed. It does not change the blue line, the green line or the tables in Part 3, except the column labelled 'With your dark matter'. The amounts are **trial values**: they show what would happen if there were that much dark matter, and they do not say the real galaxy has it."

**Controls (as now):** None (visible matter only) / The amount that matches the measured speed / Custom, 0 to 2 times the matching amount. The Part 2 Run is separate from Part 1's Run: Part 2's picture uses the chosen amount; **Parts 3 and 4 do not vanish when the amount changes.**

**On-canvas labels (new):** the glow is labelled "purple glow = dark matter halo (imagined; nobody has photographed it)"; the purple line "predicted with your dark matter"; each star's speed updates.

**Caption: How to read this drawing (Part 2).**
- "**The purple glow** shows how much dark matter you added: none, a faint glow, or a strong one. It is **imagined** for the question; real dark matter gives off no light."
- "**The purple line** is the speed each star would need with the visible matter **and** your dark matter, using v = √(G × M ÷ r), where M is all the mass inside the orbit. It is **calculated here**."
- "**The stars** now move at the purple-line speeds."
- **A worked moment.** "At the matching amount, at 8 kpc, the speed is 218 km/s (169 from the visible matter alone). The mass inside the orbit is then about 5.3×10¹⁰ solar masses of visible matter plus 3.5×10¹⁰ of dark matter." *(calculated: 1.2×10¹⁰ × (8 − 5 × atan(8 ÷ 5)) = 3.5×10¹⁰ [recheck in the module]; the 40 percent share is not stated here: see question C)*
- **What to look for:** (1) **Look at** the purple line against the green dashed line. **What it means:** at the matching amount it sits within 1.3 percent of 220 km/s at every distance from 5 to 30 kpc; at 0.5 it is 173 km/s at 30 kpc; at 2 it is 299 km/s. **Why it matters:** it shows how much extra mass the model needs to reach the measured speed, and that too little and too much both miss it. (2) **Look at** the glow's strength. **What it means:** a stronger glow is a larger amount. **Why it matters:** it is a way of seeing the size of the amount you chose, nothing more. (3) **Look at** the stars' laps. **What it means:** with more dark matter the outer stars go faster, so they finish more laps. **Why it matters:** the speeds are what the amount changes, not the distances.

---

## 5. Part 3: The results (teal)

**Lead.** "Here are the numbers behind the pictures. **Table 1** sets the page's numbers beside the values astronomers report. **Table 2** gives the speeds at three distances. Your guesses are shown beside the tables, and **nothing you guess changes a number in either table**. Only the 'With your dark matter' column in Table 2 follows the amount you chose in Part 2."

### Table 1: Check-up *(calculated beside published; all rows independent of your Part 2 amount)*
| What is checked | This page | Beside | Reading |
|---|---|---|---|
| (a) Visible matter only, speed at 8 kpc | 169 km/s | the page's measured reference, 220 km/s | **less** (about 23 percent less) |
| (b) Visible matter only, speed at 30 kpc | 101 km/s | the same reference, 220 km/s | **less** (about 54 percent less) *(your guess 2 is tagged here)* |
| (c) The matching amount, speed at 8 kpc and at 30 kpc | 218 and 223 km/s | the same reference, 220 km/s | **the same, within 1.3 percent at every distance from 5 to 30 kpc** *(calculated here; the amount was chosen to do this, so it is **not an independent test**)* |
| (d) One lap of the Sun's distance at the matching amount | about 225 million years | about 230 million years (NASA Starchild, 2000) | **less, by about 2 percent** |
| (e) The page's reference speed against published values | 220 km/s | 229.0 ± 0.2 (Eilers and others 2018); 240 ± 8 (Reid and others 2014) | **less than both**; a rounded teaching value |

*(No row for the share of dark matter: no published range was read; question C.)* **[recheck: 169, 101, 218, 223, 225, 23 and 54 percent, 1.3 percent, 2 percent are from the module and hand calculations; to be added to the module with tests.]**

**What this table tells us** *(one item for each row; each in three parts)*
- **(a) and (b), visible matter only.** *What it is:* the speed a star needs if only the visible matter pulled on it. *What it means:* 169 km/s at 8 kpc and 101 km/s at 30 kpc, against the 220 km/s reference: less, by about a quarter and by more than half. *Why it matters:* the gap grows with distance, so it is largest where the stars are far from the visible matter. **How sure:** the blue line comes from a teaching model, not a real galaxy, so the numbers show the idea, not a real galaxy's weight.
- **(c), the matching amount.** *What it is:* the speed with dark matter added in the amount the page calls "matching". *What it means:* 218 to 223 km/s, within 1.3 percent of 220 at every distance. *Why it matters:* it shows the model can be made to fit; it is **not** evidence that dark matter exists, because the amount was chosen to give this fit. The evidence is in the measurements, not in this row.
- **(d), the Sun's lap.** *What it is:* the time for one lap, 2 × π × r ÷ v. *What it means:* about 225 million years at 8 kpc, against NASA's "about 230 million years" for the Sun: less, by about 2 percent. *Why it matters:* it is a plain check that the units and the maths behave; it is not a test of dark matter. **How sure:** NASA's page is from 2000 and gives a round figure.
- **(e), the reference speed.** *What it is:* the green line's 220 km/s set beside two published values. *What it means:* both papers give higher figures, by 9 and 20 km/s; Eilers and others also find the real curve gently declining beyond the inner galaxy. *Why it matters:* the green line is a simple reference, not the full measured curve, and the reader should not take 220 as the exact speed of our Sun.

### Table 2: Speeds at three distances *(calculated here; the last column is the page's given reference)*
Columns: Distance (8, 16, 30 kpc) | Visible matter only | With your dark matter (follows Part 2) | Measured reference (given). With the Part 2 amount at its default (the matching amount): 169 / 218 / 220; 131 / 220 / 220; 101 / 223 / 220 km/s. **Tags:** a small white tag on the 8 kpc and 30 kpc "Visible matter only" cells for guess 1; on the 30 kpc "Measured reference" cell for guess 2.

**What this table tells us.** *What it is:* the speeds the model gives for the stars you saw. *What it means:* with only visible matter the speed falls from 169 to 131 to 101 km/s across the three distances; with the matching amount it stays between 218 and 223. *Why it matters:* it is the same graph as in Part 1, in numbers. **No comparison table for the controls:** the purple line already shows what the amount does, so a second table would only repeat it (as in Experiment 14).

### Your guesses, beside the results *(guess only; no "right" or "wrong", that is the tutor's job)*
- "**Guess 1** (a far star's speed compared with a near star's, visible matter only): you guessed **[Faster / About the same / Slower]**. The numbers are in Table 2, 'Visible matter only', at 8 and 30 kpc."
- "**Guess 2** (will the measured speeds match the visible-matter prediction): you guessed **[They will match / Faster than predicted / Slower than predicted]**. The numbers are in Table 1, row (b)."

**Also in Part 3 (kept from the present Results):** the worked example at 8 kpc (v = √(G × M ÷ r) = √(4.3×10⁻⁶ × 5.3×10¹⁰ ÷ 8) = 169 km/s) and the "Remember" note (the Newtonian and teaching-model caveats), **without** the sentence "so more mass than the visible matter must be pulling inward" (it is the tutor's point). The Rubin and Ford paragraph is **moved to the tutor**. **Removed:** both "Checking your ... prediction" paragraphs with their "so your prediction was right / off this time" lines; the amount verdict sentence moves to the Part 2 note ("the speed is within 5 percent of 220 at every distance between about 0.86 and 1.09 times the matching amount"; the 5 percent is the page's own rule, not a published cut-off, and the page says so).

---

## 6. Part 4: The tutor (blue)

**Lead.** "The tutor will ask what you noticed, then go through your two guesses beside what you saw, then explain."

**Questions**
1. **Observe:** "Look at the blue line (visible matter only) and the green dashed line (measured speed). What do you notice, especially far from the centre?" *(kept)*
2. **Compare:** "Your white marks show your two guesses: that, with only visible matter, a far star would orbit [faster than / about the same speed as / slower than] a near one, and that the measured speeds would [match / be faster than / be slower than] the visible-matter line. Look at the white marks beside the blue and green lines. What do you notice?"
3. **Conceptual:** "If the stars far from the centre move faster than the matter we can see can explain, what might be going on?" *(kept)*

**Explanation** *(each point marks the guess where it applies; the learner's own sentences are never marked)*
1. **Orbit speed depends on the mass inside the orbit.** *(kept)* "A star circling a galaxy moves at v = √(G × M ÷ r) ... so measuring orbital speeds is a way to weigh a galaxy."
2. **If the visible matter were all the mass**, nearly all of it would sit near the centre, so stars farther out should orbit more slowly, **just as Neptune (5.4 km/s) moves much more slowly than Earth (29.8 km/s) around the Sun** *(NASA Planetary Fact Sheet)*. In this model the blue line falls from about 196 km/s at 5 kpc to about 101 km/s at 30 kpc. **Your guess 1 [marked here]:** "You guessed [faster / about the same / slower]: the blue line falls, so a far star is **slower**. [That matches / That is not what the calculation gave.]" *(said once, and only here)*
3. **Real galaxies do not behave that way.** "Measured speeds stay high, roughly 220 km/s in the Milky Way near the Sun, far from the centre. Rubin, who studied the outer stars of spiral galaxies, found they moved so fast that, without more matter holding them in, they should have flown off (NASA). **Your guess 2 [marked here]:** you guessed [match / faster / slower]: the measured speed is higher than the blue line at every distance, so the measured speeds are **faster than predicted**. [That matches / That is not what was measured.]" **Back to the sealed box from the introduction:** "the scale read far more than the contents you could see should weigh: that is what the green line and the blue line showed. The window is the light; the scale is gravity."
4. **The simplest explanation is unseen mass: dark matter.** "It pulls with gravity but gives off no light, so we mostly know it is there from its gravitational pull on visible matter *(NASA Space Place)*. NASA reports that ordinary matter is about 5 percent of the universe and dark matter about 27 percent, which is about five times as much; that figure is for the whole universe, not for the inside of 30 kpc. **This kind of reasoning has worked before:** in 1846, because Uranus did not travel exactly as expected, Le Verrier worked out where an unknown planet should be, and Galle found Neptune on his first night of searching *(NASA)*. **The difference is** that nobody has yet found what dark matter is made of: NASA calls it a 'mysterious substance'. As of November 2026."
5. **Keep in mind** *(kept in substance)*: Newtonian gravity is fine at these speeds; the galaxy's mass is a simple teaching model; the 220 is a rounded reference and real curves are not perfectly flat (Eilers and others find a gentle decline).
6. **Not covered here:** what dark matter is made of, gravitational lensing and galaxy clusters as other evidence, and the tiny ripples in the cosmic microwave background (a later topic, seen in Cosmology 3). **Removed:** the MOND sentence (no source, question B). Dark energy is a different idea (kept).

---

## 7. New words for the "Words and formulas" box (collapsed; short, plain)

| Word | Plain meaning (draft) |
|---|---|
| galaxy | A huge family of stars, gas and dust held together by gravity. Our own is the Milky Way. |
| orbit | The curved path a star or planet takes around something heavier because of gravity. |
| gravity | The pull that every bit of matter has on every other bit. |
| mass | How much matter something has. |
| solar mass | A unit of mass: the mass of our Sun. |
| kiloparsec (kpc) | A unit of distance: about 3,260 light-years. |
| light-year | The distance light travels in one year. |
| km/s | Kilometres per second. 220 km/s is about 800,000 km an hour. |
| rotation curve | A graph of how fast things orbit at different distances from the centre. |
| visible matter | The matter we can see because it gives off light: stars and glowing gas. |
| dark matter | Matter that gives off no light, but still pulls on other things with gravity. |
| halo | A large, roughly ball-shaped cloud around a galaxy. Here, the shape that holds the dark matter. |
| Doppler effect | A change in the colour (or pitch) of waves because the source is moving toward or away from us. |
| Newtonian gravity | Gravity as Newton described it. Good enough at these speeds, which are far below the speed of light. |
| enclosed mass | All the mass inside a star's orbit. Only this decides the star's speed, in this model. |
| circular speed | The speed a star needs to stay on a circular orbit. |

**Formulas, with a worked example from the page's own numbers.** v = √(G × M ÷ r), with G = 4.3×10⁻⁶ in these units. *Worked:* at 8 kpc, M = 5.3×10¹⁰ solar masses: v = √(4.3×10⁻⁶ × 5.3×10¹⁰ ÷ 8) = √28,500 = 169 km/s. *One lap:* time = 2 × π × r ÷ v; at 8 kpc and 169 km/s: 2.9×10⁸ years. **Held back until after Run (§12):** that the measured speed stays high, and that the blue line falls.

---

## 8. What the physics module needs (Step 3, with tests first; **no approved physics changes**)
- `guessLineEndpoints(choice)` for guess 1 (start at the blue line's 5 kpc speed; end at +60, 0, −60 km/s), returning the speeds drawn.
- `guessMarkerPosition(choice)` for guess 2 (30 kpc, which line it sits on).
- `speedComparisonMark(choice)` and `measuredMark(choice)`: tutor marking (the actual answers 'slower' and 'faster' derived from the curve, not typed in the component).
- `matchVerdict(amount)` moved out of the component (the 5 percent rule and the band 0.86 to 1.09), with the tolerance exported.
- Check-up rows (a) to (e): the percent differences, the readings, and the published values (229.0, 240) as named constants with their sources.
- `lapsInSimulatedSpan(radius, speed)`, `orbitalPeriodYears` already exists; the 290 and 225 million years and the 3.4 laps as tested worked examples.
- `visibleSpeedAtDistances`, `darkMatterEnclosedMass` already exist; the 3.5×10¹⁰ is a tested worked example.
- Tests: the new functions; each guess maps to a distinct drawn mark; Table 1 values equal the module; no real value changes with a guess (A1); the module still imports nothing from the expansion modules.

## Decisions for the owner
- **A. The 220 km/s.** Keep it (default; rounded teaching value; disclosed against 229 and 240), or change the module constant to 229.0 (a physics decision; the matching amount, the tests and the check-up change)?
- **B. MOND.** Dropped by default (no source). Reinstate the old sentence unsourced, or leave it out?
- **C. The dark-matter share (40 percent at 8 kpc, 80 percent at 30 kpc).** Left out of the check-up. Show it in a "calculated here" note, or leave it out?
- **D. Doppler wording.** NASA's page is about a star and a planet's wobble. Approve the extension to "stars and gas on a galaxy's two sides"?
- **E. The two guess marks' sizes.** Guess 1's line rises or falls 60 km/s over the range, an illustrative size with no meaning. Approve, or choose another?
- **F. The Rubin and Ford paragraph** moves from Results to the tutor. Approve?
- **G. Link 5 (Physics Today)** until its author and date are read. Keep, or drop until read?

## Source status (for the specification's source table; checked 2026-11-14)
| Source | Used for | Status |
|---|---|---|
| NASA, Dark Matter (Aug 12, 2026) | outer stars of spirals (Rubin), no light, 5 and 27 percent | fetched, read; plain |
| NASA, Dark Matter 101 | "five times as much", spirals "flying apart" | fetched, read; plain |
| NASA Space Place, What Is Dark Matter? (2024) | "mostly know it is there because of its gravitational pull" | fetched, read; plain |
| ESA Euclid, What is dark matter? (2020) | "around five to one" | fetched, read |
| ESA, Planck science highlights | 4.9 and 26.8 percent | fetched; **not used** (the NASA figures are used) |
| Physics Today (AIP), Andromeda | 1970 flat curve | fetched; **author and date not captured** |
| Eilers and others, arXiv:1810.09466 | 229.0 ± 0.2 km/s; gently declining | abstract read |
| Reid and others, arXiv:1401.5377 | 240 ± 8 km/s; 8.34 ± 0.16 kpc | abstract read |
| NASA Starchild, Question of the Month | 230 million years | fetched, read; **dated 2000** |
| NASA Planetary Fact Sheet (13 Nov 2026) | Earth 29.8, Neptune 5.4 km/s | fetched; a table row |
| NASA, Neptune Facts (15 Oct 2026) | 1846 | fetched, read |
| NASA Webb, Doppler Shift of a Star's Spectrum | blueshift, redshift | fetched, read; about a star |
| NASA Imagine, The Milky Way | parsec 3.26 ly, 1 kpc, Sun about 8 kpc | fetched, read; **host reported dead on 2026-10-25, loads today** |
| Rubin and Ford 1970; Rubin, Ford and Thonnard 1980 | the original results | **not fetched** (HTTP 405); abstracts from search summaries only |
| A plain official page on MOND | tutor point 4 | **none found**; gap, §29 rule 3(c) |
| A published range for the dark-matter share inside 8 kpc | check-up row | **none read** |
| A plain official page defining "rotation curve" | words box | **none found**; defined in the page's words |

## Not checked
Sources read only through helper agents whose fetch tools return summaries (so every quotation is marked [recheck]); no page rendered in a browser; no figure here is in a test yet (the hand calculations are from node, nothing left in the repo); the wording has not been read against the specification line by line; the lap count (3.4) and the 290 million years are from a hand calculation; look-for item 5 was corrected during drafting (the stars are at 8, 16 and 30 kpc), which shows the draft's other figures also need the module check; the Part 2 Run's separate playback is a design suggestion not in the specification.

---

# Revision, 2026-11-14 (owner: "i wanted the 'what happens' content to be explained in more detailed")
Status: DRAFT for the owner's line-by-line approval. Nothing is built from it yet. It replaces the single "What happens" paragraph in Section 1 with a numbered, step-by-step "What happens" (the form Cosmology 3 uses), keeps "A daily-life picture" and "A sealed-box picture" as separate paragraphs after it, and folds "How are the speeds measured?" and "Why even ask this" into the steps. §12: nothing below says what the blue line does or what is measured. The sealed-box paragraph stays as the owner asked (it is conditional).

## What happens (new, numbered)
1. **Stars go round a galaxy the way planets go round the Sun.** "A galaxy is a huge family of stars, gas and dust held together by gravity. Each star moves sideways while gravity pulls it toward the middle, so instead of falling in or flying off it goes round in a circle, called an **orbit**. The Moon going round the Earth, and the Earth going round the Sun, are the same idea on a small scale."
2. **There is one 'just right' speed.** "In the Orbits experiment (Gravity and Curved Spacetime) you found that, for a given mass and distance, there is one sideways speed that keeps an object circling. Go slower and it falls inward; go faster and it flies outward. Think of whirling a ball on a string: too slow and the ball drops toward your hand, too fast and the string is yanked tight."
3. **More pull needs a faster orbit.** "How hard gravity pulls depends on how much mass is **inside** the orbit, between the star and the centre. More mass inside means a stronger pull, and so a faster speed is needed to stay in orbit. A simple rule of this kind: if the mass inside becomes **four times** as large, the speed needed becomes **twice** as large (because the speed grows with the square root of the mass, and the square root of 4 is 2). *(calculated: v = √(G × M ÷ r); with the same r, v₂ ÷ v₁ = √(4M ÷ M) = 2.)*"
4. **So speed lets us weigh a galaxy.** "Turn step 3 around. If we can measure how fast a star orbits at some distance, we can work out how much mass is inside that distance. Do it at several distances and you have weighed the galaxy, shell by shell, without a scale. That is the plan of this experiment."
5. **How we measure the speeds.** "Nobody can travel to a galaxy with a stopwatch, so astronomers use light. This is the **Doppler effect**, the same thing that makes an ambulance siren sound higher as it comes toward you and lower as it goes away. Light from stars and gas on the side of a galaxy that is moving toward us is shifted very slightly toward blue, and light from the side moving away is shifted very slightly toward red. How big the shift is tells us how fast they are moving. The shifts are tiny: a speed of 220 km/s is only about **0.07 percent** of the speed of light. *(calculated: 220 ÷ 299,792 = 0.00073.)* Careful instruments can still measure them."
6. **Two ways to count the mass.** "We now have two independent counts. **Count 1 (from light):** add up the stars and glowing gas we can see, the **visible matter**. **Count 2 (from gravity):** use the measured orbit speeds, as in step 4. Gravity works whether or not something shines, so Count 2 includes everything that pulls, lit or not. Most of the visible stars of a galaxy sit in and near its bright middle and disk, and the model on this page puts its visible matter there too."
7. **Do the two counts agree?** "If they agree, the matter we can see is all there is. If they do not, there is something that pulls on the stars but gives off no light. The name for matter that gives off no light, but still pulls on other things with gravity, is **dark matter**. Whether any is needed, and how much, is what this experiment explores. You will compare the speeds a galaxy would need if only visible matter pulled, with the speeds astronomers actually measure."
8. **What you do.** "You make two guesses first. Then you watch a model galaxy made only of the matter we can see, and two lines are drawn. Later you add some invisible matter yourself and see what changes."

*Then, as now:* **A daily-life picture** (the ball on a string and its worked sum, 4 and 16 newtons) and **A sealed-box picture** (unchanged), then **New terms**, **What you will do** (the four Parts), **Your guesses and the real pictures**, **What we assume** and **Some new words**.

**What was removed to avoid saying things twice:** the separate "Why even ask this" and "How are the speeds measured?" paragraphs (their content is now steps 6, 7 and 5). The first one's sentences "Almost everything we know about the universe comes from light. But gravity works whether or not something shines: a dark object pulls just as hard as a glowing one" are kept, split between steps 6 and 7.

**Claims to check:**
- Step 3's "four times the mass, twice the speed" is calculated from the page's own formula (checked in the tests' Section 8 style: √4 = 2). Not sourced further; it is arithmetic.
- Step 5's "0.07 percent" is calculated (220 ÷ 299,792.458 = 0.073 percent). The ambulance comparison is a daily-life picture for the owner to approve (§15).
- Step 6's sentence that most visible stars sit in and near the middle and disk is general knowledge and **not sourced**. NASA's Milky Way page (read) gives the whole galaxy as about 100,000 light-years, or about 30 kpc, **across**, which means the visible disk reaches only about 15 kpc from the centre, while this page's pictures run to 30 kpc from the centre. That is worth your attention: the model's 30 kpc ring lies beyond most of the visible disk. I have not printed the 15 kpc figure; say if you want it in step 6 or in "What we assume".
- The Orbits cross-reference in step 2 repeats the earlier wording ("there is one just right sideways speed"); the "too slow falls in, too fast flies out" sentence is an addition from the Orbits experiment's own idea and has not been compared with that experiment's text.

---

# Revision 2, 2026-11-14 (owner: "explain 5, 6 and 7 in more detail")
Status: DRAFT for the owner's line-by-line approval. Nothing is built from it yet. It replaces steps 5, 6 and 7 of the numbered "What happens" above with fuller versions, each split into short labelled parts. Steps 1 to 4 and 8 are unchanged. §12: nothing here says what the visible-matter speeds do or what is measured; the worked numbers use made-up round values, labelled as such, that are not this page's.

## 5. How we measure the speeds (fuller)
- **Why light.** "Nobody can fly out to a galaxy with a stopwatch. A galaxy is thousands of light-years across, and the nearest big one is millions of light-years away. But its light reaches us, and light carries a hidden message about motion."
- **A sound you know.** "An ambulance siren sounds higher as it comes toward you and lower as it goes away. The siren has not changed; the sound waves are squeezed together as it approaches and stretched apart as it leaves, and your ear reads that as a higher or lower note. This is the **Doppler effect**. Light is a wave too, so the same thing happens to light: a source moving toward us squeezes its light waves, which shifts the light toward blue, and a source moving away stretches them, which shifts it toward red." *(NASA's Webb page, read, says a star's spectrum is blueshifted when it moves toward us (all wavelengths look compressed) and redshifted when it moves away (stretched out), and that astronomers can use Doppler shift to calculate how fast an object is moving [recheck].)*
- **A fixed marker to measure against.** "Glowing gas in a galaxy gives off light at certain exact colours, like a note played on a tuning fork. In a laboratory, the red glow of hydrogen has a wavelength of 656.3 nanometres (a nanometre is a billionth of a metre). If the gas is moving, that colour is a little different. The size of the change tells us the speed."
- **A worked example, with a made-up speed.** "Suppose gas is moving toward us at 220 km/s. The change in wavelength is the wavelength times the speed divided by the speed of light: 656.3 × 220 ÷ 299,792 = about **0.48 nanometres**. So the red line would move from 656.3 to about 655.8 nanometres. That is a shift of less than one part in a thousand. A car's siren shifts by far more: a car doing 30 metres per second (108 km/h) changes a siren's pitch by about 9 percent, which is about **120 times** bigger than this galaxy shift. Astronomers' instruments are good enough to measure the tiny one."
- **Two sides of a galaxy.** "A galaxy is turning, so seen from the side, one edge is coming toward us and the opposite edge is going away. The first is shifted toward blue and the second toward red, and the two shifts, taken together, tell us how fast the galaxy is turning at that distance from its middle. Measuring at many distances builds the whole graph of speed against distance that you will see on this page."

## 6. Two ways to count the mass (fuller)
- **Count 1, from light.** "Stars give off light, and a brighter star generally has more mass than a fainter one. Astronomers add up the light of all the stars in a galaxy and turn it into an estimate of their mass. They do the same for glowing gas. The total is the **visible matter**. It is like estimating how many people are in a stadium by counting the lit windows: you only count what you can see."
- **Count 2, from gravity.** "Step 3 gave us the rule that links speed and mass inside the orbit. Turned around it says: the mass inside an orbit is the speed squared times the distance, divided by the gravity constant. *(calculated: M = v² × r ÷ G.)* **A made-up example, not this page's numbers:** a star 10 kpc from the centre moving at 100 km/s would mean about 100² × 10 ÷ (4.3 × 10⁻⁶) = **2.3 × 10¹⁰ solar masses** inside 10 kpc. Gravity does not care whether that mass shines. It counts everything that pulls, lit or not."
- **Why the two counts are independent.** "Count 1 asks 'how much light is there?', and Count 2 asks 'how hard is gravity pulling?'. They use different measurements and different rules, so they do not share a mistake. That is what makes comparing them useful."
- **What 'visible' covers here.** "The visible matter in this page's model is a smooth shape: a lot near the bright middle, thinning out toward the edge. It is a teaching model made up for this experiment, not a map of a real galaxy."

## 7. Do the two counts agree? (fuller)
- **The three possibilities.** "Put the two counts side by side. (a) **They agree:** then the matter we can see is all the matter there is. (b) **Count 2 is bigger:** then something is pulling on the stars that gives off no light. (c) **Count 2 is smaller:** this would mean the light count is too large, and would be a puzzle of a different kind. Which one holds is the question; this page does not say before you have guessed."
- **What 'dark' means, and what it does not.** "'Dark' here does not mean 'dim'. A cold, faint planet or a cloud of dust is dim, but it is ordinary matter, and it can be spotted because it blocks, absorbs or gives off some light. NASA describes dark matter as matter that does not absorb, reflect or emit any light, so telescopes cannot see it at all; its presence shows up only through its gravity." *(NASA's Dark Matter page, read: "Dark matter doesn't absorb, reflect, or emit any light." The sentence that dim ordinary matter such as dust can be spotted is general knowledge and not sourced.)*
- **The name.** "The name for matter that gives off no light, but still pulls on other things with gravity, is **dark matter**. A mismatch between the two counts would be a clue, not yet an answer: it would tell you that something is missing, not what it is."
- **What this experiment does and does not say.** "It asks how much extra mass a model galaxy would need, and shows you that. It makes no claim about what dark matter is made of. The purple glow you will see in Part 2 is only a shape that supplies the extra mass."
- **A daily-life picture.** "You carry a bag and feel it is heavy, but when you look inside, the contents add up to much less than the weight. You would suspect there is something at the bottom you have not noticed. A mismatch between 'what I can see' and 'what the scale says' is exactly such a clue." *(This is close to the sealed-box paragraph that stays below; if you prefer, the bag is dropped and the sealed box does this job.)*

## Claims to check for 5, 6 and 7
- **656.3 nm** (the red hydrogen line) is well-known laboratory knowledge but **no source was read**. The shift of 0.48 nm and the 655.8 nm result are calculated (656.3 × 220 ÷ 299,792). The page's words "less than one part in a thousand" is the same 0.073 percent.
- **The siren comparison** (30 m/s, about 9 percent, about 120 times) uses the speed of sound as about 340 m/s, general knowledge, **not sourced**. The 9 percent is calculated (30 ÷ 340 = 0.088) and the "120 times" is 8.8 ÷ 0.073.
- **"Two sides of a galaxy"** (one edge approaching, one receding) is general knowledge and **not sourced**. NASA's page read is about a star and a planet's wobble. The page's earlier approved wording already said this in one sentence.
- **"A brighter star generally has more mass"** and the stadium comparison are **not sourced**; the comparison is a daily-life picture for your approval (§15).
- **M = v² × r ÷ G** is the page's own formula, turned around; the **2.3 × 10¹⁰** is calculated (100² × 10 ÷ 4.30091 × 10⁻⁶ = 2.325 × 10¹⁰). The made-up values (100 km/s at 10 kpc) were chosen not to match this page's real numbers.
- **Possibility (c)** ("Count 2 is smaller") is included for completeness; astronomers do not normally find this, and the page does not say so. Say if you would rather leave it out.
- **The "bag" picture** is new and overlaps the sealed box; your call.
- **Not covered, on purpose:** radio-wave (21 cm) measurements of far-out gas, which are how most outer-galaxy speeds are measured (general knowledge, not sourced, and not needed for the idea).
