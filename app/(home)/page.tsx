'use client';

import Link from 'next/link';
import { 
  FaHome, 
  FaMobileAlt, 
  FaFileContract,
  FaSearch,
  FaVideo,
  FaComments,
  FaMoneyBillWave,
  FaTools,
  FaUsersCog,
  FaClipboardList,
  FaCheckCircle,
  FaArrowRight,
  FaPlus
} from 'react-icons/fa';
import { MdManageAccounts } from 'react-icons/md';
import Footer from '../components/Footer';
import useLoginModal from "@/app/hooks/useLoginModal";

export default function LandingPage() {
  const loginModal = useLoginModal();

  return (
    <>
    <div className="min-h-screen">
      {/* Optimized Hero Section */}
      <section 
        className="relative min-h-[95vh] w-full flex items-center"
        style={{
          backgroundImage: 'url("/images/surigao-city.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 65%',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-indigo-900/90 to-transparent" />
        
        {/* Content Layer */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block mb-6 px-6 py-3 bg-indigo-500/10 backdrop-blur-md rounded-full border border-indigo-400/20">
              <p className="text-indigo-100 font-medium tracking-wide">
                Streamlining Rental Space Search in Surigao City
              </p>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-10 text-white leading-tight tracking-tight">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-200 block mt-2"> 
                Rental Space
              </span>
            </h1>
            <p className="text-xl sm:text-2xl mb-10 sm:mb-14 max-w-2xl text-gray-200 leading-relaxed">
              A centralized platform for finding and managing rental properties in Surigao City. Making the rental search process efficient and convenient.
            </p>
            <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
              <Link 
                href="/listings" 
                className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                <FaSearch className="text-xl" />
                Browse Listings
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
              <Link 
                href="/register-landlord" 
                className="group bg-white/5 backdrop-blur-lg hover:bg-white/10 text-white border border-white/20 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-2"
              >
                <FaPlus className="text-xl" />
                Add your rental property
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent" />
      </section>

      {/* Enhanced Features Section */}
      <section className="py-40 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
              Why Choose RentEase?
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              We have revolutionized the rental experience with our comprehensive platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 relative z-10">
            <FeatureCard
              icon={<FaHome className="text-5xl" />}
              title="Centralized Listings"
              description="Access all available rental spaces in one platform. No more extensive searching required."
            />
            <FeatureCard
              icon={<FaMobileAlt className="text-5xl" />}
              title="User-Friendly Interface"
              description="Easy-to-navigate platform designed for users of all technological proficiency levels."
            />
            <FeatureCard
              icon={<FaFileContract className="text-5xl" />}
              title="Advanced Search"
              description="Filter properties based on location, price range, property type, and specific amenities."
            />
          </div>
        </div>

        {/* Enhanced Background Elements */}
        <div className="absolute top-40 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-[100px] opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-40 right-0 w-[30rem] h-[30rem] bg-indigo-200 rounded-full filter blur-[100px] opacity-40 animate-pulse-slow delay-1000" />
      </section>

      {/* Solutions Section with enhanced spacing and animations */}
      <section className="py-40 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-24 bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
            Perfect Solution for Everyone
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <SolutionCard
              icon={<FaUsersCog />}
              title="For Tenants"
              features={[
                { icon: <FaSearch />, text: "Comprehensive property search" },
                { icon: <FaHome />, text: "Verified rental listings" },
                { icon: <FaComments />, text: "Landlord contact information" },
                { icon: <FaMoneyBillWave />, text: "Transparent pricing" },
                { icon: <FaTools />, text: "Maintenance request system" }
              ]}
            />
            <SolutionCard
              icon={<MdManageAccounts />}
              title="For Landlords"
              features={[
                { icon: <FaUsersCog />, text: "Tenant management system" },
                { icon: <FaClipboardList />, text: "Property listings management" },
                { icon: <FaTools />, text: "Maintenance tracking" },
                { icon: <FaMoneyBillWave />, text: "Payment records" },
                { icon: <FaCheckCircle />, text: "Viewing request handling" }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-40 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-10 animate-fade-in-up">
            Ready to Simplify Your Rental Experience?
          </h2>
          <p className="text-2xl mb-14 max-w-3xl mx-auto text-indigo-100 animate-fade-in-up delay-100">
            Join RentEase today and discover a more efficient way to find and manage rental spaces in Surigao City.
          </p>
          <button 
            onClick={() => loginModal.onOpen()}
            className="group inline-flex items-center gap-4 bg-white text-indigo-600 px-12 py-6 rounded-2xl text-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up delay-200"
          >
            <FaCheckCircle className="text-2xl" />
            Get Started Now
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
          </button>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-white rounded-full filter blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-white rounded-full filter blur-[100px] animate-pulse-slow delay-1000" />
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}

// Update FeatureCard component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-4px] text-center">
    <div className="flex justify-center mb-6">
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Update SolutionCard component
const SolutionCard = ({ icon, title, features }: { icon: React.ReactNode; title: string; features: { icon: React.ReactNode; text: string }[] }) => (
  <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:translate-y-[-4px]">
    <div className="flex items-center gap-4 mb-10">
      <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white text-3xl">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
    <ul className="space-y-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-4 group">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 transition-colors duration-300 group-hover:bg-indigo-100">
            {feature.icon}
          </div>
          <span className="text-gray-700 font-medium">{feature.text}</span>
        </li>
      ))}
    </ul>
  </div>
); 