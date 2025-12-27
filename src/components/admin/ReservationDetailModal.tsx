"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    X, Mail, Phone, MapPin, Calendar, Users, Clock, Send,
    Tag, MessageSquare, DollarSign, History, ExternalLink, AlertCircle
} from "lucide-react";

interface Reservation {
    _id: string;
    property?: {
        _id: string;
        title: string;
        images?: string[];
        location?: {
            area?: string;
            city?: string;
        };
        pricePerNight?: number;
    };
    user?: {
        _id: string;
        name: string;
        email: string;
    };
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
    statusHistory?: {
        status: string;
        changedAt: string;
        note?: string;
    }[];
    totalAmount?: number;
    currency?: string;
    emailCount?: number;
    lastEmailSent?: string;
    createdAt: string;
    updatedAt: string;
}

interface ReservationDetailModalProps {
    reservation: Reservation | null;
    onClose: () => void;
    onUpdate: (updates: Record<string, unknown>) => Promise<void>;
    isUpdating: boolean;
}

const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "approved", label: "Approved", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "confirmed", label: "Confirmed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const priorityOptions = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-600" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-600" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-600" },
];

export default function ReservationDetailModal({
    reservation,
    onClose,
    onUpdate,
    isUpdating,
}: ReservationDetailModalProps) {
    const [activeTab, setActiveTab] = useState<"details" | "email" | "history">("details");
    const [status, setStatus] = useState(reservation?.status || "pending");
    const [priority, setPriority] = useState(reservation?.priority || "normal");
    const [adminNotes, setAdminNotes] = useState(reservation?.adminNotes || "");
    const [totalAmount, setTotalAmount] = useState(reservation?.totalAmount?.toString() || "");
    const [sendEmail, setSendEmail] = useState(true);
    const [customMessage, setCustomMessage] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(reservation?.internalTags || []);

    if (!reservation) return null;

    const currentStatus = statusOptions.find(s => s.value === status);
    const currentPriority = priorityOptions.find(p => p.value === priority);

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSave = async () => {
        await onUpdate({
            reservationId: reservation._id,
            status,
            priority,
            adminNotes,
            totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
            internalTags: tags,
            sendEmailNotification: sendEmail && status !== reservation.status,
            customEmailMessage: customMessage || undefined,
        });
    };

    const hasChanges = 
        status !== reservation.status ||
        priority !== (reservation.priority || "normal") ||
        adminNotes !== (reservation.adminNotes || "") ||
        totalAmount !== (reservation.totalAmount?.toString() || "") ||
        JSON.stringify(tags) !== JSON.stringify(reservation.internalTags || []);

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full md:max-w-4xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base md:text-xl font-semibold">Reservation Details</h2>
                        <p className="text-[10px] md:text-sm text-blue-100 mt-0.5 truncate">ID: {reservation._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors ml-2"
                    >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50 overflow-x-auto">
                    {[
                        { id: "details", label: "Details", icon: Users },
                        { id: "email", label: "Email", icon: Mail },
                        { id: "history", label: "History", icon: History },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 bg-white"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeTab === "details" && (
                        <div className="space-y-4 md:space-y-6">
                            {/* Status & Priority Row */}
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                {/* Status */}
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                                        {statusOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setStatus(opt.value)}
                                                className={`px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm font-medium rounded-lg border transition-all ${
                                                    status === opt.value
                                                        ? `${opt.color} border-2 ring-2 ring-offset-1 ring-current/20`
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <div className="flex gap-1.5 md:gap-2">
                                        {priorityOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setPriority(opt.value)}
                                                className={`flex-1 px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-sm font-medium rounded-lg transition-all ${
                                                    priority === opt.value
                                                        ? `${opt.color} ring-2 ring-offset-1 ring-current/20`
                                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <div className="flex gap-2">
                                        {priorityOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setPriority(opt.value)}
                                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                                    priority === opt.value
                                                        ? `${opt.color} ring-2 ring-offset-1 ring-current/20`
                                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Guest & Property Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                {/* Guest Info */}
                                <div className="bg-gray-50 rounded-xl p-3 md:p-5">
                                    <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                                        <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                                        Guest Information
                                    </h3>
                                    <div className="space-y-2 md:space-y-3">
                                        <div>
                                            <p className="text-sm md:text-lg font-semibold text-gray-900">
                                                {reservation.guestDetails?.name || "N/A"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            <a 
                                                href={`mailto:${reservation.guestDetails?.email}`}
                                                className="text-blue-600 hover:underline truncate"
                                            >
                                                {reservation.guestDetails?.email}
                                            </a>
                                        </div>
                                        {reservation.guestDetails?.phone && (
                                            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <a 
                                                    href={`tel:${reservation.guestDetails.phone}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {reservation.guestDetails.phone}
                                                </a>
                                            </div>
                                        )}
                                        {reservation.guestDetails?.nationality && (
                                            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                {reservation.guestDetails.nationality}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Property Info */}
                                <div className="bg-gray-50 rounded-xl p-3 md:p-5">
                                    <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                                        Property
                                    </h3>
                                    {reservation.property ? (
                                        <div className="space-y-2 md:space-y-3">
                                            <p className="text-sm md:text-lg font-semibold text-gray-900">
                                                {reservation.property.title}
                                            </p>
                                            {reservation.property.location && (
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {reservation.property.location.area}, {reservation.property.location.city}
                                                </p>
                                            )}
                                            {reservation.property.pricePerNight && (
                                                <p className="text-xs md:text-sm font-medium text-green-600">
                                                    AED {reservation.property.pricePerNight}/night
                                                </p>
                                            )}
                                            <a
                                                href={`/en/listings/${reservation.property._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs md:text-sm text-blue-600 hover:underline"
                                            >
                                                View property <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-xs md:text-sm">Property not found</p>
                                    )}
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-blue-50 rounded-xl p-3 md:p-5">
                                <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                                    Booking Details
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                                        <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5 md:mt-1">
                                            {format(new Date(reservation.checkIn), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
                                        <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5 md:mt-1">
                                            {reservation.checkOut 
                                                ? format(new Date(reservation.checkOut), "MMM d, yyyy") 
                                                : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">Guests</p>
                                        <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5 md:mt-1">
                                            {reservation.guests}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                                        <p className="text-xs md:text-sm font-semibold text-gray-900 mt-0.5 md:mt-1">
                                            {reservation.durationNights 
                                                ? `${reservation.durationNights} nights`
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                                    <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1" />
                                    Total ({reservation.currency || "AED"})
                                </label>
                                <input
                                    type="number"
                                    value={totalAmount}
                                    onChange={e => setTotalAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full md:w-1/3 px-3 md:px-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            {/* Guest Notes */}
                            {reservation.notes && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Guest Notes
                                    </h4>
                                    <p className="text-sm text-amber-900">{reservation.notes}</p>
                                </div>
                            )}

                            {/* Special Requests */}
                            {reservation.guestDetails?.specialRequests && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Special Requests
                                    </h4>
                                    <p className="text-sm text-purple-900">{reservation.guestDetails.specialRequests}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "email" && (
                        <div className="space-y-6">
                            {/* Email Notification */}
                            {status !== reservation.status && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="sendEmail"
                                            checked={sendEmail}
                                            onChange={e => setSendEmail(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="sendEmail" className="text-sm font-medium text-blue-900 cursor-pointer">
                                                Send email notification to guest
                                            </label>
                                            <p className="text-xs text-blue-700 mt-1">
                                                Guest will receive a professional email about the status change
                                            </p>
                                        </div>
                                    </div>

                                    {sendEmail && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                Custom message (optional)
                                            </label>
                                            <textarea
                                                value={customMessage}
                                                onChange={e => setCustomMessage(e.target.value)}
                                                placeholder="Add a personal message to include in the email..."
                                                rows={3}
                                                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Email Stats */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Email Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Emails Sent</p>
                                        <p className="text-xl font-bold text-gray-900">{reservation.emailCount || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Last Email</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {reservation.lastEmailSent
                                                ? formatDistanceToNow(new Date(reservation.lastEmailSent), { addSuffix: true })
                                                : "Never"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Internal Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="Add private notes (not visible to guest)..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="w-4 h-4 inline mr-1" />
                                    Internal Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyPress={e => e.key === "Enter" && handleAddTag()}
                                        placeholder="Add tag..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-6">
                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-4">Status History</h3>
                                {reservation.statusHistory && reservation.statusHistory.length > 0 ? (
                                    <div className="relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                                        <div className="space-y-4">
                                            {reservation.statusHistory.slice().reverse().map((entry, index) => {
                                                const statusInfo = statusOptions.find(s => s.value === entry.status);
                                                return (
                                                    <div key={index} className="relative flex items-start gap-4 pl-10">
                                                        <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${
                                                            statusInfo?.color.split(" ")[0] || "bg-gray-400"
                                                        }`} />
                                                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo?.color || ""}`}>
                                                                    {statusInfo?.label || entry.status}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {format(new Date(entry.changedAt), "MMM d, yyyy h:mm a")}
                                                                </span>
                                                            </div>
                                                            {entry.note && (
                                                                <p className="text-sm text-gray-600 mt-2">{entry.note}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No status changes recorded yet.</p>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Timestamps
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Created</p>
                                        <p className="font-medium">{format(new Date(reservation.createdAt), "MMM d, yyyy h:mm a")}</p>
                                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(reservation.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Last Updated</p>
                                        <p className="font-medium">{format(new Date(reservation.updatedAt), "MMM d, yyyy h:mm a")}</p>
                                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(reservation.updatedAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-t bg-gray-50 gap-3">
                    <div className="text-xs md:text-sm text-gray-500 hidden sm:block">
                        {hasChanges && (
                            <span className="text-amber-600 font-medium">• Unsaved</span>
                        )}
                    </div>
                    <div className="flex gap-2 md:gap-3 flex-1 sm:flex-none justify-end">
                        <button
                            onClick={onClose}
                            className="px-3 md:px-5 py-2 md:py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-xs md:text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isUpdating}
                            className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
