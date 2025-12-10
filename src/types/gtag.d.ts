declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_path?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
        transaction_id?: string;
        currency?: string;
        items?: Array<{
          item_id: string;
          item_name: string;
          category: string;
          quantity: number;
          price: number;
        }>;
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}

export {};