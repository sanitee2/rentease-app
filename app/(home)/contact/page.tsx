import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - RentEase',
  description: 'Get in touch with RentEase team',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <div className="max-w-2xl">
          {/* Add your contact form or contact information here */}
          <p className="text-gray-600 mb-8">
            Have questions? We'd love to hear from you...
          </p>
        </div>
      </div>
    </div>
  );
} 