# Draft wording: Spacetime Geometry Experiment 8 (new title proposed: "Does Your Motion Change the Color of Starlight?")

**Status:** APPROVED by the owner on 2026-11-23 ("approved"; "all defaults" to the eleven questions of section 10); built in `8dd399c`. The additions of section 11 were approved by the owner on 2026-11-23 ("approved, update the docs and commit"). Originally a draft for the owner's approval, written 2026-11-23 (CLAUDE.md §28.1). The re-read of the gap report against Rule E and the 2026-11-07 rules is appended to `08-gap-report.md` (section "Re-read, 2026-11-23"). Eleven questions for the owner are in section 10; "all defaults" is a valid answer, as for Experiment 7.

**Why this draft is long (the owner's request, 2026-11-23):** "the topic is a basic one of which the user must have a thorough knowledge". So the introduction is rebuilt as a step-by-step lesson with four drawings, and the tutor's explanation gets three drawings. The rule that stays in force: **nothing before the learner's prediction says which way a colour shifts, or that it shifts at all** (§12). Every drawing in the introduction is therefore direction-neutral. The drawings that show the direction (the siren, the clock, the curve) sit in the tutor's explanation, as Experiment 7's drawing of the cause did.

**Source of the numbers:** `src/physics/dopplerShift.ts` (24 tests), recomputed by script on 2026-11-23 and equal to the specification's tables.

| Speed | D | Straight ahead: factor / nm | Sideways star: factor / nm | Straight behind: factor / nm | Everyday factor ahead / sideways / behind | Blue turns to red: traveler's sky / lab's sky |
|---|---|---|---|---|---|---|
| 0.3c | 0.954 | 1.363 / 404 | 1.048 / 525 | 0.734 / 750 | 1.30 / 1.00 / 0.70 | 81.2° / 98.8° |
| **0.6c** | **0.800** | **2.000 / 275** | **1.250 / 440** | **0.500 / 1100** | **1.60 / 1.00 / 0.40** | **70.5° / 109.5°** |
| 0.9c | 0.436 | 4.359 / 126 | 2.294 / 240 | 0.229 / 2397 | 1.90 / 1.00 / 0.10 | 51.2° / 128.8° |
| 0.99c | 0.141 | 14.107 / 39 | 7.089 / 78 | 0.071 / 7759 | 1.99 / 1.00 / 0.01 | 29.8° / 150.2° |

Part 1 is fixed at **0.6c**. At 0.6c, for lab angles 0°, 30°, 60°, 90°, 120°, 150°, 180°: factors 2.000, 1.900, 1.625, 1.250, 0.875, 0.600, 0.500; wavelengths 275, 290, 338, 440, 629, 916, 1100 nm. 15 stars are shifted toward blue and 9 toward red (of 24).

---

## 0. Title, layout and the four Part leads

**New title (Question 1):** "Experiment 8 — Does Your Motion Change the Color of Starlight?" (sidebar: "Does the color change?"). *Reason:* the old title, "Why a Fast Traveler Sees the Colors of the Sky Shift", says that the colours shift, which is half of what Prediction 1 asks (the answer "the same colour" is one of the three choices). It is the same early reveal that led the owner to retitle Experiment 7. The word "Doppler" first appears in the introduction's list of new words. Places to change at build time: the heading (`DopplerShiftExperiment.tsx:491`), the sidebar title in `App.tsx`, the specification's title, and any "What's next" or recap line that names the old title.

**Layout:** the introduction (with its drawings and "Some new words"), the "Words and formulas" box, and the "Want to know more?" links sit above Part 1 with no heading, in that order. Then the four Parts. Part 1 is fixed on 0.6c; Part 2 holds the speed buttons. **Parts 2, 3 and 4 appear as soon as the first Run has finished** (CLAUDE.md, 2026-11-07).

- **Part 1: Predict, then watch** (amber). "What we are about to do. A traveler flies through the middle of a ring of stars at 0.6c, and every star sends out the same single colour. You will predict the colour the traveler measures for two of the stars, press Run, and watch the traveler's sky being drawn. Your guesses are drawn on the real picture in white. They never change it."
- **Part 2: Now try it yourself** (pink). "What we are about to do. You choose how fast the traveler flies and press Run these settings. These choices change the drawings. Your guesses do not, and they stay locked while you try other speeds. The speeds are trial values for an imagined traveler. They do not say that any real spaceship can fly like that."
- **Part 3: The results** (teal). "What we are about to do. Here are the numbers behind the pictures, a check-up of this page against its own physics and against Einstein's published formula, and your guesses beside the real results."
- **Part 4: The tutor** (blue). "What we are about to do. The tutor asks you three questions, one at a time, about what you saw and how your guesses compare with the pictures, and then goes through the explanation, with drawings."

---

## 1. The introduction, rebuilt (four drawings, no direction given)

Unchanged and kept as approved on 2026-10-16: the idea of "the question", the six "Some new words" entries, "What happens" and "What we assume". New or changed text is marked. Order: **The question → What light is (drawing A) → Frequency, wavelength and colour (drawing B) → What "measuring a colour" means (drawing C) → Two observers (drawing D) → An everyday example → Some new words → What happens → Your job → What we assume.**

### 1a. The question (CHANGED: two sentences added; the second says why a ship is used)

> **The question.** In Experiment 7 we saw that a traveler and the lab see the same stars in different directions. Does the *colour* of the light change too? Light is a wave, and the colour we see depends on how close together its crests are. Does the traveler's own motion change what colour the light has, or does a star simply have one colour, whoever looks at it? To find out, we will use a traveler on a spaceship, because a spaceship can be given any steady speed we like.

### 1b. NEW: "What light is" (drawing A)

> **Light is a wave.** Drop a pebble in a pond and rings spread out. Each ring is a *crest*, the highest part of the water, and between two crests is a low part, a *trough*. Light is also a wave, though nothing is going up and down like water: it is electric and magnetic strength that rises and falls. The part that matters for us is only this: **a light wave is a string of crests, one after another, and the crests are evenly spaced.**
>
> **Drawing A (a wave with its parts labelled):** a smooth wave drawn across the picture with five crests; the crests marked with dots and the label "crest"; one trough marked "trough"; a double-headed arrow from one crest to the next labelled "**wavelength**: the distance from one crest to the next"; an arrow showing the wave travelling to the right, labelled "the wave travels this way".

```
        crest         crest         crest
   ___    ●    ___      ●    ___     ●
  /   \  / \  /   \    / \  /   \   / \        wave travels  ──▶
 /     \/   \/     \  /   \/     \ /
        trough      |<──wavelength──>|
```

### 1c. NEW: "Frequency, wavelength and colour" (drawing B)

> **Frequency and wavelength.** Stand still and count the crests that pass you in one second. That count is the wave's **frequency**. The distance between two crests is its **wavelength**. The two go together: if the crests are packed close (a short wavelength), more of them pass you each second (a high frequency). If they are spread out (a long wavelength), fewer pass each second (a low frequency).
>
> **Colour is wavelength.** The colour our eyes see is set by the wavelength of the light. We write wavelengths in **nanometres** (nm). One nanometre is one billionth of a metre: a human hair is roughly 80,000 nm wide (a rough figure, not source-checked), so a single nanometre is hard to imagine, but the numbers are easy to compare. The eye sees wavelengths from about 400 nm (violet) to about 700 nm (red). Between them are blue, green, yellow and orange. Light with a *shorter* wavelength than the eye can see is **ultraviolet** (UV), and light with a *longer* wavelength is **infrared** (IR). The eye cannot see either, so the pictures mark them with the letters UV and IR and do not invent a colour for them. Our stars all send out **550 nm**, a yellow-green about halfway along the visible range.
>
> **Drawing B (one wave, drawn twice, and the colour strip):** the top wave has crests close together, labelled "short wavelength → high frequency → toward the violet end"; the lower wave has crests far apart, labelled "long wavelength → low frequency → toward the red end". Below them, a strip from 300 to 800 nm: a hatched patch at the left marked "UV: too short to see", the rainbow from 400 to 700 nm marked "visible", a dotted patch at the right marked "IR: too long to see", a tick at 550 nm marked "550 nm: the colour every star sends out".

**Why the drawing is neutral:** it shows only that frequency and wavelength go together. It does not say that anything shifts.

### 1d. NEW: "What does it mean to measure a colour?" (drawing C)

> **Measuring a colour is counting crests.** An observer with an instrument that can count crests, and a clock to count against, measures a colour like this: count the crests that arrive in one tick of the clock. The more crests per tick, the higher the frequency, and the bluer the colour. So the colour an observer measures depends on **two things: how the crests arrive, and the clock the observer counts against.** Keep that in mind. Experiment 3 showed that clocks do not have to agree.
>
> **Drawing C (counting crests):** a row of crests arriving from the left; an observer drawn on the right with a clock face; two bracketed time windows "1 tick of the clock", one with 4 crests inside, labelled "4 crests per tick: frequency 4", the other with 6 crests, labelled "6 crests per tick: frequency 6 (a higher frequency, a shorter wavelength, a bluer colour)". The picture says only "more crests per tick means a bluer colour". **It does not say who gets more.**

*(The sentence "Experiment 3 showed that clocks do not have to agree" is a pointer, not a mechanism. It gives away nothing the learner is asked to predict, but it hints that the clock matters. Question 4 asks whether to keep it.)*

### 1e. NEW: "Two observers" (drawing D, the setup)

> **Two observers, one sky.** As in Experiment 7, a ring of 24 stars surrounds the middle. They are all very far away, evenly spaced (one every 15°), and **at rest relative to the lab**. Two observers measure the starlight at the middle of the ring at the same instant. The **lab observer** is at rest relative to the stars. The **traveler** is flying through the middle of the ring at a steady speed. At that instant they are in the same place, so the same crests are arriving at both of them. The only difference between them is that one is moving. Each observer counts crests with their own clock, and each measurement is just as valid as the other.
>
> **Drawing D (the setup):** the ring of 24 stars, all drawn in the same yellow-green; at the centre, two figures side by side: a small observer labelled "lab observer (at rest)" and the spaceship labelled "traveler" with an arrow "direction of travel"; four labelled stars ("straight ahead (0°)", "sideways (90°)", "straight behind (180°)", "sideways (270°)"); a note "every star sends out 550 nm". **No colours change in this drawing.**

### 1f. An everyday example (kept, with one change)

> **An everyday example.** The pitch of a siren depends on how the ambulance and the listener are moving. The siren has not changed. It is the sound that reaches the listener that is different.

*Unchanged.* It gives no direction. The picture of the siren, with its crests bunched or spread, is held for the tutor (section 6) because it would answer Prediction 1.

### 1g. "Some new words" (CHANGED: two new entries; the six others unchanged)

New entries: **Crest and trough** (the highest and lowest parts of a wave) and **The Doppler effect** ("the change in the frequency of a wave that an observer measures because the observer, or the source, is moving. Sirens are the everyday example. This experiment asks whether it happens to light."). Unchanged entries: Frequency, Wavelength (nanometres, UV, IR), Shifted toward blue and red, The shift factor f′ ÷ f, The angle θ and the direction of travel, Speed written as 0.6c.

### 1h. "What happens" (CHANGED: names the white mark and the real colours)

> **What happens.** The ring of 24 stars is drawn as the lab observer measures it: every star is the same yellow-green, 550 nm. Then the same stars are drawn as the traveler measures them, a pair at a time, starting straight ahead, each in the colour the traveler measures (or marked UV or IR if the colour cannot be seen). A bar under the pictures, a ruler for wavelengths, shows where the traveler's measurements fall.

### 1i. "Your job" (CHANGED, replaces the approved paragraph)

> **Your job.** Predict first. Part 1 uses a traveler flying at **0.6c**. You predict the colour the traveler measures for two stars: the one straight ahead, and the one the lab observer sees exactly sideways. Choose your answers, then press Run. You are not graded. **Your predictions never change the pictures or the tables.** They come from the physics. Your guesses are drawn on the spectrum bar in white, in boxes labelled YOUR GUESS, and they are shown again beside the results. Once you press Run, your guesses are locked. After your first run, Part 2 lets you choose other speeds. Those choices *do* change the drawings, but not your guesses. If you want to change your guesses, press Start over.

### 1j. "What we assume" (unchanged, plus one sentence)

Added at the end: "The numbers on this page come from a formula worked out for a pure colour, and we use it for every star. We have not measured a traveler at 0.6c: it is a calculation, and Einstein's 1905 formula is the published source."

---

## 2. The predictions, the white marks, Start over and locking

**2a. The two questions** (approved wording, with the speed now fixed at 0.6c; each has Bluer / The same colour / Redder):

> **Prediction 1: the star straight ahead.** Every star sends out the same colour of light. The traveler flies through the middle of the ring at **0.6c**. The star straight ahead of the traveler is the one the traveler is flying toward. Compared with the lab's view of that star, does the traveler see its light bluer, the same colour, or redder? You are not graded, and a guess is fine.
>
> **Prediction 2: the star the lab sees sideways.** Now take the star that the lab sees exactly sideways: it is neither ahead of the traveler's path nor behind it. Does the traveler see its light bluer, the same colour, or redder than the lab sees it? You are not graded, and a guess is fine.

Under each set of buttons: "Choose an option to continue." After a choice: "Your prediction: bluer."

**2b. The white marks** (drawn on the **spectrum bar**, the picture where the answer lives: the bar's rows for "straight ahead" and "the star we follow"; each mark appears when that star's real mark appears on the bar, i.e. when the sky has been drawn, so nothing is explained early):
- A white box labelled **YOUR GUESS 1: straight ahead** (or **YOUR GUESS 2: the star we follow**), joined by a thin white line to a white mark on that star's row, starting on the lab's 550 nm line.
- **Bluer:** a white arrow from the lab's 550 nm line pointing left (toward the violet end).
- **The same colour:** a white ring on the lab's 550 nm line, no arrow.
- **Redder:** a white arrow from the lab's 550 nm line pointing right (toward the red end).
- **The arrow has a fixed length. It shows a direction only. Your guess had no number, so the arrow's length means nothing.** The caption says so.
- The mark never says "right", "wrong" or "matched". The tutor marks each guess in its explanation, and nowhere earlier.

**Change for the owner's approval (white clash):** the pictures today draw the star straight ahead with a **dashed white ring** (sky picture) and a **white dashed line** (bar). White always means the learner's guess (CLAUDE.md §14), so both change to **orange** (`#fb923c`, dashed), and the caption says so. The yellow "star we follow" ring and the purple "straight behind" line stay.

**2c. Start over and locking** (the 2026-11-07 rule):
- A **Start over** button, always visible from the first screen, greyed out until there is a chosen guess or a run and while a run is playing. It clears both guesses, the runs, the results and the tutor, and returns the page to its first state.
- After Run, the six answer buttons are greyed out, with the note: "Your predictions are locked while you try other settings. To change them, press Start over."
- Run stays off until both guesses are made. **Two behaviours that go:** clicking an answer no longer sends the page back to its first state, and changing the speed no longer clears the guesses (the speed is now in Part 2, and the guesses are about 0.6c).

---

## 3. Part 1's pictures: caption, marks and "Where the real picture comes from"

Part 1 shows the three pictures at 0.6c: the lab's sky, the traveler's sky, and the spectrum bar. The approved "How to read this diagram" caption stays in full: the idea behind the pictures, Picture 1, Picture 2 (who the traveler is, "at the moment it flies through the centre", "measures", "the same stars", "why it starts empty", the colours and UV and IR markers, the two wedges, the crossing lines), Picture 3 (the bar), "Words used in the drawing" and the neutral worked moment.

**3a. Changes inside the caption:**
1. The line about the star straight ahead's "dashed white ring" becomes "a dashed **orange** ring" (section 2b). Any mention of the bar's "white, dashed line" becomes "orange, dashed".
2. **New bullet in Picture 3 (shown once the marks are drawn):** "The **white marks** are your guesses. Each has a box saying YOUR GUESS and a line to its row. A white ring on the blue line means you guessed 'the same colour'. A white arrow pointing left means you guessed 'bluer' (a shorter wavelength, toward the violet end). A white arrow pointing right means you guessed 'redder' (a longer wavelength, toward the red end). **The arrows only show a direction. Your guess had no number, so how long an arrow is means nothing.**"
3. The crossing lines and the dotted 90° line are described only once they appear (as today).

**3b. "What to look for"** replaces the four bare questions. Each item appears only once the feature it names is drawn. None says which way the colours shift before the learner has guessed and watched.

1. *Appears once the traveler's sky has its first stars.*
   - **Look at** the dots in the lab's sky and in the traveler's sky. **What it means:** both rings hold the same 24 stars. In the lab's sky every dot is the same yellow-green, 550 nm. **Why it matters:** it is the same stars and the same starlight in both pictures, so any difference between the pictures comes from who is looking, not from the stars.
2. *Appears once the star straight ahead is drawn in the traveler's sky, with your first white mark.*
   - **Look at** the orange-ringed dot at the right of the traveler's sky and the orange row on the bar. **What it means:** its colour at 0.6c is the traveler's measurement of the star straight ahead. The bar gives its wavelength and its shift factor. At 0.6c the factor is 2.00 and the wavelength is 550 ÷ 2.00 = 275 nm, which is ultraviolet, so the dot is drawn as a UV marker and not as a colour. **Why it matters:** this is the one star the traveler flies straight toward, so it is the cleanest test of whether motion changes colour.
   - **Look at** your white mark and the orange mark on the same row. **What it means:** the white arrow shows which side of the blue line you guessed; the orange mark shows where the real measurement is. **Why it matters:** the two can be compared at a glance. The arrow is only a marker, with no number.
3. *Appears once the star we follow is drawn in the traveler's sky, with your second white mark.*
   - **Look at** the yellow-ringed dot and the yellow row on the bar. **What it means:** this is the star the lab sees exactly sideways, at 90°. At 0.6c the traveler's factor for it is 1.25, so its wavelength is 550 ÷ 1.25 = 440 nm, a blue-violet colour. **Why it matters:** a star neither ahead nor behind is the case where our everyday guess is most likely to say "no change". This is the surprising one.
4. *Appears once the whole traveler's sky is drawn.*
   - **Look at** the star straight behind (purple row, left of the picture). **What it means:** its factor is 0.50, so its wavelength is 550 ÷ 0.50 = 1100 nm: infrared, so it is an IR marker. **Why it matters:** it is the opposite case to the star straight ahead, so the pair shows that the effect depends on direction.
   - **Look at** the dashed yellow lines and the dotted vertical line in the traveler's sky. **What it means:** the dashed lines are at 70.5° from straight ahead. A star on them has a factor of exactly 1: the same colour as the lab. The dotted line is 90°. **Why it matters:** the dashed lines are ahead of the dotted line, so the stars on the 90° line are not the "no change" stars. That is a first hint that something extra is going on, which the tutor explains.
   - **Look at** the numbers beside the wedges. **What it means:** the traveler counts 7 stars in the striped wedge and 3 in the dotted one. **Why it matters:** the stars are crowded toward the front, which is the effect of Experiment 7. This experiment adds the colour to that crowded sky.

**3c. Worked moment, shown once the star we follow is drawn:** "At 0.6c the lab measures 550 nm for the star we follow. The traveler measures a frequency 1.25 times the lab's, so the wavelength is 550 ÷ 1.25 = 440 nm. On the bar, 440 nm is just inside the violet end of the visible range, 40 nm past the 400 line on the visible side." *(The existing "Reading your run" bullets, which give the same numbers for the three stars once the run has finished, stay.)*

**3d. "Where the real picture comes from"** (under the two sky pictures and under the bar):
- **Measured:** nothing in these pictures. No one has measured a traveler at 0.6c flying through a ring of stars. (Real measurements of the Doppler shift of light exist; none is used here: see section 7.)
- **Calculated here:** every colour and wavelength in the traveler's sky, the bar's marks, the wedge counts and the crossing lines are worked out by the page from the lab's angle and the speed, using the formula f′ ÷ f = (1 + β cos θ) ÷ D. The page checks it two other ways (the energy of each ray, from Experiment 5, and the traveler's own angle) and a third from the published formula (section 5b).
- **Imagined for the question:** the ring of 24 evenly spaced, very distant stars, the single pure 550 nm colour of every star, and a traveler flying at exactly 0.6c. Real stars send out a mixture of colours. **Your white marks are your guesses, not calculations.** The colours of the dots are an ordinary drawing approximation of the visible spectrum; the physics gives only the wavelength.

