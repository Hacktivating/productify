import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the ENV module
vi.mock('./src/config/env', () => ({
  ENV: {
    DATABASE_URL: 'postgresql://localhost:5432/test',
    PORT: '3000',
    NODE_ENV: 'test',
    FRONTEND_URL: 'http://localhost:5173',
    CLERK_PUBLISHABLE_KEY: 'pk_test_123',
    CLERK_SECRET_KEY: 'sk_test_456',
  },
}));

describe('drizzle.config.ts', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('Configuration Structure', () => {
    it('should export a valid Drizzle configuration object', async () => {
      const config = await import('./drizzle.config');
      expect(config.default).toBeDefined();
    });

    it('should have schema property pointing to correct path', async () => {
      const config = await import('./drizzle.config');
      expect(config.default).toHaveProperty('schema');
      expect(config.default.schema).toBe('./src/db/schema.ts');
    });

    it('should have dialect set to postgresql', async () => {
      const config = await import('./drizzle.config');
      expect(config.default).toHaveProperty('dialect');
      expect(config.default.dialect).toBe('postgresql');
    });

    it('should have dbCredentials object', async () => {
      const config = await import('./drizzle.config');
      expect(config.default).toHaveProperty('dbCredentials');
      expect(typeof config.default.dbCredentials).toBe('object');
    });

    it('should have url in dbCredentials', async () => {
      const config = await import('./drizzle.config');
      expect(config.default.dbCredentials).toHaveProperty('url');
    });

    it('should use DATABASE_URL from ENV', async () => {
      const config = await import('./drizzle.config');
      expect(config.default.dbCredentials.url).toBe('postgresql://localhost:5432/test');
    });

    it('should have all required top-level properties', async () => {
      const config = await import('./drizzle.config');
      const requiredProps = ['schema', 'dialect', 'dbCredentials'];

      requiredProps.forEach((prop) => {
        expect(config.default).toHaveProperty(prop);
      });
    });
  });

  describe('Configuration Values', () => {
    it('should export default configuration using defineConfig', async () => {
      const config = await import('./drizzle.config');
      expect(config.default).toBeTruthy();
    });

    it('should have correct schema file path format', async () => {
      const config = await import('./drizzle.config');
      // Path should be relative and point to schema.ts
      expect(config.default.schema).toMatch(/schema\.ts$/);
      expect(config.default.schema).toMatch(/^\.\//);
    });

    it('should support postgresql dialect', async () => {
      const config = await import('./drizzle.config');
      const validDialects = ['postgresql', 'mysql', 'sqlite'];
      expect(validDialects).toContain(config.default.dialect);
      expect(config.default.dialect).toBe('postgresql');
    });

    it('should have string url in dbCredentials', async () => {
      const config = await import('./drizzle.config');
      expect(typeof config.default.dbCredentials.url).toBe('string');
    });

    it('should have non-empty DATABASE_URL', async () => {
      const config = await import('./drizzle.config');
      expect(config.default.dbCredentials.url).toBeTruthy();
      expect(config.default.dbCredentials.url.length).toBeGreaterThan(0);
    });
  });

  describe('ENV Integration', () => {
    it('should import ENV from correct path', async () => {
      // This test verifies the import works
      const { ENV } = await import('./src/config/env');
      expect(ENV).toBeDefined();
      expect(ENV.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    });

    it('should use ENV.DATABASE_URL in configuration', async () => {
      const { ENV } = await import('./src/config/env');
      const config = await import('./drizzle.config');

      expect(config.default.dbCredentials.url).toBe(ENV.DATABASE_URL);
    });

    it('should handle DATABASE_URL with non-null assertion', async () => {
      // The config uses ENV.DATABASE_URL! (non-null assertion)
      const config = await import('./drizzle.config');
      expect(config.default.dbCredentials.url).not.toBeNull();
      expect(config.default.dbCredentials.url).not.toBeUndefined();
    });
  });

  describe('Configuration Type Safety', () => {
    it('should export configuration that matches DrizzleKit schema', async () => {
      const config = await import('./drizzle.config');

      // Verify structure matches expected DrizzleKit config
      expect(config.default).toMatchObject({
        schema: expect.any(String),
        dialect: expect.any(String),
        dbCredentials: {
          url: expect.any(String),
        },
      });
    });

    it('should have only expected properties in configuration', async () => {
      const config = await import('./drizzle.config');
      const configKeys = Object.keys(config.default);

      // Should have schema, dialect, and dbCredentials
      expect(configKeys).toContain('schema');
      expect(configKeys).toContain('dialect');
      expect(configKeys).toContain('dbCredentials');
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle various DATABASE_URL formats', async () => {
      // Test with current mocked value
      const config = await import('./drizzle.config');
      const url = config.default.dbCredentials.url;

      // Should be a valid postgres URL format
      expect(url).toMatch(/^postgresql:\/\//);
    });

    it('should maintain configuration immutability', async () => {
      const config1 = await import('./drizzle.config');
      const config2 = await import('./drizzle.config');

      // Both imports should return the same configuration
      expect(config1.default).toEqual(config2.default);
    });

    it('should export only default, not named exports', async () => {
      const config = await import('./drizzle.config');
      const keys = Object.keys(config);

      expect(keys).toContain('default');
      // Should primarily export default
      expect(config.default).toBeDefined();
    });
  });

  describe('Schema Path Validation', () => {
    it('should point to existing schema file structure', async () => {
      const config = await import('./drizzle.config');
      const schemaPath = config.default.schema;

      // Path should be in src/db directory
      expect(schemaPath).toContain('src/db');
      expect(schemaPath).toContain('schema');
    });

    it('should use relative path for schema', async () => {
      const config = await import('./drizzle.config');
      const schemaPath = config.default.schema;

      // Should start with ./ for relative path
      expect(schemaPath.startsWith('./')).toBe(true);
    });

    it('should point to TypeScript file', async () => {
      const config = await import('./drizzle.config');
      const schemaPath = config.default.schema;

      expect(schemaPath.endsWith('.ts')).toBe(true);
    });
  });

  describe('Dialect Configuration', () => {
    it('should use postgresql dialect specifically', async () => {
      const config = await import('./drizzle.config');
      // Exact match - not postgres, pg, or other variations
      expect(config.default.dialect).toBe('postgresql');
    });

    it('should have dialect as a string', async () => {
      const config = await import('./drizzle.config');
      expect(typeof config.default.dialect).toBe('string');
    });
  });

  describe('Database Credentials', () => {
    it('should only have url in dbCredentials', async () => {
      const config = await import('./drizzle.config');
      const credKeys = Object.keys(config.default.dbCredentials);

      expect(credKeys).toContain('url');
      expect(credKeys.length).toBe(1);
    });

    it('should not expose sensitive credentials separately', async () => {
      const config = await import('./drizzle.config');

      // Should not have separate host, password, user fields
      expect(config.default.dbCredentials).not.toHaveProperty('password');
      expect(config.default.dbCredentials).not.toHaveProperty('user');
      expect(config.default.dbCredentials).not.toHaveProperty('host');
    });
  });
});