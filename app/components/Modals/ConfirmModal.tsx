'use client'
import React from 'react'
import Heading from '../../components/Heading';
import Modal from './Modal';
import useConfirmModal from '@/app/hooks/useConfirmModal';

const ConfirmModal = () => {

  const confirmModal = useConfirmModal();

  const bodyContent = (
    <Heading
      center
      title='Your listing has been added!'
      subtitle='Your listing will undergo a review by an admin soon. You will receive a notification when it has been approved.'
      />
  );

  return (
    <Modal
      isOpen={confirmModal.isOpen}
      onClose={confirmModal.onClose}
      title="Listing Added Successfully!"
      body={bodyContent}
      onSubmit={confirmModal.onClose}
      disabled={false}
      actionLabel="Close"
    />
  )
}

export default ConfirmModal