'use client';

import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  rightIcon?: IconType;
}
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  rightIcon: RightIcon
}) => {
  return ( 
    <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      relative
      disabled:opacity-70
      disabled:cursor-not-allowed
      rounded-lg
      hover:opacity-80
      transition
      w-full
      ${outline ? 'bg-white' : 'bg-indigo-700'}
      ${outline ? 'border-black' : 'bg-indigo-700'}
      ${outline ? 'text-black' : 'text-white'}
      ${small ? 'py-1' : 'py-3'}
      ${small ? 'text-sm' : 'text-md'}
      ${small ? 'border-[1px]' : 'border-2'}
      
    `}>
      {Icon && (
        <Icon 
          size={24}
          className="absolute left-4 top-3"
        />
      )}
      {label}
      {RightIcon && (
        <RightIcon 
          size={24}
          className="absolute right-4 top-3"
        />
      )}
    </button>
   );
}
 
export default Button;
