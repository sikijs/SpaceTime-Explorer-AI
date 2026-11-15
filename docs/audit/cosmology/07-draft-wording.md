# Draft wording: Cosmology Experiment 7 (Gravitational Lensing)
Date: 2026-11-15 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5; the seventh of the Cosmology group). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Answers given (the owner, 2026-11-15): "defaults for all questions" (the twelve questions at the end of `07-gap-report.md`, each with its default), and the instruction that **the concept is hard, so the introduction is to be detailed and explanatory in simple terms, use as many sources as needed, and give up-to-date information.** The introduction below is therefore long, builds the idea in steps, uses everyday pictures and worked numbers, and has a "Lensing today (as of November 2026)" section.

**Facts in this draft come from pages and abstracts fetched on 2026-11-15 through helper agents whose fetch tool returns short, model-summarised extracts, not raw text.** Every quotation and figure marked [recheck] must be compared with the live page before it is printed. No page is linked that was not read.

## What the sources changed (read these first)
1. **The page's "about 15 percent visible" and "47 arcseconds" have no official page behind them in what was read.**
   - Visible share: the cosmic baryon fraction worked from Planck's own numbers (Ω_b h² = 0.0224, H0 = 67.4, Ω_m = 0.315) is about **15.7 percent**; Gonzalez and others (2013) find massive clusters' baryon fractions within r500 "on average ... 7% (Planck) below the Universal value", about **14.6 percent**. Neither page states "about 15 percent"; both numbers are my arithmetic on read numbers. **The draft keeps 15 percent (a given constant) and says it is "worked out here from two papers".**
   - Observed ring: Broadhurst and others (2005; arXiv astro-ph/0409132) give "an Einstein radius of approximately 50″ ... based on the radius of curvature of a giant low surface-brightness arc" (no source redshift seen in what was read) and a cluster redshift of 0.18. **The draft keeps 47 (a given constant, a physics decision to change) and says published estimates are about 47 to 50.** The specification's "published 47.0 ± 1.2" and "1.9 × 10¹⁴ within about 45 arcseconds" are **not found** in anything read. **Question A.**
2. **The 1919 test and Abell 1689 are sourced by official pages.** NASA's Hubble lensing page (dated 6 August 2026): the 29 May 1919 eclipse observations by Eddington, Dyson and Crommelin, from Sobral in Brazil and Príncipe. ESA/Hubble (opo1037a, 11 November 2010): Abell 1689 is "2.2 billion light-years from Earth" with "135 lensed images of 42 background galaxies" and "about 1,000 galaxies and trillions of stars". **The first lens, the 1979 Twin Quasar (Walsh, Carswell and Weymann), was not read** (the Nature page redirects to a login), so the draft does not state its details.
3. **Up to date, as of November 2026.** ESA's Euclid found a **complete Einstein ring around NGC 6505** (10 February 2025): the lens galaxy is about 590 million light-years away and the ring's source 4.42 billion; "The galaxy has been known to astronomers for a very long time. And yet this ring was never observed before." ESA's Euclid strong-lens catalogue (19 March 2025): about **500 strong-lens candidates, almost all previously unknown**; ESA expects about 100,000 by the end of the mission, "around 100 times more than currently known". ESA/Webb "Cosmic Gems arc" (2024): lensing lets astronomers resolve a galaxy seen when the universe was about 460 million years old "down to parsec scales". The COSMOS collaboration's Webb weak-lensing map (10 February 2026; *Nature Astronomy*, 26 January 2026): shapes of about 250,000 distant galaxies. **Not used, because only a search snippet was seen:** the Rubin Observatory lensing statements and the Euclid Q1 paper's counts. TDCOSMO 2025 (arXiv 2506.03023, H0 = 71.6 +3.9/−3.3 from lensing time delays) was read in part; it is not used because time delays are out of this experiment's scope.
4. **Gaps (§29 rule 3(c)):** no official page read says that lensing "does not say what dark matter is made of"; none gives the visible share of a cluster as a figure; there is no source for the wine-glass picture, the square garden or the shelf-sag picture.

## Layout
- **Above Part 1 (no heading):** a long, step-by-step introduction, a "Want to know more?" list, a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** two guesses (as written, unchanged); **Start over** (always visible); **Run**; three pictures, each with its own caption, all for the real cluster (observed total mass): the side view, the sky view (blue dashed visible-only ring, green dotted observed ring) and the ring-against-mass graph; white guess marks and an "imagined" four-times-the-visible-mass ring and point after the run; "Where the real picture comes from".
- **Part 2 (pink), "Now try it yourself":** the mass control (visible matter only, observed total, custom); its own side view, sky view (a **gold** ring for your mass) and graph point; its own caption.
- **Part 3 (teal), "The results":** the guesses beside the results; Table 1 (a check-up), Table 2 (the three rings and your own, with published values), "What this table tells us" under each.
- **Part 4 (blue), "The tutor":** three questions, then an explanation marking each guess.
- **Colours:** white only for the learner's guess; **blue** dashed for visible matter alone (calculated here); **green** dotted for the observed ring (measured, a given value); **gold** for the learner's own mass (Part 2 only); **violet** for "imagined" (the four-times-the-visible-mass ring and point); a dark background so white shows. Parts 2 to 4 appear after the first Run and stay when the mass changes.

---

## 1. Introduction (above Part 1; no answers given, §12) — long, step by step, at the owner's instruction

