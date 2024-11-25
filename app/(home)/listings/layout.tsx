import getCurrentUser from "@/app/actions/getCurrentUser";
import Navbar from "@/app/components/navbar/Navbar";
import ClientOnly from "@/app/components/ClientOnly";

export default async function ListingsLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const currentUser = await getCurrentUser();

  return (
    <>

      {/* Main Content */}
      <div className="">
        <main>
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
