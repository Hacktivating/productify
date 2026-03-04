import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Pool } from 'pg';

// Mock pg module
vi.mock('pg', () => {
  const mockPool = {
    on: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
    query: vi.fn(),
  };
  return {
    Pool: vi.fn(function(this: any) {
      return mockPool;
    }),
  };
});

// Mock drizzle-orm
vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: vi.fn((config) => ({
    _client: config.client,
    _schema: config.schema,
  })),
}));

describe('db/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Set DATABASE_URL for tests
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Database Connection Setup', () => {
    it('should throw error if DATABASE_URL is not defined', async () => {
      delete process.env.DATABASE_URL;

      await expect(async () => {
        await import('./index');
      }).rejects.toThrow('DATABASE_URL is not defined in environment variables');
    });

    it('should create Pool with correct connection string', async () => {
      const dbUrl = 'postgresql://user:pass@localhost:5432/mydb';
      process.env.DATABASE_URL = dbUrl;

      await import('./index');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: dbUrl,
      });
    });

    it('should create Pool instance', async () => {
      await import('./index');
      expect(Pool).toHaveBeenCalled();
    });

    it('should set up connect event listener on pool', async () => {
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
      await import('./index');

      expect(mockPoolInstance.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('should set up error event listener on pool', async () => {
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
      await import('./index');

      expect(mockPoolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should register both connect and error handlers', async () => {
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
      await import('./index');

      // Should have been called at least twice (once for connect, once for error)
      expect(mockPoolInstance.on).toHaveBeenCalledTimes(2);
    });
  });

  describe('Drizzle Client Initialization', () => {
    it('should export db object', async () => {
      const { db } = await import('./index');
      expect(db).toBeDefined();
    });

    it('should initialize drizzle with pool client', async () => {
      const { drizzle } = await import('drizzle-orm/node-postgres');
      await import('./index');

      expect(drizzle).toHaveBeenCalled();
    });

    it('should initialize drizzle with schema', async () => {
      const { drizzle } = await import('drizzle-orm/node-postgres');
      const schema = await import('./schema');
      await import('./index');

      expect(drizzle).toHaveBeenCalledWith({
        client: expect.any(Object),
        schema: schema,
      });
    });

    it('should create db instance with client and schema', async () => {
      const { db } = await import('./index');

      expect(db).toHaveProperty('_client');
      expect(db).toHaveProperty('_schema');
    });
  });

  describe('Event Handler Behavior', () => {
    it('should log success message on connect event', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });

      await import('./index');

      // Get the connect handler
      const connectCalls = (mockPoolInstance.on as any).mock.calls.filter(
        (call: any) => call[0] === 'connect'
      );
      expect(connectCalls.length).toBeGreaterThan(0);

      const connectHandler = connectCalls[0][1];
      connectHandler();

      expect(consoleSpy).toHaveBeenCalledWith('Connected to PostgreSQL database successfully ✅');
      consoleSpy.mockRestore();
    });

    it('should log error message on error event', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });

      await import('./index');

      // Get the error handler
      const errorCalls = (mockPoolInstance.on as any).mock.calls.filter(
        (call: any) => call[0] === 'error'
      );
      expect(errorCalls.length).toBeGreaterThan(0);

      const errorHandler = errorCalls[0][1];
      const testError = new Error('Connection failed');
      errorHandler(testError);

      expect(consoleSpy).toHaveBeenCalledWith('PostgreSQL connection error ❌ : ', testError);
      consoleSpy.mockRestore();
    });

    it('should handle error event with different error types', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockPoolInstance = new Pool({ connectionString: process.env.DATABASE_URL });

      await import('./index');

      const errorCalls = (mockPoolInstance.on as any).mock.calls.filter(
        (call: any) => call[0] === 'error'
      );
      const errorHandler = errorCalls[0][1];

      // Test with string error
      errorHandler('String error');
      expect(consoleSpy).toHaveBeenCalledWith('PostgreSQL connection error ❌ : ', 'String error');

      // Test with null
      errorHandler(null);
      expect(consoleSpy).toHaveBeenCalledWith('PostgreSQL connection error ❌ : ', null);

      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle DATABASE_URL with special characters', async () => {
      const complexUrl = 'postgresql://user:p@ss!w0rd@host:5432/db?ssl=true&connect_timeout=10';
      process.env.DATABASE_URL = complexUrl;

      await import('./index');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: complexUrl,
      });
    });

    it('should handle DATABASE_URL with IPv6 address', async () => {
      const ipv6Url = 'postgresql://[::1]:5432/test';
      process.env.DATABASE_URL = ipv6Url;

      await import('./index');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: ipv6Url,
      });
    });

    it('should handle DATABASE_URL with query parameters', async () => {
      const urlWithParams = 'postgresql://localhost:5432/test?schema=public&ssl=true';
      process.env.DATABASE_URL = urlWithParams;

      await import('./index');

      expect(Pool).toHaveBeenCalledWith({
        connectionString: urlWithParams,
      });
    });

    it('should throw error for empty string DATABASE_URL', async () => {
      process.env.DATABASE_URL = '';

      await expect(async () => {
        await import('./index');
      }).rejects.toThrow('DATABASE_URL is not defined in environment variables');
    });
  });

  describe('Module Exports', () => {
    it('should export db as named export', async () => {
      const module = await import('./index');
      expect(module).toHaveProperty('db');
    });

    it('should not export default', async () => {
      const module = await import('./index');
      expect(module.default).toBeUndefined();
    });
  });

  describe('Connection Pool Behavior', () => {
    it('should create only one pool instance per import', async () => {
      await import('./index');
      expect(Pool).toHaveBeenCalledTimes(1);
    });

    it('should use the same pool instance for multiple imports', async () => {
      const { db: db1 } = await import('./index');
      const { db: db2 } = await import('./index');

      // Both should reference the same pool
      expect(db1).toBe(db2);
    });
  });
});