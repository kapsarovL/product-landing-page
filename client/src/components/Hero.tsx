import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-1/2 md:pr-12">
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-100 bg-primary-100/10 rounded-full mb-3">NEW RELEASE</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">Experience Sound Like Never Before</h1>
              <p className="text-lg mb-8 text-gray-600 max-w-lg mx-auto md:mx-0">EchoBeats Pro delivers crystal clear audio with active noise cancellation and all-day comfort for the ultimate listening experience.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-8">
                <Button 
                  asChild
                  size="lg" 
                  className="w-full sm:w-auto text-base"
                >
                  <a href="#buy-now">Order Now - $149</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-base"
                >
                  <a href="#features">Learn More</a>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  <span>30-Day Return</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  <span>2-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full blur-3xl transform -translate-x-10" aria-hidden="true"></div>
              <img 
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                alt="EchoBeats Pro Wireless Earbuds" 
                className="relative mx-auto w-full max-w-lg rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a href="#features" className="inline-flex flex-col items-center text-sm text-gray-500 hover:text-primary-100 transition-colors">
            <span>Discover More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 scroll-indicator" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
