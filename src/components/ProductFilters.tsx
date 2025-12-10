'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterProps {
  availableColors: string[];
  availableSizes: string[];
  priceRange: { min: number; max: number };
  selectedColors: string[];
  selectedSizes: string[];
  selectedPriceRange: { min: number; max: number };
  onColorChange: (colors: string[]) => void;
  onSizeChange: (sizes: string[]) => void;
  onPriceChange: (range: { min: number; max: number }) => void;
  onClearAll: () => void;
  totalProducts: number;
  filteredCount: number;
}

export default function ProductFilters({
  availableColors,
  availableSizes,
  priceRange,
  selectedColors,
  selectedSizes,
  selectedPriceRange,
  onColorChange,
  onSizeChange,
  onPriceChange,
  onClearAll,
  totalProducts,
  filteredCount
}: FilterProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    color: true,
    size: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter(c => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  const activeFiltersCount = selectedColors.length + selectedSizes.length + 
    (selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max ? 1 : 0);

  return (
    <div className="glass-card-gold rounded-xl p-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-primary/20">
        <div>
          <h3 className="text-primary font-medium">Filters</h3>
          <p className="text-dark-300 text-xs mt-0.5">
            {filteredCount} of {totalProducts} products
          </p>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-dark-400 hover:text-primary transition rounded-lg hover:bg-primary/10"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-5">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="text-dark-200 font-medium text-sm">Price Range</h4>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={selectedPriceRange.min}
                  onChange={(e) => onPriceChange({ ...selectedPriceRange, min: Number(e.target.value) })}
                  placeholder="Min"
                  className="w-full px-3 py-2 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
              <span className="text-dark-300">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={selectedPriceRange.max}
                  onChange={(e) => onPriceChange({ ...selectedPriceRange, max: Number(e.target.value) })}
                  placeholder="Max"
                  className="w-full px-3 py-2 glass-card rounded-lg text-dark-200 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder-dark-500"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>
            {/* Quick Price Buttons */}
            <div className="space-y-1.5">
              {[
                { label: 'Under ₹1,000', min: 0, max: 1000 },
                { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
                { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
                { label: 'Above ₹5,000', min: 5000, max: 50000 }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => onPriceChange({ min: range.min, max: range.max })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                    selectedPriceRange.min === range.min && selectedPriceRange.max === range.max
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-dark-300 hover:text-primary hover:bg-dark-700/50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-dark-600/50 mb-5" />

      {/* Colors Section */}
      <div className="mb-5">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="text-dark-200 font-medium text-sm">Colors</h4>
          {expandedSections.color ? (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          )}
        </button>
        {expandedSections.color && (
          <div className="space-y-1.5">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition ${
                  selectedColors.includes(color)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-dark-300 hover:text-primary hover:bg-dark-700/50'
                }`}
              >
                <span 
                  className="w-4 h-4 rounded-full border border-dark-500 shadow-inner flex-shrink-0" 
                  style={{ backgroundColor: getColorHex(color) }}
                />
                <span className="flex-1 text-left">{color}</span>
                {selectedColors.includes(color) && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-dark-600/50 mb-5" />

      {/* Sizes Section */}
      <div className="mb-5">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="text-dark-200 font-medium text-sm">Sizes</h4>
          {expandedSections.size ? (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          )}
        </button>
        {expandedSections.size && (
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`min-w-[40px] px-3 py-2 rounded-lg text-xs font-medium transition ${
                  selectedSizes.includes(size)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'glass-card text-dark-300 hover:text-primary hover:border-primary/30'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-primary/20">
        <button
          onClick={onClearAll}
          className="w-full py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-primary/30 text-primary hover:bg-primary/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
      </div>
    </div>
  );
}

// Helper function to get color hex values
function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    'White': '#FFFFFF',
    'Blue': '#3B82F6',
    'Light Blue': '#93C5FD',
    'Red': '#EF4444',
    'Green': '#22C55E',
    'Pink': '#EC4899',
    'Yellow': '#EAB308',
    'Gold': '#D4AF37',
    'Floral': '#F472B6',
    'Plain': '#9CA3AF',
    'Blue Floral': '#60A5FA'
  };
  return colors[colorName] || '#9CA3AF';
}
