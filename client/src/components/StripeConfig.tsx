import { useEffect } from 'react';
import { clientEnv } from "@/lib/env";
import { apiRequest } from "@/lib/queryClient";

interface StripeConfigProps {
  children: React.ReactNode;
}

/**
 * This component handles Stripe domain verification for Apple Pay
 */
export const StripeConfig = ({ children }: StripeConfigProps) => {
  const _stripeKey = clientEnv.getStripeKey();
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Handle domain verification for Apple Pay
    const verifyDomain = async () => {
      try {
        if (!_stripeKey) return;
        
        // Check if we're in a secure context (needed for Apple Pay)
        if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
          // Prepare clean domain name with no protocol, port, path
          const _hostname = window.location.hostname;
          
          // Verify domain for Apple Pay - send only the hostname
          await apiRequest('POST', '/api/stripe/verify-domain', {
            domain: _hostname
          });
        }
      } catch (error) {
        console.error('Error verifying domain for Stripe:', error);
      }
    };
    
    verifyDomain();
  }, [_stripeKey]);
  
  return <>{children}</>;
};

