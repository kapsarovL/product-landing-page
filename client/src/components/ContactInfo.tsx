import { Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactInfo() {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">We're Here For You</h2>
          <p className="text-gray-600">Our customer support team is available to answer any questions you may have.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100/10 text-primary-100 mb-4">
              <Mail className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-2">We typically respond within 24 hours</p>
            <a href="mailto:support@echobeats.com" className="text-primary-100 hover:text-primary/80 transition-colors">support@echobeats.com</a>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100/10 text-primary-100 mb-4">
              <Phone className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-2">Monday - Friday, 9am - 6pm EST</p>
            <a href="tel:1-800-123-4567" className="text-primary-100 hover:text-primary-100/80 transition-colors">1-800-123-4567</a>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100/10 text-primary-100 mb-4">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-2">Available 24/7 for instant help</p>
            <a href="#" className="text-primary hover:text-primary-100/80 transition-colors">Start a chat</a>
          </div>
        </div>
      </div>
    </section>
  );
}
