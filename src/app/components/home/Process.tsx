import {
  MessageSquare,
  FileText,
  Send,
  CheckCircle,
  Building2,
} from 'lucide-react';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const steps = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Get Consultation',
    description:
      'Speak with our expert consultant. We understand your business goals, industry, and recommend the best setup structure for you.',
    duration: 'Day 0',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Document Collection',
    description:
      'Provide the required documents digitally. We prepare and review everything from passport copies, business plan, and application forms.',
    duration: 'Day 1-2',
  },
  {
    step: '03',
    icon: Send,
    title: 'Application Submission',
    description:
      'Our PRO team submits your application to the relevant authority (DED, DMCC, DIFC, etc.) and follows up directly.',
    duration: 'Day 3-4',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Approval & Payment',
    description:
      'Receive your initial approval within 2–3 working days. Our team handles all government fee payments on your behalf.',
    duration: 'Day 5',
  },
  {
    step: '05',
    icon: Building2,
    title: 'License Delivered',
    description:
      'Receive your trade license, company documents, and start operating. We also assist with visa and bank account setup.',
    duration: 'Day 6-7',
  },
];

export function Process() {
  return (
    <section className="py-24" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
          >
            How It Works
          </div>
          <h2
            className="text-white mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            From Idea to Company in 7 Days
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
            Our streamlined process eliminates bureaucratic complexity. We do the heavy lifting, you focus on your business.
          </p>
        </div>

        {/* Steps — desktop horizontal, mobile vertical */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-[52px] left-[13%] right-[13%] h-px"
            style={{ backgroundColor: 'rgba(201,150,60,0.3)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                {/* Vertical connector (mobile) */}
                {i < steps.length - 1 && (
                  <div
                    className="md:hidden absolute left-[50%] w-px"
                    style={{
                      top: '104px',
                      bottom: '-32px',
                      backgroundColor: 'rgba(201,150,60,0.25)',
                    }}
                  />
                )}

                {/* Step circle */}
                <div
                  className="relative w-[104px] h-[104px] rounded-full flex items-center justify-center mb-5 z-10"
                  style={{
                    backgroundColor: 'rgba(201,150,60,0.1)',
                    border: `2px solid rgba(201,150,60,0.35)`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}
                  >
                    <s.icon size={28} style={{ color: GOLD }} />
                  </div>
                  {/* Step number */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: GOLD, color: '#fff' }}
                  >
                    {s.step}
                  </div>
                </div>

                {/* Duration badge */}
                <div
                  className="text-xs font-semibold px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                >
                  {s.duration}
                </div>

                <h3 className="text-white font-bold text-base mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed text-justify">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/leadform"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Start My Company Today
          </a>
          <p className="text-slate-500 text-xs mt-3">
            Get consultation · No commitment required
          </p>
        </div>
      </div>
    </section>
  );
}
