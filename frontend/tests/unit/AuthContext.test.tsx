import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AuthProvider, useAuth } from '../../src/context/AuthContext';

const Probe = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="auth-email">{user?.email ?? 'none'}</span>
      <button
        onClick={() =>
          login('token-123', {
            id: 1,
            name: 'Ana',
            email: 'ana@example.com',
          })
        }
      >
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

describe('AuthContext', () => {
  it('arranca sin sesion por defecto', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('no');
      expect(screen.getByTestId('auth-email')).toHaveTextContent('none');
    });
  });

  it('hidrata sesion almacenada en localStorage', async () => {
    localStorage.setItem('reservia_token', 'stored-token');
    localStorage.setItem(
      'reservia_user',
      JSON.stringify({ id: 9, name: 'Stored', email: 'stored@example.com' })
    );

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('yes');
      expect(screen.getByTestId('auth-email')).toHaveTextContent('stored@example.com');
    });
  });

  it('login guarda token y usuario en localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'login' }));

    expect(localStorage.getItem('reservia_token')).toBe('token-123');
    expect(localStorage.getItem('reservia_user')).toContain('ana@example.com');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('yes');
  });

  it('logout limpia la sesion', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'login' }));
    await user.click(screen.getByRole('button', { name: 'logout' }));

    expect(localStorage.getItem('reservia_token')).toBeNull();
    expect(localStorage.getItem('reservia_user')).toBeNull();
    expect(screen.getByTestId('auth-state')).toHaveTextContent('no');
  });
});
