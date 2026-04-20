import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { reservationsApi } from '../../src/api/reservations';
import { AuthProvider } from '../../src/context/AuthContext';
import MyBookings from '../../src/pages/MyBookings';

vi.mock('../../src/api/reservations', () => ({
  reservationsApi: {
    create: vi.fn(),
    myReservations: vi.fn(),
    cancel: vi.fn(),
  },
}));

const mockedMyReservations = vi.mocked(reservationsApi.myReservations);
const mockedCancel = vi.mocked(reservationsApi.cancel);

const renderMyBookings = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

const sampleReservation = {
  id: 10,
  restaurantId: '2',
  restaurantName: 'Sushi House',
  restaurantAddress: 'Gran Via 12',
  restaurantImage: 'https://example.com/sushi.jpg',
  restaurantCuisine: 'Japanese',
  date: '2026-10-20',
  time: '20:30:00',
  guests: 3,
  status: 'confirmed' as const,
  created_at: '2026-10-10T10:00:00Z',
};

describe('MyBookings flow', () => {
  it('muestra mensaje de login cuando no hay sesion', async () => {
    mockedMyReservations.mockResolvedValue([]);
    renderMyBookings();

    expect(await screen.findByText('Sign in to see your bookings.')).toBeInTheDocument();
    expect(mockedMyReservations).not.toHaveBeenCalled();
  });

  it('lista reservas del usuario autenticado', async () => {
    localStorage.setItem('reservia_token', 'token-abc');
    localStorage.setItem(
      'reservia_user',
      JSON.stringify({ id: 1, name: 'Ana', email: 'ana@example.com' })
    );
    mockedMyReservations.mockResolvedValue([sampleReservation]);

    renderMyBookings();

    expect(await screen.findByText('Sushi House')).toBeInTheDocument();
    expect(mockedMyReservations).toHaveBeenCalledTimes(1);
    expect(screen.getByText('bookings.confirmed')).toBeInTheDocument();
  });

  it('permite cancelar una reserva confirmada y actualiza estado', async () => {
    const user = userEvent.setup();
    localStorage.setItem('reservia_token', 'token-abc');
    localStorage.setItem(
      'reservia_user',
      JSON.stringify({ id: 1, name: 'Ana', email: 'ana@example.com' })
    );
    mockedMyReservations.mockResolvedValue([sampleReservation]);
    mockedCancel.mockResolvedValue({ message: 'Reservation cancelled' });

    renderMyBookings();

    await screen.findByText('Sushi House');
    await user.click(screen.getByRole('button', { name: 'bookings.cancel' }));

    await waitFor(() => {
      expect(mockedCancel).toHaveBeenCalledWith(10);
    });

    expect(screen.getByText('bookings.cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'bookings.cancel' })).not.toBeInTheDocument();
  });
});
