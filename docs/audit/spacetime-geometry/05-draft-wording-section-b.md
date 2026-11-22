# Draft wording: Spacetime Geometry Experiment 5, Section B (A collision, seen by two observers)
Date: 2026-11-21 | Status: **DRAFT for the owner's approval (CLAUDE.md §28.1). Nothing is built.** Written after the owner said "start with Section B". It applies the ten defaults the owner already accepted in `05-gap-report.md` ("all defaults") and follows the layout of Section A (`05-draft-wording.md`). Section C gets its own draft after B is built and approved.

**What stays and what is new.** Wording approved on 2026-10-15 stays unless a line below says it changes. **NEW** or **CHANGED** lines are for approval; unmarked lines are the approved text, reused.

**What was read.** `EnergyMomentumCollision.tsx` in full (the setup, the diagram's text, the introduction, the controls, the prediction, the results tables), `runCollisionExperiment` in `energyMomentum.ts`, the tutor's step names and prompts. The collision diagram's drawing code (lines 124 to 400) and the tutor's explanation paragraphs were skimmed, not re-read in full.

---

## Layout (Section B)

Same pattern as Section A.

- **Above Part 1 (no Part heading):** the section heading, a back link to Section A and the skip link to Section C, the introduction, "Some new words", the "Want to know more?" list. The words box at the top of the page already holds Section B's entries once B opens.
- **Part 1 (amber `#d97706`), "Predict, then watch":** the fixed case (**two lumps at 0.6c each, passing observer at +0.3c**), the prediction, Run, **Start over**, Picture 1 (the lab's view) and, once the lab's view has played, Picture 2 (the passing observer's view), with the white guess on the mass bars.
- **Part 2 (pink `#be185d`), "Now try it yourself", after the first Run finishes:** the speed of each lump and the passing observer's speed (today's controls), "Run these settings", Drawing A (lab) and Drawing B (passing observer) for the learner's own choice.
- **Part 3 (teal `#0f766e`), "The results":** the six tables for Part 1's run, a check-up, a "What this table tells us" note under each table, the guess shown beside the results with a tag.
- **Part 4 (blue `#0066cc`), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run, and while a run plays. It clears the guess, the runs, the results and the tutor of Section B. Once Run is pressed the guess is locked. The "Change prediction by clicking another answer" behaviour goes (today a click returns the run to idle).
- **Today's change that matters most:** the speeds are currently chosen **before** predicting, and changing any control returns the run to idle. In the new layout Part 1 is fixed, the controls move to Part 2, and a Part 2 run never changes Part 1's pictures or tables.
- **Names:** "Part 1" and "Part 2" inside this section's text become "Section A" and "Section B" where they mean the sections (`If you skipped Part 1` becomes `If you skipped Section A`; "In Part 1 we followed one particle" becomes "In Section A ..."; "the rule is the one from Part 1" becomes "from Section A").
- **Completion marks:** unchanged. `onExplained` still fires when the tutor reaches its explanation.

---

## 1. Introduction

**1a. Heading.** "Section B: A collision, seen by two observers" stays. The page title above (`Experiment 5 — ...`) is the owner's own change of today. Note: the Section A draft said the "Experiment 5 —" prefix would go; the owner reversed that. No action here.

**1b. "The question" (CHANGED, §12).** Today's last two sentences: "...what is the mass of the single lump that results: is it just the two masses added together? You will be asked to predict the last one." The phrase "is it just the two masses added together" points at the answer (the prediction is "less than, exactly or more than 2m"). Draft:

> **The question.** In Section A we followed one particle and saw how its energy and momentum look to different observers. Now we put these ideas to the test with a collision. Two identical lumps of clay meet head-on and stick together, so there are two pieces before the collision and one piece after it. Three questions come up. Do two observers who move differently agree that the total energy and the total momentum stay the same through the collision? Does the everyday rule for momentum, mass × speed, still work when a moving observer measures the speeds? And what is the mass of the single lump that results? You will be asked to predict the last one.

**1c. "Why a collision" (CHANGED, longer, owner's request of 2026-11-22; plain terms and daily-life examples, §15).** The opening sentence stays; four bullets follow. It does not say whether the rule holds, so nothing is revealed (§12). The 2 kg / 3 m/s numbers are illustrative only and do not come from the physics module. Draft:

> **Why a collision.** So far we looked at one particle. Now two particles meet. This is how momentum was first understood, and it is where the everyday rule *mass × speed* is put to the test. Here is what that means.
> - **One particle alone never shows the whole story.** Nothing happens to it, so we can only describe how it moves. To see what momentum *does*, two things have to meet.
> - **Momentum is how hard something is to stop.** A tennis ball rolling toward you is easy to stop with your foot. A bowling ball rolling at the same speed is much harder. A tennis ball flying very fast is also harder to stop than a slow one. So two things matter: how heavy it is and how fast it moves. The everyday rule puts them together: *momentum = mass × speed*. For example, a 2 kg bowling ball moving at 3 m/s has momentum 2 × 3 = 6. A 0.1 kg ball moving at 3 m/s has momentum 0.1 × 3 = 0.3, so the heavy ball carries 20 times more.
> - **A collision is where momentum shows itself.** Think of a full shopping cart bumping an empty one: the empty cart is shoved away and the full cart slows only a little. Think of a cue ball hitting another billiard ball: the cue ball slows or stops and the other ball rolls away, as if the push were handed over. Think of two skaters on ice, one pushing the other: both glide apart, and the lighter skater moves away faster. Think of a heavy truck meeting a small car: the car comes off worse. In each case, what one object loses the other seems to gain, so we can follow the push as it passes between them.
> - **Why it is a test.** The rule *mass × speed* was found by watching slow, everyday things such as carts, billiard balls and cars. We do not yet know that it holds everywhere. So we count the total momentum before the collision and after it, and check what happens. It is like counting your money before and after a purchase, to see whether the totals agree.

**1d. "Some new words" (CHANGED, §12).** Collision, Conserved, System, Internal energy stay as approved. **The mass of a system** keeps the formula but loses the closing line "*What it does not mean:* it is not simply the masses of the pieces added together", which names the prediction's answer. That line moves to the tutor (section 7) and to Part 3's note. The example (energy 5, momentum × c 3, so M = √16 = 4) stays.

**1e. The billiard-ball example (unchanged).** Two equal 1-kilogram balls at 2 meters per second each way: total momentum 0 before and after.

**1f. "What happens" (NEW, more detailed; same style as Section A's).**

> **What happens.** Two identical lumps of clay move toward each other along a straight line, meet in the lab, and stick together into one lump. The page shows this twice, in order.
> - **Before you press Run.** You see the setup: two lumps, each with an arrow for its way and speed, and the numbers the lab measures for each.
> - **Picture 1, the lab's view.** The lumps slide together and a yellow ring flashes where they meet. Afterward there is one lump, with its own numbers. Beside it, two short bars let you compare lengths directly: the grey bar is the two masses added, 2m, and the blue bar is the mass M of the lump.
> - **Picture 2, a passing observer's view.** The same collision is replayed as a second person measures it, who moves along the same line. Every number is theirs, so it differs from the lab's.
> - **Then it is your turn.** In Part 2 you choose other speeds and run it again. Part 3 gives the numbers, and Part 4 is the tutor.

**1g. "Your job" (CHANGED; superseded in part on 2026-11-22: Section B now has two predictions, see "Update of 2026-11-22" at the end).** Replaces today's "Choose how fast the lumps move and how fast the passing observer moves. Then predict ...":

> **Your job.** Predict first. Part 1 uses two lumps that each move at 0.6c in the lab, and a passing observer who moves at 0.3c to the right. Choose one of the three answers, then press Run. You are not graded. **Your prediction never changes the pictures or the tables.** They come from the physics. Your guess is drawn on the mass bars in white, with a box labelled YOUR GUESS, and it is shown again beside the results. After your first run, Part 2 lets you choose other speeds. Those choices *do* change the drawings, but not your prediction. If you want to change your prediction, press Start over.

**1h. "What we assume" (unchanged).**

---

## 2. The prediction (Part 1)

**2a. The question text (CHANGED).** Today it says the lumps move at "{speed}c", a learner's choice. Draft: "Two identical lumps of clay, each of mass *m* (that is, *m* measured when the lump is at rest), move toward each other at 0.6c in the lab, collide head-on and stick together. Energy and momentum are not lost: nothing escapes. What is the mass of the single lump that results, compared with 2*m*, the two masses added?"

**2b. The three answers (unchanged; a second prediction was added on 2026-11-22, see the end of this file).** (a) Less than 2m. (b) Exactly 2m. (c) More than 2m.

**2c. Under the buttons.** Before Run: "Your prediction: (a). You can still change it until you press Run." After Run: "Your prediction is locked while you try other settings. To change it, press Start over." "Choose a prediction above to run the experiment." stays. "This is not graded" is covered by 1g.

---

## 3. The Part leads (learner-facing wording, §14)

**Part 1, "Predict, then watch" (amber).** "What we are about to do: you will predict how the mass of the lump that two clay lumps make compares with the two masses added, then press Run and watch the collision from two points of view. Your guess is drawn on the real mass bars in white. It never changes them."

**Part 2, "Now try it yourself" (pink), after the first Run finishes.** "What we are about to do: choose a different speed for the lumps, or a different speed for the passing observer, and run it again. These choices change the drawings. Your prediction does not."

**Part 3, "The results" (teal).** "What we are about to do: read the numbers from Part 1's run. The tables never change with your prediction or with the settings you tried in Part 2. Your own guess is shown beside them, as you chose it."

**Part 4, "The tutor" (blue).** "What we are about to do: the tutor asks you three questions, one at a time, about what you saw, then gives its explanation."

**Note beside Part 2's controls.** "Your prediction does not change the drawings or the tables. These settings change Drawing A and Drawing B below, and they do not change Part 3's tables, which are for Part 1's run."

---

## 4. The guess marker (Rule A; drawn in Picture 1, beside the two mass bars)

The prediction is about the lump's mass compared with 2m, so it is drawn where that comparison lives: the grey **2m** bar and the blue **M** bar that appear beside the lump once the lab's view finishes. Each answer has no size of its own, so each is a **marker** (item 3).

| Answer | What is drawn in white | Label in the white box |
|---|---|---|
| (a) Less than 2m | A white tick **left of the end of the grey 2m bar** | "YOUR GUESS: less than 2m" |
| (b) Exactly 2m | A white tick **at the end of the grey 2m bar** | "YOUR GUESS: exactly 2m" |
| (c) More than 2m | A white tick **right of the end of the grey 2m bar** | "YOUR GUESS: more than 2m" |

- Each tick is thick and joined by a line to a large YOUR GUESS box with large text (the owner's pattern). It shows the guess only, never "right", "wrong" or "matched".
- The tick is drawn only once the two bars are drawn (the lab's view has finished). Picture 2 carries no guess.
- **Where the tick for (a) and (c) sits** is not a number the learner chose, so it is only a marker. Draft: a fixed distance (about a quarter of the 2m bar) either side of 2m. **Decision 1 below:** a (c) tick must not land on the real M, or it would look like a match; the fixed distance is chosen so it does not for the presets in Part 2.
- The caption says: "The white tick is only a marker for the answer you chose. It has no size of its own, and it does not change either bar."
- All numbers (the real 2m and M, and the marker's positions) come from the physics module (section 8).

---

## 5. Captions (one under each picture)

Today there is one long caption under the single diagram. It becomes one caption per picture, each starting with "How to read this diagram", in short sections.

**Under Picture 1 (the lab's view)**
- *Before Run:* what the two sky-blue circles, the arrows (a longer arrow is a faster lump), the dashed line where they meet, and the hollow purple circle (the passing observer, not yet used) are. The numbers under each lump: speed, energy, momentum × c, with a minus sign meaning "to the left". Units: speed is a fraction of c, energy is in rest energies of one lump, momentum × c is in the same unit.
- *Each look-for item in three parts (Look at / What it means / Why it matters), shown only once its feature is drawn.* Draft items:
  1. **Look at** the two numbers under each lump before the collision. **What it means:** at 0.6c each lump has energy 1.25 and momentum × c 0.75, one pointing right (+0.75) and one left (−0.75). **Why it matters:** these are the totals the experiment asks whether the collision keeps.
  2. **Look at** the single lump labelled 1+2 after the collision. **What it means:** it is at rest in the lab, with energy 2.50 and momentum × c 0.00. **Why it matters:** the energy is the total from before, so energy was kept.
  3. **Look at** the grey bar (2m) and the blue bar (M). **What it means:** they are two lengths for the same lump: the two masses added, and the lump's own mass. **Why it matters:** the question you predicted is the comparison of these two bars. The page does not say which is longer. Read it from the bars.
- A worked moment with numbers that are not among the choices (today's 0.5c example, kept).
- "Where the real picture comes from": **Calculated here:** every number and bar, from the rules of special relativity given in Section A. **Measured:** nothing on this page. **Imagined for the question:** the lumps and the observers.

**Under Picture 2 (the passing observer's view)**
- The purple colour means "this observer's numbers", so a learner can tell whose measurements they are reading; the same drawing scale as Picture 1 (so distances and speeds compare); the lab, with everything in it, is what moves.
- Look-for items in three parts. Draft: (1) the new numbers under each lump (the lumps may no longer have equal speeds); (2) the totals before and after in this picture on their own; (3) the lump's mass M in this picture beside the lab's. The wording gives meaning and significance and leaves the verdict to the tutor.
- Same "Where the real picture comes from" line. The white tick is not drawn here.

**Under Drawing A and Drawing B (Part 2).** Same captions, with "your settings" and a pink line beside each, as in Section A.

---

## 6. Results (Part 3)

The six tables stay (mass of the lump; total energy; total momentum × c; everyday momentum; mass of the system; sum of the separate masses), computed by the physics module for Part 1's case only.

**6a. A check-up table (NEW, near the top).** Where a real reference exists:

| What we compare | What we would expect | What was found | Reading |
|---|---|---|---|
| Total energy, lab, after minus before | 0 (the rule: energy is conserved) | difference from the table | "the same" |
| Total momentum × c, lab | 0 | difference | "the same" |
| Total energy, passing observer | 0 | difference | "the same" |
| Total momentum × c, passing observer | 0 | difference | "the same" |
| Mass of the system, lab, before and after | equal | the two values | "the same" |
| Mass of the system, passing observer, before and after | equal | the two values | "the same" |
| Mass of the system, lab and passing observer | equal | the two values | "the same" |

No invented cut-offs: "the same" or "not the same", compared by the physics module within a rounding tolerance. The check-up says nothing about the lump's mass compared with 2m (that is the prediction, the tutor's).

**6b. "What this table tells us" under each table** (§14). Each item says what it is, what it means with the real numbers, and why it matters, in plain words; a daily-life comparison where it clears up a mechanism. Draft headline items (full wording is drafted when you approve this plan):
- *Mass of the lump:* the three numbers 2.00, 2.50 and 0.50 (in m); the lump's mass is a number the lab computes from its total energy and momentum.
- *Total energy and total momentum × c:* each observer's totals before and after, and their differences; "conserved" like money moving between bank accounts.
- *Everyday momentum:* m × (sum of the speeds) before and after for the passing observer, and what it shows about the everyday rule.
- *Mass of the system and the sum of separate masses:* two different numbers; one stays and one changes.
These notes **name the numbers and why they matter** but leave the mechanism ("why does the sum of masses change") and the verdict to the tutor (§12, §13).

**6c. The guess beside the results.** A short block: "Your guess: less than 2m / exactly 2m / more than 2m. The question: what is the mass of the lump compared with 2m? Where its number is: the table 'The mass of the lump', row 'The lump's mass, M'." A small tag on that row. The guess only, never "matched".

**6d. No table for Part 2's controls** (as default 6: the controls only move the pictures).

**6e. What leaves the introduction.** The "not simply the masses added together" line (1d) is shown here, in Part 3, after the run, as a note under the system-mass table.

---

## 7. The tutor (Part 4)

Three steps, as today (observe, compare, conceptual question), then the explanation.
- **Observe** (CHANGED to name the marks): "Look at the totals in Part 3's tables. Compare the totals before and after the collision, for the lab and for the passing observer. What do you notice?"
- **Compare** (CHANGED): "Look at the white tick on Picture 1, beside the grey and blue bars. How does your guess compare with the blue bar?" Not marked here.
- **Conceptual question:** unchanged.
- **Explanation:** unchanged in its physics, with **a new paragraph that marks the guess** ("Your guess was ... : that matches / is not what was found"; **Decision 2 below**) and the line moved from the introduction ("The mass of a system is not simply the masses of the pieces added together").
- The tutor's paragraph about the everyday momentum failing keeps its numbers from the physics module.

---

## 8. Physics-module additions (Step 3, after approval; none changes existing physics)

New, tested functions in `energyMomentum.ts` (existing functions and results unchanged):
- `collisionGuessMarker(prediction, result)`: the position of the white tick on the mass bars (in units of m) for each answer; the marker never sits on the real M.
- `collisionCheckUpRows(result)`: the expected and found values and the reading ("the same") for each row of the check-up.
- `collisionAgreement(result)`: for each row of the check-up, whether the numbers agree within a tolerance.

Tests: each answer puts the tick on the right side of 2m; the marker does not coincide with M for the Part 1 case or for the Part 2 presets; energy and momentum totals agree for every preset speed pair; the system masses agree; the marker changes no real value.

---

## 9. "Want to know more?" and the "Words and formulas" box

**Links: not yet fetched.** Per §29 rule 3 and the rule on links, no link goes in until it has been fetched and read. The search for Section B is still to run. Candidates to look for:
- a plain page from an official source (NASA, CERN, Fermilab, ESA) on **conservation of momentum and energy in collisions**;
- a plain page on **how a particle accelerator uses collisions** (CERN's LHC page was already read for Section A and could be reused here for "collisions at the LHC");
- the original source for the energy rule (Einstein 1905, already read for Section A).
If no plain official page is found, §29 rule 3(c) applies (a gap row in the specification and the status entry).

**"Words and formulas" box (Section B entries).** Keep today's five (Collision, Conserved, System, Internal energy, Mass of a system). **CHANGED:** none of them names the prediction's answer, so none is withheld. **NEW entries:** "Marker: a white tick that stands for the answer you chose. It has no size of its own." and "Lump: the single piece the two clay lumps become when they stick together."

---

## 10. Decisions and notes for the owner

1. **Where the (a) and (c) ticks sit.** Default: a fixed distance either side of 2m (about a quarter of the 2m bar's length), chosen so that it never falls on the real M for any preset. Alternative: draw the three answers as three labelled marks stacked beside the bars.
2. **How the tutor marks the guess.** "Right / not this time" (default, as in Section A) or "matches / is not what was found".
3. **Section B's check-up.** Default: the seven rows above. Alternative: a smaller check-up (energy and momentum totals only).
4. **Section order of the pictures.** Today the two pictures play one after the other in one diagram. Default: keep that single animation, drawn as two labelled pictures, "Picture 1" and "Picture 2". Alternative: split into two separate canvases (more work, easier to caption).
5. **The "Experiment 5 —" title prefix.** The owner's own change of today stays; the Section A draft's line saying it would go is out of date.
6. **Physics tolerance.** The check-up uses the same rounding tolerance as the tables (differences below 5e-10 shown as 0.0000).

## Not checked
No code was run or changed for this draft. The links are not fetched. The collision diagram's drawing code and the tutor's explanation paragraphs were not re-read in full. The marker's look and the narrow-width layout are checked at the build step.

---

## Build notes (2026-11-21, after the build of Part 3, Part 4, the links and the tests)

Status: **built, wording for the owner's approval (CLAUDE.md §28.1).** Files: `EnergyMomentumCollision.tsx`, `EnergyMomentumCollisionTutor.tsx`, `EnergyMomentumSectionB.test.tsx` (new). The physics module was not touched by this step.

### 1. Part 3, the results (wording as built)

- **Opening line:** "These numbers are for Part 1's run: two lumps moving at 0.6c each in the lab, and a passing observer moving at +0.3c (to the right). Energy is in the rest energies of one lump, momentum is shown as momentum × c, and masses are in units of *m*, the mass of one lump. They never change with your prediction or with the settings you try in Part 2."
- **The guess beside the results** (replaces "Your prediction was ... only recorded here"): "Your guess: *(its label)*. The question it was about: what is the mass of the single lump, compared with 2m, the two masses added? Where its numbers appear: the row "The lump's mass, M" in the first table below, which is tagged "your guess", and the white tick on the mass bars in Picture 1. It shows only what you chose." A small dark tag "your guess" sits on that row.
- **The check-up** (7 rows from `collisionCheckUpRows`): "Each row sets what this physics says to expect beside what was found in your run, with a plain reading. No outside measurement is used here." Columns: Check / What we would expect / What was found / Reading. Where there is no number to expect the column says "the numbers to be equal". Note under it, "What this table tells us": *What it is* (seven checks; the first four ask whether the total energy and total momentum × c changed in the collision, expected difference 0; the last three ask whether the system's mass came out the same before and after and for both observers). *What it means with the real numbers* ("in your run 7 of the 7 rows read 'the same'", the four differences, the system mass 2.5 m for the lab and for the passing observer). *Why it matters* ("these are the totals the introduction called 'conserved'. If a row read 'different', this page would disagree with its own rules. It does not say anything about the lump's mass compared with 2m."). *How sure the numbers are* (calculated here from the rules in Section A; the expected values come from the same rules, so this shows consistency, not an outside test).
- **Five tables, each with its note** (the old fifth and sixth tables stay one table, "The mass of the whole system, and the sum of the separate masses", so there are five tables plus the check-up; the draft's count of six counted that table as two):
  1. *The mass of the lump:* what it is (2m, M and M − 2m); what it means (M = √(2.500² − 0.000²) = 2.5000 m, extra 0.5000 m); why it matters ("this row is the number your prediction was about. The grey and blue bars in Picture 1 draw these two lengths. The tutor goes through where the mass comes from.").
  2. *Total energy:* lab 2 × 1.250 = 2.500 before, 2.500 after; passing observer 2.624 before and after; why it matters (money moved between two bank accounts; each observer checks their own total, before against after).
  3. *Total momentum × c:* 0.750 and −0.750 add to 0.000 for the lab; the passing observer's totals; why it matters (two skaters of equal mass meeting head-on at equal speeds have opposite momenta and a total of zero).
  4. *The everyday momentum:* the speeds the passing observer measures, the everyday sum before and after and their difference; why it matters (two skaters watched from a moving train look different from the train than from the platform; the question is whether mass × speed still adds up with the train's speeds; the tutor says what the numbers show).
  5. *The mass of the whole system and the sum of the separate masses:* two different numbers; the lab and the passing observer's values; a worked line "M = √(2.500² − 0.000²) = 2.5000"; why it matters: "the mass of a system is not simply the masses of the pieces added together. The tutor explains where the difference comes from." This is the line that left the introduction (6e).
- No table follows Part 2's controls (default 6).
- The inner "Results" box heading was removed (it repeated the Part 3 heading).

### 2. Part 4, the tutor (wording as built)

- **Observe:** "Look at the totals in Part 3's tables. Compare the totals before and after the collision, for the lab and for the passing observer. What do you notice?"
- **Compare:** "You predicted that *(the lump would have less mass than 2m / exactly 2m / more mass than 2m)*. Look at the white tick on Picture 1, beside the grey and blue bars. How does your guess compare with the blue bar?" (the old sentence that gave the two masses is gone; the numbers are now the learner's to read from the bars).
- **Explanation, paragraph 1:** now starts "Your guess was (a), and it was right: the lump's mass, 2.500 m, was more than 2 m." or "... and it was not this time: ..." (decision 2, "right / not this time", as in Section A). It is the only place the guess is marked.
- **Explanation, paragraph 3:** now opens with the sentence moved from the introduction: "The mass of a system is not simply the masses of the pieces added together."
- `onExplained` still fires when the learner reaches the explanation.

### 3. Links (wording as built, fetched and read on 2026-11-21)

| Link | Read | What the learner is told |
|---|---|---|
| NASA Goddard, "Momentum" (pwg.gsfc.nasa.gov/stargaze/Smoment.htm) | Yes. Archive of the ISTP "From Stargazers to Starships" lessons, "no longer being updated", last updated 21 Sep 2004 | "a cannon fires a shell. Velocities in one direction count as positive and the other direction as negative, and the total momentum stays the same ('is conserved'). It uses everyday speeds." |
| NASA Glenn, "Conservation of Momentum" (www1.grc.nasa.gov/beginners-guide-to-aeronautics/conservation-of-momentum-2/) | Yes. "Page Last Updated: September 12, 2024" | "the first paragraph says plainly that momentum is neither created nor destroyed, and that it has a direction. The rest of the page is about gas flowing through a pipe and is harder." |
| CERN, "Large Hadron Collider" (home.cern/science/accelerators/large-hadron-collider/) | Yes (also read for Section A). Shows no date | "two beams of particles travel in opposite directions at close to the speed of light and are made to collide. This is a real head-on collision of the kind this section imagines with clay." |

**Gap, §29 rule 3(c):** *a plain official page on why the mass of a system can differ from the masses of its pieces added together* (invariant mass, and that kinetic energy adds to it). Searched 2026-11-21 (WebSearch limited to home.cern, fnal.gov, nasa.gov, esa.int, symmetrymagazine.org): only arXiv papers came back, which are not plain pages, so none is linked. The page says so under the list, and defines the idea itself in the introduction and the tutor. Also tried: NASA Glenn's page above is aerodynamics, so it is linked only for momentum. CERN's older page "LHC the Physics" (home.cern/lhc-the-physics/) was read: it is a 1994 text about the planned LHC ("will produce an intense micro-fireball"), so it was not linked. The "Status: Open" entry for the status table: the gap above.

**"Words and formulas" entries for Section B** (checked): Collision (with head-on and stick together), Conserved (now with the bank-account comparison, **changed**), System, Lump (**new**, added in the first build step), Internal energy, Mass of a system (now with the worked example √(25 − 9) = √16 = 4, **changed**), Everyday momentum (**new**, with 1 × 2 = 2). "Marker" is listed once, by Section A's entries, whose meaning now reads "a white outline (Section A) or a white tick (Section B) ..." (one line in `EnergyMomentumIntro.tsx` changed in the first build step); a second "Marker" entry caused a duplicate-key warning in Chrome, so Section B does not add one.

### Not checked
Narrow widths; keyboard use; other browsers; the tick still crosses the "The lump's mass, M" label (the label has a dark outline and stays readable; not changed, because every position that avoids the crossing moves a label away from its bar); the Section C build was not touched; the specification, the status entry and any commit were not touched; the "What this table tells us" notes were read in the browser only for the first screenful.

---

## Update of 2026-11-22: a second prediction, about the passing observer

Requested by the owner: Picture 2 is about a passing observer, but the only prediction was about the lump's mass, so the learner had nothing to guess about Picture 2. The owner approved the question, its two choices, "required before Run", and each later wording. Status: **built, wording for the owner's approval (CLAUDE.md §28.1).** Built one step at a time: physics and tests; the two prediction blocks and Run; the lower panel of Picture 2 with its caption; Part 3; the tutor.

### A. The second prediction (wording as built; approved by the owner on 2026-11-22)

> **Make a prediction (2 of 2): the passing observer.** Now think about Picture 2. The passing observer measures each lump's speed for themselves, so their speeds differ from the lab's. They add up *mass × speed* for the two lumps before the collision, and again for the single lump after it. Is the everyday total the same before and after, for this observer?
> - (a) The same before and after.
> - (b) Not the same before and after.

- The first prediction is retitled "Make a prediction (1 of 2): the mass of the lump". Both are required: **Run stays disabled until both are chosen**, and the note reads "Choose both predictions above to run the experiment."
- The Run button reads "Run (lab view, then passing observer)" before it is pressed ("Running..." and "Run (done)" as before).
- Both guesses lock together at Run ("Your prediction is locked while you try other settings. To change it, press Start over.") and Start over clears both. Start over is enabled as soon as either guess is chosen.
- **"What Run will show"** (new paragraph under the first question): "Pressing Run plays this one collision twice. **Picture 1** is the lab's view, where the two lumps move toward each other at 0.6c. **Picture 2** is the same collision as a **passing observer** sees it: a second person who moves steadily past the lab, along the same line, at +0.3c to the right (think of someone watching the same crash from a train that is passing by). You make two predictions before you press Run: the first is about the mass of the single lump, and the second is about what the passing observer finds when they add up *mass × speed*. You will see both pictures."
- **Why the real answer is not in the wording:** nothing says whether the two totals are equal (§12). The 2 kg and 3 m/s numbers of "Why a collision" (item 1c) are illustrative only.

### B. Introduction lines changed

- **1b, last sentence of "The question":** "You will be asked to predict the last one, and also what a passing observer finds when they add up mass × speed."
- **1f, the Picture 2 bullet,** added sentence: "Under it, a lower panel adds up mass × speed for this observer, before and after the collision, as two bars on their own scale."
- **1g "Your job":** "Predict first. Part 1 uses two lumps that each move at 0.6c in the lab, and a passing observer who moves at 0.3c to the right. You make two predictions: choose one of the three answers about the lump's mass, and one of the two answers about the passing observer. Both must be chosen before you can press Run. You are not graded. **Your predictions never change the pictures or the tables.** They come from the physics. Your first guess is drawn on the mass bars in white, and your second on the passing observer's everyday totals, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you choose other speeds. Those choices *do* change the drawings, but not your predictions. If you want to change your predictions, press Start over."
- **Part 1 lead:** "You will predict how the mass of the lump that two clay lumps make compares with the two masses added, then guess what the passing observer finds when they add up mass × speed, press Run and watch the collision from two points of view. Your guesses are drawn on the real bars in white. They never change them."
- **Note under the picture before Run:** "Picture 2, the passing observer's view, and your two white guesses (one on the mass bars, one on the passing observer's everyday totals), appear in this picture when you press Run."

### C. The second guess marker (Rule A; drawn in a lower panel of Picture 2)

The question lives in the passing observer's everyday mass × speed totals, which had no picture. Following the owner's rule, they are added to the nearest picture as their own panel, on their own scale and with their own title: **"Picture 2, lower panel: the passing observer's everyday totals, mass × speed"** (subtitle: "Their own scale (in m × c). A bar to the left of the line means to the left."). The picture is taller in Section B's Part 1 only; Part 2's drawings are unchanged.

| What | How it is drawn |
|---|---|
| Dashed line "zero" | A total of zero; a bar to the left is a total to the left |
| Solid purple bar, "Before: mass × speed of Lump 1, plus that of Lump 2" | The total before the collision, with its number (about −0.40 in the fixed case) |
| Outlined purple bar, "After: the lump's mass 2m × its speed" | The total after the collision, with its number (about −0.60) |
| (a) The same before and after | White tick **on the "after" bar at the place where the solid bar ends**, YOUR GUESS box "the same before and after" |
| (b) Not the same before and after | White tick **0.5 below that place**, YOUR GUESS box "not the same before and after" |

- The panel, and the tick, are drawn only once the passing observer's lump has formed (the same moment for the drawing and the caption). Before then the picture says "The two totals are drawn here once their lump has formed."
- The tick is thick and joined by a line to a large YOUR GUESS box. It shows the guess only. A yes or no has no size of its own, so each tick is **only a marker**, and the caption says so.
- The solid and outlined bars are different in look (fill against outline), so the two totals to compare are visibly distinct. Solid means before; outlined means after.
- Every number and position comes from the physics module: `newtonMomentumBefore`, `newtonMomentumAfter`, `everydayTotalGuessMarker`.

### D. Caption of the lower panel (wording as built; appears only once the panel is drawn)

> **Picture 2, lower panel: the passing observer's everyday totals.** It appears under the purple picture once the passing observer's lump has formed. It has its own scale, so its bars cannot be compared with the mass bars in Picture 1. It asks the question of your second prediction.
> - **The dashed line, "zero".** A total of zero. A bar to the left of it is a total to the left, and a bar to the right of it is a total to the right. A longer bar means a bigger total.
> - **The solid purple bar.** The total *before* the collision: each lump's mass *m* times its speed, added for the two lumps, using the speeds the passing observer measures.
> - **The outlined purple bar.** The total *after* the collision: the lump's mass 2*m* times its speed, using the speed the passing observer measures. It is outlined instead of solid so that the two can be told apart.
> - **The numbers on the bars.** Each total in units of *m* × *c*, where *c* is the speed of light. For example, a total of −0.50 is half of m × c, to the left.
> - **The white tick and the YOUR GUESS box** (once a guess is chosen). This is the answer you chose to the second prediction, drawn across the outlined bar. It is **only a marker**: it has no size of its own. If you chose "the same", it sits where the solid bar ends. If you chose "not the same", it sits a fixed distance away. It does not change either bar.
>
> **What to look for in the lower panel** (each item has Look at, What it means and Why it matters; the numbers come from the physics module):
> 1. **Look at** the solid bar. **What it means:** the everyday total before the collision, worked out with the speeds this observer measures (0.37c for Lump 1 and −0.76c for Lump 2, each times m), added together: −0.40 (in m × c). **Why it matters:** it is the "before" side of the everyday rule, for this observer. The rule says it should be kept through the collision.
> 2. **Look at** the outlined bar. **What it means:** the same total after the collision. The rule uses 2m for the lump's mass, and this observer measures its speed as −0.30c, so the total is 2 × −0.30 = −0.60. **Why it matters:** it is the "after" side. Setting its length beside the solid bar answers the question of your second prediction. The page does not say whether they are equal.
>
> **Where the real picture comes from.** *Calculated here:* both totals, from the speeds that the passing observer measures (found by the rule of Section A) and the everyday rule *mass × speed*. *Measured:* nothing on this page. *Imagined for the question:* the lumps, the observer, and the idea of adding mass × speed with this observer's speeds, which is the everyday rule being tested.

The caption gives no verdict on whether the bars are equal (§12, §13). It sits after Picture 2's own caption and "Where the real picture comes from" line.

### E. Part 3 (wording as built)

- The block is now titled "Your predictions, beside the results", with "**Your first guess:**" (as before) and a new paragraph: "**Your second guess:** *(its label)* **The question it was about:** when the passing observer adds up mass × speed, is the total the same before and after the collision? **Where its numbers appear:** the row "m × (the sum of the speeds)" in the table "The everyday momentum, for the passing observer", which is tagged "your guess", and the white tick on the outlined bar in the lower panel of Picture 2. It shows only what you chose."
- A small "your guess" tag now sits on the row "m × (the sum of the speeds)" as well as on "The lump's mass, M".
- The opening note says the tables never change with "your predictions"; the Part 3 lead says "Your two guesses are shown beside them, as you chose them." No table number changes.

### F. Part 4, the tutor (wording as built)

- **Compare** (extended; still three questions): "You predicted that *(the lump would have less mass than 2m / exactly 2m / more mass than 2m)*. Look at the white tick on Picture 1, beside the grey and blue bars. How does your guess compare with the blue bar? Then look at the white tick on the outlined bar in the lower panel of Picture 2. You predicted that *(the passing observer would find the everyday total the same before and after / not the same before and after)*. How does that guess compare with the two purple bars?" Not marked here.
- **Explanation, paragraph 4 ("The everyday momentum fails."):** now opens with the mark for the second guess, the only place it is marked: "Your second guess was (a), and it was right: ..." or "... and it was not this time: ...", with the real totals ("the everyday total was not the same: −0.397 m before and −0.600 m after"). Phrasing follows the first guess (decision 2, "right / not this time"). The rest of the paragraph is unchanged.

### G. Physics-module additions (all in `energyMomentum.ts`; no existing physics changed)

- `EverydayTotalGuess` (`'same' | 'different'`), `EverydayTotalGuessMarker`.
- `everydayTotalGuessMarker(guess, result)`: "same" sits at the real "before" total; "different" sits 0.5 below it; the label starts "YOUR GUESS". It depends on the guess and on the "before" total, which a guess cannot change, so it never changes a real value, and 0.5 exceeds the real gap in the fixed case (about 0.2).
- `realEverydayTotalAnswerFor(result)`: "same" if `newtonMomentumBefore` and `newtonMomentumAfter` agree within `AGREEMENT_TOLERANCE`, else "different". Used by the tutor to mark the guess.
- Tests B9 to B12 (physics): the fixed case is "different" (about −0.397 before, −0.6 after) and so is every preset with a moving observer; at passing speed 0 it is "same"; the ticks sit where described and never on the real "after" total; labels never say right, wrong or match; a marker call does not change the result.
- Render tests (`EnergyMomentumSectionB.test.tsx`): the milestones; the panel and its second YOUR GUESS box appear only once the lump has formed and never in Part 2's drawings; numbers and label come from the module; two answers draw two tick positions; the caption appears only with the panel, with no verdict; Part 3 shows the second guess and tag and the tables do not change with it; the tutor names the second tick and marks only in the explanation.

### H. Decisions and notes for the owner

1. **Question chosen:** the everyday rule (mass × speed with the passing observer's speeds), recommended and approved. **Choices:** two (the same, not the same), no "can't tell", approved.
2. **Which marker offset:** a fixed 0.5 below the "before" total for "not the same" (default). Alternative: a distance proportional to the bar.
3. **Signed bars:** the totals are negative in the fixed case (everything moves left for this observer), so the bars run left from a zero line (default). Alternative: draw lengths only.
4. **The lump-mass guess and the new guess both lock at Run** (default, as the owner asked for "required before Run").

### Not checked
The new panel and the whole second-guess flow have not been viewed in a browser; narrow widths and keyboard use not checked; the tutor's explanation is checked from the source text, not by stepping through it; the full flow with the real 12-second playback not run.
