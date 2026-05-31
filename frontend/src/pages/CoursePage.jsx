import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, materialAPI, attendanceAPI } from '../utils/api';
import { ToastContainer, useToast } from '../components/ui/Toast';
import {
  ArrowLeft, Play, FileText, File, Video, BookOpen,
  Radio, CheckCircle, Lock, Zap, Users, Clock, ChevronRight,
  Wifi, WifiOff, Award
} from 'lucide-react';

const typeIcon = {
  VIDEO: <Video className="w-4 h-4 text-sky-400" />,
  PDF: <FileText className="w-4 h-4 text-rose-400" />,
  DOCUMENT: <File className="w-4 h-4 text-amber-400" />,
};

function MaterialViewer({ material, onComplete }) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    if (completed) return;
    await onComplete(material.id);
    setCompleted(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{material.title}</h2>
          <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm">
            <span className="capitalize">{material.type.toLowerCase()}</span>
            {material.duration && <span>• {material.duration} min</span>}
          </div>
        </div>
        <button onClick={handleComplete} disabled={completed}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            completed
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'btn-primary'
          }`}>
          {completed ? <><CheckCircle className="w-4 h-4" /> Completed</> : <><Zap className="w-4 h-4" /> Mark Complete (+10 XP)</>}
        </button>
      </div>

      {/* Content area */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        {material.type === 'VIDEO' ? (
          <div className="aspect-video bg-black">
            {material.sourceUrl.includes('youtube.com') || material.sourceUrl.includes('youtu.be') ? (
              <iframe
                src={material.sourceUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={material.title}
              />
            ) : (
              <video src={material.sourceUrl} controls className="w-full h-full" />
            )}
          </div>
        ) : material.type === 'PDF' ? (
          <div className="p-8 text-center bg-slate-800/40">
            <FileText className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">{material.title}</p>
            <p className="text-slate-400 text-sm mb-6">PDF document ready to view</p>
            <a href={material.sourceUrl} target="_blank" rel="noreferrer"
              className="btn-primary inline-flex items-center gap-2">
              <FileText className="w-4 h-4" /> Open PDF
            </a>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-800/40">
            <File className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">{material.title}</p>
            <p className="text-slate-400 text-sm mb-6">External document or reference</p>
            <a href={material.sourceUrl} target="_blank" rel="noreferrer"
              className="btn-primary inline-flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Open Document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveSession({ courseId, attendance, onJoin }) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await onJoin();
      setJoined(true);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live session card */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(14,165,233,0.25)' }}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm font-semibold">LIVE</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.3)' }}>
            <Radio className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Weekly Live Class
            </h3>
            <p className="text-slate-400 text-sm">Interactive Q&A session with instructor</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Duration', value: '90 min', icon: <Clock className="w-4 h-4" /> },
            { label: 'Attendees', value: '24 online', icon: <Users className="w-4 h-4" /> },
            { label: 'XP Reward', value: '+20 XP', icon: <Zap className="w-4 h-4" /> },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-sky-400 flex justify-center mb-1">{s.icon}</div>
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {!joined ? (
          <button onClick={handleJoin} disabled={joining}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base disabled:opacity-60">
            {joining ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Wifi className="w-5 h-5" />
                Join Live Session
              </>
            )}
          </button>
        ) : (
          <div className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-400 font-semibold">Attendance Recorded! +20 XP</p>
            <p className="text-slate-400 text-sm mt-1">You've successfully joined the live session</p>
          </div>
        )}
      </div>

      {/* Attendance overview */}
      {attendance && (
        <div className="rounded-2xl p-6 glass" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your Attendance
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Sessions attended</span>
            <span className="text-white font-semibold">
              {attendance.lecturesAttended} / {attendance.totalLectures}
            </span>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{ width: `${attendance.progressPercentage}%` }} />
          </div>
          <p className="text-slate-500 text-xs">{Math.round(attendance.progressPercentage)}% complete</p>
        </div>
      )}
    </div>
  );
}

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserXP } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('materials');
  const [activeMaterial, setActiveMaterial] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, attRes] = await Promise.all([
          courseAPI.getById(id),
          attendanceAPI.getByCourse(id),
        ]);
        setCourse(courseRes.data);
        setMaterials(courseRes.data.materials || []);
        setAttendance(attRes.data);
        if (courseRes.data.materials?.length) {
          setActiveMaterial(courseRes.data.materials[0]);
        }
      } catch {
        addToast('Failed to load course', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleCompleteMaterial = async (materialId) => {
    try {
      const res = await attendanceAPI.completeMaterial(id, materialId);
      setAttendance(res.data);
      updateUserXP(10);
      addToast('Progress updated! +10 XP 🎉', 'success');
    } catch {
      addToast('Failed to update progress', 'error');
    }
  };

  const handleJoinSession = async () => {
    const res = await attendanceAPI.joinSession(id);
    setAttendance(res.data);
    updateUserXP(20);
    addToast('Attendance recorded! +20 XP 🔥', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = course.isEnrolled || user?.role !== 'STUDENT';

  const sidebarSections = [
    { id: 'materials', label: 'Study Materials', icon: <BookOpen className="w-4 h-4" />, count: materials.length },
    { id: 'live', label: 'Live Classes', icon: <Radio className="w-4 h-4" />, badge: 'LIVE' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 px-6 py-4 border-b border-slate-800 flex items-center gap-4"
        style={{ background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{course.title}</h1>
          <p className="text-slate-500 text-xs">{course.subject} • {course.instructor?.name}</p>
        </div>
        {attendance && (
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white font-medium">{Math.round(attendance.progressPercentage)}% complete</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-slate-800 overflow-y-auto p-4 space-y-2">
          {/* Section nav */}
          {sidebarSections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`sidebar-link w-full ${activeSection === s.id ? 'active' : ''}`}>
              {s.icon}
              <span className="text-sm font-medium flex-1 text-left">{s.label}</span>
              {s.count !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{s.count}</span>
              )}
              {s.badge && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  {s.badge}
                </span>
              )}
            </button>
          ))}

          {/* Materials list */}
          {activeSection === 'materials' && materials.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-2 mb-2">Lessons</p>
              {materials.map((m, i) => (
                <button key={m.id} onClick={() => { setActiveMaterial(m); setActiveSection('viewer'); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left ${
                    activeMaterial?.id === m.id && activeSection === 'viewer'
                      ? 'bg-sky-500/10 border border-sky-500/20 text-white'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-slate-700 text-slate-300 flex-shrink-0">
                    {i + 1}
                  </span>
                  {typeIcon[m.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    {m.duration && <p className="text-xs text-slate-600">{m.duration} min</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!isEnrolled ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                <Lock className="w-10 h-10 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                Course Locked
              </h2>
              <p className="text-slate-400 max-w-sm mb-6">
                Purchase a subscription to unlock all course materials, live sessions, and XP rewards.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Go to Marketplace
              </button>
            </div>
          ) : activeSection === 'live' ? (
            <LiveSession courseId={id} attendance={attendance} onJoin={handleJoinSession} />
          ) : activeSection === 'viewer' && activeMaterial ? (
            <MaterialViewer material={activeMaterial} onComplete={handleCompleteMaterial} />
          ) : (
            /* Materials overview */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Study Materials
                </h2>
                <p className="text-slate-400">Click any lesson to start learning</p>
              </div>

              {attendance && (
                <div className="p-5 rounded-2xl"
                  style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 text-sm">Course Progress</span>
                    <span className="text-white font-semibold">{Math.round(attendance.progressPercentage)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${attendance.progressPercentage}%` }} />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {attendance.lecturesAttended} of {attendance.totalLectures} lessons completed
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                {materials.map((m, i) => (
                  <button key={m.id}
                    onClick={() => { setActiveMaterial(m); setActiveSection('viewer'); }}
                    className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 card-hover group"
                    style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:text-white transition-colors bg-slate-700/50">
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: m.type === 'VIDEO' ? 'rgba(14,165,233,0.15)' : m.type === 'PDF' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)' }}>
                      {typeIcon[m.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium group-hover:text-sky-300 transition-colors">{m.title}</p>
                      <p className="text-slate-500 text-xs capitalize">{m.type.toLowerCase()} {m.duration ? `• ${m.duration} min` : ''}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
