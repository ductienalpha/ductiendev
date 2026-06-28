'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  
  const [activeTab, setActiveTab] = useState<'users' | 'keys'>('keys');
  const [users, setUsers] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate Key Form
  const [genAmount, setGenAmount] = useState(1);
  const [genDuration, setGenDuration] = useState(30);
  const [genTargetUser, setGenTargetUser] = useState('');
  const [genMsg, setGenMsg] = useState('');

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    
    if (!t || !u) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
    setToken(t);
    
    fetchData(t, 'keys');
  }, [router]);

  const fetchData = async (t: string, tab: 'users' | 'keys') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/${tab}`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      
      if (res.status === 403 || res.status === 401) {
        alert("ACCESS DENIED: OP PRIVILEGES REQUIRED.");
        router.push('/dashboard');
        return;
      }
      
      const data = await res.json();
      if (tab === 'users') {
        setUsers(data.users || []);
      } else {
        setKeys(data.keys || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: 'users' | 'keys') => {
    setActiveTab(tab);
    fetchData(token, tab);
  };

  const handleGenerateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenMsg('');
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: genAmount,
          duration_days: genDuration,
          target_username: genTargetUser || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGenMsg(`Successfully generated ${genAmount} keys!`);
        fetchData(token, 'keys');
      } else {
        setGenMsg(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setGenMsg(`Error: ${e.message}`);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to DESTROY this key? This action is irreversible!")) return;
    try {
      const res = await fetch(`/api/admin/keys?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData(token, 'keys');
      } else {
        const data = await res.json();
        alert(`Failed to delete key: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to TERMINATE this user? This action is irreversible!")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData(token, 'users');
      } else {
        const data = await res.json();
        alert(`Failed to delete user: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Loading OP System...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '20px', fontFamily: '"DM Sans", sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '20px 28px', borderBottom: '2px solid rgba(244, 63, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', marginBottom: '32px', maxWidth: '1200px', margin: '0 auto 32px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
            <i className="fa-solid fa-shield-halved"></i> OP PANEL (OVERSEER MODE)
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '6px', fontWeight: 'bold' }}>FULL CONTROL ACTIVE</div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', border: '1px solid var(--border-2)', padding: '10px 20px', cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fas fa-arrow-left"></i> Return to Dash
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <button 
            onClick={() => switchTab('keys')}
            style={{ 
              padding: '14px 28px', 
              background: activeTab === 'keys' ? 'linear-gradient(90deg, var(--red), var(--pink))' : 'rgba(255,255,255,0.03)', 
              color: activeTab === 'keys' ? '#fff' : 'var(--text-2)', 
              border: activeTab === 'keys' ? 'none' : '1px solid var(--border)', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            <i className="fas fa-key"></i> Arsenal (Keys)
          </button>
          <button 
            onClick={() => switchTab('users')}
            style={{ 
              padding: '14px 28px', 
              background: activeTab === 'users' ? 'linear-gradient(90deg, var(--red), var(--pink))' : 'rgba(255,255,255,0.03)', 
              color: activeTab === 'users' ? '#fff' : 'var(--text-2)', 
              border: activeTab === 'users' ? 'none' : '1px solid var(--border)', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            <i className="fas fa-users"></i> User Matrix
          </button>
        </div>

        {/* KEYS TAB */}
        {activeTab === 'keys' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>License Arsenal</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--red)', fontSize: '1rem' }}>Forge New Keys</h4>
              <form onSubmit={handleGenerateKeys} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 'bold' }}>Amount</label>
                  <input 
                    type="number" min="1" max="100" 
                    value={genAmount} onChange={e => setGenAmount(parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-2)', color: 'white', borderRadius: '10px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 'bold' }}>Duration (Days)</label>
                  <input 
                    type="number" min="1" 
                    value={genDuration} onChange={e => setGenDuration(parseInt(e.target.value) || 30)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-2)', color: 'white', borderRadius: '10px' }}
                  />
                </div>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 'bold' }}>Target Username (Optional Lock)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. JustADream1"
                    value={genTargetUser} onChange={e => setGenTargetUser(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-2)', color: 'white', borderRadius: '10px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '12px 28px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)' }}>
                  Forge Keys
                </button>
              </form>
              {genMsg && <div style={{ marginTop: '16px', color: 'var(--amber)', fontWeight: 'bold' }}>{genMsg}</div>}
            </div>

            {isLoading ? <div style={{ color: 'var(--text-3)' }}>Loading arsenal...</div> : (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>KEY STRING</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>DURATION</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>LOCKED TO</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>CLAIMED BY</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>STATUS</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>EXPIRES AT</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text)' }}>{k.key}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{k.duration_days} days</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{k.target_username || 'Anyone'}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{k.used_by?.email || '-'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '50px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold',
                            background: k.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: k.status === 'active' ? 'var(--green)' : 'var(--text-3)',
                            border: `1px solid ${k.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-2)'}`
                          }}>
                            {k.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{k.expires_at ? new Date(k.expires_at).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <button onClick={() => handleDeleteKey(k._id)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '8px', cursor: 'pointer' }}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {keys.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>Arsenal is empty. Forge some keys.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>User Matrix</h3>
            </div>
            
            {isLoading ? <div style={{ color: 'var(--text-3)' }}>Loading matrix...</div> : (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>EMAIL</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>WOLVESVILLE ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>JOINED</th>
                      <th style={{ padding: '16px 20px', color: 'var(--red)', fontSize: '0.8rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--text-3)' }}>{u._id.substring(0, 8)}...</td>
                        <td style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text)' }}>{u.email}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>
                          {u.wolvesville_username ? (
                            <span style={{ color: 'var(--v)' }}>{u.wolvesville_username}</span>
                          ) : (
                            <span style={{ color: 'var(--text-3)' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-2)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '8px', cursor: 'pointer' }}>
                            <i className="fas fa-user-slash"></i> Terminate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
