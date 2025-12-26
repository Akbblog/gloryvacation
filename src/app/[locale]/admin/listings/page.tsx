"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from 'swr';
import { Link } from "@/i18n/navigation";
import { 
  Plus, Home, MapPin, DollarSign, Star, Eye, Pencil, Trash2, 
  Search, Filter, Grid3X3, List, CheckCircle2, XCircle, Clock,
  Building2, Bed, Bath, Users, ChevronDown, ChevronUp, 
  MoreVertical, RefreshCw, Download, Upload, ArrowUpDown,
  CheckSquare, Square, Sparkles, TrendingUp, AlertCircle, Building
} from "lucide-react";
import Image from "next/image";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ApiResponseToast from "@/components/ui/ApiResponseToast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Property {
  _id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  location: {
    address: string;
    area: string;
    city: string;
  };
  pricePerNight?: number;
  images: string[];
  rating?: number;
  reviewCount: number;
  isActive: boolean;
  isApprovedByAdmin: boolean;
  isFeatured: boolean;
  host?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type ViewMode = 'grid' | 'list';
type SortField = 'createdAt' | 'title' | 'pricePerNight' | 'rating' | 'bedrooms';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive' | 'pending' | 'featured';

export default function ListingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Show more by default
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [targetProperty, setTargetProperty] = useState<{ id: string; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const json = await res.json();
    return json;
  };

  // Fetch all properties for admin (with high limit to get all)
  const { data, error, mutate, isValidating } = useSWR(
    `/api/properties?all=1&limit=100&page=1`,
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  );

  const properties: Property[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.properties)) return data.properties;
    return [];
  }, [data]);

  // Client-side filtering and sorting
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.location.address?.toLowerCase().includes(query) ||
        p.location.area?.toLowerCase().includes(query) ||
        p.location.city?.toLowerCase().includes(query) ||
        p.propertyType?.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (statusFilter) {
      case 'active':
        filtered = filtered.filter(p => p.isActive && p.isApprovedByAdmin);
        break;
      case 'inactive':
        filtered = filtered.filter(p => !p.isActive);
        break;
      case 'pending':
        filtered = filtered.filter(p => p.isActive && !p.isApprovedByAdmin);
        break;
      case 'featured':
        filtered = filtered.filter(p => p.isFeatured);
        break;
    }

    // Property type filter
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.propertyType === propertyTypeFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'pricePerNight':
          aVal = a.pricePerNight || 0;
          bVal = b.pricePerNight || 0;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'bedrooms':
          aVal = a.bedrooms || 0;
          bVal = b.bedrooms || 0;
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
  }, [properties, searchQuery, statusFilter, propertyTypeFilter, sortField, sortOrder]);

  // Pagination
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProperties.slice(start, start + pageSize);
  }, [filteredProperties, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProperties.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: properties.length,
    active: properties.filter(p => p.isActive && p.isApprovedByAdmin).length,
    inactive: properties.filter(p => !p.isActive).length,
    pending: properties.filter(p => p.isActive && !p.isApprovedByAdmin).length,
    featured: properties.filter(p => p.isFeatured).length,
  }), [properties]);

  // Property types for filter
  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.propertyType).filter(Boolean));
    return Array.from(types);
  }, [properties]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProperties.map(p => p._id)));
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
  const handleApprove = async (propertyId: string) => {
    setActionLoading(propertyId);
    try {
      const res = await fetch('/api/admin/properties/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to approve: ' + (data?.message || res.status));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to approve property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (property: Property) => {
    setActionLoading(property._id);
    try {
      const res = await fetch('/api/admin/properties/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          propertyId: property._id,
          isActive: !property.isActive 
        }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to update: ' + (data?.message || res.status));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (property: Property) => {
    setActionLoading(property._id);
    try {
      const res = await fetch('/api/admin/properties/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          propertyId: property._id,
          isFeatured: !property.isFeatured 
        }),
      });
      if (res.ok) {
        await mutate();
      } else {
        const data = await res.json();
        alert('Failed to update: ' + (data?.message || res.status));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!targetProperty) return;
    setActionLoading(targetProperty.id);
    try {
      const res = await fetch('/api/admin/properties/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: targetProperty.id }),
      });
      if (res.ok) {
        await mutate();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetProperty.id);
          return newSet;
        });
      } else {
        const data = await res.json();
        alert('Failed to delete: ' + (data?.message || res.status));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete property');
    } finally {
      setConfirmOpen(false);
      setTargetProperty(null);
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await fetch('/api/admin/properties/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: id }),
        });
      } catch (e) {
        console.error(`Failed to delete ${id}`, e);
      }
    }
    await mutate();
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  const getStatusBadge = (property: Property) => {
    if (!property.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <XCircle className="w-3 h-3" /> Inactive
        </span>
      );
    }
    if (!property.isApprovedByAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Active
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
              <h2 className="text-red-800 font-semibold">Error loading listings</h2>
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
      <ApiResponseToast />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-gray-500 mt-1">Manage all your property listings in one place</p>
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
          <Link
            href="/admin/listings/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'all' 
              ? "border-teal-500 bg-teal-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Building className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'active' 
              ? "border-green-500 bg-green-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{stats.active}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Active</p>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'pending' 
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
          onClick={() => setStatusFilter('inactive')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'inactive' 
              ? "border-gray-500 bg-gray-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <XCircle className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-bold text-gray-600">{stats.inactive}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Inactive</p>
        </button>

        <button
          onClick={() => setStatusFilter('featured')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all text-left",
            statusFilter === 'featured' 
              ? "border-purple-500 bg-purple-50" 
              : "border-gray-100 bg-white hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{stats.featured}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Featured</p>
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
              placeholder="Search by title, location, or type..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            {/* Property Type Filter */}
            <select
              value={propertyTypeFilter}
              onChange={(e) => { setPropertyTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="pricePerNight">Price</option>
                <option value="rating">Rating</option>
                <option value="bedrooms">Bedrooms</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'grid' ? "bg-teal-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'list' ? "bg-teal-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.size} {selectedIds.size === 1 ? 'property' : 'properties'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear selection
              </button>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Showing {paginatedProperties.length} of {filteredProperties.length} properties
            {filteredProperties.length !== properties.length && ` (filtered from ${properties.length})`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 border border-gray-200 rounded-md text-sm"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Listings Grid/List */}
      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProperties.map((property) => (
            <div
              key={property._id}
              className={cn(
                "bg-white rounded-xl border overflow-hidden transition-all duration-200 group",
                selectedIds.has(property._id) 
                  ? "border-teal-500 ring-2 ring-teal-200" 
                  : "border-gray-100 hover:border-gray-200 hover:shadow-lg"
              )}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                
                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {getStatusBadge(property)}
                  {property.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Selection checkbox */}
                <button
                  onClick={() => toggleSelect(property._id)}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
                >
                  {selectedIds.has(property._id) ? (
                    <CheckSquare className="w-5 h-5 text-teal-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Property type badge */}
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md capitalize">
                    {property.propertyType}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{property.location.area || property.location.city}</span>
                </div>

                {/* Property details */}
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" /> {property.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" /> {property.bathrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {property.guests}
                  </span>
                </div>

                {/* Price and rating */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="font-bold text-teal-600">
                    {property.pricePerNight ? (
                      <>AED {property.pricePerNight}<span className="text-xs text-gray-400 font-normal">/night</span></>
                    ) : (
                      <span className="text-gray-400 font-normal text-sm">Contact for price</span>
                    )}
                  </div>
                  <div className="flex items-center text-amber-500 text-sm font-medium">
                    <Star className="w-4 h-4 fill-current mr-0.5" />
                    {property.rating || 'New'}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  {!property.isApprovedByAdmin && property.isActive && (
                    <button
                      onClick={() => handleApprove(property._id)}
                      disabled={actionLoading === property._id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  <Link
                    href={`/listings/${property.slug || property._id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link
                    href={`/admin/listings/${property._id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                </div>

                {/* Secondary actions */}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleToggleFeatured(property)}
                    disabled={actionLoading === property._id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50",
                      property.isFeatured
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    {property.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(property)}
                    disabled={actionLoading === property._id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50",
                      property.isActive
                        ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    )}
                  >
                    {property.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setTargetProperty({ id: property._id, title: property.title });
                      setConfirmOpen(true);
                    }}
                    className="px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedProperties.length && paginatedProperties.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-teal-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProperties.map((property) => (
                <tr 
                  key={property._id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedIds.has(property._id) && "bg-teal-50"
                  )}
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(property._id)} className="p-1">
                      {selectedIds.has(property._id) ? (
                        <CheckSquare className="w-5 h-5 text-teal-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {property.images?.[0] ? (
                          <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{property.title}</p>
                        <p className="text-xs text-gray-500">
                          Added {format(new Date(property.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{property.location.area || property.location.city}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="capitalize text-sm text-gray-600">{property.propertyType}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-teal-600">
                      {property.pricePerNight ? `AED ${property.pricePerNight}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(property)}
                      {property.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!property.isApprovedByAdmin && property.isActive && (
                        <button
                          onClick={() => handleApprove(property._id)}
                          disabled={actionLoading === property._id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        href={`/listings/${property.slug || property._id}`}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/listings/${property._id}`}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleFeatured(property)}
                        disabled={actionLoading === property._id}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors disabled:opacity-50",
                          property.isFeatured ? "text-purple-600 hover:bg-purple-50" : "text-gray-400 hover:bg-gray-100"
                        )}
                        title={property.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTargetProperty({ id: property._id, title: property.title });
                          setConfirmOpen(true);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Empty State */}
      {data && filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
          <p className="text-gray-500 mt-1 mb-6">
            {searchQuery || statusFilter !== 'all' || propertyTypeFilter !== 'all' 
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first listing'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && propertyTypeFilter === 'all' && (
            <Link
              href="/admin/listings/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Property
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={`Delete "${targetProperty?.title}"?`}
        message="This will permanently remove the property and all related bookings and reviews. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setTargetProperty(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.size} properties?`}
        message="This will permanently remove all selected properties and their related data. This action cannot be undone."
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
