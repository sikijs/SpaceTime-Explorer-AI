# Draft wording: Gravity and Curved Spacetime Experiment 4 (Curved spacetime)
Date: 2026-11-12 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following `01-` to `03-draft-wording.md` of this group, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-12, "all defaults" to the eleven questions of `04-gap-report.md`): fix every gap; Part 1 fixed at strength 0.5 with the strength control in Part 2 (opening on 0.8); two white marks, one at the end of each line, each with its own YOUR GUESS box and a direction arrow with no length of its own, and the graph's vertical axis extended to 1.2 m; labels ("left traveler", "right traveler", "start", "the pole", the sphere outline named) and a note describing the sketch; "Curvature strength" kept, with its meaning explained; the introduction's question reworded and the "walking as straight as you possibly can" hint dropped; tutor marking of both guesses; Results with a guess tag on each final-separation line, the "0.000 m" explained and no "You predicted / What actually happened" pairs; no tables; Drawing A on a fixed 0 to 80 m distance axis; an honesty line; links searched and read before they are proposed.

**One place where the default left me a choice (question 4):** the owner's default asked for a note describing the sketch, but the code does not say what the sketch is. I have proposed the description in section 6 (a simplified drawing, not to scale; the real paths are two lines of longitude on a sphere). **Please check that this is what the sketch is meant to show.**

## Layout
- **Above Part 1 (no heading):** the introduction, "Want to know more?", a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the two guesses, "Send them walking" (strength 0.5), the two surfaces with their labels, and, as the travelers walk, the **graph** drawing itself, then the two white marks with their boxes, "Where the real picture comes from" and the caption once both lines are drawn.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** strength buttons (0.2, 0.5, 0.8, Other 0.01 to 0.99), "Send them walking with your strength", the two surfaces, and **Drawing A**: the graph on a fixed distance scale, so different strengths give visibly different curves; "Runs so far"; a caption.
- **Part 3 (teal), "The results":** the numbers of the Part 1 run with a tag on each final-separation line.
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while the travelers walk. It replaces "Walk Again" and clears both guesses.
- **Colours:** white is only ever the learner's guess; pink is only ever the learner's own strength in Part 2; indigo (solid) is the curved surface and amber (dashed) the flat surface, as built; grey is Part 1's curved line in Drawing A; teal and red are the two travelers, as built.

---

## 1. Introduction

**1a. "The question"** (old: "Experiment 3 showed that two falling balls drift together on a real planet, but never in an accelerating rocket. What does that convergence actually mean?"). New:
"In Experiment 3 (tidal effects), two balls fell side by side. This time we step back from gravity and ask a question about surfaces. Two travelers set off side by side and each walks straight ahead. Does the distance between them change?"

**1b. "Why even ask this"** (old: "...does 'walking as straight as you possibly can' even mean the same thing it does on a flat floor?"). New:
"Experiment 3 showed that two falling balls behave differently on a planet and in a rocket, but not why. Before we come back to gravity, we look at the idea underneath: what it means to move in a straight line, and whether the shape of the surface the travelers walk on makes any difference."

**1c. New paragraph, "How this page is laid out."** (same as Gravity 1 to 3, as approved)
"Below this introduction the page is in four sections, called Parts, each with a coloured heading. In Part 1 you make guesses and watch the experiment. In Part 2 you try it with a strength of your own. Part 3 shows the results, and Part 4 is the tutor, who talks it over with you."

**1d. "What happens"** (adds the fixed value and the names). New:
"Picture two travelers, a left traveler and a right traveler, standing side by side 1 metre apart, both facing the same direction. Each one walks straight ahead, never turning and always at the same walking speed, and we watch how far apart they are as they go. We run this twice: once on a flat surface, and once on a curved surface, a sphere, like the Earth. A graph draws the distance between the travelers as they walk. In Part 1 the curved surface has a curvature strength of 0.5, which is explained below. In Part 2 you choose your own strength and send them walking again."

