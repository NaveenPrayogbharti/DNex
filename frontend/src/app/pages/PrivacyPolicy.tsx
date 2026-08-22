import React, { useEffect } from 'react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 px-4 sm:px-6"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #132a4f 100%)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full bg-white/10"
            style={{ color: GOLD }}
          >
            Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            How DNEX Consulting collects, uses, and protects your personal information across our business setup, banking, PRO, taxation, accounting, compliance, and India advisory services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 border-t border-white/10 pt-6 mt-8">
            <span><b className="text-white">Applies to:</b> dnex.ae & related services</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span><b className="text-white">Jurisdiction:</b> UAE</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#0D2137] prose-a:text-[#0D2137] hover:prose-a:text-[#C9963C] prose-li:text-slate-600 prose-p:text-slate-600">
            
            <p className="lead text-xl text-slate-700 font-medium mb-12 text-justify">
              DNEX Consulting ("DNEX", "we", "us", "our") provides business setup, banking support, PRO services, taxation, accounting, compliance, and India-related corporate services in the United Arab Emirates. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you visit our website, use our services, communicate with us, or make payments to us.
            </p>
            
            <p className="mb-12">
              By using our website or engaging our services, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our website or services.
            </p>

            {/* 01. Information We Collect */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">01</span> 
                Information We Collect
              </h2>
              <p>We collect information online through our website forms, WhatsApp, email, phone, and during the course of delivering our services.</p>
              
              <h3 className="text-lg font-bold mt-8 mb-4">Personal Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full name, email address, phone number, and WhatsApp number</li>
                <li>Company name, trade license details, and business activity information</li>
                <li>Passport, Emirates ID, visa, and immigration-related documents (for PRO and visa services)</li>
                <li>Financial and banking information required for Banking Support services</li>
                <li>Tax registration numbers, VAT details, and financial records (Taxation, Corporate Tax, and Accounting & Audit)</li>
                <li>Company incorporation, ROC, GST, PAN, and KYC documents (India Services)</li>
                <li>Information submitted through contact forms, consultation requests, or the "Contact Us" page</li>
              </ul>

              <h3 className="text-lg font-bold mt-8 mb-4">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address, browser type, device type, and operating system</li>
                <li>Pages visited, time spent on the website, and referring website</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-lg font-bold mt-8 mb-4">Payment Information</h3>
              <p>When you make payments to us online, we (or our third-party payment processors) collect cardholder name, billing address, payment/bank transfer details, and transaction reference information.</p>
              
              <div className="bg-amber-50 border-l-4 p-4 rounded-r-lg mt-6 text-amber-800 text-sm font-medium" style={{ borderLeftColor: GOLD }}>
                DNEX does not permanently store full payment card numbers or CVV codes on its own servers. Card payments are processed through secure, PCI-DSS-compliant third-party payment gateways.
              </div>
            </div>

            {/* 02. How We Use Your Information */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">02</span> 
                How We Use Your Information
              </h2>
              <p>We use the information we collect to provide and manage our services, including:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
                {['Business Setup', 'Banking Support', 'PRO & Visa Services', 'Corporate Tax & VAT', 'Accounting & Audit', 'Compliance & Regulatory', 'India Company Incorporation', 'ROC & GST Compliance'].map(service => (
                  <div key={service} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold text-center text-slate-700 hover:border-slate-300 transition-colors">
                    {service}
                  </div>
                ))}
              </div>

              <ul className="list-disc pl-6 space-y-2">
                <li>Process and confirm online payments and issue invoices/receipts</li>
                <li>Communicate with you regarding service updates and support (email, phone, WhatsApp)</li>
                <li>Submit required documents to UAE government departments, immigration authorities, the Federal Tax Authority, and Indian regulatory bodies (ROC, MCA, GST) strictly to fulfil your requested service</li>
                <li>Verify your identity and comply with UAE Anti-Money Laundering (AML) and Know Your Customer (KYC) requirements</li>
                <li>Improve website functionality and user experience</li>
                <li>Send relevant updates, such as "UAE Law Updates," where you have opted in</li>
              </ul>
            </div>

            {/* 03. Legal Basis */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">03</span> 
                Legal Basis for Processing
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your consent (e.g., submitting a form, starting a WhatsApp chat, or making a payment)</li>
                <li>Performance of a contract (delivering the service you engaged us for)</li>
                <li>Compliance with a legal obligation (AML/KYC checks, tax filings, immigration submissions)</li>
                <li>Our legitimate business interests (improving services, preventing fraud)</li>
              </ul>
            </div>

            {/* 04. Sharing */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">04</span> 
                Sharing of Information
              </h2>
              <p>We do not sell your personal information. We may share it with:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                <li><strong>Government & Regulatory Authorities</strong> — UAE immigration authorities, the Federal Tax Authority, Department of Economic Development, and Indian authorities (ROC, MCA, GST, Income Tax) as required to deliver your service</li>
                <li><strong>Banking Partners</strong> — for Banking Support services, to facilitate account opening or related processes</li>
                <li><strong>Payment Processors</strong> — third-party, PCI-DSS-compliant gateways to process online payments securely</li>
                <li><strong>Service Providers</strong> — IT hosting, communication tools (e.g., WhatsApp Business), and administrative vendors, under confidentiality obligations</li>
                <li><strong>Legal Requirements</strong> — where required by law, court order, or to protect our legal rights</li>
              </ul>
              <p>We do not share your documents (passport, Emirates ID, financial records, etc.) with any third party except as necessary to complete the specific service you requested.</p>
            </div>

            {/* 05. Payments */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">05</span> 
                Online Payments
              </h2>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>All online payments are processed via secure, encrypted, third-party payment gateways</li>
                <li>Industry-standard SSL/TLS encryption protects payment data in transit</li>
                <li>DNEX does not store your full card number, expiry date, or CVV on its own servers</li>
                <li>You will receive an invoice/receipt via email upon successful payment</li>
              </ul>
              <p>For payment disputes, refunds (where applicable), or failed transactions, please contact our support team.</p>
            </div>

            {/* 06. Cookies */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">06</span> 
                Cookies & Tracking Technologies
              </h2>
              <p>Our website uses cookies and similar technologies to enable core functionality, understand website usage, improve user experience, and support the live chat/WhatsApp widget. You can control or disable cookies through your browser settings; disabling cookies may affect certain website features.</p>
            </div>

            {/* 07. Data Retention */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">07</span> 
                Data Retention
              </h2>
              <p>We retain your personal information only as long as necessary to fulfil the purpose it was collected for, comply with UAE and Indian legal, tax, and regulatory record-keeping requirements, and resolve disputes or enforce agreements. Once no longer required, data is securely deleted or anonymized.</p>
            </div>

            {/* 08. Security */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">08</span> 
                Data Security
              </h2>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Secure servers and encrypted data transmission (SSL/TLS)</li>
                <li>Restricted internal access to sensitive documents (passports, financial data, tax records)</li>
                <li>Secure, PCI-DSS-compliant third-party payment processing</li>
              </ul>
              <p>While we take reasonable steps to protect your data, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
            </div>

            {/* 09. Your Rights */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">09</span> 
                Your Rights
              </h2>
              <p>Subject to the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data ("PDPL") and applicable Indian data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate or incomplete data</li>
                <li>Request deletion of your data, subject to our legal/regulatory retention obligations</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>Object to certain processing of your data</li>
              </ul>
            </div>

            {/* 10. Third-Party Links */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">10</span> 
                Third-Party Links
              </h2>
              <p>Our website may contain links to third-party websites (e.g., government portals, banking partners). We are not responsible for the privacy practices of these external websites and encourage you to review their privacy policies separately.</p>
            </div>

            {/* 11. Children */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">11</span> 
                Children's Privacy
              </h2>
              <p>Our services are intended for individuals and businesses engaging in company setup, compliance, and related corporate services. We do not knowingly collect personal information from individuals under the age of 18.</p>
            </div>

            {/* 12. Changes */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">12</span> 
                Changes to This Policy
              </h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. The updated version will be posted on this page with a revised effective date.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
