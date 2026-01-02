"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import {
  Users, Building2, Calendar, BookOpen, BarChart3,
  Search, Filter, MoreVertical, Eye, Edit2, CheckCircle,
  XCircle, UserCheck, UserX, Home, MapPin, Star,
  DollarSign, TrendingUp, Activity, Settings, ShieldCheck, UserPlus, UserIcon, Trash2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: "host" | "guest" | "sub-admin" | "admin";
  permissions?: {
    canApproveUsers?: boolean;
    canDeleteUsers?: boolean;
    canManageListings?: boolean;
    canViewBookings?: boolean;
    canManageSettings?: boolean;
    canAccessMaintenance?: boolean;
    canPermanentDelete?: boolean;
  };
  isApproved: boolean;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  _id: string;
  title: string;
  location: string;
  host: {
    name: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected";
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;
  property: {
    title: string;
  };
  guest: {
    name: string;
    email: string;
  };
  host: {
    name: string;
    email: string;
  };
  checkIn: string;
  checkOut: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
  createdAt: string;
}

type TabType = 'overview' | 'users' | 'listings' | 'bookings' | 'manage';
type SortField = 'name' | 'email' | 'createdAt' | 'isApproved';
type SortOrder = 'asc' | 'desc';

export default function WebAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [newWebAdmin, setNewWebAdmin] = useState({ name: '', email: '', password: '', phone: '', permissions: { canApproveUsers: false, canDeleteUsers: false, canManageListings: false, canViewBookings: false, canManageSettings: false, canAccessMaintenance: false, canPermanentDelete: false } });

  const handleCreateWebAdmin = async () => {
    // TODO: implement create flow
  };

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Fetch data based on active tab
  const { data: usersData, error: usersError, mutate: mutateUsers } = useSWR<User[]>(
    '/api/admin/users',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const { data: propertiesData, error: propertiesError, mutate: mutateProperties } = useSWR<Property[]>(
    activeTab === 'listings' ? '/api/properties?all=1' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const { data: bookingsData, error: bookingsError, mutate: mutateBookings } = useSWR<Booking[]>(
    activeTab === 'bookings' ? '/api/admin/bookings' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  // Stats for overview
  const stats = useMemo(() => {
    const users = usersData || [];
    const properties = propertiesData || [];
    const bookings = bookingsData || [];

    return {
      totalUsers: users.length,
      approvedUsers: users.filter(u => u.isApproved).length,
      pendingUsers: users.filter(u => !u.isApproved).length,
      totalListings: properties.length,
      approvedListings: properties.filter(p => p.status === 'approved').length,
      pendingListings: properties.filter(p => p.status === 'pending').length,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
    };
  }, [usersData, propertiesData, bookingsData]);

  // Filtered data based on active tab
  const filteredData = useMemo(() => {
    let data: any[] = [];
    let searchFields: string[] = [];

    switch (activeTab) {
      case 'users':
        data = usersData || [];
        searchFields = ['name', 'email', 'phone'];
        break;
      case 'listings':
        data = propertiesData || [];
        searchFields = ['title', 'location', 'host.name', 'host.email'];
        break;
      case 'bookings':
        data = bookingsData || [];
        searchFields = ['property.title', 'guest.name', 'guest.email', 'host.name', 'host.email'];
        break;
      default:
        return [];
    }

    let filtered = [...data];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        return searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toLowerCase().includes(query);
        });
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const status = item.status || item.isApproved;
        return status === (statusFilter === 'approved' || statusFilter === 'confirmed');
      });
    }

    return filtered;
  }, [activeTab, usersData, propertiesData, bookingsData, searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (0) * 50; // Simple pagination, show all for now
    return filteredData.slice(start, start + 50);
  }, [filteredData]);

  // Action handlers
  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        mutateUsers();
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      console.error('Failed to approve user', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveListing = async (propertyId: string) => {
    setActionLoading(propertyId);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        mutateProperties();
      } else {
        alert('Failed to approve listing');
      }
    } catch (error) {
      console.error('Failed to approve listing', error);
      alert('Failed to approve listing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        mutateBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Failed to update booking status', error);
      alert('Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: any) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (res.ok) {
        mutateUsers();
      } else {
        alert('Failed to update permissions');
      }
    } catch (error) {
      console.error('Failed to update permissions', error);
      alert('Failed to update permissions');
    } finally {
      setActionLoading(null);
      setEditingPermissions(null);
    }
  };

    const handleDelete = async () => {
      if (!targetItem) return;
      const id = targetItem._id;
      setActionLoading(id);
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          mutateUsers();
          setConfirmOpen(false);
          setTargetItem(null);
        } else {
          alert('Failed to delete web admin');
        }
      } catch (error) {
        console.error('Failed to delete web admin', error);
        alert('Failed to delete web admin');
      } finally {
        setActionLoading(null);
      }
    };

  const getRoleBadge = (role: string) => {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <ShieldCheck className="w-3 h-3" /> Web Admin
      </span>
    );
  };

  const PermissionToggle = ({ permission, value, onChange }: { permission: string, value: boolean, onChange: (value: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
      />
      <span className="text-sm text-gray-700">{permission}</span>
    </label>
  );

  // Derived lists for manage tab
  const filteredWebAdmins = useMemo(() => {
    const data = usersData || [];
    // Treat both main admins and sub-admins as web-admins for management
    let list = data.filter(u => u.role === 'sub-admin' || u.role === 'admin');
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(w => (w.name || '').toLowerCase().includes(q) || (w.email || '').toLowerCase().includes(q));
    }
    // sort
    list.sort((a: any, b: any) => {
      const field = sortField as string;
      let av = a[field];
      let bv = b[field];
      if (field === 'createdAt') {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      }
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av === bv) return 0;
      if (sortOrder === 'asc') return av > bv ? 1 : -1;
      return av > bv ? -1 : 1;
    });
    return list;
  }, [usersData, searchQuery, sortField, sortOrder]);

  const paginatedWebAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWebAdmins.slice(start, start + pageSize);
  }, [filteredWebAdmins, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredWebAdmins.length / pageSize));

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedWebAdmins.length && paginatedWebAdmins.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedWebAdmins.map(w => w._id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white rounded-xl p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'overview' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'manage' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
          >
            Manage Web Admins
          </button>
        </div>
        <div>
          <button
            onClick={() => { setActiveTab('manage'); setShowCreateForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9690] text-white rounded-lg hover:bg-[#0A7A75] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Web Admin
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">Total Web Admins</p>
              <p className="text-2xl font-bold mt-2">{(usersData || []).filter(u => u.role === 'sub-admin' || u.role === 'admin').length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold mt-2">{(usersData || []).filter(u => (u.role === 'sub-admin' || u.role === 'admin') && u.isApproved).length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">Recent Web Admins</p>
              <div className="mt-3 space-y-2">
                {(usersData || []).filter(u => u.role === 'sub-admin' || u.role === 'admin').slice(0,5).length === 0 ? (
                  <p className="text-sm text-gray-400">No web admins yet</p>
                ) : (
                  (usersData || []).filter(u => u.role === 'sub-admin' || u.role === 'admin').slice(0,5).map(w => (
                    <div key={w._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {w.image ? (
                            <Image src={w.image} alt={w.name} width={32} height={32} className="rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{w.name}</div>
                          <div className="text-xs text-gray-500">{w.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('manage')} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Manage Web Admins</button>
              <button onClick={() => { setActiveTab('manage'); setShowCreateForm(true); }} className="px-4 py-2 border rounded-lg">Create Web Admin</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Web Administrators</h1>
          <p className="text-gray-600 mt-1">Manage web-admin accounts and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9690] text-white rounded-lg hover:bg-[#0A7A75] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Web Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1C1C]">{(usersData || []).filter(u => u.role === 'sub-admin' || u.role === 'admin').length}</p>
              <p className="text-sm text-gray-600">Total Web Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Web Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newWebAdmin.name}
                  onChange={(e) => setNewWebAdmin(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newWebAdmin.email}
                  onChange={(e) => setNewWebAdmin(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newWebAdmin.password}
                  onChange={(e) => setNewWebAdmin(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newWebAdmin.phone}
                  onChange={(e) => setNewWebAdmin(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-2">
                  <PermissionToggle
                    permission="Approve Users"
                    value={newWebAdmin.permissions.canApproveUsers}
                    onChange={(value) => setNewWebAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canApproveUsers: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Delete Users"
                    value={newWebAdmin.permissions.canDeleteUsers}
                    onChange={(value) => setNewWebAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canDeleteUsers: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Manage Listings"
                    value={newWebAdmin.permissions.canManageListings}
                    onChange={(value) => setNewWebAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canManageListings: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="View Bookings"
                    value={newWebAdmin.permissions.canViewBookings}
                    onChange={(value) => setNewWebAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canViewBookings: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Manage Settings"
                    value={newWebAdmin.permissions.canManageSettings}
                    onChange={(value) => setNewWebAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canManageSettings: value }
                    }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebAdmin}
                disabled={actionLoading === 'create'}
                className="flex-1 px-4 py-2 bg-[#0F9690] text-white rounded-lg hover:bg-[#0A7A75] disabled:opacity-50"
              >
                {actionLoading === 'create' ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search web-admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortOrder(order as SortOrder);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedWebAdmins.length && paginatedWebAdmins.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedWebAdmins.map((webAdmin) => (
                <tr key={webAdmin._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(webAdmin._id)}
                      onChange={() => toggleSelect(webAdmin._id)}
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {webAdmin.image ? (
                          <Image
                            src={webAdmin.image}
                            alt={webAdmin.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{webAdmin.name}</div>
                        <div className="text-sm text-gray-500">{webAdmin.email}</div>
                        {webAdmin.phone && (
                          <div className="text-sm text-gray-500">{webAdmin.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(webAdmin.permissions ?? {}).map(([key, value]) => {
                        if (!value) return null;
                        const labels: Record<string, string> = {
                          canApproveUsers: 'Users',
                          canDeleteUsers: 'Delete',
                          canManageListings: 'Listings',
                          canViewBookings: 'Bookings',
                          canManageSettings: 'Settings',
                        };
                        return (
                          <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {labels[key]}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(webAdmin.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPermissions(webAdmin._id)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTargetItem(webAdmin);
                          setConfirmOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions Edit Modal */}
        {editingPermissions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Permissions</h2>
              {(() => {
                const webAdmin = filteredWebAdmins.find(s => s._id === editingPermissions);
                if (!webAdmin) return null;

                return (
                  <div className="space-y-3">
                    <PermissionToggle
                      permission="Approve Users"
                      value={!!webAdmin.permissions?.canApproveUsers}
                      onChange={(value) => {
                        const updated = { ...webAdmin.permissions, canApproveUsers: value };
                        handleUpdatePermissions(webAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Delete Users"
                      value={!!webAdmin.permissions?.canDeleteUsers}
                      onChange={(value) => {
                        const updated = { ...webAdmin.permissions, canDeleteUsers: value };
                        handleUpdatePermissions(webAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Manage Listings"
                      value={!!webAdmin.permissions?.canManageListings}
                      onChange={(value) => {
                        const updated = { ...webAdmin.permissions, canManageListings: value };
                        handleUpdatePermissions(webAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="View Bookings"
                      value={!!webAdmin.permissions?.canViewBookings}
                      onChange={(value) => {
                        const updated = { ...webAdmin.permissions, canViewBookings: value };
                        handleUpdatePermissions(webAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Manage Settings"
                      value={!!webAdmin.permissions?.canManageSettings}
                      onChange={(value) => {
                        const updated = { ...webAdmin.permissions, canManageSettings: value };
                        handleUpdatePermissions(webAdmin._id, updated);
                      }}
                    />
                  </div>
                );
              })()}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setEditingPermissions(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredWebAdmins.length)} of {filteredWebAdmins.length} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Web Admin"
        message={`Are you sure you want to delete ${targetItem?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetItem(null);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
