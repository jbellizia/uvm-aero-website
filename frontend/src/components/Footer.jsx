const SOCIAL_LINKS = [
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/uvmaero/' },
  { label: 'FACEBOOK', href: 'https://www.facebook.com/UVMAERO/' },
  { label: 'X', href: 'https://x.com/uvmaero' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/company/uvm-alternative-racing-organization/' },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <img src="/logo.png" alt="UVM AERO Formula Motorsport" className="h-12 w-auto" />
        <span className="text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.15em' }}>
          © 2026 AERO — ALTERNATIVE ENERGY RACING ORGANIZATION — UNIVERSITY OF VERMONT
        </span>
        <div className="flex gap-6" style={{ fontSize: '0.62rem', letterSpacing: '0.12em' }}>
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-muted hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
