import { FormEvent, useState } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthResponse {
  user?: { id: string; email: string };
}

export async function submitAuth(mode: AuthMode, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let message = mode === 'login' ? 'Unable to log in with those details.' : 'Unable to create your account.';
    try {
      const payload = await response.json() as { error?: string; message?: string };
      message = payload.error || payload.message || message;
    } catch {
      // Keep the fallback when the server does not return JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<AuthResponse>;
}

export function App() {
  const mode: AuthMode = window.location.pathname.replace(/\/$/, '') === '/signup' ? 'signup' : 'login';
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setPending(true);
    try {
      const result = await submitAuth(mode, email, password);
      setSuccess(`You’re ${isSignup ? 'signed up' : 'logged in'} as ${result.user?.email || email}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', background: '#f4f7f4', color: '#18352d', fontFamily: 'system-ui, sans-serif' }}>
      <section aria-labelledby="auth-title" style={{ width: 'min(100%, 26rem)', padding: '2.5rem', borderRadius: '1rem', background: '#fff', boxShadow: '0 16px 50px #153d2b18' }}>
        <p style={{ margin: '0 0 .5rem', color: '#567565', letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '.75rem' }}>Resort guest account</p>
        <h1 id="auth-title" style={{ margin: '0 0 .5rem', fontSize: '2rem' }}>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p style={{ margin: '0 0 1.75rem', color: '#52645d' }}>{isSignup ? 'Sign up to get started with your guest account.' : 'Log in to continue to your guest account.'}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '.4rem', fontWeight: 600 }}>Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} aria-invalid={Boolean(error)} style={inputStyle} />
          <label htmlFor="password" style={{ display: 'block', margin: '1rem 0 .4rem', fontWeight: 600 }}>Password</label>
          <input id="password" name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={isSignup ? 8 : 1} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={isSignup ? 'password-hint' : undefined} style={inputStyle} />
          {isSignup && <p id="password-hint" style={{ margin: '.4rem 0 0', color: '#52645d', fontSize: '.875rem' }}>Use at least 8 characters.</p>}
          {error && <p role="alert" style={{ color: '#a22c2c', margin: '1rem 0 0' }}>{error}</p>}
          {success && <p role="status" style={{ color: '#216344', margin: '1rem 0 0' }}>{success}</p>}
          <button type="submit" disabled={pending} style={{ width: '100%', marginTop: '1.5rem', padding: '.85rem 1rem', border: 0, borderRadius: '.5rem', background: '#24634b', color: 'white', font: 'inherit', fontWeight: 700, cursor: pending ? 'wait' : 'pointer' }}>
            {pending ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p style={{ margin: '1.5rem 0 0', textAlign: 'center', color: '#52645d' }}>
          {isSignup ? 'Already have an account? ' : 'New to our resort? '}
          <a href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</a>
        </p>
      </section>
    </main>
  );
}

const inputStyle = { boxSizing: 'border-box' as const, width: '100%', padding: '.75rem', border: '1px solid #aabbb2', borderRadius: '.45rem', font: 'inherit' };
