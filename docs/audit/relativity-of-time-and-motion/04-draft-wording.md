# Draft wording: Relativity of Time and Motion Experiment 4 (The Light Clock: Why Time Dilation Happens)
Date: 2026-11-08 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following Relativity 1 to 3, `01-` to `03-draft-wording.md`, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-08, "all defaults" to the eleven questions of the gap report): fix every gap; Part 1 fixed at 0.5c with the speed (no 0c) in Part 2, opening at 0.8c; two time bars (rest tick, moving tick) under the two panels with a white mark on the moving bar and an edge arrow, Part 1's scale 0 to twice the rest tick and Drawing A's scale 0 to twice the moving tick, **no white "guessed V"**; Drawing A with the moving bar in pink, no white mark, and "Runs so far"; the tutor marks the guess with no score and the half-trip arithmetic moves into the module with tests; the two "light clock" paragraphs of the introduction merged, the chapters' titles used, the constancy of light's speed left unstated before the run; no check-up or setting-following table; links searched, read first, with gaps recorded; a words box of terms only (no algebraic formula); shared `toggle-button` class; size Medium.

## Layout
- **Above Part 1 (no heading):** the introduction (its assumptions list stays), "Want to know more?" (one link and recorded gaps), a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the guess, START (0.5c), the two light-clock panels (rest and moving) with the lab-time readout, and, once the run ends, the **two tick bars** with the white YOUR GUESS mark, "Where the real picture comes from" and captions.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** speed buttons (0.1c, 0.3c, 0.5c, 0.8c, or 0.01c to 0.99c), "Run your speed", a live pair of panels, **Drawing A** (the bars for the learner's speed, the moving bar in pink), "Runs so far", a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 run with the guess beside them, a tag on the moving tick line, and "What these results tell us".
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while a run plays. Page width unchanged (900 px). Buttons use the shared `toggle-button` class.
- **Colours:** white is only the learner's guess; pink only the learner's own speed in Part 2; the rest clock stays blue and the moving clock amber, as the bars and the pulse are drawn.

---

## 1. Introduction

Paragraphs not listed ("The question", "How this differs from...", "What we assume") stay as approved, except that "Experiment 2" and "Experiment 3" become the chapters' titles ("Two clocks at rest", "Moving clock") and the lines below are added or changed.

**1a. "A daily-life picture" and "What a light clock is", merged.** Old: two paragraphs that say nearly the same thing (and Relativity 3's new paragraph says it a third time). New, one paragraph:
"**What a light clock is.** Any steady, repeating process can work as a clock: a heartbeat, a dripping faucet, a pendulum's swing. A light clock is the simplest version physics can build. Two mirrors face each other, one above the other, and a flash of light bounces between them: up, down, up, down. One trip up and back down is one **tick**, just like one tick of an ordinary clock, and the clock counts ticks."

**1b. "How far apart are the mirrors?"** Kept. One sentence changes (old: "Real clocks are much smaller. We use a giant clock so that the numbers are easy to read."). New: "Real light clocks are much smaller: with the mirrors only 15 cm apart, a clock would tick about a billion times a second. We use a giant clock so that the numbers are easy to read."
(Sourced: Einstein-Online, read 2026-11-08, "at a mirror distance of only 15 centimeters... our clock would tick every billionth of a second"; it also gives "150,000 kilometers... ticks exactly once per second", the number this page uses.)

**1c. "What happens"** (old: "...From the lab, we watch one tick of each clock and draw the path the pulse of light takes."). New:
"Two identical light clocks start at the same moment: in both, a flash of light leaves the bottom mirror together. One clock stands still in the lab, the place where the experiment is set up. The other moves **sideways**, across the light's up-and-down path, at a steady speed. From the lab, we watch one tick of each clock and draw the path the flash of light takes. In Part 1 the moving clock goes at 0.5c, which is half the speed of light. When the run ends, two bars appear that show how long each tick took on the lab's clocks. In Part 2 you choose any speed and run that."

**1d. "Your job"** (old: "...A wrong guess is fine. Guesses are not scored."). New, appended: "Then watch both clocks, try other speeds in Part 2, and talk it over with the tutor."

**1e. New paragraph, "Your guess and the real pictures."**
"Your guess never changes the real pictures, the clocks or the numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the bars in white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the speed you choose does change the clocks and the drawings, and the marks it moves are pink."

**1f. Added to "What we assume"** (the note beside the speed buttons moves to Part 2, and Part 1's fixed 0.5c is explained here, before the learner predicts):
"**c** is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that."

**1g. New line, "Some new words."**
"The "Words and formulas" box below has each one, with a short plain meaning: light clock, tick, mirror, light pulse, light-second, lab seconds, lab time, reference frame, at rest, moving, sideways, c, time dilation."

**Kept as the specification requires:** the introduction does **not** say that light's speed is the same for both clocks. That stays with the tutor.

---

## 2. "Want to know more?" (opens in a new tab)

1. **NASA Science: "Our Milky Way Galaxy: How Big is Space?"** (NASA Science, Exoplanet Exploration Program; updated April 2024; fetched and read 2026-11-08 for Relativity 3). "A short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second, and how far it goes in a minute, a year and more."

**No plain official page found for "light-second" or "reference frame" (§29 rule 3(c)).** As recorded for Relativity 3 and 2; the introduction defines both in its own words.

**Searched 2026-11-08 for a plain NASA, ESA, NIST or CERN page on time dilation, the light clock and the constancy of light's speed: none surfaced.** The searches returned papers, a university lesson, news and encyclopedia pages, not an official plain page.

**One good candidate, held back on purpose:** **Einstein-Online, "From light clocks to time dilation"** (Markus Pössel, in *Einstein Online* vol. 13, 2021; provided by the Max Planck Institute for Gravitational Physics, Albert Einstein Institute, Potsdam; fetched and read 2026-11-08 through a helper). It is plain language with no algebra, describes the light clock with mirrors and a tick, states the constancy of the speed of light as a postulate ("299,792,458 meters per second, or about 300,000 kilometers per second") and works the zigzag example. **It also reasons its way to this experiment's answer**: the moving light travels a longer zigzag path, so the tick is longer ("the moving light clock goes only half as fast"), with a worked example at about 86.7 percent of the speed of light. Linked from the start, it would give the learner the reasoning the tutor's conceptual question asks them to find, and the specification deliberately withholds the constancy of light's speed until the tutor. **So it is not linked from the introduction.** Recommended: it appears as a second line in "Want to know more?" **only after the tutor's explanation** (Part 4, once the tutor is done), described as "the same light clock, explained again by the Max Planck Institute for Gravitational Physics; it gives away nothing you have not now seen". Question 3 below. Whether a research institute's education portal counts as an "official source" under §29 rule 3 is also the owner's call.

**No real result, so no paper:** the numbers come from the geometry the specification gives, not from a measurement.

---

## 3. "Words and formulas" (collapsed box; terms only, no formula, as the specification reserves the algebra)

- **Light clock:** a clock made of two mirrors facing each other, with a flash of light bouncing between them. It counts each round trip of the flash.
- **Tick:** one round trip of the flash, up to the top mirror and back. The clock counts ticks to measure time.
- **Mirror:** a flat shiny surface that bounces light back.
- **Light pulse:** a very short flash of light.
- **Light-second:** the distance light travels in one second, about 300,000 km.
- **Lab seconds:** seconds counted by the clocks standing still in the lab.
- **Lab time:** the time shown on the lab's clocks.
- **Reference frame:** a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others.
- **At rest / moving:** standing still, or not standing still, compared with the lab.
- **Sideways:** across the light's up-and-down path, not along it.
- **c:** the speed of light, about 300,000 km every second. 0.5c is half of that.
- **Time dilation:** the name for a moving clock counting less time than the lab's clock between the same two events (found in "Moving clock").

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess how long one tick of the moving clock will take, in lab seconds. Then you press START and watch one tick of each clock, with the moving clock going at 0.5c and the path of each flash of light drawn as it goes. When the run finishes, two bars appear that show how long each tick took on the lab's clocks, with your guess drawn on them in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a speed from 0.01c to 0.99c and watch one tick of each clock at that speed. The speed you choose changes the clocks and the drawing in this Part, marked in pink. It does not change Part 1's pictures, the results in Part 3, or your guess."
*Note beside the speed buttons* (after the c explanation moved from the controls): "Your guess does not change these drawings, but the speed you choose does."
*Before any Part 2 run:* "Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or with the speed you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white guess mark, then explains."

---

## 5. The prediction

**Question** (old text had the chosen speed): "The clock standing still ticks once every 1 second. The other clock moves sideways at 0.5c. Someone in the lab watches the light pulse in each clock, timing it with the lab's clocks. How many lab seconds will one tick of the moving clock take? Type a number." One box, "Your guess for one tick of the moving clock (lab seconds)". Line under it: "Your prediction: N seconds" or "Enter a prediction to continue".
After START: "Your prediction is locked while you try other speeds. To change it, press Start over." START stays disabled until a guess is typed. **Start over** is always visible, greyed out until a guess is typed or a run has started, and while a run plays. After the first run, START is replaced by "Run your speed" in Part 2.

---

## 6. Part 1's pictures: the two light clocks and the two tick bars

**The panels, labelled on the canvas (new):** each panel gets its title drawn inside the picture ("Rest clock: at rest in the lab" and "Moving clock: seen from the lab"), "Top mirror" above the top bar, "Bottom mirror" below the bottom bar, "Light pulse" beside the yellow dot, "Path of the light" along the yellow line, and, on the moving panel, "Where the mirrors started" beside the dashed lines (replacing the bare word "start"). Exact placement is checked in the browser, including the stacked 720-unit layout above about 0.93c. The existing captions ("At rest in the lab"; "Moving at Xc (seen from the lab)...") become part of the caption below.

**The two tick bars (new), shown when the run ends:** one scale in lab seconds from 0 to 2 (twice the rest tick), ticks and numbers at 0, 1 and 2 s. Two bars, "Rest clock: one tick" (blue) ending at 1.000 s and "Moving clock: one tick" (amber) ending at the real tick (1.155 s at 0.5c), each with its number under the end, joined by a dashed line where both pulses leave the bottom mirror together. **The white mark:** a white dot on the moving bar at the guessed number of seconds, joined by a line to a white box "YOUR GUESS: N seconds"; a guess beyond the scale (or below 0) is a white arrow at the edge and the box says "(off the scale)". The mark appears only when the bars appear (§12).

**"Where the real picture comes from":** under the panels: "Calculated here from the speed, not measured: the clock slides sideways while the flash goes up and down. The light clock itself is imagined: a giant clock with its mirrors half a light-second (150,000 km) apart, so that the numbers are easy to read. Real light clocks are much smaller. No instrument measured these ticks." Under the bars: "Calculated here, not measured: each tick's length comes from the path the flash takes. The light clock is imagined, as above. The white mark is only your guess, placed on the same scale."

**Caption 1, "How to read the two light clocks"** (shown from the start; only what is drawn before the run):
- **Two panels** show the same kind of clock. The left, the **Rest clock**, stands still in the lab. The right, the **Moving clock**, moves sideways, seen from the lab.
- **In each panel:** two black bars are the **mirrors**, one above the other. The yellow dot is the **light pulse**, and the yellow line is the **path** it has taken so far. The two panels use the same scale, so you can compare the paths by eye.
- **The moving clock:** the whole clock, the light source and both mirrors, slides sideways together. The dashed lines show where the mirrors started.
- **The readouts:** above the panels, "Lab time" is the time on the clocks standing still in the lab. Each panel's box shows that clock's own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds).
- **When the run ends:** the run lasts exactly one tick of the moving clock (one round trip of its pulse). The rest clock keeps ticking, so at the end it is already part-way through its second trip.

**Caption 2, "How to read the two tick bars"** (shown with the bars, after the run):
- **The bars** are a time scale in lab seconds: the further right, the longer. 0 s is the moment both pulses left the bottom mirror, 1 s is one tick of the rest clock and 2 s is twice that, so there is room to the right. The top bar is how long one tick of the rest clock took; the bottom bar is how long one tick of the moving clock took, both on the lab's clocks.
- **The white mark and the YOUR GUESS box** are your guess, placed on the same scale. A white arrow at the edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves a bar.

*A worked moment.* At 0.5c, one tick of the moving clock took 1.155 s on the lab's clocks, while one tick of the rest clock took 1.000 s. During that tick the moving clock slid 0.5 × 1.155 = 0.577 light-seconds sideways. If you had guessed 1.3, your white mark would sit at 1.3 s, 0.145 seconds to the right of the end of the moving bar. (Every number comes from the module; none states the speed of light is constant, which the tutor does.)

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the ends of the two bars. **What it means:** how long one tick took on the lab's clocks, for each clock: 1.000 s and 1.155 s. **Why it matters:** the question of this experiment is how long one tick of a moving light clock takes, compared with one tick of a clock that stands still.
2. **Look at** the gap between the end of the rest bar and the end of the moving bar. **What it means:** how much longer the moving clock's tick took: 1.155 − 1.000 = 0.155 seconds. **Why it matters:** it makes the difference visible as a length, not only as a number.
3. **Look at** the white YOUR GUESS mark and the end of the moving bar. **What it means:** the gap between them, if there is one, is how far your guess was from the real tick, in seconds. **Why it matters:** it puts what you expected beside what the clock showed.
(Items about the two light paths belong to the panels, whose final frame shows the moving clock's full path but only the start of the rest clock's second trip; the tutor's first question asks about the paths, and the learner has watched them during the run.)

---

## 7. Part 2's picture: Drawing A

**Drawn:** the live pair of panels for the chosen speed (they run as in Part 1) and, when the run ends, the same two bars on a scale from 0 to **twice the moving tick** (so the moving bar ends halfway; a 0.8c tick of 1.667 s gives a scale to 3.333 s), with **the moving bar and its end number in pink** (the rest bar stays blue). The white guess is **not** redrawn (it was a guess for the 0.5c run). Below it, "Runs so far": one line per run, such as "0.8c: rest tick 1.000 s, moving tick 1.667 s".

**"Where the real picture comes from":** as in Part 1, with "the speed you chose".

**Caption, "How to read Drawing A":** the panels work as in Part 1, for the speed you chose; the bars work as in Part 1, but the scale changes with the speed (it always runs to twice the moving tick, so the pink bar always ends halfway); pink marks your own speed; "Runs so far" lists every run in this Part. *Worked moment:* at 0.8c the moving clock slid 0.8 × 1.667 = 1.333 light-seconds sideways during one tick, and one tick took 1.667 s. **Look at** the pink bar's end in each run in "Runs so far". **What it means:** how long one tick of the moving clock took for the speed you chose (at 0.1c 1.005 s; at 0.8c 1.667 s). **Why it matters:** it shows how the tick you saw in Part 1 depends on the speed. (It names no explanation; the tutor gives that, §12.)

---

## 8. Results (Part 3)

Lines as today (the speed; the rest clock's distance, tick time and light's speed; the moving clock's distance, tick time, sideways distance and light's speed; "You guessed" beside "The real time for one tick of the moving clock, on the lab's clocks"), with:
- A small "your guess" tag on the moving clock's tick-time line and the line "Your guess is drawn on Part 1's bars as the white mark."
- Under the lines, **"What these results tell us"** (what it is, what it means with the real numbers, why it matters; no mechanism):
  - **The rest clock.** "One tick: 1.000 light-second of path in 1.000 s. Why it matters: this clock stands still, so it is the one to compare the moving clock with."
  - **The moving clock.** "One tick: a path of 1.155 light-seconds in 1.155 s, while the clock slid 0.577 light-seconds sideways. Why it matters: the path is longer, and so is the tick."
  - **Light's speed, seen from the lab.** "Path divided by time: 1.000c for both clocks. Why it matters: the two numbers are equal, which is worth noticing; the tutor will ask you about it."
- **"Where this comes from:** calculated here from the speed (see the captions under the pictures). Nothing here changes with your guess or with the speed you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: the page computes each tick from the same geometry a check would use, so a check-up would be circular.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe:** "Look at the two light paths and at the two bars. What did you notice about the two light paths?"
- **Compare:** "You guessed that one tick of the moving clock would take [N] seconds. That is the white mark on the bars. On the lab's clocks it really took [X] seconds, while one tick of the clock standing still took 1.000 seconds. What do you notice when you compare them?"
- **Conceptual:** unchanged ("Both light pulses travelled at the same speed. But one of them had farther to go. What does that tell you about how long its trip takes?").
- **Explanation:** the specification's paragraphs stay as today ("First, the clock itself", the train-and-ball comparison, "In the lab's reference frame", "In the moving clock's own reference frame", "So:", "Working out the diagonal", the constancy of light's speed as the assumption, "At [v]c, one tick...", "What this means for a traveller"), with "Experiment 3" replaced by "Moving clock". One sentence is added in "So:" (§15: define the term before using it): "A **right triangle** is a triangle with one square corner. Its long side, opposite the square corner, is called the diagonal." The half-trip numbers in "Working out the diagonal" come from the module. Then:
  - **Your guess, marked** (no score): "Your guess, [N] seconds, is the same as the [X] seconds one tick of the moving clock took" or "was [D] seconds more / less than the [X] seconds one tick of the moving clock took, and [E] seconds more / less than the rest clock's 1.000 seconds."
  - **1. Why your guess did not change the clocks.** "Whatever you guessed, one tick of the moving clock took its own [X] seconds on the lab's clocks. Think of two kitchen timers: guessing that one of them will ring early does not make it ring early. A different guess only changes the gap between your white mark and the end of the bar."
  - **2. What the bars show.** "The two bars start together, when both pulses leave the bottom mirror, and end at the two ticks, 1.000 and [X] seconds. The gap between their ends is how much longer the moving clock's tick took, and it comes from the longer path the light has to take."
  - **3. Try it in Part 2.** "Try 0.1c and 0.8c. At 0.1c the tick is 1.005 seconds, hardly longer than the rest clock's; at 0.8c it is 1.667 seconds. Try 0.99c: one tick takes 7.089 seconds." (numbers from the module; the 0.99c run plays for about 14 seconds)
  - **4. What comes next.** "This experiment showed why a moving clock's ticks are farther apart. In the next chapter, "Why can't light go faster?", you look at the assumption it rested on: that light's speed does not change."
  (The sentence "This is an established physical fact (it is Einstein's postulate)" stays as written; it is now sourced by Einstein-Online, which calls it a basic postulate and gives 299,792,458 m/s. Recorded in the specification's source table.)

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `lightClockExperiment.ts`:
- `tickBarsScaleEnd(experiment, basis)` returns twice the rest tick (`'rest'`, Part 1) or twice the moving tick (`'moving'`, Drawing A).
- `guessPositionOnTickBars(experiment, guess)` returns the scale's end (twice the rest tick), the guess's position as a fraction 0 to 1 (clamped), which edge it is off (`'left'`, `'right'` or none), and the guess minus the moving clock's real tick and minus the rest clock's. It refuses a guess that is not finite.
- `halfTripNumbers(experiment)` returns, for the tutor's "Working out the diagonal", the rise (the mirror separation), the sideways distance in the half-tick, the diagonal for the trip up and the round-trip path.

Tests (in `lightClockExperiment.test.ts`):
1. The scales end at twice the rest tick (2 s) and twice the moving tick (1.155 × 2 at 0.5c; 3.333 at 0.8c).
2. A guess equal to the rest tick sits at 0.5 on Part 1's scale, 0 at 0, 2 s at 1.
3. A guess beyond the scale is clamped to 1 and flagged `'right'`; a negative guess is clamped to 0 and flagged `'left'`.
4. The differences are exact: for 0.5c, a guess of 1.3 gives +0.145 from the moving tick and +0.3 from the rest tick.
5. The real result is the same for any guess.
6. A non-finite guess is refused.
7. `halfTripNumbers` at 0.5c gives rise 0.5, sideways half 0.289, diagonal 0.577 and round trip 1.155; the diagonal squared equals rise squared plus sideways half squared at every preset speed; the round trip equals the module's `movingLightPath`.

---

## 11. Specification changes (only after approval, §28.2)

`04-light-clock.md`: Learner Controls (the speed moves to Part 2; Part 1 fixed at 0.5c; no 0c), the Display (the labelled panels, the two tick bars, the guess mark, Drawing A, "Runs so far", the layout of four Parts, Start over, the shared button class), Results Display (the tag and "What these results tell us"), the Tutor sections (marks the guess, points 1 to 4, the right-triangle sentence, half-trip numbers in the module), a new "Audit update" section, a source table (the NASA Science page; Einstein-Online read and held back, and why; "no plain official page found" for light-second, reference frame, time dilation and the light clock; "no real result, no paper"), and the open items. The introduction's "Real clocks are much smaller" gets its source.

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction:** 1a to 1g (the merged light-clock paragraph, the 15 cm sentence, "What happens", "Your job", "Your guess and the real pictures", the definition of c, new words)? [yes]
2. **Link and gaps:** the NASA Science page as the one link from the start, with the gaps recorded for the light-second, reference frame, time dilation and the light clock? [yes]
3. **Einstein-Online:** hold it back from the introduction because it gives away the reasoning, and show it as a second line in "Want to know more?" only after the tutor's explanation? Or link it from the start with a warning that it explains the answer, or not at all? [after the tutor's explanation]
4. **Words box:** the twelve entries, terms only? [yes]
5. **Leads, the note beside the speed buttons, and the prediction wording:** approve? [yes]
6. **Panels and bars:** the canvas labels, two tick bars on 0 to twice the rest tick with a white mark and edge arrow, the captions as drafted, and no white "guessed V"? [yes]
7. **The rest clock's last frame:** at the end of the run the rest panel shows only the start of its second trip (the caption says so). Leave it, or also draw the rest clock's first complete tick as a faint line so the two paths can be compared in the final frame? [leave it, with the caption]
8. **Drawing A:** the live panels, the bars to twice the moving tick, the pink moving bar, "Runs so far", the caption? [yes]
9. **Results:** the tag, the three notes and the "Where this comes from" line, no table? [yes]
10. **Tutor:** the new prompts, the right-triangle sentence and points 1 to 4 (point 3 suggests 0.1c, 0.8c and 0.99c; a 0.99c run plays for about 14 seconds)? [yes]
11. **Source reading:** the Einstein-Online page was read through a helper that reported its content; the agent did not read it itself. Accept? [accept; flagged in the specification]
12. **Experiment 3's 15 cm example:** Einstein-Online confirms it ("at a mirror distance of only 15 centimeters... tick every billionth of a second"). Update Relativity 3's specification source table, which now says "no source: the agent's own arithmetic", to cite it? [yes]

---

## Addendum 3, 2026-11-08 (after the build): "Why does time dilation happen?" explained in the introduction
**Owner's request (2026-11-08):** "you have not explained anywhere why dilation happens. Time dilation is a very important concept. The intro should be more detailed, explanatory in simple terms so that the user understands it completely. The length of the intro is of no concern." Asked where it should go, the owner chose **in the introduction, before the prediction**. This reverses the order the specification kept (the constancy of light's speed "deliberately not stated before the run", `04-light-clock.md`, Display, "Introductory text"; CLAUDE.md §12). The reason was already in the tutor's explanation (Part 4, after the run); it is now also in the introduction. DRAFT, not built. The text is the owner's to approve (§28.1).

**Placement.** A new section in the introduction, after "How far apart are the mirrors?" and before "What happens", headed "Why does time dilation happen? The whole idea, step by step". The worked example uses **0.6c, 10 s**, which is not Part 1's speed (0.5c) and not a preset, so the learner still has to apply the method to predict the Part 1 tick (1.155 s) and is not handed it. 0.6c gives clean numbers (a 3-4-5 triangle): tick 1.25 s, sideways 0.75 light-seconds, half-trip sideways 0.375, rise 0.5, diagonal 0.625, factor 0.8 (the specification's own worked example in "A moving clock": 10 s gives 8.0 s). All come from the module (`runLightClockExperiment(0.6)`, `halfTripNumbers`).

