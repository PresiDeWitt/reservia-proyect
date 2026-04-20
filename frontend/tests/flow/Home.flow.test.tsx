import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Home from '../../src/pages/Home';
import type { Restaurant } from '../../src/api/restaurants';
import { restaurantsApi } from '../../src/api/restaurants';

vi.mock('../../src/api/restaurants', () => ({
  restaurantsApi: {
    list: vi.fn(),
  },
}));

const mockedList = vi.mocked(restaurantsApi.list);

const sampleRestaurant: Restaurant = {
  id: '1',
  name: 'Casa Luca',
  cuisine: 'Italian',
  location: 'Centro',
  distance: '1.1 km',
  rating: 4.8,
  priceRange: '$$',
  address: 'Calle A 1',
  image: 'https://example.com/1.jpg',
  reviewsCount: 120,
  coords: [40.4, -3.7],
};

const renderHome = (entry = '/') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

describe('Home flow', () => {
  it('carga restaurantes y muestra resultados', async () => {
    mockedList.mockResolvedValueOnce({
      restaurants: [sampleRestaurant],
      total: 1,
    });

    renderHome('/');

    expect(await screen.findByText('Casa Luca')).toBeInTheDocument();
    expect(mockedList).toHaveBeenCalledWith({ search: undefined, cuisine: undefined });
    expect(screen.getByText(/1\s+home\.results/i)).toBeInTheDocument();
  });

  it('muestra estado sin resultados cuando la busqueda no devuelve datos', async () => {
    mockedList.mockResolvedValueOnce({
      restaurants: [],
      total: 0,
    });

    renderHome('/?search=sushi');

    expect(await screen.findByText('home.noResults')).toBeInTheDocument();
    expect(mockedList).toHaveBeenCalledWith({ search: 'sushi', cuisine: undefined });
    expect(screen.getAllByText('home.clearFilters').length).toBeGreaterThan(0);
  });

  it('aplica filtro por categoria al pulsar una categoria', async () => {
    const user = userEvent.setup();
    mockedList.mockResolvedValue({ restaurants: [], total: 0 });

    renderHome('/');

    await waitFor(() => {
      expect(mockedList).toHaveBeenCalledWith({ search: undefined, cuisine: undefined });
    });

    await user.click(screen.getByRole('button', { name: 'Italian' }));

    await waitFor(() => {
      expect(mockedList).toHaveBeenLastCalledWith({ search: undefined, cuisine: 'Italian' });
    });
  });
});