**Title:** Cosmology 7: Gravitational Lensing

**The question.** "How do you weigh something as huge as a galaxy cluster, and what can its effect on light tell us about what it is made of?"

**What happens.** "In this experiment you watch what happens to the light of a very distant galaxy as it passes a galaxy cluster on its way to us. First you make two guesses. Then you press **Run**. The light travels from the distant galaxy, bends around the cluster and reaches Earth, and then a picture of the sky shows what we would see through a telescope: the light drawn into a ring round the cluster. Your guesses are drawn on the pictures in white. In **Part 2** you choose the cluster's mass yourself and watch the ring for it being drawn. The results and a tutor follow."

**Step 1: a reminder, gravity bends light.** "In Gravity and Curved Spacetime Experiment 8 you saw that light passing near a mass is bent toward it. *Bent* means its path turns slightly; the light does not slow down or stop. The first big test was a solar eclipse on 29 May 1919: Eddington, Dyson and Crommelin took pictures of stars near the darkened Sun, from Sobral in Brazil and from Príncipe, to see whether the Sun's gravity moved their apparent places (NASA)."

**Step 2: what a lens is.** "The glass in a magnifying glass or in spectacles is shaped so that the light going through it is bent. All the rays that pass through are bent toward the same place, so a lens can gather light, make things look bigger or smear them. A **gravitational lens** does the same job with no glass at all: a massive object bends the light of whatever lies behind it. NASA puts it this way: 'Gravity can act like a lens, magnifying and distorting the light of distant objects that would otherwise be invisible.'"

**Step 3: three players.** "Three things take part, and you will meet all three on the pictures."
- "The **source**: a very distant galaxy whose light we are trying to see."
- "The **lens**: a **galaxy cluster** that happens to lie between the source and us. A galaxy cluster is a huge group of galaxies held together by gravity. The cluster used here is like **Abell 1689**, which has about 1,000 galaxies and trillions of stars and is about 2.2 billion light-years away (ESA/Hubble)."
- "**Us**: the Earth."
"Light leaves the source in every direction. Some of it passes close to the cluster. The cluster's gravity bends that light toward itself, and some of the bent light ends up reaching Earth. Without the cluster, that light would have gone straight past and missed us."

**Step 4: why a ring.** "Suppose the source, the cluster and Earth are in an almost perfect line. Then no direction around the cluster is special. Light that passes the cluster on the top, the bottom, the left and the right is all bent in the same way, and all of it reaches us. We see it arriving from every side of the cluster at once, as a **ring** of light. This ring is called an **Einstein ring**. If the line-up is slightly off, the ring breaks into pieces: bright **arcs**, or several separate **images** of the same galaxy. Real clusters usually do this. ESA/Hubble counted 135 lensed images of 42 background galaxies in Abell 1689 alone."

**A daily-life picture.** "Hold a wine glass between you and a distant lamp, in a dark room, and look through its thick stem or base. The glass bends the lamp's light by its shape. When the lamp, the glass and your eye line up just right, the lamp's light can be smeared into a ring or an arc. A galaxy cluster does something similar, bending light by its *mass* instead of by its shape. (This is an everyday comparison, not a measurement.)"

**Step 5: a new unit, the arcsecond.** "We measure how big the ring looks as an **angle** on the sky, because we see it from far away. A circle is 360 degrees. A **degree** is divided into 60 **arcminutes** and an arcminute into 60 **arcseconds**, so one **arcsecond** is 1/3600th of a degree (the International Astronomical Union's glossary says the same). That is tiny. A one-centimetre coin looks one arcsecond wide from about 2 kilometres away (2.06 km: 1 cm ÷ 0.0000048 ≈ 2,060 m). The rings on this page are a few tens of arcseconds in radius, which is a very small piece of the sky."

**Step 6: why ask this at all.** "We cannot put a galaxy cluster on a scale, and its mass is spread over millions of light-years. But its gravity bends light that passes it *whatever the mass is made of*: glowing stars, hot gas or something dark. How strongly it bends the light depends on how much mass there is. So the light is a kind of scale. You will be asked what that does to the ring."

**Step 7: visible and dark matter, a reminder.** "In Cosmology 4 you met **dark matter**: matter we cannot see but whose gravity we can feel. In a galaxy cluster, **visible matter** means the stars and hot gas, which give out light we can detect. Later you compare the ring made by the visible matter alone with the ring that is actually seen."

**Step 8: lensing today (as of November 2026).** "Astronomers now use lensing every day, and the news keeps coming:"
- "NASA's Hubble page (updated August 2026) says gravitational lensing occurs when a massive object, such as a galaxy cluster, 'warps space and time causing light to bend, distort, and magnify', and that mapping the distortions helps astronomers discern where mysterious matter is distributed."
- "In February 2025 ESA's **Euclid** space telescope found a complete Einstein ring around a galaxy called NGC 6505, about 590 million light-years away. The ring's source is 4.42 billion light-years away. The galaxy had been known for a very long time, and the ring had never been seen."
- "In March 2025 Euclid's first catalogue listed about **500** strong-lens candidates, almost all new. ESA expects about 100,000 by the end of the mission, around 100 times more than are known now."
- "NASA/ESA/CSA's **Webb** telescope uses cluster lenses as natural magnifiers. In 2024 it resolved a galaxy seen when the universe was about 460 million years old down to parsec scales. In February 2026 the COSMOS collaboration published a Webb map of dark matter made from the shapes of about 250,000 distant galaxies."
"This experiment looks at the simplest case, one ring. Arcs, multiple images, the weak lensing used for the big maps, lensing by single stars and the time delays between images are not covered."

