import { describe, it, expect } from 'vitest';
import { auth } from '@/lib/firebase';
import { UserRole } from './types';

describe('Auth Setup & Types', () => {
  it('should export initialized auth instance', () => {
    expect(auth).toBeDefined();
  });

  it('should define valid UserRoles', () => {
    const roles: UserRole[] = ['admin', 'pelanggan'];
    expect(roles).toContain('admin');
    expect(roles).toContain('pelanggan');
  });
});
