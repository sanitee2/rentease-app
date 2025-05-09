import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { DynamicOptions } from 'next/dynamic';

export const dynamicComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicOptions<T> = {}
) => {
  return dynamic(importFn, {
    ssr: false,
    loading: () => null,
    ...options,
  });
};

// Example usage:
// export const DynamicMap = dynamicComponent(() => import('@/components/Map')); 