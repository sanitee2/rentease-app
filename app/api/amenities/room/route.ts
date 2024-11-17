import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  try {
    const amenities = await prisma.roomAmenity.findMany();
    return NextResponse.json(amenities);
  } catch (error) {
    console.error('Error fetching room amenities:', error);
    return NextResponse.error();
  }
} 