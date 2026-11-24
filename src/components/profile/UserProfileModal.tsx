import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Shield,
  History,
  Download,
  Trash2,
  Calendar,
  Mail,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword, deleteAccount, exportUserData, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'history' | 'privacy'>('profile');

  // Edit Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Login History state
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Delete Account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Export Data state
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || 'Custodian of Indian Heritage and Culture');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      setIsLoadingHistory(true);
      apiService
        .getLoginHistory()
        .then((data) => setLoginHistory(data))
        .catch(() => {})
        .finally(() => setIsLoadingHistory(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen || !user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
    setIsSavingProfile(true);

    try {
      await updateProfile({ name, username, bio, avatar });
      setProfileSuccessMsg('Profile changes saved successfully');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New password and confirmation do not match');
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccessMsg('Security credentials updated. Confirmation email dispatched.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccessMsg(''), 4000);
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm termination.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deleteConfirmation, deletePassword);
      onClose();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `samskruthi_archive_${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Active Custodian';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#1c140e] border border-[#c5a059]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2218] bg-[#16100c]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#c5a059] overflow-hidden bg-[#241a12] p-0.5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-[#d4af37] font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#e6ca85] flex items-center gap-2">
                <span>{user.name}</span>
                {user.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#c5a059]" title="Verified Cultural Custodian" />
                )}
              </h2>
              <p className="text-xs text-[#a39482] font-sans">
                {user.email} • <span className="text-[#c5a059]">{user.role || 'Heritage Member'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a39482] hover:text-[#f3ede2] hover:bg-[#2a1e15] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#2d2218] bg-[#16100c]/50 px-6 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Profile Overview', icon: UserIcon },
            { id: 'security', label: 'Security & Passwords', icon: Shield },
            { id: 'history', label: 'Login History', icon: History },
            { id: 'privacy', label: 'Data & Privacy', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 sm:px-3 text-xs sm:text-sm font-sans font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#c5a059] text-[#e6ca85] font-semibold'
                    : 'border-transparent text-[#a39482] hover:text-[#d4af37]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#ede6d8]">
          {/* TAB 1: PROFILE OVERVIEW & EDIT */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}
              {profileErrorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  {profileErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-[#c5a059] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-[#c5a059] uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="cultural_custodian"
                    className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#c5a059] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-10 px-3 rounded-lg bg-[#18110b] border border-[#2d2218] text-sm text-[#a39482] cursor-not-allowed"
                  />
                  {user.isVerified && (
                    <span className="absolute right-3 top-2.5 text-[10px] bg-[#c5a059]/20 text-[#e6ca85] px-2 py-0.5 rounded border border-[#c5a059]/40">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#c5a059] uppercase tracking-wider mb-1.5">
                  Avatar Picture URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-[#c5a059] uppercase tracking-wider mb-1.5">
                  Custodian Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                  placeholder="Write a brief statement about your cultural heritage focus..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#8c7b6d] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined: {formatDate(user.createdAt)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="py-2 px-5 rounded-lg bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORDS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Connected Accounts */}
              <div className="p-4 rounded-xl bg-[#241a12] border border-[#3d2e20] space-y-3">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#c5a059]">
                  Connected Sign-In Providers
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full flex items-center justify-between p-3 rounded-lg bg-[#1a120c] border border-[#2d2218]">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="text-xs font-sans">Google Identity</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                    </span>
                  </div>

                  <div className="flex-1 w-full flex items-center justify-between p-3 rounded-lg bg-[#1a120c] border border-[#2d2218]">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#c5a059]" />
                      <span className="text-xs font-sans">Email / Password</span>
                    </div>
                    <span className="text-[11px] text-[#e6ca85] font-sans font-medium">Configured</span>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#c5a059]">
                  Update Password
                </h3>

                {passSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                    {passSuccessMsg}
                  </div>
                )}
                {passErrorMsg && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                    {passErrorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans text-[#a39482] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password if set"
                    className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-[#a39482] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans text-[#a39482] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      className="w-full h-10 px-3 rounded-lg bg-[#241a12] border border-[#3d2e20] focus:border-[#c5a059] text-sm text-[#f3ede2] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="py-2 px-5 rounded-lg bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: LOGIN HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#c5a059]">
                  Recent Account Sign-Ins
                </h3>
                <span className="text-[11px] text-[#8c7b6d]">Real-time Turso audit log</span>
              </div>

              {isLoadingHistory ? (
                <div className="py-8 text-center text-xs text-[#a39482]">Loading login events...</div>
              ) : loginHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#a39482] bg-[#241a12] rounded-xl border border-[#3d2e20]">
                  No login history recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#3d2e20] bg-[#1a120c]">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#241a12] text-[#c5a059] uppercase tracking-wider border-b border-[#3d2e20]">
                      <tr>
                        <th className="p-3">Method</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Device / Browser</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d2218] text-[#ede6d8]">
                      {loginHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-[#201711]">
                          <td className="p-3 font-medium text-[#e6ca85]">
                            {item.method.replace('_', ' ')}
                          </td>
                          <td className="p-3 text-[#a39482]">{item.ip}</td>
                          <td className="p-3 text-[#8c7b6d] truncate max-w-[160px]">{item.device}</td>
                          <td className="p-3 text-[#a39482] whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                item.status === 'success'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATA & PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Export Data */}
              <div className="p-4 rounded-xl bg-[#241a12] border border-[#3d2e20] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#e6ca85]">Download Your Cultural Archive</h4>
                  <p className="text-xs text-[#a39482] mt-1 max-w-md">
                    Export a GDPR-compliant JSON archive containing your custodian profile, posts, comments, likes, and account activity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="py-2 px-4 rounded-lg bg-[#3d2e20] hover:bg-[#4d3a28] text-[#f3ede2] border border-[#c5a059]/40 text-xs font-sans font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#c5a059]" />
                  <span>{isExporting ? 'Packaging...' : 'Export JSON Data'}</span>
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <h4 className="text-sm font-serif font-bold">Permanently Terminate Account</h4>
                </div>
                <p className="text-xs text-rose-200/70">
                  This action is irreversible. All your cultural posts, contributions, comments, likes, sessions, and credentials will be permanently erased from Turso Cloud Database.
                </p>

                {deleteError && (
                  <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
                    {deleteError}
                  </div>
                )}

                <form onSubmit={handleDeleteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-sans text-rose-300 mb-1">
                      Type <strong>DELETE</strong> in all caps to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="w-full h-10 px-3 rounded-lg bg-[#1a120c] border border-rose-800/60 focus:border-rose-500 text-sm text-rose-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans text-rose-300 mb-1">
                      Enter Account Password (if password-based):
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full h-10 px-3 rounded-lg bg-[#1a120c] border border-rose-800/60 focus:border-rose-500 text-sm text-rose-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                    className="py-2.5 px-4 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-sans font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? 'Deleting Forever...' : 'Confirm Account Deletion'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#2d2218] bg-[#16100c]/80 flex items-center justify-between text-xs font-sans">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-rose-400 hover:text-rose-300 transition-colors"
          >
            Sign Out of Samskruthi
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#2a1e15] hover:bg-[#3d2e20] text-[#a39482] hover:text-[#f3ede2] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
