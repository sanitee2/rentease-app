'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, FieldValues, UseFormRegister } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Select, { SingleValue } from 'react-select';
import { SafeListing, TenantData } from "@/app/types";
import { MinimalUser } from "@/app/types";
import { useAvailableUsers } from '@/app/hooks/useAvailableUsers';
import { useUserListings } from '@/app/hooks/useUserListings';
import Input from '@/app/components/inputs/Input';
import debounce from 'lodash/debounce';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTenant: TenantData) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface UserOption extends SelectOption {
  label: string;
}

interface ListingOption extends SelectOption {
  listing: SafeListing;
  isDisabled: boolean;
}

interface RoomOption extends SelectOption {
  price: number;
  isDisabled: boolean;
}

type FormKeys = keyof FormData;

interface FormData extends FieldValues {
  userId: string;
  listingId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyDueDate: number;
  rentAmount: number;
  leaseTerms: string;
}

const getOccupancyLabel = (currentCount: number, maxCount: number | null) => {
  if (!maxCount) return '';
  return ` (${currentCount}/${maxCount} tenants)`;
};

const isAtCapacity = (currentCount: number, maxCount: number | null) => {
  if (!maxCount) return false;
  return currentCount >= maxCount;
};

const DurationButton = ({ 
  months, 
  startDate, 
  onClick, 
  isSelected 
}: { 
  months: number, 
  startDate: Date | undefined, 
  onClick: (endDate: Date) => void,
  isSelected: boolean
}) => {
  const handleClick = () => {
    if (!startDate) return;
    const end = new Date(startDate);
    end.setMonth(startDate.getMonth() + months);
    onClick(end);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "w-full sm:w-auto",
        isSelected ? "bg-indigo-600 text-white hover:bg-indigo-700" : "hover:bg-indigo-100 text-gray-800"
      )}
    >
      {months} {months === 1 ? 'Month' : 'Months'}
    </Button>
  );
};

const AddTenantModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddTenantModalProps) => {
  const { users: availableUsers, isLoading: isLoadingUsers, error: usersError, searchUsers } = useAvailableUsers();
  const { listings, isLoading: isLoadingListings, error: listingsError } = useUserListings();

  const isLoadingInitialData = isLoadingListings;
  const error = usersError || listingsError;

  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SafeListing | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [selectedListingOption, setSelectedListingOption] = useState<ListingOption | null>(null);
  const [selectedRoomOption, setSelectedRoomOption] = useState<RoomOption | null>(null);
  const [selectState, setSelectState] = useState({ 
    userFocused: false,
    listingFocused: false,
    roomFocused: false 
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
    trigger
  } = useForm<FormData>({
    defaultValues: {
      userId: '',
      listingId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      monthlyDueDate: 1,
      rentAmount: 0,
      leaseTerms: ''
    }
  });

  const registerInput = register as unknown as UseFormRegister<FieldValues>;

  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();

  useEffect(() => {
    if (startDate) {
      setValue('startDate', format(startDate, 'yyyy-MM-dd'));
    }
  }, [startDate, setValue]);

  const dateSelectionContent = (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Start Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium leading-none">
          Monthly Due Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "d") : <span>Pick a due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                if (date) {
                  setValue('monthlyDueDate', date.getDate());
                }
              }}
              initialFocus
              fromDate={new Date(2024, 0, 1)}
              toDate={new Date(2024, 0, 31)}
            />
          </PopoverContent>
        </Popover>
        {errors.monthlyDueDate && (
          <span className="text-red-500 text-sm">
            {errors.monthlyDueDate.message}
          </span>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    if (selectedListingOption?.listing) {
      const listing = selectedListingOption.listing;
      setValue('listingId', listing.id);
      
      setValue('roomId', '');
      setValue('rentAmount', 0);
      setSelectedRoomOption(null);
      
      if (listing.pricingType === 'LISTING_BASED') {
        setValue('rentAmount', listing.price || 0);
        setAvailableRooms([]);
      } else if (listing.pricingType === 'ROOM_BASED') {
        const fetchRooms = async () => {
          try {
            const response = await axios.get(`/api/listings/${listing.id}/rooms`);
            const rooms = response.data.map((room: any) => {
              const currentTenantCount = room.tenants?.length || 0;
              const maxTenants = room.maxTenantCount;
              const occupancyLabel = ` (${currentTenantCount}/${maxTenants} tenants)`;
              const isDisabled = maxTenants ? currentTenantCount >= maxTenants : false;

              return {
                value: room.id,
                label: `${room.title || `Room ${room.roomNumber}`}${occupancyLabel} - ₱${room.price?.toLocaleString()}/month`,
                price: room.price,
                isDisabled: isDisabled
              } satisfies RoomOption;
            });
            setAvailableRooms(rooms);
          } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to fetch rooms');
            setAvailableRooms([]);
          }
        };
        
        fetchRooms();
      }
    }
  }, [selectedListingOption, setValue]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      if (value?.length >= 3) {
        searchUsers(value);
      }
    }, 300),
    [searchUsers]
  );

  const handleUserSearch = useCallback((inputValue: string) => {
    debouncedSearch(inputValue);
  }, [debouncedSearch]);

  const userOptions = useMemo(() => 
    availableUsers?.map(user => {
      const phoneNumber = user.phoneNumber || '';
      const maskedPhone = phoneNumber.length >= 11 
        ? phoneNumber.replace(/(\d{4})(\d{3})(\d{1})(\d{3})/, '**** *** *$4')
        : 'No phone';
      return {
        value: user.id,
        label: `${user.firstName} ${user.lastName} (${maskedPhone})`,
      };
    }) ?? [], 
  [availableUsers]);

  const listingOptions: ListingOption[] = listings
    ?.filter(listing => listing.status === 'ACTIVE')
    ?.map(listing => {
      const currentTenantCount = listing.tenants?.length || 0;
      const maxTenants = listing.hasMaxTenantCount ? listing.maxTenantCount : null;
      const occupancyLabel = getOccupancyLabel(currentTenantCount, maxTenants);
      const isDisabled = isAtCapacity(currentTenantCount, maxTenants);

      return {
        value: listing.id,
        label: `${listing.title}${occupancyLabel} - ${
          listing.pricingType === 'LISTING_BASED' 
            ? `₱${listing.price?.toLocaleString() || 0}/month` 
            : 'Room based'
        }`,
        listing,
        isDisabled
      };
    }) ?? [];

  const validateDates = () => {
    if (!startDate) {
      return "Start date is required";
    }
    
    return true;
  };

  const validateRichTextContent = (content: string): true | string => {
    if (!content) return "Lease terms are required";
    
    const div = document.createElement('div');
    div.innerHTML = content;
    const textContent = div.textContent || div.innerText || '';
    const cleanText = textContent.trim();
    
    if (!cleanText) {
      return "Lease terms are required";
    }
    if (cleanText.length < 10) {
      return "Terms must be at least 10 characters";
    }
    
    return true;
  };

  const onSubmit = async (data: FormData) => {
    const dateValidation = validateDates();
    if (dateValidation !== true) {
      toast.error(dateValidation);
      return;
    }

    try {
      setIsLoading(true);
      
      const roomData = data.roomId ? { roomId: data.roomId } : {};
      
      const termsValidation = validateRichTextContent(data.leaseTerms);
      if (termsValidation !== true) {
        toast.error(termsValidation);
        return;
      }

      let tenantProfileId;
      try {
        const existingProfileResponse = await axios.get(`/api/users/${data.userId}/tenant-profile`);
        tenantProfileId = existingProfileResponse.data.id;
      } catch (error: any) {
        if (error.response?.status === 404) {
          try {
            const createProfileResponse = await axios.post(`/api/users/${data.userId}/tenant-profile`);
            tenantProfileId = createProfileResponse.data.id;
          } catch (createError: any) {
            console.error('Error creating tenant profile:', createError);
            toast.error('Failed to create tenant profile');
            return;
          }
        } else {
          console.error('Error getting tenant profile:', error);
          toast.error('Failed to get tenant profile');
          return;
        }
      }

      if (!tenantProfileId) {
        toast.error('Failed to get or create tenant profile');
        return;
      }

      const response = await axios.post('/api/tenants', {
        userId: data.userId,
        listingId: data.listingId,
        tenantProfileId,
        ...roomData,
        leaseContract: {
          startDate: data.startDate,
          endDate: data.endDate,
          monthlyDueDate: Number(data.monthlyDueDate),
          rentAmount: Number(data.rentAmount),
          outstandingBalance: Number(data.rentAmount),
          leaseTerms: data.leaseTerms,
          status: 'PENDING'
        }
      });

      onSuccess(response.data);
      reset();
      onClose();
    } catch (error: any) {
      console.error('Error in onSubmit:', error);
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelection = (option: SingleValue<RoomOption>) => {
    if (option) {
      setValue('roomId', option.value);
      setValue('rentAmount', option.price);
      setSelectedRoomOption(option);
    } else {
      setValue('roomId', '');
      setValue('rentAmount', 0);
      setSelectedRoomOption(null);
    }
  };

  if (isLoadingInitialData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add New Tenant"
        actionLabel="Loading..."
        body={<div className="text-center">Loading properties...</div>}
        disabled={true}
        size='sm'
      />
    );
  }

  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add New Tenant"
        actionLabel="Close"
        body={<div className="text-red-500">{error}</div>}
        disabled={false}
        size='sm'
      />
    );
  }

  const selectStyles = {
    menuPortal: (base: any) => ({ 
      ...base, 
      zIndex: 9999 
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'white',
      zIndex: 9999
    }),
    option: (base: any, state: { isFocused: boolean; isSelected: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#EEF2FF' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      ':active': {
        backgroundColor: state.isSelected ? '#4F46E5' : '#EEF2FF'
      }
    })
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <Controller<FormData>
          name="userId"
          control={control}
          rules={{ required: "Please select a user" }}
          render={({ field: { onChange, value, ...field } }) => (
            <div className="relative">
              <label className={`
                absolute text-md duration-150 transform -translate-y-3 
                top-5 z-10 origin-[0] left-4 
                ${value || selectState.userFocused ? 'scale-75 -translate-y-4' : 'scale-80 translate-y-0'}
                text-zinc-400
              `}>
                Search User
              </label>
              <Select<UserOption>
                {...field}
                value={userOptions.find((option) => option.value === value)}
                onChange={(option: SingleValue<UserOption>) => {
                  onChange(option?.value);
                }}
                options={userOptions}
                onInputChange={(newValue) => {
                  if (!newValue) {
                    searchUsers('');
                  } else {
                    handleUserSearch(newValue);
                  }
                }}
                isLoading={isLoadingUsers}
                loadingMessage={() => "Searching users..."}
                noOptionsMessage={({ inputValue }) => {
                  if (!inputValue) return "Start typing to search...";
                  if (inputValue.length < 3) return "Type at least 3 characters...";
                  if (isLoadingUsers) return "Searching...";
                  return "No users found";
                }}
                placeholder=" "
                styles={selectStyles}
                menuPortalTarget={document.body}
                classNames={{
                  control: (state) => 
                    `px-2 pb-2 pt-4 border-2 ${state.isFocused ? 'border-black' : 'border-neutral-300'} rounded-md bg-white`,
                  input: () => 'text-lg pt-2',
                  option: () => 'text-lg',
                  menu: () => 'bg-white'
                }}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    primary: '#4F46E5',
                    primary25: '#EEF2FF'
                  }
                })}
                onFocus={() => setSelectState(prev => ({ ...prev, userFocused: true }))}
                onBlur={() => setSelectState(prev => ({ ...prev, userFocused: false }))}
                isDisabled={isLoading}
              />
            </div>
          )}
        />
        {errors.userId && (
          <span className="text-red-500 text-sm mt-1">
            {errors.userId.message}
          </span>
        )}
      </div>

      <Controller<FormData>
        name="listingId"
        control={control}
        rules={{ required: "Please select a property" }}
        render={({ field: { onChange, value, ...field } }) => (
          <div className="w-full">
            <div className="relative">
              <label className={`absolute text-md duration-150 transform -translate-y-3 
                top-5 z-10 origin-[0] left-4 
                ${value || selectState.listingFocused ? 'scale-75 -translate-y-4' : 'scale-80 translate-y-0'}
                text-zinc-400`}
              >
                Select Property
              </label>
              <Select<ListingOption>
                {...field}
                value={listingOptions.find((option) => option.value === value)}
                onChange={(option: SingleValue<ListingOption>) => {
                  onChange(option?.value);
                  setSelectedListingOption(option || null);
                  setSelectedListing(option?.listing || null);
                  setValue('roomId', '');
                  setValue('rentAmount', option?.listing.price || 0);
                }}
                options={listingOptions}
                placeholder=" "
                styles={selectStyles}
                menuPortalTarget={document.body}
                classNames={{
                  control: (state) => 
                    `px-2 pb-2 pt-4 border-2 ${state.isFocused ? 'border-black' : 'border-neutral-300'} rounded-md bg-white`,
                  input: () => 'text-lg pt-2',
                  option: () => 'text-lg',
                  menu: () => 'bg-white'
                }}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    primary: '#4F46E5',
                    primary25: '#EEF2FF'
                  }
                })}
                onFocus={() => setSelectState(prev => ({ ...prev, listingFocused: true }))}
                onBlur={() => setSelectState(prev => ({ ...prev, listingFocused: false }))}
                isDisabled={isLoading}
                isOptionDisabled={(option) => option.isDisabled}
                noOptionsMessage={({ inputValue }) => {
                  if (listingOptions.every(opt => opt.isDisabled)) {
                    return "All properties are at maximum capacity";
                  }
                  return "No properties found";
                }}
              />
            </div>
            {errors.listingId && (
              <span className="text-red-500 text-sm mt-1">
                {errors.listingId.message}
              </span>
            )}
          </div>
        )}
      />

      {selectedListing?.pricingType === 'ROOM_BASED' && (
        <div className="w-full relative z-10">
          <Controller<FormData>
            name="roomId"
            control={control}
            rules={{ 
              required: selectedListing?.pricingType === 'ROOM_BASED' 
                ? "Please select a room" 
                : false 
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="relative">
                <label
                  className={`
                    absolute
                    text-md
                    duration-150
                    transform
                    -translate-y-3
                    top-5
                    z-10
                    origin-[0]
                    left-4
                    ${value || selectState.roomFocused ? 'scale-75 -translate-y-4' : 'scale-80 translate-y-0'}
                    text-zinc-400
                  `}
                >
                  Select Room
                </label>
                <Select<RoomOption>
                  {...field}
                  value={selectedRoomOption}
                  onChange={(option) => {
                    handleRoomSelection(option);
                    onChange(option?.value);
                  }}
                  options={availableRooms}
                  placeholder=" "
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  classNames={{
                    control: (state) => 
                      `px-2 pb-2 pt-4 border-2 ${state.isFocused ? 'border-black' : 'border-neutral-300'} rounded-md bg-white`,
                    input: () => 'text-lg pt-2',
                    option: () => 'text-lg',
                    menu: () => 'bg-white'
                  }}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 6,
                    colors: {
                      ...theme.colors,
                      primary: '#4F46E5',
                      primary25: '#EEF2FF'
                    }
                  })}
                  onFocus={() => setSelectState(prev => ({ ...prev, roomFocused: true }))}
                  onBlur={() => setSelectState(prev => ({ ...prev, roomFocused: false }))}
                  isDisabled={isLoading}
                  isLoading={isLoadingListings}
                  isOptionDisabled={(option) => option.isDisabled}
                  noOptionsMessage={({ inputValue }) => {
                    if (availableRooms.every(opt => opt.isDisabled)) {
                      return "All rooms are at maximum capacity";
                    }
                    return "No rooms available";
                  }}
                />
              </div>
            )}
          />
          {errors.roomId && (
            <span className="text-red-500 text-sm">
              {errors.roomId.message as string}
            </span>
          )}
        </div>
      )}

      {dateSelectionContent}

      <Input
        id="rentAmount"
        label="Rent amount per month"
        type="number"
        disabled={isLoading}
        register={registerInput}
        errors={errors}
        required
        formatPrice
        validation={{
          required: "Rent amount is required",
          min: {
            value: 0,
            message: "Rent amount must be greater than 0"
          }
        }}
      />

      <div className="w-full relative">
        <Input
          id="leaseTerms"
          label="Lease Terms"
          disabled={isLoading}
          register={registerInput}
          errors={errors}
          textArea
          value={watch('leaseTerms')}
          setValue={(id, value) => {
            if (id === 'leaseTerms') {
              setValue(id, value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
              trigger('leaseTerms');
            }
          }}
          validation={{
            required: "Lease terms are required",
            validate: (value: string) => {
              if (!value) return "Lease terms are required";
              
              const div = document.createElement('div');
              div.innerHTML = value;
              const textContent = div.textContent || div.innerText || '';
              const cleanText = textContent.trim();
              
              if (!cleanText) {
                return "Lease terms are required";
              }
              if (cleanText.length < 10) {
                return "Terms must be at least 10 characters";
              }
              return true;
            }
          }}
        />
        {errors.leaseTerms && (
          <span className="text-rose-500 text-sm mt-1">
            {errors.leaseTerms.message as string}
          </span>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-2">Please correct the following errors:</p>
          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>
                {error?.message as string}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Tenant"
      actionLabel={isLoading ? "Adding..." : "Add Tenant"}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      disabled={isLoading || !!error}
      size='sm'
    />
  );
};

export default AddTenantModal;