# Draft wording: Relativity of Time and Motion Experiment 5 (Why Can't Light Go Faster?)
Date: 2026-11-09 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following Relativity 1 to 4, `01-` to `04-draft-wording.md`, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-09, "all defaults" to the thirteen questions of the gap report): fix every gap; Part 1 fixed at 0.5c with the speed (no 0c) in Part 2, opening at 0.8c; three time bars (rest tick, everyday-rule tick, actual-rule tick) under the three clocks with two white tick marks and an edge arrow, Part 1's scale 0 to 2 s and Drawing A's scale 0 to twice the actual-rule tick; the choice marker beside the two moving bars, joined by a line to the chosen bar (a bracket over both for "both the same"), the caption saying it is only a marker; the everyday-rule clock and bar in a third colour (violet), labelled "imagined" on the canvas, with a "Where the real picture comes from" line; Drawing A with the speed in pink, no white marks, and "Runs so far"; the tutor marks each guess with no score and no "right" or "wrong", and the clock's own 1 second and the half-trip arithmetic move into the module with tests; the introduction keeps the specification's order and its statement of light's actual rule before the prediction, uses the chapters' titles and adds the statement about predictions and the controls; no check-up or setting-following table; links searched and read first, gaps recorded, **the 1905 paper not linked for Einstein's postulate (a gap is recorded)**; a words box of terms and one formula entry ("speed = distance ÷ time"), no square-root formula; shared `toggle-button` class; size Large.

## Layout
- **Above Part 1 (no heading):** the introduction (its assumptions list stays), "Want to know more?", a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the three guesses, START (0.5c), the three light-clock panels (rest, everyday rule, light's actual rule) with the lab-time readout, and, once the run ends, the **three tick bars** with the two white tick marks and the white choice marker, "Where the real picture comes from" and captions.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** speed buttons (0.1c, 0.3c, 0.5c, 0.8c, or 0.01c to 0.99c), "Run your speed", a live set of three panels, **Drawing A** (the three bars for the learner's speed, the speed in pink), "Runs so far", a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 run with the guesses beside them, tags on the two moving tick lines, and "What these results tell us".
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while a run plays. Page width unchanged (900 px). Buttons use the shared `toggle-button` class.
- **Colours:** white is only the learner's guess; pink only the learner's own speed in Part 2; the rest clock stays blue, the clock under **light's actual rule** amber (as the moving clock in Relativity 3 and 4), and the clock under the **everyday rule** violet, the colour of something imagined.

---

## 1. Introduction

Paragraphs not listed ("The idea we want to test", the two rules, "What we assume") stay as approved, except that "Experiment 2" and "Experiment 4" become the chapters' titles ("Two clocks at rest", "The light clock") and the lines below are added or changed.

**1a. "The question."** Old: "In Experiment 4 we explained time dilation using one big assumption about how light behaves. What would change if light behaved differently?" New: "In "The light clock" we explained time dilation using one big assumption about how light behaves. What would change if light behaved differently?"

**1b. "A quick reminder: the light clock."** Shortened (it repeats the previous chapter on purpose, so this one can be opened on its own). Old: three sentences. New: "**A quick reminder: the light clock.** A light clock is a clock made from a flash of light that bounces up and down between two mirrors. One trip up and back down is one **tick**."

**1c. "How far apart are the mirrors?"** Kept. Its last sentences change (old: "Real clocks are much smaller. We use a giant clock so that the numbers are easy to read."). New: "Real light clocks are much smaller: with the mirrors only 15 cm apart, a clock would tick about a billion times a second. We use a giant clock so that the numbers are easy to read." (Sourced: Einstein Online, read 2026-11-08 for Relativity 4.)

**1d. "The idea we want to test"**, the two rules. Kept as approved, with two changes: (i) in the second bullet, "(it is Einstein's postulate, as in Experiment 4)" becomes "(it is Einstein's postulate, as in "The light clock")"; (ii) a closing sentence to the first bullet, so the imagined clock can be told apart: "The page draws this clock in violet and labels it **imagined**, so you can tell it from the clocks that follow the real rule."

