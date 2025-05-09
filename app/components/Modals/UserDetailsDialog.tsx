'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserRole } from "@prisma/client";
import Image from "next/image";
import { LuUser, LuMail, LuPhone, LuCalendar } from "react-icons/lu";

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

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsDialog({
  user,
  isOpen,
  onClose
}: UserDetailsDialogProps) {
  if (!user) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${user.firstName}'s profile`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <LuUser className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.middleName} {user.lastName} {user.suffix}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(user.role)}
                {user.emailVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <LuMail className="h-4 w-4" />
                <span>{user.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <LuPhone className="h-4 w-4" />
                <span>{user.phoneNumber || 'No phone number provided'}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <LuCalendar className="h-4 w-4" />
                <span>Joined: {format(new Date(user.createdAt), 'PPP')}</span>
              </div>
              {user.emailVerified && (
                <div className="flex items-center gap-2 text-gray-600">
                  <LuCalendar className="h-4 w-4" />
                  <span>Verified: {format(new Date(user.emailVerified), 'PPP')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 