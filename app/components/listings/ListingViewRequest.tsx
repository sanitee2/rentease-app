import React from 'react'
import { FaPesoSign } from 'react-icons/fa6'

interface ListingViewRequestProps {
  time: Date,
  date: Date,
  price: number,
  onChangeDate: (value: string) => void,
  onSubmit: () => void,
  disabled: boolean,
}

const ListingViewRequest: React.FC<ListingViewRequestProps> = ({
  time,
  date,
  onChangeDate,
  onSubmit,
  disabled,
  price
}) => {
  return (
    <div
    className='bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden'>

      <div className='flex flex-row items-center gap-1 p-4'>
        <div className='text-2xl font-semibold'>
        <FaPesoSign size={13} className='inline'/> {price.toLocaleString('en-US')} 
        </div>
      </div>

    </div>
  )
}

export default ListingViewRequest