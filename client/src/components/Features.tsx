import { 
  PlusIcon, 
  BarChart3Icon, 
  MicIcon, 
  ZapIcon, 
  GlobeIcon,
  TruckIcon
} from "lucide-react";

const features = [
  {
    icon: <PlusIcon className="h-8 w-8 text-primary-100" />,
    title: "Active Noise Cancellation",
    description: "Block out the world around you with advanced noise cancellation technology that adapts to your environment."
  },
  {
    icon: <BarChart3Icon className="h-8 w-8 text-primary-100" />,
    title: "40+ Hours Battery Life",
    description: "Enjoy all-day listening with 8 hours of playback on a single charge, plus an additional 32 hours with the charging case."
  },
  {
    icon: <MicIcon className="h-8 w-8 text-primary-100" />,
    title: "Crystal Clear Calls",
    description: "Dual beamforming microphones with environmental noise reduction ensure your voice comes through clearly in any situation."
  },
  {
    icon: <ZapIcon className="h-8 w-8 text-primary-100" />,
    title: "Fast Wireless Charging",
    description: "Get up to 2 hours of playback with just 10 minutes of wireless charging for quick power when you need it most."
  },
  {
    icon: <GlobeIcon className="h-8 w-8 text-primary-100" />,
    title: "Water & Sweat Resistant",
    description: "IPX4 rated protection keeps your earbuds safe from splashes and sweat during workouts or unexpected rain."
  },
  {
    icon: <TruckIcon className="h-8 w-8 text-primary-100" />,
    title: "Smart Touch Controls",
    description: "Intuitive touch sensors let you control music, calls, and voice assistants with simple taps and swipes."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Premium Features for Premium Sound</h2>
          <p className="text-gray-600">EchoBeats Pro combines cutting-edge technology with elegant design to deliver an exceptional audio experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-100 rounded-xl p-8 transition-all hover:shadow-lg">
              <div className="bg-primary-100/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
