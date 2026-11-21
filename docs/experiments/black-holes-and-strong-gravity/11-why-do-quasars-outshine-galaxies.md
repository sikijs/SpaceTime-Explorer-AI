# Black Holes and Strong Gravity — Experiment 11: Why Do Quasars Outshine Galaxies?

**Status: PROPOSED by Claude on 2026-11-20 per `CLAUDE.md` §23 Stages 1 to 3, at the owner's request (2026-11-20: "add a separate exp 'Why do quasars outshine galaxies' to Black holes and strong gravity"). On 2026-11-20 the owner answered "all defaults" to the twelve decisions of the first draft, and asked for as much detail as possible in the introduction, images from NASA, Hubble and similar sites, links to the latest resources and plain-language link sites. This version records those answers and the sources fetched on 2026-11-20. On 2026-11-20 the owner also answered "all defaults" to the five new decisions (13 to 17). NOT YET APPROVED as a specification: the owner has answered the decisions but has not said the specification is approved (§23 Stage 4), and no learner-facing wording is approved. Nothing is implemented.**

**What changed from the first draft, from the sources.** (a) The flicker example is now **one week**, not one day: the textbook the sources give says quasar brightness typically varies over 5 to 2,000 days, so one day was below the published range. (b) The Milky Way's brightness is now **about 2 to 3 × 10¹⁰ Suns**, from the two sources read, and not "10 to 50 billion". (c) The efficiency ceiling has two published values, 42 and 32 percent (Decision 13). (d) 3C 273's luminosity has no consistent published value, so a second, sourced example is recommended (Decision 14).

---

## Overview

Black Holes 8 showed that a probe spiralling down to a black hole's last safe orbit gives up between about 4 and 42 percent of its rest-mass energy, depending on the spin. It said where that energy goes was not modelled. Black Holes 9 showed how black holes are born. No experiment in the group has yet asked what a black hole does to its surroundings when it is **fed**.

This experiment asks: **how can something about as small as a solar system shine brighter than a galaxy of a hundred billion stars?**

A **quasar** is the glowing centre of a distant galaxy, where gas falls toward a supermassive black hole. NASA's Hubble page says quasars have "luminosities between 10 to 100,000 times that of our Milky Way galaxy, generated from an area just a few light-days to a few light-years across", and the Chandra X-ray Center says a quasar radiates "as much energy per second as a thousand or more galaxies, from a region that has a diameter about one millionth that of the host galaxy". The puzzle has two halves, and the experiment answers both with the physics the group already has:

1. **Where does the energy come from?** A star shines by fusion, which turns 0.71 percent of the hydrogen's mass into energy (OpenStax Astronomy 2e, section 16.2). Matter falling toward a black hole can turn 5.7 percent (no spin) up to a ceiling of about 42 percent (fastest spin) of its mass into light, the numbers of Black Holes 8 (see Decision 13 for the 32 percent some textbooks give). So **each kilogram of gas that falls in makes roughly 8 to 60 times as much light as a kilogram of hydrogen fused in a star** (calculated here: 5.72 ÷ 0.71 and 42.3 ÷ 0.71).
2. **How small must the source be?** A quasar's brightness flickers. OpenStax says the visible light of quasars "varies on typical time scales of 5 to 2000 days, limiting the size of the disk to that many light-days". Peterson's review says that if a source's brightness doubles in a week, "the emitting region must be no larger than one light week in radius". So **a source that changes as a whole in a week is no wider than about a light-week, which is about 1,200 AU across (about 20 times the width of Neptune's orbit), around one five-millionth of the width of the Milky Way** (calculated here). The light comes from a region far smaller than the galaxy it outshines.

The experiment is a **comparison with real numbers**: the learner sees how much matter must fall in each year to make a real quasar's light, how that compares with what fusion would need, and how small the source must be.

It is **not** a model of the accretion disk, the jets, or how the light is produced from the infalling gas. Those are named and not modelled.

---

## Learning Objective

By the end the learner can say, in their own words:

