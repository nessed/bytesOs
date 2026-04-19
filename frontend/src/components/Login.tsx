import { useState } from 'react';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'bytes' && password === 'bytes123') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div className="logo" style={{ width: 28, height: 28, fontSize: 15 }}>B</div>
          <div className="tb-title" style={{ fontSize: 18 }}>bytes<em>os</em></div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="log-field">
            <label>Username</label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username" 
              autoFocus 
            />
          </div>
          <div className="log-field" style={{ marginBottom: 20 }}>
            <label>Password</label>
            <input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>
          
          {error && <div className="login-error slide-in">Invalid credentials.</div>}
          
          <button type="submit" className="log-submit" style={{ marginTop: 'auto' }}>
            Enter Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
