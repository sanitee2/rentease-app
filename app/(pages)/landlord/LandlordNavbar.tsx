'use client';

import UserMenu from '@/app/components/navbar/UserMenu'
import { SafeUser } from '@/app/types'
import React from 'react'
import { LuChevronFirst, LuChevronLast } from "react-icons/lu";
import Logo from '@/app/components/navbar/Logo';

interface LandlordNavbarProps {
  currentUser?: SafeUser | null;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const LandlordNavbar: React.FC<LandlordNavbarProps> = ({
  currentUser,
  expanded,
  setExpanded
}) => {
  return (
    <div className='
      fixed 
      right-0 
      left-0 
      top-0 
      h-[70px] 
      flex 
      flex-row 
      justify-between 
      items-center 
      px-4 
      bg-white 
      shadow-sm 
      z-[30]
      mx-auto
    '>
      <div className='flex items-center gap-4'>
        <button 
          onClick={() => setExpanded(!expanded)}
          className='p-2 rounded-lg hover:bg-gray-100 transition-all
            active:scale-95 focus:outline-none'
        >
          {expanded ? <LuChevronFirst size={20}/> : <LuChevronLast size={20} />}
        </button>
        <Logo />
      </div>
      <div>
        <UserMenu currentUser={currentUser}/>
      </div>
    </div>
  );
};

export default LandlordNavbar;