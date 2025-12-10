'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, ChevronDown, LogIn, Shield, LogOut, Package, Search, Loader2, Tag, TrendingUp, Phone } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  mainCategory: string;
  price: number;
  image?: string;
}

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];

const megaMenuData: Record<string, { title: string; items: string[] }[]> = {
  'Men': [
    { title: 'Topwear', items: ['Shirts', 'T-Shirts', 'Kurtas', 'Jackets'] },
    { title: 'Bottomwear', items: ['Pants', 'Trousers', 'Jeans', 'Shorts'] },
    { title: 'Ethnic Wear', items: ['Kurta Sets', 'Sherwanis', 'Nehru Jackets', 'Dhotis'] },
    { title: 'Fabrics', items: ['Shirt Fabrics', 'Trouser Fabrics', 'Suit Fabrics', 'Cotton Fabrics'] }
  ],
  'Women': [
    { title: 'Indian Wear', items: ['Sarees', 'Kurtas', 'Dress Materials', 'Lehengas'] },
    { title: 'Western Wear', items: ['Tops', 'Pants', 'Skirts', 'Dresses'] },
    { title: 'Accessories', items: ['Dupattas', 'Blouses', 'Salwar Suits', 'Stoles'] },
    { title: 'Fabrics', items: ['Silk Fabrics', 'Cotton Fabrics', 'Georgette', 'Chiffon'] }
  ],
  'Kids': [
    { title: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Pants', 'Shorts'] },
    { title: 'Girls Clothing', items: ['Dresses', 'Tops', 'Leggings', 'Skirts'] },
    { title: 'Ethnic Wear', items: ['Boys Kurta Sets', 'Girls Lehengas', 'Ethnic Dresses'] },
    { title: 'School Wear', items: ['School Uniforms', 'School Shoes', 'Bags', 'Accessories'] }
  ],
  'Home & Living': [
    { title: 'Bedding', items: ['Bedsheets', 'Pillow Covers', 'Blankets', 'Mattress Protectors'] },
    { title: 'Bath', items: ['Towels', 'Bath Mats', 'Bathrobes', 'Shower Curtains'] },
    { title: 'Living Room', items: ['Curtains', 'Cushion Covers', 'Sofa Covers', 'Rugs'] },
    { title: 'Kitchen & Dining', items: ['Table Linen', 'Kitchen Towels', 'Aprons', 'Placemats'] }
  ]
};

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [cartBounce, setCartBounce] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  // Trigger bounce animation when cart count changes
  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Cleanup dropdown timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setCategorySuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Fetch matching products
      const { data: products } = await supabase
        .from('products')
        .select(`id, name, category, main_category, base_price, product_variants(images)`)
        .eq('active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(5);

      if (products) {
        const formattedSuggestions: SearchSuggestion[] = products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || '',
          mainCategory: p.main_category || '',
          price: p.base_price,
          image: p.product_variants?.[0]?.images?.[0]
        }));
        setSuggestions(formattedSuggestions);

        // Extract unique categories from results
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        setCategorySuggestions(categories.slice(0, 3));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/products?search=${encodeURIComponent(category)}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header Bar */}
      <div className="glass-card-gold relative z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo with hover effect - Improved mobile sizing */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0 relative z-50 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="Naveen Textiles" 
                  width={60} 
                  height={60} 
                  className="h-10 md:h-12 lg:h-14 w-auto rounded-lg group-hover:scale-105 transition-transform"
                  priority
                />
                <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/10 transition-colors" />
              </div>
              <span className="text-base md:text-xl lg:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500 hidden sm:inline group-hover:from-primary group-hover:to-gold-400 transition-all">
                Naveen Textiles
              </span>
            </Link>

            {/* Categories - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 relative z-50">
              {mainCategories.map(category => (
                <div
                  key={category}
                  className="relative"
                  onMouseEnter={() => {
                    // Clear any existing timeout
                    if (dropdownTimeout) {
                      clearTimeout(dropdownTimeout);
                      setDropdownTimeout(null);
                    }
                    setActiveDropdown(category);
                  }}
                  onMouseLeave={() => {
                    // Set timeout to close dropdown after delay
                    const timeout = setTimeout(() => {
                      setActiveDropdown(null);
                    }, 200);
                    setDropdownTimeout(timeout);
                  }}
                >
                  <Link
                    href={`/products?main=${encodeURIComponent(category)}`} 
                    className={`flex items-center gap-1 px-4 py-2 text-dark-200 hover:text-primary transition rounded-lg cursor-pointer ${activeDropdown === category ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
                  >
                    {category}
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === category ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-1 md:gap-4 relative z-50">
              {/* Search Button with pulse effect - Better mobile touch target */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-3 md:p-2 text-dark-200 hover:text-primary transition relative group min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-primary/10"
                aria-label="Search products"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              </button>

              <Link href="/cart" className="relative p-3 md:p-2 text-dark-200 hover:text-primary transition group min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-primary/10">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-gradient-to-br from-primary-light to-primary text-dark-900 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg shadow-primary/40 ${cartBounce ? 'animate-bounce-once' : ''}`}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Admin Panel Button - Visible when user is admin */}
              {user?.isAdmin && (
                <Link 
                  href="/admin" 
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/20 to-gold-500/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/10 transition text-sm font-medium"
                  title="Admin Panel"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              )}

              {user ? (
                <div 
                  className="relative"
                  data-testid="user-menu"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <button className="flex items-center gap-2 p-2 text-dark-200 hover:text-primary transition min-h-[48px] rounded-lg hover:bg-primary/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline text-sm max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-56 glass-card-gold rounded-xl py-2 shadow-xl z-[60]">
                      <div className="px-4 py-3 border-b border-dark-700/50">
                        <p className="text-dark-200 font-medium text-sm">{user.name}</p>
                        <p className="text-dark-300 text-xs truncate">{user.email}</p>
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
                        onClick={async () => { 
                          setUserMenuOpen(false);
                          await logout();
                        }} 
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1" data-testid="auth-links">
                  <Link href="/login" className="flex items-center gap-2 px-3 py-2.5 text-dark-200 hover:text-primary transition gold-border rounded-lg hover:bg-primary/5 min-h-[48px]">
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Sign In</span>
                  </Link>
                  <Link href="/register" className="hidden sm:flex items-center gap-2 px-3 py-2.5 btn-glossy rounded-lg text-sm font-medium text-dark-900 min-h-[48px]">
                    <User className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              )}

              <button className="lg:hidden p-3 text-dark-200 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-primary/10 transition" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-full z-[100]">
          <div className="glass-card-gold border-t border-primary/20 shadow-xl">
            <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, categories..."
                  className="w-full pl-12 pr-28 md:pr-24 py-4 md:py-3.5 glass-card rounded-xl text-dark-200 placeholder-dark-500 outline-none focus:ring-2 focus:ring-primary/50 transition text-base"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-28 md:right-24 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-24 md:right-20 top-1/2 -translate-y-1/2 p-2 text-dark-400 hover:text-dark-200 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-glossy px-3 md:px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium text-dark-900 min-h-[44px]"
                >
                  <span className="hidden sm:inline">Search</span>
                  <Search className="w-4 h-4 sm:hidden" />
                </button>
              </form>

              {/* Search Suggestions */}
              {searchQuery.length >= 2 && (suggestions.length > 0 || categorySuggestions.length > 0) && (
                <div className="mt-4 space-y-4">
                  {/* Category Suggestions */}
                  {categorySuggestions.length > 0 && (
                    <div>
                      <p className="text-xs text-dark-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categorySuggestions.map(cat => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className="px-3 py-1.5 glass-card rounded-lg text-sm text-dark-300 hover:text-primary hover:bg-primary/10 transition flex items-center gap-1"
                          >
                            <Search className="w-3 h-3" />
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-xs text-dark-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Products
                      </p>
                      <div className="space-y-2">
                        {suggestions.map(product => (
                          <button
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.id)}
                            className="w-full flex items-center gap-3 p-2 glass-card rounded-lg hover:bg-primary/10 transition text-left group"
                          >
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-dark-300" />
                                </div>
                              )}
                            </div>
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-dark-200 text-sm font-medium truncate group-hover:text-primary transition">
                                {product.name}
                              </p>
                              <p className="text-dark-300 text-xs">
                                {product.mainCategory} {product.category && `› ${product.category}`}
                              </p>
                            </div>
                            {/* Price */}
                            <p className="text-primary font-medium text-sm">
                              ₹{product.price.toLocaleString()}
                            </p>
                          </button>
                        ))}
                      </div>
                      {/* View All Results */}
                      <button
                        onClick={handleSearch}
                        className="w-full mt-2 py-2 text-center text-sm text-primary hover:text-primary-light transition"
                      >
                        View all results for &quot;{searchQuery}&quot; →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {searchQuery.length >= 2 && !isSearching && suggestions.length === 0 && categorySuggestions.length === 0 && (
                <div className="mt-4 text-center py-4">
                  <p className="text-dark-400 text-sm">No products found for &quot;{searchQuery}&quot;</p>
                  <p className="text-dark-300 text-xs mt-1">Try a different search term</p>
                </div>
              )}

              {/* Popular Searches - Show when no query */}
              {searchQuery.length < 2 && (
                <div className="mt-4">
                  <p className="text-xs text-dark-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Shirts', 'Sarees', 'Kurtas', 'Bedsheets', 'Cotton', 'Silk'].map(term => (
                      <button
                        key={term}
                        onClick={() => {
                          router.push(`/products?search=${encodeURIComponent(term)}`);
                          setSearchOpen(false);
                        }}
                        className="px-3 py-1.5 glass-card rounded-lg text-sm text-dark-400 hover:text-primary hover:bg-primary/10 transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Click outside to close */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => { setSearchOpen(false); setSuggestions([]); }}
          />
        </div>
      )}

      {/* Mega Menu Dropdown */}
      <div 
        className={`hidden lg:block absolute left-0 right-0 z-[100] transition-all duration-200 ${activeDropdown ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onMouseEnter={() => {
          // Clear any pending close timeout when entering dropdown
          if (dropdownTimeout) {
            clearTimeout(dropdownTimeout);
            setDropdownTimeout(null);
          }
        }}
        onMouseLeave={() => {
          // Set timeout to close dropdown after delay
          const timeout = setTimeout(() => {
            setActiveDropdown(null);
          }, 200);
          setDropdownTimeout(timeout);
        }}
        style={{ top: '64px' }}
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

      {/* Mobile Menu - Improved spacing and touch targets */}
      {menuOpen && (
        <nav className="lg:hidden glass-card-gold gold-border-top px-4 py-6 max-h-[75vh] overflow-y-auto relative z-50">
          {/* User section for mobile */}
          {user && (
            <div className="mb-6 pb-6 border-b border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-600 flex items-center justify-center text-dark-900 text-lg font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-dark-200 font-medium">{user.name}</p>
                  <p className="text-dark-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2.5 glass-card rounded-lg text-sm text-dark-300 hover:text-primary transition min-h-[44px]"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Account
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 px-3 py-2.5 glass-card rounded-lg text-sm text-dark-300 hover:text-primary transition min-h-[44px]"
                  onClick={() => setMenuOpen(false)}
                >
                  <Package className="w-4 h-4" /> Orders
                </Link>
              </div>
            </div>
          )}

          {/* Auth links for non-logged in users */}
          {!user && (
            <div className="mb-6 pb-6 border-b border-primary/20">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 gold-border rounded-lg text-dark-200 hover:text-primary transition min-h-[48px]"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-4 py-3 btn-glossy rounded-lg text-dark-900 font-medium transition min-h-[48px]"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Categories */}
          {mainCategories.map(category => (
            <div key={category} className="mb-6">
              <Link
                href={`/products?main=${encodeURIComponent(category)}`}
                className="block text-primary font-medium mb-4 text-lg py-3 min-h-[48px] flex items-center justify-between glass-card px-4 rounded-lg hover:bg-primary/10 transition"
                onClick={() => setMenuOpen(false)}
              >
                {category}
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </Link>
              <div className="grid grid-cols-1 gap-2 pl-2">
                {megaMenuData[category]?.slice(0, 2).map((section, idx) => (
                  <div key={idx} className="mb-3">
                    <p className="text-xs text-dark-400 uppercase tracking-wider mb-2 font-semibold px-2">{section.title}</p>
                    {section.items.slice(0, 4).map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={`/products?main=${encodeURIComponent(category)}&sub=${encodeURIComponent(item)}`}
                        className="block text-sm text-dark-300 hover:text-primary py-2.5 px-3 rounded-lg hover:bg-primary/10 transition min-h-[44px] flex items-center"
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

          {/* Quick Links */}
          <div className="pt-6 border-t border-primary/20">
            <p className="text-xs text-dark-400 uppercase tracking-wider mb-3 font-semibold px-2">Quick Links</p>
            <div className="space-y-2">
              {[
                { label: 'Contact Us', href: '/contact', icon: Phone },
                { label: 'Track Order', href: '/track-order', icon: Package },
                { label: 'FAQs', href: '/faqs', icon: User }
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-dark-300 hover:text-primary transition min-h-[44px] rounded-lg hover:bg-primary/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Logout for logged in users */}
          {user && (
            <div className="pt-4 mt-4 border-t border-primary/20">
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition min-h-[44px] rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
