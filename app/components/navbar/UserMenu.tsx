'use client';

import { useCallback, useRef, useState, useEffect } from "react";
import { SafeUser } from "@/app/types";
import { IoChevronDownOutline } from "react-icons/io5";
import MenuItem from "./MenuItem";
import useRegisterModal from "@/app/hooks/useRegisterModel";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import { signOut } from "next-auth/react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
  currentUser
}) => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const handleItemClick = useCallback((action: () => void) => {
    action();
    setIsOpen(false);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return ( 
    <div className="relative" ref={menuRef}>
      <div 
        onClick={toggleOpen}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {currentUser?.image ? (
            <Image
              src={currentUser.image}
              alt="Avatar"
              width={30}
              height={30}
              className="rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                {currentUser?.firstName?.[0] || '?'}
              </span>
            </div>
          )}
          <div className="flex flex-col -space-y-0.5">
            <span className="text-sm font-medium text-gray-900">
              {currentUser?.firstName || 'Guest'}
            </span>
            <span className="text-sm text-gray-500">
              {currentUser?.email || 'Sign in'}
            </span>
          </div>
        </div>
        <IoChevronDownOutline 
          size={16} 
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[280px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-sm">
          <div className="flex flex-col">
            {currentUser ? (
              <>
                <MenuItem 
                  onClick={() => handleItemClick(() => {})}
                  label="My trips"
                  className="hover:bg-gray-50 px-4 py-3"
                />
                <MenuItem 
                  onClick={() => handleItemClick(() => {})}
                  label="My favorites"
                  className="hover:bg-gray-50 px-4 py-3"
                />
                <MenuItem 
                  onClick={() => handleItemClick(() => {})}
                  label="My reservations"
                  className="hover:bg-gray-50 px-4 py-3"
                />
                <MenuItem 
                  onClick={() => handleItemClick(() => {})}
                  label="My account"
                  className="hover:bg-gray-50 px-4 py-3"
                />
                {currentUser.role === 'LANDLORD' && (
                  <MenuItem 
                    onClick={() => handleItemClick(rentModal.onOpen)}
                    label="Add your rental"
                    className="hover:bg-gray-50 px-4 py-3"
                  />
                )}
                <hr className="my-2 border-gray-100" />
                <MenuItem 
                  onClick={() => handleItemClick(() => signOut())}
                  label="Logout"
                  className="hover:bg-gray-50 px-4 py-3 text-gray-600"
                />
              </>
            ) : (
              <>
                <MenuItem 
                  onClick={() => handleItemClick(loginModal.onOpen)}
                  label="Login"
                  className="hover:bg-gray-50 px-4 py-3"
                />
                <MenuItem 
                  onClick={() => handleNavigation('/register')}
                  label="Sign up"
                  className="hover:bg-gray-50 px-4 py-3"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
   );
}
 
export default UserMenu;
