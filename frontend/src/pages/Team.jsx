import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Team() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  return (
    <div className="pt-[65px]">
      <section className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <h2
              className="font-black uppercase leading-none font-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              THE TEAM
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border border border-border">
            {team.map((member) => (
              <div key={member.name} className="p-6 bg-background hover:bg-card transition-colors duration-150">
                <div className="w-full aspect-square bg-card border border-border mb-4 overflow-hidden">
                  <img
                    src={`/${member.image}`}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 25%' }}
                  />
                </div>
                <div className="text-accent mb-2" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>
                  {member.category}
                </div>
                <div className="font-semibold text-foreground text-sm leading-tight mb-1">{member.name}</div>
                <div className="text-muted text-xs leading-relaxed">{member.role}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="/contact"
              className="group flex items-center gap-2 text-accent font-semibold text-sm uppercase tracking-widest hover:text-foreground transition-colors"
              style={{ fontSize: '0.7rem' }}
            >
              JOIN THE TEAM
              <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
