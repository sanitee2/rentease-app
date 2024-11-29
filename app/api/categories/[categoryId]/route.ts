import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {

    const category = await prisma.listingCategories.findFirst({
      where: {
        title: params.categoryId
      }
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 