"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import { 
  Check, X, Shield, User as UserIcon, Search, Filter, 
  MoreVertical, Mail, Phone, Calendar, Crown, Users, UserCheck,
  UserX, Clock, RefreshCw, ChevronDown, AlertCircle, Trash2,
  Edit2, Eye, CheckSquare, Square, Building2, Star, ArrowUpDown,
  UserPlus, Download, ShieldCheck, ShieldOff
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
  role: "guest" | "host" | "admin" | "sub-admin";
  permissions?: {
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

type StatusFilter = 'all' | 'approved' | 'pending';
type RoleFilter = 'all' | 'guest' | 'host' | 'admin' | 'sub-admin';
type SortField = 'createdAt' | 'name' | 'email' | 'role';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'approve' | null>(null);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, mutate, isValidating } = useSWR<User[]>(
    '/api/admin/users', 
    fetcher, 
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000 
    }
  );

  const users = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    // Hide the primary admin account from the users tab
    return data.filter(u => (u.email || '').toLowerCase() !== 'akb@tool.com');
  }, [data]);

  // Client-side filtering and sorting
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter(u => u.isApproved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(u => !u.isApproved);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
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
        case 'role':
          const roleOrder = { admin: 0, 'sub-admin': 1, host: 2, guest: 3 };
          aVal = roleOrder[a.role];
          bVal = roleOrder[b.role];
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
  }, [users, searchQuery, statusFilter, roleFilter, sortField, sortOrder]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    approved: users.filter(u => u.isApproved).length,
    pending: users.filter(u => !u.isApproved).length,
    guests: users.filter(u => u.role === 'guest').length,
    hosts: users.filter(u => u.role === 'host').length,
    admins: users.filter(u => u.role === 'admin').length,
    subAdmins: users.filter(u => u.role === 'sub-admin').length,
  }), [users]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map(u => u._id)));
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
  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to approve: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to approve user", error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, revoke: true }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to revoke: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to revoke user", error);
      alert('Failed to revoke approval');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        await mutate();
        setEditingRole(null);
      } else {
        const data = await res.json();
        alert('Failed to update role: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to update role", error);
      alert('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!targetUser) return;
    setActionLoading(targetUser._id);
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser._id }),
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
      console.error('Failed to delete user', error);
      alert('Failed to delete user');
    } finally {
      setConfirmOpen(false);
      setTargetUser(null);
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    const ids = Array.from(selectedIds);
    
    for (const id of ids) {
      try {
        if (bulkAction === 'delete') {
          await fetch('/api/admin/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id }),
          });
        } else if (bulkAction === 'approve') {
          await fetch('/api/admin/users/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id }),
          });
        }
      } catch (e) {
        console.error(`Failed to ${bulkAction} user ${id}`, e);
      }
    }
    
    await mutate();
    setSelectedIds(new Set());
    setBulkActionOpen(false);
    setBulkAction(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            <Crown className="w-3 h-3" /> Admin
          </span>
        );
      case 'sub-admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <ShieldCheck className="w-3 h-3" /> Web Admin
          </span>
        );
      case 'host':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <Building2 className="w-3 h-3" /> Host
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <UserIcon className="w-3 h-3" /> Guest
          </span>
        );
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckSquare className="w-3 h-3" /> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-red-800 font-semibold">Error loading users</h2>
              <p className="text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
          <button
            onClick={() => mutate()}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isValidating && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <button
          onClick={() => { setStatusFilter('all'); setRoleFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'all' && roleFilter === 'all'
              ? "border-teal-500 bg-teal-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Users</p>
        </button>

        <button
          onClick={() => { setStatusFilter('approved'); setRoleFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'approved' && roleFilter === 'all'
              ? "border-green-500 bg-green-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <UserCheck className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{stats.approved}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Approved</p>
        </button>

        <button
          onClick={() => { setStatusFilter('pending'); setRoleFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'pending' && roleFilter === 'all'
              ? "border-amber-500 bg-amber-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Pending</p>
        </button>

        <button
          onClick={() => { setRoleFilter('guest'); setStatusFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            roleFilter === 'guest'
              ? "border-gray-500 bg-gray-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-600">{stats.guests}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Guests</p>
        </button>

        <button
          onClick={() => { setRoleFilter('host'); setStatusFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            roleFilter === 'host'
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">{stats.hosts}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Hosts</p>
        </button>

        <button
          onClick={() => { setRoleFilter('admin'); setStatusFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            roleFilter === 'admin'
              ? "border-purple-500 bg-purple-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Crown className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{stats.admins}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Admins</p>
        </button>

        <button
          onClick={() => { setRoleFilter('sub-admin'); setStatusFilter('all'); setCurrentPage(1); }}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            roleFilter === 'sub-admin'
              ? "border-blue-500 bg-blue-50"
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">{stats.subAdmins}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Web Admins</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as RoleFilter); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Roles</option>
              <option value="guest">Guest</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
              >
                <option value="createdAt">Date Joined</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.size} {selectedIds.size === 1 ? 'user' : 'users'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear selection
              </button>
              <button
                onClick={() => { setBulkAction('approve'); setBulkActionOpen(true); }}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Approve All
              </button>
              <button
                onClick={() => { setBulkAction('delete'); setBulkActionOpen(true); }}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {paginatedUsers.length} of {filteredUsers.length} users
          {filteredUsers.length !== users.length && ` (filtered from ${users.length})`}
        </span>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 border border-gray-200 rounded-md text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {!data ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-teal-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => (
                  <tr 
                    key={user._id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      selectedIds.has(user._id) && "bg-teal-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(user._id)} className="p-1">
                        {selectedIds.has(user._id) ? (
                          <CheckSquare className="w-5 h-5 text-teal-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                          {user.image ? (
                            <Image src={user.image} alt={user.name} width={40} height={40} className="object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingRole === user._id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          onBlur={() => setEditingRole(null)}
                          autoFocus
                          className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          disabled={actionLoading === user._id}
                        >
                          <option value="guest">Guest</option>
                          <option value="host">Host</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingRole(user._id)}
                          className="hover:opacity-80 transition-opacity"
                          title="Click to change role"
                        >
                          {getRoleBadge(user.role)}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(user.isApproved)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span title={format(new Date(user.createdAt), 'PPpp')}>
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!user.isApproved ? (
                          <button
                            onClick={() => handleApprove(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve user"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevoke(user._id)}
                            disabled={actionLoading === user._id}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Revoke approval"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setTargetUser(user);
                            setConfirmOpen(true);
                          }}
                          disabled={user.role === 'admin'}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={user.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
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

          {paginatedUsers.length === 0 && (
            <div className="p-12 text-center">
              <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No users found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'No users have registered yet'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                    currentPage === pageNum
                      ? "bg-teal-500 text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Last
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={`Delete "${targetUser?.name}"?`}
        message="This will permanently remove the user and all their related data including properties, bookings, and reviews. This action cannot be undone."
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setTargetUser(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmModal
        open={bulkActionOpen}
        title={bulkAction === 'delete' ? `Delete ${selectedIds.size} users?` : `Approve ${selectedIds.size} users?`}
        message={bulkAction === 'delete' 
          ? "This will permanently remove all selected users and their related data. This action cannot be undone."
          : "This will approve all selected users and grant them access to the platform."
        }
        confirmLabel={bulkAction === 'delete' ? 'Delete All' : 'Approve All'}
        cancelLabel="Cancel"
        onCancel={() => {
          setBulkActionOpen(false);
          setBulkAction(null);
        }}
        onConfirm={handleBulkAction}
      />
    </div>
  );
}
