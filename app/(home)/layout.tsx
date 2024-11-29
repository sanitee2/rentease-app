import getCurrentUser from "@/app/actions/getCurrentUser";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/Footer";
import ClientOnly from "@/app/components/ClientOnly";

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <div className="fixed z-40 top-0 w-full bg-white shadow-sm box-border">
        <ClientOnly>
          <Navbar currentUser={currentUser} />
        </ClientOnly>
      </div>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pt-[86px]">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
}
