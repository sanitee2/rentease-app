import React from 'react';
import Input from '@/app/components/inputs/Input';
import Heading from '@/app/components/Heading';
import { ListingCategory } from '@/app/types';
import { HiUsers } from 'react-icons/hi';
import Counter from '@/app/components/inputs/Counter';

interface DescriptionStepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: (id: string, value: any) => void;
  selectedCategory: ListingCategory | null;
  isLoading: boolean;
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  selectedCategory,
  isLoading,
}) => {
  return (
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
  );
};

export default DescriptionStep; 