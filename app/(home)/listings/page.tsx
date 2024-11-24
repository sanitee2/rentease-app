import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getListingCategories from "@/app/actions/getListingCategories";
import ClientOnly from "@/app/components/ClientOnly";
import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import ListingCard from "@/app/components/listings/ListingCard";
import ListingsFilter from "@/app/components/listings/ListingsFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BiFilter } from "react-icons/bi";
import MobileFilterDrawer from "@/app/components/listings/MobileFilterDrawer";
import ListingsContent from "@/app/components/listings/ListingsContent";

export default async function ListingsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();
  const categories = await getListingCategories();

  return (
    <ListingsContent 
      listings={listings}
      currentUser={currentUser}
      categories={categories}
      searchParams={searchParams}
    />
  );
}
