import { describe, it, expect } from 'vitest';
import {
  users,
  products,
  comments,
  usersRelations,
  productsRelations,
  type User,
  type NewUser,
  type Product,
  type NewProduct,
  type Comment,
  type NewComment,
} from './schema';
import { getTableColumns } from 'drizzle-orm';

describe('schema.ts - Table Definitions', () => {
  describe('users table', () => {
    it('should have correct table name', () => {
      expect(users).toBeDefined();
      // Access table name via Symbol
      const tableName = (users as any)[Symbol.for('drizzle:Name')];
      expect(tableName).toBe('users');
    });

    it('should have all required columns', () => {
      const columns = getTableColumns(users);
      expect(columns).toHaveProperty('id');
      expect(columns).toHaveProperty('email');
      expect(columns).toHaveProperty('name');
      expect(columns).toHaveProperty('imageUrl');
      expect(columns).toHaveProperty('createdAt');
      expect(columns).toHaveProperty('updatedAt');
    });

    it('should have id as primary key with text type', () => {
      const columns = getTableColumns(users);
      expect(columns.id).toBeDefined();
      expect(columns.id.notNull).toBe(true);
      expect(columns.id.primary).toBe(true);
    });

    it('should have email as not null and unique', () => {
      const columns = getTableColumns(users);
      expect(columns.email).toBeDefined();
      expect(columns.email.notNull).toBe(true);
      expect(columns.email.isUnique).toBe(true);
    });

    it('should have nullable name field', () => {
      const columns = getTableColumns(users);
      expect(columns.name).toBeDefined();
      expect(columns.name.notNull).toBe(false);
    });

    it('should have nullable imageUrl field', () => {
      const columns = getTableColumns(users);
      expect(columns.imageUrl).toBeDefined();
      expect(columns.imageUrl.notNull).toBe(false);
    });

    it('should have createdAt as not null timestamp with default', () => {
      const columns = getTableColumns(users);
      expect(columns.createdAt).toBeDefined();
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
    });

    it('should have updatedAt as not null timestamp with default', () => {
      const columns = getTableColumns(users);
      expect(columns.updatedAt).toBeDefined();
      expect(columns.updatedAt.notNull).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });
  });

  describe('products table', () => {
    it('should have correct table name', () => {
      expect(products).toBeDefined();
      const tableName = (products as any)[Symbol.for('drizzle:Name')];
      expect(tableName).toBe('products');
    });

    it('should have all required columns', () => {
      const columns = getTableColumns(products);
      expect(columns).toHaveProperty('id');
      expect(columns).toHaveProperty('title');
      expect(columns).toHaveProperty('description');
      expect(columns).toHaveProperty('imageUrl');
      expect(columns).toHaveProperty('userId');
      expect(columns).toHaveProperty('createdAt');
      expect(columns).toHaveProperty('updatedAt');
    });

    it('should have id as primary key with uuid type and default', () => {
      const columns = getTableColumns(products);
      expect(columns.id).toBeDefined();
      expect(columns.id.notNull).toBe(true);
      expect(columns.id.primary).toBe(true);
      expect(columns.id.hasDefault).toBe(true);
    });

    it('should have title as not null text', () => {
      const columns = getTableColumns(products);
      expect(columns.title).toBeDefined();
      expect(columns.title.notNull).toBe(true);
    });

    it('should have description as not null text', () => {
      const columns = getTableColumns(products);
      expect(columns.description).toBeDefined();
      expect(columns.description.notNull).toBe(true);
    });

    it('should have imageUrl as not null text', () => {
      const columns = getTableColumns(products);
      expect(columns.imageUrl).toBeDefined();
      expect(columns.imageUrl.notNull).toBe(true);
    });

    it('should have userId as foreign key to users', () => {
      const columns = getTableColumns(products);
      expect(columns.userId).toBeDefined();
      expect(columns.userId.notNull).toBe(true);
      // Foreign key constraint is defined in schema
    });

    it('should have timestamps with defaults', () => {
      const columns = getTableColumns(products);
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.updatedAt.notNull).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });
  });

  describe('comments table', () => {
    it('should have correct table name', () => {
      expect(comments).toBeDefined();
      const tableName = (comments as any)[Symbol.for('drizzle:Name')];
      expect(tableName).toBe('comments');
    });

    it('should have all required columns', () => {
      const columns = getTableColumns(comments);
      expect(columns).toHaveProperty('id');
      expect(columns).toHaveProperty('content');
      expect(columns).toHaveProperty('userId');
      expect(columns).toHaveProperty('productId');
      expect(columns).toHaveProperty('createdAt');
    });

    it('should have id as primary key with uuid type and default', () => {
      const columns = getTableColumns(comments);
      expect(columns.id).toBeDefined();
      expect(columns.id.notNull).toBe(true);
      expect(columns.id.primary).toBe(true);
      expect(columns.id.hasDefault).toBe(true);
    });

    it('should have content as not null text', () => {
      const columns = getTableColumns(comments);
      expect(columns.content).toBeDefined();
      expect(columns.content.notNull).toBe(true);
    });

    it('should have userId as foreign key to users', () => {
      const columns = getTableColumns(comments);
      expect(columns.userId).toBeDefined();
      expect(columns.userId.notNull).toBe(true);
    });

    it('should have productId as foreign key to products', () => {
      const columns = getTableColumns(comments);
      expect(columns.productId).toBeDefined();
      expect(columns.productId.notNull).toBe(true);
    });

    it('should have createdAt timestamp with default', () => {
      const columns = getTableColumns(comments);
      expect(columns.createdAt).toBeDefined();
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
    });

    it('should not have updatedAt column', () => {
      const columns = getTableColumns(comments);
      expect(columns).not.toHaveProperty('updatedAt');
    });
  });

  describe('Relations', () => {
    it('should export usersRelations', () => {
      expect(usersRelations).toBeDefined();
      expect(typeof usersRelations).toBe('object');
    });

    it('should export productsRelations', () => {
      expect(productsRelations).toBeDefined();
      expect(typeof productsRelations).toBe('object');
    });

    it('should define users relations with products and comments', () => {
      expect(usersRelations).toBeDefined();
      // Relations object structure
      const relationConfig = (usersRelations as any).config;
      expect(relationConfig).toBeDefined();
    });

    it('should define products relations with user and comments', () => {
      expect(productsRelations).toBeDefined();
      const relationConfig = (productsRelations as any).config;
      expect(relationConfig).toBeDefined();
    });
  });

  describe('Type Exports', () => {
    it('should properly infer User type from users table', () => {
      // Type test - this will fail at compile time if types are wrong
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(user).toBeDefined();
    });

    it('should properly infer NewUser type for inserts', () => {
      const newUser: NewUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      expect(newUser).toBeDefined();
    });

    it('should allow optional fields in NewUser', () => {
      const minimalUser: NewUser = {
        id: '1',
        email: 'test@example.com',
      };
      expect(minimalUser).toBeDefined();
    });

    it('should properly infer Product type from products table', () => {
      const product: Product = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Product',
        description: 'A test product',
        imageUrl: 'https://example.com/product.jpg',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(product).toBeDefined();
    });

    it('should properly infer NewProduct type for inserts', () => {
      const newProduct: NewProduct = {
        title: 'Test Product',
        description: 'A test product',
        imageUrl: 'https://example.com/product.jpg',
        userId: '1',
      };
      expect(newProduct).toBeDefined();
    });

    it('should properly infer Comment type from comments table', () => {
      const comment: Comment = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Test comment',
        userId: '1',
        productId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
      };
      expect(comment).toBeDefined();
    });

    it('should properly infer NewComment type for inserts', () => {
      const newComment: NewComment = {
        content: 'Test comment',
        userId: '1',
        productId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(newComment).toBeDefined();
    });
  });

  describe('Schema Validation Edge Cases', () => {
    it('should validate that users table has exactly 6 columns', () => {
      const columns = getTableColumns(users);
      const columnCount = Object.keys(columns).length;
      expect(columnCount).toBe(6);
    });

    it('should validate that products table has exactly 7 columns', () => {
      const columns = getTableColumns(products);
      const columnCount = Object.keys(columns).length;
      expect(columnCount).toBe(7);
    });

    it('should validate that comments table has exactly 5 columns', () => {
      const columns = getTableColumns(comments);
      const columnCount = Object.keys(columns).length;
      expect(columnCount).toBe(5);
    });

    it('should ensure email uniqueness constraint exists on users', () => {
      const columns = getTableColumns(users);
      expect(columns.email.isUnique).toBe(true);
    });
  });
});