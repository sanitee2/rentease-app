'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { StandaloneSearchBox, LoadScript, GoogleMap, Marker, Libraries, StreetViewPanorama, useLoadScript } from '@react-google-maps/api';
import { ListingCategory } from '@/app/types'; // Import the ListingCategory type

import Heading from '@/app/components/Heading';
import Select from 'react-select';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import Input from '@/app/components/inputs/Input';
import Counter from '@/app/components/inputs/Counter';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import useListingCategories from '@/app/hooks/useListingCategories';
import { getIconComponent } from '@/lib/utils';
import AddRoom from '../../AddRoom';
import { PiNavigationArrowBold } from 'react-icons/pi';
import Button from "@/app/components/Button";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";
import { IoBedOutline } from "react-icons/io5";
import { IoImagesOutline } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoPersonOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { HiUsers } from 'react-icons/hi';
import { FaFemale, FaMale } from 'react-icons/fa';
import { MdPets } from 'react-icons/md';
import { FaChild } from 'react-icons/fa';
import { FaSmoking } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import { IoCheckmarkCircle } from "react-icons/io5";
import LoadingState from './loading';

// Move the libraries array outside of the component to ensure it's reused
const libraries: Libraries = ['places', 'geometry'];

// Add this constant near the top of the file, after imports
const SURIGAO_BARANGAYS = [
  { value: 'Alegria', label: 'Alegria' },
  { value: 'Alipayo', label: 'Alipayo' },
  { value: 'Alliance', label: 'Alliance' },
  { value: 'Anomar', label: 'Anomar' },
  { value: 'Bagakay', label: 'Bagakay' },
  { value: 'Balibayon', label: 'Balibayon' },
  { value: 'Bilabid', label: 'Bilabid' },
  { value: 'Bitaugan', label: 'Bitaugan' },
  { value: 'Bonifacio', label: 'Bonifacio' },
  { value: 'Taft', label: 'Taft' },
  { value: 'Washington', label: 'Washington' },
  { value: 'Cabongbongan', label: 'Cabongbongan' },
  { value: 'Cagniog', label: 'Cagniog' },
  { value: 'Canlanipa', label: 'Canlanipa' },
  { value: 'Capalayan', label: 'Capalayan' },
  { value: 'Catadman', label: 'Catadman' },
  { value: 'Danao', label: 'Danao' },
  { value: 'Day-asan', label: 'Day-asan' },
  { value: 'Ipil', label: 'Ipil' },
  { value: 'Lipata', label: 'Lipata' },
  { value: 'Lisa', label: 'Lisa' },
  { value: 'Luna', label: 'Luna' },
  { value: 'Mabini', label: 'Mabini' },
  { value: 'Mabua', label: 'Mabua' },
  { value: 'Mapawa', label: 'Mapawa' },
  { value: 'Mat-i', label: 'Mat-i' },
  { value: 'Nabago', label: 'Nabago' },
  { value: 'Nonoc', label: 'Nonoc' },
  { value: 'Punta Bilar', label: 'Punta Bilar' },
  { value: 'Quezon', label: 'Quezon' },
  { value: 'Rizal', label: 'Rizal' },
  { value: 'Sabang', label: 'Sabang' },
  { value: 'San Juan', label: 'San Juan' },
  { value: 'Serna', label: 'Serna' },
  { value: 'Sidlakan', label: 'Sidlakan' },
  { value: 'Silop', label: 'Silop' },
  { value: 'Trinidad', label: 'Trinidad' },
  { value: 'Zaragoza', label: 'Zaragoza' },
];

// Add this helper function at the top of the file
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Add this helper function at the top of the file
const truncateHtml = (html: string, wordCount: number) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText;
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

// Add these interfaces at the top of your file
interface PropertyAmenity {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface AmenityValue {
  selected: boolean;
  note: string;
}

interface PropertyAmenities {
  [key: string]: AmenityValue;
}

// Add this helper function at the top of the file
const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};