**1e. New paragraph, "What 'curvature strength' means."** *(Rewritten twice, and the Earth comparison added, on 2026-11-12 at the owner's request: the first version, "a strength of 0.5 means a sphere with a radius of 20 metres (the radius is 10 metres divided by the strength); a strength of 0.2 means a radius of 50 metres, and 0.8 means 12.5 metres", was confusing.)*
"Curvature strength says how sharply curved the sphere is. Think of a basketball and the Earth. Both are spheres, but the basketball bends away quickly, while the Earth is so big that the ground looks flat to you. A small sphere is sharply curved, and a big sphere is only gently curved. So a bigger strength number means a smaller, more sharply curved sphere. Here is the size of the sphere for each strength (its radius is the distance from its middle to its surface):
- Strength 0.2: a gently curved sphere, 50 metres in radius.
- Strength 0.5 (the one in Part 1): 20 metres in radius.
- Strength 0.8: a sharply curved sphere, 12.5 metres in radius.

A real planet is far bigger than any of these. The Earth's radius is about 6,371,000 metres, more than 300,000 times bigger than the 20 metres of Part 1's sphere, which is why the ground looks flat to you. On this page's scale the Earth would have a curvature strength of about 0.0000016, far below the smallest value you can choose (0.01). Here the sphere is made small enough for the effect to be easy to watch, and the exact sizes are chosen only for that reason. Curvature strength has no unit. It is a plain number between 0 and 1."
*(Module: `radius = 10 ÷ strength`, tested already. No real value is quoted; the specification gives none.)*

**1f. "Your job"** (old: "Watch both surfaces and compare whether the distance apart between the two travelers changes on each one."). New:
"Before you press the button, guess what the two travelers will do on each surface. Then watch both surfaces and compare whether the distance between the travelers changes on each one, try other strengths in Part 2, and talk it over with the tutor."

**1g. New paragraph, "Your guesses and the real pictures."**
"Your guesses never change the real pictures, the surfaces or the numbers: they come from a calculation that knows nothing about what you guessed. Your two guesses are drawn on the graph in white, each in a box labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the strength you choose does change the surface drawings and the graph, and the lines it moves are pink."

**1h. New line, "Some new words."**
"The "Words and formulas" box below has each one with a short plain meaning: traveler, flat surface, curved surface, sphere, radius, the pole, separation, geodesic, graph, curvature strength, analogy, curved spacetime."

**1i. "What we assume"** (the bullets stay as built, with additions):
- "Both travelers walk 'as straight as possible' for their surface, a path called a **geodesic**." (as built)
- "Curvature strength is an exaggerated stand-in for how sharply curved the sphere is, so the effect is easy to watch instead of needing a huge sphere." (as built)
- "The sphere is an analogy for curved spacetime, not a literal picture of it. Real spacetime curvature involves time as well as space, which this experiment does not model." (as built)
- "This experiment doesn't use anything about light, moving clocks, or speeds close to light from earlier chapters. It is ordinary surface geometry." (as built)
- "Both travelers start side by side, 1 metre apart, and walk at the same steady speed." (added)

---

## 2. "Want to know more?" (opens in a new tab; fetched and read before approval)

**Linked from the start (two, neutral; added at the owner's request on 2026-11-12, "show some resource links in the intro also"):**
1. **NASA: "Facts About Earth"** (NASA Science; page last updated 5 December 2025). "A plain fact sheet on our planet, including its size: an equatorial diameter of 12,756 kilometres, which is a radius of about 6,378 kilometres at the equator."
2. **USGS: "Great Circle"** (U.S. Geological Survey, Earthquake Hazards Program; an image page dated about 2021). "A diagram of a globe with one line drawn around it, and a single sentence: the shortest path between two points on the surface of a sphere lies along a great circle."
Neither says anything about paths that start side by side coming together, or about curved spacetime. The "Want to know more?" paragraph says two pages are listed, and that a third, about geodesics and curved spacetime, is held back until after the tutor.

**Held back until after the tutor** (it names geodesics and curved spacetime, which the tutor names first; §12):
1. **ESA: "Measuring spacetime curvature"** (European Space Agency image page, credit ESA/ATG medialab, 7 September 2015). "An illustrated caption showing two objects falling freely along geodesics, which it calls the equivalent of straight lines in curved geometry, and how ESA's LISA Pathfinder thinking measures the curvature between them. It is more advanced than this page, so read the first paragraph."

**Source status (checked 2026-11-12; for the specification's source table).** The three pages were fetched and read by a helper, which could only quote short passages, and **I did not read them line by line**; spot-check them in a browser. The NASA page gives a diameter (12,756 km at the equator), not a radius; the introduction's 6,371,000 m is the mean radius, within about 0.1% of the equatorial 6,378 km, and the page does not state it. The USGS page is an image page with one sentence of text; I read its caption, not the image itself. It uses "geodesic", "straight" and "curved spacetime" together and says the blue surface is "like the spacetime" without saying that a surface drawing leaves time out (a simplification, which the tutor's analogy note covers). It does not mention paths that start parallel. The page uses no measured result, so there is no paper to cite.
**Read and not linked:** NOAA, "What is Geodesy?" (updated 23 September 2026): about measuring the Earth's shape, neutral but not about shortest paths, and its word "geodesy" could be mistaken for "geodesic". NASA Space Place, "What Is Gravity?" (article last updated 17 December 2020): it calls gravity a force, mentions Einstein's "curve in space" only in an image caption, and uses none of the words geodesic, spacetime, straight or parallel. NASA Goddard "Ask an Astrophysicist: Relativity" (answers from 1996 to 2006): it uses "curved space time" but calls free fall "the shortest path in curved spacetime" (free-fall paths are not simply shortest paths) and contains garbled statements, so not linked.
**Open (§29 rule 3(c)):** no plain official page was found on a straight path on a sphere, or on paths that start side by side meeting at a pole. A NASA eclipse-education page on a great circle on a spherical planet came up in search but redirects (HTTP 302) to a general NASA eclipse page and could not be read. Searched 2026-11-12 on nasa.gov, esa.int, noaa.gov and usgs.gov; nothing is linked for it. The introduction and the words box define the idea in plain words (§15).

---

## 3. "Words and formulas" (collapsed box)

- **Traveler:** a person walking in the picture. The left traveler is drawn in teal and the right traveler in red, so you can follow each one.
- **Flat surface:** a surface like a floor or a table top, with no bend in it.
- **Curved surface / sphere:** a surface that bends around, like the outside of a ball or the Earth. Here it is a sphere.
- **Radius:** the distance from the middle of a sphere to its surface. A smaller radius means a more sharply curved sphere. Here, radius = 10 metres ÷ curvature strength. The 10 metres is only a size picked so that you can watch a sphere this small, not a real value.
- **Curvature strength:** a plain number between 0 and 1 (no unit) that says how sharply curved the sphere is. A bigger number means a smaller, more sharply curved sphere. Real planets are far bigger than any sphere here, so the values are exaggerated.
- **The pole:** the point on the sphere that the travelers are walking toward, a quarter of the way around the sphere from where they started. On the Earth, the North Pole is a pole.
- **Separation:** the distance between the two travelers, in metres. It starts at 1 m.
- **Geodesic:** the path you get when you walk as straight as you possibly can on a surface, never turning. On a flat floor it is a straight line. On a sphere it is a path that bends around with the sphere.
- **Graph (line):** a picture of how one number changes as another does. Here each line shows the separation at each distance walked.
- **Analogy:** using something familiar (a sphere) to help understand something harder (spacetime). It is a help for thinking, not a claim that the two are the same thing.
- **Curved spacetime:** the name for what the tutor explains after your run.
- **Formulas this page uses before the run:** radius = 10 ÷ curvature strength, for example 10 ÷ 0.5 = 20 m; distance to the pole = radius × π ÷ 2, for example 20 × 1.5708 = 31.4 m. **Worked example from this page:** strength 0.8 gives a radius of 10 ÷ 0.8 = 12.5 m, and the pole is 12.5 × 1.5708 = 19.6 m away.

*The formula for how the separation changes with distance is **not** in this box: it would show the answer before the learner has predicted (§12). It appears in the Part 1 caption after the run.*

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess what the two travelers will do on each surface: the flat one and the curved one. Then you press "Send them walking" and watch both surfaces, with a curvature strength of 0.5. A graph draws itself as they walk, with your two guesses marked on it in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a different curvature strength and send the travelers walking again. The strength you choose changes the sphere drawing and Drawing A in this Part, with your lines in pink. It does not change Part 1's picture, the results in Part 3, or your guesses."
*Note beside the control:* "Your guesses do not change these drawings, but the strength you choose does."
*Before any Part 2 run:* "Not run yet. Choose a strength and press Send them walking with your strength."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guesses marked beside them. Nothing in this Part changes with your guesses or with the strength you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your two white marks on the graph, then explains."

---

## 5. The predictions

**Intro line** (as built, with the fixed value added): "Two travelers start 1 metre apart and both walk dead straight ahead. Do you think they'll drift closer together, drift farther apart, or stay exactly the same distance apart, on each surface? Part 1 uses a curvature strength of 0.5."
**Flat surface:** "On a flat surface, like a floor, what will the two travelers do?"
**Curved surface:** "On a curved surface, a sphere with a radius of 20 metres, what will the two travelers do?"
Buttons (as built): "They'll drift closer together" / "They'll stay the same distance apart" / "They'll drift farther apart".
After the run: "Your predictions are locked while you try other strengths. To change them, press Start over."
**Start over:** always visible; greyed until a guess is chosen or a run has begun, and while the travelers walk. It clears both guesses, the runs, the results and the tutor's progress.

---

## 6. Part 1's picture: the two surfaces and the graph

**Labels drawn on each surface (new):** "left traveler" and "right traveler" beside the teal and red dots, "start" at the left edge, "the pole" at the right end of the sphere (as built), "sphere (outline)" on the ellipse, and "flat surface" and "curved surface" titles (as built). The number under each surface stays: "Separation: 1.000 m".
**A note under both surfaces (new, owner to check):** "These are simple sketches, not to scale. Each dashed line is the path one traveler walks. On the flat surface the two paths run side by side. On the sphere, the outline stands for the sphere, and the paths are drawn as they would look from outside, with each traveler setting off from the same starting line and walking toward the pole." *(Drawn from the code and the specification's "viewed from an angle that shows its curvature"; I could not confirm the intended view. Alternative: say only "a simple sketch, not to scale".)*

**The graph** gets (new): a legend ("Curved surface: solid indigo line", "Flat surface: dashed amber line"), axis titles ("Separation between the travelers (m)" up the side, "Distance each traveler has walked (m)" along the bottom), the words "Curved surface" and "Flat surface" beside the line ends, and a vertical axis from 0 to **1.2 m** with a dotted line at the 1 m start. (The axis extension is a change of scale only.)

**The two white marks** (once both lines are fully drawn): at the end of each line a white ring; the curved ring is joined to its own box **"YOUR GUESS, curved surface (a marker only): the travelers drift closer together"** (or "...stay the same distance apart" or "...drift farther apart"), and the flat ring to its own box **"YOUR GUESS, flat surface (a marker only): ..."**. Beside each ring a short white arrow for the direction guessed: down for "closer together", a flat bar for "the same distance", up for "farther apart". The arrow has no length of its own, because the guess has no size; the caption says so. A guess shows nothing about what is right.

**"Where the real picture comes from":** "**Measured:** nothing. **Calculated here:** the separation of the travelers at every distance, from the formulas in the Part 1 caption. The flat line uses plain geometry. The sphere line uses the exact formula for two straight paths on a sphere. The curvature strength of 0.5 is far bigger than any real planet's would be. This page does not measure real surfaces. **Imagined for the question:** the two travelers and the surfaces they walk on. The sphere is an analogy for curved spacetime, not a picture of it. The white rings and arrows are only your guesses."

**Caption, "How to read this diagram":**
*What you see.*
- **The two surfaces** show the same walk on two kinds of surface. The left traveler is teal and the right traveler is red. Each dashed line is the path one traveler walks, and the dots show where they are now. The number under each surface is the distance between the travelers right now.
- **The flat surface** is like a floor. **The curved surface** is a sphere, drawn as an outline. "The pole" is the point the paths are heading toward, a quarter of the way around the sphere: here, 31.4 metres away.
- **The graph** draws itself as they walk. Up the side is the separation, from 0 to 1.2 m (the dotted line is the 1 m start). Along the bottom is the distance each traveler has walked, up to the pole.
- **The solid indigo line** is the curved surface. **The dashed amber line** is the flat surface. If the two lines lay on top of each other, you would see the amber dashes along the indigo line.
- **The two white rings, arrows and YOUR GUESS boxes** are your two guesses, drawn once both lines are drawn. A ring is in the same place whatever you guessed. Its arrow shows only the direction you guessed (down: closer together; flat bar: the same distance; up: farther apart), and its length means nothing. Both are markers only, and neither moves a line.
- **The formulas used:** separation = 1 m on the flat surface at every distance, and separation = 1 m × cos(distance ÷ radius) on the sphere. Here the radius is 20 m, so the travelers reach the pole after 20 × π ÷ 2 = 31.4 m. ("cos" is a button on a calculator: cos 0 = 1, and it falls to 0 at a quarter turn.)

*A worked moment.* On the sphere, after the travelers have walked 10 m, the separation is 1 × cos(10 ÷ 20) = 1 × cos 0.5 = 0.878 m. Halfway to the pole, at 15.7 m, it is 1 × cos(15.7 ÷ 20) = 1 × cos 0.785 = 0.707 m. At the pole, after 31.4 m, it is 1 × cos(1.571) = 0.000 m: the two travelers are at the same place. On the flat surface the separation is 1.000 m at all three distances. *A daily-life picture:* on a globe, two lines of longitude start side by side near the equator, each pointing straight north, and they meet at the North Pole. *(Shown here, after the run, so the picture is not explained before the learner has guessed.)*

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the solid indigo line and the dashed amber line. **What it means:** each shows the distance between the two travelers on one surface at every point of the walk. **Why it matters:** it lets you compare the two surfaces and see whether the distance changes, instead of only reading the number at the end.
2. **Look at** the right end of each line. **What it means:** it shows the distance between the travelers at the end of the walk: 0.000 m on the curved surface, where they have met at the pole, and 1.000 m on the flat surface, against the 1 m start. **Why it matters:** it gives you a number for each surface to compare with the start.
3. **Look at** the two white rings and your two YOUR GUESS boxes. **What it means:** each marks the place on the graph where the answer to that guess can be read: the end of its line. **Why it matters:** it shows where to look to compare what you expected with what was drawn.

---

## 7. Part 2's picture: Drawing A

**Drawn:** the two surfaces and a graph for the strength you chose, on a **fixed distance scale from 0 to 80 m** (the pole is 78.5 m away at strength 0.2) and the same 0 to 1.2 m vertical scale. Your curved line is **pink** (solid), labelled with your strength ("curved surface, your strength: 0.8"); the flat line is **light pink** and dashed; Part 1's curved line is a **thin grey line** labelled "curved surface, strength 0.5, from Part 1". The white guesses are **not** redrawn: they were guesses for the Part 1 run. A small label under each surface gives the distance to the pole for the chosen strength ("the pole is 19.6 m away"). For a smaller "Other" strength, whose pole is farther than 80 m, the axis stretches in steps of 20 m and a note says so. Below it, "Runs so far": one line per Part 2 run, such as "Strength 0.8: pole 19.6 m away; separation at the end 0.000 m".

**"Where the real picture comes from":** same as Part 1, with "the strength you chose" for "a curvature strength of 0.5".

**Caption, "How to read Drawing A":**
- **The graph** works as in Part 1, but the bottom scale is fixed at 80 metres, so you can compare strengths. In Part 1 it stretched to fit the walk.
- **Pink** marks your own strength: the solid pink line is the curved surface and the light pink dashed line is the flat surface. **The grey line** is Part 1's curved line, for comparison.
- **"Runs so far"** lists every run in this Part.
- *Worked moment:* after the travelers have walked 10 m, the separation is 1 × cos(10 ÷ 50) = 0.980 m at strength 0.2 (radius 50 m), 1 × cos(10 ÷ 20) = 0.878 m at strength 0.5, and 1 × cos(10 ÷ 12.5) = 0.697 m at strength 0.8. At strength 0.8 the travelers reach the pole after 19.6 m, much sooner than the 31.4 m at 0.5, so the pink line reaches 0 m earlier.
- **Look at** where the pink curved line reaches 0 m compared with the grey one. **What it means:** a bigger strength brings the line down sooner: the pole is 78.5 m away at strength 0.2, 31.4 m at 0.5 and 19.6 m at 0.8. **Why it matters:** it shows that the more sharply curved the sphere, the sooner two straight paths that start side by side come together, and that the light pink flat line stays at 1 m whatever you choose.

---

## 8. Results (Part 3)

Lines (as built, except as noted):
- **Curvature strength:** 0.5 (the sphere's radius is 20.0 m).
- **Distance each traveler walks:** 31.4 m (to the pole). *(new)*
- **Final separation, flat surface:** 1.000 m (started at 1.000 m). **Tag (new):** "your guess" + "Your guess for the flat surface is drawn on Part 1's graph as a white mark." ("— unchanged" is dropped.)
- **Final separation, curved surface:** 0.000 m (started at 1.000 m): the two travelers have met at the pole. **Tag (new):** "your guess" + "Your guess for the curved surface is drawn on Part 1's graph as a white mark."
- **Removed:** the "You predicted / What actually happened" pairs (the tutor now marks each guess).
- **New line:** "**Where this comes from:** calculated here from the formulas in the caption, with an exaggerated curvature strength; not measured. Nothing here changes with your guesses or with the strength you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: the flat row compares a number with itself and the curved row with its own formula. Because there is no table, there is no "What this table tells us" note.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe** (old: "Look at both graphs. On which surface did the distance between the travelers change?"). New: "Look at the graph. It has two lines, a solid indigo one for the curved surface and a dashed amber one for the flat surface. On which surface did the distance between the travelers change? Your two guesses are the white marks at the ends of the lines."
- **Compare** (old: "You predicted... What actually happened... what do you notice?"). New: "You guessed that the flat surface's travelers would [drift closer together / stay the same distance apart / drift farther apart], and that the curved surface's travelers would [...]. Those are the two white marks. Look at the graph again: what do you notice when you compare what you expected with what was drawn?" (It no longer states the outcomes.)
- **Conceptual:** unchanged. ("Neither traveler ever turned — both walked as straight as they possibly could, the whole way. What does it mean that they still ended up closer together?")  *(It states that they ended closer together, on the curved surface. This is after the learner has seen the graph and written two answers; it is kept as approved. Say if you would rather it ask "what do you make of the curved surface's line?")*
- **Explanation:** a new opening block, points 1 to 5 as built (with the changes below), the analogy note, and a closing line.

**Opening block (new, built from the module's marking, one sentence per surface):**
- Flat surface: "You guessed that the flat surface's travelers would [guess]. The flat line stays at 1.000 m: the travelers were exactly as far apart at the end as at the start. So [your guess matched what the graph shows / the graph shows something different from your guess]."
- Curved surface: "You guessed that the curved surface's travelers would [guess]. The curved line falls from 1.000 m to 0.000 m: the travelers had met at the pole. So [your guess matched / the graph shows something different from your guess]."

**Point 1:** as built ("On a flat surface, dead-straight paths that start parallel always stay parallel. This matches everyday intuition: it's why the two travelers on the flat surface stayed exactly 1.0 m apart the whole way.").
**Point 2** (old: "...ended up only 0.000 m apart."). Adds the worked number and the daily-life picture: "...That's why the two travelers on the sphere, starting the same 1.0 m apart, ended up 0.000 m apart: at the pole. At strength 0.5, after 10 m the separation was 1 × cos(10 ÷ 20) = 0.878 m. Picture a globe: two lines of longitude start side by side near the equator, each heading straight north, and they meet at the North Pole. Neither line turns; the curve of the globe brings them together."
**Point 3:** "Recall Experiment 3" becomes "Recall Experiment 3 (tidal effects)"; the rest as built.
**Point 4, 5 and the analogy note:** as built. *(Point 3 and 5 are the claims with no linked source, reported in the gap report; kept as approved.)*
**Closing line (new):** "Try other strengths in Part 2 to see the same thing: whatever strength you choose, the flat line stays at 1 m, and the bigger the strength, the sooner the curved line reaches 0."

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `curvedSpacetimeExperiment.ts`:
1. `actualOutcomeFor(scene)` and the `PredictionChoice` type move in from the component and return `'converge'` for the sphere and `'same'` for the flat surface. **Test:** for several strengths, the sphere's end separation is below the start and the flat surface's equals it.
2. `finalSeparationMeters(experiment, scene)` (moved out of the tutor). **Test:** 0.000 m (to rounding) for the sphere and 1.000 m for the flat surface, at 0.2, 0.5 and 0.8.
3. `guessMarkerFor(experiment, scene, choice)` returns the ring's place (the full distance and the scene's end separation), the arrow direction (down, none, up) and the box text. **Tests:** the ring's place is the same for all three choices; the arrow is down for "closer together", none for "same", up for "farther apart"; the box text names the surface and the choice; the result is unchanged by the choice.
4. `markGuess(experiment, scene, choice)` returns whether the guess matched and the plain sentence for the tutor's opening block. **Tests:** sphere matches only "converge", flat only "same"; the sentences contain 0.000 and 1.000; the real outcome is unchanged.
5. `SEPARATION_AXIS_TOP_METERS` = 1.2 and `distanceAxisEndMeters(experiment)`: 80 for the three presets, and in steps of 20 for a smaller "Other" strength. **Tests:** 0.2, 0.5 and 0.8 all fit in 80; 0.1 gives 160; 0.99 gives 80.
6. `workedNumbers()` returns the numbers shown in the caption, the tutor and Drawing A's caption (20 m and 31.4 m at 0.5; 0.878 m after 10 m; 0.707 m halfway; 0.980, 0.878 and 0.697 m after 10 m at 0.2, 0.5 and 0.8; 19.6 m at 0.8; 78.5 m at 0.2). **Tests:** each to the stated decimals.

---

## 11. Specification changes (only after approval, §28.2)

`04-curved-spacetime-geodesics.md`: Learner Controls (the control moves to Part 2; Part 1 uses 0.5; there is no flat/curved selector, both are always shown), Prediction Activity (the questions gain the fixed value), Display and Results Display (labels, a legend, marks, the 1.2 m axis, the fixed 80 m axis in Drawing A, no "You predicted / What actually happened" pairs, no early explanation), AI Tutor Behavior (the compare step no longer states the outcomes; the explanation marks both guesses), the introduction's wording, a new "Audit Update" section, the source table (the ESA link and the open gap), and the layout (four Parts, Start over).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction 1a to 1i:** the reworded question, "Why even ask this", the Parts paragraph, "What happens" with the fixed 1 m and strength 0.5, the "What 'curvature strength' means" paragraph (a bigger number means a smaller sphere), the changed "Your job", the guesses paragraph, the "Some new words" line and the assumptions? [yes]
2. **Links:** none up front (with the line saying that a link appears after the tutor), and one after the tutor (ESA, "Measuring spacetime curvature"), with the source status, including the open gap for a plain page on straight paths on a sphere? [yes]
3. **Words box:** the entries, and the separation formula held back from the box until the Part 1 caption? [yes]
4. **Part leads and the note beside the control:** approve? [yes]
5. **The predictions:** the restated setups and the locked-guess line? [yes]
6. **The marks:** two white rings with arrows and boxes, the same for any guess, on a graph whose axis runs to 1.2 m? [yes]
7. **Part 1's picture:** the labels, the note describing the sketch (**check it matches what the sketch is meant to show**), the legend and axis titles, the "Where the real picture comes from" line, and the Part 1 caption with the formulas, the worked moment, the globe picture and three look-for items? [yes]
8. **Drawing A and its caption:** the fixed 0 to 80 m scale, pink and light pink lines, a grey Part 1 line, and the look-for item? [yes]
9. **Results:** the numbers, the "met at the pole" wording, the guess tags, and the pairs removed? [yes]
10. **Tutor:** the three prompts (the conceptual question kept as approved), the opening block, the worked 0.878 m and the globe picture in point 2, and "Experiment 3 (tidal effects)"? [yes]
11. **Physics module:** the six items above? [yes]
