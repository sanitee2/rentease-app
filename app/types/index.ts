import { Listing, Room, User, UserRole, ListingStatus } from "@prisma/client";

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
  rooms?: {
    id: string;
    title: string;
    price: number;
  }[];
  pricingType: 'LISTING_BASED' | 'ROOM_BASED';
  price: number | null;
  status: ListingStatus; // Changed to use Prisma's ListingStatus enum
};

// SafeRoom type excluding date fields, but making them a string type
export type SafeRoom = {
  id: string;
  title: string;
  description: string;
  imageSrc: {
    images: string[];
  };
  roomCategory: string;
  price: number;
  maxTenantCount?: number;
  currentTenants: string[];
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
  name: string | null;
  email: string;
  role: string;
}

export interface TenantData {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string | null;
  image?: string | null;
  tenantProfile: {
    id: string;
    currentRoom?: {
      id: string;
      title: string;
    } | null;
  } | null;
  leaseContracts: {
    id: string;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    listing: {
      id: string;
      title: string;
    };
  }[];
}
