"use client";

import { useState } from "react";
import { Save, Globe, Mail, Bell, Shield, Building, Palette } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: "general", label: "General", icon: Building },
        { id: "branding", label: "Branding", icon: Palette },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "email", label: "Email", icon: Mail },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "security", label: "Security", icon: Shield },
    ];

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaving(false);
        alert("Settings saved successfully!");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? "bg-primary text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {activeTab === "general" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                <input
                                    type="text"
                                    defaultValue="Glory Vacation"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                                <input
                                    type="text"
                                    defaultValue="Your Perfect Holiday Awaits"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    defaultValue="info@gloryvacation.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                <input
                                    type="tel"
                                    defaultValue="+971 50 350 5752"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                rows={3}
                                defaultValue="Business Bay, Dubai, UAE"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white">
                                <option value="AED">AED - UAE Dirham</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === "branding" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Branding Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        defaultValue="#0F9690"
                                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        defaultValue="#0F9690"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        defaultValue="#F5A623"
                                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        defaultValue="#F5A623"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                <div className="text-gray-400 mb-2">
                                    <Building className="w-12 h-12 mx-auto" />
                                </div>
                                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                <div className="text-gray-400 mb-2">
                                    <Globe className="w-12 h-12 mx-auto" />
                                </div>
                                <p className="text-sm text-gray-500">Click to upload favicon</p>
                                <p className="text-xs text-gray-400 mt-1">ICO, PNG 32x32px</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>

                        <div className="space-y-4">
                            {[
                                { label: "New Booking Notifications", desc: "Receive alerts when a new booking is made" },
                                { label: "Booking Cancellations", desc: "Get notified when a booking is cancelled" },
                                { label: "New User Registrations", desc: "Alert when a new user signs up" },
                                { label: "Property Inquiries", desc: "Notifications for property inquiries" },
                                { label: "Review Notifications", desc: "Get alerts for new reviews" },
                                { label: "Payment Alerts", desc: "Notifications for payment events" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{item.label}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "email" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                                <input
                                    type="text"
                                    placeholder="smtp.example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                <input
                                    type="text"
                                    placeholder="587"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                                <input
                                    type="text"
                                    placeholder="username@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                            <input
                                type="email"
                                placeholder="noreply@gloryvacation.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <button className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                            Send Test Email
                        </button>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                            <input
                                type="text"
                                defaultValue="Glory Vacation - Premium Holiday Homes in Dubai"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            <textarea
                                rows={3}
                                defaultValue="Discover luxury holiday homes and vacation rentals in Dubai. DTCM licensed properties with premium amenities and exceptional service."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                            <input
                                type="text"
                                defaultValue="holiday homes dubai, vacation rentals, dubai apartments, luxury villa dubai"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                            <input
                                type="text"
                                placeholder="G-XXXXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>

                        <div className="space-y-4">
                            {[
                                { label: "Require Email Verification", desc: "Users must verify email before accessing account" },
                                { label: "Admin Approval for Hosts", desc: "New host accounts require admin approval" },
                                { label: "Two-Factor Authentication", desc: "Enable 2FA for admin accounts" },
                                { label: "Rate Limiting", desc: "Limit API requests to prevent abuse" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{item.label}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={idx < 2} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-4">Change Admin Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors">
                                Update Password
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
