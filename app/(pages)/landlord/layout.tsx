import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientLandlordLayout from "./ClientLandlordLayout";


export default async function LandlordLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const currentUser = await getCurrentUser();

  return (
    <ClientLandlordLayout currentUser={currentUser}>
      {children}
    </ClientLandlordLayout>
  );
}
