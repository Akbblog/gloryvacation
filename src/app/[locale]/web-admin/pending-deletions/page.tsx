"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import {
  Check, X, Shield, User as UserIcon, Search, Filter,
  MoreVertical, Mail, Phone, Calendar, Crown, Users, UserCheck,
  UserX, Clock, RefreshCw, ChevronDown, AlertCircle, Trash2,
  Edit2, Eye, CheckSquare, Square, Building2, Star, ArrowUpDown,
  UserPlus, Download, ShieldCheck, ShieldOff, Settings, AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface PendingDeletion {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export default function PendingDeletionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [targetDeletion, setTargetDeletion] = useState<PendingDeletion | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, mutate, isValidating } = useSWR<PendingDeletion[]>(
    '/api/admin/pending-deletions',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  );

  const pendingDeletions = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  // Client-side filtering
  const filteredDeletions = useMemo(() => {
    let filtered = [...pendingDeletions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.userName.toLowerCase().includes(query) ||
        d.userEmail.toLowerCase().includes(query) ||
        d.requestedBy.name.toLowerCase().includes(query) ||
        d.requestedBy.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [pendingDeletions, searchQuery]);

  // Pagination
  const paginatedDeletions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDeletions.slice(start, start + pageSize);
  }, [filteredDeletions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDeletions.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: pendingDeletions.length,
  }), [pendingDeletions]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedDeletions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDeletions.map(d => d._id)));
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
  const handleProcessDeletion = async (deletionId: string, action: 'approve' | 'reject') => {
    setActionLoading(deletionId);
    try {
      const res = await fetch("/api/admin/pending-deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deletionId, action }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to process deletion: ' + (data?.message || res.status));
      }
    } catch (error) {
      console.error("Failed to process deletion", error);
      alert('Failed to process deletion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    const ids = Array.from(selectedIds);

    for (const id of ids) {
      try {
        await fetch("/api/admin/pending-deletions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, action: bulkAction }),
        });
      } catch (e) {
        console.error(`Failed to ${bulkAction} deletion ${id}`, e);
      }
    }

    await mutate();
    setSelectedIds(new Set());
    setBulkActionOpen(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Pending User Deletions</h1>
          <p className="text-gray-600 mt-1">Review and approve user deletion requests from sub-admins</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1C1C1C]">{stats.total}</p>
              <p className="text-sm text-gray-600">Pending Deletions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search pending deletions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
            <button
              onClick={() => {
                setBulkAction('approve');
                setBulkActionOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve All
            </button>
            <button
              onClick={() => {
                setBulkAction('reject');
                setBulkActionOpen(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject All
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedDeletions.length && paginatedDeletions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User to Delete</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDeletions.map((deletion) => (
                <tr key={deletion._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(deletion._id)}
                      onChange={() => toggleSelect(deletion._id)}
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{deletion.userName}</div>
                        <div className="text-sm text-gray-500">{deletion.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{deletion.requestedBy.name}</div>
                      <div className="text-sm text-gray-500">{deletion.requestedBy.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {deletion.reason || 'No reason provided'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(deletion.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleProcessDeletion(deletion._id, 'approve')}
                        disabled={actionLoading === deletion._id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleProcessDeletion(deletion._id, 'reject')}
                        disabled={actionLoading === deletion._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedDeletions.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending deletions</h3>
            <p className="text-gray-500">There are currently no user deletion requests pending approval.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredDeletions.length)} of {filteredDeletions.length} results
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

      {/* Bulk Action Confirm Modal */}
      <ConfirmModal
        open={bulkActionOpen}
        title={`Bulk ${bulkAction === 'approve' ? 'Approve' : 'Reject'} Deletions`}
        message={`Are you sure you want to ${bulkAction} ${selectedIds.size} deletion request${selectedIds.size > 1 ? 's' : ''}?`}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setBulkActionOpen(false);
          setBulkAction(null);
        }}
        confirmLabel={bulkAction === 'approve' ? 'Approve All' : 'Reject All'}
        cancelLabel="Cancel"
      />
    </div>
  );
}