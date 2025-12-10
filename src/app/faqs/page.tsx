'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. You can complete your order via WhatsApp where our team will assist you with payment and delivery details.' },
      { q: 'What are the delivery charges?', a: 'We offer FREE delivery on orders above ₹1,000. For orders below ₹1,000, a nominal delivery charge of ₹50-100 applies depending on your location.' },
      { q: 'How long does delivery take?', a: 'Local deliveries within Surat are completed within 1-2 business days. For other cities in Gujarat, delivery takes 3-5 business days. Pan-India deliveries take 5-7 business days.' },
      { q: 'Can I track my order?', a: 'Yes! Once your order is shipped, we will share the tracking details via WhatsApp. You can also contact us anytime for order updates.' },
    ]
  },
  {
    category: 'Products & Quality',
    questions: [
      { q: 'Are your products genuine?', a: 'Absolutely! We source all our textiles directly from trusted manufacturers and weavers. Every product goes through quality checks before dispatch.' },
      { q: 'How do I choose the right size?', a: 'Each product page includes a detailed size chart. If you need help, feel free to contact us on WhatsApp and our team will guide you.' },
      { q: 'What fabrics do you offer?', a: 'We offer a wide range including Cotton, Silk, Linen, Chiffon, Georgette, and blended fabrics. Each product description mentions the fabric type.' },
      { q: 'Can I request custom tailoring?', a: 'Yes, we offer custom tailoring services for select products. Contact us via WhatsApp to discuss your requirements.' },
    ]
  },
  {
    category: 'Payments',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), UPI payments (GPay, PhonePe, Paytm), Bank Transfer, and major credit/debit cards.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes, COD is available for most locations. A small COD charge may apply for certain areas.' },
      { q: 'Is online payment secure?', a: 'Yes, all online payments are processed through secure payment gateways. We never store your card details.' },
    ]
  },
  {
    category: 'Quality Assurance',
    questions: [
      { q: 'What if I receive a damaged product?', a: 'We pack all products with utmost care. In the rare case of damage during transit, please contact us within 24 hours with photos, and we will resolve it immediately.' },
      { q: 'Do you offer exchanges?', a: 'We offer exchanges for size issues within 7 days of delivery, provided the product is unused with original tags intact. Contact us on WhatsApp to initiate an exchange.' },
      { q: 'Why no return policy?', a: 'We take pride in our quality and careful packaging. Each product is inspected and packed with care before shipping. We offer exchanges for genuine size issues but do not accept returns to maintain product hygiene and quality standards.' },
    ]
  },
];

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-medium">Help Center</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mt-2">Frequently Asked Questions</h1>
        <p className="text-dark-400 mt-3 text-sm md:text-base">Find answers to common questions about orders, shipping, and more.</p>
      </div>

      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        {faqs.map((section, sIdx) => (
          <div key={sIdx} className="glass-card-gold rounded-xl p-4 md:p-5 lg:p-6">
            <h2 className="text-primary font-medium mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
              {section.category}
            </h2>
            <div className="space-y-2 md:space-y-3">
              {section.questions.map((item, qIdx) => {
                const id = `${sIdx}-${qIdx}`;
                const isOpen = openItems.includes(id);
                return (
                  <div key={qIdx} className="border-b border-dark-700/50 last:border-0 pb-2 md:pb-3 last:pb-0">
                    <button onClick={() => toggleItem(id)} className="w-full flex items-center justify-between text-left py-3 md:py-2 group min-h-[48px]">
                      <span className="text-dark-200 text-sm md:text-base group-hover:text-primary transition pr-4 leading-relaxed">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 md:w-4 md:h-4 text-dark-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pb-3 md:pb-2 animate-fadeIn">
                        <p className="text-dark-400 text-sm md:text-base leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 md:mt-12 text-center glass-card-gold rounded-xl p-6 md:p-8">
        <h3 className="text-dark-200 font-medium mb-2 text-base md:text-lg">Still have questions?</h3>
        <p className="text-dark-400 text-sm md:text-base mb-4 md:mb-6">Our team is here to help you</p>
        <Link href="/contact" className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-block min-h-[48px] flex items-center justify-center">Contact Us</Link>
      </div>
    </div>
  );
}
