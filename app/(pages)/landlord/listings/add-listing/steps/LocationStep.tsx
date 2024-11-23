// import React, { useRef } from 'react';
// import { StandaloneSearchBox, GoogleMap, Marker, StreetViewPanorama } from '@react-google-maps/api';
// import Select from 'react-select';
// import Input from '@/app/components/inputs/Input';
// import Heading from '@/app/components/Heading';

// interface LocationStepProps {
//   searchBoxRef: React.RefObject<google.maps.places.SearchBox | null>;
//   searchOptions: any;
//   handlePlacesChanged: () => void;
//   handleMarkerDragEnd: (event: google.maps.MapMouseEvent) => void;
//   handleUseCurrentLocation: () => void;
//   location: { lat: number; lng: number } | null;
//   register: any;
//   errors: any;
//   watch: any;
//   setCustomValue: (id: string, value: any) => void;
//   selectState: { isFocused: boolean };
//   setSelectState: React.Dispatch<React.SetStateAction<{ isFocused: boolean }>>;
// }


// // Add this constant near the top of the file, after imports
// const SURIGAO_BARANGAYS = [
//   { value: 'Alegria', label: 'Alegria' },
//   { value: 'Alipayo', label: 'Alipayo' },
//   { value: 'Alliance', label: 'Alliance' },
//   { value: 'Anomar', label: 'Anomar' },
//   { value: 'Bagakay', label: 'Bagakay' },
//   { value: 'Balibayon', label: 'Balibayon' },
//   { value: 'Bilabid', label: 'Bilabid' },
//   { value: 'Bitaugan', label: 'Bitaugan' },
//   { value: 'Bonifacio', label: 'Bonifacio' },
//   { value: 'Taft', label: 'Taft' },
//   { value: 'Washington', label: 'Washington' },
//   { value: 'Cabongbongan', label: 'Cabongbongan' },
//   { value: 'Cagniog', label: 'Cagniog' },
//   { value: 'Canlanipa', label: 'Canlanipa' },
//   { value: 'Capalayan', label: 'Capalayan' },
//   { value: 'Catadman', label: 'Catadman' },
//   { value: 'Danao', label: 'Danao' },
//   { value: 'Day-asan', label: 'Day-asan' },
//   { value: 'Ipil', label: 'Ipil' },
//   { value: 'Lipata', label: 'Lipata' },
//   { value: 'Lisa', label: 'Lisa' },
//   { value: 'Luna', label: 'Luna' },
//   { value: 'Mabini', label: 'Mabini' },
//   { value: 'Mabua', label: 'Mabua' },
//   { value: 'Mapawa', label: 'Mapawa' },
//   { value: 'Mat-i', label: 'Mat-i' },
//   { value: 'Nabago', label: 'Nabago' },
//   { value: 'Nonoc', label: 'Nonoc' },
//   { value: 'Punta Bilar', label: 'Punta Bilar' },
//   { value: 'Quezon', label: 'Quezon' },
//   { value: 'Rizal', label: 'Rizal' },
//   { value: 'Sabang', label: 'Sabang' },
//   { value: 'San Juan', label: 'San Juan' },
//   { value: 'Serna', label: 'Serna' },
//   { value: 'Sidlakan', label: 'Sidlakan' },
//   { value: 'Silop', label: 'Silop' },
//   { value: 'Trinidad', label: 'Trinidad' },
//   { value: 'Zaragoza', label: 'Zaragoza' },
// ];


// const LocationStep: React.FC<LocationStepProps> = ({
//   searchBoxRef,
//   searchOptions,
//   handlePlacesChanged,
//   handleMarkerDragEnd,
//   handleUseCurrentLocation,
//   location,
//   register,
//   errors,
//   watch,
//   setCustomValue,
//   selectState,
//   setSelectState,
// }) => {
//   return (
//     <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col gap-6">
//       <Heading title="Where is your place located?" subtitle="Help guests find you!" />
//       <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
//         <StandaloneSearchBox
//           onLoad={(ref) => {
//             if (ref) {
//               searchBoxRef.current = ref;
//               const input = document.querySelector('input[type="text"]');
//               if (input) {
//                 input.setAttribute('placeholder', '');
//               }
//             }
//           }}
//           onPlacesChanged={handlePlacesChanged}
//           options={searchOptions}
//         >
//           <Input
//             id='street'
//             register={register}
//             errors={errors}
//             type="text"
//             label="Street address"
//             required
//           />
//         </StandaloneSearchBox>
        
//         <div className="w-full relative z-20">
//           <div className="relative">
//             <label
//               className={`
//                 absolute
//                 text-md
//                 duration-150
//                 transform
//                 -translate-y-3
//                 top-5
//                 z-10
//                 origin-[0]
//                 left-4
//                 ${watch('barangay') || selectState.isFocused ? 'scale-75 -translate-y-4' : 'scale-80 translate-y-0'}
//                 text-zinc-400
//               `}
//             >
//               Barangay
//             </label>
//             <Select
//               placeholder=" "
//               options={SURIGAO_BARANGAYS}
//               value={SURIGAO_BARANGAYS.find(option => option.value === watch('barangay'))}
//               onChange={(option) => setCustomValue('barangay', option?.value)}
//               classNames={{
//                 control: (state) => 
//                   `px-2 pb-2 pt-4 border-2 ${state.isFocused ? 'border-black' : 'border-neutral-300'} rounded-md`,
//                 input: () => 'text-lg pt-2',
//                 option: () => 'text-lg',
//                 menu: () => 'z-50'
//               }}
//               onFocus={() => setSelectState({ isFocused: true })}
//               onBlur={() => setSelectState({ isFocused: false })}
//               theme={(theme) => ({
//                 ...theme,
//                 borderRadius: 6,
//                 colors: {
//                   ...theme.colors,
//                   primary: '#4F46E5',
//                   primary25: '#EEF2FF'
//                 }
//               })}
//             />
//           </div>
//           {errors['barangay'] && (
//             <span className="text-red-500 text-sm">
//               This field is required
//             </span>
//           )}
//         </div>
//       </div>
      
//       {location && (
//         <div>
//           <button
//             type="button"
//             className="bg-indigo-500 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded mb-4 transition duration-200 ease-in-out"
//             onClick={handleUseCurrentLocation}
//           >
//             Use Current Location
//           </button>
//           <div className="flex flex-row gap-4">
//             <GoogleMap
//               zoom={15}
//               center={location}
//               mapContainerStyle={{ width: '50%', height: '400px' }}
//               options={{
//                 disableDefaultUI: true,
//                 zoomControl: true,
//               }}
//             >
//               <Marker 
//                 position={location}
//                 draggable={true}
//                 onDragEnd={handleMarkerDragEnd}
//               />
//             </GoogleMap>
//             <GoogleMap
//               zoom={15}
//               center={location}
//               mapContainerStyle={{ width: '50%', height: '400px' }}
//               options={{
//                 disableDefaultUI: true,
//                 zoomControl: true,
//               }}
//             >
//               <StreetViewPanorama
//                 options={{
//                   position: location,
//                   visible: true,
//                   pov: { heading: 100, pitch: 0 },
//                   zoom: 1,
//                   disableDefaultUI: true,
//                   disableDoubleClickZoom: true,
//                   clickToGo: false,
//                   showRoadLabels: false,
//                   enableCloseButton: false,
//                 }}
//               />
//             </GoogleMap>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LocationStep; 