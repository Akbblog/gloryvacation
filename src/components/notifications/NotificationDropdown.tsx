"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    createdAt: string;
    relatedType?: string;
}

interface NotificationDropdownProps {
    className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, mutate } = useSWR('/api/notifications?limit=10', fetcher, {
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    useEffect(() => {
        if (data) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        }
    }, [data]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true }),
            });
            mutate(); // Refresh data
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            if (unreadIds.length === 0) return;

            await fetch('/api/notifications/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'markAsRead',
                    notificationIds: unreadIds,
                }),
            });
            mutate(); // Refresh data
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
            });
            mutate(); // Refresh data
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600 bg-green-50 border-green-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
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
        <div className={cn("relative", className)} ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={cn(
                                        "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                                        !notification.isRead && "bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "inline-block w-2 h-2 rounded-full",
                                                    notification.type === 'success' && "bg-green-500",
                                                    notification.type === 'warning' && "bg-yellow-500",
                                                    notification.type === 'error' && "bg-red-500",
                                                    notification.type === 'info' && "bg-blue-500"
                                                )} />
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}