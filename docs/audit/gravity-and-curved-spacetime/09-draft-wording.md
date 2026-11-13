# Draft wording: Gravity and Curved Spacetime Experiment 9 (Real clocks in orbit: GPS)
Date: 2026-11-13 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following `01-` to `08-draft-wording.md` of this group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-13): "all defaults" to the ten questions at the end of `09-gap-report.md`.

**Facts in this draft come from pages fetched on 2026-11-13 through helper agents whose fetch tool returns short quotes and summaries, not raw text.** Every quotation and figure marked [recheck] must be compared with the live page before it is printed. No page is linked that was not fetched. **Two things changed from what the gap report assumed, because of what the sources say** (see "What the sources changed"): the published split of the +38 µs/day into about −7 and +46 is **not** in any source I read, so no check-up row uses it; and the NASA page that explains GPS and relativity says the satellite clocks run faster, so it cannot be linked before the tutor.

## Layout
- **Above Part 1 (no heading):** a short, neutral introduction, a "Want to know more?" line with one link that gives nothing away, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** three guesses; **Start over** (always visible); three choice buttons and one **Run**; the labelled orbit drawing and a new **graph of the two effects and their sum against altitude**; white guess marks; "Where the real picture comes from"; two captions.
- **Part 2 (pink), "Now try it yourself":** the altitude slider and presets, a pink satellite on the drawing and three pink dots on the graph, with their own captions.
- **Part 3 (teal), "The results":** two tables (the three orbits, and a check-up), "What this table tells us" under each, the learner's guesses beside the results.
- **Part 4 (blue), "The tutor":** three questions, then an explanation that marks each guess.
- **After the tutor:** more links, then the closing synthesis (as now, only after the explanation).
- **Colours:** white only for the learner's guess; pink only for the learner's own altitude; **violet for the speed effect (slowing)**, **green for the gravity effect (speeding up)**, **amber for the net effect**; blue for Earth; a dark background so white shows.

---

## 1. Introduction (above Part 1; no answers given, §12)

**Title:** Gravity and Curved Spacetime 9: Real Clocks in Orbit

**The question.** "A GPS satellite carries a very accurate clock. A tiny error in that clock turns into a real error in where your phone thinks you are. Earlier you met two things that change how fast a clock ticks. In 'Relativity of Time and Motion' (Experiments 3 and 4), moving changed a clock's rate. In this group's Experiment 2, height in a gravitational field changed it. A satellite is moving *and* high up at the same time. So what happens to its clock, compared with a clock on the ground?"

**A daily-life picture.** "Think of a bank account where a deposit and a withdrawal both happen on the same day. The balance at the end of the day depends on how big each one is, not on the fact that there were two. A satellite's clock has two changes happening at once, and what we want to know is how big each one is, and what they add up to."

**What happens.** "You will guess three things. Then you will see three real satellite orbits (a low one, a GPS one and a very high one), and a graph will fill in. For each orbit we calculate the satellite's real speed, as in this group's Experiment 6, and from it two effects on its clock, using real numbers for Earth. Then you can choose an altitude of your own."

**Your job.** "Guess first. Then watch the three orbits, and see what the graph shows. Then try an altitude of your own and compare."

**Your guesses and the real pictures.** "Your guesses never change the real pictures or the numbers. They are drawn on the pictures in white, in a box marked YOUR GUESS, and shown again beside the results. The altitude you choose in Part 2 does change the drawing and the graph, because it is a real setting. Your guesses do not."

**Words first (§15).**
- "**Altitude**: how high above Earth's surface the satellite is, in kilometres (km)."
- "**Orbital speed**: how fast the satellite moves along its orbit. It is found from the altitude, as in this group's Experiment 6."
- "**A microsecond (µs)**: one millionth of a second. 38 µs is 38 millionths of a second."
- "**µs/day**: how many microseconds a clock gains or loses in one day compared with a ground clock. A plus sign means it gains (runs fast); a minus sign means it loses (runs slow)."
- "**Geostationary orbit**: an orbit so high that the satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, above the same spot on the equator."

**What we assume.** "(1) Both effects use the same simple first-order formulas as in the earlier experiments: accurate to very high precision for a real satellite, but not the full general relativity formula. (2) The orbit is treated as exactly circular and Earth as a perfect, non-spinning ball, and the ground clock sits on Earth's surface at its average radius. A few smaller real GPS corrections (Earth's spin, the orbit's slight oval shape and others) are left out. (3) The numbers are real, not made-up: Earth's real mass and size and the real speed of light."

