import { Truck, Clock, MapPin, Package, CheckCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">Delivery Information</p>
        <h1 className="text-4xl font-serif text-white mt-2">Shipping Policy</h1>
        <p className="text-dark-400 mt-3">Fast and reliable delivery across India</p>
      </div>

      {/* Highlights */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹1,000' },
          { icon: Clock, title: 'Fast Delivery', desc: '1-7 business days' },
          { icon: Package, title: 'Secure Packing', desc: 'Careful handling' },
        ].map((item, i) => (
          <div key={i} className="glass-card-gold rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-dark-200 font-medium">{item.title}</h3>
            <p className="text-dark-400 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card-gold rounded-xl p-6 space-y-8">
        {/* Delivery Zones */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Delivery Zones & Timelines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 text-dark-300 font-medium">Zone</th>
                  <th className="text-left py-3 text-dark-300 font-medium">Areas Covered</th>
                  <th className="text-left py-3 text-dark-300 font-medium">Delivery Time</th>
                  <th className="text-left py-3 text-dark-300 font-medium">Charges</th>
                </tr>
              </thead>
              <tbody className="text-dark-400">
                <tr className="border-b border-dark-700/50">
                  <td className="py-3 text-dark-200">Local</td>
                  <td className="py-3">Surat City & Suburbs</td>
                  <td className="py-3">1-2 Business Days</td>
                  <td className="py-3 text-green-500">FREE above ₹500</td>
                </tr>
                <tr className="border-b border-dark-700/50">
                  <td className="py-3 text-dark-200">Gujarat</td>
                  <td className="py-3">All cities in Gujarat</td>
                  <td className="py-3">3-5 Business Days</td>
                  <td className="py-3 text-green-500">FREE above ₹1,000</td>
                </tr>
                <tr className="border-b border-dark-700/50">
                  <td className="py-3 text-dark-200">Metro Cities</td>
                  <td className="py-3">Mumbai, Delhi, Bangalore, etc.</td>
                  <td className="py-3">4-6 Business Days</td>
                  <td className="py-3 text-green-500">FREE above ₹1,000</td>
                </tr>
                <tr>
                  <td className="py-3 text-dark-200">Rest of India</td>
                  <td className="py-3">All other serviceable areas</td>
                  <td className="py-3">5-7 Business Days</td>
                  <td className="py-3 text-green-500">FREE above ₹1,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Shipping Charges */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Shipping Charges
          </h2>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Orders above ₹1,000 qualify for FREE shipping across India</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Local orders (Surat) above ₹500 get FREE delivery</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> For orders below the free shipping threshold, a flat ₹50-100 charge applies</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Express delivery available at additional cost (contact us for details)</li>
          </ul>
        </section>

        {/* Order Processing */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Order Processing
          </h2>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Orders placed before 2 PM are processed the same day</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Orders placed after 2 PM are processed the next business day</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Processing may take longer during festive seasons or sales</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> You will receive tracking details via WhatsApp once shipped</li>
          </ul>
        </section>

        {/* Packaging */}
        <section>
          <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Secure Packaging
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed">
            At Naveen Textiles, we take great care in packaging your orders. Each product is carefully folded, wrapped in protective material, and placed in sturdy packaging to ensure it reaches you in perfect condition. Delicate items like sarees and silk fabrics receive extra protection with tissue paper and secure boxes.
          </p>
        </section>
      </div>
    </div>
  );
}
