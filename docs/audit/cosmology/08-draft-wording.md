# Draft wording: Cosmology Experiment 8 (How Far Can We See? The Observable Universe)
Date: 2026-11-15 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the eighth of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-15): "defaults for all questions" (the thirteen questions at the end of `08-gap-report.md`, each with its default). Two small refinements to the defaults are marked **[refinement]** below so you can reject them.

**Sources:** read on 2026-11-15 by a helper agent whose fetch tool returns short model summaries, not raw text, so every quotation and figure must be spot-checked against the live page before it is printed. Sentences still marked **[source pending]** have no source yet and are removed or reworded if none is found. No page is linked that has not been read. Worked numbers come from the module (hand-checked with a scratch script on 2026-11-15; to be put in tests).

## What the sources changed (read these first)
1. **The page's real figures 45.7 and 46.5 billion light-years are not Planck 2018 values.** They match Wikipedia's "Observable universe" page, which cites Gott and others (2005), an older cosmology. The helper found no Planck, ESA or NASA page that prints either distance. Its own integration of a flat universe with radiation, with Planck 2018's numbers (H0 67.4 to 67.66, matter share 0.311 to 0.315), gives about **45.2 to 45.3** billion light-years for the oldest light's source and about **46.1 to 46.2** for the edge. These are the helper's calculations, not fetched figures. The module's constants are a physics decision, so **they are not changed**; see **Question G**.
2. **Planck 2018 (arXiv:1807.06209) was read through its abstract and an HTML copy:** age 13.787 ± 0.020 billion years, redshift of last scattering 1089.80 ± 0.21 (the module's 1089.8 matches), H0 = 67.4 ± 0.5 and matter share 0.315 ± 0.007 in the abstract. The age at last scattering is "about 370,000 to 380,000 years" (ESA 2013 says 380,000, NASA/JPL 2013 says 370,000, the helper's integration gives about 372,000). Experiment 3's 380,000 is the older rounded value.
3. **No plain official page was found that says the observable universe is about 46 billion light-years in radius although the universe is about 13.8 billion years old** (NASA "What is the Universe?" does not give the number; NASA's "Ask an Astrophysicist" still has a 1997 answer of "about 10 billion light years", which is outdated and is not linked). **Gap under §29 rule 3(c).**
4. **Official pages that were read and can be linked:** NASA "Ask an Astrophysicist" (Q&A, entries 2003 to 2010): expansion is "space itself", it "is not in contradiction with the limit ... ultimate speed" and special relativity "was not violated, because this was an expansion of SPACE", and the observable universe "may be a fraction of the universe". ESA's interview with Joseph Silk (2003): "the Universe could be finite ... If the Universe is finite it would be 100 times larger than the horizon". NASA "The Shape of the Universe" (reviewed 2018): WMAP "confirmed that the universe should be flat". ESA's "Planck and the cosmic microwave background" and "Planck reveals an almost perfect Universe" (both 21 March 2013): about 380,000 years, age 13.82 billion years in the 2013 release. These are dated pages; none is a polished explainer.

## What changed from the old page (read these first)
1. **Part 1 is now fixed on two sources, drawn together in one Run:** "Galaxy A", a galaxy at redshift 2 whose light travelled 10.24 billion years (standing in for "a galaxy whose light travelled about 10 billion years"), and "Source B", the oldest light we can see (redshift 1089.8). Each guess is about one of them, so each guess mark has a real counterpart to sit beside. The learner's own source moves to Part 2.
2. **A zoomed panel is added to Picture 1** for guess 2, because 41 million light-years is under half a pixel on the 0 to 50 billion axis.
3. **Nothing is drawn, and no number about the sources is printed, before Run** (the old live readout, redshift examples and "Try it with the source on the screen now" gave answers away).
4. **The verdicts and the explanation move to the tutor:** "so your prediction was right / off", "Why the distances differ" (the rubber band), "A simple calculation" (× 1 + z) and "Nothing travelled faster than light".
5. **Parts 2 to 4 stay after the first Run.** "Start over" replaces "Change predictions".

## Layout
- **Above Part 1 (no heading):** a long, step-by-step introduction; a "Want to know more?" list; a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the two guesses (unchanged); Start over; Run; **Picture 1** (Galaxy A's and Source B's three distances on one true axis, plus the zoomed panel) and **Picture 2** (the graph of the three distances for every source, with both fixed sources marked); white guess marks after the run; "Where the real picture comes from".
- **Part 2 (pink), "Now try it yourself":** the source control (four presets and a custom slider); its own **Picture 3** (the three bars for your source) and its own copy of the graph with a pink line.
- **Part 3 (teal), "The results":** the guesses beside the results; Table 1 (a check-up); Table 2 (the three distances for Galaxy A, Source B and your source); "What this table tells us" under each.
- **Part 4 (blue), "The tutor":** three questions, then the explanation marking each guess.
- **Colours:** **white** only for the learner's guess. The three distances keep their colours everywhere: **blue** (how far the light travelled), **gold** (how far away the source is today), **green** (how far away it was when the light left). **Pink** marks "your source" in Part 2 only. Dark background so white shows. Nothing is "imagined" on this page **[default; the 10 billion line is drawn as a white marker, not as an imagined element]**.

---

## 1. Introduction (above Part 1; no answers given, §12)

**Title:** Cosmology 8: How Far Can We See? The Observable Universe

**The question.** "The universe is about 13.8 billion years old, so the oldest light we can see has been travelling for about that long. Light covers one light-year in a year. So you might expect that the farthest we could possibly see is about 13.8 billion light-years. How far away are the things we see, and how big is the part of the universe we can see?" **[Planck 2018: 13.787 billion years; the model uses 13.47, see "The model's universe" below]**

**What happens.** "You will look at the light of two very distant sources. For each one you will see **three distances**: how far its light travelled, how far away the source is **today**, and how far away it was **when the light left** it. First you make two guesses. Then you press **Run**, the light is sent from each source to Earth, and two pictures show the distances. Your guesses are drawn on the pictures in white. In **Part 2** you choose any source you like and see its three distances. The results and a tutor follow."

**Step 1: what "far" means for light.** "A **light-year** is the distance light travels in one year, about 9.5 million million kilometres. Because light takes time to travel, every picture of the sky shows the past. A firework burst a kilometre away reaches your eyes a moment after it happened. A star ten light-years away shows you the star as it was ten years ago. The farther the source, the older the light we receive from it. (This is an everyday comparison, not a measurement.)"

**Step 2: the oldest light.** "In Cosmology 3 you met the **cosmic microwave background**: the oldest light we can see, which left its source when the universe was very young, about 380,000 years after the Big Bang. It has been travelling toward us ever since. In this experiment it is called **Source B**." **[ESA 2013: 380,000; NASA/JPL 2013: 370,000; Planck 2018: redshift 1089.80. The page says "about 380,000" as Experiment 3 does]**

**Step 3: redshift, a reminder.** "In Cosmology 1 you met **redshift**: a number that tells how much the light's colour was shifted toward red on its way to us. A bigger redshift means light that left earlier. A galaxy at redshift 2 (**Galaxy A**) sent its light about ten billion years ago. The oldest light has a redshift of about 1090."

**Step 4: three distances for one source.** "For any source there are three different questions you can ask about distance, and this experiment is about how they compare:"
- "**How far the light travelled:** the length of the light's own journey, found from how long it has been on its way, multiplied by the speed of light."
- "**How far away the source is today:** if you could freeze everything at this exact moment and stretch a measuring tape from Earth to the source, how long would the tape be? (This is a way of *defining* a distance across the whole universe at one moment. No signal could measure it.)"
- "**How far away it was when the light left:** the length that same tape would have had at the moment the light set off."

**Step 5: the units.** "These distances are so large that they are given in **billions of light-years**; one billion is a thousand million. One **megaparsec (Mpc)** is about 3.3 million light-years; Hubble's Law in Experiment 1 used it."

**Step 6: why ask this at all.** "Every picture of the sky is made of light that has had time to reach us, so the limit on how far we can see is a limit on what we can ever study. Astronomers give a number for how far away the edge of the observable universe is. How is that number found, and is it set only by how old the universe is? The three distances for your two sources are the way into that question."

**The model's universe (what we assume).**
- "The same simplified universe as Cosmology 5 and 6: **flat** (space on the very largest scales is not curved, so straight parallel paths stay parallel), with matter and a constant dark energy (70 percent), and an illustrative Hubble constant of 70 km/s per megaparsec. Published values range from about 67 to 73: the 'Hubble tension'. **[NASA Hubble constant and tension page, read for Cosmology 6; to be re-read]** In this model the universe is **13.47 billion years old**; the real age is about 13.8 billion."
- "**Radiation** (the light and other very fast particles of the early universe) is left out, as in Cosmology 5 and 6. This matters most for the earliest times, and the results will show how much difference it makes."
- "The source stays at a fixed spot in the stretching space, with no motion of its own through space."
- "The light travels along a straight line to Earth, and nothing blocks or bends it."
- "'Distance today' is a way of defining a distance across all of space at one moment, not something a signal could measure."
- "The cosmic microwave background stands in for 'the farthest we can see with light.' The true edge of the observable universe is slightly farther, and is not computed here."
- "Real reference values are given for comparison and are not worked out here."
- "Nothing here says how large the whole universe is. The observable universe is only the part we can see. The universe may be much larger, and this experiment does not say. **[NASA "Ask an Astrophysicist" and ESA's Joseph Silk interview say so; see "Want to know more?"]**"

**Predictions never change the pictures (new, §14 "Predictions and the Real Results").** "Your guesses never change the real pictures or tables. They are drawn on the pictures in white, after the run, and shown again beside the results. In Part 2 the only thing that changes a drawing is the source you choose."

**Some new words:** observable universe, light-year, redshift, cosmic microwave background, distance today, distance when the light left, megaparsec. (All are in the Words and formulas box.)

**As of November 2026 (up to date, §29).** "The best measurements of the oldest light come from ESA's Planck satellite. Its final results (the 2018 paper, revised in 2021) give the universe's age as 13.787 billion years and the oldest light's redshift as 1089.8, and these are the values this experiment compares itself with. The age and distances in this experiment's model differ a little from them, because the model is simpler (Table 1 shows by how much)." **[Planck 2018: read; no 2025 or 2026 news item was searched for here, so the page does not claim one]**

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)
**Before the run**
1. **Planck Collaboration (2018): cosmological parameters** — `https://arxiv.org/abs/1807.06209` — "The paper behind the universe's age (13.787 billion years) and the oldest light's redshift (1089.8). A technical paper; the abstract is the readable part." *(abstract and an HTML copy read)*
2. **ESA: Planck and the cosmic microwave background (2013)** — `https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background` — "ESA's plain page on the oldest light and when it was released, about 380,000 years after the Big Bang." *(read)*
3. **NASA: The Shape of the Universe** — `https://imagine.gsfc.nasa.gov/observatories/satellite/wmap/shape.html` — "NASA's page on how the WMAP satellite found that space is flat, the word the assumptions use." *(read)*
4. **NASA: Hubble constant and the tension** — `https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/` — "NASA's plain page behind the range 67 to 73 quoted in the assumptions." *(read for Cosmology 6; to be re-read)*
5. **ESA: Is the Universe finite or infinite? An interview with Joseph Silk (2003)** — `https://esa.int/Science_Exploration/Space_Science/Is_the_Universe_finite_or_infinite_An_interview_with_Joseph_Silk` — "An old ESA interview on whether the whole universe is bigger than the part we can see." *(read; dated 2003)*