**Some new words.** "The 'Words and formulas' box below has each term with a short meaning."

**Want to know more?** "One plain page is listed here: NASA Space Place, 'What Is an Orbit?'. More pages, including the original scientific review, are listed after the tutor, because they say how the two effects add up, which is what you are about to guess."

*(Removed from the introduction: the swimmer picture ("depends on which push is stronger at that particular moment"), which hinted at guess 3, replaced by the bank-account picture; "see which effect wins, and by how much" from "Your job"; and the paragraph pointing ahead to "Putting It All Together", which moves to the end of the tutor.)*

---

## 2. The three guesses (reworded for neutrality; **needs your approval**)
1. *(was: "A satellite orbiting higher up moves slower than one orbiting lower down... does the speed-based slowing effect get stronger, weaker, or stay the same?")* **New:** "A satellite's speed slows its clock down. As the satellite's orbit gets higher, does that slowing get bigger, get smaller, or stay about the same?" Buttons: **A bigger slowing / A smaller slowing / About the same slowing.**
2. "Do you think there is a specific altitude where the speed effect and the gravity effect exactly cancel, so the satellite's clock matches a ground clock?" Yes / No. *(Kept as approved.)*
3. "At GPS altitude (about 20,200 km), do you think the satellite's clock ends up running faster than a ground clock, slower, or at the same rate?" Faster / Slower / Same rate. *(Kept as approved.)*

(The old prompt for guess 1 told the learner that higher orbits move slower, which is most of the answer.)

**Start over (always visible, greyed until there is a guess or a run):** "Your predictions are locked while you try other settings. To change them, press Start over." It replaces "Change predictions", and clears the guesses, runs, results and tutor.

---

## 3. Part 1: Predict, then watch

**Lead (no answers):** "What we are about to do: you will guess three things about a satellite's clock. Then you will watch three real orbits, and a graph will fill in. Nothing you guess changes what the numbers are."

**The three orbits (choice buttons and one Run; the Run selects the next unrun choice; "Orbits watched: n of 3"):**
1. "A low orbit (the International Space Station, about 400 km)"
2. "A GPS orbit (about 20,200 km)"
3. "A very high orbit (geostationary, about 35,786 km)"

**Note (shown until all three have run, after the first):** "Run the other two to complete the graph."

### The orbit drawing, labelled on the canvas
- Blue disc: "Earth".
- Thin ring: "Orbit (" + altitude + ")", the number following the orbit.
- Dot on the ring: "Satellite".
- A line from the Earth's surface to the satellite, labelled "Altitude: 400 km" (follows the orbit).
- A note on the canvas: "Not to scale: the orbits are squeezed so that all three fit."
- After all three orbits have run, a dashed ring: "Balance altitude: the speed and gravity effects cancel here (about 3,186 km)". *(The old drawing showed this ring from the first frame, which answered guess 2.)*
- Earlier orbits stay faint on the drawing, labelled "ISS", "GPS" and "Geostationary" as each is run.

### The graph, labelled
- Title: "Effect on the satellite's clock, for each altitude".
- Across: "Altitude (km)", 0 to 36,000 (linear). Up: "Clock gain or loss compared with the ground (µs per day)", with a bold line at zero labelled "Same as a ground clock" and the words "clock runs fast" above it and "clock runs slow" below it.
- Dots, one set per orbit run: a violet dot for the speed effect ("Speed: slows"), a green dot for the gravity effect ("Height: speeds up") and an amber dot for the sum ("Net: both together"). After one run, three dots; after two, six.
- After the third run, the three curves are drawn through the dots, from the module's sweep: violet "Speed effect (slowing)", green "Gravity effect (speeding up)", amber "Net effect".
- White marks (each drawn only once the feature beside it is drawn, §12):
  - **Guess 1 (after the curves):** a short white straight line next to the violet curve, tilted downward to the right for "a bigger slowing", upward to the right for "a smaller slowing", flat for "about the same", in a box "YOUR GUESS: a bigger slowing" (and so on). **Only its direction is your guess; its position and size mean nothing**, said in the caption.
  - **Guess 2 (after the curves):** a white flag on the zero line in a box "YOUR GUESS: yes, there is a balance altitude" or "YOUR GUESS: no, there is not". It is only a marker. Its position along the line means nothing, said in the caption.
  - **Guess 3 (after the GPS orbit has run):** a white ring above the zero line at 20,200 km for "faster", below for "slower", on it for "same rate", in a box "YOUR GUESS: faster" and so on. The height means nothing, said in the caption.

