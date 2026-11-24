import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HeritageSlideshow } from '../components/auth/HeritageSlideshow';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('No reset token provided. Please request a new password reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      setSuccessMsg(res.message || 'Password successfully updated! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset link has expired or is invalid. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HeritageSlideshow autoPlayInterval={6000}>
      <div className="w-full max-w-[390px] mx-auto lg:mr-2 xl:mr-6">
        <div className="relative rounded-2xl bg-[#16100c]/94 border border-heritage-antique-gold/30 p-6 shadow-2xl shadow-black/90 backdrop-blur-md">
          <div className="absolute inset-1 rounded-xl border border-heritage-antique-gold/10 pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-heritage-antique-gold/10 border border-heritage-antique-gold/30 mb-2 text-heritage-antique-gold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-cormorant font-bold text-heritage-warm-ivory tracking-wide">
              Create New Password
            </h2>
            <p className="text-xs text-stone-300 font-sans mt-0.5">
              Choose a strong password for your cultural custodian account.
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 font-sans">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 font-sans">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold">{successMsg}</p>
                <p className="text-[10px] text-emerald-300/80 mt-0.5">Redirecting to login in 2 seconds...</p>
              </div>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-sans font-medium text-heritage-antique-gold mb-1">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-heritage-antique-gold/60">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full h-9 pl-9 pr-9 rounded-lg bg-[#0e0a07] border border-heritage-antique-gold/30 text-xs text-heritage-warm-ivory focus:outline-none focus:border-heritage-antique-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-heritage-warm-ivory"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-heritage-antique-gold mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-heritage-antique-gold/60">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0e0a07] border border-heritage-antique-gold/30 text-xs text-heritage-warm-ivory focus:outline-none focus:border-heritage-antique-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 rounded-xl bg-heritage-antique-gold hover:bg-[#b89047] active:scale-[0.99] text-[#16100c] text-xs font-sans font-semibold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#16100c] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-heritage-antique-gold/15 mt-4">
            <Link to="/login" className="text-xs text-stone-400 hover:text-heritage-antique-gold transition-colors font-sans">
              ← Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </HeritageSlideshow>
  );
};
