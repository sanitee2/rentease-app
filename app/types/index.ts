import { Listing, Room, User, UserRole, ListingStatus, PaymentMode, PaymentStatus } from "@prisma/client";
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from 'socket.io';
import { LeaseStatus as PrismaLeaseStatus } from "@prisma/client";



// SafeListing type excluding date fields, but making them a string type
export type SafeListing = Omit<
  Listing,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  propertyAmenities: {
    amenity: {
      id: string;
      title: string;
      icon: string;
      desc: string;
    };
    note: string | null;
  }[];
  rules: SafeHouseRules | null;
  rooms: {
    id: string;
    title: string;
    price: number | null;
    maxTenantCount: number | null;
    currentTenants: string[];
  }[];
  tenants?: string[];
  pricingType: 'LISTING_BASED' | 'ROOM_BASED';
  price: number | null;
  status: ListingStatus; // Changed to use Prisma's ListingStatus enum
  user?: SafeUser;
  leaseContracts?: {
    status: string;
  }[];
};

// SafeRoom type excluding date fields, but making them a string type
export type SafeRoom = {
  id: string;
  title: string;
  maxTenantCount: number | null;
  currentTenants: string[];
  description: string;
  imageSrc: {
    images: string[];
  };
  roomCategory: string;
  price: number;
  pricingType: 'LISTING_BASED' | 'ROOM_BASED';
  listingId: string;
  amenities: {
    amenity: {
      id: string;
      title: string;
      icon: string;
      desc: string;
    };
    note: string | null;
  }[];
  tenants: { id: string }[];
  listing: {
    pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  };
};

// SafeUser type excluding date fields and making them a string type,
// also making emailVerified nullable and a string type.
export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export interface ListingCategory {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needsMaxTenant: boolean;
  pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  roomTypes: string[];
}

// First, define the HouseRules type
export type SafeHouseRules = {
  id: string;
  listingId: string;
  petsAllowed: boolean;
  childrenAllowed: boolean;
  smokingAllowed: boolean;
  additionalNotes: string | null;
};

// Update ListingInfo props interface
interface ListingInfoProps {
  // ... existing props ...
  rules: SafeHouseRules | null;
  propertyAmenities: SafeListing['propertyAmenities'];
}

export interface MinimalUser {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber: string | null;
}

export type LeaseStatus = PrismaLeaseStatus;

export interface LeaseContract {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  rentAmount: number;
  monthlyDueDate: number;
  outstandingBalance?: number;
  leaseTerms: string;
  status: LeaseStatus;
  listing?: {
    id: string;
    title: string;
  };
  room?: {
    id: string;
    title: string;
  };
  Payment?: Array<{
    id: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    paymentMethod: PaymentMode;
  }>;
  createdAt: Date;
}

export interface TenantData {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  email: string | null;
  phoneNumber?: string | null;
  image?: string | null;
  tenant: {
    id: string;
    currentRoom: {
      id: string;
      title: string;
    } | null;
  } | null;
  leaseContracts: LeaseContract[];
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  images?: string[];
  listing?: {
    id: string;
    title: string;
  };
}
