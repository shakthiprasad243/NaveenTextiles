import { Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">Your Privacy Matters</p>
        <h1 className="text-4xl font-serif text-white mt-2">Privacy Policy</h1>
        <p className="text-dark-400 mt-3">Last updated: December 2024</p>
      </div>

      <div className="glass-card-gold rounded-xl p-6 space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Introduction
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            At Naveen Textiles, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" /> Information We Collect
          </h2>
          <div className="space-y-4 text-dark-400 text-sm">
            <div>
              <h4 className="text-dark-200 font-medium mb-2">Personal Information</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Name and contact details (phone number, email address)</li>
                <li>Delivery address</li>
                <li>Order history and preferences</li>
                <li>Communication records (WhatsApp messages, emails)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-dark-200 font-medium mb-2">Automatically Collected Information</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent on our website</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" /> How We Use Your Information
          </h2>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2">• Process and fulfill your orders</li>
            <li className="flex items-start gap-2">• Communicate order updates and delivery status</li>
            <li className="flex items-start gap-2">• Respond to your inquiries and provide customer support</li>
            <li className="flex items-start gap-2">• Send promotional offers and newsletters (with your consent)</li>
            <li className="flex items-start gap-2">• Improve our website and services</li>
            <li className="flex items-start gap-2">• Prevent fraud and ensure security</li>
          </ul>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Data Security
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed mb-4">
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2">• Secure HTTPS encryption for all data transmission</li>
            <li className="flex items-start gap-2">• Limited access to personal data on a need-to-know basis</li>
            <li className="flex items-start gap-2">• Regular security audits and updates</li>
            <li className="flex items-start gap-2">• We never store payment card details on our servers</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" /> Information Sharing
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information. We may share your data only with:
          </p>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2">• Delivery partners (for order fulfillment)</li>
            <li className="flex items-start gap-2">• Payment processors (for secure transactions)</li>
            <li className="flex items-start gap-2">• Legal authorities (when required by law)</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Your Rights
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed mb-4">You have the right to:</p>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2">• Access your personal data we hold</li>
            <li className="flex items-start gap-2">• Request correction of inaccurate information</li>
            <li className="flex items-start gap-2">• Request deletion of your data</li>
            <li className="flex items-start gap-2">• Opt-out of marketing communications</li>
            <li className="flex items-start gap-2">• Withdraw consent at any time</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Contact Us
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </p>
          <div className="mt-4 bg-dark-700/30 rounded-lg p-4">
            <p className="text-dark-300 text-sm">Email: <a href="mailto:privacy@naveentextiles.com" className="text-primary hover:text-primary-light">privacy@naveentextiles.com</a></p>
            <p className="text-dark-300 text-sm mt-1">Phone: <a href="tel:+919876543210" className="text-primary hover:text-primary-light">+91 98765 43210</a></p>
            <p className="text-dark-300 text-sm mt-1">Address: 123, Textile Market, Ring Road, Surat, Gujarat - 395002</p>
          </div>
        </section>
      </div>
    </div>
  );
}
