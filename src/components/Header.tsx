'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, ChevronDown, LogIn, Shield, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];

const megaMenuData: Record<string, { title: string; items: string[] }[]> = {
  'Men': [
    { title: 'Topwear', items: ['Shirts', 'T-Shirts', 'Kurtas', 'Formal Shirts'] },
    { title: 'Bottomwear', items: ['Trousers', 'Jeans', 'Shorts', 'Track Pants'] },
    { title: 'Ethnic Wear', items: ['Kurta Sets', 'Sherwanis', 'Nehru Jackets', 'Dhotis'] },
    { title: 'Fabrics', items: ['Shirt Fabrics', 'Trouser Fabrics', 'Suit Fabrics', 'Cotton Fabrics'] }
  ],
  'Women': [
    { title: 'Indian Wear', items: ['Sarees', 'Kurtas', 'Dress Materials', 'Lehenga Choli'] },
    { title: 'Western Wear', items: ['Tops', 'Dresses', 'Jeans', 'Skirts'] },
    { title: 'Accessories', items: ['Dupattas', 'Stoles', 'Blouses', 'Petticoats'] },
    { title: 'Fabrics', items: ['Silk Fabrics', 'Cotton Fabrics', 'Georgette', 'Chiffon'] }
  ],
  'Kids': [
    { title: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Jeans', 'Shorts'] },
    { title: 'Girls Clothing', items: ['Dresses', 'Tops', 'Leggings', 'Skirts'] },
    { title: 'Ethnic Wear', items: ['Boys Kurta Sets', 'Girls Lehengas', 'Ethnic Dresses'] },
    { title: 'School Wear', items: ['Uniforms', 'School Shoes', 'Bags', 'Accessories'] }
  ],
  'Home & Living': [
    { title: 'Bedding', items: ['Bedsheets', 'Pillow Covers', 'Blankets', 'Mattress Protectors'] },
    { title: 'Bath', items: ['Towels', 'Bath Mats', 'Bathrobes', 'Shower Curtains'] },
    { title: 'Living Room', items: ['Curtains', 'Cushion Covers', 'Sofa Covers', 'Rugs'] },
    { title: 'Kitchen & Dining', items: ['Table Linen', 'Kitchen Towels', 'Aprons', 'Placemats'] }
  ]
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar */}
      <div className="glass-card-gold relative z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 relative z-50">
              <Image 
                src="/logo.png" 
                alt="Naveen Textiles" 
                width={60} 
                height={60} 
                className="h-12 md:h-14 w-auto rounded-lg"
                priority
              />
              <span className="text-xl md:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500 hidden sm:inline">
                Naveen Textiles
              </span>
            </Link>

            {/* Categories - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 relative z-50">
              {mainCategories.map(category => (
                <div
                  key={category}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(category)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/products?main=${encodeURIComponent(category)}`} 
                    className={`flex items-center gap-1 px-4 py-2 text-dark-200 hover:text-primary transition rounded-lg cursor-pointer ${activeDropdown === category ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
                  >
                    {category}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === category ? 'rotate-180' : ''}`} />
                  </Link>
                  {/* Invisible bridge to connect button to dropdown */}
                  {activeDropdown === category && (
                    <div className="absolute left-0 right-0 h-4 bottom-0 translate-y-full" />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4 relative z-50">
              <Link href="/cart" className="relative p-2 text-dark-200 hover:text-primary transition">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-primary-light to-primary text-dark-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-primary/30">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div 
                  className="relative"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button className="flex items-center gap-2 p-2 text-dark-200 hover:text-primary transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline text-sm max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 glass-card-gold rounded-xl py-2 shadow-xl z-[60]">
                      <div className="px-4 py-3 border-b border-dark-700/50">
                        <p className="text-dark-200 font-medium text-sm">{user.name}</p>
                        <p className="text-dark-500 text-xs truncate">{user.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:text-primary hover:bg-primary/5 transition">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:text-primary hover:bg-primary/5 transition">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition font-medium">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-primary/20 my-1" />
                      <button 
                        onClick={() => { logout(); setUserMenuOpen(false); }} 
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-dark-200 hover:text-primary transition md:gold-border md:rounded-lg md:hover:bg-primary/5">
                  <LogIn className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">Login</span>
                </Link>
              )}

              <button className="lg:hidden p-2 text-dark-200" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <div 
        className={`hidden lg:block absolute left-0 right-0 z-[100] ${activeDropdown ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onMouseEnter={() => activeDropdown && setActiveDropdown(activeDropdown)}
        onMouseLeave={() => setActiveDropdown(null)}
        style={{ top: '60px' }}
      >
        {/* Invisible top padding to bridge the gap */}
        <div className="h-2" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass-card-gold rounded-xl shadow-2xl overflow-hidden">
            {activeDropdown && (
              <div className="p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/20">
                  <h3 className="text-lg font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold-400">
                    {activeDropdown}
                  </h3>
                  <Link
                    href={`/products?main=${encodeURIComponent(activeDropdown)}`}
                    className="text-sm text-primary hover:text-primary-light transition flex items-center gap-1 relative z-[110]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    View All <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-4 gap-8">
                  {megaMenuData[activeDropdown]?.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="text-primary font-medium text-sm mb-3 uppercase tracking-wider">
                        {section.title}
                      </h4>
                      <ul className="space-y-1">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={`/products?main=${encodeURIComponent(activeDropdown)}&sub=${encodeURIComponent(item)}`}
                              className="glossy-item text-dark-300 hover:text-dark-900 text-sm transition-all block py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-gold-500 hover:shadow-md relative z-[110]"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured Banner */}
                <div className="mt-6 pt-4 border-t border-primary/10">
                  <div className="bg-gradient-to-r from-primary/10 to-gold-700/10 rounded-lg p-4 flex items-center justify-between gold-border">
                    <div>
                      <p className="text-primary font-medium">New Arrivals in {activeDropdown}</p>
                      <p className="text-dark-400 text-sm">Discover the latest collection</p>
                    </div>
                    <Link
                      href={`/products?main=${encodeURIComponent(activeDropdown)}`}
                      className="btn-glossy px-4 py-2 rounded-lg text-sm font-medium text-dark-900 relative z-[110]"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Explore Now
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="lg:hidden glass-card-gold gold-border-top px-4 py-4 max-h-[70vh] overflow-y-auto relative z-50">
          {mainCategories.map(category => (
            <div key={category} className="mb-4">
              <Link
                href={`/products?main=${encodeURIComponent(category)}`}
                className="block text-primary font-medium mb-2 text-lg"
                onClick={() => setMenuOpen(false)}
              >
                {category}
              </Link>
              <div className="grid grid-cols-2 gap-2 pl-2">
                {megaMenuData[category]?.map((section, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">{section.title}</p>
                    {section.items.slice(0, 3).map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={`/products?main=${encodeURIComponent(category)}&sub=${encodeURIComponent(item)}`}
                        className="block text-sm text-dark-300 hover:text-primary py-1 px-2 rounded hover:bg-primary/10 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
