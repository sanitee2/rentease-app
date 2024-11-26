'use client';
import React, { createContext, useState, useEffect } from 'react';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  currentUser?: SafeUser | null;
  children: React.ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

interface AdminSidebarContextProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextProps>({
  expanded: true,
  setExpanded: () => {}
});

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  children, 
  currentUser, 
  expanded, 
  setExpanded 
}) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setExpanded(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setExpanded]);

  return (
    <div>
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setExpanded(false)}
        />
      )}
      
      <aside 
        className={`
          fixed z-30 top-[70px] bottom-0 left-0
          transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200 
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          ${expanded ? 'w-64' : 'w-16'}
          ${isMobile && !expanded ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <nav className="h-full flex flex-col">
          <div className="flex-1">
            <div className={`py-4 ${expanded ? 'px-3' : 'px-2'}`}>
              <AdminSidebarContext.Provider value={{ expanded, setExpanded }}>
                <ul className="space-y-1">{children}</ul>
              </AdminSidebarContext.Provider>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default AdminSidebar; 