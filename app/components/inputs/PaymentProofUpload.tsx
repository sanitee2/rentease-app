'use client';

import React, { useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { TbReceipt } from 'react-icons/tb';
import { AiFillCloseCircle } from 'react-icons/ai';

interface PaymentProofUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onChange,
  value = []
}) => {
  const handleUpload = useCallback((result: any) => {
    if (!result?.info?.secure_url) return;
    onChange([result.info.secure_url]);
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <div className="relative">
          <CldUploadWidget
            onSuccess={handleUpload}
            uploadPreset="rfsxfegg"
            options={{
              maxFiles: 1,
              sources: ['local', 'camera'],
              resourceType: 'image'
            }}
          >
            {({ open }) => (
              <div
                onClick={() => open?.()}
                className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center gap-3 text-neutral-600"
              >
                <TbReceipt size={40} />
                <div className="text-sm font-medium">Upload Payment Proof</div>
                <div className="text-xs text-gray-500">
                  Click to upload your receipt or proof of payment
                </div>
              </div>
            )}
          </CldUploadWidget>
        </div>
      ) : (
        <div className="relative">
          <div className="h-[200px] relative overflow-hidden rounded-lg bg-gray-50">
            <Image
              fill
              style={{ objectFit: 'contain' }}
              src={value[0]}
              alt="Payment proof"
              className="p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition"
          >
            <AiFillCloseCircle className="text-red-500" size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentProofUpload; 