# Draft wording: Spacetime Geometry Experiment 5, Section A (Energy and momentum, seen by different observers)
Date: 2026-11-21 | Status: **DRAFT for the owner's approval (CLAUDE.md §28.1). Nothing is built.** Written after the owner answered "all defaults" to the ten questions of the re-read in `05-gap-report.md`. This draft covers **Section A only** (default 10: one section at a time). Sections B and C get their own drafts after A is built and approved; the layout below applies to all three.

**What stays and what is new.** All wording approved on 2026-10-15 stays unless a line below says it changes. Lines marked **NEW** or **CHANGED** are for approval; unmarked lines are the approved text, reused.

**Defaults taken (the ten questions):**
1. One chapter; each section has its own four Parts; the sections are called **Section A, B, C** instead of "Part 1/2/3".
2. Gating between sections kept: B opens when A's tutor reaches its explanation (or by the skip link); C likewise. Inside a section, Parts 2 to 4 appear after the first Run.
3. Section A's fixed Part 1 case: **a particle at 0.6c, passing observer at +0.3c** (the page's present start). Part 2 holds the present controls.
4. The guess is a white marker on the real bars (section 4 below), and the caption says it is only a marker.
5. The lines that give the answer away leave the introduction and the words box and move to the tutor (section 2).
6. A check-up and a "What this table tells us" note under each table; no table for the controls.
7. Links searched and read (section 9).
8. The tutor names the marks and marks the guess.
9. One caption under each picture, three-part look-fors, "Where the real picture comes from".
10. Section A first; stop for approval before B.

---

## Layout (Section A)

- **Above Part 1 (no Part heading):** the heading, the introduction, "Some words we will use", "Want to know more?", a collapsed "Words and formulas" box. The skip links ("Skip to Section B / C") stay here.
- **Part 1 (amber `#d97706`), "Predict, then watch":** the prediction (the fixed case), Run, **Start over**, Picture 1 (the map of energy and momentum) and, from Run, Picture 2 (the bars) with the white guess marker.
- **Part 2 (pink `#be185d`), "Now try it yourself", after the first Run finishes:** the object (particle or light pulse), the particle's speed, the passing observer's speed, "Run these settings", Drawing A (the map) and Drawing B (the bars) for the learner's own choice, in pink.
- **Part 3 (teal `#0f766e`), "The results":** the table for Part 1's run, the energy ledger, the check-up, "What this table tells us" notes, the guess shown beside the results with a tag, then the original sources.
- **Part 4 (blue `#0066cc`), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while a run plays. It clears the guess, the runs, the results and the tutor. Once Run is pressed the guess is locked ("Your prediction is locked while you try other settings. To change it, press Start over.").
- **Colours:** white only for the guess. Amber is Part 1's line and heading; pink marks only the learner's own choices in Part 2. The existing blue, green, purple and yellow elements of the map stay as they are.
- **Completion marks:** unchanged. `onComplete` and `onTutorComplete` still fire only at the end of Section C's run and tutor.

---

## 1. Introduction

**1a. Heading (CHANGED).** "Energy, Momentum and Mass: What Do All Observers Agree On?" (the "Experiment 5 —" prefix goes, as on the other audited pages). Under it, a one-line **NEW** note: "This chapter has three sections: A (energy and momentum seen by different observers), B (a collision) and C (reactions where the masses change). Section B opens when you finish A, and C when you finish B. If you already know a section, use its skip link."

**1b. "The question".** Unchanged: "In earlier experiments, observers who move differently disagreed about the time and the distance between two events, but they all found the same value of time² − distance² (Experiment 1 of this group). This experiment asks the same kind of question about something else belonging to a moving thing: its **energy** and its **momentum**. Do observers who move differently agree on them? If not, is there something about them that the observers *do* agree on?"
*(Owner to judge: this already says "is there something about them that they do agree on", which is answer (c) in other words. Default: keep it, because it is the approved question and states the problem without a result. Alternative: end after "Do observers who move differently agree on them?")*

