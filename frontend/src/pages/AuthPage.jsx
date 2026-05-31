import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, Zap, Shield, Users, ArrowRight, GraduationCap } from 'lucide-react';

const features = [
  { icon: <BookOpen className="w-5 h-5" />, text: 'Interactive CS Curriculum' },
  { icon: <Zap className="w-5 h-5" />, text: 'Live Sessions & XP Rewards' },
  { icon: <Shield className="w-5 h-5" />, text: 'Secure & Verified Certificates' },
  { icon: <Users className="w-5 h-5" />, text: 'Learn with Top Instructors' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        user = await register(form.name, form.email, form.password, form.role);
      }
      navigate(user.role === 'STUDENT' ? '/dashboard' : '/admin');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Aesthetic */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)' }}>

        {/* Animated orbs */}
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', top: '-5%', left: '-10%' }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '10%', right: '-5%', animationDelay: '3s' }} />
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)', bottom: '40%', left: '30%' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(14,165,233,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-500/30 bg-sky-500/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sky-300 text-sm font-medium">Live learning platform</span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Learn CS like a
                <span className="block" style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #10b981 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Pro Engineer
                </span>
              </h1>
              <p className="text-slate-400 mt-4 text-lg leading-relaxed max-w-sm">
                Master Data Structures, Web Dev, OS, ML and more with real instructors and live sessions.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-sky-400">
                    {f.icon}
                  </div>
                  <span className="text-slate-300 font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              {[['500+', 'Students'], ['12+', 'Courses'], ['98%', 'Satisfaction']].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{n}</div>
                  <div className="text-slate-500 text-sm">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-sm">© 2025 EduForge LMS. Built for learners.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-surface-950 relative">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</span>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-400 mt-2">
              {isLogin ? "Sign in to continue your learning journey" : "Join thousands of CS learners today"}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-800/60 border border-slate-700">
            {['Login', 'Sign Up'].map((t, i) => (
              <button
                key={t}
                onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  (isLogin ? i === 0 : i === 1)
                    ? 'text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                style={(isLogin ? i === 0 : i === 1) ? {
                  background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
                } : {}}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-slide-up">
                <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                <input
                  name="name" type="text" value={form.name}
                  onChange={handleChange} placeholder="Your full name"
                  className="input-field"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-sm mb-2">Email Address</label>
              <input
                name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-slide-up">
                <label className="block text-slate-400 text-sm mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[['STUDENT', '🎓 Student'], ['TEACHER', '👨‍🏫 Teacher']].map(([val, label]) => (
                    <button
                      key={val} type="button"
                      onClick={() => setForm(p => ({ ...p, role: val }))}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        form.role === val
                          ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                          : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-1">
              {[
                ['Student', 'rahul@lms.com', 'student123'],
                ['Teacher', 'arjun@lms.com', 'teacher123'],
              ].map(([role, email, pass]) => (
                <button key={role} type="button"
                  onClick={() => setForm({ ...form, email, password: pass })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <span className="text-slate-500 text-xs">{role}: </span>
                  <span className="text-slate-300 text-xs font-mono">{email} / {pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
