'use client';
import Link from 'next/link';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebarContext } from './AdminSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  alert?: boolean;
}

const AdminSidebarItem: React.FC<AdminSidebarItemProps> = ({ 
  icon, 
  text, 
  href,
  alert 
}) => {
  const pathname = usePathname();
  const { expanded } = useContext(AdminSidebarContext);
  const isActive = pathname === href;

  return (
    <li>
      {!expanded ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={href}
                className={`
                  relative flex items-center justify-center px-2 py-3 my-1
                  font-medium rounded-lg cursor-pointer
                  transition-colors group
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`
                  ${isActive ? 'text-indigo-600' : 'text-gray-500'}
                  transition-colors
                `}>
                  {icon}
                </div>
                {alert && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600"/>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              align="center" 
              className="bg-white text-indigo-600 border border-gray-200"
            >
              <p>{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Link 
          href={href}
          className={`
            relative flex items-center py-2.5 px-3 my-1
            font-medium rounded-lg cursor-pointer
            transition-colors group
            ${isActive 
              ? 'bg-indigo-50 text-indigo-600' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <div className={`
            ${isActive ? 'text-indigo-600' : 'text-gray-500'}
            mr-3
            transition-colors
          `}>
            {icon}
          </div>
          <span className="text-sm">{text}</span>
          {alert && (
            <div className="absolute right-2 w-2 h-2 rounded-full bg-indigo-600"/>
          )}
        </Link>
      )}
    </li>
  );
};

export default AdminSidebarItem; 