1. A quasar is the very bright centre of a distant galaxy, powered by gas falling into a supermassive black hole. It can outshine all the stars of its galaxy together.
2. Falling toward a black hole releases a far larger share of a kilogram's mass as light than fusion does: about 5.7 percent with no spin and up to about 42 percent at the theoretical ceiling (Black Holes 8), against 0.71 percent for fusion in a star.
3. So a real quasar's light needs only a few Suns' worth of gas to fall in each year, not tens of Suns of hydrogen fused each year (numbers computed in the module).
4. How fast the light flickers sets a limit on the size of the source: it cannot be wider than the distance light travels in the time it takes to change. For a flicker of one week that is about one light-week, about 1 part in 5 million of a galaxy's width (computed).
5. What this shows and what not: the energy and size arguments are physics and measurement; how the disk makes the light, what drives the jets, and why some black holes are fed and others are not are not covered.

---

## Physical Situation

The historical example is **3C 273**, the first quasar to have its nature recognised. The Chandra Field Guide says "In 1963 astronomers Maarten Schmidt (3C273) and Jesse Greenstein and Thomas Matthews (3C48) noticed that the spectrum made sense if it was simply an extremely large redshift". NASA's Hubble release of 5 December 2024 gives its distance as 2.5 billion light-years and its redshift z = 0.158 is on ESA/Hubble's 3C 273 page. Older pages give 2 billion (ESA/Hubble 2013) and about 3 billion light-years (Caltech 2013, Chandra education page); the page uses NASA's 2024 figure and says older pages differ.

**3C 273's brightness has no consistent published value in the pages read:** the Chandra education page says "about 5 trillion times as bright as the sun"; the APS News page says "around 2 trillion stars"; the NASA and ESA/Hubble pages say that at 30 light-years (ESA/Hubble) or tens of light-years (NASA) it would look as bright as the Sun, which by the inverse-square law (calculated here, 30 light-years is 1.9 million AU) is about 3.6 trillion Suns. The module uses **4 trillion Suns, labelled "about, and the sources differ"**, until the owner decides Decision 14.

**A sourced second example, J0529-4351** (ESO press release eso2402, 19 February 2024, and Wolf et al., *Nature Astronomy* 2024, arXiv:2402.15101): "over 500 trillion times more luminous than the Sun", a black hole of 17 billion Suns that "eats just over a Sun per day" and "accretes around one solar mass per day", light that took over 12 billion years to arrive, and an accretion disc releasing 2 × 10⁴¹ W. **Check, calculated 2026-11-20:** with the efficiency of Black Holes 8's formulas near 10 percent, the module's formula ṁ = L ÷ (ε c²) gives about 340 Suns a year for 500 trillion Suns, which agrees with ESO's "just over a Sun per day" (about 365 a year). ESO does not state the efficiency, so this agrees with the module, it does not prove it.

---

## Physics Model (`src/physics/quasarBrightness.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **Energy from mass** | E = ε m c², so a luminosity L needs the mass per second ṁ = L ÷ (ε c²) | textbook; by hand |
| **Efficiency, black hole** | `energyReleasedFraction(spin, 'with')` **imported unchanged** from `spinningBlackHoleExperiment.ts` (5.72 percent at spin 0, 15.58 percent at 0.9, 26.4 percent at 0.99; ceiling 42.3 percent) | Black Holes 8, tested |
| **Efficiency, fusion** | 0.71 percent (the proton-proton chain: "the mass lost, 0.02862 u, is 0.71% of the mass of the initial hydrogen") | OpenStax Astronomy 2e, section 16.2, read 2026-11-20 |
| **Sun's luminosity** | 3.828 × 10²⁶ W (IAU 2015 Resolution B3, nominal) | arXiv:1510.07674 (the IAU text), read 2026-11-20 |
| **Mass per year** | ṁ in kilograms per second and Suns per year, for the chosen luminosity and efficiency. **By hand, L = 4 trillion Suns (1.53 × 10³⁹ W):** 4.7 Suns a year at 5.72 percent, 2.7 at 10 percent, 1.7 at 15.6 percent, 1.0 at 26.4 percent, 0.64 at 42.3 percent; with fusion at 0.71 percent about 38 Suns of hydrogen a year | by hand 2026-11-20, to be tested |
| **Light-day** | c × 86,400 s = 25.9 billion km = 173.1 AU (NASA's "What is a light-day?" gives 25,902,068,356 km) | NASA Voyager page, read 2026-11-20 |
| **Size limit** | R ≤ c × Δt. **By hand:** 1 week is 7 light-days, 1.81 × 10¹⁴ m, about 1,212 AU, about 20 times the width of Neptune's orbit (about 60 AU across, doubled from NASA's 30 AU radius). The Milky Way's disk, "more than 100,000 light-years" (NASA), is about 3.65 × 10⁷ light-days, so the width ratio is about 5.2 million for a week, 7.3 million for 5 days, 36.5 million for 1 day | by hand 2026-11-20, to be tested |
| **Real objects** | the Milky Way: about 2 to 3 × 10¹⁰ Suns (Caltech course slide gives "~2 × 10¹⁰ L"; Scientific American gives "30 billion times as much light as the sun"; no NASA, ESA or OpenStax value found) and a disk "more than 100,000 light-years" across; 3C 273 (above); J0529-4351 (above). Held as data | pages read 2026-11-20 |
| **Answers** | the predictions' answers, nearest-button helpers, the tutor's marks | arithmetic |

