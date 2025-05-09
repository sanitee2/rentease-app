'use client';
import { SafeUser } from "@/app/types";
import { LuMenu } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import UserMenu from "@/app/components/navbar/UserMenu";
import Logo from "@/app/components/navbar/Logo";
import { IoNotificationsOutline } from "react-icons/io5";
// import NotificationsDropdown from "@/app/components/notifications/NotificationsDropdown";
// import { useNotifications } from "@/app/contexts/NotificationsContext";
import { Badge } from "@/components/ui/badge";
import { IoMdNotifications } from "react-icons/io";
import { Bell } from "lucide-react";

interface AdminNavbarProps {
  currentUser?: SafeUser | null;
  onMenuClick: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ currentUser, onMenuClick }) => {
  // const { notifications } = useNotifications();
  // const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!currentUser) return null;

  return (
    <div className="fixed w-full bg-white z-40 shadow-sm px-4">
      <div className="py-4 border-b-[1px]">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onMenuClick}
            >
              <LuMenu size={24} />
            </Button>
            <Logo />
            <span className="inline text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* <NotificationsDropdown 
              currentUser={currentUser}
              trigger={
                <Button variant="ghost" size="icon" className="relative">
                  <IoMdNotifications size={24} />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              }
            /> */}
            <div className="flex items-center gap-4">
              {/* {currentUser && (
                <div className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Bell className="text-gray-600" size={17} />
                </div>
              )} */}
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar; 