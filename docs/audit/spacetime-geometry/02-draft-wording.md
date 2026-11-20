# Draft wording: Spacetime Geometry Experiment 2 (Light Cones: Which Events Can Affect Which)
Date: 2026-11-19 | Status: BUILT (2026-11-19; physics, interface, tests and a browser check; see the specification's Audit Update). The owner approved the draft on its defaults ("I will go with your recommendation") and then said "wording approved" for the built page (2026-11-19), a blanket approval in chat; no line-by-line reading is recorded. Changes made in the build are listed at the end of this file.

Gaps chosen (the owner, 2026-11-19, "all defaults" to the ten questions of the gap report, with one addition: "make the intro detailed and explanatory, add pictures if necessary to explain the concept better"): fix N1 to N14; Part 1 fixed on event B = 5 s and 3 light-seconds and a +0.3c passing observer, with all five events and five speeds in Part 2; a white ring in the region each answer names; the check-up; Results stop saying "Your prediction was ..."; the tutor marks the guess; links searched; the speed arrow's length follows the speed in Part 2; Learning Objective 3 corrected in the Audit Update.

**One tension to settle (question 1 below).** Default 3 moved the speed-needed test out of the introduction so that the prediction stays a real guess (§12). The addition asks for a fuller, picture-led introduction. This draft does both: it teaches **what a light cone is and how it is built** (three pictures) and the shout across a field with its three cases, but it never applies the test to light, never draws B, never shows which region means which answer, and never gives the "speed needed" rule. The tutor still does that.

## Layout
- **Above Part 1 (no heading):** the introduction (with three pictures, Figures A to C), "Want to know more?" (four links, one recorded gap), a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the prediction, Run (B = 5 s and 3 ls, +0.3c observer), the diagram (Picture 1) with its flash, and after the run the regions and a white YOUR GUESS ring.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** the five events, the five speeds, "Run your event", Picture 2 (the diagram for the learner's own choices, in the Part 2 colour, with the observer's arrow length following the speed), "Runs so far".
- **Part 3 (teal), "The results":** the Part 1 table, the check-up, "What this table tells us", and the guess beside the lab row with a tag.
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run, and while a run plays. A Part 2 change never touches Part 1, Part 3 or the tutor.
- **Colours:** white only for the learner's guess; the Part 2 pink (`#be185d`) only for the learner's own choices; the existing blue (O), orange (B), purple (observer), yellow (flash), teal (inside), rose (outside) stay.

---

## 1. Introduction

Heading: "Light Cones: Which Events Can Affect Which" (the "Experiment 2 —" prefix goes, N5).

**1a. "The question"** (kept word for word from the approved wording, except that it now ends by pointing at Figure A):
"Imagine you shout across a field. Sound travels about 340 meters every second. A friend stands 1,000 meters away. Two seconds after your shout, the sound has covered only 680 meters, so it has not reached your friend yet. Whatever your friend does at that moment, your shout cannot have caused it. The news simply has not arrived. So whether one thing can affect another depends on whether a signal can cover the distance in the time available. This experiment asks the same question about light, the fastest signal there is: for two events, could anything that starts at the first reach the second in time? And would a moving observer, who measures a different time and a different distance, give a different answer? Figure A draws the shout so that you can see it."

**1b. NEW, "A closer look at the shout" (picture: Figure A).**
"Look at Figure A. It is a picture of the shout, with distance across the page and time going up. You shout at the bottom left, at time 0. The sound spreads out along the sloping line: after 1 second it is 340 meters away, after 2 seconds 680 meters, after 3 seconds 1,020 meters. Three friends are marked, and each is at a different distance, but we look at all of them at the same moment, 2 seconds after the shout.
The friend at 340 meters has already heard you. The sound went past that spot a whole second ago, so what you shouted could have changed what they did. The friend at 680 meters is hearing you at exactly that moment. The friend at 1,000 meters has heard nothing yet. So at that moment there are three kinds of friend: those the news has already reached, one it is reaching right now, and those it has not reached.
Notice what the sloping line does. It is the dividing line. Friends on one side of it are inside what your shout could have affected by then; friends on the other side are outside. Keep that idea of a dividing line: it is the whole of this experiment."

**Figure A (a drawing):** a graph, distance in meters (0 to 1,200) across, time in seconds (0 to 3) up. A grey dot at (0, 0) labelled "You shout (time 0)". A sloping line from it, labelled "The sound: 340 meters every second", with small marks at 1 s (340 m), 2 s (680 m), 3 s (1,020 m). A faint horizontal line at 2 s labelled "2 seconds after the shout". Three dots on that line labelled "Friend at 340 m: sound already passed", "Friend at 680 m: sound arriving right now", "Friend at 1,000 m: sound not here yet".

**1c. NEW, "How a flash of light becomes a cone" (pictures: Figures B and C).**
"Now replace the shout with a flash of light, the fastest signal there is. Light travels 1 light-second every second. A light-second is the distance light travels in one second, about 300,000 kilometers, so the numbers stay small: after 2 seconds the flash is 2 light-seconds from where it started, after 3 seconds, 3.
Space has three directions, but to keep the drawings simple we look along one line only, left and right. A flash that goes off at one spot spreads both ways along the line. Figure B shows four snapshots of the same flash, one for each second. The flash starts in the middle, and then two bright fronts move away from it, one to the left and one to the right, each 1 light-second farther every second.
Figure C does something clever with those snapshots. It stacks them up, with the earliest at the bottom and the later ones above, so that time runs upward, like the shout picture. The two moving fronts then trace out two straight lines that spread apart like the sides of a letter V. These two lines are the **edges** of a **light cone**. The flash only ever reaches events on the edge or inside the V on its way up. The picture is called a cone because in real space, with three directions, the flash is a growing ball, and stacking up the balls would make an ice-cream cone shape. We draw only one direction, so we see a flat V.
The same idea works backwards in time. The lower half of the picture, below the starting point, is the **past half** of the cone: the places and moments from which a flash could have arrived at the start. The upper half is the **future half**: the places and moments the flash can get to later. Every event has its own light cone, even if no flash ever goes off. The cone is drawn from what a flash would do."
(Not said here: what being inside, on the edge or outside means for whether something can get there. That is the prediction.)

**Figure B (a drawing):** four horizontal strips, one under another, headed "0 s", "1 s", "2 s", "3 s". Each is a line marked in light-seconds from −3 to +3. At 0 s a yellow dot in the middle labelled "the flash goes off". At 1 s two yellow dots at −1 and +1. At 2 s at −2 and +2. At 3 s at −3 and +3. Faint arrows from the middle show each front moving out. Title: "Four snapshots of one flash".

**Figure C (a drawing):** the same four snapshots stacked into a graph: position in light-seconds across (−4 to +4), time in seconds up (−3 to +3). Yellow dots at each second joined by two yellow straight lines, labelled "Edge of the cone: the front of the flash moving right" and "... moving left". A blue dot at the middle, labelled "O: where and when the flash goes off". The upper half is labelled "Future half: where the flash can get to later" and the lower half "Past half: where a flash could have come from". A caption-style note on the picture: "Positions inside the V, on its edges and outside it". No shading, no teal or rose, no event B, no meaning attached to the three positions.

**1d. "Some words we will use"** (rewritten; every term still defined before it is first needed, §15):
"An **event** is something that happens at one place at one moment: a shout, a flash of light going off, a clock ticking. A **signal** is anything that carries an effect from one place to another: a shout, a flash of light, a spaceship. We measure distance in **light-seconds**. The **light cone** of an event is the set of all the events that a flash of light from it could reach. Speeds are given as a fraction of **c**, the speed of light, so 0.5c is half that speed. The "Words and formulas" box below has the rest, with a short plain meaning each."
(The words "reachable", "light only", "unreachable", "timelike", "lightlike", "spacelike" are not in the introduction; the box lists them but shows them only after the run, §12.)

**1e. "What happens"** (replaces "Event O is 'here, now'...", with the new fixed Part 1):
"Event O is "here, now": you, in the lab, at time 0. Event B is another event, 5 seconds later and 3 light-seconds away to the right. In Part 1 you predict whether anything could get from O to B in time. Then you press Run. A flash of light leaves O and spreads out in both directions, and you watch whether its front gets to B's place before B happens, exactly when B happens, or too late. When the run ends, the drawing shows the edges of the light cone and shades the regions it makes. A passing observer, who moves past the lab at 0.3c in the same direction as B lies, then measures the same two events with their own ruler and clock, and you see their numbers beside the lab's. In Part 2 you choose the event B and the observer's speed yourself."

**1f. "Your job"** (old: "Choose event B and the passing observer's speed. Then you will predict whether anything could get from O to B, and run the experiment to see."). New:
"Predict whether anything that never goes faster than light could get from O to B in time to be there when B happens, then press Run and watch. Guesses are not scored. Then try other events and speeds in Part 2, and talk it over with the tutor."

**1g. NEW, "Your guess and the real pictures."**
"Your guess never changes the real pictures, the table or the numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the diagram in white, as a ring in the region your answer names, with a box labelled YOUR GUESS. It is shown again beside the results. In Part 2 the event and speed you choose do change the drawings, and the marks they move are in the Part 2 colour."

**1h. "What we assume"** (kept): "Space is flat, with no gravity. Every speed stays steady, and everything moves along one line. Speeds are given as a fraction of c, the speed of light. Nothing can travel faster than light."

**1i. NEW, "Some new words" line:** "The "Words and formulas" box below has each one, with a short plain meaning: event, signal, light-second, c, light cone, edge of the cone, past half, future half, time between, distance between, speed needed, time² − distance², reachable, light only, unreachable, timelike, lightlike, spacelike."

---

## 2. "Want to know more?" (opens in a new tab)
Checked 2026-11-19. Links 1 and 4 were read at Spacetime Geometry 1 through a helper; links 2 and 3 were read by a helper on 2026-11-19. None was read in full by the agent.
1. **Minkowski, "Space and Time" (1908), Saha's translation, Wikisource** (`https://en.wikisource.org/wiki/Space_and_Time_(Saha)`) — the lecture that first drew time and space together; its pictures of "light cones" are the idea behind this page.
2. **John D. Norton, "Spacetime", University of Pittsburgh course "Einstein for Everyone"** (`https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime/index.html`) — a plain, picture-and-animation chapter for non-specialists. It builds a light cone from a flash of light, explains the past half, the future half and "elsewhere", and which events can be connected by signals.
3. **NASA Glenn, "Speed of Sound Interactive" (Beginners Guide to Aeronautics)** (`https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/speed-of-sound-interactive/`) — what the speed of sound is and why it depends on the air; it gives about 1,100 feet per second at sea level on a standard day (a little under 340 meters per second).
4. **NIST, "The Meter"** (`https://www.nist.gov/si-redefinition/meter`) — why a light-second is an exact distance.
**Recorded gap (§29 rule 3(c)):** no plain page from NASA, ESA or a similar official body on the light cone itself was found on 2026-11-19 (searched: "light cone spacetime" with NASA, ESA, CERN and Einstein Online). The nearest is link 2, a university course for non-specialists, which is not an official agency page. Candidates found and not linked: the UNLV course page on light cones (`physics.unlv.edu/~jeffery/...`: a single diagram with 12 notes that assumes terms such as "world line" and "simultaneity", so not a plain page) and Wikipedia (not an official source). The page does not suggest a source it does not have.

---

## 3. "Words and formulas" (collapsed)
Each entry is plain and short. Entries marked * are shown only after the run (§12).
- **Event:** something that happens at one place at one moment.
- **Signal:** anything that carries an effect from one place to another: a shout, a flash of light, a spaceship.
- **Light-second:** the distance light travels in one second, about 300,000 kilometers.
- **c:** the speed of light. 0.5c is half that speed.
- **Light cone:** all the events a flash of light from one event could reach.
- **Edge of the cone:** the path of the front of the flash, drawn as two yellow lines.
- **Past half and future half:** the lower half is where a flash could have come from; the upper half is where it can get to later.
- **Time between / distance between:** how much time, and how far apart in space, two events are, as one observer measures them.
- **Speed needed:** the distance divided by the time. For example, 3 light-seconds in 5 seconds needs 3 ÷ 5 = 0.6 of the speed of light.*
- **time² − distance²:** multiply the time by itself, multiply the distance by itself, subtract. For 5 s and 3 ls: 25 − 9 = 16.*
- **Reachable, light only, unreachable:** the three cases, named in the results table.*
- **Timelike, lightlike, spacelike:** the physicists' words for the same three cases.*

---

## 4. Part leads ("What we are about to do")
- **Part 1:** "First you guess whether anything could get from O to B in time. Then you press Run. A flash of light leaves O, and when the run ends the diagram shows the edges of the light cone and your guess drawn on it in white." (No answers.)
- **Part 2:** "Now you choose the event B and the passing observer's speed, and run again. These choices change the drawings. Your guess does not."
- **Part 3:** "Here are the numbers from the Part 1 run, with your guess beside them. Nothing in this Part changes with your guess or with the settings you choose in Part 2."
- **Part 4:** "Talk through what you saw. The tutor points to your white guess ring, then explains."

---

## 5. Part 1: prediction and diagram (Picture 1)

**Prediction question** (as today, with B fixed): "Event O is "here, now". Event B happens 5 seconds later, 3 light-seconds to the right. Could something that starts at O, and never goes faster than light, arrive at B in time to be there when B happens?" Choices unchanged (N7 of the answers): "Yes, and it could be slower than light" / "Yes, but only light itself could do it" / "No, not even light could". After Run, the guess is locked, with "Your prediction is locked while you try other events and speeds. To change it, press Start over."

**Setup note, beside the controls in Part 2:** "Your guess does not change the drawings or the tables. These settings do. (While every setting is on the Part 1 values the drawing looks the same as in Part 1, so change one to see it move.)"

**The white YOUR GUESS ring (new).** Drawn only when the run has ended and the regions are drawn (not at setup, not during the flash). One white ring, heavy outline, with a YOUR GUESS box joined to it by a line, in the region the answer names: inside the cone for "slower", on the right-hand yellow edge for "light only", outside the cone for "no". It is a marker only, not a point of the experiment, and never at B. Positions (lab seconds, light-seconds), chosen away from B and the labels, to be checked against the axes in the build: inside (−1, 4); on the left edge (−2.5, 2.5); outside (−4, 2). The box text: "YOUR GUESS: slower than light could" / "only light could" / "not even light could".

**"Where the real picture comes from."** "Calculated here, not measured: the flash spreads at exactly 1 light-second per second, so the edges of the cone are worked out from that; the times and distances for the lab and for the passing observer come from the Lorentz transformation of "Moving frames" in the first chapter. No instrument measured them and nothing here is imagined. The white ring is only your guess, placed in the region your answer names."

**Caption, "How to read this diagram"** (the regions bullet and the final "which region" sentence appear only after the run, C7):
*Always:*
- **Position runs left to right and time runs up**, as in Figure C. An event higher up happens later.
- **The grey horizontal line** is the lab's ruler at time 0, in light-seconds from the middle (a mark that says 2 is 2 light-seconds, about 600,000 kilometers, from the middle; marks to the left are negative).
- **The grey vertical line** is the lab itself, which stays in the middle as time goes by. Its numbers are seconds on the lab's clock.
- **Blue square (O):** "here, now", at the middle of the ruler, at time 0.
- **Orange square (B):** the other event. Its height is when it happens and its place along the ruler is how far away it is. The two dashed orange lines show both numbers.
- **Purple square (the passing observer):** at the top right. The arrow shows which way they move. In this drawing they are only shown, not moved.
- **Yellow lines (the flash):** appear when you press Run. The flash leaves O both ways at 1 light-second every second, so each yellow line climbs one light-second across for every second up. While it plays, a dashed line marks the lab's clock and the yellow dots are the front of the flash. B appears when the lab's clock reaches its time.
*After the run:*
- **The shaded regions:** the yellow lines are now the edges of the light cone. Teal is inside the cone, rose is outside it, and the dimmed grey triangle below the ruler is the past half. The key at the top says the same. **Defining what each region means for the question is left to you and the tutor.** [Owner: the pre-run caption said "teal is events that something slower than light could reach, rose is events that nothing could reach"; this draft removes those meanings from the picture's caption and key until the tutor, N7. If you prefer the meanings in the key after the run, say so.]
- **The white ring and the YOUR GUESS box:** your guess, placed in the region your answer names. It is only a marker. It does not move the real picture.
*A worked moment (real numbers).* B is 5 seconds after O and 3 light-seconds away. In 5 seconds the front of the flash gets 5 light-seconds from O. B's place is 3 light-seconds from O. So when B happens, the front of the flash is already 2 light-seconds past B's place.
*What to look for* (each shown only once its feature is drawn):
1. **Look at** the yellow dot at the front of the flash as the lab's clock reaches 5 seconds, and the orange square B. **What it means:** the front is 5 light-seconds out, 2 light-seconds past B's place, when B happens. **Why it matters:** it tells you whether the flash, the fastest signal, got to B's place in time.
2. **Look at** which region B sits in once the run ends, and at the white ring. **What it means:** B lies in one of three places: inside the cone, on one of its edges, or outside it, and your ring sits in the region your answer names. **Why it matters:** it sets the answer to your question beside your guess. (Which region means which answer is for the tutor.)

---

## 6. Part 2 (Picture 2 and "Runs so far")
**Controls:** the five events (5 s, 3 ls; 5 s, −4 ls; 3 s, 3 ls; 3 s, 5 ls; 4 s, −5 ls, as today's labels) and the five speeds (−0.5c, −0.3c, 0c, +0.3c, +0.5c), with "Run your event". **Drawn:** the diagram as in Part 1 for the learner's choices, framed and labelled in the Part 2 colour ("your event and speed"), with the purple arrow's length following the speed (N8) and its caption saying so. The white ring is not redrawn. **"Runs so far":** one line per run, e.g. "Event 3 s and 3 ls, observer +0.5c: lab: light only · passing observer: light only".
**"Where the real picture comes from":** as in Part 1, for the event and speed you chose.
**Caption:** as Part 1; the observer's arrow is as long as the speed (no arrow at 0c). *Worked moment:* B = 3 s and 5 ls, observer +0.3c: the lab finds 3.00 s and 5.00 ls, and 3 × 3 − 5 × 5 = 9 − 25 = −16. The observer finds 1.57 s and 4.30 ls, and 1.57² − 4.30² ≈ −16.00 (rounding). **Look at** the case word for each observer in each run. **What it means:** the times and distances change with the event and the speed, and the case stays what it was. **Why it matters:** it lets you see whether what you found in Part 1 still holds for other events and speeds. (The tutor explains why.)

---

## 7. Results (Part 3)
**The Part 1 table** as today (Observer | Time from O to B | Distance | time² − distance² | Speed needed | Which case), with the line "Your prediction was ..." removed (N12). A small white "your guess" tag on the lab row's "Which case" cell and the line "Your guess is drawn on the diagram as the white ring." Under it: **"Where this comes from:** calculated here from the speed of light and the Lorentz transformation. Nothing here changes with your guess or with the settings you choose in Part 2." The one-line key under the table stays ("reachable" means B is inside the light cone, "light only" means B is on its edge, "unreachable" means B is outside it), shown after the run.

**Check-up** (one short table; the page's own physics is the reference):
| What we compare | What we would expect | What was found | A plain reading |
|---|---|---|---|
| time² − distance² for the passing observer | 16.00 (the lab's own) | 16.00 | the same |
| The case for the passing observer | reachable (the lab's) | reachable | the same |
| Speed needed, passing observer | below 1, as for the lab (0.60) | 0.37 | the same side of 1 |
(Numbers from the module and tested; shown to two decimals; the reading is "the same" or "different", no invented cut-off.)

**What this table tells us.**
- **What it is:** the time, the distance and the speed that two observers each find between the same two events O and B, and the case each puts B in.
- **What it means with the real numbers:** the lab finds 5.00 s and 3.00 ls, the passing observer 4.30 s and 1.57 ls. Those differ. But 5² − 3² = 16.00 and 4.30² − 1.57² ≈ 16.00, and the speed needed is 0.60 for the lab and 0.37 for the passing observer: different numbers, both below 1.
- **Why it matters:** it shows that two observers can disagree about the time, the distance and the speed needed, and still put B in the same case. Why they agree, and what that says about cause and effect, is left to the tutor and to later experiments.
- **How sure the number is:** the figures come from a tested calculation (the Lorentz transformation of "Moving frames"). No instrument measured them. 4.30 and 1.57 are rounded; the exact interval is 16.00.
No table follows the learner's settings (default B3). Reason, recorded in the specification: the settings only move the same invariant, and "Runs so far" already shows the cases.

---

## 8. Tutor (Part 4)
Three questions then the explanation. Changes:
- **Observe:** "Look at the diagram. In the lab, did the flash from O get to B's place before B happened, exactly when B happened, or after?" (unchanged)
- **Compare:** "You predicted that [clause]. That is the white ring in the [region]. In the table, the lab's number is 16.00 and the passing observer's number is 16.00. The "Which case" column says "reachable" for the lab. What do you notice when you compare these with your guess?" (the clause and the region follow the learner's pick; the numbers come from the module)
- **Conceptual:** unchanged.
- **Explanation:** the seven points stay as approved, with these changes only:
  - **New first line, "Your guess, marked first (no score)":** "You guessed [that something slower than light could / that only light could / that not even light could]. B was [inside the cone, so something slower than light could get there / on the edge, so only light could / outside the cone, so nothing could]. In your run, B was [reachable]."
  - **Point 3:** "This is the number from "The Interval", time² − distance²." (not "the last experiment").
  - **Point 5:** "Relativity of Time and Motion 5, "Why can't light go faster?"" in place of "Experiment 5". The sentence "observers moving through the air do not all agree on how fast the sound goes" becomes "sound moves at a fixed speed through the air, so someone moving through the air measures a different speed for it" (a plain restatement; no source fetched, flagged). "A fast jet can overtake the sound" is kept (general knowledge).
  - **Speed of sound:** "about 340 meters per second", unchanged; NASA Glenn gives "about 1,100 feet per second" at sea level on a standard day (a little under 340 m/s), read 2026-11-19 through a helper.

---

## 9. Physics module (new, with tests; the approved model is unchanged)
In `lightCones.ts`:
- `PART1_EVENT_INDEX` = 0 and `PART1_PASSING_SPEED` = 0.3 (the fixed Part 1 values).
- `answerRegion(guess)` returns the case each answer names (`'reachable' | 'light-only' | 'unreachable'`); refuses an unknown guess.
- `guessMarkerPosition(guess)` returns the marker's (time, position) in the lab's units for each answer (the positions above).
- `checkUpRows(result)` returns for the passing observer the expected value (the lab's) and the found value for time² − distance², for the case, and for the side of 1 of "speed needed", each with `'the same'` or `'different'` (within 1e-9; no invented cut-off).
- `runLightConeExperiment` is unchanged; Part 1 calls it with the first preset and 0.3.

Tests (in `lightCones.test.ts`):
1. `answerRegion` maps the three answers to reachable, light-only and unreachable, and refuses an unknown guess.
2. Each marker position lies in the region its answer names (checked with `classifyEventPair` against event O), and none lies on B's position for any preset.
3. The real result at the Part 1 values is the same for every guess (5 s, 3 ls; 16.00; reachable).
4. `checkUpRows` reads "the same" for all three rows at every preset event and speed (the interval squared, the case and the side of 1 are invariant).
5. The Part 1 values: lab 5.00 s, 3.00 ls, 16.00, 0.60; passing 4.30 s, 1.57 ls, 16.00, 0.37, reachable.
6. Existing 13 tests untouched and still pass.

---

## 10. Specification changes (only after approval, §28.2)
`02-light-cones.md`: Learner Controls (Part 1 fixed, controls in Part 2), Prediction Activity (the fixed B), Display (Figures A to C, the white ring, the caption split), Results Display (check-up, note, tag), AI Tutor Behavior (the guess marked, the point changes), the layout (four Parts, Start over), Learning Objective 3 corrected to "the sign of the interval squared", a new "Audit update" section, a source table (Minkowski 1908, Norton, NASA Glenn, NIST, each read 2026-11-19 through a helper; "no plain official page found" for the light cone, with the UNLV and Wikipedia candidates and why they are not linked), and the open items.

---

## 11. Questions for the owner (suggested answers in brackets)
1. **How much of the concept goes before the prediction?** This draft teaches the cone (Figures A to C) and the three cases of the shout, but not the test for light and not which region means which answer. Is that the right line? [yes; if you want the regions' meanings in the introduction too, the prediction becomes close to arithmetic]
2. **The three pictures (Figures A to C):** as described, drawn by us, labelled "Figure A/B/C" with captions? [yes]
3. **Introduction 1a to 1i:** approve, line by line? [yes]
4. **Links 1 to 4 and the recorded gap:** link Norton (a university course, not an official agency page) as the nearest to a plain page on the cone? [yes]
5. **Words box:** the entries, with the speed, the formula and the three case names held until after the run? [yes]
6. **Leads, the note beside Part 2's controls, the white ring's wording and positions:** approve? [yes; the positions are checked on the real axes in the build]
7. **The regions' meanings** moved out of the pre-run caption (and out of the key until the tutor)? [yes; or show them after the run]
8. **Results:** the check-up table, "What this table tells us", the tag, no "Your prediction was ..." line, no table that follows the settings? [yes]
9. **Tutor:** the guess marked first, the cross-reference fixes, the restated sound sentence (unsourced)? [yes]

---

## Changes made while building (2026-11-19, approved with "wording approved")
- **The "past half" paragraph of the introduction (1c, last paragraph)** was rewritten at the owner's request for clarity, as three short paragraphs: "The cone also reaches into the past" (the shout again: a friend 340 meters away who shouted exactly 1 second ago is heard at this very moment, 5 seconds ago was heard long ago, half a second ago is not heard yet), the past half and future half defined, and "Every event has its own light cone ... a little like a lamp that is switched off". The lamp comparison and the shout timings are the agent's own; no source was checked.
- **Pre-run caption (section 5):** the worked moment and the "What to look for" items, which give B's numbers (the flash already 2.00 light-seconds past B's place), now appear only after the run, because shown before it they gave the answer away (§12). Before the run the caption says they will appear once the run has ended.
- **Figure captions:** each of Figures A to C has a short "How to read Figure X" caption (new wording; the draft described only the drawings).
- **The bars picture** (the old results drawing, which the draft did not mention) stays in Part 3 under the table, with its approved caption bullets and two new three-part look-fors, and a second copy for the learner's own Part 2 run.
- **Tutor:** a "Your guess, marked first" paragraph ("So your guess names the region B was in" or "names a different region: B was ..., not ..."); the cross-references use "The Interval" and "Relativity of Time and Motion 5"; the sound sentence is restated.
- **Layout fixes from the browser check:** Figure A's labels and Figure C's axis label were re-laid out; the YOUR GUESS box sits next to its ring for each answer (inside the cone at the upper left of the time axis, and left of the cone for the edge and outside answers).

