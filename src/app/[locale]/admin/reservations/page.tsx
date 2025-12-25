"use client";

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Eye, Check, MessageSquare, X, RefreshCcw, Filter } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminReservationsPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const apiKey = statusFilter === 'all' ? '/api/admin/reservations' : `/api/admin/reservations?status=${statusFilter}`;
    const { data: reservations, mutate, isLoading } = useSWR(apiKey, fetcher, { shouldRetryOnError: false });
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const updateStatus = async (id: string, status: string) => {
        setLoadingId(id);
        try {
            const res = await fetch('/api/admin/reservations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId: id, status }),
            });
            if (res.ok) await mutate();
        } catch (err) {
            console.error(err);
            alert('Failed to update reservation');
        } finally {
            setLoadingId(null);
        }
    };

    const filtered = useMemo(() => reservations || [], [reservations]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Reservations</h1>
                    <p className="text-sm text-gray-500">Track incoming reservation requests and respond quickly.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm bg-transparent outline-none"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <button
                        onClick={() => mutate()}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Property</th>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Guest</th>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Dates</th>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Status</th>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Created</th>
                                <th className="px-6 py-4 font-semibold text-[#7E7E7E]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(!filtered || filtered.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#7E7E7E]">No reservations found</td>
                                </tr>
                            ) : (
                                filtered.map((r: any) => (
                                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#1C1C1C]">{r.property?.title || 'Property'}</div>
                                            {r.property?._id && (
                                                <Link href={`/listings/${r.property._id}`} className="text-xs text-primary hover:underline" target="_blank">
                                                    View listing
                                                </Link>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{r.guestDetails?.name || r.user?.name || 'Guest'}</div>
                                            <div className="text-xs text-[#7E7E7E]">{r.guestDetails?.email || r.user?.email}</div>
                                            {r.guestDetails?.phone && (
                                                <div className="text-xs text-[#7E7E7E]">{r.guestDetails.phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[#7E7E7E]">
                                            <div>{r.checkIn ? format(new Date(r.checkIn), 'MMM d, yyyy') : '-'}</div>
                                            <div className="text-xs">to {r.checkOut ? format(new Date(r.checkOut), 'MMM d, yyyy') : '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : r.status === 'contacted' ? 'bg-blue-100 text-blue-700' : r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#7E7E7E]">
                                            {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button title="Mark contacted" onClick={() => updateStatus(r._id, 'contacted')} disabled={loadingId === r._id} className="p-2 bg-white border rounded-lg">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button title="Approve" onClick={() => updateStatus(r._id, 'approved')} disabled={loadingId === r._id} className="p-2 bg-white border rounded-lg">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                </button>
                                                <button title="Reject" onClick={() => updateStatus(r._id, 'rejected')} disabled={loadingId === r._id} className="p-2 bg-white border rounded-lg">
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                                {r.property?._id && (
                                                    <Link href={`/listings/${r.property._id}`} target="_blank" className="p-2 bg-white border rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
