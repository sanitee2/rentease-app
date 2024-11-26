'use client';
import dynamic from 'next/dynamic';
import Container from "../Container";
import Logo from "./Logo";
import { SafeUser } from '@/app/types';
import { RiNotification2Line } from "react-icons/ri";

// Optimize dynamic imports with preload and loading states
const Search = dynamic(() => import("./Search"), {
  ssr: false,
  loading: () => <div className="w-full md:w-auto h-10 bg-gray-100 animate-pulse rounded-lg" />
});

const UserMenu = dynamic(() => import("./UserMenu"), {
  ssr: false,
  loading: () => <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-lg" />
});

const Categories = dynamic(() => import("./Categories"), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse" />
});

interface NavbarProps {
  currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser
}) => {
  return ( 
    <div className="top-0 bg-white z-40">
      <div className="py-4 border-b-[1px]">
        <Container isNavbar>
          <div className="flex items-center justify-between gap-3 md:gap-0">
            <Logo />
            <Search />
            <div className="flex items-center gap-4">
              {currentUser && (
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <RiNotification2Line 
                    size={20} 
                    className="text-gray-600" 
                  />
                </button>
              )}
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>  
      </div>
    </div>
   );
}

export default Navbar;