**Your job.** "First, make two predictions about how the ring depends on the cluster's mass. Then press Run. Afterwards, in Part 2, pick a mass of your own."

**What to look for.** "When the pictures are drawn, these are the things to watch. Each one says what to look at, what it means and why it matters. (The numbers and what they show come later, in the captions and the results.)"
1. "**Look at:** the two yellow dots leaving the distant galaxy in the side view, bending at the cluster and arriving at Earth. **What it means:** the light takes a bent path, not a straight one. **Why it matters:** the bent path is why we see the galaxy in a different place and shape from where it really is."
2. "**Look at:** the rings on the picture of the sky. **What it means:** each ring is where the distant galaxy's light appears for a cluster of a particular mass. **Why it matters:** comparing rings is how this experiment compares masses."
3. "**Look at:** your white guess marks, which appear when the run ends, beside the real rings. **What it means:** each mark shows what you guessed. **Why it matters:** you can compare your guess with the real picture at a glance. The tutor goes through each guess at the end."
4. "**Look at:** in Part 2, the gold ring as you change the mass. **What it means:** it is the ring for the mass you chose. **Why it matters:** by moving it you see how the ring depends on the mass."

**How this page is laid out.** "Below this introduction the page has four parts. **Part 1** is where you guess and watch. **Part 2** is where you try your own settings. **Part 3** shows the results and what they mean. **Part 4** is the tutor. Parts 2, 3 and 4 appear when your first run has finished."

**Your guesses and the real pictures.** "Your guesses never change the real pictures or tables. They are drawn on the real picture in **white**, in a box labelled YOUR GUESS, and shown again beside the results. The real pictures come from the physics. The mass you choose in Part 2 does change the gold ring, the gold dot and the gold row of the table, but never the blue, green or violet ones. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess."

**What we assume** *(the observed ring and the visible share are named but their numbers are held until after the run, §12)*
- "The cluster is treated as round, with the source exactly behind its centre. Real clusters are lumpy and rarely line up perfectly, so real rings are usually broken into arcs and images."
- "The mass we work out is the mass inside the ring. That is all a ring can tell us about a round lens."
- "All the bending is treated as happening at one place, the cluster, and the angles are tiny. This is a standard, very good approximation for clusters."
- "The three distances (to the cluster, to the source, and between them) are fixed, rounded values for one real situation, a cluster like Abell 1689 at a redshift of 0.18 with a source at a redshift of 2. They are in megaparsecs (Mpc), the unit astronomers use for distances between galaxies; one Mpc is about 3.3 million light-years. They use the same illustrative Hubble constant as Cosmology 1 (70 km/s per megaparsec). Real measurements disagree a little, the **Hubble tension**: as of November 2026, NASA says space-telescope measurements give around 70 to 76 and measurements from the cosmic microwave background about 67 to 68."
- "Two reference values, an **observed ring** and a **visible share**, are given to compare with. They are explained, with their numbers, after you press Run."
- "The real amount of bending is used, which is twice what ordinary gravity alone would give, for the reason in Gravity and Curved Spacetime Experiment 8."
- "Nothing here claims to say what dark matter is."

**Some new words:** "galaxy cluster, gravitational lensing, lens, source, Einstein ring, arc, arcsecond, arcminute, megaparsec, visible matter, dark matter, Hubble tension. Each is in the Words and formulas box below."

*(§12 check: the introduction says that how strongly the cluster bends light depends on its mass but not that more mass gives a larger ring (guess 1), and it never mentions the square root (guess 2). It holds the 47, the 15 percent and the conclusion "most of the mass is unseen" for after the run.)*

---

## 2. "Want to know more?" (above Part 1; each link opens in a new tab)

