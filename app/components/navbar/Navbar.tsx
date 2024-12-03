'use client';
import dynamic from 'next/dynamic';
import Container from "../Container";
import Logo from "./Logo";
import { SafeUser } from '@/app/types';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import { NotificationsProvider, useNotifications } from '@/app/contexts/NotificationsContext';
import NotificationsDropdown from '@/app/components/notifications/NotificationsDropdown';
import { Badge } from "@/components/ui/badge";

const UserMenu = dynamic(() => import("./UserMenu"), {
  ssr: false,
  loading: () => <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-lg" />
});

interface NavbarProps {
  currentUser?: SafeUser | null;
}

interface NavItem {
  label: string;
  href: string;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();

  const navigationItems: NavItem[] = [
    { 
      label: currentUser ? 'Dashboard' : 'Home', 
      href: currentUser ? '/dashboard' : '/' 
    },
    { label: 'Listings', href: '/listings' },
    
    { label: currentUser ? 'Payments' : 'About Us',
      href: currentUser ? '/payments' : '/about-us' },
    { label: currentUser ? 'Maintenance' : 'Contact',
      href: currentUser ? '/maintenance' : '/contact' },
    { label: currentUser ? 'Favorites' : '', href: currentUser ? '/favorites' : '' },
  ];

  return (
      <div className="fixed bg-white z-40 shadow-sm">
        <div className="py-4 border-b-[1px]">
          <Container isNavbar>
            <div className="flex items-center justify-between gap-3 md:gap-0">
              <Logo />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-indigo-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1">
                <nav className="flex items-center gap-8">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={cn(
                        "relative px-2 py-1 text-sm font-medium transition-all duration-200 ease-in-out",
                        pathname === item.href
                          ? "text-indigo-600"
                          : "text-gray-600 hover:text-indigo-600",
                        "group"
                      )}
                    >
                      {item.label}
                      <span 
                        className={cn(
                          "absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform duration-200 ease-in-out",
                          pathname === item.href
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>
                  ))}
                </nav>

                {!currentUser && (
                  <Button
                    onClick={() => router.push('/register-landlord')}
                    className="relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 h-auto rounded-full transition-all duration-300 font-medium text-sm hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="relative flex items-center gap-2">
                      <span className="text-xl">+</span>
                      Add your property
                    </span>
                  </Button>
                )}
              </div>

              {/* Mobile Navigation */}
              <div className={cn(
                "fixed inset-x-0 top-[73px] p-4 bg-white border-b md:hidden transition-all duration-300 ease-in-out",
                isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
              )}>
                <nav className="flex flex-col gap-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!currentUser && (
                    <Button
                      onClick={() => {
                        router.push('/register-landlord');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                    >
                      <span className="text-xl mr-2">+</span>
                      Add your property
                    </Button>
                  )}
                </nav>
              </div>

              {/* Notification Bell and User Menu */}
              <div className="flex items-center gap-4">
                
                {currentUser && (
                  <NotificationsDropdown>
                    <div className="flex items-center justify-center p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      <Bell className="text-gray-600" size={18} />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  </NotificationsDropdown>
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