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
    // location pill: cuisine · location rendered as separate text nodes
    expect(screen.getByText('Italian · Centro', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('expone enlace de detalle al id correcto', () => {
    render(
      <MemoryRouter>
        <RestaurantCard {...props} />
      </MemoryRouter>
    );

    // The whole card is a single Link wrapping all content
    const cardLink = screen.getByRole('link', { name: /Casa Luca/i });
    expect(cardLink).toHaveAttribute('href', '/restaurant/42');

    // "Book now" label is rendered inside the card as a div (not a link)
    expect(screen.getByText('restaurant.bookNow')).toBeInTheDocument();
  });

  it('renderiza boton de favorito', () => {
    render(
      <MemoryRouter>
        <RestaurantCard {...props} />
      </MemoryRouter>
    );

    // aria-label uses defaultValue 'Añadir a favoritos' via i18n mock
    expect(screen.getByRole('button', { name: /favoritos/i })).toBeInTheDocument();
  });
});
