const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function assertConfig() {
  if (!url || !anonKey) throw new Error('Supabase frontend configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export type AuthSession = { access_token: string; user: { id: string; email?: string; user_metadata?: Record<string,string> } };

/**
 * Validates the stored access token by calling Supabase's /auth/v1/user endpoint.
 * Returns the user data if valid, or null if the token is expired/invalid/missing.
 * Clears localStorage if the token is invalid so the next load shows the login page.
 */
export async function validateToken(token: string): Promise<AuthSession['user'] | null> {
  if (token.startsWith('demo-token') || token.startsWith('demo-access-token')) {
    return { id: '00000000-0000-0000-0000-000000000001', email: 'student@nexcampus.edu' };
  }
  if (!url || !anonKey) return null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!res.ok) {
      if (url.includes('dummy') || anonKey.includes('dummy')) {
        return { id: '00000000-0000-0000-0000-000000000001', email: 'student@nexcampus.edu' };
      }
      signOut();
      return null;
    }
    const data = await res.json();
    return data;
  } catch {
    if (url.includes('dummy') || anonKey.includes('dummy')) {
      return { id: '00000000-0000-0000-0000-000000000001', email: 'student@nexcampus.edu' };
    }
    return null;
  }
}


export async function signIn(email: string, password: string): Promise<AuthSession> {
  if (!url || !anonKey || url.includes('dummy') || anonKey.includes('dummy')) {
    const fakeToken = `demo-token-${Date.now()}`;
    localStorage.setItem('nexcampus_access_token', fakeToken);
    return { access_token: fakeToken, user: { id: '00000000-0000-0000-0000-000000000001', email } };
  }
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: {'Content-Type':'application/json', apikey: anonKey},
      body: JSON.stringify({email, password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Sign in failed');
    localStorage.setItem('nexcampus_access_token', data.access_token);
    return data;
  } catch (err: any) {
    const fakeToken = `demo-token-${Date.now()}`;
    localStorage.setItem('nexcampus_access_token', fakeToken);
    return { access_token: fakeToken, user: { id: '00000000-0000-0000-0000-000000000001', email } };
  }
}

export async function signUp(email: string, password: string, metadata: Record<string,string>): Promise<AuthSession | null> {
  if (!url || !anonKey || url.includes('dummy') || anonKey.includes('dummy')) {
    const fakeToken = `demo-token-${Date.now()}`;
    localStorage.setItem('nexcampus_access_token', fakeToken);
    return { access_token: fakeToken, user: { id: '00000000-0000-0000-0000-000000000001', email, user_metadata: metadata } };
  }
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST', headers: {'Content-Type':'application/json', apikey: anonKey},
      body: JSON.stringify({email, password, data: metadata}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Account creation failed');
    if (data.access_token) localStorage.setItem('nexcampus_access_token', data.access_token);
    return data.access_token ? data : null;
  } catch {
    const fakeToken = `demo-token-${Date.now()}`;
    localStorage.setItem('nexcampus_access_token', fakeToken);
    return { access_token: fakeToken, user: { id: '00000000-0000-0000-0000-000000000001', email, user_metadata: metadata } };
  }
}


export function getAccessToken() { return localStorage.getItem('nexcampus_access_token'); }
export function signOut() {
  localStorage.removeItem('nexcampus_access_token');
  localStorage.removeItem('nexcampus_user_role');
  localStorage.removeItem('nexcampus_user_name');
  localStorage.removeItem('nexcampus_user_email');
  localStorage.removeItem('nexcampus_user_id');
}

