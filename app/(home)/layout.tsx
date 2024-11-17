import getCurrentUser from "@/app/actions/getCurrentUser";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/Footer";
import ClientOnly from "@/app/components/ClientOnly";

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden overflow-y-auto">
      <ClientOnly>
        <Navbar currentUser={currentUser} />
      </ClientOnly>
      <main className="flex-grow pt-[80px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
