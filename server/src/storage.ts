import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import {
  type InsertPostcard,
  type InsertPostcardOrder,
  type InsertUser,
  type Postcard,
  type PostcardOrder,
  type User,
  postcardOrders,
  postcards,
  users
} from "./db/schema";

export interface IStorage {
  getUser: (id: string) => Promise<User | undefined>;
  upsertUser: (user: InsertUser) => Promise<void>;
  updateUserStripeInfo: (
    userId: string,
    customerId: string,
    subscriptionId: string
  ) => Promise<void>;
  updateSubscriptionStatus: (
    userId: string,
    status: string,
    endDate?: Date | null
  ) => Promise<void>;
  createPostcard: (postcard: InsertPostcard) => Promise<Postcard>;
  getPostcard: (id: string) => Promise<Postcard | undefined>;
  getUserPostcards: (userId: string) => Promise<Postcard[]>;
  getAllPostcards: () => Promise<Postcard[]>;
  updatePostcard: (
    id: string,
    updates: Partial<InsertPostcard>
  ) => Promise<Postcard | undefined>;
  deletePostcard: (id: string) => Promise<void>;
  createPostcardOrder: (order: InsertPostcardOrder) => Promise<PostcardOrder>;
  getPostcardOrder: (id: string) => Promise<PostcardOrder | undefined>;
  getUserPostcardOrders: (userId: string) => Promise<PostcardOrder[]>;
  updatePostcardOrderStatus: (
    id: string,
    status: string,
    paymentIntentId?: string
  ) => Promise<void>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? undefined;
  }

  async upsertUser(user: InsertUser) {
    const id = user.id ?? randomUUID();
    const payload = { ...user, id };
    await db
      .insert(users)
      .values(payload)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          profileImageUrl: payload.profileImageUrl,
          updatedAt: new Date()
        }
      });
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string) {
    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateSubscriptionStatus(userId: string, status: string, endDate?: Date | null) {
    await db
      .update(users)
      .set({ subscriptionStatus: status, subscriptionEndDate: endDate ?? null })
      .where(eq(users.id, userId));
  }

  async createPostcard(postcard: InsertPostcard) {
    const payload = { ...postcard, id: postcard.id ?? randomUUID() };
    await db.insert(postcards).values(payload);
    const [created] = await db
      .select()
      .from(postcards)
      .where(eq(postcards.id, payload.id));
    return created!;
  }

  async getPostcard(id: string) {
    const [record] = await db
      .select()
      .from(postcards)
      .where(eq(postcards.id, id));
    return record ?? undefined;
  }

  async getUserPostcards(userId: string) {
    return db.select().from(postcards).where(eq(postcards.userId, userId));
  }

  async getAllPostcards() {
    return db
      .select()
      .from(postcards)
      .where(eq(postcards.isPublic, "true"));
  }

  async updatePostcard(id: string, updates: Partial<InsertPostcard>) {
    await db
      .update(postcards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(postcards.id, id));
    const [record] = await db
      .select()
      .from(postcards)
      .where(eq(postcards.id, id));
    return record ?? undefined;
  }

  async deletePostcard(id: string) {
    await db.delete(postcards).where(eq(postcards.id, id));
  }

  async createPostcardOrder(order: InsertPostcardOrder) {
    const payload = { ...order, id: order.id ?? randomUUID() };
    await db.insert(postcardOrders).values(payload);
    const [record] = await db
      .select()
      .from(postcardOrders)
      .where(eq(postcardOrders.id, payload.id));
    return record!;
  }

  async getPostcardOrder(id: string) {
    const [record] = await db
      .select()
      .from(postcardOrders)
      .where(eq(postcardOrders.id, id));
    return record ?? undefined;
  }

  async getUserPostcardOrders(userId: string) {
    return db
      .select()
      .from(postcardOrders)
      .where(eq(postcardOrders.userId, userId));
  }

  async updatePostcardOrderStatus(id: string, status: string, paymentIntentId?: string) {
    const updateValues: Partial<typeof postcardOrders.$inferInsert> = {
      orderStatus: status,
      updatedAt: new Date()
    };

    if (paymentIntentId) {
      updateValues.stripePaymentIntentId = paymentIntentId;
    }

    await db
      .update(postcardOrders)
      .set(updateValues)
      .where(eq(postcardOrders.id, id));
  }
}

export const storage = new PostgresStorage();