The module invents no new physics. **Not modelled** (the page must say so): the accretion disk, how the infalling gas gives up its energy as light, magnetic fields and jets, relativistic beaming, dust, the host galaxy's own light, how the black hole is fed, how long a quasar lasts, and the unified picture of other active galaxies. **Assumed:** that the efficiency of Black Holes 8 (a probe's descent to the last safe orbit) is a fair stand-in for the share of infalling mass turned to light; the group's earlier experiments and Cosmic Horizons 23 already use it. **Illustrative, not measured:** the one-week flicker. It is the example in Peterson's review and lies inside OpenStax's 5 to 2,000 days; it is **not** claimed to be 3C 273's own flicker time, for which no source was read.

---

## Learner Controls ("Now try it yourself", trial values)

1. **The black hole's spin** (four buttons: 0, 0.5, 0.9, 0.99, circling with the spin), using Black Holes 8's function. It changes the efficiency, and with it the mass per year.
2. **The brightness** (four buttons: 10 billion, 100 billion, 1 trillion, 10 trillion Suns), trial values, to show that a dim and a bright active centre need very different feeding rates. They are trial values, not claims about particular objects.

Picture C (mass per year) follows the controls. The brightness and size pictures do not (Decision 7).

---

## Prediction Activity (§12, §14 "Predictions and the Real Results")

Part 1 is fixed on **a quasar of 4 trillion Suns (3C 273) and a black hole with no spin** (efficiency 5.72 percent); the spin and brightness are in Part 2. Guesses are drawn in white on the real pictures, beside the real results, and the tutor marks them (§12, §13).

1. **How many times brighter than the Milky Way is 3C 273?** Five buttons on a log scale (about the same, about 10 times, about 100 times, about 1,000 times, about 100,000 times). Answer from the module: 4 trillion ÷ 2 to 3 × 10¹⁰, about 130 to 200 times (the page states the range, since the sources for both numbers differ). Drawn as a white mark on Picture A's log ruler of brightness.
2. **If a quasar's light flickers over about a week, how wide can the region that makes the light be, compared with the Milky Way?** Five buttons on a log scale (about as wide, about a tenth, about a thousandth, about a millionth, about a hundred-millionth). Answer about one five-millionth (to be tested); the buttons will be balanced so the answer is not at an end. Drawn as a white mark on Picture B's log ruler of widths.
3. **How much mass must fall into the black hole each year to make that light?** Five buttons on a log scale in Suns per year (about 0.01, 0.1, 1, 10, 100, balanced in the spec step). Answer about 4.7 Suns a year at no spin. Drawn as a white mark on Picture C's log ruler of mass per year.

Fusion's 0.71 percent is not told before the guesses, so guess 3 is not a trivial ratio; it appears in the introduction after the guesses are shown (Decision 6).

---

## Pictures (each labelled on the canvas, with a "How to read this diagram" caption of the project's standard, §14)

