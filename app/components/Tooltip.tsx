'use client';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="
        absolute left-full top-1/2 -translate-y-1/2 ml-2
        px-2 py-1.5
        bg-white border border-gray-200
        rounded-md shadow-lg
        text-sm font-medium text-indigo-600
        opacity-0 invisible
        group-hover:opacity-100 group-hover:visible
        transition-all duration-300
        whitespace-nowrap
        z-50
      ">
        {text}
        <div className="
          absolute top-1/2 -translate-y-1/2 -left-1.5
          w-2.5 h-2.5
          bg-white
          border-l border-t border-gray-200
          transform rotate-45
        "/>
      </div>
    </div>
  );
};

export default Tooltip; 