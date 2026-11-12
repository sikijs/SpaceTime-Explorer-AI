# Draft wording: Gravity and Curved Spacetime Experiment 5 (What curves spacetime? Mass and distance)
Date: 2026-11-12 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following `01-` to `04-draft-wording.md` of this group, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-12, "all defaults" to the eleven questions of `05-gap-report.md`): fix every gap; Part 1's Run draws the strength graphs, and the mass and distance controls and the two re-used panels move to Part 2; the cap at 0.9 is kept, drawn on the graphs and said in words, with no change to the approved constants or presets; four white marks with direction arrows; no sketch of the mass; "time-dilation strength" and "tidal strength" on the page; the introduction's answer-giving lines dropped; tutor marking of all four guesses; Results with guess tags and no "You predicted / What actually happened" pairs; no tables; Gravity 3's labelled cabin re-used in Part 2; an honesty line; links searched and read before they are proposed.

**One place where the default left me a choice (question 1):** the default said "two strength graphs". Drawn that way, the two lines on the mass graph would lie exactly on top of each other: at Medium distance, 0.3 × mass ÷ 2 and 1.2 × mass ÷ 8 are both 0.15 × mass (the constants were chosen so that Medium and Medium give 0.3 for both). So I propose **four small graphs, one per guess** (section 6), each with one line and one white mark, in a 2 × 2 grid. Nothing else about the default changes. **Please check this.**

## Layout
- **Above Part 1 (no heading):** the introduction, "Want to know more?", a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the four guesses, "Run", and four small graphs that draw themselves (strength against distance and against mass, for each of the two effects), then the four white marks with their boxes, "Where the real picture comes from" and the caption once the lines are drawn.
- **Part 2 (pink), "Now try it yourself", after the first Run finishes:** mass buttons (Small, Medium, Large, Other) and distance buttons (Close, Medium, Far, Other), "Run with your mass and distance", Experiment 2's clocks and Experiment 3's cabins responding to them, then the same four graphs for your mass and distance (pink lines, a pink dot); "Runs so far"; a caption.
- **Part 3 (teal), "The results":** the strength numbers of the Part 1 graphs with a tag on each line a guess lives on.
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while the Run plays. It replaces "Continue" and "Run Again" and clears all four guesses.
- **Colours:** white is only ever the learner's guess; pink is only ever the learner's own mass and distance in Part 2; indigo (solid) is the time-dilation strength and amber (dashed) the tidal strength; grey is Part 1's line in Part 2.

---

## 1. Introduction

**1a. "The question"** (old: "In Experiment 2, a "strength" slider controlled how much faster the ceiling clock ticked. In Experiment 3, a "convergence strength" slider controlled how much the two balls drifted together. Where do those numbers actually come from?"). New:
"In Experiment 2 (does gravity change time?), a "strength" number controlled how much faster the ceiling clock ticked. In Experiment 3 (tidal effects), a "strength" number controlled how much the two balls drifted together. Where do those two numbers actually come from?"

**1b. "A daily-life picture"** (old: "...Set a bowling ball in the middle and it sags a little; swap it for a much heavier weight, or push the same ball closer to where you're standing, and the dip gets noticeably deeper..."). New (it no longer says which way the dip goes):
"Think of a trampoline. A bowling ball set in the middle makes a dent in it, and a feather does not. In this experiment a nearby body plays the part of the bowling ball, and two things about it matter: how much stuff it is made of (its mass), and how far away you are standing (its distance)."

**1c. New paragraph, "How this page is laid out."** (same as Gravity 1 to 4, as approved)
"Below this introduction the page is in four sections, called Parts, each with a coloured heading. In Part 1 you make guesses and watch the experiment. In Part 2 you try it with a mass and a distance of your own. Part 3 shows the results, and Part 4 is the tutor, who talks it over with you."

**1d. "What happens"** (old: "You'll pick how massive a nearby body is, and how far away it is, and watch Experiment 2's clocks and Experiment 3's balls respond together — both driven by the same two choices."). New:
"Two numbers follow from a body's mass and its distance: a **time-dilation strength**, which sets how much faster Experiment 2's ceiling clock ticks, and a **tidal strength**, which sets how much Experiment 3's two balls drift together. In Part 1 you guess how each of those two numbers changes when the mass or the distance changes, and watch four graphs draw the answer. In Part 2 you choose a mass and a distance yourself, and watch Experiment 2's clocks and Experiment 3's balls respond together, both driven by the same two choices."

