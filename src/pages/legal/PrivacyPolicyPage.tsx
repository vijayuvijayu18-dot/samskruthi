import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, Bell, ArrowLeft, Mail, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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

        {/* Header Header */}
        <div className="border-b border-[#c5a059]/30 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#241a12] border border-[#c5a059]/40 text-[#d4af37] text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP ACT 2023 & GDPR COMPLIANCE FRAMEWORK</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Effective Date: November 24, 2026 • Last Reviewed: November 2026
          </p>
        </div>

        {/* Introductory Notice */}
        <div className="p-4 rounded-xl bg-[#1a120c] border border-[#c5a059]/30 text-xs sm:text-sm text-stone-200 leading-relaxed space-y-2">
          <p>
            <strong>Samskruthi Cultural Heritage Foundation</strong> (&quot;Samskruthi&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Samskruthi Universal Digital Heritage Archive. We are committed to safeguarding your privacy, ensuring transparency, and giving you absolute control over your personal data.
          </p>
          <p className="text-[11px] text-stone-400">
            {/* TODO: Legal Review - Replace placeholder foundation registration details with your official registered society or company info */}
            [Legal Notice: Samskruthi is a non-profit cultural preservation portal registered in Bengaluru, Karnataka, India.]
          </p>
        </div>

        {/* Section 1: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#c5a059]" />
            <span>1. Information We Collect (Data Minimization)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            In compliance with the principle of data minimization, we collect only the minimum personal data strictly necessary to provide cultural archiving, community engagement, and security services:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>
              <strong>Account Information:</strong> When you register as a custodian, we collect your name, username, email address, and an encrypted password hash. We never store plain-text passwords.
            </li>
            <li>
              <strong>Cultural Contributions:</strong> If you submit a monument record, oral story, or photo, we store the metadata, geographic descriptions, and any optional contributor attribution you provide.
            </li>
            <li>
              <strong>Device Geolocation (Optional):</strong> When you click &quot;Current Location&quot; on the Heritage Atlas map, your browser shares coordinates with your explicit device-level permission solely to calculate distances to nearby sanctuaries. We do not track or persist your live GPS movements.
            </li>
            <li>
              <strong>Technical Logs:</strong> Minimal server logs (IP address, browser type, timestamp) retained temporarily for cybersecurity and DDoS prevention.
            </li>
          </ul>
        </section>

        {/* Section 2: How We Use Your Data */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#c5a059]" />
            <span>2. Purpose & Legal Basis for Processing</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            We process your personal information exclusively for documented purposes:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>To authenticate you and maintain your secure session.</li>
            <li>To attribute educational cultural contributions under CC BY-SA 4.0.</li>
            <li>To dispatch security notices (password resets, email verification).</li>
            <li>To send optional monthly research bulletins when you give explicit affirmative consent.</li>
          </ul>
          <p className="text-xs sm:text-sm text-stone-300">
            <strong>No Data Selling:</strong> We do not sell, rent, monetize, or trade your personal data with third-party advertisers or data brokers under any circumstances.
          </p>
        </section>

        {/* Section 3: Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#c5a059]" />
            <span>3. Third-Party Integrations & Map Providers</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Our platform interacts with the following external technical service providers:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>
              <strong>CARTO Basemaps & OpenStreetMap:</strong> Provides raster map cartography tiles. No personal data is transmitted; only standard tile coordinates (Z/X/Y) are requested.
            </li>
            <li>
              <strong>Google Identity (Optional):</strong> If you choose &quot;Continue with Google&quot;, Google provides verified profile tokens to streamline sign-in.
            </li>
            <li>
              <strong>Nominatim (OpenStreetMap):</strong> Reverse-geocodes coordinates into neighborhood names.
            </li>
            <li>
              <strong>Turso / libSQL:</strong> Encrypted cloud database storage hosted on AWS Mumbai with TLS 1.3 in-transit and AES-256 at-rest encryption.
            </li>
          </ul>
        </section>

        {/* Section 4: Your Rights (GDPR & DPDP Act 2023) */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c5a059]" />
            <span>4. Your Data Rights & Choices</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            You hold complete authority over your personal information:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>
              <strong>Right to Access & Portability:</strong> You can download a complete JSON archive of your personal records and posts directly from your profile settings.
            </li>
            <li>
              <strong>Right to Erasure (Right to be Forgotten):</strong> You can permanently delete your account and all associated personal data via your profile or submit a request on our <Link to="/data-deletion" className="text-[#c5a059] underline hover:text-[#e6ca85]">Data Deletion page</Link>.
            </li>
            <li>
              <strong>Right to Rectification:</strong> Edit your name, username, bio, and avatar anytime inside Profile &gt; Edit Profile.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Unsubscribe from bulletins anytime using the one-click link in any email or via our <Link to="/unsubscribe" className="text-[#c5a059] underline hover:text-[#e6ca85]">Unsubscribe page</Link>.
            </li>
          </ul>
        </section>

        {/* Section 5: Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#c5a059]" />
            <span>5. Age Limits & Safeguards</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Samskruthi is intended for general audiences interested in cultural heritage. We do not knowingly collect personal information from individuals under 13 years of age (or 16 in certain European jurisdictions). If you believe a child has provided us with personal information without parental consent, please contact our Grievance Officer immediately for expedited deletion.
          </p>
        </section>

        {/* Section 6: Contact & Grievance Officer */}
        <section className="space-y-3 border-t border-[#c5a059]/30 pt-6">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#c5a059]" />
            <span>6. Contact Information & Grievance Officer</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            For privacy inquiries, rights enforcement, or compliance questions:
          </p>
          <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 text-xs sm:text-sm text-stone-300 space-y-1">
            <p className="font-semibold text-white">Grievance & Privacy Officer</p>
            <p>Samskruthi Cultural Heritage Foundation</p>
            <p>Bengaluru, Karnataka, India</p>
            <p>
              Email:{' '}
              <a href="mailto:privacy@samskruthi.org" className="text-[#c5a059] underline">
                privacy@samskruthi.org
              </a>{' '}
              • Support:{' '}
              <a href="mailto:support@samskruthi.org" className="text-[#c5a059] underline">
                support@samskruthi.org
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
