
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Private members with underscore prefix
class StripeConfig {
  private _stripe: Stripe | null = null;
  private _isConfigured: boolean = false;

  constructor() {
    this._initialize();
  }

  private _initialize() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Missing environment variable: STRIPE_SECRET_KEY. Stripe payment functionality will be disabled.');
      this._isConfigured = false;
      return;
    }

    try {
      this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
      this._isConfigured = true;
      console.log('Stripe payment processing configured successfully.');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this._isConfigured = false;
    }
  }

  get stripe(): Stripe | null {
    return this._stripe;
  }

  get isConfigured(): boolean {
    return this._isConfigured;
  }
}

// Export a singleton instance
export const stripeConfig = new StripeConfig();