### The new section (draft wording)

**Why does time dilation happen? The whole idea, step by step**

*Lead.* In "A moving clock", a moving clock counted less time than the lab's clock between the same two events. That is time dilation. Here is the whole reason, in seven small steps. Nothing needs more than a bit of arithmetic. We use the light clock because it makes each step easy to see.

**Step 1. A tick is a distance divided by a speed.** A light clock ticks each time the flash makes one round trip, up and back. How long that takes depends on only two things: how far the flash travels and how fast it goes. Time is distance divided by speed. A car going 60 km in an hour takes 1 hour to go 60 km; going 120 km takes 2 hours. In our clock the flash goes up 0.5 and back down 0.5, 1 light-second in all. Light goes 1 light-second every second, so: time = distance ÷ speed = 1 light-second ÷ 1 light-second per second = 1 second. One tick takes 1 second.

**Step 2. One tick, two views.** Now let the clock move sideways. Someone riding along with the clock sees nothing unusual: the lamp and both mirrors are right beside them, so the flash goes straight up and straight back down, exactly as in the clock that stands still. But someone in the lab sees the whole clock slide sideways while the flash is travelling. Toss a ball straight up inside a train moving at a steady speed. To you, on the train, it goes straight up and down. To a friend on the platform it traces a slanted path, because the train carries it forward all the time it is in the air. Same ball, two views, and both are correct. The same happens to the flash. So, from the lab, its path is slanted: up and sideways, then down and sideways, like an upside-down "V".

