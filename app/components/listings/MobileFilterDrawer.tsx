'use client';

import { Sheet, SheetContent } from "@/components/ui/sheet";
import ListingsFilter from "./ListingsFilter";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  propertyAmenities: any[];
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  propertyAmenities
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-full max-w-[100vw] sm:max-w-[540px] p-0 h-full overflow-hidden"
      >
        <div className="h-full flex flex-col">
          <ListingsFilter
            categories={categories}
            propertyAmenities={propertyAmenities}
            onClose={onClose}
            isMobile={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterDrawer; 