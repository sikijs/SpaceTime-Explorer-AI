# Draft wording: Gravity and Curved Spacetime Experiment 6 (Why do planets orbit instead of falling in?)
Date: 2026-11-12 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following `01-` to `05-draft-wording.md` of this group, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-12, "all defaults" to the ten questions of `06-gap-report.md`): fix every gap; Part 1 has three choice buttons (a very weak push, a very strong push, a push in between) and one Run that selects the next unrun push, and the full outcome line on the graph is drawn only after all three have run; the false "always falls in" sentence is replaced by the true bands (about 43 and about 141, with the 43 explained as set by a size we chose); an outcome graph with white guess marks; a fixed view for the drawing; the slider in Part 2 with the term "circular-orbit speed" explained only there; the introduction and tutor changes (tutor point 4 and "Why even ask this" kept as approved); Results with guess tags and no "In fact" lines; a small check-up table; links searched and read first, with the pages that explain an orbit as falling held back until after the tutor; an honesty line.

**Three places where the defaults left me a choice. Please check each.**
1. **Links (question 9).** I read three official pages (section 2). **None is neutral enough for the introduction:** each says outright, or shows in a picture, that an object thrown hard enough falls round the planet, which answers the "in between" guess. So **all links are held back until after the tutor**, and the introduction says why. This is the §29 rule 3(c) case for a neutral start-page: no plain official page found that does not give the answer. I did **not** propose NASA Space Place "What Is an Orbit?": it is plain and official, but it explains an orbit as a "tug-of-war" between gravity and momentum, which is the picture this experiment's first learning objective says an orbit is *not* (no balance of forces). Your call whether to add it.
2. **Part 2's explanation of the unit.** The slider's unit ("percent of the push that would give a perfect circle") tells the learner that 100 is special, which answers the "in between" guess. So the explanation appears in Part 2 only after all three Part 1 pushes have run; before that Part 2 shows the slider with a plain number and a note. Part 2 itself still appears after the first run, as the rule of 2026-11-07 requires.
3. **A correction to my gap report.** I wrote that the 140 percent orbit "swings out to 19 times the start distance". That was the stopping point of the page's run (it stops after eight laps' worth of time). The true farthest point is 49 times (f² ÷ (2 − f²) at f = 1.4). The report is corrected; nothing in the app depends on it, but the drawing's fixed view means that any push from about 135 up draws as "continues beyond the picture".

