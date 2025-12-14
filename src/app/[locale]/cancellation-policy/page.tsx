import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function CancellationPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Cancellation <span className="text-primary">Policy</span>
                        </h1>
                        <p className="text-[#7E7E7E]">Understanding our booking cancellation and refund terms</p>
                    </div>
                </div>
            </section>

            {/* Policy Overview */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[1000px]">
                    {/* Cancellation Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-6 rounded-2xl bg-green-50 border border-green-200">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">7+ Days Before</h3>
                            <p className="text-3xl font-bold text-green-600 mb-2">100% Refund</p>
                            <p className="text-sm text-[#7E7E7E]">Full refund if cancelled 7 or more days before check-in</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-200">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">3-7 Days Before</h3>
                            <p className="text-3xl font-bold text-yellow-600 mb-2">50% Refund</p>
                            <p className="text-sm text-[#7E7E7E]">Half refund if cancelled 3-7 days before check-in</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">Less than 3 Days</h3>
                            <p className="text-3xl font-bold text-red-600 mb-2">No Refund</p>
                            <p className="text-sm text-[#7E7E7E]">No refund for cancellations within 72 hours of check-in</p>
                        </div>
                    </div>

                    {/* Detailed Policy */}
                    <div className="prose prose-lg max-w-none prose-headings:text-[#1C1C1C] prose-p:text-[#7E7E7E] prose-li:text-[#7E7E7E]">
                        <h2>Standard Cancellation Policy</h2>
                        <p>
                            Our standard cancellation policy applies to most bookings unless otherwise specified in your booking confirmation. Here's what you need to know:
                        </p>

                        <h3>Cancellation Timeframes</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#FAFAFA]">
                                    <th className="border p-3 text-left">Cancellation Time</th>
                                    <th className="border p-3 text-left">Refund Amount</th>
                                    <th className="border p-3 text-left">Processing Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-3">7+ days before check-in</td>
                                    <td className="border p-3">100% of booking amount</td>
                                    <td className="border p-3">5-7 business days</td>
                                </tr>
                                <tr>
                                    <td className="border p-3">3-7 days before check-in</td>
                                    <td className="border p-3">50% of booking amount</td>
                                    <td className="border p-3">5-7 business days</td>
                                </tr>
                                <tr>
                                    <td className="border p-3">Less than 72 hours</td>
                                    <td className="border p-3">No refund</td>
                                    <td className="border p-3">N/A</td>
                                </tr>
                                <tr>
                                    <td className="border p-3">No-show</td>
                                    <td className="border p-3">No refund</td>
                                    <td className="border p-3">N/A</td>
                                </tr>
                            </tbody>
                        </table>

                        <h3>How to Cancel</h3>
                        <p>To cancel your booking:</p>
                        <ol>
                            <li>Log in to your account on our website</li>
                            <li>Navigate to "My Bookings"</li>
                            <li>Select the booking you wish to cancel</li>
                            <li>Click "Cancel Booking" and confirm</li>
                            <li>You will receive a confirmation email with refund details</li>
                        </ol>
                        <p>
                            Alternatively, contact our support team at bookings@gloryvacation.com or call +971 50 350 5752.
                        </p>

                        <h3>Refund Processing</h3>
                        <p>
                            Refunds are processed to the original payment method within 5-7 business days after cancellation approval. Please note that your bank may take additional time to reflect the refund in your account.
                        </p>

                        <h3>Security Deposits</h3>
                        <p>
                            Security deposits are fully refundable and will be returned within 7 days after check-out, provided:
                        </p>
                        <ul>
                            <li>No damage has been reported to the property</li>
                            <li>All keys and access cards have been returned</li>
                            <li>The property has been left in acceptable condition</li>
                            <li>No excessive cleaning is required</li>
                        </ul>

                        <h3>Modifications</h3>
                        <p>
                            If you need to change your booking dates instead of cancelling:
                        </p>
                        <ul>
                            <li>Modifications are subject to availability</li>
                            <li>Price differences may apply based on new dates</li>
                            <li>Contact us at least 48 hours before your original check-in</li>
                        </ul>

                        <h3>Special Circumstances</h3>
                        <p>
                            In exceptional circumstances (natural disasters, government restrictions, medical emergencies), we may offer full refunds or credits regardless of cancellation timing. These are reviewed on a case-by-case basis. Documentation may be required.
                        </p>

                        <h3>Peak Season Policy</h3>
                        <p>
                            During peak seasons (December-January, Easter, Eid holidays), some properties may have stricter cancellation policies:
                        </p>
                        <ul>
                            <li>Full refund requires 14+ days notice</li>
                            <li>50% refund for 7-14 days notice</li>
                            <li>No refund for less than 7 days notice</li>
                        </ul>
                        <p>
                            Any special cancellation terms will be clearly displayed during the booking process.
                        </p>

                        <h2>Questions?</h2>
                        <p>
                            If you have any questions about our cancellation policy, please <Link href="/contact" className="text-primary">contact us</Link>. Our team is available 24/7 to assist you.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
