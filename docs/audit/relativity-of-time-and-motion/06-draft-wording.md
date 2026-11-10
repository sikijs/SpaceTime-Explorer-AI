# Draft wording: Relativity of Time and Motion Experiment 6 (Does Motion Change Length?)
Date: 2026-11-09 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following Relativity 1 to 5, `01-` to `05-draft-wording.md`, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-09, "all defaults" to the thirteen questions of the gap report): fix every gap; Part 1 fixed at 0.5c with the speed (0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2, opening at 0.8c; a strip of three mirror-gap bars (0 to 1 light-second) under the three clocks, with a white mark and an edge arrow for the number guess, appearing when the run ends; the choice marker beside the two moving bars, joined by a line to the bar it names (for "farther apart", an arrow past the end of the rest bar), the caption saying it is only a marker; the "mirrors as far apart as at rest" clock and bar in violet, labelled "imagined" on the canvas, names kept, with a "Where the real picture comes from" line; Drawing A with the speed in pink, no white marks, and "Runs so far"; the tutor marks each guess with no score and no "right" or "wrong"; the introduction keeps the specification's order and the time dilation rule before the prediction, uses the chapters' titles, adds the statement about predictions and the controls, and is simplified as in Relativity 5; no check-up or setting-following table; links searched and read first, any length-contraction page held back until after the tutor, **the 1905 paper not linked (a gap is recorded)**; a words box with one formula entry; shared `toggle-button`, `action-button` and `exp-card` classes; size Large.

## Layout
- **Above Part 1 (no heading):** the introduction (its assumptions list stays), "Want to know more?", a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the two guesses, START (0.5c), the three light-clock panels (rest, mirrors as far apart as at rest, mirrors closer together) with the lab-time readout, and, once the run ends, the **mirror-gap strip** with the white mark and the white choice marker, "Where the real picture comes from" and captions.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** speed buttons (0.1c, 0.3c, 0.5c, 0.8c, or 0.01c to 0.9c), "Run your speed", a live set of three panels, **Drawing A** (the mirror-gap strip for the learner's speed, the speed in pink), "Runs so far", a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 run with the guesses beside them, tags on the gap lines, and "What these results tell us".
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while a run plays. Page width unchanged (900 px). Buttons use the shared `toggle-button` class.
- **Colours:** white is only the learner's guess; pink only the learner's own speed in Part 2; the rest clock stays blue, the clock with the **mirrors closer together** (the one time dilation asks for) amber, as the moving clock in Relativity 3 to 5, and the clock with the **mirrors as far apart as at rest** violet, the colour of something imagined.

---

## 1. Introduction

Paragraphs are simplified in the same way as Relativity 5 (numbered steps, one idea each, daily-life pictures). The tick lengths, gaps and which clock is right are not given. Old chapter numbers become the chapters' titles. **Replaces the whole introduction before "What we assume"; the assumptions list keeps its items (1h).**

**1a. "The question."** "In "Why time dilation happens", the two mirrors of our light clock were one above the other, across the direction the clock moved. Here we ask: what happens if we turn the clock so that its mirrors are in a line with the direction it moves?"

**1b. "A daily-life picture."** Kept as approved: "Imagine measuring the length of a car speeding past you, versus measuring the same car parked in your driveway. In everyday life we assume you would get the same number either way: length feels like a fixed property of the car, nothing that depends on whether it is moving. This experiment checks whether that everyday assumption survives once "speeding past" means a meaningful fraction of the speed of light." (Only the dash is replaced by a colon.)

**1c. "Step 1: the light clock (a reminder)."** "A light clock is a clock made from a pulse of light that bounces between two mirrors. This time the mirrors are one behind the other, in a line, like the two ends of a train carriage with the pulse running back and forth between them. One trip from the back mirror to the front mirror and back is one **tick**."

**1d. "Step 2: how big is our clock?"** "Light travels about 300,000 km in one second. The distance light travels in one second has a name: a **light-second**. We place the two mirrors half a light-second apart, which is about 150,000 km. So light needs half a second to go from one mirror to the other, and one second for the whole trip there and back. That means one tick takes exactly 1 second when the clock is standing still. Real light clocks are much smaller: with the mirrors only 15 cm apart, a clock would tick about a billion times a second. We use a giant clock so that the numbers are easy to read."

**1e. "Step 3: now make the clock move."** "Now imagine the same clock moving along its own length, front mirror first. Both mirrors move together at the same speed, so the distance between them never changes. Neither mirror gains on the other." / "The important point is that **the pulse is not carried along by the clock**. Once it leaves the back mirror, nothing pushes it forward with the clock. In the lab it keeps travelling at the speed of light, **c**, and the clock's motion adds nothing to that speed. The mirrors move, but the pulse's speed stays c. So the distance that matters is the one **between the pulse and the mirror it is heading for**, and that distance changes." Bullets: **Forward trip** (the front mirror keeps moving away while the pulse is in flight, so the pulse covers the gap *plus* the extra distance the front mirror moves; the pulse-to-mirror gap closes at only c minus the clock's speed; the bus that has just pulled away) and **Return trip** (the back mirror moves *toward* the pulse; the gap closes at c plus the clock's speed; the friend walking toward you). **An everyday picture:** a ball let go on a moving walkway rolls at a fixed speed along the floor; the walkway's ends stay the same distance apart, but the ball is not attached to it, so the far end moves away and the ball takes longer to reach it. **A worked example** at 0.5c, assuming (for the example only) a half-light-second gap: forward 0.5 ÷ 0.5 = 1 s (the pulse travels 0.5 + 0.5 = 1 light-second); back 0.5 ÷ 1.5 = about 0.33 s; total about 1.33 s, "only the answer for the assumed gap... not the tick time the experiment finds." (Owner-approved 2026-11-09 after asking how the pulse can travel extra distance when the mirrors move together. The wording says the pulse is not carried along, not that it is stationary: it moves at c in the lab. The bus picture moves here from the tutor's explanation, where it stays too; see section 9.)

**1f. "Step 4: the rule we keep."** "In "A moving clock" and "Why time dilation happens" you saw that a moving clock ticks more slowly, as measured by the lab's clocks. That effect is called **time dilation**. We assume that it works for every moving clock, however it is turned. So one tick of the moving clock must take the time that time dilation gives. We also keep the rule from "Why time dilation happens" and "Why can't light go faster?": in the lab, light always goes at the same speed, **c**, in both directions."

**1g. "What you will see."** "Three clocks start at the same moment:" (list) "one clock standing still in the lab (the place where the experiment is set up); one moving clock with its mirrors as far apart as they are at rest (violet, imagined); one moving clock with its mirrors closer together." Then: "The two moving clocks are the same clock, drawn twice. The only difference is the distance between the mirrors, as the lab observers measure it. Because the mirrors move together, that distance does not change during a run. We watch one tick of each moving clock. In Part 1 the moving clock goes at 0.5c, which is half the speed of light. When the run ends, a strip of three bars appears that shows the distance between the mirrors in each clock. In Part 2 you choose any speed and run that."

**1h. "Your job."** "Before you press START, make two guesses. First, for the moving clock's tick to take the time that time dilation gives, must the mirrors be as far apart as at rest, closer together, or farther apart, as seen from the lab? Second, how far apart must they be, in light-seconds? A wrong guess is fine, and guesses are not scored. Then watch the clocks, try other speeds in Part 2, and talk it over with the tutor."

**1i. New paragraph, "Your guesses and the real pictures."** "Your guesses never change the real pictures, the clocks or the numbers: they come from a calculation that knows nothing about what you guessed. Your number is drawn on the strip of bars in white, in a box labelled YOUR GUESS, and your choice is drawn as a white marker (a marker only: it has no size, it just points at the choice you made). Both guesses are shown again beside the results. In Part 2 the speed you choose does change the clocks and the drawings, and the marks it moves are pink."

**1j. "Some new words."** "The "Words and formulas" box below has each one, with a short plain meaning: light clock, tick, mirror, light pulse, light-second, lab, lab seconds, lab time, reference frame, at rest, moving, along its own length, c, time dilation, time dilation factor, clock's own reading, "what if" (imagined), and the one formula used here, distance = speed × time."

**"What we assume"** (items as approved, with three edits): "Experiment 2" becomes "Two clocks at rest"; the first bullet's pair "We watch everything from the lab" stays; the c note moves here from beside the speed buttons: "**c** is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that. A light speed of 1.000c means exactly the speed of light." The speed cap goes to Part 2's note (section 4).

**Kept as the specification requires:** the introduction states the time dilation rule before the prediction (specification, Introductory text). It does **not** use the words "length contraction", say how far apart the mirrors must be, or say which clock is right. That stays with the tutor.

---

## 2. "Want to know more?" (opens in a new tab)

Searched and fetched 2026-11-09 (by a helper; **WebFetch gives a summary of each page, not its raw text, so every quote below is verbatim only as far as that summary reproduced it, and the helper, not Claude, read the pages**). The list shows the pages from the start, except the one that is held back (see below). Each opens in a new tab and says in a few plain words what the learner will find.

**Linked from the start:**
1. **NASA Science: "Our Milky Way Galaxy: How Big is Space?"** (NASA Science, Exoplanet Exploration Program; first posted 2 April 2019, updated 22 April 2024). "A short, friendly article that says light travels 186,000 miles (300,000 kilometers) every second." It backs only that number. (Reused from Relativity 3 to 5; loaded again 2026-11-09.)
2. **NASA Glenn Research Center: "How 'Fast' is the Speed of Light?"** (NASA Glenn K-12; no date shown; https://www.grc.nasa.gov/www/k-12/Numbers/Math/Mathematical_Thinking/how_fast_is_the_speed.htm). "A plain page that says light goes 186,000 miles every second, enough to circle the Earth's equator about 7.5 times in one second." **Honest limit:** miles only, and it never uses the word "light-second", so it supports the idea but not the term.
3. **NASA Space Place: "Is Time Travel Possible?"** (NASA Space Place; last updated 30 April 2020; https://spaceplace.nasa.gov/time-travel/en/). "A friendly page on how the faster you travel, the slower you experience time, with a clock on an aeroplane." **Honest limit:** it is about "time travel", not about clocks and mirrors, and it says nothing about length. It is the best plain NASA match for time dilation, the rule this page keeps.
4. **NASA ISTP, "Stargazers": "Lesson 23: Frames of Reference: The Basics"** (NASA Goddard; last updated 24 October 2004; https://pwg.gsfc.nasa.gov/stargaze/Lframes1.htm). "A plain explanation of a frame of reference, with rain that looks slanted from a moving car." **Honest limit:** it is old (2004), it drifts into Earth's orbit and the solar wind, and it is about everyday (not relativistic) motion. It does not mention light clocks or length.

**Held back until after the tutor's explanation** (shown as a second line then, as in Relativity 4 and 5): it says in so many words that moving things are measured shorter, which is the answer to the learner's guess.
5. **Einstein Online: "Elementary Tour, part 3: The relativity of space and time"** (Einstein Online, Max Planck Institute for Gravitational Physics; https://www.einstein-online.info/en/?p=6554; no date shown). A plain page, with no equations or numbers, that says moving clocks run slower and that a measuring rod whizzing past appears shortened. **Honest limit:** it is introductory and does not show how long or how short. It is from a Max Planck institute, not NASA, ESA or CERN, as for Relativity 5.

**Gaps recorded (§29 rule 3(c)), searched 2026-11-09:**
- **Length contraction, from NASA, ESA or CERN:** none found. The Einstein Online page above is the only plain page found, and it is held back. Not linked: *OpenStax, University Physics Volume 3, "5.4 Length Contraction"* (Rice University; 29 September 2016; https://openstax.org/books/university-physics-volume-3/pages/5-4-length-contraction), because it gives the length formula and a muon example (real-world evidence, which the specification leaves out, Decision 10) and is a college text, not a plain page. Candidate that could not be fetched: The Physics Classroom (HTTP 403), also not an official source.
- **Einstein's 1905 paper, "On the Electrodynamics of Moving Bodies":** not linked (the owner's answer). The Wiley page for the paper returned HTTP 403, so open access was not confirmed; a university PDF of the translation returned 404; two CERN timeline pages gave a login redirect and a 503. The journal details (Annalen der Physik 17, pp. 891 to 921) come from search-result text only. **If the owner later wants it linked, an archival copy has to be found and fetched first.**
- **Light-second:** none found. The NASA Glenn page above gives the distance but not the term. The introduction defines it in its own words.
- **Real-world evidence for length contraction:** none found from an official source. Out of scope for this page in any case (Decision 10).
- **Not used:** NIST, "Your Head is Older Than Your Feet" (2010; about a moving clock and gravity, and real-world evidence); NASA, "10 Things Einstein Got Right" (fetched; it does not explain time dilation or length contraction); a UNLV page (the fetch returned an unrelated image description); a JILA page (about black holes).
- **Reference frame:** the NASA ISTP page is the same candidate as in Relativity 5.
- **Real results:** none. Every number comes from the geometry the specification gives, not from a measurement, so there is no paper to link.

---

## 3. "Words and formulas" (collapsed box)

- **Light clock:** a clock made of two mirrors facing each other, with a pulse of light bouncing between them. It counts each round trip of the pulse. Here the mirrors are in a line along the direction the clock moves.
- **Tick:** one round trip of the pulse, from the back mirror to the front mirror and back. The clock counts ticks to measure time.
- **Mirror:** a flat shiny surface that bounces light back.
- **Light pulse:** a very short flash of light.
- **Light-second:** the distance light travels in one second, about 300,000 km. Half a light-second is about 150,000 km.
- **Lab:** the place where the experiment is set up, with clocks and observers standing still.
- **Lab seconds:** seconds counted by the clocks standing still in the lab.
- **Lab time:** the time shown on the lab's clocks.
- **Reference frame:** a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others. The lab is one; the moving clock has its own.
- **At rest / moving:** standing still, or not standing still, compared with the lab.
- **Along its own length:** in the same direction as the line joining the two mirrors, which is also the direction the clock moves.
- **c:** the speed of light, about 300,000 km every second. 0.5c is half of that, and 1.000c means exactly the speed of light.
- **Time dilation:** the effect you met in "A moving clock" and "Why time dilation happens": a moving clock's ticks are farther apart than a standing clock's, as measured by the lab's clocks.
- **Time dilation factor:** the rest clock's tick divided by the moving clock's tick, on the lab's clocks. 1 means no slowing; a smaller number means the moving clock's ticks are farther apart.
- **Clock's own reading:** the time shown on the moving clock's own display. It is lab time multiplied by the time dilation factor.
- **What if (imagined):** drawn in violet and labelled "imagined". It is something we picture to see what would change; no instrument measured it.
- **Formula, distance = speed × time** (or time = distance ÷ speed). The results use it for each trip of the pulse. *Worked example from this page:* light goes at 1 light-second every second, so to cover 0.5 light-second it needs 0.5 ÷ 1 = 0.5 second. (The formulas for the trips in a moving clock and for the length of the clock are not given here, because they would give away what you are asked to predict.)

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you make two guesses: how far apart, in light-seconds, the mirrors of the moving clock must be, and whether that is as far apart as at rest, closer together or farther apart. Then you press START and watch one tick of each clock, with the moving clock going at 0.5c and the path of each pulse drawn as it goes. When the run finishes, a strip of three bars appears that shows the distance between the mirrors in each clock, with your guess drawn on it in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a speed from 0.01c to 0.9c and watch one tick of each clock at that speed. The speed you choose changes the clocks and the drawing in this Part, marked in pink. It does not change Part 1's pictures, the results in Part 3, or your guesses."
*Note beside the speed buttons:* "Your guesses do not change these drawings, but the speed you choose does. The speed stops at 0.9c on this page because the tick of the violet clock grows very quickly with speed (about 50 seconds at 0.99c), which would make the run too long to watch."
*Before any Part 2 run:* "Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with your guesses or with the speed you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white marks, then explains."

---

## 5. The prediction

Two guesses, as today, with the speed fixed at 0.5c (the speed buttons have moved to Part 2). **Question** (old text had the chosen speed): "The clock standing still has its mirrors 0.5 light-seconds apart, and one tick takes 1 second. Another identical clock moves along its own length at 0.5c. Time dilation says that one tick of the moving clock takes **1.155 seconds** on the lab's clocks. Light always goes at c in the lab. **Guess 1:** for its tick to take that long, the two mirrors of the moving clock, as seen from the lab, must be:" Buttons (labels as today): **As far apart as at rest / Closer together / Farther apart.** "**Guess 2:** how far apart, in light-seconds, must they be? Type a number." Box: "Enter light-seconds". Line under them: "Your prediction: …" or "Choose an option and enter a number to continue".
After START: "Your prediction is locked while you try other speeds. To change it, press Start over." START stays disabled until a choice and a number are entered. **Start over** is always visible, greyed out until a guess is entered or a run has started, and while a run plays. After the first run, START is replaced by "Run your speed" in Part 2 (it needs no new guess).

---

## 6. Part 1's pictures: the three light clocks and the mirror-gap strip

**The panels, labelled on the canvas (new):** each panel gets its title drawn inside the picture on two lines: "Rest clock:" / "at rest in the lab"; "Moving clock, mirrors closer together:" / "seen from the lab"; "IMAGINED: moving clock, mirrors" / "as far apart as at rest, seen from the lab". "Back mirror" and "Front mirror" beside the two black bars, "Light pulse" beside the dot, "Path of the light" along the line (forward leg and return leg), and, on the two moving panels, "Where the mirrors started" beside the dashed lines (replacing the bare word "start"). The existing mark "front mirror when the pulse hit it" stays. The rest and closer-together panels keep blue and amber; the as-far-apart panel's pulse, path and title are violet. Exact placement is checked in the browser, including the narrow layout.

**The mirror-gap strip (new), shown when the run ends:** one scale in light-seconds from 0 to 1 (twice the rest gap), ticks and numbers at 0, 0.5 and 1. Three bars: "Rest clock: gap between the mirrors" (blue) ending at 0.500; "IMAGINED: mirrors as far apart as at rest" (violet) ending at 0.500; "Mirrors closer together" (amber) ending at 0.433 at 0.5c. Each has its number under its end, and a dashed line joins them at 0, where the back mirrors start. **The white mark:** a white vertical dashed line across the two moving bars at the guessed gap, with a white dot on the amber bar and a white box "YOUR GUESS: N light-seconds" joined to it by a line; a guess beyond the scale (or below 0) is a white arrow at the edge and the box says "(off the scale)". **The choice marker:** a white tag "YOUR GUESS: as far apart as at rest" (or "…closer together" or "…farther apart than at rest"), joined by a line to the bar it names (for "farther apart", to a white arrow just past the end of the rest bar), with the words "a marker only". The marks appear only when the strip appears (§12).

**"Where the real picture comes from":** under the panels: "**Calculated here from the speed, not measured:** the three clocks come from the light-clock geometry, with the pulse chasing the moving front mirror and meeting the moving back mirror. **Imagined for the question:** the violet clock shows what would happen if the mirrors stayed as far apart as at rest, which is not what happens in this course's model. The light clock itself is imagined, a giant clock with its mirrors half a light-second (150,000 km) apart, so that the numbers are easy to read. Real light clocks are much smaller. No instrument measured these ticks." Under the strip: "Calculated here, not measured, except the violet bar, which is imagined for the question. The white mark and the marker are only your guesses, placed on the same scale."

**Caption 1, "How to read the three light clocks"** (shown from the start; only what is drawn before the run):
- **Three panels** show the same kind of clock, with its two mirrors in a line along the direction of motion. The top one, the **Rest clock**, stands still in the lab. The other two are the **same moving clock**, seen from the lab, drawn twice. The only difference is the distance between their mirrors. The violet one, labelled **IMAGINED**, has its mirrors as far apart as at rest, which is a "what if". The amber one has its mirrors closer together.
- **In each panel:** two black bars are the **back mirror** and the **front mirror**. The dot is the **light pulse**, and the line is the **path** it has taken so far. The three panels use the same scale (in light-seconds), so you can compare distances by eye.
- **The moving clocks:** the whole clock, both mirrors, slides along together, front mirror first. The dashed lines show where the mirrors started. Once the pulse has hit the front mirror, a faint mark shows where that mirror was at that moment, because the mirror has already moved on.
- **The two legs of the path** are drawn at slightly different heights only so that you can see both. The light really travels along one line.
- **The readouts:** above the panels, "Lab time" is the time on the clocks standing still in the lab. Each panel's box shows that clock's own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds).
- **When the run ends:** (reworded 2026-11-09 at the owner's request, as a short list) the clock standing still keeps ticking until the run ends; each moving clock makes exactly one tick (one round trip of its pulse) and then freezes, keeping its reading; the two moving clocks finish at different moments, because the tick is shorter for the clock whose mirrors are closer together, so that clock freezes first (like two runners on tracks of different length at the same speed; the one on the shorter track waits at the line); the run ends when the slower moving clock has finished its tick. The old wording said a moving clock could "stand still" while the other ran, which could be read as the clock moving at no speed.

**Caption 2, "How to read the three mirror-gap bars"** (shown with the strip, after the run):
- **The bars** appear when the run ends. They are a distance scale in light-seconds: the further right, the longer. Each bar is one of the three clocks, and its length is the distance between its two mirrors, as measured from the lab. Think of the length of a train carriage drawn as a bar: a longer bar is a longer carriage. The left end (0) is the back mirror, where all three clocks start. The right end is the front mirror. The scale runs to 1 light-second, twice the rest clock's gap, so there is room on the right.
- **Blue: the clock standing still.** This is the baseline. Its mirrors are 0.500 light-seconds apart.
- **Violet: the moving clock with the mirrors as far apart as at rest.** This one is imagined, drawn only to answer the question. Its mirrors are 0.500 light-seconds apart.
- **Amber: the moving clock with the mirrors closer together.** Its mirrors are 0.433 light-seconds apart at 0.5c.
- **The white mark and the YOUR GUESS box** are your number, placed on the same scale. A white arrow at the edge means your guess is beyond the end of the scale. The **white marker tag** is your choice: it has no size, it is only a marker that points at the choice you made. None of the white things ever moves a bar.

*A worked moment.* At 0.5c, the mirrors were 0.500 light-seconds apart in the rest clock and the violet clock, and 0.433 light-seconds apart in the amber clock. For the violet clock, the pulse ran forward for 0.500 ÷ 0.5 = 1.000 s and back for 0.500 ÷ 1.5 = 0.333 s: one tick took 1.333 s. (The pulse closes the gap at c − 0.5c = 0.5c on the way forward and at c + 0.5c = 1.5c on the way back; the mirrors are moving.) For the amber clock, the pulse ran forward for 0.433 ÷ 0.5 = 0.866 s and back for 0.433 ÷ 1.5 = 0.289 s: one tick took 1.155 s. Time dilation says one tick of the moving clock takes 1.155 s. If you had guessed 0.45 light-seconds, your white mark would sit at 0.45, 0.017 light-seconds to the right of the end of the amber bar.
*What to look for.* (Each item appears only once what it refers to is drawn; each says what to look at, what it means and why it matters.)
1. **Look at** the right end of the blue bar. **What it means:** the mirrors of the clock standing still are 0.500 light-seconds apart, which is our starting point. **Why it matters:** every other bar is compared with this one, so it shows what "no change" looks like.
2. **Look at** the blue bar and the violet bar together. **What it means:** they end in the same place, 0.500 and 0.500 light-seconds. The violet clock has its mirrors as far apart as the clock at rest. **Why it matters:** it shows the "what if" we are testing, that moving does not change the distance between the mirrors.
3. **Look at** the gap between the end of the amber bar and the end of the violet bar. **What it means:** the amber clock's mirrors are 0.500 − 0.433 = 0.067 light-seconds closer. **Why it matters:** it turns the difference between the two moving clocks into a length you can see. The tutor will help you work out which of the two fits what time dilation says.
4. **Look at** the white YOUR GUESS mark and the end of the amber bar, and at the white marker tag. **What it means:** the gap between the mark and the end of the bar is how far your number was from the amber clock's distance, in light-seconds. The tag only says which choice you made. **Why it matters:** it puts what you expected beside what the clocks showed.

---

## 7. Part 2's picture: Drawing A

**Drawn:** the live set of three panels for the chosen speed (they run as in Part 1) and, when the run ends, the same three bars on the same scale, 0 to 1 light-second, with **the learner's speed written in pink** above the bars (the bars keep their blue, violet and amber colours; pink is the setting). The white guesses are **not** redrawn (they were guesses for the 0.5c run). The scale stays at 0 to 1 at every speed (the rest gap is 0.5 and no gap is larger), so the bars can be compared from run to run. Below it, "Runs so far": one line per run, such as "0.8c: mirrors as far apart as at rest (imagined) 0.500, one tick 2.778 s; mirrors closer together 0.300, one tick 1.667 s, which is the tick time dilation gives".

**"Where the real picture comes from":** as in Part 1, with "the speed you chose".

**Caption, "How to read Drawing A":** the panels work as in Part 1, for the speed you chose; the bars work as in Part 1, on the same scale at every speed; pink marks your own speed; "Runs so far" lists every run in this Part. *Worked moment:* at 0.8c the mirrors of the amber clock were 0.300 light-seconds apart, and one tick took 0.300 ÷ 0.2 = 1.500 s forward and 0.300 ÷ 1.8 = 0.167 s back, 1.667 s in all. **Look at** the amber bar in each run in "Runs so far". **What it means:** the amber gap gets shorter as the speed goes up (at 0.1c 0.4975; at 0.8c 0.300), while the violet gap stays at 0.500. **Why it matters:** it shows how the Part 1 result depends on the speed. (It names no explanation; the tutor gives that, §12.)

---

## 8. Results (Part 3)

Lines as today (the speed; "The tick that time dilation gives"; the rest clock's distance, tick time and light's speed; each moving clock's distance between the mirrors, time for each trip, time for one tick, light's speed forward and back, and "difference from the tick that time dilation gives"; "Your prediction"), with:
- A small "your guess" tag on each moving clock's gap line, and the line "Your guesses are drawn on Part 1's strip as a white mark and a white marker."
- Under the lines, **"What these results tell us"** (what it is, what it means with the real numbers, why it matters; no mechanism):
  - **The rest clock.** "Mirrors 0.500 light-seconds apart, one tick of 1.000 s, a light speed of 1.000c. Why it matters: this clock stands still, so it is the one to compare the others with."
  - **The tick that time dilation gives.** "1.155 s at 0.5c: the length of one tick of the moving clock as the lab's clocks show it. Why it matters: it is the target both moving clocks are compared with."
  - **The violet clock (imagined: mirrors as far apart as at rest).** "Mirrors 0.500 light-seconds apart; the pulse's trip forward took 1.000 s and its trip back 0.333 s; one tick took 1.333 s, which is 0.179 s longer than the tick time dilation gives; light's speed was 1.000c in both directions. Why it matters: this is what would be seen if the mirrors did not move closer; its tick does not fit. Remember this is imagined for the question."
  - **The amber clock (mirrors closer together).** "Mirrors 0.433 light-seconds apart; the trips took 0.866 s forward and 0.289 s back; one tick took 1.155 s, the same as the tick time dilation gives; light's speed was 1.000c in both directions. Why it matters: with the mirrors this far apart, the tick matches."
  - **Light's speed, seen from the lab.** "Path divided by time. It is 1.000c for both legs in both moving clocks. Why it matters: light's speed stayed exactly c, so the trips differ only in how far the mirrors were apart."
- **"Where these numbers come from." (moved 2026-11-09 at the owner's request from the bottom of Part 3 to directly under the Part 3 lead, and split in three lines):** **Measured:** nothing on this page. No instrument measured these lengths or ticks. **Calculated here:** the mirror gaps, tick lengths and light speeds, from the speed you ran, using the light-clock geometry and the time dilation you met in earlier chapters. **Imagined for the question:** the violet clock, with its mirrors kept as far apart as at rest.

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: the page computes each tick from the same geometry a check would use, so a check-up would be circular, and the control only moves marks and numbers. The "difference from the tick that time dilation gives" lines stay as plain numbers.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe:** "Look at the three clocks and at the strip of bars. What is different between the two moving clocks? Think about how long each pulse's trip forward and back took."
- **Compare:** "You chose [as far apart as at rest / closer together / farther apart] for the mirrors of the moving clock. That is the white marker. You guessed [N] light-seconds. That is the white mark on the strip. In the clock with the mirrors as far apart as at rest, the gap was 0.500; in the clock with the mirrors closer together, it was [X]. What do you notice when you compare your mark with the bars?"
- **Conceptual:** unchanged ("Time dilation says the tick of the moving clock should take 1.155 seconds. Light goes at c in both clocks. What would have to change about the clock to fix its tick?").
- **Explanation:** points 1 to 5 stay as today (1 The two trips, with "A familiar version of this", 2 A tick that is too long, 3 What has to change, 4 A name, 5 Only along the motion, "Two things to remember"), with "Experiments 3 and 4" and "Experiments 4 and 5" replaced by the chapters' titles, "1 second" in the clock's own display coming from the module (the rest tick), and the numbers still from the module. Then:
  - **Your guesses, marked** (no score, and no "right" or "wrong"): "You chose [x]. The gap that fits is the amber clock's, 0.433 light-seconds, which is closer together than at rest. Your white mark was at [N], [0.0xx] light-seconds [more than / less than / the same as] that gap." (the choice line says which it was and which the learner chose; the number line is the module's)
  - **Try it in Part 2.** "Try 0.1c and 0.8c. At 0.1c the amber gap is 0.4975, hardly closer than at rest; at 0.8c it is 0.300. The violet clock's tick grows with speed: 1.010 s at 0.1c, 2.778 s at 0.8c. Try 0.9c: the amber gap is 0.218, and one tick of the violet clock takes 5.263 s." (numbers by hand here, to be taken from the module when built)
  - **What comes next.** The chapter's existing "What's next" line, in the page's own words as approved.

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `lengthContractionExperiment.ts`:
- `GAP_SCALE_END` (1 light-second, twice the rest gap) and `gapBarsScaleEnd(experiment)`.
- `guessPositionOnGapBars(experiment, guess)` returns the scale's end, the guess's position as a fraction 0 to 1 (clamped), which edge it is off (`'left'`, `'right'` or none), and the guess minus the closer-together clock's real gap. It refuses a guess that is not finite.
- `choiceMarker(experiment, choice)` returns where the white marker points: the rest-gap (violet) bar for "as far apart", the amber bar for "closer", or the arrow past the rest bar for "farther", and which choice time dilation actually requires (`'closer'` for any speed above 0, `'same'` at 0), for the tutor's marking.
- `markGuess(experiment, guess)` returns `'more'`, `'less'` or `'the same'` than the real gap to three decimals, for the tutor.
- The clock's own tick (the rest tick, 1 second) is read from `restTickDuration` instead of being typed into the tutor.

Tests (in `lengthContractionExperiment.test.ts`):
1. The scale ends at 1 light-second at every speed.
2. A guess of 0.5 sits at 0.5 on the scale, 0 at 0, 1 at 1.
3. A guess beyond the scale is clamped to 1 and flagged `'right'`; a negative guess is clamped to 0 and flagged `'left'`.
4. The differences are exact: at 0.5c a guess of 0.45 gives +0.017 and a guess of 0.4 gives −0.033.
5. The real results are the same for any guess.
6. A non-finite guess is refused.
7. `choiceMarker`: at any speed from 0.01c to 0.9c, time dilation requires the closer-together clock; the marker names the choice the learner made.
8. `markGuess` at 0.5c: 0.433 is "the same", 0.4 is "less", 0.5 is "more".

---

## 11. Specification changes (only after approval, §28.2)

`06-length-contraction.md`: Learner Controls (the speed moves to Part 2; Part 1 fixed at 0.5c), the Display (the labelled panels, the mirror-gap strip, the guess mark and the choice marker, the imagined colour, Drawing A, "Runs so far", the layout of four Parts, Start over, the shared classes), Results Display (the tags and "What these results tell us"), the Tutor sections (marks the guesses with no score), a new "Audit update" section, a source table, and the open items.

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction:** 1a to 1j? [yes]
2. **Links and gaps** (section 2)? [yes]
3. **Words box:** the entries and the one formula, "distance = speed × time"? [yes]
4. **Leads, the note beside the speed buttons and the prediction wording:** approve? [yes]
5. **Panels and strip:** the canvas labels, the three mirror-gap bars on 0 to 1 light-second, the white mark with an edge arrow, the white choice marker, violet for the imagined clock, the captions as drafted? [yes]
6. **Violet and the word "imagined":** is violet right for the clock with the mirrors as far apart as at rest? [violet]
7. **Drawing A and "Runs so far":** as drafted, with the same 0 to 1 scale at every speed? [yes]
8. **Results:** the tags, the notes and the "Where this comes from" line, no table? [yes]
9. **Tutor:** the new prompts and the marking without "right" or "wrong"? [yes]
10. **Source reading:** the pages in section 2 were read through a helper that returned summaries, not raw text; the quotes should be spot-checked in a browser before the wording is final. Accept? [accept; flagged in the specification]
11. **Linked from the start:** the four pages above (with the honest limits stated for the second, third and fourth)? [yes]
12. **Held back until after the tutor:** the Einstein Online page, because it says moving things are measured shorter? [yes]
13. **1905 paper:** you chose to record a gap; it could not be fetched anyway. Keep the gap? [yes]
