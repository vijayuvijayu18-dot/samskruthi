import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  authProvider?: string;
  savedCollectionsCount?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (emailOrUser: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<any>;
  loginWithGoogleCredential: (credential: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogleAccessToken: (accessToken: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleProfile: (profile: { name: string; email: string; avatar?: string }) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  updateProfile: (updates: { name: string; username?: string; bio?: string; avatar?: string }) => Promise<boolean>;
  changePassword: (curr: string, next: string) => Promise<any>;
  deleteAccount: (confirmationText: string, password?: string) => Promise<boolean>;
  exportUserData: () => Promise<any>;
  enterAsGuest: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const STORAGE_KEY = 'samskruthi_authenticated_user';
const TOKEN_KEY = 'samskruthi_token';
const GUEST_KEY = 'samskruthi_guest_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(GUEST_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with storage
  const persistAuth = (userData: User, jwtToken: string, rememberMe = true) => {
    setUser(userData);
    setToken(jwtToken);
    setIsGuest(false);
    sessionStorage.removeItem(GUEST_KEY);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, jwtToken);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      sessionStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  // Refresh profile on boot if token exists
  useEffect(() => {
    if (token) {
      apiService
        .getProfile()
        .then((profile) => {
          if (profile && profile.id) {
            setUser((prev) => ({
              ...prev,
              id: profile.id,
              name: profile.name,
              email: profile.email,
              username: profile.username,
              avatar: profile.avatar || prev?.avatar,
              role: profile.role,
              bio: profile.bio,
              isVerified: profile.isVerified,
              createdAt: profile.createdAt,
            }));
          }
        })
        .catch(() => {
          // Token expired or invalid
          console.warn('Existing session verification expired');
        });
    }
  }, [token]);

  const refreshProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      if (profile && profile.id) {
        setUser((prev) => ({
          ...prev,
          id: profile.id,
          name: profile.name,
          email: profile.email,
          username: profile.username,
          avatar: profile.avatar || prev?.avatar,
          role: profile.role,
          bio: profile.bio,
          isVerified: profile.isVerified,
          createdAt: profile.createdAt,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const login = async (emailOrUser: string, pass: string, rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiService.login(emailOrUser, pass, rememberMe);
      if (data.token && data.user) {
        persistAuth(data.user, data.token, rememberMe);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<any> => {
    setIsLoading(true);
    try {
      const data = await apiService.register(name, email, pass);
      // Strictly enforce verification: do not authenticate unverified registration!
      if (!data.requiresVerification && data.token && data.user) {
        persistAuth(data.user, data.token, true);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    return apiService.resendVerification(email);
  };

  const loginWithGoogleCredential = async (credential: string, rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiService.googleVerify({ credential, rememberMe });
      if (data.token && data.user) {
        persistAuth(data.user, data.token, rememberMe);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleAccessToken = async (accessToken: string, rememberMe = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiService.googleVerify({ accessToken, rememberMe });
      if (data.token && data.user) {
        persistAuth(data.user, data.token, rememberMe);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleProfile = async (profile: {
    name: string;
    email: string;
    avatar?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiService.googleProfileSync({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        rememberMe: true,
      });
      if (data.token && data.user) {
        persistAuth(data.user, data.token, true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google profile sync error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    return loginWithGoogleProfile({
      name: 'Vijay Kumar',
      email: 'vijay.heritage@gmail.com',
    });
  };

  const verifyEmail = async (verifyToken: string) => {
    const res = await apiService.verifyEmail(verifyToken);
    if (res.token && res.user) {
      persistAuth(res.user, res.token, true);
    } else {
      await refreshProfile();
    }
    return res;
  };

  const forgotPassword = async (email: string) => {
    return apiService.forgotPassword(email);
  };

  const resetPassword = async (resetToken: string, newPass: string) => {
    return apiService.resetPassword(resetToken, newPass);
  };

  const updateProfile = async (updates: { name: string; username?: string; bio?: string; avatar?: string }): Promise<boolean> => {
    const res = await apiService.updateProfile(updates);
    if (res.success && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : null));
      return true;
    }
    return false;
  };

  const changePassword = async (curr: string, next: string) => {
    return apiService.changePassword(curr, next);
  };

  const deleteAccount = async (confirmationText: string, pass?: string): Promise<boolean> => {
    const res = await apiService.deleteAccount(confirmationText, pass);
    if (res.success) {
      logout();
      return true;
    }
    return false;
  };

  const exportUserData = async () => {
    return apiService.exportUserData();
  };

  const enterAsGuest = () => {
    setIsGuest(true);
    try {
      sessionStorage.setItem(GUEST_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const logout = () => {
    apiService.logout().catch(() => {});
    setUser(null);
    setToken(null);
    setIsGuest(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(GUEST_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        register,
        loginWithGoogleCredential,
        loginWithGoogleAccessToken,
        loginWithGoogle,
        loginWithGoogleProfile,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        deleteAccount,
        exportUserData,
        enterAsGuest,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  login: async () => false,
  register: async () => ({ success: false, message: '' }),
  loginWithGoogleCredential: async () => false,
  loginWithGoogleAccessToken: async () => false,
  loginWithGoogle: async () => false,
  loginWithGoogleProfile: async () => false,
  verifyEmail: async () => ({ success: false, message: '' }),
  resendVerification: async () => ({ success: false, message: '' }),
  forgotPassword: async () => ({ success: false, message: '' }),
  resetPassword: async () => ({ success: false, message: '' }),
  updateProfile: async () => false,
  changePassword: async () => ({ success: false, message: '' }),
  deleteAccount: async () => false,
  exportUserData: async () => ({}),
  enterAsGuest: () => {},
  logout: () => {},
  refreshProfile: async () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe fallback state during HMR transitions rather than crashing the component tree
    return defaultAuthContext;
  }
  return context;
};
