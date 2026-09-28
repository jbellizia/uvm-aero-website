import { useEffect, useState } from 'react';
import SpecTable from '../components/SpecTable.jsx';
import Tabs from '../components/Tabs.jsx';

export default function Car() {
  const [specs, setSpecs] = useState(null);

  useEffect(() => {
    fetch('/api/car-specs')
      .then((res) => res.json())
      .then(setSpecs)
      .catch(() => setSpecs(null));
  }, []);

  const tabs = [
    { key: 'specs', label: 'Specs' },
    { key: 'aero', label: 'Aero' },
    { key: 'elec', label: 'Electrical' },
  ];

  const panels = specs
    ? [
        { key: 'specs', content: <SpecTable rows={specs.specs} /> },
        { key: 'aero', content: <SpecTable rows={specs.aero} /> },
        { key: 'elec', content: <SpecTable rows={specs.electrical} /> },
      ]
    : [];

  return (
    <div className="pt-[65px]">
      <section className="bg-background py-12">
        <div className="grid md:grid-cols-2 min-h-[70vh]">
          <div className="relative overflow-hidden min-h-[40vh] md:min-h-0 bg-card m-6 md:m-8">
            <img src="/GS4_4.jpg" alt="UVM AERO racecar detail" className="w-full h-full object-cover opacity-70" />
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{ background: 'linear-gradient(to top, #050a06, transparent)' }}
            />
            <div className="absolute top-6 left-6" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
              <span className="bg-accent text-black px-2 py-1 font-bold">AERO-FSAE-26</span>
            </div>
          </div>

          <div className="relative p-8 md:p-12 flex flex-col justify-between">
            <div className="hidden md:block absolute left-0 top-8 bottom-8 w-px bg-border" />
            <div>
              <h2
                className="font-black uppercase leading-none mb-8 font-display"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.02em' }}
              >
                THE MACHINE
              </h2>

              {specs && <Tabs tabs={tabs} panels={panels} />}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-muted leading-relaxed text-sm">
                Every component on the car is designed, manufactured, and validated in-house by our members — from
                CAD to carbon layup to final assembly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
