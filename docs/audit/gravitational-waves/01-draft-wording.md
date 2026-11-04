# Draft wording: Gravitational Waves Experiment 1 (Ripples in Spacetime)
Date: 2026-11-04 | Status: APPROVED by the owner in conversation, built and checked in Chrome (Steps 2 to 6 of `docs/AUDIT-PLAN.md` §5); not yet committed. The wording in the page is the authority; this file is the record of what was drafted and what changed in review (see the last section).

Gaps chosen (the owner said "all defaults" on 2026-11-04): Part layout option (i); rewrite the introduction so it gives neither answer; guess markers on the graph; a small results table with a "What this table tells us" note and the guesses shown only; a dashed rest outline on the arm picture; chapter names in cross-references; no source links added.

## Layout decided by option (i)
- **Part 1** runs the wave at the "Typical detected event" setting (strength 0.20, speed 1.00), fixed. The learner makes both predictions, presses Run and sees Picture 1 (the arms) and Picture 2 (the graph).
- **Part 2** holds the sliders, the three presets and "Run your wave", with its own Drawing A (arms and graph at the learner's setting) and pink marks for the learner's own settings.
- **Part 3** holds Table 1 for the Part 1 run, the guesses beside it and "A real detection".
- **Part 4** is the tutor.
- The sliders were enabled before the first run. Now they are enabled once the Part 1 run has finished.

---

## 1. Introduction (changes only; every other sentence stays as approved)

**1a. "What 'a ripple in spacetime' actually means"** loses its last two sentences' answer. Old ending: "...carrying a real, physical distortion of space along with it — squeezing space in one direction while stretching it in the perpendicular direction, then swapping back and forth, over and over, as it passes by. That traveling distortion is a gravitational wave."
New ending: "...carrying a real, physical distortion of space along with it. That traveling distortion is a gravitational wave. What it does to the space it passes through is what you will predict and then watch."

**1b. Cross-reference in "The question"** (old: "Experiment 4 showed..."):
"The Curved Spacetime experiment (in the Gravity and Curved Spacetime chapter) showed that curved space can make two straight-as-possible paths drift together."

**1c. Cross-reference in 1a, also for the owner to decide (O1).** The old text says "Experiment 5 showed that nothing, including a change in spacetime's own shape, can spread faster than the speed of light." In the Gravity and Curved Spacetime chapter, Experiment 5 is "What Curves Spacetime?", whose specification says nothing about light speed. The experiment that does is "Why can't light go faster?" in the Relativity of Time and Motion chapter. Proposed:
"The experiment 'Why can't light go faster?' (in the Relativity of Time and Motion chapter) showed that nothing can spread faster than the speed of light, and a change in spacetime's own shape is no exception."

**1d. "What happens"** (old gives both answers). New:
"You'll watch two perpendicular "arms" of free-floating points, set up the same way a real gravitational-wave detector is built, while a wave passes through. Before you press Run, you'll predict what the two arms do while the wave passes, and what state they are in once it has gone."

**1e. "Your job"** (old: "Try different wave strengths and speeds ... and watch what the two arms do, together and compared to each other."). New:
"In Part 1, make your two predictions, then run a wave modelled on a real detected event and watch the arms. In Part 2, choose your own wave strength and speed and run it again."

**1f. New paragraph, after "Your job": "Your predictions and the real pictures."**
"Your predictions never change the real pictures, the table or the numbers: the arms and the graph come from a calculation that knows nothing about what you guessed. Your two guesses are drawn on the graph in white, in boxes labelled YOUR GUESS, and listed again beside the results. In Part 2, the sliders do change the drawings; those marks are pink."

**1g. New term, placed at the point where "strain" first appears (Picture 1's readout line), as a short definition under the picture, not in the introduction:**
"Strain: a plain number saying how strongly the wave is acting on space at this instant. 0 means the wave is doing nothing at this instant; the bigger the number, positive or negative, the stronger its effect. The wave's amplitude is the biggest strain it reaches."

---

## 2. The four Parts' leads

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you make two predictions about what the two arms do when a wave passes. Then you press Run and watch a wave, modelled on a real detected event, pass through them. Your guesses are drawn on the graph in white once the graph appears."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose the wave: change its strength and its speed, or pick a preset, and run it again. These sliders change the drawings in this Part, marked in pink. They do not change Part 1's pictures, the table in Part 3, or your guesses."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with your guesses or with the sliders in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white guess marks, then explains."

Note beside the Part 2 controls: "Your guesses do not change these drawings or the table in Part 3, but these sliders do change the drawings below."

---

## 3. Labels on the arm picture (Picture 1)

Drawn labels (text on the canvas): "Corner: where the two arms meet"; "Arm X" at the end of the horizontal arm; "Arm Y" at the end of the vertical arm; "free-floating mass" at one end dot; and, at each arm's rest position, a small dashed tick with the words "rest length 1.000".
Colours: Arm X purple (`#7c3aed`) and Arm Y teal (`#0891b2`), the same colours as the lines on the graph, so each arm can be matched to its line.
Under the picture: a line of readouts as now ("Strain, Arm X length, Arm Y length") followed by the strain definition (1g).

---

## 4. Picture 2: the graph, and the guess marks

Title on the canvas: "Arm lengths against time". Axis labels: "time (units; one unit = one swing at speed 1.00)" and "arm length (rest length = 1.000)". The dashed line is labelled "rest length 1.000". The legend line is kept ("Arm X length", "Arm Y length").

White marks, drawn only when the graph is drawn (A4):
- **Guess 1 (direction).** Two small white arrows at the first peak of the graph, one beside each line, showing what the learner's answer says each arm does at that moment: for "the two arms do opposite things", one arrow up and one down; for "both arms do the same thing at the same time", both arrows up. A white box joined by a thin line: "YOUR GUESS 1: the two arms do opposite things" (or "...both arms do the same thing at the same time").
- **Guess 2 (after the wave).** A white diamond at the graph's right edge: above the dashed rest line for "longer than they started", below it for "shorter", on it for "back to their original length". A white box joined by a line: "YOUR GUESS 2: ... end up longer than they started" (or "shorter than they started" / "back to their original length").
- Both are choices with no size, so each is only a marker. The height of the diamond above or below the dashed line is a fixed small step and says nothing about how much longer or shorter.

**"Where the real picture comes from"** (under both pictures): "Calculated here, not measured. The arm lengths and the graph come from a simple wave formula this page uses, with a wave strength of 0.20, much larger than any real wave so that you can see it. No instrument measured them. What real detectors measured is described under "A real detection" in Part 3. The white marks are your guesses, drawn only as markers."

---

## 5. Caption: "How to read these pictures"

The caption has two stages, so that it never explains a feature before it is drawn (§12, C6).

**Before Run (Picture 1 only):**
- "Picture 1 shows the two arms of a small detector, drawn the way a real one is built: two arms at a right angle, meeting at a corner."
- "Corner: where the arms meet. Arm X is the purple horizontal arm and Arm Y is the teal vertical arm. At the end of each arm is a free-floating mass: a mass with nothing pushing or pulling it, so it only moves if space itself changes."
- "The small dashed ticks mark each arm's rest length: how long it is when no wave is passing. All lengths on this page are shown as fractions of the rest length, so 1.000 means exactly the rest length."
- "The numbers under the picture are live: Strain, Arm X length and Arm Y length, as defined above."
- "Right now there is no wave, so the strain reads 0.000 and both arms are at 1.000."

**After Run (Picture 2 appears and the caption adds):**
- "Picture 2 is a graph of both arm lengths against time while the wave passed. Purple is Arm X, teal is Arm Y, and the dashed line is the rest length, 1.000. The run lasted five full swings (five cycles), which at speed 1.00 is five time units."
- "White marks: your two guesses, each in a box labelled YOUR GUESS and joined to its mark by a line. A white mark shows only what you guessed. It does not say whether you were right."
- **A worked moment.** "At the first peak, the strain is 0.20. Arm X is 1.100 and Arm Y is 0.900, each 0.100 away from the rest length of 1.000."
- **What to look for** (each item has three parts):
  1. **Look at** the purple and teal lines at the first peak. **What it means:** with the strain at 0.20, Arm X is at 1.100 and Arm Y at 0.900, on opposite sides of the dashed line and the same distance (0.100) from it. **Why it matters:** a detector compares its two arms, so what matters is how the two lengths change together, not either length on its own.
  2. **Look at** the right-hand end of both lines, next to the dashed line. **What it means:** after five swings both arms are back at 1.000. **Why it matters:** in this model the wave leaves the arms as it found them; the detector measures the ripple while it passes, not a lasting change.
  3. **Look at** the number of wiggles in each line. **What it means:** five full swings, because the run is set to five cycles at speed 1.00. **Why it matters:** the speed changes how quickly the arms swing, not how far they swing (Part 2 lets you try this).
  4. **Look at** the white marks and the boxes beside them. **What it means:** each shows your guess drawn next to the real lines. **Why it matters:** you can compare your guess with what the calculation gave, without any of it changing.

---

## 6. Part 2: controls, Drawing A and its caption

**Controls.** Strength slider (amplitude) and speed slider (frequency), three presets, and a "Run your wave" button, enabled once the Part 1 run has finished.

**Drawing A** (arms and graph at the learner's setting), with pink marks that follow the sliders:
- A pink dashed line above and below the rest line on the graph, labelled "YOUR STRENGTH: highest 1.175, lowest 0.825" (numbers shown for strength 0.35).
- A pink bracket across one swing, labelled "YOUR SPEED: one swing = 0.625 time units" (for speed 1.60).
- Same arm labels as Picture 1.

**"Where the real picture comes from"** under Drawing A: "Calculated here, not measured. This drawing shows the same simple wave formula as Part 1, at the strength and speed you chose. The pink marks show your own settings. They are trial values, not a real source."

**Caption (Part 2).**
- **A worked moment.** "With the Strong / nearby source preset (strength 0.35, speed 1.60), the arms reach 1.175 and 0.825, and one swing lasts 1 ÷ 1.60 = 0.625 time units, so five swings last 3.125 time units."
- **What to look for:**
  1. **Look at** the pink dashed lines. **What it means:** the highest and lowest length each arm reaches at your strength (1.175 and 0.825). **Why it matters:** doubling the strength doubles the distance from the rest line, so strength sets how far the arms swing.
  2. **Look at** the pink bracket. **What it means:** the time one full swing takes at your speed (0.625). **Why it matters:** speed sets how fast the arms swing; raise it and the bracket shrinks but the dashed lines stay where they are.
- "Trial values: these are your own numbers, not a real source, and they do not say the real detector is like this."

---

## 7. Part 3: the table, the guesses and the notes

**Table 1: how far each arm moved in the Part 1 run (strength 0.20, speed 1.00).** Columns: Arm | Shortest | Longest | Stretched by up to | Squeezed by up to | Length at the end. Rows: Arm X, Arm Y. Numbers come from the physics module.

**"Your guesses" block** (guesses only, no "matched" or "right"):
- "Guess 1. Question: when a wave passes, do both arms stretch and squeeze together, or do they do opposite things? Your guess: [label]. Where to look: both rows of Table 1, columns 'Stretched' and 'Squeezed'."
- "Guess 2. Question: after the wave has gone, are the arms longer, shorter, or back to their original length? Your guess: [label]. Where to look: the 'Length at the end' column of Table 1."
- Each row carries a small tag: "Guess 1" on both rows; "Guess 2" on the last column. The tags show a guess is related to that row or column, not whether it matched.

**What this table tells us.**
- **Shortest and longest.** *What it is:* the lowest and highest length each arm reached during the run. *What it means:* Arm X went from 0.900 to 1.100 and Arm Y from 0.900 to 1.100, so each moved 0.100 either side of its rest length of 1.000. *Why it matters:* the size of that move is set by the wave's strength: at strength 0.20 each arm moves by half of it. A real detector measures this move.
- **Stretched and squeezed by up to.** *What it is:* the biggest increase and the biggest decrease from the rest length. *What it means:* 0.100 each, for both arms. *Why it matters:* the stretch and the squeeze are the same size, so the wave changes the shape of the detector, not its size overall. Why this happens is for the tutor.
- **Length at the end.** *What it is:* the length of each arm once the run has finished. *What it means:* 1.000 for both, the same as the start. *Why it matters:* the arms swing and come back, so the wave leaves no lasting change in this model.
- **How big this is in real life.** *What it means with real numbers:* if the arms were 4 km long, as LIGO's are, a change of 0.100 would be 0.100 × 4 km = 0.4 km, or 400 metres. The real wave from GW150914 changed the arms by about one part in 10²¹, which for 4 km is about 4 × 10⁻¹⁸ metres, far smaller than a proton. The strength used here (0.20) is about 10²⁰ times the real one. *Why it matters:* the pictures exaggerate the effect enormously so that you can see it. *How sure the numbers are:* the 400 metres and the 10²⁰ come from this page's own numbers; the real strain is the page's quoted figure (see "A real detection").

**"A real detection"** (unchanged apart from the cross-reference above): "This experiment's effect is hugely exaggerated. LIGO's real detectors have arms about 4 kilometers long, and the real gravitational wave from GW150914 (two colliding black holes, detected in 2015) changed those arms by only about one part in 10²¹ — roughly one-thousandth the width of a single proton. LIGO has since detected many more, including GW170817 in 2017, a neutron-star merger also seen by ordinary telescopes moments later."

---

## 8. Part 4: tutor wording

- **Observe** (old: "What did you notice about the two arms while the wave was passing — did they do the same thing at the same time, or opposite things?"). New: "Look at the two lines on the graph and at the arms in Picture 1. What did you notice about how the two arms moved while the wave was passing?"
- **Compare** (old states both real answers). New, with no verdict: "On the graph, the white boxes marked YOUR GUESS 1 and YOUR GUESS 2 show what you predicted: [label 1] and [label 2]. Look at the purple and teal lines beside those marks, and at Table 1 in Part 3. What do you notice when you put your guesses next to the real lines?"
- **Conceptual** (old: "Experiment 4 showed that curvature can make straight-as-possible paths drift together..."). New: "The Curved Spacetime experiment showed that curvature can make straight-as-possible paths drift together, even with nothing pushing on them. How is what you just saw similar, and how is it different?"
- **Explanation:** a new first paragraph, then the five existing points with "Experiment 4" changed to "the Curved Spacetime experiment's converging travelers":
  - **"0. Your guesses, marked."** "Guess 1 said [label 1]. The graph shows the two arms doing opposite things, so your guess [matched / did not match]. Guess 2 said [label 2]. Both arms end at 1.000, back to their original length, so your guess [matched / did not match]."
  - Points 1, 2, 4, 5 as they are. Point 3: "This is the same underlying idea as the converging travelers in the Curved Spacetime experiment..."

---

## 9. Physics-module additions (Step 3), each with tests

All numbers drawn on the pictures or shown in the table come from `src/physics/gravitationalWaveExperiment.ts`:
- `armLengthRange(amplitude)`: shortest, longest, stretched-by and squeezed-by for each arm, exact (see question 1 below).
- `finalArmLengths()`: both arms at `BASE_ARM_LENGTH` after a whole number of cycles (tested with `gravitationalWaveStateAt`).
- `periodOf(frequency)` and `runDuration(frequency, cycles)`: one swing and the whole run.
- `directionGuessArrows(choice)`: what each guess says each arm does at the first peak ("up" or "down").
- `afterGuessMarkLength(choice)`: the diamond's height for "longer", "shorter" and "back to original", a fixed step of 0.05 from rest (a marker, not a size).
- `directionOutcome()` and `afterOutcome()`: the real answers (now in the module, replacing `ACTUAL_DIRECTION` and `ACTUAL_AFTER` in the component), and `guessMatches(...)` for the tutor's explanation only.

---

## Questions for the owner (found while drafting)
1. **Exact numbers in Table 1.** The Results today are sampled from the animation frames, so a run can read "stretching by up to 0.099" for strength 0.20, and the digit depends on the frame rate. The exact value is 0.100. I propose Table 1 uses the exact numbers from the module (0.100), which also keeps §11 (playback must not change the result). This changes one digit on the page, not the physics. Approve?
2. **"One-thousandth the width of a proton."** My check while drafting: 4 km × 10⁻²¹ = 4 × 10⁻¹⁸ m, and a proton is about 1.7 × 10⁻¹⁵ m wide, so this works out nearer one 400th than one 1000th. The 1000th is the approved wording, and I have not changed it. Please decide whether to keep it, reword it, or add a source later. This page's new table note avoids the comparison and says only "far smaller than a proton".
3. **Cross-reference 1c.** Is "Why can't light go faster?" the experiment you meant? (Gravity chapter Experiment 5 does not cover light speed.)
4. **Tag for Guess 1** (no number of its own): both rows of Table 1, as drafted. Or a single tag on the table's title.
5. **The "Part 2" run.** It does not trigger the check mark or the tutor again; only Part 1's run does, as now.

## Not checked
Nothing has been built or run. The sizes, positions and colours of the marks are proposals until seen in a browser (Step 5).

---

# Addition (2026-11-04, at the owner's request): "Some new words", "Words and formulas", "Want to know more?"
These three were never on this page (they come from §29, Cosmic Horizons). DRAFT for approval. Nothing built.

## A. Introduction paragraph, after "Your job"
"**Some new words.** The "Words and formulas" box below has each one, with a short plain meaning: gravitational wave, free-floating mass, rest length, strain, amplitude, speed, swing, polarization, LIGO, GW150914 and light-year."

## B. The "Words and formulas" box (collapsed, above Part 1, existing `ReferencePanel`)
- **Gravitational wave:** a ripple in the shape of spacetime that travels outward from a violent event, such as two black holes spiralling into each other, at the speed of light.
- **Free-floating mass:** a mass with nothing pushing or pulling it, so it only moves if space itself changes.
- **Rest length:** how long an arm is when no wave is passing. Every length on this page is a fraction of it, so 1.000 means exactly the rest length.
- **Strain:** a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.
- **Amplitude (strength):** the biggest strain the wave reaches.
- **Speed (frequency):** how many full swings the wave makes in one time unit. At speed 1.00 there is one swing in each time unit.
- **Swing (cycle):** one complete repeat of the wave's pattern. A run plays five swings.
- **Polarization:** the pattern in which a wave changes lengths. This page shows only one pattern; real waves can also act along a second, diagonal pair of directions.
- **LIGO:** the Laser Interferometer Gravitational-Wave Observatory: two detectors in the United States, each with two arms 4 kilometres long.
- **GW150914:** the name of the first gravitational wave ever detected. "GW" stands for gravitational wave and the numbers are the date, 14 September 2015.
- **Light-year:** the distance light travels in one year.
- **Formula: strain at a moment = amplitude × sin(2π × speed × time).** The sine makes the strain swing back and forth between plus and minus the amplitude. Example: amplitude 0.20, speed 1.00, time 0.25 gives 0.20 × sin(2π × 0.25) = 0.20 × 1 = 0.20.
- **Formula: one swing lasts 1 ÷ speed.** Example: at speed 1.60, 1 ÷ 1.60 = 0.625 time units, so five swings last 3.125 time units.
- **Held back until after the Part 1 run (§12):** "Arm lengths: Arm X = 1 + strain ÷ 2 and Arm Y = 1 − strain ÷ 2, so each moves by amplitude ÷ 2. Example: strain 0.20 gives Arm X = 1.100 and Arm Y = 0.900." These two formulas would give away Prediction 1, so the box shows them only once the run has finished.

## C. "Want to know more?" (visible from the start; each link opens in a new tab)
Checked 2026-11-04 (fetched and read):
1. **LIGO Lab, "What are Gravitational Waves?"** (https://www.ligo.caltech.edu/page/what-are-gw): "ripples in spacetime from violent events, Einstein's prediction and LIGO's first detection."
2. **NASA Space Place, "What Is a Gravitational Wave?"** (https://spaceplace.nasa.gov/gravitational-waves/en/): "a short, plain explainer for young readers: waves that squeeze and stretch things, what causes them and how LIGO detects them." (Page last updated June 2020.)
3. **LIGO Lab, "LIGO's Dual Detectors"** (https://www.ligo.caltech.edu/page/ligo-detectors): "why LIGO uses two detectors about 3,000 km apart."
4. **The discovery paper: "Observation of Gravitational Waves from a Binary Black Hole Merger"** (https://arxiv.org/abs/1602.03837), LIGO Scientific Collaboration and Virgo Collaboration, Physical Review Letters 116, 061102 (2016): "the original report of GW150914."
5. **"GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral"** (https://arxiv.org/abs/1710.05832), Physical Review Letters 119, 161101 (2017): "the original report of the neutron-star merger also seen by telescopes."

Not linked: `science.nasa.gov/universe/gravitational-waves/` (404) and the journal page for the discovery paper (403, not read). The arXiv copy of the paper is used instead.

## D. Source gaps to record (§29 rule 3(c))
- **"Strain" in plain words:** no plain official page defining it was found among the six pages read (searched 2026-11-04). The introduction defines it instead. Open.
- **How a laser interferometer measures a length change:** not searched. The introduction says this is not modelled.

## E. What the sources say about the page's figures (found while checking)
- **Supported:** GW150914's peak strain of 1.0 × 10⁻²¹ and its distance (the abstract: 410 Mpc; LIGO's page: 1.3 billion light-years).
- **Not supported:** the page says the real change is "roughly one-thousandth the width of a single proton". None of the pages read says that. LIGO's own page compares it to the atomic nucleus: "10,000 times smaller than the nucleus of an atom". Decision for the owner: keep the approved proton wording, or change both places (the introduction's first assumption and "A real detection") to LIGO's own comparison, "about 10,000 times smaller than the nucleus of an atom".

---

# Differences between this draft and the built page (owner's review, 2026-11-04)
- **Sliders:** option (i) as drafted; Part 2 appears after the Part 1 run.
- **Table 1 numbers:** exact values from the module, as proposed (question 1).
- **Cross-reference to light speed:** "Why can't light go faster?" (question 2).
- **Proton wording:** changed to LIGO's comparison, "10,000 times smaller than the nucleus of an atom" (the owner's "approved" on the second addition; also in the tutor's point 4). The draft's "about 10²⁰" became "more than 10²⁰" (2 × 10²⁰ for strength 0.20).
- **Start over button** added (owner's request): clears predictions, both runs, Part 2's settings and the tutor.
- **Picture 1:** the amber rest outline and ticks drawn on top of the arms (the grey ones were hidden under the arms at rest); labels no longer clipped; the Arm X label raised above its tick.
- **Captions:** each picture has its own, much fuller caption (owner's request); the rest-length bullet was rewritten as "a fixed ruler" with three cases and a door-frame comparison.
- **Playback:** 8 seconds instead of 3.5 (owner chose a slower run over a "freeze at the first peak" button).
- **Picture 2:** legend moved to a row across the top; the dashed rest line is amber. **Part 2:** the speed bracket moved below the axis; the time-axis label states the swing time.
- **Part 2 drawings:** split into Drawing A (the arms) and Drawing B (the graph), each with its own "How to read" caption (owner's request).
- **Tags in Table 1:** "guess 1" and "guess 2" (the draft's "your Prediction n" was clipped).
- **Links:** plain-language pages in the introduction and the two original papers at the end of Part 3, as in Cosmic Horizons (owner's request); a lead line in each.
- **Tutor:** the compare step now reads "...that the arms would end up ...".
