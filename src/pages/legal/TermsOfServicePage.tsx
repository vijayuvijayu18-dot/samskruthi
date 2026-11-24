import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Globe, Award, ArrowLeft, AlertTriangle } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
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
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>OPEN CULTURAL COMMONS CHARTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Effective Date: November 24, 2026 • Last Reviewed: November 2026
          </p>
        </div>

        {/* Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            <span>1. Agreement & Acceptance</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            By visiting, accessing, or contributing to <strong>Samskruthi</strong> (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our <Link to="/privacy" className="text-[#c5a059] underline hover:text-[#e6ca85]">Privacy Policy</Link>. If you do not agree to these terms, please discontinue using the platform.
          </p>
        </section>

        {/* Non-Commercial Educational Mission */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#c5a059]" />
            <span>2. Educational & Archival Purpose</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Samskruthi is an educational, non-commercial digital archive dedicated to documenting humanity’s shared monuments, oral legacies, artisan traditions, and ancient memory. The platform operates for cultural safeguarding, historical research, and universal public education.
          </p>
        </section>

        {/* Intellectual Property & Licensing */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#c5a059]" />
            <span>3. Intellectual Property & CC BY-SA 4.0</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            <p>
              <strong>Community Contributions:</strong> When you submit cultural documentation, notes, or photographs, you agree to release your submitted text and metadata under the <strong>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong> license. You represent and warrant that you own or have obtained all necessary permissions to share the material.
            </p>
            <p>
              <strong>Platform Assets:</strong> The Samskruthi name, emblem, custom logos, visual brand identities, and proprietary platform code are protected under intellectual property laws.
            </p>
            <p>
              <strong>Public Domain & Third-Party Heritage:</strong> Photographs and historical texts of ancient monuments are reproduced in accordance with fair dealing provisions for cultural documentation, research, and non-profit public access.
            </p>
          </div>
        </section>

        {/* User Code of Conduct */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#c5a059]" />
            <span>4. Community Standards & Prohibited Conduct</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            As a custodian in the Samskruthi archive, you agree not to:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>Post intentionally falsified historical chronicles, fraudulent claims, or hate speech.</li>
            <li>Upload unauthorized copyrighted commercial media without proper fair-use or CC attribution.</li>
            <li>Distribute malware, spam, commercial solicitation, or unauthorized automated scraping bots.</li>
            <li>Harass, intimidate, or impersonate other custodians or living cultural tradition bearers.</li>
          </ul>
        </section>

        {/* Disclaimers & Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            <span>5. Disclaimers & Limitation of Liability</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            All historical archives, geographical coordinates, and cultural chronicles on Samskruthi are provided &quot;as is&quot; for educational exploration. While we strive for scholarly rigor, we do not warrant that all visitor guidelines, opening hours, or historical interpretations are exhaustively accurate or uninterrupted. In no event shall Samskruthi be liable for any indirect or consequential damages arising from your access to the platform.
          </p>
        </section>

        {/* Governing Law & Dispute Resolution */}
        <section className="space-y-3 border-t border-[#c5a059]/30 pt-6">
          <h2 className="text-xl font-serif font-bold text-[#d4af37]">
            6. Governing Law & Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with the platform shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.
          </p>
          <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 text-xs text-stone-300 mt-4">
            <p className="font-semibold text-white">Questions regarding Terms?</p>
            <p>Contact: <a href="mailto:legal@samskruthi.org" className="text-[#c5a059] underline">legal@samskruthi.org</a> • <a href="mailto:support@samskruthi.org" className="text-[#c5a059] underline">support@samskruthi.org</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};
