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
}

const EmptyState: React.FC<EmptyState> = ({
  title = "No exact matches",
  subtitle = "Try changing the search or filter",
  showReset
}) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleReset = () => {
    const path = window.location.pathname;
    if (path === '/listings') {
      router.push('/listings');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="
      min-h-[400px]
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