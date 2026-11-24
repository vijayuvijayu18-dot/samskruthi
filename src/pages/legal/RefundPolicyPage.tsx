import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowLeft, HelpCircle } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0e0a07] text-[#ede6d8] py-16 px-4 sm:px-6 lg:px-8 text-left selection:bg-[#d4af37] selection:text-[#16100c]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-sans text-[#c5a059] hover:text-[#e6ca85] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Samskruthi</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#c5a059]/30 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#241a12] border border-[#c5a059]/40 text-[#d4af37] text-xs font-mono mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>TRANSPARENCY & ZERO-HIDDEN-FEES DISCLOSURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Refund & Free Access Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Effective Date: November 24, 2026 • Last Reviewed: November 2026
          </p>
        </div>

        {/* Free Access Charter Statement */}
        <div className="p-6 rounded-2xl bg-[#1a120c] border border-[#c5a059]/40 space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>100% Free Open Cultural Commons — Zero Hidden Fees</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            <strong>Samskruthi is an open, non-commercial public heritage initiative.</strong> All core platform features—including browsing the digital monument archives, navigating the interactive Heritage Atlas, accessing oral chronicles, and creating a custodian profile—are provided completely <strong>free of charge</strong>.
          </p>
          <ul className="list-disc pl-5 text-xs text-stone-300 space-y-1">
            <li>No mandatory subscription charges or paywalls</li>
            <li>No recurring automatic billing cycles</li>
            <li>No surprise platform maintenance or convenience surcharges</li>
            <li>No hidden transaction fees</li>
          </ul>
        </div>

        {/* Paid Services & Ticketed Events Policy (Future-Proofing) */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#c5a059]" />
            <span>Policy for Future Paid Events, Workshops & Physical Heritage Goods</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-stone-300 leading-relaxed">
            <p>
              In the event that Samskruthi hosts ticketed academic symposiums, specialized artisan workshops, guided physical sanctuary tours, or offers physical archival publications:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Upfront Pricing:</strong> All prices, applicable GST/taxes, and delivery costs will be explicitly itemized prior to final confirmation with zero pre-checked add-on charges.
              </li>
              <li>
                <strong>Event Cancellations & Refunds:</strong> For ticketed symposiums or virtual lectures, full refunds will be issued if cancellation is requested at least 48 hours prior to the scheduled event time, or if an event is canceled by Samskruthi.
              </li>
              <li>
                <strong>Physical Archival Goods:</strong> If physical books, prints, or artisan crafts are purchased, customers may request a full return and refund within 14 days of delivery for damaged or defective items.
              </li>
              <li>
                <strong>Refund Processing:</strong> Approved refunds are credited directly to the original payment method within 5 to 7 business days.
              </li>
            </ul>
          </div>
        </section>

        {/* Voluntary Donations */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#c5a059]" />
            <span>Voluntary Philanthropic Contributions</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Any voluntary donations made toward cultural documentation expeditions or non-profit archiving projects are considered final charitable contributions, except in verified cases of technical duplicate billing, which will be promptly refunded upon request.
          </p>
        </section>

        {/* Contact Support */}
        <section className="space-y-3 border-t border-[#c5a059]/30 pt-6">
          <h2 className="text-xl font-serif font-bold text-[#d4af37]">
            Billing & Inquiries Contact
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            For questions regarding billing transparency or refund requests:
          </p>
          <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 text-xs text-stone-300">
            <p className="font-semibold text-white">Samskruthi Cultural Heritage Foundation</p>
            <p>Support Desk: <a href="mailto:support@samskruthi.org" className="text-[#c5a059] underline">support@samskruthi.org</a></p>
            <p>Grievances: <a href="mailto:billing@samskruthi.org" className="text-[#c5a059] underline">billing@samskruthi.org</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};
