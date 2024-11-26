'use client';
import { useState } from 'react';
import { SafeUser } from '@/app/types';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminSidebarItem from './AdminSidebarItem';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuHome,
  LuSettings,
  LuList,
  LuPackage
} from 'react-icons/lu';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: SafeUser | null;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children,
  currentUser
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <AdminNavbar 
        currentUser={currentUser}
        onMenuClick={() => setExpanded(!expanded)}
      />
      
      <AdminSidebar
        currentUser={currentUser}
        expanded={expanded}
        setExpanded={setExpanded}
      >
        <AdminSidebarItem 
          icon={<LuLayoutDashboard size={20} />}
          text="Dashboard"
          href="/admin/dashboard"
        />
        <AdminSidebarItem 
          icon={<LuUsers size={20} />}
          text="Users"
          href="/admin/users"
        />
        <AdminSidebarItem 
          icon={<LuHome size={20} />}
          text="Listings"
          href="/admin/listings"
        />
        <AdminSidebarItem 
          icon={<LuPackage size={20} />}
          text="Amenities"
          href="/admin/amenities"
        />
        <AdminSidebarItem 
          icon={<LuList size={20} />}
          text="Categories"
          href="/admin/categories"
        />
        <AdminSidebarItem 
          icon={<LuSettings size={20} />}
          text="Settings"
          href="/admin/settings"
        />
      </AdminSidebar>

      <main 
        className={`
          pt-[70px] 
          transition-all 
          duration-300
          ${expanded ? 'md:pl-64' : 'md:pl-16'}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 