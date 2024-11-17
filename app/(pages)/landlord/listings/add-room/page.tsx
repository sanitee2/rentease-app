'use client';
import React, { Suspense, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import Heading from '@/app/components/Heading';
import Input from '@/app/components/inputs/Input';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import Breadcrumbs from '@/app/components/Breadcrumbs';

// Wrap the entire AddRoom component with Suspense to handle CSR properly
const AddRoomContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const listingId = searchParams?.get('listingId');
  const listingTitle = searchParams?.get('listingTitle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      roomCategory: '',
      images: [],
      price: 1,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!listingId) {
      toast.error('No listing selected. Please navigate correctly.');
      return;
    }

    setIsLoading(true);
    data.imageSrc = { images };
    data.listingId = listingId;

    axios.post('/api/add-room', data)
      .then(() => {
        toast.success('Room added successfully!');
        router.refresh();
        reset();
      })
      .catch((error) => {
        console.error('Error adding room:', error);
        toast.error('Something went wrong.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="container mx-auto">
      <div className='text-3xl font-semibold mb-2'>Add Room</div>
      <Breadcrumbs />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Selected Listing" subtitle="The listing this room will be added to" />
          <p className="text-lg font-semibold text-gray-700">
            {listingTitle ? listingTitle : 'Loading selected listing...'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Add Room Title" subtitle="What is the title of this room?" />
          <Input
            id="title"
            label="Room Title"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Room Category" subtitle="Which category best describes this room?" />
          <Input
            id="roomCategory"
            label="Room Category"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Room Description" subtitle="Describe this room in detail" />
          <Input
            id="description"
            textArea
            label="Description"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Room Images" subtitle="Upload images of the room" />
          <ImageUpload value={images} onChange={setImages} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <Heading title="Set Room Price" subtitle="How much will this room be?" />
          <Input
            id="price"
            label="Price"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading || !listingId}
          >
            Add Room
          </button>
        </div>
      </form>
    </div>
  );
};

// Add Suspense boundary to the component using useSearchParams()
const AddRoom = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <AddRoomContent />
  </Suspense>
);

export default AddRoom;
