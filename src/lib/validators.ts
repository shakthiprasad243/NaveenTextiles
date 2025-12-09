// Input validation utilities for API endpoints

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate product creation/update data
 */
export function validateProduct(data: any): ValidationResult {
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Name is required and must be a string' };
  }
  if (data.name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (data.name.length > 200) {
    return { valid: false, error: 'Name must be less than 200 characters' };
  }
  if (data.base_price === undefined || typeof data.base_price !== 'number') {
    return { valid: false, error: 'base_price is required and must be a number' };
  }
  if (data.base_price < 0) {
    return { valid: false, error: 'base_price cannot be negative' };
  }
  if (data.base_price > 10000000) {
    return { valid: false, error: 'base_price must be less than 10,000,000' };
  }
  if (!data.main_category || typeof data.main_category !== 'string') {
    return { valid: false, error: 'main_category is required and must be a string' };
  }
  if (!data.category || typeof data.category !== 'string') {
    return { valid: false, error: 'category is required and must be a string' };
  }
  if (data.description && data.description.length > 5000) {
    return { valid: false, error: 'Description must be less than 5000 characters' };
  }
  return { valid: true };
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12;
}

/**
 * Validate order creation data
 */
export function validateOrder(data: any): ValidationResult {
  if (!data.customer_name && !data.customer?.name) {
    return { valid: false, error: 'customer_name is required' };
  }
  
  const customerName = data.customer_name || data.customer?.name;
  if (typeof customerName !== 'string' || customerName.trim().length === 0) {
    return { valid: false, error: 'customer_name must be a non-empty string' };
  }
  if (customerName.length > 100) {
    return { valid: false, error: 'customer_name must be less than 100 characters' };
  }

  const customerPhone = data.customer_phone || data.customer?.phone;
  if (!customerPhone) {
    return { valid: false, error: 'customer_phone is required' };
  }
  if (!validatePhone(customerPhone)) {
    return { valid: false, error: 'customer_phone must be a valid 10-12 digit phone number' };
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, error: 'items array is required and must not be empty' };
  }

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.product_name && !item.product_variant_id && !item.product_id) {
      return { valid: false, error: `Item ${i + 1}: product_name or product_variant_id is required` };
    }
    const qty = item.qty || item.quantity || 0;
    if (qty < 1 || qty > 100) {
      return { valid: false, error: `Item ${i + 1}: quantity must be between 1 and 100` };
    }
  }

  return { valid: true };
}

/**
 * Validate order status
 */
export function validateOrderStatus(status: string): ValidationResult {
  const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!status || !validStatuses.includes(status.toUpperCase())) {
    return { 
      valid: false, 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    };
  }
  return { valid: true };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
