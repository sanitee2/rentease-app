'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  width = 100, 
  height = 100 
}) => {
  const router = useRouter();

  return ( 
    <Image
      onClick={() => router.push('/')}
      alt="Logo"
      className="hidden md:block cursor-pointer"
      height={height}
      width={width}
      src='/images/logo.png'
    />
   );
}
 
export default Logo;