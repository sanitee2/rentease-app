import React from 'react';
import Heading from '@/app/components/Heading';
import * as FaIcons from 'react-icons/fa';

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

interface PropertyAmenitiesStepProps {
  propertyAmenities: PropertyAmenity[];
  isAmenitiesLoading: boolean;
  watch: any;
  setValue: (id: string, value: any, options?: any) => void;
}

const PropertyAmenitiesStep: React.FC<PropertyAmenitiesStepProps> = ({
  propertyAmenities,
  isAmenitiesLoading,
  watch,
  setValue,
}) => {
  return (
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
  );
};

export default PropertyAmenitiesStep; 