- **Picture A, "Brightness".** A log ruler: the Milky Way, 3C 273, and the learner's guess in white. After the run, a bar for the quasar's light and a bar for the galaxy's stars. *Where the real picture comes from:* measured (luminosities, by named observers), calculated here (the ratio).
- **Picture B, "Size".** A log ruler of widths: Neptune's orbit, one light-day, one light-week, one light-year, the Milky Way, with the flicker limit drawn as a bar and the guess in white. *Where it comes from:* the flicker time is an illustrative value, the limit is calculated here.
- **Picture C, "Fuel".** Two bars on a log scale, in Suns per year: what fusion would need and what infall needs at the chosen spin, with the guess in white. *Where it comes from:* calculated here, from the luminosity and the efficiencies. If Decision 14 is taken, a check-up row sets the module's rate for J0529-4351 beside ESO's "just over a Sun per day".

---

## Introduction (detailed plan; the wording is drafted after approval, §28.1)

The owner asked for as much detail as possible, with images from NASA, Hubble and similar sites and links to the latest resources and plain-language sites. The introduction is planned as the sections below, each in simple words with a daily-life comparison, in the order the learner needs them (§15, §29 rule 1). It must not give the three answers before the learner has predicted (§12).

1. **The question and a picture of the puzzle.** What a galaxy is (a hundred billion stars, 100,000 light-years across) and what "as bright as 4 trillion Suns" means (a city at night against a single match, as a comparison to be approved).
2. **What a quasar looks like.** A bright point, like a star, not a cloud; why the name is "quasi-stellar" (the coined name is credited to Hong-yee Chiu in 1964 on the Caltech page, read through a summary, to be rechecked). *Image 1, 3C 273 with the quasar's glare blocked, NASA/ESA/Hubble, 2024; Image 2, quasars and their host galaxies, ESA/Hubble, 1996.*
3. **The first quasar.** 3C 273, Schmidt in 1963 and his spectrum that "made sense if it was simply an extremely large redshift"; redshift explained in plain words (the spectrum of a receding source is shifted, like a siren's pitch dropping), because the learner needs only the idea that the object is very far away and therefore very bright. *Image 3, Hubble's view of 3C 273 and its jet, ESA/Hubble.*
4. **What feeds it.** A supermassive black hole, the disk of falling gas, and a plain statement that the light comes from the gas just before it falls in (what Black Holes 8 called energy released). **Two sentences added on the owner's approval, 2026-11-21.** (a) In the list of things the learner needs, after "including ours (Sagittarius A*, from Black Holes 1)": "Ours is quiet today because it gets very little gas." and then "Quasars are the cases where such a black hole is being fed a lot of gas, so it shines far brighter than the galaxy around it." This makes clear that our own black hole is not a quasar. (b) After the disc is named: "The black hole itself usually spins too, because the gas that falls in is circling and passes some of that motion on. How fast it spins changes how much of the falling gas's energy comes out as light, which is why this page lets you choose a spin." (c) **A paragraph added on the owner's approval, 2026-11-21**, headed "Can a quasar swallow its whole galaxy?", straight after the "What feeds a quasar" paragraph and before Figure 4. It says: no; the black hole is tiny next to the galaxy; its pull reaches only the middle; stars circle and do not fall in (the Sun at about 26,000 light-years would carry on unchanged); a quasar is fed mostly by gas, which can lose sideways motion and spiral in; a campfire-in-a-field comparison; a quasar's light and winds can push gas out and cut off its own fuel, so it switches on and fades while the black hole grows. It gives no ratio and no lifetime, because neither has a source read. *Image 4, an artist's impression of a black hole, disk, dusty torus and jets, ESO/L. Calçada (labelled "artist's impression").*
5. **Half one of the puzzle: energy.** Starts with what a star does, 0.71 percent, in plain words (four hydrogen atoms weigh slightly more than one helium atom; the difference is the energy). The efficiency of falling is recalled from Black Holes 8 without the answer to guess 3.
6. **Half two of the puzzle: size.** What flicker is, and why the speed of light limits the size. Daily-life example: a stadium crowd doing the wave takes time to go round; if the whole stadium lit up and dimmed together in one second it could not be bigger than what light crosses in a second. Peterson's "doubles in a week" case. *Image 5, the jet of 3C 273 in X-rays, Chandra, with its credit.*
7. **A real record-breaker (the latest).** J0529-4351, 2024: over 500 trillion Suns, a Sun a day, 12 billion years of light travel. It was catalogued as a star for decades and misclassified by Gaia because it was too bright (ESO). The page says what is measured and what is estimated.
8. **What is still being learned (the latest).** Short, dated, sourced lines from the 2025 pages read: NASA/Chandra on RACS J0320-35, a quasar growing at an estimated 300 to 3,000 Suns a year at 12.8 billion light-years; ESA/Webb's 19 November 2025 release on a feasting black hole less than 600 million years after the Big Bang; and the MIT June 2026 report of the earliest known flickering quasar (a university source, labelled). Each is stated as that source's claim, with its date.
9. **The words** (quasar, galaxy, luminosity, redshift, accretion disk, efficiency, light-day, flicker) in the collapsed "Words and formulas" box, and a "Some new words" line.
10. **What the experiment does and does not do,** and a plain note beside the controls that the guesses do not change the drawings but the settings do (§14).

**Image slots (all to be stored as local copies under `public/images/quasars/`, with their credit line shown under each, as the earlier Black Holes pages do; Decision 15).** Only images whose licence statement was read are used.

| Slot | Image | Credit as stated | Licence statement read |
|---|---|---|---|
| 1 | Quasar 3C 273, Hubble coronagraph, 5 Dec 2024. Page: `science.nasa.gov/asset/hubble/quasar-3c-273-2/` | NASA, ESA, Bin Ren (Université Côte d'Azur/CNRS); Acknowledgment: John Bahcall (IAS); Image Processing: Joseph DePasquale (STScI) | NASA: "generally are not subject to copyright in the United States"; "NASA should be acknowledged as the source" |
| 2 | Quasars and their host galaxies, 19 Nov 1996. Page: `esahubble.org/images/opo9635a` | John Bahcall (IAS), Mike Disney (Univ. of Wales), NASA/ESA | ESA/Hubble CC BY 4.0 |
| 3 | Best image of bright quasar 3C 273, 18 Nov 2013. Page: `esahubble.org/images/potw1346a/` | ESA/Hubble & NASA | ESA/Hubble CC BY 4.0 |
| 4 | Artist's impression of a supermassive black hole, 16 Apr 2015. Page: `eso.org/public/finland/images/eso1515a` | ESO/L. Calçada | ESO CC BY 4.0 (from ESO's copyright page; the fetch tool said only "standard ESO usage terms", so recheck) |
| 5 | Chandra X-ray image of the 3C 273 jet, 6 Nov 2000. Page: `chandra.si.edu/photo/2000/0131/index.html` | NASA/CXC/SAO/H. Marshall et al. | "no claim to copyright is being asserted and the material may be used in accordance with NASA guidelines" |
| spare | The homes of quasars, 27 Jun 2012. Page: `esahubble.org/images/opo1227a` | NASA, ESA/Hubble and K. Schawinski (Yale) | ESA/Hubble CC BY 4.0 |

All image URLs were opened and returned HTTP 200 on 2026-11-20. **Not yet done:** viewing each image, writing its alt text from what it actually shows, and rechecking the ESO licence on ESO's own page. The older pages give older distances (Chandra's image page says 3 billion light-years); the captions will use NASA's 2024 figure and never repeat an older one.