Why that shape? Follow the flash in two trips. **On the way up**, the flash leaves the lamp and heads for the top mirror. All the while, the clock keeps sliding sideways, so the top mirror is farther along when the flash arrives than it was when the flash left. The flash has to cover that sideways drift as well as the rise, so it climbs at a slant: up and forward, like a ball tossed up on the train and seen from the platform. **On the way down**, the flash heads back to the lamp, which is still sliding sideways. So the flash again goes forward as it falls: down and forward. Put the two trips together and the path rises to a peak at the top mirror, then comes down again, both trips leaning the same way along the direction of motion. That is an upside-down "V". (If the clock stood still, there would be no sideways drift, and the two trips would be a straight line up and the same line back down.)

**Step 3. The slanted path is longer.** Look at one half of the V, the trip up. It has two parts: the flash rises 0.5 light-seconds, and, while it rises, the clock slides sideways. Together they make a right triangle. A right triangle has one square corner; the slanted side opposite the corner is the diagonal, and it is always longer than either of the other two sides. (Cutting across a field is shorter than walking along two sides of it, but longer than walking along either side alone.) So the flash has farther to go in the lab than in its own clock. The rule that links the three sides: each short side multiplied by itself, added together, equals the long side multiplied by itself. For example, a triangle with sides 3 and 4 has a long side 5, because 3 × 3 + 4 × 4 = 9 + 16 = 25 = 5 × 5.

