import React, { useState } from 'react';

/**
 * Editorial Case File Login Gateway
 * "Every Transaction Leaves a Trail"
 * 
 * Dummy Credentials:
 *   Email: yit09@gmail.com
 *   Password: 123456
 */
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    const cleanEmail = email.trim();
    let hasErr = false;

    if (!cleanEmail) {
      setEmailError('Enter your work email.');
      hasErr = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Enter a valid work email address.');
      hasErr = true;
    }

    if (!password) {
      setPasswordError('Enter your password.');
      hasErr = true;
    }

    if (hasErr) return;

    setIsLoading(true);

    // Mock authentication with explicit dummy credentials
    setTimeout(() => {
      const isEmailValid = cleanEmail.toLowerCase() === 'yit09@gmail.com';
      const isPasswordValid = password === '123456';

      if (isEmailValid && isPasswordValid) {
        setIsLoading(false);
        if (keepSignedIn) {
          localStorage.setItem('mth_auth', 'true');
          localStorage.setItem('mth_user', JSON.stringify({ email: cleanEmail, name: 'Analyst Yit' }));
        } else {
          sessionStorage.setItem('mth_auth', 'true');
          sessionStorage.setItem('mth_user', JSON.stringify({ email: cleanEmail, name: 'Analyst Yit' }));
        }
        if (onLogin) {
          onLogin({ email: cleanEmail, name: 'Analyst Yit' });
        }
      } else {
        setIsLoading(false);
        setAuthError("Those details don't match our records.");
      }
    }, 850);
  };

  return (
    <div className="editorial-login-root">
      <style>{`
        .editorial-login-root {
          min-height: 100vh;
          width: 100%;
          background-color: #F4F1EA;
          color: #141414;
          font-family: "Instrument Sans", -apple-system, sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .editorial-login-root .grain-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .editorial-login-root .masthead {
          border-bottom: 1px solid #141414;
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #F4F1EA;
        }

        .editorial-login-root .brand-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #141414;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .editorial-login-root .brand-tag {
          font-size: 11px;
          font-weight: 500;
          color: #6B675F;
          border: 1px solid #141414;
          padding: 1px 6px;
        }

        .editorial-login-root .masthead-meta {
          font-size: 12px;
          color: #6B675F;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .editorial-login-root .vermilion-dot {
          width: 6px;
          height: 6px;
          background-color: #E8452C;
          border-radius: 50%;
          display: inline-block;
        }

        .editorial-login-root .split-grid {
          display: grid;
          grid-template-columns: 55fr 45fr;
          min-height: calc(100vh - 58px);
          flex: 1;
        }

        .editorial-login-root .left-pane {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 64px 64px 56px;
          border-right: 1px solid #141414;
        }

        .editorial-login-root .section-eyebrow {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6B675F;
          margin-bottom: 24px;
        }

        .editorial-login-root .headline {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(44px, 5vw, 68px);
          line-height: 1.05;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: #141414;
          margin-bottom: 24px;
        }

        .editorial-login-root .headline em {
          font-style: italic;
          font-weight: 400;
        }

        .editorial-login-root .subdeck {
          font-size: 17px;
          line-height: 1.5;
          color: #6B675F;
          max-width: 480px;
          margin-bottom: 36px;
        }

        .editorial-login-root .trail-svg {
          width: 100%;
          max-width: 540px;
          height: 160px;
          display: block;
        }

        .editorial-login-root .trail-main {
          stroke: #141414;
          stroke-width: 1.5;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: drawLine 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }

        .editorial-login-root .right-pane {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          background-color: #F4F1EA;
        }

        .editorial-login-root .card {
          width: 100%;
          max-width: 420px;
          background-color: #FFFFFF;
          border: 1px solid #141414;
          border-radius: 2px;
          box-shadow: 4px 4px 0 #141414;
          padding: 40px 36px 32px 36px;
        }

        .editorial-login-root .card-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6B675F;
          margin-bottom: 12px;
        }

        .editorial-login-root .card-title {
          font-family: "Fraunces", Georgia, serif;
          font-size: 32px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #141414;
          margin-bottom: 28px;
          line-height: 1.15;
        }

        .editorial-login-root .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #141414;
          margin-bottom: 6px;
          display: block;
        }

        .editorial-login-root .input-field {
          width: 100%;
          height: 48px;
          background-color: #FFFFFF;
          border: 1px solid #141414;
          border-radius: 2px;
          padding: 0 16px;
          color: #141414;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .editorial-login-root .input-field:focus {
          outline: 2px solid #E8452C;
          outline-offset: 2px;
        }

        .editorial-login-root .input-field.error {
          border-color: #E8452C;
        }

        .editorial-login-root .btn-continue {
          position: relative;
          width: 100%;
          height: 48px;
          background-color: #E8452C;
          color: #FFFFFF;
          border: 1px solid #141414;
          border-radius: 2px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0 #141414;
          overflow: hidden;
          transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease;
        }

        .editorial-login-root .btn-continue:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 #141414;
          background-color: #D33A22;
        }

        .editorial-login-root .btn-continue:focus-visible {
          outline: 2px solid #E8452C;
          outline-offset: 2px;
        }

        .editorial-login-root .btn-secondary {
          width: 100%;
          height: 44px;
          background: transparent;
          color: #141414;
          border: 1px solid #141414;
          border-radius: 2px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .editorial-login-root .btn-secondary:hover {
          background-color: #ECE8E0;
        }

        .editorial-login-root .btn-secondary:focus-visible {
          outline: 2px solid #E8452C;
          outline-offset: 2px;
        }

        .editorial-login-root .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: rgba(20, 20, 20, 0.2);
        }

        .editorial-login-root .progress-indicator {
          width: 30%;
          height: 100%;
          background-color: #FFFFFF;
          animation: slideBar 1s infinite linear;
        }

        @keyframes slideBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }

        @media (max-width: 960px) {
          .editorial-login-root .split-grid {
            grid-template-columns: 1fr;
          }
          .editorial-login-root .left-pane {
            border-right: none;
            border-bottom: 1px solid #141414;
            padding: 40px 24px;
          }
          .editorial-login-root .headline {
            font-size: 38px;
          }
          .editorial-login-root .trail-svg {
            height: 70px;
          }
          .editorial-login-root .right-pane {
            padding: 40px 20px 48px;
          }
        }
      `}</style>

      <div className="grain-layer" aria-hidden="true" />

      {/* Header */}
      <header className="masthead">
        <div className="brand-title">
          <span>Mule Account Money-Trail Hunter</span>
          <span className="brand-tag">Dossier / Internal</span>
        </div>
        <div className="masthead-meta">
          <span>Security classification: Confidential</span>
          <span className="vermilion-dot" />
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="split-grid">
        {/* Left Column */}
        <section className="left-pane">
          <div style={{ maxWidth: 580 }}>
            <div className="section-eyebrow">
              Financial Crimes Intelligence &middot; Case File
            </div>
            
            <h1 className="headline">
              Every Transaction Leaves a <em>Trail.</em>
            </h1>

            <p className="subdeck">
              Trace layered transfers across accounts and surface the ones that don't belong.
            </p>

            {/* Hand-drawn SVG trail */}
            <svg 
              className="trail-svg" 
              viewBox="0 0 540 180" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M 120 75 C 160 30, 220 25, 280 45 C 330 60, 370 40, 420 28" 
                stroke="#D8D4CA" 
                strokeWidth="1.25" 
                strokeDasharray="4 4" 
              />
              <path 
                className="trail-main"
                d="M 10 95 C 60 95, 90 75, 120 75 C 170 75, 195 125, 255 125 C 315 125, 340 70, 395 70 C 445 70, 470 105, 516 105" 
              />
              <path 
                d="M 280 45 C 320 60, 350 70, 395 70" 
                stroke="#D8D4CA" 
                strokeWidth="1.25" 
                strokeDasharray="4 4" 
              />
              <circle cx="520" cy="105" r="4.5" fill="#E8452C" stroke="#141414" strokeWidth="1.5" />
            </svg>

            <div style={{ marginTop: 40, fontSize: 11, color: '#9C988F', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Ledger node trace protocol &bull; Section 04-B
            </div>
          </div>
        </section>

        {/* Right Column: Case Card */}
        <section className="right-pane">
          <div className="card">
            <div className="card-label">CASE WORKSPACE</div>
            <h2 className="card-title">Sign in</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Email */}
              <div>
                <label htmlFor="auth-email" className="field-label">Work email</label>
                <input 
                  type="email" 
                  id="auth-email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); setAuthError(''); }}
                  placeholder="yit09@gmail.com"
                  className={`input-field ${emailError || authError ? 'error' : ''}`}
                  autoComplete="email"
                />
                {emailError && (
                  <div style={{ color: '#E8452C', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                    {emailError}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="auth-password" className="field-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setAuthError(''); }}
                    className={`input-field ${passwordError || authError ? 'error' : ''}`}
                    style={{ paddingRight: 64 }}
                    autoComplete="current-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      background: 'none',
                      border: 'none',
                      color: '#141414',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordError && (
                  <div style={{ color: '#E8452C', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Checkbox & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, userSelect: 'none' }}>
                  <input 
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    style={{ accentColor: '#E8452C', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span>Keep me signed in</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Security Policy: Credentials must be reset via SecOps portal.'); }}
                  style={{ color: '#6B675F', fontSize: 13, textDecoration: 'underline' }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Auth Failure Notice */}
              {authError && (
                <div style={{ color: '#E8452C', fontSize: 13, fontWeight: 500 }}>
                  {authError}
                </div>
              )}

              {/* Primary Continue Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-continue"
              >
                <span>{isLoading ? 'Checking...' : 'Continue'}</span>
                {isLoading && (
                  <div className="progress-bar">
                    <div className="progress-indicator" />
                  </div>
                )}
              </button>

              {/* SSO Secondary */}
              <button 
                type="button"
                onClick={() => alert('SSO Gateway: Transferring to IdP authentication...')}
                className="btn-secondary"
              >
                Sign in with SSO
              </button>
            </form>

            <footer style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #D8D4CA', fontSize: 11, color: '#6B675F' }}>
              Authorized personnel only. All sessions are logged.
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
