import getCurrentUser from "@/app/actions/getCurrentUser";
import AdminLayout from "./components/AdminLayout";

export default async function AdminRootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const currentUser = await getCurrentUser();

  return (
    <AdminLayout currentUser={currentUser}>
      {children}
    </AdminLayout>
  );
}
