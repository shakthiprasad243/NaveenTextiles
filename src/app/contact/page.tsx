'use client';

import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate WhatsApp message
    const message = `New Contact Inquiry\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400 text-xs md:text-sm uppercase tracking-wider font-medium">Get in Touch</p>
        <h1 className="text-3xl md:text-4xl font-serif text-white mt-2">Contact Us</h1>
        <p className="text-dark-400 text-sm md:text-base mt-3 md:mt-4 max-w-2xl mx-auto">Have questions? We&apos;re here to help. Send us a message and we&apos;ll respond as soon as possible.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
        {/* Contact Info */}
        <div className="space-y-4 md:space-y-6">
          <div className="glass-card-gold rounded-xl p-5 md:p-6">
            <h3 className="text-primary font-medium mb-4 md:mb-6 text-sm md:text-base">Contact Information</h3>
            <div className="space-y-4 md:space-y-5">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-dark-200 font-medium">Store Location</p>
                  <p className="text-dark-400 text-sm mt-1">123, Textile Market, Ring Road,<br />Surat, Gujarat - 395002</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-dark-200 font-medium">Phone</p>
                  <a href="tel:+919876543210" className="text-dark-400 hover:text-primary text-sm transition block mt-1">+91 98765 43210</a>
                  <a href="tel:+919876543211" className="text-dark-400 hover:text-primary text-sm transition block">+91 98765 43211</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-dark-200 font-medium">Email</p>
                  <a href="mailto:info@naveentextiles.com" className="text-dark-400 hover:text-primary text-sm transition block mt-1">info@naveentextiles.com</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-dark-200 font-medium">Business Hours</p>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map placeholder - Better mobile height */}
          <div className="glass-card-gold rounded-xl p-5 md:p-6 h-48 md:h-56 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-3" />
              <p className="text-dark-400 text-sm md:text-base font-medium">Visit our store</p>
              <p className="text-dark-500 text-xs md:text-sm mt-1">Surat, Gujarat</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card-gold rounded-xl p-5 md:p-6">
          <h3 className="text-primary font-medium mb-4 md:mb-6 text-sm md:text-base">Send us a Message</h3>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-dark-200 font-medium text-lg">Message Sent!</h4>
              <p className="text-dark-400 text-sm mt-2">We&apos;ll get back to you soon.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-primary hover:text-primary-light text-sm">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Your Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500" placeholder="Enter your name" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-dark-300 text-sm mb-2 block">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-2 block">Phone</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Message</label>
                <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500 resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full btn-glossy py-3 rounded-lg text-sm font-medium text-dark-900 flex items-center justify-center gap-2 min-h-[48px]">
                <Send className="w-4 h-4" /> Send via WhatsApp
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
