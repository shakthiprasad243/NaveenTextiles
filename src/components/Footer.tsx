'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, CreditCard, Truck, ShieldCheck, HeadphonesIcon } from 'lucide-react';

// Custom social icons as SVG components
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

export default function Footer() {
  return (
    <footer className="glass-card-gold gold-border-top mt-12">
      {/* Trust Badges */}
      <div className="border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹1000' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: CreditCard, title: 'Easy Returns', desc: '7 days return policy' },
              { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated support' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-100">{item.title}</p>
                  <p className="text-xs text-dark-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo.png" 
                alt="Naveen Textiles" 
                width={70} 
                height={70} 
                className="h-16 w-auto rounded-lg"
              />
              <span className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
                Naveen Textiles
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Your trusted destination for premium quality textiles since 1995. We bring you the finest fabrics from across India.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-dark-400 hover:text-primary hover:bg-primary/10 transition">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-dark-400 hover:text-primary hover:bg-primary/10 transition">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-dark-400 hover:text-primary hover:bg-primary/10 transition">
                <TwitterIcon />
              </a>
              <a href="#" aria-label="Youtube" className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-dark-400 hover:text-primary hover:bg-primary/10 transition">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-primary font-medium mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Shop All', href: '/products' },
                { label: 'New Arrivals', href: '/products?new=true' },
                { label: 'Best Sellers', href: '/products?bestseller=true' },
                { label: 'Sale', href: '/products?sale=true' },
                { label: 'Track Order', href: '/track-order' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-dark-400 hover:text-primary text-sm transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-primary font-medium mb-4 uppercase tracking-wider text-sm">Customer Service</h4>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Return Policy', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-dark-400 hover:text-primary text-sm transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-primary font-medium mb-4 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-dark-200 text-sm font-medium">Store Location</p>
                  <p className="text-dark-400 text-sm">123, Textile Market, Ring Road,<br />Surat, Gujarat - 395002</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-dark-200 text-sm font-medium">Phone</p>
                  <a href="tel:+919876543210" className="text-dark-400 hover:text-primary text-sm transition">+91 98765 43210</a>
                  <br />
                  <a href="tel:+919876543211" className="text-dark-400 hover:text-primary text-sm transition">+91 98765 43211</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-dark-200 text-sm font-medium">Email</p>
                  <a href="mailto:info@naveentextiles.com" className="text-dark-400 hover:text-primary text-sm transition">info@naveentextiles.com</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-dark-200 text-sm font-medium">Business Hours</p>
                  <p className="text-dark-400 text-sm">Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p className="text-dark-400 text-sm">Sunday: Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-dark-100 font-medium">Subscribe to our Newsletter</h4>
              <p className="text-dark-400 text-sm">Get updates on new arrivals and exclusive offers</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 glass-card rounded-lg text-dark-100 placeholder-dark-400 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
              <button type="submit" className="btn-glossy px-6 py-2 rounded-lg text-sm font-medium text-dark-900">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary/20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-dark-500 text-xs">
              © 2024 Naveen Textiles. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-dark-500 text-xs">We Accept:</span>
              <div className="flex gap-2">
                {['Visa', 'Mastercard', 'UPI', 'COD'].map((method, i) => (
                  <span key={i} className="px-2 py-1 glass-card rounded text-xs text-dark-400">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