**Step 4. Light does not speed up to make up the difference.** This is the key assumption, and it is surprising. In the lab, light always travels at the same speed, c, which is 1 light-second every second, whether the clock stands still or moves. It does not get a boost from the clock's sideways motion. This is one of the two basic ideas, called postulates, of Einstein's special theory of relativity; a postulate is a starting point a theory is built on. It is not what you would expect from everyday life: a ball thrown forward from a moving train is seen by the friend on the platform to go faster than the thrower's own throw, because the train's speed adds. Light does not behave like that. We take it as a fact of nature here, and the next chapter, "Why can't light go faster?", looks at it.

**Step 5. A longer path at the same speed takes more time.** Two runners at the same speed set off together; one runs straight, the other has to zig-zag. The zig-zagger arrives later. The flash is the second runner. Let us find its tick at 0.6c (not the speed you will predict, so you still have work to do) by trying a value. For each try we ask two questions: how far does the flash go in that time, and how far does it need to go to reach the mirror? If the two match, we have the right tick. If the flash goes too short a distance, the tick must be longer; if it goes too far, the tick must be shorter. Each try uses the same four lines.

- **Try a tick of 1 second.**
  - *How far the flash goes up the slant:* light goes 1 light-second every second, so in 1 second it goes 1. The trip up is half of that: 0.5.
  - *How far the clock slides during the trip up:* in 1 second it slides 0.6 × 1 = 0.6. Half of that: 0.3.
  - *How far the flash needs to go to reach the mirror:* that is the long side of the triangle from Step 3, with short sides 0.5 and 0.3. 0.5 × 0.5 + 0.3 × 0.3 = 0.34. The number that multiplied by itself gives 0.34 is 0.583, so the flash needs 0.583.
  - *Compare:* In 1 second the flash has gone 0.5, but it must go 0.583 to reach the mirror. It is still on its way, so the trip up needs more time. The tick is longer than 1 s.