**1e. "What you will see."** Old: "Three clocks start at the same moment. One clock stands still in the lab. The other two are the same moving clock, shown twice: once where light follows the everyday rule, and once where light follows its actual rule. We watch one tick of each moving clock and draw the path the light takes." New: "Three clocks start at the same moment. One clock stands still in the lab, the place where the experiment is set up. The other two are the same moving clock, shown twice: once where light follows the everyday rule, and once where light follows its actual rule. We watch one tick of each moving clock and draw the path the light takes. In Part 1 the moving clock goes at 0.5c, which is half the speed of light. When the run ends, three bars appear that show how long each tick took on the lab's clocks. In Part 2 you choose any speed and run that."

**1f. "Your job."** Old: "Before you press START, make a prediction. Which rule makes the moving clock's tick take longer? And how many seconds will one tick take under each rule? These seconds are **lab seconds**: seconds counted by the clocks standing still in the lab. A wrong guess is fine. Guesses are not scored." New, with one sentence added at the end: "…A wrong guess is fine. Guesses are not scored. Then watch the clocks, try other speeds in Part 2, and talk it over with the tutor."

**1g. New paragraph, "Your guesses and the real pictures."**
"Your guesses never change the real pictures, the clocks or the numbers: they come from a calculation that knows nothing about what you guessed. Your two tick guesses are drawn on the bars in white, each in a box labelled YOUR GUESS, and your choice of rule is drawn as a white marker (a marker only: it has no size, it just points at the rule you chose). All three guesses are shown again beside the results. In Part 2 the speed you choose does change the clocks and the drawings, and the marks it moves are pink."

**1h. Added to "What we assume":**
"**c** is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that. A light speed of 1.000c means exactly the speed of light."
(The "c" note moves here from beside the speed buttons, which move to Part 2.)

**1i. New line, "Some new words."**
"The "Words and formulas" box below has each one, with a short plain meaning: light clock, tick, mirror, light source, light pulse, light-second, lab seconds, lab time, reference frame, at rest, moving, sideways, c, everyday rule, light's actual rule, "what if" (imagined), time dilation factor, postulate, and the one formula used here, speed = distance ÷ time."

**1j. Revision, 2026-11-09 (the owner asked for a simpler, more explanatory introduction before the prediction choices; approved the same day).** Built in `Experiment5.tsx`: the introduction is four numbered steps (Step 1 the light clock, Step 2 how big our clock is, Step 3 now make the clock move, Step 4 the two rules), with the ball-bouncing-between-floor-and-ceiling and car-headlights examples; "What you will see" lists the three clocks as bullets; "Your job" names the three guesses outright. The prediction prompts become "Guess 1" (compare the two moving clocks) and "Guess 2" (a number for each rule, "A rough guess is fine."), and Part 1's lead says "one number for each". No example tick length is given, so nothing hints at an answer. The strings the tests check (1a, 1c, 1d(ii), 1g) are unchanged.

**Caption 2 revision, 2026-11-09 (the owner asked why the everyday-rule reading looked the same as the actual rule's, and asked for the three readings to be explained better; approved the same day).** The bars paragraph now says what a bar is (lap-time comparison, what the left and right ends mean), each colour has its own line with its tick, the worked moment gives the two light speeds as numbers without the reason, and the look-fors are now four (blue bar's end as the baseline, blue and violet together, the gap to amber, the white marks). The mechanism (why violet matches blue and amber does not) stays with the tutor (§12, §13). Checked in Chrome 2026-11-09 at 0.5c: the blue and violet bars end together at 1.000 s and amber ends at 1.155 s.

**Kept as the specification requires:** the introduction states light's actual rule before the prediction (specification, Introductory text). It does **not** say how long any tick takes under either rule, or which rule gives the longer tick. That stays with the tutor.

---

## 2. "Want to know more?" (opens in a new tab)

Searched and fetched 2026-11-09 (by a helper; **WebFetch gives a summary of each page, not its raw text, so every quote below is verbatim only as far as that summary reproduced it, and the agent did not read the pages itself**). The list shows the pages from the start, except two that are held back (see below). Each opens in a new tab and says in a few plain words what the learner will find.

