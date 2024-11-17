import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  try {
    const amenities = await prisma.propertyAmenity.findMany();
    return NextResponse.json(amenities);
  } catch (error) {
    return NextResponse.error();
  }
} 