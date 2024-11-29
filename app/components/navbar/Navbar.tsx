'use client';
import dynamic from 'next/dynamic';
import Container from "../Container";
import Logo from "./Logo";
import { SafeUser } from '@/app/types';
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  // Create dynamic navigation items based on auth state
  const navigationItems: NavItem[] = [
    { 
      label: currentUser ? 'Dashboard' : 'Home', 
      href: currentUser ? '/dashboard' : '/' 
    },
    { label: 'Listings', href: '/listings' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return ( 
    <div className="fixed w-full bg-white z-40 shadow-sm">
      <div className="py-6 border-b-[1px]">
        <Container isNavbar>
          <div className="flex items-center justify-between gap-3 md:gap-0">
            <Logo />
            
            {/* Centered nav and button container */}
            <div className="hidden md:flex items-center justify-center gap-12 flex-1">
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
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    px-6
                    py-2.5
                    h-auto
                    rounded-full
                    transition-all
                    duration-300
                    font-medium
                    text-sm
                    hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]
                    hover:-translate-y-0.5
                    active:translate-y-0
                    before:absolute
                    before:inset-0
                    before:rounded-full
                    before:bg-indigo-600
                    before:transition-transform
                    before:duration-300
                    overflow-hidden
                    before:hover:scale-105
                    isolate
                  "
                >
                  <span className="relative flex items-center gap-2">
                    <span className="text-xl">+</span>
                    Add your property
                  </span>
                </Button>
              )}
            </div>

            <UserMenu currentUser={currentUser} />
          </div>
        </Container>  
      </div>
    </div>
  );
}

export default Navbar;