**Linked from the start:**
1. **NASA Science: "Our Milky Way Galaxy: How Big is Space?"** (NASA Science, Exoplanet Exploration Program; first posted 2 April 2019, updated 22 April 2024). "A short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second." It backs only that number, not the light clock or the two rules. (Reused from Relativity 3 and 4; loaded again 2026-11-09.)
2. **NASA Glenn Research Center: "Relative Velocity - Ground Reference"** (Beginner's Guide to Aeronautics; last updated 13 May 2021; https://www.grc.nasa.gov/www/k-12/airplane/move.html). "A plain page on how speeds combine when you measure from different places, using an aircraft and the wind: 'Airspeed = Ground Speed - Wind Speed'." **Honest limit:** it is about wind and airspeed, not a ball thrown from a train, so it shows the same everyday idea in another setting and does not say anything about light.
3. **NASA ISTP, "Stargazers": "Lesson 23: Frames of Reference: The Basics"** (International Solar Terrestrial Physics, NASA Goddard; last updated 24 October 2004; https://pwg.gsfc.nasa.gov/stargaze/Lframes1.htm). "A plain explanation of a frame of reference ('a set of reference points with respect to which motion is measured'), with a plane in moving air and a raindrop seen from a moving car." **Honest limit:** it is old (2004), and it also says that two frames moving at a steady speed are equivalent, which is more than this page says. It does not mention light clocks or tick lengths.

**Held back until after the tutor's explanation** (shown as a second line then, as in the owner's answer for Relativity 4's Einstein Online page): both give away the answer to the learner's first question, which rule gives the longer tick.
4. **Einstein Online: "From light clocks to time dilation"** (Einstein Online, Max Planck Institute for Gravitational Physics; 2021, date not re-checked). The same light clock in plain words; it states that light goes at the same speed for all observers, that the moving clock's period is longer ("the moving light clock moves much slower than my own identical light clock"), and gives a worked example (a 2-second tick at 86.7% of the speed of light).
5. **Einstein Online: "Elementary Tour, part 4: The speed of light"** (https://www.einstein-online.info/en/?p=6559; no date found in the fetched content). A plain page that states light's constant speed "independent of the motion of the light source", from cars on a highway and a space station. **It is the nearest thing to a plain source for Einstein's postulate**, and it also says in one line that moving clocks run slower, which is why it waits.

**Gaps recorded (§29 rule 3(c)), searched 2026-11-09:**
- **Einstein's postulate, from NASA, ESA, CERN or NIST:** none found. Searches returned Wikipedia, Space.com, Britannica and similar sites, which are not official sources and were not used. A NASA page "How to Travel at (Nearly) the Speed of Light" (29 May 2019) was fetched and does not state the postulate. The 1905 paper is not linked (the owner's answer). The Einstein Online page above is held back.
- **A ball thrown from a moving train, from an official source:** none found. Candidates found but **not fetched or failed**: a San José State University page (HTTP 404), HyperPhysics (certificate error; a guessed address also 404). The NASA Glenn page above is the nearest.
- **Light-second:** none found. A search restricted to NASA, ESA, NIST and CERN returned only NASA JPL/Descanso light-time engineering documents, which are not plain pages. The NASA Science page above gives light's speed but was not confirmed to define a light-second. The introduction defines it in its own words.
- **Reference frame:** the NASA ISTP page above is now a candidate. **This changes the gap recorded for Relativity 2 and 3**, whose specifications say "no plain official page found". If the owner approves the page, those two specification source tables can be updated, at the owner's choice.
- **Real results:** none. Every number comes from the geometry the specification gives, not from a measurement, so there is no paper to link.

---

## 3. "Words and formulas" (collapsed box)

- **Light clock:** a clock made of two mirrors facing each other, with a flash of light bouncing between them. It counts each round trip of the flash.
- **Tick:** one round trip of the flash, up to the top mirror and back. The clock counts ticks to measure time.
- **Mirror:** a flat shiny surface that bounces light back.
- **Light source:** the small lamp inside the clock that sends out the flash.
- **Light pulse:** a very short flash of light.
- **Light-second:** the distance light travels in one second, about 300,000 km.
- **Lab seconds:** seconds counted by the clocks standing still in the lab.
- **Lab time:** the time shown on the lab's clocks.
- **Reference frame:** a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others. The lab is one; the moving clock has its own.
- **At rest / moving:** standing still, or not standing still, compared with the lab.
- **Sideways:** across the light's up-and-down path, not along it.
- **c:** the speed of light, about 300,000 km every second. 0.5c is half of that, and 1.000c means exactly the speed of light.
- **Everyday rule:** this page's name for "speeds add": the idea that light gets the lamp's speed added to its own, like a ball thrown from a moving train. It is a "what if", not something that happens in nature.
- **Light's actual rule:** this page's name for the rule used in this course: seen from the lab, light always goes at c, whatever its source is doing.
- **What if (imagined):** drawn in violet and labelled "imagined". It is something we picture to see what would change; no instrument measured it.
- **Time dilation factor:** the rest clock's tick divided by the moving clock's tick, on the lab's clocks. 1 means no slowing; a smaller number means the moving clock's ticks are farther apart.
- **Postulate:** a starting point a theory is built on, not something the theory proves. That light goes at c in the lab is one of the two postulates of Einstein's special theory of relativity.
- **Formula, speed = distance ÷ time.** The results use it for light's speed seen from the lab. *Worked example from this page:* light that travels 1.000 light-second in 1.000 second has a speed of 1.000 ÷ 1.000 = 1.000 light-second every second, which is 1.000c. (The formulas for the two rules' tick lengths are not given here, because they would give away what you are asked to predict.)

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you make three guesses: which rule makes the moving clock's tick longer, and how many lab seconds one tick takes under each rule. Then you press START and watch one tick of each clock, with the moving clock going at 0.5c and the path of each flash of light drawn as it goes. When the run finishes, three bars appear that show how long each tick took on the lab's clocks, with your guesses drawn on them in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a speed from 0.01c to 0.99c and watch one tick of each clock at that speed. The speed you choose changes the clocks and the drawing in this Part, marked in pink. It does not change Part 1's pictures, the results in Part 3, or your guesses."
*Note beside the speed buttons:* "Your guesses do not change these drawings, but the speed you choose does."
*Before any Part 2 run:* "Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with your guesses or with the speed you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white marks, then explains."

---

## 5. The prediction

Three guesses, as today, with the chosen speed fixed at 0.5c (the speed buttons have moved to Part 2). **Question** (old text had the chosen speed): "The clock standing still ticks once every 1 second. The other clock moves sideways at 0.5c. Someone in the lab watches the light in each clock, timing it with the lab's clocks. **Step 1:** which rule makes the moving clock's tick take longer, or do both rules give the same tick?" Buttons: **Everyday rule / Light's actual rule / Both the same.** "**Step 2:** how many lab seconds will one tick of the moving clock take under each rule? Type a number for each." Boxes: "Everyday rule (lab seconds)" and "Light's actual rule (lab seconds)". Line under them: "Your prediction: …" or "Choose a rule and enter both tick durations to continue".
After START: "Your prediction is locked while you try other speeds. To change it, press Start over." START stays disabled until a speed, a choice and both numbers are entered. **Start over** is always visible, greyed out until a guess is entered or a run has started, and while a run plays. After the first run, START is replaced by "Run your speed" in Part 2 (it needs no new guess).

---

## 6. Part 1's pictures: the three light clocks and the three tick bars

**The panels, labelled on the canvas (new):** each panel gets its title drawn inside the picture on two lines, split at the colon (so it is not cut off): "Rest clock:" / "at rest in the lab"; "Moving clock, light's actual rule:" / "seen from the lab"; "IMAGINED: moving clock," / "everyday rule, seen from the lab". "Top mirror" above the top bar, "Bottom mirror" below the bottom bar, "Light pulse" beside the dot, "Path of the light" along the line, and, on the two moving panels, "Where the mirrors started" beside the dashed lines (replacing the bare word "start"). The rest and actual-rule panels keep blue and amber; the everyday-rule panel's pulse, path and title are violet. Exact placement is checked in the browser, including the stacked 720-unit layout (Part 2, above about 0.93c).

**The three tick bars (new), shown when the run ends:** one scale in lab seconds from 0 to 2 (twice the rest tick), ticks and numbers at 0, 1 and 2 s. Three bars: "Rest clock: one tick" (blue) ending at 1.000 s; "IMAGINED: everyday rule, one tick" (violet) ending at 1.000 s; "Light's actual rule: one tick" (amber) ending at 1.155 s at 0.5c. Each has its number under its end, and a dashed line joins them where all three pulses leave the bottom mirror together. **The white marks:** a white dot on each moving bar at the guessed number of seconds, joined by a line to a white box "YOUR GUESS: N seconds"; a guess beyond the scale (or below 0) is a white arrow at the edge and the box says "(off the scale)". **The choice marker:** a white tag "YOUR GUESS: the everyday rule gives the longer tick" (or "…light's actual rule gives the longer tick" or "…both rules give the same tick"), joined by a line to the bar it names (for "both the same", a white bracket over both moving bars), with the words "a marker only". The marks appear only when the bars appear (§12).

**"Where the real picture comes from":** under the panels: "**Calculated here from the speed, not measured:** the clocks at rest and under light's actual rule come from the light-clock geometry, with the clock sliding sideways while the flash goes up and down. **Imagined for the question:** the violet clock shows what would happen if light's speed added to the lamp's, which is not how light works in this course. The light clock itself is imagined, a giant clock with its mirrors half a light-second (150,000 km) apart, so that the numbers are easy to read. Real light clocks are much smaller. No instrument measured these ticks." Under the bars: "Calculated here, not measured, except the violet bar, which is imagined for the question. The white marks and the marker are only your guesses, placed on the same scale."

**Caption 1, "How to read the three light clocks"** (shown from the start; only what is drawn before the run):
- **Three panels** show the same kind of clock. The left, the **Rest clock**, stands still in the lab. The two on the right are the **same moving clock**, seen from the lab, drawn twice: the amber one follows **light's actual rule**; the violet one, labelled **IMAGINED**, follows the **everyday rule** (a "what if", not how light really works).
- **In each panel:** two black bars are the **mirrors**, one above the other. The dot is the **light pulse**, and the line is the **path** it has taken so far. The three panels use the same scale, so you can compare the paths by eye.
- **The moving clocks:** the whole clock, the light source and both mirrors, slides sideways together. The dashed lines show where the mirrors started.
- **The readouts:** above the panels, "Lab time" is the time on the clocks standing still in the lab. Each panel's box shows that clock's own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds).
- **When the run ends:** the run lasts until the slower moving clock has made one round trip. The rest clock keeps ticking; each moving clock stops after its one tick.

