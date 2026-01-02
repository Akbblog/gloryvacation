"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect } from "react";
import { Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { data, mutate, isValidating } = useSWR('/api/notifications?limit=100', fetcher);
    const notifications = data?.notifications || [];

    useEffect(() => {
        // initial fetch handled by SWR
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true }),
            });
            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter((n: any) => !n.isRead).map((n: any) => n._id);
            if (!unreadIds.length) return;
            await fetch('/api/notifications/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'markAsRead', notificationIds: unreadIds }),
            });
            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            mutate();
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <div className="flex items-center gap-3">
                    <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800">Mark all read</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map((n: any) => (
                            <div key={n._id} className={cn("p-4 flex items-start justify-between gap-4", !n.isRead && "bg-blue-50/50")}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-medium text-gray-900">{n.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{n.message}</p>
                                    <p className="text-xs text-gray-400">{formatTime(n.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!n.isRead && (
                                        <button onClick={() => markAsRead(n._id)} className="text-blue-600 hover:text-blue-800 p-1" title="Mark as read">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotification(n._id)} className="text-red-600 hover:text-red-800 p-1" title="Delete notification">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