- **Try a tick of 1.5 seconds.**
  - *How far the flash goes up the slant:* in 1.5 seconds it goes 1.5. The trip up is half of that: 0.75.
  - *How far the clock slides during the trip up:* 0.6 × 1.5 = 0.9. Half of that: 0.45.
  - *How far the flash needs to go to reach the mirror:* short sides 0.5 and 0.45. 0.5 × 0.5 + 0.45 × 0.45 = 0.4525. The number that multiplied by itself gives 0.4525 is 0.673, so the flash needs 0.673.
  - *Compare:* In 1.5 seconds the flash would go 0.75, but it only has to go 0.673 to reach the mirror. It would get there early, so the trip up needs less time. The tick is shorter than 1.5 s.
- **Try a tick of 1.25 seconds.**
  - *How far the flash goes up the slant:* in 1.25 seconds it goes 1.25. The trip up is half of that: 0.625.
  - *How far the clock slides during the trip up:* 0.6 × 1.25 = 0.75. Half of that: 0.375.
  - *How far the flash needs to go to reach the mirror:* short sides 0.5 and 0.375. 0.5 × 0.5 + 0.375 × 0.375 = 0.390625. The number that multiplied by itself gives 0.390625 is 0.625, so the flash needs 0.625.
  - *Compare:* In 1.25 seconds the flash goes 0.625, and it must go 0.625 to reach the mirror. They are the same, so the flash reaches the mirror exactly when the trip up ends. The tick is 1.25 s.

