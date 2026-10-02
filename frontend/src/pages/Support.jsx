import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SpecTable from '../components/SpecTable.jsx';
import Tabs from '../components/Tabs.jsx';

const GIVE_URL = 'https://www.givecampus.com/campaigns/57653/donations/new?a=10657647&designation=aero';

function formatMoney(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Values are numbers, or null when not yet known. The total is only shown once every item is known.
function BudgetTable({ items }) {
  const rows = items.map((item) => ({ label: item.label, value: item.value == null ? '—' : formatMoney(item.value) }));
  const complete = items.every((item) => typeof item.value === 'number');
  // Sum the rounded values so the total matches the rows as displayed.
  const total = items.reduce((sum, item) => sum + Math.round(item.value ?? 0), 0);
  return (
    <>
      <SpecTable rows={rows} labelSize="0.68rem" />
      <div className="flex justify-between items-baseline py-4 gap-4 border-t-2 border-accent mt-1">
        <span className="text-foreground font-bold shrink-0" style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
          TOTAL
        </span>
        <span className="text-accent text-sm font-bold text-right">{complete ? formatMoney(total) : '—'}</span>
      </div>
    </>
  );
}

export default function Support() {
  const [donationData, setDonationData] = useState(null);
  const [budget, setBudget] = useState(null);
  const [site, setSite] = useState(null);

  useEffect(() => {
    fetch('/api/donations')
      .then((res) => res.json())
      .then(setDonationData)
      .catch(() => setDonationData(null));
    fetch('/api/budget')
      .then((res) => res.json())
      .then(setBudget)
      .catch(() => setBudget(null));
    fetch('/api/site')
      .then((res) => res.json())
      .then(setSite)
      .catch(() => setSite(null));
  }, []);

  const cash = donationData ? donationData.donations.filter((d) => d.method !== 'in-kind') : [];
  const total = cash.reduce((sum, d) => sum + d.amount, 0);
  const goal = donationData?.goal ?? 0;
  const pct = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  const budgetTabs = [
    { key: 'build', label: 'Build Season' },
    { key: 'comp', label: 'Competition' },
  ];

  const budgetPanels = budget
    ? [
        { key: 'build', content: <BudgetTable items={budget.build.items} /> },
        { key: 'comp', content: <BudgetTable items={budget.competition.items} /> },
      ]
    : [];

  return (
    <div>
      <section className="relative pt-40 pb-16 px-6 border-b border-border overflow-hidden">
        <div className="relative z-10 mb-6 inline-block" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>
          <span className="border border-accent text-accent px-3 py-1">SUPPORT THE 2026&ndash;27 BUILD</span>
        </div>

        <h1
          className="font-black uppercase leading-none font-display"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', letterSpacing: '-0.02em', lineHeight: 0.9 }}
        >
          SUPPORT OUR
          <br />
          <span className="stroke-accent">BUILD.</span>
        </h1>

        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <p className="text-muted max-w-sm leading-relaxed" style={{ fontSize: '0.95rem' }}>
            Student engineering projects like this are not possible without external support. Here's where the money
            goes, and how to be part of it.
          </p>
          <a
            href="#donate"
            className="group flex items-center gap-3 bg-foreground text-background px-6 py-3 font-bold text-sm uppercase tracking-widest hover:bg-accent hover:text-foreground transition-colors duration-150"
          >
            GIVE NOW
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </section>

      <section className="bg-foreground text-background py-24 px-6 border-b-4 border-accent">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <span className="text-background/40 block mb-4" style={{ fontSize: '0.68rem', letterSpacing: '0.2em' }}>
              01 / WHY IT MATTERS
            </span>
            <h2
              className="font-black uppercase leading-none text-background font-display"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)', letterSpacing: '-0.02em' }}
            >
              EVERY
              <br />
              DONATION
              <br />
              COUNTS.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 pt-0 md:pt-16">
            <p className="text-background/80 leading-relaxed text-lg">
              Your support directly funds the motor and motor controller, battery pack and BMS, chassis materials,
              and the trip to compete at Formula Hybrid+Electric.
            </p>
            <p className="text-background/60 leading-relaxed">AERO is a UVM student club, not a separate nonprofit.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-background/20 mt-8">
              <div className="py-6 px-4 text-center border-b sm:border-b-0 sm:border-r border-background/20">
                <div className="font-black text-background font-display" style={{ fontSize: '1.5rem', lineHeight: 1.3 }}>
                  {donationData ? formatMoney(total) : '—'}
                </div>
                <div className="text-background/50 text-xs tracking-widest mt-1">RAISED</div>
              </div>
              <div className="py-6 px-4 text-center border-b sm:border-b-0 sm:border-r border-background/20">
                <div className="font-black text-background font-display" style={{ fontSize: '1.5rem', lineHeight: 1.3 }}>
                  {donationData ? formatMoney(goal) : '—'}
                </div>
                <div className="text-background/50 text-xs tracking-widest mt-1">GOAL</div>
              </div>
              <div className="py-6 px-4 text-center">
                <div className="font-black text-background font-display" style={{ fontSize: '1.5rem', lineHeight: 1.3 }}>
                  {donationData ? cash.length : '—'}
                </div>
                <div className="text-background/50 text-xs tracking-widest mt-1">DONORS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="budget" className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <h2
              className="font-black uppercase leading-none font-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              WHERE IT GOES
            </h2>
            <span className="text-muted pb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.15em' }}>
              02 / BUDGET
            </span>
          </div>

          {budget && <Tabs tabs={budgetTabs} panels={budgetPanels} className="max-w-2xl" />}

          <p className="text-muted leading-relaxed text-sm mt-8 max-w-2xl border-t border-border pt-8">
            Build-season costs cover parts and tooling for design and fabrication. Competition costs covers
            registration, shipping the car, and lodging.
          </p>
        </div>
      </section>

      <section id="donate" className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <h2
              className="font-black uppercase leading-none font-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              GIVE
            </h2>
            <span className="text-muted pb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.15em' }}>
              03 / DONATE
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-4" style={{ fontSize: '0.8rem' }}>
              <div className="flex gap-8 items-baseline border-b border-border pb-4">
                <span className="text-muted w-28 shrink-0 tracking-widest" style={{ fontSize: '0.68rem' }}>
                  ONLINE
                </span>
                <a href={GIVE_URL} className="text-foreground hover:text-accent transition-colors">
                  Give via UVM Foundation &rarr;
                </a>
              </div>
              <div className="flex gap-8 items-baseline border-b border-border pb-4">
                <span className="text-muted w-28 shrink-0 tracking-widest" style={{ fontSize: '0.68rem' }}>
                  BY CHECK
                </span>
                <span className="text-foreground leading-relaxed">
                  {site && (
                    <>
                      Payable to "{site.checkPayableTo}"
                      <br />
                      Memo: "{site.checkMemo}"
                      <br />
                      {site.checkAddress}
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-8 items-baseline border-b border-border pb-4">
                <span className="text-muted w-28 shrink-0 tracking-widest" style={{ fontSize: '0.68rem' }}>
                  SPONSORSHIP
                </span>
                <Link to="/sponsors" className="text-foreground hover:text-accent transition-colors">
                  View sponsors &rarr;
                </Link>
              </div>
              <div className="flex gap-8 items-baseline pb-4">
                <span className="text-muted w-28 shrink-0 tracking-widest" style={{ fontSize: '0.68rem' }}>
                  QUESTIONS
                </span>
                {site && (
                  <a href={`mailto:${site.questionsEmail}`} className="text-foreground hover:text-accent transition-colors">
                    {site.questionsEmail}
                  </a>
                )}
              </div>
            </div>

            <div className="border border-accent p-8">
              <p className="text-accent mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}>
                2026&ndash;27 ADVANCEMENT FUND
              </p>
              <div className="text-foreground font-semibold text-lg mb-4">
                {donationData ? `${formatMoney(total)} of ${formatMoney(goal)} raised` : '—'}
              </div>
              <div className="w-full h-2 bg-card border border-border overflow-hidden mb-8">
                <div className="progress-fill h-full bg-accent" style={{ width: `${pct}%` }} />
              </div>

              <ul className="divide-y divide-border" style={{ fontSize: '0.78rem' }}>
                {donationData &&
                  donationData.donations.map((d, i) => (
                    <li key={i} className="py-3 flex justify-between items-baseline gap-4">
                      <span className="text-foreground truncate">
                        {d.donor}
                        {d.memo && <span className="text-muted"> &middot; {d.memo}</span>}
                      </span>
                      <span className="text-accent font-bold shrink-0">{formatMoney(d.amount)}</span>
                    </li>
                  ))}
              </ul>

              <a
                href={GIVE_URL}
                className="mt-8 block text-center px-8 py-3 bg-accent text-black font-bold text-sm uppercase tracking-widest hover:bg-foreground transition-colors duration-150"
              >
                DONATE NOW
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
