import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductSpecs from "@/components/ProductSpecs";
import Testimonials from "@/components/Testimonials";
import BuyOptions from "@/components/BuyOptions";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import ContactInfo from "@/components/ContactInfo";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";

export default function Home() {
  // Add analytics tracking on page load
  useEffect(() => {
    // Optional: Add analytics tracking code here
    console.log("Page viewed - tracking analytics");
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProductSpecs />
        <Testimonials />
        <BuyOptions />
        <FAQ />
        <Newsletter />
        <ContactInfo />
      </main>
      <Footer />
      <FloatingElements />
    </>
  );
}
