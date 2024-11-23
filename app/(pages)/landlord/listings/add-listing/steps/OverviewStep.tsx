// import React from 'react';
// import { BiCategory } from 'react-icons/bi';
// import { IoLocationSharp, IoBedOutline, IoImagesOutline, IoInformationCircleOutline, IoDocumentTextOutline, IoCheckmarkCircle, IoShieldCheckmarkOutline } from 'react-icons/io5';
// import { MdPets } from 'react-icons/md';
// import { FaChild, FaSmoking } from 'react-icons/fa';
// import { HiUsers } from 'react-icons/hi';
// import { PropertyAmenity, AmenityValue, PropertyAmenities } from '@/app/types';
// import Heading from '@/app/components/Heading';

// interface OverviewStepProps {
//   watch: any;
//   setStep: (step: number) => void;
//   category: string;
//   street: string;
//   barangay: string;
//   rooms: any[];
//   images: string[];
//   title: string;
//   description: string;
//   propertyAmenities: PropertyAmenity[];
// }

// const OverviewStep: React.FC<OverviewStepProps> = ({
//   watch,
//   setStep,
//   category,
//   street,
//   barangay,
//   rooms,
//   images,
//   title,
//   description,
//   propertyAmenities,
// }) => {
//   return (
//     <div className="bg-white shadow rounded-lg p-6 mb-6">
//       <Heading title="Overview" subtitle="Review all the information before submitting." />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//         {/* Category Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <BiCategory className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Category</h3>
//                 <p className="text-gray-600 mt-1">{category}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(1)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* Location Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoLocationSharp className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Location</h3>
//                 <p className="text-gray-600 mt-1">{street}, {barangay}</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(2)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* Rooms Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoBedOutline className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Rooms</h3>
//                 <p className="text-gray-600 mt-1">{rooms.length} room(s) added</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(3)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* Images Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoImagesOutline className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Images</h3>
//                 <p className="text-gray-600 mt-1">{images.length} image(s) uploaded</p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(4)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* Title Card - Updated with truncation */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoInformationCircleOutline className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Title</h3>
//                 <p className="text-gray-600 mt-1">
//                   {truncateText(title, 20)}
//                 </p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(5)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* Description Card - Updated to use truncateHtml */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoDocumentTextOutline className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Description</h3>
//                 <p className="text-gray-600 mt-1 line-clamp-2">
//                   {truncateHtml(description, 5)}
//                 </p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(5)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* New Property Amenities Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoCheckmarkCircle className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">Property Amenities</h3>
//                 <p className="text-gray-600 mt-1">
//                   {Object.entries(watch('propertyAmenities') as PropertyAmenities || {})
//                     .filter(([_, value]: [string, AmenityValue]) => value.selected)
//                     .map(([key]) => {
//                       const amenity = propertyAmenities.find((a: PropertyAmenity) => a.id === key);
//                       return amenity?.title;
//                     })
//                     .filter(Boolean)
//                     .join(', ') || 'No amenities selected'}
//                 </p>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(6)} 
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>

//         {/* House Rules Card */}
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition">
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <IoShieldCheckmarkOutline className="text-2xl text-indigo-600" />
//               <div>
//                 <h3 className="font-semibold text-gray-700">House Rules</h3>
//                 <div className="text-gray-600 mt-1 space-y-2">
//                   <p>Gender: {watch('genderRestriction').replace('_', ' ').toLowerCase()}</p>
//                   {watch('hasAgeRequirement') && watch('minimumAge') && (
//                     <p>Minimum age: {watch('minimumAge')} years</p>
//                   )}
//                   {watch('overnightGuestsAllowed') && watch('maxGuests') && (
//                     <p>Max overnight guests: {watch('maxGuests')}</p>
//                   )}
//                   <div className="flex gap-2">
//                     {watch('petsAllowed') && (
//                       <div className="flex items-center gap-1">
//                         <MdPets className="text-indigo-600" />
//                         <span className="text-sm">Pets allowed</span>
//                       </div>
//                     )}
//                     {watch('childrenAllowed') && (
//                       <div className="flex items-center gap-1">
//                         <FaChild className="text-indigo-600" />
//                         <span className="text-sm">Children allowed</span>
//                       </div>
//                     )}
//                     {watch('smokingAllowed') && (
//                       <div className="flex items-center gap-1">
//                         <FaSmoking className="text-indigo-600" />
//                         <span className="text-sm">Smoking allowed</span>
//                       </div>
//                     )}
//                   </div>
//                   {watch('additionalNotes')?.trim() && (
//                     <div className="mt-2">
//                       <p className="text-sm font-medium text-gray-700">Additional Notes:</p>
//                       <p className="text-sm italic text-gray-600 mt-1">
//                         "{watch('additionalNotes')}"
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <button 
//               onClick={() => setStep(7)}
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               Edit
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverviewStep; 