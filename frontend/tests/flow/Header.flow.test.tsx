import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Header from '../../src/components/Header';
import { useAuth } from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/components/AuthModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal">auth-modal-open</div> : null,
}));

vi.mock('../../src/components/LanguageMenu', () => ({
  default: () => <div data-testid="language-menu" />,
}));

vi.mock('../../src/components/ProfileMenu', () => ({
  default: () => <div data-testid="profile-menu" />,
}));

const mockedUseAuth = vi.mocked(useAuth);

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderHeader = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Header />
      <LocationProbe />
    </MemoryRouter>
  );

describe('Header flow', () => {
  it('muestra boton de login y abre modal en modo no autenticado', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: 'header.signIn' }));

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('muestra enlace de mis reservas y menu de perfil si hay sesion', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, name: 'Ana', email: 'ana@example.com' },
      token: 'token-1',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    renderHeader();

    expect(screen.getByRole('link', { name: 'header.myBookings' })).toBeInTheDocument();
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
  });

  it('navega con query search al enviar el formulario del header', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    renderHeader();

    await user.type(screen.getByPlaceholderText('header.searchPlaceholder'), 'sushi{enter}');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/?search=sushi');
    });
  });
});
