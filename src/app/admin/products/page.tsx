'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { supabase, DbProduct, DbProductVariant } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X, Package, Save, ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';

const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];
const subCategoriesMap: Record<string, string[]> = {
  'Men': ['Shirts', 'Kurtas', 'Trousers', 'Ethnic Wear', 'Fabrics'],
  'Women': ['Sarees', 'Kurtas', 'Dress Materials', 'Dupattas', 'Blouses'],
  'Kids': ['Boys Wear', 'Girls Wear', 'School Uniforms', 'Ethnic Kids'],
  'Home & Living': ['Bedsheets', 'Curtains', 'Cushion Covers', 'Table Linen']
};

// Transform Supabase data to local Product type
function transformProduct(dbProduct: DbProduct & { product_variants: DbProductVariant[] }): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    images: dbProduct.product_variants[0]?.images || [],
    category: dbProduct.category || '',
    mainCategory: dbProduct.main_category || '',
    price: dbProduct.base_price,
    variations: dbProduct.product_variants.map(v => ({
      size: v.size || '',
      color: v.color || '',
      stock: v.stock_qty,
      variantId: v.id
    })),
    active: dbProduct.active
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mainCategory: '',
    category: '',
    images: [''],
    variations: [{ size: '', color: '', stock: '' }] as { size: string; color: string; stock: string }[]
  });

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_variants (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(transformProduct));
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.mainCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      mainCategory: mainCategories[0] || '',
      category: '',
      images: [''],
      variations: [{ size: '', color: '', stock: '' }]
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      mainCategory: product.mainCategory || '',
      category: product.category,
      images: product.images.length > 0 ? product.images : [''],
      variations: product.variations.map(v => ({
        size: v.size,
        color: v.color,
        stock: v.stock.toString()
      }))
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (editingProduct) {
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            base_price: parseFloat(formData.price) || 0,
            main_category: formData.mainCategory,
            category: formData.category
          })
          .eq('id', editingProduct.id);

        if (productError) throw productError;

        // Delete existing variants and create new ones
        await supabase.from('product_variants').delete().eq('product_id', editingProduct.id);

        const variants = formData.variations
          .filter(v => v.size && v.color)
          .map(v => ({
            product_id: editingProduct.id,
            sku: `${slug}-${v.size}-${v.color}`.toLowerCase().replace(/\s+/g, '-'),
            size: v.size,
            color: v.color,
            stock_qty: parseInt(v.stock) || 0,
            reserved_qty: 0,
            images: formData.images.filter(img => img.trim() !== '')
          }));

        if (variants.length > 0) {
          const { error: variantError } = await supabase.from('product_variants').insert(variants);
          if (variantError) throw variantError;
        }
      } else {
        // Create new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            slug,
            description: formData.description,
            base_price: parseFloat(formData.price) || 0,
            main_category: formData.mainCategory,
            category: formData.category,
            active: true
          })
          .select()
          .single();

        if (productError || !newProduct) throw productError;

        // Create variants
        const variants = formData.variations
          .filter(v => v.size && v.color)
          .map(v => ({
            product_id: newProduct.id,
            sku: `${slug}-${v.size}-${v.color}`.toLowerCase().replace(/\s+/g, '-'),
            size: v.size,
            color: v.color,
            stock_qty: parseInt(v.stock) || 0,
            reserved_qty: 0,
            images: formData.images.filter(img => img.trim() !== '')
          }));

        if (variants.length > 0) {
          const { error: variantError } = await supabase.from('product_variants').insert(variants);
          if (variantError) throw variantError;
        }
      }

      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  const toggleProductStatus = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, { size: '', color: '', stock: '' }]
    }));
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-white">Products</h1>
          <p className="text-dark-400 text-sm">{products.length} total products</p>
        </div>
        <button onClick={openAddModal} className="btn-glossy px-4 py-2.5 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card-gold rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer min-w-[150px]"
            >
              <option value="">All Categories</option>
              {mainCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card-gold rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20 bg-dark-800/50">
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Product</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium hidden md:table-cell">Category</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Price</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium hidden sm:table-cell">Stock</th>
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Status</th>
                <th className="text-right py-4 px-4 text-dark-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0);
                const isLowStock = totalStock < 10;
                return (
                  <tr key={product.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-dark-700 overflow-hidden flex-shrink-0 relative">
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-dark-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-dark-200 font-medium truncate">{product.name}</p>
                          <p className="text-primary/70 text-xs truncate md:hidden">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-white">{product.mainCategory}</span>
                      <span className="text-primary/70 text-xs block">{product.category}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-primary font-medium">₹{product.price.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded text-xs ${isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {totalStock} units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition ${product.active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-dark-600 text-dark-400 hover:bg-dark-500'
                          }`}
                      >
                        {product.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {product.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <p className="text-dark-400">No products found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card-gold rounded-xl p-6 max-w-sm w-full animate-fadeIn">
            <h3 className="text-dark-200 font-medium text-lg mb-2">Delete Product?</h3>
            <p className="text-dark-400 text-sm mb-6">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card-gold rounded-xl w-full max-w-2xl my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/20">
              <h3 className="text-primary font-medium text-lg">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-dark-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-dark-300 text-sm mb-2 block">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-dark-300 text-sm mb-2 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-2 block">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-2 block">Main Category *</label>
                  <select
                    value={formData.mainCategory}
                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value, category: '' })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="">Select Category</option>
                    {mainCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-dark-300 text-sm mb-2 block">Sub Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                    disabled={!formData.mainCategory}
                  >
                    <option value="">Select Sub Category</option>
                    {formData.mainCategory && subCategoriesMap[formData.mainCategory]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-dark-300 text-sm">Product Images</label>
                  <button onClick={addImageField} className="text-primary text-xs hover:text-primary-light flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateImage(idx, e.target.value)}
                        className="flex-1 px-4 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Image URL"
                      />
                      {formData.images.length > 1 && (
                        <button onClick={() => removeImage(idx)} className="p-2.5 text-dark-400 hover:text-red-400 transition">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-dark-300 text-sm">Variations (Size, Color, Stock)</label>
                  <button onClick={addVariation} className="text-primary text-xs hover:text-primary-light flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Variation
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.variations.map((variation, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={variation.size}
                        onChange={(e) => updateVariation(idx, 'size', e.target.value)}
                        className="flex-1 px-3 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Size (S, M, L...)"
                      />
                      <input
                        type="text"
                        value={variation.color}
                        onChange={(e) => updateVariation(idx, 'color', e.target.value)}
                        className="flex-1 px-3 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Color"
                      />
                      <input
                        type="number"
                        value={variation.stock}
                        onChange={(e) => updateVariation(idx, 'stock', e.target.value)}
                        className="w-20 px-3 py-2.5 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Stock"
                      />
                      {formData.variations.length > 1 && (
                        <button onClick={() => removeVariation(idx)} className="p-2.5 text-dark-400 hover:text-red-400 transition">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-primary/20">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg text-sm text-dark-300 border border-dark-600 hover:border-dark-500">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.price || !formData.mainCategory || saving}
                className="flex-1 btn-glossy py-3 rounded-lg text-sm font-medium text-dark-900 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
