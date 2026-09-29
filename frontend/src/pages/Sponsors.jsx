import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    fetch('/api/sponsors')
      .then((res) => res.json())
      .then(setSponsors)
      .catch(() => setSponsors([]));
  }, []);

  return (
    <div className="pt-[65px]">
      <section className="bg-background py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <h2
              className="font-black uppercase leading-none font-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              PARTNERS
            </h2>
          </div>

          <div
            className="relative overflow-hidden border border-border py-8"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            <div className="marquee-track flex gap-16 items-center">
              {[...sponsors, ...sponsors].map((sponsor, i) => (
                <span
                  key={i}
                  aria-hidden={i >= sponsors.length ? 'true' : undefined}
                  className="font-black text-muted shrink-0 font-display"
                  style={{ fontSize: '1.2rem', letterSpacing: '0.08em' }}
                >
                  {sponsor.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 border border-accent p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-accent mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}>
                BECOME A PARTNER
              </p>
              <p className="text-foreground font-semibold text-lg">Support the next generation of motorsport engineers.</p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 px-8 py-3 bg-accent text-black font-bold text-sm uppercase tracking-widest hover:bg-foreground transition-colors duration-150"
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
