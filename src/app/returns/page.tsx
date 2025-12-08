import { ShieldCheck, Package, RefreshCw, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-sm uppercase tracking-wider font-medium">Quality Assurance</p>
        <h1 className="text-4xl font-serif text-white mt-2">Exchange Policy</h1>
        <p className="text-dark-400 mt-3">Our commitment to quality and customer satisfaction</p>
      </div>

      {/* Important Notice */}
      <div className="glass-card rounded-xl p-6 mb-8 border border-primary/30 bg-primary/5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-primary font-medium mb-2">No Return Policy</h3>
            <p className="text-dark-300 text-sm leading-relaxed">
              At Naveen Textiles, we take immense pride in the quality of our products. Each item is carefully inspected, packed with utmost care, and delivered with trusted service. Due to the nature of textile products and to maintain hygiene standards, <strong className="text-dark-200">we do not accept returns</strong>. However, we offer exchanges for genuine size-related issues.
            </p>
          </div>
        </div>
      </div>

      {/* Why No Returns */}
      <div className="glass-card-gold rounded-xl p-6 mb-8">
        <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Why We Don't Accept Returns
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Quality Assurance', desc: 'Every product undergoes strict quality checks before dispatch' },
            { title: 'Hygiene Standards', desc: 'Textiles are personal items; we maintain hygiene for all customers' },
            { title: 'Careful Packaging', desc: 'Products are packed with care to prevent any damage during transit' },
            { title: 'Trusted Service', desc: 'We stand behind our products with reliable, honest service' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-dark-200 font-medium text-sm">{item.title}</p>
                <p className="text-dark-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Policy */}
      <div className="glass-card-gold rounded-xl p-6 mb-8">
        <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" /> Exchange Policy
        </h2>
        <p className="text-dark-400 text-sm mb-4">We understand that sometimes sizes may not fit as expected. Here's our exchange policy:</p>
        
        <div className="space-y-4">
          <div className="bg-dark-700/30 rounded-lg p-4">
            <h4 className="text-dark-200 font-medium text-sm mb-2">Eligible for Exchange</h4>
            <ul className="space-y-2 text-dark-400 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Size exchange within 7 days of delivery</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Product must be unused, unwashed, and in original condition</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> All original tags and packaging must be intact</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Original invoice/receipt required</li>
            </ul>
          </div>

          <div className="bg-dark-700/30 rounded-lg p-4">
            <h4 className="text-dark-200 font-medium text-sm mb-2">Not Eligible for Exchange</h4>
            <ul className="space-y-2 text-dark-400 text-sm">
              <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> Products that have been worn, washed, or altered</li>
              <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> Items without original tags or packaging</li>
              <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> Sale or discounted items</li>
              <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /> Customized or tailored products</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Damaged Products */}
      <div className="glass-card-gold rounded-xl p-6 mb-8">
        <h2 className="text-primary font-medium mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> Damaged or Defective Products
        </h2>
        <p className="text-dark-400 text-sm mb-4">
          In the rare case that you receive a damaged or defective product, we're here to help:
        </p>
        <ul className="space-y-2 text-dark-400 text-sm">
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Contact us within 24 hours of delivery</li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Share clear photos of the damage via WhatsApp</li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> We will arrange for replacement or full refund</li>
          <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> No questions asked for genuine cases</li>
        </ul>
      </div>

      {/* Contact */}
      <div className="text-center glass-card-gold rounded-xl p-8">
        <Phone className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-dark-200 font-medium mb-2">Need Help with an Exchange?</h3>
        <p className="text-dark-400 text-sm mb-4">Contact us on WhatsApp for quick assistance</p>
        <Link href="/contact" className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-block">Contact Us</Link>
      </div>
    </div>
  );
}
