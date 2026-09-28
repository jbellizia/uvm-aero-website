import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/car', label: 'Car' },
  { to: '/team', label: 'Team' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onSupport = pathname === '/support';
  const donateHref = onSupport ? '#donate' : '/support';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <Link to="/" aria-label="UVM AERO home">
          <img src="/logo.png" alt="UVM AERO Formula Motorsport" className="h-10 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8" style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'text-accent' : 'text-muted hover:text-foreground transition-colors duration-150'
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href={donateHref}
            className="ml-4 px-4 py-2 bg-accent text-foreground font-bold hover:bg-foreground hover:text-background transition-colors duration-150"
          >
            DONATE
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-foreground text-2xl leading-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-start justify-center px-8 gap-6 border-r-4 border-accent font-display">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-5xl font-black uppercase transition-colors ${
                  isActive ? 'text-accent' : 'text-foreground hover:text-accent'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href={donateHref}
            onClick={() => setOpen(false)}
            className={`text-5xl font-black uppercase transition-colors ${
              onSupport ? 'text-accent' : 'text-accent hover:text-foreground'
            }`}
          >
            Donate
          </a>
        </div>
      )}
    </>
  );
}