**Before the run**
1. **NASA: Hubble and gravitational lenses** — `https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-gravitational-lenses/` — "NASA's plain page (updated August 2026) on how gravity magnifies and distorts the light of distant objects, with the 1919 eclipse test and a galaxy split into five images." *(read)*
2. **ESA/Hubble: gravitational lensing** — `https://esahubble.org/wordbank/gravitational-lensing/` — "A short ESA/Hubble definition of lensing: the bending of light by a massive body such as a galaxy cluster." *(read)*
3. **ESA/Hubble: Abell 1689** — `https://esahubble.org/images/opo1037a` — "ESA/Hubble's 2010 page on the cluster used as the real example here: 2.2 billion light-years away, 135 lensed images of 42 galaxies." *(read)*
4. **NASA: the biggest zoom lens in space (2003, updated 2025)** — `https://science.nasa.gov/missions/hubble/biggest-zoom-lens-in-space-takes-hubble-deeper-into-the-universe` — "NASA's page on Abell 1689 as a lens about 2 million light-years wide." *(read)*
5. **IAU: arcsecond** — `https://www.astro4edu.org/resources/glossary/term/79/` — "The International Astronomical Union's glossary entry: one arcsecond is 1/3600th of a degree." *(read)*
6. **ESA: Euclid discovers a stunning Einstein ring (February 2025)** — `https://www.esa.int/Science_Exploration/Space_Science/Euclid/Euclid_discovers_a_stunning_Einstein_ring` — "ESA's account of the ring round NGC 6505." *(read)*
7. **ESA: strong gravitational lenses captured by Euclid (March 2025)** — `https://www.esa.int/ESA_Multimedia/Images/2025/03/Strong_gravitational_lenses_captured_by_Euclid` — "ESA's first catalogue of about 500 strong-lens candidates." *(read)*
8. **ESA/Webb: the Cosmic Gems arc (2024)** — `https://esawebb.org/news/weic2418/` — "How Webb used a cluster lens to resolve a galaxy seen when the universe was about 460 million years old." *(read)*
9. **ESA: Webb brings cosmic lenses into focus (30 September 2025)** — `https://www.esa.int/ESA_Multimedia/Images/2025/09/Webb_brings_cosmic_lenses_into_focus` — "ESA's page on the COSMOS-Web lenses, including a ring that lets astronomers see back to when the universe was barely more than a billion years old." *(read)*
10. **COSMOS collaboration: a Webb map of dark matter (February 2026)** — `https://cosmos.astro.caltech.edu/news/90` — "How the shapes of about 250,000 distant galaxies were used to map dark matter." *(read)*
11. **Broadhurst and others (2005): Abell 1689** — `https://arxiv.org/abs/astro-ph/0409132` — "The paper that studies the cluster's arcs and images (106 images of 30 galaxies) and gives an Einstein radius of about 50 arcseconds. A technical paper; the abstract is the readable part." *(abstract read; the text read only in part)*
12. **NASA: What is dark energy?** is not used here. **NASA: Hubble constant and the tension** — `https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/` — "NASA's plain page behind the two ranges quoted in the assumptions (read for Cosmology 6)." *(read for Cosmology 6; to be re-read)*

**After the run** *(they say that most of a cluster's mass is dark, which is the tutor's question)*
13. **Chandra: the Bullet Cluster (2006)** — `https://chandra.harvard.edu/photo/2006/1e0657/` — "Chandra's page on two colliding clusters, where lensing shows that nearly all of the matter is dark." *(read)*
14. **Clowe and others (2006)** — `https://arxiv.org/abs/astro-ph/0608407` — "The paper that argues the Bullet Cluster is a direct empirical proof of dark matter. A technical paper; the abstract is the readable part." *(abstract read)*
15. **Gonzalez and others (2013): galaxy cluster baryon fractions** — `https://arxiv.org/abs/1309.3565` — "A technical paper on how much of a cluster's mass is ordinary (stars plus hot gas). The abstract is the readable part." *(abstract read)*
16. **Planck Collaboration (2018): cosmological parameters** — `https://arxiv.org/abs/1807.06209` — "The paper behind the universe's total amount of ordinary matter. A technical paper." *(abstract read)*

**Gaps (§29 rule 3(c)), searched 2026-11-15:** no official page read gives the visible share of a cluster as a figure (the page works it out from the last two papers); none says that lensing "does not say what dark matter is made of"; the first lens (Walsh, Carswell and Weymann 1979) did not load; the Rubin Observatory lensing pages did not load or were seen only as snippets; there is no source for the wine-glass, square-garden or shelf-sag pictures. Not linked on purpose: NASA's old "universe/phenomena/gravitational-lensing" page (404) and ESA/Webb's FAQ (404).

---

## 3. Part 1: Predict, then watch (amber)

**Lead ("What we are about to do").** "You will make two guesses. Then you will press Run and watch light from a distant galaxy bend around a galaxy cluster, and then three pictures: a side view, a view of the sky and a graph, all drawn for one real cluster. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures."

**Guess 1 and Guess 2: exactly as written.** Guess 1: "If the cluster between us and a distant galaxy had more mass, would the ring of light we see be larger, the same size, or smaller?" Larger / The same size / Smaller. Guess 2: "If the cluster had four times the mass, how wide would the ring be compared with before?" Four times as wide / Twice as wide / About the same.

**Locked line (after Run):** "Your guesses are locked while you try other settings. To change them, press Start over." **Start over** replaces "Change predictions": always visible, greyed out until a guess is chosen or a run exists and while a run plays; it clears the guesses, runs, results and tutor.

**Run:** eight seconds (fixed; playback speed never changes the result, §11). Before Run no picture is drawn. At Run the side view shows Earth, the cluster and the distant galaxy and the two yellow dots set off; when they arrive the sky view shows the blue dashed ring and the green dotted ring and the graph is drawn. **The grey of the white marks and the violet "imagined" ring appear when the run ends (A4).** The real cluster has the observed total mass.

**White guess marks (drawn when the run ends; each with a YOUR GUESS box joined by a line):**
- **Guess 1 (sky picture):** a white arrow starting on the **blue dashed ring** pointing **outward** for "Larger", **inward** for "Smaller", and a white ring on the blue ring for "The same size". Box: "YOUR GUESS: more mass gives a larger / smaller / the same size ring". **Marker only**: the arrow has a fixed length that means nothing as a number.
- **Guess 2 (sky picture and graph):** a white ring at the guessed multiple of the visible-only ring's radius: **72.9 arcseconds** for "Four times as wide", **36.4** for "Twice as wide", **18.2** for "About the same" (1 ×). On the graph, a white point at **four times the visible mass** at that ring size. Box: "YOUR GUESS: four times the mass: four times / twice / about the same width".
- **Imagined for the question (violet, labelled "imagined"):** a ring of **36.4 arcseconds** "for four times the visible mass", and its point on the graph curve, drawn beside the white ones when the run ends.

