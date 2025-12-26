"use client";

import { 
    Calendar, Clock, CheckCircle, XCircle, 
    MessageSquare, AlertTriangle, TrendingUp, Users 
} from "lucide-react";

interface StatsData {
    total: number;
    recentCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
}

interface ReservationStatsProps {
    stats: StatsData | null;
    isLoading: boolean;
    onFilterByStatus: (status: string) => void;
    activeStatus: string;
}

const statusConfig = [
    { key: "pending", label: "Pending", icon: Clock, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", textColor: "text-amber-700" },
    { key: "contacted", label: "Contacted", icon: MessageSquare, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { key: "approved", label: "Approved", icon: CheckCircle, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50", textColor: "text-green-700" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "from-red-500 to-rose-500", bgColor: "bg-red-50", textColor: "text-red-700" },
    { key: "cancelled", label: "Cancelled", icon: XCircle, color: "from-gray-500 to-slate-500", bgColor: "bg-gray-50", textColor: "text-gray-700" },
];

export default function ReservationStats({ 
    stats, 
    isLoading, 
    onFilterByStatus,
    activeStatus 
}: ReservationStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                        <div className="h-8 bg-gray-200 rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const urgentCount = stats.byPriority?.urgent || 0;
    const highPriorityCount = stats.byPriority?.high || 0;

    return (
        <div className="space-y-4">
            {/* Main Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Reservations */}
                <div 
                    className={`bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20 cursor-pointer transition-transform hover:scale-[1.02] ${activeStatus === 'all' ? 'ring-4 ring-violet-300' : ''}`}
                    onClick={() => onFilterByStatus('all')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-100 text-sm font-medium">Total</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Recent (7 days) */}
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium">Last 7 Days</p>
                            <p className="text-3xl font-bold mt-1">{stats.recentCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Pending - Action Required */}
                <div 
                    className={`bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20 cursor-pointer transition-transform hover:scale-[1.02] ${activeStatus === 'pending' ? 'ring-4 ring-amber-300' : ''}`}
                    onClick={() => onFilterByStatus('pending')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Pending</p>
                            <p className="text-3xl font-bold mt-1">{stats.byStatus?.pending || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Urgent/High Priority */}
                <div className={`bg-gradient-to-br ${urgentCount + highPriorityCount > 0 ? 'from-red-500 to-rose-600' : 'from-gray-400 to-gray-500'} rounded-2xl p-5 text-white shadow-lg ${urgentCount + highPriorityCount > 0 ? 'shadow-red-500/20' : 'shadow-gray-500/20'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${urgentCount + highPriorityCount > 0 ? 'text-red-100' : 'text-gray-100'} text-sm font-medium`}>High Priority</p>
                            <p className="text-3xl font-bold mt-1">{urgentCount + highPriorityCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Filter by Status</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {statusConfig.map(status => {
                        const count = stats.byStatus?.[status.key] || 0;
                        const isActive = activeStatus === status.key;
                        const Icon = status.icon;
                        
                        return (
                            <button
                                key={status.key}
                                onClick={() => onFilterByStatus(status.key)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    isActive 
                                        ? `${status.bgColor} border-current ${status.textColor} shadow-md` 
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400'}`} />
                                    <span className="text-xs font-medium">{status.label}</span>
                                    <span className={`text-lg font-bold ${isActive ? '' : 'text-gray-900'}`}>{count}</span>
                                </div>
                                {isActive && (
                                    <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${status.color} rounded-full`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
