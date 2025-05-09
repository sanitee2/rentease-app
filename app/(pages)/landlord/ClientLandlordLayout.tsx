'use client';

import { useState } from 'react';
import { SafeUser } from "@/app/types";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import SidebarItem from "@/app/components/Sidebar/SidebarItem";
import { 
  LuLayoutDashboard,
  LuHome,
  LuUsers,
  LuWallet,
  LuWrench,
  LuCalendarCheck,
  LuUser
} from 'react-icons/lu';
import LandlordNavbar from "./LandlordNavbar";
import AddRoomModal from "./AddRoomModal";
import Container from "@/app/components/Container";

interface ClientLandlordLayoutProps {
  currentUser: SafeUser | null;
  children: React.ReactNode;
}

const ClientLandlordLayout: React.FC<ClientLandlordLayoutProps> = ({ 
  currentUser,
  children 
}) => {
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNavbar 
        currentUser={currentUser} 
        onMenuClick={toggleSidebar}
        expanded={expanded}
      />
      <Sidebar
        currentUser={currentUser}
        expanded={expanded}
        setExpanded={setExpanded}
      >
        <SidebarItem icon={<LuLayoutDashboard size={20}/>} text="Dashboard" href="/landlord/dashboard"/>
        <SidebarItem icon={<LuHome size={20}/>} text="Listings" href="/landlord/listings"/>
        <SidebarItem icon={<LuUsers size={20}/>} text="Tenants" href="/landlord/tenants"/>
        <SidebarItem icon={<LuWallet size={20}/>} text="Payments" href="/landlord/payments"/>
        <SidebarItem icon={<LuWrench size={20}/>} text="Maintenance Requests" href="/landlord/maintenance"/>
        <SidebarItem icon={<LuCalendarCheck size={20}/>} text="Viewing Requests" href="/landlord/viewing-requests"/>
        
      </Sidebar>
      <main className={`pt-[70px] ${expanded ? 'md:ml-64' : 'md:ml-16'} transition-all duration-300`}>
        <div className="">
          <Container>
            {children}
          </Container>
        </div>
      </main>
      <AddRoomModal />
    </div>
  );
};

export default ClientLandlordLayout; 