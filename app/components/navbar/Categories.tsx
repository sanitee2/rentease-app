'use client'

import { FaBed } from "react-icons/fa6";
import { MdMeetingRoom, MdOutlineApartment } from "react-icons/md";
import { usePathname, useSearchParams } from "next/navigation";
import CategoryBox from "@/app/components/CategoryBox";
import Container from "@/app/components/Container";

export const categories = [
  {
    label: "Bed Spacer",
    icon: FaBed,
    description: "Find a Bed Spacer property"
  },
  {
    label: "Studio",
    icon: MdMeetingRoom,
    description: "Find a Studio type property"
  },
  {
    label: "Apartment",
    icon: MdOutlineApartment,
    description: "Find an apartment"
  }
] 


const Categories = () => {
  const params = useSearchParams();
  const category = params?.get('category');
  const pathname = usePathname();

  const isMainPage = pathname === '/';

  if(!isMainPage){
    return null;
  }
  return ( 
    <Container>
      <div
      className="pt-4
      flex
      flex-row
      items-center
      justify-between
      overflow-x-auto">

        {categories.map((item) => (
          <CategoryBox
          key = {item.label}
          label = {item.label}
          selected = {category === item.label}
          icon= {item.icon}
          />
        ))}

      </div>
    </Container>
);
}
 
export default Categories;