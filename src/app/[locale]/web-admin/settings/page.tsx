"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Mail, Bell, Shield, Building, Palette, Upload, X, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface Settings {
  general: {
    siteName: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    whatsappNumber: string;
    address: string;
    currency: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
  };
  notifications: {
    newBookings: boolean;
    bookingCancellations: boolean;
    newUsers: boolean;
    propertyInquiries: boolean;
    reviews: boolean;
    payments: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
  };
  security: {
    emailVerification: boolean;
    adminApproval: boolean;
    twoFactorAuth: boolean;
    rateLimiting: boolean;
    maintenanceMode: boolean;
  };
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string>("");
    const [uploading, setUploading] = useState<{ logo?: boolean; favicon?: boolean }>({});
    const [dragActive, setDragActive] = useState<{ logo?: boolean; favicon?: boolean }>({});
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [testingEmail, setTestingEmail] = useState(false);
    const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

    const tabs = [
        { id: "general", label: "General", icon: Building },
        { id: "branding", label: "Branding", icon: Palette },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "email", label: "Email", icon: Mail },
        { id: "seo", label: "SEO", icon: Globe },
        { id: "security", label: "Security", icon: Shield },
    ];

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings");
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            } else {
                console.error("Failed to load settings");
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = (section: keyof Settings, field: string, value: any) => {
        if (!settings) return;

        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [field]: value,
            },
        });

        // Clear any errors for this field
        if (errors[`${section}.${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${section}.${field}`];
                return newErrors;
            });
        }
    };

    const validateSettings = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!settings) return false;

        // General validation
        if (!settings.general.siteName.trim()) {
            newErrors["general.siteName"] = "Site name is required";
        }
        if (!settings.general.contactEmail.trim()) {
            newErrors["general.contactEmail"] = "Contact email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.general.contactEmail)) {
            newErrors["general.contactEmail"] = "Invalid email format";
        }

        // Email validation
        if (settings.email.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email.fromEmail)) {
            newErrors["email.fromEmail"] = "Invalid email format";
        }

        // SEO validation
        if (settings.seo.metaTitle && settings.seo.metaTitle.length > 60) {
            newErrors["seo.metaTitle"] = "Meta title should be under 60 characters";
        }
        if (settings.seo.metaDescription && settings.seo.metaDescription.length > 160) {
            newErrors["seo.metaDescription"] = "Meta description should be under 160 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!settings) return;

        if (!validateSettings()) {
            setSuccess("");
            return;
        }

        setSaving(true);
        setErrors({});
        setSuccess("");

        try {
            const response = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setSuccess("Settings saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const error = await response.json();
                setErrors({ general: error.error || "Failed to save settings" });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setErrors({ general: "Failed to save settings. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", type);

            const response = await fetch("/api/admin/settings/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                updateSetting("branding", type, data.url);
                setSuccess(`${type === "logo" ? "Logo" : "Favicon"} uploaded successfully!`);
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const error = await response.json();
                setErrors({ [type]: error.error || `Failed to upload ${type}` });
            }
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            setErrors({ [type]: `Failed to upload ${type}. Please try again.` });
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleDragEnter = (e: React.DragEvent, type: "logo" | "favicon") => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: true }));
    };

    const handleDragLeave = (e: React.DragEvent, type: "logo" | "favicon") => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));
    };

    const handleDragOver = (e: React.DragEvent, type: "logo" | "favicon") => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent, type: "logo" | "favicon") => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0], type);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, type);
        }
    };

    const handleTestEmail = async () => {
        if (!settings?.email.smtpHost || !settings?.email.smtpUsername || !settings?.email.smtpPassword) {
            setTestEmailResult({ success: false, message: "Please fill in all email settings first" });
            return;
        }

        setTestingEmail(true);
        setTestEmailResult(null);

        try {
            const response = await fetch("/api/admin/settings/test-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    smtpHost: settings.email.smtpHost,
                    smtpPort: settings.email.smtpPort,
                    smtpUsername: settings.email.smtpUsername,
                    smtpPassword: settings.email.smtpPassword,
                    fromEmail: settings.email.fromEmail,
                }),
            });

            if (response.ok) {
                setTestEmailResult({ success: true, message: "Test email sent successfully!" });
            } else {
                const error = await response.json();
                setTestEmailResult({ success: false, message: error.error || "Failed to send test email" });
            }
        } catch (error) {
            console.error("Error testing email:", error);
            setTestEmailResult({ success: false, message: "Failed to send test email. Please try again." });
        } finally {
            setTestingEmail(false);
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        setSaving(true);
        setErrors({});
        setSuccess("");

        try {
            const response = await fetch("/api/admin/settings/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (response.ok) {
                setSuccess("Password updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const error = await response.json();
                setErrors({ password: error.error || "Failed to update password" });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setErrors({ password: "Failed to update password. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to load settings</h3>
                <p className="text-gray-500">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{success}</span>
                </div>
            )}

            {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800 font-medium">Please fix the following errors:</span>
                    </div>
                    <ul className="text-red-700 text-sm space-y-1">
                        {Object.entries(errors).map(([key, error]) => (
                            <li key={key}>• {error}</li>
                        ))}
                    </ul>
                </div>
            )}

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
                                    value={settings.general.siteName}
                                    onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                                        errors["general.siteName"] ? "border-red-300" : "border-gray-200"
                                    }`}
                                />
                                {errors["general.siteName"] && (
                                    <p className="text-red-600 text-xs mt-1">{errors["general.siteName"]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                                <input
                                    type="text"
                                    value={settings.general.tagline}
                                    onChange={(e) => updateSetting("general", "tagline", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    value={settings.general.contactEmail}
                                    onChange={(e) => updateSetting("general", "contactEmail", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                                        errors["general.contactEmail"] ? "border-red-300" : "border-gray-200"
                                    }`}
                                />
                                {errors["general.contactEmail"] && (
                                    <p className="text-red-600 text-xs mt-1">{errors["general.contactEmail"]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                <input
                                    type="tel"
                                    value={settings.general.contactPhone}
                                    onChange={(e) => updateSetting("general", "contactPhone", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                <input
                                    type="tel"
                                    value={settings.general.whatsappNumber}
                                    onChange={(e) => updateSetting("general", "whatsappNumber", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                rows={3}
                                value={settings.general.address}
                                onChange={(e) => updateSetting("general", "address", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                            <select
                                value={settings.general.currency}
                                onChange={(e) => updateSetting("general", "currency", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
                            >
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
                                        value={settings.branding.primaryColor}
                                        onChange={(e) => updateSetting("branding", "primaryColor", e.target.value)}
                                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.branding.primaryColor}
                                        onChange={(e) => updateSetting("branding", "primaryColor", e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={settings.branding.secondaryColor}
                                        onChange={(e) => updateSetting("branding", "secondaryColor", e.target.value)}
                                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.branding.secondaryColor}
                                        onChange={(e) => updateSetting("branding", "secondaryColor", e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                            <div className="space-y-3">
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                                        dragActive.logo ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                                    }`}
                                    onDragEnter={(e) => handleDragEnter(e, "logo")}
                                    onDragLeave={(e) => handleDragLeave(e, "logo")}
                                    onDragOver={(e) => handleDragOver(e, "logo")}
                                    onDrop={(e) => handleDrop(e, "logo")}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect(e, "logo")}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <div className="text-gray-400 mb-2">
                                            <Building className="w-12 h-12 mx-auto" />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {uploading.logo ? "Uploading..." : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                                    </label>
                                </div>
                                {settings.branding.logo && (
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <img src={settings.branding.logo} alt="Logo" className="w-12 h-12 object-contain rounded" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700">Current Logo</p>
                                            <p className="text-xs text-gray-500">Click upload to replace</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                            <div className="space-y-3">
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                                        dragActive.favicon ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                                    }`}
                                    onDragEnter={(e) => handleDragEnter(e, "favicon")}
                                    onDragLeave={(e) => handleDragLeave(e, "favicon")}
                                    onDragOver={(e) => handleDragOver(e, "favicon")}
                                    onDrop={(e) => handleDrop(e, "favicon")}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect(e, "favicon")}
                                        className="hidden"
                                        id="favicon-upload"
                                    />
                                    <label htmlFor="favicon-upload" className="cursor-pointer">
                                        <div className="text-gray-400 mb-2">
                                            <Globe className="w-12 h-12 mx-auto" />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {uploading.favicon ? "Uploading..." : "Click to upload favicon"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">ICO, PNG 32x32px</p>
                                    </label>
                                </div>
                                {settings.branding.favicon && (
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <img src={settings.branding.favicon} alt="Favicon" className="w-8 h-8 object-contain rounded" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700">Current Favicon</p>
                                            <p className="text-xs text-gray-500">Click upload to replace</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>

                        <div className="space-y-4">
                            {[
                                { key: "newBookings", label: "New Booking Notifications", desc: "Receive alerts when a new booking is made" },
                                { key: "bookingCancellations", label: "Booking Cancellations", desc: "Get notified when a booking is cancelled" },
                                { key: "newUsers", label: "New User Registrations", desc: "Alert when a new user signs up" },
                                { key: "propertyInquiries", label: "Property Inquiries", desc: "Notifications for property inquiries" },
                                { key: "reviews", label: "Review Notifications", desc: "Get alerts for new reviews" },
                                { key: "payments", label: "Payment Alerts", desc: "Notifications for payment events" },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{item.label}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                                            onChange={(e) => updateSetting("notifications", item.key as keyof typeof settings.notifications, e.target.checked)}
                                            className="sr-only peer"
                                        />
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
                                    value={settings.email.smtpHost}
                                    onChange={(e) => updateSetting("email", "smtpHost", e.target.value)}
                                    placeholder="smtp.example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                <input
                                    type="text"
                                    value={settings.email.smtpPort}
                                    onChange={(e) => updateSetting("email", "smtpPort", e.target.value)}
                                    placeholder="587"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                                <input
                                    type="text"
                                    value={settings.email.smtpUsername}
                                    onChange={(e) => updateSetting("email", "smtpUsername", e.target.value)}
                                    placeholder="username@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                                <input
                                    type="password"
                                    value={settings.email.smtpPassword}
                                    onChange={(e) => updateSetting("email", "smtpPassword", e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                            <input
                                type="email"
                                value={settings.email.fromEmail}
                                onChange={(e) => updateSetting("email", "fromEmail", e.target.value)}
                                placeholder="noreply@gloryvacation.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleTestEmail}
                                disabled={testingEmail}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testingEmail ? "Sending..." : "Send Test Email"}
                            </button>
                            {testEmailResult && (
                                <div className={`px-4 py-2 rounded-xl text-sm ${
                                    testEmailResult.success
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                    {testEmailResult.message}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                            <input
                                type="text"
                                value={settings.seo.metaTitle}
                                onChange={(e) => updateSetting("seo", "metaTitle", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            <textarea
                                rows={3}
                                value={settings.seo.metaDescription}
                                onChange={(e) => updateSetting("seo", "metaDescription", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                            <input
                                type="text"
                                value={settings.seo.metaKeywords}
                                onChange={(e) => updateSetting("seo", "metaKeywords", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                            <input
                                type="text"
                                value={settings.seo.googleAnalyticsId}
                                onChange={(e) => updateSetting("seo", "googleAnalyticsId", e.target.value)}
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
                                { key: "emailVerification", label: "Require Email Verification", desc: "Users must verify email before accessing account" },
                                { key: "adminApproval", label: "Admin Approval for Hosts", desc: "New host accounts require admin approval" },
                                { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Enable 2FA for admin accounts" },
                                { key: "rateLimiting", label: "Rate Limiting", desc: "Limit API requests to prevent abuse" },
                                ...(session?.user?.email === "akb@tool.com" ? [{ key: "maintenanceMode", label: "Maintenance Mode", desc: "Put the entire site in maintenance mode" }] : []),
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{item.label}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security[item.key as keyof typeof settings.security]}
                                            onChange={(e) => updateSetting("security", item.key as keyof typeof settings.security, e.target.checked)}
                                            className="sr-only peer"
                                        />
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
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                                            errors.password ? "border-red-300" : "border-gray-200"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                                            errors.password ? "border-red-300" : "border-gray-200"
                                        }`}
                                    />
                                </div>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                            )}
                            <button
                                onClick={() => handleChangePassword(currentPassword, newPassword)}
                                disabled={saving}
                                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
