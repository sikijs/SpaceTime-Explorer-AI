# Draft wording: Spacetime Geometry Experiment 5, Section C (Reactions: can the masses change?)
Date: 2026-11-21 | Status: **DRAFT for the owner's approval (CLAUDE.md §28.1).** The owner asked for "all these steps for Section C also", so this draft and its build were done in one pass; the learner-facing wording below is still the owner's to approve line by line. It applies the ten defaults the owner accepted in `05-gap-report.md` ("all defaults") and follows the layout of Section A (`05-draft-wording.md`) and Section B (`05-draft-wording-section-b.md`).

**What stays and what is new.** Wording approved on 2026-10-15 stays unless a line below says it changes. **NEW** or **CHANGED** lines are for approval; unmarked lines are the approved text, reused.

**What was read.** `EnergyMomentumReactions.tsx` (all 1,091 lines), `EnergyMomentumReactionsTutor.tsx` (all), `runReactionExperiment` in `energyMomentum.ts`, Section B's component and draft, the gap report. Sources for links and facts: see section 9 (fetched and read in a browser on 2026-11-21).

---

## Layout (Section C)

Same pattern as Sections A and B.

- **Above Part 1 (no Part heading):** the section heading, the back links to Sections A and B, the introduction, "Some new words", "Want to know more?".
- **Part 1 (amber `#d97706`), "Predict, then watch":** the fixed case, **a particle and its antiparticle, each moving at 0.6c toward each other in the lab (passing observer at +0.3c)**; the prediction; Run; **Start over**; Pictures 1 and 2 (the lab's view and the passing observer's view, in one animation), with the **mass ledger** and the white guess tick on it.
- **Part 2 (pink `#be185d`), "Now try it yourself", after the first Run finishes:** the choice of process (a particle and its antiparticle; two beams of light; a helium nucleus), its setting, the passing observer's speed, one **Run these settings** button, Drawings A and B for the learner's own choice. The next process not yet run is selected automatically (two beams of light first, then helium).
- **Part 3 (teal `#0f766e`), "The results":** the guess beside the results, a check-up, "What this table tells us" notes under each table, for Part 1's run; the helium check-up once helium has been run in Part 2 ("not run yet" before); the sources.
- **Part 4 (blue `#0066cc`), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run, and while a run plays. It clears the guess, the runs, the results and the tutor of Section C. Once Run is pressed the guess is locked. Changing the process, setting or observer no longer clears the guess (they now live in Part 2).
- **Parts 2 to 4 appear after the first Run** (CLAUDE.md, 2026-11-07). Where something needs another run (the tutor's paragraphs about light and helium, the helium check-up), the page shows what is available and says in plain words what is not run yet.
- **Names:** "Part 1/2/3" inside this section's text become "Section A/B/C" where they mean the sections.
- **Completion marks:** unchanged. `onComplete` fires when Part 1's run ends; `onTutorComplete` when the tutor reaches its explanation. **No prop change is needed in `EnergyMomentumExperiment.tsx`.**

---

## 1. Introduction

**1a. Skipped-section reminders (CHANGED, names only).** "If you skipped Section A." / "If you skipped Section B." (was "Part 1" and "Part 2").

**1b. "The question" (CHANGED, names, clarity and more detail; owner's request and approval of 2026-11-22).** The neutral wording below does not say how the totals compare, so nothing is revealed (§12). The 2 kg and 3 kg bags are illustrative only. The PET-scan remark and "what makes the Sun shine" are general facts, not claims from the physics module. Draft:

> **The question.** In Section B two lumps of clay stuck together, and we asked two things. First, what happens if we weigh each piece on its own and add the weights up? Second, what is the mass of the whole group of pieces taken together? In Section C we ask the same two things, but in situations where the pieces themselves change. They do not just stick together. Here are the three situations.
> - **A particle meets its "opposite twin".** Every kind of particle has a twin called an *antiparticle*. It has the same mass, but the opposite electric charge. The electron's twin is the positron. When a particle and its twin meet, both can disappear, and light comes out. This really happens: a hospital PET scan works by detecting the light given off when positrons meet electrons in the body.
> - **Light turns into particles.** Light that carries enough energy can turn into a particle and its twin. Pieces appear where there were none. There is a smallest amount of energy for this (called a threshold), and with less light than that, nothing appears.
> - **Four particles join into one.** Two protons and two neutrons can bind together into a single helium nucleus. This kind of joining is what makes the Sun shine.
>
> **What stays the same in all three.** The total energy and the total momentum are conserved, as in Section B. Think of money moved between bank accounts: the amount in each account changes, but the grand total does not. Here the "accounts" are the pieces before and the pieces after.
>
> **The two things we ask about.** They sound alike, but they are different.
> - **The total of the separate masses.** Imagine weighing every piece alone, sitting still, and adding the numbers up. For example, a 2 kg bag and a 3 kg bag give 2 + 3 = 5 kg. A piece of light has no mass, so it adds nothing to this total.
> - **The mass of the whole system.** This is not found by weighing the pieces. It is worked out from the *total energy* and the *total momentum*, with the formula from Section B: M = √(E_total² − (P_total c)²). For example, a group with a total energy of 5 and a total momentum × c of 3 has M = √(25 − 9) = 4, whatever the pieces inside it are doing.
>
> A shop gives an everyday comparison. For a bag of coins, "how many coins are there?" and "what is their total value?" are two different questions. After you swap some coins for others, either answer might stay the same or might change. Section C finds out which is which, for the masses.
>
> **What you will do.** You are asked to predict first, for a particle meeting its twin: how does the total of the separate masses compare before and after they meet? Then you can try all three situations and watch what each one does.

**1c. "Why these three processes" (CHANGED, §12).** The sentence "Trying all three lets you see which things change and which do not" hints that something changes, so it becomes "Trying all three lets you see what happens in each, so you do not have to trust a single example."

**1d. "Some new words" (CHANGED, §12).** All stay as approved, except "Mass defect": "how much less a nucleus weighs than its separate parts" stays (it concerns helium, which is not the prediction). "The sum of the rest masses, and the system's mass" stays.

**1e. "Formulas needed here" (CHANGED, §12).** The three formulas are kept, with two moves because they give away Part 1's prediction (how the sums compare):
- **The system's mass again:** keeps its formula and example; the closing line *"What it does not mean: it is not the sum of the pieces' masses"* moves to Part 3.
- **Speed from energy:** unchanged.
- **Energy released:** (sum of rest masses before − sum after) × c², with the words "the drop in the total of the rest masses ... is the energy given off", presupposes that the sum drops. It **moves to Part 3**, shown after the first Run (the words box lists it only then).

**1f. "What happens" (NEW, replaces the three-process description).**
> **What happens.** Part 1 shows one reaction twice: a particle and its antiparticle meet in the lab, and then a passing observer sees the same meeting.
> - **Before you press Run.** You see the setup: the two pieces, each with an arrow for its way and speed, and the numbers the lab measures for each (energy, momentum × c and rest mass).
> - **Picture 1, the lab's view.** The pieces slide together, a yellow ring flashes where they meet, and the pieces after the meeting appear. Then four bars appear on one scale: the mass ledger.
> - **Picture 2, a passing observer's view.** The same reaction replayed with that observer's numbers.
> - **Then it is your turn.** In Part 2 you try two other processes (two beams of light meeting, and a helium nucleus forming) and other settings. Part 3 gives the numbers and Part 4 is the tutor.

The old paragraphs "What you will see" and the three process bullets move into the captions and the Part 2 controls. "Why the lab is a special observer", "The passing observer" and "What we assume" stay.

**1g. "Your job" (CHANGED).**
> **Your job.** Predict first. Part 1 uses a particle and its antiparticle that each move at 0.6c in the lab, and a passing observer who moves at 0.3c to the right. Choose one of the three answers, then press Run. You are not graded. **Your prediction never changes the pictures or the tables.** They come from the physics. Your guess is drawn on the mass ledger in white, with a box labelled YOUR GUESS, and it is shown again beside the results. After your first run, Part 2 lets you try other processes and settings. Those choices *do* change the drawings, but not your prediction. If you want to change your prediction, press Start over.

---

## 2. The prediction (Part 1)

**2a. The question text (CHANGED).** "A particle and its antiparticle, each moving at 0.6c in the lab, meet. The two particles meet and turn into something else. Energy and momentum are conserved. Add up the masses of the separate pieces **before**, and the masses of the pieces **after**. How do the two totals compare?" (Today the process and its speed are the learner's choice; now fixed.)

**2b. The three answers (unchanged).** (a) The total mass after is less than before. (b) The total mass is the same. (c) The total mass after is more than before.

**2c. Under the buttons.** Before Run: "Your prediction: (a). You can still change it until you press Run." After Run: "Your prediction is locked while you try other settings. To change it, press Start over." "Choose a prediction above to run the experiment." stays.

---

## 3. The Part leads (learner-facing wording, §14)

**Part 1, "Predict, then watch" (amber).** "What we are about to do: you will predict how the total of the masses of the pieces compares before and after a particle and its antiparticle meet, then press Run and watch the meeting from two points of view. Your guess is drawn on the real mass ledger in white. It never changes it."

**Part 2, "Now try it yourself" (pink).** "What we are about to do: choose another process (two beams of light meeting, or a helium nucleus forming) or another setting, and press Run these settings. These choices change the drawings. Your prediction does not."

**Part 3, "The results" (teal).** "What we are about to do: read the numbers from Part 1's run and check them against the physics. The tables never change with your prediction or with the settings you tried in Part 2. Your own guess is shown beside them, as you chose it."

**Part 4, "The tutor" (blue).** "What we are about to do: the tutor asks you three questions, one at a time, about what you saw, then gives its explanation. The tutor's questions are not marked."

**Note beside Part 2's controls.** "Your prediction does not change the drawings or the tables. These settings change Drawing A and Drawing B below, and they do not change Part 3's tables, which are for Part 1's run."

**Note shown in Part 2 until each process has been run (2026-11-07 rule).** "Not run yet: two beams of light, a helium nucleus. The tutor's paragraphs and Part 3's helium check-up for a process appear after you have run it here. Choose it and press Run these settings."

---

## 4. The guess mark (Rule A; drawn on the mass ledger)

The prediction is about the sum of the rest masses before and after, which are the first two bars of the mass ledger (grey before, blue after). Each answer has no size of its own, so each is a **marker** (item 3), a white tick across the two bars:

| Answer | Where the white tick sits | Label in the white box |
|---|---|---|
| (a) less after than before | **Half-way** along the "before" bar (0.5 × the before value) | "YOUR GUESS: less after than before" |
| (b) the same | **At the end** of the "before" bar | "YOUR GUESS: the same" |
| (c) more after than before | **One and a half times** the "before" bar | "YOUR GUESS: more after than before" |

- Thick tick, joined by a line to a large YOUR GUESS box. It shows the guess only: never "right", "wrong" or "matched".
- Drawn only once the ledger is drawn (after the lab's reaction). Picture 2 carries none.
- **The bar scale does not depend on the guess**, so the real bars never change length with a guess.
- Caption: "The white tick is only a marker for the answer you chose. It has no size of its own, and it does not change any bar."
- Numbers (the before sum, the marker positions) come from the physics module (section 8).

---

## 5. Captions

One caption under the picture, "How to read this diagram", in short sections (the lab's picture; the mass ledger; the passing observer's picture), each look-for item as **Look at / What it means / Why it matters**, shown only once its feature is drawn, with "Where the real picture comes from" lines. The text of the present caption (named pieces, circle versus yellow arrow, units, the dashed line, the hollow purple circle) is kept and re-laid out as bullet lists; the worked moment (0.5c) is kept and its "rule from Part 1" becomes "from Section A".

Look-for items (numbers from the physics module, never a verdict):
1. **The numbers under each piece before the reaction:** the totals the reaction may or may not keep.
2. **The pieces after the reaction (their names, directions and numbers).**
3. **The four ledger bars:** grey = before, blue = after; first pair = sum of the rest masses (light counts as zero), second pair = the system's mass. The question you predicted is about the first pair; the page does not say which is longer.
4. **The line under the bars** (energy released or absorbed = the sum before minus the sum after).
5. **Picture 2's numbers, and the totals in that picture.**

"Where the real picture comes from": **Calculated here:** every number and bar, from the rules of special relativity in Section A. For helium, the masses are **measured** (CODATA 2022 values from NIST) and the two equal light pulses are a model of the accounting. **Imagined for the question:** the particles, the observers (and, for helium, the way the pieces come together, which is not shown).

---

## 6. Results (Part 3)

Shows only Part 1's run. The six existing tables stay (sum of the rest masses; system's mass; energy released; total energy; total momentum × c).

**6a. The guess beside the results.** "Your guess: (a/b/c) ... The question: how do the sums of the rest masses compare before and after a particle and its antiparticle meet? Where its numbers are: the table 'The sum of the rest masses', tagged 'your guess', and the first two bars of the mass ledger." The guess only.

**6b. A check-up table (NEW).** Seven rows, all from the same physics: the lab's and the passing observer's total energy and total momentum × c, each after minus before, expected 0; the system's mass for the lab before and after, for the passing observer before and after, and for the lab against the passing observer (equal). Reading: "the same" or "different". No reading is given for the sum of the rest masses (the prediction).

**6c. The helium check-up (NEW, after helium has been run in Part 2; "not run yet" before).**

| What we compare | Published reference | Found here | Reading |
|---|---|---|---|
| Binding energy of helium-4 (energy released) | **28.2956 MeV**, worked out from the CODATA 2022 masses of the proton (938.272 089 43), neutron (939.565 421 94) and alpha particle (3727.379 4118 MeV), read on NIST's pages on 2026-11-21 | the page's own value | "the same" if they agree to the rounding of the page's masses (0.003 MeV), else "different" |

**6d. "What this table tells us"** under each table, each item saying what it is, what it means with the real numbers, why it matters, and how sure the number is; headline items:
- *Sum of the rest masses:* 2.00 before, 0.00 after (a light pulse counts as zero); the plain number set against the guess.
- *System's mass:* 2.50 before and after, for both observers.
- *Energy released:* sum before minus sum after, here 2.00; with the moved rule and the moved line "it is not the sum of the pieces' masses".
- *Total energy and momentum:* each observer's totals and differences.
- *Helium check-up:* what the 28.3 MeV is, 0.75 percent of the parts' mass, and that the reference is worked out from published masses, so it checks this page's constants rather than the physics.

No table for Part 2's controls (default 6).

---

## 7. The tutor (Part 4)

Three steps, as today, then the explanation.
- **Observe** (CHANGED to name the marks): "Look at the mass ledger in Picture 1 and at the tables in Part 3. What happened to the sum of the masses of the pieces? What happened to the mass of the whole system?"
- **Compare** (CHANGED): "Look at the white tick on the ledger. You predicted ... The sum of the rest masses went from 2.000 to 0.000 ... Comparing the white tick with the grey and blue bars, what do you notice?"
- **Conceptual:** unchanged.
- **Explanation:** a new first paragraph marks the guess ("Your guess was (a), and it was right / not this time: ...", Decision 2 default). The annihilation paragraphs, the "turned into" wording and "What was shown, and what was not" stay. **The light and helium paragraphs appear when those processes have been run in Part 2**, with a plain note until then.
- **PET paragraph (CHANGED):** now cites NIBIB (two gamma-ray photons in opposite directions) and says that the 511 keV is the electron's rest energy (CODATA: 0.510 998 950 69 MeV), which is the light each carries when the particle and its antiparticle start at rest.
- **Sun paragraph (CHANGED):** "The Sun fuses about 600 million tons of hydrogen every second (NASA). Its power, about 3.8 × 10²⁶ watts, divided by c², is about 4 million tons of mass every second (NASA works it out as 4.4 × 10⁹ kg). 4 ÷ 600 is about 0.7 percent." The 0.7 percent is the ratio of the two NASA numbers, not a figure NASA gives.
- **"A note about real life" (CHANGED, §20):** the claim that pair creation needs "a nearby nucleus" is real physics but unsourced here. Replaced by what follows from the rules: a single pulse has a system mass of 0, below the 2 a pair needs, so it cannot make a pair alone; this experiment used two pulses. The nucleus remark is recorded as a gap, not stated.

---

## 8. Physics-module additions (appended; none changes existing physics)

- `SECTION_C_SPEED`, `SECTION_C_PASSING_SPEED`: the fixed case.
- `reactionGuessMarker(guess, sumBefore)`: position (in ledger units) and label of the white tick.
- `realReactionAnswerFor(result)`: what the run shows (less, same or more), for the tutor.
- `reactionCheckUpRows(result)`: the seven check-up rows.
- `CODATA_*` constants and `heliumBindingEnergyFromCodata()`; `heliumCheckUp(result)`: the helium comparison row.
- `sunMassLossFraction(...)`: the 0.7 percent as a computed ratio.
Tests: each answer puts its tick on its own side of the before bar; the tick never sits on the real after value for any annihilation preset; the check-up reads "the same" for every process and preset; the helium reference from CODATA agrees with the page's value within the rounding of the page's masses; the Sun fraction is about 0.7 percent.

---

## 9. "Want to know more?" and the "Words and formulas" box

**Links checked on 2026-11-21 (fetched and read in a browser):**

| Link | What the learner finds | Status |
|---|---|---|
| CERN, "Antimatter" (home.cern/science/physics/antimatter/) | Plain page: every particle has an antiparticle with the same mass and opposite charge; they are made in pairs and annihilate on contact, leaving energy | **Read.** No date shown. |
| NIBIB (US National Institutes of Health), "Nuclear Medicine" (nibib.nih.gov/science-education/science-topics/nuclear-medicine) | Plain page on PET: a positron meets an electron, they annihilate, and two gamma-ray photons shoot off in opposite directions | **Read.** "Reviewed September 2025". Does not state 511 keV. |
| NASA Goddard, "Cosmicopia: Ask Us: Sun" (science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sun.html) | Q&A page: the Sun fuses about 600 million tons of hydrogen per second; its power divided by c² is about 4 million tons per second | **Read.** An archived Goddard page ("The Attic"); answers dated 2000 to 2010, none for these two answers. |
| NIST, CODATA values (physics.nist.gov/cgi-bin/cuu/Value?malc2mev, ...?mpc2mev, ...?mnc2mev, ...?mec2mev) | The measured masses (as energies) of the alpha particle, proton, neutron and electron | **Read.** 2022 CODATA recommended values. A table of numbers, not plain. |

**Gaps (§29 rule 3(c)), searched 2026-11-21:**
- *Plain official page on binding energy and mass defect:* **no plain official page found.** Candidates found and not read: DOE-HDBK-1122 Module 1.04 (energy.gov; a study guide, not for a general reader), IAEA and NRC PDFs. Not linked; the introduction defines the terms.
- *Plain official page on the electron-volt:* **none found.** Search returned only CERN course PDFs and code documentation (indico.cern.ch), none read. Not linked.
- *Original papers:* Anderson (1932, positron) and Dirac (1928) not fetched; the helium-4 binding energy "28.295674 MeV" in the module has no read source (only CODATA masses were read, which give 28.2956). The page's check-up uses the CODATA-derived value.
- *Pair creation needing a nucleus:* unsourced, removed from the tutor (section 7).
- The module's solar luminosity 3.828 × 10²⁶ W is unsourced; NASA's page gives 3.8 × 10²⁶ W, and the tutor now says "about 3.8 × 10²⁶".
- *LHC 6.5 TeV:* not in Section C (Section A's draft handled it).

**"Words and formulas" box.** Present entries kept. **CHANGED:** "Energy released" appears only after the first Run (it would give the prediction away). **NEW entries:** "Mass ledger: four bars on one scale: the sum of the rest masses and the system's mass, before and after", "Your guess tick (Section C): a white tick on the ledger that stands for the answer you chose. It has no size of its own."

---

## 10. Decisions and notes for the owner

1. **The helium reference.** Default taken: 28.2956 MeV worked out from CODATA masses (read). The module's older "28.295674" has no read source and is not shown.
2. **Where the guess tick sits** (half, equal, one and a half times the "before" bar), a marker only. Alternative: three labelled marks.
3. **Tutor marks the guess** as "right / not this time" (Section A's default).
4. **The "needs a nearby nucleus" remark removed** from the tutor (unsourced).
5. **Part 3 shows Part 1's run only.** The other processes have pictures and tutor paragraphs but no tables (default 6), except the helium check-up.
6. **"Energy released" and "it is not the sum of the pieces' masses"** moved to Part 3.
7. **Sun paragraph:** 0.7 percent is stated as the ratio of NASA's two numbers; NASA says "tons" and the page said "tonnes", now "tons" (NASA does not say which).
8. **No prop change** is needed in `EnergyMomentumExperiment.tsx`.

## Not checked
Narrow widths, keyboard use and other browsers. The helium process's drawing code was only re-read for text labels. Nothing was committed.

---

## Update of 2026-11-22: a second prediction, about the passing observer; and "Light turns into particles, in more detail"

Requested by the owner: in Part 1, Picture 2 shows a passing observer, but the prediction offered no choice about that observer. The owner approved the question, its two choices and "required before Run". Status: **built, wording for the owner's approval (CLAUDE.md §28.1).** Built one step at a time: physics and tests; the two prediction blocks and Run; the lower panel of Picture 2 with its caption and the introduction lines; Part 3; the tutor. The same fix was made in Section B (see `05-draft-wording-section-b.md`, "Update of 2026-11-22").

### A. The second prediction (wording as built; approved by the owner on 2026-11-22)

> **Make a prediction (2 of 2): the passing observer.** Now think about Picture 2. The passing observer measures each piece's energy and momentum for themselves, so their numbers differ from the lab's. They work out the mass of the whole system from their own total energy and total momentum, with the formula from Section B: M = √(E_total² − (P_total c)²). They do this once before the particle and its antiparticle meet, and once after. Is the mass of the whole system the same before and after, for this observer?
> - (a) The same before and after.
> - (b) Not the same before and after.

- The first prediction is retitled "Make a prediction (1 of 2): the total of the separate masses". **Run stays disabled until both are chosen**; the note reads "Choose both predictions above to run the experiment." The Run button reads "Run (lab view, then passing observer)" before it is pressed.
- Both guesses lock together at Run and Start over clears both (enabled as soon as either guess is chosen).
- **"What Run will show"** (new paragraph under the first question): "Pressing Run plays this one meeting twice. **Picture 1** is the lab's view, where the particle and its antiparticle move toward each other at 0.6c. **Picture 2** is the same meeting as a **passing observer** sees it: a second person who moves steadily past the lab, along the same line, at +0.3c to the right (think of someone watching the same meeting from a train that is passing by). You make two predictions before you press Run: the first is about the total of the separate masses, and the second is about what the passing observer finds for the mass of the whole system. You will see both pictures."
- Nothing says whether the two system masses are equal (§12).

### B. Introduction lines changed

- **"What you will do"** (end of "The question"): adds "You are also asked what a passing observer finds for the mass of the whole system."
- **Picture 2 bullet under "What happens":** adds "Under it, a lower panel works out the mass of the whole system for this observer, before and after the reaction, as two bars on their own scale."
- **"Your job":** "...You make two predictions: choose one of the three answers about the total of the separate masses, and one of the two answers about the passing observer. Both must be chosen before you can press Run. You are not graded. **Your predictions never change the pictures or the tables.** They come from the physics. Your first guess is drawn on the mass ledger in white, and your second on the passing observer's system mass, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you try other processes and settings. Those choices *do* change the drawings, but not your predictions. If you want to change your predictions, press Start over."
- **Part 1 lead:** "You will predict how the total of the masses of the pieces compares before and after a particle and its antiparticle meet, then guess what the passing observer finds for the mass of the whole system, press Run and watch the meeting from two points of view. Your guesses are drawn on the real bars in white. They never change them."
- **Note under the picture before Run:** "Picture 2, the passing observer's view, the mass ledger, and your two white guesses (one on the mass ledger, one on the passing observer's system mass), appear in this picture when you press Run."

### C. The second guess marker (Rule A; a lower panel of Picture 2)

The question lives in the passing observer's system mass, which had no picture, so it gets its own panel under Picture 2, on its own scale and with its own title: **"Picture 2, lower panel: the passing observer's mass of the whole system"** (subtitle: "Their own scale (in rest energies). A longer bar is a bigger mass."). The picture is taller in Part 1 only; Part 2's drawings are unchanged.

| What | How it is drawn |
|---|---|
| Dashed line "zero" | A mass of zero; the bars start from it |
| Solid purple bar, "Before: the mass of the whole system" | The mass this observer finds before the reaction, with its number (2.50 in the fixed case) |
| Outlined purple bar, "After: the mass of the whole system" | The mass after the reaction, with its number (2.50) |
| (a) The same before and after | White tick **on the "after" bar at the place where the solid bar ends**, box "the same before and after" |
| (b) Not the same before and after | White tick **at half that length**, box "not the same before and after" |

- Drawn only once the passing observer's pieces after the reaction are drawn (same moment for the drawing and the caption); before then the picture says "The two masses are drawn here once their pieces after the reaction are drawn."
- Thick tick, joined by a line to a large YOUR GUESS box; guess only, never "right", "wrong" or "matched"; each tick is **only a marker** (a yes or no has no size of its own) and the caption says so. Solid and outlined bars make the two quantities to compare visibly distinct.
- Every number comes from the physics module (`passingSystemMassOf`, `passingSystemMassGuessMarker`).

### D. Caption of the lower panel (wording as built; appears only once the panel is drawn)

> **Picture 2, lower panel: the passing observer's mass of the whole system.** It appears under the purple picture once the passing observer's pieces after the reaction are drawn. It has its own scale, so its bars cannot be compared with the mass ledger in Picture 1. It asks the question of your second prediction.
> - **The dashed line, "zero".** A mass of zero. The bars start from it, and a longer bar means a bigger mass.
> - **The solid purple bar.** The mass of the whole system *before* the reaction, as this observer works it out from their own total energy and total momentum × c, with the formula M = √(E_total² − (P_total c)²) from Section B.
> - **The outlined purple bar.** The same mass *after* the reaction. It is outlined instead of solid so that the two can be told apart.
> - **The numbers beside the bars.** Each mass in rest energies, one rest energy being the rest energy of one particle.
> - **The white tick and the YOUR GUESS box** (once a guess is chosen). This is the answer you chose to the second prediction, drawn across the outlined bar. It is **only a marker**: it has no size of its own. If you chose "the same", it sits where the solid bar ends. If you chose "not the same", it sits at half that length. It does not change either bar.
>
> **What to look for in the lower panel** (Look at / What it means / Why it matters, with the real numbers from the module):
> 1. **Look at** the solid bar. **What it means:** the mass this observer works out from their own total energy (2.62) and total momentum × c (−0.79) before the reaction: the square root of 2.62² − (−0.79)², which is 2.50. **Why it matters:** it is the "before" side of the question of your second prediction, using only their own numbers.
> 2. **Look at** the outlined bar. **What it means:** the same calculation after the reaction, with their total energy and total momentum × c after it: 2.50. **Why it matters:** setting its length beside the solid bar answers the question of your second prediction. The page does not say whether they are equal.
>
> **Where the real picture comes from.** *Calculated here:* both masses, from the passing observer's total energy and total momentum (found by the rule of Section A) and the formula of Section B. *Measured:* nothing on this page. *Imagined for the question:* the particles and the observer.

No verdict on whether the bars are equal (§12, §13).

### E. Part 3 (wording as built)

- The block is now "Your predictions, beside the results", with "**Your first guess:**" (its "Where its numbers appear" now names its row: the row "Sum of the rest masses" in the first table, tagged "your guess", and the first two bars of the mass ledger) and a new paragraph: "**Your second guess:** *(its label)* **The question it was about:** when the passing observer works out the mass of the whole system from their own total energy and total momentum, is it the same before and after the reaction? **Where its numbers appear:** the row "The system's mass, found by the passing observer" in the table "The system's mass", which is tagged "your guess", and the white tick on the outlined bar in the lower panel of Picture 2. It shows only what you chose."
- A "your guess" tag now sits on the row "The system's mass, found by the passing observer" as well as on "Sum of the rest masses".
- The opening note and the Part 3 lead say "predictions" and "your two guesses". No table number changes.

### F. Part 4, the tutor (wording as built)

- **Compare** (extended; still three questions): "... What do you notice? Then look at the white tick on the outlined bar in the lower panel of Picture 2. You predicted that *(the passing observer would find the mass of the whole system the same / not the same before and after)*. How does that guess compare with the two purple bars?" Not marked here. (As before, this step already states the real numbers of both totals, in the same sentence as for the first guess.)
- **Explanation, paragraph "A system of lights has mass":** now opens with the mark for the second guess, the only place it is marked: "Your second guess was (a), and it was right: the passing observer found a system mass of 2.500 before and 2.500 after, which is the same." or "... it was not this time: ...". Same phrasing as the first guess ("right / not this time", decision 3).

### G. Physics-module additions (all in `energyMomentum.ts`; no existing physics changed)

- `PassingSystemMassGuess` (`'same' | 'different'`), `PassingSystemMassGuessMarker`.
- `passingSystemMassOf(result)`: the system mass the passing observer finds before and after (2.5 and 2.5 in the fixed case, equal to the lab's).
- `passingSystemMassGuessMarker(guess, result)`: "same" at the real "before" mass, "different" at half of it; labels start "YOUR GUESS". Depends on the guess and on the "before" mass only, so it never changes a real value.
- `realPassingSystemMassAnswerFor(result)`: "same" if the two masses agree within the relative tolerance used by the check-up, else "different". Used by the tutor to mark the guess.
- Tests C14 to C17 (physics): "same" for the fixed case, every annihilation preset and passing speeds from −0.6c to +0.6c; a changed system mass would read "different"; tick positions and labels; a marker call does not change the result. Render tests in `EnergyMomentumSectionC.test.tsx`: the milestones, panel timing, numbers and label from the module, two tick positions, no panel in Part 2's drawings, the caption, the first screen, Part 3's second guess and tag, and the tutor's prompt and marking.

### H. "Light turns into particles, in more detail" (wording as built; owner-approved on 2026-11-22)

A collapsed panel under the three situation bullets in "The question", with the owner's approved text: the short idea; (1) energy and mass are two forms of the same thing (dollars and euros, rate c²); (2) why it costs so much (electron rest energy 0.511 MeV, a pair 1.022 MeV, visible light about 2 or 3 eV, several hundred thousand times too weak); (3) why a pair, not one particle (charge conservation, −1 + 1 = 0); (4) how much energy, in the experiment's units (a four-row table: each beam less than 1, exactly 1, 2 and 5; at 2 the pair flies off at √(1 − 1/2²) = 0.866c, at 5 at 0.980c); (5) is it real (Fermi's tungsten converter, the atmospheric shower, SLAC E144's light-hits-light route, the reverse used by PET scans); (6) what the experiment shows and does not show.

- **Deliberately left out of the page:** why one beam alone cannot make a pair (it uses the finding that the system's mass is conserved, which would give away a Part 3 result, §12; it stays in the tutor); how the sum of the separate masses changes; the 1932 positron discovery (no source read); a "needs a nearby nucleus" remark (as decision 4).
- **The 1.022 MeV and 0.511 MeV figures** are stated as what this section's rules give, not as a sourced fact (no plain official page that gives the minimum energy was read).
- **New links** (added to "Want to know more?"; fetched and read on 2026-11-22):

| Link | What the learner finds | Status |
|---|---|---|
| NASA, "Fermi Gamma-Ray Space Telescope Learning Center: Large Area Telescope" (imagine.gsfc.nasa.gov/observatories/learning/fermi/mission/lat.html) | Plain page: a gamma ray hits a layer of tungsten and creates an electron and positron pair; tracking the pair gives the gamma ray's direction and energy | **Read, 2026-11-22.** Page last updated 11 Dec 2018. No threshold, no nucleus, no "the light disappears" on the page |
| NASA, "Gamma-ray Detectors: More Information" (imagine.gsfc.nasa.gov/observatories/technology/gammaray_detectors2.html) | Marked "Advanced", harder: how telescopes use pair production; the air shower in the atmosphere | **Read, 2026-11-22.** Text updated September 2018. No threshold, no nucleus |
| SLAC, "Experiment E144 Home Page" (slac.stanford.edu/exp/e144/e144.html) | The experiment's own page, popular style: an electron hits a laser beam and makes a gamma ray, which hits four or more laser photons and makes a pair | **Read, 2026-11-22.** Last modified 17 Jan 1998. Its route is not the page's simple two-beam picture (said in the link text). No positron count or journal reference on the page |

- **Gaps (§29 rule 3(c)), searched 2026-11-22:** no plain official page was read that gives the minimum energy for pair creation. Candidates that could not be read are **not linked**: Symmetry magazine, "E=mc²" (Cloudflare error, "Edge IP Restricted"); Fermilab, "Inquiring Minds: E=mc²" (403; the browser tool also refused to read the domain); APS News, "Discovery of the Positron" (403, then a bot check, which was not bypassed); the Nobel Prize page on Carl Anderson (403; page reading refused). The SLAC report SLAC-R-678 is a scanned PDF with no readable text, so the original paper for E144 was not read and its citation is not stated.

### I. Decisions and notes for the owner

1. **Question chosen:** the passing observer's system mass, same or not, recommended and approved. **Choices:** two, approved. (Alternative: a three-way "less after / the same / more after".)
2. **Marker offset:** "not the same" at half the "before" mass (default). Alternative: a distance that is a fixed amount.
3. **Both guesses lock at Run** (default, as the owner asked for "required before Run").
4. **Old question in the guess block:** the first guess's "where its numbers appear" now names its row, because the page has two tagged rows.

### Checked in Chrome (2026-11-22, `http://localhost:5173`, real 12-second playback)
- **Gating:** Run disabled with no guess, still disabled with one, enabled with both; both lock at Run ("Run (done)"). Start over clears both guesses, disables Run, hides Parts 2 to 4 and removes the lower panel.
- **Lower panel:** appears once the passing observer's pieces after the reaction are drawn; solid "before" bar 2.50, outlined "after" bar 2.50; two YOUR GUESS boxes in the picture. Cases looked at: (c) more with (b) not the same (tick at half length, box fits); (a) less with (a) the same (tick exactly at the end of the solid bar).
- **Part 3:** both guesses shown, exactly two "your guess" tags, one on "Sum of the rest masses" and one on "The system's mass, found by the passing observer".
- **Tutor:** all three questions stepped through; the compare prompt names both ticks; the explanation marks the first guess ("Your guess.") and the second ("A system of lights has mass.") in both the "right" case ((a) and (a)) and the "not this time" case ((c) and (b)).
- **The "Light turns into particles, in more detail" panel:** collapsed by default, opens, shows the table and the three new links (each opens in a new tab; the pages were not opened from the page).

### Not checked
A real narrow window (the window resize did not change the viewport; the Section B note describes forcing a picture to 340 px, where the text becomes small, a chapter-wide question); the sidebar row below 850 px; keyboard use; other browsers; the remaining guess pairs ((b) exactly the same, (a) less with (b), (c) with (a)); the three links were not opened from the page; no commit had been made when this note was written.

