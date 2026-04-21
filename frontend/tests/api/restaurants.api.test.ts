import { describe, expect, it, vi } from 'vitest';

import { api } from '../../src/api/client';
import { restaurantsApi } from '../../src/api/restaurants';

vi.mock('../../src/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe('restaurantsApi wrapper', () => {
  it('construye query string con search y cuisine', async () => {
    mockedGet.mockResolvedValueOnce({ restaurants: [], total: 0 });

    await restaurantsApi.list({ search: 'sushi', cuisine: 'Japanese' });

    expect(mockedGet).toHaveBeenCalledWith('/restaurants/?search=sushi&cuisine=Japanese');
  });

  it('usa endpoint base cuando no hay filtros', async () => {
    mockedGet.mockResolvedValueOnce({ restaurants: [], total: 0 });

    await restaurantsApi.list();

    expect(mockedGet).toHaveBeenCalledWith('/restaurants/');
  });

  it('llama endpoint de detalle por id', async () => {
    mockedGet.mockResolvedValueOnce({});

    await restaurantsApi.get('21');

    expect(mockedGet).toHaveBeenCalledWith('/restaurants/21/');
  });

  it('llama endpoint de listado de cocinas', async () => {
    mockedGet.mockResolvedValueOnce(['Italian', 'Japanese']);

    await restaurantsApi.cuisines();

    expect(mockedGet).toHaveBeenCalledWith('/restaurants/cuisines/');
  });
});
