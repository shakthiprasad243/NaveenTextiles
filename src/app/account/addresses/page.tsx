'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, ChevronLeft, Home, Building, Check } from 'lucide-react';
import Link from 'next/link';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      name: 'Ravi Kumar',
      phone: '9876543210',
      address: '123, MG Road, Near City Mall',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true
    }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = () => {
    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
    } else {
      setAddresses(prev => [...prev, { ...formData, id: Date.now().toString(), isDefault: prev.length === 0 }]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({ label: 'Home', name: '', phone: '', address: '', city: '', state: '', pincode: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/account" className="inline-flex items-center gap-2 text-dark-400 hover:text-primary text-sm mb-4 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Account
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-white">My Addresses</h1>
            <p className="text-dark-400 mt-1">Manage your delivery addresses</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn-glossy px-4 py-2 rounded-lg text-sm font-medium text-dark-900 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="glass-card-gold rounded-xl p-6 mb-6 animate-fadeIn">
          <h3 className="text-primary font-medium mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="space-y-4">
            {/* Label Selection */}
            <div>
              <label className="text-dark-300 text-sm mb-2 block">Address Type</label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map(label => (
                  <button
                    key={label}
                    onClick={() => setFormData({ ...formData, label })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                      formData.label === label
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'glass-card text-dark-300 hover:text-primary'
                    }`}
                  >
                    {label === 'Home' ? <Home className="w-4 h-4" /> : label === 'Office' ? <Building className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="text-dark-300 text-sm mb-2 block">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                placeholder="House/Flat No., Building, Street, Area"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-dark-300 text-sm mb-2 block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-dark-300 text-sm mb-2 block">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="text-dark-300 text-sm mb-2 block">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={resetForm} className="flex-1 py-3 rounded-lg text-sm text-dark-400 border border-dark-600 hover:border-dark-500">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 btn-glossy py-3 rounded-lg text-sm font-medium text-dark-900">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className={`glass-card-gold rounded-xl p-5 ${address.isDefault ? 'ring-1 ring-primary/30' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {address.label === 'Home' ? <Home className="w-4 h-4 text-primary" /> : address.label === 'Office' ? <Building className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                    <span className="text-dark-200 font-medium">{address.label}</span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-dark-200 text-sm">{address.name}</p>
                  <p className="text-dark-400 text-sm mt-1">{address.address}</p>
                  <p className="text-dark-400 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-dark-300 text-sm mt-2">Phone: {address.phone}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(address)} className="p-2 text-dark-400 hover:text-primary transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(address.id)} className="p-2 text-dark-400 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-4 text-sm text-dark-400 hover:text-primary transition flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card-gold rounded-xl">
          <MapPin className="w-12 h-12 text-dark-300 mx-auto mb-4" />
          <h3 className="text-dark-200 font-medium mb-2">No addresses saved</h3>
          <p className="text-dark-300 text-sm mb-6">Add an address for faster checkout</p>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-glossy px-6 py-3 rounded-lg text-sm font-medium text-dark-900 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      )}
    </div>
  );
}
