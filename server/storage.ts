import { 
  users, type User, type InsertUser,
  subscribers, type Subscriber, type InsertSubscriber,
  orders, type Order, type InsertOrder
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, stripePaymentIntentId: string): Promise<Order | undefined>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByPaymentIntent(stripePaymentIntentId: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscribers: Map<number, Subscriber>;
  private orders: Map<number, Order>;
  private currentUserId: number;
  private currentSubscriberId: number;
  private currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.subscribers = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentSubscriberId = 1;
    this.currentOrderId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    // Check if email already exists
    const existingSubscriber = await this.getSubscriberByEmail(insertSubscriber.email);
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.currentSubscriberId++;
    const subscriber: Subscriber = { ...insertSubscriber, id };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    
    // Ensure required fields have values
    const orderData = {
      ...insertOrder,
      currency: insertOrder.currency || "usd",
      customerEmail: insertOrder.customerEmail || null,
    };
    
    const order: Order = {
      ...orderData,
      id,
      stripePaymentIntentId: "", // This will be updated after Stripe creates the payment intent
      status: "pending",
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string, stripePaymentIntentId: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }
    
    const updatedOrder: Order = {
      ...order,
      status,
      stripePaymentIntentId,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByPaymentIntent(stripePaymentIntentId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.stripePaymentIntentId === stripePaymentIntentId,
    );
  }
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    // Create PostgreSQL client
    const queryClient = postgres(process.env.DATABASE_URL, {
      max: 10, // Connection pool size
    });
    
    this.db = drizzle(queryClient);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    // Check if email already exists
    const existingSubscriber = await this.getSubscriberByEmail(insertSubscriber.email);
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const result = await this.db.insert(subscribers).values(insertSubscriber).returning();
    return result[0];
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const result = await this.db.select().from(subscribers).where(eq(subscribers.email, email));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return await this.db.select().from(subscribers);
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // Ensure required fields have values
    const orderData = {
      ...insertOrder,
      currency: insertOrder.currency || "usd",
      customerEmail: insertOrder.customerEmail || null,
    };
    
    const orderToInsert = {
      ...orderData,
      status: "pending",
      stripePaymentIntentId: "", // Will be updated later
    };
    
    const result = await this.db.insert(orders).values(orderToInsert).returning();
    return result[0];
  }
  
  async updateOrderStatus(id: number, status: string, stripePaymentIntentId: string): Promise<Order | undefined> {
    const result = await this.db
      .update(orders)
      .set({ status, stripePaymentIntentId })
      .where(eq(orders.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getOrderByPaymentIntent(stripePaymentIntentId: string): Promise<Order | undefined> {
    const result = await this.db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, stripePaymentIntentId));
    
    return result.length > 0 ? result[0] : undefined;
  }
}

// Switch from PostgreSQL storage to in-memory storage for development
export const storage = new MemStorage();
