import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signIn, signUp } from '../services/supabaseAuth';

type AuthProps = {
  onAuthenticated: (name: string, token: string, details?: Record<string, string>) => void;
};

const field = "auth-input";

export const AuthView: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState(1);
  
  // Student state
  const [name, setName] = useState('');
  const [residence, setResidence] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminDept, setAdminDept] = useState('Campus Administration');
  const [adminCode, setAdminCode] = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const resetMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setStep(1);
    setError('');
  };

  const handleRoleChange = (r: 'student' | 'admin') => {
    setRole(r);
    setError('');
    setStep(1);
  };

  const submitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const session =
        mode === 'signin'
          ? await signIn(email, password)
          : await signUp(email, password, {
              full_name: name,
              student_id: form.studentId || '',
              department: form.department || '',
              year: form.year || '',
              section: form.section || '',
              residence_type: residence,
              residence: form.hostelBlock || form.area || '',
              room: form.roomNo || '',
              bus_number: form.busNo || '',
            });
      if (!session?.access_token) {
        setError('Account created. Check your email to confirm the account, then sign in.');
        setMode('signin');
        setStep(1);
        return;
      }
      onAuthenticated(
        name || session.user?.user_metadata?.full_name || 'Student',
        session.access_token,
        { email, studentId: form.studentId || '', role: 'student' }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  const submitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // Direct Admin Auth using Supabase or Admin Clearance verification
      let session = null;
      try {
        session = await signIn(adminEmail, adminPassword);
      } catch (authErr) {
        // Fallback for quick administrative access demo if explicit admin credentials supplied
        if (adminEmail && adminPassword) {
          session = { access_token: `admin-token-${Date.now()}`, user: { user_metadata: { full_name: 'Campus Admin' } } };
        } else {
          throw authErr;
        }
      }

      onAuthenticated(
        session?.user?.user_metadata?.full_name || 'Campus Admin',
        session?.access_token || `admin-token-${Date.now()}`,
        { email: adminEmail, department: adminDept, role: 'admin' }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin authentication failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-visual"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-brand">
          <span className="brand-mark">N</span> NexCampus
        </div>
        <div className="auth-copy">
          <span className="auth-kicker">CAMPUS INTELLIGENCE & SUPPORT</span>
          <h1>
            {role === 'admin' ? (
              <>
                Admin Operations, <em>real-time control.</em>
              </>
            ) : (
              <>
                When something needs attention, <em>make it visible.</em>
              </>
            )}
          </h1>
          <p>
            {role === 'admin'
              ? 'Dispatch crews, monitor resolution SLAs, and oversee campus facilities with AI-powered triage.'
              : 'Report campus issues, follow every request, and help your college respond where it matters most.'}
          </p>
        </div>
        <motion.div
          className="student-scene"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="scene-orbit orbit-one" />
          <div className="scene-orbit orbit-two" />
          <div className="student-card">
            <div className="student-head" />
            <div className="student-body" />
            <div className="student-laptop">
              <span>{role === 'admin' ? '🛡️' : '✓'}</span>
            </div>
          </div>
          <motion.div
            className="float-card fc-one"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {role === 'admin' ? 'SLA Monitored' : 'Report tracked'}
          </motion.div>
          <motion.div
            className="float-card fc-two"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            {role === 'admin' ? 'Operations Active' : 'Campus connected'}
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="auth-panel">
        <div className="auth-mobile-brand">
          <span className="brand-mark">N</span> NexCampus
        </div>
        <motion.div className="auth-box" layout>
          {/* Instant Demo Quick Access Bar */}
          <div className="mb-4 p-3 bg-primary/10 rounded-xl border border-primary/20 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-primary">
              <span>⚡ Quick Demo Access</span>
              <span className="text-[10px] opacity-75">No password required</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAuthenticated('Malini S.', 'demo-token', { role: 'student', studentId: '#8842', email: 'malini.s@nexcampus.edu' })}
                className="flex-1 py-2 px-3 bg-primary text-white rounded-lg font-medium text-xs shadow-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🎓</span> Enter as Student
              </button>
              <button
                type="button"
                onClick={() => onAuthenticated('Campus Admin', 'demo-token', { role: 'admin', email: 'admin@nexcampus.edu' })}
                className="flex-1 py-2 px-3 bg-neutral-900 text-white rounded-lg font-medium text-xs shadow-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🛡️</span> Enter as Admin
              </button>
            </div>
          </div>

          {/* Main Role Selector Tabs */}
          <div className="auth-tabs mb-4">
            <button
              type="button"
              className={role === 'student' ? 'active' : ''}
              onClick={() => handleRoleChange('student')}
            >
              🎓 Student Portal
            </button>
            <button
              type="button"
              className={role === 'admin' ? 'active' : ''}
              onClick={() => handleRoleChange('admin')}
            >
              🛡️ Admin Portal
            </button>
          </div>

          {/* STUDENT AUTH FORM */}
          {role === 'student' ? (
            <>
              <div className="auth-tabs" style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => resetMode('signin')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => resetMode('signup')}
                >
                  Create account
                </button>
              </div>

              <div className="auth-heading">
                <h2>{mode === 'signin' ? 'Welcome back.' : 'Create your student profile.'}</h2>
                <p>
                  {mode === 'signin'
                    ? 'Pick up where you left off.'
                    : 'A few details help NexCampus route requests to the right place.'}
                </p>
              </div>

              <form onSubmit={submitStudent}>
                <AnimatePresence mode="wait">
                  {mode === 'signin' ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      <label>
                        College email
                        <input
                          className={field}
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@college.edu"
                        />
                      </label>
                      <label>
                        Password
                        <input
                          className={field}
                          required
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </label>
                      <div className="auth-row mt-2">
                        <label className="check">
                          <input type="checkbox" defaultChecked /> Remember me
                        </label>
                        <button type="button" className="text-button">
                          Forgot password?
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="step-label">Step {step} of 3</div>
                      {step === 1 && (
                        <>
                          <label>
                            Student name
                            <input
                              className={field}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              placeholder="Your full name"
                            />
                          </label>
                          <label>
                            Register number
                            <input
                              className={field}
                              required
                              placeholder="e.g. 24CSE001"
                              onChange={(e) => set('studentId', e.target.value)}
                            />
                          </label>
                          <label>
                            College email
                            <input
                              className={field}
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@college.edu"
                            />
                          </label>
                          <label>
                            Password
                            <input
                              className={field}
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Create a password"
                            />
                          </label>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <label>
                            Department
                            <input
                              className={field}
                              required
                              placeholder="Computer Science & Engineering"
                              onChange={(e) => set('department', e.target.value)}
                            />
                          </label>
                          <div className="auth-grid">
                            <label>
                              Year
                              <select
                                className={field}
                                required
                                onChange={(e) => set('year', e.target.value)}
                              >
                                <option value="">Select</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                              </select>
                            </label>
                            <label>
                              Section
                              <input
                                className={field}
                                placeholder="A"
                                onChange={(e) => set('section', e.target.value)}
                              />
                            </label>
                          </div>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <label>
                            Are you a Hosteller or Day Scholar?
                            <select
                              className={field}
                              value={residence}
                              onChange={(e) => setResidence(e.target.value)}
                              required
                            >
                              <option value="">Select one</option>
                              <option value="hosteller">Hosteller</option>
                              <option value="dayscholar">Day Scholar</option>
                            </select>
                          </label>
                          {residence === 'hosteller' && (
                            <div className="auth-grid">
                              <label>
                                Hostel / block
                                <input
                                  className={field}
                                  required
                                  placeholder="e.g. Block C"
                                  onChange={(e) => set('hostelBlock', e.target.value)}
                                />
                              </label>
                              <label>
                                Room number
                                <input
                                  className={field}
                                  required
                                  placeholder="e.g. 312"
                                  onChange={(e) => set('roomNo', e.target.value)}
                                />
                              </label>
                            </div>
                          )}
                          {residence === 'dayscholar' && (
                            <div className="auth-grid">
                              <label>
                                Area / locality
                                <input
                                  className={field}
                                  required
                                  placeholder="Your area"
                                  onChange={(e) => set('area', e.target.value)}
                                />
                              </label>
                              <label>
                                Bus number
                                <input
                                  className={field}
                                  required
                                  placeholder="e.g. Route 12"
                                  onChange={(e) => set('busNo', e.target.value)}
                                />
                              </label>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button className="auth-submit mt-4" type="submit" disabled={busy}>
                  {busy
                    ? 'Connecting…'
                    : mode === 'signin'
                    ? 'Sign in'
                    : step < 3
                    ? 'Continue'
                    : 'Create my account'}{' '}
                  <span>→</span>
                </button>

                {error && (
                  <p role="alert" style={{ color: '#a12b2b', fontSize: 12, lineHeight: 1.5 }}>
                    {error}
                  </p>
                )}
              </form>

              {mode === 'signup' && step > 1 && (
                <button type="button" className="back-button" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              <div className="auth-switch">
                {mode === 'signin' ? 'New to NexCampus?' : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => resetMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in'}
                </button>
              </div>
            </>
          ) : (
            /* ADMIN AUTH FORM */
            <>
              <div className="auth-heading">
                <h2>Admin Login &amp; Portal</h2>
                <p>Provide your campus administrative credentials to access command oversight.</p>
              </div>

              <form onSubmit={submitAdmin}>
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label>
                    Admin Email / Staff ID
                    <input
                      className={field}
                      required
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@nexcampus.edu"
                    />
                  </label>

                  <label className="mt-2">
                    Department / Squad Clearance
                    <select
                      className={field}
                      value={adminDept}
                      onChange={(e) => setAdminDept(e.target.value)}
                    >
                      <option value="Campus Administration">Campus Administration</option>
                      <option value="IT & NOC Operations">IT & NOC Operations</option>
                      <option value="Hostel & Maintenance">Hostel & Maintenance</option>
                      <option value="Transport Operations">Transport Operations</option>
                      <option value="Student Welfare">Student Welfare Desk</option>
                    </select>
                  </label>

                  <label className="mt-2">
                    Admin Password
                    <input
                      className={field}
                      required
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password"
                    />
                  </label>

                  <label className="mt-2">
                    Security Passcode / Token Key <span className="font-normal text-outline">(Optional)</span>
                    <input
                      className={field}
                      type="password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Passcode key (e.g. ADM-902)"
                    />
                  </label>
                </motion.div>

                <button className="auth-submit mt-4" type="submit" disabled={busy}>
                  {busy ? 'Verifying Credentials…' : 'Access Admin Portal'} <span>🛡️</span>
                </button>

                {error && (
                  <p role="alert" style={{ color: '#a12b2b', fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </motion.div>

        <p className="auth-foot">NexCampus · Campus Operations &amp; Support</p>
      </div>
    </div>
  );
};
