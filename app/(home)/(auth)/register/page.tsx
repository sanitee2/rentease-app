import Footer from '@/app/components/Footer';
import RegisterForm from './components/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - RentEase',
  description: 'Create your RentEase account',
};

export default function RegisterPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create your RentEase Account
            </h1>
            <p className="mt-2 text-gray-600">
              Join our community of renters and property managers
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      <Footer />
    </>
  );
} 