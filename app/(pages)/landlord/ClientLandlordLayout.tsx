'use client';

import { useState } from 'react';
import { SafeUser } from "@/app/types";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import SidebarItem from "@/app/components/Sidebar/SidebarItem";
import { RxDashboard, RxHome } from "react-icons/rx";
import { PiMoneyLight, PiUsers } from "react-icons/pi";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNavbar 
        currentUser={currentUser} 
        expanded={expanded} 
        setExpanded={setExpanded}
      />
      <Sidebar 
        currentUser={currentUser}
        expanded={expanded}
        setExpanded={setExpanded}
      >
        <SidebarItem icon={<RxDashboard size={20}/>} text="Dashboard" href="/landlord/dashboard"/>
        <SidebarItem icon={<RxHome size={20}/>} text="Listings" href="/landlord/listings" alert/>
        <SidebarItem icon={<PiUsers size={20}/>} text="Tenants" href="/landlord/tenants"/>
        <SidebarItem icon={<PiMoneyLight size={20}/>} text="Payments" href="/landlord/payments"/>
        <SidebarItem icon={<PiMoneyLight size={20}/>} text="Maintenance Requests" href="/landlord/payments"/>
        <SidebarItem icon={<PiMoneyLight size={20}/>} text="Viewing Requests" href="/landlord/payments"/>
      </Sidebar>
      <main className={`transition-all duration-300 pt-[57px]
        ${expanded ? 'ml-64' : 'ml-20'}`}
      >
        <div className="p-8">
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