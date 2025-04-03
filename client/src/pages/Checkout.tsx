import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Product data
const products = {
  "echobeats-pro": {
    id: "echobeats-pro",
    name: "EchoBeats Pro",
    amount: 149,
    description: "Premium wireless earbuds with active noise cancellation"
  },
  "echobeats-pro-bundle": {
    id: "echobeats-pro-bundle",
    name: "EchoBeats Pro Bundle",
    amount: 199,
    description: "Complete premium bundle with charging pad and accessories"
  }
};

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ product }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      
      // Go back to home page after successful payment
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement />
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Product</span>
          <span className="font-medium">{product.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="font-medium">${product.amount.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">${product.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <Button 
        disabled={!stripe || isProcessing} 
        className="w-full" 
        type="submit"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get the product ID from URL query params
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    
    if (!productId || !products[productId]) {
      setError("Invalid product. Please select a product from our store.");
      return;
    }
    
    const selectedProduct = products[productId];
    setProduct(selectedProduct);
    
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          amount: selectedProduct.amount,
          currency: "usd"
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to initialize checkout. Please try again later.",
          variant: "destructive",
        });
        console.error("Error creating payment intent:", err);
      }
    };
    
    if (stripePromise) {
      createPaymentIntent();
    } else {
      setError("Payment processing is currently unavailable. Please try again later.");
    }
  }, [toast]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem with checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setLocation("/")} className="w-full">
                Return to Store
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!product || !clientSecret || !stripePromise) {
    return (
      <>
        <Navbar />
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" aria-label="Loading"/>
            <p className="text-gray-500">Initializing checkout...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm product={product} />
            </Elements>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
