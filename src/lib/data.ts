import { Product, Order } from './types';

export const mainCategories = ['Men', 'Women', 'Kids', 'Home & Living'];

export const subCategories: Record<string, string[]> = {
  'Men': ['Shirts', 'Pants', 'Trousers', 'Kurtas', 'Ethnic Wear', 'Fabrics', 'Jeans', 'T-Shirts', 'Jackets'],
  'Women': ['Sarees', 'Kurtas', 'Dress Materials', 'Dupattas', 'Blouses', 'Lehengas', 'Salwar Suits', 'Tops', 'Pants', 'Skirts'],
  'Kids': ['Boys Wear', 'Girls Wear', 'School Uniforms', 'Ethnic Kids', 'T-Shirts', 'Pants', 'Dresses'],
  'Home & Living': ['Bedsheets', 'Curtains', 'Cushion Covers', 'Table Linen', 'Towels', 'Blankets', 'Pillow Covers']
};

export const categories = ['Shirts', 'Sarees', 'Kurtas', 'Fabrics', 'Accessories'];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Classic Linen Shirt',
    description: 'Premium linen shirt, breathable and perfect for summer. Handcrafted with care.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    category: 'Shirts',
    mainCategory: 'Men',
    price: 1299,
    variations: [
      { size: 'S', color: 'White', stock: 10 },
      { size: 'M', color: 'White', stock: 8 },
      { size: 'L', color: 'White', stock: 5 },
      { size: 'M', color: 'Blue', stock: 6 }
    ],
    active: true
  },
  {
    id: 'p2',
    name: 'Silk Blend Saree',
    description: 'Elegant silk-cotton blend saree with gold border. Perfect for festive occasions.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    category: 'Sarees',
    mainCategory: 'Women',
    price: 4500,
    variations: [
      { size: 'Free', color: 'Red', stock: 4 },
      { size: 'Free', color: 'Green', stock: 3 }
    ],
    active: true
  },
  {
    id: 'p3',
    name: 'Block Print Kurta',
    description: 'Traditional hand-block printed kurta in soft cotton. Comfortable all-day wear.',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'],
    category: 'Kurtas',
    mainCategory: 'Women',
    price: 1899,
    variations: [
      { size: 'M', color: 'Blue', stock: 7 },
      { size: 'L', color: 'Blue', stock: 5 },
      { size: 'XL', color: 'Blue', stock: 3 }
    ],
    active: true
  },
  {
    id: 'p4',
    name: 'Cotton Fabric (5m)',
    description: 'Pure cotton fabric, ideal for custom tailoring. Soft and durable.',
    images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600'],
    category: 'Fabrics',
    mainCategory: 'Men',
    price: 799,
    variations: [
      { size: '5m', color: 'Floral', stock: 15 },
      { size: '5m', color: 'Plain', stock: 20 }
    ],
    active: true
  },
  {
    id: 'p5',
    name: 'Embroidered Dupatta',
    description: 'Beautifully embroidered dupatta with intricate patterns.',
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'],
    category: 'Dupattas',
    mainCategory: 'Women',
    price: 650,
    variations: [
      { size: 'Free', color: 'Pink', stock: 12 },
      { size: 'Free', color: 'Yellow', stock: 8 }
    ],
    active: true
  },
  {
    id: 'p6',
    name: 'Formal Cotton Shirt',
    description: 'Crisp cotton formal shirt for office and events.',
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'],
    category: 'Shirts',
    mainCategory: 'Men',
    price: 1499,
    variations: [
      { size: 'M', color: 'White', stock: 10 },
      { size: 'L', color: 'White', stock: 8 },
      { size: 'M', color: 'Light Blue', stock: 6 }
    ],
    active: true
  },
  {
    id: 'p7',
    name: 'Kids Ethnic Kurta Set',
    description: 'Festive kurta pajama set for boys. Comfortable and stylish.',
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600'],
    category: 'Boys Wear',
    mainCategory: 'Kids',
    price: 999,
    variations: [
      { size: '2-3Y', color: 'Gold', stock: 8 },
      { size: '4-5Y', color: 'Gold', stock: 6 },
      { size: '6-7Y', color: 'Gold', stock: 4 }
    ],
    active: true
  },
  {
    id: 'p8',
    name: 'Premium Bedsheet Set',
    description: 'King size cotton bedsheet with 2 pillow covers. 300 thread count.',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
    category: 'Bedsheets',
    mainCategory: 'Home & Living',
    price: 1299,
    variations: [
      { size: 'King', color: 'Blue Floral', stock: 10 },
      { size: 'King', color: 'White', stock: 8 }
    ],
    active: true
  }
];

export const orders: Order[] = [
  {
    id: 'ORD-ABC123',
    customerName: 'Ravi Kumar',
    customerPhone: '9876543210',
    deliveryAddress: '123 MG Road, Bangalore 560001',
    items: [{ productId: 'p1', productName: 'Classic Linen Shirt', size: 'M', color: 'White', price: 1299, quantity: 2 }],
    total: 2598,
    status: 'pending',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'ORD-DEF456',
    customerName: 'Priya Sharma',
    customerPhone: '9123456789',
    deliveryAddress: '45 Jubilee Hills, Hyderabad 500033',
    items: [{ productId: 'p2', productName: 'Silk Blend Saree', size: 'Free', color: 'Red', price: 4500, quantity: 1 }],
    total: 4500,
    status: 'shipped',
    createdAt: new Date('2024-01-14')
  }
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category && p.active);
}

export function getProductsByMainCategory(mainCategory: string): Product[] {
  return products.filter(p => p.mainCategory === mainCategory && p.active);
}
