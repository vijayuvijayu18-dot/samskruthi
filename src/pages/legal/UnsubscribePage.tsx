import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }
    setError('');
    // In production, dispatch to backend unsubscribe endpoint
    setUnsubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#0e0a07] text-[#ede6d8] py-16 px-4 sm:px-6 lg:px-8 text-left selection:bg-[#d4af37] selection:text-[#16100c]">
      <div className="max-w-md mx-auto space-y-8">
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

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1a120c] border border-[#c5a059]/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#241a12] border border-[#c5a059]/40 text-[#d4af37] flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#f7f2ea]">
              Email Preferences
            </h1>
            <p className="text-xs text-stone-300">
              Manage your subscription to the Samskruthi Global Heritage Dispatch.
            </p>
          </div>

          {unsubscribed ? (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="font-bold text-sm font-serif">You have been unsubscribed</p>
              <p className="text-stone-300">
                <strong>{email}</strong> has been removed from all non-essential cultural dispatches and research newsletters.
              </p>
              <p className="text-[11px] text-stone-400 pt-2">
                Essential security notices (e.g. password resets) will still be delivered if you maintain an active custodian account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs text-center font-sans">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="unsubEmail" className="block text-xs font-semibold text-stone-300">
                  Email Address
                </label>
                <input
                  id="unsubEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-[#c5a059] text-xs text-white placeholder-stone-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MailCheck className="w-4 h-4" />
                <span>Unsubscribe from Heritage Bulletins</span>
              </button>

              <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                You can review how we manage your information in our{' '}
                <Link to="/privacy" className="text-[#c5a059] underline hover:text-[#e6ca85]">
                  Privacy Policy
                </Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
