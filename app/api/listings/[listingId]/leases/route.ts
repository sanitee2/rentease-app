import { NextResponse } from 'next/server';
import getLease from '@/app/actions/getLease';

export async function GET(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const leases = await getLease(params.listingId);
    return NextResponse.json(leases);
  } catch (error) {
    console.error('[LEASES]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 