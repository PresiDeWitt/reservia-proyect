import { describe, expect, it, vi } from 'vitest';

import { api } from '../../src/api/client';
import { authApi } from '../../src/api/auth';
import { reservationsApi } from '../../src/api/reservations';

vi.mock('../../src/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedDelete = vi.mocked(api.delete);

describe('authApi wrapper', () => {
  it('register llama endpoint correcto con payload', async () => {
    const payload = {
      first_name: 'Ana',
      last_name: 'Soto',
      phone: '+34123456789',
      email: 'ana@example.com',
      password: 'secret123',
    };
    mockedPost.mockResolvedValueOnce({ token: 'x', refresh: 'y', user: { id: 1, name: 'Ana', email: 'ana@example.com' } });

    await authApi.register(payload);

    expect(mockedPost).toHaveBeenCalledWith('/auth/register/', payload);
  });

  it('login llama endpoint correcto con payload', async () => {
    const payload = { email: 'ana@example.com', password: 'secret123' };
    mockedPost.mockResolvedValueOnce({ token: 'x', refresh: 'y', user: { id: 1, name: 'Ana', email: 'ana@example.com' } });

    await authApi.login(payload);

    expect(mockedPost).toHaveBeenCalledWith('/auth/login/', payload);
  });
});

describe('reservationsApi wrapper', () => {
  it('create llama endpoint correcto', async () => {
    const payload = {
      restaurantId: 5,
      date: '2026-10-20',
      time: '20:30:00',
      guests: 2,
    };
    mockedPost.mockResolvedValueOnce({});

    await reservationsApi.create(payload);

    expect(mockedPost).toHaveBeenCalledWith('/reservations/', payload);
  });

  it('myReservations usa endpoint de reservas del usuario', async () => {
    mockedGet.mockResolvedValueOnce([]);

    await reservationsApi.myReservations();

    expect(mockedGet).toHaveBeenCalledWith('/reservations/my/');
  });

  it('cancel usa endpoint con id', async () => {
    mockedDelete.mockResolvedValueOnce({ message: 'ok' });

    await reservationsApi.cancel(77);

    expect(mockedDelete).toHaveBeenCalledWith('/reservations/77/');
  });
});
