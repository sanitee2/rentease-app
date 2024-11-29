'use client';

import { SafeUser } from '@/app/types';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import Input from '@/app/components/inputs/Input';
import Button from '@/app/components/Button';

interface ProfileClientProps {
  currentUser: SafeUser;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      firstName: currentUser.firstName,
      middleName: currentUser.middleName || '',
      lastName: currentUser.lastName,
      suffix: currentUser.suffix || '',
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber || '',
      image: currentUser.image || '',
    }
  });

  const image = watch('image');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      await axios.put('/api/profile', data);
      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="max-w-[250px]">
            <ImageUpload 
              onChange={(value) => setCustomValue('image', value)}
              value={image}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="firstName"
              label="First Name"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="middleName"
              label="Middle Name"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
            <Input
              id="lastName"
              label="Last Name"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <Input
              id="suffix"
              label="Suffix"
              disabled={isLoading}
              register={register}
              errors={errors}
            />
            <Input
              id="email"
              label="Email"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="email"
            />
            <Input
              id="phoneNumber"
              label="Phone Number"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            disabled={isLoading}
            label="Save Changes"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </div>
  );
};

export default ProfileClient; 