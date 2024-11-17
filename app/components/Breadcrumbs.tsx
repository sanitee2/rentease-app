// Breadcrumbs Component
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname() as string;

  // Split pathname to create breadcrumb segments
  let segments = pathname.split('/').filter(segment => segment.length > 0);

  // Remove only the first segment (landlord)
  if (segments.length > 0) {
    segments = segments.slice(1);
  }

  // Capitalize each segment
  const capitalize = (segment: string) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  // Create a URL from segments
  const createUrl = (index: number) => {
    return '/' + segments.slice(0, index + 1).join('/');
  };

  return (
    <nav aria-label="breadcrumb" className="bg-gray-50 rounded-md w-full mb-5">
      <ol className="list-reset flex text-gray-600">
        <li className="mr-2">
          <Link href="/" legacyBehavior>
            <a className="hover:underline">Dashboard</a>
          </Link>
          {segments.length > 0 && (
            <span className="mx-2">/</span>
          )}
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <li key={index} className="mr-2">
              {!isLast ? (
                <>
                  <Link href={createUrl(index)} legacyBehavior>
                    <a className="hover:underline">{capitalize(segment)}</a>
                  </Link>
                  <span className="mx-2">/</span>
                </>
              ) : (
                <span className="text-gray-900 font-semibold">
                  {capitalize(segment)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