---

## "Want to know more?" links (all opened 2026-11-20 through a fetch tool that summarises pages; every quoted line must be rechecked on the page before it is printed word for word; each opens in a new tab with a plain line on what the learner will find)

**Plain-language pages (official, §29 rule 3(b)):**
1. NASA Science, "Hubble Quasars" (updated 18 June 2026), `science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-quasars`: what a quasar is and how small and bright.
2. Chandra X-ray Center, "Quasars & Active Galaxies", `chandra.harvard.edu/xray_sources/quasars.html`: the flashlight and the Los Angeles basin comparison.
3. Chandra Field Guide, "Quasar 3C273", `chandra.harvard.edu/xray_sources/3c273/index.html`: the first quasars and the jet.
4. NASA/STScI, "NASA's Hubble Takes the Closest-Ever Look at a Quasar" (5 Dec 2024), `science.nasa.gov/missions/hubble/nasas-hubble-takes-the-closest-ever-look-at-a-quasar/`: the newest Hubble view of 3C 273.
5. NASA/STScI, Webb simulations of galaxies hidden in a quasar's glare (14 Oct 2020), `science.nasa.gov/missions/webb/simulations-show-webb-telescope-can-reveal-distant-galaxies-hidden-in-quasars-glare/`: the car headlight comparison.
6. ESA/Hubble, "Best image of bright quasar 3C 273" (2013), `esahubble.org/images/potw1346a/`.
7. Caltech, "Fifty Years of Quasars" (15 Mar 2013), `caltech.edu/news/fifty-years-quasars-38937`: the discovery story.
8. NASA Voyager, "What is a light-day?", `science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/`: the unit used for the size limit.
9. OpenStax Astronomy 2e, 27.2, "Supermassive Black Holes: What Quasars Really Are", `openstax.org/books/astronomy/pages/27-2-supermassive-black-holes-what-quasars-really-are`: the textbook version of both halves (a textbook, not an agency page).

