'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuEye, LuSearch, LuArrowLeft, LuPencil, LuTrash } from "react-icons/lu";
import Breadcrumbs from '@/app/components/Breadcrumbs';
import AddCategoryModal from "@/app/(pages)/admin/dashboard/components/AddCategoryModal";
import * as FaIcons from 'react-icons/fa';
import { IconType } from 'react-icons';

interface Category {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needsMaxTenant: boolean;
  pricingType?: 'ROOM_BASED' | 'LISTING_BASED';
  roomTypes?: string[];
}

interface CategoriesClientProps {
  listingCategories: Category[];
  roomCategories: Category[];
}

const CategoriesClient = ({ listingCategories, roomCategories }: CategoriesClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<'listing' | 'room'>('listing');

  const initialTab = searchParams?.get('type') || 'listing';

  const handleTabChange = (value: string) => {
    setCategoryType(value as 'listing' | 'room');
    router.push(`/admin/categories?type=${value}`);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
        >
          <LuArrowLeft className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>
      
      <Breadcrumbs />

      <Tabs 
        defaultValue={initialTab} 
        className=""
        onValueChange={handleTabChange}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="listing">Listing Categories</TabsTrigger>
            <TabsTrigger value="room">Room Categories</TabsTrigger>
          </TabsList>

          <Button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add Category
          </Button>
        </div>

        <div className="py-4 border-b">
          <div className="relative max-w-xs">
            <label className="sr-only">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search categories..."
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <LuSearch className="size-4 text-gray-400" />
            </div>
          </div>
        </div>

        <TabsContent value="listing">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Pricing Type</TableHead>
                <TableHead>Max Tenant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listingCategories.map((category) => {
                const Icon: IconType = FaIcons[category.icon as keyof typeof FaIcons] || FaIcons.FaHome;
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 w-fit">
                        <Icon size={16} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.title}</TableCell>
                    <TableCell>{category.desc}</TableCell>
                    <TableCell>{category.pricingType?.replace('_', ' ')}</TableCell>
                    <TableCell>{category.needsMaxTenant ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="room">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Max Tenant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomCategories.map((category) => {
                const Icon: IconType = FaIcons[category.icon as keyof typeof FaIcons] || FaIcons.FaBed;
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 w-fit">
                        <Icon size={16} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.title}</TableCell>
                    <TableCell>{category.desc}</TableCell>
                    <TableCell>{category.needsMaxTenant ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categoryType={categoryType}
        initialData={selectedCategory}
      />
    </div>
  );
};

export default CategoriesClient; 