// import React from 'react';
// import { IoPersonOutline, IoShieldCheckmarkOutline, IoInformationCircleOutline } from 'react-icons/io5';
// import { HiUsers } from 'react-icons/hi';
// import { FaFemale, FaMale, FaChild, FaSmoking } from 'react-icons/fa';
// import { MdPets } from 'react-icons/md';
// import Input from '@/app/components/inputs/Input';
// import Counter from '@/app/components/inputs/Counter';
// import Heading from '@/app/components/Heading';

// interface HouseRulesStepProps {
//   register: any;
//   errors: any;
//   watch: any;
//   setValue: (id: string, value: any) => void;
//   isLoading: boolean;
// }

// const HouseRulesStep: React.FC<HouseRulesStepProps> = ({
//   register,
//   errors,
//   watch,
//   setValue,
//   isLoading,
// }) => {
//   return (
//     <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-4">
//       <Heading 
//         title="House rules" 
//         subtitle="Set some ground rules for staying at your property. Guests will be required to review and agree to these before they book." 
//       />
      
//       <div className="space-y-8">
//         {/* Guest Limits Section */}
//         <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-indigo-100 rounded-lg">
//               <IoPersonOutline className="text-2xl text-indigo-600" />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">Guest Limits</h3>
//               <p className="text-gray-600">Set restrictions for overnight stays and age requirements</p>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-6 auto-rows-auto">
//             {/* Overnight Guests Toggle and Counter */}
//             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all h-fit">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                   <h4 className="font-medium text-gray-900">Overnight Guests</h4>
//                   <p className="text-gray-600 text-sm mt-1">Allow tenants to have overnight guests</p>
//                 </div>
//                 <div className="relative inline-block">
//                   <input
//                     type="checkbox"
//                     id="overnightGuestsAllowed"
//                     checked={watch('overnightGuestsAllowed')}
//                     onChange={(e) => {
//                       setValue('overnightGuestsAllowed', e.target.checked);
//                       if (!e.target.checked) setValue('maxGuests', 0);
//                     }}
//                     className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>
//               {watch('overnightGuestsAllowed') && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <Counter
//                     title="Maximum overnight guests"
//                     subtitle="Total number of guests allowed to sleep"
//                     value={watch('maxGuests')}
//                     onChange={(value) => setValue('maxGuests', value)}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Age Requirement Toggle and Counter */}
//             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all h-fit">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                   <h4 className="font-medium text-gray-900">Age Requirement</h4>
//                   <p className="text-gray-600 text-sm mt-1">Set minimum age requirement</p>
//                 </div>
//                 <input
//                   type="checkbox"
//                   id="hasAgeRequirement"
//                   checked={watch('hasAgeRequirement')}
//                   onChange={(e) => {
//                     setValue('hasAgeRequirement', e.target.checked);
//                     if (!e.target.checked) setValue('minimumAge', 0);
//                   }}
//                   className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
//                 />
//               </div>
//               {watch('hasAgeRequirement') && (
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <Counter
//                     title="Minimum age requirement"
//                     subtitle="Age required for the primary renter"
//                     value={watch('minimumAge')}
//                     onChange={(value) => setValue('minimumAge', value)}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Property Rules Section */}
//         <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-indigo-100 rounded-lg">
//               <IoShieldCheckmarkOutline className="text-2xl text-indigo-600" />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">Property Rules</h3>
//               <p className="text-gray-600">Set house rules and restrictions for your property</p>
//             </div>
//           </div>

//           {/* Gender Restriction */}
//           <div className="mb-8">
//             <h4 className="font-medium text-gray-900 mb-4">Gender Restriction</h4>
//             <div className="grid grid-cols-3 gap-4">
//               {[
//                 { value: 'BOTH', label: 'No Restriction', icon: HiUsers },
//                 { value: 'LADIES_ONLY', label: 'Ladies Only', icon: FaFemale },
//                 { value: 'MEN_ONLY', label: 'Men Only', icon: FaMale },
//               ].map((option) => (
//                 <div
//                   key={option.value}
//                   className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
//                     watch('genderRestriction') === option.value
//                       ? 'border-indigo-500 bg-indigo-50'
//                       : 'border-gray-200 hover:border-indigo-200'
//                   }`}
//                   onClick={() => setValue('genderRestriction', option.value)}
//                 >
//                   <div className="flex flex-col items-center gap-3">
//                     {React.createElement(option.icon, { 
//                       className: `text-2xl ${watch('genderRestriction') === option.value ? 'text-indigo-600' : 'text-gray-600'}`
//                     })}
//                     <p className="text-gray-700 font-medium text-center">
//                       {option.label}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* House Rules */}
//           <div className="grid md:grid-cols-3 gap-4">
//             {[
//               { id: 'petsAllowed', label: 'Pets Allowed', icon: MdPets },
//               { id: 'childrenAllowed', label: 'Children Allowed', icon: FaChild },
//               { id: 'smokingAllowed', label: 'Smoking Allowed', icon: FaSmoking },
//             ].map((rule) => (
//               <div 
//                 key={rule.id}
//                 className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
//                   watch(rule.id) 
//                     ? 'border-indigo-500 bg-indigo-50' 
//                     : 'border-gray-200 hover:border-indigo-200'
//                 }`}
//                 onClick={() => setValue(rule.id, !watch(rule.id))}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     {React.createElement(rule.icon, { 
//                       className: `text-2xl ${watch(rule.id) ? 'text-indigo-600' : 'text-gray-600'}`
//                     })}
//                     <label htmlFor={rule.id} className="text-gray-900 font-medium">
//                       {rule.label}
//                     </label>
//                   </div>
//                   <input
//                     type="checkbox"
//                     id={rule.id}
//                     {...register(rule.id)}
//                     className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Additional Notes Section */}
//         <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 bg-indigo-100 rounded-lg">
//               <IoInformationCircleOutline className="text-2xl text-indigo-600" />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
//               <p className="text-gray-600">Add any extra details about your property</p>
//             </div>
//           </div>
//           <Input
//             id="additionalNotes"
//             disabled={isLoading}
//             register={register}
//             errors={errors}
//             textArea
//             value={watch('additionalNotes')}
//             setValue={(id, value) => {
//               setValue(id, value, {
//                 shouldValidate: true,
//                 shouldDirty: true,
//                 shouldTouch: true
//               });
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HouseRulesStep; 