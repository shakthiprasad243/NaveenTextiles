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
      className="relative h-80 md:h-[550px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Parallax */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[5000ms]"
            style={{ 
              backgroundImage: `url(${getGoogleDriveImageUrl(s.image)})`,
              transform: i === current ? 'scale(1.15)' : 'scale(1.05)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/85 to-dark-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/40" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold-500/10 opacity-50" />
        </div>
      ))}

      {/* Enhanced glossy overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div key={current} className="max-w-xl">
            <div className="inline-block mb-3 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-primary to-gold-400 uppercase tracking-[0.3em] text-xs md:text-sm font-bold relative">
                {slide.tagline}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              </p>
            </div>
            <h1 
              className="text-4xl md:text-7xl font-serif text-white mb-5 opacity-0 animate-slide-up"
              style={{ 
                animationDelay: '0.2s',
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.2)'
              }}
            >
              {slide.title.split(' ')[0]}{' '}
              <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-gold-400 animate-glow-pulse">
                {slide.title.split(' ').slice(1).join(' ') || 'Collection'}
              </span>
            </h1>
            <p 
              className="text-base md:text-xl text-dark-200 mb-8 md:mb-10 leading-relaxed max-w-lg opacity-0 animate-slide-up"
              style={{ 
                animationDelay: '0.3s',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {slide.description}
            </p>
            <div className="opacity-0 animate-slide-up flex flex-wrap gap-4" style={{ animationDelay: '0.4s' }}>
              <Link
                href={slide.link}
                className="btn-glossy inline-flex items-center gap-2 text-dark-900 px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all hover:scale-105 hover:shadow-2xl group"
              >
                {slide.cta} 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/products"
                className="glass-card-gold inline-flex items-center gap-2 text-dark-100 hover:text-primary px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all hover:scale-105 border border-primary/30 hover:border-primary/50"
              >
                View All Products
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

      {/* Enhanced Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current
                ? 'w-10 bg-gradient-to-r from-primary via-gold-400 to-primary shadow-lg shadow-primary/40 animate-glow-pulse'
                : 'w-2.5 bg-white/40 hover:bg-white/60 hover:w-6'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
