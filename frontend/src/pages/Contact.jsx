import { useState } from 'react';

const CONTACT_LINKS = [
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/uvmaero/', text: '@uvmaero' },
  { label: 'FACEBOOK', href: 'https://www.facebook.com/UVMAERO/', text: 'facebook.com/UVMAERO' },
  { label: 'X', href: 'https://x.com/uvmaero', text: 'x.com/uvmaero' },
  {
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/company/uvm-alternative-racing-organization/',
    text: 'UVM Alternative Energy Racing Organization',
  },
];

// `website` is a honeypot: hidden from people, so only bots fill it in.
const initialForm = { name: '', email: '', org: '', message: '', website: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      setForm(initialForm);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="pt-[65px] bg-foreground">
      <section className="bg-foreground text-background py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2
              className="font-black uppercase leading-none text-background mb-8 font-display"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.02em' }}
            >
              LET'S
              <br />
              TALK.
            </h2>
            <div className="space-y-4" style={{ fontSize: '0.75rem' }}>
              {CONTACT_LINKS.map((link) => (
                <div key={link.label} className="flex gap-8 items-baseline border-b border-background/15 pb-4">
                  <span className="text-background/40 w-24 shrink-0 tracking-widest">{link.label}</span>
                  <a href={link.href} className="text-background hover:text-accent transition-colors">
                    {link.text}
                  </a>
                </div>
              ))}
              <div className="flex gap-8 items-baseline border-b border-background/15 pb-4">
                <span className="text-background/40 w-24 shrink-0 tracking-widest">LOCATION</span>
                <span className="text-background">Votey Hall, Room 118 — University of Vermont, Burlington VT</span>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange('website')}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-background/50 mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                YOUR NAME
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                className="w-full bg-transparent border border-background/20 px-4 py-3 text-background placeholder-background/30 focus:outline-none focus:border-accent transition-colors text-sm"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-background/50 mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                className="w-full bg-transparent border border-background/20 px-4 py-3 text-background placeholder-background/30 focus:outline-none focus:border-accent transition-colors text-sm"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label htmlFor="org" className="block text-background/50 mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                ORGANIZATION / COMPANY
              </label>
              <input
                id="org"
                type="text"
                value={form.org}
                onChange={handleChange('org')}
                className="w-full bg-transparent border border-background/20 px-4 py-3 text-background placeholder-background/30 focus:outline-none focus:border-accent transition-colors text-sm"
                placeholder="Enter organization / company"
              />
            </div>
            <div>
              <label htmlFor="msg" className="block text-background/50 mb-1" style={{ fontSize: '0.62rem', letterSpacing: '0.18em' }}>
                MESSAGE
              </label>
              <textarea
                id="msg"
                rows="4"
                required
                value={form.message}
                onChange={handleChange('message')}
                className="w-full bg-transparent border border-background/20 px-4 py-3 text-background placeholder-background/30 focus:outline-none focus:border-accent transition-colors text-sm resize-none"
                placeholder="Tell us about your interest..."
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-4 bg-accent text-black font-black text-sm uppercase tracking-widest border-2 border-accent hover:bg-foreground hover:border-background transition-colors duration-150 font-display disabled:opacity-60"
              style={{ letterSpacing: '0.15em', fontSize: '1rem' }}
            >
              {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
            </button>
            {status === 'sent' && (
              <p className="text-accent text-sm">Thanks — your message has been sent.</p>
            )}
            {status === 'error' && (
              <p className="text-sm" style={{ color: '#b3261e' }}>
                Something went wrong sending your message. Please try again later.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
