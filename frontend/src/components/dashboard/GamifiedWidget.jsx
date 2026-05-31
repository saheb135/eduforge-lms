import { Zap, Trophy, Flame, Star, TrendingUp } from 'lucide-react';

const getLevelInfo = (xp) => {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const titles = ['Beginner', 'Explorer', 'Learner', 'Scholar', 'Expert', 'Master', 'Legend'];
  return { level, progress, title: titles[Math.min(level - 1, titles.length - 1)] };
};

export default function GamifiedWidget({ user, attendanceData }) {
  const { level, progress, title } = getLevelInfo(user?.xpPoints || 0);
  const streak = user?.streak || 0;
  const xp = user?.xpPoints || 0;

  const totalCourses = attendanceData?.length || 0;
  const avgProgress = attendanceData?.length
    ? Math.round(attendanceData.reduce((s, a) => s + a.progressPercentage, 0) / attendanceData.length)
    : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(16,185,129,0.1) 100%)',
        border: '1px solid rgba(14,165,233,0.2)'
      }}>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', transform: 'translate(30%, -30%)' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="badge" style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}>
                <Trophy className="w-3 h-3" /> {title}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Hey, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">Keep up the momentum — you're doing great!</p>
          </div>

          {/* Streak badge */}
          <div className="flex flex-col items-center p-4 rounded-2xl text-center"
            style={{ background: streak >= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', border: streak >= 3 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(100,116,139,0.3)' }}>
            <Flame className={`w-8 h-8 ${streak >= 3 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className={`text-2xl font-bold ${streak >= 3 ? 'text-amber-400' : 'text-slate-400'}`}
              style={{ fontFamily: 'Syne, sans-serif' }}>{streak}</span>
            <span className="text-xs text-slate-500">day streak</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'XP Points', value: xp.toLocaleString(), icon: <Zap className="w-4 h-4" />, color: 'text-sky-400' },
            { label: 'Active Courses', value: totalCourses, icon: <Star className="w-4 h-4" />, color: 'text-violet-400' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className={`flex items-center gap-1.5 mb-1 ${stat.color}`}>
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* XP Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Level {level} Progress</span>
            <span className="text-sm font-semibold text-white">{progress}/100 XP</span>
          </div>
          <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #10b981)'
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600">Lv. {level}</span>
            <span className="text-xs text-slate-600">Lv. {level + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
