import Link from 'next/link';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">RentEase</h3>
            <p className="text-gray-500 mb-6">
              Simplifying rental experiences in Surigao City through innovative digital solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">
                <FaFacebook size={24} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">
                <FaTwitter size={24} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">
                <FaInstagram size={24} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-500 transition-colors">
                <FaLinkedin size={24} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/listings" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Landlords/Tenants */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Services</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/landlord" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  For Landlords
                </Link>
              </li>
              <li>
                <Link href="/tenant" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  For Tenants
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-500 hover:text-indigo-500 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500">
                <FaMapMarkerAlt className="text-indigo-500" />
                Surigao City, Philippines
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <FaPhone className="text-indigo-500" />
                +63 XXX XXX XXXX
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <FaEnvelope className="text-indigo-500" />
                contact@rentease.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} RentEase. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-indigo-500 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-indigo-500 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 