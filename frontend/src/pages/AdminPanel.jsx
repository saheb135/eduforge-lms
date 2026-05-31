import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, courseAPI, materialAPI } from '../utils/api';
import { ToastContainer, useToast } from '../components/ui/Toast';
import {
  LayoutDashboard, Users, BookOpen, TrendingUp, DollarSign,
  Upload, Search, LogOut, GraduationCap, ChevronRight,
  Plus, Video, FileText, File, Trash2, BarChart3, Eye,
  ArrowUpRight, Activity
} from 'lucide-react';

function StatCard({ label, value, icon, trend, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center`}
          style={{ background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.2)` }}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
      <div className="text-slate-500 text-sm">{label}</div>
    </div>
  );
}

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Material upload form
  const [materialForm, setMaterialForm] = useState({
    courseId: '', title: '', type: 'VIDEO', sourceUrl: '', duration: ''
  });
  const [uploading, setUploading] = useState(false);

  // Create course form
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', subject: '', monthlyPrice: ''
  });
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, teacherRes, coursesRes] = await Promise.all([
          adminAPI.getStudents(),
          adminAPI.getTeacherStats(),
          user?.role === 'ADMIN' ? courseAPI.getAll() : courseAPI.getMyCourses(),
        ]);
        setStudents(studentsRes.data);
        setTeacherStats(teacherRes.data);
        setCourses(user?.role === 'ADMIN' ? coursesRes.data : teacherRes.data.courses);

        if (user?.role === 'ADMIN') {
          const statsRes = await adminAPI.getStats();
          setStats(statsRes.data);
        }
      } catch (err) {
        addToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.role]);

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await materialAPI.add({
        ...materialForm,
        duration: materialForm.duration ? parseInt(materialForm.duration) : undefined,
      });
      addToast('Material added successfully! ✅', 'success');
      setMaterialForm({ courseId: '', title: '', type: 'VIDEO', sourceUrl: '', duration: '' });
    } catch (err) {
      addToast(err.message || 'Failed to add material', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreatingCourse(true);
    try {
      await courseAPI.create(courseForm);
      addToast('Course created! 🎉', 'success');
      setCourseForm({ title: '', description: '', subject: '', monthlyPrice: '' });
      setShowCourseForm(false);
      const res = await courseAPI.getMyCourses();
      setCourses(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to create course', 'error');
    } finally {
      setCreatingCourse(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayStats = user?.role === 'ADMIN' ? stats : {
    totalStudents: teacherStats?.totalStudents || 0,
    activeEnrollments: teacherStats?.courses?.reduce((s, c) => s + c.enrollments.length, 0) || 0,
    totalRevenue: teacherStats?.totalRevenue || 0,
    totalCourses: teacherStats?.courses?.length || 0,
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'materials', label: 'Add Material', icon: <Upload className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 glass-dark border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>EduForge</span>
              <div className="text-xs text-sky-400 font-medium">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-amber-400 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`sidebar-link w-full ${activeTab === item.id ? 'active' : ''}`}>
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { logout(); navigate('/auth'); }}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-8 py-4 border-b border-slate-800 flex items-center justify-between"
          style={{ background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 text-sm">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          {showCourseForm && (
            <button onClick={() => setShowCourseForm(false)} className="text-slate-400 hover:text-white text-sm">
              Cancel
            </button>
          )}
          {activeTab === 'courses' && !showCourseForm && (
            <button onClick={() => setShowCourseForm(true)} className="btn-primary flex items-center gap-2 py-2 text-sm">
              <Plus className="w-4 h-4" /> New Course
            </button>
          )}
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && displayStats && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Students" value={displayStats.totalStudents}
                  icon={<Users className="w-6 h-6 text-sky-400" />} trend="+12%" color="14,165,233" />
                <StatCard label="Active Enrollments" value={displayStats.activeEnrollments}
                  icon={<Activity className="w-6 h-6 text-violet-400" />} trend="+8%" color="139,92,246" />
                <StatCard label="Total Revenue" value={`₹${(displayStats.totalRevenue || 0).toLocaleString()}`}
                  icon={<DollarSign className="w-6 h-6 text-emerald-400" />} trend="+23%" color="16,185,129" />
                <StatCard label="Total Courses" value={displayStats.totalCourses || courses.length}
                  icon={<BookOpen className="w-6 h-6 text-amber-400" />} color="245,158,11" />
              </div>

              {/* Course engagement table */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-sky-400" />
                  <h3 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Course Engagement</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Course', 'Instructor', 'Students', 'Price', 'Action'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(user?.role === 'ADMIN' ? (stats?.courseStats || []) : (teacherStats?.courses || [])).map((c) => (
                        <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 text-white font-medium text-sm">{c.title}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{c.instructor?.name || user?.name}</td>
                          <td className="px-6 py-4">
                            <span className="text-white font-semibold">{c._count?.enrollments || c.enrollments?.length || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-medium text-sm">₹{c.monthlyPrice}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => navigate(`/course/${c.id}`)}
                              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent enrollments */}
              {stats?.recentEnrollments && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Enrollments</h3>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {stats.recentEnrollments.map((e) => (
                      <div key={e.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                            {e.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{e.student?.name}</p>
                            <p className="text-slate-500 text-xs">{e.student?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-sm">{e.course?.title}</p>
                          <span className="badge text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-fade-in">
              {showCourseForm && (
                <div className="rounded-2xl p-6 mb-6" style={{ border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.05)' }}>
                  <h3 className="text-white font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Create New Course</h3>
                  <form onSubmit={handleCreateCourse} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Course Title</label>
                      <input value={courseForm.title} onChange={(e) => setCourseForm(p => ({ ...p, title: e.target.value }))}
                        className="input-field" placeholder="e.g. Advanced Python Programming" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Description</label>
                      <textarea value={courseForm.description} onChange={(e) => setCourseForm(p => ({ ...p, description: e.target.value }))}
                        className="input-field resize-none" rows={3} placeholder="Course description..." required />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Subject</label>
                      <select value={courseForm.subject} onChange={(e) => setCourseForm(p => ({ ...p, subject: e.target.value }))}
                        className="input-field" required>
                        <option value="">Select subject</option>
                        {['Data Structures', 'Web Development', 'Operating Systems', 'Machine Learning', 'Databases', 'Computer Networks', 'Software Engineering'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">Monthly Price (₹)</label>
                      <input type="number" value={courseForm.monthlyPrice} onChange={(e) => setCourseForm(p => ({ ...p, monthlyPrice: e.target.value }))}
                        className="input-field" placeholder="499" required min="1" />
                    </div>
                    <div className="col-span-2 flex gap-3">
                      <button type="submit" disabled={creatingCourse} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                        {creatingCourse ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Course
                      </button>
                      <button type="button" onClick={() => setShowCourseForm(false)}
                        className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-5 rounded-2xl glass"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(14,165,233,0.2)' }}>
                        <BookOpen className="w-6 h-6 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{c.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-slate-500 text-xs">{c.subject}</span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-emerald-400 text-xs font-medium">₹{c.monthlyPrice}/mo</span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-slate-500 text-xs">{c._count?.enrollments || c.enrollments?.length || 0} students</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/course/${c.id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-sky-500/50 hover:text-sky-300 transition-all text-sm">
                      <Eye className="w-4 h-4" /> View Course
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="max-w-xl animate-fade-in">
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Upload Material</h3>
                    <p className="text-slate-500 text-sm">Add content to your courses</p>
                  </div>
                </div>

                <form onSubmit={handleUploadMaterial} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Course</label>
                    <select value={materialForm.courseId} onChange={(e) => setMaterialForm(p => ({ ...p, courseId: e.target.value }))}
                      className="input-field" required>
                      <option value="">Select a course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Material Title</label>
                    <input value={materialForm.title} onChange={(e) => setMaterialForm(p => ({ ...p, title: e.target.value }))}
                      className="input-field" placeholder="e.g. Introduction to Recursion" required />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: 'VIDEO', label: 'Video', icon: <Video className="w-4 h-4" /> },
                        { val: 'PDF', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
                        { val: 'DOCUMENT', label: 'Document', icon: <File className="w-4 h-4" /> },
                      ].map(({ val, label, icon }) => (
                        <button key={val} type="button" onClick={() => setMaterialForm(p => ({ ...p, type: val }))}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                            materialForm.type === val
                              ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                              : 'border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">
                      Source URL {materialForm.type === 'VIDEO' ? '(YouTube embed or video URL)' : '(PDF/Doc link)'}
                    </label>
                    <input value={materialForm.sourceUrl} onChange={(e) => setMaterialForm(p => ({ ...p, sourceUrl: e.target.value }))}
                      className="input-field" placeholder="https://..." type="url" required />
                  </div>

                  {materialForm.type === 'VIDEO' && (
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wider">Duration (minutes)</label>
                      <input value={materialForm.duration} onChange={(e) => setMaterialForm(p => ({ ...p, duration: e.target.value }))}
                        className="input-field" placeholder="e.g. 45" type="number" min="1" />
                    </div>
                  )}

                  <button type="submit" disabled={uploading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60">
                    {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Adding...' : 'Add Material'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="input-field pl-11 text-sm"
                />
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-white font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Student Progress Tracker
                  </h3>
                  <span className="text-slate-500 text-sm">{filteredStudents.length} students</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Student', 'XP / Streak', 'Enrolled Courses', 'Progress', 'Joined'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const activeEnrollments = s.enrollments?.filter((e) => e.paymentStatus === 'ACTIVE') || [];
                        const avgProgress = s.attendance?.length
                          ? Math.round(s.attendance.reduce((sum, a) => sum + a.progressPercentage, 0) / s.attendance.length)
                          : 0;
                        return (
                          <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{s.name}</p>
                                  <p className="text-slate-500 text-xs">{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white text-sm font-semibold">{s.xpPoints} XP</div>
                              <div className="text-amber-400 text-xs">🔥 {s.streak} day streak</div>
                            </td>
                            <td className="px-6 py-4">
                              {activeEnrollments.length > 0 ? (
                                <div className="space-y-1">
                                  {activeEnrollments.slice(0, 2).map((e) => (
                                    <span key={e.courseId} className="badge text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 block w-fit">
                                      {e.course?.title?.split(' ').slice(0, 3).join(' ')}...
                                    </span>
                                  ))}
                                  {activeEnrollments.length > 2 && (
                                    <span className="text-slate-500 text-xs">+{activeEnrollments.length - 2} more</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-sm">No courses</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-slate-500">Avg</span>
                                  <span className="text-white">{avgProgress}%</span>
                                </div>
                                <div className="progress-bar">
                                  <div className="progress-fill" style={{ width: `${avgProgress}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="py-12 text-center">
                      <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500">No students found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
