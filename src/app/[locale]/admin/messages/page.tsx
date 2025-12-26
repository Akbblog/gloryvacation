"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format, formatDistanceToNow } from "date-fns";
import { 
    Mail, Search, Trash2, Eye, MessageSquare, Clock, CheckCircle, 
    XCircle, Send, Filter, MoreVertical, ExternalLink, Phone, User,
    Building, ChevronDown, RefreshCcw, Inbox, CheckCheck, Archive,
    MailOpen, AlertCircle
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface Property {
    _id: string;
    title: string;
    images?: string[];
    location?: {
        area?: string;
        city?: string;
    };
}

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    property?: Property;
    status: "new" | "read" | "replied" | "closed";
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    new: number;
    read: number;
    replied: number;
    closed: number;
    withProperty: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Inbox },
    read: { label: "Read", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", icon: MailOpen },
    replied: { label: "Replied", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: Send },
    closed: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200", icon: Archive },
};

export default function MessagesPage() {
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [propertyFilter, setPropertyFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Build query params
    const queryParams = new URLSearchParams();
    if (statusFilter !== "all") queryParams.set("status", statusFilter);
    if (searchQuery) queryParams.set("search", searchQuery);
    if (propertyFilter === "with") queryParams.set("hasProperty", "true");
    if (propertyFilter === "without") queryParams.set("hasProperty", "false");

    const queryString = queryParams.toString();
    const apiUrl = `/api/contact${queryString ? `?${queryString}` : ""}`;

    const { data: messages, error, mutate, isLoading } = useSWR<ContactMessage[]>(apiUrl, fetcher, { 
        revalidateOnFocus: false 
    });
    
    const { data: stats, mutate: mutateStats } = useSWR<Stats>('/api/contact?stats=true', fetcher, { 
        revalidateOnFocus: false 
    });

    // Mark as read when selecting a new message
    useEffect(() => {
        if (selectedMessage && selectedMessage.status === "new") {
            handleStatusChange(selectedMessage._id, "read");
        }
    }, [selectedMessage?._id]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                await mutate();
                await mutateStats();
                if (selectedMessage?._id === id) {
                    const updated = await res.json();
                    setSelectedMessage(updated.data);
                }
            }
        } catch (err) {
            console.error('Status update failed', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await mutate();
                await mutateStats();
                if (selectedMessage?._id === id) {
                    setSelectedMessage(null);
                }
            } else {
                const body = await res.json();
                alert(body?.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete message');
        }
    };

    const handleBulkAction = async (action: string, status?: string) => {
        if (selectedIds.length === 0) return;
        
        const confirmMsg = action === "bulkDelete" 
            ? `Delete ${selectedIds.length} messages?` 
            : `Mark ${selectedIds.length} messages as ${status}?`;
        
        if (!confirm(confirmMsg)) return;

        setIsUpdating(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, action, status }),
            });
            if (res.ok) {
                await mutate();
                await mutateStats();
                setSelectedIds([]);
                setShowBulkActions(false);
                if (selectedMessage && selectedIds.includes(selectedMessage._id)) {
                    setSelectedMessage(null);
                }
            }
        } catch (err) {
            console.error('Bulk action failed', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (!messages) return;
        if (selectedIds.length === messages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(messages.map(m => m._id));
        }
    };

    const messageList = messages || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage contact inquiries and property questions</p>
                </div>
                <button 
                    onClick={() => { mutate(); mutateStats(); }}
                    className="self-start p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Refresh"
                >
                    <RefreshCcw className={cn("w-5 h-5 text-gray-500", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button 
                    onClick={() => setStatusFilter("all")}
                    className={cn(
                        "bg-white p-4 rounded-2xl border transition-all hover:shadow-md text-left",
                        statusFilter === "all" ? "border-teal-500 ring-2 ring-teal-500/20" : "border-gray-100"
                    )}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                    <div className="text-xs text-gray-500">Total Messages</div>
                </button>

                <button 
                    onClick={() => setStatusFilter("new")}
                    className={cn(
                        "bg-white p-4 rounded-2xl border transition-all hover:shadow-md text-left",
                        statusFilter === "new" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-100"
                    )}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Inbox className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats?.new || 0}</div>
                    <div className="text-xs text-gray-500">New</div>
                </button>

                <button 
                    onClick={() => setStatusFilter("read")}
                    className={cn(
                        "bg-white p-4 rounded-2xl border transition-all hover:shadow-md text-left",
                        statusFilter === "read" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-100"
                    )}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <MailOpen className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{stats?.read || 0}</div>
                    <div className="text-xs text-gray-500">Read</div>
                </button>

                <button 
                    onClick={() => setStatusFilter("replied")}
                    className={cn(
                        "bg-white p-4 rounded-2xl border transition-all hover:shadow-md text-left",
                        statusFilter === "replied" ? "border-green-500 ring-2 ring-green-500/20" : "border-gray-100"
                    )}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats?.replied || 0}</div>
                    <div className="text-xs text-gray-500">Replied</div>
                </button>

                <button 
                    onClick={() => setStatusFilter("closed")}
                    className={cn(
                        "bg-white p-4 rounded-2xl border transition-all hover:shadow-md text-left",
                        statusFilter === "closed" ? "border-gray-500 ring-2 ring-gray-500/20" : "border-gray-100"
                    )}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Archive className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">{stats?.closed || 0}</div>
                    <div className="text-xs text-gray-500">Closed</div>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                        />
                    </div>

                    {/* Property Filter */}
                    <select 
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                    >
                        <option value="all">All Messages</option>
                        <option value="with">Property Inquiries</option>
                        <option value="without">General Contact</option>
                    </select>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-teal-700 transition-colors"
                            >
                                {selectedIds.length} selected
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showBulkActions && (
                                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px] py-2">
                                    <button 
                                        onClick={() => handleBulkAction("bulkStatus", "read")}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <MailOpen className="w-4 h-4" /> Mark as Read
                                    </button>
                                    <button 
                                        onClick={() => handleBulkAction("bulkStatus", "replied")}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Mark as Replied
                                    </button>
                                    <button 
                                        onClick={() => handleBulkAction("bulkStatus", "closed")}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Archive className="w-4 h-4" /> Mark as Closed
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button 
                                        onClick={() => handleBulkAction("bulkDelete")}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Selected
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* List Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={messageList.length > 0 && selectedIds.length === messageList.length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-600">Select All</span>
                        </label>
                        <span className="text-sm text-gray-500">{messageList.length} messages</span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading messages...</p>
                        </div>
                    ) : messageList.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No messages found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {statusFilter !== "all" ? "Try changing your filters" : "Messages will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                            {messageList.map((msg) => {
                                const config = statusConfig[msg.status] || statusConfig.new;
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={msg._id}
                                        className={cn(
                                            "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                                            selectedMessage?._id === msg._id && "bg-teal-50 border-l-4 border-teal-500",
                                            msg.status === "new" && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            {/* Checkbox */}
                                            <input 
                                                type="checkbox"
                                                checked={selectedIds.includes(msg._id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelect(msg._id);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 flex-shrink-0"
                                            />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0" onClick={() => setSelectedMessage(msg)}>
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={cn(
                                                            "font-medium text-gray-900",
                                                            msg.status === "new" && "font-bold"
                                                        )}>
                                                            {msg.name}
                                                        </p>
                                                        {msg.status === "new" && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded-full border flex items-center gap-1",
                                                            config.bgColor,
                                                            config.color
                                                        )}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-500 mb-1">{msg.email}</p>
                                                <p className={cn(
                                                    "text-sm text-gray-800 mb-1",
                                                    msg.status === "new" && "font-medium"
                                                )}>
                                                    {msg.subject}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{msg.message}</p>

                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {msg.property && (
                                                        <span className="text-xs text-teal-600 flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            {msg.property.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Message Detail Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                    {selectedMessage ? (
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Message Details</h3>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleDelete(selectedMessage._id)} 
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(statusConfig).map(([key, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleStatusChange(selectedMessage._id, key)}
                                                disabled={isUpdating}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 border transition-all",
                                                    selectedMessage.status === key 
                                                        ? `${config.bgColor} ${config.color}` 
                                                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                                )}
                                            >
                                                <Icon className="w-3 h-3" />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* From */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">From</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-teal-600 hover:underline">
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                </div>
                                {selectedMessage.phone && (
                                    <a 
                                        href={`tel:${selectedMessage.phone}`}
                                        className="mt-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {selectedMessage.phone}
                                    </a>
                                )}
                            </div>

                            {/* Property Link */}
                            {selectedMessage.property && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Related Property</label>
                                    <Link 
                                        href={`/listings/${selectedMessage.property._id}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                                            {selectedMessage.property.images?.[0] ? (
                                                <Image 
                                                    src={selectedMessage.property.images[0]} 
                                                    alt={selectedMessage.property.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-teal-600">
                                                {selectedMessage.property.title}
                                            </p>
                                            {selectedMessage.property.location && (
                                                <p className="text-xs text-gray-500">
                                                    {selectedMessage.property.location.area}, {selectedMessage.property.location.city}
                                                </p>
                                            )}
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                                    </Link>
                                </div>
                            )}

                            {/* Subject */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Subject</label>
                                <p className="font-medium text-gray-900">{selectedMessage.subject}</p>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Message</label>
                                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            {/* Received */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Received</label>
                                <p className="text-gray-700 text-sm">
                                    {format(new Date(selectedMessage.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                                    onClick={() => handleStatusChange(selectedMessage._id, "replied")}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                    Reply via Email
                                </a>
                                {selectedMessage.phone && (
                                    <a
                                        href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <Eye className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">Select a message</p>
                            <p className="text-gray-400 text-sm mt-1">Click on a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
