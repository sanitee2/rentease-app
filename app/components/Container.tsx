'use client';

interface ContainerProps {
  children: React.ReactNode,
  isNavbar?: boolean
}

const Container: React.FC<ContainerProps> = ({
  children,
  isNavbar
}) => {
  return ( 
    <div
    className={`
      
      ${isNavbar ? 'w-[100vw] md:px-12 px-4' : 'max-w-[1440px] mx-auto xl:px-20 md:px-10 sm:px-6 px-4'}
    `}
    >
      {children}
    </div>
   );
}
 
export default Container;