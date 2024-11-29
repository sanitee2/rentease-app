'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddCategoryModal from "./AddCategoryModal";

interface DashboardActionsProps {
  path: string;
  showAddButton?: boolean;
  categoryType?: 'listing' | 'room';
}

const DashboardActions = ({ 
  path, 
  showAddButton = false,
  categoryType 
}: DashboardActionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {showAddButton && (
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      )}
      <Link href={path}>
        <Button 
          variant="outline" 
          size="sm"
          className="text-indigo-500 border-indigo-500 hover:bg-indigo-50"
        >
          View All
        </Button>
      </Link>
      {showAddButton && categoryType && (
        <AddCategoryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categoryType={categoryType}
        />
      )}
    </div>
  );
};

export default DashboardActions; 