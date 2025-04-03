import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertOrderSchema } from "@shared/schema";
import { stripeConfig } from "./stripe";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Stripe domain verification endpoint for Apple Pay
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
      
      // For localhost development, we use a special domain
      const domainName = domain === 'localhost' ? 'localhost' : domain;
      
      // Register the domain with Stripe for Apple Pay
      const domainVerification = await stripeConfig.stripe.applePayDomains.create({
        domain_name: domainName,
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

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripeConfig.isConfigured || !stripeConfig.stripe) {
      return res.status(503).json({ 
        success: false, 
        message: "Payment processing is currently unavailable. Missing Stripe configuration." 
      });
    }

    try {
      const { productId, productName, amount, currency = "usd", customerEmail } = req.body;
      
      // Validate order data
      const validatedData = insertOrderSchema.parse({
        productId,
        productName,
        amount,
        currency,
        customerEmail
      });
      
      // Create order in storage
      const order = await storage.createOrder(validatedData);
      
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
      
      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, "pending", paymentIntent.id);
      
      // Return client secret to frontend
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
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
