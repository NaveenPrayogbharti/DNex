import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BaseLeadForm } from '../components/home/BaseLeadForm';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

export function Contact() {
    return (
        <div className="min-h-screen bg-slate-50 pt-36 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: NAVY }}>
                    Get in <span style={{ color: GOLD }}>Touch</span>
                </h1>
                <p className="text-gray-600 text-lg">
                    Our expert consultants are ready to assist you. Reach out to us through any of the channels below.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                    {/* Left: Contact Info Card */}
                    <div
                        className="rounded-3xl shadow-2xl overflow-hidden relative p-8 md:p-14 text-white flex flex-col justify-center"
                    style={{ backgroundColor: NAVY }}
                >
                    {/* Subtle Background Design Elements */}
                    <div
                        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 translate-x-1/3 -translate-y-1/3 pointer-events-none"
                        style={{ backgroundColor: GOLD }}
                    ></div>
                    <div
                        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 -translate-x-1/3 translate-y-1/3 pointer-events-none"
                        style={{ backgroundColor: GOLD }}
                    ></div>

                    <div className="relative z-10 flex flex-col gap-10">

                        {/* Phone */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}>
                                <Phone style={{ color: GOLD }} size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Call Us</p>
                                <a href="tel:+971551251185" className="block text-xl font-medium hover:text-[#C9963C] transition-colors mb-1">+971 551251185</a>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}>
                                <Mail style={{ color: GOLD }} size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Email Us</p>
                                <a href="mailto:info@dnex.ae" className="block text-xl font-medium hover:text-[#C9963C] transition-colors">info@dnex.ae</a>
                            </div>
                        </div>

                        {/* Office Addresses */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}>
                                <MapPin style={{ color: GOLD }} size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Visit Our Offices</p>
                                <ul className="text-lg font-medium leading-relaxed space-y-4">
                                    <li>
                                        <strong>Sharjah:</strong> Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE
                                    </li>
                                    <li>
                                        <strong>Bur Dubai:</strong> 116. Al Khaleez Centre. Bur Dubai.
                                    </li>
                                    <li>
                                        <strong>Dubai South:</strong> B-89, Madinat Al Mataar Dubai South, Dubai UAE.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(201,150,60,0.15)' }}>
                                <Clock style={{ color: GOLD }} size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Working Hours</p>
                                <p className="text-xl font-medium leading-relaxed">
                                    Monday - Saturday<br />
                                    9:00 AM - 6:00 PM
                                </p>
                            </div>
                        </div>

                        </div>

                    </div>

                    {/* Right: LeadForm */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12">
                        <BaseLeadForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