// Add this CSS at the top of your file or in a separate CSS file
const googlePlacesStyles = `
  .pac-container {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    margin-top: 4px;
    font-family: inherit;
    padding: 8px 0;
  }

  .pac-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.5;
    border: none;
  }

  .pac-item:hover {
    background-color: #f3f4f6;
  }

  .pac-item-query {
    font-size: 14px;
    color: #111827;
  }

  .pac-matched {
    font-weight: 500;
  }

  .pac-icon {
    display: none;
  }
`;

const AddListing = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const { categories, loading, error, selectedCategory, selectCategory } = useListingCategories();
  const [rooms, setRooms] = useState<any[]>([]); // Manage rooms state
  const [selectState, setSelectState] = useState({ isFocused: false });
  const [propertyAmenities, setPropertyAmenities] = useState<any[]>([]);
  const [isAmenitiesLoading, setIsAmenitiesLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FieldValues>({
    defaultValues: {
      category: '',
      location: undefined,
      roomCount: 1,
      street: '',
      barangay: '',
      imageSrc: [],
      title: '',
      description: '',
      genderRestriction: 'BOTH',
      
      hasAgeRequirement: false,
      minimumAge: 0,
      
      overnightGuestsAllowed: false,
      maxGuests: 0,
      
      petsAllowed: false,
      childrenAllowed: false,
      smokingAllowed: false,
      additionalNotes: undefined,
      
      propertyAmenities: {} as PropertyAmenities,
      
      price: undefined,
      
      hasMaxTenantCount: false,
      maxTenantCount: 0,
    },
  });

  const category = watch('category');
  const roomCount = watch('roomCount');
  const street = watch('street');
  const barangay = watch('barangay');
  const title = watch('title');
  const description = watch('description');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    if (id === 'category') {
      selectCategory(value);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      
      const formData = {
        ...data,
        rooms: rooms.map(room => ({
          ...room,
          price: selectedCategory?.pricingType === 'ROOM_BASED' ? 
            parseInt(room.price) : 
            undefined,
          maxTenantCount: room.needsMaxTenant ? 
            parseInt(room.maxTenantCount) : 
            undefined
        })),
        imageSrc: { images },
        price: selectedCategory?.pricingType === 'LISTING_BASED' ? 
          parseInt(data.price) : 
          undefined,
        
        houseRules: {
          genderRestriction: data.genderRestriction,
          hasAgeRequirement: data.hasAgeRequirement,
          minimumAge: data.hasAgeRequirement ? 
            parseInt(data.minimumAge) : 
            undefined,
          overnightGuestsAllowed: data.overnightGuestsAllowed,
          maxGuests: data.overnightGuestsAllowed ? 
            parseInt(data.maxGuests) : 
            undefined,
          petsAllowed: data.petsAllowed,
          childrenAllowed: data.childrenAllowed,
          smokingAllowed: data.smokingAllowed,
          additionalNotes: data.additionalNotes?.trim() || undefined
        }
      };

      await axios.post('/api/listings', formData);
      toast.success('Listing created!');
      router.push('/landlord/listings');
      router.refresh();
      reset();
    } catch (error) {
      toast.error('Something went wrong.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (step === 1 && category) {
      setStep(2);
    } else if (step === 2 && street && barangay && location) {
      setStep(3);
    } else if (step === 3 && roomCount) {
      setStep(4);
    } else if (step === 4 && images.length > 0) {
      setStep(5);
    } else if (step === 5 && title && description) {
      setStep(6);
    } else if (step === 6) {
      // Only require gender restriction for house rules step
      const genderRestriction = watch('genderRestriction');
      if (genderRestriction) {
        setStep(7);
      }
    } else if (step === 7) {
      setStep(8);
    }
  };

  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Update searchOptions with more specific restrictions
  const searchOptions = {
    componentRestrictions: { 
      country: 'ph',
    },
    types: ['address'], // More specific than 'street_address'
    bounds: {
      north: 9.8527, // Surigao City bounds
      south: 9.7155,
      east: 125.5439,
      west: 125.4571
    },
    strictBounds: true,
    fields: ['address_components', 'geometry', 'formatted_address'],
  };

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry?.location;
      
      if (location) {
        const lat = location.lat();
        const lng = location.lng();


        // If coordinates are valid, proceed with setting the location
        const addressComponents = place.address_components || [];
        const streetNumber = addressComponents.find(component => 
          component.types.includes('street_number')
        )?.long_name || '';
        const streetName = addressComponents.find(component => 
          component.types.includes('route')
        )?.long_name || '';
        const fullStreetAddress = `${streetNumber} ${streetName}`.trim();

        setLocation({ lat, lng });
        setValue('street', fullStreetAddress);
        setValue('location', [lat, lng]);
      }
    }
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setLocation({ lat, lng });
      setCustomValue('location', [lat, lng]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setCustomValue('location', [latitude, longitude]);
        },
        (error) => {
          toast.error('Unable to retrieve your location. Please try again.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const stepTitles = [
    'Category',
    'Location',
    'Rooms',
    'Images',
    'Description',
    'Property Amenities',
    'House Rules',
    'Overview'
  ];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
    language: "en",
    region: "PH"
  });

  const isStepComplete = (currentStep: number) => {
    switch (currentStep) {
      case 1: return !!category;
      case 2: return !!street && !!barangay && !!location;
      case 3: return rooms.length > 0;
      case 4: return images.length > 0;
      case 5: 
        const titleValue = watch('title')?.trim();
        const descriptionValue = watch('description');
        const priceValue = watch('price');
        const strippedDescription = descriptionValue ? stripHtml(descriptionValue) : '';
        
        const isPriceValid = selectedCategory?.pricingType === 'LISTING_BASED' 
          ? (priceValue && parseInt(priceValue) > 0)
          : true;

        return !!titleValue && 
               titleValue.length > 0 && 
               !!descriptionValue &&
               !(strippedDescription === ' ' || strippedDescription.trim() === '') &&
               isPriceValid;
      case 6: return true;
      case 7: return !!watch('genderRestriction');
      case 8: return true;
      default: return false;
    }
  };

  const canNavigateToStep = (targetStep: number, currentStep: number): boolean => {
    // Can always go back to previous steps
    if (targetStep < currentStep) return true;
    
    // Can't skip ahead - must complete current step first
    if (targetStep > currentStep && !isStepComplete(currentStep)) return false;
    
    // Can only move one step at a time going forward
    return targetStep <= currentStep + 1;
  };

  useEffect(() => {
    const fetchAmenities = async () => {
      setIsAmenitiesLoading(true);
      try {
        const response = await axios.get('/api/amenities/property');
        setPropertyAmenities(response.data);
      } catch (error) {
        console.error('Error fetching property amenities:', error);
        toast.error('Failed to load property amenities');
      } finally {
        setIsAmenitiesLoading(false);
      }
    };

    if (step === 6) { // Only fetch when on the amenities step
      fetchAmenities();
    }
  }, [step]);

  // Add this useEffect to inject the styles
  useEffect(() => {
    // Add the styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = googlePlacesStyles;
    document.head.appendChild(styleElement);

    return () => {
      // Clean up the styles when component unmounts
      document.head.removeChild(styleElement);
    };
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className='text-3xl font-semibold mb-2'>Add Listing</div>
      <Breadcrumbs />
      {/* Progress Bar Container */}
      <div className="mb-16 mt-8 max-w-full px-5">
        <div className="relative">
          {/* Main Progress Bar - Centered with step indicators */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-in-out rounded-full"
              style={{ width: `${((step - 1) / (stepTitles.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="relative flex justify-between">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < step;
              const isActive = stepNumber === step;
              const canNavigate = canNavigateToStep(stepNumber, step);
              
              return (
                <div key={index} className="relative group">
                  <button
                    onClick={() => canNavigate && setStep(stepNumber)}
                    disabled={!canNavigate}
                    className={`
                      w-4 h-4 rounded-full
                      transition-all duration-200
                      ${isActive ? 'ring-4 ring-indigo-100' : ''}
                      ${isCompleted ? 'bg-indigo-600' : 
                        isActive ? 'bg-indigo-600' : 'bg-white border-2 border-gray-300'}
                      ${canNavigate ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'}
                      flex items-center justify-center
                      z-10
                    `}
                  >
                    {isCompleted && (
                      <svg 
                        className="w-2.5 h-2.5 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>

                  {/* Step Title */}
                  <div className={`
                    absolute -bottom-6
                    left-1/2 -translate-x-1/2
                    whitespace-nowrap
                    text-xs font-medium
                    transition-colors duration-200
                    ${isActive ? 'text-indigo-600 font-semibold' :
                      isCompleted ? 'text-indigo-600' :
                      'text-gray-400'}
                  `}>
                    {title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-row gap-6">
          <div className="flex-grow-[3]">
            {step === 1 && (
              // CATEGORY STEP
              <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-6">
                <Heading title="Which of these best describes your place?" subtitle="Pick a category" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
                {categories.map((item: ListingCategory) => (
                  <CategoryInput
                    key={item.id}
                    onClick={(category) => setCustomValue('category', category)}
                    selected={category === item.title}
                    label={item.title}
                    icon={getIconComponent(item.icon)} // Dynamically set the icon
                  />
                ))}
                </div>
              </div>
            )}

            {step === 2 && (
              // LOCATION STEP
              <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-6">
                <Heading title="Where is your place located?" subtitle="Help guests find you!" />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <StandaloneSearchBox
                    onLoad={(ref) => {
                      if (ref) {
                        searchBoxRef.current = ref;
                        const input = document.querySelector('input[type="text"]');
                        if (input) {
                          input.setAttribute('placeholder', '');
                        }
                      }
                    }}
                    onPlacesChanged={handlePlacesChanged}
                    options={searchOptions}
                  >
                    <Input
                      id='street'
                      register={register}
                      errors={errors}
                      type="text"
                      label="Street address"
                      required
                    />
                  </StandaloneSearchBox>
                  
                  <div className="w-full relative z-20">
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
                          ${watch('barangay') || selectState.isFocused ? 'scale-75 -translate-y-4' : 'scale-80 translate-y-0'}
                          text-zinc-400
                        `}
                      >
                        Barangay
                      </label>
                      <Select
                        placeholder=" "
                        options={SURIGAO_BARANGAYS}
                        value={SURIGAO_BARANGAYS.find(option => option.value === watch('barangay'))}
                        onChange={(option) => setCustomValue('barangay', option?.value)}
                        classNames={{
                          control: (state) => 
                            `px-2 pb-2 pt-4 border-2 ${state.isFocused ? 'border-black' : 'border-neutral-300'} rounded-md`,
                          input: () => 'text-lg pt-2',
                          option: () => 'text-lg',
                          menu: () => 'z-50'
                        }}
                        onFocus={() => setSelectState({ isFocused: true })}
                        onBlur={() => setSelectState({ isFocused: false })}
                        theme={(theme) => ({
                          ...theme,
                          borderRadius: 6,
                          colors: {
                            ...theme.colors,
                            primary: '#4F46E5',
                            primary25: '#EEF2FF'
                          }
                        })}
                      />
                    </div>
                    {errors['barangay'] && (
                      <span className="text-red-500 text-sm">
                        This field is required
                      </span>
                    )}
                  </div>
                </div>
                
                {location && (
                  <div>
                    <button
                      type="button"
                      className="bg-indigo-500 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded mb-4 transition duration-200 ease-in-out"
                      onClick={handleUseCurrentLocation}
                    >
                      Use Current Location
                    </button>
                  <div className="flex flex-row gap-4">
                    <GoogleMap
                      zoom={15}
                      center={location}
                      mapContainerStyle={{ width: '50%', height: '400px' }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      <Marker 
                        position={location}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                      />
                    </GoogleMap>
                    <GoogleMap
                      zoom={15}
                      center={location}
                      mapContainerStyle={{ width: '50%', height: '400px' }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      <StreetViewPanorama
                        options={{
                          position: location,
                          visible: true,
                          pov: { heading: 100, pitch: 0 },
                          zoom: 1,
                          disableDefaultUI: true,
                          disableDoubleClickZoom: true,
                          clickToGo: false,
                          showRoadLabels: false,
                          enableCloseButton: false,
                        }}
                      />
                    </GoogleMap>
                  </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <AddRoom 
                rooms={rooms} 
                setRooms={setRooms}
                listingCategory={selectedCategory}
              />
            )}  

            {step === 4 && (
              // IMAGES STEP
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <Heading title="Add a photo of your place" subtitle="Show people what your place looks like!" />
                <ImageUpload value={images} onChange={setImages} />
              </div>
            )}

            {step === 5 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-4">
                <Heading title="How would you describe your place?" subtitle="Short and sweet works best!" />
                <Input
                  id="title"
                  label="Title"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                />
                {selectedCategory?.pricingType === 'LISTING_BASED' && (
                  <>
                    <Input
                      id="price"
                      label="Price per month"
                      type="number"
                      formatPrice
                      disabled={isLoading}
                      register={register}
                      errors={errors}
                      required
                    />
                    
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <HiUsers className="text-2xl text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Maximum Tenant Count</h3>
                          <p className="text-gray-600">Set a limit on the number of tenants allowed</p>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Tenant Limit</h4>
                            <p className="text-gray-600 text-sm mt-1">Set maximum number of tenants allowed</p>
                          </div>
                          <div className="relative inline-block">
                            <input
                              type="checkbox"
                              id="hasMaxTenantCount"
                              checked={watch('hasMaxTenantCount')}
                              onChange={(e) => {
                                setValue('hasMaxTenantCount', e.target.checked);
                                if (!e.target.checked) setValue('maxTenantCount', 1);
                              }}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        {watch('hasMaxTenantCount') && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Counter
                              title="Maximum Tenants"
                              subtitle="Set the maximum number of tenants for the entire property"
                              value={watch('maxTenantCount') || 1}
                              onChange={(value) => setValue('maxTenantCount', value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                <hr />
                <Input
                  id="description"
                  label="Description"
                  textArea
                  register={register}
                  errors={errors}
                  value={watch('description')}
                  setValue={setValue}
                />
              </div>
            )}

            {step === 6 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <Heading 
                  title="Property Amenities" 
                  subtitle="Select the amenities that are available in your property" 
                />
                
                {isAmenitiesLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 mt-6">
                    {propertyAmenities.map((amenity: PropertyAmenity) => (
                      <div 
                        key={amenity.id}
                        className={`
                          p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${watch(`propertyAmenities.${amenity.id}`)?.selected 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-200'
                          }
                        `}
                        onClick={() => {
                          const currentValue = watch(`propertyAmenities.${amenity.id}`);
                          setValue(`propertyAmenities.${amenity.id}`, {
                            selected: !currentValue?.selected,
                            note: currentValue?.note || ''
                          }, { 
                            shouldValidate: true,
                            shouldDirty: true 
                          });
                        }}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {React.createElement(
                                FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion,
                                {
                                  className: `text-xl ${
                                    watch(`propertyAmenities.${amenity.id}`)?.selected 
                                      ? 'text-indigo-600' 
                                      : 'text-gray-600'
                                  }`
                                }
                              )}
                              <div>
                                <span className="text-sm font-medium">{amenity.title}</span>
                                <p className="text-xs text-gray-500">{amenity.desc}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={watch(`propertyAmenities.${amenity.id}`)?.selected || false}
                              onChange={() => {}}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                          </div>
                          {watch(`propertyAmenities.${amenity.id}`)?.selected && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                placeholder="Add note (optional)"
                                className="mt-1 w-full p-2 text-sm border rounded-md"
                                value={watch(`propertyAmenities.${amenity.id}`)?.note || ''}
                                onChange={(e) => {
                                  setValue(`propertyAmenities.${amenity.id}`, {
                                    selected: true,
                                    note: e.target.value
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 7 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-4">
                <Heading 
                  title="House rules" 
                  subtitle="Set some ground rules for staying at your property. Guests will be required to review and agree to these before they book." 
                />
                
                <div className="space-y-8">
                  {/* Guest Limits Section */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <IoPersonOutline className="text-2xl text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Guest Limits</h3>
                        <p className="text-gray-600">Set restrictions for overnight stays and age requirements</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 auto-rows-auto">
                      {/* Overnight Guests Toggle and Counter */}
                      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all h-fit">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Overnight Guests</h4>
                            <p className="text-gray-600 text-sm mt-1">Allow tenants to have overnight guests</p>
                          </div>
                          <div className="relative inline-block">
                            <input
                              type="checkbox"
                              id="overnightGuestsAllowed"
                              checked={watch('overnightGuestsAllowed')}
                              onChange={(e) => {
                                setValue('overnightGuestsAllowed', e.target.checked);
                                if (!e.target.checked) setValue('maxGuests', 0);
                              }}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        {watch('overnightGuestsAllowed') && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Counter
                              title="Maximum overnight guests"
                              subtitle="Total number of guests allowed to sleep"
                              value={watch('maxGuests')}
                              onChange={(value) => setValue('maxGuests', value)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Age Requirement Toggle and Counter */}
                      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all h-fit">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Age Requirement</h4>
                            <p className="text-gray-600 text-sm mt-1">Set minimum age requirement</p>
                          </div>
                          <input
                            type="checkbox"
                            id="hasAgeRequirement"
                            checked={watch('hasAgeRequirement')}
                            onChange={(e) => {
                              setValue('hasAgeRequirement', e.target.checked);
                              if (!e.target.checked) setValue('minimumAge', 0);
                            }}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </div>
                        {watch('hasAgeRequirement') && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Counter
                              title="Minimum age requirement"
                              subtitle="Age required for the primary renter"
                              value={watch('minimumAge')}
                              onChange={(value) => setValue('minimumAge', value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property Rules Section */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <IoShieldCheckmarkOutline className="text-2xl text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Property Rules</h3>
                        <p className="text-gray-600">Set house rules and restrictions for your property</p>
                      </div>
                    </div>

                    {/* Gender Restriction */}
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-4">Gender Restriction</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'BOTH', label: 'No Restriction', icon: HiUsers },
                          { value: 'LADIES_ONLY', label: 'Ladies Only', icon: FaFemale },
                          { value: 'MEN_ONLY', label: 'Men Only', icon: FaMale },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                              watch('genderRestriction') === option.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-200'
                            }`}
                            onClick={() => setValue('genderRestriction', option.value)}
                          >
                            <div className="flex flex-col items-center gap-3">
                              {React.createElement(option.icon, { 
                                className: `text-2xl ${watch('genderRestriction') === option.value ? 'text-indigo-600' : 'text-gray-600'}`
                              })}
                              <p className="text-gray-700 font-medium text-center">
                                {option.label}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* House Rules */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { id: 'petsAllowed', label: 'Pets Allowed', icon: MdPets },
                        { id: 'childrenAllowed', label: 'Children Allowed', icon: FaChild },
                        { id: 'smokingAllowed', label: 'Smoking Allowed', icon: FaSmoking },
                      ].map((rule) => (
                        <div 
                          key={rule.id}
                          className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                            watch(rule.id) 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-indigo-200'
                          }`}
                          onClick={() => setValue(rule.id, !watch(rule.id))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {React.createElement(rule.icon, { 
                                className: `text-2xl ${watch(rule.id) ? 'text-indigo-600' : 'text-gray-600'}`
                              })}
                              <label htmlFor={rule.id} className="text-gray-900 font-medium">
                                {rule.label}
                              </label>
                            </div>
                            <input
                              type="checkbox"
                              id={rule.id}
                              {...register(rule.id)}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes Section */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <IoInformationCircleOutline className="text-2xl text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
                        <p className="text-gray-600">Add any extra details about your property</p>
                      </div>
                    </div>
                    <Input
                      id="additionalNotes"
                      disabled={isLoading}
                      register={register}
                      errors={errors}
                      textArea
                      value={watch('additionalNotes')}
                      setValue={(id, value) => {
                        setValue(id, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 8 && (
              // OVERVIEW STEP
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <Heading title="Overview" subtitle="Review all the information before submitting." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Category Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <BiCategory className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Category</h3>
                          <p className="text-gray-600 mt-1">{category}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(1)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoLocationSharp className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Location</h3>
                          <p className="text-gray-600 mt-1">{street}, {barangay}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(2)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Rooms Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoBedOutline className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Rooms</h3>
                          <p className="text-gray-600 mt-1">{rooms.length} room(s) added</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(3)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Images Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoImagesOutline className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Images</h3>
                          <p className="text-gray-600 mt-1">{images.length} image(s) uploaded</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(4)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Title Card - Updated with truncation */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoInformationCircleOutline className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Title</h3>
                          <p className="text-gray-600 mt-1">
                            {truncateText(title, 20)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(5)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Description Card - Updated to use truncateHtml */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoDocumentTextOutline className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Description</h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {truncateHtml(description, 5)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(5)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* New Property Amenities Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoCheckmarkCircle className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">Property Amenities</h3>
                          <p className="text-gray-600 mt-1">
                            {Object.entries(watch('propertyAmenities') as PropertyAmenities || {})
                              .filter(([_, value]: [string, AmenityValue]) => value.selected)
                              .map(([key]) => {
                                const amenity = propertyAmenities.find((a: PropertyAmenity) => a.id === key);
                                return amenity?.title;
                              })
                              .filter(Boolean)
                              .join(', ') || 'No amenities selected'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(6)} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* House Rules Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <IoShieldCheckmarkOutline className="text-2xl text-indigo-600" />
                        <div>
                          <h3 className="font-semibold text-gray-700">House Rules</h3>
                          <div className="text-gray-600 mt-1 space-y-2">
                            <p>Gender: {watch('genderRestriction').replace('_', ' ').toLowerCase()}</p>
                            {watch('hasAgeRequirement') && watch('minimumAge') && (
                              <p>Minimum age: {watch('minimumAge')} years</p>
                            )}
                            {watch('overnightGuestsAllowed') && watch('maxGuests') && (
                              <p>Max overnight guests: {watch('maxGuests')}</p>
                            )}
                            <div className="flex gap-2">
                              {watch('petsAllowed') && (
                                <div className="flex items-center gap-1">
                                  <MdPets className="text-indigo-600" />
                                  <span className="text-sm">Pets allowed</span>
                                </div>
                              )}
                              {watch('childrenAllowed') && (
                                <div className="flex items-center gap-1">
                                  <FaChild className="text-indigo-600" />
                                  <span className="text-sm">Children allowed</span>
                                </div>
                              )}
                              {watch('smokingAllowed') && (
                                <div className="flex items-center gap-1">
                                  <FaSmoking className="text-indigo-600" />
                                  <span className="text-sm">Smoking allowed</span>
                                </div>
                              )}
                            </div>
                            {watch('additionalNotes')?.trim() && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Additional Notes:</p>
                                <p className="text-sm italic text-gray-600 mt-1">
                                  "{watch('additionalNotes')}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStep(7)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Navigation Buttons */}
        <div className="flex flex-row items-center gap-4 w-full">
          {step > 1 && (
            <Button
              outline
              label="Back"
              onClick={(e) => handlePreviousStep(e)}
              disabled={isLoading}
              icon={IoArrowBack}
            />
          )}
          {step < 8 && (
            <Button
              label="Next"
              onClick={(e) => handleNextStep(e)}
              disabled={isLoading || !isStepComplete(step)}
              rightIcon={IoArrowForward}  // Changed from icon to rightIcon
            />
          )}
          {step === 8 && (
            <Button
              label="Create Listing"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
            />
          )}
        </div>
      </form>
    </div>
  );
};

// Wrap your AddListing component with Suspense
const AddListingPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <AddListing />
    </Suspense>
  );
};

export default AddListingPage;
