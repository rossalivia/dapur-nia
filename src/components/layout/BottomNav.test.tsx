import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders all 4 main module links', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <BottomNav />
      </MemoryRouter>
    );

    const menuLink = screen.getByRole('link', { name: /menu/i });
    const pelangganLink = screen.getByRole('link', { name: /pelanggan/i });
    const pesananLink = screen.getByRole('link', { name: /pesanan/i });
    const laporanLink = screen.getByRole('link', { name: /laporan/i });

    expect(menuLink).toBeInTheDocument();
    expect(pelangganLink).toBeInTheDocument();
    expect(pesananLink).toBeInTheDocument();
    expect(laporanLink).toBeInTheDocument();
  });
});
