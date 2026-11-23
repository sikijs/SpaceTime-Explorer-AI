# Draft wording: Spacetime Geometry Experiment 6, Section B (Decay)

**Status:** DRAFT for the owner's approval, written 2026-11-23 (CLAUDE.md §28.1). Nothing has been built, no code or specification has been changed, and nothing is committed. This is **Section B only**; Section A's draft is `06-draft-wording.md`. The owner's "all defaults" answers of 2026-11-22 to the twelve questions of `06-gap-report.md` apply, and the owner's request of 2026-11-23 adds: **a detailed introduction, pictures where they help, and links to the latest resources.**

**Source of the numbers:** the fixed case r = 0.25 with a passing observer at +0.3c, worked from the formulas of `src/physics/makingNewParticles.ts` (`runDecay`). **Checked by hand on 2026-11-23; to be checked against the module in Step 3, which will add tests.** An attempt to print the module's values with a throw-away test showed no output, so nothing here is "module-checked" yet.

| r = 0.25, passing observer at +0.3c (units: the parent's rest energy = 1) | Lab | Passing observer |
|---|---|---|
| Parent: energy, momentum × c | 1.0000, 0 | 1.0483, −0.3145 |
| Each piece before the passing observer's view: E, pc, speed | 0.5000, ±0.4330, 0.866c | n/a |
| The two pieces as that observer finds them: energy | 0.5000 and 0.5000 | 0.3880 and 0.6603 |
| The two pieces as that observer finds them: momentum × c | +0.4330 and −0.4330 | +0.2967 and −0.6112 |
| Total energy after / total momentum × c after | 1.0000 / 0 | 1.0483 / −0.3145 |
| System's mass of the pieces | 1.0000 | 1.0000 |
| Sum of the pieces' rest masses (2r) | 0.5000 | 0.5000 (a rest mass is the same for everyone) |
| Mass given up (1 − 2r) | 0.5000 | 0.5000 |
| Each piece's energy of motion (E − r) | 0.2500 (together 0.5000) | n/a |

---

## 0. Layout (default, from questions 1 to 3 and 10)

Same as Section A. Heading: **"Section B: Decay, what happens when a particle comes apart?"** Section B opens when the learner finishes Section A's tutor, or by the skip link. Inside Section B, Parts 2 to 4 appear after the first Run. Part 1 is fixed on **r = 0.25 and a passing observer at +0.3c**; Part 2 holds the controls (r and the passing observer's speed). The guesses lock at Run; **Start over** is always visible and greyed out until there is something to clear.

