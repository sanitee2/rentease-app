import React, { useEffect, useState, useCallback } from 'react';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import Input from '@/app/components/inputs/Input';
import { FieldValues, useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import axios from 'axios';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import { getIconComponent } from '@/lib/utils';
import * as FaIcons from 'react-icons/fa';
import Counter from '@/app/components/inputs/Counter';

interface Room {
  title: string;
  description: string;
  roomCategory: string;
  price: number | null;
  images: string[];
  amenities: {
    [key: string]: {
      selected: boolean;
      note: string;
    };
  };
  maxTenantCount: number;
}

interface RoomDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSave: (room: Room) => void;
  onChange: (edited: boolean) => void;
  listingCategory: {
    pricingType: 'ROOM_BASED' | 'LISTING_BASED';
  } | null;
  onActualClose: () => void;
}

const EMPTY_ROOM = {
  title: '',
  description: '',
  roomCategory: '',
  price: null,
  images: [],
  amenities: {},
  maxTenantCount: 1
};

interface RoomCategory {
  id: string;
  title: string;
  icon: string;
  desc: string;
  needsMaxTenant: boolean;
}

const RoomDetailsDrawer: React.FC<RoomDetailsDrawerProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
  onChange,
  listingCategory,
  onActualClose,
}) => {
  const { 
    setValue, 
    watch, 
    reset, 
    register, 
    formState: { 
      errors,
      isDirty 
    } 
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      roomCategory: '',
      price: '',
      images: [],
      amenities: {},
      maxTenantCount: 1
    }
  });

  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryPricingType, setCategoryPricingType] = useState<'ROOM_BASED' | 'LISTING_BASED' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, amenitiesRes] = await Promise.all([
          axios.get('/api/roomCategories'),
          axios.get('/api/amenities/room')
        ]);

        setCategories(categoriesRes.data);
        setAmenities(amenitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (room) {
      Object.keys(room).forEach((key) => {
        setValue(key, room[key as keyof Room], {
          shouldValidate: true,
          shouldDirty: false
        });
      });
    } else {
      reset({
        ...EMPTY_ROOM,
        price: listingCategory?.pricingType === 'ROOM_BASED' ? 0 : null,
      });
    }
  }, [room, setValue, reset, listingCategory]);

  const handleImageChange = React.useCallback((images: string[]) => {
    setValue('images', images, { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [setValue]);

  // Add this to track form values changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'description') {
        console.log('Description changed:', value.description);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Track form changes
  useEffect(() => {
    if (isDirty) {
      onChange(true);
    }
  }, [isDirty, onChange]);

  // Validation function
  const validateForm = () => {
    const formValues = watch();
    const errors: { [key: string]: string } = {};

    if (!formValues.title || formValues.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formValues.description || formValues.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formValues.roomCategory) {
      errors.roomCategory = 'Please select a room category';
    }

    if (categoryPricingType === 'ROOM_BASED') {
      if (!formValues.price || parseFloat(formValues.price) <= 0) {
        errors.price = 'Please enter a valid price';
      }
    }

    if (!formValues.images || formValues.images.length === 0) {
      errors.images = 'Please add at least one room image';
    }

    const selectedCategory = categories.find(c => c.title === formValues.roomCategory);
    if (selectedCategory?.needsMaxTenant && (!formValues.maxTenantCount || formValues.maxTenantCount < 1)) {
      errors.maxTenantCount = 'Please specify maximum number of tenants';
    }

    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    const title = watch('title');
    const description = watch('description');
    const roomCategory = watch('roomCategory');
    const images = watch('images');
    const price = watch('price');

    const isPriceValid = listingCategory?.pricingType === 'ROOM_BASED' 
      ? (price !== null && !isNaN(price) && parseInt(price) > 0)
      : true;

    return title?.trim() !== '' && 
           description?.trim() !== '' && 
           roomCategory !== '' && 
           images?.length > 0 &&
           isPriceValid;
  };

  const handleSave = () => {
    if (!isFormValid()) return;

    const formData: Room = {
      title: watch('title'),
      description: watch('description'),
      roomCategory: watch('roomCategory'),
      images: watch('images'),
      amenities: watch('amenities'),
      price: listingCategory?.pricingType === 'ROOM_BASED' 
        ? parseFloat(watch('price')) 
        : null,
      maxTenantCount: parseInt(watch('maxTenantCount')?.toString() || '1')
    };

    
    console.log(formData)

    onChange(false);
    onSave(formData);
    handleActualClose();
  };

  const handleClose = () => {
    if (isDirty) {
      onChange(true);
      onClose();
    } else {
      onChange(false);
      onClose();
    }
  };

  const handleActualClose = () => {
    reset(EMPTY_ROOM);
    onChange(false);
    onActualClose();
  };


  return (
    <>
      {/* Overlay with fade transition */}
      <div
        className={`
          fixed inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}
          z-40
        `}
        onClick={handleClose}
      />

      {/* Drawer with slide transition */}
      <div 
        className={`
          fixed 
          inset-y-0 
          right-0 
          w-full 
          max-w-md 
          bg-white 
          shadow-lg 
          z-50
          flex 
          flex-col
          transform
          transition-transform
          duration-300
          ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header - Fixed */}
        <div className="
          p-6 
          border-b 
          bg-white
        ">
          <h2 className="text-xl font-semibold">
            {room ? 'Edit Room' : 'Add Room'}
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="
          flex-1 
          overflow-y-auto 
          p-6
        ">
          <div className="flex flex-col gap-4">
            <Input
              id="title"
              label="Room Title"
              disabled={false}
              register={register}
              errors={errors}
              required
            />

            {listingCategory?.pricingType === 'ROOM_BASED' && (
              <Input
                id="price"
                label="Price per month"
                type="number"
                formatPrice
                disabled={false}
                register={register}
                errors={errors}
                required={true}
                value={watch('price')}
                onChange={(value) => {
                  const numValue = parseFloat(value);
                  setValue('price', numValue, {
                    shouldValidate: true,
                    shouldDirty: true
                  });
                }}
              />
            )}

            <div>
              <h3 className="text-md font-medium mb-2">Room Description</h3>
              <Input
              id="description"
              textArea={true}
              disabled={false}
              register={register}
              errors={errors}
              required
              value={watch('description')}
              setValue={(id, value) => {
                setValue(id, value, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true
                });
              }}
            />
            </div>
            

            <div>
              <h3 className="text-md font-medium mb-2">Room Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <CategoryInput
                    key={category.id}
                    onClick={(value) => {
                      setValue('roomCategory', value, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    selected={watch('roomCategory') === category.title}
                    label={category.title}
                    icon={getIconComponent(category.icon)}
                  />
                ))}
              </div>
            </div>

            

            {listingCategory?.pricingType === 'ROOM_BASED' && (
              <div className="mt-4">
                <Counter
                  title="Maximum Tenants"
                  subtitle="Maximum number of tenants allowed in this room"
                  value={watch('maxTenantCount')}
                  onChange={(value) => setValue('maxTenantCount', value, {
                    shouldValidate: true,
                    shouldDirty: true
                  })}
                />
              </div>
            )}

            <div>
              <h3 className="text-md font-medium mb-2">Room Images</h3>
              <ImageUpload
                value={watch('images') || []}
                onChange={handleImageChange}
                maxImages={5}
              />
            </div>

            


            <div>
              <h3 className="text-md font-medium mb-2">Room Amenities</h3>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {amenities.map((amenity) => (
                    <div 
                      key={amenity.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${watch(`amenities.${amenity.id}`)?.selected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-200'
                        }
                      `}
                      onClick={() => {
                        const currentValue = watch(`amenities.${amenity.id}`);
                        setValue(`amenities.${amenity.id}`, {
                          selected: !currentValue?.selected,
                          note: currentValue?.note || ''
                        });
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {React.createElement(FaIcons[amenity.icon as keyof typeof FaIcons] || FaIcons.FaQuestion, {
                              className: `text-xl ${watch(`amenities.${amenity.id}`)?.selected ? 'text-indigo-600' : 'text-gray-600'}`
                            })}
                            <div>
                              <span className="text-sm font-medium">{amenity.title}</span>
                              <p className="text-xs text-gray-500">{amenity.desc}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={watch(`amenities.${amenity.id}`)?.selected || false}
                            onChange={() => {}}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </div>
                        {watch(`amenities.${amenity.id}`)?.selected && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              placeholder="Add note (optional)"
                              className="mt-1 w-full p-2 text-sm border rounded-md"
                              value={watch(`amenities.${amenity.id}`)?.note || ''}
                              onChange={(e) => {
                                setValue(`amenities.${amenity.id}`, {
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
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="
          p-6 
          border-t 
          bg-white
          mt-auto
        ">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="
                px-6
                py-2.5
                rounded-lg
                font-medium
                border-2
                border-gray-300
                text-gray-700
                hover:bg-gray-50
                hover:border-gray-400
                active:bg-gray-100
                disabled:opacity-70
                disabled:cursor-not-allowed
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-gray-400
              "
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`
                px-6
                py-2.5
                rounded-lg
                font-medium
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                flex
                items-center
                gap-2
                ${isFormValid() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
              `}
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              <span>Save Room</span>
              {isFormValid() && (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(RoomDetailsDrawer);
