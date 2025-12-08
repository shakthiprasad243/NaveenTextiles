export interface ProductVariation {
  size: string;
  color: string;
  stock: number;
  variantId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  mainCategory?: string;
  price: number;
  variations: ProductVariation[];
  active: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock?: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isAdmin?: boolean;
  createdAt: Date;
}
