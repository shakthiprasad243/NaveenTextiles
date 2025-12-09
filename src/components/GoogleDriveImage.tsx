'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getGoogleDriveImageUrl, isGoogleDriveUrl } from '@/lib/utils';

interface GoogleDriveImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function GoogleDriveImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority
}: GoogleDriveImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Convert Google Drive URL to direct image URL
  const imageUrl = getGoogleDriveImageUrl(src);
  const isGoogleDrive = isGoogleDriveUrl(src);
  
  // Fallback placeholder
  const fallbackUrl = '/logo.png';
  
  if (error || !src) {
    return (
      <div className={`bg-dark-600 flex items-center justify-center ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
        <span className="text-dark-400 text-xs">Image unavailable</span>
      </div>
    );
  }

  // Use native img tag for Google Drive images to avoid Next.js Image restrictions
  if (isGoogleDrive) {
    return (
      <>
        {loading && (
          <div className={`bg-dark-600 animate-pulse ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className={`${className || ''} ${fill ? 'absolute inset-0 w-full h-full' : ''} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={!fill ? { width, height } : undefined}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      </>
    );
  }

  // Use Next.js Image for non-Google Drive URLs
  return (
    <>
      {loading && (
        <div className={`bg-dark-600 animate-pulse ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined} />
      )}
      <Image
        src={imageUrl || fallbackUrl}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </>
  );
}
