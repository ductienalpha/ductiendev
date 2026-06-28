'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'xp' | 'license' | 'community' | 'support'>('overview');
  const [isLinkingNew, setIsLinkingNew] = useState(false);

  const [wolvesvilleUsername, setWolvesvilleUsername] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [linkMsg, setLinkMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isLinked = user?.accounts?.length > 0 || user?.is_linked;
  
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const [licenseKey, setLicenseKey] = useState('');
  const [keyMsg, setKeyMsg] = useState('');
  
  const [playerData, setPlayerData] = useState<any>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [xpRange, setXpRange] = useState('daily');

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
      if (parsedUser.accounts && parsedUser.accounts.length > 0) {
        setSelectedAccountId(parsedUser.accounts[0].wolvesville_username);
      } else if (parsedUser.wolvesville_username) { // fallback
        setWolvesvilleUsername(parsedUser.wolvesville_username);
        setSelectedAccountId(parsedUser.wolvesville_username);
      }
      if (parsedUser.pending_link && parsedUser.pending_link.verify_code) {
        setVerifyCode(parsedUser.pending_link.verify_code);
        setWolvesvilleUsername(parsedUser.pending_link.wolvesville_username);
      }
      
      fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${t}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.accounts && data.user.accounts.length > 0) {
            setSelectedAccountId(prev => prev || data.user.accounts[0].wolvesville_username);
          }
        }
      })
      .catch(console.error);

      fetch('/api/wolvesville/leaderboard')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLeaderboard(data);
          } else if (data && Array.isArray(data.ranksTop)) {
            setLeaderboard(data.ranksTop);
          } else if (data && Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          }
        })
        .catch(console.error);
    }
  }, [router]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchPlayerData(selectedAccountId);
    }
  }, [selectedAccountId]);

  const fetchPlayerData = async (playerId: string) => {
    setPlayerLoading(true);
    try {
      const res = await fetch(`/api/wolvesville/player/${playerId}`);
      if (res.ok) {
        const data = await res.json();
        setPlayerData(data);
      }
    } catch (e) {
      console.error('Failed to fetch player data', e);
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkMsg('');
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
        setLinkMsg('Code generated! Please put it in your Wolvesville bio.');
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setLinkMsg(`Error: ${data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setLinkMsg('');
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
        setIsLinked(true);
        setIsLinkingNew(false);
        setLinkMsg('Account successfully linked!');
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        fetchPlayerData(wolvesvilleUsername);
      } else {
        setLinkMsg(`Error: ${data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyMsg('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/key/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: licenseKey })
      });
      const data = await res.json();
      if (res.ok) {
        setKeyMsg(`Successfully activated! Expires at: ${new Date(data.expires_at).toLocaleString()}`);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setKeyMsg(`Error: ${data.error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!selectedAccountId) return alert('Select an account first');
    if (!window.confirm("Pause your license?")) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/license/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target_username: selectedAccountId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert('Failed to pause license');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    if (!selectedAccountId) return alert('Select an account first');
    setIsLoading(true);
    try {
      const res = await fetch('/api/license/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target_username: selectedAccountId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert('Failed to resume license');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff'}}>Loading data...</div>;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="logo">Lupophobia<span>Bot</span></Link>
          <div className="nav-welcome">
            Welcome back, <strong id="nav-email">{user.email}</strong>
          </div>
          <div className="nav-right">
            <button className="btn-logout" onClick={logout}>Log out</button>
          </div>
        </div>
      </nav>

      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Your accounts</div>
            
            {user.accounts && user.accounts.length > 0 ? (
              user.accounts.map((acc: any) => (
                <div 
                  key={acc.wolvesville_username}
                  className={`account-item ${selectedAccountId === acc.wolvesville_username ? 'active' : ''}`}
                  onClick={() => setSelectedAccountId(acc.wolvesville_username)}
                  style={{ cursor: 'pointer' }}
                >
                  {acc.wolvesville_username === selectedAccountId && (playerData?.equippedAvatar?.url || (playerData?.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : null)) ? (
                    <img 
                      src={playerData.equippedAvatar?.url || (playerData.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : '')} 
                      alt="Avatar" 
                      className="acc-avatar" 
                      style={{ objectFit: 'cover', background: 'transparent' }} 
                    />
                  ) : (
                    <div className="acc-avatar">{acc.wolvesville_username.substring(0, 2).toUpperCase()}</div>
                  )}
                  {acc.wolvesville_username}
                  {acc.license_active && !acc.is_paused && <i className="fas fa-check-circle" style={{ color: 'var(--green)', marginLeft: 'auto', fontSize: '0.85rem' }} title="License Active"></i>}
                  {acc.is_paused && <i className="fas fa-pause-circle" style={{ color: 'var(--amber)', marginLeft: 'auto', fontSize: '0.85rem' }} title="License Paused"></i>}
                  {!acc.license_active && !acc.is_paused && <i className="fas fa-xmark-circle" style={{ color: 'var(--red)', marginLeft: 'auto', fontSize: '0.85rem' }} title="License Expired"></i>}
                </div>
              ))
            ) : user.wolvesville_username ? (
              <div className="account-item active">
                <div className="acc-avatar">{user.wolvesville_username.substring(0, 2).toUpperCase()}</div>
                {user.wolvesville_username}
              </div>
            ) : (
              <div className="account-item">
                <div className="acc-avatar" style={{background: 'var(--text-3)'}}>?</div>
                Not linked
              </div>
            )}

            <button 
              className="btn-add" 
              style={{ marginTop: '12px' }}
              onClick={() => router.push('/add_account')}
            >
              <i className="fas fa-plus" style={{ fontSize: '14px' }}></i> Add account
            </button>

            {user.email === 'playzzen2510@gmail.com' && (
              <button 
                onClick={() => router.push('/admin')}
                className="btn-add" 
                style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--red)', borderColor: 'rgba(244, 63, 94, 0.3)', marginTop: '12px' }}
              >
                <i className="fa-solid fa-shield-halved"></i> OP PANEL
              </button>
            )}
          </div>

          <div className="sidebar-card" style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div className="pulse-dot"></div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green)' }}>System online</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: '1.6' }}>
              Dashboard connected · All services operational
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="main-panel">
          <div className="tab-nav">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <i className="fas fa-house-user" style={{ fontSize: '13px' }}></i> Overview
            </button>
            <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <i className="fas fa-circle-user" style={{ fontSize: '13px' }}></i> Account
            </button>
            <button className={`tab-btn ${activeTab === 'xp' ? 'active' : ''}`} onClick={() => setActiveTab('xp')}>
              <i className="fas fa-flask" style={{ fontSize: '13px' }}></i> XP Stats
            </button>
            <button className={`tab-btn ${activeTab === 'license' ? 'active' : ''}`} onClick={() => setActiveTab('license')}>
              <i className="fas fa-id-card" style={{ fontSize: '13px' }}></i> License
            </button>
            <button className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>
              <i className="fas fa-people-group" style={{ fontSize: '13px' }}></i> Community
            </button>
            <button className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
              <i className="fas fa-circle-info" style={{ fontSize: '13px' }}></i> Support
            </button>
          </div>

          {/* OVERVIEW TAB */}
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="acct-header">
              {playerData?.equippedAvatar?.url || (playerData?.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : null) ? (
                <img 
                  src={playerData.equippedAvatar?.url || (playerData.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : '')} 
                  alt="Avatar" 
                  className="acct-avatar-lg" 
                  style={{ objectFit: 'cover', background: 'transparent' }} 
                />
              ) : (
                <div className="acct-avatar-lg">{selectedAccountId ? selectedAccountId.substring(0, 2).toUpperCase() : '?'}</div>
              )}
              <div>
                <div className="acct-name">{selectedAccountId || 'Please link an account'}</div>
                <div className="acct-level">⭐ {playerData?.isPrivate ? 'Private Account' : (playerData ? `Level ${playerData.level}` : 'No data available')}</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">🆔 Player ID</div>
                <div className="stat-value small">{playerData?.id || 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">💎 Total XP</div>
                <div className="stat-value" style={{ color: 'var(--v)' }}>
                  {playerData?.isPrivate ? <span style={{fontSize: '1.2rem', color: 'var(--text-3)'}}>Private</span> : (playerData?.gameStats?.totalPlayTimeInMinutes ? (playerData.gameStats.totalPlayTimeInMinutes * 10).toLocaleString() : '0')}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">📈 XP to Next Level</div>
                <div className="stat-value small">
                  {playerData?.isPrivate ? <span style={{color: 'var(--text-3)'}}>Private</span> : 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT TAB */}
          <div className={`tab-content ${activeTab === 'account' ? 'active' : ''}`}>
            {!isLinked ? (
              <div className="pw-reset-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '10px' }}>No account linked</div>
                <div style={{ color: 'var(--text-3)', marginBottom: '20px' }}>Please link an account to view your statistics.</div>
                <Link href="/add_account" style={{ textDecoration: 'none' }}>
                  <button className="btn-add" style={{ width: 'auto', padding: '12px 24px', display: 'inline-flex' }}>
                    <i className="fas fa-link"></i> Link Account
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="acct-header">
                  {playerData?.equippedAvatar?.url || (playerData?.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : null) ? (
                    <img 
                      src={playerData.equippedAvatar?.url || (playerData.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : '')} 
                      alt="Avatar" 
                      className="acct-avatar-lg" 
                      style={{ objectFit: 'cover', background: 'transparent' }} 
                    />
                  ) : (
                    <div className="acct-avatar-lg">{selectedAccountId ? selectedAccountId.substring(0, 2).toUpperCase() : '?'}</div>
                  )}
                  <div>
                    <div className="acct-name">{selectedAccountId}</div>
                    <div className="acct-level">⭐ {playerData?.isPrivate ? 'Private Account' : (playerData ? `Level ${playerData.level}` : 'Loading…')}</div>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">🏆 Games Won</div>
                    <div className="stat-value">{playerData?.isPrivate ? 'N/A' : (playerData?.gameStats?.totalWinCount || 0)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">💀 Games Lost</div>
                    <div className="stat-value">{playerData?.isPrivate ? 'N/A' : (playerData?.gameStats?.totalLoseCount || 0)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">📊 Win Ratio</div>
                    <div className="stat-value">
                      {playerData?.isPrivate ? 'N/A' : (playerData?.gameStats ? ((playerData.gameStats.totalWinCount / (playerData.gameStats.totalWinCount + playerData.gameStats.totalLoseCount)) * 100).toFixed(1) + '%' : '0%')}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">👥 Friends</div>
                    <div className="stat-value">{playerData?.isPrivate ? 'N/A' : (playerData?.friendCount ?? (playerData?.friends?.length || 0))}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">🎮 Total Games</div>
                    <div className="stat-value">{playerData?.isPrivate ? 'N/A' : (playerData?.gameStats ? (playerData.gameStats.totalWinCount + playerData.gameStats.totalLoseCount) : 0)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">⚔️ Ranked Skill</div>
                    <div className="stat-value">N/A</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* XP STATS TAB */}
          <div className={`tab-content ${activeTab === 'xp' ? 'active' : ''}`}>
            <div className="acct-header">
              {playerData?.equippedAvatar?.url || (playerData?.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : null) ? (
                <img 
                  src={playerData.equippedAvatar?.url || (playerData.avatars && playerData.avatars.length > 0 ? playerData.avatars[0].url : '')} 
                  alt="Avatar" 
                  className="acct-avatar-lg" 
                  id="xp-avatar"
                  style={{ objectFit: 'cover', background: 'transparent' }} 
                />
              ) : (
                <div className="acct-avatar-lg" id="xp-avatar">
                  {selectedAccountId ? selectedAccountId.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <div className="acct-name" id="xp-username">{selectedAccountId || 'Unknown'}</div>
                <div className="acct-level" id="xp-level" style={{ color: 'var(--gold)' }}>
                  {playerLoading ? '⭐ Loading…' : (
                    playerData && playerData.level !== undefined && playerData.level !== null
                      ? `⭐ Level ${playerData.level}`
                      : '⭐ Level Private'
                  )}
                </div>
              </div>
            </div>
            
            <div className="sec-hd" style={{ marginTop: '24px' }}>
              🤖 Bot XP Statistics
            </div>
            
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-label">🗓️ XP TODAY</div>
                <div className="stat-value small" style={{ color: 'var(--c)' }}>0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">📊 XP THIS WEEK</div>
                <div className="stat-value small" style={{ color: 'var(--c)' }}>0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">📈 XP THIS MONTH</div>
                <div className="stat-value small" style={{ color: 'var(--c)' }}>0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">🏆 TOTAL XP</div>
                <div className="stat-value small" style={{ color: 'var(--gold)' }}>
                  {playerLoading ? '...' : (playerData?.xp ? playerData.xp.toLocaleString() : 'Private')}
                </div>
              </div>
            </div>
            
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0' }}>
              <div className="stat-card" style={{ maxWidth: '400px' }}>
                <div className="stat-label">⭐ LEVELS GAINED BY BOT</div>
                <div className="stat-value" style={{ color: 'var(--c)' }}>0</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '12px' }}>
                  0 XP ÷ 2000 per level
                </div>
              </div>
            </div>
          </div>

          {/* LICENSE TAB */}
          <div className={`tab-content ${activeTab === 'license' ? 'active' : ''}`}>
            {(() => {
              const currentAccount = user?.accounts?.find((a: any) => a.wolvesville_username === selectedAccountId);
              
              const expiresAt = currentAccount?.license_expires_at ? new Date(currentAccount.license_expires_at) : null;
              const pausedAt = currentAccount?.paused_at ? new Date(currentAccount.paused_at) : null;
              const now = new Date();
              
              let daysRemaining = 0;
              if (expiresAt) {
                if (currentAccount?.is_paused && pausedAt) {
                  daysRemaining = Math.ceil((expiresAt.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24));
                } else {
                  daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
              }
              
              return (
                <>
                  <div className="sec-hd"><i className="fas fa-ticket"></i> License status</div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-2)', marginBottom: '8px' }}>
                          Expires: <strong style={{ color: 'var(--text)' }}>
                            {currentAccount?.license_active && currentAccount?.license_expires_at ? new Date(currentAccount.license_expires_at).toISOString().split('T')[0] : 'No active license'}
                          </strong>
                        </div>
                        {currentAccount?.is_paused && pausedAt && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                            Paused on: {pausedAt.toISOString().split('T')[0]} &middot; Days remaining: {daysRemaining > 0 ? daysRemaining : 0}
                          </div>
                        )}
                      </div>
                      
                      {currentAccount?.is_paused ? (
                        <div style={{ padding: '8px 20px', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <i className="fas fa-pause"></i> Paused
                        </div>
                      ) : currentAccount?.license_active ? (
                        <div style={{ padding: '8px 20px', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <i className="fas fa-check"></i> Active
                        </div>
                      ) : (
                        <div style={{ padding: '8px 20px', borderRadius: '50px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--red)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <i className="fas fa-xmark"></i> Inactive
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                      {currentAccount?.is_paused ? (
                        <button 
                          className="action-btn"
                          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--green)', padding: '11px 22px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={handleResume}
                          disabled={isLoading}
                        >
                          <i className="fas fa-play"></i> Resume
                        </button>
                      ) : (
                        <button 
                          className="action-btn"
                          style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', padding: '11px 22px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={handlePause}
                          disabled={isLoading || !currentAccount?.license_active}
                        >
                          <i className="fas fa-pause"></i> Pause
                        </button>
                      )}
                      
                      <button 
                        className="action-btn action-extend"
                        style={{ background: 'linear-gradient(90deg, var(--v), var(--c))', color: '#fff', padding: '11px 22px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 2px 16px rgba(124, 58, 237, 0.35)' }}
                        onClick={() => window.open('https://discord.gg/3Anr2F3Nha', '_blank')}
                      >
                        <i className="fas fa-plus"></i> Extend license
                      </button>
                    </div>
                  </div>

                  <div className="sec-hd"><i className="fas fa-lock"></i> Password recovery</div>
                  <div className="pw-reset-box" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginTop: '20px', marginBottom: '32px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '20px' }}>
                      Verify account ownership by placing a code in your Wolvesville biography.
                    </div>

                    {!isResetting ? (
                      <button 
                        className="action-btn action-extend" 
                        onClick={() => {
                          setResetCode(Math.random().toString(16).substr(2, 6).toUpperCase().split('').join(' '));
                          setIsResetting(true);
                        }}
                      >
                        <i className="fas fa-key"></i> Reset ingame password
                      </button>
                    ) : (
                      <>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '12px' }}>
                            Add this code to your biography:
                          </div>
                          <div className="code-display" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '8px', fontFamily: 'monospace', background: 'linear-gradient(90deg, var(--c), var(--v))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', padding: '18px 0', marginBottom: '16px' }}>
                            {resetCode}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                            Profile &rarr; Edit &rarr; Biography &rarr; paste &rarr; Save
                          </div>
                        </div>

                        <input 
                          type="password" 
                          className="input-field" 
                          placeholder="New password (min 4 chars)" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-2)', borderRadius: '10px', color: 'var(--text)', padding: '11px 14px', fontSize: '0.9rem', outline: 'none', marginBottom: '20px' }}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            className="action-btn" 
                            style={{ background: 'linear-gradient(90deg, var(--v), var(--c))', color: '#fff', padding: '11px 22px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 2px 16px rgba(124, 58, 237, 0.35)', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => alert('Password reset is under development.')}
                          >
                            <i className="fas fa-check"></i> Verify & Reset
                          </button>
                          <button 
                            className="action-btn" 
                            style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', padding: '11px 22px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => { setIsResetting(false); setNewPassword(''); }}
                          >
                            <i className="fas fa-xmark"></i> Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="sec-hd"><i className="fas fa-bolt"></i> Activate License Key</div>
                  <div className="pw-reset-box" style={{ marginTop: '0' }}>
                    <form onSubmit={handleLicense}>
                      <div style={{ marginBottom: '16px' }}>
                        <label className="field-label">Enter your Key (for {selectedAccountId || 'account'})</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="e.g. RXZ-ABC-XYZ-123" 
                          value={licenseKey}
                          onChange={e => setLicenseKey(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, var(--v), var(--c))', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLoading ? 'Checking...' : 'Activate Now'}
                      </button>
                      {keyMsg && <div style={{ marginTop: '16px', color: 'var(--amber)', fontWeight: 'bold' }}>{keyMsg}</div>}
                    </form>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* COMMUNITY TAB */}
          <div className={`tab-content ${activeTab === 'community' ? 'active' : ''}`}>
            <div className="range-tabs">
              <button className="range-tab active">Top Ranked</button>
            </div>
            
            <div className="leaderboard-wrap">
              {leaderboard.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-3)' }}>
                  <div className="loader-sm" style={{ marginBottom: '10px' }}></div>
                  <div>Loading leaderboard data...</div>
                </div>
              ) : (
                leaderboard.map((item, index) => (
                  <div className="lb-item" key={item.id || item.playerId || index}>
                    <div className={`lb-rank ${index < 3 ? 'top3' : ''}`}>#{index + 1}</div>
                    <div className="lb-user">{item.username || 'Unknown'}</div>
                    <div className="lb-xp">{item.skill || item.score || item.rankedSkill || item.value || 'N/A'} XP</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* SUPPORT TAB */}
          <div className={`tab-content ${activeTab === 'support' ? 'active' : ''}`}>
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎧</span>
              <h2 style={{ color: 'var(--v)' }}>Need Support?</h2>
              <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>Join our Discord server or create a support ticket.</p>
              <button style={{ padding: '12px 28px', borderRadius: '50px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--v)', border: '1px solid rgba(124, 58, 237, 0.3)', cursor: 'pointer', fontWeight: 'bold' }}>Join Discord</button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
