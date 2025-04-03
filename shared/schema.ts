import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const validateEnv = () => {
  const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    // Add other required environment variables here
  });

  try {
    envSchema.parse(process.env);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("Unknown error during environment validation:", error);
    }
    throw new Error("Invalid environment configuration");
  }
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  status: text("status").notNull().default("pending"),
  customerEmail: text("customer_email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  productId: true,
  productName: true,
  amount: true,
  currency: true,
  customerEmail: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