**After the run** *(they say what the tutor asks about)*
6. **NASA: Ask an Astrophysicist, cosmology** — `https://imagine.gsfc.nasa.gov/ask_astro/cosmology.html` — "NASA's question-and-answer page: expansion is of space itself, and it does not break relativity's speed limit. Entries from 2003 to 2010; the 1997 answer about the size of the observable universe is out of date and should be skipped." *(read)*

**Gaps (§29 rule 3(c)), searched 2026-11-15:**
- No plain official page was found that gives the observable universe's radius (about 46 billion light-years) or explains why it is larger than the universe's age in years. Tried: NASA "What is the Universe?" (no number), NASA "Cosmic History" (nothing on size), ESA/Hubble "age and size" (age only), NASA WMAP expansion page (redirects, no text), NASA "expansion of the universe" (404), ESA Herschel and ESA CMB pages (404). The only NASA text on this size is a 1997 answer that gives "about 10 billion light years", which is wrong now and is not linked.
- No Planck, ESA or NASA page was found that prints the oldest light's source distance today or the edge of the observable universe (see Question G).
- The firework and ant-on-a-rubber-band pictures have no source.

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses about distances to two faraway sources. Then you will press Run and watch light travel from each of them to Earth, with two pictures to show the three distances for each. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures."

