'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductVariation } from '@/lib/types';
import { products as initialProducts, mainCategories, subCategories } from '@/lib/data';

interface ProductContextType {
  products: Product[];
  categories: typeof mainCategories;
  subCategories: typeof subCategories;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  addCategory: (category: string) => void;
  addSubCategory: (mainCategory: string, subCategory: string) => void;
  deleteSubCategory: (mainCategory: string, subCategory: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState(mainCategories);
  const [subCats, setSubCats] = useState(subCategories);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
      setSubCats(prev => ({ ...prev, [category]: [] }));
    }
  };

  const addSubCategory = (mainCategory: string, subCategory: string) => {
    setSubCats(prev => ({
      ...prev,
      [mainCategory]: [...(prev[mainCategory] || []), subCategory]
    }));
  };

  const deleteSubCategory = (mainCategory: string, subCategory: string) => {
    setSubCats(prev => ({
      ...prev,
      [mainCategory]: prev[mainCategory]?.filter(s => s !== subCategory) || []
    }));
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      subCategories: subCats,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      addCategory,
      addSubCategory,
      deleteSubCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
}
