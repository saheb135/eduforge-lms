import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, BookOpen, LayoutDashboard, LogOut,
  Zap, Trophy, User, ChevronRight
} from 'lucide-react';

const studentLinks = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
];

function XPBar({ xp, streak }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);
  return (
    <div className="px-4 py-4 border-t border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">Level {level}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-orange-400 font-bold">{streak} day streak</span>
        </div>
      </div>
      <div className="progress-bar mb-1">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-slate-500">{xp} XP</span>
        <span className="text-xs text-slate-500">{level * 100} XP</span>
      </div>
    </div>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="w-64 flex-shrink-0 h-full glass-dark border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</span>
            <div className="text-xs text-slate-500">Learning Platform</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 mb-3">Navigation</p>
        {studentLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`sidebar-link w-full ${activePage === link.path ? 'active' : ''}`}
          >
            {link.icon}
            <span className="text-sm font-medium">{link.label}</span>
            {activePage === link.path && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>
        ))}

        <button onClick={() => navigate('/dashboard')}
          className="sidebar-link w-full mt-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">My Courses</span>
        </button>
      </nav>

      {/* XP Bar for students */}
      {user?.role === 'STUDENT' && (
        <XPBar xp={user.xpPoints || 0} streak={user.streak || 0} />
      )}

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
