'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ListingsFilter from "./ListingsFilter";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[380px] p-0 flex flex-col h-full"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>
        
        {/* Make the content area scrollable but keep the button fixed */}
        <div className="flex-1 overflow-y-auto">
          <ListingsFilter 
            categories={categories}
            onClose={onClose}
            isMobile
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterDrawer; 