## Layout
- **Above Part 1 (no heading):** the introduction, "Want to know more?" (one line saying the links come after the tutor), a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the three guesses; **Start over** (always visible); three choice buttons and **Run**; the **top-view drawing** (fixed view, labelled) and the **outcome graph** beside or below it; once all three have run, the real step line and the three white marks with their YOUR GUESS boxes; "Where the real picture comes from" and the caption.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** the push-strength slider, "Push with my strength", the drawing (Part 1's paths in grey, the learner's in pink) and a pink dot on the outcome graph; a caption. Before all three Part 1 pushes have run, a visible note says to run the other pushes.
- **Part 3 (teal), "The results":** a table of the three Part 1 pushes with a guess tag, the check-up table, "What this table tells us", and the learner's latest Part 2 push if there is one.
- **Part 4 (blue), "The tutor".**
- **Links** (after the tutor's explanation): two pages, with the reasons.
- **Colours:** white is only ever the learner's guess; pink only the learner's own Part 2 push; amber the fixed Part 1 reference (paths and dots); grey Part 1's paths once Part 2 is open; yellow the central mass. The graph and drawing sit on a dark background so white shows.

---

## 1. Introduction

**1a. "The question"** (unchanged, approved 2026-09-27): "Why do planets go around the Sun instead of falling straight into it, or flying off into space?"

**1b. "Why even ask this"** (unchanged, approved 2026-09-29).

**1c. New paragraph, "How this page is laid out."** (same as Gravity 1 to 5)
"Below this introduction the page is in four sections, called Parts, each with a coloured heading. In Part 1 you make guesses and watch three pushes. In Part 2 you try a push of your own. Part 3 shows the results, and Part 4 is the tutor, who talks it over with you."

**1d. "What happens"** (old: "...You choose how strong that starting push is, then watch what path the object follows."). New:
"You'll watch this from directly above, like looking down at two marbles on a table. A small object starts to the right of a fixed mass, and you give it a single push, straight up on the screen, at the very start. After that, gravity is the only thing acting on it, constantly pulling it back toward the mass on the left. In Part 1 you watch three pushes: a very weak one, a very strong one, and one in between. A graph beside the drawing records how each push ended. In Part 2 you choose the strength of the push yourself."

**1e. "Your job"** (old: "Try a weak push and a strong push, and see what happens to the path."). New:
"Before you press Run, guess what a very weak push will do, what a very strong push will do, and whether anything different happens in between. Then watch the three pushes, try pushes of your own in Part 2, and talk it over with the tutor."

**1f. New paragraph, "Your guesses and the real pictures."**
"Your guesses never change the real pictures or the numbers: they come from a calculation that knows nothing about what you guessed. Your guesses are drawn on the graph in white, each in a box labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the push strength you choose does change the drawing, and what it changes is drawn in pink."

**1g. New line, "Some new words."**
"The "Words and formulas" box below has each one with a short plain meaning: orbit, push strength, falls in, flies away, collision size, relative units, top view, path, circular-orbit speed, escape speed, closest approach."

**1h. "What we assume"** (bullets as built, with additions):
- "This uses ordinary gravity (the same rule used to predict real satellites and planets), not the exact general relativity from Experiment 4's curved-spacetime picture (Experiment 4, curved spacetime), a simplification also used in Experiments 2, 3 and 5 of this chapter." (chapter names added)
- "The central mass doesn't move; only the small object does." (as built)
- "The push always points the same way, straight up on the screen. Only how strong it is changes; its direction never does." (as built)
- "There's no friction, no air resistance, and no other mass nearby, just this one mass and the object." (as built)
- "The mass and distance here are relative, made-up amounts, not real kilograms or metres." (as built)
- "Nothing here moves anywhere close to the speed of light." (as built)
- **New:** "The object counts as having 'fallen in' if it comes closer to the mass than one tenth of its starting distance. That size is our choice, standing in for the surface of the mass. A different size would move one of the boundaries you will see later."
- **New:** "Each run follows the object for a fixed length of time, about eight times the time a perfect circle would take. If it is still going round by then, we call that orbiting."

---

## 2. "Want to know more?" (opens in a new tab; fetched and read 2026-11-12 through helpers, not line by line)

**Under the introduction (one line):** "Links to NASA and ESA pages on orbits are at the bottom of this page. They appear after the tutor, because they would give away the answers to your guesses."

**After the tutor's explanation (two links):**
1. **NASA, "Chapter 3: Gravity & Mechanics" (Basics of Space Flight)**, `science.nasa.gov/learn/basics-of-space-flight/chapter3-4/`. "Isaac Newton's cannonball, drawn as three cartoons: a gentle shot lands close, a harder shot lands farther, and a hard enough shot never lands because it falls all the way round the Earth. It says a spacecraft in orbit is 'just falling'." Read: it uses the cannonball, says the ball falls "at the same rate", states that astronauts in orbit are in free fall, and gives the 30,000 km/hr figure for low Earth orbit. It does **not** mention escaping, escape speed, circles or the 43 to 141 band. Last updated 16 Jan 2025 on the page.
2. **ESA, "Types of orbits"**, `esa.int/Enabling_Support/Space_Transportation/Types_of_orbits`. "A tower and a thrown ball: a weak throw lands, a very powerful throw makes the ground curve away before the ball reaches it. It also says what 'eccentricity' means, how round or squashed an orbit is." Read: it names escape velocity once with no number, and says a perfectly round orbit stays at one distance while a more squashed one moves closer and farther. Marked "archive content, 30 Mar 2020", and updated since. Long, with some jargon (inclination, semi-major axis), so I say so in the link text: "a long page: read the 'Reaching orbit' part first".

**Not linked:** NASA Space Place "What Is an Orbit?" (read; see above, its "tug-of-war" framing). **Not found:** a page that gives a number for escape speed in plain words (ESA names it without a value; the NASA chapter does not mention it). The page therefore says the 141 percent figure is worked out here from the formula. Recorded as a gap for the status entry (§29 rule 3(c)).

---

## 3. "Words and formulas" (collapsed box)

Terms (plain meanings):
- **Orbit:** a path in which something keeps going round a mass instead of hitting it or leaving. It does not have to be a circle.
- **Push strength:** how strong the one push at the start is. Bigger means the object is moving faster when it starts.
- **Falls in:** the object comes closer to the mass than one tenth of its starting distance (our chosen size, standing in for the mass's surface).
- **Flies away:** the object keeps moving away from the mass and never comes back.
- **Collision size:** the one tenth of the starting distance used for "falls in".
- **Relative units:** distances and speeds here have no metres or kilometres; the starting distance is 1 and the mass's pull is 1.
- **Top view:** looking straight down on the paths, like looking down at marbles on a table.
- **Path:** the line the object traces as it moves.
- **Closest approach:** the nearest the object gets to the mass during a run, given as a fraction of its starting distance (0.5 means half of it).
- **Circular-orbit speed** *(after all three Part 1 pushes have run)*: the starting speed that makes a perfect circle round the mass. Push strength 100 means exactly this speed.
- **Escape speed** *(same)*: the starting speed above which the object never comes back.

Formulas *(shown only after all three Part 1 pushes have run, because they give the answers away)*, with the page's numbers (the mass's pull is 1 and the start distance is 1):
- Circular-orbit speed = the square root of (pull ÷ distance) = the square root of (1 ÷ 1) = 1.
- Escape speed = the square root of 2 × the circular-orbit speed = 1.414 × 1 = 1.414, which is push strength 141 (to the nearest whole number).
- Closest approach of a push of f times the circular speed, for f below 1 = f² ÷ (2 − f²) of the start distance. At f = 0.2: 0.04 ÷ (2 − 0.04) = 0.02. At f = 0.45: 0.2025 ÷ 1.7975 = 0.113.
- Falls in when that closest approach is below 0.1. At f = 0.426: 0.1815 ÷ 1.8185 = 0.0998, so about 0.43 is the edge.

*(A note under the box: "Where a number is shown with a % sign, it is a percentage of the circular-orbit speed.")*

---

## 4. Leads of the four Parts (drafted; the owner's wording, §28.1)

- **Part 1, "Predict, then watch"** (amber): "What we are about to do: you will make three guesses about three pushes: a very weak one, a very strong one, and whether anything different happens in between. Then you will watch each push and see how it ended."
- **Part 2, "Now try it yourself"** (pink): "What we are about to do: you will choose the strength of the push yourself and watch where it goes. The path you make is drawn in pink, and Part 1's paths stay in grey so you can compare."
- **Part 3, "The results"** (teal): "What we are about to do: read the numbers behind the three pushes you watched, with a plain reading of each."
- **Part 4, "The tutor"** (blue): "What we are about to do: talk over what you saw, and what it says about why things orbit."

---

## 5. The predictions (the questions are as built; the wording of the labels and the lock note change)

- **Question 1** (as built): "If the starting push is very weak, what do you think happens?" **Question 2** (as built): "If the starting push is very strong instead, which of those three do you expect?" **Question 3** (as built): "Is there a push strength in between where something different happens?" Answers as built: "Falls into the mass" / "Flies away and never returns" / "Curves around and comes back", and Yes / No.
- **Under each, after a choice:** "Your guess: …" (replacing "Your prediction: …"); before a choice: "Choose an option to continue".
- **The Run line, before all three are answered** (old: "Answer all three predictions above to run the experiment."): "Answer all three questions above to run the pushes."
- **The lock note, after Run** (old: "...change your predictions and start over"): "Your guesses are locked while you try other pushes. To change them, press Start over."
- **Start over** (always visible, greyed until there is a guess or a run and while a push is playing; replaces "Change predictions"; clears the guesses, the runs, the results and the tutor).
- **Run and choice buttons:** "A very weak push (push strength 20)", "A very strong push (push strength 200)", "A push in between (push strength 100)", then **Run**, which selects the next unrun push after each run. Under the buttons, after a run: "Pushes watched: 1 of 3."

---

## 6. Part 1's pictures

**6a. The drawing (top view, fixed view).** Fixed view: from −4 to +4 start distances on each side, so the three runs compare at one scale. Labels on the canvas:
- "Fixed mass" at the central dot (yellow).
- "Object (start)" at the starting point, to the right of the mass.
- A short arrow up from the start, labelled "Push (straight up)", whose length grows with the push strength of the push selected.
- "Path" along each line, each path ending in its push strength ("push 20", "push 100", "push 200").
- A dashed line where a path leaves the picture, labelled "Continues beyond the picture" (a visual cue that the object keeps going, not a further calculation).
- A faint ring at one tenth of the start distance, labelled "Fall-in size".

**6b. The outcome graph.** Push strength along the bottom, from 0 to 200 (title: "Push strength (a fixed scale, 0 to 200)"), three rows up the side with row labels "Flies away", "Orbits", "Falls in" (top to bottom). Title: "How each push ended". Elements, drawn as they become available:
- **One amber dot per push run**, on the row where that push ended, at its push strength.
- **After all three runs: the real step line**, a heavy line across the graph in the rows the module computes for every push from 0 to 200, with its two corners labelled by push strength (shown on the graph after the runs: about 43 and about 141).
- **The three white marks with YOUR GUESS boxes** (drawn together with the step line, never before it): for the weak and strong guesses, a white ring on the row the learner chose, at push strength 20 and 200, joined by a line to a box "YOUR GUESS: falls in / orbits / flies away"; for the in-between guess, a white marker on the middle of the graph's top edge, joined to a box "YOUR GUESS: yes, something different happens in between" or "YOUR GUESS: no". The ring's row follows the guess. The in-between marker is only a marker (said in the caption).
- Until the line is drawn, a note in the graph: "The full line appears after all three pushes have run."

**6c. "Where the real picture comes from"** (under both pictures)
"**Calculated here:** every path and every outcome. The computer steps ordinary gravity forward in very small time steps and checks, at each step, how close the object has come to the mass and whether it is moving away for good. **Measured:** nothing; no real planet or satellite was measured for this picture. **Imagined for the question:** the mass, the start distance and the push, all in relative units; and the size we gave the mass (one tenth of the start distance), which decides where 'falls in' begins. Each run follows the object for about eight times the time a perfect circle would take; the dashed line is only a cue that the object keeps going. White is only ever your guess."

**6d. Caption, "How to read this diagram"** (appears under the pictures; the look-for items appear only as each feature is drawn)
- **What you are looking at.**
  - *The drawing* is a view from directly above, like looking down at marbles on a table. The yellow dot is the fixed mass. The small object starts to its right.
  - *The arrow* at the start is the push, straight up on the screen. A longer arrow is a stronger push.
  - *Each line* is the path the object took after that push. The number at its end is the push strength, a plain scale from 0 to 200 used on the graph below.
  - *The faint ring* is the size we gave the mass. If a path comes inside it, we count the object as fallen in.
  - *A dashed line* means the path carries on beyond the edge of the picture; we stop drawing there.
  - *The graph* shows, for each push, how it ended: on the bottom row, "Falls in"; middle, "Orbits"; top, "Flies away". *Amber dots* are the pushes you watched. The *heavy line* and the *white marks* appear after all three have run.
- **A worked moment.** A very weak push, strength 20. The object starts at the right, moving only slowly upward. Gravity pulls it toward the mass and it curls in, passing within 0.02 of its starting distance of the mass, well inside the faint ring. We count that as falling in, and an amber dot appears on the bottom row at 20.
- **What to look for** (each item shown once its feature is drawn):
  - **Look at:** the three amber paths. **What it means:** each is one push, and the three are the same mass at the same start distance, so only the push changed. **Why it matters:** if only one thing changed and the paths differ, the push strength alone decides the path.
  - **Look at:** the amber dots on the graph. **What it means:** each dot says how one push ended, on a row, at its strength. **Why it matters:** the graph turns three separate pictures into one record you can compare.
  - **Look at:** the heavy line, and where your white marks sit against it. **What it means:** the heavy line is how every push from 0 to 200 ended, calculated here; your white marks are your guesses, drawn there so you can compare. **Why it matters:** it shows the outcome as a function of one number, so you can see not only what happened at three pushes but across all of them.
- **Where a guess has no place of its own:** "The 'in between' guess is yes or no, so it has no size or position of its own. Its marker is only a marker."

---

## 7. Part 2's pictures and control

- **Slider:** label "Push strength: 130" (the number only, until all three Part 1 pushes have run; then "Push strength: 130% of circular-orbit speed"). Range 0 to 200, step 5, **opens on 50** (the page as built opens on 100, which would itself show the answer); the learner moves it from there.
- **Note, before all three Part 1 pushes have run (visible where the explanation will appear):** "Run the other pushes in Part 1 to see what this scale means. Until then, move the slider and press 'Push with my strength' to see where a push of your own goes."
- **Explanation, after all three have run:** "Push strength is a percentage of one particular speed: the speed that would make the object go round the mass in a perfect circle, called the circular-orbit speed. Push strength 100 is exactly that speed; 50 is half of it; 200 is twice it."
- **Button:** "Push with my strength".
- **Drawing A (the same view, fixed):** Part 1's three paths in grey, labelled as in Part 1; the learner's path in pink, ending in its push strength; a pink arrow at the start, its length following the slider; a pink dot on the outcome graph at the chosen push, on the row where it ended. "Runs so far" lists the learner's pushes (strength and outcome).
- **Caption, "How to read this diagram" for Part 2:** names the pink path, the pink arrow and the pink dot, says grey is Part 1; worked moment: "At push strength 60 (not one of Part 1's), the pink path... " *(the outcome for the worked moment is computed by the module; I will insert it from the module's tested output, not by hand)*; look-fors in the three-part form: the pink dot against the heavy line; the pink path against the grey paths; the closest approach in "Runs so far" against the faint ring. *(Drafted in full for your review once the module numbers exist; the first draft would otherwise quote numbers I have not computed through the module.)*
- **"Where the real picture comes from"** (same wording as 6c).
- **A note beside the slider (rule §14.7):** "Your guesses do not change the drawing or the graph. This slider does."

---

## 8. Results (Part 3)

**Table 1, "The three pushes you watched":** columns: Push strength / Closest approach to the mass (fraction of the start distance) / How it ended / Your guess. Rows: 20, 100, 200. The "Your guess" cell shows only the guess, a small white tag ("your guess: falls in"; for the in-between row, "your guess: yes, something different happens in between"), never "right" or "wrong". For a push that did not come back (200), the closest approach is its starting distance, 1, because the start is the nearest point.

**Table 2, "Check-up: the formula against the step-by-step calculation"** (the drafted default, question 8; the owner may remove it):
| Question | The formula says | The step-by-step calculation found | Reading |
|---|---|---|---|
| At what push strength does the object stop coming back? | 141.4 | between 141 (still orbits) and 142 (flies away) | the same: the formula's number is between the two |
| What does a push of exactly 100 do to the distance? | stays at 1 | closest 1.00 and farthest 1.00 | the same |
| Where does "falls in" begin, with a collision size of 0.1? | 42.6 | between 42 (falls in) and 43 (orbits) | the same, but the 0.1 is our choice |

**What this table tells us** (each item says what it is, what it means with the real numbers, why it matters):
- **The first row.** *What it is:* two ways of finding the same boundary. One is a formula, the escape speed: the square root of 2 times the circular-orbit speed, which is 1.414 times it. The other is the step-by-step calculation the page actually runs, tried at 141 and 142. *What it means:* the formula puts the boundary at 141.4, and the calculation finds it between 141 and 142, so they agree. *Why it matters:* the pictures come from the calculation, so agreeing with an independent formula is a check that the calculation is not making the boundary up.
- **The second row.** *What it is:* the speed that makes a perfect circle. *What it means:* at 100 the object stays at the same distance, 1, all the way round. *Why it matters:* a circle is the simplest orbit, and it is a check that the stepping does not make the path drift in or out by itself.
- **The third row.** *What it is:* the edge between falling in and orbiting. *What it means:* it depends on the size we gave the mass (one tenth of the start distance). With a different size the edge would move. At 0.2 of the start distance it would be at push 58; at 0.05, at push 31. *Why it matters:* unlike the first two rows, this boundary is not a fact about gravity alone but about how close counts as "in". *(Those two example numbers come from the formula f² ÷ (2 − f²) set equal to 0.2 and 0.05: f = 0.577 and f = 0.309. They will come from the module in the build, with tests, and I will correct them if the module disagrees.)*
- **How sure is it?** "The formula numbers are exact. The stepping numbers are found by trying whole numbers, so they are only as fine as the whole numbers tried."

**The guess tag** (rule of 2026-10-24): the learner's three guesses appear again beside the table rows they live on. No "matched".

---

## 9. Tutor (Part 4)

- **Observe** (old: "What happened to the path this time — did it fall in, fly away, or come back around? (It falls into the mass.)"). New: "Look at the drawing and the graph. What happened to each of the three pushes? Say what you saw on each path."
- **Compare** (old: lists the guesses and states "in fact, a push well below circular speed always falls in..."). New: "Your guesses are the three white marks on the graph. Look at where each one sits compared with the heavy line. What do you notice, and was anything a surprise?" *(The tutor asks and does not state.)*
- **Conceptual** (as built): "The mass and the starting distance were the same the whole time. What was the only thing that changed between falling in, escaping, and orbiting?" *(plus a final line:)* "If you have not already, try a few pushes of your own in Part 2 and see where the paths change."
- **Explanation** (after the learner's reply), points:
  1. **The object is always just falling under gravity**, exactly like Experiment 1's dropped ball (Experiment 1, the dropped ball). The only push it ever got was the one you gave it at the very start. After that, gravity is the only force acting on it. *(as built, chapter name added)*
  2. **The only difference between falling in, orbiting and flying away is how strong that starting push was.** The mass and the start distance never changed. *(as built, "escaping" → "flying away")*
  3. **Three kinds of path.** A push below about 43 falls in. A push from about 43 to about 141 orbits. A push above about 141 flies away and never comes back. In between there is not one 'right' push: a whole band of them orbits, and only 100 makes a perfect circle. The others make a stretched oval, longer and longer as the push gets stronger: at 105 the farthest point is 1.2 times the start distance, at 120 it is 2.6 times, at 135 it is 10 times, and at 140 it is 49 times, almost leaving. *(Numbers from f² ÷ (2 − f²); the build takes them from the module.)* Think of throwing a ball off a cliff harder and harder (as built): a gentle throw lands close, a hard throw lands far, and a hard enough throw keeps falling while the ground curves away beneath it just as fast, so it never lands. That is an orbit.
  4. **Your three guesses.** *(The tutor marks each one, here and nowhere earlier.)* "You guessed a very weak push [falls in / flies away / orbits]. At push strength 20 it fell in" with a plain line saying whether that matches. Same for the very strong push (200: flew away). And "You guessed [yes / no] to something different in between. There is: a wide band, about 43 to 141, where the object orbits." *(Wording of the match: "That matches what you guessed." / "That is different from what you guessed." The marking lives only in the tutor.)*
  5. **Where the 141 comes from.** The speed that is just enough to escape is the square root of 2 times the circular-orbit speed. With the page's numbers, the circular-orbit speed is the square root of (1 ÷ 1) = 1, so the escape speed is 1.414 times it: push strength 141. Above that, the pull of the mass can never bring the object back; below it, it always can. *(Mechanism kept short; no energy formalism, per the specification's "Not introduced".)*
  6. **Where the 43 comes from.** It is not a law of gravity. It comes from the size we gave the mass: we counted 'fallen in' as coming closer than one tenth of the start distance. A push below 43 curls in closer than that. A real planet or star has a real size, and the edge would sit where the object's closest approach equals that size.
  7. **The path is as straight as spacetime allows**, and it curves because spacetime near the mass is curved (Experiment 4, curved spacetime), by an amount that depends on the mass and distance (Experiment 5, what curves spacetime). *(as built, chapter names added; the owner decided to keep it)*
  8. **This used ordinary, first-order gravity**, the same rule used to predict real satellites and planets, not the exact general-relativistic calculation, the same simplification Experiments 2, 3 and 5 of this chapter use. *(as built)*

---

## 10. Physics module (new, with tests; the approved model, constants and numbers are unchanged)

New exports in `src/physics/orbitExperiment.ts`:
- `PART_ONE_PUSHES`: weak 0.2, strong 2.0, in between 1.0 (fractions of circular speed).
- `circularSpeedFor(gravitationalParameter, distance)` (replaces the component's own square root).
- `outcomeForPush(fraction)`: runs `runOrbitExperiment` at the fixed mass and distance and returns the outcome.
- `outcomeSweep(step)`: outcomes from 0 to 2 in the given step (for the graph's step line).
- `pushEdges()`: the closed-form edges, `fallsInBelow` = sqrt(0.2 ÷ 1.1) (from the collision radius factor) and `escapesFrom` = sqrt(2).
- `closestApproachFraction(fraction)`: f² ÷ (2 − f²) for f below 1, 1 otherwise.
- `farthestPointFraction(fraction)`: f² ÷ (2 − f²) for f above 1 (and below sqrt(2)), 1 otherwise.
- `edgeCheck()`: the stepping brackets (the last push that falls in and the first that orbits; the last that orbits and the first that flies away) next to the formula numbers.
- `guessMarkers(slow, fast, inBetween)`: the row and push strength of each white mark.
- `tutorMarking(...)`: for each guess, whether it matches the real outcome, for the tutor only.
- `collisionSizeForEdge(edge)`: the inverse, for the Table 2 third-row example numbers.

Tests: the three edges (stepping agrees with the closed form to within the step used: falls in at 42, orbits at 43; orbits at 141, escapes at 142); 100 stays at distance 1 within a small tolerance; closest-approach and farthest-point formulas agree with the integrator for several pushes (for example 20, 45, 105, 120); the sweep is in the order falls in, orbits, flies away with no other order; `PART_ONE_PUSHES` outcomes are falls in, flies away, orbits; guess markers follow every guess; tutor marking for all 3 × 3 × 2 combinations; invalid inputs throw; the existing eight tests still pass unchanged.

---

## 11. Specification changes (only after approval, §28.2)
Record the Audit Update: the four Parts, the outcome graph and marks, the fixed view, the corrected bands, Start over, the check-up table, the links and words box, the new tutor wording, and the module additions; the "Results Display" and "AI Tutor Behavior" sections' "predictions shown beside what actually happened" updated to the new pattern; the "Expected Observations" clarified with the bands (43, 141).

---

## 12. Questions for the owner (suggested answers in brackets)
1. **Links held back:** all links appear only after the tutor, and the introduction says so; **NASA Space Place not added** because of its "tug-of-war" framing? [yes]
2. **Part 2's unit explanation held back** until all three Part 1 pushes have run, with a visible note? [yes]
3. **The slider opens on 50**, not on the built default of 100? [yes: the built default of 100 would itself show the answer]
4. **Part 1 button labels** show only the push strength number (20, 100, 200) with no percent sign until the unit is explained? [yes]
5. **The tutor's point 3** gives the numbers for how stretched the oval gets (105, 120, 135, 140)? [yes]
6. **The tutor marks the guess in point 4** with "That matches what you guessed." / "That is different from what you guessed."? [yes, as in Gravity 3 to 5]
7. **The check-up table's third row** (the edge depends on our chosen collision size, with the 0.2 and 0.05 examples)? [yes]
8. **Worked numbers in Part 2's caption** to be added after the module exists, then shown to you before the build? [yes]
9. **Chapter names** added to every cross-reference ("Experiment 4, curved spacetime")? [yes]
10. **Honesty line** as in 6c? [yes]
