# Draft wording: Black Holes 8 (Spinning Black Holes: Does Spin Change Where Orbits Are Safe?)
Date: 2026-11-18 | Status: **DRAFT for the owner's line-by-line review (§28.1). Nothing is built; no code, specification, status file or commit has been changed.** Written after the re-read in `08-gap-report.md`. The owner's instruction on 2026-11-18: keep the content of the existing introduction (liked), add detail, elaborate and improve it as I judge best, add images from NASA, Hubble and similar sources (my choice), and add the latest resource links.

Rules this draft follows: four Parts; Parts 2 to 4 appear after the first Run; links and a "Words and formulas" box above Part 1; "Start over", never "Change prediction"; guesses drawn in white on the real pictures, as markers only; no answer revealed before the guesses (§12; "frame dragging" stays out of everything shown before the first Run, as the specification's criterion 7 requires); learner numbers "Black Holes 3" and so on.

## Sources (fetched 2026-11-18 with `curl`, tags stripped, each quoted phrase located on the raw text by me unless marked)
| # | Page | Date shown | Used for | Quote checked by me |
|---|---|---|---|---|
| S1 | NASA, "Black Hole Anatomy", `science.nasa.gov/universe/black-holes/anatomy/` | 12 Aug 2026 | disk and jets, plain | "rapidly spinning disk"; "pair of jets" (found) |
| S2 | NASA Goddard, "NASA Simulation Suggests Black Holes May Make Ideal Dark Matter Labs", `nasa.gov/universe/nasa-simulation-suggests-black-holes-may-make-ideal-dark-matter-labs/` | 23 Jun 2015 | the ergosphere, "drags space-time along with it", the Penrose process, "the faster the black hole spins, the larger its ergosphere" | all four phrases found |
| S3 | NASA/Stanford, Gravity Probe B mission, `einstein.stanford.edu/MISSION/mission1.html` | undated | the molasses picture of frame dragging | "much like a spinning ball in bowl of molasses" (found) |
| S4 | NuSTAR at Caltech, "NASA's NuSTAR Helps Solve Riddle of Black Hole Spin", `nustar.caltech.edu/news/nustar130227` (mirror of JPL, 27 Feb 2013; the JPL page itself blocks my fetch) | 27 Feb 2013 | how spin is measured from the X-ray light; NGC 1365 "spinning almost as fast as Einstein's theory of gravity will allow" | both phrases found on the mirror |
| S5 | MPIfR / EHT, "New EHT Images Reveal Unexpected Polarization Flips at M87*", `mpifr-bonn.mpg.de/pressreleases/2025/6` | 16 Sep 2025 | the latest EHT result on M87*; no spin value on this page | "polarization pattern changes significantly" (found) |
| S6 | Reynolds 2021, "Observational Constraints on Black Hole Spin", arXiv 2011.08948 (abstract page) | 17 Nov 2020 | spin as an energy source for jets | "relativistic jets" (found) |
| S7 | Risaliti et al. 2013, Nature 494, 449, arXiv 1302.7002 (abstract page) | 27 Feb 2013 | NGC 1365: reflection from "within 2.5 gravitational radii" | found; the abstract page gives no spin value, so none is quoted |
| S8 | Zhao et al. 2021, "Re-estimating the Spin Parameter of the Black Hole in Cygnus X-1", arXiv 2102.09093 | 18 Feb 2021 | a measured spin: a* > 0.9985 (3σ), under the paper's assumptions | "0.9985" found |
| S9 | LIGO-Virgo-KAGRA, GW231123, arXiv 2507.08219 (html v1) | 10 Jul 2025 (v3 10 Nov 2025) | spins 0.90 and 0.80 (90% ranges) for the two merging black holes, "Both black holes exhibit high spins" | χ₁ = 0.90, "high spins" found; 0.80 found |
| S10 | ESA/Hubble opo0020a, "A cosmic searchlight" (M87's jet), `esahubble.org/images/opo0020a/` | 6 Jul 2000 | image of a black-hole-powered jet; credit line "The Hubble Heritage Team (STScI/AURA) and NASA/ESA"; ESA/Hubble's rule: crediting with the full line is mandatory | credit line found on the page |
| S11 | NASA/JPL-Caltech PIA22085, "Black Hole With Jet (Artist's Concept)", `science.nasa.gov/photojournal/black-hole-with-jet-artists-concept/` | 2 Nov 2017 | image; "Credits: NASA/JPL-Caltech" | found; I viewed the file (5120 x 2880 JPEG) |
| S12 | ESO eso1907, first image of M87*'s shadow (already stored in `public/images/black-holes/m87-eht-eso1907a.jpg`, used by earlier pages) | 10 Apr 2019 | EHT image, "EHT Collaboration (CC BY 4.0), via ESO", as on Black Holes 3 and 4 | as built earlier; to be re-read at build time |
| S13 | Bardeen, Press & Teukolsky 1972, ApJ 178, 347, `doi.org/10.1086/151796`; Kerr 1963, Phys. Rev. Lett. 11, 237, `doi.org/10.1103/PhysRevLett.11.237` | 1972; 1963 | where the formulas come from | **Not read** (ADS returned 405). Offered as citations to the origin of the formulas only, and the page says they were not read |

**Candidates not used, and why.** LIGO's own GW231123 summary page (`ligo.org/science-summaries/GW231123`) is blocked to my fetch (a security page came back), so I use the paper (S9) instead; the page may be added once read. NASA/JPL's own NuSTAR page (S4) and the JPL image page for PIA16697 (a two-model "spin" concept art, which I viewed) are also blocked to me; PIA16697's credit ("NASA/JPL-Caltech") comes only from the research agent, so it is **not** proposed until the credit is confirmed. The HEASARC "Frame Dragging Around a Rotating Black Hole" page is not offered because that host was removed from the project in 2025. The NASA Goddard SVS visualization 11894 (the ergosphere in teal) was named by the agent and not opened by me; it is a candidate for an image only after its file is checked.

**Gaps recorded under §29 rule 3(c) (searched 2026-11-18).** No plain official page found for: (a) the Blandford–Znajek idea of jets powered by spin (S2 covers the Penrose process only; S6 says it in the abstract); (b) how much energy a falling piece of matter gives up near a black hole ("accretion efficiency"); (c) the ISCO formulas themselves. The wording below says these things in plain words and links nothing for them.

## 1. Heading and layout
Heading: **"Black Holes 8: Spinning Black Holes: Does Spin Change Where Orbits Are Safe?"** (was "Experiment 8 — ..."). Above Part 1, with no Part heading: the introduction (with pictures), the "Want to know more?" list and the collapsed "Words and formulas" box. Then Part 1 (amber), Part 2 (pink), Part 3 (teal), Part 4 (blue). Parts 2 to 4 appear when the first Run ends and stay. The introduction moves to its own file, `SpinningBlackHoleIntro.tsx`, as at Black Holes 3 to 7.

## 2. Introduction
*(Everything the owner liked is kept in the same order and almost the same words; additions are marked **NEW**. None of the four answers is given. "Frame dragging" is not named.)*

**The question.** *(kept)* "In Black Holes 3 you found that a black hole has a last safe circular orbit: the closest circle a small probe can follow without a tiny nudge sending it spiraling in. For a black hole that does not spin, it was at 3 horizon radii from the center. But real black holes usually spin. Does the spin change where the last safe orbit is?"

**Why even ask this.** *(kept)* the parking-a-spacecraft paragraph, unchanged.

**NEW: Figure 1, a spinning black hole as an artist imagines it.** NASA/JPL-Caltech artist's concept PIA22085: a black hole with a glowing disk of gas circling it and a jet leaving along its pole. Caption: "An artist's idea of a black hole with a flat disk of hot gas orbiting around it and a jet of hot gas shooting out. Nobody has photographed anything this close; this is a picture made to help you imagine it. The gas in the disk circles the black hole, and the black hole itself can turn too." Credit: "Image: NASA/JPL-Caltech." Alt text: "An artist's picture of a black hole at the left with a bright disk of gas circling it and a thin purple jet streaming away toward the upper right, against a field of stars."

**What a spinning black hole is. Four short ideas.** *(kept: Where the spin comes from; You cannot see it turn; The spin number; Only the spin changes.)* Additions:
- **NEW, in "Where the spin comes from",** a drawing, **Figure 2 (made for this page): "The skater."** Two small figures side by side seen from above: arms out (a wide circle of slowly turning arrows) and arms pulled in (a small circle of fast arrows). Caption: "The same skater turns faster with the arms pulled in. A star's core does the same when it shrinks into a black hole." *(The existing skater sentences stay; the drawing only adds a picture.)*
- **NEW sentence in "You cannot see it turn":** "What astronomers can see is the light and the gas around it. Gas that circles a black hole forms a disk like the one in Figure 1, and the way it glows tells them about the spin. You will meet real examples after your first run."
- **"The spin number" rewritten for clarity (owner asked 2026-11-18; approved the same day):** "We describe how much a black hole spins with one number, from 0 up to just under 1. Think of a dial with the top mark labelled 1. For a black hole of a given mass, Einstein's theory sets a limit on how much spin it can have, and that limit is the top mark of the dial. The spin number says how far up the dial the black hole is: **0** is not spinning at all (the black holes of Black Holes 1 to 7 did not spin); **0.5** is halfway up the dial, half of the most spin it could have; **0.9** is nine-tenths of the way up, a fast spinner; **0.99** is ninety-nine hundredths of the way up, very close to the limit, and the largest spin you can choose on this page; **1** is the top mark, the limit itself: no black hole quite reaches it, and the equations on this page work only for spins below 1, which is why you cannot choose it. The dial is only a comparison: the spin number is not a speed in kilometers per hour. The limit is different for black holes of different masses, so the spin number is a fraction of each black hole's own limit. That is what lets us compare black holes of any mass. In books and papers astronomers write the spin as a* (said 'a-star'). On this page we just call it 'the spin'." The words-box entry "Spin" uses the same dial wording. No sentence on why the limit exists was added, because the specification gives none.

**NEW: Figure 3 (made for this page): "Two ways round."** A top-down drawing with no rings and no distances: a small black disk with a curved arrow around it (the way it turns), a green arrow circling the same way labelled "a probe circling with the spin", and a rose arrow circling the opposite way labelled "a probe circling against the spin". Caption: "Seen from above, a probe can go round the same way the black hole turns (green) or the opposite way (rose). In this page, green always means 'with the spin' and rose always means 'against the spin'." Colours match the map's green and rose.

**What happens.** *(kept, with two changes)* Step 2 now reads: "In Part 1 you press Run. A black hole of 10 Suns is 'spun up' from not spinning to a spin of 0.9 over 10 seconds. This is only how the experiment is shown: the results are the same however fast or slow it plays." A new step: "In Part 2 you choose the black hole and the spin and run your own." Steps 3 to 6 (the map, the graph, the energy picture, no inside-the-horizon) kept.

**Some words we will use.** *(kept in the same order, split into a short list, with these changes)* the ball-on-a-hill sentence now reads: "Think of a ball at the top of a hill: when it rolls down, it gives up some of its stored energy on the way. In the third picture, a probe slowly spiraling down gives up some of its rest-mass energy, and we show the share it gives up as a percentage. Where that energy goes is not part of this experiment." *(removes "turns into speed and heat", which the specification says is not modeled)*. The full list also appears in the "Words and formulas" box.

**What this builds on.** *(kept, with "Black Holes 3" and "Black Holes 1")*.

**NEW: Introduction note on the predictions (rule A7).** "In Part 1 you make four guesses before you run anything. Your guesses never change the real pictures or tables. After you press Run they are drawn on the pictures in white, in a box labelled YOUR GUESS, and shown again beside the results. In Part 2, the black hole and the spin you choose do change the drawings and the tables, and your guesses do not."

**Your job.** *(kept, adjusted to the Parts)* "First, make four predictions. Then press Run. After that, choose other black holes and spins in Part 2, and compare."

**What to look for.** *(kept)* "Where the two colored rings are compared with the dashed ring, what happens to the black disk, and how the two energy bars compare with the dashed line."

**What we assume.** *(kept in full, one change)* the line "The energy a probe gives up..." is kept; the sentence "The last safe orbit means the same as in Black Holes 3" is kept.

**NEW: "As of November 2026" line (§29 rule 1).** "This page uses the standard equations for a spinning black hole with no electric charge. Real black holes are measured and their spins are published; some of the newest results are listed under 'Want to know more?' and discussed after your first run."

## 3. Want to know more? (links open in a new tab; each read before it goes in)
**Plain pages**
1. NASA: **Black Hole Anatomy** (S1, 12 Aug 2026): "NASA's guide to the parts of a black hole: the disk of gas and the jets." 
2. NASA Goddard: **How a spinning black hole drags space around with it** (S2, 2015; title: "NASA Simulation Suggests Black Holes May Make Ideal Dark Matter Labs"): "A plain account of the region around a spinning black hole where everything is forced to go around the same way, and how energy can be taken from it." *(shown after the first Run only; see Question 5)*
3. Gravity Probe B (NASA and Stanford): **Frame dragging** (S3): "The honey-and-molasses picture of space being dragged around by something that turns." *(shown after the first Run only)*
4. NuSTAR (NASA mission, hosted by Caltech): **How a black hole's spin is measured** (S4, 2013): "How astronomers read a black hole's spin from the X-ray light of its disk."
5. Event Horizon Telescope (via MPIfR): **New EHT images of M87\*, September 2025** (S5): "The newest results of the telescope that pictured a black hole's shadow."
6. ESO: **The first picture of a black hole's shadow** (S12): "The 2019 picture of the black hole in the galaxy M87." *(to be re-read at build time)*
7. ESA/Hubble: **A cosmic searchlight** (S10): "Hubble's picture of the jet that M87's black hole shoots out."

**Papers and original sources**
8. Reynolds (2021), **Observational Constraints on Black Hole Spin**, Annual Review of Astronomy and Astrophysics (S6): "A review by an astronomer of how spins are measured, and why spin matters."
9. Zhao et al. (2021), **Re-estimating the spin of Cygnus X-1** (S8): "A measurement of one of the fastest spins found in our galaxy."
10. Risaliti et al. (2013), **A rapidly spinning supermassive black hole at the centre of NGC 1365**, Nature (S7).
11. LIGO–Virgo–KAGRA (2025), **GW231123: a merger of two fast-spinning black holes** (S9): "The paper behind the heaviest merger seen so far; both black holes spin fast."
12. Bardeen, Press & Teukolsky (1972), ApJ 178, 347, and Kerr (1963), Phys. Rev. Lett. 11, 237 (S13): "Where the equations on this page come from." *(not read by me, so no title is given; offered as citations only, labelled as such. An earlier version of this draft gave a title for the 1972 paper that I had not read; it was removed on 2026-11-18.)*

Every link is fetched and read at build time before it ships (§29); items 2, 3 and 12 follow Question 5.

## 4. Words and formulas (collapsed box)
**Short plain meanings (all appear in the box; those that would give away an answer wait until after the first Run, see Question 5):** *spin* (a number from 0 to just under 1: how much of the most spin a black hole of that mass can have); *with the spin / against the spin*; *horizon* (the one-way boundary); *horizon radius*; *reference radius* (the horizon radius the same black hole would have with no spin; 29.5 km for the 10-Sun black hole; AU explained); *last safe orbit* (the closest circle a probe can keep without a nudge sending it inward; astronomers call it the **innermost stable circular orbit**, or **ISCO**; NEW name); *rest-mass energy*; *equator* (the flat sheet halfway between the poles); *probe*; **after the first Run:** *frame dragging*, *ergosphere*, *prograde and retrograde* (the astronomers' words for with and against), *accretion disk*, *jet*.

**Formulas, each with a worked example from the page's own numbers (§15).** *(the module's, unchanged)*: horizon r_h = M(1 + √(1 − a²)); at a = 0.9, r_h = M(1 + 0.4359) = 1.436 M, which is 0.718 reference radii (one reference radius = 2M). Last safe orbit: the given three-line formula, with the worked values at a = 0.9 (2.321 M with the spin, 8.717 M against; 1.160 and 4.359 reference radii). Energy of a circular orbit, with the worked a = 0.9 steps the Results already show. **NEW second route:** at the last safe orbit, the share given up is also 1 − √(1 − 2/(3r)) (r in M); at a = 0 this is 1 − √(1 − 1/9) = 1 − 0.9428 = 5.7%. This is used in the check-up (section 7). It is given, not derived.

## 5. Part 1: Predict, then watch (amber)
**Lead.** "Here you make four guesses, then watch a black hole of 10 Suns spin up from 0 to 0.9. Press Run and watch three pictures fill in: a map seen from above, a graph, and an energy picture." *(no answer given)*

**Make your guesses.** *(the four questions and their choices kept exactly as approved 2026-10-12, plus the lock sentence "Your prediction is locked while you try other settings. To change it, press Start over.")* **Notes under the questions (none reveals an answer):** "Your guess is drawn on the map and the graph in white once the ring or line is drawn." (1, 2, 3); "Your guess is drawn on the energy picture in white." (4). **Run and Start over:** Run disabled until all four are chosen; **Start over always visible**, greyed until there is a guess or a run, and while a run plays.

**Picture 1: the map** *(as built, with the horizon's edge and ring recoloured violet and the guess marks added)*. **Guess marks (new, markers only):** guess 1 (with the spin): a white YOUR GUESS box joined by a line to a white ring segment on the green ring's direction: *closer* a mark inside the dashed grey ring, *same* a mark on it, *farther* a mark outside it. Guess 2 the same for the rose ring. Guess 3 (the horizon): a white mark inside, on or outside the dotted no-spin ring ("smaller", "same", "bigger"). Each is placed at a fixed spot for its answer; **the caption says it is a marker only: its place shows which kind of answer you gave, not a number.** Drawn only once the rings have started to move (A4). **Where the real picture comes from.** *Calculated here:* every ring, from the standard equations for a spinning black hole (given, not derived; the origin papers were not read for this page). *Measured:* nothing; no probe has circled a real black hole. *Imagined for the question:* the probe and the spin-up from 0 to 0.9; a real black hole's spin does not change during a run. **Caption** keeps its four numbered parts and bullets *(black disk, dotted ring, dashed ring, green and rose rings, arrows, labels, "In this run")*, with the outcome sentences removed from the bullets ("watch which one moves in and which moves out" stays) and the new bullets "The white YOUR GUESS boxes (markers only)" and "What appears when: the rings start together on the dashed ring and separate as the spin rises". **A worked moment:** "At the end of the run, the spin is 0.9: the green ring is at 1.16 reference radii, the rose ring at 4.36, the dashed ring still at 3, and the horizon at 0.72. For the 10-Sun black hole, one reference radius is 29.5 km, so the green ring is about 34 km from the center and the rose ring about 129 km." **What to look for** *(three parts each)*: **Look at** the green ring against the dashed ring. **What it means:** compare their distances: 1.16 against 3. **Why it matters:** it is the answer to the page's question for a probe circling with the spin. **Look at** the rose ring against the dashed ring. **What it means:** 4.36 against 3. **Why it matters:** the direction of circling gives a different answer for the same black hole. **Look at** the black disk against the dotted ring. **What it means:** the disk is 0.72 across (radius) against the ring's 1. **Why it matters:** the black hole's mass did not change, only its spin.

**Picture 2: the graph** *(as built; "now" dots cyan; horizon line violet; guess marks)*. **Guess marks:** guesses 1, 2 and 3 at the right-hand end of the green, rose and violet lines (a white YOUR GUESS box and line to a marker above, level with or below the dashed line for 1 and 2, and below, level with or above the line at 1 for 3). **Where the real picture comes from:** *Calculated here:* the lines. *Measured:* nothing. *Imagined for the question:* the spin-up. **Worked moment:** "At a spin of 0.5 the green line is at 2.12, the rose line at 3.78 and the horizon at 0.93. At 0.9 they are 1.16, 4.36 and 0.72." **What to look for:** **Look at** where the lines begin on the left. **What it means:** all three start at 3, 3 and 1, Black Holes 3's and 1's values. **Why it matters:** with no spin the page agrees with the earlier experiments. **Look at** how far apart the green and rose lines are at the right. **What it means:** 3.20 reference radii at 0.9. **Why it matters:** it is the size of the difference the direction makes.

**Picture 3: the energy picture** *(as built; guess 4's marker; "now" cyan)*. **Guess mark:** guess 4: a white YOUR GUESS box and line to a thick white outline round the taller-guessed bar ("with" or "against"), or round both ("they give up the same"). **Where the real picture comes from:** *Calculated here:* the bars and curves from the given orbit-energy formula, for a probe that descends gradually. *Measured:* nothing. *Imagined for the question:* the probe. **Worked moment:** "At 0.9 the probe circling with the spin gives up 15.6% of its rest-mass energy, the one circling against it 3.9%, and with no spin it is 5.7%." **What to look for:** **Look at** the two bars against the dashed line. **What it means:** 15.6% and 3.9% against 5.7%. **Why it matters:** this is how much energy a spinning black hole's surroundings could in principle give up. **Look at** the two curves on the right. **What it means:** one climbs steeply and one flattens. **Why it matters:** the effect grows as the spin approaches 1.

## 6. Part 2: Now try it yourself (pink)
**Lead.** "Now you choose the black hole and the spin, run as often as you like, and compare. The guesses you made stay as they were. They do not change any picture or table; these settings do." Controls *(kept)*: the three black holes; spins 0, 0.5, 0.9, 0.99; "Run your choice". The three pictures again for the learner's settings, with no white marks. Until a Part 2 run: "Not run yet. Choose a black hole and a spin, then press Run your choice."

## 7. Part 3: The results (teal)
**Lead.** "These tables come from the same equations as the pictures. Your guesses never change them. The check-up comes first."

**Check-up table** *(expected beside found; only where a reference exists; all computed by the module, see section 9)*: 
| Check | What we expect | What we found | Reading |
|---|---|---|---|
| Last safe orbit, spin 0 | 3 reference radii (Black Holes 3) | 3.00 | the same |
| Horizon, spin 0 | 1 reference radius (Black Holes 1) | 1.00 | the same |
| Energy given up, spin 0 | 1 − √(8/9) = 5.7% (the second route) | 5.7% | the same |
| Energy given up at the run's spin, with the spin | the second route, 1 − √(1 − 2/(3r)) | module's value | the same |
| Last safe orbit stays outside the horizon | the horizon's radius | e.g. 1.16 against 0.72 | outside |
**A published value?** None of these rows is a measured value; no source I read gives the last safe orbit or the energy share (§29 3(c) gap above). The table says so in one line.
**What this table tells us.** *What it is / what it means with the numbers / why it matters* for each row, e.g. "With no spin, the page gives back 3 and 1, the values you found in Black Holes 3 and 1. Why it matters: it shows the spinning-black-hole equations agree with the ones you already trust when the spin is 0."

**Table 1: this run** *(kept: horizon, the two last safe orbits, the no-spin reference, the energy share)* with "In kilometers" added. A small white tag on the row where a guess's number appears: "Your guess 1" and so on, showing the guess only, never "right" or "off". **What this table tells us** note.
**Table 2: how the spins compare** *(kept: 0, 0.5, 0.9, 0.99)* with a note. **The two worked calculations** *(kept)*. **The ball-on-a-hill comparison** *(kept, reworded as above)*. **Your predictions beside the results** *(guess only, with the row each number appears in)*. **What this model can and cannot tell you** *(kept)*.

**NEW: Real spinning black holes (after the first Run; outside the model, labelled so).** Sources S4, S6 to S9 only. **Figure 4:** Hubble's picture of M87's jet (S10; credit "The Hubble Heritage Team (STScI/AURA) and NASA/ESA"); the EHT image of M87* (S12) beside it. Caption: "M87's black hole is above six billion Suns (S5). It shoots a jet that Hubble sees, and the EHT pictured its shadow. The page gives no measured spin for M87*." Then three measured examples, each with its source and its "how sure" line: Cygnus X-1: "one analysis, with stated assumptions, finds a spin above 0.9985" (S8); NGC 1365: "its X-ray light comes from within 2.5 gravitational radii, which fits a black hole 'spinning almost as fast as Einstein's theory of gravity will allow'" (S4, S7); GW231123: "two black holes about 137 and 103 Suns, spins about 0.90 and 0.80 (90% ranges)" (S9). Closing line: "These are published measurements, not outputs of this page; the experiment's own numbers are calculated here."

## 8. Part 4: The tutor (blue)
Observe: "Look at the map and the graph. Find the white YOUR GUESS marks. What happens to the green ring and the rose ring as the black hole spins up? Which way does each move?" Compare: "Find your four white marks on the map, the graph and the energy picture. Which ones sit where the real ring, line or bar ended up? Tell me what you notice." Conceptual question *(kept)*. Explanation *(kept, 8 points)*, now marking each guess ("You guessed 'closer': the green ring ended at 1.16, closer in than the dashed 3"), with the verdicts moved here from the Results. **Frame dragging, the honey comparison and the ergosphere appear here first** (S2, S3), with the NASA ergosphere sentence quoted as NASA's. Honest limits *(kept)*.

## 9. What the module gains (physics, with tests; existing exports and values unchanged)
- `edgeAnswer(spin, direction)` returning 'closer' | 'same' | 'farther'; `horizonAnswer(spin)`; `energyAnswer(spin)` (verdicts moved out of the component).
- Fixed marker positions for the answers (reference radii used only for drawing).
- `energyReleasedSecondRoute(spin, direction)` = 1 − √(1 − 2/(3r)); its tests compare it with `energyReleasedFraction` over spins 0 to 0.99.
- `checkUp(spin, direction?)` returning each check-up row's expected, found and reading.
- `kmFor(radii, presetId)` where the page multiplies radii by the reference radius.
- Tests: horizon at 0 equals 1; last safe orbit at 0 equals 3; energy at 0 equals 1 − √(8/9); the last safe orbit stays outside the horizon at every spin; verdicts for each spin.

## Numbers used (computed with the module's formulas on 2026-11-18, reference radii)
| Spin | Horizon | Last safe, with | Last safe, against | Energy given up, with / against |
|---|---|---|---|---|
| 0 | 1.000 | 3.000 | 3.000 | 5.7% / 5.7% |
| 0.5 | 0.933 | 2.117 | 3.777 | 8.2% / 4.5% |
| 0.9 | 0.718 | 1.160 | 4.359 | 15.6% / 3.9% |
| 0.99 | 0.571 | 0.727 | 4.486 | 26.4% / 3.8% |
Independent recomputation by the research agent agrees to the digits shown (for example 1.454 M and 8.972 M at 0.99). 10-Sun black hole: one reference radius = 29.5 km.

## Choices I made beyond the defaults (for the owner)
1. Part 1 is one fixed run (the 10-Sun black hole, spin 0.9), as at Black Holes 7; Part 2 has the choices.
2. Three of the four images are drawings made for the page (Figures 2 and 3) and the NASA artist's concept (Figure 1); the real-world images (Hubble jet, EHT shadow) come only after the first Run.
3. The introduction names ISCO as the astronomers' name for the last safe orbit.
4. The horizon's white becomes violet; "now" dots cyan.
5. The "Real spinning black holes" block uses only published numbers I read, each with its source.

## Questions for the owner (default first)
1. **Part 1's fixed run.** Default: the 10-Sun black hole at spin 0.9. Alternative: spin 0.99.
2. **Verdicts out of the Results:** the four "Checking your Nth prediction" paragraphs move to the tutor; Results only tag rows. Default: yes.
3. **How the guesses are drawn:** white markers, with a fixed spot for each answer, never a number, as in section 5. Default: yes.
4. **Colours:** horizon to violet, "now" dots to cyan. Default: yes.
5. **Frame dragging and the ergosphere:** keep them out of everything before the first Run (the specification's criterion 7), including the links 2 and 3 and the matching words-box entries, which appear after the first Run. Default: yes.
6. **Images.** Figure 1 (NASA/JPL-Caltech PIA22085) in the introduction; Figures 2 and 3 as drawings made for the page; Hubble's M87 jet and the EHT picture after the first Run. Default: yes. Alternative: also PIA16697 (NuSTAR spin concept) once its credit is confirmed; I could not open its JPL page.
7. **Real spinning black holes block** after the first Run, with Cygnus X-1, NGC 1365 and GW231123 numbers from the pages I read. Default: yes. Alternative: drop the numbers and keep the images.
8. **Links.** The twelve above, with items 2, 3 and 12 as described. Default: yes. LIGO's own GW231123 page is added only if it can be read.
9. **A check-up** table as in section 7 (internal checks only, since no published value was read). Default: yes.
10. **The ball-on-a-hill comparison** reworded to remove "turns into speed and heat". Default: yes.
11. **"ISCO" named in the introduction and words box.** Default: yes.
12. **"What you learned" box after Start over** (open since Black Holes 2). Default: leave as the app's behaviour.
13. **Black Holes 9 (how a black hole forms)** is not previewed. Default: yes.

## Not checked
No page was viewed in a browser (nothing is built). I did not read the JPL, LIGO, ADS, Kerr or BPT pages (blocked or not fetched); S13 is a citation only. SVS 11894 and the HEASARC page were not opened. I viewed PIA22085 and PIA16697 as image files; the Hubble image file was downloaded but not viewed. The credit wording for PIA16697 is unconfirmed. The check-up rows are drafted, not computed by tested module functions yet.
