"use client";

import { useState, useMemo } from "react";
import useSWR from 'swr';
import {
  Users, Building2, Calendar, BookOpen, BarChart3,
  Search, Filter, MoreVertical, Eye, Edit2, CheckCircle,
  XCircle, UserCheck, UserX, Home, MapPin, Star,
  DollarSign, TrendingUp, Activity, Settings
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
  role: "host" | "guest";
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

type TabType = 'overview' | 'users' | 'listings' | 'bookings';

export default function WebAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  // Fetch data based on active tab
  const { data: usersData, error: usersError, mutate: mutateUsers } = useSWR<User[]>(
    activeTab === 'users' ? '/api/admin/users' : null,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Web Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, listings, and bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl p-2 border">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'overview' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'users' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'listings' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          Listings
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={cn("px-4 py-2 rounded-lg font-medium", activeTab === 'bookings' ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-50')}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Bookings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                  <p className="text-sm text-gray-500">Total Listings</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingUsers + stats.pendingListings + stats.pendingBookings}</p>
                  <p className="text-sm text-gray-500">Pending Items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Pending Approvals</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="font-medium">{stats.pendingUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Listings</span>
                  <span className="font-medium">{stats.pendingListings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="font-medium">{stats.pendingBookings}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  Review Listings
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  Handle Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((user: User) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.image ? (
                              <Image src={user.image} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'host' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {user.isApproved ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {!user.isApproved && (
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((property: Property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{property.host.name}</div>
                          <div className="text-sm text-gray-500">{property.host.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {property.status === 'approved' ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        ) : property.status === 'pending' ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.price}/night
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {property.status === 'pending' && (
                          <button
                            onClick={() => handleApproveListing(property._id)}
                            disabled={actionLoading === property._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((booking: Booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{booking.property.title}</div>
                          <div className="text-sm text-gray-500">Host: {booking.host.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{booking.guest.name}</div>
                          <div className="text-sm text-gray-500">{booking.guest.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                          disabled={actionLoading === booking._id}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {/* View booking details */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}