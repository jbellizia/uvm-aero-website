import { useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import Tabs from '../components/Tabs.jsx';
import { colors } from '../theme/tokens.js';

const SOCIAL_LINKS = [
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/uvmaero/' },
  { label: 'FACEBOOK', href: 'https://www.facebook.com/UVMAERO/' },
  { label: 'X', href: 'https://x.com/uvmaero' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/company/uvm-alternative-racing-organization/' },
];

function PhotoGrid({ photos, onOpen }) {
  return (
    // Per-cell borders rather than a border-colored gap, so a part-filled last row shows the page background.
    <div className="grid grid-cols-2 md:grid-cols-4 border-l border-t border-border">
      {photos.map((photo, index) => (
        <button
          key={photo.thumb}
          onClick={() => onOpen(index)}
          className="block aspect-[4/3] bg-card overflow-hidden border-r border-b border-border"
          aria-label={`Open photo: ${photo.alt}`}
        >
          <img
            src={photo.thumb}
            alt={photo.alt}
            loading="lazy"
            className="w-full h-full object-cover hover:opacity-80 transition-opacity duration-150"
          />
        </button>
      ))}
    </div>
  );
}

export default function Media() {
  const [years, setYears] = useState(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(null); // { year, index } while the lightbox is showing

  useEffect(() => {
    fetch('/api/media')
      .then((res) => {
        if (!res.ok) throw new Error('request failed');
        return res.json();
      })
      .then(setYears)
      .catch(() => setError(true));
  }, []);

  const openYear = open && years.find((y) => y.year === open.year);

  let body;
  if (error) {
    body = <p className="text-muted text-sm">Photos couldn't be loaded right now. Please try again later.</p>;
  } else if (!years) {
    body = (
      <p className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}>
        LOADING PHOTOS…
      </p>
    );
  } else if (years.length === 0) {
    body = (
      <div>
        <p className="text-muted text-sm leading-relaxed mb-6">
          Our photo archive is on its way. In the meantime, follow along on social media.
        </p>
        <div className="flex flex-wrap gap-6" style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-accent hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    );
  } else {
    body = (
      <Tabs
        wrap
        tabs={years.map((y) => ({ key: y.year, label: y.year }))}
        panels={years.map((y) => ({
          key: y.year,
          content: <PhotoGrid photos={y.photos} onOpen={(index) => setOpen({ year: y.year, index })} />,
        }))}
      />
    );
  }

  return (
    <div className="pt-[65px]">
      <section className="bg-background py-24 px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <h2
              className="font-black uppercase leading-none font-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}
            >
              MEDIA
            </h2>
          </div>

          {body}
        </div>
      </section>

      <Lightbox
        open={Boolean(openYear)}
        close={() => setOpen(null)}
        index={open?.index ?? 0}
        slides={(openYear?.photos ?? []).map((photo) => ({
          src: photo.full,
          alt: photo.alt,
          description: photo.alt,
        }))}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: 'center' }}
        styles={{
          container: { backgroundColor: `${colors.background}f2` },
          captionsDescriptionContainer: { backgroundColor: `${colors.background}cc` },
          captionsDescription: { color: colors.foreground, fontSize: '0.8rem', letterSpacing: '0.08em' },
          button: { color: colors.foreground, filter: 'none' },
        }}
      />
    </div>
  );
}
