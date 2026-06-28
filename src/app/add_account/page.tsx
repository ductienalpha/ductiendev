'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';

export default function AddAccount() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  
  const [wolvesvilleUsername, setWolvesvilleUsername] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!t || !u) {
      router.push('/login');
    } else {
      setToken(t);
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      
      if (parsedUser.pending_link && parsedUser.pending_link.verify_code) {
        setVerifyCode(parsedUser.pending_link.verify_code);
        setWolvesvilleUsername(parsedUser.pending_link.wolvesville_username);
      }
    }
  }, [router]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wolvesville_username: wolvesvilleUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyCode(data.code);
        setSuccessMsg('Code generated successfully!');
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setErrorMsg(data.error || 'Failed to generate code.');
      }
    } catch (e: any) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Account successfully linked!');
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Verification failed.');
      }
    } catch (e: any) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/link/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyCode('');
        setWolvesvilleUsername('');
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --bg: #06091a;
          --surface: rgba(255,255,255,0.04);
          --surface2: rgba(255,255,255,0.06);
          --border: rgba(255,255,255,0.08);
          --border-2: rgba(255,255,255,0.14);
          --v: #7c3aed;
          --c: #06b6d4;
          --pink: #ec4899;
          --text: #e2e8f0;
          --text-2: #94a3b8;
          --text-3: #64748b;
          --green: #10b981;
          --amber: #f59e0b;
          --red: #f43f5e;
          --radius: 18px;
        }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .aurora { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .blob { position: absolute; border-radius: 50%; filter: blur(110px); opacity: 0.4; animation: blobmove 22s infinite ease-in-out; }
        .b1 { width: 700px; height: 700px; background: radial-gradient(circle, var(--v), transparent 70%); top: -200px; left: -200px; }
        .b2 { width: 600px; height: 600px; background: radial-gradient(circle, var(--c), transparent 70%); bottom: -150px; right: -150px; animation-delay: -8s; }
        .b3 { width: 420px; height: 420px; background: radial-gradient(circle, var(--pink), transparent 70%); top: 45%; left: 45%; animation-delay: -15s; }
        @keyframes blobmove { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-40px) scale(1.07); } 66% { transform: translate(-30px,25px) scale(0.93); } }

        .navbar {
          position: sticky; top: 0; z-index: 1000;
          height: 60px; border-bottom: 1px solid var(--border);
          background: rgba(6,9,26,0.65); backdrop-filter: blur(20px);
          display: flex; align-items: center;
        }
        .navbar-inner {
          width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo { font-size: 1.15rem; font-weight: 800; color: var(--text); text-decoration: none; letter-spacing: -0.5px; }
        .logo span { background: linear-gradient(90deg, var(--v), var(--pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nav-back {
          background: var(--surface); border: 1px solid var(--border-2);
          color: var(--text-2); padding: 7px 16px; border-radius: 50px;
          font-size: 0.82rem; font-weight: 600; text-decoration: none; transition: all 0.15s;
        }
        .nav-back:hover { background: var(--surface2); color: var(--text); }

        .page {
          position: relative; z-index: 1;
          min-height: calc(100vh - 60px);
          display: flex; align-items: center; justify-content: center;
          padding: 48px 24px;
        }

        .card {
          width: 100%; max-width: 480px;
          background: var(--surface); backdrop-filter: blur(16px);
          border: 1px solid var(--border); border-radius: var(--radius);
          padding: 36px; position: relative; overflow: hidden;
        }
        .card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--v), var(--c), transparent);
        }

        .card-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .card-sub { font-size: 0.875rem; color: var(--text-2); margin-bottom: 24px; }

        .alert { padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 500; margin-bottom: 18px; }
        .alert-error { background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); color: var(--red); }
        .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--green); }

        .info-strip {
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06));
          border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 22px;
        }
        .info-strip strong { display: block; font-size: 0.82rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .info-strip p { font-size: 0.8rem; color: var(--text-2); line-height: 1.6; }

        .form-field { margin-bottom: 18px; }
        .form-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-2); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 7px; }
        .input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
          border-radius: 10px; color: var(--text); padding: 11px 14px;
          font-family: 'Inter', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.15s;
        }
        .input:focus { border-color: var(--c); box-shadow: 0 0 0 3px rgba(6,182,212,0.15); }
        .input::placeholder { color: var(--text-3); }

        .btn {
          display: inline-block; width: 100%; padding: 12px 28px; border-radius: 50px;
          font-size: 0.9rem; font-weight: 700; cursor: pointer; border: none;
          transition: all 0.2s; font-family: 'Inter', sans-serif; text-align: center;
        }
        .btn-solid { background: linear-gradient(135deg, var(--pink), var(--v)); color: #fff; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4); }
        .btn-solid:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }
        .btn-solid:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .verify-box {
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 22px;
        }
        .verify-box-title { font-size: 0.82rem; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .verify-code {
          font-size: 2.4rem; font-weight: 800; letter-spacing: 4px; font-family: 'Courier New', monospace;
          background: linear-gradient(90deg, var(--c), var(--v));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .steps { list-style: none; counter-reset: step; display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; text-align: left; padding: 0; }
        .steps li { display: flex; align-items: flex-start; gap: 12px; font-size: 0.875rem; color: var(--text-2); counter-increment: step; }
        .steps li::before {
          content: counter(step); width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, var(--pink), var(--v)); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 800; flex-shrink: 0; margin-top: 1px;
        }

        .back-link { text-align: center; margin-top: 20px; }
        .back-link a { font-size: 0.85rem; color: var(--text-3); text-decoration: none; transition: color 0.15s; }
        .back-link a:hover { color: var(--c); }
      `}} />

      <div className="aurora">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="logo">Lupophobia<span>Bot</span></Link>
          <Link href="/dashboard" className="nav-back">← Dashboard</Link>
        </div>
      </nav>

      <div className="page">
        <div className="card">
          <div className="card-title">Add Wolvesville Account</div>
          <div className="card-sub">Link an account to your Lupophobia dashboard.</div>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {!verifyCode ? (
            <>
              <div className="info-strip">
                <strong>Important</strong>
                <p>Only accounts with an active Lupophobia license can be added. Make sure you have activated a license key for your Wolvesville username before continuing.</p>
              </div>

              <form onSubmit={handleLink}>
                <div className="form-field">
                  <label className="form-label" htmlFor="username">Wolvesville Username</label>
                  <input 
                    className="input" 
                    type="text" 
                    id="username" 
                    name="username" 
                    required 
                    placeholder="Enter your username" 
                    autoFocus
                    value={wolvesvilleUsername}
                    onChange={(e) => setWolvesvilleUsername(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-solid" disabled={isLoading}>
                  {isLoading ? 'Checking...' : 'Check & Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="verify-box">
                <div className="verify-box-title">Your Verification Code</div>
                <div className="verify-code">{verifyCode}</div>
              </div>
              <ul className="steps">
                <li>Copy the code above.</li>
                <li>Open Wolvesville, go to Profile &rarr; Edit &rarr; Biography.</li>
                <li>Paste the code into your biography and save.</li>
                <li>Click the verify button below.</li>
              </ul>
              <button onClick={handleVerify} className="btn btn-solid" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Link Account'}
              </button>
            </>
          )}

          <div className="back-link" style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            {verifyCode && (
              <a href="#" onClick={(e) => { e.preventDefault(); handleCancel(); }}>← Change username</a>
            )}
            <Link href="/dashboard">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </>
  );
}
