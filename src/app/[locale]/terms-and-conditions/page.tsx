import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-[#F5A623]/5">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Terms & <span className="text-primary">Conditions</span>
                        </h1>
                        <p className="text-[#7E7E7E]">Last updated: December 2024</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-[900px]">
                    <div className="prose prose-lg max-w-none prose-headings:text-[#1C1C1C] prose-p:text-[#7E7E7E] prose-li:text-[#7E7E7E]">
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to Glory Vacation. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
                        </p>
                        <p>
                            Glory Vacation operates as a licensed holiday home operator in Dubai, United Arab Emirates, under the regulations of the Department of Tourism and Commerce Marketing (DTCM).
                        </p>

                        <h2>2. Definitions</h2>
                        <ul>
                            <li><strong>"Platform"</strong> refers to the Glory Vacation website and any associated mobile applications.</li>
                            <li><strong>"Guest"</strong> refers to any individual who books or stays at a property listed on our platform.</li>
                            <li><strong>"Property Owner"</strong> refers to any individual or entity that lists their property with Glory Vacation.</li>
                            <li><strong>"Booking"</strong> refers to a confirmed reservation for a property through our platform.</li>
                        </ul>

                        <h2>3. Booking and Reservations</h2>
                        <p>
                            By making a booking through our platform, you agree to the following:
                        </p>
                        <ul>
                            <li>You are at least 21 years of age and have the legal authority to enter into this agreement.</li>
                            <li>All information provided during the booking process is accurate and complete.</li>
                            <li>You will comply with all property rules and regulations during your stay.</li>
                            <li>You accept responsibility for all individuals included in your booking.</li>
                        </ul>

                        <h2>4. Payment Terms</h2>
                        <p>
                            Payment is required at the time of booking. We accept major credit cards, debit cards, and bank transfers. All prices are displayed in UAE Dirhams (AED) unless otherwise stated.
                        </p>
                        <p>
                            Additional charges may apply including:
                        </p>
                        <ul>
                            <li>Tourism Dirham fee as mandated by DTCM</li>
                            <li>Security deposit (refundable)</li>
                            <li>Cleaning fees (if applicable)</li>
                            <li>Extra guest charges (if exceeding stated capacity)</li>
                        </ul>

                        <h2>5. Cancellation Policy</h2>
                        <p>
                            Please refer to our <a href="/cancellation-policy" className="text-primary">Cancellation Policy</a> for detailed information on cancellation terms and refund procedures.
                        </p>

                        <h2>6. Guest Responsibilities</h2>
                        <p>
                            Guests are expected to:
                        </p>
                        <ul>
                            <li>Treat the property with care and respect</li>
                            <li>Report any damages or issues immediately</li>
                            <li>Comply with building rules and regulations</li>
                            <li>Respect neighbors and maintain appropriate noise levels</li>
                            <li>Vacate the property by the agreed check-out time</li>
                            <li>Not sublet or transfer the booking to third parties</li>
                        </ul>

                        <h2>7. Property Owner Responsibilities</h2>
                        <p>
                            Property owners who list with Glory Vacation agree to:
                        </p>
                        <ul>
                            <li>Maintain valid DTCM licensing for short-term rentals</li>
                            <li>Ensure the property meets all safety and quality standards</li>
                            <li>Provide accurate property descriptions and photographs</li>
                            <li>Maintain the property in good condition</li>
                            <li>Comply with all applicable laws and regulations</li>
                        </ul>

                        <h2>8. Limitation of Liability</h2>
                        <p>
                            Glory Vacation acts as an intermediary between guests and property owners. While we strive to ensure the accuracy of property listings and the quality of stays, we are not liable for:
                        </p>
                        <ul>
                            <li>Acts or omissions of property owners</li>
                            <li>Loss or damage to personal property during stays</li>
                            <li>Injuries occurring at properties (unless due to our negligence)</li>
                            <li>Service interruptions beyond our control</li>
                        </ul>

                        <h2>9. Privacy</h2>
                        <p>
                            Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-primary">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
                        </p>

                        <h2>10. Governing Law</h2>
                        <p>
                            These Terms and Conditions are governed by the laws of the United Arab Emirates. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Dubai.
                        </p>

                        <h2>11. Contact Information</h2>
                        <p>
                            For questions about these Terms and Conditions, please contact us at:
                        </p>
                        <ul>
                            <li>Email: legal@gloryvacation.com</li>
                            <li>Phone: +971 50 350 5752</li>
                            <li>Address: Business Bay, Dubai, UAE</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