**Caption 2, "How to read the three tick bars"** (shown with the bars, after the run):
- **The bars** appear when the run ends. They are a time scale in lab seconds: the further right, the longer. Each bar is one of the three clocks, and its length is how long **one tick** took, timed by the lab's clocks, in lab seconds. Think of lap times on a running track: a longer bar is a longer lap, which means a slower clock. The left end (0 s) is the moment all three flashes left their bottom mirrors together. The right end is the moment that clock's flash got back to the bottom mirror, so one tick was finished. The scale runs to 2 s, twice the rest clock's tick, so there is room on the right.
- **Blue: the clock standing still.** This is the baseline. Its one tick is 1.000 s.
- **Violet: the moving clock under the everyday rule.** This one is imagined, drawn only to answer the question. Here the lamp's sideways speed is added to the light's speed. One tick is 1.000 s.
- **Amber: the moving clock under light's actual rule.** Here the lab always sees the light at exactly c. One tick is 1.155 s.
- **The white marks and the YOUR GUESS boxes** are your two tick guesses, placed on the same scale. A white arrow at the edge means a guess is beyond the end of the scale. The **white marker tag** is your choice of rule: it has no size, it is only a marker that points at the rule you chose. None of the white things ever moves a bar.

*A worked moment.* At 0.5c, one tick took 1.000 s for the clock standing still, 1.000 s for the violet clock and 1.155 s for the amber clock. The light's speed is its path divided by its time. Violet clock: the path was 1.118 light-seconds, covered in 1.000 s, so 1.118 ÷ 1.000 = 1.118c, because the lamp's speed was added. Amber clock: the path was 1.155 light-seconds, covered in 1.155 s, so 1.155 ÷ 1.155 = 1.000c. If you had guessed 1.2 s for the everyday rule, your white mark would sit at 1.2 s, 0.200 seconds to the right of the end of the violet bar.
*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the right end of the blue bar. **What it means:** one tick of the clock standing still takes 1.000 s, which is our starting point. **Why it matters:** every other bar is compared with this one, so it shows what "no change" looks like.
2. **Look at** the blue bar and the violet bar together. **What it means:** they end in the same place, 1.000 s and 1.000 s. Under the everyday rule, moving the clock sideways did not change how long one tick took. **Why it matters:** it shows what the everyday rule gives. Under that rule, a moving clock would keep the same time as a clock standing still.
3. **Look at** the gap between the end of the violet bar and the end of the amber bar. **What it means:** under light's actual rule, one tick lasts 1.155 − 1.000 = 0.155 seconds longer. **Why it matters:** it turns the difference between the two rules into a length you can see. The tutor will help you work out why the two rules give different bars.
4. **Look at** each white YOUR GUESS mark and the end of the bar beside it, and at the white marker tag. **What it means:** the gap between a mark and the end of its bar is how far that guess was from the real tick, in seconds. The tag only says which rule you chose. **Why it matters:** it puts what you expected beside what the clocks showed.

