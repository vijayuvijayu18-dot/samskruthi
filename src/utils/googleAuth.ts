/**
 * Google Identity Services (GIS) Utility for SAMSKRUTHI
 * Handles official Google OAuth 2.0 credential responses and JWT decoding
 */

export interface GoogleUserPayload {
  sub: string; // Google User ID
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
}

/**
 * Decodes Google's returned JWT credential without external libraries
 */
export function decodeGoogleCredential(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as GoogleUserPayload;
  } catch (err) {
    console.error('Failed to parse Google credential token:', err);
    return null;
  }
}

/**
 * Checks if a real Google Client ID is configured in the environment
 */
export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

export function isGoogleOAuthConfigured(): boolean {
  const id = getGoogleClientId();
  return Boolean(id && id.trim().length > 0 && !id.includes('YOUR_GOOGLE_CLIENT_ID'));
}

/**
 * Dynamically loads the official Google Identity Services SDK script
 */
export function loadGoogleGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    // Check if script already exists
    if (document.getElementById('google-gsi-client')) {
      return resolve();
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
}
