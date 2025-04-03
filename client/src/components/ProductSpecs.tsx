export default function ProductSpecs() {
  const specs = [
    { title: "Dimensions", description: "Earbuds: 22 x 18 x 23 mm\nCase: 62 x 46 x 28 mm" },
    { title: "Weight", description: "Each earbud: 5.4g\nCharging case: 48g" },
    { title: "Battery Life", description: "Earbuds: 8 hours\nWith case: 40+ hours" },
    { title: "Charging", description: "Wireless Qi compatible\nUSB-C fast charging" },
    { title: "Connectivity", description: "Bluetooth 5.2\n10m wireless range" },
    { title: "Water Resistance", description: "IPX4 rated\nSweat & splash proof" },
    { title: "Drivers", description: "12mm dynamic drivers\nHD audio codec support" },
    { title: "Compatibility", description: "iOS, Android, Windows\nAll Bluetooth devices" }
  ];

  return (
    <section id="specs" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Technical Specifications</h2>
          <p className="text-gray-600">Every detail of EchoBeats Pro has been engineered to deliver exceptional performance and comfort.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-primary-100/5 rounded-3xl transform rotate-3" aria-hidden="true"></div>
            <img 
              src="https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
              alt="EchoBeats Pro Technical Details" 
              className="relative rounded-2xl shadow-lg w-full"
            />
          </div>
          
          <div className="lg:w-1/2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specs.map((spec, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{spec.title}</h3>
                  <p className="text-gray-600 whitespace-pre-line">{spec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
