import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('env.ts', () => {
  beforeEach(() => {
    // Clear module cache to ensure fresh import each time
    vi.resetModules();
  });

  it('should export ENV object with all required properties', async () => {
    // Set up environment variables
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.NODE_ENV = 'test';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_123';
    process.env.CLERK_SECRET_KEY = 'sk_test_456';

    const { ENV } = await import('./env');

    expect(ENV).toBeDefined();
    expect(ENV).toHaveProperty('PORT');
    expect(ENV).toHaveProperty('DATABASE_URL');
    expect(ENV).toHaveProperty('NODE_ENV');
    expect(ENV).toHaveProperty('FRONTEND_URL');
    expect(ENV).toHaveProperty('CLERK_PUBLISHABLE_KEY');
    expect(ENV).toHaveProperty('CLERK_SECRET_KEY');
  });

  it('should correctly load PORT from environment', async () => {
    process.env.PORT = '8080';
    const { ENV } = await import('./env');
    expect(ENV.PORT).toBe('8080');
  });

  it('should correctly load DATABASE_URL from environment', async () => {
    const dbUrl = 'postgresql://user:pass@localhost:5432/mydb';
    process.env.DATABASE_URL = dbUrl;
    const { ENV } = await import('./env');
    expect(ENV.DATABASE_URL).toBe(dbUrl);
  });

  it('should correctly load NODE_ENV from environment', async () => {
    process.env.NODE_ENV = 'production';
    const { ENV } = await import('./env');
    expect(ENV.NODE_ENV).toBe('production');
  });

  it('should correctly load FRONTEND_URL from environment', async () => {
    const frontendUrl = 'https://example.com';
    process.env.FRONTEND_URL = frontendUrl;
    const { ENV } = await import('./env');
    expect(ENV.FRONTEND_URL).toBe(frontendUrl);
  });

  it('should correctly load CLERK_PUBLISHABLE_KEY from environment', async () => {
    const pubKey = 'pk_live_abcdef123456';
    process.env.CLERK_PUBLISHABLE_KEY = pubKey;
    const { ENV } = await import('./env');
    expect(ENV.CLERK_PUBLISHABLE_KEY).toBe(pubKey);
  });

  it('should correctly load CLERK_SECRET_KEY from environment', async () => {
    const secretKey = 'sk_live_xyz789';
    process.env.CLERK_SECRET_KEY = secretKey;
    const { ENV } = await import('./env');
    expect(ENV.CLERK_SECRET_KEY).toBe(secretKey);
  });

  it('should handle missing environment variables as undefined', async () => {
    // Clear all relevant env vars
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;
    delete process.env.FRONTEND_URL;
    delete process.env.CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;

    const { ENV } = await import('./env');

    expect(ENV.PORT).toBeUndefined();
    expect(ENV.DATABASE_URL).toBeUndefined();
    expect(ENV.NODE_ENV).toBeUndefined();
    expect(ENV.FRONTEND_URL).toBeUndefined();
    expect(ENV.CLERK_PUBLISHABLE_KEY).toBeUndefined();
    expect(ENV.CLERK_SECRET_KEY).toBeUndefined();
  });

  it('should handle empty string environment variables', async () => {
    process.env.PORT = '';
    process.env.DATABASE_URL = '';
    const { ENV } = await import('./env');
    expect(ENV.PORT).toBe('');
    expect(ENV.DATABASE_URL).toBe('');
  });

  it('should preserve special characters in environment variables', async () => {
    const complexDbUrl = 'postgresql://user:p@ss!w0rd@localhost:5432/db?ssl=true';
    process.env.DATABASE_URL = complexDbUrl;
    const { ENV } = await import('./env');
    expect(ENV.DATABASE_URL).toBe(complexDbUrl);
  });

  it('should maintain ENV object immutability structure', async () => {
    process.env.PORT = '3000';
    const { ENV } = await import('./env');

    // ENV should be a plain object
    expect(typeof ENV).toBe('object');
    expect(ENV).not.toBeNull();
  });
});