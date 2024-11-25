'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import Button from './Button'
import Heading from './Heading'
import { BiReset } from 'react-icons/bi'

interface EmptyState {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
  onReset?: () => void;
}

const EmptyState: React.FC<EmptyState> = ({
  title = "No exact matches",
  subtitle = "Try changing the search or filter",
  showReset,
  onReset
}) => {
  const router = useRouter();

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    router.push('/listings');
  };

  return (
    <div className="
      w-full
      flex
      flex-col
      gap-2
      justify-center
      items-center
      py-8
    ">
      <Heading
        center
        title={title}
        subtitle={subtitle}
      />
      <div className="mt-4">
        {showReset && (
          <Button
            outline
            label="Remove all filters"
            onClick={handleReset}
          />
        )}
      </div>
    </div>
  )
}

export default EmptyState