---

## 4. Part 2: controls and note

**Controls:** the four speed buttons (0.3c, 0.6c, 0.9c, 0.99c) and **Run these settings**. The first Run in Part 2 uses the chosen speed. **Part 2 shows the two sky pictures and the bar for the chosen speed** (titled "Your own speed: 0.9c", for example), with the same labels, the same "Where the real picture comes from" line and **no guess marks** (the guesses were about 0.6c). The caption of Part 1 is not repeated; a line says "These pictures are read the same way as in Part 1."

**Note beside the controls:** "These buttons change the drawings and the tables below. Your guesses do not. They are locked, and they are drawn on Part 1's spectrum bar only. These speeds are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that. The check-up table in Part 3 says 'the same' for every speed, because the physics agrees with itself at every speed: change the speed to see the numbers move, not the readings."

*(No comparison table for the controls: the speed only moves marks in the pictures. This follows Experiment 14's decision and CLAUDE.md §14 item 3.)*

---

## 5. Part 3: the results, with the reading guide

**5a. "What you ran"** (replaces the old line): "A traveler flew through the middle of the ring of 24 stars at 0.6c. Every star sends out the same 550 nm light, and the traveler measured each star's light. **Your guesses** are shown below, next to the rows they were about. **They do not change anything on this page.**"

**5b. Check-up table: "Does this page agree with its own physics, and with Einstein's formula?"** Every row's numbers come from the physics module (section 8). A real reference exists for one row (Einstein 1905 §7); the others compare the page with itself, so the readings use "the same".

| Check | What we expected | What was found (0.6c) | Reading |
|---|---|---|---|
| The two forms of the formula (the lab's angle, and the traveler's angle) | the same factor for all seven stars | largest difference 0.000 | the same |
| The energy route (Experiment 5's energy of a ray) | the same factor as the formula | largest difference 0.000 | the same |
| Einstein's 1905 formula, ν′ = ν (1 − cos φ · v/c) ÷ √(1 − v²/c²), with φ = 180° − θ | the same factor for all seven stars | largest difference 0.000 | the same |
| The star straight behind, against Experiment 5 of Gravitational Waves at 0.6c | 0.500 | 0.500 | the same |
| The everyday factor ÷ D, for the sideways star | 1.00 ÷ 0.800 = 1.25 | 1.25 | the same |
| The factor at the crossing angle (70.5° in the traveler's sky) | exactly 1 | 1.000 | the same |

**What this table tells us:**
- **What it is:** six checks the page makes on its own numbers. Five compare one route with another route inside the page. One compares the page with a formula published in 1905, in section 7 of Einstein's paper. It is not a test of a real experiment.
- **What it means with the real numbers:** three routes (the lab's angle, the traveler's angle, and the energy of a ray) give the same shift factor for every star, and so does the formula as Einstein printed it. At 0.6c the star straight behind has a factor of 0.500, the same as the receding source of Experiment 5 of Gravitational Waves. **A check you can do:** Einstein writes the angle φ between the line "source–observer" and the observer's motion. For a star straight ahead (θ = 0°), the line from the source to the observer points the other way, so φ = 180° and cos φ = −1, giving ν′ ÷ ν = (1 + 0.6) ÷ 0.8 = 2.00.
- **Why it matters:** if the page's numbers disagreed with themselves, or with the published formula, nothing else on the page could be trusted. They agree, so the tables below are consistent with the physics. That the numbers are consistent does not show that the real sky behaves like this. For a real measurement, see the links.

**5c. Table 1, "The seven stars"** (unchanged columns: the lab's angle θ, the traveler's angle θ′, the shift factor f′ ÷ f, the wavelength, the range). A small tag **YOUR GUESS 1: bluer** (for example) sits on the 0° row and **YOUR GUESS 2: …** on the 90° row. It shows the guess only: no "right" or "wrong".

**What this table tells us:**
- **What it is:** for seven stars in the upper half of the ring, the angle the lab measures, the angle the traveler measures, and how the traveler's measurement of the light compares with the lab's. The shift factor is the traveler's frequency divided by the lab's. The wavelength is what the traveler measures (the lab measures 550 nm for all).
- **What it means with the real numbers:** at 0.6c the star straight ahead (0°) has a factor of 2.00 and a wavelength of 275 nm: ultraviolet. The star at 90° has 1.25 and 440 nm: visible, blue-violet. The star at 180° has 0.50 and 1100 nm: infrared. A factor above 1 means a higher frequency than the lab measures, and below 1 means lower. **A worked check:** for the 90° star, cos 90° = 0, so the factor is (1 + 0) ÷ 0.8 = 1.25, and 550 ÷ 1.25 = 440 nm.
- **Why it matters:** the column of factors is the whole effect in one list. It starts at its largest straight ahead and falls steadily to its smallest straight behind, and it passes through 1 between the 90° and 120° rows (their factors are 1.25 and 0.875). The mechanism, and why 90° is not the "no change" row, are for the tutor.

**5d. Table 2, "The counts and the crossing"** (replaces the three bullets; same numbers): rows: stars shifted toward blue (15), toward red (9), the 24 in all; the angle where the factor is 1, in the traveler's sky (70.5°) and in the lab's sky (109.5°); the number D (0.800).

**What this table tells us:**
- **What it is:** how the 24 stars divide between "higher frequency than the lab measures" and "lower", where the dividing line is in each picture, and the time dilation factor D from Experiment 3.
- **What it means with the real numbers:** at 0.6c, 15 stars are shifted toward blue and 9 toward red. The dividing line is at 70.5° from straight ahead in the traveler's sky, and at 109.5° in the lab's sky. If nothing extra were going on, we would expect the line at exactly 90°. D = √(1 − 0.6²) = 0.800.
- **Why it matters:** more than half the sky is shifted toward blue, and the dividing line is ahead of sideways. Both facts depend on D, which comes from the traveler's clock running slow. The tutor shows how.

**5e. NEW picture in the results: "The factor around the ring" (drawing F, a graph).** Horizontal axis: the lab's angle θ from 0° (straight ahead) to 180° (straight behind). Vertical axis: the shift factor f′ ÷ f, from 0 to 2.2 for the Part 1 speed. A solid curve (the real factor), seven dots on it (the seven table rows), a dashed horizontal line at 1 labelled "the lab's colour (factor 1)", a vertical dotted line at 90° labelled "sideways", and a vertical dashed yellow line at 109.5° labelled "factor is 1 here". Your two white guesses appear on this picture as small white markers on the 0° and 90° columns: a white arrow above the line (bluer), a white ring on the line (the same), a white arrow below the line (redder), in a box labelled YOUR GUESS, with a line to the marker. Same rules as the bar: direction only, no "right" or "wrong".

> **Caption: How to read this graph.** The curve shows what the traveler measures for every star around the ring, from straight ahead on the left to straight behind on the right. The height is the shift factor. The dashed line at 1 is "same colour as the lab". Where the curve is above the dashed line, the traveler measures a higher frequency than the lab; below it, lower. The dots are the seven rows of Table 1. The white marks are your guesses.
> - **Look at** the left end of the curve. **What it means:** straight ahead, the factor is 2.00 at 0.6c. **Why it matters:** it is the highest point, the star the traveler flies toward.
> - **Look at** where the curve crosses the dashed line. **What it means:** at 109.5° in the lab's sky, the factor is exactly 1. **Why it matters:** this is not at 90°, the dotted line. The sideways star's dot is above the dashed line, at 1.25.
> - **Look at** the right end. **What it means:** straight behind the factor is 0.50, the lowest point. **Why it matters:** the curve is smooth, with no jump, so the shift changes steadily with direction.
>
> **Where the real picture comes from.** *Calculated here:* every point is worked out by the page with the same formula. *Measured:* nothing. *Imagined for the question:* the ring of very distant stars, each sending out one pure colour, and the traveler at 0.6c. *Your white marks are your guesses, not calculations.*

*(Question 5 asks whether to add this graph. It is the one new results picture. Without it the factor around the ring is read from a table of seven rows.)*

**5f. "Your guesses, beside the results"** (a short block): "You guessed: the star straight ahead, **bluer**; the star the lab sees sideways, **the same colour** (example). Question 1 was about the star straight ahead; its numbers are in Table 1, in the row for 0°, and in the orange row of the bar. Question 2 was about the star the lab sees sideways; its numbers are in the row for 90° and in the yellow row of the bar. A small tag YOUR GUESS sits on each row. This block shows your guesses only. The tutor compares them with the results, below."

**5g. A line under the Part 2 tables:** "These numbers are for your own speed. They are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that."

---

## 6. Part 4: the tutor (CHANGED in five places; three new drawings)

**Prompts:**
- **Observe:** "Look at the three pictures, the white YOUR GUESS marks on the spectrum bar, the graph and the tables. What do you notice about the colour of the stars in the lab's sky and in the traveler's sky?"
- **Compare:** "You predicted that the star straight ahead would look [bluer / the same colour / redder] and the sideways star [bluer / the same colour / redder]. Those are the two white marks on the bar. In this run, the straight-ahead star's light was measured at [2.00] times the lab's frequency (the orange mark), and the sideways star's at [1.25] times (the yellow mark). Comparing the white marks with the orange and yellow marks, what do you notice?"
- **Conceptual:** unchanged: "The stars have not changed colour. So what is different for the traveler? And why would a star that is neither ahead nor behind change colour?"

**Explanation** (the owner approved items 0 to 8 on 2026-10-16; the changes are marked):
- **0. Your predictions, marked** (unchanged in meaning, wording now points to the marks): "You predicted [bluer]. The traveler measured a shift factor of [2.00], which is bluer, so your prediction matched / did not match. …" (As approved, the tutor marks here and nowhere earlier. At every speed offered the real answer to both questions is **bluer**.)
- **1. What the results show** (unchanged).
- **2. A daily-life example: the siren, with a drawing (NEW drawing T1).** The text stays as approved. **Drawing T1 (the siren):** an ambulance drawn moving to the right, giving out circles of sound that bunch up in front of it and spread out behind it; a listener ahead labelled "hears a higher pitch: the crests arrive more often"; a listener behind labelled "hears a lower pitch: the crests arrive less often"; a person in the ambulance labelled "hears the siren unchanged". The ambulance's speed is drawn at 0.5 times the speed of sound, which is a drawing choice, not a measured value. NASA's "Doppler Shift" page (read 2026-11-23) describes the same pictures.
- **3. The everyday rule, with simple math** (unchanged numbers: 1.60, 0.40, and 1.00 sideways), with **a new sentence making the crest count concrete:** "If 100 crests per second reach someone standing still, a traveler heading toward the star meets 100 + 60 = 160 per second, and a traveler heading away meets 100 − 60 = 40 per second. That is 1.6 times and 0.4 times. For the star straight ahead at 0.6c, the everyday rule counts 1.6 times as many crests."
- **4. Why the real answer is different: time dilation, with a drawing (NEW drawing T2).** The text stays as approved. **Drawing T2 (the clock):** three bars, one for each star (ahead, sideways, behind), each with two stacked parts. The lower part is the everyday factor (1.60, 1.00, 0.40) in grey; the upper part is the extra amount added by dividing by D = 0.800 (so 1.60 → 2.00, 1.00 → 1.25, 0.40 → 0.50) in green, labelled "the traveler's slow clock counts more crests per tick: ÷ 0.800, the same as × 1.25". The three finished heights are labelled 2.00, 1.25 and 0.50 and joined by short lines to the matching dots on the graph. *Note for the owner: the mechanism sentence "the traveler's clock ticks more slowly, so each of its ticks lasts longer" is the approved wording. This draft does not change it.*
- **5. The worked formula** (unchanged), with one added line: "This is the same formula that Einstein printed in 1905, in section 7 of his paper, written with the angle φ between the line source–observer and the observer's motion (φ = 180° − θ). See the links."
- **6. Where blue turns to red, with a drawing (NEW drawing T3).** The text stays as approved. **Drawing T3:** the traveler's sky with three rays from the centre: one at the dashed yellow line (70.5°, labelled "factor 1: same colour as the lab"), one at 90° ("factor 0.80: already shifted toward red here, by D"), and one at 109.5° in the lab's sky for comparison, with a small "why the two skies disagree: Experiment 7" tag.
- **7. A real example** (CHANGED, sources read on 2026-11-23): "The same effect with a siren is the one in NASA's 'Doppler Shift' page: the waves in front of a moving source 'bunch up' and the waves behind spread out. For light from a galaxy moving away from us, astronomers measure a lower frequency, a redshift, and that is how the expansion of the universe was measured (Experiment 1 of Cosmology). The effect on this page is the same effect for light, with the extra factor D that appears when the speed is close to the speed of light: NASA's page says its own formulas are non-relativistic approximations that hold when the speed is much less than the speed of light." *(The cosmic microwave background example stays left out: no source was read.)*
- **8. What was shown and what was not** (unchanged).

**Chapter summary** ("What you learned", shown after the explanation): unchanged in content, with the first sentence now written as an answer to the title question: "Yes: two observers who move relative to each other measure different frequencies, and so different colours, for the same ray of light. …" "What's next" stays as it is today (the group's next experiment, "Rotated, not squashed", is Experiment 9 of this group; its line is checked against the learner's numbering at build time).

---

## 7. Links and the "Words and formulas" box

**"Want to know more?" links** (new, above Part 1; each opens in a new tab; fetched and read on 2026-11-23 through a fetch helper that returned page text and short quotes, so the "what you will find" lines are my reading of what it returned):

| Link | What the learner finds | Status |
|---|---|---|
| NASA, Imagine the Universe!, "Doppler Shift" (`imagine.gsfc.nasa.gov/features/yba/M31_velocity/spectrum/doppler_more.html`) | The siren example with pictures of waves bunching up in front of a moving source, what redshift and blueshift mean, and a note that its simple formulas hold only for speeds much less than light's. | **Read.** "Page Last Updated: Sep 24, 2020." Loaded fully. Its equations are images, so they were not read. |
| NASA Science, "Visible Light" (`science.nasa.gov/ems/09_visiblelight/`) | What visible light is, and the range of wavelengths the eye can see. | **Read.** Last updated Aug 4, 2023. **It says the eye detects "380 to 700 nanometers" (violet at about 380), while this page uses 400 to 700 nm.** See Question 6. |
| Einstein, "On the Electrodynamics of Moving Bodies" (1905), section 7, "Theory of Doppler's Principle and of Aberration", Fourmilab's copy of the 1923 English translation (`fourmilab.ch/etexts/einstein/specrel/www/`) | The original paper. §7 gives the frequency formula used on this page and the aberration formula of Experiment 7. It is a physics paper from 1905, not a plain page, so the link says that and tells the learner to look for section 7. | **Read §7 (2026-11-23)** in two fetches; the first was cut off in the middle of §7 and the second finished it. The formulas are images; the helper read their text equivalents. The 1923 translation writes the speed of light as c where the 1905 German original has V, and footnote *7 says the angle φ′ was misprinted as l′ in the 1923 translation and has been corrected on the page. **This also closes the open gap in Experiment 7, whose §7 had been unreadable.** |

**Held back (not read, so not linked):**
- NASA Science "Universe Glossary A-G" (`science.nasa.gov/universe/glossary-3/a-g/`): the page was truncated by the fetch tool at about 39,000 of 88,000 characters; the "Doppler effect" and "Blueshift" entries were in the part that came back only as a summary. **Not read, so not linked.** The owner could open it.
- NASA Cosmic Times, "Universe is Expanding" (`imagine.gsfc.nasa.gov/educators/programs/cosmictimes/educators/guide/1929/expanding.html`), a possible link for the redshift of galaxies: **found by search, not fetched**.
- The Ives–Stilwell experiment (1938) and later measurements of the sideways Doppler shift of light, which are the real measurements behind the factor 1 ÷ D: **not searched or read**. See Question 8.

**§29 rule 3(c) (the group rule applies to every page):** plain official pages for the siren Doppler effect and for the visible range were found (NASA). For a plain official page that explains the **relativistic** (sideways) case in simple words, none was found in the searches of 2026-11-23, and the original paper is the only source read. The gap goes to "Open" in the specification and the status entry. Nothing unread is linked.

**"Words and formulas" box** (collapsed; new entries in bold, the eight old ones stay; the formula is still added only after the run):
- **Crest, trough:** the highest and lowest parts of a wave.
- **Doppler effect:** the change in a wave's measured frequency because the observer or the source is moving.
- **Lab observer, traveler:** (unchanged).
- **Ray of starlight:** the thin beam of light from a star to an observer.
- **The star we follow:** the star the lab sees exactly sideways, marked with a yellow ring.
- **Wedge:** a slice of the sky: the striped one is within 30° of straight ahead, the dotted one within 30° of straight behind.
- **Time dilation factor D:** D = √(1 − speed²), from Experiment 3. At 0.6c, D = √(1 − 0.36) = 0.8.
- **Everyday factor:** 1 + β cos θ. For the sideways star it is 1.00 at every speed. *(Added after the run, with the formula.)*
- **The shift factor formula** (after the run, as now), with a second worked example: for the star straight ahead, f′ ÷ f = (1 + 0.6) ÷ 0.8 = 2.00, so its wavelength is 550 ÷ 2.00 = 275 nm.
- **Spectrum bar, white mark, YOUR GUESS, orange ring:** a line each.

---

## 8. Physics module: new functions and tests (written and tested first, §9, §10)

New functions in `src/physics/dopplerShift.ts`. **No existing function changes** (the 24 tests and the specification's tables stay as they are).

1. `guessMarkWavelength(prediction, sourceNm)` → the end of the white arrow on the bar, in nm: `bluer` → `sourceNm − 70`, `same` → `sourceNm`, `redder` → `sourceNm + 70`. A fixed illustration of a direction, not a size, independent of speed.
2. `colorSideOf(factor)` → `'bluer' | 'same' | 'redder'` (factor above 1, within 1e-9 of 1, below 1). The tutor's local `outcomeOf` moves here so the page and the tutor use one function.
3. `predictionMatches(prediction, factor)` → boolean, used only by the tutor.
4. `einsteinFrequencyFactor(phiDegrees, speed)` → (1 − cos φ · β) ÷ √(1 − β²), the formula as printed in 1905 §7. Used only for the check-up.
5. `dopplerCheckUpRows(speed)` → the six rows of section 5b: the largest difference between `frequencyFactorOf` and `frequencyFactorFromTravelerAngle` over the seven stars; the same against the energy route (`rayAsMeasuredByTraveler`); the same against `einsteinFrequencyFactor(180 − θ)`; the straight-behind factor against Gravitational Waves 5's `dopplerFactorFor`; the everyday factor ÷ D for the sideways star against the module's factor; the factor at the traveler's crossing angle against 1.
6. `factorCurve(speed, steps)` → points (lab angle, relativistic factor, everyday factor) from 0° to 180° for drawing F.

**Tests:** (a) `guessMarkWavelength`: three values, independent of speed, `bluer` shorter than `same` shorter than `redder`; (b) `colorSideOf` at all four speeds for 0°, 90° and 180° (bluer, bluer, redder for 0.3, 0.6, 0.9 and 0.99c: **bluer at 90° for every speed offered**) and exactly 1 giving `same`; (c) `predictionMatches` for the nine combinations at the Part 1 speed; (d) `einsteinFrequencyFactor(180 − θ, β)` equals `frequencyFactorOf(θ, β)` for several θ and β, with the two values in the note below; (e) the check-up's differences are below 1e-9 and every reading is "the same"; (f) `factorCurve` starts at (1 + β) ÷ D, ends at (1 − β) ÷ D, falls steadily, passes through 1 at `labCrossingAngle`; (g) the existing tests are unchanged and pass. Then **render tests** (as for Experiment 7): first screen (Start over visible and greyed out, Run off), choose both guesses, Run, Parts 2 to 4 appear after the first Run, the white marks appear only after the sky is drawn and follow the guesses, the answers are locked, Start over resets, Part 2's run does not touch Part 1's marks, no white anywhere except the guess marks, the tutor marks the guesses, and no "right" or "wrong" before the tutor's explanation.

*(Correction to test (d), for clarity: `einsteinFrequencyFactor(0, 0.6)`, the observer moving straight away from the source, is (1 − 0.6) ÷ 0.8 = 0.5, and `einsteinFrequencyFactor(180, 0.6)`, the observer moving straight toward it, is 2.0. The check-up calls it with φ = 180° − θ.)*

---

## 9. What this draft does not decide, and what was not checked

- **Not checked:** the SVG markup of the new drawings and marks (none is drawn yet), narrow widths, the browser. The three links were read through a fetch helper that limits quotations, so the descriptions of what each offers are my reading of its summary. The Einstein formulas were read as text equivalents of images, not as typeset formulas. The NASA glossary and the Cosmic Times page were not read. No sideways-Doppler measurement was searched for.
- **Sizes:** the largest new work is the eight drawings (A to D in the introduction, the graph F, and T1 to T3 in the explanation) and the guess marks on the bar. If the owner prefers fewer drawings, Question 3 lists which to drop first.
- The specification, `DEVELOPMENT-STATE.md` and `docs/audit/PROGRESS.md` are not updated until the owner approves this draft and reviews the build (§28.2, §28.5).

---

## 10. Questions for the owner (recommended default first; "all defaults" is a valid answer)

1. **Title.** Default: **change** the title to "Does Your Motion Change the Color of Starlight?", because the old one says the colours shift. Alternative: keep the title.
2. **All the gaps.** Default: fix every gap in `08-gap-report.md` and its re-read: four Parts, Part 1 fixed at 0.6c, two white guess marks on the bar, orange in place of the white ring, Start over, locking, Parts 2 to 4 after the first Run, "Where the real picture comes from", the new introduction lines, look-for items in three parts, check-up and table notes, links and words, tutor pointing to the marks. Alternative: list the ones to skip.
3. **Drawings.** Default: all eight (A to D in the introduction; the graph F in the results; T1 to T3 in the tutor's explanation). Alternative: drop F first, then T3, then C.
4. **The pointer "Experiment 3 showed that clocks do not have to agree" in drawing C's text.** Default: keep it (it names no direction and gives the learner a handle for the tutor's explanation). Alternative: remove it, so nothing in the introduction mentions clocks.
5. **Graph F in the results.** Default: add it, with guess marks. Alternative: leave it out and keep the two tables.
6. **The visible range.** NASA's page says 380 to 700 nm. The page and the specification say 400 to 700 nm (both ends are used in the module and its tests). Default: keep 400 to 700 as a round "about" figure and have the introduction say "about 400 nm (violet) to about 700 nm (red)", as it does, with the links list stating that NASA gives 380 as the violet end. Alternative: change the module's constant to 380, which changes the visible/UV label of any star between 380 and 400 nm at the four speeds (none at 0.6c; the 0.3c star straight ahead is at 404 nm, still visible). (The size of that change was not counted.)
7. **The colour of the dashed ring for the star straight ahead.** Default: orange (`#fb923c`), so white means only the guess. Alternative: another colour you choose.
8. **A real measurement for the check-up.** Default: none (the only real reference is Einstein's printed formula, which the table uses). Alternative: search for the Ives–Stilwell experiment (1938) or a modern test of the sideways Doppler shift and add a "published value" row if a source can be read.
9. **Part 2 pictures.** Default: Part 2 redraws the two sky pictures and the bar for the chosen speed at the same 9-second pace, with no guess marks. Alternative: show the finished pictures at once.
10. **Chapter summary's first sentence.** Default: start with "Yes:", as an answer to the new title. Alternative: leave the summary as approved.
11. **Einstein link.** Default: link Fourmilab's copy of the 1923 translation, tell the learner it is a hard read and to look for section 7. Alternative: leave it out, and record the original paper as an open gap.

---

## 11. Additions to the introduction after the build (2026-11-23, at the owner's requests)

Built into `DopplerShiftIntro.tsx`. **Wording status: the owner asked for each addition, said "want both" (the right-angle sentence and paragraph) and "keep these" (the unsourced statements below), and then "approved" on 2026-11-23.**

1. **"What happens"** rewritten as a numbered walk through the run (five steps, ending with a line that nothing in the list says what color any star turns out to be).
2. **Three paragraphs on what a light wave is made of** (after Drawing A): "What is waving in a light wave?", "Why the right angles?" and "Where does a light wave come from, and what travels?", then "The same kind of wave has many names". Two new drawings: **A2** (the electric and magnetic fields of one wave, the magnetic one drawn slanted) and **A3** (a stadium wave shown twice). Words box: new entries "Electric field and magnetic field" and "Transverse wave".
3. **The sentence on the right angles** carries the condition "in empty space, far from where the light was made". The "Why the right angles?" paragraph also lists where it is not exactly true (near a source, inside guiding pipes, in some materials).
4. **Two NASA links added** (read 2026-11-23): "Anatomy of an Electromagnetic Wave" (updated 3 Aug 2023) and "Introduction to the Electromagnetic Spectrum" (updated 17 Sep 2025). The link text says what NASA does and does not state.

**Open (recorded under §29 rule 3(c); owner's decision of 2026-11-23: keep the wording as the page's own explanation):**
- The speed of light, 299,792 km/s: not in either NASA page's text; standard general knowledge, not source-checked here.
- The electric and magnetic fields are at right angles to each other and to the direction of travel, and the two reasons given (no charges in empty space; the fields make each other): the Anatomy page mentions the right angle only in a picture description. The reasoning is Maxwell's equations from the author's own knowledge, not checked against a source.
- Radio, microwaves, Wi-Fi, infrared, visible light, ultraviolet and X-rays are the same kind of wave, differing in wavelength: neither NASA page says this in so many words.
- A human hair is roughly 80,000 nm wide: a rough figure, not source-checked.

The specification, `DEVELOPMENT-STATE.md` and `docs/audit/PROGRESS.md` were updated after the owner's approval (§28.2, §28.5).
