'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface DashboardActionsProps {
  path: string;
}

export default function DashboardActions({ path }: DashboardActionsProps) {
  const router = useRouter();

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => router.push(path)}
    >
      View All
    </Button>
  );
} 