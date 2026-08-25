import React, { useEffect } from 'react';

const NAVY = '#0D2137';
const GOLD = '#C9963C';

export function TermsAndConditions() {
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
            Terms & Conditions
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            The terms that govern your use of the DNEX website and your engagement of our business setup, banking, PRO, taxation, accounting, compliance, and India advisory services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 border-t border-white/10 pt-6 mt-8">
            <span><b className="text-white">Effective Date:</b> August 22, 2026</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span><b className="text-white">Applies to:</b> dnex.ae and all related services</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span><b className="text-white">Governing law:</b> United Arab Emirates</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#0D2137] prose-a:text-[#0D2137] hover:prose-a:text-[#C9963C] prose-li:text-slate-600 prose-p:text-slate-600">
            
            {/* 01. Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">01</span> 
                Acceptance of Terms
              </h2>
              <p>These Terms & Conditions ("Terms") govern your access to and use of the DNEX Consulting website (<a href="https://dnex.ae" target="_blank" rel="noreferrer">dnex.ae</a>) and any services provided by DNEX Consulting ("DNEX", "we", "us", "our"). By accessing our website, submitting an inquiry, signing an engagement letter, or making a payment for any service, you ("client", "you", "your") agree to be bound by these Terms.</p>
              <p>If you do not agree with any part of these Terms, please do not use our website or engage our services.</p>
            </div>

            {/* 02. Our Services */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">02</span> 
                Our Services
              </h2>
              <p>DNEX provides advisory and administrative support across the following service categories in the UAE and India:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
                {['Business Setup', 'Banking Support', 'PRO & Visa Services', 'Corporate Tax & VAT', 'Accounting & Audit', 'Compliance & Regulatory', 'India Company Incorporation', 'ROC, GST & Legal Services'].map(service => (
                  <div key={service} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold text-center text-slate-700 hover:border-slate-300 transition-colors">
                    {service}
                  </div>
                ))}
              </div>

              <p>The specific scope, deliverables, timeline, and fees for each engagement will be confirmed separately in writing (via email, quotation, or engagement letter) before work begins.</p>
            </div>

            {/* 03. Eligibility & Client Obligations */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">03</span> 
                Eligibility & Client Obligations
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be legally authorized to act on behalf of yourself or the business entity you represent</li>
                <li>You agree to provide accurate, complete, and current information and documentation required for your service</li>
                <li>You are responsible for the authenticity of all documents (passports, Emirates ID, financial records, corporate documents, etc.) submitted to us</li>
                <li>You agree to respond to our requests for information or documents in a timely manner, as delays may affect service timelines</li>
              </ul>
            </div>

            {/* 04. Engagement & Service Process */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">04</span> 
                Engagement & Service Process
              </h2>
              <p>Upon confirming a service with DNEX, we will:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share a scope of work, estimated timeline, and applicable fees</li>
                <li>Request the necessary documents and information from you</li>
                <li>Liaise with relevant UAE government departments, banks, the Federal Tax Authority, or Indian regulatory bodies (ROC, MCA, GST, Income Tax) on your behalf, where applicable</li>
                <li>Keep you informed of material progress and any issues that arise during processing</li>
              </ul>
              <p className="mt-4">Timelines provided for visa processing, licensing, banking, or tax filings are estimates only and depend on third-party government or bank processing times, which are outside our control.</p>
            </div>

            {/* 05. Fees & Online Payments */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">05</span> 
                Fees & Online Payments
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service fees are communicated in advance via quotation, invoice, or engagement letter and may be payable in full or in installments, depending on the service</li>
                <li>Online payments made through our website or payment links are processed via secure, third-party, PCI-DSS-compliant payment gateways</li>
                <li>Fees for government charges, license costs, visa costs, and third-party charges (where applicable) are separate from our professional service fees, unless stated otherwise</li>
                <li>All fees are quoted in AED or as otherwise specified, and are exclusive of applicable VAT unless stated</li>
              </ul>
              <div className="bg-amber-50 border-l-4 p-4 rounded-r-lg mt-6 text-amber-800 text-sm font-medium" style={{ borderLeftColor: GOLD }}>
                DNEX does not store your full card number, expiry date, or CVV. Payment card data is handled solely by our secure payment processor.
              </div>
            </div>

            {/* 06. Cancellations & Refunds */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">06</span> 
                Cancellations & Refunds
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancellation requests must be submitted in writing to <a href="mailto:info@dnex.ae">info@dnex.ae</a></li>
                <li>Fees already paid to government authorities, banks, or third parties on your behalf (e.g., license fees, visa fees) are non-refundable once submitted, as these are governed by the respective authority's policies</li>
                <li>Our professional service fees for work already performed are non-refundable</li>
                <li>Any refund of unearned fees, where applicable, will be assessed on a case-by-case basis and processed to the original payment method</li>
              </ul>
            </div>

            {/* 07. Documents & Authorization */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">07</span> 
                Documents & Authorization
              </h2>
              <p>By engaging our services, you authorize DNEX to submit your documents and information to relevant UAE and Indian government departments, banks, and regulatory authorities strictly for the purpose of completing the requested service. You remain responsible for ensuring that all documents provided to us are genuine, valid, and not misleading.</p>
            </div>

            {/* 08. Limitation of Liability */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">08</span> 
                Limitation of Liability
              </h2>
              <p>To the fullest extent permitted under UAE law:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>DNEX shall not be liable for delays, rejections, or additional requirements imposed by government authorities, banks, or regulatory bodies that are outside our reasonable control</li>
                <li>DNEX shall not be liable for indirect, incidental, or consequential losses (including loss of business, profits, or opportunity) arising from the use of our services or website</li>
                <li>Our total liability for any claim arising from a specific service shall not exceed the professional fees paid by you for that specific service</li>
              </ul>
            </div>

            {/* 09. No Guarantee of Government Outcomes */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">09</span> 
                No Guarantee of Government Outcomes
              </h2>
              <p>DNEX provides professional advisory and administrative support. Final approval of licenses, visas, bank accounts, tax registrations, and regulatory filings rests solely with the relevant UAE or Indian government authority or bank. We do not guarantee approval, and any approval timelines communicated are estimates based on standard processing periods.</p>
            </div>

            {/* 10. Intellectual Property */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">10</span> 
                Intellectual Property
              </h2>
              <p>All content on the DNEX website, including text, graphics, logos, and design, is the property of DNEX Consulting and is protected under applicable intellectual property laws. You may not copy, reproduce, or distribute our content without prior written consent.</p>
            </div>

            {/* 11. Confidentiality */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">11</span> 
                Confidentiality
              </h2>
              <p>We treat all client information and documents as confidential and use them solely for the purpose of delivering the requested service, in accordance with our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. We will not disclose your confidential information to third parties except as required to complete your service or as required by law.</p>
            </div>

            {/* 12. Website Use */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">12</span> 
                Website Use
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree not to misuse our website, including attempting unauthorized access, introducing malicious code, or scraping content without permission</li>
                <li>Information on our website (including "UAE Law Updates") is provided for general informational purposes and does not constitute legal, tax, or financial advice</li>
                <li>We reserve the right to update, modify, or remove website content at any time without prior notice</li>
              </ul>
            </div>

            {/* 13. Termination */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">13</span> 
                Termination
              </h2>
              <p>DNEX reserves the right to suspend or terminate any engagement if a client provides false information, fails to make payment, or engages in unlawful conduct. Either party may terminate an ongoing engagement with written notice, subject to payment for services already rendered and any non-refundable third-party costs incurred.</p>
            </div>

            {/* 14. Indemnity */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">14</span> 
                Indemnity
              </h2>
              <p>You agree to indemnify and hold DNEX harmless from any claims, losses, or liabilities arising from inaccurate information or documents you provide, your misuse of our services, or your breach of these Terms.</p>
            </div>

            {/* 15. Governing Law & Jurisdiction */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">15</span> 
                Governing Law & Jurisdiction
              </h2>
              <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the competent courts of the UAE, unless otherwise required by applicable law.</p>
            </div>

            {/* 16. Changes to These Terms */}
            <div className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold mb-6 pb-4 border-b border-slate-100">
                <span style={{ color: GOLD }} className="text-sm font-extrabold bg-slate-50 px-3 py-1 rounded-lg">16</span> 
                Changes to These Terms
              </h2>
              <p>We may update these Terms from time to time to reflect changes in our services or legal requirements. The updated version will be posted on this page with a revised effective date. Continued use of our website or services after changes are posted constitutes acceptance of the updated Terms.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
