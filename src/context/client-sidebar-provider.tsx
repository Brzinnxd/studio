'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';

export function ClientSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
