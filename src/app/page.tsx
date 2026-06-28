import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Lupophobia</h1>
          <p className="hero-subtitle">The ultimate tool for Wolvesville players. Enhance your gameplay today.</p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary">Login</Link>
            <Link href="/register" className="btn btn-secondary">Register</Link>
          </div>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Premium Features</h3>
            <p>Access exclusive tracking and in-game utilities.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Authentication</h3>
            <p>Your data is protected. Link your game safely.</p>
          </div>
          <div className="feature-card">
            <h3>Custom Key System</h3>
            <p>Purchase or activate a key directly on your dashboard.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
