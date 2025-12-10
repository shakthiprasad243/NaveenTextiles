'use client';

// Force dynamic rendering to avoid Clerk prerendering issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase, DbOffer } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Loader2, Tag, Percent, Gift, ToggleLeft, ToggleRight, X, Search } from 'lucide-react';

type DiscountType = 'percentage' | 'fixed' | 'bogo';

interface OfferFormData {
  title: string;
  description: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number | null;
  max_discount: number | null;
  valid_from: string;
  valid_till: string;
  active: boolean;
  usage_limit: number | null;
}

const emptyForm: OfferFormData = {
  title: '',
  description: '',
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_value: null,
  max_discount: null,
  valid_from: new Date().toISOString().split('T')[0],
  valid_till: '',
  active: true,
  usage_limit: null
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<DbOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DbOffer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching offers:', error);
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingOffer(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEditModal(offer: DbOffer) {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      code: offer.code,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_order_value: offer.min_order_value,
      max_discount: offer.max_discount,
      valid_from: offer.valid_from.split('T')[0],
      valid_till: offer.valid_till ? offer.valid_till.split('T')[0] : '',
      active: offer.active,
      usage_limit: offer.usage_limit
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      valid_till: formData.valid_till || null,
      code: formData.code.toUpperCase()
    };

    if (editingOffer) {
      const { error } = await supabase
        .from('offers')
        .update(payload)
        .eq('id', editingOffer.id);
      
      if (error) {
        alert('Error updating offer: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('offers')
        .insert(payload);
      
      if (error) {
        alert('Error creating offer: ' + error.message);
      }
    }

    setSaving(false);
    setShowModal(false);
    fetchOffers();
  }

  async function toggleActive(offer: DbOffer) {
    const { error } = await supabase
      .from('offers')
      .update({ active: !offer.active })
      .eq('id', offer.id);
    
    if (error) {
      alert('Error updating offer: ' + error.message);
    } else {
      fetchOffers();
    }
  }

  async function deleteOffer(offer: DbOffer) {
    if (!confirm(`Are you sure you want to delete "${offer.title}"?`)) return;
    
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', offer.id);
    
    if (error) {
      alert('Error deleting offer: ' + error.message);
    } else {
      fetchOffers();
    }
  }

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && offer.active) ||
                         (filterActive === 'inactive' && !offer.active);
    return matchesSearch && matchesFilter;
  });

  function formatDiscount(offer: DbOffer): string {
    switch (offer.discount_type) {
      case 'percentage': return `${offer.discount_value}% OFF`;
      case 'fixed': return `₹${offer.discount_value} OFF`;
      case 'bogo': return 'Buy 2 Get 1';
      default: return `${offer.discount_value}% OFF`;
    }
  }

  function getStatusBadge(offer: DbOffer) {
    const now = new Date();
    const validFrom = new Date(offer.valid_from);
    const validTill = offer.valid_till ? new Date(offer.valid_till) : null;
    
    if (!offer.active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-dark-600 text-dark-300">Inactive</span>;
    }
    if (validFrom > now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Scheduled</span>;
    }
    if (validTill && validTill < now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Expired</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Active</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white">Offers & Coupons</h1>
          <p className="text-dark-400 text-sm mt-1">Manage promotional offers and discount codes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-glossy px-4 py-2 rounded-lg text-dark-900 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-card rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterActive(filter)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                filterActive === filter
                  ? 'bg-primary/20 text-primary border border-primary/50'
                  : 'glass-card text-dark-300 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-xl">
          <Tag className="w-12 h-12 text-dark-300 mx-auto mb-4" />
          <p className="text-dark-400">No offers found</p>
          <button onClick={openCreateModal} className="text-primary text-sm mt-2 hover:underline">
            Create your first offer
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="glossy-card rounded-xl p-5 hover:gold-glow transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{offer.title}</h3>
                    {getStatusBadge(offer)}
                  </div>
                  <p className="text-dark-300 text-sm">{offer.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <code className="text-sm bg-dark-600 text-primary px-3 py-1 rounded-lg font-mono">{offer.code}</code>
                    <span className="text-sm text-dark-400">{formatDiscount(offer)}</span>
                    {offer.min_order_value && (
                      <span className="text-xs text-dark-300">Min: ₹{offer.min_order_value}</span>
                    )}
                    {offer.usage_limit && (
                      <span className="text-xs text-dark-300">
                        Used: {offer.used_count}/{offer.usage_limit}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-dark-300 mt-2">
                    Valid: {new Date(offer.valid_from).toLocaleDateString()} 
                    {offer.valid_till ? ` - ${new Date(offer.valid_till).toLocaleDateString()}` : ' (No expiry)'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(offer)}
                    className={`p-2 rounded-lg transition ${offer.active ? 'text-green-400 hover:bg-green-500/10' : 'text-dark-400 hover:bg-dark-600'}`}
                    title={offer.active ? 'Deactivate' : 'Activate'}
                  >
                    {offer.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-2 rounded-lg text-dark-300 hover:text-primary hover:bg-primary/10 transition"
                    title="Edit"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteOffer(offer)}
                    className="p-2 rounded-lg text-dark-300 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glossy-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-600">
              <h2 className="text-xl font-serif text-white">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-dark-200 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="e.g., Festive Season Sale"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-200 mb-1">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  rows={2}
                  placeholder="e.g., Get 20% off on all ethnic wear"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-200 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 glass-card rounded-lg text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="e.g., FESTIVE20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-200 mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50 bg-dark-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="bogo">Buy 2 Get 1 Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-200 mb-1">
                    {formData.discount_type === 'percentage' ? 'Discount %' : formData.discount_type === 'fixed' ? 'Amount (₹)' : 'Free Items'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-200 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.min_order_value || ''}
                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-200 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.max_discount || ''}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-200 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-200 mb-1">Valid Till</label>
                  <input
                    type="date"
                    value={formData.valid_till}
                    onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
                    className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <p className="text-xs text-dark-300 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-200 mb-1">Usage Limit</label>
                <input
                  type="number"
                  min={0}
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 glass-card rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Unlimited"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`relative w-12 h-6 rounded-full transition ${formData.active ? 'bg-primary' : 'bg-dark-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${formData.active ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm text-dark-200">{formData.active ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 glass-card rounded-lg text-dark-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 btn-glossy rounded-lg text-dark-900 font-medium flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
