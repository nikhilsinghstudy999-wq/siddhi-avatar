import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-siddhi-dark text-white px-4">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-siddhi-cyan to-siddhi-purple bg-clip-text text-transparent mb-4">
        404
      </h1>
      <p className="text-white/60 text-lg mb-8">यह पेज मौजूद नहीं है</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-siddhi-cyan/20 to-siddhi-purple/20 border border-siddhi-cyan/30 text-white font-medium hover:shadow-[0_4px_20px_rgba(0,242,254,0.15)] transition-shadow"
      >
        🏠 होम पेज पर जाएं
      </Link>
    </div>
  );
}