---

## 7. Part 2's picture: Drawing A

**Drawn:** the live set of three panels for the chosen speed (they run as in Part 1) and, when the run ends, the same three bars on a scale from 0 to **twice the light's-actual-rule tick** (so the amber bar ends halfway; a 0.8c tick of 1.667 s gives a scale to 3.333 s), with **the learner's speed written in pink** above the bars (the bars keep their blue, violet and amber colours; pink is the setting). The white guesses are **not** redrawn (they were guesses for the 0.5c run). Below it, "Runs so far": one line per run, such as "0.8c: rest 1.000 s; everyday rule (imagined) 1.000 s, light's speed 1.281c; light's actual rule 1.667 s, light's speed 1.000c".

**"Where the real picture comes from":** as in Part 1, with "the speed you chose".

**Caption, "How to read Drawing A":** the panels work as in Part 1, for the speed you chose; the bars work as in Part 1, but the scale changes with the speed (it always runs to twice the amber tick, so the amber bar always ends halfway); pink marks your own speed; "Runs so far" lists every run in this Part. *Worked moment:* at 0.8c the clock slid 0.8 × 1.667 = 1.333 light-seconds sideways during the amber tick, and one tick took 1.667 s under light's actual rule and 1.000 s under the everyday rule. **Look at** the violet and amber bars in each run in "Runs so far". **What it means:** the violet tick stays at 1.000 s at every speed, while the amber tick grows (at 0.1c 1.005 s; at 0.8c 1.667 s). **Why it matters:** it shows how the Part 1 result depends on the speed. (It names no explanation; the tutor gives that, §12.)