**Guess 1 and guess 2: exactly as written.** Guess 1: "A galaxy's light has been travelling toward us for 10 billion years. How far away is that galaxy today?" Less than 10 billion light-years / About 10 billion light-years / More than 10 billion light-years. Guess 2: "The oldest light we can see left its source when the universe was very young. How far away was that source when the light left it?" About 13 billion light-years / A few billion light-years / Far closer than that, under 100 million light-years.

**Locked line (after Run):** "Your guesses are locked while you try other sources. To change them, press Start over." **Start over** replaces "Change predictions": always visible, greyed out until a guess is chosen or a run exists and while a run plays; it clears the guesses, runs, results and tutor.

**Run:** eight seconds, fixed (§11). Before Run no picture is drawn and no distance is printed. At Run, for **both** sources, the blue bar grows as the light travels and the gold bar and its dot grow from the starting distance to today's. **The white guess marks appear when the run ends (A4).**

**White guess marks (each with a YOUR GUESS box joined by a line):**
- **Guess 1 (on Galaxy A's gold row):** a white vertical line at **10 billion light-years** with an arrow pointing **left** for "Less than", a white ring on the line for "About", and an arrow pointing **right** for "More than". Box: "YOUR GUESS: Galaxy A's distance today is less than / about / more than 10 billion light-years". **Marker only:** the arrow has a fixed length that means nothing as a number.
- **Guess 2, "About 13 billion" (on Source B's green row):** a white line at **13 billion** on the true axis. It has a size, so it is drawn at its size. **[refinement]** (The default drew all three as edge arrows in the zoomed panel; this one fits on the main axis.)
- **Guess 2, "Far closer, under 100 million" (in the zoomed panel):** a white bracket from 0 to 100 million, drawn on the zoomed scale beside the green bar.
- **Guess 2, "A few billion" (in the zoomed panel):** a white arrow at the panel's right edge labelled "a few billion: off this scale, to the right". It is **only a marker**: "a few" has no exact size, and the page does not invent a range **[default Q4]**.
- All guess 2 marks appear in a YOUR GUESS box, "the source's distance when the light left".

**Where the real picture comes from (under the pictures, after the run).**
- "**Calculated here:** every bar, curve and distance, for a flat universe with 70 percent dark energy and a Hubble constant of 70, without radiation (the model of Cosmology 1, 2, 5 and 6), by the formulas in the Words and formulas box."
- "**Measured by others, given here, not worked out:** the redshift of the oldest light, 1089.8, the age 13.787 billion years and the real distances used for comparison in the results (about 45.2 to 45.7 billion light-years for the oldest light's source and about 46.1 to 46.5 for the edge of the observable universe; see Table 1 for where each figure comes from). The age (13.787 billion years) and the redshift are from the Planck 2018 paper."
- "**Your guess:** the white marks only."
- (No element on this page is "imagined".)

### Captions (one under each picture; each section appears as its feature is drawn)

**Picture 1, the three distances for Galaxy A and Source B, drawn to a true scale.**
- "**Earth** is the blue dot at the top left. Every bar starts at the dashed line below it and reaches to the right. The axis along the bottom gives the distance in **billions of light-years**; each tick is 10 billion more. The scale is true, so a bar twice as long means twice the distance."
- "There are two groups of bars: **Galaxy A** (redshift 2) and **Source B** (the oldest light, redshift 1089.8). Each group has three bars, drawn in the same colours as the graph."
- "The **blue bar** is **how far the light travelled**. Light moves at a fixed speed, so this is how long the light has been on its way multiplied by that speed: for Galaxy A, 10.24 billion years × 1 light-year per year = 10.24 billion light-years. The bar starts at Earth only so its length can be compared with the others; the light itself travelled the other way, from the source to Earth."
- "The **gold bar** is **how far away the source is today**: the freeze-frame measuring tape from Earth to the source. The pale gold dot, labelled 'The source', sits at its end."
- "The **green bar** is **how far away the source was when the light left**: the tape's length back then. For Source B this bar is too short to see on this scale, so the zoomed panel below the main picture shows it on its own scale."
- "**The zoomed panel** is a second drawing, with its own title and its own axis from 0 to 100 million light-years, so each tick is 20 million. It shows Source B's green bar on that scale. Do not compare its lengths with the main axis: it is a different scale."
- "When you press **Run**, watch for about 8 seconds. The blue bars grow as the light travels, and the gold bars and dots grow as each source goes from where it was when the light left to where it is today. The motion is drawn to help you notice the change; it is not a movie of real history, but the lengths at the end are exact."
- *Worked moment (after the run):* "For Galaxy A the blue bar is 10.24 billion light-years, the gold bar 16.89 and the green bar 5.63. For Source B the blue bar is 13.47, the gold bar 44.61 and the green bar 41 million light-years (0.041 billion)."
- *What to look for (each appears when its feature is drawn):* (1) "**Look at** the blue bar and the gold bar for Galaxy A. **What it means:** the light travelled 10.24 billion light-years, and the source is 16.89 billion light-years away today, 6.65 billion farther. **Why it matters:** this is the comparison your first guess was about." (2) "**Look at** Source B's green bar in the zoomed panel. **What it means:** the source was 41 million light-years away when the light left. **Why it matters:** this is the comparison your second guess was about." (3) "**Look at** the white marks. **What it means:** each shows what you guessed beside the real bar. **Why it matters:** you can compare at a glance; the tutor goes through each guess. The marks do not say right or wrong."
- "**The white marks are only markers.** The arrow for guess 1 has a fixed length and the arrow for 'a few billion' means only 'off this scale'. The white line at 13 billion and the line at 10 billion are at their true places on the axis."

**Picture 2, the graph: the three distances for every source.**
- "Picture 1 shows two sources. The graph shows **every** source, so you can see how the three distances change as the light left earlier and earlier. Each point on a curve is one possible source."
- "Across the bottom is the redshift (the older the light, the farther to the right), on a scale where each tick is **ten times** the one before: 0.1, 1, 10, 100, 1000. That is how a very near source and the oldest light can share one graph, like a ruler where each step multiplies instead of adds. Up the side is distance, in billions of light-years."
- "The three curves match the bars' colours: **blue**, how far the light travelled; **gold**, how far away the source is today; **green**, how far away it was when the light left."
- "The two **dashed vertical lines** mark Galaxy A (redshift 2) and Source B (redshift 1089.8), each with three dots; how high a dot sits is the length of the matching bar in Picture 1. Nothing here moves during the run, because the graph shows every source at once."
- *What to look for:* (1) "**Look at** each curve from left to right. **What it means:** the blue curve rises and then flattens near 13.5; the gold curve keeps climbing, past 44; the green curve rises, peaks near 5.7 around redshift 1.6, and then falls to about 0.04. **Why it matters:** the three distances do not move together, and that is the experiment's whole question." (2) "**Look at** the gap between the blue curve and the gold curve at the right-hand end. **What it means:** for Source B they are 13.47 and 44.61, a difference of 31.14 billion light-years. **Why it matters:** the light's journey and the source's distance today are very different numbers."
- "(Held for the tutor and Part 3, §12: why they differ, the stretching factor 1 + z, the rubber band, 'nothing travelled faster than light', and the verdict on both guesses.)"

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now you choose the source. Press Run and its three distances are drawn, in the same colours as before, beside Part 1's. Your guesses do not change anything in this part; your source does."

**Control.** "The source whose light travels to Earth (a larger redshift means light that left earlier):" **A galaxy from about 5 billion years ago (redshift 0.5)** / **A distant galaxy (redshift 2)** / **A very early galaxy (redshift 10)** / **The oldest light we can see (redshift 1089.8)** / **Custom** (a slider on a scale where each step multiplies, from redshift 0.1 to 1089.8). A choice changes Picture 3 and the pink line on the graph only after its own **Run**; Parts 2 to 4 stay on screen. **[The preset label "the source in Experiment 7" becomes "the source in Cosmology 7"; the sidebar's names are checked when built.]**

**Note beside the control (new):** "Your guesses do not change the drawings or tables. This source does, but only Picture 3, the pink line on the graph and the pink row in Part 3. Redshift 2 and the oldest light are also in Part 1; choose another to see something new. These sources are **trial values**: they show what the model gives for a source with that redshift, and they do not say that a real galaxy is like that."

**Picture 3 (pink frame):** the three bars (blue, gold, green) for **your source**, with the same labels, a "Your source" title, and a readout. For a very close source (a short green bar) a zoomed strip appears when the green bar is under 1 billion. **Caption:** short; "**Look at** the three bars for your source. **What it means:** with redshift [z] the light travelled [x], the source is [y] away today and was [w] away when the light left. **Why it matters:** it lets you see how the three distances change as the light left earlier."
**Where the real picture comes from:** *calculated here:* every bar; *imagined:* none; *your choice:* the source.

---

## 5. Part 3: The results (teal)

**Lead.** "These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the pink row follows your source in Part 2."

**The learner's guesses beside the results** (guess only, no "matched"; a tag on the rows): "You guessed: Galaxy A is **[less than / about / more than]** 10 billion light-years away today (tag on Table 2, Galaxy A's 'today' row). You guessed: Source B was **[about 13 billion / a few billion / under 100 million]** light-years away when the light left (tag on Table 2, Source B's 'when the light left' row)."

### Table 1: a check-up (this model against published values)
| What we compare | This model | Published | Reading |
|---|---|---|---|
| (a) The oldest light's source today | 44.61 billion light-years | about 45.2 to 45.3 (the helper's calculation from Planck 2018's numbers); 45.7 (Wikipedia, citing Gott and others 2005) **[Question G]** | less, by about 0.6 to 1.1 |
| (b) The edge of the observable universe against the oldest light's source | 44.61 | about 46.1 to 46.2 (calculation); 46.5 (Wikipedia) **[Question G]** | less, by about 1.5 to 1.9; the edge is the farthest source, a little beyond the oldest light's |
| (c) When the oldest light left | about 472,000 years after the Big Bang | about 370,000 to 380,000 (ESA and NASA, 2013) | more, by about 92,000 to 102,000 years |
| (d) The age of the universe | 13.47 billion years | 13.787 ± 0.020 (Planck 2018) | less, by 0.32 billion years |

**What this table tells us.** (a) *What it is:* the model's distance to the oldest light's source today beside published figures. *What it means:* 44.61 against about 45.2 to 45.7: the model is between 0.6 and 1.1 billion light-years (1.4 to 2.4 percent) too small. *Why it matters:* the model is close enough to teach the idea, and the gap has known causes: it leaves out radiation (which matters most at the earliest times) and uses a Hubble constant of 70 where Planck's is 67.4. *How sure:* the published figure is the weak link, because no official page prints it (Question G). (b) *What it is:* the farthest we could ever have seen, beside the model's oldest-light distance. *What it means:* the edge is a little farther than the oldest light's source. *Why it matters:* it is why the page calls the oldest light a stand-in for "the farthest we can see with light". (c) *What it is:* the time after the Big Bang when the oldest light left. *What it means:* the model puts it at about 472,000 years, against 370,000 to 380,000, an excess of about 92,000 to 102,000 years. *Why it matters:* it is the same missing radiation showing up in a second number. (d) *What it is:* the model's age beside Planck's. *What it means:* 13.47 against 13.787, which is 0.32 billion years (2.3 percent) less. *Why it matters:* the model's age sets the light-travel times in the bars. *How sure:* Planck's age is read from the paper; its ± 0.020 is far smaller than the gap.

### Table 2: the three distances (billions of light-years; the pink row follows your Part 2 source)
| Source | Light travelled | Source today | When the light left |
|---|---|---|---|
| Galaxy A (redshift 2) | 10.24 | 16.89 | 5.63 |
| Source B, the oldest light (redshift 1089.8) | 13.47 | 44.61 | 0.041 (41 million light-years) |
| **Your source** *(pink)* | *x* | *y* | *w* |

**What this table tells us.** *What it is:* the three distances for the two sources in Part 1 and for the one you chose. *What it means:* for every source in the table, the distance today is greater than the distance the light travelled, by a factor of 1.65 for Galaxy A and 3.31 for Source B. *Why it matters:* the light's journey does not tell you where the source is now. *How sure:* the numbers are calculated here, in a simplified model, and are close to but not exactly the published ones (Table 1).

**What your numbers show** *(updates with your source, in trial values).* "With a source at redshift **[z]**, the light travelled **[x]** billion light-years, the source is **[y]** away today, and it was **[w]** away when the light left. Compared with Galaxy A, your source's distance today is **[more / less]** by **[…]**. **These are trial values and your own numbers. They do not say that a real galaxy is like that.**"

**Removed from Results (moved to the tutor, §12):** "so your prediction was right / off this time" (both), "Why the distances differ" with the rubber band, "A simple calculation" (× 1 + z), and "Nothing travelled faster than light". **Kept:** the numbers in the tables, the box "How close is this model to the real values?" (now Table 1 with its note) and "What this model simplifies".

---

## 6. Part 4: The tutor (blue)

**Lead.** "The tutor asks you three questions about what you saw, then explains it and goes through your two guesses."

- **Observe:** "Compare the three bars for Galaxy A and for Source B on the first picture, and the three curves on the graph. Look at your white marks too: where did each sit against the real bars? What do you notice?"
- **Compare:** "You guessed that Galaxy A would be **[less than / about / more than]** 10 billion light-years away today (your white arrow or ring on the line at 10), and that Source B was **[about 13 billion / a few billion / under 100 million]** light-years away when the light left (your white mark). What do you notice when you compare each white mark with the real bars?"
- **Conceptual (kept):** "The oldest light left its source only about 13.5 billion years ago, but that source is now about 44.6 billion light-years away. How can that be, if nothing can travel faster than light?"
- **Explanation:** the eight approved points are kept as written, with changes: (i) points 2 and 4 start by marking each guess ("You guessed [X] (the white …): that **[is / is not]** what the model gives"), from the module, and do **not** use "right" or "wrong"; (ii) the rubber band (point 3) and the recession speed (point 5) stay here, moved out of Results; (iii) the cross-references use the sidebar names ("Cosmology 1", "Cosmology 6", and so on); (iv) point 7 uses Table 1's published values; (v) point 5's sentence that the recession speed 'is not a speed through space' now has a NASA source (Ask an Astrophysicist: expansion 'is not in contradiction with the limit ... ultimate speed'), quoted by name and date, and is worded as that source says.

---

## 7. Words and formulas (collapsed box above Part 1)
**Entries (plain meaning each):** observable universe; light-year; redshift; cosmic microwave background; light-travel time (also called look-back time); distance today; distance when the light left; the stretching factor (1 + z); recession speed; megaparsec (Mpc); Hubble constant; flat universe; dark energy; radiation (as the model leaves it out); particle horizon (the edge of the observable universe); Hubble tension; "billion" (a thousand million).
**Formulas with worked examples (from the page's own numbers):** distance the light travelled = travel time × the speed of light (13.47 billion years × 1 light-year per year = 13.47 billion light-years). **Held back until after the run (§12), shown only once the run has finished:** distance when the light left = distance today ÷ (1 + z) (44.61 billion ÷ 1090.8 = 41 million, which gives guess 2's answer away) and recession speed = H₀ × distance today (70 km/s per Mpc × about 13,680 Mpc ≈ 957,000 km/s ≈ 3.2 times the speed of light).

---

## 8. Source table (for the specification's "Audit Update")
| Idea or number | Source | Read? | Date |
|---|---|---|---|
| Age 13.787 ± 0.020 billion years; redshift 1089.80 ± 0.21; H0 67.4, Ωm 0.315 | Planck 2018 VI (arXiv:1807.06209), abstract and HTML copy | read (helper; a model summary) | 2026-11-15 |
| Oldest light's source today **about 45.2 to 45.3** billion light-years | the helper's own integration of flat ΛCDM with radiation, Planck 2018 inputs | **calculated, not fetched** | 2026-11-15 |
| Oldest light's source today 45.7; edge 46.5 | Wikipedia "Observable universe", citing Gott and others 2005 | read (secondary source) | 2026-11-15 |
| Edge about 46.1 to 46.2 | the helper's integration | **calculated, not fetched** | 2026-11-15 |
| Oldest light left about 370,000 to 380,000 years after the Big Bang | ESA "Planck and the CMB" (21 Mar 2013); NASA/JPL (21 Mar 2013); ESA "Planck reveals an almost perfect Universe" | read (helper) | 2026-11-15 |
| Expansion is of space; not in contradiction with the speed limit | NASA Ask an Astrophysicist (2003 to 2010) | read (helper) | 2026-11-15 |
| The universe may be larger than the observable part | NASA Ask an Astrophysicist; ESA Joseph Silk interview (2003) | read (helper) | 2026-11-15 |
| Flat universe | NASA "The Shape of the Universe" (reviewed 2018) | read (helper) | 2026-11-15 |
| Hubble constant 67 to 73 | NASA, Hubble constant and tension | read for Cosmology 6; to be re-read | |
| The observable universe's radius (about 46 billion light-years), with a plain explanation | none | **gap, §29 rule 3(c)** | 2026-11-15 |
| Firework and ant-on-a-rubber-band pictures | none | **gap: Claude's own pictures, kept and labelled as everyday comparisons** | 2026-11-15 |

## Questions for the owner on this draft
A. **Guess 2, "about 13 billion" drawn on the main axis [refinement]** instead of as an edge arrow in the zoomed panel. Default as drafted: yes (it fits on the main axis and has a true size).
B. **The zoomed panel's scale and caption** as drafted (0 to 100 million, each tick 20 million). Default: yes.
C. **No "imagined" element** on this page. Default: yes.
D. **Links** as listed (six, all read). Default: yes.
E. **Check-up row (d)** (the age, 13.787 from Planck 2018). Default: yes, now that it is read.
G. **The real figures 45.7 and 46.5 are not Planck 2018's.** They come from Wikipedia citing Gott and others (2005); the helper's calculation with Planck 2018 gives about 45.2 to 45.3 and 46.1 to 46.2, but no official page prints either, and the model uses H0 = 70, not Planck's 67.4. Options: (1) **keep the constants and Table 1 as drafted**, showing both figures and saying where each comes from (the default of Question 10); (2) change the constants to the Planck-based figures (a physics decision, so only if you say so; the specification's tests 4 and the "2.4 percent" would change); (3) drop the real distances from Table 1 and keep only the age and the departure time, which have official sources. **Recommendation: (1), with the weak sourcing said plainly on the page.** Your answer on Question 10 ("keep") covers option 1 unless you say otherwise.
F. **Part 2's preset label** "the source in Experiment 7" becomes "the source in Cosmology 7". Default: yes.

## What the module will need (for the physics step; tests first)
New functions in `observableUniverseExperiment.ts`, each with tests, none changing an existing physics function: the two fixed sources (`GALAXY_A_REDSHIFT = 2`) and their answers (guess 1's actual answer and guess 2's actual answer, with matching); guess marks (guess 1's marker position and direction at the 10 billion line; guess 2's positions on the main axis and in the zoomed panel, the edge-arrow case and the bracket); the zoomed panel's axis and green bar; tutor marking; the check-up rows (a) to (d) with the "less / more" readings and the percentages (2.38 and 4.06, now computed in the module, not the component); Table 2's rows and the "What your numbers show" values; the worked examples (13.47 × 1; 44.61 ÷ 1090.8; 70 × 13,680); published constants (45.7 and 46.5 as now; the Planck-based 45.2 to 45.3 and 46.1 to 46.2 if option 1 of Question G; 370,000 to 380,000; 13.787 and 1089.8). A new `ObservableUniverseExperiment.test.tsx` covers the interface.

## Not checked
Not built, not run, not viewed in a browser; the wording is not yet approved; every source was read through the helper's fetch tool (model summaries), so quotations are to be spot-checked in a browser; the Planck-based distances are the helper's calculation, not a fetched figure; a search for 2025 and 2026 news on this topic was not run, so the page makes no "as of" claim beyond Planck; the worked numbers (10.24, 16.89, 5.63, 13.47, 44.61, 40.9 million, 3.31, 1.65, 3.19, the 2.38 and 4.06 percent and the 472,000 years) were worked with a scratch script from the module on 2026-11-15 and are to be rechecked in the module's tests.
