'use client';

import { useCallback } from 'react';
import { event, trackPurchase, trackAddToCart } from '@/lib/gtag';

export const useAnalytics = () => {
  const trackEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    event({ action, category, label, value });
  }, []);

  const trackProductView = useCallback((productId: string, productName: string, category: string) => {
    event({
      action: 'view_item',
      category: 'ecommerce',
      label: `${productName} (${productId})`,
    });
  }, []);

  const trackAddToCartEvent = useCallback((
    productId: string,
    productName: string,
    category: string,
    price: number,
    quantity: number = 1
  ) => {
    trackAddToCart({
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        category: category,
        quantity: quantity,
        price: price,
      }],
    });
  }, []);

  const trackPurchaseEvent = useCallback((
    orderId: string,
    totalValue: number,
    items: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>
  ) => {
    trackPurchase({
      transactionId: orderId,
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }, []);

  const trackSearch = useCallback((searchTerm: string) => {
    event({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
    });
  }, []);

  const trackContactForm = useCallback((formType: string) => {
    event({
      action: 'form_submit',
      category: 'engagement',
      label: formType,
    });
  }, []);

  return {
    trackEvent,
    trackProductView,
    trackAddToCartEvent,
    trackPurchaseEvent,
    trackSearch,
    trackContactForm,
  };
};