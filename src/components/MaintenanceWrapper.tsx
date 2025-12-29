"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MaintenanceScreen from "@/components/admin/MaintenanceScreen";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { data: settings, isLoading } = useSWR('/api/settings', fetcher);

  // Don't show maintenance screen for admin routes if user is admin, or for auth routes
  const isAdminRoute = pathname.startsWith('/admin') || pathname.includes('/admin');
  const isAuthRoute = pathname.startsWith('/auth') || pathname.includes('/auth');
  const isAdminUser = session?.user?.role === 'admin';

  const isMaintenanceMode = settings?.security?.maintenanceMode === true;

  // Show maintenance screen if:
  // 1. Maintenance mode is on
  // 2. Not on admin routes (for admin users) OR not on auth routes (for everyone)
  // 3. Session and settings have loaded (to avoid flash)
  if (!isLoading && status !== 'loading' && isMaintenanceMode && !isAuthRoute && (!isAdminUser || !isAdminRoute)) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}