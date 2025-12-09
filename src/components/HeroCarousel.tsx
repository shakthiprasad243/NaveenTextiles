'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGoogleDriveImageUrl } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'Men\'s Collection',
    tagline: 'Refined Style',
    description: 'Premium shirts, kurtas and ethnic wear crafted for the modern gentleman',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200',
    cta: 'Shop Men',
    link: '/products?main=Men'
  },
  {
    id: 2,
    title: 'Women\'s Collection',
    tagline: 'Timeless Elegance',
    description: 'Exquisite sarees, kurtas and dress materials for every occasion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200',
    cta: 'Shop Women',
    link: '/products?main=Women'
  },
  {
    id: 3,
    title: 'Kids Fashion',
    tagline: 'Little Wonders',
    description: 'Comfortable and stylish clothing for your little ones',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1200',
    cta: 'Shop Kids',
    link: '/products?main=Kids'
  },
  {
    id: 4,
    title: 'Home & Living',
    tagline: 'Comfort Redefined',
    description: 'Premium bedsheets, curtains and home textiles for your space',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200',
    cta: 'Shop Home',
    link: '/products?main=Home%20%26%20Living'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slides[current];

  return (
    <section
      className="relative h-72 md:h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[4000ms]"
            style={{ 
              backgroundImage: `url(${getGoogleDriveImageUrl(s.image)})`,
              transform: i === current ? 'scale(1.1)' : 'scale(1.05)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/80 to-dark-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />
        </div>
      ))}

      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div key={current} className="max-w-xl">
            <p 
              className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-primary to-gold-300 uppercase tracking-[0.3em] text-xs md:text-sm mb-3 font-medium opacity-0 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              {slide.tagline}
            </p>
            <h1 
              className="text-4xl md:text-6xl font-serif text-white mb-4 drop-shadow-2xl opacity-0 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              {slide.title.split(' ')[0]}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-500">
                {slide.title.split(' ').slice(1).join(' ') || 'Collection'}
              </span>
            </h1>
            <p 
              className="text-base md:text-lg text-dark-300 mb-6 md:mb-8 leading-relaxed opacity-0 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              {slide.description}
            </p>
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link
                href={slide.link}
                className="btn-glossy inline-flex items-center gap-2 text-dark-900 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 glass-card-gold rounded-full text-white/70 hover:text-white hover:bg-white/10 transition z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 glass-card-gold rounded-full text-white/70 hover:text-white hover:bg-white/10 transition z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? 'w-8 bg-gradient-to-r from-primary to-gold-400 shadow-lg shadow-primary/30'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
