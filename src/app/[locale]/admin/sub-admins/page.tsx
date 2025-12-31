"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import {
  Check, X, Shield, User as UserIcon, Search, Filter,
  MoreVertical, Mail, Phone, Calendar, Crown, Users, UserCheck,
  UserX, Clock, RefreshCw, ChevronDown, AlertCircle, Trash2,
  Edit2, Eye, CheckSquare, Square, Building2, Star, ArrowUpDown,
  UserPlus, Download, ShieldCheck, ShieldOff, Settings
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: "sub-admin";
  permissions: {
    canApproveUsers: boolean;
    canDeleteUsers: boolean;
    canManageListings: boolean;
    canViewBookings: boolean;
    canManageSettings: boolean;
    canAccessMaintenance: boolean;
    canPermanentDelete: boolean;
  };
  isApproved: boolean;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'createdAt' | 'name' | 'email';
type SortOrder = 'asc' | 'desc';

export default function SubAdminsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | null>(null);
  const [targetUser, setTargetUser] = useState<SubAdmin | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newSubAdmin, setNewSubAdmin] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    permissions: {
      canApproveUsers: false,
      canDeleteUsers: false,
      canManageListings: false,
      canViewBookings: false,
      canManageSettings: false,
    }
  });

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, mutate, isValidating } = useSWR<SubAdmin[]>(
    '/api/admin/sub-admins',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  );

  const subAdmins = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  // Client-side filtering and sorting
  const filteredSubAdmins = useMemo(() => {
    let filtered = [...subAdmins];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'createdAt':
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [subAdmins, searchQuery, sortField, sortOrder]);

  // Pagination
  const paginatedSubAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubAdmins.slice(start, start + pageSize);
  }, [filteredSubAdmins, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSubAdmins.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: subAdmins.length,
  }), [subAdmins]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedSubAdmins.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSubAdmins.map(u => u._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Action handlers
  const handleCreateSubAdmin = async () => {
    setActionLoading('create');
    try {
      const res = await fetch("/api/admin/sub-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubAdmin),
      });
      if (res.ok) {
        await mutate();
        setShowCreateForm(false);
        setNewSubAdmin({
          email: '',
          password: '',
          name: '',
          phone: '',
          permissions: {
            canApproveUsers: false,
            canDeleteUsers: false,
            canManageListings: false,
            canViewBookings: false,
            canManageSettings: false,
          }
        });
      } else {
        const data = await res.json();
        alert('Failed to create sub-admin: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to create sub-admin", error);
      alert('Failed to create sub-admin');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePermissions = async (subAdminId: string, permissions: any) => {
    setActionLoading(subAdminId);
    try {
      const res = await fetch("/api/admin/sub-admins/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subAdminId, permissions }),
      });
      if (res.ok) {
        await mutate();
        setEditingPermissions(null);
      } else {
        const data = await res.json();
        alert('Failed to update permissions: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to update permissions", error);
      alert('Failed to update permissions');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!targetUser) return;
    setActionLoading(targetUser._id);
    try {
      const res = await fetch('/api/admin/sub-admins/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subAdminId: targetUser._id }),
      });
      if (res.ok) {
        await mutate();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUser._id);
          return newSet;
        });
      } else {
        const data = await res.json();
        alert('Failed to delete: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error('Failed to delete sub-admin', error);
      alert('Failed to delete sub-admin');
    } finally {
      setConfirmOpen(false);
      setTargetUser(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1C1C]">{stats.total}</p>
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
                  value={newSubAdmin.name}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newSubAdmin.email}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newSubAdmin.password}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newSubAdmin.phone}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-2">
                  <PermissionToggle
                    permission="Approve Users"
                    value={newSubAdmin.permissions.canApproveUsers}
                    onChange={(value) => setNewSubAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canApproveUsers: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Delete Users"
                    value={newSubAdmin.permissions.canDeleteUsers}
                    onChange={(value) => setNewSubAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canDeleteUsers: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Manage Listings"
                    value={newSubAdmin.permissions.canManageListings}
                    onChange={(value) => setNewSubAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canManageListings: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="View Bookings"
                    value={newSubAdmin.permissions.canViewBookings}
                    onChange={(value) => setNewSubAdmin(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canViewBookings: value }
                    }))}
                  />
                  <PermissionToggle
                    permission="Manage Settings"
                    value={newSubAdmin.permissions.canManageSettings}
                    onChange={(value) => setNewSubAdmin(prev => ({
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
                onClick={handleCreateSubAdmin}
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
                placeholder="Search sub-admins..."
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
                    checked={selectedIds.size === paginatedSubAdmins.length && paginatedSubAdmins.length > 0}
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
              {paginatedSubAdmins.map((subAdmin) => (
                <tr key={subAdmin._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(subAdmin._id)}
                      onChange={() => toggleSelect(subAdmin._id)}
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {subAdmin.image ? (
                          <Image
                            src={subAdmin.image}
                            alt={subAdmin.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{subAdmin.name}</div>
                        <div className="text-sm text-gray-500">{subAdmin.email}</div>
                        {subAdmin.phone && (
                          <div className="text-sm text-gray-500">{subAdmin.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(subAdmin.permissions).map(([key, value]) => {
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
                    {format(new Date(subAdmin.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPermissions(subAdmin._id)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTargetUser(subAdmin);
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
                const subAdmin = subAdmins.find(s => s._id === editingPermissions);
                if (!subAdmin) return null;

                return (
                  <div className="space-y-3">
                    <PermissionToggle
                      permission="Approve Users"
                      value={subAdmin.permissions.canApproveUsers}
                      onChange={(value) => {
                        const updated = { ...subAdmin.permissions, canApproveUsers: value };
                        handleUpdatePermissions(subAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Delete Users"
                      value={subAdmin.permissions.canDeleteUsers}
                      onChange={(value) => {
                        const updated = { ...subAdmin.permissions, canDeleteUsers: value };
                        handleUpdatePermissions(subAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Manage Listings"
                      value={subAdmin.permissions.canManageListings}
                      onChange={(value) => {
                        const updated = { ...subAdmin.permissions, canManageListings: value };
                        handleUpdatePermissions(subAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="View Bookings"
                      value={subAdmin.permissions.canViewBookings}
                      onChange={(value) => {
                        const updated = { ...subAdmin.permissions, canViewBookings: value };
                        handleUpdatePermissions(subAdmin._id, updated);
                      }}
                    />
                    <PermissionToggle
                      permission="Manage Settings"
                      value={subAdmin.permissions.canManageSettings}
                      onChange={(value) => {
                        const updated = { ...subAdmin.permissions, canManageSettings: value };
                        handleUpdatePermissions(subAdmin._id, updated);
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredSubAdmins.length)} of {filteredSubAdmins.length} results
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

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Web Admin"
        message={`Are you sure you want to delete ${targetUser?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetUser(null);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}