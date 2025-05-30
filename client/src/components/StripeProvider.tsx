import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { clientEnv } from "@/lib/env";
import { StripeConfig } from './StripeConfig';

// Only initialize Stripe once to avoid multiple network requests
const _stripePromise = clientEnv.getStripeKey() ? 
  loadStripe(clientEnv.getStripeKey() as string) : 
  null;

interface StripeProviderProps {
  children: React.ReactNode;
  options?: {
    clientSecret?: string;
    appearance?: {
      theme?: 'stripe' | 'night' | 'flat';
      variables?: Record<string, string>;
    };
    paymentMethodOrder?: string[];
  };
}

export const StripeProvider = ({ children, options }: StripeProviderProps) => {
  const [_isMounted, setIsMounted] = useState(false);
  
  // Only load on client side to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Configure options with correct format for Stripe
  const _configuredOptions = {
    ...options || {},
    // Set appearance settings
    appearance: {
      theme: 'stripe',
      ...(options?.appearance || {})
    }
  };

  if (!_isMounted || !_stripePromise) {
    return null;
  }

  return (
    <Elements stripe={_stripePromise} options={_configuredOptions}>
      {children}
    </Elements>
  );
};

