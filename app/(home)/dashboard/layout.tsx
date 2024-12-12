import getCurrentUser from "@/app/actions/getCurrentUser";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/Footer";
import ClientOnly from "@/app/components/ClientOnly";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard - RentEase',
  description: 'Manage your payments and maintenance requests',
};


export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {

  
  const currentUser = await getCurrentUser();

  return (
    <ClientOnly>
      <div className="min-h-screen flex flex-col">
        
        {/* Main Content */}
        <div className="flex-grow">
          <main>
            {children}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </ClientOnly>
  );
} 