import { Link } from 'react-router-dom';

const EXPLORE_LINKS = [
  { to: '/car', label: 'Car' },
  { to: '/team', label: 'Team' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/contact', label: 'Contact' },
];

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen flex flex-col justify-end pt-24 pb-16 px-6 overflow-hidden" style={{ background: '#050a06' }}>
        <div className="absolute inset-0">
          <img src="/aeroinsta-1.jpg" alt="UVM AERO racecar" className="w-full h-full object-cover opacity-20" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #050a06 40%, rgba(5,10,6,0.5) 70%, transparent 100%)' }}
          />
        </div>

        <div className="relative z-10 mb-6 inline-block" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>
          <span className="border border-accent text-accent px-3 py-1">ALTERNATIVE ENERGY RACING ORGANIZATION — UVM</span>
        </div>

        <div className="relative z-10">
          <h1
            className="font-black uppercase leading-none font-display"
            style={{ fontSize: 'clamp(5rem, 18vw, 18rem)', letterSpacing: '-0.02em', lineHeight: 0.88 }}
          >
            AERO
            <br />
            <span className="text-accent">RACING</span>
            <br />
            <span className="stroke-foreground">FSAE-'26</span>
          </h1>
        </div>

        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 opacity-50">
          <span className="text-foreground" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', writingMode: 'vertical-rl' }}>
            SCROLL
          </span>
          <span className="text-foreground animate-bounce">▾</span>
        </div>
      </section>

      <section className="bg-foreground text-background py-24 px-6 border-b-4 border-accent">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <h2
              className="font-black uppercase leading-none text-background font-display"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.02em' }}
            >
              STUDENT BUILT.
              <br />
              <br />
              STUDENT DRIVEN.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 pt-0 md:pt-16">
            <p className="text-background/80 leading-relaxed text-lg">
              AERO — the Alternative Energy Racing Organization — is a student-run club at the University of
              Vermont. We design and build electric open-wheel racecars to compete at Formula Hybrid+Electric, an
              international collegiate competition.
            </p>
            <p className="text-background/60 leading-relaxed">
              Members apply engineering knowledge outside the classroom, gaining CAD, welding, soldering, and other
              hands-on experience — supported by a team that's always willing to help.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
          {EXPLORE_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group bg-background hover:bg-card transition-colors duration-150 p-8 flex items-center justify-between"
            >
              <span className="font-black uppercase font-display" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                {link.label}
              </span>
              <span className="text-accent text-4xl leading-none inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