So at 0.6c one tick takes 1.25 seconds on the lab's clocks, instead of 1.

**Step 6. What the moving clock itself says.** The person riding with the clock saw the flash go straight up and down, 1 light-second, which is one tick of their own clock: one second on their clock. But the lab says 1.25 seconds passed. So the lab says the moving clock counted 1 second while the lab's clocks counted 1.25: the moving clock counts 1 ÷ 1.25 = 0.8 of the lab's time. Over 10 lab seconds it counts 10 × 0.8 = 8 seconds. That is what "A moving clock" showed at 0.6c: 10 seconds on the lab's clocks, 8 on the moving clock. The size of the effect depends on the speed: the faster the clock, the bigger the sideways slide, the longer the slant and the longer the tick.

**Step 7. Not only light clocks.** A light clock is just the simplest clock to reason about. If a light clock and some other clock were side by side, they could not disagree, so the other clock must slow down in the same way. (This step goes a little beyond the light clock itself; it is the same step the tutor's "What this means for a traveller" takes.)

**In one breath.** A moving light clock's flash has a longer, slanted path to cover in the lab; light's speed is the same, so each tick takes longer on the lab's clocks. That is time dilation.

**How to use this in Part 1.** You can now work out your prediction the same way: for the speed in Part 1, find the tick for which the flash just reaches the mirror. A close estimate is a good guess; it does not have to be exact.

*Optional paragraph, "Another way to see it" (default: include).* "Think of the flash's speed as split into two parts: some of it keeps pace sideways with the clock, and what is left carries it up. The speed is c in all, so the part that carries it up is less than c. It climbs more slowly than in the clock that stands still, so each trip up takes longer. This is the same reason from another side."

### A picture for the section (optional, default: include)
A static drawing of the right triangle for the 0.6c example: the rise 0.5, the half-trip sideways 0.375 and the diagonal 0.625, each labelled on the canvas, with "Light-seconds" as the unit, the square corner marked, and a "How to read this drawing" caption (what each side is, a worked moment, three-part look-at items) and a "Where the real picture comes from" line (calculated here from 0.6c, imagined giant clock). Every number from the module. Placed under Step 3.

### Changes that follow from the owner's choice (for approval)
1. **Words box:** add "Right triangle", "Diagonal" and "Postulate", and one "Formulas" entry that gives the rule for right triangles **in words and numbers only** (3 × 3 + 4 × 4 = 5 × 5), keeping the specification's rule against algebraic symbols.
2. **Link:** the Einstein-Online page now gives away nothing the introduction has not already said, so it moves **to the "Want to know more?" list visible from the start**, and the after-tutor block is removed.
3. **Specification:** the line "the constancy of the speed of light is deliberately not stated before the run" is replaced by a note that the owner chose, on 2026-11-08, to explain the whole reason in the introduction; the tutor's conceptual question ("What does that tell you about how long its trip takes?") stays as a check of what was just read.
4. **Tutor:** the explanation keeps its paragraphs (they now repeat the introduction, which is deliberate: the tutor's job is to check and to tie the reasoning to the learner's run). Whether to shorten them is left to the owner.
5. **Tests:** the render test that asserts the introduction does not state the constancy of light's speed is replaced by one that asserts the seven steps, the 0.6c numbers (1.25, 0.8, 0.625) and the 3-4-5 example.
6. **"Your job" and the Part 1 lead:** a sentence added: "You can now work out your guess with the steps above."

---

## Addendum 4, 2026-11-08 (after the build): "Reading the clocks and the bars together"
**Owner's report:** "in part 1 and 2 the time on the clocks and pictures dont match", then, after the labels were added: "still confusing. you need to explain that more detail and in simple terms and examples if necessary". The numbers are consistent (checked by sampling a run: pulse positions and readouts agree at every moment); the confusion is two different quantities under the same names. **Correction to the previous caption bullet:** it said the two numbers for each clock "are not meant to match". For the moving clock the difference is the point: 1.0 on its own display against 1.155 on the lab's clocks is time dilation. DRAFT, not built; the wording is the owner's to approve (§28.1). See the chat for the text.

**Approved and built (2026-11-08, "all defaults"):** the box "Reading the clocks and the bars together" under the bars in Part 1 and under Drawing A in Part 2 (the same text with each run's own numbers; at 0.99c the rest clock has finished seven whole ticks, which the text handles); a dashed "run stopped: lab time N s" line across both bars; lab time shown to 3 decimals; the earlier caption bullet ("not meant to match") removed. New module function `restClockAtRunEnd` (the rest clock's reading, whole ticks and part-tick when the run stops), 3 tests. The stopwatch example (62 s and a 20 s lap) is Claude's own, not in the specification. To record in the specification when it is updated (§28.2).

---

## Addendum 5, 2026-11-09 (after the build): simpler Steps 1, 2 and 5, the formula in the tutor, and a title fix
**Owner's requests (wording approved 2026-11-09):**
1. **Step 1** is shorter and shows the sum with the real numbers: "In our clock the flash goes up 0.5 and back down 0.5, 1 light-second in all. Light goes 1 light-second every second, so: time = distance ÷ speed = 1 light-second ÷ 1 light-second per second = 1 second. One tick takes 1 second."
2. **Step 2** says "an upside-down V" (the flash rises to a peak at the top mirror) and adds a paragraph, "Why that shape?", that follows the flash up and then down while the clock slides sideways.
3. **Step 5** has the three trial ticks (1, 1.5 and 1.25 s) in one format of four lines each: how far the flash goes up the slant; how far the clock slides during the trip up; how far the flash needs to go to reach the mirror (the long side of the Step 3 triangle, with the squares shown); and a "Compare" line in plain words ("In 1 second the flash has gone 0.5, but it must go 0.583 to reach the mirror. It is still on its way, so the trip up needs more time. The tick is longer than 1 s."). The lead-in says what each try checks. The page text is in the section above.
4. **Tutor explanation** gets Experiment 3's formula and explanation, adapted to one tick (see `04-light-clock.md`, Implementation notes (tutor), item 8): time dilation named; the run's numbers; "About the formula" with Δt_moving = Δt_lab × √(1 − v²); the "dial" paragraph; "Your numbers" (at 0.5c: 1 − 0.25 = 0.750; √0.750 = 0.866; 1.155 × 0.866 = 1.000 s); a closing line that points to this chapter, not the next.
5. **Bug fixed:** the right-hand light-path drawing's title was clipped ("oving clock"); titles now split onto two lines at the colon.

**Not checked:** the page by eye in a browser by the agent (the owner reviewed it); the title's second line against the "Top mirror" label at very slow speeds; the printed arithmetic at every speed.

