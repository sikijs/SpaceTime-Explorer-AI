# Draft wording: Black Holes 2 (Time Near a Black Hole: Does a Clock Ever Stop?)
Date: 2026-11-16 | Status: APPROVED ("all defaults", 2026-11-17) and built; see "Audit Update (2026-11-17)" in the specification.

Answers given (the owner, 2026-11-16): "all defaults" to the twelve questions at the end of `02-gap-report.md`. So this draft uses a fixed Part 1 run (10-Sun black hole, clock at 1.01 horizon radii, 60 s), white marks for all three guesses, verdicts moved to the tutor, a check-up of the simple formula against the exact one, real-world grounding from read pages, no table for the learner's own run, and the heading "Black Holes 2".

**How the sources were checked.** Two helper agents fetched the pages (their fetch tool returns short model summaries). I then re-read every quotation and number in the Sources table on the raw HTML of the live page with `curl` on 2026-11-16 and found each one. **Not re-checked on a raw page:** S9's "20 times" line is checked but S8's and S7's other figures only where quoted; arXiv 1807.09409 and the 2018 A&A paper were read by a helper only. Unread pages are listed as gaps and are not linked.

## Sources (read 2026-11-16, raw page checked)
| # | Page | Date shown | Used for | Quote checked |
|---|---|---|---|---|
| S1 | NIST, "NIST Pair of Aluminum Atomic Clocks Reveal Einstein's Relativity at a Personal Scale" (nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal) | 23 Sep 2010 | Clocks 33 cm apart tick at different rates | "33 centimeters, or about 1 foot"; "approximately 90 billionths of a second over a 79-year lifetime" |
| S2 | NIST, "JILA Atomic Clocks Measure Einstein's General Relativity at Millimeter Scale" (nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale) | 16 Feb 2022 | Same effect across about a millimetre | "0.0000000000000000001 (10 -19 in scientific notation)"; "After 90 hours of data ... 50 times better" |
| S3 | arXiv 2109.12238, Bothwell et al. (the Nature paper's preprint) | 24 Sep 2021 | Original paper behind S2 | "clocks at different gravitational potentials tick at different rates"; "from 30 centimeters to thousands of kilometers" |
| S4 | NIST, "Putting Einstein to the Test" (nist.gov/node/1879246) | updated 17 Apr 2025 | GPS clocks | "The lower gravity in medium Earth orbit should speed them up by 45 microseconds per day compared to clocks on Earth." |
| S5 | NASA, "What Happens When Something Gets 'Too Close' to a Black Hole?" | 3 May 2023 | A far-away observer's view near the horizon | "time passes slower closer to the black hole than further away"; "it appears to start moving infinitely slower until the object will appear completely frozen" |
| S6 | NASA, "New NASA Black Hole Visualization Takes Viewers Beyond the Brink" | 6 May 2024 | Far-away view; the "frozen star" history | "the image of the camera would slow and then seem to freeze just shy of it. This is why astronomers originally referred to black holes as 'frozen stars.'" |
| S7 | ESO eso1825, "First Successful Test of Einstein's General Relativity Near Supermassive Black Hole" | 26 Jul 2018 | Real redshift measured near Sgr A* | "Light from the star is stretched to longer wavelengths by the very strong gravitational field of the black hole."; "less than 20 billion kilometres"; "four million times that of the Sun" |
| S8 | ESO eso1907 (M87*) | 10 Apr 2019 | M87* mass | "a mass 6.5 billion times that of the Sun" |
| S9 | NASA, "Black Hole Types" | 12 Aug 2026 | Stellar-mass and Sgr A* masses | "Sagittarius A* ... is 4 million times the mass of the Sun" |
| S10 | NASA, "Einstein's Theory of Relativity, Critical For GPS, Seen In Distant Stars" | 22 Oct 2020 | Same slowing seen in a double star | "about 29,000 light years from Earth" |

**Gaps (§29 rule 3(c)):**
- Not read: Science (Chou et al. 2010, HTTP 403); Nature (Bothwell et al., login redirect); the A&A journal page for the S2 redshift paper (HTTP 403; its arXiv version, 1807.09409, was read). The Nature and Science papers are not linked. The arXiv preprint (S3) stands in for Nature; no preprint was found for Science.
- No plain official NASA, ESA or observatory page on gravitational time dilation for a *hovering clock* near a black hole was found. S5 and S6 describe the far-away view of an infalling object and are the closest. They state Prediction 1's answer ("frozen"), so they are linked only after the first Run, in Part 3.
- No 2025-2026 official item on clocks, time or redshift near a black hole was found, so there is no "Recent news" block (see question A).
- No NASA page on GPS and relativity was found; S4 (NIST) is used instead.

## Layout
- **Above Part 1 (no heading):** the introduction with images and drawings, "Real tests so far" (dated), a "Want to know more?" list, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** three guesses, Start over (always visible), Run; Picture 1 (two clocks), Picture 2 (factor against distance) with white marks 1 and 3, panel 2b (the two black holes at 2 radii) with white mark 2, Picture 3 (readings against time).
- **Part 2 (pink), "Now try it yourself":** black-hole and distance controls, Run, and the pictures that follow them.
- **Part 3 (teal), "The results":** the guesses beside the results; Table 1 (check-up); the readings table; the three-black-holes table; the real-surfaces table; "What this table tells us" under each; links held back until now (S5, S6).
- **Part 4 (blue), "The tutor":** observe, compare, conceptual, explanation that marks all three guesses.
- **Colours:** white only for the guess; exact line blue, simple formula orange, horizon red, far-away clock gold, hovering clock blue (unchanged).
- Parts 2, 3 and 4 appear when the first Run has finished and stay.

---

## 1. Introduction (above Part 1; gives no answers, §12)

**Title:** Black Holes 2: Time Near a Black Hole: Does a Clock Ever Stop?

**The question.** "In Gravity and Curved Spacetime you saw that gravity slows clocks: a clock lower down in gravity ticks a little more slowly than one higher up. There the effect was tiny, or exaggerated on purpose. Near a black hole, gravity is as strong as it ever gets. So here is the question: how much does that slow a clock, and could it slow a clock all the way to a stop?"

**Sub-heading: Clocks really do tick at different rates.** "This is not only a prediction. In 2010, NIST scientists put two very precise atomic clocks 33 centimetres apart, about a foot, one higher than the other. The higher clock ticked slightly faster, as Einstein's theory says. Over a lifetime of 79 years, that adds up to about 90 billionths of a second. In 2022, a team at JILA measured the same effect across a cloud of atoms about a millimetre wide, a gap about the width of a pencil tip. And the clocks in GPS satellites, far above the Earth, run faster than clocks on the ground by about 45 millionths of a second per day because of gravity alone. Engineers must correct for this or your phone's position would drift." *(S1, S2, S4.)*
[Own drawing 1: two clocks, one on a mountain, one at sea level, with the labels "a little faster" and "a little slower", "illustration, exaggerated; the real difference is far smaller than a drawing could show".]

**Sub-heading: Why a black hole is the strongest test.** "A black hole is a region of space where gravity is so strong that nothing that gets close enough can leave, not even light. Its edge is the **horizon**. In Black Holes 1 you found its size, the **horizon radius**: about 29.5 km for a black hole of 10 Suns, and about 19 billion km (about 128 times the Earth's distance from the Sun) for M87*, a giant of about 6.5 billion Suns. Close to that edge, gravity is far stronger than anywhere else we can visit, so the slowing of clocks should be far greater than at the Earth's surface." *(S8, Black Holes 1.)*
[Image 1: M87* (EHT), already in the project. Caption: "The first picture of a black hole's shadow (April 2019): M87*, 6.5 billion Suns. A real observation." Image 2: Sgr A* (EHT, 12 May 2022), already in the project. Caption: "Our galaxy's black hole, about 4 million Suns. A real observation." Credits as for Black Holes 1.]

**Sub-heading: Two clocks (new words).** "To compare fairly we use two identical clocks.
- **The far-away clock** is so far from the black hole that its gravity does not affect it. It is our reference.
- **The hovering clock** is held at rest at a chosen distance from the black hole. Imagine it hanging there, not falling in.
We watch both from far away and compare their ticks. This is a **thought experiment**: holding a clock still near a black hole would need engines whose push grows without limit as you get closer, and the experiment does not model them."

**Sub-heading: This is not a falling traveller.** "This experiment compares two clocks that stay at rest. It does not describe what a traveller who falls into a black hole experiences; that is Black Holes 5."

**What happens / Your job.** "First, make three guesses. Then press **Run**: the page shows a black hole of 10 Suns with the hovering clock very close to its edge, and runs both clocks for 60 seconds of far-away time. After that you can choose other black holes and other distances yourself."

**Your guesses and the real pictures.** "Your guesses never change the real pictures or tables. After the run they are drawn on the real graphs in **white**, in a box labelled YOUR GUESS, and shown again beside the results. The black hole and distance you choose in Part 2 do change the drawings in Part 2, and only those."

**What we assume.** *(kept from the approved text)* "A thought experiment; two clocks at rest only; the black hole does not spin and has no electric charge; the formula is given, not derived; the far-away clock is treated as infinitely far; distance is measured from the centre as in Black Holes 1; the masses are rounded; nothing inside the horizon is modelled."

**Some new words:** far-away clock, hovering clock, slowing factor, first-order formula, logarithmic scale (see "Words and formulas").

## 2. "Real tests so far" (above Part 1; dated, from read pages, replaces "Recent news")
Heading: **"Real tests of gravity slowing clocks (as of November 2026)"**.
1. **2010.** NIST: two clocks 33 cm apart ticked at different rates. *(S1)*
2. **26 July 2018.** ESO's GRAVITY team: light from the star S2, passing within 20 billion km of our galaxy's black hole, was stretched to longer wavelengths by its gravity. *(S7; the star's closest approach was in May 2018.)*
3. **16 February 2022.** JILA and NIST: the same effect across about a millimetre. *(S2)*
Closing line: "Every one of these tests agreed with Einstein's theory. None was made near the edge of a black hole's horizon, where the next experiments would have to go." *(Reviewer note: the second sentence is the draft's own summary of the sources and needs your approval. S7 is a redshift near a black hole, but at about 20 billion km, which is hundreds of horizon radii from a 4-million-Sun hole; the module can compute this number, see question B.)*

## 3. "Want to know more?" (above Part 1; each opens in a new tab)
*Start here*
- NIST, "NIST Pair of Aluminum Atomic Clocks Reveal Einstein's Relativity at a Personal Scale" (S1): "Two real clocks a foot apart, ticking at different rates."
- NIST, "Putting Einstein to the Test" (S4): "Why GPS satellites' clocks have to be corrected."
- NASA, "Black Hole Types" (S9): "The masses of stellar, mid-sized and giant black holes."
*The discoveries*
- ESO, "First Successful Test of Einstein's General Relativity Near Supermassive Black Hole" (S7): "How the star S2's light was stretched near our galaxy's black hole."
- NIST, "JILA Atomic Clocks Measure Einstein's General Relativity at Millimeter Scale" (S2): "The same effect across a pencil-tip-wide cloud of atoms."
- ESO, "First Image of a Black Hole" (S8): "M87* and its mass."
- NASA, "Einstein's Theory of Relativity, Critical For GPS, Seen In Distant Stars" (S10): "The same slowing seen in light from a double star."
*Go deeper*
- arXiv 2109.12238, Bothwell et al. (S3): "The millimetre-scale result as first written for scientists."
- arXiv 1807.09409, GRAVITY Collaboration: "The S2 redshift paper as first written for scientists." *(Read by a helper only; not re-checked on the raw page. Not linked until it is.)*
*Held back until after the first Run (they state Prediction 1's answer), shown in Part 3:* S5 and S6.

## 4. "Words and formulas" (collapsed, above Part 1)
- **Far-away clock:** a clock so far from the black hole that gravity does not affect it; our reference.
- **Hovering clock:** a clock held at rest at a chosen distance from the black hole.
- **Horizon, horizon radius:** the one-way edge, and its distance from the centre (r_s); from Black Holes 1.
- **Distance in horizon radii:** distance divided by r_s. "2 horizon radii" means twice as far from the centre as the horizon.
- **Slowing factor:** the hovering clock's rate divided by the far-away clock's rate. 1 means the same rate; 0.5 means half as fast.
- **First-order formula:** the simple weak-gravity formula from Gravity 2 and 9; shown here only to compare with the exact one.
- **Logarithmic scale:** a scale where equal steps multiply the number by the same amount (100, 10, 1), so very different sizes fit in one picture.
- **Astronomical unit (AU):** the Earth-Sun distance, about 150 million km.
- **Formula, shown after the first Run** (it works Prediction 2's answer): slowing factor = √(1 − r_s ÷ r). Worked example with the page's own run: the hovering clock at 1.01 horizon radii. r_s ÷ r = 1 ÷ 1.01 = 0.990; 1 − 0.990 = 0.0099; √0.0099 = 0.0995; in 60 s of far-away time the hovering clock reads 60 × 0.0995 = 5.97 s.

## 5. Part leads
- **Part 1, "Predict, then watch"** (gives no answers): "Here you make three guesses, then watch two clocks run side by side. One is far from a black hole; the other hangs close to it. The real pictures and tables do not change with your guesses."
- **Part 2, "Now try it yourself":** "Now pick a black hole and a distance of your own and run the clocks again. These settings change the drawings below; your guesses do not."
- **Part 3, "The results":** "Here are the numbers behind the pictures, a check of the simple formula against the exact one, and your three guesses beside them."
- **Part 4, "The tutor":** "The tutor will ask what you saw, then go through your three guesses one by one."
- **Locked-guess note, beside the Run button:** "Your prediction is locked while you try other settings. To change it, press Start over."

## 6. Part 1 pictures and their marks (the Run is fixed: 10-Sun black hole, clock at 1.01 radii, 60 s)
**Picture 1, the two clocks.** Far-away clock (gold), hovering clock (blue), the black hole with its red horizon, ruler in horizon radii with the 1.01 position, distances in km and AU on the canvas. No mark.

**Picture 2, the slowing factor against distance (log axis).** Solid blue line: the exact factor. Dashed orange line: the simple formula. Red horizon line. Dot at the run's distance (1.01).
- **White mark 1 (Prediction 1):** a white box "YOUR GUESS: ticks at 1 / 0.5 / 0.1 / 0" joined by a white line to a white dot at that height above x = 1.01. It follows the guess. Drawn with the picture.
- **White marker 3 (Prediction 3):** a white box "YOUR GUESS: the simple formula still works / works far away but worse close in / wrong everywhere" with a white line to the space between the two lines. It is only a marker, because a yes-or-no guess has no size. Drawn when the dashed line is drawn.

**Panel 2b, "The same distance in radii, around two black holes" (own scale, own title).** Two real bars at 2 horizon radii: the 10-Sun hole and M87*, each the factor from the module, with the distance in km under each bar (59 km and 38 billion km). White marker "YOUR GUESS: small one ticks slower / giant one ticks slower / the same", on the bars' common axis. It is only a marker; the caption says so.

**Picture 3, readings against far-away time.** Gold far-away line, blue hovering line, drawn as the run plays. No mark.

**Where the real picture comes from (under Pictures 2, 2b and 3):**
- "**Calculated here:** the exact factor √(1 − r_s ÷ r) is the result of Einstein's general theory for a clock at rest near a black hole that does not spin and has no charge. It has never been measured near a black hole's horizon. The page calculates it."
- "**Calculated here:** the simple formula is the weak-gravity formula from Gravity 2 and 9."
- "**Measured:** the masses of M87* (6.5 billion Suns, EHT 2019) and the 10-Sun black hole (a typical stellar-mass size, NASA); both rounded as in Black Holes 1."
- "**Imagined for the question:** the hovering clock. It is a thought experiment."

## 7. "How to read this diagram" captions (Part 1; each "what to look for" item has Look at / What it means / Why it matters; an item appears only after its feature is drawn; none gives the answer to a guess)
**Picture 1.** *(kept from the approved text; items rewritten.)*
- Look at: the two clock faces. What it means: the gold clock is the far-away one; the blue clock is the hovering one at 1.01 horizon radii. When the run ends the far-away clock reads 60 s and the blue one reads 5.97 s. Why it matters: this is the slowing, read directly.
- Look at: the labels in km and AU. What it means: for the 10-Sun hole the clock is about 29.8 km from the centre, only 0.3 km outside the horizon. Why it matters: the same ratio on a bigger black hole would be a much larger distance in km (the Part 2 controls let you try).

**Picture 2 (log scale).**
- Look at: the dot on the solid blue line at 1.01. What it means: its height, 0.0995, is the slowing factor (about 1 s for every 10 s). Why it matters: this is the real value your first guess is compared with.
- Look at: the dashed orange line, then the gap between the two lines. What it means: at 1.01 the dashed line says 0.5050 and the solid line says 0.0995. Why it matters: this is how far the simple formula is from the exact one at this distance; the other distances are for you to read.

**Panel 2b.**
- Look at: the two bars at 2 radii. What it means: each bar's height is the slowing factor at 2 horizon radii; the numbers are printed above. Why it matters: it is the real comparison for your second guess.

**Picture 3.**
- Look at: the blue line against the gold one. What it means: each second of the far-away clock adds 0.0995 s to the blue clock. Why it matters: the gap grows steadily, so the slowing is a constant rate, not a one-off.

*(Words-only definitions of "white", "marker" and the three sources lines sit in the caption's top section. Wording of each item is the owner's to approve; the third part of each item gives significance, not mechanism, which is left to the tutor.)*

## 8. Part 3: check-up and notes
**Table 1, check-up: "The simple formula against the exact one."** Columns: Distance | Exact factor | Simple formula | Reading. Rows (all values from the module):
| Distance | Exact | Simple | Reading |
|---|---|---|---|
| 10 horizon radii | 0.9487 | 0.9500 | close (about 0.14% too high) |
| 2 | 0.7071 | 0.7500 | not close (about 6% too high) |
| 1.01 | 0.0995 | 0.5050 | not close (about 5 times too high) |
| GPS orbit, Earth | the same effect as Gravity 9's figure | the same | the same (a test already checks it within 1%) |
"Close" and "not close" are the page's words, not an official cut-off; the rows say how far off the number is. Only the GPS row has a reference outside this page.

**What this table tells us** (each: what it is, what it means with numbers, why it matters)
- *The first-order formula.* "It is the simple formula from Gravity 2 and 9. At 10 horizon radii it is off by about 0.14%, so it served for Earth and GPS, where the clocks are hundreds of millions of horizon radii out."
- *The exact formula.* "At 1.01 radii the exact answer is 0.0995 and the simple formula says 0.5050. That is about 5 times too high, so the simple formula cannot be used near a horizon."
- *How sure we are.* "The exact formula has been tested far from black holes (S1, S2, S7) and not at a horizon."

**Table 2, the readings** (as today: far-away reading, hovering reading, factor, simple formula's value) with "What this table tells us".
**Table 3, "The same distance around all three black holes"** with the note "only the ratio matters; the distances in km differ".
**Table 4, "Real surfaces"** (Earth 0.7 billionths of a second per second, the Sun 2.1 millionths, a neutron star 19%), note tying back to GPS (S4).
**The guesses beside the results:** each guess, the question, the row it relates to and a small tag, no "right" or "wrong".
**"Check it against NASA" (links held back):** S5, S6 with one plain line each ("How a far-away observer sees something near the horizon").
**The swimmer comparison** (a daily-life image for the push needed to hover; stays as in the specification, labelled as an analogy for the push, not for the slowing).

## 9. Tutor changes (Part 4)
- **Observe:** "Look at the two clocks in Picture 1 and at your white marks on Picture 2 and panel 2b. Which clock is behind? Now go to Part 2: try a different distance, then a different black hole at the same distance in horizon radii. What changed, and what stayed the same?" *(To be shown after the Part 2 controls appear.)*
- **Compare:** restates each guess, pointing to its mark by name.
- **Conceptual:** unchanged ("what do the two situations have in common?").
- **Explanation:** unchanged content (the factor and the worked 2-radii example; the zero at the horizon; why; simple against exact; real surfaces; not a falling traveller; limits), plus an explicit marking of each of the three guesses ("Your first guess (about one tenth) matches the model" / "differs from the model, which gave about one tenth"). Every number comes from the module; the percentages the tutor and Results work out locally move into the module.

## 10. What the module gains (physics, with tests)
`guessHeightForJustOutside(choice)` (1 / 0.5 / 0.1 / 0), `markerForMass` and `markerForApproximation` (labels only), `twoHolesAtTwoRadii()` (both factors, and distances in km), `percentTooHigh(distance)`, `surfaceComparison(id)`, and the check-up rows. Each with tests against the specification's table; none reads prediction state.

---

## Questions for the owner
A. **No recent news.** No official 2025-2026 item on clocks or redshift near black holes was found. Default: use the dated "Real tests so far" block (2010, 2018, 2022) in place of "Recent news", and say in the status entry that the gap is open.
B. **The S2 line.** S7 says S2 passed within 20 billion km; I have not computed how many horizon radii that is. Default: have the module compute it (about 20 billion ÷ 12.7 million km is roughly 1,600 radii) and say so only if you approve printing it. The draft prints "hundreds of horizon radii" nowhere until you decide.
C. **Part 1 run at 1.01.** The Run shows Prediction 1's own distance. Default: yes.
D. **Held-back links.** S5 and S6 appear only in Part 3. Default: yes.
E. **Images.** Reuse M87* and Sgr A* from the project; one own drawing of two clocks at different heights; no new official image. Default: yes.
F. **The words "close" and "not close" in Table 1.** They are the page's own words (the rule forbids invented cut-offs); the numbers sit beside them. Default: use "the same", "a little more" and "many times more" instead of "close" and "not close".
G. **Heading and cross-references:** "Black Holes 2". Default: yes.

## Not checked
Not built and not viewed in a browser. Nothing from this draft is in the app. The Science and Nature papers and the A&A journal page were unreadable. The numbers in Table 1, the 5.97 s and the 59 km / 38 billion km figures come from the existing module and the specification's table, not from this session's tests, which were not re-run. The "roughly 1,600 radii" figure in question B is mental arithmetic and has not been computed by the module.
