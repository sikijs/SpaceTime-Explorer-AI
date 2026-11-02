// The Cosmic Horizons group's closing recap ("The Frontier recap"). It adds no physics and no controls: it sorts the group's twenty-four
// results by the four status labels each experiment already carries. Every figure comes from `frontierClaims`, which reads it from the
// earlier experiment's own module, so it cannot drift from what the learner saw. See docs/experiments/cosmic-horizons/closing-recap.md
// (approved with defaults on 2026-11-02). The wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1).
import { STATUS_LABELS, claimsWithLabel, displayNumber, frontierClaims, frontierFacts, labelCounts } from '../physics/frontierRecap'
import type { Claim, StatusLabel } from '../physics/frontierRecap'

const textStyle = { fontSize: '0.9375rem', lineHeight: 1.6 } as const

const group = (n: number, decimals: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

function figureText(claim: Claim): string {
  const f = claim.figure
  if (!f) return ''
  const unit = f.unit ? ` ${f.unit}` : ''
  const value = f.high !== undefined ? `${group(f.value, f.decimals)} to ${group(f.high, f.decimals)}` : group(f.value, f.decimals)
  return ` (${f.what}: ${value}${unit})`
}

const LABEL_MEANINGS: Record<StatusLabel, { meaning: string; example: string }> = {
  Settled: {
    meaning: 'many independent measurements, made in different ways, agree.',
    example: 'a clock higher up ticks faster (Experiment 9).',
  },
  'Strong evidence': {
    meaning: 'one clear result that experts widely accept, but not yet confirmed many different ways.',
    example: 'the black hole after a merger ended with a larger total surface area than the two before (Experiment ' + displayNumber(18) + ').',
  },
  Contested: {
    meaning: 'the data are real, but experts disagree about what they mean.',
    example: 'two ways of measuring how fast the universe expands disagree (Experiment 1).',
  },
  Open: {
    meaning: 'we do not know yet.',
    example: 'what the little red dots are (Experiment ' + displayNumber(23) + ').',
  },
}

export function FrontierRecap() {
  const counts = labelCounts()
  const total = frontierClaims().length
  const facts = frontierFacts()

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem', ...textStyle }}>
      <h2 style={{ marginTop: 0 }}>Putting It All Together: What Is Settled, What Is Contested, What Is Open?</h2>
      <p>
        You have now run twenty-four experiments about results from the last few years. Each one carried a label saying how settled it is.
        This section puts them side by side. It adds nothing new: every number below is one you have already seen, and everything is “as of
        November 2026”.
      </p>

      <h3>1. The four labels, in plain words</h3>
      <ul>
        {STATUS_LABELS.map((label) => (
          <li key={label}>
            <strong>{label}</strong> means {LABEL_MEANINGS[label].meaning} Example: {LABEL_MEANINGS[label].example}
          </li>
        ))}
      </ul>
      <p>
        One experiment can hold more than one label. A result can be strong while what it means is still open. Experiment {displayNumber(17)} is an example:
        the star’s fading is strong evidence, what it became is contested, and how often stars do this is open.
      </p>

      <h3>Words used in the lists below</h3>
      <ul>
        <li>
          <strong>Sigma</strong> says how big a gap or a hint is, counted in “give-or-takes” (how far a measured number might be off). The larger the sigma, the less likely it is to be chance. About 3 sigma is a hint, and 5 sigma is the level usually asked for before calling something a discovery.
        </li>
        <li>
          <strong>Redshift</strong> says how much the expansion of the universe has stretched a galaxy’s light. The higher the redshift, the farther away the galaxy is and the earlier in the universe we see it.
        </li>
        <li>
          <strong>Microarcsecond</strong> is a millionth of an arcsecond, a tiny angle in the sky. An arcsecond is itself a 3,600th of a degree.
        </li>
        <li>
          <strong>Names</strong> such as SH0ES, DESI, NANOGrav, JILA and KiDS are the teams, surveys and instruments the experiments introduced. Each experiment’s page says what they are.
        </li>
      </ul>

      <h3>2. What the group found, by label</h3>
      <p>
        The twenty-four experiments hold {total} separate findings between them:{' '}
        {counts.map((c, i) => `${c.claims} ${c.label.toLowerCase()}${i < counts.length - 2 ? ', ' : i === counts.length - 2 ? ' and ' : '.'}`).join('')}{' '}
        This is a count of findings, not a ranking of experiments.
      </p>
      {STATUS_LABELS.map((label) => (
        <div key={label}>
          <h4 style={{ marginBottom: '0.25rem' }}>{label}</h4>
          <ul style={{ marginTop: 0 }}>
            {claimsWithLabel(label).map((c) => (
              <li key={`${c.experiment}-${c.claim}`}>
                <strong>Experiment {displayNumber(c.experiment)}.</strong> {c.claim}
                {figureText(c)}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3>3. What moves a result from one label to another</h3>
      <ul>
        <li>
          <strong>A second independent method.</strong> A clock higher up ticking faster is settled because it was seen across a height of{' '}
          {facts.jilaMillimetres} millimetre in the laboratory and, in field tests, across hundreds of metres (Experiment 9).
        </li>
        <li>
          <strong>A bigger “sigma”.</strong> A hint at about 3 sigma can fade or grow. DESI’s hint about dark energy sits at {facts.desiSigmaLow} to{' '}
          {facts.desiSigmaHigh} sigma (Experiment 2), and the pulsar-timing hum at about {facts.pulsarSigmaLow} to {facts.pulsarSigmaHigh} sigma, not yet 5
          (Experiment {displayNumber(22)}).
        </li>
        <li>
          <strong>A tension that goes away.</strong> KiDS’s lumpiness tension went away with a larger survey; the Dark Energy Survey’s has not
          (Experiment 3).
        </li>
        <li>
          <strong>A better measurement of the same thing.</strong> ALPHA-g’s {facts.antimatterRatio} ± {facts.antimatterPlusMinus.toFixed(2)} of g is a single measurement
          with a wide give-or-take. Its team plans upgrades, and other experiments at CERN aim at the same question by different methods, so a more
          precise measurement is planned (Experiment 8).
        </li>
      </ul>

      <h3>4. This page is a snapshot</h3>
      <p style={{ marginBottom: 0 }}>
        Everything here is “as of November 2026”. Each experiment’s own page says “as of October 2026”, the date it was written. Some findings
        may have moved since, and the “Want to know more?” list on each experiment’s page links to the papers and the official pages, so you
        can check for yourself. This page did not check that no newer result exists for every experiment: each experiment’s own page says what
        was and was not checked.
      </p>
    </div>
  )
}
