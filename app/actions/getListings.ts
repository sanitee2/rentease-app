import { headers } from 'next/headers';

export default async function getListings(params: {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  pricingType?: string;
  genderRestriction?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}) {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      pricingType,
      genderRestriction,
      lat,
      lng,
      radius
    } = params;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (minPrice) {
      query.minPrice = minPrice;
    }

    if (maxPrice) {
      query.maxPrice = maxPrice;
    }

    if (pricingType) {
      query.pricingType = pricingType;
    }

    if (genderRestriction) {
      query.genderRestriction = genderRestriction;
    }

    // Add location parameters if they exist
    if (lat && lng && radius) {
      query.lat = lat;
      query.lng = lng;
      query.radius = radius;
    }

    // Get the host from headers
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    const searchParams = new URLSearchParams(query);
    const apiUrl = `${protocol}://${host}/api/listings?${searchParams}`;
    
    const listings = await fetch(apiUrl, {
      cache: 'no-store'
    });
    
    return listings.json();
  } catch (error: any) {
    console.error('Listings fetch error:', error);
    throw new Error('Failed to fetch listings');
  }
}
