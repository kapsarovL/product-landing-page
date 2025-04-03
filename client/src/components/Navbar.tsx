import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <svg className="h-8 w-auto text-primary-100" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 18.5c3.5 0 6.5-2.5 6.5-6s-3-6-6.5-6S5.5 9 5.5 12.5s3 6 6.5 6z"></path>
              <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </svg>
            <span className="ml-2 text-xl font-bold">EchoBeats</span>
          </Link>
          
          <nav className="hidden md:flex space-x-10">
            <a href="#features" className="text-gray-900 hover:text-primary-100 transition-colors">Features</a>
            <a href="#specs" className="text-gray-900 hover:text-primary-100 transition-colors">Specs</a>
            <a href="#testimonials" className="text-gray-900 hover:text-primary-100 transition-colors">Reviews</a>
            <a href="#faq" className="text-gray-900 hover:text-primary-100 transition-colors">FAQ</a>
          </nav>
          
          <div className="flex items-center">
            <a 
              href="#buy-now" 
              className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-100 hover:bg-primary-100/90 transition-colors ml-2"
            >
              Buy Now
            </a>
            <button 
              type="button" 
              className="md:hidden bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-900 hover:text-primary-100 hover:bg-gray-100 transition-colors" 
              onClick={toggleMenu}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white border-t`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a 
            href="#features" 
            className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-primary-100/10 hover:text-primary-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Features
          </a>
          <a 
            href="#specs" 
            className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-primary-100/10 hover:text-primary-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Specs
          </a>
          <a 
            href="#testimonials" 
            className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-primary-100/10 hover:text-primary-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Reviews
          </a>
          <a 
            href="#faq" 
            className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-primary-100/10 hover:text-primary-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            FAQ
          </a>
          <a 
            href="#buy-now" 
            className="block px-3 py-2 text-base font-medium text-white bg-primary-100 hover:bg-primary-100/90 rounded-md mt-4"
            onClick={() => setIsOpen(false)}
          >
            Buy Now
          </a>
        </div>
      </div>
    </header>
  );
}
