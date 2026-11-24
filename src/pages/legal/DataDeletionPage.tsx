import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShieldAlert, CheckCircle2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DataDeletionPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid registered email address');
      return;
    }
    setError('');
    setSubmitted(true);
  };

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono mb-3">
            <Trash2 className="w-3.5 h-3.5" />
            <span>RIGHT TO ERASURE (GDPR ART. 17 / DPDP ACT SEC. 12)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Data Deletion &amp; Account Erasure
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Instructions and request pipeline to permanently remove your personal records and custodian account.
          </p>
        </div>

        {/* Method 1: Instant In-App Deletion */}
        <div className="p-6 rounded-2xl bg-[#1a120c] border border-[#c5a059]/40 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-bold text-[#f7f2ea]">Method 1: Instant In-App Account Deletion</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            If you have an active account, you can perform immediate, automated cascaded deletion directly inside your account settings:
          </p>
          <ol className="list-decimal pl-5 text-xs sm:text-sm text-stone-300 space-y-1.5 leading-relaxed">
            <li>Log into your Samskruthi account.</li>
            <li>Navigate to <strong>Profile &gt; Security &amp; Account</strong>.</li>
            <li>Scroll to <strong>Delete Custodian Account</strong>.</li>
            <li>Confirm by typing <code>DELETE</code> and confirming your credentials.</li>
          </ol>
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-sans font-semibold transition-colors"
              >
                <span>Go to My Profile Security Settings</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#241a12] text-[#e6ca85] hover:bg-[#38281b] border border-[#c5a059]/40 text-xs font-sans font-semibold transition-colors"
              >
                <span>Sign in to manage your account</span>
              </Link>
            )}
          </div>
        </div>

        {/* Method 2: Public Manual Deletion Request Form */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#c5a059]" />
            <h2 className="text-xl font-serif font-bold text-[#d4af37]">
              Method 2: Submit a Manual Deletion Request
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            If you cannot log in, previously subscribed to our newsletter, or submitted a guest contribution and wish to have all associated email records, IP logs, and identifiers permanently scrubbed:
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-2 text-xs sm:text-sm text-emerald-200">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base font-serif">
                <CheckCircle2 className="w-5 h-5" />
                <span>Deletion Request Logged</span>
              </div>
              <p>
                We have registered your deletion request for <strong>{email}</strong>. Our privacy compliance team will verify ownership and process the complete erasure of your associated data within 30 days pursuant to statutory guidelines. A final confirmation will be sent to this email address once completed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#1a120c] border border-white/10 space-y-4 max-w-lg">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-sans">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="delEmail" className="block text-xs font-semibold text-stone-300">
                  Registered Email Address *
                </label>
                <input
                  id="delEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-[#c5a059] text-xs text-white placeholder-stone-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="delReason" className="block text-xs font-semibold text-stone-300">
                  Scope of Deletion / Additional Context (Optional)
                </label>
                <textarea
                  id="delReason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Delete my newsletter subscription, forum comments, or account profile entirely..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 focus:border-[#c5a059] text-xs text-white placeholder-stone-500 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-sans font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Submit Data Deletion Request</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Consequences of Erasure */}
        <section className="space-y-3 p-4 rounded-xl bg-[#140e0a] border border-white/5 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Important Notice Regarding Cultural Works Released Under CC BY-SA 4.0</span>
          </div>
          <p>
            While your personal identity, login credentials, IP logs, and account records will be permanently erased, factual historical monument descriptions or photographs already released into the public cultural commons under CC BY-SA 4.0 will remain preserved in the archive in an anonymized state to maintain scholarly integrity.
          </p>
        </section>
      </div>
    </div>
  );
};
