'use client';

interface MenuItemProps {
  onClick: () => void;
  label: string;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  onClick,
  label,
  className
}) => {
  return ( 
    <div
      onClick={onClick}
      className={`
        transition
        cursor-pointer
        ${className || ''}
      `}
    >
      {label}
    </div>
   );
}
 
export default MenuItem;