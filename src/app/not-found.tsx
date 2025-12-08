import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-dark-600 mb-4">404</h1>
        <h2 className="text-xl font-serif text-dark-100 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="bg-primary text-dark-900 px-6 py-3 rounded font-medium hover:bg-primary-light transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
