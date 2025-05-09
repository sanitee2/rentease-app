import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/app/components/Container';
import Footer from '@/app/components/Footer';
import { LuLightbulb, LuSearch, LuShieldCheck } from "react-icons/lu";

export const metadata: Metadata = {
  title: 'About Us - RentEase',
  description: 'Learn more about RentEase and our team',
};

const teamMembers = [
  {
    name: 'Edward Doe',
    role: 'CEO',
    image: '/images/project-manager.jpg'
  },
  {
    name: 'Joshua Eleykuti',
    role: 'Senior Full-Stack Developer',
    image: '/images/lead-dev.jpg'
  },
  {
    name: 'Reyan Ryan',
    role: 'Senior Full-Stack Developer',
    image: '/images/ui-ux-designer.jpg'
  }
];

const features = [
  {
    icon: LuLightbulb,
    title: 'Creative solutions for modern rental challenges',
    description: 'We innovate to solve common rental market problems.'
  },
  {
    icon: LuSearch,
    title: 'Complete transparency for stress-free rental experiences',
    description: 'Clear communication and honest dealings every step of the way.'
  },
  {
    icon: LuShieldCheck,
    title: 'Reliability you can count on',
    description: 'Consistent support and dependable service throughout your experience.'
  }
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[200px] bg-[#4338CA] flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-white mb-2">About Us</h1>
          <div className="text-sm text-white/90 flex items-center gap-2">
            <a href="/" className="hover:underline">Home</a>
            <span>{'>'}</span>
            <span>About Us</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 space-y-24">
          {/* Who We Are Section */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-[#4338CA] mb-8">Who We Are</h2>
            <p className="text-gray-500 leading-relaxed text-md">
              At RentEase, we believe renting should be simple and stress-free. By combining technology and industry 
              expertise, we empower landlords and tenants with tools that make the rental process effortless. 
              Transparency, efficiency, and user satisfaction are at the heart of everything we do.
            </p>
          </section>

          {/* Team Section - Added hover effects */}
          <section className="max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <div 
                  key={index} 
                  className="text-center group relative"
                >
                  <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-xl 
                    transform transition-all duration-300 ease-in-out
                    group-hover:shadow-2xl group-hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    />
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20 
                      transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <h3 className="font-semibold text-xl mb-1">{member.name}</h3>
                      <p className="text-white/90">{member.role}</p>
                    </div>
                  </div>
                  <div className="group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-semibold text-xl text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why RentEase Section - Added hover effects */}
          <section className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden
                transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              >
                <Image
                  src="/images/surigao-city.jpg"
                  alt="Modern House"
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl font-bold text-[#4338CA] mb-6">Why RentEase?</h2>
                  <p className="text-gray-500 text-md leading-relaxed">
                    Why settle for outdated systems and endless paperwork? RentEase offers a simpler way to manage rentals, 
                    providing intuitive tools that make the entire process smoother for both tenants and landlords. 
                    This is just the beginning—we're continually innovating to make renting better for everyone.
                  </p>
                </div>
                <div className="space-y-8">
                  {features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-5 p-4 rounded-xl
                        transform transition-all duration-300 ease-in-out
                        hover:bg-white hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="p-3 bg-indigo-100 rounded-lg shrink-0
                        transform transition-all duration-300
                        group-hover:bg-indigo-200"
                      >
                        <feature.icon className="w-6 h-6 text-[#4338CA]
                          transform transition-all duration-300
                          group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-md text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
} 