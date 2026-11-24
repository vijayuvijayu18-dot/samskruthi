import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HeritageSlideshow } from '../components/auth/HeritageSlideshow';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in link. Please check your email or request a new link.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Your email has been successfully verified! Welcome to Samskruthi.');
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification link has expired or is invalid. Please request a new one.');
      });
  }, [token, verifyEmail, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendMessage('');
    try {
      const res = await resendVerification(resendEmail.trim());
      setResendMessage(res.message || 'Fresh verification email dispatched. Please check your inbox.');
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <HeritageSlideshow autoPlayInterval={6000}>
      <div className="w-full max-w-[400px] mx-auto lg:mr-2 xl:mr-6">
        <div className="relative rounded-2xl bg-[#16100c]/94 border border-heritage-antique-gold/30 p-6 shadow-2xl shadow-black/90 backdrop-blur-md text-center">
          <div className="absolute inset-1 rounded-xl border border-heritage-antique-gold/10 pointer-events-none" />

          {/* Icon Header */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-heritage-antique-gold/10 border border-heritage-antique-gold/30 mb-3 text-heritage-antique-gold">
            {status === 'loading' && <RefreshCw className="w-6 h-6 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            {status === 'error' && <AlertTriangle className="w-6 h-6 text-rose-400" />}
          </div>

          <h2 className="text-xl font-cormorant font-bold text-heritage-warm-ivory tracking-wide mb-1">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Notice'}
          </h2>

          <p className="text-xs text-stone-300 font-sans leading-relaxed mb-4">{message}</p>

          {/* Success Redirect CTA */}
          {status === 'success' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="w-full py-2.5 px-4 rounded-xl bg-heritage-antique-gold hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Enter Cultural Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-stone-400">Redirecting automatically in 3 seconds...</p>
            </div>
          )}

          {/* Error / Resend Form */}
          {status === 'error' && (
            <div className="pt-2 border-t border-heritage-antique-gold/15 space-y-3 text-left">
              <span className="text-xs font-sans text-heritage-antique-gold block text-center font-medium">
                Need a new verification link?
              </span>

              {resendMessage && (
                <div className="p-2.5 rounded-lg bg-[#241a12] border border-heritage-antique-gold/30 text-heritage-warm-ivory text-xs text-center">
                  {resendMessage}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-heritage-antique-gold/60">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    placeholder="Enter your registered email"
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0e0a07] border border-heritage-antique-gold/30 text-xs text-heritage-warm-ivory focus:outline-none focus:border-heritage-antique-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full py-2 rounded-lg bg-heritage-antique-gold hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-semibold tracking-wide uppercase transition-all disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-stone-400 hover:text-heritage-antique-gold transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </HeritageSlideshow>
  );
};