### Where the real picture comes from (one block under both pictures)
"**Calculated here:** every number, from Earth's real mass, radius and the real speed of light, using the same simple formulas as the earlier experiments, for a circular orbit and a non-spinning Earth. **Measured:** nothing is drawn from a measurement. The scientific review listed after the tutor (Ashby, 2003) works out the same kind of effects for real GPS satellites and reports that they have been confirmed with real clocks, but this page does not draw them. **Imagined for the question:** nothing; every orbit shown is a real kind of orbit. White is only ever your guess."

### Caption under the drawing: "How to read the orbit drawing"
- "It is a view from above Earth's pole. It shows where each satellite is, and nothing about its clock."
- The blue disc is Earth. The thin ring is the orbit. The dot is the satellite. The line from Earth's surface to the dot is the altitude.
- "The distances are not to scale. A real GPS orbit is about three times as far out as the International Space Station's is close to Earth's surface, but the drawing squeezes every orbit (a square-root scale) so that the Earth and all three orbits fit. Only the order, higher or lower, is true."
- The dashed ring (shown after all three orbits) marks one altitude where the graph's two effects cancel. It is explained under the graph.
- "What to look for" items (each with **Look at / What it means / Why it matters**, shown only once the feature is drawn):
  - *The ISS ring and the GPS ring (after the second orbit).* Look at: how far each ring is from Earth. Means: the ISS flies about 400 km up, GPS satellites about 20,200 km, about 50 times higher. Matters: it shows how large a change in height the graph covers.
  - *The geostationary ring (after the third orbit).* Look at: the outermost ring. Means: at about 35,786 km, a satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, always above the same spot on the equator. That is why this is called a geostationary orbit. The drawing does not show Earth spinning, so you cannot see this in the picture. Matters: it is the highest orbit used on this page.

### Caption under the graph: "How to read the graph"
- "Along the bottom is altitude in km. Up the side is how much a satellite's clock gains (above the zero line) or loses (below it) compared with a ground clock, in microseconds per day."
- Violet: the effect of the satellite's speed. Green: the effect of the satellite's height in Earth's gravity. Amber: the two added together.
- White marks: your guesses, each in a YOUR GUESS box. For guess 1 only the **direction** of the white line is your guess. For guess 2 the flag is only a marker. For guess 3 the ring's height means nothing.
- **What happens, in order.** "Each orbit you run puts three dots on the graph (violet, green and amber). The third run draws the three curves through the dots and adds your white marks for guesses 1 and 2. Your mark for guess 3 appears once the GPS orbit has been run."
- **A worked moment.** "At the GPS orbit the speed effect is −7.21 µs/day (the clock loses 7.21 millionths of a second a day) and the height effect is +45.72 µs/day. Added together: −7.21 + 45.72 = +38.51 µs/day." *(Numbers from the module.)*
- "What to look for" items:
  - *The three dots at the ISS orbit (after the first run).* Look at: the violet, green and amber dots. Means: at about 400 km the speed effect is −28.30, the height effect +3.55 and the net −24.74 µs/day, so the net is below zero. Matters: it shows that, for a low orbit, one of the two effects is far bigger than the other.
  - *The violet curve from left to right (after the curves).* Look at: how far below zero it sits at the left and at the right. Means: it goes from −28.30 µs/day at 400 km to −4.54 at 35,786 km. Matters: it is the picture that answers the first question.
  - *The amber curve against the zero line (after the curves).* Look at: where it crosses zero. Means: it crosses once, at about 3,186 km, and is above zero everywhere higher. Matters: it is the picture that answers the second question; the tutor explains why it crosses.
  - *The amber dot at the GPS orbit (after the second run).* Look at: whether it sits above or below the zero line. Means: it sits at +38.51 µs/day. Matters: it is the picture that answers the third question.

---

## 4. Part 2: Now try it yourself

**Lead:** "What we are about to do: you will choose an altitude of your own and see what happens to a satellite's clock there. You will get three numbers, in microseconds per day: the slowing from the satellite's speed, the speeding up from its height, and the net of the two. Your satellite is drawn in pink, and three pink dots land on the graph, one for each number, each outlined in the colour of its curve."

