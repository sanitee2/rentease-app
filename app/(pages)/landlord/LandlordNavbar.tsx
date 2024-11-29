'use client';

import UserMenu from '@/app/components/navbar/UserMenu'
import { SafeUser } from '@/app/types'
import { LuMenu } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import Logo from '@/app/components/navbar/Logo';
import NotificationsDropdown from '@/app/components/notifications/NotificationsDropdown';
import { useNotifications } from '@/app/contexts/NotificationsContext';
import { Badge } from "@/components/ui/badge";
import { IoNotificationsOutline } from 'react-icons/io5';

interface LandlordNavbarProps {
  currentUser?: SafeUser | null;
  onMenuClick: () => void;
  expanded: boolean;
}

const LandlordNavbar: React.FC<LandlordNavbarProps> = ({
  currentUser,
  onMenuClick,
  expanded,
}) => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="mr-2 md:mr-4"
          >
            <LuMenu size={24} />
          </Button>
          <div className={`flex items-center gap-2 md:gap-4 transition-all duration-300`}>
            <Logo />
            <span className="inline text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Landlord Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <>
              {/* <NotificationsDropdown currentUser={currentUser}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <IoNotificationsOutline size={28} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </NotificationsDropdown> */}
              <UserMenu currentUser={currentUser} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordNavbar;