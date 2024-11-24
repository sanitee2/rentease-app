'use client';

import Image from 'next/image';

interface HostInfoProps {
  host: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  } | null;
}

const HostInfo = ({ host }: HostInfoProps) => {
  if (!host) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Property Manager</h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      </div>
      
      <div className="flex items-start gap-6">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          {host.image ? (
            <div className="relative w-16 h-16">
              <Image
                src={host.image}
                alt={host.name}
                fill
                className="rounded-full object-cover ring-4 ring-gray-50"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center ring-4 ring-gray-50">
              <span className="text-xl font-semibold text-indigo-600">
                {host.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-grow">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {host.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Property Manager & Primary Contact
          </p>
          
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </div>
              <span className="font-medium">{host.email}</span>
            </div>
            
            {host.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{host.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostInfo; 