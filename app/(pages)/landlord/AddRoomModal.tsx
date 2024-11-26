'use client'

import React, { useMemo, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import Heading from '../../components/Heading';
import Input from '../../components/inputs/Input';
import ImageUpload from '../../components/inputs/ImageUpload';
import Modal from '@/app/components/Modals/Modal';
import useAddRoomModal from '@/app/hooks/useAddRoomModal'; // Custom hook for room modal control

enum ROOM_STEPS {
  DETAILS = 0,
  IMAGES,
  DESCRIPTION
}

const AddRoomModal: React.FC = () => {
  const router = useRouter();
  const addRoomModal = useAddRoomModal();

  const [step, setStep] = useState(ROOM_STEPS.DETAILS);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]); 

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FieldValues>({
    defaultValues: {
      roomTitle: '',
      roomCategory: '',
      description: '',
      images: [],
      listingId: '', 
    },
  });

  const roomTitle = watch('roomTitle');
  const roomCategory = watch('roomCategory');
  const description = watch('description');
  const listingId = watch('listingId'); // This should be set with the actual listing ID

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // Validation logic for each step
  const validateRoomStep = () => {
    switch (step) {
      case ROOM_STEPS.DETAILS:
        return roomTitle.trim() !== '' && roomCategory.trim() !== '';
      case ROOM_STEPS.IMAGES:
        return images.length > 0;
      case ROOM_STEPS.DESCRIPTION:
        return description.trim() !== '';
      default:
        return false;
    }
  };

  // Go to the next step
  const onNext = () => {
    if (!validateRoomStep()) return;
    setStep((prevStep) => prevStep + 1);
  };

  // Go back to the previous step
  const onBack = () => setStep((prevStep) => prevStep - 1);

  // Submit the room data
  const onSubmitRoom: SubmitHandler<FieldValues> = async (data) => {
    if (step !== ROOM_STEPS.DESCRIPTION) return onNext();

    setIsLoading(true);
    data.imageSrc = images[0]; // Assuming you're handling only one image for now


    try {
      const response = await axios.post('/api/add-room', data);
      if (response.status === 201) {
        toast.success('Room added successfully!');
        router.refresh();
        reset();
        setStep(ROOM_STEPS.DETAILS);
        addRoomModal.onClose();
      } else {
        toast.error(response.data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render content for each step in the modal
  const getRoomBodyContent = () => {
    switch (step) {
      case ROOM_STEPS.DETAILS:
        return (
          <div className='flex flex-col gap-8'>
            <Heading title="Room Details" subtitle="Provide room information" />
            <Input id="roomTitle" label="Room Title" disabled={isLoading} register={register} errors={errors} required />
            <Input id="roomCategory" label="Room Category" disabled={isLoading} register={register} errors={errors} required />
          </div>
        );
      case ROOM_STEPS.IMAGES:
        return (
          <div className='flex flex-col gap-8'>
            <Heading title="Add Room Photos" subtitle="Upload images of the room" />
            <ImageUpload value={images} onChange={setImages} />
          </div>
        );
      case ROOM_STEPS.DESCRIPTION:
        return (
          <div className='flex flex-col gap-8'>
            <Heading title="Room Description" subtitle="Describe your room" />
            <Input id="description" textArea label="Description" disabled={isLoading} register={register} errors={errors} required />
          </div>
        );
      default:
        return <></>;
    }
  };

  const actionLabel = step === ROOM_STEPS.DESCRIPTION ? 'Add Room' : 'Next';
  const secondaryActionLabel = step === ROOM_STEPS.DETAILS ? undefined : 'Back';

  return (
    <Modal
      isOpen={addRoomModal.isOpen}
      onClose={addRoomModal.onClose}
      onSubmit={handleSubmit(onSubmitRoom)}
      onSubmitDisabled={!validateRoomStep()}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === ROOM_STEPS.DETAILS ? undefined : onBack}
      title="Add a New Room"
      body={getRoomBodyContent()}
    />
  );
};

export default AddRoomModal;
