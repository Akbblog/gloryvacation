"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MaintenanceScreen from "@/components/admin/MaintenanceScreen";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    // Load maintenance mode from localStorage
    const maintenance = localStorage.getItem('site-maintenance-mode') === 'true';
    setIsMaintenanceMode(maintenance);
  }, []);

  // Don't show maintenance screen for admin routes if user is admin
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminUser = session?.user?.role === 'admin';

  // Show maintenance screen if:
  // 1. Maintenance mode is on
  // 2. User is not admin OR not on admin route
  // 3. Session has loaded (to avoid flash)
  if (isMaintenanceMode && status !== 'loading' && (!isAdminUser || !isAdminRoute)) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}