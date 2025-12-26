"use client";

import useSWR from 'swr';
import { useMemo, useState, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
    Eye, Check, MessageSquare, X, RefreshCcw, Filter, Search,
    Download, Trash2, ChevronDown, Mail, Phone, Calendar,
    ArrowUpDown, MoreHorizontal, CheckSquare, Square, AlertTriangle,
    ExternalLink, Clock, Users
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ReservationStats from '@/components/admin/ReservationStats';
import ReservationDetailModal from '@/components/admin/ReservationDetailModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Reservation {
    _id: string;
    property?: {
        _id: string;
        title: string;
        images?: string[];
        location?: { area?: string; city?: string };
        pricePerNight?: number;
    };
    user?: { _id: string; name: string; email: string };
    guestDetails?: {
        name: string;
        email: string;
        phone?: string;
        nationality?: string;
        specialRequests?: string;
    };
    checkIn: string;
    checkOut?: string;
    durationNights?: number;
    guests: number;
    notes?: string;
    status: string;
    priority?: string;
    adminNotes?: string;
    internalTags?: string[];
    statusHistory?: { status: string; changedAt: string; note?: string }[];
    totalAmount?: number;
    currency?: string;
    emailCount?: number;
    lastEmailSent?: string;
    createdAt: string;
    updatedAt: string;
}

interface StatsData {
    total: number;
    recentCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
}

