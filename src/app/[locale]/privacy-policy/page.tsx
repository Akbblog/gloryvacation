import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-teal-50 to-amber-50">
                <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] mb-4">
                            Privacy <span className="text-teal-600">Policy</span>
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
                            Glory Vacation ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <h3>Personal Information</h3>
                        <p>We may collect personal information that you provide directly to us, including:</p>
                        <ul>
                            <li>Name, email address, and phone number</li>
                            <li>Passport or Emirates ID details (for booking verification)</li>
                            <li>Payment and billing information</li>
                            <li>Communication preferences</li>
                            <li>Booking history and preferences</li>
                        </ul>

                        <h3>Automatically Collected Information</h3>
                        <p>When you visit our website, we automatically collect:</p>
                        <ul>
                            <li>IP address and device information</li>
                            <li>Browser type and version</li>
                            <li>Pages visited and time spent on our site</li>
                            <li>Referral sources</li>
                            <li>Location data (with your consent)</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Process and manage your bookings</li>
                            <li>Communicate with you about your reservations</li>
                            <li>Send marketing communications (with your consent)</li>
                            <li>Improve our services and website</li>
                            <li>Comply with legal obligations</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>

                        <h2>4. Information Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul>
                            <li><strong>Property Owners:</strong> Essential information needed to facilitate your stay</li>
                            <li><strong>Service Providers:</strong> Third parties who assist in our operations (payment processors, cleaning services)</li>
                            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Partners:</strong> With your consent for marketing purposes</li>
                        </ul>
                        <p>We do not sell your personal information to third parties.</p>

                        <h2>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul>
                            <li>SSL encryption for all data transmission</li>
                            <li>Secure data storage with access controls</li>
                            <li>Regular security audits and updates</li>
                            <li>Staff training on data protection</li>
                        </ul>

                        <h2>6. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Typically, booking records are retained for 7 years for tax and legal purposes.
                        </p>

                        <h2>7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct inaccurate personal information</li>
                            <li>Request deletion of your data (subject to legal requirements)</li>
                            <li>Object to or restrict processing of your data</li>
                            <li>Withdraw consent at any time</li>
                            <li>Lodge a complaint with a supervisory authority</li>
                        </ul>

                        <h2>8. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience on our website. Cookies help us:
                        </p>
                        <ul>
                            <li>Remember your preferences</li>
                            <li>Analyze website traffic</li>
                            <li>Personalize content</li>
                            <li>Enable social media features</li>
                        </ul>
                        <p>You can manage cookie preferences through your browser settings.</p>

                        <h2>9. Children's Privacy</h2>
                        <p>
                            Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
                        </p>

                        <h2>10. Updates to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
                        </p>

                        <h2>11. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <ul>
                            <li>Email: privacy@gloryvacation.com</li>
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
