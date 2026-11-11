# Draft wording: Gravity and Curved Spacetime Experiment 1 (The Equivalence Principle)
Date: 2026-11-11 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following the Relativity audits, `01-` to `11-draft-wording.md`, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-11, "all defaults" to the eight questions of the gap report): fix every gap; Part 1 fixed at 1g with the acceleration choice in Part 2; a white ring marker (a marker only) for either guess; add labels only (ball, floor, curve legend, axis titles) and draw no planet or rocket; the verdict moves from the tutor's compare step to its explanation; the car picture stays without the claim that gives the answer; no check-up table and no "You predicted / What actually happened" pair; an honesty line that the agreement is built into one formula and is not a measurement.

## Layout
- **Above Part 1 (no heading):** the introduction, "Want to know more?", a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the guess, "Drop the ball" (1g, 9.80 m/s², the page's opening preset), the two cabins with their labels, and, as the ball falls, the **graph** drawing itself, with the white ring marker, its YOUR GUESS box, "Where the real picture comes from" and the caption once the dashed curve is drawn.
- **Part 2 (pink), "Now try it yourself", after the first drop finishes:** acceleration buttons (0.5g, 1g, 2g, Other 0.1g to 5g), "Drop with your acceleration", two cabins, and **Drawing A**: a graph on a fixed time scale, so a different acceleration gives a visibly different curve, with the 1g curve from Part 1 kept as a grey reference; "Runs so far"; a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 drop with a tag on the time line; where the numbers come from.
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a drop and while the ball is falling. It replaces "Run Again".
- **Width:** 900 px (already).
- **Colours:** white is only ever the learner's guess; pink is only ever the learner's own acceleration in Part 2; indigo (solid) is Cabin A and amber (dashed) is Cabin B, as built; grey is the 1g reference in Drawing A.

---

## 1. Introduction

"The question", "What happens" and "Your job" stay as built, with the changes below. **Changes are marked.**

**1a. "A daily-life picture"** (old: "... that push would feel exactly like a weak sideways gravity, not like acceleration at all. This experiment sets up that same substitution more carefully..."). New:
"When a car accelerates forward, you feel pressed back into your seat, almost as if an invisible hand were pushing you backward. Nothing outside the car is touching you; you feel a push because the car's speed is changing. This experiment looks at a push like that more carefully: not for your own body, but for a dropped ball, inside two sealed cabins side by side."

**1b. "What happens"** (adds that Part 1 is fixed and where the choice is). New last sentence: "In Part 1 both cabins use the pull of Earth's gravity at the ground, called 1g (explained below). In Part 2 you choose a different value and drop the ball again."

**1c. "Your job"** (old: "Watch both cabins and compare how the ball moves in each one."). New:
"Before you press the button, predict whether the ball will move differently in the two cabins or the same way. Then watch both cabins and compare how the ball moves in each one, try other values in Part 2, and talk it over with the tutor."

**1d. New paragraph: "Your guess and the real pictures."**
"Your guess never changes the real pictures, the cabins or the numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the graph in white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the acceleration you choose does change the cabins and the graph, and the marks it moves are pink."

**1e. New paragraph: "What 1g means."**
"g is the size of Earth's gravity at the ground. A ball dropped near the ground speeds up by 9.8 metres per second (about 22 miles per hour) in every second it falls. So after 1 second it moves at 9.8 m/s, and after 2 seconds at 19.6 m/s. We write this 9.8 m/s² and call it **1g**. 2g is twice as much, and 0.5g is half as much. In Cabin B the rocket makes the floor speed up at the same rate, so the same number is used for both cabins."
(Check: 9.8 m/s × 2.237 = 21.9 mph, "about 22" is true. The 9.8 value is the one the page already uses, `EARTH_GRAVITY`.)

**1f. New line: "Some new words."**
"The "Words and formulas" box below has each one, with a short plain meaning: sealed cabin, acceleration, g, metres per second squared, height above the floor, elapsed time, graph, equivalence principle."

**1g. "What we assume"** (the two lines stay; two are added because the specification says they must be stated):
- "Both cabins are idealised: no air, a single small ball, and a steady push or pull the whole time." (as built)
- "In Cabin A, gravity pulls equally hard at every height inside the cabin, which is true to a very good approximation for a small cabin near a planet's surface. In both cabins the ball starts at rest, 2 metres above the floor, relative to its own cabin." (added)
- "This experiment doesn't use anything about light or moving clocks from earlier chapters..." (as built)

---

## 2. "Want to know more?" (opens in a new tab; fetched and read before approval)

*Pending: the source search is being run and read now. The entries, with the exact page titles and a one-line description for each, will be added here before this draft is shown for approval. Nothing is linked that has not been read (§29 rule 3(c)).*

---

## 3. "Words and formulas" (collapsed box)

- **Sealed cabin:** a closed box with no windows, so the only thing you can watch is what happens inside it.
- **Acceleration:** how fast something's speed is changing. A car that goes from 0 to 10 m/s in 2 seconds is accelerating at 5 metres per second, every second.
- **Metres per second squared (m/s²):** the unit of acceleration. 9.8 m/s² means the speed grows by 9.8 metres per second in each second.
- **g:** the acceleration of a dropped object near Earth's ground, 9.8 m/s². 2g is twice that and 0.5g half.
- **Height above the floor:** how far the ball is above the floor of its cabin, in metres. Here it starts at 2 m.
- **Elapsed time:** the time since the ball was released, in seconds.
- **Graph (curve):** a picture of how one number changes as another does. Here the curve shows the ball's height at each moment.
- **Equivalence principle:** the idea this chapter's first experiment is named for; the tutor explains it after your run.
- **Formulas (the ones this page uses).** Height at time t = start height − ½ × acceleration × t². Time to reach the floor = √(2 × start height ÷ acceleration). **Worked example from this page:** at 1g (9.8 m/s²) from 2 m: √(2 × 2 ÷ 9.8) = √0.408 = 0.64 seconds. At 2g (19.6 m/s²): √(2 × 2 ÷ 19.6) = √0.204 = 0.45 seconds.

(Checked: √(4/9.8) = 0.639, √(4/19.6) = 0.452. Both agree with `runEquivalencePrincipleExperiment`.)

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess whether the ball will move differently in the two cabins or the same way. Then you press "Drop the ball" and watch both cabins at 1g. A graph draws itself as the ball falls, with your guess marked on it in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a different acceleration and drop the ball again. The value you choose changes the cabins and Drawing A in this Part, marked in pink. It does not change Part 1's picture, the results in Part 3, or your guess."
*Note beside the acceleration buttons:* "Your guess does not change these drawings, but the acceleration you choose does."
*Before any Part 2 drop:* "Not run yet. Choose an acceleration and press Drop with your acceleration."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 drop, with your guess marked beside them. Nothing in this Part changes with your guess or with the acceleration you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white marker on the graph, then explains."

---

## 5. The prediction

**Question** (as built, with the fixed value added): "Both cabins start with the ball 2 metres above the floor, and both use 1g. If you were sealed inside each cabin and dropped a ball, do you think the ball would move differently in the two cabins, or exactly the same way?"
Buttons: "Differently" / "The same way" (as built).
Line under the buttons (as built): "Your prediction: [choice]" or "Choose an option to continue".
After the drop: "Your prediction is locked while you try other accelerations. To change it, press Start over."
**Start over:** always visible, greyed until a choice is made or a drop has begun, and while the ball falls. It clears the guess, the runs, the results and the tutor's progress.

---

## 6. Part 1's picture: the cabins and the graph

**Labels drawn on the pictures (new):** each cabin shows a small label "ball" beside the ball and "floor" on the floor line, under the letter "Cabin A" or "Cabin B". The height readout stays: "Height above floor: 1.35 m". **Which cabin is which is still only in the introduction** (the specification's reason). **The graph** gets a legend, "solid indigo line: Cabin A", "dashed amber line: Cabin B", and axis titles: "Height above the floor (m)" up the side and "Time since release (s)" along the bottom, with the numbers already there (0 s, the fall time, 2 m, 0 m).

**The white mark** (once the whole graph is drawn, i.e. the dashed curve has finished): a white ring around the end of the curves (where they reach the floor), joined by a line to a white box: **"YOUR GUESS (a marker only): the ball moves differently in the two cabins"** or **"...the ball moves the same way in the two cabins"**. The ring is in the same place for either guess, because a yes or no has no size or position of its own, and the caption says so. It shows the guess only and says nothing about what is right.

**"Where the real picture comes from":** "**Measured:** nothing. **Calculated here:** the ball's height at every moment, from one formula (height = 2 m − ½ × acceleration × time²), used for both cabins, so the two curves are the same calculation drawn twice. Because of that, they agree by construction: this page does not test whether real balls behave this way. **Imagined for the question:** the two sealed cabins, which are an idealised thought experiment with no air and a steady push or pull. The white ring is only your guess."

**Caption, "How to read this diagram":**
*What you see.*
- **The two cabins** show the same moment in two different situations. Each has a ball (the round blob) 2 metres above its floor at the start; the number under each cabin is the ball's height above the floor right now.
- **Cabin A and Cabin B** are the two situations described in the introduction. The ball's height is drawn the same way in both, so you can compare them directly.
- **The graph** draws itself as the ball falls. Up the side is the ball's height above the floor, from 2 m at the top to 0 m (the floor) at the bottom. Along the bottom is the time since release. A point on the curve says how high the ball was at that moment.
- **The solid indigo line** is Cabin A's ball. **The dashed amber line** is Cabin B's ball. If the two lines lie exactly on top of each other, you see the amber dashes along the indigo line.
- **The time at the right end** of the bottom axis is when the ball reaches the floor.
- **The white ring and the YOUR GUESS box** are your guess, drawn once both lines are drawn. The ring is in the same place whatever you guessed, because a yes or no has no size; it is only a marker, and it never moves the lines.

*A worked moment.* At 1g the ball needs 0.64 seconds to fall 2 metres. Halfway through, at 0.32 seconds, its height is 2 − ½ × 9.8 × 0.32² = 2 − 0.50 = 1.50 metres. Both lines show 1.50 m at 0.32 s.

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the solid indigo line and the dashed amber line. **What it means:** each shows the height of one cabin's ball at every moment. **Why it matters:** it lets you compare the two cabins' balls at every moment and not only at the end.
2. **Look at** the time at the right end of the bottom axis. **What it means:** it is how long the ball takes to reach the floor, 0.64 seconds in this run. **Why it matters:** it gives you one number to compare between the two cabins.
3. **Look at** the white ring and your YOUR GUESS box. **What it means:** it marks the place on the graph where the answer to your guess can be read: the end of the two lines. **Why it matters:** it shows where to look to compare what you expected with what was drawn.

---

## 7. Part 2's picture: Drawing A

**Drawn:** the two cabins and a graph for the chosen acceleration, on a **fixed time scale from 0 to 2.1 seconds** (the longest fall is 2.02 s, at 0.1g), so that a stronger pull gives a visibly steeper and shorter curve. The chosen run's two lines (still solid and dashed, lying on each other) are drawn in **pink**, labelled "your acceleration: 2g"; Part 1's 1g curve stays as a **thin grey line** labelled "1g, from Part 1", so the learner can see how the new curve differs. The white guess is **not** redrawn here: it was a guess for the 1g drop. Below it, "Runs so far": one line per Part 2 drop, such as "2g (19.60 m/s²): the ball reaches the floor after 0.45 s, in both cabins".

**"Where the real picture comes from":** same as Part 1, with "the acceleration you chose" for 1g.

**Caption, "How to read Drawing A":**
- **The graph** works as in Part 1, but the bottom scale is fixed at 2.1 seconds, so you can compare runs. In Part 1 the scale stretched to fit the fall.
- **Pink** marks your own acceleration. **The grey line** is the 1g fall from Part 1, for comparison.
- **"Runs so far"** lists every drop in this Part.
- *Worked moment:* at 2g the ball reaches the floor after 0.45 seconds, sooner than the 0.64 seconds at 1g, so the pink curve reaches 0 m earlier.
- **Look at** where the pink curve meets the bottom (0 m) compared with the grey one. **What it means:** a stronger acceleration makes the ball reach the floor sooner (2g: 0.45 s; 0.5g: 0.90 s). **Why it matters:** it shows that the time to the floor depends on the acceleration, and, in the same drawing, that it is the same in both cabins whatever acceleration you choose.

---

## 8. Results (Part 3)

Lines (as built, except as noted):
- **Acceleration:** 1g (9.80 m/s²).
- **Time for the ball to reach the floor:** 0.64 s, the same in both cabins. **Tag (new):** "Your guess is drawn on Part 1's graph as the white marker."
- **Removed:** the "You predicted / What actually happened" pair and its divider (the older text-beside-results; the tutor now marks the guess).
- **Removed:** the closing sentence "From inside either cabin, watching only the ball, there is no experiment here that would tell you which cabin you were in." It states the answer to the tutor's third question, so it moves to the tutor (§12).
- **New line:** "**Where this comes from:** calculated here from one formula, not measured (see the caption). Nothing here changes with your guess or with the acceleration you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: both cabins' numbers come from one call, so a table would compare a number with itself.

---

## 9. Tutor (Part 4)

Three questions then the explanation. Changes:
- **Observe** (old: "Look at the two graphs. Are they the same, or different?"). New: "Look at the graph. It has two lines, a solid indigo one for Cabin A and a dashed amber one for Cabin B. Do they lie on top of each other, or apart? Your guess is the white marker at the end of the lines."
- **Compare** (old: "You predicted the ball would move [x] in the two cabins. It actually moved [y]... what do you notice?"). New: "You guessed that the ball would move [differently / the same way] in the two cabins. That is the white marker. Look at the graph again: what do you notice when you compare what you expected with what was drawn?" (It no longer states the outcome.)
- **Conceptual:** unchanged. ("If you were sealed inside one of these cabins with no windows, could you have figured out which one you were in, just from watching the ball?")
- **Explanation:** points 1 to 3 as built, with a new opening block that marks the guess (no score), a new point 4 on the idea of a calculation and a real test, and a closing line.

**Opening block (new, no score):**
- If the guess was "the same way": "You guessed that the ball would move the same way in the two cabins. The two lines lie on top of each other: at every moment the ball was at the same height in Cabin A and in Cabin B, and it reached the floor after the same 0.64 seconds in both."
- If the guess was "differently": "You guessed that the ball would move differently in the two cabins. The two lines lie on top of each other: at every moment the ball was at the same height in Cabin A and in Cabin B, and it reached the floor after the same 0.64 seconds in both."
(Both use the module's marking; the time comes from the result. The tutor says what the graph shows, and says whether the guess matched in plain words only here.)

**Points 1 to 3** stay as built (the recipe example, the equivalence principle, where Einstein started), with one change to point 1: after "...down to the last decimal place," add the worked number: "At 1g, √(2 × 2 ÷ 9.8) = 0.64 seconds, and the same formula gives the same 0.64 seconds for both cabins."

**New point 4: "A word of care."**
"What you saw is a calculation. We used one formula for both cabins, so it was certain that they would agree: the agreement was built in, and nothing here tested it. Whether a real ball in a real rocket and a real ball on a real planet move the same way is a question for real experiments. The "Want to know more?" links at the top point to some. *(Wording of the last sentence depends on the links found; see section 2.)*"

**Closing line (replaces nothing; the old explanation ended after point 3):** "Try other accelerations in Part 2 to see the same thing: whatever you choose, the two lines lie on top of each other."

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `equivalencePrincipleExperiment.ts`:
1. `actualOutcome()` moves in from the component and returns `'sameWay'`. **Test:** it returns `'sameWay'` for several accelerations (0.5g, 1g, 2g, 5g) because the model has one formula, and the heights computed for "Cabin A" and "Cabin B" (two calls with the same inputs) are equal at ten times from 0 to the fall time.
2. `guessMarkerFor(result, choice)` returns where the white ring sits (the end of the curves: the fall time and 0 m), its place as fractions of the graph, and the box text for the choice. **Tests:** the ring's place is the same for both choices; it equals the fall time and 0 m; the text names the choice; the result is unchanged by the choice.
3. `markGuess(choice)` returns whether the guess matched the real outcome and the plain sentence for the tutor's opening block. **Tests:** `'sameWay'` matches; `'differently'` does not; neither changes the real outcome.
4. `fixedTimeScaleEndSeconds()` returns 2.1 (the longest fall, 2.02 s at 0.1g, rounded up). **Test:** every allowed acceleration (0.1g to 5g) falls within it, and the tests confirm 2.02 s at 0.1g.
5. `fallTimeWorkedNumbers()` returns the worked numbers shown in the words box and the caption (the 1g and 2g fall times, and the height 1.50 m at 0.32 s). **Tests:** 0.64 s, 0.45 s and 1.50 m to two decimals.

---

## 11. Specification changes (only after approval, §28.2)

`01-equivalence-principle.md`: Learner Controls (the acceleration moves to Part 2; Part 1 uses 1g), Prediction Activity (the question gains the fixed value), Display and Results Display (labels on the cabins, a marker on the graph, no "You predicted / What actually happened" pair, the closing sentence moves to the tutor), AI Tutor Behavior (the compare step no longer states the outcome; the explanation marks the guess and adds a point 4), a new "Audit update" section, the source table, and the layout (four Parts, Start over).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction 1a, 1b, 1c:** the car picture without the answer-giving claim; Part 1 at 1g; the changed "Your job"? [yes]
2. **Introduction 1d to 1g:** the "Your guess" paragraph, the new "What 1g means" paragraph, the "Some new words" line and the two added assumptions? [yes]
3. **Links** (section 2): to be filled in from the pages that were read. [pending]
4. **Words box:** the entries, the two formulas and the worked examples? [yes]
5. **Part leads and the note beside the acceleration buttons:** approve? [yes]
6. **The marker:** a white ring at the end of the lines, the same for either guess, with the box texts? [yes]
7. **Drawing A on a fixed 0 to 2.1 s scale** (so different accelerations look different), with the 1g curve kept in grey? Part 1's graph keeps its stretching scale. [yes]
8. **Results:** the tag, the removed pair, the closing sentence moved to the tutor, the "Where this comes from" line? [yes]
9. **Tutor:** the three prompts (the compare step no longer states the outcome), the opening block that marks the guess, point 4 "A word of care", the closing line? [yes]
10. **Point 1's old sentence** "...because the calculation itself never had a way to know which cabin it was supposed to be describing" stays, now followed by point 4? [yes]
11. **Source reading:** the link pages were read through a helper that reported their content; I did not read them myself unless noted in section 2. Accept, or open them first? [accept, flagged in the specification]
