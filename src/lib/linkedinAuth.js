// ==========================================
// SquadIn LinkedIn OAuth 2.0 OpenID Connect
// ==========================================

export const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';

export const getRedirectUri = () => {
  if (typeof window === 'undefined') return 'https://squad-in.vercel.app/';
  return `${window.location.origin}/`;
};

// Generates the official LinkedIn OpenID Connect Authorization URL
export const initiateLinkedInLogin = () => {
  const state = `squadin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem('squadin_linkedin_oauth_state', state);

  const redirectUri = encodeURIComponent(getRedirectUri());
  const scope = encodeURIComponent('openid profile email');

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

  window.location.href = authUrl;
};

// Checks if the current URL has an incoming LinkedIn OAuth code callback
export const checkLinkedInCallback = () => {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.warn('LinkedIn OAuth error:', error);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }

  if (code) {
    const savedState = localStorage.getItem('squadin_linkedin_oauth_state');
    if (!savedState || state !== savedState) {
      console.warn('LinkedIn OAuth state mismatch — possible CSRF');
      window.history.replaceState({}, document.title, window.location.pathname);
      return null;
    }
    localStorage.removeItem('squadin_linkedin_oauth_state');
    
    // Successfully received LinkedIn OAuth Code
    window.history.replaceState({}, document.title, window.location.pathname);
    return { code, state, success: true };
  }

  return null;
};
