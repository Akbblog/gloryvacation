"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsSubmitted(true);
            } else {
                const error = await res.json();
                alert(error.message || "Failed to send message");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Contact <span className="text-primary">Us</span>
                        </h1>
                        <p className="text-lg text-[#7E7E7E]">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info + Form */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#1C1C1C] mb-6">Get in Touch</h2>
                                <p className="text-[#7E7E7E]">
                                    Our team is here to help with bookings, property inquiries, or any questions you may have.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1C1C1C] mb-1">Phone</h3>
                                        <p className="text-[#7E7E7E]">+971 50 350 5752</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1C1C1C] mb-1">Email</h3>
                                        <p className="text-[#7E7E7E]">info@gloryvacation.com</p>
                                        <p className="text-[#7E7E7E]">bookings@gloryvacation.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1C1C1C] mb-1">Office</h3>
                                        <p className="text-[#7E7E7E]">Business Bay, Dubai<br />United Arab Emirates</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1C1C1C] mb-1">Hours</h3>
                                        <p className="text-[#7E7E7E]">24/7 Guest Support</p>
                                        <p className="text-[#7E7E7E]">Office: Sun-Thu 9AM-6PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            {isSubmitted ? (
                                <div className="bg-green-50 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1C1C1C] mb-2">Message Sent!</h3>
                                    <p className="text-[#7E7E7E]">We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-[#FAFAFA] rounded-2xl p-8 md:p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="+971 50 350 5752"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Subject *</label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            >
                                                <option value="">Select subject</option>
                                                <option value="booking">Booking Inquiry</option>
                                                <option value="property">Property Question</option>
                                                <option value="hosting">List My Property</option>
                                                <option value="support">Guest Support</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
