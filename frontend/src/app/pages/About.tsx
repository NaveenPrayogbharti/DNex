import { useState } from 'react';
import { Target, Shield, Award, Zap, Globe, Handshake, TrendingUp, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { TeamCarousel } from '../components/TeamCarousel';
import banner from '../../assets/images/banner.png';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

// Mock Data Objects
const stats = [
    { value: '15 Years', label: ' Experienced Management' },
    { value: '100%', label: 'Timely Completion' },
    { value: 'UAE', label: 'Mainland and Free Zones Covered' },
    { value: '100%', label: 'Client Satisfaction' },
];

const values = [
    {
        icon: Shield,
        title: 'Integrity & Transparency',
        desc: 'We believe in clear, honest communication with no hidden fees or surprise charges in our setup processes.',
    },
    {
        icon: Target,
        title: 'Client-Centric Approach',
        desc: 'Your business goals are our priority. We tailor our setup strategies to fit your exact operational needs.',
    },
    {
        icon: Award,
        title: 'Excellence & Quality',
        desc: 'With decades of combined experience, we deliver premium service and guarantee strict government compliance.',
    },
];

const whyDnex = [
    {
        icon: Zap,
        title: 'Fast Turnaround',
        desc: 'Get your business up and running in as little as 7 days with our streamlined processes and dedicated support team.',
    },
    {
        icon: Globe,
        title: 'Dual Jurisdiction Expertise',
        desc: 'Our team is fully conversant with both UAE and India regulatory frameworks, enabling seamless cross-border operations.',
    },
    {
        icon: Shield,
        title: 'Government Licensed',
        desc: 'We are a fully licensed and ISO-certified consulting firm, ensuring all processes adhere to the highest standards of compliance.',
    },
    {
        icon: TrendingUp,
        title: 'End-to-End Support',
        desc: 'From company formation and banking to tax compliance and PRO services — we handle everything so you focus on growth.',
    },
    {
        icon: Handshake,
        title: 'No Hidden Fees',
        desc: 'Transparent, competitive pricing with no surprise charges. What we quote is what you pay — guaranteed.',
    },
    {
        icon: Award,
        title: 'Trusted by 100+ Clients',
        desc: 'A proven track record of excellence with thousands of successful company setups and satisfied entrepreneurs worldwide.',
    },
];

export function About() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* 1. Full-Width Hero Section with Form */}
            <section className="relative flex items-center" style={{ minHeight: '100vh' }}>
                {/* Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={banner}
                        alt="About Hero Banner"
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(110deg, rgba(13,33,55,0.92) 0%, rgba(13,33,55,0.8) 55%, rgba(13,33,55,0.7) 100%)',
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text Content */}
                        <div>
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-7"
                                style={{ borderColor: 'rgba(201,150,60,0.5)', backgroundColor: 'rgba(201,150,60,0.12)' }}
                            >
                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GOLD }}></span>
                                <span className="text-sm font-medium" style={{ color: GOLD }}>
                                    About DNex Consulting
                                </span>
                            </div>

                            <h1
                                className="text-white mb-6"
                                style={{
                                    fontSize: 'clamp(2rem, 4vw, 3.1rem)',
                                    fontWeight: 800,
                                    lineHeight: 1.08,
                                    letterSpacing: '-1px',
                                }}
                            >
                                Your Trusted Partner in<br />
                                <span style={{ color: GOLD }}>UAE Business Setup</span>
                            </h1>

                            <p className="text-lg text-slate-300 mb-8 max-w-[540px] text-justify" style={{ lineHeight: 1.65 }}>
                                At DNex, we are committed to empowering businesses with seamless, compliant, and growth-oriented solutions across the UAE and beyond. With a strong foundation in regulatory expertise and business advisory, we specialize in helping entrepreneurs, startups, and established enterprises navigate the complexities of company formation, financial compliance, and cross-border operations.
                            </p>

                            {/* Trust bullets */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {[
                                    { text: 'Government Licensed' },
                                    { text: '15+ Years Experience', star: true },
                                    { text: '100+ Companies Setup' },
                                ].map((b) => (
                                    <div key={b.text} className="flex items-center gap-2">
                                        <CheckCircle size={15} style={{ color: GOLD }} />
                                        <span className="text-sm text-slate-300">
                                            {b.text}
                                            {b.star && (
                                                <span title="*T&C Apply" style={{ color: GOLD, fontSize: '0.65rem', verticalAlign: 'super', cursor: 'default', marginLeft: '2px' }}>★</span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: `2px solid ${GOLD}` }}>
                            <div className="p-6" style={{ backgroundColor: NAVY }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-xs font-medium text-green-400">Consultants Online</span>
                                </div>
                                <h3 className="text-white font-bold text-lg">Get Free Consultation</h3>
                                <p className="text-slate-400 text-xs mt-1">Response within 1 business hour</p>
                            </div>
                            <div className="p-6 bg-white">
                                {submitted ? (
                                    <div className="text-center py-8">
                                        <CheckCircle size={40} style={{ color: GOLD }} className="mx-auto mb-3" />
                                        <h4 className="font-bold" style={{ color: NAVY }}>We'll be in touch soon!</h4>
                                        <p className="text-xs text-gray-500 mt-2">Our consultant will contact you within 4 hours.</p>
                                        <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-semibold" style={{ color: GOLD }}>
                                            Submit another →
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                                            <input
                                                type="text" required placeholder="Your full name"
                                                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                                            <input
                                                type="email" required placeholder="your@email.com"
                                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Phone *</label>
                                            <input
                                                type="tel" required placeholder="+971 555 000 000"
                                                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">How can we help?</label>
                                            <textarea
                                                rows={3} placeholder="Tell us about your business needs..."
                                                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:border-[#C9963C] transition-colors resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                                            style={{ backgroundColor: GOLD }}
                                        >
                                            <Send size={15} />
                                            Start Now
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Our Mission Section — Premium Redesign */}
            <div className="py-24" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Visual element */}
                        <div className="relative">
                            <div className="rounded-3xl overflow-hidden p-10" style={{ backgroundColor: NAVY }}>
                                <div
                                    className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                                    style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
                                />
                                <div
                                    className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
                                    style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.15)' }}
                                >
                                    Our Purpose
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.5px' }}>
                                    Our Mission
                                </h2>
                                <div className="w-16 h-1 rounded-full mb-8" style={{ backgroundColor: GOLD }} />
                                <div className="space-y-6">
                                    <p className="text-slate-300 leading-relaxed text-base text-justify">
                                        Founded with the vision to simplify the complex landscape of corporate structuring in the UAE, DNex Consulting has grown into one of the most reliable advisory firms in the region. We understand that navigating government regulations can be daunting.
                                    </p>
                                    <p className="text-slate-300 leading-relaxed text-base text-justify">
                                        Our mission is to handle the heavy lifting—from mainland and free zone company formations to accounting, corporate tax, and golden visas—so that you can focus entirely on scaling your business.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats highlight */}
                        <div className="grid grid-cols-2 gap-5">
                            {[
                                { value: '15+', label: 'Years of Advisory Experience', icon: '📅', star: true },
                                { value: '10k+', label: 'Companies Successfully Setup', icon: '🏢' },
                                { value: '52+', label: 'Free Zones Covered', icon: '🌍' },
                                { value: '100%', label: 'Client Satisfaction Rate', icon: '⭐' },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-all duration-300 text-center group"
                                >
                                    <div className="text-3xl mb-3">{s.icon}</div>
                                    <div className="text-2xl font-bold mb-1" style={{ color: NAVY }}>
                                        {s.value}
                                        {s.star && (
                                            <span title="*T&C Apply" style={{ color: GOLD, fontSize: '0.7rem', verticalAlign: 'super', cursor: 'default', marginLeft: '2px' }}>★</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Our Expertise Section — Premium Redesign */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-14">
                        <div
                            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
                        >
                            What We Do Best
                        </div>
                        <h2
                            className="mb-4"
                            style={{
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                                fontWeight: 700,
                                color: NAVY,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Our Expertise
                        </h2>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        <div
                            className="rounded-2xl p-8 md:p-12 border-l-4"
                            style={{ borderColor: GOLD, backgroundColor: '#FAFCFE' }}
                        >
                            <p className="text-gray-600 leading-relaxed text-lg text-justify">
                                Our team brings comprehensive expertise across taxation, corporate structuring, regulatory compliance, legal advisory, and documentation, complemented by specialized capabilities in cross-border transactions, FEMA &amp; ODI structuring, AML compliance, and global business expansion. Known for our practical and solution-oriented approach. Our team offer end-to-end assistance in litigation and dispute resolution, including handling tax notices, regulatory proceedings, and corporate disputes. Our approach combines legal expertise with practical strategy, ensuring well-prepared documentation, effective representation, and proactive risk management to safeguard client interests at every stage with efficiency and precision.
                            </p>
                        </div>

                        {/* Expertise tags */}
                        <div className="flex flex-wrap gap-2 mt-8 justify-center">
                            {['Taxation', 'Corporate Structuring', 'FEMA & ODI', 'AML Compliance', 'Litigation', 'Cross-Border Transactions', 'Legal Advisory', 'Risk Management'].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:scale-105"
                                    style={{ borderColor: 'rgba(201,150,60,0.3)', color: GOLD, backgroundColor: 'rgba(201,150,60,0.06)' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Why DNex Section */}
            <div className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <div
                            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full"
                            style={{ color: GOLD, backgroundColor: 'rgba(201,150,60,0.1)' }}
                        >
                            Why Choose Us
                        </div>
                        <h2
                            className="mb-4"
                            style={{
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                                fontWeight: 700,
                                color: NAVY,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Why DNex?
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-justify" style={{ lineHeight: 1.7 }}>
                            We combine deep regulatory expertise with a genuinely client first approach to make your UAE business journey smooth and successful.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {whyDnex.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-300"
                                    style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}
                                >
                                    <item.icon size={28} style={{ color: GOLD }} />
                                </div>
                                <h3 className="text-lg font-bold mb-3" style={{ color: NAVY }}>{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm text-justify">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Team Scrolling Section */}
            <div className="pt-24">
                <TeamCarousel />
            </div>

            {/* 6. Stats Section */}
            <div style={{ backgroundColor: NAVY }} className="py-16 mb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center px-4">
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-sm font-medium tracking-wide uppercase" style={{ color: GOLD }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 7. Core Values Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: NAVY }}>
                        Our Core Values
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-justify">
                        The principles that guide our daily operations and guarantee success for our clients.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((value, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors" style={{ backgroundColor: 'rgba(201,150,60,0.1)' }}>
                                <value.icon size={28} style={{ color: GOLD }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: NAVY }}>{value.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                {value.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}