**Latest and primary (§29 rule 3(a)):**
10. ESO, "Brightest and fastest-growing: astronomers identify record-breaking quasar" (eso2402, 19 Feb 2024), `eso.org/public/news/eso2402/`.
11. Wolf et al., *Nature Astronomy* 2024, "The accretion of a solar mass per day by a 17-billion solar mass black hole", `arxiv.org/abs/2402.15101` (the Nature page could not be fetched).
12. NASA/Chandra, "NASA's Chandra Finds Black Hole With Tremendous Growth" (18 Sep 2025), `chandra.harvard.edu/photo/2025/red6/`.
13. ESA/Webb, "Webb witnesses a feasting supermassive black hole in the early Universe" (weic2522, 19 Nov 2025), `esawebb.org/news/weic2522/`.
14. MIT News, "MIT astronomers discover earliest known flickering quasar" (8 Jun 2026), `news.mit.edu/2026/mit-astronomers-discover-earliest-known-flickering-quasar-0608` (a university source).
15. Peterson, "Variability of Active Galactic Nuclei" (arXiv:astro-ph/0109495, 2001), `ar5iv.labs.arxiv.org/html/astro-ph/0109495`: the light-travel-time argument (a primary review; only the first part was read).
16. Kellermann, "The Discovery of Quasars and its Aftermath" (J. Astron. Hist. Heritage 2014), `arxiv.org/abs/1304.3627`: a history of 3C 273 by an astronomer.

**Gaps recorded (§29 rule 3(c)):**
- **Schmidt (1963)** "3C 273: A Star-Like Object with Large Red-Shift", *Nature*, 16 March 1963: the title, journal and date were confirmed on two read pages (Kellermann; APS News), but the Nature, Springer and ADS pages could not be fetched and a PDF could not be read. **It is not linked as read.** The volume and page are not confirmed.
- **Flicker-to-size, an official agency page:** no NASA, ESA, ESO, NOIRLab or Chandra page was found that explains it. OpenStax (a textbook) and Peterson (a review) are the nearest. The introduction defines the idea in its own words (§15).
- **The Milky Way's luminosity from NASA, ESA or OpenStax:** not found. The Caltech course slide and Scientific American are the two sources read, and they differ by 50 percent. The page says "about 2 to 3 × 10¹⁰".
- **NOIRLab** releases on quasars were found in a search but their pages came back empty and could not be read; none is linked.
- **Wikipedia** gave 3C 273 values in a search summary only; it is not an official source and is not used.

---

## Relationship to Other Experiments