---

## 8. Results (Part 3)

Lines as today (the speed; the rest clock's distance, tick time and light's speed; each rule's distance, tick time, light's speed seen from the lab, and time dilation factor; "Your prediction"), with:
- A small "your guess" tag on each moving tick-time line, and the line "Your guesses are drawn on Part 1's bars as white marks."
- Under the lines, **"What these results tell us"** (what it is, what it means with the real numbers, why it matters; no mechanism):
  - **The rest clock.** "One tick: 1.000 light-second of path in 1.000 s, a light speed of 1.000c. Why it matters: this clock stands still, so it is the one to compare the others with."
  - **The everyday rule (imagined).** "One tick: a path of 1.118 light-seconds in 1.000 s, a light speed of 1.118c, and a time dilation factor of 1.000. Why it matters: this is what would be seen if the rule were true; the tick is unchanged, and the light's speed is more than c. Remember this is imagined for the question."
  - **Light's actual rule.** "One tick: a path of 1.155 light-seconds in 1.155 s, a light speed of 1.000c, and a time dilation factor of 0.866. Why it matters: the path is longer, the tick is longer, and the light's speed is exactly c. This is the factor from "Moving clock" and "The light clock" for this speed."
  - **Light's speed, seen from the lab.** "Path divided by time. Under the everyday rule the number is more than 1.000c; under light's actual rule it is 1.000c. Why it matters: the two numbers differ, which is worth noticing; the tutor will ask you about it."
