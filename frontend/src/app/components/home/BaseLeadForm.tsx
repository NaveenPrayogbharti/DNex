import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { getStoredServices } from '../../../lib/servicesStore';

const GOLD = '#C9963C';
const NAVY = '#0D2137';

const countries = [
  'India', 'Pakistan', 'United Kingdom', 'USA', 'Germany', 'France',
  'Russia', 'China', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Egypt',
  'Nigeria', 'South Africa', 'Australia', 'Canada', 'Singapore', 'Other',
];

export function BaseLeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    service: "",
    message: "",
  });

  useEffect(() => {
    const services = getStoredServices().filter(s => s.active).map(s => s.title);
    setActiveServices(services);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiBase = import.meta.env.VITE_BACKEND_API_URL !== undefined
      ? import.meta.env.VITE_BACKEND_API_URL
      : 'http://localhost:3006';

    try {
      const res = await fetch(`${apiBase}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          service_needed: formData.service,
          message: formData.message,
          source: 'website'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
      setFormData({ fullName: "", email: "", phone: "", country: "", service: "", message: "" });
    } catch (error) {
      console.error("Failed to submit lead", error);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
        >
          <CheckCircle size={32} style={{ color: GOLD }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: NAVY }}>
          Thank You!
        </h3>
        <p className="text-gray-500 text-sm">
          Your consultation request has been received. Our expert will contact you within 4 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold"
          style={{ color: GOLD }}
        >
          Submit another inquiry →
        </button>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
        Get Consultation
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Fill out the form and we'll get back to you within 4 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="John Smith"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              placeholder="+1 555 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Country of Residence *
            </label>
            <select
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-700"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Service Needed *
          </label>
          <select
            required
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors bg-white text-gray-700"
          >
            <option value="">Select a service</option>
            {activeServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Message (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Tell us about your business idea or any specific requirements..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors resize-none bg-white text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: GOLD }}
        >
          <Send size={16} />
          Get Consultation
        </button>

        <p className="text-center text-xs text-gray-400">
          By submitting, you agree to our{' '}
          <a href="#" className="underline">Privacy Policy</a>.
          We never share your data with third parties.
        </p>
      </form>
    </>
  );
}