- **Builds on:** Black Holes 1 (a black hole's size), 8 (spin, the last safe orbit and the energy released; its function is reused unchanged), 9 (how black holes begin).
- **Overlap with Cosmic Horizons 23 ("How fast can a black hole grow?").** CH 23 introduces the Eddington limit and uses the same efficiencies to find growth times. **This experiment leaves the Eddington limit out** (Decision 3). Its question, "how can it be so bright", comes before CH 23's, "how fast can it grow". CH 23 says in its own text that it builds on Black Holes 1 and 8; it does not mention this experiment, and its introduction would not change.
- **Other mentions of quasars:** Black Holes 4 (an aside), Cosmology 7 (the Twin Quasar as the first lens), Evidence and Imagination 7 (quasars as markers in a dipole test). None explains what a quasar is. This experiment is where they can point back to.

---

## Required Physics Tests (§10), planned

1. Mass per second equals L ÷ (ε c²) for a known L and ε, in kilograms per second and in Suns per year.
2. The efficiency at spin 0, 0.5, 0.9 and 0.99 equals Black Holes 8's `energyReleasedFraction` exactly.
3. The mass per year falls as the efficiency rises, and the fusion case needs more than every spinning case.
4. The ratio of fusion's need to infall's equals ε_infall ÷ ε_fusion.
5. The size limit equals c × Δt, and doubles when Δt doubles; one light-day is 25.9 billion km.
6. The ratio of the galaxy's width to the size limit for one week is about 5.2 × 10⁶.
7. The luminosity ratio of 3C 273 to the Milky Way matches the sourced values and its stated range.
8. For J0529-4351 (500 trillion Suns) at 10 percent efficiency the module gives about 340 Suns a year, within 10 percent of ESO's "just over a Sun per day".
9. The predictions' answer helpers return the right nearest button; the marker positions follow the guess.
10. Nothing changes with the playback speed (§11).
11. Every learner-facing number comes from the module.

---

## Decisions

**Taken on 2026-11-20 by the owner ("all defaults"):**
1. Placement: Experiment 11, at the end of the group, so no experiment is renumbered.
2. The object: 3C 273 (but see Decision 14, which is new).
3. The Eddington limit left out, left to Cosmic Horizons 23.
4. Two linked ideas, energy and size.
5. Spin as a control, reusing Black Holes 8's function.
6. Fusion's 0.71 percent held until after the guesses.
7. Only Picture C follows the controls.
8. Three predictions.
9. The brightness numbers set from fetched sources (done above; the values are in the physics table).
10. A reading guide with a check-up table where a real reference exists (the spec step names the rows: the module against ESO's "just over a Sun per day" for J0529-4351; the fusion and efficiency shares against OpenStax; the Milky Way and 3C 273 luminosity ratio as a range, not a cut-off).
11. Links: NASA, ESA, ESO, Chandra and observatory pages and the papers, with §29 rule 3(c) gaps recorded (done above).
12. The group's overview and chapter summary in `src/App.tsx` get one line each, wording to be approved.

**New, from the research; taken on 2026-11-20 by the owner ("all defaults", so each is Claude's recommended default below):**
13. **The efficiency ceiling.** Black Holes 8 gives 42.3 percent as the limit for the fastest possible spin, and the professional review read (Begelman, NED/IPAC) gives "about 6% … to about 42%". OpenStax Astronomy gives "10% or, in the extreme theoretical limit, 32%". The learner's spin buttons stop at 0.99 (26.4 percent). Default: the page says "up to about 42 percent in theory, and some textbooks quote about 32 percent for the most extreme realistic case", with both sources named, and the module uses Black Holes 8's formula unchanged.
14. **A second, sourced example (J0529-4351).** 3C 273's luminosity has no consistent value in the pages read (about 2, 3.6 and 5 trillion Suns), while J0529-4351's numbers (ESO and the paper) agree with each other and with the module. Default: keep 3C 273 as the historical first quasar for the story and the predictions (about 4 trillion Suns, "the sources differ"), and add J0529-4351 as the second example in the introduction and as the check-up row. The alternative is to make J0529-4351 the worked object for the predictions as well.
15. **Images stored locally.** Default: local copies under `public/images/quasars/`, each with its credit and licence line below it, as the earlier Black Holes pages do, and not hot-linked.
16. **The flicker value in Part 1.** Default: one week, as an illustrative value (Peterson's example, inside OpenStax's 5 to 2,000 days), stated as not being 3C 273's own flicker time.
17. **The "comparison to a match and a city" and the "stadium wave" examples** are the agent's own, for the owner to approve with the introduction wording (§28.1).

---

## Not checked (§20, §28.6)

- No image was viewed. No page was read in full by the agent: the fetch tool summarised each page, so every quoted line must be rechecked on the page before it is shown word for word.
- The Nature paper, Schmidt (1963), NOIRLab, the IAU PDF and several lecture PDFs could not be read.
- The 3.6 trillion Suns from the apparent-brightness comparison is the agent's own inverse-square calculation, from a page that says "as bright as the Sun at 30 light-years", and gives only a rough check.
- The two sentences added on 2026-11-21 (Sagittarius A* is quiet today; the black hole usually spins) have no source fetched and recorded here. They state general astronomy (Sagittarius A* is a starved, dim black hole; supermassive black holes gain spin from infalling gas), not a number for any named object. A plain official page on black hole spin has not been searched for, and no spin value is claimed for 3C 273. Open (§29 rule 3(c)).
- The "Can a quasar swallow its whole galaxy?" paragraph (2026-11-21) has no source fetched either. Its claims (a black hole is a small fraction of its galaxy's mass; stars on orbits rarely fall in; gas can lose sideways motion; quasar light and winds can push gas out and cut off the fuel) are general astronomy. The Sun's distance of about 26,000 light-years from the Milky Way's centre was not checked on a page here. The campfire comparison is the agent's own wording. Open (§29 rule 3(c)).
- All hand calculations above are to be tested in Step 1. The page, the module and the tests do not exist.

---

## Implementation Notes

**Status as of 2026-11-21 (recorded at the owner's request).** Steps 1 to 6 are built and committed. Steps 7 (complete-flow testing) and 8 (review) have not been done. The plan was one step at a time (§6), each reported before the next.

| Step | What | Where | State |
|---|---|---|---|
| 1 | Physics model and tests | `src/physics/quasarBrightness.ts`, `quasarBrightness.test.ts` (42 tests) | Built, tests pass. Commit `c79cc9e` |
| 2 | Basic interface: brightness and spin buttons, Run, table | `QuasarBrightnessExperiment.tsx` | Built. Commit `04a490b` |
| 3 | Introduction, links, words box, three pictures with captions, what is held back until the first Run | `QuasarBrightnessIntro.tsx`, `QuasarBrightnessPictures.tsx`, five images in `public/images/quasars/` (17 and 14 render tests); draft wording in `11-draft-step3-wording.md` | Built. Commit `04a490b` |
| 4 | Three predictions, white YOUR GUESS marks on the pictures, Start over, locked-guess note | `QuasarBrightnessExperiment.tsx`, `QuasarBrightnessPictures.tsx` | Built. Commit `04a490b` |
| 5 | Part 3 results with the check-up and reading guide | `QuasarBrightnessResults.tsx` | Built. Commit `04a490b` |
| 6 | Part 4 tutor, and the chapter summary in `src/App.tsx` | `QuasarBrightnessTutor.tsx`, `App.tsx` (render tests for results and tutor: 8; page tests: 6) | Built. Commit `04a490b` |

The page has the four Parts (amber, pink, teal, blue). The module and component tests total 87, and they and the type check (`tsc --noEmit -p tsconfig.app.json`) passed on 2026-11-21. The full test suite and `npm run build` were not run.

**Owner-approved wording.** On 2026-11-21 the owner approved three additions to the introduction, recorded in the Introduction plan, item 4 (a) to (c): the sentences about Sagittarius A*, the black hole's spin, and whether a quasar can swallow a galaxy.

**Wording still marked as a draft for the owner's approval (§28.1).** The code comments mark the Part 3 results, the Part 4 tutor, the chapter summary (`learned` and `next`) for this chapter, and the changed "What's next" line for Black Holes 10 as drafts. The owner has not approved them line by line in this record. The rest of the introduction and the captions are also from the draft wording file, and this record does not show an approval date for them.

**Differences from this specification.** Not yet listed. They should be compiled and shown to the owner for approval before the specification is called final (§28.2).

**Housekeeping.** The header comment at the top of `QuasarBrightnessExperiment.tsx` still says "STEP 3 … no prediction, no reading guide, no four-Part layout and no tutor yet". That is out of date, because Steps 4 to 6 are now in the file. It has not been changed.

**Not checked (§28.6).** The complete flow in a browser (all prediction combinations and all control settings against a separate calculation); narrow widths, other browsers, keyboard use and a real learner; the sources listed in "Not checked" above, including the three sentences added on 2026-11-21.

**Next.** Step 7, complete-flow testing, then Step 8, the review, after the owner has reviewed the draft wording.
