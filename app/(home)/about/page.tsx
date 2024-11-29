import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - RentEase',
  description: 'Learn more about RentEase and our mission',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About RentEase</h1>
        <div className="prose prose-lg max-w-none">
          {/* Add your about content here */}
          <p className="text-gray-600 leading-relaxed">
            RentEase is your trusted partner in finding the perfect rental space in Surigao City...
          </p>
        </div>
      </div>
    </div>
  );
} 