import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const productOptions = [
  {
    id: "echobeats-pro",
    title: "EchoBeats Pro",
    description: "The complete premium wireless earbuds package",
    price: 149,
    originalPrice: 199,
    discount: 50,
    features: [
      "EchoBeats Pro wireless earbuds",
      "Wireless charging case",
      "USB-C charging cable",
      "3 sizes of silicone ear tips",
      "2-year warranty",
      "Free shipping"
    ]
  },
  {
    id: "echobeats-pro-bundle",
    title: "EchoBeats Pro Bundle",
    description: "Everything you need for the ultimate audio experience",
    price: 199,
    originalPrice: 279,
    discount: 80,
    features: [
      "EchoBeats Pro wireless earbuds",
      "Premium wireless charging case",
      "Wireless charging pad",
      "Protective carrying case",
      "Memory foam & silicone ear tips",
      "3-year extended warranty",
      "Priority customer support",
      "Free express shipping"
    ]
  }
];

export default function BuyOptions() {
  return (
    <section id="buy-now" className="py-16 bg-primary-100/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-100 bg-primary-100/10 rounded-full mb-3">LIMITED OFFER</span>
          <h2 className="text-3xl font-bold mb-4">Upgrade Your Audio Experience Today</h2>
          <p className="text-gray-600">Choose the package that's right for you and start enjoying premium sound quality.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          {productOptions.map((product) => (
            <div key={product.id} className="lg:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">${product.price}</span>
                  <span className="text-gray-500 ml-2 line-through">${product.originalPrice}</span>
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full">SAVE ${product.discount}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button asChild className="w-full py-6 text-base">
                  <Link href={`/checkout?product=${product.id}`}>
                    {product.id === "echobeats-pro" ? "Buy Now" : "Buy Bundle"}
                  </Link>
                </Button>
                
                <p className="text-sm text-center text-gray-500 mt-4">30-day money-back guarantee</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
