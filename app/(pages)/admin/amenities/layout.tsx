import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentease - Admin Amenities',
  description: 'Manage system amenities',
}

export default function AmenitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 