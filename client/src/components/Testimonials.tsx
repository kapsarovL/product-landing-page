import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    content: "The noise cancellation on these earbuds is exceptional. I use them daily during my commute and they completely block out subway noise. The sound quality is balanced and crisp, with deep bass that doesn't overpower.",
    author: "Michael R.",
    title: "Music Producer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  },
  {
    content: "I've tried many wireless earbuds, and these are by far the most comfortable for long listening sessions. The battery life is impressive - I only need to charge once a week with my typical use. Worth every penny!",
    author: "Sarah J.",
    title: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  },
  {
    content: "The touch controls are intuitive and work flawlessly. Call quality is exceptional - I use these for work calls daily and colleagues always comment on how clear I sound. The fast charging feature is a lifesaver!",
    author: "David L.",
    title: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(100);

  const updateSlideWidth = () => {
    if (window.innerWidth >= 1024) {
      setSlideWidth(33.333);
    } else if (window.innerWidth >= 768) {
      setSlideWidth(50);
    } else {
      setSlideWidth(100);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateSlideWidth);
    updateSlideWidth();
    
    return () => {
      window.removeEventListener('resize', updateSlideWidth);
    };
  }, []);

  const prevSlide = () => {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  };

  const nextSlide = () => {
    const maxIndex = Math.ceil(testimonials.length - (100 / slideWidth));
    setCurrentIndex(Math.min(currentIndex + 1, maxIndex));
  };

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600">Thousands of music lovers have upgraded their listening experience with EchoBeats Pro.</p>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out" 
              style={{ transform: `translateX(-${currentIndex * slideWidth}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className={`min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-4`}>
                  <div className="bg-gray-100 rounded-xl p-8 h-full shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="text-primary-100">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 inline-block fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{testimonial.content}</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-4">
                        <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-medium">{testimonial.author}</h4>
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="mr-4"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex >= testimonials.length - (100 / slideWidth)}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
