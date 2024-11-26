import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentease - Admin Categories',
  description: 'Manage system categories',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 