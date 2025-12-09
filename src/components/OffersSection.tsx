'use client';

import { Tag, Percent, Gift, Sparkles } from 'lucide-react';
import { DbOffer } from '@/lib/supabase';

const iconMap: Record<string, typeof Percent> = {
  percentage: Percent,
  fixed: Tag,
  bogo: Gift
};

const gradientMap: Record<string, string> = {
  percentage: 'from-primary to-gold-500',
  fixed: 'from-purple-500 to-pink-500',
  bogo: 'from-green-500 to-emerald-400'
};

function formatDiscount(offer: DbOffer): string {
  switch (offer.discount_type) {
    case 'percentage':
      return `${offer.discount_value}% OFF`;
    case 'fixed':
      return `₹${offer.discount_value} OFF`;
    case 'bogo':
      return 'FREE ITEM';
    default:
      return `${offer.discount_value}% OFF`;
  }
}

// Use a stable date format to avoid hydration mismatch
function formatValidTill(validTill: string | null): string {
  if (!validTill) return 'Ongoing';
  const date = new Date(validTill);
  // Use UTC to ensure consistent rendering between server and client
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

interface OffersSectionProps {
  offers: DbOffer[];
}

export default function OffersSection({ offers }: OffersSectionProps) {
  if (offers.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-serif text-white">Ongoing Offers</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => {
          const IconComponent = iconMap[offer.discount_type] || Percent;
          const gradient = gradientMap[offer.discount_type] || 'from-primary to-gold-500';
          
          return (
            <div key={offer.id} className="glossy-card rounded-xl p-5 hover:gold-glow transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-primary transition">{offer.title}</h3>
                  <p className="text-dark-300 text-sm mt-1">{offer.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${gradient} text-white`}>
                      {formatDiscount(offer)}
                    </span>
                    <span className="text-xs text-dark-400">Valid till {formatValidTill(offer.valid_till)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="text-xs bg-dark-600 text-primary px-3 py-1.5 rounded-lg font-mono">{offer.code}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(offer.code)}
                      className="text-xs text-dark-300 hover:text-primary transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
