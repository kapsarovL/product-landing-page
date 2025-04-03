// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var clientEnvSchema = z.object({
  VITE_STRIPE_PUBLIC_KEY: z.string().optional()
  // Add any other client environment variables here
});
var validateEnv = () => {
  const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required")
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
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  status: text("status").notNull().default("pending"),
  customerEmail: text("customer_email")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true
});
var insertOrderSchema = createInsertSchema(orders).pick({
  productId: true,
  productName: true,
  amount: true,
  currency: true,
  customerEmail: true
});

// server/storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
var MemStorage = class {
  users;
  subscribers;
  orders;
  currentUserId;
  currentSubscriberId;
  currentOrderId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentSubscriberId = 1;
    this.currentOrderId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createSubscriber(insertSubscriber) {
    const existingSubscriber = await this.getSubscriberByEmail(insertSubscriber.email);
    if (existingSubscriber) {
      return existingSubscriber;
    }
    const id = this.currentSubscriberId++;
    const subscriber = { ...insertSubscriber, id };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  async getSubscriberByEmail(email) {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email
    );
  }
  async getAllSubscribers() {
    return Array.from(this.subscribers.values());
  }
  async createOrder(insertOrder) {
    const id = this.currentOrderId++;
    const orderData = {
      ...insertOrder,
      currency: insertOrder.currency || "usd",
      customerEmail: insertOrder.customerEmail || null
    };
    const order = {
      ...orderData,
      id,
      stripePaymentIntentId: "",
      // This will be updated after Stripe creates the payment intent
      status: "pending"
    };
    this.orders.set(id, order);
    return order;
  }
  async updateOrderStatus(id, status, stripePaymentIntentId) {
    const order = this.orders.get(id);
    if (!order) {
      return void 0;
    }
    const updatedOrder = {
      ...order,
      status,
      stripePaymentIntentId
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  async getOrder(id) {
    return this.orders.get(id);
  }
  async getOrderByPaymentIntent(stripePaymentIntentId) {
    return Array.from(this.orders.values()).find(
      (order) => order.stripePaymentIntentId === stripePaymentIntentId
    );
  }
};
var storage = new MemStorage();

// server/stripe.ts
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
var StripeConfig = class {
  _stripe = null;
  _isConfigured = false;
  constructor() {
    this._initialize();
  }
  _initialize() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Missing environment variable: STRIPE_SECRET_KEY. Stripe payment functionality will be disabled.");
      this._isConfigured = false;
      return;
    }
    try {
      this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
      this._isConfigured = true;
      console.log("Stripe payment processing configured successfully.");
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      this._isConfigured = false;
    }
  }
  get stripe() {
    return this._stripe;
  }
  get isConfigured() {
    return this._isConfigured;
  }
};
var stripeConfig = new StripeConfig();

// server/routes.ts
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error subscribing to newsletter:", error);
        res.status(500).json({ success: false, message: "Failed to subscribe to newsletter" });
      }
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      return res.status(503).json({
        success: false,
        message: "Payment processing is currently unavailable. Missing Stripe configuration."
      });
    }
    try {
      const { productId, productName, amount, currency = "usd", customerEmail } = req.body;
      const validatedData = insertOrderSchema.parse({
        productId,
        productName,
        amount,
        currency,
        customerEmail
      });
      const order = await storage.createOrder(validatedData);
      const paymentIntent = await stripeConfig.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency,
        metadata: {
          orderId: order.id.toString(),
          productId,
          productName
        }
      });
      await storage.updateOrderStatus(order.id, "pending", paymentIntent.id);
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error creating payment intent:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create payment intent"
        });
      }
    }
  });
  app2.post("/api/webhook", async (req, res) => {
    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      return res.status(503).json({ success: false, message: "Payment processing is unavailable" });
    }
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
      return res.status(400).json({ success: false, message: "Missing signature or endpoint secret" });
    }
    let event;
    try {
      const rawBody = req.body;
      event = stripeConfig.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.log(`\u26A0\uFE0F Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
      if (order) {
        await storage.updateOrderStatus(order.id, "completed", paymentIntent.id);
      }
    }
    res.send({ received: true });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer as createServer2 } from "http";
import os from "os";
import dotenv2 from "dotenv";
dotenv2.config();
validateEnv();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var startServer = async (preferredPort) => {
  const server = createServer2(app);
  const ports = [preferredPort, 3e3, 8080, 0];
  const maxRetries = ports.length;
  const registerAllRoutes = async () => {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error: ${err.message}`);
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  };
  await registerAllRoutes();
  for (let i = 0; i < maxRetries; i++) {
    const currentPort = ports[i];
    try {
      await new Promise((resolve, reject) => {
        server.listen({ port: currentPort, host: "0.0.0.0" }, () => {
          const address = server.address();
          const actualPort = typeof address === "object" && address ? address.port : currentPort;
          log(`Server successfully started on port ${actualPort}`);
          const networkInterfaces = os.networkInterfaces();
          log("Available on:");
          Object.keys(networkInterfaces).forEach((interfaceName) => {
            const interfaces = networkInterfaces[interfaceName];
            interfaces?.forEach((iface) => {
              if (iface.family === "IPv4" && !iface.internal) {
                log(`  http://${iface.address}:${actualPort}`);
              }
            });
          });
          log(`  http://localhost:${actualPort}`);
          resolve();
        });
        server.on("error", (err) => {
          if (err.code === "EADDRINUSE") {
            log(`Port ${currentPort} is already in use, trying next port...`);
            server.close();
          } else {
            reject(err);
          }
        });
      });
      return;
    } catch (err) {
      const error = err;
      log(`Failed to start server on port ${currentPort}: ${error.message}`);
      if (i === maxRetries - 1) {
        throw new Error(`Could not start server after trying ${maxRetries} different ports`);
      }
    }
  }
};
(async () => {
  try {
    const preferredPort = 5e3;
    await startServer(preferredPort);
  } catch (err) {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  }
})();