**Where the real picture comes from (under the pictures, after the run).**
- "**Measured (by others):** the **observed ring** of about **47 arcseconds** is a given, rounded value for the cluster Abell 1689; Broadhurst and others (2005) give an Einstein radius of about 50. It is given here, not worked out."
- "**Calculated here:** the blue dashed ring (the ring that the cluster's visible matter alone, **15 percent** of the mass, would make; the 15 percent is worked out here from Planck 2018 and Gonzalez and others 2013, about 15.7 and 14.6 percent), the purple curve, the real bend, and the mass inside the ring, from the formula in the Words and formulas box; the three distances 630, 1730 and 1480 Mpc are rounded values for a cluster at redshift 0.18 and a source at redshift 2."
- "**Imagined for the question:** the violet 'four times the visible mass' ring and point, the perfectly round cluster with a perfect line-up and, in Part 2, your own mass."
- "**Your guess:** the white marks only."

### Captions (one under each picture; each section appears as its feature is drawn)

**Picture 1, the side view: how the light travels.**
- "**Earth** is on the left, the **cluster (the lens)** is in the middle, and the **distant galaxy (the source)** is on the right, placed in proportion to their distances. The dashed line is the perfect line-up."
- "When you press Run, two yellow dots leave the source and travel along two **light rays**, one passing above the cluster and one below. Each is pulled toward the cluster by its gravity and changes direction there, then heads to Earth. Without the cluster the light would go straight and miss us. Light passing the cluster on *every* side is bent toward us, not only above and below; the picture shows two as examples, and all of them together make the ring."
- "**The bend is drawn far larger than it really is** so you can see it. The real bend at the ring's edge is only about **55 arcseconds**, about 0.015 of a degree."
- *What to look for:* "**Look at** the two yellow dots as they pass the cluster. **What it means:** each changes direction at the cluster. **Why it matters:** that change of direction, from gravity alone, is the whole effect."

**Picture 2, the sky view: what we see.**
- "This is what we would see through a telescope pointed at the cluster. The source is exactly behind it, so its light arrives from all around it and forms a ring. The scale bar shows 20 arcseconds."
- "The **dashed blue ring** is the ring that the cluster's visible matter alone would make (**18.2 arcseconds** in radius): **calculated here**. The **dotted green ring** is the ring actually observed for the real cluster (**47 arcseconds**): **measured by others, a given value**."
- *Worked moment (after the run):* "Measure from the cluster at the centre to each ring. The blue ring is 18.2 arcseconds out and the green is 47.0: the green ring is 28.8 arcseconds farther out, and 47.0 ÷ 18.2 ≈ 2.6 times as wide."
- "The **white** marks are your guesses. They are only markers or fixed sizes, and they do not say right or wrong. The **violet ring**, labelled imagined, is the ring a cluster with four times the visible mass would make (**36.4 arcseconds**): **calculated here**, for the question."
- *What to look for (each appears when its feature is drawn):* (1) "**Look at** the blue ring and the green ring. **What it means:** the green ring, the real one, is 28.8 arcseconds wider than the ring the visible matter alone would make. **Why it matters:** it is a measured difference between two rings, and the whole experiment is about what it means." (2) "**Look at** the violet ring against the blue ring. **What it means:** it is exactly twice as wide (36.4 against 18.2). **Why it matters:** it shows what four times the mass does to the ring." (3) "**Look at** the white marks. **What it means:** each shows what you guessed beside the real rings. **Why it matters:** you can compare at a glance; the tutor goes through each guess."

**Picture 3, the graph: ring size for every mass.**
- "Across the bottom is the cluster's mass in **solar masses** (one is the mass of our Sun). Up the side is the ring's radius in arcseconds. The **purple curve** is the ring for every mass, **calculated here**."
- "The **blue dot** is visible matter only (3.0 × 10¹³ solar masses, ring 18.2). The **dotted green line** is the observed ring, 47. The curve meets it at the mass inside the observed ring, about 2.0 × 10¹⁴ solar masses, **calculated here** by running the formula backward."
- *What to look for:* (1) "**Look at** where the purple curve crosses the green line, then straight down to the mass axis. **What it means:** about 2.0 × 10¹⁴ solar masses is inside the observed ring. **Why it matters:** the ring has turned into a weighing." (2) "**Look at** the blue dot against that crossing. **What it means:** the visible matter is 3.0 × 10¹³, the crossing is 2.0 × 10¹⁴. **Why it matters:** the two numbers are far apart, and a tutor question in Part 4 asks why." (3) "**Look at** the white point and the violet point at four times the visible mass. **What it means:** the violet one is on the curve at 36.4 and the white one is where you guessed. **Why it matters:** this is the part of the curve you were asked about."

*(Held for the tutor and Part 3, §12: the square-root rule, "most of the mass is unseen", the verdict on both guesses, and "a second line of evidence for dark matter".)*

---

## 4. Part 2: Now try it yourself (pink)

**Lead.** "Now you choose the cluster's mass. Press Run and a gold ring is drawn for your choice, beside the blue and green rings from Part 1. Your guesses do not change anything in this part; your mass does."

**Control.** "Mass of the galaxy cluster in the middle (in solar masses):" **Visible matter only** / **The observed total** / **Custom** (a slider from 1 × 10¹³ to 4 × 10¹⁴). A choice changes the gold ring, the gold dot, the bend in the side view and the readout only after its own **Run**; Parts 2 to 4 stay on screen.

