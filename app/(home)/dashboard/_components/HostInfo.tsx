'use client';

import { 
  HiCheckBadge, 
  HiEnvelope, 
  HiPhone 
} from "react-icons/hi2";
import Image from 'next/image';
import { SafeUser } from '@/app/types';

interface HostInfoProps {
  host: SafeUser | null | undefined;
}

const HostInfo = ({ host }: HostInfoProps) => {
  if (!host) return null;

  const fullName = `${host.firstName} ${host.lastName}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Property Host</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
            <HiCheckBadge className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-6">
          {host.image ? (
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src={host.image}
                alt={fullName}
                width={56}
                height={56}
                className="rounded-full object-cover w-14 h-14 border-4 border-white shadow-md"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
              <span className="text-xl font-semibold text-indigo-600">
                {host.firstName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {fullName}
            </h3>
            <p className="text-sm text-gray-500">
              Property Manager & Primary Contact
            </p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-3">
          {host.email && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                <HiEnvelope className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                {host.email}
              </span>
            </div>
          )}
          
          {host.phoneNumber && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                <HiPhone className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                {host.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostInfo; 