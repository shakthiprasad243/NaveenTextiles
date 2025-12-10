export default function LoadingSpinner({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} border-2 border-primary border-t-transparent rounded-full animate-spin`} />
  );
}