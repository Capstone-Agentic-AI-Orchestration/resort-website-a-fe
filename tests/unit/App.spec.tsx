import { renderToString } from 'react-dom/server';

import { App, submitAuth } from '../../src/App';

describe('customer auth pages', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { location: { pathname: '/login' } }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the default title', () => {
    const markup = renderToString(<App />);
    expect(markup).toContain('Welcome back');
  });

  it('renders a custom title', () => {
    const markup = renderToString(<App title="Guest sign in" />);
    expect(markup).toContain('Guest sign in');
  });

  it('renders labeled login controls and navigation to signup', () => {
    const markup = renderToString(<App />);
    expect(markup).toContain('Welcome back');
    expect(markup).toContain('for="email"');
    expect(markup).toContain('for="password"');
    expect(markup).toContain('href="/signup"');
  });

  it('renders signup controls and navigation to login', () => {
    window.location.pathname = '/signup';
    const markup = renderToString(<App />);
    expect(markup).toContain('Create your account');
    expect(markup).toContain('Use at least 8 characters.');
    expect(markup).toContain('href="/login"');
  });

  it.each(['login', 'signup'] as const)('submits %s credentials to its API route', async mode => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'user-1', email: 'guest@example.com' } })
    } as Response);

    await expect(submitAuth(mode, 'guest@example.com', 'password123')).resolves.toEqual({
      user: { id: 'user-1', email: 'guest@example.com' }
    });
    expect(fetchMock).toHaveBeenCalledWith(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'guest@example.com', password: 'password123' })
    });
  });

  it.each(['login', 'signup'] as const)('reports server errors for %s', async mode => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Please check your details.' })
    } as Response);

    await expect(submitAuth(mode, 'guest@example.com', 'bad-password'))
      .rejects.toThrow('Please check your details.');
  });
});
