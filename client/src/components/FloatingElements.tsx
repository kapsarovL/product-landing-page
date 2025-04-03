import { useState, useEffect } from "react";
import { ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingElements() {
  const [showElements, setShowElements] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowElements(true);
      } else {
        setShowElements(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!showElements) return null;

  return (
    <>
      {/* Floating CTA */}
      <div className="fixed bottom-5 right-5 z-40">
        <Button 
          asChild
          className="rounded-full shadow-lg"
        >
          <a href="#buy-now" className="flex items-center">
            <span>Buy Now</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </a>
        </Button>
      </div>

      {/* Back to top button */}
      <Button 
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className="fixed bottom-5 left-5 z-40 p-2 bg-white rounded-full shadow-lg"
      >
        <ChevronUp className="h-6 w-6" />
        <span className="sr-only">Back to top</span>
      </Button>
    </>
  );
}
