'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BsGenderAmbiguous, 
  BsGenderMale, 
  BsGenderFemale, 
  BsSliders2, 
  BsFilterCircleFill 
} from 'react-icons/bs';
import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';  // Import reset icon
import LocationFilter from './LocationFilter';
import { IoOptionsOutline } from 'react-icons/io5';
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Add PropertyAmenity type
interface PropertyAmenity {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

// Update props interface
interface ListingsFilterProps {
  categories: any[];
  propertyAmenities: PropertyAmenity[];
  onClose?: () => void;
  isMobile?: boolean;
  onResetFilters?: () => void;
}

// Define specific types for rules
type HouseRules = {
  petsAllowed: boolean;
  childrenAllowed: boolean;
  smokingAllowed: boolean;
};

type RuleKey = keyof HouseRules;

// Define the filter state type
interface FilterState {
  search: string;
  category: string;
  priceRange: {
    min: number | '';
    max: number | '';
  };
  genderRestriction: string;
  rules: HouseRules;
  requirements: {
    hasAgeRequirement: boolean;
    minimumAge: string;
    overnightGuestsAllowed: boolean;
  };
  location?: { lat: number; lng: number; radius: number; } | null;
  amenities: string[];
}

// Define gender options type
type GenderOption = {
  value: string;
  label: string;
  icon: IconType;
};

// Add this helper function to count active filters
const getActiveFilterCount = (filters: FilterState): number => {
  let count = 0;
  if (filters.category) count++;
  if (filters.priceRange.min || filters.priceRange.max) count++;
  if (filters.genderRestriction && filters.genderRestriction !== '') count++;
  if (Object.values(filters.rules).some(Boolean)) count++;
  if (Object.values(filters.requirements).some(Boolean)) count++;
  if (filters.location) count++;
  if (filters.amenities.length > 0) count++;
  return count;
};

const ListingsFilter: React.FC<ListingsFilterProps> = ({
  categories,
  propertyAmenities,
  onClose,
  isMobile,
  onResetFilters
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isLocationReset, setIsLocationReset] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: params?.get('search') || '',
    category: params?.get('category') || '',
    priceRange: {
      min: params?.get('minPrice') ? parseInt(params.get('minPrice')!) : '',
      max: params?.get('maxPrice') ? parseInt(params.get('maxPrice')!) : ''
    },
    genderRestriction: params?.get('genderRestriction') || '',
    rules: {
      petsAllowed: params?.get('petsAllowed') === 'true',
      childrenAllowed: params?.get('childrenAllowed') === 'true',
      smokingAllowed: params?.get('smokingAllowed') === 'true'
    },
    requirements: {
      hasAgeRequirement: params?.get('hasAgeRequirement') === 'true',
      minimumAge: params?.get('minimumAge') || '',
      overnightGuestsAllowed: params?.get('overnightGuestsAllowed') === 'true'
    },
    location: null,
    amenities: params?.get('amenities')?.split(',').filter(Boolean) || []
  });

  // Type-safe handleFilterChange function
  const handleFilterChange = useCallback(<T extends keyof FilterState>(
    section: T,
    key: string,
    value: FilterState[T] extends object ? FilterState[T][keyof FilterState[T]] : FilterState[T]
  ) => {
    setFilters(prev => {
      if (typeof prev[section] === 'object' && key) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  }, []);

  const handleLocationChange = useCallback((locationData: { 
    lat: number; 
    lng: number; 
    radius: number 
  } | null) => {
    setFilters(prev => ({
      ...prev,
      location: locationData
    }));
  }, []);

  const applyFilters = useCallback(() => {
    const query: Record<string, any> = {};

    // Add category if exists
    if (filters.category) {
      query.category = filters.category;
    }

    // Handle price range - only add if there's a valid value
    if (filters.priceRange.min !== '') {
      const minPrice = Number(filters.priceRange.min);
      if (!isNaN(minPrice) && minPrice > 0) { // Only add if greater than 0
        query.minPrice = minPrice;
      }
    }

    if (filters.priceRange.max !== '') {
      const maxPrice = Number(filters.priceRange.max);
      if (!isNaN(maxPrice) && maxPrice > 0) { // Only add if greater than 0
        query.maxPrice = maxPrice;
      }
    }

    // Add other filters
    if (filters.genderRestriction) query.genderRestriction = filters.genderRestriction;

    // Add rules and requirements
    Object.entries(filters.rules).forEach(([key, value]) => {
      if (value) query[key] = value;
    });

    Object.entries(filters.requirements).forEach(([key, value]) => {
      if (value) query[key] = value;
    });

    // Add location if exists
    if (filters.location) {
      query.lat = filters.location.lat;
      query.lng = filters.location.lng;
      query.radius = filters.location.radius;
    }

    // Add amenities to query
    if (filters.amenities.length > 0) {
      query.amenities = filters.amenities.join(',');
    }

    const url = qs.stringifyUrl({
      url: '/listings',
      query
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
    if (onClose) onClose();
  }, [filters, router, onClose]);

  // House rules mapping with proper typing
  const houseRules: Record<RuleKey, string> = {
    petsAllowed: 'Pets Allowed',
    childrenAllowed: 'Children Allowed',
    smokingAllowed: 'Smoking Allowed'
  };

  // Define gender options
  const genderOptions: GenderOption[] = [
    {
      value: 'BOTH',
      label: 'Any Gender',
      icon: BsGenderAmbiguous
    },
    {
      value: 'MEN_ONLY',
      label: 'Male Only',
      icon: BsGenderMale
    },
    {
      value: 'LADIES_ONLY',
      label: 'Female Only',
      icon: BsGenderFemale
    }
  ];

  // Set default open accordion values
  const [openAccordions, setOpenAccordions] = useState<string[]>([
    'category',  // Property Type
    'price'      // Price Range
  ]);

  // Add reset handlers
  const handleResetSection = useCallback((section: keyof FilterState) => {
    if (section === 'location') {
      setIsLocationReset(true);
      setTimeout(() => setIsLocationReset(false), 100);
    }
    
    setFilters(prev => ({
      ...prev,
      [section]: section === 'search'
        ? ''
        : section === 'priceRange'
        ? { min: '', max: '' }
        : section === 'rules'
        ? { petsAllowed: false, childrenAllowed: false, smokingAllowed: false }
        : section === 'requirements'
        ? { hasAgeRequirement: false, minimumAge: '', overnightGuestsAllowed: false }
        : section === 'amenities'
        ? []
        : section === 'location'
        ? null
        : ''
    }));
  }, []);

  const handleResetAllFilters = useCallback(() => {
    // First set location reset flag
    setIsLocationReset(true);
    
    // Reset all filters
    setFilters({
      search: '',
      category: '',
      priceRange: { min: '', max: '' },
      genderRestriction: '',
      rules: {
        petsAllowed: false,
        childrenAllowed: false,
        smokingAllowed: false
      },
      requirements: {
        hasAgeRequirement: false,
        minimumAge: '',
        overnightGuestsAllowed: false
      },
      location: null,  // Ensure location is reset to null
      amenities: []
    });
    
    // Reset location flag after a short delay
    setTimeout(() => setIsLocationReset(false), 100);
    
    onResetFilters?.();
  }, [onResetFilters]);

  // Expose the reset function through a ref or effect
  useEffect(() => {
    if (onResetFilters) {
      onResetFilters = handleResetAllFilters;
    }
  }, [handleResetAllFilters]);

  const handleApplyFilters = () => {
    applyFilters();
    onClose?.();
  };

  // Update price validation helper
  const validatePriceInput = (value: string): number | '' => {
    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^\d]/g, '');
    const numValue = Number(cleanValue);
    
    if (cleanValue === '') return '';
    if (isNaN(numValue)) return '';
    return numValue === 0 ? '' : numValue; // Convert 0 to empty string
  };

  // Update price change handler
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const validatedValue = validatePriceInput(value);
    
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: validatedValue === 0 ? '' : validatedValue // Convert 0 to empty string
      }
    }));
  };

  // Add a loading state for search
  const [isSearching, setIsSearching] = useState(false);

  // Add handleSearch function
  const handleSearch = useCallback(() => {
    const query: Record<string, any> = {};
    
    // Add all existing filters to query
    if (filters.category) query.category = filters.category;
    if (filters.priceRange.min) query.minPrice = filters.priceRange.min;
    if (filters.priceRange.max) query.maxPrice = filters.priceRange.max;
    if (filters.genderRestriction) query.genderRestriction = filters.genderRestriction;
    if (filters.amenities.length > 0) query.amenities = filters.amenities.join(',');
    
    // Add search to query if it exists
    if (filters.search.trim()) {
      query.search = filters.search.trim();
    }

    const url = qs.stringifyUrl({
      url: '/listings',
      query
    }, { skipNull: true, skipEmptyString: true });

    router.push(url);
    if (onClose) onClose();
  }, [filters, router, onClose]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Filter Header */}
      {isMobile ? (
        // Mobile Header
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        // Desktop Header
        <div className="flex flex-col gap-2 p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Filters
            </h3>
            {getActiveFilterCount(filters) > 0 && (
              <Button
                onClick={handleResetAllFilters}
                variant="ghost"
                size="sm"
                className="text-sm text-neutral-600 hover:text-indigo-600"
              >
                <BiReset size={14} className="mr-2" />
                Reset all
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {getActiveFilterCount(filters) > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge 
                  variant="outline" 
                  className="bg-white hover:bg-neutral-50 transition-colors group"
                >
                  {filters.category}
                  <button 
                    onClick={() => handleResetSection('category')}
                    className="ml-1 text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(filters.priceRange.min || filters.priceRange.max) && (
                <Badge 
                  variant="outline" 
                  className="bg-white hover:bg-neutral-50 transition-colors"
                >
                  {filters.priceRange.min && `₱${filters.priceRange.min}`}
                  {filters.priceRange.min && filters.priceRange.max && ' - '}
                  {filters.priceRange.max && `₱${filters.priceRange.max}`}
                  <button 
                    onClick={() => handleResetSection('priceRange')}
                    className="ml-1 text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.genderRestriction && filters.genderRestriction !== '' && (
                <Badge 
                  variant="outline" 
                  className="bg-white hover:bg-neutral-50 transition-colors"
                >
                  {filters.genderRestriction === 'MEN_ONLY' ? 'Male Only' : 'Female Only'}
                  <button 
                    onClick={() => handleResetSection('genderRestriction')}
                    className="ml-1 text-neutral-400 hover:text-neutral-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Input with Button */}
      <div className="px-4 py-3 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search listings..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                search: e.target.value
              }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-9 bg-neutral-50 border-neutral-200 focus-visible:ring-indigo-600"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto pb-[76px]">
        <Accordion 
          type="multiple" 
          value={openAccordions}
          onValueChange={setOpenAccordions}
          className="px-4"
        >
          {/* Property Type Filter */}
          <AccordionItem value="category" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-800">
                  Property Type
                </span>
              </AccordionTrigger>
              {filters.category && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('category');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <div className="flex flex-col space-y-2">
                {categories.map((category) => {
                  const Icon: IconType = FaIcons[category.icon as keyof typeof FaIcons] || FaIcons.FaHome;
                  
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleFilterChange('category', '', category.title)}
                      className={`
                        flex items-center gap-3 p-2.5
                        rounded-md cursor-pointer transition-all
                        ${filters.category === category.title 
                          ? 'bg-indigo-50 text-indigo-900' 
                          : 'hover:bg-neutral-50 text-neutral-700'
                        }
                      `}
                    >
                      <Icon 
                        size={18} 
                        className={`
                          ${filters.category === category.title 
                            ? 'text-indigo-600' 
                            : 'text-neutral-500'
                          }
                        `}
                      />
                      <span className="text-sm font-medium">
                        {category.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-800">
                  Price Range
                </span>
              </AccordionTrigger>
              {(filters.priceRange.min || filters.priceRange.max) && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('priceRange');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-neutral-700 mb-1.5">Min Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      placeholder="₱"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 text-neutral-800"
                      onBlur={(e) => {
                        if (e.target.value === '') handlePriceChange('min', '0');
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-neutral-700 mb-1.5">Max Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      placeholder="₱"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 text-neutral-800"
                      onBlur={(e) => {
                        if (e.target.value === '') handlePriceChange('max', '0');
                      }}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Gender Restriction Filter */}
          <AccordionItem value="gender" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-8000">
                  Gender Restriction
                </span>
              </AccordionTrigger>
              {filters.genderRestriction && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('genderRestriction');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <div className="flex flex-col space-y-2">
                {genderOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleFilterChange('genderRestriction', '', option.value)}
                      className={`
                        flex items-center gap-3 p-2.5
                        rounded-md cursor-pointer transition-all
                        ${filters.genderRestriction === option.value 
                          ? 'bg-indigo-50 text-indigo-900' 
                          : 'hover:bg-neutral-50 text-neutral-700'
                        }
                      `}
                    >
                      <Icon 
                        size={18} 
                        className={`
                          ${filters.genderRestriction === option.value 
                            ? 'text-indigo-600' 
                            : 'text-neutral-500'
                          }
                        `}
                      />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* House Rules Filter */}
          <AccordionItem value="rules" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-800">
                  House Rules
                </span>
              </AccordionTrigger>
              {Object.values(filters.rules).some(Boolean) && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('rules');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <div className="space-y-3">
                {(Object.entries(houseRules) as [RuleKey, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={filters.rules[key]}
                      onCheckedChange={(checked) => 
                        handleFilterChange('rules', key, !!checked)
                      }
                      className="border-indigo-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label 
                      htmlFor={key}
                      className="text-[14px] text-neutral-700 hover:text-indigo-600 cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location Filter */}
          <AccordionItem value="location" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-800">
                  Location
                </span>
              </AccordionTrigger>
              {filters.location && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('location');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <LocationFilter 
                onLocationChange={handleLocationChange} 
                isReset={isLocationReset}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Amenities Filter */}
          <AccordionItem value="amenities" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium text-neutral-800">
                  Property Amenities
                </span>
              </AccordionTrigger>
              {filters.amenities.length > 0 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('amenities');
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-neutral-500 hover:text-indigo-600"
                >
                  <BiReset size={14} />
                </Button>
              )}
            </div>
            <AccordionContent>
              <div className="flex flex-col space-y-2">
                {propertyAmenities.map((amenity) => {
                  const Icon = FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaHome;
                  
                  return (
                    <div
                      key={amenity.id}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity.id)
                            ? prev.amenities.filter(id => id !== amenity.id)
                            : [...prev.amenities, amenity.id]
                        }));
                      }}
                      className={cn(
                        "flex items-center gap-3 p-2.5",
                        "rounded-md cursor-pointer transition-all",
                        filters.amenities.includes(amenity.id)
                          ? "bg-indigo-50 text-indigo-900"
                          : "hover:bg-neutral-50 text-neutral-700"
                      )}
                    >
                      <Icon 
                        size={18} 
                        className={cn(
                          filters.amenities.includes(amenity.id)
                            ? "text-indigo-600"
                            : "text-neutral-500"
                        )}
                      />
                      <span className="text-sm font-medium">
                        {amenity.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Fixed Filter Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <Button 
          onClick={() => {
            handleApplyFilters();
            if (isMobile && onClose) {
              onClose();
            }
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-11"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ListingsFilter; 