**The control:** "Orbital altitude" slider, 300 to 36,000 km, step 10, opening on 20,200 km; three preset buttons (ISS ~400 km, GPS ~20,200 km, Geostationary ~35,786 km); "Show my altitude". *(Kept as built.)*

**Note beside the control:** "Your guesses do not change the drawings or the numbers, but this setting does. Press Start over to change a guess."

**Drawing:** the pink satellite and ring, labelled "Your satellite: 2,000 km" (follows the slider), with Part 1's orbits faint. **Graph:** three pink-outlined dots (speed, gravity, net) at your altitude, the newest labelled ("your altitude 2,000 km: net −8.52 µs/day"), the three curves unchanged.

**Captions, after the first run (one under each picture):**
- *Drawing:* pink is your altitude; the faint rings are Part 1's. *What to look for:* your pink ring against the dashed balance ring (Look at: which is higher; Means: below 3,186 km the net is negative; Matters: you can test the balance altitude yourself).
- *Graph:* a worked moment from your latest altitude. *What to look for:* your pink net dot against the zero line (Look at: above or below; Means: the net is below zero at 2,000 km (−8.52) and above zero at 5,000 km (+9.60); Matters: this is how you can see the crossover for yourself).

**Runs so far:** "Altitude 2,000 km: speed −22.89 µs/day, gravity +14.37, net −8.52."

---

## 5. Part 3: The results

**Lead:** "What we are about to do: you will read the numbers behind the three orbits and a check-up of the page's numbers against a scientific review. The tables never change with your guesses or with the altitude you choose in Part 2. Only the pink line at the bottom follows your latest altitude."

**Table 1: the orbits you watched** (altitude; orbital speed; speed effect; height effect; net; "your guess" tag; no verdict):

| Orbit | Altitude | Speed | Speed effect | Height effect | Net | Your guess |
|---|---|---|---|---|---|---|
| ISS | 400 km | 7.673 km/s | −28.30 µs/day | +3.55 µs/day | −24.74 µs/day | |
| GPS | 20,200 km | 3.873 km/s | −7.21 µs/day | +45.72 µs/day | +38.51 µs/day | guess 3 |
| Geostationary | 35,786 km | 3.075 km/s | −4.54 µs/day | +51.06 µs/day | +46.51 µs/day | |

