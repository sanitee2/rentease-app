'use client';
import { SafeUser } from "@/app/types";
import { LuMenu } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import UserMenu from "@/app/components/navbar/UserMenu";
import Logo from "@/app/components/navbar/Logo";

interface AdminNavbarProps {
  currentUser?: SafeUser | null;
  onMenuClick: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentUser,
  onMenuClick,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            // className="md:hidden"
          >
            <LuMenu size={24} />
          </Button>
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>
          
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <UserMenu currentUser={currentUser} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar; 