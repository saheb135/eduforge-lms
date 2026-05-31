import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, enrollmentAPI, attendanceAPI } from '../utils/api';
import Sidebar from '../components/ui/Sidebar';
import GamifiedWidget from '../components/dashboard/GamifiedWidget';
import CourseCard from '../components/course/CourseCard';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { Search, SlidersHorizontal, BookOpen, TrendingUp, Bell, Grid, List } from 'lucide-react';

const SUBJECTS = ['All', 'Data Structures', 'Web Development', 'Operating Systems', 'Machine Learning', 'Databases'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [tab, setTab] = useState('all'); // all | enrolled
  const [viewMode, setViewMode] = useState('grid');

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, enrollRes, attendRes] = await Promise.all([
        courseAPI.getAll(),
        enrollmentAPI.getMyEnrollments(),
        attendanceAPI.getAll(),
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollRes.data);
      setAttendanceData(attendRes.data);
    } catch (err) {
      addToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEnrollment = (courseId) => enrollments.find((e) => e.courseId === courseId);
  const getAttendance = (courseId) => attendanceData.find((a) => a.courseId === courseId);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = activeSubject === 'All' || c.subject === activeSubject;
    const matchesTab =
      tab === 'all' || (tab === 'enrolled' && getEnrollment(c.id)?.paymentStatus === 'ACTIVE');
    return matchesSearch && matchesSubject && matchesTab;
  });

  const enrolledCount = enrollments.filter((e) => e.paymentStatus === 'ACTIVE').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <Sidebar activePage="/dashboard" />

      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-8 py-4 border-b border-slate-800 flex items-center justify-between"
          style={{ background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Course Marketplace
            </h1>
            <p className="text-slate-500 text-sm">{courses.length} courses available</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Gamified Widget */}
          <GamifiedWidget user={user} attendanceData={attendanceData} />

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Enrolled Courses', value: enrolledCount, icon: <BookOpen className="w-5 h-5 text-sky-400" />, color: 'sky' },
              { label: 'Lessons Completed', value: attendanceData.reduce((s, a) => s + a.lecturesAttended, 0), icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, color: 'emerald' },
              { label: 'Available Courses', value: courses.length, icon: <Grid className="w-5 h-5 text-violet-400" />, color: 'violet' },
            ].map((s) => (
              <div key={s.label} className="stat-card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${s.color}-500/10 border border-${s.color}-500/20`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Tab + Search row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-slate-800/60 border border-slate-700 w-fit">
                {[['all', 'All Courses'], ['enrolled', `My Courses (${enrolledCount})`]].map(([val, label]) => (
                  <button key={val} onClick={() => setTab(val)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      tab === val ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                    }`}
                    style={tab === val ? { background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' } : {}}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text" placeholder="Search courses, subjects, instructors..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-11 text-sm"
                />
              </div>

              {/* View toggle */}
              <div className="flex p-1 rounded-xl bg-slate-800/60 border border-slate-700 ml-auto">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subject filters */}
            <div className="flex gap-2 flex-wrap">
              {SUBJECTS.map((s) => (
                <button key={s} onClick={() => setActiveSubject(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    activeSubject === s
                      ? 'text-white border-sky-500/50 bg-sky-500/20'
                      : 'text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">No courses found</p>
              <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredCourses.map((course) => {
                const enrollment = getEnrollment(course.id);
                const attendance = getAttendance(course.id);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrollment={enrollment ? { ...enrollment, attendance } : null}
                    onEnrollSuccess={() => {
                      addToast(`Enrolled in ${course.title}! 🎉`, 'success');
                      fetchData();
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