*(Numbers from the module. Guess 1's tag sits on the "Speed effect" column heading, guess 2's on the "Net" column heading ("where it crosses zero"), guess 3's on the GPS row.)*

**What this table tells us:**
- *What it is.* "Each row is one real orbit. 'Speed effect' is how much the satellite's motion slows its clock. 'Height effect' is how much being higher in Earth's gravity speeds it up. 'Net' is the two added together. All are compared with a clock on the ground."
- *What it means.* "At the GPS orbit: −7.21 + 45.72 = +38.51 µs/day, so the satellite's clock gains about 38.5 millionths of a second every day. At the ISS orbit: −28.30 + 3.55 = −24.74, so the clock loses about 24.7 millionths of a second a day. The sign of the net flips somewhere between the two."
- *Why it matters.* "The size of a tiny clock error can be turned into a distance. Light travels about 300 metres in one millionth of a second, so a clock error of 38.5 µs is about 38.5 × 300 m = 11.5 km of position error after a day (a worked number from the speed of light, 299,792,458 m/s, not a measured figure). Ashby (2003) says a one-nanosecond timing error means a position error of about 30 centimetres [recheck], and NASA Space Place says uncorrected errors 'would add up to a few miles each day' [recheck]. This is why GPS satellites' clocks are deliberately set to correct for it."
- *How sure.* "The page's numbers use simple formulas and a non-spinning Earth, so they are close to, not identical with, the scientific review's. The check-up below shows by how much."

**Table 2: check-up** (where a real reference exists):

| What we check | Expected (published) | Found (this page) | Reading |
|---|---|---|---|
| Net rate offset of a GPS satellite clock, as a fraction | 4.4647 × 10⁻¹⁰ faster (Ashby 2003) | 4.458 × 10⁻¹⁰ faster | close: 0.16 percent apart |
| Balance orbit (where the two effects cancel), distance from Earth's centre | about 9,545 km (Ashby 2003) | 9,557 km (1.5 Earth radii) | close: 0.12 percent apart |
| Which way does a GPS satellite's clock run? | faster than a ground clock (Ashby; NASA Space Place) | faster | the same |
| Which effect wins for a low orbit (a Space Shuttle orbit)? | speed (time dilation) wins (Ashby 2003) | speed wins at the ISS orbit (−24.74) | the same |

*(Row 1 and 2 use the numbers Ashby gives in his Section 5, read through a helper: "−4.4647 × 10⁻¹⁰" with "the standard clock in orbit is beating too fast", and "The effects cancel at a ≈ 9545 km" [recheck both]. The page's net fraction is the module's exact value, 4.4576 × 10⁻¹⁰ (38.51 µs/day is that number rounded). The percentages are computed from those two numbers, not quoted. No cut-off such as "good enough" is used. Rows 3 and 4 are qualitative and say "the same" or not. The split into about −7 and +46 µs/day is **not** in Ashby's sections that were read, so it has no row.)*

**What this table tells us:**
- *What it is.* "Each row compares something this page calculated with a published scientific review of the same system. Rows 1 and 2 compare numbers. Rows 3 and 4 compare only which way things go."
- *What it means.* "The page's net rate offset, 4.458 × 10⁻¹⁰, is within 0.16 percent of the review's 4.4647 × 10⁻¹⁰. The balance distance from Earth's centre, 9,557 km against about 9,545 km, is within 0.12 percent. The review also gets the same two directions: a GPS clock runs fast, and a low orbit's clock runs slow because its speed effect wins."
- *Why it matters.* "It shows that the simple formulas on this page, with real numbers, give almost what a scientific review of the real GPS system gets. It also shows where they differ."
- *How sure.* "The small difference is expected: the review measures the ground clock on the spinning Earth's surface (it calls this 'the rotating geoid') and includes Earth's spin in the height effect, and this page does not. We have not read every section of the review, and the numbers are from a helper's quotes, not our own measurement."

**A line for your latest Part 2 altitude (pink):** "Your altitude 2,000 km: speed −22.89 µs/day, height +14.37, net −8.52. These are trial values of your own; they do not say a real satellite is there."

**Your guesses, beside the results (guess only, no verdict):** "You guessed: the slowing as the orbit gets higher: a smaller slowing (the speed column of Table 1). Is there a balance altitude: yes (the net column). The GPS clock: faster (the GPS row)." A small tag on each.

---

## 6. Part 4: The tutor

**Lead:** "What we are about to do: you will talk over what you saw and why. The tutor points to your three white marks and the three curves, then explains."

**Observe:** "Look at the graph. Which of the three curves is closest to the zero line at the GPS altitude, and which two are far from it?" *(The bracketed outcome, "(It ran fast.)", is removed.)*

**Compare:** "Look at your three white marks: the line beside the violet curve, the flag on the zero line, and the ring at the GPS altitude. What do you notice when you compare each with the violet, green and amber curves?" *(No verdict. The old text marked all three guesses here, before the explanation.)*

**Conceptual:** "GPS satellites orbit much higher than the balance altitude. Based on what you just saw, do you think that means their clocks run fast or slow, and why? Try a few altitudes of your own in Part 2 first if you want to." *(As built, plus the invitation; "and does that match what real GPS systems have to correct for" is dropped because the match is shown in Table 2.)*

**Explanation (opens "Your guesses, marked."):** each guess is marked here, with no earlier verdict.
1. **Your guesses, marked.** "For the first question you guessed [a bigger slowing / a smaller slowing / about the same]. The slowing got smaller as the orbit got higher: from −28.30 µs/day at 400 km to −4.54 at 35,786 km, because a higher orbit moves more slowly. For the second you guessed [yes/no]. There is a balance altitude, at about 3,186 km, where the net crosses zero. For the third you guessed [faster/slower/same rate]. At GPS altitude the net is +38.51 µs/day: the clock runs faster."
2. **A satellite's clock is affected by both its speed and its height at the same time.** "Speed (the effect from 'Relativity of Time and Motion', Experiments 3 and 4) slows it down. Height (this group's Experiment 2) speeds it up. Like the deposit and withdrawal, the two add."
3. **Which one wins depends on altitude, because a circular orbit's speed and altitude are linked.** "Lower orbits move faster (Experiment 6). A faster satellite is slowed more, so the speed effect shrinks as the orbit rises. The height effect grows as the orbit rises, because the satellite is higher in Earth's gravity. One shrinks while the other grows, so at some height they are equal."
4. **The balance altitude.** "At 3,186 km (exactly 1.5 Earth radii for this page's formulas), the two effects are both 20.05 µs/day, one slowing and one speeding up, so they cancel. Ashby (2003) finds about 9,545 km from Earth's centre for the real balance [recheck], which is within 0.12 percent of this page's 9,557 km."
5. **Real GPS satellites orbit far above the balance altitude,** so the height effect wins and their clocks run fast. "The page's net, 4.458 × 10⁻¹⁰, is within 0.16 percent of Ashby's published 4.4647 × 10⁻¹⁰ [recheck]. Because of this the GPS satellites' clocks are set slightly slow before launch (Ashby gives the set frequency as 10.229 999 995 43 MHz instead of 10.23 MHz [recheck]), so that once in orbit they tick at the right rate as seen from the ground. At the ISS's orbit, by contrast, the speed effect wins, and Ashby says the same for a Space Shuttle orbit [recheck]."
6. **The size of the correction, as a distance.** "38.51 µs × 299,792,458 m/s is about 11.5 km. Ashby gives about 30 cm per nanosecond of timing error [recheck], which for 38,510 ns is 11.6 km. NASA Space Place says uncorrected errors 'would add up to a few miles each day' [recheck]. All three say the same thing in different units: the correction is needed."
7. **A real, working system.** "This is the first experiment in this journey that uses real numbers for Earth and the speed of light, not made-up amounts, because the effect is large enough, in something people use every day, to matter. Later experiments also use real figures where the sources are given." *(Softened from "the first calculation in the whole project using real numbers", as decided.)*
8. **What this page leaves out.** "A few real corrections are not in this page: Earth's spin, the orbit's slight oval shape and others. They are the reason for the small differences in Table 2."

**After the explanation:** the closing synthesis, as now, with the reference fixes in section 9 below.

---

## 7. "Words and formulas" (collapsed, above Part 1; held-back entries marked)
- **Altitude.** Height above Earth's surface in km.
- **Orbit / satellite.** An orbit is the path a satellite follows around Earth; it keeps falling toward Earth but moves sideways fast enough never to hit it (NASA Space Place).
- **Orbital speed.** How fast the satellite moves along its orbit.
- **Microsecond (µs).** One millionth of a second.
- **µs/day.** Microseconds gained (+) or lost (−) by the satellite's clock in one day, compared with a ground clock.
- **Geostationary orbit.** An orbit at about 35,786 km where a satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, above the same spot on the equator.
- **GPS.** The Global Positioning System: a set of satellites with accurate clocks, orbiting at about 20,200 km, used to find positions on the ground.
- **Weak-field, first-order formulas.** Simple formulas that are accurate when the effect is tiny, as it is for a real satellite.
- **Balance altitude.** The height where the speed effect and the gravity effect cancel. **Held back until the explanation:** the value, 3,186 km.
- **Formula shown after the first run:** orbital speed v = √(GM ÷ r), where GM is Earth's gravitational parameter (3.986 × 10¹⁴ m³/s²) and r is the distance from Earth's centre. At the GPS orbit r = 6,371 km + 20,200 km = 26,571 km, so v = √(3.986 × 10¹⁴ ÷ 2.6571 × 10⁷) = 3,873 m/s = 3.873 km/s (about 13,900 km/h).
- **Held back until the tutor's explanation** (they give away guesses 1 and 3):
  - Speed effect ≈ −v² ÷ (2c²). At GPS: v = 3,873 m/s, c = 299,792,458 m/s, so v² ÷ 2c² = 1.50 × 10⁷ ÷ (1.797 × 10¹⁷) = 8.35 × 10⁻¹¹, which is −8.35 × 10⁻¹¹ × 86,400 s × 10⁶ = −7.21 µs per day.
  - Height effect ≈ GM × (1/R − 1/r) ÷ c². At GPS: R = 6,371 km, r = 26,571 km, so GM/c² = 4.435 × 10⁻³ m, (1/R − 1/r) = 1.1932 × 10⁻⁷ per metre, and the product 5.29 × 10⁻¹⁰, which is +45.72 µs per day.
  - Net = −7.21 + 45.72 = +38.51 µs per day.
  - Balance radius = 1.5 R = 9,557 km, an exact result of these two formulas.

*(The arithmetic above was checked against the module's values: 3.873 km/s, −7.21, +45.72, +38.51.)*

---

## 8. Links

| Where | Idea | Source | Status |
|---|---|---|---|
| **Introduction (before Part 1)** | What an orbit is and why a satellite does not fall | NASA Space Place, "What Is an Orbit?", spaceplace.nasa.gov/orbits/en/ (article last updated 29 September 2023) | Read through a helper's verbatim quotes 2026-11-13 [recheck]. It gives no speeds and says nothing about clocks, so nothing is given away. |
| After the tutor | GPS and relativity in plain words | NASA Space Place, "Is Time Travel Possible?", spaceplace.nasa.gov/time-travel/en/ (article last updated 30 April 2020) | Read through a helper 2026-11-13 [recheck]. It says the satellite clocks run "slightly faster than 1 second per second", so it gives away guess 3: linked only after the tutor. It has **no** microsecond figures and gives the error as "a few miles each day" (miles, not km). |
| After the tutor | Orbits, with real speeds (ISS 7.8 km/s, geostationary 35,786 km at about 3 km/s) | ESA, "Types of orbits" (archive content, 30 March 2020) | Read through a helper 2026-11-13 [recheck]. Its speeds make guess 1's reasoning easy, so linked only after the tutor. Does not name GPS. |
| After the tutor | The original scientific review: the net offset, the balance orbit, the correction | Neil Ashby, "Relativity in the Global Positioning System", Living Reviews in Relativity 6 (2003), 1, doi 10.12942/lrr-2003-1 (revised 2007) | **Read in part** through a helper (the landing page and Sections 1, 4, 5 and 14, on the EMIS mirror); Sections 2, 3 and 6 to 13 not read. A review paper, not a short plain page. Link to the journal's page once the owner has opened it. |
| (open) | A plain page from GPS.gov or NASA that gives the microseconds per day | **None found** | Open (§29 rule 3(c)). The NASA page has no microsecond figure. A web search found only third-party and non-official pages for "38 microseconds"; none is linked or quoted. |
| (open) | The split into about −7 and +46 µs/day | **Not in any source read** | Open. The page's own split (−7.21 and +45.72) is shown as calculated here, with no published comparison. |

---

## 9. Facts and wording that need your say
1. **Guess 1's new wording** ("a bigger slowing", "a smaller slowing", "about the same slowing"): agree?
2. **Table 2 compares only the net and the balance orbit with Ashby (2003),** and not the −7 / +46 split, which no source I read gives. The "0.16 percent" and "0.12 percent" are computed from numbers read through a helper, and Ashby's ground clock is on the spinning Earth while the page's is not. OK to print them with this note, after you have opened the paper once yourself?
3. **The page's old "kilometers within a day" claim is replaced** with a calculation (about 11.5 km from 38.51 µs and the speed of light), Ashby's 30 cm per nanosecond, and NASA's "a few miles each day". These are not the same number and the draft does not reconcile them (NASA's "few miles" is roughly 5 to 10 km). Keep the three side by side?
4. **The NASA page that explains GPS and relativity is held until after the tutor** because it says the clocks run faster. Agree?
5. **The ESA "Types of orbits" page also after the tutor** (its speeds hint at guess 1). Agree?
6. **Tutor point 7** (softened "first calculation"): "the first experiment in this journey that uses real numbers for Earth and the speed of light". Is it right that no earlier experiment, in sidebar order, uses real constants? I have not checked every earlier experiment.
7. **A new Part 1 note on the drawing:** "Not to scale: the orbits are squeezed so that all three fit." Agree?
8. **The balance ring appears only after all three orbits have run** (not from the first frame). Agree?
9. **Synthesis reference fixes** (see the table below; the claim that Experiments 1 to 11 "follow logically from just these two" is **left as is**, as decided).

### The closing synthesis: only the references change (nothing else in it is changed)
| Now | Draft |
|---|---|
| "the last experiment in this two-chapter journey" (introduction) | removed from the introduction (see section 1); the tutor ends with "This is the last experiment in Gravity and Curved Spacetime. Scroll down to 'Putting It All Together' …" |
| "You've now run every experiment in this two-part journey." | "You've now run every experiment in 'Relativity of Time and Motion' and 'Gravity and Curved Spacetime'." |
| "the first part of this journey (Experiments 1–11)" | "'Relativity of Time and Motion' (Experiments 1 to 11)" |
| "'reference frame' idea from Experiment 2" | "…from Experiment 2 of 'Relativity of Time and Motion'" |
| "Experiment 5" (speeds add) | "Experiment 5 of 'Relativity of Time and Motion'" |
| "Time dilation (Experiments 3–4), length contraction (Experiment 6), the relativity of simultaneity (Experiment 7), … twin paradox (Experiment 10) … Experiment 11's Lorentz transformation" | each followed by "of 'Relativity of Time and Motion'" once |
| "Experiment 1's result" (the equivalence principle), "Experiment 3 … 4 … 5 … 6–8 … This experiment (9)" | "Experiment 1 of this group …" etc., "this experiment (Gravity and Curved Spacetime 9)" |
| "throughout Chapter 2 (Experiments 2 and 9)" | "throughout this group (Experiments 2 and 9)" |
| "every one of the nine-plus-eleven experiments" | "every one of the twenty experiments" |

*(I assume each bare reference means the experiment of that number in the group the sentence is about, as the page's own earlier text does. **Not yet checked against the sidebar**: whether Relativity 6 is length contraction and 7 simultaneity, as the synthesis says. The build step will check each reference.)*

## What the sources changed
- Ashby's split is +2.5046 × 10⁻¹⁰ (velocity) and −6.9693 × 10⁻¹⁰ (gravitational, on the rotating geoid), a different split from the page's. So the −7 / +46 figures from the gap report's candidate source are **not** compared; only the net and the balance orbit are.
- The page's old "kilometers within a day" has no source; replaced as in item 3.
- The page's "first calculation in the whole project using real numbers" has no support; softened.

## Physics module additions (Step 3, after approval; none changes approved physics)
`gpsTimeDilationExperiment.ts` gets new functions, each with tests, and no existing function or result changes:
- a **sweep** of the three effects (speed, height, net) in µs/day over altitudes 300 to 36,000 km, with the three presets and the balance altitude;
- the **µs/day conversion** moved from the component into the module, and an **orbit summary** (altitude, speed in km/s and km/h, three effects);
- **guess markers:** direction and tilt for guess 1, the yes/no flag for guess 2, above/on/below zero at 20,200 km for guess 3;
- **tutor marking text** for each guess against the module's values;
- **check-up rows:** the page's net fraction and balance radius against the published 4.4647 × 10⁻¹⁰ and 9,545 km (constants recorded with their source), the percentage differences, and the two direction rows;
- the **distance equivalent** of a clock error (µs × speed of light) and the **worked numbers** of section 7;
- tests for each, the existing 10 tests unchanged.

## Not checked
Not built, not run in a browser, no narrow-width or dark-mode look. Every source was read through a helper that returns short verbatim quotes and summaries, so each [recheck] figure must be compared with the live page. The Ashby review was read in part (landing page, Sections 1, 4, 5, 14). I did not read its Sections 2, 3, 6 to 13 or the PDF, so I cannot say whether it states a km-per-day error or the −7 / +46 split elsewhere. The 0.17 and 0.12 percent figures, the 11.5 km and the worked arithmetic in section 7 are my own calculations from the module's values and the quoted published numbers. The synthesis's cross-references were not checked against the sidebar. The specification was not compared line by line.


## Correction made during the physics step (2026-11-13)
The approved draft printed the page's net fraction as 4.457 × 10⁻¹⁰ and the gap as 0.17 percent. Both came from the rounded 38.51 µs/day. The module's exact value is 4.4576 × 10⁻¹⁰, which prints as **4.458 × 10⁻¹⁰**, and the gap to Ashby's 4.4647 × 10⁻¹⁰ is **0.16 percent**. The draft now says so in Table 2, "What this table tells us" and tutor point 5. No other figure changed (balance radius 9,557 km, 0.12 percent, is unchanged).

## Change made after the owner's review (2026-11-13)
The owner could not follow the "What it means" line for the geostationary ring ("it stays over one spot" did not say what stays, or why). Replaced, with the owner's approval, in the Part 1 drawing caption, the introduction's word, the words-box entry and this draft. "Exactly one day" became "about one day, the same time Earth takes to spin once" (ESA's page gives 23 hours 56 minutes 4 seconds, one turn of Earth against the stars), and the caption now says the drawing does not show Earth spinning.

Part 2's lead was reworded at the owner's request (2026-11-13): "the three numbers" were not named. It now names them (speed effect, height effect, net, in µs/day) and says each pink dot is one number, outlined in the colour of its curve.
