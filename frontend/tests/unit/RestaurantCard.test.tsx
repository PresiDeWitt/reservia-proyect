import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import RestaurantCard from '../../src/components/RestaurantCard';

describe('RestaurantCard', () => {
  const props = {
    id: '42',
    name: 'Casa Luca',
    image: 'https://example.com/luca.jpg',
    cuisine: 'Italian',
    location: 'Centro',
    distance: '1.2 km',
    rating: 4.7,
    priceRange: '$$',
  };

  it('muestra informacion principal del restaurante', () => {
    render(
      <MemoryRouter>
        <RestaurantCard {...props} />
      </MemoryRouter>
    );

    expect(screen.getByText('Casa Luca')).toBeInTheDocument();
    expect(screen.getByText('Italian • Centro • 1.2 km')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('expone enlaces de detalle y reserva al id correcto', () => {
    render(
      <MemoryRouter>
        <RestaurantCard {...props} />
      </MemoryRouter>
    );

    const nameLinks = screen.getAllByRole('link', { name: /Casa Luca/i });
    nameLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/restaurant/42');
    });

    expect(screen.getByRole('link', { name: 'restaurant.bookNow' })).toHaveAttribute(
      'href',
      '/restaurant/42'
    );
  });

  it('renderiza acciones de tarjeta esperadas', () => {
    render(
      <MemoryRouter>
        <RestaurantCard {...props} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'restaurant.menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
  });
});