**1d-2. New paragraph, "A quick reminder of the two strengths."** *(Added after the owner's review, 2026-11-12: "refresh the user's knowledge with explanation of 'dilation strength' and 'tidal strength'". The numbers come from Experiments 2 and 3's own functions.)*
"You met both in earlier experiments:
- **Time-dilation strength (Experiment 2).** It sets how much faster the ceiling clock ticks than the floor clock. A strength of 0 would mean the two clocks tick together. At strength 0.3 the ceiling clock ticks 1.43 times for every 1 tick of the floor clock, and at 0.6 it ticks 2.50 times. A bigger number means a bigger gap between the two clocks.
- **Tidal strength (Experiment 3, where it was just called "strength").** It sets how much the two falling balls in the planet cabin drift together. A strength of 0 would mean they stay the same distance apart. At strength 0.3, two balls that start 1 metre apart land 0.700 metres apart, and at 0.6 they land 0.400 metres apart. A bigger number means the balls land closer together.

Both are plain numbers between 0 and 1 with no unit. In Experiments 2 and 3 you chose them yourself. Here they follow from a mass and a distance."

**1e. New paragraph, "What 'mass', 'distance' and 'strength' mean here."**
"Mass and distance here are relative presets, not real kilograms or metres. Mass can be Small (1), Medium (2) or Large (4), and distance can be Close (1), Medium (2) or Far (4). They are plain numbers with no unit. The two strengths are the same ones as in Experiments 2 and 3, now worked out from the mass and distance. Each strength is kept at or below 0.9, the biggest value Experiments 2 and 3 accept, so the page can never hand them a number they cannot use."

**1f. "Your job"** (old: "Change the mass and distance, and compare how much each effect changes."). New:
"Before you press the button, guess how each effect changes if the mass moves closer, and how each changes if the mass is bigger. Then watch the four graphs draw the answer, try your own mass and distance in Part 2, and talk it over with the tutor."

**1g. New paragraph, "Your guesses and the real pictures."**
"Your guesses never change the real pictures or the numbers: they come from a calculation that knows nothing about what you guessed. Your four guesses are drawn on the four graphs in white, each in a box labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the mass and distance you choose do change the graphs, the clocks and the balls, and the lines they move are pink."

**1h. New line, "Some new words."**
"The "Words and formulas" box below has each one with a short plain meaning: mass, distance, relative preset, time-dilation strength, tidal strength, cap, first-order, spacetime, tick, separation, graph."

**1i. "What we assume"** (the bullets change as shown; the answer-giving second bullet is gone):
- "Mass and distance here are relative presets, not real kilograms or metres." (as built)
- "This uses the same simplified, first-order approximation as Experiments 2 and 3." (as built)
- "The step from a mass and a distance to the two strengths is itself a further simplification. It is chosen to show the pattern, not to give realistic numbers: with a real star at a real distance, both effects are far too small to see." (the specification's success criterion 5)
- "This experiment doesn't use anything about light, moving clocks, or speeds close to light, it's about ordinary gravity, like Experiments 2 and 3." (as built)

---

## 2. "Want to know more?" (opens in a new tab; fetched and read before approval)

**Linked from the start (one, neutral):**
1. **NASA Glenn: "Free Fall without Air Resistance"** (NASA Glenn Research Center, Beginner's Guide to Aeronautics; page dated 18 July 2024). "A plain explanation of g: with no air, every object falls with the same acceleration, 9.8 metres per second every second at Earth's surface." *(Read for Gravity 1 on 2026-11-11 and linked from the start in Gravity 3; it says nothing about mass or distance changing the pull. The cabins here fall at 1g.)*

**Held back until after the tutor** (they say what the experiment is about: how gravity depends on mass and distance, how it changes clock rates and why it differs from place to place; §12):
2. **NASA Space Place: "What Is Gravity?"** (NASA Science for Kids; article last updated 17 December 2020). "A short page for kids on gravity: more mass gives more gravity, and gravity weakens with distance. It also shows Einstein's picture of gravity as a curve in space."
3. **NOAA NESDIS: "What Causes Tides?"** (NOAA's K-12 pages, made with NASA's Space Place team at JPL; 2 September 2025; for grades 5 to 8). "A short, plain page on how the Moon's pull on the Earth differs from place to place, which links to the tidal drifting-together of Experiment 3." *(The Gravity 3 link, re-used.)*
4. **NIST: "Putting Einstein to the Test"** (created 3 April 2025, updated 17 April 2025). "How clocks at different heights tick at slightly different rates, and why GPS clocks need correcting." *(The Gravity 2 link, re-used; it gives 7, 45 and 38 microseconds a day for GPS.)*

**Source status (checked 2026-11-12, for the specification's source table).** Pages 1, 3 and 4 were read for earlier experiments (2026-11-11 and 2026-11-12) through helpers' summaries. Page 2 was read on 2026-11-12 through a helper; it says gravity "is an invisible force" and mentions Einstein only in an image caption (a loose, Newton-style framing, which the tutor's explanation corrects), and I **did not read any of the pages line by line**; spot-check them in a browser. The page uses no measured result, so there is no paper to cite.
**Read and not linked:** NASA Space Place, "How Do We Weigh Planets?" (article last updated 1 June 2020): says outright that a heavier planet tugs harder and that a closer moon is tugged harder (so it would answer the predictions), uses "weigh" and "weight" loosely for mass, and attributes Mercury's low surface gravity to its mass alone (surface gravity also depends on radius). NASA Glenn, "Weight and Mass" (no date): about F = m a and W = m g, says g "decreases very slowly" away from the surface (a hint at the distance guess), nothing wrong, dated in style. NASA eClips, "Spotlite: Mass and Weight" (video page, updated 19 December 2025): one sentence of text; the video and its lesson PDF were not read, so it cannot be linked.
**Open (§29 rule 3(c)):** no plain official page was found that gives the mass-and-distance scalings used here (1 ÷ distance for time dilation and 1 ÷ distance³ for tides). A source for them was not searched beyond the pages above; nothing is linked for them.

---

## 3. "Words and formulas" (collapsed box)

- **Mass (relative):** how much stuff a body is made of. Here it is a plain number, Small (1), Medium (2) or Large (4), not kilograms.
- **Distance (relative):** how far away the body is. Here it is a plain number, Close (1), Medium (2) or Far (4), not metres.
- **Relative preset:** a plain number that stands in for a real measurement, so that the effects are easy to see.
- **Time-dilation strength:** the number from Experiment 2 that sets how much faster the ceiling clock ticks than the floor clock. No unit, between 0.05 and 0.9 here.
- **Tidal strength:** the number from Experiment 3 (called "strength" there) that sets how much the two balls drift together. No unit, between 0.02 and 0.9 here.
- **Cap:** the biggest value the page lets a strength reach, 0.9. If a calculation comes out bigger, the page uses 0.9 instead, because Experiments 2 and 3 cannot accept more.
- **First-order:** a simplified version of the real physics that keeps the biggest effect and ignores tiny corrections.
- **Spacetime:** space and time taken together, as one thing.
- **Tick:** one beat of a clock. Experiment 2's two clocks are compared by counting their ticks.
- **Separation:** the distance between the two balls, in metres. It starts at 1 m.
- **Graph (line):** a picture of how one number changes as another does. Here each line shows a strength at each mass or each distance.

*The two formulas that turn a mass and a distance into the strengths are **not** in this box: they would show the answer before the learner has predicted (§12). They appear in the Part 1 caption after the run.*

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess how two numbers change: the time-dilation strength of Experiment 2 and the tidal strength of Experiment 3, when a nearby mass moves closer, and when it is bigger. Then you press "Run" and watch four graphs draw the answer, with your four guesses marked on them in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a mass and a distance and run again. The mass and distance you choose change the four graphs and the two panels from Experiments 2 and 3 in this Part, with your lines in pink. They do not change Part 1's graphs, the results in Part 3, or your guesses."
*Note beside the controls:* "Your guesses do not change these drawings, but the mass and distance you choose do."
*Before any Part 2 run:* "Not run yet. Choose a mass and a distance and press Run with your mass and distance; your pink lines and the two panels will respond here."

**Part 3, "The results"** (teal): "What we are about to do. Here are the strength numbers from the Part 1 graphs, with your guesses marked beside them. Nothing in this Part changes with your guesses or with the mass and distance you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your four white marks on the graphs, then explains."

---

## 5. The predictions

**Intro line** (as built, with the setup added): "Four questions. In each one, "stronger" means a bigger strength number. The first two use a Medium-mass body and ask what happens when it moves from Far to Close. The last two use a body at Medium distance and ask what happens when the mass goes from Small to Large."
Questions (as built; the four stay):
1. "If you moved the mass closer, would the ceiling-clock time-dilation effect from Experiment 2 get stronger, weaker, or stay the same?"
2. "If you moved the mass closer, would the tidal drifting-together effect from Experiment 3 get stronger, weaker, or stay the same?"
3. "If you used a bigger mass instead, would the time-dilation effect get stronger, weaker, or stay the same?"
4. "If you used a bigger mass instead, would the tidal effect (the two balls drifting together) get stronger, weaker, or stay the same?"
Buttons (as built): "Get stronger" / "Get weaker" / "Stay the same".
After the run: "Your predictions are locked while you try other settings. To change them, press Start over."
**Start over:** always visible; greyed until a guess is chosen or a run has begun, and while the Run plays. It clears the four guesses, the runs, the results and the tutor's progress.

---

## 6. Part 1's picture: four graphs

**Drawn:** four small graphs in a 2 × 2 grid, under the title "How the two strengths change". Each has a title that repeats its guess, and one line:
- **Top left:** "Time-dilation strength as the mass moves closer (Medium mass)": solid indigo.
- **Top right:** "Tidal strength as the mass moves closer (Medium mass)": dashed amber.
- **Bottom left:** "Time-dilation strength as the mass gets bigger (Medium distance)": solid indigo.
- **Bottom right:** "Tidal strength as the mass gets bigger (Medium distance)": dashed amber.
The two upper graphs have "Far (4)" at the left, "Medium (2)" in the middle and "Close (1)" at the right, with the axis title "Distance of the mass". The two lower graphs have "Small (1)", "Medium (2)" and "Large (4)", with "Mass". Up the side, the strength from 0 to 1, with a dotted line at **0.9 labelled "cap: 0.9, the most this page can use"** and a line label for the strength at each end. A point travels along each line as the Run plays, left to right (Far to Close, or Small to Large), and the line draws itself behind it.

**The four white marks** (once the lines are fully drawn): at the **right-hand end of its line** a white ring, joined by a thin line to its own white box above the plot: **"YOUR GUESS, closer mass, time dilation (a marker only): the effect gets stronger"** (or "...gets weaker" or "...stays the same"), and likewise "closer mass, tidal effect", "bigger mass, time dilation" and "bigger mass, tidal effect". Beside each ring a short white arrow: up for "stronger", a flat bar for "the same", down for "weaker". The arrow has no length of its own, because the guess has no size; the caption says so. A guess shows nothing about what is right.

**"Where the real picture comes from":** "**Measured:** nothing. **Calculated here:** each strength, from the two formulas in the caption below, for the mass and distance shown, and kept at or below the cap of 0.9. The constants in the formulas are chosen so that Medium mass and Medium distance give 0.3 for both strengths, as in Experiments 2 and 3; they are not measured. The mass and distance are relative presets, not real kilograms or metres. **Imagined for the question:** the nearby body. The white rings and arrows are only your guesses."

**Caption, "How to read this diagram":**
*What you see.*
- **Four graphs** answer your four guesses, one each. Each draws one strength as a line. The **indigo solid line** is the time-dilation strength (the number from Experiment 2) and the **amber dashed line** is the tidal strength (the number from Experiment 3).
- **Up the side** is the strength, from 0 to 1 (no unit). **Along the bottom** is the distance of the mass, from Far to Close, in the two upper graphs, and the mass, from Small to Large, in the two lower graphs. Mass and distance are relative presets: Small, Medium and Large are 1, 2 and 4; Close, Medium and Far are 1, 2 and 4.
- **The dotted line at 0.9** is the cap: the most that this page lets a strength reach, because Experiments 2 and 3 cannot accept more. Where a line meets the cap it goes flat, even if the formula would give more.
- **The four white rings, arrows and YOUR GUESS boxes** are your four guesses, drawn once the lines are drawn. A ring is in the same place whatever you guessed. Its arrow shows only the direction you guessed (up: stronger; flat bar: the same; down: weaker), and its length means nothing. They are markers only, and none moves a line.
- **The formulas used:** time-dilation strength = 0.3 × mass ÷ distance, and tidal strength = 1.2 × mass ÷ distance × distance × distance (mass ÷ distance cubed), each kept between its smallest value and 0.9.

*A worked moment.* At Medium mass (2) and Medium distance (2), time-dilation strength = 0.3 × 2 ÷ 2 = 0.300 and tidal strength = 1.2 × 2 ÷ (2 × 2 × 2) = 2.4 ÷ 8 = 0.300: the same, as in Experiments 2 and 3. Move the mass out to Far (4): the time-dilation strength becomes 0.3 × 2 ÷ 4 = 0.150, and the tidal strength becomes 2.4 ÷ 64 = 0.0375. Move it in to Close (1): the time-dilation strength becomes 0.3 × 2 ÷ 1 = 0.600, but the tidal strength would be 2.4 ÷ 1 = 2.4, which is over the cap, so the page uses 0.900.

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the four lines, from their left ends to their right ends. **What it means:** each shows one strength at every mass or distance in its range: the time-dilation line goes from 0.150 at Far to 0.600 at Close, the tidal line from 0.0375 to 0.900, and the two mass lines from 0.150 at Small to 0.600 at Large. **Why it matters:** it shows how each strength responds to the mass and to the distance, instead of only reading one number.
2. **Look at** the tidal line in the upper right as it reaches the dotted 0.9 line. **What it means:** the tidal strength stops rising at 0.9, from a distance of about 1.4 inwards, because the page cannot use more: the formula would give 2.4 at Close. **Why it matters:** it shows where this page's numbers stop following the formula, so a flat part of a line means "capped" and not "no effect".
3. **Look at** the four white rings and your four YOUR GUESS boxes. **What it means:** each marks the place on its graph where the answer to that guess can be read: the right-hand end of its line. **Why it matters:** it shows where to look to compare what you expected with what was drawn.

---

## 7. Part 2's pictures

**Drawn:** the same four graphs, but for **your** mass and distance. The two upper graphs (strength against distance) use **your mass**; the two lower (strength against mass) use **your distance**. Your line is **pink** (solid for time dilation, dashed for tidal), with a **pink dot** at your chosen point on each line; Part 1's line stays as a **thin grey** line for comparison. The dotted cap line at 0.9 stays. The white guesses are **not** redrawn. **Experiment 2's clocks** and **Experiment 3's cabins** come first, above the four graphs (moved there at the owner's request, 2026-11-12):, running with the two strengths your mass and distance give. The cabins are Gravity 3's labelled cabins (floor, left ball and right ball, the gravity arrow), titled "Experiment 3's cabins, at this mass and distance. These cabins stand in for a place near the body; nothing about the body is drawn." The clocks keep their own labels ("Ceiling clock", "Floor clock"). A line under the controls says the two strengths for the chosen mass and distance ("Time-dilation strength 0.600, tidal strength 0.900 (capped; the formula gives 2.400)").
Below it, "Runs so far": one line per Part 2 run, such as "Mass Medium, distance Close: time-dilation strength 0.600, tidal strength 0.900 (capped); the final tick counts and the final separations, printed from Experiments 2 and 3's own modules as the page does now".

**"Where the real picture comes from":** same as Part 1, plus: "The clocks and the balls are Experiments 2 and 3, run with the strengths your mass and distance give."

**Caption, "How to read Part 2's pictures":** *(Rewritten and lengthened on 2026-11-12 at the owner's request: "the captions in part 2 dont explain anything. add content to explain the graphs". Numbers come from the physics module and from Experiments 2 and 3's own functions.)*
Opening: "Everything here is for the mass and distance *you* chose in the controls. The first two pictures are Experiments 2 and 3 running with your choice. The four graphs underneath show where your choice sits among all the possible masses and distances."
*What you see.*
- **Experiment 2's clocks (above the graphs).** The ceiling clock and the floor clock count ticks. The floor clock counts 10 ticks over the run. The more the ceiling clock is ahead, the bigger the time-dilation strength.
- **Experiment 3's cabins (above the graphs).** The planet cabin drops two balls that start 1 metre apart, and the number under the cabin is how far apart they are right now. The closer together they land, the bigger the tidal strength. The rocket cabin is there for comparison and does not change.
- **The two upper graphs (strength against distance).** Along the bottom is the distance of the mass, from Far (4) to Close (1). Up the side is the strength, from 0 to 1. **Your mass is held fixed** (it is written in each title), so the line shows what the strength would be if that mass were Far, Medium or Close. The left graph is the time-dilation strength and the right graph is the tidal strength.
- **The two lower graphs (strength against mass).** Along the bottom is the mass, from Small (1) to Large (4). **Your distance is held fixed** (it is written in each title), so the line shows what the strength would be if the mass were Small, Medium or Large.
- **The pink line** is your line: solid pink for the time-dilation strength and dashed light pink for the tidal strength. **The pink dot** sits on it at the distance (upper graphs) or the mass (lower graphs) you chose. Its height is the strength that the clocks and the cabins above are using right now. **The thin grey line** is Part 1's line (Medium mass in the upper graphs, Medium distance in the lower ones), kept so that you can see how your choice moved the whole line.
- **The dotted line at 0.9** is the cap: the most that this page lets a strength reach. The numbers under the ends of each line are the strength at that end. If you choose an "Other" value outside Close to Far or Small to Large, the bottom scale stretches to include it.
*Worked moments.* "A strength of *s* gives the ceiling clock 1 ÷ (1 − *s*) ticks for every floor tick, and lands the two balls (1 − *s*) × 1 metre apart."
- **Medium mass, medium distance:** time-dilation strength 0.300 and tidal strength 0.300. The ceiling clock ticks 1 ÷ (1 − 0.300) = 1.43 times for every floor tick, so after the run it shows 14.29 ticks against the floor clock's 10.00. The planet cabin's balls land (1 − 0.300) × 1 = 0.700 m apart.
- **Large mass, medium distance:** 0.600 and 0.600. 2.50 ticks per floor tick, 25.00 ticks after the run; the balls land 0.400 m apart.
- **Large mass, close distance:** 0.900 for both (the formulas give more, so the cap is used). 10.00 ticks per floor tick, 100.00 after the run; the balls land 0.100 m apart.
- **Small mass, far distance:** the formulas give 0.075 and 0.01875, and the page lifts the second to the smallest value it accepts, 0.020.
*What to look for (three items, each in three parts).* (1) The pink dot on each graph and the clocks and cabins above: the dot's height is the strength those two pictures are using, joining the graphs to the clocks and cabins. (2) The gap between the pink line and the grey line: above means your choice gives a bigger strength at every point, below means smaller, on top means the same as Part 1's; it shows how much your own mass or distance moves a whole line. (3) Where a pink line meets the dotted 0.9 line, or runs along the bottom: capped, so changing a setting changes nothing on this page (at Large mass and Close distance the ceiling clock ticks 10.00 times for every floor tick).

---

## 8. Results (Part 3)

Lines (as built, reorganised to the Part 1 graphs):
- **Mass and distance:** Medium mass for the two distance graphs, Medium distance for the two mass graphs (relative presets).
- **Time-dilation strength, mass moving from Far to Close:** 0.150 at Far, 0.300 at Medium, 0.600 at Close. **Tag (new):** "your guess" + "Your guess for the closer-mass time-dilation effect is drawn on the top left graph as a white mark."
- **Tidal strength, mass moving from Far to Close:** 0.0375 at Far, 0.300 at Medium, 0.900 at Close (capped; the formula gives 2.400). **Tag (new):** "your guess" for the closer-mass tidal effect, "top right graph".
- **Time-dilation strength, mass from Small to Large:** 0.150 at Small, 0.300 at Medium, 0.600 at Large. **Tag (new):** "your guess" for the bigger-mass time-dilation effect, "bottom left graph".
- **Tidal strength, mass from Small to Large:** 0.150, 0.300, 0.600. **Tag (new):** "your guess" for the bigger-mass tidal effect, "bottom right graph".
- **Removed:** the "You predicted / What actually happened" pairs and the closing sentence ("Both effects grow stronger with a closer or bigger mass ... how strongly spacetime is curved at that location"): the tutor now marks each guess and says both (§12).
- **Final tick counts and separations (Experiments 2 and 3):** moved to Part 2's "Runs so far", because they belong to the settings the learner chooses there.
- **New line:** "**Where this comes from:** calculated here from the formulas in the caption, with constants chosen, not measured, and with each strength capped at 0.9. Nothing here changes with your guesses or with the mass and distance you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: every number comes from the module's two formulas, so a table would compare the model with itself, and the graphs with the pink dot give the comparison. Because there is no table, there is no "What this table tells us" note.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe** (old: "Look at both panels. When you moved the mass closer, which effect changed more?"). New: "Look at the four graphs. Each has one line, a solid indigo one for the time-dilation strength and a dashed amber one for the tidal strength. When the mass moved closer, which strength changed more? Your four guesses are the white marks at the right-hand ends of the lines."
- **Compare** (old: lists "you predicted ... it actually did stronger" four times). New: "You guessed that moving the mass closer would make the time-dilation effect [get stronger / get weaker / stay the same] and the tidal effect [...], and that a bigger mass would make the time-dilation effect [...] and the tidal effect [...]. Those are the four white marks. Look at the graphs again: what do you notice when you compare what you expected with what was drawn?" (It no longer states the outcomes.)
- **Conceptual:** unchanged. ("Both effects come from the same mass at the same distance. Why might they not grow at exactly the same rate?") *(It says "they ... grow", which assumes the answer to the first guesses; kept as approved, after the learner has seen the graphs and written two answers. Say if you would rather it ask "why might the two lines not rise in the same way?")*
- **Explanation:** a new opening block, points 1 to 4 as built (with the changes below), and a closing line.

**Opening block (new, built from the module's marking, one sentence per guess):**
- Closer mass, time dilation: "You guessed that moving the mass closer would [guess] the time-dilation effect. The line rises from 0.150 at Far to 0.600 at Close. So [your guess matched what the graph shows / the graph shows something different from your guess]."
- Closer mass, tidal: "... The line rises from 0.0375 at Far to 0.900 at Close, where it reaches the cap. So [...]."
- Bigger mass, time dilation: "... rises from 0.150 at Small to 0.600 at Large. So [...]."
- Bigger mass, tidal: "... rises from 0.150 at Small to 0.600 at Large. So [...]."

**Explanation points (rewritten and lengthened on 2026-11-12 at the owner's request: "the 'lets reflect' section in part 4 needs more detailed explanatory content"; every number comes from the physics module):**
1. **Both strengths grow with more mass and less distance, up to the cap.** (as drafted: Far to Close at Medium mass takes the time-dilation strength from 0.150 to 0.600 and the tidal strength from 0.0375 to 0.900; a bigger mass at Medium distance takes both from 0.150 to 0.600; a line goes flat where it reaches the cap of 0.9, "capped", not "no effect".)
2. **A bigger mass raises both strengths in the same proportion.** (new) At Medium distance, Small to Medium to Large takes the time-dilation strength through 0.150, 0.300, 0.600, and the tidal strength through the same three numbers: each time the mass doubles, each strength doubles. The two lines coincide at Medium distance because the constants were chosen so that Medium and Medium give 0.300 for both, as Experiments 2 and 3 each opened on. Trampoline: a bowling ball twice as heavy makes a dent twice as deep, and both the clocks and the balls feel the same deeper dent.
3. **Distance does not treat the two strengths alike.** (old point 2, extended) The time-dilation strength follows mass ÷ distance, the tidal strength mass ÷ distance cubed. Medium to Far at Medium mass: 0.300 to 0.150 (halved) against 0.300 to 0.0375 (÷8). **Daily-life picture:** next to a loud speaker the sound is much louder at your near ear than your far ear, and across the room the two ears hear almost the same; the tidal effect is a *difference* in pull between the two balls' places, and a difference across a fixed gap shrinks faster than the pull itself, while time dilation depends on how deep you sit in the dent, which fades more slowly. *(The 1 ÷ distance and 1 ÷ distance³ scalings are the page's chosen model, with no source read.)*
4. **The cap, and why it is there.** (new) Experiments 2 and 3 accept strengths only between 0 and 1, and the page keeps them at or below 0.9. At Large mass and Close distance the formulas give 1.2 and 4.8, but both are held at 0.900: the ceiling clock ticks 10.00 times per floor tick and the balls land 0.100 m apart. At Close distance the tidal strength is 0.900 for every mass, so changing the mass there shows no change on this page: the cap, not the real effect stopping. Uncapped comparisons: Medium and Medium 1.43 ticks per floor tick and 0.700 m; Large and Medium 2.50 and 0.400 m.
5. **Both are consequences of one thing: how curved spacetime is at that location.** (old point 3, extended) More mass curves spacetime more, and moving closer puts you where the curvature is stronger; different measurements of the same curvature need not scale the same way with distance.
6. **So where did the "strength" numbers of Experiments 2 and 3 come from?** (new; the specification's success criterion 4) They stood in for a mass at a distance all along: both opened on 0.300, which here is Medium mass at Medium distance.
7. **This connects back to Experiment 4 (curved spacetime).** (old point 4, as drafted)
8. **A note on how real these numbers are.** (new; the specification's success criterion 5) The step from mass and distance to the strengths is a further simplification; its constants (0.3 and 1.2) were chosen, not measured, and the mass and distance are relative presets; with a real star at a real distance both effects are far too small to see. What the page does show correctly is the pattern.
**Closing line (new):** "Try other masses and distances in Part 2 to see the same thing: whatever you choose, a bigger mass and a closer mass raise both strengths until they reach the cap of 0.9."

---

## 10. Physics module (new, with tests; the approved model, constants and presets are unchanged)

In `spacetimeCurvatureSourceExperiment.ts` (`K_DILATION`, `K_TIDAL` and the clamp limits are exported, unchanged in value):
1. `PredictionKey` and `PredictionChoice` move in from the component. `predictionSetup(key)` returns, for each of the four guesses, the effect (time dilation or tidal), the variable that changes (distance or mass), the fixed other value (Medium) and the start and end values (Far to Close; Small to Large). **Test:** the four setups match the four questions.
2. `strengthOf(effect, mass, distance)` returns one strength (the existing function, split by effect), and `isCapped(effect, mass, distance)` says whether the formula was outside the limits. **Tests:** the nine-row table in the gap report to three decimals, including the capped cells (Close distance, tidal: 0.900; Large and Close, dilation: 0.900; Small and Far, tidal: 0.020).
3. `strengthCurve(key, samples)` and `strengthCurveFor(effect, variable, fixedValue, samples)` sample a line from Far to Close, or Small to Large. **Tests:** the endpoints are the module's own values; each line never decreases as the mass moves in or gets bigger; no value is above 0.9 or below the smallest limit.
4. `actualOutcomeFor(key)` returns `'stronger'`, `'weaker'` or `'same'` by comparing the end values of the setup, so it is computed, not typed. **Test:** all four are `'stronger'` at the page's Medium setups; and, at Close distance, the tidal strength for Small, Medium and Large mass comes out `'same'` (the cap), which pins the behaviour the old hard-coded `'stronger'` hid.
5. `guessMarkerFor(key, choice)` returns the ring's place (the end of the line), the arrow direction (up, none, down) and the box text. **Tests:** the ring is the same for all three choices; the arrow is up for "stronger", none for "same", down for "weaker"; the box text names the guess and the choice; the result is unchanged by the choice.
6. `markGuess(key, choice)` returns whether the guess matched and the plain sentence for the tutor's opening block. **Tests:** each key matches only `'stronger'` at the Medium setups; the sentences contain the line's two end values; the real outcome is unchanged.
7. `STRENGTH_AXIS_TOP` = 1, `STRENGTH_CAP` = 0.9 and `tidalCapDistance(mass)` (about 1.387 at Medium mass: the distance below which the tidal strength is capped). **Tests:** the values.
8. `workedNumbers()` returns the numbers shown in the caption, the tutor and Part 2's caption (0.300 and 0.300 at Medium and Medium; 0.150 and 0.0375 at Far; 0.600 and 2.400 → 0.900 at Close; 1.2 → 0.900 and 4.8 → 0.900 at Large and Close; 0.075 and 0.01875 → 0.020 at Small and Far; about 1.4). **Tests:** each to the stated decimals.

---

## 11. Specification changes (only after approval, §28.2)

`05-what-curves-spacetime.md`: Learner Controls (the controls move to Part 2; a Part 1 run with no controls), Prediction Activity (the questions gain the setups), Experiment Behavior and Display (four strength graphs in Part 1; four graphs with a pink dot and the two re-used panels in Part 2), Results Display (the numbers with guess tags, no "You predicted / What actually happened" pairs and no closing conclusion; tick counts and separations in Part 2's "Runs so far"), AI Tutor Behavior (the compare step no longer states the outcomes; the explanation marks all four guesses and says "up to the cap"), the introduction's wording, a **new "Audit Update" section recording the cap behaviour (the page's earlier "always stronger" was not true at the cap)**, the source table and the layout (four Parts, Start over). Gravity 2 and 3's components are used unchanged (`RocketCabinClocks`; `LabelledCabin` instead of `Cabin`).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction 1a to 1i:** the question (naming both experiments), the trampoline picture that no longer says which way the dip goes, the Parts paragraph, "What happens", "What 'mass', 'distance' and 'strength' mean here" (the strengths and the 0.9 limit), the changed "Your job", the guesses paragraph, the "Some new words" line and the assumptions (the answer-giving bullet gone, the "further simplification" bullet added)? [yes]
2. **Links:** one neutral link up front (NASA Glenn free fall) and three after the tutor (NASA Space Place "What Is Gravity?", NOAA tides, NIST "Putting Einstein to the Test"), with the source status and the open gap for the scalings? [yes]
3. **Words box:** the entries, with the formulas held back until the Part 1 caption? [yes]
4. **Part leads and the note beside the controls:** approve? [yes]
5. **The predictions:** the setup line ("stronger" means a bigger strength number; Medium mass for the distance questions, Medium distance for the mass questions) and the locked-guess line? [yes]
6. **Part 1's picture:** **four graphs in a 2 × 2 grid instead of two** (because at Medium distance the two strengths coincide), four white rings with arrows and boxes, the same for any guess, the cap line labelled, and the Part 1 caption with the formulas, the worked moment and three look-for items? [yes; please check the four-graph layout]
7. **Part 2's pictures and caption:** pink lines with a pink dot, Part 1's line in grey, Gravity 3's labelled cabins and Experiment 2's clocks beneath, the cabin title that says they stand in for a place near the body, and the look-for item about the cap? [yes]
8. **Results:** the strength numbers with guess tags, the pairs and the closing conclusion removed, tick counts and separations moved to Part 2? [yes]
9. **Tutor:** the three prompts (the conceptual question kept as approved), the opening block, point 1 changed to "up to the cap", point 2 with the ÷2 and ÷8 numbers, point 4 with the chapter name? [yes]
10. **Physics module:** the eight items above, with the cap behaviour pinned by a test? [yes]
