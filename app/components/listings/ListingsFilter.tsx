'use client';

import { useState, useCallback } from 'react';
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
  BsGenderFemale 
} from 'react-icons/bs';
import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';  // Import reset icon
import LocationFilter from './LocationFilter';

interface ListingsFilterProps {
  categories: any[];
  onClose?: () => void;
  isMobile?: boolean;
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
  category: string;
  priceRange: {
    min: string;
    max: string;
  };
  pricingType: string;
  genderRestriction: string;
  rules: HouseRules;
  requirements: {
    hasAgeRequirement: boolean;
    minimumAge: string;
    overnightGuestsAllowed: boolean;
  };
  location?: { lat: number; lng: number; radius: number; } | null;
}

// Define gender options type
type GenderOption = {
  value: string;
  label: string;
  icon: IconType;
};

const ListingsFilter: React.FC<ListingsFilterProps> = ({
  categories,
  onClose,
  isMobile
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isLocationReset, setIsLocationReset] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: params?.get('category') || '',
    priceRange: {
      min: params?.get('minPrice') || '',
      max: params?.get('maxPrice') || ''
    },
    pricingType: params?.get('pricingType') || '',
    genderRestriction: params?.get('genderRestriction') || 'BOTH',
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
    location: null
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
    const query = {
      ...(filters.category && { category: filters.category }),
      ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
      ...(filters.priceRange.max && { maxPrice: filters.priceRange.max }),
      ...(filters.pricingType && { pricingType: filters.pricingType }),
      ...(filters.genderRestriction && { genderRestriction: filters.genderRestriction }),
      ...Object.entries(filters.rules)
        .reduce((acc, [key, value]) => value ? { ...acc, [key]: value } : acc, {}),
      ...Object.entries(filters.requirements)
        .reduce((acc, [key, value]) => value ? { ...acc, [key]: value } : acc, {}),
      ...(filters.location && {
        lat: filters.location.lat,
        lng: filters.location.lng,
        radius: filters.location.radius
      })
    };

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
      value: 'MALE',
      label: 'Male Only',
      icon: BsGenderMale
    },
    {
      value: 'FEMALE',
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
      [section]: section === 'priceRange' 
        ? { min: '', max: '' }
        : section === 'rules'
        ? { petsAllowed: false, childrenAllowed: false, smokingAllowed: false }
        : section === 'requirements'
        ? { hasAgeRequirement: false, minimumAge: '', overnightGuestsAllowed: false }
        : section === 'location'
        ? null
        : ''
    }));
  }, []);

  const handleResetAllFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: '', max: '' },
      pricingType: '',
      genderRestriction: 'BOTH',
      rules: {
        petsAllowed: false,
        childrenAllowed: false,
        smokingAllowed: false
      },
      requirements: {
        hasAgeRequirement: false,
        minimumAge: '',
        overnightGuestsAllowed: false
      }
    });
  };

  const handleApplyFilters = () => {
    applyFilters();
    onClose?.();
  };

  return (
    <div className={`
      bg-white
      flex
      flex-col
      ${!isMobile ? 'h-[calc(100vh-120px)] rounded-lg border border-neutral-200' : 'h-full'}
    `}>
      {/* Header - Only show in desktop */}
      {!isMobile && (
        <div className="p-4 border-b border-neutral-200 bg-indigo-50/40 flex-shrink-0">
          <h3 className="text-[15px] font-semibold text-neutral-900">Filters</h3>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
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
                      placeholder="₱"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', 'min', e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 text-neutral-800"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-neutral-700 mb-1.5">Max Price</Label>
                    <Input
                      type="number"
                      placeholder="₱"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', 'max', e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 text-neutral-800"
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

          {/* Pricing Type Filter */}
          <AccordionItem value="pricingType" className="border-b border-neutral-100 py-1">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-[15px] font-medium  text-neutral-800">
                  Pricing Type
                </span>
              </AccordionTrigger>
              {filters.pricingType && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetSection('pricingType');
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
              <Select
                value={filters.pricingType}
                onValueChange={(value) => handleFilterChange('pricingType', '', value)}
              >
                <SelectTrigger className="border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">Any Type</SelectItem>
                  <SelectItem value="ROOM_BASED">Room Based</SelectItem>
                  <SelectItem value="LISTING_BASED">Listing Based</SelectItem>
                </SelectContent>
              </Select>
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
        </Accordion>
      </div>

      {/* Footer - Different styling for mobile */}
      <div className={`
        p-4 
        border-t 
        border-neutral-200 
        bg-white
        flex-shrink-0
        ${isMobile ? 'sticky bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]' : 'bg-indigo-50/40'}
      `}>
        <Button 
          onClick={handleApplyFilters}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-11"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ListingsFilter; 