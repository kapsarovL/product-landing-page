import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does the battery last?",
    answer: "EchoBeats Pro provides up to 8 hours of continuous playback on a single charge. With the charging case, you get an additional 32+ hours of battery life, for a total of 40+ hours. A quick 10-minute charge gives you 2 hours of playback time."
  },
  {
    question: "Are they water and sweat resistant?",
    answer: "Yes, EchoBeats Pro earbuds are IPX4 rated, making them resistant to water splashes and sweat. They're perfect for workouts and can handle light rain, but should not be submerged in water or worn while swimming."
  },
  {
    question: "What devices are compatible with EchoBeats Pro?",
    answer: "EchoBeats Pro is compatible with all Bluetooth-enabled devices, including iOS and Android smartphones, tablets, laptops, and desktop computers. They use Bluetooth 5.2 technology for a stable, efficient connection."
  },
  {
    question: "How effective is the noise cancellation?",
    answer: "The active noise cancellation in EchoBeats Pro can reduce environmental noise by up to 30dB. This is particularly effective for constant low-frequency sounds like airplane engines, office noise, or air conditioning. The system uses advanced algorithms to adapt to your environment in real-time."
  },
  {
    question: "What is the warranty policy?",
    answer: "EchoBeats Pro comes with a standard 2-year warranty that covers manufacturing defects and hardware malfunctions. The Premium Bundle includes an extended 3-year warranty. Our 30-day money-back guarantee allows you to return the product for a full refund if you're not completely satisfied."
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about EchoBeats Pro earbuds.</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="py-5 text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="max-w-xl mx-auto mt-10 text-center">
          <p className="mb-4 text-gray-600">Still have questions? We're here to help.</p>
          <Button asChild variant="outline">
            <a href="#contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