- **"Where this comes from:** calculated here from the speed (see the captions under the pictures), except the everyday rule, which is imagined for the question. Nothing here changes with your guesses or with the speed you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: the page computes each tick from the same geometry a check would use, so a check-up would be circular; and the one reference, c, is the rule's own input.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe:** "Look at the three clocks and at the three bars. What is different between the two moving clocks? Think about the path the light takes and how long each tick lasted."
- **Compare:** "You chose [the rule] as the one that makes the tick longer. That is the white marker. You guessed [N] s for the everyday rule and [M] s for light's actual rule. Those are the white marks on the bars. On the lab's clocks the real times were [X] s and [Y] s. What do you notice when you compare your marks with the bars?"
- **Conceptual:** unchanged ("Under the everyday rule, how fast was the light going when we watched from the lab? Was that faster than c, slower than c, or exactly c?").
- **Explanation:** the specification's paragraphs stay as today (1 What stayed the same, 2 The everyday rule, "Working the numbers", 3 Light's actual rule, 4 The big idea, "Two things to remember"), with "Experiments 3 and 4" and "Experiment 4" replaced by the chapters' titles, "one tick lasts 1 second" and "showed 1.0 second" coming from the module (the rest clock's tick), and the half-trip numbers in "Working the numbers" coming from the module. Then:
  - **Your guesses, marked** (no score, and no "right" or "wrong"): "You chose [the everyday rule / light's actual rule / both the same] as giving the longer tick; [the real result was that light's actual rule gave the longer tick / both gave the same tick (at this speed)]. Your guess for the everyday rule, [N] seconds, [is the same as / was D seconds more / less than] the [X] seconds one tick took under that rule. Your guess for light's actual rule, [M] seconds, [is the same as / was E seconds more / less than] the [Y] seconds one tick took under that rule."
  - **1. Why your guesses did not change the clocks.** "Whatever you guessed, the ticks took their own [X] and [Y] seconds on the lab's clocks. Think of two kitchen timers: guessing that one of them will ring early does not make it ring early. A different guess only changes the gap between your white marks and the ends of the bars."
  - **2. What the bars show.** "The three bars start together, when all three pulses leave the bottom mirror, and end at the three ticks, 1.000, [X] and [Y] seconds. The violet bar is imagined for the question; the amber bar is the tick under light's actual rule. The gap between their ends is how much longer a tick lasts when light cannot be sped up."
  - **3. Try it in Part 2.** "Try 0.1c and 0.8c. At 0.1c the amber tick is 1.005 seconds, hardly longer than the rest clock's; at 0.8c it is 1.667 seconds. The violet tick stays at 1.000 s at every speed. Try 0.99c: the amber tick takes 7.089 seconds, and the violet light's speed would be 1.407c." (numbers from the module; the 0.99c run plays for about 14 seconds)
  - **4. What comes next.** "So far, the light in our clocks went across the motion. Next, we turn the clock so that its mirrors are in a line with the motion. Does motion change how long a clock is?" (the chapter's existing "What's next" line; the page's own words stay as approved)
  (The sentence "it is the rule we assume in this course" stays as written, with the postulate's source gap recorded in the specification.)

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `invariantLightSpeedExperiment.ts`:
- `tickBarsScaleEnd(experiment, basis)` returns twice the rest tick (`'rest'`, Part 1) or twice the actual-rule tick (`'actual'`, Drawing A).
- `guessPositionOnTickBars(experiment, rule, guess)` returns, for `'everyday'` or `'actual'`, the scale's end, the guess's position as a fraction 0 to 1 (clamped), which edge it is off (`'left'`, `'right'` or none), and the guess minus that rule's real tick. It refuses a guess that is not finite.
- `choiceMarker(experiment, choice)` returns where the white marker points: the everyday bar, the actual bar, or both, and which rule actually gave the longer tick (`'actual'` for any speed above 0, `'same'` at 0), for the tutor's marking.
- `everydayHalfTripNumbers(experiment)` returns, for the tutor's "Working the numbers", the rise (the mirror separation), the sideways distance in the half-tick, the diagonal for the trip up and the round-trip path under the everyday rule.
- The clock's own tick (the rest tick, 1 second) is read from `restTickDuration` instead of being typed into the tutor.

Tests (in `invariantLightSpeedExperiment.test.ts`):
1. The scales end at twice the rest tick (2 s) and twice the actual-rule tick (1.155 × 2 at 0.5c; 3.333 at 0.8c).
2. A guess equal to the rest tick sits at 0.5 on Part 1's scale, 0 at 0, 2 s at 1.
3. A guess beyond the scale is clamped to 1 and flagged `'right'`; a negative guess is clamped to 0 and flagged `'left'`.
4. The differences are exact: for 0.5c, a guess of 1.2 for the everyday rule gives +0.2 and a guess of 1.3 for the actual rule gives +0.145.
5. The real results are the same for any guess.
6. A non-finite guess is refused.
7. `choiceMarker`: at any speed from 0.01c to 0.99c the actual rule gave the longer tick; the marker names the bar the learner chose, or both for "same".
8. `everydayHalfTripNumbers` at 0.5c gives rise 0.5, sideways half 0.25, diagonal 0.559 and round trip 1.118; the diagonal squared equals rise squared plus sideways half squared at every preset speed; the round trip equals the module's everyday `lightPath`.

---

## 11. Specification changes (only after approval, §28.2)

`05-invariant-light-speed.md`: Learner Controls (the speed moves to Part 2; Part 1 fixed at 0.5c), the Display (the labelled panels, the three tick bars, the guess marks and the choice marker, the imagined colour, Drawing A, "Runs so far", the layout of four Parts, Start over, the shared button class), Results Display (the tags and "What these results tell us"), the Tutor sections (marks the guesses with no score, points 1 to 4, the module's numbers), a new "Audit update" section, a source table (NASA and Einstein Online pages; "no plain official page found" for the light-second and reference frame; the postulate's source gap; "no real result, no paper"), the open items, and, as a separate small note, the out-of-date chapter-summary line (item 9).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction:** 1a to 1i? [yes]
2. **Links and gaps** (section 2)? [yes]
3. **Words box:** the entries and the one formula, "speed = distance ÷ time"? [yes]
4. **Leads, the note beside the speed buttons, and the prediction wording:** approve? [yes]
5. **Panels and bars:** the canvas labels, three tick bars on 0 to 2 s, two white tick marks with an edge arrow, the white choice marker, violet for the imagined rule, the captions as drafted? [yes]
6. **Violet and the word "imagined":** is violet right for the everyday rule, or another colour? [violet]
7. **Drawing A and "Runs so far":** as drafted? [yes]
8. **Results:** the tags, the four notes and the "Where this comes from" line, no table? [yes]
9. **Tutor:** the new prompts, the marking without "right" or "wrong", points 1 to 4 (point 3 suggests 0.1c, 0.8c and 0.99c; a 0.99c run plays for about 14 seconds)? [yes]
10. **Source reading:** the five pages were read through a helper that returned summaries, not raw text; the agent did not read them itself, and the quotes should be spot-checked in a browser before the wording is final. Accept? [accept; flagged in the specification]
11. **Linked from the start:** the NASA Science, NASA Glenn and NASA ISTP pages (with the honest limits stated for the second and third)? [yes]
12. **Held back until after the tutor:** the two Einstein Online pages, because they state which rule gives the longer tick? [yes]
13. **Postulate source:** you chose to record a gap and not link the 1905 paper. The Einstein Online "speed of light" page is a plain page for it, held back as above, from a Max Planck institute (not NASA, ESA or CERN). Is a Max Planck institute page acceptable as the plain source, or should the gap stay? [accept it as the held-back line; the gap for NASA, ESA, CERN and NIST stays recorded]
14. **Reference frame:** update the gap recorded for Relativity 2 and 3 now that a NASA page was found, or leave those as they are? [leave them until those pages are next audited]
