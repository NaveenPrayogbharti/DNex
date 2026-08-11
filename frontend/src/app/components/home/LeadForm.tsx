import { CheckCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { BaseLeadForm } from './BaseLeadForm';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

export function LeadForm() {
  return (
    <section className="pt-40 pb-24 min-h-screen" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
              style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.12)' }}
            >
              Get Consultation
            </div>

            <h2
              className="text-white mb-4"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              Start Your UAE Business Journey Today
            </h2>
            <p className="text-slate-400 mb-10" style={{ lineHeight: 1.7 }}>
              Get a free consultation with our senior UAE business consultant. We'll advise on
              the best structure, economic zone, and setup strategy tailored to your business goals.
            </p>

            {/* Contact options */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Phone, label: 'Call Us', value: '+971 555542841', href: 'tel:+971 555542841' },
                { icon: Phone, label: 'Call Us', value: '+91 8851742425', href: 'tel:+91 8851742425' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+971 555542841', href: 'https://wa.me/971555542841' },
                { icon: Mail, label: 'Email', value: 'info@dnex.ae', href: 'mailto:info@dnex.ae' },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:opacity-90 group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}
                  >
                    <c.icon size={18} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{c.label}</div>
                    <div className="text-white font-medium text-sm">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Trust points */}
            <div className="space-y-2">
              {[
                'Response within 1 business hour',
                'No commitment required',
                'Completely confidential',
                'Expert consultant assigned to you',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2.5">
                  <CheckCircle size={15} style={{ color: GOLD }} />
                  <span className="text-sm text-slate-300">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <BaseLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
