import { FileText, ShoppingBag, CreditCard, Truck, AlertTriangle, Scale, Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">Legal</p>
        <h1 className="text-4xl font-serif text-white mt-2">Terms & Conditions</h1>
        <p className="text-dark-400 mt-3">Last updated: December 2024</p>
      </div>

      <div className="glass-card-gold rounded-xl p-6 space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Introduction
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            Welcome to Naveen Textiles. By accessing and using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchase. If you do not agree with any part of these terms, please do not use our website.
          </p>
        </section>

        {/* Products & Orders */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Products & Orders
          </h2>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li><strong className="text-dark-300">Product Information:</strong> We strive to display accurate product images and descriptions. However, actual colors may vary slightly due to screen settings and photography lighting.</li>
            <li><strong className="text-dark-300">Availability:</strong> All products are subject to availability. We reserve the right to limit quantities or discontinue products without prior notice.</li>
            <li><strong className="text-dark-300">Order Confirmation:</strong> An order is confirmed only after we verify availability and accept your order via WhatsApp. We reserve the right to cancel orders due to stock issues or pricing errors.</li>
            <li><strong className="text-dark-300">Pricing:</strong> All prices are in Indian Rupees (₹) and inclusive of applicable taxes unless stated otherwise. Prices are subject to change without notice.</li>
          </ul>
        </section>

        {/* Payment Terms */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Payment Terms
          </h2>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li><strong className="text-dark-300">Payment Methods:</strong> We accept Cash on Delivery (COD), UPI, Bank Transfer, and major credit/debit cards.</li>
            <li><strong className="text-dark-300">COD:</strong> Cash on Delivery is available for most locations. Additional COD charges may apply for certain areas.</li>
            <li><strong className="text-dark-300">Online Payments:</strong> All online payments are processed through secure payment gateways. We do not store your card details.</li>
            <li><strong className="text-dark-300">Failed Payments:</strong> In case of payment failure, please retry or contact us for assistance. Do not make duplicate payments.</li>
          </ul>
        </section>

        {/* Shipping & Delivery */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Shipping & Delivery
          </h2>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li><strong className="text-dark-300">Delivery Timeline:</strong> Estimated delivery times are indicative and may vary due to unforeseen circumstances, holidays, or remote locations.</li>
            <li><strong className="text-dark-300">Shipping Charges:</strong> Free shipping is available on orders above the specified threshold. Standard shipping charges apply to other orders.</li>
            <li><strong className="text-dark-300">Delivery Address:</strong> Please ensure your delivery address is accurate and complete. We are not responsible for delays or non-delivery due to incorrect addresses.</li>
            <li><strong className="text-dark-300">Risk of Loss:</strong> Risk of loss and title for products pass to you upon delivery to the carrier.</li>
          </ul>
        </section>

        {/* Exchange Policy */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Exchange Policy (No Returns)
          </h2>
          <div className="bg-dark-700/30 rounded-lg p-4 mb-4">
            <p className="text-dark-300 text-sm">
              <strong>Important:</strong> We do not accept returns. All sales are final. We offer exchanges only for size-related issues within 7 days of delivery, subject to our exchange policy conditions.
            </p>
          </div>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li><strong className="text-dark-300">Exchange Eligibility:</strong> Products must be unused, unwashed, with original tags and packaging intact.</li>
            <li><strong className="text-dark-300">Damaged Products:</strong> Report any damage within 24 hours of delivery with photographic evidence for resolution.</li>
            <li><strong className="text-dark-300">Non-Exchangeable Items:</strong> Sale items, customized products, and items without original tags cannot be exchanged.</li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5" /> Intellectual Property
          </h2>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li>All content on this website including text, images, logos, and designs are the property of Naveen Textiles.</li>
            <li>You may not reproduce, distribute, or use any content without our prior written permission.</li>
            <li>Product images are for illustration purposes and may not be used for commercial purposes.</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Limitation of Liability
          </h2>
          <ul className="space-y-3 text-dark-400 text-sm">
            <li>Naveen Textiles shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
            <li>Our liability is limited to the purchase price of the product in question.</li>
            <li>We are not responsible for delays or failures due to circumstances beyond our control (force majeure).</li>
          </ul>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5" /> Governing Law
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Contact Us
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            For any questions regarding these Terms and Conditions, please contact us:
          </p>
          <div className="mt-4 bg-dark-700/30 rounded-lg p-4">
            <p className="text-dark-300 text-sm">Email: <a href="mailto:legal@naveentextiles.com" className="text-primary hover:text-primary-light">legal@naveentextiles.com</a></p>
            <p className="text-dark-300 text-sm mt-1">Phone: <a href="tel:+919876543210" className="text-primary hover:text-primary-light">+91 98765 43210</a></p>
            <p className="text-dark-300 text-sm mt-1">Address: 123, Textile Market, Ring Road, Surat, Gujarat - 395002</p>
          </div>
        </section>
      </div>
    </div>
  );
}
