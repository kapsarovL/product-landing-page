import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertOrderSchema } from "@shared/schema";
import { stripeConfig } from "./stripe";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug route to confirm API is accessible
  app.get("/api/health", (req, res) => {
    res.json({ status: "API is running", timestamp: new Date().toISOString() });
  });

  // API endpoint to subscribe to newsletter
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error subscribing to newsletter:", error);
        res.status(500).json({ success: false, message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // Stripe domain verification endpoint for Apple Pay - Fixed URI format
  app.post("/api/stripe/verify-domain", async (req, res) => {
    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      return res.status(503).json({ 
        success: false, 
        message: "Payment processing is currently unavailable. Missing Stripe configuration." 
      });
    }

    try {
      const { domain } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, message: "Domain is required" });
      }
      
      // Format domain properly - no protocol, port, path, query, or fragment
      let _domainName = domain;
      
      // For localhost development use special format
      if (_domainName === 'localhost') {
        _domainName = 'localhost';
      } else {
        // Strip protocol and any path/query/fragment
        _domainName = _domainName.replace(/^https?:\/\//, '');
        _domainName = _domainName.split(':')[0]; // Remove port if present
        _domainName = _domainName.split('/')[0]; // Remove path if present
        _domainName = _domainName.split('?')[0]; // Remove query if present
        _domainName = _domainName.split('#')[0]; // Remove fragment if present
      }
      
      console.log(`🔒 Registering domain for Apple Pay: ${_domainName}`);
      
      // Register the domain with Stripe for Apple Pay
      const domainVerification = await stripeConfig.stripe.applePayDomains.create({
        domain_name: _domainName,
      });
      
      return res.status(200).json({ 
        success: true, 
        message: "Domain verified successfully", 
        domain: domainVerification.domain_name 
      });
    } catch (error: any) {
      console.error("Error verifying domain for Apple Pay:", error.message);
      
      // Check if this is already registered error
      if (error.message && error.message.includes("already exists")) {
        return res.status(200).json({ 
          success: true, 
          message: "Domain already verified", 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "Failed to verify domain", 
        error: error.message 
      });
    }
  });

  // Stripe payment route with enhanced debugging
  app.post("/api/create-payment-intent", async (req, res) => {
    console.log("⚡ Received payment intent request:", req.path);

    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      console.error("❌ Stripe not configured. Check STRIPE_SECRET_KEY environment variable.");
      return res.status(503).json({ 
        success: false, 
        message: "Payment processing is currently unavailable. Missing Stripe configuration." 
      });
    }

    try {
      console.log("📦 Request body:", JSON.stringify(req.body));
      const { productId, productName, amount, currency = "usd", customerEmail } = req.body;
      
      // Validate order data
      const validatedData = insertOrderSchema.parse({
        productId,
        productName,
        amount,
        currency,
        customerEmail
      });
      
      console.log("✓ Data validation passed");
      
      // Create order in storage
      const order = await storage.createOrder(validatedData);
      console.log("📝 Order created:", order.id);
      
      // Create payment intent with Stripe
      const paymentIntent = await stripeConfig.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: {
          orderId: order.id.toString(),
          productId,
          productName
        }
      });
      
      console.log("💰 Stripe payment intent created:", paymentIntent.id);
      
      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, "pending", paymentIntent.id);
      
      // Return client secret to frontend
      console.log("✅ Returning client secret to frontend");
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      console.error("❌ Error in payment intent creation:", error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to create payment intent", 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Webhook to handle payment events
  app.post("/api/webhook", async (req, res) => {
    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      return res.status(503).json({ success: false, message: "Payment processing is unavailable" });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!sig || !endpointSecret) {
      return res.status(400).json({ success: false, message: "Missing signature or endpoint secret" });
    }

    let event;

    try {
      const rawBody = req.body;
      event = stripeConfig.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      // Update order status
      const order = await storage.getOrderByPaymentIntent(paymentIntent.id);
      if (order) {
        await storage.updateOrderStatus(order.id, "completed", paymentIntent.id);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send({ received: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
