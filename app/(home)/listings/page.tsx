import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getRooms from "@/app/actions/getRooms";
import ClientOnly from "@/app/components/ClientOnly";
import Container from "@/app/components/Container";
import EmptyState from "@/app/components/EmptyState";
import ListingCard from "@/app/components/listings/ListingCard";


export default async function ListingsPage() {
  const listings = await getListings();
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  // Fetch rooms for each listing
  const listingsWithRooms = await Promise.all(
    listings.map(async (listing: any) => {
      const rooms = await getRooms({ listingId: listing.id });
      return {
        ...listing,
        rooms,
      };
    })
  );

  return (
      <Container>
        <div
          className="
          pt-24
          pb-24
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-3
          gap-8
        "
        >
          {listingsWithRooms.map((listing: any) => (
            <ListingCard
              currentUser={currentUser}
              key={listing.id}
              data={listing}
              rooms={listing.rooms} // Pass rooms to ListingCard
            />
          ))}
        </div>
      </Container>
  );
}