**Note beside the control (new):** "Your guesses do not change the drawings or tables. This mass does, but only the gold ring, the gold dot and the gold row in Part 3. While it is on the observed total, the gold ring lies exactly on the green one, so change it to see the gold ring move. These masses are **trial values**: they show what would happen for a cluster with that much mass, and they do not say the real cluster is like that."

**Readout:** the mass; the ring radius; the real bend at the ring's edge; the ring as a multiple of the visible-only ring.

**Pictures:** the side view (bend follows the mass), the sky view with a gold ring, the graph with a gold dot. A short caption: the gold ring and dot; "**Look at** the gold ring against the blue and green rings as you move the mass. **What it means:** with [your mass] the gold ring is [x] arcseconds, [more / less] than the green. **Why it matters:** it shows how the ring depends on the mass." **Where the real picture comes from:** *calculated here:* the gold ring and dot; *imagined:* your trial mass.

---

## 5. Part 3: The results (teal)

**Lead.** "These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the gold row follows your settings in Part 2."

**The learner's guesses beside the results** (guess only, no "matched"; a tag on the rows): "You guessed: more mass gives a **[larger / the same size / smaller]** ring (tag on Table 2, rows 'visible matter only' and 'the observed ring'). You guessed: four times the mass gives a ring **[four times / twice / about the same]** as wide (tag on Table 1, row (d))."

### Table 1: a check-up
| What we compare | Calculated here | Published | Reading |
|---|---|---|---|
| (a) The ring the visible matter alone would make against the observed ring | 18.2 arcseconds | 47 (a given value; about 50 in Broadhurst and others 2005) | less, by 28.8 |
| (b) The mass inside the observed ring, running the formula backward | 2.0 × 10¹⁴ solar masses | no outside value read | calculated here only |
| (c) The page's visible share against a share worked out from two papers | 15 percent | about 14.6 (Planck 2018 and Gonzalez and others 2013: worked out here) | more, by about 0.4 points |
| (d) Four times the visible mass against the visible-only ring | 36.4 arcseconds against 18.2 | none (a result of the formula) | calculated here only: exactly double |

**What this table tells us.** (a) *What it is:* the ring the cluster's stars and hot gas alone would make beside the ring astronomers see. *What it means:* 18.2 against 47: the real ring is 28.8 arcseconds wider, and 2.6 times as wide. *Why it matters:* a wider ring means more bending, so more mass than the visible matter. *How sure:* the 47 is a rounded value for Abell 1689 (about 50 in Broadhurst and others), so the gap is about 29 to 32. (b) *What it is:* the formula run backward. *What it means:* 2.0 × 10¹⁴ solar masses inside 47 arcseconds, which is 6.7 times the visible mass. *Why it matters:* it is the cluster's weight, found with no scale. *How sure:* no published value was read to compare. (c) *What it is:* the share of the cluster's mass that is stars and hot gas. *What it means:* Planck's numbers give the whole universe 15.7 percent ordinary matter (0.0224 ÷ 0.674² ÷ 0.315), and Gonzalez and others find big clusters 7 percent below that: 14.6. *Why it matters:* it sets the blue ring. *How sure:* my arithmetic on read numbers, not a quoted figure. (d) *What it is:* the ring for four times the visible mass. *What it means:* 36.4, exactly twice 18.2. *Why it matters:* it is the number behind guess 2. *How sure:* it is the formula, not a measurement.

### Table 2: the rings (the gold row follows your Part 2 mass)
| Ring | Your value (arcseconds) | Published value | How yours compares |
|---|---|---|---|
| Visible matter only (3.0 × 10¹³) | 18.2 | none: calculated here | not compared |
| **Your cluster** *(gold)* | *your ring* | 47 (given); about 50 (Broadhurst) | *less / more, by …* |
| The observed ring (2.0 × 10¹⁴) | 47.0 | about 50 (Broadhurst and others 2005) | *less than the published 50, by 3* |
| Four times the visible mass (imagined) | 36.4 | none: imagined | not compared |

**What this table tells us.** *What it is:* the rings for masses you can choose, beside the real one. *What it means:* a cluster needs about 6.7 times the visible mass (2.0 × 10¹⁴ against 3.0 × 10¹³) to make the ring astronomers see. *Why it matters:* the ring is a measurement of mass. *How sure:* the observed ring is a given, rounded value.

**What your numbers show** *(updates with your mass, in trial values).* "With a cluster of **[mass]** solar masses, your ring is **[radius]** arcseconds: **[less / more]** than the observed 47 by **[…]**, and **[x]** times the visible-only ring. **These are trial values and your own numbers. They do not say the real cluster is like that.**"

**Removed from Results (moved to the tutor, §12):** "so your prediction was right / off", "That is exactly twice as wide", "A simple calculation" (2.6 times as wide, 6.7 times the mass) and "A second line of evidence for dark matter". **Kept:** the numbers in the tables, "In the real world" (Abell 1689), and "What this model simplifies".

---

## 6. Part 4: The tutor (blue)

**Lead.** "The tutor asks you three questions about what you saw, then explains it and goes through your two guesses."

