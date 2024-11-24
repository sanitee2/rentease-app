'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from './Modal';
import { IoAlertCircleOutline } from "react-icons/io5";

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('sessionExpired') === 'true') {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  const bodyContent = (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-600">
        <IoAlertCircleOutline size={50} />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Session Expired</h3>
        <p className="text-gray-500">
          For your security, you have been automatically logged out due to inactivity.
          Please log in again to continue.
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Session Expired"
      body={bodyContent}
      actionLabel="Log In Again"
      onSubmit={handleClose}
      size="sm"
    />
  );
};

export default SessionExpiredModal; 