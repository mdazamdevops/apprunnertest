import { relations } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  subscriptionStatus: varchar("subscription_status").notNull().default("inactive"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull()
});

export const postcards = pgTable("postcards", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url").notNull(),
  title: varchar("title").notNull(),
  description: varchar("description"),
  isPublic: varchar("is_public").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const postcardOrders = pgTable("postcard_orders", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postcardId: varchar("postcard_id").notNull().references(() => postcards.id),
  quantity: varchar("quantity").notNull().default("20"),
  totalAmount: varchar("total_amount").notNull().default("1000"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").notNull(),
  orderStatus: varchar("order_status").notNull().default("pending"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  postcards: many(postcards),
  postcardOrders: many(postcardOrders)
}));

export const postcardsRelations = relations(postcards, ({ one, many }) => ({
  owner: one(users, {
    fields: [postcards.userId],
    references: [users.id]
  }),
  postcardOrders: many(postcardOrders)
}));

export const postcardOrdersRelations = relations(postcardOrders, ({ one }) => ({
  user: one(users, {
    fields: [postcardOrders.userId],
    references: [users.id]
  }),
  postcard: one(postcards, {
    fields: [postcardOrders.postcardId],
    references: [postcards.id]
  })
}));

export const insertUserSchema = createInsertSchema(users, {
  id: z.string().uuid().optional(),
  stripeCustomerId: z.string().optional().nullable(),
  stripeSubscriptionId: z.string().optional().nullable(),
  subscriptionEndDate: z.date().optional().nullable()
});

export const insertPostcardSchema = createInsertSchema(postcards, {
  id: z.string().uuid().optional(),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.enum(["true", "false"])
});

export const insertPostcardOrderSchema = createInsertSchema(postcardOrders, {
  id: z.string().uuid().optional(),
  shippingAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string()
    })
    .optional()
    .nullable()
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Postcard = typeof postcards.$inferSelect;
export type InsertPostcard = z.infer<typeof insertPostcardSchema>;
export type PostcardOrder = typeof postcardOrders.$inferSelect;
export type InsertPostcardOrder = z.infer<typeof insertPostcardOrderSchema>;

export interface AuthenticatedUser {
  claims: {
    sub: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
  };
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}
