import React, { useState, ReactNode, ReactElement } from 'react';

interface CollapsibleProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

interface CollapsibleTriggerProps {
  children: ((props: { open: boolean }) => ReactNode) | ReactNode;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  className?: string;
}

interface CollapsibleContentProps {
  children: ReactNode;
  isOpen?: boolean;
}

interface CollapsibleChildProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="collapsible">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as ReactElement<CollapsibleChildProps>, {
            isOpen,
            setIsOpen
          });
        }
        return child;
      })}
    </div>
  );
};

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ 
  children, 
  isOpen, 
  setIsOpen, 
  className = '' 
}) => {
  return (
    <div 
      className={className} 
      onClick={() => setIsOpen && setIsOpen(!isOpen)}
    >
      {typeof children === 'function' ? children({ open: isOpen || false }) : children}
    </div>
  );
};

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ 
  children, 
  isOpen 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="collapsible-content">
      {children}
    </div>
  );
}; 