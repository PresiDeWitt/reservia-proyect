import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import CategoryCard from '../../src/components/CategoryCard';

describe('CategoryCard', () => {
  it('renderiza nombre e imagen de categoria', () => {
    render(
      <CategoryCard
        name="Italian"
        image="https://example.com/italian.jpg"
      />
    );

    expect(screen.getByRole('button', { name: 'Italian' })).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('dispara onClick cuando se pulsa', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <CategoryCard
        name="Sushi"
        image="https://example.com/sushi.jpg"
        onClick={onClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Sushi' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aplica estilos de activo cuando active=true', () => {
    render(
      <CategoryCard
        name="Steak"
        image="https://example.com/steak.jpg"
        active
      />
    );

    expect(screen.getByText('Steak')).toHaveClass('text-primary');
  });
});
