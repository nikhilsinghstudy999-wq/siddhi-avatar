'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="hi">
      <body
        style={{
          background: '#08090a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>कुछ गलत हो गया</h1>
        <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
          कृपया पेज रिफ्रेश करें या बाद में दोबारा कोशिश करें।
        </p>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(0,242,254,0.3)',
            background: 'rgba(0,242,254,0.1)',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          रिफ्रेश करें
        </button>
      </body>
    </html>
  );
}