const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700", dotColor: "bg-amber-500" },
    { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500" },
    { value: "approved", label: "Approved", color: "bg-green-100 text-green-700", dotColor: "bg-green-500" },
    { value: "confirmed", label: "Confirmed", color: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700", dotColor: "bg-red-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-700", dotColor: "bg-gray-500" },
];

const priorityOptions = [
    { value: "low", label: "Low", color: "text-gray-500" },
    { value: "normal", label: "Normal", color: "text-blue-500" },
    { value: "high", label: "High", color: "text-orange-500" },
    { value: "urgent", label: "Urgent", color: "text-red-500" },
];

export default function AdminReservationsPage() {
    // Filters & Search
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // Selection & Modals
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Build API URL
    const buildApiUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (priorityFilter !== 'all') params.set('priority', priorityFilter);
        if (searchQuery) params.set('search', searchQuery);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        return `/api/admin/reservations?${params.toString()}`;
    }, [statusFilter, priorityFilter, searchQuery, dateFrom, dateTo, sortBy, sortOrder]);

    // Fetch reservations
    const { data, mutate, isLoading } = useSWR<{ reservations: Reservation[]; pagination: { total: number } }>(
        buildApiUrl(),
        fetcher,
        { shouldRetryOnError: false, revalidateOnFocus: false }
    );

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useSWR<StatsData>(
        '/api/admin/reservations?stats=true',
        fetcher,
        { shouldRetryOnError: false, revalidateOnFocus: false }
    );

    const reservations = data?.reservations || [];

    // Quick status update
    const updateStatus = async (id: string, status: string, sendEmail = true) => {
        setLoadingId(id);
        try {
            const res = await fetch('/api/admin/reservations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId: id, status, sendEmailNotification: sendEmail }),
            });
            if (res.ok) {
                await mutate();
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update reservation');
        } finally {
            setLoadingId(null);
        }
    };

    // Full update from modal
    const handleModalUpdate = async (updates: Record<string, unknown>) => {
        setIsUpdating(true);
        try {
            const res = await fetch('/api/admin/reservations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) {
                await mutate();
                setSelectedReservation(null);
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update reservation');
        } finally {
            setIsUpdating(false);
        }
    };

    // Bulk actions
    const handleBulkAction = async (action: string, status?: string) => {
        if (selectedIds.length === 0) return;
        
        const confirmed = window.confirm(
            action === 'bulk_delete' 
                ? `Delete ${selectedIds.length} reservation(s)? This cannot be undone.`
                : `Update ${selectedIds.length} reservation(s) to ${status}?`
        );
        
        if (!confirmed) return;

        try {
            const res = await fetch('/api/admin/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    reservationIds: selectedIds,
                    status,
                    sendEmails: action === 'bulk_status_update',
                }),
            });
            
            if (res.ok) {
                await mutate();
                setSelectedIds([]);
                setShowBulkActions(false);
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Bulk operation failed');
            }
        } catch (err) {
            console.error(err);
            alert('Bulk operation failed');
        }
    };

    // Export to CSV
    const handleExport = () => {
        if (reservations.length === 0) return;
        
        const csvData = reservations.map(r => ({
            ID: r._id,
            Property: r.property?.title || 'N/A',
            Guest: r.guestDetails?.name || 'N/A',
            Email: r.guestDetails?.email || 'N/A',
            Phone: r.guestDetails?.phone || 'N/A',
            CheckIn: r.checkIn ? format(new Date(r.checkIn), 'yyyy-MM-dd') : 'N/A',
            CheckOut: r.checkOut ? format(new Date(r.checkOut), 'yyyy-MM-dd') : 'N/A',
            Guests: r.guests,
            Status: r.status,
            Priority: r.priority || 'normal',
            TotalAmount: r.totalAmount || '',
            Currency: r.currency || 'AED',
            Created: r.createdAt ? format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A',
        }));

        const headers = Object.keys(csvData[0]).join(',');
        const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    // Selection helpers
    const toggleSelectAll = () => {
        if (selectedIds.length === reservations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reservations.map(r => r._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Sort handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getStatusInfo = (status: string) => statusOptions.find(s => s.value === status) || statusOptions[0];
    const getPriorityInfo = (priority: string) => priorityOptions.find(p => p.value === priority) || priorityOptions[1];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and track all reservation requests
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => mutate()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={reservations.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <ReservationStats
                stats={statsData || null}
                isLoading={statsLoading}
                onFilterByStatus={setStatusFilter}
                activeStatus={statusFilter}
            />

            {/* Search & Filters Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by guest name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white text-sm"
                        >
                            <option value="all">All Priorities</option>
                            {priorityOptions.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>

                        {/* Toggle Advanced Filters */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-colors ${
                                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Check-in From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Check-in To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                    setSearchQuery('');
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            {selectedIds.length} reservation(s) selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Bulk Actions
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showBulkActions && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    {statusOptions.map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleBulkAction('bulk_status_update', status.value)}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                                            Set to {status.label}
                                        </button>
                                    ))}
                                    <hr className="my-2" />
                                    <button
                                        onClick={() => handleBulkAction('bulk_delete')}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-xl text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Reservations Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 w-12">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        {selectedIds.length === reservations.length && reservations.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-4 font-semibold text-gray-600">
                                    <button onClick={() => handleSort('property.title')} className="flex items-center gap-1 hover:text-gray-900">
                                        Property
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-4 font-semibold text-gray-600">Guest</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">
                                    <button onClick={() => handleSort('checkIn')} className="flex items-center gap-1 hover:text-gray-900">
                                        Dates
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">Priority</th>
                                <th className="px-4 py-4 font-semibold text-gray-600">
                                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-900">
                                        Created
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4"><div className="w-5 h-5 bg-gray-200 rounded" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                                        <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                                        <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-24" /></td>
                                    </tr>
                                ))
                            ) : reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No reservations found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                reservations.map((r) => {
                                    const statusInfo = getStatusInfo(r.status);
                                    const priorityInfo = getPriorityInfo(r.priority || 'normal');
                                    const isSelected = selectedIds.includes(r._id);
                                    const isLoadingThis = loadingId === r._id;

                                    return (
                                        <tr 
                                            key={r._id} 
                                            className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => toggleSelect(r._id)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="max-w-[200px]">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {r.property?.title || 'Property'}
                                                    </p>
                                                    {r.property?.location && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {r.property.location.area}, {r.property.location.city}
                                                        </p>
                                                    )}
                                                    {r.property?._id && (
                                                        <Link 
                                                            href={`/listings/${r.property._id}`} 
                                                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                                                            target="_blank"
                                                        >
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {r.guestDetails?.name || 'Guest'}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate max-w-[140px]">{r.guestDetails?.email}</span>
                                                    </div>
                                                    {r.guestDetails?.phone && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{r.guestDetails.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-gray-900">
                                                            {r.checkIn ? format(new Date(r.checkIn), 'MMM d, yyyy') : '-'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            to {r.checkOut ? format(new Date(r.checkOut), 'MMM d') : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Users className="w-3 h-3" />
                                                    {r.guests} guest{r.guests > 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {(r.priority === 'high' || r.priority === 'urgent') && (
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${priorityInfo.color}`}>
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {priorityInfo.label}
                                                    </span>
                                                )}
                                                {(!r.priority || r.priority === 'normal' || r.priority === 'low') && (
                                                    <span className="text-xs text-gray-400">{priorityInfo.label}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-gray-900">
                                                        {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '-'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {r.createdAt && formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    {/* Quick Actions */}
                                                    <button 
                                                        title="Mark Contacted" 
                                                        onClick={() => updateStatus(r._id, 'contacted')} 
                                                        disabled={isLoadingThis || r.status === 'contacted'}
                                                        className="p-2 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors disabled:opacity-50"
                                                    >
                                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button 
                                                        title="Approve" 
                                                        onClick={() => updateStatus(r._id, 'approved')} 
                                                        disabled={isLoadingThis || r.status === 'approved'}
                                                        className="p-2 bg-white border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors disabled:opacity-50"
                                                    >
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    </button>
                                                    <button 
                                                        title="Reject" 
                                                        onClick={() => updateStatus(r._id, 'rejected')} 
                                                        disabled={isLoadingThis || r.status === 'rejected'}
                                                        className="p-2 bg-white border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4 text-red-600" />
                                                    </button>
                                                    {/* View Details */}
                                                    <button 
                                                        title="View Details" 
                                                        onClick={() => setSelectedReservation(r)}
                                                        className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                {data?.pagination && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium">{reservations.length}</span> of{' '}
                            <span className="font-medium">{data.pagination.total}</span> reservations
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedReservation && (
                <ReservationDetailModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onUpdate={handleModalUpdate}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}