**1c. "Some words we will use".** Unchanged: all eleven entries (particle, observer, speed of light, time dilation factor, mass, energy, kinetic energy, momentum, rest energy, total energy, a light pulse), because they define terms before they are used (§15). **CHANGED, one line:** "Experiment 3 of the first chapter" becomes "Experiment 3 of the first chapter (Relativity of Time and Motion)" so the learner knows which chapter.

**1d. "The rules this experiment uses" (CHANGED; the answer-revealing items leave).**
- **Stays before Part 1:** Total energy (E = mc² ÷ D(v), with the 0.5c example); Momentum times c (pc = v ÷ D(v), with the 0.5c example); What speed does another observer measure (v′ = (v − u) ÷ (1 − uv), with 0.6c and 0.3c); Light (E = pc).
- **Leaves, and appears after the first Run finishes (as a "Now that you have run it" note under the table in Part 3, and in the tutor):** "A combination of the two: E² − (pc)²" with its worked 1.155² − 0.577² = 1.000, and "Energy and momentum seen by a passing observer" (the rule that turns the lab's numbers into theirs). Why: the first names the very quantity answer (c) asks about and shows it equal to 1.000 at 0.5c, and the second says the other observers' numbers come from the same rule as time and position, which hints that something is kept. Both are §12 hints.
- **NEW sentence in the rules lead-in, replacing nothing:** "Two more rules are given after your first run, because they would give away what you are asked to predict."

**1e. "What happens".** Unchanged except the last sentence: "A drawing shows the three readings as points, and a table gives the numbers." becomes "A drawing shows the readings as points, bars show the same numbers, and a table gives them."

**1f. "Your job" (CHANGED, Rule A item 7).**
"**Your job.** Predict first. Part 1 uses a particle moving at 0.6c in the lab, and a passing observer moving at 0.3c in the same direction. Choose one of the three answers, then press Run. You are not graded. **Your prediction never changes the pictures or the tables.** They come from the physics. Your guess is drawn on the bars in white, with a box labelled YOUR GUESS, and it is shown again beside the results. After your first run, Part 2 lets you choose a light pulse or another speed, and those choices *do* change the drawings, but not your prediction. If you want to change your prediction, press Start over."

**1g. "What we assume".** Unchanged.

---

## 2. The prediction (Part 1)

**2a. The question text (CHANGED, §12).** Today it says: "A particle with mass is moving past the lab. The lab measures its energy and its momentum. A passing observer, who moves differently, measures them too. Earlier, two observers measured different times and different distances between two events, but the same time² − distance². What do you think the two observers find for this particle?"
Draft: "A particle with mass is moving past the lab at 0.6c. The lab measures its energy and its momentum. A passing observer, who moves past the lab at 0.3c in the same direction, measures them too. What do you think the two observers find for this particle?"
The sentence about time² − distance² is removed, because it points at answer (c) and the introduction already carries the comparison once (1b).

**2b. The three answers.** Unchanged: (a) the same energy and the same momentum; (b) different, with nothing they agree on; (c) different, but some number worked out from the energy and the momentum that they agree on.

**2c. Under the buttons.** "Your prediction: (a). This is not graded." becomes **CHANGED**: before Run, "Your prediction: (a). You can still change it until you press Run." After Run, "Your prediction is locked while you try other settings. To change it, press Start over." The line "Choose a prediction above to run the experiment." stays.

---

## 3. The Part leads (learner-facing wording, §14)

**Part 1, "Predict, then watch" (amber).** "What we are about to do: you will predict what two observers who move differently will find when they measure the same particle, then press Run and watch. Your guess is drawn on the real bars in white. It never changes them."

**Part 2, "Now try it yourself" (pink), shown after the first Run finishes.** "What we are about to do: choose a different object (a light pulse instead of a particle), a different speed for the particle, or a different speed for the passing observer, and run it again. These choices change the drawings. Your prediction does not."

**Part 3, "The results" (teal).** "What we are about to do: read the numbers from Part 1's run. The table, the energy ledger and the check-up never change with your prediction or with the settings you tried in Part 2. Your own guess is shown beside them, as you chose it."

**Part 4, "The tutor" (blue).** "What we are about to do: the tutor asks you three questions, one at a time, about what you saw, then gives its explanation."

**Note beside Part 2's controls (Rule A item 7).** "Your prediction does not change the drawings or the tables. These settings change the drawings below, and they do not change Part 3's table, which is for Part 1's run."

**Note shown in Part 2 until a light pulse has been run (Rule 2026-11-07).** "The tutor's paragraph about light appears after you have run a light pulse here. Choose 'A light pulse' and press Run these settings."

---

## 4. The guess marker (Rule A, items 2 to 5; drawn on Picture 2)

Picture 2 is the three bars for each observer. The guess answers "which of these numbers do the observers agree on", so it is drawn here, on the bars, once they exist (Run). Because the three answers have no size of their own, each is a **marker** (item 3).

| Answer | What is drawn in white | Label in the white box |
|---|---|---|
| (a) the same energy and the same momentum | A white outline round the **energy** bar and the **momentum × c** bar of every observer | "YOUR GUESS: these are the same for every observer" |
| (b) different, nothing agreed | A white outline round **all three bars** of every observer | "YOUR GUESS: all of these differ, nothing is agreed" |
| (c) different, but one combination is agreed | A white outline round the **energy and momentum × c** bars, and a second white outline round the **E² − (momentum × c)²** bar | "YOUR GUESS: these differ, but this number is agreed" |

- Each outline is thick, joined by a line to a large YOUR GUESS box with large text (owner's pattern). It shows the guess only, never "right", "wrong" or "matched".
- Picture 2 has a dark background, so white shows.
- The marker is drawn only when Picture 2 appears (at Run). Picture 1 carries no guess.
- The caption says: "The white outlines are only a marker for the answer you chose. They have no size of their own, and they do not change the bars."
- Numbers (the real values of each bar, and which bars agree) come from the physics module (section 8).

---

## 5. Captions (one under each picture)

### Under Picture 1 (the map of energy and momentum)

**How to read Picture 1.** Reuse the approved description: the axes (momentum × c across, energy up, in rest energies for a particle), the sky-blue square "The lab's reading", the green diamond "The particle's own reading" (from Run), the hollow purple circle "The passing observer's reading" with its dashed path, and the yellow curve (or the two straight yellow lines for light). **CHANGED:** the sentence in the yellow-curve entry "Think of a road drawn on a map…" stays, but the final claim that the curve "is the line that all of those dots fall on" is shown only after Run (the curve itself is drawn only at Run, so the line is already conditional).

**NEW, "Where the real picture comes from".** "Nothing here was measured. The numbers are calculated here from the rules of special relativity given in the introduction. The particle and the observers are imagined for the question. The same rules have been tested in particle accelerators."
*(Source for the accelerator sentence: CERN's LHC page, read 2026-11-21; see section 9. Owner to confirm that sentence, or it goes.)*

**What appears when.** Unchanged, in order: before Run only the lab's square; at Run the curve and the green diamond appear with the purple circle; the circle slides along the curve; 12 seconds; everything stays.

**NEW, worked moment.** Unchanged numbers (a particle at 0.5c, a passing observer at +0.2c: lab E = 1.155, pc = 0.577; passing E = 1.061, pc = 0.354), which are not among the choices, so they do not reveal Part 1's case. **CHANGED:** the line "the same rule as for time and position" stays here, because Picture 1 is the map of readings and does not say anything is kept.

**What to look for** (three parts each, shown only when the feature is drawn):
1. *Look at* the **purple circle** while it slides. *What it means:* its height is the passing observer's energy and its place across is their momentum × c; both change as their speed changes (here, from 1.25 and 0.75 for the lab at 0.6c, toward the passing observer's values). *Why it matters:* it shows that two observers measuring the same particle get different energies and different momenta, so energy and momentum alone are not things everyone agrees on.
2. *Look at* the **yellow curve** once it is drawn. *What it means:* every reading, whatever the observer's speed, lands on this one curve. *Why it matters:* the readings are different, but they are not scattered. Something stays fixed; the tutor will say what.
3. *Look at* the **green diamond** (from Run). *What it means:* the particle's own observer finds momentum 0 and energy 1, its rest energy. *Why it matters:* this is the lowest point of the curve, so no observer finds less energy than the rest energy.

*(The 1.25 and 0.75 figures are the lab's numbers for a particle at 0.6c, computed by `particleReading`; they are drawn on the map from the start, so quoting them reveals nothing new.)*

### Under Picture 2 (the bars)

**How to read Picture 2.** Reuse the approved description (three bars per observer on one scale: the top is energy, the middle momentum × c, the bottom E² − (momentum × c)²; each bar starts at the middle line, which is zero; a bar to the left means negative). **CHANGED:** the sentence "The sign does not affect the bar for E² − (momentum × c)²" stays but moves to the worked moment, after Run.

**NEW, the white marker.** The paragraph in section 4 above: what the white outline is, that it is only a marker, and that it does not change the bars.

**NEW, "Where the real picture comes from".** "The bars come from the same calculation as Picture 1: calculated here from the rules in the introduction. Nothing was measured. The white outlines are your guess, drawn by this page, and are not part of the result."

**What to look for:**
1. *Look at* the **top bar of each observer** (energy). *What it means:* the three observers' energy bars have different lengths (1.25 for the lab at 0.6c; 1.0 for the particle's own observer; the passing observer's is shorter than the lab's). *Why it matters:* energy is not agreed.
2. *Look at* the **middle bar of each observer** (momentum × c). *What it means:* the lab's is 0.75, the particle's own is 0, and the passing observer's is smaller than the lab's. *Why it matters:* momentum is not agreed either.
3. *Look at* the **bottom bar of each observer**. *What it means:* all three have the same length, 1.00. *Why it matters:* one combination of energy and momentum is the same for everybody, which is the question the experiment asks. (Leave the full reason to the tutor.)
*(Items 1 to 3 appear after Run, as Picture 2 does. The numbers are read from `runInvariantExperiment` at 0.6c and 0.3c; the passing observer's exact values are filled in from the module at build time.)*

---

## 6. Results (Part 3)

**6a. "The check-up" (NEW, Rule B item 1), near the top.** A table that sets what we expect beside what was found:

| Check | What we would expect | What was found in your run | Reading |
|---|---|---|---|
| E² − (momentum × c)² for the lab | 1.000 for a particle (its rest energy squared) | from the module | "the same" |
| the same for the particle's own observer | 1.000 | from the module | "the same" |
| the same for the passing observer | 1.000 | from the module | "the same" |
| Energy, lab and passing observer | no expected value | 1.250 and the module's value | "different" |

- The reading uses only "the same", "different", "more" or "less". No cut-off such as "close enough" is invented.
- *Where the expected value comes from:* the same physics predicts it (a particle's E² − (pc)² equals its rest energy squared); this is the tested result of `energyMomentum.test.ts` tests 2 and 5, not an outside source. No published value is claimed.

**6b. "What this table tells us" (NEW, under the main table).**
- *What it is:* "Each row is one observer's measurements of the same particle: its speed, its energy, its momentum × c, and the combination E² − (momentum × c)²."
- *What it means with the real numbers:* "The lab found energy 1.250 and momentum × c 0.750. The passing observer found [module values]. The two observers' energies differ and their momenta differ, but the last column is 1.000 in every row."
- *Why it matters:* "A number that every observer finds the same is a fact about the particle itself and not about who is looking. This one number is called the particle's mass, in energy units."
- *How sure:* "These are calculated here from the rules, not measured in this page. Accelerators have tested the rules."
*(The words "is called the particle's mass" are given in Part 3, after the run, as in the approved tutor paragraph 2.)*

**6c. "What this table tells us" (NEW, under the energy ledger).**
- *What it is:* "Four rows for the lab's measurement of the particle at 0.6c: its rest energy (1.0000), its kinetic energy (0.2500), its total energy (1.2500), and, for comparison, the everyday formula ½ × speed² (0.1800)."
- *What it means:* "The true kinetic energy is 0.2500 rest energies. The everyday formula gives 0.1800, so the everyday formula is too small by 0.07 here. At 0.6c the two are already visibly different."
- *Why it matters:* "The everyday formula works for slow things and is wrong for fast ones. The gap grows as the speed rises."
*(Numbers from `kineticEnergy` and `newtonKineticEnergy`; 0.25 and 0.18 are computed from the module, not typed in.)*

**6d. The learner's prediction beside the results (NEW, Rule B item 4).** A short block: "**Your prediction:** (a)/(b)/(c), the full sentence. **The question it was about:** do the two observers agree on anything? **Where its number appears:** the last column of the table, with a small tag 'your guess' on the row headings it names." It shows the guess only, never "matched" or "right".

**6e. "Now that you have run it" (CHANGED; moved from the introduction, section 1d).** The two rules that left the introduction (E² − (pc)² with the worked 1.155² − 0.577² = 1.000, and the rule that turns the lab's numbers into the passing observer's), with "What it does not mean" lines as approved.

**6f. Original sources (NEW, end of Part 3).** See section 9.

---

## 7. The tutor (Part 4)

The four steps stay: observe, compare, conceptual, explained. What changes:

- **Observe (CHANGED).** "Look at the table and the pictures. How did the energy and the momentum differ between the observers? Was anything the same?" becomes "Look at the bars in Picture 2 and the table in Part 3. How did the energy and the momentum differ between the observers? Was anything the same?"
- **Compare (CHANGED).** The present sentence ("You predicted that …. In this run, the lab found…") gains "Look at the white YOUR GUESS box on the bars in Picture 2, which shows what you chose, and compare it with the three bars of each observer." It still quotes the numbers.
- **Conceptual (unchanged).** "The particle's own observer is riding along with the particle. Why do you think they measure zero momentum? And what is their energy, compared with the lab's?"
- **Explanation.** Paragraph 1 ("What the table shows") **CHANGED** to mark the guess: "You chose (a)/(b)/(c). The last column shows the same number for every observer, so answer (c) is the one that matches what the table shows." The other answers are marked the same way: (a) "the table shows different energies and momenta, so this is not what was found"; (b) "there is one number they agree on, so this is not what was found". The wording "matches" and "is not what was found" is for the owner to approve (default: "right / not this time", as approved for Experiment 4).
- **The light-pulse paragraph (CHANGED).** Appears after the learner has run a light pulse in Part 2. Before that, a visible note says to do so.
- **Accelerator figures (CHANGED, source gap).** The present text says protons at the LHC were "accelerated to 6.5 TeV". CERN's LHC page, read 2026-11-21, gives **6.8 TeV per proton beam** as the present nominal energy and says 6.5 TeV was the energy of 2015 to 2018 only by implication (it states 13 TeV collisions from 2015, not 6.5). Default: use the 6.8 TeV figure CERN states, which needs the constant in the physics module changed and its test updated (O1 below). Alternative: keep 6.5 TeV, with "in 2015 to 2018", and record that no page stating 6.5 TeV could be read (the CERN news page returned "page not available").
- **"The formulas were not derived here; they are tested in particle accelerators"** stays, with the CERN LHC page as its source link.

---

## 8. Physics-module additions (Step 3, after approval; none changes existing physics)

New, tested functions in `energyMomentum.ts` (existing functions and results unchanged):
- `agreedQuantities(result)`: for each of energy, momentum × c and E² − (pc)², whether all observers in the run agree (within a tolerance), so the marker and the check-up use module numbers.
- `guessMarkerFor(prediction, result)`: which bars the white outlines go round for each answer (section 4).
- `checkUpRows(result)`: the expected and found values and the reading ("the same" / "different") for the check-up.
- If the owner takes the 6.8 TeV default: the LHC proton energy constant and its test.
Tests: each answer's marker places the outline on the right bars; the invariant agrees for all observers for every preset speed; energy and momentum do not agree for the default case; the marker does not change any real value.

---

## 9. "Want to know more?" and the "Words and formulas" box

**Links checked on 2026-11-21 (fetched and read):**

| Link | What the learner finds | Status |
|---|---|---|
| CERN, "Large Hadron Collider" (home.cern/science/accelerators/large-hadron-collider/) | CERN's plain page on the LHC: protons pushed "to near the speed of light"; the current proton energy and a table of key figures | **Read.** Gives 6.8 TeV per beam and 13.6 TeV collisions; states no numerical speed. |
| A. Einstein, "Does the Inertia of a Body Depend upon its Energy-Content?" (1905), full English text at Fourmilab (fourmilab.ch/etexts/einstein/E_mc2/www/) | The original paper, in the 1923 translation, three pages. It contains the sentence "If a body gives off the energy L in the form of radiation, its mass diminishes by L/c²." | **Read.** Hosted by Fourmilab (public domain text), not an official host. Princeton's official portal needs a subscription and its page did not show the text. Owner to say whether to link Fourmilab. |

**Not usable, recorded as gaps (§29 rule 3(c)):**
- *A plain-language official page on what energy and momentum are, and on E = mc²:* **no plain official page found.** Searched 2026-11-21. Candidates found but not read: NASA SpaceMath "Energy and Mass" (`spacemath.gsfc.nasa.gov/universe/6Page88.pdf`): host did not resolve when fetched; a copy at `science.gsfc.nasa.gov/attic/...` was found by search and not fetched. Fermilab "MeV" page: the server returned 403. The page therefore links none of them, and the introduction defines energy and momentum itself (1c).
- *The original paper for the energy and momentum of light under a change of observer* (Einstein, "On the Electrodynamics of Moving Bodies", 1905, §8): not fetched this time; not linked.
- *6.5 TeV for the LHC's 2015 to 2018 energy:* the CERN news page returned "page not available". Not linked.

**"Words and formulas" box.** Keep the sixteen present entries, with these changes:
- **CHANGED:** the entry "E² − (pc)²" and the entry "v′ = (v − u) ÷ (1 − uv)": the first appears only after the first Run (it would name the answer); the second stays.
- **NEW entries:** "Invariant: a number that every observer finds the same. (Shown after your first run.)" and "Marker: a white outline that stands for your guess. It does not have a size of its own."
- "Some new words" line in the introduction names the entries.

---

## 10. Decisions and notes for the owner

1. **1b's last question** (is there something they agree on): keep or cut? Default: keep.
2. **Which answer marks the guess in the tutor:** "right / not this time" (default, as in Experiment 4) or "matches / is not what was found".
3. **LHC energy:** switch to 6.8 TeV (CERN's current figure; needs a physics constant and test change) or keep 6.5 TeV with "2015 to 2018" and a source gap. Default: 6.8 TeV.
4. **Einstein 1905 link:** link the Fourmilab text, or record "no official host available" as a gap. Default: link it, with the note that it is a public-domain text hosted by Fourmilab.
5. **The Sun paragraph's "0.7 percent" and "600 million tonnes"** belong to Section C's tutor; that is for Section C's draft.
6. **Section A's `onComplete`:** unchanged (fires at the end of Section C).
7. **Not in this draft:** figures for the introduction (default 4 added figures only where a section asks; none proposed for A, whose introduction is long already).

## Not checked
No code was run or changed. The Fermilab, NASA SpaceMath and CERN 6.5 TeV pages could not be read. The tutor's paragraphs 5 to 9 were read in the code but are not reworded here beyond what is listed. The marker's look on the real bars and the narrow-width layout are checked at the build step.
