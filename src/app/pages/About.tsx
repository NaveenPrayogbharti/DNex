import { Target, Shield, Award } from 'lucide-react';
import { TeamCarousel } from '../components/TeamCarousel';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

// Mock Data Objects
const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '10k+', label: 'Companies Setup' },
    { value: '52+', label: 'Free Zones' },
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

export function About() {
    return (
        <div className="min-h-screen bg-white pt-36 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* 1. Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 text-center">
                <p className="text-sm font-bold tracking-widest mb-3" style={{ color: GOLD }}>
                    About DNex Consulting
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6" style={{ color: NAVY, letterSpacing: '-1px' }}>
                    Your Trusted Partner in <br />
                    <span style={{ color: GOLD }}>UAE Business Setup</span>
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed text-justify">
                    At DNex, we are committed to empowering businesses with seamless, compliant, and growth-oriented solutions across the UAE and beyond. With a strong foundation in regulatory expertise and business advisory, we specialize in helping entrepreneurs, startups, and established enterprises navigate the complexities of company formation, financial compliance, and cross-border operations.
                </p>
            </div>

            {/* 2. Our Mission Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-24 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
                    Our Mission
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg text-justify">
                    Founded with the vision to simplify the complex landscape of corporate structuring in the UAE, DNex Consulting has grown into one of the most reliable advisory firms in the region. We understand that navigating government regulations can be daunting.
                </p>
                <p className="text-gray-600 mb-10 leading-relaxed text-lg text-justify">
                    Our mission is to handle the heavy lifting—from mainland and free zone company formations to accounting, corporate tax, and golden visas—so that you can focus entirely on scaling your business.
                </p>
            </div>

            {/* 3. Our Expertise Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-24 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: NAVY }}>
                    Our Expertise
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg text-justify">
                    Our team brings comprehensive expertise across taxation, corporate structuring, regulatory compliance, legal advisory, and documentation, complemented by specialized capabilities in cross-border transactions, FEMA &amp; ODI structuring, AML compliance, and global business expansion. Known for our practical and solution-oriented approach. Our team offer end-to-end assistance in litigation and dispute resolution, including handling tax notices, regulatory proceedings, and corporate disputes. Our approach combines legal expertise with practical strategy, ensuring well-prepared documentation, effective representation, and proactive risk management to safeguard client interests at every stage with efficiency and precision.
                </p>
            </div>

            {/* 4. Team Scrolling Section */}
            <TeamCarousel />

            {/* 5. Stats Section */}
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

            {/* 6. Core Values Section */}
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