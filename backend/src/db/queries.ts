import { db } from './index';
import { eq } from 'drizzle-orm';
import { 
    users,
    comments,
    products,
    type NewUser,
    type NewComment,
    type NewProduct
} from './schema';

// USER QUERIES

export const createUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const getUserById = async (id: string) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if(!user) throw new Error(`User with ID ${id} not found`);

    return user;
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
    const existingUser =await getUserById(id);
    if(!existingUser) throw new Error(`User with ID ${id} not found`);

    const [user] =await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
}

export const upsertUser = async (data: NewUser) => {
    // const existingUser =await getUserById(data.id);
    // if(existingUser) return updateUser(data.id, data);

    // return createUser(data);

    const [user] = await db
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
            target: users.id,
            set: data,
        })
        .returning();
    return user;
};

// PRODUCT QUERIES

export const createProduct = async (data: NewProduct) => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
};

export const getAllProducts = async () => {
    return db.query.products.findMany({  
        with: { user: true },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
     });
};

export const getProductById = async (id: string) => {
    const product = await db.query.products.findFirst({ where: eq(products.id, id) });
    if(!product) throw new Error(`Product with ID ${id} not found`);

    return db.query.products.findFirst({ 
        where: eq(products.id, id),
        with: { 
            user: true,
            comments: {
                with: { user: true },
                orderBy: (comments, { desc }) => [desc(comments.createdAt)],
            }
        },
     });
};

export const getProductsByUserId = async (userId: string) => {
    const user = await getUserById(userId);
    if(!user) throw new Error(`User with ID ${userId} not found`);

    return db.query.products.findMany({
        where: eq(products.userId, userId),
        with: {
            user: true,
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
     });
};

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
    const existingProduct =await getProductById(id);
    if(!existingProduct) throw new Error(`Product with ID ${id} not found`);

    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
};

export const deleteProduct = async (id: string) => {
    const existingProduct =await getProductById(id);
    if(!existingProduct) throw new Error(`Product with ID ${id} not found`);

    const [product] = await db.delete(products).where(eq(products.id, id)).returning();
    return product;
};

// COMMENT QUERIES

export const createComment = async (data: NewComment) => {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
};

export const deleteComment = async (id: string) => {
    const existingComment =await getCommentById(id);
    if(!existingComment) throw new Error(`Comment with ID ${id} not found`);

    const [comment] = await db.delete(comments).where(eq(comments.id, id)).returning();
    return comment;
};

export const getCommentById = async (id: string) => {
    const comment = await db.query.comments.findFirst({ where: eq(comments.id, id) });
    if(!comment) throw new Error(`Comment with ID ${id} not found`);

    return db.query.comments.findFirst({ 
        where: eq(comments.id, id),
        with: { user: true },
        });
};