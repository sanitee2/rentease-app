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
import { Badge } from "@/components/ui/badge";
import { LuSearch, LuArrowLeft, LuEye } from "react-icons/lu";
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { UserRole } from '@prisma/client';
import { format } from 'date-fns';
import UserDetailsDialog from "@/app/components/Modals/UserDetailsDialog";

interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  emailVerified: Date | null;
  phoneNumber: string | null;
  image: string | null;
}

interface UsersClientProps {
  users: User[];
}

const UsersClient = ({ users }: UsersClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const initialTab = searchParams?.get('role') || 'all';

  const handleTabChange = (value: string) => {
    setRoleFilter(value);
    router.push(`/admin/users?role=${value}`);
  };

  const getRoleBadge = (role: UserRole) => {
    const variants = {
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      LANDLORD: 'bg-blue-100 text-blue-700 border-blue-200',
      TENANT: 'bg-green-100 text-green-700 border-green-200',
      USER: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
      <Badge 
        variant="outline" 
        className={variants[role]}
      >
        {role}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phoneNumber && user.phoneNumber.includes(searchQuery));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      
      <Breadcrumbs />

      <Tabs 
        defaultValue={initialTab} 
        className=""
        onValueChange={handleTabChange}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="LANDLORD">Landlords</TabsTrigger>
            <TabsTrigger value="TENANT">Tenants</TabsTrigger>
            <TabsTrigger value="USER">Regular Users</TabsTrigger>
          </TabsList>
        </div>

        <div className="py-4 border-b">
          <div className="relative max-w-xs">
            <label className="sr-only">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-3 ps-9 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search users..."
            />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <LuSearch className="size-4 text-gray-400" />
            </div>
          </div>
        </div>

        <TabsContent value={roleFilter}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || '-'}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <LuEye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UsersClient; 