"use client";

import { useEffect, useState } from "react";
import { Check, X, Shield, User as UserIcon } from "lucide-react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "guest" | "host" | "admin";
    isApproved: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            const res = await fetch("/api/admin/users/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                // Update UI optimistically or refetch
                setUsers((prev) =>
                    prev.map((u) => (u._id === userId ? { ...u, isApproved: true } : u))
                );
            }
        } catch (error) {
            console.error("Failed to approve user", error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Delete this user and related data?')) return;
        try {
            const res = await fetch('/api/admin/users/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u._id !== userId));
            } else {
                const data = await res.json();
                console.error('Delete failed', data);
                alert('Failed to delete user: ' + (data?.message || res.status));
            }
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">User Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                                ? "bg-purple-100 text-purple-700"
                                                : user.role === "host"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.isApproved ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <Check className="w-3 h-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                            <Shield className="w-3 h-3" />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                        {!user.isApproved && (
                                            <button
                                                onClick={() => handleApprove(user._id)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-12 text-center text-gray-400">No users found.</div>
                )}
            </div>
        </div>
    );
}
