"use client";

import { AdminSidebar, MobileAdminHeader } from "@/components/admin/Sidebar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Redirect sub-admins (web-admins) from the admin root to /admin/web-admins
        if (!pathname) return;
        if (!pathname.endsWith('/admin')) return;
        if (!session || !session.user) return;
        const role = session.user.role;
        if (role === 'sub-admin') {
            // preserve locale in path (e.g. /en/admin -> /en/admin/web-admins)
            router.replace(`${pathname}/web-admins`);
        }
    }, [pathname, session, router]);

    return (
        <div className="flex min-h-screen bg-[#F9FAFB]">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} basePath="/web-admin" />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileAdminHeader onMenuClick={() => setSidebarOpen(true)} basePath="/web-admin" />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
