import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAdminListings from "@/app/actions/getAdminListings";
import { ListingStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Check admin authorization
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ListingStatus | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;

    const result = await getAdminListings({
      status,
      page,
      limit,
      search
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ADMIN_LISTINGS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}