"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Mail, Search, Trash2, Eye, MessageSquare, Clock } from "lucide-react";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MessagesPage() {
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data, error, mutate } = useSWR<ContactMessage[]>('/api/contact', fetcher, { revalidateOnFocus: false });

    const loading = !data && !error;

    const messages = data || [];

    const filteredMessages = messages.filter((msg) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            msg.name.toLowerCase().includes(query) ||
            msg.email.toLowerCase().includes(query) ||
            msg.subject.toLowerCase().includes(query)
        );
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // revalidate
                await mutate();
                if (selectedMessage && selectedMessage._id === id) {
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-[#1C1C1C]">Contact Messages</h1>
                <div className="flex items-center gap-2 text-sm text-[#7E7E7E]">
                    <Mail className="w-4 h-4" />
                    {messages.length} total messages
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-[#7E7E7E]">Loading messages...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-[#7E7E7E]">No messages found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredMessages.map((msg) => (
                                <div
                                    key={msg._id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?._id === msg._id ? "bg-primary/5 border-l-4 border-primary" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-[#1C1C1C]">{msg.name}</p>
                                            <p className="text-sm text-[#7E7E7E]">{msg.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[#7E7E7E]">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm text-[#1C1C1C] mb-1">{msg.subject}</p>
                                    <p className="text-sm text-[#7E7E7E] line-clamp-2">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {selectedMessage ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[#1C1C1C]">Message Details</h3>
                                <button onClick={() => handleDelete(selectedMessage._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[#7E7E7E] uppercase">From</label>
                                    <p className="font-medium text-[#1C1C1C]">{selectedMessage.name}</p>
                                    <p className="text-sm text-primary">{selectedMessage.email}</p>
                                    {selectedMessage.phone && (
                                        <p className="text-sm text-[#7E7E7E]">{selectedMessage.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#7E7E7E] uppercase">Subject</label>
                                    <p className="font-medium text-[#1C1C1C]">{selectedMessage.subject}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#7E7E7E] uppercase">Message</label>
                                    <p className="text-[#1C1C1C] whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#7E7E7E] uppercase">Received</label>
                                    <p className="text-[#1C1C1C]">
                                        {format(new Date(selectedMessage.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="w-full block text-center px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <Eye className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-[#7E7E7E]">Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
