import React from 'react';
import ImageUpload from '@/app/components/inputs/ImageUpload';
import Heading from '@/app/components/Heading';

interface ImagesStepProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImagesStep: React.FC<ImagesStepProps> = ({ images, setImages }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <Heading title="Add a photo of your place" subtitle="Show people what your place looks like!" />
      <ImageUpload value={images} onChange={setImages} />
    </div>
  );
};

export default ImagesStep; 