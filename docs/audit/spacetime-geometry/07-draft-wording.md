# Draft wording: Spacetime Geometry Experiment 7 (new title: "Does Your Motion Change Where a Star Appears?")

**Status:** APPROVED by the owner on 2026-11-23 ("approved"); built in `262cf88`. Originally a draft for the owner's approval, written 2026-11-23 (CLAUDE.md §28.1). Nothing has been built; no code, test, specification or status file has been changed; nothing is committed. The owner chose the title (option 1) and answered "all defaults" to the eleven questions of `07-gap-report.md` on 2026-11-23.

**Source of the numbers:** every number below is from `src/physics/aberration.ts` for the fixed case 0.6c (checked against the specification's tables, 2026-11-23), or is marked as computed here.

| 0.6c | Lab | Traveler |
|---|---|---|
| The star the lab sees sideways | 90° | 53.1° (cos θ′ = 0.6) |
| D = √(1 − 0.6²) | | 0.800 |
| Stars less than 90° from straight ahead | 11 | 17 |
| Stars within 30° of straight ahead (striped wedge) | 5 | 7 |
| Stars within 30° of straight behind (dotted wedge) | 5 | 3 |
| Star at 150° (the specification's second worked case) | 150° | 123.6° |

Part 2's four speeds, for the sideways star: 0.3c → 72.5°, 0.6c → 53.1°, 0.9c → 25.8°, 0.99c → 8.1°.

---

## 0. Title, layout and the four Part leads

**Page heading:** "Experiment 7 — Does Your Motion Change Where a Star Appears?" (sidebar: "Where is the star?"). The word "Aberration" first appears in the introduction's list of new words and in the tutor's explanation. Places to change at build time: the heading (`AberrationExperiment.tsx:391`), the sidebar title (`App.tsx:951`), the specification's title and the audit docs. Any "What's next" line or recap that names "Aberration" is rechecked.

**Layout:** the introduction (with "Some new words"), the "Words and formulas" box and the "Want to know more?" links sit above Part 1 with no heading, in that order (words box above the links, as in Experiment 6). Then the four Parts. Part 1 is fixed on **0.6c**. Part 2 holds the speed buttons. Parts 2 to 4 appear as soon as the first Run has finished.

- **Part 1: Predict, then watch** (amber). "What we are about to do. You will predict where a traveler flying at 0.6c sees one particular star, press Run, and watch two pictures of the sky being drawn. Your guess is drawn on the real picture in white. It never changes the picture."
- **Part 2: Now try it yourself** (pink). "What we are about to do. You choose how fast the traveler flies and press Run these settings. These choices change the drawings. Your guess does not, and it stays locked while you try other speeds. They are trial values for an imagined traveler. They do not say that any real spaceship can fly like that."
- **Part 3: The results** (teal). "What we are about to do. Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your guess beside the real results."
- **Part 4: The tutor** (blue). "What we are about to do. The tutor asks you three questions, one at a time, about what you saw and how your guess compares with the pictures, and then goes through the explanation."

---

## 1. Introduction (CHANGED in four places; everything else stays as the owner approved on 2026-10-16)

Unchanged: "The question", the four new-word entries, "What happens", "What we assume". Changed:

**1a. "The question"** (one added sentence at the end, so the reader knows why the experiment uses a ship): "...which way? To find out, we will use a traveler on a spaceship, because a spaceship can be given any steady speed we like."

**1b. "Some new words"** (two new entries, defined before use; the other four stay):
- **Ray of starlight:** the thin beam of light that travels from a star to an observer. The short arrows in the pictures are rays.
- **The star we follow:** one star that we mark with a yellow ring in both pictures, so you can find it in each. It is the star the lab observer sees exactly sideways.

**1c. "Your job"** (CHANGED, replaces the approved paragraph):
> **Your job.** Predict first. Part 1 uses a traveler flying at **0.6c**. You predict where the traveler will see one particular star: the one the lab observer sees exactly sideways. Choose your answer, then press Run. You are not graded. **Your prediction never changes the pictures or the tables.** They come from the physics. Your guess is drawn on the traveler's sky in white, in a box labelled YOUR GUESS, and it is shown again beside the results. Once you press Run, your guess is locked. After your first run, Part 2 lets you choose other speeds. Those choices *do* change the drawings, but not your guess. If you want to change your guess, press Start over.

**1d. A short "Where does the traveler get a speed from?" is NOT added.** (Not needed; recorded so the owner can ask for it.)

---

## 2. The prediction, the white mark, Start over and locking

**2a. The question** (the approved wording; the speed is now fixed, so it names 0.6c):
> **Make a prediction.** One star lies exactly sideways from the lab observer's point of view: neither ahead of the traveler's path nor behind it. The traveler flies through the middle of the ring at **0.6c**. Where does the traveler see that star? You are not graded, and a guess is fine.
> (a) Exactly sideways, the same as the lab. (b) Ahead of sideways, nearer the direction of travel. (c) Behind sideways, further from the direction of travel.

Under the buttons, before Run: "Choose an option to continue." After a choice: "Your prediction: …".

**2b. The white mark** (drawn on "The traveler's sky", only once the star we follow has been drawn there, i.e. from step 7 of the 13 build-up steps; the mark follows the guess):
- A white box labelled **YOUR GUESS**, joined by a thin white line to a white mark that starts at the sideways (90°) position on the ring.
- (a) "same": a white ring around the sideways (90°) position, and the box says "YOUR GUESS: exactly sideways".
- (b) "ahead": a white arrow along the ring from the sideways position toward straight ahead, and the box says "YOUR GUESS: ahead of sideways".
- (c) "behind": a white arrow along the ring from the sideways position toward straight behind, and the box says "YOUR GUESS: behind sideways".
- The arrow has a fixed length. **It shows a direction only. Your guess had no angle, so the arrow's length means nothing.** The caption says so.
- The mark never says "right", "wrong" or "matched" (§12, §13). The tutor marks the guess in its explanation, and nowhere earlier.

**Change for the owner's approval:** today the yellow ring around the followed star is drawn as soon as any star is drawn (`SkyPicture`, `filled`), which is before that star itself is drawn (it appears at step 7). The ring and the white mark should both appear when the star appears. This is a small change to when the ring is drawn.

**2c. Start over and locking.**
- A **Start over** button, always visible from the first screen, greyed out until there is a chosen guess or a run, and while a run is playing. It clears the guess, the runs, the results and the tutor's progress, and returns the page to its first state.
- After Run, the buttons for the guess are greyed out, with the note: "Your prediction is locked while you try other settings. To change it, press Start over."
- "Run" stays disabled until a guess is chosen. The old behaviour (clicking another answer sends the page back to idle) goes away.

---

## 3. Part 1's picture: caption, mark and "Where the real picture comes from"

The "How to read this diagram" caption keeps the approved sections (the two pictures, what is drawn, what appears when you press Run, words used, a worked moment on reading an angle). Changes:

**3a. A new bullet under "What is drawn in each picture"** (shown once the mark is drawn):
> The **white mark** in the traveler's sky is your guess. The box says YOUR GUESS, and the line joins it to the place the guess is about: the sideways (90°) position, which is where the lab sees the star we follow. A white ring means you guessed "exactly sideways". A white arrow means you guessed ahead of sideways (pointing toward straight ahead) or behind sideways (pointing toward straight behind). **The arrow only shows a direction. Your guess had no angle, so its length means nothing.**

**3b. "What to look for"** (the four bare questions are replaced; each item appears only once the feature it names is drawn; none says which way the stars shift before the learner has guessed and watched):

1. *Appears once the traveler's sky has its first stars (step 1).*
   - **Look at** the dots in the two pictures. **What it means:** both rings hold the same 24 stars, 15° apart in the lab's sky. **Why it matters:** it is the same stars and the same starlight in both pictures, so any difference comes from who is looking.
2. *Appears once the star we follow is drawn in the traveler's sky (step 7), together with your white mark.*
   - **Look at** the yellow ring in each picture. **What it means:** in the lab's sky it sits at the top, at 90°. In the traveler's sky it is drawn at the angle the traveler measures: 53.1° from straight ahead at 0.6c. **Why it matters:** this is the one number your guess was about.
   - **Look at** your white mark and the yellow ring in the traveler's sky. **What it means:** the mark shows which side of sideways you guessed; the ring shows where the star is. **Why it matters:** the two can be compared at a glance. The mark is only a marker, with no angle.
3. *Appears once the whole traveler's sky is drawn (step 13).*
   - **Look at** the two stars straight ahead (0°) and straight behind (180°). **What it means:** compare each with its partner in the other picture. **Why it matters:** these two lie on the line of travel, so they show whether a star on that line behaves like the others.
4. *Appears once the wedge counts are drawn.*
   - **Look at** the numbers beside the striped and dotted wedges, in each picture. **What it means:** at 0.6c the lab counts 5 and 5 and the traveler counts 7 and 3. **Why it matters:** the counts say how the 24 stars are spread around each observer's sky, in numbers instead of dots.

**3c. A worked moment inside the caption, shown once the star is drawn** (replaces nothing; the angle-reading moment stays): "At 0.6c the traveler's angle for the star we follow is 53.1°. In the lab's sky the same star is at 90°. 53.1° is 36.9° less than 90°. The yellow ring in the traveler's sky is drawn at 53.1° from straight ahead."

**3d. "Where the real picture comes from"** (under both sky pictures):
- **Measured:** nothing in these pictures. No one has measured a traveler at 0.6c.
- **Calculated here:** every angle in the traveler's sky, and the wedge counts, are worked out by the page from the lab's angles and the speed, using the aberration formula. The page checks it a second way, from the energy and momentum of each ray of light (Experiment 5), and both give the same angle.
- **Imagined for the question:** the ring of 24 evenly spaced, very distant stars, the lab observer, and a traveler flying at exactly 0.6c. **Your white mark is your guess, not a calculation.**
- (The one real measurement behind the idea is Bradley's, of stars seen from Earth's orbit: see the links and the tutor.)

---

## 4. Part 2: controls and note

**Controls:** the four speed buttons (0.3c, 0.6c, 0.9c, 0.99c) and a button **Run these settings**. The first Run uses 0.6c. Picking a speed redraws the pictures and tables in Part 2 for that speed (Part 1 stays as it was).

**Note beside the controls:** "These buttons change the drawings and the tables below. Your guess does not. It is locked, and it is drawn on Part 1's picture only. These speeds are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that."

**Part 2's pictures** repeat the two sky pictures for the chosen speed, with the same labels and the same "Where the real picture comes from" line, and **no guess mark** (the guess was about 0.6c). Each picture carries the title "Your own speed: 0.9c" (for example). The numbers come from `runSky(speed)`, as today. *(Decision for the owner: Part 2's pictures redraw the whole run at the chosen speed at the same 9-second pace.)*

---

## 5. Part 3: the results, reading guide

**5a. "What you ran"** (Part 1's run; replaces the old line): "A traveler flew through the middle of the ring of 24 stars at 0.6c. The same rays of starlight were measured by the lab and by the traveler. **Your guess** is shown below, next to the row it was about. **It does not change anything on this page.**"

**5b. A check-up table** ("Does this page agree with its own physics?"). Every row's numbers come from the physics module (new functions in section 8). There is no published range for any row, so each reading uses "the same", "more" or "less".

| Check | What we expected | What was found (0.6c) | Reading |
|---|---|---|---|
| The two ways of working out the traveler's angle | The formula and the energy-and-momentum method give the same angle for all seven stars of the table | largest difference 0.0° | the same |
| The star straight ahead (lab 0°) | the same angle for the traveler | 0.0° | the same |
| The star straight behind (lab 180°) | the same angle for the traveler | 180.0° | the same |
| How many stars there are | 24 for the lab, 24 for the traveler | 24 and 24 | the same |
| The order of the stars around the ring | no star passes another | order unchanged | the same |

*(A sixth row, "Earth's orbital speed against the published constant of aberration", is held back: see section 7.)*

**What this table tells us** (note under the check-up):
- **What it is:** five checks the page makes on its own numbers. It is not a test of a real experiment. It checks that the calculation is consistent.
- **What it means with the real numbers:** the formula and the second method (the ray's energy and momentum) give the same angle for every star, so the angle does not depend on which route we took. The two stars on the line of travel stay put (0° and 180°), and the other 22 stars keep their order, so none has jumped over another.
- **Why it matters:** if the page's numbers disagreed with themselves, nothing else on the page could be trusted. They agree, so you can read the tables below knowing the numbers are consistent. (That the numbers are consistent does not say the real sky behaves this way; for a real example, see the tutor.)

**5c. Table "The angles"** (unchanged: seven stars, lab's angle θ, traveler's angle θ′, change; with a tag **YOUR GUESS** on the 90° row, showing only the guess: "(you guessed: ahead of sideways)", with no "right" or "wrong").

**What this table tells us:**
- **What it is:** for seven stars of the upper half of the ring, the angle the lab measures and the angle the traveler measures for the same star. "Change" is the traveler's angle minus the lab's.
- **What it means with the real numbers:** at 0.6c the star at 90° for the lab is at 53.1° for the traveler: a change of −36.9°. The star at 150° is at 123.6° (change −26.4°). The star at 0° stays at 0° and the one at 180° stays at 180°. **A worked check you can do:** for the 90° star, cos θ = 0, so cos θ′ = (0 + 0.6) ÷ (1 + 0) = 0.6, and the angle whose cos is 0.6 is 53.1°.
- **Why it matters:** the column of changes is the whole effect in one list. A change of zero means a star did not shift. A negative change means the traveler measures that star at a smaller angle than the lab does. (Which way that is, and why, is for the tutor.)

**5d. Table "The counts"** (unchanged), with the same **What this table tells us** note:
- **What it is:** how many of the 24 stars fall in each part of the sky, for each observer.
- **What it means with the real numbers:** the lab counts 11 stars less than 90° from straight ahead, and the traveler counts 17. The striped wedge holds 5 for the lab and 7 for the traveler; the dotted wedge holds 5 for the lab and 3 for the traveler.
- **Why it matters:** the dots are hard to count by eye. The counts say plainly that the two observers spread the same 24 stars differently around their skies. The total is 24 in both cases.

**5e. The bars picture** keeps its caption ("How to read these bars") with one added sentence: "At 0.6c the lab's striped-wedge bar is 5 and the traveler's is 7: that is the first pair of bars." Its "What this picture tells us" note follows the same three parts (what it is, what it means with the numbers 11 → 17, 5 → 7, 5 → 3, why it matters: it shows the same counts as the table, so that the change can be seen at a glance). A **"Where the real picture comes from"** line sits under it: counted here from the page's own angles; nothing measured; the stars imagined.

**5f. "The number D"** (unchanged).

**5g. "Your guess, beside the results"** (a short block): "You guessed: **ahead of sideways** (example). The question was: where does the traveler see the star the lab sees exactly sideways? Its number appears in the table 'The angles', in the row for 90°, and in the line 'The star we follow' above." A small tag **YOUR GUESS** sits on that row. No "matched" or "right".

**5h. A line under the Part 2 tables:** "These numbers are for your own speed. They are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that."

*(No comparison table for the speed control: it only moves marks in the pictures, as with Experiment 14.)*

---

## 6. Part 4: the tutor (CHANGED in four places)

- **Observe:** "Look at the two pictures, the white YOUR GUESS mark on the traveler's sky and the tables. What do you notice about where the stars are, in the lab's sky and in the traveler's sky?"
- **Compare:** "You predicted that [the traveler would see the sideways star exactly sideways / ahead of sideways / behind sideways]. That is the white mark. In this run the lab saw that star at 90° and the traveler saw it at 53.1°, where the yellow ring is. Comparing the white mark with the yellow ring, what do you notice?"
- **Conceptual:** unchanged ("The stars did not move. So what changed?").
- **Explanation, new first paragraph, "0. Your guess, marked":** "You guessed [ahead of sideways]. The traveler saw the star at 53.1°, which is [ahead of sideways, less than 90° from straight ahead], so your guess was **right** / so your guess was **not right this time**. (At every speed offered, 0.3c, 0.6c, 0.9c and 0.99c, the traveler sees that star ahead of sideways.)" (As in Experiments 5 and 6, the tutor marks the guess here and nowhere earlier.)
- **Explanation item 7 ("A real example"), rewritten from sources read on 2026-11-23:** "Earth moves around the Sun at 29.78 kilometres per second on average (NASA's Earth Fact Sheet), about one ten-thousandth of the speed of light: 29.78 ÷ 299,792 = 0.0000993. Because of it, each star seems to trace a tiny path in the sky each year. ESA's Gaia pages say the effect was discovered by James Bradley in 1727, and NASA's Goddard history page tells how he worked it out. Working out the size from Earth's speed (computed here: 0.0000993 radians is about 20.5 arcseconds, and an arcsecond is 1/3600 of a degree) gives about a 180th of a degree at most, and the published constant is held back until its source is read." *(Wording to be approved; the "about 20 arcseconds" claim stays marked "computed here" until the published constant's source is read.)*
- Items 1 to 6 and 8 are unchanged. In item 2, "running into the starlight" stays as approved (Decision 13).

---

## 7. Links and the "Words and formulas" box

**"Want to know more?" links** (each opens in a new tab; fetched and read on 2026-11-23):

| Link | What the learner finds | Status |
|---|---|---|
| NASA Goddard, "The Aberration of Starlight" (Stargazers, `pwg.gsfc.nasa.gov/stargaze/Saberr.htm`) | A short history of how astronomers found that stars shift because of Earth's velocity, with a boat-and-flag picture and the 30 km/s worked out. | **Read.** Archival page (updated 2004 to 2016, "no longer being updated"). It gives 1729 for Bradley's boat trip, where ESA gives 1727 for the discovery; it never defines aberration in one sentence. |
| ESA, Gaia, "Measuring the acceleration of the Solar System with Gaia" (`sci.esa.int/web/gaia/-/measuring-the-acceleration-of-the-solar-system-with-gaia`) | A one-line meaning of aberration, Bradley in 1727, and how Gaia uses it on distant quasars. | **Read.** Dated 3 December 2020; the site says it is "under review and not being updated". Only a short definition, no mechanism. |
| NASA, Earth Fact Sheet (`nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html`) | Earth's orbital speed (mean 29.78 km/s). | **Read.** Last updated 15 November 2024. |

**Held back (not read, so not linked):**
- Bradley's paper (*Phil. Trans.* vol. 35, 1728; the DOI redirects to `royalsocietypublishing.org/rstl/article/35/406/637/...`): the site returned 403 to the fetch tool. **Not read.** The owner could open it, or it stays an open gap. The date to quote (the paper was read to the Royal Society in January 1729) is from MacTutor, a secondary source.
- Einstein 1905, §7 (Annalen der Physik 17, 891-921): the fourmilab page loaded but was cut off at the start of §7 and the Pitt page stops after §2. **§7's text was not read.**
- Britannica's "constant of aberration": 403. The value 20.49552″ is in Wikipedia's table of astronomical constants (IAU 1976 system), a secondary source; the IAU resolution itself was not found or read.
- Linda Hall Library's "Scientist of the Day: James Bradley" (2017) was read and is the plainest story of the discovery, but a library is not an official space agency (§29 rule 3). The owner may allow it as an extra link.
- Royal Museums Greenwich: the page is a record of a painting; not linked.

**§29 rule 3(c):** plain official pages for aberration were found (NASA, ESA). The gaps are the two original papers; they go to "Open" in the specification and the status entry. Nothing unread is linked.

**"Words and formulas" box** (new entries, with the four existing ones; plain meanings, each defined before use):
- **Ray of starlight:** the thin beam of light that travels from a star to an observer.
- **The star we follow:** the star the lab sees exactly sideways, marked with a yellow ring in both pictures.
- **Wedge:** a slice of the sky. The striped wedge is every direction within 30° of straight ahead, and the dotted wedge is every direction within 30° of straight behind.
- **Arcsecond:** a very small angle, 1/3600 of a degree. 20 arcseconds is about a 180th of a degree.
- **The number D:** D = √(1 − speed²), the same factor as the moving clock of Experiment 3. At 0.6c, D = √(1 − 0.36) = 0.8.
- **The rain rule** (added after the run, with the formula): a rule from everyday life that gets the sideways star nearly right at 0.3c (73.3° against 72.5°) and badly wrong at 0.9c (48.0° against 25.8°).
- The formula entry (cos θ′ = (cos θ + β) ÷ (1 + β cos θ), worked for 0.6c: 53.1°) is still added only after the run (§12).

---

## 8. Physics module: new functions and tests (written and tested before any interface change)

New functions in `src/physics/aberration.ts`; **no existing function changes** (Experiments 8 and 9 import from this module).

1. `guessSideOf(prediction)` → the guess's side: `'none'`, `'toward-ahead'`, `'toward-behind'`.
2. `guessMarkAngles(prediction)` → `{ startAngle: 90, endAngle }`: 90 → 90 for "same", 90 → 60 for "ahead", 90 → 120 for "behind". The end angles are fixed illustrations of a direction, not a size, and are independent of the speed.
3. `realSidewaysSide(speed)` → `'ahead' | 'same' | 'behind'`, from `travelerAngleOf(90, speed)` compared with 90°.
4. `predictionMatches(prediction, speed)` → boolean, used only by the tutor.
5. `aberrationCheckUpRows(speed)` → the five rows of section 5b: the largest difference between `travelerAngleOf` and `rayAsMeasuredByTraveler(...).starAngle` over the seven stars; the traveler's angles for 0° and 180°; the star counts; whether the order of the traveler's angles round the ring is unchanged.

**Tests:** (a) `realSidewaysSide` is "ahead" for 0.3, 0.6, 0.9, 0.99, "same" for 0; (b) `guessMarkAngles` ends on the correct side of 90°, is independent of speed, and "same" has no arrow; (c) `predictionMatches` for all three guesses at all four speeds; (d) the check-up's largest difference is below 1e-9 and the counts and the order rows are "the same"; (e) existing 26 tests unchanged and passing. Then **render tests** for the component: first screen (Start over visible and greyed out, Run disabled), choose a guess, Run, Parts 2 to 4 appear after the first Run, the white mark appears only after the star is drawn and follows the guess, the guess is locked, Start over resets, Part 2's run does not touch Part 1's mark, the tutor marks the guess, no "right"/"wrong" before the tutor's explanation.

---

## 9. What is not decided here, and what was not checked

- **Open for the owner:** (1) the ring's timing change in 2b; (2) whether Part 2 repeats the full 9-second run; (3) whether the tutor's item 7 says "about 20 arcseconds" before the constant's source is read; (4) whether to allow the Linda Hall link; (5) the two unread original papers.
- **Not checked:** the SVG markup of the new mark (not yet drawn), narrow widths, the browser. The links were read through page summaries by a fetch tool, which limits how much of each page could be quoted; the wording of what each link offers is my own reading of those summaries.
- The specification, `DEVELOPMENT-STATE.md` and `docs/audit/PROGRESS.md` are not updated until the owner approves this draft and the build is reviewed (§28.2, §28.5).