The four Part leads (learner-facing; Part 1's lead gives no answer, §12):

- **Part 1: Predict, then watch.** "What we are about to do. You will predict how the masses of the two pieces of a decay add up compared with the mass of the particle that decayed, then guess what a passing observer finds for the mass of the whole system, press Run and watch the decay. Your guesses are drawn on the real bars in white. They never change them."
- **Part 2: Now try it yourself.** "What we are about to do. You choose how heavy each piece is (r) and how fast the passing observer moves, and press Run these settings. These choices change the drawings. Your predictions do not. They are trial values for an imagined particle, and they do not say that a real particle is like that."
- **Part 3: The results.** "What we are about to do. Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your two guesses beside the real results."
- **Part 4: The tutor.** "What we are about to do. The tutor asks you three questions, one at a time, about what you saw and how your guesses compare with the bars, then goes through the explanation and two real examples."

---

## 1. Introduction

Rule for this introduction (§12): everything below explains *what decay is, how to bookkeep it, and why it is worth studying*. Nothing in it says how the pieces' masses compare with the parent's, which is Prediction 1, and no real example with masses appears before the run (those are in the tutor, section 6). The facts on lifetimes and half-lives are about *when*, not *how heavy*.

### 1a. "The question" (CHANGED; replaces the paragraph, no answer)

> **The question.** In Section A we made a new particle by smashing particles together, and we asked how much of the collision's energy could be spent. Now we run the idea backward. Can a particle turn into other particles on its own, with nothing hitting it? If it can, what has to stay the same, what is allowed to change, and what must the pieces be like?

### 1b. "What a decay is" (NEW; detailed, with Picture B1)

> **A particle that comes apart.** Some particles do not last. After a while, with nothing touching them, they turn into other particles. This is called *decay*. The particle before is the *parent*, and what it turns into are the *pieces* (physicists say "decay products"). A decay is not a collision: nothing hits the parent. Think of a soap bubble that pops or a balloon that bursts. Nothing hit it, and the pieces were not separate things waiting inside; the one thing became several. (The comparison only goes so far. A real parent is not a bag with a skin, and its pieces did not exist as pieces beforehand.)
>
> **Decay is happening all around us.** Radioactive atoms in rock, in bananas (which contain a little radioactive potassium) and in the Earth's interior are decaying all the time. Machines like the Large Hadron Collider make many unstable particles, and many of them decay in a tiny fraction of a second. **Different particles last for very different times.** The Particle Data Group, the international group that collects measurements of particles, lists the neutral pion as lasting about 8.4 × 10⁻¹⁷ seconds on average, and the evaluated nuclear data for uranium-238 give a half-life of about 4.47 billion years (read 2026-11-23, section 7). Those two times differ by about 33 orders of magnitude, but both are decays of one thing into pieces.
>
> **Why we cannot say when a single particle will decay.** Each particle decays at a random moment. Think of popcorn in a hot pan: you cannot say which kernel will pop next, but you can say that about half will have popped after some time. For a large number of identical particles the *half-life* is the time after which about half of them have decayed. For one particle, only the chance can be given. **This page does not model when a decay happens, only what a decay must be like if it does.**
>
> **What must stay the same.** Experiment 5 gave two rules that hold for every process, and decay is no exception. (1) *Total energy is conserved*: the total before equals the total after. (2) *Total momentum is conserved*: the total before equals the total after. Momentum is the "amount of motion" of something, and it has a direction. If the parent sits still, its momentum is zero, so the pieces' momenta must also add up to zero. Two ice skaters standing still back to back and pushing off each other show it: they glide in opposite directions, and the "oomph" of one cancels the other's. In a decay at rest, two equal pieces move apart in opposite directions, with equal energies. Here we call each piece's energy E and its momentum multiplied by c "pc", as in Experiment 5.
>
> **Our unit.** In this section the parent's rest energy is 1. Each piece's mass, *r*, is a fraction of the parent's mass. For example, r = 0.25 means each piece has a quarter of the parent's mass. The case r = 0 means two pulses of light, which have no mass.
>
> **Why this is worth doing.** Decay is how nature reads the bookkeeping rules of Experiment 5. It tells which changes can happen and which cannot, and the same bookkeeping is how physicists identify particles in a detector: they add up the energy and momentum of the pieces and check that the system's mass is the same as what they expect.

### 1c. "The formulas we need" (CHANGED, §12: the r = 0.3 example leaves the introduction and moves to the caption of Picture 2 once drawn)

> - **The pieces' energy.** The parent has a total energy of 1 and a total momentum of 0. Two equal pieces that move apart in opposite directions must share the energy equally, so each has E = ½.
> - **The pieces' momentum.** For one piece, E² − (pc)² is its mass squared, r² (Experiment 5). With E = ½ this gives pc = √(¼ − r²). A piece's speed is pc ÷ E. *What it does not mean:* it does not say that a decay will happen, only what the pieces would be like if it did.
> - **Mass given up:** the parent's mass minus the sum of the pieces' rest masses, 1 − 2r.
> - **The system's mass of the pieces:** M = √(E_total² − (P_total c)²), as in Experiment 5.

(The worked example r = 0.3, E = ½, pc = 0.4, speed 0.8c leaves the introduction and appears in the caption of Picture 2, once drawn. It does not answer Prediction 1, but it shows a masses total of 0.6, which the caption's old text pointed at.)

### 1d. "What happens", "Your job" and "What we assume" (CHANGED)

- **What happens:** "A parent particle sits at rest in the lab, and then it decays into two equal pieces. When you press Run, the pictures play in stages: (1) the lab's view, where the parent splits and the pieces move apart, each labelled with its energy, its momentum × c and its rest mass; (2) the same decay as a passing observer measures it, an observer who moves along the same line at +0.3c; (3) the mass ledger, a set of bars that compares the masses; and (4) a note that a decay is shown only if energy and momentum allow it."
- **Your job:** "Predict first. Part 1 uses r = 0.25 and a passing observer at +0.3c. You make two predictions: how the masses of the two pieces added up compare with the parent's mass, and whether the passing observer finds the same system's mass of the pieces as the lab. Both must be chosen before you can press Run. You are not graded. **Your predictions never change the pictures or the tables.** They come from the physics. Your first guess is drawn on the ledger's grey bar in white and your second on the passing observer's bar, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you choose other values of r and other speeds. Those choices *do* change the drawings, but not your predictions. If you want to change your predictions, press Start over."
- **What we assume:** unchanged ("Everything moves along one line. The parent decays into exactly two equal pieces. Only energy and momentum are tracked, and whether and when a decay happens is not modeled.").

### 1e. Pictures in the introduction (NEW, our own drawings; they show no masses and no comparison)

**Picture B1 (in the page): "A decay: nothing hits the parent".** Left to right: a sky-blue circle at rest labelled "the parent, at rest" under a small tag "total momentum: 0"; a yellow ring labelled "the decay (nothing hit it)"; two circles of **equal size** with arrows pointing away from each other, labelled "piece" and "piece". The two circles' size means nothing here (the caption says so), so no comparison with the parent can be read from the picture. Beneath: two short "bookkeeping" lines drawn as bars of equal length: "total energy before: 1" and "total energy after: 1" (the same length), and a pair of arrows labelled "+p" and "−p" with "total momentum after: +p − p = 0". Caption "How to read this drawing": names every shape; says the arrows mean motion and a longer arrow a faster piece; defines "decay", "parent", "pieces", "momentum"; "What to look for" in three parts (Look at the two bars of equal length: they mean the total energy is 1 before and after; it matters because every decay must obey this rule. Look at the "+p" and "−p" arrows: the momenta are equal and opposite; it matters because the parent had none, so the pieces must cancel. Look at the ring: nothing arrives from outside. It means a decay is not a collision.) "Where the real picture comes from": calculated, nothing; measured, nothing; imagined, the whole sketch.

**Picture B2 (in the page): "How long do particles last?".** A horizontal log-scale ruler, unlabelled by answer: a row of marks for "very short" (about 10⁻¹⁷ seconds, "neutral pion, mean life 8.43 × 10⁻¹⁷ s, Particle Data Group"), "a year" and "billions of years" (about 4.47 × 10⁹ years, "uranium-238, half-life, NNDC"). The caption explains "half-life" with the popcorn comparison, says a log ruler makes each step ten times longer than the last, and says the page does not model when. Look at the gap between the two marks (about 33 steps of ten): different particles last for wildly different times, so a decay can look instant or can take longer than the Earth's age (4.5 billion years: general knowledge, to be sourced if used); it matters because this experiment's rules apply to both. "Where the real picture comes from": measured, the two times (PDG listing; NNDC evaluation); calculated, the positions on the ruler; imagined, nothing. *(Optional: if the owner prefers one picture, B2 can be dropped.)*

*Alternative:* official images (CERN, Particle Adventure). **Not used:** none were checked for reuse terms; the Particle Adventure page does not state a publisher in the text read.

---

## 2. The predictions (Part 1)

**2a. Prediction 1 (the question's wording changes only to name the fixed case; the three answers are unchanged).** "A particle at rest splits into two equal pieces. Each piece has 0.25 times the parent's mass. Compare the total of the pieces' rest masses with the parent's mass. How do they compare?" (a) The pieces' masses add up to less than the parent's mass. (b) The same as the parent's mass. (c) More than the parent's mass. *(Titled "Make a prediction (1 of 2): how the masses compare".)*

**2b. Prediction 2 (NEW, from question 4).**

> **Make a prediction (2 of 2): the passing observer.** Now think about the purple picture, where a passing observer who moves at +0.3c watches the same decay. They measure each piece's energy and momentum for themselves, and they add those up, and they work out the system's mass of the two pieces with the same formula, M = √(E_total² − (P_total c)²). The lab did the same with its own numbers. Is the system's mass the passing observer finds the same as the lab's?
> - (a) The same as the lab's.
> - (b) Not the same as the lab's.

**2c. Around the Run button.** "Run (the lab, then the passing observer)", disabled until both are chosen ("Choose both predictions above to run the experiment."). A "What Run will show" paragraph (as in Experiment 5): "Pressing Run plays one decay twice. **Picture 1** is the lab's view. **Picture 2** is the same decay as a passing observer measures it. Then the **mass ledger** fills in." After Run: "Your prediction is locked while you try other settings. To change it, press Start over." "Run again" and the change-the-guess-any-time behaviour go.

---

## 3. The guess marks (Rule A)

**3a. Guess 1 (the masses), on the mass ledger's grey bar.** The answer lives in the grey bar ("Sum of the pieces' rest masses") against the sky-blue "The parent's mass" bar. The answers have no size of their own, so each is **only a marker**: a white tick on the grey bar's row, joined by a line to a large white YOUR GUESS box. Positions are measured against the parent's bar (length 1) and never depend on the result.

| Answer | White tick position on the grey bar's row | Box text |
|---|---|---|
| (a) less | at 0.75 of the parent's bar | "YOUR GUESS: less than the parent's" |
| (b) the same | at 1.00 (the end of the parent's bar) | "YOUR GUESS: the same as the parent's" |
| (c) more | at 1.25 of the parent's bar | "YOUR GUESS: more than the parent's" |

0.75 is used rather than a simple half, so that "less" never lands where the real bar happens to end (0.50 at r = 0.25). The caption says that the tick marks which answer you chose and is not a size. Drawn once the ledger is drawn. Guess only; never "right", "wrong" or "matched".

**3b. Guess 2 (the passing observer's mass), on the ledger's passing-observer bar.** That bar already exists in the ledger ("The system's mass of the pieces, as the passing observer finds it", purple) beside the lab's (sky blue), so no new panel is needed (A5). White tick: "the same" at the end of the lab's bar (1.00); "not the same" at 0.50; box "YOUR GUESS: the same as the lab's" / "YOUR GUESS: not the same as the lab's". Only a marker. Drawn once the ledger is drawn.

**3c. "Where the real picture comes from" (under the pictures and the ledger).** *Calculated here:* every number and bar, from the rules of Experiment 5. *Measured:* nothing on the pictures (the tutor's real examples are the exception, and are linked). *Imagined for the question:* the parent and pieces (a made-up particle with r = 0.25) and the observer.

---

## 4. Captions (one per picture; each look-for item in three parts; items drawn only once their feature is drawn)

Pictures: **B1** and **B2** (the introduction), **Picture 1** (the lab), **Picture 2** (the passing observer) and the **mass ledger**. Each keeps today's "How to read": every shape named, "0.5c is half the speed of light" defined, what appears when. Changes:

- **Worked moment (moved, after the ledger is drawn):** "Say r = 0.3, which is not one of the buttons. Each piece has energy 0.5 and momentum × c of √(0.25 − 0.09) = 0.4, so it moves at 0.4 ÷ 0.5 = 0.8c. The two rest masses add up to 0.3 + 0.3 = 0.6."
- **What to look for** (rewritten; this page's real r = 0.25 numbers; no verdict):
  - **Picture 1.** *Look at* the yellow ring and then the two pieces. *What it means:* the parent splits into two pieces with E = 0.50, pc = +0.43 and −0.43, each moving at 0.866c. *Why it matters:* equal and opposite momenta cancel, as the parent's total momentum of 0 requires.
  - **Picture 2.** *Look at* the numbers under the two pieces. *What it means:* the passing observer finds energies of 0.388 and 0.660 and momenta of +0.297 and −0.611, not the lab's 0.50 and ±0.43. *Why it matters:* observers can disagree about energy and momentum, which is why the question is about the system's mass.
  - **The grey and sky-blue bars.** *Look at* the grey bar against the sky-blue parent bar. *What it means:* the pieces' rest masses add up to 0.50, and the parent's mass is 1. *Why it matters:* it is the question of your first guess (the page does not say which is bigger; the tutor does).
  - **The sky-blue and purple "system's mass" bars.** *Look at* the two bars. *What it means:* the lab finds 1.000 and the passing observer 1.000. *Why it matters:* it is the question of your second guess (the page does not say whether they are equal).
  - **The line of words under the bars.** *Look at* "Mass given up: 1 − 0.50 = 0.50". *What it means:* that is the parent's mass minus the pieces' rest masses. *Why it matters:* it is the quantity the tutor asks about.

---

## 5. Results (Part 3), Rule B

**5a. The guesses beside the results** (guess only, tagged): "**Your first guess:** *(its label)* **The question it was about:** how do the pieces' rest masses added up compare with the parent's mass? **Where its numbers appear:** the row 'The pieces' rest masses added up (2r)' in the table below, tagged 'your guess', and the grey bar of the ledger. **Your second guess:** *(its label)* **The question it was about:** is the system's mass the passing observer finds the same as the lab's? **Where its numbers appear:** the row 'As the passing observer finds it' in the last table, tagged 'your guess', and the purple bar of the ledger." It shows only what you chose.

**5b. A check-up** (expected against found, from the module's own physics; no outside number):

| Check | What we would expect | What was found (r = 0.25, +0.3c) | Reading |
|---|---|---|---|
| Lab: total energy, before and after | 1 | 1.0000 and 1.0000 | the same |
| Lab: total momentum × c, before and after | 0 | 0.0000 and 0.0000 | the same |
| Passing observer: total energy, before and after | the same number | 1.0483 and 1.0483 | the same |
| Passing observer: total momentum × c, before and after | the same number | −0.3145 and −0.3145 | the same |
| The system's mass of the pieces, lab and passing observer | the same number | 1.0000 and 1.0000 | the same |
| The system's mass of the pieces against the parent's mass | 1 | 1.0000 | the same |
| The pieces' energies of motion added up against the mass given up | 0.5000 | 0.2500 + 0.2500 = 0.5000 | the same |

For the neutral pion and uranium-238, **no check-up row**: a row needs a published value to compare, and the tutor's figures are quoted, not computed by the module. (If the owner wants a pion row, it would read "each photon carries half the pion's mass: 67.49 MeV, from the PDG mass of 134.9768 MeV", which is the module's own physics applied to a published mass; the PDG page was read through a summary and should be eyeballed first.)

**5c. "What this table tells us"** under each table (what it is; what it means with these numbers; why it matters; a daily-life example where it helps). Four notes:
1. *The masses.* What it is: the parent's mass, the pieces' rest masses added up and the mass given up. What it means: 1, 0.50 and 0.50. Why it matters: it is where Prediction 1's numbers live. The page does not say which answer is right (the tutor does).
2. *The pieces, as the lab / as the passing observer measures them.* What it is: each piece's speed, energy, momentum × c and rest mass. What it means: the lab finds 0.50 and ±0.43 at 0.866c; the passing observer finds different energies and momenta, but each piece's rest mass is 0.25 for both. Why it matters: rest mass is a property of the piece, the other numbers depend on who measures.
3. *The totals before and after.* What it is: total energy and total momentum × c before the decay (the parent) and after it (both pieces). What it means: a difference of 0.0000 in every row. Why it matters: conservation held for both observers. Daily-life example: a bank that moves your money from one account to two still shows the same total.
4. *The system's mass.* What it is: M worked out from the totals. What it means: 1.0000 for both observers, before and after. Why it matters: the system's mass is the number every observer agrees on, which is why it is the number to compare. (The mechanism stays with the tutor.)

**No table follows the controls (default 6).** The "No decay can happen" case (r = 0.6) keeps its short table and gets its own note: "The pieces' rest masses add up to 1.2, more than the parent's 1; nothing is shown."

---

## 6. The tutor (Part 4)

- **Observe:** "Look at the mass ledger. How long is the grey bar compared with the parent's bar? And what do the sky-blue and purple bars show? What do you notice?"
- **Compare** (names both marks): "You predicted that *(the pieces' masses would add up to less than / the same as / more than the parent's)*. Look at the white tick on the grey bar. In this run, the parent's mass was 1 and the pieces' rest masses added up to 0.50. How does your guess compare? Then look at the white tick on the purple bar. You predicted that *(the passing observer would find the same / a different)* system's mass. How does that compare with the two bars?" Not marked here.
- **Conceptual question:** unchanged ("The pieces weigh less than the parent in total. Where did the missing mass go, and why do the pieces fly apart?").
- **Explanation:** marks both guesses ("Your guess was (a), and it was right: ..." / "not this time: ..."). Then the existing items, with these changes:
  - **Where the mass went** (unchanged in substance): energy changed form; each piece's energy of motion is 0.5 − 0.25 = 0.25, together 0.5, exactly the mass given up.
  - **Why equal pieces, flying apart:** unchanged (the skaters; now shown earlier in the introduction, so here only "as in the introduction's skaters").
  - **Why a particle cannot decay into heavier pieces:** unchanged, with the r = 0.6 case.
  - **Decay is making a particle backward:** unchanged.
  - **The passing observer:** unchanged (0.388 and 0.660).
  - **A real example: the neutral pion** (CHANGED, figures now from the Particle Data Group listing, read 2026-11-23). "The neutral pion's mass is 134.9768 MeV, its mean life is about 8.43 × 10⁻¹⁷ seconds, and it decays into two photons (light) 98.823 percent of the time. In the pion's own frame each photon carries half the pion's rest energy, 67.49 MeV (computed here). That is r = 0 in this experiment." *(Replaces "most often"; the PDG page was read through a summary, to be checked by eye. The figures were not before tied to a read source.)*
  - **A second real example: uranium-238** (CHANGED to the sources actually read). "Uranium-238 decays to thorium-234 and an alpha particle (two protons and two neutrons; a helium nucleus is the same thing, which the pages read do not say, so this line is general physics). The decay energy is 4.2697 MeV and the main alpha energy 4.198 MeV (79 percent of decays; a second group of decays has 4.151 MeV, 21 percent), from the NNDC evaluation (Browne and Tuli, 2007). The half-life is 4.468 billion years. 4.198 ÷ 4.2697 is about 98 percent: the alpha particle carries almost all the energy of motion because it is far lighter than thorium (computed here). The mass given up is about 2 parts in 100,000 of the uranium nucleus's rest energy (computed here: 4.27 ÷ (238 × 931.5))."
  - **The Earth's heat** (CHANGED; see decision 4). The old "about half" is replaced. "The Earth gives off about 47 trillion watts (47 ± 2 TW; Davies and Davies, 2010). How much of that comes from radioactive decay of uranium, thorium and potassium is estimated, not measured directly, and the estimates differ: the Borexino experiment's measurement of geoneutrinos gives about 38 TW (+14, −13) with an assumption for potassium, in tension at 2.4 sigma with the lowest model, and other estimates are lower (the KamLAND figure of about 20 TW was not read and is not used)."
  - **A difference from our model:** unequal pieces and three pieces (beta decay), as before.
  - **A remark on "will":** extended with the half-life idea of the introduction.
  - **What was shown, and what was not:** unchanged.
- **Want to know more? (in the explanation, after the learner has predicted):** Particle Adventure "Weak" and "Missing mass" pages (section 7).

---

## 7. Links ("Want to know more?") and the "Words and formulas" box

**Links fetched on 2026-11-23.** The fetches returned summaries of each page (a small model's), not the raw text, so quotations below are as returned; **a final check by the owner or in a browser is advised before approval.** No date is shown on a page unless stated.

| Link | What the learner finds | Where it appears | Status |
|---|---|---|---|
| EPA, "Radiation Basics" (epa.gov/radiation/radiation-basics) | Plain overview of alpha, beta and gamma radiation: an alpha particle is two protons and two neutrons | Above Part 1 | **Read, 2026-11-23.** "Last updated September 2, 2026". Does not say "helium nucleus" or describe a nucleus turning into another |
| NRC Science 101, "What are the different types of radiation?" (nrc.gov/reading-rm/basic-ref/students/science-101/what-are-different-types-of-radiation.html) | Plain student page: alpha particles are the heaviest radiation particles; they do not pass through skin | Above Part 1 | **Read, 2026-11-23.** Dated September 8, 2026. No energy or decay equation |
| NRC, "Radiation Basics" (nrc.gov/about-nrc/radiation/health-effects/radiation-basics.html) | Plain: what radiation is and the main types; alpha comes from uranium, thorium and radium | Above Part 1 (optional; overlaps) | **Read, 2026-11-23.** No date shown |
| Particle Data Group, the neutral pion (pdglive.lbl.gov/Particle.action?node=S009) | The measured mass, lifetime and decay modes of the pion | Above Part 1, described neutrally ("measured properties of a particle") | **Read through a summary, 2026-11-23.** Technical (a data listing). Reported as "2026 Release": confirm on the live page. Values: 134.9768 ± 0.0005 MeV; (8.43 ± 0.13) × 10⁻¹⁷ s; 2 photons (98.823 ± 0.034) % |
| NNDC NuDat 3, uranium-238 decay (nndc.bnl.gov/nudat3/decaysearchdirect.jsp?nuc=238U&unc=nds) | The measured decay of uranium-238 | Above Part 1, neutral wording | **Read through a summary, 2026-11-23.** Technical. Evaluation by Browne and Tuli, Nuclear Data Sheets, 2007. Q = 4269.7 ± 0.29 keV; alpha 4198 keV (79 %) and 4151 keV (21 %); half-life 4.468 × 10⁹ y |
| Davies and Davies 2010, "Earth's surface heat flux" (se.copernicus.org/articles/1/5/2010/) | The paper behind the Earth's total heat flow | Above Part 1 | **Read, 2026-11-23** (abstract). 47 ± 2 TW from 38,347 measurements |
| Borexino collaboration 2020, "Comprehensive geoneutrino analysis with Borexino" (arxiv.org/abs/1909.02257; Phys. Rev. D 101, 012009) | The paper behind the radiogenic-heat estimate | Above Part 1 | **First 100,000 of about 310,000 characters read** (HTML version). Technical. 38.2 (+13.6, −12.7) TW; assumes 47 ± 2 TW; model-dependent |
| Particle Adventure, "Weak" (particleadventure.org/weak.html) | Why heavy particles decay into lighter ones, with no collision | **In the tutor's explanation only** (it states the answer to Prediction 1) | **Read through a summary, 2026-11-23.** Plain to mixed. No publisher stated in the text fetched or in the page source, so **it is not described as an official source** |
| Particle Adventure, "Missing mass" (particleadventure.org/mm.html) | Mass-energy applied to a uranium decay (about 0.0046 atomic mass units "missing") | **In the tutor's explanation only** (same reason) | **Read through a summary, 2026-11-23.** Same publisher note. It is the only mass-to-energy page found and read |
| CERN, "Antimatter" (home.cern/science/physics/antimatter) | What happens when antimatter meets matter (mass becomes photons) | Optional, after the run | **Read through a summary, 2026-11-23.** 2026 copyright; no article date. Mixed level. It does not write out E = mc² |

**Gaps (§29 rule 3(c)), searched 2026-11-23:**
- **No plain official page on "what a decay is" that does not give the answer to Prediction 1 was found and read.** Particle Adventure is the best plain page and it says the pieces "always have less mass", so it is held back to the tutor. CERN's site returned only news items for this topic. Not linked: Particle Adventure "decay.html" (404), "decay_start.html" (history of radioactivity only).
- **No plain official page on E = mc² was fetched.** DOE "Explains mass-energy equivalence" (a URL the research agent guessed: 404). Symmetry magazine (a URL guessed: 403). A DOE OSTI page on E = mc² appeared in search and was **not fetched, so it is not linked.** *Note: the earlier Section A draft also recorded a Fermilab E=mc² page that returned 403.*
- **No plain official page for the neutral pion's decay to two photons.** No CERN, ATLAS or CMS page found; the Particle Data Group listing (technical) is the source.
- **No plain official page on the radiogenic share of the Earth's heat** (USGS, NASA, INFN): none found and read. Borexino and Davies are papers (technical).
- **Not read:** KamLAND (Nature Geoscience 2011; the page needed a login and PDFs came back as binary), the NRC glossary entry on alpha particles (403), IAEA LiveChart (402), the PDG 2025 summary PDF (saved locally, no text extractor), NIST ASTAR (a calculator, not a plain page).
- **No plain official page on how an alpha particle's energy turns into heat in rock.** The tutor's sentence on this is general physics and is not sourced.

**"Words and formulas" box (Section B's own entries, replacing the imported Experiment 5 lists):** decay, parent, pieces (decay products), half-life, momentum, rest energy, rest mass, mass given up (1 − 2r), the pieces' energy E = ½ and pc = √(¼ − r²) with a worked example (r = 0.3, not on a button), the system's mass M with its worked example (a total energy of 5 and a total momentum × c of 3 give M = 4), threshold, passing observer, alpha particle, photon (pulse of light), conservation of energy and momentum. No entry names an Experiment 5 section, picture or guess tick.

---

## 8. Physics-module additions (Step 3, after approval; no existing physics changes)

- `decayMassGuessMarker(guess)`: the tick position and box text of guess 1 (0.75, 1.00, 1.25 of the parent's bar), depending on the answer alone; and `realDecayMassAnswerFor(result)`: less, same or more from the result and never the guess.
- `passingObserverMassGuessMarker(guess, result)` and `realPassingObserverMassAnswerFor(result)`: the tick at the lab's mass (same) or half of it (not the same), and the real answer.
- `decayCheckUpRows(result)`: the seven rows of 5b, with tests (including that a broken value would read "different").
- Tests: positions are fixed by the answer and never by the result; the guess never changes any `runDecay` value; the "no decay can happen" case at r = 0.6 gives no rows.

---

## 9. Decisions and notes for the owner

1. **Picture B1 and Picture B2 are our own drawings** (default). B2 (the "how long do particles last" ruler) is optional; drop it if you prefer one picture.
2. **Real-example links held back.** The two Particle Adventure pages say the answer to Prediction 1 in plain words, so they are placed in the tutor's explanation, not above Part 1. Alternative: list them above Part 1 and accept that a learner may read them before predicting.
3. **The Particle Adventure publisher is not stated** on the pages read. I have not called it official. If you know it is hosted by Berkeley Lab, say so and I will say so in the status entry, or confirm in a browser.
4. **The Earth-heat sentence changes.** The approved wording said that radioactive decay supplies "about half" of the Earth's heat, "confirmed by search" without a primary source. The two papers now read give 47 ± 2 TW in total (Davies and Davies) and 38.2 (+13.6, −12.7) TW radiogenic (Borexino, with an assumed potassium part and a model tension), which is about 80 percent of the total with a large uncertainty (my arithmetic, not a figure from either paper). KamLAND's roughly 20 TW (about half) was **not read**. Default: state the two numbers and say the share is estimated and still debated. Alternative: drop the Earth-heat sentence.
5. **Pion and uranium figures** now come from pages actually read, through summaries only. **Please check the PDG numbers by eye** (the edition shown, and the mean life of 8.43 × 10⁻¹⁷ s, which differs slightly from the earlier "about 8.5").
6. **The "about 2 parts in 100,000" and "98 percent" figures** stay computed here, and say so.
7. **Marker positions** for guess 1 (0.75, 1.00, 1.25 of the parent's bar). Alternative: half, 1 and 1.5 (rejected: the half sits where the real bar ends at r = 0.25).
8. **"Run" label:** "Run (the lab, then the passing observer)".
9. **The check-up** has no row for the pion or uranium (no published value to compare against that the module computes).
10. **Completion marks** (`onComplete`, `onExplained`): kept as now (Decision 14 of the specification) unless you say otherwise.

## Not checked
No code, test, specification or status file was changed. The numbers in the table at the top were worked by hand, not by the module. All links were read through summaries of the pages (the research agents' fetch tool returns a small model's summary), so wording on each page was not read in full. The PDG edition ("2026 Release") and PDG values need a human check. The Borexino paper was read for its first third only. Nothing was viewed in a browser; the drawings (B1, B2) are described, not built. Section A's built state (uncommitted) was not re-reviewed in this step.