- **Observe:** "Compare the rings on the picture of the sky: the dashed blue ring (visible matter alone), the dotted green ring (the observed one) and, if you have used Part 2, your gold ring. Look at your white marks too: where did each sit against the real rings?"
- **Compare:** "You guessed that more mass would give **[a larger / the same size / a smaller]** ring (your white arrow or ring on the blue ring), and that four times the mass would give a ring **[four times / twice / about the same]** as wide (your white ring and point). What do you notice when you compare each white mark with the real rings and the violet imagined one?"
- **Conceptual (kept):** "The ring of the real cluster is much bigger than the one its visible matter would make. What might explain the difference?"
- **Explanation:** the seven approved points are kept as written, with changes: (i) each guess is marked in its point (point 1/2 start "You guessed [X] (the white …): that **[is / is not]** what you guessed", from the module); (ii) the worked "6.7 times the visible mass" and "second line of evidence" stay here, with the 15 percent described as worked out from Planck and Gonzalez and others; (iii) point 6 now says lensing shows how much mass there is and where, "and no source read here says what dark matter is made of"; (iv) the Bullet Cluster is named in "not covered" with the sources (Chandra 2006; Clowe and others 2006: "the majority of the matter in the system is unseen"); (v) the cross-references use the sidebar names.

---

## 7. Words and formulas (collapsed box above Part 1)
**Entries (plain meaning each):** galaxy cluster; gravitational lensing; lens; source; Einstein ring; arc; multiple images; strong lensing ("a lens strong enough to make rings, arcs or several images"); weak lensing ("tiny stretches in the shapes of many galaxies; not covered here"); microlensing ("lensing by a single star; not covered"); arcsecond; arcminute; degree; solar mass; megaparsec (Mpc); light-year; visible matter; dark matter; Hubble tension.
**Formulas with worked examples:** the arcsecond (1 degree = 3,600 arcseconds; a 1 cm coin at 2.06 km); the real bending angle 4GM ÷ (c² b) with a worked case. **Held back until after the run (§12):** the ring formula θ = √(4GM/c² × D_ls ÷ (D_l × D_s)) and its square root (it gives guess 2's answer away) and the mass inside the ring.

---

## 8. Source table (for the specification's "Audit Update")
| Idea or number | Source | Read? | Date |
|---|---|---|---|
| Lensing definition; "magnifying and distorting"; 1919 eclipse (Sobral, Príncipe) | NASA Hubble, "Gravitational lenses" (6 Aug 2026) | read (helper) | 2026-11-15 |
| Lensing as a curved-space bend, "as if by a lens" | ESA/Hubble wordbank | read (helper) | 2026-11-15 |
| Abell 1689: 2.2 billion light-years; 135 images of 42 galaxies; about 1,000 galaxies | ESA/Hubble opo1037a (2010) | read (helper) | 2026-11-15 |
| Abell 1689 as a lens "2-million-light-year-wide" | NASA, "Biggest zoom lens in space" | read (helper) | 2026-11-15 |
| 106 images of 30 galaxies; z = 0.18; Einstein radius "approximately 50″" | Broadhurst and others 2005 | abstract and part of the text read (helper) | 2026-11-15 |
| One arcsecond is 1/3600th of a degree | IAU OAE glossary | read (helper) | 2026-11-15 |
| NGC 6505 ring: 590 million and 4.42 billion light-years | ESA, 10 Feb 2025 | read (helper) | 2026-11-15 |
| About 500 candidates; about 100,000 expected | ESA, 19 Mar 2025 | read (helper) | 2026-11-15 |
| Cosmic Gems arc; parsec scales; 460 million years | ESA/Webb weic2418 | read (helper) | 2026-11-15 |
| 250,000 galaxies; weak-lensing map | COSMOS, 10 Feb 2026 | read (helper) | 2026-11-15 |
| Bullet Cluster: nearly all matter is dark | Chandra 2006; Clowe and others 2006 | read (helper) | 2026-11-15 |
| Cluster baryon fractions about 7 percent below universal | Gonzalez and others 2013, abstract | read (helper) | 2026-11-15 |
| Ω_b h² 0.0224, H0 67.4, Ω_m 0.315 | Planck 2018 VI, abstract | read | 2026-11-15 |
| Space telescopes 70 to 76, CMB 67 to 68 | NASA Hubble constant and tension | read for Cosmology 6 | 2026-11-15 |
| 47 arcseconds published; 1.9 × 10¹⁴ within 45 arcseconds; "about 15 percent visible" | none read | **gap: constants kept as given; 15 percent worked out here** | 2026-11-15 |
| First lens (1979 Twin Quasar) | Walsh, Carswell and Weymann | **did not load; not stated** | 2026-11-15 |
| Lensing "does not say what dark matter is" | none | **gap** | 2026-11-15 |

## Questions for the owner on this draft
A. **47 and 1.9 × 10¹⁴.** Default as drafted: keep the constants (47 arcseconds, 2.0 × 10¹⁴), say published estimates are about 47 to 50 (Broadhurst and others: "approximately 50") and show Table 2's observed-ring row beside "about 50". Say if you want the constant changed to 50 (a physics decision) or the 50 left out.
B. **The 15 percent.** Default: keep it and word it as worked out here from Planck and Gonzalez and others (about 15.7 and 14.6 percent).
C. **Imagined ring and violet colour.** Default: violet "imagined" ring at 36.4 arcseconds and a violet graph point (guess 2's real counterpart), drawn after the run beside the white ones.
D. **Links after the run.** Default: the Bullet Cluster, Gonzalez and Planck links wait for the run because they say that most of a cluster's mass is dark.
E. **The first lens (1979).** Default: not stated, because the paper was not read.
F. **Wine glass, square garden, shelf sag.** Default: kept as everyday comparisons, labelled as not sourced.

## What the module will need (for the physics step; tests first)
New functions in `gravitationalLensingExperiment.ts`, each with tests, none changing an existing physics function: the actual answers (`actualRingSize`, `actualFourTimes`) and matching; guess marks (guess 1's arrow on the visible-only ring; guess 2's ring radius at 1, 2 or 4 times the visible-only ring and the graph point); the imagined ring and point (four times the visible mass: `einsteinRingArcseconds(4 × visible)`); tutor marking; the check-up rows (a) to (d) and the "less / more / the same" readings; Table 2's comparison columns and the "What your numbers show" values; the worked examples (the coin, the 15 percent, the ring formula's steps); published constants (Planck's Ω_b h² and Ω_m, Gonzalez's 7 percent, Broadhurst's 50, the NASA Hubble ranges). A new `GravitationalLensingExperiment.test.tsx` covers the interface.

## Not checked
Not built, not run, not viewed in a browser; the wording is not yet approved; every source was read through helper summaries and must be re-read against the live pages before printing; the Planck and Gonzalez arithmetic (15.7 and 14.6 percent) is mine and is to be put in a test; the worked numbers (18.2, 47.0, 28.8, 2.6, 36.4, 72.9, 54.9) were worked by hand with node from the module's formula and are to be rechecked in the module; the Words and formulas box's other entries are listed but not written out.


---

## Addendum, 2026-11-15 (owner's request: more clarity in step 4 of the introduction, and add NASA or Hubble pictures where possible)

**Step 4, rewritten.** The first paragraph (a perfect line-up gives a ring) is kept. The sentence "If the line-up is slightly off, the ring breaks into pieces: bright arcs, or several separate images of the same galaxy. Real clusters usually do this. ESA/Hubble counted 135 lensed images of 42 background galaxies in Abell 1689 alone." is replaced by a new paragraph **"When the line-up is not perfect"** with four bullets: **Arcs** (a piece of the ring; the light is stretched along the ring, so a roundish galaxy becomes a long thin curve); **Several separate images** (light from one galaxy reaches us by more than one route round the cluster, so the same galaxy appears in two, three, four or more places; copies of one galaxy, not different galaxies; NASA's Hubble page shows one galaxy split into five); **A worked example** (135 ÷ 42 ≈ 3.2, so on average each of those galaxies shows up about three times in that one picture); **Why this experiment draws only a ring** (a perfect line-up and a round cluster give one number, the ring's radius; arcs and several images need a detailed model of the lumpy cluster). The wine-glass picture gains: "Move your head a little to the side and the ring breaks into bright arcs and spots: that is what an imperfect line-up does." A **schematic drawn for this page** (two skies: a complete ring, and arcs with separate images) follows, captioned as a schematic and not a photograph.

**Four real pictures added** (copied into `public/images/lensing/`; each with alt text, a caption, the full credit, a source link and its licence; found and checked by a helper, 2026-11-15, and viewed by Claude):
1. **NASA, "Gravitational Lensing Diagram"** (after step 3): a ray diagram with a distant galaxy, a cluster and Earth; the caption says what the unlabelled diagram shows, from NASA's own description. Credit: NASA, ESA, Ann Feild (STScI), Frank Summers (STScI). NASA images are generally not subject to copyright (NASA brand centre). Shown smaller; no other change.
2. **ESA/Hubble, potw1151a, the Cosmic Horseshoe** (after the ring paragraph): a nearly complete Einstein ring round a massive red galaxy. The caption says the lens here is a single galaxy, not a cluster. CC BY 4.0. **Cropped** to the area round the ring, and the credit says so. Credit: ESA/Hubble & NASA.
3. **ESA/Hubble, opo9610a, cluster 0024+1654:** blue loop-shaped streaks that are multiple images of one galaxy. CC BY 4.0. Credit: W.N. Colley and E. Turner (Princeton University), J.A. Tyson (Bell Labs, Lucent Technologies) and NASA / ESA.
4. **NASA, Abell 1689 (2003, Hubble ACS):** a cluster with many thin arcs; the caption uses NASA's wording ("10 times more arcs than a ground-based telescope", a lens about 2 million light-years wide). Credit: NASA, N. Benitez (JHU), T. Broadhurst, H. Ford (JHU), M. Clampin (STScI), G. Hartig (STScI), G. Illingworth (UCO/Lick Observatory), the ACS Science Team and ESA. NASA images are generally not subject to copyright; shown smaller; no other change.

**Not used, and why.** ESA's Euclid image of the NGC 6505 ring: no credit line or licence was found on the page text read, so it was not copied (the intro still describes it in words and links the page). ESA/Hubble opo1037a (Abell 1689 with a blue dark-matter map painted over it): an overlay that would reveal the dark-matter conclusion before the run. The Einstein Cross (opo9020a): a lower-quality 1990 image, kept as a spare.

**Open.** The NASA image licences were read on NASA's general "images and media" page, not on a page specific to each image (the NASA page for the diagram and for Abell 1689 marks no third-party copyright). The five-image claim comes from NASA's lensing page and is not attached to any of the four pictures. Not checked: how the pictures look at narrow width, in dark mode and in other browsers.
